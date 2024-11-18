# A Brief Discussion on the Differences Between Vue-Cli4 and Vue-Cli2

> When I was learning Vue-Cli, I was following tutorials for Vue-Cli2. When I tried to upload my `package.json` to GitHub, I was alerted to a security issue. So, I decided to use the latest version of Vue-Cli. I always thought it was updated to Vue-Cli3, but to my surprise, it's already Vue-Cli4. There may be many features that were available in Vue-Cli3, but I'll make some notes about it.

## Project Creation
The `Vue-Cli4` documentation recommends the following two ways to create a project.

```shell
vue create my-project
# OR
vue ui # Visual operation
```

If you still need to use `vue init webpack` to initialize the project, you need to install `cli-init`, but it will still pull the `Vue-Cli2.0` version.

```powershell
npm install -g @vue/cli-init
```

## Starting the Service
In `Vue-Cli4`, use `npm run serve` to run the development mode, with the configuration as follows.

```javascript
"scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build"
  }
```

You can also use `vue ui` for visual operation.

## Browser Compatibility
The `browserslist` field in the `package.json` file (or a separate `.browserslistrc` file) specifies the range of target browsers for the project. This value is used by `@babel/preset-env` and `Autoprefixer` to determine the JavaScript features that need to be transpiled and the CSS browser prefixes that need to be added. Refer to [here](https://github.com/ai/browserslist) to learn how to specify the range of browsers.

## Code Splitting

```javascript
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.https://cli.vuejs.org/zh/guide/html-and-static-assets.html#preload
    /* webpackChunkName: "about" */
```

`vue-router` provides an `About` component example, generating a separate chunk for this route, which is lazy-loaded when the route is visited. Please refer to [Prefetch and Preload](https://cli.vuejs.org/zh/guide/html-and-static-assets.html#preload).

## Configuration Related
`Vue-Cli4` no longer has the `config` and `build` directories for configuring `webpack`. The configuration is defined by `vue.config.js`, which is located in the root directory. For related configuration information, refer to [Webpack Configuration](https://cli.vuejs.org/zh/guide/webpack.html#%E7%AE%80%E5%8D%95%E7%9A%84%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F).

### Proxy Configuration

```javascript
module.exports = {
    devServer: {
        proxy: {
            '/': {
                target: 'http://www.example.com',
                 ws: true,
                changeOrigin: true,
                pathRewrite: {}
            }
        }
    }
}
```