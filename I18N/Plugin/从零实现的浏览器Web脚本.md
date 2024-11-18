
# Browser Web Scripting From Scratch

Previously, we introduced the development of Chrome extensions from scratch. In reality, the overall architecture of browser-level extensions is quite complex. Although there are unified standards currently, the specific implementations in different browsers vary, and becoming a developer and publishing on the Chrome Web Store requires a registration fee of $5. If we only hope to perform some lightweight script writing on web pages, using browser extension-level capabilities will seem a bit costly. Therefore, in this article, we mainly discuss the implementation of lightweight scripts at the web level in browsers.

## Description

In the previous article on building Chrome extensions from scratch, we used TypeScript to implement the entire extension and used Rspack as the packaging tool to build the application. Although it is entirely possible to implement lightweight scripts directly using JavaScript, it will become increasingly difficult to maintain script capabilities as they expand. Therefore, here we still use TypeScript to build the script. As for the build tool, we can choose to use Rollup to bundle the script. The related implementation discussed in this article can be referred to in the personal script collection at `https://github.com/WindrunnerMax/TKScript`.

Of course, browsers do not support the direct writing of web-level scripts, so we need a runtime environment to run the script. Currently, there are many open-source script managers:

* [GreaseMonkey](https://github.com/greasemonkey/greasemonkey): Also known as "GM", it is the earliest user script manager, providing extension capabilities for Firefox and using the MIT license.
* [TamperMonkey](https://github.com/Tampermonkey/tampermonkey): Also known as "TM," it is the most popular user script manager, providing extension capabilities for current mainstream browsers. The open-source version uses the GPL-3.0 license.
* [ViolentMonkey](https://github.com/violentmonkey/violentmonkey): Also known as "VM," it is a fully open-source user script manager that also provides extension capabilities for current mainstream browsers, using the MIT license.
* [ScriptCat](https://github.com/scriptscat/scriptcat): Also known as "SC," it is a fully open-source user script manager, providing extension capabilities for current mainstream browsers, and using the GPL-3.0 license.

Additionally, there are many script aggregation websites for sharing scripts, such as [GreasyFork](https://greasyfork.org/zh-CN/scripts). As we mentioned earlier, after researching browser extension capabilities, we found that the permissions for extensions are simply too high. Similarly, the script manager is actually implemented through browser extensions. Therefore, selecting a trusted browser extension is crucial. For example, as mentioned above, "TamperMonkey" was open-source in its early versions, but the repository has not been updated after 2018. This means that the current "TamperMonkey" is actually a closed-source extension. Although there is a certain amount of review when uploading to the Chrome Web Store, ultimately being closed-source is a signal of mistrust for advanced user tools like user script managers. Therefore, it's also something to consider when choosing a manager.

In actuality, the script managers are still based on the implementation of browser extensions, encapsulating the capabilities of browser extensions, and exposing some of these capabilities as APIs to user scripts, allowing them to apply these API capabilities. In reality, there are many interesting implementations involved in this, such as the access to `window` and `unsafeWindow` within the script. Therefore, it's worth exploring how to implement a completely isolated `window` sandbox environment. Another example is that web pages cannot access resources across domains, so how to implement a `CustomEvent` communication mechanism for cross-domain resource access in the "Inject Script" can also be studied. Additionally, how to use `createElementNS` to implement runtime and script injection at the HTML level, as well as the role of "//# sourceURL" after assembling script code, are also interesting topics. Therefore, for students who are interested, studying "ScriptCat" is recommended, a user script manager developed by Chinese students with comments that are easy to read due to being in Chinese. This article still mainly focuses on applications, from the most basic "UserScript" script-related capabilities, to building scripts using Rollup, and then exploring script implementation through examples to expand on the discussion in this article.

## UserScript

When "GreaseMonkey" initially implemented the script manager, it used "UserScript" as the metadata block description for the script, and also provided many advanced APIs starting with "GM." For example, the cross-domain `GM.xmlHttpRequest` essentially implements a complete set of specifications. Subsequently developed script managers mostly follow or are compatible with these specifications for reuse in related ecosystems. This is also a troublesome matter for developers, as we cannot control the browser extensions that users install. If our script uses an API implemented separately by a particular extension, it will result in the script being unusable in other extensions. Especially after placing the script on the script platform, there is no way to build a channel package for distribution. Therefore, it is preferable to use the metadata and APIs supported by major extensions as much as possible, to avoid unnecessary trouble.

In addition, I've been curious for a long time about how user scripts are installed on `GreasyFork`. I couldn't find any special event handling after clicking the install script button, or figure out how the current installation of the script manager is detected and communication is established. After a brief study, I found that as long as the user script file ends with `.user.js`, it will automatically trigger the script installation feature of the script manager and can automatically record the script installation source for checking updates when the browser is opened. Subsequently, these script managers will continue to follow this specification. Now that we understand the installation principle, I will introduce my personal best practices for script distribution in the next section.

In this section, we mainly introduce the common usage of `Meta` and `API`. An overall overview of a script can be found at `https://github.com/WindrunnerMax/TKScript/blob/gh-pages/copy-currency.user.js`.

### Meta
Metadata exists in a fixed format, mainly for the convenience of script managers to parse related properties such as the name and matching sites. Each property must start with double slashes `//` and must not use block comments `/* */`. Simultaneously, all script metadata must be placed between `// ==UserScript==` and `// ==/UserScript==` to be recognized as valid metadata, and must be filled in the following format:

```js
// ==UserScript==
// @property_name property_value
// ==/UserScript==
```

The commonly used properties are as follows:

* `@name`: The name of the script, a unique identifier for the `@namespace` level of the script. You can set the language, for example, `// @name:zh-CN Text Selected Copy (Generic)`.
* `@author`: The author of the script, for example `// @author Czy`.
* `@license`: The license of the script, for example `// @license MIT License`.
* `@description`: The description of the script's functionality, which will be presented to the user in the management dialog when installing the script. It can also be set in different languages, for example `// @description:zh-CN Universal version of website copy support`.
* `@namespace`: The namespace of the script, used to distinguish the unique identifier of the script, for example `// @namespace https://github.com/WindrunnerMax/TKScript`.
* `@version`: The version number of the script. The script manager usually compares this field when starting to determine whether to download updates, for example `// @version 1.1.2`.
* `@updateURL`: The update check address. When checking for updates, this address will be visited first to compare the `@version` field to determine whether an update is required. This address should only contain metadata and not the script content.
* `@downloadURL`: The script update address (using the `https` protocol). If an update is required after checking `@updateURL`, this address will be requested to obtain the latest script. If this field is not specified, the script installation address will be used.
* `@include`: It can use `*` to represent any character and supports standard regular expression objects. There can be any number of `@include` rules in the script, for example `// @include http://www.example.org/*.bar`.
* `@exclude`: It can use `*` to represent any character and supports standard regular expression objects. It also supports any number of rules, and the matching priority of `@exclude` is higher than `@include`, for example `// @exclude /^https?://www\.example\.com/.*$/`.
* `@match`: A more strict matching pattern based on Chrome's [Match Patterns](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) rules, for example `// @match *://*.google.com/foo*bar`.
* `@icon`: The icon displayed in the script management interface. Almost any image can be used, but a `32x32` pixel size is the most appropriate resource size.
* `@resource`: When installing the script, each `@resource` will be downloaded once and stored on the user's hard drive with the script. These resources can be accessed separately through `GM_getResourceText` and `GM_getResourceURL`, for example `// @resource name https://xxx/xxx.png`.
* `@require`: Other scripts that the script depends on, usually libraries that can provide global objects. For example, to reference `jQuery`, use `// @require https://cdn.staticfile.org/jquery/3.7.1/jquery.min.js`.
* `@run-at`: Used to specify the timing of the script execution. The only available parameters are `document-start` (before the page loads), `document-end` (before the page resources load), `document-idle` (after the page and resources load), with the default value being `document-end`.
* `@noframes`: When present, this command will restrict the script's execution. The script will only run in the top-level document and not in nested frames. It does not require any parameters, and by default, this feature is turned off, allowing the script to run in iframes.
* `@grant`: The permissions that the script needs, such as `unsafeWindow`, `GM.setValue`, `GM.xmlHttpRequest`, etc. If `@grant` is not specified, it defaults to `none`, meaning no permissions are needed.

### API

The `API` is an object provided by the script manager to enhance the script's functionality. Through these, we can achieve more advanced abilities for web pages, such as cross-origin requests, modifying page layouts, data storage, notification capabilities, clipboard handling, and more. Even in the `Beta` version of `TamperMonkey`, users have the ability to read and write `HTTP Only` cookies with permission. Similarly, using the `API` also follows a fixed format. Relevant permissions must be declared in the `Meta` before using them, so that the script can dynamically inject relevant functions. Otherwise, the script may not run properly. It's also important to note that the naming of relevant functions may vary, so it's essential to refer to the relevant documentation when using them.

```js
// ==UserScript==
// @grant unsafeWindow
// ==/UserScript==
```

```javascript
* `GM.info`: Obtains the metadata of the current script and related information about the script manager.
* `GM.setValue(name: string, value: string | number | boolean): Promise<void>`: Used to write and store data, usually stored in the `IndexDB` maintained by the script manager itself.
* `GM.getValue(name: string, default?: T): : Promise<string | number | boolean | T | undefined>`: Used to retrieve data previously stored using `GM.setValue` in the script.
* `GM.deleteValue(name: string): Promise<void>`: Used to delete data previously stored using `GM.setValue`.
* `GM.getResourceUrl(name: string): Promise<string>`: Used to retrieve the resource address previously declared using `@resource`.
* `GM.notification(text: string, title?: string, image?: string, onclick?: () => void): Promise<void>`: Used to invoke system-level notification windows.
* `GM.openInTab(url: string, open_in_background?: boolean )`: Used to open the specified `URL` in a new tab.
* `GM.registerMenuCommand(name: string, onclick: () => void, accessKey?: string): void`: Used to add a menu item to the script manager's menu.
* `GM.setClipboard(text: string): void`: Used to write the specified text data to the clipboard.
* `GM.xmlHttpRequest(options: { method?: string, url: string, headers?: Record<string, string>, onload?: (response: { status: number; responseText: string , ... }) => void , ... })`: Used to initiate requests similar to the standard `XMLHttpRequest` object, but allowing these requests to cross the same-origin policy.
* `unsafeWindow`: Used to access the original `window` object of the page, the `window` object accessed directly in the script is a sandbox environment encapsulated by the script manager.

Just looking at these common `APIs` isn't actually that fun, especially since many of these capabilities can be implemented directly using a different approach with the help of scripts. Of course, there are some like `unsafeWindow` and `GM.xmlHttpRequest` that we have to use the script manager's `API` to complete. So, here we can also discuss some very interesting implementation solutions in the script manager. First, there is the very special `API` `unsafeWindow`. Just imagine if we fully trust the `window` of the current page, then we might directly mount the `API` onto the `window` object. It may sound like there's no problem, but consider this scenario: if a user visits a malicious page, and this page happens to be matched by rules like `https://*/*`, then the page can obtain access to the related `APIs` of our script manager. This is equivalent to browser extension level privileges, such as directly obtaining the content of files in the user's disk and sending the content directly to a malicious server across domains. In this case, our script manager becomes a security risk. Another example is when the current page has been subjected to an `XSS` attack, the attacker can use the script manager's `GM.cookie.get` to obtain `HTTP Only` cookies and even easily send requests to the server without enabling `CORS`. Obviously, we intended to use the script manager to `Hook` the `Web` pages, but now it's being accessed out of bounds by higher-level functions. This is obviously unreasonable, so `GreaseMonkey` has implemented the `XPCNativeWrappers` mechanism, also known as a sandbox environment for the `window` object.

In this isolated environment, we can obtain a `window` object that is a secure and isolated `window` environment, while `unsafeWindow` is the `window` object in the user's page. For a long time, I used to believe that the `window` object accessible in these plugins was actually provided by the browser extension's `Content Scripts`, and `unsafeWindow` was the `window` in the user's page, so I spent quite a long time exploring how to directly obtain the user's page `window` object in the browser extension's `Content Scripts.`, Of course, it ended in failure. One interesting thing in this process is an escape browser extension implementation, because `Content Scripts` share the `DOM` with `Inject Scripts`, so it's possible to escape using the `DOM`, but of course, this approach has long since become ineffective.

```js
var unsafeWindow;
(function() {
    var div = document.createElement("div");
    div.setAttribute("onclick", "return window");
    unsafeWindow = div.onclick();
})();
```

Additionally, `FireFox` provides a `wrappedJSObject` to help us access the `window` object from `Content Scripts`. However, this feature may potentially be removed in future versions due to security concerns. So, how do we know that it's actually the same browser environment now? Besides inspecting the source code, we can also verify the script's effect in the browser through the following code. It becomes evident that our modifications to `window` are actually synchronized to `unsafeWindow`, proving that they refer to the same object.

```javascript
unsafeWindow.name = "111111";
console.log(window === unsafeWindow); // false
console.log(window); // Proxy {Symbol(Symbol.toStringTag): 'Window'}
console.log(window.onblur); // null
unsafeWindow.onblur = () => 111;
console.log(unsafeWindow); // Window { ... }
console.log(unsafeWindow.name, window.name); // 111111 111111
console.log(window.onblur === unsafeWindow.onblur); // true
const win = new Function("return this")();
console.log(win === unsafeWindow); // true
```

In the case of `@grant none`, the script manager considers the current environment to be secure, and there are no longer any issues with unauthorized access. So, accessing `window` at this point refers to the original `window` object of the page. Additionally, upon close observation, we can see in the verification code above, the last two lines, that we have bypassed these sandbox restrictions, enabling direct access to `unsafeWindow` even in the absence of `@grant unsafeWindow`. However, this isn't a significant issue because the script manager itself provides access to `unsafeWindow`, and this example will not work if the page's `CSP` does not enable `unsafe-eval`. Nevertheless, we may consider other solutions, such as simply disabling the execution of the `Function` function and `eval`. However, it's clear that even if we directly block access to the `Function` object, it can still be accessed through constructor functions, like `(function(){}).constructor`. Therefore, continuous offense and defense strategies are required for the `window` sandbox environment. For instance, mini-programs prohibit the use of `Function`, `eval`, `setTimeout`, and `setInterval` for dynamic code execution. As a result, the community has begun to implement hand-written interpreters. In our scenario, we could even create a `about:blank` window object as an isolation environment using an `iframe`.

Moving forward, let's briefly discuss how to implement sandbox environment isolation. As seen in the previous example, directly printing `window` outputs a `Proxy` object. Therefore, we can also use `Proxy` to achieve simple sandbox isolation. Our goal is to proxy the `window` object, such that all operations occur on a new object and do not affect the original object. When retrieving values, we first try to fetch from our new object and then fallback to the `window` object if necessary. When writing values, we only operate on our new object. In this process, we also utilize the `with` operator to set the code's scope to a specific object, in our case, the `context` we have created. The end result effectively demonstrates that our read operations on the `window` object are accurate, and all write operations are confined within the sandbox environment.

```js
const context = Object.create(null);
const global = window;
const proxy = new Proxy(context, {
    // The `Proxy` uses the `in` operator to determine the existence of properties
    has: () => true,
    // Writing properties applies to the `context`
    set: (target, prop, value) => {
        target[prop] = value;
        return true;
    },
    // Special case for special properties and methods
    // Reading properties reads from `context` first, then `window`
    get: (target, prop) => {
        switch (prop) {
            // Rewrite the pointers to special properties
            case "globalThis":
            case "window":
            case "parent":
            case "self":
                return proxy;
            default:
                if (prop in target) {
                    return target[prop];
                }
                const value = global[prop];
                // Methods like `alert` and `setTimeout` must be applied within the `window` scope
                if (typeof value === "function" && !value.prototype) {
                    return value.bind(global);
                }
                return value;
        }
    },
});

window.name = "111";
with (proxy) {
    console.log(window.name); // 111
    window.name = "222";
    console.log(name); // 222
    console.log(window.name); // 222
}
console.log(window.name); // 111
console.log(context); // { name: '222' }
```

So far, we have used `Proxy` to achieve an isolated sandbox environment for the `window` object. In summary, our goal is to create a clean `window` sandbox environment. This means we want to ensure that anything executed on the website itself does not affect our `window` object. For example, if the website mounts a `$$` object on `window`, we do not want this object to be directly accessible in the developer's script. Our sandbox environment is completely isolated. The goal of the user script manager, on the other hand, is different. For example, if a user needs to mount an event on `window`, we should attach that event handling function to the original `window` object. Therefore, we need to differentiate whether the property being read or written is from the original `window` or a newly added property from the web page. If we want to address this issue, we need to record a copy of the keys on the original `window` object before the user script is executed, essentially operating the sandbox in the form of a whitelist. This leads us to the next topic to discuss - how to execute scripts before `document-start`, which is before the page loads.

In reality, `document-start` is a very important implementation in user script managers. If we can ensure that the script is the first to be executed, then we can do almost anything at the language level, such as modifying the `window` object, defining `Hook` functions, modifying the prototype chain, preventing events, and so on. Of course, its own capabilities also originate from browser extensions, and the issue to consider is how to expose this capability of browser extensions to web pages. First, we would most likely have written an implementation for dynamically/asynchronously loading JavaScript scripts, similar to the example below:

```js
const loadScriptAsync = (url: string) => {
    return new Promise<Event>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.onload = e => {
            script.remove();
            resolve(e);
        };
        script.onerror = e => {
            script.remove();
            reject(e);
        };
        document.body.appendChild(script);
    });
};
```

So now there's an obvious question: if we load the script around the `DOMContentLoaded` time, when the `body` tag is constructed, it definitely won't achieve the goal of `document-start`. Even handling it after the `head` tag is finished won't work, as many websites write some JS resources within the `head` which makes the timing unsuitable. Considering that the initial element loaded for the whole page is definitely the `html` tag, obviously inserting the script at the `html` tag level is the way to go. Coordinating with the browser extension's `chrome.tabs.executeScript` for dynamic code execution, and `content.js` with `"run_at": "document_start"` to establish message communication to confirm the injection of the `tab`─this method may seem simple, but it's exactly this seemingly simple issue that made me contemplate for a long time on how to achieve it. Furthermore, this solution is currently viable in extension `V2`. In `V3`, `chrome.tabs.executeScript` has been removed and replaced with `chrome.scripting.executeScript`. Currently, using this API can achieve framework injection, but not user script injection, as dynamic code execution is not possible.

```js
(function () {
    const script = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
    script.setAttribute("type", "text/javascript");
    script.innerText = "console.log(111);";
    script.className = "injected-js";
    document.documentElement.appendChild(script);
    script.remove();
})();
```

We might wonder why script manager frameworks and user scripts are injected in the same way, yet in the browser console's Sources control panel, we can only see a `userscript.html?name=xxxxxx.user.js` and cannot see the script manager's code injection. In reality, this is because the script manager injects a comment at the end of the user script, similar to `//# sourceURL=chrome.runtime.getURL(xxx.user.js)`, where this `sourceURL` will use the specified `URL` in the comment as the script's source `URL`, and identify and display the script in the Sources panel with that `URL`, which is extremely useful for debugging and tracking code, especially when loading dynamically generated or inline scripts.

```js
window["xxxxxxxxxxxxx"] = function (context, GM_info) {
  with (context)
    return (() => {
      // ==UserScript==
      // @name       TEST
      // @description       TEST
      // @version    1.0.0
      // @match      http://*/*
      // @match      https://*/*
      // ==/UserScript==

      console.log(window);

      //# sourceURL=chrome-extension://xxxxxx/DEBUG.user.js
    })();
};
```

Remember our initial question? Even after we've completed the sandbox environment construction, the challenge is how to pass this object to the user script. We can't expose these variables to the website itself, but we still need to pass relevant variables to the script which runs on the user page. Otherwise, we wouldn't be able to access the user page's `window` object. So, next we'll discuss how to safely pass our advanced methods to the user script. In fact, in the above `source-map`, we can clearly see that we can directly access variables with closures and `with`. Furthermore, we need to pay attention to the `this` issue. Therefore, when calling this function, we can call it in the following way to pass the variables of the current scope to the script execution.

```js
script.apply(proxyContent, [ proxyContent, GM_info ]);
```

We all know that browsers have cross-origin restrictions, but why can our scripts access cross-origin interfaces through `GM.xmlHttpRequest`? We've mentioned before that scripts run as `Inject Script` on the user page, so they are subject to cross-origin access restrictions. So the way to solve this problem is relatively simple. Clearly, the communication initiated here is not directly from the page's `window`, but from the browser extension. Therefore, we need to discuss how to communicate between the user page and the browser extension.

The `DOM` and event flow in `Content Script` are shared with `Inject Script`, so in reality, we can implement communication in two ways. The first commonly used method is `window.addEventListener + window.postMessage`. However, a clear problem with this approach is that messages can also be received on the `Web` page. Even if we can generate some random `token` to verify the source of the message, this method can still be easily intercepted by the page itself, so typically another method is used. Specifically, `document.addEventListener + document.dispatchEvent + CustomEvent` custom event method. Here, it's important to note that the event name should be random. By generating a unique random event name in the injected framework during `background` and then using this event name for communication in both `Content Script` and `Inject Script`, we can prevent users from capturing the messages generated during method calls.

```js
// Content Script
document.addEventListener("xxxxxxxxxxxxx" + "content", e => {
    console.log("From Inject Script", e.detail);
});

// Inject Script
document.addEventListener("xxxxxxxxxxxxx" + "inject", e => {
    console.log("From Content Script", e.detail);
});

// Inject Script
document.dispatchEvent(
    new CustomEvent("xxxxxxxxxxxxx" + "content", {
        detail: { message: "call api" },
    }),
);

// Content Script
document.dispatchEvent(
    new CustomEvent("xxxxxxxxxxxxx" + "inject", {
        detail: { message: "return value" },
    }),
);
```

## Script Building
When building Chrome extensions, we've used `Rspack` in the past. This time, we'll switch to using `Rollup` as the build tool. The reason being, `Rspack` is more suitable for packaging complete `Web` applications, while `Rollup` is more suitable for packaging utility libraries. Our `Web` scripts are single-file scripts, making them more suitable for packaging using `Rollup`. However, if you wish to experience the packaging speed of the `Rust` build tool, you can still use `Rspack`. Additionally, you can even directly use `SWC` for packaging. In this case, I didn't use `Babel` but used `ESBuild` to build the script, which has proven to be very efficient.

Furthermore, as mentioned earlier, although the APIs of script managers are compatible with `GreaseMonkey`, each script manager may have its own unique APIs. This is a common occurrence as different script managers entirely implementing the same functionalities is not very meaningful. The differences among different browsers are also not the same, and the differences in browser APIs need to be determined at runtime. Therefore, if we need to support all platforms, it's necessary to implement channel packages. This concept is very common in `Android` development. Writing every package manually is obviously impractical. However, using modern build tools not only makes maintenance easier but also makes it more convenient to support channel packages. By utilizing environment variables and `TreeShaking`, channel package building can be easily achieved. When combined with script managers and the synchronization functionality of script websites, the ability to distribute different channel packages can be achieved.

### Rollup
This part is similar to the packaging of various `SDKs`. Assuming we have multiple scripts that need to be packaged, and our goal is to package each project directory into a separate package, `Rollup` provides the ability to simultaneously package multiple inputs and outputs. We can directly configure an array through `rollup.config.js`, specify the entry file through `input`, specify the output file through `output`, and specify the plugins through `plugins`. The packages we output generally need to use `iife` self-executing functions, which are suitable as output formats for things like `script` tags.

```js
[
  {
    input: "./packages/copy/src/index.ts",
    output: {
      file: "./dist/copy.user.js",
      format: "iife",
      name: "CopyModule",
    },
    plugins: [ /* ... */ ],
  },
  // ...
];
```

If you need to use `@updateURL` to check for updates, you also need to separately package a `meta` file. Packaging the `meta` file is similar to the above process, you just need to provide a blank `blank.js` as the `input` and then inject the `meta` data. One thing to note here is that the `format` should be set to `es` because the script we want to output cannot be wrapped with a self-executing function `(function () {})();`.

```js
[
  {
    input: "./meta/blank.js",
    output: {
      file: "./dist/meta/copy.meta.js",
      format: "es",
      name: "CopyMeta",
    },
    plugins: [{ /* ... */}],
  },
  // ...
];
```

We also mentioned the issue of channel packaging earlier. So, if you want to package channel bundles, there are several key points to note:
- First, when executing the command, you need to set environment variables. For example, here I set the environment variable as `process.env.CHANNEL`.
- Secondly, in the packaging tool, we need to replace the entire defined environment variable during the packaging, which is actually a very interesting thing. Although we consider `process` as a variable, during packaging it is treated as a string. We use `@rollup/plugin-replace` to replace the `process.env.CHANNEL` string with the environment variable set during the command execution.
- Next, in the code, we need to define the use of the environment variables. It's especially important to note that it should be written as a direct expression rather than a function, because if written as a function, we won't be able to trigger `TreeShaking`. `TreeShaking` is a static detection method, and we need to explicitly specify the `Boolean` value of this expression in the code.
- Finally, the files are output through the environment variables, and all the files are packaged in the end.

```js
// package.json scripts
// "build:special": "cross-env CHANNEL=SPECIAL rollup -c"

// index.ts
const isSpecialEnv = process.env.CHANNEL === "SPECIAL";
if (isSpecialEnv) {
    console.log("IS IN SPECIAL ENV");
}

// @rollup/plugin-replace
replace({
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    "process.env.CHANNEL": JSON.stringify(process.env.CHANNEL),
    "preventAssignment": true,
})

// rollup.config.js
if(process.env.CHANNEL === "SPECIAL"){
    config.output.file = "./dist/copy.special.user.js";
}
```

Furthermore, we cannot use modules such as `rollup-plugin-terser` to compress the packaged products, especially if they are to be distributed to platforms like `GreasyFork`, as the script itself has very high privileges. Therefore, code review is essential. Similarly, due to similar reasons, packages like `jQuery` cannot be directly packaged into the project and generally need to be included as `external` with `@require`. Platforms like `GreasyFork` also employ a whitelist mechanism to review externally imported packages. In most cases, we need to use `document-start` to execute code upfront, but at this time the `head` tag is not complete, so special attention needs to be paid to the timing of injecting `CSS`. If the script is executed at `document-start`, usually you need to manually inject `CSS` instead of using the default injection ability of `rollup-plugin-postcss`. So, in actuality, there aren't many special considerations for this part of the `Rollup` packaging. It's basically like our regular frontend engineering projects. For a complete configuration, you can refer to `https://github.com/WindrunnerMax/TKScript/blob/master/rollup.config.js`.

```js
// `Plugins Config` 
const buildConfig = {
    postcss: {
        minimize: true,
        extensions: [".css"],
    },
    esbuild: {
        exclude: [/node_modules/],
        sourceMap: false,
        target: "es2015",
        minify: false,
        charset: "utf8",
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
    },
};
```

```js
// `Script Config` 
const scriptConfig = [
    {
        name: "Copy",
        meta: {
            input: "./meta/blank.js",
            output: "./dist/meta/copy.meta.js",
            metaFile: "./packages/copy/meta.json",
        },
        script: {
            input: "./packages/copy/src/index.ts",
            output: "./dist/copy.user.js",
            injectCss: false,
        },
    },
    // ...
];


export default [
    // `Meta`
    ...scriptConfig.map(item => ({
        input: item.meta.input,
        output: {
            file: item.meta.output,
            format: "es",
            name: item.name + "Meta",
        },
        plugins: [metablock({ file: item.meta.metaFile })],
    })),
    // `Script`
    ...scriptConfig.map(item => ({
        input: item.script.input,
        output: {
            file: item.script.output,
            format: "iife",
            name: item.name + "Module",
        },
        plugins: [
            postcss({ ...buildConfig.postcss, inject: item.script.injectCss }),
            esbuild(buildConfig.esbuild),
            // terser({ format: { comments: true } }),
            metablock({ file: item.meta.metaFile }),
        ],
    })),
];
```

### Meta
Even though we've completed the main package construction above, it seems that we've overlooked a major issue, which is the generation of script manager script description `Meta`. Luckily, there is a `Rollup` plugin here that allows us to call it directly. Of course, the ability to implement plugins like this is not complicated in itself. First, you need to prepare a `meta.json` file, use the `json` format to describe various configurations in it, and then generate the string through traversal. Inject the string into the output file in the hook function of `Rollup`. Of course, this package does a lot of other things, such as field format checks, output content beautification, and so on.

```js
{
    "name": {
        "default": "🔥🔥🔥文本选中复制(通用)🔥🔥🔥",
        "en": "Text Copy Universal",
        "zh-CN": "🔥🔥🔥文本选中复制(通用)🔥🔥🔥"
      },
    "namespace": "https://github.com/WindrunnerMax/TKScript",
    "version": "1.1.2",
    "description": {
        "default": "文本选中复制通用版本，适用于大多数网站",
        "en": "Text copy general version, suitable for most websites.",
        "zh-CN": "文本选中复制通用版本，适用于大多数网站"
      },
    "author": "Czy",
    "match": [
        "http://*/*",
        "https://*/*"
    ],
    "supportURL": "https://github.com/WindrunnerMax/TKScript/issues",
    "license": "GPL License",
    "installURL": "https://github.com/WindrunnerMax/TKScript",
    "run-at": "document-end",
    "grant": [
        "GM_registerMenuCommand",
        "GM_unregisterMenuCommand",
        "GM_notification"
    ]
}
```

## Example
So, in this section, we'll implement an example of user scripts. Although we often `Ctrl C+V` a lot of code, `Ctrl C+V` is not just for coding, it's also very useful for copying homework or reports, especially when I was a student, it would have been a nightmare if I couldn't copy and paste for writing reports. Now, here comes the problem, there are always some websites that prevent us from copying and pasting happily. Therefore, here we'll implement a universal solution to bypass the browser's copy restriction. For specific code, please refer to the `https://github.com/WindrunnerMax/TKScript` the part about text selection and copying - general.

### CSS
Some websites may disable copy and paste using `CSS`, which specifically manifests as the inability to directly select text. This is especially common on many document library websites. For instance, if you search for an internship report on Baidu, many of the search results are not copyable. Of course, we can use `F12` to see this text, but when it's deeply nested and displayed separately, it's still quite cumbersome to use `F12` to copy. Of course, you can directly use `$0.innerText` to get the text, but it's still too cumbersome. Let's take a look at how `CSS` disables text selection.

So, if you have worked with text manipulation capabilities, like rich text `Void` block elements, it's easy to understand the `user-select` `CSS` property. The `user-select` property is used to control whether the user can select text, and it doesn't have any effect on content that is part of the user interface of the browser unless it's in a text box.

```css
user-select: none; /* Text of the element and its sub-elements cannot be selected */
user-select: auto; /* The value depends on a series of conditions */
user-select: text; /* The text content of the element and its sub-elements can be selected */
user-select: contain; /* The text of child elements of the element can be selected, but the text of the element itself cannot be selected */
user-select: all; /* The text content of the element and its sub-elements can be selected */
```

So, when we inspect these websites, we can clearly see `user-select: none;`, so if we want to remove this restriction, we can easily think of using CSS specificity, using specificity to forcibly override the values of all properties. This is also a more universal implementation approach that can easily adapt to the vast majority of pages that use this method to prevent copying.

```js
const style = document.createElement("style");
style.type = "text/css";
style.innerText = "*{user-select: auto !important; -webkit-user-select: auto !important;}";
document.head.appendChild(style);
```

### Event
Most of the time, websites not only use `CSS` to prevent user copying behavior, especially for content drawn using `Canvas`. This method is not within the scope of this article, so here we want to discuss how to use events to restrict user copying behavior. The main events that can affect user copying behavior are the `onCopy` and `onSelectStart` events. The `onCopy` event is triggered when copying is detected, such as using `Ctrl + C` or right-clicking to copy. Here, we can simply intercept it to prevent copying. Similarly, the `onSelectStart` event, when prevented in its default behavior, can prevent user text selection, naturally preventing copying. Here, for simplicity, we directly use `DOM0` events, and if you input this code into the console, you will find that copying is no longer possible.

```js
document.oncopy = (event) => event.preventDefault();
document.onselectstart = (event) => event.preventDefault();
```

Before researching how to handle these event behaviors, let's first look at the `getEventListeners` method. The `getEventListeners` method provided by the `Chrome` browser is used to retrieve all event listeners, but this is a function that can only be used in the console, and is not universal, just for our debugging convenience.

```js
console.log(getEventListeners(document));
// {
//     click: Array(4), 
//     DOMContentLoaded: Array(3),
//     // ...
// }
```

So, why are we discussing this method if it's not universal? This involves a problem: for these event listeners, if we want to remove them, for `DOM0` level events, we just need to set the property to `null`, but for `DOM2` level events, we need to use `removeEventListener` to remove the event handler. So, how do we retrieve the reference to the function used during `addEventListener` if we haven't saved this reference? This is where the `getEventListeners` method comes into play. We can use this method to retrieve all event listeners and then use `removeEventListener` to remove the event handler. Of course, here we can only use event judgment for debugging and it's not a universal solution.

```js
const listeners = getEventListeners(document);
Object.keys(listeners).forEach(key => {
    console.log(key);
    listeners[key].forEach(item => {
        document.removeEventListener(item.type, item.listener);
    });
});
```

So, do we really have to change our mindset? It's quite a fuss to remove event listeners. As the saying goes, the most upscale food often only requires the simplest cooking method. Since we can't remove it, we can just prevent it from executing. If we don't want it to execute, naturally, we should think of the event flow model in `JS` and stop it from bubbling.

```js
document.body.addEventListener("copy", e => e.stopPropagation()); 
document.body.addEventListener("selectstart", e => e.stopPropagation());
```

Seemingly, this method seems fine. However, if the `Web` page itself listens for events on the `body`, then it's quite obvious that stopping the bubbling on `document` is too late and ineffective, so it's quite embarrassing. This shows that this solution is not versatile enough. Since stopping the bubbling isn't effective, we just obliterate it during the capture phase, and combining it with the script manager's `document-start` to ensure that our event capture is the first to execute. This way not only solves problems with `DOM0` events, but also works just as well for `DOM2` events.

```js
document.body.addEventListener("copy", e => e.stopPropagation(), true); 
document.body.addEventListener("selectstart", e => e.stopPropagation(), true);
```

This solution is already a rather universal copying solution. We can resolve restrictions on most websites. However, intercepting events during the capture phase can potentially have some side effects. For example, if we prevent keyboard events during the capture phase and then try to edit a document in yuque, we would encounter issues, because the document in yuque is similar to Feishu, both process text by line. I assume it's preventing the default behavior of `contenteditable`, and then the editor completely takes over the keyboard events, causing it to be unable to line break or handle shortcut menus. Similarly, if we directly stop the propagation of `onCopy`, it may cause the editor to adopt the default behavior for copying, while editors usually perform some formatting on copied text. So, it requires caution in situations with editing functionalities, but it's not a big problem as an exhibition end, overall, it's more beneficial.

Not long ago, I found another very interesting thing. `onFocus` and `onBlur` events can also restrict user text selection. Just find a page and execute the following code in console, we can be surprised to find that we can no longer select text normally.

```js
const button = document.createElement("button");
button.onblur = () => button.focus();
button.textContent = "BUTTON";
document.body.appendChild(button);
button.focus();
```

In fact, the principle here is also very simple. Usually, in elements like `HTMLInputElement`, `HTMLSelectElement`, `HTMLTextAreaElement`, `HTMLAnchorElement`, `HTMLButtonElement`, there is a concept of focus, and text selection also has a focus behavior. So, since the focus cannot be focused together, we can forcibly focus it elsewhere, for example, in the above example, we forcibly focus on the button, so because the text content cannot get focus, it cannot be selected normally.

Similarly, we can use the method of stopping event execution during the capture phase to solve this problem, handling `onFocus` and `onBlur` events respectively. However, this method may cause some issues with page focus control, so here we have another way, by executing `MutationObserver` at `document-start`, and when similar `DOM` nodes are found, directly remove them, preventing them from being inserted into the `DOM` tree, naturally, there won't be any related issues. However, this is not a universal solution, and usually needs to be handled on a `case by case` basis.

```js
const handler = mutationsList => {
    for (const mutation of mutationsList) {
        const addedNodes = mutation.addedNodes;
        for (let i = 0; i < addedNodes.length; i++) {
            const target = addedNodes[i];
            if (target.nodeType != 1) return void 0;
            if (
                target instanceof HTMLButtonElement &&
                target.textContent === "BUTTON"
            ) {
                target.remove();
            }
        }
    }
};
const observer = new MutationObserver(handler);
observer.observe(document, { childList: true, subtree: true });
```

### Script Distribution
So, based on the above method, we have completed the writing and packaging of the script. Here I also share a best practice for script distribution. Script websites like `GreasyFork` usually have the ability to sync the source code. We can directly enter a script link to automatically synchronize script updates, so we don’t need to fill them in everywhere. Now, there is a question, where should this script link come from? Similarly, we can use `GitHub`'s `GitPages` to generate the script link, and `GitHub` also has `GitAction` to help us automate the script build process.

So, the whole process is like this: first, we configure `GitAction` on `GitHub`. When we push the code, it triggers the automatic build process. After the build is completed, we can automatically push the code to `GitPages`, and then we can manually obtain the script link from `GitPages` and fill it in various script websites. Also, if different channel packages are created, different script links can be distributed separately. This completes the automation of the entire process, and with the help of `GitHub`, `jsDelivr` can also be used as a `CDN`. Below is the complete `GitAction` configuration.

```yml
name: publish gh-pages

on:
  push:
    branches:
      - master

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v2
        with:
          persist-credentials: false

      - name: install and build
        run: |
          npm install -g pnpm@6.24.3
          pnpm install
          pnpm run build
      - name: deploy
        uses: JamesIves/github-pages-deploy-action@releases/v3
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH: gh-pages
          FOLDER: dist
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://wiki.greasespot.net/Security
https://docs.scriptcat.org/docs/dev/api/
https://en.wikipedia.org/wiki/Greasemonkey
https://wiki.greasespot.net/Metadata_Block
https://juejin.cn/post/6844903977759293448
https://www.tampermonkey.net/documentation.php
https://wiki.greasespot.net/Greasemonkey_Manual:API
https://learn.scriptcat.org/docs/%E7%AE%80%E4%BB%8B/
http://jixunmoe.github.io/gmDevBook/#/doc/intro/gmScript
```