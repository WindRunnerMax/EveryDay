# du命令
`du`命令是`Disk Usage`的缩写，用于估算和显示文件系统中的文件和目录的磁盘使用情况。

## 语法

```bash
du [OPTION]... [FILE]...
du [OPTION]... --files0-from=F
```

## 参数
* `-a, --all`: 对所有文件计数，包括目录。
* `--apparent-size`: 打印表观大小，而不是磁盘使用量。虽然表观大小通常较小，但由于稀疏文件的孔洞、内部碎片和间接块，其可能更大。
* `-B, --block-size=SIZE`: 在打印之前按`SIZE`缩放大小。例如，`-BM`以`1,048,576`字节为单位打印大小。
* `-b, --bytes`: 相当于 `--apparent-size --block-size=1`。
* `-c, --total`: 显示总计。
* `-D, --dereference-args`: 只解除命令行中列出的符号链接的引用。
* `--files0-from=F`: 汇总文件F中指定的以空字节终止的文件名的磁盘使用情况，如果`F`是`-`，则从标准输入读取名字。
* `-H`: 相当于 `--dereference-args (-D)`。
* `-h, --human-readable`: 以人类可读的格式打印大小，舍入数值并使用缩写。例如，`1K`，`234M`，`2G`等。
* `--si`: 类似于 `-h`，但使用`1000`的幂，而不是`1024`。
* `-k`: 类似于 `--block-size=1K`。
* `-l, --count-links`: 多次计算大小(如果有硬链接)。
* `-m`: 类似于 `--block-size=1M`。
* `-L, --dereference`: 引用所有符号链接。
* `-P, --no-dereference`: 不追踪任何符号链接(这是默认设置)。
* `-0, --null`: 用0字节而不是换行符结束每个输出行。
* `-S, --separate-dirs`: 不包括子目录的大小。
* `-s, --summarize`: 仅针对每个参数显示总计。
* `-x, --one-file-system`: 跳过不同文件系统上的目录。
* `-X, --exclude-from=FILE`: 排除与`FILE`中的任何模式匹配的文件。
* `--exclude=PATTERN`: 排除与`PATTERN`匹配的文件。
* `-d, --max-depth=N`: 仅在目录(或文件，带有`--all`时)位于命令行参数以下的`N`个或更少级别时才打印总计，`--max-depth=0`等同于`--summarize`。
* `--time`: 显示目录中任何文件或其子目录的最后修改时间。
* `--time=WORD`: 按`WORD`而不是修改时间显示时间：`atime`, `access`, `use`, `ctime`或`status`。
* `--time-style=STYLE`: 使用样式`STYLE`显示时间：`full-iso`, `long-iso`, `iso`，或`+`格式(`FORMAT`的解释类似于`date`的格式)。
* `--help`: 显示帮助信息并退出。
* `--version`: 输出版本信息并退出。

## 示例

显示当前目录及其子目录所占的磁盘空间。

```bash
du -h
```

仅显示某个特定目录的磁盘使用情况，默认会递归地显示目录使用情况。

```bash
du -h /home
```

递归地显示某个目录下每个文件和子目录所占的空间，并最终汇总显示总使用空间。

```bash
du -ah /home
```

显示当前目录下的一级子目录的空间使用情况。

```bash
du -h -d 1
```

显示文件系统的磁盘空间使用情况`disk free`。

```bash
df -h
```

显示当前目录下的所有文件和子目录的磁盘使用情况，并按照大小排序。

```bash
du -h -d 1 | sort -h -r
```

显示当前目录下的所有文件和子目录的磁盘使用情况，排除部分文件夹，并按照大小排序。

```bash
du -h -d 1 --exclude=.git --exclude=node_modules | sort -h -r
du -h -d 1 -I .git -I node_modules | sort -h -r # Mac
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/udu.htm
https://linuxize.com/post/du-command-in-linux/
https://www.runoob.com/linux/linux-comm-du.html
```
