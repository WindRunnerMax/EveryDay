# Js文件异步加载
浏览器中渲染引擎与`Js`脚本引擎是互斥的，在浏览器开始渲染页面时，如果遇到`<script>`标签，会停止渲染当前页面，也就是说在脚本加载与执行的过程中会阻塞页面的渲染，在网速较差的环境下可能会出现浏览器页面假死的情况，这也就是尽量将`<script>`文件放置于`<body>`后的原因，`Js`文件异步加载就是使浏览器加载外部`Js`脚本文件时不阻塞渲染线程，这称为非阻塞模式加载，当然加载完成之后解析执行`Js`脚本时必须与渲染引擎互斥，解析执行`Js`脚本的时机取决于异步加载`Js`的方式。

## defer
`defer`是早期`IE`支持的属性，目前主流浏览器都已经支持，该属性会使浏览器开启一个线程去加载`Js`并且会在`DOM`结构解析完成之后再执行。
* `defer`只适用于外联脚本。
* 如果有多个声明了`defer`的脚本，则会按顺序下载和执行。
* `defer`脚本会在`onDOMContentLoaded`之后和`onload`事件之前执行。

```html
<!-- 兼容性 https://caniuse.com/#feat=script-defer -->
<script type="text/javascript" defer="defer" src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js" ></script>
```

## async
`HTML5`为`<script>`元素定义了`async`属性，目前主流浏览器都已经支持，该属性会使浏览器开启一个线程去加载`Js`并且会在下载完后立即执行。
* `async`只适用于外联脚本。
* 如果有多个声明了`async`的脚本，其下载和执行也是异步的，不能确保彼此的先后顺序。
* `async`会在`onload`事件之前执行，但并不能确保与`DOMContentLoaded`的执行先后顺序。

```html
<!-- 兼容性 https://caniuse.com/#feat=script-async -->
<script type="text/javascript" async="async" src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js" ></script>
``` 

## Script DOM Element
`Script DOM Element`的方式即动态插入一个`<script>`标签来加载外部`Js`脚本文件，将其作为`onload`事件的回调函数，即在页面加载完成后再执行，这样就不会阻塞渲染线程。

```javascript
window.onload = function(){
    var script= document.createElement('script'); 
    script.type = 'text/javascript'; 
    script.src ="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js"; 
    var body= document.getElementsByTagName('body')[0]; 
    body.appendChild(script);
}
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://segmentfault.com/a/1190000006778717
https://www.cnblogs.com/jiasm/p/7683930.html
https://blog.csdn.net/qq_41245969/article/details/82428464
```
