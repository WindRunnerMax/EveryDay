# Analysis of Vue Router Hash Mode
`Vue-router` is a core component of `Vue`, mainly serving as the route manager for `Vue`. By default, `Vue-router` uses the hash mode, which simulates a complete `URL` using the `URL`'s hash, and the page does not reload when the `URL` changes.

## Description
The `hash` symbol, `#`, was originally intended to indicate a specific location within a web page in the `URL`. For example, `https://www.example.com/index.html#print` indicates the `print` location within `example`'s `index.html`. When the browser reads this `URL`, it automatically scrolls to the `print` location in the visible area. Typically, the `<a>` tag's `name` attribute or the `<div>` tag's `id` attribute is used to specify anchor points.
The anchor point can be read via the `window.location.hash` property, and a `hashchange` event listener can be added for changes in the `Hash`. Each time the `Hash` changes, a new entry is added to the browser's history. Additionally, while the `Hash` appears in the `URL`, it is not included in the `HTTP` request sent to the server for resource or data retrieval. Instead, it guides browser actions and has no effect on the server side, so changing the `Hash` does not reload the page.
The role of `Vue-router` is to update the page view without refreshing the page by changing the `URL`, dynamically loading and destroying components. In simple terms, although the address in the address bar changes, it does not represent an entirely new page, but rather modifications to certain parts of the previous page. This is a characteristic of Single Page Applications (SPAs), where all activities are confined to a single web page. Non-lazy-loaded pages load the respective HTML, JavaScript, and CSS files only when the web page is initialized. Once the page is loaded, the SPA does not reload or jump to other pages; instead, it dynamically modifies the HTML using JavaScript. By default, the Hash mode simulates page navigation and component display and hiding via anchors.

## Analysis
The implementation of `Vue-router` source code is quite complex, dealing with various compatibility issues, exceptions, and conditional branches. This article analyzes the core code, a refined version with important parts annotated, and the commit ID is `560d11d`.

Firstly, when defining `Router`, the `Vue.use(VueRouter)` is called, which invokes the static method on the `VueRouter` class, namely `VueRouter.install = install`. The `install` module mainly ensures that `Vue-router` is only used once, registers instances within the `beforeCreate` lifecycle of `Vue` via the mixin, destroys instances within the `destroyed` lifecycle, and defines the `$router` and `$route` properties as read-only, as well as registers global components `<router-view>` and `<router-link>`.

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
    beforeCreate () { // Register instance
      if (isDef(this.$options.router)) { // this.$options.router comes from the instantiation of VueRouter // Check whether the instance has been mounted
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this) // Call the init method of VueRouter
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this // Set the _routerRoot of the component to point to the root Vue instance
      }
      registerInstance(this, this)
    },
    destroyed () { // Destroy the instance by mounting undefined
      registerInstance(this)
    }
  })
```

```javascript
Object.defineProperty(Vue.prototype, '$router', {
  get () { return this._routerRoot._router }
})

Object.defineProperty(Vue.prototype, '$route', {
  get () { return this._routerRoot._route }
})

Vue.component('RouterView', View) // Register global component <router-view>
Vue.component('RouterLink', Link) // Register global component <router-link>

const strats = Vue.config.optionMergeStrategies
// use the same hook merging strategy for route hooks
strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
```

Next is the constructor of the `VueRouter` object, mainly to first get the value of `mode`. If the value of `mode` is `history` but the browser does not support the `history` mode, then forcefully set the `mode` value to `hash`. Then, based on the value of `mode`, choose which mode `vue-router` will use.

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
      this.history = new HTML5History(this, options.base)
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

The constructor calls the method `createMatcher` to create the route matching object, and in `createMatcher` it calls the actual method `createRouteMap` to create the route mapping table. It can be said that the function of the `createMatcher` function is to create the route mapping table, and then use closure to allow the `addRoutes` and `match` functions to use several objects of the route mapping table, and finally return a `Matcher` object.

```javascript
// dev/src/create-matcher.js line 16
export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
  const { pathList, pathMap, nameMap } = createRouteMap(routes) // Create route mapping table

  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
  }
```

```javascript
function match ( // Route matching
  raw: RawLocation,
  currentRoute?: Route,
  redirectedFrom?: Location
): Route {
  const location = normalizeLocation(raw, currentRoute, false, router) // location is an object, similar to {"_normalized":true,"path":"/","query":{},"hash":""}
  const { name } = location

  if (name) { // If there is a route name, perform nameMap mapping
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
  } else if (location.path) { // If the route is configured with a path, match the route record in pathList and PathMap
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

function redirect ( // Handle redirect
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
}
```

```javascript
const re: Object = redirect
const {name, path} = re
let {query, hash, params} = location
query = re.hasOwnProperty('query') ? re.query : query
hash = re.hasOwnProperty('hash') ? re.hash : hash
params = re.hasOwnProperty('params') ? re.params : params

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

function alias (  // Process aliases
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

function _createRoute (  // Create route
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
  return createRoute(record, location, redirectedFrom, router) // Create route object
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
    if (route.alias !== undefined) { // If the route has an alias, add a route record for the alias
    const aliases = Array.isArray(route.alias) ? route.alias : [route.alias]
    for (let i = 0; i < aliases.length; ++i) {
      const alias = aliases[i]
      if (process.env.NODE_ENV !== 'production' && alias === path) {
        warn(
          false,
          `Found an alias with the same value as the path: "${path}". You have to remove that alias. It will be ignored in development.`
        )
        // skip in dev to make it work
        continue
      }

      const aliasRoute = {
        path: alias,
        children: route.children
      }
      addRouteRecord(
        pathList,
        pathMap,
        nameMap,
        aliasRoute,
        parent,
        record.path || '/' // matchAs
      )
    }
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record
    } else if (process.env.NODE_ENV !== 'production' && !matchAs) {
      warn(
        false,
        `Duplicate named routes definition: ` +
          `{ name: "${name}", path: "${record.path}" }`
      )
    }
  }
}

    process.env.NODE_ENV !== 'production' &&
      assert(
        install.installed,
        `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
          `before creating root instance.`
      )

    this.apps.push(app)
```

```javascript
// set up app destroyed handler
// https://github.com/vuejs/vue-router/issues/2639
app.$once('hook:destroyed', () => {
  // clean out app from this.apps array once destroyed
  const index = this.apps.indexOf(app)
  if (index > -1) this.apps.splice(index, 1)
  // ensure we still have a main app or null if no apps
   // we do not release the router so it can be reused
  if (this.app === app) this.app = this.apps[0] || null

  if (!this.app) this.history.teardown()
})

// main app previously initialized
// return as we don't need to set up new history listeners
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
    history.setupListeners() // Initialize and add event listeners
    handleInitialScroll(routeOrError)
  }
  history.transitionTo( // If it's the default page, activate the corresponding route based on the current browser address bar path or hash
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
```

```javascript
transitionTo (
  location: RawLocation,
  onComplete?: Function,
  onAbort?: Function
) {
  let route
  // catch redirect option https://github.com/vuejs/vue-router/issues/3201
  try {
    route = this.router.match(location, this.current) // // 获取匹配的路由信息
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
      this.ensureURL() // URL update implemented by subclasses, for hash mode, it updates the hash value
      this.router.afterHooks.forEach(hook => {
        hook && hook(route, prev)
      })

      // fire ready cbs once
      if (!this.ready) {
        this.ready = true
        this.readyCbs.forEach(cb => {
          cb(route)
        })
      }
    },
    err => {
      if (onAbort) {
        onAbort(err)
      }
      if (err && !this.ready) {
        // Initial redirection should not mark the history as ready yet
        // because it's triggered by the redirection instead
        // https://github.com/vuejs/vue-router/issues/3225
        // https://github.com/vuejs/vue-router/issues/3331
        if (!isNavigationFailure(err, NavigationFailureType.redirected) || prev !== START) {
          this.ready = true
          this.readyErrorCbs.forEach(cb => {
            cb(err)
          })
        }
      }
    }
  )
}
```

```javascript
confirmTransition (route: Route, onComplete: Function, onAbort?: Function) {
  const current = this.current
  this.pending = route
  const abort = err => {
    // changed after adding errors with
    // https://github.com/vuejs/vue-router/pull/3047 before that change,
    // redirect and aborted navigation would produce an err == null
    if (!isNavigationFailure(err) && isError(err)) {
      if (this.errorCbs.length) {
        this.errorCbs.forEach(cb => {
          cb(err)
        })
      } else {
        warn(false, 'uncaught error during route navigation:')
        console.error(err)
      }
    }
    onAbort && onAbort(err)
  }
  const lastRouteIndex = route.matched.length - 1
  const lastCurrentIndex = current.matched.length - 1
  if (
    isSameRoute(route, current) && // If it's the same route, don't navigate
    // in the case the route map has been dynamically appended to
    lastRouteIndex === lastCurrentIndex &&
    route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
  ) {
    this.ensureURL()
    return abort(createNavigationDuplicatedError(current, route))
  }

  const { updated, deactivated, activated } = resolveQueue( // Compare routes to resolve reusable components, components to be rendered, and deactivated components
    this.current.matched,
    route.matched
  )

  const queue: Array<?NavigationGuard> = [].concat( // Navigation guard array
    // in-component leave guards
    extractLeaveGuards(deactivated),  // Deactivated component hooks
    // global before hooks
    this.router.beforeHooks, // Global beforeEach hooks
    // in-component update hooks
    extractUpdateHooks(updated), // Called when the current route changes but the component is reused
    // in-config enter guards
    activated.map(m => m.beforeEnter), // Enter guard hooks for components to be rendered
    // async components
    resolveAsyncComponents(activated) // Resolve asynchronous route components
  )
```

```javascript
const iterator = (hook: NavigationGuard, next) => {
  if (this.pending !== route) { // If the routes are not equal, do not switch the route
    return abort(createNavigationCancelledError(current, route))
  }
  try {
    hook(route, current, (to: any) => { // Only when the 'next' in the hook function is executed, will the next hook function be executed. Otherwise, the navigation will be paused. The following logic is to determine the parameter in the 'next()' function.
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
}
// ...
}

// dev/src/history/hash.js line 10
export class HashHistory extends History {
  constructor (router: Router, base: ?string, fallback: boolean) {
    super(router, base)
    // check history fallback deeplinking
    if (fallback && checkFallback(this.base)) {
      return
    }
    ensureSlash()
  }

  // this is delayed until the app mounts
  // to avoid the hashchange listener being fired too early
  setupListeners () { // This will be delayed until the app mounts to avoid triggering the hashchange listener too early
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
  const current = this.current
  if (!ensureSlash()) {
    return
  }
  this.transitionTo(getHash(), (route) => {
    if (supportsScroll) {
      handleScroll(this.router, route, current, true)
    }
    if (!supportsPushState) {
      replaceHash(route.fullPath)
    }
  })
}
const eventType = supportsPushState ? 'popstate' : 'hashchange'
window.addEventListener(eventType, handleRoutingEvent)
this.listeners.push(() => {
  window.removeEventListener(eventType, handleRoutingEvent)
})
}

push(location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this
  this.transitionTo(
    location,
    (route) => {
      pushHash(route.fullPath)
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    },
    onAbort
  )
}

replace(location: RawLocation, onComplete?: Function, onAbort?: Function) {
  const { current: fromRoute } = this
  this.transitionTo(
    location,
    (route) => {
      replaceHash(route.fullPath)
      handleScroll(this.router, route, fromRoute, false)
      onComplete && onComplete(route)
    },
    onAbort
  )
}

go(n: number) {
  window.history.go(n)
}

ensureURL(push?: boolean) {
  const current = this.current.fullPath
  if (getHash() !== current) {
    push ? pushHash(current) : replaceHash(current)
  }
}

getCurrentLocation() {
  return getHash()
}
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://router.vuejs.org/
https://github.com/DDFE/DDFE-blog/issues/9
https://juejin.im/post/6844903647378145294
https://juejin.im/post/6844904062698127367
https://juejin.im/post/6844904018519523335
https://juejin.im/post/6844904012630720526
https://blog.csdn.net/zlingyun/article/details/83536589
https://ustbhuangyi.github.io/vue-analysis/v2/vue-router/install.html#vue-use
https://liyucang-git.github.io/2019/08/15/vue-router%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/
```