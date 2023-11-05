# Location对象
`Location`对象表示其链接到的对象的位置`URL`，所做的修改反映在与之相关的对象上。`Document`和`Window`对象都有这样一个链接到`Location`，分别通过`document.location`和`window.location`访问。

## 属性
* `location.href`: 包含整个`URL`的一个`DOMString`，`DOMString`是一个`UTF-16`字符串，由于`JavaScript`已经使用了这样的字符串，所以`DOMString`直接映射到一个`String`。
* `location.protocol`: 包含`URL`对应协议的一个`DOMString`，最后有一个`:`。
* `location.host`: 包含了域名的一个`DOMString`，可能在该串最后带有一个`:`并跟上`URL`的端口号。
* `location.hostname`: 包含`URL`域名的一个`DOMString`。
* `location.port`: 包含端口号的一个`DOMString`。
* `location.pathname`: 包含`URL`中路径部分的一个`DOMString`，开头有一个`/`。
* `location.search`: 包含`URL`参数的一个`DOMString`，开头有一个`?`。
* `location.hash`: 包含块标识符的`DOMString`，开头有一个`#`。
* `location.origin`: 只读，包含页面来源的域名的标准形式`DOMString`。
* `location.ancestorOrigins`: 只读，返回结构是静态`DOMStringList`，以相反的顺序包含与给定`Location`对象关联的文档的所有祖先浏览上下文的来源，可以根据`location.ancestorOrigins`来确定某个站点构架了`iframe`文档，该属性目前尚在提案中。

## 方法
* `location.assign()`: 加载给定`URL`的内容资源到这个`Location`对象所关联的对象上，即用来加载一个新文档。
* `location.reload()`: 重新加载来自当前`URL`的资源，其有一个特殊的可选参数，类型为`Boolean`，该参数为`true`时会导致该方法引发的刷新一定会从服务器上加载数据，如果是`false`或没有指定这个参数，浏览器可能从缓存当中加载页面。
* `location.replace()`: 用给定的`URL`替换掉当前的资源，与`assign()`方法不同的是用`replace()`替换的新页面不会被保存在会话的历史`History`中，这意味着用户将不能用后退按钮转到该页面。
* `location.toString()`: 返回一个`DOMString`，包含整个`URL`，它和读取`location.href`的效果相同，但是用它是不能够修改`location`的值的。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/API/Location
```

