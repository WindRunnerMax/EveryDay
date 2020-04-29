# Js箭头函数
箭头函数是`ES6`新增的语法，提供了一种更加简洁的函数书写方式，类似于匿名函数，并且简化了函数定义。

## 完整写法
完整写法类似于匿名函数，省略了`function`关键字。
```javascript
var s = (a,b) => {
    console.log(a, b); // 1 2
    return a + b;
}
s(1,2);
```
```javascript
// 相当于
var s = function(a,b) {
    console.log(a, b); // 1 2
    return a + b;
}
s(1,2);
```

## 省略小括号
当参数只有`1`个时，可以省略小括号，当没有参数或者两个以上的参时不能省略小括号。
```javascript
var s = a => {
    console.log(a); // 1
    return a + a;
}
s(1);
```
```javascript
// 相当于
var s = function(a) {
    console.log(a); // 1
    return a + a;
}
s(1);
```

## 省略大括号
当函数体只有一行语句时，可以省略`{}`，并且会自动`return`这条语句的返回值。
```javascript
var cmp = (a, b) => a - b;
var a = [5, 4, 3, 2, 1];
var sortedArr = a.sort(cmp);
console.log(sortedArr); // [1, 2, 3, 4, 5]
```
```javascript
// 相当于
var cmp = function(a, b) { return a - b; };
var a = [5, 4, 3, 2, 1];
var sortedArr = a.sort(cmp);
console.log(sortedArr); // [1, 2, 3, 4, 5]
```

## 省略小括号与大括号
当满足上述两个条件时，小括号与大括号可以全部省略。
```javascript
var s = a => a * 2;
console.log(s(1)); // 2
```
```javascript
// 相当于
var s = function(a) { return a * 2; }
console.log(s(1)); // 2
```
## 返回对象字面量
省略写法返回对象时注意需要使用`()`将对象包裹，否则浏览器会把对象的`{}`解析为箭头函数函数体的开始和结束标记。
```javascript
var s = a => ({"a": a * 2});
console.log(s(1)); // {a: 2}
```
```javascript
// 相当于
var s = function(a) { return {"a": a * 2}; }
console.log(s(1)); // {a: 2}
```

## 没有单独的this
箭头函数没有单独的`this`，在箭头函数的函数体中使用`this`时，会取得其上下文`context`环境中的`this`。箭头函数调用时并不会生成自身作用域下的`this`，它只会从自己的作用域链的上一层继承`this`。由于箭头函数没有自己的`this`指针，使用`apply`、`call`、`bind`仅能传递参数而不能动态改变箭头函数的`this`指向。
```javascript
var obj = {
    s1: () => {
        console.log(this);
    },
    s2: function(){
        console.log(this);
    }
}

obj.s1(); // Window ...
obj.s2(); // {s1: ƒ, s2: ƒ}

/*
 在调用时运行的环境是Window，而s1为箭头函数不改变this指向，所以指向Window
 s2为普通函数，可以改变this指向，所以this指向了调用者
*/
```
```javascript
var contextObj = {
    e: function() {
        var obj = {
            s1: () => {
                console.log(this);
            },
            s2: function(){
                console.log(this);
            }
        }
        
        obj.s1(); // {e: ƒ}
        obj.s2(); // {s1: ƒ, s2: ƒ}
    }
}
contextObj.e();
/*
 在调用时运行的环境是contextObj对象，而s1为箭头函数不改变this指向，所以指向contextObj对象
 s2为普通函数，可以改变this指向，所以this指向了调用者
*/
```
利用箭头函数的`this`指向特点可以解决一些问题，例如常见的回调函数中`this`指向问题。
```javascript
// 常见的回调函数this指向问题
var a = 1;
var obj = {
    a: 2,
    run: function(){
        var callback = function(){
            console.log(this.a);
        }
        setTimeout(callback,1000); // 1 // 回调函数this调用时指向了Window
    }
}
obj.run();
```
对于这个问题可以将`this`值分配给封闭的变量来解决。
```javascript
var a = 1;
var obj = {
    a: 2,
    run: function(){
        var that = this;
        var callback = function(){
            console.log(that.a);
        }
        setTimeout(callback,1000); // 2
    }
}
obj.run();
```
也可以使用`bind`来事先将函数执行时的`this`绑定。
```javascript
var a = 1;
var obj = {
    a: 2,
    run: function(){
        var callback = function(){
            console.log(this.a);
        }
        setTimeout(callback.bind(this),1000); // 2
    }
}
obj.run();
```
使用箭头函数可以直接编写回调函数而不改变`this`指向，箭头函数不会创建自己的`this`，它只会从自己的作用域链的上一层继承`this`。
```javascript
var a = 1;
var obj = {
    a: 2,
    run: function(){
        var callback = () => {
            console.log(this.a);
        }
        setTimeout(callback,1000); // 2
    }
}
obj.run();
```

## 不绑定arguments
箭头函数不绑定`arguments`，在箭头函数函数体内取得`arguments`只是引用了封闭作用域内的`arguments`，不会生成自身作用域下的`this`和`arguments`值。

```javascript
function s(a,b){
    console.log(...arguments); // 1 2
    var ss1 = (c) => {
        console.log(...arguments); // 1 2
    }
    var ss2 = function(c){
        console.log(...arguments); // 3
    }
    ss1(3);
    ss2(3);
}
s(1, 2);
```

## 不能用作构造器
箭头函数不能用作构造器，使用`new`实例化时会抛出异常。
```javascript
var s = () => {};
new s(); // Uncaught TypeError: s is not a constructor
```

## 没有原型属性
箭头函数没有`prototype`属性。
```javascript
var s = () => {};
console.log(s.prototype); // undefined
```

## 不能用作函数生成器
箭头函数不能用作函数生成器，`yield`关键字通常不能在箭头函数中使用，除非是嵌套在允许使用的函数内。



## 每日一题
```
https://github.com/WindrunnerMax/EveryDay
```


## 参考
```
https://segmentfault.com/a/1190000010159725
https://www.runoob.com/w3cnote/es6-function.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions
```
