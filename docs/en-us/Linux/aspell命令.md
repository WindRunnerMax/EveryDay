# aspell command
The `aspell` command is an interactive spell checker that scans specified files or any standard input file, checks for spelling errors, and allows interactive correction of words.

## Syntax

```shell
aspell [options] command
```

## Parameters
* `usage, -?`: Display a brief summary of commonly used spell check commands and options.
* `help`: Output help information.
* `version, -v`: Output version information.
* `check file, -c file`: Spell check a single file.
* `list`: Produce a list of words with spelling errors in standard input.
* `[dump] config`: Dump all current configuration options to standard output.
* `config key`: Send the current value of a key to standard output.
* `soundslike`: Output the equivalent sound of each input word.
* `munch`: Generate possible word roots and suffixes from a list of words.
* `expand [1-4]`: Expand the suffix markers of compressed words in the input.
* `clean [strict]`: Clean up the input word list so that each line is a valid word.
* `munch-list [simple] [single|multi] [keep]`: Reduce the size of a word list by compressing suffixes.
* `conv from to [norm-form]`: Convert from one encoding to another encoding.
* `norm (norm-map|from norm-map to) [norm-form]`: Perform `Unicode` normalization.
* `[dump] dicts|filters|modes`: List available dictionaries, filters, or modes.
* `dump|create|merge master|personal|repl wordlist`: Dump, create, or merge master, personal, or replacement word lists.
* `-mode=mode`: Mode used when checking files, available modes are `none`, `url`, `email`, `sgml`, `tex`, `texinfo`, `nroff`, and any other available modes on the system.
* `-dont-backup`: Do not create backup files; usually, if any corrections are made, the `aspell` program appends `.bak` to the existing file name and creates a new file with the corrections made during the spell check.
* `--backup, -b, -x`: The `aspell` program creates a backup file by copying and appending `.bak` to the file name only when the command is to check a file and creates a backup file only when any spelling modifications are made.
* `--sug-mode=mode`: Suggestion modes `=ultra|fast|normal|bad-spellers`.
* `-encoding=name`: Expected encoding for the document; the default value depends on the current language environment.
* `--master=name, -d name`: Base name of the dictionary to be used; if this option is specified, `aspell` will use this dictionary or exit.
* `--keymapping=aspell, --keymapping=ispell`: Key mapping to be used; default to `aspell` or `ispell` using the same mapping as the `Ispell` program.
* `--lang=string, -l string`: Language to be used, it follows the same format as the `LANG` environment variable on most systems, consisting of a two-letter `ISO639` language code and an optional two-letter `ISO3166` country code following either a hyphen or underscore; the default value is based on the value of the `LC\u MESSAGES` locale.
* `--dict-dir=directory`: Location of the main dictionary word list.
* `--size=string`: Preferred size of the dictionary word list, it consists of a two-character numeric code describing the size of the list, typical values are: `10=tiny`, `20=really small`, `30=small`, `40=somewhat small`, `50=med`, `60=kinda large`, `70=large`, `80=huge`, `90=enormous`.
* `--variety=string`: Any additional information to distinguish this type of dictionary from others that may have the same number and size of words.
* `--jargon=string`: Use the diversity option as it replaces terms with a better choice, these terms will be removed in the future.
* `--word-list-path=list of directories`: Search path for word list information files.
* `--personal=file, -p file`: File name of the personal word list to be used.
* `--repl=file`: Replacement list file name.
* `--extra-dicts=list`: Use additional dictionaries.
* `--ignore=integer, -W integer`: Ignore words with a length greater than or equal to the integer.
* `--ignore-case, --dont-ignore-case`: Ignore case when checking words.
* `--ignore-repl, --dont-ignore-repl`: Ignore stored replacement pairs in commands.
* `--save-repl, --dont-save-repl`: Save replacement word lists in all saves.
* `--conf=filename`: Main configuration file; this file overrides the global default values of `aspell`.
* `--conf-dir=directory`: Location of the main configuration file.
* `--data-dir=directory`: Location of language data files.
* `--keyboard=keyboard`: Suggest possible words using this keyboard layout; these spelling errors occur when a user accidentally presses a key next to the intended correct key.
* `--local-data-dir=directory`: Alternative location for language data files; this directory is searched before the data directory.
* `--home-dir=directory`: Directory location of personal word list files.
* `--per-conf=filename`: Personal configuration file; this file overrides options in the global configuration file.
* `--byte-offsets, --dont-byte-offsets`: Use byte offsets instead of character offsets.
* `--guess, --dont-guess, -m, -P`: In pipeline mode, create missing word root/suffix combinations not in the dictionary.
* `--reverse, --dont-reverse`: In pipeline mode, reverse the order of the suggestion list.
* `--suggest, --dont-suggest`: Suggest replacements in pipeline mode; if false, `aspell` will report spelling errors and not attempt any suggestions or possible corrections.
* `--time, --dont-time`: Time the loading and suggest in pipeline mode.

## Example

The content of the file `example.txt` is as follows:

```
The quick brown fox jumped over the extraordinarily lazy dog.
```

Check if there are any spelling errors in the file `example.txt`. If there are any spelling errors, a select interaction prompt will appear. If there are no spelling errors, no interactive options will appear.

```shell
aspell -c sample.txt
```

Use `aspell` to check for a large number of words. The program will wait for user input, allowing for the addition of any number of words. Upon completion, press `Ctrl + D` to finish the input, and then `aspell` will display the misspelled words below the input.

```shell
aspell list
```

## Daily question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://www.computerhope.com/unix/aspell.htm
https://www.tutorialspoint.com/unix_commands/aspell.htm
https://www.geeksforgeeks.org/aspell-command-in-linux-with-examples/
```