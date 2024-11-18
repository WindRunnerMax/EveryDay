# Understanding `$nextTick` in Vue

The `$nextTick` method in `Vue` delays the execution of a callback until the next `DOM` update cycle. In other words, it executes the deferred callback after the next `DOM` update cycle is completed. By using this method immediately after modifying data, you can obtain the updated `DOM`. In simple terms, it means that when the data is updated, the callback function is executed after the `DOM` has been rendered.

## Description

Let's demonstrate the effect of the `$nextTick` method with a simple example. First, it's important to understand that `Vue` updates the `DOM` asynchronously. This means that when data is being updated, it does not block the execution of the code. Instead, it waits until the code in the execution stack has finished before starting to execute the code in the asynchronous task queue. Therefore, when data is being updated, the component does not render immediately. At this time, the value obtained from the `DOM` structure is still the old value. However, the callback function set in the `$nextTick` method will be executed after the component has finished rendering, and the value obtained from the `DOM` structure will be the new value.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            msg: 'Vue'
        },
        template:`
            <div>
                <div ref="msgElement">{{msg}}</div>
                <button @click="updateMsg">updateMsg</button>
            </div>
        `,
        methods:{
            updateMsg: function(){
                this.msg = "Update";
                console.log("DOM not updated:", this.$refs.msgElement.innerHTML)
                this.$nextTick(() => {
                    console.log("DOM updated:", this.$refs.msgElement.innerHTML)
                })
            }
        },
        
    })
</script>
</html>
```

## Asynchronous Mechanism

According to the official documentation, `Vue` updates the `DOM` asynchronously. Upon detecting data changes, `Vue` opens a queue and buffers all the data changes that occur within the same event loop. If the same watcher is triggered multiple times, it will only be pushed into the queue once. This method of eliminating duplicate data during buffering is crucial for avoiding unnecessary computations and `DOM` operations. Then, in the next event loop `tick`, `Vue` refreshes the queue and performs the actual work. Internally, `Vue` attempts to use native methods such as `Promise.then`, `MutationObserver`, and `setImmediate` for the asynchronous queue. If the execution environment does not support these methods, it falls back to using `setTimeout(fn, 0)` instead.  

`JavaScript` is single-threaded and introduces synchronous blocking and asynchronous non-blocking execution modes. In the asynchronous mode of `JavaScript`, it maintains an `Event Loop`, which is an execution model with different implementations in different locations. Browsers and `NodeJS` have implemented their respective `Event Loops` based on different technologies. The browser's `Event Loop` consists of an execution stack, background threads, macrotask queue, and microtask queue.

* The execution stack is a data structure for executing synchronous tasks on the main thread, and function calls form a stack of frames.
* Background threads are the execution threads for `setTimeout`, `setInterval`, `XMLHttpRequest`, and other tasks implemented by the browser.
* Macrotask queue - some asynchronous task callbacks will enter the macrotask queue in sequence, waiting to be called subsequently. This includes `setTimeout`, `setInterval`, `setImmediate(Node)`, `requestAnimationFrame`, `UI rendering`, and `I/O` operations.
* Microtask queue - some other asynchronous task callbacks will enter the microtask queue in sequence, waiting to be called subsequently. This includes `Promise`, `process.nextTick(Node)`, `Object.observe`, `MutationObserver`, and other operations.

When `Js` is executed, the following process is carried out:

1. Firstly, the codes in the execution stack are synchronously executed, and the asynchronous tasks within these codes are added to the background thread.
2. After the synchronous codes in the execution stack are executed, the stack is cleared, and the microtask queue is scanned.
3. The first task in the microtask queue is taken out and put into the execution stack for execution, and at this point, the microtask queue has been dequeued.
4. After the execution stack is finished, the tasks in the microtask queue are dequeued and executed until all the microtask queue tasks are completed.
5. After the last task is dequeued from the microtask queue and enters the execution stack, and the microtask queue is empty, when the execution stack tasks are completed, the microtask queue is scanned to be empty, and then the macro task queue tasks are scanned, and the macro task is dequeued, put into the execution stack for execution, and after execution is completed, the microtask queue is scanned as empty, then the macro task queue is scanned, dequeued and executed.
6. And so on and so forth...

### Example

```javascript
// Step 1
console.log(1); // 1

// Step 2
setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3);
  });
}, 0);

// Step 3
new Promise((resolve, reject) => {
  console.log(4); // 4
  resolve();
}).then(() => {
  console.log(5);
})

// Step 4
setTimeout(() => {
  console.log(6);
}, 0);

// Step 5
console.log(7); // 7

// Step N
// ...

// Result
/*
  1
  4
  7
  5
  2
  3
  6
*/
```

#### Step 1
```javascript
// Execution stack: console
// Microtask queue: []
// Macro task queue: []
console.log(1); // 1
```

#### Step 2
```javascript
// Execution stack: setTimeout
// Microtask queue: []
// Macro task queue: [setTimeout1]
setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3);
  });
}, 0);
```

#### Step 3
```javascript
// Execution stack: Promise
// Microtask queue: [then1]
// Macro task queue: [setTimeout1]
new Promise((resolve, reject) => {
  console.log(4); // 4 // Promise is a function object, and it is executed synchronously here // Execution stack: Promise console
  resolve();
}).then(() => {
  console.log(5);
})
```

#### Step 4
```javascript
// Execution stack: setTimeout
// Microtask queue: [then1]
// Macro task queue: [setTimeout1 setTimeout2]
setTimeout(() => {
  console.log(6);
}, 0);
```

#### Step 5
```javascript
// Execution stack: console
// Microtask queue: [then1]
// Macro task queue: [setTimeout1 setTimeout2]
console.log(7); // 7
```

#### Step 6
```javascript
// Execution stack: then1
// Microtask queue: []
// Macro task queue: [setTimeout1 setTimeout2]
console.log(5); // 5
```

#### Step 7
```javascript
// Execution stack: setTimeout1
// Microtask queue: [then2]
// Macro task queue: [setTimeout2]
console.log(2); // 2
Promise.resolve().then(() => {
    console.log(3);
});
```

#### Step 8
```javascript
// Execution stack: then2
// Microtask queue: []
// Macro task queue: [setTimeout2]
console.log(3); // 3
```

#### Step 9
```javascript
// Execution stack: setTimeout2
// Microtask queue: []
// Macro task queue: []
console.log(6); // 6
```

## Analysis
After understanding the execution queue of asynchronous tasks, let's go back to the `$nextTick` method. When user data is updated, `Vue` will maintain a buffer queue. Certain strategies are applied to all the updates before they are added to the buffer queue for component rendering and `DOM` operations. Then, a `flushSchedulerQueue` method is added to the execution queue of the `$nextTick` method (this method will trigger the execution of all callbacks in the buffer queue). After that, the callback of the `$nextTick` method is added to the execution queue maintained by the `$nextTick` method, and when the asynchronous execution queue is triggered, the `flushSchedulerQueue` method will be executed first to handle the `DOM` rendering tasks, followed by the tasks constructed by the `$nextTick` method. This ensures that the completed `DOM` structure can be obtained within the `$nextTick` method. During testing, an interesting phenomenon was discovered. In the given example, when two buttons are added and the `updateMsg` button is clicked, the result is `3 2 1`, and when the `updateMsgTest` button is clicked, the result is `2 3 1`.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: '#app',
        data: {
            msg: 'Vue'
        },
        template:`
            <div>
                <div ref="msgElement">{{msg}}</div>
                <button @click="updateMsg">updateMsg</button>
                <button @click="updateMsgTest">updateMsgTest</button>
            </div>
        `,
        methods:{
            updateMsg: function(){
                this.msg = "Update";
                setTimeout(() => console.log(1))
                Promise.resolve().then(() => console.log(2))
                this.$nextTick(() => {
                    console.log(3)
                })
            },
            updateMsgTest: function(){
                setTimeout(() => console.log(1))
                Promise.resolve().then(() => console.log(2))
                this.$nextTick(() => {
                    console.log(3)
                })
            }
        },
        
    })
</script>
</html>
```

Assuming that the running environment fully supports the `Promise` object, using `setTimeout` as a macro task to execute last is unquestionable. However, there is an issue with the execution order of the `setTimeout` method, the `$nextTick` method, and the self-defined `Promise` instance. Although all of them are microtasks, due to specific implementation reasons in `Vue`, the execution order may vary. First, let's take a look at the source code of the `$nextTick` method, with key areas annotated. Please note that this is the source code of `Vue 2.4.2`. There may have been changes to the `$nextTick` method in later versions.

```javascript
/**
 * Defer a task to execute it asynchronously.
 */
var nextTick = (function () {
  // Closure internal variable
  var callbacks = []; // execution queue
  var pending = false; // A flag to determine whether it's the first time being added in a particular event loop. Asynchronous execution queue mounting is triggered only when it's added for the first time.
  var timerFunc; // The method used to mount the asynchronous execution queue. Here we assume that Promise is fully supported.
```

```javascript
function nextTickHandler () { // This function executes asynchronously, once triggered, it's officially ready to start executing asynchronous tasks.
  pending = false; // Set flag to false
  var copies = callbacks.slice(0); // Create a copy
  callbacks.length = 0; // Empty the execution queue
  for (var i = 0; i < copies.length; i++) {
    copies[i](); // Execute
  }
}

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore if */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  var p = Promise.resolve();
  var logError = function (err) { console.error(err); };
  timerFunc = function () {
    p.then(nextTickHandler).catch(logError); // Mount asynchronous task queue
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) { setTimeout(noop); }
  };
} else if (typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS IE11, iOS7, Android 4.4
  var counter = 1;
  var observer = new MutationObserver(nextTickHandler);
  var textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = function () {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
} else {
  // Fallback to setTimeout
  /* istanbul ignore next */
  timerFunc = function () {
    setTimeout(nextTickHandler, 0);
  };
}
```

```javascript
return function queueNextTick (cb, ctx) { // The method truly exported by the nextTick function
    var _resolve;
    callbacks.push(function () { // Add to the execution queue and add exception handling
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    // Determine whether it is the first time to join in the current event loop. If it is, set the flag to true and execute the timerFunc function to mount the execution queue to Promise.
    // This flag will be set to false and create a copy of the execution queue to run the tasks in the execution queue when the tasks in the execution queue are about to be executed, see the implementation of the nextTickHandler function.
    // Set the flag to true and mount in the current event loop, and then call the nextTick method again to simply add the task to the execution queue. It will not be mounted until the asynchronous task is triggered, then set the flag to false and execute the task. Calling the nextTick method again will be the same execution method and so on.
    if (!pending) { 
      pending = true;
      timerFunc();
    }
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        _resolve = resolve;
      })
    }
  }
})();
```
Going back to the problem raised earlier, when updating the `DOM`, the callback of the `$nextTick` method is triggered first. The key to solving this problem lies in who mounts the asynchronous task to the `Promise` object first.

First, we debug the method triggered by the `updateMsg` button with data update, setting a breakpoint at line 715 of `Vue.js` version 2.4.2. By examining the call stack and the passed parameters, we can observe that the first execution of the `$nextTick` method is actually called due to the data update `nextTick(flushSchedulerQueue);` statement. In other words, when executing `this.msg = "Update";`, the first `$nextTick` method has already been triggered. At this point, the task queue in the `$nextTick` method will first add the `flushSchedulerQueue` method to the queue and mount the execution queue of the `$nextTick` method to the `Promise` object. Then, it will mount the custom `Promise.resolve().then(() => console.log(2))` statement. When executing the tasks in the microtask queue, the first task mounted to the `Promise` will be executed. At this point, this task is to run the execution queue, which has two methods: first, to run the `flushSchedulerQueue` method to trigger the component's `DOM` rendering operation, and then to execute `console.log(3)`. Then, it will execute the second micro task, `() => console.log(2)`. When the microtask queue is cleared, the macro task queue will execute `console.log(1)`.

Next, we debug the method triggered by the `updateMsgTest` button without data update, setting the breakpoint at the same location. At this time, the first trigger of the `$nextTick` method is the self-defined callback function because there's no data update. At this point, the execution queue of the `$nextTick` method will be mounted to the `Promise` object. It is evident that the self-defined output `2` of the `Promise` callback has been mounted before this. So, for the method bound to this button, the execution flow is to first execute `console.log(2)`, then execute the closure's execution queue of the `$nextTick` method, which contains only one callback function `console.log(3)`. When the microtask queue is cleared, the macro task queue will execute `console.log(1)`.

In short, it's a matter of who mounts the `Promise` object first. When calling the `$nextTick` method, its internally maintained execution queue will be mounted to the `Promise` object. When updating data, `Vue` internals will first execute the `$nextTick` method and then mount the execution queue to the `Promise` object. Once you understand the `JS` event loop model and regard data updates as a `$nextTick` method call, and understand that the `$nextTick` method will execute all the pushed callbacks at once, you can understand the order of execution. Below represents a minimal demo of the `$nextTick` method. 

```javascript
var nextTick = (function(){

    var pending = false;
    const callback = [];
    var p = Promise.resolve();

    var handler = function(){
        pending = true;
        callback.forEach(fn => fn());
    }
```

```javascript
var timerFunc = function(){
    p.then(handler);
}

return function queueNextTick(fn){
    callback.push(() => fn());
    if(!pending){
        pending = true;
        timerFunc();
    }
}
})();


(function(){
nextTick(() => console.log("Trigger the method of DOM rendering queue")); // Comment / Uncomment to see the effect
setTimeout(() => console.log(1))
Promise.resolve().then(() => console.log(2))
nextTick(() => {
    console.log(3)
})
})();
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/e7ce7613f630
https://cn.vuejs.org/v2/api/#vm-nextTick
https://segmentfault.com/q/1010000021240464
https://juejin.im/post/5d391ad8f265da1b8d166175
https://juejin.im/post/5ab94ee251882577b45f05c7
https://juejin.im/post/5a45fdeb6fb9a044ff31c9a8
```