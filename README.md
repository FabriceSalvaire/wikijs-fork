This repository contains a [Wiki.js](https://github.com/requarks/wiki) fork featuring some upgrades.

**NOTICE THAT ANY SUPPORT IS PROVIDED**

# Build Status

Build process works on Fedora 41.

1. Install Node.js ...
1. Install the packages:
   ```
   # yarn cache clean
   ln -sf .../node_modules node_modules
   yarn install --frozen-lockfile --non-interactive --ignore-optional
   ```
1. Build `assets`:
   ```
   yarn build
   yarn patch-package
   ```
1. To cleanup `node_modules` for production:
   ```
   rm node_modules
   ln -sf .../node_modules-prod node_modules
   yarn --frozen-lockfile --non-interactive --ignore-optional --production
   yarn patch-package
   ```
1. Setup `config.yml`
1. Set `dev` to `false` in `package.json`
1. Run Wiki.js using `node server`

# Upgrades

- PostCSS was upgraded to fix `No PostCSS Config found` error
- caniuse-lite was outdated
- Katex was upgraded to the latest to enhance the math support

# Further upgrades

- `yarn.lock` is a castle of cards !
- Most of the packages are outdated, unmaintained, end of life, and could have security issues !
- Any upgrade can break everything !
- Most of the time, a major upgrade changes the API !

## Build Tools

Vue.js depends of Babel, so don't update build tool.

## CodeMirror

It seems `**` breaks the editor, the page live preview is blank.

LanguageTool doesn't work with CodeMirror.
