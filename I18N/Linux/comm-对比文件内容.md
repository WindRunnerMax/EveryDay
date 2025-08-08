# comm command
The `comm` command is used to compare two sorted files. This command compares the differences between two sorted files column by column and displays the results. If no parameters are specified, the results are displayed in three columns: the first column shows the lines that only appear in the first file, the second column shows the lines that only appear in the second file, and the third column shows the lines that appear in both the first and second files. If the file names given are "-", the `comm` command will read data from the standard input device.

## Syntax
```shell
comm [OPTION]... FILE1 FILE2
```

## Options
* `-1`: Suppress lines unique to `FILE1`.
* `-2`: Suppress lines unique to `FILE2`.
* `-3`: Suppress lines that appear in both files.
* `--check-order`: Check that the input is correctly sorted, even if all input lines are pairable.
* `--nocheck-order`: Do not check that the input is correctly sorted.
* `--output-delimiter=STR`: Use string `STR` as the output delimiter.
* `-z, --zero-terminated`: End lines with a `NUL` character instead of a newline.
* `--help`: Display this help message and exit.
* `--version`: Output version information and exit.

## Example
Suppose we have two files, `recipe.txt` and `shopping-list.txt`, which are different but share many lines. Not all recipe ingredients are on the shopping list, and not all items on the shopping list are part of the recipe.

```
# recipe.txt
All-Purpose Flour
Baking Soda
Bread
Brown Sugar
Chocolate Chips
Eggs
Milk
Salt
Vanilla Extract
White Sugar

# shopping-list.txt
All-Purpose Flour
Bread
Brown Sugar
Chicken Salad
Chocolate Chips
Eggs
Milk
Onions
Pickles
Potato Chips
Soda Pop
Tomatoes
White Sugar
```

By using the `comm` command, it will read these two files and provide us with three columns of output. In this case, each line of the output will start with 0, 1, or 2 tabs, resulting in three columns:
* The first column with zero tabs represents the lines that only appear in the first file.
* The second column with one tab represents the lines that only appear in the second file.
* The third column with two tabs represents the lines that appear in both files.

```shell
comm recipe.txt shopping-list.txt
#                All-Purpose Flour
#Baking Soda
#                Bread
#                Brown Sugar
#        Chicken Salad
#                Chocolate Chips
#                Eggs
#                Milk
#        Onions
#        Pickles
#        Potato Chips
#Salt
#        Soda Pop
#        Tomatoes
#Vanilla Extract
#                White Sugar
```

Compare `recipe.txt` and `shopping-list.txt`, while suppressing the output of the first and second columns.

```shell
comm -12 recipe.txt shopping-list.txt
# All-Purpose Flour
# Bread
# Brown Sugar
# Chocolate Chips
# Eggs
# Milk
# White Sugar
```

## Daily Question
```
https://github.com/WindrunnerMax/EveryDay
```

## References
```
https://www.computerhope.com/unix/ucomm.htm
https://www.runoob.com/linux/linux-comm-comm.html
https://www.geeksforgeeks.org/comm-command-in-linux-with-examples/
```