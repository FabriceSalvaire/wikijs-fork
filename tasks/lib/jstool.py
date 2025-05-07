####################################################################################################

from pathlib import Path

from .helper import printc, Fore

####################################################################################################

PATCHES = {
    'module.exports = router': 'export { router }',
}

####################################################################################################

class CjsToEsm:

    """Implement a stupdid CommonJS to ESM.

    Note that cjstoesm is a kind of transpiler and is not suited to transform a source code.
    """

    ##############################################

    def __init__(self, path: Path | str) -> None:
        path = Path(path)
        printc('<green>' + '='*100 + '</green>')
        printc(f'<red>{path}</red>')
        osource = path.read_text()
        nsource = self.fix(osource, fix_require=True, fix_export=True)
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
                if nline is not None and 'export' in nline:
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
        # https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
        # const _ = require('lodash')
        #
        # import defaultExport from "module-name"
        # import * as name from "module-name"
        # import { export1 } from "module-name"
        # import { export1 as alias1 } from "module-name"
        # import { default as alias } from "module-name"
        # import { export1, export2 } from "module-name"
        # import { export1, export2 as alias2, /* … */ } from "module-name"
        # import { "string name" as alias } from "module-name"
        # import defaultExport, { export1, /* … */ } from "module-name"
        # import defaultExport, * as name from "module-name"
        # import "module-name"
        # let foo = import("module")

        if oline.strip().startswith('//'):
            return oline

        if oline.startswith(' '):
            nline = oline.replace('require', 'import')
        else:
            nline = 'import ' + oline
            for _ in (
                    ('require(', ''),
                    ("')", "'"),
                    ('const ', ''),
                    ('=', 'from'),
                    ('import _', 'import * as _'),
            ):
                nline = nline.replace(*_)
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
        # https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
        # // Exporting declarations
        # export let name1, name2/*, … */; // also var
        # export const name1 = 1, name2 = 2/*, … */; // also var, let
        # export function functionName() { /* … */ }
        # export class ClassName { /* … */ }
        # export function* generatorFunctionName() { /* … */ }
        # export const { name1, name2: bar } = o;
        # export const [ name1, name2 ] = array;
        #
        # // Export list
        # export { name1, /* …, */ nameN };
        # export { variable1 as name1, variable2 as name2, /* …, */ nameN };
        # export { variable1 as "string name" };
        # export { name1 as default /*, … */ };
        #
        # // Default exports
        # export default expression;
        # export default function functionName() { /* … */ }
        # export default class ClassName { /* … */ }
        # export default function* generatorFunctionName() { /* … */ }
        # export default function () { /* … */ }
        # export default class { /* … */ }
        # export default function* () { /* … */ }
        #
        # // Aggregating modules
        # export * from "module-name";
        # export * as name1 from "module-name";
        # export { name1, /* …, */ nameN } from "module-name";
        # export { import1 as name1, import2 as name2, /* …, */ nameN } from "module-name";
        # export { default, /* …, */ } from "module-name";
        # export { default as name1 } from "module-name";

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
                    ('export default class', 'export class'),
            ):
                nline = nline.replace(*_, count=1)
        return nline
