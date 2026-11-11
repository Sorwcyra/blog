---
title: 'LangChain 核心组件拆解：Model I/O、Chains、RAG、Agents'
date: 2026-05-21
summary: '把 LangChain 的四块核心能力拆开看：提示模板与输出解析、链式编排、检索增强、以及 Agent 的工具调度。'
tags: ['LangChain', 'LLM', 'Agent']
origin: 'Langchain 学习.md'
---
LangChain的核心组件主要涉及四个部分：Model  I/O、Chains、RAG、Agents。
### Model  I/O
> 标准化大模型的输入和输出，包含提示模版，模型调用和格式化输出。

![](/blog/notes-assets/langchain-core/file-20260519165615312.png)

Format（格式化）：通过模板管理大模型的输入。将原始数据格式化成模型可以处理的形式，插入到一个模板中，然后送入模型进行处理。
Predict（预测）：调用 LLM 接收输入，进行预测或生成回答。
Parse（解析）：规范化模型输出。比如将模型输出格式化为 JSON。

#### 介绍
  Model I/O 部分是与语言模型进行交互的核心组件，包括输入提示（Prompt Template）、调用模型（Model）、输出解析（Output Parser）。简单来说，就是输入、处理、输出这三个步骤。
#### 调用模型
##### 设置环境变量
可以保存在系统环境变量，避免大模型明文写在代码中，通过os.getenv获取，或者创建.env文件读取也可以
![](/blog/notes-assets/langchain-core/file-20260519170220674.png)
##### 测试代码
```python
import os  
from openai import OpenAI  
  
client = OpenAI(  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY")  
)  
  
completion =  client.chat.completions.create(  
    model="deepseek-v4-flash",  
    messages=[{"role":"user","content":"你是谁"}],  
)  
  
print(completion.choices[0].message.content)
```
![](/blog/notes-assets/langchain-core/file-20260519170436031.png)
##### LangChain API调用模型
通常通过聊天模型接口访问 LLM，该接口通常以消息列表作为输入并返回一条消息作为输出。
输入：接受文本 PromptValue 或消息列表 BaseMessage，每条消息需指定角色（如 SystemMessage、HumanMessage、AIMessage）
输出：返回带角色的消息对象（BaseMessage 子类），通常是 AIMessage
```python
import os  
from langchain_core.messages import *  
from langchain_openai import *  
llm = ChatOpenAI(  
    model="deepseek-v4-flash",  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY")  
)  
  
messages = [  
    SystemMessage(content="你是一个诗人"),  # 系统设定：你是诗人  
    HumanMessage(content="写一首关于春天的诗"),  # 用户提问：写春天的诗  
]  
  
resp = llm.invoke(messages)  
  
print(type(resp))  # <class 'langchain_core.messages.ai.AIMessage'>  
print(resp.content)
```
![](/blog/notes-assets/langchain-core/file-20260519171526089.png)
##### 模型初始化相关参数

| 参数          | 说明                                |
| ----------- | --------------------------------- |
| model       | 模型名称或标识符                          |
| base_url    | 发送请求的 API 端点的 URL。常由模型的提供商提供      |
| api_key     | 与模型提供商进行身份验证所需的 API 密钥            |
| temperature | 控制模型输出的随机性。数字越高，回答越有创意；数字越低，回答越确定 |
| timeout     | 在取消请求之前，等待模型响应的最大时间（以秒为单位）        |
| max_tokens  | 限制响应中的总tokens 数量，控制输出长度           |
| max_retries | 请求失败时系统尝试重新发送请求的最大次数              |
##### 对话模型的 Message
对话模型的输入可以是文本提示、消息提示或是字典格式。
文本提示是字符串，适用于不需要保留对话历史的直接生成任务。
消息提示是将消息对象列表输入模型，方便管理对话历史，包含系统指令以及处理多模态数据。
字典格式可以按照 OpenAI 聊天补全格式创建字典列表组成消息。一条消息通常包含 role（角色）、content（内容）、metadata（元数据）。
消息类型如下（HumanMessage、AIMessage 和 SystemMessage 是常用的消息类型。
ToolMessage 是在工具调用场景下才会使用的特殊消息类型）。

| 消息类型          | 描述                                                  |
| ------------- | --------------------------------------------------- |
| SystemMessage | 代表一组初始指令，用于引导模型的行为。可以使用系统消息来设定语气、定义模型的角色，并建立响应的指导方针 |
| HumanMessage  | 表示用户输入                                              |
| AIMessage     | 模型生成的响应，包括文本内容、工具调用和元数据                             |
| ToolMessage   | 表示工具调用的输出                                           |
##### 调用方法
聊天模型提供了三种主要的调用方法：
带有“a”前缀的方法是异步的，需要与 asyncio 和 await 语法一起使用以实现并发。

| 方法               | 描述           |
| ---------------- | ------------ |
| invoke / ainvoke | 将单个输入转换为输出   |
| batch / abatch   | 批量将多个输入转换为输出 |
| stream / astream | 从单个输入生成流式输出  |
###### 非流式/流式输出
在Langchain中，语言模型的输出分为了两种主要的模式：流式输出与非流式输出。

非流式输出：用户提出需求请编写一首诗，系统在静默数秒后突然弹出了完整的诗歌。如同一种“提交请求，等待结果”的流程，实现简单，但体验单调。

流式输出：用户提问，请编写一首诗，当问题刚刚发送，系统就开始一字一句（逐个token）进行回复，更像是“实时对话”，贴近人类交互的习惯。
```python
import os  
from langchain_core.messages import *  
from langchain_openai import *  
llm = ChatOpenAI(  
    model="deepseek-v4-flash",  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY")  
)  
  
messages = [  
    SystemMessage(content="你是数学家"),  # 系统设定  
    HumanMessage(content="请证明黎曼猜想"),  # 用户提问  
]  
  
for chunk in llm.stream(messages):  
    print(chunk.content,end="",flush="True")
```
![](/blog/notes-assets/langchain-core/file-20260519173256400.png)
###### 批量调用
将一组独立的请求批量发送给模型并行处理。batch 默认没有依赖底层 API 的原生批量接口，而是使用线程池并行执行多个 invoke()。所以它对 IO 密集型任务（如调用远程 LLM API）很有效。
```python
import os  
from langchain_core.messages import *  
from langchain_openai import *  
  
llm = ChatOpenAI(  
    model="deepseek-v4-flash",  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY")  
)  
  
messages = [  
    SystemMessage(content="你是助手，话不多"),  # 系统设定  
    HumanMessage(content="我叫哈小浪，你是谁"),  # 用户提问  
    AIMessage(content="原来是哈小浪啊，我是的助手"),  
    HumanMessage(content="我是谁？")  
]  
  
for chunk in llm.stream(messages):  
    print(chunk.content, end="", flush="True")
```
![](/blog/notes-assets/langchain-core/file-20260519173420433.png)

###### 同步/异步调用
同步代码
```python
import os  
import time  
  
from langchain_core.messages import *  
from langchain_openai import *  
  
llm = ChatOpenAI(  
    model="deepseek-v4-flash",  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY")  
)  
  
messages = [  
    [  
        SystemMessage(content="你是诗人"),  
        HumanMessage(content="写一首关于春天的诗"),  
    ],  
    [  
        SystemMessage(content="你是诗人"),  
        HumanMessage(content="写一首关于夏天的诗"),  
    ],  
    [  
        SystemMessage(content="你是诗人"),  
        HumanMessage(content="写一首关于秋天的诗"),  
    ],  
    [  
        SystemMessage(content="你是诗人"),  
        HumanMessage(content="写一首关于冬天是诗"),  
    ],  
]  
  
start_time = time.time()  
  
reps = [llm.invoke(message) for message in messages]  
print(reps)  
  
end_time = time.time()  
print(f"同步总耗时：{end_time-start_time}")
```
![](/blog/notes-assets/langchain-core/file-20260519174732449.png)
异步代码
```python
import asyncio  
import os  
import time  
  
from langchain_core.messages import *  
from langchain_openai import *  
  
llm = ChatOpenAI(  
    model="deepseek-v4-flash",  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY")  
)  
  
messages = [  
    [  
        SystemMessage(content="你是诗人"),  
        HumanMessage(content="写一首关于春天的诗"),  
    ],  
    [  
        SystemMessage(content="你是诗人"),  
        HumanMessage(content="写一首关于夏天的诗"),  
    ],  
    [  
        SystemMessage(content="你是诗人"),  
        HumanMessage(content="写一首关于秋天的诗"),  
    ],  
    [  
        SystemMessage(content="你是诗人"),  
        HumanMessage(content="写一首关于冬天是诗"),  
    ],  
]  
  
async def async_invoke():  
    tasks = [llm.ainvoke(message) for message in messages]  
    return await asyncio.gather(*tasks)  
  
  
start_time = time.time()  
  
reps = asyncio.run(async_invoke())  
print(reps)  
  
end_time = time.time()  
print(f"同步总耗时：{end_time-start_time}")
```
![](/blog/notes-assets/langchain-core/file-20260519175136275.png)
异步调用，允许程序在等待某些操作完成时继续执行其他任务，而不是阻塞等待。这在处理 I/O 操作（如网络请求、文件读写等）时特别有用，可以显著提高程序的效率和响应性。使用 asyncio.gather() 并行执行时，因为多个任务几乎同时开始，它们的执行时间将重叠。理想情况下，如果多个任务的执行时间相同，那么总执行时间应该接近最长的单个任务的执行时间。
##### 调用本地模型
比如ollama，这里我用的是qwen2.5:3b
部署很简单，安装完成后运行模型
```bash
ollama run qwen2.5:3b
```
```python
from langchain_ollama import ChatOllama  
from langchain_core.messages import *  
  
ollama_llm = ChatOllama(model="qwen2.5:3b")  
messages = [  
    HumanMessage(content="你是谁")  
]  
resp = ollama_llm.invoke(messages)  
print(resp.content)
```
![](/blog/notes-assets/langchain-core/file-20260519175747300.png)

#### PromptTemplate
##### PromptTemplate
PromptTemplate 用于快速构建包含变量的提示词模板，并通过传入不同的参数值生成自定义的提示词。

| 参数                |                                               |
| ----------------- | --------------------------------------------- |
| template          | 提示模板，包括变量占位符                                  |
| input_variables   | 需要将其值作为提示输入的变量名称列表                            |
| partial_variables | 提示模板携带的部分变量的字典。使用部分变量预先填充模板，无需后续在每次调用时再传递这些变量 |

| 方法       |           |
| -------- | --------- |
| format() | 使用输入格式化提示 |
```python
from langchain_core.prompts import PromptTemplate  
  
template = PromptTemplate.from_template("{foo} {bar}")  
  
prompt = template.invoke({"foo": "hello", "bar": "world"})  
  
print(prompt, type(prompt))  
## text='hello world' <class 'langchain_core.prompt_values.StringPromptValue'>  
  
prompt_str = prompt.to_string()  
print(prompt_str, type(prompt_str))  
## hello world <class 'str'>
```
![](/blog/notes-assets/langchain-core/file-20260519181020209.png)

##### ChatPromptTemplate

ChatPromptTemplate是创建聊天消息列表的提示模板。相较于普通 PromptTemplate更适合处理多角色、多轮次的对话场景。支持 System/Human/AI 等不同角色的消息模板。

实例化：

ChatPromptTemplate 可以通过构造方法或 format_messages 方法来实例化提示词模板。

实例化时需要传入 messages 参数，messages 参数支持如下格式：

tuple 构成的列表，格式为[(role, content)]
dict 构成的列表，格式为[{“role”:... , “content”:...}]
Message 类构成的列表

```python
from langchain_core.prompts import ChatPromptTemplate  
  
template = ChatPromptTemplate(  
    [  
        ("system", "你是一个AI开发工程师，你的名字是{name}。"),  
        ("human", "你能帮我做什么?"),  
        ("ai", "我能开发很多{thing}。"),  
        ("human", "{user_input}"),  
    ]  
)  
  
prompt = template.format_messages(name="小智AI", thing="AI", user_input="行")  
print(prompt)
```
![](/blog/notes-assets/langchain-core/file-20260519181417155.png)
调用：
推荐使用 format_messages 方法或 invoke 方法调用。
#### Output Parsers
在应用开发中，大模型的输出可能是下一步逻辑处理的关键输入。因此，在这种情况下，规范化输出是必须要做的任务，以确保应用能够顺利进行后续的逻辑处理。

语言模型返回的内容通常都是文本字符串 ，而实际 AI 应用开发过程中有时希望模型可以返回更直观、更格式化的内容，LangChain 提供了输出解析器（Output Parser）将模型输出解析为结构化数据。

有多种类型的输出解析器，常用的有 StrOutputParser（字符串解析器）与 JsonOutputParser（JSON解析器）。

##### StrOutputParser
StrOutputParser 是一个简单的解析器，从结果中提取 content 字段。

举例：将模型输出结果解析为字符串
```python

import os  
  
from langchain_openai import *  
from langchain_core.messages import *  
from langchain_core.output_parsers import StrOutputParser  
llm = ChatOpenAI(  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY"),  
    model="deepseek-v4-flash",  
)  
  
messages = [  
    SystemMessage(content="你是一个旅行助手"),  
    HumanMessage(content="你好"),  
]  
  
resp = llm.invoke(messages)  
print(resp)  
  
str_resp = StrOutputParser().invoke(resp)  
print(str_resp)
```
![](/blog/notes-assets/langchain-core/file-20260519182300323.png)

##### JsonOutputParser

JSON 解析器用于将大模型的自由文本输出转换为结构化JSON数据的工具。特别适用于需要严格结构化输出的场景，比如 API 调用、数据存储或下游任务处理。

JsonOutputParser 能够结合 Pydantic 模型进行数据验证，自动验证字段类型和内容（如字符串、数字、嵌套对象等）

```python
import os  
  
from langchain_openai import *  
from langchain_core.messages import *  
from pydantic import BaseModel, Field  
from langchain_core.output_parsers import JsonOutputParser  
  
llm = ChatOpenAI(  
    model="deepseek-v4-flash",  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY"),  
)  
  
  
class Prime(BaseModel):  
    prime: list[int] = Field(description="素数")  
    count: list[int] = Field(description="小于该素数的素数个数")  
  
  
json_parser = JsonOutputParser(pydantic_object=Prime)  
messages = [  
    SystemMessage(content=json_parser.get_format_instructions()),  
    HumanMessage(content="任意生成5个1000-100000之间素数，并标出小于该素数的素数个数"),  
]  
  
resp = llm.invoke(messages)  
json_resp = json_parser.invoke(resp)  
print(json_resp)  
```
![](/blog/notes-assets/langchain-core/file-20260519182639641.png)
#### Structured Outputs
可以要求模型按照给定的模式格式提供其响应，这有助于确保输出可以被轻松解析并在后续处理中使用。LangChain 支持多种模式类型和强制结构化输出的方法。

### Chains
> “链条”用于将多个组件组合成一个完整的流程，方便链式调用。

#### Runnable与LCEL
Runnable 是 LangChain 中可以调用、批处理、流式传输、转换和组合的工作单元。

Runnable 接口是使用 LangChain 组件的基础，它在许多组件中实现，例如语言模型、输出解析器、检索器、编译的 LangGraph 图等。

Runnable 统一调用方式：
```python
import os  
from langchain_openai import ChatOpenAI  
from langchain_core.prompts import ChatPromptTemplate  
from langchain_core.output_parsers import JsonOutputParser  
from pydantic import BaseModel, Field  
  
## ---------------------- 1. 配置大模型 ----------------------llm = ChatOpenAI(  
    model="deepseek-v4-flash",  # 你用的模型  
    base_url=os.getenv("BASE_URL"),  # 从环境变量取地址  
    api_key=os.getenv("API_KEY"),    # 从环境变量取密钥  
)  
  
## ---------------------- 2. 定义输出格式（JSON 结构） ----------------------class CatInfo(BaseModel):  
    name: str = Field(description="猫的名字")  
    character: str = Field(description="性格特点")  
    features: list[str] = Field(description="外貌特征列表")  
  
## 创建 JSON 解析器  
parser = JsonOutputParser(pydantic_object=CatInfo)  
  
## ---------------------- 3. 定义提示词模板 ----------------------prompt = ChatPromptTemplate.from_messages([  
    ("system", "你是一个动物知识助手，严格按JSON格式回答。\n{format_instructions}"),  
    ("human", "请介绍关于：{topic}")  
])  
  
## 把解析器的格式要求塞进提示词  
prompt = prompt.partial(format_instructions=parser.get_format_instructions())  
  
## ---------------------- 4. 两种调用方式 ----------------------  
## ========== 方式1：分步调用（适合调试） ==========prompt_text = prompt.invoke({"topic": "猫"})  
model_out = llm.invoke(prompt_text)  
result = parser.invoke(model_out)  
print("=== 分步调用结果 ===")  
print(result)  
  
## ========== 方式2：LCEL 管道式（推荐） ==========chain = prompt | llm | parser  # 管道串联  
result = chain.invoke({"topic": "猫"})  
print("\n=== 管道调用结果 ===")  
print(result)
```
![](/blog/notes-assets/langchain-core/file-20260521184119427.png)
LangChain 表达式语言（LCEL，LangChain Expression Language）是一种从现有的Runnable 构建新的 Runnable 的声明式方法，用于声明、组合和执行各种组件（模型、提示、工具、函数等）。

我们称使用 LCEL 创建的 Runnable 为“链”，“链”本身就是 Runnable。

LCEL 两个主要的组合原语是 RunnableSequence 和 RunnableParallel。许多其他组合原语可以被认为是这两个原语的变体。
#### RunnableSequence
RunnableSequence 按顺序“链接”多个可运行对象，其中一个对象的输出作为下一个对象的输入。

LCEL重载了 | 运算符，以便从两个 Runnables 创建 RunnableSequence。
```python
chain = runnable1 | runnable2
## 等同于
chain = RunnableSequence([runnable1, runnable2])
```
提示模板➡️模型➡️输出解析器
```python
import os  
from langchain_openai import ChatOpenAI  
from langchain_core.prompts import PromptTemplate  
from langchain_core.output_parsers import StrOutputParser  
  
llm = ChatOpenAI(  
    model="deepseek-v4-flash",  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY"),  
)  
  
  
prompt_template = PromptTemplate(  
    template="讲一个关于{topic}的笑话",  
    input_variables=["topic"],  
)  
  
  
parser = StrOutputParser()  
  
chain = prompt_template | llm | parser  
  
resp = chain.invoke({"topic": "人工智能"})  
print(resp)
```
![](/blog/notes-assets/langchain-core/file-20260521184445210.png)
#### RunnableParallel
RunnableParallel 同时运行多个可运行对象，并为每个对象提供相同的输入。

对于同步执行，RunnableParallel 使用 ThreadPoolExecutor 来同时运行可运行对象。

对于异步执行，RunnableParallel 使用 asyncio.gather 来同时运行可运行对象。

在 LCEL 表达式中，字典会自动转换为 RunnableParallel。
```python
import os  
  
from langchain_core.output_parsers import StrOutputParser  
from langchain_core.prompts import PromptTemplate  
from langchain_core.runnables import RunnableParallel  
from langchain_openai import ChatOpenAI  
  
llm = ChatOpenAI(  
    model="deepseek-v4-flash",  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY"),  
)  
  
  
joke_chain = (  
        PromptTemplate.from_template("讲一个关于{topic}的笑话") | llm | StrOutputParser()  
)  
poem_chain = (  
        PromptTemplate.from_template("写一首关于{topic}的诗歌") | llm | StrOutputParser()  
)  
  
map_chain = RunnableParallel(joke=joke_chain, poem=poem_chain)  
  
resp = map_chain.invoke({"topic": "人工智能"})  
print(resp)
```
![](/blog/notes-assets/langchain-core/file-20260521185238525.png)
#### RunnableLambda
RunnableLambda 将 Python 可调用函数转换为 Runnable，使得函数可以在同步或异步上下文中使用。
```python
from langchain_core.runnables import RunnableLambda  
  
  
@RunnableLambda  
def total_len(x):  
    return len(x["text1"]) + len(x["text2"])  
  
  
chain = {  
            "text1": lambda x: x + " world",  
            "text2": lambda x: x + ", how are you",  
        } | total_len  
  
result = chain.invoke("hello")  
print(result)  # 29
```
![](/blog/notes-assets/langchain-core/file-20260521185402197.png)
#### RunnablePassthrough
RunnablePassthrough 接收输入并将其原样输出。RunnablePassthrough 是 LangChain LCEL 体系中的“无操作节点”，用于在流水线中透传输入或保留上下文，也可以用于向输出中添加键。

举例：保留中间结果
```python
from langchain_core.runnables import RunnablePassthrough, RunnableParallel  
  
chain = RunnableParallel(  
    original=RunnablePassthrough(),  # 保留中间结果  
    word_count=lambda x: len(x),  
)  
  
result = chain.invoke("hello world")  
print(result)  # {'original': 'hello world', 'word_count': 11}
```
![](/blog/notes-assets/langchain-core/file-20260521185448401.png)
举例：使用 assign() 向输出中添加键
```python
from langchain_core.runnables import RunnablePassthrough  
  
chain = {  
            "text1": lambda x: x + " world",  
            "text2": lambda x: x + ", how are you",  
        } | RunnablePassthrough.assign(word_count=lambda x: len(x["text1"] + x["text2"]))  
  
result = chain.invoke("hello")  
print(result)
```
![](/blog/notes-assets/langchain-core/file-20260521185528733.png)
#### RunnableBranch
RunnableBranch 使用 (条件，Runnable) 对列表和默认分支进行初始化。对输入进行操作时，选择第一个计算结果为 True 的条件，并在输入上运行相应的 Runnable。如果没有条件为 True，则在输入上运行默认分支。
```python
from langchain_core.runnables import RunnableBranch  
  
branch = RunnableBranch(  
    (lambda x: isinstance(x, str), lambda x: x.upper()),  
    (lambda x: isinstance(x, int), lambda x: x + 1),  
    (lambda x: isinstance(x, float), lambda x: x * 2),  
    lambda x: "goodbye",  
)  
  
result = branch.invoke("hello")  
print(result)  # HELLO  
  
result = branch.invoke(None)  
print(result)
```
![](/blog/notes-assets/langchain-core/file-20260521185611121.png)
#### RunnableWithFallbacks
RunnableWithFallbacks 使得 Runnable 失败后可以回退到其他 Runnable。可以直接在Runnable 上使用 with_fallbacks 方法。
```python
import os  
from langchain_core.prompts import PromptTemplate  
from langchain_core.runnables import RunnableLambda  
from langchain_openai import ChatOpenAI  
  
llm = ChatOpenAI(  
    model="deepseek-v4-flash",  
    base_url=os.getenv("BASE_URL"),  
    api_key=os.getenv("API_KEY"),  
)    
  
chain = PromptTemplate.from_template("hello") | llm  
chain_with_fallback = chain.with_fallbacks([RunnableLambda(lambda x: "sorry")])  
  
result = chain_with_fallback.invoke("1")  # 提示词模板中没有需要填充的变量，会报错  
print(result)  
```
![](/blog/notes-assets/langchain-core/file-20260521185815562.png)

### RAG
>检索增强生成，检索外部数据，作为参考信息输入LLM辅助生成答案

![](/blog/notes-assets/langchain-core/file-20260519165704922.png)
Source：多种类型的数据源：视频、图片、文本、代码、文档等。
Load：将多源异构数据统一加载为文档对象。
Transform：对文档进行转换和处理，比如将文本切分为小块。
Embed：将文本编码为向量。
Store：将向量化后的数据存储起来。
Retrieve：从文本库中检索相关的文本段落。

### Agents
> Agent 自主规划执行步骤并使用工具来完成任务

![](/blog/notes-assets/langchain-core/file-20260519170020904.png)
