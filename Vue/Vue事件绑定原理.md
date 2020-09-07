# Vue事件绑定原理
`Vue`中通过`v-on`或其语法糖`@`指令来给元素绑定事件并且提供了事件修饰符，基本流程是进行模板编译生成`AST`，生成`render`函数后并执行得到`VNode`，`VNode`生成真实`DOM`节点或者组件时候使用`addEventListener`方法进行事件绑定。

## 描述
`v-on`与`@`用于绑定事件监听器，事件类型由参数指定，表达式可以是一个方法的名字或一个内联语句，如果没有修饰符也可以省略，用在普通元素上时，只能监听原生`DOM`事件，用在自定义元素组件上时，也可以监听子组件触发的自定义事件，在监听原生`DOM`事件时，方法以事件为唯一的参数，如果使用内联语句，语句可以访问一个`$event property：v-on:click="handle('param', $event)"`，自`2.4.0`开始`v-on`同样支持不带参数绑定一个事件或监听器键值对的对象，注意当使用对象语法时，是不支持任何修饰器的。

### 修饰符
* `.stop`: 调用`event.stopPropagation()`，即阻止事件冒泡。
* `.prevent`: 调用`event.preventDefault()`，即阻止默认事件。
* `.capture`: 添加事件侦听器时使用`capture`模式，即使用事件捕获模式处理事件。
* `.self`: 只当事件是从侦听器绑定的元素本身触发时才触发回调。
* `.{keyCode | keyAlias}`: 只当事件是从特定键触发时才触发回调。
* `.native`: 监听组件根元素的原生事件，即注册组件根元素的原生事件而不是组件自定义事件的。
* `.once`: 只触发一次回调。
* `.left(2.2.0)`: 只当点击鼠标左键时触发。
* `.right(2.2.0)`: 只当点击鼠标右键时触发。
* `.middle(2.2.0)`: 只当点击鼠标中键时触发。
* `.passive(2.3.0)`: 以`{ passive: true }`模式添加侦听器，表示`listener`永远不会调用`preventDefault()`。

### 普通元素
```html
<!-- 方法处理器 -->
<button v-on:click="doThis"></button>

<!-- 动态事件 (2.6.0+) -->
<button v-on:[event]="doThis"></button>

<!-- 内联语句 -->
<button v-on:click="doThat('param', $event)"></button>

<!-- 缩写 -->
<button @click="doThis"></button>

<!-- 动态事件缩写 (2.6.0+) -->
<button @[event]="doThis"></button>

<!-- 停止冒泡 -->
<button @click.stop="doThis"></button>

<!-- 阻止默认行为 -->
<button @click.prevent="doThis"></button>

<!-- 阻止默认行为，没有表达式 -->
<form @submit.prevent></form>

<!--  串联修饰符 -->
<button @click.stop.prevent="doThis"></button>

<!-- 键修饰符，键别名 -->
<input @keyup.enter="onEnter">

<!-- 键修饰符，键代码 -->
<input @keyup.13="onEnter">

<!-- 点击回调只会触发一次 -->
<button v-on:click.once="doThis"></button>

<!-- 对象语法 (2.4.0+) -->
<button v-on="{ mousedown: doThis, mouseup: doThat }"></button>
```

## 组件元素

```html
<!-- 自定义事件 -->
<my-component @my-event="handleThis"></my-component>

<!-- 内联语句 -->
<my-component @my-event="handleThis('param', $event)"></my-component>

<!-- 组件中的原生事件 -->
<my-component @click.native="onClick"></my-component>
```

## 分析
`Vue`源码的实现比较复杂，会处理各种兼容问题与异常以及各种条件分支，文章分析比较核心的代码部分，精简过后的版本，重要部分做出注释，`commit id`为`ef56410`。  

### 编译阶段
`Vue`在挂载实例前，有相当多的工作是进行模板的编译，将`template`模板进行编译，解析成`AST`树，再转换成`render`函数，而在编译阶段，就是对事件的指令做收集处理。  
在`template`模板中，定义事件的部分是属于`XML`的`Attribute`，所以收集指令时需要匹配`Attributes`以确定哪个`Attribute`是属于事件。

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
    if (dirRE.test(name)) { // 匹配指令属性
      // mark element as dynamic
      el.hasBindings = true
      // modifiers
      modifiers = parseModifiers(name.replace(dirRE, '')) // 将修饰符解析
      // support .foo shorthand syntax for the .prop modifier
      if (process.env.VBIND_PROP_SHORTHAND && propBindRE.test(name)) {
        (modifiers || (modifiers = {})).prop = true
        name = `.` + name.slice(1).replace(modifierRE, '')
      } else if (modifiers) {
        name = name.replace(modifierRE, '')
      }
      if (bindRE.test(name)) { // v-bind // 处理v-bind的情况
        // ...
      } else if (onRE.test(name)) { // v-on // 处理事件绑定
        name = name.replace(onRE, '') // 将事件名匹配
        isDynamic = dynamicArgRE.test(name) // 动态事件绑定
        if (isDynamic) { // 如果是动态事件
          name = name.slice(1, -1) // 去掉两端的 []
        }
        addHandler(el, name, value, modifiers, false, warn, list[i], isDynamic) // 处理事件收集
      } else { // normal directives // 处理其他指令
        // ...
      }
    } else {
      // literal attribute // 处理文字属性
      // ...
    }
  }
}
```

通过`addHandler`方法，为`AST`树添加事件相关的属性以及对事件修饰符进行处理。

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
  // passive 和 prevent 不能同时使用，具体是由passive模式的性质决定的
  // 详细可以参阅 https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
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
  // 标准化click.right和click.middle，因为它们实际上不会触发。
  // 从技术上讲，这是特定于浏览器的，但是至少目前来说，浏览器是唯一具有右键/中间点击的目标环境。
  // normalize click.right and click.middle since they don't actually fire
  // this is technically browser-specific, but at least for now browsers are
  // the only target envs that have right/middle clicks.
  if (modifiers.right) { // 将鼠标右键点击标准化 右键点击默认的是 contextmenu 事件
    if (dynamic) { // 如果是动态事件
      name = `(${name})==='click'?'contextmenu':(${name})` // 动态确定事件名
    } else if (name === 'click') { // 如果不是动态事件且是鼠标右击
      name = 'contextmenu' // 则直接替换为contextmenu事件
      delete modifiers.right // 删除modifiers的right属性
    }
  } else if (modifiers.middle) { // 同样标准化处理鼠标中键点击的事件
    if (dynamic) { // 如果是动态事件
      name = `(${name})==='click'?'mouseup':(${name})` // 动态确定事件名
    } else if (name === 'click') { // 如果不是动态事件且是鼠标中键点击
      name = 'mouseup' // 处理为mouseup事件
    }
  }
  // 下面是对捕获、一次触发、passive模式的modifiers处理，主要是为事件添加 !、~、& 标记
  // 这一部分标记可以在Vue官方文档中查阅 
  // https://cn.vuejs.org/v2/guide/render-function.html#%E4%BA%8B%E4%BB%B6-amp-%E6%8C%89%E9%94%AE%E4%BF%AE%E9%A5%B0%E7%AC%A6
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
  
  // events 用来记录绑定的事件
  let events
  if (modifiers.native) { // 如果是要触发根元素原生事件则直接取得nativeEvents
    delete modifiers.native
    events = el.nativeEvents || (el.nativeEvents = {})
  } else { // 否则取得events
    events = el.events || (el.events = {})
  }
    
  // 将事件处理函数作为handler
  const newHandler: any = rangeSetItem({ value: value.trim(), dynamic }, range)
  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers
  }

 // 绑定的事件可以多个，回调也可以多个，最终会合并到数组中
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
}
```

### 代码生成
接下来需要将`AST`语法树转`render`函数，在这个过程中会加入对事件的处理，首先模块导出了`generate`函数，`generate`函数即会返回`render`字符串，在这之前会调用`genElement`函数，而在上述`addHandler`方法处理的最后执行了`el.plain = false`，这样在`genElement`函数中会调用`genData`函数，而在`genData`函数中即会调用`genHandlers`函数。

```javascript
// dev/src/compiler/codegen/index.js line 42
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  const state = new CodegenState(options)
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`, // 即render字符串
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
    return new Function(code) // 将render字符串转为render函数
  } catch (err) {
    errors.push({ err, code })
    return noop
  }
}
```

可以看到无论是处理普通元素事件还是组件根元素原生事件都会调用`genHandlers`函数，`genHandlers`函数即会遍历解析好的`AST`树中事件属性，拿到`event`对象属性，并根据属性上的事件对象拼接成字符串。

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

// dev/src/compiler/codegen/events.js line 55
export function genHandlers (
  events: ASTElementHandlers,
  isNative: boolean
): string {
  const prefix = isNative ? 'nativeOn:' : 'on:'
  let staticHandlers = ``
  let dynamicHandlers = ``
  for (const name in events) { // 遍历AST解析后的事件属性
    const handlerCode = genHandler(events[name]) // 将事件对象转换成可拼接的字符串
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

  // 事件绑定可以多个，多个在解析AST树时会以数组的形式存在，如果有多个则会递归调用getHandler方法返回数组。
  if (Array.isArray(handler)) {
    return `[${handler.map(handler => genHandler(handler)).join(',')}]`
  }

  const isMethodPath = simplePathRE.test(handler.value) // 调用方法为 doThis 型
  const isFunctionExpression = fnExpRE.test(handler.value) // 调用方法为 () => {} or function() {} 型
  const isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, '')) // 调用方法为 doThis($event) 型

  if (!handler.modifiers) { // 没有修饰符
    if (isMethodPath || isFunctionExpression) { // 符合这两个条件则直接返回
      return handler.value
    }
    /* istanbul ignore if */
    if (__WEEX__ && handler.params) {
      return genWeexHandler(handler.params, handler.value)
    }
    return `function($event){${ // 返回拼接的匿名函数的字符串
      isFunctionInvocation ? `return ${handler.value}` : handler.value
    }}` // inline statement
  } else { // 处理具有修饰符的情况
    let code = ''
    let genModifierCode = ''
    const keys = []
    for (const key in handler.modifiers) {  // 遍历modifiers上记录的修饰符
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key]  // 根据修饰符添加对应js的代码
        // left/right
        if (keyCodes[key]) {
          keys.push(key)
        }
      } else if (key === 'exact') { // 针对exact的处理
        const modifiers: ASTModifiers = (handler.modifiers: any)
        genModifierCode += genGuard(
          ['ctrl', 'shift', 'alt', 'meta']
            .filter(keyModifier => !modifiers[keyModifier])
            .map(keyModifier => `$event.${keyModifier}Key`)
            .join('||')
        )
      } else {
        keys.push(key) // 如果修饰符不是以上修饰符，则会添加到keys数组中
      }
    }
    if (keys.length) {
      code += genKeyFilter(keys) // 处理其他修饰符 即keyCodes中定义的修饰符
    }
    // Make sure modifiers like prevent and stop get executed after key filtering
    if (genModifierCode) {
      code += genModifierCode
    }
    // 根据三种不同的书写模板返回不同的字符串
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

// dev/src/compiler/codegen/events.js line 175
function genFilterCode (key: string): string {
  const keyVal = parseInt(key, 10)
  if (keyVal) { // 如果key是数字，则直接返回$event.keyCode!==${keyVal}
    return `$event.keyCode!==${keyVal}`
  }
  const keyCode = keyCodes[key]
  const keyName = keyNames[key]
  // 返回_k函数，它的第一个参数是$event.keyCode，
  // 第二个参数是key的值，
  // 第三个参数就是key在keyCodes中对应的数字。
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

### 事件绑定
前面介绍了如何编译模板提取事件收集指令以及生成`render`字符串和`render`函数，但是事件真正的绑定到`DOM`上还是离不开事件注册，此阶段就发生在`patchVnode`过程中，在生成完成`VNode`后，进行`patchVnode`过程中创建真实`DOM`时会进行事件注册的相关钩子处理。

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
// 在之前cbs经过处理 
// 这里cbs.create包含如下几个回调：
// updateAttrs、updateClass、updateDOMListeners、updateDOMProps、updateStyle、update、updateDirectives
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

`invokeCreateHooks`就是一个模板指令处理的任务，他分别针对不同的指令为真实阶段创建不同的任务，针对事件，这里会调`updateDOMListeners`对真实的`DOM`节点注册事件任务。

```javascript
// dev/src/platforms/web/runtime/modules/events.js line 105
function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {  // on是事件指令的标志
    return
  }
  // 新旧节点不同的事件绑定解绑
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  // 拿到需要添加事件的真实DOM节点
  target = vnode.elm
  // normalizeEvents是对事件兼容性的处理
  normalizeEvents(on)
  // 调用updateListeners方法，并将on作为参数传进去
  updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context)
  target = undefined
}

// dev/src/core/vdom/helpers/update-listeners.js line line 53
export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Component
) {
  let name, def, cur, old, event
  for (name in on) { // 遍历事件
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    /* istanbul ignore if */
    if (__WEEX__ && isPlainObject(def)) {
      cur = def.handler
      event.params = def.params
    }
    if (isUndef(cur)) { // 事件名非法的报错处理
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) { // 旧节点不存在
      if (isUndef(cur.fns)) { // createFunInvoker返回事件最终执行的回调函数
        cur = on[name] = createFnInvoker(cur, vm)
      }
      if (isTrue(event.once)) {  // 只触发一次的事件
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      // 执行真正注册事件的执行函数
      add(event.name, cur, event.capture, event.passive, event.params)
    } else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  for (name in oldOn) { // 旧节点存在，解除旧节点上的绑定事件
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      // 移除事件监听
      remove(event.name, oldOn[name], event.capture)
    }
  }
}

// dev/src/platforms/web/runtime/modules/events.js line 32
// 在执行完回调之后，移除事件绑定
function createOnceHandler (event, handler, capture) {
  const _target = target // save current target element in closure
  return function onceHandler () {
    const res = handler.apply(null, arguments)
    if (res !== null) {
      remove(event, onceHandler, capture, _target)
    }
  }
}
```

最终添加与移除事件都是调用的`add`与`remove`方法，最终调用的方法即`DOM`的`addEventListener`方法与`removeEventListener`方法。

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




## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://cn.vuejs.org/v2/api/#v-on
https://juejin.im/post/6844903919290679304
https://juejin.im/post/6844904061897015310
https://juejin.im/post/6844904126250221576
https://segmentfault.com/a/1190000009750348
https://blog.csdn.net/weixin_41275295/article/details/100549145
https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
https://github.com/liutao/vue2.0-source/blob/master/%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86.md
```
