# Principle of Vue Event Binding
In `Vue`, events are bound to elements through the `v-on` directive or its shorthand syntax `@`, and event modifiers are provided. The basic process involves compiling the template to generate an `AST`, creating a `render` function, executing it to obtain a `VNode`, and then using the `addEventListener` method to bind the event when the `VNode` generates a real `DOM` node or component.

## Description
`v-on` and `@` are used to bind event listeners, where the event type is specified by a parameter. The expression can be a method name or an inline statement. If there are no modifiers, they can be omitted. When used on regular elements, only native `DOM` events can be monitored. When used on custom element components, they can also listen for custom events triggered by child components. When listening for native `DOM` events, the method takes the event as the unique parameter. In the case of using an inline statement, the statement can access a `$event` property: `v-on:click="handle('param', $event)"`. Starting from `2.4.0`, `v-on` also supports binding an event or listener key-value pair without parameters. Note that when using the object syntax, no modifiers are supported.

### Modifiers
* `.stop`: Calls `event.stopPropagation()`, which prevents event propagation.
* `.prevent`: Calls `event.preventDefault()`, which prevents the default event.
* `.capture`: Uses the `capture` mode when adding an event listener, i.e., handling events using the capture mode.
* `.self`: Triggers the callback only when the event is triggered from the element to which the listener is bound.
* `.{keyCode | keyAlias}`: Triggers the callback only when the event is triggered from a specific key.
* `.native`: Listens for native events of the component's root element, i.e., registers native events of the component's root element rather than custom events.
* `.once`: Triggers the callback only once.
* `.left(2.2.0)`: Triggers the callback only when the left mouse button is clicked.
* `.right(2.2.0)`: Triggers the callback only when the right mouse button is clicked.
* `.middle(2.2.0)`: Triggers the callback only when the middle mouse button is clicked.
* `.passive(2.3.0)`: Adds a listener in `{ passive: true }` mode, indicating that the listener will never call `preventDefault()`.

### Regular Elements
```html
<!-- Method handler -->
<button v-on:click="doThis"></button>

<!-- Dynamic event (2.6.0+) -->
<button v-on:[event]="doThis"></button>

<!-- Inline statement -->
<button v-on:click="doThat('param', $event)"></button>

<!-- Shorthand -->
<button @click="doThis"></button>

<!-- Dynamic event shorthand (2.6.0+) -->
<button @[event]="doThis"></button>

<!-- Stop event propagation -->
<button @click.stop="doThis"></button>

<!-- Prevent default behavior -->
<button @click.prevent="doThis"></button>

<!-- Prevent default behavior without expression -->
<form @submit.prevent></form>

<!-- Chained modifiers -->
<button @click.stop.prevent="doThis"></button>

<!-- Key modifiers with key aliases -->
<input @keyup.enter="onEnter">

<!-- Key modifiers with key codes -->
<input @keyup.13="onEnter">

<!-- Click callback triggers only once -->
<button v-on:click.once="doThis"></button>

<!-- Object syntax (2.4.0+) -->
<button v-on="{ mousedown: doThis, mouseup: doThat }"></button>
```

### Component Elements
```html
<!-- Custom event -->
<my-component @my-event="handleThis"></my-component>

<!-- Inline statement -->
<my-component @my-event="handleThis('param', $event)"></my-component>

<!-- Native event in component -->
<my-component @click.native="onClick"></my-component>
```

## Analysis
The implementation of `Vue` source code is quite complex, dealing with various compatibility issues, exceptions, and conditional branches. This article analyzes the core part of the code after simplification, with important parts annotated. The commit ID is `ef56410`.

### Compilation Phase
Before mounting the instance, `Vue` performs a considerable amount of work to compile the template, parse it into an `AST` tree, and then convert it into a `render` function. During the compilation phase, event directives are collected and processed.


```javascript
// dev/src/compiler/parser/index.js line 23
export const onRE = /^@|^v-on:/
export const dirRE = process.env.VBIND_PROP_SHORTHAND
  ? /^v-|^@|^:|^\.|^#/
  : /^v-|^@|^:|^#/
// ...
const dynamicArgRE = /^\[.*\]$/
// ...
export const bindRE = /^:|^\.|^v-bind:/
  
// dev/src/compiler/parser/index.js line 757
function processAttrs (el) {
  const list = el.attrsList
  let i, l, name, rawName, value, modifiers, syncGen, isDynamic
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name
    value = list[i].value
    if (dirRE.test(name)) { // Matching directive properties
      // mark element as dynamic
      el.hasBindings = true
      // modifiers
      modifiers = parseModifiers(name.replace(dirRE, '')) // Parsing modifiers
      // support .foo shorthand syntax for the .prop modifier
      if (process.env.VBIND_PROP_SHORTHAND && propBindRE.test(name)) {
        (modifiers || (modifiers = {})).prop = true
        name = `.` + name.slice(1).replace(modifierRE, '')
      } else if (modifiers) {
        name = name.replace(modifierRE, '')
      }
      if (bindRE.test(name)) { // v-bind handling
        // ...
      } else if (onRE.test(name)) { // v-on handling
        name = name.replace(onRE, '') // Matching event name
        isDynamic = dynamicArgRE.test(name) // Dynamic event binding
        if (isDynamic) { // If it's a dynamic event
          name = name.slice(1, -1) // Remove the []
        }
        addHandler(el, name, value, modifiers, false, warn, list[i], isDynamic) // Handling event collection
      } else { // normal directives handling
        // ...
      }
    } else {
      // literal attribute handling
      // ...
    }
  }
}
```

With the `addHandler` method, event-related properties are added to the `AST` tree, and event modifiers are processed.

```javascript
// dev/src/compiler/helpers.js line 69
export function addHandler (
  el: ASTElement,
  name: string,
  value: string,
  modifiers: ?ASTModifiers,
  important?: boolean,
  warn?: ?Function,
  range?: Range,
  dynamic?: boolean
) {
  modifiers = modifiers || emptyObject
  // The passive and prevent modifiers cannot be used together, it is determined by the nature of passive mode
  // For details, please refer to https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  // warn prevent and passive modifier
  /* istanbul ignore if */
  if (
    process.env.NODE_ENV !== 'production' && warn &&
    modifiers.prevent && modifiers.passive
  ) {
    warn(
      'passive and prevent can\'t be used together. ' +
      'Passive handler can\'t prevent default event.',
      range
    )
  }
  // Normalize click.right and click.middle, as they don't actually fire
  // This is technically browser-specific, but at least for now browsers are
  // the only target envs that have right/middle clicks.
  if (modifiers.right) { // Normalize the right-click of the mouse, right-click defaults to the contextmenu event
    if (dynamic) { // If it's a dynamic event
      name = `(${name})==='click'?'contextmenu':(${name})` // Dynamically determine the event name
    } else if (name === 'click') { // If it's not a dynamic event and it's a right-click of the mouse
      name = 'contextmenu' // Then replace it with the contextmenu event directly
      delete modifiers.right // Delete the right attribute of modifiers
    }
  } else if (modifiers.middle) { // Similarly, normalize the event of clicking the mouse middle button
    if (dynamic) { // if it's a dynamic event
      name = `(${name})==='click'?'mouseup':(${name})` // Dynamically determine the event name
    } else if (name === 'click') { // if it's not a dynamic event and it's a click with the mouse middle button
      name = 'mouseup' // handle it as a mouseup event
    }
  }
  // The following is the handling of the capture, once, and passive mode modifiers, mainly adding the !, ~, and & markers to the event
  // These markers can be found in the official Vue documentation
  // https://vuejs.org/v2/guide/render-function.html#event-and-key-modifiers
  // check capture modifier
  if (modifiers.capture) {
    delete modifiers.capture
    name = prependModifierMarker('!', name, dynamic)
  }
  if (modifiers.once) {
    delete modifiers.once
    name = prependModifierMarker('~', name, dynamic)
  }
  /* istanbul ignore if */
  if (modifiers.passive) {
    delete modifiers.passive
    name = prependModifierMarker('&', name, dynamic)
  }
  
  // events to record the bound events
  let events
  if (modifiers.native) { // If it is to trigger native events of the root element, directly get nativeEvents
    delete modifiers.native
    events = el.nativeEvents || (el.nativeEvents = {})
  } else { // Otherwise, get events
    events = el.events || (el.events = {})
  }
    
  // Set the event handling function as the handler
  const newHandler: any = rangeSetItem({ value: value.trim(), dynamic }, range)
  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers
  }
```

```javascript
// The bound event can be multiple, and the callback can be multiple, and eventually will be merged into an array
const handlers = events[name]
/* istanbul ignore if */
if (Array.isArray(handlers)) {
  important ? handlers.unshift(newHandler) : handlers.push(newHandler)
} else if (handlers) {
  events[name] = important ? [newHandler, handlers] : [handlers, newHandler]
} else {
  events[name] = newHandler
}

el.plain = false
```

### Code Generation
Next, we need to convert the `AST` syntax tree to the `render` function. In this process, event handling will be added. Firstly, the module exports the `generate` function, which will return the `render` string. Before this, the `genElement` function will be called, and at the end of the `addHandler` method processing mentioned above, `el.plain = false` is executed. This way, the `genElement` function will call the `genData` function, and the `genData` function will call the `genHandlers` function.

```javascript
// dev/src/compiler/codegen/index.js line 42
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  const state = new CodegenState(options)
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`, // the render string
    staticRenderFns: state.staticRenderFns
  }
}

// dev/src/compiler/codegen/index.js line 55
export function genElement (el: ASTElement, state: CodegenState): string {
    // ...
    let code
    if (el.component) {
      code = genComponent(el.component, el, state)
    } else {
      let data
      if (!el.plain || (el.pre && state.maybeComponent(el))) {
        data = genData(el, state)
      }

      const children = el.inlineTemplate ? null : genChildren(el, state, true)
      code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`
    }
    // ...
}

// dev/src/compiler/codegen/index.js line 219
export function genData (el: ASTElement, state: CodegenState): string {
  let data = '{'
  // ...
  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events, false)},`
  }
  if (el.nativeEvents) {
    data += `${genHandlers(el.nativeEvents, true)},`
  }
  // ...
  data = data.replace(/,$/, '') + '}'
  // ...
  return data
}

// dev/src/compiler/to-function.js line 12 
function createFunction (code, errors) {
  try {
    return new Function(code) // Convert the render string to a render function
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
}
```

You can see that both handling normal element events and native events of the component's root element will call the `genHandlers` function. The `genHandlers` function will traverse the parsed `AST` tree's event attributes, obtain the `event` object properties, and concatenate them into a string based on the properties of the event object.

```javascript
// dev/src/compiler/codegen/events.js line 3
const fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/
const fnInvokeRE = /\([^)]*?\);*$/
const simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/

// dev/src/compiler/codegen/events.js line 7
// KeyboardEvent.keyCode aliases
const keyCodes: { [key: string]: number | Array<number> } = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
}
// KeyboardEvent.key aliases
const keyNames: { [key: string]: string | Array<string> } = {
  // #7880: IE11 and Edge use `Esc` for Escape key name.
  esc: ['Esc', 'Escape'],
  tab: 'Tab',
  enter: 'Enter',
  // #9112: IE11 uses `Spacebar` for Space key name.
  space: [' ', 'Spacebar'],
  // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
  up: ['Up', 'ArrowUp'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
  down: ['Down', 'ArrowDown'],
  // #9112: IE11 uses `Del` for Delete key name.
  'delete': ['Backspace', 'Delete', 'Del']
}

// dev/src/compiler/codegen/events.js line 37
// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
const genGuard = condition => `if(${condition})return null;`
const modifierCode: { [key: string]: string } = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard(`$event.target !== $event.currentTarget`),
  ctrl: genGuard(`!$event.ctrlKey`),
  shift: genGuard(`!$event.shiftKey`),
  alt: genGuard(`!$event.altKey`),
  meta: genGuard(`!$event.metaKey`),
  left: genGuard(`'button' in $event && $event.button !== 0`),
  middle: genGuard(`'button' in $event && $event.button !== 1`),
  right: genGuard(`'button' in $event && $event.button !== 2`)
}
```

```javascript
// dev/src/compiler/codegen/events.js line 55
export function genHandlers (
  events: ASTElementHandlers,
  isNative: boolean
): string {
  const prefix = isNative ? 'nativeOn:' : 'on:'
  let staticHandlers = ``
  let dynamicHandlers = ``
  for (const name in events) { // Iterating through the event properties parsed from AST
    const handlerCode = genHandler(events[name]) // Converting the event object into a string that can be concatenated
    if (events[name] && events[name].dynamic) {
      dynamicHandlers += `${name},${handlerCode},`
    } else {
      staticHandlers += `"${name}":${handlerCode},`
    }
  }
  staticHandlers = `{${staticHandlers.slice(0, -1)}}`
  if (dynamicHandlers) {
    return prefix + `_d(${staticHandlers},[${dynamicHandlers.slice(0, -1)}])`
  } else {
    return prefix + staticHandlers
  }
}

// dev/src/compiler/codegen/events.js line 96
function genHandler (handler: ASTElementHandler | Array<ASTElementHandler>): string {
  if (!handler) {
    return 'function(){}'
  }

  // Multiple event bindings may exist in array form when parsing the AST tree, if there are multiple, the getHandler method will be recursively called to return an array.
  if (Array.isArray(handler)) {
    return `[${handler.map(handler => genHandler(handler)).join(',')}]`
  }

  const isMethodPath = simplePathRE.test(handler.value) // Method invocation is of the form doThis
  const isFunctionExpression = fnExpRE.test(handler.value) // Method invocation is of the form () => {} or function() {} 
  const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, '')) // Method invocation is of the form doThis($event)
```

```javascript
if (!handler.modifiers) { // No modifiers
  if (isMethodPath || isFunctionExpression) { // Returns directly if meeting these conditions
    return handler.value
  }
  /* istanbul ignore if */
  if (__WEEX__ && handler.params) {
    return genWeexHandler(handler.params, handler.value)
  }
  return `function($event){${ // Return concatenated string of anonymous function
    isFunctionInvocation ? `return ${handler.value}` : handler.value
  }}` // inline statement
} else { // Handling the case with modifiers
  let code = ''
  let genModifierCode = ''
  const keys = []
  for (const key in handler.modifiers) {  // Iterating over the modifiers recorded on modifiers
    if (modifierCode[key]) {
      genModifierCode += modifierCode[key]  // Adding corresponding JavaScript code based on the modifier
      // left/right
      if (keyCodes[key]) {
        keys.push(key)
      }
    } else if (key === 'exact') { // Handling for 'exact'
      const modifiers: ASTModifiers = (handler.modifiers: any)
      genModifierCode += genGuard(
        ['ctrl', 'shift', 'alt', 'meta']
          .filter(keyModifier => !modifiers[keyModifier])
          .map(keyModifier => `$event.${keyModifier}Key`)
          .join('||')
      )
    } else {
      keys.push(key) // If the modifier is not any of the above, it will be added to the keys array
    }
  }
  if (keys.length) {
    code += genKeyFilter(keys) // Handling other modifiers, i.e., those defined in keyCodes
  }
  // Make sure modifiers like prevent and stop get executed after key filtering
  if (genModifierCode) {
    code += genModifierCode
  }
  // Returns different strings based on three different writing templates
  const handlerCode = isMethodPath
    ? `return ${handler.value}($event)`
    : isFunctionExpression
      ? `return (${handler.value})($event)`
      : isFunctionInvocation
        ? `return ${handler.value}`
        : handler.value
  /* istanbul ignore if */
  if (__WEEX__ && handler.params) {
    return genWeexHandler(handler.params, code + handlerCode)
  }
  return `function($event){${code}${handlerCode}}`
}
}
```

```javascript
// dev/src/compiler/codegen/events.js line 175
function genFilterCode (key: string): string {
  const keyVal = parseInt(key, 10)
  if (keyVal) { // If the key is a number, it directly returns $event.keyCode!==${keyVal}
    return `$event.keyCode!==${keyVal}`
  }
  const keyCode = keyCodes[key]
  const keyName = keyNames[key]
  // Return the _k function, with the first parameter as $event.keyCode,
  // the second parameter as the key value,
  // and the third parameter as the number corresponding to the key in keyCodes.
  return (
    `_k($event.keyCode,` +
    `${JSON.stringify(key)},` +
    `${JSON.stringify(keyCode)},` +
    `$event.key,` +
    `${JSON.stringify(keyName)}` +
    `)`
  )
}
```

### Event Binding
We've previously discussed how to compile templates to extract event collection instructions and generate the `render` string and `render` function. However, the actual binding of events to the `DOM` is still dependent on event registration. This phase occurs during the `patchVnode` process, where the actual `DOM` creation takes place after the generation of the `VNode`, and relevant event registration hooks are processed during the `patchVnode` process.

```javascript
// dev/src/core/vdom/patch.js line 33
const hooks = ['create', 'activate', 'update', 'remove', 'destroy']

// dev/src/core/vdom/patch.js line 125
function createElm (
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {
  // ...
  if (isDef(data)) {
    invokeCreateHooks(vnode, insertedVnodeQueue)
  }
  // ...
}

// dev/src/core/vdom/patch.js line 303
// Previously, after processing cbs
// The cbs.create here contains the following callbacks:
// updateAttrs, updateClass, updateDOMListeners, updateDOMProps, updateStyle, update, updateDirectives
function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyNode, vnode)
    }
    i = vnode.data.hook // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) i.create(emptyNode, vnode)
      if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
    }
}
```

`invokeCreateHooks` is a task for handling template instructions. It creates different tasks for the real stage based on different instructions. For events, it calls `updateDOMListeners` to register event tasks for the actual `DOM` nodes.

```javascript
// dev/src/platforms/web/runtime/modules/events.js line 105
function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {  // on is the flag for event instructions
    return
  }
  // Bind and unbind different events for new and old nodes
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  // Get the actual DOM node to which events need to be added
  target = vnode.elm
  // normalizeEvents handle event compatibility
  normalizeEvents(on)
  // Call the updateListeners method and pass on as a parameter
  updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context)
  target = undefined
}
```

```javascript
// dev/src/core/vdom/helpers/update-listeners.js line 53
export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Component
) {
  let name, def, cur, old, event
  for (name in on) { // Traversing events
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    /* istanbul ignore if */
    if (__WEEX__ && isPlainObject(def)) {
      cur = def.handler
      event.params = def.params
    }
    if (isUndef(cur)) { // Handling invalid event names
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) { // Old node does not exist
      if (isUndef(cur.fns)) { // createFunInvoker returns the final callback function of the event
        cur = on[name] = createFnInvoker(cur, vm)
      }
      if (isTrue(event.once)) {  // Trigger only once
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      // Execute the actual event registration function
      add(event.name, cur, event.capture, event.passive, event.params)
    } else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  for (name in oldOn) { // If the old node exists, remove the bound events on the old node
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      // Remove event listener
      remove(event.name, oldOn[name], event.capture)
    }
  }
}

// dev/src/platforms/web/runtime/modules/events.js line 32
// After executing the callback, remove the event binding
function createOnceHandler (event, handler, capture) {
  const _target = target // Save current target element in closure
  return function onceHandler () {
    const res = handler.apply(null, arguments)
    if (res !== null) {
      remove(event, onceHandler, capture, _target)
    }
  }
}
```

Both adding and removing events ultimately call the `add` and `remove` methods, which ultimately call `addEventListener` and `removeEventListener` methods of the `DOM`.

```javascript
// dev/src/platforms/web/runtime/modules/events.js line 46
function add (
  name: string,
  handler: Function,
  capture: boolean,
  passive: boolean
) {
  // async edge case #6566: inner click event triggers patch, event handler
  // attached to outer element during patch, and triggered again. This
  // happens because browsers fire microtask ticks between event propagation.
  // the solution is simple: we save the timestamp when a handler is attached,
  // and the handler would only fire if the event passed to it was fired
  // AFTER it was attached.
  if (useMicrotaskFix) {
    const attachedTimestamp = currentFlushTimestamp
    const original = handler
    handler = original._wrapper = function (e) {
      if (
        // no bubbling, should always fire.
        // this is just a safety net in case event.timeStamp is unreliable in
        // certain weird environments...
        e.target === e.currentTarget ||
        // event is fired after handler attachment
        e.timeStamp >= attachedTimestamp ||
        // bail for environments that have buggy event.timeStamp implementations
        // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
        // #9681 QtWebEngine event.timeStamp is negative value
        e.timeStamp <= 0 ||
        // #9448 bail if event is fired in another document in a multi-page
        // electron/nw.js app, since event.timeStamp will be using a different
        // starting reference
        e.target.ownerDocument !== document
      ) {
        return original.apply(this, arguments)
      }
    }
  }
  target.addEventListener(
    name,
    handler,
    supportsPassive
      ? { capture, passive }
      : capture
  )
}

// dev/src/platforms/web/runtime/modules/events.js line 92
function remove (
  name: string,
  handler: Function,
  capture: boolean,
  _target?: HTMLElement
) {
  (_target || target).removeEventListener(
    name,
    handler._wrapper || handler,
    capture
  )
}
```




## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
- [Vue.js Official Documentation - v-on Directives](https://cn.vuejs.org/v2/api/#v-on)
- [How to Use v-on in Vue.js](https://juejin.im/post/6844903919290679304)
- [A Comprehensive Guide to Event Handling in Vue.js](https://juejin.im/post/6844904061897015310)
- [Handling Events in Vue.js Components](https://juejin.im/post/6844904126250221576)
- [Understanding EventTarget and addEventListener](https://segmentfault.com/a/1190000009750348)
- [Working with addEventListener in JavaScript](https://blog.csdn.net/weixin_41275295/article/details/100549145)
- [Mozilla Developer Network - EventTarget.addEventListener](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)
- [Vue.js 2.0 Source Code - Event Handling](https://github.com/liutao/vue2.0-source/blob/master/%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86.md)
```