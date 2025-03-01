# Browser events based on Chrome extensions
`Chrome` extensions are software programs that can add new features and modify browser behavior in the browser. We can use the `API` based on the `Manifest` specification to make modifications to the browser and web pages to a certain extent, such as ad blocking, proxy control, etc. The `Chrome DevTools Protocol` is an `API` provided by the Chrome browser for interacting with the browser. We can control the Chromium browser's kernel based on the `DevTools` protocol to perform various operations, such as manipulating page elements, simulating user interactions, etc.

## Description
Recently, we needed to implement a complex requirement. Those who frequently work on requirements know that many features cannot be implemented step by step. In some cases, such as when it is necessary to complete tasks across departments or when cooperation is not possible, unconventional methods may be required to accomplish tasks unilaterally across systems. Of course, it is not convenient to express the specific content of the requirement, so we will use other aspects of requirements to elaborate on the narrative in this article. Although the purpose of implementation is different, the technical solutions we want to convey are similar.

Therefore, let's assume that our background has changed to another story. Recently, Yuque has commercialized and imposed some restrictions on the number of user articles and sharing. At this point, we may want to extract the content of the documents already written, store them in `GitHub` or other software for backup or sharing purposes. However, familiar with rich text, we know that the documents stored on Yuque are `JSON` files rather than `Markdown`, and have a fixed private format. Therefore, we may need to parse them first, and since calling Yuque's `OpenAPI` requires a `Personal Token` from a super member, we may only be able to use more common solutions such as `Cookie` and private format parsing, or automating the operation of exporting documents using `Puppeteer`.

Are there more universal solutions to consider? Familiar with rich text, we know that because rich text requires mapping between `DOM` and selection `MODEL`, the generated `DOM` structure is usually more complex. When we copy content from a document to the clipboard, we hope that this structure is more standardized for better parsing when pasted into other platforms such as Feishu, `Word`, etc. Therefore, we can leverage this point to obtain a more universal solution. After all, there are many well-established methods in the community for parsing `HTML` into formats like `Markdown` without the need for manual parsing. In addition, since we describe content using `HTML`, the integrity of the document's content will be better maintained, as self-parsing may require continuous improvement of the parsing program due to complex nested content.

Of course, we have just replaced the requirements here, as mentioned earlier, the background is assumed, and this background has led to the solution we want to discuss in the article. If it is indeed for the migration issue of Yuque, self-parsing `JSON` in batch processing of content will be more convenient. So we can continue along the path of extracting `HTML` content to process the data. First, we need to consider how to obtain this `HTML` content. The simplest solution is to obtain the `DOM` structure by reading the `Node.innerHTML` property. However, in Yuque, there are many tags starting with `ne` and many `ne` attribute values to express styles. Taking simple text and bold as an example, the `HTML` content looks like this, and Yuque's structure is relatively simple, while Feishu's expression is more complex.

```html
<!-- Yuque -->
<ne-p id="u5aec73be" data-lake-id="u5aec73be">
  <ne-text id="u1e4a00ce">123</ne-text>
  <ne-text id="ucc026ff4" ne-bold="true">123</ne-text>
  <span class="ne-viewer-b-filler" ne-filler="block"><br></span>
</ne-p>
```

<!-- Feishu -->
<div class="block docx-text-block" data-block-type="text" data-block-id="2" data-record-id="doxcns7E9SHaX2Xft1XweL0Mqwth">
  <div class="text-block-wrapper">
    <div class="text-block">
      <div class="zone-container text-editor non-empty" data-zone-id="2" data-zone-container="*" data-slate-editor="true" contenteditable="true">
        <div class="ace-line" data-node="true" dir="auto">
          <span data-string="true" class=" author-x" data-leaf="true">123</span>
          <span data-string="true" style="font-weight:bold;" class=" author-x" data-leaf="true">123</span>
          <span data-string="true" data-enter="true" data-leaf="true">&ZeroWidthSpace;</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

It can be seen that parsing HTML in this way is relatively costly, and if we follow the clipboard approach mentioned above, rich text content is usually normalized when copied. By capturing the normalized content through clipboard events, we can then process the HTML, making it more standardized and easier to handle. In practice, there may also be private types of data, such as the rendered fragment we select, which is typically used for lossless data restoration within the editor. If you are familiar with the data format, parsing this part of the content is also possible, but it lacks high generality.

```html
<!-- Yuque -->
<div class="lake-content" typography="classic">
  <p id="u5aec73be" class="ne-p" style="margin: 0; padding: 0; min-height: 24px">
    <span class="ne-text">123</span>
    <strong><span class="ne-text">123</span></strong>
  </p>
</div>

<!-- Feishu -->
<div data-page-id="doxcnTYldMboJldT2Mc2wXfervv6vqc" data-docx-has-block-data="false">
  <div class="ace-line ace-line old-record-id-doxcnsBUassFNud1XwL1vMgth">
    123<strong>123</strong>
  </div>
</div>
```

Continuing along this line of thought, we can parse the HTML content based on the copied content and then convert the content to other formats using existing solutions in the community. The related code mentioned in this article can be found at `https://github.com/WindrunnerMax/webpack-simple-environment/tree/master/packages/chrome-debugger`. For the sake of demonstration, all event triggers in this article are bound using DOM level 0 event binding.

## JavaScript Events
Since our goal is to automate browser operations to perform copy actions, there are many options available such as Selenium and Puppeteer, which are viable solutions. In this case, we are considering a lightweight solution that does not require installing WebDriver dependencies and can be directly installed in the user's browser for immediate use. Based on these considerations, using a Chrome extension to achieve our goal is a good choice. Chrome extensions allow us to inject scripts directly into web pages, making it more convenient to implement related functionalities. For more information on injecting complex functionalities using extensions, you can refer to previous articles.

Next, we need to consider how to trigger the `OnCopy` event on the page. At this point, our goal is twofold: first, to extract and normalize content from the editor itself, and second, to write the converted content to the clipboard. The approach to achieve this is clear - we simply need to actively trigger the `SelectAll` and `Copy` commands on the page. We can test these two commands in the console to see how they work.

```js
document.execCommand("selectAll");
const res = document.execCommand("copy");
console.log(res); // true
```

When we manually execute the commands in the console, we can see that the content on the page has been selected and copied to the clipboard. Next, we can encapsulate these two commands into a function, inject it into the page through a Content Script, and then we can directly call this function on the page. However, when we actually implement this functionality with a Chrome extension, we will find that the page can be fully selected as expected, but the content in the clipboard is from the previous copy operation, meaning that the current copy operation did not actually succeed.

This is actually due to the browser's security policy. In order to enhance security, browsers restrict certain APIs that may affect user privacy, allowing them to only run when directly triggered by the user. This means that the `Copy` command can only be triggered normally when the user actively activates the context. Similarly, when we programmatically trigger a click event in JavaScript, such as `Node.click()`, the browser does not trust it. The event triggered will carry an `isTrusted` property, which is only `true` for events that are actively triggered by the user. Therefore, the commands executed in the console are considered trusted by the browser, as they are events actively triggered by the user, while those executed in the extension are not, leading to the failure of the command execution.

So why can the commands executed in the console work properly? This is because when we execute commands in the console, we need to press the Enter key to execute the code. Note that this Enter key press is actively triggered by us, so the browser considers the JavaScript code we execute as trusted, allowing us to execute the `Copy` command successfully. However, if we add a delay to the code execution, for example, if we delay the execution by `5s`, we will find that even the same code executed in the console will not be able to write to the clipboard. The return value of `document.execCommand("copy")` indicates whether the command was executed successfully. Under a delay of `5s`, the return value we get is `false`. We can also execute code in the console to check the command execution status. We can continuously adjust the delay time to observe the execution results. For example, setting it to `2s` will give us a `true` return value.

```js
setTimeout(() => {
  document.execCommand("selectAll");
  const res = document.execCommand("copy");
  console.log(res); // false
}, 5000);
```

Let's temporarily set aside the issue of trusted events that require user activation and continue discussing the solution to this problem later. Besides testing the `OnCopy` event, we also need to test the `OnPaste` event. Don't forget that after we execute the `OnCopy` to extract content, this content actually still exists in the clipboard, and we need to extract it. After executing the code below, we can see that the strategies for `OnPaste` and `OnCopy` are different. Even with user's active operation and no delay in execution, the result is still `false`, and the events bound to the `document` are not triggered.

```js
document.onpaste = console.log;
const res = document.execCommand("paste");
console.log(res); // false
```

Could it be because we did not execute the `paste` command in an `input` or `textarea` element? We can also test this issue. By creating an `input` element, inserting it into the `body`, moving the focus to this `input` element, and then executing the `paste` command, we still cannot successfully execute the command. Additionally, when we execute `focus`, we notice that the cursor does not appear.

```js
const input = document.createElement("input");
input.setAttribute("style", "position:fixed; top:0; right: 0");
document.body.appendChild(input);
input.focus();
const res = document.execCommand("paste");
console.log(res); // false
```

Are there any other reasons that could cause this issue? Through testing the `OnCopy` part earlier, we found that events within a certain period after a trusted event is actively triggered by the user are trusted. However, there are also considerations regarding focus in the browser's security policy. In some operations, the focus must be on the `document`, otherwise the operation will not be executed normally. The corresponding exception is `DOMException: Document is not focused.`. At this point, our focus is on the console panel, which may also lead to uncontrollable issues. Therefore, during the `2s` delay in execution, we need to move the focus to the `document`, meaning we need to click on any element in the `body`. Of course, clicking directly on the `input` is also feasible, but even so, we still cannot execute `paste`.
```

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

Actually, after consulting the documentation, it can be known that `document.execCommand("paste")` is actually disabled in `Web Content`. However, this command can still be executed, and we will continue to discuss it later. In modern browsers, we also have the `navigator.clipboard API` to manipulate the clipboard. `navigator.clipboard.read` can achieve limited clipboard content reading. When calling this API, there will be a clear authorization prompt. Active authorization is not a problem for user privacy, but in automated scenarios, an additional authorization step may be required.

In addition, we mentioned that `navigator.clipboard` has limited clipboard content reading. What does this limited mean? In fact, it means that it can only read specific types, such as `text/plain`, `text/html`, `image/png`, and other common types. However, it cannot read private types of data. For example, the `text/ne-inode Fragment` data copied in Yuque cannot be read using `navigator.clipboard.read`. By executing the following code and authorizing it, you will find that there is no output.

```js
setTimeout(() => {
  navigator.clipboard.read().then(res => {
    for (const item of res) {
      item.getType("text/ne-inode").then(console.log).catch(() => null)
    }
  });
}, 2000);
```

We can actually traverse the content of `navigator.clipboard` to get the clipboard content. Similarly, we can only obtain common standardized MIME-Type types such as `text/plain`, `text/html`, `image/png`, and so on. The 2-second delay mentioned earlier is another limitation. After executing the following code, we must move the focus to the `document`. Otherwise, the console will throw a `DOMException: Document is not focused.` exception, and the authorization prompt will not appear either.

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

So, let's consider a scenario: if we only write custom `MIME-Type` types when writing data in a rich text editor, how can we read them from the clipboard? In fact, we need to go back to our `OnPaste` event. With the help of the `navigator.clipboard API`, we cannot read these custom `key` values. Although we can write them as `attributes` in a copied HTML node and then read them, it is unnecessary. We can directly use the `clipboardData` in the `OnPaste` event to obtain more complete related data. This method can also be used to conveniently debug clipboard content in the browser.

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
In the previous section, we mentioned the issue of triggering trusted events that require user activation. In some cases, we need to solve this problem. First, we need to inject the code into the page. Of course, we have mentioned this problem many times before, which is to inject the script through the Chrome extension. Even if we can inject the script, the executed code is still not a user-activated event, so it cannot break through the browser's security restrictions. At this time, we need to use our Chrome DevTools Protocol.

Students familiar with E2E know that the DevToolsProtocol is an API provided by the Chrome browser for interacting with the browser. Selenium, Puppeteer, and Playwright are all based on this protocol. We can even actively implement the F12 debugging panel based on this protocol, which means that we can implement the functions currently available in the F12 developer tools based on this protocol. Its API is not only the implementation of the debugging panel function, but also the debugging program such as chrome://inspect can be completed through this protocol.

Then there is a new problem here. If we use solutions such as Selenium and Puppeteer, users need to install dependencies such as WebDriver or Node, which cannot achieve the goal of letting users use it out of the box. At this time, we need to turn our attention to chrome.debugger. The Chrome.debugger API can be used as another transmission method of the Chrome remote debugging protocol. Using chrome.debugger, we can connect to one or more tabs to monitor network interactions, debug JavaScript, modify DOM and CSS, etc. The most important thing for us is that this API can be called in Chrome extensions, so we can achieve out-of-the-box application programs.

Then we will handle the OnCopy event. Because chrome.debugger must be performed in the worker, and the button we control to start is defined in Popup, we need to communicate events from Popup to Worker. The communication scheme of Chrome extensions can be found in the previous article or in the repository mentioned earlier, so I won't go into details here. At this time, we need to query the currently active tab in the extension, and then filter the protocol of the currently active tab. For example, we will not process connections with the chrome:// protocol, and then pass the tabId if it meets the conditions.

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

Then we need to continuously mount the protocol control to the currently active Tab page. After we mount the extension to the debugger, a prompt will appear on the user's interface that our extension has started debugging this browser. This is actually a security policy of the browser, because the permission of the debugger is too high, it is necessary to give users a cancelable operation. After mounting, we can use chrome.debugger.sendCommand to send commands. For example, we can simulate key events through Input.dispatchKeyEvent. Here we need to use the key event to send the selectAll command. In fact, sending commands can be achieved through sending any key, but in order to conform to actual operations, we chose the Ctrl+A combination key.

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

Please note that after sending the key event mentioned above, the event we execute at this point will be trusted. Simulating key events through `DevToolsProtocol` is completely trusted by the browser, equivalent to events triggered by the user. Next, we can directly execute the `document.execCommand("copy")` command using `Eval`. Here, we can execute the JavaScript code using `Runtime.evaluate`. After execution, we need to unload the debugger from the currently active tab. In the provided demo, to align with the previously executed JavaScript operation, we will also delay the operation by 5 seconds. At this point, we can observe that our code successfully writes the content to the clipboard, indicating that we have successfully executed the `Copy` command.

```js
chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
  expression: "const res = document.execCommand('copy'); console.log(res);",
})
.then(() => {
  chrome.debugger.detach({ tabId });
});
```

Next, let's explore the `OnPaste` event in `DevToolsProtocol`. First, we do not declare the `clipboardRead` permission in the manifest. This permission is for reading the clipboard in the Chrome extension's manifest. Following the previous code, we execute `document.execCommand("paste")` in the debugger. We can observe that the result of the execution is `false`, indicating that even under trusted conditions, executing `paste` does not yield any results. If we declare `clipboardRead` in the `permissions`, we can still observe that the result is `false`, indicating that executing `document.execCommand("paste")` under the user script `Inject Script` does not have any effect.

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

Now, let's continue without declaring the `clipboardRead` permission in the manifest and attempt to execute `document.execCommand("paste")` using the DevToolsProtocol, which means sending the command while simulating a key press. At this point, we can observe that the event is triggered successfully. This actually indicates that executing events directly through the DevToolsProtocol is done in the same way as if the user had triggered them, making it a trusted event source.

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


Following that, we simply modify the `Js` event operation previously executed in the user state, changing the `copy` command to the `paste` command. That is, in the `Content Script` section, we execute `document.execCommand("paste")`. At this point, it still returns `false`, indicating that our command execution was not successful. Don't forget that we haven't declared the `clipboardRead` permission in the manifest yet. After we declare the permission in the manifest and execute `document.execCommand("paste")` again, we find that the result is `true` and the event can be triggered normally.

If we go further and continue to maintain the `clipboardRead` permission declaration in the manifest and pass the event to the `Inject Script` for execution, we can find that even if the permission is declared, the result returned by `document.execCommand("paste")` is still `false`, and the event we bound cannot be triggered. This also confirms what we said earlier that executing the `paste` command under `Inject Script` cannot be triggered normally. Therefore, we can clearly see that the `clipboardRead` permission needs to be used in the `Content Script`. As for the `navigator.clipboard API`, even if the permission is declared in the permission manifest, it still needs to be actively authorized.

## Offline PDF Export of Web Pages
Recently, while browsing the community, I found that many users hope to save web pages as `PDF` files for offline reading. Therefore, I will also discuss the relevant implementation solutions here, which actually belong to the extraction of web page content, which is essentially similar to the clipboard operation we discussed earlier. In the browser, of course, we can use `Ctrl + P` to print the `PDF`. However, there are some problems with exporting `PDF` files through printing or generating images:

* The exported `PDF` must specify the paper size and cannot set the paper size arbitrarily. For example, it is difficult to export a single-page `PDF` when you want to.
* When exporting `PDF`, a selection dialog box must pop up, and it cannot be exported silently and automatically downloaded, which is not friendly enough for batch scenarios that want to export multiple `Tab` pages at the same time.
* The exported `PDF` will not automatically carry the `Outline`, which is the directory bookmark outline of the `PDF`, and needs to be generated actively using tools such as `pdf-lib`.
* When printing the entire page, the page itself may not define the `@media print` style preset, and it may be difficult to achieve partial printing.
* If you want to customize the style in batches before printing `PDF`, you need to inject styles separately for each page, which is obviously not suitable for batch scenarios.
* If you convert the page to an image through a method similar to `HTML2Canvas` and then convert it to `PDF`, it will cause problems such as large image size and unselectable text.

Therefore, here we can use the `Chrome DevTools Protocol` protocol to implement this function. In fact, there is a `Page.printToPDF` method in the `DevTools Protocol` protocol, which is also a common method for `Node` server to convert `HTML` to `PDF`. Of course, it is also feasible to directly draw and generate `PDF` using tools such as `PDFKit`, but the cost is very high. The `Page.printToPDF` method can export the current page as a `PDF` file, and can achieve silent export and automatic download, custom paper size, and `Outline` generation. The use of this method is also very simple, just pass a configuration object of `PDF`.

Before calling the method, we also need to query the active window, of course, selecting all windows under the current `Window` is also feasible. At this time, it is necessary to pay attention to the declaration of the `tabs` and `activeTab` permissions in the permission manifest. Similarly, we still need to filter protocols such as `chrome://` and only process content with `http://`, `https://`, and `file://` protocols.

Next, we can mount the debugger based on `TabId`. As mentioned earlier, we want to export the page as a single-page `PDF`, so we need to get the height and width of the page. We can use the `Page.getLayoutMetrics` method to obtain the layout information of the page, which returns a `LayoutMetrics` object containing the width, height, scroll height, and other information of the page. Alternatively, we can communicate with the content script to get the width and height information of the page. In this case, we use a simpler approach by executing `Runtime.evaluate` to get the return value, allowing us to flexibly obtain more data and control the page content. For example, when the scrolling container is not the `window`, we need to inject code to get the width and height as well as control the printing range.

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

Next, we need to set the configuration object for the `PDF` based on the width and height information of the page. It is important to note that the width and height information obtained through `document` is in pixel size, while the `paperWidth` and `paperHeight` in `Page.printToPDF` are in inches. Therefore, we need to convert them to inches. According to the CSS specification, `1px = 1/96th of 1 inch`, so we can generally consider `1px = 1/96 inch` regardless of the physical pixels of the device. Additionally, we can specify some configurations. In this case, the generated `PDF` will only include the content of the first page, background color, document outline generation configuration, as well as options for `Header` and `Footer`. We can set the output format according to actual needs. It is worth noting that `generateDocumentOutline` is an experimental configuration supported in newer versions of Chrome.

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

After the generation is complete, we need to download the PDF to the device. There are many ways to trigger the download, such as passing the data to the page and triggering the download using an `a` tag. In the extension, the `chrome.downloads.download` method is provided, which can directly download files to the device. Although the data parameter is named `url`, it is not limited by the length/number of characters in the link. By passing `Base64` encoded data, large data downloads can be achieved. Just remember to declare permissions in the manifest file. After the download is complete, we can detach the debugger from the current tab, completing the entire PDF export process.

```js
const base64 = res.data as string;
chrome.downloads
  .download({ url: `data:application/pdf;base64,${base64}` })
  .finally(() => {
    chrome.debugger.detach({ tabId });
  });
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://chromedevtools.github.io/devtools-protocol/
https://github.com/microsoft/playwright/issues/29417
https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
https://developer.chrome.google.cn/docs/extensions/reference/api/debugger?hl=zh-cn
https://stackoverflow.com/questions/71005817/how-does-pixels-relate-to-screen-size-in-css
https://chromewebstore.google.com/detail/just-one-page-pdf/fgbhbfdgdlojklkbhdoilkdlomoilbpl
```

I have translated the text as requested.