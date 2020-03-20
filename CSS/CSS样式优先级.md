# CSS优先级

当样式表比较复杂时，很容易出现多个样式对作用于一个标签的情况，这时就需要注意`CSS`优先级来决定哪些样式会被作用于该标签，哪些会被覆盖。

## 选择器的优先级
对于标签自有的属性，选择器的优先级规则为  

```
内联样式 > ID 选择器 > 类选择器 = 属性选择器 = 伪类选择器 > 标签选择器 = 伪元素选择器
```
当如下几个选择器作用于同一个标签时本例显示的颜色为`red`，可以在浏览器的`Elements`选中相应元素，在`Styles`查看样式的覆盖情况并调试。
```html
<div id="i1" class="c1">T1</div>

<style type="text/css">
    #i1 {
        color: red;
    }
    .c1 {
        color: blue;
    }
    :nth-child(1){
        color: green;
    }
    div {
        color: grey;
    }
</style>
```

## 选择符的优先级
选择符是由基本选择器组成，基本分为

```
后代选择符: #i1 .c1 .c2
子选择符：#i1 > .c1 > .c2
相邻选择符：.c1 + .c2
```
计算选择符中 **`ID`选择器**的个数`a`，计算选择符中**类选择器、属性选择器以及伪类选择**器的个数之和`b`，计算选择符中**标签选择器和伪元素选择器**的个数之和`c`。按`a`、`b`、`c`的顺序依次比较大小，大的则优先级高，相等则比较下一个。若最后两个的选择符中`a`、`b`、`c`都相等，则按照"就近原则"来判断，此外，拥有`!important`的属性具有最高的优先级。

```html
<div id="i2" class="c2">
    <div>T2</div>
</div>
<style type="text/css">
    #i2 div {
        color: red;
    }
    .c2 > div {
        color: green;
    }
    div > div {
        color: blue;
    }
    :nth-child(1){
        color: black;
    }
    div {
        color: grey;
    }
</style>

第一个选择符 a:1 b:0 c:1
第二个选择符 a:0 b:1 c:1
第三个选择符 a:0 b:0 c:2
第四个选择符 a:0 b:1 c:0
第五个选择符 a:0 b:0 c:1
优先级顺序依次为: 1 2 4 3 5
```

> 引自 https://www.runoob.com/w3cnote/css-style-priority.html  
> 在学习过程中，你可能发现给选择器加权值的说法，即 ID 选择器权值为 100，类选择器权值为 10，标签选择器权值为 1，当一个选择器由多个 ID 选择器、类选择器或标签选择器组成时，则将所有权值相加，然后再比较权值。这种说法其实是有问题的。比如一个由 11 个类选择器组成的选择器和一个由 1 个 ID 选择器组成的选择器指向同一个标签，按理说 110 > 100，应该应用前者的样式，然而事实是应用后者的样式。错误的原因是：权重的进制是并不是十进制，CSS 权重进制在 IE6 为 256，后来扩大到了 65536，现代浏览器则采用更大的数量。还是拿刚刚的例子说明。11 个类选择器组成的选择器的总权值为 110，但因为 11 个均为类选择器，所以其实总权值最多不能超过 100， 你可以理解为 99.99，所以最终应用后者样式。

## 多重样式优先级
外部样式表和内部样式表的优先级由其引入顺序有关，一般认为内部样式优先级大于外部样式，也可以认为其相等，因为外部样式放在内部样式的后面引入，则外部样式将覆盖内部样式。

```
内联样式 > 内部样式 > 外部样式 > 浏览器默认样式
```

## 继承样式
一般来说对于文字样式的设置都会具有继承性，例如`font-family`、`font-size`、`font-weight`、`color`等等，当需要继承样式时，最近的祖先样式比其他祖先样式优先级高。

```html
<div style="color: red;">
        <div style="color: blue;">
            <div >T3</div> <!-- 显示蓝色 -->
        </div>
    </div>
```

## 代码

```html
<!DOCTYPE html>
<html>

<head>
    <title>CSS样式优先级</title>
</head>
<style type="text/css">
    #i1 {
        color: red;
    }
    .c1 {
        color: blue;
    }
    :nth-child(1){
        color: green;
    }
    div {
        color: grey;
    }

    #i2 div {
        color: red;
    }
    .c2 > div {
        color: green;
    }
    div > div {
        color: blue;
    }
</style>

<body>
    <div id="i1" class="c1">T1</div>
    <br>
    <div id="i2" class="c2">
        <div>T2</div>
    </div>
    <br>
    <div style="color: red;">
        <div style="color: blue;">
            <div style="color: inherit;">T3</div> <!-- 显示蓝色 -->
        </div>
    </div>
</body>

</html>
```
