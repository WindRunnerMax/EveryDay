# diffstat命令
`diffstat`命令根据`diff`的比较结果，统计各文件的插入、删除、修改等差异计量。

## 语法

```shell
diffstat [options] [files]
```

## 参数
* `-c`: 输出的每一行都以`＃`作为前缀，使其成为`Shell`脚本的注释行。
* `-C`: 添加`SGR`颜色转义序列以突出显示直方图。
* `-e`: 将标准错误重定向到`file`。
* `-f <num>`: 指定直方图的格式，`0`仅显示插入`+`，删除`-`或修改`!`的值和单个直方图代码，`1`正常输出，`2`用点填充直方图，`4`用直方图打印每个值，任何非零值都会给出直方图，点和单个值可以组合。
* `-H`: 打印使用情况消息并退出。
* `-k`: 禁止合并报告中的文件名。
* `-l`: 仅列出文件名，不生成直方图。
* `-n <file length>`: 指定文件名长度，指定的长度必须大于或等于所有文件中最长的文件名。
* `-o <file>`: 将标准输出重定向到`file`。
* `-p <file length>`: 与`-n`参数相同，但此处的`<file length>`包括了文件的路径。
* `-r`: 提供对直方图所示数据的可选舍入，而不是通过误差调整来截断，`0`是默认值，不进行舍入，但累积的错误将添加到以下列，`1`舍入数据，`2`对数据进行舍入并调整直方图，以确保即使有差异通常会四舍五入也存在差异。
* `-t`: 覆盖直方图，生成逗号分隔值的输出。
* `-u`: 禁止在报告中对文件名进行排序。
* `-v`: 显示进度，例如如果将输出重定向到文件，则将进度消息写入标准错误。
* `-w`: 指定输出时栏位的宽度。
* `-V`: 显示版本信息。

## 示例

统计`diff`的比较结果的差异信息。

```shell
diff file.txt file2.txt | diffstat -v
```

统计`diff`的比较结果的差异信息，仅列出文件名，不生成直方图。

```shell
diff file.txt file2.txt | diffstat -l
```

统计`diff`的比较结果的差异信息，指定直方图的最大宽度。

```shell
diff file.txt file2.txt | diffstat -w 11
```



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/diffstat
https://www.runoob.com/linux/linux-comm-diffstat.html
https://www.tutorialspoint.com/unix_commands/diffstat.htm
```
