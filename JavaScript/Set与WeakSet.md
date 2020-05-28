# Set与WeakSet
`Set`对象允许存储任何类型的唯一值，无论是原始值或者是对象引用，`Set`对象中的值不会重复。  
`WeakSet`对象允许存储对象弱引用的唯一值，`WeakSet`对象中的值同样不会重复，且只能保存对象的弱引用。

## Set
### 描述
`Set`对象是值的集合，可以按照插入的顺序迭代它的元素，`Set`中的元素只会出现一次，即`Set`中的元素是唯一的，常用来作数组去重。

### 属性与方法
* `Set.prototype.constructor`: 返回构造函数。
* `Set.prototype.size`: 返回`Set`对象的值的个数。
* `Set.prototype.add(value)`: 在`Set`对象尾部添加一个元素，返回该`Set`对象。
* `Set.prototype.clear()`: 移除`Set`对象内的所有元素。
* `Set.prototype.delete(value)`: 移除`Set`的中与这个值相等的元素。
* `Set.prototype.entries()`: 返回一个新的迭代器对象，该对象包含`Set`对象中的按插入顺序排列的所有元素的值的`[value, value]`数组，为了使这个方法和`Map`对象保持相似， 每个值的键和值相等。
* `Set.prototype.forEach(callbackFn[, thisArg])`: 按照插入顺序，为`Set`对象中的每一个值调用一次`callback`，如果提供了`thisArg`参数，回调中的`this`会是这个参数。
* `Set.prototype.has(value)`: 返回一个布尔值，表示该值在`Set`中存在与否。
* `Set.prototype.keys()`: 返回一个新的迭代器对象，该对象包含`Set`对象中的按插入顺序排列的所有元素的值。
* `Set.prototype.values()`: 返回一个新的迭代器对象，该对象包含`Set`对象中的按插入顺序排列的所有元素的值。
* `Set.prototype[@@iterator]()`: 返回一个新的迭代器对象，该对象包含`Set`对象中的按插入顺序排列的所有元素的值。

### 示例

```javascript
var s = new Set([3, 3, 3, 2, 2, 1]);

console.log(s); // Set(3) {3, 2, 1}

s.add(3);
console.log(s); // Set(3) {3, 2, 1}

var setIterator = s[Symbol.iterator]();
console.log(setIterator); // SetIterator {3, 2, 1}

var arr = [3, 3, 3, 2, 2, 1];
arr = [...new Set(arr).keys()]; // 去重
console.log(arr); // (3) [3, 2, 1]
```
## WeakSet

### 描述
`WeakSet`的值只能是`Object`类型，持有的是`Object`弱引用，原始数据类型不能作为值。`WeakSet`持有的是对象的弱引用，这意味着在没有其他引用存在时垃圾回收能正确进行，`WeakSet`用于存储的对象引用只有在其没有被回收时才是有效的，正由于弱引用，`WeakSet`是不可枚举的。  
简单来说，有时需要在某个数组上面存放一些对象，但是这会形成对于这个对象的引用，一旦不再需要这个对象，我们就必须手动删除这个引用，否则垃圾回收机制无法释放对象占用的内存，`WeakSet`的设计就是解决这个问题的，其所引用的对象都是弱引用，垃圾回收机制不将该引用考虑在内，因此，只要所引用的对象的其他引用都被清除，垃圾回收机制就会释放该对象所占用的内存，此时`WeakSet`里边所对应的对象引用会消失，不需要手动删除引用。如果需要在数组上添加对象而又不想干扰垃圾回收机制的话，就可以使用`WeakSet`，此外`WeakSet`非常适合于对象引用的跟踪，尤其是在涉及大量对象时。

### 属性与方法
* `WeakSet.prototype.constructor`: 返回构造函数。
* `WeakSet.prototype.add(value)`:  在该`WeakSet`对象中添加一个新元素`value`。
* `WeakSet.prototype.delete(value)`: 从该`WeakSet`对象中删除`value`这个元素。
* `WeakSet.prototype.has(value)`: 返回一个布尔值, 表示给定的值`value`是否存在于这个 `WeakSet`中.

### 内存回收实例
```javascript
// WeakSet示例代码
var ws = new WeakSet();
var value = new Array(6 * 1024 * 1024);  // 开辟一个大数组 
ws.add(value);
console.log(ws.has(value)); // true
value = null; // 解除引用
console.log(ws.has(value)); // false
```
```javascript
// WeakSet内存回收实例
/** node --expose-gc **/ // 启动node环境 手动调用垃圾回收机制
global.gc(); // 首先调用一次垃圾回收
process.memoryUsage(); // 查看内存占用 heapUsed约2M
/*
 {
   rss: 20918272,
   heapTotal: 4608000,
   heapUsed: 2454576,
   external: 1384318
 }
*/
var ws = new WeakSet();
var value = new Array(6 * 1024 * 1024); // 开辟一个大数组 
ws.add(value);
console.log(ws.has(value)); // true
process.memoryUsage(); // heapUsed约53M
/*
 {
   rss: 74158080,
   heapTotal: 55259136,
   heapUsed: 53717760,
   external: 1384490
 }
*/
global.gc(); // 手动执行一次垃圾回收
process.memoryUsage(); // heapUsed约53M
/*
 {
   rss: 73695232,
   heapTotal: 55259136,
   heapUsed: 53345008,
   external: 1384414
 }
*/
value = null; // 解除引用
global.gc(); // 执行垃圾回收
process.memoryUsage(); // heapUsed约2M 内存已回收
/*
 {
   rss: 23035904,
   heapTotal: 5185536,
   heapUsed: 2716856,
   external: 1384417
 }
*/
console.log(ws.has(value)); // false
```
```javascript
// Set示例代码 对比
var s = new Set();
var value = new Array(6 * 1024 * 1024); // 开辟一个大数组 
s.add(value);
console.log(s.has(value)); // true
value = null; // 解除引用
console.log(s.has(value)); // false
console.log(s); // Set(1) {Array(6291456)}
s.clear(); // 回收内存
console.log(s); // Set(0) {}
```
```javascript
// Set内存回收实例 对比
/** node --expose-gc **/ // 启动node环境 手动调用垃圾回收机制
global.gc(); // 首先调用一次垃圾回收
process.memoryUsage(); // 查看内存占用 heapUsed约2M
/*
 {
   rss: 22994944,
   heapTotal: 5185536,
   heapUsed: 2695768,
   external: 1384350
 }
*/
var s = new Set();
var value = new Array(6 * 1024 * 1024); // 开辟一个大数组 
s.add(value);
console.log(s.has(value)); // true
process.memoryUsage(); // heapUsed约53M
/*
 {
   rss: 73793536,
   heapTotal: 55521280,
   heapUsed: 53478848,
   external: 1384507
 }
*/
global.gc(); // 手动执行一次垃圾回收
process.memoryUsage(); // heapUsed约53M
/*
 {
   rss: 73367552,
   heapTotal: 55521280,
   heapUsed: 53068448,
   external: 1384350
 }
*/
value = null; // 解除引用
global.gc(); // 执行垃圾回收
process.memoryUsage(); // heapUsed约53M 内存未回收
/*
 {
   rss: 73437184,
   heapTotal: 55521280,
   heapUsed: 53091072,
   external: 1384384
 }
*/
console.log(s.has(value)); // false // 此处为false，这是因为value值的改变，而在这个Set实例对象中依然存在对 Array 的强引用，内存未回收
console.log(s); // Set(1) {Array(6291456)}
s.clear(); // 回收内存
global.gc(); // 执行垃圾回收
process.memoryUsage(); // heapUsed约2M 内存已回收
/*
 {
   rss: 23142400,
   heapTotal: 5185536,
   heapUsed: 2769320,
   external: 1384441
 }
*/
console.log(s); // Set(0) {}
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.cnblogs.com/pengaijin/p/7659672.html
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
```
