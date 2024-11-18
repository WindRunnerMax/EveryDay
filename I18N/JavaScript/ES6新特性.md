# ES6 Features

A brief introduction to the common new features of ES6, all features can be found at [Ecma-International](https://www.ecma-international.org/ecma-262/6.0/), [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla), [ES6 Entrance](https://es6.ruanyifeng.com/), [ES6 Tutorial](https://www.runoob.com/w3cnote/es6-tutorial.html)

`ES6`, the abbreviation of `ECMAScript 6.0`, is the next version standard of `JavaScript`, released in June 2015. The relationship between `ECMAScript` and `JavaScript` is that the former is the specification of the latter, and the latter is one of the implementations of the former.

## let and const
`ES2015 (ES6)` added two important `JavaScript` keywords: `let` and `const`.
`ES6` specifies that if `let` or `const` exists in a code block, the code block will form a **closed scope** for the variables declared by these commands from the **beginning of the block**. Using a variable before declaring it in a code block will result in an error, known as **temporal dead zone**.
Block-level scope in `ES6` must have curly braces. If there are no curly braces, the `JavaScript` engine assumes that there is no block-level scope.
* `let` is suitable for the `for` loop counter.
* `let` and `const` can only be declared once, while `var` can be declared multiple times.
* `var` undergoes variable hoisting, and so do `let` and `const`, but in a different way.
* `const` declares a read-only constant, and once declared, the value of the constant cannot be changed.
* Variables declared with `let` and `const` in the global scope will not be attached to the `window`.
* Variables declared with `let` and `const` are only effective within the code block where they are declared, forming a block-level scope.
* `const` actually guarantees not the immutability of the variable's value, but rather the immutability of the data saved in the memory address pointed to by the variable. For simple data types like `number`, `string`, and `boolean`, the value is saved at the memory address pointed to by the variable, so the `const` declaration of simple type variables is equivalent to a constant. However, for reference types like `object`, `array`, and `function`, the memory address pointed to by the variable actually saves a pointer to the actual data, so `const` can only guarantee that the pointer is fixed, and whether the data structure pointed to by the pointer changes cannot be controlled.

## Destructuring assignment
`ES6` allows values to be extracted from arrays and objects according to a certain pattern and assigned to variables, which is called destructuring assignment.

```javascript
let [a, b, c] = [1, 2, 3]; // Basic
let [a, [[b], c]] = [1, [[2], 3]]; // Nested
let [a, , b] = [1, 2, 3]; // Ignoring
let [a = 1, b] = []; // a = 1, b = undefined // Incomplete destructuring
let [a, ...b] = [1, 2, 3]; // Rest operator
let [a, b, c, d, e] = 'hello'; // String, etc.
let { a, b } = { a: 'aaa', b: 'bbb' }; // Destructuring of object model, the keys before and after must correspond.
```

## Symbol
`ES6` introduces a new primitive data type `Symbol`, representing a unique value. Its greatest usage is to define the unique property names of objects.
In addition to the data types of `Number`, `String`, `Boolean`, `Object`, `null` and `undefined`, `ES6` also adds `Symbol`.

```javascript
let s1 = Symbol("s");
let s2 = Symbol("s");
console.log(s1 === s2); //false
```

## Spread/Rest Operator
`Spread` is used to pass an array directly as parameters to a function.

```javascript
var s = ['1', '2', '3'];
function f(s1,s2,s3){
    console.log(`Hello ${s1},${s2},${s3}`); // ES6 added variables and expressions in strings
}
f(...s); // Hello 1,2,3
```
`Rest` is used to pass arrays as function parameters.

```javascript
function f(...args){
    console.log(args);
}
f(1,2,3,4,5); //[1, 2, 3, 4, 5]
```

## Arrow function
In `ES6`, arrow functions are a simplified form of functions. Parameters are wrapped in parentheses, followed by `=>`, and then the function body. It is important to note that arrow functions inherit the current context of the `this` keyword.

```javascript
var add = (a, b) => a + b;
var show = a => console.log(a);
var test = (a,b,c) => {console.log(a,b,c);return a+b+c;}
add(1,1); //2
show(1); //1
test(1,1,1); //1 1 1
```

## Default Parameters

```javascript
function f(a = 1){
    console.log(a);
}
f(); //1
f(11); //11
```

## String Extension
Prior to `ES6`, to determine if a string contained a substring, the `indexOf` method was used. `ES6` adds substring recognition methods.
* `includes()` returns a boolean value indicating whether the specified string is found.
* `startsWith()` returns a boolean value indicating whether the specified string is at the beginning of the original string.
* `endsWith()` returns a boolean value indicating whether the specified string is at the end of the original string.
* `repeat()` returns a new string representing the original string repeated a specified number of times.
* `padStart()` returns a new string representing the original string padded from the beginning with the specified string.
* `padEnd()` returns a new string representing the original string padded from the end (right side) with the specified string.

## Numerical Expansion
* The new notation for binary representation is prefixed with `0b` or `0B`, for example`console.log(0B11 === 3); //true`.
* The new notation for octal representation is prefixed with `0o` or `0O`, for example `console.log(0O11 === 9); //true`.
* The constant `Number.EPSILON` represents the difference between `1` and the smallest floating-point number greater than `1`, with a value close to `2.2204460492503130808472633361816E-16`.
* `Number.MAX_SAFE_INTEGER` represents the largest safe integer that can be accurately represented in JavaScript.
* `Number.isFinite()` is used to check if a number is finite, i.e., not `Infinity`.
* `Number.parseInt()` is gradually being deprecated as a global method, used for modularization of global variables, and its behavior has not changed.

## Array Expansion
* `Array.of()` forms an array with all the values in the parameters as elements.
* `Array.from()` converts an array-like or iterable object into an array.
* `find()` finds the element in the array that meets the condition, returning the first element if there are multiple elements that meet the condition.
* `findIndex()` finds the index of the element in the array that meets the condition, returning the index of the first element if multiple elements meet the condition.
* `fill()` fills the content of array elements at a certain range index with a single specified value.
* `copyWithin()` modifies the elements of the array at a certain range index to the elements at another specified range index in the array.
* `entries()` iterates through key-value pairs.
* `keys()` iterates through key names.
* `values()` iterates through key values.
* `includes()` checks if the array contains a specified value.
* `flat()` converts a nested array into a one-dimensional array.
* `flatMap()` first processes each element in the array, and then executes the `flat()` method on the array.

## Iterator
*  `Symbol.iterator` is a unified interface that allows various data structures to be conveniently accessed.
*  `for of` is a loop introduced in ES6, used to replace `for..in` and `forEach()`.

## Class
`ES6` provides a syntax closer to traditional languages, introducing the concept of `class` as a template for objects. Using the `class` keyword, classes can be defined similarly to most traditional languages. However, `ES6`'s `class` is not a new object inheritance model, it is merely syntactic sugar for the prototype chain.

```javascript
class Me {
  constructor() {
    console.log("constructor");
  }
  study() {
    console.log('study');
  }
}

console.log(typeof Me); //function
let me = new Me(); //constructor
me.study(); //study
```


## Promise Object
`Promise` is a solution for asynchronous programming.  
In terms of syntax, a `Promise` is an object from which the result of an asynchronous operation can be obtained.  
The asynchronous operation of a `Promise` has three states: `pending`, `fulfilled`, and `rejected`. Apart from the result of the asynchronous operation, no other operation can change this state.  
The `then` method takes two functions as parameters. The first parameter is the callback when the `Promise` is fulfilled, and the second parameter is the callback when the `Promise` is rejected. Only one of the two functions will be called.
```javascript
const p1 = new Promise(function(resolve,reject){
    resolve('resolve');
}); 
const p2 = new Promise(function(resolve,reject){
    reject('reject');
});
p1.then(function(v){
    console.log(v); //resolve
});
p2.then(function(v){
    console.log(v);
},
function(v){
    console.log(v); //reject
});
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```
