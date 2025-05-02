####################################################################################################

"""This module implements a JS/Vue source code explorer.

It features
- A tool to explore imports in the source code and match them with `package.json` dependencies.
- A tool to upgrade `@mdi/font` package aka MDI aka Material Design Icons:
  lookup for mdi icons in the source code and check for upgrade using the changelog.
"""

# Note: client/server split implied some changes

####################################################################################################

# from pprint import pprint
from typing import Callable, Iterator
from pathlib import Path
from dataclasses import dataclass
import json
import os

from invoke import task

from .lib.helper import printc, escape
from .lib.node import NODE_LIBS, PackageJson, YarnLock, NodeModules
import build

####################################################################################################

SOURCE_PATH = Path(__file__).parents[1]
# NODE_MODULES_PATH = SOURCE_PATH.joinpath('node_modules')

####################################################################################################

def wikijs_directory_filter(root: Path, dirs: list[str]) -> None:
    if root.parent == SOURCE_PATH and root.name in ('wikijs-client', 'wikijs-server'):
        for _ in list(dirs):
            if _ not in ('server', 'client'):
                dirs.remove(_)

####################################################################################################

def yield_source_files(
        source_path: Path,
        suffixes: list[str] = ('.js', '.vue'),
        directory_filter: Callable = wikijs_directory_filter,
) -> Iterator[Path]:
    source_path = Path(source_path).absolute()
    for root, dirs, filenames in source_path.walk():
        dirs.sort()
        # don't walk in other sub-directories
        directory_filter(root, dirs)
        for _ in filenames:
            path = Path(root) / _
            if suffixes is None or path.suffix in suffixes:
                yield path

####################################################################################################

def yield_wikijs_source_files(**kwargs) -> Iterator[Path]:
    # for dir in ('wikijs-client/client', 'wikijs-server/server'):
    for dir in ('client', 'server'):
        yield from yield_source_files(SOURCE_PATH.joinpath(dir), **kwargs)

####################################################################################################

def yield_imports(source_path: Path) -> Iterator[tuple[Path, Path, str]]:
    for path in yield_source_files(source_path):
        yield from yield_file_imports(source_path, path)


def yield_wikijs_imports() -> Iterator[tuple[Path, Path, str]]:
    for path in yield_wikijs_source_files():
        yield from yield_file_imports(SOURCE_PATH, path)

####################################################################################################

def yield_file_imports(source_path: Path, path: Path) -> Iterator[tuple[Path, Path, str]]:
    # print(path)
    # local_dirs = [_.name for _ in path.parent.iterdir() if _.is_dir()]
    # if dirs:
    #     print(dirs)
    with open(path, 'r', encoding='utf8') as fh:
        for line in fh:
            line = line.strip()
            # = oline
            # strip comment
            _ = line.rfind('//')
            if _ != -1:
                line = line[:_].rstrip()
            module = None
            if line.startswith('import '):
                if 'from' in line:
                    # import ... from module
                    _ = line.find('from ')
                    if _ == -1:
                        raise ValueError(line)
                    module = line[_+5:]
                else:
                    # import module
                    _ = line.find(' ')
                    if _ == -1:
                        raise ValueError(line)
                    module = line[_+1:].strip()
            else:
                # Node.js import
                _ = line.find('require(')
                if _ != -1:
                    module = line[_+8:]
                    # _ = module.find(')')
                    # if _ == -1:
                    #     raise ValueError(line)
                    level = 1
                    for i, c in enumerate(module):
                        match c:
                            case '(':
                                level += 1
                            case ')':
                                level -= 1
                        if not level:
                            break
                    module = module[:i]
            if module is not None:
                if module.startswith("'"):
                    module = module[1:-1]
                else:
                    module = module
                # print(oline)
                # print(f'  {module}')
                module = Path(module)
                type_ = 'external'
                first = module.parts[0]
                # print(first)
                if first in ('.', '..') or module.suffix in ('.vue',):
                    module = path.parent.joinpath(module).resolve().relative_to(source_path)
                    type_ = 'internal'
                elif first in ('gql',):
                    module = source_path.joinpath('client', 'graph').joinpath(module).relative_to(source_path)
                    type_ = 'internal'
                # if first in local_dirs or first in ('gql',):
                #     module = source_path.joinpath('client', 'graph').joinpath(module).relative_to(source_path)
                #     type_ = 'internal'
                else:
                    def check_exists(suffix: str = '') -> bool:
                        nonlocal module
                        nonlocal type_
                        _ = str(module)
                        if suffix and not _.endswith(suffix):
                            _ += '.js'
                        _ = path.parent.joinpath(_)
                        if _.exists():
                            module = _.relative_to(source_path)
                            type_ = 'internal'
                    if not check_exists('.js'):
                        check_exists()
                    # Fixme: client/libs/modernizr/modernizr.js
                    # else server/modules/logging
                module_ = str(module)
                if '{' in module_ or '(' in module_:
                    type_ = 'complex'
                    # print(path)
                    # print(' '*4 + oline)
                    # print(' '*4 + module_)
                yield (path.relative_to(source_path), module, type_)

####################################################################################################

@task
def dump_imports(ctx, source_path, json_file: str = 'imports.json') -> None:
    source_path = Path(source_path).absolute()
    complex_imports = {}
    external_imports = {}
    internal_imports = {}
    for path, module, type_ in yield_imports(source_path):
        # print(f'{path}  ->  {module}   {is_external}')
        module_ = str(module)
        match type_:
            case 'complex':
                imports = complex_imports
            case 'external':
                imports = external_imports
            case 'internal':
                imports = internal_imports
        imports.setdefault(module_, set())
        imports[module_].add(str(path))

    # def print_imports(imports: dict) -> None:
    #     for module in sorted(imports.keys()):
    #         print(module)
    #         for _ in imports[module]:
    #             print(' '*4 + _)
    # print_imports(imports)

    def custom_json(obj):
        if isinstance(obj, set):
            return sorted(obj)
        raise TypeError(f'Cannot serialize object of {type(obj)}')

    imports = {
        'complex': complex_imports,
        'external': external_imports,
        'internal': internal_imports,
    }
    if json_file is not None:
        printc(f'<red>Write {json_file}</red>')
        Path(json_file).write_text(
            json.dumps(
                imports,
                default=custom_json,
                sort_keys=True,
                indent=4,
            )

        )
    return imports

####################################################################################################

@task(build.symlink_dev)
def explore_dependencies(ctx, source_path):
    source_path = Path(source_path).absolute()
    node_modules_path = source_path.joinpath('node_modules')

    # imports_json_file = Path('imports.json')
    imports_json_file = None
    imports = dump_imports(ctx, source_path, imports_json_file)
    # imports = json.loads(imports_json_file.read_text())

    package_json_file = source_path.joinpath('package.json')
    package_json = PackageJson(package_json_file)
    dependencies = package_json.dependencies
    #dev_dependencies = package_json.dev_dependencies
    all_dependencies = package_json.all_dependencies

    # node_modules = [_.name for _ in node_modules_path.iterdir()]

    external_imports = imports['external']
    print()

    def check_dependencies(type_: str, dependencies: dict) -> None:
        printc(f'<blue>{type_}Dependency not imported:</blue>')
        for dependency in sorted(dependencies):
            if dependency not in external_imports:
                print(' '*2 + dependency)

    check_dependencies('', dependencies)
    # check_dependencies('dev', dev_dependencies)

    print()
    printc('<blue>Import not found:</blue>')
    external_imports_keys = sorted(external_imports.keys())
    for dependency in external_imports_keys:
        files = external_imports[dependency]
        # files.sort()
        if dependency not in NODE_LIBS and not node_modules_path.joinpath(dependency).exists():
            printc(' '*2 + f'<green>{dependency}</green>')
            for _ in sorted(files):
                print(' '*6 + _)

    print()
    printc('<blue>Packages:</blue>')
    for dependency in external_imports_keys:
        files = external_imports[dependency]
        if dependency not in NODE_LIBS and node_modules_path.joinpath(dependency).exists():
            printc(' '*2 + f'<green>{dependency}</green>')
            for _ in sorted(files):
                print(' '*6 + _)

    print()
    printc('<blue>Packages:</blue>')
    map = {
        'server': [],
        'client': [],
    }
    for dependency, files in external_imports.items():
        if dependency not in NODE_LIBS and node_modules_path.joinpath(dependency).exists():
            for _ in set([Path(_).parts[0] for _ in files]):
                map[_].append(dependency)

    def find_depency(_):
        type_ = ''
        version = '???'
        if _ in all_dependencies:
            dependency = all_dependencies[_]
            version = dependency.version
            if dependency.is_dev:
                type_ = 'dev'
        return type_, version

    for key, values in map.items():
        print()
        printc(f'<green>{key}</green>')
        lines = []
        dev_lines = []
        for package in sorted(values):
            type_, version = find_depency(package)
            if version == '???':
                type_, version = find_depency(Path(package).parts[0])
            line = f'"{package}": "<blue>{version}</blue>";'
            if type_:
                _ = dev_lines
            else:
                _ = lines
            _.append(line)

        def print_lines(lines):
            for _ in lines:
                printc(' '*2 + _)

        print_lines(lines)
        printc('<red>dev</red>')
        print_lines(dev_lines)

####################################################################################################

@task
def lookup_mdi(ctx):
    """Check MDI Icons"""
    icon_names = set()
    for path in yield_wikijs_source_files(suffixes=('.vue',)):
        with open(path, 'r', encoding='utf8') as fh:
            for line in fh:
                line = line.strip()
                # strip comment
                _ = line.rfind('//')
                if _ != -1:
                    line = line[:_].rstrip()
                MDI = 'mdi-'
                _ = line.find(MDI)
                if _ != -1:
                    # print(line)
                    left = line[_+4:]
                    name = MDI
                    complex = False
                    for c in left:
                        if c == '{':
                            complex = True
                        elif complex:
                            if c == '}':
                                break
                        else:
                            if c in (' \'"]'):
                                break
                        name += c
                    name = name[len(MDI):]
                    icon_names.add(name)

    from .lib.mdi import MDI_CHANGES
    # pprint(MDI_CHANGES)
    print('To be fixed:')
    for _ in sorted(icon_names):
        # print(_)
        if _ in MDI_CHANGES:
            print(f'  {_} {MDI_CHANGES[_]}')
        elif '{' in _:
            print(f'  ??? {_}')

####################################################################################################

@task
def dump_file_tree(ctx) -> None:
    # ['.asar', '.css', '.gql', '.graphql', '.html', '.ico', '.jpg', '.js', '.json', '.md',
    #  '.png', '.pug', '.scss', '.svg', '.vue', '.woff', '.woff2', '.xml', '.yml']
    suffixes = set()
    # Fixme: update
    for dir in ('client', 'server'):
        for root, dirs, filenames in SOURCE_PATH.joinpath(dir).walk():
            dirs.sort()
            root = root.relative_to(SOURCE_PATH)
            INDENT = ' '*4
            indentation = INDENT*(len(root.parts)-1)
            print(indentation + root.name)
            for _ in sorted(filenames):
                suffix = Path(_).suffix
                suffixes.add(suffix)
                if suffix in ('.js', '.vue'):
                    print(indentation + INDENT + _)
    print(sorted(suffixes))

####################################################################################################

def read_package_json(source_path) -> PackageJson:
    package_json_file = source_path.joinpath('package.json')
    return PackageJson(package_json_file)

@task
def dump_package_json(ctx, source_path) -> None:
    printc('<cyan>Package.json</cyan>')
    source_path = Path(source_path)
    package_json = read_package_json(source_path)
    for _ in package_json.all_dependencies.values():
        print(_)

@task
def dump_yarn_lock(ctx, source_path) -> None:
    printc('<cyan>Yarn Lock</cyan>')
    source_path = Path(source_path)
    package_json = read_package_json(source_path)
    yarn_lock_file = source_path.joinpath('yarn.lock')
    yarn_lock = YarnLock(yarn_lock_file, package_json)
    for i, _ in enumerate(yarn_lock.dependencies.values()):
        print(f'{i+1:4}', str(_))

####################################################################################################

@task
def scan_node_modules(ctx, source_path) -> None:
    # NODE_MODULES_PATH
    # node_modules =
    NodeModules(source_path)

####################################################################################################

def js_tokenizer(line: str) -> list[str]:
    tokens = []
    identifier = None
    identifier_start = None
    in_string = False

    def append_token():
        nonlocal tokens
        nonlocal identifier
        nonlocal identifier_start
        nonlocal in_string
        if identifier is not None:
            # if identifier not in ('const',):
            tokens.append((identifier_start, in_string, identifier))
        identifier = None
        identifier_start = None
        in_string = False

    for i, c in enumerate(line):
        if c in "'`":
            if in_string:
                # end
                in_string = False
                identifier += c
            else:
                # start
                in_string = True
                identifier = c
                identifier_start = i
        elif in_string:
            identifier += c
        elif c.isalnum() or c in '_':
            if identifier is None:
                # start identifier
                identifier = c
                identifier_start = i
            else:
                identifier += c
        else:
            append_token()
            # if c not in ' =':
            tokens.append(c)
    append_token()
    return tokens


@dataclass
class LineMatch:
    file: str
    line_number: int
    line: str
    patterns: list[str]

    ##############################################

    def to_str(self, show_line: bool = True) -> str:
        _ = self.file.relative_to(SOURCE_PATH)
        path = f'<green>{_.parent}</green>/<blue>{_.name}</blue>'
        pattern, pattern2 = self.patterns
        line = escape(self.line)
        line = line.replace(pattern, '<red>' + pattern + '</red>')
        if pattern2 is not None:
            line = line.replace(pattern2, '<blue>' + pattern2 + '</blue>')
        # return f'{path} <red>{self.line_number}</red> {line}'
        # return f'{path} <red>{self.line_number}</red>{os.linesep}  {line}'
        sep = '-'*25 + ' '
        if show_line:
            _ = line
        else:
            _ = ''
        return _ + f'{os.linesep}{sep}{path} <red>{self.line_number}</red>'


@task(optional=['pattern2'])
def ag(ctx, source_path: str, pattern: str, pattern2: str = None) -> None:
    patterns = (pattern, pattern2)
    matches = []
    for file in yield_source_files(source_path):
        # for line in file:   # return also a list ???
        lines = file.read_text().splitlines()
        in_comment = False
        for line_number, line in enumerate(lines):
            # oline = line
            if in_comment:
                i = line.rfind('*/')
                if i != -1:
                    line = line[i+2:]
                    in_comment = False
                else:
                    line = ''
            else:
                i = line.find('/*')
                j = line.rfind('*/')
                if i != -1:
                    if j != -1:
                        line = line[:i] + line[j+2:]
                        in_comment = False
                    else:
                        line = line[:i]
                        in_comment = True
            if not in_comment:
                i = line.find('//')   # ??? index() / raise ValueError
                if i != -1:
                    line = line[:i]
            # else:
            #     print(oline)
            #     print('>>>', line)
            line = line.strip()
            if pattern in line:
                if pattern2 is not None and pattern2 not in line:
                    continue
                # tokens = js_tokenizer(line)
                _ = LineMatch(file, line_number, line, patterns)
                matches.append(_)
    # for _ in matches:
    prev = None
    for _ in sorted(matches, key=lambda _: _.line):
        printc(_.to_str(_.line != prev), escaped=True)
        prev = _.line
