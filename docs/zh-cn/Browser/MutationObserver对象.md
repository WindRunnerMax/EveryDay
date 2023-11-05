# MutationObserver对象
`MutationObserver  (W3C DOM4)`对象提供了监视对`DOM`树所做更改的能力，其被设计为旧的`Mutation Events`功能的替代品(该功能是`DOM3 Events`规范的一部分)。

## 描述
`Mutation Observer`用来监视`DOM`变动，`DOM`的任何变动，例如节点的增减、属性的变动、文本内容的变动，在配置之后都可以通过回调函数来获得通知。`Mutation Observer`类似于事件的监听`DOM.addEventListener`方法，都可以在触发某些变动的时候来执行回调函数，只不过`Mutation Observer`是异步触发，`DOM`的变动并不会马上触发，在等到当前所有`DOM`操作都结束才触发。

### observe
`mutationObserver.observe(target[, options])`  
`Mutation Observer`的`observe()`方法配置了`Mutation Observer`对象的回调方法，以开始接收与给定选项匹配的`DOM`变化的通知。  

* `target`: `DOM`树中的一个要观察变化的`DOM Node`，或者是被观察的子节点树的根节点。
* `options`: 一个可选的`MutationObserverInit`对象，此对象的配置项描述了`DOM`的哪些变化应该提供给当前观察者的`callback`，在`MutationObserverInit`对象中`childList`、`attributes`、`characterData`三个属性之中，至少有一个必须为`true`，否则会抛出`TypeError`异常。
    * `childList`：表示子节点的变动，指新增，删除或者更改字节点。
    * `attributes`：表示当前节点属性的变动。
    * `characterData`：表示节点内容或节点文本的变动。
    * `subtree`：表示是否将该观察器应用于该节点的所有后代节点。
    * `attributeOldValue`：表示观察`attributes`变动时，是否需要记录变动前的属性值。
    * `characterDataOldValue`：表示观察`characterData`变动时，是否需要记录变动前的值。
    * `attributeFilter`：表示需要观察的特定属性，比如["class","src"]。

### disconnect
`mutationObserver.disconnect()`  
`Mutation Observer`的`disconnect()`方法告诉观察者停止观察变动，可以通过调用其`observe()`方法来重用观察者。

### takeRecords
`const mutationRecords = mutationObserver.takeRecords()`  
`Mutation Observer`的`takeRecords()`方法返回已检测到但尚未由观察者的回调函数处理的所有匹配`DOM`更改的列表，使变更队列保持为空。此方法最常见的使用场景是在断开观察者之前立即获取所有未处理的更改记录，以便在停止观察者时可以处理任何未处理的更改。

## 示例
`Mutation Observer`的一个常用功能就是观察`DOM`元素的大小变更，通常是主动`resize`造成了该元素的大小发生变化，所以需要观察者来完成`DOM`元素大小变更的副作用。在这里完成了一个简单的示例，观察了`attributes`与`childList`两个属性值，并在`attributes`中使用`attributeFilter`来过滤只观察`style`属性的变动，因为在这里是使用的`contenteditable`来完成的`DOM`元素的编辑，所以是使用了`childList`来完成了子元素的变更观察。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mutation Observer</title>
    <style>
        #observer-dom{
            padding: 5px;
            resize: both;
            width: 300px;
            height: 200px;
            border: 1px solid #eee;
            resize: both;
            overflow: auto;
        }
        #observer-dom:empty:before {
            content: attr(data-placeholder);
            color: #aaa;
        }
        #observer-output{
            width: 300px;
            height: 200px;
            border: 1px solid #eee;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div id="observer-dom" contenteditable data-placeholder="Enter OR Resize"></div>
    <textarea id="observer-output"></textarea>
</body>
<script>
    const target = document.getElementById("observer-dom");
    const textarea = document.getElementById("observer-output");
    textarea.value = "output: \n";

    const addOutput = log => {
        textarea.value = textarea.value + log + "\n";
        textarea.scrollTop = textarea.scrollHeight;
    }

    const config = { attributes: true, childList: true, attributeFilter: ["style"] };
    const callback = function(mutationsList, observer) {
        for(const mutation of mutationsList) {
            console.log(mutation);
            if(mutation.type === "childList"){
                addOutput("ChildListAdded: " + mutation.addedNodes.length)
            }else if(mutation.type === "attributes"){
                addOutput("AttributeNameChange: " + mutation.attributeName)
            }
        }
    };
    const observer = new MutationObserver(callback);
    observer.observe(target, config);
</script>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://juejin.cn/post/6949832945683136542
https://developer.mozilla.org/en-US/docs/Web/API/MutationEvent
https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
```
