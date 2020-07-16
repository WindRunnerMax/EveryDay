# cmp命令
`cmp`命令用来比较两个文件是否有差异，当相互比较的两个文件完全一样时，则该指令不会输出任何信息，若发现有差异，预设会标示出第一个不同之处的字符和列数编号，若不指定任何文件名称或是所给予的文件名为`-`，则`cmp`指令会从标准输入设备读取数据。

## 语法

```shell
cmp [-clsv][-i <number of characters>][--help][file][file]
```

## 参数
* `-c`或`--print-chars`: 除了标明差异处的十进制字码之外，一并显示该字符所对应字符。
* `-i <number of characters>`或`--ignore-initial=<number of characters>`: 指定跳过的数目。
* `-l`或`--verbose`: 标示出所有不一样的地方。
* `-s`或`--quiet`或`--silent`: 不显示错误信息。
* `-v`或`--version`: 显示版本信息。
* `--help`: 在线帮助。

## 示例
比较`file.txt`与`file2.txt`文件的差异，如果文件相同，则不显示消息，如果文件不同，则显示第一个不同的位置。

```shell
cmp file.txt file2.txt
```

比较`file.txt`与`file2.txt`文件的差异，标出所有不同之处。

```shell
cmp -l file.txt file2.txt
```

比较`file.txt`与自定义输入内容的差异，输入内容后按`Ctrl+D`输出`EOF`标识后结束输入。

```shell
cmp file.txt -
```
    


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/cmp
https://www.jianshu.com/p/f5963af8d796
https://www.runoob.com/linux/linux-comm-cmp.html
```
