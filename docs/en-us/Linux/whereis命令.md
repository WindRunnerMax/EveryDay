# `whereis` command
The `whereis` command is used to locate files. This command searches for files that meet certain conditions in specific directories. It can only be used to locate binary files, source code files, and `man` manual pages. For general file locating, the `locate` or `find` command should be used.

## Syntax

```shell
whereis [options] file
```

## Options
* `-b`: Search only for binary files.
* `-B <dirs>`: Change or limit the location where `whereis` searches for binary files.
* `-m`: Search only for source files.
* `-M <dirs>`: Change or limit the location where `whereis` searches for manual sections.
* `-s`: Search only for source files.
* `-S <dirs>`: Change or limit the location where `whereis` searches for sources.
* `-f`: Do not display the pathname in front of the file name.
* `-u`: Search for unusual entries. If a file does not have an entry for each requested type, the file is considered unusual, meaning it is searching for files that do not contain the specified type.
* `-l`: Output the effective search path.

## Examples
List the directories where the `whereis` command searches. By default, `whereis` searches for files in the hardcoded paths listed in the environment variables.

```shell
whereis -l
# bin: /usr/bin
# bin: /usr/sbin
# bin: /usr/lib
# ...
```

Retrieve information about the `bash` command. The output includes information about the `bash` command, its binary file path `/bin/bash`, source file `/etc/bash.bashrc`, and manual page `/usr/share/man/man1/bash.1.gz`. If the command being searched for does not exist, `whereis` will only print the command name.

```shell
whereis bash
# bash: /bin/bash /etc/bash.bashrc /usr/share/man/man1/bash.1.gz
```

Query `netcat` and `uptime` commands simultaneously using the `whereis` command. The output will contain information about the `netcat` and `uptime` commands.

```shell
whereis netcat uptime
# netcat: /bin/netcat /usr/share/man/man1/netcat.1.gz
# uptime: /usr/bin/uptime /usr/share/man/man1/uptime.1.gz
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/uwhereis.htm
https://linuxize.com/post/whereis-command-in-linux/
https://www.runoob.com/linux/linux-comm-whereis.html
```