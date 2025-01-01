# sed命令
 `sed`命令是利用脚本来处理文本文件，可依照脚本的指令来处理、编辑文本文件，主要用来自动编辑一个或多个文件、简化对文件的反复操作、编写转换程序等。

## 语法

```shell
sed [OPTION]... {script-only-if-no-other-script} [input-file]...
```

## 参数
* `-n, --quiet, --silent`: 禁止自动打印图案空间。
* `-e script, --expression=script`: 将脚本添加到要执行的命令中。
* `-f script-file, --file=script-file`: 将脚本文件的内容添加到要执行的命令中。
* `--follow-symlinks`: 就地处理时遵循符号链接。
* `-i[SUFFIX], --in-place[=SUFFIX]`:就地编辑文件，如果提供了后缀，则使用文件扩展名后缀进行备份。
* `-l N, --line-length=N`: 为`l`命令指定所需的换行长度`N`。
* `--POSIX`: 禁用所有`GNU`扩展。
* `-r, --regexp-extended`: 在脚本中使用扩展的正则表达式。
* `-s, --separate`: 将文件视为单独的文件，而不是单个连续的长文件流。
* `-u, --unbuffered`: 从输入文件中加载少量数据，并更频繁地刷新输出缓冲区。
* `--help`: 输出帮助信息。
* `--version`: 输出版本信息。

## 示例
`file.txt`文件内容如下。

```plain
unix is great os. unix is opensource. unix is free os.
learn operating system.
unix linux which one you choose.
unix is easy to learn.unix is a multiuser os.Learn unix .unix is a powerful.
```

将文件中的每行的第一个单词`unix`替换为`linux`，要保存的话需要使用输出重定向。

```shell
sed "s/unix/linux/" file.txt

# linux is great os. unix is opensource. unix is free os.
# learn operating system.
# linux linux which one you choose.
# linux is easy to learn.unix is a multiuser os.Learn unix .unix is a powerful.

```

替换行中模式的第`2`个匹配项，将行中出现的第二个单词`unix`替换为`linux`。

```shell
sed "s/unix/linux/2" file.txt

# unix is great os. linux is opensource. unix is free os.
# learn operating system.
# unix linux which one you choose.
# unix is easy to learn.linux is a multiuser os.Learn unix .unix is a powerful.
```

使用替换标志`/g`全局替换指定`sed`命令来替换行中所有出现的字符串。

```shell
sed "s/unix/linux/g" file.txt

# linux is great os. linux is opensource. linux is free os.
# learn operating system.
# linux linux which one you choose.
# linux is easy to learn.linux is a multiuser os.Learn linux .linux is a powerful.
```

指定第`2`个之后的全部匹配模式的字符进行替换。

```shell
sed "s/unix/linux/2g" file.txt

# unix is great os. linux is opensource. linux is free os.
# learn operating system.
# unix linux which one you choose.
# unix is easy to learn.linux is a multiuser os.Learn linux .linux is a powerful
```

用括号括住每个单词的第一个字符，在括号中打印每个单词的第一个字符。

```bash
echo "Welcome To The World" | sed "s/\(\b[A-Z]\)/\(\1\)/g"

# (W)elcome (T)o (T)he (W)orld
```

可以限制`sed`命令替换特定行号上的字符串。

```bash
sed "3 s/unix/linux/g" file.txt

# unix is great os. unix is opensource. unix is free os.
# learn operating system.
# linux linux which one you choose.
# unix is easy to learn.unix is a multiuser os.Learn unix .unix is a powerful.
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/used.htm
https://www.runoob.com/linux/linux-comm-sed.html
https://www.geeksforgeeks.org/sed-command-in-linux-unix-with-examples/
```

