# which命令
`which`命令用于标识在终端提示符下键入可执行文件名称或命令时执行的给定可执行文件的位置，该命令在`PATH`环境变量中列出的目录中搜索作为参数指定的可执行文件。

## 语法

```shell
which [options]  COMMAND
```

## 参数
* `--version, -[vV]`: 输出版本信息。
* `--help`: 输出帮助信息。
* `--skip-dot`: 跳过`PATH`中以`.`开头的目录。
* `--skip-tilde`: 跳过`PATH`中以`~`开头的目录。
* `--show-dot`: 不要在输出中将`.`扩展到当前目录。
* `--show-tilde`: 为非`root`用户输出`HOME`目录的波浪号。
* `--tty-only`: 如果不在`tty`上，则停止处理右侧的选项。
* `--all, -a`: 打印`PATH`中的所有匹配项，而不仅仅是第一个。
* `--read-alias, -i`: 从标准输入中读取别名列表。
* `--skip-alias`: 忽略选项`--read-alias`，不要读标准输入。
* `--read-functions`: 从标准输入读取`shell`函数。
* `--skip-functions`: 忽略选项`--read-functions`，不要读标准输入。

## 示例

查看指令`bash`的绝对路径。

```shell
which bash
# /usr/bin/bash
```

查看多个命令的绝对路径。

```shell
which ping touch
# /usr/bin/ping
# /usr/bin/touch
```

输出所有在环境变量中的匹配项的绝对路径。

```shell
which -a python
# ~/anaconda3/bin/python
# /usr/bin/python
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/uwhich.htm
https://linuxize.com/post/linux-which-command/
https://www.runoob.com/linux/linux-comm-which.html
```
