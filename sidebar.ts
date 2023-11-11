export const sidebar: Sidebar = {
  "": [
    {
      text: "HTML",
      collapsed: true,
      items: [
        "HTML/DOCTYPE",
        "HTML/HTML语义化",
        "HTML/Cookie与Session",
        "HTML/LocalStorage与SessionStorage",
        "HTML/Iframe框架及优缺点",
        "HTML/HTML节点操作",
        "HTML/手动实现轮播图功能",
        "HTML/Canvas基础",
        "HTML/前端性能优化方案",
        "HTML/HTML5新特性",
        "HTML/行内元素和块级元素",
        "HTML/图片等比例缩放方案",
        "HTML/实现瀑布流布局",
        "HTML/实现图片懒加载",
        "HTML/Web%20Worker",
        "HTML/300ms点击延迟",
        "HTML/默认行为及阻止",
        "HTML/可替换元素和非替换元素",
        "HTML/HTML与XHTML区别",
        "HTML/常见的兼容性问题",
        "HTML/Attribute和Property的区别",
        "HTML/实现拼图滑动验证码",
        "HTML/实现加载提示组件",
        "HTML/实现消息提示组件",
        "HTML/DOM和BOM的区别",
        "HTML/实现三栏布局",
        "HTML/Shadow%20DOM的理解",
        "HTML/Service%20Worker的应用",
        "HTML/蒙层禁止页面滚动的方案",
        "HTML/SVG与foreignObject元素",
      ],
    },
  ],
};

type SidebarItem =
  | {
      text: string;
      link: string;
      tag?: string;
    }
  | string;
interface SidebarGroup {
  text: string;
  link?: string;
  items: SidebarItem[];
  collapsible?: boolean;
  collapsed?: boolean;
  tag?: string;
}
type Sidebar = Record<string, SidebarGroup[]>;
