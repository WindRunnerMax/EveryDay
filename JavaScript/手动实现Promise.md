# 手动实现Promise
`JavaScript`是单线程的语言，通过维护执行栈与任务队列而实现了异步操作，`setTimeout`与`Ajax`就是典型的异步操作，`Promise`就是异步操作的一个解决方案，用于表示一个异步操作的最终完成或失败, 及其结果值。

## 语法

```javascript
new Promise( function(resolve, reject) { /* executor */
    // 执行代码 需要指明resolve与reject的回调位置
});
```
`executor`是带有`resolve`和`reject`两个参数的函数。`Promise`构造函数执行时立即调用`executor`函数，`resolve`和`reject`两个函数作为参数传递给`executor`。`resolve`和`reject`函数被调用时，分别将`promise`的状态改为完成`fulfilled`或失败`rejected`。`executor`内部通常会执行一些异步操作，一旦异步操作执行完毕，要么调用`resolve`函数来将`promise`状态改成`fulfilled`，要么调用`reject`函数将`promise`的状态改为`rejected`。如果在`executor`函数中抛出一个错误，那么该`promise`状态为`rejected`，`executor`函数的返回值被忽略。

### 状态
`Promise`本质上就是一个状态机，完整的说是有限状态自动机，给定当前输入与状态，那么输出是可以明确计算的。
```
pending: 初始状态，既不是成功，也不是失败状态。
fulfilled: 意味着操作成功完成。
rejected: 意味着操作失败。
```
`Promise`对象只有从`pending`变为`fulfilled`和从`pending`变为`rejected`的状态改变。只要处于`fulfilled`和`rejected`，状态就不会再变了。

## 实现

```javascript
// 定义_Promise构造函数 
function _Promise(fn) {
    this.status = "pending"; // 定义属性存储状态 // 赋予初始状态pending
    this.value = null; // resolve的value
    this.reason = null; // reject的reason
    this.onFulfilled = []; // 存储then方法中注册的第一个回调函数
    this.onReject = []; // 存储then方法中注册的第二个回调函数
    
    var handler = funct => { // 事件处理函数
        if(typeof(funct) === "function") { // 如果是函数的话才进行执行
            if(this.status === "fulfilled") funct(this.value); // 执行并传递value
            if(this.status === "rejected") funct(this.reason); // 执行并传递rejected
        }
    }
    
    // 实现resolve回调
    var resolve = value => { // 使用箭头函数主要是为了绑定this指向
        this.status = "fulfilled"; // 设置状态
        this.value = value; // 得到结果
        if(value instanceof _Promise){ // 判断返回的值是否为Promise实例
            value.onFulfilled = this.onFulfilled; // 是则以此链式调用
            return value;
        } 
        setTimeout(() => { // 使用setTimeout是为了将回调函数置于任务队列，不阻塞主线程，异步执行，实际promise的回调是置于微队列的，而setTimeout的回调是置于宏队列
            try {
                this.onFulfilled.forEach(handler); // 交予事件处理
            }catch (e){
                console.error(`Error in promise: ${e}`); // 打印异常
                reject(e); // reject
            }
        }, 0)
    }
    
    // 实现rejected
    var reject = reason => { // 使用箭头函数主要是为了绑定this指向
        this.status = "rejected"; // 设置状态
        this.reason = reason; // 得到结果
        setTimeout(() => { // 置于任务队列
            try {
                this.onReject.forEach(handler); // 交予事件处理
            }catch (e){
                console.error(`Error in promise: ${e}`); // 打印异常
            }
        }, 0)
    }
    
    fn(resolve, reject); // 执行
}

// 定义then
// value接收上层结果 --- function处理自身逻辑 --- return传递到下层
_Promise.prototype.then = function(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v; // 转为函数
    onRejected = typeof onRejected === 'function' ? onRejected : r => r; // 转为函数
    return new _Promise((resolve, reject) => { // 返回一个新的_Promise
        this.onFulfilled.push((value) => { // 将回调函数置于onFulfilled
            resolve(onFulfilled(value)); // 执行并传递
        });
        this.onReject.push((value) => { // 将回调函数置于onReject
            reject(onRejected(value)); // 执行并传递
        });
    })
}
```

```javascript
// 测试
var promise = new _Promise(function(resolve,reject){
     var rand = Math.random() * 2;
      setTimeout(function(){
         if(rand < 1) resolve(rand);
         else reject(rand);
     },1000)
})
promise.then((rand) => {
    console.log("resolve",rand); // resolve回调执行
}, (rand) => {
    console.log("reject",rand); // reject回调执行
}).then(function(){ // resolve后继续执行
    return new _Promise(function(resolve,reject){
     var rand = Math.random() * 2;
      setTimeout(function(){
         resolve(rand);
     },1000)
})
}).then(function(num){ // resolve后继续执行
    console.log(num,"继续执行并接收参数");
    return 1;
}).then(function(num){
    console.log(num,"继续执行并接收参数");
})

/*
  实现的_Promise比较简单
  实际使用的Promise比较复杂，有各种情况的考虑
  例子中仅实现了Promise构造函数与then，实际中还有catch、Promise.all、Promise.race、Promise.resolve、Promise.reject等实现
 */
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```


## 参考

```
https://zhuanlan.zhihu.com/p/47434856
https://www.jianshu.com/p/27735abb91eb
https://segmentfault.com/a/1190000013170460
```
