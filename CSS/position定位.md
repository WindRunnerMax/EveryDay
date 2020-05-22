# position定位
`CSS`中`position`属性是比较常用的元素定位方案，`position`常用的取值有`static`、`relative`、`absolute`、`fixed`、`sticky`、`inherit`。

## static
`static`属性是`HTML`元素的默认值，即没有定位，遵循正常的文档流对象，对于`top`、`bottom`、`left`、`right`、`z-index`属性的设置都被忽略。  
文档流，指的是盒子元素排版布局过程中，元素会自动从左往右，从上往下的流式排列。   
文本流，指的是文字元素排版布局过程中，元素会自动从左往右，从上往下的流式排列。  
脱离文档流，也就是将元素从普通的布局排版中拿走，其他盒子在定位的时候，会当做脱离文档流的元素不存在而进行定位。

```html
<div class="t1">static</div>
<style type="text/css">
    div{
        border: 1px solid #eee;
    }
    .t1{
        position: static;
    }
</style>
```

## relative
`relative`是相对定位，元素的位置是相对其原本位置进行偏移，其不脱离文档流，对于`top`、`bottom`、`left`、`right`、`z-index`属性的设置有效，设置偏移属性后会移动相对定位元素，但它原本所占的空间不会改变，相对定位元素经常被用来作为绝对定位元素的容器块。
```html
<div class="t2">relative</div>
<div>对比查看效果 元素原本占据空间没有变化 但relative会有偏移</div>
<style type="text/css">
    div{
        border: 1px solid #eee;
    }
    .t2{
        position: relative;
        bottom: -10px;
    }
</style>
```


## absolute
`absolute`是绝对定位，元素的位置相对于最近的已定位父元素，如果元素没有已定位的父元素，那么它的位置相对于`<html>`，通常的使用方案是在外层嵌套一层`relative`相对定位元素作为父元素，再设置绝对定位元素的偏移将会相对于外层的`relative`元素进行偏移，绝对定位完全脱离文档流与文本流，不占据文档空间，对于`top`、`bottom`、`left`、`right`、`z-index`属性的设置有效。
```html
<div class="t3">
    <div class="t4">absolute</div>
</div>
<style type="text/css">
    div{
        border: 1px solid #eee;
    }
    .t3{
        height: 300px;
        position: relative;
    }
    .t4{
        position: absolute;
        top: 100px;
    }
</style>
```

## fixed
`fixed`是固定定位，元素的位置相对于浏览器窗口是固定位置，即使是窗口滚动元素也不会移动，注意在`<iframe>`中的元素使用`fixed`是相对于`<iframe>`进行定位的，`<iframe>`类似于在页面中创建了一个新的浏览器窗口，固定定位完全脱离文档流与文本流，不占据文档空间，对于`top`、`bottom`、`left`、`right`、`z-index`属性的设置有效。
```html
<div class="t5">fixed</div>
<style type="text/css">
    div{
        border: 1px solid #eee;
    }
    .t5{
        position: fixed;
        top: 300px;
    }
</style>
```

## sticky 
`sticky`是粘性定位，元素的位置是基于用户的滚动位置来定位，粘性定位的元素是依赖于用户的滚动，在`position: relative`与`position: fixed`定位之间切换，在页面显示时`sticky`的表现类似于`position: relative`，而当页面滚动超出目标区域时`sticky`的表现类似于`position: fixed`，它会固定在目标位置，元素定位表现为在跨越特定阈值前为相对定位，之后为固定定位，这个特定阈值指的是`top`、`right`、`bottom`、`left`其中之一，必须通过指定`top`、`right`、`bottom`、`left`四个阈值其中之一，才可使粘性定位生效，否则其行为与相对定位相同。
```html
<div class="t6">sticky</div>
<style type="text/css">
    div{
        border: 1px solid #eee;
    }
    .t6{
        position: sticky;
        top: 0;
    }
</style>
```

## inherit
`inherit`是通过继承父元素的`position`值来进行定位。
```html
<div class="t7">
    <div class="t8">inherit</div>
</div>
<style type="text/css">
    div{
        border: 1px solid #eee;
    }
    .t7{
        position: relative;
    }
    .t8{
        position: inherit;
        bottom: -10px;
    }
</style>
```

## 代码示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>position</title>
    <style type="text/css">
        div{
            border: 1px solid #eee;
            margin: 5px 0;
        }
        .t1{
            position: static;
        }
        .t2{
            position: relative;
            bottom: -10px;
        }
        .t3{
            height: 300px;
            position: relative;
        }
        .t4{
            position: absolute;
            top: 100px;
        }
        .t5{
            position: fixed;
            top: 300px;
        }
        .t6{
            position: sticky;
            top: 0;
        }
        .t7{
            position: relative;
        }
        .t8{
            position: inherit;
            bottom: -10px;
        }
    </style>
</head>
<body>
    <div class="t1">static</div>
    <div class="t2">relative</div>
    <div>对比查看效果 元素原本占据空间没有变化 但relative会有偏移</div>
    <div class="t3">
        <div class="t4">absolute</div>
    </div>
    <div class="t5">fixed</div>
    <div class="t6">sticky</div>
    <div class="t7">
        <div class="t8">inherit</div>
    </div>
    <div style="height: 1000px">让浏览器出现滚动条</div>
</body>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.zhihu.com/question/21911352
https://www.runoob.com/css/css-positioning.html
https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Normal_Flow
```
