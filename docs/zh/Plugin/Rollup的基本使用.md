# Rollup的基本使用
`rollup.js`是一个模块打包工具，可以使项目从一个入口文件开始，将所有使用到的模块文件都打包到一个最终的发布文件中，`Rollup`极其适合构建一个工具库，`Vue.js`源码就是通过`Rollup`打包构建的。

## 描述
`rollup`对代码模块使用新的标准化格式，这些标准都包含在`JavaScript`的`ES6`版本中，而不是以前的特殊解决方案，如`CommonJS`和`AMD`等，也就是说`rollup`使用`ES6`的模块标准，这意味着我们可以直接使用`import`和`export`而不需要引入`babel`，当然，在现在的项目中，`babel`可以说是必用的工具，此外`rollup`实现了另一个重要特性叫做`tree-shaking`，这个特性可以帮助你将无用代码，即没有使用到的代码自动去掉，这个特性是基于`ES6`模块的静态分析的，也就是说，只有`export`而没有`import`的变量是不会被打包到最终代码中的。

### 示例
我的一个小油猴插件就是通过`rollup`打包的，`GreasyFork`地址为`https://greasyfork.org/zh-CN/scripts/405130`，全部源码地址为`https://github.com/WindrunnerMax/TKScript`，使用`npm run build`即可打包构建，`package.json`文件与`rollup.config.js`文件配置如下。

```
{
  "name": "TKScript",
  "version": "1.0.0",
  "description": "Tampermonkey",
  "scripts": {
    "build": "rollup -c"
  },
  "author": "Czy",
  "license": "MIT",
  "devDependencies": {
    "@babel/core": "^7.10.4",
    "@babel/preset-env": "^7.10.4",
    "install": "^0.13.0",
    "npm": "^6.14.5",
    "rollup": "^2.18.2",
    "rollup-plugin-babel": "^4.4.0",
    "rollup-plugin-postcss": "^3.1.2",
    "rollup-plugin-uglify": "^6.0.4",
    "rollup-plugin-userscript-metablock": "^0.2.5"
  }
}
```

```
import postcss from "rollup-plugin-postcss";
import babel from "rollup-plugin-babel";
// import { uglify } from "rollup-plugin-uglify";
import metablock from "rollup-plugin-userscript-metablock";

const config = {
    postcss: {
        minimize: true,
        extensions: [".css"],
    },
    babel: {
        exclude: ["node_modules/**"],
        presets: [
            [
                "@babel/env", {
                    modules: false,
                    targets: "last 2 versions, ie >= 10"
                }
            ]
        ]
    },

}

export default [{
    input: "./src/copy/src/index.js",
    output: {
        file: "./dist/copy.js",
        format: "iife",
        name: "copyModule"
    },
    plugins: [
        postcss(config.postcss),
        babel(config.babel),
        // uglify(),
        metablock({
            file: "./src/copy/meta.json"
        })
    ]
},{
    input: "./src/site-director/src/index.js",
    output: {
        file: "./dist/site-director.js",
        format: "iife",
        name: "linkModule"
    },
    plugins: [
        postcss(config.postcss),
        babel(config.babel),
        // uglify(),
        metablock({
            file: "./src/site-director/meta.json"
        })
    ]
}];
```

## 使用方法

### 安装
* 全局安装: `npm install rollup -g`。
* 项目安装: `npm install rollup --save-dev`、`yarn add rollup -D`。

### 命令行工具
* `-i, --input <filename>`: 要打包的文件(必须)。
* `-o, --file <output>`: 输出的文件(如果没有这个参数，则直接输出到控制台)。
* `-f, --format <format>`: 输出的文件类型。
    * `amd`: 异步模块定义，用于像`RequestJS`这样的模块加载器。
    * `cjs`: `CommonJS, `适用于`Node`或`Browserify/webpack`。
    * `es`: 将软件包保存为`ES`模块文件。
    * `iife`: 一个自动执行的功能，适合作为`script`标签这样的，只能在浏览器中运行。
    * `umd`: 通用模块定义，以`amd`、`cjs`和`iife`为一体。
    * `system`: `SystemJS`加载器格式。
* `-e, --external <ids>`: 将模块`ID`的逗号分隔列表排除。
* `-g, --globals <pairs>`: 以`moduleID:Global`键值对的形式，用逗号分隔开任何定义在这里模块`ID`定义添加到外部依赖。
* `-n, --name <name>`: 生成`UMD`模块的名字。
* `-m, --sourcemap`: 生成`sourcemap`。
* `--amd.id`: `AMD`模块的`ID`，默认是个匿名函数。
* `--amd.define`: 使用`Function`来代替`define`。
* `--no-strict`: 在生成的包中省略`use strict;`。
* `--no-conflict`: 对于`UMD`模块来说，给全局变量生成一个无冲突的方法。
* `--intro`: 在打包好的文件的块的内部(`wrapper`内部)的最顶部插入一段内容。
* `--outro`: 在打包好的文件的块的内部(`wrapper`内部)的最底部插入一段内容。
* `--banner`: 在打包好的文件的块的外部(`wrapper`外部)的最顶部插入一段内容。
* `--footer`: 在打包好的文件的块的外部(`wrapper`外部)的最底部插入一段内容。
* `--interop`: 包含公共的模块(这个选项是默认添加的)。
* `-w, --watch`: 监听源文件是否有改动，如果有改动，重新打包。
* `--silent`: 不要将警告打印到控制台。
* `-h, --help`: 输出帮助信息。
* `-v, --version` 输出版本信息。

### 配置文件

```javascript
// rollup.config.js
export default {
  // 核心选项
  input,     // 必须
  external,
  plugins,

  // 额外选项
  onwarn,

  // danger zone
  acorn,
  context,
  moduleContext,
  legacy

  output: {  // 必须 (如果要输出多个，可以是一个数组)
    // 核心选项
    file,    // 必须
    format,  // 必须
    name,
    globals,

    // 额外选项
    paths,
    banner,
    footer,
    intro,
    outro,
    sourcemap,
    sourcemapFile,
    interop,

    // 高危选项
    exports,
    amd,
    indent
    strict
  },
};
```

### input
`input`、`rollup -i,--input`，打包入口文件路径，参数类型为`String | String [] | { [entryName: string]: string }`。  
使用数组或者字符串作为选项值的时候的时候，默认使用的是文件的原始名称，作为文件的`basename`，可以在`output:entryFileNames = entry-[name].js`配置选项作为`[name]`动态参数传递进去。

```javascript
input: "./src/index.js";
input: ["./src/index.js", "./other/index.js"];
```

用键值对`{key: value}`的选项值作为参数，使用的对象的键作为文件的`basename`，用来在`output:entryFileNames`配置选项作为`[name]`动态参数传递进去。


```javascript
input: { main: "./src/index.js", vendor: "./other/index.js" }
```

### external 
`external`、`rollup -e,--external`， 维持包文件指定`id`文件维持外链，不参与打包构建 参数类型为`String[] | (id: string, parentId: string, isResolved: boolean) => boolean`。
* 当`format`类型为`iife`或者`umd`格式的时候需要配置`output.globals`选项参数以提供全局变量名来替换外部导入。
* 当`external`是一个函数的时候，各个参数代表的含义分别是: `id`，所有导入的文件`id`，即`import`访问的路径；`parent`，`import`所在的文件绝对路径；`isResolved`，表示文件`id`是否已通过插件处理过。

```javascript
{
  // ...,
  external: [ 
      'some-externally-required-library',  
      'another-externally-required-library'
  ]
}
// or 
{
  // ...,
  external: (id, parent, isResolved) => {
    return true; 
  }
}
```

### plugins
可以提供`rollup`很多插件选项，参数类型为`Plugin | (Plugin | void)[]`。

```javascript
{
  // ...,
  plugins: [
      resolve(), 
      commonjs()， 
      isProduction && (await import("rollup-plugin-terser")).terser()
 ]
}
```

### onwarn
拦截警告信息，如果没有提供，警告将被复制并打印到控制台，警告是至少有一个`code`和`message`属性的对象，我们可以控制如何处理不同类型的警告。

```javascript
onwarn (warning) {
  // 跳过某些警告
  if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

  // 抛出异常
  if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message);

  // 控制台打印一切警告
  console.warn(warning.message);
}
```

许多警告也有一个`loc`属性和一个`frame`，可以定位到警告的来源。
```javascript
onwarn ({ loc, frame, message }) {
  // 打印位置（如果适用）
  if (loc) {
    console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
    if (frame) console.warn(frame);
  } else {
    console.warn(message);
  }
}
```

### acorn
这是`danger zone`，修改`rollup`解析`js`配置，`rollup`内部使用的`acorn`库解析`js, acorn`库提供了解析`js`的相关配置`api`，一般很少需要修改。在下面这个例子中，这个`acorn-jsx`插件和使用`babel`并不是同一个意思，这个插件的左右是让`acornjs`解析器能认识`jsx`语法，经过`rollup`打包后展示的还是`jsx`语法，而`babel`会直接修改`jsx`结构成为普通`js`语法。

```javascript
import jsx from "acorn-jsx";

export default {
  // ...
  acornInjectPlugins: [
      jsx()
  ]
};
```

### context
默认情况下，模块的上下文，即顶级的`this`的值为`undefined`，在极少数情况下，可能需要将其更改为其他内容，例如`window`。

### moduleContext
和`context`一样，但是每个模块可以是`id:context`对的对象，也可以是`id=>context`函数。

### legacy
为了增加对诸如`IE8`之类的旧版环境的支持，通过剥离更多可能无法正常工作的现代化的代码，其代价是偏离`ES6`模块环境所需的精确规范。

### output
`output`是输出文件的统一配置入口, 包含很多可配置选项 参数类型为`Object | Array`，单个输出为一个对象，要输出多个，可以是一个数组。

### output.file
`output.file`、`rollup -o,--file`，必填，对于单个文件打包可以使用该选项指定打包内容写入带路径的文件，参数类型为`String`。

```javascript
output: {
    file: "./dist/index.js" 
}
```

### output.format
`output.format`、`rollup -f,--format`，必填，打包格式类型 ，配置可选项有`amd`、`cjs`、`es`、`iife`、`umd`、`system`，选项说明同命令行配置选项，参数类型为`String`。

```javascript
output: { 
    format: "iife"
}
```

### output.name
`output.format`，`rollup -f,--format`生成包名称，参数类型为`String`。

```javascript
export default {
  // ...,
  output: {
    name: "bundle"
  }
};
```

### output.globals
`output.globals`，`rollup -g,--globals`，配合配置`external`选项指定的外链在`umd`和`iife`文件类型下提供的全局访问变量名参数类型，参数类型为`{ [id: String]: String } | ((id: String) => String)`。

```javascript
export default {
  // ...,
  globals: {
    jquery: "$"
  }
};
```
### output.paths
它获取一个`ID`并返回一个路径，或者`id: path`对的`Object`，在提供的位置，这些路径将被用于生成的包而不是模块`ID`，从而允许从`CDN`加载依赖关系。

```javascript
// app.js
import { selectAll } from 'd3';
selectAll('p').style('color', 'purple');
// ...

// rollup.config.js
export default {
  input: 'app.js',
  external: ['d3'],
  output: {
    file: 'bundle.js',
    format: 'amd',
    paths: {
      d3: 'https://d3js.org/d3.v4.min'
    }
  }
};

// bundle.js
define(['https://d3js.org/d3.v4.min'], function (d3) {

  d3.selectAll('p').style('color', 'purple');
  // ...

});
```

### output.banner
字符串前置到文件束`bundle`，`banner`选项不会破坏`sourcemaps`，参数类型为`String`。

```javascript
export default {
  // ...,
  output: {
      banner: "/* library version " + version + " */",
  }
};
```

### output.footer
字符串前置到文件束`bundle`，`footer`选项不会破坏`sourcemaps`，参数类型为`String`。

```javascript
export default {
  // ...,
  output: {
      footer: "/* follow me on Github! */",
  }
};
```

### output.intro
类似于`output.banner`，如果说`banner`和`footer`是在文件开始和结尾添加字符串，那么`intro`和`outro`就是在被打包的代码开头和结尾添加字符串了。

```javascript
export default {
  // ...,
  output: {
      intro: "/* library version " + version + " */",
  }
};
```

### output.outro
类似于`output.footer`，如果说`banner`和`footer`是在文件开始和结尾添加字符串，那么`intro`和`outro`就是在被打包的代码开头和结尾添加字符串了。

```javascript
export default {
  // ...,
  outro: {
      footer: "/* follow me on Github! */",
  }
};
```

### output.sourcemap
`sourcemap`、`rollup -m,--sourcemap, --no-sourcemap`，如果`true`，将创建一个单独的`sourcemap`文件，如果`inline, sourcemap`将作为数据`URI`附加到生成的`output`文件中。

### output.sourcemapFile
生成的包的位置，如果这是一个绝对路径，`sourcemap`中的所有源代码路径都将相对于它，`map.file`属性是`sourcemapFile`的基本名称`basename`，因为`sourcemap`的位置被假定为与`bundle`相邻，如果指定`output`，`sourcemapFile`不是必需的，在这种情况下，将通过给`bundle`输出文件添加`.map`后缀来推断输出文件名，一般应用场景很少，在特殊场景需要改变`sourcemap`的指向文件地址时才会用到。

### output.interop
是否添加`interop`块，默认情况下`interop: true`，为了安全起见，如果需要区分默认和命名导出，则`rollup`会将任何外部依赖项`default`导出到一个单独的变量，这通常只适用于您的外部依赖关系，例如与`Babel`，如果确定不需要它，则可以使用`interop: false`来节省几个字节。

### output.exports
使用什么导出模式，默认为`auto`，它根据`entry`模块导出的内容猜测你的意图。
* `default`: 如果使用`export default...`仅仅导出一个文件，那适合用这个。
* `named`: 如果导出多个文件，适合用这个。
* `none`: 如果不导出任何内容，例如正在构建应用程序，而不是库，则适合用这个。

### output.amd
打包`amd`模块相关定义。

* `amd.id`: 用于`AMD/UMD`软件包的`ID`。
* `amd.define`: 要使用的函数名称，而不是`define`。

### output.indent
是要使用的缩进字符串，对于需要缩进代码的格式`amd`、`iife`、`umd`，也可以是`false`无缩进或`true`默认自动缩进。

### output.strict
`true`或`false`，默认为`true`，是否在生成的非`ES6`软件包的顶部包含`usestrict pragma`，严格来说`ES6`模块始终都是严格模式，所以应该没有很好的理由来禁用它。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.rollupjs.com/
https://segmentfault.com/a/1190000010628352
https://github.com/JohnApache/rollup-usage-doc
```