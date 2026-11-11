---
title: 'Go 基础语法笔记：从 Hello World 到接口'
date: 2026-06-16
summary: '变量、切片、map、结构体、方法与接口，配合可运行的最小示例过一遍 Go 的语法骨架。'
tags: ['Go', '语法', '基础']
origin: 'Golang 基础语法笔记.md'
---
## Golang 基础语法笔记

> 来源：Go官方文档 + Go中文社区整理  
> 更新日期：2026-06-16  
> 标签：Golang 编程语言

---

### 一、Hello World 与程序结构

```go
package main  // 主包，可执行程序的入口

import "fmt"  // 导入格式输出包

func main() {  // 主函数，程序入口
    fmt.Println("Hello, World!")
}
```

**关键概念：**
- 每个Go文件都属于一个包（package）
- `main` 包是可执行程序的入口
- `main()` 函数是程序的起点
- 大括号 `{}` 不可省略（即使只有一行）
- 每行语句末尾**不需要**分号（Go自动添加）

---

### 二、变量与常量

#### 2.1 变量声明

```go
// 方式1：标准声明
var name string = "Alice"

// 方式2：类型推断
var age = 25

// 方式3：短变量声明（只能在函数内部）
city := "Beijing"

// 方式4：多重声明
var x, y int = 1, 2
```

#### 2.2 零值规则

| 类型 | 零值 |
|------|------|
| int | 0 |
| float64 | 0.0 |
| string | "" |
| bool | false |
| pointer | nil |

#### 2.3 常量

```go
const Pi = 3.14159
const (
    Size = 1024
    Name = "Golang"
)
```

#### 2.4 iota 枚举

```go
const (
    Sunday = iota  // 0
    Monday         // 1
    Tuesday        // 2
)
```

---

### 三、基本数据类型

| 类型 | 说明 | 示例 |
|------|------|------|
| uint8/16/32/64 | 无符号整数 | uint8 |
| int8/16/32/64 | 有符号整数 | int64 |
| float32/64 | 浮点数 | float64 |
| complex64/128 | 复数 | complex128 |
| bool | 布尔 | true/false |
| string | 字符串 | "hello" |
| rune | 字符（Unicode码点） | '中' |
| byte | 字节（uint8别名） | 'a' |

**注意：**
- Go**没有**隐式类型转换，必须显式转换：`int32(floatValue)`
- `rune` 是 `int32` 的别名，用于表示 Unicode 字符
- `byte` 是 `uint8` 的别名，用于表示字节

---

### 四、字符串操作

```go
package main

import "fmt"

func main() {
    s := "Hello, 世界"
    
    // 长度
    fmt.Println(len(s))  // UTF-8字节长度
    
    // 遍历
    for i, r := range s {  // i:字节索引, r:unicode码点
        fmt.Printf("%d:%c ", i, r)
    }
    
    // 子串
    fmt.Println(s[0:5])  // "Hello"
    
    // 字符串不可变，修改需要转成[]byte或[]rune
    bytes := []byte(s)
    bytes[0] = 'h'
    fmt.Println(string(bytes))  // "hello, 世界"
    
    // 常用包
    // "strings" - 字符串操作
    // "strconv" - 类型转换
}
```

---

### 五、数组与切片

#### 5.1 数组

```go
// 固定长度，值类型
var arr [5]int
arr[0] = 10
arr := [3]int{1, 2, 3}

// 二维数组
matrix := [2][3]int{{1,2,3},{4,5,6}}
```

#### 5.2 切片（Slice）— 重点！

```go
// 创建切片
s := []int{1, 2, 3, 4, 5}

// make创建
s2 := make([]int, 5, 10)  // len=5, cap=10

// 切片操作
sub := s[1:3]  // [2, 3]
copy(s2, s)    // 拷贝
append(s, 6)   // 追加元素

// 切片的底层结构
// ptr -> [元素1, 元素2, ...]
// len: 当前元素个数
// cap: 容量（底层数组大小）

// 注意：切片是引用类型，多个切片可能共享同一底层数组
// 使用 copy() 可以避免共享
```

**切片 vs 数组：**
- 数组：固定长度，值类型，传递时会拷贝整个数组
- 切片：动态长度，引用类型（指向底层数组的指针+长度+容量）

---

### 六、Map（映射）

```go
// 声明
var m map[string]int

// 必须用make初始化
m = make(map[string]int)
m["age"] = 25

// 一行写法
m2 := map[string]int{
    "Alice": 25,
    "Bob":   30,
}

// 查
val, ok := m["key"]  // ok=false表示key不存在

// 删
delete(m, "key")

// 遍历
for k, v := range m {
    fmt.Println(k, v)
}
```

---

### 七、控制语句

#### 7.1 if-else

```go
if x > 0 {
    return 1
} else if x == 0 {
    return 0
} else {
    return -1
}

// if支持初始化语句
if err := doSomething(); err != nil {
    log.Fatal(err)
}
```

#### 7.2 for — Go唯一的循环语句

```go
// 经典for
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// while风格
for condition {
    // ...
}

// 无限循环
for {
    break  // 退出循环
}

// 遍历
for i, v := range slice {
    fmt.Println(i, v)
}

for key, value := range map {
    fmt.Println(key, value)
}
```

#### 7.3 switch

```go
switch day := time.Now().Weekday(); day {
case time.Sunday, time.Saturday:
    fmt.Println("周末")
case time.Monday, time.Tuesday, time.Wednesday, time.Thursday, time.Friday:
    fmt.Println("工作日")
default:
    fmt.Println("未知")
}

// 无条件的switch（类似if-else链）
switch {
case x > 0:
    fmt.Println("正数")
case x < 0:
    fmt.Println("负数")
default:
    fmt.Println("零")
}
```

---

### 八、函数

#### 8.1 基本定义

```go
func add(a int, b int) int {
    return a + b
}

// 同类型可简写
func add(a, b int) int {
    return a + b
}
```

#### 8.2 多返回值

```go
func div(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("除数为零")
    }
    return a / b, nil
}

// 调用
result, err := div(10, 0)
```

#### 8.3 命名返回值

```go
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return  // 直接返回，x和y已命名
}
```

#### 8.4 可变参数

```go
func sum(nums ...int) int {
    total := 0
    for _, num := range nums {
        total += num
    }
    return total
}

sum(1, 2, 3)  // 6
nums := []int{1, 2, 3}
sum(nums...)  // 展开切片
```

#### 8.5 匿名函数与闭包

```go
// 匿名函数
f := func() int { return 42 }
fmt.Println(f())

// 闭包
func closure() func() int {
    i := 0
    return func() int {
        i++
        return i
    }
}
next := closure()
next()  // 1
next()  // 2
```

---

### 九、结构体

#### 9.1 定义与使用

```go
type Person struct {
    Name string
    Age  int
}

// 创建实例
p := Person{Name: "Alice", Age: 25}
p2 := &Person{Name: "Bob", Age: 30}  // 指针

// 访问字段
fmt.Println(p.Name)
fmt.Println(p2.Age)
```

#### 9.2 方法

```go
type Circle struct {
    Radius float64
}

// 值接收者
func (c Circle) Area() float64 {
    return 3.14 * c.Radius * c.Radius
}

// 指针接收者（可修改）
func (c *Circle) Scale(factor float64) {
    c.Radius *= factor
}
```

#### 9.3 组合（Go中没有继承）

```go
type Employee struct {
    Person  // 嵌入字段（组合）
    Salary  int
}

emp := Employee{
    Person: Person{Name: "Alice", Age: 25},
    Salary: 5000,
}
fmt.Println(emp.Name)  // 直接访问嵌入字段
```

---

### 十、接口

#### 10.1 接口定义

```go
type Shape interface {
    Area() float64
    Perimeter() float64
}

type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}
func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}
// 无需implements关键字，隐式实现接口
```

#### 10.2 空接口

```go
// interface{} 或 any（Go 1.18+）
var any interface{} = 42
var any2 any = "hello"
```

#### 10.3 类型断言

```go
var v interface{} = "hello"
s := v.(string)        // 直接断言
s, ok := v.(string)    // 安全断言
```

#### 10.4 类型选择

```go
switch v := value.(type) {
case int:
    fmt.Printf("int: %d\n", v)
case string:
    fmt.Printf("string: %s\n", v)
default:
    fmt.Printf("unknown: %T\n", v)
}
```

---

### 十一、错误处理

```go
// Go没有异常机制，使用error
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("除数不能为零: %f", b)
    }
    return a / b, nil
}

// 自定义错误
type MyError struct {
    When time.Time
    What string
}

func (e *MyError) Error() string {
    return fmt.Sprintf("at %v, %s", e.When, e.What)
}

// defer延迟执行
func main() {
    f := os.Create("test.txt")
    defer f.Close()  // 确保关闭
    // ... 使用文件
}
```

---

### 十二、并发（Goroutine + Channel）

#### 12.1 Goroutine

```go
func sayHello(name string) {
    for i := 0; i < 5; i++ {
        fmt.Println(name)
        time.Sleep(100 * time.Millisecond)
    }
}

func main() {
    go sayHello("Alice")  // 启动goroutine
    sayHello("Bob")       // 主goroutine
}
```

#### 12.2 Channel

```go
// 创建channel
ch := make(chan int)       // 无缓冲
chBuf := make(chan int, 3) // 缓冲大小为3

// 发送和接收
ch <- 42       // 发送
x := <-ch      // 接收
<-ch           // 只发送，丢弃结果

// range遍历channel
for val := range ch {
    fmt.Println(val)
}

// 关闭channel
close(ch)
val, ok := <-ch  // ok=false表示已关闭且无数据
```

#### 12.3 select

```go
select {
case msg1 := <-ch1:
    fmt.Println("received", msg1)
case msg2 := <-ch2:
    fmt.Println("received", msg2)
default:
    fmt.Println("no message")
}
```

#### 12.4 sync.WaitGroup

```go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(n int) {
        defer wg.Done()
        fmt.Println(n)
    }(i)
}
wg.Wait()  // 等待所有goroutine完成
```

---

### 十三、包与模块管理

#### 13.1 包导出规则

- **大写开头** = 导出的（public）
- **小写开头** = 私有的（private）

#### 13.2 go mod

```bash
## 初始化模块
go mod init example.com/mymodule

## 添加依赖
go get github.com/some/package

## 整理依赖
go mod tidy

## 查看依赖
go mod graph
go mod why package
```

#### 13.3 go.mod 示例

```
module example.com/mymodule

go 1.22

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/stretchr/testify v1.8.4
)
```

---

### 十四、反射（Reflection）

```go
import "reflect"

v := 42
t := reflect.TypeOf(v)   // 类型：int
val := reflect.ValueOf(v) // 值：42

// 获取类型信息
fmt.Println(t.Name())     // "int"
fmt.Println(t.Kind())     // "int"

// 通过反射设置值（需要指针）
val.Elem().SetInt(100)
```

---

### 十五、测试

```go
// 测试文件命名：xxx_test.go
package calc

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    if result != 5 {
        t.Errorf("Add(2,3) = %d; want 5", result)
    }
}

// 基准测试
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(1, 2)
    }
}

// 子测试
func TestCalculator(t *testing.T) {
    t.Run("Addition", func(t *testing.T) {
        // ...
    })
    t.Run("Division", func(t *testing.T) {
        // ...
    })
}
```

```bash
go test ./...
go test -v          # 详细输出
go test -bench=.    # 基准测试
go test -race       # 竞态检测
```

---

### 十六、常用标准库速查

| 包名 | 用途 |
|------|------|
| fmt | 格式化输入输出 |
| strconv | 字符串类型转换 |
| strings | 字符串操作 |
| bytes | 字节切片操作 |
| math | 数学运算 |
| time | 时间处理 |
| json | JSON序列化/反序列化 |
| encoding/csv | CSV读写 |
| net/http | HTTP客户端和服务端 |
| os | 操作系统接口 |
| io | I/O操作 |
| sync | 同步原语（Mutex, WaitGroup等） |
| log | 日志 |
| errors | 错误处理 |
| context | 上下文取消 |

---

### 十七、常用命令速查

```bash
go run main.go          # 运行程序
go build                # 编译
go test ./...           # 运行测试
go fmt                  # 格式化代码
go vet                  # 静态分析
go doc package          # 查看文档
go env                  # 查看环境变量
GOOS=linux GOARCH=amd64 go build  # 交叉编译
go mod tidy             # 整理依赖
```

---

*整理自 Go官方文档 和 Go中文社区*
