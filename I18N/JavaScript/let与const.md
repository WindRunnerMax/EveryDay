# let and const
The `ES2015 (ES6)` introduced two important `JavaScript` keywords: `let` and `const`.

## Block-level Scope
If there is `let` or `const` inside a code block, the code block will form a closed scope for the variables declared by these commands from the beginning of the block.

```javascript
{
    let a = 1;
    var b = 2;
    function s(){return a;}
    console.dir(s);
    /*
      ...
      [[Scopes]]: Scopes[2]
        0: Block {a: 1}
        1: Global ...
    */
}
// a cannot be used here, as it is block-scoped
// b can be used here, as it is globally scoped
```
`[[Scopes]]` is an object that saves the function's scope chain and is an internal property of the function that cannot be directly accessed. In `[[Scopes]]`, we can see the appearance of a `Block` block-level scope. This makes `let` especially suitable for use inside `for` loops. Before the introduction of the `let` keyword in `ECMAScript 2015`, there were only function scope and global scope. Functions could nest within function scopes, but there was no true block scope within `for` loops, leading to a common closure creation problem.

```javascript
function counter(){
    var arr = [];
    for(var i = 0 ; i < 3 ; ++i){
        arr[i] = function(){
            return i;
        }
    }
    return arr;
}

var coun = counter();
for(var i = 0 ; i < 3 ; ++i){
    console.log(coun[i]()); // 3 3 3
}
```
The output is `3 3 3` instead of the expected `0 1 2`. The reason is that when these three closures are created during the loop, they share the same lexical scope. This scope, due to the existence of an `i` declared with `var`, has a function scope. By the time the closure function is executed, the loop has already finished, and `i` has been assigned the value of `3`, resulting in the printout `3 3 3`. This problem can be solved by using the `let` keyword to declare `i` and create block-level scope.

```javascript
function counter(){
    var arr = [];
    for(let i = 0 ; i < 3 ; ++i){
        arr[i] = function(){
            return i;
        }
    }
    return arr;
}

var coun = counter();
for(var i = 0 ; i < 3 ; ++i){
    console.log(coun[i]()); // 0 1 2
}
```
Alternatively, the issue can also be resolved by using an anonymous function to create a function scope.

```javascript
function counter(){
    var arr = [];
    for(var i = 0 ; i < 3 ; ++i){
        (function(i){
            arr[i] = function(){
                return i;
            }
        })(i);
    }
    return arr;
}

var coun = counter();
for(var i = 0 ; i < 3 ; ++i){
    console.log(coun[i]()); // 0 1 2
}
```
## One-time Declaration
Within the same scope, `let` and `const` can only be declared once, while `var` can be declared multiple times.

```javascript
let a = 1;
let a = 1; //Uncaught SyntaxError: Identifier 'a' has already been declared

const b = 1;
const b = 1; //Uncaught SyntaxError: Identifier 'b' has already been declared
```

## Temporal Dead Zone
When using `let` and `const` to create block-level scope, the code block will form a closed scope for the variables declared by these commands from the beginning of the block. Within the code block, using a variable before its declaration will result in an error, known as the temporal dead zone.

```javascript
{
    console.log(a); // Uncaught ReferenceError: Cannot access 'a' before initialization
    let a =1;
}
```

## Variable Hoisting
`let` and `const` have variable hoisting as well. In the `ES6` documentation, there is the term `var/let hoisting`, indicating that the official documentation explains that `let` and `var` are the same, both have variable hoisting, but the variable hoisting of `let` is different from that of `var`.
```
The "creation" process of `let` is hoisted, but the initialization is not hoisted.
Both the "creation" and "initialization" of `var` are hoisted.
Both the "creation", "initialization", and "assignment" of `function` are hoisted.
```
A convincing example found on `stackoverflow` is as follows:
```javascript
x = "global";
// function scope:
(function() {
    x; // not "global"

    var/let/… x;
}());
// block scope (not for `var`s):
{
    x; // not "global"

    let/const/… x;
}
```
In `js`, regardless of the declaration form (`var`, `let`, `const`, `function`, `function*`, `class`), hoisting occurs. However, the difference is that the declarations of `var`, `function`, and `function*` are initialized to `undefined` during hoisting, so when accessing these variables, no `ReferenceError` exception will be thrown. On the other hand, the variables declared with `let`, `const`, and `class` are hoisted without being initialized, and these variables are said to be in the "temporal dead zone", hence accessing them will result in a `ReferenceError` exception, making it appear as if they were not hoisted at all.

```
https://blog.csdn.net/jolab/article/details/82466362
https://www.jianshu.com/p/0f49c88cf169
https://stackoverflow.com/questions/31219420/are-variables-declared-with-let-or-const-not-hoisted-in-es6
```

## window
When using `var` to directly declare variables or methods in the global scope, they will be attached to the `window` object, while the variables or methods declared using `let` and `const` will be saved in the `Script` scope.

```javascript
var a = 1;
let b = 2;
const c = 3;

console.log(window.a); // 1
console.log(window.b); // undefined
console.log(window.c); // undefined
```
```javascript
let a = 1;
{
    let b = 2;
     function s(){return a + b;}
     console.dir(s);
     /*
      ...
      [[Scopes]]: Scopes[3]
        0: Block {b: 2}
        1: Script {a: 1}
        2: Global ...
    */
}
```

## Initialization
`var` and `let` can be declared without initializing, whereas `const` must be initialized.
```javascript
var a;
let b;
const c; //Uncaught SyntaxError: Missing initializer in const declaration
```

## Constant
`const` is used to declare a read-only constant, and once initialized, its value cannot be changed.

```javascript
const a = 1;
a = 2; // Uncaught TypeError: Assignment to constant variable.
```
In fact, `const` ensures not the immutability of the variable's value, but that the data stored at the memory address pointed to by the variable cannot be changed. For simple types like `number`, `string`, `boolean`, and `Symbol`, the value is stored at the memory address pointed to by the variable, making `const` of these simple type variables equivalent to constants. For complex types like `object`, `array`, and `function`, the variable points to the memory address where a pointer to the actual data is stored, so `const` can only guarantee that the pointer is fixed, and it cannot control whether the data structure pointed to by the pointer changes.

```javascript
const a = {};
console.log(a); // {}
a.s = function(){}
console.log(a); // {s: ƒ}
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference
```
ES6 Features https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/ES6%E6%96%B0%E7%89%B9%E6%80%A7.md
Js Variable Hoisting https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/JS%E5%8F%98%E9%87%8F%E6%8F%90%E5%8D%87.md
```