# Float浮动
`CSS`中`float`属性会使元素浮动，使元素向左或向右移动，直到它的外边缘碰到包含框或另一个浮动框的边框为止。

## 实例
* 元素的水平方向浮动，意味着元素只能左右移动而不能上下移动。
* 使用`float`意味着使用块布局，其会在`display`非块级元素情况下修改`display`值的计算值。
* 一个浮动元素会尽量向左或向右移动，直到它的外边缘碰到包含框或另一个浮动框的边框为止。
* 浮动元素会脱离文档流但不会脱离文本流，当浮动时其不会影响周围的盒子模型，但是文字会环绕在浮动元素周围，可以认为文档流与文字流是分层结构而浮动元素盒子与文字元素处于同一层。
* 文档流，指的是盒子元素排版布局过程中，元素会自动从左往右，从上往下的流式排列。
* 文本流，指的是文字元素排版布局过程中，元素会自动从左往右，从上往下的流式排列。
* 脱离文档流，也就是将元素从普通的布局排版中拿走，其他盒子在定位的时候，会当做脱离文档流的元素不存在而进行定位。


```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        body > div{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
        }
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
        }
    </style>
</head>
<body>
    <div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
    </div>
</body>
</html>
```

## 文字环绕效果
可以认为文档流与文字流是分层结构而浮动元素盒子与文字元素处于同一层，当元素浮动时，其脱离文档流不脱离文本流，所以浮动元素的渲染与文字的渲染是一并渲染的，浮动元素会将文字元素挤开，呈现文字环绕浮动元素的效果。
```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        body > div{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
        }
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
            height: 100px;
            width: 100px;
        }
    </style>
</head>
<body>
    <div>
        <div class="t1">Float</div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
    </div>
</body>
</html>
```
虽然`float`最初的设计就是用来实现文字环绕效果的，在某些使用`float`的布局下若是不想触发文字环绕效果，可以通过触发`BFC`来避免文字环绕。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        body > div{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
        }
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
            height: 100px;
            width: 100px;
        }
    </style>
</head>
<body>
    <div>
        <div class="t1">Float</div>
        <div style="overflow: auto;">
            <div>123</div>
            <div>123</div>
            <div>123</div>
            <div>123</div>
            <div>123</div>
            <div>123</div>
            <div>123</div>
        </div>
    </div>
</body>
</html>
```

## 清除浮动
使用浮动可能会导致一些负面影响，由于脱离文档流，无法撑起父元素导致背景以及边框无法正常显示、与其他元素重叠、下层浮动依旧会在上层浮动元素的基础上进行浮动等问题，此时就需要清除浮动。

### 使用clear属性
通过`CSS`的`clear: both;`清除浮动。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        .container{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
        }
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
            height: 100px;
            width: 100px;
        }
        .clear{
            clear: both;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>

        <!-- 此处不清除浮动会产生负面效果 -->

    </div>


    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
        
        <!-- 清除浮动 -->
        <div class="clear"></div>

    </div>

    
    <!-- 若是在此处清除浮动也是可以的 但是会无法撑起容器高度 -->
    
    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>

        <!-- 清除浮动 -->
        <div class="clear"></div>

    </div>
</body>
</html>
```

## 配合::after与clear属性
通过使用伪元素`::after`配合`clear`属性进行浮动清除。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        .container{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
        }
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
            height: 100px;
            width: 100px;
        }
        .container::after{
            clear: both;
            content:"";
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
    </div>

    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
    </div>

</body>
</html>
```

### 触发BFC
触发浮动容器的`BFC`来清除浮动。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        .container{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
            overflow: auto; /* 触发BFC */
        }
        /* BFC 块级格式化上下文 https://github.com/WindrunnerMax/EveryDay/blob/master/CSS/%E5%9D%97%E7%BA%A7%E6%A0%BC%E5%BC%8F%E5%8C%96%E4%B8%8A%E4%B8%8B%E6%96%87.md */
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
            height: 100px;
            width: 100px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
    </div>

    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
    </div>

</body>
</html>
```




## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.cnblogs.com/lingdu87/p/7770752.html
https://developer.mozilla.org/zh-CN/docs/CSS/float
https://www.w3school.com.cn/css/css_positioning_floating.asp
```
