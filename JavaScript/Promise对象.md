# Promise对象
`JavaScript`是单线程的语言，通过维护执行栈与任务队列而实现了异步操作，`setTimeout`与`Ajax`就是典型的异步操作，`Promise`就是异步操作的一个解决方案，用于表示一个异步操作的最终完成或失败, 及其结果值，`Promise`有各种开源实现，在`ES6`中被统一规范，由浏览器直接支持。

## 语法

```javascript
new Promise( function(resolve, reject) { /* executor */
    // 执行代码 需要指明resolve与reject的回调位置
});
```
`executor`是带有`resolve`和`reject`两个参数的函数。`Promise`构造函数执行时立即调用`executor`函数，`resolve`和`reject`两个函数作为参数传递给`executor`。`resolve`和`reject`函数被调用时，分别将`promise`的状态改为完成`fulfilled`或失败`rejected`。`executor`内部通常会执行一些异步操作，一旦异步操作执行完毕，要么调用`resolve`函数来将`promise`状态改成`fulfilled`，要么调用`reject`函数将`promise`的状态改为`rejected`。如果在`executor`函数中抛出一个错误，那么该`promise`状态为`rejected`，`executor`函数的返回值被忽略。

### 状态
```
pending: 初始状态，既不是成功，也不是失败状态。
fulfilled: 意味着操作成功完成。
rejected: 意味着操作失败。
```
`Promise`对象只有从`pending`变为`fulfilled`和从`pending`变为`rejected`的状态改变。只要处于`fulfilled`和`rejected`，状态就不会再变了。  
缺点：无法取消`Promise`，一旦新建它就会立即执行，无法中途取消；如果不设置回调函数，`Promise`内部抛出的错误，不会反应到外部；当处于`pending`状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

## 实例
`Promise`可以进行链式调用，避免过多的异步操作造成的回调地狱，`then()`函数默认会返回一个和原来不同的新的`Promise`。
```javascript
var promise = new Promise(function(resolve,reject){
     var rand = Math.random() * 2;
     setTimeout(function(){
         if(rand < 1) resolve(rand);
         else reject(rand);
     },1000)
})
promise.then(function(rand){
    console.log("resolve",rand); // resolve回调执行
}).catch(function(rand){
    console.log("reject",rand); // reject回调执行
}).then(function(){
    console.log("再执行then");
    return Promise.resolve(1);
}).then(function(num){
    console.log(num,"还可以继续执行并接收参数");
})
```
进行多次异步操作，假设只有`resolve`才会进行下一步异步操作

```javascript
var promise = new Promise(function(resolve,reject){
     var rand = Math.random() * 2;
     setTimeout(function(){
         if(rand < 1) resolve(rand);
         else reject(rand);
     },1000)
})
promise.then(function(rand){
    console.log("resolve",rand); // resolve回调执行
    return new Promise(function(resolve,reject){
         setTimeout(function(){
             resolve(10000);
         },1000)
     })
}).then(function(num){
    console.log(num);
}).catch(function(rand){
    console.log("reject",rand); // 捕捉reject回调与异常
})
```
使用`catch`捕捉异常 

```javascript
var promise = new Promise(function(resolve,reject){
     throw new Error("Error"); // 抛出一个异常
})
promise.then(function(){
    console.log("正常执行");
}).catch(function(err){
    console.log("reject",err); // 捕捉异常
})
```
`then`本身可以接受两个参数`resolve`与`reject`

```javascript
var promise = new Promise(function(resolve,reject){
     var rand = Math.random() * 2;
     setTimeout(function(){
         if(rand < 1) resolve(rand);
         else reject(rand);
     },1000)
})
promise.then(function(rand){
    console.log("resolve",rand); // resolve回调执行
},function(rand){
    console.log("reject",rand); // reject回调执行
})
```

## 方法

### Promise.all(iterable)
这个方法返回一个新的`promise`对象，该`promise`对象在`iterable`参数对象里所有的`promise`对象都成功的时候才会触发成功，一旦有任何一个`iterable`里面的`promise`对象失败则立即触发该`promise`对象的失败。这个新的`promise`对象在触发成功状态以后，会把一个包含`iterable`里所有`promise`返回值的数组作为成功回调的返回值，顺序跟`iterable`的顺序保持一致；如果这个新的`promise`对象触发了失败状态，它会把`iterable`里第一个触发失败的`promise`对象的错误信息作为它的失败错误信息。`Promise.all`方法常被用于处理多个`promise`对象的状态集合。

```javascript
var p1 = new Promise((resolve, reject) => {
  resolve('success1')
})

var p2 = new Promise((resolve, reject) => {
  resolve('success2')
})

var p3 = new Promise((resolve, reject) => {
  reject('fail')
})

Promise.all([p1, p2]).then((result) => {
  console.log(result)      // 成功状态 //['success1', 'success2']
}).catch((error) => {
  console.log(error)
})

Promise.all([p1,p3,p2]).then((result) => {
  console.log(result)
}).catch((error) => {
  console.log(error)      // 失败状态 // fail
})
```

### Promise.race(iterable)
当`iterable`参数里的任意一个子`promise`被成功或失败后，父`promise`马上也会用子`promise`的成功返回值或失败详情作为参数调用父`promise`绑定的相应句柄，并返回该`promise`对象。

```javascript
var p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  },1000)
})

var p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('failed')
  }, 2000)
})

Promise.race([p1, p2]).then((result) => {
  console.log(result) // p1先获得结果，那么就执行p1的回调
}).catch((error) => {
  console.log(error)
})
```

### Promise.resolve(value)
返回一个状态由给定`value`决定的`Promise`对象。如果该值是`thenable`(即，带有`then`方法的对象)，返回的`Promise`对象的最终状态由`then`方法执行决定；否则的话(该`value`为空，基本类型或者不带`then`方法的对象),返回的`Promise`对象状态为`fulfilled`，并且将该`value`传递给对应的`then`方法。通常而言，如果你不知道一个值是否是`Promise`对象，使用`Promise.resolve(value)`来返回一个`Promise`对象,这样就能将该`value`以`Promise`对象形式使用。不要在解析为自身的`thenable`上调用`Promise.resolve`，这将导致无限递归，因为它试图展平无限嵌套的`promise`。

```javascript
// 该值为空或基本类型，直接返回一个fulfilled状态的Promise对象
var promise = Promise.resolve(1);
promise.then((num) => {
    console.log(num); // 1
}).catch((err) => {
    console.log(err);
});

// 如果参数是 Promise 实例，那么Promise.resolve将不做任何修改、原封不动地返回这个实例
var p1 = Promise.resolve(1);
var p2 = Promise.resolve(p1);
console.log(p1 === p2); // true
p2.then((value) => {
  console.log(value); // 1
});

// 如果该值带有`then`方法的对象)，返回的`Promise`对象的最终状态由`then`方法执行决定
var thenable = {then: (resolve, reject) => resolve(1)};
var p1 = Promise.resolve(thenable);
p1.then((value) => {
    console.log(value); // 1
}).catch((err) => {
    console.log(err);
});
```

### Promise.reject(reason)
返回一个状态为失败的`Promise`对象，并将给定的失败信息传递给对应的处理方法

```javascript
var promise = Promise.reject("err");
promise.then(() => {
    console.log(1);
}).catch((err) => {
    console.log(err); // err
});
```

## 原型方法

### Promise.prototype.then(onFulfilled, onRejected)
添加解决`fulfillment`和拒绝`rejection`回调到当前`promise`,返回一个新的`promise`,将以回调的返回值来`resolve`。

### Promise.prototype.catch(onRejected)
添加一个拒绝`rejection`回调到当前`promise`,返回一个新的`promise`。当这个回调函数被调用，新`promise`将以它的返回值来`resolve`，否则如果当前`promise`进入`fulfilled`状态，则以当前`promise`的完成结果作为新`promise`的完成结果。

### Promise.prototype.finally(onFinally)
添加一个事件处理回调于当前`promise`对象，并且在原`promise`对象解析完毕后，返回一个新的`promise`对象。回调会在当前`promise`运行完毕后被调用，无论当前`promise`的状态是完成`fulfilled`还是失败`rejected`。

## 实现Ajax

```javascript
function ajax(method, url, data) {
    var request = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    resolve(request.responseText);
                } else {
                    reject(request.status);
                }
            }
        };
        request.open(method, url);
        request.send(data);
    });
}
ajax("GET","https://www.baidu.com",[]).then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
})
```

## 参考

```
https://www.liaoxuefeng.com/wiki/1022910821149312/1023024413276544
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
```

