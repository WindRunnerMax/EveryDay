# Map与WeakMap
`Map`对象用来保存键值对，并且能够记住键的原始插入顺序，任何对象或者原始值都可以作为键或者是值。  
`WeakMap`对象同样用来保存键值对，对于键是弱引用的而且必须为一个对象，而值可以是任意的对象或者原始值。


## Map

### 描述
`Map`对象类似于一个普通的键值对的`Object`对象，也是键值对的集合，但是他们之间有一些重要的区别：

| 描述 | Map | Object |
| --- | --- | --- |
| 意外的键 | `Map`默认情况不包含任何键，只包含显式插入的键。 | 一个`Object`有一个原型, 原型链上的键名有可能和在对象上的设置的键名产生冲突。 |
| 键的类型 | 一个`Map`的键可以是任意值，包括函数、对象或任意基本类型。 | 一个`Object` 的键必须是一个`String`或是`Symbol`。 |
| 键的顺序 | `Map`中的`key`是有序的，当迭代的时候，一个`Map`对象以插入的顺序返回键值。 | 一个`Object`的键的迭代顺序需要通过键的类型与创建的顺序来确定。|
| 键值数量 |  `Map`的键值对个数可以轻易地通过`size`属性获取。 | `Object`的键值对个数只能手动计算。 |
| 迭代 |  `Map`是`iterable`的，所以可以直接被迭代。 | 迭代一个`Object`需要以某种方式获取它的键然后才能迭代。 |
| 性能 |  `Map`在频繁增删键值对的场景下表现更好。 | `Object`在频繁添加和删除键值对的场景下未作出优化。 |

注：关于一个`Object`的键的迭代顺序问题，在`ES6`以后，对象保留了`String`与`Symbol`的创建顺序，当创建的对象仅有`String`或者`Symbol`时，迭代顺序与创建顺序相同，当对象中两种类型都存在时，`String`总是在前，当`String`可以被转换为`Number`时，这些键在迭代时处于最前，且会按照数字的顺序进行迭代。 

### 属性与方法
* `Map.prototype.constructor`: 返回构造函数。
* `Map.prototype.size`: 返回`Map`对象的键值对的数量。
* `Map.prototype.clear()`: 移除`Map`对象的所有键值对 。
* `Map.prototype.delete(key)`: 如果`Map`对象中存在该元素，则移除它并返回`true`，否则如果该元素不存在则返回 `false`。
* `Map.prototype.entries()`: 返回一个新的`Iterator`对象，它按插入顺序包含了`Map`对象中每个元素的`[key, value]`数组。
* `Map.prototype.forEach(callback[, thisArg])`: 按插入顺序，为`Map`对象里的每一键值对调用一次`callback`函数，如果为`forEach`提供了`thisArg`，它将在每次回调中作为`this`值。
* `Map.prototype.get(key)`: 返回键对应的值，如果不存在，则返回`undefined`。
* `Map.prototype.has(key)`: 返回一个布尔值，表示`Map`实例是否包含键对应的值。
* `Map.prototype.keys()`: 返回一个新的`Iterator`对象，它按插入顺序包含了`Map`对象中每个元素的键。
* `Map.prototype.set(key, value)`: 设置`Map`对象中键的值，返回该`Map`对象。
* `Map.prototype.values()`: 返回一个新的`Iterator`对象，它按插入顺序包含了`Map`对象中每个元素的值。
* `Map.prototype[@@iterator]()`: 返回一个新的`Iterator`对象，它按插入顺序包含了`Map`对象中每个元素的`[key, value]`数组。

### 示例

```javascript
var m = new Map();

var stringKey = "s";
var objectKey = {};

m.set(stringKey, "stringValue");
m.set(objectKey, "objectValue");

console.log(m.size); // 2

console.log(m.get(stringKey)); // stringValue
console.log(m.get(objectKey)); // objectValue

for (let [key, value] of m) {
  console.log(key, value);
}
/*
 s stringValue
 {} objectValue
*/

var m2 = new Map([
    ["stringKey", "stringValue"],
    [{}, "objectValue"]
]);
console.log(m2); // Map(2) {"stringKey" => "stringValue", {…} => "objectValue"}

var m3 = new Map([
    ...m,
    ...m2,
    ["stringKey", "coverStringValue"],
    [{}, "{} !== {}"],
    [NaN, "NaN !== NaN But key(NaN) === key(NaN)"],
    [NaN, "NaN !== NaN But key(NaN) === key(NaN)"],
]);
console.log(m3); // Map(6) {"s" => "stringValue", {…} => "objectValue", "stringKey" => "coverStringValue", {…} => "objectValue", {…} => "{} !== {}", NaN => "NaN !== NaN But key(NaN) === key(NaN)"}
```

## WeakMap

### 描述
`WeakMap`的`key`只能是`Object`类型，原始数据类型不能作为`key`。`WeakMap`持有的是每个键对象的弱引用，这意味着在没有其他引用存在时垃圾回收能正确进行，`WeakMap`用于映射的`key`只有在其没有被回收时才是有效的，正由于弱引用，`WeakMap`的`key`是不可枚举的，没有方法能给出所有的`key`。  
简单来说，有时需要在某个对象上面存放一些数据，但是这会形成对于这个对象的引用，一旦不再需要这两个对象，我们就必须手动删除这个引用，否则垃圾回收机制无法释放对象占用的内存，`WeakMap`的设计就是解决这个问题的，它的键所引用的对象都是弱引用，垃圾回收机制不将该引用考虑在内，因此，只要所引用的对象的其他引用都被清除，垃圾回收机制就会释放该对象所占用的内存，此时`WeakMap`里边所对应的键值都会消失，不需要手动删除引用。如果需要在对象上添加数据而又不想干扰垃圾回收机制的话，就可以使用`WeakMap`。

### 属性与方法
* `WeakMap.prototype.constructor`: 返回构造函数。
* `WeakMap.prototype.delete(key)`: 移除`key`的关联对象。
* `WeakMap.prototype.get(key)`: 返回`key`关联对象,没有`key`关联对象时返回`undefined`。
* `WeakMap.prototype.has(key)`: 根据是否有`key`关联对象返回一个`Boolean`值。
* `WeakMap.prototype.set(key, value)`: 在`WeakMap`中设置一组`key`关联对象，返回这个 `WeakMap`对象。

### 内存回收实例
```javascript
// WeakMap示例代码
var wm = new WeakMap();
var key = {};
wm.set(key, new Array(6 * 1024 * 1024)); // 存放一个大数组
console.log(wm.get(key)); // (6291456) [empty × 6291456]
key = null;
console.log(wm.get(key)); // undefined
```
```javascript
// WeakMap内存回收实例
/** node --expose-gc **/ // 启动node环境 手动调用垃圾回收机制
global.gc(); // 首先调用一次垃圾回收
process.memoryUsage(); // 查看内存占用 heapUsed约2M
/*
 {
   rss: 21975040,
   heapTotal: 4608000,
   heapUsed: 2454040,
   external: 1384318
 }
*/
var wm = new WeakMap();
var key = {};
wm.set(key, new Array(6 * 1024 * 1024)); // 存放一个大数组
console.log(wm.get(key)); // (6291456) [empty × 6291456]
process.memoryUsage(); // heapUsed约53M
/*
 {
   rss: 73420800,
   heapTotal: 55259136,
   heapUsed: 53060600,
   external: 1384408
 }
*/
global.gc(); // 手动执行一次垃圾回收
process.memoryUsage(); // heapUsed约53M
/*
 {
   rss: 73302016,
   heapTotal: 55259136,
   heapUsed: 52637112,
   external: 1384350
 }
*/
key = null; // 解除引用
global.gc(); // 执行垃圾回收
process.memoryUsage(); // heapUsed约2M 内存已回收
/*
 {
   rss: 23142400,
   heapTotal: 4923392,
   heapUsed: 2674536,
   external: 1384445
 }
*/
console.log(wm.get(key)); // undefined
```
```javascript
// Map示例代码 对比
var m = new Map();
var key = {};
m.set(key, new Array(6 * 1024 * 1024)); // 存放一个大数组
console.log(m.get(key)); // (6291456) [empty × 6291456]
key = null;
console.log(m.get(key)); // undefined
console.log(m); // Map(1) {{…} => Array(6291456)}
m.clear(); // 回收内存
console.log(m); // Map(0) {}
```
```javascript
// Map内存回收实例 对比
/** node --expose-gc **/ // 启动node环境 手动调用垃圾回收机制
global.gc(); // 首先调用一次垃圾回收
process.memoryUsage(); // 查看内存占用 heapUsed约2M
/*
 {
   rss: 21856256,
   heapTotal: 4608000,
   heapUsed: 2460600,
   external: 1384318
 }
*/
var m = new Map();
var key = {};
m.set(key, new Array(6 * 1024 * 1024)); // 存放一个大数组
console.log(m.get(key)); // (6291456) [empty × 6291456]
process.memoryUsage(); // heapUsed约53M
/*
 {
   rss: 73744384,
   heapTotal: 55521280,
   heapUsed: 53703816,
   external: 1384504
 }
*/
global.gc(); // 手动执行一次垃圾回收
process.memoryUsage(); // heapUsed约53M
/*
 {
   rss: 73125888,
   heapTotal: 55521280,
   heapUsed: 53135936,
   external: 1384350
 }
*/
key = null; // 解除引用
global.gc(); // 执行垃圾回收
process.memoryUsage(); // heapUsed约53M 内存未回收
/*
 {
   rss: 73093120,
   heapTotal: 55521280,
   heapUsed: 52960672,
   external: 1384350
 }
*/
console.log(m.get(key)); // undefined // 此处是undefined，这是因为key值的改变，而在这个Map实例对象中依然存在 {} => Array 的键值对，且键值对为强引用，内存未回收
console.log(m); // Map(1) {{…} => Array(6291456)}
m.clear(); // 回收内存
global.gc(); // 执行垃圾回收
process.memoryUsage(); // heapUsed约2M 内存已回收
/*
 {
   rss: 22908928,
   heapTotal: 5185536,
   heapUsed: 2627064,
   external: 1384350
 }
*/
console.log(m); // Map(0) {}
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://blog.csdn.net/c__dreamer/article/details/82182649
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
```
