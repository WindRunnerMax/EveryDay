# SVG Basics
`SVG` (Scalable Vector Graphics) is a graphics format based on the Extensible Markup Language (XML) that is used to describe two-dimensional vector graphics. `SVG` strictly adheres to the XML syntax and uses a descriptive language in text format to describe the content of the image. Therefore, it is a resolution-independent vector graphics format. `SVG` became a recommended standard by the W3C in 2003.

## Example

```xml
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <circle cx="200" cy="40" r="40" stroke="#FFB800" stroke-width="1" fill="#FF5722" />
  <rect width="200" height="80" y="80" x="100" style="fill:#4C98F7;stroke-width:1;stroke:#FFF;"/>
</svg>
```

The first line contains the XML declaration. The `standalone` attribute specifies whether the SVG file is standalone or contains references to external files. `standalone="no"` means that the SVG document will reference an external file, in this case, the DTD file.

The second and third lines reference the external SVG DTD (Document Type Definition). The DTD is located at `http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd` and contains all the allowed SVG elements.

The SVG code starts with the `<svg>` element, which includes the opening tag `<svg>` and the closing tag `</svg>`. This is the root element and can be used to set the width and height of the SVG document using the `width` and `height` attributes. The `version` attribute defines the SVG version being used, and the `xmlns` attribute defines the SVG namespace.

The `<svg>` element contains a `<circle>` element, which is used to create a circle. The `cx` and `cy` attributes define the x and y coordinates of the center of the circle. If these attributes are omitted, the center of the circle will be set to (0, 0). The `r` attribute defines the radius of the circle. The `stroke` and `stroke-width` attributes control the color and width of the shape's outline, and the `fill` attribute sets the color inside the shape.

The `<svg>` element also contains a `<rect>` element, which is used to create a rectangle. The `x` and `y` attributes define the distance from the left and top borders, respectively. The `width` and `height` attributes define the width and height of the rectangle. The `style` attribute can be used to directly declare the style properties. The `stroke` and `stroke-width` attributes control the color and width of the shape's outline, and the `fill` attribute sets the color inside the shape.

Note that, since SVG strictly adheres to the XML syntax, all opening tags must have closing tags.

## Common Tags
`<rect>` (rectangle), `<circle>` (circle), `<ellipse>` (ellipse), `<line>` (line), `<polyline>` (polyline), `<polygon>` (polygon), `<path>` (path), `<text>` (text), `<defs>` (definitions), `<filter>` (filter), `<feGaussianBlur>` (blur), `<mask>` (mask), `<feOffset>` (shadow offset), `<linearGradient>` (linear gradient), `<radialGradient>` (radial gradient), `<animate>` (animation), and so on.

## Features

### Scalability
Users can scale the image display without compromising its clarity and details.

### Independent Text
Text in SVG images is independent of the image itself, allowing the text to remain editable and searchable. There are also no font restrictions, so users will see the same image even if they don't have a specific font installed on their system.

### Smaller File Size
In general, SVG files are much smaller than GIF and JPEG files, resulting in faster downloads.

### High Display Quality
SVG images always appear sharp on screens, and their clarity is suitable for any screen resolution and print resolution.

### Super Color Control
`SVG` images provide a palette of 16 million colors, supporting the ICC color profile standard, RGB, linear fills, gradients, and masks.

### Browser Support
Modern browsers support `svg`, while earlier versions like IE8 and below require the installation of plugins.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.runoob.com/svg/svg-reference.html
https://www.nowcoder.com/ta/review-frontend/review?tpId=80&tqId=29691&query=&asc=true&order=&page=14
```