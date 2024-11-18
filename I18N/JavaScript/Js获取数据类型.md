# Getting the Data Type in JavaScript
`JavaScript` has seven basic types: `String`, `Number`, `Boolean`, `Null`, `Undefined`, `Symbol`, `Object`, the first six are primitive data types, and `Object` is a reference type.

## typeof
`typeof(operand)` or `typeof operand`, `operand` is an expression that represents an object or a primitive value, and its type will be returned.

### Rules
* `String`: `"string"`
* `Number`: `"number"`
* `Boolean`: `"boolean"`
* `Null`: `"object"`
* `Undefined`: `"undefined"`
* `Symbol`: `"symbol"`
* `BigInt`: `"bigint"`
* `Function Object`: `"function"`
* `Object`: `"Object"`

### Examples

```javascript
console.log(typeof(a)); // undefined
console.log(typeof("s")); // string
console.log(typeof(1)); // number
console.log(typeof(true)); // boolean
console.log(typeof(new String("s"))); // object
console.log(typeof(new Number(1))); // object
console.log(typeof(new Boolean(true))); // object
console.log(typeof(null)); // object
console.log(typeof(undefined)); // undefined
console.log(typeof(Symbol())); // symbol
console.log(typeof(Object(Symbol())); // object
console.log(typeof(1n)); // bigint
console.log(typeof(Object(BigInt(1n))); // object
console.log(typeof(function() {})); // function
console.log(typeof([])); // object
console.log(typeof(new Date())); // object
console.log(typeof(/regex/)); // object
console.log(typeof({})); // object
```

## instanceof
The `instanceof` operator is used to check if the `prototype` property of a constructor appears in the prototype chain of an instance object. In `Js`, everything is an object, or at least treated as an object. However, when using the literal declaration of primitive data types, although they are not directly object types, a temporary wrapping object will appear when calling methods on variables of primitive data types, which allows calling the constructor's prototype methods. Therefore, when using `instanceof`, `false` will be returned for the literal declarations of `String`, `Number`, `Boolean`, `Symbol`, `BigInt`.

### Examples
```javascript
console.log("s" instanceof String); // false
console.log(1 instanceof Number); // false
console.log(true instanceof Boolean); // false
console.log(new String("s") instanceof String); // true
console.log(new Number(1) instanceof Number); // true
console.log(new Boolean(true) instanceof Boolean); // true
console.log(null instanceof Object); // false 
console.log(undefined instanceof Object); // false
console.log(Symbol() instanceof Symbol); // false
console.log(Object(Symbol()) instanceof Symbol); // true
console.log(1n instanceof BigInt); // false
console.log(Object(1n) instanceof BigInt); // true
console.log(Symbol() instanceof Symbol); // false
console.log((function() {}) instanceof Function); // true
console.log([] instanceof Array); // true
console.log(new Date() instanceof Date); // true
console.log(/regex/ instanceof RegExp); // true
console.log({} instanceof Object); // true
```

## Object.prototype.toString
By using the `toString` method of the `Object` prototype to determine the type, for newly created objects of different types, the `toString` method will usually be redefined, making it impossible to reach `Object.prototype.toString` along the prototype chain. It can be invoked using `call` or `apply` to determine the type.

### Example
```javascript
console.log(Object.prototype.toString.call("s")); // [object String]
console.log(Object.prototype.toString.call(1)); // [object Number]
console.log(Object.prototype.toString.call(true)); // [object Boolean]
console.log(Object.prototype.toString.call(new String("s"))); // [object String]
console.log(Object.prototype.toString.call(new Number(1))); // [object Number]
console.log(Object.prototype.toString.call(new Boolean(true))); // [object Boolean]
console.log(Object.prototype.toString.call(null)); // [object Null] 
console.log(Object.prototype.toString.call(undefined)); // [object Undefined]
console.log(Object.prototype.toString.call(Symbol())); // [object Symbol]
console.log(Object.prototype.toString.call(Object(Symbol())); // [object Symbol]
console.log(Object.prototype.toString.call(1n)); // [object BigInt]
console.log(Object.prototype.toString.call(Object(BigInt(1n))); // [object BigInt]
console.log(Object.prototype.toString.call(function() {})); // [object Function]
console.log(Object.prototype.toString.call([])); // [object Array]
console.log(Object.prototype.toString.call(new Date())); // [object Date]
console.log(Object.prototype.toString.call(/regex/)); // [object RegExp]
console.log(Object.prototype.toString.call({})); // [object Object]
```


## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```


## References

```
https://www.cnblogs.com/sban/p/10256412.html
https://www.cnblogs.com/yucheng6/p/9747313.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures
```