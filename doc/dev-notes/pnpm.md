# PNPM

- [Motivation | pnpm](https://pnpm.io)

- [How to migrate from yarn / npm to pnpm - DEV Community](https://dev.to/andreychernykh/yarn-npm-to-pnpm-migration-guide-2n04)

```
curl -fsSL https://get.pnpm.io/install.sh | sh -

sh install-pnpm.sh
==> Downloading pnpm binaries 10.9.0
WARN  using --force I sure hope you know what you are doing
Copying pnpm CLI from /tmp/tmp.EtzlGDryn3/pnpm to /home/.../.local/share/pnpm/pnpm
Appended new lines to /home/.../.bashrc

Next configuration changes were made:
export PNPM_HOME="/home/.../.local/share/pnpm"
case ":$PATH:" in
*":$PNPM_HOME:"*) ;;
*) export PATH="$PNPM_HOME:$PATH" ;;
esac

To start using pnpm, run:
source /home/.../.bashrc
```

```
"scripts": {
  "preinstall": "npx only-allow pnpm", 
  ...
}
```

```
ERR_PNPM_INVALID_SELECTOR  Cannot parse the "apollo-server-express/**/graphql-tools" selector
```

# Fixes for pnpm

```
ERROR in ./node_modules/.pnpm/markdown-it@11.0.1/node_modules/markdown-it/lib/common/utils.js
Module not found: Error: Can't resolve 'uc.micro' in '/home/fabrice/home/developpement/wikijs/node_modules/.pnpm/markdown-it@11.0.1/node_modules/markdown-it/lib/common'
@ ./node_modules/.pnpm/markdown-it@11.0.1/node_modules/markdown-it/lib/common/utils.js 300:30-49
...
```

```
./node_modules/.pnpm/markdown-it@11.0.1/node_modules/markdown-it/lib/common/utils.js   @300

exports.lib.ucmicro = require('uc.micro');

./node_modules/.pnpm/markdown-it@11.0.1/node_modules
  uc.micro -> ../../uc.micro@1.0.6/node_modules/uc.micro
```
