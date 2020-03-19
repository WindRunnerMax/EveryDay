# iframe框架及优缺点

`HTML5`不再支持使用`frame`，关于`frame`与`iframe`的区别，可以参阅  [iframe与frame的区别](https://www.cnblogs.com/songzhixue/p/11261118.html)  

## 基本使用
* `src`：规定在`iframe`中显示的文档的`URL`。
* `frameborder`：规定是否显示框架周围的边框。
* `scrolling`：规定是否在 iframe 中显示滚动条。
* `width`：规定`iframe`的宽度，建议使用`CSS`替代。
* `height`：规定`iframe`的高度，建议使用`CSS`替代。
* `sandbox`：启用一系列对`iframe`中内容的额外限制。
* `marginwidth`：定义`iframe`的左侧和右侧的边距。
* `marginheight`：定义`iframe`的顶部和底部的边距。
* `srcdoc`：规定在`iframe`中显示的页面的`HTML`内容。
* `align`：规定如何根据周围的元素来对齐此框架，建议使用样式替代。

## 使用场景

### 加载其他域的网页
`<iframe>`是允许跨域请求资源的，但是不能够修改，由此可以在网页中嵌套其他网页，如需要跨域通信的话，需要考虑`document.domain`、`window.name`、`window.postMessage`。

### 典型系统结构
典型的系统结构，左侧是功能树，上部为个人信息，右侧就是实际功能，使用`iframe`将功能单独分离出来，当然也可以使用`vue`和`react`进行实现。

### 实现Ajax
可以使用`iframe`进行实现异步请求发送，来模拟`Ajax`的请求操作，`Ajax`的异步请求完成操作为`XHR.readyState === 4`执行`callback`，`iframe`使用`iframe.onload`执行`callback`，还可以实现一个轮询长连接。

### 加载广告
广告是与原文无关的，假如硬编码进去，会造成网页布局的紊乱,而且这样势必需要引入额外的`css`和`js`文件，极大的降低了网页的安全性，使用`iframe`便可以解决这些问题。

### 提交表单
可以使用`iframe`提交表单来避免整个页面的刷新，还可以实现无刷新文件上传的操作。

## 优缺点

### 优点
1. 可以跨域请求其他网站，并将网站完整展示出来
2. 典型系统结构可以提高代码的复用性
3. 创建一个全新的独立的宿主环境，可以隔离或者访问原生接口及对象
4. 模块分离，若多个页面引用同一个`iframe`，则便于修改操作
5. 实现广告展示的一个解决方案
6. 若需要刷新`iframe`则只需要刷新框架内，不需要刷新整个页面

### 缺点
1. `iframes`阻塞页面加载，影响网页加载速度，`iframe`加载完毕后才会触发`window.onload`事件，动态设置`src`可解决这个问题。
2. 加载了新页面，增加了`css`与`js`文件的请求，即额外增加了`HTTP`请求，增加了服务器负担。
3. 有时`iframe`由于页面挤占空间的原因出现滚动条，造成布局混乱。
4. 不利于`SEO`，搜索引擎的爬虫无法解读`iframe`的页面。
5. 有些小型的移动设备如手机等无法完全显示框架，兼容性较差。
6. `iframe`与主页面是共享链接池的，若`iframe`加载时用光了链接池，则会造成主页面加载阻塞。


## 参考

```
https://www.zhihu.com/question/20653055
https://www.cnblogs.com/hq233/p/9849939.html
https://blog.csdn.net/baxiadsy_csdn/article/details/86245809
```
