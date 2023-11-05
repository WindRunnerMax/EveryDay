# async/await
`async`是`ES7`的与异步操作有关的关键字，其返回一个`Promise`对象，`await`操作符用于等待一个`Promise`对象,它只能在异步函数`async function`内部使用。`async/await`的目的是简化使用多个`promise`时的同步行为，并对一组`Promises`执行某些操作。正如`Promises`类似于结构化回调，`async/await`更像结合了`generators`和`promises`。

## async

### 语法

```javascript
async function name([param[, param[, ... param]]]) { statements }
```
* `name`: 函数名称。
* `param`: 要传递给函数的参数的名称。
* `statements`: 函数体语句。

`async`函数返回一个`Promise`对象，可以使用`then`方法添加回调函数，返回的`Promise`对象会运行执行`resolve`异步函数的返回结果，如果抛出异常则运行拒绝`reject`。

### 实例

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
`async`一般是配合`await`指令使用的，该指令会暂停异步函数的执行，并等待`Promise`执行，然后继续执行异步函数，并返回结果。若`Promise`处理异常`rejected`，`await`表达式会把`Promise`的异常原因抛出。另外，如果`await`操作符后的表达式的值不是一个`Promise`，则返回该值本身。

### 实例

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

// 捕捉异常
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

// 非promise对象直接返回该值本身
function notPromise(){
    return 1;
}

(async function asyncPromise(){
    var result = await notPromise();
    console.log(result);
})();
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```
