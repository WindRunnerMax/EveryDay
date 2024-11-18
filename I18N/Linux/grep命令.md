# Grep Command
The `grep` command is used to search for strings in files that match a certain condition. If the content of a file matches the specified pattern, the `grep` command will display the line containing that pattern. If no file name is specified or if the given file name is `-`, the `grep` command will read data from the standard input device.

## Syntax

```shell
grep [OPTION]... PATTERN [FILE]...
```

## Parameters
* `-A NUM, --after-context=NUM`: Print `NUM` lines of trailing context after matching lines. Places a line containing `--` between contiguous groups of matches.
* `-a, --text`: Treat binary files as text files, equivalent to the `--binary files=text` option.
* `-B NUM, --before-context=NUM`: Print `NUM` lines of leading context before matching lines. Places a line containing `--` between contiguous groups of matches.
* `-C NUM, --context=NUM`: Print `NUM` lines of output context. Places a line containing `--` between contiguous groups of matches.
* `-b, --byte-offset`: Print the byte offset within the input file before each line of output.
* `--binary-files=TYPE`: If the first few bytes of a file indicate that the file contains binary data, presume the file to be of type `TYPE`. By default, `TYPE` is `binary`, and `grep` normally outputs a line containing the file name when it finds binary files. If `TYPE` is `text`, `grep` will process binary files as if they were text. Addtionally, using `grep --binary files=text` may output binary garbage if the output is a terminal and if some of the garbage is interpretable as commands by the terminal's command interpreter, this could have severe consequences.
* `--colour[=WHEN], --color[=WHEN]`: Surround the matching string with markers as specified in the `GREP_COLOR` environment variable. `WHEN` can be `never`, `always`, or `auto`.
* `-c, --count`: Suppress normal output, instead print a count of matching lines for each input file. When used with the `-v, --invert-match` option, count non-matching lines.
* `-D ACTION, --devices=ACTION`: If input files are devices, FIFOs, or sockets, use `ACTION` to process them. By default, `ACTION` is `read`, meaning devices are read just as if they were ordinary files. If `ACTION` is `skip`, devices are silently skipped.
* `-d ACTION, --directories=ACTION`: If an input file is a directory, use `ACTION` to process it. By default, `ACTION` is `read`, meaning directories are read just as if they were ordinary files. If `ACTION` is `skip`, directories are silently skipped. If `ACTION` is `recurse`, `grep` reads all files under each directory, equivalent to the `-r` option.
* ` -E, --extended-regexp`: Interpret pattern as an extended regular expression.
* `-e PATTERN, --regexp=PATTERN`: Use `PATTERN` as the pattern. Protects patterns that begin with `-`.
* `-F, --fixed-strings`: Interpret `PATTERN` as a list of fixed strings, separated by newlines. These strings can match.
* `-P, --perl-regexp`: Interpret the pattern as a Perl regular expression.
* `-f FILE, --file=FILE`: Obtain patterns from `FILE`, one per line. An empty file contains zero patterns, thus does not match.
* `-G, --basic-regexp`: Interpret `PATTERN` as a basic regular expression, which is the default.
* `-H, --with-filename`: Print the file name for each match.
* `-h, --no-filename`: Suppress the prefixing of file names on output when searching multiple files.
* `--help`: Output the help file.
* `-I`: Process a binary file as if it does not contain matching data, equivalent to the `--binary-files=without-match` option.
* `-i, --ignore-case`: Ignore case distinctions in both `PATTERN` and the input files.
* `-L, --files-without-match`: Suppress normal output, instead print the name of each input file from which no output would normally have been printed. Scan stops on the first match.
* `-l, --files-with-matches`: Suppress normal output, instead print the name of each input file from which output would normally have been printed. Scan stops on the first match.
* `-m NUM, --max-count=NUM`: Stop reading a file after `NUM` matching lines. If the input is standard input from a regular file, and `NUM` matching lines are output, `grep` guarantees that standard input is positioned to just after the last matching line before exiting, regardless of the presence of more context lines. This enables calling processes to continue (resume) the search, and when `grep` stops after `NUM` matching lines, it outputs any remaining context lines. The `-c` or `--count` option also is in use, `grep` will not output counts greater than `NUM`. When the `-v` or `--invert match` option is also used, `grep` will stop after outputting `NUM` non-matching lines.
* `--mmap`: Use the `mmap` system call if possible to read input, instead of the default read system call. In some cases, `--mmap` can lead to better performance. However, if the input file shrinks while `grep` is operating, or if an I/O error occurs, `--mmap` can lead to undefined behavior (including core dumps).
* `-n, --line-number`: Prefix each line of output with the 1-based line number within the input file.
* `-o, --only-matching`: Show only the part of a matching line that matches the pattern.
* `--label=LABEL`: Display actual input coming from standard input as coming from input file `LABEL`. This is especially useful for tools like `zgrep`, for example, `gzip -cd foo.gz | grep -H --label=foo`.
* `--line-buffered`: Use line buffering, may lead to performance loss.
* `-q, --quiet, --silent`: Quiet mode, do not write anything to standard output. Exits immediately with a status of zero if any match is found, even if an error is detected.
* `-R, -r, --recursive`: Read all files under each directory recursively, equivalent to the `-d recurse` option.
* `-s, --no-messages`: Suppress error messages about nonexistent or unreadable files.
* `-U, --binary`: Treats the file as a binary file. By default, on MS-DOS and MS Windows platforms, `grep` guesses the file type by looking at the first `32KB` of the file. If `grep` determines the file to be a text file, it will strip any `CR` characters from the original file content (to make regular expressions with `^` and `$` work normally). Specifying `-U` overrides this guessing, causing all files to be read and passed to the matching mechanism byte-by-byte. This can cause some regular expressions to fail if the file is a text file with `CR/LF` pairs at the end of every line. This option has no effect on platforms other than MS-DOS and MS Windows.
* `-u, --unix-byte-offsets`: Report Unix-style byte offsets. This switch makes `grep` report byte offsets as if the file were a Unix-style text file, which means without the `CR` characters. This produces the same results as running `grep` on a Unix machine, unless the `-b` option is also in use, in which case the option is ignored. It has no effect on platforms other than MS-DOS and MS-Windows.
* `-V, --version`: Output version information.
* `-v, --invert-match`: Invert the sense of matching, to select non-matching lines.
* `-w, --word-regexp`: Select only those lines containing matches that form whole words. The test is that the matching substring must either be at the beginning of the line, or preceded by a non-word constituent character. Similarly, it must be either at the end of the line or followed by a non-word constituent character. Word-constituent characters are letters, digits, and the underscore.
* `-x, --line-regexp`: Select only those matches that exactly match the whole line.
* `-Z, --null`: Output a zero byte (`ASCII NULL` character), rather than the character that normally follows a file name. For example, `grep -lZ` outputs a zero byte after each file name, instead of the usual newline character. This option can make the output unambiguous even in the presence of file names containing unusual characters, such as newline characters. This option can be used with commands like `find -print0`, `perl -0`, `sort -z`, and `xargs -0` to process arbitrary file names, even those containing newline characters.

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

Matching lines containing `Hello`.

```shell
grep Hello hello.c
#    printf("Hello World\n");
#    printf("Hello World\n");
#    printf("Hello World\n");
```

Matching the number of lines containing `Hello`.

```shell
grep -c Hello hello.c
# 3
```

Invert the meaning of the match, selecting lines that do not match `Hello`.

```shell
grep -v Hello hello.c
# #include <stdio.h>
# #include <stdlib.h>
#
# int main() {
#    return 0;
# }
```

Matching lines containing `i` and ignoring case.

```shell
grep -i I hello.c
# #include <stdio.h>
# #include <stdlib.h>
# int main() {
#    printf("Hello World\n");
#    printf("Hello World\n");
#    printf("Hello World\n");
```

Only output lines that match the entire line of the file.

```shell
grep -x "   return 0;" hello.c
#    return 0;
```

Matching lines containing `Hello` and displaying line numbers.

```shell
grep -n Hello hello.c
# 5:   printf("Hello World\n");
# 6:   printf("Hello World\n");
# 7:   printf("Hello World\n");
```

Recursively match all files in the current directory that can match `h*`, output line numbers, and ignore case. Note that the actual successful matches in the terminal will be marked in red.

```shell
grep -rni "h*" ./
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
https://www.runoob.com/linux/linux-comm-grep.html
https://www.tutorialspoint.com/unix_commands/grep.htm
https://www.geeksforgeeks.org/fold-command-in-linux-with-examples/
```