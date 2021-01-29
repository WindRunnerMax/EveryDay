# CSS实现展开动画
展开收起效果是比较常见的一种交互方式，通常的做法是控制`display`属性值在`none`和其它值之间切换，虽说功能可以实现，但是效果略显生硬，所以会有这样的需求——希望元素展开收起能具有平滑的效果。


## 实现
首先想到的是通过`height`在`0`与`auto`之间切换，但是结果可能并不会是我们所预期的那样，原因是我们将要展开的元素内容是动态的，即高度值不确定，因此`height`使用的值是默认的`auto`，从`0px`到`auto`是无法计算的，因此无法形成过渡或动画效果。  
据此我们可以使用`max-height`，将`max-height`从`0`过渡到一个能够大于完全显示内部元素的值，展开后的max-height值，只需要设定为保证比展开内容高度大的值即可，在`max-height`值比`height`值大的情况下，元素仍会默认采用自身的高度值即`auto`，如此一来一个高度不定的元素展开收起动画效果就实现了。  
请注意这种方式实现还是有限制的，使用`CSS`进行过渡动画的时候依旧是通过计算`0`到设定的`max-height`高度值进行计算的，在实际应用中如果`max-height`值太大，在元素收起的时候将会产生延迟的效果，这是因为在收起时，`max-height`从设定的特别大的值，到元素自身高度值的变化过程将占用较多时间，此时画面表现则会产生延迟的效果。因此建议将`max-height`值设置为足够安全的最小值，这样在收起时即使有略微延迟，也会因为时间很短，难以被用户感知，将不会影响体验。

```html
<!DOCTYPE html>
<html>
<head>
    <title>展开动画</title>
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
            transition: all .5s;
            max-height: 0;
        }
        .container > .unfold{
            max-height: 150px;
        }
        .container > .btn{
            color: #4C98F7;
            cursor: pointer;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="container">
            <div class="btn" onclick="operate(this)" unfold="1">展开</div>
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
            btn.innerText = "收缩";
            optionsNode.classList.add("unfold");
        }else{
            btn.innerText = "展开";
            optionsNode.classList.remove("unfold");
        }
        btn.setAttribute("unfold", unfold === "0" ? "1" : "0");
    }
</script>
</html>
```

使用`max-height`必定有一定的局限性，那么不如我们在`DOM`加载完成后就取得元素的实际高度并保存，之后直接利用这个真实高度与`0`进行动画过渡即可，因为浏览器的渲染顺序，在解析`JavaScript`时会阻塞`DOM`的渲染，所以在获取元素实际高度再设置高度为`0`的过程中一般不会出现闪烁的情况，如果实在担心因为获取高度之后再将高度设置为`0`可能会有一个闪烁的过程，那么我们可以取得元素父节点后调用`cloneNode(true)`方法或者`innerHTML`方法取得字符串再`innerHTML`到一个新创建的节点，目的就是将其拷贝，之后将其使用绝对定位等放置到屏幕外即将其设置到屏幕能够显示的外部区域，注意此时要设置`body`的`overflow: hidden;`，之后利用`getComputedStyle`取得实际高度，然后再将其移出`DOM`结构，此时有了实际高度就可以进行动画过渡了，下面简单的实现一下在`DOM`加载时便取得实际高度进行动画实现。

```html
<!DOCTYPE html>
<html>
<head>
    <title>展开动画</title>
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
            transition: all .5s;
        }
        .container > .btn{
            color: #4C98F7;
            cursor: pointer;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="container">
            <div class="btn" onclick="operate(this)" unfold="1">展开</div>
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
    (function init(win, doc){
        const optionsNode = document.querySelector(".container > .options");
        optionsNode.setAttribute("real-height", win.getComputedStyle(optionsNode).height);
        optionsNode.style.height = "0px";
    })(window, document);

    function operate(btn){
        const optionsNode = document.querySelector(".container > .options");
        const unfold = btn.getAttribute("unfold");
        const realHeight = optionsNode.getAttribute("real-height");
        if(unfold && unfold==="1"){
            btn.innerText = "收缩";
            optionsNode.style.height = realHeight;
        }else{
            btn.innerText = "展开";
            optionsNode.style.height = "0px";
        }
        btn.setAttribute("unfold", unfold === "0" ? "1" : "0");
    }
</script>
</html>

```



还有一种常用实现动画的方式，即首先将外层元素没有动画过渡的形式直接展开，再将选项加入动画缓慢下落，通常利用`transform: translateY();`去实现这个缓慢下降的动画，在微信的`WEUI`小程序组件库的首页就是采用这种实现方式。

```html
<!DOCTYPE html>
<html>
<head>
    <title>展开动画</title>
    <style type="text/css">
        .page{
            width: 200px;
            padding: 10px 20px;
            border: 1px solid #eee;
        }
        .container, .options-container {
            overflow: hidden;
        }
        .options-container{
            height: 0;
        }
        .container .options{
            transition: all .5s;
            transform: translateY(-100%); 
        }
        .container .unfold{
            transform: translateY(0); 
        }
        .container > .btn{
            color: #4C98F7;
            cursor: pointer;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="container">
            <div class="btn" onclick="operate(this)" unfold="1">展开</div>
            <div class="options-container">
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
    </div>
</body>
<script type="text/javascript">
    function operate(btn){
        const optionsNode = document.querySelector(".container .options");
        const optionsContainer = document.querySelector(".options-container");
        const unfold = btn.getAttribute("unfold");
        if(unfold && unfold==="1"){
            btn.innerText = "收缩";
            optionsNode.classList.add("unfold");
            optionsContainer.style.height = "auto";
        }else{
            btn.innerText = "展开";
            optionsNode.classList.remove("unfold");
            optionsContainer.style.height = "0px";
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
http://www.111com.net/wy/192615.htm
https://zhuanlan.zhihu.com/p/52582555
https://cloud.tencent.com/developer/article/1499033
```

