# v-model数据绑定分析
`v-model`是`Vue`提供的指令，其主要作用是可以实现在表单`<input>`、`<textarea>`及`<select>`等元素以及组件上创建双向数据绑定，其本质上就是一种语法糖，既可以直接定义在原生表单元素，也可以支持自定义组件。在组件的实现中，可以配置子组件接收的`prop`名称，以及派发的事件名称实现组件内的`v-model`双向绑定。

## 概述
可以用`v-model`指令在表单`<input>`、`<textarea>`及`<select>`元素上创建双向数据绑定，其会根据控件类型自动选取正确的方法来更新元素，以`<input>`作为示例使用`v-model`。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: "#app",
        data: {
            msg: ""
        },
        template: `
            <div>
                <div>Message is: {{ msg }}</div>
                <input v-model="msg">
            </div>
        `
    })
</script>
</html>
```

当不使用`v-model`语法糖时，可以自行实现一个双向绑定，实际上`v-model`在内部为不同的输入元素使用不同的`property`并抛出不同的事件：
* `input`和`textarea`元素使用`value property`和`input`事件。
* `checkbox`和`radio`元素使用`checked property`和`change`事件。
* `select`元素将`value`作为`prop`并将`change`作为事件。

同样以`<input>`作为示例而不使用`v-model`实现双向绑定。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: "#app",
        data: {
            msg: ""
        },
        template: `
            <div>
                <div>Message is: {{ msg }}</div>
                <input :value="msg" @input="msg = $event.target.value">
            </div>
        `
    })
</script>
</html>
```

对于`v-model`还有修饰符用以控制用户输入：

* `.trim`: 输入首尾空格过滤。
* `.lazy`: 取代`input`事件而监听`change`事件。
* `.number`: 输入字符串转为有效的数字，如果这个值无法被`parseFloat()`解析，则会返回原始的值。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    var vm = new Vue({
        el: "#app",
        data: {
            msg: 0
        },
        template: `
            <div>
                <div>Message is: {{ msg }}</div>
                <div>Type is: {{ typeof(msg) }}</div>
                <input v-model.number="msg" type="number">
            </div>
        `
    })
</script>
</html>
```

当使用自定义组件时，在组件上的`v-model`默认会利用名为`value`的`prop`和名为`input`的事件，但是像单选框、复选框等类型的输入控件可能会将`value attribute`用于不同的目的，此时可以使用`model`选项可以用来避免这样的冲突。

```html
<!DOCTYPE html>
<html>
<head>
    <title>Vue</title>
</head>
<body>
    <div id="app"></div>
</body>
<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script type="text/javascript">
    Vue.component("u-input", {
        model: {
            prop: "message",
            event: "input"
        },
        props: {
            message: { 
                type: String
            },
        },
        template: `
            <div>
                <input :value="message" @input="$emit('input', $event.target.value)">
            </div>
        `
    })
    var vm = new Vue({
        el: "#app",
        data: {
            msg: ""
        },
        template: `
            <div>
                <div>Message is: {{ msg }}</div>
                <u-input v-model="msg"></u-input>
            </div>
        `
    })
</script>
</html>
```

## 分析
`Vue`源码的实现比较复杂，会处理各种兼容问题与异常以及各种条件分支，文章分析比较核心的代码部分，精简过后的版本，重要部分做出注释，`commit id`为`ef56410`。

`v-model`属于`Vue`的指令，所以从编译阶段开始分析，在解析到指令之前，`Vue`的解析阶段大致流程：解析模板字符串生成`AST`、优化语法树`AST`、生成`render`字符串。

```javascript
// dev/src/compiler/index.js line 11
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options) // 生成AST
  if (options.optimize !== false) {
    optimize(ast, options) // 优化AST
  }
  const code = generate(ast, options) // 生成代码 即render字符串
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
```

对指令的处理就在生成`render`字符串的过程，也就是`generate`函数的处理过程，在`generate`中调用`genElement -> genData -> genDirectives`，文章主要从`genDirectives`函数进行分析。

```javascript
// dev/src/compiler/codegen/index.js line 43
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  const state = new CodegenState(options)
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`, // render字符串
    staticRenderFns: state.staticRenderFns
  }
}

// dev/src/compiler/codegen/index.js line 55
export function genElement (el: ASTElement, state: CodegenState): string {
  // ...
  data = genData(el, state)
  // ...
}

// dev/src/compiler/codegen/index.js line 219
export function genData (el: ASTElement, state: CodegenState): string {
  // ...
  const dirs = genDirectives(el, state)
  // ...
}
```

在生成`AST`阶段，也就是`parse`阶段，`v-model`被当做普通的指令解析到`el.directives`中，`genDrirectives`方法就是遍历`el.directives`，然后获取每一个指令对应的方法，对于`v-model`而言，在此处获取的是`{name: "model", rawName: "v-model" ...}`，通过`state`找到`model`指令对应的方法`model()`并执行该方法。

```javascript
// dev/src/compiler/codegen/index.js line 309
function genDirectives (el: ASTElement, state: CodegenState): string | void {
  const dirs = el.directives // 获取指令
  if (!dirs) return
  let res = 'directives:['
  let hasRuntime = false
  let i, l, dir, needRuntime
  for (i = 0, l = dirs.length; i < l; i++) { // 遍历指令
    dir = dirs[i]
    needRuntime = true
    const gen: DirectiveFunction = state.directives[dir.name] // 对于v-model来说 const gen = state.directives["model"];
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn)
    }
    if (needRuntime) {
      hasRuntime = true
      res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
        dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
      }${
        dir.arg ? `,arg:${dir.isDynamicArg ? dir.arg : `"${dir.arg}"`}` : ''
      }${
        dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
      }},`
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}
```

`model`方法主要是根据传入的参数对`tag`的类型进行判断，调用不同的处理逻辑。

```javascript
// dev/src/platforms/web/compiler/directives/model.js line 14
export default function model (
  el: ASTElement,
  dir: ASTDirective,
  _warn: Function
): ?boolean {
  warn = _warn
  const value = dir.value
  const modifiers = dir.modifiers
  const tag = el.tag
  const type = el.attrsMap.type

  if (process.env.NODE_ENV !== 'production') {
    // inputs with type="file" are read only and setting the input's
    // value will throw an error.
    if (tag === 'input' && type === 'file') {
      warn(
        `<${el.tag} v-model="${value}" type="file">:\n` +
        `File inputs are read only. Use a v-on:change listener instead.`,
        el.rawAttrsMap['v-model']
      )
    }
  }
    
  // 分支处理
  if (el.component) {
    genComponentModel(el, value, modifiers)
    // component v-model doesn't need extra runtime
    return false
  } else if (tag === 'select') {
    genSelect(el, value, modifiers)
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers)
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers)
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers)
  } else if (!config.isReservedTag(tag)) {
    genComponentModel(el, value, modifiers)
    // component v-model doesn't need extra runtime
    return false
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `<${el.tag} v-model="${value}">: ` +
      `v-model is not supported on this element type. ` +
      'If you are working with contenteditable, it\'s recommended to ' +
      'wrap a library dedicated for that purpose inside a custom component.',
      el.rawAttrsMap['v-model']
    )
  }

  // ensure runtime directive metadata
  return true
}
```

`genDefaultModel`函数先处理了`modifiers`修饰符，其不同主要影响的是`event`和`valueExpression`的值，对于`<input>`标签`event`为`input`，`valueExpression`为`$event.target.value`，然后去执行`genAssignmentCode`去生成代码，以及添加属性值与事件处理。

```javascript
// dev/src/platforms/web/compiler/directives/model.js line 127
function genDefaultModel (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
): ?boolean {
  const type = el.attrsMap.type

  // warn if v-bind:value conflicts with v-model
  // except for inputs with v-bind:type
  // value与v-model冲突则发出警告
  if (process.env.NODE_ENV !== 'production') {
    const value = el.attrsMap['v-bind:value'] || el.attrsMap[':value']
    const typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type']
    if (value && !typeBinding) {
      const binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value'
      warn(
        `${binding}="${value}" conflicts with v-model on the same element ` +
        'because the latter already expands to a value binding internally',
        el.rawAttrsMap[binding]
      )
    }
  }

  // 修饰符处理
  const { lazy, number, trim } = modifiers || {}
  const needCompositionGuard = !lazy && type !== 'range'
  const event = lazy
    ? 'change'
    : type === 'range'
      ? RANGE_TOKEN
      : 'input'

  let valueExpression = '$event.target.value'
  if (trim) {
    valueExpression = `$event.target.value.trim()`
  }
  if (number) {
    valueExpression = `_n(${valueExpression})`
  }

  let code = genAssignmentCode(value, valueExpression)
  if (needCompositionGuard) {
    code = `if($event.target.composing)return;${code}`
  }

  addProp(el, 'value', `(${value})`)
  addHandler(el, event, code, null, true)
  if (trim || number) {
    addHandler(el, 'blur', '$forceUpdate()')
  }
}

// dev/src/compiler/directives/model.js line 36
export function genAssignmentCode (
  value: string,
  assignment: string
): string {
  const res = parseModel(value)
  if (res.key === null) {
    return `${value}=${assignment}`
  } else {
    return `$set(${res.exp}, ${res.key}, ${assignment})`
  }
}
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://cn.vuejs.org/v2/api/#v-model
https://www.jianshu.com/p/19bb4912c62a
https://www.jianshu.com/p/0d089f770ab2
https://cn.vuejs.org/v2/guide/forms.html
https://juejin.im/post/6844903784963899400
https://juejin.im/post/6844903999414485005
https://segmentfault.com/a/1190000021516035
https://segmentfault.com/a/1190000015848976
https://github.com/haizlin/fe-interview/issues/560
https://ustbhuangyi.github.io/vue-analysis/v2/extend/v-model.html
```
