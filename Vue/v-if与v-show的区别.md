# v-if与v-show的区别
`v-if`指令与`v-show`指令都可以根据值动态控制`DOM`元素显示隐藏，`v-if`和`v-show`属于`Vue`的内部常用的指令，指令的职责是当表达式的值改变时把某些特殊的行为应用到`DOM`上。

## 概述

### v-if
`v-if`指令用于条件性地渲染一块内容，这块内容只会在指令的表达式返回`truthy`值的时候被渲染。

```html
<div v-if="show">show</div>
<div v-else>hide</div>
```

### v-show
`v-show`指令用法大致一样，不同的是带有`v-show`指令的元素始终会被渲染并保留在`DOM`中，`v-show`只是简单地切换元素的`CSS property display`。
```html
<div v-show="show">show</div>
```

## 区别
* 实现方式: `v-if`是动态的向`DOM`树内添加或者删除`DOM`元素，`v-show`是通过设置`DOM`元素的`display`样式属性控制显隐。
* 编译过程: `v-if`切换有一个局部编译卸载的过程，切换过程中合适地销毁和重建内部的事件监听和子组件，`v-show`只是简单的基于`CSS`切换。
* 编译条件: `v-if`是惰性的，如果初始条件为假，则什么也不做，只有在条件第一次变为真时才开始局部编译， `v-show`是在任何条件下都被编译，然后被缓存，而且`DOM`元素保留。
* 性能消耗: `v-if`有更高的切换消耗，`v-show`有更高的初始渲染消耗。
* 使用场景: `v-if`适合条件不太可能改变的情况，`v-show`适合条件频繁切换的情况。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://cn.vuejs.org/v2/guide/conditional.html#v-if
https://www.cnblogs.com/dengyao-blogs/p/11378228.html
https://cn.vuejs.org/v2/guide/conditional.html#v-show
```
