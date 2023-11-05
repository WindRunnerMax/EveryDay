# rm命令
 `rm`命令用于删除一个文件或者目录。 

## 语法

```shell
rm [OPTION]... [FILE]...
```

## 参数
* `-f, --force`: 即使文件属性设为只读也直接删除，不逐一确认，此外忽略不存在的文件，不产生提示。
* `-i`: 删除之前逐一询问确认。
* `-I`: 在删除三个以上文件之前或在递归删除时提示一次，比`-i`提示的次数少，但仍然可以防止大多数错误。
* `--interactive[=WHEN]`: 根据`WHEN`提示，从不，一次`-I`或始终`-i`，如果没有`WHEN`，则始终提示。
* `--one-file-system`: 递归删除层次结构时，跳过文件系统上与相应命令行参数不同的任何目录。
* `--no-preserve-root`: 不特别对待`/`。
* `--preserve-root`: 不要删除`/`，默认选项。
* `-r, -R, --recursive`: 递归删除目录及其内容。
* `-d, --dir`: 删除空目录。
* `-v, --verbose`: 输出执行过程。
* `--help`: 输出帮助信息。
* `--version`: 输出版本信息。

## 示例
删除文件`file.txt`，如果文件是写保护的，则将提示是否确认要删除。

```shell
rm file.txt
```

删除文件`file.txt`，即使文件是写保护的也不会有确认提示。

```shell
rm -f file.txt
```

删除当前目录中的所有文件，如果文件是写保护的，则在`rm`删除之前将提示。

```shell
rm *
```

删除当前目录中的所有文件，`rm`将不会有任何提示。

```shell
rm -f *
```

尝试删除当前目录中的每个文件，但在删除每个文件之前提示确认。

```shell
rm -i *
```

删除当前目录中的每个文件，提示确认是否删除三个以上的文件。

```shell
$ rm -I *
```

删除目录`directory`及其包含的所有文件和目录，果`rm`尝试删除的文件或目录具有写保护，则将提示是否确实要删除。

```shell
rm -r directory
```

删除目录`directory`及其包含的所有文件和目录，不会有任何确认提示。

```shell
rm -rf mydirectory
```

## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.howtoforge.com/linux-rm-command/
https://www.runoob.com/linux/linux-comm-rm.html
https://www.tutorialspoint.com/unix_commands/rm.htm
```
