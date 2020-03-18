# JS事件流模型
**事件捕获**`Event Capturing`是一种从上而下的传播方式，以`click`事件为例，其会从最外层根节向内传播到达点击的节点，为从最外层节点逐渐向内传播直到目标节点的方式。  
**事件冒泡**`Event Bubbling`是一种从下往上的传播方式，同样以`click`事件为例，事件最开始由点击的节点，然后逐渐向上传播直至最高层节点。

## DOM0级模型
也称为原始事件模型，这种方式较为简单且兼容所有浏览器，但是却将界面与逻辑耦合在一起，可维护性差。  

### 实例
当点击`id`为`i3`的`<div>`时，浏览器会依次弹出`2 1 0`

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
    <div id="i1" style="height: 150px;width: 150px;background: red;" onclick="alert(0)">
        <div id="i2" style="height: 100px;width: 100px;background: green;" onclick="alert(1)">
            <div id="i3" style="height: 50px;width: 50px;background: blue;" onclick="alert(2)"></div>
        </div>
    </div>
</body>
</html>

```

## IE事件模型
`IE8`及之前的版本是不支持捕获事件的，`IE`事件模型共有两个过程:  
**事件处理阶段**`target phase`，事件到达目标元素, 触发目标元素的监听事件。  
**事件冒泡阶段**`bubbling phase`事件从目标元素冒泡到`document`，依次执行经过的节点绑定的事件。  

## DOM2级模型
`DOM2`事件模型是`W3C`制定的标准模型，支持捕获型事件和冒泡型事件，调用事件的处理阶段依次为捕获、目标、冒泡

### 实例
当点击`id`为`i3`的`<div>`时，浏览器会依次弹出`0 1 3 2`，`addEventListener`方法的第三个参数为声明绑定的事件为捕获型还是冒泡型，默认为`false`，也就是冒泡型
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
`document`对象与`i1`节点绑定的是捕获型的监听事件，`i2`与`i3`节点绑定的是冒泡型的事件，事件传递的顺序为

```
window --- document --- html --- body --- i1 --- i2 --- i3 --- i2 --- i1 --- body --- html --- document --- window
```
从`window`到`i3`的过程为**捕获阶段**，依次执行了过程中绑定的事件，本例中执行了`alert(0)`与`alert(1)`，然后到达**目标阶段**的`i3`,执行`i3`绑定的事件`alert(3)`，然后从`i3`到`window`的阶段为**冒泡阶段**，执行了绑定的`alert(2)`，执行顺序即为`0 1 3 2`。

## 注意
### 绑定监听事件使用的区别
在`DOM0`中直接绑定函数执行时，后定义的函数会覆盖前边绑定的函数，下面这个例子只执行`alert(1)`而不执行`alert(0)`。`click()`是一个对象事件，点击即触发`onclick()`绑定的方法，`onclick()`是对象的属性，将其绑定函数后即为`click()`事件触发后执行的方法。

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

    document.getElementById("i1").onclick = function(){
        alert(0);
    } // 被覆盖

    document.getElementById("i1").onclick = function(){
        alert(1);
    } // 执行
    
</script>
</html>


```

`addEventListener`可以为事件绑定多个函数，并且绑定时不需要加`on`，其还可以接收第三个参数`useCapture`来决定事件时绑定的捕获阶段还是冒泡阶段执行

```javascript
    document.getElementById("i1").addEventListener('click',(e) => {
        alert(0);
    }) // 执行

    document.getElementById("i1").addEventListener('click',(e) => {
        alert(1);
    }) // 执行
```

`attachEvent`可以为事件绑定多个函数，绑定时需要加`on`，其只支持冒泡阶段执行，所以不存在第三个参数。

```javascript
    document.getElementById("i1").attachEvent('onclick',function(e){
        alert(0);
    }) // 执行

    document.getElementById("i1").attachEvent('onclick',function(e){
        alert(1);
    }) // 执行
```
    