# CSS实现渐隐渐现效果
实现渐隐渐现效果是比较常见的一种交互方式，通常的做法是控制`display`属性值在`none`和其它值之间切换，虽说功能可以实现，但是效果略显生硬，所以会有这样的需求——希望元素消失时具有平滑的效果。

## 实现

### opacity
`opacity`是用以设置透明度的属性，单纯将`opacity`设置为`0`只能从视觉上隐藏元素，而元素本身依然占据它自己的位置并对网页的布局起作用，它也将响应用户交互例如点击事件，对于其添加过渡属性可以显示动画效果，使用`transitionend`事件监听过渡完成之后隐藏元素，此外对于`opacity`属性，可以利用其透明的视觉效果制作点击劫持攻击。

```html
<!DOCTYPE html>
<html>
<head>
    <title>opacity</title>
    <style type="text/css">
        .page{
            width: 200px;
            padding: 10px 20px;
            border: 1px solid #eee;
        }
        .container {
            overflow: hidden;
        }
        .container > .options{
            opacity: 1;
            transition: all .5s;
        }
        .container > .btn{
            color: #4C98F7;
            cursor: pointer;
            text-decoration: underline;
        }
        .container > .hide{
            display: none;
        }
        .container > .fold{
            opacity: 0;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="container">
            <div class="btn" onclick="operate(this)" unfold="1">隐藏</div>
            <div class="options">
                <div class="option">选项1</div>
                <div class="option">选项2</div>
                <div class="option">选项3</div>
                <div class="option">选项4</div>
                <div class="option">选项5</div>
                <div class="option">选项6</div>
                <div class="option">选项7</div>
            </div>
        </div>
    </div>
</body>
<script type="text/javascript">
    function operate(btn){
        const optionsNode = document.querySelector(".container > .options");
        const unfold = btn.getAttribute("unfold");
        if(unfold && unfold==="1"){
            btn.innerText = "打开";
            optionsNode.classList.add("fold");
            const finish = () => {
                optionsNode.classList.add("hide");
                optionsNode.removeEventListener("transitionend", finish); // 移除监听器
            }
            optionsNode.addEventListener("transitionend", finish); // 添加监听器
        }else{
            btn.innerText = "隐藏";
            optionsNode.classList.remove("hide");
            setTimeout(() => optionsNode.classList.remove("fold"));
        }
        btn.setAttribute("unfold", unfold === "0" ? "1" : "0");
    }
</script>
</html>
```

### visibility opacity
当`visibility`属性值为`hidden`的时候，元素将会隐藏，也会占据着自己的位置，并对网页的布局起作用，与`opacity`不同的是它不会响应任何用户交互，元素在读屏软件中也会被隐藏，如果对于子元素的`visibility`被设置为`visible`而父元素的`visibility`设置为`hidden`，子元素依旧可以显示而父元素会被隐藏，这个属性在兼容性方面需要在`IE 9`以上的浏览器才能使用。此外从`visibility: hidden;`到`visibility: visible;`变化时，如果设置了过渡时间为`3s`，那么在事件发生后，元素并不会立即呈现出从`hidden`到`visible`的效果，而是会先等待`3s`，然后再瞬间隐藏，从显示到最终消失视线中的时间确实`3s`，只不过并不是逐渐过渡出现的，所以通常为了实现过渡效果，我们与`opacity`一起使用来完成过渡效果。

```html
<!DOCTYPE html>
<html>
<head>
    <title>opacity</title>
    <style type="text/css">
        .page{
            width: 200px;
            padding: 10px 20px;
            border: 1px solid #eee;
        }
        .container {
            overflow: hidden;
        }
        .container > .options{
            opacity: 1;
            visibility: visible;
            transition: all .5s;
        }
        .container > .btn{
            color: #4C98F7;
            cursor: pointer;
            text-decoration: underline;
        }
        .container > .hide{
            display: none;
        }
        .container > .fold{
            opacity: 0;
            visibility: hidden;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="container">
            <div class="btn" onclick="operate(this)" unfold="1">隐藏</div>
            <div class="options">
                <div class="option">选项1</div>
                <div class="option">选项2</div>
                <div class="option">选项3</div>
                <div class="option">选项4</div>
                <div class="option">选项5</div>
                <div class="option">选项6</div>
                <div class="option">选项7</div>
            </div>
        </div>
    </div>
</body>
<script type="text/javascript">
    function operate(btn){
        const optionsNode = document.querySelector(".container > .options");
        const unfold = btn.getAttribute("unfold");
        if(unfold && unfold==="1"){
            btn.innerText = "打开";
            optionsNode.classList.add("fold");
            const finish = () => {
                optionsNode.classList.add("hide");
                optionsNode.removeEventListener("transitionend", finish); // 移除监听器
            }
            optionsNode.addEventListener("transitionend", finish); // 添加监听器
        }else{
            btn.innerText = "隐藏";
            optionsNode.classList.remove("hide");
            setTimeout(() => optionsNode.classList.remove("fold"));
        }
        btn.setAttribute("unfold", unfold === "0" ? "1" : "0");
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
https://juejin.cn/post/6844903497998024711
https://www.cnblogs.com/MrZhujl/p/10315177.html
https://blog.csdn.net/u012767761/article/details/87369414
```