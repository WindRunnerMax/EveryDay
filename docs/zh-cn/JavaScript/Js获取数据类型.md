# Js获取数据类型
`JavaScript`有着七种基本类型`String`、`Number`、`Boolean`、`Null`、`Undefined`、`Symbol`、`Object`，前六种为基本数据类型，`Object`为引用类型。

## typeof
`typeof(operand)`或`typeof operand`，`operand`是一个表示对象或原始值的表达式，其类型将被返回。

### 规则
* `String`: `"string"`
* `Number`: `"number"`
* `Boolean`: `"boolean"`
* `Null`: `"object"`
* `Undefined`: `"undefined"`
* `Symbol`: `"symbol"`
* `BigInt`: `"bigint"`
* `Function Object`: `"function"`
* `Object`: `"Object"`

### 示例

```javascript
console.log(typeof(a)); // undefined // 未定义的变量
console.log(typeof("s")); // string
console.log(typeof(1)); // number
console.log(typeof(true)); // boolean
console.log(typeof(new String("s"))); // object
console.log(typeof(new Number(1))); // object
console.log(typeof(new Boolean(true))); // object
console.log(typeof(null)); // object // 在 JavaScript 最初的实现中，JavaScript 中的值是由一个表示类型的标签和实际数据值表示的。对象的类型标签是 0。由于 null 代表的是空指针（大多数平台下值为 0x00），因此，null 的类型标签是 0，typeof null 也因此返回 "object"。
console.log(typeof(undefined)); // undefined
console.log(typeof(Symbol())); // symbol
console.log(typeof(Object(Symbol()))); // object
console.log(typeof(1n)); // bigint // ES10(ES2019)新增基本数据类型
console.log(typeof(Object(BigInt(1n)))); // object
console.log(typeof(function() {})); // function
console.log(typeof([])); // object
console.log(typeof(new Date())); // object
console.log(typeof(/regex/)); // object
console.log(typeof({})); // object
```

## instanceof
`instanceof`运算符用于检测构造函数的`prototype`属性是否出现在某个实例对象的原型链上。在`Js`中，一切都是对象，至少被视为一个对象，能够直接使用字面量声明的基本数据类型，虽然并不是直接的对象类型，但是在基本数据类型的变量调用方法的时候，会出现一个临时的包装对象，从而能够调用其构造函数的原型的方法，所以使用`instanceof`时对于字面量声明的`String`、`Number`、`Boolean`、`Symbol`、`BigInt`都会返回`false`。

### 示例
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
借助`Object`原型的`toString`方法判断类型，一般对于新建的不同类型的对象`toString`方法都会被重新定义，无法沿着原型链到达`Object.prototype.toString`，可以通过`call`或者`apply`来调用`Object.prototype.toString`用以判断类型。

### 示例
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
console.log(Object.prototype.toString.call(Object(Symbol()))); // [object Symbol]
console.log(Object.prototype.toString.call(1n)); // [object BigInt]
console.log(Object.prototype.toString.call(Object(BigInt(1n)))); // [object BigInt]
console.log(Object.prototype.toString.call(function() {})); // [object Function]
console.log(Object.prototype.toString.call([])); // [object Array]
console.log(Object.prototype.toString.call(new Date())); // [object Date]
console.log(Object.prototype.toString.call(/regex/)); // [object RegExp]
console.log(Object.prototype.toString.call({})); // [object Object]
```


## 每日一题
```
https://github.com/WindrunnerMax/EveryDay
```


## 参考

```
https://www.cnblogs.com/sban/p/10256412.html
https://www.cnblogs.com/yucheng6/p/9747313.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures
```
