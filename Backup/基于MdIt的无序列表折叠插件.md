# 基于MdIt的无序列表折叠插件
当前`Markdown`已经成为最好的编程语言，同样的`Md`也成为了产品文档最需要支持的格式，特别是面向开发者的文档。实际上很多情况下编程和文档的场景是非常类似的，因此在时代的推动下，原生支持`Md`生产和消费的文档系统的需求重新出现。

在这里我们关注于`API`文档类型的展示，在`OpenAI`、`Claude`的`API`文档中，可以看到其表达参数列表的形式类似折叠列表。而观察原始的`Md`文档，就可以看出其参数列表的形式是无序列表，因此我们也实现类似的功能来将无序列表转换为折叠列表展示。

实际上，将无序列表渲染成折叠列表这件事，本身还是面向开发者阅读的，如果单纯是面向`AI`来消费，则仅提供纯文本的`Md`内容即可。目前来看，同时需要面向开发者和`AI`的状态应该还需要存在较长的时间，因此实现一套`Md`渲染器还是有必要的。

## 概述

```md

```



## 重建 UL 元素

## 重建 LI 元素

## 总结


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考
- <https://markdown-it.github.io/>
- <https://zhuanlan.zhihu.com/p/400036665>
- <https://juejin.cn/post/7598480413803757610>
- <https://github.com/mqyqingfeng/Blog/issues/254>
- <https://developers.openai.com/api/reference/resources/responses/methods/create>
