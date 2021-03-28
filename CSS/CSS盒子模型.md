# CSS盒子模型

所有的`HTML`元素都可以看作是一个盒子。  
将盒子模型拆分，则包括 外边距+边框+填充+内容。  
显得专业一些，`box model` = `margin`+`border`+`padding`+`content`。  


```
------------------------------------------
|                 margin                 |  
| -------------------------------------- |
| |               border               | |
| | ---------------------------------- | |
| | |             padding            | | |
| | | ------------------------------ | | |
| | | |           content          | | | |
| | | |                            | | | |
| | | |                            | | | |
| | | ------------------------------ | | |
| | ---------------------------------- | |
|  ------------------------------------- |
------------------------------------------
```

## 盒子成分分析

### margin

```css
#marginShow{
    /* 四个方向简写 */
    margin: 10px;
    /* 上下边距，左右边距简写 */
    margin: 10px 10px;
    /* 上右下左四个边距 */
    margin: 10px 10px 10px 10px;
    /* 上右下左分别单独配置 */
    margin-top: 10px;
    margin-right: 10px;
    margin-left: 10px;
    margin-bottom: 10px;  
}
```

### border

```css
#boderShow{
    /* 简写 */
    border: 1px solid #eee;
    /* 四个方向单独配置 */
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
}
```



### padding

```css
#paddingShow{
    /* 四个方向简写 */
    padding: 10px;
    /* 上下填充，左右填充简写 */
    padding: 10px 10px;
    /* 上右下左四个填充 */
    padding: 10px 10px 10px 10px;
    /* 上右下左分别单独配置 */
    padding-top: 10px;
    padding-right: 10px;
    padding-left: 10px;
    padding-bottom: 10px;  
}
```

## box-sizing属性
`content-box`：默认值，`width`和`height`属性分别应用到元素的内容框。在宽度和高度之外绘制元素的`margin`、`border`、`padding`，称为**标准盒子模型**。  
`border-box`：为元素设定的`width`和`height`属性决定了元素的边框盒，就是说，为元素指定的任何内边距和边框都将在已设定的宽度和高度内进行绘制。通过从已设定的宽度和高度分别减去`border`和`padding`才能得到内容的宽度和高度，称为**IE盒子模型**。  
`inherit`：规定应从父元素继承box-sizing属性的值。

## 浏览器兼容性
一旦为页面设置了恰当的`DTD`，大多数浏览器都会按照上面的图示来呈现内容。然而`IE5`和`IE6` 的呈现却是不正确的。根据`W3C`的规范，元素内容占据的空间是由`width`属性设置的，而内容周围的`padding`和`border`值是另外计算的。不幸的是，`IE5.X`和`IE6`在怪异模式中使用自己的非标准模型。这些浏览器的`width`属性不是内容的宽度，而是内容、内边距和边框的宽度的总和。  
虽然有方法解决这个问题。但是目前最好的解决方案是回避这个问题。也就是，不要给元素添加具有指定宽度的内边距，而是尝试将内边距或外边距添加到元素的父元素和子元素。  
`IE8`及更早`IE`版本不支持设置填充的宽度和边框的宽度属性。  
解决`IE8`及更早版本不兼容问题可以在`HTML`页面声明`<!DOCTYPE html>`即可。

## 测试代码

```html
<!DOCTYPE html>
<html>
<head>
    <title>CSS盒模型</title>
</head>
<body>

    <div class="normal">我是带了一个border盒子</div>

    <div class="hr"></div>

    <div id="marginShow" class="normal">我是带了margin的盒子</div>

    <div class="hr"></div>

    <div id="paddingShow" class="normal">我是带了padding的盒子</div>

    <div class="hr"></div>

    <div id="boxsizeShow" class="normal">我是带了padding+IE盒子模型的盒子</div>


    <style type="text/css">

        .hr{ 
            height: 1px;
            background: #eee;
        }

        .normal{
            color: #fff;
            width: 300px;
            height: 50px;
            background: #1E9FFF;
            border: 1px solid #aaa;
        }
        #marginShow{
            /* 四个方向简写 */
            margin: 10px;
            /* 上下边距，左右边距简写 */
            margin: 10px 10px;
            /* 上右下左四个边距 */
            margin: 10px 10px 10px 10px;
            /* 上右下左分别单独配置 */
            margin-top: 10px;
            margin-right: 10px;
            margin-left: 10px;
            margin-bottom: 10px;  
        }
        #paddingShow{
            /* 四个方向简写 */
            padding: 10px;
            /* 上下填充，左右填充简写 */
            padding: 10px 10px;
            /* 上右下左四个填充 */
            padding: 10px 10px 10px 10px;
            /* 上右下左分别单独配置 */
            padding-top: 10px;
            padding-right: 10px;
            padding-left: 10px;
            padding-bottom: 10px;  
        }
        #boxsizeShow{
            box-sizing: border-box;
            padding: 10px;
        }
    </style>
</body>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```
