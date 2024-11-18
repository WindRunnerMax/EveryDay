
# Sort Command
The `sort` command is used to sort the contents of a text file, it can sort the content of a text file on a line-by-line basis.

## Syntax

```shell
sort [OPTION]... [FILE]...
sort [OPTION]... --files0-from=F
```

## Parameters
* `-b, --ignore-leading-blanks`: Ignore leading spaces.
* `-d, --dictionary-order`: Consider only blanks and alphanumeric characters.
* `-f, --ignore-case`: Convert lowercase characters to uppercase.
* `-g, --general-numeric-sort`: Compare according to general numerical value.
* `-i, --ignore-nonprinting`: Consider only printable characters.
* `-M, --month-sort`: Compare `JAN < ... < DEC`.
* `-h, --human-numeric-sort`: Compare human-readable numbers, e.g. `2K`, `1G`.
* `-n, --numeric-sort`: Compare according to string numerical value.
* `-R, --random-sort`: Shuffle, but group identical keys.
* `--random-source=FILE`: Get random bytes from `FILE`.
* `-r, --reverse`: Reverse the result of comparisons.
* `--sort=WORD`: Sort according to `WORD`: general-numeric`-g`, human-numeric`-h`, month`-M`, numeric`-n`, random`-R`, version`-V`.
* `--batch-size=NMERGE`: Merge at most `NMERGE` inputs at once; for more use temp files.
* `-c, --check, --check=diagnose-first`: Check for sorted input; do not sort.
* `-C, --check=quiet, --check=silent`: Like `-c`, but do not report first bad line.
* `--compress-program=PROG`: Use `PROG` to compress temporary files.
* `--debug`: Annotate the part of the line used to sort, and warn about questionable usage to `stderr`.
* `--files0-from=F`: Read input from the files named in file `F`, and treat each name as a separate line. If `F` is `-` then read names from standard input.
* `-k, --key=POS1[,POS2]`: Start a key at `POS1` (origin 1), end it at `POS2` (default end of line).
* `-m, --merge`: Merge already sorted files; do not sort.
* `-o, --output=FILE`: Write result to `FILE` instead of standard output.
* `-s, --stable`: Stabilize sort by disabling last-resort comparison.
* `-t, --field-separator=SEP`: Use SEP instead of non-blank to blank transition.
* `-T, --temporary-directory=DIR`: Use `DIR` for temporary files, not `$TMPDIR` or `/tmp`; multiple options specify multiple directories.
* `--parallel=N`: Change the number of sorts run concurrently to `N`.
* `-u, --unique`: Output only the first of an equal run.
* `-z, --zero-terminated`: Line delimiter is NUL, not newline.
* `--help`: Display this help and exit.
* `--version`: Output version information and exit.


## Examples

The contents of the `file.txt`, `file1.txt`, and `file2.txt` files are as follows.

```
# file.txt
abhishek
chitransh
satish
rajan
naveen
divyam
harsh

# file1.txt
50
39
15
89
200

# file2.txt
abc
apple
BALL
Abc
bat
bat
```

To sort the contents of the `file.txt` file and save it, use output redirection.

```shell
sort file.txt
# abhishek
# chitransh
# divyam
# harsh
# naveen
# rajan
# satish

sort file2.txt
# abc
# Abc
# apple
# BALL
# bat
# bat
```

You can use the `-r` flag to perform reverse sorting.

```shell
sort -r file.txt
# satish
# rajan
# naveen
# harsh
# divyam
# chitransh
# abhishek
```

Use the `-n` flag to sort numbers, otherwise dictionary order will be used.

```shell
sort -n file1.txt
# 15
# 39
# 50
# 89
# 200

sort file1.txt
# 15
# 200
# 39
# 50
# 89
```

To sort a file with reverse numeric data, we can use the combination of the `-nr` options below.

```shell
sort -nr file1.txt
# 200
# 89
# 50
# 39
# 15
```

Use `-u` to sort and remove duplicate items.

```shell
sort -u file2.txt
# abc
# Abc
# apple
# BALL
# bat
```

Translate into English:



Use `-c` to check if the file has been sorted in order.

```shell
sort -c file2.txt
# sort: file2.txt:4: disorder: Abc
```


## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/usort.htm
https://www.runoob.com/linux/linux-comm-sort.html
https://www.geeksforgeeks.org/sort-command-linuxunix-examples/
```