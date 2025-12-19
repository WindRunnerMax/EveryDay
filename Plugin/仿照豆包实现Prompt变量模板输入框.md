# 仿照豆包实现Prompt变量模板输入框
先前在使用豆包的`Web`版时，发现在“帮我写作”模块中用以输入`Prompt`的模板输入框非常实用，既可以保留模板输入的优势，来调优指定的写作方向，又能够不失灵活地自由编辑。其新对话的输入交互也非常细节，例如选择“音乐生成”后技能提示本身也是编辑器的嵌入模块，不可以直接删除。

虽然看起来这仅仅是一个文本内容的输入框，但是实现起来并不是那么容易，细节的交互也非常重要。例如技能提示节点直接作为输入框本身模块，多行文本就可以在提示下方排版，而不是类似网格布局需要在左侧留空白内容。那么在这里我们就以豆包的交互为例，来实现`Prompt`的变量模板输入框。

<details>
<summary><strong>AI Infra 系列相关文章</strong></summary>

- [基于 fetch 的 SSE 方案](../Browser/基于fetch的SSE方案.md)
- [基于向量检索实现基础 RAG 服务](./基于向量检索实现基础RAG服务.md)
- [流式 Markdown 增量富文本解析算法](./流式Markdown增量富文本解析算法.md)
- [仿照豆包实现 Prompt 变量模板输入框](./仿照豆包实现Prompt变量模板输入框.md)

</details>

## 概述
当我们开发`AI`相关的应用时，一个常见的场景便是需要用户输入`Prompt`，或者是在管理后台维护`Prompt`模板提供给其他用户使用。此时我们就需要一个能够支持内容输入或者模板变量的输入框，那么常见的实现方式有以下几种:

- 纯文本输入框，类似于`<input>`、`<textarea>`等标签，在其`DOM`结构周围实现诸如图片、工具选择等按钮的交互。
- 表单变量模板，类似于填空的形式，将`Prompt`模板以表单的形式填充变量，用户只需要填充所需要的变量内容即可。
- 变量模板输入框，同样类似于填空的形式，但是其他内容也是可以编辑的，以此实现模版变量调优以及灵活的自由指令。

在这里有个有趣的事情，豆包的这个模板输入框是用`slate`做的，而后边生成文档的部分却又引入了新的富文本框架。也就是其启用分步骤“文档编辑器”模式的编辑器框架与模板输入框的编辑器框架并非同一套实现，毕竟引入多套编辑器还是会对应用的体积还是有比较大的影响。

因此为什么不直接使用同一套实现则是非常有趣的问题，虽然一开始可能是想着不同的业务组实现有着不同的框架选型倾向。但是仔细研究一下，想起来`slate`对于`inline`节点是特殊类型实现，其内嵌的`inline`左右是还可以放光标的，重点是`inline`内部也可以放光标。

这个问题非常重要，如果不能实现空结构的光标位置，那么就很难实现独立的块结构。而这里的实现跟数据结构和选区模式设计非常相关，若是针对连续的两个`DOM`节点位置，如果需要实现多个选区位置，就必须有足够的选区表达，而如果是纯线性的结构则无法表示。

```js
// <em>text</em><strong>text</strong>

// 完全匹配 DOM 结构的设计
{ path: [0], offset: 4 } // 位置 1
{ path: [1], offset: 0 } // 位置 2

// 线性结构的设计
{ offset: 4 } // 位置 1
```

对于类似的光标位置问题，开源的编辑器例如`Quill`、`Lexical`等，甚至商业化的飞书文档、`Notion`都没有直接支持这种模式。这些编辑器的`schema`设计都是两个字符间仅会存在一个`caret`的光标插入点，验证起来也很简单，只要看能否单独插入一个空内容的`inline`节点即可。

在这里虽然我们主要目标是实现变量模板的输入框形式，但是其他的形式也非常有意思，例如`GitHub`的搜索输入框高亮、`CozeLoop`的`Prompt`变量调时输入等。因此我们会先将这些形式都简单叙述一下，在最后再重点实现变量模板输入框的形式，最终的实现可以参考 [BlockKit Variables](https://github.com/WindRunnerMax/BlockKit/tree/master/examples/variable) 以及 [CodeSandbox](https://codesandbox.io/p/devbox/cycrdf)。

## 纯文本输入框
纯文本输入框的形式就比较常见了，例如`<input>`、`<textarea>`等标签，当前我们平时使用的输入框也都是类似的形式，例如`DeepSeek`就是单纯的`textarea`标签。当然也有富文本编辑器的输入框形式，例如`Gemini`的输入框，但整体形式上基本一致。

### 文本 Input
单纯的文本输入框的形式自然是最简单的实现了，直接使用`textarea`标签即可，只不过这里需要实现一些控制形式，例如自动计算文本高度等。此外还需要根据业务需求实现一些额外的交互，例如图片上传、联网搜索、文件引用、深度思考等。

```
+-------------------------------------------+
|                                           |
| DeepThink   Search                      ↑ |
+-------------------------------------------+
```

### 文本高亮匹配
在这里更有趣的是`GitHub`的搜索输入框，在使用综合搜索、`issue`搜索等功能时，我们可以看到如果关键词会被高亮。例如搜索时的`is:issue state:open `文本内容，`issue`和`open`会被高亮，而`F12`检查时发现其仅是使用`input`标签，并没有引入富文本编辑器。

在这里`GitHub`的实现方式就非常有趣，实际上是使用了`div`渲染格式样式，来实现高亮的效果，然后使用透明的`input`标签来实现输入交互。如果在`F12`检查时将`input`节点的`color`透明隐藏掉，就可以发现文本的内容重叠了起来，需要关注的点在于怎么用`CSS`实现文本的对齐。

我们也可以实现一个类似的效果，主要关注字体、`spacing`的文本对齐，以及避免对浮层的事件响应，否则会导致鼠标点击落到浮层`div`而不是`input`导致无法输入。其实这里还有一些其他的细节需要处理，例如可能存在滚动条的情况，不过在这里由于篇幅问题我们就不处理了。

```html
<div class="container">
  <div id="$$1" class="overlay"></div>
  <input id="$$2" type="text" class="input" value="变量文本{{vars}}内容" />
</div>
<script>
    const onInput = () => {
      const text = $$2.value;
      const html = text.replace(/{{(.*?)}}/g, `<span style="color: blue;">{{$1}}</span>`);
      $$1.innerHTML = html;
    };
    $$2.oninput = onInput;
    onInput();
</script>
<style>
  .container { position: relative; height: 30px; width: 800px; border: 1px solid #aaa; border-radius: 3px; }
  .container > * { width: 800px; height: 30px; font-size: 16px; box-sizing: border-box; font-family: inherit;  }
  .overlay { pointer-events: none; position: absolute; left: 0; top: 0; height: 100%; width: 100%; }
  .overlay { white-space: pre; display: flex; align-items: center; word-break: break-word; }
  .input { padding: 0; border-width: 0; word-spacing: 0; letter-spacing: 0; color: #0000; caret-color: #000; }
</style>
```

## 表单变量模板
变量模板的形式非常类似于表单的形式，在有具体固定的`Prompt`模板或者具体的任务时，这种模式非常合适。还有个有意思的事情，这种形式同样适用于非`AI`能力的渐进式迭代，例如文档场景常见的翻译能力，原有的交互形式是提交翻译表单任务，而在这里可以将表单形式转变为`Prompt`模板来使用。

### 表单模板
表单模版的交互形式比较简单，通常都是左侧部分编写纯文本并且预留变量空位，右侧部分会根据文本内容动态构建表单，`CozeLoop`中有类似的实现形式。除了常规的表单提交以外，将这种交互形式融入到`LLms`融入到流程编排中实现流水线，以提供给其他用户使用，也是常见的场景。

此外，表单模版适用于比较长的`Prompt`模版场景，从易用性上来说，用户可以非常容易地专注变量内容的填充，而无需仔细阅读提供的`Prompt`模版。并且这种形式还可以实现变量的复用，也就是在多个位置使用同一个变量。

```
+--------------------------------------------------+------------------------+
| 请帮我写一篇关于 {{topic}} 的文章，文章内容要          | 主题: ________________ |
| 包含以下要点: {{points}}，文章风格符合 {{style}}，    | 要点: ________________ |
| 文章篇幅为 {{length}}，并且要包含一个吸引人的标题。     | 风格: ________________ |
|                                                  | 长度: ________________ |
+--------------------------------------------------+------------------------+
```

### 行内变量块
行内变量块就相当于内容填空的形式，相较表单模版来说，行内变量块则会更加倾向较短的`Prompt`模板。整个`Prompt`模板绘作为整体，而变量块则作为行内的独立块结构存在，用户可以直接点击变量块进行内容编辑，注意此处的内容是仅允许编辑变量块的内容，模板的文本是不能编辑的。

```
+---------------------------------------------------------------------------+
| 请帮我写一篇关于 {{topic}} 的文章，文章内容要包含以下要点: {{points}}，           |
| 文章风格符合 {{style}}，文章篇幅为 {{length}}，并且要包含一个吸引人的标题。        |
+---------------------------------------------------------------------------+
```

这里相对豆包的变量模板输入框形式来说，最大的差异就是非变量块不可编辑。那么相对来说这种形式就比较简单了，普通的文本就使用`span`节点，变量节点则使用可编辑的`input`标签即可。看起来没什么问题，然而我们需要处理其自动宽度，类似`arco`的实现，否则交互起来效果会比较差。

实际上`input`的自动宽度并没有那么好实现，通常来说这种情况需要额外的`div`节点放置文本来同步计算宽度，类似于前文我们聊的`GitHub`搜索输入框的实现方式。那么在这里我们使用`Editable`的`span`节点来实现内容的编辑，当然也会存在其他问题需要处理，例如避免回车、粘贴等。

```html
<div id="$$0" class="container"><span>请帮我写一篇关于</span><span class="input" placeholder="{{topic}}" ></span><span>的文章，文章内容要包含以下要点:</span><span class="input" placeholder="{{points}}" ></span>，<span>文章风格符合</span><span class="input" placeholder="{{style}}" ></span><span>，文章篇幅为</span><span class="input" placeholder="{{length}}" ></span><span>，并且要包含一个吸引人的标题。</span></div>
<style>
  .container > * { font-size: 16px; display: inline-block; }
  .input { outline: none; margin: 3px 2px; border-radius: 4px; padding: 2px 5px; }
  .input { color: #0057ff; background: rgba(0, 102, 255, 0.06); }
  .input::after { content: attr(data-placeholder); cursor: text; opacity: 0.5; pointer-events: none;  }
</style>
<script>
  const inputs = document.querySelectorAll(".input");
  inputs.forEach(input => {
    input.setAttribute("contenteditable", "true");
    const onInput = () => {
      !input.innerText ? input.setAttribute("data-placeholder", input.getAttribute("placeholder"))
      : input.removeAttribute("data-placeholder");
    }
    onInput();
    input.oninput = onInput;
  });
</script>
```

## 变量模板输入框
变量模板输入框可以认为是上述实现的扩展，主要是支持了文本的编辑，这种情况下通常就需要引入富文本编辑器来实现了。因此，这种模式同样适用于较短的`Prompt`模版场景，并且用户可以在模板的基础上进行灵活的调整，参考下面的示例实现的 [DEMO](https://windrunnermax.github.io/BlockKit/variable.html) 效果。

```
+---------------------------------------------------------------------------+
| 我是一位 {{role}}，帮我写一篇关于 {{theme}} 内容的 {{platform}} 文章，          |
| 需要符合该平台写作风格，文章篇幅为 {{space}} 。                                 |
+---------------------------------------------------------------------------+
```

### 方案设计
实际上只要涉及到编辑器相关的内容，无论是富文本编辑器、图形编辑器等，都会比较复杂，其中的都涉及到了数据结构、选区模式、渲染性能等问题。而即使是个简单的输入框，也会涉及到其中的很多问题，因此我们必须要做好调研并且设计好方案。

开篇我们就讲述了为何`slate`可以实现这种交互，而其他的编辑器框架则不行，主要是因为`slate`的`inline`节点是特殊类型实现。具体来说，`slate`的`inline`节点是一个`children`数组，因此这里看起来是同个位置的选区可以通过`path`的不同区分，`child`内会多一层级。

```js
[
  {
    type: "paragraph",
    children: [{
      type: "badge",
      children: [{ text: "Approved" }],
    }],
  },
]
```

因此既然`slate`本身设计上支持这种选区行为，那么实现起来就会非常方便了。然而我对于`slate`编辑器实在是太熟悉了，也为`slate`提过一些`PR`，所以在这里我并不太想继续用`slate`实现，而恰好我一直在写 [从零实现富文本编辑器](https://github.com/WindRunnerMax/EveryDay/blob/master/RichText/从零设计实现富文本编辑器.md) 的系列文章，因此用自己做的框架`BlockKit`实现是个不错的选择。

而实际上，用`slate`的实现并非完全没有问题，主要是`slate`的数据结构完全支持任意层级的嵌套，那么也就是说，我们必须要用很多策略来限制用户的行为。例如我们复制了嵌入节点，是完全可以将其贴入到其他块结构内，造成更多级别的`children`嵌套，类似这种情况必须要写完善的`normalize`方法处理。

那么在`BlockKit`中并不支持多层级的嵌套，因为我们的选区设计是线性的结构，即使有多个标签并列，大多数情况下我们会认为选区是在偏左的`DOM`节点末尾。而由于某些情况下节点在浏览器中的特殊表现，例如`Embed`类型的节点，我们才会将光标放置在偏右的`DOM`位置。

```js
// 左偏选区设计
{ offset: 4 }
// <em>text[caret]</em><strong>text</strong>
{ offset: 5 }
// <em>text</em><strong>t[caret]ext</strong>
```

因此我们必须要想办法支持这个行为，而更改架构设计则是不可行的，毕竟如果需要修改诸如选区模式、数据结构等模块，就相当于修改了地基，上层的所有模块都需要重新适配。因此我们需要通过其他方式来实现这个功能，而且还需要在整体编辑器的架构设计基础上实现。

那么这里的本质问题是我们的编辑器不支持独立的空结构，其中主要是没有办法额外表示一个选区位置，如果能够通过某些方式独立表达选区位置，理论上就可以实现这个功能。沿着这个思路，我们可以比较容易地想出来下面的两个方式:

1. 在变量块周围维护配对的`Embed`节点，即通过额外的节点构造出新的选区位置，再来适配编辑器的相关行为。
2. 变量块本身通过独立的`Editable`节点实现，相当于脱离编辑器本身的控制，同样需要适配内部编辑的相关行为。

方案`1`的优点是其本身并不会脱离编辑器的控制，整体的选区、历史记录等操作都可以被编辑器本身管理。缺点是需要额外维护`Embed`节点，整体实现会比较复杂，例如删除末尾`Embed`节点时需要配对删除前方的节点、粘贴的时候也需要避免节点被重复插入、需要额外的包装节点处理样式等。

方案`2`的优点是维护了独立的节点，在`DOM`层面上不需要额外的处理，将其作为普通可编辑的`Embed`节点即可。缺点是脱离了编辑器框架本身的控制，必须要额外处理选区、历史记录等操作，相当于本身实现了内部的不受控的新编辑器，独立出来的编辑区域自然需要额外的`Case`需要处理。

最终比较起来，我们还是选择了方案`2`，主要是其实现起来会比较简单，并且不需要额外维护复杂的约定式节点结构。虽然脱离了编辑器本身的控制，但是我们可以通过事件将其选区、历史记录等操作同步到编辑器本身，相当于半受控处理，虽然会有一些边界情况需要处理，但是整体实现起来还比较可控。

### Editable 组件
那么在方案`2`的基础上，我们就首先需要实现一个`Editable`组件，来实现变量块的内容编辑。由于变量块的内容并不需要支持任何加粗等操作，因此这里我们并不需要嵌套富文本编辑器本身，而是只需要支持一个纯文本的可编辑区域即可，通过事件通信的形式实现半受控处理。

因此在这里我们就只需要一个`span`标签，并且设置其`contenteditable`属性为`true`即可。至于为什么不使用`input`来实现文本的输入框，主要是`input`的宽度跟随文本长度变化需要自己测量，而直接使用可编辑的`span`标签是天然支持的。

```js
<div
  className="block-kit-editable-text"
  contentEditable
  suppressContentEditableWarning
></div>
```

可输入的变量框就简单地实现出来了，而仅仅是可以输入文本并不够，我们还需要空内容时的占位符。由于`Editable`节点本身并不支持`placeholder`属性，因此我们必须要自行注入`DOM`节点，而且还需要避免占位符节点被选中、复制等，这种情况下伪元素是最合适的选择。

```css
.block-kit-editable-text {
  display: inline-block;
  outline: none;

  &::after {
    content: attr(data-vars-placeholder);
    cursor: text;
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }
}
```

当然`placeholder`的值可以是动态设置的，并且`placeholder`也仅仅是在内容为空时才会显示，因此我们还需要监听`input`事件来动态设置`data-vars-placeholder`属性。

```js
const showPlaceholder = !value && placeholder && !isComposing;
<div
  className="block-kit-editable-text"
  data-vars-placeholder={showPlaceholder ? placeholder : void 0}
></div>
```

这里的`isComposing`状态可以注意一下，这个状态是用来处理输入法`IME`的。当唤醒输入法输入的时候，编辑器通常会处于一个不受控的状态，这点我们先前在处理输入的文章中讨论过，然而此时文本区域是存在候选词的，因此这个情况下不应该显示占位符。

```js
const [isComposing, setIsComposing] = useState(false);
const onCompositionStart = useMemoFn(() => {
  setIsComposing(true);
});

const onCompositionEnd = useMemoFn((e: CompositionEvent) => {
  setIsComposing(false);
});
```

接下来需要处理内容的输入，在此处的半受控主要是指的我们并不依靠`BeforeInput`事件来阻止用户输入，而是在允许用户输入后，主动通过`onChange`事件将内容同步到外部。而外部编辑器接收到变更后，会触发该节点的`rerender`，在这里我们再检查内容是否一致决定更新行为。

在这里不使用`input`标签其实也会存在一些问题，主要是`DOM`标签本身内部是可以写入很多复杂的`HTML`内容的，而这里我们是希望将其仅仅作为普通的文本输入框来使用，因此我们在检查到`DOM`节点不符合要求的时候，需要将其重置为纯文本内容。

```js
useEffect(() => {
  if (!editNode) return void 0;
  if (isDOMText(editNode.firstChild)) {
    if (editNode.firstChild.nodeValue !== props.value) {
      editNode.firstChild.nodeValue = props.value;
    }
    for (let i = 1, len = editNode.childNodes.length; i < len; i++) {
      const child = editNode.childNodes[i];
      child && child.remove();
    }
  } else {
    editNode.innerText = props.value;
  }
}, [props.value, editNode]);

const onInput = useMemoFn((e: InputEvent) => {
  if (e.isComposing || isNil(editNode)) {
    return void 0;
  }
  const newValue = editNode.textContent || "";
  newValue !== value && onChange(newValue);
});
```

对于避免`Editable`节点出现非文本的`HTML`内容，我们还需要在`onPaste`事件中阻止用户粘贴非文本内容，这里需要阻止默认行为，并且将纯文本的内容提取出来重新插入。这里还涉及到了使用旧版的浏览器`API`，实际上`L0`的编辑器就是基于这些旧版的浏览器`API`实现的，例如`pell`编辑器。

此外，我们还需要避免用户按下`Enter`键导致换行，在`Editable`里回车各大浏览的支持都不一致，因此这里即使是真的需要支持换行，我们也最好是使用`\n`来作为软换行使用，然后将`white-space`设置为`pre-wrap`来实现换行。我们可以回顾一下浏览器的不同行为:

- 在空`contenteditable`编辑器的情况下，直接按下回车键，在`Chrome`中的表现是会插入`<div><br></div>`，而在`FireFox(<60)`中的表现是会插入`<br>`，`IE`中的表现是会插入`<p><br></p>`。
- 在有文本的编辑器中，如果在文本中间插入回车例如`123|123`，在`Chrome`中的表现内容是`123<div>123</div>`，而在`FireFox`中的表现则是会将内容格式化为`<div>123</div><div>123</div>`。
- 同样在有文本的编辑器中，如果在文本中间插入回车后再删除回车，例如`123|123->123123`，在`Chrome`中的表现内容会恢复原本的`123123`，而在`FireFox`中的表现则是会变为`<div>123123</div>`。

```js
const onPaste = useMemoFn((e: ClipboardEvent) => {
  preventNativeEvent(e);
  const clipboardData = e.clipboardData;
  if (!clipboardData) return void 0;
  const text = clipboardData.getData(TEXT_PLAIN) || "";
  document.execCommand("insertText", false, text.replace(/\n/g, " "));
});

const onKeyDown = useMemoFn((e: KeyboardEvent) => {
  if (isKeyCode(e, KEY_CODE.ENTER) || isKeyCode(e, KEY_CODE.TAB)) {
    preventNativeEvent(e);
    return void 0;
  }
})
```

至此`Editable`变量组件就基本实现完成了，接下来我们就可以实现一个变量块插件，将其作为`Embed`节点`Schema`集合进编辑器框架当中。在编辑器的插件化中，我们主要是将当前的值传递到编辑组件中，并且在`onChange`事件中将变更同步到编辑器本身，这就非常类似于表单的输入框处理了。

```js
export class EditableInputPlugin extends EditorPlugin {
  public key = VARS_KEY;
  public options: EditableInputOptions;

  constructor(options?: EditableInputOptions) {
    super();
    this.options = options || {};
  }
  public destroy(): void {}

  public match(attrs: AttributeMap): boolean {
    return !!attrs[VARS_KEY];
  }

  public onTextChange(leaf: LeafState, value: string, event: InputEvent) {
    const rawRange = leaf.toRawRange();
    if (!rawRange) return void 0;
    const delta = new Delta().retain(rawRange.start).retain(rawRange.len, { [VARS_VALUE_KEY]: value });
    this.editor.state.apply(delta, { autoCaret: false, });
  }

  public renderLeaf(context: ReactLeafContext): React.ReactNode {
    const { attributes: attrs = {} } = context;
    const varKey = attrs[VARS_KEY];
    const placeholders = this.options.placeholders || {};
    return (
      <Embed context={context}>
        <EditableTextInput
          className={cs(VARS_CLS_PREFIX, `${VARS_CLS_PREFIX}-${varKey}`)}
          value={attrs[VARS_VALUE_KEY] || ""}
          placeholder={placeholders[varKey]}
          onChange={(v, e) => this.onTextChange(context.leafState, v, e)}
        ></EditableTextInput>
      </Embed>
    );
  }
}
```

然而，当我们将`Editable`节点集成后出现了问题，特别是选区无法设置到变量编辑节点内。主要是这里的选区会不受编辑器控制，因此我们还需要在编辑器的核心包里，避免选区被编辑器框架强行拉取到`leaf`节点上，这还是需要编辑器本身支持的。

同样的，很多事件同样需要避免编辑器框架本身处理，得益于浏览器`DOM`事件流的设计，我们可以比较轻松地通过阻止事件冒泡来避免编辑器框架处理这些事件。当然还有一些不冒泡的如`Focus`等事件，以及`SelectionChange`等全局事件，我们还需要在编辑器本身的事件中心中处理这些事件。

```js
/**
 * 独立节点嵌入 HOC
 * - 独立区域 完全隔离相关事件
 * @param props
 */
export const Isolate: FC<IsolateProps> = props => {
  const [ref, setRef] = useState<HTMLSpanElement | null>(null);

  useEffect(() => {
    // 阻止事件冒泡
  }, [ref]);

  return (
    <span
      ref={setRef}
      {...{ [ISOLATED_KEY]: true }}
      contentEditable={false}
    >
      {props.children}
    </span>
  );
};
```

```js
/**
 * 判断选区变更时, 是否需要忽略该变更
 * @param node
 * @param root
 */
export const isNeedIgnoreRangeDOM = (node: DOMNode, root: HTMLDivElement) => {
  for (let n: DOMNode | null = node; n !== root; n = n.parentNode) {
    // node 节点向上查找到 body, 说明 node 并非在 root 下, 忽略选区变更
    if (!n || n === document.body || n === document.documentElement) {
      return true;
    }
    // 如果是 ISOLATED_KEY 的元素, 则忽略选区变更
    if (isDOMElement(n) && n.hasAttribute(ISOLATED_KEY)) {
      return true;
    }
  }
  return false;
};
```

到这里，模板输入框基本已经实现完成了，在实际使用中问题太大的问题。然而在测试兼容性时发现一个细节，在`Firefox`和`Safari`中，按下方向键从非变量节点跳到变量节点时，不一定能够成功跳入或者跳出，具体的表现在不同的浏览器都有差异，只有`Chrome`是完全正常的。

因此为了兼容浏览器的处理，我们还需要在`KeyDown`事件中主动处理在边界上的跳转行为。这部分的实现是需要适配编辑器本身的实现的，需要完全根据`DOM`节点来处理新的选区位置，因此这里的实现主要是根据预设的`DOM`结构类型来处理，这里实现代码比较多，因此举个左键跳出变量块的例子。

```js
const onKeyDown = useMemoFn((e: KeyboardEvent) => {
  LEFT_ARROW_KEY: if (
    !readonly &&
    isKeyCode(e, KEY_CODE.LEFT) &&
    sel &&
    sel.isCollapsed &&
    sel.anchorOffset === 0 &&
    sel.anchorNode &&
    sel.anchorNode.parentElement &&
    sel.anchorNode.parentElement.closest(`[${LEAF_KEY}]`)
  ) {
    const leafNode = sel.anchorNode.parentElement.closest(`[${LEAF_KEY}]`)!;
    const prevNode = leafNode.previousSibling;
    if (!isDOMElement(prevNode) || !prevNode.hasAttribute(LEAF_KEY)) {
      break LEFT_ARROW_KEY;
    }
    const selector = `span[${LEAF_STRING}], span[${ZERO_SPACE_KEY}]`;
    const focusNode = prevNode.querySelector(selector);
    if (!focusNode || !isDOMText(focusNode.firstChild)) {
      break LEFT_ARROW_KEY;
    }
    const text = focusNode.firstChild;
    sel.setBaseAndExtent(text, text.length, text, text.length);
    preventNativeEvent(e);
  }
})
```

最后，我们还需要处理`History`的相关操作，由于变量块本身是脱离编辑器框架的，选区实际上是并没有被编辑器本身感知的。所以这里的`undo`、`redo`等操作实际上是无法处理变量块选区的变更，因此这里我们就简单处理一下，避免输入组件`undo`本身的操作被记录到编辑器内。

```js
public onTextChange(leaf: LeafState, value: string, event: InputEvent) {
  this.editor.state.apply(delta, {
    autoCaret: false,
    // 即使不记录到 History 模块, 仍然存在部分问题
    // 但若是受控处理, 则又存在焦点问题, 因为此时焦点并不在编辑器
    undoable: event.inputType !== "historyUndo" && event.inputType !== "historyRedo",
  });
}
```

### 选择器组件
选择器组件主要是固定变量的值，例如上述的的例子中我们将篇幅这个变量固定为短篇、中篇、长篇等选项。这里的实现就比较简单了，主要是选择器组件本身不需要处理选区的问题，其本身就是常规的`Embed`类型节点，因此只需要实现选择器组件，并且在`onChange`事件中将值同步到编辑器本身即可。

```js
export class SelectorInputPlugin extends EditorPlugin {
  public key = SEL_KEY;
  public options: SelectorPluginOptions;

  constructor(options?: SelectorPluginOptions) {
    super();
    this.options = options || {};
  }

  public destroy(): void {}

  public match(attrs: AttributeMap): boolean {
    return !!attrs[SEL_KEY];
  }

  public onValueChange(leaf: LeafState, v: string) {
    const rawRange = leaf.toRawRange();
    if (!rawRange) return void 0;
    const delta = new Delta().retain(rawRange.start).retain(rawRange.len, {
      [SEL_VALUE_KEY]: v,
    });
    this.editor.state.apply(delta, { autoCaret: false });
  }

  public renderLeaf(context: ReactLeafContext): React.ReactNode {
    const { attributes: attrs = {} } = context;
    const selKey = attrs[SEL_KEY];
    const value = attrs[SEL_VALUE_KEY] || "";
    const options = this.options.selector || {};
    return (
      <Embed context={context}>
        <SelectorInput
          value={value}
          optionsWidth={this.options.optionsWidth || SEL_OPTIONS_WIDTH}
          onChange={(v: string) => this.onValueChange(context.leafState, v)}
          options={options[selKey] || [value]}
        />
      </Embed>
    );
  }
}
```

`SelectorInput`组件则是常规的选择器组件，这里需要注意的是避免该组件被浏览器的选区处理，因此会在`MouseDown`事件中阻止默认行为。而弹出层的`DOM`节点则是通过`Portal`的形式挂载到编辑器外部的节点上，这样自然不会被选区影响。

```js
export const SelectorInput: FC<{ value: string; options: string[]; optionsWidth: number; onChange: (v: string) => void; }> = props => {
  const { editor } = useEditorStatic();
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (isOpen) {
      MountNode.unmount(editor, SEL_KEY);
    } else {
      const target = (e.target as HTMLSpanElement).closest(`[${VOID_KEY}]`);
      if (!target) return void 0;
      const rect = target.getBoundingClientRect();
      const onChange = (v: string) => {
        props.onChange && props.onChange(v);
        MountNode.unmount(editor, SEL_KEY);
        setIsOpen(false);
      };
      const Element = (
        <SelectorOptions
          value={props.value}
          width={props.optionsWidth}
          left={rect.left + rect.width / 2 - props.optionsWidth / 2}
          top={rect.top + rect.height}
          options={props.options}
          onChange={onChange}
        ></SelectorOptions>
      );
      MountNode.mount(editor, SEL_KEY, Element);
      const onMouseDown = () => {
        setIsOpen(false);
        MountNode.unmount(editor, SEL_KEY);
        document.removeEventListener(EDITOR_EVENT.MOUSE_DOWN, onMouseDown);
      };
      document.addEventListener(EDITOR_EVENT.MOUSE_DOWN, onMouseDown);
    }
    setIsOpen(!isOpen);
  };

  return (
    <span className="editable-selector" onMouseDownCapture={preventReactEvent} onClick={onOpen}>
      {props.value}
    </span>
  );
};
```

## 总结
在本文中我们调研了用户`Prompt`输入的相关场景实现，且讨论了纯文本输入框模式、表单模版输入模式，还观察了一些有趣的实现方案。最后重点基于富文本编辑器实现了变量模板输入框，特别适配了我们从零实现的编辑器框架`BlockKit`，并且实现了`Editable`变量块、选择器变量块等插件。

实际上引入富文本编辑器总是会比较复杂，在简单的场景下直接使用`Editable`自然也是可行的，特别是类似这种简单的输入框场景，无需处理复杂的性能问题。然而若是要实现更复杂的交互形式，以及多种块结构、插件化策略等，使用富文本编辑器框架还是更好的选择，否则最终还是向着编辑器实现了。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考
- <https://www.doubao.com/chat/write>
- <https://www.shadcn.io/ai/prompt-input>
- <https://github.com/ant-design/x/issues/807>
- <https://loop.coze.cn/open/docs/cozeloop/prompt>
- <https://github.com/WindRunnerMax/BlockKit/tree/master/examples/variable>
- <https://dev.to/gianna/how-to-build-a-prompt-friendly-ui-with-react-typescript-2766>
