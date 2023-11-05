# CSS Specificity

When the style sheet is complex, it is easy to have multiple styles applied to a single tag. In this case, it is important to understand the CSS specificity to determine which styles will be applied to the tag and which ones will be overridden.

## Selector Specificity
For the tag's own attributes, the specificity rules for selectors are as follows:

```
Inline styles > ID selector > Class selector = Attribute selector = Pseudo-class selector > Tag selector = Pseudo-element selector
```
In the following example, when the following selectors are applied to the same tag, the color displayed will be `red`. You can select the corresponding element in the browser's `Elements` tab and check the style overrides and debug in the `Styles` tab.
```html
<div id="i1" class="c1">T1</div>

<style type="text/css">
    #i1 {
        color: red;
    }
    .c1 {
        color: blue;
    }
    :nth-child(1){
        color: green;
    }
    div {
        color: grey;
    }
</style>
```

## Selector Specificity Calculation
Selectors are composed of basic selectors, which can be categorized as follows:

```
Descendant selector: #i1 .c1 .c2
Child selector: #i1 > .c1 > .c2
Adjacent selector: .c1 + .c2
```
Calculate the number of **ID selectors** `a` in the selector, calculate the sum of the number of **class selectors, attribute selectors, and pseudo-class selectors** `b` in the selector, and calculate the sum of the number of **tag selectors and pseudo-element selectors** `c` in the selector. Compare `a`, `b`, and `c` in order, and the one with the highest value has the highest specificity. If `a`, `b`, and `c` are equal in the last two selectors, the "nearest rule" principle is used to determine the specificity. In addition, properties with `!important` have the highest specificity.

```html
<div id="i2" class="c2">
    <div>T2</div>
</div>
<style type="text/css">
    #i2 div {
        color: red;
    }
    .c2 > div {
        color: green;
    }
    div > div {
        color: blue;
    }
    :nth-child(1){
        color: black;
    }
    div {
        color: grey;
    }
</style>

First selector a:1 b:0 c:1
Second selector a:0 b:1 c:1
Third selector a:0 b:0 c:2
Fourth selector a:0 b:1 c:0
Fifth selector a:0 b:0 c:1
The order of specificity is: 1 2 4 3 5
```

> Source: https://www.runoob.com/w3cnote/css-style-priority.html  
> During the learning process, you may come across the concept of assigning weight values to selectors, such as assigning a weight value of 100 to ID selectors, a weight value of 10 to class selectors, and a weight value of 1 to tag selectors. When a selector is composed of multiple ID selectors, class selectors, or tag selectors, the weight values are added together and compared. However, this concept is flawed. For example, if a selector composed of 11 class selectors and a selector composed of 1 ID selector target the same tag, according to the logic, 110 > 100, so the former should apply its styles. However, in reality, the styles of the latter selector are applied. The reason for this error is that the weight values are not in decimal. In IE6, the weight value system is 256, which was later expanded to 65536. Modern browsers use even larger numbers. Let's use the previous example to explain. The total weight value of the selector composed of 11 class selectors is 110, but because all 11 selectors are class selectors, the total weight value cannot exceed 100. You can think of it as 99.99, so the styles of the latter selector are applied.

## Multiple Style Priority
The priority of external style sheets and internal style sheets depends on the order in which they are introduced. Generally, internal styles have higher priority than external styles, or they can be considered equal, because if an external style sheet is introduced after an internal style sheet, the external style sheet will override the internal style sheet.

```
Inline styles > Internal styles > External styles > Browser default styles
```

## Inheritance of Styles
Generally, the settings for text styles have inheritance. For example, `font-family`, `font-size`, `font-weight`, `color`, etc. When inheriting styles, the closest ancestor style takes precedence over other ancestor styles.

```html
<div style="color: red;">
        <div style="color: blue;">
            <div >T3</div> <!-- Displayed in blue -->
        </div>
    </div>
```

## Code

```html
<!DOCTYPE html>
<html>

<head>
    <title>CSS Style Priority</title>
</head>
<style type="text/css">
    #i1 {
        color: red;
    }
    .c1 {
        color: blue;
    }
    :nth-child(1){
        color: green;
    }
    div {
        color: grey;
    }

    #i2 div {
        color: red;
    }
    .c2 > div {
        color: green;
    }
    div > div {
        color: blue;
    }
</style>

<body>
    <div id="i1" class="c1">T1</div>
    <br>
    <div id="i2" class="c2">
        <div>T2</div>
    </div>
    <br>
    <div style="color: red;">
        <div style="color: blue;">
            <div style="color: inherit;">T3</div> <!-- Displayed in blue -->
        </div>
    </div>
</body>

</html>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```