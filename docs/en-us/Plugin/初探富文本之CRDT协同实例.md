# Exploring CRDT Rich Text - A Collaboration Example

In the previous article, "CRDT collaborative algorithm for exploring rich text," we discussed the need for collaboration, distributed eventual consistency theory, concepts of partial order sets and lattices, why there needs to be a partial order relationship, how to avoid conflicts through data structures, and how distributed systems synchronize scheduling, etc. These are the basic knowledge needed to complete collaboration. In fact, there are many mature collaboration implementations currently available, such as 'automerge' and 'yjs.' This article focuses on implementing collaboration using 'yjs' as a 'CRDT' collaboration framework.

## Description
In fact, integrating a collaboration framework is not a simple matter. Of course, compared to integrating `OT` collaboration, integrating `CRDT` collaboration is relatively simple because we only need to focus on the use of data structures, rather than paying too much attention to transformations. Currently, we are more focused on `Op-based CRDT`. The `CRDT` mentioned in this article refers to `Op-based CRDT`. After all, `State-based CRDT` requires complete transmission of full data, making it difficult to become a universal solution. Therefore, similar to the `OT` algorithm, we still need `Operations`. In the rich text domain, the most classic `Operation` is the 'delta' model of 'quill,' which describes and operates on the entire document through the three operations of `retain`, `insert`, and `delete`, and the 'JSON' model of 'slate,' which describes and operates on the entire document through operations such as `insert_text`, `split_node`, and `remove_text`. If it were `OT` at this point, we would have to talk about 'Transformation.' However, when using the `CRDT` algorithm, our focus changes; we need to focus on how to transform our current data structure into the `CRDT` framework's data structure, such as building our own `JSON` data using the types provided by the framework, such as `Array`, `Map`, `Text`, and mapping our `Op` to operations performed on the data structure provided by the framework. This way, the framework can help us collaborate, and after the framework completes collaboration, it returns the changes to the data structure of the framework. At this point, we need to map this change back to our own `Op`, and then we only need to apply these remotely synchronized and locally transformed `Op` to achieve collaboration.

Does this data transformation sound familiar? In the previous article, "OT Collaboration Example in Rich Text Exploration," we introduced `json0` and mentioned a feasible operation. We let `json0` handle the 'Transformation' part, and we need to focus on transforming our own defined data structure into `json0`. After the operations are performed by `json0`, we apply the `Op` transformed to our local data in the same way. Although the principles are completely different, it seems that we don't need to focus on this when we have mature frameworks; we tend to focus more on usage. Actually, it's quite similar when it comes to usage. For example, if we need to implement collaboration with a self-developed mind mapping feature and the saved data structures are custom, without directly available implementation solutions, we need to adapt the conversion. In that case, if we use `OT` and leverage `json0` for transformations, what we need to do is to convert the `Op` to the `Op` of `json0`, and the data sent will also be the `Op` of `json0`. However, if we use `CRDT` directly, we seem to be applying the `Op` to the data structure defined by the framework, sending data that is the framework-defined data, similar to applying the `Op` to the data structure. Actually, after using the examples provided by the framework, integrating with `CRDT` collaboration primarily involves understanding and implementation, which provides a general implementation direction, rather than being at a loss as to where to start. Furthermore, the same principle applies: what's suitable is best. The cost of implementation needs to be considered. There's no need to force-fit data structure implementation. `OT` has its advantages, and `CRDT` has its own. `CRDT` methods are relatively young compared to `OT` and are still in continuous development. In fact, some problems such as memory usage, speed, etc., have only been better resolved in recent years, and the author of `ShareDB` mentioned that while following the continuous development of `CRDTs`, 'CRDTs are the future.' Additionally, from a technical perspective, `CRDT` types are a subset of `OT` types, which means that `CRDT` actually does not require transformation functions, so anything that can handle these `OT` types should also be able to use `CRDT`.

Perhaps some of the above concepts may be difficult to understand at first, so the following examples of `Counter` and `Quill` explain how to use `yjs` to implement collaboration and how to integrate the collaboration work through data structures. However, specific `API` calls still need to be referred to `yjs` documentation. This article only covers the most basic collaboration operations. All the code is available at `https://github.com/WindrunnerMax/Collab`, and please note that this is a `pnpm` 'workspace monorepo' project, so please be mindful of using `pnpm` to install dependencies.

## Counter
First, let's run a basic collaboration example, `Counter`, where the main function is to maintain the total count in the scenario where multiple clients can `+1`. The address of this example is `https://github.com/WindrunnerMax/Collab/tree/master/packages/crdt-counter`. First, let's take a look at the directory structure (`tree --dirsfirst -I node_modules`):

```markdown
crdt-counter
├── public
│   ├── favicon.ico
│   └── index.html
├── server
│   └── index.ts
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
Let's briefly explain the purpose of each folder and file. The `public` folder stores static resource files, which will be moved to the `build` folder during client bundling. The `server` folder contains the implementation of the CRDT server, which will be compiled into JS files and placed in the `build` folder at runtime. The `src` folder contains the client's code, mainly the view and the CRDT client implementation. `babel.config.js` contains the configuration information for Babel. `rollup.config.js` is the client bundling configuration file. `rollup.server.js` is the server bundling configuration file. Everyone knows about `package.json` and `tsconfig.json`, so I won't go into detail about them.

In the previous article on the implementation of CRDT collaborative algorithms, we often mentioned the distributed collaboration without the need for a central server. In this example, we will implement a peer-to-peer instance. `yjs` provides a signaling server called `y-webrtc` and there are even public signaling servers available. However, the public signaling server may not be suitable in China due to network limitations. Before continuing with collaboration, we need to understand a bit about WebRTC and signaling concepts.

WebRTC is a real-time communication technology that focuses on peer-to-peer (P2P) communication. It allows browsers and applications to directly transmit audio, video, and data streams over the internet without the need for intermediate servers. WebRTC uses standard APIs and protocols built into the browser to provide these features. It supports various codecs and platforms and can be used to develop various real-time communication applications, such as online meetings, remote collaboration, live broadcasting, online games, and IoT applications. However, in multi-level NAT network environments, P2P connections may be restricted. In simple terms, one device cannot directly discover another device, thus preventing P2P communication. Special techniques are needed to bypass NAT and establish P2P connections.

NAT (Network Address Translation) is a widely used technology in IP networks that maps a private IP address (used in home or corporate networks) to a public IP address (used on the internet). When a device in a private network sends a packet to the public network, the NAT device maps the source IP address from a private address to a public address, and when receiving packets, it maps the destination IP address from a public address to a private address. NAT can be implemented in various ways, such as static NAT, dynamic NAT, and Port Address Translation (PAT). In multi-level NAT environments, devices are often connected to the network through routers or firewalls using NAT, which can restrict direct P2P connections.

To address the limitations imposed by NAT on P2P connections, signaling can be used. When two devices attempt to establish a P2P connection, a signaling server can be used to exchange network information, such as IP addresses, ports, and protocol types, so that the devices can discover and establish connections with each other. While signaling servers are not the only solution to bypass NAT, technologies like STUN, TURN, and ICE can also help overcome these limitations. Signaling servers primarily coordinate connections between different devices to ensure proper discovery and communication. In practical applications, multiple technologies and tools are often used together to address P2P connection issues in multi-level NAT environments.

Returning to WebRTC, despite using P2P technology, a signaling server is inevitably needed to exchange WebRTC session descriptions and control information. This information does not include the actual communication data streams, but rather describes and controls the manner and parameters of these streams. The primary data communication streams are transmitted directly between browsers through peer connections. This allows WebRTC to offer low latency and high bandwidth, but due to the direct connections between all peers, it is not suitable for a large number of collaborators on a single document.
```

Next, we are going to design the data structure. Currently, there is no `Y.Number` data structure in `yjs`, which means that `yjs` does not have the operations of self-increment and self-decrement. This is different from the previous `OT` instance. So, we need to design a data structure here. The network is unreliable, and we cannot simulate the `+1` operation locally, meaning that we cannot obtain the value locally first, then perform the `+1` operation, and then push the value to other clients. While this design might work for local testing, due to the unreliable nature of the network, we cannot guarantee that the value obtained locally is the latest. Therefore, this approach is not reliable.

So, let's consider a few options to achieve this. One feasible approach is similar to the `CRDT` data structure we introduced earlier. We can construct a set `Y.Array`. When we click `+1`, we push a new value into the set. This way, when obtaining the sum, we can simply take the length of the set.

```
Y.Array: [] => +1 => [1] => +1 => [1, 1] => ...
Counter: [1, 1].size = N
```

Another approach is to use `Y.Map` to accomplish this. When a user joins our `P2P` group, we allocate an `id` based on their identity information. This `id` only records the self-incrementing value, meaning that when a client clicks `+1`, it only operates on the number corresponding to its `id`, without affecting the values of other users within the network.

```
Y.Map: {} => +1 => {"id": 1} => +1 => {"id": 2} => ...
Counter: Object.values({"id": 2}).reduce((a, b) => a + b) = N
```

In this scenario, we used the `Y.Map` approach. After all, if we used `Y.Array`, it would consume more resources. However, since the instances do not have identity information, a random `id` is assigned each time a user enters. This does not affect our `Counter`. Additionally, there is an important point to note, because we are directly engaging in `P2P` communication, when all devices are offline and there is no actual data storage mechanism designed, data will be lost. This also requires attention.

Next, let's look at the code implementation. First, let's take a look at the server. Here, the main implementation is calling `y-webrtc-signaling` to start a signaling server. This is a ready-to-use feature provided by `y-webrtc`, and unless there are high stability and customization requirements, it is fine to use it as a ready-to-use signaling server. The subsequent part mainly uses `express` to start a static resource server, because there are many security restrictions when directly opening files in the browser via the `file` protocol.

```js
import { exec } from "child_process";
import express from "express";

// https://github.com/yjs/y-webrtc/blob/master/bin/server.js
exec("PORT=3001 npx y-webrtc-signaling", (err, stdout, stderr) => { // Call `y-webrtc-signaling`
  console.log(stdout, stderr);
});

const app = express(); // Instantiate `express`
app.use(express.static("build")); // Path to the static resources after client bundling
app.listen(3000);
console.log("Listening on http://localhost:3000");
```

On the client side, a shared connection is defined using an `id` to join our `P2P` group, with password protection. Here, the signaling server that needs to be connected is the signaling service on port `3001` started above by `y-webrtc`. After that, we use the changes in the `Y.Map` data structure defined by `observe` to execute a callback. In this case, the entire `Map` data after the callback is passed back to the callback function. Then, the `Counter` calculation is carried out at the view layer. There is also a condition `transaction.origin` check to prevent the callback from being triggered by our local call. Finally, an `increase` function is defined, where we use `transact` as a transaction to perform the `set` operation. Because our previous design only deals with the value corresponding to our current client's `id`, the local value is trusted, and we can simply increment it. The last parameter of `transact` is the `transaction.origin` mentioned above, which can be used to determine the source of the event.

```js
import { Doc, Map as YMap } from "yjs";
import { WebrtcProvider } from "y-webrtc";

const getRandomId = () => Math.floor(Math.random() * 10000).toString();
export type ClientCallback = (record: Record<string, number>) => void;
```

```typescript
class Connection {
  private doc: Doc;
  private map: YMap<number>;
  public id: string = getRandomId(); // Current client-generated unique `id`
  public counter = 0; // Initial value for current client

  constructor() {
    const doc = new Doc();
    new WebrtcProvider("crdt-example", doc, { // P2P group name // Y.Doc instance
      password: "room-password", // P2P group password
      signaling: ["ws://localhost:3001"], // Signaling server
    });
    const yMapDoc = doc.getMap<number>("counter"); // Get data structure
    this.doc = doc;
    this.map = yMapDoc;
  }

  bind(cb: ClientCallback) {
    this.map.observe(event => { // Listen for changes in the data structure // Use `observeDeep` for nested structures
      if (event.transaction.origin !== this) { // Prevent triggering when modified locally
        const record = [...this.map.entries()].reduce( // Get all data defined in `Y.Map`
          (cur, [key, value]) => ({ ...cur, [key]: value }),
          {} as Record<string, number>
        );
        cb(record); // Execute callback
      }
    });
  }

  public increase() {
    this.doc.transact(() => { // Transaction
      this.map.set(this.id, ++this.counter); // Increment the value corresponding to the local `id`
    }, this); // Source
  }
}

export default new Connection();
```

## Quill
Before running the instance of the rich text editor `Quill`, let's briefly discuss how CRDT is applied to rich text. The previous section mainly discussed the principles of CRDT collaborative algorithms in distributed systems, without delving into how to design data structures for rich text. Here, we will briefly discuss how `yjs` is applied to rich text using CRDT.

When looking back at the design of CRDT for the data structure of collections, we mainly considered how to ensure the commutative, associative, and idempotent laws for adding and removing elements in a set. Now, in the implementation of rich text, we not only need to consider insertion and deletion, but also the order of operations. We also need to ensure CCI, which includes eventual consistency, causal consistency, and intention consistency. Of course, we also need to consider issues related to Undo/Redo, cursor synchronization, and so on.

First, let's look at how to ensure the order of inserted data. For OT, we know the position where the user wants to operate through indexes and ensure eventual consistency through transformations. However, CRDT does not need to do this. As mentioned earlier, relying solely on OT may lose the essence of embracing CRDT. So, how do we ensure the correct position for insertion without relying on indexes? If CRDT doesn't rely on indexes, it needs to rely on data structures to accomplish this. We can achieve this by using relative positions. For example, if we have the string `AB` and insert the character `C` in the middle, this character needs to be marked as after `A` and before `B`. Clearly, we need to assign a unique `id` to each character in order to achieve this. Of course, there's room for optimization in this area, but we won't discuss that here. Thus, we ensure the order of insertion by using relative positions.


Next, let's take a look at the issue of deletion. In the previous `Observed-Remove Set` set data structure, we could actually perform delete operations. However, here, since we achieve complete order by relative position, we actually can't truly delete the `Item` we've marked. `Item` can be understood as the inserted character, also known as a soft delete. For example, if we have the string `AB`, and one client deletes `B` while another client adds `C` between `A` and `B, when these two `Op`s are synced to a third client, if the addition of `C` is executed before the deletion of `B, there's no problem. However, if we delete `B` first and then add `C`, we won't be able to find the position to insert `C` because `B` has already been deleted. We're supposed to insert `C` between `A` and `B`, so this operation can't be executed, which means it violates the law of commutativity and can't truly be designed as a `CRDT` data structure.

You might wonder why we need two positions to ensure the insertion position of the character. We could just use the left side of `B` or the right side of `A` to achieve it. In fact, if multiple clients are operating, if one deletes `A` and another deletes `B, it would be impossible to find the insertion position no matter what, which violates the laws of commutativity and associativity, and can't be implemented as a `CRDT`. Therefore, to resolve conflicts, `yjs` doesn't actually delete `Item`s, but rather uses a marked form where the deleted `Item` is tagged as `deleted`. Not deleting would cause a significant problem—the space occupation would grow infinitely. Therefore, `yjs` introduced a tombstone mechanism, where after confirming that the content won't be tampered with anymore, the object's content is replaced with an empty tombstone object.

We also mentioned the issue of conflicts earlier. It's evident that there are conflicts in the design because in fact, `CRDT` wasn't specifically designed for collaborative editing scenarios but primarily for addressing consistency issues in distributed scenarios. Therefore, when applied to collaborative editing scenarios, conflicts are inevitable, mainly due to the introduction of set order. If order isn't a concern, then naturally there wouldn't be any conflict issues. To ensure that the data satisfies the three laws, in the previous section, we introduced the concept of a partial order. However, in collaborative editing design, using a partial order can't guarantee the correctness and consistency of data synchronization, because it can't handle some critical conflict scenarios.

For example, if we currently have the string `AB`, and one client adds `C` to it while another adds `D`, who comes first? Thus, we need to introduce a total order method, where any two `Item`s can be compared. It's clear that if we attach a timestamp to each `Item`, we can introduce a total order, but because different clients may have different clock deviations, network delays, and unsynchronized clocks, timestamps may be unreliable. In comparison, logical clocks or logical timestamps can use a simpler and more reliable way to maintain the sequence of events:

- Each time a local event occurs, `clock = clock + 1`.
- Each time a remote event is received, `clock = max(clock, remoteClock) + 1`.

It still seems possible for conflicts to occur. Therefore, we can introduce a unique `id` for the client, `clientID`. This mechanism seems simple, but in fact, it provides us with a mathematically well-behaved total order structure, which means that we can compare the logical precedence between any two `Item`s. This is crucial for ensuring the correctness of the `CRDT` algorithm. In addition, through this method, we can also ensure causal consistency. For instance, if we have two operations `a` and `b`, if there's a causal relationship between them, `a.clock` must be greater than `b.clock`, ensuring that the order obtained satisfies the causal relationship. If there's no causal relationship, the operations can be executed in any order. For example, if we have three clients `A`, `B`, and `C` and the string `SE`, if `A` adds the character `a` to the middle of `SE` and this operation is synced to `B`, and `B` then deletes the `a` character, if `C` receives `B`'s delete operation first, since this operation depends on `A`'s operation, a causal dependency check is needed. The logical clock and offset of this operation are greater than those of the operation already applied in `C`'s local document. Therefore, it needs to wait for the previous operation to be applied before applying this operation. Of course, this isn't the case in the `yjs` implementation, because `yjs` doesn't have actual delete operations, and in fact, deleting an operation doesn't increase the clock. The example above can actually be presented differently—it's two identical insertion operations. Since we're considering relative positions, the latter insertion operation depends on the former, so a causal check is required. This is actually an interesting scenario. When receiving operations from different clients editing at the same position, if the clocks are the same, it's a conflicting operation; if they're different, there's a causal relationship.

Thus, through the `CRDT` data structure and algorithm design, we've solved eventual consistency and causal consistency. For intention consistency, when conflicts don't exist, we can ensure the intention—the order of inserted `Item`s. In case of conflicts, we actually compare `clientID`s to determine who comes first. In fact, no matter who comes first or last during conflicts, it can be considered an error. In conflicts, we only guarantee eventual consistency. Achieving intention consistency would require additional design, which won't be discussed here. In fact, `yjs` has a lot of designs and optimizations, and conflict resolution algorithms based on `YATA`, such as using a bidirectional linked list to save document structure order, using `Map` to save a flat `Item` array for each client, optimizing the speed of local insertion with a caching mechanism designed for `O(N)` linked list lookup and cursor position caching, inclining toward `State-based` deletion, `Undo/Redo`, cursor synchronization, compressing data network transmission, and more. It's definitely worth studying.

Let's go back to the example of the rich text editor `Quill`. The main function implemented in the `quill` rich text editor is to integrate collaboration and support the synchronization of cursor movements. The address of this example is `https://github.com/WindrunnerMax/Collab/tree/master/packages/crdt-quill`. First, let's take a brief look at the directory structure (`tree --dirsfirst -I node_modules`):

```plaintext
crdt-quill
├── public
│   └── favicon.ico
├── server
│   └── index.ts
├── src
│   ├── client.ts
│   ├── index.css
│   ├── index.ts
│   └── quill.ts
├── package.json
├── rollup.config.js
├── rollup.server.js
└── tsconfig.json
```

Let's briefly explain the functions of each folder and file. `public` stores static resource files, which will be moved to the `build` folder during client-side packaging. The `server` folder stores the server-side implementation of `CRDT`, which will also be compiled into `js` files and placed in the `build` folder at runtime. The `src` folder contains the client-side code, mainly the view and `CRDT` client implementation. `rollup.config.js` is the configuration file for client-side packaging, and `rollup.server.js` is the configuration file for server-side packaging. We all know what `package.json` and `tsconfig.json` are, so I won't elaborate on them.

The data structure of `quill` is not `JSON` but `Delta`. `Delta` describes and manipulates the entire document through three operations: `retain`, `insert`, and `delete`. Imagine what operations are needed to describe a segment of text; isn't it possible to cover everything with these three operations? Therefore, using `Delta` to describe text manipulations is completely feasible. Moreover, the open source of `quill` in 2012 can be considered a milestone in the development of rich text, so `yjs` directly supports the `Delta` data structure.

Next, let's take a look at the server side. The main implementation here is to call `y-websocket` to start a `websocket` server. This is a plug-and-play feature provided by `y-websocket`, and it can also be rewritten based on these contents. `yjs` also provides server-side services such as `y-mongodb-provider`. Later, an `express` is used to start a static resource server, because directly opening files in the browser using the `file` protocol has many security restrictions, so an `HTTP Server` is needed.

```js
import { exec } from "child_process";
import express from "express";

// https://github.com/yjs/y-websocket/blob/master/bin/server.js
exec("PORT=3001 npx y-websocket", (err, stdout, stderr) => { // call `y-websocket`
  console.log(stdout, stderr);
});

const app = express(); // instantiate `express`
app.use(express.static("build")); // path to client-side packaged static resources
app.use(express.static("node_modules/quill/dist")); // path to `quill` static resources
app.listen(3000);
console.log("Listening on http://localhost:3000");
```

On the client side, a common connection is defined, and `crdt-quill` is used as the `RoomName` to join the group. The `websocket` server that needs to be connected to is the service on port `3001` launched above using `y-websocket`. Then, the top-level data structure is defined as the change of the `YText` data structure to execute callbacks, and some information is exposed. `doc` is the `yjs` instance that needs to be used, `type` is the top-level data structure we defined, and `awareness` is used for real-time data synchronization, which is used here to synchronize cursor selections.

```js
import { Doc, Text as YText } from "yjs";
import { WebsocketProvider } from "y-websocket";

class Connection {
  public doc: Doc; // `yjs` instance
  public type: YText; // top-level data structure
  private connection: WebsocketProvider; // `WebSocket` connection
  public awareness: WebsocketProvider["awareness"]; // real-time data synchronization
```

```js
constructor() {
  const doc = new Doc(); // Instantiate
  const provider = new WebsocketProvider("ws://localhost:3001", "crdt-quill", doc); // Connect to `WebSocket` server
  provider.on("status", (e: { status: string }) => {
    console.log("WebSocket", e.status); // Connection status
  });
  this.doc = doc; // `yjs` instance
  this.type = doc.getText("quill"); // Get the top-level data structure
  this.connection = provider; // Connection
  this.awareness = provider.awareness; // Real-time data synchronization
}

reconnect() {
  this.connection.connect(); // Reconnect
}

disconnect() {
  this.connection.disconnect(); // Disconnect
}
}

export default new Connection();
```

In the client, there are mainly two parts, which are the instantiation of the `quill` instance and the implementation of communication between `quill` and the `yjs` client. In the implementation of `quill`, the main tasks are the instantiation of the `quill` instance, registration of the cursor plugin, method for generating random `id`, method for obtaining random color by `id`, and cursor synchronization position conversion. In the implementation of communication between `quill` and the `yjs` client, the main tasks are the completion of event listening for `quill` and `doc`, mainly the callbacks for remote data changes, local data changes, and cursor synchronization event awareness.

```js
import Quill from "quill";
import QuillCursors from "quill-cursors";
import tinyColor from "tinycolor2";
import { Awareness } from "y-protocols/awareness.js";
import {
  Doc,
  Text as YText,
  createAbsolutePositionFromRelativePosition,
  createRelativePositionFromJSON,
} from "yjs";
export type { Sources } from "quill";

Quill.register("modules/cursors", QuillCursors); // Register cursor plugin

export default new Quill("#editor", { // Instantiate `quill`
  theme: "snow",
  modules: { cursors: true },
});

const COLOR_MAP: Record<string, string> = {}; // `id => color`

export const getRandomId = () => Math.floor(Math.random() * 10000).toString(); // Generate random user `id`

export const getCursorColor = (id: string) => { // Get color by `id`
  COLOR_MAP[id] = COLOR_MAP[id] || tinyColor.random().toHexString();
  return COLOR_MAP[id];
};
```

```js
export const updateCursor = (
  cursor: QuillCursors,
  state: Awareness["states"] extends Map<number, infer I> ? I : never,
  clientId: number,
  doc: Doc,
  type: YText
) => {
  try {
    // Retrieve the status from `Awareness`
    if (state && state.cursor && clientId !== doc.clientID) {
      const user = state.user || {};
      const color = user.color || "#aaa";
      const name = user.name || `User: ${clientId}`;
      // Create a cursor based on the `clientId`
      cursor.createCursor(clientId.toString(), name, color);
      // Convert relative position to absolute position // The selection is `focus --- anchor`
      const focus = createAbsolutePositionFromRelativePosition(
        createRelativePositionFromJSON(state.cursor.focus),
        doc
      );
      const anchor = createAbsolutePositionFromRelativePosition(
        createRelativePositionFromJSON(state.cursor.anchor),
        doc
      );
      if (focus && anchor && focus.type === type) {
        // Move the cursor position
        cursor.moveCursor(clientId.toString(), {
          index: focus.index,
          length: anchor.index - focus.index,
        });
      }
    } else {
      // Remove the cursor based on the `clientId`
      cursor.removeCursor(clientId.toString());
    }
  } catch (err) {
    console.error(err);
  }
};
```

```js
import "./index.css";
import quill, { getRandomId, updateCursor, Sources, getCursorColor } from "./quill";
import client from "./client";
import Delta from "quill-delta";
import QuillCursors from "quill-cursors";
import { compareRelativePositions, createRelativePositionFromTypeIndex } from "yjs";

const userId = getRandomId(); // `id` for the local client or use `awareness.clientID`
const doc = client.doc; // `yjs` instance
const type = client.type; // Top-level type
const cursors = quill.getModule("cursors") as QuillCursors; // `quill` cursor module
const awareness = client.awareness; // Real-time communication awareness module

// Set the information for the current client. `State` data structure is similar to `Record<string, unknown>`
awareness.setLocalStateField("user", {
  name: "User: " + userId,
  color: getCursorColor(userId),
});

// User information displayed on the page
const userNode = document.getElementById("user") as HTMLInputElement;
userNode && (userNode.value = "User: " + userId);

type.observe(event => {
  // Source information // Local `UpdateContents` should no longer trigger `ApplyDelta'
  if (event.transaction.origin !== userId) {
    const delta = event.delta;
    quill.updateContents(new Delta(delta), "api"); // Apply remote data, source
  }
});
```

```javascript
quill.on("editor-change", (_: string, delta: Delta, state: Delta, origin: Sources) => {
  if (delta && delta.ops) {
    // Source information // The local `ApplyDelta` should not trigger `UpdateContents` again
    if (origin !== "api") {
      doc.transact(() => {
        type.applyDelta(delta.ops); // Apply `Ops` to `yjs`
      }, userId); // Source
    }
  }

  const sel = quill.getSelection(); // Selection
  const aw = awareness.getLocalState(); // Real-time communication status data
  if (sel === null) { // Lose focus
    if (awareness.getLocalState() !== null) {
      awareness.setLocalStateField("cursor", null); // Clear selection status
    }
  } else {
    // Convert Quill position to relative position // Selection is `focus --- anchor`
    const focus = createRelativePositionFromTypeIndex(type, sel.index);
    const anchor = createRelativePositionFromTypeIndex(type, sel.index + sel.length);
    if (
      !aw ||
      !aw.cursor ||
      !compareRelativePositions(focus, aw.cursor.focus) ||
      !compareRelativePositions(anchor, aw.cursor.anchor)
    ) {
      // Selection position change, set position information
      awareness.setLocalStateField("cursor", { focus, anchor });
    }
  }
  // Update all cursor statuses locally
  awareness.getStates().forEach((aw, clientId) => {
    updateCursor(cursors, aw, clientId, doc, type);
  });
});

// Initialize and update all remote cursor statuses locally
awareness.getStates().forEach((state, clientId) => {
  updateCursor(cursors, state, clientId, doc, type);
});
// Listen for remote status change callback
awareness.on(
  "change",
  ({ added, removed, updated }: { added: number[]; removed: number[]; updated: number[] }) => {
    const states = awareness.getStates();
    added.forEach(id => {
      const state = states.get(id);
      state && updateCursor(cursors, state, id, doc, type);
    });
    updated.forEach(id => {
      const state = states.get(id);
      state && updateCursor(cursors, state, id, doc, type);
    });
    removed.forEach(id => {
      cursors.removeCursor(id.toString());
    });
  }
);
```

## Daily Topic

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://docs.yjs.dev/
https://github.com/yjs/yjs
https://github.com/automerge/automerge
https://zhuanlan.zhihu.com/p/425265438
https://zhuanlan.zhihu.com/p/452980520
https://josephg.com/blog/crdts-go-brrr/
https://www.npmjs.com/package/quill-delta
https://josephg.com/blog/crdts-are-the-future/
https://github.com/yjs/yjs/blob/main/INTERNALS.md
https://cloud.tencent.com/developer/article/2081651
```