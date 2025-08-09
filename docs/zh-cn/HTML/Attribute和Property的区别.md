# Attribute和Property的区别
`attribute`是`XML`元素中的概念，用于描述`XML`标签的附加信息，即`XML`标签的属性，`property`是`JavaScript`对象中的概念，用于描述`JavaScript`对象的成员，即`JavaScript`对象的属性。

## 概述
在描述`HTML`时需要为其设定一些属性值的键值对用以描述标签：

```html
<input id="this-input" type="text" value="test" />
```

上述标签节点就定义了`3`个`attribute`：

```
id: this-input
type: text
value: test
```

而浏览器在解析这段`HTML`后，就会创建一个`Element`对象，该对象包括很多属性`property`例如`id`、`innerHTML`、`outerHTML`等等，而对于这个`Js`对象，其许多属性`property`都与这个节点元素具有相同或相似名称的`attribute`，但这不是一对一的关系。

* 某些`attribute`存在与`property`的`1:1`的映射，例如`id`属性。
* 某些`attribute`存在与`property`的`1:1`的映射但名称不同，例如`class`属性。
* 某些`attribute`不存在与`property`的映射，例如自定义的`customize`属性。

## 实例

首先将`<input>`标签中的`type`进行更改：

```html
<input id="this-input" type="t" value="test" />
```

此时用`Js`取得对象的`attribute`以及`property`：

```javascript
console.log(document.querySelector("#this-input").getAttribute("type")); // t // attribute
console.log(document.querySelector("#this-input").type); // text // property
```
可以看到对于`property`而言，其会自动修正不正确的值，而对于`attribute`而言，其保留了关于`DOM`节点元素原本的值，可以说`attribute`从语义上, 更倾向于不可变更的值，而`property`从语义上更倾向于在其生命周期中是可变的值。下面是一个同样的例子，当更改输入框中的`test`值为其他值比如`t`时，分别取得其`attribute`以及`property`：

```javascript
console.log(document.querySelector("#this-input").getAttribute("value")); // test
console.log(document.querySelector("#this-input").value); // t
console.log(document.querySelector("#this-input").defaultValue); // test
```
可以看到`attribute`依旧保留了其原始值，而`property`获得了改变后的值，如果需要在`property`获得其原始值可以使用`defaultValue`属性。   
如果在`DOM`节点自定义了某些`attribute`，其不一定会同步到`property`，同样在`property`定义的属性不一定会同步到`attribute`。

```html
<input id="another-input" type="type" customize="test" />
```

```javascript
console.log(document.querySelector("#another-input").customize); // undefined
console.log(document.querySelector("#another-input").getAttribute("customize")); // test
```

## 代码示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>Attribute Property</title>
</head>
<body>

    <input id="this-input" type="t" value="test" />
    <input id="another-input" type="type" customize="test" />

</body>
    <script type="text/javascript">
        console.log(document.querySelector("#this-input").type); // text
        console.log(document.querySelector("#this-input").getAttribute("type")); // t
        console.log(document.querySelector("#another-input").customize); // undefined
        console.log(document.querySelector("#another-input").getAttribute("customize")); // test
    </script>
</html>
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.jianshu.com/p/8415edb391ce
https://juejin.im/post/5bea695ae51d45196e141f7f
https://stackoverflow.com/questions/6003819/what-is-the-difference-between-properties-and-attributes-in-html/6377829#6377829
```
