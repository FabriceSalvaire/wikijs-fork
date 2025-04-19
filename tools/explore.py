#! /usr/bin/env python3

####################################################################################################

from pprint import pprint
from typing import Iterator
from pathlib import Path
import json

####################################################################################################

def yield_source(root_source: Path) -> Iterator[Path]:
    for dir in ('client', 'server'):
        for root, dirs, filenames in root_source.joinpath(dir).walk():
            for _ in filenames:
                path = Path(root) / _
                if path.suffix in ('.js', '.vue'):
                    yield path

def yield_import(root_source: Path) -> Iterator[tuple[Path, Path, str]]:
    for path in yield_source(root_source):
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
                        module = path.parent.joinpath(module).resolve().relative_to(root_source)
                        type_ = 'internal'
                    if first in local_dirs or first in ('gql',):
                        module = root_source.joinpath('client', 'graph').joinpath(module).relative_to(root_source)
                        type_ = 'internal'
                    module_ = str(module)
                    if '{' in module_ or '(' in module_:
                        type_ = 'complex'
                        # print(path)
                        # print(' '*4 + oline)
                        # print(' '*4 + module_)
                    yield (path.relative_to(root_source), module, type_)

####################################################################################################

root_source = Path(__file__).parents[1]
# print(f"Root Source: {root_source}")

complex_imports = {}
external_imports = {}
internal_imports = {}
for path, module, type_ in yield_import(root_source):
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

def dump_imports(imports: dict) -> None:
    for module in sorted(imports.keys()):
        print(module)
        for _ in imports[module]:
            print(' '*4 + _)

# # pprint(imports)
# imports = internal_imports
# imports = external_imports
# imports = complex_imports
# dump_imports(imports)

def custom_json(obj):
    if isinstance(obj, set):
        return sorted(obj)
    raise TypeError(f'Cannot serialize object of {type(obj)}')

imports = {
    'complex': complex_imports,
    'external': external_imports,
    'internal': internal_imports,
}
JSON_FILE = 'imports.json'
with open(JSON_FILE, 'w', encoding='utf8') as fh:
    json.dump(
        imports,
        fh,
        default=custom_json,
        sort_keys=True,
        indent=4,
    )
