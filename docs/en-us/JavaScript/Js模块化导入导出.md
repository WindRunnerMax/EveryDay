# JavaScript Module Import and Export
`CommonJs`, `AMD`, `CMD`, `ES6` are specifications used for modular definitions, aimed at standardizing the introduction of modules, handling of dependencies between modules, solving naming conflicts, and using modular solutions to decompose complex systems into more reasonable code structures with higher maintainability.

## CommonJS
`CommonJS` is the specification for `NodeJs` server-side modules. According to this specification, each file is a module with its own scope. Variables, functions, and classes defined within a file are private and not visible to other files. The `module` variable inside each module represents the current module. This variable is an object, and its `exports` property is the external interface. Loading a module actually means loading its `exports` property. In summary, the `CommonJS` specification uses `require` for importing and `module.exports` or `exports` for exporting.

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

It's also possible to use `exports` for exporting, but never overwrite the reference of `exports` because `exports` is just a pointer that points to the memory area of `module.exports`. Therefore, overwriting the `exports` changes the pointer and renders the module unable to be exported. In simple terms, `exports` provides a convenient way for writing, but it all comes down to using `module.exports` for exporting. Additionally, if both `module.exports` and `exports` are used in a file, only the content of `module.exports` will be exported.

## AMD
`AMD` stands for Asynchronous Module Definition and is a modularization solution for the browser. While the `CommonJS` specification introduces modules with synchronous loading, which is not an issue for the server-side as modules are stored on the disk and can wait for synchronous loading to complete, in the browser, modules are loaded via the network. Synchronous blocking loading of modules in the browser could lead to the browser's page becoming unresponsive. `AMD` solves this by loading modules asynchronously, where the loading of a module does not affect the execution of subsequent statements. All statements depending on this module are defined within a callback function, which will only run after the module is loaded. `RequireJS` is an implementation of the `AMD` specification.

```javascript
require(['moduleA', 'moduleB', 'moduleC'], function (moduleA, moduleB, moduleC){
    // do something
});

define(['moduleA', 'moduleB', 'moduleC'], function (moduleA, moduleB, moduleC){
    // do something
    return {};
});
```

## CMD
`CMD` stands for Common Module Definition and is SeaJS' standardized output in the promotion process. It is also a modular asynchronous solution for the browser. The main differences between `CMD` and `AMD` are: 
* For dependent modules, `AMD` is executed in advance (relative to the definition callback function, `AMD` loaders pre-load and invoke all dependencies before executing the callback function), while `CMD` is executed with delay (relative to the definition callback function, `CMD` loaders load all dependencies and then execute the callback function. When needing a dependent module, it is then called upon to be loaded and returned to the callback function). However, starting from `RequireJS 2.0`, it can also be delayed.
* `AMD` has dependency preloading (the dependent modules are declared at the time of defining the module), while `CMD` has dependency proximity (the modules are only required when they are used - on-demand loading, meaning they are loaded and returned to the callback function when needed).

```javascript
define(function(require,exports,module){
　　var a = reuire('require.js');
　　a.dosomething();
　　return {};
});
```

## ES6
At the language standard level, `ES6` implements module functionality and is designed to be a universal module solution for browsers and servers. The `ES6` standard uses `export` and `export default` for exporting modules and `import` for importing them. Additionally, in the browser environment, it is possible to use `require` to import modules exported using `export` and `export default`, but it is still recommended to use the `import` standard for importing modules.  
A few key differences between `export` and `export default` are:
* `export` allows for selective imports, while `export default` does not.
* Multiple `export`s are possible, but there can only be one `export default`.
* `export` can directly export variable expressions, while `export default` cannot.
* When using `export`, curly braces `{}` are required during import, while `export default` does not require them.

```javascript
// Export a single feature
export let name1, name2, …, nameN; // also var, const
export let name1 = …, name2 = …, …, nameN; // also var, const
export function FunctionName(){...}
export class ClassName {...}

// Export a list
export { name1, name2, …, nameN };

// Rename export
export { variable1 as name1, variable2 as name2, …, nameN };

// Destructuring export and renaming
export const { name1, name2: bar } = o;

// Default export
export default expression;
export default function (…) { … } // also class, function*
export default function name1(…) { … } // also class, function*
export { name1 as default, … };

// Export a module collection
export * from …; // does not set the default export
export * as name1 from …; // Draft ECMAScript® 2O21
export { name1, name2, …, nameN } from …;
export { import1 as name1, import2 as name2, …, nameN } from …;
export { default } from …;
```

```javascript
// name - the name of the export value received from the module to be imported
// member, memberN - multiple members from the exported module, importing specific names
// defaultMember - importing default export members from the exported module
// alias, aliasN - alias, renaming of specified import members
// module-name - the module to be imported. It is a file name
// as - renaming the imported member name ("identifier")
// from - import from an existing module, script file, etc.
import defaultMember from "module-name";
import * as name from "module-name";
import { member } from "module-name";
import { member as alias } from "module-name";
import { member1 , member2 } from "module-name";
import { member1 , member2 as alias2 , […] } from "module-name";
import defaultMember, { member [ , […] ] } from "module-name";
import defaultMember, * as name from "module-name";
import "module-name"; // Runs the global code in the module, but actually does not import any values.
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
<!-- 3.html requires launching a server service due to browser restrictions -->
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
    import {c} from "./1.js"; // Import export on demand
    
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


## References

```
https://segmentfault.com/a/1190000010426778
https://www.cnblogs.com/leftJS/p/11073481.html
https://www.cnblogs.com/zhoulujun/p/9415407.html
https://www.cnblogs.com/zhoulujun/p/9415407.html
https://www.cnblogs.com/moxiaowohuwei/p/8692359.html
```