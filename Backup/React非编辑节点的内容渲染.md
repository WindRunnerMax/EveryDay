# React非编辑节点的内容渲染
先前我们讨论了是编辑节点的组件预设，包括零宽字符、`Embed`节点、`Void`节点等，接下来我们需要讨论的是非编辑节点内容渲染，也就是占位节点、只读模式、插件模式、外部节点挂载等。这些节点类型在编辑器的设计中处于常见的外部节点，例如占位符号、弹出层等。

- 开源地址: <https://github.com/WindRunnerMax/BlockKit>
- 在线编辑: <https://windrunnermax.github.io/BlockKit/>
- 项目笔记: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

<details>
<summary><strong>从零实现富文本编辑器系列文章</strong></summary>

- [深感一无所长，准备试着从零开始写个富文本编辑器](./从零设计实现富文本编辑器.md)
- [从零实现富文本编辑器#2-基于MVC模式的编辑器架构设计](./基于MVC模式的编辑器架构设计.md)
- [从零实现富文本编辑器#3-基于Delta的线性数据结构模型](./基于Delta的线性数据结构模型.md)
- [从零实现富文本编辑器#4-浏览器选区模型的核心交互策略](./浏览器选区模型的核心交互策略.md)
- [从零实现富文本编辑器#5-编辑器选区模型的状态结构表达](./编辑器选区模型的状态结构表达.md)
- [从零实现富文本编辑器#6-浏览器选区与编辑器选区模型同步](./浏览器选区与编辑器选区模型同步.md)
- [从零实现富文本编辑器#7-基于组合事件的半受控输入模式](./基于组合事件的半受控输入模式.md)
- [从零实现富文本编辑器#8-浏览器输入模式的非受控DOM行为](./浏览器输入模式的非受控DOM行为.md)
- [从零实现富文本编辑器#9-编辑器文本结构变更的受控处理](./编辑器文本结构变更的受控处理.md)
- [从零实现富文本编辑器#10-React视图层适配器的模式扩展](./React视图层适配器的模式扩展.md)
- [从零实现富文本编辑器#11-Immutable状态维护与增量渲染](./Immutable状态维护与增量渲染.md)
- [从零实现富文本编辑器#12-React可编辑节点的组件预设](./React可编辑节点的组件预设.md)
- [从零实现富文本编辑器#13-React非编辑节点的内容渲染](./React非编辑节点的内容渲染.md)

</details>

## Placeholder 占位节点
在编辑器中，在内容为空的情况下，通常需要渲染一个占位节点来提示用户输入内容。在浏览器的`input`和`textarea`中，都存在原生的占位节点实现。而在编辑器中，这部分占位节点就需要自行实现，浏览器在`ContentEditable`模式并不存在原生的占位节点。

在开源的编辑器中，`quill`和`slate`都提供了占位节点的实现，并且还是属于典型的实现。

```js
<div data-placeholder="请输入内容">
  <div data-node><span data-leaf>&ZeroWidthSpace;</span></div>
</div>
```

```css
.block-kit-x-editable div[data-block][data-placeholder]::before {
  color: #bbbfc4;
  content: attr(data-placeholder);
  height: 0;
  pointer-events: none;
  position: absolute;
}
```

## Readonly 只读模式


## Plugin 渲染插件模式

## Portal 外部节点挂载
在实现诸如`Mention`、划词改写等模块时，通常需要额外的辅助节点来渲染面板，例如`Mention`需要唤醒额外的面板来选择要`at`的对象，并且需要在此基础上实现诸如上下选择、回车等交互。

这种情况下，`Mention`面板通常是不会渲染在编辑器内部的，需要额外的节点来渲染这个面板。因此在实现编辑器模块时，是额外渲染了一个`mount-dom`作为辅助节点的容器，以此作为原始的`DOM`结构提供给`ReactDOM`来渲染。

```js
const onMountRef = (e: HTMLElement | null) => {
  e && MountNode.set(editor, e);
};

<BlockKit editor={editor} readonly={readonly}>
  <div className="block-kit-editable-container">
    <div className="block-kit-mount-dom" ref={onMountRef}></div>
    <Editable></Editable>
  </div>
</BlockKit>
```

用`ReactDOM.render`来渲染节点时，是不能够直接将该节点作为容器的，因为调用时并非直接追加`React`节点到`DOM`节点，而是直接将`React`节点渲染到该节点上。因此这种情况下，若是存在多个需要挂载的辅助节点，是无法完成的。

```js
ReactDOM.render("string", document.getElementById("root"));
```

因此这里渲染辅助元素时，需要先将此节点作为容器，创建一个新的容器子节点，然后将该节点作为容器调用`ReactDOM.render`方法来渲染`React`节点。在最开始的时候，编辑器中的`Mention`面板是类似下面的实现:

```js
if (!this.mountSuggestNode) {
  this.mountSuggestNode = document.createElement("div");
  this.mountSuggestNode.dataset.type = "mention";
  MountNode.get(this.editor).appendChild(this.mountSuggestNode);
}
const top = this.rect.top;
const left = this.rect.left;
const dom = this.mountSuggestNode!;
this.isMountSuggest = true;
ReactDOM.render(<Suggest controller={this} top={top} left={left} text={text} />, dom);
```

最近我在思考一个问题，在我们使用`ReactDOM.createPortal`来传送到目标节点时，更加类似于追加节点的方式来实现，而不是需要向上述的方式一样先创建容器再渲染节点，并且此时还可以使用`Context`来传递编辑器的状态。

但是`createPortal`没有办法像`render`方法那样可以直接渲染节点，其只是创建了一个`Portal`节点，而不是实际进行了渲染行为。因此，最终还是无法避免需要一个实际渲染的行为，相互配合起来类似于下面的实现，这样就可以将元素实际创建到`body`上。

```js
const portal = ReactDOM.createPortal(
  <Suggest controller={this} top={top} left={left} text={text} />,
  document.body,
);
ReactDOM.render(portal, this.mountSuggestNode!);
```

那么如果类似于先前聊的`Lexical`的实现方式，独立控制一个`Portals`占位来渲染辅助节点，就可以避免使用`render`方法来渲染节点，并且可以直接在`mount-dom`追加节点而不需要再创建子容器，并且直接使用这种方法可以避免`React 18`的`createRoot`方法`Breaking Change`。

```js
const PortalView: FC<{ editor: Editor }> = props => {
  const [portals, setPortals] = useState<O.Map<ReactPortal>>({});
  EDITOR_TO_PORTAL.set(props.editor, setPortals);
  return (
    <Fragment key="block-kit-portal-model">
      {Object.entries(portals).map(([key, node]) => (
        <Fragment key={key}>{node}</Fragment>
      ))}
    </Fragment>
  );
};
```

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://18.react.dev/>
- <https://quilljs.com/standalone/full/>
- <https://www.slatejs.org/examples/richtext>
