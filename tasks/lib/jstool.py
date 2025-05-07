####################################################################################################

from pathlib import Path

from .helper import printc, Fore

# https://github.com/cedricrupb/code_tokenize
# Tokenizer based on Tree Sitter library
import code_tokenize as ctok

####################################################################################################

PATCHES = {
    'module.exports = router': 'export { router }',
    "const Model = require('objection').Model": "import { Model } from 'objection'",
}

####################################################################################################

class RequireExpression:

    ##############################################

    def __init__(self, oline: str) -> None:
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
            self.const_require(tokens)
        except ValueError:
            print(f'<red>Fixme</red> {oline}')

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

    ##############################################

    def const_require(self, tokens: list[str]):
        if tokens[0] != 'const':
            return None

        tokens = tokens[1:]
        for i, _ in enumerate(tokens):
            if _ == '=':
                break
        left = tokens[:i]
        right = tokens[i+1:]
        if right[0] != 'require':
            raise ValueError(self.oline)
        # print(left, right)

        open = None
        close = None
        level = 0
        for i, _ in enumerate(right):
            match _:
                case '(':
                    if level == 0:
                        open = i
                    level += 1
                case ')':
                    level -= 1
                    if level == 0:
                        close = i
                        break
        module = right[open+1:close]
        if len(module) == 1:
            module = module.pop()
        else:
            module = self.fix_comma(module)
        if '.' in module:
            for c in "'`":
                suffix = ".js" + c 
                if module.endswith(c) and not module.endswith(suffix):
                    module = module[:-1] + suffix
        right = right[close+1:]
        # print(left, module, right)

        if module.startswith("'lodash"):
            _ = left[0]
            self.nline = f"import {_} from {module}"
        # elif module == "'objection'":
        #     if left[0] == 'Model' and self.fix_comma(right) == '.Model':
        #         self.nline = "import Model from 'objection'"
        #         right = ''
        #     elif not right:
        #         _ = left[0]
        #         self.nline = f"import * as {_} from {module}"
        #     else:
        #         raise NameError(self.oline)
        elif left[0] == '{':
            _ = '{ ' + self.fix_comma(left[1:-1]) + ' }'
            self.nline = f'import {_} from {module}'
        elif len(left) == 1 and self.quote(left[0]) == module:
            self.nline = f'import {module}'
        elif len(left) == 1:
            _ = left[0]
            self.nline = f"import * as {_} from {module}"
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

####################################################################################################

class CjsToEsm:

    """Implement a stupdid CommonJS to ESM.

    Note that cjstoesm is a kind of transpiler and is not suited to transform a source code.
    """

    ##############################################

    def __init__(self, path: Path | str) -> None:
        path = Path(path)
        if True:
            printc('<green>' + '='*100 + '</green>')
            printc(f'<red>{path}</red>')
        osource = path.read_text()
        debug = True
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
        prev = None
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

            if debug and nline != oline:
                if nline is not None:
                    # and 'export' in nline
                    print()
                    # print(f'< |{oline}|')
                    # print(f'> |{nline}|')
                    print('< ' + Fore.BLUE +  oline)
                    print('> ' + Fore.GREEN + nline)
                # if nline is not None:
                #     print(nline)

            if nline is not None:
                dest.append(nline)
                prev = nline

        return '\n'.join(dest)
    # .rstrip().rstrip() + '\n'

    ##############################################

    def patch(self, oline: str) -> str:
        return PATCHES.get(oline, None)

    ##############################################

    def fix_require(self, oline: str) -> str:
        # skip commented
        if oline.strip().startswith('//'):
            return oline

        print(Fore.GREEN + '-'*80)
        require_expression = RequireExpression(oline)
        return require_expression.nline

    ##############################################

    def fix_require_old(self, oline: str) -> str:
        if oline.strip().startswith('//'):
            return oline

        nline = self.patch(oline)
        if nline is not None:
            return nline

        if oline.startswith(' '):
            # Fixme: (await import('foo')).bar
            nline = oline.replace('require', 'await import')
        else:
            nline = 'import ' + oline
            for _ in (
                    ('require(', ''),
                    ("')", "'"),
                    ('const ', ''),
                    ('=', 'from'),
            ):
                nline = nline.replace(*_)

        if './' in nline and not nline.endswith(".js'"):
            i = nline.rfind("'")
            if i != -1:
                nline = nline[:i] + ".js'"
        if nline.endswith(".js'") and '{' not in nline:
            nline = nline.replace('import', 'import * as')

        if nline.endswith('.Strategy'):
            for _ in (
                    ('.Strategy', ''),
                    ('from', 'as Strategy from'),
            ):
                nline = nline.replace(*_)

        # Fixme:
        # import EventEmitter from 'eventemitter2'.EventEmitter2
        # import JSBinType from 'js-binary'.Type
        # import OIDCStrategy from 'passport-azure-ad'.OIDCStrategy
        # import PubSub from 'graphql-subscriptions'.PubSub
        # import UINT64 from 'cuint'.UINT64
        # import URL from 'url'.URL
        # import mime from 'mime-types'.lookup
        # import turndownPluginGfm from '@joplin/turndown-plugin-gfm'.gfm

        # import { v4: uuid } from 'uuid'
        # await import('winston-papertrail').Papertrail
        # import tsquery from 'pg-tsquery'()
        # modelClass: await import('./users.js'
        # import nanoid from 'nanoid/non-secure'.customAlphabet('1234567890abcdef', 10)
        # revocationList: await import * as('./cache.js'

        for _ in (
                'let',
                # "'.",
                "'(",
                # ": ",
                # 'promisify(',
                # 'promisifyAll(',
        ):
            if _ in nline:
                return 'Fixme!: ' + nline
        return nline

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
        # module.exports = router
        nline = self.patch(oline)
        if nline is None:
            nline = oline
            for _ in (
                    ('module.exports =', 'export default'),
                    ('export default class', 'export class'),   # Fixme: ok ?
            ):
                nline = nline.replace(*_, count=1)
        return nline
