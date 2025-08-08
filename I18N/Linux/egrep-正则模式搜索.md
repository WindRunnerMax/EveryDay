# egrep command
The `egrep` command is used for pattern searching and belongs to the `grep` function family. It works the same as `grep -E`, treating the pattern as an extended regular expression and printing the lines that match the pattern. If multiple files have matching patterns, it can also display the file names for each line.

## Syntax

```shell
egrep [options] PATTERN [FILE...]
```

## Parameters
* `-A NUM, --after-context=NUM`: Print `NUM` lines of trailing context after matching lines. Place a line containing `--` between contiguous groups of matches.
* `-a, --text`: Treat binary files as text. This is equivalent to the option `--binary files=text`.
* `-B NUM, --before-context=NUM`: Print `NUM` lines of leading context before matching lines. Place a line containing `--` between contiguous groups of matches.
* `-C NUM, --context=NUM`: Print `NUM` lines of output context. Place a line containing `--` between contiguous groups of matches.
* `-b, --byte-offset`: Print the byte offset before each line of output in the input file.
* `--binary-files=TYPE`: If the first few bytes of a file indicate that the file contains binary data, assume the file is of type `TYPE`. By default, `TYPE` is `binary`, meaning `grep` normally outputs a message saying a binary file matches, or does not output anything (if it does not match). If `TYPE` does not match, `grep` assumes the file does not match as well, which is equivalent to the `-I` option. If `TYPE` is `text`, `grep` will treat binary files as text, which is equivalent to the `-a` option. Additionally, `grep --binary files=text` may output binary garbage if the output is a terminal and the terminal driver interprets some of it as commands, producing potential side effects.
* `--colour[=WHEN], --color[=WHEN]`: Surround the matching string with markers as specified in the `GREP_COLOR` environment variable. `WHEN` can be `never`, `always`, or `auto`.
* `-c, --count`: Suppress normal output, instead print a count of matching lines for each input file. When used with the `-v, --invert match` option, count non-matching lines.
* `-D ACTION, --devices=ACTION`: How to handle devices, FIFOs, or sockets if the input file is such a type. By default, `ACTION` is `read`, which means reading from devices is as if they were regular files. If `ACTION` is `skip`, devices are automatically skipped.
* `-d ACTION, --directories=ACTION`: How to handle directories if the input file is a directory. By default, `ACTION` is `read`, meaning reading from directories is as if they were regular files. If `ACTION` is `skip`, directories are automatically skipped. If `ACTION` is `recurse`, `grep` will read all files under each directory recursively, equivalent to the `-r` option.
* `-e PATTERN, --regexp=PATTERN`: Use `PATTERN` as the pattern. Use this option to protect patterns beginning with `-`.
* `-F, --fixed-strings`: Interpret `PATTERN` as a list of fixed strings, separated by newlines, any of which can match.
* `-P, --perl-regexp`: Interpret `PATTERN` as a Perl-compatible regular expression.
* `-f FILE, --file=FILE`: Obtain patterns from `FILE`, one per line. An empty file contains zero patterns, so it does not match anything.
* `-G, --basic-regexp`: Interpret `PATTERN` as a basic regular expression, which is the default.
* `-H, --with-filename`: Print the file name for each match.
* `-h, --no-filename`: Suppress the prefixing of file names on output when searching multiple files.
* `--help`: Display a help message.
* `-I`: Treat binary files as if they do not match. This is equivalent to the `--binary-files=without-match` option.
* `-i, --ignore-case`: Ignore case distinctions in both `PATTERN` and the input files.
* `-L, --files-without-match`: Suppress normal output, instead print the name of each input file from which no output would normally have been printed. Scanning will stop on the first match.
* `-l, --files-with-matches`: Suppress normal output, instead print the name of each input file from which output would normally have been printed. Scanning will stop on the first match.
* `-m NUM, --max-count=NUM`: Stop reading a file after `NUM` matching lines. If the input is standard input from a regular file and `NUM` matching lines are output, `grep` ensures that the standard input is positioned before the last matching line before exiting, regardless of any following context lines. This allows the calling process to continue (resume) the search. When `grep` stops after `NUM` matching lines, it outputs any trailing context lines. When the `-c` or `--count` option is also used, `grep` will not output counts greater than `NUM`. When the `-v` or `--invert match` option is also used, `grep` stops after outputting `NUM` non-matching lines.
* `--mmap`: Use the `mmap` system call to read input if possible, instead of the default read system call. In some cases, `--mmap` can provide better performance. However, if the input file shrinks during `grep` operation, or an I/O error occurs, `--mmap` may result in undefined behavior, including core dumps.
* `-n, --line-number`: Prefix each line of output with the line number in the input file.
* `-o, --only-matching`: Only show the part of a matching line that matches the pattern.
* `--label=LABEL`: Display the actual input coming from standard input as input from file `LABEL`. This is particularly useful for tools like `zgrep`, for example `gzip -cd foo.gz | grep -H --label=foo`.
* `--line-buffered`: Use line buffering, which may cause performance loss.
* `-q, --quiet, --silent`: Quiet mode. Do not write anything to standard output. If any matches are found, exit immediately, even if an error is detected, with a zero status.
* `-R, -r, --recursive`: Read all files under each directory recursively. This is equivalent to the `-d recurse` option.
* `-s, --no-messages`: Suppress error messages about nonexistent or unreadable files.
* `-U, --binary`: Treat files as binary. By default, on MS-DOS and MS Windows, `grep` guesses the file type by looking at the first 32KB of content read from the file. If `grep` determines the file is a text file, it removes `CR` characters from the original file content to make regular expressions with `^` and `$` work as expected. Providing `-U` overrides this guessing, causing all files to be read and passed byte by byte to the matching mechanism, which will cause certain regular expressions to fail if the file is a text file and has `CR/LF` pairs at the end of each line. This option is invalid on platforms other than MS-DOS and MS Windows.
* `-u, --unix-byte-offsets`: Report `Unix`-style byte offsets. This option makes `grep` report byte offsets as if the file were a `Unix`-style text file, i.e., with `CR` characters removed. It produces the same results as running `grep` on a `Unix` machine, unless the `-b` option is also used, in which case the option is invalid. It has no effect on platforms other than MS-DOS and MS Windows.
* `-V, --version`: Output version information.
* `-v, --invert-match`: Invert the sense of matching, to select non-matching lines.
* `-w, --word-regexp`: Select only those lines containing matches that form whole words. The test is that the matching substring must either be at the beginning of the line or preceded by a non-word constituent character. Similarly, it must be either at the end of the line or followed by a non-word constituent character. Word-constituent characters are letters, digits, and the underscore.
* `-x, --line-regexp`: Select only those matches that exactly match the whole line.
* `-Z, --null`: Output a zero byte (the ASCII NULL character) instead of the character that normally follows a file name. For example, `grep -lZ` outputs a zero byte after each file name instead of the usual newline. This option can make the output unambiguous, even in the presence of uncommon characters such as newlines in file names. This option can be used with commands like `find -print0`, `perl -0`, `sort -z`, and `xargs -0` to handle arbitrary file names, even file names containing newlines.

## Example

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
egrep Hello hello.c
#    printf("Hello World\n");
#    printf("Hello World\n");
#    printf("Hello World\n");
```

Match the number of lines containing `Hello`.

```shell
egrep -c Hello hello.c
# 3
```

Reverse the meaning of the match, select lines that do not contain `Hello`.

```shell
egrep -v Hello hello.c
# #include <stdio.h>
# #include <stdlib.h>
#
# int main() {
#    return 0;
# }
```

Match lines containing `i` and ignore case.

```shell
egrep -i I hello.c
# #include <stdio.h>
# #include <stdlib.h>
# int main() {
#    printf("Hello World\n");
#    printf("Hello World\n");
#    printf("Hello World\n");
```

Only output lines that match the entire line of the file.

```shell
egrep -x "   return 0;" hello.c
#    return 0;
```

Match lines containing `Hello` and output the line number.

```shell
egrep -n Hello hello.c
# 5:   printf("Hello World\n");
# 6:   printf("Hello World\n");
# 7:   printf("Hello World\n");
```

Recursively match files in the current directory that match `h*`, output the line number and ignore case, note that the actual successful matches in the terminal will be indicated in red.

```shell
egrep -rni "h*" ./
# ./hello.c:1:#include <stdio.h>
# ./hello.c:2:#include <stdlib.h>
# ./hello.c:3:
# ./hello.c:4:int main() {
# ./hello.c:5:   printf("Hello World\n");
# ./hello.c:6:   printf("Hello World\n");
# ./hello.c:7:   printf("Hello World\n");
# ./hello.c:8:   return 0;
# ./hello.c:9:}
```


## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://www.computerhope.com/unix/uegrep.htm
https://www.runoob.com/linux/linux-comm-egrep.html
https://www.geeksforgeeks.org/egrep-command-in-linux-with-examples/
```