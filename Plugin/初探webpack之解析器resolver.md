# 初探webpack之解析器resolver
`Webpack`是现代化的静态资源模块化管理和打包工具，其能够通过插件配置处理和打包多种文件格式，生成优化后的静态资源，核心原理是将各种资源文件视为模块，通过配置文件定义模块间的依赖关系和处理规则，从而实现模块化开发。`Webpack`提供了强大的插件和加载器系统，支持了代码分割、热加载和代码压缩等高效构建能力，显著提升了开发效率和性能。`Webpack Resolve`是`Webpack`中用于解析模块路径的配置项，其负责告诉`Webpack`如何查找和确定模块的位置，核心功能是通过配置来定义模块的查找机制和优先级，从而确保`Webpack`能够正确地找到和加载依赖模块。

初探webpack之解析器resolver less-loader+babel-import-plugin module-replace-plugin loader enhanced-resolve (rspack#3408 vite-alias-find) ~import 探寻引用包(产物分析+升级引入顺序) 懒加载App+引入新包

## 描述
先来聊聊故事的背景，在前段时间隔壁老哥需要将大概五年前的项目逐步开发重构新版本`2.0`，通常如果我们开发新版本的话可能会从零启动新项目，在新项目中重新复用组件模块，但是由于新项目时间紧任务重，并且由于项目模块众多且结构复杂，在初版规划中需要修改和新增的模块并非大多数，综合评估下来从零开发新版本的成本太高，所以最终敲定的方案是依然在旧版本上逐步过渡到新版本。

当然，如果只是在原项目上修改与新增模块也不能称为重构新版本，方案的细节是在原项目上逐步引入新的组件，而这些新的组件都是在新的`package`中实现的，并且以`StoryBook`的形式作为基本调试环境。这么做的原因首先是能够保证新组件的独立性，这样便可以逐步替换原有组件模块，还有一个原因是在这里新的组件还需要发布`SDK`包供外部接入，这样更便于我们复用这些组件。

那么这件事情本来是可以有条不紊地进行下去，在新组件开发的过程中也进行地非常顺利，然而在我们需要将新组件引入到原有项目中时，在这里便出现了问题，实际上回过来看这个问题并不是很复杂，但是在不熟悉`Webpack`以及`Less`的情况下，处理起来确实需要一些时间。恰逢周五，原本是快乐的周末，然而将这个问题成功解决便用了两天多一点的时间，在解决问题后也便有了这篇文章，当然解决的方案肯定不只是文章中提到的方法，也希望能为遇到类似问题的同学带来一些参考。

这个问题主要是出现在样式的处理上，五年前的项目对于一些配置确实已经不适合当前的组件模块。那么在发现问题之后，我们就要进入经典的排查问题阶段了，在历经检索异常抛出原因、排除法定位问题组件、不断生成并定位问题配置之后，最终决定在`Webpack`的层面上处理这些问题。实际上如果完全是我们自己的代码还好，如果不适配的话我们可以直接修改，问题就出现在组件引用的第三方依赖上，这些依赖的内容我们是没有办法强行修改的，所以我们只能借助`Webpack`的能力去解决第三方依赖的问题。综合来看，在文章中主要解决了下面三个问题: 

* `less-loader`样式引用问题: 因为是最低五年前的项目，对于`Webpack`的管理还是使用的旧版本的`Umi`脚手架，且`less-loader`是`5.0.0`版本，而当前最新版本已经到了`12.2.0`，在这其中配置和处理方式已经发生了很大变化，所以这里需要解决`less-loader`的对于样式的处理问题。
* 组件样式覆盖问题: 经常用组件库的同学应该都知道，在公司内部统一样式规范之后，是不能够随意再引入原本的样式内容的，否则就会出现样式覆盖的问题，但是发布到`Npm`的包并不一定都遵守了这个规范，其还是有可能引用旧版本的样式文件，因此我们就需要避免由此造成的样式覆盖问题。
* 依赖动态引入问题: 实际上在我们解决上述的问题之后，关于样式部分的问题已经解决了，而在这里也引申出了新的问题，我们在本质上是处理了`Webpack`的模块引用问题，那么在其他场景下，例如我们需要在海外部署的服务引入专用的依赖，此时就需要解决动态引入依赖的问题。

针对这三个问题分别使用`Webpack`实现了相关`DEMO`，实际上最开始是想使用`Rspack`实现的，但是写`DEMO`的时候发现`Rspack#3408`暂时还不支持`resolve.plugins`，相关的代码都在`https://github.com/WindrunnerMax/webpack-simple-environment/tree/master/packages/webpack-resolver`中。

## LessLoader
那么我们先来看看`less-loader`的问题，当我们打开`Npm`找到`less-loader@5.0.0`的`README`文档时，可以看到`webpack resolver`一节中明确了如果需要从`node_modules`中引用样式的话，是需要在引用路径前加入`~`符号的，这样才能让`less-loader`能够正确地从`node_modules`中引用样式文件，否则都会被认为是相对路径导入。

```css
@import "~@arco-design/web-react/es/style/index.less";
```

在我们的项目中，其本身的依赖是没有问题的，既然能够编译通过那么必然在`.less`文件的引入都是携带了`~`标识的，但是当前我们的新组件中引入的样式文件并没有携带`~`标识，这就导致了`less-loader`无法正确地解析样式文件的位置，从而抛出模块找不到的异常。如果仅仅是我们新组件中的样式没有携带标识的话，我们是可以手动加入的，然而经过排查这部分内容是新引入的组件导致的，而且还是依赖的依赖，这就导致我们无法直接修改样式引入来解决这个问题。

那么针对于这类问题，我们首先想到的肯定是升级`less-loader`的版本，但是很遗憾的是当升级到最新的`12`版本之后，项目同样跑不起来，这个问题大概是根某些依赖有冲突，抛出了一些很古怪的异常，在检索了一段时间这个错误信息之后，最终放弃了升级`less-loader`的方案，毕竟如果钻牛角尖的话我们需要不断尝试各种依赖版本，需要花费大量的时间测试，而且也不一定能够解决问题。

此时我们就需要换个思路，既然本质上还是`less-loader`的问题，而`loader`本质上是通过处理各种资源文件的原始内容来处理的，那么我们是不是可以在直接实现`loader`来在`less-loader`之前预处理`.less`文件，将相关样式的引用都加入`~`标识，这样就能够在`less-loader`之前将正确的`.less`文件处理好。那么在这里的思路就是在解析到引用`.less`文件的`.js`文件时，将其匹配并且加入`~`标识，这里只是简单表示下正则匹配，实际需要考虑的情况还会复杂一些。

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
/* index.js ok */
/* import "./index.less"; */

/* index.less ok */
@import "@arco-design/web-react-pro/es/style/index.less";

/* @arco-design/web-react-pro/es/style/index.less error */
@import "@arco-design/web-react/es/Button/style/index.less";
```

在这种存在多级样式引用的情况下，我们处理起来似乎就只能关注`less-loader`本身的能力了，不过实际上这种情况还是不容易出现的，一般只有在复杂业务组件库引用或者多级`UI`规范的情况下才可能出现。但是既然已经在我们的项目中出现了就必须要解决，幸运的是`less-loader`本身是支持插件化的，我们可以通过实现`less-loader`的`loader`来处理这个问题，只不过因为文档并不完善，所以我们只能参考其他插件的源码来实现。

在这里我们就参考`less-plugin-sass2less`来实现，`less-loader`的插件实际上是一个对象，而在这个对象中我们可以定义`install`方法，其中第二个参数就是插件的管理器实例，通过在这里调用`addPreProcessor`方法来加入我们的预处理器对象，预处理对象实现`process`方法即可，这样就可以实现我们的`less-loader`的`loader`。而对于`process`函数的思路就比较简单了，在这里我们可以将其按照`\n`切割，在处理字符串时判断是否是相关第三方库的`@import`语句，如果是的话就将其加入`~`标识，并且由于这是在`less-loader`中处理的，其引用路径必然是样式文件，不需要考虑非样式的内容引用。同时为了增加通用性，我们还可以将需要处理的组件库名称在实例化对象的时候传递进去，当然由于是偏向业务数据处理的，通用性可以没必要很高。

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

插件已经实现了，我们同样需要在`less-loader`中将其配置进去，实际上由于项目时`Umi`脚手架搭建起来的，修改配置就必须要借助`webpack-chain`，不熟悉的话还是有些麻烦，所以我们这里直接在`rules`的`less-loader`中将插件配置好即可。

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

至此我们使用`less-loader`的`loader`解决了样式引用的解析问题，实际上如果我们不借助`less-loader`的话依然可以继续延续`webpack-loader`的思路来解决问题，当我们发现样式引用的问题时，我们可以实现`loader`避免其内部深层次的调用，再将其交予项目的根目录中将样式引用出来，这样同样可以解决问题，但是需要我们手动分析依赖并且引入，需要一定的时间成本。

## WebpackLoader


## WebpackResolver


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
