# whereis命令
`whereis`命令用于查找文件，该指令会在特定目录中查找符合条件的文件，该指令只能用于查找二进制文件、源代码文件和`man`手册页，一般文件的定位需使用`locate`或`find`命令。

## 语法

```shell
whereis [options] file
```

## 参数
* `-b`: 仅搜索二进制文件。
* `-B <dirs>`: 更改或限制`whereis`搜索二进制文件的位置。
* `-m`: 仅搜索源。
* `-M <dirs>`: 更改或限制`whereis`搜索手册部分的位置。
* `-s`: 仅搜索源。
* `-S <dirs>`: 更改或限制`whereis`搜索源的位置。
* `-f`: 不显示文件名前的路径名称。
* `-u`: 搜索不寻常的条目，如果文件没有每种请求类型的一个条目，则该文件被认为是不寻常的，即查找不包含指定类型的文件。
* `-l`: 输出有效的查找路径。

## 示例
列出`whereis`命令搜索的目录，默认情况下`whereis`在环境变量中列出的硬编码路径和目录中搜索命令的文件。

```shell
whereis -l
# bin: /usr/bin
# bin: /usr/sbin
# bin: /usr/lib
# ...
```

获取有关`bash`命令的信息，输出的`bash`是要获取其信息的命令，`/bin/bash`是二进制文件的路径，`/etc/bash.bashrc`源文件以及`/usr/share/man/man1/bash.1.gz`手册页，如果要搜索的命令不存在，`whereis`将仅打印命令名称。

```shell
whereis bash
# bash: /bin/bash /etc/bash.bashrc /usr/share/man/man1/bash.1.gz
```

为`whereis`命令同时查询`netcat`与`uptime`，输出将包含有关`netcat`和`uptime`命令的信息。

```shell
whereis netcat uptime
# netcat: /bin/netcat /usr/share/man/man1/netcat.1.gz
# uptime: /usr/bin/uptime /usr/share/man/man1/uptime.1.gz
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/uwhereis.htm
https://linuxize.com/post/whereis-command-in-linux/
https://www.runoob.com/linux/linux-comm-whereis.html
```
