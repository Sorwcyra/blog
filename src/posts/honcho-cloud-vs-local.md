---
title: Honcho 接入 Hermes：云端与本地的差别
date: 2026-11-24
summary: Hermes 侧完全无感，差异全在 Honcho 后端。本文用拓扑图、配置差异、费用模型和故障模型说明云端与本地两条路。
tags: [Hermes, Honcho, 架构, 记忆, 部署]
---

## 两种拓扑

**云端 Honcho**

```
[Feishu] ──▶ [Hermes Gateway]
                  │
                  ▼
          [Honcho plugin]
          saveMessages / context
                  │ HTTPS
                  ▼
        [api.honcho.dev]
          ├─ PostgreSQL + pgvector（托管）
          ├─ Deriver（托管）
          └─ LLM（Honcho 计费）
```

**本地 Honcho**

```
[Feishu] ──▶ [Hermes Gateway]
                  │
                  ▼
          [Honcho plugin]
          saveMessages / context
                  │ HTTP
                  ▼
      [localhost:8000]
          ├─ 本地 PostgreSQL + pgvector
          ├─ 本地 Deriver
          └─ LLM API（自有 key 计费）
```

两张图里，Hermes Gateway 到 Honcho plugin 这一段完全相同。分歧从网络地址开始：一个是 `api.honcho.dev`，一个是 `localhost:8000`。

## 配置差异

**云端**

`honcho.json` 不写 `baseUrl`，用 SDK 默认地址；`.env` 里放 `HONCHO_API_KEY`。

**本地**

在 `honcho.json` 的 `hosts.hermes` 里加：

```json
"baseUrl": "http://localhost:8000"
```

本地 Honcho 服务的 `.env` 至少需要：

```env
DB_CONNECTION_URI=postgresql+psycopg://honcho:***@localhost:5432/honcho
VECTOR_STORE_TYPE=pgvector
LLM_OPENAI_API_KEY=***
AUTH_USE_AUTH=false
```

本地鉴权关闭时，`baseUrl` 无 key 也能通过 Hermes 插件的本地地址校验。

## 对应表

| 维度 | 云端 Honcho | 本地 Honcho + 云端 LLM |
| --- | --- | --- |
| 数据位置 | Honcho 服务器 | 本机 PostgreSQL |
| Hermes 改动 | 无 | 加 `baseUrl`，重启网关 |
| 常驻进程 | 0 | API + Deriver + PostgreSQL |
| 本机内存 | 0 | 约 1–2 GB |
| 本机显存 | 0 | 0（LLM 仍在云端） |
| 消息写入费 | $2 / 1M tokens | 0 |
| context 读取 | 免费无限 | 免费无限 |
| 深度推理费 | Honcho 按次计费 | 自有 LLM 按 token 计费 |
| 运维责任 | 服务商承担 | 数据库、进程、备份自理 |
| 故障域 | 网络 / 服务商 | 本机进程 / 磁盘 |
| 数据留存 | 异地 | 同机 |
| Windows 支持 | 原生可用 | 上游不支持；需 fork / WSL / Docker |

## 费用模型

云端把成本拆成三块：

- 写入：$2 / 100 万新 token
- 读取：`context()` 免费、无限，约 200ms
- 推理：`chat()` 按级别收费，minimal 到 max 分别约 $0.001 到 $0.50 每次

实际账单的大头通常不是写入，而是 `dialecticCadence=1` 加长消息自动升级推理级别带来的 `chat()` 调用。控制成本应优先调低推理频率和级别，而不是急着换架构。

本地把 Honcho 的写入费和推理费换成了自有 LLM provider 的 token 费。数据库、API、Deriver 不产生云账单，但会占用本机内存并要求常驻。总拥有成本要算上运维时间。

## 故障模型

Hermes 侧是 fail-open：Honcho 不可用时对话继续，只是不写、不读记忆。

- 云端故障：网络断开或服务端异常，写入失败；恢复后取决于插件重试与队列
- 本地故障：API 或 Deriver 进程退出、Postgres 未启动、磁盘异常
- Deriver 暂停不会丢消息：消息进队列，进程恢复后继续处理
- 本地数据库损坏会直接影响记忆数据，备份责任完全在本地

本地部署把“数据离机”换成了“数据同机”，同时也把磁盘故障重新拉回故障域。这一点在设备存在锁盘、加密恢复或单点磁盘风险时尤其需要权衡。

## 选型边界

**选云端**：

- 对话量中等，不想维护数据库和常驻进程
- 希望数据不落在单台设备上
- 使用原生 Windows
- 优先保证开箱可用

**选本地**：

- 写入量足够大，Honcho 账单明显高于自有 LLM 成本
- 有数据本地化或合规要求
- 已有 Linux / WSL / Docker 环境，能承担 PostgreSQL 运维
- 能接受自建备份与恢复演练
