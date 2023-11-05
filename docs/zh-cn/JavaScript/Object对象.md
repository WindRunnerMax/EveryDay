# Object对象
`Object`对象是`JavaScript`中两个顶层对象之一，提供方法供直接调用以及原型链继承调用。

## Object.assign
`Object.assign()`方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象，本文认为只有引用类型才有浅拷贝与深拷贝的概念，那么`Object.assign`拷贝方式就是浅拷贝。假如认为对于基本数据类型也有浅拷贝与深拷贝的概念的话，那么对于基本数据类型的拷贝可以理解为按值深拷贝，那么关于`Object.assign`第一层是深拷贝，第二层及以后是浅拷贝的说法也是没有问题的。  

### 示例
`Object.assign(target, ...sources)`  
`target`:   目标对象。  
`sources`: 源对象。  
返回目标对象`target`的引用。  

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
`Object.create()`方法创建一个新对象，使用现有的对象来提供新创建的对象的`__proto__`。

### 示例
`Object.create(proto[, propertiesObject])`  
`proto`: 新创建对象的原型对象。  
`propertiesObject`: 可选，如果指定为一个对象，则是要添加到新创建对象的不可枚举（默认）属性对象的属性描述符以及相应的属性名称，即其自身定义的属性，而不是其原型链上的枚举属性，这些属性对应`Object.defineProperties()`的第二个参数。  
返回一个新对象，带着指定的原型对象和属性。

```javascript
var proto = {a: 1};
var target = Object.create(proto);
console.log(target); // {} // 创建了一个新对象
console.log(target.__proto__ === proto); // true // 将新对象的__proto__指向了原对象
console.log(target.a); // 1 // 通过 Object.create 实现了继承

var target = Object.create(null);
console.log(target); // {} // 创建了一个新对象
console.log(target.__proto__); // undefined // 创建一个没有原型链指向的对象

var target = {}; // 字面量形式创建对象
var target = Object.create(Object.prototype); // 等同于字面量方式创建对象

var target = Object.create(Object.prototype,{ // 指定属性描述符
    key1:{
        enumerable: true,
        value: 1
    },
    key2:{
        enumerable: false,
        value: 1
    }
});
console.log(Object.keys(target)); // ["key1"] // key1可枚举
console.log(target["key1"]); // 1
console.log(target["key2"]); // 1

// Object.create 实现完整的浅拷贝 包括所有自身属性的描述符以及原型
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
`Object.defineProperties()`方法直接在一个对象上定义新的属性或修改现有属性，并返回该对象，该方法允许批量精确地添加或修改对象的属性。

### 示例
`Object.defineProperties(obj, props)`  
`obj`: 在其上定义或修改属性的对象。  
`props`: 要定义其可枚举属性或修改的属性描述符的对象。对象中存在的属性描述符主要有两种：数据描述符和访问器描述符。  
返回原对象的引用。

```javascript
// 详解 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/defineProperty.md
var target = {}
Object.defineProperties(target,{
    key1:{
        configurable: true, // 可配置
        enumerable: false, // 不可枚举
        value: 1, // 赋值
        writable: true // 可写
    },
    key2:{
        enumerable: true, // 可枚举
        get: function(){ // getter 数据描述符与存取描述符不可共存 返回的是 key1 键的值
            return this.key1;
        },
        set: function(x){ // setter 数据描述符与存取描述符不可共存 设置的是 key1 键的值
            this.key1 = x;
        }
    },
    
});
console.log(Object.keys(target)); // ["key2"] // key2可枚举
console.log(target.key1); // 1
console.log(target.key2); // 1
target.key2 = 11;
console.log(target.key1); // 11
console.log(target.key2); // 11
```

## Object.defineProperty
`Object.defineProperty()`方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象，该方法允许精确地添加或修改对象的属性。

### 示例
`Object.defineProperty(obj, prop, descriptor)`  
`obj`: 要定义属性的对象。  
`prop`: 要定义或修改的属性的名称或`Symbol`。  
`descriptor`: 要定义或修改的属性描述符。  
返回原对象的引用。

```javascript
// 详解 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/defineProperty.md
var target = {}
Object.defineProperty(target, 'key1', {
    configurable: true, // 可配置
    enumerable: false, // 不可枚举
    value: 1, // 赋值
    writable: true // 可写
});
Object.defineProperty(target, 'key2', {
    enumerable: true, // 可枚举
    get: function(){ // getter 数据描述符与存取描述符不可共存 返回的是 key1 键的值
        return this.key1;
    },
    set: function(x){ // setter 数据描述符与存取描述符不可共存 设置的是 key1 键的值
        this.key1 = x;
    }
});
console.log(Object.keys(target)); // ["key2"] // key2可枚举
console.log(target.key1); // 1
console.log(target.key2); // 1
target.key2 = 11;
console.log(target.key1); // 11
console.log(target.key2); // 11
```

## Object.entries
`Object.entries()`方法返回一个给定对象自身可枚举属性的键值对数组，其排列与使用 `for in`循环遍历该对象时返回的顺序一致，区别在于`for in`循环还会枚举原型链中的属性。

### 示例
`Object.entries(obj)`  
`obj`: 可以返回其可枚举属性的键值对的对象。  
返回给定对象自身可枚举属性的键值对数组。

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

var propertyArr = Object.entries(obj);
console.log(propertyArr); // [["1", "1"],["2", "11"],["b", "1111"],["a", "111"]]
```

## Object.freeze
`Object.freeze()`方法可以冻结一个对象，一个被冻结的对象再也不能被修改，冻结了一个对象则不能向这个对象添加新的属性，不能删除已有属性，不能修改该对象已有属性的可枚举性、可配置性、可写性，以及不能修改已有属性的值。此外，冻结一个对象后该对象的原型也不能被修改，`Object.freeze()`返回和传入的参数相同的对象。

### 示例
`Object.freeze(obj)`  
`obj`: 要被冻结的对象。  
返回被冻结的对象的引用，是返回传递的对象，而不是创建一个被冻结的副本。

```javascript
"use strict"; // 严格模式 // 非严格模式静默失败
var obj = {a: 1};
var freezeObj = Object.freeze(obj);
console.log(obj === freezeObj); // true
freezeObj.b = 11; // Uncaught TypeError: Cannot add property b, object is not extensible
```

## Object.fromEntries
`Object.fromEntries()`方法把键值对列表转换为一个对象。

### 示例
`Object.fromEntries(iterable)`  
`iterable`: 可迭代对象，类似`Array`、`Map`或者其它实现了可迭代协议的对象。  
返回一个由该迭代对象条目提供对应属性的新对象。

```javascript
var arr = [["a", 1], ["b", 11], ["c", 111]];
var obj = Object.fromEntries(arr);
console.log(obj); // {a: 1, b: 11, c: 111}
```

## Object.getOwnPropertyDescriptor
`Object.getOwnPropertyDescriptor()`方法返回指定对象上一个自有属性对应的属性描述符，自有属性指的是直接赋予该对象的属性，不需要从原型链上进行查找的属性。

### 示例
`Object.getOwnPropertyDescriptor(obj, prop)`  
`obj`: 需要查找的目标对象。
`prop`: 目标对象内属性名称。  
如果指定的属性存在于对象上，则返回其属性描述符对象，否则返回`undefined`。

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
`Object.getOwnPropertyDescriptors()`方法用来获取一个对象的所有自身属性的描述符。

### 示例
`Object.getOwnPropertyDescriptors(obj)`  
`obj`: 任意对象  
返回所指定对象的所有自身属性的描述符，如果没有任何自身属性，则返回空对象。

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
`Object.getOwnPropertyNames()`方法返回一个由指定对象的所有自身属性的属性名，包括不可枚举属性但不包括`Symbol`值作为名称的属性组成的数组。

### 示例
`Object.getOwnPropertyNames(obj)`  
`obj`: 一个对象，其自身的可枚举和不可枚举属性的名称被返回。  
返回在给定对象上找到的自身属性对应的字符串数组。

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
console.log(propertyArr); // ["1", "2", "b", "a", "d"]
```

## Object.getOwnPropertySymbols
`Object.getOwnPropertySymbols()`方法返回一个指定对象自身的所有`Symbol`属性的数组。

### 示例
`Object.getOwnPropertySymbols(obj)`  
`obj`: 要返回`Symbol`属性的对象。  
返回在给定对象自身上找到的所有`Symbol`属性的数组。

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
console.log(propertyArr); // [Symbol()]
```

## Object.getPrototypeOf
`Object.getPrototypeOf()`方法返回指定对象的原型，即内部`[[Prototype]]`属性的值。

### 示例
`Object.getPrototypeOf(object)`  
`obj`: 要返回其原型的对象。  
返回给定对象的原型，如果没有继承属性，则返回`null`。

```javascript
var arr = [];
console.log(Object.getPrototypeOf(arr) === Array.prototype); // true
console.log(Object.getPrototypeOf(arr) === arr.__proto__); // true
```

## Object.is
`Object.is()`方法判断两个值是否是相同的值。  
这种相等性判断逻辑和传统的`==`运算不同，`==`运算符会对它两边的操作数做隐式类型转换，然后才进行相等性比较，所以才会有类似`"" == false`等于`true`的现象，但`Object.is` 不会做这种类型转换。  
这与`===`运算符的判定方式也不一样，`===`运算符和`==`运算符将数字值`-0`和`+0`视为相等，并认为`NaN`不等于`NaN`。  
`Object.is()`中如果下列任何一项成立，则两个值相同：
* 两个值都是`undefined`
* 两个值都是`null`
* 两个值都是`true`或者都是`false`
* 两个值是由相同个数的字符按照相同的顺序组成的字符串
* 两个值指向同一个对象
* 两个值都是数字并且，都是正零`+0`，都是负零`-0`，都是`NaN`
* 都是除零和`NaN`外的其它同一个数字

### 示例
`Object.is(value1, value2)`  
`value1`: 第一个需要比较的值。  
`value2`: 第二个需要比较的值。  
返回表示两个参数是否相同的布尔值 。

```javascript
console.log(Object.is(NaN, NaN)); // true
```

## Object.isExtensible
`Object.isExtensible()`方法判断一个对象是否是可扩展的，即是否可以在它上面添加新的属性。

### 示例
`Object.isExtensible(obj)`  
`obj`: 需要检测的对象。  
返回表示给定对象是否可扩展的一个`Boolean`。

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

## Object.isFrozen
`Object.isFrozen()`方法判断一个对象是否被冻结。

### 示例
`Object.isFrozen(obj)`  
`obj`: 被检测的对象。  
返回表示给定对象是否被冻结的`Boolean`。

```javascript
var obj1 = {};
var obj2 = {};

Object.freeze(obj2);

console.log(Object.isFrozen(obj1)); // false
console.log(Object.isFrozen(obj2)); // true
```

## Object.isSealed
`Object.isSealed()`方法判断一个对象是否被密封。

### 示例
`Object.isSealed(obj)`  
`obj`: 要被检查的对象。  
返回表示给定对象是否被密封的一个`Boolean`。

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

## Object.keys
`Object.keys()`方法会返回一个由一个指定对象的自身可枚举属性组成的数组，数组中属性名的排列顺序和使用`for in`循环遍历该对象时返回的顺序一致，区别在于`for in`循环还会枚举原型链中的属性。。

### 示例
`Object.keys(obj)`  
`obj`: 要返回其枚举自身属性的对象。  
返回一个表示给定对象的所有可枚举属性的字符串数组。

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
console.log(propertyArr); // ["1", "2", "b", "a"]
```

## Object.preventExtensions
`Object.preventExtensions()`方法让一个对象变的不可扩展，也就是永远不能再添加新的属性。

### 示例
`Object.preventExtensions(obj)`  
`obj`: 将要变得不可扩展的对象。  
返回已经不可扩展的对象的引用。

```javascript
"use strict"; // 严格模式 // 非严格模式静默失败
var obj = {a: 1};
var preventExtensionsObj = Object.preventExtensions(obj);
console.log(obj === preventExtensionsObj); // true
preventExtensionsObj.b = 11; // Uncaught TypeError: Cannot add property b, object is not extensible
```

## Object.seal
`Object.seal()`方法封闭一个对象，阻止添加新属性并将所有现有属性标记为不可配置，当前属性的值只要原来是可写的就依旧可以改变。简单来说，密封对象是指那些不可扩展的，且所有自身属性都不可配置且因此不可删除，但不一定是不可写的对象。

### 示例
`Object.seal(obj)`  
`obj`: 将要被密封的对象。  
返回被密封的对象的引用。

```javascript
"use strict"; // 严格模式 // 非严格模式静默失败
var obj = {a: 1};
var sealObj = Object.seal(obj);
console.log(obj === sealObj); // true
console.log(sealObj.a); // 1
sealObj.a = 11;
console.log(sealObj.a); // 11
preventExtensionsObj.b = 11; // Uncaught TypeError: Cannot add property b, object is not extensible
```

## Object.setPrototypeOf
`Object.setPrototypeOf()`方法设置一个指定的对象的原型即内部`[[Prototype]]`属性，到另一个对象或`null`。  
由于现代`JavaScript`引擎优化属性访问所带来的特性的关系，更改对象的`[[Prototype]]`在各个浏览器和`JavaScript`引擎上都是一个很慢的操作。其在更改继承的性能上的影响是微妙而又广泛的，这不仅仅限于`obj.__proto__ = ...`语句上的时间花费，而且可能会延伸到任何代码，那些可以访问任何`[[Prototype]]`已被更改的对象的代码。如果你关心性能，你应该避免设置一个对象的`[[Prototype]]`，而应该使用`Object.create()`来创建带有你想要的`[[Prototype]]`的新对象。

### 示例
`Object.setPrototypeOf(obj, prototype)`  
`obj`: 要设置其原型的对象。  
`prototype`: 该对象的新原型，原型应为一个对象或`null`。  

```javascript
var origin = {a: 1};
var target = {};

Object.setPrototypeOf(target, origin);

console.log(target.a); // 1
console.log(Object.getPrototypeOf(target) === origin); // true
console.log(target.__proto__ === Object.getPrototypeOf(target)); // true
// __proto__ 属性是一个访问器属性（一个getter函数和一个setter函数）, 暴露了通过它访问的对象的内部[[Prototype]]。
// __proto__属性已在ECMAScript 6语言规范中标准化，用于确保Web浏览器的兼容性。
```

## Object.values
`Object.values()`方法返回一个给定对象自身的所有可枚举属性值的数组，值的顺序与使用`for in`循环的顺序相同，区别在于`for in`循环还会枚举原型链中的属性。

### 示例
`Object.values(obj)`  
`obj`: 被返回可枚举属性值的对象。  
返回一个包含对象自身的所有可枚举属性值的数组。

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

var propertyArr = Object.values(obj);
console.log(propertyArr); // ["1", "11", "1111", "111"]
```

## Object.prototype.hasOwnProperty
`Object.prototype.hasOwnProperty()`方法会返回一个布尔值，指示对象自身属性中是否具有指定的键。

### 示例
`obj.hasOwnProperty(prop)`  
`prop`: 要检测的属性的`String`字符串形式表示的名称，或者`Symbol`。  
返回用来判断某个对象是否含有指定的属性的布尔值`Boolean`。

```javascript
var obj = {a: 1}
console.log(obj.hasOwnProperty("a")); // true
console.log(obj.hasOwnProperty("b")); // false
```

## Object.prototype.isPrototypeOf
 `Object.prototype.isPrototypeOf()`方法用于测试一个对象是否存在于另一个对象的原型链上。  
 `isPrototypeOf()`与`instanceof`运算符不同，在表达式`object instanceof AFunction`中，`object`的原型链是针对`AFunction.prototype`进行检查的，而不是针对`AFunction`本身。
 
### 示例
`prototypeObj.isPrototypeOf(object)`  
`object`: 在该对象的原型链上搜寻。  
返回表示调用对象是否在另一个对象的原型链上的`Boolean`。

```javascript
var obj = {};
console.log(Object.prototype.isPrototypeOf(obj)); // true
console.log(obj instanceof Object); // true
```

## Object.prototype.propertyIsEnumerable
`Object.prototype.propertyIsEnumerable()`方法返回一个布尔值，表示指定的属性是否可枚举。  

### 示例
`obj.propertyIsEnumerable(prop)`  
`prop`: 需要测试的属性名。  
返回用来表示指定的属性名是否可枚举的`Boolean`。

```javascript
var obj = {a: 1};
Object.defineProperty(target, 'b', { enumerable: false, value: 11 });
console.log(obj.propertyIsEnumerable("a")); // true
console.log(obj.propertyIsEnumerable("b")); // false
console.log(obj.propertyIsEnumerable("c")); // false
```

## Object.prototype.toLocaleString
`Object.prototype.toLocaleString()`方法返回一个该对象的字符串表示，此方法被用于派生对象为了特定语言环境的目的`locale-specific purposes`而重载使用。

### 示例
`obj.toLocaleString()`  
返回表示对象的字符串。

```javascript
var obj = {};
console.log(obj.toLocaleString()); // [object Object]

// 覆盖了 toLocaleString 的对象有 Array Number Date
var arr = [1, 2, 3];
console.log(arr.toLocaleString()); // 1,2,3

var a = 111111;
console.log(a.toLocaleString()); // 111,111

var d = new Date()
console.log(d.toLocaleString()); // 5/30/2020, 8:00:00 AM
```

## Object.prototype.toString
`Object.prototype.toString()`方法返回一个表示该对象的字符串。

### 示例
`obj.toString()`   
返回一个表示该对象的字符串。

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
`Object.prototype.valueOf()`方法返回指定对象的原始值。

| 对象 | 返回值 |
| --- | --- |
| Array | 返回数组对象本身。 |
| Boolean | 布尔值。 |
| Date |    存储的时间是从1970年1月1日午夜开始计的毫秒数UTC。 |
| Function | 函数本身。 |
| Number | 数字值。 |
| Object | 默认情况下是对象本身。 |
| String | 字符串值。 |

### 示例
`obj.valueOf()`  
返回值为该对象的原始值。

```javascript
console.log([1, 2, 3].valueOf()); // (3) [1, 2, 3]
console.log(Boolean(true).valueOf()); // true
console.log(new Date().valueOf()); // 1590826079216
console.log((function(){}).valueOf()); // ƒ (){}
console.log(Number(1).valueOf()); // 1
console.log({}.valueOf()); // {}
console.log(String("1").valueOf()); // 1
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
```
