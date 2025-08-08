
# Building a Resume Editor Based on NoCode

Building a resume editor based on `NoCode` to prepare for the job fair. Various templates did not meet my satisfaction due to details, so I decided to create a simple drag-and-drop resume editor.

## Description

[GitHub](https://github.com/WindrunnerMax/ResumeEditor) ｜ [Resume DEMO](https://windrunnermax.github.io/ResumeEditor/)

The distinction between `NoCode` and `LowCode` can be easily confused. In my understanding, `NoCode` emphasizes self-programming for personal use, giving the user a sense of a more powerful and practical software, which is an upper-layer application. This means that `NoCode` needs to be targeted at a very specific domain in order to be useful. On the other hand, `LowCode` not only needs to consider building processes in a graphical way but also needs to expose the underlying system when expansion is required, providing stronger customization. This allows for more flexibility compared to `NoCode`, which does not restrict usage scenarios as much.  
For a resume editor, it falls into a very specific domain and does not require extensive code implementation for usage. It is meant to be used right out of the box as an upper-layer application. Personally, I decided to create it simply because I needed to prepare for the job fair and was not entirely satisfied with the various templates available on websites. The idea to create this editor came to me while I was taking a shower before going to bed one night, and I spent a weekend, which was just two days, to create a simple resume editor based on `NoCode`.  
Getting back to the point, to implement the resume editor, the following considerations need to be taken into account. Of course, since I completed it in just two days, I only implemented some basic functionalities:
* Need to support draggable page grid layout or free layout.
* Ability to independently edit various components.
* Functionality for generating `PDF` and previewing pages.
* Generation of configuration data in `JSON` format.
* Support for loading remote material resume templates.
* Implementation of basic components such as images, text, etc.

## Implementation

### Data Storage
For data, a `JSON` data is maintained here. There is a strict definition of the entire resume editor in TypeScript, so it is necessary to declare the component type definition in advance. Here, I declared `LocalComponentConfig` as the type definition for the component. As for the entire generated `JSON`, it is completed as a nested `LocalComponentConfig[]`.  
The resume displayed in the project is completely implemented using `JSON` configuration. The data and view rendering are completely separate. This allows us to implement different resume theme templates by writing multiple `JSON` configurations. If you open the mentioned `Resume DEMO`, you can see a preloaded resume, and its content is obtained entirely from the `JSON` configuration. Specifically, you can refer to `src/components/debug/example.ts`. If the data is stored in the local storage as a string, with the key as `cld-storage`, if there is no such key in the local storage, the initial resume example will be loaded. The data storage format is `{origin: ${data}, expire: number | number}`, and the data can be retrieved using `JSON.parse`. With this `JSON` data configuration.

```typescript
// Data Definition
// src/types/components-types.ts
export type LocalComponentConfig =  {
  id: string; // uuid
  name: string;
  props: Record<string, unknown>;
  style: React.CSSProperties;
  config: Record<string, unknown>;
  children: LocalComponentConfig[];
  [key: string]: unknown;
};
```

In this case, we actually have two sets of data structure definitions because the goal is to separate data from components. However, components also need to be defined in a specific place. Additionally, because the entire editor is expected to be detachable, each basic component is independently registered. Removing the registration part would not have any impact on the entire project. The only consequence would be that the view cannot be rendered successfully based on the `JSON` configuration, resulting in an empty final effect.

```typescript
// Component Definition
// src/types/components-types.ts
interface ComponentsBase {
  name: string;
  props?: Record<string, unknown>; // Default `props` passed to the component
  style?: React.CSSProperties; // Style configuration information
  config?: Record<string, unknown>; // Configuration information
}
export interface LocalComponent extends ComponentsBase {
  module: Panel;
}

// Component Definition
export const xxx: LocalComponent = {
  // ...
}

// Component Registration 
// src/index.tsx
register(image, richText, blank);
```

### Data Communication
The `JSON` data structure that needs to be maintained is quite complex. Here we use `Context + useImmerReducer` to implement state management. Of course, using `reducer` or `Mobx` is also possible. This is just what I think is a relatively simple solution.

```typescript
// src/store/context.tsx
export const AppProvider: React.FC<{ mode?: ContextProps["mode"] }> = props => {
  const { mode = EDITOR_MODE.EDITOR, children } = props;
  const [state, dispatch] = useImmerReducer(reducer, defaultContext.state);
  return <AppContext.Provider value={{ state, mode, dispatch }}>{children}</AppContext.Provider>;
};
```

### Page Grid Layout
The implementation of the grid layout is relatively simple and does not require the implementation of reference lines for alignment. It's sufficient to display the grid directly during dragging. Additionally, if there will be future expansion to generate PDFs of various widths, it won't cause confusion in the previous canvas layout, as it's inherently based on grid implementation and can handle width adjustments automatically. However, if mobile adaptation is needed, a set of `Layout` data will still need to be created.

In practice, this grid page layout is implemented as the canvas for the entire page layout. There are many libraries in the `React` ecosystem for this purpose, and I used the `react-grid-layout` library for drag-and-drop. For specific usage, you can find the GitHub link in the references section of this article. This library is quite good and can be used out of the box, but there are still many details that need to be handled. Regarding the `layout` configuration, since we store a `JSON` data structure, we need to generate the `layout` using our own defined data structure. During the generation process, if any changes to `cols` or `rowHeight` cause elements to exceed the original range, they need to be handled.

```typescript
// src/views/main-panel/index.tsx
<ReferenceLine
    display={!isRender && dragging}
    rows={rowHeight}
    cols={cols}
>
    <ResponsiveGridLayout
        className="pedestal-responsive-grid-layout"
        style={{ minHeight }}
        layout={layouts}
        autoSize
        draggableHandle=".pedestal-drag-dot"
        margin={[0, 0]}
        onLayoutChange={layoutChange}
        cols={cols}
        rowHeight={rowHeight}
        measureBeforeMount
        onDragStart={dragStart}
        onDragStop={dragStop}
        onResizeStart={resizeStart}
        onResizeStop={resizeStop}
        allowOverlap={allowOverlap}
        compactType={null} // Disable vertical compression
        preventCollision // Disable reordering
        useCSSTransforms={false} // Animation appears during `ObserveResize`
        >
    </ResponsiveGridLayout>
</ReferenceLine>
```

In the `<ReferenceLine/>` component, the grid points of the grid layout are drawn using `CSS`, thus achieving the function of a reference line.

```typescript
// src/views/main-panel/components/reference-line/index.tsx
<div
    className={classes(
    "pedestal-main-reference-line",
    props.className,
    props.display && "enable"
    )}
    style={{
    backgroundSize: `${cellWidth}px ${props.rows}px`,
    backgroundPositionX: cellWidth / 2,
    backgroundPositionY: -props.rows / 2,
    ...props.style,
    // background-image: radial-gradient(circle, #999 0.8px, transparent 0);
    }}
    ref={referenceLineRef}
>
    {props.children}
</div>
```


### Independent Editing of Components
With the basic canvas component in place, we need to implement various basic components. Therefore, independent editing functionality needs to be implemented for basic components, which consists of three parts: firstly, data modification, because editing ultimately needs to be reflected in the data, i.e., the `JSON` data that we need to maintain. Since we have a data communication solution, here we just need to define a `reducer` to write it to the corresponding component configuration `props` or other fields.

```typescript
// src/store/reducer.ts
switch (action.type) {
    // ...
    case actions.UPDATE_ONE: {
        const { id: uuid, key, data, merge = true } = action.payload;
        updateOneInNodeTree(state.cld.children, uuid, key, data, merge);
        break;
    }
    // ...
}

// src/utils/node-tree-utils.ts
/**
 * @param tree LocalComponentConfig.children
 * @param uuid string
 * @param key string
 * @param data unknown
 * @returns boolean
 */
export const updateOneInNodeTree = (
  tree: LocalComponentConfig["children"],
  uuid: string,
  key: string,
  data: unknown,
  merge: boolean
): boolean => {
  const node = findOneInNodeTree(tree, uuid);
  if (!node) return false;
  let preKeyData: unknown = node;
  const deepKey = key.split(".");
  const lastKey = deepKey[deepKey.length - 1];
  for (let i = 0, n = deepKey.length - 1; i < n; ++i) {
    if (isObject(preKeyData)) preKeyData = preKeyData[deepKey[i]];
    else return false;
  }
  if (isObject(preKeyData)) {
    const target = preKeyData[lastKey];
    if (isObject(target) && isObject(data)) {
      if (merge) preKeyData[lastKey] = { ...target, ...data };
      else preKeyData[lastKey] = { ...data };
    } else {
      preKeyData[lastKey] = data;
    }
    return true;
  }
  return false;
};
```

Next comes the implementation of the toolbar. For the toolbar, we need to determine the `name` of the selected element. After loading the toolbar, for user operations, we just need to apply them to the `JSON` data based on the current selected `id` through data communication, and these modifications will be applied in the view.

```typescript
// src/views/main-panel/components/tool-bar/index.tsx
const deleteBaseSection = () => {
    // ...
};

const copySection = () => {
    // ...
};

// ...
```

```tsx
<Trigger
    popupVisible={selectedId === config.id}
    popup={() => Menu}
    position="top"
    trigger="contextMenu"
>
    {props.children}
</Trigger>
```

When it comes to the editing panel, similar to the toolbar, you can simply load the form and apply the form data changes to the JSON data using a `reducer`. Since the implementation of the editor here is relatively simple, I also loaded a CSS editor. By combining with CSS, you can achieve more styling effects. Of course, by extending various component editing panel sections, you can minimize the need for custom CSS coding as much as possible.

```typescript
// src/views/editor-panel/index.tsx
const renderEditor = () => {
  const [selectNodeName] = state.selectedNode.name.split(".");
  if (!selectNodeName) return null;
  const componentInstance = getComponentInstanceSync(selectNodeName);
  if (!componentInstance || !componentInstance.main) return null;
  const Component = componentInstance.editor;
  return (
      <>
          <Component state={state} dispatch={dispatch}></Component>
          <CustomCSS state={state} dispatch={dispatch}></CustomCSS>
      </>
  );
};

// eslint-disable-next-line react-hooks/exhaustive-deps
const EditorPanel = useMemo(() => renderEditor(), [state.selectedNode.id]);
```

### Export to PDF
The PDF export function leverages the browser's capability, achieved by printing (Ctrl + P) to export to PDF. Note the following when exporting:
* The resume is fixed in size to `A4` paper, expanding the editing area may result in the resume spanning multiple pages.
* To export to PDF, set the paper size to `A4`, margins to none, and select the background graphics option in order to export a complete single-page resume.

### Basic Components

#### Image Component
The image component is used to upload and display images. As there is no backend, the images can only be stored in the JSON structure as base64 data.

```typescript
// src/components/image/index.ts
export const image: LocalComponent = {
  name: "image" as const,
  props: {
    src: "./favicon.ico",
  },
  config: {
    layout: {
      x: 0,
      y: 0,
      w: 20,
      h: 20,
      isDraggable: true,
      isResizable: true,
      minW: 2,
      minH: 2,
    },
  },
  module: {
    control: ImageControl,
    main: ImageMain,
    editor: ImageEditor,
  },
};
```

#### Rich Text Component
The rich text component is used to edit text. Here coincidentally, I have a rich text editor component implementation that you can refer to [GitHub](https://github.com/WindrunnerMax/DocEditor) ｜ [Editor DEMO](https://windrunnermax.github.io/DocEditor/).

```typescript
// src/components/text/index.ts
export const richText: LocalComponent = {
  name: "rich-text" as const,
  props: {},
  config: {
    layout: {
      x: 0,
      y: 0,
      w: 20,
      h: 10,
      isDraggable: true,
      isResizable: true,
      minW: 4,
      minH: 2,
    },
    observeResize: true,
  },
  module: {
    control: RichTextControl,
    main: RichText,
    editor: RichTextEditor,
  },
};
```

#### Blank Component
The blank component can be used as a placeholder or can be used in conjunction with CSS to achieve background effects.


```typescript
// src/components/blank/index.ts
export const blank: LocalComponent = {
  name: "blank" as const,
  props: {},
  config: {
    layout: {
      x: 0,
      y: 0,
      w: 10,
      h: 3,
      isDraggable: true,
      isResizable: true,
      minW: 1,
      minH: 1,
    },
  },
  module: {
    control: BlankControl,
    main: BlankMain,
    editor: BlankEditor,
  },
};
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
http://javakk.com/2127.html
http://blog.wuweiwang.cn/?p=27961
https://github.com/ctrlplusb/react-sizeme
https://juejin.cn/post/6961309077162950692
https://github.com/WindrunnerMax/DocEditor
https://github.com/react-grid-layout/react-grid-layout
```