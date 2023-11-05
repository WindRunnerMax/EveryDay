# Event对象
`Event`对象表示在`DOM`中出现的事件，在`DOM`中有许多不同类型的事件，其主要使用基于`Event`对象作为主接口的二次接口，`Event`对象本身包含适用于所有事件的属性和方法。

## 描述
事件有很多类型，一些事件是由用户触发的，例如鼠标或键盘事件，而其他事件常由`API`生成，例如指示动画已经完成运行的事件，视频已被暂停等等，事件也可以通过脚本代码触发，例如对元素调用`HTMLElement.click()`方法，或者定义一些自定义事件，再使用`EventTarget.dispatchEvent()`方法将自定义事件派发往指定的目标`target`。  
一个元素可以绑定多个事件处理函数，甚至是同一种类型的事件，尤其是这种分离的，并且相互独立的代码模块对同一个元素绑定事件处理函数，每一个模块代码都有着独立的目的。通过`EventTarget.addEventListener()`方法可以将事件处理函数绑定到不同的`HTML elements`上。这种绑定事件处理函数的方式基本替换了老版本中使用`HTML event handler attributes`即`DOM0`级事件来绑定事件处理函数的方式，除此之外通过使用`removeEventListener()`方法，这些事件处理函数也能被移除。  
当有很多嵌套的元素，并且每一个元素都有着自己的事件处理函数，事件处理过程会变得非常复杂，尤其当一个父元素和子元素绑定有相同类型的事件处理函数的时候，因为结构上的重叠，事件处理函数可能会依次被触发，触发的顺序取决于事件冒泡和事件捕获在每一个元素上的设置情况。  
下面是主要基于`Event`接口的接口列表，需要注意的是，所有的事件接口名称都是以`Event`结尾的。

* `AnimationEvent`
* `AudioProcessingEvent`
* `BeforeInputEvent`
* `BeforeUnloadEvent`
* `BlobEvent`
* `ClipboardEvent`
* `CloseEvent`
* `CompositionEvent`
* `CSSFontFaceLoadEvent`
* `CustomEvent`
* `DeviceLightEvent`
* `DeviceMotionEvent`
* `DeviceOrientationEvent`
* `DeviceProximityEvent`
* `DOMTransactionEvent`
* `DragEvent`
* `EditingBeforeInputEvent`
* `ErrorEvent`
* `FetchEvent`
* `FocusEvent`
* `GamepadEvent`
* `HashChangeEvent`
* `IDBVersionChangeEvent`
* `InputEvent`
* `KeyboardEvent`
* `MediaStreamEvent`
* `MessageEvent`
* `MouseEvent`
* `MutationEvent`
* `OfflineAudioCompletionEvent`
* `OverconstrainedError`
* `PageTransitionEvent`
* `PaymentRequestUpdateEvent`
* `PointerEvent`
* `PopStateEvent`
* `ProgressEvent`
* `RelatedEvent`
* `RTCDataChannelEvent`
* `RTCIdentityErrorEvent`
* `RTCIdentityEvent`
* `RTCPeerConnectionIceEvent`
* `SensorEvent`
* `StorageEvent`
* `SVGEvent`
* `SVGZoomEvent`
* `TimeEvent`
* `TouchEvent`
* `TrackEvent`
* `TransitionEvent`
* `UIEvent`
* `UserProximityEvent`
* `WebGLContextEvent`
* `WheelEvent`

## 属性
* `Event.prototype.bubbles`: 只读，返回一个布尔值，用来表示该事件是否会在`DOM`中冒泡。
* `Event.prototype.cancelBubble`: `Event.prototype.stopPropagation()`的历史别名，在事件处理器函数返回之前，将此属性的值设置为`true`，亦可阻止事件继续冒泡。
* `Event.prototype.cancelable`: 只读，返回一个布尔值，表示事件是否可以取消。
* `Event.prototype.composed`: 只读，返回一个布尔值，表示事件是否可以穿过`Shadow DOM`和常规`DOM`之间的隔阂进行冒泡。
* `Event.prototype.currentTarget`: 只读，对事件当前注册的目标的引用。这是一个当前计划将事件发送到的对象，它是有可能在重定向的过程中被改变的。
* `Event.prototype.deepPath`: 一个由事件流所经过的`DOM`节点组成的数组。
* `Event.prototype.defaultPrevented`: 只读，返回一个布尔值，表示`event.preventDefault()`方法是否取消了事件的默认行为。
* `Event.prototype.eventPhase`: 只读，表示事件流正被处理到了哪个阶段。
* `Event.prototype.explicitOriginalTarget`: 只读，事件的明确`explicit`原始目标，`Mozilla`专有属性。
* `Event.prototype.originalTarget`: 只读，重设目标前的事件原始目标，`Mozilla`专有属性。
* `Event.prototype.returnValue`: 旧版`Internet Explorer`引入的一个非标准历史属性，为保证依赖此属性的网页正常运作，此属性最终被收入规范，可用`Event.prototype.preventDefault()`与`event.defaultPrevented`代替，但由于已进入规范，也可以使用此属性。
* `Event.prototype.srcElement`: 旧版`Internet Explorer`对`event.target`的非标准别称，出于兼容原因，一些其他浏览器也支持此别称。
* `Event.prototype.target`: 只读，对事件原始目标的引用，这里的原始目标指最初派发`dispatch`事件时指定的目标。
* `Event.prototype.timeStamp`: 只读，事件创建时的时间戳，精度为毫秒，按照规范这个时间戳是`Unix`纪元起经过的毫秒数，但实际上在不同的浏览器中，对此时间戳的定义也有所不同，另外规范正在将其修改为`DOMHighResTimeStamp`。
* `Event.prototype.type`: 只读，返回事件的类型，不区分大小写。
* `Event.prototype.isTrusted`: 只读，表示事件是由浏览器(例如用户点击)发起的，还是由脚本(使用事件创建方法例如`event.initEvent`发出的。

## 方法
* `document.captureEvents()`: 创建一个新事件，如果使用此方法创建事件，则必须调用其自身的`initEvent()`方法，对其进行初始化。
* `Event.prototype.composedPath()`: 返回事件的路径(将在该对象上调用监听器)，如果阴影根节点`shadow root`创建时`ShadowRoot.mode`值为`closed`，那么路径不会包括该根节点下阴影树`shadow tree`的节点。
* `Event.prototype.initEvent()`: 为通过`createEvent()`创建的事件初始化，该方法对已经被派发的事件无效。
* `Event.prototype.preventDefault()`: 如果该默认事件可取消，则取消默认事件。
* `Event.prototype.stopImmediatePropagation()`: 如果多个事件监听器被附加到相同元素的相同事件类型上，当此事件触发时，它们会按其被添加的顺序被调用，如果在其中一个事件监听器中执行`stopImmediatePropagation()`，那么剩下的事件监听器都不会被调用。
* `Event.prototype.stopPropagation`: 停止冒泡，阻止事件在`DOM`中继续冒泡。


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/API/Event
```