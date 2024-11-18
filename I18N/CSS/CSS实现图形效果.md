# CSS Implementation of Graphic Effects
CSS implementation of square, rectangle, circle, semicircle, oval, triangle, parallelogram, diamond, trapezoid, hexagram, pentagram, heart, message box.

## Square

```html
<section>
    <div id="square"></div>
</section>
<style type="text/css">
    #square{
        width: 100px;
        height: 100px;
        background: #4C98F7;
    }
</style>
```

## Rectangle

```html
<section>
    <div id="rectangle"></div>
</section>
<style type="text/css">
    #rectangle{
        width: 200px;
        height: 100px;
        background: #4C98F7;
    }
</style>
```

## Circle

```html
<section>
    <div id="circle"></div>
</section>
<style type="text/css">
    #circle{
        width: 100px;
        height: 100px;
        background: #4C98F7;
        border-radius: 50%;
    }
</style>
```

## Semicircle

```html
<section>
    <div id="semicircle"></div>
</section>
<style type="text/css">
    #semicircle{
        width: 100px;
        height: 50px;
        background: #4C98F7;
        border-radius: 100px 100px 0 0;
    }
</style>
```

## Oval

```html
<section>
    <div id="oval"></div>
</section>
<style type="text/css">
    #oval{
        width: 100px;
        height: 50px;
        background: #4C98F7;
        border-radius: 100px / 50px;
    }
</style>
```

## Triangle

```html
<section>
    <div id="regular-triangle"></div>
</section>
<style type="text/css">
    #regular-triangle{
        width: 0;
        height: 0;
        border-left: 50px solid transparent;
        border-right: 50px solid transparent;
        border-bottom: 100px solid #4C98F7;
    }
</style>

<section>
    <div id="corner-triangle"></div>
</section>
<style type="text/css">
    #corner-triangle{
        width: 0;
        height: 0;
        border-top: 100px solid #4C98F7;
        border-right: 100px solid transparent;
    }
</style>
```

## Parallelogram

```html
<section>
    <div id="pentagon"></div>
</section>
<style type="text/css">
    #pentagon {
        width: 0;
        height: 0;
        border: 100px solid transparent;
        border-bottom-color: #4C98F7;
        position: relative;
        top: -100px;
    }
    #pentagon:after {
        content: "";
        position: absolute;
        left: -100px;
        top: 100px;
        width: 0;
        height: 0;
        border: 100px solid transparent;
        border-top-color: #4C98F7;
    }
</style>
```

## Star

```html
<section>
    <div id="five-pointed-star"></div>
</section>
<style type="text/css">
    #five-pointed-star { 
        margin: 100px 0 50px 0; 
        position: relative;
        width: 0px; 
        height: 0px; 
        border-right: 100px solid transparent; 
        border-bottom: 70px solid #4C98F7; 
        border-left: 100px solid transparent; 
        transform: rotate(35deg); 
    }
     #five-pointed-star:before { 
        content: ""; 
        position: absolute; 
        height: 0; 
        width: 0; 
        top: -45px; 
        left: -65px; 
        border-bottom: 80px solid #4C98F7; 
        border-left: 30px solid transparent; 
        border-right: 30px solid transparent; 
        transform: rotate(-35deg); 
    } 
    #five-pointed-star:after { 
        content: ""; 
        position: absolute; 
        top: 3px; 
        left: -105px; 
        width: 0px; 
        height: 0px; 
        border-right: 100px solid transparent; 
        border-bottom: 70px solid #4C98F7; 
        border-left: 100px solid transparent; 
        transform: rotate(-70deg); 
    }
</style>
```

## Heart Shape

```html
<section>
    <div id="five-pointed-star"></div>
</section>
<style type="text/css">
    #five-pointed-star { 
        margin: 100px 0 50px 0; 
        position: relative;
        width: 0px; 
        height: 0px; 
        border-right: 100px solid transparent; 
        border-bottom: 70px solid #4C98F7; 
        border-left: 100px solid transparent; 
        transform: rotate(35deg); 
    }
     #five-pointed-star:before { 
        content: ""; 
        position: absolute; 
        height: 0; 
        width: 0; 
        top: -45px; 
        left: -65px; 
        border-bottom: 80px solid #4C98F7; 
        border-left: 30px solid transparent; 
        border-right: 30px solid transparent; 
        transform: rotate(-35deg); 
    } 
    #five-pointed-star:after { 
        content: ""; 
        position: absolute; 
        top: 3px; 
        left: -105px; 
        width: 0px; 
        height: 0px; 
        border-right: 100px solid transparent; 
        border-bottom: 70px solid #4C98F7; 
        border-left: 100px solid transparent; 
        transform: rotate(-70deg); 
    }
</style>
```

## Message Box

```html
<section>
    <div id="message-box"></div>
</section>
<style type="text/css">
    #message-box { 
        margin: 0 20px;
        width: 120px; 
        height: 80px; 
        background: #4C98F7; 
        position: relative; 
        border-radius: 10px; 
    } 
    #message-box:before { 
        content:"";
        position: absolute; 
        right: 100%; 
        top: 26px; 
        width: 0; 
        height: 0; 
        border-top: 13px solid transparent; 
        border-right: 26px solid #4C98F7; 
        border-bottom: 13px solid transparent; 
    }
</style>
```

## Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Implementing Graphic Effects with CSS</title>
    <style type="text/css">
        section{
            margin: 10px 0;
        }

        #square{
            width: 100px;
            height: 100px;
            background: #4C98F7;
        }

        #rectangle{
            width: 200px;
            height: 100px;
            background: #4C98F7;
        }

        #circle{
            width: 100px;
            height: 100px;
            background: #4C98F7;
            border-radius: 50%;
        }

        #semicircle{
            width: 100px;
            height: 50px;
            background: #4C98F7;
            border-radius: 100px 100px 0 0;
        }

        #semicircle{
            width: 100px;
            height: 50px;
            background: #4C98F7;
            border-radius: 100px 100px 0 0;
        }

        #oval{
            width: 100px;
            height: 50px;
            background: #4C98F7;
            border-radius: 100px / 50px;
        }

        #regular-triangle{
            width: 0;
            height: 0;
            border-left: 50px solid transparent;
            border-right: 50px solid transparent;
            border-bottom: 100px solid #4C98F7;
        }

        #corner-triangle{
            width: 0;
            height: 0;
            border-top: 100px solid #4C98F7;
            border-right: 100px solid transparent;
        }

        #parallelogram{
            margin: 0 15px;
            width: 200px; 
            height: 100px; 
            transform: skew(-20deg); 
            background: #4C98F7;
        }
```

```css
#diamond {
    width: 0;
    height: 0;
    border: 100px solid transparent;
    border-bottom-color: #4C98F7;
    position: relative;
    top: -100px;
}
#diamond:after {
    content: "";
    position: absolute;
    left: -100px;
    top: 100px;
    width: 0;
    height: 0;
    border: 100px solid transparent;
    border-top-color: #4C98F7;
}

#hexagons{ 
    margin: 35px 0;
    width: 0; 
    height: 0; 
    border-left: 60px solid transparent; 
    border-right: 60px solid transparent; 
    border-bottom: 60px solid #4C98F7; 
    position: relative; 
} 
#hexagons:after { 
    width: 0; 
    height: 0; 
    border-left: 60px solid transparent; 
    border-right: 60px solid transparent; 
    border-top: 60px solid #4C98F7; 
    position: absolute; 
    content: ""; 
    top: 20px; 
    left: -60px; 
}
```

```css
#five-pointed-star {
    margin: 100px 0 70px 0;
    position: relative;
    width: 0px;
    height: 0px;
    border-right: 100px solid transparent;
    border-bottom: 70px solid #4C98F7;
    border-left: 100px solid transparent;
    transform: rotate(35deg);
}
#five-pointed-star:before {
    content: "";
    position: absolute;
    height: 0;
    width: 0;
    top: -45px;
    left: -65px;
    border-bottom: 80px solid #4C98F7;
    border-left: 30px solid transparent;
    border-right: 30px solid transparent;
    transform: rotate(-35deg);
}
#five-pointed-star:after {
    content: "";
    position: absolute;
    top: 3px;
    left: -105px;
    width: 0px;
    height: 0px;
    border-right: 100px solid transparent;
    border-bottom: 70px solid #4C98F7;
    border-left: 100px solid transparent;
    transform: rotate(-70deg);
}

#heart-shaped {
    position: relative;
    width: 100px;
    height: 90px;
}
#heart-shaped:before,
#heart-shaped:after {
    content: "";
    position: absolute;
    left: 50px;
    top: 0;
    width: 50px;
    height: 80px;
    background: #4C98F7;
    border-radius: 50px 50px 0 0;
    transform: rotate(-45deg);
    transform-origin: 0 100%;
}
#heart-shaped:after {
    left: 0;
    transform: rotate(45deg);
    transform-origin: 100% 100%;
}
```

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        #message-box { 
            margin: 0 20px;
            width: 120px; 
            height: 80px; 
            background: #4C98F7; 
            position: relative; 
            border-radius: 10px; 
        } 
        #message-box:before { 
            content:"";
            position: absolute; 
            right: 100%; 
            top: 26px; 
            width: 0; 
            height: 0; 
            border-top: 13px solid transparent; 
            border-right: 26px solid #4C98F7; 
            border-bottom: 13px solid transparent; 
        }
    </style>
</head>
<body>
    <section>
        <div id="square"></div>
    </section>
    <section>
        <div id="rectangle"></div>
    </section>
    <section>
        <div id="circle"></div>
    </section>
    <section>
        <div id="semicircle"></div>
    </section>
    <section>
        <div id="oval"></div>
    </section>
    <section>
        <div id="regular-triangle"></div>
    </section>
    <section>
        <div id="corner-triangle"></div>
    </section>
    <section>
        <div id="parallelogram"></div>
    </section>
    <section>
        <div id="diamond"></div>
    </section>
    <section>
        <div id="hexagons"></div>
    </section>
    <section>
        <div id="five-pointed-star"></div>
    </section>
    <section>
        <div id="heart-shaped"></div>
    </section>
    <section>
        <div id="message-box"></div>
    </section>
</body>
</html>
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.jianshu.com/p/f40617d863a3
https://css-tricks.com/the-shapes-of-css/
https://www.w3cplus.com/css/create-shapes-with-css
```