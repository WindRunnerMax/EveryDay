# Canvas编辑器之剪贴板数据处理

在这里我们先来聊聊我们究竟应该如何操作剪贴板，也就是我们在浏览器的复制粘贴事件，并且在此基础上聊聊我们在`Canvas`图形编辑器中应该如何控制焦点以及如何实现复制粘贴行为。

* 在线编辑: <https://windrunnermax.github.io/CanvasEditor>
* 开源地址: <https://github.com/WindRunnerMax/CanvasEditor>

关于`Canvas`简历编辑器项目的相关文章:

* [掘金老给我推Canvas，我也学习Canvas做了个简历编辑器](./基于Canvas构建简历编辑器.md)
* [Canvas简历编辑器#2-数据结构与History(undo/redo)](./Canvas编辑器之数据结构设计.md)
* [Canvas简历编辑器#3-我的剪贴板里究竟有什么数据](./Canvas编辑器之剪贴板数据处理.md)
* [Canvas简历编辑器#4-图形绘制与状态管理(轻量级DOM)](./Canvas编辑器之图形状态管理.md)
* [Canvas简历编辑器#5-Monorepo+Rspack工程实践](./Canvas编辑器之Rspack工程实践.md)
* [Canvas简历编辑器#6-层级渲染与事件管理能力设计](./Canvas编辑器之层级渲染事件管理.md)
* [Canvas简历编辑器#7-选中绘制与拖拽多选交互方案](./Canvas编辑器之选中绘制交互方案.md)

## 剪贴板

我们在平时使用一些在线文档编辑器的时候，可能会好奇一个问题，为什么我能够直接把格式复制出来，而不仅仅是纯文本，甚至于说从浏览器中复制内容到`Office Word`都可以保留格式，看起来是不是一件很神奇的事情，不过当我们了解到剪贴板的基本操作之后，就可以了解这其中的底层实现了。

说到剪贴板，我们可能以为我们复制的就是纯文本，当然显然光靠复制纯文本我们是做不到这一点的，所以实际上剪贴板是可以存储复杂内容的，那么在这里我们以`Word`为例，当我们从`Word`中复制文本时，其实际上是会在剪贴板中写入这么几个`key`值:

```text
text/plain
text/html
text/rtf
image/png
```

看着`text/plain`是不是很眼熟，这明显就是我们常见的`Content-Type`或者称作`MIME-Type`，所以说我们是不是可以认为剪贴板是一个`Record<string, string>`的类型，但是别忽略了我们还有一个`image/png`类型，因为我们的剪贴板是可以复制文件的，所以我们常用的剪贴板类型就是`Record<string, string | File>`，**例如此时复制这段文字***在剪贴板中就是如下内容*。

```text
text/plain
例如此时复制这段文字在剪贴板中就是如下内容

text/html
<meta charset='utf-8'><strong style="...">例如此时复制这段文字</strong><em style="...">在剪贴板中就是如下内容</em>
```

那么我们粘贴的时候就很明显了，我们只需要从剪贴板里读取内容就可以了，例如我们从语雀复制内容到飞书中，我们在语雀复制的时候会将`text/plain`以及`text/html`写入剪贴板，在粘贴到飞书的时候就可以首先检查是否有`text/html`的`key`，如果有的话就可以读取出来，并且将其解析成为飞书自己的私有格式，就可以通过剪贴板来保持内容格式粘贴到飞书了，如果没有`text/html`的话，就直接将`text/plain`的内容写到私有的`JSON`数据即可。

此外，我们还可以考虑到一个问题，在上边的例子中实际上我们是复制时需要将`JSON`转到`HTML`字符串，在粘贴时需要将`HTML`字符串转换为`JSON`，这都是需要进行序列化与反序列化的，是需要有性能消耗以及内容损失的，所以是不是能减少这部分消耗，那么当然是可以的，通常来说如果是在应用内直接直接粘贴的话，可以直接通过剪贴板的数据直接`compose`到当前的`JSON`即可，这样就可以更完整地保持内容以及减少对于`HTML`解析的消耗。例如在飞书中，会有`docx/text`的独立`Clipboard Key`以及`data-lark-record-data`作为独立`JSON`数据源。

那么至此我们已经了解到剪贴板的工作原理，紧接着我们就来聊一聊如何进行复制操作，说到复制我们可能通常会想到`clipboard.js`，如果需要兼容性比较高的话可以考虑，但是如果需要在现在浏览器中使用的话，则可以直接考虑使用`HTML5`规范的`API`完成，在浏览器中关于复制的`API`常用的有两种，分别是`document.execCommand("copy")`以及`navigator.clipboard.write`。

对于`document.execCommand("copy")`来说，我们可以直接借助`textarea + execCommand`来执行写剪贴板的操作，在这里需要注意的是如果这个事件必须要是`isTrusted`的事件，也就是说这个事件必须要是用户触发的，例如点击事件、键盘事件等等，如果我们在打开页面后直接执行这段代码的话，则实际上是不会触发的。此外，如果在控制台执行这段代码的话，写入剪贴板是可行的，因为我们通常会用回车这个操作来执行代码，所以这个事件是`isTrusted`的。

```js
const TEXT_PLAIN = "text/plain";

const data = {"text/plain": "1", "text/html":"<div>1</div>"};
const textarea = document.createElement("textarea");
textarea.addEventListener(
  "copy",
  event => {
    for (const [key, value] of Object.entries(data)) {
      event.clipboardData && event.clipboardData.setData(key, value);
    }
    event.stopPropagation();
    event.preventDefault();
  },
  true
);
textarea.style.position = "fixed";
textarea.style.left = "-999px";
textarea.style.top = "-999px";
textarea.value = data[TEXT_PLAIN];
document.body.appendChild(textarea);
textarea.select();
document.execCommand("copy");
document.body.removeChild(textarea);
```

对于`navigator.clipboard`来说，如果我们只写入纯文本的话是比较简单的，直接调用`write`方法即可，只不过需要注意`Document is focused`，也就是焦点需要在当前页面内。如果需要在剪贴板中写入其他的值，则需要`ClipboardItem`对象来写入`Blob`，在这里需要注意的是，`FireFox`只有`Nightly`中有定义，所以在这里需要判断下，如果不存在这个对象的话就需要走降级的复制，可以使用上述的`document.execCommand API`。

```js
const data = {"text/plain": "1", "text/html":"<div>1</div>"};
if (navigator.clipboard && window.ClipboardItem) {
  const dataItems = {};
  for (const [key, value] of Object.entries(data)) {
    const blob = new Blob([value], { type: key });
    dataItems[key] = blob;
  }
  navigator.clipboard.write([new ClipboardItem(dataItems)]);
}
```

紧接着我们可以聊下粘贴行为，在这里我们可以用`onPaste`事件以及`navigator.clipboard.read`方法，对于`navigator.clipboard.read`方法来说，我们可以直接读取并且打印即可，在这里需要注意的是需要`Document is focused`，所以这里我们需要在控制台延时几秒，然后将鼠标点击到页面上才可以正常打印，此外还有一个问题是打印的`types`并不完整，可能是必须要规范内的`MIME Type`才直接支持，自定义的`key`不支持。

```js
navigator.clipboard.read().then(res => {
  for (const item of res) {
    const types = item.types;
    for (const type of types) {
      item.getType(type).then(data => {
        const reader = new FileReader();
        reader.readAsText(data, "utf-8");
        reader.onload = () => {
          console.info(type, reader.result);
        };
      });
    }
  }
});
```

针对`onPaste`事件，我们可以通过`clipboardData`获取更加完整的相关数据，我们可以获取比较完整的数据以及构造`File`数据，这里可以使用下面的代码直接在控制台执行，并且可以将内容粘贴到其中，这样就可以打印出当前剪贴板的内容了。

```js
const input = document.createElement("input");
input.style.position = "fixed";
input.style.top = "100px";
input.style.right = "10px";
input.style.zIndex = "999999";
input.style.width = "200px";
input.placeholder = "Read Clipboard On Paste";
input.addEventListener("paste", event => {
  const clipboardData = event.clipboardData || window.clipboardData;
  for (const item of clipboardData.items) {
    console.log(`%c${item.type}`, "background-color: #165DFF; color: #fff; padding: 3px 5px;");
    console.log(item.kind === "file" ? item.getAsFile() : clipboardData.getData(item.type));
  }
});
document.body.appendChild(input);
```

## Clipboard模块
上边我们已经了解到如何操作我们的剪贴板了，那么下面我们就需要将其应用在编辑器当中了，不过我们首先需要关注焦点问题，因为在编辑器中我们不能保证所有的焦点都是在编辑器`Canvas`上的，比如我弹出一个输入框输入画布大小的时候，也是可能会使用粘贴行为的，而如果此时进行粘贴是会触发`document`上的`onPaste`事件的，那么此时就有可能错误的将不应该粘贴的内容插入到剪贴板当中了，所以我们需要处理焦点，也就是说我们需要确定当前操作是在编辑器上的时候才触发`Copy/Paste`行为。

平时我做富文本相关的功能比较多，所以在实现画板的时候总想按照富文本的设计思路来实现，同样的因为之前也说过我们需要实现`History`以及在编辑面板富文本的能力，所以焦点就很重要，如果焦点不在画板上的时候如果按下`Undo/Redo`键画板是不应该响应的，所以现在就需要有一个状态来控制当前焦点是否在`Canvas`上，经过调研发现了两个方案，方案一是使用`document.activeElement`，但是`Canvas`是不会有焦点的，所以需要将`tabIndex="-1"`属性赋予`Canvas`元素，这样就可以通过`activeElement`拿到焦点状态了，方案二是在`Canvas`上方再覆盖一层`div`，通过`pointerEvents: none`来防止事件的鼠标指针事件，但是此时通过`window.getSelection`是可以拿到焦点元素的，此时只需要再判断焦点元素是不是设置的这个元素就可以了。

当焦点的问题解决之后，我们就可以直接进行剪贴板的读写了，这部分实现就比较简单了，在复制的时候需要注意到将内容序列化为`JSON`字符串，并且还要写入一个`text/plain`的占位符，这样可以让用户在其他地方粘贴的时候是有感知的，对于我们的编辑器自身而言是不需要感知的。

```js
public static KEY = "SKETCHING_CLIPBOARD_KEY";
private copyFromCanvas = (e: ClipboardEvent, isCut = false) => {
  const clipboardData = e.clipboardData;
  if (clipboardData) {
    const ids = this.editor.selection.getActiveDeltaIds();
    if (ids.size === 0) return void 0;
    const data: Record<string, DeltaLike> = {};
    for (const id of ids) {
      const delta = this.editor.deltaSet.get(id);
      if (!delta) return void 0;
      data[id] = delta.toJSON();
      if (isCut) {
        const parentId = this.editor.state.getDeltaStateParentId(id);
        this.editor.state.apply(new Op(OP_TYPE.DELETE, { id, parentId }));
      }
    }
    const str = TSON.stringify(data);
    str && clipboardData.setData(Clipboard.KEY, str);
    clipboardData.setData("text/plain", "请在编辑器中粘贴");
    isCut && this.editor.canvas.mask.clearWithOp();
    e.stopPropagation();
    e.preventDefault();
  }
};
```

粘贴的这部分需要处理一个交互问题，用户肯定是希望在多选时也可以直接粘贴多个图形的，所以在此处我们需要处理好粘贴的位置，在这里我用的方法是取的所有选中图形的中点，在用户触发粘贴行为时将中点对齐到此时鼠标所在的位置，并且计算好偏移量应用到反序列化的图形上，这样就可以做到跟随用户的鼠标进行粘贴了，这里还有一点是需要替换掉粘贴图形的`id`，这是新的图形当然就需要有新的唯一标识符。

```js
public static KEY = "SKETCHING_CLIPBOARD_KEY";
private onPaste = (e: ClipboardEvent) => {
  if (!this.editor.canvas.isActive()) return void 0;
  const clipboardData = e.clipboardData;
  if (clipboardData) {
    const str = clipboardData.getData(Clipboard.KEY);
    const data = str && TSON.parse<Record<string, DeltaLike>>(str);
    if (data) {
      let range: Range | null = null;
      Object.values(data).forEach(deltaLike => {
        const { x, y, width, height } = deltaLike;
        const current = Range.fromRect(x, y, width, height);
        range = range ? range.compose(current) : current;
      });
      const compose = range as unknown as Range;
      if (compose) {
        const center = compose.center();
        const cursor = this.editor.canvas.root.cursor;
        const { x, y } = center.diff(cursor);
        Object.values(data).forEach(deltaLike => {
          const id = getUniqueId();
          deltaLike.id = id;
          deltaLike.x = deltaLike.x + x;
          deltaLike.y = deltaLike.y + y;
          const delta = DeltaSet.create(deltaLike);
          delta &&
            this.editor.state.apply(new Op(OP_TYPE.INSERT, { delta, parentId: ROOT_DELTA }));
        });
      }
    }
    e.stopPropagation();
    e.preventDefault();
  }
};
```

## 总结
本文我们介绍总结了应该如何操作剪贴板，也就是我们在浏览器的复制粘贴行为，并且在此基础上聊到了在`Canvas`图形编辑器中的焦点问题以及如何实现复制粘贴行为，虽然暂时不涉及到`Canvas`本身，但是这都是作为编辑器本身的基础能力，也是通用的能力可以学习。

针对于这个编辑器我们可以介绍的能力还有很多，整体来看会涉及到数据结构、`History`模块、复制粘贴模块、画布分层、事件管理、无限画布、按需绘制、性能优化、焦点控制、参考线、富文本、快捷键、层级控制、渲染顺序、事件模拟、`PDF`排版等等，整体来说还是比较有意思的，欢迎关注我并留意后续的文章。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://github.com/WindRunnerMax/CanvasEditor>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas>
- <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D>
