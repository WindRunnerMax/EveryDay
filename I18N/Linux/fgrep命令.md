# `fgrep` Command
When you need to search for strings that contain many regular expression metacharacters, such as `$` and `^`, `fgrep` is very useful. By specifying that the search string contains fixed characters, you don't need to escape each character with a backslash. If the search string contains a newline character, each line will be treated as a single fixed character string to be matched in the search. In other words, `fgrep` is used to search for fixed characters. Fixed characters mean that the string is interpreted literally - metacharacters do not exist, so regular expressions cannot be used. Running `fgrep` has the same effect as running `grep` using the `-F` option.

## Syntax

```shell
fgrep [-b] [-c] [-h] [-i] [-l] [-n] [-s] [-v] [-x] [ -e pattern_list] [-f pattern-file] [pattern] [file]
```

## Parameters
* `-b`: Precede each line with the block number it was found in. This is very useful for locating block numbers based on context (the first block is `0`).
* `-c`: Only print the number of lines that contain the pattern.
* `-h`: Suppress the printing of filenames when searching in multiple files.
* `-i`: Ignore the case when comparing.
* `-l`: Print the name of each file once, separated by a newline, that has one or more matching lines. When a pattern appears multiple times, the file name will not be repeated.
* `-n`: Precede each line within its file with the line number (the first line is `1`).
* `-s`: Work silently, only displaying error messages, which is very useful for checking error status.
* `-v`: Print only lines that do not contain the pattern.
* `-x`: Print only lines that match the entire line.
* `-e pattern_list`: Search for the strings in the `pattern list`, which is useful when the string starts with `-`.
* `-f pattern-file`: Obtain the pattern list from the file.
* `pattern`: Specify the pattern to be used during the search input.
* `file`: The pathname of the file to search for patterns. If no file parameter is specified, standard input will be used.

## Examples

The content of the `hello.c` file is as follows:

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
   printf("Hello World\n");
   printf("Hello World\n");
   printf("Hello World\n");
   return 0;
}
```

Match lines containing `Hello`.

```shell
fgrep Hello hello.c
#    printf("Hello World\n");
#    printf("Hello World\n");
#    printf("Hello World\n");
```

Match the number of lines containing `Hello`.

```shell
fgrep -c Hello hello.c
# 3
```

Reverse the meaning of the match and select lines that do not match `Hello`.

```shell
fgrep -v Hello hello.c
# #include <stdio.h>
# #include <stdlib.h>
#
# int main() {
#    return 0;
# }
```

Match lines containing `i` and ignore case.

```shell
fgrep -i I hello.c
# #include <stdio.h>
# #include <stdlib.h>
# int main() {
#    printf("Hello World\n");
#    printf("Hello World\n");
#    printf("Hello World\n");
```

Output only the lines that match the entire line of the file.

```shell
fgrep -x "   return 0;" hello.c
#    return 0;
```

Match lines containing `Hello` and output the line number.

```shell
fgrep -n Hello hello.c
# 5:   printf("Hello World\n");
# 6:   printf("Hello World\n");
# 7:   printf("Hello World\n");
```

Recursively match files in the current directory that match `h*`. Please note that because `fgrep` is used, the command will not interpret `*` as a wildcard but will treat it as a fixed character `*`, so there will be no matches. If you use `grep` with the same parameters, it will output the line numbers and ignore case. Note that the successful matches in the actual terminal will be highlighted in red.

```shell
fgrep -rni "h*" ./
# [Empty output]
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/ufgrep.htm
https://www.runoob.com/linux/linux-comm-fgrep.html
https://www.geeksforgeeks.org/fgrep-command-in-linux-with-examples/
```