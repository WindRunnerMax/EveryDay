# Element对象
`Element`是一个通用性非常强的基类，所有`Document`对象下的对象都继承自它，这个对象描述了所有相同种类的元素所普遍具有的方法和属性，一些接口继承自`Element`并且增加了一些额外功能的接口描述了具体的行为，例如`HTMLElement`接口是所有`HTML`元素的基本接口，而`SVGElement`接口是所有`SVG`元素的基础，大多数功能是在这个类的更深层级的接口中被进一步制定的。


## 属性
所有属性继承自它的祖先接口`Node`，并且扩展了`Node`的父接口`EventTarget`，并且从`ParentNode`、`ChildNode`、`NonDocumentTypeChildNode`和`Animatable`承了属性。
* `Element.prototype.attributes`: 只读，返回一个与该元素相关的所有属性集合`NamedNodeMap`。
* `Element.prototype.classList`: 只读，返回该元素包含的`class`属性，是一个`DOMTokenList`。
* `Element.prototype.className`: 一个`DOMString`，表示这个元素的`class`。
* `Element.prototype.clientHeight`: 只读，返回`Number`表示内部相对于外层元素的高度。
* `Element.prototype.clientLeft`: 只读，返回`Number`表示该元素距离它左边界的宽度。
* `Element.prototype.clientTop`: 只读，返回`Number`表示该元素距离它上边界的高度。
* `Element.prototype.clientWidth`: 只读，返回`Number`表示该元素内部的宽度。
* `Element.prototype.computedName`: 只读，返回一个`DOMString`，其中包含公开给可访问性的标签。
* `Element.prototype.computedRole`: 只读，返回一个`DOMString`，其中包含应用于特定元素的`ARIA`角色。
* `Element.prototype.id`: 是一个`DOMString`表示这个元素的`id`。
* `Element.prototype.innerHTML`: 返回一个`DOMString`，表示这个元素的内容文本。
* `Element.prototype.localName`: 只读，返回一个`DOMString`表示这个元素名称本地化的部分。
* `Element.prototype.namespaceURI`: 只读，元素对应的`namespace URI`，如果没有则返回`null`。
* `NonDocumentTypeChildNode.nextElementSibling`: 只读，返回一个`Element`表示该元素下一个兄弟节点，如果为`null`表示不存在。
* `Element.prototype.outerHTML`:返回一个`DOMString`，获取该`DOM`元素及其后代的`HTML`文本，在设置它的时候，会从给定的字符串开始解析，替换自身。
* `Element.prototype.prefix`: 只读，表示元素的名称空间前缀的`DOMString`，如果未指定前缀，则为`null`。
* `NonDocumentTypeChildNode.prototype.previousElementSibling`: 只读，返回一个`Element`表示该元素上一个兄弟节点, 如果为`null`表示不存在。
* `Element.prototype.scrollHeight`: 只读，返回类型为`Number`，表示元素的滚动视图高度。
* `Element.prototype.scrollLeft`: 返回类型为`Number`，表示该元素横向滚动条距离最左的位移。
* `Element.prototype.scrollLeftMax`: 只读，返回类型为`Number`表示该元素横向滚动条可移动的最大值。
* `Element.prototype.scrollTop`: 返回类型为`Number`，表示该元素纵向滚动条距离。
* `Element.prototype.scrollTopMax`: 只读，返回类型为`Number`，表示该元素纵向滚动条可移动的最大值。
* `Element.prototype.scrollWidth`: 只读，返回类型为`Number`，表示元素的滚动视图宽度。
* `Element.prototype.shadowRoot`: 只读，返回由元素托管的开放`shadowRoot`，如果没有开放的`shadowRoot`，则返回`null`。
* `Element.prototype.openOrClosedShadowRoot`: 只读，返回由元素托管的`shadowRoot`，无论其打开还是关闭，仅适用于`WebExtensions`。
* `Element.prototype.slot`: 返回插入元素的`DOM`插槽的名称。
* `Element.prototype.tabStop`: 返回一个布尔值，指示元素是否可以通过`Tab`键接收输入焦点。
* `Element.prototype.tagName`: 只读，返回一个带有给定元素标记名称的字符串。
* `Element.prototype.undoManager`: 只读，返回与元素关联的`UndoManager`。
* `Element.prototype.undoScope`: 返回一个布尔值，指示该元素是否是撤消作用域主机。
* `Slotable.prototype.assignedSlot`: 只读，返回`HTMLSlotElement`，表示节点所插入的`<solt>`。

## 方法
从其父节点及其父节点`EventTarget`继承方法，并实现`ParentNode`、`ChildNode`、`NonDocumentTypeChildNode`和`Animatable`的方法。
* `EventTarget.prototype.addEventListener()`: 将事件处理程序注册到元素上的特定事件类型。
* `Element.prototype.attachShadow()`: 将一个`shadow  DOM`树附加到指定的元素，并返回对其`ShadowRoot`的引用。
* `Element.prototype.animate()`: 在元素上创建和运行动画的快捷方法，返回创建的动画对象实例。
* `Element.prototype.closest()`: 返回与参数中给定的选择器匹配的当前元素或当前元素本身的最接近祖先的`Element`。
* `Element.prototype.createShadowRoot()`: 在元素上创建`shadow DOM`，将其转换为`shadow host`，返回`ShadowRoot`。
* `Element.prototype.computedStyleMap()`: 返回`StylePropertyMapReadOnly`接口，该接口提供`CSS`声明块的只读表示形式，它是`CSSStyleDeclaration`的替代形式。
* `EventTarget.dispatchEvent()`: 将事件调度到`DOM`中的此节点，并返回一个布尔值，该布尔值指示是否没有处理程序取消该事件。
* `Element.prototype.getAnimations()`: 返回当前在元素上活动的`Animation`对象的数组。
* `Element.prototype.getAttribute()`: 从当前节点检索命名属性的值，并将其作为对象返回。
* `Element.prototype.getAttributeNames()`: 返回当前元素的属性名称数组。
* `Element.prototype.getAttributeNS()`: 从当前节点检索具有指定名称和名称空间的属性的值，并将其作为对象返回。
* `Element.prototype.getAttributeNode()`: 从当前节点检索命名属性的节点表示形式，并将其作为属性返回。
* `Element.prototype.getAttributeNodeNS()`: 从当前节点检索具有指定名称和名称空间的属性的节点表示形式，并将其作为属性返回。
* `Element.prototype.getBoundingClientRect()`: 返回元素的大小及其相对于视口的位置。
* `Element.prototype.getClientRects()`: 返回矩形的集合，这些矩形指示客户端中每行文本的边框。
* `Element.prototype.getElementsByClassName()`: 参数中给出类的列表，返回一个动态的`HTMLCollection`，包含了所有持有这些类的后代元素。
* `Element.prototype.getElementsByTagName()`: 返回一个动态的`HTMLCollection`，包含当前元素中特定标记名称的所有后代元素。
* `Element.prototype.getElementsByTagNameNS()`: 返回一个动态的`HTMLCollection`，包含当前元素中特定标记名称和命名空间的所有后代元素。
* `Element.prototype.hasAttribute()`: 返回一个布尔值，指示元素是否具有指定的属性。
* `Element.prototype.hasAttributeNS()`:返回一个布尔值，指示元素在指定的名称空间中是否具有指定的属性。
* `Element.prototype.hasAttributes()`: 返回一个布尔值，指示元素是否有一个或多个`HTML`属性。
* `Element.prototype.hasPointerCapture()`: 指示在其上被调用的元素是否具有由给定指针`ID`标识的指针的指针捕获。
* `Element.prototype.insertAdjacentElement()`: 将一个给定的元素节点插入到相对于调用它的元素的给定位置。
* `Element.prototype.insertAdjacentHTML()`: 将文本解析为`HTML`或`XML`，并将结果节点插入给定位置的树中。
* `Element.prototype.insertAdjacentText()`: 在相对于调用它的元素的给定位置插入给定的文本节点。
* `Element.prototype.matches()`: 返回一个布尔值，指示指定的选择器字符串是否选择该元素。
* `Element.prototype.pseudo()`: 返回一个`CSSPseudoElement`，它表示由指定的伪元素选择器匹配的子伪元素。
* `Element.prototype.querySelector()`: 返回与指定的选择器字符串相对于元素匹配的第一个`Node`。
* `Element.prototype.querySelectorAll()`: 返回与指定的选择器字符串相对于元素匹配的节点的`NodeList`。
* `Element.prototype.releasePointerCapture()`: 释放(停止)先前为特定指针事件设置的指针捕获。
* `ChildNode.prototype.remove()`: 从其父级的子级列表中删除该元素。
* `Element.prototype.removeAttribute()`: 从当前节点中移除命名属性。
* `Element.prototype.removeAttributeNS()`: 从当前节点中删除具有指定名称和名称空间的属性。
* `Element.prototype.removeAttributeNode()`: 从当前节点中删除命名属性的节点表示形式。
* `EventTarget.prototype.removeEventListener()`: 从元素中移除事件监听器。
* `Element.prototype.requestFullscreen()`: 异步请求浏览器将元素设置为全屏。
* `Element.prototype.requestPointerLock()`: 允许异步请求将指针锁定在给定元素上。
* `Element.prototype.scroll()`: 滚动到给定元素内的一组特定坐标。
* `Element.prototype.scrollBy()`: 按给定量滚动元素。
* `Element.prototype.scrollIntoView()`: 滚动页面，直到元素进入视图。
* `Element.prototype.scrollTo()`: 滚动到给定元素内的一组特定坐标。
* `Element.prototype.setAttribute()`: 设置当前节点的命名属性的值。
* `Element.prototype.setAttributeNS()`: 使用指定的名称和名称空间从当前节点设置属性的值。
* `Element.prototype.setAttributeNode()`: 从当前节点设置命名属性的节点表示形式。
* `Element.prototype.setAttributeNodeNS()`: 从当前节点设置具有指定名称和名称空间的属性的节点表示形式。
* `Element.prototype.setCapture()`: 设置鼠标事件捕获，将所有鼠标事件重定向到此元素。
* `Element.prototype.setPointerCapture()`: 指定一个特定元素作为将来指针事件的捕获目标。
* `Element.prototype.toggleAttribute()`: 在指定元素上切换布尔属性，如果布尔属性存在，则将其删除，如果布尔属性不存在，则将其添加。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/API/Element
```

