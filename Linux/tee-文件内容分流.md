# tee命令
`tee`命令会从标准输入设备读取数据，将其内容输出到标准输出设备，同时保存成文件。

## 语法

```shell
tee [OPTION]... [FILE]...
```

## 参数
* `-a, --append`: 追加到已有文件的后面，而不是覆盖文件。
* `-i, --ignore-interrupts`: 忽略中断信号。
* `-p`: 诊断写入非管道的错误。
* `--output-error[=MODE]`: 设置写错误时的行为。
* `--help`: 显示帮助信息。
* `--version`: 显示版本信息

## 模式
* `warn`: 诊断写入任何输出的错误。
* `warn-nopipe`: 诊断写入任何输出而不是管道的错误。
* `exit`: 当错误写入任何输出时退出。
* `exit-nopipe`: 当写入任何输出（不是管道）时出错时退出。

## 示例
将用户输入的数据同时保存到文件`file1.txt`和`file2.txt`中，输入文件信息后回车即可得到输出反馈。

```shell
tee file1.txt file2.txt 
```

将用户输入的数据追加到`file1.txt`文件。

```shell
tee -a file1.txt  
```

`ls`列出当前目录中所有文件扩展名为`.txt`的所有文件，每行一个文件名，将输出通过管道传输到`wc`，将行进行计数并输出数字，输出通过管道传输到`tee`，将输出写入终端，并将信息写入文件`count.txt`，即写入文件扩展名为`.txt`的所有文件的数量。

```shell
ls -1 *.txt | wc -l | tee count.txt
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/utee.htm
https://www.runoob.com/linux/linux-comm-tee.html
https://www.tutorialspoint.com/unix_commands/tee.htm
```
