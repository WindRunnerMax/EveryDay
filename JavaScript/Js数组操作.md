# Js数组操作
`JavaScript`数组操作，主要包括`Array`对象原型方法以及常用操作如去重、扁平化、排序等。

## Array.prototype

### forEach
`Array.prototype.forEach()`  
`arr.forEach(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` 为数组中每个元素执行的函数，该函数接收一至三个参数。  
`currentValue` 数组中正在处理的当前元素。  
`index` 可选 数组中正在处理的当前元素的索引。  
`array` 可选 正在操作的数组。  
`thisArg` 可选 当执行回调函数`callback`时，用作`this`的值，注意如果使用箭头函数表达式来传入`callback`，`thisArg`参数会被忽略，因为箭头函数在词法上绑定了`this`值。    
`forEach()`方法对数组的每个元素执行一次给定的函数。  
注意如果想在遍历执行完之前结束遍历，那么`forEach`与`map`并不是好的选择。
```javascript
var arr = [1, 2, 3, 4, 5];
var obj = { a: 1 }; // 定义obj为了演示this用
arr.forEach( function(currentValue,index,array) {
    console.log("当前值",currentValue);
    console.log("当前值索引",index);
    console.log("当前处理数组",array);
    console.log("当前this指向",this);
    console.log("结束一次回调，无需返回值");
    console.log("");
},obj);
/*
    当前值 1
    当前值索引 0
    当前处理数组 (5)[1, 2, 3, 4, 5]
    当前this指向 {a: 1}
    结束一次回调，无需返回值
    
    当前值 2
    当前值索引 1
    当前处理数组 (5)[1, 2, 3, 4, 5]
    当前this指向 {a: 1}
    结束一次回调，无需返回值
    
    ...........
*/
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### map
`arr.map(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` 为数组中每个元素执行的函数，该函数接收一至三个参数。  
`currentValue` 数组中正在处理的当前元素。  
`index` 可选 数组中正在处理的当前元素的索引。  
`array` 可选 正在操作的数组。  
`thisArg` 可选 当执行回调函数`callback`时，用作`this`的值，注意如果使用箭头函数表达式来传入`callback`，`thisArg`参数会被忽略，因为箭头函数在词法上绑定了`this`值。    
`map()`方法创建一个新数组，其结果是该数组中的每个元素都调用一次提供的函数后的返回值。
```javascript
var arr = [1, 2, 3, 4, 5];
var obj = { a: 1 }; // 定义obj为了演示this用
var newArr = arr.map( function(currentValue,index,array) {
    console.log("当前值",currentValue);
    console.log("当前值索引",index);
    console.log("当前处理数组",array);
    console.log("当前this指向",this);
    console.log("");
    return currentValue + 10; // 将arr值加10返回成为新数组
},obj);
console.log(newArr); // [11, 12, 13, 14, 15]
/*
    当前值 1
    当前值索引 0
    当前处理数组 (5)[1, 2, 3, 4, 5]
    当前this指向 {a: 1}
    
    当前值 2
    当前值索引 1
    当前处理数组 (5)[1, 2, 3, 4, 5]
    当前this指向 {a: 1}
    
    ...........
*/
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### push
`arr.push(element1[, ..., elementN])`  
`elementN` 被添加到数组末尾的元素。  
`push()`方法将一个或多个元素添加到数组的末尾，并返回该数组的新长度。
```javascript
var arr = ['a', 'b', 'c', 'd', 'e'];
console.log(arr.push('f','g')); // 7
console.log(arr); // ["a", "b", "c", "d", "e", "f", "g"] // 改变原数组
```

### pop
`arr.pop()`  
`pop()`方法从数组中删除最后一个元素，并返回该元素的值，当数组为空时返回`undefined`，此方法更改数组的长度。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.pop()); // 5
console.log(arr); // [1, 2, 3, 4] // 改变原数组
```

### unshift
`arr.unshift(element1[, ..., elementN])`  
`elementN` 要添加到数组开头的元素或多个元素。  
`unshift()`方法将一个或多个元素添加到数组的开头，并返回该数组的新长度，该方法修改原有数组。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.unshift(-1, 0)); // 7
console.log(arr); // [-1, 0, 1, 2, 3, 4, 5] // 改变原数组
```


### shift
`arr.shift()`  
`shift()`方法从数组中删除第一个元素，并返回该元素的值，该方法会改变原数组。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.shift()); // 1
console.log(arr); // [2, 3, 4, 5] // 改变原数组
```

### splice
`array.splice(start[, deleteCount[, item1[, item2[, ...]]]])`  
`start` 指定修改的开始位置，如果超出了数组的长度，则从数组末尾开始添加内容；如果是负值，则表示从数组末位开始的第几位（从`-1`计数，这意味着`-n`是倒数第`n`个元素并且等价于`array.length-n`）；如果负数的绝对值大于数组的长度，则表示开始位置为第`0`位。  
`deleteCount` 可选 整数，表示要移除的数组元素的个数。如果`deleteCount`大于`start`之后的元素的总数，则从`start`后面的元素都将被删除（含第`start`位）。如果`deleteCount` 被省略了，或者它的值大于等于`array.length - start`(也就是说，如果它大于或者等于`start`之后的所有元素的数量)，那么`start`之后数组的所有元素都会被删除。  
`item1, item2, ...` 可选 要添加进数组的元素，从`start`位置开始。如果不指定，则 `splice()`将只删除数组元素。  
`splice()`方法通过删除或替换现有元素或者原地添加新的元素来修改数组,并以数组形式返回被修改的内容。此方法会改变原数组。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.splice(1, 1)); // [2]
console.log(arr); // [1, 3, 4, 5] // 改变原数组
```

### slice
`arr.slice([begin[, end]])`  
`begin` 可选 提取起始处的索引，从该索引开始提取原数组元素。如果该参数为负数，则表示从原数组中的倒数第几个元素开始提取，如果省略`begin`，则`slice`从索引`0`开始。如果`begin`大于原数组的长度，则会返回空数组。  
`end` 可选 提取终止处的索引，在该索引处结束提取原数组元素。`slice`会提取原数组中索引从`begin`到`end `的所有元素，包含`begin`，但不包含`end`。如果`end`被省略，则`slice`会一直提取到原数组末尾。如果`end`大于数组的长度，`slice`也会一直提取到原数组末尾。  
`slice()`方法返回一个新的数组对象，这一对象是一个由`begin`和`end`决定的原数组的浅拷贝，包括`begin`，不包括`end`，原始数组不会被改变。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.slice(1, 3)); // [2, 3]
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### concat
`var new_array = old_array.concat(value1[, value2[, ...[, valueN]]])`  
`valueN` 可选，将数组和/或值连接成新数组，如果省略了`valueN`参数参数，则concat会返回一个它所调用的已存在的数组的浅拷贝。  
`concat()`方法用于合并两个或多个数组，此方法不会更改现有数组，而是返回一个新数组。
```javascript
var arr1 = [1, 2, 3];
var arr2 = [4, 5, 6];
var arr3 = arr1.concat(arr2);

console.log(arr3); // [1, 2, 3, 4, 5, 6]
console.log(arr1); // [1, 2, 3] // 不改变原数组
```

### join
`arr.join([separator])`  
`separator` 可选 指定一个字符串来分隔数组的每个元素，如果需要，将分隔符转换为字符串，如果缺省该值，数组元素用逗号`,`分隔。  
`join()`方法将一个数组（或一个类数组对象）的所有元素连接成一个字符串并返回这个字符串。如果数组只有一个项目，那么将返回该项目而不使用分隔符。
```javascript
var arr = ['a', 'b', 'c'];
console.log(arr.join('&')); // a&b&c
console.log(arr); // ["a", "b", "c"] // 不改变原数组
```

### sort
`arr.sort([compareFunction])`  
`compareFunction` 可选 用来指定按某种顺序进行排列的函数。如果省略，元素按照转换为的字符串的各个字符的`Unicode`位点进行排序。  
`firstEl` 第一个用于比较的元素。  
`secondEl` 第二个用于比较的元素。  
`sort()`方法用原地算法对数组的元素进行排序，并返回数组。默认排序顺序是在将元素转换为字符串，然后比较它们的`UTF-16`代码单元值序列时构建的。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.sort( (a,b) =>  b - a)) // [5, 4, 3, 2, 1]
console.log(arr); // [5, 4, 3, 2, 1] // 改变原数组
```


### reverse
`arr.reverse()`  
`reverse()`方法将数组中元素的位置颠倒，并返回该数组，该方法会改变原数组。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.reverse()); // [5, 4, 3, 2, 1]
console.log(arr); // [5, 4, 3, 2, 1] // 改变原数组
```


### every
`arr.every(callback[, thisArg])`  
`callback` 为数组中每个元素执行的函数，该函数接收一至三个参数。  
`currentValue` 数组中正在处理的当前元素。  
`index` 可选 数组中正在处理的当前元素的索引。  
`array` 可选 正在操作的数组。  
`thisArg` 可选 当执行回调函数`callback`时，用作`this`的值，注意如果使用箭头函数表达式来传入`callback`，`thisArg`参数会被忽略，因为箭头函数在词法上绑定了`this`值。    
`every()`方法测试一个数组内的所有元素是否都能通过某个指定函数的测试，它返回一个布尔值。  

```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.every( currentValue => currentValue > 1)) // false
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### some
`arr.some(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` 为数组中每个元素执行的函数，该函数接收一至三个参数。  
`currentValue` 数组中正在处理的当前元素。  
`index` 可选 数组中正在处理的当前元素的索引。  
`array` 可选 正在操作的数组。  
`thisArg` 可选 当执行回调函数`callback`时，用作`this`的值，注意如果使用箭头函数表达式来传入`callback`，`thisArg`参数会被忽略，因为箭头函数在词法上绑定了`this`值。   
`some()`方法测试数组中是不是至少有`1`个元素通过了被提供的函数测试，它返回的是一个`Boolean`类型的值。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.some( currentValue => currentValue > 1)) // true
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### filter
`arr.filter(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` 为数组中每个元素执行的函数，该函数接收一至三个参数。  
`currentValue` 数组中正在处理的当前元素。  
`index` 可选 数组中正在处理的当前元素的索引。  
`array` 可选 正在操作的数组。  
`thisArg` 可选 当执行回调函数`callback`时，用作`this`的值，注意如果使用箭头函数表达式来传入`callback`，`thisArg`参数会被忽略，因为箭头函数在词法上绑定了`this`值。   
`filter()`方法创建一个新数组, 其包含通过所提供函数实现的测试的所有元素。 
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.filter( currentValue => currentValue > 2 )); // [3, 4, 5]
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### find
`arr.find(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` 为数组中每个元素执行的函数，该函数接收一至三个参数。  
`currentValue` 数组中正在处理的当前元素。  
`index` 可选 数组中正在处理的当前元素的索引。  
`array` 可选 正在操作的数组。  
`thisArg` 可选 当执行回调函数`callback`时，用作`this`的值，注意如果使用箭头函数表达式来传入`callback`，`thisArg`参数会被忽略，因为箭头函数在词法上绑定了`this`值。  
`find()`方法返回数组中满足提供的测试函数的第一个元素的值，否则返回`undefined`。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.find( currentValue => currentValue > 2 )); // 3
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### findIndex
`arr.findIndex(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` 为数组中每个元素执行的函数，该函数接收一至三个参数。  
`currentValue` 数组中正在处理的当前元素。  
`index` 可选 数组中正在处理的当前元素的索引。  
`array` 可选 正在操作的数组。  
`thisArg` 可选 当执行回调函数`callback`时，用作`this`的值，注意如果使用箭头函数表达式来传入`callback`，`thisArg`参数会被忽略，因为箭头函数在词法上绑定了`this`值。  
`findIndex()`方法返回数组中满足提供的测试函数的第一个元素的索引，否则返回`-1`。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.findIndex( currentValue => currentValue > 2 )); // 2
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### includes
`arr.includes(valueToFind[, fromIndex])`  
`valueToFind` 需要查找的元素值。  
`fromIndex` 可选 从`fromIndex`索引处开始查找`valueToFind`，如果为负值，则按升序从`array.length + fromIndex`的索引开始搜，即使从末尾开始往前跳`fromIndex`的绝对值个索引，然后往后搜寻，默认为`0`。  
`includes()`方法用来判断一个数组是否包含一个指定的值，如果包含则返回`true`，否则返回`false`。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.includes(2)); // true
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### indexOf
`arr.indexOf(searchElement[, fromIndex])`  
`searchElement` 需要查找的元素值。  
`fromIndex` 可选 从`fromIndex`索引处开始查找`valueToFind`，如果为负值，则按升序从`array.length + fromIndex`的索引开始搜，即使从末尾开始往前跳`fromIndex`的绝对值个索引，然后往后搜寻，默认为`0`。  
`indexOf()`方法返回在数组中可以找到一个给定元素的第一个索引，如果不存在，则返回`-1`。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.indexOf(2)); // 1
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### lastIndexOf
`arr.lastIndexOf(searchElement[, fromIndex])`  
`searchElement` 被查找的元素。  
`fromIndex` 可选 从此位置开始逆向查找，默认为数组的长度减`1`即`arr.length - 1`，整个数组都被查找。如果该值大于或等于数组的长度，则整个数组会被查找。如果为负值，将其视为从数组末尾向前的偏移。即使该值为负，数组仍然会被从后向前查找。如果该值为负时，其绝对值大于数组长度，则方法返回`-1`，即数组不会被查找。  
`lastIndexOf()`方法返回指定元素在数组中的最后一个的索引，如果不存在则返回 `-1`。从数组的后面向前查找，从`fromIndex`处开始。  

```javascript
var arr = [1, 2, 3, 2, 1];
console.log(arr.lastIndexOf(2)); // 3
console.log(arr); // [1, 2, 3, 2, 1] // 不改变原数组
```

### fill
`arr.fill(value[, start[, end]])`  
`value` 用来填充数组元素的值。  
`start` 可选 起始索引，默认值为`0`。  
`end` 可选 终止索引，默认值为`this.length`。  
`fill()`方法用一个固定值填充一个数组中从起始索引到终止索引内的全部元素，不包括终止索引。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.fill(0, 0, 5)); // [0, 0, 0, 0, 0]
console.log(arr); // [0, 0, 0, 0, 0] // 改变原数组
```

### copyWithin
`arr.copyWithin(target[, start[, end]])`  
`target` 以`0`为基底的索引，复制序列到该位置。如果是负数，`target`将从末尾开始计算。
如果`target`大于等于`arr.length`，将会不发生拷贝。如果`target`在`start`之后，复制的序列将被修改以符合`arr.length`。  
`start` 以`0`为基底的索引，开始复制元素的起始位置，如果是负数，`start`将从末尾开始计算，如果`start`被忽略，`copyWithin`将会从`0`开始复制。  
`end` 以`0`为基底的索引，开始复制元素的结束位置，`copyWithin`将会拷贝到该位置，但不包括`end`这个位置的元素。如果是负数，`end`将从末尾开始计算。如果`end`被忽略，`copyWithin`方法将会一直复制至数组结尾，默认为`arr.length`。  
`copyWithin()`方法浅复制数组的一部分到同一数组中的另一个位置，并返回它，不会改变原数组的长度。
```javascript
var arr = [1, 2, 3, 4, 5, 6];
console.log(arr.copyWithin(0, 2, 5)); // [3, 4, 5, 4, 5, 6] // 将索引为2到5的值浅拷贝到以0为索引的位置
console.log(arr); // [3, 4, 5, 4, 5, 6] // 改变原数组 不改变原数组长度
```

### flat
`var newArray = arr.flat([depth])`  
`depth` 可选 指定要提取嵌套数组的结构深度，默认值为 1。  
`flat()`方法会按照一个可指定的深度递归遍历数组，并将所有元素与遍历到的子数组中的元素合并为一个新数组返回。
```javascript
var arr = [1, 2, [3, 4, [5]]];
console.log(arr.flat(2)); // [1, 2, 3, 4, 5]
console.log(arr); // [1, 2, [3, 4, [5]]] // 不改变原数组
```

### flatMap
`arr.flatMap(callback(currentValue [, index [, array]])[, thisArg])`  
`callback` 为数组中每个元素执行的函数，该函数接收一至三个参数。  
`currentValue` 数组中正在处理的当前元素。  
`index` 可选 数组中正在处理的当前元素的索引。  
`array` 可选 被调用的`map`数组。
`thisArg` 可选 当执行回调函数`callback`时，用作`this`的值，注意如果使用箭头函数表达式来传入`callback`，`thisArg`参数会被忽略，因为箭头函数在词法上绑定了`this`值。  
`flatMap()`方法首先使用映射函数映射每个元素，然后将结果压缩成一个新数组。它与`map` 连着深度值为`1`的`flat`几乎相同，但`flatMap`通常在合并成一种方法的效率稍微高一些。
```javascript
var arr = [[1], [2], [3], [4], [5]];
console.log(arr.flatMap( currentValue => currentValue *2 )); // [2, 4, 6, 8, 10] // 首先调用映射map，再扁平化为新数组
console.log(arr); // [[1], [2], [3], [4], [5]] // 不改变原数组
```

### entries
`arr.entries()`  
`entries()`方法返回一个新的`Array Iterator`对象，该对象包含数组中每个索引的键/值对，`Array Iterator`对象的原型`__proto__:Array Iterator`上有一个`next`方法，可用用于遍历迭代器取得原数组的`[key,value]`。   
```javascript
var arr = ['a', 'b', 'c'];
console.log(arr.entries().next().value); // [0, "a"]
console.log(arr); // ["a", "b", "c"] // 不改变原数组
```

### keys
`arr.keys()`  
`keys()`方法返回一个包含数组中每个索引键的`Array Iterator`对象。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.keys().next().value); // 0
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### values
`arr.values()`  
`values()`方法返回一个新的`Array Iterator`对象，该对象包含数组每个索引的值  
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.values().next().value); // 1
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### reduce
`arr.reduce(callback(accumulator, currentValue[, index[, array]])[, initialValue])`  
`callback` 执行数组中每个值 (如果没有提供 `initialValue`则第一个值除外)的函数，该函数接收二至四个参数。  
`accumulator` 累计器累计回调的返回值，它是上一次调用回调时返回的累积值，或`initialValue`。  
`currentValue` 数组中正在处理的元素。  
`index` 可选 数组中正在处理的当前元素的索引，如果提供了`initialValue`，则起始索引号为`0`，否则从索引`1`起始。  
`array` 可选 调用`reduce()`的数组。
`initialValue` 可选 作为第一次调用`callback`函数时的第一个参数的值。如果没有提供初始值，则将使用数组中的第一个元素，在没有初始值的空数组上调用`reduce`将报错。  
`reduce()`方法对数组中的每个元素执行一个由指定的`reducer`函数(升序执行)，将其结果汇总为单个返回值。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.reduce((accumulator,currentValue) => accumulator+currentValue , 5)); // 20 // 5 + 1 + 2 + 3 + 4 + 5
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### reduceRight
`arr.reduceRight(callback(accumulator, currentValue[, index[, array]])[, initialValue])`  
`callback` 执行数组中每个值的函数，该函数接收二至四个参数。  
`accumulator` 累计器累计回调的返回值，它是上一次调用回调时返回的累积值，或`initialValue`。  
`currentValue` 数组中正在处理的元素。  
`index` 可选 数组中正在处理的当前元素的索引，如果提供了`initialValue`，则起始索引号为`0`，否则从索引`1`起始。  
`array` 可选 调用`reduce()`的数组。
`initialValue` 可选 首次调用`callback`函数时，累加器`accumulator`的值。如果未提供该初始值，则将使用数组中的最后一个元素，并跳过该元素。如果不给出初始值，则需保证数组不为空，在没有初始值的空数组上调用`reduce`将报错。  
`reduceRight()`方法接受一个函数作为累加器`accumulator`和数组从右到左的每个值将其减少为单个值。
```javascript
var arr = [1, 2, 3, 4, 5];
console.log(arr.reduceRight((accumulator,currentValue) => accumulator+currentValue , 5)); // 20 // 5 + 5 + 4 + 3 + 2 + 1
console.log(arr); // [1, 2, 3, 4, 5] // 不改变原数组
```

### toString
`arr.toString()`  
`toString()`返回一个字符串，表示指定的数组及其元素。  
```javascript
var arr = [1, 'a', new Date('21 Dec 1997 14:12:00 UTC')];
console.log(arr.toString()); // 1,a,Sun Dec 21 1997 22:12:00 GMT+0800 (中国标准时间)
console.log(arr); // [1, "a", Sun Dec 21 1997 22:12:00 GMT+0800 (中国标准时间)] // 不改变原数组
```

### toLocaleString
`arr.toLocaleString([locales[,options]])`  
`locales` 可选 带有`BCP 47`语言标记的字符串或字符串数组。  
`options` 一个可配置属性的对象。
`toLocaleString()`返回一个字符串表示数组中的元素。数组中的元素将使用各自的 `toLocaleString`方法转成字符串，这些字符串将使用一个特定语言环境的字符串隔开。
```javascript
var arr = [1, 'a', new Date('21 Dec 1997 14:12:00 UTC')];
console.log(arr.toLocaleString('en', {timeZone: "UTC"})); // 1,a,12/21/1997, 2:12:00 PM
console.log(arr); // [1, "a", Sun Dec 21 1997 22:12:00 GMT+0800 (中国标准时间)] // 不改变原数组
```

## 常用操作

### 数组去重

对象的`key`
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

使用`Set`
```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var newArr = Array.from(new Set(arr));
// var newArr = [...(new Set(arr))]; // Spread操作符将一个数组转为用逗号分隔的参数序列
console.log(newArr); // [1, 2, 3, 5]
```

使用`indexOf`
```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var newArr = [];
arr.forEach((v) => {
    if(newArr.indexOf(v) === -1)  newArr.push(v);
})
console.log(newArr); // [1, 2, 3, 5]
// 使用find、findIndex、includes思路相同
```

### 扁平化数组

使用`flat`
```javascript
var arr = [1, 2, [3, 4, [5]]];
var newArr = arr.flat(2);
console.log(newArr); // [1, 2, 3, 4, 5]
```

递归实现`flat`
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
var newArr = _flat(arr, 1); // 扁平化一层
console.log(newArr); // [1, 2, 3, 4, [5]]
```


### 统计一个字符串中出现最多的字符

使用数组将字符的`ASCII`码作为`key`制作桶
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

直接使用对象制作桶
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

### 找出数组中的最大值

遍历一遍数组
```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var max = -Infinity;
arr.forEach((v) => {
    if(v > max) max = v;
})
console.log(max); // 5
```

使用`Math`
```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var max = Math.max(...arr);
console.log(max); // 5
```

使用`reduce`
```javascript
var arr = [1, 2, 3, 1, 1, 1, 3, 5, 3];
var max = arr.reduce((a,v) => { return a > v ? a : v; })
console.log(max); // 5
```

### 拷贝数组

遍历数组使用`push`
```javascript
var arr = [1, 2, 3, 4, 5];
var newArr = [];
arr.forEach( v => newArr.push(v) );
console.log(newArr); // [1, 2, 3, 4, 5]
// 也可以使用unshift()后reverse()
```

使用`concat`
```javascript
var arr = [1, 2, 3, 4, 5];
var newArr = [].concat(arr);
console.log(newArr); // [1, 2, 3, 4, 5]
```

使用`slice`
```javascript
var arr = [1, 2, 3, 4, 5];
var newArr = arr.slice(0);
console.log(newArr); // [1, 2, 3, 4, 5]
```

### 随机打乱一个数组

随机交换`N`次
```javascript
function randomInt(a, b) { // 返回随机数
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

随机排序
```javascript
var arr = [1, 2, 3, 4, 5];
arr.sort( (v1, v2) => {
    return Math.random() >=0.5 ? 1 :-1;
})
console.log(arr);
```


## 参考

```
https://www.jianshu.com/p/4db36e910312
https://blog.csdn.net/m0_37686205/article/details/88358126
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array
```
