# 基于React的虚拟滚动方案
在渲染列表时我们通常会一次性将所有列表项渲染到`DOM`中，在数据量大的时候这种操作会造成页面响应缓慢，因为浏览器需要处理大量的`DOM`元素。而此时我们通常就需要虚拟滚动来实现性能优化，当我们拥有大量数据需要在用户界面中以列表或表格的形式展示时，这种性能优化方式可以大幅改善用户体验和应用性能，那么在本文中就以固定高度和非固定高度两种场景展开虚拟滚动的实现。

## 描述
实现虚拟滚动通常并不是非常复杂的事情，但是我们需要考虑到很多细节问题。在具体实现之前我思考了一个比较有意思的事情，为什么虚拟滚动能够优化性能。我们在浏览器中进行`DOM`操作的时候，此时这个`DOM`是真正存在的吗，或者说我们在`PC`上实现窗口管理的时候，这个窗口是真的存在的吗。那么答案实际上很明确，这些视图、窗口、`DOM`等等都是通过图形化模拟出来的，虽然我们可以通过系统或者浏览器提供的`API`来非常简单地实现各种操作，但是实际上些内容是系统帮我们绘制出来的图像，本质上还是通过外部输入设备产生各种事件信号，从而产生状态与行为模拟，诸如碰撞检测等等都是系统通过大量计算表现出的状态而已。

那么紧接着，在前段时间我想学习下`Canvas`的基本操作，于是我实现了一个非常基础的图形编辑器引擎。因为在浏览器的`Canvas`只提供了最基本的图形操作，没有那么方便的`DOM`操作从而所有的交互事件都需要通过鼠标与键盘事件自行模拟，这其中有一个非常重要的点是判断两个图形是否相交，从而决定是否需要按需重新绘制这个图形来提升性能。那么我们设想一下，最简单的判断方式就是遍历一遍所有图形，从而判断是否与即将要刷新的图形相交，那么这其中就可能涉及比较复杂的计算，而如果我们能够提前判断某些图形是不可能相交的话，就能够省去很多不必要的计算。那么在视口外的图层就是类似的情况，如果我们能够确定这个图形是视口外的，我们就不需要判断其相交性，而且本身其也不需要渲染，那么虚拟滚动也是一样，如果我们能够减少`DOM`的数量就能够减少很多计算，从而提升整个页面的运行时性能，至于首屏性能就自不必多说，减少了`DOM`数量首屏的绘制一定会变快。

当然上边只是我对于提升页面交互或者说运行时性能的思考，实际上关于虚拟滚动优化性能的点在社区上有很多讨论了。诸如减少`DOM`数量可以减少浏览器需要渲染和维持的`DOM`元素数量，进而内存占用也随之减少，这使得浏览器可以更快地响应用户操作。以及浏览器的`reflow`和重绘`repaint`操作通常是需要大量计算的，并且随着`DOM`元素的增多而变得更加频繁和复杂，通过虚拟滚动个减少需要管理的`DOM`数量，同样可显著提高渲染性能。此外虚拟滚动还有更快的首屏渲染时间，特别是超大列表的全量渲染很容易导致首屏渲染时间过长，还能够减少`React`维护组件状态所带来的`Js`性能消耗，特别是在存在`Context`的情况下，不特别关注就可能会存在性能劣化问题。

文中会提到`4`种虚拟滚动的实现方式，分别有固定高度的`OnScroll`实现和不定高度的`IntersectionObserver+OnScroll`实现，相关`DEMO`都在`https://github.com/WindrunnerMax/webpack-simple-environment/tree/react-virtual-list`中。

## 固定高度
实际上关于虚拟滚动的方案在社区有很多参考，特别是固定高度的虚拟滚动实际上可以做成非常通用的解决方案。那么在这里我们以`ArcoDesign`的`List`组件为例来研究一下通用的虚拟滚动实现。在`Arco`给予的示例中我们可以看到其传递了`height`属性，此时如果我们将这个属性删除的话虚拟滚动是无法正常启动的，那么实际上`Arco`就是通过列表元素的数量与每个元素的高度，从而计算出了整个容器的高度，这里要注意滚动容器实际上应该是虚拟滚动的容器外的元素，而对于视口内的区域则可以通过`transform: translateY(Npx)`来做实际偏移，当我们滚动的时候，我们需要通过滚动条的实际滚动距离以及滚动容器的高度，配合我们配置的元素实际高度，就可以计算出来当前视口实际需要渲染的节点，而其他的节点并不实际渲染，从而实现虚拟滚动。当然实际上关于`Arco`虚拟滚动的配置还有很多，在这里就不完整展开了。

```js
<List
  {/* ... */}
  virtualListProps={{
    height: 560,
  }}
  {/* ... */}
/>
```

那么我们可以先来设想一下，当我们有了每个元素的高度以及元素数量，很明显我们就可以计算出容器的高度了，当我们有了容器的高度，此时滚动容器的子元素就可以得到，此时我们就可以得到拥有滚动条的滚动容器了。

```js
// packages/fixed-height-scroll/src/index.tsx
// ...
const totalHeight = useMemo(() => itemHeight * list.length, [itemHeight, list.length]);
// ...
<div
  style={{ height: 500, border: "1px solid #aaa", overflow: "auto", overflowAnchor: "none" }}
  onScroll={onScroll.run}
  ref={setScroll}
>
  {scroll && (
    <div style={{ height: totalHeight, position: "relative", overflow: "hidden" }}>
      {/* ... */}
    </div>
  )}
</div>
```

那么既然滚动容器已经有了，我们现在就需要关注于我们即将要展示的列表元素，因为我们是存在滚动条且实际有滚动偏移的，所以我们的滚动条位置需要锁定在我们的视口位置上，我们只需要使用`scrollTop / itemHeight`取整即可，并且这里我们使用`translateY`来做整体偏移，使用`translate`还可以触发硬件加速。那么除了列表的整体偏移之外，我们还需要计算出当前视口内的元素数量，这里的计算同样非常简单，因为我们的高度固定了，此时只需要跟滚动容器相除即可，实际上这部分在实例化组件的时候就已经完成了。

```js
useEffect(() => {
  if (!scroll) return void 0;
  setLen(Math.ceil(scroll.clientHeight / itemHeight));
}, [itemHeight, scroll]);

const onScroll = useThrottleFn(
  () => {
    const containerElement = container.current;
    if (!scroll || !containerElement) return void 0;
    const scrollTop = scroll.scrollTop;
    const newIndex = Math.floor(scrollTop / itemHeight);
    containerElement.style.transform = `translateY(${newIndex * itemHeight}px)`;
    setIndex(newIndex);
  },
  { wait: 17 }
);
```

## 动态高度
固定高度的虚拟滚动是比较适用于通用的场景的，实际上此处的固定高度不一定是指元素的高度是固定的，而是指元素的高度是可以直接计算得到而不是必须要渲染之后才能得到，例如图片的宽高是可以在上传时保存，然后在渲染时通过图片宽高以及容器宽度计算得到的。然而实际上我们有很多场景下并不台能够完全做到元素的固定高度，例如在线文档场景下的富文本编辑器中，特别是文本块的高度，在不同的字体、浏览器宽度等情况下表现是不同的，我们无法在其渲染之前的到其高度，这就导致了我们无法像图片一样提前计算出其占位高度，从而对于文档块结构的虚拟滚动就必须要解决块高度不固定的问题，由此我们需要实现动态高度的虚拟滚动调度策略来处理这个问题。

### IntersectionObserver占位符
如果我们需要判断元素是否出现在视口当中时，通常会监听`onScroll`事件用来判断元素实际位置，而现如今绝大多数浏览器都提供了`IntersectionObserver`原生对象，用以异步地观察目标元素与其祖先元素或顶级文档视口的交叉状态，这对判断元素是否出现在视口范围非常有用，那么同样的，我们也可以借助`IntersectionObserver`来实现虚拟滚动。

需要注意的是，`IntersectionObserver`对象的应用场景是观察目标元素与视口的交叉状态，而我们的虚拟滚动核心概念是不渲染非视口区域的元素，所以这里边实际上出现了一个偏差，在虚拟滚动中目标元素都不存在或者说并未渲染，那么此时是无法观察其状态的。所以为了配合`IntersectionObserver`的概念，我们需要渲染实际的占位符，例如`10k`个列表的节点，我们首先就需要渲染`10k`个占位符，实际上这也是一件合理的事，除非我们最开始就注意到列表的性能问题，而实际上大部分都是后期优化页面性能，特别是在复杂的场景下例如文档中，所以假设原本有`1w`条数据，每条数据即使仅渲染`3`个节点，那么此时我们如果仅渲染占位符的情况下还能将原本页面`30k`个节点优化到大概`10k`个节点，这对于性能提升本身也是非常有意义的。

此外，在`https://caniuse.com/?search=IntersectionObserver`可以观察到兼容性还是不错的，在浏览器不支持的情况下可以采用`OnScroll`方案或者考虑使用`polyfill`。那么紧接着，我们来实现这部分内容，首先我们需要生成数据，在这里需要注意的是我们所说的不定高度实际上应该是被称为动态高度，元素的高度是需要我们实际渲染之后才能得到的，在渲染之前我们仅以估算的高度占位，从而能够使滚动容器产生滚动效果。

```js
// packages/dynamic-height-placeholder/src/index.tsx
const LIST = Array.from({ length: 1000 }, (_, i) => {
  const height = Math.floor(Math.random() * 30) + 60;
  return {
    id: i,
    content: (
      <div style={{ height }}>
        {i}-高度:{height}
      </div>
    ),
  };
});
```

接下来我们需要创建`IntersectionObserver`，同样的因为我们的滚动容器可能并不一定是`window`，所以我们需要在滚动容器上创建`IntersectionObserver`，此外通常我们会对视口区域做一层`buffer`，用来提前加载视口外的元素，这样可以避免用户滚动时出现空白区域，这个`buffer`的大小通常选择当前视口高度的一半。

```js
useLayoutEffect(() => {
  if (!scroll) return void 0;
  // 视口阈值 取滚动容器高度的一半
  const margin = scroll.clientHeight / 2;
  const current = new IntersectionObserver(onIntersect, {
    root: scroll,
    rootMargin: `${margin}px 0px`,
  });
  setObserver(current);
  return () => {
    current.disconnect();
  };
}, [onIntersect, scroll]);
```

接下来我们需要对占位节点的状态进行管理，因为我们此时有实际占位，所以就不再需要预估整个容器的高度，而且只需要实际滚动到相关位置将节点渲染即可。我们为节点设置三个状态，`loading`状态即占位状态，此时节点只渲染空的占位符也可以渲染一个`loading`标识，此时我们还不知道这个节点的实际高度；`viewport`状态即为节点真实渲染状态，也就是说节点在逻辑视口内，此时我们可以记录节点的真实高度；`placeholder`状态为渲染后的占位状态，相当于节点从在视口内滚动到了视口外，此时节点的高度已经被记录，我们可以将节点的高度设置为真实高度。

```
loading -> viewport <-> placeholder
```

```js
type NodeState = {
  mode: "loading" | "placeholder" | "viewport";
  height: number;
};

public changeStatus = (mode: NodeState["mode"], height: number): void => {
  this.setState({ mode, height: height || this.state.height });
};

render() {
  return (
    <div ref={this.ref} data-state={this.state.mode}>
      {this.state.mode === "loading" && (
        <div style={{ height: this.state.height }}>loading...</div>
      )}
      {this.state.mode === "placeholder" && <div style={{ height: this.state.height }}></div>}
      {this.state.mode === "viewport" && this.props.content}
    </div>
  );
}
```

当然我们的`Observer`的观察同样需要配置，这里需要注意的是`IntersectionObserver`的回调函数只会携带`target`节点信息，我们需要通过节点信息找到我们实际的`Node`来管理节点状态，所以此处我们借助`WeakMap`来建立元素到节点的关系，从而方便我们处理。

```js
export const ELEMENT_TO_NODE = new WeakMap<Element, Node>();
componentDidMount(): void {
  const el = this.ref.current;
  if (!el) return void 0;
  ELEMENT_TO_NODE.set(el, this);
  this.observer.observe(el);
}

componentWillUnmount(): void {
  const el = this.ref.current;
  if (!el) return void 0;
  ELEMENT_TO_NODE.delete(el);
  this.observer.unobserve(el);
}
```

最后就是实际滚动调度了，当节点出现在视口时我们需要根据`ELEMENT_TO_NODE`获取节点信息，然后根据当前视口信息来设置状态，如果当前节点是进入视口的状态我们就将节点状态设置为`viewport`，如果此时是出视口的状态则需要二次判断当前状态，如果不是初始的`loading`状态则可以直接将高度与`placeholder`设置到节点状态上，此时节点的高度就是实际高度。

```js
const onIntersect = useMemoizedFn((entries: IntersectionObserverEntry[]) => {
  entries.forEach(entry => {
    const node = ELEMENT_TO_NODE.get(entry.target);
    if (!node) {
      console.warn("Node Not Found", entry.target);
      return void 0;
    }
    const rect = entry.boundingClientRect;
    if (entry.isIntersecting || entry.intersectionRatio > 0) {
      // 进入视口
      node.changeStatus("viewport", rect.height);
    } else {
      // 脱离视口
      if (node.state.mode !== "loading") {
        node.changeStatus("placeholder", rect.height);
      }
    }
  });
});
```

### IntersectionObserver虚拟化
在前边我们也提到了`IntersectionObserver`的目标是观察目标元素与视口的交叉状态，而我们的虚拟滚动核心概念是不渲染非视口区域的元素，那么究竟能不能通过`IntersectionObserver`实现虚拟滚动的效果，实际上是可以的，但是可能需要`OnScroll`来辅助节点的强制刷新。在这里我们尝试使用标记节点以及额外渲染的方式来实现虚拟列表，但是要注意的是，在这里因为没有使用`OnScroll`来强制刷新节点，当快速滚动的时候可能会出现空白的情况。

在先前的占位方案中，我们已经实现了`IntersectionObserver`的基本操作，在这里就不再赘述了。而在这里我们的核心思路是标记虚拟列表节点的首位，并且节点的首尾是额外渲染的，相当于首尾节点是在视口外的节点，当首尾节点的状态发生改变时，我们可以通过回调函数来控制其首尾的指针范围，从而实现虚拟滚动。那么在这之前，我们需要先控制好首尾指针的状态，避免出现负值或者越界的情况。

```js
// packages/dynamic-height-virtualization/src/index.tsx
const setSafeStart = useMemoizedFn((next: number | ((index: number) => number)) => {
  if (typeof next === "function") {
    setStart(v => {
      const index = next(v);
      return Math.min(Math.max(0, index), list.length);
    });
  } else {
    setStart(Math.min(Math.max(0, next), list.length));
  }
});

const setSafeEnd = useMemoizedFn((next: number | ((index: number) => number)) => {
  if (typeof next === "function") {
    setEnd(v => {
      const index = next(v);
      return Math.max(Math.min(list.length, index), 1);
    });
  } else {
    setEnd(Math.max(Math.min(list.length, next), 1));
  }
});
```

紧接着我们还需要两个数组，分别用来管理所有的节点以及节点的高度值，因为此时我们的节点可能是不存在的，所以其状态与高度需要额外的变量来管理，并且我们还需要两个占位块来作为首尾节点的占位，用来实现在滚动容器中滚动的效果。占位块同样需要对其进行观察，并且其高度就需要根据高度值的节点计算，当然这部分计算写的比较粗暴，还有很大的优化空间，例如额外维护一个单调递增的队列来计算高度。

```js
const instances: Node[] = useMemo(() => [], []);
const record = useMemo(() => {
  return Array.from({ length: list.length }, () => DEFAULT_HEIGHT);
}, [list]);

<div
  ref={startPlaceHolder}
  style={{ height: record.slice(0, start).reduce((a, b) => a + b, 0) }}
></div>
// ...
<div
  ref={endPlaceHolder}
  style={{ height: record.slice(end, record.length).reduce((a, b) => a + b, 0) }}
></div>
```

在节点渲染时，我们需要标记其状态，这里的`Node`节点的数据会变得更多，在这里主要是需要标注`isFirstNode`、`isLastNode`两个状态，并且`initHeight`需要从外部传递，之前也提到过了，节点可能不存在，此时如果再从头加载的话高度会不正确，倒是滚动不流畅的问题，所以我们需要在节点渲染时传递`initHeight`，这个高度值就是节点渲染记录的实际高度或者未渲染过的占位高度。

```js
<Node
  scroll={scroll}
  instances={instances}
  key={item.id}
  index={item.id}
  id={item.id}
  content={item.content}
  observer={observer}
  isFirstNode={index === 0}
  initHeight={record[item.id]}
  isLastNode={index === current.length - 1}
></Node>
```

还有一个需要关注的问题是视口锁定，当在可见区域之外的节点高度发生变化时，如果不进行视口锁定，就会出现可视区域跳变的问题。这里还需要注意的是我们不能使用`smooth`滚动的动画表现，如果使用动画的话可能会导致滚动的过程中其他节点高度变更且视口锁定失效的情况，此时依然会导致视口区域跳变，我们必须明确地指定滚动的位置，如果实在需要动画的话，同样也需要通过明确的数值缓慢递增来模拟，而不是直接使用`scrollTo`的`smooth`参数。

```js
componentDidUpdate(prevProps: Readonly<NodeProps>, prevState: Readonly<NodeState>): void {
  if (prevState.mode === "loading" && this.state.mode === "viewport" && this.ref.current) {
    const rect = this.ref.current.getBoundingClientRect();
    const SCROLL_TOP = 0;
    if (rect.height !== prevState.height && rect.top < SCROLL_TOP) {
      this.scrollDeltaY(rect.height - prevState.height);
    }
  }
}

private scrollDeltaY = (deltaY: number): void => {
  const scroll = this.props.scroll;
  if (scroll instanceof Window) {
    scroll.scrollTo({ top: scroll.scrollY + deltaY });
  } else {
    scroll.scrollTop = scroll.scrollTop + deltaY;
  }
};
```

接下来就是重点的回调函数处理了，这里涉及到比较复杂的状态管理。首先是两个占位节点，当两个占位节点出现在视口时，我们认为此时是需要加载其他节点的，以起始占位节点为例，当其出现在视口时，我们需要将起始指针前移，而前移的数量需要根据实际视口交叉的范围计算。

```js
const isIntersecting = entry.isIntersecting || entry.intersectionRatio > 0;
if (entry.target === startPlaceHolder.current) {
  // 起始占位符进入视口
  if (isIntersecting && entry.target.clientHeight > 0) {
    const delta = entry.intersectionRect.height || 1;
    let index = start - 1;
    let count = 0;
    let increment = 0;
    while (index >= 0 && count < delta) {
      count = count + record[index];
      increment++;
      index--;
    }
    setSafeStart(index => index - increment);
  }
  return void 0;
}
if (entry.target === endPlaceHolder.current) {
  // 结束占位符进入视口
  if (isIntersecting && entry.target.clientHeight > 0) {
    // ....
    setSafeEnd(end => end + increment);
  }
  return void 0;
}
```

接下来跟占位方案一样，我们同样需要根据`ELEMENT_TO_NODE`来获取节点信息，然后此时需要更新我们的高度记录变量。由于我们在`IntersectionObserver`回调中无法判断实际滚动方向，也不容易判断实际滚动范围，所以此时我们需要根据之前提到的`isFirstNode`与`isLastNode`信息来控制首尾游标指针。`FirstNode`进入视口认为是向下滚动，此时需要将上方范围的节点渲染出来，而`LastNode`进入视口认为是向上滚动，此时需要将下方范围的节点渲染出来。`FirstNode`脱离视口认为是向上滚动，此时需要将上方范围的节点移除，而`LastNode`脱离视口认为是向下滚动，此时需要将下方范围的节点移除。这里可以注意到我们增加节点范围使用的是`THRESHOLD`，而减少节点范围使用的是`1`，这里就是我们需要额外渲染的首尾节点。

```js
const node = ELEMENT_TO_NODE.get(entry.target);
const rect = entry.boundingClientRect;
record[node.props.index] = rect.height;
if (isIntersecting) {
  // 进入视口
  if (node.props.isFirstNode) {
    setSafeStart(index => index - THRESHOLD);
  }
  if (node.props.isLastNode) {
    setSafeEnd(end => end + THRESHOLD);
  }
  node.changeStatus("viewport", rect.height);
} else {
  // 脱离视口
  if (node.props.isFirstNode) {
    setSafeStart(index => index + 1);
  }
  if (node.props.isLastNode) {
    setSafeEnd(end => end - 1);
  }
  if (node.state.mode !== "loading") {
    node.changeStatus("placeholder", rect.height);
  }
}
```

在最后，因为这个状态很难控制的比较完善，我们还需要为其做兜底处理，防止页面上遗留过多节点。当然实际上即使遗留了节点也没有问题，相当于降级到了我们上边提到的占位方案，实际上并不会出现大量的节点，相当于在这里实现的是懒加载的占位节点。不过我们在这里依然给予了处理方案，可以通过节点状态来标识节点是否是作为分界线需要实际处理为首尾游标边界。

```js
public prevNode = (): Node | null => {
  return this.props.instances[this.props.index - 1] || null;
};
public nextNode = (): Node | null => {
  return this.props.instances[this.props.index + 1] || null;
};
// ...
const prev = node.prevNode();
const next = node.nextNode();
const isActualFirstNode = prev?.state.mode !== "viewport" && next?.state.mode === "viewport";
const isActualLastNode = prev?.state.mode === "viewport" && next?.state.mode !== "viewport";
if (isActualFirstNode) {
  setSafeStart(node.props.index - THRESHOLD);
}
if (isActualLastNode) {
  setSafeEnd(node.props.index + THRESHOLD);
}
```

### OnScroll滚动事件监听
那么实现动态高度的虚拟滚动，我们也不能忘记常用的`OnScroll`方案，实际上相对于使用`IntersectionObserver`来说，单纯的虚拟滚动`OnScroll`方案更加简单，当然同样的也更加容易出现性能问题。使用`OnScroll`的核心思路同样是需要一个滚动容器，然后我们需要监听滚动事件，当滚动事件触发时，我们需要根据滚动的位置来计算当前视口内的节点，然后根据节点的高度来计算实际需要渲染的节点，从而实现虚拟滚动。

那么动态高度的虚拟滚动与最开始我们实现的固定高度的虚拟滚动区别在哪，首先是滚动容器的高度，我们在最开始不能够知道滚动容器实际有多高，而是在不断渲染的过程中才能知道实际高度；其次我们不能直接根据滚动的高度计算出当前需要渲染的节点，在之前我们渲染的起始`index`游标是直接根据滚动容器高度和列表所有节点总高度算出来的，而在动态高度的虚拟滚动中，我们无法获得总高度，同样的渲染节点的长度也是如此，我们无法得知本次渲染究竟需要渲染多少节点；再有我们不容易判断节点距离滚动容器顶部的高度，也就是之前我们提到的`translateY`，我们需要使用这个高度来撑起滚动的区域，从而让我们能够实际做到滚动。

那么我们说的这些数值都是无法计算的嘛，显然不是这样的，在我们没有任何优化的情况下，这些数据都是可以强行遍历计算的，而实际上对于现代浏览器来说，执行加法计算需要的性能消耗并不是很高，例如我们实现`1`万次加法运算，实际上的时间消耗也只有不到`1ms`。

```js
console.time("addition time");
let count = 0;
for (let i = 0; i < 10000; i++) {
  count = count + i;
}
console.log(count);
console.timeEnd("addition time"); // 0.64306640625 ms
```

那么接下来我们就以遍历的方式粗暴地计算我们所需要的数据，在最后我们会聊一聊基本的优化方案。首先我们仍然需要记录高度，因为节点并不一定会存在视图中，所以最开始我们以基本占位高度存储，当节点实际渲染之后，我们再更新节点高度。

```js
// packages/dynamic-height-scroll/src/index.tsx
const heightTable = useMemo(() => {
  return Array.from({ length: list.length }, () => DEFAULT_HEIGHT);
}, [list]);

componentDidMount(): void {
  const el = this.ref.current;
  if (!el) return void 0;
  const rect = el.getBoundingClientRect();
  this.props.heightTable[this.props.index] = rect.height;
}
```

还记得之前我们聊到的`buffer`嘛，在`IntersectionObserver`中提供了`rootMargin`配置来维护视口的`buffer`，而在`OnScroll`中我们需要自行维护，所以在这里我们需要设置一个`buffer`变量，当滚动容器被实际创建之后我们来更新这个`buffer`的值以及滚动容器。

```js
const [scroll, setScroll] = useState<HTMLDivElement | null>(null);
const buffer = useRef(0);

const onUpdateInformation = (el: HTMLDivElement) => {
  if (!el) return void 0;
  buffer.current = el.clientHeight / 2;
  setScroll(el);
  Promise.resolve().then(onScroll.run);
};

return (
<div
  style={{ height: 500, border: "1px solid #aaa", overflow: "auto", overflowAnchor: "none" }}
  ref={onUpdateInformation}
>
  {/* ... */}
</div>
);
```

接下来我们来处理两个占位块，在这里没有使用`translateY`来做整体偏移，而是直接使用占位块的方式来撑起滚动区域，那么此时我们就需要根据首尾游标来计算具体占位，实际上这里就是之前我们说的万次加法计算的时间消耗问题，在这里我们直接遍历计算高度。

```js
const startPlaceHolderHeight = useMemo(() => {
  return heightTable.slice(0, start).reduce((a, b) => a + b, 0);
}, [heightTable, start]);

const endPlaceHolderHeight = useMemo(() => {
  return heightTable.slice(end, heightTable.length).reduce((a, b) => a + b, 0);
}, [end, heightTable]);

return (
  <div
    style={{ height: 500, border: "1px solid #aaa", overflow: "auto", overflowAnchor: "none" }}
    onScroll={onScroll.run}
    ref={onUpdateInformation}
  >
    <div data-index={`0-${start}`} style={{ height: startPlaceHolderHeight }}></div>
    {/* ... */}
    <div data-index={`${end}-${list.length}`} style={{ height: endPlaceHolderHeight }}></div>
  </div>
);
```

那么接下来就需要我们在`OnScroll`事件中处理我们需要渲染的节点内容，实际上主要是处理首尾的游标位置，对于首部游标我们直接根据滚动的高度来计算即可，遍历到首个节点的高度大于滚动高度时，我们就可以认为此时的游标就是我们需要渲染的首个节点，而对于尾部游标我们需要根据首部游标以及滚动容器的高度来计算，同样也是遍历到超出滚动容器高度的节点时，我们就可以认为此时的游标就是我们需要渲染的尾部节点。当然，在这游标的计算中别忘了我们的`buffer`数据，这是尽量避免滚动时出现空白区域的关键。

```js
const getStartIndex = (top: number) => {
  const topStart = top - buffer.current;
  let count = 0;
  let index = 0;
  while (count < topStart) {
    count = count + heightTable[index];
    index++;
  }
  return index;
};

const getEndIndex = (clientHeight: number, startIndex: number) => {
  const topEnd = clientHeight + buffer.current;
  let count = 0;
  let index = startIndex;
  while (count < topEnd) {
    count = count + heightTable[index];
    index++;
  }
  return index;
};

const onScroll = useThrottleFn(
  () => {
    if (!scroll) return void 0;
    const scrollTop = scroll.scrollTop;
    const clientHeight = scroll.clientHeight;
    const startIndex = getStartIndex(scrollTop);
    const endIndex = getEndIndex(clientHeight, startIndex);
    setStart(startIndex);
    setEnd(endIndex);
  },
  { wait: 17 }
);
```

因为我想聊的是虚拟滚动最基本的原理，所以在这里的示例中基本没有什么优化，显而易见的是我们对于高度的遍历处理是比较低效的，即使进行万次加法计算的消耗并不大，但是在大型应用中还是应该尽量避免做如此大量的计算。那么显而易见的一个优化方向是我们可以实现高度的缓存，简单来说就是对于已经计算过的高度我们可以缓存下来，这样在下次计算时就可以直接使用缓存的高度，而不需要再次遍历计算，而出现高度变化需要更新时，我们可以从当前节点到最新的缓存节点之间，重新计算缓存高度。而且这种方式相当于是递增的有序数组，还可以通过二分等方式解决查找的问题，这样就可以避免大量的遍历计算。

```
height: 10 20 30 40  50  60  ...
cache:  10 30 60 100 150 210 ...
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://juejin.cn/post/7232856799170805820
https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
https://arco.design/react/components/list#%E6%97%A0%E9%99%90%E9%95%BF%E5%88%97%E8%A1%A8
```
