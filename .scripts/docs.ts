/**
 * Step By Step
 * 1. 完成文章后, 在此处添加目录对应索引
 * 2. 将文章在 SSG 项目下完成翻译, 复制到 I18N 对应目录下
 * 3. 依次执行 npm run sync / npm run overview 命令
 * 4. 在相关项目中检查内容, 准确无误后分别执行 Commit.sh 提交
 */

export const docs: Record<string, string[]> = {
  HTML: [
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
    "HTML/Web Worker",
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
    "HTML/Shadow DOM的理解",
    "HTML/Service Worker的应用",
    "HTML/蒙层禁止页面滚动的方案",
    "HTML/SVG与foreignObject元素",
  ],
  CSS: [
    "CSS/布局垂直居中",
    "CSS/伪类与伪元素",
    "CSS/CSS盒子模型",
    "CSS/CSS选择器",
    "CSS/CSS样式优先级",
    "CSS/Flex布局",
    "CSS/Grid布局",
    "CSS/Table布局",
    "CSS/SVG基础",
    "CSS/CSS引入方式",
    "CSS/CSS3新特性",
    "CSS/响应式布局的实现",
    "CSS/块级格式化上下文",
    "CSS/Position定位",
    "CSS/Float浮动",
    "CSS/文本溢出截断省略",
    "CSS/CSS隐藏元素的方法",
    "CSS/如何避免FOUC",
    "CSS/display的值及作用",
    "CSS/CSS常用单位",
    "CSS/实现毛玻璃效果",
    "CSS/CSS实现图形效果",
    "CSS/实现文字滚动播放",
    "CSS/CSS实现展开动画",
    "CSS/CSS实现渐隐渐现效果",
  ],
  JavaScript: [
    "JavaScript/手动实现AJAX",
    "JavaScript/ES6新特性",
    "JavaScript/原型与原型链",
    "JavaScript/JavaScript闭包",
    "JavaScript/JS变量提升",
    "JavaScript/匿名函数与自执行函数",
    "JavaScript/apply、call、bind",
    "JavaScript/事件冒泡及阻止",
    "JavaScript/JS事件流模型",
    "JavaScript/函数声明与函数表达式",
    "JavaScript/JS中this的指向",
    "JavaScript/new运算符",
    "JavaScript/Js遍历数组总结",
    "JavaScript/Promise对象",
    "JavaScript/async、await",
    "JavaScript/Generator函数",
    "JavaScript/Js中==与===",
    "JavaScript/JavaScript选择器",
    "JavaScript/Json Web Token",
    "JavaScript/Js模块化导入导出",
    "JavaScript/let与const",
    "JavaScript/作用域与作用域链",
    "JavaScript/JavaScript异步机制",
    "JavaScript/Js数组操作",
    "JavaScript/Js继承的实现方式",
    "JavaScript/Function与Object",
    "JavaScript/Js严格模式",
    "JavaScript/Js箭头函数",
    "JavaScript/手动实现apply call bind",
    "JavaScript/Js遍历对象总结",
    "JavaScript/Js获取数据类型",
    "JavaScript/手动实现Promise",
    "JavaScript/Js实现数组排序",
    "JavaScript/defineProperty",
    "JavaScript/Js实现链表操作",
    "JavaScript/getter与setter",
    "JavaScript/Js中的堆栈",
    "JavaScript/防抖与节流",
    "JavaScript/Js的GC机制",
    "JavaScript/实现浅拷贝与深拷贝",
    "JavaScript/Map与WeakMap",
    "JavaScript/Set与WeakSet",
    "JavaScript/Object对象",
    "JavaScript/Js捕获异常的方法",
    "JavaScript/Js中fetch方法",
    "JavaScript/XML和JSON的比较",
    "JavaScript/Js文件异步加载",
    "JavaScript/深入理解Js数组",
    "JavaScript/模板语法的简单实现",
    "JavaScript/Thunk函数的使用",
    "JavaScript/async、await剖析",
    "JavaScript/null和undefined的区别",
    "JavaScript/Js创建对象的方式",
    "JavaScript/Js中RegExp对象",
    "JavaScript/Js中String对象",
    "JavaScript/Js中Number对象",
    "JavaScript/Js中Math对象",
    "JavaScript/Js中数组空位问题",
    "JavaScript/Js中Array对象",
    "JavaScript/Js中Currying的应用",
    "JavaScript/Js中Date对象",
    "JavaScript/Js中Symbol对象",
    "JavaScript/valueOf与toString",
    "JavaScript/Js模块化开发的理解",
    "JavaScript/常见的内存泄漏场景",
    "JavaScript/Js中Proxy对象",
    "JavaScript/Js中Reflect对象",
    "JavaScript/Js中的逻辑运算符",
    "JavaScript/Js将字符串转数字的方式",
    "JavaScript/函数式编程的理解",
    "JavaScript/Js实用小技巧",
    "JavaScript/深入理解Js中的this",
    "JavaScript/Js中的位操作符",
  ],
  Browser: [
    "Browser/跨域问题",
    "Browser/XSS跨站脚本攻击",
    "Browser/CSRF跨站请求伪造",
    "Browser/SQL注入",
    "Browser/浏览器渲染与内核",
    "Browser/浏览器重绘与回流",
    "Browser/HTTP协议概述",
    "Browser/CSS劫持攻击",
    "Browser/HTTPS加密传输过程",
    "Browser/对称加密与非对称加密",
    "Browser/分布式SESSION一致性",
    "Browser/TCP三次握手",
    "Browser/TCP与UDP异同",
    "Browser/浏览器事件",
    "Browser/浏览器页面呈现过程",
    "Browser/RESTful架构与RPC架构",
    "Browser/HTTP协议发展历程",
    "Browser/微信小程序实现原理",
    "Browser/Window对象",
    "Browser/OSI七层模型",
    "Browser/浏览器窗口间通信",
    "Browser/OAUTH开放授权",
    "Browser/SSO单点登录",
    "Browser/DNS解析过程",
    "Browser/强缓存与协商缓存",
    "Browser/GET和POST的区别",
    "Browser/CDN缓存的理解",
    "Browser/domReady的理解",
    "Browser/Document对象",
    "Browser/Location对象",
    "Browser/SSRF服务器端请求伪造",
    "Browser/浏览器本地存储方案",
    "Browser/Node对象",
    "Browser/History对象",
    "Browser/Navigator对象",
    "Browser/Element对象",
    "Browser/HTMLElement对象",
    "Browser/Event对象",
    "Browser/IntersectionObserver对象",
    "Browser/MutationObserver对象",
    "Browser/基于fetch的SSE方案",
  ],
  Vue: [
    "Vue/Vue学习笔记",
    "Vue/Vue-Cli4笔记",
    "Vue/Vue生命周期",
    "Vue/Vue中key的作用",
    "Vue/Vue数据双向绑定",
    "Vue/data为何以函数形式返回",
    "Vue/Vue中$nextTick的理解",
    "Vue/MVVM模式的理解",
    "Vue/v-if与v-show的区别",
    "Vue/Vue中$refs的理解",
    "Vue/Vue中虚拟DOM的理解",
    "Vue/Vue中diff算法的理解",
    "Vue/$router和$route的区别",
    "Vue/对keep-alive组件的理解",
    "Vue/SPA单页应用的优缺点",
    "Vue/Vue事件绑定原理",
    "Vue/Vue中数组变动监听",
    "Vue/Vue父子组件生命周期",
    "Vue/Vue中computed分析",
    "Vue/Vue路由Hash模式分析",
    "Vue/Vue路由History模式分析",
    "Vue/v-model数据绑定分析",
    "Vue/Vue路由懒加载",
    "Vue/VueRouter导航守卫",
    "Vue/服务端渲染SSR的理解",
    "Vue/Vue常用性能优化",
    "Vue/Vuex和普通全局对象",
    "Vue/Vuex中的核心方法",
    "Vue/Vue中组件间通信的方式",
    "Vue/Vue3.0新特性",
    "Vue/Vue为何采用异步渲染",
    "Vue/Vue中的三种Watcher",
    "Vue/v-html可能导致的问题",
    "Plugin/初探webpack之搭建Vue开发环境",
    "Vue/Vue首屏性能优化组件",
  ],
  React: [
    "React/React生命周期",
    "React/React虚拟DOM的理解",
    "React/React中JSX的理解",
    "React/React组件的state和props",
    "React/有状态和无状态组件",
    "React/受控组件和非受控组件",
    "React/React中的纯组件",
    "React/React中的高阶组件",
    "React/React中refs的理解",
    "React/React中的合成事件",
    "React/ReactRouter的实现",
    "React/React中组件间通信的方式",
    "React/React组件复用的方式",
    "React/React中diff算法的理解",
    "React/Hooks中的useState",
    "React/useEffect与useLayoutEffect",
    "React/useMemo与useCallback",
    "React/setState同步异步场景",
    "React/手写useState与useEffect",
    "React/Mobx与Redux的异同",
    "React/Context与Reducer",
    "React/Hooks与普通函数的区别",
    "React/Hooks与事件绑定",
    "React/React闭包陷阱",
    "React/ReactPortals传送门",
    "React/基于React的SSG渲染方案",
  ],
  Plugin: [
    "Plugin/Git常用命令",
    "Plugin/Git与SVN对比",
    "Plugin/Nginx常用配置",
    "Plugin/Rollup的基本使用",
    "Plugin/Jest中Mock网络请求",
    "Plugin/TS内置类型与拓展",
    "Plugin/竞态问题与RxJs",
    "Plugin/基于NoCode构建简历编辑器",
    "Plugin/基于drawio构建流程图编辑器",
    "Plugin/初探webpack之编写plugin",
    "Plugin/初探webpack之搭建Vue开发环境",
    "Plugin/初探webpack之编写loader",
    "Plugin/初探webpack之单应用多端构建",
    "Plugin/初探webpack之解析器resolver",
    "Plugin/从零实现的Chrome扩展",
    "Plugin/从零实现的浏览器Web脚本",
    "Plugin/基于Chrome扩展的浏览器事件",
    "Plugin/从脚本管理器的角度审视Chrome扩展",
    "Plugin/基于WebRTC的局域网文件传输",
    "Plugin/基于ServiceWorker的文件传输方案",
    "Plugin/基于Canvas构建简历编辑器",
    "Plugin/Canvas编辑器之数据结构设计",
    "Plugin/Canvas编辑器之剪贴板数据处理",
    "Plugin/Canvas编辑器之图形状态管理",
    "Plugin/Canvas编辑器之Rspack工程实践",
    "Plugin/Canvas编辑器之层级渲染事件管理"
  ],
  RichText: [
    "RichText/初探富文本之富文本概述",
    "RichText/初探富文本之编辑器引擎",
    "RichText/初探富文本之OT协同算法",
    "RichText/初探富文本之OT协同实例",
    "RichText/初探富文本之CRDT协同算法",
    "RichText/初探富文本之CRDT协同实例",
    "RichText/初探富文本之React实时预览",
    "RichText/初探富文本之文档diff算法",
    "RichText/初探富文本之在线文档交付",
    "RichText/初探富文本之划词评论能力",
    "RichText/初探富文本之文档虚拟滚动",
    "RichText/初探富文本之搜索替换算法",
    "RichText/基于slate构建文档编辑器",
    "RichText/WrapNode数据结构与操作变换",
    "RichText/TS类型扩展与节点类型检查",
    "RichText/Node节点与Path路径映射",
    "RichText/Decorator装饰器渲染调度",
  ],
  Patterns: [
    "Patterns/简单工厂模式",
    "Patterns/工厂方法模式",
    "Patterns/抽象工厂模式",
    "Patterns/建造者模式",
    "Patterns/原型模式",
    "Patterns/单例模式",
    "Patterns/外观模式",
    "Patterns/适配器模式",
    "Patterns/代理模式",
    "Patterns/装饰器模式",
    "Patterns/桥接模式",
    "Patterns/组合模式",
    "Patterns/享元模式",
    "Patterns/模板方法模式",
    "Patterns/观察者模式",
    "Patterns/状态模式",
    "Patterns/策略模式",
    "Patterns/责任链模式",
    "Patterns/命令模式",
    "Patterns/访问者模式",
    "Patterns/中介者模式",
    "Patterns/备忘录模式",
    "Patterns/迭代器模式",
    "Patterns/解释器模式",
    "Patterns/链模式",
    "Patterns/委托模式",
    "Patterns/数据访问对象模式",
    "Patterns/防抖节流模式",
    "Patterns/简单模板模式",
    "Patterns/惰性模式",
    "Patterns/参与者模式",
    "Patterns/等待者模式",
    "Patterns/同步模块模式",
    "Patterns/异步模块模式",
    "Patterns/Widget模式",
    "Patterns/MVC模式",
    "Patterns/MVP模式",
    "Patterns/MVVM模式",
  ],
  Linux: [
    "Linux/cat-输出文件内容",
    "Linux/chmod-更改文件权限",
    "Linux/chown-更改文件所有者",
    "Linux/cmp-文件差异状态",
    "Linux/diff-对比文件差异",
    "Linux/diffstat-文件差异计量",
    "Linux/file-探测文件类型",
    "Linux/find-查找文件",
    "Linux/cut-截取文件内容",
    "Linux/ln-创建文件链接",
    "Linux/less-分页输出文件内容",
    "Linux/locate-快速查找文件",
    "Linux/lsattr-显示文件属性",
    "Linux/chattr-更改文件属性",
    "Linux/mc-文件管理器",
    "Linux/mktemp-创建临时文件",
    "Linux/more-分页输出文件内容",
    "Linux/mv-移动文件",
    "Linux/od-读取文件内容",
    "Linux/paste-合并文件内容",
    "Linux/patch-修补生成文件",
    "Linux/rcp-远程文件拷贝",
    "Linux/rm-删除文件",
    "Linux/split-分割文件",
    "Linux/tee-文件内容分流",
    "Linux/tmpwatch-删除未访问文件",
    "Linux/touch-创建新文件",
    "Linux/umask-设置文件权限掩码",
    "Linux/which-输出命令路径",
    "Linux/cp-复制文件",
    "Linux/whereis-查找二进制文件",
    "Linux/scp-安全拷贝文件",
    "Linux/awk-文本处理工具",
    "Linux/read-读取用户输入",
    "Linux/updatedb-更新文件数据库",
    "Linux/col-过滤控制字符",
    "Linux/colrm-删除文件内容列",
    "Linux/comm-对比文件内容",
    "Linux/csplit-分割文件",
    "Linux/ed-文本编辑器",
    "Linux/egrep-正则模式搜索",
    "Linux/ex-文本编辑器",
    "Linux/fgrep-固定字符串搜索",
    "Linux/fmt-格式化输出内容",
    "Linux/fold-折叠文件内容",
    "Linux/grep-模式搜索匹配",
    "Linux/aspell-拼写检查",
    "Linux/join-合并文件内容",
    "Linux/look-查找字典单词",
    "Linux/pico-文本编辑程序",
    "Linux/sed-脚本处理文件",
    "Linux/sort-排序文件内容",
    "Linux/tr-转换文件内容",
    "Linux/expr-表达式计算",
    "Linux/ps-进程状态管理",
    "Linux/netstat-网络状态管理",
    "Linux/ifconfig-网络接口管理",
    "Linux/traceroute-网络路由跟踪",
    "Linux/route-网络路由管理",
    "Linux/kill-终止进程",
    "Linux/systemctl-系统服务管理",
    "Linux/journalctl-系统日志管理",
    "Linux/ip-网络接口管理",
    "Linux/curl-网络数据传输",
    "Linux/top-系统资源监控",
    "Linux/du-磁盘占用管理"
  ],
  MiniProgram: [
    "MiniProgram/山科小站小程序",
    "Java/QQ小程序支付",
    "MiniProgram/支付宝小程序user_id",
    "MiniProgram/微信小程序校历组件",
    "MiniProgram/uniapp小程序迁移到TS",
  ],
  App: ["App/NvueWeex"],
  PHP: ["PHP/ThinkPHP5.0漏洞测试", "IMGProcess/PHP验证码识别实例"],
  Java: ["Java/QQ小程序支付"],
  Security: [
    "Security/简单安全防护",
    "Security/OD反汇编EXE添加一个启动时的消息框",
    "Security/IDA反汇编EXE添加一个启动时的消息框",
    "Browser/XSS跨站脚本攻击",
    "Browser/CSRF跨站请求伪造",
    "Browser/SQL注入",
    "Browser/CSS劫持攻击",
    "PHP/ThinkPHP5.0漏洞测试",
    "Browser/SSRF服务器端请求伪造",
    "Security/记ByteCTF中的Node题",
  ],
  Environment: [
    "Environment/VScode配置CMD本地运行环境(2.0)",
    "Environment/Recover刷机简介",
    "Environment/Ubuntu16.04安装QQ机器人",
    "Environment/将SublimeText加入右键菜单",
    "Environment/手机抓包HTTPS",
    "Environment/文本选中复制",
    "Environment/发布Npm包到GitHub Packages",
    "Environment/斐讯K3C改散热",
    "Environment/解决ufw下pptp客户端连接问题",
    "Environment/建立DNS隧道绕过校园网认证",
    "Environment/Ubuntu20.04配置CuckooSandbox环境",
  ],
  IMGProcess: [
    "IMGProcess/强智教务系统验证码识别OpenCV",
    "IMGProcess/强智教务系统验证码识别TensorflowCNN",
    "IMGProcess/YOLOV3目标检测",
    "IMGProcess/PHP验证码识别实例",
  ],
  LeetCode: [
    "LeetCode/全排列",
    "LeetCode/括号生成",
    "LeetCode/二进制求和",
    "LeetCode/顶端迭代器",
    "LeetCode/矩阵置零",
    "LeetCode/栈排序",
    "LeetCode/长度最小的子数组",
    "LeetCode/字母移位",
    "LeetCode/跳水板",
    "LeetCode/路径总和",
    "LeetCode/两个数组的交集II",
    "LeetCode/全排列II",
    "LeetCode/插入、删除和获取元素",
    "LeetCode/最长公共前缀",
    "LeetCode/除数博弈",
    "LeetCode/环形数组循环",
    "LeetCode/字符串相加",
    "LeetCode/有效的括号字符串",
    "LeetCode/一次编辑",
    "LeetCode/被围绕的区域",
    "LeetCode/数组中的第K个最大元素",
    "LeetCode/提莫攻击",
    "LeetCode/叶子相似的树",
    "LeetCode/二叉树的最小深度",
    "LeetCode/平衡二叉树",
    "LeetCode/电话号码的字母组合",
    "LeetCode/使括号有效的最少添加",
    "LeetCode/二叉树的所有路径",
    "LeetCode/二叉树的层次遍历 II",
    "LeetCode/组合",
    "LeetCode/翻转二叉树",
    "LeetCode/子集",
    "LeetCode/二叉搜索树中的众数",
    "LeetCode/宝石与石头",
    "LeetCode/反转字符串",
    "LeetCode/两两交换链表中的节点",
    "LeetCode/长按键入",
    "LeetCode/独一无二的出现次数",
    "LeetCode/两个数组的交集",
    "LeetCode/子集II",
    "LeetCode/最接近原点的K个点",
    "LeetCode/按奇偶排序数组II",
    "LeetCode/根据身高重建队列",
    "LeetCode/供暖器",
    "LeetCode/上升下降字符串",
    "LeetCode/保持城市天际线",
    "LeetCode/不同路径",
    "LeetCode/Dota2参议院",
    "LeetCode/单调递增的数字",
    "LeetCode/买卖股票的最佳时机含手续费",
    "LeetCode/字符串中的第一个唯一字符",
    "LeetCode/最后一块石头的重量",
    "LeetCode/种花问题",
    "LeetCode/滑动窗口最大值",
    "LeetCode/汇总区间",
    "LeetCode/替换后的最长重复字符",
  ],
  Interview: [
    "Interview/百度实习生前端面试",
    "Interview/腾讯暑期日常实习前端面试",
    "Interview/美团暑期日常实习前端面试",
    "Interview/字节跳动暑期日常实习前端面试",
    "MyLife/记2021年实习春招历程",
    "Interview/字节跳动暑期实习前端面试",
    "Interview/美团暑期实习前端面试",
    "Interview/蚂蚁暑期实习前端面试",
    "MyLife/记2022年实习春招历程",
    "Interview/百度秋招提前批前端面试",
    "Interview/大疆秋招提前批前端面试",
    "Interview/360秋招正式批前端面试",
    "Interview/联想秋招正式批前端面试",
    "Interview/京东秋招正式批前端面试",
    "Interview/顺丰秋招正式批前端面试",
    "Interview/拼多多秋招正式批前端面试",
    "Interview/携程秋招正式批前端面试",
    "Interview/腾讯秋招正式批前端面试",
    "MyLife/记2022年秋招历程",
  ],
  MyLife: [
    "MyLife/记一次有意思的种树比赛",
    "MyLife/记2021年实习春招历程",
    "MyLife/2021腾讯实习实录",
    "Security/记ByteCTF中的Node题",
    "MyLife/记2022年实习春招历程",
    "MyLife/致我四年的大学生活",
    "MyLife/记2022年秋招历程",
    "MyLife/致我三年的研究生生活",
    "MyLife/2022字节实习实录",
    "MyLife/从大学开始搞的开源项目",
    "MyLife/记一些日常的想法与思考",
  ],
};
