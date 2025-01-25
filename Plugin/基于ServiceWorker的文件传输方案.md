# 基于ServiceWorker的文件传输方案
`Service Worker`是一种驻留在用户浏览器后台的脚本，能够拦截和处理网络请求，从而实现丰富的离线体验、缓存管理和网络效率优化。请求拦截是其关键功能之一，通过监听`fetch`事件，`Service Worker`可以捕获所有向网络发出的请求，并有选择地处理这些请求，例如从缓存中读取响应，或者对请求进行修改和重定向，进而实现可靠的离线浏览和更快速的内容加载。

## 描述
在前段时间，在群里看到有人提了一个问题，在从对象存储下载文件的时候，为什么实现了携带了一个`GitHub Pages`的地址，理论上而言我们从对象存储下载内容直接点连接就好了。然而这里竟然看起来似乎还有一个中间环节，像是需要被`GitHub Pages`拦截并中转才下载到本地，链接地址类似于下面的内容。此时如果我们在下载页面点击下载后，再打开浏览器的下载管理功能，可以发现下载地址实际上会变成一个更加奇怪的地址，而这个地址我们实际上直接在浏览器打开会响应`404`。

```html
<!-- 下载页面 -->
https://jimmywarting.github.io/StreamSaver.js/examples/saving-a-blob.html

<!-- 浏览器下载管理 -->
https://jimmywarting.github.io/StreamSaver.js/jimmywarting.github.io/712864/sample.txt
```

从链接中我们可以明显地看出这里是使用了`StreamSaver.js`来作为下载文件的中间环节，从`README`中我们可以看出`StreamSaver.js`是基于`ServiceWorker`的大文件下载方案。于是前段时间有时间将其实现研究了一番，通常我们需要调度文件下载时，可能会直接通过`<a />`标签在浏览器中直接打开目标链接便可以开始下载，然而这种方式有比较明显的三个问题: 

* 如果直接打开的资源是图片、视频等浏览器能够直接解析的资源，那么此时浏览器不会触发下载行为，而是会直接在浏览器中预览打开的资源，即默认的`Content-Disposition`值是`inline`，不会触发值为`attachment`的下载行为。当然，使用`<a />`标签的`download`可以解决这个问题，然而这个属性只有在同源`URL`、`blob:`和`data:`协议下才会生效。
* 如果我们上传到对象存储的文件存在重名资源的问题，那么为了防止文件被覆盖，我们可能会随机生成资源名或者在资源后面加上时间戳，甚至直接将文件名生成不带扩展名的`HASH`值。那么在文件下载的时候，我们就需要将文件名实际还原回来，然而这个过程仍然需要依赖响应的`attachment; filename=`，或者`<a />`标签的`download`属性来重命名文件。
* 如果我们请求的资源是需要校验权限才能正常下载，那么直接使用`<a />`标签进行资源请求的时候则仅仅是发起了`GET`请求，而且将密钥放置于请求的链接地址上显然是做不到真正的权限校验的。当然通过签发临时的`Token`并返回`GET`请求地址当然是可行的，但如果涉及到更复杂一些的权限控制以及审计追踪时，生成临时下载链接可能并不足以做到高安全性的要求，类似的问题在`EventSource`对象实现的`SSE`中更加明显。

而在我们的项目中，恰好存在这样的历史遗留问题，我们的资源文件都会存储在`OSS-Object Storage Service`对象存储中，并且为了防止资源重名的问题，默认的资源策略是完全不携带文件的扩展名，而是直接将文件名生成`HASH`值。而且由于域名是基建自带的`CDN`加速域名，不能通过配置`CNAME`来定义为我们站点的域名，也就是说我们的资源必然存在跨域的问题，这就相当于把所有的限制都触及到了。

那么在这种情况下，我们是需要将文件重命名为原本的资源名称的，毕竟在不存在扩展名的情况下操作系统不能识别出文件内容。而我们的`CDN`资源是不存在`Content-Disposition`响应头以及原始资源名称的，而且文件也不是同域名下的资源。在这种情况下我们需要实现跨域情况下的资源重命名，由此来支持用户的下载行为，所以我们在这里采取的方案是首先使用`fetch`将文件下载到内存，然后通过`createObjectURL`将其创建为`blob:`协议的资源，由此来支持`<a />`标签的`download`属性。

通过这种方式下载文件则又出现了另一个问题，将文件全部下载后都存在内存中可能会存在`OOM`的现象。对于现代浏览器来说并没有非常明确的单个`Tab`页的内存限制，而是根据系统资源动态分配的，但是只要在内存中下载足够大的文件，还是会触发`OOM`导致浏览器页面崩溃。那么在这种情况下，通过将`Service Worker`作为中间人拦截下载请求，并且在响应的`Header`中加入`Content-Disposition`来支持文件重命名，并且可以通过`Stream API`来实现流式的下载行为，由此避免全部将文件下载到内存当中。总结来说，在这里我们通过这种方式解决了两个问题: 

* 跨域资源的下载，通过劫持请求并增加相应头的方式，解决了跨域资源的重命名问题，并以此来直接调度浏览器`IO`来实现下载。
* 避免内存溢出问题，通过`Stream API`将`fetch`请求的数据分片写入文件，以此来做到流式下载，避免将文件全部写入到内存中。

那么除了在对象存储下载文件之外，这种数据处理方式还有很多应用场景，例如我们需要批量下载文件并且压缩时，可以主动`fetch`后通过`ReadableStream`读，并且`pipe`到类似压缩的实现中。例如`zlib.createDeflateRaw`的浏览器方案，再`pipe`到`WritableStream`中类似`FileSystemFileHandle.createWritable`以此来实时写入文件，这样就可以做到高效的文件读写，而不需要将其全部持有在内存中。

恰好在先前我们基于`WebRTC`实现了局域网文件传输，而通过`WebRTC`传输的文件也会同样需要面对大文件传输的问题，并且由于其本身并不是`HTTP`协议，自然就不可能携带`Content-Disposition`等响应头。这样我们的大文件传输就必须要借助中间人的方式进行拦截，此时我们通过模拟`HTTP`请求的方式来生成虚拟的下载链接，并且由于本身就是分片传输，我们可以很轻松地借助`Stream API`来实现流式下载能力。那么本文就以`WebRTC`的文件传输为基础，来实现基于`Service Worker`的大文件传输方案，文中的相关实现都在`https://github.com/WindrunnerMax/FileTransfer`中。

## Stream API
浏览器实现的`Stream API`中存在`ReadableStream`、`WritableStream`、`TransformStream`三种流类型，其中`ReadableStream`用以表示可读的流，`WritableStream`用以表示可写的流，而`TransformStream`用以表示可读写的流。由于在浏览器中`Stream`的实现时间与机制并不相同，`ReadableStream`的兼容性与`Fetch API`基本一致，而`WritableStream`和`TransformStream`的兼容性则相对稍差一点。

### 数据流动
在最开始接触`Stream API`的时候，我难以理解整个管道的数据流，针对于缓冲区以及背压等问题本身是不难理解的，但是在实际将`Stream`应用的时候，我发现并不能理解整个流的模型的数据流动方向。在我的理解中，整个管道应该是以`WritableStream`起始用以写入/生产数据，而后继的管道则应该使用`ReadableStream`来读取/消费数据，而整个连接过程则可以通过`pipeTo`链接起来。

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

当然这是个错误的示例，针对于流的理解我们应该参考`Node.js`的`Stream`模块，以`node:fs`的`createReadStream`与`createWriteStream`为例，我们会更容易理解整个模型。我们的`Stream`模型是以`ReadableStream`为起始，即数据生产是以`Node.js`本身的`IO`为基础的读取文件，将内容写入到`ReadableStream`中。而我们作为数据处理者，则是在其本身的事件中进行数据处理，进而将处理后的数据写入`WritableStream`来消费，即后继的管道是以`WritableStream`为终点。

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

那么在浏览器中，我们的`Stream API`同样是以`ReadableStream`为起始，`Fetch API`的`Response.body`就是很好的示例，数据的起始同样是以`IO`为基础的网络请求。在浏览器中我们的`ReadableStream`的`API`与`Node.js`本身还是有些不同的，例如在浏览器`ReadableStream`的`Reader`并不存在类似`on("data", () => null)`的事件监听，而前边的例子只是为了让我们更好地理解整个流模型，在这里我们当然是以浏览器的`API`为主。

聊了这么多关于`Stream API`的问题，我们回到针对于`WebRTC`传递的数据实现。针对于类似`Fetch`的数据传输，是借助浏览器本身的`IO`来控制`ReadableStream`的数据生产，而我们的`WebRTC`仅仅是传输通道，因此在管道的初始数据生产时，`ReadableStream`是需要我们自己来控制的。因此我们最开始想到的`Writable -> Readable`方式，则是为了适应这部分实现，而实际上这种方式实际上更契合于`TransformStream`的模型，其本身的能力是对数据流进行转换，而我们同样可以借助`TransformStream`来实现流的读写。

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

那么在这里我们就可以实现对于`ReadableStream`的数据处理，在基于`WebRTC`的数据传输实现中，我们可以获取到`DataChannel`的数据流本身。那么此时我们就可以通过`ReadableStream`的`Controller`来向缓冲队列中置入数据，以此来实现数据的写入，而后续的数据消费则可以使用`ReadableStream`的`Reader`来实现，这样我们就可以借助缓冲队列实现流式的数据传输。

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

### 背压问题
那么在这里我们可以思考一个问题，如果此时我们的`DataChannel`的数据流的传输速度非常快，也就是不断地将数据`enqueue`到队列当中。而假如此时我们的消费速度非常慢，例如我们的硬盘写入速度比较慢，那么数据的队列就会不断增长，那么就可能导致内存溢出。实际上这个问题有专业的术语来描述，即`Back Pressure`背压问题，在`ReadableStream`中我们可以通过`controller.desiredSize`来获取当前队列的大小，以此来控制数据的生产速度，以此来避免数据的积压。

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

而对于背压问题， 我们可以很简单地理解到，当我们的数据生产速度大于数据消费速度时，就会导致数据的积压，那么针对于`ReadableStream`与`WritableStream`，我们可以分别得到相关的排队策略。实际上我们也能够很容易理解到背压所谓的压力都是来自于缓冲队列中未消费的块，那么我们也可以预设比较大的缓冲队列长度，只不过这样虽然避免了`desiredSize`为负值，但是并不能解决背压问题。

* 对于`ReadableStream`，背压来自于已入队但尚未读取的块。
* 对于`WritableStream`，背压来自于已写入但尚未由底层接收器处理的块。

而在先前的`ReadableStream`实现中，我们可以很明显地看到其本身并没有携带背压的默认处理机制，即使我们可以通过`desiredSize`来判断当前内置队列的压力，但是我们并不能很明确地反馈数据的生产速度。我们更希望基于事件驱动来控制而不是类似于`setTimeout`来轮训检查，当然我们也可以通过`pull`方法来被动控制队列的数据量。而在`WritableStream`中则存在内置的背压处理方法即`writer.ready`，通过这个方法我们可以判断当前队列的压力，以此来控制数据的生产速度。

```js
(async () => {
  const writable = new WritableStream();
  const writer = writable.getWriter();
  await writer.write(1);
  await writer.write(1);
  await writer.write(1);
  console.log("written"); // written
  await writer.ready;
  await writer.write(1);
  console.log("written"); // Nil
})();
```

因此在我们的`WebRTC`数据传输中，为了方便地处理背压问题，我们是通过`TransformStream`的`writable`端来实现数据的写入，而消费则是通过`readable`端来实现的。这样我们就可以很好地控制数据的生产速度，并且可以在主线程中将`TransformStream`定义后，将`readable`端通过`postMessage`将其作为`Transferable Object`传递到`Service Worker`中消费即可。

```js
// packages/webrtc/client/worker/event.ts
export class WorkerEvent {
  public static start(fileId: string, fileName: string, fileSize: number, fileTotal: number) {
    const ts = new TransformStream();
    WorkerEvent.channel.port1.postMessage(
      {
        key: MESSAGE_TYPE.TRANSFER_START,
        id: fileId,
        readable: ts.readable,
      } as MessageType,
      [ts.readable]
    );
  }

  public static async post(fileId: string, data: ArrayBuffer) {
    const writer = WorkerEvent.writer.get(fileId);
    if (!writer) return void 0;
    await writer.ready;
    return writer.write(new Uint8Array(data));
  }

  public static close(fileId: string) {
    WorkerEvent.channel?.port1.postMessage({
      key: MESSAGE_TYPE.TRANSFER_CLOSE,
      id: fileId,
    } as MessageType);
    const writer = WorkerEvent.writer.get(fileId);
    writer?.close();
  }
}
```

### Fetch
在`Fetch API`的`Response`对象中，存在`Response.body`属性用以获取响应的`ReadableStream`，与上述对象一致同样用以表示可读的流。通过这个接口我们可以实现流式的读取数据，而不需要一次性将所有数据读取到内存中，以此来渐进式地处理数据，例如在使用`fetch`实现`SSE - Server-Sent Events`的响应时，便可以通过维持长链接配合`ReadableStream`来实现数据的响应。

针对于`Fetch`方法，在接触`Stream API`之前我们可能主要的处理方式是调用`res.json()`等方法来读取数据，实际上这些方法同样会在其内部实现中隐式调用`ReadableStream.getReader()`来读取数据。而在`Stream API`出现之前，如果我们想要处理某种资源例如视频、文本文件等，我们必须下载整个文件，等待它反序列化为合适的格式，然后直接处理所有数据。

因此在先前调研`StreamSaver.js`时，我比较费解的一个问题就是，既然我们请求的数据依然是需要从全部下载到内存中，那么在这种情况下我们使用`StreamSaver.js`依然无法做到流式地将数据写入硬盘，依然会存在浏览器`Tab`页的内存溢出问题。而在了解到`Fetch API`的`Response.body`属性后，关于整个流的处理方式就变得清晰了，我们可以不断地调用`read()`方法将数据传递到`Service Worker`调度下载即可。

因此调度文件下载的方式大概与上述的`WebRTC`传输方式类似，在我们已经完成劫持数据请求的中间人`Service Worker`之后，我们只需要在主线程部分发起`fetch`请求，然后在响应数据时通过`Iframe`发起劫持的下载请求，最后通过`Response.body.getReader()`分片读取数据，并且不断将其写入到`TransformStream`的`Writer`中即可。此外，我们还可以借助分片实现一些诸如下载进度之类的效果。


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
`Service Worker`作为一种运行在后台的独立线程，具备充当网络请求中间人的能力，能够拦截、修改甚至完全替换网络请求和响应，从而实现高级功能如缓存管理、提升性能、离线访问、以及对请求进行细粒度的控制和优化。在这里我们就可以借助`Service Worker`为我们的请求响应加入`Content-Disposition`等响应头，以此来触发浏览器的下载能力，借助浏览器的`IO`实现大文件的下载。

### 环境搭建
在通过`Service Worker`实现中间人拦截网络请求之前，我们可以先看一下在`Service Worker`中搭建`TS`环境以及`Webpack`的配置。我们平时`TS`开发的环境的`lib`主要是`dom`、`dom.iterable`、`esnext`，而由于`Worker`中的全局变量以及持有的方法并不相同，因此其本身的`lib`环境需要改为`WebWorker`、`ESNext`，且如果不主动引入或者导出模块，`TS`会认为其是作为`d.ts`使用。因此即使我们在没有默认导入导出的情况下也要默认导出个空对象，而在有导入的情况下则需要注意将其在`tsconfig`中`include`相关模块。

```js
// packages/webrtc/client/worker/index.ts
/// <reference lib="esnext" />
/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;
export {};
```

`Service Worker`本身作为独立的`Js`文件，其必须要在同源策略下运行，这里如果需要关注部署环境的路由环境的话，需要将其配置为独立的路由加载路径。而对于我们的静态资源本身来说则需要将我们实现的独立`Worker`作为入口文件配置到打包工具中，并且为了方便处理`SW`是否注册以及缓存更新，通常我们都是将其固定为确定的文件名，以此来保证其在缓存中的唯一性。

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

在`Service Worker`中，我们可以在其`install`事件和`activate`事件中分别处理其安装与激活的逻辑，通常新的`Service Worker`安装完成后会进入等待阶段，直到旧的`Service Worker`被完全卸载后再进行激活。因此我们可以直接在`onInstall`时`skipWaiting`，在`onActive`事件中，我们可以通过`clients.claim`在激活后立即接管所有的客户端页面，无需等待页面刷新，这对于我们调试`SW`的时候非常有用。

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

### 请求拦截
接下来我们就要来研究一下`Service Worker`的拦截网络请求能力了，在`MDN`中存在对于`Fetch Event`的详细描述，而且`Fetch Event`是仅能够在`Service Worker`中使用的。而在这里我们的拦截请求与响应则非常简单，我们只需要从请求的地址中获取相关信息，即`id`、`name`、`size`、`total`，然后通过`ReadableStream`构造`Response`作为响应即可，这里主要需要关注的是`Content-Disposition`与`Content-Length`两个响应头，这是我们触发下载的关键配置。

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
    return void 0;
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

在这里还有一件有趣的事情，在上面的实现中我们可以看到对于从请求地址中取得相关信息的检查，如果检查不通过则返回`undefined`。这实际上是个很常见的拦截`Case`，即不符合条件的请求我们直接放行即可，而在之前我一直比较纳闷的问题是，任何经过`Service Worker`拦截的请求都会在我们的`Network`控制台面板中出现带着齿轮符号的请求，也就是从`Service Worker`中发起的请求，这样在调试的时候会显得非常混乱。

实际上这就单纯是我们使用出现了问题，从提示信息能够明显地看出来这是从`Service Worker`中发起的请求，而实际上这个请求我们直接让其通过原本的链路请求即可，不需要从`Service Worker`中实际代理。而触发这个请求条目的主要原因是我们调用了`fetch`方法，而无论是直接返回`fetch`还是通过`event.respondWith(fetch)`都会触发这个请求条目，因此我们在拦截请求的时候，如果不符合条件则直接返回`undefined`即可。

```js
// 会再次发起请求
return fetch(event.request);
return event.respondWith(fetch(event.request));

// 不会再次发起请求
return ;
```

那么我们需要接着思考一个问题，应该如何触发下载，这里的`Service Worker`仅仅是拦截了请求，而在`WebRTC`的传输中并不会实际发起任何`HTTP`请求。因此我们需要主动触发这个请求，得益于`Service Worker`可以拦截几乎所有的请求，包括静态资源、网络请求等，因此我们可以直接借助创建`Iframe`的方式配合约定好的字段名来实现下载，在这里实际上就是我们最开始提到的那个比较奇怪的链接地址了。

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

在这里我们可能会好奇一个问题，为什么我们的请求信息是从`URL`上获取，而不是直接在原始请求的时候就构造完成相关的`Header`信息，在`Service Worker`中直接将约定的响应头直接转发即可，也就是说为什么要用`Iframe`而不是`fetch`请求并且携带请求头的方式来实现下载。实际上这是因为即使存在了`"Content-Disposition": "attachment; xxx"`响应头，`fetch`请求也不支持直接发起下载能力。

实际上在这里我还研究了一下`StreamSaver.js`的实现，这同样是个很有趣的事情，`StreamSaver.js`的运行环境本身就是个`Iframe`即`mitm.html`，那么我们姑且将其称为`B.html`，那么此时我们的主线程称其为`A.html`。此时我们在`B`中注册名为`B.js`的`Service Worker`，之后我们通过`python3 -m http.server 9000`等方式作为服务资源打开`A`的地址，新器端口`9001`打开`B`的地址，保证其存在跨域的情况。

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

此时我们在`A.html`中创建新的`iframe`地址`localhost:9001/ping`，也就是类似于在`StreamSaver.js`创建出的临时下载地址那种，我们可以发现这个地址竟然可以被监听到，即`Service Worker`可以拦截到这个请求。当时觉得这件事很神奇因为在不同域名的情况下理论上不可能被拦截的，本来以为发现了什么`iframe`的特性，最后发现我们访问的是`9001`的源地址，也就是相当于还是在`B.html`源下的资源，如果此时我们访问的是`9000`的资源则不会有这个效果了。

```js
const iframe = document.createElement("iframe");
iframe.hidden = true;
iframe.src = "http://localhost:9001/ping";
document.body.appendChild(iframe);
```

此外实际上如果我们在浏览器的地址栏中直接打开`http://localhost:9001/ping`也是同样可以得到`pong`的响应的，也就是说`Service Worker`的拦截范围是在注册的`scope`范围内。那么实际上如果有必要的话，我们则完全可以基于`SW`来实现离线的`PWA`应用，而不需要依赖于服务器响应的路由以及接口。此外，这个效果在我们的`WebRTC`实现的`SW`中也是存在的，而当我们再次点击下载链接无法得到响应，是由于我们检查到`transfer`不存在，直接响应了`404`。

```js
const transfer = map.get(fileId);
if (!transfer) {
  return event.respondWith(new Response(null, { status: 404 }));
}
```

### 数据通信
言归正传，接下来我们就需要实现与`Service Worker`的通信方案了，这里的实现就比较常规了。首先我们要注册`Service Worker`，在同一个`Scope`下只能注册一个`Service Worker`，如果在同一个作用域内注册多个`Service Worker`，那么后注册的`Service Worker`会覆盖先注册的`Service Worker`，当然这个问题不存在`WebWorker`中。在这里我们借助`getRegistration`与`register`分别来获取当前活跃的`Service Worker`以及注册新的`Service Worker`。

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

在与`Service Worker`数据通信方面，我们可以借助`MessageChannel`来实现。`MessageChannel`是一个双向通信的通道，可以在两个不同的`Context`中传递消息，例如在主线程与`Worker`线程之间进行数据通信。我们只需要在主线程中创建一个`MessageChannel`，然后将其`port2`端口通过`postMessage`传递给`Service Worker`，而`Service Worker`则可以通过`event.ports[0]`获取到这个`port2`，此后我们就可以借助这两个`port`直接通信了。

或许我们会思考一个问题，为什么我们可以将`port2`传递到`Service Worker`中，理论上而言我们的`postMessage`只能传递可序列化`Structured Clone`的对象，例如字符串、数字等数据类型，而`port2`本身是作为不可序列化的对象存在的。那么这里就涉及到了`Transferable objects`的概念，可转移的对象是拥有属于自己的资源的对象，这些资源可以从一个上下文转移到另一个，确保资源一次仅在一个上下文中可用，在传输后原始对象不再可用，其不再指向转移后的资源，并且任何读取或者写入该对象的尝试都将抛出异常。

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

因为在这里我们暂时不需要接收来自`Service Worker`的消息，因此在这里我们对于`port1`接收的消息只是简单地打印了出来。而在初始化`CHANNEL`的时候，我们将`port2`作为可转移对象放置到了第二个参数中，以此在`Service Worker`中便可以接收到这个`port2`，由于我们以后的信息传递都是由`MessageChannel`进行，因此这里的`onmessage`作用就是很单纯的接收`port2`对象端口。

```js
// packages/webrtc/client/worker/index.ts
self.onmessage = event => {
  const port = event.ports[0];
  if (!port) return void 0;
};
```

那么紧接着我们就需要使用`TransformStream`进行数据的读写了，由于`TransformStream`本身同样是可转移对象，因此我们可以将其直接定义在主线程中，然后在初始化文件下载时，将`readable`端传递到`Service Worker`中，并将其作为下载的`ReadableStream`实例构造`Response`对象。那么接下来在主线程创建`iframe`触发下载行为之后，我们就可以在`Fetch Event`中从`map`中读取`readable`了。

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
// 构造 iframe 触发下载行为
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
// 在触发下载行为后 从 map 中读取 readable
// ...
```

在主线程中，我们关注的是内容的写入，以及内置的背压控制，由于`TransformStream`本身内部实现的队列以及背压控制，我们就不需要太过于关注数据生产造成的问题，因为在先前我们实现的`WebRTC`下载的反馈链路是完善的，我们在这里只需要借助`await`控制写入速度即可。在这里有趣的是，即使`TransformStream`的`readable`与`writable`两端现在是运行在两个上下文环境中，其依然能够进行数据读写以及背压控制。

```js
// packages/webrtc/client/worker/event.ts
const writer = WorkerEvent.writer.get(fileId);
if (!writer) return void 0;
// 感知 BackPressure 需要主动 await ready
await writer.ready;
return writer.write(new Uint8Array(data));
```

那么在数据块的数量即`total`的最后一个块完成传输后，我们就需要将整个传输行为进行回收。首先是`TransformStream`的`writable`端需要关闭，这个`Writer`必须主动调度关闭方法，否则浏览器无法感知下载完成，会一直处于等待下载完成的状态，其次就是我们需要将创建的`iframe`从`body`上回收，在`Service Worker`中我们也需要将`map`中的数据进行清理，避免先前的链接还能够响应等问题。

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

### 兼容考量
在现代浏览器中`Service Worker`、`Fetch API`、`Stream API`都已经得到了比较良好的支持，在这里我们使用到的相对最新特性`TransformStream`的兼容性也是不错的，在`2022`年后发布的浏览器版本基本得到了支持，然而如果我们在`MDN`的`TransformStream`兼容性中仔细观察一下，则会发现`TransformStream`作为`transferable`在`Safari`中至今还未支持。

那么在这里会造成什么问题呢，我们可以注意到在先前`TRANSFER_START`的时候，我们是将`TransformStream`的`readable`端作为`Transferable Object`传递到`Service Worker`中，那么此时由于`Safari`不支持这个行为，我们的`ReadableStream`自然就无法传递到`Service Worker`中，因此我们后续的下载行为就无法继续了，因此如果需要兼容`Safari`的情况下，我们需要处理这个问题。

这个问题的原因是我们无法将`ReadableStream`转移所有权到`Service Worker`中，因此可以想到的比较简单的办法就是直接在`Service Worker`中定义`ReadableStream`即可。也就是说，当传输开始时，我们实例化`ReadableStream`并且保存其控制器对象，当数据传递的时候，我们直接将数据块`enqueue`到缓冲队列中，而在传输结束时，我们直接调用`controller.close()`方法即可，而这个`readable`对象我们就可以直接作为请求拦截的`Response`响应为下载内容。

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

那么在这里我们就会意识到先前我们聊到的背压问题，由于在这里我们没有任何背压的反馈机制，而是仅仅将主线程的数据块全部接收并且`enqueue`到`ReadableStream`中，那么在数据传输速度比浏览器控制的下载`IO`速度快的情况下，很容易就会出现数据积压的情况。因此我们就需要想办法实现背压的控制，那么我们就可以比较容易地想到下面的方式。

* 在实例化`ReadableStream`对象的时候，我们借助`CountQueuingStrategy`创建足够大的缓冲区，因为本身在传输的过程中我们已经得知了整个文件的大小以及分块的数量等信息，因此创建足够大的缓冲区是可行的。当然我们可能也没必要创建等同于分块数量大小的缓冲区，我们可以将其除`2`取整或者取对数都可以，毕竟下载的时候也通过写硬盘在不断消费的。
* 在实例化`ReadableStream`时传递的`underlyingSource`对象中，除了`start`方法外实际上还有`pull`方法，当流的内部数据块队列未满时将会被反复调用，直到达到其高水印，我们则可以通过这个方法的调用作为事件驱动的机制来控制流的频率。需要注意的是只有在其至少入队一个数据块才会被反复调用，如果在`pull`函数调用的时候没有实际入队块，则不会被重复调用。

我们在这里首先来看一下分配足够大的缓冲队列的问题，如果深入思考一下，即使分配了足够大的缓冲区，我们实际上并没有实现任何反馈机制去控制减缓数据的生产环节，那么这个缓冲区即使足够大也并没有解决我们的内存溢出问题，虽然即使实例化时分配了足够大的缓冲，也不会立即分配这么大的内存。那么此时即使我们不分配那么大的缓冲区，以默认模式实现的队列也是完全一样的，只是其内部的`desiredSize`会变成比较大的负值，而数据也并没有实际丢失，因为此时浏览器的流实现会将数据存储在内存中，直到消费方读取为止。

那么我们再来看一下第二个实现，通过`pull`方法我们确实可以获得来自`ReadableStream`的缓冲队列反馈，那么我们就可以简单实现一个控制流的方式。考虑到我们会有两种状态，即生产大于消费以及消费大于生产，那么我们就不能单纯的在`pull`的时候再拉取数据，我们应该在内部再实现一个缓冲队列。而我们的事件驱动置入数据应该有两部分，分别是缓冲队列置入数据时需要检查是否上次拉取的数据没有成功而是在等待。此时需要调度上次`pull`时未完成的`Promise`，也就是消费大于生产的情况，还有一个事件是`pull`时直接检查缓冲队列是否有数据，如果有则直接置入数据，也就是生产大于消费的情况。

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

// 使得读取任务后置 先让 pull 将 Readable 缓冲队列拉满
setTimeout(async () => {
  // 此时 queue 队列中还存在数据 生产大于消费
  const reader = readable.getReader();
  console.log("Read Twice");
  // 读取后 queue 队列中数据已经读取完毕 消费等于生产
  console.log("Read", await reader.read());
  // 读取后 queue 队列为空 Readable 缓冲队列未满
  // 之后 Readable 仍然发起 pull 事件 消费大于生产
  console.log("Read", await reader.read());
  console.log("Write Twice");
  // 写入挂起的 pull 任务 消费等于生产
  write("5");
  // 写入 queue 队列 生产大于消费
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

看起来我们实现了非常棒的基于`pull`的缓冲队列控制，但是我们仔细研究一下会发现我们似乎忽略了什么，我们是不是仅仅是将`ReadableStream`内置的缓冲队列提出来到了外边，实际上我们还是会面临内存压力。只不过这里的数据积压的位置从`ReadableStream`转移到了我们自己定义的数组之后，我们似乎完全没有解决问题。

那么我们再来思考一下问题到底是出在哪里，当我们使用`TransformStream`的时候我们的背压控制似乎仅仅是`await writer.ready`就实现了。那么这里究竟意味着什么，我们可以很明显地思考出来这里是携带者反馈机制的，也就是说当其认为内部的队列承压之后，会主动阻塞生产者的数据生产，而我们的实现中似乎并没有从`Service Worker`到主线程的反馈机制，因此我们才没有办法处理背压问题。

那么我们再看得本质一些，我们的通信方式是`postMessage`，那么在这里的问题是什么呢，或者是说如果我们想在主线程使用`await`的方式直接控制背压的话，我们缺乏的是什么。很明显是因为我们没有办法获得传输后事件的响应，那么在这里因为`postMessage`是单向通信的，我们没有办法做到`postMessage().then()`这样的操作，甚至于我们可以在`postMessage`之后立即置`ready`为挂起的`Promise`，等待响应数据的`resolve`，由此就可以做到类似的操作了。

这个操作并不复杂，那么我们可不可以将其做的更通用一些，类似于`fetch`的实现，当我们发起一个请求/推送后，我们可以借助`Promise`在一定时间内甚至一直等待其对应的响应。而由于我们的`postMessage`是单向的数据传输，我们就需要在数据的层面上增加`id`标识，以便于我们可以得知当前的响应究竟应该`resolve`哪个`Promise`。

考虑到这里，我们就需要处理数据的传输问题，也就是说由于我们需要对原始的数据中追加标识信息并不是一件容易的事，在`postMessage`中如果是字符串数据我们可以直接再构造一层对象，然而如果是`ArrayBuffer`数据的话，我们就需要操作其本身的`Buffer`，这显然是有些费劲的。因此我希望能够有一些简单的办法将其序列化，然后就可以以字符串的形式进行传输了，在这里我考虑了`BASE64`、`Uint8Array`、`Uint32Array`的序列化方式。

我们就以最简单的`8`个字节为例，分别计算一下序列化之后的`BASE64`、`Uint8Array`、`Uint32Array`体积问题。如果我们此时数据的每位都是`0`的话，分别计算出的编码结果为`AAAAAAAAAAA=`、`[0,0,0,0,0,0,0,0]`、`[0,0]`，占用了`12`字符、`17`字符、`5`字符的体积。

```js
const buffer = new ArrayBuffer(8);
const input = new Uint8Array(buffer);
input.fill(0);

const binaryStr = String.fromCharCode.apply(null, input);
console.log("BASE64", btoa(binaryStr)) ; // AAAAAAAAAAA=
const uint8Array = new Uint8Array(input);
console.log("Uint8Array", uint8Array); // Uint8Array(8) [0, 0, 0, 0, 0, 0, 0, 0]
const uint32Array = new Uint32Array(input.buffer);
console.log("Uint32Array", uint32Array); // Uint32Array(2) [0, 0]
```

在上边的结果中我们看起来是`Uint32Array`的序列化结果最好，然而这是我们上述所有位都填充为`0`的情况，然而在实际的传输过程中肯定是没有这么理想的。那么我们再举反例，将其全部填充为`1`来测试效果。此时的结果就变得不一样了，分别计算出的编码结果为`//////////8=`、`[255,255,255,255,255,255,255,255]`、`[4294967295,4294967295]`，占用了`12`字符、`33`字符、`23`字符的体积。

```js
const buffer = new ArrayBuffer(8);
const input = new Uint8Array(buffer);
input.fill(0);

const binaryStr = String.fromCharCode.apply(null, input);
console.log("BASE64", btoa(binaryStr)) ; // //////////8=
const uint8Array = new Uint8Array(input);
console.log("Uint8Array", uint8Array); // Uint8Array(8) [255, 255, 255, 255, 255, 255, 255, 255]
const uint32Array = new Uint32Array(input.buffer);
console.log("Uint32Array", uint32Array); // Uint32Array(2) [4294967295, 4294967295]
```

这么看起来，还是`BASE64`的序列化结果比较稳重，因为其本身就是按位的编码方式，其会将每`6 bits`编码共`64`按照索引取数组中的字符，这样就变成了每`3`个字节即`24 bits`会编码为`4`个字符变成`32 bits`。而此时我们有`8`个字节也就是`64 bits`，不能够被`24 bits`完全整除，那么此时我们先处理前`6`个字节，如果全位都是`0`的话，那么前`8`个字符就全部是`A`，而此时我们还剩下`16 bits`。那么我们就填充`8 bits`将其凑为`24 bits`，然后再编码为`4`个字符(最后`6 bits`由`=`填充)，因此最终的结果就是`12`个字符。

然而在这里我发现是我想多了，实际上我们并不需要考虑序列化的编码问题，在我们的`RTC DataChannel`确实是必须要纯字符串或者是`ArrayBuffer`等数据，不能直接传输对象。但是在`postMessage`中我们可以传递的数据是由`The Structured Clone Algorithm`算法控制的，而`ArrayBuffer`对象也是赫然在列的，而且也不需要借助`transfer`能力来实现所有权问题，其会实际执行内置的序列化方法。在我的实际测试中`Chrome`、`Firefox`、`Safari`都是支持这种直接的数据传输的，这里的传输毕竟都是在同一浏览器中进行的，其数据传输可以更加宽松一些。

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

// 控制台执行 观察 SW 的数据响应以及值
const buffer = new ArrayBuffer(8);
const input = new Uint8Array(buffer);
input.fill(255);
sw.active.postMessage({ id: "test", buffer })
```

那么我们对于需要从`Service Worker`响应的数据实现就简单很多了，毕竟我们现在只需要将其当作普通的对象处理就可以了，也不需要考虑任何序列化的问题。此时我们就利用好`Promise`的特性，当接收到`postMessage`响应的时候，从全局的存储中查找当前`id`对应的`resolve`，并且将携带的数据作为参数执行即可，至此我们就可以很方便地进行背压的反馈了，我们同样也可以加入一些超时机制等避免`resolve`的积压。

```js
// 模拟 onMessage 方法
let onMainMessage: ((event: { id: string; payload: string }) => void) | null = null;
let onWorkerMessage: ((event: { id: string; payload: string }) => void) | null = null;

// 模拟 postMessage 方法
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

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

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