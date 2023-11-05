# Node对象
`Node`是一个接口，各种类型的`DOM API`对象会从这个接口继承，其允许我们使用相似的方式对待这些不同类型的对象。

## 属性
* `Node.prototype.baseURI`: 只读，返回一个表示`base URL`的`DOMString`，不同语言中的`base URL`的概念都不一样，在`HTML`中`base URL`表示协议和域名，以及一直到最后一个`/`之前的文件目录。
* `Node.prototype.baseURIObject`: 只读的`nsIURI`对象表示元素的`base URI`(不适用于网页内容)。
* `Node.prototype.childNodes`: 只读，返回一个包含了该节点所有子节点的实时的`NodeList`，`NodeList`是动态变化的，如果该节点的子节点发生了变化，`NodeList`对象就会自动更新。
* `Node.prototype.firstChild`: 只读，返回该节点的第一个子节点`Node`，如果该节点没有子节点则返回`null`。
* `Node.prototype.isConnected`: 只读，返回一个布尔值用来检测该节点是否已连接(直接或者间接)到一个上下文对象上，比如通常`DOM`情况下的`Document`对象，或者在`shadow DOM`情况下的`ShadowRoot`对象。
* `Node.prototype.lastChild`: 只读，返回该节点的最后一个子节点`Node`，如果该节点没有子节点则返回`null`。
* `Node.prototype.nextSibling`: 只读，返回与该节点同级的下一个节点`Node`，如果没有返回`null`。
* `Node.prototype.nodeName`: 只读，返回一个包含该节点名字的`DOMString`，节点的名字的结构和节点类型不同，`HTMLElement`的名字跟它所关联的标签对应，就比如`HTMLAudioElement`的就是`audio`，`Text`节点对应的是`#text`，还有`Document`节点对应的是`#document`。
* `Node.prototype.nodeType`: 只读，返回一个与该节点类型对应的无符号短整型的值。
* `Node.prototype.nodeValue`: 返回或设置当前节点的值。
* `Node.prototype.ownerDocument`: 只读，返回这个元素属于的`Document`对象，如果没有`Document`对象与之关联，返回`null`。
* `Node.prototype.parentNode`: 只读，返回一个当前节点`Node`的父节点。如果没有这样的节点，比如说像这个节点是树结构的顶端或者没有插入一棵树中， 这个属性返回`null`。
* `Node.prototype.parentElement`: 只读，返回一个当前节点的父节点`Element`。如果当前节点没有父节点或者说父节点不是一个元素`Element`, 这个属性返回`null`。
* `Node.prototype.previousSibling`: 只读，返回一个当前节点同辈的前一个节点`Node`，如果不存在这样的一个节点的话返回`null`。
* `Node.prototype.textContent`: 返回或设置一个元素内所有子节点及其后代的文本内容。

## 方法
* `Node.prototype.appendChild()`: 将指定的`childNode`参数作为最后一个子节点添加到当前节点，如果参数引用了`DOM`树上的现有节点，则节点将从当前位置分离，并附加到新位置。
* `Node.prototype.cloneNode()`: 克隆一个`Node`，并且可以选择是否克隆这个节点下的所有内容，默认情况下，节点下的内容会被克隆。
* `Node.prototype.compareDocumentPosition()`: 比较当前节点与文档中的另一节点的位置。
* `Node.prototype.contains()`: 返回一个`Boolean`布尔值，来表示传入的节点是否为该节点的后代节点。
* `Node.prototype.getRootNode()`: 返回上下文对象的根节点，如果`shadow root`节点存在的话，也可以在返回的节点中包含它。
* `Node.prototype.hasChildNodes()`: 返回一个`Boolean`布尔值，来表示该元素是否包含有子节点。
* `Node.prototype.insertBefore()`: 在当前节点下增加一个子节点`Node`，并使该子节点位于参考节点的前面。
* `Node.prototype.isDefaultNamespace()`: 返回一个`Boolean`类型值，接受一个命名空间`URI`作为参数，当参数所指代的命名空间是默认命名空间时返回`true`，否则返回`false`。
* `Node.prototype.isEqualNode()`: 返回一个`Boolean`类型值，当两个`node`节点为相同类型的节点且定义的数据点匹配时(即属性和属性值相同，节点值相同)返回`true`，否则返回`false`。
* `Node.prototype.isSameNode()`: 返回一个`Boolean`类型值，返回这两个节点的引用比较结果。
* `Node.prototype.lookupPrefix()`: 返回包含参数`URI`所对应的命名空间前缀的`DOMString`，若不存在则返回`null`，如果存在多个可匹配的前缀，则返回结果和浏览器具体实现有关。
* `Node.prototype.lookupNamespaceURI()`: 接受一个前缀，并返回前缀所对应节点命名空间`URI`，如果`URI`不存在则返回`null`，传入`null`作为`prefix`参数将返回默认命名空间。
* `Node.prototype.normalize()`: 对该元素下的所有文本子节点进行整理，合并相邻的文本节点并清除空文本节点。
* `Node.prototype.removeChild()`: 移除当前节点的一个子节点。这个子节点必须存在于当前节点中。
* `Node.prototype.replaceChild()`: 对选定的节点，替换一个子节点`Node`为另外一个节点。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/API/Node
```

