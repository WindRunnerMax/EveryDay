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

在最开始接触`Stream API`的时候，

Channel Transferable_objects

## Service Worker

拦截 fetch

return ;

HTML HTML Worker

## Fetch


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
https://developer.mozilla.org/en-US/docs/Web/API/TransformStream
https://help.aliyun.com/zh/oss/user-guide/map-custom-domain-names-5
https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/a#download
https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Disposition
https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects
```