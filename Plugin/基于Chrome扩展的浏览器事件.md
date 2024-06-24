# 基于Chrome扩展的浏览器事件

## 描述
前段时间

## JavaScript事件 

OnCopy

OnPaste
那么除了`OnCopy`的事件，我们同样也可以聊一下`OnPaste`的事件

```js
document.onpaste = console.log;
console.log(document.execCommand("paste"));
```

在这`2s`的延时需要我们将焦点移动到`document`上，也就是需要点击`body`中任意元素，当然直接点击`input`也是可行的。实际上在前边我们经过`OnCopy`部分的测试，可以得知在用户主动触发可信事件之后一段时间内的事件都是可信的，但是浏览器的安全策略中还有焦点方面的考量。在某些操作中焦点必须要在`document`上，否则操作不会正常执行，与之对应的异常就是`DOMException: Document is not focused.`，而此时我们的焦点是在控制台`Console`面板上的，这里同样可能存在不可控的问题，因此我们需要延时执行以便转移焦点到`document`上。

```js
const input = document.createElement("input");
input.setAttribute("style", "position:fixed; top:0; right: 0");
document.body.appendChild(input);
setTimeout(() => {
  input.focus();
  console.log(document.execCommand("paste"));
}, 2000);
```

## DevToolsProtocol


OnCopy



在具体研究`OnPaste`之前，我们可以延续之前的代码在`debugger`中执行`document.execCommand("paste")`。

```js
chrome.debugger
  .attach({ tabId }, "1.2")
  .then(() =>
    chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
      type: "keyDown",
      // ...
    })
  )
  .then(() => {
    return chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
    expression:
        "document.onpaste = console.log;" + "console.log(document.execCommand('paste'))",
    });
  })
  .finally(() => {
    chrome.debugger.detach({ tabId });
  });
```

`clipboardRead` 权限 `navigator.clipboard.read`有限的剪贴板内容读取 让用户点击授权在某些情况下可能并不是很现实

```js
setTimeout(() => {
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
}, 2000);
```

`text/plain`、`text/html`、`image/png`等常见的

```js
setTimeout(() => {
  navigator.clipboard.read().then(res => {
    for (const item of res) {
      item.getType("application/x-slate-fragment").then(console.log).catch()
    }
  });
}, 2000);
```

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


## 网页离线PDF导出
在前段时间刷社区的时候发现有不少用户希望能够将网页保存为`PDF`文件，方便作为快照保存以供离线阅读。

图片无法选择 目录大纲

