# `od` command
The `od` command reads the contents of the specified file and presents its contents as octal byte code.

## Syntax

```shell
od [OPTION]... [FILE]...
od [-abcdfilosx]... [FILE] [[+]OFFSET[.][b]]
od --traditional [OPTION]... [FILE] [[+]OFFSET[.][b] [+][LABEL][.][b]]
```

## Parameters
* `-A, --address-radix=RADIX`: Choose the radix for calculating byte addresses.
* `-j, --skip-bytes=BYTES`: Skip the specified number of bytes.
* `-N, --read-bytes=BYTES`: Read up to the specified number of bytes.
* `-S BYTES, --strings[=BYTES]`: Print strings of at least `BYTES` graphical characters; default is `3` when `BYTES` is not specified.
* `-t, --format=TYPE`: Use the specified output format.
* `-v, --output-duplicates`: Do not omit duplicate data when printing.
* `-w[BYTES], --width[=BYTES]`: Output up to `BYTES` bytes per line.
* `--help`: Display this help and exit.
* `--version`: Output version information and exit.

## Format controls
* `-a`: same as `-t a`, select named characters.
* `-b`: same as `-t o1`, select octal bytes.
* `-c`: same as `-t c`, select ASCII characters or backslash escapes.
* `-d`: same as `-t u2`, select unsigned decimal `2` bytes.
* `-f`: same as `-t fF`, select floating-point numbers.
* `-i`: same as `-t dI`, select decimal integers.
* `-l`: same as `-t dL`, select decimal long.
* `-o`: same as `-t o2`, select octal `2` bytes.
* `-s`: same as `-t d2`, select decimal `2` bytes.
* `-x`: same as `-t x2`, select hexadecimal `2` bytes.
* `d[SIZE]`: signed decimal, each integer `SIZE` bytes wide.
* `f[SIZE]`: floating point, each integer `SIZE` bytes wide.
* `o[SIZE]`: octal, each integer `SIZE` bytes wide.
* `u[SIZE]`: unsigned decimal, each integer `SIZE` bytes wide.
* `x[SIZE]`: hexadecimal, each integer `SIZE` bytes wide.

## Examples

Output the octal byte code of a file.

```shell
od /tmp/file.txt
```

Output using single-byte octal interpretation, with the default address format of eight bytes on the left.

```shell
od -c /tmp/file.txt
```

Output using ASCII code, including escape characters, with the default address format of eight bytes on the left.

```
od -t d1 /tmp/file.txt
```

## Question of the Day

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.howtoforge.com/linux-od-command/
https://www.runoob.com/linux/linux-comm-od.html
https://www.tutorialspoint.com/unix_commands/od.htm
```