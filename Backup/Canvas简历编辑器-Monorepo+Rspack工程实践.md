# Canvas简历编辑器-Monorepo+Rspack工程实践

在之前我们围绕`Canvas`聊了很多代码设计层面的东西，在这里我们聊一下工程实践。在之前的文中我也提到过，因为是本着学习的态度以及对技术的好奇心来做的，所以除了一些工具类的库例如 `ArcoDesign`、`ResizeObserve`、`Jest` 等包之外，关于 数据结构`packages/delta`、插件化`packages/plugin`、核心引擎`packages/core` 等都是手动实现的，所以在这里除了学习了`Canvas`之外，实际上还做了一些项目工程化的实践。

* 在线编辑: <https://windrunnermax.github.io/CanvasEditor>
* 开源地址: <https://github.com/WindrunnerMax/CanvasEditor>

关于`Canvas`简历编辑器项目的相关文章:

* [掘金老给我推Canvas，我也学习Canvas做了个简历编辑器](https://juejin.cn/post/7329799331216015395)
* [Canvas图形编辑器-数据结构与History(undo/redo)](https://juejin.cn/post/7331575219957366836)
* [Canvas图形编辑器-我的剪贴板里究竟有什么数据](https://juejin.cn/post/7331992322233024548)
* [Canvas简历编辑器-图形绘制与状态管理(轻量级DOM)](https://juejin.cn/spost/7354986873733333055)
* [Canvas简历编辑器-Monorepo+Rspack工程实践](https://juejin.cn/spost/7357349281885503500)
* [Canvas简历编辑器-层级渲染与事件管理能力设计](https://juejin.cn/spost/7376197082203684873)


## Pnpm+Monorepo
我们先来聊聊为什么要用`monorepo`，先举一个我之前踩过的坑作为例子，在之前我的富文本编辑器项目 [DocEditor](https://github.com/WindrunnerMax/DocEditor) 就是完全写在了独立的单个`src`目录中，在项目本身的运行过程中是没什么问题的，但是当时我想将编辑器独立出来作为`NPM`包用，打包的过程是借助了`Rollup`也没什么问题，问题就出在了引用方上。当时我在简历编辑器中引入文档编辑器的`NPM`包时，发现有一个模块被错误的`TreeShaking`了，现在都还能在编辑器中看到这部分兼容。

```js
module: {
  rules: [
    {
      // 对`doc-editor-light`的`TreeShaking`有点问题
      test: /doc-editor-light\/dist\/tslib.*\.js/,
      sideEffects: true,
     },
   ]
}
```

这个问题导致了我在`dev`模式下没有什么问题，但是在`build`之后这部分代码被错误地移除掉了，导致编辑器的`wrapper`节点出现了问题，列表等元素不能正确添加。当然实际上这不能说明独立包项目不好，只能说整个管理的时候可能并不是那么简单，尤其是打包为`NPM`包的时候需要注意各个入口问题。那么现在引用我的富文本编辑器包已经变成了`4`个独立的包分别引用，各司其职，就没再出现过这个问题。

说起来打包的问题，我还踩过一个坑，不知道大家是不是见到过`React`的`Invalid hook call`这个经典报错。之前我将其独立拆包的时候之后，发现会报这个错，但是我在`package.json`中是标注的`peerDependencies "react": ">=16"`，按理说这里会直接应用安装该包的`React`，不可能出现版本不一致的问题，至于`Rules of Hooks`肯定也不可能，因为我之前是好好的，拆完包才出的问题。最后发现是我在`rollup`中没把`peerDependencies`这部分解析，导致`jsx-runtime`被打进了包里，虽然`React`的版本都是`17.0.2`但是实际上是运行了两个独立词法作用域的`React Hooks`，这才导致了这个问题。


```
Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:

1.  You might have mismatching versions of React and the renderer (such as React DOM)
2.  You might be breaking the Rules of Hooks
3.  You might have more than one copy of React in the same app See for tips about how to debug and fix this problem.
```

接着回到项目本身，当前项目已经抽离出来独立的[RspackMonoTemplate](https://github.com/WindrunnerMax/RspackMonoTemplate)，平时开发也会基于这个模版创建仓库。当前简历编辑器项目的结构`tree -L 2 -I node_modules --dirsfirst`如下:

```
CanvasEditor
│── packages
│   ├── core
│   ├── delta
│   ├── plugin
│   ├── react
│   └── utils
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.json
```

* `packages/core`: 编辑器核心引擎模块，对于 剪贴板操作、事件管理、状态管理、`History`模块、`Canvas`操作、选区操作 等等都封装在这里，相当于实现了基本的`Canvas`引擎能力。
* `packages/delta`: 数据结构模块，设计了基准数据结构，实现了`DeltaSet`数据结构以及原子化的`Op`操作，主要用于描述整个编辑器的数据结构以及操作，实现了`invert`等能力，对于实现`History`模块有很大的意义。
* `packages/plugin`: 插件模块，在`packages/delta`的基础上设计了插件化的能力，主要为了实现编辑器的功能模块化，例如`Text`、`Image`、`Rect`等插件都是在这里实现的。
* `packages/react`: `React`模块，主要是为了通过实现编辑器的视图层，在这里有比较重要的一点，我们的核心模块是视图框架无关的，如果有必要的话同样可以使用`Vue`、`Angular`等框架来实现视图层。
* `packages/utils`: 工具模块，主要是一些工具函数的封装，例如`FixedNumber`、`Palette`等等，这些工具函数在整个编辑器中都有使用，是作为基础包在整个`workspace`中引用的。
* `package.json`: 整个`workspace`的`package.json`，在这里配置了一些项目的信息，`EsLint`、`StyleLint`相关的配置也都在这里实现。
* `pnpm-lock.yaml`: `pnpm`的锁文件，用于锁定整个`workspace`的依赖版本。
* `pnpm-workspace.yaml`: `pnpm`的`workspace`配置文件，用于配置`monorepo`的能力。
* `tsconfig.json`: 整个`workspace`的`tsconfig`配置文件，用于配置整个`workspace`的`TypeScript`编译配置，在这里是作为基准配置以提供给项目中的模块引用。

`pnpm`自身是非常优秀的包管理器，通过硬链接和符号链接来节省磁盘空间，每个版本的包只需要存储一次，最重要的是`pnpm`创建了一个非扁平化的`node_modules`结构，从而确保依赖与声明严格匹配，严格控制了依赖提升，能够避免依赖升级的意外问题，这提高了项目的一致性和可预测性。

而说回到`monorepo`，`pnpm`不光是非常优秀的包管理器，其还提供了一个开箱即用的`monorepo`能力。在`pnpm`中存在一个`pnpm-workspace.yaml`文件，这个文件是用来配置`workspack`的，而`pnpm`的`workspace`就可以作为`monorepo`的能力，而我们的配置也非常简单，我们认为在`packages`目录下的所有目录都作为子项目。

```yml
packages:
  - 'packages/*'
```

通过`monorepo`我们可以很方便的管理所有子项目，特别是对于需要发`Npm`包的项目，将子模块拆分是个不错的选择，特别如果能够做到视图层框架无关的话就显得更加有意义。此外，`monorepo`对于整个项目的管理也有很多益处，例如在打包整个应用的时候，我们不需要对每个子项目发新的包之后才能打包，而是可以直接将编译过程放在`workspace`层面，这样就可以保证整个项目的一致性，简化了构建过程和持续集成流程，让所有项目可以共享构建脚本和工具配置。此外所有项目和模块共用同一个版本控制系统，便于进行统一的版本管理和变更跟踪，而且还有助于同步更新这些项目间的依赖关系。

## TS+Rspack最佳实践
说了这么多使用`pnpm + monorepo`管理项目带来的好处，我们再来聊聊我对`TS`与`Rspack`应用于`Monorepo`的最佳实践，不知道大家是不是遇到过这样的两个问题:

* 子项目的`TS`声明更改后不能实时生效，必须要编译一次子项目才可以，而子项目编译的过程中如果将`dist`等产物包删除，那么在`vsc`或者其他编辑器中就会报`TS`找不到引用声明的错误，这个时候就必须要用命令重新`Reload TypeScript Project`来去掉报错。而如果不将产物包删除的话，就会出现一些隐性的问题，例如原来某个文件命名为`a.tsx`，此时因为一些原因需要将其移动到同名的`a`目录并且重新命名为`index.tsx`，那么执行了这一顿操作之后，发现如果更改此时的`index.tsx`代码不会更新，必须要重启应用的`webpack`等编译器才行，因为其还是引用了原来的文件，产生类似的问题虽然不复杂但是排查起来还是需要时间的。
* 更改子项目的`TS`代码必须要重新编译子项目，因为项目是`monorepo`管理的，在`package.json`中会有`workspace`引用，而`workspace`实际上是在`node_modules`被引用的，所以虽然是子项目但是仍然需要遵循`node_modules`的规则才可以，那么其通常需要被编译为`js`才可以被执行，所以每次修改代码都必须要全量执行一遍很是麻烦，当然通常我们可以通过`-w`命令来观察变动，但是毕竟多了一道步骤，且如果是存在`alias`的项目可能仅仅使用`tsc`来编译还不够。此外在`monorepo`中我们通常会有很多子项目，如果每个子项目都需要这样的话，特别在这种编译时全量编译而不是增量编译的情况下，那么整个项目的编译时间就会变得非常长。

那么在这里我们先来看第一个问题，子项目的`TS`声明更改后不能实时生效，因为我们也提到了`monorepo`子项目实际上是通过`node_modules`来管理和引用的，所以其在默认情况下依然需要遵循`node_modules`的规则，即`packages.json`的`types`字段指向的`TS`声明文件，那么我们有没有什么办法可以修改这个行为呢，当然是有的，我们在整个项目的根`tsconfig.json`配置`path`就可以完美解决这个问题。当我们配置好如下的内容之后，通过按住`Ctrl`加鼠标左键点击的时候，就可以跳转到子项目的根目录声明了。此外这里有个要关注的点是，在项目中不建议配置`"baseUrl": "."`，在这里会有一些奇奇怪怪的路径引用问题，所以在简历编辑器项目中除了要打包`Npm`的`tsconfig.build.json`之外，都是直接使用相对路径配置的。

```js
{
  "compilerOptions": {
    "...": "...",
    "paths": {
      "sketching-core": ["./packages/core/src"],
      "sketching-delta": ["./packages/delta/src"],
      "sketching-plugin": ["./packages/plugin/src"],
      "sketching-utils": ["./packages/utils/src"],
    },
  },
  "include": [
    "packages/*/src"
  ]
}
```

那么解决了项目的`TS`声明问题之后，我们再来看编译的问题，这里的问题看起来会复杂一些，因为`TS`声明就单纯只是类型声明而已，不会影响到项目本身代码的编译，编译类型检查除外。那么在`Rspack`中应该配置才能让我们的代码直接指向子项目，而不是必须要走`node_modules`这套规则，实际上这里也很简单，只需要配置`resolve.alias`就可以了，这样当我们直接修改`TS`代码时，也能让编辑器立即响应增量编译。

```js
{
// ....
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "sketching-core": path.resolve(__dirname, "../core/src"),
      "sketching-delta": path.resolve(__dirname, "../delta/src"),
      "sketching-plugin": path.resolve(__dirname, "../plugin/src"),
      "sketching-utils": path.resolve(__dirname, "../utils/src"),
    },
  },
// ....
}
```

实际上对于`Rspack`而言其帮我们做了很多事，比如即使是`node_modules`的`TS`文件也会编译，而对于一些通过`CRA`创建的`webpack`项目来说，这个配置就麻烦一些，当然我们同样也可以借助`customize-cra`来完成这件事，此外我们还要关闭一些类似于`ModuleScopePlugin`的插件才可以，下面是富文本编辑器项目 [DocEditor](https://github.com/WindrunnerMax/DocEditor) 的配置。

```js
const src = path.resolve(__dirname, "src");
const index = path.resolve(__dirname, "src/index.tsx");
const core = path.resolve(__dirname, "../core/src");
const delta = path.resolve(__dirname, "../delta/src");
const plugin = path.resolve(__dirname, "../plugin/src");
const utils = path.resolve(__dirname, "../utils/src");

module.exports = {
  paths: function (paths) {
    paths.appSrc = src;
    paths.appIndexJs = index;
    return paths;
  },
  webpack: override(
    ...[
      // ...
      addWebpackResolve({
        alias: {
          "doc-editor-core": core,
          "doc-editor-delta": delta,
          "doc-editor-plugin": plugin,
          "doc-editor-utils": utils,
        },
      }),
      babelInclude([src, core, delta, plugin, utils]),
      // ...
      configWebpackPlugins(),
    ].filter(Boolean)
  ),
};
```

此外，简历编辑器是纯前端的项目，这样的项目有个很大的优势是可以直接使用静态资源就可以运行，而如果我们借助`GitHub Action`就可以通过`Git Pages`在仓库中直接部署，并且可以直接通过`GitHub Pages`访问，这样在仓库中就能呈现一个完整的`DEMO`。

```yml
// .github/workflows/deploy.yml
name: deploy gh-pages

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
          fetch-depth: 0
          persist-credentials: false
          
      - name: install node-v16
        uses: actions/setup-node@v3
        with:
          node-version: '16.16.0'

      - name: install dependencies
        run: |
          node -v
          npm install -g pnpm
          pnpm config set registry https://registry.npmjs.org/
          pnpm install --registry=https://registry.npmjs.org/

      - name: build project
        run: |
          npm run build:react

      - name: deploy project
        uses: JamesIves/github-pages-deploy-action@releases/v3
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH: gh-pages
          FOLDER: packages/react/build

```

## 总结
在这里我们聊了为什么要用`Monorepo`以及简单聊了一下`pnpm workspace`的优势，然后解决了在子项目开发中会遇到的`TS`编译、项目编译的两个实际问题，分别在`Monorepo`、`Rspack`、`Webpack`项目中相关的部分实践了一下，最后还简单聊了一下利用`GitHub Action`直接在`Git Pages`部署在线`DEMO`。那么再往后边的文章中，我们就需要聊一聊如何实现 层级渲染与事件管理 的能力设计。

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://github.com/WindRunnerMax/CanvasEditor>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas>
- <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D>
