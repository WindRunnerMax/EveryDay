# `find` command
The `find` command is used to search for files in a specified directory. Any string placed before the parameters will be considered as the directory name to search for. If no parameters are set when using this command, the `find` command will search for subdirectories and files in the current directory and display all the found subdirectories and files.

## Syntax

```shell
find [-H] [-L] [-P] [-Olevel] [-D help|tree|search|stat|rates|opt|exec|time] [path...] [expression]
```


## Parameters
* `-amin<minute>`: Search for files or directories that have been accessed at the specified time, measured in minutes.
* `-anewer<file or folder>`: Find files or directories whose access time is closer to the present time than the specified file or folder.
* `-atime<day>`: Search for files or directories that have been accessed at the specified time, measured in days.
* `-cmin<minute>`: Search for files or directories that have been changed at the specified time.
* `-cnewer<file or folder>`: Find files or directories whose change time is closer to the present time than the specified file or folder.
* `-ctime<day>`: Search for files or directories that have been changed at the specified time, measured in days.
* `-daystart`: Calculate time from the beginning of the current day.
* `-depth`: Start the search from the deepest subdirectory under the specified directory.
* `-empty`: Find files with a size of `0 Byte` or directories with no subdirectories or files inside.
* `-exec<command>`: Execute the command if the return value of the `find` command is `True`.
* `-false`: Set the return value of the `find` command to `False`.
* `-fls<file list>`: Similar to the `-ls` parameter, but saves the results to the specified list file.
* `-follow`: Exclude symbolic links.
* `-fprint<file list>`: Similar to the `-print` parameter, but saves the results as a specified list file.
* `-fprint0<file list>`: Similar to the `-print0` parameter, but saves the results as a specified list file.
* `-fprintf<file list><output format>`: Similar to the `-printf` parameter, but saves the results as a specified list file.
* `-fstype<file system type>`: Only search for files or directories in the specified file system type.
* `-gid<group id>`: Find files or directories with the specified group identification code.
* `-group<group name>`: Find files or directories with the specified group name.
* `-help, --help`: Online help.
* `-ilname<template style>`: Similar to the `-lname` parameter, but ignores differences in character case.
* `-iname<template style>`: Similar to the `-name` parameter, but ignores differences in character case.
* `-inum<inode num>`: Find files or directories with the specified inode number.
* `-ipath<template style>`: Similar to the `-path` parameter, but ignores differences in character case.
* `-iregex<template style>`: Similar to the `-regexe` parameter, but ignores differences in character case.
* `-links<number of connections>`: Find files or directories with the specified number of hard links.
* `-iname<template style>`: Specify a string as a template style for finding symbolic links.
* `-ls`: List the file or directory names to standard output if the return value of the `find` command is `True`.
* `-maxdepth<directory level>`: Set the maximum directory level.
* `-mindepth<directory level>`: Set the minimum directory level.
* `-mmin<minute>`: Search for files or directories that have been changed at the specified time, measured in minutes.
* `-mount`: Same effect as specifying `-xdev`.
* `-mtime<24 hour>`: Search for files or directories that have been changed at the specified time, measured in `24` hours.
* `-name<template style>`: Specify a string as a template style for finding files or directories.
* `-newer<file or folder>`: Find files or directories whose change time is closer to the present time than the specified file or folder.
* `-nogroup`: Find files or directories that do not belong to the local host's group identification code.
* `-noleaf`: Do not consider directories that must have at least two hard links.
* `-nouser`: Find files or directories that do not belong to the local host's user identification code.
* `-ok<command>`: Similar to the `-exec` parameter, but asks the user before executing the command. If the user answers `y` or `Y`, the command will not be executed.
* `-path<template style>`: Specify a string as a template style for finding directories.
* `-perm<permission value>`: Find files or directories with the specified permission value.
* `-print`: List the file or directory names to standard output if the return value of the `find` command is `True`. The format is one name per line, prefixed with `./`.
* `-print0`: List the file or directory names to standard output if the return value of the `find` command is `True`. The format has all names on the same line.
* `-printf<output format>`: List the file or directory names to standard output if the return value of the `find` command is `True`. The format can be specified.
* `-prune`: Do not search for the string as a template style for finding files or directories.
* `-regex<template style>`: Specify a string as a template style for finding files or directories.
* `-size<file size>`: Find files with the specified file size.
* `-true`: Set the return value of the `find` command to `True`.
* `-type<file type>`: Only search for files of the specified file type.
* `-uid<user id>`: Find files or directories with the specified user identification code.
* `-used<day>`: Search for files or directories that have been accessed after being changed and were accessed at the specified time, measured in days.
* `-user<owner name>`: Find files or directories with the specified owner name.
* `-version, --version`: Display version information.
* `-xdev`: Limit the scope to the forefront file system.
* `-xtype<file type>`: Similar to the `-type` parameter, but specifically checks for symbolic links.

## Example

Find all files with the extension `py` in the directory `/tmp/` and its subdirectories.

```shell
find /tmp/ -name *.py
# /tmp/file.py
```

Find all regular files in the directory `/tmp/` and its subdirectories.

```shell
find /tmp/ -type f
# /tmp/file.c
# /tmp/file.txt
# /tmp/a.out
# /tmp/www/1.txt
# /tmp/file.py
# /tmp/file
# ...
```

Find all files that have been changed within the last `1` day in the directory `/tmp/` and its subdirectories. Use `+1` to represent files changed more than `1` day ago.

```shell
find /tmp/ -ctime -1
# /tmp/
# /tmp/1
# /tmp/file.txt
# /tmp/file
```

Find all regular files in the directory `/tmp/` and its subdirectories that were modified more than `7` days ago, and ask for confirmation before deleting them.

```shell
find /tmp/ -type f -mtime +7 -ok rm {} \;
# < rm ... /tmp/file.py > ? n
# ...
```

Find all files in the directory `/tmp/` and its subdirectories where the owner has read and write permissions, and the group and others have read permissions.

```shell
find /tmp/  -type f -perm 644 -exec ls -l {} \;
# -rw-r--r-- 1 root root 60 Jul 22 19:55 /tmp/file.c
# -rw-r--r-- 1 www www 73 Jul 23 20:54 /tmp/file.txt
# ...
```

Find all regular files in the directory `/tmp/` and its subdirectories with a size of `0` and list their full paths.

```shell
find /tmp/ -type f -size 0 -exec ls -l {} \;
# -rwx------ 1 root root 0 Jul 11 17:25 /tmp/file.py
```



## EveryDay

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://man.linuxde.net/find
https://www.runoob.com/linux/linux-comm-find.html
https://www.tutorialspoint.com/unix_commands/find.htm
```