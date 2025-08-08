# CSS Box Model

All `HTML` elements can be seen as boxes.  
If we break down the box model, it includes margin + border + padding + content.  
To sound more professional, `box model` = `margin` + `border` + `padding` + `content`.  

```
------------------------------------------
|                 margin                 |  
| -------------------------------------- |
| |               border               | |
| | ---------------------------------- | |
| | |             padding            | | |
| | | ------------------------------ | | |
| | | |           content          | | | |
| | | |                            | | | |
| | | |                            | | | |
| | | ------------------------------ | | |
| | ---------------------------------- | |
|  ------------------------------------- |
------------------------------------------
```

## Analysis of Box Components

### margin

```css
#marginShow{
    /* shorthand for all four directions */
    margin: 10px;
    /* shorthand for top and bottom margins, left and right margins */
    margin: 10px 10px;
    /* individual margins for top, right, bottom, and left */
    margin: 10px 10px 10px 10px;
    /* individual configuration for top, right, bottom, and left */
    margin-top: 10px;
    margin-right: 10px;
    margin-left: 10px;
    margin-bottom: 10px;  
}
```

### border

```css
#boderShow{
    /* shorthand */
    border: 1px solid #eee;
    /* individual configuration for top, bottom, left, and right */
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
    border-left: 1px solid #eee;
    border-right: 1px solid #eee;
}
```



### padding

```css
#paddingShow{
    /* shorthand for all four directions */
    padding: 10px;
    /* shorthand for top and bottom padding, left and right padding */
    padding: 10px 10px;
    /* individual padding for top, right, bottom, and left */
    padding: 10px 10px 10px 10px;
    /* individual configuration for top, right, bottom, and left */
    padding-top: 10px;
    padding-right: 10px;
    padding-left: 10px;
    padding-bottom: 10px;  
}
```

## box-sizing Property
`content-box`: Default value. The `width` and `height` properties apply to the content box of the element. The `margin`, `border`, and `padding` are drawn outside the width and height of the element, known as the **standard box model**.  
`border-box`: The `width` and `height` properties set the border box of the element. This means that any padding and border specified for the element will be drawn within the set width and height. The content width and height are obtained by subtracting the `border` and `padding` from the set width and height, known as the **IE box model**.  
`inherit`: Specifies that the box-sizing property should be inherited from the parent element.

## Browser Compatibility
Once the appropriate `DTD` is set for the page, most browsers will render the content according to the diagram above. However, the rendering of `IE5` and `IE6` is incorrect. According to the `W3C` specification, the space occupied by the element's content is determined by the `width` property, while the `padding` and `border` values around the content are calculated separately. Unfortunately, `IE5.X` and `IE6` use their own non-standard model in quirks mode. In these browsers, the `width` property is not the width of the content, but the total width of the content, padding, and border.  
Although there are ways to solve this problem, the best solution currently is to avoid it. That is, do not add padding with a specified width to the element, but try to add padding or margin to the parent and child elements of the element.  
`IE8` and earlier versions of `IE` do not support setting the width of padding and border.  
To solve the compatibility issue with `IE8` and earlier versions, simply declare `<!DOCTYPE html>` in the `HTML` page.

## Test Code

```html
<!DOCTYPE html>
<html>
<head>
    <title>CSS Box Model</title>
</head>
<body>

    <div class="normal">I am a box with a border</div>

```html
<div class="hr"></div>

<div id="marginShow" class="normal">I am a box with margin</div>

<div class="hr"></div>

<div id="paddingShow" class="normal">I am a box with padding</div>

<div class="hr"></div>

<div id="boxsizeShow" class="normal">I am a box with padding and IE box model</div>


<style type="text/css">

    .hr{ 
        height: 1px;
        background: #eee;
    }

    .normal{
        color: #fff;
        width: 300px;
        height: 50px;
        background: #1E9FFF;
        border: 1px solid #aaa;
    }
    #marginShow{
        /* shorthand for all four directions */
        margin: 10px;
        /* shorthand for top/bottom margin and left/right margin */
        margin: 10px 10px;
        /* individual margins for top/right/bottom/left */
        margin: 10px 10px 10px 10px;
        /* individual margins for top/right/bottom/left */
        margin-top: 10px;
        margin-right: 10px;
        margin-left: 10px;
        margin-bottom: 10px;  
    }
    #paddingShow{
        /* shorthand for all four directions */
        padding: 10px;
        /* shorthand for top/bottom padding and left/right padding */
        padding: 10px 10px;
        /* individual padding for top/right/bottom/left */
        padding: 10px 10px 10px 10px;
        /* individual padding for top/right/bottom/left */
        padding-top: 10px;
        padding-right: 10px;
        padding-left: 10px;
        padding-bottom: 10px;  
    }
    #boxsizeShow{
        box-sizing: border-box;
        padding: 10px;
    }
</style>
</body>
</html>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```