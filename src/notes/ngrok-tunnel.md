---
title: 'ngrok 内网穿透：把本地服务暴露到公网'
date: 2026-05-26
summary: '临时演示、前后端联调、答辩展示的常用手段，含免费版的限制与常见故障排查。'
tags: ['工具', '内网穿透', '调试']
origin: 'ngrok内网穿透.md'
---
### 一、作用说明

把本地项目（`localhost:端口`）暴露成**公网链接**，让外网任何人都可以访问你的本地 Demo、项目、接口。

适合：临时演示项目、前后端联调、外网测试、答辩展示项目。

### 二、核心特点（必记）

- **PowerShell / CMD 窗口不能关**：一关穿透立刻断开，外网无法访问
    
- **免费版每次重启域名都会变**：只适合临时演示，不适合长期使用
    
- 穿透只是转发流量，**本地项目必须先启动成功**才能访问
    

### 三、Windows 完整安装配置流程

#### 1. 一键命令安装 Ngrok

PowerShell 执行：

```Plain
## 创建目录
md C:\ngrok
cd C:\ngrok

## 下载官方最新版
Invoke-WebRequest -Uri "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip" -OutFile ngrok.zip

## 解压
Expand-Archive .\ngrok.zip -DestinationPath .
```

#### 2. 绑定个人 Token（关键）

官网获取自己的 Token：[https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)

PowerShell 执行（替换为自己的 Token）：

```Plain
.\ngrok.exe config add-authtoken 你的Token
```

出现 `Authtoken saved` 即为成功。

#### 3. 启动内网穿透

通用格式（替换端口）：

```Plain
.\ngrok.exe http 端口号
```

你的项目（5000端口）专用命令：

```Plain
.\ngrok.exe http 5000
```

### 四、成功运行识别标准

出现以下内容就是**完全穿透成功**：

```Plain
Session Status                online
Forwarding                    https://xxx.ngrok-free.dev -> http://localhost:5000
```

把 **https 开头的链接**发给别人即可访问你的本地项目。

### 五、本地管理面板

穿透启动后，可打开后台查看访问记录、请求、报错：

`http://127.0.0.1:4040`

### 六、常见报错 & 解决方案（你踩过的坑）

#### 1. 无法识别 ngrok 命令

报错：`无法将“ngrok”项识别为 cmdlet`

原因：未进入对应目录 / 未配置环境变量

解决：必须用：`.\ngrok.exe http 5000`

#### 2. ERR_NGROK_107 Token 无效

原因：Token 过期、错误、被重置

解决：清空旧 Token，重新绑定新的：

```Plain
.\ngrok.exe config clear
.\ngrok.exe config add-authtoken 新Token
```

### 七、永久全局使用（可选）

管理员 PowerShell 执行一次，之后任意窗口可直接用 `ngrok` 命令：

```Plain
[Environment]::SetEnvironmentVariable("Path", "$env:Path;C:\ngrok", "Machine")
```

执行后**重启终端**生效。

### 八、日常快速启动模板

以后想用直接两行命令搞定：

```Plain
cd C:\ngrok
.\ngrok.exe http 5000
```

```shell
ngrok http 项目端口号
```
