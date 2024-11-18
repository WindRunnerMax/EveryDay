# Understanding Modular Development in JavaScript
Modularity is an essential path in the development of any language. It helps developers to split and organize code. As front-end technology advances, the amount of code written in front-end development is increasing. Therefore, proper code management is required. Modularization helps developers to solve naming conflicts, manage dependencies, improve code readability, decouple code, and increase code reusability.

## Description
Modular development essentially involves encapsulating details and providing usage interfaces. Each module implements a specific function and avoids global variable contamination. Initially, modules were implemented using functions to take advantage of the local scope of functions.

```javascript
function func1(){
    //...
}

function func2(){
    //...
}
```
The `func1` and `func2` functions above form two modules. However, this approach does not guarantee prevention of variable name conflicts with other modules, and the direct relationship between module members is not apparent. Subsequently, object-oriented programming was used to create modules, containing members within objects.

```javascript
var nameModule={
    name:0,
    func1:function(){
        //...
    },
    func2:function(){
        //...
    }
}
```

Before the establishment of modularization standards, developers typically used the Module design pattern to solve the pollution problems in the global scope of JavaScript. The Module pattern was initially defined as a method for providing private and public encapsulation for classes in traditional software engineering. In JavaScript, the Module pattern uses an immediately invoked function expression (IIFE) to create closures for encapsulation, which distinguishes between private and public members through custom exposure behavior.

```javascript
var nameModule = (function() {
    var moduleName = "module";  // private

    function setModuleName(name) {
        moduleName = name;
    }

    function getModuleName() {
        return moduleName;
    }
    return { 
        setModuleName: setModuleName, 
        getModuleName: getModuleName
    }
})();

console.log(nameModule.getModuleName()); // module
nameModule.setModuleName("nameModule");
console.log(nameModule.getModuleName()); // nameModule
```

## Modularization Standards
`CommonJs`, `AMD`, `CMD`, and `ES6` are the standards used for defining modularization. They establish rules for importing modules, handling dependencies between modules, and resolving naming conflicts. Modularization standards allow complex systems to be decomposed into code structures that are more reasonable, maintainable, and manageable.

### CommonJS
`CommonJS` is the standard for server-side modules in NodeJs. According to this standard, each file is a module with its own scope. Variables, functions, and classes defined within a file are private and not visible to other files. The `CommonJS` standard specifies that within each module, the `module` variable represents the current module, and its `exports` property is the external interface. Loading a module actually loads its `exports` property. In summary, the `CommonJS` standard uses `require` for importing and `module.exports` and `exports` for exporting.

```javascript
// 1.js
var a  = 1;
var b = function(){
    console.log(a);
}

module.exports = {
    a: a,
    b: b
}
```

```javascript
// 2.js
var m1 = require("./1.js")

console.log(m1.a); // 1
m1.b(); // 1
```

Exporting can also be done using `exports`, but make sure not to overwrite the `exports` pointer. If both `module.exports` and `exports` are used within a file, only `module.exports`'s content will be exported.

### AMD
`AMD` stands for "Asynchronous Module Definition". It is a modularization solution for the browser. Unlike the `CommonJS` standard, which loads modules synchronously, `AMD` loads modules asynchronously to prevent blocking in the browser. All statements dependent on a module are defined within a callback function. These statements are executed only after the module is loaded. `RequireJS` is an implementation of the `AMD` standard.

```javascript
require(['moduleA', 'moduleB', 'moduleC'], function (moduleA, moduleB, moduleC){
    // do something
});

define(['moduleA', 'moduleB', 'moduleC'], function (moduleA, moduleB, moduleC){
    // do something
    return {};
});
```

```javascript
/**
`define` and `require` are the same in dependency management and callback execution. The difference lies in that the callback function of `define` needs to have a `return` statement to return the module object (note that it is an object). This way, the module defined by `define` can be referenced by other modules; the callback function of `require` does not need a `return` statement and cannot be referenced by other modules.
*/

// The `<script>` tag in HTML also supports asynchronous loading
// <script src="require.js" defer async="true" ></script> <!-- The `async` attribute indicates that this file needs to be loaded asynchronously to prevent the webpage from becoming unresponsive. IE does not support this attribute, only `defer`, so it is also included here. -->


### CMD
`CMD` (Common Module Definition) is a standardized output of module definition promoted by `SeaJS` during the process of promotion. It is also a modular asynchronous solution on the browser side. The main differences between `CMD` and `AMD` are:
* For dependent modules, `AMD` is executed in advance (relative to the defined callback function, the `AMD` loader loads and calls all dependencies in advance before executing the callback function); `CMD` is executed with a delay (relative to the defined callback function, the `CMD` loader loads all dependencies, executes the callback function, and when it needs a dependent module, it calls the loaded dependency and returns to the callback function). However, starting from `RequireJS 2.0`, `RequireJS` has also been changed to support delayed execution.
* `AMD` uses dependency preloading (when defining a module, its dependent modules must be declared in advance), while `CMD` uses dependency proximity (dependencies are only loaded when a certain module is needed—loading on demand, returns as needed).


```javascript
define(function(require,exports,module){
  var a = require('require.js');
  a.doSomething();
  return {};
});
```

### ES6
`ES6` implements the functionality of modules at the language standard level in order to become a universal module solution for both browsers and servers. The `ES6` standard uses `export` and `export default` to export modules, and uses `import` to import them. Additionally, in the browser environment, it is possible to use `require` to import modules exported by `export` and `export default`, but it is still recommended to use the standard `import` method. Currently, `ES6` modules are static and cannot achieve on-demand loading, but can be parsed using `babel`, or use `CommonJS`'s `require`. Furthermore, a new specification proposal may possibly incorporate dynamic loading into the standard.
The main differences between `export` and `export default` are:

* `export` can be imported on demand, `export default` cannot.
* `export` allows for multiple exports, `export default` allows for a single one.
* With `export`, variables can be directly exported as expressions, while `export default` cannot.
* When using `export`, the imported module must be enclosed in `{}` at the time of import; `export default` does not require this.

```javascript
// Exporting single features
export let name1, name2, …, nameN; // also var, const
export let name1 = …, name2 = …, …, nameN; // also var, const
export function FunctionName(){...}
export class ClassName {...}

// Exporting a list
export { name1, name2, …, nameN };

// Renaming exports
export { variable1 as name1, variable2 as name2, …, nameN };

// Exporting and renaming through deconstruction
export const { name1, name2: bar } = o;

// Default export
export default expression;
export default function (…) { … } // also class, function*
export default function name1(…) { … } // also class, function*
export { name1 as default, … };

// Exporting a module set
export * from …; // does not set the default export
export * as name1 from …; // Draft ECMAScript® 2O21
export { name1, name2, …, nameN } from …;
export { import1 as name1, import2 as name2, …, nameN } from …;
export { default } from …;
```


```javascript
// name‑the name of the export value that is received from the module being imported
// member, memberN‑multiple members of the export module to be imported by their specified names
// defaultMember‑default export members from the export module
// alias, aliasN‑aliases to rename specific imported members
// module-name‑the name of the module to import. It is a filename
// as‑the renaming of the imported member name ("identifier")
// from‑import from an existing module, script file, etc.
import defaultMember from "module-name";
import * as name from "module-name";
import { member } from "module-name";
import { member as alias } from "module-name";
import { member1 , member2 } from "module-name";
import { member1 , member2 as alias2 , [...] } from "module-name";
import defaultMember, { member [ , [...] ] } from "module-name";
import defaultMember, * as name from "module-name";
import "module-name"; // Executes the global code from the module, but does not actually import any values.
```


```javascript
// 1.js
var a  = 1;
var b = function(){
    console.log(a);
}

var c = 3;
var d = a + c;

var obj = { a,b,c }

export {a,b};

export {c,d};

export default obj;
```


```html
<!-- 3.html needs to start a server service due to browser restrictions -->
<!DOCTYPE html>
<html>
<head>
    <title>ES6</title>
</head>
<body>

</body>
<script type="module">
    import {a,b} from "./1.js"; // Import export
    import m1 from "./1.js"; // Import export default without {}
    import {c} from "./1.js"; // Import export by demand
    
    console.log(a); // 1
    console.log(b); // ƒ (){ console.log(a); }
    console.log(m1); // {a: 1, c: 3, b: ƒ}
    console.log(c); // 3
</script>
</html>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://zhuanlan.zhihu.com/p/22890374
https://www.jianshu.com/p/80354375e1a5
https://juejin.im/post/6844904120088838157
https://www.cnblogs.com/libin-1/p/7127481.html
https://cloud.tencent.com/developer/article/1436328
https://blog.csdn.net/water_v/article/details/78314672
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/import
```