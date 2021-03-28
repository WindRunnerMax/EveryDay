# Js选择器
JS选择器常用的有`getElementById()`、`getElementsByClassName()`、`getElementsByName()`、`getElementsByTagName()`、`querySelector()`、`querySelectorAll()`。

## getElementById
通过`id`来定位，返回对指定`id`的第一个对象的引用，返回类型为`HTMLDivElement`。

```html
<div id="t1">T1</div>

<script type="text/javascript">
    var t1 = document.getElementById("t1");
    console.log(t1); // <div id="t1">D1</div>
    console.log(Object.prototype.toString.call(t1)); // [object HTMLDivElement]
</script>
```

## getElementsByClassName
通过`class`属性来定位，返回文档中指定`class`属性值的元素的引用，返回类型为`HTMLCollection`。

```html
<div class="t2">D2</div>
<div class="t2">D3</div>

<script type="text/javascript">
    var t2List = document.getElementsByClassName("t2");
    console.log(t2List); // HTMLCollection(2) [div.t2, div.t2]
    // 使用for循环遍历
    for(let i=0,n=t2List.length;i<n;++i) console.log(t2List[i]);
    // HTMLCollection的prototype中没有forEach方法，遍历需要使用Array的prototype中forEach通过call绑定对象实例并传参
    Array.prototype.forEach.call(t2List,v => console.log(v) ); 
    // HTMLCollection的prototype中没有map方法，也需要使用Array的prototype中forEach通过call绑定对象实例并传参
    Array.prototype.map.call(t2List,v => console.log(v) ); 
</script>
```

## getElementsByName
通过`name`属性来定位，返回文档中指定`name`属性值的元素的引用，返回类型为`NodeList`。

```html
<div name="t3">D4</div>
<div name="t3">D5</div>

<script type="text/javascript">
    var t3List = document.getElementsByName("t3");
    console.log(t3List); // NodeList(2) [div, div]
    // 可直接使用forEach进行遍历
    t3List.forEach( v => console.log(v) ); 
    // NodeList的prototype中没有map方法，使用map的场景也需要借助Array的prototype中map通过call绑定对象实例并传参
    Array.prototype.map.call(t3List,v => console.log(v) ); 
</script>
```

## getElementsByTagName
通过标签的名字来定位，返回文档中指定标签的元素的引用，返回类型为`HTMLCollection`。

```html
<p class="t4">P6</p>
<p class="t4">P7</p>

<script type="text/javascript">
    var t4List = document.getElementsByTagName("p");
    console.log(t4List); // HTMLCollection(2) [p, p]
    Array.prototype.forEach.call(t4List, function(v){console.log(v);}); 
    Array.prototype.map.call(t4List,function(v){console.log(v);} ); 
</script>
```

## querySelector
通过`CSS`选择器来定位，返回文档中匹配指定`CSS`选择器的第一个元素的引用，返回类型为`HTMLDivElement`。

```html
<div>
    <div class="t5">D8</div>
</div>

<script type="text/javascript">
    var t5 = document.querySelector("div .t5");
    console.log(t5); // <div class="t5">D8</div>
    console.log(Object.prototype.toString.call(t5)); // [object HTMLDivElement]
</script>
```

## querySelectorAll
通过`CSS`选择器来定位，返回文档中匹配指定`CSS`选择器的所有元素的引用，返回类型为`NodeList`。

```html
<div>
    <div id="t6">D9</div>
    <div>D10</div>
    <div>D11</div>
</div>

<script type="text/javascript">
     var t6List = document.querySelectorAll("#t6 ~ div");
    console.log(t6List); // NodeList(2)[div, div]
    t6List.forEach(function(v){console.log(v);}); 
    Array.prototype.map.call(t6List,function(v){console.log(v);} ); 
</script>
```

## 代码示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>Js选择器</title>
    <meta charset="utf-8">
</head>
<body>

    <div id="t1">D1</div>

    <div class="t2">D2</div>
    <div class="t2">D3</div>

    <div name="t3">D4</div>
    <div name="t3">D5</div>

    <p class="t4">P6</p>
    <p class="t4">P7</p>

    <div>
        <div class="t5">D8</div>
    </div>

    <div>
        <div id="t6">D9</div>
        <div>D10</div>
        <div>D11</div>
    </div>

</body>
<script type="text/javascript">
    var t1 = document.getElementById("t1");
    console.log(t1); // <div id="t1">D1</div>
    console.log(Object.prototype.toString.call(t1)); // [object HTMLDivElement]
    console.log("");

    var t2List = document.getElementsByClassName("t2");
    console.log(t2List); // HTMLCollection(2) [div.t2, div.t2]
    // 使用for循环遍历
    for(let i=0,n=t2List.length;i<n;++i) console.log(t2List[i]);
    // HTMLCollection的prototype中没有forEach方法，遍历需要使用Array的prototype中forEach通过call绑定对象实例并传参
    Array.prototype.forEach.call(t2List,v => console.log(v) ); 
    // HTMLCollection的prototype中没有map方法，也需要使用Array的prototype中forEach通过call绑定对象实例并传参
    Array.prototype.map.call(t2List,v => console.log(v) ); 
    console.log("");

    var t3List = document.getElementsByName("t3");
    console.log(t3List); // NodeList(2) [div, div]
    // 可直接使用forEach进行遍历
    t3List.forEach( v => console.log(v) ); 
    // NodeList的prototype中没有map方法，使用map的场景也需要借助Array的prototype中map通过call绑定对象实例并传参
    Array.prototype.map.call(t3List,v => console.log(v) ); 
    console.log("");

    var t4List = document.getElementsByTagName("p");
    console.log(t4List); // HTMLCollection(2) [p, p]
    Array.prototype.forEach.call(t4List, function(v){console.log(v);}); 
    Array.prototype.map.call(t4List,function(v){console.log(v);} ); 
    console.log("");

    var t5 = document.querySelector("div > .t5");
    console.log(t5); // <div class="t5">D8</div>
    console.log(Object.prototype.toString.call(t5)); // [object HTMLDivElement]
    console.log("");

    var t6List = document.querySelectorAll("#t6 ~ div");
    console.log(t6List); // NodeList(2) [div, div]
    t6List.forEach(function(v){console.log(v);}); 
    Array.prototype.map.call(t6List,function(v){console.log(v);} ); 
    console.log("");
</script>
</html>
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
数组的遍历 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/Js%E9%81%8D%E5%8E%86%E6%95%B0%E7%BB%84%E6%80%BB%E7%BB%93.md
ES6箭头函数 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/ES6%E6%96%B0%E7%89%B9%E6%80%A7.md
原型与原型链 https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/%E5%8E%9F%E5%9E%8B%E4%B8%8E%E5%8E%9F%E5%9E%8B%E9%93%BE.md
CSS选择器 https://github.com/WindrunnerMax/EveryDay/blob/master/CSS/CSS%E9%80%89%E6%8B%A9%E5%99%A8.md
```