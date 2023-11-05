# Navigator对象
`Navigator`对象表示用户代理的状态和标识，其允许脚本查询它和注册自己进行一些活动，可以使用只读的`window.navigator`属性取得实例化的`navigator`对象的引用。

## 属性
* `navigator.connection`: 只读，提供一个`Network Information`对象，该对象包含有关设备网络连接的信息。
* `navigator.cookieEnabled`: 只读，如果启用`cookie`则返回`true`，否则返回`false`。
* `navigator.credentials`: 只读，返回`Credentials Container`接口，该接口公开请求凭证的方法，并在发生制定的事件(如成功登录或签入)时通知用户代理。
* `navigator.geolocation`: 只读，返回允许访问设备位置的地理位置对象。
* `navigator.hardwareConcurrency`: 只读，返回可用的逻辑处理器内核数，使用`navigator.hardwareConcurrency`直接调用即可。
* `navigator.language`: 只读，返回表示用户首选语言(通常是浏览器`UI`的语言)的`DOMString`，未知时返回空值。
* `navigator.maxTouchPoints`: 只读，返回当前设备支持的最大同时接触点数。
* `navigator.mediaDevices`: 只读，返回对`MediaDevices`对象的引用，该对象可用于获取有关可用媒体设备的信息。
* `navigator.mimeTypes`: 只读，返回`MimeTypeArray`对象，该对象包含表示浏览器识别的`MIME`类型的`MimeType`对象列表。
* `navigator.onLine`: 只读，返回一个布尔值，指示浏览器是否正在联机工作。
* `navigator.plugins`: 只读，返回一个`PluginArray`对象，列出了描述应用程序中安装的插件的插件对象。
* `navigator.serviceWorker`: 只读，返回`ServiceWorkerContainer`对象，该对象提供对注册、删除、升级以及与相关文档的`ServiceWorker`对象通信的访问。
* `navigator.storage`: 只读，返回单例`StorageManager`对象，该对象用于访问当前站点或应用程序的浏览器的整体存储功能，返回的对象使您可以检查和配置数据存储的持久性，并大致了解浏览器还有多少空间可用于本地存储，需要在`HTTPS Secure context`环境下使用。
* `navigator.userAgent`: 只读，返回当前浏览器的用户代理字符串。
* `navigator.vendor`: 只读，返回当前浏览器的供应商名称。


## 方法
* `navigator.javaEnabled()`: 该方法返回一个布尔值，表明主机浏览器是否启用了`java`。
* `navigator.registerProtocolHandler(scheme, url)`: 该方法允许网站注册它们打开或处理特定`URL`方案(又名协议)的能力。
* `navigator.requestMediaKeySystemAccess(keySystem, supportedConfigurations)`: 该方法返回一个`Promise`，该`Promise`传递一个`MediaKeySystemAccess`对象，该对象可用于访问特定的媒体密钥系统，而该系统又可用于创建用于解密媒体流的密钥，此方法是加密媒体扩展`API`的一部分，它为`WEB`提供了对加密媒体和受`DRM`保护的视频的支持，需要在`HTTPS Secure context`环境下使用。
* `navigator.sendBeacon(url, data)`: 该方法通过`HTTP`异步地向`web`服务器发送少量数据，它的目的是与`visibilitychange`事件一起使用(但不是与`unload`和`beforeunload`事件一起使用)。
* `navigator.share(data)`: 该方法调用设备的本机共享机制，需要在`HTTPS Secure context`环境下使用。
* `navigator.vibrate(pattern)`: 方法在设备上触发振动硬件(如果存在)，如果设备不支持振动，则此方法无效，如果在调用此方法时已经在进行振动模式，则将暂停先前的模式，然后开始新的模式。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/API/navigator
```

