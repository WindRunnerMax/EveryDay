```markdown
# Difference between $router and $route
`Vue Router` is the routing manager for `Vue.js`. The route is the access path for the Single Page Application (`SPA`). Within the `Vue` instance, the routing instance can be accessed via `$router`, which is the routing instance defined with `export default new Router(/*...*/)` in the routing definition file. With `$route`, you can access the status information of the currently active route, including the information parsed from the current URL and the route record matched by the URL. We can think of `$router` as a container managing a group of `$route`, while `$route` maps the current URL to the components.

## $router Object Properties
* `$router.app`: The root `Vue` instance configured with `router`.
* `$router.mode`: The mode used by the router.
* `$router.currentRoute`: The route information object corresponding to the current route.

## $router Object Methods
* `$router.beforeEach(to, from, next)`: Global before guard. Guards are executed asynchronously, and the navigation remains in a waiting state until all guards are resolved. The guard method takes three parameters: `to: Route` - the target route object to be entered, `from: Route` - the current route about to leave, `next: Function` - call this method to resolve the guard, and the execution effect depends on the calling parameters of `next`, such as `next()`, `next(false)`, `next('/')`, `next({path:'/',name:'home',replace:true,query:{q:1}})`, `next(error)`, etc. Typically, the navigation guard is directly defined in the `Vue Router` instance imported in `main.js`, but it can also be defined by accessing `$router` in the `Vue` instance.
* `$router.beforeResolve(to, from, next)`: Global resolve guard, called after `beforeRouteEnter`, also accepting the three parameters `to`, `from`, and `next`.
* `$router.afterEach(to, from)`: Global after hook, called after entering the route, and receives `to` and `from` as parameters.
* `$router.push(location[, onComplete[, onAbort]])`: Programmatic navigation method. Use `$router.push` to navigate to a different `URL`. This method adds a new record to the `history` stack, and clicking the browser's back button returns to the previous `URL`.
* `$router.replace(location[, onComplete[, onAbort]])`: Programmatic navigation, similar to `$router.push`, but the only difference is that it does not add a new record to the `history`, but replaces the current `history` record, as the method name suggests.
* `$router.go(n)`: Programmatic navigation. The argument of this method is an integer, indicating how many steps to go forward or backward in the `history` record, similar to `window.history.go(n)`.
* `$router.back()`: Programmatic navigation. Go back one step in the history, equivalent to `$router.go(-1)`.
* `$history.forward()`: Programmatic navigation. Move forward one step in the history, equivalent to `$router.go(1)`.
* `$router.getMatchedComponents([location])`: Returns an array of component classes matching the target location or the current route, which are definitions or construction classes, not instances, usually used for preloading data in server-side rendering.
* `$router.resolve(location[, current[, append]])`: Resolves the target location, with a format similar to the `to prop` of `<router-link>`, `current` being the default current route, `append` allowing to append a path to the `current` route, similar to `router-link`.
* `$router.addRoutes(route)`: Dynamically adds more route rules. The parameter must be an array that meets the requirements of the `routes` option.
* `$router.onReady(callback[, errorCallback])`: Queues a callback to be called when the initial navigation is completed. This means it can resolve all asynchronous entry hooks and asynchronously loaded components related to route initialization, effectively ensuring consistency between server-side rendering and client-side output. The second parameter, `errorCallback`, is called when an error occurs during the route initialization resolution.
* `$router.onError(callback)`: Registers a callback that is called when an error occurs during the route navigation process. The invoked error must be one of the following: an error is synchronously thrown within a route guard function, an error is asynchronously caught and handled in a route guard function by calling `next(err)`, or an error occurs while trying to resolve an asynchronous component during the rendering of a route.
```

## $route object properties
* `$route.path`: Returns a string representing the current route's path, always resolved as an absolute path.
* `$route.params`: Returns a `key-value` object containing dynamic segments and full match segments; if there are no route parameters, it is an empty object.
* `$route.query`: Returns a `key-value` object representing the URL query parameters.
* `$route.hash`: Returns the current route's hash value with `#`. If there is no hash value, it returns an empty string.
* `$route.fullPath`: Returns the complete resolved URL, including the query parameters and hash, representing the full path.
* `$route.matched`: Returns an array containing the route records for all nested path segments of the current route, where the route record is a copy of the object in the `routes` configuration array.
* `$route.name`: Returns the current route's name if it exists.
* `$route.redirectedFrom`: Returns the name of the route from which the redirection occurred, if a redirection exists.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://router.vuejs.org/zh/api/#routes
https://juejin.im/post/6844903665388486664
https://juejin.im/post/6844903608534695943
https://juejin.im/post/6844903892560379917
https://juejin.im/post/6844904005236162568
https://segmentfault.com/a/1190000016662929
```