# Js模块化导入导出
`CommonJs`、`AMD`、`CMD`、`ES6`都是用于模块化定义中使用的规范，其为了规范化模块的引入与处理模块之间的依赖关系以及解决命名冲突问题，并使用模块化方案来使复杂系统分解为代码结构更合理，可维护性更高的可管理的模块。

## CommonJS
`CommonJS`是`NodeJs`服务器端模块的规范，根据这个规范，每个文件就是一个模块，有自己的作用域。在一个文件里面定义的变量、函数、类，都是私有的，对其他文件不可见。`CommonJS`规范规定，每个模块内部，`module`变量代表当前模块。这个变量是一个对象，它的`exports`属性是对外的接口。加载某个模块，其实是加载该模块`exports`属性。总之，`CommonJS`规范通过`require`导入，`module.exports`与`exports`进行导出。


```javascript
// 1.js
var a  = 1;
var b = function(){
    console.log(a);
}

module.exports = {
    a: a,
    b: b
}

/*
// 当导出的模块名与被导出的成员或方法重名时可以有如下写法
module.exports = {
    a,
    b
}
*/
```

```javascript
// 2.js
var m1 = require("./1.js")

console.log(m1.a); // 1
m1.b(); // 1

```
 也可以使用`exports`进行导出，但一定不要重写`exports`的指向，因为`exports`只是一个指针并指向`module.exports`的内存区域，即`exports = module.exports = {}`，重写`exports`则改变了指针指向将导致模块不能导出，简单来说`exports`就是为写法提供了一个简便方案，最后其实都是利用`module.exports`导出。此外若是在一个文件中同时使用`module.exports`与`exports`，则只会导出`module.exports`的内容
 
```javascript
// 1.js
var a  = 1;
var b = function(){
    console.log(a);
}

exports.a = a;
exports.b = b;

// exports = { a, b } // 不能这么写，这样就改变了exports的指向为一个新对象而不是module.exports
```

```javascript
// 2.js
var m1 = require("./1.js")

console.log(m1.a); // 1
m1.b(); // 1
```

## AMD
`AMD`规范不是`AMD YES`，`AMD`异步模块定义，全称`Asynchronous Module Definition`规范，是浏览器端的模块化解决方案，`CommonJS`规范引入模块是同步加载的，这对服务端不是问题，因为其模块都存储在硬盘上，可以等待同步加载完成，但在浏览器中模块是通过网络加载的，若是同步阻塞等待模块加载完成，则可能会出现浏览器页面假死的情况，`AMD`采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行，`RequireJS`就是实现了`AMD`规范。

```javascript
require(['moduleA', 'moduleB', 'moduleC'], function (moduleA, moduleB, moduleC){
    // do something
});

define(['moduleA', 'moduleB', 'moduleC'], function (moduleA, moduleB, moduleC){
    // do something
    return {};
});

/**
define和require在依赖处理和回调执行上都是一样的，不一样的地方是define的回调函数需要有return语句返回模块对象(注意是对象)，这样define定义的模块才能被其他模块引用；require的回调函数不需要return语句，无法被别的模块引用
*/

// html的<script>标签也支持异步加载
// <script src="require.js" defer async="true" ></script> <!-- async属性表明这个文件需要异步加载，避免网页失去响应。IE不支持这个属性，只支持defer，所以把defer也写上。 -->
```

## CMD
`CMD`通用模块定义，是`SeaJS`在推广过程中对模块定义的规范化产出，也是浏览器端的模块化异步解决方案，`CMD`和`AMD`的区别主要在于：
* 对于依赖的模块，`AMD`是提前执行（相对定义的回调函数, `AMD`加载器是提前将所有依赖加载并调用执行后再执行回调函数），`CMD`是延迟执行（相对定义的回调函数, `CMD`加载器是将所有依赖加载后执行回调函数，当执行到需要依赖模块的时候再执行调用加载的依赖项并返回到回调函数中），不过`RequireJS`从`2.0`开始，也改成可以延迟执行
* ` AMD`是依赖前置（在定义模块的时候就要声明其依赖的模块），`CMD`是依赖就近（只有在用到某个模块的时候再去`require`——按需加载，即用即返）。


```javascript
define(function(require,exports,module){
　　var a = reuire('require.js');
　　a.dosomething();
　　return {};
});
```

## ES6
`ES6`在语言标准的层面上实现了模块的功能，是为了成为浏览器和服务器通用的模块解决方案，`ES6`标准使用`export`与`export default`来导出模块，使用`import`导入模块。此外在浏览器环境中是可以使用`require`来导入`export`、`export default`导出的模块的，但依然建议使用`import`标准导入模块。  
`export`、`export default`主要有以下区别：

* `export`能按需导入，`export default`不行。
* `export`可以有多个，`export default`仅有一个。
* `export`能直接导出变量表达式，`export default`不行。
* `export`方式导出，在导入时要加`{}`，`export default`则不需要。


```javascript
// 导出单个特性
export let name1, name2, …, nameN; // also var, const
export let name1 = …, name2 = …, …, nameN; // also var, const
export function FunctionName(){...}
export class ClassName {...}

// 导出列表
export { name1, name2, …, nameN };

// 重命名导出
export { variable1 as name1, variable2 as name2, …, nameN };

// 解构导出并重命名
export const { name1, name2: bar } = o;

// 默认导出
export default expression;
export default function (…) { … } // also class, function*
export default function name1(…) { … } // also class, function*
export { name1 as default, … };

// 导出模块合集
export * from …; // does not set the default export
export * as name1 from …; // Draft ECMAScript® 2O21
export { name1, name2, …, nameN } from …;
export { import1 as name1, import2 as name2, …, nameN } from …;
export { default } from …;
```

```javascript
// name－从将要导入模块中收到的导出值的名称
// member, memberN－从导出模块，导入指定名称的多个成员
// defaultMember－从导出模块，导入默认导出成员
// alias, aliasN－别名，对指定导入成员进行的重命名
// module-name－要导入的模块。是一个文件名
// as－重命名导入成员名称（“标识符”）
// from－从已经存在的模块、脚本文件等导入
import defaultMember from "module-name";
import * as name from "module-name";
import { member } from "module-name";
import { member as alias } from "module-name";
import { member1 , member2 } from "module-name";
import { member1 , member2 as alias2 , [...] } from "module-name";
import defaultMember, { member [ , [...] ] } from "module-name";
import defaultMember, * as name from "module-name";
import "module-name"; // 将运行模块中的全局代码, 但实际上不导入任何值。
```

```javascript
// 1.js
var a  = 1;
var b = function(){
    console.log(a);
}

var c = 3;
var d = a + c;

var obj = { a,b,c }



export {a,b};

export {c,d};

export default obj;
```

```html
<!-- 3.html 由于浏览器限制，需要启动一个server服务 -->
<!DOCTYPE html>
<html>
<head>
    <title>ES6</title>
</head>
<body>

</body>
<script type="module">
    import {a,b} from "./1.js"; // 导入export
    import m1 from "./1.js"; // 不加{}即导入export default 
    import {c} from "./1.js"; // 导入export 按需导入
    
    console.log(a); // 1
    console.log(b); // ƒ (){ console.log(a); }
    console.log(m1); // {a: 1, c: 3, b: ƒ}
    console.log(c); // 3
</script>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```


## 参考

```
https://segmentfault.com/a/1190000010426778
https://www.cnblogs.com/leftJS/p/11073481.html
https://www.cnblogs.com/zhoulujun/p/9415407.html
https://www.cnblogs.com/zhoulujun/p/9415407.html
https://www.cnblogs.com/moxiaowohuwei/p/8692359.html
```
