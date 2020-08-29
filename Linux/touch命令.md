# touch命令
`touch`命令用于修改文件或者目录的时间属性，包括存取时间和更改时间，若文件不存在，系统会建立一个新的文件。

## 语法

```shell
touch [OPTION]... FILE...
```


## 参数
* `-a`: 仅更改访问时间。
* `-c, --no-create`: 不创建任何文件。
* `-d, --date=STRING`: 解析`STRING`并使用其作为访问和修改时间。
* `-f`: 该参数被忽略。
* `-h, --no-dereference`: 影响每个符号链接，而不影响任何引用的文件，仅在可以更改符号链接时间戳的系统上有用。
* `-m`: 仅更改修改时间。
* `-r, --reference=FILE`: 使用此文件的时间而不是当前时间。
* `-t STAMP`: 使用`[[CC]YY]MMDDhhmm[.ss]`而不是当前时间。
* `--time=WORD`: 更改指定的时间，`WORD`是`access`、`atime`或`use`则等效于`-a`，`WORD`是`Modify`或`mtime`则等效于`-m`。
* `--help`: 显示帮助信息。
* `--version`: 显示版本信息。


## 示例
创建一个空白文件，如果文件已经存在，它将更改文件的访问时间。

```shell
touch /tmp/file.txt
```

创建多个文件。

```shell
touch /tmp/file1.txt /tmp/file2.txt /tmp/file3.txt
```

模板文件名创建文件。

```shell
tmpwatch -am 30 –nodirs /tmp/
```

修改文件的访问时间并查看文件属性。

```shell
touch -a /tmp/file.txt && stat /tmp/file.txt
```

修改文件的修改时间并查看文件属性。

```shell
touch -m /tmp/file.txt && stat /tmp/file.txt
```

同时修改访问时间和修改时间并设置一个特定的访问与修改时间。

```shell
touch -am -t 202007010000.00 /tmp/file.txt && stat /tmp/file.txt
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://linux.die.net/man/1/touch
https://www.runoob.com/linux/linux-comm-touch.html
https://www.interserver.net/tips/kb/touch-command-linux-usage-examples/
```
