# SVG与foreignObject元素
可缩放矢量图形`Scalable Vector Graphics - SVG`基于`XML`标记语言，用于描述二维的矢量图形。作为一个基于文本的开放网络标准，`SVG`能够优雅而简洁地渲染不同大小的图形，并和`CSS`、`DOM`、`JavaScript`等其他网络标准无缝衔接。`SVG`图像及其相关行为被定义于`XML`文本文件之中，这意味着可以对其进行搜索、索引、编写脚本以及压缩，此外这也意味着可以使用任何文本编辑器和绘图软件来创建和编辑`SVG`。

## SVG
`SVG`是可缩放矢量图形`Scalable Vector Graphics`的缩写，其是一种用于描述二维矢量图形的`XML`可扩展标记语言标准，与基于像素的图像格式(如`JPEG`和`PNG`)不同，`SVG`使用数学方程和几何描述来定义图像，这使得其能够无损地缩放和调整大小，而不会失真或模糊。`SVG`图像由基本形状(如线段、曲线、矩形、圆形等)和路径组成，还可以包含文本、渐变、图案和图像剪裁等元素。`SVG`图形可以使用文本编辑器手动创建，也可以使用专业的矢量图形编辑软件生成，其可以在Web页面上直接嵌入，也可以通过`CSS`样式表和`JavaScript`进行控制和交互，由于`SVG`图形是基于矢量的，因此在放大或缩小时不会失去清晰度，这使得`SVG`在响应式设计、图标、地图、数据可视化和动画等领域中非常有用。此外`SVG`还兼容支持各种浏览器，并且可以与其他`Web`技术无缝集成。

`SVG`有着诸多优点，并且拥有通用的标准，但是也存在一些限制，那么在这里我们主要讨论`SVG`中`text`元素也就是文本元素的一些局限。`SVG`的`text`元素提供了基本的文本渲染功能，可以在指定位置绘制单行或多行文本，然而`SVG`并没有提供像`HTML`和`CSS`中的强大布局功能，比如文本自动换行、对齐方式等，这意味着在`SVG`中实现复杂的文本布局需要手动计算和调整位置。此外`SVG`的`text`元素支持一些基本的文字样式属性，如字体大小、颜色、字体粗细等，然而相对于`CSS`提供的丰富样式选项，`SVG`的文字样式相对有限，例如无法直接设置文字阴影、文字间距等效果等。

实际上在平时使用中我们并不需要关注这些问题，但是在一些基于`SVG`的可视化编辑器中比如`DrawIO`中这些就是需要重视的问题了，当然现在可能可视化编辑更多的会选择使用`Canvas`来实现，但是这个复杂度非常高，就不在本文讨论范围内了。那么如果使用`text`来绘制文本在日常使用中最大的问题实际上就是文本的换行，如果只是平时人工来绘制`SVG`可能并没有什么问题，`text`同样提供了大量的属性来展示文本，但是想做一个通用的解决方案可能就麻烦一点了，举个例子如果我想批量生成一些`SVG`，那么人工单独调整文本是不太可能的，当然在这个例子中我们还是可以批量去计算文字宽度来控制换行的，但是我们更希望的是有一种通用的能力来解决这个问题。我们可以先来看看文本溢出不自动换行的例子:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
  <g>
    <rect width="200" height="100" fill="lightgray" />
    <text x="10" y="20" font-size="12" fill="black">
      This is a long text that cannot automatically wrap within the rectangle.
    </text>
  </g>
</svg>
```

在这个例子中，`text`元素是无法自动换行的，即使在`text`元素上添加`width`属性也是无法实现这个效果的。此外`<text>`标签不能直接放在`<rect>`标签内部，其具有严格的嵌套规则，`<text>`标签是一个独立的元素，用于在`SVG`画布上绘制文本，而`<rect>`标签是用于绘制矩形的元素，所以绘制的矩形并没有限制文本展示范围，但是实际上这个文本的长度是超出了整个`SVG`元素设置的`width: 300`，也就是说这段文本实际上是没有能够完全显示出来，其并没有能够自动换行。如果想实现换行效果，则必须要自行计算文本长度与高度进行切割来计算位置:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
  <g>
    <rect width="200" height="100" fill="lightgray" />
    <text x="10" y="20" font-size="12" fill="black">
      <tspan x="10" dy="1.2em">This is a long text that</tspan>
      <tspan x="10" dy="1.2em">cannot automatically wrap </tspan>
      <tspan x="10" dy="1.2em">within the rectangle.</tspan>
    </text>
  </g>
</svg>
```

## foreignObject元素
那么如果想以比较低的成本实现接近于`HTML`的文本绘制体验，可以借助`foreignObject`元素，`<foreignObject>`元素允许在`SVG`文档中嵌入`HTML`、`XML`或其他非`SVG`命名空间的内容，也就是说我们可以直接在`SVG`中嵌入`HTML`，借助`HTML`的能力来展示我们的元素，例如上边的这个例子，我们就可以将其改造为如下的形式:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
  <g>
    <rect width="200" height="100" fill="lightgray" />
    <foreignObject x="10" width="180" height="80">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <p>This is a long text that will automatically wrap within the rectangle.</p>
      </div>
    </foreignObject>
  </g>
</svg>
```

当我们打开`DrawIO`绘制流程图时，其实也能发现其在绘制文本时使用的就是`<foreignObject>`元素，当然`DrawIO`为了更通用的场景做了很多兼容处理，特别是表现在行内样式上，类似于上述例子中的`SVG`在`DrawIO`表现出来是如下的示例，需要注意的是，直接从`DrawIO`导出的当前这个文件需要保存为`.html`文件而不是`.svg`文件，因为其没有声明命名空间，如果需要要保存为`.svg`文件并且能够正常展示的话，需要在`svg`元素上加入`xmlns="http://www.w3.org/2000/svg"`命名空间声明，但是仅仅加上这一个声明是不够的，如果此时打开`.svg`文件发现只展示了矩形而没有文字内容，此时我们还需要在`<foreignObject>`元素的第一个`<div>`上加入`xmlns="http://www.w3.org/1999/xhtml"`的命名空间声明，此时就可以将矩形与文字完整地表现出来。

```xml
<svg xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="263px" height="103px" viewBox="-0.5 -0.5 263 103"><defs></defs><g><rect x="1" y="1" width="260" height="100" fill="#ffffff" stroke="#000000" pointer-events="all"></rect><g transform="translate(-0.5 -0.5)"><switch><foreignObject style="overflow: visible; text-align: left;" pointer-events="none" width="100%" height="100%" requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"><div style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 258px; height: 1px; padding-top: 51px; margin-left: 2px;"><div style="box-sizing: border-box; font-size: 0; text-align: center; "><div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; "><div><span>This is a long text that will automatically wrap within the rectangle.</span></div></div></div></div></foreignObject><text x="131" y="55" fill="#000000" font-family="Helvetica" font-size="12px" text-anchor="middle">This is a long text that will automatically...</text></switch></g></g><switch><g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"></g><a transform="translate(0,-5)" xlink:href="https://desk.draw.io/support/solutions/articles/16000042487" target="_blank"><text text-anchor="middle" font-size="10px" x="50%" y="100%">Viewer does not support full SVG 1.1</text></a></switch></svg>
```



SVG text元素的不足
foreignObject元素 绘制文本 DrawIO SVG Sharp/Node-Canvas/Puppeteer
DOM TO IMAGE



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://github.com/jgraph/drawio
https://github.com/pbakaus/domvas
https://github.com/puppeteer/puppeteer
https://developer.mozilla.org/zh-CN/docs/Web/SVG
https://zzerd.com/blog/2021/04/10/linux/debian_install_puppeteer
https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/foreignObject
https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
```
