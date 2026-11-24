## Golang 进阶知识笔记

> 来源：Go官方文档 + Effective Go  
> 更新日期：2026-06-16  
> 标签：Golang 并发编程 泛型

---

### 一、泛型（Generics）— Go 1.18+

#### 1.1 基本概念

```go
// 类型参数用方括号 [] 表示
func First[T any](slice []T) (T, bool) {
    if len(slice) == 0 {
        var zero T
        return zero, false
    }
    return slice[0], true
}

// 使用
num, ok := First[int]([]int{1, 2, 3})  // 1, true
str, ok := First[string]([]string{"a"}) // "a", true
```

#### 1.2 约束（Constraints）

```go
// 使用接口定义约束
type Number interface {
    ~int | ~int64 | ~float64
}

// ~表示可以是该类型的别名
func Sum[T Number](slice []T) T {
    var total T
    for _, v := range slice {
        total += v
    }
    return total
}

// 内置约束
type Integer interface { ~int | ~int64 | ~uint }
type Floating interface { ~float32 | ~float64 }
type Numeric interface { Integer | Floating }
type String interface { ~string }
```

#### 1.3 泛型在容器中的应用

```go
// 泛型链表节点
type Node[T any] struct {
    Value T
    Next  *Node[T]
}

// 泛型栈
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}
```

---

### 二、高级并发模式

#### 2.1 Context 上下文

```go
import "context"

// 创建context
ctx := context.Background()
ctx, cancel := context.WithCancel(ctx)
ctx, timeout := context.WithTimeout(ctx, 5*time.Second)
ctx, cancel := context.WithDeadline(ctx, time.Now().Add(10*time.Minute))

// 携带值
ctx := context.WithValue(parent, key, value)
val := ctx.Value(key)  // 注意：key应为自定义类型避免冲突

// 在goroutine中使用
func worker(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            fmt.Println("worker stopped:", ctx.Err())
            return
        default:
            // 正常工作
        }
    }
}
```

#### 2.2 并发安全的数据结构

```go
type SafeMap struct {
    mu    sync.RWMutex
    data  map[string]int
}

func NewSafeMap() *SafeMap {
    return &SafeMap{data: make(map[string]int)}
}

func (sm *SafeMap) Get(key string) (int, bool) {
    sm.mu.RLock()
    defer sm.mu.RUnlock()
    val, ok := sm.data[key]
    return val, ok
}

func (sm *SafeMap) Set(key string, val int) {
    sm.mu.Lock()
    defer sm.mu.Unlock()
    sm.data[key] = val
}
```

#### 2.3 Worker Pool 模式

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d started job %d\n", id, j)
        time.Sleep(time.Second)
        fmt.Printf("Worker %d finished job %d\n", id, j)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // 启动3个worker
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    // 发送任务
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)

    // 等待结果
    for a := 1; a <= 9; a++ {
        <-results
    }
}
```

#### 2.4 Fan-In / Fan-Out 模式

```go
// Fan-out: 多个goroutine从同一个channel读
// Fan-in: 合并多个channel到一个channel

func merge(cs ...<-chan int) <-chan int {
    var wg sync.WaitGroup
    out := make(chan int, 1)

    output := func(c <-chan int) {
        defer wg.Done()
        for n := range c {
            out <- n
        }
    }

    wg.Add(len(cs))
    for _, c := range cs {
        go output(c)
    }

    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}
```

#### 2.5 生产者-消费者模式

```go
func producer(out chan<- int) {
    for i := 0; i < 10; i++ {
        out <- i
    }
    close(out)
}

func consumer(in <-chan int) {
    for n := range in {
        fmt.Println("Received:", n)
    }
}

func main() {
    ch := make(chan int)
    go producer(ch)
    consumer(ch)
}
```

#### 2.6 使用 sync.Pool 复用对象

```go
var pool = &sync.Pool{
    New: func() interface{} {
        return make([]byte, 1024)
    },
}

func usePool() {
    buf := pool.Get().([]byte)
    // 使用buf...
    pool.Put(buf)
}
```

---

### 三、接口的高级用法

#### 3.1 接口作为契约

```go
// io.Reader 标准接口
type Reader interface {
    Read(p []byte) (n int, err error)
}

// io.Writer 标准接口
type Writer interface {
    Write(p []byte) (n int, err error)
}

// 任何实现了Read方法的类型都实现了io.Reader
// Go的鸭子类型：看起来像鸭子就是鸭子
```

#### 3.2 接口组合

```go
type ReadWriter interface {
    Reader
    Writer
}

type Closer interface {
    Close() error
}

type ReadWriteCloser interface {
    ReadWriter
    Closer
}
```

#### 3.3 空接口与 any

```go
// Go 1.18+ 中 any 是 interface{} 的别名
func Process(items []any) {
    for _, item := range items {
        switch v := item.(type) {
        case int:
            fmt.Printf("int: %d\n", v)
        case string:
            fmt.Printf("string: %s\n", v)
        case float64:
            fmt.Printf("float64: %.2f\n", v)
        }
    }
}
```

#### 3.4 错误包装（Go 1.13+）

```go
import "errors"

// 错误包装
err := fmt.Errorf("processing failed: %w", io.EOF)

// 检查包装的错误
if errors.Is(err, io.EOF) {
    fmt.Println("got EOF")
}

// 解包
unwrap := errors.Unwrap(err)
```

---

### 四、性能优化技巧

#### 4.1 预分配切片容量

```go
// 不好：多次扩容
s := []int{}
for i := 0; i < 1000; i++ {
    s = append(s, i)
}

// 好：预分配
s := make([]int, 0, 1000)
for i := 0; i < 1000; i++ {
    s = append(s, i)
}
```

#### 4.2 使用 sync.Map 优化读多写少场景

```go
var syncMap sync.Map

// 写入
syncMap.Store("key", "value")

// 读取
if val, ok := syncMap.Load("key"); ok {
    fmt.Println(val)
}

// 遍历
syncMap.Range(func(key, value interface{}) bool {
    fmt.Println(key, value)
    return true
})
```

#### 4.3 避免不必要的内存分配

```go
// 使用 & 传递指针而不是拷贝大结构体
type LargeStruct struct {
    Data [10000]byte
}

func process(l *LargeStruct) {  // 指针参数
    // ...
}

// 字符串拼接用 strings.Builder
var builder strings.Builder
builder.WriteString("hello")
builder.WriteString(" ")
builder.WriteString("world")
result := builder.String()
```

#### 4.4 基准测试

```go
func BenchmarkAppend(b *testing.B) {
    for i := 0; i < b.N; i++ {
        s := make([]int, 0, 1000)
        for j := 0; j < 1000; j++ {
            s = append(s, j)
        }
    }
}

// 运行：go test -bench=. -benchmem
```

---

### 五、反射深度使用

```go
import "reflect"

func PrintFields(v interface{}) {
    val := reflect.ValueOf(v)
    typ := reflect.TypeOf(v)

    if val.Kind() == reflect.Ptr {
        val = val.Elem()
        typ = typ.Elem()
    }

    if val.Kind() != reflect.Struct {
        return
    }

    for i := 0; i < val.NumField(); i++ {
        field := typ.Field(i)
        value := val.Field(i)

        fmt.Printf("%s (%s) = %v\n", field.Name, field.Type, value)
    }
}
```

---

### 六、常见并发陷阱

#### 6.1 竞态条件

```bash
## 检测竞态
go run -race main.go
go test -race ./...
```

#### 6.2 死锁预防

```go
// 使用超时避免永久阻塞
select {
case result := <-ch:
    fmt.Println(result)
case <-time.After(5 * time.Second):
    fmt.Println("timeout")
}
```

#### 6.3 Goroutine泄漏

```go
// 确保goroutine能退出
func worker(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            return  // goroutine退出
        case data := <-taskChan:
            process(data)
        }
    }
}
```

---

*整理自 Go官方文档 和 Effective Go*
