# Detailed Changelog

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
