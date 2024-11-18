# Function and Object
In `JavaScript`, there are two top-level objects `Function` and `Object`. `Object` is the base class of all objects, and all constructor functions are instances of the `Function` object at the same time.

## Object
All objects in `JavaScript` are derived from `Object`. All objects inherit methods and properties from `Object.prototype`, although they may be overridden, for example, other constructor functions implement their own `toString()` method in the prototype. Changes to the `Object` prototype object will propagate to all objects unless these overridden properties and methods along the prototype chain are modified.

```javascript
// Define three objects
var a = function(){} // constructor function object
var b = new Array(1); // array object
var c = new Number(1); // number object // wrapper object

// Check the prototype chain
console.log(a.__proto__.__proto__ === Object.prototype); // true
console.log(b.__proto__.__proto__ === Object.prototype); // true
console.log(c.__proto__.__proto__ === Object.prototype); // true

// Split the references
console.log(a.__proto__ === Function.prototype); // true
console.log(Function.prototype.__proto__ === Object.prototype); // true
console.log(b.__proto__ === Array.prototype); // true
console.log(Array.prototype.__proto__ === Object.prototype); // true
console.log(c.__proto__ === Number.prototype); // true
console.log(Number.prototype.__proto__ === Object.prototype); // true

// Using instanceof is actually checking the prototype chain
// The instanceof operator checks whether the prototype property of a constructor appears in the prototype chain of an instance object
console.log(a instanceof Object); // true
console.log(b instanceof Object); // true
console.log(c instanceof Object); // true
```

## Function
All constructor functions in `JavaScript` inherit from `Function`, including the `Object` constructor function. The `Function` constructor function also inherits from itself, and of course, `Function` also inherits from `Object.prototype`, it can be said that the `Object.prototype` existed first, and `Object.prototype` constructed `Function.prototype`, and then `Function.prototype` constructed `Object` and `Function`.

```javascript
// Constructor function object
var a = function(){} // constructor function object

// Check the prototype chain
console.log(a.__proto__ === Function.prototype); // true
console.log(Object.__proto__ === Function.prototype); // true
console.log(Function.__proto__ === Function.prototype); // true
console.log(Function.prototype.__proto__ === Object.prototype); // true

// Using instanceof 
console.log(a instanceof Function); // true
console.log(Object instanceof Function); // true
console.log(Function instanceof Function); // true
```

## Summary
* All objects inherit from `Object`, and inherit methods and properties from `Object.prototype`.
* All constructor functions, including `Object` and `Function`, inherit from `Function`, and ultimately inherit from `Object`.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.cnblogs.com/tiancai/p/7463252.html
https://www.cnblogs.com/yf2196717/p/10989466.html
https://www.cnblogs.com/ioveNature/p/6880176.html
https://www.cnblogs.com/tiffanybear/p/11320651.html
https://blog.csdn.net/backee/article/details/83378772
https://blog.csdn.net/weixin_34237596/article/details/88026745
```