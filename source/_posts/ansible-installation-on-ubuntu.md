---
title: "Ansible(1) - How to install Red Hat Ansible on ubuntu, 如何在Ubuntu上安装red hat ansible"
date: "2023-02-12 11:47:21"
description: "How to install Red Hat Ansible on ubuntu, 如何在Ubuntu上安装red hat ansible安装教程"
keywords: "Ansible,ubuntu,install,installation,Red hat,安装,教程"
tags: 
 - Ansible
 - Ubuntu
 - 教程
categories:
 - Ansible
permalink: how-to-install-red-hat-ansible-on-ubuntu.html
---

# 1.add Ansible repository to your system 添加Ansible仓库到系统

```
$ sudo apt-add-repository ppa:ansible/ansible
```

![Ansible1](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/Ansible-1-how-to-install-red-hat-ansible-on-ubuntu/Ansible1.png)

# 2.Run the update command before installing to update existing packages

```
$ sudo apt-get update
```

![Ansible2](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/Ansible-1-how-to-install-red-hat-ansible-on-ubuntu/Ansible2.png)

# 3.install the Ansible package
```
$ sudo apt-get install ansible -y
```
![Ansible3](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/Ansible-1-how-to-install-red-hat-ansible-on-ubuntu/Ansible3.png)

# 4.You can check if you’re on the latest version of Ansible by running the version command
```
$ ansible --version
```
![Ansible4](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/Ansible-1-how-to-install-red-hat-ansible-on-ubuntu/Ansible4.png)
