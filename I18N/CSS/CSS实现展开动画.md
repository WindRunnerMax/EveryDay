# CSS Implementation of Expand Animation
The expand and collapse effect is a common interaction method. The usual approach is to toggle the `display` property value between `none` and other values. Although this method can achieve the desired functionality, the effect may appear a bit abrupt. Therefore, there is a demand for a smooth animation when expanding and collapsing elements.

## Implementation

### max-height
The first thought is to use `height` to toggle between `0` and `auto`. However, the result may not be as expected. The reason is that the content of the element to be expanded is dynamic, meaning that the height value is uncertain. Therefore, the value used for `height` is the default value `auto`. Transition or animation effects cannot be calculated from `0px` to `auto`.

Based on this, we can use `max-height` instead. Transitioning `max-height` from `0` to a value that is greater than the height of the fully displayed internal elements will achieve the desired expand effect. The value of `max-height` after expanding only needs to be set to a value greater than the height of the expanded content. In the case where the `max-height` value is greater than the `height` value, the element will still default to its own height value, which is `auto`. This way, an element with an indeterminate height can achieve an expand and collapse animation effect.

Please note that there are still limitations to this implementation method. When using CSS for transition animations, it still calculates the transition from `0` to the specified `max-height` value. In practical applications, if the `max-height` value is too large, there may be a delay effect when collapsing the element. This is because during the collapse, the transition from the set large value of `max-height` to the height value of the element itself will take up a significant amount of time. As a result, there will be a delay in the visual representation. Therefore, it is recommended to set the `max-height` value to a sufficiently small value to ensure that even if there is a slight delay during the collapse, it will be too short to be perceived by the user, thus not affecting the user experience.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Expand Animation</title>
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
            <div class="btn" onclick="operate(this)" unfold="1">Expand</div>
            <div class="options">
                <div class="option">Option 1</div>
                <div class="option">Option 2</div>
                <div class="option">Option 3</div>
                <div class="option">Option 4</div>
                <div class="option">Option 5</div>
                <div class="option">Option 6</div>
                <div class="option">Option 7</div>
            </div>
        </div>
    </div>
</body>
<script type="text/javascript">
    function operate(btn){
        const optionsNode = document.querySelector(".container > .options");
        const unfold = btn.getAttribute("unfold");
        if(unfold && unfold==="1"){
            btn.innerText = "Collapse";
            optionsNode.classList.add("unfold");
        }else{
            btn.innerText = "Expand";
            optionsNode.classList.remove("unfold");
        }
        btn.setAttribute("unfold", unfold === "0" ? "1" : "0");
    }
</script>
</html>
```

### height
Using `max-height` has its limitations, so why not get the actual height of the element after the `DOM` is loaded and save it? Then we can directly animate the transition between this real height and `0`. Because the browser's rendering order blocks the rendering of the `DOM` when parsing `JavaScript`, there is generally no flickering when getting the actual height of the element and setting the height to `0`. If you are concerned that there may be a flickering process when getting the height and then setting it to `0`, you can get the parent node of the element and call the `cloneNode(true)` method or the `innerHTML` method to get the string and `innerHTML` it into a newly created node. The purpose is to copy it and then place it outside the screen using absolute positioning, etc., so that it is set to an area outside the screen that can be displayed. Note that at this time, you need to set `body`'s `overflow: hidden;`. Then use `getComputedStyle` to get the actual height, and then remove it from the `DOM` structure. With the actual height, you can perform the animation transition. Below is a simple implementation of getting the actual height when the `DOM` is loaded and implementing the animation.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Expand Animation</title>
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
            <div class="btn" onclick="operate(this)" unfold="1">Expand</div>
            <div class="options">
                <div class="option">Option 1</div>
                <div class="option">Option 2</div>
                <div class="option">Option 3</div>
                <div class="option">Option 4</div>
                <div class="option">Option 5</div>
                <div class="option">Option 6</div>
                <div class="option">Option 7</div>
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
```

```javascript
function operate(btn) {
    const optionsNode = document.querySelector(".container > .options");
    const unfold = btn.getAttribute("unfold");
    const realHeight = optionsNode.getAttribute("real-height");
    if (unfold && unfold === "1") {
        btn.innerText = "Collapse";
        optionsNode.style.height = realHeight;
    } else {
        btn.innerText = "Expand";
        optionsNode.style.height = "0px";
    }
    btn.setAttribute("unfold", unfold === "0" ? "1" : "0");
}
</script>
</html>

```

### translateY
There is another commonly used way to implement animations, which is to first expand the outer element without animation transition, and then add the options with a slow downward animation. This is usually achieved using `transform: translateY();` to achieve the slow descent animation. The homepage of the `WEUI` mini-program component library in WeChat uses this implementation method.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Expand Animation</title>
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
            <div class="btn" onclick="operate(this)" unfold="1">Expand</div>
            <div class="options-container">
                <div class="options">
                    <div class="option">Option 1</div>
                    <div class="option">Option 2</div>
                    <div class="option">Option 3</div>
                    <div class="option">Option 4</div>
                    <div class="option">Option 5</div>
                    <div class="option">Option 6</div>
                    <div class="option">Option 7</div>
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
            btn.innerText = "Collapse";
            optionsNode.classList.add("unfold");
            optionsContainer.style.height = "auto";
        }else{
            btn.innerText = "Expand";
            optionsNode.classList.remove("unfold");
            optionsContainer.style.height = "0px";
        }
        btn.setAttribute("unfold", unfold === "0" ? "1" : "0");
    }
</script>
</html>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
http://www.111com.net/wy/192615.htm
https://zhuanlan.zhihu.com/p/52582555
https://cloud.tencent.com/developer/article/1499033
```