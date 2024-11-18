# Methods to Hide Elements with CSS
The main ways to hide elements using `CSS` are `display: none;`, `opacity: 0;`, `visibility: hidden;`, `position: absolute; overflow: hidden;`, `clip-path: polygon(0 0, 0 0, 0 0, 0 0);`, `height: 0; overflow: hidden;`.

## display
The `display: none;` property truly hides the element. When this property is used, the hidden element does not take up any space, user interaction events such as click events do not work, and screen readers do not read the content of the element. Any child elements of this element will also be hidden. When using this property to switch an element from a visible state to a hidden state, the element does not occupy the original space and triggers the browser's repaint and reflow. Adding a transition animation to this property is ineffective; the transition between any different state values always takes effect immediately. The effect produced by this method is as if the element does not exist at all, but it can still be accessed in the `DOM` and manipulated through the `DOM`.

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
        alert("It will be hidden after the first click, and cannot be clicked again");
        e.srcElement.classList.add("display-hide");
    })
</script>
```

## opacity
`opacity` is used to set the transparency of an element. Setting `opacity` to `0` only visually hides the element, while the element itself still occupies its own position and affects the layout of the webpage. It will also respond to user interactions such as click events, and adding a transition property to it can display animation effects. For the `opacity` property, its transparent visual effect can be used to create clickjacking attacks.

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
        alert("It will become transparent after the first click, still occupying the original position, click events still work, and the transition animation effect takes effect");
        e.srcElement.classList.add("opacity-hide");
    })
</script>
```

## visibility
When the value of the `visibility` property is set to `hidden`, the element will be hidden, but it will still occupy its own position and affect the layout of the webpage. Unlike `opacity`, it does not respond to any user interactions. The element will also be hidden in screen readers. If the `visibility` of a child element is set to `visible` while the `visibility` of the parent element is set to `hidden`, the child element will still be displayed while the parent element is hidden.

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

```html
<section>
    <div id="t6" style="height: 100px;">height</div>
</section>

<script type="text/javascript">
    document.getElementById("t6").addEventListener("click", e => {
        alert("第一次点击会隐藏，元素不占据原本位置，过渡动画有效");
        e.srcElement.classList.add("height-hide");
    })
</script>
```

```html
<section>
    <div id="t6">height</div>
</section>

<script type="text/javascript">
    document.getElementById("t6").addEventListener("click", e => {
        alert("The first click will hide the element, it will not occupy the original position, the click event will no longer take effect, and the transition animation will be effective");
        e.srcElement.classList.add("height-hide");
    })
</script>
```

## Code Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Hide Element</title>
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
```

```html
<section>
    <div id="t5">clip-path</div>
</section>

<section>
    <div id="t6">height</div>
</section>
</body>
<script type="text/javascript">
    document.getElementById("t1").addEventListener("click", e => {
        alert("The first click will hide it, and it can no longer be clicked afterwards.");
        e.srcElement.classList.add("display-hide");
    })

    document.getElementById("t2").addEventListener("click", e => {
        alert("The first click will make it transparent, still occupying the original position, and the click event is still valid. The transition animation takes effect.");
        e.srcElement.classList.add("opacity-hide");
    })

    document.getElementById("t3").addEventListener("click", e => {
        alert("The first click will hide it, still occupying the original position, and the click event is no longer valid.");
        e.srcElement.classList.add("visibility-hide");
    })

    document.getElementById("t4").addEventListener("click", e => {
        alert("The first click will hide it, and the element will not occupy the original position. The transition animation takes effect.");
        e.srcElement.classList.add("position-hide");
    })

    document.getElementById("t5").addEventListener("click", e => {
        alert("The first click will hide it, and the element will occupy the original position, and the click event is no longer valid.");
        e.srcElement.classList.add("clip-path-hide");
    })

    document.getElementById("t6").addEventListener("click", e => {
        alert("The first click will hide it, and the element will not occupy the original position. The click event is no longer valid, and the transition animation takes effect.");
        e.srcElement.classList.add("height-hide");
    })
</script>
</html>
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.cnblogs.com/jing-tian/p/10969109.html
https://blog.csdn.net/cuo9958/article/details/53559826
https://blog.csdn.net/weixin_41910848/article/details/81875725
```