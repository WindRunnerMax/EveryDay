# CSS选择器
使用`CSS`对`HTML`页面中的元素实现一对一，一对多或者多对一的控制，这就需要用到选择器。  
`HTML`页面中的元素就是通过`CSS`选择器进行控制的。

## id选择器

```html
<div id="s1">id选择器</div>

<style type="text/css">
    #s1 {
        color: red;
    }
</style>
```

## 类选择器

```html
<div class="s2">类选择器1</div>
<div class="s2">类选择器2</div>
<div class="s3">类选择器3</div>

<style type="text/css">
    .s2{
        color: green;
    }
    
    /* 可以将多个选择器写在一起 */
    .s2,.s3,#s1{
        font-style:italic;
    }
    </style>
```

## 标签选择器
```html
<p>标签选择器1</p>
<p>标签选择器2</p>

<style type="text/css">
    p{
        color: blue;
    }
</style>
```

## 相邻选择器

```html
<div id="s4">相邻选择器 +</div>
<div>相邻选择器</div>
<!-- + 只选择紧邻的兄弟 -->
<div id="s5">相邻选择器 ~</div>
<div class="s6">相邻选择器</div>
<div class="s6">相邻选择器</div>
<div class="s6">相邻选择器</div>
<!-- ~ 选择兄弟以及兄弟的兄弟..... -->

 <style type="text/css">
    #s4 + div{
        color: #0033ff;
    }
    #s5 ~ .s6{
        color: #FFD700;
    }
</style>
```

## 子元素选择器

```html
<div class="s7">
    <div>子元素选择器</div>
    <em>
        <div>子元素选择器不被选择</div>
        <div>子元素选择器不被选择</div>
    </em>
</div>

<style type="text/css">
    /* 子选择器会选择下一级 */
    .s7 > div{
        color: #E066FF;
    }
</style>
```

## 后代选择器

```html
<div class="s8">
    <div>后代选择器</div>
    <em>
        <div>后代选择器</div>
        <div>后代选择器</div>
    </em>
</div>

<style type="text/css">
    /* 后代选择器会选择全部后代 */
    .s8 div{
        color: #7CFC00;
    }
</style>
```

## 通配符选择器

```html
<div class="s9">
    <div>通配符选择器</div>
    <em>通配符选择器</em>
</div>

<style type="text/css">
    .s9 * {
        color: #3370CC
    }
</style>
```

## 属性选择器
```html
<div rel="s10" >属性选择器</div>

<style type="text/css">
    div[rel="s10"]{
        color: #573CC4
    }
</style>
```

## 伪类选择器

```html
<div >
    <div class="s11">伪类选择器例</div>
</div>

<style type="text/css">
    /* 伪类与伪元素参考 https://github.com/WindrunnerMax/EveryDay/blob/master/CSS/%E4%BC%AA%E7%B1%BB%E4%B8%8E%E4%BC%AA%E5%85%83%E7%B4%A0.md */
    .s11:first-child{ 
        color: #55AA55;
    }
</style>
```

## 代码示例

```html
<!DOCTYPE html>
<html>

<head>
    <title>CSS选择器</title>
</head>

<body>
    <div id="s1">id选择器</div>

    <div class="s2">类选择器1</div>
    <div class="s2">类选择器2</div>
    <div class="s3">类选择器3</div>

    <p>标签选择器1</p>
    <p>标签选择器2</p>

    <div id="s4">相邻选择器 +</div>
    <div>相邻选择器</div>
    <!-- + 只选择紧邻的兄弟 -->
    <div id="s5">相邻选择器 ~</div>
    <div class="s6">相邻选择器</div>
    <div class="s6">相邻选择器</div>
    <div class="s6">相邻选择器</div>
    <!-- ~ 选择兄弟以及兄弟的兄弟..... -->

    <div class="s7">
        <div>子元素选择器</div>
        <em>
            <div>子元素选择器不被选择</div>
            <div>子元素选择器不被选择</div>
        </em>
    </div>

    <div class="s8">
        <div>后代选择器</div>
        <em>
            <div>后代选择器</div>
            <div>后代选择器</div>
        </em>
    </div>


    <div class="s9">
        <div>通配符选择器</div>
        <em>通配符选择器</em>
    </div>

    <div rel="s10" >属性选择器</div>

    <div >
        <div class="s11">伪类选择器例</div>
    </div>
    

    <style type="text/css">
    #s1 {
        color: red;
    }

    .s2{
        color: green;
    }

    .s2,.s3,#s1{
        font-style:italic;
    }

    p{
        color: blue;
    }

    #s4 + div{
        color: #0033ff;
    }
    #s5 ~ .s6{
        color: #FFD700;
    }

    /* 子选择器会选择下一级 */
    .s7 > div{
        color: #E066FF;
    }

    /* 后代选择器会选择全部后代 */
    .s8 div{
        color: #7CFC00;
    }

    .s9 * {
        color: #3370CC;
    }

    div[rel="s10"]{
        color: #573CC4;
    }

    .s11:first-child{
        color: #55AA55;
    }
    </style>

</body>

</html>
```
