# Asynchronous Mechanism in JavaScript

JavaScript is a single-threaded language, which means it can only perform one task at a time. If there are multiple tasks, they must be queued up, waiting for the completion of the preceding task before executing the next one. The advantage of this mode is that it is relatively simple to implement and the execution environment is relatively straightforward. However, the downside is that if one task takes a long time, the subsequent tasks have to wait in line, delaying the execution of the entire program. The common unresponsiveness of the browser, also known as a deadlock state, is often caused by a piece of JavaScript code running for a long time, such as an infinite loop, which hinders the execution of other tasks.

## Execution Mechanism

To address the aforementioned issue, JavaScript divides the execution mode into two types: synchronous and asynchronous. The terms synchronous and asynchronous refer to whether the entire process needs to be completed in order and whether the functions you call will immediately return the result, respectively.

### Synchronous

Synchronous mode operates as synchronous blocking, where the subsequent task waits for the preceding task to finish before being executed. The execution sequence of the program is consistent with the order of the tasks, being synchronous.

```javascript
var i = 100;
while(--i) { console.log(i); }
console.log("I can only execute after the while loop is finished");
```

### Asynchronous

Asynchronous execution operates in a non-blocking mode, where each task has one or more callback functions. Instead of executing the next task after the completion of the preceding one, it executes the callback function, and the subsequent task does not wait for the preceding task to complete before execution. Therefore, the execution sequence of the program is inconsistent with the order of the tasks, being asynchronous. Each browser allocates only one JavaScript thread per tab, with the main tasks being user interaction and DOM manipulation, which is why it must be single-threaded to avoid complex synchronization issues. For example, if JavaScript had two threads at the same time, one thread adding content to a DOM node while the other thread deleting that node, the browser would be unable to determine which thread's operation to follow.

```javascript
setTimeout(() => console.log("I execute later"), 0);
// Note: The W3C standard specifies that a time interval in setTimeout less than 4ms is rounded up to 4ms. Additionally, this is also related to the browser settings, main thread, and task queues, so the actual execution time may be greater than 4ms. For example, old versions of browsers set the minimum interval to 10 milliseconds. Furthermore, for DOM manipulations, especially those involving page re-rendering, they are usually not executed immediately but at intervals of every 16 milliseconds. In this case, using requestAnimationFrame() yields better results than setTimeout().
console.log("I execute first");
```

## Asynchronous Mechanism

Let's first look at an example, to test an asynchronous operation as mentioned in the previous content.

```javascript
setTimeout(() => console.log("I execute long after"), 0);
var i = 3000000000;
while(--i) { }
console.log("Loop execution completed");
```

In local testing, the `setTimeout` callback function executes approximately 30s later, far exceeding 4ms. I intentionally set a very large loop in the main thread to block the JavaScript main thread. Please note that I did not set an infinite loop here. If I were to set an infinite loop here to block the main thread, the `setTimeout` callback function would never execute. Furthermore, since the rendering thread and the JS engine thread are mutually exclusive, when the JS thread is processing a task, the rendering thread is suspended, causing the entire page to be blocked and unable to refresh or even close. The only way to close the page is by using the task manager to end the Tab process.

JavaScript implements asynchronous behavior through an execution stack and a task queue. All synchronous tasks are executed on the main thread, forming an execution stack, and various event callbacks (also known as messages) are stored in the task queue. After the tasks in the execution stack are completed, the main thread starts to read and execute the tasks in the task queue, repeating this process endlessly.

### Event Loop

The main thread continuously reads events from the task queue, hence this mechanism is referred to as the "Event Loop". The Event Loop is an execution model with different implementations in different environments. Browsers and NodeJS have implemented their respective Event Loop based on different technologies. The Event Loop in the browser is explicitly defined in the HTML5 specification, while the Event Loop in NodeJS is based on the implementation of libuv.

In the browser, the Event Loop consists of the execution stack, background threads, macrotask queue, and microtask queue.

- The execution stack is the data structure for executing synchronous tasks on the main thread.
- Background threads are for the execution of functions like setTimeout, setInterval, XMLHttpRequest, etc.
- Macrotask queue contains the callbacks of some asynchronous tasks waiting to be called one after the other, including setTimeout, setInterval, setImmediate(Node), requestAnimationFrame, UI rendering, I/O, etc.
- Microtask queue contains the callbacks of other asynchronous tasks waiting to be called one after the other, including Promise, process.nextTick(Node), Object.observe, MutationObserver, etc.

When JS is executed, it follows the steps as below:
1. The synchronous codes in the execution stack are executed first, and the asynchronous tasks from these codes are added to the background threads.
2. After the execution of all synchronous codes in the execution stack, the stack becomes empty, and starts scanning the microtask queue.
3. The first task in the microtask queue is taken out, moved to the execution stack, and executed, resulting in the microtask queue being dequeued.
4. After the execution stack is empty, other tasks in the microtask queue are dequeued and executed until the microtask queue is empty.
5. After the last task in the microtask queue is dequeued and moved to the execution stack, and the microtask queue is empty, the scanning continues to the macrotask queue. Tasks are dequeued and moved to the execution stack, executed, and if the microtask queue is empty, the scanning of the macrotask queue continues.
6. This loop continues indefinitely.

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
// Step 1
// Execution stack: console
// Microtask queue: []
// Macrotask queue: []
console.log(1); // 1
```
##### Step 2
// Execution stack: setTimeout
// Microtask queue: []
// Macrotask queue: [setTimeout1]
```javascript
setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3);
  });
}, 0);
```
##### Step 3
// Execution stack: Promise
// Microtask queue: [then1]
// Macrotask queue: [setTimeout1]
```javascript
new Promise((resolve, reject) => {
  console.log(4); // 4 // Promise is a function object, this is synchronous // Execution stack: Promise console
  resolve();
}).then(() => {
  console.log(5);
})
```

##### Step 4
// Execution stack: setTimeout
// Microtask queue: [then1]
// Macrotask queue: [setTimeout1 setTimeout2]
```javascript
setTimeout(() => {
  console.log(6);
}, 0);
```

##### Step 5
// Execution stack: console
// Microtask queue: [then1]
// Macrotask queue: [setTimeout1 setTimeout2]
```javascript
console.log(7); // 7
```

##### Step 6
// Execution stack: then1
// Microtask queue: []
// Macrotask queue: [setTimeout1 setTimeout2]
```javascript
console.log(5); // 5
```

##### Step 7
// Execution stack: setTimeout1
// Microtask queue: [then2]
// Macrotask queue: [setTimeout2]
```javascript
console.log(2); // 2
Promise.resolve().then(() => {
    console.log(3);
});
```

##### Step 8
// Execution stack: then2
// Microtask queue: []
// Macrotask queue: [setTimeout2]
```javascript
console.log(3); // 3
```

##### Step 9
// Execution stack: setTimeout2
// Microtask queue: []
// Macrotask queue: []
```javascript
console.log(6); // 6
```

## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```


## References

```
https://www.jianshu.com/p/1a35857c78e5
https://segmentfault.com/a/1190000016278115
https://segmentfault.com/a/1190000012925872
https://www.cnblogs.com/sunidol/p/11301808.html
http://www.ruanyifeng.com/blog/2014/10/event-loop.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/EventLoop
```