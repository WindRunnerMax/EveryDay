# 基于MdIt的无序列表折叠插件
当前`Markdown`已经成为最好的编程语言，同样的`Md`也成为了产品文档最需要支持的格式，特别是面向开发者的文档。实际上很多情况下编程和文档的场景是非常类似的，因此在时代的推动下，原生支持`Md`生产和消费的文档系统的需求重新出现。

在这里我们关注于`API`文档类型的展示，在`OpenAI`、`Claude`的`API`文档中，可以看到其表达参数列表的形式类似折叠列表。而观察原始的`Md`文档，就可以看出其参数列表的形式是无序列表，因此我们也实现类似的功能来将无序列表转换为折叠列表展示。

实际上，将无序列表渲染成折叠列表这件事，本身还是面向开发者阅读的，如果单纯是面向`AI`来消费，则仅提供纯文本的`Md`内容即可。目前来看，同时需要面向开发者和`AI`的状态应该还需要存在较长的时间，因此实现一套`Md`渲染器还是有必要的。

## 解析规则
首先我们需要分析无序列表结构及其解析后的`HTML`，基本的无序列表结构如下所示:

```md
- 0 
- 1 
  - 1.1 
  - 1.2 
    - 1.2.1 
    - 1.2.2 
  - 1.3 
    with desc
    - 1.3.1 
    - 1.3.2 
- 2
```

```html
<ul>
  <li>0</li>
  <li> 1
    <ul>
      <li>1.1</li>
      <li> 1.2
        <ul>
          <li>1.2.1</li>
          <li>1.2.2</li>
        </ul>
      </li>
      <li> 1.3 <br /> with desc
        <ul>
          <li>1.3.1</li>
          <li>1.3.2</li>
        </ul>
      </li>
    </ul>
  </li>
  <li>2</li>
</ul>
```

可以看出示例中存在三级`ul`元素结构嵌套，以及描述内容的`li`元素，我们需要根据不同的情况来解析。理论上而言，只有存在嵌套结构的`li`元素才需要解析为折叠结构，其子元素内起始到`ul`之间的内容需要作为标题，`ul`内元素则作为折叠展开的内容。

通常来说，实现类似手风琴的效果，大概会主动管理状态，用`div`等元素来绘制折叠面板，然后主动处理点击事件，来切换折叠展开的状态。不过，`HTML`原生支持了`details`元素以及`summary`元素，我们可以借助原生元素来实现折叠列表的效果，其主要优点是:

- 简单易用，通常情况下不需要主动管理状态，仅需要维护`DOM`结构。
- 无需处理事件，特别是在`SSR`的情况下，不需要再`hydrate`注入事件。
- 原生支持搜索，使用浏览器搜索时，可以自动展开包含搜索关键词的折叠列表。

```html
<details>
  <summary>Details</summary>
  Something more.
</details>
```

那么根据以上的`HTML`结构，我们可以根据无序列表的结构，转换为`details+summary`元素的结构。观察其结构，我们可以实现如下转换规则:

- `ul`元素作为折叠展开的内容，这里可以自定义为`block`元素，也可以保持`ul`元素。
- 当`li`元素内存在嵌套的直属`ul`元素时，该`li`元素需要转换为`details`元素。
- 转换的`details`元素的子元素，从起始到`ul`元素之间的内容，需要包装`summary`元素。

根据上述的转换规则，我们可以将最开始的无序列表`HTML`内容转换为`details + summary`元素的结构:

```html
<ul>
  <li>0</li>
  <details>
    <summary>1</summary>
    <ul>
      <li>1.1</li>
      <details>
        <summary>1.2</summary>
        <ul>
          <li>1.2.1</li>
          <li>1.2.2</li>
        </ul>
      </details>
      <details>
        <summary>1.3 <br /> with desc</summary>
        <ul>
          <li>1.3.1</li>
          <li>1.3.2</li>
        </ul>
      </details>
    </ul>
  </details>
  <li>2</li>
</ul>
```

## 元素重建
在设计好`HTML`结构的转换规则后，我们需要在`MarkdownIt`的基础上实现转换逻辑。在`MdIt`中提供了诸多时机的`Hook`函数，我们需要根据处理的时机来实现转换逻辑，通常来说应该尽可能在后处理阶段来实现相关逻辑，这里我们分别实现解析后处理和渲染时处理。

### 渲染时处理
因此，我们首先来看仅渲染阶段的`rule`处理逻辑，在上述的转换规则中，将`ul`元素转换为`block`元素，以及将`li`元素渲染为`details`元素，这两点是没什么问题的。然而，为子节点包装`summary`元素，则是比较麻烦的。

在仅渲染阶段，这件事并非不能实现，但是却容易破坏`MdIt`的线性解析模式。如果这是个递归结构，则仅需要将其节点包一层`DOM`元素即可，而在线性结构中，包装一层`summary`元素需要在`li_open`追加`<summary>`元素，在`ul_open`前置`</summary>`元素。

```js
mdIt.renderer.rules.bullet_list_open = (tokens: Token[], idx: number) => {
  const current = tokens[idx];
  for (let i = idx - 1; i >= 0; i--) {
    const token = tokens[i];
    if (token.level < current.level - 1) break;
    if (token.type === "list_item_open" && token.level === current.level - 1) {
      return "</summary>" + "<ul class=\"bullet-summary-group\">";
    }
  }
  return "<ul class=\"bullet-summary-group\">";
};
mdIt.renderer.rules.list_item_open = (tokens: Token[], idx: number) => {
  const current = tokens[idx];
  for (let i = idx + 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.level <= current.level)  break;
    if (token.type === "bullet_list_open" && token.level === current.level + 1) {
      return "<details>" + "<summary>";
    }
  }
  return "<li>";
};
mdIt.renderer.rules.list_item_close = (tokens: Token[], idx: number) => {
  const prevToken = tokens[idx - 1];
  if (prevToken && prevToken.tag === "ul") return "</details>";
  return "</li>";
};
```

虽然这种模式实现起来简单，理论上也并没有什么问题。然而这里存在的问题是，如果我们需要判断大多情况下保持无序列表，仅表达`API`参数时才将其渲染为折叠列表，那么此时我们在`ul`元素上方添加`@bullet-summary`指令来指定渲染模式。

```md
@bullet-summary
- ul
   - li
   - li
```

那么此时问题在于，如何判断现在现在嵌入的`ul`元素需要渲染为折叠列表。那么在渲染时机，取得这个渲染指令并不是很容易，因为其本身是扁平的，那么每次调度`rule`渲染时，都需要迭代向上查找该指令。而如果在渲染时处理`p`元素的话，则在消费时实现写数据，有点反逻辑。

```js
mdIt.renderer.rules.list_item_open = (tokens: Token[], idx: number) => {
  const current = tokens[idx];
  for (let i = idx - 1; i >= 0; i--) {
    // 找到该组顶级 ul 元素, 检查其前置 @bullet-summary 指令 
  }
};

mdIt.renderer.rules.bullet_list_open = (tokens: Token[], idx: number) => {
  // 检查其前置元素是否为 @bullet-summary 指令, 此时在 env 设置变量
};
mdIt.renderer.rules.bullet_list_close = (tokens: Token[], idx: number) => {
  // 检查其匹配的 ul env 设置的环境变量, 此时在 env 清理环境变量
};
```

### 解析时处理
在`MdIt`的解析过程中，除了渲染时的`rule`处理逻辑，还可以在解析阶段后处理`Token`，此时可以找到相关指令再实现相关的转换逻辑。由于我们并不没有额外实现新的语法，指令更多是起到了标记的作用，因此不需要时机解析内容，而是重新组织`Tokens`。

那么此时，我们先来判断一下指令标记，如果匹配到了该标记，则需要进入到重建`Tokens`的阶段。不过在此之前，我们需要将该指令节点隐藏，不过如果渲染指令是注释类型的话，倒是可以直接隐藏而无需特殊处理。

```js
// paragraph_open
//   inline: @bullet-summary
// paragraph_close
// bullet_list_open
if (
  token.content === identifier &&
  token.type === "inline" &&
  nextToken &&
  nextStep2Token &&
  nextToken.type === "paragraph_close" &&
  nextStep2Token.type === "bullet_list_open"
) {
  prevToken && (prevToken.hidden = true);
  (token.hidden = true) && (token.children = []);
  nextToken && (nextToken.hidden = true);
  rebuildUlTokens(state, i + 2);
}
```

紧接着，我们需要找到该节点的对应`close`节点，以此来圈定具体需要处理的范围。说起来，由于`MdIt`的解析是线性的，虽然规避了递归的问题，但是最差情况下时间复杂度还是`O(n)`。此外，由于`token.level`并不太准确，因此还需要维护一个栈深度来记录当前的层级。

```js
const baseType = openToken.type.slice(0, -5);
const closeType = baseType + "_close";
// open      1
// start iterator
//   open    2
//   close   1
// close     0
// end iterator
let level = 1;
for (let i = openIdx + 1; i < tokens.length; i++) {
  const token = tokens[i];
  if (token.type === openToken.type) {
    level++;
  } else if (token.type === closeType) {
    level--;
    if (level <= 0) return i;
  }
}
return -1;
```

接下来，需要对`ul`元素做一些修改，主要是为`ul`加入`class`属性，用以指定样式。然后维护一个栈，来记录`li`元素相互对应的节点。此外，这里有个重要的点是要从后向前遍历，以免前置内容的修改影响后续节点的处理，特别是在插入元素的情况下。

```js
const stack: Token[] = [];
// 从后向前遍历, 避免修改后, 影响后续 i 遍历
for (let i = closeIdx; i >= startIdx; i--) {
  const token = tokens[i];
  if (token.type === "bullet_list_open") {
    token.attrJoin("class", "bullet-summary-group");
  }
  if (token.type === "list_item_close") {
    stack.push(token);
  }
  if (token.type === "list_item_open") {
    const peer = stack.pop();
    rebuildLiTokens(state, i, peer, actions);
  }
}
```

在匹配到`list_item_open`节点时，就需要重建`li`元素结构了，这部分就会更复杂一些。首先我们创建一个对应元素区域的迭代器，来遍历`open`到`close`之间的所有节点。迭代器中重要的实现是要携带相关的`meta`信息，辅助计算层级关系。

```js
let depth = 0;
for (let i = openIdx; i < tokens.length; i++) {
  const token = tokens[i];
  if (token.nesting >= 0) {
    depth++;
  }
  yield { token, depth: depth - 1, idx: i, serial: i - openIdx };
  if (token.nesting <= 0) {
    depth--;
    if (depth <= 0) break;
  }
}
```

在`li`节点区域遍历过程中，我们需要根据`depth`来判断其直属子元素。如果直属子元素为`ul`，则代表该`li`元素嵌套了无序列表，这样就需要将其转换为`details`元素。注意，这里修改其`type`不应该影响外层的栈，需要注意保持关系正确。

```js
// 查找 li 下的子项, 主要目的是检查其直属子元素
for (const node of walker) {
  const k = node.idx;
  const tokenK = node.token;
  if (node.depth !== 1) continue;
  // 直属的 ul 子项, 若是存在则需要转换为 details 组
  if (tokenK.type === "bullet_list_open") {
    // i 的 li 元素需要变为 details 元素
    liToken.type = "li_details_open";
    liToken.tag = "details";
  }
}
```

接下来，我们需要为`i - k`之间的元素创建`summary`元素，用以指定折叠标题。这里是最难以处理的点，因为不仅是修改内容，还需要插入新的`token`。并且需要对其`peer`节点进行处理，将其`token.type`转换为`li_details_close`元素。

```js
// 为 i - k 之间的元素创建 summary
const sOpen = new state.Token("li_summary_open", "summary", 1);
const sClose = new state.Token("li_summary_close", "summary", -1);
// 现在 peer 是 i 之后的元素, 不会影响原始遍历 li 的栈平衡
if (peer) {
  peer.type = "li_details_close";
  peer.tag = "details";
}
// 处理 summary 元素的插入位置
actions.push({ idx: openIdx + 1, token: sOpen });
actions.push({ idx: k, token: sClose });
```

上述的`actions`是需要关注的点，我们并不会直接修改`tokens`数组，因为此时修改`tokens`数组会导致其长度发生变化，从而影响到后续节点的遍历，以及插入位置的计算。在这里我们统一处理插入行为，这里需要关注的是按索引从大到小排序, 后索引的元素, 不影响前索引的元素。

```js
actions
  .sort((a, b) => b.idx - a.idx)
  .forEach(action => {
    tokens.splice(action.idx, 0, action.token);
  });
```

最后，由于我们插入了新的层级，我们需要将内部的`level`也更新一下。因此从这里也可以看出来`level`并不是那么准确，如果注册的插件并没有处理好`level`的话，则会影响到后续依赖该字段的插件。

```js
// 处理 summary 及其内部元素的 level
sOpen.level = liToken.level + 1;
sClose.level = liToken.level + 1;
for (let i = openIdx + 1; i < k; i++) {
  const token = tokens[i];
  token.level = (token.level || 0) + 1;
}
```

## CSS 样式
实际上，由于不同浏览器的`details + summary`元素的默认样式不同，因此需要对其样式进行统一化处理。不过，这部分主要是由组件库来实现的，我们只需要关注其基本功能即可。此外提一下，`summary`还是需要一个`border`样式的，特别是存在多行内容的情况下。

```css
/*
 * Add the correct display in Edge, IE 10+, and Firefox.
 */
details {
  display: block;
}

/*
 * Add the correct display in all browsers.
 */
summary {
  display: list-item;
}
```

## 总结
在这里我们基于`MdIt`，解析了基础的无序列表结构，并且观察了其层级关系，设计出了一套`DOM`结构转换规则。基于此分别使用纯渲染模式以及解析后处理模式，实现了无序列表折叠插件，这种结构表达在思维导图和`API`参数表达中非常有用。

实际上，我们实现的插件还有很多可以优化的地方。首先我们可以将结构化表达和渲染时表达结合起来，在解析后处理时仅需要将需要相关`token`写入标记，在渲染时处理标签结构即可。此外，结构处理写入的时候实际上应该将所有变更统一处理，以避免影响现有遍历和判断，理论上应该引入`OT-JSON`来处理各个变更之间的相互影响。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考
- <https://markdown-it.github.io/>
- <https://zhuanlan.zhihu.com/p/400036665>
- <https://juejin.cn/post/7598480413803757610>
- <https://markdown-it.github.io/markdown-it/>
- <https://github.com/mqyqingfeng/Blog/issues/254>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details>
- <https://developers.openai.com/api/reference/resources/responses/methods/create>
