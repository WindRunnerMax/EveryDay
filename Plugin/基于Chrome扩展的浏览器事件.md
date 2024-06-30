# 基于Chrome扩展的浏览器事件
`Chrome`扩展是一种可以在浏览器中添加新功能和修改浏览器行为的软件程序，我们可以基于`Manifest`规范的`API`实现对于浏览器和`Web`页面在一定程度上的修改，例如广告拦截、代理控制等。`Chrome DevTools Protocol`则是`Chrome`浏览器提供的一套与浏览器进行交互的`API`，我们可以基于`DevTools`协议控制`Chromium`内核的浏览器进行各种操作，例如操作页面元素、模拟用户交互等。

## 描述
前段时间我们需要实现一个比较复杂的需求，经常做需求的同学都知道，很多功能并不是可以按步就班地实现的，在某些情况下例如要跨部门甚至无法联系合作的情况下，单方面跨系统完成一些事情就可能需要动用不同寻常的方法。当然具体需求的内容不是很方便表达，所以在这里我们就替代为其他方面的需求展开文章的叙述，虽然实现的目的不一样，但是最终想要表达的技术方案是类似的。

因此在这里假设我们的背景变成了另一个故事，前段时间语雀进行了商业化，对于用户文章的数量和分享都做了一些限制，那么此时我们可能希望将现在已经写过的文档内容抽离出来，将其放在`GitHub`或者其他软件中作备份或分享等。那么此时问题来了，熟悉富文本的同学都知道，我们在语雀上存储的文档都是`JSON`文件而不是`MarkDown`等，会存在固定的私有格式，因此我们可能需要对其先进行一遍解析，而调用语雀的`OpenAPI`所需要的`Personal Token`是需要超级会员的，因此我们可能只能走比较常用的`Cookie`以及私有格式的解析方案，或者自动化操作`Puppeteer`模拟导出文档也是可行的。

那么有没有更加通用的方案可以参考，熟悉富文本的同学还知道，由于富文本需要实现`DOM`与选区`MODEL`的映射，因此生成的`DOM`结构通常会比较复杂，而当我们从文档中复制内容到剪贴板时，我们会希望这个结构是更规范化的，以便粘贴到其他平台例如飞书、`Word`等时会有更好的解析。因此我们便可以借助这一点来获取更加通用的方案，毕竟通过`HTML`解析成`MarkDown`等格式社区有很多完善的方法而不需要我们自行解析了，此外由于我们是通过`HTML`来描述内容，对于文档的内容完整性保持的会更好一些，自行解析的情况下可能会由于复杂的嵌套内容需要不断完善解析程序。

当然在这里只是平替了一下需求，前边我们也提到了背景是假设出来的，而由这个背景则延伸出了我们文章要聊的解决方案，如果真的是针对于语雀的这个迁移问题，在批量处理内容的情况下还是自行解析`JSON`会更方便一些。那么我们可以继续沿着提取`HTML`内容的思路处理数据，首先我们需要考虑如何获取这个`HTML`内容，最简单的方案就是我们通过读取`Node.innerHTML`属性来获取`DOM`结构，那么问题来了，在语雀当中有大量的`ne`开头的标签，以及大量的`ne`属性值来表达样式，以简单的文本与加粗为例，其`HTML`内容是这样的，其实语雀还算比较简单的结构，如果是飞书的表达则更加复杂。 

```html
<!-- 语雀 -->
<ne-p id="u5aec73be" data-lake-id="u5aec73be">
  <ne-text id="u1e4a00ce">123</ne-text>
  <ne-text id="ucc026ff4" ne-bold="true">123</ne-text>
  <span class="ne-viewer-b-filler" ne-filler="block"><br></span>
</ne-p>

<!-- 飞书 -->
 <div class="block docx-text-block" data-block-type="text" data-block-id="2" data-record-id="doxcns7E9SHaX2Xft1XweL0Mqwth">
  <div class="text-block-wrapper">
    <div class="text-block">
      <div class="zone-container text-editor non-empty" data-zone-id="2" data-zone-container="*" data-slate-editor="true" contenteditable="true">
        <div class="ace-line" data-node="true" dir="auto">
          <span data-string="true" class=" author-0087753711195911211" data-leaf="true">123</span>
          <span data-string="true" style="font-weight:bold;" class=" author-0087753711195911211" data-leaf="true">123</span>
          <span data-string="true" data-enter="true" data-leaf="true">&ZeroWidthSpace;</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

可以看出来，我们取得这样的`HTML`解析起来相对成本还是比较高的，而如果我们以上述的剪贴板思路，也就是富文本通常会对复制的内容作`Normalize`处理，那么我们可以通过剪贴板事件来获取这个规范化的内容，然后再进行处理`HTML`，这里的`HTML`内容就会规范很多，那么同样也会便于我们处理数据。在这里实际上通常还会有私有类型的数据，这里就是我们选中部分取得的渲染`Fragment`，通常是用来在编辑器内部粘贴处理数据无损化还原使用的，如果对于数据格式非常熟悉的话解析这部分内容也是可以的，只是并没有比较高的通用性。

```html
<!-- 语雀 -->
<div class="lake-content" typography="classic">
  <p id="u5aec73be" class="ne-p" style="margin: 0; padding: 0; min-height: 24px">
    <span class="ne-text">123</span>
    <strong><span class="ne-text">123</span></strong>
  </p>
</div>

<!-- 飞书 -->
<div data-page-id="doxcnTYldMboJldT2Mc2wXfervv6vqc" data-docx-has-block-data="false">
  <div class="ace-line ace-line old-record-id-doxcnsBUassFNud1XwL1vMgth">
    123<strong>123</strong>
  </div>
</div>
```

那么我们就可以继续沿着这个思路，以复制出的的内容为基准解析`HTML`格式解析内容，而实际上说了这么多我们最需要解决的问题是如何自动化提取内容，由此就引出了我们今天要聊的`Chrome`拓展与`Chrome DevTools Protocol`协议，当我们成功解决了内容问题之后，接下来将内容格式转换为其他格式社区就有很多成熟的方案了。文中涉及的相关代码都在`https://github.com/WindrunnerMax/webpack-simple-environment/tree/master/packages/chrome-debugger`中，在这里为了方便处理演示`DEMO`，我们的事件触发全部都是`DOM0`级的事件绑定形式。

## JavaScript事件 
既然我们的目标是自动操作浏览器执行复制操作，那么可供自动化操作的选择有很多例如`Selenium`、`Puppeteer`，都是可以考虑的方案。在这里我们考虑比较轻量的解决方案，不需要安装`WebDriver`等依赖环境，并且可以直接安装在用户本身的浏览器中开箱即用，基于这些考虑则使用`Chrome`扩展来帮我们实现目标是比较好的选择。并且`Chrome`扩展程序可以帮我们在`Web`页面中直接注入脚本，实现相关功能也会更加方便，关于使用扩展程序实现复杂的功能注入可以参考之前的文章，在这里就不重复叙述了。

那么接下来我们就需要考虑一下如何触发页面的`OnCopy`事件，试想一下此时我们的目的有两个，首先是让编辑器本身提取内容并规范化，其次是让转换后的内容写入剪贴板，那么实现的方式就很明确了，我们只需要主动在页面上触发`SelectAll`与`Copy`命令即可，那么接下来我们就可以在控制台中测试这两个命令的使用。

```js
document.execCommand("selectAll");
const res = document.execCommand("copy");
console.log(res); // true
```

当我们手动在控制台执行命令的时候，可以发现页面上的内容已经被选中并且复制到了剪贴板中，那么接下来我们就可以将这两个命令封装到一个函数中，然后通过`Content Script`注入到页面中，这样我们就可以在页面上直接调用这个函数就可以了。然而当我们真正借助`Chrome`扩展实现这个功能的时候，会发现页面能够正常全部选中，但是剪贴板的内容却是上次的内容，也就是本次复制并没有真正执行成功。

这实际上是由于浏览器的安全策略导致的，由于浏览器为了加强安全性，限制了一些可能会影响用户隐私的`API`，只有在用户的直接操作下才能运行，也就是相当于执行`Copy`命令只有在用户主动激活上下文中才可以正常触发，与之类似的就是当我们在`Js`中主动执行点击事件例如`Node.click()`时，其对于浏览器来说是不可信的，在事件触发时会携带`isTrusted`属性，只有用户主动触发的事件才会为`true`。因此我们在控制台中执行的命令被认为是浏览器的可信命令，是用户主动触发的事件，而在扩展中执行的不是用户主动触发的事件，进而命令执行失败。

那么为什么我们在控制台的命令就可以正常执行呢，实际上这是因为我们在执行控制台的命令时，会需要点击回车键来执行代码，注意这个回车键是我们主动触发的，因此浏览器会将我们执行的`Js`代码认为是可信的，所以我们可以正常执行`Copy`命令。而如果我们在执行代码时将其加入延时，例如我们延时`5s`再执行命令，此时我们就可以发现即使是同样的代码同样在控制台执行就无法写入剪贴板，`document.execCommand("copy")`的返回值就是命令是否执行成功，在`5s`的延时下我们得到的返回值就是`false`，我们可以同样在控制台中执行代码来获取命令执行状态，在这里也可以不断调整延时的时间来观察执行结果，例如将其设置为`2s`就可以获得`true`的返回值。

```js
setTimeout(() => {
  document.execCommand("selectAll");
  const res = document.execCommand("copy");
  console.log(res); // false
}, 5000);
```

我们暂且先放开需要用户主动激活的可信事件问题不谈，到后边再继续聊这个问题的解决方案。那么我们除了需要测试`OnCopy`事件之外，同样需要测试一下`OnPaste`的事件，不要忘记当我们执行了`OnCopy`提取内容之后，这部分内容实际上还是存在于剪贴板之中的，我们还需要将其提取出来。那么在执行下面的代码之后，我们可以发现`OnPaste`和`OnCopy`的策略还是不一样，即使是在用户的主动操作下，并且我们此时并没有延时执行，但是其结果依然是`false`，并且`document`绑定的事件也没有触发。

```js
document.onpaste = console.log;
const res = document.execCommand("paste");
console.log(res); // false
```

那么会不会是因为我们没有在`input`或者`textarea`中执行`paste`命令的原因，我们同样可以测试下这个问题。我们可以通过创建一个`input`元素，然后将其插入到`body`中，然后将焦点移动到这个`input`元素上，然后执行`paste`命令，然而我们仍然无法成功执行命令，而且我们执行`focus`的时候会发现并没有光标的出现，

```js
const input = document.createElement("input");
input.setAttribute("style", "position:fixed; top:0; right: 0");
document.body.appendChild(input);
input.focus();
const res = document.execCommand("paste");
console.log(res); // false
```

那么是不是还有其他原因会造成这个问题呢，在前边我们经过`OnCopy`部分的测试，可以得知在用户主动触发可信事件之后一段时间内的事件都是可信的，但是浏览器的安全策略中还有焦点方面的考量。在某些操作中焦点必须要在`document`上，否则操作不会正常执行，与之对应的异常就是`DOMException: Document is not focused.`，而此时我们的焦点是在控制台`Console`面板上的，这里同样可能存在不可控的问题。因此我们需要在这`2s`的执行延时中将焦点转移到`document`上，也就是需要点击`body`中任意元素，当然直接点击`input`也是可行的，然而即使这样我们也没有办法执行`paste`。

```js
const input = document.createElement("input");
input.setAttribute("style", "position:fixed; top:0; right: 0");
document.body.appendChild(input);
setTimeout(() => {
  input.focus();
  const res = document.execCommand("paste");
  console.log(res); // false
}, 2000);
```

实际上在经过查阅文档可以知道`document.execCommand("paste")`在`Web Content`中实际上已经是被禁用的，然而这个命令还是可以执行的，我们后边会继续聊到。在现代浏览器中我们还有`navigator.clipboard API`来操作剪贴板，`navigator.clipboard.read`可以实现有限的剪贴板内容读取，调用这个`API`时会出现明确的调用授权提示，主动授权对于用户隐私是没有问题的，只是在自动化场景下可能需要多出一步授权操作。

此外，我们提到了`navigator.clipboard`是有限的剪贴板内容读取，那么这个有限是指什么呢，实际上这个有限是指只能读取特定的类型，例如`text/plain`、`text/html`、`image/png`等常见的类型，而对于私有类型的数据则是无法读取的，例如我们在语雀中复制的`text/ne-inode Fragment`数据，这部分数据是无法通过`navigator.clipboard.read`来读取的，通过执行下面的代码并授权之后可以发现并没有任何输出。

```js
setTimeout(() => {
  navigator.clipboard.read().then(res => {
    for (const item of res) {
      item.getType("text/ne-inode").then(console.log).catch(() => null)
    }
  });
}, 2000);
```

我们实际上也可以通过遍历`navigator.clipboard`的内容来获得剪贴板的内容，同样的我们也只能获取`text/plain`、`text/html`、`image/png`等常见的规范`MIME-Type`类型。而这`2s`的耗时则是之前提到过的另一个限制，我们必须要在执行下面的代码之后将焦点移动到`document`上，否则控制台则会抛出`DOMException: Document is not focused.`异常，同样也不会出现授权弹窗。

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

那么我们可以设想一个问题，富文本编辑器中如果只是写数据的时候写入了自定义的`MIME-Type`类型，那么我们在剪贴板中应该如何读取呢。实际上这还是得回归到我们的`OnPaste`事件上，我们借助于`navigator.clipboard API`是无法读取这部分自定义`key`值的，虽然我们可以将其写入到复制出的`HTML`的某个节点作为`attributes`然后再读取，这样是可以但是没必要，我们可以直接在`OnPaste`事件中通过`clipboardData`获取更加完整的相关数据，我们可以获取比较完整的类型了，这个方法同样也可以用于在浏览器中方便地调试剪贴板的内容。

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

## DevToolsProtocol
在前边我们抛出了需要用户主动激活触发的可信事件问题，那么在部分我们就需要解决这个问题。首先我们需要解决的问题是如何将代码注入到页面中，当然这个问题我们已经说过多次了，就是借助于`Chrome`扩展将脚本注入即可。那么即使我们能够注入脚本，执行的代码仍然不是用户主动激活的事件，无法突破浏览器的安全限制，那么这时候就需要请出我们的`Chrome DevTools Protocol`协议了。

熟悉`E2E`的同学都知道，`DevToolsProtocol`协议是`Chrome`浏览器提供的一套与浏览器进行交互的`API`，无论是`Selenium`、`Puppeteer`、`Playwright`都是基于这个协议来实现的。我们甚至可以基于这个协议主动实现`F12`的调试面板，也就是说当前在`F12`开发者工具能够实现的功能我们都可以基于这个协议实现，而且其`API`也不仅仅只有调试面板的功能实现，并且诸如`chrome://inspect`等调试程序也可以通过这个协议来完成。

那么在这里就有新的问题了，如果我们采用`Selenium`、`Puppeteer`等方案就需要用户安装`WebDriver`或者`Node`等依赖项，不能做到让用户开箱即用，那么在这个时候我们就需要将目光转向`chrome.debugger`了。`Chrome.debugger API`可以作为`Chrome`的远程调试协议的另一种传输方式，使用`chrome.debugger`可以连接到一个或多个标签页来监控网络交互、调试`JavaScript`、修改`DOM`和`CSS`等等，对我们来说最重要的是这个`API`是可以在`Chrome`扩展中调用的，这样我们就可以做到开箱即用的应用程序。

那么接下来我们就来处理`OnCopy`的事件，因为`chrome.debugger`必须要在`worker`中进行，而我们的控制启动的按钮则是定义在`Popup`中的，所以我们就需要进行`Popup -> Worker`的事件通信，关于`Chrome`扩展的通信方案可以在之前的文章中找到，也可以在前边提到的仓库中找到，在这里就不过多叙述了。那么此时我们就需要在扩展中查询当前活跃的标签页，然后需要过滤下当前活跃标签的协议，例如`chrome://`协议的连接我们不会进行处理，然后在符合条件的情况下我们将`tabId`传递下去。

```js
cross.tabs
  .query({ active: true, currentWindow: true })
  .then(tabs => {
    const tab = tabs[0];
    const tabId = tab && tab.id;
    const tabURL = tab && tab.url;
    if (tabURL && !URL_MATCH.some(match => new RegExp(match).test(tabURL))) {
      return void 0;
    }
    return tabId;
  })
```

那么接下来我们就需要将协议控制持续挂载到当前活跃的`Tab`页上，当我们将扩展挂载`debugger`之后，会在用户的界面上提示我们的扩展已经开始调试此浏览器，这其实也是浏览器的一种安全策略，因为`debugger`的权限实在是太高了，给予用户可取消的操作还是非常有必要的。那么当挂载之后，我们就可以通过`chrome.debugger.sendCommand`来发送命令，例如我们可以通过`Input.dispatchKeyEvent`来模拟按键事件，在这里我们就需要借助按键的事件来发送`selectAll`命令，实际上发送命令这一环节是可以通过任何按键的发送来实现的，只不过为了符合实际操作我们选择了`Ctrl+A`的组合键。

```js
chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
  type: "keyDown",
  modifiers: 4,
  keyCode: 65,
  key: "a",
  code: "KeyA",
  windowsVirtualKeyCode: 65,
  nativeVirtualKeyCode: 65,
  isSystemKey: true,
  commands: ["selectAll"],
});
```

需要注意的是经过前边的按键事件发送之后，我们此时执行的事件就会是可信的，通过`DevToolsProtocol`的模拟按键事件对于浏览器来说是完全可信的，等同于用户主动触发的事件。那么接下来就可以直接通过`Eval`执行`document.execCommand("copy")`命令了，这里我们可以通过`Runtime.evaluate`来执行`Js`代码，当执行完毕后，我们就需要将`debugger`卸载出当前活跃的标签页。在我们提供的`DEMO`中，为了对齐之前直接用`Js`执行的操作，我们同样也会延时`5s`再执行操作，此时可以发现我们的代码是可以正常将内容写到剪贴板里的，也就是我们成功执行了`Copy`命令。

```js
chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
  expression: "const res = document.execCommand('copy'); console.log(res);",
})
.then(() => {
  chrome.debugger.detach({ tabId });
});
```

那么同样的接下来我们就研究在`DevToolsProtocol`中的`OnPaste`事件，那么首先我们并不在权限清单中声明`clipboardRead`权限，这是在`Chrome`扩展程序权限清单中的读剪贴板权限，紧接着我们延续之前的代码在`debugger`中执行`document.execCommand("paste")`，可以发现执行的结果是`false`，这表示即使在可信的条件下，执行`paste`仍然是无法取得结果的。那么如果我们在`permissions`中声明了`clipboardRead`，会可以发现仍然是`false`，这说明在用户脚本`Inject Script`下执行`document.execCommand("paste")`是无法取得效果的。

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
        "document.onpaste = console.log; const res = document.execCommand('paste'); console.log(res);",
      });
  })
  .finally(() => {
    chrome.debugger.detach({ tabId });
  });
```

那么我们继续保持不在清单中声明`clipboardRead`权限，尝试用`DevToolsProtocol`的方式执行`document.execCommand("paste")`，也就是在模拟按键时将命令发送出去。此时我们可以发现是可以正常触发事件的，这里实际上就同样表明了通过`DevToolsProtocol`协议直接执行事件是完全以用户主动触发的形式来进行的，其本身就是可信的事件源。

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
  commands: ["paste"],
});
```

紧接着我们简单更改一下先前在用户态执行的`Js`事件操作，将执行的`copy`命令改为`paste`命令，也就是在`Content Script`部分执行`document.execCommand("paste")`，此时仍然是会返回`false`，说明我们的命令执行并没有成功。那么别忘了此时我们还没有声明清单中的`clipboardRead`权限，而当我们在清单中声明权限之后，再次执行`document.execCommand("paste")`，发现此时的结果是`true`并且可以正常触发事件。

```js
document.onpaste = console.log;
case PCBridge.REQUEST.COPY_ALL: {
  const res = document.execCommand("paste");
  console.log(res);
  break;
}
```

而如果我们更进一步，继续保持清单中的`clipboardRead`权限声明，将事件传递到`Inject Script`中执行，可以发现即使是在声明了权限的情况下，`document.execCommand("paste")`返回的结果仍然是`false`，并且无法触发我们绑定的事件，这也印证了之前我们说的在`Inject Script`下执行`paste`命令是无法正常触发的，进而我们可以明确`clipboardRead`权限是需要我们在`Content Script`中使用的。而对于`navigator.clipboard API`即使在权限清单中声明权限的情况下 仍然还需要主动授权。

```js
// Content Script
case PCBridge.REQUEST.COPY_ALL: {
  document.dispatchEvent(new CustomEvent("custom-event"));
  break;
}

// Inject Script
document.onpaste = console.log;
document.addEventListener("custom-event", () => {
  const res = document.execCommand("paste");
  console.log(res);
});
```

## 网页离线PDF导出
在前段时间刷社区的时候发现有不少用户希望能够将网页保存为`PDF`文件，方便作为快照保存以供离线阅读，因此在这里也顺便聊一下相关实现方案，而实际上在这里也属于`Web`页面内容的提取，与我们上文聊的剪贴板操作本质上是类似的功能。那么在浏览器中我们当然可以通过`Ctrl + P`将`PDF`打印出来，然而通过打印的方式或者生成图片的方式导出的`PDF`文件就存在一些问题:

* 导出的`PDF`必须指定纸张大小，不能随意设定纸张大小，例如当想将页面导出为单页`PDF`的情况下就难以实现。
* 导出`PDF`时必须要弹出选择对话框，不能够静默导出并自动下载，这对于想要同时导出多个`Tab`页的批量场景不够友好。
* 导出的`PDF`不会自动携带`Outline`，也就是`PDF`的目录书签大纲，需要后续主动使用`pdf-lib`等工具来生成。
* 导出时必须要全页面打印，页面本身可能没有定义`@media print`样式预设，希望实现局部打印时会有些困难。
* 如果想在打印`PDF`前批量自定义样式，则需要为每个页面单独注入样式，这样的操作显然不适用于批量场景。
* 如果通过类似于`HTML2Canvas`的方式将页面转换为图片再转换为`PDF`，则会导致图片体积过大且文本不能选中的问题。

那么在这里我们可以借助`Chrome DevTools Protocol`协议来实现这个功能，实际上`DevTools Protocol`协议中有一个`Page.printToPDF`方法，这也是常用的`Node`服务端将`HTML`转换为`PDF`的常用方法，当然借助`PDFKit`等工具直接绘制生成`PDF`也是可行的，只不过成本很高。`Page.printToPDF`方法可以将当前页面导出为`PDF`文件，并且可以实现静默导出并自动下载，也可以实现自定义纸张大小，同时也可以实现`Outline`的生成，这个方法的使用也是非常简单的，只需要传递一个`PDF`的配置对象即可。

那么在调用方法之前，我们同样需要查询当前活跃的活动窗口，当然直接选择当前`Window`下的所有窗口也是可行的，此时需要注意权限清单中的`tabs`与`activeTab`权限的声明，同样的在这里我们仍然需要过滤`chrome://`等协议，只处理`http://`、`https://`、`file://`协议的内容。

```js
cross.tabs
  .query({ active: true, currentWindow: true })
  .then(tabs => {
    const tab = tabs[0];
    const tabId = tab && tab.id;
    const tabURL = tab && tab.url;
    if (tabURL && !URL_MATCH.some(match => new RegExp(match).test(tabURL))) {
      return void 0;
    }
    return tabId;
  })
```

接下来我们就可以根据`TabId`挂载`debugger`，前边提到了我们是希望将页面导出为单页`PDF`的，因此我们就需要将页面的高度和宽度取得，此时我们可以通过`Page.getLayoutMetrics`方法来获取页面的布局信息，这个方法会返回一个`LayoutMetrics`对象，其中包含了页面的宽度、高度、滚动高度等信息。然而当然我们也可以通过通信的方式将消息传递到`Content Script`中得到页面的宽高信息，在这里我们采用更加简单的方式，通过执行`Runtime.evaluate`的方式，获取得到的返回值，这样我们可以灵活地取得更多的数据，当然也可以灵活地控制页面内容，例如在滚动容器不是`window`的情况下就需要我们注入代码获取宽高以及控制打印范围。

```js
chrome.debugger
  .attach({ tabId }, "1.3")
  .then(() => {
    return chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
      expression:
        "JSON.stringify({width: document.body.clientWidth, height: document.body.scrollHeight})",
    });
  })
```

那么接下来我们就需要根据页面的宽高信息来设置`PDF`的配置对象，在这里需要注意的是我们通过`document`取得的宽高信息是像素大小，而在`Page.printToPDF`中的`paperWidth`和`paperHeight`是以`inch`为单位的，因此我们需要将其转换为`inch`单位，根据`CSS`规范`1px = 1/96th of 1 inch`，我们通常可以认为`1px = 1/96 inch`而不受设备物理像素的影响。此外，我们可以指定一些配置，当前我们输出的`PDF`只会包含第一页的内容，同时会包含背景颜色、生成文档大纲的配置，并且还有`Header`、`Footer`等配置选项，我们可以根据实际需求来设置输出格式，需要注意的是`generateDocumentOutline`是实验性的配置，在比较新的`Chrome`版本中才被支持。

```js
const value = res.result.value as string;
const rect = TSON.parse<{ width: number; height: number }>(value);
return chrome.debugger.sendCommand({ tabId }, "Page.printToPDF", {
  paperHeight: rect ? rect.height / 96 : undefined,
  paperWidth: rect ? rect.width / 96 : undefined,
  pageRanges: "1",
  printBackground: true,
  generateDocumentOutline: true,
});
```

那么在生成完毕后，我们接下来就需要将其下载到设备中，触发下载的方法又很多，例如可以将数据传递到页面中通过`a`标签触发下载。在扩展程序中实际上提供了`chrome.downloads.download`方法，这个方法可以直接下载文件到设备中，并且虽然传递数据参数名字为`url`，但是实际上并不会受到链接长度/字符数的限制，通过传递`Base64`编码的数据可以实现大量数据下载，只要注意在权限清单中声明权限即可。那么在下载完成之后，我们同样就可以将`debugger`分离当前`Tab`页，这样就完成了整个`PDF`导出的过程。

```js
const base64 = res.data as string;
chrome.downloads
  .download({ url: `data:application/pdf;base64,${base64}` })
  .finally(() => {
    chrome.debugger.detach({ tabId });
  });
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://chromedevtools.github.io/devtools-protocol/
https://github.com/microsoft/playwright/issues/29417
https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
https://developer.chrome.google.cn/docs/extensions/reference/api/debugger?hl=zh-cn
https://stackoverflow.com/questions/71005817/how-does-pixels-relate-to-screen-size-in-css
https://chromewebstore.google.com/detail/just-one-page-pdf/fgbhbfdgdlojklkbhdoilkdlomoilbpl
```
