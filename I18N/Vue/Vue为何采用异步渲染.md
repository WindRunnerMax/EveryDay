# Why does Vue use asynchronous rendering

`Vue` performs asynchronous updates to the `DOM`. Whenever it detects a change in data, `Vue` will start a queue and buffer all data changes that occur in the same event loop. If the same `watcher` is triggered multiple times, it will only be added to the queue once. This removal of duplicate data during buffering is crucial for avoiding unnecessary computation and `DOM` operations. Then, in the next event loop `tick`, `Vue` refreshes the queue and performs the actual (deduplicated) work. `Vue` internally attempts to use native `Promise.then`, `MutationObserver`, and `setImmediate` for asynchronous queueing, and if the execution environment does not support these, it will use `setTimeout(fn, 0)` instead.

## Description

In simple terms, `Vue` uses asynchronous rendering to improve performance. Without asynchronous updates, the current component would be re-rendered every time the data is updated. For performance reasons, `Vue` updates the view asynchronously after the data has been updated in the current round. For example, let's say we repeatedly update a value within a method:

```javascript
this.msg = 1;
this.msg = 2;
this.msg = 3;
```

In reality, what we really want is just the final update, meaning the first three `DOM` updates can be avoided. We only need to render after all states have been modified, reducing some performance overhead.

The rendering issue is quite clear: rendering only once will definitely consume less performance than rendering immediately after each modification. Here, we also need to consider the optimization of the asynchronous update queue. 

If it were a synchronous update queue, for `this.msg=1`, it would roughly involve: updating `msg` value -> triggering `setter` -> triggering `watcher` `update` -> re-calling `render` -> generating a new `vdom` -> dom-diff -> `dom` update. This `dom` update is not rendering (i.e., layout, drawing, composition, and a series of steps) but updating the `DOM` tree structure in memory. The same process would be repeated for the second and third updates. When it comes to rendering, only the latest `3` in the updated `DOM` tree would be present, indicating that the operations on `msg` and its handling within `Vue` for the first `2` times are ineffective and can be optimized.

With an asynchronous update queue, for `this.msg=1`, it wouldn't immediately go through the above process but instead hold `Watchers` with dependencies on `msg` in the queue, which might look like `[Watcher1, Watcher2 ...]`. After `this.msg=2`, the `Watchers` with dependencies on `msg` would again be added to the queue, and `Vue` internally performs a deduplication check. After this operation, it can be considered that the queue data hasn't changed. The third update follows the same process. Of course, it's possible that there are operations on another property within the component, such as `this.otherMsg=othermessage`. The `Watcher` with dependencies on `otherMsg` would also be added to the asynchronous update queue. With duplicate checks, this `Watcher` would also only exist once in the queue. After this asynchronous task is completed, it would enter the next task execution process, namely iterating through each `Watcher` in the asynchronous update queue, triggering its `update`, and then going through the process of re-calling `render` -> `new vdom` -> `dom-diff` -> `dom` update. However, compared to the synchronous update queue, regardless of how many times `msg` is operated on, `Vue` internally only performs the re-calling of the real update process once. Therefore, the asynchronous update queue not only saves rendering costs, but also saves `Vue` internal computation and `DOM` tree operation costs, ensuring that rendering only occurs once, regardless of the method used.

In addition, components internally use `VirtualDOM` for rendering. This means that the component doesn't actually care which state has changed; it only needs to calculate once to determine which nodes need to be updated. In other words, if `N` states are changed, only one signal needs to be sent to update the `DOM` to the latest, even if multiple values are updated.

```javascript
this.msg = 1;
this.age = 2;
this.name = 3;
```
Here we modified three different states three times, but actually `Vue` only renders once, because `VirtualDOM` only needs to update the entire component's `DOM` once to the latest version, it doesn't care which specific state the update signal comes from.  
To achieve this, we need to defer the rendering operation until all states are modified. To do this, we just need to postpone the rendering operation to the end of the current event loop or to the next event loop. In other words, we just need to execute the rendering operation once at the end of the current event loop, after all the preceding state update statements have been executed. It will ignore all the preceding state update syntax and render only once at the end, regardless of how many state update statements were written before.  
Delaying rendering to the end of the current event loop is much faster than deferring to the next loop, so `Vue` prioritizes deferring the rendering operation to the end of the current event loop. If the execution environment does not support it, it will be downgraded to the next loop. `Vue`'s change detection mechanism (`setter`) ensures that it will always emit a rendering signal whenever the state changes, but `Vue` will check the queue after receiving the signal to ensure that there are no duplicates in the queue. If the operation does not exist in the queue, it will add the rendering operation to the queue, and then delay the execution of all rendering operations in the queue and clear the queue in an asynchronous manner. When modifying states repeatedly within the same event loop, the same rendering operation will not be repeatedly added to the queue. Therefore, when using `Vue`, updating the `DOM` after modifying the state is asynchronous.  
When the data changes, the `notify` method is called, the `watcher` is traversed, and the `update` method is called to notify the `watcher` to update. At this point, the `watcher` does not immediately execute. In the `update`, the `queueWatcher` method is called to put the `watcher` into a queue. In `queueWatcher`, it will dedupe based on the `watcher`. If multiple attributes depend on a `watcher` and the queue does not have the `watcher`, it will be added to the queue. Then the `flushSchedulerQueue` method will be added to the execution queue maintained by the `$nextTick` method, which will trigger the execution of all the callbacks in the buffer queue, and then the callback of the `$nextTick` method will be added to the execution queue maintained by the `$nextTick` method. In `flushSchedulerQueue`, a `before` method will be triggered, which is actually `beforeUpdate`, and then `watcher.run` will finally execute the `watcher`, and when the execution is complete, the page is rendered, and the `updated` hook is called after the update is complete.

## $nextTick
In the previous discussion, we talked about why `Vue` adopts asynchronous rendering. Suppose we have a requirement to obtain the `DOM` elements of the page after it has been rendered. Since rendering is asynchronous, we cannot directly and synchronously obtain this value in the defined method. This is where the `vm.$nextTick` method comes in. The `$nextTick` method in `Vue` delays the callback until after the next `DOM` update cycle, meaning it will execute the delayed callback after the next `DOM` update cycle ends. By using this method immediately after modifying the data, we can obtain the updated `DOM`. In simple terms, when the data is updated, the callback function in the `DOM` will be executed after the rendering is completed.  
To demonstrate the effect of the `$nextTick` method through a simple example, we need to understand that `Vue` updates the `DOM` asynchronously. This means that the component does not render immediately when the data is updated. The old value can still be obtained after acquiring the `DOM` structure. The callback function defined in the `$nextTick` method will be executed after the component has finished rendering, and then the value acquired from the `DOM` structure will be the new value.

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

### Asynchronous Mechanism
As explained in the official documentation, Vue executes the update of the DOM asynchronously. Whenever a data change is detected, Vue will start a queue and buffer all data changes that occur in the same event loop. If the same watcher is triggered multiple times, it will only be pushed into the queue once. Removing duplicate data during buffering is crucial for avoiding unnecessary calculations and DOM operations. Then, in the next event loop tick, Vue refreshes the queue and executes the actual work. Internally, Vue attempts to use native Promise.then, MutationObserver, and setImmediate for the asynchronous queue. If the execution environment does not support these, it will use setTimeout(fn, 0) instead.

JavaScript is single-threaded and introduces synchronous blocking and asynchronous non-blocking execution modes. In JavaScript's asynchronous mode, it maintains an Event Loop, which is an execution model with different implementations in different environments. Browsers and NodeJS have implemented their own Event Loops based on different technologies. The Event Loop in a browser consists of an Execution Stack, Background Threads, Macrotask Queue, and Microtask Queue.

- The Execution Stack is the data structure where synchronous tasks are executed in the main thread, forming a stack of frames from function calls.
- Background Threads are execution threads for features like setTimeout, setInterval, XMLHttpRequest, and so on, implemented by the browser.
- The Macrotask Queue is where the callbacks of some asynchronous tasks are added and wait to be called sequentially, which includes setTimeout, setInterval, setImmediate (Node), requestAnimationFrame, UI rendering, I/O, and other operations.
- The Microtask Queue is where the callbacks of other asynchronous tasks are added and wait to be called sequentially, which includes Promise, process.nextTick (Node), Object.observe, MutationObserver, and other operations.

When JavaScript is executed, it follows the following steps:
1. Synchronously execute the code in the Execution Stack and add asynchronous tasks from this code to the Background Threads.
2. After the synchronous code in the Execution Stack is executed, the stack is cleared and the Microtask Queue is scanned.
3. Take out the first task from the Microtask Queue, put it into the Execution Stack for execution, and dequeue the Microtask Queue at this time.
4. After the Execution Stack completes the task, continue to dequeue and execute tasks in the Microtask Queue until all tasks are completed.
5. After the last task in the Microtask Queue is dequeued and put into the Execution Stack, and the Microtask Queue is empty, when the Execution Stack task is completed, start scanning the empty Microtask Queue, then continue to scan the Macrotask Queue, dequeuing tasks to put into the Execution Stack and execute them.
6. This process repeats continuously...

#### Example
```javascript
// Step 1
console.log(1);

// Step 2
setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3);
  });
}, 0);
```

```javascript
// Step 3
new Promise((resolve, reject) => {
  console.log(4);
  resolve();
}).then(() => {
  console.log(5);
})

// Step 4
setTimeout(() => {
  console.log(6);
}, 0);

// Step 5
console.log(7);

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

##### Step 1
```javascript
// Execution stack: console
// Microtask queue: []
// Macro task queue: []
console.log(1); // 1
```
##### Step 2
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
##### Step 3
```javascript
// Execution stack: Promise
// Microtask queue: [then1]
// Macro task queue: [setTimeout1]
new Promise((resolve, reject) => {
  console.log(4); // 4 // Promise is a function object, and this is synchronous
  resolve();
}).then(() => {
  console.log(5);
})
```

##### Step 4
```javascript
// Execution stack: setTimeout
// Microtask queue: [then1]
// Macro task queue: [setTimeout1 setTimeout2]
setTimeout(() => {
  console.log(6);
}, 0);
```

##### Step 5
```javascript
// Execution stack: console
// Microtask queue: [then1]
// Macro task queue: [setTimeout1 setTimeout2]
console.log(7); // 7
```

##### Step 6
```javascript
// Execution stack: then1
// Microtask queue: []
// Macro task queue: [setTimeout1 setTimeout2]
console.log(5); // 5
```

##### Step 7
```javascript
// Execution stack: setTimeout1
// Microtask queue: [then2]
// Macro task queue: [setTimeout2]
console.log(2); // 2
Promise.resolve().then(() => {
    console.log(3);
});
```

##### Step 8
```javascript
// Execution stack: then2
// Microtask queue: []
// Macro task queue: [setTimeout2]
console.log(3); // 3
```

##### Step 9
```javascript
// Execution stack: setTimeout2
// Microtask queue: []
// Macro task queue: []
console.log(6); // 6
```


### Analysis
After understanding the execution queues of asynchronous tasks, let's go back to the `$nextTick` method. When user data updates, Vue will maintain a buffer queue and apply certain strategies to handle component rendering and DOM operations for all updated data before adding them to the buffer queue. Then, the `$nextTick` method will add a `flushSchedulerQueue` method to the execution queue (which triggers the execution of all callback functions in the buffer queue) and add the callback of the `$nextTick` method to the execution queue maintained by the `$nextTick` method. When the asynchronously scheduled execution queue is triggered, the `flushSchedulerQueue` method will first be executed to handle the DOM rendering tasks, and then the tasks built by the `$nextTick` method will be executed, allowing it to obtain the rendered DOM structure in the `$nextTick` method. During testing, an interesting phenomenon was observed: when two buttons were added in the example, clicking the `updateMsg` button resulted in `3 2 1`, while clicking the `updateMsgTest` button resulted in `2 3 1`.

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
Here, assuming that the `Promise` object is fully supported in the runtime environment, the use of `setTimeout` to execute the macro-task at the end is undisputed. However, there is an issue with the execution order when using the `$nextTick` method and the self-defined `Promise` instance. Although both are microtasks, the specific implementation in `Vue` may lead to different execution orders. First, let's take a look at the source code of the `$nextTick` method. Please note that this is the source code of version `Vue2.4.2`. The `$nextTick` method may have been changed in later versions.

```javascript
/**
 * Defer a task to execute it asynchronously.
 */
var nextTick = (function () {
  var callbacks = []; // The execution queue
  var pending = false; // A flag to determine whether it is the first time to be added in a certain event loop. Asynchronous execution of the queue is triggered only when it is added for the first time in the event loop.
  var timerFunc; // Method to execute the asynchronous execution queue, assuming here that Promise is fully supported.

  function nextTickHandler () { // Asynchronous execution task, it is already prepared to start executing asynchronous tasks when triggered
    pending = false; // Flag set to false
    var copies = callbacks.slice(0); // Create a copy
    callbacks.length = 0; // Empty the execution queue
    for (var i = 0; i < copies.length; i++) {
      copies[i](); // Execute
    }
  }
```

```javascript
// The nextTick behavior makes use of the microtask queue, which can be accessed
// through either the native Promise.then or MutationObserver.
// MutationObserver has broader support, but it has significant issues in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. After being
// triggered a few times, it stops functioning completely... so, if the native
// Promise is available, we will use it:
/* istanbul ignore if */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  var p = Promise.resolve();
  var logError = function (err) { console.error(err); };
  timerFunc = function () {
    p.then(nextTickHandler).catch(logError); // Mount the asynchronous task queue
    // In problematic UIWebViews, Promise.then doesn't completely break, but it
    // can get stuck in a weird state where callbacks are pushed into the
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
  // Use MutationObserver where the native Promise is not available,
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
    nextTick(() => console.log("Method to trigger the DOM rendering queue")); // Comment / Uncomment to see the effect
    setTimeout(() => console.log(1))
    Promise.resolve().then(() => console.log(2))
    nextTick(() => {
        console.log(3)
    })
})();
```

## Daily Quiz

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/29631893
https://github.com/berwin/Blog/issues/22
https://juejin.cn/post/6899822303022956552
https://segmentfault.com/a/1190000015698196
https://cn.vuejs.org/v2/guide/reactivity.html
https://blog.csdn.net/weixin_46396187/article/details/107462329
```