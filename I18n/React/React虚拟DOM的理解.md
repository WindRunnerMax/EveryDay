# Understanding the Virtual DOM in React
The `Virtual DOM` is a tree based on JavaScript objects, where each node can be called a `VNode`, used to describe nodes with object properties. In reality, it is an abstraction layer of the real `DOM`, which can ultimately be mapped to the real environment through rendering operations. Simply put, `Virtual DOM` is just a JavaScript object, a more lightweight description of the `DOM` used to represent the entire document.

## Description
When building a web page in the browser, it is necessary to use `DOM` nodes to describe the entire document.

```html
<div class="root" name="root">
    <p>1</p>
    <div>11</div>
</div>
```

If we describe the above nodes and document using JavaScript objects, it looks something like this:

```javascript
{
    type: "tag",
    tagName: "div",
    attr: {
        className: "root",
        name: "root"
    },
    parent: null,
    children: [{
        type: "tag",
        tagName: "p",
        attr: {},
        parent: {} /* reference to the parent node */,
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* reference to the parent node */,
            content: "1"
        }]
    },{
        type: "tag",
        tagName: "div",
        attr: {},
        parent: {} /* reference to the parent node */,
        children: [{
            type: "text",
            tagName: "text",
            parent: {} /* reference to the parent node */,
            content: "11"
        }]
    }]
}
```

## Virtual DOM in React
`Virtual DOM` is a programming concept where the UI is saved in an idealized or virtual form in memory and is synchronized with the real `DOM` through libraries such as `ReactDOM`, a process known as reconciliation. This approach gives `React` a declarative API, where you tell `React` what state you want the UI to be in, and `React` ensures that the `DOM` matches that state. This frees us from necessary operations in building applications, such as property operations, event handling, and manual `DOM` updates.

Instead of viewing `Virtual DOM` as just a technology, it is more accurate to see it as a pattern. When people mention it, they often want to express different things. In the world of `React`, the term `Virtual DOM` is usually associated with `React` elements, as they both represent objects of the user interface. `React` also uses an internal object called `fibers` to store additional information about the component tree, both of which are considered part of the implementation of the `Virtual DOM` in `React`.

### History of the Virtual DOM in React
Initially, `Facebook` was a big player in `PHP`, and that's where the initial inspiration for `React` came from. Around 2004, everyone was still using string concatenation in `PHP` to develop websites.

```php
$str = "<ul>";
foreach ($talks as $talk) {
  $str += "<li>" . $talk->name . "</li>";
}
$str += "</ul>";
```

Not only was this approach visually unappealing, but it also posed security risks such as `XSS`. The solution was to escape any user input, but if a string was escaped multiple times, it had to be unescaped the same number of times; otherwise, the original content would be lost. If HTML tags were accidentally escaped, they would be displayed directly to the user, leading to a poor user experience. By 2010, to code more efficiently and avoid errors in escaping HTML tags, `Facebook` developed `XHP`, a syntax extension for `PHP`. It allowed developers to directly use HTML tags in PHP without using strings.

```php
$content = <ul />;
foreach ($talks as $talk) {
  $content->appendChild(<li>{$talk->name}</li>);
}
```

This way, all HTML tags used a syntax different from PHP's, making it easy to distinguish which needed to be escaped and which didn't. Shortly after, `Facebook`'s engineers found they could create custom tags and that combining custom tags helped build large applications. By 2013, frontend engineer `Jordan Walke` proposed a bold idea to his manager: migrate the extension features of `XHP` to `Js`, with the primary task being to add an extension to enable `JS` to support `XML` syntax, called `JSX`. Due to the extensive experience with `Node.js` at `Facebook`, the implementation of `JSX` was quickly achieved.

```jsx
const content = (
  <TalkList>
    {talks.map(talk => <Talk talk={talk} />)}
  </TalkList>
);
```

At this point, there's another tricky problem, which is when updating, we need to manipulate the `DOM`. The traditional `DOM API` has too many details, making the operation complex and prone to bugs, and the code becomes hard to maintain. Then, I thought of the update mechanism in the `PHP` era, which only required jumping to a completely re-rendered new page whenever there was a data change.  
From a developer's perspective, this method of application development is very simple because it doesn't require worrying about changes and ensures that all content is synchronized when user data changes on the interface. Therefore, `React` came up with a new idea, which is to always refresh the entire page. When there is a change in the state, `React` automatically updates the `UI`, freeing us from complex `UI` operations and allowing us to focus only on the state and how the final `UI` should look. At this point, all I need to care about is my state (what the data is) and how the `UI` should look (layout), without worrying about the operational details.  
Although this approach is straightforward, one obvious drawback is that it is very slow. Another issue is that it cannot contain the state of nodes, such as losing the currently focused element and cursor, as well as text selection and page scrolling position, which are all part of the current page state.  
To address the aforementioned issues, for `DOM` nodes that haven't changed, they are kept unchanged, and only the changed `DOM` nodes are created and replaced. This approach achieves `DOM` node reuse. Therefore, once we can identify which nodes have changed, we can update the `DOM`, and the problem then becomes how to compare the differences between two `DOM`s. Speaking of diffing, you might easily think of version control with `git`. Since `DOM` is a tree structure, the `diff` algorithm must be targeted towards tree structures. The known complete tree structure edit distance `diff` algorithm complexity is `O(n^3)`. But `O(n^3)` time complexity is too high, so `Facebook` engineers optimized and compromised for the special case of components, and then reduced the complexity to `O(n)`.  
`DOM` is complex, and operations on it, especially querying and creating, are very slow and resource-consuming. Consider the example below, creating an empty `div` has instance properties reaching `294`.

```javascript
// Chrome v84
const div = document.createElement("div");
let m = 0;
for (let k in div) m++;
console.log(m); // 294
```
For the `DOM` with so many properties, most of them are of no use for `Diff`. Therefore, replacing the complex `DOM` nodes with a lighter weight `Js` object and transferring the `Diff` operation to the `Js` object can avoid a large number of `DOM` querying operations. This lighter weight `Js` object is referred to as the `Virtual DOM`. So the process now becomes:

* Maintain a `Virtual DOM` represented by a `Js` object, corresponding one-to-one with the real `DOM`.
* Compare the `Diff` between the previous and current `Virtual DOM` to generate changes `Mutation`.
* Apply the changes to the real `DOM` to generate the latest real `DOM`.

As can be seen, because the changes need to be applied to the real `DOM`, it is still inevitable to directly manipulate the `DOM`, but `React`'s `diff` algorithm minimizes the number of `DOM` changes. For the virtual `DOM` creation process in `React`, please refer to `https://github.com/facebook/react/blob/9198a5cec0936a21a5ba194a22fcbac03eba5d1d/packages/react/src/ReactElement.js#L348`.

### Summary
The traditional front-end programming approach is imperative, directly manipulating the `DOM` and telling the browser what to do. The problem with this is that a lot of code is used to manipulate `DOM` elements, resulting in poor code readability and maintainability. The advent of `React` transformed the imperative programming into declarative, eliminating the details of directly manipulating the `DOM` and focusing only on data changes, while the `DOM` manipulation is handled by the framework, greatly enhancing code readability and maintainability.  
In the early stages, we could see that data changes led to a full page refresh, which was inefficient because it could be a local data change but required refreshing the entire page, causing unnecessary overhead. This is where the `Diff` process comes in, comparing the `DOM` structure before and after the data change, finding the differences, and then updating and rendering only the differences. However, due to the large `DOM` structure, a lighter weight representation of the `DOM` - the virtual `DOM` - was adopted.  
It is important to note that the emergence of virtual `DOM` and `Diff` algorithms is to address the performance issues brought about by the transition from imperative programming to declarative programming and data-driven development. In other words, the performance of directly manipulating the `DOM` is not lower than that of the virtual `DOM` and `Diff` algorithms, and may even be superior. The significance of a framework lies in masking the underlying `DOM` operations, allowing you to describe your goals in a more declarative way, making your code easier to maintain. No framework can be faster than manual optimization of `DOM` operations, because the framework's `DOM` operation layer has to deal with any operations that may arise from the upper-level `API`, and its implementation must be universal.

## Pros and Cons of Virtual DOM

### Advantages
* `Virtual DOM` increases maintainability at the expense of some performance, a common trait in many frameworks.
* It centralizes operations on the `DOM`, making changes to the virtual `DOM` before reflecting them onto the real `DOM`, thereby updating the `DOM` with minimal cost to improve efficiency.
* It opens the door to functional UI programming.
* It can render to platforms other than the `DOM`, making the framework cross-platform, such as `ReactNative`, `React VR`, and more.
* It can better implement `SSR`, isomorphic rendering, and more.
* It highly abstracts components.

### Disadvantages
* When rendering a large amount of `DOM` for the first time, the additional computation of the virtual `DOM` makes it slower than using `innerHTML` insertion.
* The virtual `DOM` requires maintaining a copy of the `DOM` in memory, which partly occupies more memory.
* If the virtual `DOM` undergoes significant changes, this approach is suitable. However, for single and frequent updates, the virtual `DOM` will spend more time on computation. Therefore, if you have a page with relatively few `DOM` nodes, using virtual `DOM` may actually be slower. However, for most single-page applications, it should be faster.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://zhuanlan.zhihu.com/p/99973075
https://www.jianshu.com/p/e0a3ac85db5c
https://www.jianshu.com/p/9a1d2750457f
https://github.com/livoras/blog/issues/13
https://juejin.cn/post/6844904165026562056
https://juejin.cn/post/6844903640512086029
https://zh-hans.reactjs.org/docs/faq-internals.html#what-is-the-virtual-dom
```