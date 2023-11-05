# Window对象
`window`作为全局变量，代表了脚本正在运行的窗口，将属性与方法暴露给`JavaScript`。

## Window对象属性
* `closed`: 表示所引用的窗口是否关闭。
* `console`: 提供了向浏览器控制台输出日志信息的方法。
* `crypto`: 此对象允许网页访问某些加密相关服务。
* `customElements`: 可用于注册新的`custom elements`，或者获取之前定义过的自定义元素的信息。
* `devicePixelRatio`: 返回当前显示设备的物理像素分辨率与`CSS`像素分辨率的比值。
* `document`: 返回指向`document`对象的引用。
* `frameElement`: 返回嵌入当前`window`对象的元素，如`<iframe>`或`<object>`，如果当前`window`对象已经是顶层窗口,则返回`null`。
* `frames`: 返回一个类数组对象，列出了当前窗口的所有直接子窗口。
* `fullScreen`: 这个属性表明了窗口是否处于全屏模式下。
* `history`: 提供了操作浏览器会话历史的接口。
* `indexedDB`: 集成了为应用程序提供异步访问索引数据库的功能的机制。
* `innerHeight`: 返回窗口的文档显示区的高度。
* `innerWidth`: 返回窗口的文档显示区的宽度。
* `length`: 设置或返回窗口中的框架`<iframe>`数量。
* `localStorage`: 提供长期本地存储接口。
* `location`: 包含有关文档当前位置的信息。
* `locationbar`: 返回一个可以检查`visibility`属性的`locationbar`对象。
* `name`: 设置或返回窗口的名称。
* `navigator`: 用于请求运行当前代码的应用程序的相关信息。
* `opener`: 返回对创建此窗口的窗口的引用。
* `outerHeight`: 返回窗口的外部高度，包含工具条与滚动条。
* `outerWidth`: 返回窗口的外部宽度，包含工具条与滚动条。
* `pageXOffset`: 设置或返回当前页面相对于窗口显示区左上角的`X`位置。
* `pageYOffset`: 设置或返回当前页面相对于窗口显示区左上角的`Y`位置。
* `parent`: 返回当前窗口的父窗口对象，如果没有父窗口，则返回自身的引用。
* `performance`: 允许网页访问某些函数来测量网页和`Web`应用程序的性能。
* `screen`: 返回当前渲染窗口中和屏幕有关的属性。
* `screenLeft`: 返回相对于屏幕窗口的`X`坐标
* `screenTop`: 返回相对于屏幕窗口的`Y`坐标
* `screenX`: 返回相对于屏幕窗口的`X`坐标
* `screenY`: 返回相对于屏幕窗口的`Y`坐标
* `sessionStorage`: 提供当前会话有效期的本地存储接口。
* `self`: 返回对当前窗口的引用。
* `status`: 设置窗口状态栏的文本。
* `top`: 返回窗口层级最顶层窗口的引用。

## Window对象方法
* `alert()`: 显示一个警告对话框，上面显示有指定的文本内容以及一个确定按钮。
* `atob()`: 解码一个`Base64`编码的字符串。
* `btoa()`: 创建一个`Base64`编码的字符串。
* `blur()`: 把键盘焦点从顶层窗口移开。
* `clearInterval()`: 取消由`setInterval()`设置的`timeout`。
* `clearTimeout()`: 取消由`setTimeout()`方法设置的`timeout`。
* `close()`: 关闭当前窗口或某个指定的窗口。
* `confirm()`: 显示带有一段消息以及确认按钮和取消按钮的对话框。
* `focus()`: 把焦点给予一个窗口。
* `getComputedStyle()`: 获取指定元素的`CSS`样式。
* `matchMedia()`: 返回指定的媒体查询字符串解析后的结果对象。
* `moveBy()`: 根据指定的值，移动`open`创建的窗口。
* `moveTo()`: 把`open`创建的窗口的左上角移动到一个指定的坐标。
* `open()`: 打开一个新的浏览器窗口或查找一个已命名的窗口。
* `postMessage()`: 可以安全地实现跨源通信。
* `print()`: 打印当前窗口的内容。
* `prompt()`: 显示可提示用户输入的对话框。
* `requestAnimationFrame()`: 提供匹配屏幕刷新率的动画帧绘制方法。
* `queueMicrotask()`: 提供加入微任务队列的回调接口。
* `resizeBy()`: 按照指定的像素调整`open`创建的窗口的大小。
* `resizeTo()`: 把`open`创建的窗口的大小调整到指定的宽度和高度。
* `scroll()`: 滚动窗口至文档中的特定位置。
* `scrollBy()`: 在窗口中按指定的偏移量滚动文档。
* `scrollTo()`: 把内容滚动到指定的坐标。
* `setInterval()`: 按照指定的周期来调用函数或计算表达式。
* `setTimeout()`: 在指定的毫秒数后调用函数或计算表达式。
* `stop()`: 停止页面载入，相当于点击了浏览器的停止按钮。

## Window对象事件
### 加载相关
* `onbeforeunload`: 该事件在即将离开页面（刷新或关闭）时触发。
* `onload`: 文档加载完成后触发。
* `onunload`: 当窗口卸载其内容和资源时触发。
* `onerror`: 当发生`JavaScript`运行时错误与资源加载失败时触发。
* `onabort`: 发送到`window`的中止`abort`事件的事件处理程序，不适用于`Firefox 2`或`Safari`。

### 窗口相关
* `onblur`: 窗口失去焦点时触发。
* `onfocus`: 窗口获得焦点时触发。
* `onresize`: 窗口大小发生改变时触发。
* `onscroll`: 窗口发生滚动时触发。
* `onmessage`: 窗口对象接收消息事件时触发。
* `onchange`: 窗口内表单元素的内容改变时触发。
* `oninput`: 窗口内表单元素获取用户输入时触发。
* `onreset`: 窗口内表单重置时触发。
* `onselect`: 窗口内表单元素中文本被选中时触发。
* `onsubmit`: 窗口内表单中`submit`按钮被按下触发。
* `onhashchange`: 当窗口的锚点哈希值发生变化时触发。

### 鼠标相关
* `onclick`: 当点击页面时触发。
* `onmouseup`: 鼠标按键被松开时触发。
* `ondblclick`: 当双击页面时调用事件句柄。
* `oncontextmenu`: 在点击鼠标右键打开上下文菜单时触发。
* `onmousedown`: 鼠标按钮被按下时触发。
* `onmousemove`: 当移动鼠标时触发。
* `onmouseout`: 鼠标移出窗口时触发。
* `onmouseover`: 鼠标移动到窗口时触发。
* `onauxclick`: 指示在输入设备上按下非主按钮时触发，例如鼠标中键。

### 键盘相关
* `onkeydown`: 某个键盘按键被按下时触发。
* `onkeyup`: 某个键盘按键被松开后触发。
* `onkeypress`: 某个键盘按键被按下并松开后触发。

### 动画相关
* `onanimationcancel`: 当`CSS`动画意外中止时，即在任何时候它停止运行而不发送`animationend`事件时将发送此事件，例如当`animation-name`被改变，动画被删除等
* `onanimationend`: 当`CSS`动画到达其活动周期的末尾时，按照`(animation-duration*animation-iteration-count) + animation-delay`进行计算，将发送此事件。
* `onanimationiteration`: 此事件将会在`CSS`动画到达每次迭代结束时触发，当通过执行最后一个动画步骤完成对动画指令序列的单次传递完成时，迭代结束。

### 设备相关
* `ondevicemotion`: 设备状态发生改变时触发
* `ondeviceorientation`: 设备相对方向发生改变时触发
* `ondeviceproximity`: 当设备传感器检测到物体变得更接近或更远离设备时触发。

### 打印相关
* `onbeforeprint`:  该事件在页面即将开始打印时触发
* `onafterprint`: 该事件在页面已经开始打印或者打印窗口已经关闭时触发。

### 应用相关
* `onappinstalled`: 一旦将`Web`应用程序成功安装为渐进式`Web`应用程序，该事件就会被分派。
* `onbeforeinstallprompt`: 当用户即将被提示安装`web`应用程序时，该处理程序将在设备上调度，其相关联的事件可以保存以供稍后用于在更适合的时间提示用户。 


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```


## 参考

```
https://www.runoob.com/jsref/obj-window.html
https://developer.mozilla.org/zh-CN/docs/Web/API/Window
```
