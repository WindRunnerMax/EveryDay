# Table布局
`<table>`最常用的也是最正确的使用方法是制作表格，由于其对占据的空间有着划分的作用，便可以使用`<table>`来布局。

## 实例
实现一个简单的布局，将表格的`border`、`cellpadding`、`cellspacing`全部设置为`0`，表格的边框和间距就不占有页面空间，它只起到划分空间的作用，如果布局复杂，可以在单元格中再嵌套表格，单元格中的元素或者嵌套的表格用`align`和`valign`设置对齐方式。要注意的是，在`HTML5`标准中，`<table>`的`align`、`bgcolor`、`cellpadding`、`cellspacing`、`frame`、`rules`、`summary`、`width`属性皆已不再支持，由`CSS`设置相关属性来呈现效果。

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
    <td style="width: 200px;">导航栏</td>
    <td>内容</th>
  </tr>
</table>

</body>
</html>
```

## 问题
使用`<table>`来布局绝对不是一个好的解决方案，对于布局方案首选`Flex`布局，稍微复杂的布局可以选择`Grid`布局方案，`<table>`本身是为呈现表格化的数据而设计的，如果使用`<table>`来呈现数据表格是完全没有问题的。
* `<table>`要比其它`html`标记占更多的字节，代码的复杂度会大大提升。
* `<table>`会阻塞浏览器渲染引擎的渲染顺序，`<table>`是整体载入后才开始显示的，没有加载完毕前，`<table>`为一片空白，而`<div>`等标签可以逐行渲染，一边加载一边显示。
* `<table>`经常需要多个关口，因为`<table>`可以影响在它们之前已经进入的`DOM`元素的显示的元素。假设因为表格最后一个单元格的内容过宽而导致纵列大小完全改变，这会造成浏览器的回流从而引发渲染性能问题。
* `<table>`里显示图片时有可能需要你把单个、有逻辑性的图片切成多个图，这个主要看需求，`<table>`中进行单元格合并操作也是可行的方案。
* `<table>`会影响其单元格内部的某些布局属性的生效。
* `<table>`的各种属性逐渐不受支持，需要使用`CSS`控制显示相应效果。
* `<table>`的语义是数据表格，使用`<table>`来布局不利于`SEO`。
* 若布局较为复杂，则可能造成多层`<table>`嵌套，代码嵌套过多表现的过于复杂。

## display
倘若需要类似于表格的布局，可以使用`display: table;`来呈现，`display`的`table`属性值只是声明了某些元素在浏览器中的样式，其并不包含语义，他的属性基本能够对应`<table>`系列标签，并且还能将缺少的表格元素会被浏览器以匿名方式创建，`CSS2.1`规范中写道：`CSS2.1`表格模型中的元素，可能不会全部包含在除`HTML`之外的文档语言中。这时，那些“丢失”的元素会被模拟出来，从而使得表格模型能够正常工作。所有的表格元素将会自动在自身周围生成所需的匿名`table`对象，使其符合`table/inline-table`、`table-row`、`table-cell`的三层嵌套关系。

* `table`类似`<table>`：此元素会作为块级表格来显示，表格前后带有换行符。
* `inline-table`类似`<table>`：此元素会作为内联表格来显示，表格前后没有换行符。
* `table-header-group`类似`<thead>`：此元素会作为一个或多个行的分组来显示。
* `table-footer-group`类似`<tfoot>`：此元素会作为一个或多个行的分组来显示。
* `table-row`类似`<tr>`：此元素会作为一个表格行显示。
* `table-row-group`类似`<tbody>`：此元素会作为一个或多个行的分组来显示。
* `table-column`类似`<col>`：此元素会作为一个单元格列显示。
* `table-column-group`类似`<colgroup>`：此元素会作为一个或多个列的分组来显示。
* `table-cell`类似`<td>`和`<th>`：此元素会作为一个表格单元格显示。
* `table-caption`类似`<caption>`：此元素会作为一个表格标题显示。

## 参考

```
https://www.cnblogs.com/mguo/p/3414118.html
https://www.cnblogs.com/cowboybusy/p/10530547.html
https://www.html5tricks.com/why-not-table-layout.html
```
