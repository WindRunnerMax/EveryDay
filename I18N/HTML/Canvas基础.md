# Canvas Basics
In `HTML5`, the `<canvas>` tag is introduced for drawing graphics. `<canvas>` provides a canvas for drawing graphics and serves as a graphic container. The specific graphic drawing is done by `JavaScript`.

## Example

```html
<!-- Draw bubble effect -->
<!DOCTYPE html>
<html>
<head>
    <title>Canvas</title>
</head>
<style type="text/css">
    #canvas{
        border: 1px solid #eee;
    }
</style>
<body>
    <canvas id="canvas" width="500" height="300" ></canvas>
    <!-- It is not recommended to use CSS to control the width, because if the set width and height are different from the initial ratio of 300:150, distortion may occur -->
    <!-- If the browser does not support canvas, you can directly use <canvas>Your browser does not support canvas</canvas> and the browser will render alternative content -->
</body>
<script type="text/javascript">

    class Bubble{ // ES6 added Class syntax

        constructor(ctx){ // Constructor
            this.colorList = [[254,158,159], [147,186,255], [217,153,249], [129,199,132], [255,202,98], [255,164,119]]; // Color scheme
            this.ctx = ctx.getContext("2d"); // 2D drawing
            this.circleList = []; // Bubble array
        }

        randomInt(a, b) { // Return a random number
            return Number.parseInt(Math.random() * (b - a + 1) + a);   // Get a random value between a and b, including a and b
        }

        newCircle(){ // New bubble
            if(this.randomInt(0,50)) return 0; // Control the number of bubbles generated
            var canvasHeight = this.ctx.canvas.height; // Get the canvas height
            var circle = {}; // Define a new bubble object
            circle.r = this.randomInt(10,50); // Random radius
            circle.x = this.randomInt(0, this.ctx.canvas.width); // Initialize the X coordinate of the bubble
            circle.xMoveSpeed = this.randomInt(-10,10); // X direction movement speed and direction
            circle.y = canvasHeight + circle.r; // Initialize the Y coordinate of the bubble
            circle.yMoveSpeed = this.randomInt(5,10); // Y direction movement speed
            circle.color = this.colorList[this.randomInt(0,this.colorList.length-1)]; // Get the bubble color
            this.circleList.push(circle); // Put the object into the array
        }
```

```javascript
destroyCircle() { // Destroy bubble
    this.circleList.forEach((v, i) => {
        if (v.y < -v.r) this.circleList.splice(i, 1); // Destroy bubble object if it exceeds the upper boundary
    })
}

draw() { // Draw bubble
    this.newCircle(); // Call to generate new bubble
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // Clear the canvas
    this.ctx.save(); // Save the canvas state
    this.circleList.forEach(v => {
        this.ctx.beginPath(); // Start a new path
        this.ctx.fillStyle = `rgb(${v.color[0]},${v.color[1]},${v.color[2]},0.6)`; // Set the background color
        this.ctx.strokeStyle = `rgb(${v.color[0]},${v.color[1]},${v.color[2]})`; // Set the border color
        this.ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2); // Draw a circle: x coordinate, y coordinate, radius, start angle, end angle, clockwise/counterclockwise
        this.ctx.fill(); // Fill the circle
        this.ctx.stroke(); // Draw the border
        v.y -= v.yMoveSpeed * 0.1; // Move along the Y-axis
        v.x += v.xMoveSpeed * 0.05; // Move along the X-axis
    })
    this.ctx.restore(); // Restore the canvas state
    this.destroyCircle(); // Destroy bubble
    requestAnimationFrame(() => { this.draw(); }); // Recursive call
}

start() {
    // setInterval(() => {this.draw();},16.7); // Use setInterval to draw animation effects
    requestAnimationFrame(() => { this.draw(); }); // Use requestAnimationFrame to draw images, based on the refresh rate (e.g. 60Hz, refresh every 16.7ms), requires recursive call
    // When the page is in an inactive state, the screen refresh task of the page will be paused by the system, so the requestAnimationFrame that follows the system's pace will also stop rendering. When the page is activated, the animation will continue from where it left off. setInterval needs to use visibilitychange listener to clear and reset the timer.
}

}

(function () {
    var ctx = document.getElementById("canvas"); // Get the canvas object
    var bubble = new Bubble(ctx); // Instantiate Bubble
    bubble.start(); // Start drawing
})();
</script>
</html>
```

## CANVAS and SVG

### SVG
* Resolution independent.
* Supports event handlers.
* Not suitable for gaming applications.
* `SVG` uses `XML` to describe graphics.
* Most suitable for applications with large rendering areas, such as Google Maps.
* High complexity will slow down rendering speed, and any application that excessively uses `DOM` is not fast.
* Exists as a standalone file in the form of a `.svg` extension, which can be directly imported into HTML.
* `SVG` is based on `XML`, which means that every element in the `SVG DOM` is available and can have `JavaScript` event handlers attached to it.
* In `SVG`, every drawn shape is considered an object, and if the properties of the `SVG` object change, the browser can reproduce the shape on its own.

### Canvas
* Resolution dependent.
* Weak text rendering capability.
* Does not support event handlers.
* `Canvas` is rendered pixel by pixel.
* Graphics in `Canvas` are drawn using `JavaScript`.
* Can save the resulting graphics in `.png` or `.jpg` format.
* Most suitable for image-intensive games where many objects need to be redrawn frequently.
* Once a graphic is drawn in `Canvas`, it no longer receives attention from the browser. If its position changes, the graphic needs to be redrawn, including any objects that have been covered by the graphic.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.runoob.com/tags/ref-canvas.html
https://www.runoob.com/w3cnote/html5-canvas-intro.html
```