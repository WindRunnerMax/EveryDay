# Comparison between Git and SVN
`Git` and `SVN` are both version control systems. Version control refers to the management of changes to various program codes, configuration files, and documentation files during software development. It is one of the core ideas of software configuration management, and its main function is to track file changes.

## Description
`SVN` is a centrally managed version control system, while `Git` is a distributed version control system, this is the core difference between the two.  
`SVN` has only a single centrally managed server that saves all file revisions, and people collaborate by connecting to this server through clients to retrieve the latest files or submit updates.  
`Git` treats each terminal as a repository; clients not only retrieve the latest version of files but also mirror the original code repository completely. Each extraction operation is actually a complete backup of the code repository.  
Relatively speaking, distributed management systems are more powerful, but they are also more difficult to get started with. Of course, a distributed code version management system may not be suitable for all teams. For example, small and medium-sized teams may be more concerned with lower costs and ease of use, so centralized version management tools like `SVN` may be more suitable. However, regardless of the code version management tools the team ultimately chooses, as long as it suits the team's development process and work style, and the code management is smooth, it is acceptable.

## Detailed comparison

| Difference | SVN | Git |
| --- | --- | --- |
| System Features | 1. Centralized version control system, convenient document management. <br> 2. Parallel centralized development within the enterprise. <br> 3. Recommended for development on `Windows` systems. <br> 4. Cloning a repository with nearly ten thousand commits, five branches, each with approximately 1500 files, takes nearly an hour. | 1. Distributed system, convenient code management. <br> 2. Open source project development. <br> 3. Recommended for development on `Mac` and `Linux` systems. <br> 4. Cloning a repository with nearly ten thousand commits, five branches, each with approximately 1500 files, takes 1 minute. |
| Flexibility | 1. If the server hosting `SVN` fails, interaction with it is not possible. <br> 2. All `SVN` operations require interaction with the central repository, such as branching and viewing logs. | 1. Can operate independently; `Git` repository failures can still work locally. <br> 2. Except for `push`, `pull`, or `fetch` operations, all other operations can be carried out locally. <br> 3. Can create branches locally according to development tasks. <br> 4. Logs are viewed locally, which is more efficient. |
| Security | Poor; regular backups are necessary, and the entire `SVN` must be backed up. | High; each developer's local environment is a complete version repository, recording all information of the repository. |
| Branching | 1. Branching feels more like copying a path. <br> 2. Can branch any subdirectory. <br> 3. Branching is slow because it's akin to copying. <br> 4. After creating a branch, it affects all members, and everyone will have this branch. <br> 5. Intensive and cumbersome for parallel development with multiple branches. | 1. Can start a branch at any commit point in `Git`. <br> 2. Branching is faster because it only creates pointers and `HEAD` for the files. <br> 3. Locally created branches do not affect others. <br> 4. More suitable for parallel development with multiple branches. <br> 5. No need for version rollback when using `Git checkout hash`. <br> 6. Powerful `cherry-pick`. |
| Workflow | 1. Need to do an `update` operation before changing a file, and sometimes the file gets updated during the modification process, resulting in failed `commit`. <br> 2. Conflicts interrupt the submission process, and resolving conflicts becomes a speed race: the faster one submits without problems, while the slower one might run into trouble resolving conflicts. | 1. Perform a `fetch` operation before starting work, and a `push` operation after completing development, resolving conflicts. <br> 2. The submission process in `Git` is not interrupted, conflicts are marked in conflicted files. <br> 3. Classic `Gitflow` process. |
| Content Management | `SVN` has good support for Chinese and simple operations. | Convenient for managing source code, occupies less space and easy to manage branching. |
| Learning Curve | Convenient to use, good support for Chinese, and simple operations. | Values efficiency over ease of use; higher learning curve with many unique commands such as `rebase`, commands for interacting with remote repositories, and others. |
| Access Control | `SVN` has strict access control, can control permissions for groups and individuals for specific subdirectories, and each directory will have a hidden `.SVN` file. | `Git` does not have strict access control, only account role division. |
| Management Platforms | Has very comprehensive plugins. | In addition to functional plugins, there are also platforms like `Gitlab`, `Gerrit`, `GitHub`, etc. |

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```

## References

```
https://juejin.cn/post/6844903619813179405
https://www.cnblogs.com/ssgeek/p/9642171.html
https://www.cnblogs.com/Sungeek/p/9152223.html
```