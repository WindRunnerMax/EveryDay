# HTML节点操作
`HTML`节点的基本操作，添加节点，替换节点，删除节点，绑定事件，访问子节点，访问父节点，访问兄弟节点。  
文档对象模型`Document Object Model`，简称`DOM`，是`W3C`组织推荐的处理可扩展标记语言`XML`的标准编程接口，是一种与平台和语言无关的应用程序接口`API`。  
根据`W3C`的`HTML DOM`标准，`HTML`文档中的所有内容都是节点：整个文档是一个文档节点，每个`HTML`元素是元素节点，`HTML`元素内的文本是文本节点，每个`HTML`属性是属性节点，注释是注释节点。`HTML DOM`将`HTML`文档视作树结构。这种结构被称为节点树：`HTML DOM Tree`实例。  

## 添加节点

```html
    <div id="t1"></div>

    <script type="text/javascript">
        var d1 = document.createElement("div");  // 创建一个节点
        d1.style.color = "blue"; // 设置一下颜色
        d1.setAttribute("id","d1"); // 设置一个属性
        d1.innerText="innerText"; // innerText会一次性替换所有内容
        var tn1=document.createTextNode(" CreateTextNode"); // createTextNode可以做动态添加
        d1.appendChild(tn1); // 追加文本节点
        var node = document.getElementById("t1").appendChild(d1); // 将d1节点追加到t1节点后

        var b1 = document.createElement("div");
        b1.innerText="添加到d1前";
        document.getElementById("t1").insertBefore(b1,document.getElementById("d1")); // 将b1节点添加到t1节点内的d1节点前
    </script>

```

## 替换节点

```html
    <div id="t2">
        <div>被替换的节点</div>
    </div>

    <script type="text/javascript">
        var d2 = document.createElement("div");
        d2.style.color = "green";
        d2.innerText="被我替换了";
        document.getElementById("t2").replaceChild(d2,document.querySelector("#t2 > div:first-child")); // 第一个参数是要替换的节点，第二个参数是被替换的节点
    </script>
```

## 删除节点

```html
    <div id="t3">
        <div>下边的兄弟被删除了</div>
        <div>我要被删除了</div>
    </div>

    <script type="text/javascript">
        document.getElementById("t3").removeChild(document.querySelector("#t3 > div:nth-child(2)"));
    </script>
```

## 绑定事件

```html
    <div id="t4" style="color: red;">点我</div>

    <script type="text/javascript">
        document.getElementById("t4").addEventListener('click',(e) => {
            alert("点击事件");
        })   
    </script>

<!-- 事件流模型见 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/JS%E4%BA%8B%E4%BB%B6%E6%B5%81%E6%A8%A1%E5%9E%8B.md#dom0%E7%BA%A7%E6%A8%A1%E5%9E%8B -->
```
## 访问子节点

```html
    <div id="t5" style="color: grey;">
        <div>1</div>
        <div>2</div>
    </div>

    <script type="text/javascript">
        console.log(document.getElementById("t5").childNodes); // 获取所有子节点 // 注意每个换行也会有一个#text文本节点
        console.log(document.getElementById("t5").childElementCount); // 获取子节点数量
        console.log( document.getElementById("t5").firstChild); // 获取第一个子节点，注意也会匹配#text
        console.log(document.getElementById("t5").firstElementChild); // 获取第一个子节点
        console.log(document.getElementById("t5").lastChild); // 获取最后一个子节点，注意也会匹配#text
        console.log(document.getElementById("t5").lastElementChild); // 获取最后一个子节点
    </script>
```

## 访问父节点

```html
    <div style="color: yellow;">
        <div id="t6">1</div>
    </div>

    <script type="text/javascript">
        console.log(document.getElementById("t6").parentNode);
    </script>
```

## 访问兄弟节点

```html
    <div style="color: brown;"><div>1</div><div id="t7">2</div><div>3</div></div>

    <script type="text/javascript">
        console.log(document.getElementById("t7").previousSibling); // 注意也会匹配#text
        console.log(document.getElementById("t7").previousElementSibling); // 不匹配文本节点、注释节点
        console.log(document.getElementById("t7").nextSibling); // 注意也会匹配#text
        console.log(document.getElementById("t7").nextElementSibling); // 不匹配文本节点、注释节点
    </script>
```


## 代码示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>HTML节点操作</title>
    <meta charset="utf-8">
</head>
<body>

    <div id="t1"></div>

    <script type="text/javascript">
        var d1 = document.createElement("div");  // 创建一个节点
        d1.style.color = "blue"; // 设置一下颜色
        d1.setAttribute("id","d1"); // 设置一个属性
        d1.innerText="innerText"; // innerText会一次性替换所有内容
        var tn1=document.createTextNode(" CreateTextNode"); // createTextNode可以做动态添加
        d1.appendChild(tn1); // 追加文本节点
        var node = document.getElementById("t1").appendChild(d1); // 将d1节点追加到t1节点后

        var b1 = document.createElement("div");
        b1.innerText="添加到d1前";
        document.getElementById("t1").insertBefore(b1,document.getElementById("d1")); // 将b1节点添加到t1节点内的d1节点前
    </script>



    <div id="t2">
        <div>被替换的节点</div>
    </div>

    <script type="text/javascript">
        var d2 = document.createElement("div");
        d2.style.color = "green";
        d2.innerText="被我替换了";
        document.getElementById("t2").replaceChild(d2,document.querySelector("#t2 > div:first-child")); // 第一个参数是要替换的节点，第二个参数是被替换的节点
    </script>



    <div id="t3">
        <div>下边的兄弟被删除了</div>
        <div>我要被删除了</div>
    </div>

    <script type="text/javascript">
        document.getElementById("t3").removeChild(document.querySelector("#t3 > div:nth-child(2)"));
    </script>



    <div id="t4" style="color: red;">点我</div>

    <script type="text/javascript">
        document.getElementById("t4").addEventListener('click',(e) => {
            alert("点击事件");
        })   
    </script>
    <!-- 事件流模型见 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/JS%E4%BA%8B%E4%BB%B6%E6%B5%81%E6%A8%A1%E5%9E%8B.md#dom0%E7%BA%A7%E6%A8%A1%E5%9E%8B -->



    <div id="t5" style="color: grey;">
        <div>1</div>
        <div>2</div>
    </div>

    <script type="text/javascript">
        console.log(document.getElementById("t5").childNodes); // 获取所有子节点 // 注意每个换行也会有一个#text文本节点
        console.log(document.getElementById("t5").childElementCount); // 获取子节点数量
        console.log( document.getElementById("t5").firstChild); // 获取第一个子节点，注意也会匹配#text
        console.log(document.getElementById("t5").firstElementChild); // 获取第一个子节点
        console.log(document.getElementById("t5").lastChild); // 获取最后一个子节点，注意也会匹配#text
        console.log(document.getElementById("t5").lastElementChild); // 获取最后一个子节点
    </script>



    <div style="color: yellow;">
        <div id="t6">1</div>
    </div>

    <script type="text/javascript">
        console.log(document.getElementById("t6").parentNode);
    </script>



    <div style="color: brown;"><div>1</div><div id="t7">2</div><div>3</div></div>

    <script type="text/javascript">
        console.log(document.getElementById("t7").previousSibling); // 注意也会匹配#text
        console.log(document.getElementById("t7").previousElementSibling); // 不匹配文本节点、注释节点
        console.log(document.getElementById("t7").nextSibling); // 注意也会匹配#text
        console.log(document.getElementById("t7").nextElementSibling); // 不匹配文本节点、注释节点
    </script>
</body>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```
