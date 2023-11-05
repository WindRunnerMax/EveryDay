# CSS3 New Features
`CSS3` is the latest `CSS` standard, designed to extend `CSS2.1`.

## Border Radius
The `border-radius` property can be used to create rounded corners for any element.
* `border-radius`: Shorthand for all four corner `border-*-*-radius` properties.
* `border-top-left-radius`: Defines the radius of the top left corner.
* `border-top-right-radius`: Defines the radius of the top right corner.
* `border-bottom-right-radius`: Defines the radius of the bottom right corner.
* `border-bottom-left-radius`: Defines the radius of the bottom left corner.

```html
<div id="t1"></div>
<style type="text/css">
    #t1{
        height: 100px;
        width: 100px;
        background-color: blue;
        border-radius: 10px;
    }
</style>
```

## Box Shadow
`box-shadow: h-shadow v-shadow blur spread color inset`  
* `h-shadow`: Required. The horizontal position of the shadow, allows negative values.
* `v-shadow`: Required. The vertical position of the shadow, allows negative values.
* `blur`: Optional. The blur distance.
* `spread`: Optional. The size of the shadow.
* `color`: Optional. The color of the shadow. See the complete list of CSS color values.
* `inset`: Optional. Changes the shadow from an outer shadow to an inner shadow.

```html
<div id="t2"></div>
<style type="text/css">
    #t2{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        box-shadow: 5px 5px 5px #aaa;
    }
</style>
```

## Background
`CSS3` includes several new background properties that provide greater control over background elements. 
* `background-image`: Specifies the path to the background image.
* `background-clip`: Specifies the painting area of the background.
* `background-origin`: Specifies the positioning area of the background image.
* `background-size`: Specifies the size of the background image.

```html
<div id="t3"></div>
<style type="text/css">
    #t3{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        background-image: url(https://blog.touchczy.top/favicon.ico);
        background-size:30px 30px;
        background-repeat:repeat;
        background-origin:content-box;
    }
</style>
```

## Gradients
`CSS3` gradients allow for smooth transitions between two or more specified colors. 
* `Linear Gradients`: Linear gradients can be applied in the downward, upward, leftward, rightward, or diagonal direction.
* `Radial Gradients`: Radial gradients are defined by their center.

```html
<div id="t4"></div>
<style type="text/css">
    #t4{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        background-image: linear-gradient(to right, red , yellow);
    }
</style>
```

## Text Effects
`CSS3` provides more support for text effects.
* `hanging-punctuation`: Specifies whether punctuation characters should hang outside the line box.
* `punctuation-trim`: Specifies whether punctuation characters should be trimmed.
* `text-align-last`: Sets how to align the last line or the line immediately before a forced line break.
* `text-emphasis`: Applies emphasis marks and the foreground color to an element's text.
* `text-justify`: Specifies the justification method to use when `text-align` is set to `justify`.
* `text-outline`: Specifies the outline of text.
* `text-overflow`: Specifies what should happen when text overflows the containing element.
* `text-shadow`: Adds shadows to text.
* `text-wrap`: Specifies the line-breaking rules for text.
* `word-break`: Specifies the line-breaking rules for non-CJK text.
* `word-wrap`: Allows long, unbreakable words to be broken and wrap to the next line.

```html
<div id="t5">Text</div>
<style type="text/css">
    #t5{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        color: #fff;
        text-shadow: -1px 3px 5px #333;
    }
</style>
```

## Fonts
`CSS3` allows the use of the `@font-face` rule to load desired fonts.
* `font-family`: Required. Specifies the name of the font.
* `src`: Required. Defines the URL of the font file.
* `font-stretch`: Optional. Defines how to stretch the font. Default is `normal`.
* `font-style`: Optional. Defines the style of the font. Default is `normal`.
* `font-weight`: Optional. Defines the weight of the font. Default is `normal`.
* `unicode-range`: Optional. Defines the range of `UNICODE` characters supported by the font. Default is `U+0-10FFFF`.

```html
<div id="t6">Text</div>
<style type="text/css">
    @font-face{
        font-family: ff;
        src: url(https://cdn.jsdelivr.net/gh/WindrunnerMax/Yolov3-Train@2d965d2/keras-yolo3/font/FiraMono-Medium.otf);
    }
    #t6{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        font-family:ff;
    }
</style>
```

## 2D Transformations
`CSS3` transformations can move, scale, rotate, skew, or stretch elements.
* `transform`: Applies to elements for `2D` or `3D` transformations.
* `transform-origin`: Allows changing the position of the transformed element.

```html
<div id="t7"></div>
<style type="text/css">
    #t7{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        transform:rotate(10deg);
    }
</style>
```

## 3D Transformation
`CSS3` allows you to format elements using 3D transformations.
* `transform`: applies a 2D or 3D transformation to an element.
* `transform-origin`: allows you to change the position of the transformed element.
* `transform-style`: specifies how nested elements are displayed in 3D space.
* `perspective`: defines the perspective effect of a 3D element.
* `perspective-origin`: specifies the bottom position of a 3D element.
* `backface-visibility`: defines whether an element is visible when it is not facing the screen.

```html
<div id="t8"></div>
<style type="text/css">
    #t8{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        transform:rotateX(10deg);
    }
</style>
```

## Animation
`CSS3` allows you to create animations, which can replace many web animation images, Flash animations, and effects implemented in JavaScript.
* `@keyframes`: specifies the animation.
* `animation`: shorthand property for all animation properties, except `animation-play-state`.
* `animation-name`: specifies the name of the `@keyframes` animation.
* `animation-duration`: specifies the time it takes to complete one cycle of the animation, in seconds or milliseconds. The default is `0`.
* `animation-timing-function`: specifies the speed curve of the animation. The default is `ease`.
* `animation-fill-mode`: specifies the styles applied to an element when the animation is not playing, such as when the animation is complete or when there is a delay before the animation starts.
* `animation-delay`: specifies when the animation starts. The default is `0`.
* `animation-iteration-count`: specifies the number of times the animation is played. The default is `1`.
* `animation-direction`: specifies whether the animation plays in reverse on the next cycle. The default is `normal`.
* `animation-play-state`: specifies whether the animation is running or paused. The default is `running`.

```html
<div id="t9"></div>
<style type="text/css">
    @keyframes animation{
        from {background:red;}
        to {background:yellow;}
    }
    #t9{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        animation:animation 5s ease infinite alternate;
    }
</style>
```

## Transition
In `CSS3`, you can transition an element from one style to another without using Flash animations or JavaScript.
* `transition`: shorthand property for setting four transition properties in one declaration.
* `transition-property`: specifies the name of the CSS property to which the transition should be applied.
* `transition-duration`: defines the time it takes for the transition effect to complete. The default is `0`.
* `transition-timing-function`: specifies the timing curve of the transition effect. The default is `ease`.
* `transition-delay`: specifies when the transition effect starts. The default is `0`.

```html
<div id="t10"></div>
<style type="text/css">
    #t10{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        background: red;
        transition: all .5s;
    }
    #t10:hover{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        background: yellow;
        transition: all .5s;
    }
</style>
```

## Flex Layout
To indicate a flexible layout box, known as a `flex` container, specify `display: flex`. The boxes inside the container become members of the `flex` container. By default, the container has two axes: the horizontal main axis and the vertical cross axis. The start position of the main axis is called `main start`, and the end position is called `main end`. The start position of the cross axis is called `cross start`, and the end position is called `cross end`. The container members are arranged along the main axis by default.


## Grid Layout
To specify that a container uses `Grid` layout, specify `display: grid;`. In `Grid` layout, the areas that use grid positioning are called containers, and the child elements that use grid positioning inside the container are called members. The horizontal areas in the container are called rows, and the vertical areas are called columns. They can be seen as two-dimensional arrays. The lines that divide the grid are called grid lines. Normally, there are `n + 1` horizontal grid lines for `n` rows, and `m + 1` vertical grid lines for `m` columns. Note that when the container is set to `Grid` layout, the settings of `float`, `display: inline-block`, `display: table-cell`, `vertical-align`, and `column-*` for the container's child elements will be invalidated.


## Multi-column Layout
With CSS3, you can design text content in a multi-column layout similar to a newspaper.
* `column-count`: Specifies the number of columns into which an element should be divided.
* `column-fill`: Specifies how to fill columns.
* `column-gap`: Specifies the gap between columns.
* `column-rule`: Shorthand for all `column-rule-*` properties.
* `column-rule-color`: Specifies the color of the border between two columns.
* `column-rule-style`: Specifies the style of the border between two columns.
* `column-rule-width`: Specifies the width of the border between two columns.
* `column-span`: Specifies how many columns an element should span across.
* `column-width`: Specifies the width of columns.
* `columns`: Shorthand for setting `column-width` and `column-count`.

```html
<div id="t11">Multi-column layout example</div>
<style type="text/css">
    #t11{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        column-count: 3;
        column-gap: 20px;
    }
</style>
```

## User Interface
`CSS3` has added some new user interface features to adjust element size, box size, and outer borders.
* `appearance`: allows an element to appear like a standard user interface element.
* `box-sizing`: allows certain elements to be defined in a way that adapts to the area.
* `icon`: provides the ability for creators to set an element as an icon equivalent.
* `nav-down`: specifies where to navigate when the down arrow key is used.
* `nav-index`: specifies the order of the `Tab` for an element.
* `nav-left`: specifies where to navigate when the left arrow key is used.
* `nav-right`: specifies where to navigate when the right arrow key is used.
* `nav-up`: specifies where to navigate when the up arrow key is used.
* `outline-offset`: decorates and draws the outline beyond the border.
* `resize`: specifies whether an element can be resized by the user.

```html
<div id="t12"></div>
<style type="text/css">
    #t12{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        resize:both;
        overflow:auto;
    }
</style>
```

## Filters
The `filter` property in `CSS3` supports various filter effects for web pages.  
`filter: none | blur() | brightness() | contrast() | drop-shadow() | grayscale() | hue-rotate() | invert() | opacity() | saturate() | sepia() | url();`  

```html
<div id="t13"></div>
<style type="text/css">
    #t13{
        height: 100px;
        width: 100px;
        border: 1px solid #eee;
        filter: blur(3px);
        background-color: blue;
    }
</style>
```

## Selectors

* `element1~element2`: Select all `element2` elements that are siblings and come after `element1`.
* `[attribute^=value]`: Select elements with an `attribute` that starts with `value`.
* `[attribute$=value]`: Select elements with an `attribute` that ends with `value`.
* `[attribute*=value]`: Select elements with an `attribute` that contains the string `value`.
* `div:first-child`: Select every `div` element that is the first child of its parent.
* `div:last-child`: Select every `div` element that is the last child of its parent.
* `div:nth-child(n)`: Select every `div` element that is the nth child of its parent.
* `div:nth-last-child(n)`: Same as above, but counting starts from the last child of the element.
* `div:nth-of-type(n)`: Select every `div` element that is the nth child of its parent with the same type.
* `div:nth-last-of-type(n)`: Same as above, but counting starts from the last child of the element.
* `div:first-of-type`: Select the first `div` element that is the first child of its parent.
* `div:last-of-type`: Select the last `div` element that is the last child of its parent.
* `div:only-child`: Select every `div` element that is the only child of its parent.
* `div:only-of-type`: Select every `div` element that is the only element of its parent with the same type.
* `:root`: Select the root element of the document.
* `:empty`: Select elements that have no content.
* `:checked`: Select input elements that are checked, including radio buttons and checkboxes.
* `:default`: Select elements that are the default selected element, for example, a submit button is always the default button of a form.
* `:disabled`: Select form elements that are disabled.
* `:enabled`: Select form elements that are not disabled.
* `:valid`: Select form elements that have passed validation.

## Media Queries
Different style rules can be set for different media types, adapting the CSS based on viewport, device height and width, device orientation, resolution, etc.

```html
<div id="t14"></div>
<style type="text/css">
    @media screen and (min-width:600px){ 
        #t14{
            height: 100px;
            width: 100px;
            border: 1px solid #eee;
            background: red;
            transition: all .5s;
        }
    }
    @media screen and (max-width:600px) { 
        #t14{
            height: 100px;
            width: 100px;
            border: 1px solid #eee;
            background: yellow;
            transition: all .5s;
        }
    }
</style>
```
## Code Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>CSS3 New Features</title>
    <style type="text/css">
        div{
            margin: 10px 0;
            height: 100px;
            width: 100px;
            border: 1px solid #eee;
        }
        #t1{
            border-radius: 10px;
            background-color: blue;
        }
        #t2{
            box-shadow: 5px 5px 5px #aaa;
        }
        #t3{
            border: 1px solid #eee;
            background-image: url(https://blog.touchczy.top/favicon.ico);
            background-size:30px 30px;
            background-repeat:repeat;
            background-origin:content-box;
        }
        #t4{
            background-image: linear-gradient(to right, red , yellow);
        }
        #t5{
            color: #fff;
            text-shadow: -1px 3px 5px #333;
        }
        @font-face{
            font-family: ff;
            src: url(https://cdn.jsdelivr.net/gh/WindrunnerMax/Yolov3-Train@2d965d2/keras-yolo3/font/FiraMono-Medium.otf);
        }
        #t6{
            font-family:ff;
        }
        #t7{
            transform:rotate(10deg);
        }
        #t8{
            transform:rotateX(10deg);
        }
        @keyframes animation{
            from {background:red;}
            to {background:yellow;}
        }
        #t9{
            animation:animation 5s ease infinite alternate;
        }
        #t10{
            background: red;
            transition: all .5s;
        }
        #t10:hover{
            background: yellow;
            transition: all .5s;
        }
        #t11{
            column-count: 3;
            column-gap: 20px;
        }
        #t12{
            resize:both;
            overflow:auto;
        }
        #t13{
            filter: blur(3px);
            background-color: blue;
        }
        @media screen and (min-width:600px){ 
            #t14{
                height: 100px;
                width: 100px;
                border: 1px solid #eee;
                background: red;
                transition: all .5s;
            }
        }
        @media screen and (max-width:600px) { 
            #t14{
                height: 100px;
                width: 100px;
                border: 1px solid #eee;
                background: yellow;
                transition: all .5s;
            }
        }
    </style>
</head>
<body>
    <div id="t1">Rounded Corners</div>
    <div id="t2">Box Shadow</div>
    <div id="t3">Background</div>
    <div id="t4">Gradient</div>
    <div id="t5">Text Effects</div>
    <div id="t6">Font</div>
    <div id="t7">2D Transform</div>
    <div id="t8">3D Transform</div>
    <div id="t9">Animation</div>
    <div id="t10">Transition</div>
    <div id="t11">Multi-column Layout Example</div>
    <div id="t12">User Interface</div>
    <div id="t13">Filters</div>
    <div id="t14">Media Queries</div>
</body>
</html>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/f988d438ee17
https://www.runoob.com/css3/css3-tutorial.html
https://developer.mozilla.org/zh-CN/docs/Archive/CSS3
```