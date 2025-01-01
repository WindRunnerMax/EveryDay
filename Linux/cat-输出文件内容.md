# cat命令
`cat`命令属于文件管理，用于连接文件并打印到标准输出设备上，`cat`经常用来显示文件的内容，注意，当文件较大时，文本在屏幕上迅速闪过，会出现滚屏现象，此时往往看不清所显示的内容，为了控制滚屏，可以按`Ctrl+S`键停止滚屏，按`Ctrl+Q`键可以恢复滚屏，此外可以用`more`等命令进行读文件并分页显示。

## 语法

```shell
cat [-AbeEnstTuv] [--help] [--version] fileName
```

## 参数
* `-n`或`--number`: 由`1`开始对所有输出的行数编号。
* `-b`或`--number-nonblank`: 和`-n`相似，只不过对于空白行不编号。
* `-s`或`--squeeze-blank`: 当遇到有连续两行以上的空白行，就代换为一行的空白行。
* `-v`或`--show-nonprinting`: 使用`^`和`M-`符号，除了`LFD`和`TAB`之外。
* `-E`或`--show-ends`: 在每行结束处显示`$`。
* `-T`或`--show-tabs`: 将`TAB`字符显示为`^I`。
* `-A`或`--show-all`: 等价于`-vET`。
* `-e`: 等价于`-vE`选项。
* `-t`: 等价于`-vT`选项。

## 示例
使用`cat`命令创建一个文件，输入文件信息后按`Ctrl+D`输出`EOF`标识后结束输入。

```shell
cat > file.txt
```

输出`file.txt`文件中的内容。

```shell
cat file.txt
```

同时输出`file.txt`与`file2.txt`文件中的内容。

```shell
cat file.txt file2.txt
```

把`file.txt`文件的内容加上行号后追加到`file2.txt`文件中。

```shell
cat -n file.txt >> file2.txt
```

清空`file2.txt`文件，`/dev/null`称为空设备，是一个特殊的设备文件，其会丢弃一切写入其中的数据，但报告写入操作成功，读取它则会立即得到一个`EOF`。

```shell
cat /dev/null > file2.txt
```

将`file.txt`与`file2.txt`文件内容合并输出到`file3.txt`。

```shell
cat file.txt file2.txt > file3.txt
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/cat
https://www.runoob.com/linux/linux-comm-cat.html
https://www.cnblogs.com/zhangchenliang/p/7717602.html
```
