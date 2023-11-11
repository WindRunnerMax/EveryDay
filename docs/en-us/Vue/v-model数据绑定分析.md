# Analysis of v-model Data Binding
`v-model` is a directive provided by Vue, its main function is to establish two-way data binding on form elements `<input>`, `<textarea>`, `<select>`, and components. Essentially, it is a syntactic sugar that can be directly defined on native form elements and also supports custom components. In the implementation of components, it is possible to configure the `prop` names the child component receives, and the event names dispatched to achieve two-way binding in the component.

## Description
The `v-model` directive can be used to create two-way data binding on form elements `<input>`, `<textarea>`, and `<select>`, and it will automatically select the correct method to update the element according to the control type, using `<input>` as an example for using `v-model`.

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

When not using the `v-model` syntactic sugar, you can implement two-way binding on your own. In fact, `v-model` internally uses different `property` and emits different events for different input elements:
* `input` and `textarea` elements use the `value property` and `input` event.
* `checkbox` and `radio` elements use the `checked property` and `change` event.
* `select` elements take `value` as `prop` and use `change` event.

Again using `<input>` as an example, implementing two-way binding without using `v-model`.

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

There are also modifiers for `v-model` to control user input:

* `.trim`: Trims the input of leading and trailing whitespace.
* `.lazy`: Listens to the `change` event instead of replacing the `input` event.
* `.number`: Converts the input string to a valid number. If this value cannot be parsed by `parseFloat()`, the original value will be returned.

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

When using custom components, the `v-model` on the component will by default use a `prop` named `value` and an event named `input`. However, input controls like radio buttons and checkboxes may use the `value attribute` for different purposes. In such cases, the `model` option can be used to avoid such conflicts.

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

## Analysis
The implementation of `Vue` source code is quite complex, handling various compatibility issues, exceptions, and conditional branches. This article analyzes the core part of the code, a simplified version with important parts annotated. The `commit id` is `ef56410`.

`v-model` is a directive of `Vue`, so the analysis starts from the compilation phase. Before parsing the directive, the general flow of `Vue` compilation phase includes: parsing template strings to generate `AST`, optimizing the syntax tree `AST`, and generating the `render` string.

```javascript
// dev/src/compiler/index.js line 11
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  const ast = parse(template.trim(), options) // Generate AST
  if (options.optimize !== false) {
    optimize(ast, options) // Optimize AST
  }
  const code = generate(ast, options) // Generate code i.e. render string
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
```

The handling of directives occurs during the process of generating the `render` string, i.e., in the `generate` function, calling `genElement -> genData -> genDirectives`. This article mainly analyzes the `genDirectives` function.

```javascript
// dev/src/compiler/codegen/index.js line 43
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  const state = new CodegenState(options)
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`, // render string
    staticRenderFns: state.staticRenderFns
  }
}
```

```javascript
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

During the `AST` generation phase, also known as the `parse` phase, `v-model` is parsed as a regular directive into `el.directives`. The `genDrirectives` method iterates through `el.directives` and retrieves the method corresponding to each directive. For `v-model`, at this point, `{name: "model", rawName: "v-model" ...}` is obtained, and the method corresponding to the `model` directive is found through `state`, and is then executed.

```javascript
// dev/src/compiler/codegen/index.js line 309
function genDirectives (el: ASTElement, state: CodegenState): string | void {
  const dirs = el.directives // Obtain directives
  if (!dirs) return
  let res = 'directives:['
  let hasRuntime = false
  let i, l, dir, needRuntime
  for (i = 0, l = dirs.length; i < l; i++) { // Iterate through directives
    dir = dirs[i]
    needRuntime = true
    const gen: DirectiveFunction = state.directives[dir.name] // For v-model, const gen = state.directives["model"];
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

The `model` method mainly determines the type of `tag` based on the input parameters and calls different processing logic.

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
```

```javascript
if (process.env.NODE_ENV !== 'production') {
  // If the environment is not in production, we need to perform the following checks:
  // 1. Inputs with type="file" are read-only, and setting the input value will throw an error.
  if (tag === 'input' && type === 'file') {
    warn(
      `<${el.tag} v-model="${value}" type="file">:\n` +
      `File inputs are read-only. Use a v-on:change listener instead.`,
      el.rawAttrsMap['v-model']
    )
  }
}

// Branch handling
if (el.component) {
  genComponentModel(el, value, modifiers)
  // The component v-model doesn't need extra runtime
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
  // The component v-model doesn't need extra runtime
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

// Ensure runtime directive metadata
return true
}
```

The `genDefaultModel` function first handles the `modifiers`. The different modifiers mainly affect the values of `event` and `valueExpression`. For the `<input>` tag, the `event` is `input`, and the `valueExpression` is `$event.target.value`. Then, it executes `genAssignmentCode` to generate code and add the attribute value and event handling.
```javascript
// dev/src/platforms/web/compiler/directives/model.js line 127
function genDefaultModel (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
): ?boolean {
  const type = el.attrsMap.type
```

```javascript
// warn if v-bind:value conflicts with v-model
// except for inputs with v-bind:type
warn if v-bind:value conflicts with v-model except for inputs with v-bind:type
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

// Modifier handling
修饰符处理
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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

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