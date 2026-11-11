---
title: 'Flask 全流程笔记：从环境到部署'
date: 2026-05-28
summary: '1200 行的 Flask 系统笔记，覆盖路由、模板、请求上下文、数据库、蓝图与项目结构。'
tags: ['Python', 'Flask', 'Web']
origin: 'Flask 笔记.md'
---
## 第一章：准备工作

### 第一节：Python环境

为了适应各种Python版本，这里我们使用`MiniConda`来作为Python环境。`MiniConda`可以在创建虚拟环境的时候指定Python的版本号，并且没有`Anaconda`那么多乱七八糟的第三方库。

#### 一、安装MiniConda

Miniconda的下载地址为：[https://www.anaconda.com/download/success](https://www.anaconda.com/download/success)，安装过程这里不再赘述，尽量选择一个不那么深的路径安装即可，在安装完后，将以下三个路径添加到**环境变量**中（这里以我的安装路径`C:\Software\Miniconda3`为例）：

```powershell
## 根路径
C:\Software\Miniconda3
## Scripts路径
C:\Software\Miniconda3\Scripts
## bin路径
C:\Software\Miniconda3\Library\bin
```

#### 二、虚拟环境

默认情况下，我们直接通过`pip install`的方式将包安装在系统级别的Python环境中，这样存在一个问题，就是如果有个老项目用`Flask 1.x`做的，然后你现在想用最新的Flask版本来开发新项目，这时候就会碰到一个问题，如何在电脑中同时拥有`Flask 1.x`和`Flask 3.x`两套环境呢？这时候我们就可以通过虚拟环境来解决这个问题。

虚拟环境相当于一个抽屉，在这个抽屉中安装的任何软件包都不会影响到其他抽屉（或者可以用虚拟机的概念来辅助理解），这样我们就可以创建各种各样的环境来满足我们的项目需求，而不会影响其他项目了。

首先，我们创建一个基于`Python 3.13`版本的虚拟环境：

```python
## 使用3.13的环境
$ conda create -n flask-env python=3.13
```

通过以下命令可以管理虚拟环境：

```python
## 查看所有的虚拟环境
$ conda env list
## 删除虚拟环境
$ conda env remove -n [虚拟环境名称]
## 进入虚拟环境
## 首次运行要执行：conda init
$ conda activate [虚拟环境名称]
## 退出虚拟环境
$ conda deactivate
```

#### 三、安装Flask

这里我们安装目前最新的Flask版本：3.1.2，以及能够使得在开发模式下，能够更快重载项目的`Watchdog`。执行以下命令安装：

```python
## 1. 进入虚拟环境
$ conda activate flask-env
## 2. 安装flask和watchdog
$ pip install flask[async]==3.1.2 watch==6.0.0
```

#### 四、设置pip源

默认情况下，使用`pip`命令会从python官网上下载，由于Python官网服务器在国外，下载速度有点慢，可以将pip源设置成国内的，比如豆瓣的或清华大学的，在系统级别的Python解释器下，执行以下命令即可设置：

```python
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

上面是设置了清华大学的pip源，也可以设置成其他的：

```python
阿里云      https://mirrors.aliyun.com/pypi/simple/
豆瓣        http://pypi.douban.com/simple/
清华大学    https://pypi.tuna.tsinghua.edu.cn/simple/
中国科学技术大学  http://pypi.mirrors.ustc.edu.cn/simple/
```

这些可能会随时改变，读者要自行调整。

### 第二节：开发工具

#### 一、PyCharm

目前最专业的Python开发工具还是PyCharm，PyCharm下载地址为：[https://www.jetbrains.com/pycharm/](https://www.jetbrains.com/pycharm/)，由于做Flask web开发需要用到它的Pro功能，所以需要升级到Pro版本，读者可使用教育邮箱（以`.edu.cn`）申请Pro资格或购买相关服务来升级成Pro版本。

#### 二、MySQL

对于一个网站，存储数据是一项基本功能，这里我们采用一个免费且功能强大的软件：MySQL存储数据。MySQL下载地址为：[https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)，下载后，双击：

![](/blog/notes-assets/flask-full-course/1759892237481-c9b49ac3-0de5-4031-9615-bae849b43243.png)

这一步选择`Server Only`即可。然后点击Next，并点击Execute：

![](/blog/notes-assets/flask-full-course/1759892342777-b03f320f-cceb-4962-a05c-e85a2bba9b19.png)

点击Next：

![](/blog/notes-assets/flask-full-course/1759892390978-b0abac5a-6867-43f3-a14c-dd15d66dcb5b.png)

点击Next：

![](/blog/notes-assets/flask-full-course/1759892424512-de9dc865-c405-4ddc-bff5-e8ba9303d17f.png)

使用默认的配置即可，依然点击Next：

![](/blog/notes-assets/flask-full-course/1759892463282-93843507-ab56-47f4-9612-a498a1272075.png)

选择加强的加密方式。

![](/blog/notes-assets/flask-full-course/1759892572266-b79765b7-0e97-463b-ad63-3a7d01fbaf94.png)

设置root用户的密码，这里由于不是真正的服务器，所以建议不要用过于复杂的密码。

![](/blog/notes-assets/flask-full-course/1759892605675-10288fa6-3eb8-42cd-887d-821426821695.png)

保持默认设置即可，这样会将MySQL注册为Windows的服务，并且在电脑启动时会自动启动MySQL服务。

![](/blog/notes-assets/flask-full-course/1759892641702-ac786d7c-7a74-41c4-8cfd-6f4674002dd2.png)

选择获取所有权限，然后点击Next，会有一个验证的过程，验证完成后，点击Execute，等待安装完成即可。

#### 三、Navicat Premium Lite

MySQL是一个服务（Service），安装好MySQL后，还需要一个客户端软件与其进行连接才能操作MySQL。Navicat Premium Lite是一款免费的数据库连接工具，功能也非常强大，首先在：[https://www.navicat.com.cn/download/navicat-premium-lite](https://www.navicat.com.cn/download/navicat-premium-lite)，下载最新版后，双击安装程序，设置好安装路径后即可。在安装完后点击左上角的连接：

![](/blog/notes-assets/flask-full-course/1759892770248-e56208ec-76b1-470f-adb3-bacf492324af.png)

选择MySQL，然后点击下一步。

![](/blog/notes-assets/flask-full-course/1759892855423-92113027-afbb-4d39-ac68-b44c626ba9a4.png)

设置连接名称，以及在安装MySQL时设置的密码。点击确定即可连接成功（连接失败大概率就是密码错了。）

---

## 第二章：Flask基本

### 第一节：Flask入门

#### 一、Flask简介

`Flask`是一款非常流行的`Python Web`框架，出生于2010年，作者是`Armin Ronacher`，本来这个项目只是作者在愚人节的一个玩笑，后来由于非常受欢迎，进而成为一个正式的项目。目前为止最新的版本是`3.1.2`。

`Flask`自2010年发布第一个版本以来，大受欢迎，深得开发者的喜爱，在以下链接中可以看到大量出名企业比如Netflix（奈飞）、Reddit、Google等大企业都在使用Flask。

[Why developers like Flask](https://stackshare.io/flask)
Flask能如此流行的原因，可以分为以下几点：

- **微框架、简洁**：只做他需要做的，给开发者提供了很大的扩展性。比如使用`Flask`开发数据库的时候，具体是使用`SQLAlchemy`还是`MongoEngine`，选择权完全掌握在你自己的手中。
- **Flask和相应的插件写得很好**：用起来很爽。
- **开发效率非常高**：比如使用`SQLAlchemy`的`ORM`操作数据库可以节省开发者大量书写SQL的时间。

另外，随着人工智能的飞速发展，将训练好的模型发布成Web产品的需求也日益增长，而Flask使用Python开发，天然与PyTorch、Tensorflow等框架兼容，可以无缝将模型转换成Web服务。所以学好Flask是一个非常有价值的事情。

#### 二、第一个Flask项目

##### 创建项目

打开Pycharm，然后点击左上角创建项目，然后在创建新项目窗口左侧选择项目类型为：Flask，并设置好项目路径，项目Python解释器路径：

![](/blog/notes-assets/flask-full-course/1760943897466-aeb30e44-d316-43ae-adfa-2df9253306d5.png)

##### 代码介绍

```python
## 1. 导入Flask类
from flask import Flask

## 2. 创建Flask对象，传入__name__
## 作用：确定项目根路径，确定templates和static路径
app = Flask(__name__)

## 3. 创建一个根路由，当访问：http://127.0.0.1:5000时会访问这个路由
@app.route('/')
def hello_world():
    # 视图函数：view function
    # 返回Hello World!，在浏览器中会看到这个输入
    return 'Hello World!'

## 4. 如果当前文件作为项目入口文件，那么__name__==__main__
if __name__ == '__main__':
    # 运行Flask实例对象
    app.run()
```

#### 三、项目配置

##### debug模式

在开发Flask项目时，开启debug模式后，如果代码发生修改，我们只要按`Ctrl+S`，Flask就会重新加载项目，而不需要关闭再打开项目，并且如果项目运行过程中出现的bug，也会将错误信息显示在浏览器或PyCharm控制台，方便我们查看。在PyCharm中可以编辑项目配置，勾选DEBUG，即可开启debug模式。

![](/blog/notes-assets/flask-full-course/1760947862435-331f45d4-28fa-48c7-91d0-6ae783a94180.png)

##### 设置Host和Port

Host代表的是主机，Port代表的是端口号。先拿一个实际例子来简单解释一下Host和Port。比如百度首页网址为https://www.baidu.com:443，其中冒号前面的www.baidu.com即为Host，冒号后面的443即为Port，而百度首页网址用的是https协议，因为https协议默认监听的是443端口，所以我们生活中在访问百度首页网址的时候，即使没有写明443端口，浏览器也会请求百度服务器的443端口，即通过https://www.baidu.com也可以访问到百度首页。我们在自己电脑上运行完Flask项目后，就可以看到控制台输出Running on http://127.0.0.1:5000，这里host使用的是127.0.0.1，代表只有本机可以访问，而port是5000，代表以后访问要通过5000端口访问。在Pycharm中可以通过以下方式修改Host和Port。

![](/blog/notes-assets/flask-full-course/1760949089544-0bb9f67c-d796-4685-90dc-2a3391edc1d5.png)

##### 修改其他配置

如果需要修改其他配置，比如后期开发中需要用到的`SECRET_KEY`，那么可以通过`app.config`来配置，`app.config`类似于字典，并且所有配置项都要是大写的形式，否则不会被Flask读取到作为配置项，所以我们配置`SECRET_KEY`可以通过以下代码实现：

```python
from flask import Flask

app = Flask(__name__)
app.config["SECRET_KEY"] = "sdfasfdsa"
```

随着项目功能越来越复杂，配置项也越来越多，如果全部通过`app.config`那么代码将会非常冗余，这时候我们可以通过配置文件的形式来配置。比如我们写一个`config.py`，然后添加一些配置项：

```python
## config.py
SECRET_KEY = "xxx"
SQLALCHEMY_DATABASE_URI = "sqlite3:///sqlite3.db"
```

然后通过`app.config.from_object`即可绑定这个文件中的配置项。示例代码如下：

```python
from flask import Flask
import config

app = Flask(__name__)
app.config.from_object(config)
```

### 第二节：URL与视图

#### 一、URL与视图概念

我们开发完一个Flask项目后，用户可以在浏览器或者通过相关代码来访问这个URL，那么访问这个URL要执行的逻辑操作，就是视图函数的工作了。在使用Pycharm创建完一个Flask项目后，默认会生成app.py文件，这个文件中默认会有以下代码：

```python
from flask import Flask
import config

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

if __name__ == '__main__':
    app.run()
```

当我们在浏览器中访问：http://127.0.0.1:5000后，会返回看到："Hello World!"，这个字符串就是`hello_word`视图函数返回的值。

#### 二、定义URL

一个网站通常有很多URL，有的URL没有参数，比如首页；有的URL有参数，比如获取一篇博客详情，那么必须要把博客的唯一标识传到服务器，才能正确返回指定的博客内容。以下针对无参和有参的角度来进行讲解。

##### 定义无参URL

无参URL的定义非常简单，只需要通过`@app.route`即可定义，比如以下定义一个个人中心的无参URL：

```python
@app.route('/profile')
def profile():
    return '这是个人中心'
```

##### 定义有参URL

在URL上传递参数，有两种形式，我们拿获取博客详情为例：

- 定义为`/blog/<blog_id>`，那么访问的时候就是`/blog/123`就可以将参数`blog_id=123`传递给视图函数。这种形式叫做path传参数。
- 定义为`/blog`，那么访问的时候就是`/blog?blog_id=123`，也可以将参数`blog_id=123`传给视图函数。这种形式叫做query string传参。

###### path传参

```python
@app.route("/blog/<int:blog_id>")
def blog_detail(blog_id):
    return f"获取到的博客ID为：{blog_id}"
```

上述代码我们可以看到参数定义是通过语法：`<类型:参数名>`的形式传递的，其中类型是可选的，如果设置了，那么在解析参数的时候就会将该参数转换为对应的类型，如果转换失败，那么就会抛出404错误；如果没有设置，那么参数类型就是字符串类型。除了`int`类型外，还有以下其他类型：

- `string`：字符串类型，默认类型。
- `int`：整形。
- `float`：浮点类型。
- `path`：路径。类似`string`，但是中间即使添加了`/`，也会将其当做成一个整体。
- `uuid`：UUID类型。
- `any`：备选值中的任何一个。比如`@app.route("/blog/list/<any(python,flask,django):category>")`，那么参数`category`就只能是`python`、`flask`和`django`中的一个，否则就会出现404错误。

###### query string传参

query string传参在参数定义时与无参数URL一样，然后在视图函数中通过`request.args.get("参数名称")`来获取参数。示例代码如下：

```python
from flask import request

@app.route("/blog")
def blog_detail():
    blog_id = request.args.get("blog_id")
    return f"获取到的博客ID为：{blog_id}"
```

在浏览器中可以通过`/blog?blod_id=123`来访问该视图函数。如果有多个参数需要传递，那么就通过`&`符号连接，示例代码如下：

```python
from flask import request

@app.route("/blog/list")
def blog_list():
    page = request.args.get("page")
    size = request.args.get("size")
    return f"获取到的博客page为：{page}，size为：{size}"
```

在浏览器中可以通过`/blog?page=1&size=10`来访问该URL，并将`page=1`和`size=10`传给视图函数。

#### 三、请求方法

在定义URL的时候，不同的操作应该使用不同的方法。比如从服务器获取数据就是用`get`请求，提交数据到服务器应该用`post`请求，修改服务器数据应该用`put`请求，从服务器上删除数据应该用`delete`请求。示例代码如下：

```python
@app.route("/blog/add", methods=['POST'])
def blog_add():
    return "使用POST方法添加博客"
```

上述代码中限制了请求添加博客的URL时只能用`POST`方法，如果用其他方法请求，比如`GET`，Flask就会返回`405 Method Not Allowed`错误。除了使用`@app.route`装饰器，我们还可以使用一些快捷路由来限制请求方法。

| 快捷路由装饰器 | 描述 |
| --- | --- |
| app.get("/login") | 等价于app.route("/login", methods=['GET']) |
| app.post("/login") | 等价于app.route("/login", methods=["POST"]) |
| app.put("/login") | 等价于app.route("/login", methods=["PUT"]) |
| app.delete("/login") | 等价于app.route("/login", methods=["DELETE"]) |
| app.patch("/login") | 等价于app.route("/login", methods=["PATCH"]) |

#### 四、页面重定向

页面和重定向，下文我们简称重定向。重定向在页面中体现的操作是，浏览器会从一个页面自动跳转到另外一个页面。比如用户访问了一个需要权限的页面，但是该用户当前并没有登陆，因此我们应该给他重定向到登陆页面。重定向分为永久性重定向和暂时性重定向，以下是相关介绍。

- **永久性重定向**：http的状态码是301，多用于旧网址被废弃，要转到一个新的网址确保用户正常的访问。最经典的就是京东网站案例，他在使用www.jd.com域名之前有过许多其他域名，比如www.360buy.com、www.jingdong.com，以前在这两个域名没有被废弃之前，当用户在浏览器中输入这两个域名的时候，会自动跳转到www.jd.com，因为这两个域名以后要被废弃了，所以这种情况下应该使用永久性重定向。
- **暂时性重定向**：http的状态码是302，表示页面的暂时性跳转。比如访问一个需要权限的网址，但是当前用户没有登陆，这时候就应该重定向到登陆页面，并且是暂时性的重定向。

在Flask中，重定向是通过`flask.redirect(location, code=302)`函数来实现的，`location`表示需要重定向到哪个URL，`code`代表状态码，默认是`302`，也即暂时性重定向。下面我们用一个简单的案例来说明下这个函数的用法。

```python
from flask import Flask, url_for, redirect

app = Flask(__name__)

@app.route('/login')
def login():
    return 'login page'

@app.route('/profile')
def profile():
    name = request.args.get('name')
    if not name:
        # 如果没有name，说明没有登录，重定向到登录页面
        return redirect("/login")
    else:
        return name
```

### 第三节：模板

#### 一、模板基本使用

之前的章节中，我们的视图函数返回的都是一个字符串。而实际网站开发中，为了让网页更加美观，是需要渲染一个有富文本标签的页面，通常包含大量的HTML代码，如果把这些HTML代码用字符串的形式写在视图函数中，后期的代码维护将变得噩梦一般。因此，在Flask中，渲染HTML通常会交给模板引擎来做，而Flask中默认配套的模板引擎是Jinja2，Jinja2的作者也是Flask的作者，Jinja2可以独立于Flask使用，比如被Django使用。Jinja2是一个高效、可扩展的模板引擎。**虽然现在项目都是前后端分离的，但是Jinja2模板作为传统HTML结构的优秀模板框架，依然是做Web开发必备的技能，另外通过学习Jinja2模板语法，对于掌握其他框架（比如Vue）有很大的帮助。** Jinja2的官方文档：[https://jinja.palletsprojects.com/en/stable/intro/](https://jinja.palletsprojects.com/en/stable/intro/) 截止目前，Jinja2最新的版本为3.1.6。

使用Pycharm创建完一个Flask项目后，默认会生成一个`templates`文件夹，如果没有修改模板查找路径，默认会在这个文件夹下寻找模板文件。模板文件可以是任意纯文本格式的文件，比如TXT、HTML、XML等，但是为了让项目更规范，也为了与前端开发者更无缝的协作，一般我们都是用HTML文件来写模板代码。

如果项目中没有生成`templates`目录，则可以手动创建templates目录。比如我们这里创建一个首页的视图和模板，那么视图函数代码为：

```python
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    # 会在项目根路径下的templates下寻找index.html文件
    return render_template("index.html")
```

`index.html`模板代码为：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>首页</title>
</head>
<body>
    <h1>这是首页</h1>
</body>
</html>
```

那么在浏览器中访问：`http://127.0.0.1:5000`即可看到页面中出现一级标题"首页"了。

#### 二、渲染变量

在HTML文件中，有些数据是需要从数据库中动态加载的，比如博客列表，不可能新增一篇博客就要修改html的代码，正确的做法是每次用户访问这个博客列表URL时，在视图函数中就读取最新的博客数据，然后把最新的博客数据传递到模板中。这时候就涉及到，在模板中怎么使用变量，比如下面渲染模板的时候，我们就会传入一个`hobby`参数，示例代码如下：

```python
@app.route("/variable")
def variable():
    hobby = "游戏"
    return render_template("variable.html",hobby=hobby)
```

在`variable.html`文件中就可以使用`hobby`变量，示例代码如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>变量使用</title>
</head>
<body>
    <h1>我的兴趣爱好是：{{ hobby }}</h1>
</body>
</html>
```

上述代码中，我们使用了`{{ 变量名 }}`的语法，来读取一个从视图函数中传递过来的变量`hobby`。

在模板中，可以使用`对象.属性`或`字典.key`的语法来访问对应的值。比如下面代码传给模板文件有一个`user`对象和一个`person`字典。示例代码如下：

```python
class User:
    def __init__(self,username,email):
        self.username = username
        self.email = email

@app.route("/variable")
def variable():
    hobby = "游戏"
    person = {
        "name": "张三",
        "age": 18
    }
    user = User("李四","xx@qq.com")
    return render_template("variable.html",hobby=hobby,person=person,user=user)
```

然后在`variable.html`中就可以通过以下方式来访问`user.属性`和`person.key`。示例代码如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>变量使用</title>
</head>
<body>
    <h1>我的兴趣爱好是：{{ hobby }}</h1>
    <p>person的姓名是：{{ person.name }}，person的年龄是：{{ person.age }}</p>
    <p>user的用户名是：{{ user.name }}，user的邮箱是：{{ user.email }}</p>
</body>
</html>
```

#### 三、控制语句

模板中，也存在if语句和for循环等控制语句。所有的控制语句，都是放在`{% %}`中间的，并且在控制语句结束后，要加入相应的结束语句。下面对if语句和for循环分别进行讲解。

##### if语句

Jinja2中的if语句和Python中的if语句非常的类似。可以使用>、<、>=、<=、==、!=来进行判断，也可以通过and、or、not来进行逻辑操作。我们首先创建一个if_statement的视图函数，代码如下：

```python
@app.route("/if")
def if_statement():
    age = 18
    return render_template("if.html",age=age)
```

这里我们定义了一个age变量，并且把这个age传给一个叫做if.html的模板。在if.html模板中，我们根据age的大小，来判断是否成年。if.html的代码如下：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>if语句</title>
</head>
<body>
    {% if age > 18 %}
    <div>您已成年！</div>
    {% elif age < 18 %}
    <div>您未成年！</div>
    {% else %}
    <div>您刚成年！</div>
    {% endif %}
</body>
</html>
```

上述代码中，`if`结束后必须跟一个`endif`语句。另外在模板中的缩进并不是必须的，只是为了代码阅读性更强。

##### for语句

Jinja2中的for循环与Python中的for循环也是非常类似的，只是比Python中的for循环多一个endfor代码块。我们先来实现一下视图函数，代码如下：

```python
@app.route("/for")
def for_statement():
    books = [{
        "name": "三国演义",
        "author": "罗贯中",
        "price": 100
    },{
        "name": "水浒传",
        "author": "施耐庵",
        "price": 99
    },{
        "name": "红楼梦",
        "author": "曹雪芹",
        "price": 101
    },{
        "name": "西游记",
        "author": "吴承恩",
        "price": 102
    }]
    return render_template("for.html",books=books)
```

在模板中，就可以使用`for`循环显示所有图书信息了：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>for循环</title>
</head>
<body>
    <table>
        <thead>
            <tr>
                <th>书名</th>
                <th>作者</th>
                <th>价格</th>
            </tr>
        </thead>
        <tbody>
            {% for book in books %}
            <tr>
                <td>{{ book.name }}</td>
                <td>{{ book.author }}</td>
                <td>{{ book.price }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
</body>
</html>
```

Jinja2模板中没有`continue`和`break`语句，读者需要注意。

#### 四、模板继承

一个网站中，大部分网页的模块是重复的，比如顶部的导航栏，底部的备案信息。如果在每个页面中都重复的去写这些代码，会让项目变得臃肿，提高后期维护成本。比较好的做法是，通过模板继承，把一些重复性的代码写在父模板中，子模板继承父模板后，再分别实现自己页面的代码。我们首先来看一个父模板base.html的例子。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="base.css" />
    <title>{% block title %}{% endblock %}</title>
    {% block head %}{% endblock %}
</head>
<body>
    <div id="body">{% block body %}{% endblock %}</div>
    <div id="footer">
        {% block footer %}
        &copy; Copyright 2008 by <a href="http://domain.invalid/">you</a>
        {% endblock %}
    </div>
</body>
</html>
```

以上父模板中，编写好了网页的整体结构，并且把所有子模板都需要用到的样式文件base.css也提前引用好了。然后针对子模板需要重写的地方，则定义成了block，比如以上定义了title、head、body、footer这几个block，子模板在继承了父模板后，重写对应block的代码，即可完成子模板的渲染。这里我们用继承base.html的方式，实现一个index.html文件，代码如下：

```html
{% extends "base.html" %}
{% block title %}首页{% endblock %}
{% block head %}
<style>
    .detail{
        color: red;
    }
</style>
{% endblock %}
{% block body %}
<h1>这里是首页</h1>
<p class="detail">
    首页的内容
</p>
{% endblock %}
```

首先，我们通过extends语法，加载父模板，因为base.html和index.html是在同一级目录，所以直接写"base.html"。这里需要注意的是，extends必须出现在子模板所有代码的最前面。接下来分别实现了title、head、content这三个block，实现的block中的代码，将会被自动填充到父模板指定的位置，并且最终会生成一个完整HTML结构的index.html文件。

#### 五、加载静态文件

一个网页中，除了HTML代码以外，还需要CSS、JavaScript和图片文件才能更加美观和实用。静态文件默认是存放到当前项目的static文件夹中。在模板文件中，可以通过`url_for`加载静态文件，示例代码如下：

```html
<link href="{{ url_for('static',filename='about.css') }}">
```

以上代码经过渲染后，在浏览器上的最终结果是：

```html
<link href="/static/about.css">
```

---

## 第三章：数据库

### 第一节：数据库准备

#### 一、MySQL软件

本课程中的软件我们使用的是MySQL，安装方式请参考`第一章->第二节：开发工具`。

#### 二、Python操作MySQL驱动

Flask想要操作数据库，必须要先安装Python操作MySQL的驱动。在Python中，目前有以下MySQL驱动包。

+ `mysqlclient`：是目前为止执行速度最快的驱动，请通过命令`pip install mysqlclient`安装，而不要在PyCharm中安装，否则很容易出错。
+ `pymysql`：纯Python实现的一个驱动。因为是纯Python编写的，因此执行效率不如mysqlclient。也正因为是纯Python写的，因此可以和Python代码无缝衔接。
+ `mysql-connector-python`：MySQL官方推出的纯Python连接MySQL的驱动，执行效率比pymysql还慢。

这里我们用`mysqlclient`作为驱动程序。

	### 三、Flask-SQLAlchemy

在Flask中，我们很少会使用驱动程序（比如mysqlclient）直接写原生SQL语句去操作数据库，更多的是通过`SQLAlchemy`提供的ORM（Object Relationship Mapping）技术，类似于操作普通Python对象一样实现数据库的增删改查操作，而`Flask-SQLAlchemy`是对`SQLAlchemy`的一个封装，使得在Flask中使用`SQLAlchemy`更加方便。`Flask-SQLAlchemy`是需要单独安装，因为`Flask-SQLAlchemy`依赖`SQLAlchemy`，所以只要安装了`Flask-SQLAlchemy`，`SQLAlchemy`会自动安装。安装命令如下。

```bash
$ pip install flask-sqlalchemy
```

SQLAlchemy类似于Jinja2，是可以独立于Flask而被使用的，完全可以在任何Python程序被使用，SQLAlchemy的功能非常强大，本课件不可能全部都讲到。读者如果有兴趣，可以在学完本章后阅读SQLAlchemy的官方文档，链接为：[https://www.sqlalchemy.org/](https://www.sqlalchemy.org/)。

#### 四、Flask-SQLAlchemy基本使用

##### 连接MySQL

使用`Flask-SQLAlchemy`操作数据库之前，要先创建一个由`Flask-SQLAlchemy`提供的`SQLAlchemy`类的对象。在创建这个类的时候，要传入当前的app。然后还需要在`app.config`中设置`SQLALCHEMY_DATABASE_URI`，来配置数据库的连接，示例代码如下。

```python
from flask import Flask  
from flask_sqlalchemy import SQLAlchemy  
from sqlalchemy import text  
  
app = Flask(__name__)  
  
## MySQL所在的主机名  
HOSTNAME = "127.0.0.1"  
## MySQL监听的端口号，默认3306  
PORT = 3306  
## 连接MySQL的用户名  
USERNAME = "root"  
## 连接MySQL的密码  
PASSWORD = "123456"  
## MySQL上创建的数据库名称  
DATABASE = "database_learn"  
## 如果驱动程序是mysqlclient，那么以下前缀就是：mysql+mysqldb  
  
## 如果驱动程序是pymysql，那么以下前缀就是：mysql+pymysql  
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqldb://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}?charset=utf8mb4"  
  
db = SQLAlchemy(app)  
  
with app.app_context():  
    # 测试是否连接成功  
    with db.engine.connect() as conn:  
        rs = conn.execute(text("select 1"))  
        print(rs.fetchone())
```

由于上述代码中，我们使用到了一个数据库名：`database_learn`，所以必须要先在mysql服务器上创建一个名为`database_learn`的数据库，否则会报错。

<img src="https://cdn.nlark.com/yuque/0/2025/png/45935310/1760008213159-1760543a-268c-4c8c-8b84-5918726c8a95.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_12%2Ctext_55-l5LqG5Lyg6K--%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10" width="285.3333333333333" title="" crop="0,0,1,1" id="u46e156cf" class="ne-image">

如果以上代码执行后没有报错，那么说明是能够正常连接成功了。

### 第二节：ORM模型

#### 一、ORM介绍

ORM（Object Relationship Mapping），对象关系映射，是一种可以用Python面向对象的方式来操作关系型数据库的技术。具有可以映射到数据库表能力的Python类我们称之为ORM模型，一个ORM模型与数据库中一个表相对应，ORM模型中的每个类属性分别对应表的每个字段，ORM模型的每个实例对象对应表中每条记录。ORM技术提供了面向对象与SQL交互的桥梁，让开发者用面向对象的方式操作数据库，使用ORM模型具有以下优势。

+ 开发效率高：几乎不需要写原生SQL语句，使用纯Python的方式操作数据库，大大的提高了开发效率。
+ 安全性高：ORM模型底层代码对一些常见的安全问题，比如SQL注入做了防护，比直接使用SQL语句更加安全。
+ 灵活性强：Flask-SQLAlchemy底层支持SQLite、MySQL、Oracle、PostgreSQL等关系型数据库，但针对不同的数据库，ORM模型代码几乎一模一样，只需修改少量代码，即可完成底层数据库的更换。

#### 二、定义ORM模型

以下我们用Flask-SQLAlchemy来创建一个User模型，示例代码如下。

```python
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from sqlalchemy import MetaData

## 定义命名约定的Base类
class Base(DeclarativeBase):
    metadata = MetaData(naming_convention={
        # ix: index，索引。
        "ix": 'ix_%(column_0_label)s',
        # un：unique，唯一约束
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        # ck：Check，检查约束
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        # fk：Foreign Key，外键约束
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        # pk：Primary Key，主键约束
        "pk": "pk_%(table_name)s"
    })

db = SQLAlchemy(app=app, model_class=Base)

class User(db.Model):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(db.Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(db.String(50), nullable=False)
    password: Mapped[str] = mapped_column(db.String(200))

with app.app_context():
    db.create_all()
```

上述代码中，字典`naming_convention`是一个固定的写法，主要是用来给表约束做一些命名约定的，使得后期alembic在生成迁移脚本时，生成的约束名不是随机的，而是有命名规范的。

在`User`模型中，我们使用`Mapped[类型名]`语法来让开发者和IDE识别该属性的类型，为开发提供便捷性；另外，凡是使用了`mapped_column`创建的属性都将被映射到表中成为字段，并且该字段有什么配置，都可以在`mapped_column`中添加相关参数，比如字段类型（`db.Integer`）、是否可以为空（`nullable`）、是否为主键（`primary_key=True`）、是否自增（`autoincrement=True`）等。

之后，我们调用`db.create_all()`方法，就会将该模型迁移到数据库中生成一张表，这种方式在字段发生改变时无法自动同步到数据库中，所以仅作为一种临时解决方案，后续会使用`flask-migrate`来实现迁移。

#### 三、常用属性和参数

上述`User`模型中，我们使用了`db.Integer`和`db.String`，除了这两种数据类型外，还有以下数据类型：

| 类型 | 描述 |
| --- | --- |
| Integer | 整形。范围与数据库一致。 |
| SmallInteger | 小整形。范围与数据库一致。 |
| BigInteger | 长整形。范围与数据库一致。 |
| Decimal | 定点类型。可以指定总长度和小数点后位数。 |
| Boolean | 布尔类型。 |
| Date | 日期类型。存储Python中的datetime.date对象。 |
| DateTime | 日期时间类型。存储Python中的datetime.datetime对象。 |
| Time | 时间类型。存储Python中的datetime.time对象。 |
| Interval | 时间间隔。存储Python中的datetime.timedelay对象。 |
| String | 字符串类型。使用时需要指定长度。 |
| Text | 文本类型。常用于字符串长度不可控的情况。 |
| Enum | 枚举类型。 |
| PickleType | 存储经过Pickle后的对象。 |
| LargeBinary | 存储二进制数据。 |
| JSON | 存储JSON类型的数据。 |

还有很多其他的数据类型，读者可以在PyCharm中导入`from sqlalchemy import String`，然后按`Ctrl+鼠标左键`进入项目源代码中查看到更多的类型。

另外，`mapped_column`方法有以下常用参数：

| 参数 | 描述 |
| --- | --- |
| name | 字段在数据库表中的名称。如果没有设置，则使用此属性名作为字段名称。 |
| type_ | 字段类型。 |
| autoincrement | 自动增长。 |
| default | 默认值。 |
| index | 如果设置为True，则将此字段设置为索引。 |
| nullable | 是否为空。 |
| onupdate | 在修改对象的时候，会自动使用这个属性指定的值。 |
| primary_key | 主键。 |
| unique | 如果设置为True，则此字段的值必须唯一。 |
| comment | 在创建表时的注释。 |

### 第三节：模型迁移

#### 一、Flask-Migrate介绍

到目前为止，我们定义好模型后，是通过`db.create_all()`的形式将ORM模型映射到数据库中的，这种方式非常局限，他只能识别到新增了模型后映射到数据库中，对于模型中字段的修改，类型的修改，他无法识别到。因此在实际开发中，都不会使用`db.create_all`来做ORM模型迁移，而是借助到一个第三方插件`Flask-Migrate`来实现。`Flask-Migrate`是基于`alembic`实现的，`alembic`是专门用来做给`SQLAlchemy`的ORM模型做迁移的。要使用`Flask-Migrate`，我们首先需要通过pip安装。

```bash
$ pip install flask-migrate==4.1.0
```

alembic会随着flask-migrate安装而安装。在完成flask-migrate安装后，来讲解一下如何做好配置。

#### 二、创建迁移对象

使用Flask-Migrate实现模型迁移，需要通过类`Migrate`来实现。示例代码如下：

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
...
db = SQLAlchemy(app)
migrate = Migrate(app, db)
```

上述代码中，我们使用了`flask_migrate`中的`Migrate`类，使用该类创建对象时传入了`app`和`db`对象。

#### 三、初始化迁移环境

在创建完迁移对象后，我们需要初始化一下迁移环境。方法是在当前项目的根路径下，执行命令：

```bash
$ flask db init
```

执行完成后，会在项目的根路径下生成一个migrations文件夹，在这个文件夹下有以下文件：

+ `versions`：文件夹，用于存放后面生成的迁移脚本文件。目前没有生成过任何迁移脚本，因此是一个空的文件夹。
+ `alembic.ini`：alembic的配置文件。
+ `env.py`：配合flask项目进行迁移的Python文件。
+ `script.py.mako`：生成迁移脚本的模板文件。

以上4个文件或文件夹，除非你知道自己在做什么，否则强烈建议不要自行修改里面的内容。到目前为止，我们的初始化迁移环境的工作就已经完成。此工作只需做一次，后续只要不断生成迁移脚本和映射操作即可，无需重复初始化。

#### 四、生成迁移脚本

在初始化完迁移环境的前提下，无论是新增了ORM模型，或者是ORM模型中有任何字段信息发生改变，并且想要将这些改变同步到数据库中，那么要做的一件事情就是将当前的修改，生成一个迁移脚本，生成迁移脚本命令如下：

```bash
$ flask db migrate -m "备注信息"
```

以上命令中-m参数后面跟的是备注信息，通过添加备注信息，方便以后查看当前迁移脚本做了哪些事情。当然备注信息不是强制的，如果不想添加，则把-m参数以及后面的内容都删掉即可。笔者强烈建议添加备注信息，特别是多人合作的时候，添加备注信息能让工作更加透明。在执行完以上命令后，可以看到versions文件夹中新增了一个python脚本文件，这个脚本文件中记录了此次修改的变更内容。

#### 五、执行迁移脚本

第4步执行完后，会生成迁移脚本，接下来我们还需要执行迁移脚本，才能把这些改变真正同步到数据库中。执行迁移脚本的命令如下：

```bash
$ flask db upgrade
```

上命令会自动从versions文件夹中寻找最新的迁移脚本文件，然后执行迁移脚本文件中的upgrade函数。在这步工作完成后，我们模型的修改就能真正映射到数据库中了。

#### 六、总结

模型迁移三部曲：

```bash
## 1. 初始化迁移仓库，只要做一次
$ flask db init
## 2. 将模型的改变，生成迁移脚本
$ flask db migrate -m "备注信息"
## 3. 执行迁移脚本，将改变同步到数据库中
$ flask db upgrade
```

### 第四节：CRUD操作

CRUD（Create、Read、Update、Delete）操作是数据库操作的基本功能。下面分别解释在Flask-SQLAlchemy中每个功能的实现。

#### 一、Create

用ORM创建一条数据非常简单，先使用ORM模型创建一个对象，然后添加到会话中，再进行commit操作即可，示例代码如下。

```python
@app.route('/user/add')
def user_add():
    user1 = User(username="张三",password="111111")
    user2 = User(username="李四",password="222222")
    user3 = User(username="王五",password="333333")
    db.session.add(user1)
    db.session.add(user2)
    db.session.add(user3)
    db.session.commit()
    return "用户添加成功！"
```

`user`对象创建好了后，要使用`db.session.add`添加到会话中，然后再执行`db.session.commit`提交会话，才会把数据同步到数据库中。

#### 二、Read

查询数据示例代码如下：

```python
@app.route('/user/read')
def user_read():
    # 1. 获取User中所有数据
    # users = db.session.execute(db.select(User)).scalars().all()
    # 或
    users = db.session.scalars(db.select(User)).all()
    print(users)
    # 2. 获取主键为1的User对象
    # 这里使用了一个快捷方式，就是直接调用scalar，不用先调用execute再调用scalar
    user = db.session.scalar(db.select(User).filter_by(id=1))
    print(user)
    # 3. 根据username排序
    users = db.session.scalars(db.select(User).order_by(User.username)).all()
    print(users)
    return "数据提取成功！"
```

#### 三、Update

修改数据示例代码如下：

```python
@app.route("/user/update")
def user_update():
    # 1. 查找出来再修改
    user = db.session.scalar(db.select(User).where(User.username=="张三"))
    user.username = "张三111"
    # 同步到数据库中
    db.session.commit()
    # 2. 直接修改
    db.session.execute(db.update(User).where(User.username=="张三").values(username="张三222"))
    db.session.commit()
    return "数据修改成功！"
```

修改完数据后记得进行`db.session.commit()`操作。

#### 四、Delete

删除数据示例代码如下：

```python
@app.route("/user/delete")
def user_delete():
    # 1. 查找出来再删除
    user = db.session.scalar(db.select(User).where(User.username == "张三"))
    db.session.delete(user)
    # 同步到数据库中
    db.session.commit()
    # 2. 直接删除
    db.session.execute(db.delete(User).where(User.username=='李四'))
    db.session.commit()
    return "数据删除成功！"
```

### 第五节：表关系

关系型数据库一个强大的功能，就是多个表之间可以建立关系。比如文章表中，通常需要保存作者数据，但是我们不需要直接把作者数据放到文章表中，而是通过外键引用用户表。这种强大的表关系，可以存储非常复杂的数据，并且可以让查询非常迅速。在Flask-SQLAlchemy中，同样也支持表关系的建立。表关系建立的前提，是通过数据库层面的外键实现的。表关系总体来讲可以分为三种，分别是：一对多（多对一）、一对一、多对多。以下分别进行讲解。

#### 一、外键

外键是数据库层面的技术，在`SQLAlchemy`中，可以通过`ForeignKey`来实现外键。示例代码如下：

```python
class User(db.Model):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100))
    department_id: Mapped[int] = mapped_column(Integer, ForeignKey("department.id"))

class Department(db.Model):
    __tablename__ = "department"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
```

上述代码中，`User`模型中有一个`department_id`字段，引用的是`Department`模型中的`id`字段。由于`department.id`字段类型为`int`，所以在`User`模型中的`department_id`字段类型也必须是整形。

#### 二、一对多

通过外键，我们就可以创建一对多或多对一的关系映射了。上述代码中，我们规定一个用户只能属于一个部门，那么`Department`和`User`和就是一对多的关系了，其中`Department`是一、`User`就是多。

上述代码中，如果我们在查找数据的时，想要获取用户属于哪个部门，那么要通过`department_id`在`department`表中查找，而`ORM`就是把表和数据当做类和对象一样使用，可以简化这个流程，在`SQLAlchemy`中，我们可以通过添加`relationship`属性，来实现这个目标。示例代码如下：

```python
from exts import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Integer, ForeignKey
from typing import List

class User(db.Model):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100))
    department_id: Mapped[int] = mapped_column(Integer, ForeignKey("department.id"))
    department: Mapped["Department"] = relationship(back_populates="users")

class Department(db.Model):
    __tablename__ = "department"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    users: Mapped[List["User"]] = relationship(back_populates="department")
```

上述代码中，我们针对`department_id`创建了一个属性`department`（这个属性是ORM层面的属性，并不会在数据库中生成字段）。它引用的是`Department`类对象，以后我们通过类似以下代码：

```python
user = db.session.scalar(db.select(User).filter_by(id=1))
department = user.department
```

来访问用户所属的部门数据时，`SQLAlchemy`会自动根据`user.department_id`从`department`表中查找`id=department_id`的部门数据，并将查找到的数据初始化成`Department`对象，赋值给`user.department`属性。

另外，我们也可以看到在`relationship`中还定义了一个属性`back_populates`，这个属性是用来标记对方在访问本类的对象时，用的什么属性。

一对多的使用示例代码如下：

```python
@app.route("/one2many")
def one2many():
    # 1. 通过User添加department
    department = Department(name="技术部")
    user = User(username="张三", department=department)
    db.session.add(user)
    db.session.commit()
    # 2. 通过department添加user
    department = db.session.scalar(db.select(Department).where(Department.id==1))
    user = User(username="李四")
    department.users.append(user)
    db.session.commit()
    # 3. 通过user访问department
    user = db.session.scalar(db.select(User).where(User.id==1))
    department = user.department
    print(department.name)
    # 4. 通过department获取所有当前部门下的用户
    department = db.session.scalar(db.select(Department).where(Department.id == 1))
    users = department.users
    for user in users:
        print(user.username)
    return "success"
```

#### 三、多对多

假设现在我们有一个权限表，和部门之间的关系是多对多，也就是一个部门有多个权限，一个权限能被多个部门所拥有，多对多的关系通常需要借助一个中间表来实现。多对多示例代码如下：

```python
department_permission_table = Table(
    "department_permission",
    db.metadata,
    Column("department_id", Integer, ForeignKey("department.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permission.id"), primary_key=True)
)

class Department(db.Model):
    __tablename__ = "department"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    users: Mapped[List["User"]] = relationship(back_populates="department")
    permissions: Mapped[List["Permission"]] = relationship(
        secondary=department_permission_table,
        back_populates="departments"
    )

class Permission(db.Model):
    __tablename__ = "permission"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    departments: Mapped[List["Department"]] = relationship(
        secondary=department_permission_table,
        back_populates="permissions"
    )
```

多对多需要用到一个中间表来存储两者之间的关联关系。上述代码中，我们创建了一个`department_permission_table`中间表来存储两者之间的关系，并创建了`department_id`作为`department.id`的外键，创建了`permission_id`作为`permission.id`的外键，并使用他们两者作为主键（也就是不同出现两条`permission_id`和`department_id`都相同的数据）。

然后在`Deparment`和`Permission`表中分别添加了两个新的属性，分别是`Department.permissions`和`Permission.departments`，这两个属性是用`relationship`创建的，并且指定了`secondary`参数为中间表`department_permission_table`，这样`SQLAlchemy`就会自动绑定两者之间的关系。

多对多关系的使用代码示例如下：

```python
@app.route("/many2many")
def many2many():
    # 1. 通过department添加permission
    department = db.session.scalar(db.select(Department).where(Department.id==1))
    permissions = [
        Permission(name="访问首页"),
        Permission(name="访问用户")
    ]
    department.permissions.append(permissions[0])
    department.permissions.append(permissions[1])
    # 或用以下代码：
    # department.permissions.extend(permissions)
    db.session.commit()
    # 2. 移除多对多关系的数据
    deparment = db.session.scalar(db.select(Department).where(Department.id==1))
    permission = db.session.scalar(db.select(Permission).where(Permission.name=="访问首页"))
    deparment.permissions.remove(permission)
    db.session.commit()
    return "success"
```

#### 四、一对一

假设现在我们要存储用户的一些额外信息，比如生日，毕业院校，但是这些数据又不是常用的，这时候就可以创建一个`UserExtension`表，用来存储用户的一些不常用的冗余信息，那么`User`和`UserExtension`之间就是一对一的关系，也就是一个`User`只能有一个`Extension`，一个`UserExtension`只能被一个`User`所使用。`User`和`UserExtension`之间的一对一关系模型定义如下：

```python
class User(db.Model):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(100))
    department_id: Mapped[int] = mapped_column(Integer, ForeignKey("department.id"))
    department: Mapped["Department"] = relationship(back_populates="users")
    user_extension: Mapped["UserExtension"] = relationship(back_populates="user", uselist=False)

class UserExtension(db.Model):
    __tablename__ = "user_extension"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    birthday: Mapped[date] = mapped_column(Date, nullable=True)
    university: Mapped[str] = mapped_column(String(100), nullable=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"), unique=True)
    user: Mapped["User"] = relationship(back_populates="user_extension")
```

上述代码中，与一对多关系对比，有几点发生了修改：

+ `User`模型中的`user_extension`约束的类型为`UserExtension`，所以`SQLAlchemy`在处理类似`user.user_extension`时，会返回一个`UserExtension`对象，而不是一个`UserExtension`的列表，这样就确保了一对一的关系。另外在定义`user_extension`的`relationship`时，还显示的传入了一个`uselist=False`参数，更进一步约束了`user_extension`是一个对象，而不是一个列表。
+ 在`UserExtension`模型中，设置了`user_id`字段的`unique=True`，也就是`user_id`在`UserExtension`中只能是唯一，也保证了一对一的关系。

一对一的使用相关代码如下：

```python
@app.route("/one2one")
def one2one():
    user = db.session.scalar(db.select(User).where(User.id==1))
    user.extension = UserExtension(birthday=date(year=2021, month=1, day=1))
    db.session.commit()
    return "success"
```

---

## 第四章：其他

### 第一节：Cookie和Session

#### 一、为什么需要Cookie和Session

cookie和session是web开发中经常被使用到的技术，因为HTTP请求是无状态的，也就是说每次请求间是相互独立的，比如第一次请求成功后，第二次请求服务器依然不知道是谁发起的。而cookie和session就是为了解决这个问题而出现的。

#### 二、Cookie

cookie的出现，就是为了解决HTTP请求无状态的问题的。如果想要识别用户，可以在用户第一次请求后，服务器生成一段能识别用户的数据，存放到cookie中，然后返回给浏览器，浏览器会自动存储cookie数据。当该用户对同一网站发送第二次请求的时候，浏览器会自动的把上次请求获取的cookie发送给服务器，服务器通过浏览器发送的cookie就能知道是哪个用户了。cookie存储的数据量有限，不同的浏览器有不同的存储大小，但一般不超过4KB，因此cookie只适合存储一些小量的数据。

#### 三、Session

session和cookie的作用类似，都是为了存储用户相关信息的。不同的是，cookie是存储在浏览器中的，而session是一个概念，一个服务器存储授权信息的解决方案，不同的服务器，不同的框架，不同的编程语言都有不同的实现。web开发发展至今，session的使用已经有非常成熟的解决方案了。在如今的市场环境中，一般session的存储有以下两种方式。

（1）存储在服务端：服务器在存储session的时候，先生成一个session_id，然后把session_id和具体的session数据进行关联存储在服务端，比如数据库，或者是缓存中（比如memcached、redis）。接着把session_id存放到cookie中返回给浏览器，下次用户再次访问的时候，因为cookie是会自动携带上来的，所以服务器可以从cookie中获取session_id，然后再从数据库或者缓存中获取具体的session数据。把session存储在服务器好处是更加安全，不容易被窃取，坏处是会占用服务器资源，但是现在硬件条件已经非常先进了，存储一些session信息还是绰绰有余的。

（2）存储在客户端：在存储session的时候，先将session进行加密，然后直接存储在cookie中返回给浏览器，下次用户再访问的时候，则从cookie中获取session数据。flask默认就是采用这种方式，当然也可以替换为服务端的形式。

#### 四、Flask中使用Session

Flask中操作session，是通过全局对象flask.session来实现的，flask.session是一个类字典形式，因此对session做增删改查操作，都可以使用字典相关的方法，示例代码如下：

```python
from flask import session

## 设置session
@app.route('/')
def index():
    session["username"] = "the username"
    ...

## 获取session
@app.route('/')
def user():
    username = session['username']
    ...
```

使用session的前提是，需要在`app.config`中配置好`SECRET_KEY`。

### 第二节：钩子函数

钩子函数，是从收到请求到响应整个链条中可以进行拦截的函数，钩子函数都是通过装饰器来注册的。这里我们介绍两个常用的钩子函数。

#### 一、before_request

在每次收到请求之前会执行的代码，示例代码如下。

```python
@app.before_request
def before_request():
    if not hasattr(g,'user'):
        setattr(g,'user','xxxx')
```

#### 二、context_processor

上下文处理器，在每次渲染模板的时候，会把这个钩子函数中返回的数据添加到模板中，示例代码如下。

```python
@app.context_processor
def context_processor():
    return {'current_user':'xxx'}
```

这样在所有模板中都可以使用`current_user`这个属性了。
