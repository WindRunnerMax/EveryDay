# Array object in JavaScript
The `Array` object in `JavaScript` is a global object used to construct arrays, which are high-level objects similar to lists.

## Description
In `JavaScript`, arrays can typically be created using the `Array` constructor or literal notation.

```javascript
console.log(Array(3)); // (3) [empty × 3]
console.log(new Array(3)); // (3) [empty × 3]
console.log([,,,]); // (3) [empty × 3]
```
In `JavaScript`, arrays exist in the form of sparse arrays, and can be thought of as special objects that can be sorted according to index values. Therefore, when there are no values at certain positions, it's necessary to use a certain value to fill them. Of course, sparse arrays are optimized in various browsers. For example, the `V8` engine has operations to convert between fast arrays and slow arrays. In addition, in `V8`, the description of `empty` is a reference to an empty object. When creating arrays using the `Array` constructor in `Js`, the issue of existence of empty slots is not filled by default with `undefined`, but with `empty` as the value. It's important to note that an empty slot is not `undefined`. `Undefined` means it's not defined, but `undefined` itself is a primitive data type, a value, while `empty` means that there is no value at that location. Furthermore, the treatment of empty slots in `ES6` and `ES6` is different, so some methods will skip `empty`, while others will treat `empty` as `undefined`. Therefore, it's best to avoid empty slots.

```javascript
console.log([,,,]); // (3) [empty × 3]
console.log(new Array(3)); // (3) [empty × 3]
console.log([undefined, undefined, undefined]); // (3) [undefined, undefined, undefined]
console.log(0 in [undefined, undefined, undefined]); // true
console.log(0 in [,,,]); // false // in checks the index, it means the position 0 has no value
```

## Properties
* `Array.length`: `length` is an instance property of `Array`, which returns or sets the number of elements in an array. The value is an unsigned 32-bit integer, ranging from `0` to `2^32-1`, and is always greater than the highest index of the array item. By setting the value of the `length` property, it's possible to truncate any array. When extending an array by changing the value of the `length` property, the actual number of elements will increase. If the value passed in exceeds a valid value, a `RangeError` exception will be thrown. Additionally, if the index in the array is set to `-1` or a string, the `length` of the array will not change, and these indices in the array will be treated as object properties. In fact, an array is a collection of data that can be sorted by index values, is a special type of object.
* `Array.prototype[@@unscopables]`: The `Symbol` property `@@unscopable` contains all property names newly defined in `ES2015 (ES6)` and not included in earlier `ECMAScript` standards. These properties are excluded from the environment bound by the `with` statement, preventing certain array methods from being added to the scope of the `with` statement. Use `Array.prototype[Symbol.unscopables]` to see the array default properties not included in the `with` binding.

## Methods

### Array.from()
`Array.from(arrayLike[, mapFn[, thisArg]])`  
`arrayLike`: The pseudo-array object or iterable object to be converted into an array.  
`mapFn`: Optional. If specified, this callback function will be executed for each element in the new array.  
`thisArg`: Optional. The `this` object when executing the callback function `mapFn`.  
The `Array.from()` method creates a new array instance from an array-like or iterable object.

```javascript
console.log(Array.from("123")); // (3) ["1", "2", "3"]
console.log(Array.from([,,,])); // (3) [undefined, undefined, undefined] // Treats empty as undefined
console.log(Array.from({length: 3})); // (3) [undefined, undefined, undefined]
```

### Array.isArray()
`Array.isArray(obj)`  
`Array.isArray()` is used to determine whether the value passed is an `Array`.

```javascript
console.log(Array.isArray([])); // true
console.log(Array.isArray(Array())); // true
console.log(Array.isArray(new Array())); // true
console.log(Array.isArray(new Uint8Array(32))); // false
console.log(Array.isArray(Array.prototype)); // true // Array.prototype is an array
console.log(Array.isArray({ __proto__: Array.prototype })); // false // Does not check the prototype chain, different from instanceof

/**
Polyfill
  if (!Array.isArray) {
    Array.isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }
*/
```

### Array.of()
`Array.of(element0[, element1[, ...[, elementN]]])`  
`elementN`: Any number of arguments that will become elements in the returned array.
The `Array.of()` method creates a new array instance with a variable number of arguments, regardless of the quantity or type of the arguments. The difference between `Array.of()` and the `Array` constructor lies in the handling of integer parameters. For example, `Array.of(7)` creates an array with a single element `7`, while `Array(7)` creates an empty array with a length of `7`.

```javascript
console.log(Array.of(1));         // [1]
console.log(Array.of(1, 2, 3));   // (3) [1, 2, 3]
console.log(Array.of(undefined)); // [undefined]
```

### Array.prototype.concat()
`var new_array = old_array.concat(value1[, value2[, ...[, valueN]]])`  
The `valueN` is optional and is used to connect arrays and/or values into a new array. If the `valueN` parameters is omitted, `concat` will return a shallow copy of the existing array it was called on. 
The `concat()` method is used to merge two or more arrays, and does not change the existing arrays, but returns a new array.

```javascript
var arr1 = [1, 2, 3];
var arr2 = [4, 5, 6];
var arr3 = arr1.concat(arr2);

console.log(arr3); // [1, 2, 3, 4, 5, 6]
console.log(arr1); // [1, 2, 3] // Does not change the original array
```

### Array.prototype.copyWithin()
`arr.copyWithin(target[, start[, end]])`  
`target` is the index to copy the sequence to, using 0 as the base. If it is negative, `target` will be counted from the end. If `target` is greater than or equal to the length of `arr`, no copying will take place. If `target` is after `start`, the sequence will be modified to fit `arr.length`.  
`start` is the index to start copying elements from, using 0 as the base. If it is negative, `start` will be counted from the end, and if omitted, `copyWithin` will start from the beginning (0).  
`end` is the index to end copying elements to, excluding the element at `end`. If it is negative, `end` will be counted from the end. If omitted, `copyWithin` will copy until the end of the array, defaulting to `arr.length`.  
The `copyWithin()` method shallow copies a part of an array to another location in the same array and returns it, without changing the length of the original array.

```javascript
var arr = [1, 2, 3, 4, 5, 6];
console.log(arr.copyWithin(0, 2, 5)); // [3, 4, 5, 4, 5, 6] // Shallow copies values from index 2 to 5 to the position with index 0
console.log(arr); // [3, 4, 5, 4, 5, 6] // Modifies the original array without changing its length
```

### Array.prototype.entries()
`arr.entries()`  
The `entries()` method returns a new `Array Iterator` object containing key/value pairs for each index in the array. The prototype `__proto__:Array Iterator` of the `Array Iterator` object has a `next` method that can be used to iterate and retrieve the `[key, value]` of the original array.   

```javascript
var arr = ['a', 'b', 'c'];
console.log(arr.entries().next().value); // [0, "a"]
console.log(arr); // ["a", "b", "c"] // Does not change the original array
```

### Array.prototype.every()
`arr.every(callback[, thisArg])`  
The `callback` is a function to test for each element in the array, which takes one to three arguments.  
`currentValue` is the current element being processed in the array.  
`index` is optional, the index of the current element being processed in the array.  
`array` is optional, the array `every` was called upon.  
`thisArg` is optional and is used as `this` when executing the `callback` function. If an arrow function expression is used to pass in `callback`, the `thisArg` parameter will be ignored, as arrow functions are lexically bound to their `this` value.  
The `every()` method tests whether all elements in the array pass the test implemented by the provided function, and it returns a Boolean value.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.every( currentValue => currentValue > 1)) // false
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### Array.prototype.fill()
`arr.fill(value[, start[, end]])`  
`value` is the value to fill the elements of the array with.  
`start` is optional, the index to start filling the array with, defaulting to `0`.  
`end` is optional, the index to end filling the array, defaulting to `this.length`.  
The `fill()` method fills all the elements of an array from a start index to an end index with a static value, excluding the end index.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.fill(0, 0, 5)); // [0, 0, 0, 0, 0]
console.log(arr); // [0, 0, 0, 0, 0] // Modifies the original array
```

### Array.prototype.filter()
`arr.filter(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is a function to test for each element in the array, which takes one to three arguments.  
`currentValue` is the current element being processed in the array.  
`index` is optional, the index of the current element being processed in the array.  
`array` is optional, the array `filter` was called upon.  
`thisArg` is optional and is used as `this` when executing the `callback` function. If an arrow function expression is used to pass in `callback`, the `thisArg` parameter will be ignored, as arrow functions are lexically bound to their `this` value.  
The `filter()` method creates a new array with all elements that pass the test implemented by the provided function.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.filter( currentValue => currentValue > 2 )); // [3, 4, 5]
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

```markdown
### Array.prototype.find()
`arr.find(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is a function executed for each element in the array, receiving one to three arguments.  
`currentValue` is the current element being processed in the array.  
`index` is an optional parameter representing the index of the current element being processed in the array.  
`array` is an optional parameter representing the array being operated on.  
`thisArg` is an optional parameter used as the `this` value when executing the `callback` function. It's worth noting that if an arrow function expression is used to pass in the `callback`, the `thisArg` parameter will be ignored, as arrow functions lexically bind the `this` value.  
The `find()` method returns the value of the first element in the array that satisfies the provided testing function, otherwise it returns `undefined`.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.find( currentValue => currentValue > 2 )); // 3
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### Array.prototype.findIndex()
`arr.findIndex(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is a function executed for each element in the array, receiving one to three arguments.  
`currentValue` is the current element being processed in the array.  
`index` is an optional parameter representing the index of the current element being processed in the array.  
`array` is an optional parameter representing the array being operated on.  
`thisArg` is an optional parameter used as the `this` value when executing the `callback` function. It's worth noting that if an arrow function expression is used to pass in the `callback`, the `thisArg` parameter will be ignored, as arrow functions lexically bind the `this` value.  
The `findIndex()` method returns the index of the first element in the array that satisfies the provided testing function, otherwise it returns `-1`.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.findIndex( currentValue => currentValue > 2 )); // 2
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### Array.prototype.flat()
`var newArray = arr.flat([depth])`  
`depth` is an optional parameter that specifies the depth of nesting to flatten. The default value is 1.  
The `flat()` method recursively flattens the array to the specified depth and returns a new array with all elements and elements of sub-arrays merged into it.

```javascript
var arr = [1, 2, [3, 4, [5]]];
console.log(arr.flat(2)); // [1, 2, 3, 4, 5]
console.log(arr); // [1, 2, [3, 4, [5]]] // Does not change the original array
```

### Array.prototype.flatMap()
`arr.flatMap(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is a function executed for each element in the array, receiving one to three arguments.  
`currentValue` is the current element being processed in the array.  
`index` is an optional parameter representing the index of the current element being processed in the array.  
`array` is an optional parameter representing the array being called upon by `map`.  
`thisArg` is an optional parameter used as the `this` value when executing the `callback` function. It's worth noting that if an arrow function expression is used to pass in the `callback`, the `thisArg` parameter will be ignored, as arrow functions lexically bind the `this` value.  
The `flatMap()` method first maps each element using a mapping function, then flattens the result into a new array. It's almost identical to `map` followed by a depth of `1` `flat`, but `flatMap` is generally slightly more efficient in some cases when combining into one method.

```javascript
var arr = [[1], [2], [3], [4], [5]];
console.log(arr.flatMap( currentValue => currentValue *2 )); // [2, 4, 6, 8, 10] // First calls the mapping function, then flattens into a new array
console.log(arr); // [[1], [2], [3], [4], [5]] // Does not change the original array
```

### Array.prototype.forEach()
`arr.forEach(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is a function executed for each element in the array, receiving one to three arguments.  
`currentValue` is the current element being processed in the array.  
`index` is an optional parameter representing the index of the current element being processed in the array.  
`array` is an optional parameter representing the array being operated on.  
`thisArg` is an optional parameter used as the `this` value when executing the `callback` function. It's worth noting that if an arrow function expression is used to pass in the `callback`, the `thisArg` parameter will be ignored, as arrow functions lexically bind the `this` value.  
The `forEach()` method executes the given function once for each element in the array.  
Note that if you want to end the iteration before it's completed, `forEach` is not the best choice as compared to `map`.
```

```javascript
var arr = [1, 2, 3, 4, 5];
var obj = { a: 1 }; // Defined obj for demonstration of 'this'
arr.forEach( function(currentValue,index,array) {
    console.log("Current value",currentValue);
    console.log("Current value index",index);
    console.log("Current processing array",array);
    console.log("Current this reference",this);
    console.log("End of one callback, no need to return a value");
    console.log("");
},obj);
/*
    Current value 1
    Current value index 0
    Current processing array (5)[1, 2, 3, 4, 5]
    Current this reference {a: 1}
    End of one callback, no need to return a value
    
    Current value 2
    Current value index 1
    Current processing array (5)[1, 2, 3, 4, 5]
    Current this reference {a: 1}
    End of one callback, no need to return a value
    
    ...........
*/
console.log(arr); // [1, 2, 3, 4, 5] // Original array remains unchanged
```

### Array.prototype.includes()
`arr.includes(valueToFind[, fromIndex])`  
`valueToFind` - The value to search for.  
`fromIndex` - Optional. The position in the array at which to begin searching for `valueToFind`. If negative, it's an offset from the end of `array.length + fromIndex`, even if fromIndex is greater than `array.length`. If omitted, `fromIndex` is set to `0`.  
The `includes()` method determines whether an array includes a certain value among its entries, returning `true` or `false` as appropriate.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.includes(2)); // true
console.log(arr); // [1, 2, 3, 4, 5] // Original array remains unchanged
```

### Array.prototype.indexOf()
`arr.indexOf(searchElement[, fromIndex])`  
`searchElement` - The element to search for within the array.  
`fromIndex` - Optional. The starting index at which to begin the search for `valueToFind`. If the index is negative, it is taken as the offset from the end of the array `array.length + fromIndex`. The default is `0`.  
The `indexOf()` method returns the first index at which a given element can be found in the array, or -1 if it is not present.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.indexOf(2)); // 1
console.log(arr); // [1, 2, 3, 4, 5] // Original array remains unchanged
```

### Array.prototype.join()
`arr.join([separator])`  
`separator` - Optional. A string used to separate one element of the array from the next in the resulting string. If omitted, the array elements are separated with a comma.  
The `join()` method joins all the elements of an array (or an array-like object) into a string and returns the string. If the array has only one item, then that item will be returned without using the separator.

```javascript
var arr = ['a', 'b', 'c'];
console.log(arr.join('&')); // a&b&c
console.log(arr); // ["a", "b", "c"] // Original array remains unchanged
```


### Array.prototype.keys()
`arr.keys()`  
The `keys()` method returns an array iterator object with the keys of the array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.keys().next().value); // 0
console.log(arr); // [1, 2, 3, 4, 5] // Original array remains unchanged
```

### Array.prototype.lastIndexOf()
`arr.lastIndexOf(searchElement[, fromIndex])`  
`searchElement` - The element to locate in the array.  
`fromIndex` - Optional. The index at which to start the search in reverse. Defaults to `arr.length - 1`. If the index is greater than or equal to the array's length, -1 is returned, and the array is not searched. If negative, it is taken as the offset from the end of the array. If the absolute value of `fromIndex` is greater than the length of the array, the entire array will be searched.  
The `lastIndexOf()` method returns the last index at which a given element can be found in the array, or -1 if it is not present. The array is searched backwards, starting at `fromIndex`.

```javascript
var arr = [1, 2, 3, 2, 1];
console.log(arr.lastIndexOf(2)); // 3
console.log(arr); // [1, 2, 3, 2, 1] // Original array remains unchanged
```

### Array.prototype.map()
`arr.map(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` - Function that produces an element of the new Array, taking three arguments:  
`currentValue` - The current element being processed in the array.  
`index` - Optional. The index of the current element being processed in the array.  
`array` - Optional. The array map was called upon.  
`thisArg` - Optional. Value to use as `this` when executing `callback`, if a function is used. Notice that if an arrow function is used as `callback`, `thisArg` is ignored, as arrow functions do not have their own bindings of `this`.  
The `map()` method creates a new array populated with the results of calling a provided function on every element in the calling array.

```javascript
var arr = [1, 2, 3, 4, 5];
var obj = { a: 1 }; // Define obj for demonstrating the use of this
var newArr = arr.map( function(currentValue,index,array) {
    console.log("Current value",currentValue);
    console.log("Current value index",index);
    console.log("Current array being processed",array);
    console.log("Current this pointer",this);
    console.log("");
    return currentValue + 10; // Return the arr value plus 10 to form a new array
},obj);
console.log(newArr); // [11, 12, 13, 14, 15]
/*
    Current value 1
    Current value index 0
    Current array being processed [1, 2, 3, 4, 5]
    Current this pointer {a: 1}
    
    Current value 2
    Current value index 1
    Current array being processed [1, 2, 3, 4, 5]
    Current this pointer {a: 1}
    
    ...........
*/
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### Array.prototype.pop()
`arr.pop()`  
The `pop()` method removes the last element from an array and returns its value. When the array is empty, it returns `undefined`. This method changes the length of the array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.pop()); // 5
console.log(arr); // [1, 2, 3, 4] // Modifies the original array
```

### Array.prototype.push()
`arr.push(element1[, ..., elementN])`  
`elementN` - The elements to add to the end of the array.  
The `push()` method adds one or more elements to the end of an array and returns the new length of the array.

```javascript
var arr = ['a', 'b', 'c', 'd', 'e'];
console.log(arr.push('f','g')); // 7
console.log(arr); // ["a", "b", "c", "d", "e", "f", "g"] // Modifies the original array
```

### Array.prototype.reduce()
`arr.reduce(callback(accumulator, currentValue[, index[, array]])[, initialValue])`  
`callback` - A function that executes on each value in the array (excluding the first value if no `initialValue` is provided), taking between two and four arguments.  
`accumulator` - The accumulated value of the callback's return values. It is the accumulated value returned by the last call to the callback, or `initialValue`.  
`currentValue` - The current element being processed in the array.  
`index` - Optional. The index of the current element being processed in the array. If an `initialValue` is provided, the index starts at 0; otherwise, it starts at 1.  
`array` - Optional. The array `reduce()` was called upon.  
`initialValue` - Optional. The initial value to use as the first argument when calling the `callback` function. If no initial value is provided, the first element in the array will be used. Calling `reduce` on an empty array without an initial value will result in an error.  
The `reduce()` method applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.reduce((accumulator,currentValue) => accumulator+currentValue , 5)); // 20 // 5 + 1 + 2 + 3 + 4 + 5
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### Array.prototype.reduceRight()
`arr.reduceRight(callback(accumulator, currentValue[, index[, array]])[, initialValue])`  
`callback` - A function that executes on each value in the array, taking between two and four arguments.  
`accumulator` - The accumulated value of the callback's return values. It is the accumulated value returned by the last call to the callback, or `initialValue`.  
`currentValue` - The current element being processed in the array.  
`index` - Optional. The index of the current element being processed in the array. If an `initialValue` is provided, the index starts at 0; otherwise, it starts at 1.  
`array` - Optional. The array `reduce()` was called upon.  
`initialValue` - Optional. The initial value of the accumulator `accumulator` when the `callback` function is called the first time. If not provided, the last element in the array will be used, skipping that element. Calling `reduce` on an empty array without an initial value will result in an error.  
The `reduceRight()` method reduces the array to a single value from right to left using a function as an accumulator.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.reduceRight((accumulator,currentValue) => accumulator+currentValue , 5)); // 20 // 5 + 5 + 4 + 3 + 2 + 1
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### Array.prototype.reverse()
`arr.reverse()`  
The `reverse()` method reverses the order of the elements in an array and returns the array. This method changes the original array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.reverse()); // [5, 4, 3, 2, 1]
console.log(arr); // [5, 4, 3, 2, 1] // Modifies the original array
```

### Array.prototype.shift()
`arr.shift()`  
The `shift()` method removes the first element from an array and returns that element. This method changes the original array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.shift()); // 1
console.log(arr); // [2, 3, 4, 5] // Original array altered
```
### Array.prototype.slice()
`arr.slice([begin[, end]])`  
`begin` Optional The starting index to extract, from where the original array elements begin to be extracted. If this parameter is negative, it represents extracting from the last element of the original array. If `begin` is omitted, `slice` begins from index `0`. If `begin` is greater than the length of the original array, an empty array will be returned.  
`end` Optional The ending index to extract, where the extraction of original array elements ends. `slice` extracts all elements from the index `begin` to `end`, including `begin`, but not including `end`. If `end` is omitted, `slice` continues to extract to the end of the original array. If `end` is greater than the length of the array, `slice` continues to extract to the end of the original array.  
The `slice()` method returns a new array object, which is a shallow copy of the original array determined by `begin` and `end`, includes `begin` but not includes `end`, the original array remains unchanged.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.slice(1, -2)); // [2, 3]
console.log(arr); // [1, 2, 3, 4, 5] // Original array remains unchanged
```

### Array.prototype.some()
`arr.some(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` A function executed for each element in the array, this function takes one to three parameters.  
`currentValue` The current element being processed in the array.  
`index` Optional The index of the current element being processed in the array.  
`array` Optional The array being operated on.  
`thisArg` Optional The value used as `this` when executing the `callback` function, note that if an arrow function expression is used to pass in `callback`, the `thisArg` parameter is ignored because arrow functions bind the `this` value lexically.  
The `some()` method tests whether at least one element in the array passes the test provided by the function, it returns a boolean value.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.some( currentValue => currentValue > 1)) // true
console.log(arr); // [1, 2, 3, 4, 5] // Original array remains unchanged
```

### Array.prototype.sort()
`arr.sort([compareFunction])`  
`compareFunction` Optional A function that specifies the order in which to sort. If omitted, elements are sorted according to the `Unicode` code points of their string representations.  
`firstEl` The first element for comparison.  
`secondEl` The second element for comparison.  
The `sort()` method sorts the elements of an array in place and returns the array. The default sort order is built upon converting the elements into strings, then comparing their sequence of `UTF-16` code unit values.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.sort( (a,b) =>  b - a)) // [5, 4, 3, 2, 1]
console.log(arr); // [5, 4, 3, 2, 1] // Original array altered
```

### Array.prototype.splice()
`array.splice(start[, deleteCount[, item1[, item2[, ...]]]])`  
`start` Specifies the starting point of the modification, if it exceeds the length of the array, contents will be added from the end of the array; if it is negative, it indicates the position from the end of the array (counting from `-1`, which means `-n` is the `n`th element from the end and equivalent to `array.length-n`); if the absolute value of the negative number is greater than the length of the array, the starting position is the `0`th position.  
`deleteCount` Optional An integer that specifies the number of array elements to remove. If `deleteCount` is greater than the total number of elements after `start`, all elements after `start` (including the element at `start`) will be deleted. If `deleteCount` is omitted or its value is greater than or equal to `array.length - start` (i.e., if it is greater than or equal to the number of elements after `start`), all elements after `start` in the array will be deleted.  
`item1, item2, ...` Optional Elements to be added to the array, starting from the `start` position. If not specified, `splice()` will only delete array elements.  
The `splice()` method modifies the array by deleting or replacing existing elements or adding new elements in place, and returns the modified content as an array. This method will change the original array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.splice(1, 1)); // [2]
console.log(arr); // [1, 3, 4, 5] // Original array altered
```

### Array.prototype.toLocaleString()
`arr.toLocaleString([locales[,options]])`  
`locales` Optional A string or an array of strings with `BCP 47` language tags.  
`options` An object with properties that configure its behavior.
`toLocaleString()` returns a string representing the elements of the array. The elements in the array are converted to strings using their own `toLocaleString` method, and these strings are separated by a locale-specific string.

```javascript
var arr = [1, 'a', new Date('21 Dec 1997 14:12:00 UTC')];
console.log(arr.toLocaleString('en', {timeZone: "UTC"})); // 1,a,12/21/1997, 2:12:00 PM
console.log(arr); // [1, "a", Sun Dec 21 1997 22:12:00 GMT+0800 (中国标准时间)] // Original array remains unchanged
```

### Array.prototype.toString()
`arr.toString()`  
`toString()` returns a string that represents the specified array and its elements.

```javascript
var arr = [1, 'a', new Date('21 Dec 1997 14:12:00 UTC')];
console.log(arr.toString()); // 1,a,Sun Dec 21 1997 22:12:00 GMT+0800 (中国标准时间)
console.log(arr); // [1, "a", Sun Dec 21 1997 22:12:00 GMT+0800 (中国标准时间)] // Doesn't change the original array
```

### Array.prototype.unshift()
`arr.unshift(element1[, ..., elementN])`  
`elementN` is the element or elements to add to the beginning of the array.  
The `unshift()` method adds one or more elements to the beginning of an array and returns the new length of the array, modifying the original array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.unshift(-1, 0)); // 7
console.log(arr); // [-1, 0, 1, 2, 3, 4, 5] // Modifies the original array
```

### Array.prototype.values()
`arr.values()`  
The `values()` method returns a new `Array Iterator` object that contains the values for each index in the array.  

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.values().next().value); // 1
console.log(arr); // [1, 2, 3, 4, 5] // Doesn't change the original array
```

### Array.prototype\[@@iterator\]()
`arr[Symbol.iterator]()`  
The `@@iterator` property's initial value of `arr` is the same function object as the `Array.prototype.values()` property, by default it returns the same value as `values()`, and `arr[Symbol.iterator]` will return the `values()` function.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(...arr[Symbol.iterator]()); // 1 2 3 4 5
console.log(arr); // [1, 2, 3, 4, 5] // Doesn't change the original array
```

### Array\[@@species\]
`Array[Symbol.species]`  
The `Array[@@species]` accessor property returns the constructor of `Array`.

```javascript
console.log(Array[Symbol.species] === Array); // true
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```


## Reference

```
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array
```