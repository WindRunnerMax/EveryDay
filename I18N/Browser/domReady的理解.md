# Understanding `domReady`

The `domReady` is an alias for the `DOMContentLoaded` event. Once the initial `HTML` document has been fully loaded and parsed, the `DOMContentLoaded` event will be triggered without waiting for the complete loading of stylesheets, images, and subframes.

## Description
The browser's rendering of the `DOM` structure follows a specific sequence. Although different browsers may have different implementations, the basic process is generally the same:

* Top-down parsing of HTML tags to generate the `DOM Tree`.
* Parsing of CSS begins when encountering `<link>` or `<style>` tags, generating the `CSSOM`. It's important to note that the parsing of HTML tags and CSS is done in parallel at this stage.
* Upon encountering a `<script>` tag, the browser immediately starts parsing the script and pauses document parsing. This is because scripts can potentially modify the `DOM` and `CSS`, and continuing parsing would be a waste of resources. Therefore, `<script>` tags should be placed after the `<body></body>`.
* After the `DOM Tree` and `CSSOM` are generated, the two are combined for layout, computing their size, position, and other layout information, creating an internal representation model that can capture all this information - known as the `render tree`.
* The entire page is drawn based on the calculated information. The system traverses the render tree and calls the `paint` method to display content on the screen.

There are blocking processes during the browser's parsing of the `DOM` structure:
* Parsing of JavaScript blocks the browser's parsing process. Specifically, the rendering process and the parsing of JavaScript are mutually exclusive.
* Parsing of CSS does not block the parsing of the `DOM` tree. These two parsing processes can be done in parallel. However, during the CSS loading process, JavaScript parsing cannot be performed. Additionally, since the `Render Tree` generation requires `CSSOM`, the `Render Tree` is not generated when the `DOM Tree` parsing is complete but the `CSSOM` is not.
* Parsing of HTML structure also does not block the CSS parsing process and does not run parallel with the JavaScript parsing process. If the `DOM Tree` parsing is incomplete while the `CSSOM` is complete, the `Render Tree` is also not generated.
* The use of asynchronous loading of `<script>` tags does not block `DOM` parsing and does not block the triggering of the `DOMContentLoaded` event, but it still blocks the triggering of the `load` event.

Now, let's take a look at the timing of the triggering of the `DOMContentLoaded` event and the `load` event:
* Once the initial `HTML` document has been fully loaded and parsed, the `DOMContentLoaded` event is triggered without the need to wait for stylesheets, images, and subframes to be fully loaded. Regarding the timing of the trigger, if the document consists only of `HTML` and `CSS`, the `DomContentLoaded` event can be triggered without waiting for the complete loading of `CSS`. When the `Js` comes before `CSS`, the `DomContentLoaded` event can be triggered without waiting for the completion of `CSS` loading, but the parsing of `CSS` and `DOM` needs to wait for the preceding `Js` parsing to be completed. When `Js` comes after `CSS`, the `DomContentLoaded` event needs to wait for the completion of `CSS` and `Js` loading. As mentioned earlier, the loading of `CSS` blocks the loading of `Js`, and since the `Js` tag itself is part of the `DOM` structure, the `DomContentLoaded` event can only be triggered after its loading is complete. Asynchronous loading of `<script>` tags does not block the `DOMContentLoaded` event.
* The `load` event is triggered when the entire page and all dependent resources such as stylesheets and images have finished loading. The use of non-dynamically loaded `<iframe>` also blocks the `load` event, and even asynchronous loading of `<script>` tags blocks the `load` event.

Rearranging the process of page loading under various conditions primarily revolves around the timeline of the `DOMContentLoaded` and `load` events:

- From top to bottom, the HTML tags are first parsed to generate the DOM Tree, at this point `document.readyState = "loading"`.
- When parsing `<link>` or `<style>` tags, the CSS is parsed to generate the CSSOM. It is noteworthy that the parsing of HTML tags and CSS is executed in parallel at this point.
- When encountering a `<script>` without asynchronous loading, the document parsing is blocked, waiting for the JavaScript to load and execute before continuing to parse the document.
- When encountering an asynchronous `<script>`, the document parsing continues without blocking, and the `defer` attribute will make the JS file wait to execute until the DOM Tree is constructed, while the `async` attribute will make the JS file execute immediately after downloading.
- When parsing the document and encountering the need to load external resources such as images, the node is parsed first, a loading thread is created based on the `src`, and the image resource is asynchronously loaded without blocking the document parsing. However, note that the browser imposes a limit on the maximum number of threads that can be opened for a domain.
- Once the document parsing is complete, `document.readyState = "interactive"`.
- The scripts with the `defer` attribute start to execute in order.
- The `DOMContentLoaded` event is triggered.
- Waiting for the loading of scripts with the `async` attribute, as well as images, `<iframe>`, and so on, until the page is completely loaded.
- The `load` event is triggered, and `document.readyState = "complete"`.

## Invocation
Sometimes, we want to intervene in the `DOM` as soon as possible, and in this case, calling the `DOMContentLoaded` event is obviously more appropriate. However, to handle different browsers, it needs to be made compatible.
- Use the `DOMContentLoaded` event for browsers that support it.
- For `Webkit` versions below `525`, use polling of `document.readyState` to implement it.
- For older versions of `IE` browsers, use the well-known `hack` discovered by `Diego Perini`.

```javascript
/* https://www.cnblogs.com/JulyZhang/archive/2011/02/12/1952484.html */
/*
 * Register the browser's DOMContentLoaded event
 * @param { Function } onready [mandatory] the function to be executed when the DOMContentLoaded event is triggered
 * @param { Object } config [optional] configuration options
 */
function onDOMContentLoaded(onready, config) {
    //Browser detection related objects, not implemented here for brevity, needs to be done in actual usage.
    //var Browser = {};
    //Set whether to use DOMContentLoaded in FF (Bug in a specific scenario in FF2)
    this.conf = {
        enableMozDOMReady: true
    };
    if (config)
        for (var p in config)
            this.conf[p] = config[p];
    var isReady = false;
```

```javascript
function doReady() {
    if (isReady) return;
    // Make sure onready only executes once
    isReady = true;
    onready();
}
/*IE*/
if (Browser.ie) {
    (function() {
        if (isReady) return;
        try {
            document.documentElement.doScroll("left");
        } catch (error) {
            setTimeout(arguments.callee, 0);
            return;
        }
        doReady();
    })();
    window.attachEvent('onload', doReady);
}
/*Webkit*/
else if (Browser.webkit && Browser.version < 525) {
    (function() {
        if (isReady) return;
        if (/loaded|complete/.test(document.readyState))
            doReady();
        else
            setTimeout(arguments.callee, 0);
    })();
    window.addEventListener('load', doReady, false);
}
/*FF Opera High version webkit Others*/
else {
    if (!Browser.ff || Browser.version != 2 || this.conf.enableMozDOMReady)
        document.addEventListener("DOMContentLoaded", function() {
            document.removeEventListener("DOMContentLoaded", arguments.callee, false);
            doReady();
        }, false);
    window.addEventListener('load', doReady, false);
}
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://juejin.im/post/6844903667733118983
https://juejin.im/post/6844903535314731021
https://juejin.im/post/6844903623583891469
https://juejin.im/post/6844904072340832264
https://juejin.im/post/6844904176569286669
https://www.cnblogs.com/caizhenbo/p/6679478.html
https://www.cnblogs.com/rubylouvre/p/4536334.html
https://developer.mozilla.org/zh-CN/docs/Web/Events/DOMContentLoaded
https://gwjacqueline.github.io/%E5%BC%82%E6%AD%A5%E5%8A%A0%E8%BD%BDjs/
```