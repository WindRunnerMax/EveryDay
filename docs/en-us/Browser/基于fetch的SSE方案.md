
# SSE Solution Based on Fetch
`Server-Sent Events (SSE)` is a server-to-client communication solution where real-time updates are pushed from the server to the client unidirectionally. The basic principle involves the client opening a persistent connection to the server via an `HTTP` request, allowing the server to continuously send event data through this connection. `SSE` is suitable for applications that require ongoing data updates, such as real-time notifications, message push, and dynamic content updates. Compared to the data communication solution provided by `WebSocket`, `SSE` is lighter, easier to implement, and more suitable for simple one-way data flow scenarios.

## Description
Essentially, `SSE` is a unidirectional data flow solution implemented using a persistent `HTTP` connection and `ReadableStream`. The client can maintain a one-way connection with the server and continuously receive real-time events pushed by the server without the need to constantly send requests to the server for data updates. Browsers have implemented the basic `EventSource` object, which conveniently handles server responses. The server, in turn, can achieve streaming responses by continuously writing data to the `Response` object. In practical business scenarios, both the server and client environments may not be ideal:

- Preprocessing responses on the server side: When implementing requirements like streaming dialogs, it is common to relay data inferred by the Long-Short Term Memory (LLM) model from the server to the client. During server-side processing, data filtering and inspection are required. Thus, receiving streaming responses on the server side for data preprocessing before streaming them to the client becomes necessary.
- Direct server data forwarding: In cases where data preprocessing is not needed, directly receiving and then forwarding data streams to the client on the server side can be cumbersome. Instead, the request can be proxied as an `HTTP` long connection directly to the target address without the need to receive and then forward the response to the client.
- Fetch-based data requests: The `EventSource` object can only initiate `GET` requests and cannot define request headers or carry request bodies. In situations requiring authentication, all content may need to be encoded in the `URL`, with most browsers limiting the URL length to around 2000 characters. Therefore, utilizing `fetch` to implement `SSE` data requests can resolve such issues.

Let's start by implementing the basic `SSE` using the `EventSource` object. Since the `EventSource` object is a browser's API and belongs to the client-side implementation, we first need to use `Node.js` to implement server-side streaming responses. The demos mentioned in the text are available at `https://github.com/WindRunnerMax/webpack-simple-environment`.

Implementing basic streaming data responses on the server side is straightforward. Initially, we set the response header to `text/event-stream;`. It is crucial to set the response header before the response body to avoid errors like `ERR_INVALID_CHUNKED_ENCODING` that may occur when executing `res.write` after `res.writeHead`.

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

`SSE` is essentially a protocol and, therefore, follows a specific format. In the `text/event-stream` response format, each data group is separated by `\n\n`, and within each group, different types of data are separated by `\n`. For example, if we need to transmit data with `id`, `event`, and `data` fields simultaneously:

```plain
id: 1
event: message
data: hello world

id: 2
event: custom
data: hello
data: world
```

Within `Server-Sent Events`, features like automatic reconnection and event `id` management are provided by default in the browser's built-in `EventSource`. However, if using `fetch` for implementation, these aspects need to be managed manually. In our basic example, these functionalities work effectively. Moreover, custom event names can be used to transmit messages. Notes or comments can be added using the `:xxx\n` format. Hence, when establishing a connection, relevant information can be declared:

```js
// packages/fetch-sse/server/modules/ping.ts
res.write("retry: 10000\n");
res.write("id: -1\n");
res.write("event: connect\n");
res.write("data: " + new Date() + "\n\n");
```

On the client side, one needs to create a connection using the `EventSource` object and receive server data using custom events. If a specific event name is not specified, defaulting to the `message` event will occur.


```js
// packages/fetch-sse/client/components/ping.tsx
const onConnect = useMemoFn((e: MessageEvent<string>) => {
  prepend("Start Time: " + e.data);
});
const source = new EventSource("/ping");
source.addEventListener("connect", onConnect);
```

When dealing with the default `message` event, we also output it on the server-side. As mentioned before, as long as we don't call `res.end`, the entire connection will remain in a suspended state. So, if we want to keep the connection alive, we just need to continuously send data to the client through a timer here.

```js
// packages/fetch-sse/server/modules/ping.ts
let index = 0;
const interval = setInterval(() => {
  res.write("id: " + index++ + "\n");
  res.write("data: " + new Date() + "\n\n");
}, 1000);
```

On the client-side, we can bind the `onmessage` event handler to the `source` object or directly use `addEventListener("message")`. Furthermore, after successfully establishing a connection using the `EventSource` object, we can see the EventStream data transmission panel in the browser's Network panel. The `id`, `type`, `data`, and `time` we defined will all be displayed there.

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

On the server-side, we also need to handle closing the server request when the client's connection is closed to avoid unnecessary resource consumption. In our case, if we don't close the timer, it will lead to a memory leak rather than just additional resource consumption.

```js
req.socket.on("close", () => {
  console.log("[ping] connection close");
  clearInterval(interval);
  res.end();
});
```

Moreover, when establishing a connection without using `HTTP/2`, SSE has a limit on the maximum number of connections per single domain. This can be troublesome when opening multiple tabs since the browser sets a very low limit of `6` connections. This limit is per domain, meaning that we can open `6` SSE connections to `www.example1.com` across all tabs and at the same time open another `6` SSE connections to `www.example2.com`. With `HTTP/2`, the maximum number of HTTP connections between the server and client is typically negotiated and set to a default of `100` at any given time.

## Server-Side
Before we handle data forwarding and proxy on the server-side, it's natural to define the data source of the entire event. Here, we don't actually need to integrate streaming responses from services like `OpenAI` or `Coze`; simply simulating it will suffice. Hence, we begin by defining the `/stream` endpoint to simulate streaming output. It's important to note that our output is typically in Markdown format, so the presence of `\n` symbols is common. In the SSE protocol, `\n` is treated as a significant keyword. Therefore, we need to encode/decode it to avoid conflicts with `\n`. Whether using `JSON.stringify` or `encodeURIComponent`, both methods are viable. For simplicity, we directly replace `\n` with `\\n`.

```js
// packages/fetch-sse/server/modules/stream.ts
const content = `# 出师表

- 诸葛亮 

先帝创业未半而中...
```

In this context, we won't delve too deeply into setting response headers and processing. During the actual model inference process, two types of outputs may occur. One is to output all the content of the current conversation, similar to slicing a string always starting from `0`. The other type is to output only the latest content `delta`, similar to when slicing, where the `end` of the last output is recorded as the `start` of the next output. Here, we'll keep it simple and choose the first method to continuously push content starting from `0` to the client.

Since we are simulating streaming output, we directly set a timer, randomly generate the step length of the current output, record it as a new `start`, then immediately output the content to the client using the default `message` event. When reaching the end of the output, we close the timer and the connection. Of course, we must also consider cleaning up the current timer when the client closes the connection to avoid wasting server computing resources.

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

### Data Forwarding
Once the data source interface is defined, we can start implementing data forwarding to carry out server-side preprocessing of responses. This is where we can filter, inspect, or perform other operations on the data. Therefore, we need to receive streaming responses on the server, preprocess the data, and then stream it back to the client. To initiate requests to the data source interface, we use `node-fetch` directly.

```js
// packages/fetch-sse/server/modules/transfer.ts
import fetch from "node-fetch";
const response = await fetch("http://127.0.0.1:8800/stream")
```

When using `node-fetch`, it's important to note that we are running the service directly with `ts-node`, which means mixing `CJS` with `ESM` may cause exceptions. Hence, we should opt for the `2.x` version. Additionally, we need to define an `AbortController` to promptly terminate the request when the client closes the connection. In `node-fetch`, `res.body` can still read `ReadableStream` for handling the forwarded `SSE` response.

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

On the server side, without the `EventSource` object to receive data, we need to parse the data based on the `SSE` protocol ourselves. Since we are using `ReadableStream` for data retrieval, we need to handle binary data in a streaming manner instead of directly parsing the delimiters. Therefore, we implement a `StreamParser` that merges incoming `Uint8Array` binary data into a new buffer, and processes the data by scheduling the `onLine` method when encountering a `\n`.

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

When handling `onLine`, we need to parse the data line by line according to the `SSE` protocol. The format of the data we will be handling will be `x: xxx;`. Under our processing, `\n` serves as the end node and will not be included in the parameters. In this case, if the length of the data passed is `0`, we will need to trigger the `onMessage` event, passing both the event name and data to the predefined event handling function. After that, we can use `TextDecoder` to parse the data into a string, and then split and parse the data based on `:`.

```js
// packages/fetch-sse/server/utils/steam-parser.ts
export class StreamParser {
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

It is important to note that the `ReadableStream` in `Node` and the `ReadableStream` implemented in browsers have different function signatures. Therefore, here we can easily iterate over the data using `await`, or alternatively receive data and end responses using `on("data")` and `on("end")`. We also need to bind an `onMessage` event to receive the parsed data and then respond the data to the target client.

```js
// packages/fetch-sse/server/utils/steam-parser.ts
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


### Proxy Request
When there is no need for data preprocessing, we can directly proxy the request as an `HTTP` long connection to the target request address without actually receiving the response and then forwarding it to the client. Here, we can utilize the `http` module to achieve the forwarding. Firstly, we need the `node:url` module to parse the target address. Then, we can initiate the request using `http.request`. Once the connection is established, we can directly `pipe` the data to the target's `Response` object, or alternatively, use `proxyRes.on("data") + res.write`.

```js
// packages/fetch-sse/server/modules/proxy.ts
const targetUrl = new URL("http://127.0.0.1:8800/stream");
const options: http.RequestOptions = {
  hostname: targetUrl.hostname,
  port: targetUrl.port,
  path: targetUrl.pathname,
  method: req.method,
  headers: req.headers,
};
const proxyReq = http.request(options, proxyRes => {
  res.writeHead(proxyRes.statusCode || 404, proxyRes.headers);
  proxyRes.pipe(res);
});
```

Naturally, we also need to handle some special cases. Firstly, for `POST` requests, we need to handle the `body` data by forwarding all the request data to the new request. Similarly, we can use `req.on("data") + proxyReq.write` to achieve this. For error handling, we need to pass the response error information to the client. Responding with the correct error code is crucial, and we should also close the target request. When the client's request closes, we must also close the target request and end the response.

```js
req.pipe(proxyReq);

proxyReq.on("error", error => {
  console.log("proxy error", error);
  res.writeHead(502, { "Content-Type": "text/plain" });
  res.end("Bad Gateway");
});

req.socket.on("close", () => {
  console.log("[proxy] connection close");
  res.end();
  proxyReq.destroy();
});
```

In fact, there is a dilemma here. If we use `req.on("close")` to listen for the client's connection closure, it may cause issues in `POST` requests. By executing the following `node` program and then using `curl` to make a request, followed by actively disconnecting the link, we can see that `req.on("close")` triggers prematurely, rather than after we disconnect the request ourselves.

```bash
echo "
const http = require('http');
const server = http.createServer((req, res) => {
  req.on('close', () => {
    console.log('close');
  });
  req.on('data', (chunk) => {
    console.log('data:', new TextDecoder().decode(chunk));
  });
  setTimeout(() => res.end('end'), 10000);
});
server.listen(8001);
" | node;
```

```bash
curl -X POST http://127.0.0.1:8001 \
-H "Content-Type: application/json"  \
-d '{"key1":"value1", "key2":"value2"}'
```

In reality, there are three events present in our request: `req.on("close")`, `res.on("close")`, and `req.socket.on("close")`. The events on `req` are affected by the data containing the `body`. Therefore, in this case, we can use events on `res` and `socket` to monitor the client's connection closure. For ease of event triggering, we directly use events on `socket` to detect the client's connection closure, and before `node16`, the property name for `socket` was `connection`.

```bash
echo "
const http = require('http');
const server = http.createServer((req, res) => {
  res.on('close', () => {
    console.log('res close');
  });
  req.socket.on('close', () => {
    console.log('socket close');
  });
  req.on('data', (chunk) => {
    console.log('data:', new TextDecoder().decode(chunk));
  });
  setTimeout(() => res.end('end'), 10000);
});
server.listen(8001);
" | node;
```


```bash
curl -X POST http://127.0.0.1:8001 \
-H "Content-Type: application/json"  \
-d '{"key1":"value1", "key2":"value2"}'
```

## Client
In the client-side, we need to implement `SSE` based on `fetch`. Through `fetch`, we can pass request headers and bodies and send various types of requests like `POST`, avoiding the limitation of only being able to send `GET` requests and needing to encode all content into the `URL`. If the connection is interrupted, we can also control the retry strategy. Unlike the browser, which silently retries a few times and then stops for `EventSource objects`, this is not ideal for any robust application. If you need to perform some custom validation and handling before parsing the event source, you can also access the response object, which is very effective for designs like API gateways in front of application server programs.

### Implementation with fetch
The implementation based on `fetch` is actually quite simple. First, we need to create an `AbortController` object to promptly terminate requests when the client closes the connection. Then, we can use `fetch` to make requests. When the request is successful, we can read the `ReadableStream` through `res.body`.

```js
// packages/fetch-sse/client/components/fetch.tsx
const signal = new AbortController();
fetch("/proxy", { method: "POST", signal: signal.signal })
  .then(res => {
    onOpen(res);
    const body = res.body;
    if (!body) return null;
  })
```

For stream processing, it follows the same method as the `StreamParser` implemented on the server-side. As previously mentioned, due to the different function signatures of `ReadableStream`, here we use chained `Promise` calls for processing, while maintaining consistency with handling `Uint8Array` data. An interesting point here is that using `EventSource` objects allows monitoring of data transfer in the browser's `Network` panel, whereas data exchange using `fetch` cannot be tracked.

```js
// packages/fetch-sse/client/components/fetch.tsx
const reader = body.getReader();
const parser = new StreamParser();
parser.onMessage = onMessage;
const process = (res: ReadableStreamReadResult<Uint8Array>) => {
  if (res.done) return null;
  parser.onBinary(res.value);
  reader
    .read()
    .then(process)
    .catch(() => null);
};
reader.read().then(process);
```

### Streaming Interaction
After implementing our data transmission solution, we can now achieve streaming interaction in the client-side. Once we parse the line data with the help of the `StreamParser` method, we need to decode it. This operation is the reverse of the encoding approach mentioned above; here, we only need to replace `\\n` with `\n`. Additionally, we configure two output speeds: if there is a significant amount of pending text content to output, we output a character every `10ms`, otherwise, we output text every `50ms`.
``` 

```js
// packages/fetch-sse/client/components/stream.tsx
const onMessage = useMemoFn((e: Message) => {
  if (e.event !== "message") return null;
  setPainting(true);
  const data = e.data;
  const text = data.replace(/\\n/g, "\n");
  const start = currentIndex.current;
  const len = text.length;
  const delay = len - start > 50 ? 10 : 50;
  const process = () => {
    currentIndex.current++;
    const end = currentIndex.current;
    append(text.slice(0, end));
    if (end < len) {
      timer.current = setTimeout(process, delay);
    }
    if (!transmittingRef.current && end >= len) {
      setPainting(false);
    }
  };
  setTimeout(process, delay);
});
```

Once we have parsed the data, we need to apply it to the `DOM` structure. It is important to note that refreshing the entire `DOM` content will prevent us from selecting the previously output content for copying. In other words, we cannot select content while it is being output. Therefore, we need to update the content incrementally here. The simplest solution is to update line by line. We can keep track of the last rendered line index and update content within that range to the current index.

```js
// packages/fetch-sse/client/components/stream.tsx
const append = (text: string) => {
  const el = ref.current;
  if (!el) return null;
  const mdIt = MarkdownIt();
  const textHTML = mdIt.render(text);
  const dom = new DOMParser().parseFromString(textHTML, "text/html");
  const current = currentDOMIndex.current;
  const children = Array.from(el.children);
  for (let i = current; i < children.length; i++) {
    children[i] && children[i].remove();
  }
  const next = dom.body.children;
  for (let i = current; i < next.length; i++) {
    next[i] && el.appendChild(next[i].cloneNode(true));
  }
  currentDOMIndex.current = next.length - 1;
};
```

There is also a scrolling interaction matter to address. When users scroll the content freely, we should not forcibly scroll back to the bottom. Therefore, we need to keep track of whether the user has scrolled. If the difference between `el.scrollHeight - el.scrollTop` and `el.clientHeight` is less than `1`, we consider that automatic scrolling should occur. Additionally, it is important to note that `scrollTo` should not use a `smooth` scrolling effect as it could affect the accuracy of our `onScroll` calculation.

```js
const append = (text: string) => {
  isAutoScroll.current && el.scrollTo({ top: el.scrollHeight });
};

useEffect(() => {
  const el = ref.current;
  if (!el) return;
  el.onscroll = () => {
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= 1) {
      isAutoScroll.current = true;
    } else {
      isAutoScroll.current = false;
    }
  };
  return () => {
    el.onscroll = null;
  };
}, []);
```

In the context of streaming output here, we can also implement a cursor blinking effect. This effect is relatively simple to achieve by using CSS animations and pseudo-classes. It is worth noting that not using pseudo-classes for implementation could lead to additional complexities in handling the previous `DOM` nodes that needed treatment. Furthermore, since processing Markdown will involve nested nodes, specific handling with `:not` will be necessary.

```scss
// packages/fetch-sse/client/styles/stream.m.scss
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}

.textarea {
  &.painting > *:last-child:not(ol):not(ul),
  &.painting > ol:last-child > li:last-child,
  &.painting > ul:last-child > li:last-child {
    &::after {
      animation: blink 1s infinite;
      background-color: #000;
      content: '';
      display: inline-block;
      height: 1em;
      margin-top: -2px;
      vertical-align: middle;
      width: 1px;
    }
  }
}
```

## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://github.com/Azure/fetch-event-source
https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource
https://www.ruanyifeng.com/blog/2017/05/server-sent_events.html
https://nodejs.org/docs/latest-v20.x/api/http.html#messagesocket
https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
https://stackoverflow.com/questions/7348736/how-to-check-if-connection-was-aborted-in-node-js-server
https://stackoverflow.com/questions/76115409/why-does-node-js-express-call-request-close-on-post-request-with-data-before-r
```