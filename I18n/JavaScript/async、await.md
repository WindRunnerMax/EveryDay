# async/await

`async` is a keyword related to asynchronous operations in `ES7`, it returns a `Promise` object. `await` operator is used to wait for a `Promise` object, and it can only be used inside an asynchronous function `async function`. The purpose of `async/await` is to simplify synchronous behavior when using multiple `promises` and perform certain operations on a group of `Promises`. Just as `Promises` are similar to structured callbacks, `async/await` is more like a combination of `generators` and `promises`.

## async

### Syntax

```javascript
async function name([param[, param[, ... param]]]) { statements }
```
* `name`: The function name.
* `param`: The name of the parameters to be passed to the function.
* `statements`: The body statements of the function.

The `async` function returns a `Promise` object. You can use the `then` method to add a callback function, and the returned `Promise` object will execute the result of the `resolve` asynchronous function. If an exception is thrown, it will execute the `reject`.

### Example

```javascript
async function asyncPromise(v){
    return v;
}

asyncPromise(1).then((v) => {
    console.log(v);
}).catch((e) => {
    console.log(e);
})
```

## await

`async` is generally used in conjunction with the `await` instruction, which pauses the execution of the asynchronous function, waits for the `Promise` to be executed, and then continues to execute the asynchronous function and return the result. If the `Promise` encounters an exception `rejected`, the `await` expression will throw the reason for the `Promise` exception. In addition, if the value of the expression after the `await` operator is not a `Promise`, it will return the value itself.

### Example

```javascript
function promise(){
    return new Promise(function(resolve,reject){
        var rand = Math.random() * 2;
        setTimeout(function(){
            resolve(`solve ${rand}`);
        },1000)
    })
}

(async function asyncPromise(){
    var result = await promise();
    console.log(result);
})();

// Catching exceptions
function promise(){
    return new Promise(function(resolve,reject){
        throw new Error(`reject`);
    })
}

(async function asyncPromise(){
    var result = await promise();
    console.log(result);
})().catch((e) => {
    console.log(e);
});

// Return the value itself if it's not a promise object
function notPromise(){
    return 1;
}

(async function asyncPromise(){
    var result = await notPromise();
    console.log(result);
})();
```
## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```