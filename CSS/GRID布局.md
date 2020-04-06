# GRID布局
目前`CSS`布局方案中,网格布局可以算得上是最强大的布局方案了。它可以将网页分为一个个网格，然后利用这些网格组合做出各种各样的布局。`Grid`布局与`Flex`布局有一定的相似性，都可以指定容器内部多个成员的位置。不同之处在于，`Flex`布局是轴线布局，只能指定成员针对轴线的位置，可以看作是一维布局。`Grid`布局则是将容器划分成行和列，产生单元格，然后指定成员所在的单元格，可以看作是二维布局。

## 基础
通过指定`display: grid;`指定容器使用`Grid`布局，`Grid`布局中采用网格布局的区域，称为容器，容器内部采用网格定位的子元素，称为成员。容器中水平区域称为行，垂直区域称为列，可以将其看作二位数组。划分网格的线就称为网格线，正常情况下`n`行有`n + 1`根水平网格线，`m`列有`m + 1`根垂直网格线。注意当容器设置为`Grid`布局以后，容器子元素的`float`、`display: inline-block`、`display: table-cell`、`vertical-align`和`column-*`等设置都将失效。

## 容器属性

### grid-template-rows grid-template-columns
`grid-template-rows`属性定义每一行的行高，设定为多少行就设置多少个值，取值可以为固定像素，也可以为百分比，`grid-template-columns`属性定义每一列的列宽，设定为多少列就设置多少个值，取值可以为固定像素，也可以为百分比
```html
<div id="t1">
    <div>0</div>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
    <div>5</div>
    <div>6</div>
    <div>7</div>
    <div>8</div>
</div>
<!-- 
    0 1 2
    3 4 5
    6 7 8
 -->

<style type="text/css">
    #t1{
        display: grid;
        grid-template-rows: 30px 30px 30px;
        grid-template-columns: 30px 30px 30px;
    }
</style>
```

#### repeat
`repeat()`函数可以简化重复的值，其可以自动重复设定的规则
```html
<div id="t2">
    <div>9</div>
    <div>a</div>
    <div>b</div>
    <div>c</div>
    <div>d</div>
    <div>e</div>
</div>
<!-- 9 ab cd e -->

<style type="text/css">
   #t2{
        display: grid;
        grid-template-columns: repeat(3,30px 10px); /* 设定为重复3次 30px 10px 规则 */
    }
</style>
```

#### auto-fill
有时，单元格的大小是固定的，但是容器的大小不确定。如果希望每一行或每一列容纳尽可能多的单元格，这时可以使用`auto-fill`关键字表示自动填充，当容器不足容纳成员时会自适应换行。
```html
<div id="t3" style="width: 60px;">
    <div>f</div>
    <div>g</div>
    <div>h</div>
</div>
<!-- 
    f g
    h 
-->

<style type="text/css">
   #t3{
        display: grid;
        grid-template-columns: repeat(auto-fill,30px);
    }
</style>
```

#### fr
为表示比例关系，网格布局提供了`fr`关键字。如果两列的宽度分别为1fr和2fr，就表示后者是前者的两倍。
```html
<div id="t4">
    <div>i</div>
    <div>j</div>
    <div>k</div>
</div>
<!-- 
    i j  k
-->

<style type="text/css">
   #t4{
        display: grid;
        grid-template-columns: 1fr 2fr 3fr;
    }
</style>
```

#### minmax
`minmax()`函数产生一个长度范围，表示长度就在这个范围之中。它接受两个参数，分别为最小值和最大值，当距离不够时会从最大值自动减少长度或宽度到设定最小值为止。  
`minmax( [ <length> | <percentage> | min-content | max-content | auto ] , [ <length> | <percentage> | <flex> | min-content | max-content | auto ] )`
```html
<div id="t5">
    <div>l</div>
    <div>m</div>
    <div>n</div>
</div>
<!-- 
    l m  n
-->

<style type="text/css">
   #t5{
        display: grid;
        grid-template-columns: 30px minmax(30px,100px) 30px;
    }
</style>
```

#### auto 
`auto`关键字表示由浏览器自己决定长度，基本上等于该列单元格的最大宽度，除非单元格内容设置了`min-width`，且这个值大于最大宽度。
```html
<div id="t6">
    <div>o</div>
    <div>p</div>
    <div>q</div>
</div>
<!-- 
    o p     q
-->

<style type="text/css">
   #t6{
        display: grid;
        grid-template-columns: 10px auto 30px;
    }
</style>
```

### grid-row-gap
grid-row-gap属性设置行与行的间隔，即行间距
```html
<div id="t7">
    <div>r</div>
    <div>s</div>
    <div>t</div>
</div>
<!-- 
    r

    s

    t
-->

<style type="text/css">
   #t7{
        display: grid;
        grid-template-rows: 30px 30px 30px;
        grid-row-gap: 10px;
    }
</style>
```

### grid-column-gap
`grid-column-gap`属性设置列与列的间隔，即列间距
```html
<div id="t8">
    <div>u</div>
    <div>v</div>
    <div>w</div>
</div>
<!-- 
    u  v  w
-->

<style type="text/css">
   #t8{
        display: grid;
        grid-template-columns: repeat(3,30px);
        grid-column-gap: 10px;
    }
</style>
```

### grid-gap
`grid-gap`属性是`grid-column-gap`和`grid-row-gap`的合并简写形式，如果`grid-gap`省略了第二个值，浏览器认为第二个值等于第一个值
```html
<div id="t9">
    <div>x</div>
    <div>y</div>
    <div>z</div>
    <div>A</div>
</div>
<!-- 
    x  y

    z  A
-->

<style type="text/css">
  #t9{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
        grid-gap: 10px 10px;
    }
</style>
```

### grid-template-areas
网格布局允许指定区域`area`，一个区域由单个或多个单元格组成，`grid-template-areas`属性用于定义区域。区域的命名会影响到网格线。每个区域的起始网格线，会自动命名为`{areaName}-start`，终止网格线自动命名为`{areaName-end`
```html
<div id="t10">
    <div>B</div>
    <div>C</div>
    <div>D</div>
    <div>E</div>
</div>
<!-- 
    B C
    D E
-->

<style type="text/css">
  #t10{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
        /* 先划分出4个单元格，然后将其定名为a到d的4个区域，分别对应这4个单元格。*/
        grid-template-areas: 'a b' 'c d';
    }
</style>
```

### grid-auto-flow
划分网格以后，容器的子元素会按照顺序，自动放置在每一个网格。默认的放置顺序是先行后列，通过设置`grid-auto-flow`可以更改为先列后行，`grid-auto-flow`属性除了设置成`row`和`column`，还可以设成`row dense`和`column dense`，这两个值主要用于，某些项目指定位置以后，剩下的项目怎么自动放置。

```html
<div id="t11">
    <div>F</div>
    <div>G</div>
    <div>H</div>
    <div>I</div>
</div>
<!-- 
    F H
    G I
-->

<style type="text/css">
   #t11{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
        grid-auto-flow: column;
    }
</style>
```

### justify-items 
`justify-items`属性设置成员中内容的水平位置，取值为`start | end | center | stretch`
* `stretch`默认值：拉伸，占满单元格的整个宽度。
* `start`：对齐单元格的起始边缘。
* `end`：对齐单元格的结束边缘。
* `center`：单元格内部居中。

```html
<div id="t12">
    <div>J</div>
</div>
<!-- 
    J
-->

<style type="text/css">
    #t12{
        display: grid;
        justify-items: center;
    }
</style>
```

### align-items
`align-items`属性设置成员中内容的垂直位置，取值为`start | end | center | stretch`
* `stretch`默认值：拉伸，占满单元格的整个宽度。
* `start`：对齐单元格的起始边缘。
* `end`：对齐单元格的结束边缘。
* `center`：单元格内部居中。

```html
<div id="t13" style="height: 50px">
    <div>K</div>
</div>
<!-- 
    K
-->

<style type="text/css">
    #t13{
        display: grid;
        align-items: center;
    }
</style>
```

### place-items
`place-items`属性是`align-items`属性和`justify-items`属性的合并简写形式，如果省略第二个值，则浏览器认为与第一个值相等。

```html
<div id="t14" style="height: 50px">
    <div>L</div>
</div>
<!-- 
    L
-->

<style type="text/css">
    #t14{
        display: grid;
        place-items: center center;
    }
</style>
```

### justify-content
`justify-content`属性是整个内容区域在容器里面的水平位置，也就是成员的水平分布，取值为`start | end | center | stretch | space-around | space-between | space-evenly`
```html
<div id="t15">
    <div>M</div>
    <div>N</div>
</div>
<!-- 
    M   N 
-->

<style type="text/css">
    #t15{
        display: grid;
        grid-template-columns: repeat(2,30px);
        justify-content: space-around;
    }
</style>
```

### align-content
`align-content`属性是整个内容区域在容器里面的垂直位置，也就是成员的垂直分布，取值为`start | end | center | stretch | space-around | space-between | space-evenly`
```html
<div id="t16" style="height: 50px;">
    <div>O</div>
    <div>P</div>
</div>
<!-- 
    O P
-->

<style type="text/css">
    #t16{
        display: grid;
        grid-template-columns: repeat(2,30px);
        align-content: center;
    }
</style>
```

### place-content
`place-content`属性是`align-content`属性和`justify-content`属性的合并简写形式，如果省略第二个值，则浏览器认为与第一个值相等。
```html
<div id="t17" style="height: 50px;">
    <div>Q</div>
    <div>R</div>
</div>
<!-- 
    Q   R
-->

<style type="text/css">
    #t17{
        display: grid;
        grid-template-columns: repeat(2,30px);
        place-content: center space-around;
    }
</style>
```

### grid-auto-columns grid-auto-rows
有时候，一些项目的指定位置，在现有网格的外部。比如网格只有`3`列，但是某一个项目指定在第`5`行。这时，浏览器会自动生成多余的网格，以便放置项目。`grid-auto-columns`属性和`grid-auto-rows`属性用来设置，浏览器自动创建的多余网格的列宽和行高。它们的写法与`grid-template-columns`和`grid-template-rows`完全相同。如果不指定这两个属性，浏览器完全根据单元格内容的大小，决定新增网格的列宽和行高。

```html
<div id="t18">
    <div style="grid-row-start: 2;grid-column-start: 2;">S</div>
</div>
<!-- 
     
     S
-->

<style type="text/css">
    #t18{
        display: grid;
        grid-template-columns: repeat(1,30px);
        grid-template-rows: repeat(1,30px);
        grid-auto-rows: 100px; 
        grid-auto-columns: 100px; 
    }
</style>
```

## 项目属性

### grid-column-start grid-column-end
`grid-column-start`属性指定左边框所在的垂直网格线，`grid-column-end`属性指定右边框所在的垂直网格线

```html
<div class="gridBox">
    <div style="grid-row-start: 2;grid-column-start: 2;">T</div>
</div>
<!-- 
     
     T
-->

<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
    }
</style>
```

### grid-row-start grid-row-end
`grid-row-start`属性指定上边框所在的水平网格线，`grid-row-end`属性指定下边框所在的水平网格线
```html
<div class="gridBox">
    <div style="grid-row-start: 2;">U</div>
</div>
<!-- 
     
    U
-->

<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
    }
</style>
```
还可以给轴线命名来指定位置
```html
<div class="gridBox" style="">
    <div style="grid-column-start: c2;grid-row-start: r2;">V</div>
</div>
<!-- 
     
      V
-->

<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns:[c1] 30px [c2] 30px [c3]; /* 指定列并为轴线命名 */
        grid-template-rows:[r1] 30px [r2] 30px [r3]; /* 指定行并为轴线命名 */
    }
</style>
```

### grid-column grid-row
`grid-column`属性是`grid-column-start`和`grid-column-end`的合并简写形式，`grid-row`属性是`grid-row-start`属性和`grid-row-end`的合并简写形式。
```html
<div class="gridBox">
    <div style="grid-column: 2 / 3;grid-row: 2 / 3;">W</div>
</div>
<!-- 
     
      W
-->

<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
    }
</style>
```

### grid-area
`grid-area`属性指定项目放在`grid-template-areas`指定的区域，还可用作`grid-row-start`、`grid-column-start`、`grid-row-end`、`grid-column-end`的合并简写形式，直接指定项目的位置。
```html
<div class="gridBox" style="grid-template-areas: 'a b' 'c d';">
    <div style="grid-area: b;">X</div>
    <div style="grid-area: 2 / 2 / 3 / 3;">Y</div>
</div>
<!-- 
      X
      Y
-->

<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
    }
</style>
```

### justify-self align-self place-self
`justify-self`属性设置单元格内容的水平位置，跟`justify-items`属性的用法完全一致，但只作用于单个项目，取值为`start | end | center | stretch;`。  
`align-self`属性设置单元格内容的垂直位置，跟`align-items`属性的用法完全一致，也是只作用于单个项目，取值为`start | end | center | stretch;`。

* `stretch`默认值：拉伸，占满单元格的整个宽度。
* `start`：对齐单元格的起始边缘。
* `end`：对齐单元格的结束边缘。
* `center`：单元格内部居中。


`place-self`属性是`align-self`属性和`justify-self`属性的合并简写形式。 
```html
<div class="gridBox">
    <div style="place-self: center end;">Z</div>
</div>
<!-- 
    Z
-->

<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
    }
</style>
```