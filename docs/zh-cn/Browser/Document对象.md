# Document对象
`Document`接口表示任何在浏览器中载入的网页，并作为网页内容的入口，也就是`DOM`树。`DOM`树包含了像`<body>`、`<div>`这样的元素，以及大量其他元素。`Document`对象向网页文档本身提供了全局操作功能，接口描述了任何类型的文档的通用属性与方法，根据不同的文档类型(例如`HTML`、`XML`、`SVG`、`...`)能够使用更多`API`，此外使用`text/html`作为内容类型`content type`的`HTML`文档，还实现了`HTMLDocument`接口，而`XML`和`SVG`文档则额外实现了`XMLDocument`接口。

## 属性
* `Document()`: `Document`构造器创建一个新的`Document`对象，该对象是在浏览器中加载的页面，并作为页面内容的入口点。
* `document.body`: 返回当前文档中的`<body>`元素或者`<frameset>`元素。
* `document.characterSet`: `document.characterSet`只读属性，返回当前文档的字符编码，该字符编码是用于渲染此文档的字符集，可能与该页面指定的编码不同。
* `document.childElementCount`: `ParentNode.childElementCount`只读属性，返回一个无符号长整型数字，表示给定元素的子元素数。
* `document.children`: 只读属性，返回一个`Node`的子`elements`，是一个动态更新的`HTMLCollection`。
* `document.compatMode`: 表明当前文档的渲染模式是怪异模式/混杂模式还是标准模式。
* `document.contentType`: 只读属性，返回当前文档的`Content-Type(MIME)`类型。
* `document.currentScript`: `document.currentScript`属性返回当前正在运行的脚本所属的`<script>`元素，调用此属性的脚本不能是`JavaScript`模块，模块应当使用`import.meta`对象。
* `document.defaultView`: 在浏览器中，该属性返回当前`document`对象所关联的`window`对象，如果没有则会返回`null`。
* `document.designMode`: `document.designMode`控制整个文档是否可编辑，有效值为`on`和`off`，根据规范，该属性默认为`off`，通常用在`<iframe>`中。
* `document.dir`: `document.dir`的本质是`DOMString`，代表了文档的文字朝向，是从左到右`ltr`(默认)还是从右到左`rtl`，并可以设置文字的朝向。
* `document.doctype`: 返回当前文档关联的文档类型定义`DTD`，返回的对象实现了`DocumentType`接口，使用`DOMImplementation.createDocumentType()`方法可以创建一个`DocumentType`类型的对象。
* `document.documentElement`: `document.documentElement`是一个会返回文档对象`document`的根元素的只读属性，例如`HTML`文档的`<html>`元素。
* `document.documentURI`: `Document`接口的属性`documentURI`以字符串的形式返回文档的位置`location`，在最初的`DOM3`定义中，这个属性是可读/写的，在现代的`DOM`标准`DOM4`中，它是只读的。
* `document.domain`: `Document`接口的`domain`属性获取/设置当前文档的原始域部分，常用于同源策略，如果成功设置此属性，则原始端口的端口部分也将设置为`null`。
* `document.embeds`: `Document`接口的`embeds`只读属性返回当前文档中嵌入的`<object>`元素的列表。
* `document.firstElementChild`: 只读属性，返回对象的第一个子元素,如果没有子元素，则为`null`。
* `document.forms`: `document.forms`返回当前文档中的`<form>`元素的一个集合，是一个`HTMLCollection`。
* `document.mozFullScreenEnabled`: 返回一个布尔值，表明浏览器是否支持全屏模式，全屏模式只在那些不包含窗口化的插件的页面中可用，对于一个`<iframe>`元素中的页面，则它必需拥有`mozallowfullscreen`属性。
* `document.head`: 返回当前文档中的`<head>`元素，如果有多个`<head>`元素，则返回第一个。
* `document.hidden`: `document.hidden`只读属性，返回布尔值，表示页面是`true`否`false`隐藏。
* `document.images`: 只读属性，返回当前文档中所有`image`元素的集合。
* `document.implementation`: 返回一个和当前文档相关联的`DOMImplementation`对象。
* `lastElementChild`: 只读属性，返回对象的最后一个孩子`Element`，如果没有子元素，则返回`null`。
* `document.lastModified`: 返回一个字符串，其中包含了当前文档的最后修改日期和时间。
* `document.links`: `document.links`属性返回一个文档中所有具有`href`属性值的`<area>`元素与`<a>`元素的集合。
* `document.location`: 返回一个`Location`对象，包含有文档的`URL`相关的信息，并提供了改变该`URL`和加载其他`URL`的方法。
* `document.onbeforeunload`: 该事件在即将离开页面（刷新或关闭）时触发。
* `document.onload`: 文档加载完成后触发。
* `document.onreadystatechange`: 当文档的`readyState`属性发生改变时，会触发`readystatechange`事件。
* `document.onvisibilitychange`: 将在该对象的`visibilitychange`事件被触发时调用。
* `document.onunload`: 当窗口卸载其内容和资源时触发。
* `document.onerror`: 当发生`JavaScript`运行时错误与资源加载失败时触发。
* `document.onabort`: 发送到`window`的中止`abort`事件的事件处理程序，不适用于`Firefox 2`或`Safari`。
* `document.onblur`: 窗口失去焦点时触发。
* `document.onfocus`: 窗口获得焦点时触发。
* `document.onresize`: 窗口大小发生改变时触发。
* `document.onscroll`: 窗口发生滚动时触发。
* `document.onmessage`: 窗口对象接收消息事件时触发。
* `document.onchange`: 窗口内表单元素的内容改变时触发。
* `document.oninput`: 窗口内表单元素获取用户输入时触发。
* `document.onreset`: 窗口内表单重置时触发。
* `document.onselect`: 窗口内表单元素中文本被选中时触发。
* `document.onsubmit`: 窗口内表单中`submit`按钮被按下触发。
* `document.onhashchange`: 当窗口的锚点哈希值发生变化时触发。
* `document.onclick`: 当点击页面时触发。
* `document.onmouseup`: 鼠标按键被松开时触发。
* `document.ondblclick`: 当双击页面时调用事件句柄。
* `document.oncontextmenu`: 在点击鼠标右键打开上下文菜单时触发。
* `document.onmousedown`: 鼠标按钮被按下时触发。
* `document.onmousemove`: 当移动鼠标时触发。
* `document.onmouseout`: 鼠标移出窗口时触发。
* `document.onmouseover`: 鼠标移动到窗口时触发。
* `document.onauxclick`: 指示在输入设备上按下非主按钮时触发，例如鼠标中键。
* `document.onkeydown`: 某个键盘按键被按下时触发。
* `document.onkeyup`: 某个键盘按键被松开后触发。
* `document.onkeypress`: 某个键盘按键被按下并松开后触发。
* `document.onanimationcancel`: 当`CSS`动画意外中止时，即在任何时候它停止运行而不发送`animationend`事件时将发送此事件，例如当`animation-name`被改变，动画被删除等
* `document.onanimationend`: 当`CSS`动画到达其活动周期的末尾时，按照`(animation-duration*animation-iteration-count) + animation-delay`进行计算，将发送此事件。
* `document.onanimationiteration`: 此事件将会在`CSS`动画到达每次迭代结束时触发，当通过执行最后一个动画步骤完成对动画指令序列的单次传递完成时，迭代结束。
* `document.ondevicemotion`: 设备状态发生改变时触发
* `document.ondeviceorientation`: 设备相对方向发生改变时触发
* `document.ondeviceproximity`: 当设备传感器检测到物体变得更接近或更远离设备时触发。
* `document.onbeforeprint`:  该事件在页面即将开始打印时触发
* `document.onafterprint`: 该事件在页面已经开始打印或者打印窗口已经关闭时触发。
* `document.onappinstalled`: 一旦将`Web`应用程序成功安装为渐进式`Web`应用程序，该事件就会被分派。
* `document.onbeforeinstallprompt`: 当用户即将被提示安装`web`应用程序时，该处理程序将在设备上调度，其相关联的事件可以保存以供稍后用于在更适合的时间提示用户。 
* `document.plugins`: 只读属性返回一个`HTMLCollection`对象，该对象包含一个或多个`HTMLEmbedElements`，表示当前文档中的`<embed>`元素。
* `document.readyState`: `document.readyState`属性描述`document`的加载状态。当该属性值发生变化时，会在`document`对象上触发`readystatechange`事件。
* `document.referrer`: 返回一个`URI`,当前页面就是从这个`URI`所代表的页面跳转或打开的。
* `document.scripts`: 返回一个`HTMLCollection`对象，包含了当前文档中所有`<script>`元素的集合。
* `document.scrollingElement`: 只读属性，返回滚动文档的`Element`对象的引用，在标准模式下，返回文档的根元素，当在怪异模式下， 返回`HTML body`元素，若不存在返回`null`。
* `document.selectedStyleSheetSet`: 返回当前使用的样式表集合的名称，你也可以使用这个属性设置当前样式表集。
* `document.styleSheetSets`: 返回一个所有当前可用样式表集的实时列表。
* `document.title`: 获取或设置文档的标题。
* `document.URL`: 返回当前文档的`URL`地址。
* `document.visibilityState`: 只读属性，返回`document`的可见性，即当前可见元素的上下文环境，由此可以知道当前文档(即为页面)是在背后, 或是不可见的隐藏的标签页，或者正在预渲染，可选值有`visible`可见(至少是部分可见)、`hidden`不可见、`prerender`预渲染。

## 方法
* `document.adoptNode(externalNode)`: 从其他的`document`文档中获取一个节点，该节点以及它的子树上的所有节点都会从原文档删除(如果有这个节点的话)，并且它的`ownerDocument`属性会变成当前的`document`文档，之后你可以把这个节点插入到当前文档中。
* `document.close()`: `document.close()`用于结束由对文档的`document.write()`写入操作，这种写入操作一般由`document.open()`打开。
* `document.createAttribute(name)`: `document.createAttribute()`方法创建并返回一个新的属性节点，这个对象创建一个实现了`Attr`接口的节点，这个方式下`DOM`不限制节点能够添加的属性种类。
* `document.createCDATASection(data)`: 创建并返回一个新的`CDATA`片段节点。
* `document.createComment(data)`: 创建并返回一个注释节点，`data`是一个字符串，包含了注释的内容。
* `document.createDocumentFragment()`: 创建一个新的空白的文档片段`DocumentFragment`。
* `document.createElement(tagName[, options])`: 在`HTML`文档中，`document.createElement()`方法用于创建一个由标签名称`tagName`指定的`HTML`元素。如果用户代理无法识别`tagName`，则会生成一个未知`HTML`元素`HTMLUnknownElement`。
* `document.createElementNS(namespaceURI, qualifiedName[, options])`: 创建一个具有指定的命名空间`URI`和限定名称的元素，要创建一个元素而不指定命名空间`URI`，请使用`createElement`方法。
* `document.createEvent(type)`: 创建一个指定类型的事件，其返回的对象必须先初始化并可以被传递给`element.dispatchEvent`。
* `document.createExpression(xpathText, namespaceURLMapper)`: 该方法将编译生成一个 `XPathExpression`，可以用来多次的执行。
* `document.createNodeIterator(root[, whatToShow[, filter]])`: 返回一个新的`NodeIterator`对象。
* `document.createNSResolver(node)`: 创建一个`XPathNSResolver`，它根据指定节点范围内的定义解析名称空间。
* `document.createProcessingInstruction(target, data)`: 创建一个新的处理指令节点，并返回。
* `document.createRange()`: 返回一个`Range`对象。
* `document.createTextNode(data)`: 创建一个新的文本节点，这个方法可以用来转义`HTML`字符。
* `document.createTreeWalker(root, whatToShow, filter, entityReferenceExpansion)`: 创建并返回一个`TreeWalker`对象。
* `document.evaluate(xpathExpression, contextNode, namespaceResolver, resultType, result)`: 根据传入的`XPath`表达式以及其他参数，返回一个`XPathResult`对象。
* `document.exitFullscreen()`: 用于让当前文档退出全屏模式，调用这个方法会让文档回退到上一个调用`Element.requestFullscreen()`方法进入全屏模式之前的状态。
* `document.getElementById(id)`: 返回一个匹配特定`ID`的元素，由于元素的`ID`在大部分情况下要求是独一无二的，这个方法自然而然地成为了一个高效查找特定元素的方法。
* `document.getElementsByClassName(names)`: 返回一个包含了所有指定类名的子元素的类数组对象，当在`document`对象上调用时，会搜索整个`DOM`文档，包含根节点。你也可以在任意元素上调用`getElementsByClassName()`方法，它将返回的是以当前元素为根节点，所有指定类名的子元素。
* `document.getElementsByName(name)`: 根据给定的`name`返回一个在`(X)HTML document`的节点列表集合。
* `document.getElementsByTagName(name)`: 返回一个包括所有给定标签名称的元素的`HTML`集合`HTMLCollection`，整个文件结构都会被搜索，包括根节点。返回的`HTML`集合是动态的，意味着它可以自动更新自己来保持和`DOM`树的同步而不用再次调用`document.getElementsByTagName()`。
* `document.getElementsByTagNameNS(namespace, name)`: 返回带有指定名称和命名空间的元素集合，整个文件结构都会被搜索，包括根节点。
* `document.hasFocus()`: 返回一个`Boolean`，表明当前文档或者当前文档内的节点是否获得了焦点，该方法可以用来判断当前文档中的活动元素是否获得了焦点。
* `document.hasStorageAccess()`: 返回了一个`Promise`来判断该文档是否有访问第一方储存的权限。
* `document.importNode(externalNode, deep)`: 将外部文档的一个节点拷贝一份，然后可以把这个拷贝的节点插入到当前文档中。
* `document.open()`: 打开一个要写入的文档，这将会有一些连带的影响，例如此时已注册到文档、文档中的节点或文档的window的所有事件监听器会被清除，文档中的所有节点会被清除。
* `prepend((Node or DOMString)... nodes)`: 可以在父节点的第一个子节点之前插入一系列`Node`对象或者`DOMString`对象。
* `document.queryCommandEnabled(command)`: 可查询浏览器中指定的编辑指令是否可用。
* `document.queryCommandSupported(command)`: 确定浏览器是否支持指定的编辑指令。
* `document.querySelector(selectors)`: 表示文档中与指定的一组`CSS`选择器匹配的第一个元素，是一个`HTMLElement`对象，如果没有匹配到，则返回`null`。匹配是使用深度优先先序遍历，从文档标记中的第一个元素开始，并按子节点的顺序依次遍历。
* `document.querySelectorAll(selectors)`: 返回一个静态`NodeList`，包含一个与至少一个指定`CSS`选择器匹配的元素的`Element`对象，或者在没有匹配的情况下为空`NodeList`。
* `document.releaseCapture()`: 如果该`document`中的一个元素之上当前启用了鼠标捕获，则释放鼠标捕获，通过调用`element.setCapture()`实现在一个元素上启用鼠标捕获。
* `document.write(markup)`: `document.write()`方法将一个文本字符串写入一个由`document.open()`打开的文档流，因为`document.write`需要向文档流中写入内容，所以若在一个已关闭(例如已完成加载)的文档上调用`document.write`，就会自动调用`document.open`，这将清空该文档的内容。
* `document.writeln(line)`: 向文档中写入一串文本，并紧跟着一个换行符。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/API/Document
```

