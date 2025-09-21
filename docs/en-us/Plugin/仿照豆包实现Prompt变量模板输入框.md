# Implementing Prompt Variable Template Input Box Like Bean Pack
When using the `Web` version of Bean Pack, I found the template input box for entering `Prompt` in the "Help me write" module to be very useful. It not only retains the advantages of template input to fine-tune the specified writing direction but also allows for flexible editing without losing flexibility. The input interaction for the new dialog is also very detailed. For example, after selecting "music generation," the skill prompt itself is an embedded module of the editor and cannot be directly deleted.

Although this may seem like just a text content input box, implementing it is not as easy as it seems, and detailed interactions are also very important. For instance, having the skill prompt node act directly as a module of the input box itself allows for multi-line text to be formatted below the prompt, rather than needing to leave blank content on the left side as in a grid layout. Therefore, here we will use Bean Pack's interaction as an example to implement the `Prompt` variable template input box.

<details>
<summary><strong>AI Infra Series Related Articles</strong></summary>

- [Fetch-Based SSE Solution](../Browser/基于fetch的SSE方案.md)
- [Basic RAG Service Implementation Based on Vector Retrieval](./基于向量检索实现基础RAG服务.md)
- [Incremental Rich Text Parsing Algorithm for Streaming Markdown](./流式Markdown增量富文本解析算法.md)
- [Implementing Prompt Variable Template Input Box Like Bean Pack](./仿照豆包实现Prompt变量模板输入框.md)

</details>

## Overview
When developing applications related to `AI`, a common scenario is the need for users to input a `Prompt`, or to maintain `Prompt` templates for other users to use in the management backend. In such cases, we need an input box that supports content input or template variables. The common implementation methods include:

- Plain text input boxes, similar to `<input>`, `<textarea>`, and other tags, with interaction buttons such as images and tool selection implemented around their `DOM` structure.
- Form variable templates, resembling fill-in-the-blank forms where `Prompt` templates are filled with variables, and users only need to fill in the required variable content.
- Variable template input boxes, also resembling fill-in-the-blank forms, but other content can also be edited to fine-tune template variables and provide flexible instructions.

An interesting thing is that while Bean Pack's template input box is implemented with `slate`, the part that generates documents introduces a new rich text framework. This means that the editor framework for the step-by-step "document editor" mode is not the same as the editor framework for the template input box. Introducing multiple sets of editors will indeed have a significant impact on the application's size.

Therefore, the question of why the same implementation is not directly used is quite intriguing. Initially, it may have been thought that different business groups had different framework preferences. However, upon closer inspection, it is remembered that `slate` implements special types for `inline` nodes, where cursor can be placed on the left or right side within the `inline`, and importantly, the cursor can also be placed inside the `inline`.

This issue is crucial because without implementing an empty structure for cursor placement, it is challenging to achieve independent block structures. The implementation here is closely related to data structure and selection mode design. For adjacent two `DOM` node positions, if multiple selection positions need to be implemented, sufficient selection representation is required. Linear structures cannot represent them if there is no linear structure.

```js
// <em>text</em><strong>text</strong>

// Design for completely matching DOM structure
{ path: [0], offset: 4 } // Position 1
{ path: [1], offset: 0 } // Position 2

// Design for linear structure
{ offset: 4 } // Position 1
```

For similar cursor position problems, open-source editors such as `Quill`, `Lexical`, and even commercial ones like Feishu Docs, `Notion`, do not directly support this mode. The schema design of these editors allows only one cursor insertion point between two characters, which is easy to verify - just check if an empty content `inline` node can be inserted independently.

While our main goal here is to implement the form of a variable template input box, other forms are also very interesting. For example, highlighting in the search input box of `GitHub`, entering `Prompt` variables in CozeLoop, etc. Therefore, we will briefly describe these forms first and then focus on implementing the form of a variable template input box. The final implementation can be referred to in [BlockKit Variables](https://github.com/WindRunnerMax/BlockKit/tree/master/examples/variable) and [CodeSandbox](https://codesandbox.io/p/devbox/cycrdf).

## Plain Text Input Box
The form of a plain text input box is quite common, for example, `<input>`, `<textarea>`, and other tags. The input boxes we use in our daily lives are similar in form, such as the simple `textarea` tag in DeepSeek. Of course, there are also rich text editor input box forms, like the input box in Gemini, but the overall form is basically the same.

### Text Input
The form of a simple text input box is naturally the simplest to implement, just using the `textarea` tag, but some control forms need to be implemented here, such as automatically calculating text height. Furthermore, some additional interactions need to be implemented based on business requirements, such as image uploads, online searches, file references, deep thinking, etc.

```
+-------------------------------------------+
|                                           |
| DeepThink   Search                      ↑ |
+-------------------------------------------+
```

### Text Highlight Matching
One interesting aspect here is the search input box on GitHub. When using features like comprehensive search or issue search, we can see that keywords that match will be highlighted. For example, when using `is:issue state:open`, `issue` and `open` will be highlighted, but upon inspecting with F12, it's revealed that only an `input` tag is used without introducing a rich text editor.

GitHub's approach here is quite intriguing. In reality, they use `div` to render formatting styles to achieve the highlighting effect, then use a transparent `input` tag for interaction input. If you hide the `color` of the `input` node in the F12 inspection, you'll notice that the text content overlaps. The key point is how to align the text using CSS.

We can also achieve a similar effect by focusing on font, text alignment, and avoiding event responses on overlays. Otherwise, clicking the mouse might land on the overlay `div` instead of the `input`, preventing input. There are other details to consider, such as the presence of a scrollbar, but for brevity, we won't address those here.

```html
<div class="container">
  <div id="$$1" class="overlay"></div>
  <input id="$$2" type="text" class="input" value="Variable text{{vars}}content" />
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

## Form Variable Template
The format of variable templates is very similar to that of forms. This pattern is very suitable for specific fixed prompt templates or specific tasks. Another interesting thing is that this format is also suitable for progressive iteration without AI capabilities. For instance, in scenarios like document translation, where the original interaction format was submitting a translation form task, you can transform the form format into a prompt template here.

### Form Template
The interactive format of form templates is relatively simple. Usually, the left part consists of pure text with reserved variable placeholders, while the right part dynamically constructs a form based on the text content. CozeLoop has a similar implementation form. Apart from regular form submissions, incorporating this interactive format into LLms for process orchestration to create pipelines accessible to other users is also a common scenario.

Additionally, form templates are suitable for longer prompt template scenarios. From a usability standpoint, users can easily focus on filling variables without needing to carefully read the provided prompt template. Furthermore, this format allows for variable reuse, meaning the same variable can be used in multiple places.

```html
+--------------------------------------------------+------------------------+
| Please help me write an article about {{topic}},    | Topic: _______________ |
| including the following points: {{points}},         | Points: ______________ |
| in a writing style that matches {{style}},           | Style: _______________ |
| with a length of {{length}}, and it should have     | Length: ______________ |
| an engaging title.                                  |                        |
+--------------------------------------------------+------------------------+
```

### Inline Variable Blocks
Inline variable blocks act as content placeholders for filling in the blanks. In comparison to form templates, inline variable blocks tend to lean towards shorter 'Prompt' templates. The entire 'Prompt' template is treated as a whole, while the variable blocks exist as independent blocks within lines. Users can click directly on the variable blocks to edit content. Note that in this context, only the content within the variable blocks is editable, the template text cannot be edited.

```html
+---------------------------------------------------------------------------+
| Please help me write an article about {{topic}},                             |
| including the following points: {{points}},                                 |
| in a writing style that matches {{style}},                                  |
| with a length of {{length}}, and it should have an engaging title.         |
+---------------------------------------------------------------------------+
```

The major difference here compared to bean bag variable template input boxes is that non-variable blocks are not editable. For simplicity, regular text is displayed using 'span' elements, while variable nodes use editable 'input' tags. Everything seems fine at first glance, but we need to address its automatic width, similar to the implementation in 'arco'. Otherwise, the interaction will be quite poor.

In reality, achieving automatic width with 'input' is not that straightforward. Typically, in such cases, an additional 'div' node is required to calculate width in sync with text, similar to the implementation of the 'GitHub' search input box we discussed earlier. So here, we use 'Editable' 'span' nodes to enable content editing. However, other issues need to be handled too, such as avoiding line breaks, pasting, etc.

```html
<div id="$$0" class="container"><span>Please help me write an article about</span><span class="input" placeholder="{{topic}}" ></span><span>including the following points:</span><span class="input" placeholder="{{points}}" ></span><span>, in a writing style that matches</span><span class="input" placeholder="{{style}}" ></span><span>, with a length of</span><span class="input" placeholder="{{length}}" ></span><span>, and it should have an engaging title.</span></div>
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

## Variable Template Input Box
The variable template input box can be seen as an extension of the aforementioned implementation, mainly supporting text editing, which usually requires the incorporation of a rich text editor. Therefore, this pattern is also suitable for shorter `Prompt` template scenarios, allowing users to make flexible adjustments based on the template, referencing the effect demonstrated in the [DEMO](https://windrunnermax.github.io/BlockKit/variable.html) below.

```
+---------------------------------------------------------------------------+
| I am a {{role}}, help me write an article about {{theme}} for {{platform}}, |
| following the writing style of this platform, with a length of {{space}}.    |
+---------------------------------------------------------------------------+
```

### Solution Design
In reality, whenever it involves editor-related content, such as rich text editors, graphic editors, etc., the complexity increases. This includes data structures, selection modes, rendering performance, and more. Even with a simple input box, many issues need to be addressed, so thorough research and well-thought-out design are necessary.

At the outset, we discussed why `slate` can achieve this interaction while other editor frameworks cannot. This is mainly because `slate`'s `inline` nodes are implemented as a special type. Specifically, `slate`'s `inline` nodes are an array of `children`, allowing for differentiation in selection at the same position through distinct `paths`, creating an additional level within `children`.

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

Since `slate` natively supports this selection behavior, implementation becomes straightforward. However, as I am very familiar with `slate` editor and have contributed some pull requests to `slate`, I prefer not to continue using `slate` in this case. Luckily, I have been writing a series of articles on [Building a Rich Text Editor from Scratch](https://github.com/WindRunnerMax/EveryDay/blob/master/RichText/从零设计实现富文本编辑器.md), using my own framework `BlockKit` is a great alternative.

In practice, although using `slate` for implementation is not without issues, primarily because `slate`'s data structure fully supports nesting at any level. Therefore, strict strategies are required to limit user behavior. For instance, if a node is copied and pasted into a different block structure, resulting in more levels of `children` nesting, a comprehensive `normalize` method becomes essential to handle such cases.

Unlike `slate`, `BlockKit` does not support multilevel nesting. Our selection design follows a linear structure, where even with multiple tags in parallel, the selection is mostly considered to be at the end of the left-leaning `DOM` node. However, in certain scenarios where nodes exhibit specific behavior in browsers, like `Embed` node types, the cursor may be positioned towards the right in the `DOM`.

```js
// Left-leaning selection design
{ offset: 4 }
// <em>text[caret]</em><strong>text</strong>
{ offset: 5 }
// <em>text</em><strong>t[caret]ext</strong>
```

Therefore, a solution must be devised to support this behavior without altering the architectural design significantly. To achieve this, the editing framework must allow for independent empty structures, which mainly involves finding a way to represent a selection position uniquely. Along this line of thought, two straightforward approaches come to mind:

1. Maintain paired `Embed` nodes around the variable block, using additional nodes to create new selection positions, and then adapting editor behavior accordingly.
2. Implement the variable block itself using an independent `Editable` node, effectively detached from the editor's control, hence requiring adjustments for internal editing behaviors.

The advantage of approach `1` lies in its continuity within the editor's control framework, facilitating management of overall selections, history, and other operations by the editor itself. However, the downside is the need for extra maintenance of `Embed` nodes, resulting in a more intricate implementation - requiring considerations like pairing deletion of the preceding node when deleting the trailing `Embed` node, preventing duplicate insertion when pasting, and additional node wrapping for styling.

On the other hand, the benefit of approach `2` is that it maintains independent nodes which, at the `DOM` level, do not require additional handling and can be treated as regular editable `Embed` nodes. However, its drawback is the disconnection from the editor framework, necessitating separate handling of selection, history, and related operations - effectively creating an independently managed new editor within the framework. The isolated editing area naturally requires additional processing for unique cases.

In the end, when we compared them, we opted for Scheme `2`. The main reason is that its implementation is relatively straightforward, and it doesn't require maintaining a complex convention-based node structure. Even though it is detached from the editor's direct control, we can synchronize operations like selection, history, etc., to the editor itself through events, making it a semi-controlled process. Although there are some edge cases to handle, overall it is quite manageable.

### Editable Component

So, building upon Scheme `2`, the first thing we need to do is create an `Editable` component to facilitate the editing of variable blocks. Since the content of these blocks doesn't require support for text formatting like bold, we don't need to embed the rich text editor itself. Instead, a plain text editable area will suffice. This can be achieved through event-based communication for semi-controlled handling.

Therefore, all we need here is a `span` tag with its `contenteditable` attribute set to `true`. As for why we opt for a `span` tag rather than an `input` for text input, it's mainly because `input` elements would require manual width adjustment as text length changes, whereas `span` tags with `contenteditable` attribute handle this naturally.

```js
<div
  className="block-kit-editable-text"
  contentEditable
  suppressContentEditableWarning
></div>
```

With this, the editable variable block is now in place. But merely allowing text input isn't sufficient; we also need a placeholder for when the content is empty. Since the `Editable` node itself doesn't support the `placeholder` attribute, we have to inject the placeholder as a `DOM` node. Furthermore, we need to ensure that the placeholder node remains unselectable and uncopyable, making pseudo-elements the most suitable choice.

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

It's worth noting that the placeholder value can be dynamically set and is only displayed when the content is empty. Hence, we must listen for `input` events to dynamically adjust the `data-vars-placeholder` attribute.

```js
const showPlaceholder = !value && placeholder && !isComposing;
<div
  className="block-kit-editable-text"
  data-vars-placeholder={showPlaceholder ? placeholder : void 0}
></div>
```

Keep an eye on the `isComposing` state. This state is used to handle the Input Method Editor (`IME`). When the IME is activated for text input, the editor is typically in an uncontrolled state. As previously discussed in handling input, text areas in this state should not display the placeholder while there are candidate words available.

```js
const [isComposing, setIsComposing] = useState(false);
const onCompositionStart = useMemoFn(() => {
  setIsComposing(true);
});

const onCompositionEnd = useMemoFn((e: CompositionEvent) => {
  setIsComposing(false);
});
```

Next, we need to deal with content input. Here, the semi-controlled approach means that we don't rely on the `BeforeInput` event to prevent user input. Instead, we actively synchronize the content to the outside through the `onChange` event after allowing user input. The external editor, upon receiving the changes, triggers a re-render of the node, where we then check if the content matches to determine the update action.

Furthermore, using an `input` tag could lead to some issues since the `DOM` element itself can handle complex `HTML` content. However, here we aim to use it solely as a plain text input box. So, if we find that the `DOM` node doesn't meet our requirements, we need to reset it to plain text content.

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
```

```js
const onInput = useMemoFn((e: InputEvent) => {
  if (e.isComposing || isNil(editNode)) {
    return void 0;
  }
  const newValue = editNode.textContent || "";
  newValue !== value && onChange(newValue);
});
```

When it comes to avoiding non-text HTML content in the `Editable` node, we also need to prevent users from pasting non-text content in the `onPaste` event. Here, we should prevent the default behavior and extract the plain text content to reinsert it. This also involves using old browser `APIs`, as the `L0` editor is actually based on these old browser `APIs`, such as the `pell` editor.

Additionally, we need to prevent users from pressing the `Enter` key, causing line breaks. The support for Enter key behavior in `Editable` varies among major browsers. Therefore, even if we truly need to support line breaks, it is best to use `\n` for soft line breaks and then set `white-space` to `pre-wrap` to achieve line breaks. Let's revisit the different browser behaviors:

- In an empty `contenteditable` editor, pressing Enter directly will insert `<div><br></div>` in Chrome, `<br>` in FireFox (<60), and `<p><br></p>` in IE.
- In an editor with text, inserting Enter in the middle of text like `123|123`, in Chrome will display `123<div>123</div>`, while FireFox will format it as `<div>123</div><div>123</div>`.
- Similarly, in an editor with text, if Enter is inserted in the middle of text and then deleted, for example `123|123->123123`, in Chrome it will revert to the original `123123`, while in FireFox it will become `<div>123123</div>`.

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

With this, the `Editable` variable component is basically completed. Next, we can implement a variable block plugin and include it as an `Embed` node in the editor framework. In the editor's modularization, we mainly pass the current value to the editing component, and synchronize changes back to the editor itself in the `onChange` event, which is very similar to handling input boxes in forms.

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
```

```js
public renderLeaf(context: ReactLeafContext): React.ReactNode {
  const { attributes: attrs = {} } = context;
  const varKey = attrs[VARS_KEY];
  const placeholders = this.options.placeholders || {};
  return (
    <Embed context={context}>
      <Isolate context={context}>
        <EditableTextInput
          className={cs(VARS_CLS_PREFIX, `${VARS_CLS_PREFIX}-${varKey}`)}
          value={attrs[VARS_VALUE_KEY] || ""}
          placeholder={placeholders[varKey]}
          onChange={(value, event) => this.onTextChange(context.leafState, value, event)}
        ></EditableTextInput>
      </Isolate>
    </Embed>
  );
}
```

However, we encountered issues when integrating the `Isolate` node, especially with the selection not being able to be set inside the variable editing node. The main problem here is that the selection is not controlled by the editor, therefore we also need to prevent the editor framework from forcefully pulling the selection to the `leaf` node. This still requires support from the editor itself.

Similarly, many events also need to be prevented from being handled by the editor framework. Thanks to the design of the browser's `DOM` event flow, we can relatively easily prevent these events from being processed by the editor framework by stopping event propagation. Of course, there are also events that do not bubble up, such as `Focus`, and global events like `SelectionChange`, which need to be handled within the editor's own event system.

```js
/**
 * Isolated Node Embedding HOC
 * - Isolated area completely isolates related events
 * @param props
 */
export const Isolate: FC<IsolateProps> = props => {
  const [ref, setRef] = useState<HTMLSpanElement | null>(null);

  useEffect(() => {
    // Prevent event propagation
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
 * Determine if the range change should be ignored when the selection changes
 * @param node
 * @param root
 */
export const isNeedIgnoreRangeDOM = (node: DOMNode, root: HTMLDivElement) => {
  for (let currentNode: DOMNode | null = node; currentNode !== root; currentNode = currentNode.parentNode) {
    // If the node is found up until the body, it means the node is not under the root, ignore the range change
    if (!currentNode || currentNode === document.body || currentNode === document.documentElement) {
      return true;
    }
    // If it is an element with ISOLATED_KEY attribute, then ignore the range change
    if (isDOMElement(currentNode) && currentNode.hasAttribute(ISOLATED_KEY)) {
      return true;
    }
  }
  return false;
};
```

At this point, the template input box has been basically implemented, facing some significant issues in actual usage. However, during compatibility testing, a detail was discovered that pressing the arrow keys to navigate from a non-variable node to a variable node may not always succeed in entering or exiting in `Firefox` and `Safari`, with different behaviors in different browsers, where only `Chrome` behaves completely normally.

Therefore, to ensure browser compatibility, we need to actively handle the navigation behavior at the boundaries in the `KeyDown` event. This implementation requires adaptation to the editor's own implementation, completely handling the new selection position based on the `DOM` nodes. This part of the implementation is quite extensive, so here is an example of handling left key to exit a variable block.

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

Lastly, we also need to handle operations related to `History`. Since the variable block itself is detached from the editor framework, the selection area is not actually perceived by the editor itself. Therefore, operations like `undo`, `redo`, etc. cannot handle changes in the selection of the variable block. So here we simply handle it to prevent the input component's `undo` operations from being recorded in the editor.

```js
public onTextChange(leaf: LeafState, value: string, event: InputEvent) {
  this.editor.state.apply(delta, {
    autoCaret: false,
    // Even if not recorded in the History module, there are still some issues
    // But if handled in a controlled manner, there are focus issues because the focus is not in the editor at this time
    undoable: event.inputType !== "historyUndo" && event.inputType !== "historyRedo",
  });
}
```

### Selector Component
The selector component mainly fixes the value of variables. For example, in the example above, we fix the variable of length to options such as short, medium, long, etc. The implementation here is relatively simple, mainly because the selector component itself does not need to deal with selection issues. It is a regular `Embed` type node. Therefore, it only needs to implement the selector component and synchronize the value to the editor itself in the `onChange` event.

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
```

```typescript
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

The `SelectorInput` component is a typical selector component. It is important to avoid the browser's selection handling, so the default behavior will be prevented on the `MouseDown` event. The DOM nodes of the popup layer are mounted outside the editor using `Portal`, ensuring that they are not affected by the selection.

```javascript
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

## Summary
In this article, we investigated the implementation of scenarios where users input prompts, and discussed the modes of pure text input boxes, form template input modes, and examined some interesting implementation solutions. Finally, we focused on implementing a variable template input box based on a rich text editor, specifically tailored to our editor framework, `BlockKit`, which we built from scratch. Additionally, we implemented plugins such as `Editable` variable blocks and selector variable blocks.

Introducing a rich text editor can be quite complex. For simple scenarios, directly using `Editable` is naturally feasible, especially for simple input box scenarios where complex performance issues do not need to be addressed. However, if more complex interaction forms, multiple block structures, and plugin strategies need to be implemented, using a rich text editor framework is still the better choice. Otherwise, you may end up building towards an editor implementation.

## Daily Question

- <https://github.com/WindRunnerMax/EveryDay>

## References
- <https://www.doubao.com/chat/write>
- <https://www.shadcn.io/ai/prompt-input>
- <https://github.com/ant-design/x/issues/807>
- <https://loop.coze.cn/open/docs/cozeloop/prompt>
- <https://github.com/WindRunnerMax/BlockKit/tree/master/examples/variable>
- <https://dev.to/gianna/how-to-build-a-prompt-friendly-ui-with-react-typescript-2766>
