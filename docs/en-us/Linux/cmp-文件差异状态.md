
# The `cmp` command
The `cmp` command is used to compare whether there are differences between two files. When the two files being compared are exactly the same, this command will not output any information. If differences are found, it will indicate the first differing character and column number by default. If no file name is specified or the given file name is `-`, the `cmp` command will read data from the standard input device.

## Syntax
```shell
cmp [-clsv][-i <number of characters>][--help][file][file]
```

## Options
* `-c` or `--print-chars`: In addition to indicating the decimal code of the differing character, it also displays the corresponding character.
* `-i <number of characters>` or `--ignore-initial=<number of characters>`: Specify the number of characters to skip.
* `-l` or `--verbose`: Indicate all the differing places.
* `-s` or `--quiet` or `--silent`: Do not show error messages.
* `-v` or `--version`: Display version information.
* `--help`: Online help.

## Examples
Compare the differences between the `file.txt` and `file2.txt` files. If the files are the same, no message will be displayed; if they are different, the position of the first difference will be shown.

```shell
cmp file.txt file2.txt
```

Compare the differences between the `file.txt` and `file2.txt` files and list all the differing places.

```shell
cmp -l file.txt file2.txt
```

Compare the differences between the `file.txt` and custom input content. Enter the content and press `Ctrl+D` to output the `EOF` indicator and end the input.

```shell
cmp file.txt -
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference
```
https://man.linuxde.net/cmp
https://www.jianshu.com/p/f5963af8d796
https://www.runoob.com/linux/linux-comm-cmp.html
```