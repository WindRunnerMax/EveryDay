# Shadow DOM的理解
`Shadow DOM`是`HTML`的一个规范，其允许在文档`document`渲染时插入一颗`DOM`元素子树，但是这棵子树不在主`DOM`树中，`Shadow DOM`如果按照英文翻译的话可以翻译为影子`DOM`，是一种不属于主`DOM`树的独立的结构。

## 概述
`Web components`的一个重要属性是封装——可以将标记结构、样式和行为隐藏起来，并与页面上的其他代码相隔离，保证不同的部分不会混在一起，可使代码更加干净、整洁，在这里`Shadow DOM`接口是关键所在，它可以将一个隐藏的、独立的`DOM`附加到一个元素上，`Shadow DOM`标准允许你为你自己的元素`custom element`维护一组`Shadow DOM`。  
`Shadow DOM`允许将隐藏的`DOM`树附加到常规的`DOM`树中，它以`shadow root`节点为起始根节点，在这个根节点的下方，可以是任意元素，和普通的`DOM`元素一样，另外还有一些`Shadow DOM`特有的术语。  

* `Shadow host`: 一个常规`DOM`节点，`Shadow DOM`会被附加到这个节点上。
* `Shadow tree`: `Shadow DOM`内部的`DOM`树。
* `Shadow boundary`: `Shadow DOM`结束的地方，也是常规`DOM`开始的地方。
* `Shadow root`: `Shadow tree`的根节点。

我们可以使用同样的方式来操作`Shadow DOM`，就和操作常规`DOM`一样——例如添加子节点、设置属性，以及为节点添加自己的样式(例如通过`element.style`属性），或者为整个`Shadow DOM`添加样式(例如在`<style>`元素内添加样式)，不同的是`Shadow DOM`内部的元素始终不会影响到它外部的元素(除了`:focus-within`)，这就为封装提供了便利。  
此外不管从哪个方面来看`Shadow DOM`都不是一个新事物，在过去的很长一段时间里，浏览器用它来封装一些元素的内部结构，以一个有着默认播放控制按钮的`<video>`元素为例，我们所能看到的只是一个`<video>`标签，实际上，在它的`Shadow DOM`中，包含来一系列的按钮和其他控制器。再举一个例子我们都知道像`React`或`Vue`这样的都有组件的概念，我们常用的`<input>`、`<audio>`、`<video>`等这些元素，其实它也是以组件的形式存在的，即`HTML Web Component`这些都有自己的`Shadow DOM`，这些组件内部是由自身的一些`HTML`标签组成的。  
现代浏览器`Firefox`、`Chrome`、`Opera`和`Safari`等默认支持`Shadow DOM`，基于`Chromium`的新`Edge`也支持`Shadow DOM`，而旧`Edge`未能撑到支持此特性，至于`IE`浏览器嘛`...`，兼容性方面可以查阅此处`https://caniuse.com/?search=Shadow%20DOM`。

## 示例

```html
<!DOCTYPE html>
<html>

<head>
    <title>Shadow DOM</title>
    <style>
        .text{
            color: blue; /* 设置字体颜色 */ /* 可以看出在外部定义的样式无法影响到影子内部元素样式 */
        }
    </style>
</head>

<body>
    <div id="app">
        <div class="shadow-cls"></div>
    </div>
</body>

<script type="text/javascript">
    (function(doc, win){
        var shadowHost = doc.querySelector(".shadow-cls"); // 获取影子宿主shadow host
        var shadowRoot = shadowHost.attachShadow({mode: "open"}); // 创建(附加)影子shadow root // open 表示可以通过页面内的 JavaScript 方法来获取 Shadow DOM
        var style = doc.createElement("style"); // 创建style元素
        style.textContent = `
            .text{
                font-style: italic;
            }
        `; // 影子内部样式
        const template = `
          <div>
              <div class="text">Text</div>
          </div>
        `; // 模板 // 另外可以尝试 <template> 以及 <script text/template>
        const container = doc.createElement("div"); // 创建容器
        container.innerHTML = template; // 加入容器
        shadowRoot.append(style, container); // 加入影子
    })(document, window);
</script>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://segmentfault.com/a/1190000017970486
https://www.cnblogs.com/tugenhua0707/p/10545179.html
https://developer.mozilla.org/zh-CN/docs/Web/Web_Components/Using_shadow_DOM
```