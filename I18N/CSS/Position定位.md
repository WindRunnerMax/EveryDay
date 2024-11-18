# Positioning
The `position` property in CSS is a commonly used element positioning solution. The commonly used values for `position` are `static`, `relative`, `absolute`, `fixed`, `sticky`, and `inherit`.

## static
The `static` property is the default value for HTML elements, which means there is no positioning. It follows the normal document flow and ignores the settings for the `top`, `bottom`, `left`, `right`, and `z-index` properties.  
Document flow refers to the process of arranging box elements in a flow from left to right and top to bottom.  
Text flow refers to the process of arranging text elements in a flow from left to right and top to bottom.  
Taking an element out of the document flow means removing it from the normal layout arrangement. When positioning other boxes, the element that is taken out of the document flow is considered non-existent.

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
`relative` is relative positioning, where the element's position is offset relative to its original position. It does not take the element out of the document flow. It works with the `top`, `bottom`, `left`, `right`, and `z-index` properties. When offset properties are set, the relatively positioned element will move accordingly, but its original space will not change. Relatively positioned elements are often used as container blocks for absolutely positioned elements.
```html
<div class="t2">relative</div>
<div>Compare the effect. The element's original space remains unchanged, but there is an offset with relative positioning.</div>
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
`absolute` is absolute positioning, where the element's position is relative to its nearest positioned ancestor. If the element does not have a positioned ancestor, then its position is relative to the `<html>` element. The usual approach is to nest a layer of `relative` positioned element as the parent element, and then set the offset of the absolutely positioned element relative to the outer `relative` element. Absolute positioning completely takes the element out of the document flow and text flow, and does not occupy any document space. It works with the `top`, `bottom`, `left`, `right`, and `z-index` properties.
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
`fixed` is a positioning property that fixes the element's position relative to the browser window. Even if the window is scrolled, the element will not move. Note that when using `fixed` within an `<iframe>`, the element is positioned relative to the `<iframe>`. An `<iframe>` is like creating a new browser window within the page. `fixed` positioning completely removes the element from the document flow and does not occupy any document space. The `top`, `bottom`, `left`, `right`, and `z-index` properties are effective for `fixed` positioning.

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
`sticky` is a positioning property that positions the element based on the user's scroll position. The position of the `sticky` element depends on the user's scroll. It switches between `position: relative` and `position: fixed`. When the page is displayed, `sticky` behaves like `position: relative`, but when the page is scrolled beyond the target area, `sticky` behaves like `position: fixed`. It will stick to the target position. The element's positioning behaves as relative positioning until it crosses a specific threshold, and then it becomes fixed positioning. This specific threshold refers to one of `top`, `right`, `bottom`, or `left`. `sticky` positioning only takes effect when one of these four threshold values is specified. Otherwise, its behavior is the same as relative positioning.

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
`inherit` positions the element based on the inherited `position` value of its parent element.

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

## Code Example

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
    <div>Compare and observe the effects. The element originally occupies the same space, but relative positioning will cause offset.</div>
    <div class="t3">
        <div class="t4">absolute</div>
    </div>
    <div class="t5">fixed</div>
    <div class="t6">sticky</div>
    <div class="t7">
        <div class="t8">inherit</div>
    </div>
    <div style="height: 1000px">Make the browser display a scroll bar</div>
</body>
</html>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.zhihu.com/question/21911352
https://www.runoob.com/css/css-positioning.html
https://developer.mozilla.org/zh-CN/docs/Learn/CSS/CSS_layout/Normal_Flow
```