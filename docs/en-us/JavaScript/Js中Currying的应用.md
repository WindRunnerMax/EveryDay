# Application of Currying in JavaScript

Currying is the technique of transforming a function that accepts multiple parameters into a function that accepts a single parameter and returns a new function that accepts the remaining parameters and returns the result. It is an application of functional programming.

## Description
In functional programming, two essential operations are undoubtedly currying and function composition. Currying is like a processing station on a production line, and function composition is the production line comprising multiple processing stations. For a processing station like currying, it simply converts a multi-parameter function into a sequentially called unary function. This means it converts a multi-parameter function into a single-parameter function, allowing the function's behavior to be changed. In my understanding, currying actually implements a state machine that transitions from the state of receiving parameters to the state of executing the function when a specific number of parameters is reached. 
In simple terms, currying can change the form of function calls.

```
f(a,b,c) → f(a)(b)(c)
```

A concept very similar to currying is Partial Function Application, but they are not the same. Partial function application emphasizes fixing a certain number of parameters and returning a smaller function.

```
// Currying
f(a,b,c) → f(a)(b)(c)
// Partial function application
f(a,b,c) → f(a)(b,c) / f(a,b)(c)
```

Currying emphasizes generating unary functions, while partial function application emphasizes fixing any number of parameters. In our daily lives, what we usually use is actually partial function application. Its advantage is the ability to fix parameters, reduce the generality of functions, and enhance the suitability of functions. In many library functions, the `curry` function has been heavily optimized and is no longer a pure currying function. It can be called advanced currying, as these versions can return a currying function/result value based on the number of input parameters.

## Implementation
To implement a simple currying function, we can use closures.

```javascript
var add = function(x) {
  return function(y) {
    return x + y;
  }; 
};
console.log(add(1)(2)); // 3
```

When there are multiple parameters, this approach is obviously not elegant. So, we can encapsulate a function that turns a normal function into a curried function.

```javascript
function convertToCurry(func, ...args) {
    const argsLength = func.length;
    return function(..._args) {
        _args.unshift(...args);
        if (_args.length < argsLength) return convertToCurry.call(this, func, ..._args);
        return func.apply(this, _args);
    }
}

var func = (x, y, z) => x + y + z;
var addCurry = convertToCurry(func);
var result = addCurry(1)(2)(3);
console.log(result); // 6
```

Let's take an example of using currying to validate phone numbers and email addresses using regular expressions.

```javascript
function convertToCurry(func, ...args) {
    const argsLength = func.length;
    return function(..._args) {
        _args.unshift(...args);
        if (_args.length < argsLength) return convertToCurry.call(this, func, ..._args);
        return func.apply(this, _args);
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

## Application
Advanced currying has an application aspect in `Thunk` functions. The `Thunk` function is used in implementing call by name in compilers. It often puts the parameters into a temporary function and then passes this temporary function into the function body. This temporary function is called the `Thunk` function. The `Thunk` function replaces the parameters with a unary version and only accepts a callback function as a parameter.

```javascript
// Assume a delayed function needs to pass some parameters
// Typically, you can use the following version
var delayAsync = function(time, callback, ...args){
    setTimeout(() => callback(...args), time);
}

var callback = function(x, y, z){
    console.log(x, y, z);
}

delayAsync(1000, callback, 1, 2, 3);

// Using a Thunk function

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

By implementing a simple `Thunk` function converter, any function that has parameters with a callback function can be written in the form of a `Thunk` function.

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
The `Thunk` function may have been less used before `ES6`, but after `ES6`, `Generator` functions appeared. By using `Thunk` functions, they can be used for automatic flow management of `Generator` functions. First is about the basic usage of `Generator` functions. Calling a generator function does not immediately execute the statements inside it, instead it returns an iterator object of the generator, which is a pointer to the internal state object. When the `next()` method of this iterator is called for the first time (subsequently), the statements inside it will execute until the first (subsequent) occurrence of `yield`, where the pointer will start executing from the beginning of the function or the last stopped position to the next `yield`. Or if used `yield*`, it means the execution control is handed over to another generator function (the current generator is paused).

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
console.log(g.next()); // {value: undefined, done: true} // It can be `next()` indefinitely, but the `value` always is undefined, `done` always is true
```

Since `Generator` functions can temporarily suspend the execution of functions, they can completely handle an asynchronous task. Then continue to the next task after the previous one is complete. The following example shows the synchronization of an asynchronous task. When the previous delayed timer is completed, the next timer task will be performed. This way can solve a problem of nested asynchronous calls. For example, using a callback after a network request to make the next request can easily cause callback hell. However, using `Generator` functions can solve this problem. In fact, `async/await` use `Generator` functions and `Promise` to implement the asynchronous solution.

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
Although the above example allows for automatic execution, it is not very convenient. Now, we will implement automatic flow management using a `Thunk` function, which automatically handles the callback function for us. You only need to pass some parameters needed for the function execution into the `Thunk` function, such as the `index` in the example, then you can write the body of the `Generator` function. When using `Thunk` functions for automatic flow management, you must ensure that a `Thunk` function follows each `yield` statement.  
Regarding the `run` function for automatic flow management, it is necessary to know that when the `next()` method is called and a parameter is passed, this parameter will be passed to the variable on the left side of the previous `yield` statement. In this function, the first time `next` is executed without passing a parameter, and there are no variable assignment statements above the first `yield`, so no parameter needs to be passed. Next is to check if this generator function has completed execution. It has not completed here, so the custom `next` function is passed into `res.value`. It is important to note that `res.value` is a function. If you execute the line that is commented out in the next example, you will see that the value is `f(funct){...}`. At this point, by passing our custom `next` function, we have transferred the execution control to function `f`. After this function completes the asynchronous task, it will execute the callback function. In this callback function, it will trigger the next `next` method of the generator, and this `next` method has been passed a parameter. As mentioned earlier, passing a parameter will pass it to the variable on the left side of the previous `yield` statement. In this execution, this parameter value will be passed to `r1`, and then continue to execute `next`, continuously repeating until the generator function finishes running. This achieves the automatic management of the flow.

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
```

```javascript
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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/5e1899fe7d6b
https://zhuanlan.zhihu.com/p/108594470
https://juejin.im/post/6844903936378273799#heading-12
https://blog.csdn.net/crazypokerk_/article/details/97674338
http://www.qiutianaimeili.com/html/page/2019/05/54g0vvxycyg.html
https://baike.baidu.com/item/%E6%9F%AF%E9%87%8C%E5%8C%96/10350525?fr=aladdin
https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/ch4.html#%E4%B8%8D%E4%BB%85%E4%BB%85%E6%98%AF%E5%8F%8C%E5%85%B3%E8%AF%AD%E5%92%96%E5%96%B1
```