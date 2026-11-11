---
title: 'Dify 私有化部署：Docker Compose 全流程'
date: 2026-10-19
summary: '从系统要求、环境变量到容器编排与模型接入，一步步把 Dify 部署到自己的服务器上。'
tags: ['Dify', 'Docker', '部署']
origin: 'Dify Docker部署.md'
---
> Dify 是一个开源的 LLM 应用开发平台，提供从 Agent 构建到 AI 工作流编排的全套能力。  
> 官方仓库：<https://github.com/langgenius/dify>
---
### 一、环境准备

#### 1.1 系统要求

| 组件             | 要求                                |
| -------------- | --------------------------------- |
| 操作系统           | Linux / macOS / Windows（推荐 Linux） |
| CPU            | 2 核及以上                            |
| 内存             | 4 GB 及以上（推荐 8 GB）                 |
| 磁盘             | 20 GB 可用空间                        |
| Docker         | 20.10+                            |
| Docker Compose | V2 及以上                            |

#### 1.2 安装 Docker 及 Docker Compose

**Linux（Ubuntu/Debian）：**

```bash
## 安装 Docker
curl -fsSL https://get.docker.com | bash

## 启动 Docker 服务
sudo systemctl enable docker --now

## 验证安装
docker --version
docker compose version
```

**Windows / macOS：**

下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，确保 Docker Compose V2 已启用。

---

### 二、Docker 部署 Dify

#### 2.1 下载 Dify 源码

```bash
## 克隆官方仓库
git clone https://github.com/langgenius/dify.git

## 或手动下载 ZIP 包后解压
## 下载地址：https://github.com/langgenius/dify/archive/refs/heads/main.zip
```
![](/blog/notes-assets/dify-docker-deploy/file-20260519130936840.png)
#### 2.2 进入 Docker 部署目录

```bash
cd dify/docker
```

#### 2.3 配置环境变量

```bash
## 复制环境变量模板
cp .env.example .env
```

`.env` 文件中包含了 Dify 运行所需的所有配置项，主要包括：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SECRET_KEY` | 应用密钥（需自行生成） | 随机生成 |
| `POSTGRES_PASSWORD` | 数据库密码 | `difyai123456` |
| `REDIS_PASSWORD` | Redis 密码 | `difyai123456` |
| `LOG_LEVEL` | 日志级别 | `INFO` |
| `NGINX_PORT` | Nginx 对外端口 | `80` |

> **注意**：生产环境部署时务必修改所有默认密码，并生成唯一的 `SECRET_KEY`。
![692](/blog/notes-assets/dify-docker-deploy/file-20260519130936843.png)
![](/blog/notes-assets/dify-docker-deploy/file-20260519130936845.png)
#### 2.4 启动服务

```bash
## 后台启动所有服务
docker compose up -d

## 查看启动日志
docker compose logs -f

## 查看服务运行状态
docker compose ps
```
![](/blog/notes-assets/dify-docker-deploy/file-20260519130936861.png)
![692](/blog/notes-assets/dify-docker-deploy/file-20260519130936863.png)
启动
![](/blog/notes-assets/dify-docker-deploy/file-20260519130936865.png)
#### 2.5 验证部署

等待所有服务状态变为 `Up` 后，在浏览器访问：

```
http://localhost
```

如果看到 Dify 的初始化页面，说明部署成功。

#### 2.6 Dify 服务组件说明

| 服务 | 说明 | 默认端口 |
|------|------|----------|
| `nginx` | 反向代理 | 80 |
| `api` | Dify API 服务 | 5001 |
| `worker` | 异步任务处理 | — |
| `web` | 前端页面 | 3000 |
| `db` | PostgreSQL 数据库 | 5432 |
| `redis` | 缓存与消息队列 | 6379 |
| `weaviate` | 向量数据库 | 8080 |

#### 2.7 常用管理命令

```bash
## 停止服务
docker compose down

## 停止服务并删除数据卷（会清空数据）
docker compose down -v

## 重启服务
docker compose restart

## 更新到最新版本
git pull
docker compose pull
docker compose up -d

## 查看各服务资源占用
docker stats
```

---

### 三、Dify 初始化配置

#### 3.1 进入安装页面

浏览器访问：

```
http://localhost/install
```

#### 3.2 设置管理员账号

填写以下信息：

- **邮箱**：管理员登录邮箱
- **密码**：管理员密码
- **公司/组织名称**：可选

提交后等待初始化完成。
![](/blog/notes-assets/dify-docker-deploy/file-20260519130936866.png)
#### 3.3 登录 Dify

使用刚才设置的管理员账号登录：

```
http://localhost/signin
```

登录后进入 Dify 主界面。

---

### 四、配置模型供应商（Ollama）

Dify 本身不提供 LLM 模型，需要对接外部模型供应商。以下以 **Ollama**（本地模型）为例。

#### 4.1 前提条件

确保已部署 Ollama 服务并拉取了所需模型：

```bash
## 安装 Ollama（Linux / macOS）
curl -fsSL https://ollama.com/install.sh | sh

## 拉取模型（以 qwen2.5:7b 为例）
ollama pull qwen2.5:7b

## 启动 Ollama 服务（默认监听 11434 端口）
ollama serve
```

#### 4.2 在 Dify 中添加模型供应商

1. 点击右上角**头像** → **设置**
2. 在左侧菜单选择**模型供应商**
3. 找到 **Ollama** 并点击**添加模型**

#### 4.3 配置参数

| 参数 | 说明 | 示例值 |
|------|------|--------|
| 模型名称 | Ollama 中的模型名 | `qwen2.5:7b` |
| 基础 URL | Ollama 服务地址 | `http://host.docker.internal:11434` |
| 上下文大小 | 模型上下文窗口（token） | `4096` |
| 最大 token 上限 | 单次生成最大 token 数 | `2048` |
| 是否支持 Vision | 是否支持图片输入 | 按模型能力勾选 |

> **关于 `host.docker.internal`**：这是 Docker 容器访问宿主机服务的特殊 DNS 名称。  
> - **Windows / macOS**：可直接使用  
> - **Linux**：需在 `docker compose` 中额外配置 `extra_hosts`，或使用宿主机内网 IP

#### 4.4 Linux 额外配置

如果在 Linux 上运行 Docker 且无法使用 `host.docker.internal`，需要编辑 `docker/docker-compose.yml`，在 `api` 和 `worker` 服务下添加：

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

然后重启：

```bash
docker compose down
docker compose up -d
```

---

### 五、创建应用并设置模型

#### 5.1 创建应用

1. 点击首页 **创建应用**
2. 选择应用类型：
   - **聊天助手**（Chatbot）：对话式交互
   - **文本生成**（Text Generator）：单次文本生成
   - **Agent**：支持工具调用的智能代理
   - **工作流**（Workflow）：可视化 AI 工作流编排
3. 填写应用名称和描述

#### 5.2 选择模型

1. 进入应用编辑页面
2. 在右上角选择已配置的 Ollama 模型（如 `qwen2.5:7b`）
3. 调整模型参数：
   - **温度**（Temperature）：控制随机性，0~1
   - **Top P**：核采样参数
   - **最大 Token**：生成长度上限
4. 可设置**提示词**（System Prompt）来定义 AI 的行为

---

### 六、测试对话

在应用编辑界面右侧的预览窗口，可以直接输入消息进行测试：

- 检查模型是否正常响应
- 调整提示词和参数以获得最佳效果
- 确认上下文记忆是否正常

---

### 七、构建本地知识库

Dify 支持将文档上传作为知识库（Knowledge Base），让 AI 基于私有数据进行问答。

#### 7.1 创建知识库

1. 点击顶部导航栏的**知识库**
2. 点击**创建知识库**
3. 选择导入方式：
   - **上传文件**：本地文档
   - **同步 Notion**：从 Notion 导入
   - **网页抓取**：从 URL 抓取内容

#### 7.2 上传文档

支持的文档格式：

| 格式 | 说明 |
|------|------|
| TXT | 纯文本 |
| PDF | 电子文档 |
| DOCX | Word 文档 |
| HTML | 网页文件 |
| Markdown | MD 文档 |
| CSV | 表格数据 |

上传完成后，Dify 会自动进行：

1. **文本分段**：将长文档切分成合理大小的片段
2. **向量化**：使用嵌入模型将文本转为向量
3. **索引存储**：存入向量数据库（Weaviate）

#### 7.3 设置检索参数

知识库创建完成后可配置：

| 参数 | 说明 | 推荐值 |
|------|------|--------|
| 分段长度 | 每段文本的最大字符数 | `500` |
| 分段重叠 | 相邻段的重叠字符数 | `50` |
| 检索方式 | 向量检索 / 全文检索 / 混合检索 | 混合检索 |
| Top K | 检索返回的相关段落数 | `3` |
| 召回阈值 | 相关性最低分数 | `0.5` |

---

### 八、知识库接入应用

#### 8.1 在应用中引用知识库

1. 进入**应用编辑**页面
2. 点击左侧**上下文**（Context）或**功能**面板
3. 选择**添加知识库**
4. 勾选已创建的知识库并确认

#### 8.2 配置检索策略

- **检索模式**：
  - N 选 1 召回：每次只取最相关的一段
  - 多路召回：同时检索多个知识库
- **引用标注**：开启后 AI 会标注回答来源，增强可信度

#### 8.3 测试知识库问答

在预览对话框中提问与知识库相关的问题，验证：

- AI 是否能正确检索到相关信息
- 回答是否引用知识库内容
- 引用来源是否正确标注

---

### 九、发布与集成方式

应用编排完成后，点击右上角的**发布**按钮。Dify 提供三种集成方式：

#### 9.1 直接运行（独立页面）

发布后生成一个独立的 Web 应用 URL，用户可以直接在浏览器中访问并使用该 AI 应用。

#### 9.2 嵌入网站

三种嵌入方式：

- **iframe 嵌入**：将 AI 应用以 iframe 形式嵌入到已有网站中
- **Script 脚本嵌入**：复制一段 JavaScript 代码到网站中
- **浏览器插件**：通过 Dify 浏览器插件集成

示例（iframe）：

```html
<iframe
  src="https://your-dify-domain/app/xxxxx"
  style="width: 100%; height: 100%; min-height: 600px"
  frameborder="0"
></iframe>
```

#### 9.3 API 访问

Dify 为每个应用生成独立的 API 凭证，可通过 RESTful API 将 AI 能力集成到其他产品中。

**API 调用示例：**

```bash
## 获取 API 密钥：应用设置 → API 访问
export API_KEY="app-xxxxxxxxxxxx"

## 发送聊天消息
curl -X POST "http://localhost/api/v1/chat-messages" \
  --header "Authorization: Bearer $API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "inputs": {},
    "query": "你好，请介绍一下你自己",
    "response_mode": "blocking",
    "conversation_id": "",
    "user": "user-001"
  }'
```

---

### 十、常见问题与排错

#### 10.1 端口冲突

如果 80 端口已被占用，修改 `.env` 文件：

```
NGINX_PORT=8080
```

然后重启服务。

#### 10.2 Ollama 连接失败

**症状**：Dify 无法连接到 Ollama

**排查步骤**：

1. 确认 Ollama 服务在运行：`ollama list`
2. 确认宿主机可访问：`curl http://localhost:11434`
3. 在 Dify 容器内测试连通性：
   ```bash
   docker exec -it dify-api-1 curl http://host.docker.internal:11434
   ```
4. Linux 系统检查 `extra_hosts` 配置是否正确

#### 10.3 服务启动失败

**排查方法**：

```bash
## 查看具体服务的日志
docker compose logs api
docker compose logs worker
docker compose logs db

## 检查端口占用
netstat -tlnp | grep -E "80|5432|6379"

## 重置数据（注意数据会丢失）
docker compose down -v
docker compose up -d
```

#### 10.4 知识库文档处理失败

- 检查文档格式是否受支持
- 确认嵌入模型配置正确
- 查看 worker 日志是否有异常

#### 10.5 更新 Dify 版本

```bash
cd dify
git pull origin main
cd docker
docker compose pull
docker compose up -d
```

> 升级前建议备份数据库：`docker compose exec db pg_dump -U dify dify > backup.sql`

#### 10.6 性能优化

- 调整 PostgreSQL 和 Redis 的内存限制
- 根据实际负载调整 worker 副本数
- 使用 SSD 存储向量数据库
- 生产环境建议配置 HTTPS 和反向代理缓存

---

### 附录

#### A. 参考链接

- [Dify 官方文档](https://docs.dify.ai/)
- [Dify GitHub 仓库](https://github.com/langgenius/dify)
- [Ollama 官方仓库](https://github.com/ollama/ollama)
- [Docker 官方文档](https://docs.docker.com/)

#### B. Docker Compose 常用命令速查

| 命令 | 说明 |
|------|------|
| `docker compose up -d` | 后台启动服务 |
| `docker compose down` | 停止并删除容器 |
| `docker compose logs -f` | 实时查看日志 |
| `docker compose ps` | 查看服务状态 |
| `docker compose pull` | 拉取最新镜像 |
| `docker compose restart` | 重启所有服务 |
| `docker compose exec <service> <cmd>` | 在服务容器内执行命令 |
