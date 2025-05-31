# 初探webpack之解析器resolver
`Webpack`是现代化的静态资源模块化管理和打包工具，其能够通过插件配置处理和打包多种文件格式，生成优化后的静态资源，核心原理是将各种资源文件视为模块，通过配置文件定义模块间的依赖关系和处理规则，从而实现模块化开发。`Webpack`提供了强大的插件和加载器系统，支持了代码分割、热加载和代码压缩等高效构建能力，显著提升了开发效率和性能。`Webpack Resolve`是`Webpack`中用于解析模块路径的配置项，其负责告诉`Webpack`如何查找和确定模块的位置，核心功能是通过配置来定义模块的查找机制和优先级，从而确保`Webpack`能够正确地找到和加载依赖模块。

## 描述
先来聊聊故事的背景，在前段时间隔壁老哥需要将大概五年前的项目逐步开发重构新版本`2.0`，通常如果我们开发新版本的话可能会从零启动新项目，在新项目中重新复用组件模块。但是由于新项目时间紧任务重，并且由于项目模块众多且结构复杂，在初版规划中需要修改和新增的模块并非大多数，综合评估下来从零开发新版本的成本太高，所以最终敲定的方案是依然在旧版本上逐步过渡到新版本。

当然，如果只是在原项目上修改与新增模块也不能称为重构新版本，方案的细节是在原项目上逐步引入新的组件，而这些新的组件都是在新的`package`中实现的，并且以`StoryBook`的形式作为基本调试环境。这么做的原因首先是能够保证新组件的独立性，这样便可以逐步替换原有组件模块，还有一个原因是在这里新的组件还需要发布`SDK`包供外部接入，这样更便于我们复用这些组件。

那么这件事情本来是可以有条不紊地进行下去，在新组件开发的过程中也进行地非常顺利，然而在我们需要将新组件引入到原有项目中时，在这里便出现了问题，实际上回过来看这个问题并不是很复杂，但是在不熟悉`Webpack`以及`Less`的情况下，处理起来确实需要一些时间。恰逢周五，原本是快乐的周末，然而将这个问题成功解决便用了两天多一点的时间，在解决问题后也便有了这篇文章。当然解决的方案肯定不只是文章中提到的方法，也希望能为遇到类似问题的同学带来一些参考。

这个问题主要是出现在样式的处理上，五年前的项目对于一些配置确实已经不适合当前的组件模块。那么在发现问题之后，我们就要进入经典的排查问题阶段了，在历经检索异常抛出原因、排除法定位问题组件、不断生成并定位问题配置之后，最终决定在`Webpack`的层面上处理这些问题。实际上如果完全是我们自己的代码还好，如果不适配的话我们可以直接修改，问题就出现在组件引用的第三方依赖上，这些依赖的内容我们是没有办法强行修改的，所以我们只能借助`Webpack`的能力去解决第三方依赖的问题。综合来看，在文章中主要解决了下面三个问题: 

* `less-loader`样式引用问题: 因为是最低五年前的项目，对于`Webpack`的管理还是使用的旧版本的`Umi`脚手架，且`less-loader`是`5.0.0`版本。而当前最新版本已经到了`12.2.0`，在这其中配置和处理方式已经发生了很大变化，所以这里需要解决`less-loader`的对于样式的处理问题。
* 组件样式覆盖问题: 经常用组件库的同学应该都知道，在公司内部统一样式规范之后，是不能够随意再引入原本的样式内容的，否则就会出现样式覆盖的问题。但是发布到`Npm`的包并不一定都遵守了这个规范，其还是有可能引用旧版本的样式文件，因此我们就需要避免由此造成的样式覆盖问题。
* 依赖动态引入问题: 实际上在我们解决上述的问题之后，关于样式部分的问题已经结束了，而在这里也引申出了新的问题，我们在本质上是处理了`Webpack`的模块引用问题。那么在其他场景下，例如我们需要在海外部署的服务引入专用的依赖，或者幽灵依赖造成的编译问题，此时就需要解决动态引入依赖的问题。

针对这三个问题分别使用`Webpack`实现了相关`DEMO`，相关的代码都在`https://github.com/WindrunnerMax/webpack-simple-environment/tree/master/packages/webpack-resolver`中。

## LessLoader
那么我们先来看看`less-loader`的问题，当我们打开`Npm`找到`less-loader@5.0.0`的`README`文档时，可以看到`webpack resolver`一节中明确了如果需要从`node_modules`中引用样式的话，是需要在引用路径前加入`~`符号的。这样才能让`less-loader`能够正确地从`node_modules`中引用样式文件，否则都会被认为是相对路径导入。

```css
@import "~@arco-design/web-react/es/style/index.less";
```

在我们的项目中，其本身的依赖是没有问题的，既然能够编译通过那么必然在`.less`文件的引入都是携带了`~`标识的。但是当前我们的新组件中引入的样式文件并没有携带`~`标识，这就导致了`less-loader`无法正确地解析样式文件的位置，从而抛出模块找不到的异常。如果仅仅是我们新组件中的样式没有携带标识的话，我们是可以手动加入的，然而经过排查这部分内容是新引入的组件导致的，而且还是依赖的依赖，这就导致我们无法直接修改样式引入来解决这个问题。

那么针对于这类问题，我们首先想到的肯定是升级`less-loader`的版本。但是很遗憾的是当升级到最新的`12`版本之后，项目同样跑不起来，这个问题大概是根某些依赖有冲突，抛出了一些很古怪的异常，在检索了一段时间这个错误信息之后，最终放弃了升级`less-loader`的方案。毕竟如果钻牛角尖的话我们需要不断尝试各种依赖版本，需要花费大量的时间测试，而且也不一定能够解决问题。

此时我们就需要换个思路，既然本质上还是`less-loader`的问题，而`loader`本质上是通过处理各种资源文件的原始内容来处理的。那么我们是不是可以在直接实现`loader`来在`less-loader`之前预处理`.less`文件，将相关样式的引用都加入`~`标识，这样就能够在`less-loader`之前将正确的`.less`文件处理好。那么在这里的思路就是在解析到引用`.less`文件的`.js`文件时，将其匹配并且加入`~`标识，这里只是简单表示下正则匹配，实际需要考虑的情况还会复杂一些。

```js
/**
 * @typedef {Record<string, unknown>} OptionsType
 * @this {import("webpack").LoaderContext<OptionsType>}
 * @param {string} source
 * @returns {string}
 */
module.exports = function (source) {
  const regexp = /@import\s+"@arco-design\/web-react\/(.*)\/index\.less";/g;
  const next = source.replace(regexp, '@import "~@arco-design/web-react/$1/index.less";');
  return next;
};
```

理论上这个方式是没有问题的，但是在实际使用的过程中发现依然存在报错的情况，只不过报错的文件发生了改变。经过分析之后发现这是因为在`.less`文件中内部的样式引用是由`less-loader`处理的，而我们编写的`loader`只是针对于入口的`.less`文件做了处理，深层次的`.less`文件并没有经过我们的预处理，依然会抛出找不到模块的异常。实际上在这里也发现了之前使用`less`的误区，如果我们在`.less`文件中随意引用样式的话，即使没有被使用，也会被重复打包出来的，因为独立的`.less`入口最终是会生成单个`.css`再交予后续的`loader`处理。

```css
/* index.ts ok */
/* import "./index.less"; */

/* index.less ok */
@import "@arco-design/web-react-pro/es/style/index.less";

/* @arco-design/web-react-pro/es/style/index.less error */
@import "@arco-design/web-react/es/Button/style/index.less";
```

在这种存在多级样式引用的情况下，我们处理起来似乎就只能关注`less-loader`本身的能力了，不过实际上这种情况还是不容易出现的，一般只有在复杂业务组件库引用或者多级`UI`规范的情况下才可能出现。但是既然已经在我们的项目中出现了就必须要解决，幸运的是`less-loader`本身是支持插件化的，我们可以通过实现`less-loader`的`loader`来处理这个问题，只不过因为文档并不完善，所以我们只能参考其他插件的源码来实现。

在这里我们就参考`less-plugin-sass2less`来实现，`less-loader`的插件实际上是一个对象，而在这个对象中我们可以定义`install`方法。其中第二个参数就是插件的管理器实例，通过在这里调用`addPreProcessor`方法来加入我们的预处理器对象，预处理对象实现`process`方法即可，这样就可以实现我们的`less-loader`的`loader`。

而对于`process`函数的思路就比较简单了，在这里我们可以将其按照`\n`切割，在处理字符串时判断是否是相关第三方库的`@import`语句。如果是的话就将其加入`~`标识，并且由于这是在`less-loader`中处理的，其引用路径必然是样式文件，不需要考虑非样式的内容引用。同时为了增加通用性，我们还可以将需要处理的组件库名称在实例化对象的时候传递进去，当然由于是偏向业务数据处理的，通用性可以没必要很高。

```js
// packages/webpack-resolver/src/less/import-prefix.js
module.exports = class LessImportPrefixPlugin {
  constructor(prefixModules) {
    this.prefixModules = prefixModules || [];
    this.minVersion = [2, 7, 1];
  }

  /**
   * @param {string} source
   * @param {object} extra
   * @returns {string}
   */
  process(source) {
    const lines = source.split("\n");
    const next = lines.map(line => {
      const text = line.trim();
      if (!text.startsWith("@import")) return line;
      const result = /@import ['"](.+)['"];?/.exec(text);
      if (!result || !result[1]) return line;
      const uri = result[1];
      for (const it of this.prefixModules) {
        if (uri.startsWith(it)) return `@import "~${uri}";`;
      }
      return line;
    });
    return next.join("\n");
  }

  install(less, pluginManager) {
    pluginManager.addPreProcessor({ process: this.process.bind(this) }, 3000);
  }
};
```

插件已经实现了，我们同样需要在`less-loader`中将其配置进去。实际上由于项目时`Umi`脚手架搭建起来的，修改配置就必须要借助`webpack-chain`，不熟悉的话还是有些麻烦，所以我们这里直接在`rules`的`less-loader`中将插件配置好即可。

```js
// packages/webpack-resolver/webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "less-loader",
            options: {
              plugins: [new LessImportPrefix(["@arco-design/web-react"])],
            },
          },
        ],
      },
      // ...
    ],
  },
  // ...
};
```

至此我们使用`less-loader`的`loader`解决了样式引用的解析问题，实际上如果我们不借助`less-loader`的话，依然可以继续延续`webpack-loader`的思路来解决问题。当我们发现样式引用的问题时，我们可以实现`loader`避免其内部深层次的调用，再将其交予项目的根目录中将样式重新引用出来，这样同样可以解决问题。但是需要我们手动分析依赖并且引入，需要一定的时间成本。

## WebpackLoader
当解决了`less-loader`的适配问题之后，项目已然能够成功运行起来了，但是在调试的过程中又发现了新的问题。通常我们的项目通常都是直接引入`ArcoDesign`作为组件库使用的，而内部后期推出了统一的设计规范，这个新的规范是在`ArcoDesign`的基础上对组件进行了调整，我们就姑且将其命名为`web-react-pro`，并且引入了一套新的样式设计。那么这就造成了新的问题，如果在项目中引用的顺序不正确，就会导致样式的覆盖问题。

```js
// ok
import "@arco-design/web-react/es/style/index.less";
import "@arco-design/web-react-pro/es/style/index.less";

// error
import "@arco-design/web-react-pro/es/style/index.less";
import "@arco-design/web-react/es/style/index.less";
```

实际上`web-react-pro`内部已经帮我们实际引用了`web-react`的样式，原本是不需要我们主动引入的，然而由于先前提到的并不是所有的项目都遵循了新的设计规范，特别是很多历史三方库的样式引用，这就导致了我们整个引入的顺序是不可控的，这就导致了样式覆盖问题。特别是由于我们的项目通常会配置按需引用，这就会导致部分组件设计规范是新的，部分组件的样式是旧的，在主体页面还是新的样式，打开表单之后就发现组件风格明显发生了变化，整体`UI`会显得比较混乱。

在这里最开始的思路是想查找出究竟是哪个三方库导致的这个问题，然而由于项目引用关系太复杂，约定式路由的扫描还会导致实际未引用的组件依然被编译，二分排除法查找的过程耗费了不少时间，当然最终还是定位到了问题表单引擎组件。那么继续设想一下，现在的问题无非就是样式加载顺序的问题，如果我们主动控制引用到`web-react`的样式是不是就能解决这个问题，除了控制`import`的顺序之外，我们还可以通过`lazy-load`的形式将相关组件库引用到项目中，也就是使原有组件先加载，之后再加载新增的组件就可以避免新样式覆盖。

```js
import App from "...";
import React, { Suspense, lazy } from "react";

const Next = lazy(() => import("./component/next"));
export const LazyNextMain = (
  <Suspense fallback={<React.Fragment></React.Fragment>}>
    <Next />
  </Suspense>
);
```

然而很明显这样只是能够暂时解决问题，如果后续需要直接在新增的组件中引入`web-react`的样式，例如需要继续基于表单引擎扩展功能，或者引入文档预览组件，都会需要间接地引入`web-react`的样式，如果依旧按照这个模式来处理的话就需要不断`lazy`组件。那么转换下思路，我们是不是可以直接在`Webpack`的层面上直接处理这些问题，如果我们能够直接将`web-react`的样式`resolve`到空的文件中，那么就可以解决这个问题了。

实际上由于这个问题普遍存在，内部是存在`Webpack`的插件来处理这个问题的，但是在我们的项目中引用会对`mini-css-extract-plugin`产生影响，造成一个很奇怪的异常抛出，同样也是经过了一段时间的排查无果之后放弃了这个方案。说到处理引用我们可能首先想到的就是`babel-import-plugin`这个插件，那么我们同样可以实现`babel`的插件来处理这个问题，而且由于场景简单，不需要太复杂的处理逻辑。

```js
// packages/webpack-resolver/src/loader/babel-import.js
/**
 * @param {import("@babel/core") babel}
 * @returns {import("@babel/core").PluginObj<{}>}
 */
module.exports = function (babel) {
  const { types: t } = babel;
  return {
    visitor: {
      ImportDeclaration(path) {
        const { node } = path;
        if (!node) return;
        if (node.source.value === "@arco-design/web-react/dist/css/index.less") {
          node.source = t.stringLiteral(require.resolve("./index.less"));
        }
      },
      CallExpression(path) {
        if (
          path.node.callee.name === "require" &&
          path.node.arguments.length === 1 &&
          t.isStringLiteral(path.node.arguments[0]) &&
          path.node.arguments[0].value === "@arco-design/web-react/dist/css/index.less"
        ) {
          path.node.arguments[0] = t.stringLiteral(require.resolve("./index.less"));
        }
      },
    },
  };
};
```

在这里我们只需要处理`import`语句对应的`ImportDeclaration`以及`require`语句的`CallExpression`即可，当我们匹配到相关的插件时将其替换到目标的空样式文件中即可。这样就相当于抹除了所有的`web-react`的样式引用，以此来解决样式覆盖问题，而将这个插件加入`babel`也只需要在`.babelrc`文件中配置下`plugin`引用即可。

```js
// packages/webpack-resolver/.babelrc
{
  "plugins": ["./src/loader/babel-import.js"]
}
```

那么我们还有没有别的思路能够解决类似的问题，假如此时我们的项目不是使用`babel`，而是通过`ESBuild`或者`SWC`来编译的`js`文件，那么又该如何处理。按照我们现在的思路，究其本质是将目标的`.less`文件引用重定向到空的样式文件中，那么我们完全可以延续使用`loader`来处理的思路，实际上`babel-loader`也只是帮我们把纯文本的内容编译为`AST`得到结构化的数据方便我们使用插件调整输出的结果。

那么如果依照类似于`babel-loader`的思路，我们处理引用端的话还是需要解析`import`等语句，还是会比较麻烦。而如果换个思路直接处理`.less`文件，如果这个文件的绝对路径是从`web-react`中引入的，那么我们就可以将其替换成空的样式文件即可。针对于`.less`文件中的样式引入，我们同样可以采取`less-loader`的`loader`去处理这个问题。

```js
// packages/webpack-resolver/src/loader/import-loader.js
/**
 * @typedef {Record<string, unknown>} OptionsType
 * @this {import("webpack").LoaderContext<OptionsType>}
 * @param {string} source
 * @returns {string}
 */
module.exports = function (source) {
  const regexp = /@arco-design\/web-react\/.+\.less/;
  if (regexp.exec(this.resourcePath)) {
    return "@empty: 1px;";
  }
  return source;
};
```

别看这段`loader`的实现很简单，但是确实能够帮助我们解决样式覆盖的问题，高端的食材往往只需要最简单的烹饪方式。那么紧接着我们只需要将`loader`配置到`webpack`当中即可，由于我们是直接配置的`webpack.config.js`，可以比较方便地加入规则，如果是`webpack-chain`等方式还是新建一个规则效率比较高。

```js
// packages/webpack-resolver/webpack.config.js
/**
 * @typedef {import("webpack").Configuration} WebpackConfig
 * @typedef {import("webpack-dev-server").Configuration} WebpackDevServerConfig
 * @type {WebpackConfig & {devServer?: WebpackDevServerConfig}}
 */
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "less-loader",
          require.resolve("./src/loader/import-loader"),
        ],
      },
      // ...
    ],
  },
  // ...
};
```

## WebpackResolver
在这里我们的样式引入问题已经解决了，总结起来我们实际上就是通过各种方式处理了`Webpack`的`Resolve`问题，所以最开始的就提到了这并不是个复杂的问题，只是因为我们并不熟悉这部分能力导致需要探索问题所在以及解决方案。那么在`Webpack`中针对于`Resolve`的问题是不是有什么更通用的解决方案，实际上在`Webpack`中提供了`resolve.plugins`这个配置项，我们可以通过这个配置项来定义`Resolve`的插件，这样就可以在`Webpack`的`Resolve`阶段处理模块的查找和解析。

我们首先来设想一个场景，当我们的项目需要专属的部署服务，例如我们需要在海外引入专有的依赖版本，这个依赖主要`API`与通用版本并无差别，主要是一些合规的数据上报接口等等。但是问题来了，专有版本和通用版本的包名是不一样的，如果是我们希望在编译时直接处理这个问题而不是需要人工维护版本的话，可行的一个解决方案是在编译之前通过脚本将相关依赖`alias`为海外的包版本。如果还有深层依赖的话同样需要通过包管理器锁定版本，这样就可以解决多版本的维护问题。

```js
// package.json
{
  "dependencies": {
    // common
    "package-common": "1.0.0",
    // oversea
    "package-common": "npm:package-oversea@1.0.0",
  }
}
```

然而通过脚本不断修改`package.json`的配置还是有些麻烦，并且每次修改过后还是需要重新安装依赖，这样的操作显然不够友好。那么我们可以考虑下更优雅的一些方式，我们可以在`package.json`中预先安装好`common`和`oversea`的版本依赖，然后在`Webpack`的`resolve.alias`文件中动态修改相关依赖的`alias`。

```js
module.exports = {
  resolve: {
    alias: {
      "package-common": process.env.OVERSEA ? "package-oversea" : "package-common",
    },
  },
}
```

那么如果我们需要更细粒度的控制，例如由于幽灵依赖的问题我们不能将所有的包版本都`alias`为统一版本。去年我就遇到了`Yarn+Next.js`导致的`core.js`依赖冲突问题，绝大部分以来都是`3`版本，而某些依赖就是需要`2`版本却被错误地`resolve`到`3`版本了，这种情况下就需要控制某些模块的`resolve`行为来解决这类问题。

熟悉`vite`的同学都知道，基于`@rollup/plugin-alias`插件在`vite`中的`alias`还提供了更高级的配置，其可以支持我们动态处理`alias`行为。除了`find/replace`这种基于正则的解析方式之外，还支持传递`ResolveFunction/ResolveObject`的形式用来处理`Rollup`解析时的`Hook`行为。

```js
// rollup/dist/rollup.d.ts
export type ResolveIdResult = string | NullValue | false | PartialResolvedId;
export type ResolveIdHook = (
	this: PluginContext,
	source: string,
	importer: string | undefined,
	options: { attributes: Record<string, string>; custom?: CustomPluginOptions; isEntry: boolean }
) => ResolveIdResult;

// vite/dist/node/index.d.ts
interface ResolverObject {
  buildStart?: PluginHooks['buildStart']
  resolveId: ResolverFunction
}
interface Alias {
  find: string | RegExp
  replacement: string
  customResolver?: ResolverFunction | ResolverObject | null
}
type AliasOptions = readonly Alias[] | { [find: string]: string }
```

实际上`Webpack`中还内置了`NormalModuleReplacementPlugin`插件来更加灵活地处理模块引用的替换问题，在使用的时候直接调用`new webpack.NormalModuleReplacementPlugin(resourceRegExp, newResource)`即可。需要注意的是`newResource`是支持函数形式的，如果需要修改其行为则直接原地修改`context`参数对象即可，而且`context`参数中携带了大量的信息，我们完全可以借助其携带的信息判断解析来源。

```js
// webpack/types.d.ts
// https://github.com/webpack/webpack/blob/main/lib/NormalModuleReplacementPlugin.js
declare interface ModuleFactoryCreateDataContextInfo {
	issuer: string;
	issuerLayer?: null | string;
	compiler: string;
}
declare interface ResolveData {
	contextInfo: ModuleFactoryCreateDataContextInfo;
	resolveOptions?: ResolveOptions;
	context: string;
	request: string;
	assertions?: Record<string, any>;
	dependencies: ModuleDependency[];
	dependencyType: string;
	createData: Partial<NormalModuleCreateData & { settings: ModuleSettings }>;
	fileDependencies: LazySet<string>;
	missingDependencies: LazySet<string>;
	contextDependencies: LazySet<string>;
	/**
	 * allow to use the unsafe cache
	 */
	cacheable: boolean;
}
declare class NormalModuleReplacementPlugin {
	constructor(resourceRegExp: RegExp, newResource: string | ((arg0: ResolveData) => void));
}
```

`NormalModuleReplacementPlugin`是通过`NormalModuleFactory`的`beforeResolve`来实现的，然而这里还是具有一定的局限性，其只能处理我们应用本身的依赖解析。而例如我们的第一个问题中，`less-loader@5.0`是主动调度`LoaderContext.resolve`方法来执行文件解析的，也就是说这是`loader`借助`webpack`的能力来实现本身的文件解析需要，而`NormalModuleReplacementPlugin`是无法处理这种情况的。

```js
// less-loader@5.0.0/dist/createWebpackLessPlugin.js
const resolve = pify(loaderContext.resolve.bind(loaderContext));
loadFile(filename, currentDirectory, options) {
  // ...
  const moduleRequest = loaderUtils.urlToRequest(url, url.charAt(0) === '/' ? '' : null);
  const context = currentDirectory.replace(trailingSlash, '');
  let resolvedFilename;
  return resolve(context, moduleRequest).then(f => {
    resolvedFilename = f;
    loaderContext.addDependency(resolvedFilename);
    if (isLessCompatible.test(resolvedFilename)) {
      return readFile(resolvedFilename).then(contents => contents.toString('utf8'));
    }
    return loadModule([stringifyLoader, resolvedFilename].join('!')).then(JSON.parse);
    
    // ...
  })
  // ...
}
```

那么这时候就需要用到我们的`resolve.plugins`了，我们可以将`resolve`完全作为一个独立的模块来看待。当然其本身也是基于`enhanced-resolve`来实现的，而我们在这里实现的插件相当于对解析行为实现了`Hook`，因此即使类似于`less-loader`这种独立调度的插件也能正常调度。而且此配置在`webpack2`中就已经实现了，已经是非常通用的能力。那么我们可以基于这个能力在`before-hook`的钩子来解决我们之前提到第二个问题，即样式覆盖的问题。

```js
// packages/webpack-resolver/src/resolver/import-resolver.js
module.exports = class ImportResolver {
  constructor() {}

  /**
   * @typedef {Required<import("webpack").Configuration>["resolve"]} ResolveOptionsWebpackOptions
   * @typedef {Exclude<Required<ResolveOptionsWebpackOptions>["plugins"]["0"], "...">} ResolvePluginInstance
   * @typedef {Parameters<ResolvePluginInstance["apply"]>["0"]} Resolver
   * @param {Resolver} resolver
   */
  apply(resolver) {
    const target = resolver.ensureHook("resolve");

    resolver
      .getHook("before-resolve")
      .tapAsync("ImportResolverPlugin", (request, resolveContext, callback) => {
        const regexp = /@arco-design\/web-react\/.+\.less/;
        const prev = request.request;
        const next = require.resolve("./index.less");
        if (regexp.test(prev)) {
          const newRequest = { ...request, request: next };
          return resolver.doResolve(
            target,
            newRequest,
            `Resolved ${prev} to ${next}`,
            resolveContext,
            callback
          );
        }
        return callback();
      });
  }
};

// packages/webpack-resolver/webpack.config.js
module.exports = {
  // ...
  resolve: {
    plugins: [new ImportResolver()],
  },
  // ...
}
```

因为其对`less-loader`同样也会生效，我们同样也可以匹配解析内容，将其处理为正确的引用地址，这样就不用实现`less-loader`的`loader`来处理这个问题了，也就是说我们可以通过一个插件来同时解决两个问题。并且前边提到的差异化解析问题也可以通过`request`与`resolveContext`参数来确定来源，由此来处理特定条件下的引用或者幽灵依赖带来的编译问题等等。

```js
// index.less => @import "@arco-design/web-react/es/style/index.less"
 {
  context: {},
  path: '/xxx/webpack-simple-environment/packages/webpack-resolver/src/less',
  request: './@arco-design/web-react/es/style/index.less'
}

// index.ts => import "./index.less"
{
  context: {
    issuer: '/xxx/webpack-simple-environment/packages/webpack-resolver/src/less/index.ts',
    issuerLayer: null,
    compiler: undefined
  },
  path: '/xxx/webpack-simple-environment/packages/webpack-resolver/src/less',
  request: './index.less'
}
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://webpack.js.org/api/loaders
https://webpack.js.org/configuration/resolve/#resolveplugins
https://github.com/webpack/enhanced-resolve?tab=readme-ov-file#plugins
https://github.com/less/less-docs/blob/master/content/tools/plugins.md
https://github.com/less/less-docs/blob/master/content/features/plugins.md
https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md
```
