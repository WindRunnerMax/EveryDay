# csplit Command
The `csplit` command splits the `FILE` file, separated with the `PATTERN`, and outputs the results to files `xx00`, `xx01`, and so on. It also outputs the byte counts of each file to the standard output.

## Syntax

```shell
csplit [OPTION]... FILE PATTERN...
```

## Parameters
* `-b, --suffix-format=FORMAT`: Use the `sprintf FORMAT` format instead of `%02d`.
* `-f, --prefix=PREFIX`: Use `PREFIX` as a substitute for `xx`.
* `-k, --keep-files`: Do not delete the output files in case of errors.
* `-m, --suppress-matched`: Suppress the lines matching `PATTERN`.
* `-n, --digits=DIGITS`: Use the specified number of digits instead of `2`.
* `-s, --quiet, --silent`: Do not print the count of output file sizes.
* `-z, --elide-empty-files`: Remove empty output files.
* `--help`: Output help information.
* `--version`: Output version information.

## Patterns
If the file is specified as a hyphen `-`, `csplit` will read from the standard input. Each pattern can be:
* `INTEGER`: Copy up to the specified line number, but not including the specified line number.
* `/REGEXP/[OFFSET]`: Copy up to but not including the matching line.
* `%REGEXP%[OFFSET]`: Skip to but not including the matching line.
* `{INTEGER}`: Repeat the specified number of times of the previous pattern.
* `{*}`: Repeat the previous pattern as many times as possible.

## Examples
The file `list.txt` contains the following content:
```
1. Apples
2. Bananas
3. Oranges
4. Pineapples
5. Guava
```

Using the `csplit` command to split this file into two parts, with the second part starting from the third line.
```shell
csplit list.txt 3
# 21
# 34

cat xx00
# 1. Apples
# 2. Bananas

cat xx01
# 3. Oranges
# 4. Pineapples
# 5. Guava
```

Using the `csplit` command to split this file into three parts.
```shell
csplit list.txt 2 3
# 21
# 34

cat xx00
# 1. Apples

cat xx01
# 2. Bananas

cat xx02
# 3. Oranges
# 4. Pineapples
# 5. Guava
```

Using a custom split prefix `aa` instead of the default `xx` split prefix.
```shell
csplit list.txt -f aa 3
# 21
# 34

ls
# aa00  aa01 list.txt
```

Using three digits instead of the default two digits.
```shell
csplit list.txt -n 3 3
# 21
# 34

ls
# list.txt  xx000  xx001
```

Using a pattern to define the split rule and repeat the specified number of times of the previous pattern.
```shell
csplit list.txt 2 {1}
# 10
# 22
# 23

ls xx*
# xx00  xx01  xx02
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## Reference
```
https://www.computerhope.com/unix/ucsplit.htm
https://www.runoob.com/linux/linux-comm-csplit.html
https://www.geeksforgeeks.org/csplit-command-in-linux-with-examples/
```