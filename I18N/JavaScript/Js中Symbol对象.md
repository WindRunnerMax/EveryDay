
# The Symbol Object in JavaScript

`ES6` introduces a new primitive data type `Symbol`, which represents a unique value. Its main purpose is to define the unique property name for objects. The `Symbol()` function returns a value of type `symbol`, which has static properties and methods. Its static properties expose several built-in member objects, while its static methods expose global symbol registration, and are similar to built-in object classes. However, as a constructor, it is not complete, since it does not support syntax like `new Symbol()`. Each `symbol` value returned from `Symbol()` is unique, and a `symbol` value can be used as an object property identifier.

## Description
Every `Symbol` value is unequal, thus using `Symbol` as an object property name ensures that properties are not duplicated. This data type is typically used as a key value for an object property, such as when wanting to make an object property key a private value. `symbol` keys exist in various built-in `JavaScript` objects, and custom classes can also be created in this way to have private members. The `symbol` data type serves a very clear purpose, and its single functional advantage stands out. An instance of `symbol` can be assigned to a left-hand variable and its type can be checked through identifiers, representing its entirety of features. A value with the data type `symbol` can be referred to as a symbol type value. In the `JavaScript` runtime environment, a symbol type value is created by invoking the `Symbol()` function, which dynamically generates an anonymous, unique value. The only reasonable use of the `Symbol` type is to store the value of `symbol` in a variable, which can then be used to create object properties.

```javascript
let s = Symbol();
let s1 = Symbol("s");
let s2 = Symbol("s");
console.log(s === s1); // false
console.log(s1 === s2); // false

let obj = {};
let prop = Symbol();
obj[prop] = 1;
console.log(obj[prop]); // 1
console.log(Object.keys(obj)); // []
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol()]
console.log(Reflect.ownKeys(obj)); // [Symbol()]
```

## Properties
* `Symbol.length`: The length property, with a value of `0`.
* `Symbol.prototype`: The prototype of the `symbol` constructor.
* `Symbol.iterator`: Returns a method for the default iterator of an object, used by `for...of`.
* `Symbol.match`: Method used for matching strings, and determining if an object can be used as a regular expression, used by `String.prototype.match()`.
* `Symbol.replace`: Method for replacing substrings in matching strings, used by `String.prototype.replace()`.
* `Symbol.search`: Method for returning the index in a string that matches a regular expression, used by `String.prototype.search()`.
* `Symbol.split`: Method for splitting a string at the index of a matching regular expression, used by `String.prototype.split()`.
* `Symbol.hasInstance`: Method to determine if an object recognized by a constructor object is an instance of it, used by `instanceof`.
* `Symbol.isConcatSpreadable`: Boolean value indicating whether an object should be flattened into its array elements, used by `Array.prototype.concat()`.
* `Symbol.unscopables`: The value of an object with owned and inherited property names being excluded from objects associated with the environment binding.
* `Symbol.species`: A constructor function used to create derived objects.
* `Symbol.toPrimitive`: A method to convert an object to a primitive data type.
* `Symbol.toStringTag`: The default descriptive string value for an object, used by `Object.prototype.toString()`.

## Methods

### Symbol.for()
`Symbol.for(key)`  
The `Symbol.for(key)` method will find the corresponding `symbol` in the runtime symbol registry based on the given key, and return it if found. Otherwise, it will create a new `symbol` associated with the key and place it in the global symbol registry. Unlike `Symbol()`, the `symbol` created using `Symbol.for()` is placed in the global symbol registry. However, `Symbol.for()` does not always create a new `symbol`. It first checks if the given key is already in the registry. If it is, it returns the previously stored one, otherwise it creates a new one.
* `key`: A string serving as the key associated with a `symbol` in the symbol registry, also serving as the description of the `symbol`.

```javascript
var s1 = Symbol.for();
var s2 = Symbol.for("s");
var s3 = Symbol.for();
var s4 = Symbol.for("s");
console.log(s1 === s3); // true
console.log(s2 === s4); // true
```

### Symbol.keyFor()
`Symbol.keyFor(sym)`  
The `Symbol.keyFor(sym)` method is used to retrieve the key associated with a certain `symbol` in the global symbol registry. If the `symbol` is found in the global registry, its key value is returned as a string, otherwise it returns `undefined`. 
* `sym`: The required parameter, representing the `Symbol` for which to find the key value.

```javascript
var s1 = Symbol();
var s2 = Symbol.for("s");
var key1 = Symbol.keyFor(s1);
var key2 = Symbol.keyFor(s2);
console.log(key1); // undefined
console.log(key2); // s
```

### Symbol.prototype.toString()
`symbol.toString()`  
The `toString()` method returns the string representation of the current `symbol` object. The `Symbol` object has its own `toString` method, thus overriding `Object.prototype.toString()` on the prototype chain. The original value of `symbol` cannot be converted to a string. To do so, it must first be converted to its wrapper object, and then the `toString()` method can be called.

```javascript
var s = Symbol.for("s");
console.log(s.toString()); // Symbol(s)
console.log(Object(Symbol("s")).toString()); // Symbol(s)
```

### Symbol.prototype.valueOf()
`symbol.valueOf()`  
The `valueOf()` method returns the primitive value of the current `symbol` object. In JavaScript, although most types of objects will automatically and implicitly call their `valueOf()` method or `toString()` method to convert themselves into a primitive value under some operations, `symbol` objects won't do so. `symbol` objects cannot be implicitly converted into corresponding primitive values.

```javascript
var s = Symbol.for("s");
console.log(s.valueOf()); // Symbol(s)
```

### Symbol.prototype\[@@toPrimitive\]
`Symbol()[Symbol.toPrimitive](hint)`  
The `[@@toPrimitive]()` method converts the `Symbol` object into a primitive value, and the `hint` parameter is not used.

```javascript
var s = Symbol.for("s");
console.log(s[Symbol.toPrimitive]()); // Symbol(s)
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.runoob.com/w3cnote/es6-symbol.html
https://developer.mozilla.org/zh-CN/docs/Glossary/Symbol
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol
```