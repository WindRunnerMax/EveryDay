# Flex Layout
`Flex` layout, also known as flexible layout, provides the maximum flexibility for box models and is the preferred solution for layout. It is now supported by all modern browsers.

## Basics
By specifying `display: flex`, a flex container is identified, which is called a `FLEX` container. The boxes inside the container become members of the `FLEX` container. The container has two axes by default: the horizontal main axis and the vertical cross axis. The starting position of the main axis is called `main start`, and the ending position is called `main end`; the starting position of the cross axis is called `cross start`, and the ending position is called `cross end`. The members of the container are arranged along the main axis by default.

## Container Properties

### flex-direction
The `flex-direction` property determines the direction of the main axis, with values of `row | row-reverse | column | column-reverse`.
* Default value: `row` - the main axis is horizontal, starting from the left.
* `row-reverse` - the main axis is horizontal, starting from the right, and the order of the container members is reversed compared to `row`.
* `column` - the main axis is vertical, starting from the top.
* `column-reverse` - the main axis is vertical, starting from the bottom, and the order of the container members is reversed compared to `column`.

```html
<div id="t1">
    <div>1</div>
    <div>2</div>
    <div>3</div>
</div>
    <!-- 
        3
        2
        1
     -->

<style type="text/css">
    #t1{
        display: flex;
        flex-direction: column-reverse;
    }
</style>
```

### flex-wrap
The `flex-wrap` property determines whether to wrap the flex items when they cannot fit in one line, with values of `nowrap | wrap | wrap-reverse`.
* Default: `nowrap` - no wrapping, the flex items will shrink proportionally along the axis when there is not enough space.
* `wrap` - wrap to a new line when there is not enough space.
* `wrap-reverse` - wrap to a new line when there is not enough space, with the new line starting from the top.

```html
<div id="t2" style="width: 20px;">
    <div>4</div>
    <div>5</div>
    <div>6</div>
</div>
    <!-- 
        45
        6
     -->
     
<style type="text/css">
    #t2{
        display: flex;
        flex-wrap: wrap;
    }
</style>
```

### flex-flow
The `flex-flow` property is a shorthand for `flex-direction` and `flex-wrap`, with the default value of `row nowrap`.
```html
<div id="t3" style="width: 20px;">
    <div>7</div>
    <div>8</div>
    <div>9</div>
</div>
    <!-- 
        87
         9
     -->
     
<style type="text/css">
    #t3{
        display: flex;
        flex-flow: row-reverse wrap;
    }
</style>
```

### justify-content
The `justify-content` property defines how flex items are aligned along the main axis, allowing for easy implementation of various layouts. The possible values are `flex-start | flex-end | center | space-between | space-around`.
* `flex-start` (default): Aligns items to the left.
* `flex-end`: Aligns items to the right.
* `center`: Aligns items to the center.
* `space-between`: Aligns items with equal spacing between them, with the first item aligned to the start and the last item aligned to the end.
* `space-around`: Aligns items with equal spacing around them, with the spacing between each item and the container's edges being twice as large as the spacing between items.

```html
<div id="t4">
    <div>a</div>
    <div>b</div>
    <div>c</div>
</div>
<!-- abc[horizontally centered] -->
     
<style type="text/css">
    #t4{
        display: flex;
        justify-content: center;
    }
</style>
```

### align-items
The `align-items` property defines how flex items are aligned along the cross axis. The possible values are `flex-start | flex-end | center | baseline | stretch`.
* `stretch` (default): If the item does not have a set height or is set to `auto`, it will fill the entire height of the container.
* `flex-start`: Aligns items to the start of the cross axis.
* `flex-end`: Aligns items to the end of the cross axis.
* `center`: Aligns items to the center of the cross axis.
* `baseline`: Aligns items based on the baseline of the first line of text within each item.

```html
<div id="t5" style="height: 50px;">
    <div>d</div>
    <div>e</div>
    <div>f</div>
</div>
<!-- def[vertically centered] -->
     
<style type="text/css">
    #t5{
        display: flex;
        align-items: center;
    }
</style>
```

### align-content
The `align-content` property defines how multiple lines of flex items are aligned along the cross axis. If there is only one line of flex items, this property has no effect. The possible values are `flex-start | flex-end | center | space-between | space-around | stretch`.
* `stretch` (default): The lines of flex items will stretch to fill the entire cross axis.
* `flex-start`: Aligns the lines of flex items to the start of the cross axis.
* `flex-end`: Aligns the lines of flex items to the end of the cross axis.
* `center`: Aligns the lines of flex items to the center of the cross axis.
* `space-between`: Aligns the lines of flex items with equal spacing between them, with the first line aligned to the start and the last line aligned to the end.
* `space-around`: Aligns the lines of flex items with equal spacing around them, with the spacing between each line and the container's edges being twice as large as the spacing between lines.

```html
<div id="t6" style="height: 50px;width: 20px;">
    <div>g</div>
    <div>h</div>
    <div>i</div>
</div>
<!-- 
    g
    hi
    [cross axis space-between] 
-->
     
<style type="text/css">
    #t6{
        display: flex;
        flex-wrap: wrap;
        align-content: space-between;
    }
</style>
```

## Item Properties
### order
The `order` property defines the order in which flex items are displayed. The lower the value, the earlier the item is displayed. The default value is `0`.

```html
<div class="flexBox">
    <div style="align-self: flex-end;">j</div>
    <div style="align-self: flex-start;">k</div>
    <div style="align-self: center;">l</div>
</div>
<!-- klj -->
     
<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

### flex-grow
The `flex-grow` property defines the growth factor of a flex item, with a default value of `0`.

```html
<div class="flexBox">
    <div style="flex-grow: 1;">m</div>
    <div style="flex-grow: 2;">n</div>
    <div style="flex-grow: 3;">o</div>
</div>
<!-- m n o -->
     
<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

### flex-shrink
The `flex-shrink` property defines the shrink factor of a flex item, with a default value of `1`. If there is not enough space, the item will shrink accordingly.
```html
<div class="flexBox" style="width: 100px;">
    <div style="flex-shrink: 1;width: 100px;">p</div>
    <div style="flex-shrink: 2;width: 100px;">q</div>
    <div style="flex-shrink: 3;width: 100px;">r</div>
</div>
<!-- p q r -->
     
<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

### flex-basis
The `flex-basis` property defines the initial main size of a flex item before any available space is distributed. The browser uses this property to determine if there is any extra space on the main axis. Its default value is `auto`, which means the item's original size.

```html
<div class="flexBox">
    <div>s</div>
    <div style="flex-basis: 40px;">t</div>
    <div>u</div>
</div>
<!-- s t u -->

<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

### flex
The `flex` property is a shorthand for `flex-grow`, `flex-shrink`, and `flex-basis`, with a default value of `0 1 auto`. The last two properties are optional.
```html
<div class="flexBox">
    <div style="flex: 1;">v</div>
    <div style="flex: 1;">w</div>
    <div style="flex: 1;">x</div>
</div>
<!-- v w x -->

<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

### align-self
The `align-self` property allows an individual flex item to have a different alignment than the other items, overriding the `align-items` property of the parent. Its default value is `auto`, which means it inherits the `align-items` property of the parent element. If there is no parent element, it is equivalent to `stretch`.

```html
<div class="flexBox" style="height: 50px;">
    <div>y</div>
    <div style="align-self: center;">z</div>
    <div>0</div>
</div>
<!-- y z 0 -->

<style type="text/css">
    .flexBox{
        display: flex;
    }
</style>
```

## Reference

```
http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html
```

## Code Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>FLEX Layout</title>
</head>
<body>
    <div id="t1">
        <div>1</div>
        <div>2</div>
        <div>3</div>
    </div>
    <!-- 
        3
        2
        1
     -->

    <div id="t2" style="width: 20px;">
        <div>4</div>
        <div>5</div>
        <div>6</div>
    </div>
    <!-- 
        45
        6
     -->

    <div id="t3" style="width: 20px;">
        <div>7</div>
        <div>8</div>
        <div>9</div>
    </div>
    <!-- 
        87
         9
     -->

     <div id="t4">
        <div>a</div>
        <div>b</div>
        <div>c</div>
    </div>
    <!-- abc[horizontally centered] -->

    <div id="t5" style="height: 50px;">
        <div>d</div>
        <div>e</div>
        <div>f</div>
    </div>
    <!-- def[vertically centered] -->

    <div id="t6" style="height: 50px;width: 20px;">
        <div>g</div>
        <div>h</div>
        <div>i</div>
    </div>
    <!-- 
        g
        hi
        [space-between in cross-axis] 
    -->

    <div class="flexBox">
        <div style="order: 3;">j</div>
        <div style="order: 1;">k</div>
        <div style="order: 2;">l</div>
    </div>
    <!-- klj -->

    <div class="flexBox">
        <div style="flex-grow: 1;">m</div>
        <div style="flex-grow: 2;">n</div>
        <div style="flex-grow: 3;">o</div>
    </div>
    <!-- m n o -->
```

```html
<div class="flexBox" style="width: 100px;">
    <div style="flex-shrink: 1;width: 100px;">p</div>
    <div style="flex-shrink: 2;width: 100px;">q</div>
    <div style="flex-shrink: 3;width: 100px;">r</div>
</div>
<!-- p q r -->

<div class="flexBox">
    <div>s</div>
    <div style="flex-basis: 40px;">t</div>
    <div>u</div>
</div>
<!-- s t u -->

<div class="flexBox" style="height: 50px;">
    <div>y</div>
    <div style="align-self: center;">z</div>
    <div>0</div>
</div>
<!-- y z 0 -->

</body>
<style type="text/css">
    #t1{
        display: flex;
        flex-direction: column-reverse;
    }

    #t2{
        display: flex;
        flex-wrap: wrap;
    }
    #t3{
        display: flex;
        flex-flow: row-reverse wrap;
    }
    #t4{
        display: flex;
        justify-content: center;
    }
    #t5{
        display: flex;
        align-items: center;
    }

    #t6{
        display: flex;
        flex-wrap: wrap;
        align-content: space-between;
    }

    .flexBox{
        display: flex;
    }
</style>
</html>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```