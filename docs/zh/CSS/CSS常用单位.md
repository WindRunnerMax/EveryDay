# CSS常用单位
`CSS`的长度单位主要有`%`、`px`、`in`、`cm`、`ch`、`mm`、`ex`、`pt`、`pc`、`em`、`rem`、`vw`、`vh`、`vmin`、`vmax`，按照单位的计算方式大致可以分为绝对长度单位、相对长度单位、百分比单位。

## 绝对长度单位

### px 像素
通常而言，一个`CSS`像素代表屏幕设备的一个像素点，但是对于高分辨率屏幕而言一个`CSS`像素往往占多个设备像素，也就是说有多个屏幕像素点来表示`1px`，`1px = 1in / 96`。

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t1{
        width: 1px;
    }
</style>

<section>
    <div id="t1"></div>
</section>
```

### in 英寸
`1in = 2.54cm = 96px`。
    
```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t2{
        width: 1in;
    }
</style>

<section>
    <div id="t2"></div>
</section>
```

### cm 厘米
`1cm = 10mm = 96px/2.54 ≈ 37.8px`。
    
```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t3{
        width: 1cm;
    }
</style>

<section>
    <div id="t3"></div>
</section>
```

### mm 毫米
`1mm = 0.1cm = 3.78px`。

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t4{
        width: 1mm;
    }
</style>

<section>
    <div id="t4"></div>
</section>
```

### pt 磅
`1pt = 1/72in ≈ 0.0139in = 1/722.54cm = 1/7296px ≈ 1.33px`。

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t5{
        width: 1pt;
    }
</style>

<section>
    <div id="t5"></div>
</section>
```

### pc 派卡
`1pc = 1/6in = 12pt  = 1/6*96px = 16px`。

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t6{
        width: 1pc;
    }
</style>

<section>
    <div id="t6"></div>
</section>
```

## 相对长度单位

### em
`em`表示元素的`font-size`属性的计算值，如果用于`font-size`属性本身，相对于父元素的`font-size`，若用于其他属性，相对于本身元素的`font-size`，需要注意的是，使用`em`可能会出现`1.2 * 1.2 = 1.44`的现象，若父元素`font-size`属性设置为`16px`，下一级元素设置为`1.2em`，经计算实际像素为`16px * 1.2 = 19.2px`，再下一级元素若继续设置为`1.2em`则经计算为`16px * 1.2 * 1.2 = 23.04px`，这是因为父级的基准`font-size`属性被计算重设为另一个值，在子元素中使用`em`时需要根据父元素的`font-size`重新计算子元素的`em`值。

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t7 > div{
        background-color: blue;
        font-size: 2em; /* 相对于父元素 2 * 10px = 20px */
        width: 5em; /* 相对于元素本身 5 * 20px = 100px */
    }
</style>

<section class="except">
    <div id="t7">
        <div>文字</div>
    </div>
    <button onclick="emChange()">改变字体大小</button>
</section>

<script type="text/javascript">
    function emChange(){
        document.getElementById("t7").style["font-size"] = "20px";
    }
</script>
```

```html
<section class="except" style="font-size: 10px;">
    <div style="font-size: 2em"> <!-- 2 * 10px = 20px -->
        <div>Test</div>
        <div style="font-size: 2em"> <!-- 2 * 2 * 10px = 40px -->
            <div>Test</div>
        </div>
    </div>
</section>
```


### rem
`rem`单位都是相对于根元素`html`的`font-size`来决定大小的，根元素的`font-size`相当于提供了一个基准，当页面的`size`发生变化时，只需要改变`font-size`的值，那么以`rem`为固定单位的元素的大小也会发生相应的变化。由于所有元素都是以根元素的`font-size`为基准进行计算的，也就不存在`em`的`1.2 * 1.2 = 1.44`现象。`rem`不是只对定义字体大小有用，可以使用`rem`把整个网格系统或者`UI`样式库基于`HTML`根元素的字体大小上，这将带来更加可预测的字体大小和比例缩放，实现响应式的布局。

```html
<style type="text/css">
    html{
        font-size: 15px;
    }
    
    div{
        height: 30px;
        background-color: blue;
    }

    #t8 > div{
        background-color: blue;
        font-size: 2rem; /* 相对于根元素 2 * 15px = 30px */
        width: 6rem; /* 相对于根元素 6 * 15px = 90px */
    }
</style>

<section class="except">
    <div id="t8">
        <div>文字</div>
    </div>
    <button onclick="remChange()">改变字体大小</button>
</section>

<script type="text/javascript">
    function remChange(){
        document.getElementsByTagName("html")[0].style["font-size"] = "20px";
    }
</script>
```

```html
<section class="except">
    <div style="font-size: 2rem"> <!-- 2 * 15px = 30px -->
        <div>Test</div>
        <div style="font-size: 2rem"> <!-- 2 * 15px = 30px -->
            <div>Test</div>
        </div>
    </div>
</section>
```

### ex
`ex`是指所用字体中小写`x`的高度，但不同字体`x`的高度可能不同，对于很多字体来说`1ex ≈ 0.5em`，所以很多浏览器在实际应用中取`em`值一半作为`ex`值，`ex`单位在实际中常用于微调。

```html
<style type="text/css">
    #t9{
        font-size: 1ex;
    }
</style>

<section class="except">
    <div id="t9">文字</div>
    <span style="font-size: 1em">文字</span>
</section>
```

### ch
`ch`与`ex`类似，这一单位代表元素所用字体中`0`这一字形的宽度，更准确地说是`0`这一字形的预测尺寸，如果无法确定`0`字形的大小，则必须假定其宽为`0.5em`高为`1em`，也就是取`em`值的一半作为`ch`值。

```html
<style type="text/css">
    #t10{
        font-size: 1ch;
    }
</style>

<section class="except">
    <div id="t10">文字</div>
    <span style="font-size: 1em">文字</span>
</section>
```

## 百分比单位

### %
当度量单位设置为百分比时，即可使浏览器组件宽高随着浏览器的大小相应变化。  
* 子元素的`height`或`width`中使用百分比，是相对于子元素的直接父元素，`width`相对于父元素的`width`，`height`相对于父元素的`height`。
* 子元素的`top`和`bottom`如果设置百分比，则相对于直接非`static`定位的父元素的高度，同样子元素的`left`和`right`如果设置百分比，则相对于直接非`static`定位父元素的宽度。
* 子元素的`padding`如果设置百分比，不论是垂直方向或者是水平方向，都相对于直接父亲元素的`width`，而与父元素的`height`无关。
* 子元素的`margin`如果设置成百分比，不论是垂直方向还是水平方向，都相对于直接父元素的`width`。
* 设置`border-radius`为百分比，则是相对于自身的宽度，还有`translate`、`background-size`等都是相对于自身的。

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t11{
        width: 50%;
    }
</style>

<section>
    <div id="t11"></div>
</section>
```

### vh vw vmin vmax
* `vh`: 相对于视窗的高度，`1vh`等于视窗高度的`1%`。
* `vw`: 相对于视窗的宽度，`1vw`等于视窗宽度的`1%`。
* `vmin`: `vw`和`vh`中的较小值。
* `vmax`: `vw`和`vh`中的较大值。

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t12{
        background-color: #fff;
    }

    #t12 > div:nth-child(1){
        width: 50vh;
    }

    #t12 > div:nth-child(2){
        width: 50vw;
    }

    #t12 > div:nth-child(3){
        width: 50vmax;
    }

    #t12 > div:nth-child(4){
        width: 50vmin;
    }
</style>

<section class="">
    <div id="t12">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</section>
```

## 代码示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>CSS单位</title>
    <style type="text/css">
        html{
            font-size: 15px;
        }

        section {
            margin: 10px 0;
        }

        div{
            height: 30px;
            background-color: blue;
        }

        .except div{
            height: auto;
            background-color: #fff;
        }

        #t1{
            width: 1px;
        }

        #t2{
            width: 1in;
        }

        #t3{
            width: 1cm;
        }

        #t4{
            width: 1mm;
        }

        #t5{
            width: 1pt;
        }

        #t6{
            width: 1pc;
        }

        #t7{
            background-color: #fff;
            font-size: 10px;
        }

        #t7 > div{
            background-color: blue;
            font-size: 2em; /* 相对于父元素 2 * 10px = 20px */
            width: 5em; /* 相对于元素本身 5 * 20px = 100px */
        }

        #t8 > div{
            background-color: blue;
            font-size: 2rem; /* 相对于根元素 2 * 15px = 30px */
            width: 6rem; /* 相对于根元素 6 * 15px = 90px */
        }

        #t9{
            font-size: 1ex;
        }

        #t10{
            font-size: 1ch;
        }

        #t11{
            width: 50%;
        }

        #t12{
            background-color: #fff;
        }

        #t12 > div:nth-child(1){
            width: 50vh;
        }

        #t12 > div:nth-child(2){
            width: 50vw;
        }

        #t12 > div:nth-child(3){
            width: 50vmax;
        }

        #t12 > div:nth-child(4){
            width: 50vmin;
        }
    </style>
</head>
<body>
    <section>
        <div id="t1"></div>
    </section>

    <section>
        <div id="t2"></div>
    </section>

    <section>
        <div id="t3"></div>
    </section>

    <section>
        <div id="t4"></div>
    </section>

    <section>
        <div id="t5"></div>
    </section>

    <section>
        <div id="t6"></div>
    </section>

    <section class="except">
        <div id="t7">
            <div>文字</div>
        </div>
        <button onclick="emChange()">改变字体大小</button>
    </section>

    <section class="except" style="font-size: 10px;">
        <div style="font-size: 2em"> <!-- 2 * 10px = 20px -->
            <div>Test</div>
            <div style="font-size: 2em"> <!-- 2 * 2 * 10px = 40px -->
                <div>Test</div>
            </div>
        </div>
    </section>

    <section class="except">
        <div id="t8">
            <div>文字</div>
        </div>
        <button onclick="remChange()">改变字体大小</button>
    </section>

    <section class="except">
        <div style="font-size: 2rem"> <!-- 2 * 15px = 30px -->
            <div>Test</div>
            <div style="font-size: 2rem"> <!-- 2 * 15px = 30px -->
                <div>Test</div>
            </div>
        </div>
    </section>

    <section class="except">
        <div id="t9">文字</div>
        <span style="font-size: 1em">文字</span>
    </section>

    <section class="except">
        <div id="t10">文字</div>
        <span style="font-size: 1em">文字</span>
    </section>

    <section>
        <div id="t11"></div>
    </section>

    <section class="">
        <div id="t12">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </section>

</body>
<script type="text/javascript">
    function emChange(){
        document.getElementById("t7").style["font-size"] = "20px";
    }

    function remChange(){
        document.getElementsByTagName("html")[0].style["font-size"] = "20px";
    }
</script>
</html>
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/ebbf64b83f49
https://www.runoob.com/cssref/css-units.html
https://www.cnblogs.com/niuyaomin/p/12319211.html
https://developer.mozilla.org/zh-CN/docs/Web/CSS/length
https://www.cnblogs.com/liujunhang/articles/10686823.html
https://blog.csdn.net/VickyTsai/article/details/102960594
https://www.w3cplus.com/css/7-css-units-you-might-not-know-about.html
```
