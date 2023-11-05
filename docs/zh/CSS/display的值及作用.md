# display的值及作用
`display`属性可以设置元素的内部和外部显示类型，元素的外部显示类型将决定该元素在流式布局中的表现，例如块级或内联元素，元素的内部显示类型可以控制其子元素的布局，例如`grid`或`flex`。目前所有浏览器都支持`display`属性，但是对于属性值的兼容性仍需注意。

## 外部显示
这些值指定了元素的外部显示类型，实际上就是其在流式布局中的角色，即在流式布局中的表现。

### display: none
`display: none;`是`CSS1`规范，无兼容性问题，该属性值表示此元素不会被显示，依照词义是真正隐藏元素，使用这个属性，被隐藏的元素不占据任何空间，用户交互操作例如点击事件都不会生效，读屏软件也不会读到元素的内容，这个元素的任何子元素也会同时被隐藏。当使用该属性将元素从显示状态切换为隐藏状态时，元素不占据原本的空间，会触发浏览器的重绘与回流。为这个属性添加过渡动画是无效的，他的任何不同状态值之间的切换总是会立即生效。这种方式产生的效果就像元素完全不存在，但在`DOM`中依然可以访问到这个元素，也可以通过`DOM`来操作它。

### display: block
`display: block;`是`CSS1`规范，无兼容性问题，该属性值表示此元素将显示为块级元素，此元素前后会带有换行符，元素独占一行，封闭后自动换行，默认宽度为`100%`，可以指定宽度和高度，内外边距对于四个方向有效。

### display: inline
`display: inline;`是`CSS1`规范，无兼容性问题，该属性值表示此元素会被显示为内联元素，元素会生成一个或多个内联元素框，这些框不会在自身之前或之后产生换行符，在正常流中，如果有空间，则下一个元素将在同一行上，元素排在一行，封闭后不会自动换行，不能指定高度与宽度，可以使用`line-height`来指定高度，外边距对于水平方向有效，垂直方向无效，内边距对于水平方向正常有效，垂直方向只有效果，对其他元素无任何影响。

### display: inline-block
`display: inline-block;`是`CSS2`规范，无兼容性问题，该属性值表示此元素将显示为内联块元素，该元素生成一个块元素框，该框将随周围的内容一起流动，就好像它是单个内联框一样，与被替换的元素非常相似，它等效于内联流根`inline flow-root`，可以指定宽度和高度，内外边距对于四个方向有效元素排在一行，但是在回车后会有空白缝隙。

### display: run-in
`display: run-in;`是`CSS2`规范，绝大部分浏览器都不兼容，目前这是个实验性属性值，不应该用作生产环境，该属性值表示此元素会根据上下文决定对象是内联对象还是块级对象，如果它后一个元素是`block`那么它会变成`inline`并和后一个元素并排，如果它后一个元素是`inline`那么它会变成`block`。

## 内部显示
这些关键字指定了元素的内部显示类型，它们定义了该元素内部内容的布局方式，需要假定该元素为非替换元素。

### display: flow-root
`display: flow-root;`是`CSS3`规范，兼容性一般，该属性值表示此元素会生成一个块元素盒子，该元素盒子可建立一个新的块格式化上下文`BFC`，定义格式化根所在的位置。

### display: table
`display: table;`是`CSS2`规范，兼容性良好，该属性值表示此元素会作为块级表格来显示，类似`<table>`，表格前后带有换行符。

### display: flex
`display: flex;`是`CSS3`规范，目前主流浏览器都已支持，是布局的首选方案，该属性值表示此元素会作为弹性盒子显示，在外部表现为`block`，内部作为弹性盒子使用，弹性布局可以为盒状模型提供最大的灵活性。在兼容移动端浏览器的方案上，有可能需要使用`display:-webkit-box;`，也就是内核前缀`-box`，同样都是弹性盒子，由于各阶段草案命名的原因，其命名从`box`更改为`flex`，`flex`是新的规范属性，此外`flex`并不能完全替代`box`，使用这两种方式在实际布局中会存在差异。

### display: grid
`display: grid;`是`CSS3`规范，目前主流浏览器都已支持，该属性值表示将元素分为一个个网格，然后利用这些网格组合做出各种各样的布局。`Grid`布局与`Flex`布局有一定的相似性，都可以指定容器内部多个成员的位置。不同之处在于，`Flex`布局是轴线布局，只能指定成员针对轴线的位置，可以看作是一维布局。`Grid`布局则是将容器划分成行和列，产生单元格，然后指定成员所在的单元格，可以看作是二维布局。

### display: inline-table
`display: inline-table;`是`CSS2`规范，兼容性良好，该属性值与`display: table;`在元素内部表现相同，在元素外部显示表现为`inline`。

### display: inline-flex
`display: inline-flex;`是`CSS3`规范，目前主流浏览器都已支持，该属性值与`display: flex;`在元素内部表现相同，在元素外部显示表现为`inline`。

### display: inline-grid
`display: inline-grid;`是`CSS3`规范，目前主流浏览器都已支持，该属性值与`display: grid;`在元素内部表现相同，在元素外部显示表现为`inline`。

### display: list-item
`display: list-item;`是`CSS1`规范，无兼容性问题，该属性值表示将元素的外部显示类型变为`block`盒模型，并将内部显示类型变为多个`list-item inline`盒模型。

## 内部表现
`table`布局模型有着相对复杂的内部结构，因此它们的子元素可能扮演着不同的角色，这一类关键字就是用来定义这些内部显示类型，并且只有在这些特定的布局模型中才有意义。

### display: table-row-group
`display: table-row-group;`是`CSS2`规范，兼容性良好，该属性值表示此元素会作为一个或多个行的分组来显示，类似于`<tbody>`。

### display: table-header-group
`display: table-header-group;`是`CSS2`规范，兼容性良好，该属性值表示此元素会作为一个或多个行的分组来显示，类似于`<thead>`。

### display: table-footer-group
`display: table-footer-group;`是`CSS2`规范，兼容性良好，该属性值表示此元素会作为一个或多个行的分组来显示，类似于`<tfoot>`。

### display: table-row
`display: table-row;`是`CSS2`规范，兼容性良好，该属性值表示此元素会作为一个表格行显示，类似于`<tr>`。

### display: table-column-group 
`display: table-column-group;`是`CSS2`规范，兼容性良好，该属性值表示此元素会作为一个或多个列的分组来显示，类似于`<colgroup>`。

### display: table-column
`display: table-column;`是`CSS2`规范，兼容性良好，该属性值表示此元素会作为一个单元格列显示，类似于`<col>`。

### display: table-cell
`display: table-cell;`是`CSS2`规范，兼容性良好，该属性值表示此元素会作为一个表格单元格显示，类似于`<td>`和`<th>`。

### display: table-caption
`display: table-caption;`是`CSS2`规范，兼容性良好，该属性值表示此元素会作为一个表格标题显示，类似于`<caption>`。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.runoob.com/cssref/pr-class-display.html
https://developer.mozilla.org/zh-CN/docs/Web/CSS/display
https://blog.csdn.net/pedrojuliet/article/details/69062306
```
