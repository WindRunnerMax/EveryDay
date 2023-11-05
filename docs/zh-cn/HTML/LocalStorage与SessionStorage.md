# localStorage与sessionStorage
`localStorage`和`sessionStorage`是`HTML5`提供的对于`Web`存储的解决方案。

## 相同点
* 都与`HTTP`无关，是`HTML5`提供的标准，当发起`HTTP`请求时不会与`Cookie`一样自动携带。
* 都是以键值对的形式存在，即`Key-Value`形式，常用的`Api`也相同。
* 存储类型都是`String`类型，当进行存储时，会调用`toString()`方法转为`String`类型。
* 对于每个域容量是有限的，不同浏览器不一样，大部分存储为`5M`左右。

## 不同点
* `localStorage`用于持久化的本地存储，除非主动删除数据，否则数据是永远不会过期的。
* `SessionStorage`会在用户关闭浏览器后，即会话结束后，数据失效；`SessionStorage`与服务端`Session`无关。

## 常用操作

* 储存数据

```javascript
localStorage.setItem('key', 'value');
sessionStorage.setItem('key', 'value');
/**
 * 由于存储数据会调用 toString() 方法
 * Object 类型会存储为 [object Object] 字符串
 * 所以进行存储时需调用 JSON.stringify() 转化为字符串
 * 取出时调用 JSON.parse() 将字符串转回对象
 */
```

* 读取数据

```javascript
localStorage.getItem('key');
sessionStorage.getItem('key');
```

* 删除数据

```javascript
localStorage.removeItem('key');
sessionStorage.removeItem('key');
```

* 清空数据

```javascript
localStorage.clear();
sessionStorage.clear();
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```
