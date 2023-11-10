# Summary of Traversing Objects in JavaScript

The main methods for traversing objects in JavaScript are `for in`, `Object.keys()`, `Object.getOwnPropertyNames()`, `Reflect.ownKeys()`, and `Object.getOwnPropertySymbols()`.

## for in
The `for in` statement iterates over the enumerable properties of an object in any order, including enumerable properties on the prototype chain, but excluding `Symbol` properties.

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
for( let unit in obj ){
    console.log(unit, obj[unit]);
}
/* 
 1 1
 2 11
 b 1111
 a 111
 c 111111
*/
/*
 For the iteration order:
 1. If the property name is of type Number, the iteration order is based on the keys in ascending order.
 2. If the property name is of type String, the iteration order is based on the order the properties were created.
 3. If the property name is of type Symbol, it follows the same logic as String.
*/
```

## Object.keys
The `Object.keys()` method returns an array of an object's own enumerable properties, in the same order as they are returned when traversing the object using a `for...in` loop. Similarly, the `Object.entries()` method returns an array of key-value pairs for an object's own enumerable properties, and the `Object.values()` method returns an array of an object's own enumerable property values.

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

var propertyArr = Object.keys(obj);
for( let unit of propertyArr ){
    console.log(unit, obj[unit]);
}
/* 
 1 1
 2 11
 b 1111
 a 111
*/
console.log(Object.entries(obj)); // [["1", "1"],["2", "11"],["b", "1111"],["a", "111"]]
console.log(Object.values(obj)); // ["1", "11", "1111", "111"]
```

## Object.getOwnPropertyNames
The `Object.getOwnPropertyNames()` method returns an array of all the own property names of the specified object, including non-enumerable properties, but excluding properties with names that are `Symbol` values.

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

var propertyArr = Object.getOwnPropertyNames(obj);
for( let unit of propertyArr ){
    console.log(unit, obj[unit]);
}
/* 
 1 1
 2 11
 b 1111
 a 111
 d 1111111
*/
```

## Object.getOwnPropertySymbols
The `Object.getOwnPropertySymbols()` method returns an array of all the `Symbol` properties of the specified object.

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

var propertyArr = Object.getOwnPropertySymbols(obj);
for( let unit of propertyArr ){
    console.log(unit, obj[unit]);
}
/* 
 Symbol() "11111"
*/
```

## Reflect.ownKeys
The `Reflect.ownKeys` method returns an array of the specified object's own property keys, including non-enumerable properties and `Symbol` properties. Its return value is equivalent to `Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target))`.

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

var propertyArr = Reflect.ownKeys(obj);
for( let unit of propertyArr ){
    console.log(unit, obj[unit]);
}
/* 
 1 1
 2 11
 b 1111
 a 111
 d 1111111
 Symbol() "11111"
*/
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://github.com/berwin/Blog/issues/24
https://www.cnblogs.com/zhaozhou/p/7890527.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Enumerability_and_ownership_of_properties
```