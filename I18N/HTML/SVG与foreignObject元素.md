# SVG and foreignObject elements
Scalable Vector Graphics (SVG) is based on the XML markup language and is used to describe two-dimensional vector graphics. As an open web standard based on text, SVG can elegantly and concisely render graphics of different sizes and seamlessly integrate with other web standards such as CSS, DOM, and JavaScript. SVG images and their related behaviors are defined in XML text files, which means they can be searched, indexed, scripted, and compressed. Additionally, this also means that SVG can be created and edited using any text editor and drawing software.

## SVG
SVG stands for Scalable Vector Graphics, which is a standard XML-based markup language for describing two-dimensional vector graphics. Unlike pixel-based image formats such as JPEG and PNG, SVG uses mathematical equations and geometric descriptions to define images. This allows for lossless scaling and resizing without distortion or blurring. SVG images consist of basic shapes (such as lines, curves, rectangles, circles, etc.) and paths, and can also include elements such as text, gradients, patterns, and image clipping. SVG graphics can be manually created using a text editor or generated using professional vector graphics editing software. They can be directly embedded in web pages and controlled and interacted with using CSS stylesheets and JavaScript. Because SVG graphics are vector-based, they do not lose clarity when zoomed in or out, making SVG very useful in responsive design, icons, maps, data visualization, and animation. Additionally, SVG is compatible with various browsers and can seamlessly integrate with other web technologies.

SVG has many advantages and a universal standard, but it also has some limitations. Here, we mainly discuss the limitations of the text element in SVG. The text element in SVG provides basic text rendering capabilities and can draw single or multiple lines of text at specified positions. However, SVG does not provide powerful layout features like HTML and CSS, such as automatic text wrapping and alignment. This means that complex text layouts in SVG require manual calculation and adjustment of positions. Additionally, the text element in SVG supports some basic text style properties such as font size, color, and font weight. However, compared to the rich style options provided by CSS, SVG's text styles are relatively limited. For example, it cannot directly set text shadows or letter spacing effects.

In practice, we don't need to pay attention to these issues in our daily use. However, in some SVG-based visualization editors, such as DrawIO, these issues need to be taken seriously. Of course, nowadays, visual editing may choose to use Canvas to implement more, but the complexity of Canvas is beyond the scope of this article. So, the biggest problem with using text to draw text in daily use is actually text wrapping. If you only manually draw SVG in your daily life, there may not be any problems. The text element also provides a lot of properties to display text. However, it may be a bit troublesome to create a universal solution. For example, if I want to generate a batch of SVGs, it is not feasible to manually adjust the text separately. Of course, in this example, we can still calculate the width of the text in batches to control the line breaks, but what we hope for is a universal ability to solve this problem. Let's first look at an example of text overflow without automatic line wrapping:

```
-----------------------------------
| This is a long text that cannot | automatically wrap
|                                 |
|                                 |
-----------------------------------
```

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
  <g>
    <rect width="200" height="100" fill="lightgray" />
    <text x="10" y="20" font-size="12" fill="black">
      This is a long text that cannot automatically wrap within the rectangle.
    </text>
  </g>
</svg>
```

In this example, the `text` element cannot automatically wrap, even if the `width` property is added to the `text` element. In addition, the `<text>` tag cannot be directly placed inside the `<rect>` tag. It has strict nesting rules. The `<text>` tag is an independent element used to draw text on the SVG canvas, while the `<rect>` tag is used to draw rectangles. Therefore, the drawn rectangle does not limit the display range of the text. However, in reality, the length of this text exceeds the `width: 300` set for the entire SVG element, which means that this text cannot be fully displayed. From the figure, it can also be seen that the text after `wrap` is gone, and it does not automatically wrap. If you want to achieve a line break effect, you must manually calculate the length and height of the text to determine the position:

```
-----------------------------------
| This is a long text that        |
| cannot automatically wrap       |
| within the rectangle.           |
-----------------------------------
```

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
  <g>
    <rect width="200" height="100" fill="lightgray" />
    <text x="10" y="20" font-size="12" fill="black">
      <tspan x="10" dy="1.2em">This is a long text that</tspan>
      <tspan x="10" dy="1.2em">cannot automatically wrap </tspan>
      <tspan x="10" dy="1.2em">within the rectangle.</tspan>
    </text>
  </g>
</svg>
```

## foreignObject element
So, if you want to achieve a text drawing experience similar to HTML at a relatively low cost, you can use the `foreignObject` element. The `<foreignObject>` element allows embedding HTML, XML, or other non-SVG namespace content in an SVG document. In other words, we can directly embed HTML in SVG and use the capabilities of HTML to display our elements. For example, in the above example, we can transform it into the following form:


```
-----------------------------------
| This is a long text that        |
| will automatically wrap         |
| within the rectangle.           |
-----------------------------------
```

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
  <g>
    <rect width="200" height="100" fill="lightgray" />
    <foreignObject x="10" width="180" height="80">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <p>This is a long text that will automatically wrap within the rectangle.</p>
      </div>
    </foreignObject>
  </g>
</svg>
```

When we open DrawIO to draw flowcharts, we can actually find that it uses the `<foreignObject>` element to draw text. Of course, DrawIO has made a lot of compatibility processing for more general scenarios, especially in terms of inline styles. Similar to the example above, the SVG displayed in DrawIO is as follows. It is important to note that the current file exported directly from DrawIO needs to be saved as an `.html` file instead of an `.svg` file because it does not declare a namespace. If you need to save it as an `.svg` file and display it correctly, you need to add the namespace declaration `xmlns="http://www.w3.org/2000/svg"` to the `svg` element. However, adding only this declaration is not enough. If you open the `.svg` file and find that only the rectangle is displayed without the text content, you also need to add the namespace declaration `xmlns="http://www.w3.org/1999/xhtml"` to the first `<div>` element of the `<foreignObject>` element. At this time, the rectangle and text can be displayed completely.


```
-----------------------------------------------------
| This is a long text that will automatically wrap  | 
|               within the rectangle.               |
-----------------------------------------------------
```

```xml
<svg
  xmlns:xlink="http://www.w3.org/1999/xlink"
  version="1.1"
  width="263px"
  height="103px"
  viewBox="-0.5 -0.5 263 103"
>
  <defs></defs>
  <g>
    <rect
      x="1"
      y="1"
      width="260"
      height="100"
      fill="#ffffff"
      stroke="#000000"
      pointer-events="all"
    ></rect>
    <g transform="translate(-0.5 -0.5)">
      <switch>
        <foreignObject
          style="overflow: visible; text-align: left;"
          pointer-events="none"
          width="100%"
          height="100%"
          requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
        >
          <div style="display: flex; align-items: unsafe center; justify-content: unsafe center; width: 258px; height: 1px; padding-top: 51px; margin-left: 2px;">
            <div style="box-sizing: border-box; font-size: 0; text-align: center; ">
              <div style="display: inline-block; font-size: 12px; font-family: Helvetica; color: #000000; line-height: 1.2; pointer-events: all; white-space: normal; word-wrap: normal; ">
                <div>
                  <span>
                    This is a long text that will automatically wrap within the rectangle.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </foreignObject>
        <text
          x="131"
          y="55"
          fill="#000000"
          font-family="Helvetica"
          font-size="12px"
          text-anchor="middle"
        >
          This is a long text that will automatically...
        </text>
      </switch>
    </g>
  </g>
  <switch>
    <g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"></g>
    <a
      transform="translate(0,-5)"
      xlink:href="https://desk.draw.io/support/solutions/articles/16000042487"
      target="_blank"
    >
      <text text-anchor="middle" font-size="10px" x="50%" y="100%">
        Viewer does not support full SVG 1.1
      </text>
    </a>
  </switch>
</svg>
```

Everything seems perfect. We can use `SVG` to draw vector graphics and leverage the capabilities of `HTML` to fulfill complex requirements. However, things always have two sides. While we enjoy convenience in one aspect, it may bring unexpected troubles in another. Let's imagine a scenario where we need to generate an `SVG` on the backend and convert it to a `PNG` image for user download. It is not practical to perform batch operations on the frontend. Furthermore, if we need to render the `SVG` and insert it into a `Word` or `Excel` document, it requires us to fully draw the entire image on the backend. In such cases, we might consider using `node-canvas` to create and manipulate graphics on the backend. However, when we actually use `node-canvas` to draw our `SVG` graphics, as in the example of `DrawIO` mentioned above, we find that all the shapes can be drawn, but all the text is lost. Since `node-canvas` cannot achieve the desired result, we might think of using `sharp` for image processing, such as converting `SVG` to `PNG`. Unfortunately, `sharp` also cannot accomplish this, and the final result is the same as `node-canvas`.

```
https://github.com/lovell/sharp/issues/3668
https://github.com/Automattic/node-canvas/issues/1325
```

Given that the requirement is there and the business strongly needs this functionality, how can we implement it? In fact, the solution to this problem is quite simple. Since the `SVG` can only be rendered in a browser, we can simply run a `Headless Chromium` on the backend. In this case, we can leverage `Puppeteer`, which allows us to simulate user behavior in the browser programmatically, enabling tasks such as taking screenshots, generating PDFs, performing automated testing, and scraping data. With `Puppeteer`, our task becomes much simpler. The main challenge lies in configuring the environment. `Chromium` has specific environment requirements. For example, the latest version of `Chromium` in the Debian series requires `Debian 10` or above, and dependencies need to be installed. You can use the command `ldd xxxx/chrome | grep no` to check for missing dynamic link libraries. If you encounter installation issues, you can retry with `node node_modules/puppeteer/install.js`. Additionally, there may be font-related issues because text rendering is done on the backend, so the server itself needs to have certain Chinese fonts installed, such as Source `fonts-noto-cjk` and Chinese language packs like `language-pack-zh*`, etc.

Once we have set up the environment, the next step is to render the `SVG` and convert it to a `Buffer`. This task is relatively simple. We just need to render the `SVG` in our `Headless Chromium` and take a screenshot of the `Viewport`. `Puppeteer` provides a simple API with many methods. Here is an example. Moreover, `Puppeteer` has many other capabilities, such as exporting to `PDF`, but we won't go into detail here.

```js
const puppeteer = require('puppeteer');
// Actually, you can maintain a single instance of the `browser` object
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
// You can also maintain a single instance of the `page` object
const page = await browser.newPage();
// If there is a specific width and height for the viewport, you can directly set it
// Otherwise, you can first draw the `SVG` to get the width and height of the viewport, and then set the size of the viewport
await page.setViewport({
  width: 1000,
  height: 1000,
  deviceScaleFactor: 3, // If not set, it will cause the screenshot to be blurry
});
await page.setContent(svg);
const element = await page.$('svg');
let buffer: Buffer | null = null;
if(element){
  const box = await element.boundingBox();
  if(box){
    buffer = await page.screenshot({
      clip: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      },
      type: 'png',
      omitBackground: true,
    });
  }
}
await page.close();
await browser.close();
return buffer;
```

## DOM TO IMAGE
Let's think about it, the `foreignObject` element seems to be a very magical design. With the `foreignObject` element, we can draw `HTML` into an `SVG`. So, do we have a very magical idea? If we need to draw the `DOM` in the browser and achieve a screenshot-like effect, can we use the `foreignObject` element to achieve it? This is certainly feasible, and it is a very interesting thing. We can draw `DOM + CSS` into an `SVG`, then convert it to a `DATA URL`, and finally draw it using `canvas`. In the end, we can generate and export the image of the `DOM`.

Below is an implementation of this capability. Of course, the implementation here is relatively simple. The main part is to `clone` the `DOM` and inline all the styles to generate a complete `SVG` image. In fact, there are many things to consider, such as generating pseudo-elements, declaring `@font-face` fonts, converting `BASE64` encoded content, converting `img` elements to `CSS background` properties, and so on. To implement the entire functionality more completely, you need to consider many cases. Here, we will not go into the specific implementation, but you can refer to `dom-to-image-more`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DOM IMAGE</title>
    <style>
      #root {
        width: 300px;
        border: 1px solid #eee;
      }
```

```html
<style>
      .list > .list-item {
        display: flex;
        background-color: #aaa;
        color: #fff;
        align-items: center;
        justify-content: space-between;
      }
    </style>
  </head>
  <body>
    <!-- #root START -->
    <!-- `DOM` content -->
    <div id="root">
      <h1>Title</h1>
      <hr />
      <div>Content</div>
      <div class="list">
        <div class="list-item">
          <span>label</span>
          <span>value</span>
        </div>
        <div class="list-item">
          <span>label</span>
          <span>value</span>
        </div>
      </div>
    </div>
    <!-- #root END -->
    <button onclick="onDOMToImage()">Download</button>
  </body>
  <script>
    const cloneCSS = (target, origin) => {
      const style = window.getComputedStyle(origin);
      // Generate all style rules
      const cssText = Array.from(style).reduce((acc, key) => {
        return `${acc}${key}:${style.getPropertyValue(key)};`;
      }, "");
      target.style.cssText = cssText;
    };

    const cloneDOM = (origin) => {
      const target = origin.cloneNode(true);
      const targetNodes = target.querySelectorAll("*");
      const originNodes = origin.querySelectorAll("*");
      // Copy root node styles
      cloneCSS(target, origin);
      // Copy styles of all nodes
      Array.from(targetNodes).forEach((node, index) => {
        cloneCSS(node, originNodes[index]);
      });
      // Remove element margins
      target.style.margin =
        target.style.marginLeft =
        target.style.marginTop =
        target.style.marginBottom =
        target.style.marginRight =
          "";
      return target;
    };
```

```javascript
const buildSVGUrl = (node, width, height) => {
  const xml = new XMLSerializer().serializeToString(node);
  const data = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                <foreignObject width="100%" height="100%">
                    ${xml}
                </foreignObject>
            </svg>
        `;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data);
};

const onDOMToImage = () => {
  const origin = document.getElementById("root");
  const { width, height } = root.getBoundingClientRect();
  const target = cloneDOM(origin);
  const data = buildSVGUrl(target, width, height);
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = data;
  image.onload = () => {
    const canvas = document.createElement("canvas");
    // The higher the value, the higher the pixel density
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.drawImage(image, 0, 0);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "image.png";
    a.click();
  };
};
</script>
</html>
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
- [drawio](https://github.com/jgraph/drawio)
- [domvas](https://github.com/pbakaus/domvas)
- [puppeteer](https://github.com/puppeteer/puppeteer)
- [dom-to-image-more](https://www.npmjs.com/package/dom-to-image-more)
- [SVG on MDN](https://developer.mozilla.org/zh-CN/docs/Web/SVG)
- [Debian Installation of Puppeteer](https://zzerd.com/blog/2021/04/10/linux/debian_install_puppeteer)
- [foreignObject on MDN](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element/foreignObject)
- [Namespaces Crash Course on MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course)
```