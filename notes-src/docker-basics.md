## Docker 基础篇学习笔记

> 来源：[Docker基础篇 - mynamelancelot](https://mynamelancelot.github.io/docker/docker-%E5%9F%BA%E7%A1%80%E7%AF%87.html)  
> 日期：2026-06-15

---

### 一、简介

Docker 是 **PaaS**（Platform as a Service）提供商 dotCloud 开源的一个基于 **LXC**（Linux Container）的高级容器引擎，源代码托管在 GitHub 上，基于 Go 语言并遵从 Apache 2.0 协议开源。

**核心目标：** "Build and Run Any App, Anywhere" —— 一次封装，到处运行。

---

### 二、虚拟化技术

#### 1. 虚拟机技术（VM）
- 物理硬件层抽象，将一台服务器虚拟成多台
- 每个 VM 包含完整的操作系统、应用、二进制文件和库资源
- **缺点：** 占用空间大、启动慢

#### 2. 容器虚拟化技术
- 应用层抽象，将代码和依赖打包在一起
- 多个容器共享操作系统内核，作为独立进程运行
- **优点：** 镜像仅几十MB、瞬间启动

---

### 三、Docker 三要素

| 要素 | 说明 |
|------|------|
| **镜像（Image）** | 只读模板，一个镜像可创建多个容器 |
| **容器（Container）** | 镜像的运行实例，可启动/停止/删除，相互隔离 |
| **仓库（Repository）** | 集中存放镜像的场所，含多个仓库→镜像→标签 |

> Docker 本身是容器运行载体，把应用和配置打包成可交付的运行环境（镜像），根据镜像生成容器实例。

---

### 四、YUM 安装 Docker

```bash
## 1. 卸载旧组件，安装依赖
yum remove docker docker-client docker-common docker-engine
yum -y install gcc gcc-c++

## 2. 安装Docker仓库（阿里云源）
yum install -y yum-utils device-mapper-persistent-data lvm2
yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

## 3. 安装Docker-CE并启动
yum makecache fast
yum -y install docker-ce
systemctl start docker

## 4. 配置镜像加速器
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-EOF
{
  "registry-mirrors": ["自己的阿里云加速器地址"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker

## 5. 验证
docker run hello-world
```

---

### 五、常用命令

#### 帮助命令
```bash
docker version      # 查看版本
docker info         # 查看详细信息
docker --help       # 命令帮助
```

#### 镜像命令
```bash
docker images -a          # 列出所有镜像（包括中间层）
docker images -q          # 只列镜像ID
docker search [镜像名] --filter=stars=3   # 搜索镜像
docker pull [镜像名]:[Tag]                    # 拉取镜像
docker rmi -f $(docker images -qa)            # 删除所有镜像
docker commit -a="作者" -m="描述" [容器ID] 名称:Tag  # 提交容器为镜像
docker save [镜像名]:[Tag] -o /path/name.tar  # 导出镜像
docker load -i name.tar                       # 加载镜像
```

#### 容器命令

##### 运行容器
```bash
docker run [选项] [镜像名]:[Tag]

## 常用参数
-i          # 交互模式
-t          # 分配伪终端（与-i合用 -it）
-p          # 端口映射 hostPort:ContainerPort
-P          # 随机端口映射
-d          # 后台运行
--name      # 容器命名
--restart=always  # Docker启动时自动启动容器
-h name     # 设置主机名
--rm        # 容器停止时自动删除
```

##### 容器管理
```bash
docker ps -a          # 列出所有容器
docker start/restart/stop [容器ID]  # 启停容器
docker kill [容器ID]  # 强制停止
docker rm -f [容器ID] # 删除容器
docker rm -f $(docker ps -qa)  # 删除所有容器
```

##### 容器信息
```bash
docker logs -f -t [容器ID]    # 查看日志（-f实时，-t时间戳）
docker top [容器ID]           # 查看容器进程
docker inspect [容器ID]       # 查看容器内部细节
docker stats [容器ID]         # 查看容器资源占用
docker cp [容器ID]:容器路径 本机路径  # 拷贝文件
```

##### 进入容器
```bash
docker attach [容器ID]        # 重新进入容器（退出即停止）
docker exec -it [容器ID] /bin/bash  # 进入执行命令（退出不停止容器）
```

##### 退出容器
- `exit` → 容器停止退出
- `Ctrl+P+Q` → 容器不停止退出

#### 容器运行机制
容器后台运行必须有前台进程，若命令不会挂起（如 top），容器会自动退出。最佳方案是将程序以前台进程形式运行。

---

### 六、Docker Compose

容器编排工具，在 YAML 文件中定义一组相关联的容器，支持启动优先级排序。

#### 常用命令
| 命令 | 说明 |
|------|------|
| `-f` | 指定 YAML 文件位置 |
| `ps` | 显示容器所有信息 |
| `start/stop/restart` | 启动/停止/重启容器 |
| `logs` | 查看日志 |
| `config -q` | 验证 YAML 是否正确 |
| `up -d` | 启动容器项目 |
| `pause/unpause` | 暂停/恢复 |
| `rm` | 删除容器 |

#### 示例
```yaml
version: '3'
services:
  db:
    image: 'mysql:5.7'
    restart: 'always'
    environment:
      MYSQL_ROOT_PASSWORD: 'root'
      MYSQL_DATABASE: 'wordpress'
      MYSQL_USER: 'wordpress'
      MYSQL_PASSWORD: 'wordpress'
  wordpress:
    depends_on:
      - db
    image: 'wordpress:latest'
    restart: 'always'
    ports:
      - '8080:80'
    environment:
      WORDPRESS_DB_HOST: 'db:3306'
      WORDPRESS_DB_USER: 'wordpress'
      WORDPRESS_DB_PASSWORD: 'wordpress'
```

---

### 七、镜像加载原理

#### UnionFS 联合文件系统
- 分层、轻量级、高性能文件系统
- 支持修改作为提交逐层叠加
- 不同目录可挂载到同一虚拟文件系统

#### Docker 镜像结构
```
┌─────────────────────┐
│   bootfs (引导文件系统) │  bootloader + kernel
├─────────────────────┤
│   rootfs (根文件系统)   │  Ubuntu/CentOS等发行版
├─────────────────────┤
│   Union Mount layers  │  多层 read-only rootfs
├─────────────────────┤
│   容器层 (rw)         │  创建容器时分配的读写层
└─────────────────────┘
```

- **bootfs：** 包含 boot loader 和 kernel，引导完成后卸载
- **rootfs：** 包含 /dev、/proc、/bin、/etc 等标准目录
- Docker 精简 OS 只需提供 rootfs，内核直接使用宿主机
- 不同 Linux 发行版可共用 bootfs

---

### 八、容器数据卷

#### 作用
- **数据共享** 和 **数据持久化**
- 独立于联合文件系统，不受容器删除影响

#### 特点
1. 可在容器间共享或重用
2. 更改直接生效
3. 更改不包含在镜像更新中
4. 生命周期持续到无容器使用

#### 使用方式

##### 1. 命令挂载
```bash
docker run -v [宿主机绝对路径]:[容器绝对路径] [镜像ID]
docker run -v [宿主机绝对路径]:[容器绝对路径]:ro [镜像ID]  # 只读
```

##### 2. Dockerfile 创建
```dockerfile
VOLUME ["/容器路径1", "/容器路径2"]
```

##### 3. 数据卷容器
```bash
docker run --volumes-from [数据卷容器名称] [镜像名称]
```

> 宿主机删除挂载目录 → 容器变为只读，恢复后仍无效

---

### 九、Dockerfile

#### 基础知识
- 保留字指令大写，至少跟随一个参数
- 从上到下顺序执行，每行创建新镜像层
- `#` 表示注释
- 最多不超过 128 层

#### 保留关键字

| 关键字 | 描述 |
|--------|------|
| `FROM` | 基础镜像 |
| `LABEL` | 镜像维护者信息 |
| `RUN` | 执行 Shell 命令 |
| `EXPOSE` | 暴露端口（仅显示作用） |
| `WORKDIR` | 终端登录后工作目录 |
| `ENV` | 设置环境变量 |
| `ADD` | 拷贝文件并解压（与Dockerfile同级） |
| `COPY` | 拷贝文件（与Dockerfile同级） |
| `VOLUME` | 创建数据卷 |
| `CMD` | 容器启动命令，会被 docker run 参数替换 |
| `ENTRYPOINT` | 容器启动命令，追加而非替换 |
| `ONBUILD` | 被子镜像继承时触发 |

#### CMD vs ENTRYPOINT
```dockerfile
## ENTRYPOINT - 可追加参数
ENTRYPOINT ["curl", "-s", "https://ip.cn"]
## docker run [镜像] -i → curl -s https://ip.cn -i

## CMD - 会被替换
CMD ["curl", "-s", "https://ip.cn"]
```

#### 示例：自定义 Tomcat
```dockerfile
FROM centos
ADD jdk-8u191-linux-x64.tar.gz /opt/
RUN mv /opt/jdk1.8.0_191 /opt/jdk8
ENV PATH=$PATH:/opt/jdk8/bin
ENV JAVA_HOME=/opt/jdk8

ADD apache-tomcat-8.5.35.tar.gz /opt/
RUN mv /opt/apache-tomcat-8.5.35 /opt/tomcat
ENV CATALINA_HOME=/opt/tomcat
WORKDIR $CATALINA_HOME
EXPOSE 8080

CMD /opt/tomcat/bin/startup.sh start && tail -f /opt/tomcat/logs/catalina.out
```

---

### 十、镜像仓库搭建

#### 官方 Registry 方式
```bash
## 服务端
docker run -d -v /data/registry:/var/lib/registry -p 5000:5000 --restart=always registry

## 修改 daemon.json（两端都要）
{
  "insecure-registries": ["仓库端IP:5000"]
}
systemctl restart docker

## 查看仓库
curl -XGET http://registryIP:5000/v2/_catalog

## 打包上传
docker tag SOURCE_IMAGE:TAG registryIP:5000/library/TARGET_IMAGE:TAG
docker push registryIP:5000/library/TARGET_IMAGE:TAG
```

#### Harbor 仓库
1. 构建 SSL 证书
2. 修改 `harbor.yml`（hostname、https、证书路径）
3. 执行 `./install.sh`
4. 访问 `https://ip/harbor/projects`，默认 admin/Harbor12345

---

### 十一、网络设置

#### 网络通讯原理
- 容器间 → Docker 网桥（类似交换机）
- 容器访问外网 → SNAT 转换
- 外网访问容器 → DNAT 转换

#### 网络模式
| 模式 | 说明 |
|------|------|
| `bridge` | 默认网桥模式 |
| `none` | 无网络栈 |
| `container` | 复用其他容器网络栈 |
| `host` | 使用宿主机网络，无独立网络栈 |

#### 端口映射格式
```bash
-p :<ContainerPort>            # 动态主机端口
-p <HostPort>:<ContainerPort>   # 指定主机端口
-p <IP>::<ContainerPort>        # 指定IP动态端口
-p <IP>:<HostPort>:<ContainerPort>  # 指定IP和端口
-P (大写)                       # 暴露所有EXPOSE端口到随机端口
```

#### 自定义网络（隔离）
```bash
docker network create -d bridge \
  --subnet "172.26.10.0/16" \
  --gateway "172.26.10.1" \
  netName

docker run -d --network=netName [imageName]
```

---

### 十二、内存 & CPU 限制

Docker 底层使用 **CGroup** 进行资源限制。

#### 内存限制
| 参数 | 说明 |
|------|------|
| `-m` | 最大内存（单位M） |
| `--memory-swap` | swap 大小 |
| `--memory-swappiness` | swap 比例 0-100 |
| `--memory-reservation` | 内存软限制 |
| `--oom-kill-disable` | 禁用 OOM 杀容器 |

#### CPU 限制
| 参数 | 说明 |
|------|------|
| `--cpuset-cpus` | 指定CPU核心，如 "0,1,1-3" |
| `-c, --cpu-shares` | CPU权重，默认1024 |
| `--cpu-period` | 调度周期（微秒） |
| `--cpu-quota` | 每个周期可用时间（微秒） |

```bash
## 使用2块CPU
docker run -it --cpu-period=10000 --cpu-quota=20000 centos /bin/bash
```

---

### 十三、Docker 安装 MySQL / Redis

#### MySQL
```bash
docker pull mysql:5.7
docker run -p3306:3306 \
  -v /root/mysql/log/mysqld.log:/logs \
  -v /root/mysql/data:/var/lib/mysql \
  -v /root/mysql/conf/my.cnf:/etc/mysql/my.conf \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -d mysql:5.7
```

#### Redis
```bash
docker pull redis
docker run -p6379:6379 \
  -v /root/redis/conf/redis.conf:/usr/local/etc/redis.conf \
  -v /root/redis/data:/data \
  --privileged=true \
  -it redis redis-server /usr/local/etc/redis.conf
```

> Redis 注意：redis.conf 中 dir 要有权限、注释 bind、protected-mode 改为 no

---

### 附：名词解释

#### IaaS / PaaS / SaaS
- **IaaS**（基础设施即服务）：提供计算、存储、网络等基础设施
- **PaaS**（平台即服务）：提供应用开发和运行平台
- **SaaS**（软件即服务）：直接提供应用软件

#### LXC（Linux Container）
由两项内核机制保证：
- **Namespace**：资源隔离（uts/pid/ipc/mnt/net/user 共6种）
- **Cgroup**：资源控制

##### Cgroup 概念
| 术语 | 说明 |
|------|------|
| **Subsystem** | 内核模块（资源控制器），如CPU、内存 |
| **Hierarchy** | Cgroup 树，节点为进程组 |

#### 容器状态转换
Created → Running → Paused → Resumed → Stopped → Deleted
