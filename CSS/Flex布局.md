# Flex布局
`Flex`布局也称弹性布局，可以为盒状模型提供最大的灵活性，是布局的首选方案，现已得到所有现代浏览器的支持。

## 基础
通过指定`display: flex`来标识一个弹性布局盒子，称为`FLEX`容器，容器内部的盒子就成为`FLEX`容器的成员，容器默认两根轴线，水平的主轴与垂直的交叉轴，主轴的开始位置叫做`main start`，结束位置叫做`main end`；交叉轴的开始位置叫做`cross start`，结束位置叫做`cross end`，容器成员默认按照主轴排列。

## 容器属性

### flex-direction
`flex-direction`属性决定主轴的方向，取值为`row | row-reverse | column | column-reverse`  
* `row`默认值：主轴为水平方向，起点在左端。
* `row-reverse`：主轴为水平方向，起点在右端，容器成员顺序与`row`顺序相反。
* `column`：主轴为垂直方向，起点在上沿。
* `column-reverse`：主轴为垂直方向，起点在下沿，容器成员顺序与`column`顺序相反。

```html
<div id="t1">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</div>
    <!-- 
        3
        2
        1
     -->

<style type="text/css">
    #t1{
        display: flex;
        flex-direction: column-reverse;
    }
</style>
```

### flex-wrap
`flex-wrap`属性决定当轴线方向放不下成员时，是否换行，取值为`nowrap | wrap | wrap-reverse`。
* `nowrap`默认：不换行，当空间不足时，会按轴线方向成员大小比例缩小的成员。
* `wrap`：距离不够时换行，新起一行排列。
* `wrap-reverse`：距离不够时换行，新起的一行在上方。

```html
<div id="t2" style="width: 20px;">
    <div>4</div>
    <div>5</div>
    <div>6</div>
</div>
    <!-- 
        45
        6
     -->
     
<style type="text/css">
    #t2{
        display: flex;
        flex-wrap: wrap;
    }
</style>
```

### flex-flow
`flex-flow`属性是`flex-direction`属性和`flex-wrap`属性的简写形式，默认`row nowrap`。
```html
<div id="t3" style="width: 20px;">
    <div>7</div>
    <div>8</div>
    <div>9</div>
</div>
    <!-- 
        87
         9
     -->
     
<style type="text/css">
    #t3{
        display: flex;
        flex-flow: row-reverse wrap;
    }
</style>
```

### justify-content
`justify-content`属性定义了成员在主轴上的对齐方式，可以很容易地实现多种布局，取值为`flex-start | flex-end | center | space-between | space-around`。
* `flex-start`默认值：左对齐。
* `flex-end`：右对齐。
* `center`： 居中对齐。
* `space-between`：两端对齐，成员之间的间隔都相等。
* `space-around`：每个成员两侧的间隔相等，成员之间的间隔比成员与边框的间隔大一倍。

```html
<div id="t4">
    <div>a</div>
    <div>b</div>
    <div>c</div>
</div>
<!-- abc[水平居中] -->
     
<style type="text/css">
    #t4{
        display: flex;
        justify-content: center;
    }
</style>
```

### align-items
`align-items`属性定义成员在交叉轴上如何对齐，取值为`flex-start | flex-end | center | baseline | stretch`。
* `stretch`默认值：如果成员未设置高度或设为`auto`，将占满整个容器的高度。
* `flex-start`：交叉轴的起点对齐。
* `flex-end`：交叉轴的终点对齐。
* `center`：交叉轴的中点对齐。
* `baseline`: 成员的第一行文字的基线对齐。

```html
<div id="t5" style="height: 50px;">
    <div>d</div>
    <div>e</div>
    <div>f</div>
</div>
<!-- def[垂直居中] -->
     
<style type="text/css">
    #t5{
        display: flex;
        align-items: center;
    }
</style>
```

### align-content
`align-content`属性定义了多根轴线的对齐方式。如果成员只有一根轴线，该属性不起作用，取值为`flex-start | flex-end | center | space-between | space-around | stretch`。
* `stretch`默认值：轴线占满整个交叉轴。
* `flex-start`：与交叉轴的起点对齐。
* `flex-end`：与交叉轴的终点对齐。
* `center`：与交叉轴的中点对齐。
* `space-between`：与交叉轴两端对齐，轴线之间的间隔平均分布。
* `space-around`：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。

```html
<div id="t6" style="height: 50px;width: 20px;">
    <div>g</div>
    <div>h</div>
    <div>i</div>
</div>
<!-- 
    g
    hi
    [交叉轴space-between] 
-->
     
<style type="text/css">
    #t6{
        display: flex;
        flex-wrap: wrap;
        align-content: space-between;
    }
</style>
```

## 成员属性
### order
`order`属性定义成员的排列顺序，数值越小，排列越靠前，默认为`0`。

```html
<div class="flexBox">
    <div style="order: 3;">j</div>
    <div style="order: 1;">k</div>
    <div style="order: 2;">l</div>
</div>
<!-- klj -->
     
<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

### flex-grow
`flex-grow`属性定义成员的放大比例，默认为`0`。

```html
<div class="flexBox">
    <div style="flex-grow: 1;">m</div>
    <div style="flex-grow: 2;">n</div>
    <div style="flex-grow: 3;">o</div>
</div>
<!-- m n o -->
     
<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

### flex-shrink
`flex-shrink`属性定义了成员的缩小比例，默认为`1`，即如果空间不足，该成员将缩小。
```html
<div class="flexBox" style="width: 100px;">
    <div style="flex-shrink: 1;width: 100px;">p</div>
    <div style="flex-shrink: 2;width: 100px;">q</div>
    <div style="flex-shrink: 3;width: 100px;">r</div>
</div>
<!-- p q r -->
     
<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

### flex-basis
`flex-basis`属性定义了在分配多余空间之前，成员占据的主轴空间`main size`，浏览器根据这个属性，计算主轴是否有多余空间，它的默认值为`auto`，即成员的本来大小。

```html
<div class="flexBox">
    <div>s</div>
    <div style="flex-basis: 40px;">t</div>
    <div>u</div>
</div>
<!-- s t u -->

<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

### flex
`flex`属性是`flex-grow`, `flex-shrink`和`flex-basis`的简写，默认值`0 1 auto`。后两个属性可选。
```html
<div class="flexBox">
    <div style="flex: 1;">v</div>
    <div style="flex: 1;">w</div>
    <div style="flex: 1;">x</div>
</div>
<!-- v w x -->

<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

### align-self
`align-self`属性允许单个成员有与其他成员不一样的对齐方式，可覆盖`align-items`属性。默认值为`auto`，表示继承父元素的`align-items`属性，如果没有父元素，则等同于`stretch`。

```html
<div class="flexBox" style="height: 50px;">
    <div>y</div>
    <div style="align-self: center;">z</div>
    <div>0</div>
</div>
<!-- y z 0 -->

<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

## 参考

```
http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html
```

## 代码示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>FLEX布局</title>
</head>
<body>
    <div id="t1">
        <div>1</div>
        <div>2</div>
        <div>3</div>
    </div>
    <!-- 
        3
        2
        2
     -->

    <div id="t2" style="width: 20px;">
        <div>4</div>
        <div>5</div>
        <div>6</div>
    </div>
    <!-- 
        45
        6
     -->

    <div id="t3" style="width: 20px;">
        <div>7</div>
        <div>8</div>
        <div>9</div>
    </div>
    <!-- 
        87
         9
     -->

     <div id="t4">
        <div>a</div>
        <div>b</div>
        <div>c</div>
    </div>
    <!-- abc[水平居中] -->

    <div id="t5" style="height: 50px;">
        <div>d</div>
        <div>e</div>
        <div>f</div>
    </div>
    <!-- def[垂直居中] -->

    <div id="t6" style="height: 50px;width: 20px;">
        <div>g</div>
        <div>h</div>
        <div>i</div>
    </div>
    <!-- 
        g
        hi
        [交叉轴space-between] 
    -->

    <div class="flexBox">
        <div style="order: 3;">j</div>
        <div style="order: 1;">k</div>
        <div style="order: 2;">l</div>
    </div>
    <!-- klj -->

    <div class="flexBox">
        <div style="flex-grow: 1;">m</div>
        <div style="flex-grow: 2;">n</div>
        <div style="flex-grow: 3;">o</div>
    </div>
    <!-- m n o -->

    <div class="flexBox" style="width: 100px;">
        <div style="flex-shrink: 1;width: 100px;">p</div>
        <div style="flex-shrink: 2;width: 100px;">q</div>
        <div style="flex-shrink: 3;width: 100px;">r</div>
    </div>
    <!-- p q r -->

    <div class="flexBox">
        <div>s</div>
        <div style="flex-basis: 40px;">t</div>
        <div>u</div>
    </div>
    <!-- s t u -->

    <div class="flexBox" style="height: 50px;">
        <div>y</div>
        <div style="align-self: center;">z</div>
        <div>0</div>
    </div>
    <!-- y z 0 -->

</body>
<style type="text/css">
    #t1{
        display: flex;
        flex-direction: column-reverse;
    }

    #t2{
        display: flex;
        flex-wrap: wrap;
    }
    #t3{
        display: flex;
        flex-flow: row-reverse wrap;
    }
    #t4{
        display: flex;
        justify-content: center;
    }
    #t5{
        display: flex;
        align-items: center;
    }

    #t6{
        display: flex;
        flex-wrap: wrap;
        align-content: space-between;
    }

    .flexBox{
        display: flex;
    }
</style>
</html>
```

