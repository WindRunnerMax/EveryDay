# CSS引入的方式
将`CSS`作用到`HTML`主要有四种方式，分别为`HTML`元素添加内联样式、`<style>`标签嵌入样式、`<link>`标签引入外部样式、`@import`导入外部样式。

## 内联方式

```html
<div style="color: red"></div>
```
### 特点
* 不需要额外的`HTTP`请求。
* 适合`HTML`电子邮件与富文本编辑器的使用。
* 内联样式比外部样式具有更高的优先级，可以覆盖外部样式。
* 可以在不更改直接主`CSS`样式表的情况下更改样式，直接将规则添加到元素。
* 适合于动态样式，对于每个元素的样式都不同的情况可以直接将样式作用到单个元素。

### 不足
* 页面维护可能会非常棘手
* 过多添加同样的样式会导致页面复杂

## 嵌入方式

```html
<style type="text/css">
    div {
        color: blue;
    }
</style>
```

### 特点
* `CSS`与`HTML`一起作为一个文件，不需要额外的`HTTP`请求
* 适合于动态样式，对于不同的用户从数据库加载不同样式嵌入到页面

### 不足
* 嵌入样式不能被浏览器缓存并重新用于其他页面


## 链接方式
```html
<link rel="stylesheet" href="Path To stylesheet.css">
```

### 特点
* 可以通过替换`CSS`文件以改变网站的主题。
* 只需在单个`CSS`文件中进行一次更改，所有网站页面都会更新。
* 多个页面请求的网站速度有所提高，`CSS`在第一次访问时就被浏览器缓存。

### 不足
* 每个链接的`CSS`文件都需要一个附加的`HTTP`请求

## 导入方式
```html
<style>
    @import url("Path To stylesheet.css");
</style>
```

### 特点
* 在不更改`HTML`标签的情况下添加新的`CSS`文件

### 不足
* 需要额外的`HTTP`请求

## link与@import差异
* `<link>`属于`HTML`提供的标签，`@import`属于`CSS`语句，值得注意的是`@import`导入语句需要写在`CSS`样式表的开头，否则无法正确导入外部文件。
* `@import`是`CSS2.1`才出现的概念，所以如果浏览器版本较低例如`IE4`与`IE5`等，无法正确导入外部样式文件，当然也可以利用这一点来隐藏对于这些旧版本的浏览器的`CSS2`规则。
* 当`HTML`文件被加载时，`<link>`引用的文件会同时被加载，而`@import`引用的文件则会等页面全部下载完毕再被加载，所以有时候浏览`@import`加载`CSS`的页面时会没有样式，也就是闪烁现象，网速慢的时候就比较明显。
* 使用`<link>`标签可以设定`rel`属性，当`rel`为`stylesheet`时表示将样式表立即应用到文档，为`alternate stylesheet`时表示为备用样式表，不会立即作用到文档，可以通过`JavaScript`取得`<link>`标签对象，通过设置`disabled`来实现样式表的立即切换，可用作切换主题等功能，而`@import`不属于`DOM`无法使用`JavaScript`来直接控制。
* `<link>`与`@import`混用可能会对网页性能有负面影响，在一些低版本`IE`中`<link>`与`@import`混用会导致样式表文件逐个加载，破坏并行下载的方式导致页面加载变慢。此外无论是哪种浏览器，若在`<link>`中引入的`CSS`中继续使用`@import`加载外部`CSS`，同样会导致顺序加载而不是并行加载，因为浏览器需要先解析`<link>`引入的`CSS`发现`@import`外部`CSS`后再次引入外部`CSS`，这样就导致页面加载变慢。


## 参考

```
https://alistapart.com/article/alternate/
https://matthewjamestaylor.com/add-css-to-html
https://www.runoob.com/w3cnote/html-import-css-method.html
http://www.stevesouders.com/blog/2009/04/09/dont-use-import/
https://stackoverflow.com/questions/1022695/difference-between-import-and-link-in-css
```
