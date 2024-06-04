## React-based SSG Rendering Solution

Static Site Generation `(SSG - Static Site Generation)` is a method that generates static resources such as `HTML` files during building, eliminating the need for server-side processing. By pre-generating static files, it enables fast content loading and high security without the need for server runtime. Since it generates pure static resources, leveraging solutions like `CDN` allows for building and deploying websites at lower costs and higher efficiency, widely applicable in scenarios such as blogs, knowledge bases, and `API` documentation.

## Description
Recently, our team encountered a tricky issue. As a team mainly focused on document-related business, our product documentation caters to users worldwide, making website access speed outside of China a significant concern. While we have data centers in multiple regions, data in each one is isolated. However, many products do not require much customization, making the documentation reusable. Especially when offering multilingual support, sharing documentation across regions becomes reasonable. Even for customized content in China and overseas, access speed overseas can also pose challenges. For instance, if the data center is in the US, accessing from Singapore can still be cumbersome.

So, here's the issue: to ensure efficient access across regions, we must deploy services in major data centers, each with data isolation requirements. In such cases, manually copying documents to servers in each region is highly inefficient. Even if a product's documentation doesn't change frequently, manual handling consumes significant resources. Moreover, as our business manages documentation for various products and expands overseas, such demand for feedback is likely to increase. Thus, addressing this issue becomes crucial.

Thinking back to how I built my blog site, I found it convenient to deploy my blog directly on `GitHub Pages` via the `gh-pages` branch, as `GitHub Pages` doesn't support server deployment, meaning my blog site consists entirely of static resources. This made me realize that we could adopt a similar approach for our document site by using `SSG` compilation to generate static resources during publication. With all content being static resources, we could effortlessly achieve efficient cross-regional access via `CDN`. Apart from managing `CDN` distribution, we could also publish static resources to the business's code repository, allowing them to deploy services and resources independently. Multiple data center deployments could also address cross-regional access issues.

However, considering various constraints and compatibility with existing deployment methods in our business, it may not be entirely practical to solely rely on `SSG` for achieving efficient cross-regional access. Most probably, we would need to follow compliant data synchronization solutions across regions to ensure data consistency and efficient access. Nonetheless, pondering `SSG` as a solution for this issue, I became curious about implementing `SSG` rendering based on `React`, similar to how my blog leverages `Mdx` for `SSG` rendering. Initially, this seemed like a complex issue, but during implementation, I realized that sticking to basic principles was a rather straightforward solution. Rendering didn't require the level of detail I had imagined. Nevertheless, developing a complete framework, especially addressing data handling and rendering, involves multiple considerations.

Before delving into the fundamental principles of `SSG`, let's first explore the characteristics of static site implementation through `SSG`:

* **Fast Access**: Static websites comprise pre-generated `HTML`, `CSS`, `JavaScript`, `Image`, and other static files. These do not rely on dynamic server-side languages. When deployed on `CDN`, users can efficiently retrieve resources from edge nodes, reducing load times and enhancing user experience.
* **Simple Deployment**: Static websites can run on any hosting service like `GitHub Pages`, `Vercel`, etc. It only requires file transfers, eliminating the need for server configuration and database management. With tools like `Git` version control and `CI/CD`, automating deployment becomes relatively easy.
* **Low Resource Footprint**: Static websites demand minimal server resources, enabling them to operate in low-config environments. With tools like `Nginx`, a site serving 10k+ `QPS` can run on modestly configured servers.
* **SEO Benefits**: Static websites are generally more search engine optimization (`SEO`) friendly. Pre-rendered pages have complete `HTML` tag structures and semantic optimizations, making it easier for search engines to crawl and index content.

Similarly, static resource sites generated through `SSG` have some limitations:

* **Low Real-Time Updates**: Since static sites require pre-generation, they cannot generate content in real-time based on requests. For instance, after publishing new documents, incremental or full-site compilation is necessary, hindering access to the latest content during compilation.
* **Lack of Dynamic Interactions**: Static sites typically consist only of static resources, thus unable to support dynamic interactions like user login, comments, etc. While such features can be dynamically supported during client-side rendering, the site ceases to be purely static and often leverages `SSG` for improved initial loading and `SEO` effects.

In summary, `SSG` is more suitable for projects that generate relatively fixed content, do not require frequent updates, and are less sensitive to data latency. In practice, we may only optimize certain capabilities for scenarios like optimizing the initial screen, ultimately resorting to `CSR` to provide service capabilities. Therefore, when choosing a rendering method, it is essential to fully consider the business scenarios to determine whether `CSR - Client-Side Render`, `SSR - Server-Side Render`, or `SSG - Static Site Generation` are more suitable for our business needs. In some cases requiring additional optimization, `ISR - Incremental Static Regeneration`, `DPR - Distributed Persistent Rendering`, `ESR - Edge Side Rendering`, among others, could also be considered as business choices.

Returning to the initial question, if our purpose is merely synchronizing static resources via a `CDN` to handle global cross-regional access, then a complete `SSG` solution may not be necessary. Transforming `CSR` entirely into `SSR` is quite an extensive scope of change when our goal is single production and multiple consumption. In this scenario, we can consider that `JSON` files are also a type of static resource; we can directly request these files as static resources in the frontend and render them using an `SDK`. As for certain interactive actions such as liking a post, slower speeds are acceptable, as the primary function of a documentation site is reading. Similarly, `md` files can be processed in this manner too. For example, `docsify` utilizes dynamic requests. However, content requiring dynamic requests via JavaScript may not be easily parsed by search engines. Therefore, continuous optimization and iterations are necessary for effectively implementing this capability.

Moving on to the basics, optimizing component compilation methods to generate `SSG` based on template rendering is the next step. The API calls mentioned in this document are implemented based on `React` version `17.0.2`. For demonstrations related to content, refer to the [GitHub repository](https://github.com/WindrunnerMax/webpack-simple-environment/tree/master/packages/react-render-ssg).

## Basic Principles
Typically, when using `React` for client-side rendering (`CSR`), you only need to place an independent `DOM` node `<div id="root"></div>` in the entry `index.html` file. Then, in the imported `xxx.js` file, use the `ReactDOM.render` method to render the `React` components onto this `DOM` node. After rendering the content, we initiate requests in certain lifecycles or `Hooks` to dynamically retrieve data and render it on the page, completing the component rendering process.

Having discussed a lot about `SSG`, it is evident that for offline rendering of primary content, we need to detach it. Therefore, the first issue to address is how to offline data and not dynamically retrieve it after rendering in the browser. As previously mentioned, one optional approach is to fetch data from a database and write it to a `json` file during code construction, then upload it to a `CDN` at the end.

Once we've resolved the offline data retrieval issue, attention shifts to rendering problems. If we stick to the previous rendering approach but only replace the data request addresses from server-side APIs with static resource addresses, we won't achieve the desired `SEO` and faster initial screen experiences. Another interesting point comes up: when utilizing `SSR`, if components are `dynamically` imported, `Next` will inject the data into `<script />` tags in the HTML output. In this scenario, the efficiency of the initial screen is quite good, and `Google` can efficiently index the dynamically executed JavaScript-rendered data, presenting a kind of offline rendering solution.

Although this method works, it is not ideal, prompting the need to continue troubleshooting. Next, we need to properly render the complete HTML structure. Within the `ReactDOM` Server API, there are two relevant APIs: `renderToStaticMarkup` and `renderToString`. Both APIs can output the HTML structure of `React` components, differing in that `renderToStaticMarkup` generates a pure HTML structure without `data-reactid`, causing potential DOM reconstruction and flickering when rendered by the client-side `React`. On the other hand, `renderToString` produces an HTML structure with tags, preventing dom re-rendering by `React` on the client-side. In our case, using `renderToString` to output the HTML structure is necessary.

```js
// packages/react-render-ssg/src/basic/index.ts
import ReactDOMServer from "react-dom/server";
```

```html
<!-- packages/react-render-ssg/public/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... Meta -->
    <title>Template</title>
    <!-- INJECT STYLE -->
  </head>
  <body>
    <div id="root">
      <!-- INJECT HTML -->
    </div>
    <!-- ... React Library  -->
    <!-- INJECT SCRIPT -->
  </body>
</html>
```

We have obtained the complete HTML structure after rendering the component. From the output, we can see that there is a problem - the `onClick` function we defined is not reflected in the rendered HTML structure. In the HTML structure, we only have some complete tags without any event handling. This is a reasonable situation because we implemented the event handling using the React framework, which is not directly mapped to the output HTML, especially in complex applications where we still need to handle subsequent event interactions through React. Therefore, it is obvious that we still need to handle related events on the client side.

In React, the commonly used function for client-side rendering is `ReactDOM.render`. In our case, we have already processed the HTML structure and do not need to render the content completely again. In other words, what we need now is to attach events to the relevant DOM elements to handle interactions. We need to append React to the existing HTML rendered by React on the server side so that React can take over the handling of the related DOM. Therefore, we also need to define the same React component on the client side and output it to the page's JavaScript. In other words, this part of the content needs to be executed on the client side.

```js
// packages/react-render-ssg/src/basic/index.ts
const PRESET = `
const App = React.createElement(
  React.Fragment,
  null,
  React.createElement("div", null, "React HTML Render"),
  React.createElement(
    "button",
    {
      onClick: () => alert("On Click"),
    },
    "Button"
  )
);
const _default = App;
ReactDOM.hydrate(_default, document.getElementById("root"));
`;

await fs.writeFile(`dist/${jsPathName}`, PRESET);
```

Actually, this part of the code is generated on the server side. At this point, we don't have any content running on the client side. In other words, this is our compilation process, not the runtime yet. So all the generated content is executed on the server side. Obviously, we need to assemble the HTML and other static resource files. Therefore, we can predefine an HTML file template, and then include the contents generated during the build process, as well as the newly generated files in the template. All the generated content will be uploaded to the CDN and distributed along with the build.

```html
<!-- packages/react-render-ssg/public/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... Meta -->
    <title>Template</title>
    <!-- INJECT STYLE -->
  </head>
  <body>
    <div id="root">
      <!-- INJECT HTML -->
    </div>
    <!-- ... React Library  -->
    <!-- INJECT SCRIPT -->
  </body>
</html>
```

```js
// packages/react-render-ssg/src/basic/index.ts
const template = await fs.readFile("./public/index.html", "utf-8");
await fs.mkdir("dist", { recursive: true });
const random = Math.random().toString(16).substring(7);
const jsPathName = `${random}.js`;
const html = template
  .replace(/<!-- INJECT HTML -->/, HTML)
  .replace(/<!-- INJECT SCRIPT -->/, `<script src="${jsPathName}"></script>`);
await fs.writeFile(`dist/${jsPathName}`, PRESET);
await fs.writeFile(`dist/index.html`, html);
```

Now we have completed the most basic `SSG` construction process. Next, we can access the resources through a static server. In this part of the `DEMO`, we can directly construct and preview the static resource address through `ts-node` and `anywhere`. In fact, many open source static website building frameworks such as `VitePress`, `RsPress`, etc. all adopt similar principles, which are to generate `HTML`, `Js`, `CSS`, and other static files on the server side, and then have their own frameworks re-take over the behavior of the `DOM` on the client side. Of course, these frameworks have high integration and greater reuse of related libraries. For more complex application scenarios, we can also consider implementing frameworks such as `Next` and `Gatsby` on the basis of `SSG`. These frameworks provide more capabilities on the basis of `SSG` and have better support for more complex application scenarios.

## Component Compilation
Although we have already implemented the most basic `SSG` principle before, we obviously manually handled many aspects to simplify the implementation principle. For example, in the code output to the `Js` file above, we used a pure string implementation of the code by defining the `PRESET` variable. Also, we defined the code that runs separately on the server and client sides for the same component. Obviously, this approach is not quite reasonable, so we need to solve this problem next.

Therefore, first we need to define a common `App` component, which, in the same way as the basic principle before, will be shared in the server-side `HTML` generation and the client-side `React Hydrate`, and for convenience of external module importing, we usually use the `export default` method to export the entire component.

```js
// packages/react-render-ssg/src/rollup/app.tsx
import React from "react";

const App = () => (
  <React.Fragment>
    <div>React Render SSG</div>
    <button onClick={() => alert("On Click")}>Button</button>
  </React.Fragment>
);

export default App;
```

Next, let's deal with the client-side `React Hydrate`. Previously, we defined it through manually maintained string editing, but we can also compile the component through package tools on the `Node` side, and use this to output `Js` code files. Here, we choose to use `Rollup` to package the `Hydrate` content, and use `app.tsx` as the entry point to package the entire component as `iife`. Then, write the output content to `APP_NAME`, and put the actual `hydrate` into `footer`, so that the client-side `React` can take over the `DOM` execution.

```js
// packages/react-render-ssg/rollup.config.js
const APP_NAME = "ReactSSG";
const random = Math.random().toString(16).substring(7);

export default async () => {
  return {
    input: "./src/rollup/app.tsx",
    output: {
      name: APP_NAME,
      file: `./dist/${random}.js`,
      format: "iife",
      globals: {
        "react": "React",
        "react-dom": "ReactDOM",
      },
      footer: `ReactDOM.hydrate(React.createElement(${APP_NAME}), document.getElementById("root"));`,
    },
    plugins: [
      // ...
    ],
    external: ["react", "react-dom"],
  };
};

```

Next, let's handle the server-side `HTML` file generation and resource referencing. The logic here is quite similar to the basic principles we discussed earlier about server-side generation, with the addition of invoking `Rollup` for bundling via the terminal. Similarly, we will output the `HTML`, and include the `Js` file into the `HTML`. It's important to note that in this case, the output file path during `Rollup` bundling is overridden by the `--file` parameter here, replacing the configuration embedded in the `rollup.config.js`.

```js
// packages/react-render-ssg/src/rollup/index.ts
const exec = promisify(child.exec);

(async () => {
  const HTML = ReactDOMServer.renderToString(React.createElement(App));
  const template = await fs.readFile("./public/index.html", "utf-8");

  const random = Math.random().toString(16).substring(7);
  const path = "./dist/";
  const { stdout } = await exec(`npx rollup -c --file=${path + random}.js`);
  console.log("Client Compile Complete", stdout);

  const jsFileName = `${random}.js`;
  const html = template
    .replace(/<!-- INJECT HTML -->/, HTML)
    .replace(/<!-- INJECT SCRIPT -->/, `<script src="${jsFileName}"></script>`);
  await fs.writeFile(`${path}index.html`, html);
})();
```

## Template Rendering
Now that we have reused component definitions and bundled the necessary client-side running `Js` files using `Rollup`, manual maintenance of client-side output is no longer required. Let's consider a more complex scenario where our components have more intricate content, such as referencing component libraries for building views and using CSS preprocessors for styling. In such cases, the server-side HTML output program becomes more intricate.

Following our previous approach, on the server side, all we need to do is render the `HTML` content of the `App` component. For instance, if our component references the `@arco-design` component library, and typically we need to reference its `less` files or `css` files.

```js
import "@arco-design/web-react/dist/css/arco.css";
import { Button } from "@arco-design/web-react";
// OR
import "@arco-design/web-react/es/Button/style/index";
import { Button } from "@arco-design/web-react/es/Button";
```

Considering that we are running the components in a server environment, where Node environment does not recognize `.less` or `.css` files, and the `import` syntax is not supported, we usually execute the entire program using `ts-node`. However, we don’t need these style files here, so we need to configure the Node environment to handle these style file references.

```js
require.extensions[".css"] = () => undefined;
require.extensions[".less"] = () => undefined;
```

Nevertheless, the issue persists, particularly for those familiar with `arco-design` packaging. When importing style files like `Button/style/index`, it actually imports a `js` file instead of a `.less` file. If we need to explicitly import a `.less` file, we should specify `Button/style/index.less`. So, if we import a `.less` file, it works fine, but when importing a `.js` file, and given it uses `import` internally, even setting up `commonjs` resolution in `tsconfig` won’t resolve this.

```js
{
  "ts-node": {
    "compilerOptions": {
      "module": "commonjs",
      "esModuleInterop": true
    }
  }
}
```

Therefore, we can see that it's not enough to merely use `ts-node` to parse or execute server-side data generation. This approach would impose many restrictions when we implement components in our usual way. For example, we can't easily reference `es` implementations and need to rely on the content declared in the package's `package.json` to import content. If the package can't handle `commonjs` references, we would be at a loss. In this case, we still need to introduce a bundling tool to bundle the `commonjs` code and then use `Node` to execute the output `HTML`. With the bundling tool, we can do a lot more. Here, we load resource files such as `.less` and `.svg` through `null-loader`, and the relevant configuration outputs are all based on `commonjs`. At this point, the file we output is `node-side-entry.js`.

```js
// packages/react-render-ssg/rspack.server.ts
const config: Configuration = {
  context: __dirname,
  entry: {
    index: "./src/rspack/app.tsx",
  },
  externals: externals,
  externalsType: "commonjs",
  externalsPresets: {
    node: true,
  },
  // ...
  module: {
    rules: [
      { test: /\.svg$/, use: "null-loader" },
      { test: /\.less$/, use: "null-loader" },
    ],
  },
  devtool: false,
  output: {
    iife: false,
    libraryTarget: "commonjs",
    publicPath: isDev ? "" : "./",
    path: path.resolve(__dirname, ".temp"),
    filename: "node-side-entry.js",
  },
};
```

Now that we have obtained the components that can run in the `Node` environment, next, considering the output of `SSG`, we usually need to pre-set static data. For example, if we want to render a document, we first need to retrieve the relevant data from the database and then pass it into the component as static data. Finally, we directly render the content in the pre-generated `HTML`. At this point, our `App` component definition needs an additional `getStaticProps` function declaration, and we also imported some style files.

```js
// packages/react-render-ssg/src/rspack/app.tsx
import "./app.less";
import { Button } from "@arco-design/web-react";
import React from "react";

const App: React.FC<{ name: string }> = props => (
  <React.Fragment>
    <div>React Render SSG With {props.name}</div>
    <Button style={{ marginTop: 10 }} type="primary" onClick={() => alert("On Click")}>
      Button
    </Button>
  </React.Fragment>
);

export const getStaticProps = () => {
  return Promise.resolve({
    name: "Static Props",
  });
};

export default App;
```

```css
/* packages/react-render-ssg/src/rspack/app.less */
body {
  padding: 20px;
}
```

Similarly, we also need to bundle the `Js` files for client-side execution. However, here, since we need to process pre-set static data, we also need to generate template code in advance during the packaging process. When we execute the packaging function on the server side, we need to place the data queried from the database or read from the file into the generated template file and then use that file as the entry point to bundle the `React Hydrate` capability for client-side execution. Here, to make the template file clearer, we use `JSON.parse` to process the pre-set data, but in fact, we only need to reserve a placeholder and directly write the data into the template file after the data is stringified during compilation. 

```js
// packages/react-render-ssg/src/rspack/entry.tsx
/* eslint-disable @typescript-eslint/no-var-requires */
```

```js
const Index = require(`<index placeholder>`);
const props = JSON.parse(`<props placeholder>`);
ReactDOM.hydrate(React.createElement(Index.default, { ...props }), document.getElementById("root"));
```

Once the template file is generated, we need to use this file as the entry point to bundle the client-side assets. Since we are also using a component library, the output will not only be `Js` files but also include `CSS` files. Additionally, we need to configure file name generation and `externals` that can be controlled through parameter names. It is important to note that we do not need to use `html-plugin` to output HTML files here, that part of the process will be handled separately.

```js
// packages/react-render-ssg/rspack.config.ts
const args = process.argv.slice(2);
const map = args.reduce((acc, arg) => {
  const [key, value] = arg.split("=");
  acc[key] = value || "";
  return acc;
}, {} as Record<string, string>);
const outputFileName = map["--output-filename"];

const config: Configuration = {
  context: __dirname,
  entry: {
    index: "./.temp/client-side-entry.tsx",
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  },
  // ...
  builtins: {
    // ...
    pluginImport: [
      {
        libraryName: "@arco-design/web-react",
        customName: "@arco-design/web-react/es/{{ member }}",
        style: true,
      },
      {
        libraryName: "@arco-design/web-react/icon",
        customName: "@arco-design/web-react/icon/react-icon/{{ member }}",
        style: false,
      },
    ],
  },
  // ...
  output: {
    chunkLoading: "jsonp",
    chunkFormat: "array-push",
    publicPath: isDev ? "" : "./",
    path: path.resolve(__dirname, "dist"),
    filename: isDev
      ? "[name].bundle.js"
      : outputFileName
      ? `${outputFileName}.js`
      : "[name].[contenthash].js",
    // ...
  },
};
```

At this point, we need to schedule the packaging process for all files. First, we need to create the necessary output and temporary folders. Then, start the server-side `commonjs` packaging process, output the `node-side-entry.js` file, read the defined `App` component and data retrieval method from it. Next, create the template file for the client-side entry, write the data into the entry template file via the scheduled data retrieval method. At this stage, we can execute the `commonjs` components for packaging and output the HTML. The client-side `React Hydrate` code can also be packaged here, and finally, replace and write all resource file imports into the HTML output file. Once we have completed the packaging and output files, we can use a static resource server to start previewing the `SSG` page.

```js
const appPath = path.resolve(__dirname, "./app.tsx");
const entryPath = path.resolve(__dirname, "./entry.tsx");
require.extensions[".less"] = () => undefined;

(async () => {
  const distPath = path.resolve("./dist");
  const tempPath = path.resolve("./.temp");
  await fs.mkdir(distPath, { recursive: true });
  await fs.mkdir(tempPath, { recursive: true });
```

```javascript
  const { stdout: serverStdout } = await exec(`npx rspack -c ./rspack.server.ts`);
  console.log("Server Compile", serverStdout);
  const nodeSideAppPath = path.resolve(tempPath, "node-side-entry.js");
  const nodeSideApp = require(nodeSideAppPath);
  const App = nodeSideApp.default;
  const getStaticProps = nodeSideApp.getStaticProps;
  let defaultProps = {};
  if (getStaticProps) {
    defaultProps = await getStaticProps();
  }

  const entry = await fs.readFile(entryPath, "utf-8");
  const tempEntry = entry
    .replace("<props placeholder>", JSON.stringify(defaultProps))
    .replace("<index placeholder>", appPath);
  await fs.writeFile(path.resolve(tempPath, "client-side-entry.tsx"), tempEntry);

  const HTML = ReactDOMServer.renderToString(React.createElement(App, defaultProps));
  const template = await fs.readFile("./public/index.html", "utf-8");
  const random = Math.random().toString(16).substring(7);
  const { stdout: clientStdout } = await exec(`npx rspack build -- --output-filename=${random}`);
  console.log("Client Compile", clientStdout);

  const jsFileName = `${random}.js`;
  const html = template
    .replace(/<!-- INJECT HTML -->/, HTML)
    .replace(/<!-- INJECT STYLE -->/, `<link rel="stylesheet" href="${random}.css">`)
    .replace(/<!-- INJECT SCRIPT -->/, `<script src="${jsFileName}"></script>`);
  await fs.writeFile(path.resolve(distPath, "index.html"), html);
})();
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.sanity.io/ssr-vs-ssg-guide
https://react.docschina.org/reference/react-dom
https://www.theanshuman.dev/articles/what-the-heck-is-ssg-static-site-generation-explained-with-nextjs-5cja
```