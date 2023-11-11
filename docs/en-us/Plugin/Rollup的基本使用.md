# Basic Usage of Rollup

`rollup.js` is a module bundler that allows you to start with an entry file and bundle all the modules used in a project into a single final release file. `Rollup` is extremely suitable for building a utility library, and the source code of `Vue.js` is built using `Rollup`.

## Description

`Rollup` uses new standardized formats for code modules, all of which are included in the `ES6` version of `JavaScript`, rather than previous special solutions like `CommonJS` and `AMD`, which means that `rollup` uses the `ES6` module standard. This means that we can directly use `import` and `export` without the need to introduce `babel`. However, in current projects, `babel` is considered a necessary tool. In addition, `rollup` implements another important feature called `tree-shaking`, which automatically removes unused code, i.e., code that is not being used. This feature is based on the static analysis of `ES6` modules, which means that variables that are `exported` but not `imported` will not be bundled into the final code.

## Example

One of my small Greasemonkey plugins is bundled using `rollup`. The `GreasyFork` address is `https://greasyfork.org/zh-CN/scripts/405130`, and the source code address is `https://github.com/WindrunnerMax/TKScript`. You can package and build it using `npm run build`. The configuration of `package.json` file and `rollup.config.js` file are as follows.

```json
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

```javascript
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
    }
};
```

```javascript
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

## Usage

### Installation
* Global installation: `npm install rollup -g`.
* Project installation: `npm install rollup --save-dev` or `yarn add rollup -D`.

### Command Line Tool
* `-i, --input <filename>`: The file to be bundled (required).
* `-o, --file <output>`: The output file (if not provided, it will be printed to the console).
* `-f, --format <format>`: The format of the output file.
    * `amd`: Asynchronous Module Definition, used for module loaders like `RequestJS`.
    * `cjs`: `CommonJS`, suitable for `Node` or `Browserify/webpack`.
    * `es`: Save the bundle as an `ES` module file.
    * `iife`: A self-executing function, suitable for use as a `script` tag, can only run in a browser.
    * `umd`: Universal Module Definition, integrating `amd`, `cjs`, and `iife`.
    * `system`: `SystemJS` loader format.
* `-e, --external <ids>`: Exclude a comma-separated list of module IDs.
* `-g, --globals <pairs>`: Add any module ID definitions defined here to external dependencies in the form of `moduleID:Global` key-value pairs, separated by commas.
* `-n, --name <name>`: The name of the generated `UMD` module.
* `-m, --sourcemap`: Generate a `sourcemap`.
* `--amd.id`: The `ID` of the `AMD` module, default is an anonymous function.
* `--amd.define`: Use a `Function` to replace `define`.
* `--no-strict`: Omit `use strict;` in the generated bundle.
* `--no-conflict`: For `UMD` modules, provide a method for generating a globally conflict-free variable.
* `--intro`: Insert a content at the very top of the bundled file's block inside the `wrapper`.
* `--outro`: Insert a content at the very bottom of the bundled file's block inside the `wrapper`.
* `--banner`: Insert a content at the very top of the bundled file's block outside the `wrapper`.
* `--footer`: Insert a content at the very bottom of the bundled file's block outside the `wrapper`.
* `--interop`: Include common modules (this option is added by default).
* `-w, --watch`: Watch for changes in the source files, re-bundle if changes are detected.
* `--silent`: Do not print warnings to the console.
* `-h, --help`: Output help information.
* `-v, --version`: Output version information.

### Configuration File

```javascript
// rollup.config.js
export default {
  // Core options
  input,     // required
  external,
  plugins,

  // Additional options
  onwarn,

  // Danger zone
  acorn,
  context,
  moduleContext,
  legacy

  output: {  // required (can be an array for multiple outputs)
    // Core options
    file,    // required
    format,  // required
    name,
    globals,
 ```

```javascript
// Additional options
paths,
banner,
footer,
intro,
outro,
sourcemap,
sourcemapFile,
interop,

// High-risk options
exports,
amd,
indent
strict
  },
};
```

### input
`input`, `rollup -i,--input`, package entry file path, parameter type is `String | String [] | { [entryName: string]: string }`.
When using an array or a string as the option value, the original file name is used by default as the file's `basename` and can be passed as a dynamic parameter into the `output:entryFileNames = entry-[name].js` configuration option.

```javascript
input: "./src/index.js";
input: ["./src/index.js", "./other/index.js"];
```

When using key-value pairs `{key: value}` as the option value, the object key is used as the file's `basename` to be passed as a dynamic parameter into the `output:entryFileNames` configuration option.

```javascript
input: { main: "./src/index.js", vendor: "./other/index.js" }
```

### external 
`external`, `rollup -e,--external`, maintains the specified `id` files as external links in the packaged file and does not participate in the build. Parameter type is `String[] | (id: string, parentId: string, isResolved: boolean) => boolean`.
* When the `format` type is `iife` or `umd`, the `output.globals` option parameter needs to be configured to provide global variable names to replace external imports.
* When `external` is a function, the parameters represent: `id`, the id of all imported files, i.e. the path accessed by `import`; `parent`, the absolute path of the `import` file; `isResolved`, which indicates whether the file `id` has been processed by a plugin.

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
Many plugin options can be provided for `rollup`, parameter type is `Plugin | (Plugin | void)[]`.

```javascript
{
  // ...,
  plugins: [
      resolve(), 
      commonjs(), 
      isProduction && (await import("rollup-plugin-terser")).terser()
 ]
}
```

### onwarn
Intercepts warning messages. If not provided, the warning will be copied and printed to the console. A warning is an object with at least a `code` and `message` property, and we can control how to handle different types of warnings.

```javascript
onwarn (warning) {
  // Skip certain warnings
  if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;

  // Throw an error
  if (warning.code === 'NON_EXISTENT_EXPORT') throw new Error(warning.message);

  // Print all warnings to the console
  console.warn(warning.message);
}
```

Many warnings also have a `loc` property and a `frame`, which can pinpoint the source of the warning.
```javascript
onwarn ({ loc, frame, message }) {
  // Print location (if applicable)
  if (loc) {
    console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
    if (frame) console.warn(frame);
  } else {
    console.warn(message);
  }
}
```


### acorn
This is the `danger zone`, modifying the `rollup` configuration for parsing `js`, `rollup` uses the `acorn` library internally to parse `js`. The `acorn` library provides the related configuration `api` for parsing `js`, which generally requires little modification. In the example below, the `acorn-jsx` plugin is not the same as using `babel`. The purpose of this plugin is to allow the `acornjs` parser to understand `jsx` syntax. After being bundled by `rollup`, the displayed syntax is still `jsx`, while `babel` will directly modify the `jsx` structure into regular `js` syntax.

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
By default, the context of a module, i.e., the value of the top-level `this`, is `undefined`. In very rare cases, it may need to be changed to something else, for example, `window`.

### moduleContext
Similar to `context`, but each module can be an object of `id:context` pairs or a function of `id=>context`.

### legacy
To increase support for older environments such as `IE8`, more modern code that may not work properly is stripped away. The trade-off is deviating from the precise specifications required by the `ES6` module environment.

### output
`output` is the unified configuration entry for output files, which contains many configurable options. The parameter type is `Object | Array`. For a single output, it is an object, while for multiple outputs, it can be an array.

### output.file
`output.file`, `rollup -o,--file`, required for single file bundling, this option specifies the packaged content to be written to a file with a path. The parameter type is `String`.

```javascript
output: {
    file: "./dist/index.js" 
}
```

### output.format
`output.format`, `rollup -f,--format`, required format type for bundling. Configurable options include `amd`, `cjs`, `es`, `iife`, `umd`, `system`. The options are the same as the command line configuration options. The parameter type is `String`.

```javascript
output: { 
    format: "iife"
}
```

### output.name
`output.format`, `rollup -f,--format`, the name of the generated package. The parameter type is `String`.

```javascript
export default {
  // ...,
  output: {
    name: "bundle"
  }
};
```

### output.globals
`output.globals`, `rollup -g,--globals`, global access variable names provided under the `umd` and `iife` file types, in conjunction with the `external` options specified for external linking. The parameter type is `{ [id: String]: String } | ((id: String) => String)`.

```javascript
export default {
  // ...,
  globals: {
    jquery: "$"
  }
};
```

### output.paths
It takes an `ID` and returns a path, or an object of `id: path` pairs, where these paths will be used for the generated bundle instead of the module `ID`, allowing dependencies to be loaded from a `CDN`.

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
String prefixed to the file bundle. The `banner` option does not disrupt `sourcemaps`. The parameter type is `String`.

```javascript
export default {
  // ...,
  output: {
      banner: "/* library version " + version + " */",
  }
};
```

### output.footer
String prefixed to the file bundle. The `footer` option does not disrupt `sourcemaps`. The parameter type is `String`.

```javascript
export default {
  // ...,
  output: {
      footer: "/* follow me on Github! */",
  }
};
```

### output.intro
Similar to `output.banner`, if `banner` and `footer` are for adding strings at the beginning and end of a file, then `intro` and `outro` are for adding strings at the beginning and end of the packaged code.

```javascript
export default {
  // ...,
  output: {
      intro: "/* library version " + version + " */",
  }
};
```

### output.outro
Similar to `output.footer`, if `banner` and `footer` are for adding strings at the beginning and end of a file, then `intro` and `outro` are for adding strings at the beginning and end of the packaged code.

```javascript
export default {
  // ...,
  outro: {
      footer: "/* follow me on Github! */",
  }
};
```

### output.sourcemap
`sourcemap`, `rollup -m,--sourcemap, --no-sourcemap`, if `true`, it will create a separate `sourcemap` file, if `inline`, `sourcemap` will be attached as a data `URI` to the generated `output` file.

### output.sourcemapFile
The location of the generated package, if it is an absolute path, all source code paths in the `sourcemap` file will be relative to it, the `map.file` property is the basic name `basename` of `sourcemapFile`, because the location of `sourcemap` is assumed to be adjacent to the `bundle`, if specified `output`, `sourcemapFile` is not necessary. In this case, the output file name will be inferred by adding a `.map` suffix to the `bundle` output file. It is rarely used in general application scenarios and is only used in special scenarios when it is necessary to change the `sourcemap` target file address.

### output.interop
Whether to add an `interop` block, by default `interop: true`, for safety reasons, if it is necessary to distinguish between default and named exports, `rollup` will export any external dependency `default` to a separate variable, this usually only applies to your external dependencies, such as with `Babel`, if it is determined not to be needed, `interop: false` can be used to save a few bytes.

### output.exports
Which export mode to use, default is `auto`, it guesses your intention based on the content exported by the `entry` module.
* `default`: If using `export default...` to export only one file, this is suitable.
* `named`: If exporting multiple files, this is suitable.
* `none`: If not exporting any content, for example, when building an application and not a library, this is suitable.

### output.amd
Packing `amd` module related definitions.

* `amd.id`: Used for the `ID` of `AMD/UMD` packages.
* `amd.define`: The function name to use instead of `define`.

### output.indent
The indentation string to use, for the format that requires code indentation such as `amd`, `iife`, `umd`, it can also be `false` for no indentation or `true` for default automatic indentation.

### output.strict
`true` or `false`, default is `true`, whether to include the `use strict pragma` at the top of the generated non-`ES6` package, strictly speaking, `ES6` modules are always in strict mode, so there should be no good reason to disable it.

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