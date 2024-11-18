# Float

The `float` property in CSS allows an element to float, causing it to move left or right until its outer edge touches the border of the containing box or another floating box.

## Example
* Horizontal floating of an element means that the element can only move left or right and cannot move up or down.
* Using `float` means using block layout, which modifies the computed value of the `display` property in the case of non-block-level elements.
* A floating element will try to move left or right until its outer edge touches the border of the containing box or another floating box.
* Floating elements are taken out of the normal flow of the document but not out of the text flow. When floating, they do not affect the surrounding box model, but the text wraps around the floating element. The document flow and text flow can be considered as hierarchical structures, while the floating element box and text element are on the same layer.
* Document flow refers to the process of automatically arranging box elements from left to right and top to bottom in the layout.
* Text flow refers to the process of automatically arranging text elements from left to right and top to bottom in the layout.
* Taking an element out of the document flow means removing it from the normal layout. When positioning other boxes, the element that is taken out of the document flow is considered non-existent. 

```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        body > div{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
        }
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
        }
    </style>
</head>
<body>
    <div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
    </div>
</body>
</html>
```

## Text Wrapping Effect
The document flow and text flow can be considered as layered structures, with floating element boxes and text elements in the same layer. When an element is floated, it is taken out of the document flow but not out of the text flow. Therefore, the rendering of floating elements and text is done together, and floating elements will push the text elements aside, resulting in a text wrapping effect around the floating elements.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        body > div{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
        }
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
            height: 100px;
            width: 100px;
        }
    </style>
</head>
<body>
    <div>
        <div class="t1">Float</div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
    </div>
</body>
</html>
```
Although `float` was originally designed to achieve text wrapping effects, in some layouts that use `float`, if you don't want to trigger the text wrapping effect, you can avoid it by triggering the Block Formatting Context (BFC).

```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        body > div{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
        }
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
            height: 100px;
            width: 100px;
        }
    </style>
</head>
<body>
    <div>
        <div class="t1">Float</div>
        <div style="overflow: auto;">
            <div>123</div>
            <div>123</div>
            <div>123</div>
            <div>123</div>
            <div>123</div>
            <div>123</div>
            <div>123</div>
        </div>
    </div>
</body>
</html>
```

## Clearing Floats
Using floats can have some negative effects, such as not being able to support the parent element and causing the background and borders to not display correctly, overlapping with other elements, and lower-level floats still floating on top of higher-level floating elements. In such cases, it is necessary to clear the floats.

### Using the clear property
Clear floats using `clear: both;` in CSS.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        .container{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
        }
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
            height: 100px;
            width: 100px;
        }
        .clear::after{
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>

        <!-- Not clearing the float here will have negative effects -->

    </div>


    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
        
        <!-- Clearing the float -->
        <div class="clear"></div>

    </div>

    
    <!-- Clearing the float here is also possible, but it will not be able to support the container height -->
    
    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>

        <!-- Clearing the float -->
        <div class="clear"></div>

    </div>
</body>
</html>
```

```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        .container{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
        }
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
            height: 100px;
            width: 100px;
        }
        .container::after{
            clear: both;
            content:"";
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
    </div>

    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
    </div>

</body>
</html>
```

### Trigger BFC
Trigger the `BFC` of the floating container to clear the float.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Float</title>
    <style type="text/css">
        .container{
            border: 1px solid #eee;
            padding: 5px 0;
            margin: 5px 0;
            overflow: auto; /* Trigger BFC */
        }
        /* BFC Block Formatting Context https://github.com/WindrunnerMax/EveryDay/blob/master/CSS/%E5%9D%97%E7%BA%A7%E6%A0%BC%E5%BC%8F%E5%8C%96%E4%B8%8A%E4%B8%8B%E6%96%87.md */
        .t1{
            margin: 0 5px;
            float: left;
            background-color: #EEE;
            height: 100px;
            width: 100px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
    </div>

    <div class="container">
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div class="t1">Float</div>
        <div style="height: 10px;background-color: blue;"></div>
    </div>

</body>
</html>
```




## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.cnblogs.com/lingdu87/p/7770752.html
https://developer.mozilla.org/zh-CN/docs/CSS/float
https://www.w3school.com.cn/css/css_positioning_floating.asp
```