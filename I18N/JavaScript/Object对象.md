# Object Object
The `Object` object is one of the two top-level objects in JavaScript, providing methods for direct invocation and prototype chain inheritance.

## Object.assign
The `Object.assign()` method is used to copy the values of all enumerable properties from one or more source objects to a target object. It will return the target object. This article assumes that only reference types have the concepts of shallow copy and deep copy, so the copying method of `Object.assign` is shallow copy. If there is an assumption that basic data types also have the concepts of shallow copy and deep copy, then the copy of basic data types can be understood as a deep copy by value. Therefore, it is also correct to say that the first layer of `Object.assign` is deep copy and the second layer or later is shallow copy.

### Example
`Object.assign(target, ...sources)`  
`target`: Target object.  
`sources`: Source object.  
Returns a reference to the target object `target`.  

```javascript
var target = {};
var source1 = {a: 1};
var source2 = {b: 11};
var merge = Object.assign(target, source1, source2);
console.log(merge); // {a: 1, b: 11}
console.log(target); // {a: 1, b: 11}
console.log(target === merge); // true
```

## Object.create
The `Object.create()` method creates a new object using an existing object to provide the `__proto__` of the newly created object.

### Example
`Object.create(proto[, propertiesObject])`  
`proto`: The prototype object of the newly created object.  
`propertiesObject`: Optional. If specified as an object, it is the property descriptor of the non-enumerable (by default) properties to be added to the newly created object and the corresponding property names, that is, its own defined properties rather than enumerable properties on its prototype chain, these properties correspond to the second parameter of `Object.defineProperties()`.  
Returns a new object with the specified prototype object and attributes.

```javascript
var proto = {a: 1};
var target = Object.create(proto);
console.log(target); // {} // A new object is created
console.log(target.__proto__ === proto); // true // The __proto__ of the new object points to the original object
console.log(target.a); // 1 // Inheritance is achieved through Object.create

var target = Object.create(null);
console.log(target); // {} // A new object is created
console.log(target.__proto__); // undefined // An object with no prototype chain is created

var target = {}; // Object created in literal form
var target = Object.create(Object.prototype); // Equivalent to creating an object in literal form

var target = Object.create(Object.prototype,{ // Specify property descriptors
    key1:{
        enumerable: true,
        value: 1
    },
    key2:{
        enumerable: false,
        value: 1
    }
});
console.log(Object.keys(target)); // ["key1"] // key1 is enumerable
console.log(target["key1"]); // 1
console.log(target["key2"]); // 1

// Object.create achieves a complete shallow copy including all own property descriptors and prototype
var origin = {a: 1}
Object.defineProperty(origin, "b", {value:"11", enumerable:false});
var target = Object.create(
  Object.getPrototypeOf(origin), 
  Object.getOwnPropertyDescriptors(origin) 
);
console.log(target); // {a: 1, b: "11"}
console.log(Object.keys(target)); // ["a"]
```

## Object.defineProperties
The `Object.defineProperties()` method directly defines new properties on an object or modifies existing properties and returns the object, allowing for batch and precise addition or modification of object properties.

### Example
`Object.defineProperties(obj, props)`  
`obj`: The object on which to define or modify properties.  
`props`: An object whose own enumerable properties constitute property descriptors for the object. The property descriptors available in the object are mainly of two kinds: data descriptors and accessor descriptors.  
Returns a reference to the original object.

```javascript
// Explanation: https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/defineProperty.md
var target = {}
Object.defineProperties(target, {
    key1: {
        configurable: true, // Configurable
        enumerable: false, // Not enumerable
        value: 1, // Assigned value
        writable: true // Writable
    },
    key2: {
        enumerable: true,  // Enumerable
        get: function(){ // Getter - Data descriptor cannot coexist with accessor descriptor. Returns the value of the key1 key
            return this.key1;
        },
        set: function(x){ // Setter - Data descriptor cannot coexist with accessor descriptor. Sets the value of the key1 key
            this.key1 = x;
        }
    },
    
});
console.log(Object.keys(target)); // ["key2"] // key2 is enumerable
console.log(target.key1); // 1
console.log(target.key2); // 1
target.key2 = 11;
console.log(target.key1); // 11
console.log(target.key2); // 11
```

## Object.defineProperty
The `Object.defineProperty()` method defines a new property directly on an object or modifies an existing property and returns the object, allowing precise addition or modification of a property.

### Example
`Object.defineProperty(obj, prop, descriptor)`  
`obj`: The object on which to define the property.  
`prop`: The name of the property to be defined or modified.  
`descriptor`: The property descriptor to be defined or modified.  

Returns a reference to the original object.

```javascript
// Explanation: https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/defineProperty.md
var target = {}
Object.defineProperty(target, 'key1', {
    configurable: true, // Configurable
    enumerable: false, // Not enumerable
    value: 1, // Assigned value
    writable: true // Writable
});
Object.defineProperty(target, 'key2', {
    enumerable: true,  // Enumerable
    get: function(){ // Getter - Data descriptor cannot coexist with accessor descriptor. Returns the value of the key1 key
        return this.key1;
    },
    set: function(x){ // Setter - Data descriptor cannot coexist with accessor descriptor. Sets the value of the key1 key
        this.key1 = x;
    }
});
console.log(Object.keys(target)); // ["key2"] // key2 is enumerable
console.log(target.key1); // 1
console.log(target.key2); // 1
target.key2 = 11;
console.log(target.key1); // 11
console.log(target.key2); // 11
```

## Object.entries
The `Object.entries()` method returns an array of key-value pairs from a given object's own enumerable properties, in the same order as a `for in` loop would. The difference is that a `for in` loop also iterates over properties in the prototype chain.

### Example
`Object.entries(obj)`  
`obj`: The object whose own enumerable key-value pairs will be returned.  
Returns an array of key-value pairs from the given object's own enumerable properties.

```javascript
var obj = {
    2: "11",
    1: "1",
    b: "1111",
    a: "111",
    [Symbol()]: "11111"
}
Object.prototype.c = "111111"; // Add an enumerable property to the prototype chain
Object.defineProperty(obj, "d", {value:"1111111", enumerable:false}); // Add a non-enumerable property to obj
console.log(obj); // {1: "1", 2: "11", b: "1111", a: "111", d: "1111111", Symbol(): "11111"} 

var propertyArr = Object.entries(obj);
console.log(propertyArr); // [["1", "1"],["2", "11"],["b", "1111"],["a", "111"]]

## Object.freeze
The `Object.freeze()` method can freeze an object, making it impossible to modify. Once an object is frozen, new properties cannot be added, existing properties cannot be deleted or have their enumerability, configurability, or writability changed, and the values of existing properties cannot be modified. Additionally, once an object is frozen, its prototype cannot be modified. `Object.freeze()` returns the same object that was passed in.

### Example
`Object.freeze(obj)`  
`obj`: The object to freeze.  
Returns a reference to the frozen object as the same reference that was passed in, not a frozen copy.

```javascript
"use strict"; // Strict mode // Fails silently in non-strict mode
var obj = {a: 1};
var freezeObj = Object.freeze(obj);
console.log(obj === freezeObj); // true
freezeObj.b = 11; // Uncaught TypeError: Cannot add property b, object is not extensible
```

## Object.fromEntries
The `Object.fromEntries()` method transforms a list of key-value pairs into an object.

### Example
`Object.fromEntries(iterable)`  
`iterable`: An iterable such as an `Array`, `Map`, or another object that implements the iterable protocol.  
Returns a new object whose properties are provided by the entries in the iterable.

```javascript
var arr = [["a", 1], ["b", 11], ["c", 111]];
var obj = Object.fromEntries(arr);
console.log(obj); // {a: 1, b: 11, c: 111}
```

## Object.getOwnPropertyDescriptor
The `Object.getOwnPropertyDescriptor()` method returns the property descriptor of a specific own property on an object, where an own property is one that is directly assigned to the object and does not need to be looked up on the prototype chain.

### Example
`Object.getOwnPropertyDescriptor(obj, prop)`  
`obj`: The target object to search.
`prop`: The name of the property within the target object.  
If the specified property exists on the object, its property descriptor object is returned; otherwise `undefined` is returned.

```javascript
var target = {a: 1}
Object.defineProperty(target, 'key', {
    enumerable: false,
    value: 11,
    writable: true
});

var descriptor = Object.getOwnPropertyDescriptor(target, "a");
console.log(descriptor); // {value: 1, writable: true, enumerable: true, configurable: true}
var descriptor = Object.getOwnPropertyDescriptor(target, "key");
console.log(descriptor); // {value: 11, writable: true, enumerable: false, configurable: false}
```

## Object.getOwnPropertyDescriptors
The `Object.getOwnPropertyDescriptors()` method is used to get all own property descriptors of an object.

### Example
`Object.getOwnPropertyDescriptors(obj)`  
`obj`: Any object.  
Returns an object containing all the own property descriptors of the specified object. If there are no own properties, an empty object is returned.
```

```javascript
var target = {a: 1}
Object.defineProperty(target, 'key', {
    enumerable: false,
    value: 11,
    writable: true
});

var descriptor = Object.getOwnPropertyDescriptors(target);
console.log(descriptor);
/*
 {
   a: {value: 1, writable: true, enumerable: true, configurable: true}
   key: {value: 11, writable: true, enumerable: false, configurable: false}
 }
*/
```

## Object.getOwnPropertyNames
The `Object.getOwnPropertyNames()` method returns an array of all properties of a specified object, including non-enumerable properties but excluding properties with names that are `Symbol` values.

### Example
`Object.getOwnPropertyNames(obj)`  
`obj`: An object whose own enumerable and non-enumerable property names are to be returned.  
Returns an array of strings that correspond to the properties found directly upon a given object.

```javascript
var obj = {
    2: "11",
    1: "1",
    b: "1111",
    a: "111",
    [Symbol()]: "11111"
}
Object.prototype.c = "111111"; // Adding an enumerable property to the prototype chain
Object.defineProperty(obj, "d", {value:"1111111", enumerable:false}); // Adding a non-enumerable property to obj
console.log(obj); // {1: "1", 2: "11", b: "1111", a: "111", d: "1111111", Symbol(): "11111"}

var propertyArr = Object.getOwnPropertyNames(obj);
console.log(propertyArr); // ["1", "2", "b", "a", "d"]
```

## Object.getOwnPropertySymbols
The `Object.getOwnPropertySymbols()` method returns an array of all `Symbol` properties of a specified object.

### Example
`Object.getOwnPropertySymbols(obj)`  
`obj`: The object whose `Symbol` properties are to be returned.  
Returns an array of all `Symbol` properties found directly upon a given object.

```javascript
var obj = {
    2: "11",
    1: "1",
    b: "1111",
    a: "111",
    [Symbol()]: "11111"
}
Object.prototype.c = "111111"; // Adding an enumerable property to the prototype chain
Object.defineProperty(obj, "d", {value:"1111111", enumerable:false}); // Adding a non-enumerable property to obj
console.log(obj); // {1: "1", 2: "11", b: "1111", a: "111", d: "1111111", Symbol(): "11111"}

var propertyArr = Object.getOwnPropertySymbols(obj);
console.log(propertyArr); // [Symbol()]
```

## Object.getPrototypeOf
The `Object.getPrototypeOf()` method returns the prototype of a specified object, that is the value of the internal `[[Prototype]]` property.

### Example
`Object.getPrototypeOf(object)`  
`obj`: The object whose prototype is to be returned.  
Returns the prototype of the given object, or `null` if there are no inherited properties.

```javascript
var arr = [];
console.log(Object.getPrototypeOf(arr) === Array.prototype); // true
console.log(Object.getPrototypeOf(arr) === arr.__proto__); // true
```

### Object.is
The `Object.is()` method determines whether two values are the same value. This kind of equality check logic is different from the traditional `==` operation. The `==` operator will perform implicit type conversions on its operands before the equality comparison, leading to phenomena such as `"" == false` being equal to `true`. However, `Object.is` does not perform this type of conversion. This is also different from the way the `===` operator works. The `===` operator considers the number values `-0` and `+0` to be equal, and considers `NaN` to be unequal to `NaN`. If any of the following conditions are met in `Object.is()`, then the two values are considered to be the same:
* Both values are `undefined`
* Both values are `null`
* Both values are both `true` or both `false`
* Both values are strings made up of the same number of characters in the same order
* Both values point to the same object
* Both values are numbers, and are both positive zero `+0`, both negative zero `-0`, or both `NaN`
* Both are the same number, other than zero and `NaN`

### Example
`Object.is(value1, value2)`  
`value1`: The first value to compare.  
`value2`: The second value to compare.  
Returns a Boolean indicating whether the two arguments are the same.

```javascript
console.log(Object.is(NaN, NaN)); // true
```

### Object.isExtensible
The `Object.isExtensible()` method determines whether an object is extensible, i.e., whether new properties can be added to it.

### Example
`Object.isExtensible(obj)`  
`obj`: The object to check.  
Returns a `Boolean` indicating whether the given object is extensible.

```javascript
var obj1 = {};
var obj2 = {};
var obj3 = {};

Object.freeze(obj2);
Object.preventExtensions(obj3);

console.log(Object.isExtensible(obj1)); // true
console.log(Object.isExtensible(obj2)); // false
console.log(Object.isExtensible(obj3)); // false
```

### Object.isFrozen
The `Object.isFrozen()` method determines whether an object is frozen.

### Example
`Object.isFrozen(obj)`  
`obj`: The object to check.  
Returns a `Boolean` indicating whether the given object is frozen.

```javascript
var obj1 = {};
var obj2 = {};

Object.freeze(obj2);

console.log(Object.isFrozen(obj1)); // false
console.log(Object.isFrozen(obj2)); // true
```

### Object.isSealed
The `Object.isSealed()` method determines whether an object is sealed.

### Example
`Object.isSealed(obj)`  
`obj`: The object to check.  
Returns a `Boolean` indicating whether the given object is sealed.

```javascript
var obj1 = {};
var obj2 = {};
var obj3 = {};

Object.freeze(obj2);
Object.seal(obj3);

console.log(Object.isSealed(obj1)); // false
console.log(Object.isSealed(obj2)); // true
console.log(Object.isSealed(obj3)); // true
```

### Object.keys
The `Object.keys()` method returns an array of a given object's own enumerable property names, in the same order as a normal loop would, the difference being that `for in` loop would also enumerate properties in the prototype chain.

### Example
`Object.keys(obj)`  
`obj`: The object whose own enumerable properties are to be returned.  
Returns an array of strings representing all the enumerable properties of the given object.

```javascript
var obj = {
    2: "11",
    1: "1",
    b: "1111",
    a: "111",
    [Symbol()]: "11111"
}
Object.prototype.c = "111111"; // Adds an enumerable property to the prototype chain
Object.defineProperty(obj, "d", {value:"1111111", enumerable:false}); // Adds a non-enumerable property to obj
console.log(obj); // {1: "1", 2: "11", b: "1111", a: "111", d: "1111111", Symbol(): "11111"}
```

```javascript
var propertyArr = Object.keys(obj);
console.log(propertyArr); // ["1", "2", "b", "a"]
```

## Object.preventExtensions
The `Object.preventExtensions()` method makes an object non-extensible, which means no new properties can ever be added.

### Example
`Object.preventExtensions(obj)`  
`obj`: The object to become non-extensible.  
Returns a reference to the object that has been made non-extensible.

```javascript
"use strict"; // Strict mode // Fails silently in non-strict mode
var obj = {a: 1};
var preventExtensionsObj = Object.preventExtensions(obj);
console.log(obj === preventExtensionsObj); // true
preventExtensionsObj.b = 11; // Uncaught TypeError: Cannot add property b, object is not extensible
```

## Object.seal
The `Object.seal()` method seals an object, preventing the addition of new properties and marking all existing properties as non-configurable. The values of current properties can still be changed if they were writable. In simple terms, a sealed object is one that is not extensible and all of its own properties are non-configurable and therefore not deletable, but not necessarily unwriteable.

### Example
`Object.seal(obj)`  
`obj`: The object to be sealed.  
Returns a reference to the sealed object.

```javascript
"use strict"; // Strict mode // Fails silently in non-strict mode
var obj = {a: 1};
var sealObj = Object.seal(obj);
console.log(obj === sealObj); // true
console.log(sealObj.a); // 1
sealObj.a = 11;
console.log(sealObj.a); // 11
preventExtensionsObj.b = 11; // Uncaught TypeError: Cannot add property b, object is not extensible
```

## Object.setPrototypeOf
The `Object.setPrototypeOf()` method sets the prototype (i.e., the internal `[[Prototype]]` property) of a specified object to another object or `null`. 
Due to characteristics related to the optimization of property access brought by modern JavaScript engines, changing an object's `[[Prototype]]` is a slow operation in various browsers and JavaScript engines. Its impact on inheritance performance is subtle and widespread, not only limited to the time spent on the `obj.__proto__ = ...` statement, but it may also extend to any code that can access an object whose `[[Prototype]]` has been changed. If performance is a concern for you, you should avoid setting an object's `[[Prototype]]` and use `Object.create()` instead to create a new object with the desired `[[Prototype]]`.

### Example
`Object.setPrototypeOf(obj, prototype)`  
`obj`: The object to set its prototype.  
`prototype`: The new prototype for the object, which should be an object or `null`.

```javascript
var origin = {a: 1};
var target = {};

Object.setPrototypeOf(target, origin);

console.log(target.a); // 1
console.log(Object.getPrototypeOf(target) === origin); // true
console.log(target.__proto__ === Object.getPrototypeOf(target)); // true
// Therefore, the __proto__ property is an accessor property (a getter function and a setter function) that exposes the internal [[Prototype]] of the object it accesses.
// The __proto__ property has been standardized in the ECMAScript 6 language specification to ensure compatibility across web browsers.
```

## Object.values
The `Object.values()` method returns an array of a given object's own enumerable property values, in the same order as a `for in` loop. The key difference is that a `for in` loop also enumerates properties from the prototype chain.

### Example
`Object.values(obj)`  
`obj`: The object whose enumerable property values will be returned.  
Returns an array containing all the own enumerable property values of the object.


```javascript
var obj = {
    2: "11",
    1: "1",
    b: "1111",
    a: "111",
    [Symbol()]: "11111"
}
Object.prototype.c = "111111"; // adding an enumerable property on the prototype chain
Object.defineProperty(obj, "d", {value:"1111111", enumerable:false}); // adding a non-enumerable property on obj
console.log(obj); // {1: "1", 2: "11", b: "1111", a: "111", d: "1111111", Symbol(): "11111"}

var propertyArr = Object.values(obj);
console.log(propertyArr); // ["1", "11", "1111", "111"]

```
## Object.prototype.hasOwnProperty
The `Object.prototype.hasOwnProperty()` method returns a boolean indicating whether the object has the specified key as its own property.

### Example
`obj.hasOwnProperty(prop)`  
`prop`: A `String` representing the name of the property to test, or a `Symbol`.  
Returns a boolean value `Boolean` to check if the object has the specified property.

```javascript
var obj = {a: 1}
console.log(obj.hasOwnProperty("a")); // true
console.log(obj.hasOwnProperty("b")); // false
```

## Object.prototype.isPrototypeOf
The `Object.prototype.isPrototypeOf()` method is used to test whether an object exists in the prototype chain of another object.
`isPrototypeOf()` behaves differently from the `instanceof` operator. In the expression `object instanceof AFunction`, the prototype chain of `object` is checked against `AFunction.prototype`, not against `AFunction` itself.

### Example
`prototypeObj.isPrototypeOf(object)`  
`object`: The object on whose prototype chain to search.  
Returns a `Boolean` representing whether the calling object is on the prototype chain of another object.

```javascript
var obj = {};
console.log(Object.prototype.isPrototypeOf(obj)); // true
console.log(obj instanceof Object); // true
```

## Object.prototype.propertyIsEnumerable
The `Object.prototype.propertyIsEnumerable()` method returns a boolean indicating whether the specified property is enumerable.

### Example
`obj.propertyIsEnumerable(prop)`  
`prop`: The name of the property to test.  
Returns a `Boolean` that indicates whether the specified property name is enumerable.

```javascript
var obj = {a: 1};
Object.defineProperty(target, 'b', { enumerable: false, value: 11 });
console.log(obj.propertyIsEnumerable("a")); // true
console.log(obj.propertyIsEnumerable("b")); // false
console.log(obj.propertyIsEnumerable("c")); // false
```

## Object.prototype.toLocaleString
The `Object.prototype.toLocaleString()` method returns a string representing the object. This method is overloaded for derived objects for locale-specific purposes.

### Example
`obj.toLocaleString()`  
Returns a string that represents the object.

```javascript
var obj = {};
console.log(obj.toLocaleString()); // [object Object]

// Overridden objects for toLocaleString are Array, Number, and Date
var arr = [1, 2, 3];
console.log(arr.toLocaleString()); // 1,2,3

var a = 111111;
console.log(a.toLocaleString()); // 111,111

var d = new Date()
console.log(d.toLocaleString()); // 5/30/2020, 8:00:00 AM
```

## Object.prototype.toString
The `Object.prototype.toString()` method returns a string representing the object.

### Example
`obj.toString()`  
Returns a string representing the object.

```javascript
var obj = {};
console.log(obj.toString()); // [object Object]

var arr = [1, 2, 3];
console.log(arr.toString()); // 1,2,3

var a = 111111;
console.log(a.toString()); // 111111

var d = new Date()
console.log(d.toString()); // Sat May 30 2020 08:00:00 GMT+0800 (China Standard Time)
```

## Object.prototype.valueOf
The `Object.prototype.valueOf()` method returns the primitive value of a specified object.

| Object | Returned Value |
| --- | --- |
| Array | Returns the array object itself. |
| Boolean | Boolean value. |
| Date | The stored time is the number of milliseconds since midnight on January 1, 1970 UTC. |
| Function | The function itself. |
| Number | Number value. |
| Object | By default, the object itself. |
| String | String value. |

### Example
`obj.valueOf()`  
Returns the primitive value of the object.

```javascript
console.log([1, 2, 3].valueOf()); // (3) [1, 2, 3]
console.log(Boolean(true).valueOf()); // true
console.log(new Date().valueOf()); // 1590826079216
console.log((function(){}).valueOf()); // ƒ (){}
console.log(Number(1).valueOf()); // 1
console.log({}.valueOf()); // {}
console.log(String("1").valueOf()); // 1
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
```