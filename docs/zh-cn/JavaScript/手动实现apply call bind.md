# 手动实现apply、call、bind
每个`Function`对象都存在`apply()`、`call()`、`bind()`方法，其作用都是可以在特定的作用域中调用函数，等于设置函数体内`this`对象的值，以扩充函数赖以运行的作用域。

## apply
`funct.apply(thisArg, [argsArray])`  
`thisArg`: 必选，在`funct`函数运行时使用的`this`值，`this`可能不是该方法看到的实际值，如果这个函数处于非严格模式下，则指定为`null`或`undefined`时会自动替换为指向全局对象，原始值会被包装。  
`argsArray`: 可选，传递一个参数数组或者类数组对象，其中的数组元素将作为单独的参数传给`funct`函数，如果该参数的值为`null`或`undefined`，则表示不需要传入任何参数。  
实现思路，类似于`Function.prototype.apply()`，同样将`_apply()`方法挂载到`Function.prototype`，使得函数对象能够直接调用，在调用`funct._apply()`时，在`_apply()`方法中的`this`指向的是`funct`对象，将此`funct`对象作为一个变量赋予将要绑定的对象的一个属性中，使用将要绑定的对象来调用这个`funct`，即可实现`this`指针指向将要绑定的对象，对于参数的处理，直接使用`ES6`的`Spread`运算符将数组展开作为参数传递。
```javascript
window.a = 1; // 定义一个全局变量
var obj = {a: 2} // 定义一个对象用来绑定
var funct = function(b, c) { console.log(this.a,b,c); return 1; }; // 定义一个函数用来执行

funct(1, 2); // 1 1 2  // 直接执行，相当于window.funct(1, 2)，this绑定于window
funct.apply(obj, [1, 2]); // 2 1 2 // 使用apply将this绑定到obj对象

Function.prototype._apply = function(base, args) { // 拓展Function原型
    base = base || window; // 传递绑定的对象为null或undefined时指向window
    base.fn = this; // 调用_apply时的this指向的是调用者也就是函数对象，将函数对象赋值给base对象的一个属性
    var result = base.fn(...args); // 调用base.fn时，fn中的this指针指向的是base，并使用Spread操作符展开参数传参
    delete base.fn; // 删除base对象的fn属性
    return result; // 将返回值返回
}

funct._apply(obj, [1, 2]); // 2 1 2 // this绑定到了obj对象
```

## call
`funct.call(thisArg[, arg1[, arg2[, ...]]])`  
`thisArg`: 必选，在`funct`函数运行时使用的`this`值，`this`可能不是该方法看到的实际值，如果这个函数处于非严格模式下，则指定为`null`或`undefined`时会自动替换为指向全局对象，原始值会被包装。  
`arg1, arg2, ...`: 可选，指定的参数列表。  
实现思路，类似于`Function.prototype.call()`，同样将`_call()`方法挂载到`Function.prototype`，使得函数对象能够直接调用，在调用`funct._call()`时，在`_call()`方法中的`this`指向的是`funct`对象，将此`funct`对象作为一个变量赋予将要绑定的对象的一个属性中，使用将要绑定的对象来调用这个`funct`，即可实现`this`指针指向将要绑定的对象，对于参数的处理，使用`ES6`的`Rest`操作符来接收剩余参数,使用`ES6`的`Spread`运算符将数组展开作为参数传递。
```javascript
window.a = 1; // 定义一个全局变量
var obj = {a: 2} // 定义一个对象用来绑定
var funct = function(b, c) { console.log(this.a,b,c); return 1; }; // 定义一个函数用来执行

funct(1, 2); // 1 1 2  // 直接执行，相当于window.funct(1, 2)，this绑定于window
funct.call(obj, 1, 2); // 2 1 2 // 使用call将this绑定到obj对象

Function.prototype._call = function(base, ...args) { // 拓展Function原型，使用Rest操作符接收剩余参数
    base = base || window; // 传递绑定的对象为null或undefined时指向window
    base.fn = this; // 调用_call时的this指向的是调用者也就是函数对象，将函数对象赋值给base对象的一个属性
    var result = base.fn(...args); // 调用base.fn时，fn中的this指针指向的是base，并使用Spread操作符展开参数传参
    delete base.fn; // 删除base对象的fn属性
    return result; // 将返回值返回
}

funct._call(obj, 1, 2); // 2 1 2 // this绑定到了obj对象
```

## bind
`funct.bind(thisArg[, arg1[, arg2[, ...]]])`  
`thisArg`: 必选，调用绑定函数时作为`this`参数传递给目标函数的值，如果使用`new`运算符构造绑定函数，则忽略该值，当作为回调提供时，作为`thisArg`传递的任何原始值都将转换为`object`，如果`bind`函数的参数列表为空，或者`thisArg`是`null`或`undefined`，执行作用域的`this`将被视为新函数的`thisArg`。  
`arg1, arg2, ...`: 可选，当目标函数被调用时，被预置入绑定函数的参数列表中的参数。  
实现思路，类似于`Function.prototype.bind()`，同样将`_bind()`方法挂载到`Function.prototype`，使得函数对象能够直接调用，利用箭头函数在词法上绑定`this`值的特性，返回一个指定了`this`的函数，倘若不使用箭头函数，也可以将`this`值分配给封闭的变量来构建闭包，然后是类似于`apply`方法的实现，来绑定`this`到指定的对象。
```javascript
window.a = 1; // 定义一个全局变量
var obj = {a: 2} // 定义一个对象用来绑定
var funct = function(b, c) { console.log(this.a,b,c); return 1; }; // 定义一个函数用来执行

funct(1, 2); // 1 1 2  // 直接执行，相当于window.funct(1, 2)，this绑定于window
var bindFunct = funct.bind(obj, 1, 2); // 使用bind将this绑定到obj对象，bind方法返回一个原函数的拷贝，并拥有指定的this值和初始参数。
bindFunct(); // 2 1 2 

Function.prototype._bind = function(base, ...args1) { // 拓展Function原型，使用Rest操作符接收剩余参数
    return (...args2) => { // 箭头函数不会生成自身作用域下的this，会从自己的作用域链的上一层继承this
        base = base || window; // 传递绑定的对象为null或undefined时指向window
        base.fn = this; // 调用箭头函数时的this指向的是调用者也就是函数对象，将函数对象赋值给base对象的一个属性
        var result = base.fn(...args1, ...args2); // 调用base.fn时，fn中的this指针指向的是base，并使用Spread操作符展开参数传参
        delete base.fn; // 删除base对象的fn属性
        return result; // 将返回值返回
    }
}

var _bindFunct = funct._bind(obj, 1, 2); // 绑定对象
_bindFunct(); // 2 1 2 
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/57a876fe66c8
```
