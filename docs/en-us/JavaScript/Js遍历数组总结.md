# Summary of Array Traversal in Js
The main methods for traversing arrays are `for`, `forEach`, `map`, `for in`, and `for of`.

## for

```javascript
var arr = [1,2,3,4,5];
var n = arr.length; // Directly take the length, to avoid reading the properties of the arr object every time in the loop
for(let i=0; i<n; ++i ){
    console.log(arr[i]);
}
// 1 2 3 4 5

// The loop body can also be written like this
for(let i=0, len=arr.length; i<len; ++i ){
    console.log(arr[i]);
}
// 1 2 3 4 5
```

## forEach
`Array.prototype.forEach()`  
`arr.forEach(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` is the function executed for each element in the array, receiving one to three parameters.  
`currentValue` The current element being processed in the array.  
`index` Optional The index of the current element being processed in the array.  
`array` Optional The array being operated on.  
`thisArg` Optional The value to use as `this` when executing the `callback` function.  
Note that if an arrow function expression is used to pass in the `callback`, the `thisArg` parameter will be ignored because the arrow function lexically binds the `this` value.  
Note that if you want to end the traversal before it is complete, then `forEach` and `map` are not good choices.

```javascript
var arr = [1,2,3,4,5];
var obj = { a: 1 }; // Define obj for demonstrating the use of this
arr.forEach( function(currentValue,index,array) {
    console.log("Current value",currentValue);
    console.log("Current value index",index);
    console.log("Current processed array",array);
    console.log("Current this reference",this);
    console.log("End of callback, no need to return a value");
    console.log("");
},obj);
/*
    Current value 1
    Current value index 0
    Current processed array (5)[1, 2, 3, 4, 5]
    Current this reference {a: 1}
    End of callback, no need to return a value
    
    Current value 2
    Current value index 1
    Current processed array (5)[1, 2, 3, 4, 5]
    Current this reference {a: 1}
    End of callback, no need to return a value
    
    ...........
*/
// forEach is commonly used, but its performance is not as good as a regular for loop
```

## map
`Array.prototype.map()`  
`arr.map(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` is the function executed for each element in the array, receiving one to three parameters.  
`currentValue` The current element being processed in the array.  
`index` Optional The index of the current element being processed in the array.  
`array` Optional The array being operated on.
`thisArg` Optional The value to use as `this` when executing the `callback` function.  
Note that if an arrow function expression is used to pass in the `callback`, the `thisArg` parameter will be ignored because the arrow function lexically binds the `this` value.  
Note that the result returned by the `map` callback function forms each element of the new array, the original array is mapped to the corresponding new array.

```javascript
var arr = [1,2,3,4,5];
var obj = { a: 1 }; // Define obj for demonstrating the use of this.
var newArr = arr.map( function(currentValue,index,array) {
    console.log("Current value",currentValue);
    console.log("Current value index",index);
    console.log("Current processed array",array);
    console.log("Current this reference",this);
    console.log("");
    return currentValue + 10; // Return arr value plus 10 as a new array
},obj);
console.log(newArr); // [11, 12, 13, 14, 15]
/*
    Current value 1
    Current value index 0
    Current processed array (5)[1, 2, 3, 4, 5]
    Current this reference {a: 1}
    
    Current value 2
    Current value index 1
    Current processed array (5)[1, 2, 3, 4, 5]
    Current this reference {a: 1}
    
    ...........
*/
// This method is also widely used, but its performance is not as good as forEach
```

## for in

```javascript
// This method is very inefficient for traversing arrays, mainly used to loop through object properties

// Loop through the array
var arr = [1,2,3,4,5];
for(let item in arr){
    console.log(arr[item]);
}
// 1 2 3 4 5
// When traversing arrays, it should be noted that the array index is only an enumeration property with integer names, and is the same as general object properties
// It cannot be guaranteed that for ... in will return the indexes in any particular order
// The for ... in loop statement will return all enumerable properties, including non-integer type names and inherited ones
// Because the iteration order depends on the execution environment, array traversal may not access elements in order
// Therefore, when iterating through arrays where the order of traversal is important, it is best to use for loop with integer indexes

// Loop through the object
var obj = {a:1,b:2};
for(let item in obj){
    console.log(obj[item]);
}
// 1 2
// for ... in is designed for traversing object properties
```

## for of
`for of` is introduced in `ES6`, it creates a loop iteration on iterable objects including `Array`, `Map`, `Set`, `String`, `TypedArray`, `arguments` object, etc., calling a custom iteration hook and executing a statement for each distinct property value.

```javascript
var arr = [1,2,3,4,5];
for (let value of arr) {
    console.log(value);
}
// 1 2 3 4 5
```

## operate

`Array.prototype` also provides judgment and filtering operations for arrays, `every()`, `some()`, `find()`, `findIndex()`, `filter()`.

```javascript
var arr = [1,2,3,4,5];

// arr.every(callback(currentValue [, index [, array]])[, thisArg])
// The every() method tests whether all elements in the array pass the test implemented by the provided function. It returns a Boolean value
console.log(arr.every( (currentValue ) => {
    return currentValue > 1;
})) // false

console.log(arr.every( (currentValue ) => {
    return currentValue > 0;
})) // true

// arr.some(callback(element[, index[, array]])[, thisArg])
// The some() method tests whether at least one element in the array passes the test implemented by the provided function. It returns a Boolean value.
console.log(arr.some( (currentValue ) => {
    return currentValue > 1;
})) // true

console.log(arr.some( (currentValue ) => {
    return currentValue > 6;
})) // false

// arr.find(callback(element[, index[, array]])[, thisArg])
// The find() method returns the value of the first element in the array that satisfies the provided testing function. Otherwise, it returns undefined.
console.log(arr.find( (currentValue ) => {
    return currentValue > 2;
})) // 3

console.log(arr.find( (currentValue ) => {
    return currentValue > 6;
})) // undefined

// arr.findIndex(callback(element[, index[, array]])[, thisArg])
// The findIndex() method returns the index of the first element in the array that satisfies the provided testing function, otherwise, it returns -1.
console.log(arr.findIndex( (currentValue ) => {
    return currentValue > 2;
})) // 2

console.log(arr.findIndex( (currentValue ) => {
    return currentValue > 6;
})) // -1

// arr.filter(callback(element[, index[, array]])[, thisArg])
// The filter() method creates a new array with all elements that pass the test implemented by the provided function.
console.log(arr.filter( (currentValue ) => {
    return currentValue > 2;
})) // [3, 4, 5]
```

## Every Day One Topic

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://blog.csdn.net/function__/article/details/79555301
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array
```