# Strict mode in JavaScript

Strict mode in JavaScript, also known as strict mode, runs under strict conditions. It eliminates some unreasonable and rigorous aspects of JavaScript syntax, reduces some weird behaviors, eliminates some unsafe aspects of code execution, ensures code execution safety, improves engine efficiency, increases running speed, and lays the foundation for future new JavaScript versions.

## Example
Enable strict mode for the entire script file.

```javascript
"use strict";
x = 1; // Uncaught ReferenceError: x is not defined
```
Enable strict mode for a function scope.

```javascript
x = 1;
function s(){
    "use strict";
    y = 1; // Uncaught ReferenceError: y is not defined
}
s();
```

## Restrictions of strict mode

### Not allowed to directly declare global variables
```javascript
// Non-strict mode
x = 1;
console.log(window.x); // 1
```

```javascript
// Strict mode
"use strict";
var x = 1; // Can use var to declare global variables in the global scope
y = 1; // Uncaught ReferenceError: y is not defined
```

### Not allowed to delete variables and functions
```javascript
// Non-strict mode
var x = 1;
delete x; 
console.log(window.x); // undefined
```

```javascript
// Strict mode
"use strict";
var x = 1;
delete x; // Uncaught SyntaxError: Delete of an unqualified identifier in strict mode.
```
### Require unique parameter names for functions
```javascript
// Non-strict mode
function s(a, a){
    console.log(a + a); // 6
}
s(2, 3);
```

```javascript
// Strict mode
"use strict";
function s(a, a){ // Uncaught SyntaxError: Duplicate parameter name not allowed in this context
    console.log(a + a);
}
s(2, 3);
```

### Not allowed to use octal number syntax
```javascript
// Non-strict mode
var x = 010;
console.log(x); // 8
```

```javascript
// Strict mode
"use strict";
var y = 010; // Uncaught SyntaxError: Octal literals are not allowed in strict mode.
var x = 0O10; // Can use the new syntax of octal representation in ES6, prefix 0o or 0O
console.log(x); // 8
```

### Not allowed to use escape characters
```javascript
// Non-strict mode
var x = "\045";
console.log(x); // %
```

```javascript
// Strict mode
"use strict";
var x = "\045"; // Uncaught SyntaxError: Octal escape sequences are not allowed in strict mode.
```

### Not allowed to operate on read-only properties
```javascript
// Non-strict mode
// Operation silently fails, meaning no error is raised and no effect takes place

// Assign a value to a non-writable property
var obj = {};
Object.defineProperty(obj, "x", {value:0, writable:false});
obj.x = 1;
console.log(obj.x); // 0

// Assign a value to a read-only property
var obj = { 
    _x: 0,
    get x() { return this._x; } 
};
obj.x = 1;
console.log(obj.x); // 0

// Assign a value to a new property of a non-extensible object
var obj = {};
Object.preventExtensions(obj);
obj.x = 1;
console.log(obj.x); // undefined
```

```javascript
// Strict mode
// Operation fails and throws an exception
"use strict";

// Assign a value to a non-writable property
var obj = {};
Object.defineProperty(obj, "x", {value:0, writable:false});
obj.x = 1; // Uncaught TypeError: Cannot assign to read only property 'x' of object '#<Object>'

// Assign a value to a read-only property
var obj = { 
    _x: 0,
    get x() { return this._x; } 
};
obj.x = 1; // Uncaught TypeError: Cannot set property x of #<Object> which has only a getter

// Assign a value to a new property of a non-extensible object
var obj = {};
Object.preventExtensions(obj);
obj.x = 1; // Uncaught TypeError: Cannot add property x, object is not extensible
```

### Not allowed to name variables with reserved keywords
```javascript
// Non-strict mode
var eval = 1;
console.log(eval); // 1
```

```javascript
// Strict mode
"use strict";
var eval = 1; // Uncaught SyntaxError: Unexpected eval or arguments in strict mode
```

### Not allowed to use the with keyword
```javascript
// Non-strict mode
var obj = { x:0 };
with(obj) {
    x = 1;
}
```

```javascript
// Strict mode
"use strict";
var obj = { x:0 };
with(obj) { // Uncaught SyntaxError: Strict mode code may not include a with statement
    x = 1;
}
```

### Declaring variables with eval cannot be used outside
```javascript
// Non-strict mode
eval("var x = 0");
console.log(x); // 0
```

```javascript
// Strict mode
"use strict";
eval("var x = 0"); // eval scope
console.log(x); // Uncaught ReferenceError: x is not defined
```

### arguments retains original parameters
```javascript
// Non-strict mode
function s(a, b){
    a = 2;
    console.log(arguments[0], arguments[1]); // 2 2
}
s(1, 2);
```

```javascript
// Strict mode
"use strict";
function s(a, b){
    a = 2;
    console.log(arguments[0], arguments[1]); // 1 2
}
s(1, 2);
```

### Limitations of 'this'
In strict mode, the value passed to a function through `this` is not coerced into an object. For a regular function, `this` will always be an object: whether `this` is originally an object when called; when the function is called with a boolean value, a string, or a number, `this` inside the function will be encapsulated as an object; or when the function is called with `undefined` or `null`, `this` represents the global object (using the `call`, `apply`, or `bind` method to specify a specific `this`). This automatic conversion to an object is not only a performance loss but also exposes the global object in the browser, posing a security risk because the global object provides a way to access functions that a secure JavaScript environment must restrict. For a function in strict mode, the specified `this` is no longer encapsulated as an object, and if `this` is not specified, its value is `undefined`.
```javascript
// Non-strict mode
function s(){
    console.log(this); // Window ...
}
s();
```

```javascript
// Strict mode
"use strict";
function s(){
    console.log(this); // undefined
}
s();
```

### Prohibiting access to the call stack
In strict mode, widely implemented `ECMAScript` extensions can no longer roam the stack of `JavaScript`. In normal mode, when using these extensions, when a function called `fun` is being called, `fun.caller` is the last function to call `fun`, and `fun.arguments` contains the formal parameters used in the call to `fun`. Both of these extension interfaces are problematic for secure JavaScript because they allow secure code to access privileged functions and their (often unprotected) formal parameters. If `fun` is in strict mode, then `fun.caller` and `fun.arguments` are both non-deletable properties and will result in an error when storing or accessing their values.
```javascript
// Non-strict mode
function ss(){
    console.log(ss.caller); // ƒ s(){ ss(); }
    console.log(ss.arguments); // Arguments [callee: ƒ, Symbol(Symbol.iterator): ƒ]
}
function s(){
    ss();
}
s();
```

```javascript
// Strict mode
"use strict";
function ss(){
    console.log(ss.caller); // Uncaught TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
    console.log(ss.arguments); // Uncaught TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
}
function s(){
    ss();
}
s();
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```


## References

```
https://www.runoob.com/js/js-strict.html
https://www.cnblogs.com/xumqfaith/p/7841338.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode
```