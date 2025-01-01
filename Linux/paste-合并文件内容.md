# paste命令
`paste`命令会把每个文件以列对列的方式，一列列地加以合并。

## 语法

```shell
paste [OPTION]... [FILE]...
```

## 参数
* `-d, --delimiters=[LIST]`: 用指定的间隔字符取代`TABs`字符。
* `-s, --serial`: 一次粘贴一个文件，而不是并行粘贴。
* `-z, --zero-terminated`: 行定界符为`NUL`，而不是换行符。
* `--help`: 显示此帮助并退出。
* `--version`: 输出版本信息并退出。


## 示例
按列合并`/tmp/file1.txt`与`/tmp/file2.txt`文件。

```shell
paste /tmp/file1.txt /tmp/file2.txt
```

按列合并`/tmp/file1.txt`与`/tmp/file2.txt`文件，并追加到`/tmp/file3.txt`。

```shell
paste /tmp/file1.txt /tmp/file2.txt >> /tmp/file3.txt
```

按列合并`/tmp/file1.txt`与`/tmp/file2.txt`文件，并指定间隔符`-`。

```shell
paste -d - /tmp/file1.txt /tmp/file2.txt
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.howtoforge.com/linux-paste-command/
https://www.runoob.com/linux/linux-comm-paste.html
https://www.tutorialspoint.com/unix_commands/paste.htm
```
