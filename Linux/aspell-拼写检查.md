# aspell命令
`aspell`命令是一个交互式拼写检查器，其会扫描指定的文件或任何标准输入的文件，检查拼写错误，并允许交互式地纠正单词。

## 语法

```shell
aspell [options] command
```

## 参数
* `usage, -?`: 显示常用拼写检查命令和选项的简短摘要。
* `help`: 输出帮助信息。
* `version, -v`: 输出版本信息。
* `check file, -c file`: 拼写检查单个文件。
* `list`: 产生标准输入中拼写错误的单词的列表。
* `[dump] config`: 将所有当前配置选项转储到标准输出。
* `config key`: 将键的当前值发送到标准输出。
* `soundslike`: 输出输入的每个单词的等效声音。
* `munch`: 从单词输入列表中生成可能的词根和词缀。
* `expand [1-4]`: 扩展输入的每个词缀压缩词的词缀标志。
* `clean [strict]`: 清除输入单词列表，以便每一行都是有效单词。
* `munch-list [simple] [single|multi] [keep]`: 通过词缀压缩减小单词列表的大小。
* `conv from to [norm-form]`: 从一种编码转换为另一种编码。
* `norm (norm-map|from norm-map to) [norm-form]`: 执行`Unicode`规范化。
* `[dump] dicts|filters|modes`: 列出可用的字典，过滤器或模式。
* `dump|create|merge master|personal|repl wordlist`: 转储，创建或合并主，个人或替换单词列表。
* `-mode=mode`: 检查文件时使用的模式，可用的模式有`none`、`url`、`email`、`sgml`、`tex`、`texinfo`、`nroff`和系统上可用的任何其他模式。
* `-dont-backup`: 不要创建备份文件，通常如果有任何更正，则`aspell`程序会将`.bak`附加到现有文件名后，然后创建一个新的带有更正的文件，该文件是在拼写检查期间进行的。
* `--backup, -b, -x`: `aspell`程序通过复制并在文件名后附加`.bak`来创建备份文件，仅当命令是检查文件并且仅在进行任何拼写修改时才创建备份文件时，这才适用。
* `--sug-mode=mode`: 建议模式`=ultra|fast|normal|bad-spellers`。
* `-encoding=name`: 预期将对文档进行编码，默认值取决于当前的语言环境。
* `--master=name, -d name`: 要使用的词典的基本名称，如果指定了此选项，则`aspell`将使用此词典或退出。
* `--keymapping=aspell, --keymapping=ispell`: 要使用的键映射，默认设置为`aspell`或`ispell`使用与`Ispell`程序相同的映射。
* `--lang=string, -l string`: 要使用的语言，它遵循大多数系统上`LANG`环境变量的相同格式，由两个字母的`ISO639`语言代码和短划线或下划线后的可选两个字母的`ISO3166`国家代码组成，默认值基于`LC\u MESSAGES`区域设置的值。
* `--dict-dir=directory`: 主词典单词列表的位置。
* `--size=string`: 字典单词列表的首选大小，它由两个字符的数字代码组成，用于描述列表的大小，典型值为：`10=tiny`、`20=really small`、`30=small`、`40=somewhat small`、`50=med`、`60=kinda large`、`70=large`、`80=huge`、`90=enormous`。
* `--variety=string`: 任何额外的信息，以区分这种类型的字典与其他可能具有相同的数量和大小的字典。
* `--jargon=string`: 请使用多样性选项，因为它取代术语作为一个更好的选择，这些术语将来会被删除。
* `--word-list-path=list of directories`: 单词列表信息文件的搜索路径。
* `--personal=file, -p file`: 要使用的个人单词列表的文件名。
* `--repl=file`: 替换列表文件名。
* `--extra-dicts=list`: 使用额外的字典。
* `--ignore=integer, -W integer`: 忽略长度大于或等于整数字符的单词。
* `--ignore-case, --dont-ignore-case`: 检查单词时忽略大小写。
* `--ignore-repl, --dont-ignore-repl`: 忽略存储替换对的命令。
* `--save-repl, --dont-save-repl`: 在全部保存中保存替换单词列表。
* `--conf=filename`: 主配置文件，此文件覆盖`aspell`的全局默认值。
* `--conf-dir=directory`: 主配置文件的位置。
* `--data-dir=directory`: 语言数据文件的位置。
* `--keyboard=keyboard`: 使用此键盘布局建议可能的单词，如果用户不小心按了所需正确键旁边的键，就会发生这些拼写错误。
* `--local-data-dir=directory`: 语言数据文件的替代位置，在数据目录之前搜索此目录。
* `--home-dir=directory`: 个人单词表文件的目录位置。
* `--per-conf=filename`: 个人配置文件，此文件覆盖全局配置文件中的选项。
* `--byte-offsets, --dont-byte-offsets`: 使用字节偏移量而不是字符偏移量。
* `--guess, --dont-guess, -m, -P`: 在管道模式下，创建不在字典中的缺少的词根/词缀组合。
* `--reverse, --dont-reverse`: 在管道模式下，反转建议列表的顺序。
* `--suggest, --dont-suggest`: 建议在管道模式下进行可能的替换，如果为假，则`aspell`将报告拼写错误，并且不尝试任何建议或可能的更正。
* `--time, --dont-time`: 给加载时间计时，并建议在管道模式下的时间。

## 示例

`example.txt`文件内容如下：

```shell
The quick brown fox jumped over the extraordinarily lazy dog.
```

检查文件`example.txt`是否存在拼写错误，如果有拼写错误则出现选择式交互选项，如果没有拼写错误则不会出现交互式选项。

```shell
aspell -c sample.txt
```

使用`aspell`大量检查单词。运行时将等待用户输入，添加任意数量的单词，完成后按`Ctrl + D`完成输入，然后即可看到`aspell`将在输入的下方显示拼写错误的单词。

```shell
aspell list
```


## 每日一题

```
https://github.com/WindrunnerMax/EveryDay
```

## 参考

```
https://www.computerhope.com/unix/aspell.htm
https://www.tutorialspoint.com/unix_commands/aspell.htm
https://www.geeksforgeeks.org/aspell-command-in-linux-with-examples/
```

