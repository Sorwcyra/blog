---
title: 'LangChain4j 学习笔记：在 Java 里接大模型'
date: 2026-05-29
summary: 'Java 侧接入 LLM 的一套完整笔记，涵盖模型接入、Prompt 模板、记忆、RAG 检索与 Agent 编排。'
tags: ['Java', 'LangChain4j', 'LLM']
origin: 'langchain4J.md'
---
## 1. Langchain4J 入门

### 1.1 Langchain4J 介绍

LangChain4j 的目标是简化将大语言模型（LLM - Large Language Model）集成到 Java 应用程序中的过程。

- 2022年11月30日 OpenAI 发布了 ChatGPT（GPT-3.5）
- 早在2022年10月，Harrison Chase 发布了基于 Python 的 LangChain
- 随后同时包含了 Python 版和 JavaScript（LangChain.js）版的 LangChain 也发布了
- 2023年11月，Quarkus 发布了 LangChain4j 的 0.1 版本，2025年2月发布了 1.0-Beta1 版本，4月发布了 1.0-Beta3 版本

![](/blog/notes-assets/langchain4j/1749732420764-f43eca10-3be0-49f6-8221-a80f4d2ab74c.png)

官网：[https://docs.langchain4j.dev](https://docs.langchain4j.dev/)

### 1.2 主要功能

**与大型语言模型和向量数据库的便捷交互**

通过统一的应用程序编程接口（API），可以轻松访问所有主要的商业和开源大型语言模型以及向量数据库，使你能够构建聊天机器人、智能助手等应用。

**专为 Java 打造**

借助 Spring Boot 集成，能够将大模型集成到 Java 应用程序中。大型语言模型与 Java 之间实现了双向集成：你可以从 Java 中调用大型语言模型，同时也允许大型语言模型反过来调用你的 Java 代码。

**智能代理、工具、检索增强生成（RAG）**

为常见的大语言模型操作提供了广泛的工具，涵盖从底层的提示词模板创建、聊天记忆管理和输出解析，到智能代理和检索增强生成等高级模式。

### 1.3 环境搭建

#### 1.3.1 配置环境变量

方式一

![](/blog/notes-assets/langchain4j/1778393344454-ff24cad4-5872-48f5-82a6-9d5556fba579.png)

方式二

![](/blog/notes-assets/langchain4j/1778393578543-5f209284-f13f-444d-8db1-600dac3c9268.png)

![](/blog/notes-assets/langchain4j/1778393674114-5f9167aa-2b56-451c-b785-313498e7546b.png)

#### 1.3.2 新建工程

![](/blog/notes-assets/langchain4j/1778394015306-b2f08315-7cc3-4250-b3ba-17e2cef32b7e.png)

maven 默认路径

![](/blog/notes-assets/langchain4j/1778394630467-e50785ee-9cfc-4482-8e26-3dd190780a00.png)

如果有同学 Java 有问题，可以找其他同学拷贝 repository 文件夹下的东西，覆盖。

#### 1.3.3 环境依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <!-- 组织名称 -->
    <groupId>com.gxa</groupId>
    <!-- 项目名称 -->
    <artifactId>langchin4j</artifactId>
    <!-- 版本号 -->
    <version>v1.0</version>
    <!-- 把 SpringBoot 作为父工程 -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.2</version>
    </parent>
    <dependencies>
        <!-- 导入 spring+springmvc 环境 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
</project>
```

#### 1.3.4 新建入口类

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@SpringBootApplication // 启动类
public class AgentApplication {
    public static void main(String[] args) {
        SpringApplication.run(AgentApplication.class, args);
    }
}
```

![](/blog/notes-assets/langchain4j/1778394396701-79b50fe5-1f98-4540-a73a-ab53cd991d06.png)

#### 1.3.5 配置全局配置文件

```yaml
server:
  port: 8080
  servlet:
    context-path: /
```

![](/blog/notes-assets/langchain4j/1778394454827-cb0b04bc-057e-4df4-97a8-653bab715967.png)

运行项目

![](/blog/notes-assets/langchain4j/1778394482761-b6bc12d2-2048-48d2-9d96-e6c723350ed7.png)

#### 1.3.6 整合 Swagger

```xml
<<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.6.0</version>
</dependency>
<!-- 让响应结果更美观 -->
<<dependency>
    <groupId>com.alibaba.cola</groupId>
    <artifactId>cola-component-dto</artifactId>
    <version>4.3.2</version>
</dependency>
```

```java
package com.gxa.ai.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author zxd
 * @date 2026/5/10
 */
@Configuration
public class SwaggerConfig {
    /* 配置 swagger 基本信息 */
    @Bean
    public OpenAPI swaggerOpenApi() {
        return new OpenAPI()
                .info(new Info().title("Langchin4j智能体")
                        .description("Langchin4j智能体")
                        .version("v1.0"))
                .externalDocs(new ExternalDocumentation()
                        .description("")
                        .url(""));
    }
}
```

![](/blog/notes-assets/langchain4j/1778395003049-cee6c3a5-42b8-4bf3-9ba7-c22607143a65.png)

#### 1.3.7 编写测试代码

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@RestController // @Controller 注解交给 spring 进行管理 + @ResponseBody 返回 Json 数据
@RequestMapping("/test") // 配置访问 controller 前缀
@Tag(name = "测试接口")
public class HelloController {
    @Operation(summary = "测试 hello")
    @GetMapping("/hello")
    public String hello(String name) {
        System.out.println("---hello 方法被访问了---");
        return "hello" + name;
    }
}
```

访问地址：[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

### 1.4 Langchain4j 入门

#### 1.4.1 导入依赖

Langchain4j 版本管理

```xml
<<dependencyManagement>
    <dependencies>
        <!-- 引入 langchain4j 版本管理 -->
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-bom</artifactId>
            <version>1.9.1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Langchain4j OpenAI 的依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <!-- 组织名称 -->
    <groupId>com.gxa</groupId>
    <!-- 项目名称 -->
    <artifactId>langchin4j</artifactId>
    <!-- 版本号 -->
    <version>v1.0</version>
    <!-- 把 SpringBoot 作为父工程 -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.4.2</version>
    </parent>
    <dependencies>
        <!-- 引入 langchain4j openai 的依赖 -->
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-open-ai</artifactId>
        </dependency>
        <!-- 导入 spring+springmvc 环境 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.6.0</version>
        </dependency>
        <!-- 让响应结果更美观 -->
        <dependency>
            <groupId>com.alibaba.cola</groupId>
            <artifactId>cola-component-dto</artifactId>
            <version>4.3.2</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
    <dependencyManagement>
        <dependencies>
            <!-- 引入 langchain4j 版本管理 -->
            <dependency>
                <groupId>dev.langchain4j</groupId>
                <artifactId>langchain4j-bom</artifactId>
                <version>1.9.1</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

#### 1.4.2 入门测试

![](/blog/notes-assets/langchain4j/1778397451489-95916c06-47a2-4f5b-8c24-9b210c59a26c.png)

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@SpringBootTest
public class TestAgent {
    @Test
    public void testLLM() {
        String apiKey = System.getenv("OPENAI_API_KEY");
        String baseUrl = System.getenv("OPENAI_API_BASE");
        OpenAiChatModel model = OpenAiChatModel.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .modelName("gpt-4o")
                .build();
        String result = model.chat("你好，你是谁?");
        System.out.println(result);
    }
}
```

### 1.5 整合 Spring Boot 对接 OpenAI

#### 1.5.1 导入依赖

将 `langchain4j-open-ai` 替换成 `langchain4j-open-ai-spring-boot-starter`

```xml
<!-- 接入 langchain4j open-ai 基础功能 -->
<<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai-spring-boot-starter</artifactId>
</dependency>
```

#### 1.5.2 配置模型参数

```yaml
server:
  port: 8080
  servlet:
    context-path: /
langchain4j:
  open-ai:
    chat-model:
      base-url: https://api.kourichat.com/v1
      api-key: ${OPENAI_API_KEY}
      model-name: gpt-4o
      log-requests: true
      log-responses: true
```

#### 1.5.3 测试

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@SpringBootTest
public class TestAgent {
    @Autowired
    private OpenAiChatModel openAiChatModel;

    @Test
    public void testLLM() {
        String result = openAiChatModel.chat("你好，你是谁?");
        System.out.println(result);
    }
}
```

### 1.6 对接 DeepSeek

DeepSeek 兼容 OpenAI 规范，所以可以直接使用 `langchain4j-open-ai-spring-boot-starter`

#### 1.6.1 配置

```yaml
server:
  port: 8080
  servlet:
    context-path: /
langchain4j:
  open-ai:
    chat-model:
      base-url: https://api.deepseek.com
      api-key: ${DEEPSEEK_API_KEY}
      model-name: deepseek-chat
      log-requests: true
      log-responses: true
```

#### 1.6.2 测试

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@SpringBootTest
public class TestAgent {
    @Autowired
    private OpenAiChatModel openAiChatModel;

    @Test
    public void testLLM() {
        String result = openAiChatModel.chat("你好，你是谁?");
        System.out.println(result);
    }
}
```

### 1.7 对接硅基流动

#### 1.7.1 配置

```yaml
server:
  port: 8080
  servlet:
    context-path: /
langchain4j:
  open-ai:
    chat-model:
      base-url: https://api.siliconflow.cn
      api-key: ${GJLD_API_KEY}
      model-name: Pro/zai-org/GLM-5.1
      log-requests: true
      log-responses: true
```

#### 1.7.2 测试

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@SpringBootTest
public class TestAgent {
    @Autowired
    private OpenAiChatModel openAiChatModel;

    @Test
    public void testLLM() {
        String result = openAiChatModel.chat("你好，你是谁?");
        System.out.println(result);
    }
}
```

### 1.8 对接阿里百炼

#### 1.8.1 依赖管理

```xml
<<dependencyManagement>
    <dependencies>
        <!-- 引入百炼依赖管理清单 -->
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-community-bom</artifactId>
            <version>1.0.0-alpha1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

依赖

```xml
<!-- 引入 langchain4j 阿里百炼的依赖 -->
<<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-community-dashscope-spring-boot-starter</artifactId>
</dependency>
```

#### 1.8.2 配置

```yaml
langchain4j:
  community:
    dashscope:
      chat-model:
        api-key: ${ALI_API_KEY}
        model-name: qwen-max
```

#### 1.8.3 测试

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@SpringBootTest
public class TestAgent {
    @Autowired
    private QwenChatModel qwenChatModel;

    @Test
    public void testLLM() {
        String result = qwenChatModel.chat("你好，你是谁?");
        System.out.println(result);
    }
}
```

### 1.9 对接 Ollama

#### 1.9.1 依赖

```xml
<!-- 接入 ollama -->
<<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-ollama-spring-boot-starter</artifactId>
</dependency>
```

#### 1.9.2 配置

```yaml
langchain4j:
  ollama:
    chat-model:
      base-url: http://localhost:11434
      model-name: qwen3:0.6b
      log-requests: true
      log-responses: true
```

#### 1.9.3 测试

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@SpringBootTest
public class TestAgent {
    @Autowired
    private OllamaChatModel ollamaChatModel;

    @Test
    public void testLLM() {
        String result = ollamaChatModel.chat("你好，你是谁?");
        System.out.println(result);
    }
}
```

---

## 2. AIService

### 2.1 什么是 AIService

AIService 使用面向接口和动态代理的方式完成程序的编写，更灵活的实现高级功能。

#### 2.1.1 链 Chain（旧版）

链的概念源自 Python 中的 LangChain。其理念是针对每个常见的用例都设置一条链，比如聊天机器人、检索增强生成（RAG）等。链将多个底层组件组合起来，并协调它们之间的交互。链存在的主要问题是不灵活，我们不进行深入的研究。

#### 2.1.2 人工智能服务 AIService

在 LangChain4j 中使用 AIService 完成复杂操作。底层组件将由 AIService 进行组装。

**AIService 可处理最常见的操作：**
- 为大语言模型格式化输入内容
- 解析大语言模型的输出结果

**它们还支持更高级的功能：**
- 聊天记忆 Chat memory
- 工具 Tools
- 检索增强生成 RAG

### 2.2 AIService 入门

#### 2.2.1 引入依赖

```xml
<!-- langchain4j 高级功能 -->
<<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-spring-boot-starter</artifactId>
</dependency>
```

#### 2.2.2 创建接口

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
public interface AssistantService {
    String chat(String msg);
}
```

#### 2.2.3 测试

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@SpringBootTest
public class AIServiceTest {
    @Autowired
    private OpenAiChatModel openAiChatModel;

    @Test
    public void testChat() {
        // 创建 AIService 代理对象，底层使用 Java 的动态代理生成代理对象
        AssistantService assistantService = AiServices.create(AssistantService.class, openAiChatModel);
        // 调用 service 的方法
        String result = assistantService.chat("你好，你是谁?");
        System.out.println(result);
    }
}
```

### 2.3 @AIService

#### 2.3.1 使用 @AIService 注解

在 `AssistantService` 接口上直接添加 `@AiService` 注解

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@AiService
public interface AssistantService {
    String chat(String msg);
}
```

测试代码中，我们可以直接注入 `AssistantService` 对象

```java
/**
 * @author zxd
 * @date 2025/12/18
 */
@SpringBootTest
public class AIServiceTest {
    @Autowired
    private AssistantService assistantService;

    @Test
    public void testChat() {
        String result = assistantService.chat("你好，你是谁?");
        System.out.println(result);
    }
}
```

#### 2.3.2 工作原理

`AiServices` 会**组装 `AssistantService` 接口以及其他组件**，并使用反射机制创建一个实现 `AssistantService` 接口的**代理对象**。这个代理对象会处理输入和输出的所有转换工作。在这个例子中，`chat` 方法的输入是一个字符串，但是大模型需要一个 `UserMessage` 对象。所以，代理对象将这个字符串转换为 `UserMessage`，并调用聊天语言模型。`chat` 方法的输出类型也是字符串，但是大模型返回的是 `AiMessage` 对象，代理对象会将其转换为字符串。

**简单理解就是：代理对象的作用是输入转换和输出转换**

---

## 3. ChatMemory

### 3.1 测试记忆能力

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@SpringBootTest
public class ChatMemoryTest {
    @Autowired
    private AssistantService assistantService;

    @Test
    public void testChatMemory() {
        // 1. 第一次调用
        String result = assistantService.chat("我是哈小浪");
        System.out.println(result);
        // 2. 第二次调用
        String result2 = assistantService.chat("我是谁?");
        System.out.println(result2);
    }
}
```

很显然，目前的接入方式是没有记忆能力的。

### 3.2 聊天记忆的代码实现

通过将历史对话消息（用户消息+AI回复）与当前消息组合成序列传递给模型，让模型在生成回复时参考完整对话上下文，从而实现聊天记忆功能。

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@SpringBootTest
public class ChatMemoryTest2 {
    @Autowired
    private OpenAiChatModel openAiChatModel;

    @Test
    public void testChatMemory2() {
        // 1. 第一次调用
        UserMessage userMessage1 = UserMessage.userMessage("我是哈小浪");
        ChatResponse chatResponse1 = openAiChatModel.chat(userMessage1);
        AiMessage aiMessage1 = chatResponse1.aiMessage();
        System.out.println(aiMessage1.text());

        // 2. 第二次调用
        UserMessage userMessage2 = UserMessage.userMessage("我是谁?");
        ChatResponse chatResponse2 = openAiChatModel.chat(Arrays.asList(userMessage1, aiMessage1, userMessage2));
        AiMessage aiMessage2 = chatResponse2.aiMessage();
        // 输出大模型的回复
        System.out.println(aiMessage2.text());
    }
}
```

### 3.3 使用 ChatMemory 实现聊天记忆

使用 AIService 可以封装多轮对话的复杂性，使聊天记忆功能的实现变得简单。

```java
@Test
public void testChatMemory3() {
    // 1. 创建 chatMemory
    MessageWindowChatMemory chatMemory = MessageWindowChatMemory.withMaxMessages(9);
    // 2. 创建 AIService
    AssistantService assistantService = AiServices.builder(AssistantService.class)
            .chatModel(openAiChatModel)
            .chatMemory(chatMemory)
            .build();
    // 调用 service 的接口
    String answer1 = assistantService.chat("我是哈小浪");
    System.out.println(answer1);
    // 第二次调用
    String answer2 = assistantService.chat("我是谁?");
    System.out.println(answer2);
}
```

`MessageWindowChatMemory` 是 LangChain4j 中用于实现聊天记忆的组件，它的作用是：

**核心功能**：管理对话历史，限制保留的消息数量（通过 `withMaxMessages(9)` 设置最多保留 9 条消息）

**工作原理**：
- 自动维护一个"滑动窗口"式的消息队列
- 新消息加入时，自动移除最旧的消息
- 确保对话上下文不会无限增长

### 3.4 使用 AIService 实现聊天记忆

#### 3.4.1 配置 ChatMemory

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Configuration
public class MessageChatAssistantConfig {
    @Bean
    public ChatMemory chatMemory() {
        // 创建聊天记忆对象
        MessageWindowChatMemory chatMemory = MessageWindowChatMemory.withMaxMessages(9);
        return chatMemory;
    }
}
```

#### 3.4.2 创建记忆对话智能体

当 AIService 由多个组件（大模型、聊天记忆等）组成的时候，我们就可以称他为智能体了。

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 显示装配
        chatModel = "openAiChatModel", // 指定大语言模型
        chatMemory = "chatMemory" // 指定记忆组件
)
public interface AssistantService {
    String chat(String msg);
}
```

#### 3.4.3 测试

```java
@Test
public void testChatMemory() {
    String result1 = assistantService.chat("我是哈小浪");
    System.out.println(result1);
    String result2 = assistantService.chat("我是谁");
    System.out.println(result2);
}
```

### 3.5 隔离聊天记忆

为每个用户的新聊天或者不同的用户区分聊天记忆。

#### 3.5.1 配置 ChatMemoryProvider

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Configuration
public class SeparateChatAssistantConfig {
    @Bean
    public ChatMemoryProvider chatMemoryProvider() {
        return memoryId -> MessageWindowChatMemory.builder()
                .id(memoryId)
                .maxMessages(9)
                .build();
    }
}
```

#### 3.5.2 创建记忆隔离对话智能体

```java
/**
 * @author zxd
 * @date 2026/5/15
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 显示装配
        chatModel = "openAiChatModel", // 指定大语言模型
        chatMemoryProvider = "chatMemoryProvider" // 指定记忆组件
)
public interface SeparateChatAssistantService {
    /**
     * 区分不同用户聊天的方法
     *
     * @param memoryId    聊天的 id
     * @param userMessage 用户消息
     * @return
     */
    String chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
}
```

**如果使用 chatMemory：**
- 直接指定一个具体的记忆实现实例
- 适用于简单的记忆需求
- 代码更简洁

**如果使用 chatMemoryProvider：**
- 通过 Provider 动态创建记忆组件
- 适用于需要灵活配置或动态选择记忆实现的场景
- 提供更大的灵活性

**同时配置的情况**

如果同时配置了两者，通常 **chatMemoryProvider 会覆盖 chatMemory**，因为 Provider 可以动态创建记忆实例。

**建议**
- 简单场景：只配置 `chatMemory`
- 复杂场景：只配置 `chatMemoryProvider`

#### 3.5.3 测试对话助手

用两个不同的 memoryId 测试聊天记忆的隔离效果

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@SpringBootTest
public class SeparateChatAssistantServiceTest {
    @Autowired
    private SeparateChatAssistantService separateChatAssistantService;

    @Test
    public void testChatMemory() {
        String result1 = separateChatAssistantService.chat(1, "我是哈小浪");
        System.out.println(result1);
        String result2 = separateChatAssistantService.chat(1, "我是谁");
        System.out.println(result2);
        String result3 = separateChatAssistantService.chat(2, "我是谁");
        System.out.println(result3);
    }
}
```

### 3.6 持久化聊天记忆

默认情况下，聊天记忆存储在内存中。如果需要持久化存储，可以实现一个自定义的聊天记忆存储类，以便将聊天消息存储在你选择的任何持久化存储介质中。

#### 3.6.1 整合 MongoDB

```xml
<<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://gxa:gxa123456@127.0.0.1:27017/admin
```

#### 3.6.2 编写 POJO

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document("chat_messages")
public class ChatMessages {
    // 唯一标识，映射到 Mongodb 文档的 _id 字段
    private ObjectId id;
    private Integer memoryId;
    // 存储当前聊天记忆的 json 字段
    private String content;
}
```

#### 3.6.3 编写持久化类

创建一个类实现 `ChatMemoryStore` 接口

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Service
public class MongoChatMemoryStore implements ChatMemoryStore {
    @Autowired
    private MongoTemplate mongoTemplate;

    // 获取指定用户的聊天记住
    @Override
    public List<<ChatMessage> getMessages(Object memoryId) {
        // 1. 构建查询条件
        Criteria criteria = Criteria.where("memoryId").is(memoryId);
        Query query = new Query(criteria);
        // 2. 查询
        ChatMessages chatMessages = mongoTemplate.findOne(query, ChatMessages.class);
        // 如果没有查询到聊天记录返回空的集合
        if (chatMessages == null) {
            return new ArrayList<>();
        }
        // 如果查询到了聊天记录，需要把 mongodb 存储的 json 转换为 List<<ChatMessage> 集合
        return ChatMessageDeserializer.messagesFromJson(chatMessages.getContent());
    }

    // 修改或者新增聊天记录
    @Override
    public void updateMessages(Object memoryId, List<<ChatMessage> messages) {
        // 先用 memoryId 查询聊天记录，如果有就是修改，如果没有聊天记录就是新增
        Criteria criteria = Criteria.where("memoryId").is(memoryId);
        Query query = new Query(criteria);
        // 把聊天的内容设置到 content 字段进行保存，content 保存 messages 序列化后的 Json 数组
        Update update = new Update();
        update.set("content", ChatMessageSerializer.messagesToJson(messages));
        // 根据 query 条件查询出文档，有就进行修改，没有就是新增
        mongoTemplate.upsert(query, update, ChatMessages.class);
    }

    // 删除某个用户的聊天记录
    @Override
    public void deleteMessages(Object memoryId) {
        Criteria criteria = Criteria.where("memoryId").is(memoryId);
        Query query = new Query(criteria);
        mongoTemplate.remove(query, ChatMessages.class);
    }
}
```

#### 3.6.4 修改 SeparateChatAssistantConfig

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Configuration
public class SeparateChatAssistantConfig {
    // 注入持久化对象
    @Autowired
    private MongoChatMemoryStore mongoChatMemoryStore;

    @Bean
    public ChatMemoryProvider chatMemoryProvider() {
        return memoryId -> MessageWindowChatMemory.builder()
                .id(memoryId)
                .maxMessages(9)
                // 配置持久化对象
                .chatMemoryStore(mongoChatMemoryStore)
                .build();
    }
}
```

#### 3.6.5 测试

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@SpringBootTest
public class SeparateChatAssistantServiceTest {
    @Autowired
    private SeparateChatAssistantService separateChatAssistantService;

    @Test
    public void testChatMemory() {
        String result1 = separateChatAssistantService.chat(2, "我是哈小红");
        System.out.println(result1);
        String result2 = separateChatAssistantService.chat(2, "我是谁");
        System.out.println(result2);
    }
}
```

![](/blog/notes-assets/langchain4j/1778900267249-69af28e3-d752-41e9-8ed3-fbff16c7a639.png)

---

## 4. Prompt

### 4.1 系统提示词 @SystemMessage

设定角色，塑造 AI 助手的专业身份，明确助手的能力范围。

#### 4.1.1 配置 @SystemMessage

在 `SeparateChatAssistantService` 类的 `chat` 方法上添加 `@SystemMessage` 注解。

```java
/**
 * @author zxd
 * @date 2026/5/15
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 显示装配
        chatModel = "openAiChatModel", // 指定大语言模型
        chatMemoryProvider = "chatMemoryProvider" // 指定记忆组件
)
public interface SeparateChatAssistantService {
    /**
     * 区分不同用户聊天的方法
     *
     * @param memoryId    聊天的 id
     * @param userMessage 用户消息
     * @return
     */
    @SystemMessage("你是一个旅游助手，可以回答任何和旅游相关的问题") // 系统提示词
    String chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
}
```

`@SystemMessage` 的内容将在后台转换为 `SystemMessage` 对象，并与 `UserMessage` 一起发送给大语言模型（LLM）。`SystemMessage` 的内容只会发送给大模型一次。如果你修改了 `SystemMessage` 的内容，新的 `SystemMessage` 会被发送给大模型，之前的聊天记忆会失效。

#### 4.1.2 测试

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@SpringBootTest
public class SeparateChatAssistantServiceTest {
    @Autowired
    private SeparateChatAssistantService separateChatAssistantService;

    @Test
    public void testChatMemory() {
        String result1 = separateChatAssistantService.chat(1, "你是谁,今天几号");
        System.out.println(result1);
    }
}
```

#### 4.1.3 显示日期

如果要显示今天的日期，我们需要在提示词中添加当前日期的占位符 `{{current_date}}`

```java
/**
 * 区分不同用户聊天的方法
 *
 * @param memoryId    聊天的 id
 * @param userMessage 用户消息
 * @return
 */
@SystemMessage("你是一个旅游助手，可以回答任何和旅游相关的问题。今天是{{current_date}}") // 系统提示词
String chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
```

#### 4.1.4 从资源中加载提示词模版

`@SystemMessage` 注解还可以从资源中加载提示模板：

```text
你是一个旅游助手，可以回答任何和旅游相关的问题。今天是 {{current_date}}。
```

![](/blog/notes-assets/langchain4j/1778902261543-632e0acb-6a1b-4f98-8fa1-adf0bc1b7828.png)

配置

```java
/**
 * 区分不同用户聊天的方法
 *
 * @param memoryId    聊天的 id
 * @param userMessage 用户消息
 * @return
 */
@SystemMessage(fromResource = "my-prompt-template.txt")
String chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
```

测试

```java
@Test
public void testSystemMessage() {
    String result = separateChatAssistantService.chat(1, "你是谁,今天是");
    System.out.println(result);
}
```

### 4.2 用户提示词模版 @UserMessage

获取用户输入

#### 4.2.1 配置 @UserMessage

在 `AssistantService` 的 `chat` 方法中添加注解

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 显示装配
        chatModel = "openAiChatModel", // 指定大语言模型
        chatMemory = "chatMemory" // 指定记忆组件
)
public interface AssistantService {
    @UserMessage("我是哈小浪，我想请教你一下问题，我的问题是:{{it}}") // {{it}} 表示这里唯一的占位符
    String chat(String msg);
}
```

测试

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@SpringBootTest
public class AIServiceTest {
    @Autowired
    private AssistantService assistantService;

    @Test
    public void testChat() {
        String result = assistantService.chat("你好，我是谁?");
        System.out.println(result);
    }
}
```

#### 4.2.2 指定参数名称

##### 4.2.2.1 配置 @V

`@V` 明确指定传递的参数名称

```java
@UserMessage("我是哈小浪，我想请教你一下问题，我的问题是:{{message}}") // {{it}} 表示这里唯一的占位符
String chat(@V("message") String msg);
```

##### 4.2.2.2 多个参数

如果有两个或两个以上的参数，我们必须要用 `@V`，在 `SeparateChatAssistantService` 中定义方法 `chat2`

```java
@SystemMessage(fromResource = "my-prompt-template.txt")
@UserMessage("我是哈小浪，我想请教你一下问题，我的问题是:{{message}}")
String chat2(@MemoryId Integer memoryId, @V("message") String userMessage);
```

测试

`@UserMessage` 中的内容每次都会被和用户问题组织在一起发送给大模型

```java
@Test
public void testChatMemory2() {
    String result1 = separateChatAssistantService.chat2(3, "我是谁?你是干什么的");
    System.out.println(result1);
}
```

![](/blog/notes-assets/langchain4j/1778903483739-78a2f609-f203-4750-938e-fe13c5405525.png)

### 4.3 @SystemMessage 和 @V 结合使用

也可以将 `@SystemMessage` 和 `@V` 结合使用。在 `SeparateChatAssistantService` 中添加方法 `chat3`

创建提示词模板 `my-prompt-template2.txt`，添加占位符

```text
你是我的好朋友，我是{{username}}，我的年龄是{{age}}，请用四川话回答问题，回答问题的时候适当添加表情符号。
今天是 {{current_date}}。
```

在 `SeparateChatAssistantService` 中添加方法 `chat3`

```java
@SystemMessage(fromResource = "my-prompt-template2.txt")
String chat3(@MemoryId Integer memoryId, @UserMessage String userMessage,
             @V("username") String username, @V("age") Integer age);
```

测试

```java
@Test
public void testChatMemory3() {
    String result = separateChatAssistantService.chat3(3, "我是谁，我多大了", "哈小浪", 3);
    System.out.println(result);
}
```

---

## 5. 项目实战 - 基础构建

这部分我们实现芙蓉医疗的基本聊天功能，包含聊天记忆、聊天记忆持久化、提示词。

### 5.1 提示词模版

```text
你的名字是"芙蓉医疗助手"，你是一家名为"芙蓉医院"的智能客服。
你是一个训练有素的医疗顾问和医疗伴诊助手。
你态度友好、礼貌且言辞简洁。

1、请仅在用户发起第一次会话时，和用户打个招呼，并介绍你是谁。

2、作为一个训练有素的医疗顾问：
请基于当前临床实践和研究，针对患者提出的特定健康问题，提供详细、准确且实用的医疗建议。请同时考虑可能的病因、诊断流程、治疗方案以及预防措施，并给出在不同情境下的应对策略。对于药物治疗，请特别指明适用的药品名称、剂量和疗程。如果需要进一步的检查或就医，也请明确指示。

3、作为医疗伴诊助手，你可以回答用户就医流程中的相关问题，主要包含以下功能：
AI 分导诊：根据患者的病情和就医需求，智能推荐最合适的科室。
AI 挂号助手：实现智能查询是否有挂号号源服务；实现智能预约挂号服务；实现智能取消挂号服务。

4、你必须遵守的规则如下：
在获取挂号预约详情或取消挂号预约之前，你必须确保自己知晓用户的姓名（必选）、身份证号（必选）、预约科室（必选）、预约日期（必选，格式举例：2025-12-18）、预约时间（必选，格式：上午 或 下午）、预约医生（可选）。
当被问到其他领域的咨询时，要表示歉意并说明你无法在这方面提供帮助。

5、请在回答的结果中适当包含一些轻松可爱的图标和表情。

6、今天是 {{current_date}}。
```

### 5.2 配置持久化和记忆隔离

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Configuration
public class FurongAgentConfig {
    @Autowired
    private MongoChatMemoryStore mongoChatMemoryStore;

    @Bean
    public ChatMemoryProvider chatMemoryProvider() {
        return memoryId -> MessageWindowChatMemory.builder()
                .id(memoryId)
                .maxMessages(9)
                .chatMemoryStore(mongoChatMemoryStore)
                .build();
    }
}
```

### 5.3 创建智能体

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 手动装配
        chatModel = "openAiChatModel", // 指定大语言模型
        chatMemoryProvider = "chatMemoryProvider"
)
public interface FurongAgent {
    @SystemMessage(fromResource = "furong-prompt-template.txt")
    String chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
}
```

### 5.4 封装对话对象

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Data
public class ChatDto {
    // 对话 id
    private Integer memoryId;
    // 用户问题
    private String message;
}
```

### 5.5 编写 Controller

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@RestController
@Tag(name = "芙蓉医疗智能助手")
public class ChatController {
    @Autowired
    private FurongAgent furongAgent;

    @PostMapping("/chat")
    @Operation(summary = "聊天接口")
    public String chat(@RequestBody ChatDto chatDto) {
        String result = furongAgent.chat(chatDto.getMemoryId(), chatDto.getMessage());
        return result;
    }
}
```

### 5.6 测试

![](/blog/notes-assets/langchain4j/1778913035691-785b61d0-1820-440b-a557-b4daa3dc9d2e.png)

![](/blog/notes-assets/langchain4j/1766043680607-3a937af8-6f44-401c-8541-35b5e0d1e0c2.png)

**待优化：**

**信息查询：** 提示词中还应该提供医院信息（如位置信息、营业时间等）、科室信息（都有哪些科室）、医生信息（都有哪些医生）

**业务实现：** 预约、取消预约、查询是否预约等

信息查询可以使用 RAG 检索增强生成；业务实现需要通过 Function Calling 函数调用来实现。

---

## 6. Function Calling

Function Calling 函数调用，也叫 Tools 工具。

大模型虽然可以理解自然语言，更清晰弄懂用户意图，但是却无法直接操作数据库、执行严格的业务规则。这个时候我们就可以整合传统应用于大模型的能力了。

简单来说，可以分为以下步骤：

1. 我们可以把传统应用中的部分功能封装成一个个函数（Function）。
2. 然后在提示词中描述用户的需求，并且描述清楚每个函数的作用，要求 AI 理解用户意图，判断什么时候需要调用哪个函数，并且将任务拆解为多个步骤（Agent）。
3. 当 AI 执行到某一步，需要调用某个函数时，会返回要调用的函数名称、函数需要的参数信息。
4. 传统应用接收到这些数据以后，就可以调用本地函数。再把函数执行结果封装为提示词，再次发送给 AI。
5. 以此类推，逐步执行，直到达成最终结果。

**通俗来说：** 当人看：你问 ta「我明天去杭州出差，要带伞吗？」，ta 让你先看天气预报，你看了告诉 ta，ta 再告诉你要不要带伞。

流程如图：

![](/blog/notes-assets/langchain4j/1750037557079-dbc515f9-583a-4507-a462-c96981fc6f5c.png)

**注意：** 并不是所有大模型都支持 Function Calling，比如 DeepSeek-R1 模型就不支持。

### 6.1 入门

例如，大语言模型本身并不擅长数学运算。如果应用场景中偶尔会涉及到数学计算，我们可以为他提供一个"数学工具"。当我们提出问题时，大语言模型会判断是否使用某个工具。

#### 6.1.1 创建工具

用 `@Tool` 注解的方法：既可以是静态的，也可以是非静态的；可以具有任何可见性（公有、私有等）。

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Component
public class CalculatorTools {
    @Tool(name = "两个数相加")
    public double sum(double a, double b) {
        System.out.println("调用加法运算");
        return a + b;
    }

    @Tool(name = "计算平方根")
    public double squareRoot(double x) {
        System.out.println("调用平方根运算");
        return Math.sqrt(x);
    }
}
```

#### 6.1.2 配置工具类

新增 `ToolAgent`，配置 `tools` 属性。

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 手动装配
        chatModel = "openAiChatModel", // 指定大语言模型
        chatMemoryProvider = "chatMemoryProvider",
        tools = "calculatorTools" // 配置工具
)
public interface ToolAgent {
    String chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
}
```

#### 6.1.3 测试工具

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@SpringBootTest
public class TestToolAgent {
    @Autowired
    private ToolAgent toolAgent;

    @Test
    public void testCallTool() {
        toolAgent.chat(1, "1+2等于几,3的平方根是多少?");
    }
}
```

测试后可以查看持久化存储中 SYSTEM、USER、AI 以及 Tools 的消息，分析 tools 的调用流程：

![](/blog/notes-assets/langchain4j/1778916580737-e9fce734-cb36-4e4d-8a09-ad0bd4b87265.png)

### 6.2 @Tool 注解的可选字段

`@Tool` 注解有两个可选字段：

- **name (工具名称)**：工具的名称。如果未提供该字段，方法名会作为工具的名称。
- **value (工具描述)**：工具的描述信息。

根据工具的不同，即使没有任何描述，大语言模型可能也能很好地理解它（例如，`add(a, b)` 就很直观），但通常最好提供清晰且有意义的名称和描述。这样，大语言模型就能获得更多信息，以决定是否调用给定的工具以及如何调用。

### 6.3 @P 注解

方法参数可以选择使用 `@P` 注解进行标注。`@P` 注解有两个字段：

- **value**：参数的描述信息，这是必填字段。
- **required**：表示该参数是否为必需项，默认值为 true，此为可选字段。

### 6.4 @ToolMemoryId

如果你的 AIService 方法中有一个参数使用 `@MemoryId` 注解，那么你也可以使用 `@ToolMemoryId` 注解 `@Tool` 方法中的一个参数。提供给 AIService 方法的值将自动传递给 `@Tool` 方法。如果你有多个用户，或每个用户有多个聊天记忆，并且希望在 `@Tool` 方法中对它们进行区分，那么这个功能会很有用。

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Component
public class CalculatorTools {
    @Tool(name = "两个数相加", value = "返回两个数之和")
    public double sum(@ToolMemoryId Integer memoryId,
                      @P(value = "加数1", required = true) double a,
                      @P(value = "加数2", required = true) double b) {
        System.out.println("调用加法运算:" + memoryId);
        return a + b;
    }

    @Tool(name = "计算平方根", value = "返回平方根")
    public double squareRoot(@ToolMemoryId Integer memoryId,
                               @P(value = "平方根数", required = true) double x) {
        System.out.println("调用平方根运算:" + memoryId);
        return Math.sqrt(x);
    }
}
```

![](/blog/notes-assets/langchain4j/1766046773201-63e3424d-67d5-48ac-8df9-db0b14767ee4.png)

### 6.5 查询天气预报的接口

![](/blog/notes-assets/langchain4j/1778917858398-f7bd1b47-8b50-4a2f-b4a9-34a7a19b6912.png)

```
1. 获取指定城市的编码
https://restapi.amap.com/v3/geocode/geo?address=成都&key=YOUR_KEY

2. 获取指定编码的天气预报
https://restapi.amap.com/v3/weather/weatherInfo?city=610100&extensions=all&key=YOUR_KEY
```

![](/blog/notes-assets/langchain4j/1778917964602-91ddf144-f3d9-4954-9baf-d79f507ffa86.png)

![](/blog/notes-assets/langchain4j/1778918012611-d6813602-2b4b-4066-9859-024162c927b5.png)

入口类

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@SpringBootApplication // 启动类
public class AgentApplication {
    public static void main(String[] args) {
        SpringApplication.run(AgentApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@SpringBootTest
public class TestWeather {
    @Autowired
    private RestTemplate restTemplate;

    @Test
    public void testFindCode() throws JsonProcessingException {
        String result = restTemplate.getForObject(
                "https://restapi.amap.com/v3/geocode/geo?address={address}&key={key}",
                String.class, "成都", "a82b54416678");
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(result);
        JsonNode geocodesNode = rootNode.path("geocodes");
        if (geocodesNode.isArray() && geocodesNode.size() > 0) {
            String adcode = geocodesNode.get(0).path("adcode").asText();
            System.out.println("提取的 adcode: " + adcode);
        }
    }

    @Test
    public void testWeather() {
        String result = restTemplate.getForObject(
                "https://restapi.amap.com/v3/weather/weatherInfo?city={city}&extensions=all&key={key}",
                String.class, "510100", "a82b5441e9ddfbde9423675f8ca26678");
        System.out.println(result);
    }
}
```

### 6.6 编写旅游助手的智能体

#### 6.6.1 编写查询天气的工具

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Component
public class WeatherTools {
    @Autowired
    private RestTemplate restTemplate;

    @Tool(name = "查询天气", value = "返回城市的天气预报")
    public String getWeather(@P(value = "城市名称", required = true) String city) {
        // 1. 查询 api 获取城市编码
        String cityCode = getCityCode();
        // 2. 查询天气 api 获取天气信息
        String result = restTemplate.getForObject(
                "https://restapi.amap.com/v3/weather/weatherInfo?city={city}&extensions=all&key={key}",
                String.class, cityCode, "a82b5441e9dd75f8ca26678");
        return result;
    }

    private String getCityCode() {
        try {
            String result = restTemplate.getForObject(
                    "https://restapi.amap.com/v3/geocode/geo?address={address}&key={key}",
                    String.class, "成都", "a82b5441e9ddfbd");
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(result);
            JsonNode geocodesNode = rootNode.path("geocodes");
            if (geocodesNode.isArray() && geocodesNode.size() > 0) {
                String adcode = geocodesNode.get(0).path("adcode").asText();
                System.out.println("提取的 adcode: " + adcode);
                return adcode;
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("获取指定城市编码失败!");
        }
    }
}
```

#### 6.6.2 编写系统提示词

```text
你的名字是"小安的旅游助手"，你是一家名为"安安旅游"的智能客服。
你是一个训练有素的旅游顾问。
你态度友好、礼貌且言辞简洁。

1、请仅在用户发起第一次会话时，和用户打个招呼，并介绍你是谁。

2、作为一个训练有素的旅游顾问，你可以提供以下服务：
- 旅游目的地推荐：根据用户的偏好、预算和时间，推荐合适的旅游景点和线路
- 行程规划：帮助用户制定详细的旅行计划，包括交通、住宿、景点安排等
- 旅游攻略：提供目的地的美食、购物、文化习俗等实用信息
- 天气查询：当用户询问某个城市的天气情况或计划前往某地旅游时，必须使用天气查询工具获取实时天气信息
- 签证和证件：解答关于护照、签证等旅行证件的问题
- 旅行安全：提供旅行安全提示和应急联系方式

3、作为旅游助手，你还可以回答以下问题：
- 最佳旅行时间和季节推荐
- 交通工具选择（飞机、火车、汽车等）及票务信息
- 酒店和民宿预订建议
- 当地特色美食推荐
- 景点门票价格和开放时间
- 旅行预算规划和省钱技巧

4、重要规则
- 天气查询：
  - 当用户提到具体城市名称并询问天气、气候、穿衣建议等信息时，你必须调用"查询天气"工具获取准确的天气预报
  - 在为用户规划某个城市的旅行行程时，主动调用"查询天气"工具了解当地天气状况，以便给出更合理的建议
  - 当用户准备出行或正在旅行中询问某地天气时，务必使用"查询天气"工具提供实时天气信息
  - 获取天气信息后，结合天气情况为用户提供个性化的旅游建议（如雨天室内活动推荐、晴天户外景点推荐等）

5、请在回答的结果中适当包含一些轻松可爱的图标和表情，让对话更加生动有趣。

6、今天是 {{current_date}}。
```

![](/blog/notes-assets/langchain4j/1778920223726-a409daf1-2e66-4d41-8e38-61ebf5eda724.png)

#### 6.6.3 编写 AI Service

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 手动装配
        chatModel = "openAiChatModel", // 指定大语言模型
        chatMemoryProvider = "chatMemoryProvider",
        tools = "weatherTools" // 配置工具
)
public interface ToolAgent {
    @SystemMessage(fromResource = "weather-prompt-template.txt")
    String chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
}
```

测试

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@SpringBootTest
public class TestToolAgent {
    @Autowired
    private ToolAgent toolAgent;

    @Test
    public void testToolAgent() {
        String result = toolAgent.chat(1, "你是谁");
        System.out.println(result);
        String result2 = toolAgent.chat(1, "我想去成都旅游");
        System.out.println(result2);
    }
}
```

---

## 7. 项目实战 - 业务实现

### 7.1 整合 Mybatis Plus

![](/blog/notes-assets/langchain4j/1747461918720-7030c82a-3d0d-4f8a-9ad7-2e97dd00da3b.png)

#### 7.1.1 导入 mybatis-plus 自动装配的依赖

```xml
<<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.10.1</version>
</dependency>
```

#### 7.1.2 导入驱动

MySQL 5.7

```xml
<!-- 导入数据库驱动 -->
<<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.32</version>
</dependency>
```

MySQL 8

```xml
<!-- 导入数据库驱动 -->
<<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.23</version>
</dependency>
```

#### 7.1.3 配置全局配置文件

MySQL 5.7

```yaml
server:
  port: 8080
  servlet:
    context-path: /
spring:
  data:
    mongodb:
      uri: mongodb://gxa:gxa123456@82.156.73.71:27017/furong
    datasource:
      driver-class-name: com.mysql.jdbc.Driver
      url: jdbc:mysql://localhost:3306/ai?characterEncoding=UTF-8
      username: root
      password: root
langchain4j:
  open-ai:
    chat-model:
      base-url: https://api.siliconflow.cn
      api-key: ${GJLD_API_KEY}
      model-name: Pro/zai-org/GLM-5.1
      log-requests: true
      log-responses: true
mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.gxa.ai.pojo
  configuration:
    # 输出日志，可以将真正的执行 sql 打印在控制台
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    # 开启驼峰的自动识别命名规则: peopl_name -> peopleName
    map-underscore-to-camel-case: true
logging:
  level:
    org.springframework.ai.chat.client.advisor: debug
```

MySQL 8

```yaml
server:
  port: 8080
  servlet:
    context-path: /
spring:
  data:
    mongodb:
      uri: mongodb://gxa:gxa123456@39.104.27.23:27017/furong
    datasource:
      driver-class-name: com.mysql.cj.jdbc.Driver
      url: jdbc:mysql://localhost:3306/ai?characterEncoding=UTF-8
      username: root
      password: root
langchain4j:
  open-ai:
    chat-model:
      base-url: https://api.siliconflow.cn
      api-key: ${GJLD_API_KEY}
      model-name: Pro/zai-org/GLM-5.1
      log-requests: true
      log-responses: true
mybatis-plus:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.gxa.ai.pojo
  configuration:
    # 输出日志，可以将真正的执行 sql 打印在控制台
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    # 开启驼峰的自动识别命名规则: peopl_name -> peopleName
    map-underscore-to-camel-case: true
logging:
  level:
    org.springframework.ai.chat.client.advisor: debug
```

#### 7.1.4 配置入口类

```java
/**
 * @author zxd
 * @date 2026/5/10
 */
@SpringBootApplication // 启动类
@MapperScan("com.gxa.ai.mapper")
public class AgentApplication {
    public static void main(String[] args) {
        SpringApplication.run(AgentApplication.class, args);
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

### 7.2 预约业务实现

这部分我们实现芙蓉医疗的查询预约单、预约预约单、取消预约单的功能。

#### 7.2.1 创建表

![](/blog/notes-assets/langchain4j/1779499577035-dd5173ea-f4d5-4c8e-b05b-f6de3fa08f49.png)

```sql
CREATE TABLE `fr_appointment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `id_card` VARCHAR(18) NOT NULL,
  `department` VARCHAR(50) NOT NULL,
  `date` VARCHAR(10) NOT NULL,
  `time` VARCHAR(10) NOT NULL,
  `doctor_name` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```

![](/blog/notes-assets/langchain4j/1766047159259-3cef3373-06ef-4bec-b675-9de91039c64d.png)

#### 7.2.2 编写 POJO

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
@Data // 创建 getter & setter 方法 & toString
@TableName("fr_appointment") // 配置数据库表名
public class Appointment {
    // 配置主键自动增长
    @TableId(type = IdType.AUTO)
    private Long id;
    @TableField("username") // 配置数据库字段名，如果属性名和数据库字段名一致可以不用配置
    private String username;
    @TableField("id_card")
    private String idCard;
    @TableField("department")
    private String department;
    @TableField("date")
    private String date;
    @TableField("time")
    private String time;
    @TableField("doctor_name")
    private String doctorName;
}
```

#### 7.2.3 编写 Mapper

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
public interface AppointmentMapper extends BaseMapper<<Appointment> {
}
```

#### 7.2.4 测试 Mapper

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
@SpringBootTest
public class TestAppointmentMapper {
    @Autowired
    private AppointmentMapper appointmentMapper;

    @Test
    public void testInsert() {
        Appointment appointment = new Appointment();
        appointment.setUsername("哈小浪");
        appointment.setIdCard("123456789012345678");
        appointment.setDepartment("内科");
        appointment.setDate("2026-05-23");
        appointment.setTime("10:00");
        appointment.setDoctorName("好医生");
        int result = appointmentMapper.insert(appointment);
        System.out.println(result);
    }

    @Test
    public void testUpdate() {
        Appointment appointment = new Appointment();
        appointment.setId(1L);
        appointment.setUsername("张三2");
        appointment.setIdCard("111");
        appointment.setDepartment("内科1");
        appointment.setDate("2026-05-21");
        appointment.setTime("09:00");
        appointment.setDoctorName("张三3");
        int result = appointmentMapper.updateById(appointment);
        System.out.println(result);
    }

    @Test
    public void testFind() {
        Appointment appointment = appointmentMapper.selectById(1L);
        System.out.println(appointment);
    }

    @Test
    public void testQuery() {
        QueryWrapper<<Appointment> queryWrapper = new QueryWrapper<>();
        queryWrapper.like("username", "哈");
        queryWrapper.eq("department", "内科");
        List<<Appointment> appointmentList = appointmentMapper.selectList(queryWrapper);
        System.out.println(appointmentList);

        LambdaQueryWrapper<<Appointment> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.like(Appointment::getUsername, "哈");
        lambdaQueryWrapper.eq(Appointment::getDepartment, "内科");
        List<<Appointment> appointmentList2 = appointmentMapper.selectList(lambdaQueryWrapper);
        System.out.println(appointmentList2);
    }

    @Test
    public void testUpdateWrapper() {
        UpdateWrapper<<Appointment> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", 2);
        updateWrapper.set("username", "班长");
        updateWrapper.set("department", "内科2");
        int result = appointmentMapper.update(updateWrapper);
        System.out.println(result);

        LambdaUpdateWrapper<<Appointment> lambdaUpdateWrapper = new LambdaUpdateWrapper<>();
        lambdaUpdateWrapper.eq(Appointment::getId, 2);
        lambdaUpdateWrapper.set(Appointment::getUsername, "班长");
        lambdaUpdateWrapper.set(Appointment::getDepartment, "内科");
        int result2 = appointmentMapper.update(lambdaUpdateWrapper);
        System.out.println(result2);
    }

    @Test
    public void testDelete() {
        int result = appointmentMapper.deleteById(3L);
        System.out.println(result);
    }
}
```

#### 7.2.5 通用的 Service

编写 Service 的接口

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
public interface AppointmentService extends IService<<Appointment> {
}
```

编写实现

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
@Service
public class AppointmentServiceImpl extends ServiceImpl<<AppointmentMapper, Appointment> implements AppointmentService {
}
```

测试

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
@SpringBootTest
public class TestAppointmentService {
    @Autowired
    private AppointmentService appointmentService;

    @Test
    public void testInsert() {
        Appointment appointment = new Appointment();
        appointment.setUsername("哈小浪");
        appointment.setIdCard("123456789012345678");
        appointment.setDepartment("内科");
        appointment.setDate("2026-05-23");
        appointment.setTime("10:00");
        appointment.setDoctorName("好医生");
        Boolean result = appointmentService.save(appointment);
        System.out.println(result);
    }

    @Test
    public void testUpdate() {
        Appointment appointment = new Appointment();
        appointment.setId(5L);
        appointment.setUsername("张三2");
        appointment.setIdCard("111");
        appointment.setDepartment("内科1");
        appointment.setDate("2026-05-21");
        appointment.setTime("09:00");
        appointment.setDoctorName("张三3");
        Boolean result = appointmentService.updateById(appointment);
        System.out.println(result);
    }

    @Test
    public void testFind() {
        Appointment appointment = appointmentService.getById(1L);
        System.out.println(appointment);
    }

    @Test
    public void testQuery() {
        QueryWrapper<<Appointment> queryWrapper = new QueryWrapper<>();
        queryWrapper.like("username", "哈");
        queryWrapper.eq("department", "内科");
        List<<Appointment> appointmentList = appointmentService.list(queryWrapper);
        System.out.println(appointmentList);

        LambdaQueryWrapper<<Appointment> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.like(Appointment::getUsername, "哈");
        lambdaQueryWrapper.eq(Appointment::getDepartment, "内科");
        List<<Appointment> appointmentList2 = appointmentService.list(lambdaQueryWrapper);
        System.out.println(appointmentList2);
    }

    @Test
    public void testUpdateWrapper() {
        UpdateWrapper<<Appointment> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", 2);
        updateWrapper.set("username", "班长");
        updateWrapper.set("department", "内科2");
        Boolean result = appointmentService.update(updateWrapper);
        System.out.println(result);

        LambdaUpdateWrapper<<Appointment> lambdaUpdateWrapper = new LambdaUpdateWrapper<>();
        lambdaUpdateWrapper.eq(Appointment::getId, 2);
        lambdaUpdateWrapper.set(Appointment::getUsername, "班长");
        lambdaUpdateWrapper.set(Appointment::getDepartment, "内科");
        Boolean result2 = appointmentService.update(lambdaUpdateWrapper);
        System.out.println(result2);
    }

    @Test
    public void testDelete() {
        Boolean result = appointmentService.removeById(5L);
        System.out.println(result);
    }
}
```

#### 7.2.6 实现预约记录的查询

编写接口

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
public interface AppointmentService extends IService<<Appointment> {
    /**
     * 查询预约单号是否存在
     *
     * @param appointment
     * @return
     */
    Appointment getOne(Appointment appointment);
}
```

编写实现

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
@Service
public class AppointmentServiceImpl extends ServiceImpl<<AppointmentMapper, Appointment> implements AppointmentService {
    /**
     * 查询预约单号是否存在
     *
     * @param appointment
     * @return
     */
    @Override
    public Appointment getOne(Appointment appointment) {
        LambdaQueryWrapper<<Appointment> lambdaQueryWrapper = new LambdaQueryWrapper<>();
        lambdaQueryWrapper.eq(Appointment::getUsername, appointment.getUsername());
        lambdaQueryWrapper.eq(Appointment::getIdCard, appointment.getIdCard());
        lambdaQueryWrapper.eq(Appointment::getDepartment, appointment.getDepartment());
        lambdaQueryWrapper.eq(Appointment::getDate, appointment.getDate());
        lambdaQueryWrapper.eq(Appointment::getTime, appointment.getTime());
        Appointment appointmentNew = getBaseMapper().selectOne(lambdaQueryWrapper);
        return appointmentNew;
    }
}
```

#### 7.2.7 测试

```java
/**
 * @author zxd
 * @date 2025/12/18
 */
@SpringBootTest
public class TestAppointmentService {
    @Autowired
    private AppointmentService appointmentService;

    @Test
    void testGetOne() {
        Appointment appointment = new Appointment();
        appointment.setUsername("哈小浪");
        appointment.setIdCard("123456789012345678");
        appointment.setDepartment("内科");
        appointment.setDate("2025-12-18");
        appointment.setTime("上午");
        Appointment appointmentNew = appointmentService.getOne(appointment);
        System.out.println(appointmentNew);
    }

    @Test
    void testSave() {
        Appointment appointment = new Appointment();
        appointment.setUsername("哈小浪");
        appointment.setIdCard("123456789012345678");
        appointment.setDepartment("内科");
        appointment.setDate("2025-12-18");
        appointment.setTime("上午");
        appointment.setDoctorName("张医生");
        appointmentService.save(appointment);
    }

    @Test
    void testDelete() {
        appointmentService.removeById(1L);
    }
}
```

### 7.3 编写预约工具

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
@Component
public class AppointmentTools {
    @Autowired
    private AppointmentService appointmentService;

    @Tool(name = "预约挂号", value = "根据参数，先执行 queryDepartment 查询是否可以预约，" +
            "并且直接给用户回答是否可预约，并让用户确认所有预约信息，用户在确认后再进行预约")
    public String addAppointment(Appointment appointment) {
        // 1. 查询数据是否包含对应的预约记录
        Appointment appointmentNew = appointmentService.getOne(appointment);
        if (appointmentNew == null) {
            // 实现预约的业务
            appointment.setId(null); // 防止大模型幻觉设置 id
            if (appointmentService.save(appointment)) {
                return "预约成功，并返回预约详细";
            } else {
                return "预约失败";
            }
        } else {
            return "您在相同的科室和时间已经有预约";
        }
    }

    @Tool(name = "取消预约", value = "根据参数，查询预约是否存在，如果存在删除预约记录并返回取消成功，否则返回取消失败")
    public String cancelAppointment(Appointment appointment) {
        Appointment appointmentNew = appointmentService.getOne(appointment);
        if (appointmentNew != null) {
            // 删除预约记录
            if (appointmentService.removeById(appointmentNew.getId())) {
                return "取消预约成功";
            } else {
                return "取消预约失败";
            }
        }
        // 取消失败
        return "您没有预约记录，请核对预约的科室和时间";
    }

    @Tool(name = "查询是否有号源", value = "根据科室名称，日期，时间和医生查询是否有号源，并返回给用户")
    public boolean queryDepartment(@P(value = "科室名称", required = true) String name,
                                   @P(value = "日期", required = true) String date,
                                   @P(value = "时间，可选值: 上午,下午", required = true) String time,
                                   @P(value = "医生名称", required = true) String doctorName) {
        System.out.println("查询是否有号源");
        System.out.println("查询科室名称:" + name);
        System.out.println("查询日期:" + date);
        System.out.println("查询时间:" + time);
        System.out.println("查询医生名称:" + doctorName);
        // TODO 维护医生的排班信息
        // 如果没有指定医生名称，则根据其他条件查询是否有可以预约的医生，有返回 true，没有就返回 false
        // 如果指定了医生名称，则判断医生是否有排班（没有排班返回 false）
        // 如果有排班，则判断医生排班时间段是否已经预约满，满了返回 false，没有满返回 true
        return true;
    }
}
```

### 7.4 配置 Tools

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 手动装配
        chatModel = "openAiChatModel", // 指定大语言模型
        chatMemoryProvider = "chatMemoryProvider",
        tools = "appointmentTools"
)
public interface FurongAgent {
    @SystemMessage(fromResource = "furong-prompt-template.txt")
    String chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
}
```

### 7.5 测试

![](/blog/notes-assets/langchain4j/1766108733190-92e67b8e-4236-440f-9657-4276f9561a3c.png)

---

## 8. RAG

### 8.1 大模型存在的问题

大模型并非完美，预训练数据导致了基础差异和不可进化。

![画板](/blog/notes-assets/langchain4j/1749787148297-333c6d05-c233-41ae-bfb1-75dc1fddbeff.jpeg)

**预训练数据陈旧**
- Claude: 2023年8月
- DeepSeek R1: 2023年12月
- GPT-4o: 2023年10月
- Llama 3.3: 2023年10月

**预训练数据不全面**
- 未公开数据
- 企业内部数据
- 实时动态数据
- 专业性极强的内部知识
- 伦理限制的内容
- 小众文化信息

### 8.2 RAG：检索增强生成是什么

![检索增强生成](/blog/notes-assets/langchain4j/1749180067133-7497a048-7ad7-4753-87ad-384d298414e5.jpeg)

**检索增强生成** 将原始问题以及提示词信息发送给大语言模型之前，先通过外部知识库检索相关信息，然后将检索结果和原始问题一起发送给大模型，大模型依据外部知识库再结合自身的训练数据，组织自然语言回答问题。通过这种方式，大语言模型可以获取到特定领域的相关信息，并能够利用这些信息进行回复。

- **优点**：数据存储在外部知识库，可以实时更新，不依赖对模型自身的训练，成本更低。
- **缺点**：需要两次查询：先查询知识库，然后再查询大模型，性能不如微调大模型。
- **应用场景**：适用于知识库规模大且频繁更新的场景，如企业客服、实时新闻查询、法律和医疗领域的最新知识问答等。

### 8.3 RAG 的组成

从大的方向来说 RAG 由检索、增强、生成三部分组成。

1. RAG 利用向量量化首先将知识库向量化。
2. 将用户的输入也进行向量化。
3. 在提问大模型前先进行向量搜索，找到与问题语义最接近的文档块。
4. 将相关文档嵌入提示词。
5. 提交大模型得到一个更优质答案。

![画板](/blog/notes-assets/langchain4j/1749449097410-d427b2d3-d51e-42ab-9879-d339c245e5d4.jpeg)

### 8.4 数据预处理

**文档向量化是进行向量搜索的前置条件。**

![流程](/blog/notes-assets/langchain4j/1749187036004-292e6782-2493-449e-a801-d40d6643eba8.png)

加载文档 → 分割文档 → 嵌入文档 → 存储文档

![流程](/blog/notes-assets/langchain4j/1749187161546-90cd8f83-c213-431a-a161-2bf8941759bf.png)

各种文档 → 各种 loader → 文本切片 → 向量化 → 向量存储 → 向量检索

### 8.5 RAG 常用方法

**全文（关键词）搜索**

这种方法通过将问题和提示词中的关键词与知识库文档数据库进行匹配来搜索文档。根据这些关键词在每个文档中的出现频率和相关性对搜索结果进行排序。

**向量搜索（语义搜索）**

文本通过嵌入模型被转换为数字向量。然后，它根据查询向量与文档向量之间的余弦相似度或其他相似性/距离度量来查找和排序文档，从而捕捉更深层次的语义含义。

**混合搜索**

结合多种搜索方法（例如，全文搜索 + 向量搜索）通常可以提高搜索的效果。

### 8.6 文档加载器

#### 8.6.1 常见文档加载器

- 来自 langchain4j 模块的文件系统文档加载器（`FileSystemDocumentLoader`）
- 来自 langchain4j 模块的类路径文档加载器（`ClassPathDocumentLoader`）
- 来自 langchain4j 模块的网址文档加载器（`UrlDocumentLoader`）
- 来自 langchain4j-document-loader-amazon-s3 模块的亚马逊 S3 文档加载器（`AmazonS3DocumentLoader`）
- 来自 langchain4j-document-loader-azure-storage-blob 模块的 Azure Blob 存储文档加载器（`AzureBlobStorageDocumentLoader`）
- 来自 langchain4j-document-loader-github 模块的 GitHub 文档加载器（`GitHubDocumentLoader`）
- 来自 langchain4j-document-loader-google-cloud-storage 模块的谷歌云存储文档加载器（`GoogleCloudStorageDocumentLoader`）
- 来自 langchain4j-document-loader-selenium 模块的 Selenium 文档加载器（`SeleniumDocumentLoader`）
- 来自 langchain4j-document-loader-tencent-cos 模块的腾讯云对象存储文档加载器（`TencentCosDocumentLoader`）

#### 8.6.2 测试文档加载

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
@SpringBootTest
public class RAGTest {
    @Test
    public void testReaderDocument() {
        // 使用 FileSystemDocumentLoader 读取指定目录下的知识库文档
        // 并使用默认的文档解析器 TextDocumentParser 对文档进行解析
        Document document = FileSystemDocumentLoader.loadDocument("E:\\code\\code\\knowledge\\测试.txt");
        System.out.println(document.text());
    }
}
```

其它加载文档的方式

```java
@Test
public void testReaderDocument2() {
    // 1. 加载单个文档
    Document document = FileSystemDocumentLoader.loadDocument("E:\\code\\code\\knowledge\\测试.txt", new TextDocumentParser());
    System.out.println(document.text());

    // 2. 从一个目录中加载所有的文档
    List<Document> documents = FileSystemDocumentLoader.loadDocuments("E:\\code\\code\\knowledge", new TextDocumentParser());
    System.out.println(documents);

    // 从一个目录中加载所有的 txt 文档
    PathMatcher pathMatcher = FileSystems.getDefault().getPathMatcher("glob:*.txt");
    List<Document> documents2 = FileSystemDocumentLoader.loadDocuments("E:\\code\\code\\knowledge", pathMatcher, new TextDocumentParser());
    System.out.println(documents2);

    // 从一个目录以及子目录中加载所有文档
    List<Document> documentList = FileSystemDocumentLoader.loadDocumentsRecursively("E:\\code\\code\\knowledge", new TextDocumentParser());
    System.out.println(documentList);
}
```

### 8.7 文档解析器

#### 8.7.1 常见文档解析器

文档可以是各种格式的文件，比如 PDF、DOC、TXT 等。为了解析这些不同格式的文件，有一个"文档解析器"（`DocumentParser`）接口，并且我们的库中包含了该接口的几种实现方式：

- 来自 langchain4j 模块的文本文档解析器（`TextDocumentParser`），它能够解析纯文本格式的文件（例如 TXT、HTML、MD 等）。
- 来自 langchain4j-document-parser-apache-pdfbox 模块的 Apache PDFBox 文档解析器（`ApachePdfBoxDocumentParser`），它可以解析 PDF 文件。
- 来自 langchain4j-document-parser-apache-poi 模块的 Apache POI 文档解析器（`ApachePoiDocumentParser`），它能够解析微软办公软件的文件格式（例如 DOC、DOCX、PPT、PPTX、XLS、XLSX 等）。
- 来自 langchain4j-document-parser-apache-tika 模块的 Apache Tika 文档解析器（`ApacheTikaDocumentParser`），它可以自动检测并解析几乎所有现有的文件格式。

假设如果我们想解析 PDF 文档，那么原有的 **TextDocumentParser** 就无法工作了，我们需要引入 **langchain4j-document-parser-apache-pdfbox**

#### 8.7.2 添加依赖

```xml
<!-- 解析 pdf 文档 -->
<<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-document-parser-apache-pdfbox</artifactId>
</dependency>
```

#### 8.7.3 解析 PDF 文档

```java
@Test
public void testParPDF() {
    Document document = FileSystemDocumentLoader.loadDocument(
            "E:\\code\\code\\knowledge\\大模型基础知识.pdf",
            new ApachePdfBoxDocumentParser());
    System.out.println(document);
}
```

### 8.8 文档分割器 Document Splitter

LangChain4j 有一个"文档分割器"（`DocumentSplitter`）接口，并且提供了几种开箱即用的实现方式：

- 按段落文档分割器（`DocumentByParagraphSplitter`）
- 按行文档分割器（`DocumentByLineSplitter`）
- 按句子文档分割器（`DocumentBySentenceSplitter`）
- 按单词文档分割器（`DocumentByWordSplitter`）
- 按字符文档分割器（`DocumentByCharacterSplitter`）
- 按正则表达式文档分割器（`DocumentByRegexSplitter`）
- 递归分割：`DocumentSplitters.recursive(...)`
- 默认情况下每个文本片段最多不能超过 300 个 token

### 8.9 向量转换和向量存储

常见的意思是"嵌入（向量）存储"。在机器学习和自然语言处理领域，Embedding 指的是将数据（如文本、图像等）转换为低维稠密向量表示的过程，这些向量能够保留数据的关键特征。而 Stores 表示存储，即用于存储这些嵌入向量的系统或工具。它们可以高效地存储和检索向量数据，支持向量相似性搜索，在文本检索、推荐系统、图像识别等任务中发挥着重要作用。

Langchain4j 支持的向量存储：[https://docs.langchain4j.dev/integrations/embedding-stores/](https://docs.langchain4j.dev/integrations/embedding-stores/)

添加依赖：

```xml
<<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-easy-rag</artifactId>
</dependency>
```

#### 8.9.1 加载文档并存入向量数据库

```java
@Test
public void testReadDocumentAndStore() {
    // 1. 加载文档
    Document document = FileSystemDocumentLoader.loadDocument(
            "E:\\code\\code\\knowledge\\大模型基础知识.pdf",
            new ApachePdfBoxDocumentParser());

    // 2. 为了方便演示，暂时使用内存的向量存储
    InMemoryEmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();

    // 1. 默认使用递归的分割器，将文档分割为多个片段，每个片段不超过 300 个 Token，并且 30 个 token 重叠
    // 2. 文档向量化：使用 LangChain4j 内置了一个轻量化的向量模型对每个文档进行向量化
    // 3. 将原始文本和向量存储到向量数据库
    EmbeddingStoreIngestor.ingest(document, embeddingStore);

    // 查询向量数据库的内容
    System.out.println(embeddingStore);
}
```

#### 8.9.2 测试文档分割

```java
@Test
public void testDocumentSpliter() {
    // 1. 加载文档
    Document document = FileSystemDocumentLoader.loadDocument(
            "E:\\code\\code\\knowledge\\大模型基础知识.pdf",
            new ApachePdfBoxDocumentParser());

    // 2. 为了方便演示，暂时使用内存的向量存储
    InMemoryEmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();

    // 3. 文档分割器
    DocumentByParagraphSplitter documentByParagraphSplitter = new DocumentByParagraphSplitter(600, 30);
    EmbeddingStoreIngestor.builder()
            .embeddingStore(embeddingStore)
            .documentSplitter(documentByParagraphSplitter)
            .build()
            .ingest(document);
}
```

### 8.10 Embedding 详解

当我们有了一组切好的 documents 后，接下来的一步就需要向量化，进而可以实现向量搜索。

![embedding](/blog/notes-assets/langchain4j/1749439945031-04178080-1830-4cd0-89dd-bf4e3317ea38.png)

embedding 是将数据对象（如文本）映射到固定大小的连续一维数字数组（向量空间）的技术。向量空间通常具有几百到几千的维度，每个维度代表某个语义特征或属性，然后我们可以使用数学运算来比较嵌入向量。

![向量空间](/blog/notes-assets/langchain4j/1749440065468-1211aacc-098b-4ea3-ab4c-8a742cbeaffc.png)

在 embedding 向量空间中，语义相似的实体在向量空间中映射得更近，而不相似的实体映射得更远，这也是向量模型需要学习的目标。

![相似度](/blog/notes-assets/langchain4j/1751010577462-4810f9ec-2bac-4e7c-83ff-74fbbe25119d.png)

通过计算两个向量之间的距离，可以判断向量相似度。欧氏距离越小，相似度越高；余弦距离越大，相似度越高。

![距离计算](/blog/notes-assets/langchain4j/1751010938736-0d6a0ef1-435b-4ae9-beb8-d6cbd376e487.png)

### 8.11 项目中集成 RAG

#### 8.11.1 修改 Agent 配置

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Configuration
public class FurongAgentConfig {
    @Autowired
    private MongoChatMemoryStore mongoChatMemoryStore;

    @Bean
    public ChatMemoryProvider chatMemoryProvider() {
        return memoryId -> MessageWindowChatMemory.builder()
                .id(memoryId)
                .maxMessages(9)
                .chatMemoryStore(mongoChatMemoryStore)
                .build();
    }

    @Bean
    ContentRetriever contentRetriever() {
        // 1. 加载文档，并使用默认的文档解析器对文档进行解析
        Document document1 = FileSystemDocumentLoader.loadDocument("E:\\code\\code\\knowledge\\医院信息.md");
        Document document2 = FileSystemDocumentLoader.loadDocument("E:\\code\\code\\knowledge\\科室信息.md");
        Document document3 = FileSystemDocumentLoader.loadDocument("E:\\code\\code\\knowledge\\神经内科.md");
        List<Document> documents = Arrays.asList(document1, document2, document3);

        // 2. 创建内存向量数据库
        InMemoryEmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();

        // 3. 使用默认的文档分割器 & 存储文档
        EmbeddingStoreIngestor.ingest(documents, embeddingStore);

        // 创建内容检索器
        return EmbeddingStoreContentRetriever.from(embeddingStore);
    }
}
```

#### 8.11.2 在 AIService 中配置 ContentRetriever

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 手动装配
        chatModel = "openAiChatModel", // 指定大语言模型
        chatMemoryProvider = "chatMemoryProvider",
        tools = "appointmentTools",
        contentRetriever = "contentRetriever" // 配置向量数据库的检索器
)
public interface FurongAgent {
    @SystemMessage(fromResource = "furong-prompt-template.txt")
    String chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
}
```

#### 8.11.3 修改工具提示

```java
@Tool(name = "预约挂号", value = "根据参数，先执行工具方法 queryDepartment 查询是否可预约，并直接给" +
        "用户回答是否可预约，并让用户确认所有预约信息，用户确认后再进行预约。如果用户没有提供具体的医生姓名，请从向量存储中找到一位医生。")
public String addAppointment(Appointment appointment) {
    // 1. 查询数据是否包含对应的预约记录
    Appointment appointmentNew = appointmentService.getOne(appointment);
    if (appointmentNew == null) {
        // 实现预约的业务
        appointment.setId(null); // 防止大模型幻觉设置 id
        if (appointmentService.save(appointment)) {
            return "预约成功，并返回预约详细";
        } else {
            return "预约失败";
        }
    } else {
        return "您在相同的科室和时间已经有预约";
    }
}
```

测试

![](/blog/notes-assets/langchain4j/1779521402994-c3d13379-6644-4f9e-9a1d-a6a3da3c23fb.png)

---

## 9. 词嵌入模型和向量存储

### 9.1 配置词嵌入模型

```yaml
langchain4j:
  open-ai:
    chat-model:
      base-url: https://api.siliconflow.cn
      api-key: ${GJLD_API_KEY}
      model-name: Pro/zai-org/GLM-5.1
      log-requests: true
      log-responses: true
    embedding-model:
      base-url: https://api.siliconflow.cn/v1
      api-key: ${GJLD_API_KEY}
      model-name: BAAI/bge-m3
```

### 9.2 文本向量化

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
@SpringBootTest
public class EmbeddingTest {
    @Autowired
    private OpenAiEmbeddingModel embeddingModel;

    @Test
    public void testEmbeddingModel() {
        String text = "早上好";
        Response<<Embedding> embed = embeddingModel.embed(text);
        System.out.println("向量维度:" + embed.content().vector().length);
        System.out.println("向量输出:" + embed.content().toString());
    }
}
```

### 9.3 向量数据库

#### 9.3.1 Pinecone 介绍和注册

之前我们使用的是 `InMemoryEmbeddingStore` 作为向量存储，但是不建议在生产中使用基于内存的向量存储。因此这里我们使用 Pinecone 作为向量数据库。

[Pinecone](https://www.pinecone.io/) 是一种流行的基于云的向量数据库，可让您有效地存储和搜索向量。

1. Pinecone 账户：在开始之前，请注册一个 [Pinecone 账户](https://app.pinecone.io/)。
2. Pinecone 项目：注册后，生成 API 密钥并创建索引。您需要这些详细信息才能进行配置。
3. `EmbeddingModel` 实例来计算文档嵌入。

访问官方网站、注册、登录、获取 apiKey 且配置在环境变量中。**默认有 2GB 的免费存储空间**

创建索引

![](/blog/notes-assets/langchain4j/1779522309850-c9e35701-1356-4da5-b50b-1810d9eb7ad3.png)

#### 9.3.2 导入依赖

```xml
<<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-pinecone</artifactId>
</dependency>
```

#### 9.3.3 配置向量数据库

```java
package com.gxa.ai.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.pinecone.PineconeEmbeddingStore;
import dev.langchain4j.store.embedding.pinecone.PineconeServerlessIndexConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @author zxd
 * @date 2026/5/23
 */
@Configuration
public class EmbeddingStoreConfig {
    @Autowired
    private EmbeddingModel embeddingModel;

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        // 创建向量存储
        EmbeddingStore<TextSegment> embeddingStore = PineconeEmbeddingStore.builder()
                .apiKey("pcsk_7QJxYj_P4MR3C8Y2xXzRf9LSq5vDYSrrrD3zm9XV2wJQaCC7DBPoyj2bSgQBxadYpn898H")
                .index("langchain4j") // 如果指定的索引不存在，将创建一个新的索引
                .nameSpace("langchin4j-namespace") // 如果指定的名称空间不存在，将创建一个新的名称空间
                .createIndex(PineconeServerlessIndexConfig.builder()
                        .cloud("AWS") // 指定索引部署在 AWS 云服务上
                        .region("us-east-1") // 指定索引所在的 AWS 区域为 us-east-1
                        .dimension(embeddingModel.dimension()) // 指定索引的向量维度，该维度与 embeddingModel 生成的向量维度相同
                        .build())
                .build();
        return embeddingStore;
    }
}
```

#### 9.3.4 测试向量数据库

```java
/**
 * @author zxd
 * @date 2026/5/23
 */
@SpringBootTest
public class EmbedStoreTest {
    @Autowired
    private OpenAiEmbeddingModel embeddingModel;
    @Autowired
    private EmbeddingStore embeddingStore;

    @Test
    public void testEmbedStore() {
        // 将文档转换为向量
        TextSegment segment1 = TextSegment.from("我喜欢乒乓球");
        Response<<Embedding> embed1 = embeddingModel.embed(segment1);
        // 存储到向量数据库
        embeddingStore.add(embed1.content(), segment1);

        TextSegment segment2 = TextSegment.from("今天天气很好");
        Response<<Embedding> embed2 = embeddingModel.embed(segment2);
        embeddingStore.add(embed2.content(), segment2);
    }
}
```

#### 9.3.5 相似度匹配

接收请求获取问题，将问题转换为向量，在 Pinecone 向量数据库中进行相似度搜索，找到最相似的文本片段，并将其文本内容返回给客户端。

```java
@Test
public void testEmbedStoreSearch() {
    // 提问，并将问题转换成向量
    Embedding queryEmbedding = embeddingModel.embed("你最喜欢的运动是什么?").content();

    // 创建搜索请求对象
    EmbeddingSearchRequest searchRequest = EmbeddingSearchRequest.builder()
            .queryEmbedding(queryEmbedding)
            .maxResults(1) // 匹配最相似的一条记录
            .minScore(0.8)
            .build();

    // 使用 searchRequest 去向量数据库检索
    EmbeddingSearchResult<TextSegment> searchResult = embeddingStore.search(searchRequest);

    // 获取结果
    EmbeddingMatch<TextSegment> embeddingMatch = searchResult.matches().get(0);

    // 获取分数
    System.out.println(embeddingMatch.score());
    // 获取文档
    System.out.println(embeddingMatch.embedded().text());
}
```

### 9.4 芙蓉医疗向量数据库配置

#### 9.4.1 上传知识库

```java
@Test
public void testUploadKonwledge() {
    // 1. 加载文档，并使用默认的文档解析器对文档进行解析
    Document document1 = FileSystemDocumentLoader.loadDocument("E:\\code\\code\\knowledge\\医院信息.md");
    Document document2 = FileSystemDocumentLoader.loadDocument("E:\\code\\code\\knowledge\\科室信息.md");
    Document document3 = FileSystemDocumentLoader.loadDocument("E:\\code\\code\\knowledge\\神经内科.md");
    List<Document> documents = Arrays.asList(document1, document2, document3);

    // 2. 存储文档到向量数据库
    EmbeddingStoreIngestor.builder()
            .embeddingStore(embeddingStore)
            .embeddingModel(embeddingModel)
            .build()
            .ingest(documents);
}
```

#### 9.4.2 修改智能体配置

添加基于 Pinecone 的向量数据库配置

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@Configuration
public class FurongAgentConfig {
    @Autowired
    private MongoChatMemoryStore mongoChatMemoryStore;
    @Autowired
    private EmbeddingStore embeddingStore;
    @Autowired
    private EmbeddingModel embeddingModel;

    @Bean
    public ChatMemoryProvider chatMemoryProvider() {
        return memoryId -> MessageWindowChatMemory.builder()
                .id(memoryId)
                .maxMessages(9)
                .chatMemoryStore(mongoChatMemoryStore)
                .build();
    }

    @Bean
    ContentRetriever contentRetriever() {
        EmbeddingStoreContentRetriever contentRetriever = EmbeddingStoreContentRetriever.builder()
                // 设置词嵌入模型
                .embeddingModel(embeddingModel)
                // 设置向量存储
                .embeddingStore(embeddingStore)
                // 设置最大结果数
                .maxResults(3)
                // 设置最小分数，只有相似度大于 0.5 才返回
                .minScore(0.5)
                .build();
        return contentRetriever;
    }
}
```

#### 9.4.3 修改 Agent

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 手动装配
        chatModel = "openAiChatModel", // 指定大语言模型
        chatMemoryProvider = "chatMemoryProvider",
        tools = "appointmentTools",
        contentRetriever = "contentRetriever" // 配置向量数据库的检索器
)
public interface FurongAgent {
    @SystemMessage(fromResource = "furong-prompt-template.txt")
    String chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
}
```

### 9.5 配置流式输出

大模型的流式输出是指大模型在生成文本或其他类型的数据时，不是等到整个生成过程完成后再一次性返回所有内容，而是生成一部分就立即发送一部分给用户或下游系统，以逐步、逐块的方式返回结果。

这样，用户就不需要等待整个文本生成完成再看到结果。通过这种方式可以改善用户体验，因为用户不需要等待太长时间，几乎可以立即开始阅读响应。

#### 9.5.1 添加依赖

```xml
<<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-reactor</artifactId>
</dependency>
```

#### 9.5.2 配置流式输出模型

```yaml
langchain4j:
  open-ai:
    chat-model:
      base-url: https://api.siliconflow.cn
      api-key: ${GJLD_API_KEY}
      model-name: Pro/zai-org/GLM-5.1
      log-requests: true
      log-responses: true
    streaming-chat-model:
      base-url: https://api.siliconflow.cn
      api-key: ${GJLD_API_KEY}
      model-name: Pro/zai-org/GLM-5.1
      log-requests: true
      log-responses: true
    embedding-model:
      base-url: https://api.siliconflow.cn/v1
      api-key: ${GJLD_API_KEY}
      model-name: BAAI/bge-m3
```

#### 9.5.3 修改 Agent

修改 `FurongAgent` 中 `chatModel` 改为 `streamingChatModel = "openAiStreamingChatModel"`，`chat` 方法的返回值为 `Flux<String>`

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@AiService(
        wiringMode = AiServiceWiringMode.EXPLICIT, // 手动装配
        streamingChatModel = "openAiStreamingChatModel", // 指定大语言模型
        chatMemoryProvider = "chatMemoryProvider",
        tools = "appointmentTools",
        contentRetriever = "contentRetriever" // 配置向量数据库的检索器
)
public interface FurongAgent {
    @SystemMessage(fromResource = "furong-prompt-template.txt")
    Flux<String> chat(@MemoryId Integer memoryId, @UserMessage String userMessage);
}
```

### 9.6 编写流式输出 Controller

修改 `ChatController` 中 `chat` 方法的返回值为 `Flux<String>`，并添加 `produces` 属性

```java
/**
 * @author zxd
 * @date 2026/5/16
 */
@RestController
@Tag(name = "芙蓉医疗智能助手")
public class ChatController {
    @Autowired
    private FurongAgent furongAgent;

    @PostMapping(value = "/chat", produces = "text/stream;charset=utf-8")
    @Operation(summary = "聊天接口")
    public Flux<String> chat(@RequestBody ChatDto chatDto) {
        return furongAgent.chat(chatDto.getMemoryId(), chatDto.getMessage());
    }
}

![](/blog/notes-assets/langchain4j/1779525827225-c69e8b69-c131-4b0d-bdef-483499c4f3df.png)
