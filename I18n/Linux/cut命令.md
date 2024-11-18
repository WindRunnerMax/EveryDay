

# `cut` command
The `cut` command is used to display a specified section within each line, cutting bytes, characters, and fields from the file and writing them to the standard output. If the `File` parameter is not specified, the `cut` command will read from the standard input. It is commonly used for two main functions. First, to display the content of files - it sequentially reads the files indicated by the `file` parameter and outputs their content to the standard output. Second, it can be used to join two or more files. For example, `cut f1 f2 > f3` will merge the content of files `f1` and `f2`, and then, through the use of the output redirection symbol `>`, will place them into file `f3`. When dealing with larger files, text flashes rapidly on the screen, causing a scrolling phenomenon. To control the scrolling, you can press `Ctrl+S` to stop scrolling, and press `Ctrl+Q` to resume scrolling. Pressing `Ctrl+C` will terminate the execution of the command.

## Syntax

```shell
cut [OPTION]... [FILE]...
```

## Options
* `-b`: Display only the specified byte range within each line.
* `-c`: Display only the specified range of characters within each line.
* `-d`: Specify the delimiter for fields. The default field delimiter is `TAB`.
* `-f`: Display the content of the specified field.
* `-n`: Used in conjunction with `-b`, it does not split multibyte characters.
* `--complement`: Complement the selected bytes, characters, or fields.
* `--out-delimiter=<delimiter>`: Specify the field delimiter for the output content.
* `--help`: Display command's help information.
* `--version`: Display command's version information.

## Examples

To extract the 3rd character of each line in the file `/tmp/file.txt`.

```shell
cat /tmp/file.txt | cut -c 3
# 3
# 4
# 5
# 6
# 7
# 8
# 9
# 0
# 1
# 2
```

To extract the 3rd to 6th characters of each line in the file `/tmp/file.txt`.

```shell
cat /tmp/file.txt | cut -c 3-6
# 3456
# 4567
# 5678
# 6789
# 7890
# 8901
# 9012
# 0123
# 1234
# 2345
```

To extract the 3rd character to the end of each line in the file `/tmp/file.txt`.

```shell
cat /tmp/file.txt | cut -c 3-
# 34567890
# 45678901
# 56789012
# 67890123
# 78901234
# 89012345
# 90123456
# 01234567
# 12345678
# 23456789
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://man.linuxde.net/cut
https://www.runoob.com/linux/linux-comm-cut.html
https://www.tutorialspoint.com/unix_commands/cut.htm
```