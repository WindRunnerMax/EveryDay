# CSS3新特性
`CSS3`是最新的`CSS`标准，旨在扩展`CSS2.1`。

## 圆角
通过`border-radius`属性可以给任何元素制作圆角。
* `border-radius`: 所有四个边角`border-*-*-radius`属性的缩写。
* `border-top-left-radius`: 定义了左上角的弧度。
* `border-top-right-radius`: 定义了右上角的弧度。
* `border-bottom-right-radius`: 定义了右下角的弧度。
* `border-bottom-left-radius`: 定义了左下角的弧度。

```html
<div id="t1"></div>
<style type="text/css">
    #t1{
        height: 100px;
        width: 100px;
        background-color: blue;
        border-radius: 10px;
    }
</style>
```

## 盒阴影
`box-shadow: h-shadow v-shadow blur spread color inset`  
* `h-shadow`: 必需，水平阴影的位置，允许负值。
* `v-shadow`: 必需，垂直阴影的位置，允许负值。
* `blur`: 可选，模糊距离。
* `spread`: 可选，阴影的大小。
* `color`: 可选，阴影的颜色。在CSS颜色值寻找颜色值的完整列表。
* `inset`: 可选，从外层的阴影改变阴影内侧阴影。

```html
<div id="t2"></div>
<style type="text/css">
    #t2{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        box-shadow: 5px 5px 5px #aaa;
    }
</style>
```

## 背景
`CSS3`中包含几个新的背景属性，提供更大背景元素控制。 
* `background-image`: 规定背景图片路径。
* `background-clip`: 规定背景的绘制区域。
* `background-origin`: 规定背景图片的定位区域。
* `background-size`: 规定背景图片的尺寸。

```html
<div id="t3"></div>
<style type="text/css">
    #t3{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        background-image: url(https://blog.touchczy.top/favicon.ico);
        background-size:30px 30px;
        background-repeat:repeat;
        background-origin:content-box;
    }
</style>
```

## 渐变
`CSS3`渐变可以在两个或多个指定的颜色之间显示平稳的过渡。 
* `Linear Gradients`: 线性渐变，向下/向上/向左/向右/对角方向。
* `Radial Gradients`: 径向渐变，由中心定义。

```html
<div id="t4"></div>
<style type="text/css">
    #t4{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        background-image: linear-gradient(to right, red , yellow);
    }
</style>
```

## 文本效果
`CSS3`对文本进行了更多的支持。  
* `hanging-punctuation`: 规定标点字符是否位于线框之外。
* `punctuation-trim`: 规定是否对标点字符进行修剪。
* `text-align-last`: 设置如何对齐最后一行或紧挨着强制换行符之前的行。
* `text-emphasis`: 向元素的文本应用重点标记以及重点标记的前景色。
* `text-justify`: 规定当`text-align`设置为`justify`时所使用的对齐方法。
* `text-outline`: 规定文本的轮廓。
* `text-overflow`: 规定当文本溢出包含元素时发生的事情。
* `text-shadow`: 向文本添加阴影。
* `text-wrap`: 规定文本的换行规则。
* `word-break`: 规定非中日韩文本的换行规则。
* `word-wrap`: 允许对长的不可分割的单词进行分割并换行到下一行。

```html
<div id="t5">Text</div>
<style type="text/css">
    #t5{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        color: #fff;
        text-shadow: -1px 3px 5px #333;
    }
</style>
```

## 字体
`CSS3`可以使用`@font-face`规则加载所需字体。  
* `font-family`: 必需，规定字体的名称。
* `src`: 必需，定义字体文件的`URL`。
* `font-stretch`: 可选，定义如何拉伸字体，默认是`normal`。
* `font-style`: 可选，定义字体的样式，默认是`normal`。
* `font-weight`: 可选，定义字体的粗细，默认是`normal`。
* `unicode-range`: 可选，定义字体支持的`UNICODE`字符范围，默认是`U+0-10FFFF`。

```html
<div id="t6">Text</div>
<style type="text/css">
    @font-face{
        font-family: ff;
        src: url(https://cdn.jsdelivr.net/gh/WindrunnerMax/Yolov3-Train@2d965d2/keras-yolo3/font/FiraMono-Medium.otf);
    }
    #t6{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        font-family:ff;
    }
</style>
```

## 2D转换
`CSS3`转换可以对元素进行移动、缩放、转动、拉长或拉伸。
* `transform`: 适用于`2D`或`3D`转换的元素。
* `transform-origin`: 允许更改转化元素位置。

```html
<div id="t7"></div>
<style type="text/css">
    #t7{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        transform:rotate(10deg);
    }
</style>
```

## 3D转换
`CSS3`可以使用`3D`转换来对元素进行格式化。
* `transform`: 向元素应用`2D`或`3D`转换。
* `transform-origin`: 允许你改变被转换元素的位置。
* `transform-style`: 规定被嵌套元素如何在`3D`空间中显示。
* `perspective`: 规定`3D`元素的透视效果。
* `perspective-origin`: 规定`3D`元素的底部位置。
* `backface-visibility`: 定义元素在不面对屏幕时是否可见。

```html
<div id="t8"></div>
<style type="text/css">
    #t8{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        transform:rotateX(10deg);
    }
</style>
```

## 动画
`CSS3`可以创建动画，它可以取代许多网页动画图像、`Flash`动画和`JavaScript`实现的效果。
* `@keyframes`: 规定动画。
* `animation`: 所有动画属性的简写属性，除了`animation-play-state`属性。  
* `animation-name`: 规定`@keyframes`动画的名称。
* `animation-duration`: 规定动画完成一个周期所花费的秒或毫秒，默认是`0`。
* `animation-timing-function`: 规定动画的速度曲线，默认是`ease`。
* `animation-fill-mode`: 规定当动画不播放时，例如当动画完成时，或当动画有一个延迟未开始播放时，要应用到元素的样式。
* `animation-delay`: 规定动画何时开始，默认是`0`。
* `animation-iteration-count`: 规定动画被播放的次数，默认是`1`。
* `animation-direction`: 规定动画是否在下一周期逆向地播放，默认是`normal`。
* `animation-play-state`: 规定动画是否正在运行或暂停，默认是`running`。

```html
<div id="t9"></div>
<style type="text/css">
    @keyframes animation{
        from {background:red;}
        to {background:yellow;}
    }
    #t9{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        animation:animation 5s ease infinite alternate;
    }
</style>
```

## 过渡
`CSS3`中可以使元素从一种样式转变到另一个的时候，无需使用`Flash`动画或`JavaScript`。
* `transition`: 简写属性，用于在一个属性中设置四个过渡属性。
* `transition-property`: 规定应用过渡的`CSS`属性的名称。
* `transition-duration`: 定义过渡效果花费的时间，默认是 0。
* `transition-timing-function`: 规定过渡效果的时间曲线，默认是`ease`。
* `transition-delay`: 规定过渡效果何时开始，默认是 0。

```html
<div id="t10"></div>
<style type="text/css">
    #t10{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        background: red;
        transition: all .5s;
    }
    #t10:hover{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        background: yellow;
        transition: all .5s;
    }
</style>
```

## Flex布局
通过指定`display: flex`来标识一个弹性布局盒子，称为`FLEX`容器，容器内部的盒子就成为`FLEX`容器的成员，容器默认两根轴线，水平的主轴与垂直的交叉轴，主轴的开始位置叫做`main start`，结束位置叫做`main end`；交叉轴的开始位置叫做`cross start`，结束位置叫做`cross end`，容器成员默认按照主轴排列。  

```
https://github.com/WindrunnerMax/EveryDay/blob/master/CSS/Flex布局.md
```

## Grid布局
通过指定`display: grid;`指定容器使用`Grid`布局，`Grid`布局中采用网格布局的区域，称为容器，容器内部采用网格定位的子元素，称为成员。容器中水平区域称为行，垂直区域称为列，可以将其看作二位数组。划分网格的线就称为网格线，正常情况下`n`行有`n + 1`根水平网格线，`m`列有`m + 1`根垂直网格线。注意当容器设置为`Grid`布局以后，容器子元素的`float`、`display: inline-block`、`display: table-cell`、`vertical-align`和`column-*`等设置都将失效。

```
https://github.com/WindrunnerMax/EveryDay/blob/master/CSS/Grid布局.md
```

## 多列布局
`CSS3`可以将文本内容设计成像报纸一样的多列布局。
* `column-count`: 指定元素应该被分割的列数。
* `column-fill`: 指定如何填充列。
* `column-gap`: 指定列与列之间的间隙。
* `column-rule`: 所有`column-rule-*`属性的简写。
* `column-rule-color`: 指定两列间边框的颜色。
* `column-rule-style`: 指定两列间边框的样式。
* `column-rule-width`: 指定两列间边框的厚度。
* `column-span`: 指定元素要跨越多少列。
* `column-width`: 指定列的宽度。
* `columns`: 设置`column-width`和`column-count`的简写。

```html
<div id="t11">多列布局示例</div>
<style type="text/css">
    #t10{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        column-count: 3;
        column-gap: 20px;
    }
</style>
```

## 用户界面
`CSS3`中增加了一些新的用户界面特性来调整元素尺寸，框尺寸和外边框。
* `appearance`: 允许使一个元素的外观像一个标准的用户界面元素。
* `box-sizing`: 允许以适应区域而用某种方式定义某些元素。
* `icon`: 为创作者提供了将元素设置为图标等价物的能力。
* `nav-down`: 指定在何处使用箭头向下导航键时进行导航。
* `nav-index`: 指定一个元素的`Tab`的顺序。
* `nav-left`: 指定在何处使用左侧的箭头导航键进行导航。
* `nav-right`: 指定在何处使用右侧的箭头导航键进行导航。
* `nav-up`: 指定在何处使用箭头向上导航键时进行导航。
* `outline-offset`: 外轮廓修饰并绘制超出边框的边缘。
* `resize`: 指定一个元素是否是由用户调整大小。

```html
<div id="t12"></div>
<style type="text/css">
    #t11{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        resize:both;
        overflow:auto;
    }
</style>
```

## 滤镜
`CSS3`的`filter`属性可支持对于网页进行各种滤镜效果。  
`filter: none | blur() | brightness() | contrast() | drop-shadow() | grayscale() | hue-rotate() | invert() | opacity() | saturate() | sepia() | url();`  

```html
<div id="t13"></div>
<style type="text/css">
    #t12{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        filter: blur(3px);
        background-color: blue;
    }
</style>
```

## 选择器

* `element1~element2`: 选择同级前面有`element1`元素的全部`element2`元素
* `[attribute^=value]`: 选择`attribute`属性中以`value`开头的元素
* `[attribute$=value]`: 选择`attribute`属性中以`value`结尾的元素
* `[attribute*=value]`: 选择`attribute`属性中包含`value`字符串的元素
* `div:first-child`: 选择属于其父元素的第一个子元素的每个`div`元素
* `div:last-child`: 选择属于其父元素最后一个子元素的每个`div`元素
* `div:nth-child(n)`: 选择属于其父元素的第n个子元素的每个`div`元素
* `div:nth-last-child(n)`: 同上，从这个元素的最后一个子元素开始算
* `div:nth-of-type(n)`: 选择属于其父元素第n个`div`元素的每个`div`元素
* `div:nth-last-of-type(n)`: 同上，但是从最后一个子元素开始计数
* `div:first-of-type`: 选择属于其父元素的首个`div`元素的每个`div`元素
* `div:last-of-type`: 选择属于其父元素的最后`div`元素的每个`div`元素
* `div:only-child`: 选择属于其父元素的唯一子元素的每个`div`元素
* `div:only-of-type`: 选择属于其父元素唯一的`div`元素的每个`div`元素
* `:root`: 选择文档的根元素
* `:empty`: 选择的元素里面没有任何内容
* `:checked`: 匹配被选中的input元素，这个input元素包括radio和checkbox
* `:default`: 匹配默认选中的元素，例如：提交按钮总是表单的默认按钮
* `:disabled`: 匹配禁用的表单元素
* `:enabled`: 匹配没有设置disabled属性的表单元素
* `:valid`: 匹配条件验证正确的表单元素

## 媒体查询
可以针对不同的媒体类型设置不同的样式规则，可以根据视窗、设备高度与宽度、设备方向、分辨率等进行不同`CSS`适配。

```html
<div id="t14"></div>
<style type="text/css">
    @media screen and (min-width:600px){ 
        #t13{
            height: 100px;
            width: 100px;
            border: 1px solid #eee;
            background: red;
            transition: all .5s;
        }
    }
    @media screen and (max-width:600px) { 
        #t13{
            height: 100px;
            width: 100px;
            border: 1px solid #eee;
            background: yellow;
            transition: all .5s;
        }
    }
</style>
```
## 代码示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>CSS3新特性</title>
    <style type="text/css">
        div{
            margin: 10px 0;
            height: 100px;
            width: 100px;
            border: 1px solid #eee;
        }
        #t1{
            border-radius: 10px;
            background-color: blue;
        }
        #t2{
            box-shadow: 5px 5px 5px #aaa;
        }
        #t3{
            border: 1px solid #eee;
            background-image: url(https://blog.touchczy.top/favicon.ico);
            background-size:30px 30px;
            background-repeat:repeat;
            background-origin:content-box;
        }
        #t4{
            background-image: linear-gradient(to right, red , yellow);
        }
        #t5{
            color: #fff;
            text-shadow: -1px 3px 5px #333;
        }
        @font-face{
            font-family: ff;
            src: url(https://cdn.jsdelivr.net/gh/WindrunnerMax/Yolov3-Train@2d965d2/keras-yolo3/font/FiraMono-Medium.otf);
        }
        #t6{
            font-family:ff;
        }
        #t7{
            transform:rotate(10deg);
        }
        #t8{
            transform:rotateX(10deg);
        }
        @keyframes animation{
            from {background:red;}
            to {background:yellow;}
        }
        #t9{
            animation:animation 5s ease infinite alternate;
        }
        #t10{
            background: red;
            transition: all .5s;
        }
        #t10:hover{
            background: yellow;
            transition: all .5s;
        }
        #t11{
            column-count: 3;
            column-gap: 20px;
        }
        #t12{
            resize:both;
            overflow:auto;
        }
        #t13{
            filter: blur(3px);
            background-color: blue;
        }
        @media screen and (min-width:600px){ 
            #t14{
                height: 100px;
                width: 100px;
                border: 1px solid #eee;
                background: red;
                transition: all .5s;
            }
        }
        @media screen and (max-width:600px) { 
            #t14{
                height: 100px;
                width: 100px;
                border: 1px solid #eee;
                background: yellow;
                transition: all .5s;
            }
        }
    </style>
</head>
<body>
    <div id="t1">圆角</div>
    <div id="t2">盒阴影</div>
    <div id="t3">背景</div>
    <div id="t4">渐变</div>
    <div id="t5">文本效果</div>
    <div id="t6">FONT</div>
    <div id="t7">2D转换</div>
    <div id="t8">3D转换</div>
    <div id="t9">动画</div>
    <div id="t10">过渡</div>
    <div id="t11">多列布局示例</div>
    <div id="t12">用户界面</div>
    <div id="t13">滤镜</div>
    <div id="t14">媒体查询</div>

</body>
</html>
```
## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/f988d438ee17
https://www.runoob.com/css3/css3-tutorial.html
https://developer.mozilla.org/zh-CN/docs/Archive/CSS3
```
