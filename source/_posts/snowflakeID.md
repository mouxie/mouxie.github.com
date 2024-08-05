---
title: "适用于Kubernetes的分布式ID生成服务SnowflakeID,解决时钟回拨问题"
date: "2024-08-05 20:08:20"
updated: "2024-08-05 20:08:20"
description: "适用于Kubernetes的分布式ID生成服务SnowflakeID雪花ID算法,解决时钟回拨问题"
keywords: "snowflake,snowflakeID,雪花算法,分布式ID,UUID,Kubernetes,zookeeper,时钟回拨"
tags: 
 - snowflake
 - 算法
 - UUID
 - Kubernetes
categories:
 - Java
permalink: snowflake-id-for-kubernetes-handle-clock-backwards.html
---
最近准备上马Kubernetes的项目，之前已经把传统单机部署的Java应用程序，改为微服务Microservice架构。
相同的微服务跑在多个不同的容器内，需要为每条业务数据(transaction)分配唯一的ID，并且需要保证在各自容器跑的微服务生成的ID不会出现重复。
当时调研了多种UUID生成工具和算法，最终看上了浓眉大眼的推特Snowflake雪花ID生成算法。

Snowflake是由twitter开源的分布式ID生成算法。(当然Twitter现在已经被特斯拉老板马斯克买下来，并且改名为X了。)

这里没有直接使用snowflake算法，而是进行了改造。WorkerID由Zookeeper分配，利用了Zookeeper的持久顺序节点（PERSISTENT_SEQUENTIAL），因为在K8s环境里，Pod自动分配，可能有成百上千个，一个个去给它分配WorkerID显然不大可能。
还有就是从原先算法里的序列号位数里拿出4位来解决时钟回拨问题。

## 改造后的SnowflakeID的组成
SnowflakeID是一个64位的Long类型数字，对于bit的分配如下:
```
+----------------------------------------------------------------------------------------------+
|    标识位    |     41位时间戳     |    10位机器号     |    4位时钟回拨掩码   |     8位序列号      |
+----------------------------------------------------------------------------------------------+
| 1 Bit Unused | 41 Bit Timestamp | 10 Bit Worker ID | 4 Bit Sequence Mask | 8 Bit Sequence ID |
+----------------------------------------------------------------------------------------------+
```
1 + 41 + 10 + 4 + 8 = 64 bit
<!-- more -->

初始时钟回拨掩码为0，每当发生时钟回拨就+1，最高可支持15次回拨。之后打算修改为2位就行，4位有点浪费。

由于WorkerID只有10位，最多同时支持1024实例，当workerID超过1023时，让zookeeper删除之前的节点，从0再开始分配。这对随时可能中断的Pod或容器很有帮助。

改造后打包发布到Maven中央仓库，直接在pom.xml里引用
```
<dependency>
    <groupId>io.github.mouxie</groupId>
    <artifactId>SnowflakeID</artifactId>
    <version>1.0.1</version>
</dependency>
```
需要配置系统环境变量 ZOOKEEPER_ADDRESS 来连接Zookeeper

源码地址：
https://github.com/mouxie/SnowflakeID
