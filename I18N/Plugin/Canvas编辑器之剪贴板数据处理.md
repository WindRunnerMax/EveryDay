# Handling Clipboard Data in Canvas Editor

Let's discuss how we should handle the clipboard, specifically dealing with copy and paste events in a web browser, and then delve into how to control focus and implement copy-paste behavior in a `Canvas` graphic editor.

* Online editor: [Canvas Editor](https://windrunnermax.github.io/CanvasEditor)
* Open Source repository: [GitHub - Canvas Editor](https://github.com/WindrunnerMax/CanvasEditor)

Articles related to the `Canvas` resume editor project:

* [Got Pushed Towards Canvas by Juejin, So I Learned and Made a Resume Editor](https://juejin.cn/post/7329799331216015395)
* [Canvas Graphic Editor - Data Structure and History (undo/redo)](https://juejin.cn/post/7331575219957366836)
* [Canvas Graphic Editor - What's in My Clipboard?](https://juejin.cn/post/7331992322233024548)
* [Canvas Resume Editor - Graphic Drawing and State Management (Lightweight DOM)](https://juejin.cn/spost/7354986873733333055)
* [Canvas Resume Editor - Monorepo + Rspack Engineering Practice](https://juejin.cn/spost/7357349281885503500)
* [Canvas Resume Editor - Layer Rendering and Event Management Design](https://juejin.cn/spost/7376197082203684873)

## Clipboard

When using online document editors, we might wonder how we can copy formatted content instead of plain text. Even copying content from a web browser to `Office Word` while retaining the formatting seems magical. However, once we understand the basic clipboard operations, we can uncover how this is achieved.

Speaking of the clipboard, one might assume that only plain text can be copied. However, simply copying plain text won't achieve this. In reality, the clipboard can store complex content. Taking `Word` as an example, when we copy text from `Word`, several `key` values are written to the clipboard:

```text
text/plain
text/html
text/rtf
image/png
```

You might find `text/plain` familiar. It is similar to the common `Content-Type` or `MIME-Type`. Hence, we can consider the clipboard as a type of `Record<string, string>`. Let's not overlook the `image/png` type as well. Since files can be copied to the clipboard, the commonly used clipboard type is `Record<string, string | File>`. **For instance, copying this text** will result in the following content in the clipboard:

```text
text/plain
For instance, copying this text will result in the following content in the clipboard

text/html
<meta charset='utf-8'><strong style="...">For instance, copying this text</strong><em style="...">will result in the following content in the clipboard</em>
```

When we paste, it's evident that we only need to read the content from the clipboard. For example, when we copy content from one platform to another, such as from Yuque to Feishu, copying from Yuque writes `text/plain` and `text/html` to the clipboard. While pasting to Feishu, one can first check for the `text/html` `key` and read it out, then parse it into Feishu's proprietary format. This way, content formatting can be preserved and pasted into Feishu using the clipboard. If there is no `text/html`, simply write the content of `text/plain` to Feishu's private `JSON` data.

Additionally, another consideration is that converting `JSON` to `HTML` strings when copying and vice versa when pasting incurs performance costs and content loss. To minimize this, when directly pasting within an application, one can directly `compose` the clipboard data into the current `JSON`. This can maintain content integrity and reduce the parsing costs of `HTML`. For instance, in Feishu, there are independent `Clipboard Keys` for `docx/text` and `data-lark-record-data` for separate `JSON` data sources.

Having understood the workings of the clipboard, let's now discuss how to perform copy operations. When it comes to copying, many might think of `clipboard.js`, which is advisable for better compatibility. However, for modern browsers, one can directly consider using the `HTML5` standard `API` for copying. In browsers, the two commonly used `APIs` for copying are `document.execCommand("copy")` and `navigator.clipboard.write`.

When it comes to `document.execCommand("copy")`, we can directly use `textarea + execCommand` to carry out clipboard writing operations. It is important to note that this event must be a `isTrusted` event, meaning it must be triggered by the user, like a click event, keyboard event, and so on. If we execute this code directly after the page loads, it will not actually trigger. Additionally, if this code is executed in the console, writing to the clipboard is feasible because we usually use the enter key to execute code, thus making the event `isTrusted`.

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

As for `navigator.clipboard`, if we are only writing plain text, it is relatively simple, just call the `write` method directly, but ensure that the `Document is focused`, meaning the focus needs to be within the current page. If writing other values to the clipboard is required, then the `ClipboardItem` object is needed to write a `Blob`. In this case, it is worth noting that `FireFox` only defines this in `Nightly`, so if this object doesn't exist, fallback copying can be done using the aforementioned `document.execCommand API`.

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

Moving on to the paste behavior, we can use the `onPaste` event and the `navigator.clipboard.read` method. With the `navigator.clipboard.read` method, we can directly read and print the data. It is important to note that the `Document is focused`, so there needs to be a slight delay in the console, then clicking within the page is required to print the data. Furthermore, a problem arises with incomplete printing of `types`, possibly due to the requirement for standardized `MIME Types` to be directly supported, thus custom `keys` are not supported.

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

For the `onPaste` event, we can obtain more comprehensive data using `clipboardData`, enabling us to retrieve detailed information and construct `File` data. The following code can be directly executed in the console, allowing content to be pasted, thus enabling the current clipboard content to be printed.

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

## Clipboard Module
So, we've learned how to manipulate our clipboard. Now, it's time to apply it in the editor. But first, we need to address the focus issue. In the editor, we can't assume that all focus is on the 'Canvas.' For instance, when I pop up an input field to enter the canvas size, pasting might be used. If a paste action triggers the 'onPaste' event on the 'document,' it could mistakenly insert unwanted content into the clipboard. Hence, we need to manage the focus. That means we need to ensure that 'Copy/Paste' actions are only triggered when the current operation is on the editor.

Since I often work on rich text-related functionalities, I tend to implement the drawing board based on rich text design principles. As mentioned before, we'll need to implement 'History' and the ability to work with rich text in the editing panel. So, focus is crucial. If the focus is not on the drawing board and 'Undo/Redo' keys are pressed, the drawing board shouldn't respond. Therefore, we now need a status to control whether the focus is on the 'Canvas.' After some research, two solutions were found. The first is to use 'document.activeElement,' but the 'Canvas' won't have focus, so we need to assign the 'tabIndex="-1"' property to the 'Canvas' element to retrieve the focus state using 'activeElement.' The second solution is to overlay a 'div' on top of the 'Canvas,' using 'pointerEvents: none' to prevent mouse pointer events. However, we can still retrieve the focus element using 'window.getSelection,' so we just need to verify if the focus element matches the assigned element.

Once the focus issue is resolved, we can directly perform clipboard reading and writing. This part is relatively straightforward. When copying, remember to serialize the content into a JSON string and write a 'text/plain' placeholder. This allows users to paste with awareness elsewhere, without the editor itself needing to be aware.

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
    clipboardData.setData("text/plain", "Please paste in the editor");
    isCut && this.editor.canvas.mask.clearWithOp();
    e.stopPropagation();
    e.preventDefault();
  }
};
```

The pasted content needs to address an interaction issue. Users surely want to paste multiple shapes when selecting multiple ones. So, we need to handle the paste position properly here. I used a method to get the midpoint of all selected shapes, align it to the current mouse position when the user triggers the paste action, calculate the offset and apply it to the deserialized shapes. This way the paste action can follow the user's mouse. Additionally, it is necessary to replace the `id` of the pasted shapes with new unique identifiers for the new shapes.

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

## Final Words
In this article, we summarized how to handle clipboard operations in a browser, specifically focusing on copy-paste behavior and discussing the focus issues in a `Canvas` graphic editor and how to implement copy-paste behavior. Even though we didn't delve into the `Canvas` specifics here, these are fundamental capabilities of an editor and can be universally applied and learned. There are many more capabilities we can explore regarding this editor, such as data structures, `History` module, copy-paste module, canvas layering, event management, infinite canvas, on-demand rendering, performance optimization, focus control, guides, rich text, shortcuts, layer management, rendering order, event simulation, `PDF` typesetting, and more. Overall, it's quite fascinating. Stay tuned for more articles and feel free to follow me for updates.

## Daily Question

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://github.com/WindRunnerMax/CanvasEditor>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas>
- <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D>
```