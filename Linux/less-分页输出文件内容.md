# less命令
`less`命令的作用与`more`相似，都可以用来浏览文件的内容，用`less`命令显示文件时，使用`pageup`键向上翻页，使用`pagedown`键向下翻页，使用`↑`与`↓`按行浏览，使用`q`退出浏览。`less`在加载时不必读整个文件，加载速度会比`more`更快，`less`退出后`shell`不会留下刚显示的内容，而`more`退出后会在`shell`上留下刚显示的内容。

## 语法

```shell
less [option] [file]
```

## 参数
* `-b <buffer size>`: 设置缓冲区的大小。
* `-e`: 当文件显示结束后，自动离开。
* `-f`: 强迫打开特殊文件，例如外围设备代号、目录和二进制文件。
* `-g`: 只标志最后搜索的关键词。
* `-i`: 忽略搜索时的大小写。
* `-m`: 显示类似`more`命令的百分比。
* `-N`: 显示每行的行号。
* `-o <file>`: 将`less`输出的内容在指定文件中保存起来。
* `-Q`: 不使用警告音。
* `-s`: 显示连续空行为一行。
* `-S`: 行过长时将超出部分舍弃。
* `-x <num>`: 将`tab`键显示为规定的数字空格。


## 常用操作

* `ctrl + F`: 向前移动一屏。
* `ctrl + B`: 向后移动一屏。
* `ctrl + D`: 向前移动半屏。
* `ctrl + U`: 向后移动半屏。
* `j`: 向前移动一行
* `k`: 向后移动一行
* `/string`: 向下搜索字符串的功能。
* `?string`: 向上搜索字符串的功能。
* `n`: 重复前一个搜索，与`/`或`?`有关。
* `N`: 反向重复前一个搜索，与`/`或`?`有关。
* `b`: 向上翻一页。
* `d`: 向后翻半页。
* `h`: 显示帮助界面。
* `Q`: 退出`less`命令。
* `u`: 向前滚动半页。
* `y`: 向前滚动一行。
* `space`: 滚动一页。
* `enter`: 滚动一行。
* `pageup`: 向上翻动一页。
* `pagedown`: 向下翻动一页。
* `G`: 移动到最后一行。
* `g`: 移动到第一行。
* `q / ZZ`: 退出`less`命令。
* `v`: 使用配置的编辑器编辑当前文件。
* `h`: 显示`less`的帮助文档。
* `&pattern`: 仅显示匹配模式的行，而不是整个文件。
* `ma`: 使用`a`标记文本的当前位置。
* `a`: 导航到标记`a`处。

## 示例

浏览`file.txt`文件。

```shell
less file.txt
```

`ps`查看进程信息并通过`less`分页显示。

```shell
ps -ef | less
```

查看`file.txt`文件并检索向后检索`1`字符串。

```shell
less file.txt 
/1
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/less
https://www.runoob.com/linux/linux-comm-less.html
https://www.tutorialspoint.com/unix_commands/less.htm
```
