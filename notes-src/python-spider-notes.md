## urllib

### 基本使用

使用 urllib 获取百度首页的源码：

```python
import urllib.request

## （1）定义一个url 就是你要访问的地址
url = 'http://www.baidu.com'
## （2）模拟浏览器向服务器发送请求 response 响应
response = urllib.request.urlopen(url)
## （3）获取响应中的页面的源码 content 内容
## read方法 返回的是字节形式的二进制数据
## 我们要将二进制的数据转化为字符串
## 二进制->字符串 解码 decode('编码的格式')
content = response.read().decode('utf-8')
## （4）打印数据
print(content)
```

![](/blog/notes-assets/python-spider-notes/file-20260525121103445.png)

> 如果不进行 decode 解码，就是二进制格式，看不懂

### 一个类型和六个方法

```python
import urllib.request

url = 'http://www.baidu.com'

response = urllib.request.urlopen(url)

## 一个类型和六个方法
## response 是 HTTPResponse 的类型
print(type(response))

## 按照一字节一字节去读
content = response.read()
print(content)

## 返回5个字节
content = response.read(5)
print(content)

## 读取一行
content = response.readline()
print(content)

## 多行读取
content = response.readlines()
print(content)

## 返回状态码 如果是200 那么就证明我们的逻辑没有错
print(response.getcode())

## 返回的是url地址
print(response.geturl())

## 获取的是一个状态信息
print(response.getheaders())
```

**一个类型：** `HTTPResponse`

**六个方法：**

| 方法 | 作用 |
|------|------|
| `read()` | 读取全部内容（字节） |
| `read(5)` | 读取指定字节数 |
| `readline()` | 读取一行 |
| `readlines()` | 多行读取 |
| `getcode()` | 返回状态码（200 表示正常） |
| `geturl()` | 返回 URL 地址 |
| `getheaders()` | 返回状态信息 |

### 下载

```python
import urllib.request

## 下载网页
url_page = 'http://www.baidu.com'
urllib.request.urlretrieve(url_page, 'baidu.html')

## 下载图片
url_image = '...'
urllib.request.urlretrieve(url_image, 'lisa.jpg')

## 下载视频
url_vedio = '...'
urllib.request.urlretrieve(url_vedio, 'lisa.mp4')
```

> `urlretrieve(url链接, 保存的文件名)`

### 请求对象的定制

#### URL 编码 & 反爬初体验

直接请求含中文参数的 URL 会触发反爬：

```python
import urllib.request

url = 'https://www.baidu.com/s?&wd=%E5%91%A8%E6%9D%B0%E4%BC%A6'

response = urllib.request.urlopen(url)
content = response.read().decode('utf-8')
print(content)
```

![](/blog/notes-assets/python-spider-notes/file-20260525121103444.png)

> https 结果页，触发了反爬虫

**URL 组成：**

```
https://www.baidu.com/s?&wd=%E5%91%A8%E6%9D%B0%E4%BC%A6
|__协议__|___域名_____|端口|_路径_|_____参数_________|
  http/https   主机      80/443   路径     参数         锚点

常用端口：http 80 | https 443 | mysql 3306 | redis 6379 | mongodb 27017
```

#### 查找 UA（User-Agent）

1. 在网页点击检查（F12）
2. 选择 Network（网络）
3. 选择 Header（标头，拉到最下面）

![](/blog/notes-assets/python-spider-notes/file-20260525121103443.png)

#### 添加 UA 头（错误的尝试）

> ⚠️ headers 字典不能直接传入 `urlopen()`，会报错

```python
import urllib.request

url = 'https://www.baidu.com/s?&wd=%E5%91%A8%E6%9D%B0%E4%BC%A6'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'
}

## ❌ 错误：urlopen 不支持直接传 headers 字典
response = urllib.request.urlopen(url, headers)
```

![](/blog/notes-assets/python-spider-notes/file-20260525121103441.png)

#### 使用 Request 类（还是错的）

需要传入 `Request` 类，但要注意参数位置：

```python
import urllib.request

url = 'https://www.baidu.com/s?&wd=%E5%91%A8%E6%9D%B0%E4%BC%A6'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'
}

## ❌ 错误：Request(url, headers) 是位置传参，中间还有 data 参数
request = urllib.request.Request(url, headers)
response = urllib.request.urlopen(request)
```

![](/blog/notes-assets/python-spider-notes/file-20260525121103436.png)

打开 Request 源码可以看到参数列表中间夹着一个 `data`，不能直接用位置传参：

![](/blog/notes-assets/python-spider-notes/file-20260525121103434.png)

> **要使用关键字传参**

#### 正确写法：关键字传参

```python
import urllib.request

url = 'https://www.baidu.com/s?&wd=%E5%91%A8%E6%9D%B0%E4%BC%A6'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'
}

## ✅ 正确：使用关键字传参
request = urllib.request.Request(url=url, headers=headers)
response = urllib.request.urlopen(request)
content = response.read().decode('utf-8')
print(content)
```

到此我们完成了针对 UA 反爬的处理，模拟浏览器。

### 编解码

#### 1. GET 请求 — 单参数编码 `urllib.parse.quote()`

当 URL 参数中有中文等非 ASCII 字符时，需要编码后再拼接：

```python
import urllib.request
import urllib.parse

url = 'https://www.baidu.com/s?&wd='
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'
}

name = urllib.parse.quote('周杰伦')
url = url + name

request = urllib.request.Request(url=url, headers=headers)
response = urllib.request.urlopen(request)
content = response.read().decode('utf-8')
print(content)
```

![](/blog/notes-assets/python-spider-notes/file-20260525121103432.png)
![](/blog/notes-assets/python-spider-notes/file-20260525121103430.png)

#### 2. GET 请求 — 多参数编码 `urllib.parse.urlencode()`

多个参数用字典组织，一次性编码：

```python
import urllib.request
import urllib.parse

base_url = 'https://www.baidu.com/s?'

data = {
    'wd': '周杰伦',
    'sex': '男',
    'location': '中国台湾'
}

new_data = urllib.parse.urlencode(data)
url = base_url + new_data

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'
}

request = urllib.request.Request(url=url, headers=headers)
response = urllib.request.urlopen(request)
content = response.read().decode('utf-8')
print(content)
```

![](/blog/notes-assets/python-spider-notes/file-20260525121103429.png)

#### 3. POST 请求 — 表单数据 `urlencode() + encode()`

POST 参数不拼在 URL 上，而是放在请求体的 `data` 中：

```python
import urllib.request
import urllib.parse
import json

url = 'https://fanyi.baidu.com/sug'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'
}

data = {
    'kw': 'spider'
}

## POST 参数需要 urlencode 编码后再转成 bytes
data = urllib.parse.urlencode(data).encode('utf-8')

request = urllib.request.Request(url=url, data=data, headers=headers)
response = urllib.request.urlopen(request)
content = response.read().decode('utf-8')

## 返回的是 JSON 字符串，解析为 Python 对象
obj = json.loads(content)
print(obj)
```

![](/blog/notes-assets/python-spider-notes/file-20260525121103423.png)

#### 4. POST 请求 — JSON 数据（百度 AI 翻译）

当 `Content-Type` 为 `application/json` 时，用 `json.dumps()` 编码：

```python
import time  
import urllib.request  
import urllib.parse  
import json  
url = 'https://fanyi.baidu.com/ait/text/translate'  
  
headers = {  
    # "accept": "text/event-stream",  
    # "accept-encoding": "gzip, deflate, br, zstd", 这个必须需要注释，避免返回压缩格式，让它默认返回二进制  
    # "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",  
    "acs-token": " ··· ",  
    # "connection": "keep-alive",  
    "content-type": "application/json",  
    "cookie": " ··· ",  
    # "host": "fanyi.baidu.com",  
    # "origin": "",    
    "referer": "···",  
    # "sec-ch-ua": '···',  
    # "sec-ch-ua-mobile": "?0",    
    # "sec-ch-ua-platform": '"Windows"',    
    # "sec-fetch-dest": "empty",    
    # "sec-fetch-mode": "cors",    
    # "sec-fetch-site": "same-origin",    
    "user-agent": "···"  
}  
  
  
data = {  
    "corpusIds": [],  
    "detectLang": "",  
    "disableCache": False,  
    "domain":"ai_advanced",  
    "from":"en",  
    "isAi":True,  
    "isIncognitoAI":False,  
    "milliTimestamp":int(time.time() * 1000),  
    "needNewlineCombine": False,  
    "needPhonetic": False,  
    "query":"love",  
    "sseStartTime":int(time.time() * 1000) - 10,  
    "to":"zh"  
}  
  
## post 请求的参数 必须进行编码 并且要调用encode方法  
## data = urllib.parse.urlencode(data).encode('utf-8')  
## 但是新的请求头是"content-type": "application/json",所以用json格式，服务器接收这个  
data = json.dumps(data).encode('utf-8')  
## print(data)
## 请求对象的定制  
request = urllib.request.Request(url=url,data=data,headers=headers)  
## 模拟浏览器向服务器发送请求  
response = urllib.request.urlopen(request)  
## 获取响应的数据，AI接口返回的是SSE流式数据，不能用json.loads，应该直接返回或者  
content = b""  
for line in response:  
    content += line  
## 因为这个数据不多，可以这样，但是最好一行一行读  
## 比如视频、直播、持续输出的流，就需要一行一行读。  
## content = response.read().decode('utf-8')  
print(content.decode('utf-8'))
```

> **注意：** POST 参数编码分两种情况：  
> - `Content-Type: application/x-www-form-urlencoded` → `urllib.parse.urlencode(data).encode('utf-8')`  
> - `Content-Type: application/json` → `json.dumps(data).encode('utf-8')`

##### 浏览器抓包对比

![](/blog/notes-assets/python-spider-notes/file-20260525121103415.png)

##### 运行结果

![](/blog/notes-assets/python-spider-notes/file-20260525121103426.png)
![](/blog/notes-assets/python-spider-notes/file-20260525121103421.png)
![](/blog/notes-assets/python-spider-notes/file-20260525121103417.png)
headers取确定性作用的是cookie
### AJAX的get请求

AJAX（Asynchronous JavaScript And XML）是一种无需重新加载整个页面即可更新部分网页内容的技术。现代网站（如豆瓣、微博、B站）大量使用 AJAX 异步加载数据，返回格式通常为 JSON 而非 HTML。

**AJAX GET 请求的特点：**
- 参数拼接到 URL 的 querystring 中（`?key=value&key2=value2`）
- 通过 `urllib.request.Request` 发送
- 适用于数据量小、非敏感数据的查询场景
- 返回数据一般为 JSON 格式，易于解析

**豆瓣电影列表 API 参数说明：**

| 参数 | 含义 | 示例 |
|------|------|------|
| `type` | 电影分类 ID | 5（剧情） |
| `interval_id` | 评分区间 | 100:90（9-10分） |
| `action` | 动作参数 | 通常为空 |
| `start` | 起始索引（分页） | 0, 20, 40... |
| `limit` | 每页返回条数 | 20 |

**分页逻辑：** `start =（page - 1）* limit`，第一页 start=0，第二页 start=20，依次类推。

#### ajax请求的get请求豆瓣电影第一页
```python
  
## get请求  
## 获取豆瓣电影的第一页的数据 并保存起来  
  
import urllib.request  
  
url='https://movie.douban.com/j/chart/top_list?type=5&interval_id=100%3A90&action=&start=0&limit=20'  
headers={  
    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"  
}  
## （1）请求对象的定制  
request = urllib.request.Request(url=url,headers=headers)  
## （2）获取响应的数据  
response = urllib.request.urlopen(request)  
content = response.read().decode('utf-8')  
## print(content)  
  
## （3）数据下载到本地  
## open方法默认情况是使用GBK的编码 如果我们要向保存汉字 那么需要在open方法中指定编码格式为utf-8  
## encoding=utf-8  
  
## fp = open('douban.json','w',encoding='utf-8')  
## fp.write(content)  
## fp.close()  
  
with open('douban.json','w',encoding='utf-8') as fp:  
    fp.write(content)
```

#### ajax请求的get请求豆瓣电影前10页
```python
  
## get请求  
## 获取豆瓣电影的第一页的数据 并保存起来  
  
import urllib.request  
import urllib.parse  
  
def create_request(page):  
    base_url='https://movie.douban.com/j/chart/top_list?type=5&interval_id=100%3A90&action=&'  
    data = {  
        'start': (page-1)*20,  
        'limit': 20  
    }  
    data = urllib.parse.urlencode(data)  
    url = base_url + data  
    headers = {  
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"  
    }  
    request = urllib.request.Request(url=url,headers=headers)  
    return request  
  
def get_content(request):  
    response = urllib.request.urlopen(request)  
    content = response.read().decode('utf8')  
    return content  
def down_load(page,content):  
    with open('douban'+str(page)+'.json','w',encoding='utf8') as fp:  
        fp.write(content)  
  
if __name__ == '__main__':  
    start_page=int(input('请输入起始的页码'))  
    end_page=int(input('请输入结束的页码'))  
  
    for page in range(start_page,end_page+1):  
    # 每一页都有自己的请求对象的定制  
        request = create_request(page)  
        content = get_content(request)  
        down_load(page,content)
```
### AJAX的post请求

**AJAX POST 请求的特点：**
- 参数放在请求体（data）中，不在 URL 上暴露
- 数据需先 `urlencode` 编码，再 `encode('utf-8')` 转为字节流
- 适合数据量较大或敏感数据的传输
- 常用于表单提交、数据写入等操作

**GET vs POST 对比：**

| 维度 | GET | POST |
|------|-----|------|
| 参数位置 | URL querystring | 请求体 data |
| 数据大小 | 受 URL 长度限制 | 理论上无限制 |
| 安全性 | 低，参数明文可见 | 较高 |
| 缓存 | 会被缓存 | 不会缓存 |
| 适用场景 | 查询、翻页 | 提交、登录 |

#### ajax请求的post请求获取B站漫画首页热门榜单数据
```python
  
## https://manga.bilibili.com/twirp/comic.v1.Comic/HomeHot?device=pc&platform=web&csrf=367747ffe7efc83aacb008ea56ce8a11  
  
## device pc  
## platform web  
## csrf 367747ffe7efc83aacb008ea56ce8a11  
  
import urllib.request  
import urllib.parse  
base_url='https://manga.bilibili.com/twirp/comic.v1.Comic/HomeHot?'  
data = {  
    'device':'pc',  
    'platform':'web',  
    'csrf':'367747ffe7efc83aacb008ea56ce8a11'  
}  
data = urllib.parse.urlencode(data).encode('utf8')  
headers = {  
    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"  
}  
request = urllib.request.Request(url=base_url,headers=headers,data=data)  
response = urllib.request.urlopen(request)  
  
content = response.read().decode('utf-8')  
## print(content)  
with open('list.json','w',encoding='utf-8') as fp:  
    fp.write(content)
```
### URLError/HTTPError
网络协议http/https一般显示在url中，同理HTTPError是URLError的子类
简介：
1.HTTPError类是URLError类的子类
2.导入的包urllib.error.HTTPError    urllib.error.URLError
3.http错误：http错误是针对浏览器无法连接到服务器而增加出来的错误提示。引导并告诉浏览者该页是哪里出了问题。
4.通过urllib发送请求的时候，有可能会发送失败，这个时候如果想让你的代码更加的健壮，可以通过try-except进行捕获异常，异常有两类，URLError/HTTPError

**URLError 与 HTTPError 的关系：**
- `HTTPError` 是 `URLError` 的子类，专门处理服务器返回 HTTP 错误状态码的情况
- `URLError` 处理更广泛的网络异常：DNS 解析失败、连接被拒绝、超时等
- **捕获顺序：** 必须先捕获 `HTTPError`，再捕获 `URLError`。子类在前、父类在后，否则子类异常会被父类提前拦截

**常见 HTTP 状态码：**

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 301 | Moved Permanently | 永久重定向 |
| 302 | Found | 临时重定向 |
| 403 | Forbidden | 服务器拒绝访问 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |

```python
import urllib.request  
import urllib.error  
url='https://blog.csdn.net/sunyctf/article/details/129291675'  
  
headers = {  
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'  
}  
try:  
    request = urllib.request.Request(url=url,headers=headers)  
    respense = urllib.request.urlopen(request)  
    content = respense.read().decode('utf-8')  
    print(content)  
except urllib.error.HTTPError:  
    print('系统正在升级')  
except urllib.error.URLError:  
    print('我都说了系统正在升级')
```
### 微博的cookie登录

**Cookie 登录原理：**
- HTTP 是无状态协议，服务器通过 Cookie 识别和维持用户会话
- 浏览器登录后，服务器在响应中设置 Cookie，后续请求自动携带
- 爬虫模拟登录的核心是**获取登录后的 Cookie**，并在请求头中携带

**操作步骤：**
1. 在浏览器中手动登录微博
2. 打开开发者工具（F12）→ Network → 任意请求 → Request Headers
3. 复制 `Cookie` 字段的值
4. 将 Cookie 放入请求头的 headers 字典中

**关键点：**
- `cookie` 是维持登录状态的核心字段，携带用户登录凭证
- `referer` 用于防盗链，表示请求来源页面
- 没有 Cookie 时服务器会重定向到登录页面，导致拿不到目标数据
- Cookie 有过期时间，长时间未使用需要重新获取
- 注释 `accept-encoding` 可以避免返回压缩数据，方便调试

```python
## 适用的场景：数据采集的时候 需要绕过登录 然后进入到某个页面  
## 个人信息页面是utf-8 但还是报了编码错误 因为并没有进入到个人信息页面 二十跳转到了登录页面  
## 那么登录页面不是utf-8，所以报错  
  
## 什么情况下访问不成功？  
## 因为请求头信息不够 所以访问不成功  
import urllib.request  
url='https://weibo.com/u/7885938319'  
headers = {  
    # ":authority": "weibo.com",  
    # ":method": "POST",    # ":path": "/ajax/log/read?_csrf=08xrzNIlUZ8mFQn4C2DUhvWB",    # ":scheme": "https",    "accept": "*/*",  
    # "accept-encoding": "gzip, deflate, br, zstd",  
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",  
    # "content-length": "352",  
    # "content-type": "application/json",    # cookie中携带着你的登录信息 如果有登录之后的cookie，  
    # 那么我们就可以携带着cookie进入到任何页面  
    "cookie": "UOR=127.0.0.1:3000,service.weibo.com,127.0.0.1:3000; SINAGLOBAL=7678950885469.291.1765967098128; PC_TOKEN=9aab454ea5; XSRF-TOKEN=08xrzNIlUZ8mFQn4C2DUhvWB; SCF=Am5U53IyCru84Py7ll_GQlT4tmM5Dp87fHvZLJnhhLWdU5KykcHtDFoEeE5O9pRlgkyNCS_n4A-c_xAx0gKedVw.; SUB=_2A25HFBGIDeRhGeFG41cY8ybPyjWIHXVkaCtArDV8PUNbmtANLU74kW9NeLejsYnSKeAtO6rLGW9EUR_OhQHocnW1; SUBP=0033WrSXqPxfM725Ws9jqgMF55529P9D9WWlnR3CjRO.V05T9oEZkxmd5JpX5KzhUgL.FoMR1h-4e0n0eK.2dJLoIp7LxKML1KBLBKnLxKqL1hnLBoMN1hnf1KeRe024; ALF=02_1782050520; _s_tentry=weibo.com; Apache=7001097953790.9.1779458621176; ULV=1779458621261:2:1:1:7001097953790.9.1779458621176:1765967098163; WBPSESS=U9L6o5YR0-GxElnuttCspcS_2aicceRJj5bGFkkyYDihLEbKfk7viCoLOZ9ARGpoD7K1-z87EEVtQwoEOvyEIWHysc78PTF8_UR2v51jU-Fi85IpfTz1SqEDHu2Mh3dzCR1EKU08wxNmc2b4erjazQ==",  
    "origin": "https://weibo.com",  
    "priority": "u=4, i",  
    # referer 判断当前路径是不是由上一个路径进来的 一般情况下是做图片的防盗链  
    "referer": "https://weibo.com/u/7885938319",  
    "sec-ch-ua": '"Chromium";v="148", "Microsoft Edge";v="148", "Not/A)Brand";v="99"',  
    "sec-ch-ua-mobile": "?0",  
    "sec-ch-ua-platform": '"Windows"',  
    "sec-fetch-dest": "empty",  
    "sec-fetch-mode": "cors",  
    "sec-fetch-site": "same-origin",  
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0"  
}  
## 请求对象的定制  
request = urllib.request.Request(url=url,headers=headers)  
## 模拟浏览器向服务器发送请求  
response = urllib.request.urlopen(request)  
## 获取响应的数据  
content = response.read().decode('utf-8')  
## print(content)  
## 将数据保存到本地  
with open('weibo.html','w',encoding='utf-8') as fp:  
    fp.write(content)
```
### handler处理器的基本使用

**为什么使用 Handler？**
`urllib.request.urlopen()` 只能处理最基本的请求场景。当需要使用代理、Cookie、证书验证等高级功能时，必须通过 Handler + Opener 机制来实现。

**工作流程：**
```
Handler（处理特定功能）
    → build_opener() 创建 Opener 对象
        → opener.open() 发送请求
```

**常用 Handler 类型：**

| Handler | 用途 |
|---------|------|
| `HTTPHandler` | 处理 HTTP 请求 |
| `HTTPSHandler` | 处理 HTTPS 请求 |
| `ProxyHandler` | 设置代理服务器 |
| `HTTPCookieProcessor` | 处理 Cookie |
| `HTTPBasicAuthHandler` | 处理基本认证 |
| `ProxyBasicAuthHandler` | 处理代理认证 |

```python
## 需求 使用handler来访问百度 获取网页源码  
  
import urllib.request  
url='http://www.baidu.com'  
headers = {  
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'  
}  
request = urllib.request.Request(url=url,headers=headers)  
## handler   build_opener   open  
## （1）获取handler对象  
handler = urllib.request.HTTPHandler()  
## （2）获取opener对象  
opener = urllib.request.build_opener(handler)  
## （3）调用open方法  
response = opener.open(request)  
content = response.read().decode('utf8')  
print(content)
```

### 代理

**为什么使用代理？**
1. **IP 反爬封禁：** 目标网站对同一 IP 的频繁访问会触发反爬机制，封禁 IP
2. **突破地域限制：** 某些内容仅特定地区可访问
3. **隐藏真实 IP：** 保护爬虫服务器不被追踪

**代理类型：**

| 类型   | 特点                          |
| ---- | --------------------------- |
| 透明代理 | 服务器知道你的真实 IP                |
| 匿名代理 | 服务器不知道你真实 IP，但知道在用代理        |
| 高匿代理 | 服务器既不知道你真实 IP，也不知道你在用代理（推荐） |

**使用流程：**
```
ProxyHandler（设置代理字典）
    → build_opener() 创建 Opener
        → opener.open() 发送请求
```

> **注意：** 代理地址格式应为 `'http':'http://IP:PORT'`，部分免费代理可能缺少 `http://` 前缀导致失效。

```python
  
import urllib.request  
  
url = 'http://www.baidu.com/s?wd=ip'  
  
headers = {  
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'  
}  
  
## 请求对象的定制  
request = urllib.request.Request(url=url,headers=headers)  
## 模拟浏览器访问服务器  
## handler build_opener open  
proxies = { # 存放代理地址  
    'http':'128.102.20:8080'  
}  
handler = urllib.request.ProxyHandler(proxies=proxies)  
opener = urllib.request.build_opener(handler)  
response = opener.open(request)  
## 获取响应的信息  
content = response.read().decode('utf8')  
## 保存  
with open('daili.html','w',encoding='utf8') as fp:  
    fp.write(content)
```
### 代理池

**为什么需要代理池？**
单个代理 IP 频繁请求同样会被封，因此需要准备多个代理 IP 轮换使用。代理池的核心思想是维护一个可用代理列表，每次随机选择一个发送请求，降低单个 IP 的请求频率，提高爬虫的稳定性和可用性。

**代理池的工作流程：**
1. 收集多个可用代理地址（可从免费代理网站获取或付费购买）
2. 存放在列表（或数据库/Redis）中
3. 每次发送请求前，用 `random.choice()` 随机挑选一个代理
4. 若代理失效（请求超时或返回错误），将其从池中移除并更换下一个
5. 定期检测并补充新的可用代理

**关键点：**
- 代理 IP 有存活周期，需要定期检测可用性
- `random.choice()` 实现随机选取，均衡各代理的请求压力
- 生产环境中可用 Redis 有序集合存储代理，支持权重和自动检测

```python
import urllib.request  
## 存放多个代理地址的代理池  
proxies_pool = [  
    { 'http':'128.102.20:8080'},  
    { 'http':'128.102.22:8180'}  
]  
import random  
  
proxies = random.choice(proxies_pool)  
  
url = 'http://www.baidu.com/s?wd=ip'  
  
headers = {  
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'  
}  
  
request = urllib.request.Request(url=url,headers=headers)  
handler = urllib.request.ProxyHandler(proxies=proxies)  
opener = urllib.request.build_opener(handler)  
response = opener.open(request)  
content  = response.read().decode('utf-8')  
  
with open('daili.html','w',encoding='utf8') as fp:  
    fp.write(content)
```
## 解析
### Xpath
#### xpath的基本使用

**XPath 解析的两种方式：**

| 方式 | 适用场景 | 方法 |
|------|---------|------|
| 解析本地文件 | HTML/XML 文件已保存在本地 | `etree.parse('文件路径')` |
| 解析服务器响应 | 爬虫获取到的网页源码 | `etree.HTML(response_content)` |

**XPath 语法分类：**

| 类别   | 语法                     | 说明            | 示例                                      |
| ---- | ---------------------- | ------------- | --------------------------------------- |
| 路径查询 | `//`                   | 查找所有子孙节点，忽略层级 | `//div//span`                           |
| 路径查询 | `/`                    | 查找直接子节点       | `//div/span`                            |
| 谓词查询 | `[@id]`                | 匹配有某属性的节点     | `//div[@id]`                            |
| 谓词查询 | `[@id="x"]`            | 匹配属性等于指定值的节点  | `//div[@id="main"]`                     |
| 属性查询 | `@class`               | 获取节点的属性值      | `//div/@class`                          |
| 内容查询 | `text()`               | 获取标签内的文本内容    | `//div/h1/text()`                       |
| 模糊查询 | `contains(@id,"x")`    | 属性值包含指定字符串    | `//div[contains(@id,"he")]`             |
| 模糊查询 | `starts-with(@id,"x")` | 属性值以指定字符串开头   | `//div[starts-with(@id,"he")]`          |
| 逻辑运算 | `and`                  | 多个条件同时满足      | `//div[@id="head" and @class="s_down"]` |
| 逻辑运算 | `\|`                   | 多个路径取并集       | `//title \| //price`                    |

> **返回值：** `tree.xpath()` 的结果始终是一个**列表**。即使只有一个匹配结果也会被放在列表中，获取单个值需要通过 `[0]` 索引。

```python
from lxml import etree  
## xpath解析  
## （1）本地文件                                           etree.parse# （2）服务器响应的数据 response.read().decode('utf-8')    etree.HTML() **# xpath解析本地文件  
## tree = etree.parse('17_解析_xpath的基本使用.html')  
## print(tree)  
  
## tree.xpath('xpath路径')  
## xpath基本语法：  
## 1.路径查询  
## //:查找所有子孙节点，不考虑层级关系  
## /:找直接子节点  
## 2.谓词查询  
## //div[@id]  
## //div[@id="maincontent"]  
## 3.属性查询  
## //@class  
## 4.模糊查询  
## //div[contains(@id,"he")]  
## //div[starts-with(@id,"he")]  
## 5.内容查询  
## //div/h1/text()  
## 6.逻辑运算  
## //div[@id="head"and @class="s_down"]  
## //title | //price  
  
## 查找ul下面的li  
## li_list = tree.xpath('//body/ul/li')  
  
## 查找所有的id的熟悉的li标签  
## text()获取标签中的内容  
## li_list = tree.xpath('//ul/li[@id]/text()')  
  
## 找到id为l1的li标签  注意id字符串引号的问题  
## li_list = tree.xpath('//ul/li[@id="l1"]/text()')  
  
## 查找到id为l1的li标签的class的属性值  
## li = tree.xpath('//ul/li[@id="l1"]/@class')  
  
## 查询id中包含l的li标签  
## li_list = tree.xpath('//ul/li[contains(@id,"l")]/text()')  
  
## 查询id的值以l开头的li标签  
## li_list = tree.xpath('//ul/li[starts-with(@id,"c")]/text()')  
  
## 查询id为l1和class为c1的标签  
## li_list = tree.xpath('//ul/li[@id="l1" and @class="c1"]/text()')  
  
## li_list = tree.xpath('//ul/li[@id="l1"]/text() | //ul/li[@id="l2"]/text()')  
## 判断列表的长度  
## print(li_list)  
## print(len(li_list))
```

```html
<!DOCTYPE html>  
<html lang="en">  
<head>  
    <meta charset="UTF-8"/>  
    <title>Title</title>  
</head>  
<body>  
    <ul>        <li id="l1" class="c1">北京</li>  
        <li id="l2">上海</li>  
        <li id="c3">深圳</li>  
        <li id="c4">武汉</li>  
    </ul><!--    <ul>-->  
<!--        <li>大连</li>-->  
<!--        <li>锦州</li>-->  
<!--        <li>沈阳</li>-->  
<!--    </ul>-->  
</body>  
</html>
```

#### xpath_获取百度搜索的百度一下

**解析流程：**
1. `urllib.request` 获取网页源码（HTML 字符串）
2. `etree.HTML(content)` 将 HTML 字符串解析为 `Element` 对象
3. `tree.xpath()` 通过 XPath 表达式提取目标数据

> **核心 XPath 表达式：** `//button[@id="chat-submit-button"]/text()`  
> - `//` → 在整个文档中查找  
> - `button[@id="chat-submit-button"]` → `id` 属性为 `chat-submit-button` 的 `button` 标签  
> - `/text()` → 提取标签内的文本内容  
> - 返回值类型为 `list`，所以用 `result[0]` 获取字符串

```python
## （1）获取网页的源码  
## （2）解析 解析的是服务器响应的文件 etree.HTML()# （3）打印  
  
import urllib.request  
  
from lxml import etree  
  
url = 'https://www.baidu.com/'  
headers = {  
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'  
}  
request = urllib.request.Request(url=url,headers=headers)  
response = urllib.request.urlopen(request)  
content = response.read().decode('utf8')  
  
## 解析网页源码 来获取我们想要的数据  
tree = etree.HTML(content)  
  
## 获取想要的数据 xpath返回值是一个列表类型的数据  
result = tree.xpath('//button[@id="chat-submit-button"]/text()') # [' 百度一下 ']print(result[0])
```
![](/blog/notes-assets/python-spider-notes/file-20260525121103409.png)

#### xpath_获取站长素材图片

**案例要点：**

| 要点        | 说明                                            |
| --------- | --------------------------------------------- |
| 分页 URL 规律 | 第 1 页：`index.html`；第 2 页起：`index_{page}.html` |
| 图片懒加载     | 图片真实 URL 存储在 `data-original` 属性中，而非 `src`     |
| 图片名       | 从 `alt` 属性中提取                                 |
| 防盗链       | 下载图片需添加 `Referer` 请求头，否则被拦截                   |
| 路径补全      | `data-original` 以 `//` 开头时，需补充 `https:`       |

**核心 XPath 表达式分析：**
```xpath
//div[@class="tupian-list com-img-txt-list"]//img/@data-original
//div[@class="tupian-list com-img-txt-list"]//img/@alt
```
先定位到图片列表容器 `div.tupian-list.com-img-txt-list`，`//img` 查找所有后代 `img` 标签，`@data-original` / `@alt` 提取属性值。

```python
import urllib.request  
  
from lxml import etree  
import os  
  
  
## （1）请求对象的定制  
## （2）获取网页的源码  
## （3）下载  
  
## 需求：下载前十页的图片  
## https://sc.chinaz.com/tupian/index.html   第1页  
## https://sc.chinaz.com/tupian/index_2.html 第2页  
  
def create_request(page):  
    url = ''  
    if page == 1:  
        url = 'https://sc.chinaz.com/tupian/index.html'  
    else:  
        url = f'https://sc.chinaz.com/tupian/index_{page}.html'  
    headers = {  
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'  
    }  
    request = urllib.request.Request(url=url, headers=headers)  
    return request  
  
  
def get_response(request):  
    response = urllib.request.urlopen(request)  
    return response  
  
  
def down_load(content):  
    if not os.path.exists('images'):  
        os.mkdir('images')  
  
    tree = etree.HTML(content)  
    img_urls = tree.xpath('//div[@class="tupian-list com-img-txt-list"]//img/@data-original')  
    img_names = tree.xpath('//div[@class="tupian-list com-img-txt-list"]//img/@alt')  
  
    headers = {  
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',  
        'Referer': 'https://sc.chinaz.com/tupian',  
        'cookie':'cz_statistics_visitor=4aed410c-d5a1-4852-ac5d-b20687c7fceb; Hm_lvt_398913ed58c9e7dfe9695953fb7b6799=1779469984; HMACCOUNT=D06D5C5F2F509D25; _clck=1px5pmb%5E2%5Eg69%5E0%5E2333; _clsk=14hqjpt%5E1779470510000%5E2%5E1%5Eb.clarity.ms%2Fcollect; Hm_lpvt_398913ed58c9e7dfe9695953fb7b6799=1779473465'  
    }  
    for i, (src, name) in enumerate(zip(img_urls, img_names)):  
        if src.startswith('//'):  
            src = 'https:' + src  
  
        request = urllib.request.Request(src, headers=headers)  
        img_data = urllib.request.urlopen(request).read()  
  
        path = f'images/{name}.jpg'  
        with open(path, 'wb') as f:  
            f.write(img_data)  
  
        print(f'下载成功：{name}')  
  
  
if __name__ == '__main__':  
    start_page = int(input('请输入起始页码'))  
    end_page = int(input('请输入结束页码'))  
    for page in range(start_page, end_page + 1):  
        request = create_request(page)  
        response = get_response(request)  
        content = response.read().decode('utf8')  
        down_load(content)
```
![](/blog/notes-assets/python-spider-notes/file-20260525121103411.png)
### JSONPath

> 笔记来源：https://blog.csdn.net/obstinate_l/article/details/125294971

JSONPath 用于从 JSON 数据中提取特定字段，类似于 XPath 之于 XML。返回结果始终是**列表**类型。

#### JSONPath 语法速查

| **XPath** | **JSONPath**     | **Description**                           |
| --------- | ---------------- | ----------------------------------------- |
| /         | $                | 表示根元素                                     |
| .         | @                | 当前元素                                      |
| /         | . or []          | 子元素                                       |
| ..        | n/a              | 父元素                                       |
| //        | ..               | 递归下降，JSONPath是从E4X借鉴的。                    |
| *         | *                | 通配符，表示所有的元素                               |
| @         | n/a              | 属性访问字符                                    |
| []        | []               | 子元素操作符                                    |
| \|        | [,]              | 连接操作符在XPath 结果合并其它结点集合。JSONP允许name或者数组索引。 |
| n/a       | [start:end:step] | 数组分割操作从ES4借鉴。                             |
| []        | ?()              | 应用过滤表示式                                   |
| n/a       | ()               | 脚本表达式，使用在脚本引擎下面。                          |
| ()        | n/a              | Xpath分组                                   |

| 类别 | 表达式 | 说明 | 示例 |
|------|--------|------|------|
| **根节点** | `$` | 整个 JSON 数据的根 | `$` |
| **当前节点** | `@` | 表示当前元素（过滤器中使用） | `?(@.price < 10)` |
| **子节点** | `.` | 访问直接子属性 | `$.store.book` |
| **子节点** | `[]` | 中括号方式访问子属性/索引 | `$['store']['book']` |
| **递归下降** | `..` | 查找所有后代节点，忽略层级 | `$..author` → 所有 author 字段 |
| **通配符** | `*` | 匹配所有元素 | `$.store.book[*].author` |
| **数组索引** | `[n]` | 索引访问（从 0 开始） | `$..book[2]` → 第 3 本书 |
| **数组切片** | `[n:m]` | Python 风格切片 | `$..book[:2]` → 前两本书 |
| **多选联合** | `[,]` | 同时选取多个索引/键 | `$..book[0,1]` |
| **脚本表达式** | `()` | 动态索引计算 | `$..book[(@.length-1)]` → 最后一本书 |
| **过滤器** | `?()` | 条件筛选 | `$..book[?(@.price < 10)]` |

#### 过滤器操作符

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `==` | 等于（类型敏感） | `?(@.price == 8.95)` |
| `!=` | 不等于 | `?(@.category != 'fiction')` |
| `<` `>` `<=` `>=` | 比较运算符 | `?(@.price < 10)` |
| `=~` | 正则匹配 | `?(@.author =~ /.*rees/i)` |
| `in` / `nin` | 属于 / 不属于 | `?(@.category in ['fiction'])` |
| `&&` / `\|\|` | 逻辑与 / 或 | `?(@.price > 10 && @.category == 'fiction')` |
| `size` | 数组/字符串长度 | `?(@.tags size 3)` |
| `empty` | 判空 | `?(@.tags empty true)` |

#### 常用函数

| 函数 | 说明 | 示例 |
|------|------|------|
| `length()` | 数组长度 | `$.store.book.length()` |
| `min()` / `max()` | 最小/最大值 | `$..price.min()` |
| `avg()` | 平均值 | `$..price.avg()` |
| `sum()` | 求和 | `$..price.sum()` |
| `stddev()` | 标准差 | `$..price.stddev()` |

#### 基础解析示例
```python
import jsonpath  
import json  
  
obj = json.load(open('20_解析_jsonpath.json','r',encoding='utf8'))  
## print(obj)  
  
## 书店所有的书的作者  
author_list = jsonpath.jsonpath(obj,'$.store.book[*].author')  
print(author_list)  
  
## 所有的作者  
all_author_list = jsonpath.jsonpath(obj,'$..author')  
print(all_author_list)  
  
## store下面的所有的元素，所有的bookst和bicycle  
tag_list = jsonpath.jsonpath(obj,'$.store.*')  
print(tag_list)  
  
## store里面所有东西的price  
price_list = jsonpath.jsonpath(obj,'$.store..price')  
print(price_list)  
  
## 第三本书  
book_3 = jsonpath.jsonpath(obj,'$..book[2]')  
print(book_3)  
  
## 最后一本书  
book_last = jsonpath.jsonpath(obj,'$..book[(@.length-1)]')  
print(book_last)  
  
## 前面的两本书  
book_12 = jsonpath.jsonpath(obj,'$..book[:2]')  
print(book_12)  
  
## 过滤出所有的包含isbn的书  
book_isbn = jsonpath.jsonpath(obj,'$..book[?(@.isbn)]')  
print(book_isbn)  
  
## 过滤出价格低于10的书  
book_price_lowerten = jsonpath.jsonpath(obj,'$..book[?(@.price<10)]')  
print(book_price_lowerten)  
  
## 所有元素  
all = jsonpath.jsonpath(obj,'$..*')  
print(all)
```

```json
{  
  "store": {  
    "book": [  
      {  
        "category": "reference",  
        "author": "Nigel Rees",  
        "title": "Sayings of the Century",  
        "price": 8.95  
      },  
      {  
        "category": "fiction",  
        "author": "Evelyn Waugh",  
        "title": "Sword of Honour",  
        "price": 12.99  
      },  
      {  
        "category": "fiction",  
        "author": "Herman Melville",  
        "title": "Moby Dick",  
        "isbn": "0-553-21311-3",  
        "price": 8.99  
      },  
      {  
        "category": "fiction",  
        "author": "J. R. R. Tolkien",  
        "title": "The Lord of the Rings",  
        "isbn": "0-395-19395-8",  
        "price": 22.99  
      }  
    ],  
    "bicycle": {  
      "author": "J. R. R. Tolkien bicycle",  
      "color": "red",  
      "price": 19.95  
    }  
  }  
}
```
#### 案例：淘票票城市列表

**案例目标：** 使用 JSONPath 提取淘票票（Taobao Movie）全国城市列表。

**数据获取流程：**

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 请求 API 获取 JSONP 数据 | 淘宝城市接口返回的是 JSONP 格式（带回调函数包裹） |
| 2 | `content[13:-2]` 去除 JSONP 外层 | 去掉前面的 `jsonp109(` 和末尾的 `)`，得到标准 JSON |
| 3 | `jsonpath.jsonpath(obj, '$..regionName')` | 使用递归下降提取所有城市名 |

> **JSONP → JSON 转换：**  
> - 原始响应格式：`jsonp109({...})`  
> - `content[13:-2]` 的作用：
>   - `[13:]` → 去掉开头的 `jsonp109(`（13 个字符）
>   - `[:-2]` → 去掉末尾的 `)` + 可选分号
> - 转换后得到标准 JSON 字符串，可以用 `json.loads()` 解析

**核心 JSONPath 表达式分析：**
```python
jsonpath.jsonpath(obj, '$..regionName')
```
- `$` → 根节点
- `..` → 递归下降，忽略层级深度
- `regionName` → 提取所有键名为 `regionName` 的字段值
- 返回值：包含全国所有城市名的列表

```python
import urllib.request  
url = 'https://dianying.taobao.com/cityAction.json?activityId&_ksTS=1779507005635_108&jsoncallback=jsonp109&action=cityAction&n_s=new&event_submit_doGetAllRegion=true'  
headers={  
    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0",  
    "cookie":'···（需替换为实时 cookie）',  
    "referer":"https://dianying.taobao.com/"  
}  
request = urllib.request.Request(url=url,headers=headers)  
response = urllib.request.urlopen(request)  
content = response.read().decode('utf8')  
## JSONP → JSON：去掉外层的 jsonp109(...) 包裹  
content = content[13:-2]  

## with open('21_解析_jsonpath_淘票票.json','w',encoding='utf8') as fp:  
## fp.write(content)  

import json  
import jsonpath  
obj = json.load(open('21_解析_jsonpath_淘票票.json','r',encoding='utf8'))  
city_list = jsonpath.jsonpath(obj,'$..regionName')  
print(city_list)
```

![](/blog/notes-assets/python-spider-notes/file-20260525121103407.png)

### BeautifulSoup
#### 基本使用
```python
from bs4 import BeautifulSoup  
  
  
## 通过解析本地文件 来将bs4的基础语法进行讲解  
## 默认打开的编码格式是gbk，所以在打开文件的时候，需要指定编码  
soup = BeautifulSoup(open('22_解析_bs4的基本使用.html','r',encoding='utf8'),'lxml')  
## 根据标签名查找节点（找到的是第一个符合条件的）  
print(soup.a)  
## 获取标签的属性和属性值  
print(soup.a. attrs)  
  
## bs4的一些函数  
## （1）find  
## 返回的是第一个符合条件的数据  
print(soup.find('a'))  
## 根据title的值来找到对应的标签对象  
print(soup.find('a',title='a2'))  
## 根据class的值来找到对应的标签对象，注意的是class是关键字，需要加下划线 class_print(soup.find('a',class_='a1'))  
  
## （2）find_all 返回的是一个列表，并且返回了所有的a标签  
## print(soup.find_all('a'))  
## 如果向获取的是多个标签的数据，那么需要在find_all的参数中添加的是列表的数据  
print(soup.find_all(['a','span']))  
## list作用是查找前几个数据  
print(soup.find_all('li',limit=2))  
  
## （3）select  
## select方法返回的是一个列表 并且会返回多个数据  
print(soup.select('a'))  
  
## 可以通过，代表class 我们把这周操作叫做类选择器  
print(soup.select('.a1'))  
  
print(soup.select('#l1'))  
  
## 属性选择器  
## 查找到li标签中有id的标签  
print(soup.select('li[id]'))  
  
## 查找到li标签中id为l2的标签  
print(soup.select('li[id="l2"]'))  
  
## 层级选择器  
  
## 后代选择器  
## 找到是div下面的li  
print(soup.select('div li'))  
  
## 子代选择器  
## 某标签的第一级子标签  
## 注意：很多的计算机编程语言中，如果不加空格不会输出内容 但是在bs4中不会报错 会显示内容  
print(soup.select('div > ul > li'))  
print(soup.select('div>ul>li'))  
  
## 找到a标签和li标签所有的对象  
print(soup.select('a,li'))  
  
## 节点信息  
## 获取节点内容  
obj = soup.select('#d1')[0]  
  
## 如果这个标签对象中，只中有内容，那么string和get_text()都可以使用  
## 如果这个标签对象中，除了内容还有标签，那么string就获取不到数据，而get_text()是可以获取数据  
## 所以一般情况一下推荐 get_text()print(obj.string)  
print(obj.get_text())  
  
## 节点的属性  
obj = soup.select('#p1')[0]  
## name是标签的名字  
print(obj.name)  
## 将属性值作为一个字典返回  
print(obj.attrs)  
## 获取节点的属性  
ojb = soup.select('#p1')[0]  
  
print(obj.attrs.get('class'))  
print(obj.get('class'))  
print(obj['class']) # 如果属性不存在，会报错
```

#### 案例：爬取幸运咖产品介绍数据
```python
import urllib.request  
  
url = 'https://www.xingyunka.com/product'  
  
response = urllib.request.urlopen(url)  
content = response.read().decode('utf8')  
## print(content)  
  
from bs4 import BeautifulSoup  
soup = BeautifulSoup(content,'lxml')  
## print(soup.select('section[id="material"]'))  
image_list = soup.select('section[id="material"] img.img-hover')  
title_list = soup.select('section[id="material"] span.material-item-title')  
product_list = soup.select('section[id="material"] span.material-item-text')  
print(image_list)  
print(title_list)  
print(product_list)
```

#### 安装与解析器

```bash
pip install bs4 lxml
```

**解析器对比：**

| 解析器 | 用法 | 特点 | 适用场景 |
|--------|------|------|----------|
| Python 内置 | `BeautifulSoup(markup, 'html.parser')` | 无需安装，速度一般 | 简单文档 |
| lxml HTML | `BeautifulSoup(markup, 'lxml')` | 速度快，容错强 | **推荐（爬虫首选）** |
| lxml XML | `BeautifulSoup(markup, 'xml')` | 唯一支持 XML 的解析器 | 解析 XML 文件 |
| html5lib | `BeautifulSoup(markup, 'html5lib')` | 最容错，速度最慢 | 极端不规范页面 |

> **推荐：** 爬虫场景无脑用 `'lxml'`，速度快、容错好、依赖少。

#### 四大对象类型

BeautifulSoup 将 HTML 文档转换成四种对象类型：

| 类型 | 对应 | 说明 |
|------|------|------|
| `Tag` | HTML 标签 | 对应一个标签，如 `<div>`、`<a>` |
| `NavigableString` | 标签内的文本 | 对应标签中的文字内容 |
| `BeautifulSoup` | 整个文档 | 根对象，可视为 `<html>` 标签的封装 |
| `Comment` | HTML 注释 | `<!-- comment -->`，特殊类型的 NavigableString |

```python
from bs4 import BeautifulSoup, Tag, NavigableString, Comment

soup = BeautifulSoup('<b><!-- 注释 -->hello</b>', 'lxml')

tag = soup.b                 # <b>...</b> → Tag 对象
print(type(tag))             # <class 'bs4.element.Tag'>

text = soup.b.string         # 'hello' → NavigableString 对象
print(type(text))            # <class 'bs4.element.NavigableString'>

## Comment 会自动隐藏注释符号
comment = soup.b.string      # 如果是注释，会跳过 <!-- --> 拿到内容
print(type(comment))         # <class 'bs4.element.Comment'>

## 判断是否是注释
if isinstance(comment, Comment):
    print('这是注释')
```

> **⭐ 坑点提醒：** 当标签内只有注释时，`.string` 返回的是 `Comment` 对象而不是 `NavigableString`，字符串比较会失败，需要用 `isinstance` 判断。

#### 节点遍历

```python
## 准备好 HTML：<html><body><div id="d1"><ul><li id="l1">北京</li><li>上海</li></ul></div></body></html>
soup = BeautifulSoup(open('demo.html'), 'lxml')
tag = soup.select('#d1')[0]

## （1）contents / children — 直接子节点（列表 / 迭代器）
print(tag.contents)          # 列表：[<ul>...</ul>]
for child in tag.children:   # 迭代器
    print(child)

## （2）descendants — 所有子孙节点（递归）
for child in tag.descendants:
    print(child)             # <ul>、<li>、文本...

## （3）parent / parents — 父节点 / 所有祖先节点
li = soup.select('#l1')[0]
print(li.parent)             # <ul>...</ul>
for parent in li.parents:
    print(parent.name)       # ul → div → body → html → [document]

## （4）next_sibling / previous_sibling — 兄弟节点
## <li id="l1">北京</li><li>上海</li>
print(li.next_sibling)       # 上海（注意：可能返回换行符文本）
print(li.previous_sibling)   # None

## ⭐ 坑点：next_sibling 可能拿到的是换行符（NavigableString）
## 解决方案：使用 find_next_sibling() / find_previous_sibling()
print(li.find_next_sibling())      # <li>上海</li>
print(li.find_previous_sibling())  # None

## （5）next_element / previous_element — 下一个被解析的元素（深度优先）
print(li.next_element)             # '北京'（文本节点）
print(li.next_element.next_element)  # 到下一个兄弟的文本
```

#### find / find_all 过滤器高级用法

`find()` / `find_all()` 的第一个参数 `name` 支持多种过滤器：

```python
from bs4 import BeautifulSoup
import re

soup = BeautifulSoup(open('demo.html'), 'lxml')

## （1）字符串 — 按标签名精确匹配（最基础）
soup.find_all('a')            # 所有 <a> 标签
soup.find('a')                # 第一个 <a> 标签

## （2）正则表达式 — 匹配标签名
soup.find_all(re.compile('^h[1-6]'))  # 所有 h1~h6 标签
soup.find_all(re.compile('li|di|sp')) # 标签名包含 li/di/sp 的标签

## （3）列表 — 同时匹配多个标签
soup.find_all(['a', 'li'])    # 所有 <a> 和 <li> 标签

## （4）True / 可调用对象 — 匹配所有标签
soup.find_all(True)           # 所有标签

## 自定义函数：只匹配有 class 属性但没有 id 的标签
def has_class_no_id(tag):
    return tag.has_attr('class') and not tag.has_attr('id')
soup.find_all(has_class_no_id)

## （5）关键字参数 — 按属性过滤
soup.find_all(id='l1')                      # id="l1"
soup.find_all(class_='a1')                  # class="a1"（class 是关键字，需加下划线）
soup.find_all(href=re.compile('example'))   # href 正则匹配
soup.find_all('a', title='a2')              # <a title="a2">

## （6）attrs 参数 — 按字典传属性（用于属性名含中划线等特殊情况）
soup.find_all('div', attrs={'data-id': '123', 'class': 'box'})

## （7）text / string 参数 — 按文本内容过滤
soup.find_all(string='北京')                # 精确匹配文本内容
soup.find_all(string=re.compile('北'))      # 正则匹配文本内容
## ⭐ string 返回的是 NavigableString 对象，不是 Tag 对象

## （8）recursive 参数 — 是否递归查找子节点（默认 True）
soup.find_all('a', recursive=False)         # 只在直接子节点中找

## （9）limit 参数 — 限制返回数量
soup.find_all('a', limit=2)                 # 最多返回 2 个
```

#### select / select_one — CSS 选择器

`select()` 返回列表，`select_one()` 返回单个元素或 None：

```python
soup = BeautifulSoup(open('demo.html'), 'lxml')

## select_one 返回第一个匹配（没有 None 会报错，建议先判断）
tag = soup.select_one('#d1')
if tag:
    print(tag)

## 伪类选择器
soup.select('li:nth-of-type(2)')       # 每个父元素中的第 2 个 li
soup.select('li:first-child')          # 第一个子元素（必须也是 li）
soup.select('li:last-child')           # 最后一个子元素
soup.select('li:nth-child(2n)')        # 偶数位置的 li

## 否定伪类
soup.select('li:not(#l1)')             # 排除 id="l1" 的 li
```

#### 获取数据的多种方式对比

```python
soup = BeautifulSoup('<p id="p1" class="info">Hello <b>World</b></p>', 'lxml')
tag = soup.p

## （1）获取文本内容
print(tag.string)            # None（因为包含子标签，无法直接获取单一字符串）
print(tag.get_text())        # 'Hello World'（所有文本拼接，推荐）
print(list(tag.strings))     # ['Hello ', 'World']（所有文本片段）
print(list(tag.stripped_strings))  # ['Hello', 'World']（去除空白后）

## （2）获取属性
print(tag['class'])          # ['info']（返回列表，因为 class 可以多值）
print(tag.get('id'))         # 'p1'（推荐，属性不存在返回 None 不会报错）
print(tag.get('style'))      # None（属性不存在返回 None）
print(tag['style'])          # ❌ KeyError（属性不存在会报错）
print(tag.attrs)             # {'id': 'p1', 'class': ['info']}（所有属性字典）

## （3）判断是否有某属性
print(tag.has_attr('id'))    # True
print(tag.has_attr('style')) # False
```

#### 修改文档并输出

```python
soup = BeautifulSoup('<p>Hello</p>', 'lxml')

## 修改标签名
soup.p.name = 'div'

## 修改属性
soup.p['class'] = 'box'

## 修改文本
soup.p.string = 'World'

## 添加标签
from bs4 import Tag
new_tag = soup.new_tag('span')
new_tag.string = 'new'
soup.p.append(new_tag)

## 输出
print(soup.prettify())       # 格式化输出（带缩进）
print(str(soup))             # 字符串输出

## BS4 的 encode 方法（返回 bytes）
print(soup.encode('utf-8'))
```

#### 表格：find vs find_all vs select vs select_one

| 方法 | 返回值 | 查询方式 | 适用场景 |
|------|--------|----------|----------|
| `find()` | 单个 Tag（或 None） | 标签名/属性/过滤器 | 取唯一元素，如 `id` 唯一 |
| `find_all()` | Tag 列表 | 标签名/属性/过滤器/正则 | 批量提取同类数据 |
| `select()` | Tag 列表 | CSS 选择器语法 | 习惯 CSS 写法，或复杂路径 |
| `select_one()` | 单个 Tag（或 None） | CSS 选择器语法 | 只需第一个匹配结果 |

#### 案例：爬取豆瓣电影 Top250（综合实战）

```python
import urllib.request  
import urllib.parse  
from bs4 import BeautifulSoup  
import re  
import time  
import csv  
  
  
def get_movies(page):  
    url = f'https://movie.douban.com/top250?start={(page - 1) * 25}&filter='  
    headers = {  
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'  
    }  
    request = urllib.request.Request(url=url, headers=headers)  
    response = urllib.request.urlopen(request)  
    soup = BeautifulSoup(response.read().decode('utf-8'), 'lxml')  
  
    movies = []  
    for item in soup.select('div.item'):  
        title = item.select_one('span.title').get_text()  
        rating = item.select_one('span.rating_num').get_text()  
  
        people_tag = item.select_one('div.star span:nth-child(4)')  
        people = people_tag.get_text() if people_tag else '0'  
        people = re.search(r'\d+', people).group() if re.search(r'\d+', people) else '0'  
  
        quote_tag = item.select_one('span.inq')  
        quote = quote_tag.get_text() if quote_tag else ''  
        link = item.select_one('a')['href']  
  
        movies.append({  
            'title': title,  
            'rating': rating,  
            'people': people,  
            'quote': quote,  
            'link': link,  
        })  
    return movies  
  
  
if __name__ == '__main__':  
    all_movies = []  
    for page in range(1, 11):  
        print(f'正在爬取第 {page} 页...')  
        all_movies.extend(get_movies(page))  
        time.sleep(1)  
  
    # 保存到桌面douban_top250.csv  
    save_path = r"douban_top250.csv"  
    fieldnames = ["title", "rating", "people", "quote", "link"]  
    with open(save_path, "w", encoding="utf-8-sig", newline="") as f:  
        writer = csv.DictWriter(f, fieldnames=fieldnames)  
        writer.writeheader()  
        writer.writerows(all_movies)  
  
    print(f'\n共爬取 {len(all_movies)} 部电影，数据已保存至桌面')  
    for m in all_movies[:5]:  
        print(f'{m["title"]} — {m["rating"]}分 — {m["people"]}人评价 — {m["quote"]}')
```

#### BeautifulSoup 避坑总结

| 坑点                        | 原因                   | 正确做法                                      |
| ------------------------- | -------------------- | ----------------------------------------- |
| `.string` 返回 None         | 标签内包含子标签             | 用 `.get_text()`                           |
| `.string` 返回的是 Comment    | 标签内只有注释              | 用 `isinstance(x, Comment)` 判断             |
| `tag['class']` 返回列表       | class 支持多值           | 用 `' '.join(tag['class'])` 或 `get_text()` |
| `tag['xxx']` 报错           | 属性不存在                | 用 `tag.get('xxx')` 返回 None                |
| `next_sibling` 是换行符       | 标签之间有空白文本            | 用 `find_next_sibling()`                   |
| `select()` 找不到返回空列表       | 选择器不匹配               | 先判断 `len(list) > 0` 再用                    |
| `select_one()` 找不到返回 None | 选择器不匹配               | 先 `if tag:` 判断再操作                         |
| class 选择器写法               | `class` 是 Python 关键字 | `find()` 用 `class_`，`select()` 用 `.`      |
## Selenium
#### selenium基本使用
```python
import urllib.request  
## （1）导入selenium  
from selenium import webdriver  
from selenium.webdriver.edge.service import Service  
  
## （2）创建浏览器操作对象  
path='msedgedriver.exe'  
service =  Service(path)  
browser = webdriver.Edge(service=service)  
  
## （3）访问网站  
url = 'https://www.jd.com'  
browser.get(url)  
  
content = browser.page_source  
print(content)  
## 此时可以查找到京东秒杀  
## 直接urlopen访问是找不到京东秒杀字段的  
## x = input()
```


| 属性                | 函数                                              |
| ----------------- | ----------------------------------------------- |
| CLASS             | find_element(by=By.CLASS_NAME, value=‘’)        |
| XPATH             | find_element(by=By.XPATH, value=‘’)             |
| LINK_TEXT         | find_element(by=By.LINK_TEXT, value=‘’)         |
| CSS               | find_element(by=By.CSS_SELECTOR, value=‘’)      |
| ID                | find_element(by=By.ID, value=‘’)                |
| TAG               | find_element(by=By.TAG_NAME, value=‘’)          |
| PARTIAL_LINK_TEXT | find_element(by=By.PARTIAL_LINK_TEXT, value=‘’) |

#### selenium元素定位
```python
  
from selenium import webdriver  
from selenium.webdriver.common.by import By  
from selenium.webdriver.edge.service import Service  
  
path = 'msedgedriver.exe'  
service = Service(path)  
browser = webdriver.Edge(service=service)  
  
url = 'https://www.baidu.com'  
browser.get(url)  
  
## 元素定位  
  
## 1.根据id来找到对象  
## button = browser.find_element(By.ID,"chat-submit-button")  
## print(button.text)  
  
## 2.根据标签属性的属性值来获取对象  
## button = browser.find_element(By.NAME,"description")  
## print(button.get_attribute("content"))  
  
## 3.xpath定位  
## button = browser.find_element(By.XPATH,"//button[@id='chat-submit-button']")  
## print(button.text)  
  
## 4.根据标签的名字来获取对象  
## button = browser.find_element(By.TAG_NAME,"div")  
## print(button.text)  
  
## 5.使用bs4的语法来获取对象  
## button = browser.find_element(By.CSS_SELECTOR,"#chat-submit-button")  
## print(button.text)  
  
## 使用link_text来获取对象  
## 6.button = browser.find_element(By.LINK_TEXT,"文心")  
## print(button.text)
```
#### selenium元素信息
```python
from selenium import webdriver  
from selenium.webdriver.common.by import By  
from selenium.webdriver.edge.service import Service  
  
path = 'msedgedriver.exe'  
service = Service(path)  
browser = webdriver.Edge(service=service)  
  
url = 'http://www.baidu.com'  
browser.get(url)  
  
msg = browser.find_element(By.ID,"chat-textarea")  
  
print(msg.get_attribute("data-ai-placeholder"))  
print(msg.tag_name)  
  
button = browser.find_element(By.XPATH,"//button[@id='chat-submit-button']")  
print(button.text)
```

#### selenium交互
```python
  
from selenium import webdriver  
from selenium.webdriver.common.by import By  
from selenium.webdriver.edge.service import Service  
  
## 创建浏览器对象  
path = 'msedgedriver.exe'  
service = Service(path)  
browser = webdriver.Edge(service=service)  
## url  
url='https://www.baidu.com'  
browser.get(url)  
  
import time  
time.sleep(2)  
  
## 获取文本框的对象  
input_obj = browser.find_element(By.ID, "chat-textarea")  
## 在文本中输入周杰伦  
input_obj.send_keys('周杰伦')  
time.sleep(2)  
  
## 获取百度一下的按钮  
button = browser.find_element(By.XPATH,"//button[@id='chat-submit-button']")  
## 点击按钮  
button.click()  
time.sleep(10)  
  
## 滑到底部  
js_bottom = 'window.scrollTo(0, document.body.scrollHeight)'  
browser.execute_script(js_bottom)  
time.sleep(2)  
  
next_button = browser.find_element(By.XPATH,"//span[@class='page-item_M4MDr pc'][normalize-space()='2']")  
next_button.click()  
time.sleep(2)  
  
## 滑到底部  
browser.execute_script(js_bottom)  
time.sleep(2)  
  
## 浏览器的后退  
browser.back()  
time.sleep(2)  
  
## 浏览器的前进  
browser.forward()  
time.sleep(2)  
  
## 退出浏览器  
browser.quit()
```


## handless
```python
  
from selenium import webdriver  
from selenium.webdriver.edge.options import Options  
  
options = Options()  
options.add_argument("--headless") # 开启无头模式  
options.add_argument("--disable-gpu") # 关闭显卡加速  
options.add_argument("--no-sandbox") # 关闭安全沙盒  
browser = webdriver.Edge(options=options)  
  
"""  
后续和前面的一样，就前面的头不一样，可以后续封装起来  
"""  
  
url = 'https://www.baidu.com'  
browser.get(url)  
browser.save_screenshot('baidu.png')  
print("页面标题：", browser.title)  
  
browser.quit()
```

#### 无头模式详解

**什么是无头模式？**
无头模式（Headless Mode）是指浏览器在后台运行，不显示图形界面的模式。它和正常浏览器一样可以执行 JavaScript、渲染页面、处理 Cookie 等操作，只是没有可视化窗口。

**何时使用无头模式？**
- **服务器部署：** 生产环境服务器通常没有桌面环境，必须使用无头模式
- **定时任务：** 需要定时采集数据时，无头模式节省资源
- **批量处理：** 大规模数据采集时，不开窗口大幅降低内存占用
- **CI/CD 测试：** 自动化测试流水线中运行

**有头 vs 无头对比：**

| 对比维度 | 有头模式（Headed） | 无头模式（Headless） |
|---------|------------------|-------------------|
| 界面显示 | 显示浏览器窗口 | 后台运行，无窗口 |
| 资源消耗 | 较高（需渲染 GUI） | 较低 |
| 调试便利性 | 直观，可观察页面行为 | 需截图调试 |
| 运行速度 | 较慢 | 较快 |
| 适用场景 | 开发调试 | 服务器部署、定时任务 |

**Edge/Chrome 无头模式的配置项：**

| 参数 | 说明 |
|------|------|
| `--headless` | 经典无头模式（Edge ≤ 108） |
| `--headless=new` | 新版无头模式（Edge ≥ 109），支持更多功能 |
| `--window-size=1920,1080` | 设置窗口尺寸，避免响应式布局问题 |
| `--disable-gpu` | 禁用 GPU 加速（Windows 上推荐） |
| `--no-sandbox` | 关闭安全沙盒（Linux 服务器需要） |
| `--disable-extensions` | 禁用扩展，提高稳定性 |
| `--hide-scrollbars` | 隐藏滚动条，截图更干净 |
| `--user-agent="..."` | 自定义 UA，避免被识别为自动化工具 |
| `--disable-blink-features=AutomationControlled` | 隐藏自动化特征标记 |
| `--disable-images` | 禁用图片加载，提高速度 |

**检测无头模式的方法（反爬角度）：**
- 检查 `navigator.webdriver` 属性是否为 `true`
- 检查 `window.chrome` 对象是否存在
- 检查 User-Agent 中是否包含 `Headless` 字样
- 检查浏览器指纹差异（Canvas、WebGL、Fonts 等）

#### 封装 headless 工具函数

将 headless 浏览器创建封装为可复用的函数，方便后续调用：

```python
from selenium import webdriver
from selenium.webdriver.edge.options import Options

def create_headless_browser(window_size=(1920, 1080), image_disabled=False):
    """创建无头浏览器，返回 browser 对象"""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument(f"--window-size={window_size[0]},{window_size[1]}")
    options.add_argument("--disable-blink-features=AutomationControlled")
    if image_disabled:
        options.add_argument("--disable-images")
    return webdriver.Edge(options=options)

## 使用示例
browser = create_headless_browser()
browser.get('https://example.com')
print(browser.title)
browser.save_screenshot('screenshot.png')
browser.quit()
```

#### 手动截图调试

无头模式下无法肉眼观察，调试手段主要靠截图和 page_source：

```python
from selenium import webdriver
from selenium.webdriver.edge.options import Options

options = Options()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
browser = webdriver.Edge(options=options)

browser.get('https://www.baidu.com')

## 保存截图（用于观察页面状态）
browser.save_screenshot('baidu_headless.png')

## 保存页面源码（用于分析 DOM 结构）
with open('baidu_page.html', 'w', encoding='utf8') as f:
    f.write(browser.page_source)

## 获取页面标题
print("页面标题：", browser.title)

browser.quit()
```

## requests
#### requests的基本使用
```python
import requests  
  
url = 'http://www.baidu.com'  
  
response = requests.get(url=url)  
  
## 一个类型和六个属性  
## Response类型  
print(type(response))  
  
## 设置响应的编码格式  
response.encoding='utf8'  
  
## 以字符串的形式返回网页的源码  
print(response.text)  
  
## 返回一个url地址  
print(response.url)  
  
## 返回的是二进制的数据，用的不多，一般用text  
print(response.content)  
  
## 返回响应的状态码  
print(response.status_code)  
  
## 返回的是响应头  
print(response.headers)
```

#### requests的get请求
```python
import requests  
  
url = 'https://www.baidu.com/s'  
  
headers = {  
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'  
}  
  
data = {  
    'wd':'北京'  
}  
  
## url 请求资源路径  
## params 参数  
## kwargs 字段  
response = requests.get(url=url,params=data,headers=headers)  
content = response.text  
print(content)  
  
## 总结：  
## （1）参数使用params传递  
## （2）参数无需urlencode编码  
## （3）不需要请求对象的定制  
## （4）请求资源路径中的?可选
```

#### requests的post请求
```python
import requests  
  
url = 'https://fanyi.baidu.com/sug'  
  
headers = {  
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'  
}  
  
data = {  
    'kw':'love'  
}  
  
## url 请求地址  
## data 请求参数  
## kwargs 字段  
response = requests.post(url=url,data=data,headers=headers)  
## content = response.text  
## print(content)  
obj = response.json()  
print(obj)  
  
## 总结：  
## （1）post请求 是不需要解编码  
## （2）post请求的参数是data  
## （3）不需要请求对象的定制
```

#### requests的代理
```python
import requests  
  
url = 'https://www.baidu.com/s?wd=ip'  
  
headers = {  
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0'  
}  
  
data = {  
    'wd':'ip'  
}  
  
proxy = {  
    'http':'121.230.210.31:3256',  
    'http':'121.230.210.32:3251'  
}  
  
response = requests.get(url=url,params=data,headers=headers,proxy=proxy)  
  
content = response.text  
  
with open('daili.html','w',encoding='utf8') as fp:  
    fp.write(content)
```

#### requests的cookie登录古诗文网及ddddocr识别图片验证码
```python
## 通过登录 然后进入到主页面  
  
## 通过找登录接口我们发现 登录的时候需要的参数很多  
## __VIEWSTATE:RUykY0FznTHGCtDZ4I7y6Cl8NyKAcowK/6kKmoNHCXFMn/TvIQbZYp19AT9UaM7Olvxi7OWLX0sLB1GYw3aHE+vdfo1ceGbXDG5pi4TZORUIUqiNPrQTK0F8PBafAJPpWdN0Hn9LoW2k+0ag3bACO9T3IJw=  
## __VIEWSTATEGENERATOR:C93BE1AE  
  
## from:http://www.gushiwen.cn/user/wode.aspx  
## email:19112634506  
## pwd:946439  
## code:BG0X  
## denglu:登录  
  
## 我们观察到__VIEWSTATE和__VIEWSTATEGENERATOR和code是一个可以变化的量  
  
## 难点：（1） __VIEWSTATE和__VIEWSTATEGENERATOR 一般看不到的数据，都是在页面的源码中  
## 我们观察到这两个数据在页面源码中，然后进行解析就可以获取到了  
## （2） 验证码 code  
import requests  
## 登录页面的url地址  
url = 'https://www.gushiwen.cn/user/login.aspx?from=http%3a%2f%2fwww.gushiwen.cn%2fuser%2fwode.aspx'  
  
headers = {  
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0',  
}  
## 获取页面的源码  
response = requests.get(url=url,headers=headers)  
content = response.text  
## print(content)  
  
## 解析页面源码 然后获取 __VIEWSTATE和__VIEWSTATEGENERATOR  
  
from bs4 import BeautifulSoup  
soup = BeautifulSoup(content,'lxml')  
  
## 获取 __VIEWSTATEviewstate = soup.select('#__VIEWSTATE')[0].attrs.get("value")  
print(viewstate)  
  
## 获取 __VIEWSTATEGENERATORviewstategenerator = soup.select('#__VIEWSTATEGENERATOR')[0].attrs.get("value")  
print(viewstategenerator)  
  
## 获取验证码图片  
code = soup.select('#imgCode')[0].attrs.get('src')  
code_url = 'https://www.gushiwen.cn' + code  
## print(code_url)  
  
  
## requests有一个方法 session() 通过session的返回值 就能使请求变成一个对象  
session = requests.session()  
## 验证码的url的内容  
response_code = session.get(code_url)  
## 注意此时要使用二进制数据 因为我们要使用的是图片的下载  
content_code = response_code.content  
## wb的模式就是将二进制的数据写入到文件  
with open('code.jpg','wb') as fp:  
    fp.write(content_code)  
  
## 获取了验证码的图片之后 下载到本地 然后观察验证码 然后在控制台来输入这个验证码  
## 就可以将这个值给code参数 就可以登录  
## code_name = input('请输入你的验证码')  
  
## 新增：自动识别验证码（ddddocr）  
import ddddocr  
ocr = ddddocr.DdddOcr(show_ad=False)  
code_name = ocr.classification(content_code)  
print("自动识别到验证码：", code_name)  
  
## 点击登录  
data_post = {  
    "__VIEWSTATE":viewstate,  
    "__VIEWSTATEGENERATOR":viewstategenerator,  
    "from":"http://www.gushiwen.cn/user/wode.aspx",  
    "email":"19112634506",  
    "pwd":"wcy946439",  
    "code":code_name,  
    "denglu":"登录"  
}  
  
response_post = session.post(url=url,headers=headers,data=data_post)  
  
content_post = response_post.text  
  
with open('gushiwen.html','w',encoding='utf8') as fp:  
    fp.write(content_post)  
  
## 难点  
## （1） 隐藏域  
## （2） 验证码
```

#### requests的session管理

```python
import requests

## session 可以自动管理 cookie，相当于一个浏览器会话
session = requests.session()

## 第一次请求（登录）
login_url = 'https://example.com/login'
data = {'username': 'admin', 'password': '123456'}
session.post(login_url, data=data)

## 后续请求自动携带登录后的 cookie
response = session.get('https://example.com/profile')
print(response.text)
```

**Session 的优势：**
1. 自动管理 Cookie，无需手动从响应中提取再塞进 headers
2. 可复用 TCP 连接（Keep-Alive），多次请求效率更高
3. 可统一设置默认参数（headers、timeout 等）
4. 适用于需要登录的连续操作场景

#### requests的超时与重试

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

## 方式一：简单超时
try:
    response = requests.get('https://httpbin.org/delay/5', timeout=3)
except requests.Timeout:
    print('请求超时')

## 方式二：连接超时 + 读取超时分开设置
## timeout=(connect_timeout, read_timeout)
response = requests.get('https://httpbin.org/delay/5', timeout=(3, 10))

## 方式三：带重试机制的 Session（推荐）
session = requests.session()
retry_strategy = Retry(
    total=3,                # 总重试次数
    backoff_factor=1,       # 退避因子：等待时间 = backoff_factor * (2 ** (retry_count - 1))
    status_forcelist=[500, 502, 503, 504],  # 需要重试的状态码
    allowed_methods=['GET', 'POST']  # 允许重试的 HTTP 方法
)
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount('http://', adapter)
session.mount('https://', adapter)

response = session.get('https://httpbin.org/status/500')
print(response.status_code)
```

#### requests的SSL验证

```python
import requests

## 方式一：忽略 SSL 验证（不推荐生产环境）
response = requests.get('https://self-signed.badssl.com', verify=False)
## ⚠️ 会显示警告：InsecureRequestWarning

## 方式二：禁用 SSL 警告
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

## 方式三：使用自定义证书
response = requests.get('https://example.com', cert=('/path/client.crt', '/path/client.key'))

## 方式四：指定 CA 证书包
response = requests.get('https://example.com', verify='/path/to/cacert.pem')
```

#### requests文件上传

```python
import requests

url = 'https://httpbin.org/post'

## 上传单个文件
files = {'file': open('report.txt', 'rb')}
response = requests.post(url, files=files)
print(response.json())

## 上传带文件名的文件（指定 content-type）
files = {'file': ('report.txt', open('report.txt', 'rb'), 'text/plain')}
response = requests.post(url, files=files)

## 同时上传文件和其他表单数据
response = requests.post(url, data={'name': '张三'}, files=files)
```

#### requests与urllib对比总结

| 对比维度 | urllib | requests |
|---------|--------|----------|
| API 简洁度 | 较复杂，需手动处理 Request 对象 | 极简，一行代码发请求 |
| 编码处理 | 需手动 urlencode + encode | 自动处理 params 和 data |
| Cookie 管理 | 需 CookieJar 手动管理 | Session 自动管理 |
| SSL 验证 | 需额外处理 | verify 参数一键控制 |
| 代理 | ProxyHandler 配置较繁琐 | proxies 字典直接传递 |
| 超时重试 | 需自己实现 | Retry + HTTPAdapter |
| JSON 解析 | json.loads(response.read()) | response.json() 一步到位 |
| 文件上传 | 需自己构造 multipart 数据 | files 参数自动处理 |
| 社区推荐度 | 标准库，适合学习底层原理 | **爬虫首选，高效开发** |

> **结论：** 学习 urllib 是为了理解 HTTP 请求的底层原理（请求对象、编解码、handler 机制），实际爬虫项目强烈推荐使用 requests，效率高出一个数量级。

## scrapy
#### 基本使用

创建爬虫的项目
1.scrapy startproject 项目的名称
注意：项目的名称不允许使用数字开头 也不能包含中文
2.创建爬虫文件
要在项目下去创建爬虫文件 生成在spider中
scrapy genspider 爬虫的名字 爬取的网页
eg: genspider baidu https://www.baidu.com/
3.运行爬虫代码
scrapy crawl 爬虫的名字
eg: scrapy crawl baidu 

#### 爬取58同城
目录
![](/blog/notes-assets/python-spider-notes/file-20260525121103393.png)
关键`tc.py`代码
```python
import scrapy  
from selenium import webdriver  
from selenium.webdriver.edge.options import Options  
from selenium.webdriver.common.by import By  
from selenium.webdriver.common.keys import Keys  
import time  
  
class TcSpider(scrapy.Spider):  
    name = "tc"  
    allowed_domains = ["cq.58.com"]  
    # 不要带key，直接进首页  
    start_urls = ["https://cq.58.com/"]  
  
    def __init__(self, *args, **kwargs):  
        super().__init__(*args, **kwargs)  
        edge_opt = Options()  
        # 无头模式可开可关  
        # edge_opt.add_argument("--headless=new")  
        self.driver = webdriver.Edge(options=edge_opt)  
  
    def parse(self, response):  
        self.driver.get(response.url)  
        time.sleep(10)  
  
        # 1. 找到搜索框  
        search_input = self.driver.find_element(By.ID, "keyword")  
        # 2. 输入关键词  
        search_input.clear()  
        search_input.send_keys("前端开发")  
        # 3. 回车搜索  
        search_input.send_keys(Keys.ENTER)  
  
        # 等待结果加载  
        time.sleep(3)  
  
        # 拿到渲染后的完整页面  
        content = self.driver.page_source  
  
        print('='*100)  
        with open('tc.html','w',encoding='gbk') as fp:  
            fp.write(content)  
  
    def closed(self, reason):  
        self.driver.quit()
```

#### 爬取汽车之家
```python
## 爬取宝马的车名数据
import scrapy  
  
  
class CarSpider(scrapy.Spider):  
    name = "car"  
    allowed_domains = ["www.autohome.com.cn"]  
    start_urls = ["https://www.autohome.com.cn/price/brandid_15?pvareaid=104399"]  
  
    def parse(self, response):  
        names = response.xpath('//div[contains(@class,"tw-mb-2 tw-flex tw-flex-wrap tw-items-center")]/a/text()').getall()  
        print('='*100)  
        for name in names:  
            print(name.strip())
```

#### 爬取当当网
目录
![](/blog/notes-assets/python-spider-notes/file-20260525121103391.png)

```python
import scrapy  
  
from scrapy_dangdang_38.items import ScrapyDangdang38Item  
  
  
class DangdangSpider(scrapy.Spider):  
    name = "dang"  
    allowed_domains = ["dangdang.com"]  
    start_urls = ["https://category.dangdang.com/cp01.05.06.00.00.00.html"]  
    page = 1  
  
    def start_requests(self):  
        headers = {  
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",  
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",  
            "Accept-Language": "zh-CN,zh;q=0.9",  
            "Accept-Encoding": "gzip, deflate, br",  
            "Connection": "keep-alive",  
            "Referer": "https://www.dangdang.com/",  
            "Upgrade-Insecure-Requests": "1"  
        }  
        # 👇 只加这一行，让请求带上 headers        yield scrapy.Request(self.start_urls[0], headers=headers, callback=self.parse)  
  
    base_url = 'https://category.dangdang.com/pg3-cp01.05.06.00.00.00.html'  
    def parse(self, response):  
  
        li_list = response.xpath('//*[@id="component_59"]/li')  
  
        for li in li_list:  
            src = li.xpath('.//img/@data-original').get()  
            if not src:  
                src = li.xpath('.//img/@src').get()  
            if src and src.startswith('//'):  
                src = 'https:' + src  
  
            name = li.xpath('.//img/@alt').get()  
  
            price = li.xpath('.//p[@class="price"]/span[1]/text()').get()  
            if not price:  
                price = li.xpath('string(.//p[@class="price"])').get()  
  
            print("图片：", src)  
            print("书名：", name)  
            print("价格：", price)  
            print('-' * 50)  
  
            book = ScrapyDangdang38Item(src=src,name=name,price=price)  
  
            # 获取一个book就将book交给pipelines  
            yield book  
  
        # 每一页的爬取的业务逻辑全是一样的，所以我们只需要将执行的那个页的请求，再次调用parse方法即可  
        # "https://category.dangdang.com/cp01.05.06.00.00.00.html" 1  
        # "https://category.dangdang.com/pg2-cp01.05.06.00.00.00.html" 2        # "https://category.dangdang.com/pg3-cp01.05.06.00.00.00.html" 3  
        if self.page < 100:  
            self.page = self.page + 1  
            url = f"https://category.dangdang.com/pg{self.page}-cp01.05.06.00.00.00.html"  
            # 怎么去调用自己  
            # scrapy.Request就是scrapy的get请求  
            # url 就是请求地址  
            # callback是你要执行的那个函数， 注意不加()  
            yield scrapy.Request(url=url,callback=self.parse)
```

```python
## Define your item pipelines here  
## 
## Don't forget to add your pipeline to the ITEM_PIPELINES setting  
## See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html  
import re  
  
## useful for handling different item types with a single interface  
from itemadapter import ItemAdapter  
  
## 如果想使用管道的话 那么就必须在setting中来开启管道  
class ScrapyDangdang38Pipeline:  
    # 在爬虫开始的之前就执行的一个方法  
    def open_spider(self, spider):  
        self.fp = open('book.json','w',encoding='utf8')  
  
    # item就是yield后面的book对象  
    def process_item(self, item, spider):  
        # 以下这种模式不推荐 因为每传递一个对象 就打开一次文件 对文件操作过于频繁 在前后加入open和close方法  
        # write 方法必须要写一个字符串 而不能是其他的对象  
        # w模式 会每一个对象都打开一次文件 覆盖之前的内容 需要改a模式  
        # with open('book.json','a',encoding='utf8') as fp:  
        #     fp.write(str(item))        self.fp.write(str(item))  
        return item  
  
    # 在爬虫文件执行完成之后 执行的方法  
    def close_spider(self,spider):  
        self.fp.close()  
  
import urllib.request  
## 多条管道开启  
## （1）定义管道类  
## （2）在settings中开启管道  
## "scrapy_dangdang_38.pipelines.DangDangDownloadPipeline": 301,  
class DangDangDownloadPipeline:  
    def process_item(self, item, spider):  
  
        url = item.get('src')  
        name = item.get('name').strip()  
        name = re.sub(r'[\\/*?:"<>|]', '', name)  
        filename = './books/' + name + '.jpg'  
  
        urllib.request.urlretrieve(url=url,filename=filename)  
  
        return item  
  
  
## 加载setting文件  
from scrapy.utils.project import get_project_settings  
import pymongo  
  
class MongoPipeline:  
    def open_spider(self, spider):  
        self.client = pymongo.MongoClient('localhost', 27017)  
        self.db = self.client['dangdang']  
        self.collection = self.db['books']  
  
    def process_item(self, item, spider):  
        self.collection.insert_one(dict(item))  
        return item  
  
    def close_spider(self, spider):  
        self.client.close()
```

```python
## Define here the models for your scraped items  
## 
## See documentation in:  
## https://docs.scrapy.org/en/latest/topics/items.html  
  
import scrapy  
  
  
class ScrapyDangdang38Item(scrapy.Item):  
    # define the fields for your item here like:  
    # name = scrapy.Field()    src = scrapy.Field()  
    name = scrapy.Field()  
    price = scrapy.Field()
```

```python
## Scrapy settings for scrapy_dangdang_38 project  
## 
## For simplicity, this file contains only settings considered important or  
## commonly used. You can find more settings consulting the documentation:  
## 
## https://docs.scrapy.org/en/latest/topics/settings.html  
## https://docs.scrapy.org/en/latest/topics/downloader-middleware.html  
## https://docs.scrapy.org/en/latest/topics/spider-middleware.html  
  
BOT_NAME = "scrapy_dangdang_38"  
  
SPIDER_MODULES = ["scrapy_dangdang_38.spiders"]  
NEWSPIDER_MODULE = "scrapy_dangdang_38.spiders"  
  
ADDONS = {}  
  
  
## Crawl responsibly by identifying yourself (and your website) on the user-agent  
#USER_AGENT = "scrapy_dangdang_38 (+http://www.yourdomain.com)"  
  
## Obey robots.txt rules  
ROBOTSTXT_OBEY = False  
  
## Concurrency and throttling settings  
#CONCURRENT_REQUESTS = 16  
CONCURRENT_REQUESTS_PER_DOMAIN = 1  
DOWNLOAD_DELAY = 1  
  
## Disable cookies (enabled by default)  
#COOKIES_ENABLED = False  
  
## Disable Telnet Console (enabled by default)  
#TELNETCONSOLE_ENABLED = False  
  
## Override the default request headers:  
#DEFAULT_REQUEST_HEADERS = {  
## "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",  
## "Accept-Language": "en",  
#}  
  
## Enable or disable spider middlewares  
## See https://docs.scrapy.org/en/latest/topics/spider-middleware.html  
#SPIDER_MIDDLEWARES = {  
## "scrapy_dangdang_38.middlewares.ScrapyDangdang38SpiderMiddleware": 543,  
#}  
  
## Enable or disable downloader middlewares  
## See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html  
#DOWNLOADER_MIDDLEWARES = {  
## "scrapy_dangdang_38.middlewares.ScrapyDangdang38DownloaderMiddleware": 543,  
#}  
  
## Enable or disable extensions  
## See https://docs.scrapy.org/en/latest/topics/extensions.html  
#EXTENSIONS = {  
## "scrapy.extensions.telnet.TelnetConsole": None,  
#}  
  
## Configure item pipelines  
## See https://docs.scrapy.org/en/latest/topics/item-pipeline.html  
ITEM_PIPELINES = {  
    # 管道可以有很多个 管道是有优先级的 范围是[1,1000] 值越小优先级越高  
    "scrapy_dangdang_38.pipelines.ScrapyDangdang38Pipeline": 300,  
    # "scrapy_dangdang_38.pipelines.DangDangDownloadPipeline": 301,  
    "scrapy_dangdang_38.pipelines.MongoPipeline": 302,  
}  
  
  
## DB_HOST = '127.0.0.1'  
## DB_PORT = 3306  
## DB_USER = 'root'  
## DB_PASSWORD = '123456'  
## DB_NAME = 'dangdang_data'  
## DB_CHARSET = 'utf-8'  
  
## Enable and configure the AutoThrottle extension (disabled by default)  
## See https://docs.scrapy.org/en/latest/topics/autothrottle.html  
#AUTOTHROTTLE_ENABLED = True  
## The initial download delay  
#AUTOTHROTTLE_START_DELAY = 5  
## The maximum download delay to be set in case of high latencies  
#AUTOTHROTTLE_MAX_DELAY = 60  
## The average number of requests Scrapy should be sending in parallel to  
## each remote server  
#AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0  
## Enable showing throttling stats for every response received:  
#AUTOTHROTTLE_DEBUG = False  
  
## Enable and configure HTTP caching (disabled by default)  
## See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html#httpcache-middleware-settings  
#HTTPCACHE_ENABLED = True  
#HTTPCACHE_EXPIRATION_SECS = 0  
#HTTPCACHE_DIR = "httpcache"  
#HTTPCACHE_IGNORE_HTTP_CODES = []  
#HTTPCACHE_STORAGE = "scrapy.extensions.httpcache.FilesystemCacheStorage"  
  
## Set settings whose default value is deprecated to a future-proof value  
FEED_EXPORT_ENCODING = "utf-8"  
  
## 强制允许状态码 + 关闭默认UA中间件  
USER_AGENT = None  
DOWNLOADER_MIDDLEWARES = {  
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,  
}  
HTTPERROR_ALLOWED_CODES = [405, 403]
```

#### Scrapy 架构

Scrapy 的五大核心组件：

```
         +---------+      +------------+
         | Spider  | ---> | Item       |
         +---------+      | Pipeline   |
              |           +------------+
         +---------+
         | Engine  |  ← 核心引擎，负责数据流转
         +---------+
              |
    +---------+---------+
    |                   |
+---------+       +------------+
|Scheduler|       | Downloader |
+---------+       +------------+
```

| 组件 | 职责 | 说明 |
|------|------|------|
| **Engine（引擎）** | 控制数据流 | 核心枢纽，协调其他组件 |
| **Scheduler（调度器）** | 管理请求队列 | 去重、调度待发送请求 |
| **Downloader（下载器）** | 下载网页内容 | 异步下载，支持中间件 |
| **Spider（爬虫）** | 解析响应、提取数据 | 用户自定义解析逻辑 |
| **Item Pipeline（管道）** | 后处理数据 | 清洗、去重、存储 |

**数据流转流程：**
1. Spider 产生初始 Request → Engine
2. Engine → Scheduler（入队等待调度）
3. Scheduler → Engine → Downloader（发送 HTTP 请求）
4. Downloader 下载页面 → Response → Engine → Spider
5. Spider 解析 Response → 产生 Item 或新的 Request → Engine
6. Item → Pipeline（清洗、存储）；新的 Request → Scheduler（继续爬取）

#### Scrapy Shell 调试

Scrapy 提供了一个交互式 Shell 用于调试选择器，比反复运行爬虫高效得多：

```bash
## 启动 shell 进入指定页面
scrapy shell https://quotes.toscrape.com

## 在 shell 中可以直接使用 response 对象进行测试
>>> response.xpath('//title/text()').get()
'Quotes to Scrape'
>>> response.css('title::text').get()
'Quotes to Scrape'
>>> response.xpath('//div[@class="quote"]')
[<Selector xpath='//div[@class="quote"]' data='<div class="quote"...'>]
```

**常用 Shell 命令：**
```bash
## 从本地文件启动 shell（适合调试本地 HTML）
scrapy shell file:///path/to/page.html

## 带 Cookie 启动 shell
scrapy shell https://example.com --set COOKIES_ENABLED=True
```

#### CrawlSpider — 自动链接爬取

CrawlSpider 继承自 Spider，可以根据规则自动跟踪链接，适合整站爬取：

```python
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor

class MySpider(CrawlSpider):
    name = 'crawl_example'
    allowed_domains = ['example.com']
    start_urls = ['https://example.com']

    # Rule：定义爬取规则
    # LinkExtractor：定义链接提取规则
    # callback：解析函数（follow=True 的 Rule 不需要 callback）
    # follow：是否继续在匹配页面上提取链接
    rules = (
        # 详情页规则：提取 /item/ 开头的页面，只解析不跟进
        Rule(LinkExtractor(allow=r'/item/\d+'), callback='parse_item'),
        # 列表页规则：提取 /page/ 开头的页面，跟进但不解析
        Rule(LinkExtractor(allow=r'/page/\d+'), follow=True),
    )

    def parse_item(self, response):
        yield {
            'title': response.css('h1::text').get(),
            'url': response.url,
        }
```

**LinkExtractor 参数说明：**

| 参数 | 说明 |
|------|------|
| `allow` | 正则表达式，匹配的链接会被提取 |
| `deny` | 正则表达式，匹配的链接会被排除 |
| `allow_domains` | 允许的域名列表 |
| `deny_domains` | 排除的域名列表 |
| `restrict_xpaths` | 只在匹配 XPath 的区域内提取链接 |
| `restrict_css` | 只在匹配 CSS 选择器的区域内提取链接 |
| `tags` | 提取链接的 HTML 标签（默认 `['a', 'area']`）|
| `attrs` | 提取链接的属性（默认 `['href']`）|
| `unique` | 是否去重（默认 True）|

#### Feed 导出

Scrapy 支持直接将数据导出为多种格式，无需写 Pipeline：

```bash
## JSON 格式
scrapy crawl dang -o books.json

## JSON Lines（每行一个对象，适合逐行处理大文件）
scrapy crawl dang -o books.jl

## CSV 格式
scrapy crawl dang -o books.csv

## XML 格式
scrapy crawl dang -o books.xml
```

**在 settings.py 中配置 Feed 导出（更精细的控制）：**

```python
FEEDS = {
    'books.json': {
        'format': 'json',
        'encoding': 'utf8',
        'store_empty': False,
        'indent': 2,               # 格式化缩进
    },
    'books.csv': {
        'format': 'csv',
        'encoding': 'utf-8-sig',    # 带 BOM，Excel 可直接打开
        'fields': ['name', 'price', 'src'],  # 指定列顺序
    },
}
```

#### Item Loader — 数据清洗利器

Item Loader 提供了字段级别的输入/输出处理器，避免在 Pipeline 中做大量字符串清洗：

```python
from scrapy.loader import ItemLoader
from itemloaders.processors import TakeFirst, MapCompose, Join
import re

def strip_price(value):
    """价格清洗：去掉 ¥ 符号和多余字符，只保留数字和小数点"""
    return re.sub(r'[^\d.]', '', value)

class BookItem(scrapy.Item):
    name = scrapy.Field()
    price = scrapy.Field()

class BookItemLoader(ItemLoader):
    default_item_class = BookItem
    default_output_processor = TakeFirst()   # 默认只取第一个值作为输出

    name_in = MapCompose(str.strip)          # 输入时自动去除首尾空白
    price_in = MapCompose(strip_price)       # 输入时自动清洗价格
```

**在 Spider 中使用 ItemLoader：**

```python
def parse(self, response):
    loader = BookItemLoader(item=BookItem(), selector=response)
    loader.add_xpath('name', '//img/@alt')
    loader.add_xpath('price', './/p[@class="price"]/span[1]/text()')
    yield loader.load_item()   # load_item() 会依次执行所有处理器
```

**常用处理器对照：**

| 处理器 | 说明 | 示例 |
|--------|------|------|
| `TakeFirst()` | 取列表第一个值 | 默认输出处理器 |
| `MapCompose(fn1, fn2)` | 依次对每个输入值执行函数 | 清洗、类型转换 |
| `Join(separator)` | 将多个值拼接为字符串 | 合并多行文本 |
| `Identity()` | 不做处理，原样返回 list | 需要保留多个值时使用 |

#### Downloader Middleware — 下载中间件

下载中间件在请求发出前和响应返回后执行，常用于 UA 轮换、代理轮换等反爬对抗：

```python
## middlewares.py
import random

class RandomUserAgentMiddleware:
    """随机 User-Agent 中间件"""
    USER_AGENTS = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...',
        'Mozilla/5.0 (X11; Linux x86_64) ...',
    ]

    def process_request(self, request, spider):
        request.headers['User-Agent'] = random.choice(self.USER_AGENTS)


class RandomProxyMiddleware:
    """随机代理中间件"""
    PROXIES = [
        {'http': 'http://proxy1:8080', 'https': 'http://proxy1:8080'},
        {'http': 'http://proxy2:8080', 'https': 'http://proxy2:8080'},
    ]

    def process_request(self, request, spider):
        proxy = random.choice(self.PROXIES)
        request.meta['proxy'] = proxy['http']
```

**在 settings.py 中注册中间件：**

```python
DOWNLOADER_MIDDLEWARES = {
    # 关闭默认中间件
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
    # 注册自定义中间件（数值越小越靠近引擎，优先级越高）
    'myproject.middlewares.RandomUserAgentMiddleware': 543,
    'myproject.middlewares.RandomProxyMiddleware': 544,
}
```

**中间件方法的执行顺序：**

```
请求阶段：process_request 按优先级递增执行（数值小先执行）
                            ↓
                        Downloader
                            ↓
响应阶段：process_response 按优先级递减执行（数值大先执行）
```

#### Selenium + Scrapy 整合推荐模式

当页面由 JavaScript 动态渲染时，推荐通过 Downloader Middleware 集成 Selenium，而非在 Spider 中直接操作：

```python
## middlewares.py
class SeleniumMiddleware:
    """统一管理 Selenium 的中间件，只在需要时启用"""

    def __init__(self):
        from selenium import webdriver
        from selenium.webdriver.edge.options import Options
        opts = Options()
        opts.add_argument('--headless=new')
        opts.add_argument('--disable-gpu')
        self.driver = webdriver.Edge(options=opts)

    def process_request(self, request, spider):
        # 只对标记了 render_js 的请求启动 Selenium
        if request.meta.get('render_js'):
            self.driver.get(request.url)
            from scrapy.http import HtmlResponse
            return HtmlResponse(
                url=request.url,
                body=self.driver.page_source,
                encoding='utf-8',
                request=request
            )
        # 普通请求不处理，继续走默认下载流程
        return None

    def __del__(self):
        self.driver.quit()
```

**在 Spider 中使用：**

```python
class MySpider(scrapy.Spider):
    name = 'my_spider'

    def start_requests(self):
        yield scrapy.Request(
            url='https://example.com/dynamic-page',
            meta={'render_js': True},   # 标记需要 JS 渲染
        )

    def parse(self, response):
        # 此时 response.body 已经是 JS 渲染后的完整 HTML
        pass
```

这种整合方式的优点：
1. **职责分离：** Spider 只负责解析，中间件负责渲染
2. **灵活控制：** 只在需要时启动 Selenium，普通请求走内置 Downloader
3. **资源管理：** 中间件统一管理浏览器生命周期

#### Scrapy 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 返回 403/404 | 反爬虫识别 | 添加 headers/Cookie、使用代理、降低请求频率 |
| 数据为空 | 页面由 JS 动态加载 | 使用 Selenium 中间件或直接请求 XHR 接口 |
| 中文乱码 | 编码不一致 | `FEED_EXPORT_ENCODING = 'utf-8'` |
| 内存溢出 | 请求积压过多 | 调低 `CONCURRENT_REQUESTS`、增加 `DOWNLOAD_DELAY` |
| 重复爬取 | 未正确去重 | 开启 `DUPEFILTER_CLASS` 或自定义去重逻辑 |
| 下载图片失败 | 防盗链 | 添加 `Referer` 请求头 |
| Scrapy 运行慢 | 并发太低或延迟太大 | 适当调高 `CONCURRENT_REQUESTS`，确认 `DOWNLOAD_DELAY` 是否必要 |
