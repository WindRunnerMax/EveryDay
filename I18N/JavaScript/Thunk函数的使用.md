# The use of Thunk functions

The evaluation strategy of the compiler is usually divided into call by value and call by name. `Thunk` function is used to implement call by name in the compiler. It often places the parameters into a temporary function and then passes this temporary function into the body of the function, and this temporary function is called `Thunk` function.

## Evaluation strategy

The evaluation strategy of the compiler is usually divided into call by value and call by name. In the example below, passing an expression as a parameter, the ways of implementation in call by value and call by name are different.

```javascript
var x = 1;

function s(y){
    console.log(y + 1); // 3
}

s(x + 1);
```

In the above example, whether using call by value or call by name, the result of the execution is the same, but their calling processes are different:
* Call by value: First calculate `x + 1`, then pass the calculated result `2` to the `s` function, which is equivalent to calling `s(2)`.
* Call by name: Directly pass the `x + 1` expression to `y`, and calculate `x + 1` when using it, which is equivalent to calculating `(x + 1) + 1`.

Call by value and call by name each have their own pros and cons. Call by value is relatively simple, but when evaluating parameters, the actual value of the parameter is not used, which may cause unnecessary calculations. Call by name can solve this problem, but the implementation is relatively more complex.

```javascript
var x = 1;

function s(y){
    console.log(y + 1); // 3
}

s(x + 1, x + 2);
```

In the above example, the function `s` did not use the value obtained from the expression `x + 2`. When using call by name, only the expression is passed without being calculated, and it will not be calculated unless it is used in the function. If using call by value, the value of `x + 2` will be calculated first and then passed in. If it is not used, then there will be an unnecessary calculation. `Thunk` function is designed as an implementation of call by name, often placing the parameters into a temporary function and then passing this temporary function into the body of the function, and this temporary function is called `Thunk` function.

```javascript
var x = 1;

function s(y){
    console.log(y + 1); // 3
}

s(x + 1);

// Equivalent to

var x = 1;

function s(thunk){
    console.log(thunk() + 1); // 3
}

var thunk = function(){
    return x + 1;
}

s(thunk);
```

## Thunk functions in Js

The evaluation strategy in `Js` is call by value. Using `Thunk` functions in `Js` needs to be manually implemented and has a different meaning. In `Js`, `Thunk` function replaces not an expression, but a multi-argument function, by replacing it with a single-parameter version and only accepting a callback function as a parameter.

```javascript
// Assuming a delay function needs to pass some parameters
// The typical version is as follows
var delayAsync = function(time, callback,...args){
    setTimeout(() => callback(...args), time);
}

var callback = function(x, y, z){
    console.log(x, y, z);
}

delayAsync(1000, callback, 1, 2, 3);

// Using Thunk function

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

Implement a simple `Thunk` function converter. For any function, as long as the parameters have a callback function, it can be written in the form of a `Thunk` function.

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


```javascript
thunkFunct = delayAsyncThunk(1000, 1, 2, 3);
thunkFunct(callback);
```
It might be that `Thunk` functions were not widely used before `ES6`; however, after `ES6`, `Generator` functions appeared, and by using `Thunk` functions, they can be automatically used for managing the flow of `Generator` functions. Firstly, let's talk about the basic usage of `Generator` functions. When calling a generator function, its statements are not executed immediately. Instead, it returns an iterator object that points to the internal state object of the generator. When the `next()` method of this iterator is called for the first time (subsequently), its statements execute until the first (subsequent) `yield` is encountered. Following a `yield`, the iterator returns the value and the pointer starts executing from the beginning of the function or the previous suspended point until the next `yield`. Alternatively, if `yield*` is used, it indicates the transfer of control to another generator function (pausing the current generator).

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
console.log(g.next()); // {value: undefined, done: true} // It can be called indefinitely with next(), but the value is always undefined and done is always true
```

Since `Generator` functions can temporarily suspend the execution of a function, they can be used with asynchronous tasks. After one task is completed, the next one can continue. The following example demonstrates the synchronization of asynchronous tasks. When the previous delayed timer is finished, the next timer task will proceed. This approach can solve the problem of nested asynchronous tasks. For example, using callbacks, after a network request, adding a callback for the next request can easily lead to callback hell. However, `Generator` functions can solve this issue. In fact, `async/await` is an asynchronous solution based on `Generator` functions and `Promise`.

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
Even though the above example can run automatically, it's not very convenient. Now, let's implement an automatic flow management function using a `Thunk` function. This function automatically handles the processing of callback functions. All you need to do in the `Thunk` function is pass the parameters required for the function's execution, such as the example's `index`. Then, you can write the body of the `Generator` function so that the left-hand side variable receives the parameters executed by the `Thunk` function. When using the `Thunk` function for automatic flow management, you must ensure that `yield` is followed by a `Thunk` function. 

As for the automatic flow management function `run`, when the `next()` method is called with an argument, this argument is passed to the left-hand side variable of the previous executed `yield` statement. In this function, when the `next` is first executed without passing any parameters (and there is no receiving variable statement above the first `yield`), no parameter needs to be passed. The next step is to determine if this generator function has finished execution. Since it has not finished, the custom `next` function is passed into `res.value`. It's important to note that `res.value` is a function. Executing the commented line below in the example, you can see that this value is `f(funct){...}`. By passing the custom `next` function, the execution authority is given to the `f` function. After this function completes the asynchronous task, the callback function is executed, triggering the next `next` method of the generator. This `next` method is passed with a parameter, and, as mentioned earlier, passing a parameter transfers it to the left-hand side variable of the previous executed `yield` statement. Thus, in this execution, this parameter value is passed to `r1`, and then `next` continues to be executed repeatedly until the generator function finishes running. This achieves automatic flow management.

```javascript
function thunkFunct(index){
    return function f(funct){
        var rand = Math.random() * 2;
        setTimeout(() => funct({rand:rand, index: index}), 1000)
    }
}
```

```javascript
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




## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/9302a1d01113
https://segmentfault.com/a/1190000017211798
http://www.ruanyifeng.com/blog/2015/05/thunk.html
```