# SVG与foreignObject元素
可缩放矢量图形`Scalable Vector Graphics - SVG`基于`XML`标记语言，用于描述二维的矢量图形。作为一个基于文本的开放网络标准，`SVG`能够优雅而简洁地渲染不同大小的图形，并和`CSS`、`DOM`、`JavaScript`等其他网络标准无缝衔接。`SVG`图像及其相关行为被定义于`XML`文本文件之中，这意味着可以对其进行搜索、索引、编写脚本以及压缩，此外这也意味着可以使用任何文本编辑器和绘图软件来创建和编辑`SVG`。

## SVG
`SVG`是可缩放矢量图形`Scalable Vector Graphics`的缩写，其是一种用于描述二维矢量图形的`XML`可扩展标记语言标准，与基于像素的图像格式(如`JPEG`和`PNG`)不同，`SVG`使用数学方程和几何描述来定义图像，这使得其能够无损地缩放和调整大小，而不会失真或模糊。`SVG`图像由基本形状(如线段、曲线、矩形、圆形等)和路径组成，还可以包含文本、渐变、图案和图像剪裁等元素。`SVG`图形可以使用文本编辑器手动创建，也可以使用专业的矢量图形编辑软件生成，其可以在Web页面上直接嵌入，也可以通过`CSS`样式表和`JavaScript`进行控制和交互，由于`SVG`图形是基于矢量的，因此在放大或缩小时不会失去清晰度，这使得`SVG`在响应式设计、图标、地图、数据可视化和动画等领域中非常有用。此外`SVG`还兼容支持各种浏览器，并且可以与其他`Web`技术无缝集成。

`SVG`有着诸多优点，并且拥有通用的标准，但是也存在一些限制，那么在这里我们主要讨论`SVG`中`text`元素也就是文本元素的一些局限。`SVG`的`text`元素提供了基本的文本渲染功能，可以在指定位置绘制单行或多行文本，然而`SVG`并没有提供像`HTML`和`CSS`中的强大布局功能，比如文本自动换行、对齐方式等，这意味着在`SVG`中实现复杂的文本布局需要手动计算和调整位置。此外`SVG`的`text`元素支持一些基本的文字样式属性，如字体大小、颜色、字体粗细等，然而相对于`CSS`提供的丰富样式选项，`SVG`的文字样式相对有限，例如无法直接设置文字阴影、文字间距等效果等。

实际上在平时使用中我们并不需要关注这些问题，但是在一些基于`SVG`的可视化编辑器中比如`DrawIO`中这些就是需要重视的问题了，当然现在可能可视化编辑更多的会选择使用`Canvas`来实现，但是这个复杂度非常高，就不在本文讨论范围内了。那么如果使用`text`来绘制文本在日常使用中最大的问题实际上就是文本的换行，如果只是平时人工来绘制`SVG`可能并没有什么问题，`text`同样提供了大量的属性来展示文本，但是想做一个通用的解决方案可能就麻烦一点了，举个例子如果我想批量生成一些`SVG`，那么人工单独调整文本是不太可能的，当然在这个例子中我们还是可以批量去计算文字宽度来控制换行的，但是我们更希望的是有一种通用的能力来解决这个问题。我们可以先来看看文本溢出不自动换行的例子:

```
-----------------------------------
| This is a long text that cannot | automatically wrap
|                                 |
|                                 |
-----------------------------------
```

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

在这个例子中，`text`元素是无法自动换行的，即使在`text`元素上添加`width`属性也是无法实现这个效果的。此外`<text>`标签不能直接放在`<rect>`标签内部，其具有严格的嵌套规则，`<text>`标签是一个独立的元素，用于在`SVG`画布上绘制文本，而`<rect>`标签是用于绘制矩形的元素，所以绘制的矩形并没有限制文本展示范围，但是实际上这个文本的长度是超出了整个`SVG`元素设置的`width: 300`，也就是说这段文本实际上是没有能够完全显示出来，从图中也可以看出`wrap`之后的文本没有了，并且其并没有能够自动换行。如果想实现换行效果，则必须要自行计算文本长度与高度进行切割来计算位置:

```
-----------------------------------
| This is a long text that        |
| cannot automatically wrap       |
| within the rectangle.           |
-----------------------------------
```

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

```
-----------------------------------
| This is a long text that        |
| will automatically wrap         |
| within the rectangle.           |
-----------------------------------
```

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

```
-----------------------------------------------------
| This is a long text that will automatically wrap  | 
|               within the rectangle.               |
-----------------------------------------------------
```

```xml
<svg
  xmlns:xlink="http://www.w3.org/1999/xlink"
  version="1.1"
  width="263px"
  height="103px"
  viewBox="-0.5 -0.5 263 103"
>
  <defs></defs>
  <g>
    <rect
      x="1"
      y="1"
      width="260"
      height="100"
      fill="#ffffff"
      stroke="#000000"
      pointer-events="all"
    ></rect>
    <g transform="translate(-0.5 -0.5)">
      <switch>
        <foreignObject
          style="overflow: visible; text-align: left;"
          pointer-events="none"
          width="100%"
          height="100%"
          requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
        >
          <div style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 258px; height: 1px; padding-top: 51px; margin-left: 2px;">
            <div style="box-sizing: border-box; font-size: 0; text-align: center; ">
              <div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">
                <div>
                  <span>
                    This is a long text that will automatically wrap within the rectangle.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </foreignObject>
        <text
          x="131"
          y="55"
          fill="#000000"
          font-family="Helvetica"
          font-size="12px"
          text-anchor="middle"
        >
          This is a long text that will automatically...
        </text>
      </switch>
    </g>
  </g>
  <switch>
    <g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"></g>
    <a
      transform="translate(0,-5)"
      xlink:href="https://desk.draw.io/support/solutions/articles/16000042487"
      target="_blank"
    >
      <text text-anchor="middle" font-size="10px" x="50%" y="100%">
        Viewer does not support full SVG 1.1
      </text>
    </a>
  </switch>
</svg>
```

看起来一切都很完美，我们既能够借助`SVG`绘制矢量图形，又能够在比较复杂的情况下借助`HTML`的能力完成需求，但是事情总有两面性，当我们在某一方面享受到便利的时候，就可能在另一处带来意想不到的麻烦。设想一个场景，假设此时我们需要在后端将`SVG`绘制出来，然后将其转换为`PNG`格式的图片给予用户下载，在前端做一些批量的操作是不太现实的，再假设我们需要将这个`SVG`绘制出来拼接到`Word`或者`Excel`中，那么这些操作都要求我们需要在后端完整地将整个图片绘制出来，那么此时我们可能会想到`node-canvas`在后端创建和操作图形，但是当我们真的使用`node-canvas`绘制我们的`SVG`图形时例如上边的`DrawIO`的例子，会发现所有的图形形状是可以被绘制出来的，但是所有的文本都丢失了，那么既然`node-canvas`做不到，那么我们可能会想到`sharp`来完成图像处理的相关功能，例如先将`SVG`转换为`PNG`，但是很遗憾的是`sharp`也做不到这一点，最终效果与`node-canvas`是一致的。

```
https://github.com/lovell/sharp/issues/3668
https://github.com/Automattic/node-canvas/issues/1325
```

那么既然需求摆在这，而业务上又非常需要这个功能，那么我们应该如何实现这个能力呢，实际上这个问题最终的结局方案反而很简单，既然这个`SVG`只能在浏览器中绘制，那么我们直接在后端运行一个`Headless Chromium`就可以了。那么此时我们就可以借助`Puppeteer`，`Puppeteer`允许我们以编程方式模拟用户在浏览器中的行为，进行网页截图、生成`PDF`、执行自动化测试、进行数据抓取等任务。那么此时我们的任务就变得简单许多了，主要的麻烦是配置环境，`Chromium`是有环境要求的，例如在`Debian`系列的最新版`Chromium`就需要`Debian 10`以上的环境，并且还需要安装依赖，可以借助`ldd xxxx/chrome | grep no`命令来检查未安装的动态链接库。如果碰到安装问题，也可以`node node_modules/puppeteer/install.js`进行重试，此外还有一些字体的问题，因为是在后端将文本渲染出来的，就需要服务器本身安装一些中文字体，例如思源`fonts-noto-cjk`、中文语言包`language-pack-zh*`等等。

那么在我们将环境搭建好了之后，后续就是要将`SVG`渲染并且转换为`Buffer`了，这个工作实际上比较简单，只需要在我们的`Headless Chromium`中将`SVG`渲染出来，并且将`ViewPort`截图即可，`Puppeteer`提供的`API`比较简单，并且方法有很多，下边是一个例子，此外`Puppeteer`能够实现的能力还有很多，比如导出`PDF`等，在这里就不展开了。

```js
const puppeteer = require('puppeteer');
// 实际上可以维护单实例的`browser`对象
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
// 同样也可以维护单实例的`page`对象
const page = await browser.newPage();
// 如果有视窗长宽的话可以直接设置 
// 否则先绘制`SVG`获取视窗长宽之后再设置视窗的大小也可以
await page.setViewport({
  width: 1000,
  height: 1000,
  deviceScaleFactor: 3, // 不设置则会导致截图模糊
});
await page.setContent(svg);
const element = await page.$('svg');
let buffer: Buffer | null = null;
if(element){
  const box = await element.boundingBox();
  if(box){
    buffer = await page.screenshot({
      clip: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      },
      type: 'png',
      omitBackground: true,
    });
  }
}
await page.close();
await browser.close();
return buffer;
```

## DOM TO IMAGE
让我们想一想，`foreignObject`元素看起来是个非常神奇的设计，通过`foreignObject`元素我们可以把`HTML`绘制到`SVG`当中，那么我们是不是可以有一个非常神奇的点子，如果我们此时需要将浏览器当中的`DOM`绘制出来，实现于类似于截图的效果，那么我我们是不是就可以借助`foreignObject`元素来实现呢。这当然是可行的，而且是一件非常有意思的事情，我们可以将`DOM + CSS`绘制到`SVG`当中，紧接着将其转换为`DATA URL`，借助`canvas`将其绘制出来，最终我们就可以将`DOM`生成图像以及导出了。

下面就是个这个能力的实现，当然在这里的实现还是比较简单的，主要处理的部分就是将`DOM`进行`clone`以及样式全部内联，由此来生成完整的`SVG`图像。实际上这其中还有很多需要注意的地方，例如生成伪元素、`@font-face`字体的声明、`BASE64`编码的内容、`img`元素到`CSS background`属性的转换等等，想要比较完整地实现整个功能还是需要考虑到很多`case`的，在这里就不涉及具体的实现了，可以参考`dom-to-image-more`。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DOM IMAGE</title>
    <style>
      #root {
        width: 300px;
        border: 1px solid #eee;
      }

      .list > .list-item {
        display: flex;
        background-color: #aaa;
        color: #fff;
        align-items: center;
        justify-content: space-between;
      }
    </style>
  </head>
  <body>
    <!-- #root START -->
    <!-- `DOM`内容-->
    <div id="root">
      <h1>Title</h1>
      <hr />
      <div>Content</div>
      <div class="list">
        <div class="list-item">
          <span>label</span>
          <span>value</span>
        </div>
        <div class="list-item">
          <span>label</span>
          <span>value</span>
        </div>
      </div>
    </div>
    <!-- #root END -->
    <button onclick="onDOMToImage()">下载</button>
  </body>
  <script>
    const cloneCSS = (target, origin) => {
      const style = window.getComputedStyle(origin);
      // 生成所有样式表
      const cssText = Array.from(style).reduce((acc, key) => {
        return `${acc}${key}:${style.getPropertyValue(key)};`;
      }, "");
      target.style.cssText = cssText;
    };

    const cloneDOM = (origin) => {
      const target = origin.cloneNode(true);
      const targetNodes = target.querySelectorAll("*");
      const originNodes = origin.querySelectorAll("*");
      // 复制根节点样式
      cloneCSS(target, origin);
      // 复制所有节点样式
      Array.from(targetNodes).forEach((node, index) => {
        cloneCSS(node, originNodes[index]);
      });
      // 去除元素的外边距
      target.style.margin =
        target.style.marginLeft =
        target.style.marginTop =
        target.style.marginBottom =
        target.style.marginRight =
          "";
      return target;
    };

    const buildSVGUrl = (node, width, height) => {
      const xml = new XMLSerializer().serializeToString(node);
      const data = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                    <foreignObject width="100%" height="100%">
                        ${xml}
                    </foreignObject>
                </svg>
            `;
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data);
    };

    const onDOMToImage = () => {
      const origin = document.getElementById("root");
      const { width, height } = root.getBoundingClientRect();
      const target = cloneDOM(origin);
      const data = buildSVGUrl(target, width, height);
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = data;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        // 值越大像素越高
        const ratio = window.devicePixelRatio || 1;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        const ctx = canvas.getContext("2d");
        ctx.scale(ratio, ratio);
        ctx.drawImage(image, 0, 0);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "image.png";
        a.click();
      };
    };
  </script>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://github.com/jgraph/drawio
https://github.com/pbakaus/domvas
https://github.com/puppeteer/puppeteer
https://www.npmjs.com/package/dom-to-image-more
https://developer.mozilla.org/zh-CN/docs/Web/SVG
https://zzerd.com/blog/2021/04/10/linux/debian_install_puppeteer
https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/foreignObject
https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
```
