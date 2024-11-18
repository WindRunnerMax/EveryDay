# MutationObserver Object
The `MutationObserver` (W3C DOM4) object provides the ability to monitor changes made to the `DOM` tree, and is designed as a replacement for the old `Mutation Events` functionality (which is part of the `DOM3 Events` specification).

## Description
The `Mutation Observer` is used to monitor changes in the `DOM`, such as the addition or removal of nodes, changes to attributes, and changes in text content. After configuration, notifications of any `DOM` changes can be received through callback functions. The `Mutation Observer` is similar to the event listener `DOM.addEventListener` method, as both can execute callback functions when certain changes occur. However, the `Mutation Observer` triggers asynchronously, meaning `DOM` changes are not immediately triggered, and only occur after all current `DOM` operations have finished.

### observe
`mutationObserver.observe(target[, options])`  
The `observe()` method of the `Mutation Observer` configures the callback method of the `Mutation Observer` object to start receiving notifications of `DOM` changes that match the given options.

- `target`: A `DOM Node` in the `DOM` tree to observe changes or the root node of the subtree being observed.
- `options`: An optional `MutationObserverInit` object that describes which `DOM` changes should be provided to the current observer's `callback`. Within the `MutationObserverInit` object, at least one of the three properties - `childList`, `attributes`, `characterData` - must be `true`. Otherwise, a `TypeError` exception will be thrown.
    - `childList`: Represents changes to child nodes, including additions, removals, or modifications to child nodes.
    - `attributes`: Represents changes to the attributes of the current node.
    - `characterData`: Represents changes to the content or text of the node.
    - `subtree`: Indicates whether the observer should be applied to all descendant nodes of the node.
    - `attributeOldValue`: Indicates whether the previous attribute value needs to be recorded when observing `attributes` changes.
    - `characterDataOldValue`: Indicates whether the previous value needs to be recorded when observing `characterData` changes.
    - `attributeFilter`: Indicates specific attributes to observe, such as ["class","src"].

### disconnect
`mutationObserver.disconnect()`  
The `disconnect()` method of the `Mutation Observer` tells the observer to stop observing changes, and can be reused by calling its `observe()` method.

### takeRecords
`const mutationRecords = mutationObserver.takeRecords()`  
The `takeRecords()` method of the `Mutation Observer` returns a list of all detected but unhandled `DOM` changes by the observer's callback function, keeping the change queue empty. This method is commonly used to immediately obtain all unhandled change records before disconnecting the observer, so that any unhandled changes can be processed when stopping the observer.

## Example
A common functionality of the `Mutation Observer` is to observe changes in the size of `DOM` elements, often caused by active `resize` operations. Therefore, an observer is needed to handle the side effects of the changes in the size of the `DOM` element. Here is a simple example that observes the `attributes` and `childList` properties. In the `attributes` property, the `attributeFilter` is used to filter only changes to the `style` attribute. Since `contenteditable` is used to edit the `DOM` element in this case, the `childList` property is used to observe changes to child elements.

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
```

```javascript
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
```

## EveryDay

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://juejin.cn/post/6949832945683136542
https://developer.mozilla.org/en-US/docs/Web/API/MutationEvent
https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
```