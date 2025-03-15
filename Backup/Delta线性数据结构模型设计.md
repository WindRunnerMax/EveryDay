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



## EasySync

## Slate

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://github.com/slab/delta/blob/main/src/Delta.ts>
- <https://github.com/ether/etherpad-lite/blob/develop/src/static/js/Changeset.ts>
- <https://github.com/ianstormtaylor/slate/tree/main/packages/slate/src/interfaces/transforms>

