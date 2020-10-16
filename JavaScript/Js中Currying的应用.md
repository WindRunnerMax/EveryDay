# Js中Currying的应用
柯里化`Currying`是把接受多个参数的函数变换成接受一个单一参数的函数，并且返回接受余下的参数且返回结果的新函数的技术，是函数式编程应用。

## 描述
如果说函数式编程中有两种操作是必不可少的那无疑就是柯里化`Currying`和函数组合`Compose`，柯里化其实就是流水线上的加工站，函数组合就是我们的流水线，它由多个加工站组成。对于加工站即柯里化`Currying`，简单来说就是将一个多元函数，转换成一个依次调用的单元函数，也就是把一个多参数的函数转化为单参数函数的方法，函数的柯里化是用于将一个操作分成多步进行，并且可以改变函数的行为，在我的理解中柯里化实际就是实现了一个状态机，当达到指定参数时就从继续接收参数的状态转换到执行函数的状态。  
简单来说，通过柯里化可以把函数调用的形式改变。

```
f(a,b,c) → f(a)(b)(c)
```

与柯里化非常相似的概念有部分函数应用`Partial Function Application`，这两者不是相同的，部分函数应用强调的是固定一定的参数，返回一个更小元的函数。

```
// 柯里化
f(a,b,c) → f(a)(b)(c)
// 部分函数调用
f(a,b,c) → f(a)(b,c) / f(a,b)(c)
```

柯里化强调的是生成单元函数，部分函数应用的强调的固定任意元参数，而我们平时生活中常用的其实是部分函数应用，这样的好处是可以固定参数，降低函数通用性，提高函数的适合用性，在很多库函数中`curry`函数都做了很多优化，已经不是纯粹的柯里化函数了，可以将其称作高级柯里化，这些版本实现可以根据你输入的参数个数，返回一个柯里化函数/结果值，即如果你给的参数个数满足了函数条件，则返回值。

## 实现
实现一个简单的柯里化的函数，可以通过闭包来实现。

```javascript
var add = function(x) {
  return function(y) {
    return x + y;
  }; 
};
console.log(add(1)(2)); // 3
```

当有多个参数时，这样显然不够优雅，于是封装一个将普通函数转变为柯里化函数的函数。

```javascript
function convertToCurry(funct, ...args) {
    const argsLength = funct.length;
    return function(..._args) {
        _args.unshift(...args);
        if (_args.length < argsLength) return convertToCurry.call(this, funct, ..._args);
        return funct.apply(this, _args);
    }
}

var funct = (x, y, z) => x + y + z;
var addCurry = convertToCurry(funct);
var result = addCurry(1)(2)(3);
console.log(result); // 6
```

举一个需要正则匹配验证手机与邮箱的例子来展示柯里化的应用。

```javascript
function convertToCurry(funct, ...args) {
    const argsLength = funct.length;
    return function(..._args) {
        _args.unshift(...args);
        if (_args.length < argsLength) return convertToCurry.call(this, funct, ..._args);
        return funct.apply(this, _args);
    }
}

var check = (regex, str) =>  regex.test(str);
var checkPhone = convertToCurry(check, /^1[34578]\d{9}$/);
var checkEmail = convertToCurry(check, /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/);
console.log(checkPhone("13300000000")); // true
console.log(checkPhone("13311111111")); // true
console.log(checkPhone("13322222222")); // true
console.log(checkEmail("13300000000@a.com")); // true
console.log(checkEmail("13311111111@a.com")); // true
console.log(checkEmail("13322222222@a.com")); // true
```

## 应用
高级柯里化有一个应用方面在于`Thunk`函数，`Thunk`函数是应用于编译器的传名调用实现，往往是将参数放到一个临时函数之中，再将这个临时函数传入函数体，这个临时函数就叫做`Thunk` 函数。`Thunk`函数将参数替换成单参数的版本，且只接受回调函数作为参数。

```javascript
// 假设一个延时函数需要传递一些参数
// 通常使用的版本如下
var delayAsync = function(time, callback, ...args){
    setTimeout(() => callback(...args), time);
}

var callback = function(x, y, z){
    console.log(x, y, z);
}

delayAsync(1000, callback, 1, 2, 3);

// 使用Thunk函数

var thunk = function(time, ...args){
    return function(callback){
        setTimeout(() => callback(...args), time);
    }
}

var callback = function(x, y, z){
    console.log(x, y, z);
}

var delayAsyncThunk = thunk(1000, 1, 2, 3);
delayAsyncThunk(callback);
```

实现一个简单的`Thunk`函数转换器，对于任何函数，只要参数有回调函数，就能写成`Thunk`函数的形式。


```javascript
var convertToThunk = function(funct){
  return function (...args){
    return function (callback){
      return funct.apply(this, args);
    }
  };
};

var callback = function(x, y, z){
    console.log(x, y, z);
}

var delayAsyncThunk = convertToThunk(function(time, ...args){
    setTimeout(() => callback(...args), time);
});

thunkFunct = delayAsyncThunk(1000, 1, 2, 3);
thunkFunct(callback);
```
`Thunk`函数在`ES6`之前可能应用比较少，但是在`ES6`之后，出现了`Generator`函数，通过使用`Thunk`函数就可以可以用于`Generator`函数的自动流程管理。首先是关于`Generator`函数的基本使用，调用一个生成器函数并不会马上执行它里面的语句，而是返回一个这个生成器的迭代器`iterator `对象，他是一个指向内部状态对象的指针。当这个迭代器的`next()`方法被首次（后续）调用时，其内的语句会执行到第一个（后续）出现`yield`的位置为止，`yield`后紧跟迭代器要返回的值，也就是指针就会从函数头部或者上一次停下来的地方开始执行到下一个`yield`。或者如果用的是`yield*`，则表示将执行权移交给另一个生成器函数（当前生成器暂停执行）。  

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

由于`Generator`函数能够将函数的执行暂时挂起，那么他就完全可以操作一个异步任务，当上一个任务完成之后再继续下一个任务，下面这个例子就是将一个异步任务同步化表达，当上一个延时定时器完成之后才会进行下一个定时器任务，可以通过这种方式解决一个异步嵌套的问题，例如利用回调的方式需要在一个网络请求之后加入一次回调进行下一次请求，很容易造成回调地狱，而通过`Generator`函数就可以解决这个问题，事实上`async/await`就是利用的`Generator`函数以及`Promise`实现的异步解决方案。

```javascript
var it = null;

function f(){
    var rand = Math.random() * 2;
    setTimeout(function(){
        if(it) it.next(rand);
    },1000)
}

function* g(){ 
    var r1 = yield f();
    console.log(r1);
    var r2 = yield f();
    console.log(r2);
    var r3 = yield f();
    console.log(r3);
}

it = g();
it.next();
```
虽然上边的例子能够自动执行，但是不够方便，现在实现一个`Thunk`函数的自动流程管理，其自动帮我们进行回调函数的处理，只需要在`Thunk`函数中传递一些函数执行所需要的参数比如例子中的`index`，然后就可以编写`Generator`函数的函数体，通过左边的变量接收`Thunk`函数中`funct`执行的参数，在使用`Thunk`函数进行自动流程管理时，必须保证`yield`后是一个`Thunk`函数。  
关于自动流程管理`run`函数，首先需要知道在调用`next()`方法时，如果传入了参数，那么这个参数会传给上一条执行的`yield`语句左边的变量，在这个函数中，第一次执行`next`时并未传递参数，而且在第一个`yield`上边也并不存在接收变量的语句，无需传递参数，接下来就是判断是否执行完这个生成器函数，在这里并没有执行完，那么将自定义的`next`函数传入`res.value`中，这里需要注意`res.value`是一个函数，可以在下边的例子中将注释的那一行执行，然后就可以看到这个值是`f(funct){...}`，此时我们将自定义的`next`函数传递后，就将`next`的执行权限交予了`f`这个函数，在这个函数执行完异步任务后，会执行回调函数，在这个回调函数中会触发生成器的下一个`next`方法，并且这个`next`方法是传递了参数的，上文提到传入参数后会将其传递给上一条执行的`yield`语句左边的变量，那么在这一次执行中会将这个参数值传递给`r1`，然后在继续执行`next`，不断往复，直到生成器函数结束运行，这样就实现了流程的自动管理。

```javascript
function thunkFunct(index){
    return function f(funct){
        var rand = Math.random() * 2;
        setTimeout(() => funct({rand:rand, index: index}), 1000)
    }
}

function* g(){ 
    var r1 = yield thunkFunct(1);
    console.log(r1.index, r1.rand);
    var r2 = yield thunkFunct(2);
    console.log(r2.index, r2.rand);
    var r3 = yield thunkFunct(3);
    console.log(r3.index, r3.rand);
}

function run(generator){
    var g = generator();

    var next = function(data){
        var res = g.next(data);
        if(res.done) return ;
        // console.log(res.value);
        res.value(next);
    }

    next();
}

run(g);
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/5e1899fe7d6b
https://zhuanlan.zhihu.com/p/108594470
https://juejin.im/post/6844903936378273799#heading-12
https://blog.csdn.net/crazypokerk_/article/details/97674338
http://www.qiutianaimeili.com/html/page/2019/05/54g0vvxycyg.html
https://baike.baidu.com/item/%E6%9F%AF%E9%87%8C%E5%8C%96/10350525?fr=aladdin
https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch4.html#%E4%B8%8D%E4%BB%85%E4%BB%85%E6%98%AF%E5%8F%8C%E5%85%B3%E8%AF%AD%E5%92%96%E5%96%B1
```
