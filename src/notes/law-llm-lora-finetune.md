---
title: '法律领域模型微调全流程：Qwen2.5-7B + 两阶段 LoRA'
date: 2026-10-20
summary: '从数据集选型、环境排障到两阶段 LoRA 训练、验证合并与魔搭上传，完整记录法智云专用模型的落地过程。'
tags: ['LLM', 'LoRA', '微调', '实战']
origin: '法律模型微调全流程.md'
---
> 项目：法智云——法律知识智能问答系统  
> 周期：2026-10-19 ~ 2026-10-20  
> 产出模型：[sorwcyra/fzy-law-7b](https://www.modelscope.cn/models/sorwcyra/fzy-law-7b)  
> 环境：魔搭 DSW 免费实例（AMD Instinct MI300X 191GB / ROCm 7.2）

---

### 一、总体路线

```
数据集选型 → 环境排障 → 数据转换 → 两阶段 LoRA 训练 → 验证 → 合并 → 上传魔搭 → 部署接入
```

关键决策：

| 决策点 | 结论 | 原因 |
|---|---|---|
| 训练框架 | **弃用 LLaMA-Factory，改自研脚本** | LF 在该环境静默 exit(0)（dev/stable 都复现） |
| 数据 | **DISC-Law-SFT：Pair 6万 + Triplet 1.6万** | Pair 学能力，Triplet 学「照着法条引用」 |
| 方法 | LoRA r=16 / alpha=32 / all-linear，bf16 | 7B 全参微调没必要，LoRA 效果等价且省资源 |
| 关键优化 | **样本打包（packing 2048）** | 吞吐 +77%（1,800 → 3,190 token/s） |

---

### 二、数据集选型（实测验证）

魔搭搜「法律」80 个数据集，真正能用于 **SFT** 的只有少数。逐个体检（git clone + LFS 指针 + resolve 探测）：

| 数据集 | 结论 |
|---|---|
| **AI-ModelScope/DISC-Law-SFT** | ✅ 主力。Pair 326MB（16.7万条 `id,input,output`）+ Triplet 50MB（1.6万条 `id,reference,input,output`，RAG 式） |
| ArwKraken/LegalHelp-DialogData | 38万条对话（messages 格式），质量参差（引用有张冠李戴），混入前需清洗 |
| KuugoRen/chinese_law_ft_dataset | Alpaca 10万+，通用问答调剂 |
| Robin021/DISC-Law-SFT | ❌ **空壳**，数据文件 404（HF gated 那个的镜像残留） |
| peopletech/Legal | ❌ 原始语料（法规全文 178MB + 法治新闻 977MB），**不能直接 SFT**，适合喂 RAG 知识库 |
| KLGR123/wenshu_dataset、dengcao/Chinese-Laws | ❌ 文本语料，喂 RAG 用 |

**教训**：搜出来下载量最高的往往是「语料库」不是「指令集」，必须看文件内部格式（我用了 HTTP Range 取 zip 中央目录 + zlib 流式解压，不下全量就能看清结构）。

---

### 三、环境排障（耗时最长的一段）

#### 3.1 现象

训练在模型加载完成后**静默死亡**：日志停在 `all params: 7,615,616,512`，进程消失、无 traceback、无 OOM 记录。

#### 3.2 排查路径

| 检查 | 结果 | 结论 |
|---|---|---|
| `nvidia-smi` | 不存在 | 不是 N 卡 |
| `/proc/driver/nvidia/version` | 不存在 | 同上 |
| `torch.cuda.get_device_properties(0)` | 191GB，名字为空 | 虚拟化/特殊设备 |
| GPU 基础 backward | OK | 底层算子没问题 |
| 手动 transformers+peft+Trainer 跑通 | OK（loss 3.25） | 栈本身没问题 |
| LLaMA-Factory dev 0.9.6 / stable 0.9.5 | **都 exit(0)** | 锅在 LF |
| **真相** | **AMD Instinct MI300X，ROCm 7.2** | `torch.version.hip` 有值即 ROCm |

#### 3.3 结论

- 该环境 **LLaMA-Factory 不可用**（模型加载后静默退出），但 **transformers + peft + Trainer 完全正常** → 写独立训练脚本
- 其他环境坑：
  - **1 小时无操作自动关机**（免费实例），checkpoint 必须频繁存（200 步/次）
  - 不同 pod 之间 `/mnt/workspace` **脚本文件不一定共享**（数据在，脚本要重新写）
  - 新 pod 的 transformers 版本更新后 `warmup_ratio` 被移除 → 用 `warmup_steps`
  - transformers 5.8 的 `apply_chat_template(tokenize=True)` 返回 `Encoding` 对象而非 id 列表 → 改 `tokenize=False` 后分段编码

---

### 四、训练实施

#### 4.1 数据转换（Alpaca）

```python
import pandas as pd, json
base = '/mnt/workspace'
pair = pd.read_csv(f'{base}/disc/DISC-Law-SFT-Pair.csv', index_col=0)
json.dump([{"instruction": str(r['input']), "input": "", "output": str(r['output'])}
           for _, r in pair.iterrows()],
          open(f'{base}/LLaMA-Factory/data/disc_pair.json', 'w', encoding='utf-8'), ensure_ascii=False)
tri = pd.read_csv(f'{base}/disc/DISC-Law-SFT-Triplet-released.csv', index_col=0)
json.dump([{"instruction": f"参考以下法条回答问题。\n法条：{r['reference']}\n\n问题：{r['input']}",
            "input": "", "output": str(r['output'])} for _, r in tri.iterrows()],
          open(f'{base}/LLaMA-Factory/data/disc_triplet.json', 'w', encoding='utf-8'), ensure_ascii=False)
```

#### 4.2 训练脚本要点

```python
model = AutoModelForCausalLM.from_pretrained(BASE, dtype=torch.bfloat16, device_map='cuda')
model = get_peft_model(model, LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
                                         target_modules='all-linear', task_type='CAUSAL_LM'))
model.gradient_checkpointing_disable()   # 显存足够时关掉，省 25% 时间
```

**packing 实现**（吞吐提升关键）：

```python
## 每条样本：prompt 部分 label 置 -100（不计损失），答案部分计入
buf_i += prompt_ids + resp_ids
buf_l += [-100] * len(prompt_ids) + resp_ids
while len(buf_i) >= 2048:          # 拼满 2048 切块，无 padding 浪费
    blocks.append(buf_i[:2048]); labels.append(buf_l[:2048])
    buf_i, buf_l = buf_i[2048:], buf_l[2048:]
```

缓存成 `.pt` 后，续训直接加载，跳过 57 秒的分词。

#### 4.3 两阶段训练参数

| 阶段 | 数据 | 关键参数 | 步数 | 耗时 | loss |
|---|---|---|---|---|---|
| 1 | Pair 60,000 条 | lr 5e-5, batch 8, 1 epoch, packing | 1,998 | 2.9h | 0.55~0.64 |
| 2 | Triplet 16,000 条（从 v1 adapter 续训） | lr 2e-5, batch 8, 1 epoch | 753 | 63min | **0.408** |

#### 4.4 踩坑

- **batch 16 直接 OOM**（32K token/步占满 173GB）→ batch 8（16K token/步，约 85GB）
- 加 `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` 防碎片
- `tail -f` 永远不退出，是正常行为（Ctrl+C 退出查看，不杀训练）

---

### 五、验证结果（最重要的发现）

**裸问（不带法条）** vs **RAG 形态（注入法条）** 差异巨大：

| 版本 | 裸问是否引条号 | RAG 形态引条号 | 说明 |
|---|---|---|---|
| v1（仅 Pair 6万） | ❌ 0/3 | ⚠️ 2/3 | 回答专业但不会主动标注条款 |
| v2（+ Triplet 1.6万） | —— | ✅ **3/3** | 1087 / 85 / 679 条全命中 |

**结论：教模型「引用法条」靠的是 Triplet 数据（法条+案情→带条款回答），不是堆 Pair 数量。** 这也正好匹配法智云「按条号做引用溯源」的机制。

---

### 六、合并与发布

```bash
## 合并 LoRA 到基座（peft merge_and_unload，不依赖 LF）
ADAPTER=/mnt/workspace/saves/disc-lora-v2/final-adapter python merge_lora.py
## → /mnt/workspace/fzy-law-7b（4 分片 ~15GB）

## 上传魔搭
modelscope login
modelscope upload sorwcyra/fzy-law-7b /mnt/workspace/fzy-law-7b --repo-type model   # 103 秒
modelscope upload sorwcyra/fzy-law-7b /mnt/workspace/saves/disc-lora-v2/final-adapter --repo-type model
```

模型卡（README）写了：模型信息、两阶段训练表、能力验证、transformers/vLLM 用法、局限声明。

---

### 七、部署方案对比（实测）

| 方案 | 可行性 | 说明 |
|---|---|---|
| 魔搭 **API-Inference** | ❌ | 只托管平台白名单模型，自传模型报 `has no provider supported` |
| 魔搭 **创空间** | ❌ | 免费资源仅 2vCPU/8G，7B 跑不动；xGPU 需加入组织 |
| **DSW 实例 vLLM** | ✅ | `vllm serve` 成功（KV cache 157GB，并发 90x），但端口不默认对外 |
| **本地 Ollama + Q4** | ✅ | 16G 内存 + 4G 显存可跑（4bit，约 5~10 token/s） |
| **AutoDL 租卡** | ✅ | 演示首选：4090 ¥2/小时 + 自定义服务公网端口 |

vLLM 启动与验证：

```bash
vllm serve /mnt/workspace/fzy-law-7b --served-model-name fzy-law --port 8000
curl http://127.0.0.1:8000/v1/chat/completions -H "Content-Type: application/json" \
  -d '{"model":"fzy-law","messages":[{"role":"user","content":"公司拖欠工资三个月怎么办？"}]}'
```

---

### 八、法智云接入改造（进程内 local provider）

原本只支持「OpenAI 兼容 HTTP」，新增第 4 类模型源「进程内加载」：

| 文件 | 改动 |
|---|---|
| `backend/app/utils/enums.py` | `Provider.LOCAL = "local"` |
| `backend/app/services/llm_gateway.py` | 新增 `LocalClient`：transformers 懒加载 + `TextIteratorStreamer` 流式 + 进程内按模型缓存 + 复用 `is_degenerate` 退化拦截；`client_from_config` / `default_client` 按 provider 分派 |
| `backend/app/api/v1/model_configs.py` | providers/meta 增加条目（前端下拉从 meta 动态渲染，无需改前端） |
| `backend/pyproject.toml` | 可选依赖组 `local = [torch, transformers, accelerate]` |

使用：

```bash
cd backend && uv sync --extra local
uv run uvicorn app.main:app --host 127.0.0.1 --port 18000
```

模型配置页：Provider 选「本地微调模型（进程内）」、**模型名填 `sorwcyra/fzy-law-7b`**、base_url/api_key 留空。

---

### 九、本地量化部署（16G 内存 / RTX 3050 4G）

7B bf16 需 15G，跑不动 → **Ollama + Q4_K_M（约 4.4G）**，3G 进显存、1.4G 进内存。

```powershell
## 1. 启动 Ollama
ollama serve

## 2. 下载模型（魔搭，15G）
uv run --with modelscope modelscope download --model sorwcyra/fzy-law-7b --local_dir C:/Users/19112/models/fzy-law-7b

## 3. 写 Modelfile（含 Qwen 对话模板）
## FROM C:/Users/19112/models/fzy-law-7b
## PARAMETER temperature 0.7 / top_p 0.9 / num_ctx 4096
## TEMPLATE """...<|im_start|>..."""

## 4. 量化导入
ollama create fzy-law-q4 -q q4_K_M -f C:/Users/19112/models/Modelfile

## 5. 测试
ollama run fzy-law-q4 "公司拖欠工资三个月怎么办？"
```

法智云接入（走现成的 ollama provider，零代码改动）：
- Provider：本地 Ollama
- base_url：`http://127.0.0.1:11434/v1`
- model：`fzy-law-q4`

---

### 十、命令速查

```bash
## 下载数据集 / 基座
modelscope download --dataset AI-ModelScope/DISC-Law-SFT --local_dir ./disc
modelscope download --model Qwen/Qwen2.5-7B-Instruct --local_dir ./base_model

## 训练 / 续训
python train_packed.py                     # 第一轮
RESUME=1 python train_packed.py            # 断点续训
python train_triplet.py                    # 第二轮（从 v1 adapter）

## 验证
ADAPTER=.../final-adapter python verify_rag.py

## 合并 / 上传
ADAPTER=... python merge_lora.py
modelscope upload sorwcyra/fzy-law-7b /path --repo-type model

## 部署
vllm serve ./fzy-law-7b --served-model-name fzy-law --port 8000
ollama create fzy-law-q4 -q q4_K_M -f Modelfile
```

---

### 十一、踩坑清单（按严重度）

1. **LLaMA-Factory 在该环境静默 exit(0)** → 改用自研 transformers+peft 脚本（本次最大坑，排查约 2 小时）
2. **`Robin021/DISC-Law-SFT` 是空壳** → 必须用 `AI-ModelScope/` 镜像
3. **评估太密吃掉一半时间**（3656 条 × 每 200 步一次 × 12.5 分钟）→ 训练期直接关评估
4. **batch 16 + packing 直接 OOM**（32K token/步）→ batch 8
5. **`warmup_ratio` 在新版 transformers 被移除** → `warmup_steps`
6. **`apply_chat_template(tokenize=True)` 返回 Encoding 对象** → 改 `tokenize=False` 分段编码
7. **1 小时无操作自动关机** → checkpoint 每 200 步一存
8. **不同 pod 的 `/mnt/workspace` 脚本不共享** → 脚本用 base64 单行传输（heredoc 会被终端吃字符）
9. **API-Inference 不托管自传模型** → 别在这条路上浪费时间
10. **创空间免费档只有 2vCPU/8G** → 7B 跑不动

---

### 十二、后续待办

- [ ] 本地 Ollama Q4 部署验证（下载中）
- [ ] 法智云 local provider 真机联调（切默认模型 → 问答验证）
- [ ] 更新 SRS 文档：「预留接入位」→「已完成微调接入」
- [ ] 简历条目：数据集选型 / 双阶段训练 / ROCm 排障 / 接入改造
- [ ] （可选）用全量 16.7 万 Pair 再训一版对比
- [ ] （可选）ArwKraken/LegalHelp 对话数据清洗后混入，提升多轮体验
