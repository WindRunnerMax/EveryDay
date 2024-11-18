# New Features of HTML5
`HTML5` is the next generation of the `HTML` standard, it is the latest revision of `HTML`. It was completed and standardized by the World Wide Web Consortium (W3C) in October 2014. `HTML5` transforms `HTML` from a simple markup language used to construct a document into a complete application development platform. `HTML5` also includes new elements and `JavaScript APIs` for enhanced storage, multimedia, and hardware access.

## New Semantic Tags
* `<header>`: Typically includes the website logo, main navigation, site-wide links, and search box.
* `<footer>`: Defines the bottom area of the document, usually containing information about the author, copyright information, contact details, etc.
* `<nav>`: Provides navigation links within the current document or to other documents. Common examples of navigation sections are menus, directories, and indexes.
* `<section>`: Defines a section within a document, representing a distinct part of the `HTML` document.
* `<article>`: Focuses on a single topic, such as a blog post, newspaper article, or web page article.
* `<aside>`: Represents a portion of the document that is indirectly related to the main content of the document, often displayed as a sidebar.
* `<details>`: Describes details about a document or a section of a document.
* `<summary>`: Specifies a summary, heading, or caption for the `<details>` element's disclosure box.
* `<dialog>`: Represents a dialog or other interactive component, such as a dialog box or subwindow.
* `<figure>`: Represents independent content that may have an optional caption, which is specified using the `<figcaption>` element.
* `<figcaption>`: Represents a caption or legend that describes the rest of the content within its parent `<figure>` element.
* `<main>`: The main content area consists of content that is directly related or expands upon the central theme or primary functionality of the document or application.
* `<mark>`: Represents text that is marked or highlighted for reference or annotation purposes.
* `<time>`: Represents a specific time.
* `<data>`: Represents a specific date.
* `<hgroup>`: Represents a multi-level heading of a section of a document, grouping a set of `<h1>` to `<h6>` elements.
* `<bdi>`: Allows setting a span of text that is isolated from its parent element's text directionality.
* `<command>`: Defines a command button, such as a radio button, checkbox, or button.
* `<progress>`: Defines the progress of any type of task.
* `<ruby>`: Defines ruby annotations (Chinese phonetic annotations or characters).
* `<rt>`: Defines the explanation or pronunciation of characters (Chinese phonetic annotations or characters).
* `<rp>`: Used in ruby annotations to provide fallback content for browsers that do not support the `<ruby>` element.
* `<wbr>`: Specifies where in the text it would be appropriate to add a line break.
* `<meter>`: Defines a measurement, used for measurements with known minimum and maximum values.

## Form Enhancements
### Input Types
* `week`: Selects a week and year.
* `search`: Used for a search field.
* `time`: Selects a time.
* `month`: Selects a month.
* `url`: Input field for a `url` address.
* `color`: Primarily used for selecting colors.
* `tel`: Defines input for telephone numbers and fields.
* `email`: Input field containing an `e-mail` address.
* `range`: Input field for a numeric value within a range.
* `datetime`: Selects a date and time in `UTC` format.
* `date`: Selects a date from a date picker.
* `datetime-local`: Selects a date and time without a time zone.
* `number`: Input field for numeric values, with control over the range using the `max` and `min` attributes.

### Form Elements
* `<datalist>`: Defines a list of options for an `input` element.
* `<keygen>`: Specifies a key pair generator field for forms.
* `<output>`: Defines different types of output, such as the result of a calculation or script.

### Form Attributes
* `autocomplete`: Specifies whether a form or input field should have autocomplete enabled. Used on `<form>`.
* `novalidate`: Specifies that a form or input field should not be validated when submitted. Used on `<form>`.
* `autofocus`: Specifies that a field should automatically get focus when the page loads. Used on `<input>`.
* `form`: Specifies one or more forms that an input field belongs to. Used on `<input>`.
* `placeholder`: Specifies the default text displayed in an input field. Used on `<input>`.
* `formaction`: Specifies the URL where the form data should be submitted. Used on `<input>`.
* `formenctype`: Specifies the encoding type of the form data when submitted to the server. Used on `<input>`.
* `formmethod`: Specifies the method used to submit the form. Used on `<input>`.
* `novalidate`: Specifies that an `<input>` element should not be validated when the form is submitted. Used on `<input>`.
* `formtarget`: Specifies where to display the response after submitting the form. Used on `<input>`.
* `height`, `width`: Specifies the height and width of an image input field. Used on `<input>`.
* `list`: Specifies a datalist for an input field. A datalist is a list of options for an input field. Used on `<input>`.
* `min`, `max`: Specifies the minimum and maximum values for an input field of type number or date. Used on `<input>`.
* `multiple`: Specifies that multiple values can be selected in an `<input>` element. Used on `<input>` of type email or file.
* `pattern`: Specifies a regular expression used to validate the value of an `<input>` element. Used on `<input>`.
* `placeholder`: Provides a hint that describes the expected value of an input field. The hint is displayed in the input field before the user enters a value. Used on `<input>`.
* `required`: Specifies that an input field must be filled out before submitting the form. Used on `<input>`.
* `step`: Specifies the legal number intervals for an input field. Used on `<input>`.

## Multimedia Support

### Multimedia Tags
* `<audio>`: Defines audio content.
* `<video>`: Defines video content.
* `<source>`: Defines the path to multimedia resources.
* `<embed>`: Defines embedded content, such as plugins.
* `<track>`: Defines subtitles or other text tracks.

### Examples

```html
<audio controls>
  <source src="horse.ogg" type="audio/ogg">
  <source src="horse.mp3" type="audio/mpeg">
</audio>

<video width="320" height="240" controls>
    <source src="movie.mp4" type="video/mp4">
    <source src="movie.ogg" type="video/ogg">
</video>
```

## Canvas Drawing
In HTML5, the `<canvas>` tag is introduced for drawing graphics. The `<canvas>` provides a canvas for drawing graphics, and the actual drawing is done using JavaScript.

### Example

```html
<canvas id="canvas" width="500" height="300" ></canvas>
<script type="text/javascript">
    var canvas=document.getElementById('canvas');
    var ctx=canvas.getContext('2d');
    ctx.fillStyle = "rgb(146, 186, 255, 0.6)";
    this.ctx.strokeStyle = "rgb(146, 186, 255)";
    ctx.arc(100,100,30,0,Math.PI * 2);
    ctx.fill();
    ctx.stroke();
</script>
```

## Inline SVG
HTML5 supports inline SVG. SVG (Scalable Vector Graphics) is a vector graphics format based on XML, used to describe two-dimensional vector graphics. SVG strictly adheres to XML syntax and uses a descriptive language in text format to describe image content. Therefore, it is a resolution-independent vector graphics format. SVG became a W3C recommended standard in 2003.

### Example

```xml
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <circle cx="200" cy="40" r="40" stroke="#FFB800" stroke-width="1" fill="#FF5722" />
  <rect width="200" height="80" y="80" x="100" style="fill:#4C98F7;stroke-width:1;stroke:#FFF;"/>
</svg>
```

## MathML
HTML5 allows the use of MathML elements in documents. The corresponding tag is `<math>`. MathML is a mathematical markup language, which is an XML-based standard used to write mathematical symbols and formulas on the Internet.

### Example

```xml
<math xmlns="http://www.w3.org/1998/Math/MathML">
    <mrow>
        <msup><mi>a</mi><mn>2</mn></msup>
        <mo>+</mo>
        <msup><mi>b</mi><mn>2</mn></msup>
        <mo>=</mo>
        <msup><mi>c</mi><mn>2</mn></msup>
    </mrow>
</math>
```

## Drag and Drop API
Drag and drop is a common feature where an object is grabbed and moved to another location. In HTML5, drag and drop is part of the standard, and any element can be dragged and dropped.

### Example
```html
<div draggable="true" ondragstart="drag(event)">Drag</div>
<script type="text/javascript">
    function drag(e){
        console.log(e);
    }
</script>
```

### Events
* `ondrag`: Triggered when an element or selected text is being dragged.
* `ondragend`: Triggered when a drag operation is completed, such as releasing the mouse button or pressing the `Esc` key.
* `ondragenter`: Triggered when an element or selected text is dragged onto a droppable target.
* `ondragexit`: Triggered when an element is no longer the target of a drag operation.
* `ondragleave`: Triggered when an element or selected text is dragged out of a droppable target.
* `ondragover`: Triggered when an element or selected text is dragged over a droppable target, every `100` milliseconds.
* `ondragstart`: Triggered when a user starts dragging an element or selected text.
* `ondrop`: Triggered when an element or selected text is dropped onto a droppable target.

## Geolocation
The `HTML5 Geolocation API` is used to obtain the user's geographical location. Obtaining location information requires the user's consent.

### Example
```javascript
window.navigator.geolocation.getCurrentPosition(
    function(pos){
      console.log('Timestamp:',pos.timestamp);
      console.log('Longitude:',pos.coords.longitude);
      console.log('Latitude:',pos.coords.latitude);
      console.log('Altitude:',pos.coords.altitude);
      console.log('Speed:',pos.coords.speed);
    },
    function(err){ 
         console.log(err);
    }
)
```

## Web Worker
`Web Workers` allow JavaScript computations to be delegated to background threads, preventing them from slowing down interactive events.

### Example

```javascript
var worker = new Worker('worker.js');

/*
  Data transfer between workers and the main thread is done through a messaging mechanism - both sides use the postMessage() method to send their respective messages,
  and use the onmessage event handler to respond to messages (the message is contained in the data property of the Message event),
  during this process, the data is not shared but copied.
 */
```

## Web Storage
With `HTML5`, it is possible to store user browsing data locally. `localStorage` and `sessionStorage` are solutions provided by `HTML5` for web storage.

```javascript
// Store data
localStorage.setItem('key', 'value');
sessionStorage.setItem('key', 'value');

// Retrieve data
localStorage.getItem('key');
sessionStorage.getItem('key');

// Remove data
localStorage.removeItem('key');
sessionStorage.removeItem('key');

// Clear data
localStorage.clear();
sessionStorage.clear();
```

## WebSocket
`WebSocket` is a protocol introduced in `HTML5` that allows full-duplex communication over a single `TCP` connection. `WebSocket` makes data exchange between the client and the server simpler, allowing the server to actively push data to the client. In the `WebSocket API`, the browser and the server only need to perform a handshake once, and they can directly establish a persistent connection for bidirectional data transmission. In the `WebSocket API`, the browser and the server only need to perform a handshake, and then a fast channel is established between them, enabling direct data transfer.

* The handshake phase uses the `HTTP` protocol, and the additional header information in a regular `HTTP` message includes the `Upgrade: WebSocket` header, indicating that this is an `HTTP` request for protocol upgrade.
* It is built on top of the `TCP` protocol and belongs to the application layer, just like the `HTTP` protocol.
* It can send both text and binary data.
* The data format is lightweight, with low performance overhead and efficient communication.
* There are no same-origin restrictions, allowing the client to communicate with any server.
* The protocol identifier is `ws`, and if it is encrypted, it becomes `wss`.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.runoob.com/html/html5-intro.html
https://www.cnblogs.com/vicky1018/p/7705223.html
https://www.cnblogs.com/binguo666/p/10928907.html
https://blog.csdn.net/gane_cheng/article/details/52819118
https://developer.mozilla.org/zh-CN/docs/Web/Guide/HTML/HTML5
```