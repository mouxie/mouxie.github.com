---
title: 解决 root@github.com Permission denied (publickey)
date: 2022-10-16 20:20:20
permalink: fixed-root-github-com-Permission-denied-publickey.html
---
执行 `git` 命令 `git pull` 或 `git push` 时遇到以下错误
```
root@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```
解决方法:
使用环境变量 `GIT_SSH_COMMAND` 来修改ssh的user为 git,并指定登录密钥（私钥）的位置
```
export GIT_SSH_COMMAND="ssh -i /root/.ssh/id_rsa -l git"
```
当然， export这个环境变量 `GIT_SSH_COMMAND`是临时设置，需要将其写入永久的系统环境变量
