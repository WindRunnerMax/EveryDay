# mv命令
`mv`命令用来为文件或目录改名、或将文件或目录移入其它位置。

## 语法

```shell
mv [OPTION] [-T] SOURCE DEST
mv [OPTION] SOURCE DIRECTORY
mv [OPTION] -t DIRECTORY SOURCE
```

## 参数
* `--backup[=CONTROL]`: 对每个现有目标文件进行备份。
* `-b`: 像`--backup`一样，但是不接受参数。
* `-f, --force`: 若指定目录已有同名文件，覆盖前不提示。
* `-i, --interactive`: 若指定目录已有同名文件，则先询问是否覆盖旧文件。
* `-n, --no-clobber`: 若指定目录已有同名文件，不覆盖此文件。
* `--strip-trailing-slashes`: 从每个源中删除所有结尾的斜杠。
* `-S, --suffix=SUFFIX`: 指定要用于所有备份文件的文件名后缀`SUFFIX`，默认值为`~`。
* `-t, --target-directory=DIRECTORY`: 将所有源移动到目标目录中，此时目标目录在前，源文件在后。。
* `-T, --no-target-directory`: 将目标视为普通文件，而不是目录。
* `-u, --update`: 如果文件较新，则不会覆盖，仅当目标文件早于源文件或目标文件不存在时才会发生移动。
* `-v, --verbose`: 提供详细的输出，打印每个移动文件的名称。
* `--help`: 显示帮助信息。
* `--version`: 显示版本信息。

## 语法设置


|命令格式 | 运行结果|
|---|---|
|`mv` 文件名 文件名 | 将源文件名改为目标文件名。|
|`mv` 文件名 目录名 | 将文件移动到目标目录。|
|`mv` 目录名 目录名 | 目标目录已存在，将源目录移动到目标目录，目标目录不存在则改名。|
|`mv` 目录名 文件名 | 出错。|

## 示例

将`file2.txt`更名为`file3.txt`。

```shell
mv file2.txt file3.txt
```

将`file.txt`移动到`var`目录中。

```shell
mv file.txt /var/
```

将`dir`目录改名为`dirs`。

```shell
mv dir dirs
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/umv.htm
https://www.runoob.com/linux/linux-comm-mv.html
https://www.tutorialspoint.com/unix_commands/mv.htm
```
