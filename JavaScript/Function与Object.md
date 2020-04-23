# Function与Object
`JavaScript`中内置了两个顶级对象`Function`、`Object`，`Object`是所有对象的基类，而所有的构造函数同时又是`Function`对象的实例。

## Object
`JavaScript`中的所有对象都来自`Object`，所有对象从`Object.prototype`继承方法和属性，尽管它们可能被覆盖，例如其他构造函数在原型中实现自己的`toString()`方法。`Object`原型对象的更改将传播到所有对象，除非这些受到更改的属性和方法沿原型链被覆盖。

```javascript
// 定义三个对象
var a = function(){} // 构造函数对象
var b = new Array(1); // 数组对象
var c = new Number(1); // 数字对象 // 包装对象

// 检查原型链
console.log(a.__proto__.__proto__ === Object.prototype); // true
console.log(b.__proto__.__proto__ === Object.prototype); // true
console.log(c.__proto__.__proto__ === Object.prototype); // true

// 拆分指向
console.log(a.__proto__ === Function.prototype); // true
console.log(Function.prototype.__proto__ === Object.prototype); // true
console.log(b.__proto__ === Array.prototype); // true
console.log(Array.prototype.__proto__ === Object.prototype); // true
console.log(c.__proto__ === Number.prototype); // true
console.log(Number.prototype.__proto__ === Object.prototype); // true

// 使用instanceof 实际也是检测原型链
// instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上
console.log(a instanceof Object); // true
console.log(b instanceof Object); // true
console.log(c instanceof Object); // true
```

## Function
`JavaScript`中的所有的构造函数都继承自`Function`，包括`Object`构造函数，`Function`构造函数也继承于自己，当然`Function`也是继承于`Object.prototype`，可以说是先有的`Object.prototype`， `Object.prototype`构造出`Function.prototype`，然后`Function.prototype`构造出`Object`和`Function`。

```javascript
// 构造函数对象
var a = function(){} // 构造函数对象

// 检查原型链
console.log(a.__proto__ === Function.prototype); // true
console.log(Object.__proto__ === Function.prototype); // true
console.log(Function.__proto__ === Function.prototype); // true
console.log(Function.prototype.__proto__ === Object.prototype); // true

// 使用instanceof 
console.log(a instanceof Function); // true
console.log(Object instanceof Function); // true
console.log(Function instanceof Function); // true
```

## 总结
* 一切对象都继承于`Object`，都是从`Object.prototype`继承方法和属性
* 一切构造函数包括`Object`与`Function`，都继承于`Function`，最终继承于`Object`


## 参考

```
https://www.cnblogs.com/tiancai/p/7463252.html
https://www.cnblogs.com/yf2196717/p/10989466.html
https://www.cnblogs.com/ioveNature/p/6880176.html
https://www.cnblogs.com/tiffanybear/p/11320651.html
https://blog.csdn.net/backee/article/details/83378772
https://blog.csdn.net/weixin_34237596/article/details/88026745
```
