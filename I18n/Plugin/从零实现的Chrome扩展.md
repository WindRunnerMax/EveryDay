# Chrome Extension Implemented from Scratch

A `Chrome` extension is a software program that can add new features and modify browser behavior in the `Chrome` browser, such as the commonly used `TamperMonkey`, `Proxy SwitchyOmega`, and `AdGuard`. These extensions can modify and enhance the browser's capabilities through the `WebExtensions API` to provide functions not originally available in the browser, thereby achieving interesting tasks.

## Description
In fact, `Firefox` was the first mainstream browser to introduce browser extensions/add-ons. It released the first version of its extension system in `2004`, allowing developers to write custom features and modify browser behavior for `Firefox`. The `Chrome` browser added support for extension systems in `2010`, also allowing developers to write custom features and modify browser behavior for `Chrome`.

Although `Firefox` was the first to introduce browser extensions, `Chrome`'s extension system has been widely recognized and used and has become one of the most popular extension systems in modern browsers. The technologies used to build `Firefox` extensions are largely compatible with extension `APIs` supported by browsers based on the `Chromium` engine, such as `Chrome`, `Edge`, and `Opera`, among others. In most cases, plugins written for `Chromium`-based browsers require only minor modifications to run on `Firefox`. Therefore, this article takes `Chrome` extensions as an example to discuss how to implement a `Chrome` extension from scratch. The related code mentioned in this article can be found in the `rspack--chrome-extension` branch of `https://github.com/WindrunnerMax/webpack-simple-environment`.

## Manifest
Let's first consider what a browser extension really is. Browsers already have very comprehensive `Web` capabilities, with rendering engines and `JS` parsing engines, so browser extensions don't need to implement a new set of executable capabilities; they can simply reuse the `Web` engine. However, there's a problem: `JS` alone cannot achieve certain capabilities, such as intercepting requests, modifying request headers, and so on – these are `Native` capabilities that `JS` alone cannot achieve. At least `C++` directly running in the browser code is required. In fact, solving this problem is quite simple: expose some interfaces directly through something like a `JS Bridge`, making it easier to control permissions and to some extent avoid the extension executing malicious behavior that could harm users.

So, it turns out that a browser extension is actually a `Web` application, running in the browser context and able to call many special `APIs` provided by the browser to achieve additional functionality. Therefore, given that it's a `Web` application, how do we let the browser know that it's an extension, not just a regular `Web` application? We need a markup and configuration file for this, which is the `manifest.json` file. Through this file, we can describe the basic information of the extension, such as its name, version, description, icon, permissions, and so on.

In the `manifest.json`, there is a field called `manifest_version`, which indicates the current version of the `Chrome` plugin. Most of the plugins installed in browsers are currently of `v2` version; the `v1` version has long been deprecated, and the `v3` version has a lot of `Breaking Changes` and many `APIs` that were supported in `v2` are restricted or removed in `v3`, leading to many plugins being unable to transition seamlessly to `v3`. However, starting from `2022.01.17`, the `Chrome` Web Store has stopped accepting new `Manifest V2` extensions, so for new developments, we still need to use the restricted capabilities of `v3`. Additionally, because Google had announced that the `v2` version would be completely deprecated in early `2023`, but as it cannot achieve full compatibility with the abilities of `v2`, it has now been delayed to early `2024`. However, Google is still preparing to gradually deprecate `v2` in favor of `v3`. Therefore, here we are also based on `v3` to implement the `Chrome` extension.

To build an extension application, you need to create a `manifest.json` file in the root directory of your project. A simple structure of `manifest.json` is shown below, and detailed configuration documentation can be found at `https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/manifest.json`:

```json
{
    "manifest_version": 3,              // Extension version
    "name": "Extension",                // Extension name
    "version": "1.0.0",                 // Extension version number
    "description": "Chrome Extension",  // Extension description
    "icons": {                          // Icons displayed in different locations for the extension
      "16": "icon16.png",               // Icon of size `16x16` pixels
      "32": "icon32.png",               // Icon of size `32x32` pixels
      "48": "icon48.png",               // Icon of size `48x48` pixels
      "128": "icon128.png"              // Icon of size `128x128` pixels
    },
    "action": {                         // Behavior when the browser toolbar button is clicked
      "default_popup": "popup.html",    // Default pop-up window opened when the button is clicked
      "default_icon": {                 // Pop-up window button icon // It can also be directly configured as a `string`
        "16": "icon16.png",             // Icon of size `16x16` pixels
        "32": "icon32.png",             // Icon of size `32x32` pixels
        "48": "icon48.png",             // Icon of size `48x48` pixels
        "128": "icon128.png"            // Icon of size `128x128` pixels
      }
    },
    "background": {                     // Defines the file and working method of the background page
      "service_worker": "background.js" // Registers the `Service Worker` file
    },
    "permissions": [                    // Defines the `API` permissions required by the extension
      "storage",                        // Storage access permission
      "activeTab",                      // Current tab access permission
      "scripting"                       // Script access permission
    ]
}
```

## Bundle
Now that we've confirmed that a `Chrome` extension is essentially a `Web` technology, we can fully utilize the related `Web` ecosystem to develop the extension. There are actually many mature extension frameworks available, which encompass a substantial set of capabilities. However, in this case, we want to go through the entire process from scratch and use a bundling tool to build the product. We've chosen `Rspack`, which is a high-performance build engine for `Rust` with interoperability with the `Webpack` ecosystem. It can be integrated at a low cost with `Webpack` projects and provides better build performance. The main reason for choosing `Rspack` is that its compilation speed is faster, especially in complex projects. The speed difference is quite evident, particularly in projects created with `Webpack` and `CRA`. In my case, the comparison of `dev` speeds before and after the project transformation is roughly `1min35s: 24s`, and the speed improvement is quite significant. Of course, in our simple `Chrome` extension scenario, the difference is not significant. All the related code is available at `https://github.com/WindrunnerMax/webpack-simple-environment/tree/rspack--chrome-extension`.

Now, let's start with the `manifest.json`. Our goal is to implement a pop-up window in the top right corner, as many extension programs are based on small pop-up window interactions in the upper right corner to control related capabilities. First, we need to configure the `action` in `manifest.json`. The `action` configuration controls the behavior when the browser toolbar button is clicked. Since it's part of the `web` ecosystem, we should configure it with an `html` file and an `icon`.

```js
"action": {
  "default_popup": "popup.html",
  "default_icon": "./static/favicon.png"
}
```

We've already set up the configuration file, now we need to generate the `HTML`. To achieve this, we'll need the help of `rspack`, it's actually quite similar to `webpack`. The overall idea is to first set up an `HTML` template, then pack the `Js` starting from the entry point, and finally inject the `Js` into the `HTML`. Here, we'll directly set up the capability to output from multiple entry points because usually an extension plugin won't only have one `Js` and `HTML` file, so we need to configure the capability for multiple entry points. Here, we've packed two files, one is `popup.html` as the entry point, and the other is `worker.js` as the background running `Service Worker` independent thread.

```js
entry: {
    worker: "./src/worker/index.ts",
    popup: "./src/popup/index.tsx",
  },
plugins: [
  new HtmlPlugin({
    filename: "popup.html",
    template: "./public/popup.html",
    inject: false,
  }),
],
```

In reality, the code generated in our `dev` environment is all in memory, whereas Google extensions are based on disk files, so we need to write the generated files to the disk. Here, the configuration is relatively simple, just set it up in the `devServer`.

```js
devServer: {
  devMiddleware: {
    writeToDisk: true,
  },
},
```

However, in reality, if we are based on disk files for extension development, then the `devServer` doesn't seem so necessary. We can simply use `watch` to accomplish this, that is, `build --watch`, which allows for real-time updating of disk files. We use `devServer` more in the hope of leveraging the ability of `HMR`, but this ability doesn't perform well under the limitations of `Chrome` extension `v3` at the moment. So for now, we'll temporarily set aside this ability, especially since `v3` is currently being updated based on community feedback. However, we can adopt some simple methods to mitigate this issue. The biggest problem when developing an extension is the need to manually click refresh when updating the plugin. To address this, we can use `chrome.runtime.reload()` to achieve a simple plugin reload capability, so that we don't have to manually refresh after updating the code.

Here, the main idea is to provide a way to write an `rspack` plugin that utilizes `ws.Server` to start a `WebSocket` server. Then, in `worker.js`, which is the `Service Worker` we are about to start, we connect to the `WebSocket` server using `new WebSocket` and listen for messages. When we receive a `reload` message from the server, we can execute `chrome.runtime.reload()` to achieve plugin reloading. In the `WebSocket` server that is started, we need to send a `reload` message to the client after each compilation is completed, for example in the `afterDone` hook. This way, we can achieve a simple plugin reload capability. However, in practice, this introduces another problem because in the `v3` version, the `Service Worker` is not always resident, so the `WebSocket` connection will also be destroyed when the `Service Worker` is destroyed, which is quite problematic. Similarly, due to this issue, a large number of `Chrome` extensions cannot smoothly transition from `v2` to `v3`, so this capability may still be improved in the future.

Next, when developing the extension, we definitely need to use `CSS` and component libraries. Here, we have introduced `@arco-design/web-react` and configured the handling of `scss` and `less` related styles. First is `define`, this capability can help us use `TreeShaking` to remove `dev` mode code during packaging, and certainly not just for `dev` mode, we can use this capability and configuration to distinguish code packaging for any scenario; next is `pluginImport`, this configuration handles the reference paths, it's actually equivalent to `babel-plugin-import` for achieving on-demand loading. Finally, there is the `CSS` and preprocessor related configuration, used to handle `scss module` as well as the component library's `less` files.

```js
builtins: {
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  pluginImport: [
    {
      libraryName: "@arco-design/web-react",
      style: true,
    },
  ],
},
module: {
  rules: [
    {
      test: /\.module.scss$/,
      use: [{ loader: "sass-loader" }],
      type: "css/module",
    },
    {
      test: /\.less$/,
      use: [
        {
          loader: "less-loader",
          options: {
            lessOptions: {
              javascriptEnabled: true,
              importLoaders: true,
              localIdentName: "[name]__[hash:base64:5]",
            },
          },
        },
      ],
      type: "css",
    },
  ],
},
```

Finally, we need to handle the resource files. Because we won't actually refer to `manifest.json` and the configured resource files in our code, we need to use an `rspack` plugin to accomplish this functionality. Since `rspack`'s related interface is compatible with `webpack5`, when writing the plugin, it's very similar to writing a `webpack` plugin. Here, the main tasks are to monitor changes to the `manifest.json` configuration file and the resource directory `public/static`, and then to copy the `manifest.json` file and the resource files to the build directory.

```js
const thread = require("child_process");
const path = require("path");

const exec = command => {
  return new Promise((resolve, reject) => {
    thread.exec(command, (err, stdout) => {
      if (err) reject(err);
      resolve(stdout);
    });
  });
};

class FilesPlugin {
  apply(compiler) {
    compiler.hooks.make.tap("FilePlugin", compilation => {
      const manifest = path.join(__dirname, "../src/manifest.json");
      const resources = path.join(__dirname, "../public/static");
      !compilation.fileDependencies.has(manifest) && compilation.fileDependencies.add(manifest);
      !compilation.contextDependencies.has(resources) &&
        compilation.contextDependencies.add(resources);
    });

    compiler.hooks.done.tapPromise("FilePlugin", () => {
      return Promise.all([
        exec("cp ./src/manifest.json ./dist/"),
        exec("cp -r ./public/static ./dist/static"),
      ]);
    });
  }
}

module.exports = FilesPlugin;
```

## Service Worker
When we open `chrome://extensions/` in the Chrome browser, we can see the plugins already loaded in our browser. Many plugins have a file similar to `background.html`. This is a unique ability of the `v2` extension, it's a separate thread that can be used to handle background tasks such as network requests, message pushing, and scheduled tasks. The extensions have now advanced to `v3` version, and a major difference in the `v3` version is that `Service Workers` cannot guarantee residency and need to be actively awakened. So, in `chrome://extensions/`, if it's a `v3` version plugin, we will see a `Service Worker` identifier. After a period of inactivity, this `Service Worker` will be marked as `Idle`, at this point it will be in a dormant state and no longer resident in memory.


For this 'Service Worker,' 'Chrome' clears all extension 'Service Workers' every 5 minutes, meaning that an extension's worker can only stay alive for a maximum of 5 minutes before waiting for the next activation by the user. However, the activation method is not clearly stated. So, what happens if our extension's job is incomplete and we need to continue from where we left off? Google's response is to use 'chrome.storage' to temporarily store the work tasks and wait for the next activation. To counter the random clearing events, many dirty tactics have emerged, including creating two extensions to mutually wake each other up to maintain continuous background operation. In addition to this, there are restrictions on aspects such as 'webRequest -> declarativeNetRequest,' 'setTimeout/setInterval,' 'DOM' parsing, 'window/document,' and more, which affect the capabilities of most plugins.

Of course, if we want to achieve the persistence of related capabilities when the user is running, we can directly use 'chrome.tabs.create' to open the extension's HTML page in a browser tab. This way, the extension can run in the foreground, and the extension's code will continue to run.

The Chrome official blog released a statement 'More details on the transition to Manifest V3,' pushing back the retirement date of Manifest V2 from January 2023 to January 2024:

```
Starting in June in Chrome 115, Chrome may run experiments to turn off support for Manifest V2 extensions in all channels, including stable channel.

In January 2024, following the expiration of the Manifest V2 enterprise policy, the Chrome Web Store will remove all remaining Manifest V2 items from the store.
```

Now, let's take a look at the declaration to retire Manifest V2 two years ago:

```
January 2023: The Chrome browser will no longer run Manifest V2 extensions. Developers may no longer push updates to existing Manifest V2 extensions.
```

What used to be straightforward and decisive has now become ambiguous and left room for maneuver. It seems that even for a powerhouse like Google, executing a 'Breaking Change' that affects 65% of Internet users worldwide is not that easy. However, in reality, 'v3' is not entirely a drawback. In terms of user privacy, 'v3' is definitely an improvement. 'v3' has added many privacy restrictions, and a very important point is that it does not allow referencing external resources. Chrome extensions can do so much that if you don't understand or if they are not open source, you would be reluctant to install them because of the high permissions of extensions, which may cause serious issues such as user information leakage. Even with methods like the requirement to upload source code as in Firefox to strengthen the audit, it is still difficult to eliminate all vulnerabilities.

## Communication Plan
In its design, Chrome extensions have many modules and capabilities. Common modules include 'background/worker,' 'popup,' 'content,' 'inject,' and 'devtools,' each serving different purposes and collaborating to constitute the extension’s functionality.

* `background/worker`: This module is responsible for running the extension in the background and can perform long-running operations such as server communications and scheduled tasks.
* `popup`: This module is the extension's pop-up interface, which can be popped up in the browser by clicking the extension icon. It is used for displaying the extension's information or operational interface.
* `content`: This module can access the current page's DOM structure and style, enabling interactions with the page. However, the 'window' of this module is isolated from the page's 'window.'
* `inject`: This module can inject custom JavaScript or CSS code into the current page. It enables interactions with the page, such as modifying page behavior and adding styles.
* `devtools`: This module can extend Chrome developer tools' functionality by adding new panels or modifying the behavior of existing panels.

```
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Popups
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/devtools_panels
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/web_accessible_resources
```

In terms of plugin capabilities, different modules have different distinctions, primarily in `Chrome API`, `DOM` access, cross-origin access, and page `Window` object access.

| Module | `Chrome API` | `DOM` Access | Cross-origin Access | Page `Window` Object Access |
| --- | --- | --- | --- | --- |
| `background/worker` | Most `APIs`, except `devtools` series | Cannot access page `DOM` directly | Cross-origin access allowed | Cannot access page `Window` directly |
| `popup` | Most `APIs`, except `devtools` series | Can directly access its own `DOM` | Cross-origin access allowed | Can directly access its own `Window` |
| `content` | Limited, can only access parts of `APIs` such as `runtime` and `extension` | Can access page `DOM` | Cross-origin access not allowed | Cannot access page `Window` directly |
| `inject` | Cannot access `Chrome API` | Can access page `DOM` | Cross-origin access not allowed | Can directly access page `Window` |
| `devtools` | Limited, can only access `devtools`, `runtime`, and parts of `extension` `APIs` | Can access page `DOM` | Cross-origin access not allowed | Can directly access page `Window` |

For message communication, different modules need to cooperate with three types of `APIs` to achieve it: short link `chrome.runtime.onMessage + chrome.runtime/tabs.sendMessage`, long link `chrome.runtime.connect + port.postMessage + port.onMessage + chrome.runtime/tabs.onConnect`, native message `window.postMessage + window.addEventListener`. The table below shows the direct communication scenarios, and we can develop indirect communication solutions according to actual business needs.

| | `background/worker` | `popup` | `content` | `inject` | `devtools` |
| --- | --- | --- | --- | --- | --- |
| `background/worker` | `/` | `chrome.extension.getViews` | `chrome.tabs.sendMessage / chrome.tabs.connect` | `/` | `/`|
| `popup` | `chrome.extension.getBackgroundPage` | `/` | `chrome.tabs.sendMessage / chrome.tabs.connect` | `/` | `/` |
| `content` | `chrome.runtime.sendMessage / chrome.runtime.connect` | `chrome.runtime.sendMessage / chrome.runtime.connect` | `/`  | `window.postMessage` | `/` |
| `inject` | `/` | `/` | `window.postMessage` | `/` | `/` |
| `devtools` | `chrome.runtime.sendMessage` | `chrome.runtime.sendMessage` | `/`  | `chrome.devtools.inspectedWindow.eval` | `/` |
```

## Example
Next, let's implement an example, the main function is a general solution to remove the browser's copy restriction. You can refer to the `https://github.com/WindrunnerMax/TKScript` specific for text selection and copy - universal part, and the complete operation example is in `https://github.com/WindrunnerMax/webpack-simple-environment/tree/rspack--chrome-extension`. In addition, the developer price for registering a `Chrome` extension is $5, and you can only publish the extension in the Chrome store after registration. So first, let's draw an interface in `popup` to display the current extension status and provide some operation buttons.

```js
export const App: FC = () => {
  const [copyState, setCopyState] = useState(false);
  const [copyStateOnce, setCopyStateOnce] = useState(false);
  const [menuState, setMenuState] = useState(false);
  const [menuStateOnce, setMenuStateOnce] = useState(false);
  const [keydownState, setKeydownState] = useState(false);
  const [keydownStateOnce, setKeydownStateOnce] = useState(false);

  // Communicate with `content` operations and `DOM`
  const onSwitchChange = (
    type:
      | typeof POPUP_CONTENT_ACTION.MENU
      | typeof POPUP_CONTENT_ACTION.KEYDOWN
      | typeof POPUP_CONTENT_ACTION.COPY,
    checked: boolean,
    once = false
  ) => {
    PopupContentBridge.postMessage({ type: type, payload: { checked, once } });
  };

  // Communicate with `content` and query the opening status
  useLayoutEffect(() => {
    const queue = [
      { key: QUERY_STATE_KEY.STORAGE_COPY, state: setCopyState },
      { key: QUERY_STATE_KEY.STORAGE_MENU, state: setMenuState },
      { key: QUERY_STATE_KEY.STORAGE_KEYDOWN, state: setKeydownState },
      { key: QUERY_STATE_KEY.SESSION_COPY, state: setCopyStateOnce },
      { key: QUERY_STATE_KEY.SESSION_MENU, state: setMenuStateOnce },
      { key: QUERY_STATE_KEY.SESSION_KEYDOWN, state: setKeydownStateOnce },
    ];
    queue.forEach(item => {
      PopupContentBridge.postMessage({
        type: POPUP_CONTENT_ACTION.QUERY_STATE,
        payload: item.key,
      }).then(r => {
        r && item.state(r.payload);
      });
    });
  }, []);

  return (
    <div className={cs(style.container)}>
      { /* xxx */ }
    </div>
  );
};
```

As you can see, we mainly communicate with the `content script` through the `bridge`. We also described how to communicate earlier. Here we can complete the related operations by designing a communication class. At the same time, to maintain the complete `TS` type, we have defined many flags for communication here. In fact, we have chosen a relatively complicated operation here. All operations must be completed by communicating with the `content script` because events and `DOM` operations must be completed in the `content script` or `inject script`. However, in fact, `chrome.scripting.executeScript` can also complete similar operations, but here, to demonstrate communication capabilities, we chose a more complicated operation. Also, if you want to maintain the state of the next opening of the page as the `Hook` state, you must also use the `content script`.

```js
export const POPUP_CONTENT_ACTION = {
  COPY: "___COPY",
  MENU: "___MENU",
  KEYDOWN: "___KEYDOWN",
  QUERY_STATE: "___QUERY_STATE",
} as const;

export const QUERY_STATE_KEY = {
  STORAGE_COPY: "___STORAGE_COPY",
  STORAGE_MENU: "___STORAGE_MENU",
  STORAGE_KEYDOWN: "___STORAGE_KEYDOWN",
  SESSION_COPY: "___SESSION_COPY",
  SESSION_MENU: "___SESSION_MENU",
  SESSION_KEYDOWN: "___SESSION_KEYDOWN",
} as const;

export const POPUP_CONTENT_RTN = {
  STATE: "___STATE",
} as const;

export type PopupContentAction =
  | {
      type:
        | typeof POPUP_CONTENT_ACTION.MENU
        | typeof POPUP_CONTENT_ACTION.KEYDOWN
        | typeof POPUP_CONTENT_ACTION.COPY;
      payload: { checked: boolean; once: boolean };
    }
  | {
      type: typeof POPUP_CONTENT_ACTION.QUERY_STATE;
      payload: (typeof QUERY_STATE_KEY)[keyof typeof QUERY_STATE_KEY];
    };

type PopupContentRTN = {
  type: (typeof POPUP_CONTENT_RTN)[keyof typeof POPUP_CONTENT_RTN];
  payload: boolean;
};

export class PopupContentBridge {
  static async postMessage(data: PopupContentAction) {
    return new Promise<PopupContentRTN | null>(resolve => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tabId = tabs[0] && tabs[0].id;
        if (tabId) {
          chrome.tabs.sendMessage(tabId, data).then(resolve);
          // https://developer.chrome.com/docs/extensions/reference/scripting/#runtime-functions
          // chrome.scripting.executeScript;
        } else {
          resolve(null);
        }
      });
    });
  }

  static onMessage(cb: (data: PopupContentAction) => void | PopupContentRTN) {
    const handler = (
      message: PopupContentAction,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: PopupContentRTN | null) => void
    ) => {
      const rtn = cb(message);
      sendResponse(rtn || null);
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => {
      chrome.runtime.onMessage.removeListener(handler);
    };
  }
}
```

Finally, we actually perform operations in the content script. The details of the copying behavior hook are obscured here. If you are interested, you can directly view the repository address above. The main operation implemented in the content script is to receive messages sent by the popup, perform operations, and do some initialization behavior based on the data stored in the storage. 

```js
let DOMLoaded = false;
const collector: (() => void)[] = [];
```

```javascript
// Equivalent to content_scripts document_end
window.addEventListener("DOMContentLoaded", () => {
  DOMLoaded = true;
  collector.forEach(fn => fn());
});

const withDOMReady = (fn: () => void) => {
  if (DOMLoaded) {
    fn();
  } else {
    collector.push(fn);
  }
};
```

```javascript
const onMessage = (data: PopupContentAction) => {
  switch (data.type) {
    case ACTION.COPY: {
      if (data.payload.checked) withDOMReady(enableCopyHook);
      else withDOMReady(disableCopyHook);
      const key = STORAGE_KEY_PREFIX + ACTION.COPY;
      if (!data.payload.once) {
        localStorage.setItem(key, data.payload.checked ? "true" : "");
      } else {
        sessionStorage.setItem(key, data.payload.checked ? "true" : "");
      }
      break;
    }
    case ACTION.MENU: {
      if (data.payload.checked) enableContextMenuHook();
      else disableContextMenuHook();
      const key = STORAGE_KEY_PREFIX + ACTION.MENU;
      if (!data.payload.once) {
        localStorage.setItem(key, data.payload.checked ? "true" : "");
      } else {
        sessionStorage.setItem(key, data.payload.checked ? "true" : "");
      }
      break;
    }
    case ACTION.KEYDOWN: {
      if (data.payload.checked) enableKeydownHook();
      else disableKeydownHook();
      const key = STORAGE_KEY_PREFIX + ACTION.KEYDOWN;
      if (!data.payload.once) {
        localStorage.setItem(key, data.payload.checked ? "true" : "");
      } else {
        sessionStorage.setItem(key, data.payload.checked ? "true" : "");
      }
      break;
    }
    case ACTION.QUERY_STATE: {
      const STATE_MAP = {
        [QUERY_STATE_KEY.STORAGE_COPY]: { key: ACTION.COPY, storage: localStorage },
        [QUERY_STATE_KEY.STORAGE_MENU]: { key: ACTION.MENU, storage: localStorage },
        [QUERY_STATE_KEY.STORAGE_KEYDOWN]: { key: ACTION.KEYDOWN, storage: localStorage },
        [QUERY_STATE_KEY.SESSION_COPY]: { key: ACTION.COPY, storage: sessionStorage },
        [QUERY_STATE_KEY.SESSION_MENU]: { key: ACTION.MENU, storage: sessionStorage },
        [QUERY_STATE_KEY.SESSION_KEYDOWN]: { key: ACTION.KEYDOWN, storage: sessionStorage },
      };
      for (const [key, value] of Object.entries(STATE_MAP)) {
        if (key === data.payload)
          return {
            type: POPUP_CONTENT_RTN.STATE,
            payload: !!value.storage[STORAGE_KEY_PREFIX + value.key],
          };
      }
    }
  }
};

PopupContentBridge.onMessage(onMessage);

```

```js
if (
  localStorage.getItem(STORAGE_KEY_PREFIX + ACTION.COPY) ||
  sessionStorage.getItem(STORAGE_KEY_PREFIX + ACTION.COPY)
) {
  withDOMReady(enableCopyHook);
}
if (
  localStorage.getItem(STORAGE_KEY_PREFIX + ACTION.MENU) ||
  sessionStorage.getItem(STORAGE_KEY_PREFIX + ACTION.MENU)
) {
  enableContextMenuHook();
}
if (
  localStorage.getItem(STORAGE_KEY_PREFIX + ACTION.KEYDOWN) ||
  sessionStorage.getItem(STORAGE_KEY_PREFIX + ACTION.KEYDOWN)
) {
  enableKeydownHook();
}
```

As the plugin is not published to the Chrome web store here, to test its effect, it can only be processed locally. After running `npm run dev`, you can find the packaged product in the `dist` directory. Next, open the developer mode in `chrome://extensions/`, then click "Load unpacked" and select the `dist` folder, then you can see our plugin. Later, when searching for the keyword "internship report" on Baidu, many documents appeared. When attempting to copy any of them, a payment prompt appeared. At this moment, we clicked the plugin to initiate the hook for copying behavior, and then tried to copy the text again, and found that the payment prompt did not appear, and the content was successfully copied. Please note that we have implemented a general copying capability here. For document platforms such as Baidu Wenku and Tencent Document, which are drawn using canvas, further special handling is required. For details on these, please refer to `https://github.com/WindrunnerMax/TKScript`.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.rspack.dev/
https://www.v2ex.com/t/861729
https://zhuanlan.zhihu.com/p/410510492
https://zhuanlan.zhihu.com/p/103072251
https://juejin.cn/post/7094545901967900686
https://juejin.cn/post/6844903985711677453
https://developer.chrome.com/docs/extensions/mv3/intro/
https://reorx.com/blog/understanding-chrome-manifest-v3/
https://tomzhu.site/2022/06/25/webpack开发Chrome扩展时的热更新解决方案
https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions
https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
```
