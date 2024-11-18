# Issue of Empty Elements in JavaScript Arrays

The term "empty elements" in `JavaScript` refers to the presence of empty spaces within an array, indicating that there is no value at that specific position. It's important to note that "empty" is distinct from `undefined`. Additionally, "empty" does not belong to any data type in `Js`. Moreover, the treatment of empty elements varies across different versions of `JavaScript` and various methods, which is why it is recommended to avoid having empty elements in arrays.

## Description
In `JavaScript`, arrays exist in the form of sparse arrays. Therefore, when certain positions do not have values, it is necessary to use a specific value to fill them. However, various browsers optimize the operation of sparse arrays; for instance, the `V8` engine has the conversion between fast arrays and slow arrays. Additionally, in `V8`, empty elements are described as references to empty objects. When using the `Array` constructor in `Js` to create arrays with empty elements, these elements are not automatically filled with `undefined`, but are instead filled with "empty". It's important to note that empty elements are not the same as `undefined`. `Undefined` indicates the absence of a definition, but it is a fundamental data type and therefore a value. Meanwhile, "empty" indicates the complete absence of any value at a specific position.

```javascript
console.log([,,,]); // (3) [empty × 3]
console.log(new Array(3)); // (3) [empty × 3]
console.log([undefined, undefined, undefined]); // (3) [undefined, undefined, undefined]
console.log(0 in [undefined, undefined, undefined]); // true
console.log(0 in [,,,]); // false // in checks the index and in this case, 0 position has no value
```

## Method Handling
Starting from `ECMA262V5`, the handling of empty elements is inconsistent. In most cases, empty elements are ignored. For instance, `forEach()`, `for in`, `filter()`, `every()`, and `some()` methods all skip empty elements. `Map()` skips empty elements but retains the values. `Join()` and `toString()` treat empty elements, `undefined`, and `null` as empty strings.

```javascript
// forEach ignores empty elements
[1, , 2].forEach(v => console.log(v)); // 1 2

// for in ignores empty elements
for(let key in [1, , 2]){ console.log(key); } // 0 2

// filter ignores empty elements
console.log([1, , 2].filter(v => true)); // [1, 2]

// every ignores empty elements
console.log([1, , 1].every(v => v === 1)); // true

// some ignores empty elements
console.log([1, , 1].some(v => v !== 1)); // false

// map skips empty elements and creates a new array retaining empty elements
console.log([1, , 1].map(v => 11)); // (3) [11, empty, 11]

// join treats empty elements, undefined, and null as empty strings
console.log([1, , 1, null, undefined].join("|")); // 1||1||

// toString treats empty elements, undefined, and null as empty strings
console.log([1, , 1, null, undefined].toString()); // 1,,1,,
```

In `ECMA262V6`, empty elements are converted to `undefined`. For example, the `Array.from()` method converts empty elements in the array to `undefined`, the spread operator also converts empty elements to `undefined`, `copyWithin()` copies empty elements, `for of` loop iterates through empty elements and treats the value as `undefined`, `includes()`, `entries()`, `keys()`, `values()`, `find()`, and `findIndex()` handle empty elements as `undefined`.

```javascript
// Array.from converts empty elements to undefined
console.log(Array.from([1, , 2])); // (3) [1, undefined, 2]

// ... converts empty elements to undefined
console.log([...[1, , 2]]); // (3) [1, undefined, 2]

// copyWithin copies empty elements
console.log([1, , 2].copyWithin()); // (3) [1, empty, 2]

// for of iterates through empty elements and treats the value as undefined
for(let key of [1, , 2]){ console.log(key); } // 1 undefined 2

// includes treats empty elements as undefined
console.log([, , ,].includes(undefined)); // true

// entries treats empty elements as undefined
console.log([...[1, , 2].entries()]); // [[0, 1], [1, undefined], [2, 2]]

// keys retrieves the index of empty elements
console.log([...[1, , 2].keys()]); // [0, 1, 2]

// values treats empty elements as undefined
console.log([...[1, , 2].values()]); // [1, undefined, 2]

// find handles empty elements as undefined
console.log([, , 1].find(v => true)); // undefined

// findIndex handles empty elements as undefined
console.log([, , 1].findIndex(v => true)); // 0
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
- [Zhihu - What are the benefits of using git?](https://www.zhihu.com/question/60919509)
- [Juejin - Writing a React component to determine the height of a dynamically loaded image](https://juejin.im/post/6844903917738786829)
- [Segmentfault - How to install wget in Docker container](https://segmentfault.com/a/1190000004680060)
- [Xmoyking's Blog - Detailed explanation of promise mechanism](https://xmoyking.github.io/2016/12/17/js-framework2/)
- [Juejin - React source code analysis series - creating element and rendering](https://juejin.im/post/6844904047934373896#heading-12)
- [CSDN - Introduction to Big Data Technology - Hadoop](https://blog.csdn.net/qq_30100043/article/details/53308524)
- [CSDN - Introduction to Redis cluster](https://blog.csdn.net/weixin_43342105/article/details/108638001)
```