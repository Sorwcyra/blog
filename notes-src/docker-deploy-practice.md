### 1. 虚拟化技术

虚拟化技术是一种资源管理技术，是将计算机的各种实体资源，如服务器、网络、内存及存储等，予以抽象、转换后呈现出来，打破实体结构间的不可切割的障碍，使用户可以比原本的组态更好的方式来应用这些资源。

虚拟化技术主要作用：
- 高性能的物理硬件产能过剩
- 软件跨环境迁移问题（代码的水土不服）

### 2. 什么是 Docker

Docker 是一个开源的应用容器引擎，诞生于 2013 年初，基于 Go 语言实现，dotCloud 公司出品（后改名为 Docker Inc）。

Docker 可以让开发者打包他们的应用以及依赖包到一个轻量级、可移植的容器中，然后发布到任何流行的 Linux 机器上。容器是完全使用沙箱机制，相互隔离，容器性能开销极低。

Docker 从 17.03 版本之后分为 **CE**（Community Edition: 社区版）和 **EE**（Enterprise Edition: 企业版）。

官网地址：<https://www.docker.com>

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045295.png)

Docker 通俗的讲，是**服务器中高性能的虚拟机**，可以将一台物理机器互相之间隔离，互不影响。

**特点：**

- 容器将应用打包成标准化单元，用于交付、部署
- 容器包含了软件运行所需的所有环境，且非常轻量级
- 容器化的应用程序，可以在任何 Linux 环境中始终如一的运行
- 容器化的应用程序具备隔离性，多团队可以共享同一 Linux 系统资源

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045294-1.png)

### 3. 容器与虚拟机比较

容器是在操作系统层面上实现虚拟化，直接复用本地主机的操作系统，而传统虚拟机则是在硬件层面实现。

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045294.png)

| 特性 | 容器 | 虚拟机 |
|------|------|--------|
| 启动 | 秒级 | 分钟级 |
| 硬盘使用 | 一般为 MB | 一般为 GB |
| 性能 | 接近原生 | 弱鸡 |
| 系统支持量 | 单机可跑几十个容器 | 单机几个虚拟机 |
| 运行环境 | 主要在 Linux | 主要在 Windows |

**相同：** 容器和虚拟机都是虚拟化技术，具备资源隔离和分配优势。

**不同：**
- 容器虚拟化的是操作系统，虚拟机虚拟化的是硬件
- 传统虚拟机可以运行不同的操作系统，容器主要运行同一类操作系统（Linux）

### 4. Docker 基本概念

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045293.png)

- **宿主机：** 安装 Docker 守护进程的 Linux 服务器，称之为宿主机
- **镜像（Image）：** Docker 镜像相当于一个 root 文件系统，比如官方镜像 `ubuntu:16.04` 就包含了完整的一套 Ubuntu 16.04 最小系统的 root 文件系统
- **容器（Container）：** 镜像运行之后的实体，镜像和容器的关系，就像是面向对象程序设计中的类和对象一样，镜像是静态的定义，容器是镜像运行时的实体。容器可以被创建、启动、停止、删除、暂停等
- **仓库（Repository）：** 仓库可看成一个代码控制中心，用来保存镜像

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045292.png)

### 5. Docker 安装与启动

安装之前进行虚拟机网卡配置：

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045291-1.png)
![](/blog/notes-assets/docker-deploy-practice/file-20260519130045291.png)
![](/blog/notes-assets/docker-deploy-practice/file-20260519130045289.png)
![](/blog/notes-assets/docker-deploy-practice/file-20260519130045288.png)

如果打开 Docker 提示：

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045281.png)

开发人员可以在 Windows 计算机上同时访问 Windows 和 Linux 的强大功能。借助适用于 Linux 的 Windows 子系统（WSL），开发人员可以安装 Linux 分发版（如 Ubuntu、OpenSUSE、Kali、Debian、Arch Linux 等），并在 Windows 上直接使用 Linux 应用程序、实用工具和 Bash 命令行工具。

安装：

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045287.png)

安装成功验证：

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045286.png)

配置镜像加速器：

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045285.png)
![](/blog/notes-assets/docker-deploy-practice/file-20260519130045284.png)

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "registry-mirrors": [
    "https://docker.hpcloud.cloud",
    "https://docker.m.daocloud.io",
    "https://docker.unsee.tech",
    "https://docker.ipanel.live",
    "http://mirrors.ustc.edu.cn",
    "https://docker.chenby.cn",
    "http://mirror.azure.cn",
    "https://dockerpull.org",
    "https://dockerhub.icu",
    "https://hub.rat.dev",
    "https://proxy.ipanel.live",
    "https://docker.ipanel.top",
    "https://docker.m.daocloud.io",
    "https://docker.lms.run",
    "https://docker.ketches.cn"
  ]
}
```

备用配置：

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://dockerproxy.net",
    "https://docker.m.daocloud.io",
    "https://docker.1panel.live"
  ]
}
```

### 6. 常用命令

#### 6.1 镜像相关命令

##### 6.1.1 查看镜像

```bash
docker images
```

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045283.png)

镜像存储在 Docker 宿主机的 `/var/lib/docker` 目录下。

##### 6.1.2 搜索镜像

> 必须确保当前系统能联网。

```bash
docker search 镜像名称
```

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045282.png)

##### 6.1.3 拉取镜像

从 Docker 仓库下载镜像到本地，镜像名称格式为 `名称:版本号`，不指定版本号则拉取最新版。

```bash
docker pull 镜像名称
```

例如，下载 CentOS 7 镜像：

```bash
docker pull centos:7
```

镜像版本可在 Docker Hub 查询：<https://registry.hub.docker.com/>

##### 6.1.4 删除镜像

```bash
## 按 ID 删除
docker rmi 镜像ID

## 删除所有镜像
docker rmi `docker images -q`
```

##### 6.1.5 手动导出和导入镜像

```bash
## 导出镜像
docker save -o tomcat.tar tomcat:latest

## 导入镜像
docker load < tomcat.tar
```

#### 6.2 容器相关命令

##### 6.2.1 查看容器

```bash
## 查看正在运行的容器
docker ps

## 查看所有容器（包括已停止的）
docker ps -a

## 查看最后一次运行的容器
docker ps -l

## 查看已停止的容器
docker ps -f status=exited
```

##### 6.2.2 创建与启动容器

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045279.png)

```bash
docker run 参数 镜像名称:镜像标签 /bin/bash
```

**参数说明：**

| 参数 | 说明 |
|------|------|
| `-i` | 交互式运行容器 |
| `-t` | 分配伪终端（与 `-i` 一起使用创建后自动进入容器） |
| `-d` | 守护式容器（后台运行，不会自动登录） |
| `--name` | 为容器命名 |
| `-v` | 目录映射（宿主机目录:容器目录） |
| `-p` | 端口映射（宿主机端口:容器端口） |

**（1）交互式容器**

```bash
docker run -it --name 容器名称 镜像名称:标签 /bin/bash
```

示例：

```bash
docker run -it --name mytomcat tomcat:latest /bin/bash
```

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045278.png)

退出当前容器：

```bash
exit
```

**（2）守护式容器**

```bash
docker run -id --name=容器名称 镜像名称:标签 /bin/bash
```

示例：

```bash
docker run -i --name mytomcat -d tomcat:latest /bin/bash
```

**（3）登录容器**

```bash
docker exec -it 容器名称（或容器ID） /bin/bash
docker exec -it f7e4b7c9e46b /bin/bash
```

> 登录容器后执行的脚本 `/bin/bash` 必须写。

##### 6.2.3 停止与启动容器

```bash
## 停止容器
docker stop 容器名称（或容器ID）

## 启动容器
docker start 容器名称（或容器ID）
```

完整示例：

```bash
## 搜索镜像
docker search tomcat

## 拉取镜像
docker pull tomcat

## 启动容器
docker run --name mytomcat -d tomcat:latest

## 查看正在运行的容器
docker ps

## 停止容器
docker stop 容器ID

## 查看所有容器（包括退出的）
docker ps -a

## 启动容器
docker start 容器ID

## 进入守护式容器
docker exec -it 容器名称（或容器ID） /bin/bash

## 交互式容器
docker run -it --name=mytomcat2 tomcat:latest /bin/bash
```

##### 6.2.4 查看容器 IP 地址

```bash
docker inspect 容器名称（或容器ID）
```

![](/blog/notes-assets/docker-deploy-practice/file-20260519130045277.png)

直接输出 IP 地址：

```bash
docker inspect --format='{{.NetworkSettings.IPAddress}}' 容器名称（或容器ID）
```

##### 6.2.5 删除容器

> 正在运行的容器无法删除。

```bash
docker rm 容器名称（或容器ID）
```
