# 从油猴脚本管理器的角度审视Chrome扩展

在之前一段时间，我需要借助Chrome扩展来完成一个需求，当时还在使用油猴脚本与浏览器扩展之间调研了一波，而此时恰好我又有一些做的还可以的油猴脚本[TKScript](https://github.com/WindrunnerMax/TKScript)，相对会比较熟悉脚本管理器的能力，预估是不太能完成需求的，所以趁着这个机会，我又学习了一波浏览器扩展的能力。那么在后来需求的开发过程中，因为有些能力是类似于脚本管理器提供的基础环境，致使我越来越好奇脚本管理器是怎么实现的，而实际上脚本管理器实际上还是一个浏览器扩展，浏览器也并没有给脚本管理器开后门来实现相关能力，而让我疑惑的三个问题是:

1. 脚本管理器为什么能够先于页面的`JS`运行。
2. 脚本管理器是如何能够得到页面`window`对象。
3. 脚本管理器为什么能够无视浏览器的同源策略从而发起跨域的请求。
 
因此，之后调研了一波浏览器扩展能力的开发之后，总结了脚本管理器的核心能力实现，同样也是解答了让我疑惑的这三个问题。

## 从零开始浏览器扩展的开发
`Chrome`扩展是一种可以在`Chrome`浏览器中添加新功能和修改浏览器行为的软件程序，例如我们常用的`TamperMonkey`、`Proxy SwitchyOmega`、`AdGuard`等等，这些拓展都是可以通过`WebExtensions API`来修改、增强浏览器的能力，用来提供一些浏览器本体没有的功能，从而实现一些有趣的事情。

实际上`FireFox`是才第一个引入浏览器扩展/附加组件的主流浏览器，其在`2004`年发布了第一个版本的扩展系统，允许开发人员为`FireFox`编写自定义功能和修改浏览器行为的软件程序。而`Chrome`浏览器则在`2010`年支持了扩展系统，同样其也允许开发人员为`Chrome`编写自定义功能和修改浏览器行为的软件程序。

虽然`FireFox`是第一个引入浏览器扩展的浏览器，但是`Chrome`的扩展系统得到了广泛的认可和使用，也已经成为了现代浏览器中最流行的扩展系统之一。目前用于构建`FireFox`扩展的技术在很大程度上与被基于`Chromium`内核的浏览器所支持的扩展`API`所兼容，例如`Chrome`、`Edge`、`Opera`等。在大多数情况下，为基于`Chromium`内核浏览器而写的插件只需要少许修改就可以在`FireFox`中运行，不过在实际测试中`FireFox`对于`V3`的扩展支持度可能并没有那么好，还是以`V2`为主。

### Manifest
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

### Bundle
既然在上边我们确定了`Chrome`扩展实际上还是`Web`技术，那么我们就完全可以利用`Web`的相关生态来完成插件的开发，当前实际上是有很多比较成熟的扩展框架的，其中也集合了相当一部分的能力，只不过我们在这里希望从零开始跑通一整套流程，那么我们就自行借助打包工具来完成产物的构建。在这里选用的是`Rspack`，`Rspack`是一个于`Rust`的高性能构建引擎，具备与`Webpack`生态系统的互操作性，可以被`Webpack`项目低成本集成，并提供更好的构建性能。选用`Rspack`的主要原因是其编译速度会快一些，特别是在复杂项目中`Webpack`特别是`CRA`创建的项目打包速度简直惨不忍睹，我这边有个项目改造前后的`dev`速度对比大概是`1min35s : 24s`，速度提升还是比较明显的，当然在我们这个简单的`Chrome`扩展场景下实际上是区别不大。

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
      customName: "@arco-design/web-react/es/{{ member }}",
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

当然如果有需要的话，通过`ts-node`来动态生成`manifest.json`也是不错的选择，因为这样我们就可以通过各种逻辑来动态地将配置文件写入了，比如拿来适配`Chromium`和`Gecko`内核的浏览器。


```js
apply(compiler) {
    compiler.hooks.make.tap("ManifestPlugin", compilation => {
      const manifest = this.manifest;
      !compilation.fileDependencies.has(manifest) && compilation.fileDependencies.add(manifest);
    });

    compiler.hooks.done.tapPromise("ManifestPlugin", () => {
      delete require.cache[require.resolve(this.manifest)];
      const manifest = require(this.manifest);
      const version = require(path.resolve("package.json")).version;
      manifest.version = version;
      const folder = isGecko ? "build-gecko" : "build-chromium";
      return writeFile(path.resolve(`${folder}/manifest.json`), JSON.stringify(manifest, null, 2));
    });
  }
```

### Service Worker
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

### 通信方案
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

对于消息通信，在不同的模块需要配合三种`API`来实现，短链接`chrome.runtime.onMessage + chrome.runtime/tabs.sendMessage`、长链接`chrome.runtime.connect + port.postMessage + port.onMessage + chrome.runtime/tabs.onConnect`，原生消息`window.postMessage + window.addEventListener`，下边的表格中展示的是直接通信的情况，我们可以根据实际的业务来完成间接通信方案，并且有些方法只能在`V2`中使用，可以酌情参考。


| | `background/worker` | `popup` | `content` | `inject` | `devtools` |
| --- | --- | --- | --- | --- | --- |
| `background/worker` | `/` | `chrome.extension.getViews` | `chrome.tabs.sendMessage / chrome.tabs.connect` | `/` | `/`|
| `popup` | `chrome.extension.getBackgroundPage` | `/` | `chrome.tabs.sendMessage / chrome.tabs.connect` | `/` | `/` |
| `content` | `chrome.runtime.sendMessage / chrome.runtime.connect` | `chrome.runtime.sendMessage / chrome.runtime.connect` | `/`  | `window.postMessage` | `/` |
| `inject` | `/` | `/` | `window.postMessage` | `/` | `/` |
| `devtools` | `chrome.runtime.sendMessage` | `chrome.runtime.sendMessage` | `/`  | `chrome.devtools.inspectedWindow.eval` | `/` |


## 脚本管理器核心能力的实现
不知道大家是否有用过油猴脚本，因为实际上浏览器级别的扩展整体架构非常复杂，尽管当前有统一规范但不同浏览器的具体实现不尽相同，并且成为开发者并上架`Chrome`应用商店需要支付`5$`的注册费，如果我们只是希望在`Web`页面中进行一些轻量级的脚本编写，使用浏览器扩展级别的能力会显得成本略高，所以在没有特殊需求的情况，在浏览器中实现级别的轻量级脚本是很不错的选择。

那么在简单了解了浏览器扩展的开发之后，我们回到开头提出的那三个问题，实际上这三个问题并没有那么独立，而是相辅相成的，为了清晰我们还是将其拆开来看，所以我们在看每个问题的时候都需要假设另一方面的实现，比如在解答第三个为什么能够跨域请求的问题时，我们就需要假设脚本实际是运行在`Inject`环境中的，因为如果脚本是运行在`Background`中的话，那么讨论跨域就没什么意义了。

### document_start
在油猴脚本管理器中有一个非常重要的实现是`@run-at: document-start/document-end/document-idle`，特别是`document-start`，试想一下如果我们能够在页面实际加载的时候就运行我们想执行的`JS`代码的话，岂不是可以对当前的页面“为所欲为了”。虽然我们不能够`Hook`自面量的创建，但是我们总得调用浏览器提供的`API`，只要用`API`的调用，我们就可以想办法来劫持掉函数的调用，从而拿到我们想要的数据，例如可以劫持`Function.prototype.call`函数的调用，而这个函数能够完成很大程度上就需要依赖我这个劫持函数在整个页面是要最先支持的，否则这个函数已经被调用过去了，那么再劫持就没有什么意义了。

```js
Function.prototype.call = function (dynamic, ...args) {
  const context = Object(dynamic) || window;
  const symbol = Symbol();
  context[symbol] = this;
  args.length === 2 && console.log(args);
  try {
    const result = context[symbol](...args);
    delete context[symbol];
    return result;
  } catch (error) {
    console.log("Hook Call Error", error);
    console.log(context, context[symbol], this, dynamic, args);
    return null;
  }
};
```

那么可能我们大家会想这个代码的实现意义在何处，举一个简单的实践，在某某文库中所有的文字都是通过`canvas`渲染的，因为没有`DOM`那么如果我们想获得文档的整篇内容是没有办法直接复制的，所以一个可行的方案是劫持`document.createElement`函数，当创建的元素是`canvas`时我们就可以提前拿到画布的对象，从而拿到`ctx`，而又因为实际绘制文字总归还是要调用`context2DPrototype.fillText`方法的，所以再劫持到这个方法，我们就能将绘制的文字拿出来，紧接着就可以自行创建`DOM`画在别处，想复制就可以复制了。

那么我们回到这个问题的实现上，如果能够保证脚本是最先执行的，那么我们几乎可以做到在语言层面上的任何事情，例如修改`window`对象、`Hook`函数定义、修改原型链、阻止事件等等等等。其本身的能力也是源自于浏览器拓展，而如何将浏览器扩展的这个能力暴露给`Web`页面就是脚本管理器需要考量的问题了。那么我们在这里假设用户脚本是运行在浏览器页面的`Inject Script`而不是`Content Script`，基于这个假设，首先我们大概率会写过动态/异步加载`JS`脚本的实现，类似于下面这种方式:

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

那么现在就有一个明显的问题，我们如果在`body`标签构建完成也就是大概在`DOMContentLoaded`时机再加载脚本肯定是达不到`document-start`的目标的，即使是在`head`标签完成之后处理也不行，很多网站都会在`head`内编写部分`JS`资源，在这里加载同样时机已经不合适了，实际上最大的问题还是整个过程是异步的，在整个外部脚本加载完成之前已经有很多`JS`代码在执行了，做不到我们想要的“最先执行”。

那么下载我们就来探究具体的实现，首先是`V2`的扩展，对于整个页面来说，最先加载的必定是`html`这个标签，那么很明显我们只要将脚本在`html`标签级别插入就好了，配合浏览器扩展中`background`的`chrome.tabs.executeScript`动态执行代码以及`Content Script`的`"run_at": "document_start"`建立消息通信确认注入的`tab`，这个方法是不是看起来很简单，但就是这么简单的问题让我思索了很久是如何做到的。

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

这个看起来其实已经还不错了，能够基本做到`document-start`，但既然都说了是基本，说明还有些情况会出问题，我们仔细看这个代码的实现，在这里有一个通信也就是`Content Script --> Background`，既然是通信那么就是异步处理的，既然是异步处理就会消耗时间，一旦消耗时间那么用户页面就可能已经执行了大量的代码了，所以这个实现会偶现无法做到`document-start`的情况，也就是实际上是会出现脚本失效的情况。

那么有什么办法解决这个问题呢，在`V2`中我们能够明确知道的是`Content Script`是完全可控的`document-start`，但是`Content Script`并不是`Inject Script`，没有办法访问到页面的`window`对象，也就没有办法实际劫持页面的函数，那么这个问题看起来很复杂，实际上想明白之后解决起来也很简单，我们在原本的`Content Script`的基础上，再引入一个`Content Script`，而这个`Content Script`的代码是完全等同于原本的`Inject Script`，只不过会挂在`window`上，我们可以借助打包工具来完成这件事。

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

这段代码表示了我们在同样的`Content Script`的`window`对象上挂了一个随机生成的`key`，而内容就是我们实际想要注入到页面的脚本，但是现在虽然我们能够拿到这个函数了，怎么能够让其在用户页面上执行呢，这里实际上是用到了同样的`document.documentElement.appendChild`创建脚本方法，但是在这里的实现非常非常巧妙，我们通过两个`Content Script`配合`toString`的方式拿到了字符串，并且将其作为代码直接注入到了页面，从而做到了真正的`document-start`。

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

此外我们可能纳闷，为什么脚本管理器框架和用户脚本都是采用这种方式注入的，而在浏览器控制台的`Sources`控制面板下只能看到一个`userscript.html?name=xxxxxx.user.js`却看不到脚本管理器的代码注入，实际上这是因为脚本管理器会在用户脚本的最后部分注入一个类似于`//# sourceURL=chrome.runtime.getURL(xxx.user.js)`的注释，其中这个`sourceURL`会将注释中指定的`URL`作为脚本的源`URL`，并在`Sources`面板中以该`URL`标识和显示该脚本，这对于在调试和追踪代码时非常有用，特别是在加载动态生成的或内联脚本时。

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

由于实际上`Chrome`浏览器不再允许`V2`的扩展程序提交，所以我们只能提交`V3`的代码，但是`V3`的代码有着非常严格的`CSP`内容安全策略的限制，可以简单的认为不允许动态地执行代码，所以我们上述的方式就都失效了，于是我们只能写出类似下面的代码。

```js
const script = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
script.setAttribute("type", "text/javascript");
script.setAttribute("src", chrome.runtime.getURL("inject.js"));
document.documentElement.appendChild(script);
script.onload = () => script.remove();
```

虽然看起来我们也是在`Content Script`中立即创建了`Script`标签并且执行代码，而他能够达到我们的`document-start`目标吗，很遗憾答案是不能，在首次打开页面的时候是可以的，但是在之后因为这个脚本实际上是相当于拿到了一个外部的脚本，因此`Chrome`会将这个脚本和页面上其他的页面同样处于一个排队的状态，而其他的脚本会有强缓存在，所以实际表现上是不一定谁会先执行，但是这种不稳定的情况我们是不能够接受的，肯定做不到`document-start`目标。实际上光从这点来看`V3`并不成熟，很多能力的支持都不到位，所以在后来官方也是做出了一些方案来处理这个问题，但是因为我们并没有什么办法决定用户客户端的浏览器版本，所以很多兼容方法还是需要处理的。

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

在`Chrome V109`之后支持了`chrome.scripting.registerContentScripts`，`Chrome 111`支持了直接在`Manifest`中声明`world: 'MAIN'`的脚本，但是这其中的兼容性还是需要开发者来做，特别是如果原来的浏览器不支持`world: 'MAIN'`，那么这个脚本是会被当作`Content Script`处理的，关于这点我觉得还是有点难以处理。


### unsafeWindow
这个问题也是一个非常有意思的点，关于这个问题我还在群里提问过但是当时并没有得到一个答案，那么在这里我们就研究一下，首先我们要明确的是在脚本中是存在两个`window`的，也就是`window`以及`unsafeWindow`两个对象，`window`对象是一个隔离的安全`window`环境，而`unsafeWindow`就是用户页面中的`window`对象。

曾经我很长一段时间都认为这些插件中可以访问的`window`对象实际上是浏览器拓展的`Content Scripts`提供的`window`对象，而`unsafeWindow`是用户页面中的`window`，以至于我用了比较长的时间在探寻如何直接在浏览器拓展中的`Content Scripts`直接获取用户页面的`window`对象，当然最终还是以失败告终，这其中比较有意思的是一个逃逸浏览器拓展的实现，因为在`Content Scripts`与`Inject Scripts`是共用`DOM`的，所以可以通过`DOM`来实现逃逸，当然这个方案早已失效。

```js
var unsafeWindow;
(function() {
    var div = document.createElement("div");
    div.setAttribute("onclick", "return window");
    unsafeWindow = div.onclick();
})();
```

此外在`FireFox`中还提供了一个`wrappedJSObject`来帮助我们从`Content Scripts`中访问页面的的`window`对象，但是这个特性也有可能因为不安全在未来的版本中被移除。实际上就拿上边这个逃逸方法而言，浏览器也是正在围追堵截这种行为，也就是说我们可以明确的是在`Content Scripts`中是拿不到浏览器页面的`window`对象的。

那么最终我如何确定这两个`window`对象实际上是同一个浏览器环境的`window`呢，主要是之前做到了需要动态渲染`React`组件的需求，突然又意识到了这个问题，所以除了看开源的脚本管理器源码之外我们也可以通过以下的代码来验证脚本在浏览器的效果，可以看出我们对于`window`的修改实际上是会同步到`unsafeWindow`上，证明实际上是同一个引用。

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

实际上在这里还利用了`new Function`的逃逸，所以才能够发现这俩实际上是同一个引用，那么问题又来了，既然都是同一个`window`对象，脚本管理器是如何提供的干净的`window`对象的，在这里我们就得聊一个小故事了。试想一下如果我们完全信任用户当前页面的`window`，那么我们可能会直接将`API`挂载到`window`对象上，听起来似乎没有什么问题，但是设想这么一个场景，假如用户访问了一个恶意页面，然后这个网页又恰好被类似`https://*/*`规则匹配到了，那么这个页面就可以获得访问我们的脚本管理器的相关`API`，这相当于是浏览器扩展级别的权限，例如直接获取用户磁盘中的文件内容，并且可以直接将内容跨域发送到恶意服务器，这样的话我们的脚本管理器就会成为一个安全隐患，再比如当前页面已经被`XSS`攻击了，攻击者便可以借助脚本管理器`GM.cookie.get`来获取`HTTP Only`的`Cookie`，并且即使不开启`CORS`也可以轻松将请求发送到服务端。那么显然我们本身是准备使用脚本管理器来`Hook`浏览器的`Web`页面，此时反而却被越权访问了更高级的函数，这显然是不合理的，所以`GreaseMonkey`实现了`XPCNativeWrappers`机制，也可以理解为针对于`window`对象的沙箱环境。

实际上在`@grant none`的情况下，脚本管理器会认为当前的环境是安全的，同样也不存在越权访问的问题了，所以此时访问的`window`就是页面原本的`window`对象。此外，上边我们也提到了验证代码最后两行我们突破了这些扩展的沙盒限制，从而可以在未`@grant unsafeWindow`情况下能够直接访问`unsafeWindow`，当然这并不是什么大问题，因为脚本管理器本身也是提供`unsafeWindow`访问的，而且如果在页面未启用`unsafe-eval`的`CSP`情况下这个例子就失效了。只不过我们也可以想一下其他的方案，是不是直接禁用`Function`函数以及`eval`的执行就可以了，但是很明显即使我们直接禁用了`Function`对象的访问，也同样可以通过构造函数的方式即`(function(){}).constructor`来访问`Function`对象，所以针对于`window`沙箱环境也是需要不断进行攻防的，例如小程序不允许使用`Function`、`eval`、`setTimeout`、`setInterval`来动态执行代码，那么社区就开始有了手写解释器的实现，对于我们这个场景来说，我们甚至可以直接使用`iframe`创建一个`about:blank`的`window`对象作为隔离环境。

那么我们紧接着可以简单地讨论下如何实现沙箱环境隔离，其实在上边的例子中也可以看到直接打印`window`输出的是一个`Proxy`对象，那么在这里我们同样使用`Proxy`来实现简单的沙箱环境，我们需要实现的是对于`window`对象的代理，在这里我们简单一些，我们希望的是所有的操作都在新的对象上，不会操作原本的对象，在取值的时候可以做到首先从我们新的对象取，取不到再去`window`对象上取，写值的时候只会在我们新的对象上操作，在这里我们还用到了`with`操作符，主要是为了将代码的作用域设置到一个特定的对象中，在这里就是我们创建的的`context`，在最终结果中我们可以看到我们对于`window`对象的读操作是正确的，并且写操作都只作用在沙箱环境中。

```js
const context = Object.create(null);
const global = window;
const proxy = new Proxy(context, {
    // `Proxy`使用`in`操作符号判断是否存在属性
    has: () => true,
    // 写入属性作用到`context`上
    set: (target, prop, value) => {
        target[prop] = value;
        return true;
    },
    // 特判特殊属性与方法 读取属性依次读`context`、`window`
    get: (target, prop) => {
        switch (prop) {
            // 重写特殊属性指向
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
                // `alert`、`setTimeout`等方法作用域必须在`window`下
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

此外即使我们完成了沙箱环境的构建，但是如何将这个对象传递给用户脚本，我们不能将这些变量暴露给网站本身，但是又需要将相关的变量传递给脚本，而脚本本身就是运行在用户页面上的，否则我们没有办法访问用户页面的`window`对象，所以接下来我们就来讨论如何保证我们的高级方法安全地传递到用户脚本的问题。实际上在上边的`source-map`我们也可以明显地看出来，我们可以直接借助闭包以及`with`访问变量即可，并且在这里还需要注意`this`的问题，所以在调用该函数的时候通过如下方式调用即可将当前作用域的变量作为传递给脚本执行。

```js
script.apply(proxyContent, [ proxyContent, GM_info ]);
```

那么现在到目前为止我们使用`Proxy`实现了`window`对象隔离的沙箱环境，总结起来我们的目标是实现一个干净的`window`沙箱环境，也就是说我们希望网站本身执行的任何不会影响到我们的`window`对象，比如网站本体在`window`上挂载了`$$`对象，我们本身不希望其能直接在开发者的脚本中访问到这个对象，我们的沙箱环境是完全隔离的，而用户脚本管理器的目标则是不同的，比如用户需要在`window`上挂载事件，那么我们就应该将这个事件处理函数挂载到原本的`window`对象上，那么我们就需要区分读或者写的属性是原本`window`上的还是`Web`页面新写入的属性，显然如果想解决这个问题就要在用户脚本执行之前将原本`window`对象上的`key`记录副本，相当于以白名单的形式操作沙箱。同样的相辅相成的，如果想要做到`window`沙箱那么就必须保证扩展的`Inject Script`是最先执行的也就是`document-start`，否则就很难保证用户原本是不是在`window`对象上挂载了内容，导致污染了沙箱环境。


### xmlHttpRequest
接着我们来聊最后一个问题，脚本管理器是如何做到的可以跨域请求，实际上因为在前边我们明确了用户脚本是在浏览器当前的页面执行的，那么理所当然的就会存在同源策略的问题，然后在脚本管理器中只要声明了链接的域名，就可以逃脱这个限制，这又是一件很神奇的事情。

那么解决这个问题的方式也比较简单，很明显在这里发起的通信并不是直接从页面的`window`发起的，而是从浏览器扩展发出去的，所以在这里我们就需要讨论如何做到在用户页面与浏览器扩展之间进行通信的问题。在`Content Script`中的`DOM`和事件流是与`Inject Script`共享的，那么实际上我们就可以有两种方式实现通信，首先我们常用的方法是`window.addEventListener + window.postMessage`，只不过这种方式很明显的一个问题是在`Web`页面中也可以收到我们的消息，即使我们可以生成一些随机的`token`来验证消息的来源，但是这个方式毕竟能够非常简单地被页面本身截获不够安全，所以在这里通常是用的另一种方式，即`document.addEventListener + document.dispatchEvent + CustomEvent`自定义事件的方式，在这里我们需要注意的是事件名要随机，通过在注入框架时于`background`生成唯一的随机事件名，之后在`Content Script`与`Inject Script`都使用该事件名通信，就可以防止用户截获方法调用时产生的消息了。

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

只不过因为这边涉及到的通信会比较多，通过`Content Script`中转来将消息发送到`Background/Worker`来最终实现的请求，实际控制起来还是有些麻烦的，需要比较好的设计来处理各个模块的通信与事件触发。


## 总结
最终在这里我们可能已经明确了浏览器扩展的一些非常`Hack`能力的实现，同时可能也会发现浏览器扩展的权限是真的非常高，在`V2`版本中甚至连`HTTP Only`的`Cookie`都可以拿到，在`V3`中限制就多了起来，但是整体的权限还是非常高的，所以在选择浏览器扩展时还是需要谨慎，要不就选择用户比较多的，要不就选择开源的。不过之前类似`EDGE`扩展的事件还是不容易避免，简单来说就是`EDGE`开放了扩展，然后有些不怀好意的人将开源的扩展封装了广告代码然后提交到扩展市场，最终使用拓展的我们还是要关注一下这些问题的，最后提供一些脚本管理器可以参考学习。

* [GreaseMonkey](https://github.com/greasemonkey/greasemonkey): 俗称油猴，最早的用户脚本管理器，为`Firefox`提供扩展能力，采用`MIT license`协议。
* [TamperMonkey](https://github.com/Tampermonkey/tampermonkey): 俗称篡改猴，最受欢迎的用户脚本管理器，能够为当前主流浏览器提供扩展能力，开源版本采用`GPL-3.0 license`协议。
* [ViolentMonkey](https://github.com/violentmonkey/violentmonkey): 俗称暴力猴，完全开源的用户脚本管理器，同样能够为当前主流浏览器提供扩展能力，采用`MIT license`协议。
* [ScriptCat](https://github.com/scriptscat/scriptcat): 俗称脚本猫，完全开源的用户脚本管理器，同样能够为当前主流浏览器提供扩展能力，采用` GPL-3.0 license`协议。
