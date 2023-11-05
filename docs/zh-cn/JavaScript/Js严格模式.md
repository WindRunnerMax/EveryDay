# Js严格模式
`JavaScript`严格模式`strict mode`，即在严格的条件下运行。严格模式消除了`Javascript`语法的一些不合理、不严谨之处，减少一些怪异行为；消除代码运行的一些不安全之处，保证代码运行的安全；提高了引擎的效率，增加运行速度；为未来新的`Js`版本做好铺垫。

## 实例
针对整个脚本文件启用严格模式。

```javascript
"use strict";
x = 1; // Uncaught ReferenceError: x is not defined
```
针对函数作用域启用严格模式。

```javascript
x = 1;
function s(){
    "use strict";
    y = 1; // Uncaught ReferenceError: y is not defined
}
s();
```

## 严格模式的限制

### 不允许直接声明全局变量
```javascript
// 非严格模式
x = 1;
console.log(window.x); // 1
```

```javascript
// 严格模式
"use strict";
var x = 1; // 可以使用var在全局作用域声明全局变量
y = 1; // Uncaught ReferenceError: y is not defined
```

### 不允许delete变量和函数
```javascript
// 非严格模式
var x = 1;
delete x; 
console.log(window.x); // undefined
```

```javascript
// 严格模式
"use strict";
var x = 1;
delete x; // Uncaught SyntaxError: Delete of an unqualified identifier in strict mode.
```
### 要求函数的参数名唯一
```javascript
// 非严格模式
function s(a, a){
    console.log(a + a); // 6
}
s(2, 3);
```

```javascript
// 严格模式
"use strict";
function s(a, a){ // Uncaught SyntaxError: Duplicate parameter name not allowed in this context
    console.log(a + a);
}
s(2, 3);
```

### 不允许使用八进制数字语法
```javascript
// 非严格模式
var x = 010;
console.log(x); // 8
```

```javascript
// 严格模式
"use strict";
var y = 010; // Uncaught SyntaxError: Octal literals are not allowed in strict mode.
var x = 0O10; // 可以使用ES6中的八进制表示法新写法 前缀0o或0O
console.log(x); // 8
```

### 不允许使用转义字符
```javascript
// 非严格模式
var x = "\045";
console.log(x); // %
```

```javascript
// 严格模式
"use strict";
var x = "\045"; // Uncaught SyntaxError: Octal escape sequences are not allowed in strict mode.
```

### 不允许对只读属性操作
```javascript
// 非严格模式
// 操作静默失败，即不报错也没有任何效果

// 给不可写属性赋值
var obj = {};
Object.defineProperty(obj, "x", {value:0, writable:false});
obj.x = 1;
console.log(obj.x); // 0

// 给只读属性赋值
var obj = { 
    _x: 0,
    get x() { return this._x; } 
};
obj.x = 1;
console.log(obj.x); // 0

// 给不可扩展对象的新属性赋值
var obj = {};
Object.preventExtensions(obj);
obj.x = 1;
console.log(obj.x); // undefined
```

```javascript
// 严格模式
// 操作失败抛出异常
"use strict";

// 给不可写属性赋值
var obj = {};
Object.defineProperty(obj, "x", {value:0, writable:false});
obj.x = 1; // Uncaught TypeError: Cannot assign to read only property 'x' of object '#<Object>'

// 给只读属性赋值
var obj = { 
    _x: 0,
    get x() { return this._x; } 
};
obj.x = 1; // Uncaught TypeError: Cannot set property x of #<Object> which has only a getter

// 给不可扩展对象的新属性赋值
var obj = {};
Object.preventExtensions(obj);
obj.x = 1; // Uncaught TypeError: Cannot add property x, object is not extensible
```

### 不允许使用保留关键字命名变量
```javascript
// 非严格模式
var eval = 1;
console.log(eval); // 1
```

```javascript
// 严格模式
"use strict";
var eval = 1; // Uncaught SyntaxError: Unexpected eval or arguments in strict mode
```

### 不允许使用with关键字
```javascript
// 非严格模式
var obj = { x:0 };
with(obj) {
    x = 1;
}
```

```javascript
// 严格模式
"use strict";
var obj = { x:0 };
with(obj) { // Uncaught SyntaxError: Strict mode code may not include a with statement
    x = 1;
}
```

### eval声明变量不能在外部使用
```javascript
// 非严格模式
eval("var x = 0");
console.log(x); // 0
```

```javascript
// 严格模式
"use strict";
eval("var x = 0"); // eval作用域
console.log(x); // Uncaught ReferenceError: x is not defined
```

### arguments保留原始参数
```javascript
// 非严格模式
function s(a, b){
    a = 2;
    console.log(arguments[0], arguments[1]); // 2 2
}
s(1, 2);
```

```javascript
// 严格模式
"use strict";
function s(a, b){
    a = 2;
    console.log(arguments[0], arguments[1]); // 1 2
}
s(1, 2);
```

### this的限制
在严格模式下通过`this`传递给一个函数的值不会被强制转换为一个对象。对一个普通的函数来说，`this`总会是一个对象：不管调用时`this`它本来就是一个对象；还是用布尔值，字符串或者数字调用函数时函数里面被封装成对象的`this`；还是使用`undefined`或者`null`调用函数式`this`代表的全局对象（使用`call`,`apply`或者`bind`方法来指定一个确定的`this`）。这种自动转化为对象的过程不仅是一种性能上的损耗，同时在浏览器中暴露出全局对象也会成为安全隐患，因为全局对象提供了访问那些所谓安全的`JavaScript`环境必须限制的功能的途径。所以对于一个开启严格模式的函数，指定的`this`不再被封装为对象，而且如果没有指定`this`的话它值是`undefined`。
```javascript
// 非严格模式
function s(){
    console.log(this); // Window ...
}
s();
```

```javascript
// 严格模式
"use strict";
function s(){
    console.log(this); // undefined
}
s();
```

### 禁止访问调用栈
在严格模式中再也不能通过广泛实现的`ECMAScript`扩展游走于`JavaScript`的栈中。在普通模式下用这些扩展的话，当一个叫`fun`的函数正在被调用的时候，`fun.caller`是最后一个调用`fun`的函数，而且`fun.arguments`包含调用fun时用的形参。这两个扩展接口对于安全`JavaScript`而言都是有问题的，因为他们允许安全的代码访问专有函数和他们的（通常是没有经过保护的）形参。如果`fun`在严格模式下，那么`fun.caller`和`fun.arguments`都是不可删除的属性而且在存值、取值时都会报错。
```javascript
// 非严格模式
function ss(){
    console.log(ss.caller); // ƒ s(){ ss(); }
    console.log(ss.arguments); // Arguments [callee: ƒ, Symbol(Symbol.iterator): ƒ]
}
function s(){
    ss();
}
s();
```

```javascript
// 严格模式
"use strict";
function ss(){
    console.log(ss.caller); // Uncaught TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them
    console.log(ss.arguments); // Uncaught TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them ƒ]
}
function s(){
    ss();
}
s();
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```


## 参考

```
https://www.runoob.com/js/js-strict.html
https://www.cnblogs.com/xumqfaith/p/7841338.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode
```
