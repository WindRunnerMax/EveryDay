# fold命令
`fold`命令用于限制文件列宽，其会从指定的文件里读取内容，将超过限定列宽的列加入增列字符后，输出到标准输出设备。若不指定任何文件名称，或是所给予的文件名为`-`，则`fold`命令会从标准输入设备读取数据。

## 语法

```shell
fold [OPTION]... [FILE]...
```

## 参数
* `-b, --bytes`: 计算字节数而不是列数。
* `-s, --spaces`: 在空格处跳过。
* `-w, --width=WIDTH`: 使用`n`列，而不是默认值`80`。
* `--help`: 显示帮助信息。
* `--version`: 显示版本信息。

## 示例
使用`fold`命令进行分隔，每行最多包含默认值`80`个字符。

```shell
fold file.txt
# fold command in Linux wraps each line in an input file to fit a specified width
# and prints it to the standard output. By default, it wraps lines at a maximum wi
# dth of 80 columns but this is configurable. To fold input using the fold command
#  pass a file or standard input to the command.
```

使用`fold`命令进行分隔，指定每行最多包含默认值`50`个字符。

```shell
fold -w 50 file.txt
# fold command in Linux wraps each line in an input
# file to fit a specified width and prints it to the
#  standard output. By default, it wraps lines at a
# maximum width of 80 columns but this is configurab
# le. To fold input using the fold command pass a fi
# le or standard input to the command.
```

使用`fold`命令进行分隔，并使用`-s`选项用于分隔空格上的行，以便不打断单词。

```shell
fold -w 50 -s file.txt
# fold command in Linux wraps each line in an input
# file to fit a specified width and prints it to
# the standard output. By default, it wraps lines
# at a maximum width of 80 columns but this is
# configurable. To fold input using the fold
# command pass a file or standard input to the
# command.
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ufold.htm
https://www.runoob.com/linux/linux-comm-fold.html
https://www.geeksforgeeks.org/fold-command-in-linux-with-examples/
```