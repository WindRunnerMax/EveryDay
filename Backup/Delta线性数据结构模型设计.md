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
`insert`方法是将数据插入到`delta`的操作，这就是`delta`。当描述整个文档内容时，整个数据的内容应该全部都是`insert`。首个参数是要插入的文本内容，第二个参数是可选的属性对象，用于描述文本的格式信息。

```js
const delta = new Delta();
delta.insert("123").insert("567", { a: "1" });
// [{"insert":"123"},{"insert":"567","attributes":{"a":"1"}}]
```

原始的`insert`参数是可以对象类型的`Embed`结构，这种结构可以表达`Image`、`Video`、`Mention`等非文本结构的数据，而属性`AttributeMap`参数是`Record<string, unknown>`类型，这样用来描述复杂属性值。

在这里我们将其精简了，`insert`参数仅支持`string`类型，而具体的`schema`则在编辑器的初始化时定义，格式信息则收归于`Attrs`中描述。而`AttributeMap`则改为`Record<string, string>`类型，并且可以避免诸如`CloneDeep`、`isEqual`等对于复杂数据结构的实现。

其实在`EtherPad`中就是将`Attribute`就是`[string, string]`类型，在这里我们也是使用了类似的设计。在这种基础结构设计下，我们更推荐将属性值扁平地放置于`attributes`属性中，而不是使用单个属性值作为`key`，将所有属性值嵌套地放置于`value`中。

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
`delete`方法描述了删除内容的长度，由于上述的定义我们现在的内容全部都是文本，在原始的数据定义中嵌入`Embed`的长度为`1`。

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
`retain`方法描述了保留内容的长度，换句话说，这个操作可以用来移动指针。

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

### slice
`slice`方法是用于截取`delta`的操作，这个方法是基于`op`的`length`属性值进行截取的。

```js
const delta = new Delta().insert("123").insert("456", {a: "1"});
delta.slice(2, 4); // [{"insert":"3"},{"insert":"4","attributes":{"a":"1"}}]
```

### eachLine
`eachLine`方法用于按行迭代整个`delta`，我们的整体数据结构是线性的，但是编辑器`DOM`需要按行来划分内容，因此基于`\n`来划分行就是比较常规的操作了。

这个方法对于编辑器的初始化非常重要，而当初始化完毕后，我们的变更就需要基于状态来实现，而不是每次都需要经过该方法。在这里我们也对其进行了改造，原始的`eachLine`方法是不会携带`\n`节点。

```js
const delta = new Delta().insert("123\n456\n789");
delta.eachLine((line, attributes) => {
  console.log(line, attributes);
});
// [{insert:"123"},{insert:"\n"}] {}
// [{insert:"456"},{insert:"\n"}] {}
// [{insert:"789"},{insert:"\n"}] {}
```

### diff
`diff`方法用于对比两个`delta`之间的差异，这个方法实际上是基于纯文本的`myers diff`来实现。通过将`delta`转换为纯文本，在`diff`过后不断挑选较短的操作部分来实现`delta`之间的`diff`。

其实在我们的实现中完全可以将`diff`方法独立出来，这里唯一引用了外部的`fast-diff`依赖。在`quill`中`diff`是必要的，因为其完全是非受控的输入方式，文本的输入依赖于对`DOM`文本的`diff`来实现，而我们的输入是依赖`beforeinput`事件的半受控输入，因此并不强依赖`diff`。

```js
const delta1 = new Delta().insert("123");
const delta2 = new Delta().insert("126");
delta1.diff(delta2); // [{"retain":2},{"insert":"6"},{"delete":1}]
```

### chop
`chop`方法用于裁剪末尾的`retain`操作，当存在末尾的`retain`且没有属性操作时，其本身是没有意义的，因此可以调用该方法检查并移除。

```js
const delta = new Delta().insert("123").retain(1);
delta.chop(); // [{"insert":"123"}]
```

### compose
`compose`方法可以将两个`delta`合并为一个`delta`，具体来说则是将`B`的`delta`操作应用到`A`的`delta`上，此时返回的是一个新的`delta`对象。当然在我们的实现中，继承了原始`Delta`类重写了`compose`方法，做到了`immutable`。

`compose`在编辑器中的应用场景非常多，例如输入事件、内容粘贴、历史操作等场景中，类似于编辑器的`apply`方法，相当于应用内容变更。

```js
const delta1 = new Delta().insert("123");
const delta2 = new Delta().retain(1).delete(1);
delta1.compose(delta2); // [{"insert":"13"}]
```

### invert
`invert`方法是将`delta`的操作进行反转，这个方法在历史操作中非常重要，因为本身`undo`就是需要将当前的操作进行反转。此外，在实现`OT`的`local-cs`中，`invert`也是非常重要的方法。

值得关注的是，上边也提到了`delete`操作和`retain`操作在本身执行时是不会记录原始内容的，因此在`invert`是需要原始的`delta`作为数据源来进行操作，注意这里的`delta`是最初的`delta`，而不是`invert`后的`delta`。

```js
const delta = new Delta().insert("123");
const del = new Delta().delete(1);
const invert1 = del.invert(delta); // [{"insert":"1"}]
const delta2 = delta.compose(del); // [{"insert":"23"}]
delta2.compose(invert1); // [{"insert":"123"}]
```

### concat
`concat`方法可以连接两个`delta`到新的`delta`中。这个操作与`compose`不同，`compose`是将`B`的操作应用到`A`上，而`concat`则是将`B`的操作追加到`A`的操作后。

```js
const delta1 = new Delta().insert("123");
const delta2 = new Delta().insert("456");
delta1.compose(delta2); // [{"insert":"456123"}]
delta1.concat(delta2); // [{"insert":"123456"}]
```

### transform
`transform`方法是实现操作`OT`协同的基础，即使不实现协同编辑，在编辑器中的历史操作模块中也会需要这部分实现。假设我们现在有用户`A[uid:1]`和用户`B[uid:2]`，此时我们以`uid`定义优先级，则`A`的操作优先级高于`B`，且当前的文档内容为`12`。

那么我们假设`A`在`12`后的位置插入了`A`字符，`B`在`12`后的位置插入了`B`字符。如果进行协同操作，那么两者相当于同时在同一个位置插入了字符，如果不进行操作变换而直接应用的话，两者的数据就会出现冲突，`A`的数据是`12BA`，而`B`的数据是`12AB`，因此就需要先转换再应用。

```js
// User A
const base = new Delta().insert("12");
const delta = new Delta().retain(2).insert("A");
let current = base.compose(delta); // 12A
// Accept Remote B
const remote = new Delta().retain(2).insert("B");
// ob1=OT(oa, ob)
const remote2 = delta.transform(remote, true); // [{"retain":3},{"insert":"B"}] 
current = current.compose(remote2); // 12AB
```

```js
// User B
const base = new Delta().insert("12");
const delta = new Delta().retain(2).insert("B");
let current = base.compose(delta); // 12B
// Accept Remote A
const remote = new Delta().retain(2).insert("A");
// oa2=OT(ob, oa)
const remote2 = delta.transform(remote, false); // [{"retain":2},{"insert":"A"}] 
current = current.compose(remote2); // 12AB
```

### transformPosition
`transformPosition`方法用于将指定的位置进行转换，这个方法的主要场景是编辑器中的选区/光标的位置变换，例如光标此时在`1`后面，构造`delta`在`1`之前增加了内容的话，那么光标就需要跟随移动。

```js
const delta = new Delta().retain(5).insert("a");
delta.transformPosition(4); // 4
delta.transformPosition(5); // 6
```

## EtherPad
`EtherPad`同样是非常优秀的协同编辑器，其内置实现的数据结构同样是线性的，数据结构设计被称为`ChangeSet`。协同算法实现是`EasySync`，且其专利文档中对如何进行服务端调度也有较为详细的描述。

`Changeset`同样是一种基于`JSON`的数据格式，用于描述文档的内容及其变更。但是其并没有像`Delta`那么清晰的表达，`JSON`结构主要是`AttributePool`内，而对于文本内容的表达则是纯文本的结构。

### 文档描述
文档内容是使用`ClientVars`的数据结构表示的，其中包含了三个部分，`apool`文本属性池、`text`文本内容、`attribs`属性描述。在下面的例子中，我们描述了标题、加粗、斜体、纯文本的内容，那么这其中的内容如下所示。

```js
({
  initialAttributedText: {
    text: "short description\n*Heading1\ntext\n*Heading2\nbold italic\nplain text\n\n",
    attribs: "*0|1+i*0*1*2*3+1*0|2+e*0*4*2*3+1*0|1+9*0*5+4*0+1*0*6+6*0|2+c|1+1",
  },
  apool: {
    numToAttrib: {
      "0": ["author", "a.XYe86foM7oYgmpuu"],
      "1": ["heading", "h1"],
      "2": ["insertorder", "first"],
      "3": ["lmkr", "1"],
      "4": ["heading", "h2"],
      "5": ["bold", "true"],
      "6": ["italic", "true"],
    },
    nextNum: 7,
  },
});
```

对于这个内容直接看上去是比较复杂的，当然实际上也是比较复杂的。`apool`是一个属性池，所有对于文本内容的装饰都是在这里存储的，也就是其中的`numToAttrib`属性存储的`[string, string]`值，`nextNum`则是下个要放置的索引。`text`则是纯文本的内容，相当于此时文档的纯文本内容。`attribs`则是根据`text`的纯文本内容，并且取得`apool`中的属性值，相当于装饰文本内容的编码。

因此`attribs`需要单独拿出来解析，`*n`表示取第`n`个属性应用到文本上，通常需要配合`|n`和`+n`属性使用，`|n`表示影响`n`行，仅对于`\n`属性需要使用该属性，`+n`则表示取出`n`个字符数，相当于`retain`操作，不仅可以移动指针，还可以用来持有属性变更。特别需要注意的是`|m`不会单独出现，其总是与`+n`一同表达，表示这`n`个字符中存在`m`个换行，且最后一个应用的字符必然是`\n`。

此外，`EasySync`里面的数字大都是`36`进制的，因此这里的`+i/+e`等都不是特殊的符号，需要用`0-9`数字来表示`0-9`的字符，而`10-35`则是表示`a-z`，例如`+i`就是`i - a = 8 => 8 + 10 = 18`。

- `*0`表示取出`author`的属性，`|1+i`表示将其应用到了`i`长度即`18`，字符为`short description\n`，由于其包含`\n`则定义`|1`。
- `*0*1*2*3`表示取出前`4`个属性，`+1`表示将其应用`1`个字符，即`*`字符，在`EasySync`中行首的该字符承载了行属性，而非放置`\n`中。
- `*0`表示取出`author`的属性，`|2+e`表示应用了`e`长度即`14`，字符为`Heading1\ntext\n`，其包含两个`\n`则定义`|2`。
- `*0*4*2*3`表示取出相关属性，`+1`表示将其应用`1`个字符，即`*`字符表示行属性内容。
- `*0|1+9`表示取出`author`的属性，`+9`表示将其应用`9`个字符，即`Heading2\n`，末尾是`\n`则定义`|1`。
- `*0*5+4`表示取出加粗等属性，应用`4`个字符，即`bold`。
- `*0+1`表示取出`author`的属性，应用`1`个字符即空格。
- `*0*6+6`表示取出斜体等属性，应用`6`个字符，即`italic`。
- `*0|2+c`表示取出相关属性，应用`12`个字符即`\nplain text\n`，存在两个`\n`则定义`|2`。
- `|1+1`表示末尾的`\n`属性，在`EasySync`中行末的该字符需要单独定义。

### 变更描述


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://github.com/slab/delta/blob/main/src/Delta.ts>
- <https://github.com/slab/delta/blob/main/src/AttributeMap.ts>
- <https://github.com/ether/etherpad-lite/tree/develop/doc/public/easysync>
- <https://github.com/ether/etherpad-lite/blob/develop/src/static/js/Changeset.ts>
- <https://github.com/ether/etherpad-lite/blob/develop/src/static/js/AttributePool.ts>
- <https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/interfaces/operation.ts>
- <https://github.com/ianstormtaylor/slate/blob/main/packages/slate/src/interfaces/transforms/general.ts>

