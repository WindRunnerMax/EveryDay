# React中JSX的理解
`JSX`是快速生成`react`元素的一种语法，实际是`React.createElement(component, props, ...children)`的语法糖，同时`JSX`也是`Js`的语法扩展，包含所有`Js`功能。

## 描述

### JSX发展过程
在之前，`Facebook`是`PHP`大户，所以`React`最开始的灵感就来自于`PHP`。  
在`2004`年这个时候，大家都还在用`PHP`的字符串拼接来开发网站。

```php
$str = "<ul>";
foreach ($talks as $talk) {
  $str += "<li>" . $talk->name . "</li>";
}
$str += "</ul>";
```

这种方式代码写出来不好看不说，还容易造成`XSS`等安全问题。应对方法是对用户的任何输入都进行转义`Escape`，但是如果对字符串进行多次转义，那么反转义的次数也必须是相同的，否则会无法得到原内容，如果又不小心把`HTML`标签给转义了，那么`HTML`标签会直接显示给用户，从而导致很差的用户体验。  
到了`2010`年，为了更加高效的编码，同时也避免转义`HTML`标签的错误，`Facebook`开发了`XHP`。`XHP`是对`PHP`的语法拓展，它允许开发者直接在`PHP`中使用`HTML`标签，而不再使用字符串。

```php
$content = <ul />;
foreach ($talks as $talk) {
  $content->appendChild(<li>{$talk->name}</li>);
}
```

这样的话，所有`HTML`标签都使用不同于`PHP`的语法，我们可以轻易的分辨哪些需要转义哪些不需要转义。不久的后来，`Facebook`的工程师又发现他们还可以创建自定义标签，而且通过组合自定义标签有助于构建大型应用。  
到了`2013`年，前端工程师`Jordan Walke`向他的经理提出了一个大胆的想法：把`XHP`的拓展功能迁移到`Js`中，首要任务是需要一个拓展来让`Js`支持`XML`语法，该拓展称为`JSX`。因为当时由于`Node.js`在`Facebook`已经有很多实践，所以很快就实现了`JSX`。

```jsx
const content = (
  <TalkList>
    {talks.map(talk => <Talk talk={talk} />)}
  </TalkList>
);
```

### 为何使用JSX
`React`认为渲染逻辑本质上与其他`UI`逻辑内在耦合，比如在`UI`中需要绑定处理事件、在某些时刻状态发生变化时需要通知到`UI`，以及需要在`UI`中展示准备好的数据。  
`React`并没有采用将标记与逻辑进行分离到不同文件这种人为地分离方式，而是通过将二者共同存放在称之为组件的松散耦合单元之中，来实现关注点分离。  
`React`不强制要求使用`JSX`，但是大多数人发现，在`JavaScript`代码中将`JSX`和`UI`放在一起时，会在视觉上有辅助作用，它还可以使`React`显示更多有用的错误和警告消息。  
简单来说，`JSX`可以很好的描述页面`html`结构，很方便的在`Js`中写`html`代码，并具有`Js`的全部功能。  

### 优点
`JSX`的优点主要体现在以下三点：
* 快速，`JSX`执行更快，因为它在编译为`JavaScript`代码后进行了优化。
* 安全，与`JavaScript`相比，`JSX`是静态类型的，大多是类型安全的。使用`JSX`进行开发时，应用程序的质量会变得更高，因为在编译过程中会发现许多错误，它也提供编译器级别的调试功能。
* 简单，语法简洁，上手容易。

## JSX实例

### 规则定义
`JSX`中定义了一些规则以及用法：
* `JSX`只能有一个根元素，`JSX`标签必须是闭合的，如果没有内容可以写成自闭和的形式`<div />`。
* 可以在`JSX`通过`{}`嵌入`Js`表达式。
* `JSX`会被`babel`转换成`React.createElement`的函数调用，调用后会创建一个描述`HTML`信息的`Js`对象。
* `JSX`中的子元素可以为字符串字面量。
* `JSX`中的子元素可以为`JSX`元素。
* `JSX`中的子元素可以为存储在数组中的一组元素。
* `JSX`中的子元素可以为`Js`表达式，可与其他类型子元素混用；可用于展示任意长度的列表。
* `JSX`中的子元素可以为函数及函数调用。
* `JSX`中的子元素如果为`boolean/null/undefined`将会被忽略，如果使用`&&`运算符，需要确保前面的是布尔值，如果是`0/1`则会被渲染出来。
* 在对象属性中定义`React`组件，可以使用`object`的点语法使用该组件。
* `React`元素会被转换为调用`React.createElement`函数，参数是组件，因此`React`和该组件必须在作用域内。
* `React`元素需要大写字母开头，或者将元素赋值给大小字母开头的变量，小写字母将被认为是`HTML`标签。
* 不能使用表达式作为`React`元素类型，需要先将其赋值给大写字母开头的变量，再把该变量作为组件。

### JSX的使用

在示例中我们声明了一个名为`name`的变量，然后在`JSX`中使用它，并将它包裹在大括号中。在`JSX`语法中，可以在大括号内放置任何有效的`JavaScript`表达式。例如`2 + 2`、`user.firstName`或`formatName(user)`都是有效的`JavaScript`表达式。

```jsx
const name = "Josh Perez";
const element = <h1>Hello, {name}</h1>;

ReactDOM.render(
  element,
  document.getElementById("root")
);
```
同样`JSX`也是一个表达式，`JSX`天生就是需要被编译之后才可以使用的，在编译之后`JSX`表达式会被转为普通`JavaScript`函数调用，并且对其取值后得到`JavaScript`对象。也就是说，你可以在`if`语句和`for`循环的代码块中使用`JSX`，将`JSX`赋值给变量，把`JSX`当作参数传入，以及从函数中返回`JSX`。

```jsx
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}
```

通常可以通过使用引号来将属性值指定为字符串字面量，也可以使用大括号来在属性值中插入一个`JavaScript`表达式，在属性中嵌入`JavaScript`表达式时，不要在大括号外面加上引号。因为`JSX`语法上更接近`JavaScript`而不是`HTML`，所以`React DOM`使用`camelCase`小驼峰命名来定义属性的名称，而不使用`HTML`属性名称的命名约定。例如`JSX`里的`class`变成了`className`，而`tabindex`则变为`tabIndex`。

```jsx
const element1 = <div tabIndex="0"></div>;
const element2 = <img src={user.avatarUrl}></img>;
```

`JSX`中也可以使用`</>`来闭合标签，另外`JSX`同样也可以直接定义很多子元素。

```jsx
const element1 = <img src={user.avatarUrl} />;
const element2 = (
  <div>
    <h1>Hello!</h1>
    <h2>Good to see you here.</h2>
  </div>
);
```
你可以安全地在`JSX`当中插入用户输入内容，`React DOM`在渲染所有输入内容之前，默认会进行转义，这样可以确保在你的应用中，永远不会注入那些并非自己明确编写的内容，所有的内容在渲染之前都被转换成了字符串，可以有效地防止 `XSS`跨站脚本攻击。

```jsx
const title = response.potentiallyMaliciousInput;
// 直接使用是安全的：
const element = <h1>{title}</h1>;
```

实际上`Babel`会把`JSX`转译成一个名为`React.createElement()`函数调用，通过`React.createElement()`定义的元素与使用`JSX`生成的元素相同，同样这就使得`JSX`天生就是需要编译的。

```jsx
const element1 = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);
// 等价
const element2 = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
```
`React.createElement()`会预先执行一些检查，以帮助你编写无错代码，但实际上它创建了一个这样的对象。这些对象被称为`React 元素`，它们描述了你希望在屏幕上看到的内容，`React`通过读取这些对象，然后使用它们来构建`DOM`以及保持随时更新。

```jsx
// 注意：这是简化过的结构
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
};
```

实际上，这就是虚拟`DOM`的一个节点，`Virtual DOM`是一种编程概念，在这个概念里，`UI`以一种理想化的，或者说虚拟的表现形式被保存于内存中，并通过如`ReactDOM`等类库使之与真实的`DOM`同步，这一过程叫做协调。这种方式赋予了`React`声明式的`API`，您告诉`React`希望让`UI`是什么状态，`React`就确保`DOM`匹配该状态，这样可以从属性操作、事件处理和手动`DOM`更新这些在构建应用程序时必要的操作中解放出来。  
与其将`Virtual DOM`视为一种技术，不如说它是一种模式，人们提到它时经常是要表达不同的东西。在`React`的世界里，术语`Virtual DOM`通常与`React`元素关联在一起，因为它们都是代表了用户界面的对象，而`React`也使用一个名为`fibers`的内部对象来存放组件树的附加信息，上述二者也被认为是`React`中`Virtual DOM` 实现的一部分，`Virtual DOM`也为使用`diff`算法奠定了基础。

```html
<div class="root" name="root">
    <p>1</p>
    <div>11</div>
</div>
```

```javascript
// 使用Js对象去描述上述节点以及文档
{
    type: "tag",
    tagName: "div",
    attr: {
        className: "root"
        name: "root"
    },
    parent: null,
    children: [{
        type: "tag",
        tagName: "p",
        attr: {},
        parent: {} /* 父节点的引用 */, 
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* 父节点的引用 */, 
            content: "1"
        }]
    },{
        type: "tag",
        tagName: "div",
        attr: {},
        parent: {} /* 父节点的引用 */, 
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* 父节点的引用 */, 
            content: "11"
        }]
    }]
}
```

### 示例

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <title>JSX示例</title>
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
          <button onClick={() => this.updateTips()}>更新tips</button>
          <button onClick={() => this.changeDisplayClock()}>改变显隐</button>
        </div>
      );
    }
  }

  var vm = ReactDOM.render(
    <App />,
    document.getElementById("root")
  );
</script>

</html>

```






## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.zhihu.com/question/265784392
https://juejin.cn/post/6844904127013584904
https://zh-hans.reactjs.org/docs/introducing-jsx.html
```

