# CSS Selectors
To achieve one-to-one, one-to-many, or many-to-one control of elements in an HTML page using CSS, selectors are used.  
The elements in an HTML page are controlled using CSS selectors.

## ID Selector

```html
<div id="s1">ID Selector</div>

<style type="text/css">
    #s1 {
        color: red;
    }
</style>
```

## Class Selector

```html
<div class="s2">Class Selector 1</div>
<div class="s2">Class Selector 2</div>
<div class="s3">Class Selector 3</div>

<style type="text/css">
    .s2{
        color: green;
    }
    
    /* Multiple selectors can be written together */
    .s2,.s3,#s1{
        font-style:italic;
    }
    </style>
```

## Tag Selector
```html
<p>Tag Selector 1</p>
<p>Tag Selector 2</p>

<style type="text/css">
    p{
        color: blue;
    }
</style>
```

## Adjacent Selector

```html
<div id="s4">Adjacent Selector +</div>
<div>Adjacent Selector</div>
<!-- + selects only the immediately adjacent siblings -->
<div id="s5">Adjacent Selector ~</div>
<div class="s6">Adjacent Selector</div>
<div class="s6">Adjacent Selector</div>
<div class="s6">Adjacent Selector</div>
<!-- ~ selects siblings and their siblings..... -->

 <style type="text/css">
    #s4 + div{
        color: #0033ff;
    }
    #s5 ~ .s6{
        color: #FFD700;
    }
</style>
```

## Child Selector

```html
<div class="s7">
    <div>Child Selector</div>
    <em>
        <div>Child Selector not selected</div>
        <div>Child Selector not selected</div>
    </em>
</div>

<style type="text/css">
    /* Child selector selects the next level */
    .s7 > div{
        color: #E066FF;
    }
</style>
```

## Descendant Selector

```html
<div class="s8">
    <div>Descendant Selector</div>
    <em>
        <div>Descendant Selector</div>
        <div>Descendant Selector</div>
    </em>
</div>

<style type="text/css">
    /* Descendant selector selects all descendants */
    .s8 div{
        color: #7CFC00;
    }
</style>
```

## Universal Selector

```html
<div class="s9">
    <div>Universal Selector</div>
    <em>Universal Selector</em>
</div>

<style type="text/css">
    .s9 * {
        color: #3370CC
    }
</style>
```

## Attribute Selector
```html
<div rel="s10" >Attribute Selector</div>

<style type="text/css">
    div[rel="s10"]{
        color: #573CC4
    }
</style>
```

## Pseudo-class Selector

```html
<div >
    <div class="s11">Pseudo-class Selector Example</div>
</div>

```html
<style type="text/css">
    /* Reference for pseudo-classes and pseudo-elements: https://github.com/WindrunnerMax/EveryDay/blob/master/CSS/%E4%BC%AA%E7%B1%BB%E4%B8%8E%E4%BC%AA%E5%85%83%E7%B4%A0.md */
    .s11:first-child{ 
        color: #55AA55;
    }
</style>
```

## Code Example

```html
<!DOCTYPE html>
<html>

<head>
    <title>CSS Selectors</title>
</head>

<body>
    <div id="s1">ID Selector</div>

    <div class="s2">Class Selector 1</div>
    <div class="s2">Class Selector 2</div>
    <div class="s3">Class Selector 3</div>

    <p>Tag Selector 1</p>
    <p>Tag Selector 2</p>

    <div id="s4">Adjacent Selector +</div>
    <div>Adjacent Selector</div>
    <!-- + selects only the immediately adjacent siblings -->
    <div id="s5">General Sibling Selector ~</div>
    <div class="s6">General Sibling Selector</div>
    <div class="s6">General Sibling Selector</div>
    <div class="s6">General Sibling Selector</div>
    <!-- ~ selects siblings and their siblings... -->

    <div class="s7">
        <div>Child Selector</div>
        <em>
            <div>Child Selector not selected</div>
            <div>Child Selector not selected</div>
        </em>
    </div>

    <div class="s8">
        <div>Descendant Selector</div>
        <em>
            <div>Descendant Selector</div>
            <div>Descendant Selector</div>
        </em>
    </div>


    <div class="s9">
        <div>Universal Selector</div>
        <em>Universal Selector</em>
    </div>

    <div rel="s10" >Attribute Selector</div>

    <div >
        <div class="s11">Pseudo-class Selector Example</div>
    </div>
    

    <style type="text/css">
    #s1 {
        color: red;
    }

    .s2{
        color: green;
    }

    .s2,.s3,#s1{
        font-style:italic;
    }

    p{
        color: blue;
    }

    #s4 + div{
        color: #0033ff;
    }
    #s5 ~ .s6{
        color: #FFD700;
    }

    /* Child selector selects the next level */
    .s7 > div{
        color: #E066FF;
    }

    /* Descendant selector selects all descendants */
    .s8 div{
        color: #7CFC00;
    }

    .s9 * {
        color: #3370CC;
    }

    div[rel="s10"]{
        color: #573CC4;
    }

    .s11:first-child{
        color: #55AA55;
    }
    </style>

</body>

</html>
```

## Daily Question

```
[https://github.com/WindrunnerMax/EveryDay](https://github.com/WindrunnerMax/EveryDay)
```