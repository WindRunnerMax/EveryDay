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

`SSE`实际上是一种协议，那么既然是协议自然就需要有固定的格式，在`text/event-stream`的响应格式中，每组数据都是以`\n\n`分隔的，而在组中的数据如果需要传递多种类型，则需要以`\n`分隔，例如我们需要同时传递`id`、`event`和`data`字段的数据:

```plain
id: 1
event: message
data: hello world

id: 2
event: custom
data: hello
data: world
```

在`Server-Sent Events`事件中，自带了自动重连与事件`id`管理方法，当然这些处理都是在浏览器预设的`EventSource`来实现的，如果我们使用`fetch`来实现则需要自行管理。但是在我们当前的基本示例中是可以生效的，此外我们还可以通过自定义事件名来传递消息，因此我们在创建连接时可以声明相关信息:

```js
res.write("retry: 10000\n");
res.write("id: -1\n");
res.write("event: connect\n");
res.write("data: " + new Date() + "\n\n");
```

那么在客户端则需要通过`EventSource`对象创建连接，然后通过自定义事件来接收上述服务端的数据，而实际上如果不指定具体的事件名，即上述的`connect`事件，则会默认缺省为`message`事件，也就是说这里的事件名并不是必须的。

```js
const onConnect = useMemoFn((e: MessageEvent<string>) => {
  prepend("Start Time: " + e.data);
});
const source = new EventSource("/ping");
source.addEventListener("connect", onConnect);
```

针对于默认的`message`事件，我们同样在服务端将其输出，我们先前也提到了只要我们不调用`res.end`则会导致整个连接处于挂起状态，那么在这里如果我们希望保持连接的话则只需要通过定时器不断地向客户端发送数据即可。

```js
let index = 0;
const interval = setInterval(() => {
  res.write("id: " + index++ + "\n");
  res.write("data: " + new Date() + "\n\n");
}, 1000);
```

而在客户端我们可以为`source`对象添加`onmessage`事件绑定，也可以直接`addEventListener(message)`来绑定事件。此外，当我们成功通过`EventSource`对象创建连接后，我们可以在浏览器控制台的`Network`面板看到`EventStream`的数据传输面板，我们定义的`id`、`type`、`data`、`time`都会在此处显示。

```js
const prepend = (text: string) => {
  const el = ref.current;
  if (!el) return;
  const child = document.createElement("div");
  child.textContent = text;
  el.prepend(child);
};

const onMessage = (e: MessageEvent<string>) => {
  prepend("Ping: " + e.data);
};

const source = new EventSource("/ping");
source.onmessage = onMessage;
```

在服务端我们还需要注意的是，当用户的客户端连接关闭我们同样也需要关闭服务端的请求，以此来避免额外资源的占用，当然在我们这里的定时器中如果不关闭的话就是内存泄漏而不仅仅是额外的资源占用了。

```js
req.socket.on("close", () => {
  console.log("[ping] connection close");
  clearInterval(interval);
  res.end();
});
```

此外，当不通过`HTTP/2`建立连接时，`SSE`对于单个域名会受到最大连接数的限制，这在打开多个选项卡时会比较麻烦，该限制是浏览器针对数据请求设计的，并且被设置为一个非常低的`6`个连接数量。此限制是针对每个域的请求，因此这意味着我们可以跨所有选项卡打开`6`个`SSE`连接到`www.example1.com`，以及同时打开`6`个`SSE`连接到`www.example2.com`，而使用`HTTP/2`时，同一时间内`HTTP`最大连接数由服务器和客户端之间协商，默认为`100`。

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

无法在控制台的面板显示

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
