# ReactRouter的实现
`ReactRouter`是`React`的核心组件，主要是作为`React`的路由管理器，保持`UI`与`URL`同步，其拥有简单的`API`与强大的功能例如代码缓冲加载、动态路由匹配、以及建立正确的位置过渡处理等。


## 描述
`React Router`是建立在`history`对象之上的，简而言之一个`history`对象知道如何去监听浏览器地址栏的变化，并解析这个`URL`转化为`location`对象，然后`router`使用它匹配到路由，最后正确地渲染对应的组件，常用的`history`有三种形式： `Browser History`、`Hash History`、`Memory History`。

### Browser History
`Browser History`是使用`React Router`的应用推荐的`history`，其使用浏览器中的`History`对象的`pushState`、`replaceState`等`API`以及`popstate`事件等来处理`URL`，其能够创建一个像`https://www.example.com/path`这样真实的`URL`，同样在页面跳转时无须重新加载页面，当然也不会对于服务端进行请求，当然对于`history`模式仍然是需要后端的配置支持，用以支持非首页的请求以及刷新时后端返回的资源，由于应用是个单页客户端应用，如果后台没有正确的配置，当用户在浏览器直接访问`URL`时就会返回`404`，所以需要在服务端增加一个覆盖所有情况的候选资源，如果`URL`匹配不到任何静态资源时，则应该返回同一个`index.html`应用依赖页面，例如在`Nginx`下的配置。

```
location / {
  try_files $uri $uri/ /index.html;
}
```

### Hash History
`Hash`符号即`#`原本的目的是用来指示`URL`中指示网页中的位置，例如`https://www.example.com/index.html#print`即代表`example`的`index.html`的`print`位置，浏览器读取这个`URL`后，会自动将`print`位置滚动至可视区域，通常使用`<a>`标签的`name`属性或者`<div>`标签的`id`属性指定锚点。  
通过`window.location.hash`属性能够读取锚点位置，可以为`Hash`的改变添加`hashchange`监听事件，每一次改变`Hash`，都会在浏览器的访问历史中增加一个记录，此外`Hash`虽然出现在`URL`中，但不会被包括在`HTTP`请求中，即`#`及之后的字符不会被发送到服务端进行资源或数据的请求，其是用来指导浏览器动作的，对服务器端没有效果，因此改变`Hash`不会重新加载页面。  
`ReactRouter`的作用就是通过改变`URL`，在不重新请求页面的情况下，更新页面视图，从而动态加载与销毁组件，简单的说就是，虽然地址栏的地址改变了，但是并不是一个全新的页面，而是之前的页面某些部分进行了修改，这也是`SPA`单页应用的特点，其所有的活动局限于一个`Web`页面中，非懒加载的页面仅在该`Web`页面初始化时加载相应的`HTML`、`JavaScript`、`CSS`文件，一旦页面加载完成，`SPA`不会进行页面的重新加载或跳转，而是利用`JavaScript`动态的变换`HTML`，默认`Hash`模式是通过锚点实现路由以及控制组件的显示与隐藏来实现类似于页面跳转的交互。  

### Memory History
`Memory History`不会在地址栏被操作或读取，这就可以解释如何实现服务器渲染的，同时其也非常适合测试和其他的渲染环境例如`React Native`，和另外两种`History`的一点不同是我们必须创建它，这种方式便于测试。

```javascript
const history = createMemoryHistory(location);
```


## 实现
我们来实现一个非常简单的`Browser History`模式与`Hash History`模式的实现，因为`H5`的`pushState`方法不能在本地文件协议`file://`运行，所以运行起来需要搭建一个`http://`环境，使用`webpack`、`Nginx`、`Apache`等都可以，回到`Browser History`模式路由，能够实现`history`路由跳转不刷新页面得益与`H5`提供的`pushState()`、`replaceState()`等方法以及`popstate`等事件，这些方法都是也可以改变路由路径，但不作页面跳转，当然如果在后端不配置好的情况下路由改编后刷新页面会提示`404`，对于`Hash History`模式，我们的实现思路相似，主要在于没有使用`pushState`等`H5`的`API`，以及监听事件不同，通过监听其`hashchange`事件的变化，然后拿到对应的`location.hash`更新对应的视图。


```html
<!-- Browser History -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Router</title>
</head>

<body>
    <ul>
        <li><a href="/home">home</a></li>
        <li><a href="/about">about</a></li>
        <div id="routeView"></div>
    </ul>
</body>
<script>
    function Router() {
        this.routeView = null; // 组件承载的视图容器
        this.routes = Object.create(null); // 定义的路由
    }

    // 绑定路由匹配后事件
    Router.prototype.route = function (path, callback) {
        this.routes[path] = () => this.routeView.innerHTML = callback() || "";
    };

    // 初始化
    Router.prototype.init = function(root, rootView) {
        this.routeView = rootView; // 指定承载视图容器
        this.refresh(); // 初始化即刷新视图
        root.addEventListener("click", (e) => { // 事件委托到root
            if (e.target.nodeName === "A") {
                e.preventDefault();
                history.pushState(null, "", e.target.getAttribute("href"));
                this.refresh(); // 触发即刷新视图
            }
        })
        // 监听用户点击后退与前进
        // pushState与replaceState不会触发popstate事件
        window.addEventListener("popstate", this.refresh.bind(this), false); 
    };

    // 刷新视图
    Router.prototype.refresh = function () {
        let path = location.pathname;
        console.log("refresh", path);
        if(this.routes[path]) this.routes[path]();
        else this.routeView.innerHTML = "";
    };

    window.Router = new Router();
    
    Router.route("/home", function() {
        return "home";
    });
    Router.route("/about", function () {
        return "about";
    });

    Router.init(document, document.getElementById("routeView"));

</script>
</html>
```

```html
<!-- Hash History -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Router</title>
</head>

<body>
    <ul>
        <li><a href="#/home">home</a></li>
        <li><a href="#/about">about</a></li>
        <div id="routeView"></div>
    </ul>
</body>
<script>
    function Router() {
        this.routeView = null; // 组件承载的视图容器
        this.routes = Object.create(null); // 定义的路由
    }

    // 绑定路由匹配后事件
    Router.prototype.route = function (path, callback) {
        this.routes[path] = () => this.routeView.innerHTML = callback() || "";
    };

    // 初始化
    Router.prototype.init = function(root, rootView) {
        this.routeView = rootView; // 指定承载视图容器
        this.refresh(); // 初始化触发
        // 监听hashchange事件用以刷新
        window.addEventListener("hashchange", this.refresh.bind(this), false); 
    };

    // 刷新视图
    Router.prototype.refresh = function () {
        let hash = location.hash;
        console.log("refresh", hash);
        if(this.routes[hash]) this.routes[hash]();
        else this.routeView.innerHTML = "";
    };

    window.Router = new Router();
    
    Router.route("#/home", function() {
        return "home";
    });
    Router.route("#/about", function () {
        return "about";
    });

    Router.init(document, document.getElementById("routeView"));

</script>
</html>
```

## 分析
我们可以看一下`ReactRouter`的实现，`commit id`为`eef79d5`，`TAG`是`4.4.0`，在这之前我们需要先了解一下`history`库，`history`库，是`ReactRouter`依赖的一个对`window.history`加强版的`history`库，其中主要用到的有`match`对象表示当前的`URL`与`path`的匹配的结果，`location`对象是`history`库基于`window.location`的一个衍生。  
`ReactRouter`将路由拆成了几个包: `react-router`负责通用的路由逻辑，`react-router-dom`负责浏览器的路由管理，`react-router-native`负责`react-native`的路由管理。  
我们以`BrowserRouter`组件为例，`BrowserRouter`在`react-router-dom`中，它是一个高阶组件，在内部创建一个全局的`history`对象，可以监听整个路由的变化，并将`history`作为`props`传递给`react-router`的`Router`组件，`Router`组件再会将这个`history`的属性作为`context`传递给子组件。

```
// packages\react-router-dom\modules\HashRouter.js line 10
class BrowserRouter extends React.Component {
  history = createHistory(this.props);

  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}
```

接下来我们到`Router`组件，`Router`组件创建了一个`React Context`环境，其借助`context`向`Route`传递`context`，这也解释了为什么`Router`要在所有`Route`的外面。在`Router`的`componentWillMount`中，添加了`history.listen`，其能够监听路由的变化并执行回调事件，在这里即会触发`setState`。当`setState`时即每次路由变化时 `->` 触发顶层`Router`的回调事件 `->` `Router`进行`setState` `->` 向下传递 `nextContext`此时`context`中含有最新的`location` `->` 下面的`Route`获取新的`nextContext`判断是否进行渲染。

```
// line packages\react-router\modules\Router.js line 10
class Router extends React.Component {
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
  }

  constructor(props) {
    super(props);

    this.state = {
      location: props.history.location
    };

    // This is a bit of a hack. We have to start listening for location
    // changes here in the constructor in case there are any <Redirect>s
    // on the initial render. If there are, they will replace/push when
    // they mount and since cDM fires in children before parents, we may
    // get a new location before the <Router> is mounted.
    this._isMounted = false;
    this._pendingLocation = null;

    if (!props.staticContext) {
      this.unlisten = props.history.listen(location => {
        if (this._isMounted) {
          this.setState({ location });
        } else {
          this._pendingLocation = location;
        }
      });
    }
  }

  componentDidMount() {
    this._isMounted = true;

    if (this._pendingLocation) {
      this.setState({ location: this._pendingLocation });
    }
  }

  componentWillUnmount() {
    if (this.unlisten) this.unlisten();
  }

  render() {
    return (
      <RouterContext.Provider
        children={this.props.children || null}
        value={{
          history: this.props.history,
          location: this.state.location,
          match: Router.computeRootMatch(this.state.location.pathname),
          staticContext: this.props.staticContext
        }}
      />
    );
  }
}
```

我们在使用时都是使用`Router`来嵌套`Route`，所以此时就到`Route`组件，`Route`的作用是匹配路由，并传递给要渲染的组件`props`，`Route`接受上层的`Router`传入的`context`，`Router`中的`history`监听着整个页面的路由变化，当页面发生跳转时，`history`触发监听事件，`Router`向下传递`nextContext`，就会更新`Route`的`props`和`context`来判断当前`Route`的`path`是否匹配`location`，如果匹配则渲染，否则不渲染，是否匹配的依据就是`computeMatch`这个函数，在下文会有分析，这里只需要知道匹配失败则`match`为`null`，如果匹配成功则将`match`的结果作为`props`的一部分，在`render`中传递给传进来的要渲染的组件。`Route`接受三种类型的`render props`，`<Route component>`、`<Route render>`、`<Route children>`，此时要注意的是如果传入的`component`是一个内联函数，由于每次的`props.component`都是新创建的，所以`React`在`diff`的时候会认为进来了一个全新的组件，所以会将旧的组件`unmount`再`re-mount`。这时候就要使用`render`，少了一层包裹的`component`元素，`render`展开后的元素类型每次都是一样的，就不会发生`re-mount`了，另外`children`也不会发生`re-mount`。


```
// \packages\react-router\modules\Route.js line 17
class Route extends React.Component {
  render() {
    return (
      <RouterContext.Consumer>
        {context => {
          invariant(context, "You should not use <Route> outside a <Router>");

          const location = this.props.location || context.location;
          const match = this.props.computedMatch
            ? this.props.computedMatch // <Switch> already computed the match for us
            : this.props.path
              ? matchPath(location.pathname, this.props)
              : context.match;

          const props = { ...context, location, match };

          let { children, component, render } = this.props;

          // Preact uses an empty array as children by
          // default, so use null if that's the case.
          if (Array.isArray(children) && children.length === 0) {
            children = null;
          }

          if (typeof children === "function") {
            children = children(props);
            // ...
          }

          return (
            <RouterContext.Provider value={props}>
              {children && !isEmptyChildren(children)
                ? children
                : props.match
                  ? component
                    ? React.createElement(component, props)
                    : render
                      ? render(props)
                      : null
                  : null}
            </RouterContext.Provider>
          );
        }}
      </RouterContext.Consumer>
    );
  }
}
```

我们实际上我们可能写的最多的就是`Link`这个标签了，所以我们再来看一下`<Link>`组件，我们可以看到`Link`最终还是创建一个`a`标签来包裹住要跳转的元素，在这个`a`标签的`handleClick`点击事件中会`preventDefault`禁止默认的跳转，所以实际上这里的`href`并没有实际的作用，但仍然可以标示出要跳转到的页面的`URL`并且有更好的`html`语义。在`handleClick`中，对没有被`preventDefault`、鼠标左键点击的、非`_blank`跳转的、没有按住其他功能键的单击进行`preventDefault`，然后`push`进`history`中，这也是前面讲过的路由的变化与 页面的跳转是不互相关联的，`ReactRouter`在`Link`中通过`history`库的`push`调用了`HTML5 history`的`pushState`，但是这仅仅会让路由变化，其他什么都没有改变。在`Router`中的`listen`，它会监听路由的变化，然后通过`context`更新`props`和`nextContext`让下层的`Route`去重新匹配，完成需要渲染部分的更新。

```
// packages\react-router-dom\modules\Link.js line 14
class Link extends React.Component {
  handleClick(event, history) {
    if (this.props.onClick) this.props.onClick(event);

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      (!this.props.target || this.props.target === "_self") && // let browser handle "target=_blank" etc.
      !isModifiedEvent(event) // ignore clicks with modifier keys
    ) {
      event.preventDefault();

      const method = this.props.replace ? history.replace : history.push;

      method(this.props.to);
    }
  }

  render() {
    const { innerRef, replace, to, ...rest } = this.props; // eslint-disable-line no-unused-vars

    return (
      <RouterContext.Consumer>
        {context => {
          invariant(context, "You should not use <Link> outside a <Router>");

          const location =
            typeof to === "string"
              ? createLocation(to, null, null, context.location)
              : to;
          const href = location ? context.history.createHref(location) : "";

          return (
            <a
              {...rest}
              onClick={event => this.handleClick(event, context.history)}
              href={href}
              ref={innerRef}
            />
          );
        }}
      </RouterContext.Consumer>
    );
  }
}
```




## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://zhuanlan.zhihu.com/p/44548552
https://github.com/fi3ework/blog/issues/21
https://juejin.cn/post/6844903661672333326
https://juejin.cn/post/6844904094772002823
https://juejin.cn/post/6844903878568181768
https://segmentfault.com/a/1190000014294604
https://github.com/youngwind/blog/issues/109
http://react-guide.github.io/react-router-cn/docs/guides/basics/Histories.html
```

