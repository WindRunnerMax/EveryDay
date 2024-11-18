# Web Worker
`JavaScript` is a single-threaded language. If a time-consuming operation is performed on the main thread of `Js`, not only will the asynchronous event callback fail to complete normally, but the browser's rendering thread will also be blocked, preventing the page from being rendered properly. `Web Worker` allows JavaScript calculations to be delegated to background threads, which can perform tasks without interfering with the user interface.

## Description
A `worker` is an object created using a constructor function to run a `Js` file. This `Js` file contains the code that will run in the `worker` thread. The global object running in the `worker` is not the current `window`. The global object for the dedicated `worker` thread environment is `DedicatedWorkerGlobalScope`, and the global object for the shared `worker` thread environment is `SharedWorkerGlobalScope`.  
In a `worker`, you can run any JavaScript code, but you cannot directly manipulate `DOM` nodes or use the default methods and properties of the `window` object. However, many methods under the `window` object, including `WebSockets` and `IndexedDB`, are implemented in the `worker` global object.  
Communication between the `worker` thread and the main thread is done through sending messages using `postMessage` and receiving messages using the `onmessage` event handler. During this process, the data is not shared but copied.  
As long as it is running in the same origin parent page, a `worker` can generate new `workers` in sequence. In addition, a `worker` can also use `XMLHttpRequest` for network I/O, but the `responseXML` and `channel` properties of `XMLHttpRequest` will always return `null`.

## Dedicated Worker
A dedicated `worker` can only be used by the script that generated it. It is generated using a constructor function, and data is passed to the `worker` thread through a message passing mechanism. After the `worker` thread finishes the calculation, the data is passed back for further operations. The `worker` thread can be closed in either the main thread or the `worker` thread.

```javascript
// Need to start a server
var worker = new Worker('worker.js'); // Instantiate the worker thread
worker.postMessage(1); // Send a message
worker.onmessage = function(e){ // Receive a message event
    console.log(e.data); // 2
    // worker.terminate(); // Close the worker thread
}
```

```javascript
// worker.js worker thread
onmessage = function(e) { // Worker receives a message
    var v = e.data; 
    console.log(v); // 1
    postMessage(v * 2); // Multiply by 2 and send a message // Simple calculation
    // close(); // Close the worker thread
}
```

## Shared Worker
A shared `worker` can be used by multiple scripts at the same time, even if these scripts are being accessed by different `window`, `iframe`, or `worker` instances. This means that a shared `worker` can be used for communication between multiple browser windows. However, communication with a shared `worker` must be within the same origin and cannot be cross-domain. Generating a shared `worker` is very similar to generating a dedicated `worker`, except that the constructor name is different. One major difference between them is that a shared `worker` must be communicated with through a specific open port object, which is used by the script to communicate with the `worker`. In a dedicated `worker`, this part is implicit. If both the parent thread and the `worker` thread need bidirectional communication, they both need to call the `start()` method. Message passing still uses `postMessage`, but it must be implemented through the `postMessage` method on the port.
```javascript
// Need to start a server
// Page A, example of communication between browser windows
var worker = new SharedWorker('worker.js');
worker.port.start();
worker.port.postMessage(1);
```

```javascript
// Example of inter-window communication in page B
var worker = new SharedWorker('worker.js');
worker.port.start();
worker.port.onmessage = function(event){
    console.log(event.data);
};
```

```javascript
// worker.js worker thread
var portArr = [];
onconnect = function(e) {
  var port = e.ports[0];
  if(portArr.indexOf(port) === -1) portArr.push(port);
  port.onmessage = function(e) {
    portArr.forEach( v => {
        v.postMessage(e.data);
    })
  }
}
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://developer.mozilla.org/en-US/docs/Web/API/Worker
https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker
https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
```