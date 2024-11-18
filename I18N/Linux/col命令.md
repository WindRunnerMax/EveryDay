# col command

In many UNIX documentation files, there are `RLF` control characters. When we output the contents of the documentation file to a plain text file, the control characters become garbled. The `col` command effectively filters out these control characters.

## Syntax

```shell
col [options]
```

## Arguments

* `-b, --no-backspaces`: Filter out all control characters, including `RLF` and `HRLF`.
* `-f, --fine`: Allow half-line breaks, usually characters printed at the half-line boundary will be printed on the next line, filters out `RLF` characters, but allows `HRLF` characters to be displayed.
* `-p, --pass`: Pass through unknown control sequences, usually `col` filters out any control sequences from the input other than those it recognizes and interprets itself.
* `-h, --tabs`: Convert spaces to tabs, this is the default setting.
* `-x, --spaces`: Convert tabs to spaces.
* `-l, --lines NUM`: Buffer at least `num` lines in memory, by default buffers `128` lines.
* `-V, --version`: Output version information.
* `-H, --help`: Output help information.

## Examples

Filter out reverse line feed `RLF` from the help documentation of `col` and save it to `col.txt`.

```shell
col --help | col > col.txt
```

Filter out control characters from the help documentation of `col` and save it to `col.txt`.

```shell
col --help | col -b > col.txt
```

Convert tabs to spaces in the help documentation of `col` and save it to `col.txt`.

```shell
col --help | col -x > col.txt
```


## Daily question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.computerhope.com/unix/ucol.htm
https://www.runoob.com/linux/linux-comm-col.html
https://www.geeksforgeeks.org/col-command-in-linux-with-examples/
```