# Grid Layout
Currently, among the CSS layout solutions, grid layout can be considered the most powerful one. It divides the webpage into grids and uses these grids to create various layouts. Grid layout and flex layout have some similarities in that they both specify the position of multiple members within a container. The difference is that flex layout is a one-dimensional layout that specifies the position of members relative to the axis, while grid layout divides the container into rows and columns, creating cells, and then specifies the cell in which the members are located, making it a two-dimensional layout.

## Basics
To use grid layout, specify `display: grid;` for the container. The area in grid layout that adopts grid positioning is called the container, and the child elements that adopt grid positioning within the container are called members. The horizontal area in the container is called rows, and the vertical area is called columns, which can be seen as a two-dimensional array. The lines that divide the grids are called grid lines. Normally, there are `n + 1` horizontal grid lines for `n` rows, and `m + 1` vertical grid lines for `m` columns. Note that when the container is set to grid layout, the `float`, `display: inline-block`, `display: table-cell`, `vertical-align`, and `column-*` settings for the container's child elements will be invalidated.

## Container Properties

### grid-template-rows grid-template-columns
The `grid-template-rows` property defines the height of each row. Set as many values as there are rows, and the values can be fixed pixels or percentages. The `grid-template-columns` property defines the width of each column. Set as many values as there are columns, and the values can be fixed pixels or percentages.
```html
<div id="t1">
    <div>0</div>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
    <div>5</div>
    <div>6</div>
    <div>7</div>
    <div>8</div>
</div>
<!-- 
    0 1 2
    3 4 5
    6 7 8
 -->

<style type="text/css">
    #t1{
        display: grid;
        grid-template-rows: 30px 30px 30px;
        grid-template-columns: 30px 30px 30px;
    }
</style>
```

#### repeat
The `repeat()` function can simplify repeated values, automatically repeating the specified rule.
```html
<div id="t2">
    <div>9</div>
    <div>a</div>
    <div>b</div>
    <div>c</div>
    <div>d</div>
    <div>e</div>
</div>
<!-- 9 ab cd e -->

<style type="text/css">
   #t2{
        display: grid;
        grid-template-columns: repeat(3,30px 10px); /* Repeat the rule "30px 10px" 3 times */
    }
</style>
```

#### auto-fill
Sometimes, the size of the cells is fixed, but the size of the container is uncertain. If you want each row or column to accommodate as many cells as possible, you can use the `auto-fill` keyword to indicate automatic filling. When the container is not sufficient to accommodate the members, it will automatically wrap to the next line.
```html
<div id="t3" style="width: 60px;">
    <div>f</div>
    <div>g</div>
    <div>h</div>
</div>
<!-- 
    f g
    h 
-->

<style type="text/css">
   #t3{
        display: grid;
        grid-template-columns: repeat(auto-fill,30px);
    }
</style>
```

#### fr
To represent the proportional relationship, the grid layout provides the `fr` keyword. If the widths of two columns are 1fr and 2fr respectively, it means that the latter is twice the size of the former.

```html
<div id="t4">
    <div>i</div>
    <div>j</div>
    <div>k</div>
</div>
<!-- 
    i j  k
-->

<style type="text/css">
   #t4{
        display: grid;
        grid-template-columns: 1fr 2fr 3fr;
    }
</style>
```

#### minmax
The `minmax()` function generates a length range, representing a length within that range. It takes two parameters, the minimum value and the maximum value. When there is not enough space, it will automatically reduce the length or width to the set minimum value from the maximum value.

`minmax( [ <length> | <percentage> | min-content | max-content | auto ] , [ <length> | <percentage> | <flex> | min-content | max-content | auto ] )`.

```html
<div id="t5">
    <div>l</div>
    <div>m</div>
    <div>n</div>
</div>
<!-- 
    l m  n
-->

<style type="text/css">
   #t5{
        display: grid;
        grid-template-columns: 30px minmax(30px,100px) 30px;
    }
</style>
```

#### auto 
The `auto` keyword represents that the length is determined by the browser itself, which is basically equal to the maximum width of the column cell, unless the cell content is set with `min-width` and its value is greater than the maximum width.

```html
<div id="t6">
    <div>o</div>
    <div>p</div>
    <div>q</div>
</div>
<!-- 
    o p     q
-->

<style type="text/css">
   #t6{
        display: grid;
        grid-template-columns: 10px auto 30px;
    }
</style>
```

### grid-row-gap
The `grid-row-gap` property sets the gap between rows, which is the row spacing.

```html
<div id="t7">
    <div>r</div>
    <div>s</div>
    <div>t</div>
</div>
<!-- 
    r

    s

    t
-->

<style type="text/css">
   #t7{
        display: grid;
        grid-template-rows: 30px 30px 30px;
        grid-row-gap: 10px;
    }
</style>
```

### grid-column-gap
The `grid-column-gap` property sets the gap between columns, which is the column spacing.

```html
<div id="t8">
    <div>u</div>
    <div>v</div>
    <div>w</div>
</div>
<!-- 
    u  v  w
-->

<style type="text/css">
   #t8{
        display: grid;
        grid-template-columns: repeat(3,30px);
        grid-column-gap: 10px;
    }
</style>
```

Translate into English:

### grid-gap
The `grid-gap` property is a shorthand for `grid-column-gap` and `grid-row-gap`. If the second value of `grid-gap` is omitted, the browser assumes that the second value is equal to the first value.
```html
<div id="t9">
    <div>x</div>
    <div>y</div>
    <div>z</div>
    <div>A</div>
</div>
<!-- 
    x  y

    z  A
-->

<style type="text/css">
  #t9{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
        grid-gap: 10px 10px;
    }
</style>
```

### grid-template-areas
Grid layout allows specifying areas, which are composed of one or more grid cells. The `grid-template-areas` property is used to define these areas. The naming of the areas affects the grid lines. The starting grid line of each area is automatically named `{areaName}-start`, and the ending grid line is automatically named `{areaName}-end`.
```html
<div id="t10">
    <div>B</div>
    <div>C</div>
    <div>D</div>
    <div>E</div>
</div>
<!-- 
    B C
    D E
-->

<style type="text/css">
  #t10{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
        /* First, divide the grid into four cells, and then name these four areas as a to d, corresponding to the four cells. */
        grid-template-areas: 'a b' 'c d';
    }
</style>
```

### grid-auto-flow
After dividing the grid, the container's child elements are automatically placed in each grid in order. The default placement order is row by row, but it can be changed to column by column by setting `grid-auto-flow` to `column`. The `grid-auto-flow` property can also be set to `row dense` and `column dense`, which are mainly used to determine how the remaining items are automatically placed after certain items are specified.

```html
<div id="t11">
    <div>F</div>
    <div>G</div>
    <div>H</div>
    <div>I</div>
</div>
<!-- 
    F H
    G I
-->

<style type="text/css">
   #t11{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
        grid-auto-flow: column;
    }
</style>
```

### justify-items 
The `justify-items` property sets the horizontal position of the content within the grid items. It can take the values `start | end | center | stretch`.
* `stretch` (default): Stretches the content to fill the entire width of the grid cell.
* `start`: Aligns the content to the start edge of the grid cell.
* `end`: Aligns the content to the end edge of the grid cell.
* `center`: Centers the content within the grid cell.

```html
<div id="t12">
    <div>J</div>
</div>
<!-- 
    J
-->

```html
<style type="text/css">
    #t12{
        display: grid;
        justify-items: center;
    }
</style>
```

### align-items
The `align-items` property sets the vertical position of the content within the grid items. It can take the values `start | end | center | stretch`.
* `stretch` (default): Stretches the content to fill the entire width of the grid cell.
* `start`: Aligns the content to the start edge of the grid cell.
* `end`: Aligns the content to the end edge of the grid cell.
* `center`: Centers the content within the grid cell.

```html
<div id="t13" style="height: 50px">
    <div>K</div>
</div>
<!-- 
    K
-->

<style type="text/css">
    #t13{
        display: grid;
        align-items: center;
    }
</style>
```

### place-items
The `place-items` property is a shorthand for `align-items` and `justify-items`. If the second value is omitted, the browser assumes it to be the same as the first value.

```html
<div id="t14" style="height: 50px">
    <div>L</div>
</div>
<!-- 
    L
-->

<style type="text/css">
    #t14{
        display: grid;
        place-items: center center;
    }
</style>
```

### justify-content
The `justify-content` property determines the horizontal position of the entire content area within the container, i.e., the horizontal distribution of the grid items. It can take the values `start | end | center | stretch | space-around | space-between | space-evenly`.
```html
<div id="t15">
    <div>M</div>
    <div>N</div>
</div>
<!-- 
    M   N 
-->

<style type="text/css">
    #t15{
        display: grid;
        grid-template-columns: repeat(2,30px);
        justify-content: space-around;
    }
</style>
```

### align-content
The `align-content` property determines the vertical position of the entire content area within the container, i.e., the vertical distribution of the grid items. It can take the values `start | end | center | stretch | space-around | space-between | space-evenly`.
```html
<div id="t16" style="height: 50px;">
    <div>O</div>
    <div>P</div>
</div>
<!-- 
    O P
-->

<style type="text/css">
    #t16{
        display: grid;
        grid-template-columns: repeat(2,30px);
        align-content: center;
    }
</style>
```

### place-content
The `place-content` property is a shorthand for `align-content` and `justify-content`. If the second value is omitted, the browser assumes it to be the same as the first value.
```html
<div id="t17" style="height: 50px;">
    <div>Q</div>
    <div>R</div>
</div>
<!-- 
    Q   R
-->

```html
<style type="text/css">
    #t17{
        display: grid;
        grid-template-columns: repeat(2,30px);
        place-content: center space-around;
    }
</style>
```

### grid-auto-columns grid-auto-rows
Sometimes, some items are positioned outside the existing grid. For example, the grid has only `3` columns, but a certain item is specified in the `5th` row. In this case, the browser will automatically generate extra grid to accommodate the item. The `grid-auto-columns` and `grid-auto-rows` properties are used to set the column width and row height of the automatically created extra grid. Their syntax is exactly the same as `grid-template-columns` and `grid-template-rows`. If these two properties are not specified, the browser will determine the column width and row height of the new grid based on the size of the cell content.

```html
<div id="t18">
    <div style="grid-row-start: 2;grid-column-start: 2;">S</div>
</div>
<!-- 
     
     S
-->

<style type="text/css">
    #t18{
        display: grid;
        grid-template-columns: repeat(1,30px);
        grid-template-rows: repeat(1,30px);
        grid-auto-rows: 100px; 
        grid-auto-columns: 100px; 
    }
</style>
```

## Item Properties

### grid-column-start grid-column-end
The `grid-column-start` property specifies the vertical grid line where the left border is located, and the `grid-column-end` property specifies the vertical grid line where the right border is located.

```html
<div class="gridBox">
    <div style="grid-row-start: 2;grid-column-start: 2;">T</div>
</div>
<!-- 
     
     T
-->

<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
    }
</style>
```

### grid-row-start grid-row-end
The `grid-row-start` property specifies the horizontal grid line where the top border is located, and the `grid-row-end` property specifies the horizontal grid line where the bottom border is located.
```html
<div class="gridBox">
    <div style="grid-row-start: 2;">U</div>
</div>
<!-- 
     
    U
-->

<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
    }
</style>
```
You can also name the axes to specify the position.
```html
<div class="gridBox" style="">
    <div style="grid-column-start: c2;grid-row-start: r2;">V</div>
</div>
<!-- 
     
      V
-->

```html
<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns:[c1] 30px [c2] 30px [c3]; /* Specify columns and name the axes */
        grid-template-rows:[r1] 30px [r2] 30px [r3]; /* Specify rows and name the axes */
    }
</style>
```

### grid-column grid-row
The `grid-column` property is a shorthand for `grid-column-start` and `grid-column-end`, and the `grid-row` property is a shorthand for `grid-row-start` and `grid-row-end`.
```html
<div class="gridBox">
    <div style="grid-column: 2 / 3;grid-row: 2 / 3;">W</div>
</div>
<!-- 
     
      W
-->

<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
    }
</style>
```

### grid-area
The `grid-area` property specifies where an item is placed in the area specified by `grid-template-areas`. It can also be used as a shorthand for `grid-row-start`, `grid-column-start`, `grid-row-end`, and `grid-column-end` to directly specify the position of the item.
```html
<div class="gridBox" style="grid-template-areas: 'a b' 'c d';">
    <div style="grid-area: b;">X</div>
    <div style="grid-area: 2 / 2 / 3 / 3;">Y</div>
</div>
<!-- 
      X
      Y
-->

<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
    }
</style>
```

### justify-self align-self place-self
The `justify-self` property sets the horizontal position of the content of a cell, and its usage is exactly the same as the `justify-items` property. However, it only applies to individual items, and the values can be `start | end | center | stretch;`.  
The `align-self` property sets the vertical position of the content of a cell, and its usage is exactly the same as the `align-items` property. It also only applies to individual items, and the values can be `start | end | center | stretch;`.

* The default value is `stretch`, which stretches and fills the entire width of the cell.
* `start`: Aligns with the start edge of the cell.
* `end`: Aligns with the end edge of the cell.
* `center`: Centers the content inside the cell.

The `place-self` property is a shorthand for `align-self` and `justify-self`.
```html
<div class="gridBox">
    <div style="place-self: center end;">Z</div>
</div>
<!-- 
    Z
-->

```html
<style type="text/css">
    .gridBox{
        display: grid;
        grid-template-columns: repeat(2,30px);
        grid-template-rows: repeat(2,30px);
    }
</style>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```