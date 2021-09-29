# uniapp小程序迁移到TS
我一直在做的小程序就是 [山科小站](https://github.com/WindrunnerMax/SHST) 也已经做了两年了，目前是用`uniapp`构建的，在这期间也重构好几次了，这次在鹅厂实习感觉受益良多，这又得来一次很大的重构，虽然小程序功能都是比较简单的功能，但是这好不容易实习学到的东西得学以致用，那就继续在小程序上动手吧哈哈。这次实习收获最大倒不是怎么迁移到`TS`，而是一些组件设计的概念以及目录结构设计上的东西，不过这都是在之后重写组件的时候要做的东西了。回到正题，小程序是用`uniapp`写的，毕竟还是比较熟悉`Vue`语法的，这次迁移首先是要将小程序从`HBuilderX`迁移到`cli`版本，虽然用`HBuilderX`确实是有一定的优点，但是拓展性比较差，这些东西还是得自己折腾折腾，迁移到`cli`版本完成后，接下来就是要慢慢从`js`过渡到`ts`了，虽然是`Vue2`对`ts`支持相对比较差，但是至少对于抽离出来的逻辑是可以写成`ts`的，可以在编译期就避免很多错误，另外自己使用`cli`创建可以搞一些其他功能，毕竟只要不操作`DOM`的话一般还是在用常用的`js`方法，例如可以尝试接入`Jest`单元测试等。

## 迁移到cli版本
首先要迁移到`cli`版本，虽然 [官网](https://uniapp.dcloud.net.cn/quickstart-hx) 上说明了如何新建一个`cli`版本的`uniapp`，但是其中还是有很多坑的。  
首先在安装依赖的时候`npm`和`yarn`是没有问题的，但是用`pnpm`安装依赖的会出现无法编译的情况，多般测试也没有结果，像是内部有一个异常，然后被`uniapp`编写的`webpack`插件给捕捉了，并且没有向外抛出异常信息，这就很难受，本来一直是用`pnpm`去管理包，现在只能是使用`yarn`去管理整个项目了，另外我想使用软连接`mklink -J`做一个中心包存储也失败了，插件生成的`dist`文件夹的位置很奇怪，导致打包的时候寻找文件夹路径失败，也最终导致编译失败，所以想用`uniapp`的`cli`的话，还是只能按部就班地来，不能搞些骚操作。  
首先安装全局安装`vue-cli`:

```shell
$ npm install -g @vue/cli
```

创建项目`project`: 

```shell
$ npm install -g @vue/cli
```

之后就要选择版本了，要选择`TypeScript`的默认模板，这样就不需要自己去配置例如`tsconfig.json`这种的了。在之后就需要将之前的代码移动到新的目录的`src`目录下，当然诸如`.editorconfig`这些配置文件还是要迁移出来放置在根目录下的，如果没有配置一些插件例如`sass`的话，现在小程序可能能够运行了，如果还安装了其他插件，那就特别是要注意依赖问题，因为`uniapp`写的这些插件有的是挺老的依赖，所以需要安装老版本插件去兼容。

## 安装插件
上边说到了直接`yarn install -D xxx`可能会出现问题，比如我就遇到了`sass`和`webpack`版本不兼容问题，另外`eslint`和`prettier`这些规范代码的插件也是需要安装的，另外还有`eslint`的`ts parser`和插件等等，在这里我已经直接配好了，在`VS Code`中能够正常运行起来，另外还配置了`lint-staged`等，这里直接给予`package.json`的信息，有这个文件当然就能够直接启动一个正常的能够编译的`uniapp-typescript`模板了，如果还需要其他插件的话就需要自己尝试了。

```json
{
  "name": "shst",
  "version": "3.6.0",
  "private": true,
  "scripts": {
    "serve": "npm run dev:h5",
    "build": "npm run build:h5",
    "build:app-plus": "cross-env NODE_ENV=production UNI_PLATFORM=app-plus vue-cli-service uni-build",
    "build:custom": "cross-env NODE_ENV=production uniapp-cli custom",
    "build:h5": "cross-env NODE_ENV=production UNI_PLATFORM=h5 vue-cli-service uni-build",
    "build:mp-360": "cross-env NODE_ENV=production UNI_PLATFORM=mp-360 vue-cli-service uni-build",
    "build:mp-alipay": "cross-env NODE_ENV=production UNI_PLATFORM=mp-alipay vue-cli-service uni-build",
    "build:mp-baidu": "cross-env NODE_ENV=production UNI_PLATFORM=mp-baidu vue-cli-service uni-build",
    "build:mp-kuaishou": "cross-env NODE_ENV=production UNI_PLATFORM=mp-kuaishou vue-cli-service uni-build",
    "build:mp-qq": "cross-env NODE_ENV=production UNI_PLATFORM=mp-qq vue-cli-service uni-build",
    "build:mp-toutiao": "cross-env NODE_ENV=production UNI_PLATFORM=mp-toutiao vue-cli-service uni-build",
    "build:mp-weixin": "cross-env NODE_ENV=production UNI_PLATFORM=mp-weixin vue-cli-service uni-build",
    "build:quickapp-native": "cross-env NODE_ENV=production UNI_PLATFORM=quickapp-native vue-cli-service uni-build",
    "build:quickapp-webview": "cross-env NODE_ENV=production UNI_PLATFORM=quickapp-webview vue-cli-service uni-build",
    "build:quickapp-webview-huawei": "cross-env NODE_ENV=production UNI_PLATFORM=quickapp-webview-huawei vue-cli-service uni-build",
    "build:quickapp-webview-union": "cross-env NODE_ENV=production UNI_PLATFORM=quickapp-webview-union vue-cli-service uni-build",
    "dev:app-plus": "cross-env NODE_ENV=development UNI_PLATFORM=app-plus vue-cli-service uni-build --watch",
    "dev:custom": "cross-env NODE_ENV=development uniapp-cli custom",
    "dev:h5": "cross-env NODE_ENV=development UNI_PLATFORM=h5 vue-cli-service uni-serve",
    "dev:mp-360": "cross-env NODE_ENV=development UNI_PLATFORM=mp-360 vue-cli-service uni-build --watch",
    "dev:mp-alipay": "cross-env NODE_ENV=development UNI_PLATFORM=mp-alipay vue-cli-service uni-build --watch",
    "dev:mp-baidu": "cross-env NODE_ENV=development UNI_PLATFORM=mp-baidu vue-cli-service uni-build --watch",
    "dev:mp-kuaishou": "cross-env NODE_ENV=development UNI_PLATFORM=mp-kuaishou vue-cli-service uni-build --watch",
    "dev:mp-qq": "cross-env NODE_ENV=development UNI_PLATFORM=mp-qq vue-cli-service uni-build --watch",
    "dev:mp-toutiao": "cross-env NODE_ENV=development UNI_PLATFORM=mp-toutiao vue-cli-service uni-build --watch",
    "dev:mp-weixin": "cross-env NODE_ENV=development UNI_PLATFORM=mp-weixin vue-cli-service uni-build --watch",
    "dev:quickapp-native": "cross-env NODE_ENV=development UNI_PLATFORM=quickapp-native vue-cli-service uni-build --watch",
    "dev:quickapp-webview": "cross-env NODE_ENV=development UNI_PLATFORM=quickapp-webview vue-cli-service uni-build --watch",
    "dev:quickapp-webview-huawei": "cross-env NODE_ENV=development UNI_PLATFORM=quickapp-webview-huawei vue-cli-service uni-build --watch",
    "dev:quickapp-webview-union": "cross-env NODE_ENV=development UNI_PLATFORM=quickapp-webview-union vue-cli-service uni-build --watch",
    "info": "node node_modules/@dcloudio/vue-cli-plugin-uni/commands/info.js",
    "serve:quickapp-native": "node node_modules/@dcloudio/uni-quickapp-native/bin/serve.js",
    "test:android": "cross-env UNI_PLATFORM=app-plus UNI_OS_NAME=android jest -i",
    "test:h5": "cross-env UNI_PLATFORM=h5 jest -i",
    "test:ios": "cross-env UNI_PLATFORM=app-plus UNI_OS_NAME=ios jest -i",
    "test:mp-baidu": "cross-env UNI_PLATFORM=mp-baidu jest -i",
    "test:mp-weixin": "cross-env UNI_PLATFORM=mp-weixin jest -i"
  },
  "dependencies": {
    "@dcloudio/uni-app-plus": "^2.0.0-32220210818002",
    "@dcloudio/uni-h5": "^2.0.0-32220210818002",
    "@dcloudio/uni-helper-json": "*",
    "@dcloudio/uni-i18n": "^2.0.0-32220210818002",
    "@dcloudio/uni-mp-360": "^2.0.0-32220210818002",
    "@dcloudio/uni-mp-alipay": "^2.0.0-32220210818002",
    "@dcloudio/uni-mp-baidu": "^2.0.0-32220210818002",
    "@dcloudio/uni-mp-kuaishou": "^2.0.0-32220210818002",
    "@dcloudio/uni-mp-qq": "^2.0.0-32220210818002",
    "@dcloudio/uni-mp-toutiao": "^2.0.0-32220210818002",
    "@dcloudio/uni-mp-vue": "^2.0.0-32220210818002",
    "@dcloudio/uni-mp-weixin": "^2.0.0-32220210818002",
    "@dcloudio/uni-quickapp-native": "^2.0.0-32220210818002",
    "@dcloudio/uni-quickapp-webview": "^2.0.0-32220210818002",
    "@dcloudio/uni-stat": "^2.0.0-32220210818002",
    "@vue/shared": "^3.0.0",
    "core-js": "^3.6.5",
    "flyio": "^0.6.2",
    "regenerator-runtime": "^0.12.1",
    "vue": "^2.6.11",
    "vue-class-component": "^6.3.2",
    "vue-property-decorator": "^8.0.0",
    "vuex": "^3.2.0"
  },
  "devDependencies": {
    "@babel/plugin-syntax-typescript": "^7.2.0",
    "@babel/runtime": "~7.12.0",
    "@dcloudio/types": "*",
    "@dcloudio/uni-automator": "^2.0.0-32220210818002",
    "@dcloudio/uni-cli-shared": "^2.0.0-32220210818002",
    "@dcloudio/uni-migration": "^2.0.0-32220210818002",
    "@dcloudio/uni-template-compiler": "^2.0.0-32220210818002",
    "@dcloudio/vue-cli-plugin-hbuilderx": "^2.0.0-32220210818002",
    "@dcloudio/vue-cli-plugin-uni": "^2.0.0-32220210818002",
    "@dcloudio/vue-cli-plugin-uni-optimize": "^2.0.0-32220210818002",
    "@dcloudio/webpack-uni-mp-loader": "^2.0.0-32220210818002",
    "@dcloudio/webpack-uni-pages-loader": "^2.0.0-32220210818002",
    "@typescript-eslint/eslint-plugin": "^4.30.0",
    "@typescript-eslint/parser": "^4.30.0",
    "@vue/cli-plugin-babel": "~4.5.0",
    "@vue/cli-plugin-typescript": "*",
    "@vue/cli-service": "~4.5.0",
    "babel-plugin-import": "^1.11.0",
    "cross-env": "^7.0.2",
    "eslint": "^7.32.0",
    "eslint-config-prettier": "^8.3.0",
    "eslint-plugin-prettier": "^4.0.0",
    "eslint-plugin-vue": "^7.17.0",
    "jest": "^25.4.0",
    "lint-staged": "^11.1.2",
    "mini-types": "*",
    "miniprogram-api-typings": "*",
    "postcss-comment": "^2.0.0",
    "prettier": "^2.3.2",
    "sass": "^1.38.2",
    "sass-loader": "10",
    "typescript": "^4.4.2",
    "vue-eslint-parser": "^7.10.0",
    "vue-template-compiler": "^2.6.11"
  },
  "browserslist": [
    "Android >= 4",
    "ios >= 8"
  ],
  "uni-app": {
    "scripts": {}
  },
  "gitHooks": {
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,vue,ts}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

## 迁移到TS
其实本来是想写一些遇到的坑，然后发现之前迁移的过程中没跟着写这个文章，导致都忘了，现在光记着这是个比较枯燥的体力活。  
对于`js`文件，迁移还是相对比较简单的，主要是把类型搞清楚，对于`api`调用，参数的类型`uniapp`都已经给搞好了，可以看看`@dcloudio/types`下定义的类型，类型搞不好的可以考虑`Parameters<T>`以及`as`，这个可以简单看看`src/modules/toast.ts`，如果参数数量不定，可以尝试一下泛型，对于这个可以简单看看`src/modules/datetime.ts`。迁移的过程中还是要首先关注最底层的`js`文件，例如`A.js`引用了`B.js`，那么肯定是要先更改`B.js`，然后再去处理`A.js`，要注意的是现在的`tsconfig.json`配置是严格模式，所以也会要求引入的文件为带类型声明的或者本身就是`ts`的，当然在`d.ts`中声明一下`declare module A.js`也不是不行。迁移的话首先可以将后缀直接改成`.ts`，然后用`eslint`的自动修正功能，先修正一个地方是一个地方，然后自己去修改类型，尽量别写`any`吧，虽然`TypeScript`又称`AnyScript`，但是还是尽量搞清楚类型，尤其是抽出`model`层后，带字段提示去写代码还是挺爽的，另外有一些关于类型的扩充以及全局`Mixin`等可以参考`sfc.d.ts`和`mixins.ts`。

```typescript
// src/modules/toast.ts
export const toast = (msg: string, time = 2000, icon = "none", mask = true): Promise<void> => {
    uni.showToast({
        title: msg,
        icon: icon as Parameters<typeof uni.showToast>[0]["icon"],
        mask: mask,
        duration: time,
    });
    return new Promise(resolve => setTimeout(() => resolve(), time));
};
```

```typescript
// src/modules/datetime.ts
export function safeDate(): Date;
export function safeDate(date: Date): Date;
export function safeDate(timestamp: number): Date;
export function safeDate(dateTimeStr: string): Date;
export function safeDate(
    year: number,
    month: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
): Date;
export function safeDate(
    p1?: Date | number | string,
    p2?: number,
    p3?: number,
    p4?: number,
    p5?: number,
    p6?: number,
    p7?: number
): Date | never {
    if (p1 === void 0) {
        // 无参构建
        return new Date();
    } else if (p1 instanceof Date || (typeof p1 === "number" && p2 === void 0)) {
        // 第一个参数为`Date`或者`Number`且无第二个参数
        return new Date(p1);
    } else if (typeof p1 === "number" && typeof p2 === "number") {
        // 第一和第二个参数都为`Number`
        return new Date(p1, p2, p3, p4, p5, p6, p7);
    } else if (typeof p1 === "string") {
        // 第一个参数为`String`
        return new Date(p1.replace(/-/g, "/"));
    }
    throw new Error("No suitable parameters");
}
```

在`Vue`文件中编写`TS`就比较要命了，实际上有两种编写方式，一种是`Vue.extend`的方式，另一种就是装饰器的方式，这里就是主要参考的`https://www.jianshu.com/p/39261c02c6db`，我个人还是比较倾向于装饰器的方式的，但是在小程序写组件时使用装饰器经常会出现一个`prop`类型不匹配的`warning`，不影响使用，另外无论是哪种方式都还是会有断层的问题，这个算是`Vue2`当时的设计缺陷，毕竟那时候`TS`并不怎么流行。

### 装饰器

| 装饰器 | 用途 |    描述 |
|---|---|---|
| `Component` | 声明`class`组件 | 只要是个组件都必须加该装饰器 |
| `Prop` | 声明`props` | 对应普通组件声明中的`props`属性 |
| `Watch` | 声明监听器 | 对应普通组件声明中的`watch`属性 |
| `Mixins` | 混入继承 | 对应普通组件声明中的`mixins`属性 |
| `Emit` | 子组件向父组件值传递 | 对应普通`this.$emit()` |
| `Inject` | 接收祖先组件传递的值 | 对应普通组件声明中的`inject`属性 |
| `Provide` | 祖先组件向其所有子孙后代注入一个依赖 | 对应普通组件声明中的`provide`属性 |

### Vue生命周期

```vue
<script>
export default {
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeDestroy() {},
  destroyed() {},
  errorCaptured() {}
}
</script>

<!-- -------------------------------------------------- -->

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class App extends Vue {
  beforeCreate() {}
  created() {}
  beforeMount() {}
  mounted() {}
  beforeUpdate() {}
  updated() {}
  activated() {}
  deactivated() {}
  beforeDestroy() {}
  destroyed() {}
  errorCaptured() {}
}
</script>
```

### Component

```vue
<script>
import HelloWorld from "./hello-world.vue";
export default {
  components: {
    HelloWorld
  }
}
</script>

<!-- -------------------------------------------------- -->

<script lang="ts">
import HelloWorld from "./hello-world.vue";
import { Component, Vue } from "vue-property-decorator";

// `Vue`实例的所有属性都可以在`Component`编写 例如`filters`
@Component({
  components: {
    HelloWorld
  }
})
export default class App extends Vue {}
</script>
```

### Prop

```vue
<script>
export default {
  props: {
    msg: {
      type: String,
      default: "Hello world",
      required: true,
      validator: (val) => (val.length > 2)
    }
  }
}
</script>

<!-- -------------------------------------------------- -->

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class HelloWorld extends Vue {
  @Prop({
    type: String,
    default: "Hello world",
    required: true,
    validator: (val) => (val.length > 2)
  }) msg!: string
}
</script>
```

### Data

```vue
<script>
export default {
  data() {
    return {
      hobby: "1111111"
    };
  }
}
</script>

<!-- -------------------------------------------------- -->

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class HelloWorld extends Vue {
  hobby: string = "1111111"
}
</script>
```

### Computed

```vue
<script>
export default {
  data() {
    return {
      hobby: "1111111"
    };
  },
  computed: {
    msg() {
      return this.hobby;
    }
  },
  mounted() {
    console.log(this.msg); // 1111111
  }
}
</script>

<!-- -------------------------------------------------- -->

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class HelloWorld extends Vue {
  hobby: string = "1111111"
  get msg() {
    return this.hobby;
  }
  mounted() {
    console.log(this.msg); // 1111111
  }
}
</script>
```

### Watch

```vue
<script>
export default {
  data() {
    return {
      value: ""
    };
  },
  watch: {
    value: {
      handler() {
        console.log(this.value);
      },
      deep: true,
      immediate: true
    }
  }
}
</script>

<!-- -------------------------------------------------- -->

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

@Component
export default class App extends Vue {
  value: string = "
  @Watch("value", { deep: true, immediate: true })
  valueWatch() {
    console.log(this.value);
  }
}
</script>
```

### Mixins

```vue
<script>
// info.js
export default {
  methods: {
    mixinsShow() {
      console.log("111");
    }
  }
}

// hello-world.vue
import mixinsInfo from "./info.js";
export default {
  mixins: [mixinsInfo],
  mounted() {
    this.mixinsShow(); // 111
  }
}
</script>

<!-- -------------------------------------------------- -->

<script lang="ts">
// info.ts
import { Component, Vue } from "vue-property-decorator";

@Component
export default class MixinsInfo extends Vue {
    mixinsShow() {
      console.log("111");
    }
}

// hello-world.vue
import { Component, Vue, Mixins } from "vue-property-decorator";
import mixinsInfo from "./info.ts";

@Component
export default class HelloWorld extends Mixins(mixinsInfo) {
  mounted() {
    this.mixinsShow(); // 111
  }
}
</script>
```

### Emit

```vue
<!-- children.vue -->
<template>
  <button @click="$emit("submit", "1")">提交</button>
</template>

<!-- parent.vue  -->
<template>
  <children @submit="submitHandle"/>
</template>

<script lang="ts">
import children from "./children.vue";
export default {
  components: {
    children
  },
  methods: {
    submitHandle(msg) {
      console.log(msg); // 1
    }
  }
}
</script>

<!-- -------------------------------------------------- -->

<!-- children.vue -->
<template>
  <button @click="submit">提交</button>
</template>

<script lang="ts">
import { Component, Vue, Emit } from "vue-property-decorator";

@Component
export default class Children extends Vue {
  @Emit()
  submit() {
    return "1"; // 当然不使用装饰器`@Emit`而使用`this.$emit`也是可以的
  }
}
</script>

<!-- parent.vue  -->
<template>
  <children @submit="submitHandle"/>
</template>

<script lang="ts">
import children from "./children.vue";
import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    children
  }
})
export default class Parent extends Vue {
  submitHandle(msg: string) {
    console.log(msg); // 1
  }
}
</script>
```

### Provide/Inject

```vue
<!-- children.vue -->
<script>
export default {
  inject: ["root"],
  mounted() {
    console.log(this.root.name); // aaa
  }
}
</script>

<!-- parent.vue  -->
<template>
  <children />
</template>
<script>
import children from "./children.vue";
export default {
  components: {
    children
  },
  data() {
    return {
      name: "aaa"
    };
  },
  provide() {
    return {
      root: this
    };
  }
}
</script>


<!-- -------------------------------------------------- -->

<!-- children.vue -->
<script lang="ts">
import { Component, Vue, Inject } from "vue-property-decorator";

@Component
export default class Children extends Vue {
  @Inject() root!: any
  mounted() {
    console.log(this.root.name); // aaa
  }
}
</script>

<!-- parent.vue  -->

<template>
  <children />
</template>

<script lang="ts">
import children from "./children.vue";
import { Component, Vue, Provide } from "vue-property-decorator";
@Component({
  components: {
    children
  }
})
export default class Parent extends Vue {
  name: string = "aaa"
  @Provide()
  root = this.getParent()
  getParent() {
    return this;
  }
}
</script>
```



### Vuex 

```typescript
// store/store.ts
import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import user from "./modules/user";

Vue.use(Vuex);
interface RootState {
  version: string;
}
const store: StoreOptions<RootState> = {
  strict: true,
  state: {
    version: "1.0.0"
  },
  modules: {
    user
  }
};

export default new Vuex.Store<RootState>(store);



// store/modules/user.ts
import { Module } from "vuex";
export interface UserInfo {
  uId: string;
  name: string;
  age: number;
}

interface UserState {
  userInfo: UserInfo;
}

const user: Module<UserState, any> = {
  namespaced: true,
  state: {
    userInfo: {
      uId: ",
      name: ",
      age: 0
    }
  },
  getters: {
    isLogin(state) {
      return !!state.userInfo.uId;
    }
  },
  mutations: {
    updateUserInfo(state, userInfo: UserInfo): void {
      Object.assign(state.userInfo, userInfo);
    }
  },
  actions: {
    async getUserInfo({ commit }): Promise<void> {
      let { userInfo } = await getUserInfo();
      commit("updateUserInfo", userInfo);
    }
  }
};

export default user;
```

### Vuex-method
```vue
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";
import { UserInfo } from "./store/modules/user";

@Component
export default class App extends Vue {
  @State("version") version!: string
  @State("userInfo", { namespace: "user" }) userInfo!: UserInfo
  @Getter("isLogin", { namespace: "user" }) isLogin!: boolean
  @Action("getUserInfo", { namespace: "user" }) getUserInfo!: Function
  mounted() {
    this.getUserInfo();
    console.log(this.version); // 1.0.0
  }
}

</script>
```



## 发布NPM组件
在`uniapp`中编写发布到`NPM`组件就比较要命了，我想将一些东西抽出来单独作为`NPM`组件使用，这样就可以多项目共用了，但是这里边坑是巨多，在这里主要是记录一下踩过的坑，真的是让人头秃。因为主要是在小程序端使用，跟`web`端不一样，必须编译成小程序能够识别的文件，但是`dcloud`目前并未提供这样的能力，所以只能编写最原始的`vue`组件。并且由于是`uniapp`做了很多插件的解析行为，有些东西甚至是直接固定写在代码里的，无法从外部改动，还有些出现错误的地方并没有将异常抛出而是直接吃掉，导致最后编译出来的文件为空但是控制台却没有什么提示，反正是踩了不少坑，这里主要是有三种方式去完成`NPM`组件发布，在这里全部是使用`https://github.com/WindrunnerMax/Campus`作为示例的。 

### 仅发布组件
首先是最简单的方式，类似于`https://github.com/WindrunnerMax/Campus/tree/master/src/components`，组件全部都是在`components`目录下完成的，那么我们可以直接在此处建立一个`package.json`文件，然后在此处将资源文件发布即可，这样就很简单了，在使用的时候直接引用即可，另外可以设置一下别名去引用，尝试过在`VSCode`里按`@`会有代码提示，所以可以加个`@`处理别名。

```shell
$ yarn add shst-campus-components
```

配置`vue.config.js`与`tsconfig.json`。
```javascript
// vue.config.js
const path = require("path");
module.exports = {
  transpileDependencies: ["shst-campus-components"],
    configureWebpack: {
        resolve: {
            alias: {
                "@": path.join(__dirname, "./src"),
                "@campus": path.join(__dirname, "./node_modules/shst-campus-components"),
            },
        },
    },
};
```

```javascript
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "paths": {
      "@/*": [
        "./src/*"
      ],
      "@campus/*": [
        "./node_modules/shst-campus-components/*"
      ]
    },
    // ...
}
```

使用组件库，具体请参考`https://github.com/WindrunnerMax/Campus`。

```javascript
// ...
import CCard from "@campus/c-card/c-card.vue";
// ...
```

### 编写webpack的loader和plugin
第二个方式就比较难顶了，当然现在我也是放弃了这个想法，不过还是记录一下，毕竟折腾了一天多实际上是做到了能够实现一个正常使用的方式了，但并不是很通用，主要是写的`loader`的正则匹配的场景覆盖不全，所以最终还是没有采用这个方式，本身一个并不麻烦的问题最后演变到了需要写一个`loader`去解决，是真的要命。首先我是想实现一个类似于`import { CCard } from "shst-campus"`这种引用方式的，看起来很眼熟，其实就是想参照`antd`或者同样也是`element-ui`的引入方式，所以实际上还是研究了一下他们的引入方式的，实际上是完成了`babel`插件，然后通过这个插件在引入的时候就编译成其他引入的语句，实际上前边举的例子默认类似于`import CCard from "shst-campus/lib/c-card"`，当然这个是可以配置的，使用`babel-plugin-import`和`babel-plugin-component`实现类似于按需加载的方式，首先我尝试了`babel-plugin-import`并且配置了相关的路径。

```javascript
// babel.config.js
const plugins = [];
// ...
plugins.push([
    "import",
    {
        libraryName: "shst-campus",
        customName: name => {
            return `shst-campus/src/components/${name}/index`;
        },
    },
    "shst-campus-import",
]);
// ...
module.exports = {
    // ...
    plugins,
};
```

想法是很美好的，我尝试进行编译，发现这个配置没有任何动静，也就是没有生效，我虽然很奇怪，但是想到这个是原本`uniapp`就自带的插件，所以可能配置会被吃掉或者被覆盖掉，所以我尝试了使用`babel-plugin-component`。


```javascript
// babel.config.js
const plugins = [];
// ...
plugins.push([
    "component",
    {
        libraryName: "shst-campus",
        libDir: "src/components",
        style: false,
    },
    "shst-campus-import",
]);
// ...
module.exports = {
    // ...
    plugins,
};
```

这次产生了实际效果，确实能做到按需引入了，我高兴地进行编译，编译通过了，然后打开微信开发者工具，发现报错了，然后发现那边`json`文件出现了一个错误，引入的组件未找到，在`json`文件里将引入的文件原封不动得放了进去，也就是`shst-campus/index`，这明显不是个组件，而且实际上大概率是因为使用的插件和原本的插件解析时间没有对上，`uniapp`的插件在前解析已经完成了，所以就很尴尬，我想着通过编写一个`webpack`插件去解决这个`json`的问题。

```javascript
export class UniappLoadDemandWebpackPlugin {
    constructor(options) {
        this.options = options || {};
    }
    apply(compiler) {
        compiler.hooks.emit.tapAsync("UniappLoadDemandWebpackPlugin", (compilation, done) => {
            Object.keys(compilation.assets).forEach(key => {
                if (/^\./.test(key)) return void 0;
                if (!/.*\.json$/.test(key)) return void 0;
                const root = "node-modules";
                const asset = compilation.assets[key];
                const target = JSON.parse(asset.source());
                if (!target.usingComponents) return void 0;
                Object.keys(target.usingComponents).forEach(componentsKey => {
                    const item = target.usingComponents[componentsKey];
                    if (item.indexOf("/" + root + "/" + this.options.libraryName) === 0) {
                        target.usingComponents[
                            componentsKey
                        ] = `/${root}/${this.options.libraryName}/${this.options.libDir}/${componentsKey}/index`;
                    }
                });
                compilation.assets[key] = {
                    source() {
                        return JSON.stringify(target);
                    },
                    size() {
                        return this.source().length;
                    },
                };
            });
            done();
        });
    }
}

/*
// vue.config.js
module.exports = {
    configureWebpack: {
        // ...
        plugins: [
            // ...
            new UniappLoadDemandWebpackPlugin({
                libraryName: "shst-campus",
                libDir: "src/components",
            }),
            // ...
        ],
        // ...
    },
};
*/
```

通过这个插件，我确实成功解决了`json`文件的组件引入问题，然后启动微信开发者工具，然后发现组件成功加载了，但是逻辑与样式全部丢失了，在我奇怪的时候我去查看了组件的编译情况，发现了组件根本没有编译成功，`js`与`css`都编译失败了，这就尴尬了，实际上在编译过程中`uniapp`的插件并没有抛出任何异常，相关的情况都被他内部吃掉了，然后我依旧是想通过编写`webpack`插件的形式去解决这个问题，尝试在`compiler`、`compilation`钩子中处理都没有解决这个问题，之后在`NormalModuleFactory`这个`Hook`中打印了一下发现，通过`babel-plugin-component`的处理，在这里的`source`已经被指定为想要的路径了，但是在`uniapp`编译的时候还是有问题的，然后我就在想`uniapp`处理这个相关的东西到底是有多早，之后尝试`JavascriptParser`钩子也没有成功处理，好家伙估计是在`babel`解析的时候就已经完成了，实际上他确实也有一个插件`@dcloudio/webpack-uni-mp-loader/lib/babel/util.js`，这里边后边还有坑。之后我又回到了`babel-plugin-import`这个插件，因为这个插件是`uniapp`的依赖中携带的处理插件，所以理论上在里边是用过这个插件的，之后我注意到他在`babel.config.js`里有一个处理`@dcloudio/uni-ui`的语句。

```javascript
process.UNI_LIBRARIES = process.UNI_LIBRARIES || ["@dcloudio/uni-ui"];
process.UNI_LIBRARIES.forEach(libraryName => {
    plugins.push([
        "import",
        {
            libraryName: libraryName,
            customName: name => {
                return `${libraryName}/lib/${name}/${name}`;
            },
        },
    ]);
});
```

那么我就想着我也写一个类似的，具体过程只是描述一下，首先之前我也是写了一个类似的声明，但是并没有生效，我尝试把自己的组件写到`process.UNI_LIBRARIES`然后发现竟然生效了，这让我很吃惊，想了想肯定是在`process.UNI_LIBRARIES`做了一些处理，然后我把这个稍微修改了一下，也就是在`process.UNI_LIBRARIES`中处理了以后也有`babel-plugin-import`插件处理，之后我启动了编译，发现依旧是那个问题，在那里边的文件无法成功编译，内容是空的，而且错误信息都被吃掉了，没有任何报错出来，好家伙要了命，而且他也影响到了`@dcloudio/uni-ui`的组件引用，这是我随便引用了一个组件发现的，这里边的组件也会变成空的，无法成功解析，并且在`json`文件中，对于我的文件的声明是`src/components`下的，他给我声明成了`lib`下的文件，然后我去看了看他的有一个`babel`的插件，里边有引用`@dcloudio/webpack-uni-mp-loader/lib/babel/util.js`，这里边的`process.UNI_LIBRARIES`的`source`处理是写死的，真的是要了亲命，所以要想处理好这个问题，必须提前处理`vue`文件的引用声明，因为直接写明`src/components`下的引用是没有问题的，而想在`uniapp`之前处理好这个问题，那么只能编写一个`loader`去处理了，我自行实现了一个正则去匹配`import`语句然后将`import`解析出来去处理完整的`path`。之后考虑到引用的复杂性，还是考虑去引用一个相对比较通用的解析库区实现`import`语句的解析而不只是通过正则表达式的匹配区完成这件事，然后使用`parse-imports`去完成这个`loader`。

```javascript
const transform = str => str.replace(/\B([A-Z])/g, "-$1").toLowerCase();
module.exports = function (source) {
    const name = this.query.name;
    if (!name) return source;
    const path = this.query.path || "lib";
    const main = this.query.main;
    return source.replace(
        // maybe use parse-imports to parse import statement
        new RegExp(
            `import[\\s]*?\\{[\\s]*?([\\s\\S]*?)[\\s]*?\\}[\\s]*?from[\\s]*?[""]${name}[""];?`,
            "g"
        ),
        function (_, $1) {
            let target = "";
            $1.split(",").forEach(item => {
                const transformedComponentName = transform(item.split("as")[0].trim());
                const single = `import { ${item} } from "${name}/${path}/${transformedComponentName}/${
                    main || transformedComponentName
                }";`;
                target = target + single;
            });
            return target;
        }
    );
};

/*
// vue.config.js
module.exports = {
    transpileDependencies: ["shst-campus"],
    configureWebpack: {
        resolve: {
            alias: {
                "@": path.join(__dirname, "./src"),
            },
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: "shst-campus/build/components-loader",
                    options: {
                        name: "shst-campus",
                        path: "src/components",
                        main: "index",
                    },
                },
            ],
        },
        plugins: [],
    },
};
*/
```


### 构建新目录并发布

最后就是准备采用的方案了，这个方案就是纯粹和`@dcloudio/uni-ui`的使用方案是相同的了，因为既然`uniapp`是写死的，那么我们就适应一下这个方式吧，就不再去做`loader`或者`plugin`去特殊处理插件了，将其作为一个规范就好，踩坑踩太多了，顶不住了，实际上我觉得使用`loader`去解决这个问题也还可以，但是毕竟实际上改动太大并且需要通用地适配，还是采用一个相对通用的方式吧，直接看他的`npm`包可以看到其组件的结构为`/lib/component/component`，那我们就可以写个脚本去处理并且可以构建完成后自动发布。现在就是在`dist/package`下生成了`index.js`作为引入的`main`，还有`index.d.ts`作为声明文件，还有`README.md`、`package.json`、`.npmrc`文件，以及符合上述目录结构的组件，主要都是一些文件操作，以及在`package.json`写好构建和发布的命令。可以对比`https://npm.runkit.com/shst-campus`和`https://github.com/WindrunnerMax/Campus`的文件差异，或者直接在`https://github.com/WindrunnerMax/Campus`运行一下`npm run build:package`即可在`dist/package`看到要发布的`npm`包。

```javascript
// utils.js
const { promisify } = require("util");
const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

module.exports.copyFolder = async (from, to) => {
    if (fs.existsSync(from)) {
        if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
        const files = fs.readdirSync(from, { withFileTypes: true });
        for (let i = 0; i < files.length; i++) {
            const item = files[i];
            const fromItem = path.join(from, item.name);
            const toItem = path.join(to, item.name);
            if (item.isFile()) {
                const readStream = fs.createReadStream(fromItem);
                const writeStream = fs.createWriteStream(toItem);
                readStream.pipe(writeStream);
            } else {
                fs.accessSync(path.join(toItem, ".."), fs.constants.W_OK);
                module.exports.copyFolder(fromItem, toItem);
            }
        }
    }
};

module.exports.execCMD = (cmdStr, cmdPath) => {
    const workerProcess = exec(cmdStr, { cwd: cmdPath });
    // 打印正常的后台可执行程序输出
    workerProcess.stdout.on("data", data => {
        process.stdout.write(data);
    });
    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on("data", data => {
        process.stdout.write(data);
    });
    // 退出之后的输出
    // workerProcess.on("close", code => {});
};

module.exports.fileExist = async location => {
    try {
        await promisify(fs.access)(location, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
};

module.exports.writeFile = (location, content, flag = "w+") => {
    return promisify(fs.writeFile)(location, content, { flag });
};

module.exports.readDir = dir => {
    return promisify(fs.readdir)(dir);
};

module.exports.fsStat = fullPath => {
    return promisify(fs.stat)(fullPath);
};

module.exports.copyFile = (from, to) => {
    // const readStream = fs.createReadStream(from);
    // const writeStream = fs.createWriteStream(to);
    // readStream.pipe(writeStream);
    return promisify(fs.copyFile)(from, to);
};
```

```javascript
// index.js
const path = require("path");
const { copyFolder, readDir, fsStat, writeFile, copyFile, fileExist } = require("./utils");

const root = process.cwd();
const source = root + "/src/components";
const target = root + "/dist/package";

const toClassName = str => {
    const tmpStr = str.replace(/-(\w)/g, (_, $1) => $1.toUpperCase()).slice(1);
    return str[0].toUpperCase() + tmpStr;
};

const start = async dir => {
    const components = [];
    console.log("building");

    console.log("copy components");
    const items = await readDir(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = await fsStat(fullPath);
        if (stats.isDirectory()) {
            if (/^c-/.test(item)) {
                components.push({ fileName: item, componentName: toClassName(item) });
            }
            copyFolder(fullPath, path.join(target, "/lib/", item));
        }
    }

    console.log("processing index.js");
    let indexContent = "";
    components.forEach(item => {
        indexContent += `import ${item.componentName} from "./lib/${item.fileName}/${item.fileName}.vue";\n`;
    });
    const exportItems = components.map(v => v.componentName).join(", ");
    indexContent += `export { ${exportItems} };\n`;
    indexContent += `export default { ${exportItems} };\n`;
    await writeFile(path.join(target, "/index.js"), indexContent);

    console.log("processing index.d.ts");
    let dtsContent = `import { Component } from "vue";\n\n`;
    components.forEach(item => {
        dtsContent += `declare const ${item.componentName}: Component;\n`;
    });
    await writeFile(path.join(target, "/index.d.ts"), dtsContent);

    console.log("processing .npmrc");
    const exist = await fileExist(path.join(target, "/.npmrc"));
    if (!exist) {
        const info = "registry=https://registry.npmjs.org/";
        await writeFile(path.join(target, "/.npmrc"), info);
    }

    console.log("processing README.md");
    await copyFile(path.join(root, "/README.md"), target + "/README.md");

    console.log("processing package.json");
    const originPackageJSON = require(path.join(root, "/package.json"));
    const targetJson = {
        ...originPackageJSON,
        repository: {
            type: "git",
            url: "https://github.com/WindrunnerMax/Campus",
        },
        scripts: {},
        author: "Czy",
        license: "MIT",
        dependencies: {
            "vue": "^2.6.11",
            "vue-class-component": "^6.3.2",
            "vue-property-decorator": "^8.0.0",
        },
        devDependencies: {},
    };
    await writeFile(path.join(target, "/package.json"), JSON.stringify(targetJson, null, "\t"));
};

start(source);
```

本来我想着用这种方案就可以了，之后又遇到了天坑环节，这次的坑是，使用按需引入的方式，即类似于`import { CCard } from "shst-campus";`这种形式，如果在本地`src`中写页面使用的是装饰器的写法的话，是不能正常编译`node_modules`里的组件的，无论`node_modules`里的组件是`TS`还是普通`vue`组件都会出现这样的情况，这个问题在上边写的博客里写了这就是个大坑，即编译出来的产物是没有`css`文件以及`js`文件只有一个`Component({})`，如果使用的是`Vue.extend`的写法的话，又是能够正常编译`node_modules`里的组件，当然本地`src`编写的组件如果没有使用`TS`的话是没有问题的，所以现在是有三种解决方案，其实终极大招是写一个`webpack loader`，这个我在博客中实现过，考虑到通用性才最终没使用，要是实在顶不住了就完善一下直接上`loader`，至于为什么要写`loader`而不只是写一个`plugin`也可以看看博客，天坑。
* `src`中组件使用装饰器写法，引入组件使用真实路径，即类似于`import CCard from "shst-campus/lib/c-card/c-card.vue";`。
* `src`中组件使用`Vue.extend`写法，可以使用按需引入，即类似于`import { CCard } from "shst-campus";`。
* `src`中组件使用这两种写法都可以，然后配置一下`uniapp`提供的`easycom`能力，之后可以直接使用组件不需要声明。

如果需要配置组件的按需引入，即类似于`import { CCard } from "shst-campus";`这种形式，需要修改`babel.config.js`文件。
```javascript
// babel.config.js
// ...
process.UNI_LIBRARIES = process.UNI_LIBRARIES || ["@dcloudio/uni-ui"];
process.UNI_LIBRARIES.push("shst-campus");
process.UNI_LIBRARIES.forEach(libraryName => {
    plugins.push([
        "import",
        {
            libraryName: libraryName,
            customName: name => {
                return `${libraryName}/lib/${name}/${name}`;
            },
        },
        libraryName,
    ]);
});
// ...
```

如果需要使用`easycom`的引入形式，那么需要配置`pages.json`。

```javascript
// pages.json
{
    "easycom": {
       "autoscan": true,
       "custom": {
            "^c-(.*)": "shst-campus/lib/c-$1/c-$1.vue"
       }
    },
    // ...
}
```

这是终极大招解决方案，在后来我抽时间使用`parse-imports`库完成了一个新的`loader`，兼容性应该还可以，另外这个库也挺坑的，是个`module`而没有打包成`commonjs`，这就导致最后我作为`loader`使用必须把所有的依赖都打到了一个`js`里，挺要命的，我准备使用这种方式去解决`uniapp`组件的坑了，也验证一下库的兼容性，如果使用按需加载的方式上边都可以忽略，只需要安装好依赖并且在`vue.config.js`中配置好就可以了。

```shell
$ yarn add -D uniapp-import-loader
```

```javascript
// vue.config.js
const path = require("path");

module.exports = {
    configureWebpack: {
        // ...
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    loader: "uniapp-import-loader", 
                    // import { CCard } from "shst-campus"; 
                    // => import CCard from "shst-campus/lib/c-card/c-card";
                    options: {
                        name: "shst-campus",
                        path: "lib",
                    },
                },
            ],
        },
        // ..
    },
};
```

```typescript
import parseImports from "parse-imports";

const transformName = (str: string): string => str.replace(/\B([A-Z])/g, "-$1").toLowerCase();
const buildImportStatement = (itemModules: string, itemFrom: string): string =>
    `import ${itemModules} from "${itemFrom}";\n`;

export const transform = (
    source: string,
    options: { name: string; path: string; main?: string }
): Promise<string> => {
    const segmentStartResult = /<script[\s\S]*?>/.exec(source);
    const scriptEndResult = /<\/script>/.exec(source);
    if (!segmentStartResult || !scriptEndResult) return Promise.resolve(source);
    const startIndex = segmentStartResult.index + segmentStartResult[0].length;
    const endIndex = scriptEndResult.index;
    const preSegment = source.slice(0, startIndex);
    const middleSegment = source.slice(startIndex, endIndex);
    const endSegment = source.slice(endIndex, source.length);
    return parseImports(middleSegment)
        .then(allImports => {
            let segmentStart = 0;
            let segmentEnd = 0;
            const target: Array<string> = [];
            for (const item of allImports) {
                if (item.isDynamicImport) continue;
                if (!item.moduleSpecifier.value || item.moduleSpecifier.value !== options.name) {
                    continue;
                }
                segmentEnd = item.startIndex;
                target.push(middleSegment.slice(segmentStart, segmentEnd));
                if (item.importClause && item.moduleSpecifier.value) {
                    const parsedImports: Array<string> = [];
                    if (item.importClause.default) {
                        parsedImports.push(
                            buildImportStatement(
                                item.importClause.default,
                                item.moduleSpecifier.value
                            )
                        );
                    }
                    item.importClause.named.forEach(v => {
                        parsedImports.push(
                            buildImportStatement(
                                v.binding, // as 会被舍弃 `${v.specifier} as ${v.binding}`,
                                `${options.name}/${options.path}/${transformName(v.specifier)}/${
                                    options.main || transformName(v.specifier)
                                }`
                            )
                        );
                    });
                    target.push(parsedImports.join(""));
                }
                segmentStart = item.endIndex;
            }
            target.push(middleSegment.slice(segmentStart, middleSegment.length));
            return preSegment + target.join("") + endSegment;
        })
        .catch((err: Error) => {
            console.error("uniapp-import-loader parse error", err);
            return source;
        });
};
```

```javascript
const { transform } = require("../dist/index");

// loader function
module.exports = function (source) {
    const name = this.query.name;
    if (!name) return source;
    const path = this.query.path || "lib";
    const main = this.query.main;
    const done = this.async();
    transform(source, { name, path, main }).then(res => {
        done(null, res);
    });
};
```

## BLOG

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://tslang.baiqian.ltd/
https://cn.eslint.org/docs/rules/
https://www.jianshu.com/p/39261c02c6db
https://www.zhihu.com/question/310485097
https://juejin.cn/post/6844904144881319949
https://uniapp.dcloud.net.cn/quickstart-cli
https://webpack.docschina.org/api/parser/#import
https://v4.webpack.docschina.org/concepts/plugins/
https://cloud.tencent.com/developer/article/1839658
https://jkchao.github.io/typescript-book-chinese/typings/migrating.html
```
