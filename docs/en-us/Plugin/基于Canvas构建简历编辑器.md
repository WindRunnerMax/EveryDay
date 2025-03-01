# Building a Resume Editor Based on Canvas

About a month ago, I noticed that Juejin kept recommending `Canvas`-related content to me, such as various projects like games, flowchart editors, and image editors. I'm not sure if it's because I clicked on related content triggering the recommendation algorithm or if it's because `Canvas` is currently popular and everyone is diving into it. Following the principle of "I may not need it, but I shouldn't be clueless about it," I spent nearly a month using `Canvas` to create a resume editor.

Related articles about the Canvas resume editor project:

* [Juejin Keeps Recommending Canvas, So I Learned Canvas and Made a Resume Editor](./基于Canvas构建简历编辑器.md)
* [Canvas Resume Editor - Data Structures and History (undo/redo)](./Canvas编辑器之数据结构设计.md)
* [Canvas Resume Editor - What Data is Actually in My Clipboard](./Canvas编辑器之剪贴板数据处理.md)
* [Canvas Resume Editor - Graphic Drawing and State Management (Lightweight DOM)](./Canvas编辑器之图形状态管理.md)
* [Canvas Resume Editor - Monorepo and Rspack Project Practice](./Canvas编辑器之Rspack工程实践.md)
* [Canvas Resume Editor - Hierarchical Rendering and Event Management Design](./Canvas编辑器之层级渲染事件管理.md)
* [Canvas Resume Editor - Selected Drawing and Drag-and-Drop Multi-Selection Interaction Scheme](./Canvas编辑器之选中绘制交互方案.md)

Why create a resume editor from scratch:

1. Fixed templates are not user-friendly, as using various templates often leads to dissatisfaction with details such as fixed module positions or undesirable page margins. With a resume editor implemented through `Canvas`, everything is graphics-based, relying entirely on drawing on the canvas. This eliminates any layout issues and allows for unrestricted drawing on a given base graphic.
2. Data security cannot be guaranteed in online platforms where resumes often contain personal information like phone numbers and email addresses. While most resume websites require login and store data on servers, this editor is a pure frontend project. All data is stored locally with no server upload actions, ensuring complete data security.
3. Maintaining a single-page resume can be challenging. Using a certain resume template website in the past, writing too much in one section would result in a multi-page export. However, it is widely known that resumes are best kept to one page. This editor generates a `PDF` directly through layout formatting, so setting the page size ensures a one-page export, enhancing aesthetics.

## Background
I had a resume editor project based on `DOM`, but unable to find an interesting scenario to implement using `Canvas`, I decided to continue with the resume editor. Initially, the idea of creating a resume editor stemmed from dissatisfaction with existing resume websites that either required membership or lacked customization options to achieve the desired effects. One evening at school, I thought of making my own.

Driven by a learning attitude and curiosity about technology, I manually implemented various aspects like data structure in `packages/delta`, plugin system in `packages/plugin`, and core modules in `packages/core`, apart from using utility packages like `ArcoDesign`, `ResizeObserve`, `Jest`, etc. The focus here was on learning and not product development - writing one's own code for personal learning projects and using existing packages for commercial projects is the principle. When personally learning, one aims to delve deeper into relatively low-level capabilities and encounter more challenges to gain a better understanding of related abilities. In contrast, commercial projects prioritize mature products since dealing with edge cases and accumulated issues wouldn't be as easily handled.

Open-source repository: https://github.com/WindrunnerMax/CanvasEditor.  
Online demo: https://windrunnermax.github.io/CanvasEditor/.

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7675bdd77fbd4d36badf1a1d5dba787e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=3732&h=1886&s=1075098&e=png&b=ffffff)

## Notes
Since my primary goal was to learn basic `Canvas` knowledge and skills, many functional modules were implemented in a simple manner, focusing on usability. Despite the simplicity, mastering graphics programming is quite challenging. For more complex capabilities, I would prefer using toolkits like `konva`. Even while implementing basic functions, I encountered numerous issues while coding, prompting me to record my thought processes for troubleshooting.

### Data Structure
The design of the data structure, similar to `DeltaSet`, ultimately presents a flattened form, but in the `Core`, there needs to be a design of `State` to manage the tree structure because the functionality of `Undo/Redo` needs to be implemented. Without storing full snapshots, it means that atomic `Op` must be designed. Since the desired functionality involves combining capabilities, the final implementation form is actually a tree structure, even though I prefer a flattened structure. Searching in a tree structure is more cumbersome, and the types of `Op` to be implemented will also increase. I aim to minimize the types of `Op` as much as possible and achieve `History`. Therefore, the final data structure decided is to use `DeltaSet` for storage, managed by `State` to handle the entire editor's state.

### History
The atomic `Op` has been designed, so when designing the `History` module, there is no need to store full snapshots. However, it may not be ideal if each operation needs to be immediately included in the `History Stack`. Typically, `N` operations need to be grouped for `Undo/Redo`. This module should have a timer that, if no new `Op` is added within `N` milliseconds, the `Op` will be included in the `History Stack`. One challenge I encountered was if the user performs an `Undo` operation within the `N` milliseconds. The solution is simple: just clear the timer and immediately place the queued `Op[]` into the `Redo Stack`.

### Drawing
Every element is a rectangle, and the data structure is abstracted based on this. When drawing, it is divided into two layers of overlapping `Canvas`. The inner `Canvas` is used to draw specific graphics and requires incremental updates. On the other hand, the outer `Canvas` is used to draw intermediate states such as selecting graphics, multiple selections, adjusting positions/sizes, etc., where full refresh is needed. Additionally, rulers may be drawn here later. During the implementation of interactions, a challenging issue I faced was the absence of a `DOM`, requiring calculations based on position information for all operations. Managing states and drawing UI interactions became complex. To handle this, I had to differentiate based on the state to carry different payloads and perform interactions.

### Drawing State
When implementing drawing, I contemplated how to achieve this capability. Initially, I managed states in a chaotic way based on event triggers and method executions via `MouseDown`, `MouseMove`, `MouseUp`, leading to frequent redraws. Realizing this code was not maintainable, I centralized the required states into a `Store`, notifying state changes through custom event management. Although this provided better clarity on state changes, the complex methods and nested layers made maintenance challenging. Eventually, I decided to emulate `DOM` capabilities in drawing, as it seemed essential for the intended functionalities. This approach simplified state management and interactions, relying on users to use `DOM` APIs for handling `ROOT` elements, making future state management more convenient.

### Rendering and Events
Considering simulations of `DOM` for drawing and interacting with the Canvas, two crucial aspects are `DOM` rendering and event handling. Let's discuss rendering first. Using a Canvas is akin to positioning all `DOM` elements absolutely; rendering is relative to the Canvas's position. Since we lack a browser's rendering compositor layer, rendering strategies must be devised. For instance, when elements overlap, the `zIndex` determines the rendering order within the same level. We need to mimic this behavior but with a single layer of operation. Thus, rendering by sorting based on a node's `zIndex` before traversal ensures correct overlap relationships between same-level nodes, following a depth-first recursive rendering sequence.

### On Rendering and Event Implementation

On top of rendering, there's also the consideration for event implementation. For instance, in our selected state, the eight resizing points must be above the selection node. So, when simulating the `onMouseEnter` event, since there's a certain overlap between these 8 resizing points and the selection node, if the mouse moves over the overlapping point, the event triggered should be solely for that point and not for the subsequent selection node events. Due to the lack of a `DOM` structure, we are left with coordinate calculations only. The simplest approach here is to ensure the traversal order - meaning the high nodes must be traversed before the low nodes. Upon finding the node, the traversal ends, triggering the event. Simulating event capturing and bubbling mechanisms is also necessary. In reality, this order is inverted compared to rendering. We desire the topmost elements like a tree's right subtree being traversed in a postorder manner. Swapping the output of preorder traversal, left subtree, and right subtree essentially achieves this. However, a problem arises during frequent triggering of events like `onMouseMove`. Calculating the node's position each time and using depth-first traversal is performance-intensive. Therefore, a typical space-time tradeoff solution is implemented. All child nodes of the current node are stored in order. If a node changes, all its parent nodes at every level are notified to recalculate directly. This on-demand calculation not only saves time for unchanged subtrees but also saves computational resources by storing node references instead, thus transforming recursion into iteration. Moreover, once the current node is found, there's no need for recursive triggering during the simulation of event capturing and bubbling. This can be achieved through two stacks.

### Focus

Given my extensive involvement in rich text-related functionalities, while implementing the drawing board, I tend to follow the design principles of rich text features. As I had planned to implement functionalities like `History` and rich text editing capabilities, focus becomes crucial. When the focus isn't on the drawing board, actions like undo/redo shouldn't respond on the board. Hence, a state is required to control whether the focus is on the `Canvas`. After researching, two solutions were uncovered. The first involves using `document.activeElement`, but since `Canvas` doesn't have a focus, setting the `tabIndex="-1"` attribute to the `Canvas` element allows the focus status to be obtained through `activeElement`. The second solution entails overlaying a `div` above the `Canvas` to prevent mouse pointer events using `pointerEvents: none`. However, with this setup, `window.getSelection` can still retrieve the focused element. Simply checking if the focused element matches the designated element resolves this issue.

### Infinite Canvas

Initially, I hadn't planned to implement capabilities like panning or an infinite canvas during the design phase. However, when I started implementing the desired business functionalities using this main framework, I realized the necessity of such capabilities. While the functionality itself isn't complex, not initially considering it posed challenges later on. Issues such as misaligned refresh rates in batch processing for `Mask`, incorrectly calculated translations for `ctx.translate`, and faulty calculations for areas exceeding the canvas were encountered. It felt inconvenient to suddenly introduce a feature without prior design considerations. Nevertheless, it didn't necessitate extensive restructuring, but rather minor adjustments in specific areas.

Additionally, aside from this, some auxiliary tools like `resize-observer` and component libraries like `arco-design` were custom-built for this project, effectively constituting an engine for `Canvas`. Especially under the current `core-delta-plugin-utils` structural design, it is feasible to abstract and use them as utility packages. However, in terms of usability and performance, they may not match up to well-known open-source frameworks. Today, I happened to come across a noteworthy comment: for personal skill enhancement, it's best to first understand open-source libraries and then replicate their functionalities for learning purposes. Whereas for commercial use, reliance on established open-source libraries takes precedence, significantly reducing costs.

### Performance Optimization

During the implementation process, drawing performance optimization mainly involves:
1. Drawing within the visible area; elements completely outside the canvas aren't drawn.
2. On-demand drawing; only elements within the current operation's scope are drawn.
3. Layered drawing; high-frequency operations are drawn on the upper canvas, while basic elements are drawn on the lower canvas.
4. Throttling batch drawing; frequently executed operations are throttled for drawing, with dependencies collected on the upper canvas for batch drawing.

### Hyperlinks

As commonly known, what `Canvas` draws is essentially an image, lacking the ability for clickable links when exporting to `PDF`. To address this limitation, I devised a solution where, during export, a transparent `a` tag is generated through `DOM`, overlaying the original hyperlink position. This enables achieving the clickable link effect. Since `PDF` itself is a file format, leveraging tools like `PDFKit/PDFjs` for `PDF` typesetting and export is feasible. This approach allows direct positioning during export, circumventing browser print pagination constraints.

## TODO

Given the relatively simplistic implementation approach I've currently adopted, many functionalities are yet to be perfected. There are several capabilities I aim to develop:
- Layer adjustment: Although I've already designed this capability in the core, the missing aspect is the UI for invoking the adjustment.
- Page configuration: Noticing many resumes deviating from standard `A4` paper size, addressing the canvas size adjustment becomes necessary.
- Import/export JSON: Essential for importing/exporting data in the underlying data structure.
- Typeset PDF export: Likely requires coordination with page configuration. The current PDF export relies on browser printing, subject to pagination limits. Manually typesetting can overcome this restraint, ensuring each page corresponds to the size of a resume.
- Copy-paste module: A useful feature for editing, necessitating its addition.


## Final Thoughts
I must say, I had a decent experience with `Canvas` this time around. I plan to share some articles on the challenges I faced during implementation and how I overcame them. However, my main focus for now remains on developing the rich text editor, another bottomless pit in itself. I might start with editor-related articles in the near future.

## Question of the Day

```
https://github.com/WindRunnerMax/EveryDay
```

## References

```
https://github.com/WindRunnerMax/CanvasEditor
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas
https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
```  