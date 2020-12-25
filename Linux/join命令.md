# join命令
`join`命令用于将两个文件中，指定栏位内容相同的行连接起来。其首先找出两个文件中指定栏位内容相同的行，并加以合并，再输出到标准输出设备。

## 语法

```shell
join [OPTION]... FILE1 FILE2
```

## 参数
* `-a FILENUM`: 从`FILENUM`打印不成对的行，其中`FILENUM`是`1`或`2`，对应于`FILE1`或`FILE2`。
* `-e EMPTY`: 将缺少的输入字段替换为空。
* `-i, --ignore-case`: 比较字段时忽略大小写的差异。
* `-j FIELD`: 相当于`-1 FIELD -2 FIELD`。
* `-o FORMAT`: 构造输出线时遵守`FORMAT`。
* `-t CHAR`: 使用`CHAR`作为输入和输出字段分隔符。
* `-v FILENUM`: 类似于`-a FILENUM`，但不连接输出行。
* `-1 FIELD`: 加入文件`1`的这个`FIELD`。
* `-2 FIELD`: 加入文件`2`的这个`FIELD`。
* `--check-order`: 检查输入是否正确排序，即使所有输入行都可以配对。
* `--nocheck-order`: 不要检查输入是否正确排序。
* `--header`: 将每个文件的第一行视为字段标题，无需尝试将它们配对即可打印它们。
* `--help`: 显示帮助信息。
* `--version`: 显示版本信息。

## 示例
`file1.txt`与`file2.txt`文件内容如下：

```
# file1.txt
1 AAYUSH
2 APAAR
3 HEMANT
4 KARTIK
5 TIM

# file2.txt
1 101
2 102
3 103
4 104
```

使用`join`命令合并文件，为了合并两个文件，文件必须具有一些公共字段，此时两个文件中的公共字段均带有编号`1、2...`。

```shell
join file1.txt file2.txt
# 1 AAYUSH 101
# 2 APAAR 102
# 3 HEMANT 103
# 4 KARTIK 104
```

使用`-a`选项打印`FILE1`中已成对的行并链接以及不成对的行。

```shell
join file1.txt file2.txt -a 1
# 1 AAYUSH 101
# 2 APAAR 102
# 3 HEMANT 103
# 4 KARTIK 104
# 5 TIM

```


使用`-v`选项打印`FILE1`中不成对的行。

```shell
join file1.txt file2.txt -v 1
# 5 TIM
```

`join`会在第一个公共字段上组合文件行，该字段是默认值。但是这两个文件中的公共值不一定总是第一个列，所以`join`可以使用`-1, -2`指定公共值位置。`-1`和`-2`表示第一个和第二个文件，这些选项需要一个数字参数，该参数引用相应文件的连接字段。

```
`file1.txt`与`file2.txt`文件内容如下：
# file1.txt
AAYUSH 1 
APAAR 2
HEMANT 3
KARTIK 4
TIM 5

# file2.txt
101 1
102 2
103 3
104 4
```

```shell
join -1 2 -2 2 file1.txt file2.txt
# 1 AAYUSH  101
# 2 APAAR 102
# 3 HEMANT 103
# 4 KARTIK 104
```

对于上面的示例，我们直接使用`-j`参数也可以实现。

```shell
join -j 2 file1.txt file2.txt
# 1 AAYUSH  101
# 2 APAAR 102
# 3 HEMANT 103
# 4 KARTIK 104
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ujoin.htm
https://www.runoob.com/linux/linux-comm-join.html
https://www.geeksforgeeks.org/join-command-linux/
```

