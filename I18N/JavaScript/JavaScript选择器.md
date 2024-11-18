# JavaScript Selectors
Commonly used JS selectors are `getElementById()`, `getElementsByClassName()`, `getElementsByName()`, `getElementsByTagName()`, `querySelector()`, `querySelectorAll()`.

## getElementById
Locates by `id` and returns a reference to the first object with the specified `id`, of type `HTMLDivElement`.

```html
<div id="t1">T1</div>

<script type="text/javascript">
    var t1 = document.getElementById("t1");
    console.log(t1); // <div id="t1">D1</div>
    console.log(Object.prototype.toString.call(t1)); // [object HTMLDivElement]
</script>
```

## getElementsByClassName
Locates by the `class` attribute, returns a reference to elements with the specified `class` attribute value in the document as an `HTMLCollection`.

```html
<div class="t2">D2</div>
<div class="t2">D3</div>

<script type="text/javascript">
    var t2List = document.getElementsByClassName("t2");
    console.log(t2List); // HTMLCollection(2) [div.t2, div.t2]
    // Traverse using a for loop
    for(let i=0,n=t2List.length;i<n;++i) console.log(t2List[i]);
    // Since HTMLCollection's prototype does not have a forEach method, traversal requires using Array's prototype and invoking the call method to bind the object instance and pass parameters
    Array.prototype.forEach.call(t2List,v => console.log(v) ); 
    // Since HTMLCollection's prototype does not have a map method, traversal also requires using Array's prototype and invoking the call method to bind the object instance and pass parameters
    Array.prototype.map.call(t2List,v => console.log(v) ); 
</script>
```

## getElementsByName
Locates by the `name` attribute, returns a reference to elements with the specified `name` attribute value in the document as a `NodeList`.

```html
<div name="t3">D4</div>
<div name="t3">D5</div>

<script type="text/javascript">
    var t3List = document.getElementsByName("t3");
    console.log(t3List); // NodeList(2) [div, div]
    // Can directly use forEach for traversal
    t3List.forEach( v => console.log(v) ); 
    // Since NodeList's prototype does not have a map method, scenarios involving map also require using Array's prototype and invoking the map method through call to bind the object instance and pass parameters
    Array.prototype.map.call(t3List,v => console.log(v) ); 
</script>
```

## getElementsByTagName
Locates by the tag name, returns a reference to elements with the specified tag in the document as an `HTMLCollection`.

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
Locates by a `CSS` selector, returns a reference to the first element in the document matching the specified `CSS` selector, of type `HTMLDivElement`.

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
Locates by a `CSS` selector, returns a reference to all elements in the document matching the specified `CSS` selector as a `NodeList`.

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

## Code Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>JavaScript Selectors</title>
    <meta charset="utf-8">
</head>
<body>

```html
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
    // Loop through using a for loop
    for(let i=0,n=t2List.length;i<n;++i) console.log(t2List[i]);
    // The HTMLCollection prototype doesn't have a forEach method, so we need to use Array's prototype forEach and bind the object instance and pass parameters using call
    Array.prototype.forEach.call(t2List,v => console.log(v) ); 
    // The HTMLCollection prototype doesn't have a map method, so we also need to use Array's prototype forEach and bind the object instance and pass parameters using call
    Array.prototype.map.call(t2List,v => console.log(v) ); 
    console.log("");

    var t3List = document.getElementsByName("t3");
    console.log(t3List); // NodeList(2) [div, div]
    // You can directly use forEach for traversal
    t3List.forEach( v => console.log(v) ); 
    // The NodeList prototype doesn't have a map method, and using map also requires Array's prototype map and bind the object instance and pass parameters using call
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

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
Array traversal: https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/Js%E9%81%8D%E5%8E%86%E6%95%B0%E7%BB%84%E6%80%BB%E7%BB%93.md
ES6 arrow function: https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/ES6%E6%96%B0%E7%89%B9%E6%80%A7.md
Prototype and prototype chain: https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/%E5%8E%9F%E5%9E%8B%E4%B8%8E%E5%8E%9F%E5%9E%8B%E9%93%BE.md
CSS selectors: https://github.com/WindrunnerMax/EveryDay/blob/master/CSS/CSS%E9%80%89%E6%8B%A9%E5%99%A8.md
```