# Web Worker
`JavaScript`是单线程语言，如果在`Js`主线程上进行比较耗时的操作，那么不仅异步的事件回调无法正常完成，浏览器的渲染线程也将被阻塞，无法正常渲染页面。`Web Worker`能够把`JavaScript`计算委托给后台线程，线程可以执行任务而不干扰用户界面。

## 概述
`worker`是使用构造函数创建的一个对象来运行一个`Js`文件，这个`Js`文件中包含将在`worker`线程中运行的代码，`worker`运行的全局对象不是当前`window`，专用`worker`线程运行环境的全局对象为`DedicatedWorkerGlobalScope`，共享`worker`线程运行环境的全局对象为`SharedWorkerGlobalScope`。  
在`worker`可以运行任意`JavaScript`代码，但不能够直接操作`DOM`节点，也不能使用`window`对象的默认方法和属性，但是在`window`对象下的很多方法包括`WebSockets`，`IndexedDB`等在`worker`全局对象中都有实现。  
`worker`线程与主线程之间的通信是通过`postMessage`发送消息以及`onmessage`事件处理函数来接收消息，这个过程中数据并不是被共享而是被复制。  
只要运行在同源的父页面中，`worker`可以依次生成新的`worker`。此外`worker`还可以使用`XMLHttpRequest`进行网络`I/O`，但是`XMLHttpRequest`的`responseXML`和`channel`属性总会返回`null`。

## 专用worker
专用`worker`仅能被生成它的脚本使用，通过构造函数生成`worker`，然后通过消息传递机制将数据传递到`worker`线程计算完毕后再将数据传回进行下一步操作，`worker`线程的关闭可以在主线程中关闭也可以在`worker`线程中关闭。

```javascript
// 需要开启一个server
var worker = new Worker('worker.js'); // 实例化worker线程 
worker.postMessage(1); // 传递消息
worker.onmessage = function(e){ // 接收消息事件
    console.log(e.data); // 2
    // worker.terminate(); // 关闭worker线程
}
```

```javascript
// worker.js worker线程
onmessage = function(e) { // worker接收消息
    var v = e.data; 
    console.log(v); // 1
    postMessage(v * 2); // 乘以2并传递消息 // 简单的计算
    // close(); // 关闭worker线程
}
```

## 共享worker
共享`worker`可以同时被多个脚本使用，即使这些脚本正在被不同的`window`、`iframe`或者`worker`访问，也就是说可以使用共享`worker`进行多个浏览器窗口间通信，当然共享`worker`的通信必须为同源，不能跨域通信。生成共享`worker`与生成专用`worker`非常相似，只是构造器的名字不同，他们之间一个很大的区别在于：共享`worker`必须通过一个确切的打开的端口对象供脚本与`worker`通信，在专用`worker`中这一部分是隐式进行的。如果父级线程和`worker`线程需要双向通信，那么它们都需要调用`start()`方法，对于消息的传递依然使用`postMessage`但是必须通过调用端口上的`postMessage`方法来实现消息通信。
```javascript
// 需要开启一个server
// 页面A 浏览器窗口间通信实例
var worker = new SharedWorker('worker.js');
worker.port.start();
worker.port.postMessage(1);
```

```javascript
// 页面B 浏览器窗口间通信实例
var worker = new SharedWorker('worker.js');
worker.port.start();
worker.port.onmessage = function(event){
    console.log(event.data);
};
```

```javascript
// worker.js worker线程
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


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/API/Worker
https://developer.mozilla.org/zh-CN/docs/Web/API/SharedWorker
https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers
```
