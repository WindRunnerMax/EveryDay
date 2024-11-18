# Understanding JSX in React
`JSX` is a syntax for quickly generating `react` elements. It is actually a syntax sugar for `React.createElement(component, props, ...children)`. At the same time, `JSX` is a syntax extension of `Js`, containing all `Js` functionalities.

## Description

### Evolution of JSX
Previously, `Facebook` was a big player in `PHP`, so the initial inspiration for `React` came from `PHP`.  
In `2004`, everyone was still using string concatenation in `PHP` to develop websites.

```php
$str = "<ul>";
foreach ($talks as $talk) {
  $str += "<li>" . $talk->name . "</li>";
}
$str += "</ul>";
```

This way of writing code is not only unappealing but also prone to security issues such as `XSS`. The method of dealing with this is to escape any user input, but if the string is escaped multiple times, the number of unescaping must also be the same, otherwise the original content will not be obtained. If HTML tags are accidentally escaped, the HTML tags will be directly displayed to the user, resulting in a poor user experience.  
By `2010`, in order to code more efficiently and avoid errors in escaping HTML tags, `Facebook` developed `XHP`. `XHP` is a syntax extension for `PHP` that allows developers to use `HTML` tags directly in `PHP` instead of using strings.

```php
$content = <ul />;
foreach ($talks as $talk) {
  $content->appendChild(<li>{$talk->name}</li>);
}
```

This way, all HTML tags use a syntax different from PHP, making it easy to distinguish which need to be escaped and which do not. Shortly afterward, `Facebook` engineers discovered that they could create custom tags, and by combining these custom tags, it was helpful in building large applications.  
By `2013`, frontend engineer `Jordan Walke` proposed a bold idea to his manager: to migrate the extension features of `XHP` to `Js`. The primary task was to have an extension that allowed `Js` to support `XML` syntax, and this extension is called `JSX`. Since at the time `Node.js` was already well established at `Facebook`, the implementation of `JSX` was achieved quickly.

```jsx
const content = (
  <TalkList>
    {talks.map(talk => <Talk talk={talk} />)}
  </TalkList>
);
```

### Why Use JSX
`React` believes that the rendering logic is essentially coupled with other `UI` logics, such as the need to bind event handling in the `UI`, notify the `UI` when the state changes at certain moments, and display prepared data in the `UI`.  
`React` does not advocate for the artificial separation of markup and logic into different files. Instead, it achieves separation of concerns by storing both in loosely coupled units called components.  
`React` does not force the use of `JSX`, but most people find that visually placing `JSX` and `UI` together in `JavaScript` code has an auxiliary effect, and it also allows `React` to display more useful errors and warnings.  
In simple terms, `JSX` can effectively describe the structure of the `html` page, make it convenient to write `html` code in `Js`, and have all the functionalities of `Js`.

### Advantages
The advantages of `JSX` mainly manifest in the following three points:
* Fast: `JSX` executes faster because it is optimized after being compiled to `JavaScript` code.
* Secure: Compared to `JavaScript`, `JSX` is statically typed and mostly type-safe. When developing with `JSX`, the quality of the application will be higher because many errors will be discovered during the compilation process. It also provides compiler-level debugging functionality.
* Simple: The syntax is concise and easy to get started with.

## JSX Examples

### Rule Definition
`JSX` defines some rules and usage:
* `JSX` can only have one root element. `JSX` tags must be closed, and if there is no content, it can be written in a self-closing form such as `<div />`.
* `Js` expressions can be embedded in `JSX` using `{}`.
* `JSX` will be translated by `babel` into a function call of `React.createElement`, which will create a `Js` object describing the `HTML` information.
* The child element in `JSX` can be a string literal.
* The child element in `JSX` can be a `JSX` element.
* The child element in `JSX` can be a group of elements stored in an array.
* The child element in `JSX` can be a `Js` expression and can be mixed with other types of child elements, and can be used to display lists of arbitrary lengths.
* The child element in `JSX` can be a function and function call.
* If the child element in `JSX` is `boolean/null/undefined`, it will be ignored. If using the `&&` operator, ensure that the preceding value is a boolean. If it is `0/1`, it will be rendered.
* When defining `React` components in object properties, the dot syntax of the `object` can be used to reference the component.
* `React` elements will be translated into a call to the `React.createElement` function, with the component as a parameter, so `React` and the component must be in scope.
* `React` elements need to start with a capital letter, or assign the element to a variable starting with a capital letter, as lowercase letters will be considered as `HTML` tags.
* Expressions cannot be used as `React` element types; they need to be assigned to a variable starting with a capital letter and then used as a component.

### The Use of JSX

In the example, we declare a variable called `name` and then use it in `JSX`, wrapping it in curly braces. In `JSX` syntax, you can place any valid `JavaScript` expression within the curly braces. For example, `2 + 2`, `user.firstName`, or `formatName(user)` are all valid `JavaScript` expressions.

```jsx
const name = "Josh Perez";
const element = <h1>Hello, {name}</h1>;

ReactDOM.render(
  element,
  document.getElementById("root")
);
```

Similarly, `JSX` is also an expression. `JSX` is naturally meant to be compiled before use. After compilation, `JSX` expressions are transformed into regular `JavaScript` function calls, resulting in `JavaScript` objects when evaluated. This means that you can use `JSX` within `if` statements and `for` loops, assign `JSX` to variables, pass `JSX` as parameters, and return `JSX` from functions.

```jsx
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}
```

Typically, you can specify attribute values as string literals using quotes. You can also use curly braces to insert a `JavaScript` expression into an attribute value. When embedding a `JavaScript` expression in an attribute, do not include quotes outside the curly braces. Because `JSX` syntax is closer to `JavaScript` than to `HTML`, `React DOM` uses `camelCase` naming convention to define attribute names, as opposed to the naming convention used for `HTML` attributes. For example, `class` in `JSX` becomes `className`, and `tabindex` becomes `tabIndex`.

```jsx
const element1 = <div tabIndex="0"></div>;
const element2 = <img src={user.avatarUrl}></img>;
```

In `JSX`, you can also use `</>` to close tags, and you can directly define many child elements.

```jsx
const element1 = <img src={user.avatarUrl} />;
const element2 = (
  <div>
    <h1>Hello!</h1>
    <h2>Good to see you here.</h2>
  </div>
);
```

You can safely insert user input into `JSX`. By default, `React DOM` escapes all input before rendering, ensuring that content that is not explicitly written is never injected into your application. All content is converted to strings before rendering, effectively preventing `XSS` cross-site scripting attacks.

```jsx
const title = response.potentiallyMaliciousInput;
// Safe to use directly
const element = <h1>{title}</h1>;
```

In reality, `Babel` transpiles `JSX` into a function call named `React.createElement()`. Elements defined using `React.createElement()` are equivalent to elements generated using `JSX`, making `JSX` inherently compilable.

```jsx
const element1 = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);
// Equivalent to
const element2 = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
```

`React.createElement()` carries out preliminary checks to help you write error-free code, but essentially, it creates objects. These objects are called `React elements`, which describe the content you want to see on the screen. `React` reads these objects, uses them to build the `DOM`, and keeps them updated as necessary.

```jsx
// Note: This is a simplified structure
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
};
```

Actually, this is a node in the virtual `DOM`. `Virtual DOM` is a programming concept where the UI is kept in an idealized or virtual form in memory, and it is synchronized with the real DOM through libraries like `ReactDOM`, in a process called reconciliation. This approach gives `React` a declarative API, where you tell `React` what state you want the UI to be in, and `React` ensures that the DOM matches that state. This liberates you from necessary operations such as attribute manipulation, event handling, and manual DOM updates when building applications.

Rather than considering `Virtual DOM` as a technology, it's more of a pattern, and people often express different things when referring to it. In the `React` world, the term `Virtual DOM` is usually associated with `React` elements because they both represent objects of the user interface. `React` also uses an internal object called `fibers` to store additional information about the component tree, and these two are also considered part of the `Virtual DOM` implementation in `React`. `Virtual DOM` also lays the foundation for using the `diff` algorithm.

```html
<div class="root" name="root">
    <p>1</p>
    <div>11</div>
</div>
```

```javascript
// Use JavaScript objects to describe the above node and document
{
    type: "tag",
    tagName: "div",
    attr: {
        className: "root",
        name: "root"
    },
    parent: null,
    children: [{
        type: "tag",
        tagName: "p",
        attr: {},
        parent: {} /* Reference to the parent node */, 
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* Reference to the parent node */, 
            content: "1"
        }]
    },{
        type: "tag",
        tagName: "div",
        attr: {},
        parent: {} /* Reference to the parent node */, 
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* Reference to the parent node */, 
            content: "11"
        }]
    }]
}
```

### Example

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <title>JSX Example</title>
</head>

<body>
  <div id="root"></div>
</body>
<script src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel">

  class Clock extends React.Component {
    constructor(props) {
      super(props);
      this.state = { date: new Date() };
    }
    componentDidMount() {
      this.timer = setInterval(() => this.tick(), 1000);
    }
    componentWillUnmount() {
      clearInterval(this.timer);
    }
    tick() {
      this.setState({ date: new Date() });
    }
    render() {
      return (
        <div>
          <h1>{this.props.tips}</h1>
          <h2>Now: {this.state.date.toLocaleTimeString()}</h2>
        </div>
      );
    }
  }
```

```javascript
class App extends React.Component{
  constructor(props){
    super(props);
    this.state = { 
      showClock: true,
      tips: "Hello World!"
    }
  }
  updateTips() {
    this.setState((state, props) => ({
      tips: "React update"
    }));
  }
  changeDisplayClock() {
    this.setState((state, props) => ({
      showClock: !this.state.showClock
    }));
  }
  render() {
    return (
      <div>
        {this.state.showClock && <Clock tips={this.state.tips} />}
        <button onClick={() => this.updateTips()}>Update Tips</button>
        <button onClick={() => this.changeDisplayClock()}>Change Display</button>
      </div>
    );
  }
}

var vm = ReactDOM.render(
  <App />,
  document.getElementById("root")
);
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.zhihu.com/question/265784392
https://juejin.cn/post/6844904127013584904
https://zh-hans.reactjs.org/docs/introducing-jsx.html
```