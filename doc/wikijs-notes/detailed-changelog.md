# Detailed Changelog

The main concerns to maintain Wikijs are:
- documentation (how it works, how to build it, ...)
- code readability
- only keep core features and disable everything which are optional, useless or unknown
- disable features
  - that are partially implemented
  - that depends on obsolete dependencies
- keep dependencies up to date
  1. for security !
  2. else the upgrade step will be more and more difficult...

## Locales

Localisation data are fetched from a server and corresponds to a set of keys and values.

Those data were collected in `server/locales/locale-{language_code}.json`.

## Telemetry

Telemetry data are send to a server whose code is not available.

It does not make sense to enable this feature.

## Node.js

Node.js has good performances thanks to the V8 JIT and its asynchronous implementation.

But actually, its error reporting can be quite laconic.  Especially with ESM and dynamic import,
where you nearly got "We found an error in your code ! We wish you will figure out where it is..."

This behaviour is reported by users on [nodejs/node issues](https://github.com/nodejs/node/issues).

Use `node --loader server/helper/log-loader.js server` to log module loading.

The source code does not end lines with a semicolon.  However, the Node parser can require a
semicolon in those cases:
- before an `await import`

## Logging

Winston is unable to log the location of the call.  This behaviour is reported by users.

## Unit Test

**Actually, any unit test are implemented !!!**

## Coding conventions

- camelcase
- indent with four spaces
  Why tab indentation is bad even with a good IDE ???

- `array.length > 0`

**Deno formatting settings**
See [Deno — Linting and formatting](https://docs.deno.com/runtime/fundamentals/linting_and_formatting)
```
  "bracePosition": "sameLine",
      // brace position for blocks
      // e.g. `if (..) {`
      // maintain, sameLine, nextLine, sameLineUnlessHanging
  "indentWidth": 4,
  "lineWidth": 120,
  "newLineKind": "lf",
  "nextControlFlowPosition": "sameLine",
      // e.g. `} else {`
      // sameLine, nextLine, maintain
  "semiColons": false,
  "operatorPosition": "maintain",
      // where to place the operator for expressions that span multiple lines
      // e.g. `&&` `||` `? :`
      // sameLine, nextLine, maintain
  "proseWrap": "preserve",
      // e.g. ???
      // always, never, preserve
  "quoteProps": "asNeeded",
      // quoting of object properties
      // e.g. `'foo': ...`
      // asNeeded, consistent, preserve
  "singleBodyPosition": "nextLine",
     // e.g. `if (...)\n...`
     // sameLine, nextLine, maintain, sameLineUnlessHanging
  "singleQuote": true,
  "spaceAround": false,
     // e.g. `if ( ... )` `[ 1, 2, 3 ]` `foo( 1, 2 )`
     // control spacing around enclosed expressions
  "spaceSurroundingProperties": true,
     // control spacing surrounding single line object-like nodes
     // e.g. `{ silent: false }`
  "trailingCommas": "never",
     // control trailing commas in multi-line arrays/objects
     // e.g. `(1, 2, 3,)`
     // but we cannot control that for multi-lines !
     // always, never
  "typeLiteral.separatorKind": "semiColon",
     // define separator kind for type literals
     // e.g. ???
     // comma, semiColon
  "useTabs": false, 
  "useBraces": "preferNone",
     // whether to use braces for if statements, for statements, and while statements
     // e.g. `if (...)\n    single line expression\n`
     // maintain, whenNotSingleLine, always, preferNone
```

Notice we cannot control
```
const afunc = (foo) => ...
// vs
const afunc = foo => ...

var alist = [
    1,
    2 // keep ,
]
```

## Client / Server Split

**This is done in V3.**

The Node.js server and the browser application are independents.  They must share the same GraphQL
interface and the server must provide the application files to the client.

The split permits to have two independent `package.json` files.

## Switch to PNPM rather than Yarn

**This is done in V3.**

NPM and also Yarn have serious implementation flaws.  As opposite PNPM is fast and use hard-links to a global share
to save space disk.

## Switch to ECMAScript Modules (ESM) rather than CommonJS Modules (CJS)

**This is done in V3.**

**There are certainly typos and bugs to fix in some parts of the code which are optionals.**

[ECMAScript modules](https://nodejs.org/api/esm.html) are now the modern and standard way to
implement JavaScript modules.  [CommonJS modules](https://nodejs.org/api/modules.html) is the
historical way and uses the `modules.export` map to declare exported symbols.  Notice we can compare
this to the Python `__all__`.

However the port to ESM was painful due to the way symbols are exported or imported, and also to the
asynchronous nature of dynamic import.

The main issue with the WikiJS code is the readability since everything is coded in the export map
block.

There are several locations in the code where `require()` is used to load a module.  With ESM, we
have to check if we really need a (async) dynamic import or if a top level is right.

The `auto-load` tool is replaced by an index file or `glob()` and a dynamic `import()`.

## Database

Actually, the database is build by applying sequentially each migration step.

Is there a way to build the database directly ?

Look at [Alembic](https://alembic.sqlalchemy.org) to compare how is managed database migrations.

## Knex / Objection

According to the migration guide, there is nothing to do but this is not complete.

> [!CAUTION]
> For the fields declared in `jsonAttributes()`, `JSON.stringify` is now called automatically by the framework.
> A simple check for a remaining bug in the code is to look for double quoted fields in the database.
> It means a value that will be decoded as a string instead of a JSON object, i.e. an array or a map,
> e.g. a SQL value like '"[\"manage:system\"]"' instead of '["manage:system"]'
> like in `INSERT INTO "groups" VALUES(1,'Administrators','"[\"manage:system\"]"','[]',1,'2025-05-21T18:21:23.730Z','2025-05-21T18:21:23.730Z','/');`
> This error breaks the WIKI authentication and return HTTP 403 when you try to login, but it could be worse...
> Thus we can just look for `\"` occurrences in a SQL dump.
