# comm命令
`comm`命令用于比较两个已排过序的文件，该命令会一列列地比较两个已排序文件的差异，并将其结果显示出来。如果没有指定任何参数，则会把结果分成`3`列显示：第`1`列仅是在第`1`个文件中出现过的列，第`2`列是仅在第`2`个文件中出现过的列，第`3`列则是在第`1`与第`2`个文件里都出现过的列，若给予的文件名称为`-`，则`comm`命令会从标准输入设备读取数据。

## 语法

```shell
comm [OPTION]... FILE1 FILE2
```

## 参数
* `-1`: 禁止列`1`(`FILE1`唯一的行)。
* `-2`: 禁止列`2` (`FILE2`唯一的行)。
* `-3`: 禁止列3(出现在两个文件中的行)。
* `--check-order`: 检查输入是否正确排序，即使所有输入行都是可配对的。
* `--nocheck-order`: 不检查输入是否正确排序。
* `--output-delimiter=STR`: 用字符串`STR`分隔列。
* `-z, --zero-terminated`: 指定行分隔符是`NUL`，不是换行符。
* `--help`: 显示帮助消息。
* `--version`: 输出版本信息。

## 示例
`recipe.txt`文件与`shopping-list.txt`文件内容，这两个文件不同，但许多行是相同的，并非所有的配方成分都在购物清单上，也不是购物清单上的所有成分都是食谱的一部分。

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

使用`comm`命令，其将读取这两个文件并给我们三列输出，在这里，每行输出的开头都有`0`、`1`或`2`个制表符，将输出分成三列：
* 第一列`zero tabs`是只出现在第一个文件中的行。
* 第二列`one tabs`是只出现在第二个文件中的行。
* 第三列`two tabs`是出现在两个文件中的行。

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

比较`recipe.txt`文件与`shopping-list.txt`文件，并禁用第`1`与第`2`列的输出。

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



## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/ucomm.htm
https://www.runoob.com/linux/linux-comm-comm.html
https://www.geeksforgeeks.org/comm-command-in-linux-with-examples/
```

