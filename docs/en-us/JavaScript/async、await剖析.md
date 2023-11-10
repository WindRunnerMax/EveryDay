# Analyzing async/await
`JavaScript` is single-threaded, in order to avoid the negative effects that synchronous blocking may bring, an asynchronous non-blocking mechanism has been introduced. From the earliest callback functions to `ES6`'s `Promise` object and `Generator` functions, the solution for asynchronous execution has been improved each time, but there are still some drawbacks. They all have additional complexity and require understanding of the abstract underlying mechanisms until `async/await` was introduced in `ES7`. It can simplify the synchronous behavior when using multiple `Promise`s, and when programming, one may not even need to worry about whether the operation is asynchronous.

## Analysis
Firstly, using `async/await` to execute a set of asynchronous operations does not require nested callbacks or writing multiple `then` methods. It feels like a synchronous operation, and of course, in actual use, the `await` statement should be placed in the `try...catch` block because the result of the `Promise` object after the `await` command may be `rejected`.

```javascript
function promise(){
    return new Promise((resolve, reject) => {
       var rand = Math.random() * 2; 
       setTimeout(() => resolve(rand), 1000);
    });
}

async function asyncFunct(){
    var r1 = await promise();
    console.log(1, r1);
    var r2 = await promise();
    console.log(2, r2);
    var r3 = await promise();
    console.log(3, r3);
}

asyncFunct();
```
In fact, `async/await` is a syntactic sugar for `Generator` functions, similar to how `Promises` are similar to structured callbacks. `async/await` combines the `Generator` and `Promise` functions in its implementation. Below, by using `Generator` functions and `Thunk` functions, a similar example to the one above is implemented. It can be seen that only `async` is replaced by `*` placed on the right side of the function and `await` is replaced by `yield`. Therefore, `async/await` is actually a syntactic sugar for `Generator` functions. The only difference here is that it implements an automatic flow management function `run`, whereas `async/await` has a built-in executor. More details about the implementation of this example will be discussed below. Comparatively, `async` and `await` are clearer in their semantics compared to `*` and `yield`, with `async` indicating that the function has asynchronous operations and `await` indicating that the expression followed by it needs to wait for a result.

```javascript
function thunkFunct(){
    return function f(funct){
        var rand = Math.random() * 2;
        setTimeout(() => funct(rand), 1000)
    }
}

function* generator(){ 
    var r1 = yield thunkFunct();
    console.log(1, r1);
    var r2 = yield thunkFunct();
    console.log(2, r2);
    var r3 = yield thunkFunct();
    console.log(3, r3);
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

run(generator);
```

## Implementation
`async` functions have a built-in executor that can implement automatic flow management of function execution through `Generator yield Thunk` and `Generator yield Promise`. It only requires writing the `Generator` function as well as the `Thunk` function or `Promise` object and passing them to a self-executing function to achieve a similar effect to `async/await`.

### Generator yield Thunk

The `run` function automatically manages the process. First, it needs to know that when the `next()` method is called with a parameter, that parameter will be passed to the variable on the left side of the `yield` statement of the previously executed line. In this function, the first time `next` is executed without passing a parameter and there is no statement to receive the variable at the first `yield`, so no parameter needs to be passed. Next, it is to determine whether the generator function has finished executing. In this case, it has not finished executing, so the custom `next` function is passed into `res.value`. It is important to note that `res.value` is a function. In the example below, the commented line can be executed, and then you can see that the value is `f(funct){...}`. At this point, after passing the custom `next` function, the execution permission of `next` is transferred to the function `f`. After this function completes the asynchronous task, it will execute a callback function. In this callback function, the next `next` method of the generator will be triggered, and this `next` method is passed with a parameter. As mentioned earlier, when a parameter is passed, it will be passed to the variable on the left side of the `yield` statement of the previously executed line. Therefore, in this execution, this parameter value will be passed to `r1`, and then `next` will continue to execute, repeatedly, until the generator function finishes running, thereby achieving automatic process management.

```javascript
function thunkFunct(){
    return function f(funct){
        var rand = Math.random() * 2;
        setTimeout(() => funct(rand), 1000)
    }
}

function* generator(){ 
    var r1 = yield thunkFunct();
    console.log(1, r1);
    var r2 = yield thunkFunct();
    console.log(2, r2);
    var r3 = yield thunkFunct();
    console.log(3, r3);
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

run(generator);
```
### Generator yield Promise

Compared to using the `Thunk` function for process automation, using `Promise` to achieve it is relatively simpler. A `Promise` instance can know when the last callback was executed, and through the `then` method, it starts the next `yield`, continuing the execution, thus achieving automatic process management.

```javascript
function promise(){
    return new Promise((resolve,reject) => {
        var rand = Math.random() * 2;
        setTimeout( () => resolve(rand), 1000);
    })
}

function* generator(){ 
    var r1 = yield promise();
    console.log(1, r1);
    var r2 = yield promise();
    console.log(2, r2);
    var r3 = yield promise();
    console.log(3, r3);
}

function run(generator){
    var g = generator();

    var next = function(data){
        var res = g.next(data);
        if(res.done) return ;
        res.value.then(data => next(data));
    }

    next();
}

run(generator);
```

```javascript
// Complete flow management function
function promise(){
    return new Promise((resolve,reject) => {
        var rand = Math.random() * 2;
        setTimeout( () => resolve(rand), 1000);
    })
}

function* generator(){ 
    var r1 = yield promise();
    console.log(1, r1);
    var r2 = yield promise();
    console.log(2, r2);
    var r3 = yield promise();
    console.log(3, r3);
}


```javascript
function run(generator){
    return new Promise((resolve, reject) => {
        var g = generator();
        
        var next = function(data){
            var res = null;
            try{
                res = g.next(data);
            }catch(e){
                return reject(e);
            }
            if(!res) return reject(null);
            if(res.done) return resolve(res.value);
            Promise.resolve(res.value).then(data => {
                next(data);
            },(e) => {
                throw new Error(e);
            });
        }
        
        next();
    })
   
}

run(generator).then( () => {
    console.log("Finish");
});
```

## Daily Question

```
[https://github.com/WindrunnerMax/EveryDay](https://github.com/WindrunnerMax/EveryDay)
```

## References

```
[https://segmentfault.com/a/1190000007535316](https://segmentfault.com/a/1190000007535316)
[http://www.ruanyifeng.com/blog/2015/05/co.html](http://www.ruanyifeng.com/blog/2015/05/co.html)
[http://www.ruanyifeng.com/blog/2015/05/async.html](http://www.ruanyifeng.com/blog/2015/05/async.html)
```