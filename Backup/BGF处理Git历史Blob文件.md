# BGF处理Git历史Blob文件
我们使用`Git`来管理项目的时候，可能会提交一些`Blob`的二进制文件，这些文件并不能像文本文件一样采用`diff delta`的形式进行版本控制。如果这些文件一直跟随`master`的主版本，那么就是属于有效的文件。

然而很多时候这些二进制文件会被删除重建，那么由于`Git`的特性，这些文件会一直留在`Git`的历史记录中，这样会导致`Git`仓库变得庞大，不利于版本控制和迁移。最直观的就是`clone`的时候会很慢，而使用`--depth=1`则无法看到历史提交的代码。

## 查找历史文件
历史提交的二进制文件通常我们可以认为是不需要的，然而在多人协作的时候这个事情我们并不能非常确定。因此我们需要主动查找较大的二进制文件来处理，最简单的办法就是直接扫描大文件。

```bash
git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -10 | awk '{print$1}')"
```

通过这个命令我们可以看到历史提交中最大的`10`个文件，然后我们可以根据这个文件的`hash`值来查找这个文件的提交记录。如果需要看到文件的大小，也可以再补充下输出。

```bash
git verify-pack -v .git/objects/pack/*.idx \
  | grep blob \
  | sort -k 3 -n \
  | tail -10 \
  | awk '{print $1, $3}' \
  | while read -r hash size; do
      file=$(git rev-list --objects --all | grep "$hash")
      echo "$file $size"
    done
```

## BFG Repo-Cleaner
虽然可以使用`git-filter-branch`来处理历史提交，但是这个命令的效率比较低，且容易出现错误。`BFG`是一种更简单、更快捷的替代方法，主要是用来处理历史提交的文件，可以删除指定的文件，也可以替换文件内容。

`BFG`需要使用`Java`来运行，因此需要先确保运行环境`JDK >= 8`。之后使用`git clone --mirror`来克隆仓库，然后使用`BFG`来处理历史提交。

```bash
git clone --mirror git://example.com/some-big-repo.git
```

需要注意的是，使用`--mirror`标识会将整个仓库的完整副本克隆下来，包括所有的提交历史，并且不会存在任何普通文件。同样的，当处理完成之后这个仓库所有的分支都会被修改，因此需要谨慎操作。

而如果仅处理单个分支，那就是使用常规的`git clone`即可。但是需要注意的是，由于其他分支仍然有可能持有旧的分支内容，因此就必须要将所有涉及到的分支依次处理，这样就非常麻烦了。

接下来就是使用`BFG`来处理历史提交，`BFG`的使用非常简单，只需要指定需要处理的文件即可。下载`BFG`的`jar`包可以在`https://rtyley.github.io/bfg-repo-cleaner/`中找到。

```bash
java -jar bfg.jar --delete-files path/to/file.txt some-big-repo.git
```
`BFG`还提供了一些其他的功能，比如删除指定大小的文件、替换文件内容、删除文件夹、删除文件通用匹配符。

```bash
java -jar bfg.jar --strip-blobs-bigger-than 1M some-big-repo.git
java -jar bfg.jar --replace-text pwd.txt some-big-repo.git
java -jar bfg.jar --delete-folders path some-big-repo.git
java -jar bfg.jar --delete-files '*.png' some-big-repo.git
```

但是这里的匹配模式也存在局限，例如无法同时指定文件和大小，例如需要移除`> 1M`的`png`文件是做不到的，经过测试其匹配模式总是倾向于后设置的模式。不过这里并没有阅读源码，只是简单的测试判断。

此外，不需要担心`BFG`会删除`HEAD`的提交，`BFG`不会处理`HEAD`的提交，即使`BFG`会从早期的历史记录中删除文件，当然也可以通过`--no-blob-protection`来关闭保护。

```
WARNING: The dirty content above may be removed from other commits, but as
the *protected* commits still use it, it will STILL exist in your repository.
```

在处理完成后，在同级目录下会生成`report`文件夹，其中包含了处理的文件信息，可以查看处理的文件数量、大小等信息，以及`HASH`变更的信息。在检查无误后，要将历史记录的过期时间设置为现在，且需要使用`git`来清理无引用的数据，这样就可以将`BFG`处理的数据真正删除。

```bash
cd some-big-repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

此时就可以通过`du`命令检查文件夹的大小了，通常我们只需要关注`.git`文件夹即可。

```bash
du -sh .git
```

最后，直接使用`git push`来推送到远程仓库即可，这样就完成了历史提交的处理。注意如果使用分支模式的话，就需要加入`-force`选项来强制推送。

```bash
git push
```

这里还需要有一个额外的步骤，需要让每个参与者将本地的仓库删除，然后完整重新`clone`最新的仓库，防止持有旧数据的仓库重新推回仓库。此外，也可以使用`git-filter-repo`来实现类似的处理。

## GitHub
从历史记录中删除文件并不是简单的事情，如果需要我们手动来执行操作的话，就很像我们从某一次提交开始，不断向后`rebase`。那么在这个过程中自然就会导致`commit`的`hash`值发生变化，从而出现一些问题，这里我们主要关注在`GitHub`的表现。

1. 如果二进制文件是在很久前的提交，例如`5`年前的提交，而假设我们仅会删除此提交的某个文件，对于其他的提交并没有处理。但是由于需要重写历史提交记录，这就会导致从`5`年前引入的`id`开始到最新的提交全部被重写，这部分可以在`BFG`的`Commit Tree-Dirt History`中关注到。
2. 前边我们也提到了`BFG`会将`hash`变化信息写入`report`文件夹，实际上在重写的`commit`描述信息中，也会发现`Former-commit-id: xxx`的数据，用以标识这个`commit`重写前的引用。
3. 在`GitHub`的`contributions`面板中，也就是绿色的瓷砖部分，会出现重写`commit`的历史提交出现重复贡献的现象，也就是说原来可能仅有`1`个提交，现在变成了`2`个，对于这个问题是可以减小影响面的。
4. 虽然`contributions`面板中会出现重复的提交，但是通过`api`获取的提交记录总数中并不会出现重复的数量增量，也就是说`GitHub`并没有将重写的`commit`计入历史提交记录中。
5. 对于通过分支模式而不是`mirror`模式清理的单独分支，虽然通过`BFG`可以将历史提交的二进制文件删除，但是其`commit`数量的计算会出现问题，其会切断`fork`之前的联系，也就是说原本`fork`分支的提交记录会被重新计算。
6. 虽然对于主分支的提交数量不会影响，但是此时如果我们打开重写过后的`commit`描述，可以发现仍然可以找到原本的`commit`。这就意味着这个`object`实际上并没有被删除，只是不再被引用，而是处于游离指针的状态。

实际上这里的影响面还是挺大的，特别是对于早些时间引入的二进制文件，会导致大范围的历史提交记录重写。

对于`contributions`面板的影响，也是看起来比较大的问题，不过我们可以先`fork`主分支，然后再将主分支设置为`fork`分支，然后再更改名称的形式来解决这个问题。但是这个方式并没有完全解决问题，还是会因为提交日期的重写而导致`contributions`面板的数据不准确，不过影响面小了很多。

而对于其他问题，通常都是无法避免的问题，因为`Git`的特性决定了这个问题的存在。如果需要处理历史提交中私有文件的泄漏，则通常认为是不可靠的，此时必须要立即修正密钥。因此无论是当前提交还是在处理历史提交的时候，需要谨慎操作，不要泄漏私密文件，尽量避免对历史提交的处理。

## Blog

```
https://github.com/WindRunnerMax/EveryDay
```

## 参考

```

https://api.github.com/repos/user/repo
https://bbs.huaweicloud.com/blogs/343828
https://github.com/newren/git-filter-repo
https://rtyley.github.io/bfg-repo-cleaner/
https://www.cnblogs.com/sowler/p/17550629.html
https://api.github.com/search/commits?q=author:user
```
