# CSS隐藏元素的方法
使用`CSS`隐藏元素的主要方式有`diaplay: none;`、`opacity: 0;`、`visibility: hidden;`、`position: absolute; overflow: hidden;`、`clip-path: polygon(0 0, 0 0, 0 0, 0 0);`、`height: 0; overflow: hidden;`。

## diaplay
`display: none;`属性依照词义是真正隐藏元素，使用这个属性，被隐藏的元素不占据任何空间，用户交互操作例如点击事件都不会生效，读屏软件也不会读到元素的内容，这个元素的任何子元素也会同时被隐藏。当使用该属性将元素从显示状态切换为隐藏状态时，元素不占据原本的空间，会触发浏览器的重绘与回流。为这个属性添加过渡动画是无效的，他的任何不同状态值之间的切换总是会立即生效。这种方式产生的效果就像元素完全不存在，但在`DOM`中依然可以访问到这个元素，也可以通过`DOM`来操作它。

```html
<style type="text/css">
    .display-hide{
        display: none;
    }
</style>

<section>
    <div id="t1"></div>
</section>

<script type="text/javascript">
    document.getElementById("t1").addEventListener("click", e => {
        alert("第一次点击会隐藏，此后再也无法点击");
        e.srcElement.classList.add("display-hide");
    })
</script>
```

## opacity
`opacity`是用以设置透明度的属性，将`opacity`设置为`0`只能从视觉上隐藏元素，而元素本身依然占据它自己的位置并对网页的布局起作用，它也将响应用户交互例如点击事件，对于其添加过渡属性可以显示动画效果。对于`opacity`属性，可以利用其透明的视觉效果制作点击劫持攻击。

```html
<style type="text/css">
    .opacity-hide{
        opacity: 0;
    }
</style>

<section>
    <div id="t2">opacity</div>
</section>

<script type="text/javascript">
    document.getElementById("t2").addEventListener("click", e => {
        alert("第一次点击会透明，依旧占据原本位置，点击事件依旧有效，动画过渡效果生效");
        e.srcElement.classList.add("opacity-hide");
    })
</script>
```

## visibility
当`visibility`属性值为`hidden`的时候，元素将会隐藏，也会占据着自己的位置，并对网页的布局起作用，与`opacity`不同的是它不会响应任何用户交互，元素在读屏软件中也会被隐藏，如果对于子元素的`visibility`被设置为`visible`而父元素的`visibility`设置为`hidden`，子元素依旧可以显示而父元素会被隐藏。

```html
<style type="text/css">
    .visibility-hide{
        visibility: hidden;
    }
</style>

<section>
    <div id="t3">
        <div>visibility</div>
        <div style="visibility: visible; color: #000;">still show</div>
    </div>
</section>

<script type="text/javascript">
    document.getElementById("t3").addEventListener("click", e => {
        alert("第一次点击会隐藏，依旧占据原本位置，点击事件不再生效");
        e.srcElement.classList.add("visibility-hide");
    })
</script>
```

## position
使用`position`与`overflow`属性的意义就是把元素脱离文档流移出视觉区域，超出屏幕显示的部分隐藏掉，使用这两个属性隐藏主要就是通过控制方向`top`、`left`、`right`、`bottom`达到一定的值，离开当前显示区域并将超出部分裁剪，此外在未隐藏时设定好相关样式，在动态添加`class`时即可实现过渡动画。

```html
<style type="text/css">
    body{
        overflow: hidden;
    }
    
    .posistion-origin{
        position: absolute;
        left: 5px;
        top: 5px;
    }

    .position-hide{
        left: -150px;
    }
</style>

<section style="position: relative;height: 115px;">
    <div id="t4" class="posistion-origin" >position</div>
</section>

<script type="text/javascript">
    document.getElementById("t4").addEventListener("click", e => {
        alert("第一次点击会隐藏，元素不占据原本位置，过渡动画有效");
        e.srcElement.classList.add("position-hide");
    })
</script>
```

## clip-path
`clip-path`属性使用裁剪方式创建元素的可显示区域，区域内的部分显示，区域外的隐藏，直接将元素裁剪之后即可实现隐藏效果，该属性兼容性一般，具体可以查阅`https://caniuse.com/#search=clip-path`。

```html
<style type="text/css">
    .clip-path-hide{
        clip-path: polygon(0 0, 0 0, 0 0, 0 0);
    }
</style>

<section>
    <div id="t5" >clip-path</div>
</section>

<script type="text/javascript">
    document.getElementById("t5").addEventListener("click", e => {
        alert("第一次点击会隐藏，元素占据原本位置，点击事件不再生效");
        e.srcElement.classList.add("clip-path-hide");
    })
</script>
```

## height
类似于`position`与`overflow`的组合，使用`height: 0;`将元素高度设置为`0`，使用`overflow: hidden`将超出部分裁剪隐藏，即可实现隐藏效果，如果需要使用这两个属性制呈现过渡动画的话，需要将`height`给予一个确定的值，不能是`auto`。

```html
<style type="text/css">
    .height-hide{
        height: 0 !important;
        overflow: hidden;
    }
</style>

<section>
    <div id="t6" >height</div>
</section>

<script type="text/javascript">
    document.getElementById("t6").addEventListener("click", e => {
        alert("第一次点击会隐藏，元素不占据原本位置，点击事件不再生效，过渡动画有效");
        e.srcElement.classList.add("height-hide");
    })
</script>
```

## 代码示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>隐藏元素</title>
    <style type="text/css">

        body{
            overflow: hidden;
        }

        section > div:first-child{
            width: 100px;
            height: 100px;
            background-color: blue;
        }

        section{
            border-bottom: 1px solid #eee;
            padding: 5px;
            box-sizing: border-box;
        }

        div{
            color: #fff;
            transition: all .3s;
        }

        .display-hide{
            display: none;
        }

        .opacity-hide{
            opacity: 0;
        }

        .visibility-hide{
            visibility: hidden;
        }

        .posistion-origin{
            position: absolute;
            left: 5px;
            top: 5px;
        }

        .position-hide{
            left: -150px;
        }

        .clip-path-hide{
            clip-path: polygon(0 0, 0 0, 0 0, 0 0);
        }

        .height-hide{
            height: 0 !important;
            overflow: hidden;
        }

    </style>
</head>
<body>
    <section>
        <div id="t1">display</div>
    </section>

    <section>
        <div id="t2">opacity</div>
    </section>

    <section>
        <div id="t3">
            <div>visibility</div>
            <div style="visibility: visible; color: #000;">still show</div>
        </div>
    </section>

    <section style="position: relative;height: 115px;">
        <div id="t4" class="posistion-origin" >position</div>
    </section>

    <section>
        <div id="t5" >clip-path</div>
    </section>

    <section>
        <div id="t6" >height</div>
    </section>
</body>
    <script type="text/javascript">
        document.getElementById("t1").addEventListener("click", e => {
            alert("第一次点击会隐藏，此后再也无法点击");
            e.srcElement.classList.add("display-hide");
        })

        document.getElementById("t2").addEventListener("click", e => {
            alert("第一次点击会透明，依旧占据原本位置，点击事件依旧有效，动画过渡效果生效");
            e.srcElement.classList.add("opacity-hide");
        })

        document.getElementById("t3").addEventListener("click", e => {
            alert("第一次点击会隐藏，依旧占据原本位置，点击事件不再生效");
            e.srcElement.classList.add("visibility-hide");
        })

        document.getElementById("t4").addEventListener("click", e => {
            alert("第一次点击会隐藏，元素不占据原本位置，过渡动画有效");
            e.srcElement.classList.add("position-hide");
        })

        document.getElementById("t5").addEventListener("click", e => {
            alert("第一次点击会隐藏，元素占据原本位置，点击事件不再生效");
            e.srcElement.classList.add("clip-path-hide");
        })

        document.getElementById("t6").addEventListener("click", e => {
            alert("第一次点击会隐藏，元素不占据原本位置，点击事件不再生效，过渡动画有效");
            e.srcElement.classList.add("height-hide");
        })
    </script>
</html>
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.cnblogs.com/jing-tian/p/10969109.html
https://blog.csdn.net/cuo9958/article/details/53559826
https://blog.csdn.net/weixin_41910848/article/details/81875725
```
