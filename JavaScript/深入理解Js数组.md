# 深入理解Js数组
在`Js`中数组存在两种形式，一种是与`C/C++`等相同的在连续内存中存放数据的快数组，另一种是`HashTable`结构的慢数组，是一种典型的字典形式。

## 描述
在本文中所有的测试都是基于`V8`引擎的，使用的浏览器版本为`Chrome 83.0`，当然直接使用`Node`也是可以的。通常创建数组一般用以下三种方式，当然对于直接更改`length`属性的方式也可以达到改变数组长度的目的，从而实现创建指定长度的数组，只是并不常用。

```javascript
var arr = [];
var arr = Array(100);
var arr = new Array(100);
```

对于上面三种方式，第一种使用字面量创建数组的方式是最常用的，第二种与第三种方式本质上是一样的，`Array`内部实现会判断`this`指针。在`V8`引擎中，直接创建数组默认的方式是创建快数组，会直接为数组开辟一定大小的内存，关于这一点可以直接在`Chrome`的`Memory`选项卡下首先保存快照然后在`Console`执行如下代码，可以看到内存增加了`25MB`左右，说明其开辟了一块内存区域供数组使用，假如使用`Node`的话可以执行`process.memoryUsage();`来查看内存占用。

```javascript
var LIMIT = 6 * 1024 * 1024;
var arr = new Array(LIMIT);
```

对于快数组，其开辟了一块连续的内存区域用来提供数据存储，在遍历的效率上会高得多。对于慢数组，是`HashTable`结构，可以认为其就是一个对象，只不过索引的值只能为数字，在实际使用中这个数字索引会被强制转为字符串，在遍历的效率上会慢的多，但是对于一个数组是慢数组且为稀疏数组的情况下，可以节省大量内存区域。  
对于快数组，直接赋值，可以看到完成操作需要`27ms`。

```javascript
var LIMIT = 6 * 1024 * 1024;
var arr = new Array(LIMIT);
console.time("Array");
for(var i=0; i<LIMIT; i++) arr[i]=i;
console.timeEnd("Array");
// Array: 27.64697265625ms
```
对于慢数组，本例首先`push`一个值用来进行扩容操作，引擎会自动将该数组转换为慢数组，关于为什么本次扩容操作会引起快慢数组的转换会在下边讲到，其他操作与快数组类似，可以看到完成操作需要`627ms`。

```javascript
var LIMIT = 6 * 1024 * 1024;
var arr = new Array(LIMIT);
arr.push(1); // 为了将快数组转换为慢数组
console.time("Array");
for(var i=0; i<LIMIT; i++) arr[i]=i;
console.timeEnd("Array");
// Array: 627.759033203125ms
```

如果在快数组中并不连续插入数据，而是作为稀疏数组去使用，在稀疏的程度不高的时候依旧是快数组的形式，并不会触发转换为慢数组的操作。


```javascript
var LIMIT = 6 * 1024 * 1024;
var arr = new Array(LIMIT);
console.time("Array");
for(var i=0; i<LIMIT; i += 2) arr[i]=i; // 循环的i为 i += 2
console.timeEnd("Array");
// Array: 15.27001953125ms
```

在数组中插入不同类型的数据并不一定会引起快慢数组的转换，例如下面这个例子中插入了字符串、数值、布尔类型的值以及对象的引用，在插入效率上并不低。

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

关于稀疏数组中的`empty`，是一个空的对象引用，在`ES6`的文档中规定了`empty`就是等于`undefined`的，在任何情况下都应该这样对待`empty`，在`indexOf`、`filter`、`forEach`中会自动忽略掉`empty`，在`includes`中会认为其等于`undefined`，`map`中则会保留`empty`。

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

如果必须要开辟一个密集数组，也就是不存在`empty`的情况，可以使用下面的方式去开辟。

```javascript
[...new Array(3)]; // (3) [undefined, undefined, undefined]
Array.apply(null, new Array(3)); // (3) [undefined, undefined, undefined]
Array.from(new Array(3)); // (3) [undefined, undefined, undefined]
```


在`Js`中还存在类型化数组，`ArrayBuffer`是一种数据类型，用来表示一个通用的、固定长度的二进制数据缓冲区，不能直接操纵一个`ArrayBuffer`中的内容，需要创建一个类型化数组的视图或一个描述缓冲数据格式的`DataView`，使用它们来读写缓冲区中的内容。简单来说就是一块大的连续的内存区域，可以用它来做一些高效的存取操作等。

```javascript
var LIMIT = 6 * 1024 * 1024;
var buffer = new ArrayBuffer(LIMIT);
var arr = new Int32Array(buffer);
console.time("Array");
for(var i=0; i<LIMIT; i++) arr[i]=i;
console.timeEnd("Array");
// Array: 30.139892578125ms
```
对于快慢数组，两者的也有各自的特点，在实际使用的过程中是存在相互转换的，在存储方式、内存使用、遍历效率方面有如下总结：
* 存储方式方面：快数组内存中是连续的，慢数组在内存中是零散分配的。
* 内存使用方面：由于快数组内存是连续的，可能需要开辟一大块供其使用，其中还可能有很多空洞，是比较费内存的。慢数组不会有空洞的情况，且都是零散的内存，比较节省内存空间。
* 遍历效率方面：快数组由于是空间连续的，遍历速度很快，而慢数组每次都要寻找`key` 的位置，遍历效率会差一些。


## 源码分析
简单分析`V8`引擎的数组方面的内容，`COMMIT ID`为`db4822d`。通过在`V8`数组的定义可以了解到，数组可以处于两种模式，`Fast`模式的存储结构是`FixedArray`并且长度小于等于`elements.length`，可以通过`push`和`pop`增加和缩小数组。`slow`模式的存储结构是一个以数字为键的`HashTable`。

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

### 快数组
快数组是一种线性的存储方式，内部存储是连续的内存，新创建的空数组，默认的存储方式是快数组，快数组长度是可变的，可以根据元素的增加和删除来动态调整存储空间大小，内部是通过扩容和收缩机制实现。首先来分析以下扩容机制，默认的空数组预分配的大小为`4`，当数组进行扩充操作例如`push`时，数组的内存若不够则将进行扩容，最小的扩容容量为`16`，扩容的公式为`new_capacity = old_capacity + old_capacity /2 +  16`，即申请一块原容量`1.5`倍加`16`这样大小的内存，将原数据拷贝到新内存，然后`length + 1`，并返回`length`。

```cpp
// v8/src/objects/js-array.h // line 105
// Number of element slots to pre-allocate for an empty array.
static const int kPreallocatedArrayElements = 4;

// v8/src/objects/js-objects.h // line 537
static const uint32_t kMinAddedElementsCapacity = 16;

// v8/src/objects/js-objects.h // line 540 // 计算扩容后的容量
// Computes the new capacity when expanding the elements of a JSObject.
static uint32_t NewElementsCapacity(uint32_t old_capacity) {
    // (old_capacity + 50%) + kMinAddedElementsCapacity
    return old_capacity + (old_capacity >> 1) + kMinAddedElementsCapacity;
}

// v8/src/code-stub-assembler.cc // line 5137 // 扩容的实现
Node* CodeStubAssembler::CalculateNewElementsCapacity(Node* old_capacity,
                                                      ParameterMode mode) {
  CSA_SLOW_ASSERT(this, MatchesParameterMode(old_capacity, mode));
  Node* half_old_capacity = WordOrSmiShr(old_capacity, 1, mode);
  Node* new_capacity = IntPtrOrSmiAdd(half_old_capacity, old_capacity, mode);
  Node* padding =
      IntPtrOrSmiConstant(JSObject::kMinAddedElementsCapacity, mode);
  return IntPtrOrSmiAdd(new_capacity, padding, mode);
}

// v8/src/code-stub-assembler.cc // line 5202 // 内存的拷贝
// Allocate the new backing store.
Node* new_elements = AllocateFixedArray(to_kind, new_capacity, mode);
// Copy the elements from the old elements store to the new.
// The size-check above guarantees that the |new_elements| is allocated
// in new space so we can skip the write barrier.
CopyFixedArrayElements(from_kind, elements, to_kind, new_elements, capacity,
                     new_capacity, SKIP_WRITE_BARRIER, mode);
StoreObjectField(object, JSObject::kElementsOffset, new_elements);
```
当数组执行`pop`操作时，会判断`pop`后数组的容量，是否需要进行减容，如果容量大于等于`length * 2 + 16`，则进行收缩容量调整，否则用`HOLES`对象填充未被初始化的位置，`elements_to_trim`就是要裁剪的大小，需要根据`length + 1`和`old_length`判断是将空出的空间全部收缩掉还是只收缩一半。

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
上边提到的`HOLES`对象指的是数组中分配了空间，但是没有存放元素的位置，对于`HOLES`，在`Fast Elements`模式中有一个扩展，称为`Fast Holey Elements`模式。`Fast Holey Elements`模式适合于数组中的有空洞情况，即只有某些索引存有数据，而其他的索引都没有赋值的情况，此时没有赋值的数组索引将会存储一个特殊的值`empty`，这样在访问这些位置时就可以得到`undefined`。`Fast Holey Elements`模式与`Fast Elements`模式一样，会动态分配连续的存储空间，分配空间的大小由最大的索引值决定。定义数组时，如果没有设置容量，`V8`会默认使用`Fast Elements`模式实现，如果定义数组时进行了容量的指定，如上文中的`new Array(100)`，就会以`Fast Holey Elements`模式实现。  
在`Fast Elements`模式下`V8`引擎还根据元素类型对数组类型做了细分用以优化数组，当全部元素都为整数型的话，那么这个数组的类型就被标记为`PACKED_SMI_ELEMENTS`。如果只存在整数型和浮点型的元素类型，那么这个数组的类型为`PACKED_DOUBLE_ELEMENTS`。除此以外，一个数组包含其它的元素，都被标记为`PACKED_ELEMENTS`。而这些数组类型并非一成不变，而是在运行时随时更改的，但是数组的类型只能从特定种类变更为普通种类。即初始为`PACKED_SMI_ELEMENTS`的数组，只能过渡为`PACKED_DOUBLE_ELEMENTS`或者`PACKED_ELEMENTS`。而`PACKED_DOUBLE_ELEMENTS`只能过渡为`PACKED_ELEMENTS`。至于初始就是`PACKED_ELEMENTS`类型的数组，就无法再过渡了，无法逆向过渡。而上述的这三种类型，都属于密集数组，与之相对应的，是稀疏数组，标记为`HOLEY_ELEMENTS`，稀疏数组同样具有三种类型，任何一种`PACKED`都可以过渡到`HOLEY`。`PACKED_SMI_ELEMENTS`可以转换为`HOLEY_SMI_ELEMENTS`，`PACKED_DOUBLE_ELEMENTS`可以转换为`HOLEY_DOUBLE_ELEMENTS`，`PACKED_ELEMENTS`可以转换为`HOLEY_ELEMENTS`。需要注意的是，虽然可以将数组转换为`HOLEY`模式，但是并不一定就代表着这个数组被转换为慢数组。


### 慢数组
慢数组是一种字典的内存形式。不用开辟大块连续的存储空间，节省了内存，但是由于需要维护这样一个`HashTable`，其效率会比快数组低，`V8`中是以`Dictionary`的结构实现的慢数组。

```cpp
// v8/src/objects/dictionary.h // line 27
class Dictionary : public HashTable<Derived, Shape> {
    typedef HashTable<Derived, Shape> DerivedHashTable;

    public:
    typedef typename Shape::Key Key;
    // Returns the value at entry.
    Object ValueAt(int entry) {
        return this->get(DerivedHashTable::EntryToIndex(entry) + 1);
    }

    // Set the value for entry.
    void ValueAtPut(int entry, Object value) {
       this->set(DerivedHashTable::EntryToIndex(entry) + 1, value);
    }
    
    // Returns the property details for the property at entry.
    PropertyDetails DetailsAt(int entry) {
       return Shape::DetailsAt(Derived::cast(*this), entry);
    }

    // ...

}
```

### 类型转换

#### 快数组转慢数组
快数组转换为慢数组主要有以下两种情况：  
* 当新容量大于等于`3 * 3`倍的扩容后的容量，会转变为慢数组。  
* 当加入的索引值`index`比当前容量`capacity`差值大于等于`1024` 时，也就是至少有`1024`个`HOLEY`时，即会转为慢数组，例如定义一个长度为`1`的数组`arr`然后使用`arr[2000]=1`赋值，此时数组就会被转换为慢数组。


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
  if (index - capacity >= JSObject::kMaxGap) return true; // 第二种转换
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
  return size_threshold <= *new_capacity; // 第一种转换
}

// v8/src/objects/js-objects.h // line 738
// JSObject::kMaxGap 常量
// Maximal gap that can be introduced by adding an element beyond
// the current elements length.
static const uint32_t kMaxGap = 1024;

// v8/src/objects/dictionary.h // line 362
// NumberDictionary::kPreferFastElementsSizeFactor 常量
// JSObjects prefer dictionary elements if the dictionary saves this much
// memory compared to a fast elements backing store.
static const uint32_t kPreferFastElementsSizeFactor = 3;

// v8/src/objects/hash-table-inl.h // line 76
// NumberDictionary::ComputeCapacity(used_elements)
// NumberDictionary 继承于 Dictionary 再继承于 HashTable
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
// NumberDictionary::kEntrySize 常量
// NumberDictionary 继承 Dictionary 传入 NumberDictionaryShape作为Shape 继承HashTable 
// HashTable 中定义 static const int kEntrySize = Shape::kEntrySize;
static const int kEntrySize = 3;
```

#### 慢数组转快数组
当慢数组的元素可存放在快数组中且长度小于`Smi::kMaxValue`且对于快数组仅节省了`50%`的空间，则会转变为快数组。

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

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

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
