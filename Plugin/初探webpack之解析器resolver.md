# 初探webpack之解析器resolver
`Webpack`是现代化的静态资源模块化管理和打包工具，其能够通过插件配置处理和打包多种文件格式，生成优化后的静态资源，核心原理是将各种资源文件视为模块，通过配置文件定义模块间的依赖关系和处理规则，从而实现模块化开发。`Webpack`提供了强大的插件和加载器系统，支持了代码分割、热加载和代码压缩等高效构建能力，显著提升了开发效率和性能。`Webpack Resolve`是`Webpack`中用于解析模块路径的配置项，其负责告诉`Webpack`如何查找和确定模块的位置，核心功能是通过配置来定义模块的查找机制和优先级，从而确保`Webpack`能够正确地找到和加载依赖模块。

初探webpack之解析器resolver less-loader+babel-import-plugin module-replace-plugin loader enhanced-resolve (rspack#3408 vite-alias-find) ~import 探寻引用包(产物分析+升级引入顺序) 懒加载App+引入新包

## 描述
在前段时间隔壁老哥需要将大概五年前的项目逐步开发重构新版本`2.0`，通常如果我们开发新版本的话可能会从零启动新项目，在新项目中重新复用组件模块，但是由于新项目时间紧任务重，并且由于项目模块众多且结构复杂，在初版规划中需要修改和新增的模块并非大多数，综合评估下来从零开发新版本的成本太高，所以最终敲定的方案是依然在旧版本上逐步过渡到新版本。

当然，如果只是在原项目上修改与新增模块也不能称为重构新版本，方案的细节是在原项目上逐步引入新的组件，而这些新的组件都是在新的`package`中实现的，并且以`StoryBook`的形式作为基本调试环境。这么做的原因首先是能够保证新组件的独立性，这样便可以逐步替换原有组件模块，还有一个原因是在这里新的组件还需要发布`SDK`包供外部接入，这样更便于我们复用这些组件。

那么这件事情本来是有条不紊地进行下去，在新组件开发的过程中也进行地非常顺利。然而在我们需要将新组件引入到原有项目中时，在这里便出现了问题，实际上回过来看这个问题并不是很复杂，但是在不熟悉`Webpack`以及`Less`的情况下，处理起来确实需要一些时间。恰逢周五，原本是快乐的周末，然而将这个问题成功解决便用了两天多一点的时间，在解决问题后也便有了这篇文章，当然解决的方案肯定不只是文章中提到的方法，也希望能为遇到类似问题的同学带来一些参考。

这个问题主要是出现在样式的处理上，五年前的项目对于一些配置确实已经不适合当前的组件模块，当发现问题之后，我们肯定是要排查问题，在历经检索异常抛出原因、排除法定位问题组件、不断生成并定位问题配置之后，最终决定在`Webpack`层面上处理这些问题。实际上如果完全是我们自己的代码还好，如果不适配的话我们可以直接修改，问题就出现在组件引用的第三方依赖上，这些依赖的内容我们是没有办法强行修改的，所以我们只能借助`Webpack`的能力去解决第三方依赖的问题。综合来看，在文章中主要解决了下面三个问题: 

* `less-loader`样式引用问题: 因为是最低五年前的项目，对于`Webpack`的管理还是使用的旧版本的`Umi`脚手架，且`less-loader`是`5.0.0`版本，而当前最新版本已经到了`12.2.0`，在这其中配置和处理方式已经发生了很大变化，所以这里需要解决`less-loader`的对于样式的处理问题。
* 组件样式覆盖问题: 经常用组件库的同学应该都知道，在公司内部统一样式规范之后，是不能够随意再引入原本的样式内容的，否则就会出现样式覆盖的问题，但是发布到`Npm`的包并不一定都遵守了这个规范，其还是有可能引用旧版本的样式文件，因此我们就需要避免由此造成的样式覆盖问题。
* 依赖动态引入问题: 实际上在我们解决上述的问题之后，关于样式部分的问题已经解决了，而在这里也引申出了新的问题，我们在本质上是处理了`Webpack`的模块引用问题，那么在其他场景下，例如我们需要在海外部署的服务引入专用的依赖，此时就需要解决动态引入依赖的问题。

## LessLoader


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
