# Common CSS Units
The length units commonly used in CSS include `%`, `px`, `in`, `cm`, `ch`, `mm`, `ex`, `pt`, `pc`, `em`, `rem`, `vw`, `vh`, `vmin`, and `vmax`. These units can be roughly divided into absolute length units, relative length units, and percentage units based on their calculation methods.

## Absolute Length Units

### px (pixels)
In general, a CSS pixel represents one pixel on a screen device. However, on high-resolution screens, one CSS pixel often occupies multiple device pixels. In other words, multiple screen pixels are used to represent `1px`. The formula is `1px = 1in / 96`.

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t1{
        width: 1px;
    }
</style>

<section>
    <div id="t1"></div>
</section>
```

### in (inches)
`1in = 2.54cm = 96px`.

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t2{
        width: 1in;
    }
</style>

<section>
    <div id="t2"></div>
</section>
```

### cm (centimeters)
`1cm = 10mm = 96px/2.54 ≈ 37.8px`.

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t3{
        width: 1cm;
    }
</style>

<section>
    <div id="t3"></div>
</section>
```

### mm (millimeters)
`1mm = 0.1cm = 3.78px`.

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t4{
        width: 1mm;
    }
</style>

<section>
    <div id="t4"></div>
</section>
```

### pt (points)
`1pt = 1/72in ≈ 0.0139in = 1/722.54cm = 1/7296px ≈ 1.33px`.

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t5{
        width: 1pt;
    }
</style>

<section>
    <div id="t5"></div>
</section>
```

### pc (picas)
`1pc = 1/6in = 12pt = 1/6*96px = 16px`.

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t6{
        width: 1pc;
    }
</style>

<section>
    <div id="t6"></div>
</section>
```

## Relative Length Units

### em
`em` represents the computed value of the `font-size` property of an element. If used for the `font-size` property itself, it is relative to the parent element's `font-size`. If used for other properties, it is relative to the element's own `font-size`. It is important to note that using `em` may result in the phenomenon of `1.2 * 1.2 = 1.44`. For example, if the parent element's `font-size` property is set to `16px` and the next level element is set to `1.2em`, the calculated actual pixel value would be `16px * 1.2 = 19.2px`. If the next level element continues to be set to `1.2em`, the calculated value would be `16px * 1.2 * 1.2 = 23.04px`. This is because the parent's base `font-size` property is recalculated to another value. When using `em` in a child element, the `em` value of the child element needs to be recalculated based on the parent element's `font-size`.

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t7 > div{
        background-color: blue;
        font-size: 2em; /* relative to parent element 2 * 10px = 20px */
        width: 5em; /* relative to element itself 5 * 20px = 100px */
    }
</style>

<section class="except">
    <div id="t7">
        <div>Text</div>
    </div>
    <button onclick="emChange()">Change font size</button>
</section>

<script type="text/javascript">
    function emChange(){
        document.getElementById("t7").style["font-size"] = "20px";
    }
</script>
```

```html
<section class="except" style="font-size: 10px;">
    <div style="font-size: 2em"> <!-- 2 * 10px = 20px -->
        <div>Test</div>
        <div style="font-size: 2em"> <!-- 2 * 2 * 10px = 40px -->
            <div>Test</div>
        </div>
    </div>
</section>
```


### rem
The `rem` unit is determined based on the `font-size` of the root element `html`. The `font-size` of the root element serves as a baseline. When the size of the page changes, only the value of `font-size` needs to be changed, and the size of elements using `rem` as the fixed unit will also change accordingly. Since all elements are calculated based on the `font-size` of the root element, there is no phenomenon of `1.2 * 1.2 = 1.44` like `em`. `rem` is not only useful for defining font sizes, but can also be used to base the entire grid system or UI style library on the `font-size` of the HTML root element. This will result in more predictable font sizes and proportional scaling, achieving responsive layouts.

```html
<style type="text/css">
    html{
        font-size: 15px;
    }
    
    div{
        height: 30px;
        background-color: blue;
    }

    #t8 > div{
        background-color: blue;
        font-size: 2rem; /* relative to root element 2 * 15px = 30px */
        width: 6rem; /* relative to root element 6 * 15px = 90px */
    }
</style>

```html
<section class="except">
    <div id="t8">
        <div>Text</div>
    </div>
    <button onclick="remChange()">Change font size</button>
</section>

<script type="text/javascript">
    function remChange(){
        document.getElementsByTagName("html")[0].style["font-size"] = "20px";
    }
</script>
```

```html
<section class="except">
    <div style="font-size: 2rem"> <!-- 2 * 15px = 30px -->
        <div>Test</div>
        <div style="font-size: 2rem"> <!-- 2 * 15px = 30px -->
            <div>Test</div>
        </div>
    </div>
</section>
```

### ex
`ex` refers to the height of the lowercase letter `x` in the font used, but the height of `x` may vary depending on the font. For many fonts, `1ex ≈ 0.5em`, so many browsers use half of the `em` value as the `ex` value. The `ex` unit is commonly used for fine-tuning in practice.

```html
<style type="text/css">
    #t9{
        font-size: 1ex;
    }
</style>

<section class="except">
    <div id="t9">Text</div>
    <span style="font-size: 1em">Text</span>
</section>
```

### ch
`ch` is similar to `ex`, and this unit represents the width of the `0` glyph in the font used by the element, or more precisely, the predicted size of the `0` glyph. If the size of the `0` glyph cannot be determined, it must be assumed that its width is `0.5em` and its height is `1em`, that is, half of the `em` value is taken as the `ch` value.

```html
<style type="text/css">
    #t10{
        font-size: 1ch;
    }
</style>

<section class="except">
    <div id="t10">Text</div>
    <span style="font-size: 1em">Text</span>
</section>
```

## Percentage Units

### %
When the measurement unit is set to a percentage, the width and height of browser components can change accordingly with the size of the browser.
* When a percentage is used in the `height` or `width` of a child element, it is relative to the direct parent element of the child element. The `width` is relative to the parent element's `width`, and the `height` is relative to the parent element's `height`.
* If a percentage is set for the `top` and `bottom` of a child element, it is relative to the height of the directly positioned parent element that is not `static`. Similarly, if a percentage is set for the `left` and `right` of a child element, it is relative to the width of the directly positioned parent element that is not `static`.
* If a percentage is set for the `padding` of a child element, whether in the vertical or horizontal direction, it is relative to the width of the direct parent element, and is independent of the parent element's `height`.
* If a percentage is set for the `margin` of a child element, whether in the vertical or horizontal direction, it is relative to the width of the direct parent element.
* When `border-radius` is set as a percentage, it is relative to the element's own width. Similarly, `translate`, `background-size`, and others are relative to the element's own width.

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t11{
        width: 50%;
    }
</style>
```

<section>
    <div id="t11"></div>
</section>
```

### vh vw vmin vmax
* `vh`: Relative to the height of the viewport, `1vh` is equal to `1%` of the viewport height.
* `vw`: Relative to the width of the viewport, `1vw` is equal to `1%` of the viewport width.
* `vmin`: The smaller value between `vw` and `vh`.
* `vmax`: The larger value between `vw` and `vh`.

```html
<style type="text/css">
    div{
        height: 30px;
        background-color: blue;
    }

    #t12{
        background-color: #fff;
    }

    #t12 > div:nth-child(1){
        width: 50vh;
    }

    #t12 > div:nth-child(2){
        width: 50vw;
    }

    #t12 > div:nth-child(3){
        width: 50vmax;
    }

    #t12 > div:nth-child(4){
        width: 50vmin;
    }
</style>

<section class="">
    <div id="t12">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</section>
```

## Code Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>CSS Units</title>
    <style type="text/css">
        html{
            font-size: 15px;
        }

        section {
            margin: 10px 0;
        }

        div{
            height: 30px;
            background-color: blue;
        }

        .except div{
            height: auto;
            background-color: #fff;
        }

        #t1{
            width: 1px;
        }

        #t2{
            width: 1in;
        }

        #t3{
            width: 1cm;
        }

        #t4{
            width: 1mm;
        }

        #t5{
            width: 1pt;
        }

        #t6{
            width: 1pc;
        }

        #t7{
            background-color: #fff;
            font-size: 10px;
        }

        #t7 > div{
            background-color: blue;
            font-size: 2em; /* Relative to parent element 2 * 10px = 20px */
            width: 5em; /* Relative to element itself 5 * 20px = 100px */
        }

```html
<style>
    #t8 > div{
        background-color: blue;
        font-size: 2rem; /* 2 * 15px = 30px */
        width: 6rem; /* 6 * 15px = 90px */
    }

    #t9{
        font-size: 1ex;
    }

    #t10{
        font-size: 1ch;
    }

    #t11{
        width: 50%;
    }

    #t12{
        background-color: #fff;
    }

    #t12 > div:nth-child(1){
        width: 50vh;
    }

    #t12 > div:nth-child(2){
        width: 50vw;
    }

    #t12 > div:nth-child(3){
        width: 50vmax;
    }

    #t12 > div:nth-child(4){
        width: 50vmin;
    }
</style>
</head>
<body>
    <section>
        <div id="t1"></div>
    </section>

    <section>
        <div id="t2"></div>
    </section>

    <section>
        <div id="t3"></div>
    </section>

    <section>
        <div id="t4"></div>
    </section>

    <section>
        <div id="t5"></div>
    </section>

    <section>
        <div id="t6"></div>
    </section>

    <section class="except">
        <div id="t7">
            <div>Text</div>
        </div>
        <button onclick="emChange()">Change font size</button>
    </section>

    <section class="except" style="font-size: 10px;">
        <div style="font-size: 2em"> <!-- 2 * 10px = 20px -->
            <div>Test</div>
            <div style="font-size: 2em"> <!-- 2 * 2 * 10px = 40px -->
                <div>Test</div>
            </div>
        </div>
    </section>

    <section class="except">
        <div id="t8">
            <div>Text</div>
        </div>
        <button onclick="remChange()">Change font size</button>
    </section>
```

```html
<section class="except">
    <div style="font-size: 2rem"> <!-- 2 * 15px = 30px -->
        <div>Test</div>
        <div style="font-size: 2rem"> <!-- 2 * 15px = 30px -->
            <div>Test</div>
        </div>
    </div>
</section>

<section class="except">
    <div id="t9">Text</div>
    <span style="font-size: 1em">Text</span>
</section>

<section class="except">
    <div id="t10">Text</div>
    <span style="font-size: 1em">Text</span>
</section>

<section>
    <div id="t11"></div>
</section>

<section class="">
    <div id="t12">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</section>

</body>
<script type="text/javascript">
    function emChange(){
        document.getElementById("t7").style["font-size"] = "20px";
    }

    function remChange(){
        document.getElementsByTagName("html")[0].style["font-size"] = "20px";
    }
</script>
</html>
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/ebbf64b83f49
https://www.runoob.com/cssref/css-units.html
https://www.cnblogs.com/niuyaomin/p/12319211.html
https://developer.mozilla.org/zh-CN/docs/Web/CSS/length
https://www.cnblogs.com/liujunhang/articles/10686823.html
https://blog.csdn.net/VickyTsai/article/details/102960594
https://www.w3cplus.com/css/7-css-units-you-might-not-know-about.html
```