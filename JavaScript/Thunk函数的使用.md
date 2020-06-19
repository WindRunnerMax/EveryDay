# Thunk函数的使用
编译器的求值策略通常分为传值调用以及传名调用，`Thunk`函数是应用于编译器的传名调用实现，往往是将参数放到一个临时函数之中，再将这个临时函数传入函数体，这个临时函数就叫做`Thunk` 函数。

## 求值策略
编译器的求值策略通常分为传值调用以及传名调用，在下面的例子中，将一个表达式作为参数进行传递，传值调用以及传名调用中实现的方式有所不同。

```javascript
var x = 1;

function s(y){
    console.log(y + 1); // 3
}

s(x + 1);
```
在上述的例子中，无论是使用传值调用还是使用传名调用，执行的结果都是一样的，但是其调用过程不同：  
* 传值调用：首先计算`x + 1`，然后将计算结果`2`传递到`s`函数，即相当于调用`s(2)`。  
* 传名调用：直接将`x + 1`表达式传递给`y`，使用时再计算`x + 1`，即相当于计算`(x + 1) + 1`。

传值调用与传名调用各有利弊，传值调用比较简单，但是对参数求值的时候，实际上还没用到这个参数，有可能造成没有必要的计算。传名调用可以解决这个问题，但是实现相对来说比较复杂。

```javascript
var x = 1;

function s(y){
    console.log(y + 1); // 3
}

s(x + 1, x + 2);
```
在上面这个例子中，函数`s`并没有用到`x + 2`这个表达式求得的值，使用传名调用的话只将表达式传入而并未计算，只要在函数中没有用到`x + 2`这个表达式就不会计算，使用传值调用的话就会首先将`x + 2`的值计算然后传入，如果没有用到这个值，那么就多了一次没有必要的计算。`Thunk`函数就是作为传名调用的实现而构建的，往往是将参数放到一个临时函数之中，再将这个临时函数传入函数体，这个临时函数就叫做`Thunk` 函数。

```javascript
var x = 1;

function s(y){
    console.log(y + 1); // 3
}

s(x + 1);

// 等同于

var x = 1;

function s(thunk){
    console.log(thunk() + 1); // 3
}

var thunk = function(){
    return x + 1;
}

s(thunk);
```


## Js中的Thunk函数
`Js`中的求值策略是是传值调用，在`Js`中使用`Thunk`函数需要手动进行实现且含义有所不同，在`Js`中，`Thunk`函数替换的不是表达式，而是多参数函数，将其替换成单参数的版本，且只接受回调函数作为参数。

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
https://www.jianshu.com/p/9302a1d01113
https://segmentfault.com/a/1190000017211798
http://www.ruanyifeng.com/blog/2015/05/thunk.html
```
