## MongoDB Docker 部署

### 概述

使用 Docker 快速部署 MongoDB 数据库，支持身份认证。

### 部署步骤

#### 1. 拉取 MongoDB 镜像

```bash
docker pull registry.cn-hangzhou.aliyuncs.com/mkmk/mongodb:4.2.2
```

#### 2. 创建并启动容器

```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=yourpassword \
  --name mongo \
  registry.cn-hangzhou.aliyuncs.com/mkmk/mongodb:4.2.2 \
  --auth
```

#### 3. 参数说明

| 参数 | 说明 |
|------|------|
| `-p 27017:27017` | 将容器 27017 端口映射到宿主机 27017 端口 |
| `-e MONGO_INITDB_ROOT_USERNAME` | 初始化 root 用户名 |
| `-e MONGO_INITDB_ROOT_PASSWORD` | 初始化 root 用户密码 |
| `--name mongo` | 容器名称 |
| `--auth` | 启用身份认证（必须指定） |

#### 4. 验证部署

```bash
docker ps
```

确认容器状态为 `Up`。

#### 5. 客户端连接

使用 Robo 3T 或其他 MongoDB 客户端连接：

![](/blog/notes-assets/mongodb-docker/file-20260519130840799.png)
![](/blog/notes-assets/mongodb-docker/file-20260519130849455.png)

- **主机：** 宿主机 IP
- **端口：** 27017
- **认证方式：** 用户名/密码
- **用户名：** 设置的 root 用户名
- **密码：** 设置的 root 密码

### 快捷命令汇总

```bash
## 拉取镜像
docker pull registry.cn-hangzhou.aliyuncs.com/mkmk/mongodb:4.2.2

## 启动容器
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=gxa \
  -e MONGO_INITDB_ROOT_PASSWORD=gxa123456 \
  --name mongo \
  registry.cn-hangzhou.aliyuncs.com/mkmk/mongodb:4.2.2 \
  --auth

## 查看运行状态
docker ps
```

### 常见问题

- `--auth` 参数必须添加，否则不启用身份认证
- 生产环境务必修改默认密码
- 建议挂载数据卷防止数据丢失
