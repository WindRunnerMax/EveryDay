# JavaScript Array Manipulation
`JavaScript` array manipulation mainly includes prototype methods of the `Array` object and common operations such as deduplication, flattening, sorting, and so on.

## Array.prototype

### forEach
`arr.forEach(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is the function executed for each element in the array, which receives one to three parameters.  
`currentValue` is the current element being processed in the array.  
`index` is the optional index of the current element being processed in the array.  
`array` is the optional array being operated on.  
`thisArg` is the optional value used as `this` when executing the callback function. Note that if an arrow function expression is used to pass in `callback`, the `thisArg` parameter will be ignored because arrow functions lexically bind the `this` value.  
The `forEach()` method executes the given function once for each element in the array.  
Note that if you want to end the traversal before it completes, then `forEach` and `map` are not a good choice.

```javascript
var arr = [1, 2, 3, 4, 5];
var obj = { a: 1 }; // Define obj to demonstrate the use of 'this'
arr.forEach( function(currentValue,index,array) {
    console.log("Current Value:",currentValue);
    console.log("Current Value Index:",index);
    console.log("Current Processed Array:",array);
    console.log("Current this reference:",this);
    console.log("End of callback, no need to return a value");
    console.log("");
},obj);
/*
    Current Value: 1
    Current Value Index: 0
    Current Processed Array: (5)[1, 2, 3, 4, 5]
    Current this reference: {a: 1}
    End of callback, no need to return a value
    
    Current Value: 2
    Current Value Index: 1
    Current Processed Array: (5)[1, 2, 3, 4, 5]
    Current this reference: {a: 1}
    End of callback, no need to return a value
    
    ...........
*/
console.log(arr); // [1, 2, 3, 4, 5] // No change in the original array
```

### map
`arr.map(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is the function executed for each element in the array, which receives one to three parameters.  
`currentValue` is the current element being processed in the array.  
`index` is the optional index of the current element being processed in the array.  
`array` is the optional array being operated on.  
`thisArg` is the optional value used as `this` when executing the callback function. Note that if an arrow function expression is used to pass in `callback`, the `thisArg` parameter will be ignored because arrow functions lexically bind the `this` value.  
The `map()` method creates a new array with the results of calling a provided function on every element in the array.

```javascript
var arr = [1, 2, 3, 4, 5];
var obj = { a: 1 }; // Define obj to demonstrate the use of 'this'
var newArr = arr.map( function(currentValue,index,array) {
    console.log("Current Value:",currentValue);
    console.log("Current Value Index:",index);
    console.log("Current Processed Array:",array);
    console.log("Current this reference:",this);
    console.log("");
    return currentValue + 10; // Add 10 to each value in 'arr' and return the new array
},obj);
console.log(newArr); // [11, 12, 13, 14, 15]
/*
    Current Value: 1
    Current Value Index: 0
    Current Processed Array: (5)[1, 2, 3, 4, 5]
    Current this reference: {a: 1}
    
    Current Value: 2
    Current Value Index: 1
    Current Processed Array: (5)[1, 2, 3, 4, 5]
    Current this reference: {a: 1}
    
    ...........
*/
console.log(arr); // [1, 2, 3, 4, 5] // No change in the original array
```

### push
`arr.push(element1[, ..., elementN])`  
`elementN` is the element(s) to be added to the end of the array.  
The `push()` method adds one or more elements to the end of an array and returns the new length of the array.

```javascript
var arr = ['a', 'b', 'c', 'd', 'e'];
console.log(arr.push('f','g')); // 7
console.log(arr); // ["a", "b", "c", "d", "e", "f", "g"] // Changes in the original array
```

### pop
`arr.pop()`  
The `pop()` method removes the last element from an array and returns that element. When the array is empty, `undefined` is returned. This method changes the length of the array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.pop()); // 5
console.log(arr); // [1, 2, 3, 4] // Changes in the original array
```

### unshift
`arr.unshift(element1[, ..., elementN])`  
`elementN` is the element(s) to be added to the start of the array.  
The `unshift()` method adds one or more elements to the beginning of an array and returns the new length of the array. This method modifies the original array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.unshift(-1, 0)); // 7
console.log(arr); // [-1, 0, 1, 2, 3, 4, 5] // Changes in the original array
```

### shift
`arr.shift()`  
The `shift()` method removes the first element from an array and returns that removed element. This method changes the original array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.shift()); // 1
console.log(arr); // [2, 3, 4, 5] // Changes in the original array
```

### Splice
`array.splice(start[, deleteCount[, item1[, item2[, ...]]]])`  
`start` specifies the start position for the modification. If it exceeds the length of the array, the content will be added starting from the end of the array. If it is a negative value, it indicates the position from the end of the array (counting from `-1`, which means `-n` is the `n`-th element from the end and equivalent to `array.length - n`). If the absolute value of the negative number is greater than the length of the array, it indicates the start position is the `0`th position.  
`deleteCount` is an optional integer that represents the number of array elements to remove. If `deleteCount` is greater than the total number of elements after `start`, then all elements from `start` onwards will be deleted (including the `start` position). If `deleteCount` is omitted or its value is greater than or equal to `array.length - start` (i.e., if it is greater than or equal to the number of elements after `start`), then all elements after `start` in the array will be deleted.  
`item1, item2, ...` are optional elements to be added to the array starting from the `start` position. If not specified, `splice()` will only delete array elements.  
The `splice()` method modifies the array by deleting or replacing existing elements or by adding new elements in place, and it returns the modified content in an array. This method will change the original array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.splice(1, 1)); // [2]
console.log(arr); // [1, 3, 4, 5] // Modifies the original array
```

### Slice
`arr.slice([begin[, end]])`  
`begin` is an optional index from which to extract the original array elements. If this parameter is a negative number, it indicates extraction starting from the specified number of elements from the end of the original array. If `begin` is omitted, `slice` will start from index `0`. If `begin` is greater than the length of the original array, an empty array will be returned.  
`end` is an optional index at which to end the extraction of original array elements. `slice` will extract all elements from the original array with indices from `begin` to `end`, including `begin` but excluding `end`. If `end` is omitted, `slice` will extract all elements until the end of the original array. If `end` is greater than the length of the array, `slice` will extract all elements until the end of the original array.  
The `slice()` method returns a new array object, which is a shallow copy of the original array determined by `begin` and `end`, including `begin` but excluding `end`. The original array will not be altered.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.slice(1, 3)); // [2, 3]
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### Concat
`var new_array = old_array.concat(value1[, value2[, ...[, valueN]]])`  
`valueN` is optional. It concatenates arrays and/or values into a new array. If the `valueN` parameter is omitted, `concat` will return a shallow copy of the array it was called on.  
The `concat()` method is used to merge two or more arrays, and it does not change the existing arrays; instead, it returns a new array.

```javascript
var arr1 = [1, 2, 3];
var arr2 = [4, 5, 6];
var arr3 = arr1.concat(arr2);

console.log(arr3); // [1, 2, 3, 4, 5, 6]
console.log(arr1); // [1, 2, 3] // Does not change the original array
```

### Join
`arr.join([separator])`  
`separator` is optional and specifies a string to separate each element of the array. If necessary, the separator will be converted to a string. If this value is omitted, the array elements are separated by a comma.  
The `join()` method joins all the elements of an array (or an array-like object) into a string and returns this string. If the array has only one item, that item will be returned without using a separator.

```javascript
var arr = ['a', 'b', 'c'];
console.log(arr.join('&')); // a&b&c
console.log(arr); // ["a", "b", "c"] // Does not change the original array
```

### Sort
`arr.sort([compareFunction])`  
`compareFunction` is optional and is used to specify the function by which to sort. If omitted, the elements are sorted according to the Unicode code point values of the strings obtained by turning the elements into strings.  
`firstEl` is the first element used for comparison.  
`secondEl` is the second element used for comparison.  
The `sort()` method sorts the elements of an array in place and returns the array. The default sort order is built upon converting the elements into strings, then comparing their sequences of UTF-16 code units.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.sort( (a,b) =>  b - a)) // [5, 4, 3, 2, 1]
console.log(arr); // [5, 4, 3, 2, 1] // Modifies the original array
```


### Reverse
`arr.reverse()`  
The `reverse()` method reverses the position of the elements in the array and returns the array. This method will change the original array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.reverse()); // [5, 4, 3, 2, 1]
console.log(arr); // [5, 4, 3, 2, 1] // Modifies the original array
```

### Every
`arr.every(callback[, thisArg])`  
`callback` is the function executed for each element in the array, and it receives one to three parameters.  
`currentValue` is the current element being processed in the array.  
`index` is optional and is the index of the current element being processed in the array.  
`array` is optional and is the array being operated on.  
`thisArg` is optional and is used as the value for `this` when executing the callback function. Note that if an arrow function expression is used to pass in the `callback`, the `thisArg` parameter will be ignored because arrow functions bind the `this` value lexicographically.  
The `every()` method tests whether all elements in the array can pass a specified function's test, and it returns a Boolean value.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.every(currentValue => currentValue > 1)) // false
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### some
`arr.some(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is a function that will be executed for each element of the array, it receives one to three arguments.  
`currentValue` The current element being processed in the array.  
`index` Optional The index of the current element being processed in the array.  
`array` Optional The array `some()` was called upon.  
`thisArg` Optional Value to use as `this` when executing `callback`. If an arrow function is used as the `callback`, it will ignore the thisArg value because arrow functions bind the this value lexically. 
The `some()` method tests whether at least one element in the array passes the test implemented by the provided function. It returns a Boolean value.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.some(currentValue => currentValue > 1)) // true
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### filter
`arr.filter(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is a function that will be executed for each element of the array, it receives one to three arguments.  
`currentValue` The current element being processed in the array.  
`index` Optional The index of the current element being processed in the array.  
`array` Optional The array `filter()` was called upon.  
`thisArg` Optional Value to use as `this` when executing `callback`. If an arrow function is used as the `callback`, it will ignore the thisArg value because arrow functions bind the this value lexically. 
The `filter()` method creates a new array with all elements that pass the test implemented by the provided function.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.filter(currentValue => currentValue > 2 )); // [3, 4, 5]
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### find
`arr.find(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is a function that will be executed for each element of the array, it receives one to three arguments.  
`currentValue` The current element being processed in the array.  
`index` Optional The index of the current element being processed in the array.  
`array` Optional The array `find()` was called upon.  
`thisArg` Optional Value to use as `this` when executing `callback`. If an arrow function is used as the `callback`, it will ignore the thisArg value because arrow functions bind the this value lexically.  
The `find()` method returns the value of the first element in the array that satisfies the provided testing function. Otherwise `undefined` is returned.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.find(currentValue => currentValue > 2 )); // 3
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### findIndex
`arr.findIndex(callback(currentValue [, index [, array]])[, thisArg])`  
The `callback` is a function that will be executed for each element of the array, it receives one to three arguments.  
`currentValue` The current element being processed in the array.  
`index` Optional The index of the current element being processed in the array.  
`array` Optional The array `findIndex()` was called upon.  
`thisArg` Optional Value to use as `this` when executing `callback`. If an arrow function is used as the `callback`, it will ignore the thisArg value because arrow functions bind the this value lexically.  
The `findIndex()` method returns the index of the first element in the array that satisfies the provided testing function. Otherwise, it returns `-1`.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.findIndex(currentValue => currentValue > 2 )); // 2
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### includes
`arr.includes(valueToFind[, fromIndex])`  
`valueToFind` The value to search for.  
`fromIndex` Optional The position in this array at which to begin searching for valueToFind; negative values are counted from the end of the array. Defaults to `0`.  
The `includes()` method determines whether an array includes a certain value among its entries, returning `true` or `false`.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.includes(2)); // true
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### indexOf
`arr.indexOf(searchElement[, fromIndex])`  
`searchElement` The item to search for.  
`fromIndex` Optional The position in this array at which to begin searching for searchElement; negative values are counted from the end of the array. Defaults to `0`.  
The `indexOf()` method returns the first index at which a given element can be found in the array, or `-1` if it is not present.


```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.indexOf(2)); // 1
console.log(arr); // [1, 2, 3, 4, 5] // Original array remains unchanged
```

### lastIndexOf
`arr.lastIndexOf(searchElement[, fromIndex])`  
`searchElement` The element to search for.  
`fromIndex` Optional The index at which to start searching backwards. Defaults to the array's length minus `1`, i.e., `arr.length - 1`, the entire array is searched. If the value is greater than or equal to the array's length, the whole array will be searched. If it is negative, it is treated as an offset from the end of the array. Even with a negative value, the array will still be searched from back to front. If the value is negative and its absolute value is greater than the array length, the method returns `-1`, meaning the array will not be searched.  
The `lastIndexOf()` method returns the last index of the specified element in the array, or `-1` if it does not exist. It searches from the end of the array, starting at the `fromIndex`.

```javascript
var arr = [1, 2, 3, 2, 1];
console.log(arr.lastIndexOf(2)); // 3
console.log(arr); // [1, 2, 3, 2, 1] // Original array remains unchanged
```

### fill
`arr.fill(value[, start[, end]])`  
`value` The value to fill the array elements with.  
`start` Optional The start index, default is `0`.  
`end` Optional The end index, default is `this.length`.  
The `fill()` method fills all the elements in an array from a start index to an end index with a static value, excluding the end index.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.fill(0, 0, 5)); // [0, 0, 0, 0, 0]
console.log(arr); // [0, 0, 0, 0, 0] // Original array is changed
```

### copyWithin
`arr.copyWithin(target[, start[, end]])`  
`target` The base 0 index to copy the sequence to. If negative, `target` will be calculated from the end. If `target` is greater than or equal to `arr.length`, no copy will be performed. If `target` is after `start`, the copied sequence will be modified to fit `arr.length`.  
`start` The base 0 index from which to start copying elements. If negative, it will be counted from the end. If `start` is omitted, `copyWithin` will copy from `0`.  
`end` The base 0 index at which to stop copying elements, `copyWithin` will copy up to, but not including, `end`. If negative, it will be counted from the end. If `end` is omitted, `copyWithin` will copy to the end of the array, default is `arr.length`.  
The `copyWithin()` method shallow copies part of an array to the same array and returns it, without modifying the length of the array.

```javascript
var arr = [1, 2, 3, 4, 5, 6];
console.log(arr.copyWithin(0, 2, 5)); // [3, 4, 5, 4, 5, 6] // Shallow copies the values from index 2 to 5 to the position with index 0
console.log(arr); // [3, 4, 5, 4, 5, 6] // Original array is changed, but the length remains unchanged
```

### flat
`var newArray = arr.flat([depth])`  
`depth` Optional The depth level specifying how deep a nested array structure should be flattened, defaults to 1.  
The `flat()` method recursively flattens an array up to the specified depth and returns a new array with all elements and sub-array elements concatenated into it.

```javascript
var arr = [1, 2, [3, 4, [5]]];
console.log(arr.flat(2)); // [1, 2, 3, 4, 5]
console.log(arr); // [1, 2, [3, 4, [5]]] // Original array remains unchanged
```

### flatMap
`arr.flatMap(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` Function to execute on each element in the array.  
`currentValue` The current element being processed in the array.  
`index` Optional The index of the current element being processed in the array.  
`array` Optional The array `map` was called upon.  
`thisArg` Optional Value to use as this when executing callback. If an arrow function is used, it disregards the `thisArg` parameter because arrow functions do not bind their own `this` value.  
The `flatMap()` method first maps each element using a mapping function, then flattens the result into a new array. It is essentially the same as `map` followed by a `flat` with a depth of `1`, but is more efficient than combining the two.

```javascript
var arr = [[1], [2], [3], [4], [5]];
console.log(arr.flatMap(currentValue => currentValue * 2)); // [2, 4, 6, 8, 10] // First applies the map, then flattens into a new array
console.log(arr); // [[1], [2], [3], [4], [5]] // Original array remains unchanged
```

### entries
`arr.entries()`  
The `entries()` method returns a new `Array Iterator` object containing the key/value pairs for each index in the array. The `Array Iterator` object has a `next` method on its prototype `__proto__: Array Iterator`, which can be used to iterate through the iterator and obtain the `[key,value]` pairs of the original array.

```javascript
var arr = ['a', 'b', 'c'];
console.log(arr.entries().next().value); // [0, "a"]
console.log(arr); // ["a", "b", "c"] // Original array remains unchanged
```

### keys
`arr.keys()`  
The `keys()` method returns an `Array Iterator` object that contains the keys for each index in the array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.keys().next().value); // 0
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### values
`arr.values()`  
The `values()` method returns a new `Array Iterator` object that contains the values of each index of the array.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.values().next().value); // 1
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### reduce
`arr.reduce(callback(accumulator, currentValue[, index[, array]])[, initialValue])`  
The `callback` function executes for every value in the array (except the first value if `initialValue` is not provided), taking in two to four parameters.  
- `accumulator` is the accumulated value of the callback's return, it is the accumulated value returned by the last callback or `initialValue`.
- `currentValue` is the element currently being processed in the array.
- `index` (optional) is the index of the current element being processed in the array. If `initialValue` is provided, the index starts at 0, otherwise it starts at 1.
- `array` (optional) is the array `reduce()` was called upon.
- `initialValue` (optional) is the value to use as the first argument to the first call of the callback. If not provided, the first element of the array is used. Calling `reduce()` on an empty array without an initial value will result in an error.  
The `reduce()` method executes a `reducer` function on each element of the array, resulting in a single return value.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.reduce((accumulator,currentValue) => accumulator+currentValue , 5)); // 20 // 5 + 1 + 2 + 3 + 4 + 5
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### reduceRight
`arr.reduceRight(callback(accumulator, currentValue[, index[, array]])[, initialValue])`  
The `callback` function executes for every value in the array, taking in two to four parameters.  
- `accumulator` is the accumulated value of the callback's return, it is the accumulated value returned by the last callback or `initialValue`.
- `currentValue` is the element currently being processed in the array.
- `index` (optional) is the index of the current element being processed in the array. If `initialValue` is provided, the index starts at 0, otherwise it starts at 1.
- `array` (optional) is the array `reduce()` was called upon.
- `initialValue` (optional) is the value of the accumulator `accumulator` on the first call of the callback function. If not provided, it uses the last element of the array and skips it. Calling `reduce` without an initial value on an empty array will result in an error.  
The `reduceRight()` method accepts a function as an `accumulator` and reduces each value of the array from right to left into a single value.

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.reduceRight((accumulator,currentValue) => accumulator+currentValue , 5)); // 20 // 5 + 5 + 4 + 3 + 2 + 1
console.log(arr); // [1, 2, 3, 4, 5] // Does not change the original array
```

### toString
`arr.toString()`  
`toString()` returns a string representing the specified array and its elements.

```javascript
var arr = [1, 'a', new Date('21 Dec 1997 14:12:00 UTC')];
console.log(arr.toString()); // 1,a,Sun Dec 21 1997 22:12:00 GMT+0800 (中国标准时间)
console.log(arr); // [1, "a", Sun Dec 21 1997 22:12:00 GMT+0800 (中国标准时间)] // Does not change the original array
```

### toLocaleString
`arr.toLocaleString([locales[,options]])`  
`locales` (optional) is a string or an array of strings with BCP 47 language tags.  
`options` is an object representing some configurable properties.  
`toLocaleString()` returns a string representing the elements of the array. The elements of the array will be converted to strings using their respective `toLocaleString` method, with the strings being separated by a string specific to the locale.

```javascript
var arr = [1, 'a', new Date('21 Dec 1997 14:12:00 UTC')];
console.log(arr.toLocaleString('en', {timeZone: "UTC"})); // 1,a,12/21/1997, 2:12:00 PM
console.log(arr); // [1, "a", Sun Dec 21 1997 22:12:00 GMT+0800 (中国标准时间)] // Does not change the original array
```

## Common Operations

### Array Deduplication

Using object `key`.

```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var obj = {};
var newArr = [];
arr.forEach((v) => {
    if(!obj[v]) {
        obj[v] = 1;
        newArr.push(v);
    }
})
console.log(newArr); // [1, 2, 3, 5]
```

Using `Set`.

```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var newArr = Array.from(new Set(arr));
// var newArr = [...(new Set(arr))]; // The spread operator turns an array into a sequence of parameters separated by commas
console.log(newArr); // [1, 2, 3, 5]
```

Use `indexOf`.

```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var newArr = [];
arr.forEach((v) => {
    if(newArr.indexOf(v) === -1)  newArr.push(v);
})
console.log(newArr); // [1, 2, 3, 5]
// Same logic applies to using find, findIndex, and includes
```

### Flatten an Array

Use `flat`.
```javascript
var arr = [1, 2, [3, 4, [5]]];
var newArr = arr.flat(2);
console.log(newArr); // [1, 2, 3, 4, 5]
```

Implement `flat` recursively.
```javascript
function _flat(arr, maxN = 1 ,curN = 0){
    var newArr = [];
    if(curN >= maxN) return arr;
    arr.forEach( (v,i,array) => {
        if(Array.isArray(v)) newArr.push(..._flat(v,maxN,curN + 1));
        else newArr.push(v);
    })
    return newArr;
}
var arr = [1, 2, [3, 4, [5]]];
var newArr = _flat(arr, 1); // Flatten one layer
console.log(newArr); // [1, 2, 3, 4, [5]]
```


### Count the Most Occurring Character in a String

Use an array to use the character's `ASCII` code as the `key` to create a bucket.
```javascript
var s = "ASASRKIADAA";
var arr = [];
var base = 65; // A-Z 65-90 a-z 97-122
Array.prototype.forEach.call(s,(v) => {
    let ascii = v.charCodeAt(0) - base;
    if(arr[ascii]) ++arr[ascii];
    else arr[ascii] = 1;
})
var max = 0;
var maxIndex = 0;
arr.forEach( (v,i) => {
    if(v > max) {
        max = v;
        maxIndex = i;
    }
})
console.log(String.fromCharCode(maxIndex + base) , arr[maxIndex]); // A 5
```

Use an object to create a bucket.
```javascript
var s = "ASASRKIADAA";
var obj = {};
Array.prototype.forEach.call(s,(v) => {
    if(obj[v]) ++obj[v];
    else obj[v] = 1;
})
var max = 0;
var maxKey = s[0];
for(let item in obj) {
    let v = obj[item];
    if(v > max) {
        max = v;
        maxKey = item;
    }
}
console.log( maxKey, obj[maxKey]); // A 5
```

### Find the Maximum Value in an Array

Iterate through the array.
```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var max = -Infinity;
arr.forEach((v) => {
    if(v > max) max = v;
})
console.log(max); // 5
```

Use `Math`.
```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var max = Math.max(...arr);
console.log(max); // 5
```

Use `reduce`.
```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var max = arr.reduce((a,v) => { return a > v ? a : v; })
console.log(max); // 5
```

### Copy an Array

Use `push` to iterate through the array.
```javascript
var arr = [1, 2, 3, 4, 5];
var newArr = [];
arr.forEach( v => newArr.push(v) );
console.log(newArr); // [1, 2, 3, 4, 5]
// It can also use unshift() and then reverse()
```

Use `concat`.
```javascript
var arr = [1, 2, 3, 4, 5];
var newArr = [].concat(arr);
console.log(newArr); // [1, 2, 3, 4, 5]
```

Use `slice`.
```javascript
var arr = [1, 2, 3, 4, 5];
var newArr = arr.slice(0);
console.log(newArr); // [1, 2, 3, 4, 5]
```

### Shuffle an Array

Swap `N` times randomly.

```javascript
function randomInt(a, b) { // Returns a random number
    return Number.parseInt(Math.random() * (b - a) + a);
}
var arr = [1, 2, 3, 4, 5];
var N = arr.length;
arr.forEach( (v,i,arr) => {
    var ran = randomInt(0, N);
    [arr[i],arr[ran]] = [arr[ran], arr[i]];
})
console.log(arr);
```

```javascript
var arr = [1, 2, 3, 4, 5];
arr.sort( (v1, v2) => {
    return Math.random() >=0.5 ? 1 :-1;
})
console.log(arr);
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/4db36e910312
https://blog.csdn.net/m0_37686205/article/details/88358126
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array
```