# Rspack Project Practice in Canvas Editor

Previously, we discussed various aspects of code design concerning `Canvas`. Now, let’s delve into project practices. As I mentioned in earlier articles, I approached this with a learning mindset and a curiosity for technology. Consequently, aside from some utility libraries like `ArcoDesign`, `ResizeObserve`, and `Jest`, the data structure in `packages/delta`, the plugin system in `packages/plugin`, and the core engine in `packages/core` were all implemented manually. Therefore, in addition to learning about `Canvas`, I actually engaged in some project engineering practices.

* Online Editor: <https://windrunnermax.github.io/CanvasEditor>
* Open Source Repository: <https://github.com/WindrunnerMax/CanvasEditor>

Related articles about the `Canvas` resume editor project:

* [Juejin Keeps Recommending Canvas, So I Learned Canvas and Made a Resume Editor](https://juejin.cn/post/7329799331216015395)
* [Canvas Graphic Editor - Data Structures and History (undo/redo)](https://juejin.cn/post/7331575219957366836)
* [Canvas Graphic Editor - What Data is Actually in My Clipboard](https://juejin.cn/post/7331992322233024548)
* [Canvas Resume Editor - Graphic Drawing and State Management (Lightweight DOM)](https://juejin.cn/spost/7354986873733333055)
* [Canvas Resume Editor - Monorepo and Rspack Project Practice](https://juejin.cn/spost/7357349281885503500)
* [Canvas Resume Editor - Hierarchical Rendering and Event Management Design](https://juejin.cn/spost/7376197082203684873)

## Pnpm+Monorepo
Let’s start by discussing why we should use `monorepo`. To illustrate, I’ll reference a pitfall I encountered before. In my previous rich-text editor project, [DocEditor](https://github.com/WindrunnerMax/DocEditor), everything was written in a single independent `src` directory. There were no issues during the project’s operation, but I wanted to extract the editor as an `NPM` package. The bundling process using `Rollup` was fine, but the problems arose during the referencing. When I tried to incorporate the document editor's `NPM` package into the resume editor, I discovered that a module had been incorrectly `TreeShaken`. You can still see this compatibility issue in the editor.

```js
module: {
  rules: [
    {
      // There's a slight issue with `TreeShaking` for `doc-editor-light`
      test: /doc-editor-light\/dist\/tslib.*\.js/,
      sideEffects: true,
    },
  ]
}
```

This issue meant that while I had no problems in `dev` mode, after building, this part of the code was mistakenly removed, causing issues with the editor's `wrapper` node, preventing items like lists from being added correctly. This doesn’t imply that independent package projects are problematic, but rather that management can be more complex than it appears, particularly regarding entry points when packaging as an `NPM` package. Now, my rich-text editor package has evolved into `4` independent packages with distinct roles, eliminating this issue.

Speaking of packaging, I encountered another pitfall. Have you ever experienced the classic `Invalid hook call` error in `React`? When I broke it down into independent packages, I received this error. However, I had marked `"react": ">=16"` in `peerDependencies` of `package.json`, which should ensure it directly uses the `React` version installed with the package, avoiding version inconsistency. Rules of Hooks were also not the issue because everything was working fine before the package split. Eventually, I discovered that I had not resolved `peerDependencies` in `rollup`, which caused `jsx-runtime` to be bundled. Even though both `React` versions were `17.0.2`, this led to the execution of two independent lexical scopes of `React Hooks`, resulting in the error.

```
Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
```

1. You might have mismatched versions of React and the renderer (like React DOM).
2. You may be violating the Rules of Hooks.
3. You might have multiple copies of React in the same app. Refer to tips on how to debug and resolve this issue.

```
Now back to the project itself, the current project has been extracted into an independent [RspackMonoTemplate](https://github.com/WindrunnerMax/RspackMonoTemplate), and we generally create repositories based on this template for development. The current structure of the resume editor project is as follows: `tree -L 2 -I node_modules --dirsfirst`:

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

* `packages/core`: The core engine module of the editor, which encapsulates clipboard operations, event management, state management, the `History` module, `Canvas` operations, selection operations, and more, effectively implementing the fundamental capabilities of a `Canvas` engine.
* `packages/delta`: The data structure module, designed to establish a baseline data structure with the implementation of the `DeltaSet` data structure and atomic `Op` operations, primarily used to describe the entire editor's data structure and operations, including capabilities like `invert`, which are significant for implementing the `History` module.
* `packages/plugin`: The plugin module, built on the foundation of `packages/delta`, is designed for modularizing the editor's functionalities, such as plugins for `Text`, `Image`, `Rect`, etc., which are all implemented here.
* `packages/react`: The `React` module, primarily designed to implement the view layer of the editor. It is important to note that our core module is framework-agnostic; if needed, we can also implement the view layer using frameworks like `Vue` or `Angular`.
* `packages/utils`: The utility module, which encapsulates various utility functions, such as `FixedNumber`, `Palette`, and others frequently utilized across the entire editor, serving as a foundational package referenced throughout the `workspace`.
* `package.json`: The `package.json` for the entire `workspace`, where project information is configured, along with relevant configurations for `EsLint` and `StyleLint`.
* `pnpm-lock.yaml`: The lock file for `pnpm`, used to lock dependency versions across the entire `workspace`.
* `pnpm-workspace.yaml`: The configuration file for `pnpm` workspaces, used to enable `monorepo` capabilities.
* `tsconfig.json`: The `tsconfig` configuration file for the entire `workspace`, used to configure `TypeScript` compilation settings and serves as the baseline configuration for project module references.

`pnpm` is an exceptionally efficient package manager that saves disk space through hard links and symbolic links, ensuring that each package version is stored only once. Most importantly, `pnpm` creates a non-flattened `node_modules` structure, which guarantees strict matching of dependencies to declarations, tightly controls dependency hoisting, and avoids unexpected issues with dependency upgrades, thereby enhancing project consistency and predictability.

Returning to `monorepo`, `pnpm` is not only an excellent package manager but also provides out-of-the-box `monorepo` capabilities. The `pnpm-workspace.yaml` file is used to configure `workspace`, allowing `pnpm` workspaces to act as `monorepo` capabilities. Our configuration is quite straightforward, as we consider all directories under `packages` as sub-projects.

```yml
packages:
  - 'packages/*'
```

With `monorepo`, managing all sub-projects becomes effortless, especially for projects that require publishing `Npm` packages. Splitting sub-modules is a great choice, and achieving framework-agnostic view layers is even more meaningful. Moreover, `monorepo` offers numerous benefits for overall project management; for instance, when bundling the entire application, we do not need to publish new packages for each sub-project before bundling. Instead, we can directly place the compilation process at the `workspace` level, ensuring consistency across the entire project, simplifying the build process and continuous integration workflow, and allowing all projects to share build scripts and tool configurations. Additionally, all projects and modules share a single version control system, facilitating unified version management and change tracking, and aiding in synchronizing updates across these interdependent projects.

## Best Practices for TS + Rspack
Having discussed the benefits of using `pnpm + monorepo` for project management, let’s delve into my best practices for applying `TS` and `Rspack` within a `Monorepo`. I wonder if you have encountered the following two issues:

* Subproject `TS` declarations do not take effect immediately after changes; compiling the subproject is necessary. If during the compilation process, the `dist` or other output packages are deleted, you'll encounter errors in `vsc` or other editors stating that `TS` cannot find the reference declarations. In this case, you must use the command to `Reload TypeScript Project` to eliminate the errors. However, if you don't delete the output packages, you may face some hidden issues. For example, if a file was originally named `a.tsx` and needs to be moved to a similarly named `a` directory and renamed to `index.tsx` for some reason, after doing this, you may find that changing the code in the `index.tsx` does not trigger updates. You must restart the application’s `webpack` or other compilers because it still references the original file. While these types of issues may not be complex, troubleshooting them can be time-consuming.

* Changing `TS` code in a subproject requires recompiling the subproject because the project is managed under a `monorepo`, which includes `workspace` references in the `package.json`. In fact, the `workspace` is referenced within `node_modules`, meaning even though it's a subproject, it still needs to adhere to the rules of `node_modules`. Typically, it needs to be compiled to `js` in order to be executed, making it cumbersome to need to run a full build every time code is modified. Of course, you can usually monitor changes using the `-w` command, but that adds an extra step. Moreover, for projects with `alias`, simply using `tsc` for compilation may not suffice. Additionally, in a `monorepo` environment, if many subprojects require this, particularly in scenarios where a full compilation is necessary instead of incremental, the overall compilation time for the project can become excessively lengthy.

Now, let’s address the first issue: the `TS` declaration changes in subprojects not taking effect immediately. As mentioned, subprojects in a `monorepo` are managed and referenced through `node_modules`. Therefore, by default, they still need to follow the rules of `node_modules`, specifically that the `types` field in the `packages.json` points to the `TS` declaration files. Is there a way to modify this behavior? Certainly! We can configure the `path` in the root `tsconfig.json` of the entire project to resolve this issue perfectly. Once we set it up as follows, we can jump to the declaration in the root directory of the subproject by holding `Ctrl` and clicking the left mouse button. A point to pay attention to here is that it is not recommended to set `"baseUrl": "."` in the project because it can lead to some peculiar path reference issues. Therefore, aside from needing to package the `Npm` `tsconfig.build.json`, relative path configuration is used directly in the resume editor project. 

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

After resolving the `TS` declaration issues in the project, let’s discuss the compilation issue. This problem appears more complex, as `TS` declarations are purely type declarations and do not directly affect the compilation of the project's core code, except for type checking. To ensure our code directly points to the subproject in `Rspack` without having to adhere to the `node_modules` rules, it's straightforward to configure `resolve.alias`. This way, when we directly modify the `TS` code, the editor can immediately respond with incremental compilation.

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

In fact, `Rspack` does a lot for us; for instance, it compiles even the `TS` files in `node_modules`. However, for some projects created using `CRA`, this configuration can be a bit tricky. Nonetheless, we can also leverage `customize-cra` to achieve this. Additionally, we'll need to disable some plugins like `ModuleScopePlugin`. Below is the configuration for the rich text editor project [DocEditor](https://github.com/WindrunnerMax/DocEditor).

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

Additionally, the resume editor is a purely front-end project. One significant advantage of such a project is that it can run just by using static resources. If we leverage `GitHub Action`, we can deploy directly within the repository via `Git Pages` and access it seamlessly through `GitHub Pages`. This way, a complete `DEMO` can be presented directly in the repository.

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

## Summary
In this discussion, we talked about the rationale behind using `Monorepo` and briefly touched on the advantages of `pnpm workspace`. We also addressed two practical issues encountered in the development of sub-projects, namely `TS` compilation and project compilation, demonstrating relevant practices in `Monorepo`, `Rspack`, and `Webpack` projects. Finally, we briefly discussed how to utilize `GitHub Action` to deploy an online `DEMO` directly on `Git Pages`. In the subsequent articles, we will delve into how to design capabilities for hierarchical rendering and event management.

## Daily Challenge

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://github.com/WindRunnerMax/CanvasEditor>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas>
- <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D>