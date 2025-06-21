# 初探富文本之OT协同实例
在前边初探富文本之`OT`协同算法一文中我们探讨了为什么需要协同、为什么仅有原子化的操作并不能实现协同、为什么要有操作变换、如何进行操作变换、什么时候能够应用操作、服务端如何进行协同调度等等，这些属于完成协同所需要了解的基础知识，实际上当前有很多成熟的协同实现，例如`ot.js`、`ShareDB`、`ot-json`、`EasySync`等等，本文就是以`ShareDB`为`OT`协同框架来实现协同的实例。

## 描述
接入协同框架实际上并不是一件简单的事情，尤其是对于`OT`实现的协同算法而言，`OT`的英文全称是`Operational Transformation`，也就是说实现`OT`的基础就是对内容的描述与操作是`Operational`原子化的。在富文本领域，最经典的`Operation`有`quill`的`delta`模型，通过`retain`、`insert`、`delete`三个操作完成整篇文档的描述与操作，还有`slate`的`JSON`模型，通过`insert_text`、`split_node`、`remove_text`等等操作来完成整篇文档的描述与操作。

有了这个协同实现的基础之后，还需要对所有`Op`具体实现变换`Transformation`，这就是个比较麻烦的工作了，而且也是必不可少的实现。同样是以`quill`与`slate`两款开源编辑器为例，在`quill`中已经实现了对于其数据结构`delta`的所有`Transformation`，可以直接调用官方的`quill-delta`包即可。对于`slate`而言，官方只提供了原子化的操作`API`，并没有`Transformation`的具体实现，但是有社区维护的`slate-ot`包实现了其`JSON`数据的`Transformation`，也可以直接调用即可。

`OT`协同的实现在富文本领域有比较多的实现可供参考，特别是在开源的富文本引擎上，其实现方案还是比较成熟的，但是引申一下，在其他领域可能并没有具体的实现，那么就需要参考接入的文档自己实现了。例如我们有一个自研的思维导图功能需要实现协同，而保存的数据结构都是自定义的，没有直接可以调用的实现方案，那么这就需要自己实现操作变换了，对于一个思维导图而言我们实现原子化的操作还是比较容易的，所以我们主要关注于变换的实现。

假如这个思维导图功能我们是通过`JSON`的数据结构保存的数据，那么我们就可以参考`json0`或者`slate-ot`的实现，特别是通过阅读单元测试可以比较容易地理解具体的功能，通过参考其实现来自行实现一份`OT`的变换，或者直接依照其实现维护一个中间层的数据结构，依照于这个中间层进行数据转换。再假如我们的思维导图维护的是一个线性的类文本结构，那么就可以参考`rich-text`与`quill-delta`的实现，只不过这样的话实现原子化的操作可能就麻烦一些了，当然同样我们也可以维护一个中间层的数据结构来完成`OT`。

实际上有比较多的参考之后，接入`OT`协同就主要是理解并且实现的问题了，这样就有一个大体的实现方向了，而不是毫无头绪不知道应该从哪里开始做协同。另外还是那个宗旨，合适的才是最好的，要考虑到实现的成本问题，没有必要硬套数据结构的实现。就比如上边说的实现思维导图使用线性的文本来表示还是有点牵强的，当然并不是不可能的，比如`Google Docs`的`Table`就是完全的线性结构，要知道其是可以实现表格中嵌套表格的，相当于每一个单元格都是一篇文档，内部可以嵌入任何的富文本结构，而在实现上就是通过线性的结构完成的。

或许上边的`json0`和`rich-text`等概念可能一时间让人难以理解，所以下面的`Counter`与`Quill`两个实例就是介绍了如何使用`sharedb`实现协同，以及`json0`和`rich-text`究竟完成了什么样的工作，当然具体的`API`调用还是还是需要看`sharedb`的文档。本文只涉及到最基本的协同操作，所有的代码都在`https://github.com/WindRunnerMax/Collab`中，注意这是个`pnpm`的`workspace monorepo`项目，要注意使用`pnpm`安装依赖。

## Counter
首先我们运行一个基础的协同实例`Counter`，实现的主要功能是在多个客户端可以`+1`的情况下我们可以维护同一份计数器总数，该实例的地址是`https://github.com/WindrunnerMax/Collab/tree/master/packages/ot-counter`，首先简单看一下目录结构(`tree --dirsfirst -I node_modules`):

```
ot-counter
├── public
│   ├── favicon.ico
│   └── index.html
├── server
│   ├── index.ts
│   └── types.d.ts
├── src
│   ├── client.ts
│   ├── counter.tsx
│   └── index.tsx
├── babel.config.js
├── package.json
├── rollup.config.js
├── rollup.server.js
└── tsconfig.json
```

先简略说明下各个文件夹和文件的作用，`public`存储了静态资源文件，在客户端打包时将会把内容移动到`build`文件夹。`server`文件夹中存储了`OT`服务端的实现，在运行时同样会编译为`js`文件放置于`build`文件夹下，`src`文件夹是客户端的代码，主要是视图与`OT`客户端的实现。`babel.config.js`是`babel`的配置信息，`rollup.config.js`是打包客户端的配置文件，`rollup.server.js`是打包服务端的配置文件，`package.json`与`tsconfig.json`大家都懂，就不赘述了。

首先我们需要了解一下`json0`，乍眼一看`json0`确实不容易知道这是个啥，实际上这是`sharedb`默认携带的类型，`sharedb`提供了很多处理操作的机制。例如我们前边提到的服务端对于`Op`原子操作的调度，但没有提供转换操作的实际实现，因为业务的复杂性，必然会导致将要操作的数据结构的复杂性，于是转换和处理操作实际上是委托到业务自行实现的，在`sharedb`中称为`OT Types`。

`OT Types`实际上相当于定义了一系列的接口，而要在`sharedb`中注册类型必须实现这些接口，而这些实现就是我们需要实现的`OT`操作变换，例如需要实现的`transform`函数`transform(op1, op2, side) -> op1'`，则必须满足`apply(apply(snapshot, op1), transform(op2, op1, 'left')) == apply(apply(snapshot, op2), transform(op1, op2, 'right'))`，由此来保证变换的最终一致性。再比如`compose`函数`compose(op1, op2) -> op`，就必须满足`apply(apply(snapshot, op1), op2) == apply(snapshot, compose(op1, op2))`，具体的文档与要求可以参考`https://github.com/ottypes/docs`。

上边的这个实现看起来就很麻烦，乍眼一看还有公式，看起来对于数学上还有些要求。实现操作变换虽然本质上就是索引的转换，通过转换索引位置以确保收敛，但是要自己写还是需要些时间的，所幸在开源社区已经有很多的实现可以提供参考。在`sharedb`中也附带一个了默认类型`json0`，通过`json0`这个`JSON OT`类型可用于编辑任意`JSON`文档，实际上不光是`JSON`文档，我们的计数器也就是使用`json0`来实现的，毕竟在这里计数器也是只需要通过借助`JSON`的一个字段就可以实现的。回到`json0`支持以下操作：

* 在列表中插入/删除/移动/替换项目。
* 对象插入/删除/替换。
* 原子数值加法运算。
* 嵌入任意子类型。
* 嵌入式字符串编辑，使用`text0 OT`类型作为子类型。

`json0`也是一种可逆类型，也就是说所有的操作都有一个逆操作，可以撤销原来的操作。但其并不完美，其不能实现对象移动，设置为`NULL`，在列表中高效地插入多个项目。此外也可以看一下`json1`的实现，其实现了`json0`的超集，解决了`json0`的一些问题。其实看是否可以支持某些操作，直接看其文档中是不是有定义的操作就可以了，比如本例子中需要实现的计数器，就需要`{p:[path], na:x}`这个`Op`，将`x`添加到`[path]`处的数字，具体的文档可以参考`https://github.com/ottypes/json0`。

接下来我们来看看服务端的实现，主要实现是实例化`ShareDB`并且通过通过`collection`与`id`获取文档实例，在文档就绪之后触发回调启动`HTTP`服务器，在这里如果不存在的文档就需要初始化，注意在这里初始化的数据就是客户端订阅时获得的数据。实例中具体的`API`就不介绍了，可以参考`https://share.github.io/sharedb/api/`，在这里主要是描述一下其功能。当然在这里只是非常简单的实现，真正的生产环境肯定是需要接入路由、数据库等功能的。

```js
const backend = new ShareDB(); // `ShareDB`服务端实例

function start(callback: () => void) {
  const connection = backend.connect(); // 连接到`ShareDB`
  const doc = connection.get("ot-example", "counter"); // 通过`collection`与`id`获取`Doc`实例
  doc.fetch(err => {
    if (err) throw err;
    if (doc.type === null) { // 如果不存在
      doc.create({ num: 0 }, callback); // 创建初始文档然后触发回调
      return;
    }
    callback(); // 触发回调
  });
}

function server() {
  const app = express(); // 实例化`express`
  app.use(express.static("build")); // 客户端打包过后的静态资源路径
  const server = http.createServer(app); // 创建`HTTP`服务器

  const wss = new WebSocket.Server({ server: server });
  wss.on("connection", ws => {
    const stream = new WebSocketJSONStream(ws);
    backend.listen(stream); // `ShareDB`后端需要`Stream`实例
  });

  server.listen(3000);
  console.log("Listening on http://localhost:3000");
}

start(server);
```

在客户端方面主要是定义了一个定义了一个共用的链接，通过`collection`与`id`来获取的获取了文档的实例，也就是上面我们在服务端创建的那个文档，之后我们通过订阅文档的快照以及监听`Op`事件，来操作数据，在这里我们没有直接操作数据，而是所有的操作都走的`client`，这种方式就不需要考虑原子化操作的问题了，如果类似于我们下边的`Quill`的实例的话，就需要监听文档的变化来实现了，在完整的实现了原子化操作的情况下，这种方案更加合适。

```js
export type ClientCallback = (num: number) => void;

class Connection {
  private connection: sharedb.Connection;

  constructor() {
    // 通过`WebSocket`连接到`ShareDB`
    const socket = new ReconnectingWebSocket("ws://localhost:3000");
    this.connection = new sharedb.Connection(socket as Socket);
  }

  bind(cb: ClientCallback) {
    const doc = this.connection.get("ot-example", "counter"); // 通过`collection`与`id`获取`Doc`实例
    const onSubscribe = () => cb(doc.data.num); // 初始化数据的回调
    doc.subscribe(onSubscribe); // 订阅初始化数据
    const onOpExec = () => cb(doc.data.num); // 触发`Op`的回调
    doc.on("op", onOpExec); // 订阅`Op`事件 // 客户端或服务器的`Op`都会触发
    return {
      increase: () => {
        doc.submitOp([{ p: ["num"], na: 1 }]); // `json0`的`Op`操作 // 此处为`{ num: 0 }`增加了`1`
      },
      unbind: () => {
        doc.off("op", onOpExec); // 取消事件监听
        doc.unsubscribe(onSubscribe); // 取消订阅
        doc.destroy(); // 销毁文档
      },
    };
  }

  destroy() {
    this.connection.close(); // 关闭链接
  }
}
```

## Quill
接下来我们运行一个富文本的实例`Quill`，实现的主要功能是在`quill`富文本编辑器中接入协同，并支持编辑光标的同步，该实例的地址是`https://github.com/WindrunnerMax/Collab/tree/master/packages/ot-quill`。首先简单看一下目录结构(`tree --dirsfirst -I node_modules`):

```
ot-quill
├── public
│   └── favicon.ico
├── server
│   ├── index.ts
│   └── types.d.ts
├── src
│   ├── client.ts
│   ├── index.css
│   ├── index.ts
│   ├── quill.ts
│   └── types.d.ts
├── package.json
├── rollup.config.js
├── rollup.server.js
└── tsconfig.json
```

依旧简略说明下各个文件夹和文件的作用，`public`存储了静态资源文件，在客户端打包时将会把内容移动到`build`文件夹，`server`文件夹中存储了`OT`服务端的实现，在运行时同样会编译为`js`文件放置于`build`文件夹下，`src`文件夹是客户端的代码，主要是视图与`OT`客户端的实现，`rollup.config.js`是打包客户端的配置文件，`rollup.server.js`是打包服务端的配置文件，`package.json`与`tsconfig.json`大家都懂，就不赘述了。

`quill`的数据结构并不是`JSON`而是`Delta`，`Delta`是通过`retain`、`insert`、`delete`三个操作完成整篇文档的描述与操作，那么这样我们就不能使用`json0`来对数据结构进行描述了，我们需要使用新的`OT`类型`rich-text`，`rich-text`的具体的实现是在官方的`quill-delta`中实现的，具体可以参考`https://www.npmjs.com/package/rich-text`与`https://www.npmjs.com/package/quill-delta`。

```js
ShareDB.types.register(richText.type); // 注册`rich-text`类型
const backend = new ShareDB({ presence: true, doNotForwardSendPresenceErrorsToClient: true }); // `ShareDB`服务端实例

function start(callback: () => void) {
  const connection = backend.connect(); // 连接到`ShareDB`
  const doc = connection.get("ot-example", "quill"); // 通过`collection`与`id`获取`Doc`实例
  doc.fetch(err => {
    if (err) throw err;
    if (doc.type === null) { // 如果不存在
      doc.create([{ insert: "OT Quill" }], "rich-text", callback); // 创建初始文档然后触发回调
      return;
    }
    callback();
  });
}

function server() {
  const app = express(); // 实例化`express`
  app.use(express.static("build")); // 客户端打包过后的静态资源路径
  app.use(express.static("node_modules/quill/dist")); // `quill`的静态资源路径
  const server = http.createServer(app); // 创建`HTTP`服务器

  const wss = new WebSocket.Server({ server: server });
  wss.on("connection", function (ws) {
    const stream = new WebSocketJSONStream(ws);
    backend.listen(stream); // `ShareDB`后端需要`Stream`实例
  });

  server.listen(3000);
  console.log("Listening on http://localhost:3000");
}

start(server);
```

在客户端主要分为了三部分，分别是实例化`quill`的实例，实例化`ShareDB`的客户端实例，以及`quill`与`ShareDB`客户端通信的实现。在`quill`的实现中主要是将`quill`实例化，注册光标的插件，随机生成`id`的方法，以及通过`id`获取随机颜色的方法。在`ShareDB`的客户端操作中主要是注册了`rich-text OT`类型，并且实例化了客户端与服务端的`ws`链接。在`quill`与`ShareDB`客户端通信的实现中，主要是完成了对于`quill`与`doc`的事件监听，主要是`Op`与`Cursor`相关的实现。

```js
Quill.register("modules/cursors", QuillCursors); // 注册光标插件

export default new Quill("#editor", { // 实例化`quill`
  theme: "snow",
  modules: { cursors: true },
});

const COLOR_MAP: Record<string, string> = {}; // `id => color`

export const getRandomId = () => Math.floor(Math.random() * 10000).toString(); // 随机生成用户`id`

export const getCursorColor = (id: string) => { // 根据`id`获取颜色
  COLOR_MAP[id] = COLOR_MAP[id] || tinyColor.random().toHexString();
  return COLOR_MAP[id];
};
```

```js
const collection = "ot-example";
const id = "quill";

class Connection {
  public doc: sharedb.Doc<Delta>;
  private connection: sharedb.Connection;

  constructor() {
    sharedb.types.register(richText.type); // 注册`rich-text`类型
    // 通过`WebSocket`连接到`ShareDB`
    const socket = new ReconnectingWebSocket("ws://localhost:3000");
    this.connection = new sharedb.Connection(socket as Socket);
    this.doc = this.connection.get(collection, id); // 通过`collection`与`id`获取`Doc`实例
  }

  getDocPresence() {
    // 订阅来自其他客户端的在线状态信息
    return this.connection.getDocPresence(collection, id);
  }

  destroy() {
    this.doc.destroy(); // 销毁文档
    this.connection.close(); // 关闭链接
  }
```

```js
const presenceId = getRandomId(); // 生成随机`id`
const doc = client.doc; // 获取`doc`实例

const userNode = document.getElementById("user") as HTMLInputElement;
userNode && (userNode.value = "User: " + presenceId); // 显示当前用户

doc.subscribe(err => { // 订阅`doc`的初始化
  if (err) {
    console.log("DOC SUBSCRIBE ERROR", err);
    return;
  }
  const cursors = quill.getModule("cursors"); // 获取光标模块
  quill.setContents(doc.data); // 初始化`doc`数据

  quill.on("text-change", (delta, oldDelta, source) => { // 订阅编辑器变化
    if (source !== "user") return; // 非当前用户操作不提交
    doc.submitOp(delta); // 提交操作
  });

  doc.on("op", (op, source) => { // 订阅`Op`变化
    if (source) return; // 当前用户操作则返回
    quill.updateContents(op as unknown as Delta); // 服务端的`Op`更新本地内容
  });

  const presence = client.getDocPresence(); // 订阅其他客户端状态
  presence.subscribe(error => { // 订阅错误信息
    if (error) console.log("PRESENCE SUBSCRIBE ERROR", err);
  });
  const localPresence = presence.create(presenceId); // 创建本地的状态

  quill.on("selection-change", (range, oldRange, source) => { // 选区发生变化
    if (source !== "user") return; // 不是当前用户则返回
    if (!range) return; // 没有`Range`则返回
    localPresence.submit(range, error => { // 本地的状态来提交选区`Range`
      if (error) console.log("LOCAL PRESENCE SUBSCRIBE ERROR", err);
    });
  });

  presence.on("receive", (id, range) => { // 订阅收到状态的回调
    const color = getCursorColor(id); // 获取颜色
    const name = "User: " + id; // 拼装名字
    cursors.createCursor(id, name, color); // 创建光标
    cursors.moveCursor(id, range); // 移动光标
  });
});
```

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <https://github.com/ottypes/docs>
- <https://share.github.io/sharedb/>
- <https://github.com/share/sharedb>
- <https://www.npmjs.com/package/ot-json0>
- <https://www.npmjs.com/package/ot-json1>
- <https://zhuanlan.zhihu.com/p/481370601>
- <https://zhuanlan.zhihu.com/p/425265438>
- <https://www.npmjs.com/package/rich-text>
- <https://www.npmjs.com/package/quill-delta>


