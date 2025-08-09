# null和undefined的区别
在`Js`中`null`与`undefined`是两种基本数据类型，都可以用来表示"无"这个概念，但是在语义表达以及实际使用上是有所区别的。

## 概述
大多数计算机语言只有一个用来表示"无"这个概念的值，例如`C`与`C++`的`NULL`、`Java`与`PHP`的`null`、`Python`的`None`、`lua`与`Ruby`的`nil`，但是在`Js`中有`null`与`undefined`两种基本数据类型来表示"无"这个概念。在很多情况下`null`和`undefined`几乎等价，例如在`if`语句中，都会被自动转为`false`。

```javascript
var _null = null;
var _undefined = undefined;

if(!_null && !_undefined) console.log("true && true"); // true && true
```

在`==`运算符中认为`null`与`undefined`相等，当然在`===`运算符中认为`null`与`undefined`是不相等的。

```javascript
console.log(null == undefined); // true
console.log(null === undefined); // false
```

使用`null`与`undefined`来表示"无"是一个历史遗留原因，最初设计的时候`Js`只设置了`null`作为表示"无"的值，根据`C`语言的传统，`NULL`被设计成可以自动转为`0`，但是`JavaScript`的设计者`Brendan Eich`，觉得这样做还不够，首先最初设计`Js`的时候认为`null`是一个`Object`，这也就是`typeof(null) === object`的原因，虽然后来有过提议更改`null`的类型`typeof(null) === null`，但是因为提议因为会造成大量旧`Js`脚本出现问题而被否决了，`Brendan Eich`觉得表示"无"的值最好不是对象，且如果`null`自动转为`0`，很不容易发现错误，因此`Brendan Eich`又设计了一个`undefined`数据类型。  
虽然`null`与`undefined`具有非常高的相似性，但是其在语义与实际使用中是需要有所区分的，`undefined`表示不存在该值的定义，`null`表示一个值被定义了，定义为"空值"，因此设置一个值为`null`是合理的，例如`obj.v = null;`，但设置一个值为`undefined`是不合理的，因为其已经被主动声明定义，而设置为`undefined`未定义是不合理的。

## 区别

* `null`是一个表示"无"的对象，`Number(null) === 0`，`undefined`是一个表示"无"的原始值，`Number(undefined) === NaN`。
* `null`表示一个值被定义了，但是这个值是空值。
    * 作为函数的参数，表示函数的参数不是对象。
    * 作为对象原型链的终点`Object.getPrototypeOf(Object.prototype)`。
* `undefined`表示不存在该值的定义。
    * 变量被声明了还没有赋值，表现为`undefined`。
    * 调用函数时应该提供的参数没有提供，参数值表现为`undefined`。
    * 对象没有赋值的属性，该属性的值就表现为`undefined`。
    * 函数没有返回值，默认返回`undefined`。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.cnblogs.com/sunyang-001/p/10792894.html
http://www.ruanyifeng.com/blog/2014/03/undefined-vs-null.html
https://blog.csdn.net/weixin_39713762/article/details/93807832
```
