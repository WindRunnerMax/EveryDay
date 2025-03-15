# Delta线性数据结构模型设计
数据模型的设计是编辑器的核心基础，其直接影响了选区模型、`DOM`模型、状态管理等模块的设计。例如在`quill`中的选区模型是`index + len`的表达，而`slate`中则是`anchor + focus`的表达，这些都是基于数据模型的设计而来的。因此我们从零实现的富文本编辑器就需要从数据模型的设计开始，之后就可以逐步实现其他模块。

- 开源地址: <https://github.com/WindRunnerMax/BlockKit>
- 在线编辑: <https://windrunnermax.github.io/BlockKit/>
- 项目笔记: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

从零实现富文本编辑器项目的相关文章:

- [深感一无所长，准备试着从零开始写个富文本编辑器]()
- [从零实现富文本编辑器-基于MVC模式的编辑器架构设计]()
- [从零实现富文本编辑器-Delta线性数据结构模型设计]()

## Delta
在先前的架构设计中我们已经提到了，我们实现的扁平数据结构且独立分包设计，无论是在编辑器中操作，还是在服务端数据解析，都可以更加方便地处理。相比较来说，嵌套的数据结构能够更好地对齐`DOM`表达，然而这样对于数据的操作却变得更加复杂。

因此在数据结构的设计上，我们是基于`quill`的`delta`结构进行了改造。最主要的部分是将其改造为`immutable`的实现，在编辑器中实际是维护的状态而不是本身的`delta`结构。并且精简了整个数据模型的表达，将复杂的`insert`与`Attribute`类型缩减，那么其操作逻辑的复杂度也会降低。

`delta`是一种简洁而功能强大的格式，用于描述文档内容及其变化。该格式基于`JSON`，不仅便于阅读，同时也易于机器解析。通过使用`delta`描述的内容，可以准确地描述任何富文本文档的内容和格式信息，避免了`HTML`中常见的歧义和复杂性。

`delta`由一系列操作组成，这些操作描述了对文档进行的更改。常见的操作包括`insert`、`delete`、`retain`。需要注意的是，这些操作不依赖于具体的索引位置，其总是描述当前索引位置的更改，并且可以通过`retain`来移动指针位置。

`delta`既可以表示整个文档，也可以表示对文档进行的更改。那么在这里我们将`delta`的主要类对象及相关操作逻辑进行描述，特别是在编辑器中实际应用场景，以及主要的改造和相关类型声明。

### insert
`insert`是将数据插入到`delta`的操作，这就是`delta`。当描述整个文档内容时，整个数据的内容应该全部都是`insert`。首个参数是要插入的文本内容，第二个参数是可选的属性对象，用于描述文本的格式信息。

```js
const delta = new Delta();
delta.insert("123").insert("567", { a: "1" });
// [{"insert":"123"},{"insert":"567","attributes":{"a":"1"}}]
```

原始的`insert`参数是可以对象类型的`Embed`结构，这种结构可以表达`Image`、`Video`、`Mention`等非文本结构的数据，而属性`AttributeMap`参数是`Record<string, unknown>`类型，这样用来描述复杂属性值。

在这里我们将其精简了，`insert`参数仅支持`string`类型，而具体的`schema`则在编辑器的初始化时定义，格式信息则收归于`Attrs`中描述。而`AttributeMap`则改为`Record<string, string>`类型，并且可以避免诸如`CloneDeep`、`isEqual`等对于复杂数据结构的实现。

其实在`EasySync`中就是将`Attribute`就是`[string, string]`类型，在这里我们也是使用了类似的设计。在这种基础结构设计下，我们更推荐将属性值扁平地放置于`attributes`属性中，而不是使用单个属性值作为`key`，将所有属性值嵌套地放置于`value`中。

```js
export interface AttributeMap {
  [key: string]: string;
}
```

`delta`整个名字通常会用于描述变更，那么除了描述整个文档内容外，当然还可以描述文档内容的变更。不过应用变更的内容需要用到`compose`，这个方法的描述我们在后边再看。

```js
const delta1 = new Delta().insert("123");
const delta2 = new Delta().insert("456");
delta1.compose(delta2); // [{"insert":"456123"}]
```

### delete
`delete`是描述了删除内容的长度，由于上述的定义我们现在的内容全部都是文本，在原始的数据定义中嵌入`Embed`的长度为`1`。

```js
const delta = new Delta().insert("123");
delta.compose(new Delta().delete(1)); // [{"insert":"23"}]
```

其实这里是比较有趣的事情，通过`delete`来描述变更时，无法得知究竟删除了哪些内容。那么这种情况下，进行`invert`的时候就需要额外的数据来构造`insert`操作。类似的场景在`OT-JSON`中，内容描述是直接写入`op`的，因此可以直接根据`op`来进行`invert`操作。

```js
const delta = new Delta().insert("123");
const del = new Delta().delete(1);
const invert1 = del.invert(delta); // [{"insert":"1"}]
const delta2 = delta.compose(del); // [{"insert":"23"}]
delta2.compose(invert1); // [{"insert":"123"}]
```

### retain
`retain`是描述了保留内容的长度，换句话说，这个操作可以用来移动指针。

```js
const delta = new Delta().insert("123");
delta.compose(new Delta().retain(1).insert("a")); // [{"insert":"1a23"}]
```

同时`retain`操作也可以用于修改内容的属性值，此外如果想删除某个属性，只需要将`value`设置为`""`即可。

```js
const delta = new Delta().insert("123");
const d2 = new Delta().retain(1).retain(1, { "a": "1" });
const d3 = delta.compose(d2); // [{"insert":"1"},{"insert":"2","attributes":{"a":"1"}},{"insert":"3"}]
d3.compose(new Delta().retain(1).retain(1, { "a": "" })); // [{"insert":"123"}]
```

### push
`push`方法是上述的`insert`、`delete`、`retain`依赖的基础方法，主要实现是将内容推入到`delta`维护的数组中。这里的实现非常重要部分是`op`的合并，当属性值相同时，则需要将其合并为单个`op`。

```js
const delta = new Delta();
delta.push({ insert: "123" }).push({ insert: "456" }); // [{"insert": "123456"}]
```

当然这里不仅仅是`insert`操作会合并，对于`delete`、`retain`操作也是一样的。这里的合并操作是基于`op`的`attributes`属性值，如果`attributes`属性值不同，则会被视为不同的`op`，不会自动合并。

```js
const delta = new Delta();
delta.push({ delete: 1 }).push({ delete: 1 }); // [{"delete": 2}]
const delta2 = new Delta();
delta2.push({ retain: 1 }).push({ retain: 1 }); // [{"retain": 2}]
const delta3 = new Delta();
delta3.push({ retain: 1 }).push({ retain: 1, attributes: { a: "1"} }); // [{"retain": 1}, {"retain": 1, "attributes": {"a": "1"}}]
```

### 


## EasySync

## Slate

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://github.com/slab/delta/blob/main/src/Delta.ts>
- <https://github.com/slab/delta/blob/main/src/AttributeMap.ts>
- <https://github.com/ether/etherpad-lite/blob/develop/src/static/js/Changeset.ts>
- <https://github.com/ether/etherpad-lite/blob/develop/src/static/js/AttributePool.ts>
- <https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/interfaces/operation.ts>
- <https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/interfaces/transforms/general.ts>

