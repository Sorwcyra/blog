### 一、全局配置（每台机器只需执行一次）

```bash
git config --global init.defaultBranch main
git config --global user.name "你的 GitHub 用户名"
git config --global user.email "你的 GitHub 邮箱"
```

---

### 二、新项目推送到 GitHub

#### 2.1 GitHub 端操作

1. 右上角 **+ → New repository**
2. 仓库名与本地项目文件夹同名
3. **不要勾选** README、.gitignore、LICENSE
4. 点击 **Create repository**
5. 复制仓库的 **SSH 地址**

```
git@github.com:用户名/项目名.git
```

#### 2.2 本地操作

```bash
## 初始化 Git 仓库
git init

## 关联远程仓库（替换为实际地址）
git remote add origin git@github.com:用户名/项目名.git

## 暂存所有文件并提交
git add .
git commit -m "修改说明"

git pull
## 推送到远程 main 分支
git push -u origin main
```

---

### 三、日常开发流程

```bash
git add .                 # 暂存更改
git commit -m "提交说明"   # 提交到本地仓库
git pull
git push                  # 推送到远程
```

---

### 四、分支操作

#### 4.1 创建并切换到新分支

```bash
git checkout -b feature-branch
```

#### 4.2 切换分支

```bash
git checkout main
```

#### 4.3 合并分支

```bash
## 先切回目标分支
git checkout main

## 合并功能分支
git merge feature-branch
```

#### 4.4 删除分支

```bash
## 删除本地分支
git branch -d feature-branch

## 删除远程分支
git push origin --delete feature-branch
```

---

### 五、同步与更新

#### 5.1 拉取远程最新代码

```bash
git pull
```

#### 5.2 拉取并合并（等价于 git fetch + git merge）

```bash
git pull origin main
```

#### 5.3 查看远程仓库信息

```bash
git remote -v
```

---

### 六、撤销与回退

#### 6.1 撤销工作区修改（未暂存）

```bash
git checkout -- <file>
```

#### 6.2 撤销暂存区修改（已 git add）

```bash
git reset HEAD <file>
```

#### 6.3 回退到某个提交（保留更改）

```bash
git reset --soft HEAD~1
```

#### 6.4 回退到某个提交（丢弃更改）

```bash
git reset --hard HEAD~1
```

> `HEAD~1` 表示回退一个版本，`HEAD~2` 回退两个版本。

---

### 七、查看状态与历史

```bash
git status          # 查看当前仓库状态
git log             # 查看提交历史
git log --oneline   # 简洁版提交历史
git diff            # 查看工作区与暂存区的差异
```

---

### 八、常见问题

#### 8.1 推送被拒绝（non-fast-forward）

远程有本地没有的提交，需要先拉取再推送：

```bash
git pull --rebase origin main
git push
```

#### 8.2 提交信息写错了

```bash
git commit --amend -m "正确的提交信息"
```

#### 8.3 配置 SSH Key

```bash
## 生成 SSH Key
ssh-keygen -t ed25519 -C "your_email@example.com"

## 查看公钥
cat ~/.ssh/id_ed25519.pub
```

将输出的公钥添加到 GitHub: **Settings → SSH and GPG keys → New SSH key**

---

### 九、命令速查表

| 场景 | 命令 |
|------|------|
| 初始化仓库 | `git init` |
| 关联远程 | `git remote add origin <url>` |
| 暂存更改 | `git add .` |
| 提交 | `git commit -m "说明"` |
| 推送 | `git push` |
| 拉取 | `git pull` |
| 查看状态 | `git status` |
| 查看历史 | `git log --oneline` |
| 创建分支 | `git checkout -b <name>` |
| 合并分支 | `git merge <name>` |
