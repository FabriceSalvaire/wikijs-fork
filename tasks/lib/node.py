####################################################################################################

from pathlib import Path
import json

from .helper import strc

####################################################################################################

NODE_LIBS = (
    'crypto',
    'fs',
    'http',
    'https',
    'os',
    'path',
    'stream',
    'url',
    'util',
    'zlib',
)

####################################################################################################

class Dependency:

    ##############################################

    def __init__(self, name: str, version: str, is_dev: bool = False) -> None:
        self.name = str(name)
        self.version = str(version)
        self.is_dev = bool(is_dev)
        self.dependencies = {}

    ##############################################

    def __str__(self) -> str:
        # version can have < and >
        withc = strc('<green>with</green>')
        is_dev = '<red>@dev</red> ' if self.is_dev else ''
        _ = strc(f"{is_dev}<blue>{self.name}</blue> ")
        if hasattr(self, 'lock_version'):
            _ = f"{_}{self.lock_version}   {withc} {self.version}"
            if self.indirect:
                return strc('<yellow>@indirect</yellow> ') + _
            else:
                return _
        else:
            return f"{_}{self.version}"

####################################################################################################

class PackageJson:

    ##############################################

    def __init__(self, path: Path | str) -> None:
        path = Path(path)
        data = json.loads(path.read_text())

        for _ in ('name', 'version'):
            setattr(self, _, data[_])

        def build_map(key: str, is_dev: bool) -> dict:
            if key not in data:
                return {}
            return {
                name: Dependency(name, version, is_dev)
                for name, version in data[key].items()
            }

        self.dependencies = build_map('dependencies', False)
        self.dev_dependencies = build_map('devDependencies', True)
        _ = dict()
        _.update(self.dependencies)
        _.update(self.dev_dependencies)
        self.all_dependencies = _

####################################################################################################

# chalk@^2.0.0, chalk@^2.0.1, chalk@^2.3.0, chalk@^2.4.0, chalk@^2.4.1, chalk@^2.4.2:

# "@algolia/cache-browser-local-storage@4.5.1":
#   version "4.5.1"
#   resolved "https://registry.yarnpkg.com/@algolia/cache-browser-local-storage/-/cache-browser-local-storage-4.5.1.tgz#bdf58c30795683fd48310c552c3a10f10fb26e2b"
#   integrity sha512-TAQHRHaCUAR0bNhUHG0CnO6FTx3EMPwZQrjPuNS6kHvCQ/H8dVD0sLsHyM8C7U4j33xPQCWi9TBnSx8cYXNmNw==
#   dependencies:
#     "@algolia/cache-common" "4.5.1"

# sub-dependencies are installed in node_modules/<package_name>/node_modules/<package_name>

class YarnLock:

    """Yarn Lock Parser"""

    ##############################################

    def __init__(self, path: Path | str, package_json: PackageJson) -> None:
        path = Path(path)
        self.dependencies = {}

        def split_name_version(text: str):
            if text.startswith('"'):
                text = text[1:-1]
            # name can start with @
            i = text.rfind('@')
            if i == -1:
                raise ValueError(text)
            name = text[:i]
            version = text[i+1:]
            return name, version

        dependencies = []
        for line in path.read_text().splitlines():
            line = line.rstrip()
            # print(line)
            if not line:
                dependencies = []
            elif line.startswith('#'):
                continue
            elif not line.startswith(' '):
                # Start a dependency
                if dependencies:
                    raise ValueError(line)
                line = line[:-1]   # remove trailing :
                if ',' in line:
                    parts = [split_name_version(_.strip()) for _ in line.split(',')]
                    name = parts[0][0]
                    versions = [_[1] for _ in parts]
                else:
                    name, version = split_name_version(line)
                    versions = [version]
                is_dev = name in package_json.dev_dependencies
                indirect = not (is_dev or name in package_json.dependencies)
                for version in versions:
                    # print(name, version, is_dev, indirect)
                    dependency = Dependency(name, version, is_dev)
                    dependency.indirect = indirect
                    self.dependencies[f'{name}@{version}'] = dependency
                    dependencies.append(dependency)
            else:
                line = line.strip()
                if line.startswith('version'):
                    version = line.split('"')[1]
                    for _ in dependencies:
                        _.lock_version = version
                    # if dependency.version != version:
                    #     raise ValueError(f"{dependency.name} {dependency.version} != {version}")
                elif line.startswith('resolved'):
                    for _ in dependencies:
                        _.resolved = line.split('"')[1]
                elif line.startswith('integrity'):
                    for _ in dependencies:
                        _.integrity = line.split(' ')[1]
                elif line.startswith('"'):
                    _ = line.split('"')
                    name = _[1]
                    version = _[3]
                    for _ in dependencies:
                        _.dependencies[name] = version
                # else 'dependencies:'

####################################################################################################

class NodeModules:

    """Class to scan node_modules"""

    ##############################################

    def __init__(self, path: Path | str) -> None:
        self.path = Path(path)
        self.walk()

    ##############################################

    def walk(self) -> None:
        for root, dirs, files in self.path.walk():
            root = Path(root)
            if root.name == 'node_modules':
                for _ in dirs:
                    if _ not in ('.bin'):
                        path = (root / _).relative_to(self.path)
                        _ = str(path).replace('/node_modules/', ' > ')
                        print(_)

            # for _ in dirs:
            #     if _ == 'node_modules':
            #         path = (root / _).relative_to(self.path)
            #         print(path)
