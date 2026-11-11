---
title: '用 Docker 跑 MySQL：最小可用配置'
date: 2026-05-19
summary: '一条命令拉起 MySQL 容器，含端口映射、数据持久化与初始密码设置。'
tags: ['Docker', 'MySQL', '数据库']
origin: 'MySQL Docker部署.md'
---
## MySQL Docker 部署

### 概述

使用 Docker 快速部署 MySQL 数据库，实现容器化运行。

### 部署步骤

![](/blog/notes-assets/mysql-docker/file-20260519130912876.png)

#### 1. 搜索 MySQL 镜像

```bash
docker search mysql
```

#### 2. 拉取 MySQL 镜像

```bash
docker pull mysql:5.7
```

#### 3. 创建并启动容器

**基础命令：**

```bash
docker run -p 3309:3306 --name mysql \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -d mysql:5.7
```

**带数据持久化（推荐）：**

```bash
docker run --restart=always \
  --name mysql \
  -p 3307:3306 \
  -v /root/mysql/data:/var/lib/mysql \
  -v /root/mysql/logs:/logs \
  -e MYSQL_ROOT_PASSWORD=yourpassword \
  -d mysql:5.7
```

#### 4. 参数说明

| 参数 | 说明 |
|------|------|
| `-p 3307:3306` | 将容器 3306 端口映射到宿主机 3307 端口 |
| `-v /root/mysql/data:/var/lib/mysql` | 挂载数据目录（容器路径固定） |
| `-v /root/mysql/logs:/logs` | 挂载日志目录 |
| `-e MYSQL_ROOT_PASSWORD=123456` | 初始化 root 用户密码 |
| `--restart=always` | 容器退出时自动重启 |

#### 5. 操作 MySQL

```bash
## 进入容器
docker exec -it mysql /bin/bash

## 登录 MySQL
mysql -uroot -p
```

#### 6. 客户端连接

使用 Navicat 或其他 MySQL 客户端连接：

- **主机：** 宿主机 IP
- **端口：** 映射的宿主机端口（如 `3307`）
- **用户名：** root
- **密码：** 设置的 root 密码

### 快捷命令汇总

```bash
## 拉取镜像
docker pull mysql:5.7

## 启动容器
docker run -p 3309:3306 --name mysql \
  -e MYSQL_ROOT_PASSWORD=gxa123456 \
  -d mysql:5.7

## 启动第二个 MySQL 实例
docker run -p 3308:3306 --name mysql2 \
  -e MYSQL_ROOT_PASSWORD=gxa123456 \
  -d mysql:5.7
```

### 常见问题

- 确保宿主机端口未被占用
- 生产环境务必修改默认密码
- 建议挂载数据卷防止容器删除后数据丢失
