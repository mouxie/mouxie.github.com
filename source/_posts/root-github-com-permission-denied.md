---
title: 解决 root@github.com Permission denied (publickey)
date: 2022-10-16 20:20:20
description: "执行 `git` 命令 `git pull` 或 `git push` 时遇到以下错误 root@github.com Permission denied (publickey)"
keywords: "root,git,Permission denied,github,操作,错误"
tags: 
 - git
 - github
categories:
 - Git
permalink: fixed-root-github-com-Permission-denied-publickey.html
toc: true
---
在日常使用git版本控制器的过程中，经常会遇到一些错误，特别是在直接使用git命令行操作，而不是使用Git图形界面（比如TortoiseGit或IDE自带的Git版本控制插件）时。
例如在执行 `git` 命令 `git pull` 或者 `git push` 操作的时候遇到了以下错误：
```
root@github.com: Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```
## 错误原因分析
从输出的output错误信息，该操作使用了root用户名去ssh登录github.com, 并提供了错误的验证登录所需要的证书。而正常应该是使用git这个用户名去登录操作。所以引起错误的原因应该是Git的配置信息缺少了git用户名。所以默认使用root这个用户名去尝试操作，才会保Permission denied的错误。那么接下来就可以按下面几种方法来解决这个 `root@github.com Permission denied (publickey)` 问题。

## 解决方法:
<!-- more -->
### 方法一：设置GIT_SSH_COMMAND变量
自 Git 版本2.3.0起，可以使用环境变量 `GIT_SSH_COMMAND` 来修改ssh的user用户名为 git,并指定登录密钥（私钥）的位置，不需要修改git config 配置文件。
```
export GIT_SSH_COMMAND="ssh -i /root/.ssh/id_rsa -l git"
```
接着就可以正常使用git pull等命令了。
当然， export这个环境变量 `GIT_SSH_COMMAND`是临时设置，需要将其写入永久的系统环境变量中

#### 永久设置GIT_SSH_COMMAND变量

##### 1、修改profile文件：
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

##### 2、修改.bashrc文件：
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

### 方法二：git配置core.sshCommand
自 git 版本 2.10+ (released 02/09/2016, 2016Q3) 起，也可以使用git config 设置 core.sshCommand 来指定ssh命令的内容，
可以执行下面的`git config`命令：
```
git config core.sshCommand "ssh -i /root/.ssh/id_rsa -l git"
```
接着就可以正常使用git pull等命令了。
默认会写入当前使用仓库的 Git 目录中的 config 文件（即 .git/config）
或者不执行上面命令，直接打开.git/config文件进行修改，在 [core] 区域加入以下内容也是可以的:
```
sshCommand = "ssh -i /root/.ssh/id_rsa -l git"
```

如果需要写入全局设置或系统设置，需要加上选项 `--global` 或者 `--system` 选项，例如：
```
git config --global core.sshCommand "ssh -i /root/.ssh/id_rsa -l git"
```

### 方法三：修改git项目远程源remote.origin.url 的值
首先查看当前git项目的配置 remote.origin.url 的值，使用以下命令找到：
```
git config --show-origin remote.origin.url
```
假如执行输出结果显示为如下内容
```
file:.git/config        github.com:mouxie/mouxie.github.com.git
```
则可以看出在git配置文件.git/config中，配置项remote.origin.url的值在最前面缺少了用户名和@，比如：git@
通过运行以下命令来修改：
```
git remote set-url origin git@github.com:xxx/xxx.github.com.git
```
记得修改命令中xxx为真实的git repo地址。
接着就可以正常使用git pull等命令了。默认会自动使用私钥文件`/root/.ssh/id_rsa`来操作

若需要为github指定不同的ssh登录私钥文件，则可以添加或修改服务器文件`~/.ssh/config`，加入以下内容
```
Host github.com
    Hostname github.com
    IdentityFile ~/.ssh/id_rsa.github
    IdentitiesOnly yes # see NOTES below
```

`Note`:

The `IdentitiesOnly yes` is required to prevent the SSH default behavior of sending the identity file matching the default filename for each protocol. If you have a file named `~/.ssh/id_rsa` that will get tried BEFORE your `~/.ssh/id_rsa.github` without this option.
