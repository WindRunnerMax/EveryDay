# Vue-Cli4与Vue-Cli2区别浅谈

> 当时学习 Vue-Cli 的时候看的是 Vue-Cli2 的相关教程，当把 package.json 上传 github 的时候提醒有安全问题，于是准备使用最新版的 Vue-Cli ，我一直认为才更新到 Vue-Cli3，没想到都到Vue-Cli4了  
> 可能有很多特性在 Vue-Cli3 时就有了，做个笔记记录一下

## 创建工程
`Vue-Cli4`文档推荐以下两种方式创建项目

```shell
vue create my-project
# OR
vue ui # 可视化操作
```
如果仍然需要使用`vue init webpack`初始化项目的话，则需要安装`cli-init`，但是拉取的仍然是`Vue-Cli2.0`版本

```powershell
npm install -g @vue/cli-init
```

## 启动服务
`Vue-Cli4`中使用`npm run serve`运行开发模式，其配置为

```javascript
"scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build"
  }
```
也可以使用`vue ui`进行可视化操作

## 浏览器兼容
`package.json`文件里的`browserslist`字段 (或一个单独的`.browserslistrc`文件)，指定了项目的目标浏览器的范围。这个值会被`@babel/preset-env`和`Autoprefixer`用来确定需要转译的`JavaScript`特性和需要添加的`CSS`浏览器前缀。查阅 [此处](https://github.com/ai/browserslist) 了解如何指定浏览器范围

## 代码拆分

```javascript
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.https://cli.vuejs.org/zh/guide/html-and-static-assets.html#preload
    /* webpackChunkName: "about" */
```

`vue-router`提供了一个`About`组件示例，为此路由生成单独的块，访问路由时延迟加载，可参阅 [Prefetch与Preload](https://cli.vuejs.org/zh/guide/html-and-static-assets.html#preload)

## 配置相关
`Vue-Cli4`没有了配置`webpack`的`config`与`build`目录，配置由`vue.config.js`定义，`vue.config.js`文件定义于根目录，相关配置信息参阅 [Webpack配置](https://cli.vuejs.org/zh/guide/webpack.html#%E7%AE%80%E5%8D%95%E7%9A%84%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F)
### 配置代理

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
