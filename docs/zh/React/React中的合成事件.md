# React中的合成事件
`React`自己实现了一套高效的事件注册、存储、分发和重用逻辑，在`DOM`事件体系基础上做了很大改进，减少了内存消耗，简化了事件逻辑，并最大程度地解决了`IE`等浏览器的不兼容问题。

## 描述
`React`的合成事件`SyntheticEvent`实际上就是`React`自己在内部实现的一套事件处理机制，它是浏览器的原生事件的跨浏览器包装器，除兼容所有浏览器外，它还拥有和浏览器原生事件相同的接口，包括`stopPropagation()`和`preventDefault()`，合成事件与浏览器的原生事件不同，也不会直接映射到原生事件，也就是说通常不要使用`addEventListener`为已创建的`DOM`元素添加监听器，而应该直接使用`React`中定义的事件机制，而且在混用的情况下原生事件如果定义了阻止冒泡可能会阻止合成事件的执行，当然如果确实需要使用原生事件去处理需求，可以通过事件触发传递的`SyntheticEvent`对象的`nativeEvent`属性获得原生`Event`对象的引用，`React`中的事件有以下几个特点：
* `React`上注册的事件最终会绑定在`document`这个`DOM`上，而不是`React`组件对应的`DOM`，通过这种方式减少内存开销，所有的事件都绑定在`document`上，其他节点没有绑定事件，实际上就是事件委托的。
* `React`自身实现了一套事件冒泡机制，使用`React`实现的`Event`对象与原生`Event`对象不同，不能相互混用。
* `React`通过队列的形式，从触发的组件向父组件回溯，然后调用他们`JSX`中定义的`callback`。
* `React`的合成事件`SyntheticEvent`与浏览器的原生事件不同，也不会直接映射到原生事件。
* `React`通过对象池的形式管理合成事件对象的创建和销毁，减少了垃圾的生成和新对象内存的分配，提高了性能。

对于每个`SyntheticEvent`对象都包含以下属性：

```
boolean bubbles
boolean cancelable
DOMEventTarget currentTarget
boolean defaultPrevented
number eventPhase
boolean isTrusted
DOMEvent nativeEvent
void preventDefault()
boolean isDefaultPrevented()
void stopPropagation()
boolean isPropagationStopped()
void persist()
DOMEventTarget target
number timeStamp
string type
```

支持的合成事件一览，注意以下的事件处理函数在冒泡阶段被触发，如需注册捕获阶段的事件处理函数，则应为事件名添加`Capture`，例如处理捕获阶段的点击事件请使用`onClickCapture`，而不是`onClick`。

```
<!-- 剪贴板事件 -->
onCopy onCut onPaste

<!-- 复合事件 -->
onCompositionEnd onCompositionStart onCompositionUpdate

<!-- 键盘事件 -->
onKeyDown onKeyPress onKeyUp

<!-- 焦点事件 -->
onFocus onBlur

<!-- 表单事件 -->
onChange onInput onInvalid onReset onSubmit 

<!-- 通用事件 -->
onError onLoad

<!-- 鼠标事件 -->
onClick onContextMenu onDoubleClick onDrag onDragEnd onDragEnter onDragExit
onDragLeave onDragOver onDragStart onDrop onMouseDown onMouseEnter onMouseLeave
onMouseMove onMouseOut onMouseOver onMouseUp

<!-- 指针事件 -->
onPointerDown onPointerMove onPointerUp onPointerCancel onGotPointerCapture
onLostPointerCapture onPointerEnter onPointerLeave onPointerOver onPointerOut

<!-- 选择事件 -->
onSelect

<!-- 触摸事件 -->
onTouchCancel onTouchEnd onTouchMove onTouchStart

<!-- UI 事件 -->
onScroll

<!-- 滚轮事件 -->
onWheel

<!-- 媒体事件 -->
onAbort onCanPlay onCanPlayThrough onDurationChange onEmptied onEncrypted
onEnded onError onLoadedData onLoadedMetadata onLoadStart onPause onPlay
onPlaying onProgress onRateChange onSeeked onSeeking onStalled onSuspend
onTimeUpdate onVolumeChange onWaiting

<!-- 图像事件 -->
onLoad onError

<!-- 动画事件 -->
onAnimationStart onAnimationEnd onAnimationIteration

<!-- 过渡事件 -->
onTransitionEnd

<!-- 其他事件 -->
onToggle

<!-- https://zh-hans.reactjs.org/docs/events.html -->
```

### 示例
一个简单的示例，同时绑定在一个`DOM`上的原生事件与`React`事件，因为原生事件阻止冒泡而导致`React`事件无法执行，同时我们也可以看到`React`传递的`event`并不是原生`Event`对象的实例，而是`React`自行实现维护的一个`event`对象。
```
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />
    <title>React</title>
</head>

<body>
    <div id="root"></div>
</body>
<script src="https://unpkg.zhimg.com/react@17/umd/react.development.js"></script>
<script src="https://unpkg.zhimg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.zhimg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">

    class ReactEvent extends React.PureComponent {
        componentDidMount(){ 
            document.getElementById("btn-reactandnative").addEventListener("click", (e) => {
                console.log("原生事件执行", "handleNativeAndReact");
                console.log("event instanceof Event:", e instanceof Event);
                e.stopPropagation(); // 阻止冒泡即会影响了React的事件执行
            });
        }


        handleNativeAndReact = (e) => {
            console.log("React事件执行", "handleNativeAndReact");
            console.log("event instanceof Event:", e instanceof Event);
        }


        handleClick = (e) => {
            console.log("React事件执行", "handleClick");
            console.log("event instanceof Event:", e instanceof Event);
        }

      render() {
        return (
            <div className="pageIndex">
                <button id="btn-confirm" onClick={this.handleClick}>React 事件</button>
                <button id="btn-reactandnative" onClick={this.handleNativeAndReact}>原生 + React 事件</button>
            </div>
        )
      }
    }



    var vm = ReactDOM.render(
        <>
            <ReactEvent />
        </>,
        document.getElementById("root")
    );
</script>

</html>
```

## React事件系统
简单来说，在挂载的时候，通过`listenerBank`把事件存起来了，触发的时候`document`进行`dispatchEvent`，找到触发事件的最深的一个节点，向上遍历拿到所有的`callback`放在`eventQueue`，根据事件类型构建`event`对象，遍历执行`eventQueue`，不简单点说，我们可以查看一下`React`对于事件处理的源码实现，`commit id`为`4ab6305`，`TAG`是`React16.10.2`，在`React17`不再往`document`上挂事件委托，而是挂到`DOM`容器上，目录结构都有了很大更改，我们还是依照`React16`，首先来看一下事件的处理流程。


```
/**
 * Summary of `ReactBrowserEventEmitter` event handling:
 *
 *  - Top-level delegation is used to trap most native browser events. This
 *    may only occur in the main thread and is the responsibility of
 *    ReactDOMEventListener, which is injected and can therefore support
 *    pluggable event sources. This is the only work that occurs in the main
 *    thread.
 *
 *  - We normalize and de-duplicate events to account for browser quirks. This
 *    may be done in the worker thread.
 *
 *  - Forward these native events (with the associated top-level type used to
 *    trap it) to `EventPluginHub`, which in turn will ask plugins if they want
 *    to extract any synthetic events.
 *
 *  - The `EventPluginHub` will then process each event by annotating them with
 *    "dispatches", a sequence of listeners and IDs that care about that event.
 *
 *  - The `EventPluginHub` then dispatches the events.
 */
 
/**
 * React和事件系统概述:
 *
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 */
```
在`packages\react-dom\src\events\ReactBrowserEventEmitter.js`中就描述了上边的流程，并且还有相应的英文注释，使用`google`翻译一下，这个太概述了，所以还是需要详细描述一下，在事件处理之前，我们编写的`JSX`需要经过`babel`的编译，创建虚拟`DOM`，并处理组件`props`，拿到事件类型和回调`fn`等，之后便是事件注册、存储、合成、分发、执行阶段。
* `Top-level delegation`用于捕获最原始的浏览器事件，它主要由`ReactEventListener`负责，`ReactEventListener`被注入后可以支持插件化的事件源，这一过程发生在主线程。
* `React`对事件进行规范化和重复数据删除，以解决浏览器的问题，这可以在工作线程中完成。
* 将这些本地事件(具有关联的顶级类型用来捕获它)转发到`EventPluginHub`，后者将询问插件是否要提取任何合成事件。
* 然后`EventPluginHub`将通过为每个事件添加`dispatches`(引用该事件的侦听器和`ID`的序列)来对其进行注释来进行处理。
* 再接着，`EventPluginHub`会调度分派事件。

### 事件注册
首先会调用`setInitialDOMProperties()`判断是否在`registrationNameModules`列表中，在的话便注册事件，列表包含了可以注册的事件。

```javascript
// packages\react-dom\src\client\ReactDOMComponent.js line 308
function setInitialDOMProperties(
  tag: string,
  domElement: Element,
  rootContainerElement: Element | Document,
  nextProps: Object,
  isCustomComponentTag: boolean,
): void {
  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }
    const nextProp = nextProps[propKey];
    if (propKey === STYLE) {
      if (__DEV__) {
        if (nextProp) {
          // Freeze the next style object so that we can assume it won't be
          // mutated. We have already warned for this in the past.
          Object.freeze(nextProp);
        }
      }
      // Relies on `updateStylesByID` not mutating `styleUpdates`.
      setValueForStyles(domElement, nextProp);
    }else if(/* ... */){
        // ...
    } else if (registrationNameModules.hasOwnProperty(propKey)) { // 对事件名进行合法性检验，只有合法的事件名才会被识别并进行事件绑定
      if (nextProp != null) {
        if (__DEV__ && typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }
        ensureListeningTo(rootContainerElement, propKey); // 开始注册事件
      }
    } else if (nextProp != null) {
      setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag);
    }
  }
}
```
如果事件名合法而且是一个函数的时候，就会调用`ensureListeningTo()`方法注册事件。`ensureListeningTo`会判断`rootContainerElement`是否为`document`或是`Fragment`，如果是则直接传递给`listenTo`，如果不是则通过`ownerDocument`来获取其根节点，对于`ownerDocument`属性，定义是这样的，`ownerDocument`可返回某元素的根元素，在`HTML`中`HTML`文档本身是元素的根元素，所以可以说明其实大部分的事件都是注册在`document`上面的，之后便是调用`listenTo`方法实际注册。

```javascript
// packages\react-dom\src\client\ReactDOMComponent.js line 272
function ensureListeningTo(
  rootContainerElement: Element | Node,
  registrationName: string,
): void {
  const isDocumentOrFragment =
    rootContainerElement.nodeType === DOCUMENT_NODE ||
    rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE;
  const doc = isDocumentOrFragment
    ? rootContainerElement
    : rootContainerElement.ownerDocument;
  listenTo(registrationName, doc);
}
```

在`listenTo()`方法中比较重要的就是`registrationNameDependencies`的概念，对于不同的事件，`React`会同时绑定多个事件来达到统一的效果。此外`listenTo()`方法还默认将事件通过`trapBubbledEvent`绑定，将`onBlur`、`onFocus`、`onScroll`等事件通过`trapCapturedEvent`绑定，因为这些事件没有冒泡行为，`invalid`、`submit`、`reset`事件以及媒体等事件绑定到当前`DOM`上。

```javascript
// packages\react-dom\src\events\ReactBrowserEventEmitter.js line 128
export function listenTo(
  registrationName: string, // 事件的名称，即为上面的propKey(如onClick)
  mountAt: Document | Element | Node, // 事件注册的目标容器
): void {
  // 获取目标容器已经挂载的事件列表对象，如果没有则初始化为空对象
  const listeningSet = getListeningSetForElement(mountAt);
  // 获取对应事件的依赖事件，比如onChange会依赖TOP_INPUT、TOP_FOCUS等一系列事件
  const dependencies = registrationNameDependencies[registrationName];
    
   // 遍历所有的依赖，并挨个进行绑定
  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
    listenToTopLevel(dependency, mountAt, listeningSet);
  }
}

export function listenToTopLevel(
  topLevelType: DOMTopLevelEventType,
  mountAt: Document | Element | Node,
  listeningSet: Set<DOMTopLevelEventType | string>,
): void {
  if (!listeningSet.has(topLevelType)) {
    // 针对不同的事件来判断使用事件捕获还是事件冒泡
    switch (topLevelType) {
      case TOP_SCROLL:
        trapCapturedEvent(TOP_SCROLL, mountAt);
        break;
      case TOP_FOCUS:
      case TOP_BLUR:
        trapCapturedEvent(TOP_FOCUS, mountAt);
        trapCapturedEvent(TOP_BLUR, mountAt);
        // We set the flag for a single dependency later in this function,
        // but this ensures we mark both as attached rather than just one.
        listeningSet.add(TOP_BLUR);
        listeningSet.add(TOP_FOCUS);
        break;
      case TOP_CANCEL:
      case TOP_CLOSE:
        // getRawEventName会返回真实的事件名称，比如onChange => onchange
        if (isEventSupported(getRawEventName(topLevelType))) {
          trapCapturedEvent(topLevelType, mountAt);
        }
        break;
      case TOP_INVALID:
      case TOP_SUBMIT:
      case TOP_RESET:
        // We listen to them on the target DOM elements.
        // Some of them bubble so we don't want them to fire twice.
        break;
      default:
        // 默认将除了媒体事件之外的所有事件都注册冒泡事件
        // 因为媒体事件不会冒泡，所以注册冒泡事件毫无意义
        const isMediaEvent = mediaEventTypes.indexOf(topLevelType) !== -1;
        if (!isMediaEvent) {
          trapBubbledEvent(topLevelType, mountAt);
        }
        break;
    }
    // 表示目标容器已经注册了该事件
    listeningSet.add(topLevelType);
  }
}
```

之后就是熟知的对事件的绑定，以事件冒泡`trapBubbledEvent()`为例来描述处理流程，可以看到其调用了`trapEventForPluginEventSystem`方法。

```javascript
// packages\react-dom\src\events\ReactDOMEventListener.js line 203
export function trapBubbledEvent(
  topLevelType: DOMTopLevelEventType,
  element: Document | Element | Node,
): void {
  trapEventForPluginEventSystem(element, topLevelType, false);
}
```

可以看到`React`将事件分成了三类，优先级由低到高：
* `DiscreteEvent`离散事件，例如`blur`、`focus`、 `click`、 `submit`、 `touchStart`，这些事件都是离散触发的。
* `UserBlockingEvent`用户阻塞事件，例如`touchMove`、`mouseMove`、`scroll`、`drag`、`dragOver`等等，这些事件会阻塞用户的交互。
* `ContinuousEvent`连续事件，例如`load`、`error`、`loadStart`、`abort`、`animationEnd`，这个优先级最高，也就是说它们应该是立即同步执行的，这就是`Continuous`的意义，是持续地执行，不能被打断。

此外`React`将事件系统用到了`Fiber`架构里，`Fiber`中将任务分成了`5`大类，对应不同的优先级，那么三大类的事件系统和五大类的`Fiber`任务系统的对应关系如下。
* `Immediate`: 此类任务会同步执行，或者说马上执行且不能中断，`ContinuousEvent`便属于此类。
* `UserBlocking`: 此类任务一般是用户交互的结果，需要及时得到反馈，`DiscreteEvent`与`UserBlockingEvent`都属于此类。
* `Normal`: 此类任务是应对那些不需要立即感受到反馈的任务，比如网络请求。
* `Low`: 此类任务可以延后处理，但最终应该得到执行，例如分析通知。
* `Idle`: 此类任务的定义为没有必要做的任务。

回到`trapEventForPluginEventSystem`，实际上在这三类事件，他们最终都会有统一的触发函数`dispatchEvent`，只不过在`dispatch`之前会需要进行一些特殊的处理。

```javascript
// packages\react-dom\src\events\ReactDOMEventListener.js line 256
function trapEventForPluginEventSystem(
  element: Document | Element | Node,
  topLevelType: DOMTopLevelEventType,
  capture: boolean,
): void {
  let listener;
  switch (getEventPriority(topLevelType)) {
    case DiscreteEvent:
      listener = dispatchDiscreteEvent.bind(
        null,
        topLevelType,
        PLUGIN_EVENT_SYSTEM,
      );
      break;
    case UserBlockingEvent:
      listener = dispatchUserBlockingUpdate.bind(
        null,
        topLevelType,
        PLUGIN_EVENT_SYSTEM,
      );
      break;
    case ContinuousEvent:
    default:
      // 统一的分发函数 dispatchEvent
      listener = dispatchEvent.bind(null, topLevelType, PLUGIN_EVENT_SYSTEM);
      break;
  }

  const rawEventName = getRawEventName(topLevelType);
  if (capture) {
    // 注册捕获事件
    addEventCaptureListener(element, rawEventName, listener);
  } else {
    // 注册冒泡事件
    addEventBubbleListener(element, rawEventName, listener);
  }
}
```

到达最终的事件注册，实际上就是在`document`上注册了各种事件。

```javascript
// packages\react-dom\src\events\EventListener.js line 10
export function addEventBubbleListener(
  element: Document | Element | Node,
  eventType: string,
  listener: Function,
): void {
  element.addEventListener(eventType, listener, false);
}

export function addEventCaptureListener(
  element: Document | Element | Node,
  eventType: string,
  listener: Function,
): void {
  element.addEventListener(eventType, listener, true);
}

export function addEventCaptureListenerWithPassiveFlag(
  element: Document | Element | Node,
  eventType: string,
  listener: Function,
  passive: boolean,
): void {
  element.addEventListener(eventType, listener, {
    capture: true,
    passive,
  });
}
```

### 事件存储
让我们回到上边的`listenToTopLevel`方法中的`listeningSet.add(topLevelType)`，即是将事件添加到注册到事件列表对象中，即将`DOM`节点和对应的事件保存到`Weak Map`对象中，具体来说就是`DOM`节点作为键名，事件对象的`Set`作为键值，这里的数据集合有自己的名字叫做`EventPluginHub`，当然在这里最理想的情况会是使用`WeakMap`进行存储，不支持则使用`Map`对象，使用`WeakMap`主要是考虑到`WeakMaps`保持了对键名所引用的对象的弱引用，不用担心内存泄漏问题，`WeakMaps`应用的典型场合就是`DOM`节点作为键名。

```javascript
// packages\react-dom\src\events\ReactBrowserEventEmitter.js line 88
const PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
const elementListeningSets:
  | WeakMap
  | Map<
      Document | Element | Node,
      Set<DOMTopLevelEventType | string>,
    > = new PossiblyWeakMap();

export function getListeningSetForElement(
  element: Document | Element | Node,
): Set<DOMTopLevelEventType | string> {
  let listeningSet = elementListeningSets.get(element);
  if (listeningSet === undefined) {
    listeningSet = new Set();
    elementListeningSets.set(element, listeningSet);
  }
  return listeningSet;
}
```

### 事件合成
首先来看看`handleTopLevel`的逻辑，`handleTopLevel`主要是缓存祖先元素，避免事件触发后找不到祖先元素报错，接下来就进入`runExtractedPluginEventsInBatch`方法。

```javascript
// packages\react-dom\src\events\ReactDOMEventListener.js line 151
function handleTopLevel(bookKeeping: BookKeepingInstance) {
  let targetInst = bookKeeping.targetInst;

  // Loop through the hierarchy, in case there's any nested components.
  // It's important that we build the array of ancestors before calling any
  // event handlers, because event handlers can modify the DOM, leading to
  // inconsistencies with ReactMount's node cache. See #1105.
  let ancestor = targetInst;
  do {
    if (!ancestor) {
      const ancestors = bookKeeping.ancestors;
      ((ancestors: any): Array<Fiber | null>).push(ancestor);
      break;
    }
    const root = findRootContainerNode(ancestor);
    if (!root) {
      break;
    }
    const tag = ancestor.tag;
    if (tag === HostComponent || tag === HostText) {
      bookKeeping.ancestors.push(ancestor);
    }
    ancestor = getClosestInstanceFromNode(root);
  } while (ancestor);

  for (let i = 0; i < bookKeeping.ancestors.length; i++) {
    targetInst = bookKeeping.ancestors[i];
    const eventTarget = getEventTarget(bookKeeping.nativeEvent);
    const topLevelType = ((bookKeeping.topLevelType: any): DOMTopLevelEventType);
    const nativeEvent = ((bookKeeping.nativeEvent: any): AnyNativeEvent);

    runExtractedPluginEventsInBatch(
      topLevelType,
      targetInst,
      nativeEvent,
      eventTarget,
      bookKeeping.eventSystemFlags,
    );
  }
}
```

在`runExtractedPluginEventsInBatch`中`extractPluginEvents`用于通过不同的插件合成事件`events`，而`runEventsInBatch`则是完成事件的触发。

```javascript
// packages\legacy-events\EventPluginHub.js line 160
export function runExtractedPluginEventsInBatch(
  topLevelType: TopLevelType,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: EventTarget,
  eventSystemFlags: EventSystemFlags,
) {
  const events = extractPluginEvents(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
  );
  runEventsInBatch(events);
}
```

在`extractPluginEvents`中遍历所有插件的`extractEvents`方法合成事件，如果这个插件适合于这个`events`则返回它，否则返回`null`。默认的有`5`种插件`SimpleEventPlugin`、`EnterLeaveEventPlugin`、`ChangeEventPlugin`、`SelectEventPlugin`、`BeforeInputEventPlugin`。

```javascript
// packages\legacy-events\EventPluginHub.js line 133
function extractPluginEvents(
  topLevelType: TopLevelType,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: EventTarget,
  eventSystemFlags: EventSystemFlags,
): Array<ReactSyntheticEvent> | ReactSyntheticEvent | null {
  let events = null;
  for (let i = 0; i < plugins.length; i++) {
    // Not every plugin in the ordering may be loaded at runtime.
    const possiblePlugin: PluginModule<AnyNativeEvent> = plugins[i];
    if (possiblePlugin) {
      const extractedEvents = possiblePlugin.extractEvents(
        topLevelType,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags,
      );
      if (extractedEvents) {
        events = accumulateInto(events, extractedEvents);
      }
    }
  }
  return events;
}
```
不同的事件类型会有不同的合成事件基类，然后再通过`EventConstructor.getPooled`生成事件，`accumulateTwoPhaseDispatches`用于获取事件回调函数，最终调的是`getListener`方法。  
为了避免频繁创建和释放事件对象导致性能损耗(对象创建和垃圾回收)，`React`使用一个事件池来负责管理事件对象(在`React17`中不再使用事件池机制)，使用完的事件对象会放回池中，以备后续的复用，也就意味着事件处理器同步执行完后，`SyntheticEvent`属性就会马上被回收，不能访问了，也就是事件中的`e`不能用了，如果要用的话，可以通过一下两种方式：
* 使用`e.persist()`，告诉`React`不要回收对象池，在`React17`依旧可以调用只是没有实际作用。
* 使用`e. nativeEvent`，因为它是持久引用的。

### 事件分发
事件分发就是遍历找到当前元素及父元素所有绑定的事件，将所有的事件放到`event._dispachListeners`队列中，以备后续的执行。

```javascript
// packages\legacy-events\EventPropagators.js line 47
function accumulateDirectionalDispatches(inst, phase, event) {
  if (__DEV__) {
    warningWithoutStack(inst, 'Dispatching inst must not be null');
  }
  const listener = listenerAtPhase(inst, event, phase);
  if (listener) {
    // 将提取到的绑定添加到_dispatchListeners中
    event._dispatchListeners = accumulateInto(
      event._dispatchListeners,
      listener,
    );
    event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
  }
}
```

### 事件执行
执行事件队列用到的方法是`runEventsInBatch`，遍历执行`executeDispatchesInOrder`方法，通过`executeDispatch`执行调度，最终执行回调函数是通过`invokeGuardedCallbackAndCatchFirstError`方法。

```javascript
// packages\legacy-events\EventBatching.js line 42
export function runEventsInBatch(
  events: Array<ReactSyntheticEvent> | ReactSyntheticEvent | null,
) {
  if (events !== null) {
    eventQueue = accumulateInto(eventQueue, events);
  }

  // Set `eventQueue` to null before processing it so that we can tell if more
  // events get enqueued while processing.
  const processingEventQueue = eventQueue;
  eventQueue = null;

  if (!processingEventQueue) {
    return;
  }

  forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
  invariant(
    !eventQueue,
    'processEventQueue(): Additional events were enqueued while processing ' +
      'an event queue. Support for this has not yet been implemented.',
  );
  // This would be a good time to rethrow if any of the event handlers threw.
  rethrowCaughtError();
}

// packages\legacy-events\EventPluginUtils.js line 76
export function executeDispatchesInOrder(event) {
  const dispatchListeners = event._dispatchListeners;
  const dispatchInstances = event._dispatchInstances;
  if (__DEV__) {
    validateEventDispatches(event);
  }
  if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and Instances are two parallel arrays that are always in sync.
      executeDispatch(event, dispatchListeners[i], dispatchInstances[i]);
    }
  } else if (dispatchListeners) {
    executeDispatch(event, dispatchListeners, dispatchInstances);
  }
  event._dispatchListeners = null;
  event._dispatchInstances = null;
}

// packages\legacy-events\EventPluginUtils.js line 66
export function executeDispatch(event, listener, inst) {
  const type = event.type || 'unknown-event';
  event.currentTarget = getNodeFromInstance(inst);
  invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event);
  event.currentTarget = null;
}

// packages\shared\ReactErrorUtils.js line 67
export function invokeGuardedCallbackAndCatchFirstError<
  A,
  B,
  C,
  D,
  E,
  F,
  Context,
>(
  name: string | null,
  func: (a: A, b: B, c: C, d: D, e: E, f: F) => void,
  context: Context,
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
): void {
  invokeGuardedCallback.apply(this, arguments);
  if (hasError) {
    const error = clearCaughtError();
    if (!hasRethrowError) {
      hasRethrowError = true;
      rethrowError = error;
    }
  }
}
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/53961511
https://zhuanlan.zhihu.com/p/25883536
https://zhuanlan.zhihu.com/p/140791931
https://www.jianshu.com/p/8d8f9aa4b033
https://toutiao.io/posts/28of14w/preview
https://juejin.cn/post/6844903988794671117
https://segmentfault.com/a/1190000015142568
https://zh-hans.reactjs.org/docs/events.html
https://github.com/UNDERCOVERj/tech-blog/issues/13
https://blog.csdn.net/kyooo0/article/details/111829693
```

