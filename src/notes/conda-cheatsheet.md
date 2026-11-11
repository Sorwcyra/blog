---
title: 'conda 常用操作速查'
date: 2026-06-07
summary: '环境创建、激活、导出与清理，Python 多版本管理最常用的那十条命令。'
tags: ['Python', '环境', '速查']
origin: 'conda操作.md'
---
## conda 操作指南

### 1. 展示虚拟环境
```bash
conda env list
```

### 2. 切换/激活环境
```bash
conda activate 环境名称
```

### 3. 创建虚拟环境
```bash
## 创建指定 Python 版本的环境
conda create -n 环境名 python=3.11

## 创建时同时安装常用包
conda create -n 环境名 python=3.11 numpy pandas
```

### 4. 退出当前环境
```bash
conda deactivate
```

### 5. 删除虚拟环境
```bash
conda remove -n 环境名 --all
```

### 6. 查看已安装的包
```bash
## 当前环境的包
conda list

## 指定环境的包
conda list -n 环境名
```

### 7. 在虚拟环境中安装包
```bash
conda activate 环境名
conda install 包名
## 或
pip install 包名  # 当前环境已激活时也可以用 pip
```

### 8. 导出/导入环境
```bash
## 导出当前环境配置到 yaml 文件
conda env export > environment.yml

## 从 yaml 文件创建环境
conda env create -f environment.yml
```

### 9. 克隆环境
```bash
conda create -n 新环境名 --clone 源环境名
```

### 10. 常用环境路径
```bash
## conda 环境安装路径
~/miniconda3/envs/
## 或
~/anaconda3/envs/
```

### 注意事项
- 创建环境前先 `conda update conda` 更新 conda 本身
- 创建环境时建议使用 `python=3.11` 或 `python=3.12`（避免 3.10 太旧）
- `conda activate` 失败时检查是否运行了 `conda init`
- 用 `conda deactivate` 退出后，再 `conda activate` 另一个环境
