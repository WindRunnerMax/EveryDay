# async/await剖析
`JavaScript`是单线程的，为了避免同步阻塞可能会带来的一些负面影响，引入了异步非阻塞机制，而对于异步执行的解决方案从最早的回调函数，到`ES6`的`Promise`对象以及`Generator`函数，每次都有所改进，但是却又美中不足，他们都有额外的复杂性，都需要理解抽象的底层运行机制，直到在`ES7`中引入了`async/await`，他可以简化使用多个`Promise`时的同步行为，在编程的时候甚至都不需要关心这个操作是否为异步操作。

## 分析
首先使用`async/await`执行一组异步操作，并不需要回调嵌套也不需要写多个`then`方法，在使用上甚至觉得这本身就是一个同步操作，当然在正式使用上应该将`await`语句放置于` try...catch`代码块中，因为`await`命令后面的`Promise`对象，运行结果可能是`rejected`。

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
`async/await`实际上是`Generator`函数的语法糖，如`Promises`类似于结构化回调，`async/await`在实现上结合了`Generator`函数与`Promise`函数，下面使用`Generator`函数加`Thunk`函数的形式实现一个与上边相同的例子，可以看到只是将`async`替换成了`*`放置在函数右端，并将`await`替换成了`yield`，所以说`async/await`实际上是`Generator`函数的语法糖，此处唯一不同的地方在于实现了一个流程的自动管理函数`run`，而`async/await`内置了执行器，关于这个例子的实现下边会详述。对比来看，`async`和`await`，比起`*`和`yield`，语义更清楚，`async`表示函数里有异步操作，`await`表示紧跟在后面的表达式需要等待结果。

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

## 实现
`async`函数内置了执行器，能够实现函数执行的自动流程管理，通过`Generator yield Thunk`、`Generator yield Promise`实现一个自动流程管理，只需要编写`Generator`函数以及`Thunk`函数或者`Promise`对象并传入自执行函数，就可以实现类似于`async/await`的效果。

### Generator yield Thunk

自动流程管理`run`函数，首先需要知道在调用`next()`方法时，如果传入了参数，那么这个参数会传给上一条执行的`yield`语句左边的变量，在这个函数中，第一次执行`next`时并未传递参数，而且在第一个`yield`上边也并不存在接收变量的语句，无需传递参数，接下来就是判断是否执行完这个生成器函数，在这里并没有执行完，那么将自定义的`next`函数传入`res.value`中，这里需要注意`res.value`是一个函数，可以在下边的例子中将注释的那一行执行，然后就可以看到这个值是`f(funct){...}`，此时我们将自定义的`next`函数传递后，就将`next`的执行权限交予了`f`这个函数，在这个函数执行完异步任务后，会执行回调函数，在这个回调函数中会触发生成器的下一个`next`方法，并且这个`next`方法是传递了参数的，上文提到传入参数后会将其传递给上一条执行的`yield`语句左边的变量，那么在这一次执行中会将这个参数值传递给`r1`，然后在继续执行`next`，不断往复，直到生成器函数结束运行，这样就实现了流程的自动管理。

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

相对于使用`Thunk`函数来做流程自动管理，使用`Promise`来实现相对更加简单，`Promise`实例能够知道上一次回调什么时候执行，通过`then`方法启动下一个`yield`，不断继续执行，这样就实现了流程的自动管理。

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
// 比较完整的流程自动管理函数
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



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://segmentfault.com/a/1190000007535316
http://www.ruanyifeng.com/blog/2015/05/co.html
http://www.ruanyifeng.com/blog/2015/05/async.html
```
