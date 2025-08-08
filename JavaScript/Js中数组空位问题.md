# Js中数组空位问题
`JavaScript`中数组空位指的是数组中的`empty`，其表示的是在该位置没有任何值，而且`empty`是区别于`undefined`的，同样`empty`也不属于`Js`的任何数据类型，并且在`JavaScript`版本以及各种方法对于空位的处理也有不同，所以建议避免在数组中出现空位。

## 概述
在`JavaScript`的数组是以稀疏数组的形式存在的，所以当在某些位置没有值时，就需要使用某个值去填充。当然对于稀疏数组在各种浏览器中会存在优化的操作，例如在`V8`引擎中就存在快数组与慢数组的转化，此外在`V8`中对于`empty`的描述是一个空对象的引用。在`Js`中使用`Array`构造器创建出的存在空位的问题，默认并不会以`undefined`填充，而是以`empty`作为值，需要注意的是，空位并不是`undefined`，`undefined`表示的是没有定义，但是本身`undefined`就是一个基本数据类型，是一个值，而是`empty`表示了该处没有任何值，是一个完全为空的位置。

```javascript
console.log([,,,]); // (3) [empty × 3]
console.log(new Array(3)); // (3) [empty × 3]
console.log([undefined, undefined, undefined]); // (3) [undefined, undefined, undefined]
console.log(0 in [undefined, undefined, undefined]); // true
console.log(0 in [,,,]); // false // in 是检查索引 此处表示 0 位置是没有值的
```

## 方法处理
`ECMA262V5`中对空位的处理就已经开始不一致了，在大多数情况下会忽略空位，例如`forEach()`、`for in`、`filter()`、`every()`和`some()`都会跳过空位，`map()`会跳过空位，但会保留这个值，`join()`和`toString()`会将空位与`undefined`以及`null`处理成空字符串。

```javascript
// forEach 忽略空位
[1, , 2].forEach(v => console.log(v)); // 1 2

// for in 忽略空位
for(let key in [1, , 2]){ console.log(key); } // 0 2

// filter 忽略空位
console.log([1, , 2].filter(v => true)); // [1, 2]

// every 忽略空位
console.log([1, , 1].every(v => v === 1)); // true

// some 忽略空位
console.log([1, , 1].some(v => v !== 1)); // false

// map 遍历时忽略空位 新数组保留空位
console.log([1, , 1].map(v => 11)); // (3) [11, empty, 11]

// join 将空位与undefined以及null视为空字符串
console.log([1, , 1, null, undefined].join("|")); // 1||1||

// toString 将空位与undefined以及null视为空字符串
console.log([1, , 1, null, undefined].toString()); // 1,,1,,
```

`ECMA262V6`则是将空位转为`undefined`，例如`Array.form()`方法会将数组的空位转为`undefined`，扩展运算符也会将空位转为`undefined`，`copyWithin()`会连同空位一起拷贝，`for of`循环也会遍历空位并将值作为`undefined`，`includes()`、`entries()`、`keys()`、`values()`、`find()`和`findIndex()`等会将空位处理成`undefined`。

```javascript
// Array.form 将空位转为undefined
console.log(Array.from([1, , 2])); // (3) [1, undefined, 2]

// ... 将空位转为undefined
console.log([...[1, , 2]]); // (3) [1, undefined, 2]

// copyWithin 将空位一并拷贝
console.log([1, , 2].copyWithin()); // (3) [1, empty, 2]

// for of 遍历空位并将值作为undefined
for(let key of [1, , 2]){ console.log(key); } // 1 undefined 2

// includes 将空位处理成undefined
console.log([, , ,].includes(undefined)); // true

// entries 将空位处理成undefined
console.log([...[1, , 2].entries()]); // [[0, 1], [1, undefined], [2, 2]]

// keys 会取出空位的索引
console.log([...[1, , 2].keys()]); // [0, 1, 2]

// values 将空位处理成undefined
console.log([...[1, , 2].values()]); // [1, undefined, 2]

// find 将空位处理成undefined
console.log([, , 1].find(v => true)); // undefined

// find 将空位处理成undefined
console.log([, , 1].findIndex(v => true)); // 0
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.zhihu.com/question/60919509
https://juejin.im/post/6844903917738786829
https://segmentfault.com/a/1190000004680060
https://xmoyking.github.io/2016/12/17/js-framework2/
https://juejin.im/post/6844904047934373896#heading-12
https://blog.csdn.net/qq_30100043/article/details/53308524
https://blog.csdn.net/weixin_43342105/article/details/108638001
```
