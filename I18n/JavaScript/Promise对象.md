# Promise Object
`JavaScript` is a single-threaded language that achieves asynchronous operations by maintaining an execution stack and a task queue. `setTimeout` and `Ajax` are typical asynchronous operations, and `Promise` is a solution for asynchronous operations used to represent the eventual completion or failure and resulting value of an asynchronous operation. `Promise` has various open source implementations and was standardized in `ES6`, directly supported by browsers.

## Syntax

```javascript
new Promise( function(resolve, reject) { /* executor */
    // Execution code with specified positions for resolve and reject callbacks
});
```
The `executor` is a function with two parameters, `resolve` and `reject`. When the `Promise` constructor is executed, the `executor` function is immediately called, and the `resolve` and `reject` functions are passed as parameters to the `executor`. When the `resolve` and `reject` functions are called, the `promise` status is changed to `fulfilled` or `rejected`, respectively. The `executor` typically performs some asynchronous operations internally. Once the asynchronous operation is completed, either the `resolve` function is called to change the `promise` status to `fulfilled`, or the `reject` function is called to change the `promise` status to `rejected`. If an error is thrown in the `executor` function, the `promise` status is `rejected`, and the return value of the `executor` function is ignored.

### States
```
pending: Initial state, neither fulfilled nor rejected.
fulfilled: Indicates a successful operation completion.
rejected: Indicates a failed operation.
```
`Promise` objects can only transition from `pending` to `fulfilled` or from `pending` to `rejected`. Once in the `fulfilled` or `rejected` state, the status does not change.  
Drawback: Cannot cancel a `Promise`; once created, it executes immediately and cannot be canceled mid-process. If not actively caught, exceptions thrown in a `Promise` are not reflected externally. In `Firefox`, exceptions are not thrown, while in `Chrome`, exceptions are thrown but do not trigger the `winodw.onerror` event. When in the `pending` state, the current progress cannot be determined (just started or about to complete).

## Example
`Promise` can be chained to avoid the callback hell caused by excessive asynchronous operations; by default, the `then()` function returns a new `Promise` different from the original one.

```javascript
var promise = new Promise(function(resolve,reject){
     var rand = Math.random() * 2;
     setTimeout(function(){
         if(rand < 1) resolve(rand);
         else reject(rand);
     },1000)
})
promise.then(function(rand){
    console.log("resolve",rand); // resolve callback executed
}).catch(function(rand){
    console.log("reject",rand); // reject callback executed
}).then(function(){
    console.log("Then executed again");
    return Promise.resolve(1);
}).then(function(num){
    console.log(num,"can continue to execute and receive parameters");
})
```
Performing multiple asynchronous operations, assuming only `resolve` will continue to the next asynchronous operation.

```javascript
var promise = new Promise(function(resolve,reject){
     var rand = Math.random() * 2;
     setTimeout(function(){
         if(rand < 1) resolve(rand);
         else reject(rand);
     },1000)
})
promise.then(function(rand){
    console.log("resolve",rand); // resolve callback executed
    return new Promise(function(resolve,reject){
         setTimeout(function(){
             resolve(10000);
         },1000)
     })
}).then(function(num){
    console.log(num);
}).catch(function(rand){
    console.log("reject",rand); // Catch the reject callback and exception
})
```
Using `catch` to catch exceptions.

```javascript
var promise = new Promise(function(resolve,reject){
     throw new Error("Error"); // Throws an exception
})
promise.then(function(){
    console.log("Normal execution");
}).catch(function(err){
    console.log("reject",err); // Catch the exception
```
`then` itself can accept two parameters `resolve` and `reject`

```javascript
var promise = new Promise(function(resolve,reject){
     var rand = Math.random() * 2;
     setTimeout(function(){
         if(rand < 1) resolve(rand);
         else reject(rand);
     },1000)
})
promise.then(function(rand){
    console.log("resolve",rand); // Callback for resolve
},function(rand){
    console.log("reject",rand); // Callback for reject
})
```

## Methods

### Promise.all(iterable)

This method returns a new `promise` object. This `promise` object is triggered to be successful only when all the `promise` objects in the `iterable` parameter are successful. Once any `promise` object inside the `iterable` fails, it immediately triggers the failure of this `promise` object. After the new `promise` object is triggered to be successful, it will return an array containing the return values of all `promise` objects in `iterable` as the success callback return value, in the same order as in the `iterable`. If this new `promise` object is triggered to be in a failed state, it will use the error information of the first `promise` object inside `iterable` that triggers a failure as its own failure error message. The `Promise.all` method is often used to handle the status collection of multiple `promise` objects.

```javascript
var p1 = new Promise((resolve, reject) => {
  resolve("success1");
})

var p2 = new Promise((resolve, reject) => {
  resolve("success2");
})

var p3 = new Promise((resolve, reject) => {
  reject("fail");
})

Promise.all([p1, p2]).then((result) => {
  console.log(result);      // Successful state //["success1", "success2"]
}).catch((error) => {
  console.log(error);
})

Promise.all([p1,p3,p2]).then((result) => {
  console.log(result);
}).catch((error) => {
  console.log(error);      // Failed state // fail
})
```

### Promise.race(iterable)

When any child `promise` in the `iterable` parameter is successful or fails, the parent `promise` is immediately called with the success return value or failure details of the child `promise` as parameters for the parent `promise`'s corresponding handler, and returns the `promise` object.

```javascript
var p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("success");
  },1000);
})

var p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject("failed");
  }, 2000);
})

Promise.race([p1, p2]).then((result) => {
  console.log(result); // If p1 gets the result first, then execute the p1 callback
}).catch((error) => {
  console.log(error);
})
```

```javascript
### Promise.resolve(value)
Returns a `Promise` object whose state is determined by the given `value`. If the value is a `thenable` (i.e., an object with a `then` method), the final state of the returned `Promise` object is determined by the execution of the `then` method. Otherwise (if the `value` is null, a primitive type, or an object without a `then` method), the state of the returned `Promise` object is `fulfilled`, and the `value` is passed to the corresponding `then` method. Usually, if you are unsure whether a value is a `Promise` object, use `Promise.resolve(value)` to return a `Promise` object, so that you can use the `value` in the form of a `Promise` object. Do not call `Promise.resolve` on a `thenable` that resolves to itself, as this will result in infinite recursion, as it attempts to flatten infinitely nested `promise`.

```javascript
// If the value is null or a primitive type, directly return a fulfilled Promise object
var promise = Promise.resolve(1);
promise.then((num) => {
    console.log(num); // 1
}).catch((err) => {
    console.log(err);
});

// If the parameter is a Promise instance, Promise.resolve will not modify it and will return the instance as is
var p1 = Promise.resolve(1);
var p2 = Promise.resolve(p1);
console.log(p1 === p2); // true
p2.then((value) => {
  console.log(value); // 1
});

// If the value is a thenable object, the final state of the returned Promise object is determined by the then method execution
var thenable = {then: (resolve, reject) => resolve(1)};
var p1 = Promise.resolve(thenable);
p1.then((value) => {
    console.log(value); // 1
}).catch((err) => {
    console.log(err);
});
```

### Promise.reject(reason)
Returns a `Promise` object with a failed state and passes the given failure information to the corresponding handling method.

```javascript
var promise = Promise.reject("err");
promise.then(() => {
    console.log(1);
}).catch((err) => {
    console.log(err); // err
});
```

## Prototype Methods

### Promise.prototype.then(onFulfilled, onRejected)
Adds resolve `fulfillment` and reject `rejection` callbacks to the current `promise`, and returns a new `promise` that will be resolved with the return value of the callback.

### Promise.prototype.catch(onRejected)
Adds a reject `rejection` callback to the current `promise`, and returns a new `promise`. When this callback function is invoked, the new `promise` will be resolved with its return value. Otherwise, if the current `promise` enters the `fulfilled` state, the completion result of the current `promise` will be the completion result of the new `promise`.

### Promise.prototype.finally(onFinally)
Adds an event handling callback to the current `promise` object, and after the original `promise` object is resolved, returns a new `promise` object. The callback will be invoked after the current `promise` has completed, regardless of whether the current `promise` is in the `fulfilled` or `rejected` state.

## Implementing Ajax
```

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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```


## References

```
https://www.liaoxuefeng.com/wiki/1022910821149312/1023024413276544
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
```