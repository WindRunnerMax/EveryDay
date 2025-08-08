# Table Layout
The most common and correct way to use `<table>` is to create a table. Since it helps to divide the space it occupies, `<table>` can be used for layout purposes.

## Example
To create a simple layout, set the `border`, `cellpadding`, and `cellspacing` of the table to `0`. This way, the table's border and spacing will not take up any space on the page. It only serves the purpose of dividing the space. If the layout is complex, you can nest tables within cells and use `align` and `valign` to align the elements or nested tables. It is important to note that in the HTML5 standard, the `align`, `bgcolor`, `cellpadding`, `cellspacing`, `frame`, `rules`, `summary`, and `width` attributes of `<table>` are no longer supported. These effects can be achieved by setting the relevant properties in CSS.

```html
<!DOCTYPE html>
<html>
<head> 
<meta charset="utf-8"> 
<title>TABLE布局</title> 
</head>
<body>

<table border="0" style="width: 100%;">
  <tr>
    <td style="width: 200px;">Navigation</td>
    <td>Content</th>
  </tr>
</table>

</body>
</html>
```

## Issues
Using `<table>` for layout is not a good solution. The preferred layout options are `Flex` layout for simple layouts and `Grid` layout for more complex layouts. `<table>` is designed for presenting tabular data, and it is perfectly fine to use it for that purpose.
* `<table>` takes up more bytes than other HTML tags, increasing code complexity.
* `<table>` blocks the rendering order of the browser's rendering engine. It is only displayed after the entire table is loaded, causing a blank space until then. On the other hand, tags like `<div>` can be rendered line by line, displaying as they load.
* `<table>` often requires multiple passes because it can affect the display of elements that have already entered the DOM. For example, if the content of the last cell in a table is too wide, it can change the size of the columns, causing browser reflows and rendering performance issues.
* Displaying images in `<table>` may require splitting a single logical image into multiple images, depending on the requirements. Merging cells in `<table>` is also a viable solution.
* `<table>` can affect the effectiveness of certain layout properties within its cells.
* Various attributes of `<table>` are gradually being phased out and should be controlled using CSS to achieve the desired effects.
* The semantic meaning of `<table>` is a data table, and using it for layout purposes is not beneficial for SEO.
* If the layout is complex, it may result in excessive nesting of `<table>` tags, making the code overly complicated.

## Display
If a table-like layout is needed, the `display: table;` property can be used. The `table` value of the `display` property only declares the styles of certain elements in the browser. It does not have semantic meaning. It can correspond to the `<table>` series of tags, and any missing table elements will be created by the browser in an anonymous manner. According to the CSS2.1 specification, elements in the CSS2.1 table model may not be included in document languages other than HTML. In this case, the "missing" elements will be simulated to make the table model work properly. All table elements will automatically generate the necessary anonymous `table` objects around themselves to conform to the three-level nesting relationship of `table/inline-table`, `table-row`, and `table-cell`.

* `table` is similar to `<table>`: This element is displayed as a block-level table, with line breaks before and after the table.
* `inline-table` is similar to `<table>`: This element is displayed as an inline table, without line breaks before and after the table.
* `table-header-group` is similar to `<thead>`: This element is displayed as a group of one or more rows.
* `table-footer-group` is similar to `<tfoot>`: This element is displayed as a group of one or more rows.
* `table-row` is similar to `<tr>`: This element is displayed as a table row.
* `table-row-group` is similar to `<tbody>`: This element is displayed as a group of one or more rows.
* `table-column` is similar to `<col>`: This element is displayed as a table column.
* `table-column-group` is similar to `<colgroup>`: This element is displayed as a group of one or more columns.
* `table-cell` is similar to `<td>` and `<th>`: This element is displayed as a table cell.
* `table-caption` is similar to `<caption>`: This element is displayed as a table caption.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.cnblogs.com/mguo/p/3414118.html
https://www.cnblogs.com/cowboybusy/p/10530547.html
https://www.html5tricks.com/why-not-table-layout.html
```