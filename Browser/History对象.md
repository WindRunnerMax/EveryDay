# History对象
`History`对象允许操作浏览器的曾经在标签页或者框架里访问的会话历史记录。

## 属性
* `history.length`: 只读，返回一个整数，该整数表示会话历史中元素的数目，包括当前加载的页，例如在一个新的选项卡加载的一个页面中，这个属性返回`1`。
* `history.scrollRestoration`: 允许`Web`应用程序在历史导航上显式地设置默认滚动恢复行为，此属性可以是自动的`auto`或者手动的`manual`。
* `history.state` 只读，返回一个表示历史堆栈顶部的状态的值，这是一种可以不必等待`popstate`事件而查看状态的方式。

## 方法
* `history.back()`: `history.back()`在浏览器历史记录里前往上一页，用户可点击浏览器左上角的返回`←`按钮模拟此方法，等价于`history.go(-1)`，当浏览器会话历史记录处于第一页时调用此方法没有效果，而且也不会报错。
* `history.forward()`: `history.forward()`在浏览器历史记录里前往下一页，用户可点击浏览器左上角的前进`→`按钮模拟此方法，等价于`history.go(1)`，当浏览器历史栈处于最顶端时，当前页面处于最后一页时调用此方法没有效果也不报错。
* `history.go()`: `history.go(N)`通过当前页面的相对位置从浏览器历史记录即会话记录加载页面，比如参数为`-1`的时候为上一页，参数为`1`的时候为下一页，当整数参数超出界限时，例如如果当前页为第一页，前面已经没有页面了，此时如果传参的值为`-1`，那么这个方法没有任何效果也不会报错，调用没有参数的`go()`方法或者不是整数的参数时也没有效果，这点与支持字符串作为`url`参数的`IE`有点不同。
* `history.pushState()`: `history.pushState(state, title[, url])`该方法向当前浏览器会话的历史堆栈中添加一个状态`state`，其按指定的名称和`URL`(如果提供该参数)将数据`push`进会话历史栈，数据被`DOM`进行不透明处理，你可以指定任何可以被序列化的`JavaScript`对象。
* `history.replaceState()`: `history.replaceState(stateObj, title[, url])`该方法修改当前历史记录实体，按指定的数据、名称和`URL`(如果提供该参数)，更新历史栈上最新的入口，这个数据被`DOM`进行了不透明处理，你可以指定任何可以被序列化的`JavaScript`对象。

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://developer.mozilla.org/zh-CN/docs/Web/API/History
```

