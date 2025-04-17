This repository contains a [Wiki.js](https://github.com/requarks/wiki) fork featuring some upgrades.

**NOTICE THAT ANY SUPPORT IS PROVIDED**

# Build Status

If you don't want to use a Docker image, the build process works on Linux Fedora 41.

1. Install Web development packages: Node.js Yarn ...
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

- [PostCSS](https://postcss.org) and [postcss-loader](https://www.npmjs.com/package/postcss-loader) was upgraded to fix the `No PostCSS Config found` error. It is probably due to some upgrades versus the Docker image.
- [caniuse-lite](https://www.npmjs.com/package/caniuse-lite) was outdated and printed a warning.
- [Katex](https://katex.org) was upgraded to the latest to enhance the Math support.

## Known Issues

- [ssh2](https://github.com/mscdex/ssh2) has an optional dependencies, `cpu_features`, that fails to build and make noises.

  See [Remove cpu_features dependency](https://github.com/mscdex/ssh2/issues/1083).
  A workaround is to use `--ignore-optional` for Yarn.

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
