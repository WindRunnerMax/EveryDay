# SVG基础
`SVG`可缩放矢量图形`Scalable Vector Graphics`是基于可扩展标记语言`XML`，用于描述二维矢量图形的一种图形格式。`SVG`严格遵从`XML`语法，并用文本格式的描述性语言来描述图像内容，因此是一种和图像分辨率无关的矢量图形格式，`SVG`于`2003`年成为`W3C`推荐标准。

## 示例

```xml
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <circle cx="200" cy="40" r="40" stroke="#FFB800" stroke-width="1" fill="#FF5722" />
  <rect width="200" height="80" y="80" x="100" style="fill:#4C98F7;stroke-width:1;stroke:#FFF;"/>
</svg>
```
第`1`行包含了`xml`声明，`standalone`属性规定此`svg`文件是否是独立的，或含有对外部文件的引用。`standalone="no"`意味着`SVG`文档会引用一个外部文件，此处是`DTD`文件。  
第`2`和第`3`行引用了这个外部的`SVG DTD`。该`DTD`位于`http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd`，该`DTD`位于`W3C`，含有所有允许的`svg`元素。  
`svg`代码以`<svg>`元素开始，包括开启标签`<svg>`和关闭标签`</svg>`，这是根元素，可以通过`width`和`height`属性可设置此`SVG`文档的宽度和高度，`version`属性可定义所使用的`SVG`版本，`xmlns`属性可定义`SVG`命名空间。  
`<svg>`的`<circle>`用来创建一个圆。`cx`和`cy`属性定义圆中心的`x`和`y`坐标。如果忽略这两个属性，那么圆点会被设置为`(0, 0)`，`r`属性定义圆的半径，`stroke`和`stroke-width`属性控制形状的轮廓颜色与宽度，`fill`属性设置形状内的颜色。  
`<svg>`的`<rect>`用来创建一个矩形，通过`x`与`y`来定义距离左边框与距离上边框位置，`width`与`height`定义宽度与高度，`style`中可以直接声明属性样式，`stroke`和`stroke-width`属性控制形状的轮廓颜色与宽度，`fill`属性设置形状内的颜色。  
注意由于`svg`严格遵从`xml`语法，所有的开启标签必须有关闭标签。

## 常用标签
`<rect>`矩形、`<circle>`圆形、`<ellipse>`椭圆、`<line>`线、`<polyline>`折线、`<polygon>`多边形、`<path>`路径、`<text>`文本、`<defs>`特殊元素定义、`<filter>`滤镜、`<feGaussianBlur>`模糊、`<mask>`遮罩、`<feOffset>`偏移阴影、`<linearGradient>`线性渐变、`<radialGradient>`放射性渐变、`<animate>`动画等等

## 特点

### 任意放缩
用户可以任意缩放图像显示，而不会破坏图像的清晰度、细节等。

### 文本独立
`SVG`图像中的文字独立于图像，文字保留可编辑和可搜寻的状态。也不会再有字体的限制，用户系统即使没有安装某一字体，也会看到和他们制作时完全相同的画面。

### 较小文件
总体来讲，`SVG`文件比`GIF`和`JPEG`格式的文件要小很多，因而下载也很快。

### 超强显示效果
`SVG`图像在屏幕上总是边缘清晰，它的清晰度适合任何屏幕分辨率和打印分辨率。

### 超级颜色控制
`SVG`图像提供一个`1600`万种颜色的调色板，支持`ICC`颜色描述文件标准、`RGB`、线性填充、渐变和蒙版。

### 浏览器支持
现代浏览器都支持`svg`，早期的`IE8`及以前版本需要安装插件

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```


## 参考

```
https://www.runoob.com/svg/svg-reference.html
https://www.nowcoder.com/ta/review-frontend/review?tpId=80&tqId=29691&query=&asc=true&order=&page=14
```
