This repository contains a custom [Wiki.js](https://github.com/requarks/wiki) fork featuring some upgrades and modifications.

A CLI for Wiki.js is available in this [repository](https://github.com/FabriceSalvaire/wikijs-cli) which targets power user use cases.  It provides a command line front end and some tools which can be run on the client side.  Moreover, it is easier for me to implement new things in Python than to dive in the Wiki.js server and client code.

**Colophon**
Actually, Wiki.js V3 is a work in progress and a personal project of [Nicolas Giard](https://github.com/ngpixel).  Many thanks to him to have released this nice free software Wiki.  But at the same time, the current version V2 was unfortunately mostly frozen as it is.  It is a pity, because for example, it was faster to update Katex than to figure out why it was not rendering correctly.  I know for a Wiki audience that a lot of peoples are begging for free supports... But it deserves Wiki.js to be maintained by a more collaborative effort.  There is any doubt we can try to continue to maintain the V2.  So why ?  Is JS framework's API too unstable ?  Do we need to restart from scratch due to the actual limitations ?  Is there a funding problem ?

> [!IMPORTANT]
> **NOTICE THAT ANY SUPPORT IS PROVIDED**
>
> **BUT ANY USEFUL PR IS WELCOME OR TALK ABOUT MAINTAINING V2**

> [!NOTE]
> This repository contains custom modifications, so the Git log does not necessary contains clean commits.

# Changelog vs V2

## Package Upgrades

- [PostCSS](https://postcss.org) and [postcss-loader](https://www.npmjs.com/package/postcss-loader) was upgraded to fix the `No PostCSS Config found` error. It is probably due to some upgrades versus the Docker image.
- [caniuse-lite](https://www.npmjs.com/package/caniuse-lite) was outdated and printed a warning.
- [Katex](https://katex.org) was upgraded to the latest to enhance the Math support.
- [mdi](https://www.npmjs.com/package/@mdi/js) was upgraded to the latest. Telegram icon was replaced by an SVG from [SimpleIcons](https://simpleicons.org/?q=telegram)

### Known Issues

- [ssh2](https://github.com/mscdex/ssh2) has an optional dependency, `cpu_features`, that fails to build and make noises.

  See [Remove cpu_features dependency](https://github.com/mscdex/ssh2/issues/1083).
  A workaround is to use `--ignore-optional` for Yarn.

## Modifications

- **Page Creation**

  To make the workflow faster...
  - An user profile setting was added to disable the editor selector modal and use Markown by default.  Actually, the setting value is stored in a cookie. It should be stored in db, but it requires more coding...
  - It is cumbersome to have to click many times to create a page (expand the folder tree).  For this reason, the folder of the current page is used to initialize the path of a new page, instead of "/new-page".  A click on a folder resets the path instead to concatenate the folder and the filename (I don't understand the reason of this behaviour).  Notice, you can open a browser tab by folder to simulate a working directory.
  - Removed default content for new page.

- **Markdown Editor**
  - In addition to the CodeMirror editor, a basic textarea was implemented to perform standard browser actions like spell checking, or support for browser extensions like [LanguageTool](https://languagetool.org) or an [external editor](https://github.com/asamuzaK/withExEditor).  A button is used to switch between both editors.  It looks like a hack, but it offers the same experience as you usually get when editing Mardown with a browser.  Moreover, it is better than the actual solution that shows errors in the live preview.  Especially since the preview is spoiled by LanguageTool when it contains math. **TODO: for some reason, the live preview is not updated when editing the textarea**
  - Set the Emacs [keymap](https://codemirror.net/5/doc/manual.html#keymaps) for CodeMirror (Vi and Sublime Text are also available).  Of course, it will not transform your browser to an evil editor, but it is much better and just one line of code... Notice some commands work poorly.
  - Set a shortcut `Ctrl-Enter` to insert at cursor `</br>` which is useful to force line breaking.
  - Link insertion: use the page title instead of its slug (I don't understand the reason of this behaviour).

# Build Process

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
   yarn patch-package   # or yarn postinstall
   ```
1. Setup `config.yml`
1. Set `dev` to `false` in `package.json`
1. Run Wiki.js using `node server` or `yarn start`
   For dev mode use `yarn dev`, see also `yarn watch`
1. Install [Vue DevTools](https://devtools.vuejs.org) browser extension (Chrome, Firefox)


# Dev Tools

This repository contains these tools (written in Python or Bash):
- a tool to explore imports in the source code and match them with `package.json` dependencies
- a tool to upgrade `@mdi/font` package: lookup for mdi icons in the source code and check for upgrade using the changelog
- a tool to fetch PR from GitHub
- a tool to apply `yarn add / upgrade`
- a Bash shell script to build the project
- a tool to rsync on the server


# Further Modification Ideas

- Insert Link Modal : Expand current folder and scroll to it (notice the modal is only destroyed when we leave the editor).

**Short list of PR to review**
- [fix: open newtab when using middle mouse button in tag overview by rtpt-romankarwacik · Pull Request #7143 · requarks/wiki](https://github.com/requarks/wiki/pull/7143)
- [back link support by yrong · Pull Request #2507 · requarks/wiki](https://github.com/requarks/wiki/pull/2507)
- [Support generating sitemap for SEO by lawrenceching · Pull Request #6778 · requarks/wiki](https://github.com/requarks/wiki/pull/6778)
- [feat: markdown editer support paste image by myml · Pull Request #5441 · requarks/wiki](https://github.com/requarks/wiki/pull/5441)
- [feat:introduced graphql createFolderWithId, get all folders and deleteFolder by kornelj · Pull Request #6727 · requarks/wiki](https://github.com/requarks/wiki/pull/6727)
- [Add support for markdown wikilinks (aka piped links) by Mexator · Pull Request #7319 · requarks/wiki](https://github.com/requarks/wiki/pull/7319)


# Further Package Upgrades

**Notice that**
- `yarn.lock` is a castle of cards !
- Most of the packages are outdated, unmaintained, end of life, and could have security issues !
- Any upgrade can break everything !
- Most of the time, a major upgrade changes the API !

**Idea**
1. Split server and client as for V3.  It will permit to have two independent `package.json`.  The Node.js server only needs the Javascript files from the `server` directory, the required `node_modules` and the `assets` directory built by Webpack.
1. upgrade serious security issues, see `yarn audit`
1. upgrade to Vue 3
1. check for improvements

  - Markown-it
  - CodeMirror
1. Upgrade for better performance

### Build Tools

Vue.js depends on Babel, so don't update build tool.

### Markown-it

It seems `**` breaks the editor, the page live preview is blank.

### CodeMirror

LanguageTool doesn't work with CodeMirror.

# Framework Notes

Vues.js is known to be lighter than React, which is nice for mobile.  But what about its API stability, code readability ???  IMHO, Vue/Pug templates are hard to read versus React/JSX and Qt/QML.  It looks OK for toy applications but...  Same apply to this Javascript flavour where the code is a bunch of lines of code in the `<script>` section.

I have experience with React, but I could not figure out where is the documentation for Vuetify using Pug :-) ...

# Dependencies Links

- [Babel](https://babeljs.io)
  compile ECMAScript 2015+
- [Yarn](https://yarnpkg.com)

  [CLI](https://classic.yarnpkg.com/en/docs/cli)
</br>

- [acme](https://git.rootprojects.org/root/acme.js.git)
   Library for getting Free SSL certifications through Let's Encrypt v2, using ACME (RFC 8555)

  [acme - npm](https://www.npmjs.com/package/acme)
- [Apollo GraphQL](https://www.apollographql.com/)
- [apollo-server-express](https://www.npmjs.com/package/apollo-server-express)
  Express integration of Apollo Server
  **Deprecated**

  [Previous Versions of Apollo Server](https://www.apollographql.com/docs/apollo-server/previous-versions)
- [bluebird](https://github.com/petkaantonov/bluebird)
  Promise
  **Warning: Please use native promises instead if at all possible**
- [Cheerio](https://cheerio.js.org)
  Parsing and manipulating HTML and XML
- [chromium-pickle-js](https://github.com/electron/node-chromium-pickle-js#readme)
  Binary value packing and unpacking library compatible with Chromium's Pickle class
  **Archived**
- [cuint](https://github.com/pierrec/js-cuint)
  C-like unsigned integers
  **Archived**
- [draw.io](https://www.drawio.com) Diagram
- [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2)
  Eevent emitter implementation with namespaces, wildcards, TTL, works in the browser
- [Express](https://expressjs.com)
  Web framework
- [fs-extra](https://github.com/jprichardson/node-fs-extra)
  Adds file system methods that aren't included in the native fs module and adds promise support to the fs method
- [graphql - npm](https://www.npmjs.com/package/graphql)
  JavaScript reference implementation for GraphQL
- [graphql-rate-limit-directive - npm](https://www.npmjs.com/package/graphql-rate-limit-directive)
  Fixed window rate limiting directive for GraphQL. Used to limit repeated requests to queries and mutations.
- [graphql-subscriptions - npm](https://www.npmjs.com/package/graphql-subscriptions)
  Implement pubsub subscriptions in GraphQL
- [graphql-tool - npm](https://www.npmjs.com/package/graphql-tool)
- [Hammer.JS](https://hammerjs.github.io/)
  Gesture made by touch, mouse and pointerEvents
- [js-cookie](https://github.com/js-cookie/js-cookie)
- [js-yaml](https://github.com/nodeca/js-yaml)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [Knex.js](https://knexjs.org)
  SQL Query Builder
- [Lodash](https://lodash.com)

  [Lodash @npm](https://www.npmjs.com/package/lodash)
- [Luxon — Moment](https://moment.github.io/luxon)
  Date and time
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [MDI — Material Design Icons](https://github.com/Templarian/MaterialDesign-JS)
- [Mermaid](https://mermaid.js.org)
  Diagramming and charting tool
- [Moment.js](https://momentjs.com)

  [Moment Timezone](https://momentjs.com/timezone)
  Date
- [ms](https://github.com/vercel/ms)
  Millisecond conversion utility
- [nodemailer](https://github.com/nodemailer/nodemailer)
  Send email
- [Objection.js](https://vincit.github.io/objection.js)
  ORM
- [Passport.js](https://www.passportjs.org)
   Authentication middleware
- [passport-jwt](https://www.passportjs.org/packages/passport-jwt)
  JSON Web Token
- [pem-jwk](https://github.com/dannycoates/pem-jwk)
  convert between PEM and JWK key serialization formats
- [Prism](https://prismjs.com)
  Syntax highlighter
- [Pug](https://pugjs.org/api/getting-started.html)
  Template engine
- [@root/keypairs - npm](https://www.npmjs.com/package/@root/keypairs)
  RSA and ECDSA utils
  [Pug HTML Template Engine: A Beginner's Guide — SitePoint](https://www.sitepoint.com/a-beginners-guide-to-pug/)
- [punycode](https://github.com/mathiasbynens/punycode.js)
  Punycode converter that fully complies to RFC 3492 and RFC 5891

- [simple-git](https://github.com/steveukx/git-js)
- [triple-beam](https://github.com/winstonjs/triple-beam)
  Definitions of levels for logging purposes & shareable Symbol constants

  [triple-beam - npm](https://www.npmjs.com/package/triple-beam)
- [Vue.js](https://v2.vuejs.org/v2/guide)
- [Vuex](https://vuex.vuejs.org)
  State management

  [Getting Started | Vuex](https://vuex.vuejs.org/guide/#the-simplest-store)
- [vuex-pathify](https://davestewart.github.io/vuex-pathify)
- [vuex-persistedstate](https://github.com/robinvdvleuten/vuex-persistedstate)
  Persist and rehydrate a Vuex state between page reloads
  (**Archived** and UNUSED ???)
- [Vuetify](https://v2.vuetifyjs.com/en)
  Material Design Framework for Vue.js
- [vuetify-loader](https://github.com/vuetifyjs/vuetify-loader)
  Webpack plugin
- [winstonjs](https://github.com/winstonjs/winston)
  Logging
- [winston-transport - npm](https://www.npmjs.com/package/winston-transport)
  Base TransportStream implementation for Winston


# Interesting Package Links

### Monaco

- [Monaco Editor](https://microsoft.github.io/monaco-editor)
- VS Code editor so should be as bad as...
- LanguageTool support ???
- [purocean/monaco-spellchecker](https://github.com/purocean/monaco-spellchecker/)
  Demo is not so convincing...


## Node.sj Notes

Node.js will treat `.cjs` files as CommonJS (which uses require and module.exports) modules and `.mjs` files as ECMAScript modules (which uses import and export).

- [CommonJS vs. ES modules in Node.js - LogRocket Blog](https://blog.logrocket.com/commonjs-vs-es-modules-node-js/)


## Bundling Notes

- [pNPM](https://pnpm.io)
  Package manager that replaces npm or yarn

  **:-) It uses hard links or symlinks to link packages from a global store instead of copying them to the node_modules folder...**
- [Vite](https://vite.dev)
  Local development server, faster than Webpack
- [cdnjs.cloudflare.com/polyfill](https://cdnjs.cloudflare.com/polyfill)

<!-- Local Variables: -->
<!-- languagetool-local-disabled-rules: ("WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "CLEAN_UP" "WHITESPACE_RULE" "WHITESPACE_RULE" "CONSECUTIVE_SPACES" "WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "WHITESPACE_RULE" "LC_AFTER_PERIOD" "WHITESPACE_RULE") -->
<!-- End: -->
