# Collapsible Unordered List Plugin Based on Markdown-it

`Markdown` has become the best programming language, and `Md` has become the most needed format for product documentation, especially for developer-facing documentation. In many scenarios, programming and documentation are quite similar, so driven by the era, the demand for document systems that natively support `Md` production and consumption is re-emerging.

Here we focus on `API` documentation display. In the `API` documentation of `OpenAI` and `Claude`, you can see that their parameter lists are expressed in a collapsible list format. By observing the original `Md` document, you can see that the parameter list is in the form of an unordered list, so we also implement similar functionality to convert unordered lists into collapsible list displays.

In fact, rendering unordered lists as collapsible lists is primarily for developer reading. If it's purely for `AI` consumption, providing plain text `Md` content is sufficient. Currently, the state where both developers and `AI` need to be served should exist for a considerable time, so implementing a `Md` renderer is still necessary.

## Parsing Rules

First, we need to analyze the unordered list structure and its parsed `HTML`. The basic unordered list structure is as follows:

```md
- 0
- 1
  - 1.1
  - 1.2
    - 1.2.1
    - 1.2.2
  - 1.3
    with desc
    - 1.3.1
    - 1.3.2
- 2
```

```html
<ul>
  <li>0</li>
  <li> 1
    <ul>
      <li>1.1</li>
      <li> 1.2
        <ul>
          <li>1.2.1</li>
          <li>1.2.2</li>
        </ul>
      </li>
      <li> 1.3 <br /> with desc
        <ul>
          <li>1.3.1</li>
          <li>1.3.2</li>
        </ul>
      </li>
    </ul>
  </li>
  <li>2</li>
</ul>
```

As you can see, there is a three-level nested `ul` element structure in the example, as well as `li` elements with description content. We need to parse them according to different situations. Theoretically, only `li` elements with nested structures need to be parsed into collapsible structures. The content from the start to the `ul` within its child elements should be used as the title, and the elements inside the `ul` should be the expanded content of the collapsible section.

Generally speaking, to implement an accordion-like effect, one would typically manage state actively, use `div` or other elements to draw the collapsible panel, and then actively handle click events to toggle the collapsed/expanded state. However, `HTML` natively supports the `details` and `summary` elements, so we can use these native elements to implement the collapsible list effect, which has the following main advantages:

- Simple and easy to use; in most cases, you don't need to actively manage state, only maintain the `DOM` structure.
- No event handling required, especially in `SSR` scenarios, there's no need to inject events during `hydrate`.
- Native search support; when using browser search, collapsible lists containing search keywords can be automatically expanded.

```html
<details>
  <summary>Details</summary>
  Something more.
</details>
```

Based on the above `HTML` structure, we can convert the unordered list structure into a `details+summary` element structure. Observing its structure, we can implement the following conversion rules:

- The `ul` element serves as the expanded content of the collapsible section, which can be customized as a `block` element or kept as a `ul` element.
- When an `li` element contains a nested direct child `ul` element, that `li` element needs to be converted to a `details` element.
- For the converted `details` element, the content from the start to the `ul` element needs to be wrapped in a `summary` element.

Based on the above conversion rules, we can convert the initial unordered list `HTML` content into a `details + summary` element structure:

```html
<ul>
  <li>0</li>
  <details>
    <summary>1</summary>
    <ul>
      <li>1.1</li>
      <details>
        <summary>1.2</summary>
        <ul>
          <li>1.2.1</li>
          <li>1.2.2</li>
        </ul>
      </details>
      <details>
        <summary>1.3 <br /> with desc</summary>
        <ul>
          <li>1.3.1</li>
          <li>1.3.2</li>
        </ul>
      </details>
    </ul>
  </details>
  <li>2</li>
</ul>
```

## Element Reconstruction

After designing the `HTML` structure conversion rules, we need to implement the conversion logic based on `MarkdownIt`. `MdIt` provides various `Hook` functions at different stages. We need to implement the conversion logic according to these processing stages. Generally speaking, we should try to implement related logic in the post-processing stage as much as possible. Here we implement both post-parsing processing and render-time processing.

### Render-Time Processing

So first, let's look at the `rule` processing logic for the render-only phase. In the above conversion rules, converting the `ul` element to a `block` element and rendering the `li` element as a `details` element are straightforward. However, wrapping child nodes with a `summary` element is more troublesome.

In the render-only phase, this is not impossible to implement, but it easily breaks `MdIt`'s linear parsing mode. If this were a recursive structure, we would only need to wrap one layer of `DOM` elements around its nodes. However, in a linear structure, wrapping a layer of `summary` element requires appending a `<summary>` element at `li_open` and prepending `</summary>` before `ul_open`.

```js
mdIt.renderer.rules.bullet_list_open = (tokens: Token[], idx: number) => {
  const current = tokens[idx];
  for (let i = idx - 1; i >= 0; i--) {
    const token = tokens[i];
    if (token.level < current.level - 1) break;
    if (token.type === "list_item_open" && token.level === current.level - 1) {
      return "</summary>" + "<ul class=\"bullet-summary-group\">";
    }
  }
  return "<ul class=\"bullet-summary-group\">";
};
mdIt.renderer.rules.list_item_open = (tokens: Token[], idx: number) => {
  const current = tokens[idx];
  for (let i = idx + 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.level <= current.level)  break;
    if (token.type === "bullet_list_open" && token.level === current.level + 1) {
      return "<details>" + "<summary>";
    }
  }
  return "<li>";
};
mdIt.renderer.rules.list_item_close = (tokens: Token[], idx: number) => {
  const prevToken = tokens[idx - 1];
  if (prevToken && prevToken.tag === "ul") return "</details>";
  return "</li>";
};
```

Although this approach is simple to implement and theoretically works fine, the problem here is that if we need to keep the unordered list in most cases and only render it as a collapsible list when expressing `API` parameters, then we add the `@bullet-summary` directive above the `ul` element to specify the rendering mode.

```md
@bullet-summary
- ul
   - li
   - li
```

The question then is how to determine whether the embedded `ul` element needs to be rendered as a collapsible list. At render time, it's not easy to get this rendering directive because it is flat. So every time a `rule` render is dispatched, we need to iterate upward to find the directive. If we process the `p` element at render time, then writing data at consumption time is somewhat anti-logical.

```js
mdIt.renderer.rules.list_item_open = (tokens: Token[], idx: number) => {
  const current = tokens[idx];
  for (let i = idx - 1; i >= 0; i--) {
    // Find the top-level ul element of this group and check for the preceding @bullet-summary directive
  }
};

mdIt.renderer.rules.bullet_list_open = (tokens: Token[], idx: number) => {
  // Check if the preceding element is a @bullet-summary directive, then set a variable in env
};
mdIt.renderer.rules.bullet_list_close = (tokens: Token[], idx: number) => {
  // Check the env variable set for the matching ul, then clear the env variable
};
```

### Parsing-Time Processing

In `MdIt`'s parsing process, in addition to the `rule` processing logic at render time, you can also post-process `Token` after the parsing stage. At this point, you can find the relevant directives and implement the conversion logic. Since we haven't implemented any new syntax, the directives mainly serve as markers, so there's no need to parse the content at specific times; instead, we reorganize the `Tokens`.

So at this point, we first check for the directive marker. If the marker is found, we need to enter the `Tokens` reconstruction phase. However, before that, we need to hide this directive node. But if the rendering directive is of the comment type, it can be hidden directly without special processing.

```js
// paragraph_open
//   inline: @bullet-summary
// paragraph_close
// bullet_list_open
if (
  token.content === identifier &&
  token.type === "inline" &&
  nextToken &&
  nextStep2Token &&
  nextToken.type === "paragraph_close" &&
  nextStep2Token.type === "bullet_list_open"
) {
  prevToken && (prevToken.hidden = true);
  (token.hidden = true) && (token.children = []);
  nextToken && (nextToken.hidden = true);
  rebuildUlTokens(state, i + 2);
}
```

Next, we need to find the corresponding `close` node of this node to define the specific processing range. Since `MdIt`'s parsing is linear, although it avoids recursive problems, the worst-case time complexity is still `O(n)`. Additionally, since `token.level` is not very accurate, we need to maintain a stack depth to record the current nesting level.

```js
const baseType = openToken.type.slice(0, -5);
const closeType = baseType + "_close";
// open      1
// start iterator
//   open    2
//   close   1
// close     0
// end iterator
let level = 1;
for (let i = openIdx + 1; i < tokens.length; i++) {
  const token = tokens[i];
  if (token.type === openToken.type) {
    level++;
  } else if (token.type === closeType) {
    level--;
    if (level <= 0) return i;
  }
}
return -1;
```

Next, we need to make some modifications to the `ul` element, mainly adding a `class` attribute to the `ul` for styling purposes. Then we maintain a stack to record the corresponding nodes of `li` elements. Also, an important point here is to traverse from back to front to avoid modifications to preceding content affecting the processing of subsequent nodes, especially when inserting elements.

```js
const stack: Token[] = [];
// Traverse from back to front to avoid modifications affecting subsequent i traversal
for (let i = closeIdx; i >= startIdx; i--) {
  const token = tokens[i];
  if (token.type === "bullet_list_open") {
    token.attrJoin("class", "bullet-summary-group");
  }
  if (token.type === "list_item_close") {
    stack.push(token);
  }
  if (token.type === "list_item_open") {
    const peer = stack.pop();
    rebuildLiTokens(state, i, peer, actions);
  }
}
```

When matching a `list_item_open` node, we need to reconstruct the `li` element structure, which is more complex. First, we create an iterator for the corresponding element region to traverse all nodes between `open` and `close`. The important implementation in the iterator is to carry relevant `meta` information to assist in calculating level relationships.

```js
let depth = 0;
for (let i = openIdx; i < tokens.length; i++) {
  const token = tokens[i];
  if (token.nesting >= 0) {
    depth++;
  }
  yield { token, depth: depth - 1, idx: i, serial: i - openIdx };
  if (token.nesting <= 0) {
    depth--;
    if (depth <= 0) break;
  }
}
```

During the traversal of the `li` node region, we need to determine its direct child elements based on `depth`. If the direct child element is a `ul`, it means that `li` element nests an unordered list, so it needs to be converted to a `details` element. Note that modifying its `type` should not affect the outer stack; we need to ensure the relationship is maintained correctly.

```js
// Find child items under li, mainly to check its direct child elements
for (const node of walker) {
  const k = node.idx;
  const tokenK = node.token;
  if (node.depth !== 1) continue;
  // Direct ul child item; if it exists, it needs to be converted to a details group
  if (tokenK.type === "bullet_list_open") {
    // The li element at i needs to become a details element
    liToken.type = "li_details_open";
    liToken.tag = "details";
  }
}
```

Next, we need to create a `summary` element for the elements between `i` and `k` to specify the collapsible title. This is the most difficult point because we not only need to modify the content but also insert new `token`s. And we need to process its `peer` node, converting its `token.type` to a `li_details_close` element.

```js
// Create summary for elements between i and k
const sOpen = new state.Token("li_summary_open", "summary", 1);
const sClose = new state.Token("li_summary_close", "summary", -1);
// Now peer is the element after i, which won't affect the original stack balance of li traversal
if (peer) {
  peer.type = "li_details_close";
  peer.tag = "details";
}
// Handle the insertion position of summary elements
actions.push({ idx: openIdx + 1, token: sOpen });
actions.push({ idx: k, token: sClose });
```

The above `actions` is the point that needs attention. We don't directly modify the `tokens` array because modifying the `tokens` array at this time would cause its length to change, which would affect the traversal of subsequent nodes and the calculation of insertion positions. Here we uniformly handle insertion behavior. What needs to be noted is that sorting by index from largest to smallest ensures that elements with later indices don't affect elements with earlier indices.

```js
actions
  .sort((a, b) => b.idx - a.idx)
  .forEach(action => {
    tokens.splice(action.idx, 0, action.token);
  });
```

Finally, since we inserted a new level, we need to update the `level` inside as well. From this, we can also see that `level` is not that accurate. If the registered plugin doesn't handle `level` properly, it will affect plugins that depend on this field.

```js
// Handle the level of summary and its internal elements
sOpen.level = liToken.level + 1;
sClose.level = liToken.level + 1;
for (let i = openIdx + 1; i < k; i++) {
  const token = tokens[i];
  token.level = (token.level || 0) + 1;
}
```

## CSS Styles

Actually, since different browsers have different default styles for `details + summary` elements, we need to unify their styles. However, this is mainly handled by the component library; we only need to focus on its basic functionality. Also, it's worth mentioning that `summary` needs a `border` style, especially when there is multi-line content.

```css
/*
 * Add the correct display in Edge, IE 10+, and Firefox.
 */
details {
  display: block;
}

/*
 * Add the correct display in all browsers.
 */
summary {
  display: list-item;
}
```

## Summary

Here, based on `MdIt`, we parsed the basic unordered list structure, observed its hierarchy, and designed a set of `DOM` structure conversion rules. Based on this, we implemented the collapsible unordered list plugin using both pure render mode and post-parsing processing mode. This structural expression is very useful in mind maps and `API` parameter expressions.

Actually, there are many areas for optimization in the plugin we implemented. First, we can combine structured expression with render-time expression. During post-parsing processing, we only need to write relevant `token` markers, and handle the tag structure during rendering. Additionally, when processing structural writes, all changes should be processed uniformly to avoid affecting existing traversal and judgment. Theoretically, `OT-JSON` should be introduced to handle the interaction between various changes.

## Daily Question

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://markdown-it.github.io/>
- <https://zhuanlan.zhihu.com/p/400036665>
- <https://juejin.cn/post/7598480413803757610>
- <https://markdown-it.github.io/markdown-it/>
- <https://github.com/mqyqingfeng/Blog/issues/254>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details>
- <https://developers.openai.com/api/reference/resources/responses/methods/create>
