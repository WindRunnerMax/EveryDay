# ln命令
`ln`命令用来为文件创建链接，链接类型分为硬链接和软链接两种，软链接又称符号链接，默认的链接类型是硬链接，如果要创建符号链接必须使用`-s`选项，符号链接文件不是一个独立的文件，其很多属性依赖于源文件，所以给符号链接文件设置存取权限是没有意义的。

## 语法

```shell
 ln [-bdfinsvF] [-S backup-suffix] [-V {numbered,existing,simple}] [--help] [...] [origin] [target]
```
## 参数
* `-b, --backup`: 删除，覆盖目标文件之前的备份。
* `-d, -F, --directory`: 建立目录的硬链接。
* `-f, --force`: 强行建立文件或目录的链接，不论文件或目录是否存在。
* `-i, --interactive`: 覆盖既有文件之前先询问用户。
* `-n, --no-dereference`: 把符号链接的目的目录视为一般文件。
* `-s, --symbolic`: 对源文件建立符号链接，而非硬链接。
* `-S <backup-suffix>, --suffix=<backup-suffix>`: 用`-b`参数备份目标文件后，备份文件的字尾会被加上一个备份字符串，预设的备份字符串是符号`~`，用户可通过`-S`参数来改变它。
* `-v, --verbose`: 显示指令执行过程。
* `-V <backup method>, --version-control=<backup method>`: 用`-b`参数备份目标文件后，备份文件的字尾会被加上一个备份字符串，这个字符串不仅可用`-S`参数变更，当使用`-V`参数<备份方式>指定不同备份方式时，也会产生不同字尾的备份字符串。
* `--help`: 在线帮助。
* `--version`: 显示版本信息。

## 链接方式

### 软链接
* 软链接以路径的形式存在，类似于`Windows`操作系统中的快捷方式。
* 软链接可以 跨文件系统，硬链接不可以。
* 软链接可以对一个不存在的文件名进行链接。
* 软链接可以对目录进行链接。

### 硬链接
* 硬链接，以文件副本的形式存在，但不占用实际空间。
* 不允许给目录创建硬链接。
* 硬链接只有在同一个文件系统中才能创建。

## 示例
为`file.txt`创建软链接`filesoftlink`。

```shell
ln -s file.txt filesoftlink
```

为`file.txt`创建硬链接`filehardlink`。

```shell
ln file.txt filehardlink
```

显示版本信息。

```shell
ln --version
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://man.linuxde.net/ln
https://www.runoob.com/linux/linux-comm-ln.html
https://www.tutorialspoint.com/unix_commands/ln.htm
```
