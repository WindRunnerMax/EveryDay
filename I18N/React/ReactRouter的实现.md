# Implementation of ReactRouter
The `ReactRouter` is a core component of `React`, primarily serving as a router manager to keep the `UI` and `URL` in sync. It boasts a simple `API` and powerful features such as code caching loading, dynamic route matching, and establishing correct transition handling.

## Description
The `React Router` is built on top of the `history` object. In short, a `history` object knows how to listen for changes in the browser's address bar, parse the `URL` into a `location` object, and then the `router` uses it to match routes, ultimately rendering the corresponding components correctly. There are three commonly used forms of `history`: `Browser History`, `Hash History`, and `Memory History`.

### Browser History
`Browser History` is the recommended `history` for using `React Router`. It uses the `pushState`, `replaceState`, and other `APIs` of the browser's `History` object, as well as the `popstate` event, to handle the `URL`. It can create a real `URL` like `https://www.example.com/path`, and likewise, page transitions do not require a page reload, nor do they involve requests to the server. However, for the history mode, backend configuration is still needed to support non-homepage requests and to return resources on page refresh. Since the application is a single-page client application, if the backend is not configured correctly, accessing a URL directly in the browser will result in a `404` error. Therefore, a catch-all resource needs to be added on the server to return the same `index.html` page when no static resources match the `URL`, for example, in the configuration under `Nginx`.

```
location / {
  try_files $uri $uri/ /index.html;
}
```

### Hash History
The original purpose of the `#` symbol in a `URL` is to indicate the position in a web page, for example, `https://www.example.com/index.html#print` indicates the print position of the example's index.html, and when the browser reads this `URL`, it automatically scrolls to the `print` position in the visible area. Typically, the `name` attribute of the `<a>` tag or the `id` attribute of the `<div>` tag is used to specify the anchor points.  
The anchor position can be read using the `window.location.hash` property, and a `hashchange` event listener can be added for changes in the hash. Each time the hash changes, a record is added to the browser's history, and although the hash appears in the `URL`, it is not included in the `HTTP` request. The hash is used to guide the browser's actions and has no effect on the server-side, so changing the hash does not reload the page.  
The role of `ReactRouter` is to update the page view by changing the `URL` without requesting the page again, dynamically loading and destroying components. In simple terms, although the address in the address bar changes, it is not a completely new page, but rather certain parts of the previous page have been modified. This is also the characteristic of a single-page application (`SPA`), where all activity is confined to a single web page. Non-lazy loaded pages load the corresponding `HTML`, `JavaScript`, and `CSS` files only when the web page is initialized. Once the page is loaded, the `SPA` does not reload or redirect the page, but dynamically changes the `HTML` using JavaScript. By default, the Hash mode achieves routing and controls the display and hiding of components similar to page navigation through anchors.

### Memory History
`Memory History` is not manipulated or read in the address bar, which explains how server rendering can be implemented. It is also suitable for testing and other rendering environments such as `React Native`. One difference from the other two forms of `History` is that we must create it, which is advantageous for testing.

```javascript
const history = createMemoryHistory(location);
```

## Implementation
Let's implement a very simple `Browser History` mode and `Hash History` mode. Since the `pushState` method of `H5` cannot run on the local file protocol `file://`, you need to deploy an `http://` environment using tools like `webpack`, `Nginx`, or `Apache`. Returning to the `Browser History` mode, the benefit of `history` route switching without page refresh is due to the methods provided by `H5` such as `pushState()`, `replaceState()`, and the `popstate` event. These methods change the route path but do not result in a page transition. However, without proper backend configuration, refreshing the page after route modification will result in a `404`. For the `Hash History` mode, the implementation approach is similar, mainly because it does not use `H5` `APIs` like `pushState`, and the event listened to is different.  By listening to the changes in its `hashchange` event, the corresponding view is then updated based on `location.hash`. 


```html
<!-- Browser History -->
<!DOCTYPE html>
<html lang="en">
```

```html
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
        this.routeView = null; // Component's view container
        this.routes = Object.create(null); // Defined routes
    }

    // Bind events after route matching
    Router.prototype.route = function (path, callback) {
        this.routes[path] = () => this.routeView.innerHTML = callback() || "";
    };

    // Initialization
    Router.prototype.init = function(root, rootView) {
        this.routeView = rootView; // Specify the view container
        this.refresh(); // Initialize and refresh the view
        root.addEventListener("click", (e) => { // Event delegation to the root
            if (e.target.nodeName === "A") {
                e.preventDefault();
                history.pushState(null, "", e.target.getAttribute("href"));
                this.refresh(); // Trigger and refresh the view
            }
        })
        // Listen for user's back and forward clicks
        // pushState and replaceState do not trigger the popstate event
        window.addEventListener("popstate", this.refresh.bind(this), false); 
    };

    // Refresh the view
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

```javascript
// Initialization
Router.prototype.init = function(root, rootView) {
    this.routeView = rootView; // Specify the container for carrying the view
    this.refresh(); // Initial trigger
    // Listen for the hashchange event for refresh
    window.addEventListener("hashchange", this.refresh.bind(this), false); 
};

// Refresh view
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
```

```jsx
// This part is a bit of a workaround. We need to start listening for location
// changes here in the constructor just in case there are any <Redirect> components
// on the initial render. If there are, they will replace/push when
// they mount and since componentDidMount fires in children before parents, we may
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

When using `Router` to nest `Route`, we then come to the `Route` component. The purpose of the `Route` is to match the route and pass the route information to the component to be rendered as `props`. The `Route` accepts the `context` passed down from the upper-level `Router`. The `history` in the `Router` listens to the changes of the entire page's routes. When the page is redirected, the `history` triggers the event and the `Router` passes down the `nextContext`, which then updates the `props` and `context` of `Route` to determine if the current `Route`'s `path` matches the `location`. If it matches, it renders; otherwise, it does not. The criterion for matching is the `computeMatch` function. In this text, we will analyze this function later. For now, just understand that if the match fails, `match` is `null`; if it succeeds, the result of `match` becomes part of the `props` and is passed to the component to be rendered. The `Route` accepts three types of "render props": `<Route component>`, `<Route render>`, `<Route children>`. At this point, it is important to note that if the `component` passed in is an inline function, since `props.component` is newly created each time, `React` will consider a completely new component has come in during the `diff`, so it will `unmount` the old component and then `re-mount` it. In this case, use `render`. With the absence of the wrapping `component` element, the expanded element type of `render` remains the same each time, so there will be no `re-mount`. Additionally, `children` will not `re-mount` either.

```
// \packages\react-router\modules\Route.js line 17
class Route extends React.Component {
  render() {
    return (
      <RouterContext.Consumer>
        {context => {
          invariant(context, "You should not use <Route> outside a <Router>");
```

```javascript
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

Actually, what we probably write the most is the `<Link>` tag, so let's take a look at the `<Link>` component again. We can see that the `<Link>` ultimately creates an `a` tag to wrap the element to be navigated. In the `handleClick` click event of this `a` tag, `preventDefault` is used to prevent the default navigation. So, the `href` here actually doesn't have a practical effect, but it still indicates the URL of the page to be navigated to and has better HTML semantics. In the `handleClick`, `preventDefault` is performed for clicks that are not prevented by `preventDefault`, left mouse button clicks, non-`_blank` navigations, and single clicks without holding down other function keys, and then it is `push` into the `history`. As mentioned earlier, the change in routing and page navigation is not interrelated. `ReactRouter` in `Link` calls `push` of the `history` library to invoke `pushState` of `HTML5 history`, but this only changes the route, and nothing else. In the `listen` in `Router`, it listens for changes in the route, then updates the `props` and `nextContext` through `context` to let the lower-level `Route` re-match and update the required rendering part.
```

```javascript
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

        const location = typeof to === "string" ? createLocation(to, null, null, context.location) : to;
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




## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

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