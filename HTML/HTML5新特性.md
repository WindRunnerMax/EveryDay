# HTML5新特性
`HTML5`是下一代`HTML`标准，是`HTML`最新的修订版本，`2014`年`10`月由万维网联盟`W3C`完成标准制定，`HTML5`将`HTML`从用于构造一个文档的一个简单标记，到一个完整的应用程序开发平台，`HTML5`还包括新元素和用于增强存储、多媒体和硬件访问的`JavaScript APIs`。

## 新增语义化标签
* `<header>`: 页眉通常包括网站标志、主导航、全站链接以及搜索框。
* `<footer>`: 定义文档的底部区域，通常包含文档的作者，著作权信息，联系信息等。
* `<nav>`: 提供当前文档内或其他文档的导航链接，导航部分的常见示例是菜单，目录和索引。
* `<section>`: 定义文档中的节，表示`HTML`文档中包含的独立部分。
* `<article>`: 专注于单个主题的博客文章，报纸文章或网页文章。
* `<aside>`: 表示文档的一部分，其内容仅与文档的主要内容间接相关,通常显示为侧边栏。
* `<details>`: 描述文档或文档某个部分的细节。
* `<summary>`: 元素为`<details>`元素的显示框指定摘要，标题或图例。
* `<dialog>`: 表示对话框或其他交互式组件，例如检查器或子窗口。
* `<figure>`: 表示独立的内容，可能带有可选的标题，该标题使用`<figcaption>`元素指定。
* `<figcaption>`: 表示说明其父`<figure>`元素的其余内容的标题或图例。
* `<main>`: 主要内容区域由与文档的中心主题或应用程序的中心功能直接相关或扩展的内容组成。
* `<mark>`: 表示被标记或突出显示以供参考或标记目的的文本。
* `<time>`: 表示特定的时间。
* `<data>`: 表示特定的日期。
* `<hgroup>`: 表示文档部分的多级标题，它对一组`<h1>~<h6>`元素进行分组。
* `<bdi>`: 允许设置一段文本，使其脱离其父元素的文本方向设置。
* `<command>`: 定义命令按钮，比如单选按钮、复选框或按钮。
* `<progress>`: 定义任何类型的任务的进度。
* `<ruby>`: 定义`ruby`注释（中文注音或字符）。
* `<rt>`: 定义字符（中文注音或字符）的解释或发音。
* `<rp>`: 在`ruby`注释中使用，定义不支持`ruby`元素的浏览器所显示的内容。
* `<wbr>`: 规定在文本中的何处适合添加换行符。
* `<meter>`: 定义度量衡，仅用于已知最大和最小值的度量。

## 表单增强
### Input类型
* `week`: 选择周和年。
* `search`: 用于搜索域。
* `time`: 选择一个时间。
* `month`: 选择一个月份。
* `url`: `url`地址的输入域。
* `color`: 主要用于选取颜色。
* `tel`: 定义输入电话号码和字段。
* `email`: 包含`e-mail`地址的输入域。
* `range`: 一个范围内数字值的输入域。
* `datetime`: 选取一个日期，`UTC`时间。
* `date`: 从一个日期选择器选择一个日期。
* `datetime-local`: 选择一个日期和时间 (无时区)。
* `number`: 数值的输入域，并使用`max`与`min`属性控制范围。

### 表单元素
* `<datalist>`: 定义选项列表，与`input`元素配合使用该元素。
* `<keygen>`: 规定用于表单的密钥对生成器字段。
* `<output>`: 定义不同类型的输出，比如计算或脚本的输出。

### 表单属性
* `autocomplete`: 规定`form`或`input`域应该拥有自动完成功能，作用在`<form>`。
* `novalidate`: 规定在提交表单时不应该验证`form`或`input`域，作用在`<form>`。
* `autofocus`: 在页面加载时，域自动地获得焦点，作用在`<input>`。
* `form`: 规定输入域所属的一个或多个表单，作用在`<input>`。
* `placehoder`: 输入框默认提示文字，作用在`<input>`。
* `formaction`: 用于描述表单提交的`URL`地址，作用在`<input>`。
* `formenctype`: 描述表单提交到服务器的数据编码，作用在`<input>`。
* `formmethod`: 定义了表单提交的方式，作用在`<input>`。
* `novalidate`: 描述了`<input>`元素在表单提交时无需被验证，作用在`<input>`。
* `formtarget`: 指定一个名称或一个关键字来指明表单提交数据接收后的展示，作用在`<input>`。
* `height`、`width`: 属性规定用`image`类型的`<input>`标签的图像高度和宽度，作用在`<input>`。
* `list`: 规定输入域的`datalist`，`datalist`是输入域的选项列表，作用在`<input>`。
* `min`、`max`: 用于为包含数字或日期的`input`类型规定限定与约束，作用在`<input>`。
* `multiple`: 规定`<input>`元素中可选择多个值，适用于`email`与`file`类型的`<input>`，作用在`<input>`。
* `pattern`: 描述了一个正则表达式用于验证`<input>`元素的值，作用在`<input>`。
* `placeholder`: 提供一种提示`hint`，提示会在用户输入值前会显示在输入域上，作用在`<input>`。
* `required`: 规定必须在提交之前填写输入域，即不能为空，作用在`<input>`。
* `step`: 为输入域规定合法的数字间隔，作用在`<input>`。

## 多媒体支持

### 多媒体标签
* `<audio>`: 定义音频内容。
* `<video>`: 定义视频内容。
* `<source>`: 定义多媒体资源路径。
* `<embed>`: 定义嵌入的内容，比如插件。
* `<track>`: 定义引入字幕文件或其他包含文本的文件。

### 示例

```html
<audio controls>
  <source src="horse.ogg" type="audio/ogg">
  <source src="horse.mp3" type="audio/mpeg">
</audio>

<video width="320" height="240" controls>
    <source src="movie.mp4" type="video/mp4">
    <source src="movie.ogg" type="video/ogg">
</video>
```

## Canvas绘图
`HTML5`中引入`<canvas>`标签，用于图形的绘制，`<canvas>`为图形的绘制提供了画布，是图形容器，具体的图形绘制由`JavaScript`来完成。

### 示例

```html
<canvas id="canvas" width="500" height="300" ></canvas>
<script type="text/javascript">
    var canvas=document.getElementById('canvas');
    var ctx=canvas.getContext('2d');
    ctx.fillStyle = "rgb(146, 186, 255, 0.6)";
    this.ctx.strokeStyle = "rgb(146, 186, 255)";
    ctx.arc(100,100,30,0,Math.PI * 2);
    ctx.fill();
    ctx.stroke();
</script>
```

## 内联SVG
`HTML5`支持内联`SVG`，`SVG`可缩放矢量图形`Scalable Vector Graphics`是基于可扩展标记语言`XML`，用于描述二维矢量图形的一种图形格式。`SVG`严格遵从`XML`语法，并用文本格式的描述性语言来描述图像内容，因此是一种和图像分辨率无关的矢量图形格式，`SVG`于`2003`年成为`W3C`推荐标准。

### 示例

```xml
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <circle cx="200" cy="40" r="40" stroke="#FFB800" stroke-width="1" fill="#FF5722" />
  <rect width="200" height="80" y="80" x="100" style="fill:#4C98F7;stroke-width:1;stroke:#FFF;"/>
</svg>
```

## MathML
`HTML5`可以在文档中使用`MathML`元素，对应的标签是`<math>`，`MathML`是数学标记语言，是一种基于`XML`的标准，用来在互联网上书写数学符号和公式的置标语言。

### 示例

```xml
<math xmlns="http://www.w3.org/1998/Math/MathML">
    <mrow>
        <msup><mi>a</mi><mn>2</mn></msup>
        <mo>+</mo>
        <msup><mi>b</mi><mn>2</mn></msup>
        <mo>=</mo>
        <msup><mi>c</mi><mn>2</mn></msup>
    </mrow>
</math>
```

## 拖放API
拖放是一种常见的特性，即捉取对象以后拖到另一个位置，在`HTML5`中，拖放是标准的一部分，任何元素都能够拖放。

### 示例
```html
<div draggable="true" ondragstart="drag(event)">Drag</div>
<script type="text/javascript">
    function drag(e){
        console.log(e);
    }
</script>
```

### 事件
* `ondrag`: 当拖动元素或选中的文本时触发。
* `ondragend`: 当拖拽操作结束时触发，例如松开鼠标按键或敲`Esc`键。
* `ondragenter`: 当拖动元素或选中的文本到一个可释放目标时触发。
* `ondragexit`: 当元素变得不再是拖动操作的选中目标时触发。
* `ondragleave`: 当拖动元素或选中的文本离开一个可释放目标时触发。
* `ondragover`: 当元素或选中的文本被拖到一个可释放目标上时触发，每`100`毫秒触发一次。
* `ondragstart`: 当用户开始拖动一个元素或选中的文本时触发。
* `ondrop`: 当元素或选中的文本在可释放目标上被释放时触发。

## 地理位置
`HTML5 Geolocation API`用于获得用户的地理位置，获取位置信息需要用户同意操作。

### 示例
```javascript
window.navigator.geolocation.getCurrentPosition(
    function(pos){
      console.log('定位时间：',pos.timestamp);
      console.log('经度：',pos.coords.longitude);
      console.log('纬度：',pos.coords.latitude);
      console.log('海拔：',pos.coords.altitude);
      console.log('速度：',pos.coords.speed);
    },
    function(err){ 
         console.log(err);
    }
)
```

## Web Worker
`Web Worker`能够把`JavaScript`计算委托给后台线程，通过允许这些活动以防止使交互型事件变得缓慢。

### 示例

```javascript
var worker = new Worker('worker.js');

/*
  workers和主线程间的数据传递通过这样的消息机制进行——双方都使用postMessage()方法发送各自的消息，
  使用onmessage事件处理函数来响应消息（消息被包含在Message事件的data属性中）,
  这个过程中数据并不是被共享而是被复制。
 */
```

## Web Storage
使用`HTML5`可以在本地存储用户的浏览数据，`localStorage`和`sessionStorage`是`HTML5`提供的对于`Web`存储的解决方案。

```javascript
// 储存数据
localStorage.setItem('key', 'value');
sessionStorage.setItem('key', 'value');

// 读取数据
localStorage.getItem('key');
sessionStorage.getItem('key');

// 删除数据
localStorage.removeItem('key');
sessionStorage.removeItem('key');

// 清空数据
localStorage.clear();
sessionStorage.clear();
```

## WebSocket
`WebSocket`是`HTML5`开始提供的一种在单个`TCP`连接上进行全双工通讯的协议。`WebSocket` 使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。在 `WebSocket API`中，浏览器和服务器只需要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。在`WebSocket API`中，浏览器和服务器只需要做一个握手的动作，然后，浏览器和服务器之间就形成了一条快速通道，两者之间就直接可以数据互相传送。
* 握手阶段采用`HTTP`协议，在普通`HTTP`报文中包含了一些附加头信息，其中附加头信息`Upgrade: WebSocket`表明这是一个申请协议升级的`HTTP`请求。
* 建立在`TCP`协议基础之上，和`HTTP`协议同属于应用层。
* 可以发送文本，也可以发送二进制数据。
* 数据格式比较轻量，性能开销小，通信高效。
* 没有同源限制，客户端可以与任意服务器通信。
* 协议头标识符是`ws`，如果加密传输则为`wss`。

## 参考

```
https://www.runoob.com/html/html5-intro.html
https://www.cnblogs.com/vicky1018/p/7705223.html
https://www.cnblogs.com/binguo666/p/10928907.html
https://blog.csdn.net/gane_cheng/article/details/52819118
https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/HTML5
```
