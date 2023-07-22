# 从零实现的Chrome扩展
`Chrome`扩展是一种可以在`Chrome`浏览器中添加新功能和修改浏览器行为的软件程序，例如我们常用的`TamperMonkey`、`Proxy SwitchyOmega`、`AdGuard`等等，这些拓展都是可以通过`WebExtensions API`来修改、增强浏览器的能力，用来提供一些浏览器本体没有的功能，从而实现一些有趣的事情。

## 描述
实际上`FireFox`是才第一个引入浏览器扩展/附加组件的主流浏览器，其在`2004`年发布了第一个版本的扩展系统，允许开发人员为`FireFox`编写自定义功能和修改浏览器行为的软件程序。而`Chrome`浏览器则在`2010`年支持了扩展系统，同样其也允许开发人员为`Chrome`编写自定义功能和修改浏览器行为的软件程序。

虽然`FireFox`是第一个引入浏览器扩展的浏览器，但是`Chrome`的扩展系统得到了广泛的认可和使用，也已经成为了现代浏览器中最流行的扩展系统之一。目前用于构建`FireFox`扩展的技术在很大程度上与被基于`Chromium`内核的浏览器所支持的扩展`API`所兼容，例如`Chrome`、`Edge`、`Opera`等。在大多数情况下，为基于`Chromium`内核浏览器而写的插件只需要少许修改就可以在`FireFox`中运行。那么本文就以`Chrome`扩展为例，聊聊如何从零实现一个`Chrome`扩展，本文涉及的相关的代码都在`https://github.com/WindrunnerMax/webpack-simple-environment`的`rspack--chrome-extension`分支中。

## Manifest
我们可以先来想一下浏览器拓展到底是什么，浏览器本身是支持了非常完备的`Web`能力的，也就是同时拥有渲染引擎和`Js`解析引擎，那么浏览器拓展本身就不需要再去实现一套新的可执行能力了，完全复用`Web`引擎即可。那么问题来了，单纯凭借`Js`是没有办法做到一些能力的，比如拦截请求、修改请求头等等，这些`Native`的能力单凭`Js`肯定是做不到的，起码也得上`C++`直接运行在浏览器代码中才可以，实际上解决这个问题也很简单，直接通过类似于`Js Bridge`的方式暴露出一些接口就可以了，这样还可以更方便地做到权限控制，一定程度避免浏览器扩展执行一些恶意的行为导致用户受损。

那么由此看来，浏览器扩展其实就是一个`Web`应用，只不过其运行在浏览器的上下文中，并且可以调用很多浏览器提供的特殊`API`来做到一些额外的功能。那么既然是一个`Web`应用，应该如何让浏览器知道这是一个拓展而非普通的`Web`应用，那么我们就需要标记和配置文件，这个文件就是`manifest.json`，通过这个文件我们可以来描述扩展的基本信息，例如扩展的名称、版本、描述、图标、权限等等。

在`manifest.json`中有一个字段为`manifest_version`，这个字段标志着当前`Chrome`的插件版本，现在我们在浏览器安装的大部分都是`v2`版本的插件，`v1`版本的插件早已废弃，而`v3`版本的插件因为存在大量的`Breaking Changes`，以及诸多原本`v2`支持的`API`在`v3`被限制或移除，导致诸多插件无法无损过渡到`v3`版本。但是自`2022.01.17`起，`Chrome`网上应用店已停止接受新的`Manifest V2`扩展，所以对于要新开发的拓展来说，我们还是需要使用`v3`版本的受限能力，而且因为谷歌之前宣布`v2`版本将在`2023`初完全废弃，但是又因为不能做到完全兼容`v2`地能力，现在又延迟到了`2024`年初。但是无论如何，谷歌都准备逐步废弃`v2`而使用`v3`，那么我们在这里也是基于`v3`来实现`Chrome`扩展。

那么构建一个扩展应用，你就需要在项目的根目录创建一个`manifest.json`文件，一个简单的`manifest.json`的结构如下所示，详细的配置文档可以参考`https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/manifest.json`:

```json
{
    "manifest_version": 3,              // 插件版本
    "name": "Extension",                // 插件名称
    "version": "1.0.0",                 // 插件版本号
    "description": "Chrome Extension",  // 插件描述信息
    "icons": {                          // 插件在不同位置显示的图标 
      "16": "icon16.png",               // `16x16`像素的图标
      "32": "icon32.png",               // `32x32`像素的图标
      "48": "icon48.png",               // `48x48`像素的图标
      "128": "icon128.png"              // `128x128`像素的图标
    },
    "action": {                         // 单击浏览器工具栏按钮时的行为
      "default_popup": "popup.html",    // 单击按钮时打开的默认弹出窗口
      "default_icon": {                 // 弹出窗口按钮图标 // 可以直接配置为`string`
        "16": "icon16.png",             // `16x16`像素的图标
        "32": "icon32.png",             // `32x32`像素的图标
        "48": "icon48.png",             // `48x48`像素的图标
        "128": "icon128.png"            // `128x128`像素的图标
      }
    },
    "background": {                     // 定义后台页面的文件和工作方式
      "service_worker": "background.js" // 注册`Service Worker`文件
    },
    "permissions": [                    // 定义插件需要访问的`API`权限
      "storage",                        // 存储访问权限
      "activeTab",                      // 当前选项卡访问权限
      "scripting"                       // 脚本访问权限
    ]
}
```

## Bundle
既然在上边我们确定了`Chrome`扩展实际上还是`Web`技术，那么我们就完全可以利用`Web`的相关生态来完成插件的开发，当前实际上是有很多比较成熟的扩展框架的，其中也集合了相当一部分的能力，只不过我们在这里希望从零开始跑通一整套流程，那么我们就自行借助打包工具来完成产物的构建。在这里选用的是`Rspack`，`Rspack`是一个于`Rust`的高性能构建引擎，具备与`Webpack`生态系统的互操作性，可以被`Webpack`项目低成本集成，并提供更好的构建性能。选用`Rspack`的主要原因是其编译速度会快一些，特别是在复杂项目中`Webpack`特别是`CRA`创建的项目打包速度简直惨不忍睹，我这边有个项目改造前后的`dev`速度对比大概是`1min35s : 24s`，速度提升还是比较明显的，当然在我们这个简单的`Chrome`扩展场景下实际上是区别不大的，相关的所有代码都在`https://github.com/WindrunnerMax/webpack-simple-environment/tree/rspack--chrome-extension`下。

那么现在我们先从`manifest.json`开始，目标是在右上角实现一个弹窗，当前很多扩展程序也都是基于右上角的小弹窗交互来控制相关能力的。首先我们需要在`manifest.json`配置`action`，`action`的配置就是控制单击浏览器工具栏按钮时的行为，因为实际上是`web`生态，所以我们应该为其配置一个`html`文件以及`icon`。

```js
"action": {
  "default_popup": "popup.html",
  "default_icon": "./static/favicon.png"
}
```

已经有了配置文件，现在我们就需要将`HTML`生成出来，在这里就需要借助`rspack`来实现了，实际上跟`webpack`差不多，整体思路就是先配置一个`HTML`模版，然后从入口开始打包`Js`，最后将`Js`注入到`HTML`当中就可以了，在这里我们直接配置一个多入口的输出能力，通常一个扩展插件不会是只有一个`Js`和`HTML`文件的，所以我们需要配置一个多入口的能力。在这里我们还打包了两个文件，一个是`popup.html`作为入口，另一个是`worker.js`作为后台运行的`Service Worker`独立线程。

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

实际上我们的`dev`模式生成的代码都是在内存当中的，而谷歌扩展是基于磁盘的文件的，所以我们需要将生成的相关文件写入到磁盘当中。在这里这个配置是比较简单的，直接在`devServer`中配置一下就好。

```js
devServer: {
  devMiddleware: {
    writeToDisk: true,
  },
},
```

但是实际上，如果我们是基于磁盘的文件来完成的扩展开发，那么`devServer`就显得没有那么必要了，我们直接可以通过`watch`来完成，也就是`build --watch`，这样就可以实现磁盘文件的实时更新了。我们使用`devServer`是更希望能够借助于`HMR`的能力，但是这个能力在`Chrome`扩展`v3`上的限制下目前表现的并不好，所以在这里这个能力先暂时放下，毕竟实际上`v3`当前还是在收集社区意见来更新的。不过我们可以有一些简单的方法，来缓解这个问题，我们在开发扩展的最大的一个问题是需要在更新的时候去手动点击刷新来加载插件，那么针对于这个问题，我们可以借助`chrome.runtime.reload()`来实现一个简单的插件重新加载能力，让我们在更新代码之后不必要去手动刷新。

在这里主要提供一个思路，我们可以编写一个`rspack`插件，利用`ws.Server`启动一个`WebSocket`服务器，之后在`worker.js`也就是我们将要启动的`Service Worker`来链接`WebSocket`服务器，可以通过`new WebSocket`来链接并且在监听消息，当收到来自服务端的`reload`消息之后，我们就可以执行`chrome.runtime.reload()`来实现插件的重新加载了，那么在开启的`WebSocket`服务器中需要在每次编译完成之后例如`afterDone`这个`hook`向客户端发送`reload`消息，这样就可以实现一个简单的插件重新加载能力了。但是实际上这引入了另一个问题，在`v3`版本的`Service Worker`不会常驻，所以这个`WebSocket`链接也会随着`Service Worker`的销毁而销毁，是比较坑的一点，同样也是因为这一点大量的`Chrome`扩展无法从`v2`平滑过渡到`v3`，所以这个能力后续还有可能会被改善。

接下来，开发插件我们肯定是需要使用`CSS`以及组件库的，在这里我们引入了`@arco-design/web-react`，并且配置了`scss`和`less`的相关样式处理。首先是`define`，这个能力可以帮助我们借助`TreeShaking`来在打包的时候将`dev`模式的代码删除，当然不光是`dev`模式，我们可以借助这个能力以及配置来区分任意场景的代码打包；接下来`pluginImport`这个处理引用路径的配置，实际上就相当于`babel-plugin-import`，用来实现按需加载；最后是`CSS`以及预处理器相关的配置，用来处理`scss module`以及组件库的`less`文件。

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

最后，我们需要处理一下资源文件，因为我们在代码中实际上是不会引用`manifest.json`以及我们配置的资源文件的，所以在这里我们需要通过一个`rspack`插件来完成相关的功能，因为`rspack`的相关接口是按照`webpack5`来做兼容的，所以在编写插件的时候实际跟编写`webpack`插件差不多。在这里主要是实现两个功能，一个是监听`manifest.json`配置文件以及资源目录`public/static`的变化，另一个是将`manifest.json`文件以及资源文件拷贝到打包目录中。

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
我们在`Chrome`浏览器中打开`chrome://extensions/`，可以看到我们浏览器中已经装载的插件，可以看到很多插件都会有一个类似于`background.html`的文件，这是`v2`版本的扩展独有的能力，是一个独立的线程，可以用来处理一些后台任务，比如网络请求、消息推送、定时任务等等。那么现在扩展已经发展到了`v3`版本，在`v3`版本中一个非常大的区别就是`Service Workers`不能保证常驻，需要主动唤醒，所以在`chrome://extensions/`中如果是`v3`版本的插件，我们会看到一个`Service Worker`的标识，那么在一段时间不动之后，这个`Service Worker`就会标记上`Idle`，在这个时候其就处于休眠状态了，而不再常驻于内存。

对于这个`Service Worker`，`Chrome`会每`5`分钟清理所有扩展`Service Workers`，也就是说扩展的`Worker`最多存活`5`分钟，然后等待用户下次激活，但是激活方式没有明确的表述，那假如我们的拓展要做的工作没做完，要接上次的工作怎么办，`Google`答复是用`chrome.storage`类似存储来暂存工作任务，等待下次激活。为了对抗随机的清理事件，出现了很多肮脏的手段，甚至有的为了保持持续后台，做两个扩展然后相互唤醒。除了这方面还有一些类似于`webRequest -> declarativeNetRequest`、`setTimeout/setInterval`、`DOM`解析、`window/document`等等的限制，会影响大部分的插件能力。

当然如果我们想在用户主观运行时实现相关能力的常驻，就可以直接`chrome.tabs.create`在浏览器`Tab`中打开扩展程序的`HTML`页面，这样就可以作为前台运行，同样这个扩展程序的代码就会一直运行着。

 `Chrome`官方博客发布了一个声明`More details on the transition to Manifest V3`，将`Manifest V2`的废除时间从`2023`年`1`月向后推迟了一年:

```
Starting in June in Chrome 115, Chrome may run experiments to turn off support for Manifest V2 extensions in all channels, including stable channel.

In January 2024, following the expiration of the Manifest V2 enterprise policy, the Chrome Web Store will remove all remaining Manifest V2 items from the store.
```

再来看看两年前对废除`Manifest V2`的声明:

```
January 2023: The Chrome browser will no longer run Manifest V2 extensions. Developers may no longer push updates to existing Manifest V2 extensions.
```
从原本的斩钉截铁，变成现在的含糊和留有余地，看来强如`Google`想要执行一个影响全世界`65%`互联网用户的`Breaking Change`，也不是那么容易的。但`v3`实际上并不全是缺点，在用户隐私上面，`v3`绝对是一个提升，`v3`增加了很多在隐私方面的限制，非常重要的一点是不允许引用外部资源。`Chrome`扩展能做的东西实在是太多了，如果不了解或者不开源的话根本不敢安装，因为扩展权限太高可能会造成很严重的例如用户信息泄漏等问题，即使是比如像`Firefox`那样必须要上传源代码的方式来加强审核，也很难杜绝所有的隐患。

## 通信方案
`Chrome`扩展在设计上有非常多的模块和能力，我们常见的模块有`background/worker`、`popup`、`content`、`inject`、`devtools`等，不同的模块对应着不同的作用，协作构成了插件的扩展功能。

* `background/worker`: 这个模块负责在后台运行扩展，可以实现一些需要长期运行的操作，例如与服务器通信、定时任务等。
* `popup`: 这个模块是扩展的弹出层界面，可以通过点击扩展图标在浏览器中弹出，用于显示扩展的一些信息或操作界面。
* `content`: 这个模块可以访问当前页面的`DOM`结构和样式，可以实现一些与页面交互的操作，但该模块的`window`与页面的`window`是隔离的。
* `inject`: 这个模块可以向当前页面注入自定义的`JavaScript`或`CSS`代码，可以实现一些与页面交互的操作，例如修改页面行为、添加样式等。
* `devtools`: 这个模块可以扩展`Chrome`开发者工具的功能，可以添加新的面板、修改现有面板的行为等。

```
https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Popups
https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/user_interface/devtools_panels
https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/manifest.json/web_accessible_resources
```

在插件的能力上，不同的模块也有着不同的区别，这个能力主要在于`Chrome API`、`DOM`访问、跨域访问、页面`Window`对象访问等。

|  模块   | `Chrome API`  | `DOM`访问 | 跨域访问 | 页面`Window`对象访问 |
|  ---  | --- | --- | --- | --- |
| `background/worker`  | 绝大部分`API`，除了`devtools`系列  | 不可直接访问页面`DOM` | 可跨域访问 | 不可直接访问页面`Window` |
| `popup`  | 绝大部分`API`，除了`devtools`系列 | 能直接访问自身的`DOM` | 可跨域访问 | 能直接访问自身的`Window` |
| `content`  | 有限制，只能访问`runtime`和`extension`等部分`API` | 可以访问页面`DOM` | 不可跨域访问 | 不可直接访问页面`Window` |
| `inject`  | 不能访问`Chrome API`  | 可以访问页面`DOM` | 不可跨域访问 | 可直接访问页面`Window` |
| `devtools`  | 有限制，只能访问`devtools`、`runtime`和`extension`等部分`API` | 可以访问页面`DOM` | 不可跨域访问 | 可直接访问页面`Window` |

对于消息通信，在不同的模块需要配合三种`API`来实现，短链接`chrome.runtime.onMessage + chrome.runtime/tabs.sendMessage`、长链接`chrome.runtime.connect + port.postMessage + port.onMessage + chrome.runtime/tabs.onConnect`，原生消息`window.postMessage + window.addEventListener`，下边的表格中展示的是直接通信的情况，我们可以根据实际的业务来完成间接通信方案。


| | `background/worker` | `popup` | `content` | `inject` | `devtools` |
| --- | --- | --- | --- | --- | --- |
| `background/worker` | `/` | `chrome.extension.getViews` | `chrome.tabs.sendMessage / chrome.tabs.connect` | `/` | `/`|
| `popup` | `chrome.extension.getBackgroundPage` | `/` | `chrome.tabs.sendMessage / chrome.tabs.connect` | `/` | `/` |
| `content` | `chrome.runtime.sendMessage / chrome.runtime.connect` | `chrome.runtime.sendMessage / chrome.runtime.connect` | `/`  | `window.postMessage` | `/` |
| `inject` | `/` | `/` | `window.postMessage` | `/` | `/` |
| `devtools` | `chrome.runtime.sendMessage` | `chrome.runtime.sendMessage` | `/`  | `chrome.devtools.inspectedWindow.eval` | `/` |

## 实例
接下来我们来实现一个实例，主要的功能是解除浏览器复制限制的通用方案，具体可以参考`https://github.com/WindrunnerMax/TKScript`文本选中复制-通用这部分，完整的操作实例都在`https://github.com/WindrunnerMax/webpack-simple-environment/tree/rspack--chrome-extension`中。此外注册`Chrome`扩展的开发者价格是`5$`，注册之后才能在谷歌商店发布扩展。那么首先，我们先在`popup`中绘制一个界面，用来展示当前的扩展状态，以及提供一些操作按钮。

```js
export const App: FC = () => {
  const [copyState, setCopyState] = useState(false);
  const [copyStateOnce, setCopyStateOnce] = useState(false);
  const [menuState, setMenuState] = useState(false);
  const [menuStateOnce, setMenuStateOnce] = useState(false);
  const [keydownState, setKeydownState] = useState(false);
  const [keydownStateOnce, setKeydownStateOnce] = useState(false);

  // 与`content`通信 操作事件与`DOM`
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

  // 与`content`通信 查询开启状态
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

可以看到我们实际上主要是通过`bridge`与`content script`进行了通信，在前边我们也描述了如何进行通信，在这里我们可以通过设计一个通信类来完成相关操作，同时为了保持完整的`TS`类型，在这里定义了很多通信时的标志。实际上在这里我们选择了一个相对麻烦的操作，所有的操作都必须要要通信到`content script`中完成，因为事件与`DOM`操作都必须要在`content script`或者`inject script`中才可以完成，但是实际上`chrome.scripting.executeScript`也可以完成类似的操作，但是在这里为了演示通信能力所以采用了比较麻烦的操作，另外如果要保持下次打开该页面的状态依旧是保持`Hook`状态的话，也必须要用`content script`。

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

最后，我们在`content script`中之行了实际上的操作，复制行为的`Hook`在这里抹除了细节，如果感兴趣可以直接看上边的仓库地址，在`content script`主要实现的操作就是接收`popup`发送过来的消息执行操作，并且根据存储在`storage`中的数据来做一些初始化的行为。

```js
let DOMLoaded = false;
const collector: (() => void)[] = [];

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

因为在这里这个插件并没有发布到`Chrome`的应用市场，所以如果想检验效果只能本地处理，在`run dev`后可以发现打包出来的产物已经在`dist`文件夹下了，接下来我们在`chrome://extensions/`打开开发者模式，然后点击"加载已解压的扩展程序"，选择`dist`文件夹，这样就可以看到我们的插件了。之后我在百度搜索了"实习报告"关键词，出现了很多文档，随便打开一个在复制的时候就会出现付费的行为，此时我们点击插件，启动`Hook`复制行为，再复制文本内容就会发现不会弹出付费框了，内容也是成功复制了。请注意在这里我们实现的是一个通用的复制能力，对于百度文库、腾讯文档这类的`canvas`绘制的文档站是需要单独处理的，关于这些可以参考`https://github.com/WindrunnerMax/TKScript`。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

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
