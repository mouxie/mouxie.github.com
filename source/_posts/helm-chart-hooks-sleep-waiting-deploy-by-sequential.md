---
title: "Helm Charts hooks钩子让资源按照先后顺序创建，并延迟执行或暂停等待几秒再执行"
date: "2023-02-26 15:33:12"
updated: "2023-09-20 16:44:10"
description: ""
keywords: "helm,charts,helm charts,helm chart,hook-weight,钩子,权重,等待,启动,执行,暂停,延迟,顺序,Kubernetes"
tags: 
 - Helm
 - Helm-charts
 - Kubernetes
 - K8s
categories:
 - Kubernetes
permalink: helm-chart-hooks-sleep-waiting-deploy-by-sequential.html
---
在使用Helm Charts部署应用到Kubernetes Cluster集群中时，可能需要等待一些依赖项先行启动起来，后续应用部署才不至于启动出错。

比如在安装时在加载其他chart之前加载配置映射或密钥。 

比如部署的微服务应用需要等待数据库初始化操作成功，才可以启动时。如果这时候应用在数据库初始化还未成功完成时之前便开始执行启动操作时，大概率是会有问题发生的。

为了解决这个问题，我们需要使用到helm charts hooks钩子的权重特性来调整安排资源创建的先后启动顺序：

假设微服务 Microservice **A**的启动 依赖于应用**B**， 需要等待**B**先启动起来，才可以启动**A**。
<!-- more -->
假设A和B都定义在helm charts 应用的templates目录下的deployment.yaml里面，

我们需要给**B**加上hook钩子的`注解` `annotations`，例如：
```
apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "mychart.fullname" . }}-app-B"
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "-5"
```
那么这时应用**B**就会比**A**先行启动，因为Ｂ会在`pre-install`阶段先启动,并且它的hook-weight权重指定为`-5`,  
(假如还有其他应用指定了hook-weight权重，假如hook-weight为0还有10，那么执行顺序为-5,0,10)

但是如果这时**A**只是间隔几秒便开始启动，并未等待**B**完全启动初始化成功，那么指定hook-weight权重执行顺序也没用。

这时需要在**B**之后，并且在**A**之前再加一个等待暂停的hook钩子,并指定hook-weight权重数字大于-5，小于0,　比如`-4`.来延迟**A**的启动操作。

在helm charts 应用的templates目录下创建一个新的文件，文件名为`hook-sleep-20s.yaml`

加入如下内容：
```
apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "mychart.fullname" . }}-sleep"
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "-4"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  containers:
    - name: sleep
      image: busybox
      command: ['sleep']
      args: ['20']
  restartPolicy: Never
```
利用Linux的`sleep`命令来延迟**A**的执行，暂停20秒等待**B**完全初始化成功启动，再来启动**A**.

会在启动**A**之前部署一个名为mychart-sleep的Kubernetes的Pod资源。它的使命就是沉睡２０秒.等待**B**完全初始化成功。

因为配置了hook-delete-policy删除政策，所以在等待暂停20秒后会自动删除这个钩子即kubernetes资源pod,　然后开始后续的操作。

还有另外一种方法，是使用kubernetes的`initContainers`或者containers `lifecycle`功能来实现sleep暂停，

`initContainers`是在主容器（Pod中其他容器）启动之前运行的容器，可以用来预处理、配置、初始化容器等。你可以将需要在主容器启动之前运行的脚本放到initContainers中.

`lifecycle`是容器的生命周期管理机制，可以用来指定容器启动和停止时需要执行的命令。你可以在`lifecycle`中设置`postStart`和`preStop`，从而实现延迟部署或暂停等待几秒再执行的功能。例如，你可以在postStart中设置一个等待几秒钟的sleep命令，从而实现延迟部署的功能

示例如下：

```
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  initContainers:
  - name: init-container
    image: busybox
    command: ['sh', '-c', 'echo "Initializing container..." && sleep 10']
  containers:
  - name: main-container
    image: nginx
    lifecycle:
      postStart:
        exec:
          command: ["sh", "-c", "sleep 10"]
      preStop:
        exec:
          command: ["nginx", "-s", "quit"]
```
使用lifecycle时，并不能完全保证会在容器的entrypoint之前被执行。

