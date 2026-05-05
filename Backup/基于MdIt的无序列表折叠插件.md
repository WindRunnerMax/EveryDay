# 基于MdIt的无序列表折叠插件
当前`Markdown`已经成为最好的编程语言，同样的`Md`也成为了产品文档最需要支持的格式，特别是面向开发者的文档。实际上很多情况下编程和文档的场景是非常类似的，因此在时代的推动下，原生支持`Md`生产和消费的文档系统的需求重新出现。

在这里我们关注于`API`文档类型的展示，在`OpenAI`、`Claude`的`API`文档中，可以看到其表达参数列表的形式类似折叠列表。而观察原始的`Md`文档，就可以看出其参数列表的形式是无序列表，因此我们也实现类似的功能来将无序列表转换为折叠列表展示。

实际上，将无序列表渲染成折叠列表这件事，本身还是面向开发者阅读的，如果单纯是面向`AI`来消费，则仅提供纯文本的`Md`内容即可。目前来看，同时需要面向开发者和`AI`的状态应该还需要存在较长的时间，因此实现一套`Md`渲染器还是有必要的。

## 解析规则
首先我们需要分析无序列表结构及其解析后的`HTML`，基本的无序列表结构如下所示:

```md
- 0 
- 1 
  - 1.1 
  - 1.2 
    - 1.2.1 
    - 1.2.2 
  - 1.3 
    with desc
    - 1.3.1 
    - 1.3.2 
- 2
```

```html
<ul>
  <li>0</li>
  <li> 1
    <ul>
      <li>1.1</li>
      <li> 1.2
        <ul>
          <li>1.2.1</li>
          <li>1.2.2</li>
        </ul>
      </li>
      <li> 1.3 <br /> with desc
        <ul>
          <li>1.3.1</li>
          <li>1.3.2</li>
        </ul>
      </li>
    </ul>
  </li>
  <li>2</li>
</ul>
```

可以看出示例中存在三级`ul`元素结构嵌套，以及描述内容的`li`元素，我们需要根据不同的情况来解析。理论上而言，只有存在嵌套结构的`li`元素才需要解析为折叠结构，其子元素内起始到`ul`之间的内容需要作为标题，`ul`内元素则作为折叠展开的内容。

通常来说，实现类似手风琴的效果，大概会主动管理状态，用`div`等元素来绘制折叠面板，然后主动处理点击事件，来切换折叠展开的状态。不过，`HTML`原生支持了`details`元素以及`summary`元素，我们可以借助原生元素来实现折叠列表的效果，其主要优点是:

- 简单易用，通常情况下不需要主动管理状态，仅需要维护`DOM`结构。
- 无需处理事件，特别是在`SSR`的情况下，不需要再`hydrate`注入事件。
- 原生支持搜索，使用浏览器搜索时，可以自动展开包含搜索关键词的折叠列表。

```html
<details>
  <summary>Details</summary>
  Something more.
</details>
```

那么根据以上的`HTML`结构，我们可以根据无序列表的结构，转换为`details+summary`元素的结构。观察其结构，我们可以实现如下转换规则:

- `ul`元素作为折叠展开的内容，我们将其转换为自定义的`block`元素。
- 当`li`元素内存在嵌套的直属`ul`元素时，该`li`元素需要转换为`details`元素。
- 转换的`details`元素的子元素，从起始到`ul`元素之间的内容，需要包装`summary`元素。

根据上述的转换规则，我们可以将最开始的无序列表`HTML`内容转换为`details + summary`元素的结构:

```js
<block>
  <li>0</li>
  <details>
    <summary>1</summary>
    <group>
      <li>1.1</li>
      <details>
        <summary>1.2</summary>
        <group>
          <li>1.2.1</li>
          <li>1.2.2</li>
        </group>
      </details>
      <details>
        <summary>1.3 <br /> with desc</summary>
        <group>
          <li>1.3.1</li>
          <li>1.3.2</li>
        </group>
      </details>
    </group>
  </details>
  <li>2</li>
</block>
```

## 重建 UL 元素


## 重建 LI 元素

## CSS 样式

## 总结


## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考
- <https://markdown-it.github.io/>
- <https://zhuanlan.zhihu.com/p/400036665>
- <https://juejin.cn/post/7598480413803757610>
- <https://github.com/mqyqingfeng/Blog/issues/254>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details>
- <https://developers.openai.com/api/reference/resources/responses/methods/create>
