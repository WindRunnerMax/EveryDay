# The JS event flow model

**Event Capturing** is a top-down propagation method. Taking the `click` event as an example, it starts from the outermost root element and gradually propagates inwards to reach the clicked node. It's a way to propagate from the outermost node gradually inward until the target node.

**Event Bubbling** is a bottom-up propagation method. Similarly taking the `click` event as an example, the event starts from the clicked node and then gradually propagates upwards to the highest-level node.

## DOM0 Level Model

Also known as the original event model, this method is relatively simple and compatible with all browsers, but it couples the interface with the logic, leading to poor maintainability.

### Example
When clicking on the `<div>` with the `id` `i3`, the browser will sequentially display `2 1 0`.

```html
<!DOCTYPE html>
<html>
<head>
    <title>JS event flow model</title>
</head>
<style type="text/css">
    div{
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
<body>
    <div id="i1" style="height: 150px;width: 150px;background: red;" onclick="alert(0)">
        <div id="i2" style="height: 100px;width: 100px;background: green;" onclick="alert(1)">
            <div id="i3" style="height: 50px;width: 50px;background: blue;" onclick="alert(2)"></div>
        </div>
    </div>
</body>
</html>

```

## IE Event Model

Versions of `IE8` and earlier do not support capturing events. The `IE` event model consists of two processes:  
**Event handling phase**: the event reaches the target element, triggering the listening event of the target element.  
**Event bubbling phase**: the event bubbles from the target element to the `document`, sequentially executing the events bound to the nodes it passes through.

## DOM2 Level Model

The `DOM2` event model is a standard model established by `W3C`, supporting both capturing and bubbling events. The event processing phases called are in sequence: capturing, target, and bubbling.

### Example
When clicking on the `<div>` with the `id` `i3`, the browser will sequentially display `0 1 3 2`, where the third argument of the `addEventListener` method declares whether the bound event is capturing or bubbling, defaulting to `false`, which is bubbling.

```html
<!DOCTYPE html>
<html>
<head>
    <title>JS事件流模型</title>
</head>
<style type="text/css">
    div{
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
<body>
    <div id="i1" style="height: 150px;width: 150px;background: red;">
        <div id="i2" style="height: 100px;width: 100px;background: green;">
            <div id="i3" style="height: 50px;width: 50px;background: blue;"></div>
        </div>
    </div>
</body>

<script type="text/javascript">
    document.addEventListener('click',(e) => {
        alert(0);
    },true) 
    document.getElementById("i1").addEventListener('click',(e) => {
        alert(1);
    },true) 
    document.getElementById("i2").addEventListener('click',(e) => {
        alert(2);
    })  
    document.getElementById("i3").addEventListener('click',(e) => {
        alert(3);
    })     
</script>
</html>

```
The `document` object and the `i1` node are bound to capturing listener events, while the `i2` and `i3` nodes are bound to bubbling-type events. The order of event propagation is as follows:

```
window --- document --- html --- body --- i1 --- i2 --- i3 --- i2 --- i1 --- body --- html --- document --- window
```
The process from `window` to `i3` is the **capture phase**, sequentially executing the bound events in this example `alert(0)` and `alert(1)`, then reaching the **target phase** of `i3` and executing the event `alert(3)` bound to `i3`, followed by the **bubbling phase** from `i3` to `window`, executing the bound `alert(2)`, resulting in the execution order of `0 1 3 2`.

## Note

### Difference in event binding
In `DOM0`, when directly binding functions, the later-defined function will overwrite the previously bound function. In the following example, only `alert(1)` is executed, not `alert(0)`. `click()` is an object event that triggers the method bound to `onclick()`. `onclick()` is an object property, and when a function is bound to it, it becomes the method executed after the `click()` event is triggered.

```html
<!DOCTYPE html>
<html>
<head>
    <title>JS事件流模型</title>
</head>
<style type="text/css">
    div{
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
<body>
    <div id="i1" style="height: 150px;width: 150px;background: red;"></div>
</body>

<script type="text/javascript">


```javascript
document.getElementById("i1").onclick = function(){
    alert(0);
} // Overridden

document.getElementById("i1").onclick = function(){
    alert(1);
} // Executed

```

`addEventListener` allows you to bind multiple functions to an event, and you don't need to use `on` when binding. It can also take a third parameter `useCapture` to determine whether the event is bound to the capture phase or the bubble phase.

```javascript
document.getElementById("i1").addEventListener('click',(e) => {
    alert(0);
}) // Executed

document.getElementById("i1").addEventListener('click',(e) => {
    alert(1);
}) // Executed
```

`attachEvent` allows you to bind multiple functions to an event, you need to use `on` when binding, and it only supports execution during the bubble phase, so there is no third parameter.

```javascript
document.getElementById("i1").attachEvent('onclick',function(e){
    alert(0);
}) // Executed

document.getElementById("i1").attachEvent('onclick',function(e){
    alert(1);
}) // Executed
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```