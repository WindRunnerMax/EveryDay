# colrm命令
`colrm`命令用于编辑源代码文件，脚本文件或常规文本文件中的文本，此命令从文件中删除选定的列，列定义为一行中的单个字符。索引总是从`1`开始，而不是`0`。如果同时指定了开始和结束，则它们之间的列包括开始和结束将被删除。如果只需要删除一列，则开始和结束必须相同。`colrm`也可以从`stdin`接受输入。如果不加任何参数，则该指令不会过滤任何一行。

## 语法

```shell
colrm [start] [stop]
```

## 参数
* `start`： 指定要删除的列的起始编号。
* `stop`： 指定要删除的列的结束编号，省略则删除从`start`开始的所有列。
* `-V, --version`: 输出版本信息。
* `-h, --help`: 输出帮助信息。

## 示例
从标准输入中获取输入，删除`start`和`stop`之间的所有字符，包括`start`和`stop`。

```shell
colrm 3 6
# 123456
# 127
```

从标准输入中获取输入，删除`start`之后所有的字符。

```shell
colrm 3
# 1234567
# 12
```

读`file.txt`文件中的内容，并将删除后的内容写入`file2.txt`中。

```shell
cat file.txt | colrm 3 6 > file2.txt
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://linux.die.net/man/1/colrm
https://www.runoob.com/linux/linux-comm-colrm.html
https://www.geeksforgeeks.org/colrm-command-in-linux-with-examples/
```

