# Node REPL

Run `node`

# Hoisting

JavaScript Hoisting refers to the process whereby the interpreter appears to move the declaration of
functions, variables, classes, or imports to the top of their scope, prior to execution of the code.

- [Hoisting - MDN Web Docs Glossary: Definitions of Web-related terms | MDN](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)

# let / const var

Note: block-scoped means `{...}`

The **const** declaration declares block-scoped local variables. The value of a constant can't be
changed through reassignment using the assignment operator, but if a constant is an object, its
properties can be added, updated, or removed.

The **let** declaration declares re-assignable, block-scoped local variables, optionally
initializing each to a value.

The **var** statement declares function-scoped or globally-scoped variables, optionally initializing
each to a value.

|----------------|-------|-----|-------|
|                |  var  | let | const |
|----------------|-------|-----|-------|
| global scope   | **Y** |  N  |   N   |
| function scope |   Y   |  Y  |   Y   |
| block scope    |   N   |  Y  |   Y   |
| mutable        |   Y   |  Y  | **N** |
| re-declaration | **Y** |  N  |   N   |
| hoisting       | **Y** |  N  |   N   |
|----------------|-------|-----|-------|

- [let - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [const - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
- [var - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)

# Object

An object initializer is a comma-delimited list of zero or more pairs of property names and
associated values of an object, enclosed in curly braces (`{}`). Objects can also be initialized using
`Object.create()` or by invoking a constructor function with the `new` operator.

When using the same name for your properties, the second property will overwrite the first.

The **get** syntax binds an object property to a function that will be called when that property is
looked up. It can also be used in classes.

The **set** syntax binds an object property to a function to be called when there is an attempt to
set that property. It can also be used in classes.

```
let foo = 1
let obj = {
  a: "foo",
  b: 12,
  c: {},

  1: "number literal property",
  "foo:bar": "string literal property",

  // shorthand property
  // foo: foo,
  foo,
  
  // method: function (parameters) {},
  method(parameters) {},

  // generator: function* () {},
  *generator() {},

  get property() {},
  set property(value) {},

  [expression]: "computed property",
  [`foo${++i}`]: i,

  __proto__: prototype,

  ...spreadProperty,
}
```

```
obj.a
obj["foo:bar"]
```

```
const obj = {
  _foo: 1,
  bar: 2,
  get foo() {
    return this._foo
  },
  set foo(value) {
    this._foo = value
  }
};
```

- [Object - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
- [Object initializer - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer)
- [get - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)

# Export

- [Export — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)

```
// Exporting declarations
export let name1, name2/*, … */; // also var
export const name1 = 1, name2 = 2/*, … */; // also var, let
export function functionName() { /* … */ }
export class ClassName { /* … */ }
export function* generatorFunctionName() { /* … */ }
export const { name1, name2: bar } = o;
export const [ name1, name2 ] = array;

// Export list
export { name1, /* …, */ nameN };
export { variable1 as name1, variable2 as name2, /* …, */ nameN };
export { variable1 as "string name" };
export { name1 as default /*, … */ };

// Default exports
export default expression;
export default function functionName() { /* … */ }
export default class ClassName { /* … */ }
export default function* generatorFunctionName() { /* … */ }
export default function () { /* … */ }
export default class { /* … */ }
export default function* () { /* … */ }

// Aggregating modules
export * from "module-name";
export * as name1 from "module-name";
export { name1, /* …, */ nameN } from "module-name";
export { import1 as name1, import2 as name2, /* …, */ nameN } from "module-name";
export { default, /* …, */ } from "module-name";
export { default as name1 } from "module-name";
```

# Import

[Import — MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)

```
import defaultExport from "module-name"

import * as name from "module-name"

import { export1 } from "module-name"
import { export1 as alias1 } from "module-name"
import { default as alias } from "module-name"
import { export1, export2 } from "module-name"

import { export1, export2 as alias2, /* … */ } from "module-name"
import { "string name" as alias } from "module-name"

import defaultExport, { export1, /* … */ } from "module-name"
import defaultExport, * as name from "module-name"

import "module-name"

let foo = import("module")
```

To debug
```
console.log(module)
->
{
init: [Function: init],
loadFromDb: [AsyncFunction: loadFromDb],
saveToDb: [AsyncFunction: saveToDb],
applyFlags: [AsyncFunction: applyFlags],
subscribeToEvents: [Function: subscribeToEvents]
}
```
