# Analysis of Vue Route History Mode
`Vue-router` is a core component of `Vue` that serves as the routing manager for `Vue` applications. By default, `Vue-router` uses the `hash` mode, but the `history` mode can be enabled by configuring the `mode` property when importing the `Vue-router` module.

## Description
In the `hash` mode of `Vue-router`, the URL's `hash` is used to simulate a complete URL. When the URL changes, the page does not reload. On the other hand, the `history` mode of `Vue-router` fully utilizes the `history.pushState` API to handle URL redirection. Similarly, there is no need to reload the page during navigation, and no additional requests are made to the server. However, configuring the backend to support the `history` mode is still necessary. In a single-page client application, if the backend is not correctly configured, users accessing URLs directly from the browser may encounter a `404` error. Therefore, a catch-all resource should be added on the server to return the same `index.html` application dependency page when no static resource matches the URL. An example of this configuration in `Nginx` is shown below:

```
location / {
  try_files $uri $uri/ /index.html;
}
```

## Analysis
The implementation of `Vue-router` source code is quite complex, handling various compatibility issues, exceptions, and conditional branches. This article focuses on analyzing the core part of the code, a trimmed-down version with critical sections annotated. The commit ID for this version is `560d11d`.

First, when defining the `Router`, the `Vue.use(VueRouter)` method is called. This is the classic way of using a `Vue.js` plugin, where the plugin object is added with an `install` method to install the specific logic of the plugin. At this point, the static method of the `VueRouter` class is called, `VueRouter.install = install`. The `install` module mainly ensures that `Vue-router` is only used once, registers instances within the `beforeCreate` lifecycle of `Vue` using mixins, and destroys instances within the `destroyed` lifecycle. It also defines the `$router` and `$route` properties as read-only and registers the global components `<router-view>` and `<router-link>`.

```javascript
// dev/src/install.js line 6
export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true // Ensure that Vue-router is only used once

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () { // Register an instance
      if (isDef(this.$options.router)) { // this.$options.router comes from the instantiation of VueRouter // Check if the instance is already mounted
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this) // Invoke the init method of VueRouter // The purpose of the init method will be explained later
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this // Set the _routerRoot of the component to the root Vue instance
      }
      registerInstance(this, this)
    },
    destroyed () { // Destroy the instance by mounting undefined
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })
```

```javascript
Vue.component('RouterView', View) // Register global component <router-view>
Vue.component('RouterLink', Link) // Register global component <router-link>

const strats = Vue.config.optionMergeStrategies
// use the same hook merging strategy for route hooks
strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}

After that is the constructor function of the `VueRouter` object, mainly to first get the value of `mode`, if the value of `mode` is `history` but the browser does not support the `history` mode, then force setting the value of `mode` to `hash`, and then according to the value of `mode`, choose which mode `vue-router` uses.

```javascript
// dev/src/index.js line 40
constructor (options: RouterOptions = {}) {
  this.app = null
  this.apps = []
  this.options = options
  this.beforeHooks = []
  this.resolveHooks = []
  this.afterHooks = []
  this.matcher = createMatcher(options.routes || [], this) // Create route matching object

  let mode = options.mode || 'hash'
  this.fallback =
    mode === 'history' && !supportsPushState && options.fallback !== false // Check compatibility
  if (this.fallback) {
    mode = 'hash'
  }
  if (!inBrowser) {
    mode = 'abstract'
  }
  this.mode = mode

  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base) // Instantiate history mode
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback) // Instantiate Hash mode
      break
    case 'abstract':
      this.history = new AbstractHistory(this, options.base)
      break
    default:
      if (process.env.NODE_ENV !== 'production') {
        assert(false, `invalid mode: ${mode}`)
      }
  }
}
```


The constructor function calls the `createMatcher` method to create the route matching object, and then calls the actual method `createRouteMap` used to create the route map in `createMatcher`. It can be said that the function of `createMatcher` is to create the route map, and then use closure to allow the `addRoutes` and `match` functions to use several objects in the route map, and finally return a `Matcher` object.

```javascript
// dev/src/create-matcher.js line 16
export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
  const { pathList, pathMap, nameMap } = createRouteMap(routes) // Create route map

  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
  }

  function match ( // Route matching
    raw: RawLocation,
    currentRoute?: Route,
    redirectedFrom?: Location
  ): Route {
    const location = normalizeLocation(raw, currentRoute, false, router) // location is an object, similar to {"_normalized":true,"path":"/","query":{},"hash":""}
    const { name } = location
```

```javascript
if (name) { // If there is a route name, then perform nameMap mapping
  const record = nameMap[name]  // nameMap[name] = route record
  if (process.env.NODE_ENV !== 'production') {
    warn(record, `Route with name '${name}' does not exist`)
  }
  if (!record) return _createRoute(null, location)
  const paramNames = record.regex.keys
    .filter(key => !key.optional)
    .map(key => key.name)

  if (typeof location.params !== 'object') {
    location.params = {}
  }

  if (currentRoute && typeof currentRoute.params === 'object') {
    for (const key in currentRoute.params) {
      if (!(key in location.params) && paramNames.indexOf(key) > -1) {
        location.params[key] = currentRoute.params[key]
      }
    }
  }

  location.path = fillParams(record.path, location.params, `named route "${name}"`)
  return _createRoute(record, location, redirectedFrom)
} else if (location.path) { // If the route is configured with path, match the route record to pathList and PathMap
  location.params = {}
  for (let i = 0; i < pathList.length; i++) {
    const path = pathList[i]
    const record = pathMap[path]
    if (matchRoute(record.regex, location.path, location.params)) {
      return _createRoute(record, location, redirectedFrom)
    }
  }
}
// no match
return _createRoute(null, location)
}

function redirect ( // Handling redirection
  record: RouteRecord,
  location: Location
): Route {
  const originalRedirect = record.redirect
  let redirect = typeof originalRedirect === 'function'
    ? originalRedirect(createRoute(record, location, null, router))
    : originalRedirect

  if (typeof redirect === 'string') {
    redirect = { path: redirect }
  }

  if (!redirect || typeof redirect !== 'object') {
    if (process.env.NODE_ENV !== 'production') {
      warn(
        false, `invalid redirect option: ${JSON.stringify(redirect)}`
      )
    }
    return _createRoute(null, location)
  }

  const re: Object = redirect
  const { name, path } = re
  let { query, hash, params } = location
  query = re.hasOwnProperty('query') ? re.query : query
  hash = re.hasOwnProperty('hash') ? re.hash : hash
  params = re.hasOwnProperty('params') ? re.params : params
}
```

```javascript
if (name) {
  // resolved named direct
  const targetRecord = nameMap[name]
  if (process.env.NODE_ENV !== 'production') {
    assert(targetRecord, `redirect failed: named route "${name}" not found.`)
  }
  return match({
    _normalized: true,
    name,
    query,
    hash,
    params
  }, undefined, location)
} else if (path) {
  // 1. resolve relative redirect
  const rawPath = resolveRecordPath(path, record)
  // 2. resolve params
  const resolvedPath = fillParams(rawPath, params, `redirect route with path "${rawPath}"`)
  // 3. rematch with existing query and hash
  return match({
    _normalized: true,
    path: resolvedPath,
    query,
    hash
  }, undefined, location)
} else {
  if (process.env.NODE_ENV !== 'production') {
    warn(false, `invalid redirect option: ${JSON.stringify(redirect)}`)
  }
  return _createRoute(null, location)
}
}

function alias( // 处理别名
  record: RouteRecord,
  location: Location,
  matchAs: string
): Route {
  const aliasedPath = fillParams(matchAs, location.params, `aliased route with path "${matchAs}"`)
  const aliasedMatch = match({
    _normalized: true,
    path: aliasedPath
  })
  if (aliasedMatch) {
    const matched = aliasedMatch.matched
    const aliasedRecord = matched[matched.length - 1]
    location.params = aliasedMatch.params
    return _createRoute(aliasedRecord, location)
  }
  return _createRoute(null, location)
}

function _createRoute(  // 创建路由
  record: ?RouteRecord,
  location: Location,
  redirectedFrom?: Location
): Route {
  if (record && record.redirect) {
    return redirect(record, redirectedFrom || location)
  }
  if (record && record.matchAs) {
    return alias(record, location, record.matchAs)
  }
  return createRoute(record, location, redirectedFrom, router) // 创建路由对象
}

return {
  match,
  addRoutes
}
```

```javascript
// dev/src/create-route-map.js line 7
export function createRouteMap (
  routes: Array<RouteConfig>,
  oldPathList?: Array<string>,
  oldPathMap?: Dictionary<RouteRecord>,
  oldNameMap?: Dictionary<RouteRecord>
): {
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>
} {
  // the path list is used to control path matching priority
  const pathList: Array<string> = oldPathList || [] // create mapping table
  // $flow-disable-line
  const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
  // $flow-disable-line
  const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)

  routes.forEach(route => { // loop through route configurations, add route records for each configuration
    addRouteRecord(pathList, pathMap, nameMap, route)
  })

  // ensure wildcard routes are always at the end
  for (let i = 0, l = pathList.length; i < l; i++) { // ensure wildcard is at the end
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0])
      l--
      i--
    }
  }

  if (process.env.NODE_ENV === 'development') {
    // warn if routes do not include leading slashes
    const found = pathList
    // check for missing leading slash
      .filter(path => path && path.charAt(0) !== '*' && path.charAt(0) !== '/')

    if (found.length > 0) {
      const pathNames = found.map(path => `- ${path}`).join('\n')
      warn(false, `Non-nested routes must include a leading slash character. Fix the following routes: \n${pathNames}`)
    }
  }

  return {
    pathList,
    pathMap,
    nameMap
  }
}

function addRouteRecord ( // add route record
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>,
  route: RouteConfig,
  parent?: RouteRecord,
  matchAs?: string
) {
  const { path, name } = route // get properties under route configuration
  if (process.env.NODE_ENV !== 'production') {
    assert(path != null, `"path" is required in a route configuration.`)
    assert(
      typeof route.component !== 'string',
      `route config "component" for path: ${String(
        path || name
      )} cannot be a ` + `string id. Use an actual component instead.`
    )
  }

  const pathToRegexpOptions: PathToRegexpOptions =
    route.pathToRegexpOptions || {}
  const normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict)
```

```javascript
if (typeof route.caseSensitive === 'boolean') {
  pathToRegexpOptions.sensitive = route.caseSensitive
}

const record: RouteRecord = { // Record object generation
  path: normalizedPath,
  regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
  components: route.components || { default: route.component },
  instances: {},
  name,
  parent,
  matchAs,
  redirect: route.redirect,
  beforeEnter: route.beforeEnter,
  meta: route.meta || {},
  props:
    route.props == null
      ? {}
      : route.components
        ? route.props
        : { default: route.props }
}

if (route.children) { 
  // Warn if route is named, does not redirect and has a default child route.
  // If users navigate to this route by name, the default child will
  // not be rendered (GH Issue #629)
  if (process.env.NODE_ENV !== 'production') {
    if (
      route.name &&
      !route.redirect &&
      route.children.some(child => /^\/?$/.test(child.path))
    ) {
      warn(
        false,
        `Named Route '${route.name}' has a default child route. ` +
          `When navigating to this named route (:to="{name: '${
            route.name
          }'"), ` +
          `the default child route will not be rendered. Remove the name from ` +
          `this route and use the name of the default child route for named ` +
          `links instead.`
      )
    }
  }
  route.children.forEach(child => { // Recursively add route records for the children property of the route configuration
    const childMatchAs = matchAs
      ? cleanPath(`${matchAs}/${child.path}`)
      : undefined
    addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
  })
}

if (!pathMap[record.path]) { // If there are multiple identical paths, only the first one takes effect, and the rest are ignored
  pathList.push(record.path)
  pathMap[record.path] = record
}
```

```javascript
// dev/src/index.js line 21
export default class VueRouter {
  //...
  init (app: any /* Vue component instance */) {
    process.env.NODE_ENV !== 'production' &&
      assert(
        install.installed,
        `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
          `before creating root instance.`
      )

    this.apps.push(app)

    // set up app destroyed handler
    // https://github.com/vuejs/vue-router/issues/2639
    app.$once('hook:destroyed', () => {
      // clean out app from this.apps array once destroyed
      const index = this.apps.indexOf(app)
      if (index > -1) this.apps.splice(index, 1)
      // ensure we still have a main app or null if no apps
      // we do not release the router so it can be reused
      if (this.app === app) this.app = this.apps[0] || null
```

```javascript
if (!this.app) this.history.teardown()
})

// main app previously initialized
// return as we don't need to set up new history listener
if (this.app) {
  return
}

this.app = app

const history = this.history

if (history instanceof HTML5History || history instanceof HashHistory) {
  const handleInitialScroll = routeOrError => {
    const from = history.current
    const expectScroll = this.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll && 'fullPath' in routeOrError) {
      handleScroll(this, routeOrError, from, false)
    }
  }
  const setupListeners = routeOrError => {
    history.setupListeners() // Initialize adding event listeners
    handleInitialScroll(routeOrError)
  }
  history.transitionTo( // If it's the default page, you need to activate the corresponding route based on the current path or hash in the browser address bar
    history.getCurrentLocation(),
    setupListeners,
    setupListeners
  )
}

history.listen(route => {
  this.apps.forEach(app => {
    app._route = route
  })
})
}
//...
}

// dev/src/history/base.js line 24
export class History {
  // ...

  transitionTo (
    location: RawLocation,
    onComplete?: Function,
    onAbort?: Function
  ) {
    let route
    // catch redirect option https://github.com/vuejs/vue-router/issues/3201
    try {
      route = this.router.match(location, this.current) // Get the matching route information
    } catch (e) {
      this.errorCbs.forEach(cb => {
        cb(e)
      })
      // Exception should still be thrown
      throw e
    }
    const prev = this.current
    this.confirmTransition( // Confirm transition
      route,
      () => {
        this.updateRoute(route) // Update the current route object
        onComplete && onComplete(route)
        this.ensureURL() // Update the URL address implemented by the subclass, for hash mode, it is to update the value of the hash
        this.router.afterHooks.forEach(hook => {
          hook && hook(route, prev)
        })
```

```javascript
// fire ready cbs once
if (!this.ready) {
  this.ready = true;
  this.readyCbs.forEach(cb => {
    cb(route);
  });
} else {
  this.onError = false;
  this.readyErrorCbs.forEach(cb => {
    cb(route);
  });
}

confirmTransition(route, onComplete, onAbort) {
  const current = this.current;
  this.pending = route;
  const abort = err => {
    if (!isNavigationFailure(err) && isError(err)) {
      if (this.errorCbs.length) {
        this.errorCbs.forEach(cb => {
          cb(err);
        });
      } else {
        warn(false, 'uncaught error during route navigation:');
        console.error(err);
      }
    }
    onAbort && onAbort(err);
  };
  const lastRouteIndex = route.matched.length - 1;
  const lastCurrentIndex = current.matched.length - 1;
  if (
    isSameRoute(route, current) &&
    lastRouteIndex === lastCurrentIndex &&
    route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
  ) {
    this.ensureURL();
    return abort(createNavigationDuplicatedError(current, route));
  }

  const { updated, deactivated, activated } = resolveQueue(
    this.current.matched,
    route.matched
  );
}
```

```javascript
const queue: Array<?NavigationGuard> = [].concat( // Array of navigation guards
  // in-component leave guards
  extractLeaveGuards(deactivated),  // Deactivated component hooks
  // global before hooks
  this.router.beforeHooks, // Global beforeEach hooks
  // in-component update hooks
  extractUpdateHooks(updated), // Called when the current route changes but the component is reused
  // in-config enter guards
  activated.map(m => m.beforeEnter), // Enter guard hooks need to render components
  // async components
  resolveAsyncComponents(activated) // Resolve asynchronous route components
)

const iterator = (hook: NavigationGuard, next) => {
  if (this.pending !== route) { // Do not navigate if the routes are not equal
    return abort(createNavigationCancelledError(current, route))
  }
  try {
    hook(route, current, (to: any) => { // Only when the next function in the hook is executed, the execution of the next hook function will continue. Otherwise, the navigation will be suspended. The following logic is to determine the parameters in next()
      if (to === false) {
        // next(false) -> abort navigation, ensure current URL
        this.ensureURL(true)
        abort(createNavigationAbortedError(current, route))
      } else if (isError(to)) {
        this.ensureURL(true)
        abort(to)
      } else if (
        typeof to === 'string' ||
        (typeof to === 'object' &&
          (typeof to.path === 'string' || typeof to.name === 'string'))
      ) {
        // next('/') or next({ path: '/' }) -> redirect
        abort(createNavigationRedirectedError(current, route))
        if (typeof to === 'object' && to.replace) {
          this.replace(to)
        } else {
          this.push(to)
        }
      } else {
        // confirm transition and pass on the value
        next(to)
      }
    })
  } catch (e) {
    abort(e)
  }
}
  // ...
// ...
}

// dev/src/history/html5.js line 10
export class HTML5History extends History {
  _startLocation: string

  constructor (router: Router, base: ?string) {
    super(router, base)

    this._startLocation = getLocation(this.base)
  }

  setupListeners () { // Initialize
    if (this.listeners.length > 0) {
      return
    }

    const router = this.router
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll) {
      this.listeners.push(setupScroll())
    }
```

```javascript
const handleRoutingEvent = () => {
  const current = this.current;

  // Avoiding first `popstate` event dispatched in some browsers but first
  // history route not updated since async guard at the same time.
  const location = getLocation(this.base);
  if (this.current === START && location === this._startLocation) {
    return;
  }

  this.transitionTo(location, route => {
    if (supportsScroll) {
      handleScroll(router, route, current, true);
    }
  });
};
window.addEventListener('popstate', handleRoutingEvent); // Event listening
this.listeners.push(() => {
  window.removeEventListener('popstate', handleRoutingEvent);
});
go(n: number) {
  window.history.go(n);
}

push(location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this;
  this.transitionTo(location, route => {
    pushState(cleanPath(this.base + route.fullPath));
    handleScroll(this.router, route, fromRoute, false);
    onComplete && onComplete(route);
  }, onAbort);
}

replace(location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this;
  this.transitionTo(location, route => {
    replaceState(cleanPath(this.base + route.fullPath));
    handleScroll(this.router, route, fromRoute, false);
    onComplete && onComplete(route);
  }, onAbort);
}

ensureURL(push?: boolean) {
  if (getLocation(this.base) !== this.current.fullPath) {
    const current = cleanPath(this.base + this.current.fullPath);
    push ? pushState(current) : replaceState(current);
  }
}

getCurrentLocation(): string {
  return getLocation(this.base);
}
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.jianshu.com/p/557f2ba86892
https://juejin.im/post/6844904159678824456
https://juejin.im/post/6844904012630720526
https://juejin.im/post/6844904062698127367
https://developer.mozilla.org/zh-CN/docs/Web/API/History/pushState
https://liyucang-git.github.io/2019/08/15/vue-router%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/
https://router.vuejs.org/zh/guide/essentials/history-mode.html#%E5%90%8E%E7%AB%AF%E9%85%8D%E7%BD%AE%E4%BE%8B%E5%AD%90
```