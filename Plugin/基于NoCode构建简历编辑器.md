# 基于NoCode构建简历编辑器
基于`NoCode`构建简历编辑器，要参加秋招了，因为各种模板用起来细节上并不是很满意，所以尝试做个简单的拖拽简历编辑器。

## 概述

- 开源地址: <https://github.com/WindRunnerMax/ResumeEditor>
- 在线编辑: <https://windrunnermax.github.io/ResumeEditor/> 

对于无代码`NoCode`和低代码`LowCode`还是比较容易混淆的，在我的理解上，`NoCode`强调自己编程给自己用，给用户的感觉是一个更强大的实用软件，是一个上层的应用，也就是说`NoCode`需要面向非常固定的领域才能做到好用。而对于`LowCode`而言，除了要考虑能用界面化的方式搭建流程，还要考虑在需要扩展的时候，把底层也暴露出来，拥有更强的可定制化功能，也就是说相比`NoCode`可以不把使用场景限定得那么固定。

对于简历编辑器而言，这就算是非常固定的领域了，而且在使用方面不需要去实现过多代码的编写，开箱即用即可，是作为一个上层应用而实现的。对于我个人而言就是单纯的因为要秋招了，网站上各种模板用起来细节上并不是很满意，在晚上睡觉前洗澡的时候突然有个想法要做这个，然后一个周末也就是两天的时间肝出来了一个简单的基于`NoCode`的简历编辑器。  

说回正题，对于实现简历编辑器而言，需要有这几个方面的考虑，当然因为我是两天做出来的，也只是比较简单的实现了部分功能：

* 需要支持拖动的页面网格布局或自由布局。
* 对各组件有独立编辑的能力。
* 生成`PDF`与预览页面的功能。
* 生成`JSON`格式的配置数据。
* 支持远程物料简历模板的加载。
* 基础组件图片、文本等的实现。

## 实现

### 数据存储
对于数据而言，在这里是维护了一个`JSON`数据，对于整个简历编辑器而言都有着比较严格的`TS`定义，所以预先声明组件类型定义是很有必要的，在这里声明了`LocalComponentConfig`作为组件的类型定义，而对于整个生成的`JSON`而言，也就完成了作为`LocalComponentConfig[]`的嵌套。

在项目中显示的简历是完全采用`JSON`配置的形式来实现的，数据与视图的渲染是完全分离的，那么由此我们就可以通过编写多个`JSON`配置的形式，来实现不同简历主题模板。如果打开上边提到的`Resume DEMO`的话，可以看到预先加载了一个简历，这个简历的内容就是完全由`JSON`配置而得到的，具体而言可以参考`src/components/debug/example.ts`。

如果数据以`local storage`字符串的形式存储在本地，键值为`cld-storage`，如果本地`local storage`没有这个键的话，就会加载示例的初始简历，数据存储形式为`{origin: ${data}, expire: number | number}`，通过`JSON.parse`可以解析取出数据。有了这个`JSON`数据的配置。

```js
// 数据定义
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

在这里实际上我们有两套数据结构的定义，因为目的是实现数据与组件的分离，但是组件也是需要有位置进行定义的，此外由于希望整个编辑器是可拆卸的，具体而言就是每个基础组件是独立注册的，如果将其注册部分移除，对于整个项目是不会产生任何影响的，只是视图无法根据`JSON`的配置成功渲染，最终呈现的效果为空而已。

```js
// 组件定义
// src/types/components-types.ts
interface ComponentsBase {
  name: string;
  props?: Record<string, unknown>; // 传递给组件的默认`props`
  style?: React.CSSProperties; // 样式配置信息
  config?: Record<string, unknown>; // 配置信息
}
export interface LocalComponent extends ComponentsBase {
  module: Panel;
}

// 组件定义
export const xxx: LocalComponent = {
    // ...
}

// 组件注册 
// src/index.tsx
register(image, richText, blank);
```

### 数据通信
因为要维护的`JSON`数据结构还是比较复杂的，在这里我们使用`Context + useImmerReducer`来实现的状态管理，当然使用`reducer`或者`Mobx`也都是可以的，这只是我觉得实现的比较简单的方案。

```js
// src/store/context.tsx
export const AppProvider: React.FC<{ mode?: ContextProps["mode"] }> = props => {
  const { mode = EDITOR_MODE.EDITOR, children } = props;
  const [state, dispatch] = useImmerReducer(reducer, defaultContext.state);
  return <AppContext.Provider value={{ state, mode, dispatch }}>{children}</AppContext.Provider>;
};
```


### 页面网格布局
网格布局的实现比较简单，而且不需要再实现参考线去做对齐的功能，直接在拖拽时显示网格就好。另外如果以后会拓展多种宽度的`PDF`生成的话，也不会导致之前画布布局太过于混乱，因为本身就是栅格的实现，可以根据宽度自动的处理，当然要是适配移动端的话还是需要再做一套`Layout`数据的。 
 
这个网格的页面布局实际上就是作为整个页面布局的画布来实现，`React`的生态有很多这方面的库，我使用了`react-grid-layout`这个库来实现拖拽，具体使用的话可以在本文的参考部分找到其`GitHub`链接，这个库的实现也是蛮不错的，基本可以做到开箱即用，但是细节方面还是很多东西需要处理的。对于`layout`配置项，因为我们本身是存储了一个`JSON`的数据结构，所以我们需要通过我们自己定义的数据结构来生成`layout`，在生成的过程中如果`cols`或者`rowHeight`有所变化而导致元素超出原定范围的话，还需要处理一下。

```js
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
        compactType={null} // 关闭垂直压实
        preventCollision // 关闭重新排列
        useCSSTransforms={false} // 在`ObserveResize`时会出现动画
        >
    </ResponsiveGridLayout>
</ReferenceLine>
```

对于`<ReferenceLine/>`组件，在这里通过`CSS`绘制了网格布局的网格点，从而实现参考线的作用。

```js
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


### 组件独立编辑
有了基础的画布组件，我们就需要实现各个基础组件，那么基础组件就需要实现独立的编辑功能，而独立的编辑功能又需要三部分的实现：首先是数据的变更，因为编辑最终还是需要体现到数据上，也就是我们要维护的那个`JSON`数据，因为我们有了数据通信的方案，所以这里只需要定义`reducer`将其写到对应的组件配置的`props`或者其他字段中即可。


```js
// src/store/reducer.ts
witch (action.type) {
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

接下来是工具栏的实现，对于工具栏而言，我们需要针对选中的元素的`name`进行一个判别，加载工具栏之后，对于用户的操作，只需要根据当前选中的`id`通过数据通信应用到`JSON`数据中，最后在视图中就会应用其修改了。

```js
// src/views/main-panel/components/tool-bar/index.tsx
const deleteBaseSection = () => {
    // ...
};

const copySection = () => {
    // ...
};

// ...

<Trigger
    popupVisible={selectedId === config.id}
    popup={() => Menu}
    position="top"
    trigger="contextMenu"
>
    {props.children}
</Trigger>
```

对于编辑面板而言，与工具栏类似，通过加载表单，在表单的数据变动之后通过`reducer`应用到`JSON`数据即可，在这里因为实现的编辑器确实比较简单，于是还加载了一个`CSS`编辑器，通过配合`CSS`可以实现更多的样式效果，当然通过拓展各个组件编辑面板部分是能够尽量去减少自定义`CSS`的编写的。

```js
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

### 导出PDF
导出`PDF`功能是借助了浏览器的能力，通过打印即`Ctrl + P`来实现导出PDF的效果，导出时需要注意:
* 简历是按照`A4`纸的大小固定的宽高，如果扩大编辑区域可能会造成简历多于一页。
* 导出`PDF`需要设置纸张尺寸为 `A4`、边距为无、选中背景图形选项 才可以完整导出一页简历。

### 基础组件

#### 图片组件
图片组件，用以上传图片展示，因为本身没有后端，所以图片只能以`base64`存储在`JSON`的结构中。

```js
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

#### 富文本组件
富文本组件，用以编辑文字，在这里正好我有一个富文本编辑器的组件实现，可以参考:

- 开源地址: <https://github.com/WindRunnerMax/DocEditor> 
- 在线编辑: <https://windrunnermax.github.io/DocEditor/>

```js
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

#### 空白组件
空白组件，可以用以作为占位空白符，也可以通过配合`CSS`实现背景效果。

```js
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

## 每日一题

- <https://github.com/WindRunnerMax/EveryDay>

## 参考

- <http://javakk.com/2127.html>
- <http://blog.wuweiwang.cn/?p=27961>
- <https://github.com/ctrlplusb/react-sizeme>
- <https://juejin.cn/post/6961309077162950692>
- <https://github.com/WindrunnerMax/DocEditor>
- <https://github.com/react-grid-layout/react-grid-layout>

