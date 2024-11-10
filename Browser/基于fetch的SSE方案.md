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
// packages/fetch-sse/server/modules/ping.ts
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

在`Server-Sent Events`事件中，自带了自动重连与事件`id`管理方法，当然这些处理都是在浏览器预设的`EventSource`来实现的，如果我们使用`fetch`来实现则需要自行管理。但是在我们当前的基本示例中是可以生效的，此外我们还可以通过自定义事件名来传递消息，如果仅传递`:xxx\n`的格式也可以作为注释使用，因此我们在创建连接时可以声明相关信息:

```js
// packages/fetch-sse/server/modules/ping.ts
res.write("retry: 10000\n");
res.write("id: -1\n");
res.write("event: connect\n");
res.write("data: " + new Date() + "\n\n");
```

那么在客户端则需要通过`EventSource`对象创建连接，然后通过自定义事件来接收上述服务端的数据，而实际上如果不指定具体的事件名，即上述的`connect`事件，则会默认缺省为`message`事件，也就是说这里的事件名并不是必须的。

```js
// packages/fetch-sse/client/components/ping.tsx
const onConnect = useMemoFn((e: MessageEvent<string>) => {
  prepend("Start Time: " + e.data);
});
const source = new EventSource("/ping");
source.addEventListener("connect", onConnect);
```

针对于默认的`message`事件，我们同样在服务端将其输出，我们先前也提到了只要我们不调用`res.end`则会导致整个连接处于挂起状态，那么在这里如果我们希望保持连接的话则只需要通过定时器不断地向客户端发送数据即可。

```js
// packages/fetch-sse/server/modules/ping.ts
let index = 0;
const interval = setInterval(() => {
  res.write("id: " + index++ + "\n");
  res.write("data: " + new Date() + "\n\n");
}, 1000);
```

而在客户端我们可以为`source`对象添加`onmessage`事件绑定，也可以直接`addEventListener(message)`来绑定事件。此外，当我们成功通过`EventSource`对象创建连接后，我们可以在浏览器控制台的`Network`面板看到`EventStream`的数据传输面板，我们定义的`id`、`type`、`data`、`time`都会在此处显示。

```js
// packages/fetch-sse/client/components/ping.tsx
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
在服务端处理数据转发与代理之前，我们自然需要定义整个事件的数据源。在这里我们并没有必要实际对接例如`OpenAI`、`Coze`的流式响应，只需要模拟一下即可，那么在这里我们就先定义`/stream`接口来模拟流式输出。在这里需要注意的一点是，通常我们的输出都是`Markdown`的格式，那么这里自然会有`\n`的符号，而在`SSE`协议中`\n`是需要作为关键字使用的，因此我们就需要对其编码/解码，以此来避免`\n`关键字，那么无论是使用`JSON.stringify`抑或是`encodeURIComponent`都是可以的，在这里我们简单一些，直接将`\n`替换为`\\n`。

```js
// packages/fetch-sse/server/modules/stream.ts
const content = `# 出师表

- 诸葛亮 

先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也。诚宜开张圣听，以光先帝遗德，恢弘志士之气，不宜妄自菲薄，引喻失义，以塞忠谏之路也。

...

今当远离，临表涕零，不知所言。`.replace(/\n/g, " \\n");
```

在此处设置响应头等处理就不再过多叙述了，在实际模型推理的过程中可能会有两种输出，一种是将本次对话的所有内容都输出，类似于对字符串的`slice`永远是从`0`开始，另一种则是只输出最新内容`delta`，类似于`slice`时记录了上次输出的`end`作为下次输出的`start`。在这里我们简单一些，选用第一种方式将内容从`0`开始输出不断推送到客户端。

由于是模拟流式输出，因此我们直接设置一个定时器，并且随机生成本次输出的步进长度，然后将其作为新的`start`记录下来，紧接着将内容输出到客户端，这里我们直接使用默认的`message`事件即可，当输出到最后时则关闭定时器并且关闭连接。当然，我们也不能忽略当连接的客户端关闭时，需要主动清理当前的定时器避免服务端计算资源浪费。

```js
// packages/fetch-sse/server/modules/stream.ts
res.write("event: connect\n");
res.write("data: " + Date.now() + "\n\n");

let start = 0;
const interval = setInterval(() => {
  const slice = Math.floor(Math.random() * 30) + 1;
  start = start + slice;
  res.write("event: message\n");
  res.write("data: " + content.slice(0, start) + "\n\n");
  if (start >= content.length) {
    clearInterval(interval);
    res.end();
  }
}, 500);

req.socket.on("close", () => {
  console.log("[stream] connection close");
  clearInterval(interval);
  res.end();
});
```

### 数据转发
当定义好数据源接口之后，我们就可以开始实现数据转发的功能，用以实现服务端预处理响应，也就是在这里我们可以对数据进行过滤、审查等操作。因此我们就需要在服务端接受流式响应，进行数据预处理之后再流式响应到客户端。那么在这个转发接口中首先我们就需要对数据源接口发起请求，在这里我们直接使用`node-fetch`来发起请求。

```js
// packages/fetch-sse/server/modules/transfer.ts
import fetch from "node-fetch";
const response = await fetch("http://127.0.0.1:8800/stream")
```

使用`node-fetch`的过程中需要注意我们是直接使用`ts-node`启动的服务，因此还是如果`CJS`混入`ESM`的话会导致抛出异常，因此这里我们需要选择`2.x`版本。此外，我们还需要定义好`AbortController`，以便在客户端关闭连接时及时终止请求，在`node-fetch`中`res.body`依然可以读取`ReadableStream`，以此来处理转发的`SSE`响应。

```js
// packages/fetch-sse/server/modules/transfer.ts
const ctrl = new AbortController();
const response = await fetch("http://127.0.0.1:8800/stream", {
  signal: ctrl.signal as AbortSignal,
});
const readable = response.body;
if (!readable) return null;

req.socket.on("close", () => {
  console.log("[transfer] connection close");
  ctrl.abort();
  res.end();
});
```

在服务端我们是没有`EventSource`对象来接收数据的，那么我们自然只能根据`SSE`协议来自行解析数据，而既然我们是通过`ReadableStream`来实现的数据读取，那么我们就需要流式地处理二进制数据，而不能直接解析分隔。因此在这里我们实现`StreamParser`，当接收到`Uint8Array`二进制数据后，我们首先将其合并为新的`buffer`，然后遍历当前数据，当遇到`\n`时则调度到`onLine`方法来处理数据。

```js
// packages/fetch-sse/server/utils/steam-parser.ts
export class StreamParser {
  private compose(data: Uint8Array) {
    const buffer = new Uint8Array(this.buffer.length + data.length);
    buffer.set(this.buffer);
    buffer.set(data, this.buffer.length);
    this.buffer = buffer;
    return buffer;
  }

  public onBinary(bytes: Uint8Array) {
    const buffer = this.compose(bytes);
    const len = buffer.length;
    let start = 0;

    for (let i = 0; i < len; i++) {
      if (buffer[i] === 10) {
        this.onLine(buffer.slice(start, i));
        start = i + 1;
      }
    }
    this.buffer = buffer.slice(start);
  }
}
```

当处理到`onLine`时，我们就需要根据`SSE`协议来按行解析数据了，我们将要处理的数据格式将是`x: xxx;`，在我们的处理下`\n`是作为末尾节点不会被传参，那么此时如果我们的数据传递长度为`0`，那么就需要发起`onMessage`事件，将事件名与数据全部传递带预设的事件处理函数中。在其后我们就可以使用`TextDecoder`来解析为字符串，然后就可以根据`:`来分隔与解析数据了。

```js
// packages/fetch-sse/server/utils/steam-parser.ts
export type Message = {
  event: string;
  data: string;
  id?: string;
};

export class StreamParser {
  private buffer: Uint8Array;
  private message: Partial<Message>;
  public onMessage?: (message: Message) => void;

  constructor() {
    this.message = {};
    this.buffer = new Uint8Array();
  }

  private onLine(bytes: Uint8Array) {
    if (bytes.length === 0) {
      if (this.onMessage && this.message.event) {
        this.message.data = this.message.data || "";
        this.onMessage(this.message as Message);
      }
      this.message = {};
      return;
    }
    const decoder = new TextDecoder();
    const line = decoder.decode(bytes);
    const [field, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    switch (field) {
      case "id":
        this.message.id = value;
        break;
      case "event":
        this.message.event = value;
        break;
      case "data":
        this.message.event = this.message.event || "message";
        this.message.data = value;
        break;
      default:
        break;
    }
  }
}
```

这里需要注意的是，在`Node`中的`ReadableStream`与浏览器实现的`ReadableStream`函数签名是不一样的，因此这里我们直接方便地使用`await`迭代数据即可，当然使用`on("data") on("end")`来接收数据与结束响应即可。我们还需要绑定`onMessage`事件来接收解析好的数据，并且将数据响应到目标客户端即可。

```js
const parser = new StreamParser();
parser.onMessage = message => {
  res.write(`event: ${message.event}\n`);
  res.write(`data: ${message.data}\n\n`);
};

for await (const chunk of readable) {
  const buffer = chunk as Buffer;
  const uint = new Uint8Array(buffer);
  parser.onBinary(uint);
}

res.end();
```


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
