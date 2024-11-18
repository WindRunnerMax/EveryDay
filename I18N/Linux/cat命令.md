
# Command `cat`

The `cat` command belongs to file management, used to connect files and print them to the standard output device. `cat` is often used to display the contents of a file. However, when the file is large, the text quickly flashes on the screen causing scrolling. At this time, it's often difficult to see the displayed content. To control scrolling, you can press `Ctrl+S` to stop scrolling and `Ctrl+Q` to resume scrolling. Additionally, you can use commands like `more` to read and display files page by page.

## Syntax

```shell
cat [-AbeEnstTuv] [--help] [--version] fileName
```

## Parameters
* `-n` or `--number`: Number all output lines, starting from `1`.
* `-b` or `--number-nonblank`: Similar to `-n`, but do not number the blank lines.
* `-s` or `--squeeze-blank`: Replace multiple consecutive blank lines with a single blank line.
* `-v` or `--show-nonprinting`: Display control characters like `^` and `M-`, except for `LFD` and `TAB`.
* `-E` or `--show-ends`: Display a `$` at the end of each line.
* `-T` or `--show-tabs`: Display `TAB` characters as `^I`.
* `-A` or `--show-all`: Equivalent to `-vET`.
* `-e`: Equivalent to `-vE` option.
* `-t`: Equivalent to `-vT` option.

## Examples
Use the `cat` command to create a file, enter the file information, and then press `Ctrl+D` to output the `EOF` symbol and end the input.

```shell
cat > file.txt
```

Display the contents of the `file.txt` file.

```shell
cat file.txt
```

Simultaneously display the contents of the `file.txt` and `file2.txt` files.

```shell
cat file.txt file2.txt
```

Append the content of the `file.txt` file with line numbers to the `file2.txt` file.

```shell
cat -n file.txt >> file2.txt
```

Empty the `file2.txt` file. `/dev/null` is called a null device and is a special device file that discards all data written to it but reports the write operation as successful. Reading from it will immediately return an `EOF`.

```shell
cat /dev/null > file2.txt
```

Merge the content of the `file.txt` and `file2.txt` files and output them to `file3.txt`.

```shell
cat file.txt file2.txt > file3.txt
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://man.linuxde.net/cat
https://www.runoob.com/linux/linux-comm-cat.html
https://www.cnblogs.com/zhangchenliang/p/7717602.html
```