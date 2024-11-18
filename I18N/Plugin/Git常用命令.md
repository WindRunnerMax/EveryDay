# Commonly Used Git Commands

`Git` is an open-source distributed version control system used for agile and efficient handling of projects, whether big or small. It excels at versioning control for program code, managing version differences, and taking up minimal space in code repositories. It can be said that `Git` is currently the most advanced distributed version control system in the world.

## Workspaces
* `Workspace`: Working area.
* `Index/Stage`: Staging area.
* `Repository`: Local repository.
* `Remote`: Remote repository.

## Configuration
* `git config --list`: Show the current `Git` configuration.
* `git config -e [--global]`: Edit the `Git` configuration file.
* `git config [--global] user.name "[name]"`: Configure a single property using `name` as an example.

## Creation
* `git clone ssh://user@domain.com:22/resources.git`: Clone remote repository.
* `git init`: Initialize local `git` repository. Typically, use the `--bare` option to initialize a remote repository.

## Add or Remove Files
* `git add [file1] [file2] ...`: Add specified files to staging area.
* `git add [dir]`: Add specified directory to staging area, including subdirectories.
* `git add .`: Add all files in the current directory to the staging area.
* `git add -p`: Prompt for confirmation before adding each change. This can be used for incremental commits for multiple changes in the same file.
* `git rm [file1] [file2] ...`: Delete files from the workspace and stage the deletions.
* `git rm --cached [file]`: Remove files from the staging area without affecting the workspace.
* `git mv [file-original] [file-renamed]`: Rename a file and stage the renaming.

## Code Commit
* `git commit -m [message]`: Commit the staging area to the repository.
* `git commit [file1] [file2] ... -m [message]`: Commit specified files from the staging area to the repository.
* `git commit -a`: Commit changes from the workspace since the last `commit` directly to the repository.
* `git commit -v`: Show all `diff` information when committing.
* `git commit --amend -m [message]`: Replace the previous commit with a new one. If there are no new changes, this can be used to modify the commit message of the previous commit.
* `git commit --amend [file1] [file2] ...`: Redo the previous commit and include new changes in specified files.
* `git update-index --assume-unchanged file`: Assume unchanged. Even if a tracked file is modified locally, it will not be marked as modified.
* `git update-index --no-assume-unchanged file`: Stop assuming unchanged and resume tracking file changes.

## Branches
* `git branch`: List all local branches.
* `git branch -r`: List all remote branches.
* `git branch -a`: List all local and remote branches.
* `git branch [branch-name]`: Create a new branch while staying on the current branch.
* `git checkout -b [branch]`: Create a new branch and switch to it.
* `git branch [branch] [commit]`: Create a new branch pointing to the specified `commit`.
* `git branch --track [branch] [remote-branch]`: Create a new branch with a tracking relationship to the specified remote branch.
* `git checkout [branch-name]`: Switch to the specified branch and update the workspace.
* `git checkout -`: Switch to the previous branch.
* `git branch --set-upstream [branch] [remote-branch]`: Establish a tracking relationship between an existing branch and a specified remote branch.
* `git merge [branch]`: Merge the specified branch into the current branch.
* `git cherry-pick [commit]`: Pick a specific commit and merge it into the current branch.
* `git branch -d [branch-name]`: Delete a branch.
* `git push origin --delete [branch-name]`: Delete a remote branch.

## Tags
* `git tag`: List all `tags`.
* `git tag [tag]`: Create a new `tag` at the current `commit`.
* `git tag [tag] [commit]`: Create a new `tag` at a specific `commit`.
* `git tag -d [tag]`: Delete a local `tag`.
* `git push origin :refs/tags/[tagName]`: Delete a remote `tag`.
* `git show [tag]`: View information about a `tag`.
* `git push [remote] [tag]`: Push a specific `tag`.
* `git push [remote] --tags`: Push all `tags`.
* `git checkout -b [branch] [tag]`: Create a new branch pointing to a specific `tag`.

## Check Information
* `git status`: Display the modified files.
* `git log`: Display the version history of the current branch.
* `git log --stat`: Display the `commit` history and the files changed in each `commit`.
* `git log -S [keyword]`: Search the commit history for a specific keyword.
* `git log [tag] HEAD --pretty=format:%s`: Show all changes made after a specific `commit`, with each `commit` on a single line.
* `git log [tag] HEAD --grep feature`: Show all changes made after a specific `commit` with commit messages that match the search criteria.
* `git log --follow [file]`: Show the version history of a specific file, including file renames.
* `git log -p [file]`: Show every `diff` related to a specific file.
* `git log -5 --pretty --oneline`: Show the last 5 commits.
* `git shortlog -sn`: Show all users who have made commits, sorted by the number of commits.
* `git blame [file]`: Show who modified a specific file and when.
* `git diff`: Show the difference between the staging area and the working directory.
* `git diff --cached [file]`: Show the difference between the staging area and the last `commit` for a specific file.
* `git diff HEAD`: Show the difference between the working directory and the latest `commit` on the current branch.
* `git diff [first-branch]...[second-branch]`: Show the difference between two commits.
* `git diff --shortstat "@{0 day ago}"`: Show how many lines of code you've written today.
* `git show [commit]`: Display the metadata and changes of a specific commit.
* `git show --name-only [commit]`: Display the files changed in a specific commit.
* `git show [commit]:[filename]`: Display the content of a specific file at the time of a specific commit.
* `git reflog`: Display the recent commits on the current branch.

## Reverting
* `git checkout [file]`: Restore a specific file from the staging area to the working directory.
* `git checkout [commit] [file]`: Restore a specific file from a specific `commit` to the staging area and working directory.
* `git checkout .`: Restore all files from the staging area to the working directory.
* `git reset [file]`: Reset a specific file in the staging area to match the last `commit`, but keep the working directory unchanged.
* `git reset --hard`: Reset the staging area and working directory to match the last `commit`.
* `git reset [commit]`: Reset the pointer of the current branch to a specific `commit`, and reset the staging area, but keep the working directory unchanged.
* `git reset --hard [commit]`: Reset the `HEAD` of the current branch to a specific `commit`, and reset the staging area and working directory to match that `commit`.
* `git reset --keep [commit]`: Reset the current `HEAD` to a specific `commit` while keeping the staging area and working directory unchanged.
* `git revert [commit]`: Create a new `commit` to undo a specific `commit`, effectively offsetting all changes from the latter and applying them to the current branch.
* `git stash`, `git stash pop`: Temporarily remove uncommitted changes and later reapply them.
* `git reset --soft HEAD^`: Undo a `commit`, preserving the code from the previous `commit`.

## Remote Sync
* `git fetch [remote]`: Download all changes from the remote repository.
* `git remote -v`: Display all remote repositories.
* `git remote show [remote]`: Display information about a specific remote repository.
* `git remote add [shortname] [url]`: Add a new remote repository and assign it a shortname.
* `git pull [remote] [branch]`: Fetch changes from the remote repository and merge with the local branch.
* `git push [remote] [branch]`: Upload the specified local branch to the remote repository.
* `git push [remote] --force`: Force-push the current branch to the remote repository, even if there are conflicts.
* `git push [remote] --all`: Push all branches to the remote repository.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## Reference

```
https://blog.csdn.net/mine_song/article/details/70770467
https://www.ruanyifeng.com/blog/2015/12/git-cheat-sheet.html
https://www.liaoxuefeng.com/wiki/896043488029600/896067008724000
```