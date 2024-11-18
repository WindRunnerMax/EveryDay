# File Transfer Solution Based on ServiceWorker

`Service Worker` is a type of script that runs in the background of a user's browser, capable of intercepting and handling network requests, thus enabling rich offline experiences, cache management, and optimized network efficiency. Request interception is one of its key features. By listening to the `fetch` event, `Service Worker` can capture all requests sent to the network and selectively process these requests, such as reading responses from the cache, or modifying and redirecting requests, thereby achieving reliable offline browsing and faster content loading.

## Description
A while back, someone in the group raised a question about why there seemed to be an intermediate step when downloading files from an object storage, where a `GitHub Pages` address was involved. In theory, when downloading content directly from an object storage, we should simply click the link. However, it appeared that there was an intermediary step where it seemed like the download needed to be intercepted and redirected by `GitHub Pages` before reaching the local download. The link addresses looked something like the examples below. When clicking the download link on the download page and checking the browser's download management feature, we would notice that the download address was actually a more obscure one, which would lead to a `404` response if directly opened in the browser.

```html
<!-- Download Page -->
https://jimmywarting.github.io/StreamSaver.js/examples/saving-a-blob.html

<!-- Browser Download Management -->
https://jimmywarting.github.io/StreamSaver.js/jimmywarting.github.io/712864/sample.txt
```

From the link, it was evident that `StreamSaver.js` was being used as an intermediary for downloading files. Referring to the README, `StreamSaver.js` is a large file download solution based on `Service Worker`. So, I took some time to research and implement it. Typically, when scheduling file downloads, we might directly open the target link in the browser using an `<a />` tag to start the download. However, this approach presents three significant issues:

* If the resource directly opened is an image, video, or any resource the browser can interpret, the browser won't trigger a download action but would rather preview the resource within the browser. This is because the default `Content-Disposition` value is `inline`, not `attachment`. Although using the `<a />` tag's `download` attribute can solve this problem, this attribute only works under same-origin `URLs`, `blob:`, and `data:` protocols.
* In case of duplicate resources in the object storage, to prevent file overwriting, we might randomly generate resource names, add timestamps to resource names, or even generate file names as `HASH` values without extensions. When downloading files, we would need to restore the filenames properly, which still relies on the response's `attachment; filename=` or the `<a />` tag's `download` attribute for renaming files.
* If the requested resource requires permission validation for downloading, using the `<a />` tag to initiate a resource request only sends a `GET` request. Placing keys in the URL won't achieve genuine permission validation. While issuing temporary tokens and returning a `GET` request link might work, for more complex permission control and audit trails, generating temporary download links alone may not meet high-security requirements. Similar issues are more noticeable in the Server-Sent Events (`SSE`) implemented through `EventSource` objects.

In our project, we happened to face these legacy issues. Our resource files are stored in an `OSS-Object Storage Service` object storage. To prevent naming conflicts, the default strategy is to not include file extensions in the resource names. Instead, file names are generated as `HASH` values. Also, due to the default `CDN` acceleration domain provided by the infrastructure, we cannot define it as our site's domain via `CNAME`. This inevitably leads to cross-origin issues for our resources.

In this scenario, we needed to rename files back to their original names. After all, in the absence of file extensions, the operating system cannot recognize file content. Our `CDN` resources lack the `Content-Disposition` response header and original resource names. Furthermore, the files are not under the same domain name. To enable user downloads in such cross-origin situations, we opted to first use `fetch` to download the file into memory and then create a `blob:` protocol resource using `createObjectURL`, thereby supporting the `<a />` tag's `download` attribute.

However, this method of downloading files presents another challenge. Storing entire files in memory could lead to memory exhaustion (`OOM`). Modern browsers do not have a defined memory limit per individual `Tab` page, as it dynamically allocates based on system resources. Nonetheless, downloading sufficiently large files into memory could still trigger `OOM`, causing browser crashes. In such cases, using `Service Worker` to intercept download requests and adding `Content-Disposition` to the responses for file renaming, along with utilizing the `Stream API` for streaming downloads, avoids the need to download all files into memory.

To conclude, this approach helped us address two issues effectively.

*Downloading cross-domain resources by hijacking requests and adding corresponding headers solves the problem of cross-domain resource renaming, and thereby directly schedules browser `IO` to achieve downloads.*

*To avoid memory overflow issues, using the `Stream API` to write `fetch` request data into files in chunks allows for streaming downloads, preventing the need to write the entire file into memory.*

*In addition to downloading files from object storage, this data processing method has many other applications. For instance, when needing to bulk download and compress files, one can proactively `fetch` data, read it using `ReadableStream`, `pipe` it to compression implementations like the browser solution `zlib.createDeflateRaw`, and then `pipe` it to a `WritableStream` like `FileSystemFileHandle.createWritable` for real-time file writing. This facilitates efficient file reading and writing without the need to hold it all in memory.*

*Coincidentally, we previously implemented LAN file transfer based on `WebRTC`, which also faces challenges when transferring large files via `WebRTC`, as it is not based on the `HTTP` protocol and thus cannot naturally carry response headers like `Content-Disposition`. Therefore, to facilitate large file transfers, intermediaries are needed to intercept the data. In such cases, generating virtual download links by simulating `HTTP` requests and leveraging the `Stream API` for streaming downloads due to fragmented transmission becomes straightforward. This article builds on the foundation of file transfer via `WebRTC` to propose a large file transfer solution based on `Service Worker`, and related implementations can be found at `https://github.com/WindrunnerMax/FileTransfer`.*

## Stream API
The browser's implementation of the `Stream API` consists of three types of streams: `ReadableStream`, `WritableStream`, and `TransformStream`. Among them, `ReadableStream` represents a readable stream, `WritableStream` represents a writable stream, and `TransformStream` represents a read/write stream. While the compatibility of `ReadableStream` aligns closely with the `Fetch API`, the compatibility of `WritableStream` and `TransformStream` is slightly less robust.

### Flow of Data
Initially, grasping the data flow within the pipeline of the `Stream API` posed a challenge for me. Concepts such as buffers and backpressure were relatively straightforward to comprehend, but when it came to actual application of `Streams`, understanding the direction of data flow within the entire model became complex. In my understanding, the pipeline should start with `WritableStream` for writing/producing data, and subsequent pipes should use `ReadableStream` for reading/consuming data, with the entire connection process achieved through `pipeTo`.

```js
const writable = new WritableStream();
const readable = new ReadableStream();
writable.pipeTo(readable); // TypeError: writable.pipeTo is not a function
const writer = writable.getWriter();
const reader = readable.getReader();
// ...
writer.write("xxx");
reader.read().then(({ value, done }) => {
  console.log(value, done);
});
```

Of course, this is an erroneous example. Understanding streams should reference `Node.js`'s `Stream` module, with `node:fs`'s `createReadStream` and `createWriteStream` providing a clearer model. In this model, `ReadableStream` serves as the starting point, where data production relies on `Node.js`'s underlying file reading `IO` operations, writing the content into the `ReadableStream`. As data processors, our role is to handle data within its own events, then write the processed data into a `WritableStream` for consumption, making `WritableStream` the endpoint of the subsequent pipeline.

```js
const fs = require("node:fs");
const path = require("node:path");

const sourceFilePath = path.resolve("./source.txt");
const destFilePath = path.join("./destination.txt");
const readStream = fs.createReadStream(sourceFilePath, { encoding: "UTF-8" });
const writeStream = fs.createWriteStream(destFilePath, { encoding: "UTF-8" });

readStream.on("data", chunk => {
  writeStream.write(chunk);
});
readStream.on("end", () => {
  writeStream.end();
});
```

So, in the browser, our `Stream API` also starts with `ReadableStream`, and `Fetch API`'s `Response.body` is a good example where data starts with basic network requests based on `IO`. In the browser, the `API` of our `ReadableStream` is somewhat different from `Node.js`, for example, in the browser's `ReadableStream`, the `Reader` does not exist like event listeners such as `on("data", () => null)`, the previous examples were just to help us better understand the whole stream model, and here, of course, we focus on the browser's `API`.

After discussing so much about the issues related to the `Stream API`, let's return to the implementation of data transmission for `WebRTC`. For data transmission similar to `Fetch`, we rely on the browser's own `IO` to control the data production of `ReadableStream, while our `WebRTC` is merely a transmission channel. Therefore, at the initial data production in the pipeline, we need to control the `ReadableStream` ourselves. Hence, the `Writable -> Readable` approach we initially thought of is to adapt to this implementation. In fact, this approach is more suited to the model of `TransformStream`, which has the ability to transform data streams. We can also use `TransformStream` to implement stream writing and reading.

```js
const transformStream = new TransformStream<number, number>({
  transform(chunk, controller) {
    controller.enqueue(chunk + 1);
  },
});
const writer = transformStream.writable.getWriter();
const reader = transformStream.readable.getReader();
const process = (res: { value?: number; done: boolean }) => {
  const { value, done } = res;
  console.log(value, done);
  if (done) return;
  reader.read().then(process);
};
reader.read().then(process);
writer.write(1);
writer.write(2);
writer.close();
```

So here, we can implement data processing for `ReadableStream`. In the implementation of data transmission based on `WebRTC`, we can obtain the data stream of the `DataChannel` itself. At this point, we can use the `Controller` of `ReadableStream` to insert data into the buffer queue, thus achieving data writing, while the subsequent data consumption can be implemented using the `Reader` of `ReadableStream. This way, we can use the buffer queue for streaming data transmission.

```js
const readable = new ReadableStream<number>({
  start(controller) {
    controller.enqueue(1);
    controller.enqueue(2);
    controller.close();
  },
});
const reader = readable.getReader();
const process = (res: { value?: number; done: boolean }) => {
  const { value, done } = res;
  console.log(value, done);
  if (done) return;
  reader.read().then(process);
};
reader.read().then(process);
```

### Back Pressure Issue
Here we can consider a problem, if the data transmission speed of our `DataChannel` is very fast, i.e., continuously `enqueuing` data into the queue, and suppose our consumption speed is very slow, like if our hard disk write speed is slow, then the data queue will keep growing, which may lead to a memory overflow. In fact, this issue has a professional term to describe it, known as `Back Pressure`. In `ReadableStream`, we can use `controller.desiredSize` to get the current queue size, thereby controlling the data production speed to avoid data backlog.

```js
const readable = new ReadableStream<number>({
  start(controller) {
    console.log(controller.desiredSize); // 1
    controller.enqueue(1);
    console.log(controller.desiredSize); // 0
    controller.enqueue(2);
    console.log(controller.desiredSize); // -1
    controller.close();
  }
});
```

When it comes to backpressure issues, we can easily understand that when the speed of data production exceeds the speed of data consumption, it leads to data backlog. Concerning `ReadableStream` and `WritableStream`, we can respectively come up with relevant queuing strategies. In actuality, we can also easily comprehend that the so-called pressure from backpressure originates from the blocks in the buffer queue that have not been consumed. Of course, we can preset a relatively large buffer queue length, which avoids `desiredSize` being a negative value, but it does not solve the backpressure issue.

- For `ReadableStream`, backpressure stems from blocks that have been enqueued but not yet read.
- For `WritableStream`, backpressure arises from blocks that have been written but not yet processed by the underlying receiver.

In the previous implementation of `ReadableStream`, we could clearly see that it did not have a default mechanism for handling backpressure. Even though we could assess the pressure of the current built-in queue through `desiredSize`, we are unable to accurately provide feedback on the data production speed. We prefer controlling it based on event triggers rather than resorting to periodic checks like using `setTimeout`. Of course, we can passively control the amount of data in the queue through the `pull` method. In contrast, `WritableStream` contains an inherent backpressure handling method, `writer.ready`. Through this method, we can determine the current queue pressure and regulate the data production speed accordingly.

Therefore, in our `WebRTC` data transmission, to conveniently address backpressure issues, we employ the `writable` end of `TransformStream` for data writing while consumption is achieved through the `readable` end. This allows us to effectively control the data production speed. Furthermore, after defining `TransformStream` in the main thread, we can transfer the `readable` end as a `Transferable Object` to the `Service Worker` for consumption using `postMessage`.

In the `Fetch API` `Response` object, there is a `Response.body` property for retrieving the response's `ReadableStream`. Similar to the aforementioned objects, it is used to represent a readable stream. Through this interface, we can implement streaming data reading progressively, without needing to load all data into memory at once. This facilitates handling data incrementally. For instance, when implementing a response for `SSE - Server-Sent Events` using `fetch`, maintaining a long connection combined with `ReadableStream` can effectively handle data responses.

In regards to the `Fetch` method, before getting into the `Stream API`, the primary way we used to handle it was by calling methods like `res.json()` to read data. In reality, these methods also implicitly call `ReadableStream.getReader()` to read data within their implementation. Prior to the emergence of the `Stream API`, if we wanted to handle certain resources such as videos, text files, etc., we had to download the entire file, wait for it to be deserialized into a suitable format, and then directly process all the data.

Thus, during my previous research on `StreamSaver.js`, one puzzling issue was that since the data we requested still needed to be fully downloaded into memory, in such a scenario, using `StreamSaver.js` would still be unable to seamlessly write data to the hard drive, leading to potential memory overflow issues within the browser `Tab` page. However, upon discovering the `Response.body` property of the `Fetch API`, the approach to handling the entire stream became clearer. We can continually call the `read()` method to pass data to a `Service Worker` scheduled for download.

The method of scheduling file downloads is somewhat similar to the aforementioned `WebRTC` transmission method. After setting up an intermediary `Service Worker` that intercepts data requests, we simply need to initiate a `fetch` request in the main thread, then when responding to data, trigger a download request through an `Iframe`, read data in chunks using `Response.body.getReader()`, and continually write it to the `Writer` of a `TransformStream`. Additionally, we can implement features like download progress indicators.

```js
const fileId = "xxxxxx";
const worker = await navigator.serviceWorker.getRegistration("./");
const channel = new MessageChannel();
worker.active.postMessage({ type: "INIT_CHANNEL" }, [channel.port2]);
const ts = new TransformStream();
channel.port1.postMessage(
  { key: "TRANSFER_START", id: fileId, readable: ts.readable, },
  [ts.readable]
);
 const src = `/${fileId}` + `?X-File-Id=${fileId}` +
      `&X-File-Size=42373` + `&X-File-Total=1` + `&X-File-Name=favicon.ico`;
const iframe = document.createElement("iframe");
iframe.hidden = true;
iframe.src = src;
iframe.id = fileId;
document.body.appendChild(iframe);
const writer = ts.writable.getWriter();
fetch("./favicon.ico").then(res => {
  const reader = res.body.getReader();
  const process = (res) => {
    const { value, done } = res;
    if (done) {
      writer.close();
      return;
    }
    writer.write(value);
    reader.read().then(process);
  };
  reader.read().then(process);
});
```

## Service Worker
`Service Worker` serves as a background, standalone thread with the ability to act as a network request intermediary. It can intercept, modify, or completely replace network requests and responses, enabling advanced functionalities such as cache management, performance optimization, offline access, fine-grained control, and optimizations for requests. Here, we can leverage `Service Worker` to add `Content-Disposition` and other response headers to our request responses, triggering the browser's download capabilities and utilizing browser `IO` for downloading large files.

### Environment Setup
Before implementing network request interception using `Service Worker`, let's discuss setting up the `TS` environment and configuring `Webpack` within a `Service Worker`. In our usual `TS` development environment, the `lib` mainly consists of `dom`, `dom.iterable`, `esnext`. However, since the global variables and methods held by a `Worker` are different, the `lib` environment needs to be changed to `WebWorker`, `ESNext`. Additionally, if modules are not actively imported or exported, `TS` interprets them as a type definition file (`d.ts`). Therefore, even if not importing or exporting by default, it's necessary to export an empty object by default. When importing modules, ensure they are included in the `tsconfig` `include` section.

```js
// packages/webrtc/client/worker/index.ts
/// <reference lib="esnext" />
/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;
export {};
```

The `Service Worker` itself as a standalone `Js` file must run under the same-origin policy. If you need to pay attention to the deployment environment's routing environment, you need to configure it as a standalone routing loading path. For our static resources, we need to configure the standalone `Worker` we implemented as the entry file in the packaging tool. To easily handle whether the `SW` is registered and cache updates, we usually fix it to a specific file name to ensure its uniqueness in the cache.

```js
// packages/webrtc/rspack.client.js
/**
 * @type {import("@rspack/cli").Configuration}
 */
const Worker = {
  context: __dirname,
  entry: {
    worker: "./client/worker/index.ts",
  },
  devtool: isDev ? "source-map" : false,
  output: {
    clean: true,
    filename: "[name].js",
    path: path.resolve(__dirname, "build/static"),
  },
};

module.exports = [/** ... */, Worker];
```

In the `Service Worker`, we can handle its installation and activation logic in the `install` and `activate` events respectively. Typically, a new `Service Worker` will enter a waiting phase after installation until the old `Service Worker` is completely uninstalled before activation. Therefore, we can directly `skipWaiting` in `onInstall`, and in the `onActive` event, we can use `clients.claim` to immediately take over all client pages after activation without waiting for page refresh, which is very useful for debugging `SW`.

```js
// packages/webrtc/client/worker/index.ts
self.addEventListener("install", () => {
  self.skipWaiting();
  console.log("Service Worker Installed");
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
  console.log("Service Worker Activate");
});
```

### Request Interception
Next, let's delve into the capability of `Service Worker` to intercept network requests. There is detailed description about `Fetch Event` on `MDN`, and `Fetch Event` can only be used in `Service Worker`. Here, our request interception and response are very simple. We just need to extract relevant information from the request URL, such as `id`, `name`, `size`, `total`, and then construct a `Response` using `ReadableStream` as the response. The key configurations for triggering downloads to pay attention to are the `Content-Disposition` and `Content-Length` response headers.

```js
// packages/webrtc/client/worker/index.ts
self.onfetch = event => {
  const url = new URL(event.request.url);
  const search = url.searchParams;
  const fileId = search.get(HEADER_KEY.FILE_ID);
  const fileName = search.get(HEADER_KEY.FILE_NAME);
  const fileSize = search.get(HEADER_KEY.FILE_SIZE);
  const fileTotal = search.get(HEADER_KEY.FILE_TOTAL);
  if (!fileId || !fileName || !fileSize || !fileTotal) {
    return;
  }
  const transfer = map.get(fileId);
  if (!transfer) {
    return event.respondWith(new Response(null, { status: 404 }));
  }
  const [readable] = transfer;
  const newFileName = encodeURIComponent(fileName).replace(/['()]/g, escape).replace(/\*/g, "%2A");
  const responseHeader = new Headers({
    [HEADER_KEY.FILE_ID]: fileId,
    [HEADER_KEY.FILE_SIZE]: fileSize,
    [HEADER_KEY.FILE_NAME]: newFileName,
    "Content-Type": "application/octet-stream; charset=utf-8",
    "Content-Security-Policy": "default-src 'none'",
    "X-Content-Security-Policy": "default-src 'none'",
    "X-WebKit-CSP": "default-src 'none'",
    "X-XSS-Protection": "1; mode=block",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Content-Disposition": "attachment; filename*=UTF-8''" + newFileName,
    "Content-Length": fileSize,
  });
  const response = new Response(readable, {
    headers: responseHeader,
  });
  return event.respondWith(response);
}
```

Here's an interesting thing here, in the above implementation, we can see the inspection of relevant information taken from the request address. If the check does not pass, `undefined` is returned. This is actually a common interception case, where we simply allow requests that do not meet the conditions to pass, and the puzzling issue I had before was that any request intercepted by the `Service Worker` would appear in our `Network` tab with a gear symbol, indicating it was a request initiated from the `Service Worker`. This can make debugging quite confusing.

In actuality, this was just a problem with our usage. From the message, it is clear that this was a request initiated from the `Service Worker`. Instead, we can simply let this request go through the original network path without being proxied by the `Service Worker`. The reason this request entry is triggered is that we called the `fetch` method, and whether we directly return `fetch` or use `event.respondWith(fetch)` will trigger this request entry. Therefore, when intercepting requests, if they do not meet the conditions, we can simply return `undefined`.

```js
// Will trigger the request again
return fetch(event.request);
return event.respondWith(fetch(event.request));

// Will not trigger the request again
return ;
```

Next, we need to consider how to trigger the download. The `Service Worker` here only intercepts the request and does not actually make any HTTP requests in `WebRTC` transmission. So, we need to actively trigger this request. Thanks to the fact that the `Service Worker` can intercept almost all requests, including static resources, network requests, etc., we can directly use the created `Iframe` with agreed-upon field names to implement the download, which is actually the strange link address we mentioned at the beginning.
```

```js
// packages/webrtc/client/worker/event.ts
const src =
  `/${fileId}` +
  `?${HEADER_KEY.FILE_ID}=${fileId}` +
  `&${HEADER_KEY.FILE_SIZE}=${fileSize}` +
  `&${HEADER_KEY.FILE_TOTAL}=${fileTotal}` +
  `&${HEADER_KEY.FILE_NAME}=${fileName}`;
const iframe = document.createElement("iframe");
iframe.hidden = true;
iframe.src = src;
iframe.id = fileId;
document.body.appendChild(iframe);
```

Here we might be curious about one thing, why do we extract our request information from the `URL` instead of constructing related `Header` information directly when the original request is made, and simply forward the agreed response headers in the `Service Worker`, in other words, why use `Iframe` instead of using the `fetch` request along with headers to achieve the download. In fact, this is because even if there is a `"Content-Disposition": "attachment; xxx"` response header, the `fetch` request does not directly support the ability to start downloads.

In fact, I also studied the implementation of `StreamSaver.js` here, which is also a very interesting thing. The operating environment of `StreamSaver.js` itself is an `Iframe`, namely `mitm.html`, so let's call it `B.html`, and at this point our main thread is referred to as `A.html`. At this time, we register a `Service Worker` named `B.js` in `B`, and then we open `A`'s address as a service resource using `python3 -m http.server 9000` and open `B`'s address on port `9001` to ensure that there is a cross-origin situation.

```html
<!-- A.html -->
<iframe src="http://localhost:9001/B.html" hidden></iframe>

<!-- B.html -->
<script>
    navigator.serviceWorker.register("./B.js", { scope: "./" });
</script>
```

```js
// B.js
self.onfetch = (e) => {
  console.log(e.request.url);
  if (e.request.url.includes("ping")) {
    e.respondWith(new Response("pong"));
  }
};
```

At this point, in `A.html`, we create a new `iframe` pointing to `localhost:9001/ping`, similar to creating a temporary download link in `StreamSaver.js`, and we can see that this address can actually be intercepted. The `Service Worker` can intercept this request, which I found amazing at the time because theoretically it should not be interceptable in different domain situations. I initially thought I had discovered some special feature of iframes, but then realized that we were accessing resources from the `9001` source address, essentially still within the resources of `B.html`, and this effect wouldn't happen if we were accessing resources from `9000`.

```js
const iframe = document.createElement("iframe");
iframe.hidden = true;
iframe.src = "http://localhost:9001/ping";
document.body.appendChild(iframe);
```

Additionally, if we directly open `http://localhost:9001/ping` in the browser's address bar, we also get a `pong` response. This means that the interception scope of the `Service Worker` is within the registered `scope`, so if necessary, we can completely rely on `SW` to implement offline `PWA` applications without depending on server response routes or APIs. Furthermore, this effect also exists in the `SW` implementation of our `WebRTC`, where when clicking the download link again doesn't get a response because we detect that `transfer` doesn't exist, so we directly respond with `404`.

```js
const transfer = map.get(fileId);
if (!transfer) {
  return event.respondWith(new Response(null, { status: 404 }));
}
```

### Data Communication

To get back on track, next we need to implement a communication solution with the `Service Worker`, and the implementation here is quite conventional. First, we need to register the `Service Worker`. Only one `Service Worker` can be registered within the same `Scope`. If multiple `Service Workers` are registered within the same scope, the subsequently registered `Service Worker` will override the previously registered one. This issue doesn't exist in `WebWorker`. Here, we utilize `getRegistration` and `register` to respectively obtain the currently active `Service Worker` and register a new `Service Worker`.

```js
// packages/webrtc/client/worker/event.ts
if (!navigator.serviceWorker) {
  console.warn("Service Worker Not Supported");
  return Promise.resolve(null);
}
try {
  const serviceWorker = await navigator.serviceWorker.getRegistration("./");
  if (serviceWorker) {
    WorkerEvent.worker = serviceWorker;
    return Promise.resolve(serviceWorker);
  }
  const worker = await navigator.serviceWorker.register(
    process.env.PUBLIC_PATH + "worker.js?" + process.env.RANDOM_ID,
    { scope: "./" }
  );
  WorkerEvent.worker = worker;
  return worker;
} catch (error) {
  console.warn("Service Worker Register Error", error);
  return Promise.resolve(null);
}
```

When it comes to data communication with the `Service Worker`, we can utilize `MessageChannel`. `MessageChannel` is a bidirectional communication channel that allows message passing between two different `Contexts`, for example between the main thread and a `Worker` thread. We just need to create a `MessageChannel` in the main thread, then pass its `port2` through `postMessage` to the `Service Worker`. The `Service Worker` can access this `port2` through `event.ports[0]`, and subsequently, we can communicate directly using these two `ports`.

We might ponder on a question, how are we able to pass `port2` to the `Service Worker`, theoretically, our `postMessage` can only transmit serializable `Structured Clone` objects, such as strings, numbers, and so on. However, `port2` itself exists as a non-serializable object. This involves the concept of `Transferable objects`, which are objects with their own resources that can be transferred from one context to another, ensuring that resources are only available in one context at a time. After the transfer, the original object is no longer available, it no longer points to the transferred resources, and any attempt to read or write to that object will throw an exception.

```js
// packages/webrtc/client/worker/event.ts
if (!WorkerEvent.channel) {
  WorkerEvent.channel = new MessageChannel();
  WorkerEvent.channel.port1.onmessage = event => {
    console.log("WorkerEvent", event.data);
  };
  WorkerEvent.worker?.active?.postMessage({ type: MESSAGE_TYPE.INIT_CHANNEL }, [
    WorkerEvent.channel.port2,
  ]);
}
```

Since we currently do not need to receive messages from the `Service Worker`, the message received by `port1` is simply printed out here. During the initialization of the `CHANNEL`, we placed `port2` as a transferable object in the second parameter, so that it can be received in the `Service Worker`. As all future message transmission is done via `MessageChannel`, the purpose of `onmessage` here is purely to receive the `port2` object port.

```js
// packages/webrtc/client/worker/index.ts
self.onmessage = event => {
  const port = event.ports[0];
  if (!port) return void 0;
};
```

Then, we need to start using `TransformStream` for data reading and writing. Since `TransformStream` itself is a transferrable object, we can define it directly in the main thread. When initializing file downloads, we pass the `readable` side to the `Service Worker` and use it to construct a `ReadableStream` instance for creating the `Response` object. Subsequently, after triggering the download behavior by creating an `iframe` in the main thread, we can then read `readable` from the `map` in the `Fetch Event`.

```js
// packages/webrtc/client/worker/event.ts
const ts = new TransformStream();
WorkerEvent.channel.port1.postMessage(
  {
    key: MESSAGE_TYPE.TRANSFER_START,
    id: fileId,
    readable: ts.readable,
  } as MessageType,
  [ts.readable]
);
WorkerEvent.writer.set(fileId, ts.writable.getWriter());
// Construct iframe to trigger download behavior
// ...

// packages/webrtc/client/worker/index.ts
port.onmessage = event => {
  const payload = event.data as MessageType;
  if (!payload) return void 0;
  if (payload.key === MESSAGE_TYPE.TRANSFER_START) {
    const { id, readable } = payload;
    map.set(id, [readable]);
  }
};
// Read `readable` from map after triggering download behavior
// ...
```

In the main thread, our focus is on data writing and built-in backpressure control. Due to the internal implementation of queues and backpressure control in `TransformStream`, we don't have to worry too much about issues caused by data production. The feedback loop for `WebRTC` downloads that we implemented earlier is robust, so here we just need to control the writing speed using `await`. Interestingly, even though the `readable` and `writable` sides of `TransformStream` are now running in two different contexts, they can still perform data reading, writing, and backpressure control.

```js
// packages/webrtc/client/worker/event.ts
const writer = WorkerEvent.writer.get(fileId);
if (!writer) return void 0;
// Need to actively await ready to sense BackPressure
await writer.ready;
return writer.write(new Uint8Array(data));
```

Once the transfer of the last data block, i.e., `total`, is completed, we need to clean up the entire transfer process. Firstly, we need to close the `writable` side of the `TransformStream`. This `Writer` must actively call the close method; otherwise, the browser won't know the download is complete and will remain in a waiting state. Secondly, we should remove the created `iframe` from the `body`, and in the `Service Worker`, we need to clean up the data in the `map` to avoid issues like previous links still being able to respond.

```js
// packages/webrtc/client/worker/event.ts
const iframe = document.getElementById(fileId);
iframe && iframe.remove();
WorkerEvent.channel?.port1.postMessage({
  key: MESSAGE_TYPE.TRANSFER_CLOSE,
  id: fileId,
} as MessageType);
const writer = WorkerEvent.writer.get(fileId);
writer?.close();
WorkerEvent.writer.delete(fileId);

// packages/webrtc/client/worker/index.ts
port.onmessage = event => {
  const payload = event.data as MessageType;
  if (!payload) return void 0;
  if (payload.key === MESSAGE_TYPE.TRANSFER_CLOSE) {
    const { id } = payload;
    map.delete(id);
  }
};
```

### Compatibility Consideration

In modern browsers, `Service Worker`, `Fetch API`, and `Stream API` have received good support. Here we are also using a relatively new feature, `TransformStream`, which has decent compatibility. Most browser versions released after `2022` provide support for it. However, if we carefully observe the compatibility of `TransformStream` on `MDN`, we can see that `TransformStream` as a `transferable` object is still not supported in `Safari`.

So, what problem does this create? We can notice that during the `TRANSFER_START` phase, we pass the `readable` end of the `TransformStream` as a `Transferable Object` to the `Service Worker`. Since `Safari` does not support this behavior, our `ReadableStream` cannot be transferred to the `Service Worker`. As a result, our subsequent download behavior cannot proceed. Therefore, if compatibility with `Safari` is needed, we must address this issue.

The reason behind this issue is the inability to transfer ownership of the `ReadableStream` to the `Service Worker. Therefore, a simple solution would be to define the `ReadableStream` directly in the `Service Worker`. In other words, when the transfer begins, we instantiate the `ReadableStream` and save its controller object. When data is being transferred, we directly `enqueue` the data chunks into the buffer queue. Once the transfer is complete, we simply call `controller.close()`, and this `readable` object can then be used as the `Response` response for downloading content.

```js
let controller: ReadableStreamDefaultController | null = null;
const readable = new ReadableStream({
  start(ctr) {
    controller = ctr;
  },
  cancel(reason) {
    console.log("ReadableStream Aborted", reason);
  },
});
map.set(fileId, [readable, controller!, Number(fileTotal)]);

self.onmessage = event => {
  const data = event.data as BufferType;
  destructureChunk(data).then(({ id, series, data }) => {
    const stream = map.get(id);
    if (!stream) return void 0;
    const [, controller, size] = stream;
    controller.enqueue(new Uint8Array(data));
    if (series === size - 1) {
      controller.close();
      map.delete(id);
    }
  });
};
```

Here, we realize the backpressure issue we previously discussed. Due to the lack of any backpressure feedback mechanism here, the main thread's data chunks are all received and `enqueued` into the `ReadableStream`. In cases where the data transfer speed exceeds the browser-controlled download IO speed, data backlog can easily occur. Therefore, we need to implement backpressure control. We can think of the following ways to achieve this.

- When creating the `ReadableStream` object, we can utilize `CountQueuingStrategy` to create a sufficiently large buffer. Since we already know the total file size and the number of chunks during the transfer process, creating a large buffer is feasible. We might not necessarily need to create a buffer equal in size to the number of chunks. We can divide it by `2` or take a logarithm, as downloading also involves continuous consumption on the hard disk.
- Besides the `start` method in the `underlyingSource` object passed while creating the `ReadableStream`, there is actually a `pull` method. This method is repeatedly called when the internal data block queue of the stream is not full, until it reaches its high watermark. We can use the calls to this method as an event-driven mechanism to control the frequency of the stream. It is important to note that the `pull` function will only be repeatedly called if at least one data block is enqueued. If no block is actually enqueued during a `pull` function call, it will not be called again.

When considering the allocation of a large enough buffer queue, if we think deeper, even if we allocate a sufficiently large buffer, we have not implemented any feedback mechanism to control the data production process. So, the size of the buffer, even if large, does not solve the issue of memory overflow. Even if a large buffer is allocated during instantiation, it will not immediately allocate that much memory. Therefore, even if we do not assign such a large buffer, the default queue implementation would be the same; it will just have a large negative `desiredSize`, and the data would not be lost. This is because the browser's stream implementation will store the data in memory until the consumer reads it.

So let's take a look at the second implementation again. By using the `pull` method, we can indeed obtain feedback from the buffer queue of the `ReadableStream`. Therefore, we can easily implement a control flow method. Considering that we will have two scenarios - production exceeding consumption and consumption exceeding production - it's not sufficient to fetch data only during `pull`. We should internally implement another buffer queue. Our event-driven data placement should consist of two parts: firstly, when placing data into the buffer queue, we need to check if the last pull operation was unsuccessful and is awaiting completion. In this case, we need to schedule the unresolved `Promise` from the previous `pull`, which represents the scenario of consumption exceeding production. Secondly, during a `pull`, we should directly check if the buffer queue has data. If it does, we can directly place the data, which represents the scenario of production exceeding consumption.

```js
const pending = new WeakMap<ReadableStream, (stream: string) => void>();
const queue = ["1", "2", "3", "4"];
const strategy = new CountQueuingStrategy({ highWaterMark: 3 });

const underlyingSource: UnderlyingDefaultSource<string> = {
  pull(controller) {
    if (!queue.length) {
      console.log("Pull Pending");
      return new Promise<void>(resolve => {
        const handler = (stream: string) => {
          controller.enqueue(stream);
          pending.delete(readable);
          console.log("Pull Restore", stream);
          resolve();
        };
        pending.set(readable, handler);
      });
    }
    const next = queue.shift();
    controller.enqueue(next);
    console.log("Pull", next);
    return void 0;
  },
};

const readable = new ReadableStream<string>(underlyingSource, strategy);
const write = (stream: string) => {
  if (pending.has(readable)) {
    console.log("Write Pending Pull", stream);
    pending.get(readable)!(stream);
  } else {
    console.log("Write Queue", stream);
    queue.push(stream);
  }
};

// Delay reading tasks to allow pull to fill the Readable buffer queue first
setTimeout(async () => {
  // Data still exists in the queue at this point (production exceeding consumption)
  const reader = readable.getReader();
  console.log("Read Twice");
  // After reading, all data in the queue has been consumed (consumption equals production)
  console.log("Read", await reader.read());
  // Queue is empty after reading, Readable buffer queue is not full
  // Subsequently, another pull event is triggered by Readable (consumption exceeding production)
  console.log("Read", await reader.read());
  console.log("Write Twice");
  // Resume the pending pull task (consumption equals production)
  write("5");
  // Write to the queue (production exceeding consumption)
  write("6");
}, 100);

// Pull 1
// Pull 2
// Pull 3
// Read Twice
// Pull 4
// Read {value: '1', done: false}
// Pull Pending
// Read {value: '2', done: false}
// Write Twice
// Write Pending Pull 5
// Pull Restore 5
// Write Queue 6
```

It seems like we have achieved great buffer queue control based on `pull`. However, upon closer inspection, it appears that we might have overlooked something. Are we simply moving the internal buffer queue of `ReadableStream` to the external environment? In reality, we are still facing memory pressure. It's just that the data backlog has shifted from `ReadableStream` to the array we defined ourselves, and we seem to have not really solved the issue at hand.

Let's take a moment to think about where the issue lies. It seems that when we use `TransformStream`, our backpressure control is simply achieved by `await writer.ready`. So, what does this really imply? It clearly indicates the presence of a feedback mechanism where, when the internal queue feels pressure, it will actively block the data production from the producer. In our implementation, it appears that we lack the feedback mechanism from `Service Worker` to the main thread, which is why we struggle to handle the backpressure issue.

Digging deeper, let's focus on the essence. Our means of communication is through `postMessage`. So, what's the issue here? Or rather, what are we missing if we want to directly control backpressure in the main thread using `await`? It's evident that we lack the ability to obtain a response after the transmission. Since `postMessage` is unidirectional communication, we can't perform operations like `postMessage().then()`. Even attempting to immediately set `ready` as a pending `Promise` after `postMessage` to wait for response data to be resolved can achieve a similar effect.

This operation isn't overly complicated. Can we make it more versatile, similar to how `fetch` works? After initiating a request/push, we could use a `Promise` to wait for the corresponding response for a certain period or indefinitely. Since `postMessage` only supports one-way data transfer, we need to append an `id` identifier at the data level so that we know which `Promise` to resolve based on the response.

Considering this, we need to address the data transmission issue. Incorporating identification information into the original data isn't straightforward. For string data in `postMessage`, we can simply wrap it with another layer of object. However, dealing with `ArrayBuffer` data requires manipulation of its underlying `Buffer`, which can be more challenging. Hence, it would be beneficial to have a simple method to serialize the data, allowing us to transmit it as a string. I've considered serialization methods like `BASE64`, `Uint8Array`, and `Uint32Array`.

Let's take a basic example with 8 bytes and compare the volume after serialization using `BASE64`, `Uint8Array`, and `Uint32Array`. If all data bits are `0`, the encoded results would be `AAAAAAAAAAA=`, `[0,0,0,0,0,0,0,0]`, `[0,0]`, occupying volumes of 12 characters, 17 characters, and 5 characters respectively.

In the above results, the serialization result of `Uint32Array` seems optimal. However, this is based on all bits being filled with `0`. In real transmission scenarios, this ideal situation is unlikely. Let's consider a counterexample where all bits are filled with `1` to test the effects. In this case, the encoded results would be `//////////8=`, `[255,255,255,255,255,255,255,255]`, `[4294967295,4294967295]`, occupying volumes of 12 characters, 33 characters, and 23 characters respectively.

Looking at this, it seems that the serialization result of `BASE64` is more stable because it is encoded bit by bit. It encodes every `6 bits` into a character selected by index from an array of `64` characters. This turns every `3` bytes, or `24 bits`, into `4` characters, totaling to `32 bits`. Now, if we have `8` bytes, which equals `64 bits`, it doesn't divide evenly into `24 bits`. In this case, we initially process the first `6` bytes. If they are all `0`, then the first `8` characters become `A`. We are left with `16 bits`, which we fill with `8 bits` to complete `24 bits`, then encode it into `4` characters (last `6 bits are filled with `=`). Hence, the final result will be `12` characters.

However, I realize that I may have overthought this. In reality, we don't need to worry about serialization encoding. While in our `RTC DataChannel`, only pure strings or data like `ArrayBuffer` can be transmitted, and objects cannot be directly transferred, in the case of `postMessage`, the data that can be transmitted is controlled by `The Structured Clone Algorithm`. `ArrayBuffer` objects are also in the mix, and there's no need to use the `transfer` method to deal with ownership issues, as it actually executes the built-in serialization method. Through my actual testing, `Chrome`, `Firefox`, and `Safari` all support this type of direct data transfer. Since the data transfer here is all done within the same browser, the transmission can be more relaxed.

```html
<!-- index.html -->
<script>
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).then(res => {
        window.sw = res;
    })
</script>
```

```js
// sw.js
self.onmessage = (event) => {
  console.log("Message", event);
  self.message = event;
};

// Execute in console to observe SW's data response and value
const buffer = new ArrayBuffer(8);
const input = new Uint8Array(buffer);
input.fill(255);
sw.active.postMessage({ id: "test", buffer })
```

Implementing the response data from the `Service Worker` becomes much simpler now. We can treat it as a regular object and don't need to consider any serialization issues. We can efficiently utilize the features of `Promise` here. Upon receiving a response from `postMessage`, we simply look up the `resolve` corresponding to the current `id` in the global storage and execute it with the received data as a parameter. This way, we can easily provide feedback on backpressure, and we can also incorporate timeout mechanisms to prevent an accumulation of `resolve`.

```js
// Simulating onMessage method
let onMainMessage: ((event: { id: string; payload: string }) => void) | null = null;
let onWorkerMessage: ((event: { id: string; payload: string }) => void) | null = null;

// Simulating postMessage method
const postToWorker = (id: string, payload: string) => {
  onWorkerMessage?.({ id, payload });
};
const postToMain = (id: string, payload: string) => {
  onMainMessage?.({ id, payload });
};

// Worker
(() => {
  onWorkerMessage = ({ id, payload }) => {
    console.log("Worker Receive", id, payload);
    setTimeout(() => {
      postToMain(id, "pong");
    }, 1000);
  };
})();
```

```markdown
// Main
(() => {
  const map = new Map<string, (value: { id: string; payload: string }) => void>();
  onMainMessage = ({ id, payload }) => {
    const resolve = map.get(id);
    resolve?.({ id, payload });
    map.delete(id);
  };
  const post = (payload: string) => {
    const id = Math.random().toString(36).slice(2);
    return new Promise<{ id: string; payload: string }>(resolve => {
      map.set(id, resolve);
      postToWorker(id, payload);
    });
  };
  post("ping").then(res => {
    console.log("Main Receive", res.id, res.payload);
  });
})();
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://juejin.cn/post/6844904029244358670
https://github.com/jimmywarting/StreamSaver.js
https://github.com/jimmywarting/native-file-system-adapter
https://developer.mozilla.org/zh-CN/docs/Web/API/FetchEvent
https://nodejs.org/docs/latest/api/stream.html#types-of-streams
https://developer.mozilla.org/en-US/docs/Web/API/TransformStream
https://help.aliyun.com/zh/oss/user-guide/map-custom-domain-names-5
https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/a#download
https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Disposition
https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts#backpressure
https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
```