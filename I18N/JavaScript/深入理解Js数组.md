# Understanding JavaScript Arrays Deeply
In `Js`, arrays exist in two forms. One is the fast array, which stores data in contiguous memory, similar to `C/C++`, and the other is the slow array with a `HashTable` structure, a typical dictionary format.

## Description
In this article, all tests are based on the `V8` engine and the browser version used is `Chrome 83.0`. Of course, directly using `Node` is also possible. Usually, arrays are created in the following three ways. Of course, changing the `length` property directly can also change the length of the array, thus creating an array of a specified length. However, this method is not commonly used.

```javascript
var arr = [];
var arr = Array(100);
var arr = new Array(100);
```

Of the above three methods, the first method of creating arrays using literals is the most commonly used. The second and third methods are essentially the same. `Array` internally determines the `this` pointer. In the `V8` engine, the default way to directly create arrays is to create a fast array, which directly allocates a certain amount of memory for the array. You can directly save a snapshot under the `Memory` tab in `Chrome` and then execute the following code in the `Console`. You can see that the memory increases by about `25MB`, which means that it has allocated a block of memory for the array to use. If using `Node`, you can execute `process.memoryUsage();` to check memory usage.

```javascript
var LIMIT = 6 * 1024 * 1024;
var arr = new Array(LIMIT);
```

For a fast array, it allocates a continuous memory area for data storage, which makes the traversal efficiency much higher. As for the slow array, it is a `HashTable` structure. It can be considered as an object, but with the restriction that the index value can only be a number. In actual use, this numeric index will be forcibly converted to a string. The traversal efficiency is much slower. However, for a sparse array that is a slow array, it can save a large amount of memory space.

For a fast array, directly assigning values can be completed in `27ms`.

```javascript
var LIMIT = 6 * 1024 * 1024;
var arr = new Array(LIMIT);
console.time("Array");
for(var i=0; i<LIMIT; i++) arr[i]=i;
console.timeEnd("Array");
// Array: 27.64697265625ms
```

For a slow array, in this example, first `push` a value to perform a resizing operation. The engine will automatically convert the array into a slow array. The reason why this resizing operation will cause the fast-to-slow array conversion will be explained below. Other operations are similar to those of a fast array, and it can be seen that completing the operation takes `627ms`.

```javascript
var LIMIT = 6 * 1024 * 1024;
var arr = new Array(LIMIT);
arr.push(1); // To convert the fast array to a slow array
console.time("Array");
for(var i=0; i<LIMIT; i++) arr[i]=i;
console.timeEnd("Array");
// Array: 627.759033203125ms
```

If data is not continuously inserted into the fast array but it is used as a sparse array, and the degree of sparsity is not high, it will still be in the form of a fast array, and the conversion to a slow array will not be triggered.

```javascript
var LIMIT = 6 * 1024 * 1024;
var arr = new Array(LIMIT);
console.time("Array");
for(var i=0; i<LIMIT; i += 2) arr[i]=i; // Loop using i += 2
console.timeEnd("Array");
// Array: 15.27001953125ms
```

Inserting different types of data into the array may not necessarily cause the array to convert from fast to slow. For example, in the following example, inserting string, numeric, boolean values, and object references does not reduce insertion efficiency.

```javascript
var LIMIT = 6 * 1024 * 1024;
var arr = new Array(LIMIT);
var obj = {};
console.time("Array");
for(var i=1; i<LIMIT; i++) {
    if(i < 100) arr[i] = i;
    else if(i < 1000) arr[i] = "T";
    else if(i < 10000) arr[i] = true;
    else arr[i] = obj;
}
console.timeEnd("Array");
// Array: 32.123046875ms
```

Regarding the `empty` in a sparse array, it is an empty object reference. In the `ES6` documentation, `empty` is defined to be equal to `undefined`, and it should be treated that way in any situation. In `indexOf`, `filter`, and `forEach`, it automatically ignores `empty`, in `includes` it is considered as `undefined`, and it is preserved in `map`.

```javascript
var arr = new Array(3);
arr[0] = 1;
console.log(arr); // (3) [1, empty × 2]
console.log(arr[1] === undefined); // true
console.log(arr.indexOf(undefined)); // -1
console.log(arr.filter(v => v)); // [1]
arr.forEach( v => console.log(v)); // 1
console.log(arr.includes(undefined)); // true
console.log(arr.map(v => v)); // [1, empty × 2]
```

If you really need to create a dense array, that is, without `empty`, you can use the following ways to do so.

```javascript
[...new Array(3)]; // (3) [undefined, undefined, undefined]
Array.apply(null, new Array(3)); // (3) [undefined, undefined, undefined]
Array.from(new Array(3)); // (3) [undefined, undefined, undefined]
```

In `Js`, there are also typed arrays. An `ArrayBuffer` is a data type used to represent a generic, fixed-length binary data buffer. It cannot directly manipulate the contents of an `ArrayBuffer`. You need to create a view of a typed array or a `DataView` that describes the buffer data format and use them to read and write the contents of the buffer. In simple terms, it is a large continuous area of memory that can be used for efficient storage and retrieval operations, among other things.

```javascript
var LIMIT = 6 * 1024 * 1024;
var buffer = new ArrayBuffer(LIMIT);
var arr = new Int32Array(buffer);
console.time("Array");
for(var i=0; i<LIMIT; i++) arr[i]=i;
console.timeEnd("Array");
// Array: 30.139892578125ms
```
When it comes to fast and slow arrays, both have their own characteristics. In practical use, they can be converted into each other. In terms of storage, memory usage, and iteration efficiency, we have the following summaries:
* Storage: Fast arrays have contiguous memory, while slow arrays' memory is scattered.
* Memory usage: Due to the contiguous memory of fast arrays, a large block of memory may be needed for their use, and there may be many holes, which is more memory-consuming. Slow arrays will not have holes and the memory is more efficient, as it is all scattered.
* Iteration efficiency: The iteration speed of fast arrays is fast because of the contiguous space, while slow arrays need to find the position of the `key` each time, so the iteration efficiency is lower.

## Source Code Analysis
A simple analysis of the array aspect of the `V8` engine, with the `COMMIT ID` of `db4822d`. From the definition of arrays in `V8`, it can be understood that arrays can be in two modes. For the `Fast` mode, the storage structure is a `FixedArray` and the length is less than or equal to `elements.length()`. The array can grow and shrink using `push` and `pop`.
```cpp
// v8/src/objects/js-array.h // line 19
// The JSArray describes JavaScript Arrays
//  Such an array can be in one of two modes:
//    - fast, backing storage is a FixedArray and length <= elements.length();
//       Please note: push and pop can be used to grow and shrink the array.
//    - slow, backing storage is a HashTable with numbers as keys.
class JSArray : public JSObject {
 public:
  // [length]: The length property.
  DECL_ACCESSORS(length, Object)
 
 //...
```

### Fast Arrays
Fast arrays are a linear storage method. The internal storage is continuous, and for a newly created empty array, the default storage method is a fast array. The length of a fast array is adjustable. It dynamically adjusts the storage space size based on elements being added and removed. Let's first analyze the expansion mechanism. For an initially empty array, the pre-allocated size is `4`. When the array is extended, for example using `push`, if the memory is insufficient, the array is expanded. The minimum expansion capacity is `16`, and the expansion formula is `new_capacity = old_capacity + old_capacity / 2 + 16`, which means allocating a memory of size `1.5` times the previous capacity plus `16`, copying the original data to the new memory, then `length + 1` and returning `length`.


```cpp
// v8/src/objects/js-array.h // line 105
// Number of element slots to pre-allocate for an empty array.
static const int kPreallocatedArrayElements = 4;

// v8/src/objects/js-objects.h // line 537
static const uint32_t kMinAddedElementsCapacity = 16;

// v8/src/objects/js-objects.h // line 540 // Calculate the expanded capacity
// Computes the new capacity when expanding the elements of a JSObject.
static uint32_t NewElementsCapacity(uint32_t old_capacity) {
    // (old_capacity + 50%) + kMinAddedElementsCapacity
    return old_capacity + (old_capacity >> 1) + kMinAddedElementsCapacity;
}

// v8/src/code-stub-assembler.cc // line 5137 // Expansion implementation
Node* CodeStubAssembler::CalculateNewElementsCapacity(Node* old_capacity,
                                                      ParameterMode mode) {
  CSA_SLOW_ASSERT(this, MatchesParameterMode(old_capacity, mode));
  Node* half_old_capacity = WordOrSmiShr(old_capacity, 1, mode);
  Node* new_capacity = IntPtrOrSmiAdd(half_old_capacity, old_capacity, mode);
  Node* padding =
      IntPtrOrSmiConstant(JSObject::kMinAddedElementsCapacity, mode);
  return IntPtrOrSmiAdd(new_capacity, padding, mode);
}

// v8/src/code-stub-assembler.cc // line 5202 // Memory copy
// Allocate the new backing store.
Node* new_elements = AllocateFixedArray(to_kind, new_capacity, mode);
// Copy the elements from the old elements store to the new.
// The size-check above guarantees that the |new_elements| is allocated
// in new space so we can skip the write barrier.
CopyFixedArrayElements(from_kind, elements, to_kind, new_elements, capacity,
                     new_capacity, SKIP_WRITE_BARRIER, mode);
StoreObjectField(object, JSObject::kElementsOffset, new_elements);
```
When an array performs a `pop` operation, it will check the capacity of the array after popping to determine if it needs to be reduced. If the capacity is greater than or equal to `length * 2 + 16`, then the capacity will be shrunk accordingly. Otherwise, uninitialized positions will be filled with `HOLES` objects. `elements_to_trim` represents the size to trim, and it needs to be determined whether to shrink all the vacant space or only half based on `length + 1` and `old_length`.

```cpp
// v8/src/elements.cc // line 783
if (2 * length + JSObject::kMinAddedElementsCapacity <= capacity) {
    // If more than half the elements won't be used, trim the array.
    // Do not trim from short arrays to prevent frequent trimming on
    // repeated pop operations.
    // Leave some space to allow for subsequent push operations.
    int elements_to_trim = length + 1 == old_length
                                ? (capacity - length) / 2
                                : capacity - length;
    isolate->heap()->RightTrimFixedArray(*backing_store, elements_to_trim);
    // Fill the non-trimmed elements with holes.
    BackingStore::cast(*backing_store)
        ->FillWithHoles(length,
                        std::min(old_length, capacity - elements_to_trim));
} else {
    // Otherwise, fill the unused tail with holes.
    BackingStore::cast(*backing_store)->FillWithHoles(length, old_length);
}
```
The mentioned `HOLES` object refers to the positions in the array that have been allocated space but have not stored any elements. In the "Fast Elements" mode, there is an extension called the "Fast Holey Elements" mode. This mode is suitable for arrays with holes, where only some indices contain data and others do not. In this case, the indices without values will store a special value "empty," so that accessing these positions will return "undefined". Like the "Fast Elements" mode, it dynamically allocates contiguous storage space, and the size of the allocated space is determined by the largest index value. When an array is defined without specifying a capacity, V8 defaults to implementing it in "Fast Elements" mode. If a capacity is specified when defining the array, such as `new Array(100)` in the example above, it will be implemented using the "Fast Holey Elements" mode.

In the "Fast Elements" mode, the V8 engine further optimizes arrays based on the element type. If all elements are of integer type, the array's type is marked as `PACKED_SMI_ELEMENTS`. If there are only integer and floating-point elements, the array's type is `PACKED_DOUBLE_ELEMENTS`. Other combinations of element types are marked as `PACKED_ELEMENTS`. These array types are not static and can change at runtime, but an array's type can only transition from a specific type to a generic type. For example, an array initially marked as `PACKED_SMI_ELEMENTS` can only transition to `PACKED_DOUBLE_ELEMENTS` or `PACKED_ELEMENTS`. Similarly, `PACKED_DOUBLE_ELEMENTS` can only transition to `PACKED_ELEMENTS`. Once an array is marked as `PACKED_ELEMENTS`, it cannot transition further and cannot revert back. These three types of arrays are all considered dense arrays. In contrast, there are sparse arrays, labeled as `HOLEY_ELEMENTS`, which also have three types. Any `PACKED` type can transition to `HOLEY`. `PACKED_SMI_ELEMENTS` can convert to `HOLEY_SMI_ELEMENTS`, `PACKED_DOUBLE_ELEMENTS` can convert to `HOLEY_DOUBLE_ELEMENTS`, and `PACKED_ELEMENTS` can convert to `HOLEY_ELEMENTS`. It is important to note that while arrays can be converted to "HOLEY" mode, it does not necessarily mean that the array has been converted to a slow array.

### Slow Arrays
Slow arrays are a form of dictionary-based memory representation. They do not require large continuous storage space, saving memory, but their efficiency is lower due to the need to maintain a `HashTable`. In V8, slow arrays are implemented as a `Dictionary` structure.

```cpp
// v8/src/objects/dictionary.h // line 27
class Dictionary : public HashTable<Derived, Shape> {
    typedef HashTable<Derived, Shape> DerivedHashTable;
```

```cpp
public:
    typedef typename Shape::Key Key;
    // Get the value stored at the specified entry.
    Object ValueAt(int entry) {
        return this->get(DerivedHashTable::EntryToIndex(entry) + 1);
    }

    // Set the value for the specified entry.
    void ValueAtPut(int entry, Object value) {
       this->set(DerivedHashTable::EntryToIndex(entry) + 1, value);
    }
    
    // Get the property details for the property stored at the specified entry.
    PropertyDetails DetailsAt(int entry) {
       return Shape::DetailsAt(Derived::cast(*this), entry);
    }

    // ...
}
```

### Type Conversion

#### Fast Array to Slow Array
There are mainly two cases for converting a fast array to a slow array:  
* When the new capacity is greater than or equal to `3 * 3` times the expanded capacity, it will be converted to a slow array.  
* When the difference between the added index value `index` and the current capacity `capacity` is greater than or equal to `1024`, which means there are at least `1024` `HOLEY` elements, it will be converted to a slow array; for example, if you define an array `arr` with a length of `1` and then assign a value using `arr[2000]=1`, the array will be converted to a slow array.

```cpp
// v8/src/objects/js-objects-inl.h // line 992
static inline bool ShouldConvertToSlowElements(JSObject object,
                                               uint32_t capacity,
                                               uint32_t index,
                                               uint32_t* new_capacity) {
  STATIC_ASSERT(JSObject::kMaxUncheckedOldFastElementsLength <=
                JSObject::kMaxUncheckedFastElementsLength);
  if (index < capacity) {
    *new_capacity = capacity;
    return false;
  }
  if (index - capacity >= JSObject::kMaxGap) return true; // Second type of conversion
  *new_capacity = JSObject::NewElementsCapacity(index + 1);
  DCHECK_LT(index, *new_capacity);
  // TODO(ulan): Check if it works with young large objects.
  if (*new_capacity <= JSObject::kMaxUncheckedOldFastElementsLength ||
      (*new_capacity <= JSObject::kMaxUncheckedFastElementsLength &&
       ObjectInYoungGeneration(object))) {
    return false;
  }
  // If the fast-case backing storage takes up much more memory than a
  // dictionary backing storage would, the object should have slow elements.
  int used_elements = object->GetFastElementsUsage();
  uint32_t size_threshold = NumberDictionary::kPreferFastElementsSizeFactor *
                            NumberDictionary::ComputeCapacity(used_elements) *
                            NumberDictionary::kEntrySize;
  return size_threshold <= *new_capacity; // First type of conversion
}
```

```cpp
// v8/src/objects/js-objects.h // line 738
// JSObject::kMaxGap constant
// Maximal gap that can be introduced by adding an element beyond
// the current elements length.
static const uint32_t kMaxGap = 1024;

// v8/src/objects/dictionary.h // line 362
// NumberDictionary::kPreferFastElementsSizeFactor constant
// JSObjects prefer dictionary elements if the dictionary saves this much
// memory compared to a fast elements backing store.
static const uint32_t kPreferFastElementsSizeFactor = 3;

// v8/src/objects/hash-table-inl.h // line 76
// NumberDictionary::ComputeCapacity(used_elements)
// NumberDictionary inherits from Dictionary and then from HashTable
// static
int HashTableBase::ComputeCapacity(int at_least_space_for) {
  // Add 50% slack to make slot collisions sufficiently unlikely.
  // See matching computation in HashTable::HasSufficientCapacityToAdd().
  // Must be kept in sync with CodeStubAssembler::HashTableComputeCapacity().
  int raw_cap = at_least_space_for + (at_least_space_for >> 1);
  int capacity = base::bits::RoundUpToPowerOfTwo32(raw_cap);
  return Max(capacity, kMinCapacity);
}

// v8/src/objects/dictionary.h // line 260
// NumberDictionary::kEntrySize constant
// NumberDictionary inherits from Dictionary passing NumberDictionaryShape as Shape, and inherits HashTable 
// HashTable defines static const int kEntrySize = Shape::kEntrySize;
static const int kEntrySize = 3;
```

#### Slow Array to Fast Array Conversion
When the elements of a slow array can fit into a fast array, the length is less than `Smi::kMaxValue`, and the fast array saves only `50%` of the space, it will be converted to a fast array.

```cpp
// v8/src/objects/js-objects.cc // line 4523
static bool ShouldConvertToFastElements(JSObject object,
                                        NumberDictionary dictionary,
                                        uint32_t index,
                                        uint32_t* new_capacity) {
  // If properties with non-standard attributes or accessors were added, we
  // cannot go back to fast elements.
  if (dictionary->requires_slow_elements()) return false;

  // Adding a property with this index will require slow elements.
  if (index >= static_cast<uint32_t>(Smi::kMaxValue)) return false;
```

```cpp
if (object->IsJSArray()) {
  Object length = JSArray::cast(object)->length();
  if (!length->IsSmi()) return false;
  *new_capacity = static_cast<uint32_t>(Smi::ToInt(length));
} else if (object->IsJSSloppyArgumentsObject()) {
  return false;
} else {
  *new_capacity = dictionary->max_number_key() + 1;
}
*new_capacity = Max(index + 1, *new_capacity);

uint32_t dictionary_size = static_cast<uint32_t>(dictionary->Capacity()) *
                           NumberDictionary::kEntrySize;

// Turn fast if the dictionary only saves 50% space.
return 2 * dictionary_size >= *new_capacity;
}

// v8/src/objects/smi.h // line 106
static constexpr int kMaxValue = kSmiMaxValue;

// v8/include/v8-internal.h // line 87
static constexpr intptr_t kSmiMaxValue = -(kSmiMinValue + 1);
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://v8.js.cn/blog/elements-kinds/
https://github.com/JunreyCen/blog/issues/10
https://juejin.im/post/5e1d919f5188254c3c275145
https://juejin.im/post/5df1e21bf265da33c24fe9f4
https://juejin.im/entry/5a9c0b606fb9a028d663a491
https://juejin.im/entry/59ae664d518825244d207196
https://blog.csdn.net/github_34708151/article/details/105463108
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Typed_arrays
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
https://stackoverflow.com/questions/46526520/why-are-we-allowed-to-create-sparse-arrays-in-javascript
```