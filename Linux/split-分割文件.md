# split命令
`split`命令用于将大文件分割成较小的文件，在默认情况下将按照每`1000`行切割成一个小文件。

## 语法

```shell
split [OPTION]... [FILE [PREFIX]]
```

## 参数
* `-a, --suffix-length=N`: 使用长度为`N`的后缀，默认为`2`。
* `--additional-suffix=SUFFIX`: 将额外的`SUFFIX`插入文件名。
* `-b, --bytes=SIZE`: 每个输出文件放置`SIZE`字节，即指定每多少字节切成一个小文件。
* `-C, --line-bytes=SIZE`: 每个输出文件最多放入`SIZE`个字节行，与参数`-b`相似，但是在切割时将尽量维持每行的完整性。
* `-d`: 使用数字后缀而不是字母。
* `--numeric-suffixes[=FROM]`: 与`-d`相同，但允许设置起始值。
* `-e, --elide-empty-files`: 不使用`-n`生成空的输出文件。
* `--filter=COMMAND`: 写入`shell`命令`COMMAND`，文件名是`$FILE`。
* `-l, --lines=NUMBER`: 每个输出文件放入`NUMBER`行。
* `-n, --number=CHUNKS`: 生成`CHUNKS`输出文件，`CHUNKS`可以取的值有，`N`:根据输入大小分为`N`个文件，`K/N`:将`N`的第`K`个输出到标准输出，`l/N`: 分割成`N`个文件，不分割行，`l/K/N`:输出`K`的第`N`到标准输出，而不分割线，`r/N`:类似于`l`，但同样使用循环分布`r/K/N`，但仅将`N`的第`K`个输出到标准输出。
* `-t, --separator=SEP`: 使用`SEP`代替换行符作为记录分隔符，`\0`即`0`指定`NUL`字符。
* `-u, --unbuffered`: 立即使用`-n r/...`将输入复制到输出。
* ` --verbose`: 在打开每个输出文件之前，输出详细的信息。
* `--help`: 输出帮助信息。
* `--version`: 输出版本信息。

## 示例
将文件`tmp/file.txt`分`N`个独立的文件，分别为`newaa`、`newab`、`newac`、`...`，每个文件包含`2`个字节的数据。

```shell
split -b 2 /tmp/file.txt new
```

将文件`tmp/file.txt`分`N`个独立的文件，分别为`newaa`、`newab`、`newac`、`...`，每个文件包含`2`行数据。

```shell
 split -l 2 /tmp/file.txt new
```

将文件`tmp/file.txt`分`N`个独立的文件，以数字作为后缀，每个文件包含`2`行数据。

```shell
split -d -l 2 /tmp/file.txt new
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/usplit.htm
https://www.runoob.com/linux/linux-comm-split.html
https://www.tutorialspoint.com/unix_commands/split.htm
```
