---
title: GIT如何回退到某个历史提交版本
subtitle: how to rollback git repository to a previous commit,certain commit,specify commit
date: 2022-11-12 12:47:21
description: "GIT如何回退到某个历史提交版本,how to rollback git repository to a previous commit,certain commit,specify commit"
keywords: "git,回退,历史,版本"
tags: 
 - git
categories:
 - Git
permalink: git-revert-rollback-to-previous-commit.html
---
在日常使用git版本控制器的过程中，难免会出现不小心push推送提交到远程服务器仓库中，这时就需要`后悔药`来回退到上一次提交的版本或者指定的版本。
本文使用Git的GUI界面管理工具 TortoiseGit 为例，
# 1.打开git日志 show log
在项目文件夹里，右键菜单 选择"TortoiseGit" -> "Show log"

![image](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/git-revert-rollback-to-previous-commit/show%20git%20logs.png)

# 2. 重置 reset
选择要回退（回滚）的历史提交记录，并在那条日志记录上右键，选择 `Reset "$实际分支名称 actual git branch name$" to this...`

![image](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/git-revert-rollback-to-previous-commit/git%20reset.png)

# 3. 参数 Rest type 选择 Hard
在弹出的对话框内， 在 Rest type 区域选项内选择第三个参数 
```
Hard: Reset working tree and index (discard all local changes)
```
![image](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/git-revert-rollback-to-previous-commit/git%20reset%20parameter.png)

# 4. Push
接着关闭所有对话框，重新在项目文件夹里右键，选择菜单"TortoiseGit" -> "Push"
选择unknown changes，在前面打勾选中，执行强制推送 force push
点OK按钮 推送到远程服务器仓库

![image](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/git-revert-rollback-to-previous-commit/git%20push%20parameter.png)

# 5. 查看Push推送结果
看到最底部显示 Success , 即Push推送成功，git历史版本回退（回滚）操作执行成功。
![image](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/git-revert-rollback-to-previous-commit/git%20push%20result.png)

# 6. 其他 Other
如果master branch分支被保护，无法提交推送，要先撤销master分支的保护操作。
