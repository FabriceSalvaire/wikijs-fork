####################################################################################################

from pathlib import Path
import os

from .helper import printc, Fore

# https://github.com/cedricrupb/code_tokenize
# Tokenizer based on Tree Sitter library
import code_tokenize as ctok

####################################################################################################

LINESEP = os.linesep

PATCHES = {
    'module.exports = router': 'export { router }',
}

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

class RequireExpression:

    ##############################################

    def __init__(self, path: Path, oline: str) -> None:
        self.oline = oline
        self.nline = oline

        tokens = []
        quoted = ''
        for _ in ctok.tokenize(oline, lang='javascript', syntax_error='ignore'):
            _ = str(_)
            if _ == '`' and not quoted:
                quoted = _
            elif quoted:
                quoted += _
                if _ == '`':
                    tokens.append(quoted)
                    quoted = ''
            else:
                tokens.append(_)
        self.tokens = tokens

        # print(' | '.join([str(_) for _ in tokens]))
        try:
            if self.oline.startswith(' '):
                self.dynamic_require(tokens)
            else:
                self.static_require(tokens)
        except ValueError:
            _ = path.relative_to(Path.cwd())
            print()
            printc(f'<red>Fixme</red>: <blue>{_}</blue>{LINESEP}{oline}')
        except Exception as e:
            print(self.oline)
            print(e)
            raise

    ##############################################

    def match_delimiter(self, tokens: list[str], delimiters: str = '()') -> list[list[str], list[str]]:
        open_delimiter, close_delimiter = delimiters[:2]
        open = None
        close = None
        level = 0
        for i, _ in enumerate(tokens):
            # match _:
            #     case open_delimiter:
            #     case close_delimiter:
            if _ == open_delimiter:
                if level == 0:
                    open = i
                level += 1
            elif _ == close_delimiter:
                level -= 1
                if level == 0:
                    close = i
                    break
        return tokens[open+1:close], tokens[close+1:]

    ##############################################

    def fix_comma(self, parts: list[str]) -> list[str]:
        nparts = []
        for _ in parts:
            if _ == ',':
                _ += ' '
            nparts.append(_)
        return ''.join(nparts)

    ##############################################

    def quote(self, string: str) -> str:
        return f"'{string}'"

    def unquote(self, string: str) -> str:
        return string[1:-1]

    ##############################################

    def to_module_str(self, module: list[str]) -> str:
        if len(module) == 1:
            module = module.pop()
        else:
            module = self.fix_comma(module)
        if '.' in module:
            for c in "'`":
                suffix = ".js" + c
                if module.endswith(c) and not module.endswith(suffix):
                    module = module[:-1] + suffix
        return module

    ##############################################

    def static_require(self, tokens: list[str]) -> None:
        # self.oline.startswith(' ') or 
        if tokens[0] != 'const':
            raise ValueError

        tokens = tokens[1:]
        for i, _ in enumerate(tokens):
            if _ == '=':
                break
        left = tokens[:i]
        right = tokens[i+1:]
        if right[0] != 'require':
            raise ValueError
        # print(left, right)

        module, right = self.match_delimiter(right)
        module = self.to_module_str(module)
        # print(left, module, right)

        umodule = self.unquote(module)
        if umodule in NODE_LIBS:
            self.nline = f"import * as {umodule} from 'node:{umodule}'"
        elif module.startswith("'lodash"):
            _ = left[0]
            self.nline = f"import {_} from {module}"
        elif left[0] == '{':
            _ = '{ ' + self.fix_comma(left[1:-1]) + ' }'
            self.nline = f'import {_} from {module}'
        # elif len(left) == 1 and self.quote(left[0]) == module:
        #     self.nline = f'import {module}'
        # elif len(left) == 1:
        #     _ = left[0]
        #     self.nline = f"import * as {_} from {module}"
        elif len(left) == 1:
            _ = left[0]
            self.nline = f"import {_} from {module}"
        else:
            raise NameError(self.oline)

        if right:
            right_str = self.fix_comma(right)
            if right_str[1:] == left[0]:
                self.nline = self.nline.replace('* as ', '')
            elif len(right) == 2 and right[0] == '.':
                self.nline = self.nline.replace('*', right[1])
            else:
                self.nline += f'   // Fixme!: {right_str}' 
                raise ValueError

    ##############################################

    def dynamic_require(self, tokens: list[str]) -> None:
        i = self.oline.find('require')
        left = self.oline[:i].rstrip()
        for i, _ in enumerate(tokens):
            if _ == 'require':
                break
        right = tokens[i+1:]

        module, right = self.match_delimiter(right)
        module = self.to_module_str(module)
        # print(left, module, right)

        if len(right) == 1 and right[0] == ',':
            self.nline = f"{left} await import({module}),"
        elif right:
            right_str = self.fix_comma(right)
            self.nline = f"{left} (await import({module})){right_str}"
        else:
            self.nline = f"{left} await import({module})"
        if self.nline.count('await') > 1:
            raise ValueError
        # Fixme: // without spacing

####################################################################################################

class CjsToEsm:

    """Implement a stupdid CommonJS to ESM.

    Note that cjstoesm is a kind of transpiler and is not suited to transform a source code.
    """

    ##############################################

    def __init__(self, path: Path | str) -> None:
        self.path = Path(path)
        if True:
            print()
            printc('<green>' + '='*100 + '</green>')
            _ = self.path.relative_to(Path.cwd())
            printc(f'<red>{_}</red>')
        osource = self.path.read_text()
        debug = False
        nsource = self.fix(osource, fix_require=True, fix_export=False, debug=debug)
        if not debug:
            # print(nsource)
            path.write_text(nsource)

    ##############################################

    def indent_level(self, line: str) -> int:
        count = 0
        for _ in line:
            if _ != ' ':
                break
            count += 1
        return count // 2

    ##############################################

    def fix(
        self,
        source: str,
        fix_require: bool = True,
        fix_export: bool = True,
        debug: bool = False,
    ) -> str:
        dest = []
        level = 0
        for oline in source.splitlines():
            oline = oline.rstrip()
            nline = oline

            if oline == 'module.exports = {':
                nline = 'export default {'
            elif oline.startswith('module.exports'):
                nline = self.fix_default_export(oline)

            if fix_export:
                if level == 0:
                    if oline == 'module.exports = {':
                        level = 1
                        nline = None
                    elif oline.startswith('module.exports'):
                        nline = self.fix_default_export(oline)
                elif level == 1:
                    line = oline.strip()
                    if oline == '}':
                        # end of exports
                        level = 0
                        nline = None
                    elif line and (line[0].isalpha() or line[0] in '_'):
                        # key: ....
                        # init() {...
                        nline = self.fix_export(oline)
                        if oline.endswith('{') or oline.endswith('(['):
                            level = 2
                    else:
                        nline = oline[2:]
                elif level == 2:
                    if oline == '  },' or oline == '  }' or oline == '])':
                        level = 1
                        nline = '}\n'
                    else:
                        nline = oline[2:]

            if fix_require and 'require(' in oline:
                nline = self.fix_require(oline)

            # debug and
            if nline != oline:
                if nline is not None:
                    # and 'export' in nline
                    print()
                    # print(f'< |{oline}|')
                    # print(f'> |{nline}|')
                    print('< ' + Fore.BLUE + oline)
                    print('> ' + Fore.GREEN + nline)
                # if nline is not None:
                #     print(nline)

            if nline is not None:
                dest.append(nline)

        return LINESEP.join(dest) + LINESEP

    ##############################################

    def patch(self, oline: str) -> str:
        return PATCHES.get(oline, None)

    ##############################################

    def fix_require(self, oline: str) -> str:
        # skip commented
        if oline.strip().startswith('//'):
            return oline

        # print(Fore.GREEN + '-'*80)
        require_expression = RequireExpression(self.path, oline)
        return require_expression.nline

    ##############################################

    def fix_export(self, oline: str) -> str:
        # updates: {
        # arabic: '
        # fdCache: {},
        # init() {
        # filter = (f) => {

        if self.indent_level(oline) != 1:
            raise ValueError(f'bad indent for |{oline}')

        oline = oline.strip()
        if oline.endswith(') {'):
            nline = 'export function ' + oline
        else:
            # const or let ?
            nline = 'export let ' + oline
        for _ in (
                (': ', ' = '),
                ('function async', 'async function'),
                (' (', '('),
                ('async(', 'async ('),
        ):
            nline = nline.replace(*_, count=1)

        if nline.endswith(','):
            nline = nline[:-1]

        # export is reserved
        if nline.count('export') > 1:
            nline = 'Fixme!: ' + nline

        return nline

    ##############################################

    def fix_default_export(self, oline: str) -> str:
        nline = self.patch(oline)
        if nline is None:
            nline = oline
            for _ in (
                    ('module.exports =', 'export default'),
                    ('export default class', 'export class'),   # Fixme: ok ?
            ):
                nline = nline.replace(*_, count=1)
        return nline
