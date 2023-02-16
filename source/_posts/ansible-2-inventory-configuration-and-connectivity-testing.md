---
title: "Ansible(2) - Ansible inventory configuration and connectivity testing Ansible配置主机和连接测试教程.md"
date: "2023-02-12 11:57:21"
description: "Ansible inventory configuration and connectivity testing Ansible配置主机和连接测试教程"
keywords: "Ansible,inventory,configuration,connectivity,配置,主机,连接,教程"
tags: 
 - Ansible
 - 教程
categories:
 - Ansible
permalink: ansible-2-inventory-configuration-and-connectivity-testing.html
---
# 1. open the inventory file with your favorite editor and modify it

```
sudo vi /etc/ansible/hosts
```

add servers likes below:

```
[servers]
server1 ansible_host=192.168.1.100 ansible_ssh_user=test_user ansible_ssh_pass=password ansible_ssh_extra_args='-o StrictHostKeyChecking=no'
server2 ansible_host=192.168.1.101 ansible_ssh_user=test_user ansible_ssh_pass=password ansible_ssh_extra_args='-o StrictHostKeyChecking=no'
```

# 2. verify the inventory

<!-- more -->
```
ansible-inventory --list -y
```

![image](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/Ansible-2-inventory-configuration-and-connectivity-testing/ansible-inventory%20--list.png)

# 3. test connectivity by using a Ansible ping
```
ansible all -m ping
```
![image](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/Ansible-2-inventory-configuration-and-connectivity-testing/ansible%20all%20-m%20ping.png)

# 4. run a testing command from control node to host nodes
```
ansible all -a "df -h"
```
![image](https://raw.githubusercontent.com/mouxie/mouxie.github.com/images/Ansible-2-inventory-configuration-and-connectivity-testing/ansible%20all%20-a%20df%20-h.png)

参数说明 args:
- all: all servers
- -a: using ad-hoc commands
- df: disk free
- -h: –human-readable : print sizes in power of 1024
