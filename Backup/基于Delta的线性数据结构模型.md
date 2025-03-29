# 基于Delta的线性数据结构模型
数据模型的设计是编辑器的核心基础，其直接影响了选区模型、`DOM`模型、状态管理等模块的设计。例如在`quill`中的选区模型是`index + len`的表达，而`slate`中则是`anchor + focus`的表达，这些都是基于数据模型的设计而来的。因此我们从零实现的富文本编辑器就需要从数据模型的设计开始，之后就可以逐步实现其他模块。

- 开源地址: <https://github.com/WindRunnerMax/BlockKit>
- 在线编辑: <https://windrunnermax.github.io/BlockKit/>
- 项目笔记: <https://github.com/WindRunnerMax/BlockKit/blob/master/NOTE.md>

从零实现富文本编辑器项目的相关文章:

- [深感一无所长，准备试着从零开始写个富文本编辑器]()
- [从零实现富文本编辑器-基于MVC模式的编辑器架构设计]()
- [从零实现富文本编辑器-基于Delta的线性数据结构模型]()

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

如果是在协同中的话，`b'=a.t(b)`的意思是，假设`a`和`b`都是从相同的`draft`分支出来的，那么`b'`就是假设`a`已经应用了，此时`b`需要在`a`的基础上变换出`b'`才能直接应用，我们也可以理解为`transform`解决了`a`操作对`b`操作造成的影响。

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

### OpIterator
`OpIterator`类定义一个迭代器，用于迭代`delta`中的`op`操作。迭代器大量用于`diff`、`compose`、`transform`等方法中，需要注意的是该迭代器调用`next`时不会跨越`op`，即使传递的`length`大于当前`op`的长度。

```js
const delta = new Delta()
  .insert("Hello", { bold: "true" })
  .insert(" World", { italic: "true" });
  .retain(3);
iter.next(2); // { insert: "He", attributes: { bold: "true" } }
iter.next(10); // { insert: "llo", attributes: { bold: "true" } }
```

## EtherPad
`EtherPad`同样是非常优秀的协同编辑器，其内置实现的数据结构同样是线性的，文档整体描述称为`ClientVars`，数据结构变更被称为`ChangeSet`。协同算法的实现是`EasySync`，且其文档中对如何进行服务端调度也有较为详细的描述。

`ClientVars/Changeset`同样是一种基于`JSON`的数据格式，用于描述文档的内容及其变更。但是其并没有像`Delta`那么清晰的表达，`JSON`结构主要是`AttributePool`内，而对于文本内容的表达则是纯文本的结构。

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
`OT`操作变换的基准原子实现就是`insert`、`delete`、`retain`三种操作，那么`ChangeSet`的内容描述自然也是类似，但是数据的变更描述并非像`delta`的结构那么清晰，而是特别设计了一套数据结构描述。

文档在最开始创建或是导入的时候是初始的`ClientVars`，而此后每次对于文档内容的修改则是会生成`ChangeSet`。针对于上述的三种操作对应了三种符号，`=`表示`retain`、`+`表示`insert`、`-`表示`delete`，这三种符号的组合就可以描述文档内容的变更，除此之外还有额外的定义:

- `Z`: 首字母为`MagicNumber`，表示为符号位。
- `:N`: 文档原始内容长度为`N`。
- `>N`: 最终文档长度会比原始文档长度长`N`。
- `<N`: 最终文档长度会比原始文档长度短`N`。
- `+N`: 实际执行操作，表示插入了`N`个字符。
- `-N`: 实际实际操作，表示操作删除了`N`个字符。
- `=N`: 实际执行操作，表示操作保留了`N`个字符，移动指针或应用属性。
- `|N`: 表示影响了`N`行，与上述文档描述一致需要与`+/-/=N`使用，操作的长度包含`N`个`\n`，且末尾操作必须是`\n`。文档最末尾的`\n`需要表示的话，则必须要用`|1=1`表示。
- `*I`: 表示应用属性，`I`为`apool`中的索引值，在一个`+`、`=`或`|`之前可以有任意数量的`*`操作。
- `$`: 表示结束符号，用于标记`Operation`部分的结束。
- `char bank`: 用于存储`insert`操作具体的字符内容，在执行插入操作时按序取用。

同样是上述的例子，现在的文档中已经存在`exist text\n\n`的文本内容，紧接着将上述的内容粘贴到文档中，那么发生的`User ChangeSet`的变更描述如下:

```js
({
  changeset:
    "Z:c>1t|1=b*0|1+i*0*1*2*3+1*0|2+e*0*4*2*3+1*0|1+9*0+5*0*5+6*0|1+1*0+a$short description\n*Heading1\ntext\n*Heading2\nbold italic\nplain text",
  apool: {
    numToAttrib: {
      "0": ["author", "a.XYe86foM7oYgmpuu"],
      "1": ["heading", "h1"],
      "2": ["insertorder", "first"],
      "3": ["lmkr", "1"],
      "4": ["heading", "h2"],
      "5": ["italic", "true"],
    },
    nextNum: 6,
  },
});
```

- `Z`表示`MagicNumber`，即符号位。
- `c`表示文档原始内容长度为`12`，即`exist text\n\n`内容长度。
- `>1t`表示最终文档会比原始内容长度多`1t`，`36`进制转换`1t`为`64`，具体为`char bank`索引。
- `|1=b`表示移动指针长度为`b`，转换长度为`11`，文本内容为`exist text\n`，末尾为`\n`定义`|1`。
- `*0|1+i`表示从`apool`中取出`0`属性，应用`i`转换长度为`18`，文本内容为`short description\n`，末尾为`\n`定义`|1`。
- `*0*1*2*3+1`表示取出`4`个属性，应用为`1`，文本内容为`*`，具体则是行属性的起始标记。
- `*0|2+e`表示取出`0`属性，应用`e`转换长度为`14`，文本内容为`Heading1\ntext\n`，末尾为`\n`且包含两个`\n`定义`|2`。
- `*0*4*2*3+1`表示取出`4`个属性，应用为`1`，文本内容为`*`，同样是行属性的起始标记。
- `*0|1+9`表示取出`0`属性，应用长度为`9`，文本内容为`Heading2\n`，末尾为`\n`定义`|1`。
- `*0+5`表示取出`0`属性，应用长度为`5`，文本内容为`bold `。
- `*0*5+6`表示取出斜体等属性，应用长度为`6`，文本内容为`italic`。
- `*0|1+1`表示取出`0`属性，应用长度为`1`，末尾为`\n`则定义`|1`，文本内容为`\n`。
- `*0+a`表示取出`0`属性，应用长度为`a`即`10`，文本内容为`plain text`。
- `$`表示结束符号，后续的内容符号则为`char bank`，最末尾的`\n`通常不需要表示，即使表示也需要`|1=1`单独表示。

## Slate
`slate`的数据结构以及选区的设计几乎完全对齐了`DOM`结构，且数据结构设计并未独立出来，同样基于`JSON`的结构，非常类似于低代码的结构设计。操作变换是直接在`slate`的核心模块`Transform`中实现，且位置相关操作变换的实现分散在`Point`、`Path`对象中。

```js
[
  {
    type: "paragraph",
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text." },
    ],
  },
  { type: "block-quote", children: [{ text: "A wise quote." }] },
];
```

### Operation
同样是基于`OT`实现操作变换算法，线性的数据结构仅需要`insert`、`delete`、`retain`三种基本操作即可实现，而在`slate`中则实现了`9`种原子操作来描述变更，这其中包含了文本处理、节点处理、选区变换的操作等。

- `insert_node`: 插入节点。
- `insert_text`: 插入文本。
- `merge_node`: 合并节点。
- `move_node`: 移动节点。
- `remove_node`: 移除节点。
- `remove_text`: 移除文本。
- `set_node`: 设置节点。
- `set_selection`: 设置选区。
- `split_node`: 分割节点。

实际上仅实现应用还好，其相对应的`invert`、`transform`则会更加复杂。在`slate`中的`inverse`相关操作在`operation.ts`中实现，与位置相关的`transform`在`path.ts`、`point.ts`中有相关实现。

而实际上这些操作通常都不会在编辑器中直接调用，`slate`针对这些最基础的操作进行了封装，实现了`Transforms`模块。在这个模块中实现了诸多具体的操作，例如`insertNodes`、`liftNodes`、`mergeNodes`、`moveNodes`、`removeNodes`等等，这里的操作就远不止`9`种类型了。

- `insertFragment`: 在指定的位置插入节点的片段。
- `insertNodes`: 在指定的位置插入节点。
- `removeNodes`: 在文档中指定的位置删除节点。
- `mergeNodes`: 在某个节点与同级的前节点合并。
- `splitNodes`: 在某个节点中的指定位置分割节点。
- `wrapNodes`: 在某个节点中的指定位置包裹一层节点。
- `unwrapNodes`: 在某个节点中的指定位置解除一层包裹节点。
- `setNodes`: 在某个节点中的指定位置设置节点属性。
- `unsetNodes`: 在某个节点中的指定位置取消节点属性。
- `liftNodes`: 在某个节点中的指定位置提升一层节点。
- `moveNodes`: 在文档中的指定位置移动节点。
- `collapse`: 将选区折叠为插入符。
- `select`: 主动设置选区位置。
- `deselect`: 取消选区位置。
- `move`: 移动选区位置。
- `setPoint`: 设置选区的单侧位置。
- `setSelection`: 设置新选区位置。
- `delete`: 删除选区内容。
- `insertText`: 在选区位置插入文本。
- `transform`: 在编辑器上`immutable`地执行`op`。

### OT-JSON
类似的，在`OT-JSON(json0)`中实现了`11`种操作，富文本场景中`SubType`仍然需要扩展，那自然就需要更多的操作来描述变更。因此，实际上以`JSON`嵌套的数据格式来描述内容变更，要比线形的操作复杂得多。

在`slate`中是自行封装了编辑器的基础`op`，如果其本身是在`OT-JSON`的基础上封装`Transforms`的话，对于实现`OT`的协同会更方便一些，`ShareDB`等协同框架都是要参考`OTTypes`的定义的。当然，基于`CRDT`实现的协同看起来更加容易处理。

- `{p:[path], na:x}`: 在指定的路径`[path]`值上加`x`数值。
- `{p:[path,idx], li:obj}`: 在列表`[path]`的索引`idx`前插入对象`obj`。
- `{p:[path,idx], ld:obj}`: 从列表`[path]`的索引`idx`中删除对象`obj`。
- `{p:[path,idx], ld:before, li:after}`: 用对象`after`替换列表`[path]`中索引`idx`的对象`before`。
- `{p:[path,idx1], lm:idx2}`: 将列表`[path]`中索引`idx1`的对象移动到索引`idx2`处。
- `{p:[path,key], oi:obj}`: 向路径`[path]`中的对象添加键`key`和对象`obj`。
- `{p:[path,key], od:obj}`: 从路径`[path]`中的对象中删除键`key`和值`obj`。
- `{p:[path,key], od:before, oi:after}`: 用对象`after`替换路径`[path]`中键`key`的对象`before`。
- `{p:[path], t:subtype, o:subtypeOp}`: 对路径`[path]`中的对象应用类型为`t`的子操作`o`，子类型操作。
- `{p:[path,offset], si:s}`: 在路径`[path]`的字符串的偏移量`offset`处插入字符串`s`，内部使用子类型。
- `{p:[path,offset], sd:s}`: 从路径`[path]`的字符串的偏移量`offset`处删除字符串`s`，内部使用子类型。

## 总结
数据结构的设计是非常重要的，对于编辑器来说，数据结构的设计直接影响着选区模型、`DOM`模型、状态管理等模块的设计。在这里我们聊到了很多的数据结构设计，`Delta`、`Changeset`的线性结构，`Slate`的嵌套结构，每种数据都有着各自的设计与考量。

那么在选定好了数据结构后，就可以在此基础上实现编辑器的各个模块。我们接下来会从数据模型出发，设计选区模型的表示，然后在此基础上实现浏览器选区与编辑器选区模型的同步。通过选区模型作为操作的目标，来实现编辑器的基础操作，例如插入、删除、格式化等操作。

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
