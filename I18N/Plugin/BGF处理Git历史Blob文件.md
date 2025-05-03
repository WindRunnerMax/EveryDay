# Handling Git History Blob Files with BFG
When we use `Git` to manage projects, we may end up committing some binary `Blob` files that cannot be version controlled in the same way as text files through `diff delta`. If these files continue to be part of the `master` branch, they are considered valid files.

However, many times these binary files might be deleted and recreated, and due to `Git`'s nature, these files will remain in the Git history records. This can lead to the Git repository becoming large, which is not conducive to version control and migration. The most noticeable impact is that cloning can be slow, and using `--depth=1` would mean not being able to see the historical commits' code.

## Searching for Historical Files
Historical binary files from commits are usually considered unnecessary, but in collaborative environments, we can't always be entirely sure of this. Therefore, it's necessary to actively search for larger binary files for handling. The simplest way is to directly scan large files.

```bash
git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -10 | awk '{print$1}')"
```

With this command, we can see the top `10` largest files from historical commits. We can then search for the commit records of these files based on their `hash` value. If needed, the file sizes can also be included in the output.

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
While `git-filter-branch` can be used to handle historical commits, this command is inefficient and prone to errors. `BFG` is a simpler and faster alternative, mainly used to handle files in historical commits. It can delete specified files or replace file contents.

`BFG` requires `Java` for running, so ensure the runtime environment has `JDK >= 8`. Then, clone the repository using `git clone --mirror` and use `BFG` to handle historical commits.

```bash
git clone --mirror git://example.com/some-big-repo.git
```

It is important to note that using the `--mirror` flag will clone a complete replica of the entire repository, including all commit history, without any ordinary files. Similarly, after processing, all branches of this repository will be modified, so caution is advised.

If only a single branch needs to be processed, a regular `git clone` can be used. However, since other branches might still hold old branch contents, all involved branches must be processed one by one, making it quite cumbersome.

Next, use `BFG` to handle historical commits, which is straightforward by specifying the files that need processing. The `BFG` jar package can be downloaded from `https://rtyley.github.io/bfg-repo-cleaner/`.

```bash
java -jar bfg.jar --delete-files path/to/file.txt some-big-repo.git
```

`BFG` also offers other functionalities like deleting files based on size, replacing file contents, deleting folders, and using file-specific deletion patterns.

```bash
java -jar bfg.jar --strip-blobs-bigger-than 1M some-big-repo.git
java -jar bfg.jar --replace-text pwd.txt some-big-repo.git
java -jar bfg.jar --delete-folders path some-big-repo.git
java -jar bfg.jar --delete-files '*.png' some-big-repo.git
```

However, the matching patterns here have limitations; for example, specifying both file and size simultaneously isn't possible. It seems the matching pattern tends to favor the later settings based on testing, though without examining the source code.

Furthermore, there is no need to worry about `BFG` deleting `HEAD` commits; `BFG` does not touch `HEAD` commits. Even if `BFG` removes files from earlier historical records, it will still exist in your repository if protected commits refer to it. Of course, you can disable this protection using `--no-blob-protection`.

```
WARNING: The dirty content above may be removed from other commits, but as
the *protected* commits still use it, it will STILL exist in your repository.
```

After the processing is completed, a `report` folder will be generated in the same directory, which contains information about the files processed. You can check details such as the number and size of files processed, as well as information on `HASH` changes. After verifying everything is correct, set the expiration time of historical records to now and use `git` to clean up unreferenced data to truly delete the data processed by `BFG`.

```bash
cd some-big-repo.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

You can now check the folder size using the `du` command. Typically, we only need to pay attention to the `.git` folder.

```bash
du -sh .git
```

Finally, simply use `git push` to push to the remote repository, completing the processing of historical commits. Note that if using branch mode, you will need to include the `-force` option to force the push.

```bash
git push
```

An additional step is required here: each participant needs to delete their local repository and then clone the latest repository completely to prevent repositories with old data from pushing back to the repository. Additionally, you can also use `git-filter-repo` for similar processing.

## GitHub

Removing files from the history is not a simple task. If we were to do it manually, it would be like continuously `rebase`-ing from a specific commit onwards. This process naturally results in changes to the `commit` `hash` values, causing issues, especially on GitHub.

1. If a binary file was committed a long time ago, say `5` years, and we only want to remove a file from that specific commit while leaving other commits untouched, rewriting the historical records will affect commits from `5` years ago up to the latest commit. This can be observed in BFG's `Commit Tree-Dirt History`.
2. As mentioned earlier, `BFG` logs hash change information in the `report` folder. In rewritten `commit` descriptions, you will find `Former-commit-id: xxx` indicating the original reference before the rewrite.
3. In the GitHub `contributions` panel, you might notice duplicated contributions from the history with rewritten commits, indicating discrepancies.
4. While the `contributions` panel may show duplicate commits, these duplicates are not reflected in the total number of commit records fetched via the API.
5. For branches cleaned using branches instead of `mirror` mode, although `BFG` can remove binary files from historical commits, the commit count calculation may be affected, disconnecting the fork's history before the rewrite.
6. Even though the number of commits on the main branch remains unaffected, examining the rewritten commit descriptions might reveal traces of the original commits. This means the object isn't truly deleted but remains unreferenced, in a dangling state.

The impact can be significant, especially for binary files introduced a while back, leading to extensive rewriting of historical commit records.

The impact on the `contributions` panel may appear significant, but you can mitigate it by forking the main branch, setting it as the fork branch, and renaming it to adjust. However, this method doesn't completely solve the issue as the rewrite of commit dates still affects the accuracy of the `contributions` panel data, although to a lesser extent.

Other issues are typically unavoidable due to Git's nature. If handling leaks of private files in historical commits, it's considered unreliable, and immediate key correction is necessary. Therefore, caution must be exercised, whether in current submissions or when handling historical commits, to avoid leaking sensitive information as much as possible. 

## Blog

- <https://github.com/WindRunnerMax/EveryDay>

## References

- <https://api.github.com/repos/user/repo>
- <https://bbs.huaweicloud.com/blogs/343828>
- <https://github.com/newren/git-filter-repo>
- <https://rtyley.github.io/bfg-repo-cleaner/>
- <https://www.cnblogs.com/sowler/p/17550629.html>
- <https://api.github.com/search/commits?q=author:user>