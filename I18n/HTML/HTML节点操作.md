# HTML Node Operations
Basic operations on `HTML` nodes include adding nodes, replacing nodes, deleting nodes, binding events, accessing child nodes, accessing parent nodes, and accessing sibling nodes.  
The Document Object Model (`DOM`), recommended by the `W3C` organization, is a standard programming interface for handling Extensible Markup Language (`XML`), and is a platform and language-independent application programming interface (`API`).  
According to the `W3C` HTML DOM standard, all content in an HTML document is considered a node: the entire document is a document node, each HTML element is an element node, the text within an HTML element is a text node, each HTML attribute is an attribute node, and comments are comment nodes. The HTML DOM views the HTML document as a tree structure. This structure is referred to as a node tree: an instance of the HTML DOM Tree.  

## Adding Nodes

```html
    <div id="t1"></div>

    <script type="text/javascript">
        var d1 = document.createElement("div");  // Create a node
        d1.style.color = "blue"; // Set the color
        d1.setAttribute("id","d1"); // Set an attribute
        d1.innerText="innerText"; // innerText replaces all content at once
        var tn1=document.createTextNode(" CreateTextNode"); // createTextNode allows for dynamic addition
        d1.appendChild(tn1); // Append the text node
        var node = document.getElementById("t1").appendChild(d1); // Append the d1 node after the t1 node

        var b1 = document.createElement("div");
        b1.innerText="Added before d1";
        document.getElementById("t1").insertBefore(b1,document.getElementById("d1")); // Add the b1 node before the d1 node within the t1 node
    </script>

```

## Replacing Nodes

```html
    <div id="t2">
        <div>Node to be replaced</div>
    </div>

    <script type="text/javascript">
        var d2 = document.createElement("div");
        d2.style.color = "green";
        d2.innerText="Replaced by me";
        document.getElementById("t2").replaceChild(d2,document.querySelector("#t2 > div:first-child")); // The first parameter is the node to be replaced, and the second parameter is the node to be replaced
    </script>
```

## Deleting Nodes

```html
    <div id="t3">
        <div>The sibling below has been deleted</div>
        <div>I am going to be deleted</div>
    </div>

    <script type="text/javascript">
        document.getElementById("t3").removeChild(document.querySelector("#t3 > div:nth-child(2)"));
    </script>
```

## Binding Events

```html
    <div id="t4" style="color: red;">Click me</div>


```javascript
<script type="text/javascript">
    document.getElementById("t4").addEventListener('click',(e) => {
        alert("Click event");
    })   
</script>

<!-- See event flow model at https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/JS%E4%BA%8B%E4%BB%B6%E6%B5%81%E6%A8%A1%E5%9E%8B.md#dom0%E7%BA%A7%E6%A8%A1%E5%9E%8B -->
```
## Accessing child nodes

```html
<div id="t5" style="color: grey;">
    <div>1</div>
    <div>2</div>
</div>

<script type="text/javascript">
    console.log(document.getElementById("t5").childNodes); // Get all child nodes // Note that each line break will also have a #text text node
    console.log(document.getElementById("t5").childElementCount); // Get the number of child nodes
    console.log( document.getElementById("t5").firstChild); // Get the first child node, note that it will also match #text
    console.log(document.getElementById("t5").firstElementChild); // Get the first child node
    console.log(document.getElementById("t5").lastChild); // Get the last child node, note that it will also match #text
    console.log(document.getElementById("t5").lastElementChild); // Get the last child node
</script>
```

## Accessing parent nodes

```html
<div style="color: yellow;">
    <div id="t6">1</div>
</div>

<script type="text/javascript">
    console.log(document.getElementById("t6").parentNode);
</script>
```

## Accessing sibling nodes

```html
<div style="color: brown;"><div>1</div><div id="t7">2</div><div>3</div></div>

<script type="text/javascript">
    console.log(document.getElementById("t7").previousSibling); // Note that it will also match #text
    console.log(document.getElementById("t7").previousElementSibling); // Does not match text nodes or comment nodes
    console.log(document.getElementById("t7").nextSibling); // Note that it will also match #text
    console.log(document.getElementById("t7").nextElementSibling); // Does not match text nodes or comment nodes
</script>
```


## Code example

```html
<!DOCTYPE html>
<html>
<head>
    <title>HTML Node Operations</title>
    <meta charset="utf-8">
</head>
<body>

    <div id="t1"></div>

    <script type="text/javascript">
        var d1 = document.createElement("div");  // Create a node
        d1.style.color = "blue"; // Set the color
        d1.setAttribute("id","d1"); // Set an attribute
        d1.innerText="innerText"; // innerText will replace all content at once
        var tn1=document.createTextNode(" CreateTextNode"); // createTextNode can be used for dynamic addition
        d1.appendChild(tn1); // Append the text node
        var node = document.getElementById("t1").appendChild(d1); // Append the d1 node to the t1 node

        var b1 = document.createElement("div");
        b1.innerText="Added before d1";
        document.getElementById("t1").insertBefore(b1,document.getElementById("d1")); // Add the b1 node before the d1 node inside the t1 node
    </script>



    <div id="t2">
        <div>Node to be replaced</div>
    </div>

    <script type="text/javascript">
        var d2 = document.createElement("div");
        d2.style.color = "green";
        d2.innerText="Replaced by me";
        document.getElementById("t2").replaceChild(d2,document.querySelector("#t2 > div:first-child")); // The first parameter is the node to be replaced, the second parameter is the node to be replaced
    </script>



    <div id="t3">
        <div>The sibling below has been deleted</div>
        <div>I am going to be deleted</div>
    </div>

    <script type="text/javascript">
        document.getElementById("t3").removeChild(document.querySelector("#t3 > div:nth-child(2)"));
    </script>



    <div id="t4" style="color: red;">Click me</div>

    <script type="text/javascript">
        document.getElementById("t4").addEventListener('click',(e) => {
            alert("Click event");
        })   
    </script>
    <!-- See event flow model at https://github.com/WindrunnerMax/EveryDay/blob/master/JavaScript/JS%E4%BA%8B%E4%BB%B6%E6%B5%81%E6%A8%A1%E5%9E%8B.md#dom0%E7%BA%A7%E6%A8%A1%E5%9E%8B -->
```

```html
<div id="t5" style="color: grey;">
    <div>1</div>
    <div>2</div>
</div>

<script type="text/javascript">
    console.log(document.getElementById("t5").childNodes); // Get all child nodes // Note that each line break will also have a #text text node
    console.log(document.getElementById("t5").childElementCount); // Get the number of child nodes
    console.log(document.getElementById("t5").firstChild); // Get the first child node, note that it will also match #text
    console.log(document.getElementById("t5").firstElementChild); // Get the first child node
    console.log(document.getElementById("t5").lastChild); // Get the last child node, note that it will also match #text
    console.log(document.getElementById("t5").lastElementChild); // Get the last child node
</script>

<div style="color: yellow;">
    <div id="t6">1</div>
</div>

<script type="text/javascript">
    console.log(document.getElementById("t6").parentNode);
</script>

<div style="color: brown;">
    <div>1</div>
    <div id="t7">2</div>
    <div>3</div>
</div>

<script type="text/javascript">
    console.log(document.getElementById("t7").previousSibling); // Note that it will also match #text
    console.log(document.getElementById("t7").previousElementSibling); // Does not match text nodes or comment nodes
    console.log(document.getElementById("t7").nextSibling); // Note that it will also match #text
    console.log(document.getElementById("t7").nextElementSibling); // Does not match text nodes or comment nodes
</script>
</body>
</html>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```