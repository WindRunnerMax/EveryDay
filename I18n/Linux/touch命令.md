# touch Command

The `touch` command is used to modify the time properties of a file or directory, including access time and modification time. If the file does not exist, the system will create a new file.

## Syntax

```shell
touch [OPTION]... FILE...
```

## Options

- `-a`: Change only the access time.
- `-c, --no-create`: Do not create any files.
- `-d, --date=STRING`: Parse `STRING` and use it as the access and modification time.
- `-f`: This option is ignored.
- `-h, --no-dereference`: Affect each symbolic link instead of any referenced file, useful only on systems that can change the timestamp of symbolic links.
- `-m`: Change only the modification time.
- `-r, --reference=FILE`: Use the time of this file instead of the current time.
- `-t STAMP`: Use `[[CC]YY]MMDDhhmm[.ss]` instead of the current time.
- `--time=WORD`: Change the specified time, where `WORD` is `access`, `atime`, or `use`, equivalent to `-a`; and `WORD` is `Modify` or `mtime`, equivalent to `-m`.
- `--help`: Display help information.
- `--version`: Display version information.

## Examples

Create an empty file, if the file already exists, it will change the file's access time.

```shell
touch /tmp/file.txt
```

Create multiple files.

```shell
touch /tmp/file1.txt /tmp/file2.txt /tmp/file3.txt
```

Create files with a template file name.

```shell
tmpwatch -am 30 –nodirs /tmp/
```

Change the access time of a file and view the file attributes.

```shell
touch -a /tmp/file.txt && stat /tmp/file.txt
```

Change the modification time of a file and view the file attributes.

```shell
touch -m /tmp/file.txt && stat /tmp/file.txt
```

Change both the access time and modification time and set a specific access and modification time.

```shell
touch -am -t 202007010000.00 /tmp/file.txt && stat /tmp/file.txt
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://linux.die.net/man/1/touch
https://www.runoob.com/linux/linux-comm-touch.html
https://www.interserver.net/tips/kb/touch-command-linux-usage-examples/
```