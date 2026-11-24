## Gin 框架学习笔记

> 来源：Gin官方文档 + Go中文社区  
> 更新日期：2026-06-16  
> 标签：Golang Gin Web框架

---

### 一、Gin 简介

Gin 是一个用 Go 编写的高性能 HTTP Web 框架。
特点：
- 基于 httprouter，性能优秀
- 支持路由分组、中间件
- 简单易用，API 友好
- 崩溃恢复能力强

安装：
```bash
go get -u github.com/gin-gonic/gin
```

---

### 二、快速开始

#### 2.1 Hello World

```go
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    r.GET("/hello", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Hello, World!",
        })
    })
    r.Run(":8080")  // 监听并在 0.0.0.0:8080 上启动服务
}
```

#### 2.2 基本路由

```go
r := gin.Default()

// GET请求
r.GET("/users", GetUser)

// POST请求
r.POST("/users", CreateUser)

// PUT请求
r.PUT("/users/:id", UpdateUser)

// DELETE请求
r.DELETE("/users/:id", DeleteUser)

// PATCH请求
r.PATCH("/users/:id", PatchUser)

// 任意方法
r.Any("/users", AnyMethodHandler)

// 指定路径的所有路由
r.NoRoute(func(c *gin.Context) {
    c.JSON(404, gin.H{"error": "Not Found"})
})
```

---

### 三、路由与参数

#### 3.1 路径参数

```go
r := gin.Default()

// 单个路径参数
r.GET("/users/:id", func(c *gin.Context) {
    id := c.Param("id")
    c.JSON(200, gin.H{"user_id": id})
})

// 通配符路由
r.GET("/users/*action", func(c *gin.Context) {
    action := c.Param("action")  // 例如 "/admin"
    c.JSON(200, gin.H{"action": action})
})

// 匹配路径参数
r.GET("/users/:id/profile", func(c *gin.Context) {
    id := c.Param("id")
    c.JSON(200, gin.H{"user_id": id})
})
```

#### 3.2 查询参数

```go
r := gin.Default()

r.GET("/users/search", func(c *gin.Context) {
    // 获取单个查询参数
    name := c.Query("name")
    
    // 获取带默认值的查询参数
    page := c.DefaultQuery("page", "1")
    
    // 获取所有查询参数
    params := c.Request.URL.Query()
    
    // BindQuery 绑定查询参数到结构体
    var req SearchRequest
    if err := c.ShouldBindQuery(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, gin.H{
        "name": name,
        "page": page,
    })
})

type SearchRequest struct {
    Name  string `form:"name"`
    Page  int    `form:"page"`
    Size  int    `form:"size"`
}
```

#### 3.3 表单数据

```go
r := gin.Default()

r.POST("/users/form", func(c *gin.Context) {
    // 绑定表单数据
    var form FormUser
    if err := c.ShouldBind(&form); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, gin.H{
        "username": form.Username,
        "email":    form.Email,
    })
})

type FormUser struct {
    Username string `form:"username" binding:"required"`
    Email    string `form:"email" binding:"required,email"`
    Age      int    `form:"age"`
}
```

---

### 四、请求绑定

#### 4.1 ShouldBind 自动识别

```go
r := gin.Default()

r.POST("/bind", func(c *gin.Context) {
    var bound interface{}
    var binding string
    
    contentType := c.ContentType()
    switch {
    case contentType == "application/json":
        binding = "json"
        bound = &JSONUser{}
    case contentType == "application/xml":
        binding = "xml"
        bound = &XMLUser{}
    default:
        binding = "form"
        bound = &FormUser{}
    }
    
    if err := c.ShouldBindWith(bound, binding); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(200, gin.H{"message": "OK"})
})

type JSONUser struct {
    Name  string `json:"name" binding:"required"`
    Age   int    `json:"age"`
}
```

#### 4.2 绑定标签

```go
type User struct {
    Name    string `uri:"user_id" binding:"required"`
    Email   string `json:"email" binding:"required,email"`
    Age     int    `json:"age" binding:"gte=0,lte=150"`
    Gender  string `form:"gender" binding:"oneof=male female"`
    Address string `form:"address" binding:"required"`
}
```

常用绑定标签：
- `binding:"required"` - 必填
- `binding:"email"` - 邮箱格式
- `binding:"url"` - URL格式
- `binding:"gte=0"` - 大于等于0
- `binding:"lte=100"` - 小于等于100
- `binding:"oneof=a b c"` - 枚举值
- `binding:"-"` - 忽略绑定

#### 4.3 绑定方式

```go
// JSON绑定
var json User
c.ShouldBindJSON(&json)

// XML绑定
var xml User
c.ShouldBindXML(&xml)

// 表单绑定
var form User
c.ShouldBindForm(&form)

// Query绑定
var query User
c.ShouldBindQuery(&query)

// URI绑定（路径参数）
var uri User
c.ShouldBindUri(&uri)

// 自动绑定（根据Content-Type）
var bound interface{}
c.ShouldBind(&bound)
```

---

### 五、中间件

#### 5.1 全局中间件

```go
r := gin.Default()

// 全局中间件，对所有路由生效
r.Use(Logger())
r.Use(Authentication())
r.Use(Middleware())

r.GET("/test", func(c *gin.Context) {
    c.JSON(200, gin.H{"message": "hello"})
})
```

#### 5.2 路由组中间件

```go
r := gin.Default()

// 路由组中间件
admin := r.Group("/admin", Authentication())
{
    admin.GET("/dashboard", AdminDashboard)
    admin.POST("/settings", AdminSettings)
}

// 嵌套路由组
v1 := r.Group("/api/v1")
{
    v1.Use(RateLimit())
    v1.GET("/users", ListUsers)
}

v2 := r.Group("/api/v2")
{
    v2.Use(RateLimit())
    v2.Use(NewRelic())
    v2.GET("/users", ListUsersV2)
}
```

#### 5.3 自定义中间件

```go
// 日志中间件
func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        
        c.Next()  // 执行后续handler
        
        latency := time.Since(start)
        log.Printf("[%d] %s %v", 
            c.Writer.Status(), path, latency)
    }
}

// 认证中间件
func Authentication() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, gin.H{"error": "Missing token"})
            c.Abort()  // 中断请求
            return
        }
        
        // 验证token
        if !validateToken(token) {
            c.JSON(403, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }
        
        c.Next()
    }
}

// CORS中间件
func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    }
}
```

#### 5.4 Panic 恢复中间件

```go
func RecoveryMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if err := recover(); err != nil {
                // 记录panic堆栈
                debug.PrintStack()
                c.JSON(500, gin.H{"error": "Internal Server Error"})
            }
        }()
        c.Next()
    }
}
```

---

### 六、响应处理

#### 6.1 JSON响应

```go
c.JSON(200, gin.H{
    "code":    200,
    "message": "success",
    "data":    userData,
})

// 自定义Content-Type
c.Render(200, render.JSON{Data: gin.H{"key": "value"}})
c.XML(200, gin.H{"key": "value"})
c.YAML(200, gin.H{"key": "value"})
c.ProvideJSON(200, gin.H{"key": "value"})
```

#### 6.2 文件下载

```go
// 下载文件
c.File("./uploads/test.pdf")

// 下载文件并重命名
c.FileAttachment("./uploads/test.pdf", "report.pdf")

// 流式下载
c.StreamingWriter(func(w io.Writer) bool {
    // 逐块写入
    return true
})
```

#### 6.3 重定向

```go
c.Redirect(301, "https://www.example.com/")
c.Redirect(302, "/new-path")
c.Redirect(302, routeUrl("User", gin.H{"id": 1}))
```

#### 6.4 上下文存储

```go
// 存储用户信息
c.Set("userID", "123")
c.Set("userName", "Alice")

// 获取值
userID, exists := c.Get("userID")
userName := c.GetString("userName")

// 存储在中间件中共享
c.Set("requestID", uuid.New().String())
```

---

### 七、项目结构示例

```
cmd/
  api/
    main.go          # 入口
internal/
  handler/
    user_handler.go
    product_handler.go
  middleware/
    auth.go
    cors.go
    logger.go
  model/
    user.go
    product.go
  service/
    user_service.go
pkg/
  response/
    response.go
configs/
  config.yaml
```

#### 7.1 main.go

```go
package main

import (
    "your_project/internal/handler"
    "your_project/internal/middleware"
    "github.com/gin-gonic/gin"
)

func main() {
    router := gin.New()
    router.Use(gin.Recovery())
    router.Use(middleware.Logger())
    router.Use(middleware.CORS())
    
    // 注册路由
    handler.RegisterRoutes(router)
    
    router.Run(":8080")
}
```

#### 7.2 handler/user_handler.go

```go
package handler

import (
    "net/http"
    "your_project/internal/service"
    "github.com/gin-gonic/gin"
)

type UserHandler struct {
    userService *service.UserService
}

func NewUserHandler() *UserHandler {
    return &UserHandler{
        userService: service.NewUserService(),
    }
}

func (h *UserHandler) RegisterRoutes(r *gin.Engine) {
    users := r.Group("/api/users")
    {
        users.GET("", h.ListUsers)
        users.GET("/:id", h.GetUser)
        users.POST("", h.CreateUser)
        users.PUT("/:id", h.UpdateUser)
        users.DELETE("/:id", h.DeleteUser)
    }
}

func (h *UserHandler) ListUsers(c *gin.Context) {
    users, err := h.userService.ListAll()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": err.Error(),
        })
        return
    }
    c.JSON(http.StatusOK, gin.H{
        "data": users,
    })
}

func (h *UserHandler) GetUser(c *gin.Context) {
    id := c.Param("id")
    user, err := h.userService.GetByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "User not found",
        })
        return
    }
    c.JSON(http.StatusOK, gin.H{
        "data": user,
    })
}
```

#### 7.3 统一响应格式

```go
package response

import "github.com/gin-gonic/gin"

type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

func Success(c *gin.Context, data interface{}) {
    c.JSON(200, Response{
        Code:    200,
        Message: "success",
        Data:    data,
    })
}

func Error(c *gin.Context, code int, message string) {
    c.JSON(code, Response{
        Code:    code,
        Message: message,
    })
}

func BadRequest(c *gin.Context, message string) {
    Error(c, 400, message)
}

func Unauthorized(c *gin.Context, message string) {
    Error(c, 401, message)
}

func Forbidden(c *gin.Context, message string) {
    Error(c, 403, message)
}

func NotFound(c *gin.Context, message string) {
    Error(c, 404, message)
}

func InternalError(c *gin.Context, message string) {
    Error(c, 500, message)
}
```

---

*整理自 Gin官方文档 (github.com/gin-gonic/gin)*
