# Vue路由Hash模式分析
`Vue-router`是`Vue`的核心组件，主要是作为`Vue`的路由管理器，`Vue-router`默认`hash`模式，即使用`URL`的`Hash`来模拟一个完整的`URL`，当`URL`改变时页面不会重新加载。

## 描述
`Hash`符号即`#`原本的目的是用来指示`URL`中指示网页中的位置，例如`https://www.example.com/index.html#print`即代表`example`的`index.html`的`print`位置，浏览器读取这个`URL`后，会自动将`print`位置滚动至可视区域，通常使用`<a>`标签的`name`属性或者`<div>`标签的`id`属性指定锚点。  
通过`window.location.hash`属性能够读取锚点位置，可以为`Hash`的改变添加`hashchange`监听事件，每一次改变`Hash`，都会在浏览器的访问历史中增加一个记录，此外`Hash`虽然出现在`URL`中，但不会被包括在`HTTP`请求中，即`#`及之后的字符不会被发送到服务端进行资源或数据的请求，其是用来指导浏览器动作的，对服务器端没有效果，因此改变`Hash`不会重新加载页面。  
`Vue-router`的作用就是通过改变`URL`，在不重新请求页面的情况下，更新页面视图，从而动态加载与销毁组件，简单的说就是，虽然地址栏的地址改变了，但是并不是一个全新的页面，而是之前的页面某些部分进行了修改，这也是`SPA`单页应用的特点，其所有的活动局限于一个`Web`页面中，非懒加载的页面仅在该`Web`页面初始化时加载相应的`HTML`、`JavaScript`、`CSS`文件，一旦页面加载完成，`SPA`不会进行页面的重新加载或跳转，而是利用`JavaScript`动态的变换`HTML`，默认`Hash`模式是通过锚点实现路由以及控制组件的显示与隐藏来实现类似于页面跳转的交互。

## 分析
`Vue-router`源码的实现比较复杂，会处理各种兼容问题与异常以及各种条件分支，文章分析比较核心的代码部分，精简过后的版本，重要部分做出注释，`commit id`为`560d11d`。  

首先是在定义`Router`时调用`Vue.use(VueRouter)`，此时会调用`VueRouter`类上的静态方法，即`VueRouter.install = install`，`install`模块主要是保证`Vue-router`只被`use`一次，以及通过`mixin`在`Vue`的生命周期`beforeCreate`内注册实例，在`destroyed`内销毁实例，还有定义`$router`与`$route`属性为只读属性以及`<router-view>`与`<router-link>`全局组件的注册。

```javascript
// dev/src/install.js line 6
export function install (Vue) {
  if (install.installed && _Vue === Vue) return
  install.installed = true // 保证 Vue-router 只被 use 一次

  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  Vue.mixin({
    beforeCreate () { // 注册实例
      if (isDef(this.$options.router)) { // this.$options.router 来自于 VueRouter 的实例化 // 判断实例是否已经挂载
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this) // // 调用 VueRouter 的 init 方法
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this // 将组件的 _routerRoot 都指向根 Vue 实例
      }
      registerInstance(this, this)
    },
    destroyed () { // 销毁实例 即挂载undefined
      registerInstance(this)
    }
  })

  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })

  Vue.component('RouterView', View) // 注册全局组件 <router-view>
  Vue.component('RouterLink', Link) // 注册全局组件 <router-link>

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```

之后是`VueRouter`对象的构造函数，主要是先获取`mode`的值，如果`mode`的值为`history`但是浏览器不支持`history`模式,那么就强制设置`mode`值为`hash`，接下来根据`mode`的值，来选择`vue-router`使用哪种模式。

```javascript
// dev/src/index.js line 40
constructor (options: RouterOptions = {}) {
  this.app = null
  this.apps = []
  this.options = options
  this.beforeHooks = []
  this.resolveHooks = []
  this.afterHooks = []
  this.matcher = createMatcher(options.routes || [], this) // 创建路由匹配对象

  let mode = options.mode || 'hash'
  this.fallback =
    mode === 'history' && !supportsPushState && options.fallback !== false // 检车兼容
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
      this.history = new HashHistory(this, options.base, this.fallback) // 实例化Hash模式
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

在构造函数中调用了创建路由匹配对象的方法`createMatcher`，而在`createMatcher`中又调用了实际用以创建路由映射表的方法`createRouteMap`，可以说`createMatcher`函数的作用就是创建路由映射表，然后通过闭包的方式让`addRoutes`和`match`函数能够使用路由映射表的几个对象，最后返回一个`Matcher`对象。

```javascript
// dev/src/create-matcher.js line 16
export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
  const { pathList, pathMap, nameMap } = createRouteMap(routes) // 创建路由映射表

  function addRoutes (routes) {
    createRouteMap(routes, pathList, pathMap, nameMap)
  }

  function match ( // 路由匹配
    raw: RawLocation,
    currentRoute?: Route,
    redirectedFrom?: Location
  ): Route {
    const location = normalizeLocation(raw, currentRoute, false, router) // location 是一个对象，类似于 {"_normalized":true,"path":"/","query":{},"hash":""}
    const { name } = location

    if (name) { // 如果有路由名称 就进行nameMap映射
      const record = nameMap[name]  // nameMap[name] = 路由记录
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
    } else if (location.path) { // 如果路由配置了path，到pathList和PathMap里匹配到路由记录 
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

  function redirect ( // 处理重定向
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

  function alias ( // 处理别名
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

  function _createRoute (  // 创建路由
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
}

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
  const pathList: Array<string> = oldPathList || [] // 创建映射表
  // $flow-disable-line
  const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
  // $flow-disable-line
  const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)

  routes.forEach(route => { // 遍历路由配置，为每个配置添加路由记录
    addRouteRecord(pathList, pathMap, nameMap, route)
  })

  // ensure wildcard routes are always at the end
  for (let i = 0, l = pathList.length; i < l; i++) { // 确保通配符在最后
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

function addRouteRecord ( // 添加路由记录
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>,
  route: RouteConfig,
  parent?: RouteRecord,
  matchAs?: string
) {
  const { path, name } = route // 获得路由配置下的属性
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

  if (typeof route.caseSensitive === 'boolean') {
    pathToRegexpOptions.sensitive = route.caseSensitive
  }

  const record: RouteRecord = { // 生成记录对象
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
    route.children.forEach(child => { // 递归路由配置的 children 属性，添加路由记录
      const childMatchAs = matchAs
        ? cleanPath(`${matchAs}/${child.path}`)
        : undefined
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
  }

  if (!pathMap[record.path]) { // 如果有多个相同的路径，只有第一个起作用，后面的会被忽略
    pathList.push(record.path)
    pathMap[record.path] = record
  }

  if (route.alias !== undefined) { // 如果路由有别名的话，给别名也添加路由记录
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
```

在上文的构造函数中实例化的`HashHistory`对象就是对于`Hash`模式下的路由的处理，主要是通过继承`History`对象以及自身实现的方法完成路由，以及针对于不支持`history api`的兼容处理，以及保证默认进入的时候对应的`Hash`值是以`/`开头的，如果不是则替换。在初始化`VueRouter`时调用的`init`方法调用了路由切换以及调用了`setupListeners`方法实现了路由的切换的监听回调，注意此时并没有在`HashHistory`对象的构造函数中直接添加事件监听，这是为了修复`vuejs/vue-router#725`的问题，简要来说就是说如果在`beforeEnter`这样的钩子函数中是异步的话，`beforeEnter`钩子就会被触发两次，原因是因为在初始化的时候如果此时的`hash`值不是以`/`开头的话就会补上`#/`，这个过程会触发`hashchange`事件，所以会再走一次生命周期钩子，也就意味着会再次调用`beforeEnter`钩子函数。

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
        history.setupListeners() // 初始化添加事件监听
        handleInitialScroll(routeOrError)
      }
      history.transitionTo( // 如果默认页，需要根据当前浏览器地址栏里的 path 或者 hash 来激活对应的路由
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
      route = this.router.match(location, this.current) // // 获取匹配的路由信息
    } catch (e) {
      this.errorCbs.forEach(cb => {
        cb(e)
      })
      // Exception should still be thrown
      throw e
    }
    const prev = this.current
    this.confirmTransition( // 确认跳转
      route,
      () => {
        this.updateRoute(route) // 更新当前 route 对象
        onComplete && onComplete(route)
        this.ensureURL() // 子类实现的更新url地址 对于 hash 模式的话 就是更新 hash 的值
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
      isSameRoute(route, current) && // 如果是相同的路由就不跳转
      // in the case the route map has been dynamically appended to
      lastRouteIndex === lastCurrentIndex &&
      route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
    ) {
      this.ensureURL()
      return abort(createNavigationDuplicatedError(current, route))
    }

    const { updated, deactivated, activated } = resolveQueue( // 通过对比路由解析出可复用的组件，需要渲染的组件，失活的组件
      this.current.matched,
      route.matched
    )

    const queue: Array<?NavigationGuard> = [].concat( // 导航守卫数组
      // in-component leave guards
      extractLeaveGuards(deactivated),  // 失活的组件钩子
      // global before hooks
      this.router.beforeHooks, // 全局 beforeEach 钩子
      // in-component update hooks
      extractUpdateHooks(updated), // 在当前路由改变，但是该组件被复用时调用
      // in-config enter guards
      activated.map(m => m.beforeEnter), // 需要渲染组件 enter 守卫钩子
      // async components
      resolveAsyncComponents(activated) // 解析异步路由组件
    )

    const iterator = (hook: NavigationGuard, next) => {
      if (this.pending !== route) { // 路由不相等就不跳转路由
        return abort(createNavigationCancelledError(current, route))
      }
      try {
        hook(route, current, (to: any) => { // 只有执行了钩子函数中的next，才会继续执行下一个钩子函数，否则会暂停跳转，以下逻辑是在判断 next() 中的传参
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
  setupListeners () { // 初始化 这将延迟到mounts生命周期 以避免过早触发hashchange侦听器
    if (this.listeners.length > 0) {
      return
    }

    const router = this.router
    const expectScroll = router.options.scrollBehavior
    const supportsScroll = supportsPushState && expectScroll

    if (supportsScroll) {
      this.listeners.push(setupScroll())
    }

    const handleRoutingEvent = () => {
      const current = this.current
      if (!ensureSlash()) {
        return
      }
      this.transitionTo(getHash(), route => {
        if (supportsScroll) {
          handleScroll(this.router, route, current, true)
        }
        if (!supportsPushState) {
          replaceHash(route.fullPath)
        }
      })
    }
    const eventType = supportsPushState ? 'popstate' : 'hashchange'
    window.addEventListener(
      eventType,
      handleRoutingEvent
    )
    this.listeners.push(() => {
      window.removeEventListener(eventType, handleRoutingEvent)
    })
  }

  push (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(
      location,
      route => {
        pushHash(route.fullPath)
        handleScroll(this.router, route, fromRoute, false)
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  replace (location: RawLocation, onComplete?: Function, onAbort?: Function) {
    const { current: fromRoute } = this
    this.transitionTo(
      location,
      route => {
        replaceHash(route.fullPath)
        handleScroll(this.router, route, fromRoute, false)
        onComplete && onComplete(route)
      },
      onAbort
    )
  }

  go (n: number) {
    window.history.go(n)
  }

  ensureURL (push?: boolean) {
    const current = this.current.fullPath
    if (getHash() !== current) {
      push ? pushHash(current) : replaceHash(current)
    }
  }

  getCurrentLocation () {
    return getHash()
  }
}
```




## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://router.vuejs.org/zh/
https://github.com/DDFE/DDFE-blog/issues/9
https://juejin.im/post/6844903647378145294
https://juejin.im/post/6844904062698127367
https://juejin.im/post/6844904018519523335
https://juejin.im/post/6844904012630720526
https://blog.csdn.net/zlingyun/article/details/83536589
https://ustbhuangyi.github.io/vue-analysis/v2/vue-router/install.html#vue-use
https://liyucang-git.github.io/2019/08/15/vue-router%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90/
```
