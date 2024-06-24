# 基于Chrome扩展的浏览器事件

## 描述
前段时间

为了方便处理演示`DEMO`，我们的事件触发全部都是`DOM0`级的事件绑定形式。

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



那么同样的我们接下来就研究下`OnPaste`事件，那么首先我们并不在权限清单中声明`clipboardRead`权限，紧接着我们延续之前的代码在`debugger`中执行`document.execCommand("paste")`，发现执行的结果是`false`，这表示即使在可信的条件下，执行`paste`仍然是无法取得结果的。那么如果我们在`permissions`中声明了`clipboardRead`，可以发现仍然是`false`，这说明在用户脚本`Inject Script`下执行`document.execCommand("paste")`是无法取得效果的。

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

那么我们继续保持不在清单中声明`clipboardRead`权限，尝试用`DevToolsProtocol`的方式执行`document.execCommand("paste")`，此时是可以正常触发事件的，这里实际上就表明了通过`CDP`协议直接执行事件是完全以用户主动触发的形式来进行的，其本身就是可信的事件源。

```js
chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
  type: "keyDown",
  modifiers: 4,
  keyCode: 86,
  key: "v",
  code: "KeyV",
  windowsVirtualKeyCode: 86,
  nativeVirtualKeyCode: 86,
  isSystemKey: true,
  commands: ["selectAll"],
});
```

紧接着我们简单更改一下先前在用户态执行的`Js`事件操作，将执行的`copy`命令改为`paste`命令，也就是在`Content Script`执行`document.execCommand("paste")`，此时仍然是会返回`false`。那么别忘了此时我们还没有声明清单中的`clipboardRead`权限，那么当我们声明权限之后，再次执行`document.execCommand("paste")`，发现此时的结果是`true`并且可以正常触发事件。

```js
case PCBridge.REQUEST.COPY_ALL: {
  document.onpaste = console.log;
  console.log(document.execCommand("paste"));
  break;
}
```

而如果我们更进一步，继续保持清单中的`clipboardRead`权限声明，将事件传递到`Inject Script`中执行，可以发现即使是在声明了权限的情况下，`document.execCommand("paste")`返回的结果仍然是`false`且无法触发事件，这也印证了之前我们说的在`Inject Script`下执行`paste`命令是无法正常触发的，进而我们可以明确`clipboardRead`权限是需要我们在`Content Script`中使用的。

```js
// Content Script
case PCBridge.REQUEST.COPY_ALL: {
  document.dispatchEvent(new CustomEvent("custom-event"));
  break;
}

// Inject Script
document.addEventListener("custom-event", () => {
  document.onpaste = console.log;
  console.log(document.execCommand("paste"));
});
```

实际上在现代浏览器中我们还有`navigator.clipboard API`来操作剪贴板，`navigator.clipboard.read`有限的剪贴板内容读取 让用户点击授权在某些情况下可能并不是很现实

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



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://chromedevtools.github.io/devtools-protocol/
https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
https://developer.chrome.google.cn/docs/extensions/reference/api/debugger?hl=zh-cn
```
