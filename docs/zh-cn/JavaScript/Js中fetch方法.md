# Js中fetch方法
`fetch()`方法定义在`Window`对象以及`WorkerGlobalScope`对象上，用于发起获取资源的请求，其返回一个`Promise`对象，这个`Promise`对象会在请求响应后被`resolve`，并传回`Response`对象。

## 概述
`Promise<Response> fetch(input[, init])`  

`input`: 定义要获取的资源，其值可以是：
* 一个字符串，包含要获取资源的`URL`，一些浏览器会接受 `blob`和`data`作为`schemes`。
* 一个`Request`对象。  

`init`: 一个配置项对象，包括所有对请求的设置。可选的参数有：
* `method`: 请求使用的方法，如`GET`、`POST`。
* `headers`: 请求的头信息，形式为`Headers`的对象或包含`ByteString`值的对象字面量。
* `body`: 请求的`body`信息：可能是一个`Blob`、`BufferSource`、`FormData`、`URLSearchParams`或者`USVString`对象，注意`GET`或`HEAD`方法的请求不能包含`body`信息。
* `mode`: 请求的模式，如`cors`、`no-cors`或者`same-origin`。
* `credentials`: 请求的`credentials`，如`omit`、`same-origin`或者`include`，为了在当前域名内自动发送`cookie`，必须提供这个选项。
* `cache`: 请求的`cache`模式: `default`、`no-store`、`reload`、`no-cache`、`force-cache`或者`only-if-cached`。
* `redirect`: 可用的`redirect`模式: `follow`自动重定向，`error`如果产生重定向将自动终止并且抛出一个错误，或者`manual`手动处理重定向。
* `referrer`: 一个`USVString`可以是`no-referrer`、`client`或一个`URL`，默认是 `client`。
* `referrerPolicy`: 指定了`HTTP`头部`referer`字段的值，可能为以下值之一： `no-referrer`、`no-referrer-when-downgrade`、`origin`、`origin-when-cross-origin`、`unsafe-url`。
* `integrity`: 包括请求的`subresource integrity`值，例如: `sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=`。

返回一个`Promise`，`resolve`时回传`Response`对象。

## fetch与jQuery.ajax区别
* 当接收到一个代表错误的`HTTP`状态码时，从`fetch()`返回的`Promise`不会被标记为 `reject`，即使响应的`HTTP`状态码是`404`或`500`，其会将`Promise`状态标记为 `resolve`，但是返回的`Promise`会将`resolve`的返回值的`ok`属性设置为`false`，仅当网络故障时或请求被阻止时，才会标记为`reject`。
* `fetch()`不会接受跨域`cookies`，你也不能使用`fetch()`建立起跨域会话，其他域的`Set-Cookie`头部字段将会被无视。
* `fetch()`不会发送`cookies`，除非使用了`credentials`的初始化选项。

## 实例

### 发起请求
发起一个简单的资源请求，对于`fetch`请求返回一个`Promise`对象，这个`Promise`对象会在请求响应后被`resolve`，并传回`Response`对象。

```javascript
window.fetch("https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js")
.then(res => console.log(res))
```
### 设置参数

通过`init`配置对象设置参数，可以设置`method`、`headers`、`body`、`mode`、`credentials`、`cache`、`redirect`、`referrer`、`referrerPolicy`、`integrity`。

```javascript
var headers = new Headers({
    "accept": "application/javascript" 
});
headers.append("accept", "application/xml");
headers.set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36");
window.fetch("https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js", {
    method: "GET",
    headers: headers,
    cache: 'no-cache',
})
.then(res => console.log(res))
```

#### Headers对象
* `Headers.append()`: 给现有的`header`添加一个值, 或者添加一个未存在的`header`并赋值。
* `Headers.delete()`: 从`Headers`对象中删除指定`header`。
* `Headers.entries()`: 以迭代器的形式返回`Headers`对象中所有的键值对。
* `Headers.get()`: 以`ByteString`的形式从`Headers`对象中返回指定header的全部值。
* `Headers.has()`: 以布尔值的形式从`Headers`对象中返回是否存在指定的`header`。
* `Headers.keys()`: 以迭代器的形式返回`Headers`对象中所有存在的`header`名。
* `Headers.set()`: 替换现有的`header`的值, 或者添加一个未存在的`header`并赋值。
* `Headers.values()`: 以迭代器的形式返回`Headers`对象中所有存在的`header`的值。


### 响应处理

通过`Response`对象对响应的数据作处理，包括获取响应状态以及响应体的处理等操作。

```javascript
window.fetch("https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js")
.then(res => res.text())
.then(data => console.log(data))
```

#### Response对象
`Response`对象的相关属性与方法：
* `Response.headers`: 只读，包含此`Response`所关联的`Headers`对象。
* `Response.ok`: 只读，包含了一个布尔值，标示该`Response`成功，`HTTP`状态码的范围在 `200-299`。
* `Response.redirected`: 只读，表示该`Response`是否来自一个重定向，如果是的话，它的`URL`列表将会有多个条目。
* `Response.status`: 只读，包含`Response`的状态码。
* `Response.statusText`: 只读，包含了与该`Response`状态码一致的状态信息。
* `Response.type`: 只读，包含`Response`的类型，例如`basic`、`cors`。
* `Response.url`: 只读，包含`Response`的`URL`。
* `Response.useFinalURL`: 包含了一个布尔值，来标示这是否是该`Response`的最终`URL`。
* `Response.clone()`: 创建一个`Response`对象的克隆。
* `Response.error()`: 返回一个绑定了网络错误的新的`Response`对象。
* `Response.redirect()`: 用另一个`URL`创建一个新的`Response`。

`Response`实现了`Body`接口，相关属性与方法可以直接使用：
* `Body.body`: 只读，一个简单的`getter`，用于暴露一个`ReadableStream`类型的`body`内容。
* `Body.bodyUsed`: 只读，包含了一个布尔值来标示该`Response`是否读取过`Body`。
* `Body.arrayBuffer()`: 读取`Response`对象并且将它设置为已读，并返回一个被解析为`ArrayBuffer`格式的`Promise`对象，`Responses`对象被设置为了`stream`的方式，所以它们只能被读取一次。
* `Body.blob()`: 
读取`Response`对象并且将它设置为已读，并返回一个被解析为`Blob`格式的`Promise`对象。
* `Body.formData()`: 
读取`Response`对象并且将它设置为已读，并返回一个被解析为`FormData`格式的`Promise`对象。
* `Body.json()`: 
读取`Response`对象并且将它设置为已读，并返回一个被解析为`JSON`格式的`Promise`对象。
* `Body.text()`: 
读取`Response`对象并且将它设置为已读，并返回一个被解析为`USVString`格式的`Promise`对象。



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://segmentfault.com/a/1190000012740215
https://developer.mozilla.org/zh-CN/docs/Web/API/Headers
https://developer.mozilla.org/zh-CN/docs/Web/API/Response
https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API
https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch
https://developer.mozilla.org/zh-CN/docs/Web/API/WindowOrWorkerGlobalScope/fetch
```
