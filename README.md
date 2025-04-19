This repository contains a custom [Wiki.js](https://github.com/requarks/wiki) fork featuring some upgrades and modifications.

Actually, Wiki.js V3 is a work in progress and a personal project of [Nicolas Giard](https://github.com/ngpixel).  At the same time, the current version V2 was unfortunately mostly frozen as it is.  It is a pity, because for example, it was faster to update Katex than to figure out why it was not rendering correctly.  I know for a Wiki audience that a lot of peoples are begging for free supports... But it deserves Wiki.js to be maintained by a more collaborative effort.  There is any doubt we can try to continue to maintain the V2.  So why ?  Is JS framework's API too unstable ?  Do we need to restart from scratch due to the actual limitations ?  Is there a funding problem ?

> [!IMPORTANT]
> **NOTICE THAT ANY SUPPORT IS PROVIDED**
>
> **BUT ANY USEFUL PR IS WELCOME OR TALK ABOUT MAINTAINING V2**

# Changelog vs V2

## Package Upgrades

- [PostCSS](https://postcss.org) and [postcss-loader](https://www.npmjs.com/package/postcss-loader) was upgraded to fix the `No PostCSS Config found` error. It is probably due to some upgrades versus the Docker image.
- [caniuse-lite](https://www.npmjs.com/package/caniuse-lite) was outdated and printed a warning.
- [Katex](https://katex.org) was upgraded to the latest to enhance the Math support.
- [@mdi/js - npm](https://www.npmjs.com/package/@mdi/js) was upgraded to the latest. Telegram icon was replaced by a SVG from [SimpleIcons](https://simpleicons.org/?q=telegram)

### Known Issues

- [ssh2](https://github.com/mscdex/ssh2) has an optional dependencies, `cpu_features`, that fails to build and make noises.

  See [Remove cpu_features dependency](https://github.com/mscdex/ssh2/issues/1083).
  A workaround is to use `--ignore-optional` for Yarn.

## Modifications

- **Page Creation**
  - To make workflow faster, an user profile setting was added to disable the editor selector modal and use Markown by default.  Actually, the setting value is stored in a cookie. It should be stored in db, but it requires more coding...
  - The folder of the current page is used to initialize the path of a new page, instead of "/new-page". A click on a folder resets the path instead to concatenate the folder and the filename.
- **Markdown Editor**
  - Set the Emacs [keymap](https://codemirror.net/5/doc/manual.html#keymaps) for CodeMirror
  - Set a shortcut `Ctrl-Enter` to insert at cursor `</br>`

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


# Further Modification Ideas

- Insert Link : insert the page title instead of its slug
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
1. upgrade serious security issues, see `yarn audit`
1. upgrade to Vue 3
1. check for improvements

  - Markown-it
  - CodeMirror
1. upgrade for better performance

### Build Tools

Vue.js depends of Babel, so don't update build tool.

### Markown-it

It seems `**` breaks the editor, the page live preview is blank.

### CodeMirror

LanguageTool doesn't work with CodeMirror.

# Framework Notes

Vues.js is known to be more lighter than React but what about is API stability, code readability ???

I wrote some React apps, but I could not figure out where is the documentation for Vuetify using Pug :-) ...
</br>

**Tutorials**
- [Building Vue Components With Pug & Stylus. | by Victor Onuoha Martins | Medium](https://medium.com/@martinsOnuoha/building-vue-components-with-pug-stylus-564615ed289)
- [Vuetify + VueJS 3 | Cours](https://cours.brosseau.ovh/tp/vuejs3/vuetify.html)

# Dependencies Links

- [Yarn](https://yarnpkg.com)

  [CLI](https://classic.yarnpkg.com/en/docs/cli)
</br>

- [Apollo GraphQL](https://www.apollographql.com/)
- [Babel](https://babeljs.io)
  compile ECMAScript 2015+
- [Cheerio](https://cheerio.js.org)
  Parsing and manipulating HTML and XML
- [draw.io](https://www.drawio.com/)
- [Hammer.JS](https://hammerjs.github.io/)
  Gesture made by touch, mouse and pointerEvents
- [js-cookie](https://github.com/js-cookie/js-cookie)
- [Knex.js](https://knexjs.org)
  SQL Query Builder
- [Lodash](https://lodash.com)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [MDI — Material Design Icons](https://github.com/Templarian/MaterialDesign-JS)
- [Mermaid](https://mermaid.js.org)
  Diagramming and charting tool
- [Moment.js](https://momentjs.com)

  [Moment Timezone](https://momentjs.com/timezone)
  Date
- [Objection.js](https://vincit.github.io/objection.js)
  ORM
- [Prism](https://prismjs.com)
  Syntax highlighter
- [Pug](https://pugjs.org/api/getting-started.html)
  Template engine
  
  [Pug HTML Template Engine: A Beginner's Guide — SitePoint](https://www.sitepoint.com/a-beginners-guide-to-pug/)
- [punycode](https://github.com/mathiasbynens/punycode.js)
  Punycode converter that fully complies to RFC 3492 and RFC 5891
- [simple-git](https://github.com/steveukx/git-js)
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


# Interesting Package Links

### Monaco

- [Monaco Editor](https://microsoft.github.io/monaco-editor)
- VS Code editor so should be as bad as...
- LanguageTool support ???
- [purocean/monaco-spellchecker](https://github.com/purocean/monaco-spellchecker/)
  Demo is not so convincing...
