# Js创建对象的方式
`Js`创建对象的方式，这里的对象除了指`Js`内置`Object`对象之外还有更加广义上的面向对象编程中的对象。

## 字面量方式
对象字面变量是对象定义的一种简写形式，能够简化创建包含大量属性的对象的过程。

```javascript
var obj = {
    a: 1,
    b: function(){
        return this.a;
    }
}
console.log(obj); // {a: 1, b: ƒ}
```

在`ES6`中使用字面量创建对象时还可以配合`Spread`操作符与解构赋值使用。

```javascript
var o1 = {a: 1, b: 11}
var o2 = {c: 111, d: 1111}

var o3 = {...o1, ...o2}
var {a, b} = {a: 1, b: 2}

console.log(o3); // {a: 1, b: 11, c: 111, d: 1111}
console.log(a, b); // 1 2
```

## Object构造函数
使用`Object`构造函数创建对象使用与字面量创建相同，但是需要单独指定内部成员。

```javascript
var obj = new Object();
obj.a = 1;
obj.b = function(){
    return this.a;
}
console.log(obj); // {a: 1, b: ƒ}
```

## Object.create
`Object.create()`方法创建一个新对象，使用现有的对象来提供新创建的对象的`__proto__`。

```javascript
var obj = Object.create(null); // 创建一个没有原型链指向的对象
var obj = Object.create(Object.prototype); // 等同于 new Object()
obj.a = 1;
obj.b = function(){
    return this.a;
}
console.log(obj); // {a: 1, b: ƒ}

```

## 工厂模式
构造创建对象的工厂，调用即产生对象，能够减少重复代码，减小代码冗余。

```javascript
function factory(){
    var o = new Object();
    o.a = 1;
    o.b = function(){
        return this.a;
    }
    return o;
}
var obj = factory();
console.log(obj); // {a: 1, b: ƒ}
```

## 构造函数
使用`new`关键字可以简化创建多个属性值相同的对象的操作，并能够显式获取对象类型。

```javascript
function _object(){
    this.a = 1;
    this.b = function(){
        return this.a;
    }
}
var obj = new _object();
console.log(obj); // _object {a: 1, b: ƒ}
console.log(obj instanceof _object); // true
```

## 原型模式
使用原型创建对象的方式，可以让所有对象实例共享它所包含的属性和方法。

```javascript
function _object(){}
_object.prototype.a = 1;
_object.prototype.b = function(){
    return this.a;
}
var obj = new _object();
console.log(obj); // _object {}
console.log(obj.a); // 1
console.log(obj.b()); // 1
console.log(obj instanceof _object); // true
```

## 构造函数和原型组合
构造函数和原型组合的方式解决可以解决原型模式下不能传递参数的问题，也能解决在构造函数模式下不能共享实例方法的问题。

```javascript
function _object(){
    this.a = 1;
}
_object.prototype.b = function(){
    return this.a;
}
var obj = new _object();
console.log(obj); // _object {a: 1}
console.log(obj.a); // 1
console.log(obj.b()); // 1
console.log(obj instanceof _object); // true
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://juejin.im/post/5b150fcf518825139b18de11
https://juejin.im/entry/58291447128fe1005cd41c52
https://www.cnblogs.com/shirliey/p/11696412.html
```
