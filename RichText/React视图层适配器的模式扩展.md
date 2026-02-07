# React视图层适配器的模式扩展
在编辑器最开始的架构设计上，我们就以`MVC`模式为基础，分别实现模型层、核心层、视图层的分层结构。在先前我们讨论的主要是模型层以及核心层的设计，即数据模型以及编辑器的核心交互逻辑，在这里我们以`React`为例，讨论其作为视图层的模式扩展设计。

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

</details>

## 概述
多数编辑器实现了本身的视图层，而重新设计视图层需要面临渲染问题，诸如处理复杂的`DOM`更新、差量更新的成本，在业务上也无法复用组件生态，且存在新的学习成本。因此我们需要能够复用现有的视图层框架，例如`React/Vue/Angular`等，这就需要在最底层的架构上就实现可扩展视图层的核心模式。

复用现有的视图层框架也就意味着，在核心层设计上不感知任何类型的视图实现，针对诸如选区的实现也仅需要关注最基础的`DOM`操作。而这也就导致我们需要针对每种类型的框架都实现对应的视图层适配器，即使其本身并不会特别复杂，但也会是需要一定工作量的。

虽然独立设计视图层可以解决视图层适配成本问题，但相应的会增加维护成本以及包本身体积，因此在我们的编辑器设计上，我们还是选择复用现有的视图层框架。然而，即使复用视图层框架，适配富文本编辑器也并非是一件简单的事情，需要关注的点包括但不限于以下几部分:

- 视图层初始状态渲染: 生命周期同步、状态管理、渲染模式、`DOM`映射状态等。
- 内容编辑的增量更新: 不可变对象、增量渲染、`Key`值维护等。
- 渲染事件与节点检查: 脏`DOM`检查、选区更新、渲染`Hook`等。
- 编辑节点的组件预设: 零宽字符、`Embed`节点、`Void`节点等。
- 非编辑节点内容渲染: 占位节点、只读模式、插件模式、外部节点挂载等。
 
此外，基于`React`实现视图层适配器，相当于重新深入学习`React`的渲染机制。例如使用`memo`来避免不必要的重渲染、使用`useLayoutEffect`来控制`DOM`渲染更新时机、严格控制父子组件事件流以及副作用执行顺序等、处理脏`DOM`的受控更新等。

除了这些与`React`相关的实现，还有一些样式有关的问题需要注意。例如在`HTML`默认连续的空白字符，包括空格、制表符和换行符等，在渲染时会被合并为一个空格，这样就会导致输入的多个空格在渲染时只显示一个空格。

为了解决这个问题，有些时候我们可以直接使用`HTML`实体`&nbsp;`来表示这些字符来避免渲染合并，然而我们其实可以用更简单的方式来处理，即使用`CSS`来控制空白符的渲染。下面的几个样式分别控制了不同的渲染行为:

- `whiteSpace: "pre-wrap"`: 表示在渲染时保留换行符以及连续的空白字符，但是会对长单词进行换行。
- `wordBreak: "break-word"`: 可以防止长单词或`URL`溢出容器，会在单词内部分行，对中英文混合内容特别有用。
- `overflowWrap: "break-word"`: 同样是处理溢出文本的换行，但自适应宽度时不考虑长单词折断，属于当前标准写法。

```js
<div
  style={{
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  }}
></div>
```

这其中`word-break`是早期`WebKit`浏览器的实现，给`word-break`添加了一个非标准的属性值`break-word`。这里存在问题是，`CSS`在布局计算中，有一个环节叫`Intrinsic Size`即固有尺寸计算，此时如果给容器设置`width: min-content`时，容器就坍塌成了一个字母的宽度。

```html
<style>
  .wrapper { background: #eee; padding: 10px; width: min-content; border: 1px solid #999; }
  .standard { overflow-wrap: break-word; }
  .legacy { word-break: break-word; }
</style>
<h3>overflow-wrap: break-word</h3>
<div class="wrapper standard">
  Supercalifragilistic
</div>
<h3>word-break: break-word</h3>
<div class="wrapper legacy">
  Supercalifragilistic
</div>
```

## 生命周期同步
从最开始的编辑器设计中，我们就已经将核心层和视图层分离，并且为了更灵活地调度编辑器，我们将编辑器实例化的时机交予用户来控制。这种情况下若是暴露出`Editor`的`ref/useImperativeHandle`接口实现，就可以不必要设置`null`的状态，通常情况下的调度方式类似于下面的实现:

```js
const Editor = () => {
  const editor = useMemo(() => new Editor(), []);
  return <Editable editor={editor} />;
}
```

此外，我们需要在`SSR`渲染或者生成`SSG`静态页面时，编辑器的渲染能够正常工作。那么通常来说，我们需要独立控制编辑器对于`DOM`操作的时机，实例化编辑器时不会进行任何`DOM`操作，而只有在`DOM`状态准备好后，才会进行`DOM`操作。那么最常见的时机，就是组件渲染的副作用`Hook`。

```js
const Editable: React.FC = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    el && editor.mount(el);
  }, [editor]);
  return <div ref={ref}></div>;
}
```

然而在这种情况下，编辑器实例化的生命周期和`Editable`组件的生命周期必须要同步，这样才能保证编辑器的状态和视图层的状态一致。例如下面的例子中，`Editable`组件的生命周期与`Editor`实例的生命周期不一致，会导致视图所有的插件卸载。

```js
const Editor = () => {
  const editor = useMemo(() => new Editor(), []);
  const [key, setKey] = useState(0);
  return (
    <Fragment>
      <button onClick={() => setKey((k) => k + 1)}>切换</button>
      {key % 2 ? <div><Editable editor={editor} /></div> : <Editable editor={editor} />}
    </Fragment>
  );
}
```

上面的例子中，若是`Editable`组件层级一致其实是没问题的，即使存在条件分支`React`也会直接复用，但层级不一致的话会导致`Editable`组件级别的卸载和重新挂载。当然本质上就是组件生命周期导致的问题，因此可以推断出若是同一层级的组件，设置为不同的`key`值也会触发同样的效果。

```js
const Editor = () => {
  const editor = useMemo(() => new Editor(), []);
  const [key, setKey] = useState(0);
  return (
    <Fragment>
      <button onClick={() => setKey((k) => k + 1)}>切换</button>
      <Editable key={key} editor={editor} />
    </Fragment>
  );
}
```

这里的核心原因实际上是，`Editable`组件的`useEffect`钩子会在组件卸载时触发清理函数，而编辑器实例化的时候是在最外层执行的。那么编辑器实例化和卸载的时机是无法对齐的，卸载后所有的编辑器功能都会销毁，只剩下纯文本的内容`DOM`结构。

```js
useLayoutEffect(() => {
  const el = ref.current;
  el && editor.mount(el);
  return () => {
    editor.destroy();
  };
}, [editor]);
```

此外，实例化独立的编辑器后，同样也不能使用多个`Editable`组件来实现编辑器的功能，也就是说每个编辑器实例都必须要对应一个`Editable`组件，多个编辑器组件的调度会导致整个编辑器状态混乱。

```js
const Editor = () => {
  const editor = useMemo(() => new Editor(), []);
  return (
    <Fragment>
      <Editable editor={editor} />
      <Editable editor={editor} />
    </Fragment>
  );
}
```

因此为了避免类似的问题，我们是应该以最开始的实现方式一致，也就是说整个编辑器组件都应该是合并为独立组件的。那么类似于上述出现问题的组件应该有如下的形式，将实例化的编辑器和`Editable`组件合并为独立组件，这样就能够将生命周期完全对齐而非交给用户侧实现。

```js
const Editor = () => {
  const editor = useMemo(() => new Editor(), []);
  return <Editable editor={editor} />;
};

const App = () => {
  const [key, setKey] = useState(0);
  return (
    <Fragment>
      <button onClick={() => setKey((k) => k + 1)}>切换</button>
      {key % 2 ? <div><Editor /></div> : <Editor />}
    </Fragment>
  );
}
```

实际上我们完全可以将实例化编辑器这个行为封装到`Editable`组件中的，但是为了更灵活地调度编辑器，将实例化放置于外层更合适。此外，从上述的`Effect`中实际上可以看出，与`onMount`实例挂载对齐的生命周期应该是`Unmount`，因此这里更应该调度编辑器卸载`DOM`的事件。

然而若是将相关的事件粒度拆得更细，即在插件中同样需要定义为`onMount`和`onUnmount`的生命周期，这样就能更好地控制相关处理时机问题。然而这种情况下，对于用户来说就需要有更复杂的插件逻辑，与`DOM`相关的事件绑定、卸载等都需要用户明确在哪个生命周期调用。

即使分离了更细粒度的生命周期，编辑器的卸载时机仍然是需要主动调用的，不主动调用则会存在可能的内存泄漏问题。在插件的实现中用户是可能直接向`DOM`绑定事件的，这些事件在编辑器卸载时是需要主动解绑的，将相关的约定都学习一边还是存在一些心智负担。

实际上如果能实现更细粒度的生命周期，对于整个编辑器的实现是更高效的，毕竟若是避免实例化编辑器则可以减少不必要的状态变更和事件绑定。因此这里还是折中实现，若是用户需要避免编辑器的卸载事件，可以通过`preventDestroy`参数来实现，用户在编辑器实例化生命周期结束主动卸载。

```js
export const Editable: React.FC<{
  /**
   * 避免编辑器主动销毁
   * - 谨慎使用, 生命周期结束必须销毁编辑器
   * - 注意保持值不可变, 否则会导致编辑器多次挂载
   */
  preventDestroy?: boolean;
}> = props => {
  const { preventDestroy } = props;
  const { editor } = useEditorStatic();

  useLayoutEffect(() => {
    const el = ref.current;
    el && editor.mount(el);
    return () => {
      editor.unmount();
      !preventDestroy && editor.destroy();
    };
  }, [editor, preventDestroy]);
}
```

## 状态管理
对于状态管理我们需要从头开始，在这里我们先来实现全量更新模式，但是要在架构设计上留好增量的更新模式。那么思考核心层与视图层中的通信与状态管理，使用`Context/Redux/Mobx`是否可以避免自行维护各个状态对象，也可以达到局部刷新而不是刷新整个页面的效果。  

深入思考一下似乎并不可行，以`Context`管理状态为例，即使有`immer.js`似乎也做不到局部刷新，因为整个`delta`的数据结构不能够达到非常完整的与`props`对应的效果。诚然我们可以根据`op & attributes`作为`props`再在组件内部做数据转换，但是这样似乎并不能避免维护一个状态对象。

由此最基本的是应该要维护一个`LineState`对象，每个`op`可能与前一个或者后一个有状态关联，以及行属性需要处理，这样一个基础的`LineState`对象是必不可少的。再加上是要做插件化的，那么给予`react`组件的`props`应该都实际上可以隐藏在插件里边处理。

如果我们使用`immer`的话，似乎只需要保证插件给予的参数是不变的即可，但是同样的每一个`LineState`都会重新调用一遍插件化的`render`方法。这样确实造成了一些浪费，即使能够保证数据不可变即不会再发生`re-render`，但是如果在插件中解构了这个对象或者做了一些处理，那么又会触发更新。

那么既然`LineState`对象不可避免，如果再在这上边抽象出一层`BlockState`来管理`LineState`。再通过`ContentChange`事件作为`bridge`，以及这种一层管理一层的方式，精确地更新每一行，减少性能损耗，甚至于精确的得知究竟是哪几个`op`更新了，做到完全精准更新也不是不可能。

由此回到最初实现`State`模块更新文档内容时，我们是直接重建了所有的`LineState`以及`LeafState`对象，然后在`React`视图层的`BlockModel`中监听了`OnContentChange`事件，以此来将`BlockState`的更新应用到视图层。

```js
delta.eachLine((line, attributes, index) => {
  const lineState = new LineState(line, attributes, this);
  lineState.index = index;
  lineState.start = offset;
  lineState.key = Key.getId(lineState);
  offset = offset + lineState.length;
  this.lines[index] = lineState;
});
```

这种方式简单直接，全量更新状态能够保证在`React`的状态更新，然而这种方式的问题在于性能，当文档内容非常大的时候，全量计算将会导致大量的状态重建。并且其本身的改变也会导致`React`的`diff`差异进而全量更新文档视图，这样的性能开销通常是不可接受的。

不过，上述的监听`OnContentChange`事件来更新视图的方式，是完全没有问题的，这也是连接编辑器核心层和视图层的重要部分。`React`的视图更新需要`setState`来触发状态变更，那么从核心层的`OnContentChange`事件中触发更新，就可以将状态的更新应用到视图层。

```js
const BlockView: FC = props => {
  const [lines, setLines] = useState(() => state.getLines());

  const onContentChange = useMemoFn(() => {
    setLines(state.getLines());
  });
}
```

这里其实还有个有趣的事情，假设我们在核心层中同步地多次触发了状态更新，则会导致多次视图层更新。这是个比较常见的事情，当一个事件作用到状态模型时，可能调用了若干指令，产生了多个`Op`，若每个`Op`的应用都进行一次视图同步，代价会十分高昂。

不过在`React`中，这件事的表现并没有那么糟糕，因为`React`本身会合并起来异步更新视图，但我们仍然可以避免多次无效的更新，可以减少`React`设置状态这部分的开销。具体的逻辑是，同步更新状态时，通过一个状态变量守卫住`React`状态更新，直到异步操作时才更新视图层。

在下面的这段代码中，可以举个例子同步等待刷新的队列为`||||||||`，每一个`|`都代表着一次状态更新。进入更新步骤即首个`|`后, 异步队列行为等待, 同步的队列由于`!flushing`全部被守卫。主线程执行完毕后, 异步队列开始执行, 此时拿到的是最新数据, 以此批量重新渲染。

```js
/**
 * 数据同步变更, 异步批量绘制变更
 */
const onContentChange = useMemoFn(() => {
  if (flushing.current) return void 0;
  flushing.current = true;
  Promise.resolve().then(() => {
    flushing.current = false;
    setLines(state.getLines());
  });
});
```

回到更新这件事本身，即使全部重建了`LineState`以及`LeafState`，也需要尽可能找到其原始的`LineState`以便于复用其`key`值，避免整个行的`re-mount`。当然即使复用了`key`值，因为重建了`State`实例，`React`也会继续后边的`re-render`流程。

这样的全量更新自然是存在性能浪费的，特别是我们的数据模型都是基于原子化`Op`的，不实现增量更新本身也并不合理。因此我们需要在核心层实现增量更新的逻辑，例如`Immutable`的状态序列对象、`Key`值的复用等，视图层也需要借助`memo`等来避免无效渲染。

## 渲染模式
我们希望实现的是视图层分离的通信架构，相当于所有的渲染都采用`React`，类似于`Slate`的架构设计。而`Facebook`在推出的`Draft`富文本引擎中，是使用纯`React`来渲染的，然后当前`Draft`已经不再维护，转而推出了`Lexical`。

后来我发现`Lexical`虽然是`Facebook`推出的，但是却没用`React`进行渲染，从`DOM`节点上就可以看出来是没有`Fiber`的，因此可以确定普通的节点并不是`React`渲染的。诚然使用`React`可能存在性能问题，而且由于非受控模式下可能会造成`crash`，但是能够直接复用视图层还是有价值的。

在`Lexical`的`README`中可以看到是可以支持`React`的，那么这里的支持实际上仅有`DecoratorNode`可以用`React`来渲染，例如在`Playground`中加入`ExcaliDraw`画板的组件的话，就可以发现`svg`外的`DOM`节点是`React`渲染的，可以发现`React`组件是额外挂载上去的。

在下面的例子中，可以看到`p`标签的属性中是`lexical`注入的相关属性，而子级的`span`标签则是`lexical`装饰器节点，用于渲染`React`组件，这部分都并非是`React`渲染的。而明显的，`button`标签则明显是`React`渲染的，因为其有`Fiber`相关属性，这也验证了分离渲染模式。

```html
<!-- 
  __lexicalKey_gqfof: "4"
  __lexicalLineBreak: br
  __lexicalTextContent: "\n\n\n\n" 
-->
<p class="PlaygroundEditorTheme__paragraph" dir="auto">
  <!-- 
    __lexicalKey_gqfof: "5"
    _reactListening2aunuiokal: true
  -->
  <span class="editor-image" data-lexical-decorator="true" contenteditable="false">
    <!-- 
      __reactFiber$zski0k5fvkf: { ... }
      __reactProps$zski0k5fvkf: { ... }
    -->
    <button class="excalidraw-button "><!-- ... --></button>
  </span>
</p>
```

也就是说，仅有`Void/Embed`类型的节点才会被`React`渲染，其他的内容都是普通的`DOM`结构。这怎么说呢，就有种文艺复兴的感觉，如果使用`Quill`的时候需要将`React`结合的话，通常就需要使用`ReactDOM.render`的方式来挂载`React`节点。

在`Lexical`还有一点是，需要协调的函数都需要用`$`符号开头，这也有点`PHP`的文艺复兴。`Facebook`实现的框架就比较喜欢规定一些约定性的内容，例如`React`的`Hooks`函数都需要以`use`开头，这本身也算是一种心智负担。

那么有趣的事，在`Lexical`中我是没有看到使用`ReactDOM.render`的方法，所以我就难以理解这里是如何将`React`节点渲染到`DOM`上的。于是在`useDecorators`中找到了`Lexical`实际上是以`createPortal`的方法来渲染的。

```js
// https://react-lab.skyone.host/
const Context = React.createContext(1);
const Customer = () => <span>{React.useContext(Context)}</span>;
const App = () => {
  const ref1 = React.useRef<HTMLDivElement>(null);
  const ref2 = React.useRef<HTMLDivElement>(null);
  const [decorated, setDecorated] = React.useState<React.ReactPortal | null>(null);
    
  React.useEffect(() => {
    const div1 = ref1.current!;
    setDecorated(ReactDOM.createPortal(<Customer />, div1));
    const div2 = ref2.current!;
    ReactDOM.render(<Customer />, div2);
  }, []);
    
  return (
    <Context.Provider value={2}>
      {decorated}
      <div ref={ref1}></div>
      <div ref={ref2}></div>
      <Customer></Customer>
    </Context.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
```

使用这种方式实际与`ReactDOM.render`效果基本一致，但是`createPortal`是可以自由使用`Context`的，且在`React`树渲染的位置是用户挂载的位置。实际上讨论这部分的主要原因是，我们在视图层的渲染并非需要严格使用框架来渲染，分离渲染模式也是能够兼容性能和生态的处理方式。

## DOM 映射状态
在实现`MVC`架构时，理论上控制器层以及视图层都是独立的，控制器不会感知视图层的状态。但是在我们具体实现过程中，视图层的`DOM`是需要被控制器层处理的，例如事件绑定、选区控制、剪贴板操作等等，那么如何让控制器层能够操作相关的`DOM`就是个需要处理的问题。

理论上而言，我们在`DOM`上的设计是比较严格的，即`data-block`节点属块级节点，而`data-node`节点属行级节点，`data-leaf`节点则属行内节点。`block`节点下只能包含`node`节点，而`node`节点下只能包含`leaf`节点。

```html
<div contenteditable style="outline: none" data-block>
  <div data-node><span data-leaf><span>123</span></span></div>
  <div data-node>
    <span data-leaf><span contenteditable="false">321</span></span>
  </div>
  <div data-node><span data-leaf><span>123</span></span></div>
</div>
```

那么在这种情况下，我们是可以在控制器层通过遍历`DOM`节点来获取相关的状态的，或者诸如`querySelectorAll`、`createTreeWalker`等方法来获取相关的节点。但是这样明显是会存在诸多无效的遍历操作，因此我们需要考虑是否有更高效的方式来获取相关的节点。

在`React`中我们可以通过`ref`来获取相关的节点，那么如何将`DOM`节点对象映射到相关编辑器对象上。我们此时存在多个状态对象，因此可以将相关的对象完整一一映射到对应的主级`DOM`结构上，而且`Js`中我们可以使用`WeakMap`来维护弱引用关系。

```js
export class Model {
  /** DOM TO STATE */
  protected DOM_MODEL: WeakMap<HTMLElement, BlockState | LineState | LeafState>;
  /** STATE TO DOM */
  protected MODEL_DOM: WeakMap<BlockState | LineState | LeafState, HTMLElement>;

  /**
   * 映射 DOM - LeafState
   * @param node
   * @param state
   */
  public setLeafModel(node: HTMLSpanElement, state: LeafState) {
    this.DOM_MODEL.set(node, state);
    this.MODEL_DOM.set(state, node);
  }
}
```

在`React`组件的`ref`回调函数中，我们需要通过`setLeafModel`方法来将`DOM`节点映射到`LeafState`上。在`React`中相关执行时机为`ref -> layout effect -> effect`，且需要保证引用不变, 否则会导致回调在`re-render`时被多次调用`null/span`状态。

```js
export const Leaf: FC<LeafProps> = props => {
  /**
   * 处理 ref 回调
   */
  const onRef = useMemoFn((dom: HTMLSpanElement | null) => {
    dom && editor.model.setLeafModel(dom, lineState);
  });

  return (
    <span ref={onRef} {...{ [LEAF_KEY]: true }}>
      {props.children}
    </span>
  );
};
```

## 总结
在先前我们主要讨论了模型层以及核心层的设计，即数据模型以及编辑器的核心交互逻辑，也包括了部分`DOM`相关处理的基础实现。还重点讲述了选区的状态同步、输入的状态同步，并且处理了相关实现在浏览器中的兼容问题。

在当前部分，我们主要讨论了视图层的适配器设计，主要是全量的视图初始化渲染，包括生命周期同步、状态管理、渲染模式、`DOM`映射状态等。接下来我们需要处理变更的增量更新，这属于性能方面的优化，我们需要考虑如何最小化`DOM`以及`Op`操作，以及在`React`中实现增量渲染的方式。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://18.react.dev/>
- <https://zh-hans.react.dev/reference/react/useImperativeHandle>
- <https://developer.mozilla.org/en-US/docs/Glossary/Character_reference>
