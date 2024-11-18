# A First Look at Rich Text OT Collaboration Example

In the previous article on exploring the Operational Transformation (OT) algorithm for rich text, we discussed why collaboration is necessary, why atomic operations alone cannot achieve collaboration, the need for operation transformation, how to perform operation transformation, when to apply operations, and how the server handles collaborative scheduling. These are the fundamental knowledge needed to achieve collaboration. In fact, there are many mature collaboration implementations available today, such as `ot.js`, `ShareDB`, `ot-json`, `EasySync`, and more. This article provides an example of using `ShareDB` as an OT collaboration framework to illustrate collaboration.

## Description
Incorporating a collaboration framework is not a simple task, especially when it comes to implementing the OT collaboration algorithm. The full name of 'OT' in English is 'Operational Transformation', which means that the basis of implementing 'OT' is the atomic description and operation of content. In the realm of rich text, the most classic 'Operation' includes the `delta` model used by `quill`, which describes and manipulates the entire document through three operations: `retain`, `insert`, and `delete`. There's also the `JSON` model used by `slate`, which achieves the description and manipulation of the entire document through operations such as `insert_text`, `split_node`, and `remove_text`. After establishing this foundation of collaboration implementation, it is necessary to specifically implement the transformation of all the 'Ops', which is a rather cumbersome but essential task. Taking the open-source editors `quill` and `slate` as examples, the specific implementation of transformations for their data structures, such as `delta` in `quill`, is already provided and can be directly called using the official `quill-delta` package. However, for `slate`, the official only provides an atomic operation `API` and lacks the specific implementation of transformation. Instead, the community-maintained `slate-ot` package has implemented the transformation of its `JSON` data, which can also be called directly.

In the realm of rich text, there are several collaborative implementations available for reference, especially in open-source rich text engines. The implementation solutions are relatively mature. However, expanding into other fields may not have specific implementations, which would then require referring to the documentation for self-implementation. For example, if we have a self-developed collaboration feature for a mind map that uses custom data structures, and there is no readily available implementation solution, then we would need to implement the operation transformation ourselves. For a mind map, it is relatively easy to implement atomic operations, so our main focus would be on the implementation of transformation. If our mind map maintains data using a `JSON` data structure, then we can refer to the implementation of `json0` or `slate-ot`, especially by reading the unit tests, which can facilitate an easier understanding of the specific functionality. By referencing their implementations, we can implement an 'OT' transformation ourselves, or maintain an intermediate data structure layer to perform data transformation based on this intermediate layer. Alternatively, if our mind map maintains a linear text-like structure, we can refer to the implementations of `rich-text` and `quill-delta`. However, implementing atomic operations in this case may be more challenging. Nevertheless, we can still maintain an intermediate data structure to achieve 'OT'. After referencing multiple sources, incorporating OT collaboration primarily revolves around understanding and implementation, providing a general direction for implementation, rather than being clueless about where to start. Furthermore, the guiding principle is that the most suitable approach is the best; one should consider the cost of implementation. There is no need to rigidly enforce the implementation of data structures. For instance, representing a mind map using a linear text structure, as mentioned earlier, may be quite a stretch. Nonetheless, it is not impossible. For example, `Google Docs`'s `Table` is a completely linear structure, capable of nesting tables within tables where each cell is like a document that can embed any rich text structure. Such complex functionality is achieved through a linear structure.

The concepts of `json0` and `rich-text` mentioned earlier might be difficult to grasp at first, so the following `Counter` and `Quill` examples demonstrate how to use `ShareDB` to implement collaboration, as well as what kind of work `json0` and `rich-text` actually accomplish. However, for specific API calls, refer to the `ShareDB` documentation. This article only covers the most basic collaborative operations, and all the code is available at `https://github.com/WindrunnerMax/Collab`. Note that this is a 'pnpm' workspace monorepo project, so be sure to install dependencies using 'pnpm'.

## Counter
First, let's run a basic collaborative example called 'Counter', where the main functionality is to maintain a total counter that multiple clients can increment by '1'. The address of this example is `https://github.com/WindrunnerMax/Collab/tree/master/packages/ot-counter`. First, let's take a quick look at the directory structure (`tree --dirsfirst -I node_modules`):

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

First, let's briefly explain the role of each folder and file. The `public` folder stores static resource files, and its contents will be moved to the `build` folder when the client is packaged. The `server` folder stores the implementation of the `OT` server, which will be compiled into `js` files and placed in the `build` folder at runtime. The `src` folder contains the client code, mainly for the views and the `OT` client implementation. The `babel.config.js` contains the configuration information for `babel`, while `rollup.config.js` is the configuration file for packaging the client, and `rollup.server.js` is the configuration file for packaging the server. As for `package.json` and `tsconfig.json`, I believe everyone is familiar with them, so I won't go into detail.

First, let's understand `json0`. At first glance, it's not easy to know what `json0` is all about. In reality, it's the default type carried by `sharedb`. `sharedb` provides many mechanisms for handling operations, such as the server's scheduling of atomic operations for `Op` as mentioned earlier. However, it doesn't provide the actual implementation of transformation operations. Due to the complexity of business, it inevitably leads to the complexity of the data structure to operate on. Therefore, the transformation and processing operations are actually delegated for businesses to implement on their own, called `OT Types` in `sharedb`.

`OT Types` actually defines a series of interfaces, and to register a type in `sharedb`, these interfaces must be implemented. These implementations are the `OT` operation transformations that we need to implement, such as the `transform` function `transform(op1, op2, side) -> op1'`. It must satisfy `apply(apply(snapshot, op1), transform(op2, op1, 'left')) == apply(apply(snapshot, op2), transform(op1, op2, 'right'))` to ensure the final consistency of the transformation. For example, the `compose` function `compose(op1, op2) -> op` must satisfy `apply(apply(snapshot, op1), op2) == apply(snapshot, compose(op1, op2))`. Specific documentation and requirements can be found at `https://github.com/ottypes/docs`.

This implementation may seem cumbersome at first glance, with even some formulas, which may seem to have some requirements for mathematics. Although the essence of implementing operation transformation is just transforming indices to ensure convergence, it still takes some time to write it by yourself. Fortunately, there are already many implementations available for reference in the open-source community. `sharedb` also comes with a default type `json0`, which uses the `JSON OT` type to edit any `JSON` document. In fact, not only `JSON` documents, but our counter also uses `json0` for implementation, as the counter here only needs to be implemented with the help of a field in `JSON`. Going back to `json0`, it supports the following operations:

- Insert/delete/move/replace items in a list.
- Insert/delete/replace objects.
- Atomic addition of numerical values.
- Embedding any subtypes.
- Embedded string editing using the `text0 OT` type as a subtype.

`json0` is also a reversible type, which means that all operations have an inverse operation that can undo the original operation. However, it is not perfect, as it cannot implement object movement, setting to `NULL`, and efficiently inserting multiple items in a list. In addition, you can also take a look at the implementation of `json1`, which is a superset of `json0` and solves some of the problems that `json0` has. To see if certain operations are supported, you can simply check if they are defined in the documentation. For example, for the counter implementation in this example, you need the `{p:[path], na:x}` `Op` to add `x` to the number at `[path]`. Specific documentation can be found at `https://github.com/ottypes/json0`.

Next, let's take a look at the server-side implementation. The main implementation is to instantiate `ShareDB` and to get a document instance through the `collection` and `id`. After the document is ready, a callback is triggered to start the HTTP server. If the document does not exist at this point, it needs to be initialized, and the data initialized here is the data obtained when the client subscribes. We won't go into the specific API of the instance here, you can refer to `https://share.github.io/sharedb/api/` for details. The main point here is to describe its functionality. Of course, this is just a very simple implementation here. In a real production environment, it will definitely need to integrate features such as routing and databases.

```js
const backend = new ShareDB(); // `ShareDB` server instance

function start(callback: () => void) {
  const connection = backend.connect(); // Connect to `ShareDB`
  const doc = connection.get("ot-example", "counter"); // Get `Doc` instance through `collection` and `id`
  doc.fetch(err => {
    if (err) throw err;
    if (doc.type === null) { // If it doesn't exist
      doc.create({ num: 0 }, callback); // Create initial document and trigger callback
      return;
    }
    callback(); // Trigger callback
  });
}
```

```javascript
function server() {
  const app = express(); // Instantiation of 'express'
  app.use(express.static("build")); // Path to the static resources after client-side packaging
  const server = http.createServer(app); // Creating an HTTP server

  const wss = new WebSocket.Server({ server: server });
  wss.on("connection", ws => {
    const stream = new WebSocketJSONStream(ws);
    backend.listen(stream); // 'ShareDB' backend requires a 'Stream' instance
  });

  server.listen(3000);
  console.log("Listening on http://localhost:3000");
}

start(server);
```

On the client side, we mainly establish a shared connection, obtaining the document instance through the 'collection' and 'id' to access the document created on the server. Subsequently, we subscribe to the document snapshot and listen for 'Op' events to manipulate data. In this case, we do not directly manipulate the data; instead, all operations are performed through the 'client'. This approach eliminates the need to consider atomic operations. For instances like the 'Quill' example mentioned below, it is necessary to listen for document changes. Within a complete atomic operation implementation, this approach is more suitable.

```javascript
export type ClientCallback = (num: number) => void;

class Connection {
  private connection: sharedb.Connection;

  constructor() {
    // Connect to 'ShareDB' via 'WebSocket'
    const socket = new ReconnectingWebSocket("ws://localhost:3000");
    this.connection = new sharedb.Connection(socket as Socket);
  }

  bind(cb: ClientCallback) {
    const doc = this.connection.get("ot-example", "counter"); // Obtain 'Doc' instance through 'collection' and 'id'
    const onSubscribe = () => cb(doc.data.num); // Callback for initializing data
    doc.subscribe(onSubscribe); // Subscribe to initial data
    const onOpExec = () => cb(doc.data.num); // Callback for triggering 'Op'
    doc.on("op", onOpExec); // Subscribe to 'Op' events // Both client and server 'Op' will trigger this
    return {
      increase: () => {
        doc.submitOp([{ p: ["num"], na: 1 }]); // 'json0' 'Op' operation // Adds '1' to the existing '{ num: 0 }'
      },
      unbind: () => {
        doc.off("op", onOpExec); // Unsubscribe from event
        doc.unsubscribe(onSubscribe); // Unsubscribe
        doc.destroy(); // Destroy the document
      },
    };
  }

  destroy() {
    this.connection.close(); // Close the connection
  }
}
```

## Quill
Next, we will run an instance of the rich text editor 'Quill'. The main functionality involved in this instance is the collaborative editing within the 'quill' rich text editor, with support for synchronized cursor editing. The GitHub repository for this instance can be found at `https://github.com/WindrunnerMax/Collab/tree/master/packages/ot-quill`. Let's take a quick look at the directory structure (`tree --dirsfirst -I node_modules`):

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

I'll briefly explain the functions of each folder and file. The `public` folder stores static resource files, which will be moved to the `build` folder when the client is packaged. The `server` folder stores the implementation of the `OT` server, which will also be compiled into `js` files and placed in the `build` folder at runtime. The `src` folder contains the client's code, mainly for the view and the implementation of the `OT` client. The `rollup.config.js` is the configuration file for packaging the client, and `rollup.server.js` is the configuration file for packaging the server. I assume everyone knows about `package.json` and `tsconfig.json`, so I won't go into detail about them.

The data structure of `quill` is not `JSON` but `Delta`. `Delta` describes and operates the entire document through three operations: `retain`, `insert`, and `delete`. Therefore, we cannot use `json0` to describe the data structure. We need to use the new `OT` type `rich-text`. The specific implementation of `rich-text` is achieved in the official `quill-delta`. For more details, please refer to `https://www.npmjs.com/package/rich-text` and `https://www.npmjs.com/package/quill-delta`.

```js
ShareDB.types.register(richText.type); // Register the `rich-text` type
const backend = new ShareDB({ presence: true, doNotForwardSendPresenceErrorsToClient: true }); // `ShareDB` server instance

function start(callback: () => void) {
  const connection = backend.connect(); // Connect to `ShareDB`
  const doc = connection.get("ot-example", "quill"); // Get the `Doc` instance by `collection` and `id`
  doc.fetch(err => {
    if (err) throw err;
    if (doc.type === null) { // If it doesn't exist
      doc.create([{ insert: "OT Quill" }], "rich-text", callback); // Create the initial document and trigger the callback
      return;
    }
    callback();
  });
}

function server() {
  const app = express(); // Instantiate `express`
  app.use(express.static("build")); // Path to the static resources after client packaging
  app.use(express.static("node_modules/quill/dist")); // Path to the static resources of `quill`
  const server = http.createServer(app); // Create an `HTTP` server

  const wss = new WebSocket.Server({ server: server });
  wss.on("connection", function (ws) {
    const stream = new WebSocketJSONStream(ws);
    backend.listen(stream); // The `ShareDB` backend requires a `Stream` instance
  });

  server.listen(3000);
  console.log("Listening on http://localhost:3000");
}

start(server);
```

On the client side, there are mainly three parts: instantiating the `quill` instance, instantiating the `ShareDB` client instance, and implementing communication between the `quill` and `ShareDB` clients. In the `quill` implementation, the main tasks are instantiating the `quill`, registering the cursor plugin, generating random `id`, and getting random colors by `id`. In the `ShareDB` client operation, the main task is to register the `rich-text OT` type and instantiate the `ws` connection between the client and server. In the implementation of communication between the `quill` and `ShareDB` clients, the main tasks are event listening for `quill` and `doc`, mainly related to the implementation of `Op` and `Cursor`.

```js
Quill.register("modules/cursors", QuillCursors); // Register the cursor plugin

export default new Quill("#editor", { // Instantiate `quill`
  theme: "snow",
  modules: { cursors: true },
});

const COLOR_MAP: Record<string, string> = {}; // `id => color`

export const getRandomId = () => Math.floor(Math.random() * 10000).toString(); // Generate a random user `id`
```

```javascript
export const getCursorColor = (id: string) => { // Get color based on `id`
  COLOR_MAP[id] = COLOR_MAP[id] || tinyColor.random().toHexString();
  return COLOR_MAP[id];
};
```

```javascript
const collection = "ot-example";
const id = "quill";

class Connection {
  public doc: sharedb.Doc<Delta>;
  private connection: sharedb.Connection;

  constructor() {
    sharedb.types.register(richText.type); // Register `rich-text` type
    // Connect to `ShareDB` via `WebSocket`
    const socket = new ReconnectingWebSocket("ws://localhost:3000");
    this.connection = new sharedb.Connection(socket as Socket);
    this.doc = this.connection.get(collection, id); // Get `Doc` instance based on `collection` and `id`
  }

  getDocPresence() {
    // Subscribe to online status information from other clients
    return this.connection.getDocPresence(collection, id);
  }

  destroy() {
    this.doc.destroy(); // Destroy document
    this.connection.close(); // Close connection
  }
```

```javascript
const presenceId = getRandomId(); // Generate a random `id`
const doc = client.doc; // Get the `doc` instance

const userNode = document.getElementById("user") as HTMLInputElement;
userNode && (userNode.value = "User: " + presenceId); // Display the current user

doc.subscribe(err => { // Subscribe to the initialization of `doc`
  if (err) {
    console.log("DOC SUBSCRIBE ERROR", err);
    return;
  }
  const cursors = quill.getModule("cursors"); // Get the cursor module
  quill.setContents(doc.data); // Initialize `doc` data

  quill.on("text-change", (delta, oldDelta, source) => { // Subscribe to editor changes
    if (source !== "user") return; // Do not submit if the operation is not from the current user
    doc.submitOp(delta); // Submit operation
  });

  doc.on("op", (op, source) => { // Subscribe to `Op` changes
    if (source) return; // Return if the current user made the operation
    quill.updateContents(op as unknown as Delta); // Update local content with server-side `Op`
   });

  const presence = client.getDocPresence(); // Subscribe to the status of other clients
  presence.subscribe(error => { // Subscribe to error information
    if (error) console.log("PRESENCE SUBSCRIBE ERROR", err);
  });
  const localPresence = presence.create(presenceId); // Create local presence

  quill.on("selection-change", (range, oldRange, source) => { // Selection changed
    if (source !== "user") return; // Return if not the current user
    if (!range) return; // Return if there is no `Range`
    localPresence.submit(range, error => { // Submit the selection `Range` for the local presence
      if (error) console.log("LOCAL PRESENCE SUBSCRIBE ERROR", err);
    });
  });
```

```javascript
presence.on("receive", (id, range) => { // Callback for subscribing to received status
  const color = getCursorColor(id); // Get color
  const name = "User: " + id; // Assemble name
  cursors.createCursor(id, name, color); // Create cursor
  cursors.moveCursor(id, range); // Move cursor
});
```

## Daily Challenge

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://github.com/ottypes/docs
https://share.github.io/sharedb/
https://github.com/share/sharedb
https://www.npmjs.com/package/ot-json0
https://www.npmjs.com/package/ot-json1
https://zhuanlan.zhihu.com/p/481370601
https://zhuanlan.zhihu.com/p/425265438
https://www.npmjs.com/package/rich-text
https://www.npmjs.com/package/quill-delta
```