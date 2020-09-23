# cp命令
 `cp`命令主要用于复制文件或目录。
 
 ## 语法
 
```shell
cp [OPTION]... [-T] SOURCE DEST
cp [OPTION]... SOURCE... DIRECTORY
cp [OPTION]... -t DIRECTORY SOURCE...
```

## 参数
* `-a, --archive`: 与`-dR --preserve = ALL`相同，执行复制时，尝试保留尽可能多的原始文件结构，属性和关联的元数据。
* `--attributes-only`: 不复制文件数据，仅创建具有相同属性的文件，如果目标文件已经存在，不更改其内容，并且可以使用`--preserve`选项精确控制要复制的属性。
* `--backup[=CONTROL]`: 对每个现有目标文件进行备份，否则将被覆盖或删除，该控制参数`CONTROL`指定了版本控制的方法来使用：`none, off`，不进行备份；`numbered, t`，进行编号备份；`existing, nil`，简单的说明编号是否存在编号备份；`simple, never`， 始终进行简单的备份。有一种特殊情况，当`source`和`dest`是相同的常规文件时，`cp --force --backup`将对源进行备份。
* `-b `: 类似于`--backup`，但不接受控制参数，始终使用默认的控制方法。
* `--copy-contents`: 递归操作时，复制特殊文件的内容，例如`FIFO`和`/dev`中的设备，通常适用于专业用途。
* `-d`: 复制符号链接本身而不是它们引用的文件，并保留副本中源文件之间的硬链接，与`--no-dereference --preserve = links`相同。
* `-f, --force`: 如果无法打开现有的目标文件，将其删除，然后重试。如果使用`n / --no-clobber`选项，则此选项无效，但是其独立于`-i / --interactive`来应用，这两个选项都不能消除另一个的影响。
* `-i, --interactive`: 覆盖前提示，覆盖先前的`-n`选项。
* `-H`: 遵循命令行上指定的符号链接，但保留发现的链接。如果命令行上的参数之一是符号链接，请复制引用的文件，而不是链接本身。但是如果在递归遍历过程中发现了符号链接，它将被复制为符号链接，而不是常规文件。
* `-l, --link`: 创建指向文件的硬链接，而不是复制它们。
* `-L, --dereference`: 始终遵循源文件中的符号链接，如果`source`是符号链接，请复制链接到的文件，而不是符号链接本身，指定此选项后，`cp`无法在目标副本中创建符号链接。
* `-n, --no-clobber`: 不要覆盖现有文件。如果先前指定了`-i / --interactive`，则此选项将覆盖它，不能使用`-b / --backup`来指定此选项，因为仅在文件将被覆盖时才创建备份。
* `-P, --no-dereference`: 不遵循源代码中的符号链接，将符号链接复制为符号链接，但是仍然可以遵循目标中遇到的现有符号链接。
* `-p`: 与`--preserve=mode,ownership,timestamps`相同。
* `--preserve[=ATTR_LIST]`: 保留指定的属性，以逗号分隔。属性是：`mode`，保留文件模式位（由`chmod`设置）和任何`ACL`；`ownership`，保留所有者和组（按`chown`设置），保留这些属性的能力与使用`chown`相同；`timestamps`，如果可能的话，保留最后一次文件访问和修改的时间（`atime`和`mtime`，由`touch`设置）；`links`，在目标文件中保留源文件之间的所有链接，使用`-L`或`-H`时，此选项可能会将符号链接复制为硬链接；`context`，保留源文件的`SELinux`安全上下文，否则将由于详细的诊断而失败；`xattr`，保留源文件的扩展属性，否则将因详细诊断而失败；`all`，保留以上所有内容，与单独指定上述所有属性相同，不同之处在于无法复制`context`或`xattr`不会给出失败的退出状态。如果未指定，则`attr_list`的默认值为`mode`，`ownership`，`timestamps`。
* `-c`: 已弃用，与`--preserve=context`相同。
* `--no-preserve=ATTR_LIST`: 不要保留指定的属性。
* `--parents`: 在目录下使用完整的源文件名，即在复制到目标目录时，根据`source`中指定的路径名，在目标中创建丢失的父目录。
* `-R, -r, --recursive`: 递归复制目录。
* `--reflink[=WHEN]`: 如果目标文件系统支持，请执行优化的`CoW`（写时复制）克隆，生成的副本将在磁盘上与原始文件共享相同的字节，直到修改副本为止，请注意这意味着如果源字节已损坏，则目标将共享损坏的数据。
* `--remove-destination`: 尝试打开每个目标文件之前，先删除它，与`--force`选项相反，该选项仅在尝试打开失败后才删除目标文件。
* `--sparse=WHEN`: 控制稀疏文件的创建。稀疏文件包含空洞，其中空洞是零字节序列，不占用物理磁盘空间，读取文件时，孔将读取为零。由于许多文件包含长的零序列，因此可以节省磁盘空间，默认情况下，`cp`检测稀疏文件并创建稀疏目标文件。在当参数定义了`cp`当检测到源文件是稀疏的行为：`auto`，如果源稀疏，尝试使目标稀疏，如果目标存在并且是非常规文件，请不要尝试使其稀疏，这是默认值；`always`，对于源中每个零字节的足够长的序列，即使输入文件不是稀疏的，也要尝试在目标中打稀疏，如果源文件系统不支持稀疏文件，这将可以在目标文件系统上适当地创建一个稀疏文件；`never`，不使输出文件稀疏，某些特殊文件（例如交换文件）绝对不能稀疏。
* `--strip-trailing-slashes`: 删除每个源参数中的所有尾部斜杠。
* `-s, --symbolic-link`: 进行符号链接，而不是复制文件本身。除非目标文件位于当前目录中，否则所有源文件都必须是以斜杠开头的绝对路径名。
* `-S, --suffix=SUFFIX`: 覆盖通常的备份后缀。
* `-t, --target-directory=DIRECTORY`: 将所有源参数复制到目录中。
* `-T, --no-target-directory`: 将目的地视为普通文件。
* `-u, --update`: 仅在源文件比目标文件新或缺少目标文件时复制。
* `-v, --verbose`: 详细模式，解释正在做什么。
* `-x, --one-file-system`: 仅在执行命令的文件系统上操作，如果`cp`试图越过边界到另一个文件系统，则这些文件将被跳过。这包括网络驱动器，驻留在具有不同安装点的文件系统上的任何文件。代表安装点本身的目录将被复制，但不会被遍历。如果指定了`-v`，则将确切显示已跳过的文件。
* `-Z, --context[=CTX]`: 设置目标的`SELinux`安全上下文，文件为默认类型，或`CTX`（如果指定）。
* `--help`: 显示帮助信息。
* `--version`: 显示版本信息。

## 示例

将文件`file.txt`复制为`file2.txt`。

```shell
cp file.txt file2.txt
```

递归复制文件夹，将`tmp`文件夹内容全部复制。

```shell
cp -R ./tmp ./tmp2
```


创建对`file.txt`的符号链接而不是复制文件，当然使用`ln`命令是专门为文件创建符号链接的，`cp`同样是创建符号链接的好方法，注意要在另一个目录中创建符号链接，`cp`需要在源文件名中指定完整路径名，包括完整目录名，相对路径将不起作用。

```shell
cp -s file.txt file-link1
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ucp.htm
https://linuxize.com/post/cp-command-in-linux/
https://www.runoob.com/linux/linux-comm-cp.html
```
