
# The `read` Command
The `read` command is used to read a single line of data from standard input. This command can be used to read input from the keyboard, and when used with redirection and default options, it can read a line of data from a file. In this case, `read` will consider the newline character as the line ending, but this can be changed using the `-d` option.

## Syntax

```shell
read [-ers] [-a array] [-d delim] [-i text] [-n nchars] [-N nchars] [-p prompt] [-t timeout] [-u fd] [name ...] [name2 ...]
```

## Parameters
- `-a array`: Store words in an indexed array named `array`, with array elements numbered starting at `0`.
- `-d delim`: Set the delimiter to `delim`, which represents the line ending character. If not used, the default line delimiter is the newline character.
- `-e`: Get a line of input from the shell, allowing the user to manually input characters until the line delimiter is reached.
- `-i text`: When used with `-e` and only without `-s`, the text is inserted as the initial text of the input line, allowing the user to edit the text on the input line.
- `-n nchars`: Stop reading after reading `nchars` characters if the line delimiter has not been reached.
- `-N nchars`: Ignore the line delimiter and stop reading only after reading `nchars` characters, reaching `EOF`, or a read timeout.
- `-p prompt`: Print the prompt string without a newline before starting to read.
- `-r`: Use raw input, specifically, this option makes `read` interpret backslashes literally, rather than as escape characters.
- `-s`: When `read` gets input from the terminal, do not display the keystrokes.
- `-t timeout`: If the complete input line is not read within `timeout` seconds, it times out and returns failure. If the timeout value is zero, `read` will not read any data, but if input is available for reading, it returns success. If no timeout is specified, the value of the `shell` variable `TMOUT` (if it exists) is used. The timeout value can be a decimal, for example, `3.5`.
- `-u fd`: Read from file descriptor `fd` instead of from standard input, where the file descriptor should be a small integer.

## Examples
Reading input from the terminal, continuously looping until pressing `Ctrl + D` to reach `EOF`. Since the variable name `text` is specified, the entire line of text is stored in the `text` variable, and the input content is output after pressing Enter for each line.

```shell
while read text
    do echo "$text"
done
```
Reading input from the terminal, specifying a timeout for the input.

```shell
if read -t 3 -p "Text: " text
then
    echo "Text: $text"
else
    echo -e "\nTimeout"
fi
```
Reading the contents of a file line by line.

```shell
cat test.txt | while read line
do
   echo "$line"
done
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.computerhope.com/unix/bash/read.htm
https://www.runoob.com/linux/linux-comm-read.html
https://linuxize.com/post/how-to-read-a-file-line-by-line-in-bash/
```