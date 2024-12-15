# Examining Chrome Extensions from the Perspective of Script Managers

Recently, I needed to use Chrome extensions to fulfill a requirement. During that period, I conducted some research on userscripts and browser extensions. At that time, I had a decent userscript named [TKScript](https://github.com/WindrunnerMax/TKScript), so I was quite familiar with the capabilities of script managers. I anticipated that the userscript might not be able to meet the requirements. Therefore, I took the opportunity to learn more about browser extension development. As the development progressed, I found similarities between the capabilities provided by a script manager and a browser extension. This sparked my curiosity about how script managers are implemented. In reality, a script manager is essentially a type of browser extension, and the browser does not provide any backdoors for script managers to access specific capabilities. This raised three intriguing questions for me:

1. How can a script manager run before the `JS` on a page?
2. How does a script manager access the `window` object of a page?
3. How can a script manager bypass the browser's same-origin policy to initiate cross-origin requests?

Therefore, after researching the development capabilities of browser extensions, I summarized the core functionalities of script managers. This also addressed the three questions that puzzled me.

## Description
Have you ever used a userscript like Tampermonkey? The overall architecture of browser-level extensions is quite complex. Even though there are unified standards now, the specific implementations vary across different browsers. Moreover, becoming a developer and publishing an extension in the Chrome Web Store requires a registration fee of $5. If the aim is to write lightweight scripts within a web page and there are no special requirements, implementing lightweight scripts at the browser level can be a better choice.

After gaining a basic understanding of browser extension development, let's revisit the three questions posed at the beginning. In reality, these three questions are interrelated rather than independent. To clarify, let's break them down individually. For instance, when answering the third question regarding cross-origin requests, we need to assume that the script actually runs in the `Inject` environment. If the script were running in the `Background`, discussing cross-origin wouldn't make much sense.

## document_start
In a userscript manager like Tampermonkey, there is a crucial feature called `@run-at: document-start/document-end/document-idle`, especially `document-start`. Imagine if we could execute our desired `JS` code as soon as the page begins loading, we would have tremendous control over the page. Although we cannot directly intercept the literal creation of functions, we can still call browser-provided APIs. By intercepting function calls – for example, `Function.prototype.call` – we can hijack the function's execution and obtain the desired data. This interception function needs to be supported first in the entire page to be effective; otherwise, if the function has already been called, intercepting it serves no purpose.

The implementation of such code may seem obscure at first glance. Let's consider a practical scenario: suppose a document library renders all text using `canvas`, making it impossible to directly copy the document's content from the `DOM`. One feasible solution is to intercept `document.createElement`, so when a `canvas` element is created, we can preemptively access the canvas object and then the `ctx`. Since writing text ultimately involves calling `context2DPrototype.fillText`, intercepting this method allows us to extract the text being drawn. Subsequently, we can create a `DOM` element elsewhere for copying.

Returning to our implementation, the ability to ensure that a script executes first enables us to perform a wide range of actions at the language level, such as modifying the `window` object, function hooking, prototype chain modifications, event prevention, and more. These abilities stem from browser extensions. The challenge for script managers is how to expose these extension capabilities to web pages. Assuming that user scripts run as `Inject Scripts` in the browser page rather than `Content Scripts`, based on this assumption, we would likely have implemented dynamic or asynchronous loading of `JS` scripts, similar to the example below:

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

So, now there is an obvious problem. If we load the script only after the `body` tag is constructed, around the `DOMContentLoaded` event, we definitely won't achieve the goal of `document-start`. Even processing it after the `head` tag is not suitable since many websites include some `JS` resources in the head, loading at that point is already too late. The main issue here is the entire process being asynchronous; there is already a lot of `JS` code executing before the external script is fully loaded, failing to accomplish the desired "execute first" scenario.

Let's delve into the specific implementation. Firstly, with the `V2` extension, considering the whole page, the very first element that loads is the `html` tag. Therefore, it becomes evident that by inserting the script at the `html` tag level, the objective can be met. This can be achieved by employing the `chrome.tabs.executeScript` dynamic code execution in the extension's background script, along with establishing communication with the injected `tab` using the `Content Script` with `"run_at": "document_start"`. This method might seem simple, but addressing this seemingly straightforward issue took me quite some time to figure out.

```js
// Content Script --> Background
// Background -> chrome.tabs.executeScript
chrome.tabs.executeScript(sender.tabId, {
  frameId: sender.frameId,
  code: `(function(){
    let temp = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
        temp.setAttribute('type', 'text/javascript');
        temp.innerHTML = "${script.code}";
        temp.className = "injected-js";
        document.documentElement.appendChild(temp);
        temp.remove();
    }())`,
  runAt,
});
```

This implementation may seem adequate since it can mostly achieve `document-start`. However, as it is mentioned to be merely basic, it indicates that some scenarios may still pose problems. If we closely analyze this code, we can observe a communication step taking place, which is `Content Script --> Background`. As this involves communication, it signifies an asynchronous process. And when there is asynchrony, time gets consumed; if time is spent, there is a possibility that the user's page might have already executed a significant amount of code. Hence, this implementation might sometimes fail to achieve `document-start`, resulting in script ineffectiveness.

So, how can we address this issue? In `V2`, it is clear that `Content Script` is entirely controllable at `document-start`, but it is not an `Inject Script` and lacks access to the page's `window` object. Thus, it cannot effectively hijack the page's functions. The problem may seem complex at first glance, but once understood, the solution is rather simple. We can introduce another `Content Script`, alongside the original `Content Script`, which essentially mirrors the `Inject Script` code but is attached to the `window`, achieving access to it. This task can be facilitated with the help of bundling tools.

```js
compiler.hooks.emit.tapAsync("WrapperCodePlugin", (compilation, done) => {
  Object.keys(compilation.assets).forEach(key => {
    if (!isChromium && key === process.env.INJECT_FILE + ".js") {
      try {
        const buffer = compilation.assets[key].source();
        let code = buffer.toString("utf-8");
        code = `window.${process.env.INJECT_FILE}=function(){${code}}`;
        compilation.assets[key] = {
          source() {
            return code;
          },
          size() {
            return this.source().length;
          },
        };
      } catch (error) {
        console.log("Parse Inject File Error", error);
      }
    }
  });
  done();
});
```

This code snippet shows that we attach a randomly generated `key` to the same `window` object of the `Content Script`, and the content is the actual script we want to inject into the page. However, even though we now have this function, how can we execute it on the user's page? Here, we actually use the same `document.documentElement.appendChild` method to create the script, but the implementation here is very clever. We obtain the string by combining two `Content Scripts` with the `toString` method and directly inject it into the page as code, achieving a true `document-start`.

```js
const fn = window[process.env.INJECT_FILE as unknown as number] as unknown as () => void;
// #IFDEF GECKO
if (fn) {
  const script = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
  script.setAttribute("type", "text/javascript");
  script.innerText = `;(${fn.toString()})();`;
  document.documentElement.appendChild(script);
  script.onload = () => script.remove();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete window[process.env.INJECT_FILE];
}
// #ENDIF
```

Moreover, you might wonder why both the script manager framework and user scripts use this injection method, but in the browser console's `Sources` panel, you only see a `userscript.html?name=xxxxxx.user.js` and cannot see the script manager's injected code. This is because the script manager injects a comment similar to `//# sourceURL=chrome.runtime.getURL(xxx.user.js)` at the end of the user script. This `sourceURL` specifies the URL in the comment as the script's source URL, and it is identified and displayed using that URL in the `Sources` panel, which is very useful for debugging and code tracking, especially when loading dynamically generated or inline scripts.

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

Due to the fact that `Chrome` browser no longer allows submission of `V2` extension programs, we can only submit `V3` code. However, `V3` code is subject to very strict `CSP` content security policy restrictions, essentially prohibiting dynamic code execution. Therefore, the methods we mentioned above all become ineffective. Consequently, we are left with no choice but to write code similar to the following:

```js
const script = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
script.setAttribute("type", "text/javascript");
script.setAttribute("src", chrome.runtime.getURL("inject.js"));
document.documentElement.appendChild(script);
script.onload = () => script.remove();
```

Although it may seem that we are immediately creating a `Script` tag within the `Content Script` and executing code, is this achieving our `document-start` objective? Unfortunately, the answer is no. While it might work when the page is initially loaded, afterwards, because this script is essentially treated as an external script, `Chrome` queues it along with other scripts on the page. Other scripts may have strong caching mechanisms, so the actual behavior may not guarantee which one executes first. This unpredictability is unacceptable as it fails to meet the `document-start` objective. Looking solely from this perspective, `V3` is not mature enough. It lacks adequate support for many capabilities. Therefore, official solutions have been devised to address this issue. However, since we cannot determine the browser version used by end-users, many compatibility methods still need to be addressed.

```js
if (cross.scripting && cross.scripting.registerContentScripts) {
    logger.info("Register Inject Scripts By Scripting API");
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/scripting/registerContentScripts
    cross.scripting
      .registerContentScripts([
        {
          matches: [...URL_MATCH],
          runAt: "document_start",
          world: "MAIN",
          allFrames: true,
          js: [process.env.INJECT_FILE + ".js"],
          id: process.env.INJECT_FILE,
        },
      ])
      .catch(err => {
        logger.warning("Register Inject Scripts Failed", err);
      });
    } else {
    logger.info("Register Inject Scripts By Tabs API");
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
    cross.tabs.onUpdated.addListener((_, changeInfo, tab) => {
      if (changeInfo.status == "loading") {
        const tabId = tab && tab.id;
        const tabURL = tab && tab.url;
        if (tabURL && !URL_MATCH.some(match => new RegExp(match).test(tabURL))) {
          return void 0;
        }
        if (tabId && cross.scripting) {
          cross.scripting.executeScript({
            target: { tabId: tabId, allFrames: true },
            files: [process.env.INJECT_FILE + ".js"],
            injectImmediately: true,
          });
        }
      }
    });
}
```

After `Chrome V109`, `chrome.scripting.registerContentScripts` was supported. Starting from `Chrome 111`, scripts with `world: 'MAIN'` can be declared directly in the `Manifest`. However, compatibility still needs to be handled by developers. Particularly, if the browser does not support `world: 'MAIN'`, then that script will be treated as a `Content Script`. I find this aspect a bit challenging to manage.

Until high version browsers become more popular, we still need to determine whether to use a registered method or execute directly based on the actual situation of the user's page in the worker. However, performing in the worker means that we must request `scripting` and `host permissions`, which implies that our extension will have higher privileges. Usually, this triggers additional review steps in the extension marketplace.

```js
if (cross.scripting && cross.scripting.registerContentScripts) {
  cross.scripting
    .registerContentScripts([/* ... */]);
} else {
  cross.tabs.onUpdated.addListener((_, changeInfo, tab) => {
    if (changeInfo.status == "loading") {
      cross.scripting.executeScript(/* ... */);
    }
  });
}
```

Moreover, in `Firefox`, if the user's page has a `CSP` policy, additional issues may arise. Website `CSP` policies typically limit `script-src` and `unsafe-inline`, causing the strategy of injecting into `Inject Script` mentioned above to fail. Also, directly using `tabs.executeScript` injects into the `Content Script`, so we cannot inject directly using this method either. It is worth mentioning that the compatibility of `scripting.executeScript` with `World: MAIN` in `Chrome` is not entirely optimal.

Although the `scripting.executeScript` method is available in `Firefox`, it requires `FF 128` to support `World: MAIN`. In such cases, we may need to try bypassing the `CSP` restrictions through some strategies or adopt fallback solutions to ensure the proper functioning of some features.

* Modifying the response headers through `webRequest.onHeadersReceived` to prevent the loading of the `CSP` policy.
  * Since `CSP` does not support multiple `nonce` declarations, but multiple `sha-hash` configurations are allowed, we can add `sha256-${CSP-HASH}` to the response headers and calculate and replace resources during compilation. However, mishandling may lead to issues. For example, while initially `'self'` might be fine, `'self'+'hash'` could cause leniency to strictness issues.
  * Although modifying response headers is effective, it is easily disrupted by other extensions. Common ad blockers often modify response headers, and when multiple extensions modifying `CSP` are active simultaneously, the browser tends to enforce stricter modes, ultimately leading to failed injections.
  * Complete removal during the actual call can avoid extension conflicts. Browser extensions such as Tampermonkey, Greasemonkey, etc., when matching scripts to run, directly remove the `CSP` policy from the response headers, while Violentmonkey tries to read the `nonce` in `Firefox` situations to allow script execution.
* Reading the response headers through `webRequest.onResponseStarted` and identifying the scripts loaded by the `CSP` policy.
  * Typically, `script-src` allows the execution of certain scripts, such as the `nonce` mentioned earlier. Since we cannot modify the response headers, we can simply read without blocking. Then based on features like `nonce`, `blob`, create script tags, and insert them into the page.
  * If no related features are ultimately matched, we can resort to executing directly in the `Content Script`. In the `Content Script`, there are no restrictions from the `CSP` policy, enabling the normal operation of some functionalities including DOM events and styles.
* Checking and fallback execution policies in the `Content Script` through `wrappedJSObject`.
  * `wrappedJSObject` is a feature in `Firefox` that allows access to the `Window` object in the `Inject Script`. If the script execution mentioned earlier fails and our idempotent execution lock is not mounted on the `window`, we can infer that the script did not execute successfully.
  * Upon identifying unsuccessful script execution, we can construct a same-origin URL like `blob:https://xxx` using the `Blob` object and `URL.createObjectURL` method, then load the script using `script.src`. However, similar to the previous issue, this is asynchronous and cannot ensure `document_start` completion.
  * If even after the script `onload`, we are unable to verify successful execution, we can resort to executing the script in the `Content Script`. This ensures the normal execution of DOM events and styles. Additionally, exporting functions to the page through `exportFunction` in the `Content Script` is also an optional solution.

```js
cross.webRequest.onResponseStarted.addListener(
  (res) => {
    if (!res.responseHeaders) return void 0;
    if (res.type !== "main_frame" && res.type !== "sub_frame") return void 0;
    for (let i = 0; i < res.responseHeaders.length; i++) {
      const responseHeaderName = res.responseHeaders[i].name.toLowerCase();
      if (responseHeaderName !== "content-security-policy") continue;
      const value = res.responseHeaders[i].value || "";
      let code = /* ... */
      const onUpdate = (_: number, changeInfo: chrome.tabs.TabChangeInfo) => {
        if (changeInfo.status !== "loading") return void 0;
        cross.tabs
          .executeScript(res.tabId, /* ... */)
        cross.tabs.onUpdated.removeListener(onUpdate);
      };
      cross.tabs.onUpdated.addListener(onUpdate, { tabId: res.tabId });
    }
  },
  { urls: URL_MATCH, types: ["main_frame", "sub_frame"] },
  ["responseHeaders"]
);
```

## unsafeWindow
This issue is also a very interesting point that I once asked in the group, but did not get an answer at that time. Let's discuss it here. First and foremost, we need to understand that there are two `window` objects in the script: `window` and `unsafeWindow`. The `window` object is a secure and isolated window environment, while `unsafeWindow` represents the `window` object in the user's webpage.

For a long time, I believed that the `window` object accessible in these plugins was actually provided by the browser's `Content Scripts`, and `unsafeWindow` represented the `window` object in the user's page. I spent a considerable amount of time exploring how to directly access the user's `window` object from the `Content Scripts` of browser extensions, but all efforts ended in failure. An interesting attempt was made to escape the browser extension environment by utilizing the shared `DOM` between `Content Scripts` and `Inject Scripts`. However, this approach has long been obsolete.

```js
var unsafeWindow;
(function() {
    var div = document.createElement("div");
    div.setAttribute("onclick", "return window");
    unsafeWindow = div.onclick();
})();
```

In addition, `Firefox` provides a `wrappedJSObject` to help access the page's `window` object from `Content Scripts`, but this feature might be removed in future versions due to security concerns. In fact, as for the escape method mentioned above, browsers are taking measures to prevent such practices, meaning it is clear that `Content Scripts` cannot access the page's `window` object.

So, how can we eventually determine that these two `window` objects actually refer to the same browser environment? The realization came when I needed to dynamically render `React` components and suddenly became aware of this issue. Apart from reviewing the source code of open-source script managers, we can also verify the script in the browser using the following code snippet. As seen, modifications made to `window` are actually synchronized with `unsafeWindow`, proving that they share the same reference.

```js
unsafeWindow.name = "111111";
console.log(window === unsafeWindow); // false
console.log(window); // Proxy {Symbol(Symbol.toStringTag): 'Window'}
console.log(window.onblur); // null
unsafeWindow.onblur = () => 111;
console.log(unsafeWindow); // Window { ... }
console.log(unsafeWindow.name, window.name); // 111111 111111
console.log(window.onblur); // () => 111
const win = new Function("return this")();
console.log(win === unsafeWindow); // true
```

Actually, here we also use the escape of `new Function`, so we can discover that these two are actually the same reference. Then the problem arises: since they are the same `window` object, how does the script manager provide a clean `window` object? Here we need to talk about a little story. Imagine if we fully trust the `window` of the current user page, we may directly mount the API onto the `window` object. This may sound like there is no problem, but consider this scenario: if a user visits a malicious page, and this webpage happens to match a rule like `https://*/*`, then this page can access our script manager's related `APIs`. This is equivalent to browser extension-level permissions, such as directly accessing the content of files in the user's disk, and being able to send the content to a malicious server across domains. In this case, our script manager becomes a security risk. For example, if the current page has been attacked by XSS, the attacker can use the script manager's `GM.cookie.get` to retrieve `HTTP Only` cookies, and even without enabling `CORS`, they can easily send requests to the server. Obviously, we originally intended to use the script manager to `Hook` web pages in the browser, but instead we are being accessed by more advanced functions. This is clearly unreasonable. Therefore, GreaseMonkey implements the `XPCNativeWrappers` mechanism, which can be understood as a sandbox environment for the `window` object.

In the `@grant none` scenario, the script manager considers the current environment safe, and there is no issue of unauthorized access. Therefore, in this case, accessing the `window` will be the original `window` object of the page. Additionally, as mentioned above, in the verification of the last two lines of code, we bypassed these sandbox limitations of extensions so that we could directly access `unsafeWindow` without the `@grant unsafeWindow` scenario. However, this is not a major issue because the script manager itself also provides access to `unsafeWindow`, and if the CSP did not enable `unsafe-eval`, this example would not work. Furthermore, we can also think of other solutions. For example, simply disabling the execution of the `Function` and `eval` functions might be a solution. But clearly, even if we directly disable access to the `Function` object, it can still be accessed through constructor methods like `(function(){}).constructor`. Therefore, the sandbox environment for the `window` also needs continuous defense. For instance, mini-programs do not allow the use of `Function`, `eval`, `setTimeout`, `setInterval` to dynamically execute code. As a result, the community began to implement hand-written interpreters. In our scenario, we could even directly create an isolation environment by using an `iframe` to create a `about:blank` `window` object.

Following this, we can briefly discuss how to implement sandbox environment isolation. In fact, in the example above, we can see that directly printing `window` outputs a `Proxy` object. Here, we also use a `Proxy` to implement a simple sandbox environment. What we need to achieve is to proxy the `window` object. In this case, we want all operations to be performed on a new object without affecting the original object. When getting a value, it should first try to fetch from our new object, and if it's not there, then resort to the `window` object. When setting a value, it will only operate on our new object. Here we also use the `with` operator to set the code scope to a specific object - in this case, our created `context`. In the final result, we can see that reading operations on the `window` object are correct, and writing operations only affect the sandbox environment.
```

```js
const context = Object.create(null);
const global = window;
const proxy = new Proxy(context, {
    // The `Proxy` uses the `in` operator to check property existence
    has: () => true,
    // Writing properties will act on the `context`
    set: (target, prop, value) => {
        target[prop] = value;
        return true;
    },
    // Special handling for specific properties and methods, reading properties involves checking `context` and `window`
    get: (target, prop) => {
        switch (prop) {
            // Override special property references
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
                // Methods like `alert` and `setTimeout` must operate under `window` scope
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

Furthermore, even though we have constructed a sandbox environment, we need to figure out how to pass this object to user scripts without exposing these variables to the website itself. The scripts run on the user's page, allowing access to the `window` object. Next, let's discuss how to securely pass our advanced methods to user scripts. Looking at the `source-map`, it is clear that we can utilize closures and `with` to access variables. Pay attention to the `this` context. When calling the function, use the following approach to pass the current scope's variables to the script execution.

```js
script.apply(proxyContent, [ proxyContent, GM_info ]);
```

So far, we have successfully isolated the `window` object using `Proxy`. To recap, our goal is to create a clean `window` sandbox environment where the website's actions do not affect our `window` object. For instance, if the website attaches an `$$` object to `window`, we aim to prevent direct access to this object in developers' scripts. Our sandbox environment is completely isolated. On the other hand, the user script manager has a different goal. For example, if a user needs to attach an event to `window`, we should mount that event handler on the original `window` object. Therefore, we must differentiate whether a property being read or written belongs to the original `window` or newly added to the `Web` page. To achieve this, we need to record a copy of the original `window` object's keys before executing user scripts, essentially managing the sandbox as a whitelist. Additionally, for a `window` sandbox to work effectively, the extension's `Inject Script` must be executed first, preferably at `document-start`, to ensure no prior content has been mounted on the `window` object, thereby avoiding contamination of the sandbox environment.

## xmlHttpRequest
Lastly, let's discuss how the script manager accomplishes cross-origin requests. Since user scripts execute on the current browser page, they must overcome the same-origin policy issue. By declaring the domain of the requested URL in the script manager, it can bypass this restriction, making it quite a remarkable feat.
```

So, the way to solve this problem is quite simple. It's clear that the communication initiated here is not directly from the page's `window`, but from a browser extension. Therefore, we need to discuss how to enable communication between the user's page and the browser extension. The `DOM` and event flow in the `Content Script` are shared with the `Inject Script`. In practice, there are two ways to implement communication. The commonly used method is `window.addEventListener + window.postMessage`. However, a significant drawback of this approach is that messages can also be received in the web page. Even if we can generate some random tokens to verify the message source, this method can be easily intercepted by the page itself, which is not secure enough. That's why another method is typically used here, which is `document.addEventListener + document.dispatchEvent + CustomEvent` with custom events. It's important to note that the event name should be random. By generating a unique random event name in the background when injecting the framework and using this event name for communication between the `Content Script` and `Inject Script`, we can prevent users from intercepting the message calls.

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

However, because this communication involves more complexity, sending messages to `Background/Worker` through the `Content Script` for final implementation can be somewhat challenging. It requires a well-designed approach to handle communication between different modules and event triggers.

## Summary
In the end, we might have clarified some of the very `hacky` capabilities of browser extensions. We may have also realized that browser extensions have extremely high permissions. In the `V2` version, they could even access `HTTP Only` cookies. In `V3`, the restrictions have increased, but overall the permissions remain very high. Therefore, when choosing a browser extension, caution is advised. Either opt for widely used extensions or choose open-source ones. However, issues like the `EDGE` extension events are still hard to avoid. Essentially, `EDGE` opens extensions for use, and some malicious individuals encapsulate open-source extensions with advertising code and submit them to extension markets. As users of extensions, it's important to pay attention to these issues. Lastly, some script managers that can be useful for reference are provided for further learning.

* [GreaseMonkey](https://github.com/greasemonkey/greasemonkey): Commonly known as Greasemonkey, the earliest user script manager providing extension capabilities for Firefox, under the MIT license.
* [TamperMonkey](https://github.com/Tampermonkey/tampermonkey): Commonly known as Tampermonkey, the most popular user script manager that offers extension capabilities for current mainstream browsers. The open-source version (before version 2.9) is licensed under GPL-3.0.
* [ViolentMonkey](https://github.com/violentmonkey/violentmonkey): Commonly known as Violentmonkey, a completely open-source user script manager that provides extension capabilities for current mainstream browsers, under the MIT license.
* [ScriptCat](https://github.com/scriptscat/scriptcat): Commonly known as ScriptCat, a fully open-source user script manager providing extension capabilities for current mainstream browsers, licensed under GPL-3.0.

## Daily Quiz

```
https://github.com/WindRunnerMax/EveryDay
```

## Reference

```
https://github.com/scriptscat/scriptcat
https://github.com/greasemonkey/greasemonkey
https://github.com/Tampermonkey/tampermonkey
https://github.com/violentmonkey/violentmonkey
https://reorx.com/blog/understanding-chrome-manifest-v3/
https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions
```