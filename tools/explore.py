#! /usr/bin/env python3

"""This module implements a JS/Vue source code explorer.

It features
- A tool to explore imports in the source code and match them with `package.json` dependencies.
- A tool to upgrade `@mdi/font` package aka MDI aka Material Design Icons:
  lookup for mdi icons in the source code and check for upgrade using the changelog.
"""

####################################################################################################

from pprint import pprint
from typing import Iterator
from pathlib import Path
import json

####################################################################################################

def yield_source(source_path: Path, suffixes: list[str] = ('.js', '.vue')) -> Iterator[Path]:
    for dir in ('client', 'server'):
        for root, dirs, filenames in source_path.joinpath(dir).walk():
            for _ in filenames:
                path = Path(root) / _
                if suffixes is None or path.suffix in suffixes:
                    yield path

####################################################################################################

def yield_import(source_path: Path) -> Iterator[tuple[Path, Path, str]]:
    for path in yield_source(source_path):
        # print(path)
        local_dirs = [_.name for _ in path.parent.iterdir() if _.is_dir()]
        # if dirs:
        #     print(dirs)
        with open(path, 'r', encoding='utf8') as fh:
            for line in fh:
                line = oline = line.strip()
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
                        # else server/modules/logging
                    module_ = str(module)
                    if '{' in module_ or '(' in module_:
                        type_ = 'complex'
                        # print(path)
                        # print(' '*4 + oline)
                        # print(' '*4 + module_)
                    yield (path.relative_to(source_path), module, type_)

####################################################################################################

def dump_imports(source_path: Path, json_file: Path) -> None:
    complex_imports = {}
    external_imports = {}
    internal_imports = {}
    for path, module, type_ in yield_import(source_path):
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
    json_file.write_text(
        json.dumps(
            imports,
            default=custom_json,
            sort_keys=True,
            indent=4,
        )
    )

####################################################################################################

def explore_dependencies(source_path: Path):
    imports_json_file = Path('imports.json')
    dump_imports(source_path, imports_json_file)
    imports = json.loads(imports_json_file.read_text())

    package_json_file = source_path.joinpath('package.json')
    package_json = json.loads(package_json_file.read_text())
    dependencies = package_json['dependencies']

    external_imports = imports['external']
    print('Dependency not imported:')
    for dependency in dependencies:
        if dependency not in external_imports:
            print(' '*2 + dependency)
    print()
    print('Import not found:')
    node_modules_path = source_path.joinpath('node_modules')
    # node_modules = [_.name for _ in node_modules_path.iterdir()]
    NODE_LIBS = (
        'crypto',
        'fs',
        'http',
        'https',
        'os',
        'path',
        'stream',
        'zlib',
    )
    for dependency, files in external_imports.items():
        if dependency not in NODE_LIBS and not node_modules_path.joinpath(dependency).exists():
            print(' '*2 + dependency)
            print(' '*6 + str(files))

####################################################################################################

def lookup_mdi(source_path: Path):
    """Check MDI Icons"""
    icon_names = set()
    for path in yield_source(source_path, ('.vue',)):
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

    from mdi import MDI_CHANGES
    # pprint(MDI_CHANGES)
    print('To be fixed:')
    for _ in sorted(icon_names):
        # print(_)
        if _ in MDI_CHANGES:
            print(f'  {_} {MDI_CHANGES[_]}')
        elif '{' in _:
            print(f'  ??? {_}')

####################################################################################################

def dump_file_tree(source_path: Path) -> None:
    # ['.asar', '.css', '.gql', '.graphql', '.html', '.ico', '.jpg', '.js', '.json', '.md',
    #  '.png', '.pug', '.scss', '.svg', '.vue', '.woff', '.woff2', '.xml', '.yml']
    suffixes = set()
    for dir in ('client', 'server'):
        for root, dirs, filenames in source_path.joinpath(dir).walk():
            dirs.sort()
            root = root.relative_to(source_path)
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


source_path = Path(__file__).parents[1]
# print(f"Root Source: {source_path}")

# explore_dependencies(source_path)
# lookup_mdi(source_path)
# dump_file_tree(source_path)
