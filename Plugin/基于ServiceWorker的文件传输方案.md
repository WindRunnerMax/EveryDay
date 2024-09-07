# 基于ServiceWorker的文件传输方案
`Service Worker`是一种驻留在用户浏览器后台的脚本，能够拦截和处理网络请求，从而实现丰富的离线体验、缓存管理和网络效率优化。请求拦截是其关键功能之一，通过监听 `fetch` 事件，`Service Worker`可以捕获所有向网络发出的请求，并有选择地处理这些请求，例如从缓存中读取响应，或者对请求进行修改和重定向，进而实现可靠的离线浏览和更快速的内容加载。

## 描述
在前段时间，在群里看到有人提了一个问题，在从对象存储下载文件的时候，为什么实现了携带了一个`GitHub Pages`的地址，理论上而言我们从对象存储下载内容直接点连接就好了，然而这里竟然看起来似乎还有一个中间环节，像是需要被`GitHub Pages`拦截并中转才下载到本地，链接地址类似于下面的内容。此时如果我们在下载页面点击下载后，再打开浏览器的下载管理功能，可以发现下载地址实际上会变成一个更加奇怪的地址，而这个地址我们实际上直接在浏览器打开会响应`404`。

```html
<!-- 下载页面 -->
https://jimmywarting.github.io/StreamSaver.js/examples/saving-a-blob.html

<!-- 浏览器下载管理 -->
https://jimmywarting.github.io/StreamSaver.js/jimmywarting.github.io/712864/sample.txt
```

从链接中我们可以明显地看出这里是使用了`StreamSaver.js`来作为下载文件的中间环节，从`README`中我们可以看出`StreamSaver.js`是基于`ServiceWorker`的大文件下载方案。于是前段时间有时间将其实现研究了一番，通常我们需要调度文件下载时，可能会直接通过`<a />`标签在浏览器中直接打开目标链接便可以开始下载，然而这种方式有比较明显的三个问题: 

1. 如果直接打开的资源是图片、视频等浏览器能够直接解析的资源，那么此时浏览器不会触发下载行为，而是会直接在浏览器中预览打开的资源，即默认的`Content-Disposition`值是`inline`，不会触发值为`attachment`的下载行为。当然，使用`<a />`标签的`download`可以解决这个问题，然而这个属性只有在同源`URL`、`blob:`和`data:`协议下才会生效。
2. 如果我们上传到对象存储的文件存在重名资源的问题，那么为了防止文件被覆盖，我们可能会随机生成资源名或者在资源后面加上时间戳，甚至直接将文件名生成不带扩展名的`HASH`值。那么在文件下载的时候，我们就需要将文件名实际还原回来，然而这个过程仍然需要依赖响应的`attachment; filename=`，或者`<a />`标签的`download`属性来重命名文件。
3. 如果我们请求的资源是需要校验权限才能正常下载，那么直接使用`<a />`标签进行资源请求的时候则仅仅是发起了`GET`请求，而且将密钥放置于请求的链接地址上显然是做不到真正的权限校验的。当然通过签发临时的`Token`并返回`GET`请求地址当然是可行的，但如果涉及到更复杂一些的权限控制以及审计追踪时，生成临时下载链接可能并不足以做到高安全性的要求，类似的问题在`EventSource`对象实现的`SSE`中更加明显。

而在我们的项目中，恰好存在这样的历史遗留问题，我们的资源文件都会存储在`OSS-Object Storage Service`对象存储中，并且为了防止资源重名的问题，默认的资源策略是完全不携带文件的扩展名，而是直接将文件名生成`HASH`值，而且由于域名是基建自带的`CDN`加速域名，不能通过配置`CNAME`来定义为我们站点的域名，也就是说我们的资源必然存在跨域的问题，这就相当于把所有的限制都触及到了。

那么在这种情况下，我们是需要将文件重命名为原本的资源名称的，毕竟在不存在扩展名的情况下操作系统不能识别出文件内容，而我们的`CDN`资源是不存在`Content-Disposition`响应头以及原始资源名称的，而且文件也不是同域名下的资源。在这种情况下我们需要实现跨域情况下的资源重命名，由此来支持用户的下载行为，所以我们在这里采取的方案是首先使用`fetch`将文件下载到内存，然后通过`createObjectURL`将其创建为`blob:`协议的资源，由此来支持`<a />`标签的`download`属性。

通过这种方式下载文件则又出现了另一个问题，将文件全部下载后都存在内存中可能会存在`OOM`的现象，对于现代浏览器来说并没有非常明确的单个`Tab`页的内存限制，而是根据系统资源动态分配的，但是只要在内存中下载足够大的文件，还是会触发`OOM`导致浏览器页面崩溃。那么在这种情况下，通过将`Service Worker`作为中间人拦截下载请求，并且在响应的`Header`中加入`Content-Disposition`来支持文件重命名，并且可以通过`Stream API`来实现流式的下载行为，由此避免全部将文件下载到内存当中。总结来说，在这里我们通过这种方式解决了两个问题: 

1. 跨域资源的下载，通过劫持请求并增加相应头的方式，解决了跨域资源的重命名问题，并以此来直接调度浏览器`IO`来实现下载。
2. 避免内存溢出问题，通过`Stream API`将`fetch`请求的数据分片写入文件，以此来做到流式下载，避免将文件全部写入到内存中。

那么除了在对象存储下载文件之外，这种数据处理方式还有很多应用场景，例如我们需要批量下载文件并且压缩时，可以主动`fetch`后通过`ReadableStream`读，并且`pipe`到类似压缩的实现中，例如`zlib.createDeflateRaw`的浏览器方案，再`pipe`到`WritableStream`中配合`File System Access API`以此来实时写入文件，这样就可以做到高效的文件读写，而不需要将其全部持有在内存中。

恰好在先前我们基于`WebRTC`实现了局域网文件传输，而通过`WebRTC`传输的文件也会同样需要面对大文件传输的问题，并且由于其本身并不是`HTTP`协议，自然就不可能携带`Content-Disposition`等响应头。这样我们的大文件传输就必须要借助中间人的方式进行拦截，此时我们通过模拟`HTTP`请求的方式来生成虚拟的下载链接，并且由于本身就是分片传输，我们可以很轻松地借助`Stream API`来实现流式下载能力。那么本文就以`WebRTC`的文件传输为基础，来实现基于`Service Worker`的大文件传输方案，文中的相关实现都在`https://github.com/WindrunnerMax/FileTransfer`中。

## Stream API
在`Fetch API`的`Response`对象中，存在`Response.body`属性用以获取响应的`ReadableStream`，而`ReadableStream`是`Stream API`中的一个接口，用以表示一个可读的流。通过这个接口我们可以实现流式的读取数据，而不需要一次性将所有数据读取到内存中，以此来渐进式地处理数据，例如在使用`fetch`实现`SSE - Server-Sent Events`的响应时，便可以通过维持长链接配合`ReadableStream`来实现数据的响应。

浏览器实现的`Stream API`中存在`ReadableStream`、`WritableStream`、`TransformStream`三种流类型，其中`ReadableStream`用以表示可读的流，`WritableStream`用以表示可写的流，而`TransformStream`用以表示可读写的流。由于在浏览器中`Stream`的实现时间与机制并不相同，`ReadableStream`的兼容性与`Fetch API`基本一致，而`WritableStream`和`TransformStream`的兼容性则相对稍差一点。

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

当然这是个错误的示例，针对于流的理解我们应该参考`Node.js`的`Stream`模块，以`node:fs`的`createReadStream`与`createWriteStream`为例，我们会更容易理解整个模型。我们的`Stream`模型是以`ReadableStream`为起始，即数据生产是以`Node.js`本身的`IO`为基础的读取文件，将内容写入到`ReadableStream`中，而我们作为数据处理者，则是在其本身的事件中进行数据处理，进而将处理后的数据写入`WritableStream`来消费，即后继的管道是以`WritableStream`为终点。

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

聊了这么多关于`Stream API`的问题，我们回到针对于`WebRTC`传递的数据实现，针对于类似`Fetch`的数据传输，是借助浏览器本身的`IO`来控制`ReadableStream`的数据生产，而我们的`WebRTC`仅仅是传输通道，因此在管道的初始数据生产时，`ReadableStream`是需要我们自己来控制的，因此我们最开始想到的`Writable -> Readable`方式，则是为了适应这部分实现。而实际上这种方式实际上更契合于`TransformStream`的模型，其本身的能力是对数据流进行转换，而我们同样可以借助`TransformStream`来实现流的读写。

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

那么在这里我们就可以实现对于`ReadableStream`的数据处理，在基于`WebRTC`的数据传输实现中，我们可以获取到`DataChannel`的数据流本身，那么此时我们就可以通过`ReadableStream`的`Controller`来向缓冲队列中置入数据，以此来实现数据的写入，而后续的数据消费则可以使用`ReadableStream`的`Reader`来实现，这样我们就可以借助缓冲队列实现流式的数据传输。

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

那么在这里我们可以思考一个问题，如果此时我们的`DataChannel`的数据流的传输速度非常快，也就是不断地将数据`enqueue`到队列当中，而假如此时我们的消费速度非常慢，例如我们的硬盘写入速度比较慢，那么数据的队列就会不断增长，那么就可能导致内存溢出。实际上这个问题有专业的术语来描述，即`Back Pressure`背压问题，在`ReadableStream`中我们可以通过`controller.desiredSize`来获取当前队列的大小，以此来控制数据的生产速度，以此来避免数据的积压。

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



Channel Transferable_objects


## Service Worker

拦截 fetch

return ;

HTML HTML Worker

BASE64 Uint8Array Uint32Array 体积问题

## Fetch

ReadableStream

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
https://developer.mozilla.org/en-US/docs/Web/API/Streams_API
https://nodejs.org/docs/latest/api/stream.html#types-of-streams
https://developer.mozilla.org/en-US/docs/Web/API/TransformStream
https://help.aliyun.com/zh/oss/user-guide/map-custom-domain-names-5
https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/a#download
https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Disposition
https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
```