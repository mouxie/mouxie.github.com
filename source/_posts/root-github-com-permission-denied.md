---
title: 解决 root@github.com Permission denied (publickey)
date: 2022-10-16 20:20:20
description: "执行 `git` 命令 `git pull` 或 `git push` 时遇到以下错误 root@github.com Permission denied (publickey)"
keywords: "root,git,Permission denied,github"
tags: 
 - git
 - github
categories:
 - Git
permalink: fixed-root-github-com-Permission-denied-publickey.html
---
在日常使用git版本控制器的过程中，经常会遇到一些错误，特别是在使用git命令行工具时，而不是使用Git图形界面（比如TortoiseGit或IDE自带的Git版本控制插件）时。
例如在执行 `git` 命令 `git pull` 或者 `git push` 的时候遇到了以下错误：
```
root@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```
## 解决方法:
<!-- more -->
使用环境变量 `GIT_SSH_COMMAND` 来修改ssh的user用户为 git,并指定登录密钥（私钥）的位置
```
export GIT_SSH_COMMAND="ssh -i /root/.ssh/id_rsa -l git"
```
当然， export这个环境变量 `GIT_SSH_COMMAND`是临时设置，需要将其写入永久的系统环境变量中

### 永久设置

#### 1、修改profile文件：
修改文件 `/etc/profile`（此操作对所有用户都是有效的）
```
vi /etc/profile
```
在里面加入以下内容:
```
export GIT_SSH_COMMAND="ssh -i /root/.ssh/id_rsa -l git"
```
保存修改后，再运行以下命令使生效：
```
source /etc/profile
```

#### 2、修改.bashrc文件：
修改文件 `~/.bashrc`（每个用户目录下都有，使用命令 ls -a ~ 查看用户目录文件列表，此操作对单独用户有效）
```
vi ~/.bashrc
```
在里面加入以下内容：
```
export GIT_SSH_COMMAND="ssh -i /root/.ssh/id_rsa -l git"
```
保存修改后，再运行以下命令使生效：
```
source ~/.bashrc
```
