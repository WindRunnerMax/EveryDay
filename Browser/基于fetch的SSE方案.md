# 基于fetch的SSE方案
`Server-Sent Events(SSE)`是一种由服务器单向推送实时更新到客户端的方案，基本原理是客户端通过`HTTP`请求打开与服务端的持久连接，服务端可以通过该连接连续发送事件数据。`SSE`适用于需要持续更新数据的应用，如实时通知、消息推送和动态内容更新，相比于`WebSocket`的数据通信方案更加轻量，`SSE`更易于实现且更适合简单的单向数据流场景。

## 描述
`SSE`本质上是使用`HTTP`长链接以及`ReadableStream`实现的一种单向数据流方案，客户端可以保持与服务器的单向连接，并且能够持续接收服务端推送的实时事件，而不需要客户端不断地向服务器发送请求来获取数据更新。而在浏览器中实现了基本的`EventSource`对象，可以很方便地处理服务端的响应，服务端自然也可以通过不停地对`Response`对象写数据来实现流式响应。而在我们实际的业务需求中，无论是服务端和客户端都不是那么理想的场景:

* 服务端预处理响应，在实现类似流式对话的需求过程中，通常我们都是将`LLM`推理的数据通过服务端转发到客户端，而在服务端处理过程中我们就需要对数据进行过滤、审查等操作，因此我们就需要在服务端接受流式响应，进行数据预处理之后再流式响应到客户端。
* 服务端数据直接转发，在不需要进行数据预处理的情况下，如果在服务端接收数据流式响应再将其转发到客户端则显得比较麻烦，因此我们可以直接将请求作为`HTTP`长连接代理到目标的请求地址，而不需要实际实现接收响应后再转发到客户端。
* 基于`fetch`请求数据，`EventSource`对象只能发起`GET`请求，且无法定义请求头以及携带请求体，这在需要鉴权的情况下就需要将所有的内容编码到`URL`上，多数浏览器对`URL`长度上都限制在`2000`字符，因此基于`fetch`实现`SSE`数据请求则可以解决上述问题。

在这里我们首先来通过`EventSource`对象来实现基本的`SSE`，由于`EventSource`对象是浏览器实现的`API`，是属于客户端的实现，因此我们在这里还需要先使用`Node.js`实现服务端的数据流式响应，文中涉及的`DEMO`都在`https://github.com/WindRunnerMax/webpack-simple-environment`中。

在服务端中实现基本的流式数据响应比较方便，我们首先需要将响应头设置为`text/event-stream;`，注意响应头是需要在响应体之前设置的，否则在执行`res.writeHead`之前后执行`res.write`的话会导致响应`ERR_INVALID_CHUNKED_ENCODING`。

```js
const ping = (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
}
```



自动重连与事件 ID 管理



## 服务端

编码/解码 避免\n

### 数据转发

### 请求代理


req.on("close")+req.on("data") 

```bash
curl -X POST http://127.0.0.1:8800/proxy \
-H "Content-Type: application/json"  \
-d '{"key1":"value1", "key2":"value2"}'
```

req.socket.on("close")/connection.on("close")


## 客户端

### fetch实现

### 流式交互



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://github.com/Azure/fetch-event-source
https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource
https://www.ruanyifeng.com/blog/2017/05/server-sent_events.html
https://nodejs.org/docs/latest-v20.x/api/http.html#messagesocket
https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
https://stackoverflow.com/questions/7348736/how-to-check-if-connection-was-aborted-in-node-js-server
https://stackoverflow.com/questions/76115409/why-does-node-js-express-call-request-close-on-post-request-with-data-before-r
```
