# Generator函数
生成器`generator`是`ES6`标准引入的新的数据类型，一个`generator`看上去像一个函数，但可以返回多次，通过`yield`关键字，把函数的执行流挂起，为改变执行流程提供了可能，从而为异步编程提供解决方案。

## 方法
* `Generator.prototype.next()`：返回一个由`yield`表达式生成的值。
* `Generator.prototype.return()`：返回给定的值并结束生成器。
* `Generator.prototype.throw()`：向生成器抛出一个错误。

## 实例
使用`function*`声明方式会定义一个生成器函数`generator function`，它返回一个`Generator`对象，可以把它理解成，`Generator`函数是一个状态机，封装了多个内部状态，执行`Generator`函数会返回一个遍历器对象。  
调用一个生成器函数并不会马上执行它里面的语句，而是返回一个这个生成器的迭代器`iterator `对象，他是一个指向内部状态对象的指针。当这个迭代器的`next()`方法被首次（后续）调用时，其内的语句会执行到第一个（后续）出现`yield`的位置为止，`yield`后紧跟迭代器要返回的值，也就是指针就会从函数头部或者上一次停下来的地方开始执行到下一个`yield`。或者如果用的是`yield*`，则表示将执行权移交给另一个生成器函数（当前生成器暂停执行）。  
`next()`方法返回一个对象，这个对象包含两个属性：`value`和`done`，`value`属性表示本次`yield`表达式的返回值，`done`属性为布尔类型，表示生成器后续是否还有`yield`语句，即生成器函数是否已经执行完毕并返回。  

```javascript
function* f(x) {
    yield x + 10;
    yield x + 20;
    return x + 30;
}
var g = f(1);
console.log(g); // f {<suspended>}
console.log(g.next()); // {value: 11, done: false}
console.log(g.next()); // {value: 21, done: false}
console.log(g.next()); // {value: 31, done: true}
console.log(g.next()); // {value: undefined, done: true} // 可以无限next()，但是value总为undefined，done总为true
```
调用`next()`方法时，如果传入了参数，那么这个参数会传给上一条执行的`yield`语句左边的变量。

```javascript
function* f(x) {
    var y = yield x + 10;
    console.log(y);
    yield x + y;
    console.log(x,y);
    return x + 30;
}
var g = f(1);
console.log(g); // f {<suspended>}
console.log(g.next()); // {value: 11, done: false}
console.log(g.next(50)); // {value: 51, done: false} // y被赋值为50
console.log(g.next()); // {value: 31, done: true} // x,y 1,50
console.log(g.next()); // {value: undefined, done: true}
```
若显式指明`return`方法给定返回值，则返回该值并结束遍历`Generator`函数，若未显式指明`return`的值，则返回`undefined`

```javascript
function* f(x) {
    yield x + 10;
    yield x + 20;
    yield x + 30;
}
var g = f(1);
console.log(g); // f {<suspended>}
console.log(g.next()); // {value: 11, done: false}
console.log(g.next()); // {value: 21, done: false}
console.log(g.next()); // {value: 31, done: false} // 注意此处的done为false
console.log(g.next()); // {value: undefined, done: true}
```
`yield*`表达式表示`yield`返回一个遍历器对象，用于在`Generator`函数内部，调用另一个 `Generator`函数。

```javascript
function* callee() {
    yield 100;
    yield 200;
    return 300;
}
function* f(x) {
    yield x + 10;
    yield* callee();
    yield x + 30;
}
var g = f(1);
console.log(g); // f {<suspended>}
console.log(g.next()); // {value: 11, done: false}
console.log(g.next()); // {value: 100, done: false}
console.log(g.next()); // {value: 200, done: false}
console.log(g.next()); // {value: 31, done: false}
console.log(g.next()); // {value: undefined, done: true}
```
## 应用场景

### 异步操作的同步化表达

```javascript
var it = null;

function f(){
    var rand = Math.random() * 2;
    setTimeout(function(){
        if(it) it.next(rand);
    },1000)
}
function success(r1,r2,r3){
    console.log(r1,r2,r3); // 0.11931234806372775 0.3525336021860719 0.39753321774160844
}
// 成为线性任务而解决嵌套
function* g(){ 
    var r1 = yield f();
    console.log(r1);
    var r2 = yield f();
    console.log(r2);
    var r3 = yield f();
    console.log(r3);
    success(r1,r2,r3);
}

it = g();
it.next();
```

### 整理

```
长轮询 https://www.cnblogs.com/wjyz/p/11102379.html
延迟执行 无限序列 http://www.hubwiz.com/exchange/57fb046ce8424ba757b8206d
斐波那契数列 https://www.liaoxuefeng.com/wiki/1022910821149312/1023024381818112
迭代器 https://zhuanlan.zhihu.com/p/24729321?utm_source=tuicool&utm_medium=referral
线性方式 https://blog.csdn.net/astonishqft/article/details/82782422?depth_1-utm_source=distribute.pc_relevant.none-task&utm_source=distribute.pc_relevant.none-task
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```


## 参考

```
https://www.runoob.com/w3cnote/es6-generator.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/function*
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator
```


