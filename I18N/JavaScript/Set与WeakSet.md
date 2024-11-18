# Set and WeakSet
The `Set` object allows for storing unique values of any type, whether they are primitive values or object references. The values in a `Set` object are unique and do not repeat.

The `WeakSet` object allows for storing unique values of object weak references. The values in a `WeakSet` object are also unique and can only store weak references of objects.

## Set
### Description
The `Set` object is a collection of values that allows iterating over its elements in the order of insertion. The elements in a `Set` only appear once, meaning the elements are unique and it is commonly used to remove duplicates from an array.

### Properties and Methods
* `Set.prototype.constructor`: Returns the constructor function.
* `Set.prototype.size`: Returns the number of values in the `Set` object.
* `Set.prototype.add(value)`: Adds an element to the end of the `Set` object and returns the modified `Set` object.
* `Set.prototype.clear()`: Removes all elements from the `Set` object.
* `Set.prototype.delete(value)`: Removes the element from the `Set` that is equal to the specified value.
* `Set.prototype.entries()`: Returns a new iterator object containing the `[value, value]` arrays of all elements in the `Set` object, ordered by insertion, to keep the method similar to `Map` objects where each value's key and value are equal.
* `Set.prototype.forEach(callbackFn[, thisArg])`: Invokes the `callback` for each value in the `Set` object in the order of insertion. If the `thisArg` parameter is provided, `this` in the callback will be that parameter.
* `Set.prototype.has(value)`: Returns a boolean value indicating whether the value exists in the `Set` or not.
* `Set.prototype.keys()`: Returns a new iterator object containing all the values of the `Set` object, ordered by insertion.
* `Set.prototype.values()`: Returns a new iterator object containing all the values of the `Set` object, ordered by insertion.
* `Set.prototype[@@iterator]()`: Returns a new iterator object containing all the values of the `Set` object, ordered by insertion.

### Example

```javascript
var s = new Set([3, 3, 3, 2, 2, 1]);

console.log(s); // Set(3) {3, 2, 1}

s.add(3);
console.log(s); // Set(3) {3, 2, 1}

var setIterator = s[Symbol.iterator]();
console.log(setIterator); // SetIterator {3, 2, 1}

var arr = [3, 3, 3, 2, 2, 1];
arr = [...new Set(arr).keys()]; // Remove duplicates
console.log(arr); // (3) [3, 2, 1]
```

## WeakSet

### Description
The values in a `WeakSet` can only be of type `Object`, holding weak references to objects. Primitive data types cannot be used as values. `WeakSet` holds weak references to objects, meaning that garbage collection can be performed correctly when there are no other references. The references stored in a `WeakSet` are only valid as long as the referenced objects have not been collected, and due to weak references, `WeakSet` is not enumerable.  
In simple terms, there are times when we need to store some objects on an array, but this would create a reference to the object. Once the object is no longer needed, we would have to manually remove the reference, otherwise the garbage collection mechanism would not release the memory occupied by the object. The design of `WeakSet` resolves this issue as the referenced objects are weakly referenced, meaning the garbage collection mechanism does not consider these references, so as long as all the other references to the referenced objects are cleared, the garbage collection mechanism will release the memory occupied by the object and the corresponding object reference in the `WeakSet` will disappear without the need for manual reference deletion. If there is a need to add objects to an array without interfering with the garbage collection mechanism, `WeakSet` can be used. Additionally, `WeakSet` is particularly suitable for tracking object references, especially when dealing with a large number of objects.

### Properties and Methods
* `WeakSet.prototype.constructor`: Returns the constructor function.
* `WeakSet.prototype.add(value)`:  Adds a new element `value` to this `WeakSet` object.
* `WeakSet.prototype.delete(value)`: Deletes the element `value` from this `WeakSet` object.
* `WeakSet.prototype.has(value)`: Returns a boolean value indicating whether the given value `value` exists in this `WeakSet`.

### Memory Recovery Example
```javascript
// WeakSet Example Code
var ws = new WeakSet();
var value = new Array(6 * 1024 * 1024);  // Allocate a large array
ws.add(value);
console.log(ws.has(value)); // true
value = null; // Release reference
console.log(ws.has(value)); // false
```
```javascript
// WeakSet Memory Recovery Example
/** node --expose-gc **/ // Start node environment, manually call garbage collection
global.gc(); // First call garbage collection
process.memoryUsage(); // Check memory usage, heapUsed is about 2M
/*
 {
   rss: 20918272,
   heapTotal: 4608000,
   heapUsed: 2454576,
   external: 1384318
 }
*/
var ws = new WeakSet();
var value = new Array(6 * 1024 * 1024); // Allocate a large array 
ws.add(value);
console.log(ws.has(value)); // true
process.memoryUsage(); // heapUsed is about 53M
/*
 {
   rss: 74158080,
   heapTotal: 55259136,
   heapUsed: 53717760,
   external: 1384490
 }
*/
global.gc(); // Manually trigger garbage collection
process.memoryUsage(); // heapUsed is about 53M
/*
 {
   rss: 73695232,
   heapTotal: 55259136,
   heapUsed: 53345008,
   external: 1384414
 }
*/
value = null; // Release reference
global.gc(); // Trigger garbage collection
process.memoryUsage(); // heapUsed is about 2M, memory has been recovered
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
// Set Example Code for Comparison
var s = new Set();
var value = new Array(6 * 1024 * 1024); // Allocate a large array
s.add(value);
console.log(s.has(value)); // true
value = null; // Release reference
console.log(s.has(value)); // false
console.log(s); // Set(1) {Array(6291456)}
s.clear(); // Memory cleanup
console.log(s); // Set(0) {}
```
```javascript
// Set Memory Recovery Example for Comparison
/** node --expose-gc **/ // Start node environment, manually call garbage collection
global.gc(); // First call garbage collection
process.memoryUsage(); // Check memory usage, heapUsed is about 2M
/*
 {
   rss: 22994944,
   heapTotal: 5185536,
   heapUsed: 2695768,
   external: 1384350
 }
*/
var s = new Set();
var value = new Array(6 * 1024 * 1024); // Allocate a large array 
s.add(value);
console.log(s.has(value)); // true
process.memoryUsage(); // heapUsed is about 53M
/*
 {
   rss: 73793536,
   heapTotal: 55521280,
   heapUsed: 53478848,
   external: 1384507
 }
*/
global.gc(); // Manually trigger garbage collection
process.memoryUsage(); // heapUsed is about 53M
/*
 {
   rss: 73367552,
   heapTotal: 55521280,
   heapUsed: 53068448,
   external: 1384350
 }
*/
value = null; // Release reference
global.gc(); // Trigger garbage collection
process.memoryUsage(); // heapUsed is about 53M, memory not recovered
/*
 {
   rss: 73437184,
   heapTotal: 55521280,
   heapUsed: 53091072,
   external: 1384384
 }
*/
console.log(s.has(value)); // false // This is false because the value has changed, but it still has a strong reference to the Array in this Set instance, and the memory hasn't been recovered
console.log(s); // Set(1) {Array(6291456)}
s.clear(); // Memory cleanup
global.gc(); // Trigger garbage collection
process.memoryUsage(); // heapUsed is about 2M, memory recovered
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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.cnblogs.com/pengaijin/p/7659672.html
https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Set
https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/WeakSet
```