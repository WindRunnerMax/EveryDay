# Map and WeakMap
The `Map` object is used to store key-value pairs and can remember the original insertion order of the keys. Any object or primitive value can be used as a key or value.  
The `WeakMap` object is also used to store key-value pairs, with the key being a weak reference and must be an object, while the value can be any object or primitive value.

## Map

### Description
The `Map` object is similar to a regular key-value pair `Object` object, also a collection of key-value pairs, but there are some important differences between them:

| Description | Map | Object |
| --- | --- | --- |
| Unexpected keys | By default, a `Map` does not contain any keys, only the keys that have been explicitly inserted. | An `Object` has a prototype, and the keys on the prototype chain may conflict with the keys set on the object. |
| Key types | A key of a `Map` can be any value, including functions, objects, or any primitive type. | The keys of an `Object` must be a `String` or `Symbol`. |
| Key order | The `key` in a `Map` is ordered, when iterated, a `Map` object returns keys and values in the insertion order. | The iteration order of keys in an `Object` depends on the type of the key and the order of creation. |
| Number of key-value pairs | The number of key-value pairs in a `Map` can be easily obtained through the `size` property. | The number of key-value pairs in an `Object` can only be calculated manually. |
| Iteration | `Map` is `iterable`, so it can be directly iterated. | Iterating an `Object` requires obtaining its keys in some way before iterating. |
| Performance | `Map` performs better in scenarios where keys and values are frequently added or removed. | `Object` is unoptimized for scenarios with frequent additions and deletions of key-value pairs. |

Note: Regarding the iteration order of keys in an `Object`, since `ES6`, objects retain the creation order of `String` and `Symbol`. When the created object only has `String` or `Symbol`, the iteration order is the same as the creation order. When both types exist in the object, `String` always comes first. When `String` can be converted to a `Number`, these keys are at the forefront during iteration, and they are iterated in numeric order.

### Properties and Methods
* `Map.prototype.constructor`: Returns the constructor function.
* `Map.prototype.size`: Returns the number of key-value pairs in the `Map` object.
* `Map.prototype.clear()`: Removes all key-value pairs from the `Map` object.
* `Map.prototype.delete(key)`: Removes the element from the `Map` object if it exists and returns `true`; otherwise, returns `false` if the element does not exist.
* `Map.prototype.entries()`: Returns a new `Iterator` object that includes the `[key, value]` array of each element in the `Map` object in insertion order.
* `Map.prototype.forEach(callback[, thisArg])`: Invokes the `callback` function once for each key-value pair in the `Map` object in insertion order. If `thisArg` is provided for `forEach`, it will be used as the `this` value for each callback.
* `Map.prototype.get(key)`: Returns the value corresponding to the key, or `undefined` if it does not exist.
* `Map.prototype.has(key)`: Returns a Boolean indicating whether the `Map` instance contains the value corresponding to the key.
* `Map.prototype.keys()`: Returns a new `Iterator` object that includes the keys of each element in the `Map` object in insertion order.
* `Map.prototype.set(key, value)`: Sets the value of the key in the `Map` object and returns the `Map` object.
* `Map.prototype.values()`: Returns a new `Iterator` object that includes the values of each element in the `Map` object in insertion order.
* `Map.prototype[@@iterator]()`: Returns a new `Iterator` object that includes the `[key, value]` array of each element in the `Map` object in insertion order.

### Examples

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

### Description
The `key` of `WeakMap` can only be of type `Object`, primitive data types cannot be used as `key`. The `WeakMap` holds a weak reference to each key object, which means that garbage collection can be done correctly when there are no other references. The `key` used for mapping in `WeakMap` is only valid when it has not been collected. Due to the weak reference, the `key` of `WeakMap` cannot be enumerated, and there is no method to retrieve all the `key`s.

In simple terms, sometimes it is necessary to store some objects on a particular object, but this will create a reference to that object. Once that object is no longer needed, we must manually remove that reference, otherwise the garbage collection mechanism cannot release the memory occupied by the object. The design of `WeakMap` is to solve this problem. The objects referenced by its keys are all weak references, and the garbage collection mechanism does not consider those references, so as long as the other references to the referenced object are cleared, the garbage collection mechanism will release the memory occupied by the object. At this time, the corresponding key-value pairs in `WeakMap` will disappear, and there is no need to manually delete the reference. If you need to add objects to an object without interfering with the garbage collection mechanism, you can use `WeakMap`.

### Properties and Methods
* `WeakMap.prototype.constructor`: Returns the constructor.
* `WeakMap.prototype.delete(key)`: Removes the associated object of `key`.
* `WeakMap.prototype.get(key)`: Returns the associated object of `key`, and returns `undefined` if there is no associated object for `key`.
* `WeakMap.prototype.has(key)`: Returns a `Boolean` value indicating whether there is an associated object for `key`.
* `WeakMap.prototype.set(key, value)`: Sets a group of key-value pairs in the `WeakMap` and returns the `WeakMap` object.

### Memory Recycling Example 

```javascript
// WeakMap example code
var wm = new WeakMap();
var key = {};
wm.set(key, new Array(6 * 1024 * 1024)); // Store a large array
console.log(wm.get(key)); // (6291456) [empty × 6291456]
key = null;
console.log(wm.get(key)); // undefined
```
```javascript
// WeakMap memory recycling example
/** node --expose-gc **/ // Start the node environment and manually invoke the garbage collection mechanism
global.gc(); // First, trigger the garbage collection
process.memoryUsage(); // View memory usage, heapUsed about 2M
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
wm.set(key, new Array(6 * 1024 * 1024)); // Store a large array
console.log(wm.get(key)); // (6291456) [empty × 6291456]
process.memoryUsage(); // heapUsed about 53M
/*
 {
   rss: 73420800,
   heapTotal: 55259136,
   heapUsed: 53060600,
   external: 1384408
 }
*/
global.gc(); // Manually trigger garbage collection
process.memoryUsage(); // heapUsed about 53M
/*
 {
   rss: 73302016,
   heapTotal: 55259136,
   heapUsed: 52637112,
   external: 1384350
 }
*/
key = null; // Release reference
global.gc(); // Trigger garbage collection
process.memoryUsage(); // heapUsed about 2M, memory recycled
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
// Map example code for comparison
var m = new Map();
var key = {};
m.set(key, new Array(6 * 1024 * 1024)); // Store a large array
console.log(m.get(key)); // (6291456) [empty × 6291456]
key = null;
console.log(m.get(key)); // undefined
console.log(m); // Map(1) {{…} => Array(6291456)}
m.clear(); // Recycle memory
console.log(m); // Map(0) {}
```
```javascript
// Map memory recycling example for comparison
/** node --expose-gc **/ // Start the node environment and manually invoke the garbage collection mechanism
global.gc(); // First, trigger the garbage collection
process.memoryUsage(); // View memory usage, heapUsed about 2M
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
m.set(key, new Array(6 * 1024 * 1024)); // Store a large array
console.log(m.get(key)); // (6291456) [empty × 6291456]
process.memoryUsage(); // heapUsed about 53M
/*
 {
   rss: 73744384,
   heapTotal: 55521280,
   heapUsed: 53703816,
   external: 1384504
 }
*/
global.gc(); // Manually trigger garbage collection
process.memoryUsage(); // heapUsed about 53M
/*
 {
   rss: 73125888,
   heapTotal: 55521280,
   heapUsed: 53135936,
   external: 1384350
 }
*/
key = null; // Release reference
global.gc(); // Trigger garbage collection
process.memoryUsage(); // heapUsed about 53M, memory not recycled
/*
 {
   rss: 73093120,
   heapTotal: 55521280,
   heapUsed: 52960672,
   external: 1384350
 }
*/
console.log(m.get(key)); // undefined // This is undefined because the key value has changed, but in this Map instance object, the {} => Array key-value pair still exists, and it's a strong reference, so memory is not recycled
console.log(m); // Map(1) {{…} => Array(6291456)}
m.clear(); // Recycle memory
global.gc(); // Trigger garbage collection
process.memoryUsage(); // heapUsed about 2M, memory recycled
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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://blog.csdn.net/c__dreamer/article/details/82182649
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
```