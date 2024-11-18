# CSS Implementation of Fade In and Fade Out Effect
Implementing a fade in and fade out effect is a common way to enhance user interaction. The usual approach is to toggle the `display` property value between `none` and other values. While this method achieves the desired functionality, the effect can appear abrupt and rigid. Therefore, there is a demand for a smoother transition when elements disappear.

## Implementation

### opacity
The `opacity` property is used to set the transparency of an element. Simply setting `opacity` to `0` visually hides the element, but it still occupies its original position and affects the layout of the webpage. It will also respond to user interactions such as click events. To add animation effects, we can use the `transitionend` event to listen for the completion of the transition and then hide the element. Additionally, the transparent visual effect of the `opacity` property can be exploited for clickjacking attacks.

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
            <div class="btn" onclick="operate(this)" unfold="1">Hide</div>
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
            btn.innerText = "Open";
            optionsNode.classList.add("fold");
            const finish = () => {
                optionsNode.classList.add("hide");
                optionsNode.removeEventListener("transitionend", finish); // Remove the listener
            }
            optionsNode.addEventListener("transitionend", finish); // Add the listener
        }else{
            btn.innerText = "Hide";
            optionsNode.classList.remove("hide");
            setTimeout(() => optionsNode.classList.remove("fold"));
        }
        btn.setAttribute("unfold", unfold === "0" ? "1" : "0");
    }
</script>
</html>
```

### visibility opacity
When the `visibility` property value is set to `hidden`, the element will be hidden but still occupy its own space and affect the layout of the webpage. Unlike `opacity`, it does not respond to any user interactions and will also be hidden in screen reading software. If the `visibility` of a child element is set to `visible` while the `visibility` of its parent element is set to `hidden`, the child element will still be visible while the parent element is hidden. This property requires a browser version of `IE 9` or above for compatibility. 

Furthermore, when transitioning from `visibility: hidden;` to `visibility: visible;`, if a transition time of `3s` is set, the element will not immediately show the transition effect from `hidden` to `visible` after the event occurs. Instead, it will wait for `3s` and then instantly hide, making the total time from display to final disappearance `3s`. However, the transition is not gradual. Therefore, in order to achieve a transition effect, we usually use it together with `opacity`.

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
            <div class="btn" onclick="operate(this)" unfold="1">Hide</div>
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
            btn.innerText = "Open";
            optionsNode.classList.add("fold");
            const finish = () => {
                optionsNode.classList.add("hide");
                optionsNode.removeEventListener("transitionend", finish); // Remove the listener
            }
            optionsNode.addEventListener("transitionend", finish); // Add the listener
        }else{
            btn.innerText = "Hide";
            optionsNode.classList.remove("hide");
            setTimeout(() => optionsNode.classList.remove("fold"));
        }
        btn.setAttribute("unfold", unfold === "0" ? "1" : "0");
    }
</script>
</html>
```

```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://juejin.cn/post/6844903497998024711
https://www.cnblogs.com/MrZhujl/p/10315177.html
https://blog.csdn.net/u012767761/article/details/87369414
```