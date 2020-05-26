# Js遍历对象总结
`Js`遍历对象的方法主要有`for in`、`Object.keys()`、`Object.getOwnPropertyNames()`、`Reflect.ownKeys()`、`Object.getOwnPropertySymbols()`。

## for in
`for in`语句以任意顺序迭代对象的可枚举属性，包括原型链上的可枚举属性，不包括`Symbol`属性。
```javascript
var obj = {
    2: "11",
    1: "1",
    b: "1111",
    a: "111",
    [Symbol()]: "11111"
}
Object.prototype.c = "111111"; // 在原型链上增加一个可枚举属性
Object.defineProperty(obj, "d", {value:"1111111", enumerable:false}); // 在obj上增加一个不可枚举属性
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
 对于迭代时的顺序：
 1. 如果属性名的类型是Number，那么属性的迭代顺序是按照key从小到大排序。
 2. 如果属性名的类型是String，那么属性的迭代顺序是按照属性被创建的时间升序排序。
 3. 如果属性名的类型是Symbol，那么逻辑同String相同。
*/
```

## Object.keys
`Object.keys()`方法会返回一个由一个指定对象的自身可枚举属性组成的数组，数组中属性名的排列顺序和使用`for...in`循环遍历该对象时返回的顺序一致。类似的，`Object.entries()`方法返回一个指定对象自身可枚举属性的键值对数组，`Object.values()`方法返回一个指定对象自身的所有可枚举属性值的数组。
```javascript
var obj = {
    2: "11",
    1: "1",
    b: "1111",
    a: "111",
    [Symbol()]: "11111"
}
Object.prototype.c = "111111"; // 在原型链上增加一个可枚举属性
Object.defineProperty(obj, "d", {value:"1111111", enumerable:false}); // 在obj上增加一个不可枚举属性
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
console.log( Object.entries(obj)); // [["1", "1"],["2", "11"],["b", "1111"],["a", "111"]]
console.log( Object.values(obj)); // ["1", "11", "1111", "111"]
```

## Object.getOwnPropertyNames
`Object.getOwnPropertyNames()`方法返回一个由指定对象的所有自身属性的属性名，包括不可枚举属性但不包括`Symbol`值作为名称的属性组成的数组。
```javascript
var obj = {
    2: "11",
    1: "1",
    b: "1111",
    a: "111",
    [Symbol()]: "11111"
}
Object.prototype.c = "111111"; // 在原型链上增加一个可枚举属性
Object.defineProperty(obj, "d", {value:"1111111", enumerable:false}); // 在obj上增加一个不可枚举属性
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
`Object.getOwnPropertySymbols()`方法返回一个指定对象自身的所有`Symbol`属性的数组。
```javascript
var obj = {
    2: "11",
    1: "1",
    b: "1111",
    a: "111",
    [Symbol()]: "11111"
}
Object.prototype.c = "111111"; // 在原型链上增加一个可枚举属性
Object.defineProperty(obj, "d", {value:"1111111", enumerable:false}); // 在obj上增加一个不可枚举属性
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
`Reflect.ownKeys`方法返回一个由指定对象自身的属性键组成的数组，包括不可枚举属性与`Symbol`属性，它的返回值等同于`Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target))`。
```javascript
var obj = {
    2: "11",
    1: "1",
    b: "1111",
    a: "111",
    [Symbol()]: "11111"
}
Object.prototype.c = "111111"; // 在原型链上增加一个可枚举属性
Object.defineProperty(obj, "d", {value:"1111111", enumerable:false}); // 在obj上增加一个不可枚举属性
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

## 每日一题
```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://github.com/berwin/Blog/issues/24
https://www.cnblogs.com/zhaozhou/p/7890527.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Enumerability_and_ownership_of_properties
```
