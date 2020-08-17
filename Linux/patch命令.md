# patch命令
`patch`指令让用户利用设置修补文件的方式、修改、更新原始文件，倘若一次仅修改一个文件，可直接在指令列中下达指令依序执行，如果配合修补文件的方式则能一次修补大批文件，这也是`Linux`系统核心的升级方法之一。

## 语法

```shell
patch [OPTION]... [ORIGFILE [PATCHFILE]]
```

## 参数
* `-b, --backup`: 备份每一个原始文件。
* `-B<pref>, --prefix=<pref>`: 设置文件备份时，附加在文件名称前面的字首字符串，该字符串可以是路径名称。
* `-c, --context`: 把修补数据解译成关联性的差异。
* `-d<dir>, --directory=<dir>`: 设置工作目录。
* `-D<define>, --ifdef=<define>`: 用指定的符号把改变的地方标示出来。
* `-e, --ed`: 把修补数据解译成ed指令可用的叙述文件。
* `-E, --remove-empty-files`: 若修补过后输出的文件其内容是一片空白，则移除该文件。
* `-f, --force`: 此参数的效果和指定`-t`参数类似，但会假设修补数据的版本为新版本。
* `-F<num >, --fuzz<num >`: 设置监别列数的最大值。
* `-g<num>, --get=<num>`: 设置以`RSC`或`SCCS`控制修补作业。
* `-i<patchfile>, --input=<patchfile>`: 读取指定的修补文件。
* `-l, --ignore-whitespace`: 忽略修补数据与输入数据的跳格，空格字符。
* `-n, --normal`: 把修补数据解译成一般性的差异。
* `-N, --forward`: 忽略修补的数据较原始文件的版本更旧，或该版本的修补数据已使　用过。
* `-o<outfile>, --output=<outfile>`: 设置输出文件的名称，修补过的文件会以该名称存放。
* `-p<num>, --strip=<num>`: 设置欲剥离几层路径名称。
* `-f<rejectfile>, --reject-file=<rejectfile>`: 设置保存拒绝修补相关信息的文件名称，预设的文件名称为`.rej`。
* `-R, --reverse`: 假设修补数据是由新旧文件交换位置而产生。
* `-s, --quiet或--silent`: 不显示指令执行过程，除非发生错误。
* `-t, --batch`: 自动略过错误，不询问任何问题。
* `-T, --set-time`: 此参数的效果和指定`-Z`参数类似，但以本地时间为主。
* `-u, --unified`: 把修补数据解译成一致化的差异。
* `-v, --version`: 显示版本信息。
* `-V<method>, --version-control=<method>`: 用`-b`参数备份目标文件后，备份文件的字尾会被加上一个备份字符串，这个字符串不仅可用`-z`参数变更，当使用`-V`参数指定不同备份方式时，也会产生不同字尾的备份字符串。
* `-Y<pref>, --basename-prefix=--<pref>`: 设置文件备份时，附加在文件基本名称开头的字首字符串。
* `-z<suffix>, --suffix=<suffix>`: 此参数的效果和指定`-B`参数类似，差别在于修补作业使用的路径与文件名若为`src/linux/fs/super.c`，加上`backup/`字符串后，文件`super.c`会备份于`/src/linux/fs/backup`目录里。
* `-Z, --set-utc`: 把修补过的文件更改，存取时间设为`UTC`。
* `--backup-if-mismatch`: 在修补数据不完全吻合，且没有刻意指定要备份文件时，才备份文件。
* `--binary`: 以二进制模式读写数据，而不通过标准输出设备。
* `--help`: 在线帮助。
* `--nobackup-if-mismatch`: 在修补数据不完全吻合，且没有刻意指定要备份文件时，不要备份文件。
* `--verbose`: 详细显示指令的执行过程。

## 示例

使用补丁包`/tmp/file.patch`为文件`/tmp/file2.txt`升级。

```shell
# diff /tmp/file2.txt /tmp/file3.txt > /tmp/file.patch # 生成补丁文件
patch /tmp/file2.txt /tmp/file.patch
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/patch
https://www.runoob.com/linux/linux-comm-patch.html
https://www.tutorialspoint.com/unix_commands/patch.htm
```
