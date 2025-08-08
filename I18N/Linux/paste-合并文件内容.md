# The `paste` command

The `paste` command merges each file by columns in a column-by-column manner.

## Syntax

```shell
paste [OPTION]... [FILE]...
```

## Options
* `-d, --delimiters=[LIST]`: Replace `TAB` characters with the specified delimiter characters.
* `-s, --serial`: Paste one file at a time instead of in parallel.
* `-z, --zero-terminated`: The line delimiter is `NUL` instead of newline.
* `--help`: Display this help and exit.
* `--version`: Output version information and exit.

## Examples
Merge the `/tmp/file1.txt` and `/tmp/file2.txt` files by columns.

```shell
paste /tmp/file1.txt /tmp/file2.txt
```

Merge the `/tmp/file1.txt` and `/tmp/file2.txt` files by columns and append to `/tmp/file3.txt`.

```shell
paste /tmp/file1.txt /tmp/file2.txt >> /tmp/file3.txt
```

Merge the `/tmp/file1.txt` and `/tmp/file2.txt` files by columns and specify the delimiter as `-`.

```shell
paste -d - /tmp/file1.txt /tmp/file2.txt
```

## Daily Puzzle

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.howtoforge.com/linux-paste-command/
https://www.runoob.com/linux/linux-comm-paste.html
https://www.tutorialspoint.com/unix_commands/paste.htm
```