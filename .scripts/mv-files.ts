import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";

const MAP: Record<string, string> = {
  __ORIGIN__: "__TARGET__",
  cat命令: "cat-输出文件内容",
  chmod命令: "chmod-更改文件权限",
  chown命令: "chown-更改文件所有者",
  cmp命令: "cmp-文件差异状态",
  diff命令: "diff-对比文件差异",
  diffstat命令: "diffstat-文件差异计量",
  file命令: "file-探测文件类型",
  find命令: "find-查找文件",
  cut命令: "cut-截取文件内容",
  ln命令: "ln-创建文件链接",
  less命令: "less-分页输出文件内容",
  locate命令: "locate-快速查找文件",
  lsattr命令: "lsattr-显示文件属性",
  chattr命令: "chattr-更改文件属性",
  mc命令: "mc-文件管理器",
  mktemp命令: "mktemp-创建临时文件",
  more命令: "more-分页输出文件内容",
  mv命令: "mv-移动文件",
  od命令: "od-读取文件内容",
  paste命令: "paste-合并文件内容",
  patch命令: "patch-修补生成文件",
  rcp命令: "rcp-远程文件拷贝",
  rm命令: "rm-删除文件",
  split命令: "split-分割文件",
  tee命令: "tee-文件内容分流",
  tmpwatch命令: "tmpwatch-删除未访问文件",
  touch命令: "touch-创建空文件",
  umask命令: "umask-设置文件权限掩码",
  which命令: "which-输出命令路径",
  cp命令: "cp-复制文件",
  whereis命令: "whereis-查找二进制文件",
  scp命令: "scp-安全拷贝文件",
  awk命令: "awk-文本处理工具",
  read命令: "read-读取用户输入",
  updatedb命令: "updatedb-更新文件数据库",
  col命令: "col-过滤控制字符",
  colrm命令: "colrm-删除文件内容列",
  comm命令: "comm-对比文件内容",
  csplit命令: "csplit-分割文件",
  ed命令: "ed-文本编辑器",
  egrep命令: "egrep-正则模式搜索",
  ex命令: "ex-文本编辑器",
  fgrep命令: "fgrep-固定字符串搜索",
  fmt命令: "fmt-格式化输出内容",
  fold命令: "fold-折叠文件内容",
  grep命令: "grep-模式搜索匹配",
  aspell命令: "aspell-拼写检查",
  join命令: "join-合并文件内容",
  look命令: "look-查找字典单词",
  pico命令: "pico-文本编辑程序",
  sed命令: "sed-脚本处理文件",
  sort命令: "sort-排序文件内容",
  tr命令: "tr-转换文件内容",
  expr命令: "expr-表达式计算",
  ps命令: "ps-进程状态管理",
  netstat命令: "netstat-网络状态管理",
  ifconfig命令: "ifconfig-网络接口管理",
  traceroute命令: "traceroute-网络路由跟踪",
  route命令: "route-网络路由管理",
  kill命令: "kill-终止进程",
  systemctl命令: "systemctl-系统服务管理",
  journalctl命令: "journalctl-系统日志管理",
  ip命令: "ip-网络接口管理",
  curl命令: "curl-网络数据传输",
  top命令: "top-系统资源监控",
};

const withSuffix = (fileName?: string) => {
  if (!fileName) return null;
  return fileName.endsWith(".md") ? fileName : `${fileName}.md`;
};

const removeSuffix = (fileName?: string) => {
  if (!fileName) return null;
  return fileName.endsWith(".md") ? fileName.slice(0, -3) : fileName;
};

(async () => {
  const root = path.resolve(__dirname, `..`);
  // 处理 docs 文件
  const docsPath = path.resolve("./docs.ts");
  let docsFile = await fs.readFile(docsPath, "utf-8");
  for (const [key, value] of Object.entries(MAP)) {
    docsFile = docsFile.replaceAll(key, value);
  }
  await fs.writeFile(docsPath, docsFile);
  // 处理 Timeline 文件
  const timelinePath = path.join(root, "Timeline.md");
  let timelineFile = await fs.readFile(timelinePath, "utf-8");
  for (const [key, value] of Object.entries(MAP)) {
    timelineFile = timelineFile.replaceAll(key, value);
  }
  await fs.writeFile(timelinePath, timelineFile);
  // 处理文件名
  const files = await glob(path.join(root, "**", "*.md"));
  for (const file of files) {
    const group = file.split("/");
    const fileName = removeSuffix(group.pop());
    const origin = withSuffix(fileName);
    const target = withSuffix(MAP[fileName]);
    if (origin && target) {
      fs.rename([...group, origin].join("/"), [...group, target].join("/"));
      return;
    }
  }
})();
