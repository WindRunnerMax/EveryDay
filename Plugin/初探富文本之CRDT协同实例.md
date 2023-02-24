# 初探富文本之CRDT协同实例
在前边初探富文本之`CRDT`协同算法一文中我们探讨了为什么需要协同、分布式的最终一致性理论、偏序集与半格的概念、为什么需要有偏序关系、如何通过数据结构避免冲突、分布式系统如何进行同步调度等等，这些属于完成协同所需要了解的基础知识，实际上当前有很多成熟的协同实现，例如`automerge`、`yjs`等等，本文就是以`yjs`为`CRDT`协同框架来实现协同的实例。

## 描述
接入协同框架实际上并不是一件简单的事情，当然相对于接入`OT`协同而言接入`CRDT`协同已经是比较简单的了，因为我们只需要聚焦于数据结构的使用就好，而不需要对变换有过多的关注。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/452980520
https://josephg.com/blog/crdts-go-brrr/
https://josephg.com/blog/crdts-are-the-future/
```

