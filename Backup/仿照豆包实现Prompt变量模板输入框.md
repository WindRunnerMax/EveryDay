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

对于类似的光标位置问题，开源的编辑器编辑器例如`Quill`、`Lexical`等，甚至商业化的飞书文档、`Notion`都没有直接支持这种模式。这些编辑器的`schema`设计都是两个字符间仅会存在一个`caret`的光标插入点，验证起来也很简单，只要看能否单独插入一个空内容的`inline`节点即可。

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
在这里更有趣的是`GitHub`的搜索输入框，在使用综合搜索、`issue`搜索等功能时，我们可以看到如果关键词不会会被高亮。例如`is:issue state:open `时，`issue`和`open`会被高亮，而`F12`检查时发现其仅是使用`input`标签，并没有引入富文本编辑器。

在这里`GitHub`的实现方式就非常有趣，实际上是使用了`div`渲染格式样式，来实现高亮的效果，然后使用透明的`input`标签来实现输入交互。如果在`F12`检查时将`input`节点的`color`透明隐藏掉，就可以发现文本的内容重叠了起来，我们也实现一个类似的效果:

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
  /* 可能存在滚动条的情况, 该情况就不处理了 */
  .container { position: relative; width: 800px; border: 1px solid #aaa; }
  .container > * { width: 800px; height: 30px; font-size: 16px; box-sizing: border-box; }
  .overlay { pointer-events: none; position: absolute; left: 0; top: 0; height: 100%; width: 100%; }
  .overlay { display: inline-block; white-space: pre; }
  .input { padding: 0; border-width: 0; outline: none; }
</style>

```

## 表单变量模板
PRD

### 表单模板
，并且适用于比较长的`Prompt`模版场景

### 行内变量块

## 变量模板输入框
适用于较短的`Prompt`模版场景

### 方案设计
`slate`编辑器实现起来虽然比较方便

### Editable 组件

### 选择器组件


## 总结
在本文中我们基于富文本编辑器实现了变量模板输入框，

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
