# Values and Effects of `display`

The `display` property can set the internal and external display types of an element. The external display type of an element determines its behavior in a flow layout, such as being a block-level or inline element. The internal display type of an element can control the layout of its child elements, such as `grid` or `flex`. Currently, all browsers support the `display` property, but compatibility with property values still needs to be considered.

## External Display
These values specify the external display type of an element, which is essentially its role in a flow layout, i.e., how it appears in a flow layout.

### `display: none`
`display: none;` is part of the `CSS1` specification and has no compatibility issues. This property value indicates that the element will not be displayed. As the name suggests, the element is truly hidden. When this property is used, the hidden element does not take up any space, and user interactions such as click events do not work. Screen readers also do not read the content of the element, and any child elements of this element will also be hidden. When this property is used to switch the element from a visible state to a hidden state, the element does not occupy the original space and triggers the browser to repaint and reflow. Adding a transition animation to this property is ineffective; the transition between any different state values always takes effect immediately. This effect is as if the element does not exist at all, but it can still be accessed in the DOM and manipulated through the DOM.

### `display: block`
`display: block;` is part of the `CSS1` specification and has no compatibility issues. This property value indicates that the element will be displayed as a block-level element. The element will have line breaks before and after it, occupying a whole line. It automatically wraps after being closed. The default width is `100%`, and width and height can be specified. Margins and paddings are effective in all four directions.

### `display: inline`
`display: inline;` is part of the `CSS1` specification and has no compatibility issues. This property value indicates that the element will be displayed as an inline element. The element generates one or more inline boxes, which do not produce line breaks before or after themselves. In the normal flow, if there is space, the next element will be on the same line. The elements are arranged in a line and do not wrap automatically after being closed. Height and width cannot be specified, but `line-height` can be used to specify the height. Margins are effective in the horizontal direction but not in the vertical direction, and paddings are effective in the horizontal direction but only have a visual effect in the vertical direction. They have no effect on other elements.

### `display: inline-block`
`display: inline-block;` is part of the `CSS2` specification and has no compatibility issues. This property value indicates that the element will be displayed as an inline block element. The element generates a block-level box that flows with the surrounding content, as if it were a single inline box. It is very similar to replaced elements. It is equivalent to the inline flow root `inline flow-root`. Width and height can be specified, and margins and paddings are effective in all four directions. The elements are arranged in a line, but there will be white space after line breaks.

### `display: run-in`
`display: run-in;` is part of the `CSS2` specification, but most browsers do not support it. Currently, it is an experimental property value and should not be used in production environments. This property value indicates that the element will be displayed as an inline or block-level object based on the context. If the next element is a `block`, it will become `inline` and be displayed side by side with the next element. If the next element is `inline`, it will become `block`.

## Internal Display
These keywords specify the internal display type of an element, defining the layout of the element's internal content. It is assumed that the element is a non-replaced element.

### `display: flow-root`
`display: flow-root;` is part of the `CSS3` specification and has moderate compatibility. This property value indicates that the element will generate a block-level box that establishes a new block formatting context (BFC) and defines the position of the formatting root.

### `display: table`
`display: table;` is part of the `CSS2` specification and has good compatibility. This property value indicates that the element will be displayed as a block-level table, similar to `<table>`, with line breaks before and after the table.

### display: flex
`display: flex;` is a CSS3 specification that is supported by mainstream browsers. It is the preferred layout solution and allows an element to be displayed as a flexible box. Externally, it behaves like a block element, while internally it is used as a flexible box. Flexbox provides maximum flexibility for box models. For compatibility with mobile browsers, it may be necessary to use `display: -webkit-box;` with the `-box` prefix. Both are flexible boxes, but due to naming conventions in different stages of the specification, the name was changed from `box` to `flex`. It's important to note that `flex` cannot completely replace `box`, and there may be differences in actual layout when using these two methods.

### display: grid
`display: grid;` is a CSS3 specification that is supported by mainstream browsers. It divides elements into grids and allows for various layouts using these grids. Grid layout and flex layout have some similarities in that they both specify the position of multiple members within a container. However, flex layout is a one-dimensional layout that positions members along an axis, while grid layout divides the container into rows and columns, creating cells, and then specifies the cell in which each member is located, making it a two-dimensional layout.

### display: inline-table
`display: inline-table;` is a CSS2 specification with good compatibility. It behaves the same as `display: table;` internally, but externally it is displayed as `inline`.

### display: inline-flex
`display: inline-flex;` is a CSS3 specification that is supported by mainstream browsers. It behaves the same as `display: flex;` internally, but externally it is displayed as `inline`.

### display: inline-grid
`display: inline-grid;` is a CSS3 specification that is supported by mainstream browsers. It behaves the same as `display: grid;` internally, but externally it is displayed as `inline`.

### display: list-item
`display: list-item;` is a CSS1 specification with no compatibility issues. It changes the external display type of an element to `block` box model and the internal display type to multiple `list-item inline` box models.

## Internal Display
The `table` layout models have relatively complex internal structures, so their child elements may play different roles. These keywords are used to define these internal display types and only make sense in these specific layout models.

### display: table-row-group
`display: table-row-group;` is a CSS2 specification with good compatibility. It indicates that the element will be displayed as one or more groups of rows, similar to `<tbody>`.

### display: table-header-group
`display: table-header-group;` is a CSS2 specification with good compatibility. It indicates that the element will be displayed as one or more groups of rows, similar to `<thead>`.

### display: table-footer-group
`display: table-footer-group;` is a CSS2 specification with good compatibility. It indicates that the element will be displayed as one or more groups of rows, similar to `<tfoot>`.

### display: table-row
`display: table-row;` is a CSS2 specification with good compatibility. It indicates that the element will be displayed as a table row, similar to `<tr>`.

### display: table-column-group
`display: table-column-group;` is a CSS2 specification with good compatibility. It indicates that the element will be displayed as one or more groups of columns, similar to `<colgroup>`.

### display: table-column
`display: table-column;` is a CSS2 specification with good compatibility. It indicates that the element will be displayed as a table column, similar to `<col>`.

### display: table-cell
`display: table-cell;` is a property defined in the CSS2 specification and has good compatibility. This property value indicates that the element will be displayed as a table cell, similar to `<td>` and `<th>`.

### display: table-caption
`display: table-caption;` is a property defined in the CSS2 specification and has good compatibility. This property value indicates that the element will be displayed as a table caption, similar to `<caption>`.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.runoob.com/cssref/pr-class-display.html
https://developer.mozilla.org/zh-CN/docs/Web/CSS/display
https://blog.csdn.net/pedrojuliet/article/details/69062306
```