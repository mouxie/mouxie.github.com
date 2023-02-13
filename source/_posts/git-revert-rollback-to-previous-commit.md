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
本文使用Git的GUI界面管理工具 TortoiseGit 为例，并在步骤6提供git命令行回退历史版本参考示例，
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

# 6. Git命令行回退历史版本记录
使用`reset`命令
```
$ git reset --hard 464b3295
HEAD is now at 464b329 added a new file
```
使用`push`命令,带参数`-f`来强制执行force  
```
$ git push -f origin master
Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
To https://xxx.com/gitlab/user/testgithubflow.git
 + ef1b76c...464b329 master -> master (forced update)
```

# 7. 其他 Other
## 7.1 如果master branch分支被保护，无法提交推送，要先撤销master分支的保护操作。
```
$ git push -f origin master
Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
remote: GitLab: You are not allowed to force push code to a protected branch on this project.
To https://xxx.com/gitlab/user/testgithubflow.git
 ! [remote rejected] master -> master (pre-receive hook declined)
error: failed to push some refs to 'https://xxx.com/gitlab/user/testgithubflow.git'
```

## 7.2 如果是github且账号开启了email隐私保护（email privacy enabled），在git push操作时可能会遇到以下问题，
```
$ git push -f origin master
Total 0 (delta 0), reused 0 (delta 0), pack-reused 0
remote: error: GH007: Your push would publish a private email address.
remote: You can make your email public or disable this protection by visiting:
remote: http://github.com/settings/emails
To https://github.com/mouxie/mouxie.github.com.git
 ! [remote rejected] master -> master (push declined due to email privacy restrictions)
error: failed to push some refs to 'https://github.com/mouxie/mouxie.github.com.git'
```
解决办法是提供github给的替代email地址，运行下面命令(记得替代为自己的github email)：
```
$ git config --global user.email "xxx123+xxxx@users.noreply.github.com"
$ git commit --amend --reset-author
[master 13c144c] Create CNAME
 1 file changed, 1 insertion(+)
 create mode 100644 CNAME
```
然后再重新push就可以正常回退历史版本了
```
$ git push -f origin master
Enumerating objects: 4, done.
Counting objects: 100% (4/4), done.
Delta compression using up to 8 threads
Compressing objects: 100% (2/2), done.
Writing objects: 100% (3/3), 304 bytes | 304.00 KiB/s, done.
Total 3 (delta 0), reused 2 (delta 0), pack-reused 0
To https://github.com/mouxie/mouxie.github.com.git
 + 4f697eb...13c144c master -> master (forced update)
```

