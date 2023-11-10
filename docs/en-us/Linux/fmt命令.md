```markdown
# fmt command

The `fmt` command is used to format text files. It reads the content from a specified file, reorganizes it according to the specified format, and outputs it to the standard output device. If the specified file name is `-`, the `fmt` command will read data from the standard input device.

## Syntax
```
fmt [-WIDTH] [OPTION]... [FILE]...
```

## Parameters
* `-c, --crown-margin`: Retains indentation of the first two lines.
* `-p, --prefix=STRING`: Only reformats the lines starting with `STRING` and reattaches the prefix to the reformatted lines.
* `-s, --split-only`: Splits long lines without reflowing them.
* `-t, --tagged-paragraph`: Indents the first line differently from the second line.
* `-u, --uniform-spacing`: One space between words, two spaces after sentences.
* `-w, --width=WIDTH`: Maximum line width (default to `75` columns).
* `-g, --goal=WIDTH`: Target width (default to `93%` of width).
* `--help`: Output help information.
* `--version`: Output version information.

## Examples

By default, `fmt` formats all the words in the given file into a single line, with a default maximum width of `75`.

```shell
cat file.txt
# Hello
# everyone.
# Have
# a
# nice 
# day.

fmt file.txt
# Hello everyone.  Have a nice day.
```

Format the file and use the `-w` option to specify the maximum line width, breaking the words to a new line if they exceed the specified length.

```shell
cat file.txt
# Hello
# everyone.
# Have
# a
# nice 
# day.

fmt -w 10 file.txt
# Hello
# everyone.
# Have a
# nice day.
```

The `-s` option splits long lines but does not reflow them.

```
cat file.txt
# Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It is not rude, it is not self-seeking, it is not easily angered,  it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres. Love never fails.

fmt -s file.txt
# Love is patient, love is kind. It does not envy, it does not boast, it
# is not proud. It is not rude, it is not self-seeking, it is not easily
# angered,  it keeps no record of wrongs. Love does not delight in evil
# but rejoices with the truth. It always protects, always trusts, always
# hopes, always perseveres. Love never fails.
```

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/ufmt.htm
https://www.runoob.com/linux/linux-comm-fmt.html
https://www.geeksforgeeks.org/fmt-command-unixlinux/
```
```