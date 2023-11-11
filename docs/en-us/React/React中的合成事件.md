# Synthetic Events in React
`React` has implemented an efficient event registration, storage, distribution, and reuse system internally, making significant improvements to the `DOM` event system. This has resulted in reduced memory consumption, simplified event logic, and addressed compatibility issues with browsers such as `IE` to the greatest extent possible.

## Description
The synthetic event in `React` is actually a mechanism for event handling implemented internally by `React`. It serves as a cross-browser wrapper for native browser events. In addition to being compatible with all browsers, it also shares the same interface as native browser events, including `stopPropagation()` and `preventDefault()`. Synthetic events are different from native browser events and are not directly mapped to them. In other words, it is generally not recommended to use `addEventListener` to add listeners to already created `DOM` elements. Instead, it is recommended to use the event mechanism defined in `React`. In cases where native events are truly needed to address requirements, one can access the native `Event` object reference through the `nativeEvent` property of the `SyntheticEvent` object passed during event triggering.

Events in `React` have the following characteristics:
* Events registered on `React` are ultimately bound to the `document` `DOM` instead of the corresponding `DOM` of `React` components. This helps reduce memory overhead as all events are bound to the `document`, and other nodes do not have bound events, essentially implementing event delegation.
* `React` has implemented its own event bubbling mechanism. The event object implemented by `React` is different from the native `Event` object and cannot be mixed with it.
* `React` uses a queuing mechanism to traverse from the triggering component to the parent component and then call the `callbacks` defined in their `JSX`.
* Synthetic events in `React` are different from native browser events and are not directly mapped to native events.
* `React` manages the creation and destruction of synthetic event objects through an object pool, reducing garbage generation and new object memory allocation, thereby improving performance.

Each `SyntheticEvent` object contains the following properties:

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

List of supported synthetic events. Note that the following event handling functions are triggered during the bubbling phase. If you need to register event handling functions in the capture phase, you should append `Capture` to the event name. For example, to handle the capture phase of a click event, use `onClickCapture` instead of `onClick`.

```html
<!-- Clipboard Events -->
onCopy onCut onPaste

<!-- Composition Events -->
onCompositionEnd onCompositionStart onCompositionUpdate

<!-- Keyboard Events -->
onKeyDown onKeyPress onKeyUp

<!-- Focus Events -->
onFocus onBlur

<!-- Form Events -->
onChange onInput onInvalid onReset onSubmit

<!-- Generic Events -->
onError onLoad

<!-- Mouse Events -->
onClick onContextMenu onDoubleClick onDrag onDragEnd onDragEnter onDragExit
onDragLeave onDragOver onDragStart onDrop onMouseDown onMouseEnter onMouseLeave
onMouseMove onMouseOut onMouseOver onMouseUp

<!-- Pointer Events -->
onPointerDown onPointerMove onPointerUp onPointerCancel onGotPointerCapture
onLostPointerCapture onPointerEnter onPointerLeave onPointerOver onPointerOut

<!-- Selection Events -->
onSelect

<!-- Touch Events -->
onTouchCancel onTouchEnd onTouchMove onTouchStart

<!-- UI Events -->
onScroll

<!-- Wheel Events -->
onWheel

<!-- Media Events -->
onAbort onCanPlay onCanPlayThrough onDurationChange onEmptied onEncrypted
onEnded onError onLoadedData onLoadedMetadata onLoadStart onPause onPlay
onPlaying onProgress onRateChange onSeeked onSeeking onStalled onSuspend
onTimeUpdate onVolumeChange onWaiting

<!-- Image Events -->
onLoad onError

<!-- Animation Events -->
onAnimationStart onAnimationEnd onAnimationIteration

<!-- Transition Events -->
onTransitionEnd

<!-- Other Events -->
onToggle

<!-- https://reactjs.org/docs/events.html -->
```

### Example
A simple example that binds native events and React events on the same `DOM`. Because native events prevent bubbling, causing the React events to not execute, we can also see that the `event` passed by React is not an instance of the native `Event` object, but rather an `event` object maintained and implemented by React.

```html
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
                console.log("Native event executed", "handleNativeAndReact");
                console.log("event instanceof Event:", e instanceof Event);
                e.stopPropagation(); // Preventing propagation will affect the execution of React events
            });
        }


        handleNativeAndReact = (e) => {
            console.log("React event executed", "handleNativeAndReact");
            console.log("event instanceof Event:", e instanceof Event);
        }


        handleClick = (e) => {
            console.log("React event executed", "handleClick");
            console.log("event instanceof Event:", e instanceof Event);
        }

      render() {
        return (
            <div className="pageIndex">
                <button id="btn-confirm" onClick={this.handleClick}>React Event</button>
                <button id="btn-reactandnative" onClick={this.handleNativeAndReact}>Native + React Event</button>
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

## React Event System

Simply put, during mounting, events are stored in the `listenerBank`, and when triggered, the `document` performs a `dispatchEvent` to find the deepest node where the event was triggered. It then traverses upward to retrieve all the `callbacks` and places them in the `eventQueue`. An `event` object is constructed based on the event type, and then the `eventQueue` is traversed and executed. In simpler terms, we can take a look at the source code implementation of event handling in React. The commit ID is `4ab6305`, and the tag is `React16.10.2`. In `React 17`, events are no longer delegated to the `document`, but are instead attached to the `DOM` container, and the directory structure has undergone significant changes. However, for our present discussion, we will stick to `React16` and start by examining the event handling process.

```
/**
 * Summary of the event handling in `ReactBrowserEventEmitter`:
 *
 * - The top-level delegation is used to capture most native browser events. This
 *   operation is primarily handled by ReactDOMEventListener, which is injected
 *   and can therefore support pluggable event sources. This process takes place
 *   only in the main thread.
 *
 * - We normalize and remove duplicate events to address browser quirks. This
 *   can be done in the worker thread.
 *
 * - Forward these native events (along with the associated top-level type used
 *   to capture it) to `EventPluginHub`, which in turn will check with plugins if
 *   they want to extract any synthetic events.
 *
 * - The `EventPluginHub` then proceeds to process each event by annotating them
 *   with "dispatches", a sequence of listeners and IDs that are interested in
 *   that event.
 *
 * - Subsequently, the `EventPluginHub` dispatches the events.
 */

/**
 * Overview of React and the event system:
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

The described process is detailed in `packages\react-dom\src\events\ReactBrowserEventEmitter.js`, along with corresponding English comments. It's quite a high-level overview, so let's delve into the details. Prior to event handling, the JSX we write needs to go through Babel compilation, create a virtual DOM, and handle component props to obtain event types and callback functions. This is followed by the event registration, storage, synthesis, dispatch, and execution stages.

- `Top-level delegation` is used to capture the most primitive browser events, primarily handled by `ReactEventListener`. Once injected, `ReactEventListener` can support pluggable event sources, and this process takes place on the main thread.
- React normalizes events and removes duplicate data to address browser issues, a task that can be completed in the worker thread.
- These native events (along with the associated top-level type used to capture them) are then forwarded to `EventPluginHub`, which seeks input from plugins on whether to extract any synthetic events.
- Subsequently, `EventPluginHub` processes each event by annotating them with "dispatches", a sequence of listeners and IDs interested in that event.
- Finally, `EventPluginHub` dispatches the events.

### Event Registration
First, `setInitialDOMProperties()` is called to check if the `registrationNameModules` list contains the event to be registered. If it does, the event is registered. The list contains the events that can be registered.

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
    } else if (registrationNameModules.hasOwnProperty(propKey)) { // Validates the event name, only valid event names will be recognized and bound
      if (nextProp != null) {
        if (__DEV__ && typeof nextProp !== 'function') {
          warnForInvalidEventListener(propKey, nextProp);
        }
        ensureListeningTo(rootContainerElement, propKey); // Starts event registration
      }
    } else if (nextProp != null) {
      setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag);
    }
  }
}
```
If the event name is valid and is a function, `ensureListeningTo()` method is called to register the event. `ensureListeningTo` checks whether `rootContainerElement` is a `document` or a `Fragment`. If it is, it is directly passed to `listenTo`. If not, it retrieves its root node through the `ownerDocument`. The `ownerDocument` property is defined as follows: `ownerDocument` can return the root element of an element. In HTML, the HTML document itself is the root element of an element, so it can be said that most events are actually registered on the `document`. Then, the `listenTo` method is called to actually register the event.

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

The concept of `registrationNameDependencies` is crucial in the `listenTo()` method. For different events, `React` binds multiple events simultaneously to achieve a unified effect. In addition, the `listenTo()` method defaults to binding events through `trapBubbledEvent`, and binds events such as `onBlur`, `onFocus`, `onScroll` through `trapCapturedEvent` because these events do not bubble. Events like `invalid`, `submit`, `reset`, as well as media events, are bound to the current `DOM`.

```javascript
// packages\react-dom\src\events\ReactBrowserEventEmitter.js line 128
export function listenTo(
  registrationName: string, // Name of the event, i.e. the propKey above (e.g. onClick)
  mountAt: Document | Element | Node, // Target container for event registration
): void {
  // Get the set of events already mounted on the target container, initialize to an empty object if none
  const listeningSet = getListeningSetForElement(mountAt);
  // Get the dependent events for the corresponding event, e.g. onChange depends on a series of events like TOP_INPUT, TOP_FOCUS
  const dependencies = registrationNameDependencies[registrationName];
    
  // Iterate through all dependencies and bind each one
  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
    listenToTopLevel(dependency, mountAt, listeningSet);
  }
}
```

```javascript
explanation. Translate into English:

export function listenToTopLevel(
  topLevelType: DOMTopLevelEventType,
  mountAt: Document | Element | Node,
  listeningSet: Set<DOMTopLevelEventType | string>,
): void {
  if (!listeningSet.has(topLevelType)) {
    // Determine whether to use event capture or event bubbling for different events
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
        // getRawEventName returns the actual event name, such as onChange => onchange
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
        // By default, all events except media events are registered as bubbling events
        // Because media events do not bubble, registering bubbling events is meaningless
        const isMediaEvent = mediaEventTypes.indexOf(topLevelType) !== -1;
        if (!isMediaEvent) {
          trapBubbledEvent(topLevelType, mountAt);
        }
        break;
    }
    // Indicates that the target container has registered the event
    listeningSet.add(topLevelType);
  }
}
```

After that, it's the familiar event binding. Taking event bubbling `trapBubbledEvent()` as an example to describe the processing flow, you can see that it calls the `trapEventForPluginEventSystem` method.

```javascript
// packages\react-dom\src\events\ReactDOMEventListener.js line 203
export function trapBubbledEvent(
  topLevelType: DOMTopLevelEventType,
  element: Document | Element | Node,
): void {
  trapEventForPluginEventSystem(element, topLevelType, false);
}
```

It can be seen that `React` classifies events into three categories, from low to high priority:
* `DiscreteEvent` includes discrete events such as `blur`, `focus`, `click`, `submit`, `touchStart`, all of which are discretely triggered.
* `UserBlockingEvent` includes user-blocking events such as `touchMove`, `mouseMove`, `scroll`, `drag`, `dragOver`, etc., which will block user interaction.
* `ContinuousEvent` includes continuous events such as `load`, `error`, `loadStart`, `abort`, `animationEnd`. This priority is the highest, meaning they should be executed immediately and synchronously, which is the significance of being continuous and cannot be interrupted.


In addition, `React` uses the event system in the `Fiber` architecture, where tasks are divided into 5 categories with different priorities. Here is the correspondence between the three categories of event systems and the five categories of `Fiber` task systems.

- `Immediate`: This type of task is executed synchronously, or immediately and cannot be interrupted. `ContinuousEvent` falls into this category.
- `UserBlocking`: This type of task is usually the result of user interaction and requires prompt feedback. Both `DiscreteEvent` and `UserBlockingEvent` belong to this category.
- `Normal`: This type of task is for handling those that do not require immediate feedback, such as network requests.
- `Low`: This type of task can be deferred, but should eventually be executed, for example, analytic notifications.
- `Idle`: This type of task is defined as unnecessary.

Returning to `trapEventForPluginEventSystem`, for these three types of events, they will all ultimately have a unified triggering function `dispatchEvent`, but special processing is required before dispatching.

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
      // Unified dispatch function dispatchEvent
      listener = dispatchEvent.bind(null, topLevelType, PLUGIN_EVENT_SYSTEM);
      break;
  }

  const rawEventName = getRawEventName(topLevelType);
  if (capture) {
    // Register capture event
    addEventCaptureListener(element, rawEventName, listener);
  } else {
    // Register bubbling event
    addEventBubbleListener(element, rawEventName, listener);
  }
}
```

At the final event registration, various events are essentially registered on the `document`.

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

### Event storage
Let's go back to the `listenToTopLevel` method mentioned above, where `listeningSet.add(topLevelType)` is used to add events to the list of registered events, that is, to save the `DOM` node and its corresponding event to a `Weak Map` object. Specifically, the `DOM` node is used as the key, and the event object's `Set` is used as the value. This data collection has its own name called `EventPluginHub`. Ideally, the most ideal situation here would be to use `WeakMap` for storage, and if not supported, use a `Map` object. The use of `WeakMap` is mainly considered because `WeakMaps` maintain a weak reference to the object referenced by the key, so there are no worries about memory leaks. A typical scenario for using `WeakMaps` is when `DOM` nodes are used as keys.

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

### Event synthesis
First, let's look at the logic of `handleTopLevel`. The main purpose of `handleTopLevel` is to cache ancestor elements to prevent errors from occurring when the event is triggered and the ancestor element cannot be found. Next, we enter the `runExtractedPluginEventsInBatch` method.

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
```

```javascript
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

In `runExtractedPluginEventsInBatch`, `extractPluginEvents` is used to synthesize events through different plugins, while `runEventsInBatch` triggers the events.

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

In `extractPluginEvents`, the `extractEvents` method of all plugins is traversed to synthesize events, and if the plugin is suitable for these `events`, it returns it, otherwise it returns `null`. There are default `5` types of plugins: `SimpleEventPlugin`, `EnterLeaveEventPlugin`, `ChangeEventPlugin`, `SelectEventPlugin`, `BeforeInputEventPlugin`.


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
Different event types will have different synthetic event base classes, and then events are generated using `EventConstructor.getPooled`, `accumulateTwoPhaseDispatches` is used to obtain event callback functions, ultimately calling the `getListener` method.
To avoid performance loss caused by frequent creation and release of event objects (object creation and garbage collection), `React` uses an event pool to manage event objects (no longer using event pooling mechanism in `React17`). The used event objects will be put back into the pool for reuse, meaning that once the event handler has synchronously executed, the `SyntheticEvent` properties will be immediately recycled and cannot be accessed. In other words, the `e` in the event cannot be used. If it needs to be used, it can be accessed in the following two ways:
* Use `e.persist()` to tell `React` not to recycle the object pool. This can still be called in `React17`, but has no actual effect.
* Use `e.nativeEvent` because it is a persistent reference.

### Event Dispatch
Event dispatch involves traversing to find all events bound to the current element and its parent elements and placing all events in the `event._dispatchListeners` queue for subsequent execution.

```javascript
// packages\legacy-events\EventPropagators.js line 47
function accumulateDirectionalDispatches(inst, phase, event) {
  if (__DEV__) {
    warningWithoutStack(inst, 'Dispatching inst must not be null');
  }
  const listener = listenerAtPhase(inst, event, phase);
  if (listener) {
    // Add the extracted bindings to _dispatchListeners
    event._dispatchListeners = accumulateInto(
      event._dispatchListeners,
      listener,
    );
    event._dispatchInstances = accumulateInto(event._dispatchInstances, inst);
  }
}
```

### Event Execution
The method used to execute the event queue is `runEventsInBatch`, it traverses and executes the `executeDispatchesInOrder` method, and executes the scheduling through `executeDispatch`, ultimately invoking the callback function using the `invokeGuardedCallbackAndCatchFirstError` method.

```javascript
// packages\legacy-events\EventBatching.js line 42
export function runEventsInBatch(
  events: Array<ReactSyntheticEvent> | ReactSyntheticEvent | null,
) {
  if (events !== null) {
    eventQueue = accumulateInto(eventQueue, events);
  }
```

```javascript
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


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

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