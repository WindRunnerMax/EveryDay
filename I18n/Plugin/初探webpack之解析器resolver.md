# Exploring the resolver in webpack

`Webpack` is a modern static resource module management and bundling tool. It can handle and bundle various file formats through plugin configuration, generating optimized static resources. The core principle is to treat all resource files as modules and define their dependencies and processing rules through a configuration file, enabling modular development. `Webpack` provides a powerful plugin and loader system, supporting efficient building capabilities such as code splitting, hot reloading, and code minification, significantly improving development efficiency and performance. `Webpack Resolve` is a configuration option in `Webpack` used to resolve module paths. It is responsible for telling `Webpack` how to find and determine the location of modules. Its core functionality is to define the module lookup mechanism and priority through configuration, ensuring that `Webpack` can correctly find and load dependent modules.

## Description
Let's start by discussing the background of the story. Recently, our neighboring colleague needed to gradually refactor an old project from about five years ago into a new version, `2.0`. Typically, when developing a new version, we might start a new project from scratch and reuse component modules in the new project. However, due to time constraints and the complexity of the project's module structure, most of the modules in the initial plan needed modification or addition. After a comprehensive evaluation, starting from scratch for the new version would be too costly. Therefore, the final decision was to gradually transition from the old version to the new version while still working on the existing project.

Of course, if we only modify and add modules to the original project, it cannot be considered a complete refactoring of a new version. The detailed solution is to gradually introduce new components into the original project. These new components are implemented in a new `package` and serve as a basic debugging environment using `StoryBook`. The reason for this approach is to ensure the independence of the new components, allowing us to gradually replace the existing component modules. Additionally, these new components need to be published as an `SDK` package for external integration, making it easier for us to reuse these components.

This process could have proceeded smoothly. The development of new components went very well. However, when we needed to integrate the new components into the existing project, we encountered a problem. In retrospect, the problem was not very complex, but without familiarity with `Webpack` and `Less`, it did take some time to handle. It happened on a Friday, originally meant to be a happy weekend. However, solving this problem took a little over two days. After resolving the issue, I decided to write this article. Of course, the solution mentioned in the article is not the only one, and I hope it can provide some reference for students who encounter similar problems.

The problem mainly occurred in the handling of styles. The configuration of the project from five years ago was not suitable for the current component modules. After discovering the problem, we entered the classic phase of troubleshooting. After searching for the cause of the exception, eliminating possible problem components through the process of elimination, and continuously generating and locating problem configurations, we finally decided to address these issues at the `Webpack` level. If it were only our own code, it would be fine. We could directly modify it if it didn't fit. However, the problem lies in the third-party dependencies referenced by the components. We cannot forcefully modify the content of these dependencies. Therefore, we can only rely on the capabilities of `Webpack` to solve the problem with third-party dependencies. Overall, the article mainly addresses the following three issues:

* Problem with `less-loader` style imports: Since it is an old project from at least five years ago, the management of `Webpack` still uses an older version of the `Umi` scaffolding, and `less-loader` is at version `5.0.0`. However, the current latest version is `12.2.0`, and there have been significant changes in configuration and handling methods. Therefore, we need to address the handling of styles by `less-loader`.
* Component style override issue: Those who frequently use component libraries should know that after unifying the style specifications within the company, we cannot freely import the original style content. Otherwise, style override issues may occur. However, packages published on `Npm` may not necessarily adhere to this specification, and they may still reference old versions of style files. Therefore, we need to avoid style override issues caused by this.
* Dynamic dependency import issue: After solving the above problems, the style-related issues have been resolved. However, this has led to a new problem. Essentially, we have addressed the module import problem in `Webpack`. In other scenarios, such as when we need to import dedicated dependencies for overseas deployment or when encountering compilation issues caused by ghost dependencies, we need to solve the problem of dynamically importing dependencies.

For these three issues, I have implemented related demos using `Webpack`. The relevant code can be found at `https://github.com/WindrunnerMax/webpack-simple-environment/tree/master/packages/webpack-resolver`.

## LessLoader
Let's first look at the issue with `less-loader`. When we open the `README` document for `less-loader@5.0.0` on `Npm`, we can see in the "webpack resolver" section that if we need to import styles from `node_modules`, we need to prefix the import path with the `~` symbol. This allows `less-loader` to correctly import style files from `node_modules`, as otherwise, they would be treated as relative path imports.

```css
@import "~@arco-design/web-react/es/style/index.less";
```

In our project, there is no problem with its own dependencies. If it can compile successfully, then the `.less` file imports must already include the `~` symbol. However, the styles imported in our new components do not have the `~` symbol, which causes `less-loader` to fail in resolving the location of the style files, resulting in a module not found exception. If it were just the styles in our new components that didn't have the symbol, we could manually add it. However, after investigation, this part was caused by the newly introduced components, and they are dependencies of dependencies. This means we cannot directly modify the style imports to solve this problem.

So for this type of problem, the first thing we think of is definitely to upgrade the version of `less-loader`. However, unfortunately, even after upgrading to the latest version `12`, the project still cannot run. This problem is probably due to conflicts with some dependencies, which throw some strange exceptions. After searching for this error message for a while, we finally gave up on the plan to upgrade `less-loader`. After all, if we get too obsessed with it, we need to constantly try various dependency versions, which takes a lot of time to test, and may not necessarily solve the problem.

At this point, we need to change our thinking. Since the essence of the problem is still with `less-loader`, and `loader` essentially processes the original content of various resource files, can't we directly implement a `loader` to preprocess `.less` files before `less-loader`, and add the `~` symbol to the references of relevant styles, so that the correct `.less` files can be processed before `less-loader`. The idea here is to match and add the `~` symbol when parsing the `.js` file that references the `.less` file. Here is a simple representation of regular matching, but the actual situation to be considered will be more complex.

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

In theory, this method is correct, but in actual use, it was found that there are still error situations, but the file that reports the error has changed. After analysis, it was found that this was because the internal style reference in the `.less` file is processed by `less-loader`, and the `loader` we wrote only processes the entry `.less` file, and the deep `.less` file has not been preprocessed by us and will still throw a module not found exception. In fact, we also discovered the misunderstanding of using `less` before. If we randomly reference styles in the `.less` file, even if they are not used, they will be packaged repeatedly, because the independent `.less` entry will eventually generate a single `.css` and hand it over to subsequent `loader` processing.

```css
/* index.ts ok */
/* import "./index.less"; */

/* index.less ok */
@import "@arco-design/web-react-pro/es/style/index.less";

/* @arco-design/web-react-pro/es/style/index.less error */
@import "@arco-design/web-react/es/Button/style/index.less";
```

In this case of multiple-level style references, it seems that we can only focus on the ability of `less-loader` itself, but in fact, this situation is not easy to occur, and it may only occur in complex business component libraries or multi-level `UI` specifications. But since it has appeared in our project, it must be resolved. Fortunately, `less-loader` itself supports plug-ins. We can process this problem by implementing the `loader` of `less-loader`. However, because the documentation is not complete, we can only refer to the source code of other plug-ins to implement it.

Here we refer to `less-plugin-sass2less` to implement it. The plug-in of `less-loader` is actually an object, and in this object, we can define the `install` method, and the second parameter is the plug-in manager instance. We can add our preprocessor object by calling the `addPreProcessor` method here. The preprocessor object implements the `process` method, which can preprocess the `.less` file and add the `~` symbol to the relevant third-party library `@import` statement. Since this is processed in `less-loader`, the reference path must be a style file, and non-style content references do not need to be considered. At the same time, in order to increase versatility, we can also pass the component library name that needs to be processed when instantiating the object. Of course, because it is biased towards business data processing, versatility may not be very high.

```js
// packages/webpack-resolver/src/less/import-prefix.js
module.exports = class LessImportPrefixPlugin {
  constructor(prefixModules) {
    this.prefixModules = prefixModules || [];
    this.minVersion = [2, 7, 1];
  }
```

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

The plugin has been implemented, and we also need to configure it in `less-loader`. In fact, since the project was built using the `Umi` scaffolding, modifying the configuration requires using `webpack-chain`, which can be a bit cumbersome if you're not familiar with it. So here, we can directly configure the plugin in the `less-loader` in the `rules`.

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

With this, we have solved the issue of resolving style imports using `less-loader`. In fact, if we don't use `less-loader`, we can still continue the approach of using `webpack-loader` to solve the problem. When we encounter style import issues, we can implement a loader to avoid deep internal calls and manually re-import the styles in the project's root directory. This approach can also solve the problem, but it requires manual analysis of dependencies and imports, which incurs a certain time cost.

## WebpackLoader
After resolving the compatibility issue with `less-loader`, the project can now run successfully. However, during the debugging process, we encountered a new problem. Typically, we directly import `ArcoDesign` as a component library in our projects. Later on, a unified design specification was introduced based on `ArcoDesign`, which we will refer to as `web-react-pro`. This new specification includes a new set of style designs. This creates a new problem: if the order of imports in the project is incorrect, it can lead to style conflicts.

```js
// ok
import "@arco-design/web-react/es/style/index.less";
import "@arco-design/web-react-pro/es/style/index.less";

// error
import "@arco-design/web-react-pro/es/style/index.less";
import "@arco-design/web-react/es/style/index.less";
```

In reality, `web-react-pro` already imports the styles from `web-react` internally, so we don't need to import them explicitly. However, due to the reasons mentioned earlier, not all projects follow the new design specification, especially many third-party libraries with historical style imports. This leads to an uncontrollable order of imports, resulting in style conflicts. This is especially problematic when we configure selective imports in our projects, as some components follow the new design specification while others use the old styles. This can cause inconsistencies in the UI, making it appear messy when switching between different components or forms.

The initial idea here was to identify which third-party library was causing the issue. However, due to the complexity of project dependencies, conventional routing scans would still compile components that were not actually referenced. The process of using binary exclusion method took quite some time, but eventually, the issue was traced back to the form engine component. So, let's consider this: the current problem boils down to a matter of style loading order. If we proactively control the styles imported from `web-react`, could that solve the problem? Apart from controlling the order of imports, we can also use lazy loading to bring in relevant component libraries into the project. This way, existing components load first, and subsequently adding new components can prevent new styles from overriding existing ones.

However, this approach only temporarily solves the issue. If in the future there is a need to directly import `web-react` styles in new components—say, for extending functionalities based on the form engine or introducing a document preview component

So do we have any other ideas to solve similar problems? If our project is not using `babel`, but compiling `js` files through `ESBuild` or `SWC`, how should we handle it? According to our current idea, the essence is to redirect the reference of the target `.less` file to an empty style file. We can continue to use the idea of using `loader` to handle it. In fact, `babel-loader` only compiles the plain text content into `AST` to obtain structured data, which is convenient for us to use plugins to adjust the output results.

If we follow the idea of `babel-loader`, we still need to parse statements such as `import` when we handle the reference end, which is still a bit troublesome. However, if we change our thinking and directly handle the `.less` file, if the absolute path of this file is imported from `web-react`, then we can replace it with an empty style file. For the style import in the `.less` file, we can also use the `less-loader`'s `loader` to handle this problem.

Although the implementation of this `loader` is very simple, it can indeed help us solve the problem of style coverage. High-end ingredients often only need the simplest cooking method. Then we just need to configure the `loader` into `webpack`. Since we directly configure `webpack.config.js`, it is relatively easy to add rules. If it is `webpack-chain` and other methods, it is more efficient to create a new rule.

Here, our style import problem has been solved. To sum up, we actually solved the `Resolve` problem of `Webpack` through various methods. Therefore, at the beginning, it was mentioned that this is not a complex problem, but because we are not familiar with this part of the ability, we need to explore the problem and solutions. So is there a more general solution to the `Resolve` problem in `Webpack`? In fact, `Webpack` provides the `resolve.plugins` configuration item, and we can define the `Resolve` plugin through this configuration item, so that we can handle the module lookup and resolution in the `Resolve` stage of `Webpack`.

Let's first imagine a scenario. When our project needs an exclusive deployment service, for example, we need to introduce a proprietary dependency version overseas. This dependency mainly has no difference in the main `API` with the general version, mainly some compliant data reporting interfaces, etc. But the problem is that the package name of the proprietary version and the general version are different. If we hope to directly handle this problem during compilation instead of manually maintaining the version, a feasible solution is to `alias` the relevant dependencies as overseas package versions through scripts before compilation. If there are deep dependencies, they also need to lock the version through the package manager, so that the maintenance of multiple versions can be solved.

However, constantly modifying the configuration of `package.json` through scripts can be a bit of a hassle, and you still need to reinstall dependencies every time you make a change. This kind of operation is clearly not very user-friendly. So, let's consider a more elegant approach. We can pre-install version dependencies for `common` and `oversea` in `package.json`, and then dynamically modify the `alias` of related dependencies in the `resolve.alias` file of Webpack.

```js
module.exports = {
  resolve: {
    alias: {
      "package-common": process.env.OVERSEA ? "package-oversea" : "package-common",
    },
  },
}
```

Now, if we need more fine-grained control, for example, due to issues with ghost dependencies where we cannot alias all package versions to a uniform version, last year I encountered a conflict issue with `core.js` dependencies caused by `Yarn+Next.js`. The majority of dependencies were version `3`, but certain dependencies needed version `2` and were incorrectly resolved to version `3`. In such cases, controlling the resolution behavior

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

`NormalModuleReplacementPlugin` is implemented through `beforeResolve` of `NormalModuleFactory`, but it still has certain limitations

```javascript
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
};

// packages/webpack-resolver/webpack.config.js
module.exports = {
  //

```
https://webpack.js.org/api/loaders
https://webpack.js.org/configuration/resolve/#resolveplugins
https://github.com/webpack/enhanced-resolve?tab=readme-ov-file#plugins
https://github.com/less/less-docs/blob/master/content/tools/plugins.md
https://github.com/less/less-docs/blob/master/content/features/plugins.md
https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md
```

