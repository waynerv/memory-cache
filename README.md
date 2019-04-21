# MemoryCache

一个基于Flask、MySQL和Bootstrap开发的图片分享社交网站。

## 特性

- 实现了feed流、图片管理、收藏关注、消息提醒、热门推荐、用户资料管理等基础社交功能
- 实现了完整的用户注册流程与基于角色的权限控制
- 提供用户管理、资源管理、用户资料编辑等后台功能
- 使用SQLAlchemy作为ORM实现关注、收藏、标签等多对多关系和联结分组查询
- 通过AJAX实现动态获取用户资料并执行异步交互
- 使用Dropzone.js、Pillow实现图片文件的上传与尺寸处理
- 使用Whooshee实现全文搜索
- 支持 Docker + Nginx + Gunicorn + MySQL 快速部署

## 预览

首页

！[index](http://pp0zvba2e.bkt.clouddn.com/2019-04-21%2023-31-12%20%E7%9A%84%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE.png)

图片详情页

！[photo](http://pp0zvba2e.bkt.clouddn.com/2019-04-21%2023-31-22%20%E7%9A%84%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE.png)

个人主页

![user](http://pp0zvba2e.bkt.clouddn.com/2019-04-21%2023-31-30%20%E7%9A%84%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE.png)

管理后台

![dashboard](http://pp0zvba2e.bkt.clouddn.com/2019-04-21%2023-34-37%20%E7%9A%84%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE.png)

## 运行

### 从源码运行

1. 安装 MySQL 并按‘mysql'文件夹中的sql脚本创建数据库。
2. 切换到项目根目录下的 `app` 文件夹。
3. 创建虚拟环境并根据 `Pipfile` 或 `requirements.txt` 安装依赖（推荐使用 Pipenv）。
4. （可选）在当前目录创建 `.env` 配置文件，根据 `./memory_cache/settings.py` 文件中的配置项修改应用配置。
5. 在虚拟环境下，运行 `flask run` 命令以调试模式启动应用。

开发环境下可使用 `flask forge` 命令生成测试数据（含管理员账户），`flask dropdb` 命令清空数据库。

### 通过 Docker 运行（推荐）

推荐使用 Docker 运行项目，仓库中还包含了 MySQL、Nginx 和 Gunicorn 在部署环境下的配置文件，通过 Docker 可以做到自动化快速部署。

使用前请确保已经正确安装 docker 与 docker-compose 。（建议配置国内的加速镜像源）

#### 首次运行

**1\. 获取 MemoryCache 镜像**

在命令行中切换到项目根目录，运行以下命令构建 MemoryCache 镜像：

```bash
$ (sudo) docker build app/ -t memorycache:0.1 
# 该命令将根据 app/ 文件夹下的 Dockerfile 构建镜像
```

默认的 Gunicorn 运行参数可在 Dockerfile 中修改，然后重新构建镜像。

**2\. 修改编排容器的配置文件（可跳过）**

a. 修改 `docker-compose.yml`

切换到项目根目录下的 `compose` 文件夹。出于安全考虑，你需要对 `docker-compose.yml` 文件中的环境变量进行适当修改（开发环境可跳过以下步骤），以下是修改项：

- `MYSQL_ROOT_PASSWORD: my-secret-pw`: MySQL的root用户密码
- `MYSQL_DATABASE: memorycache`: 为该数据库创建指定用户并授予ALL权限
- `MYSQL_USER: waynerv`: 创建用户的用户名
- `MYSQL_PASSWORD: example`: 创建用户的密码

b. 修改 Nginx 配置

部署环境下还需要修改项目根目录下 `nginx/project.conf` 文件，对 Nginx 的转发配置进行修改，如：

```bash
server_name localhost;
# localhost 改成映射的域名
```

**3\. 运行容器**

切换到根目录下的 `compose` 文件夹，运行以下命令：

```bash
$ (sudo) docker-compose up -d
```

容器首次启动需要30秒左右，然后你就可以在浏览器中通过 `http://localhost:80` 或映射的域名访问MemoryCache 了。

**4. 进入 MemoryCache 容器**

如果你想进入 MemoryCache 应用容器的内部，可执行以下命令:

```bash
$ (sudo) docker exec -it blog ash
# orginblog 运行在alpine(一个极简Linux)环境中,ash=alpine shell
```

#### 首次运行后

- 关闭 MemoryCache

```bash
$ (sudo) docker-compose stop
```

- 启动 MemoryCache

```bash
$ (sudo) docker-compose start
```

- 删除 MemoryCache

```bash
$ (sudo) docker-compose down
```

`docker-compose` 命令应在切换到根目录下 `compose/` 文件夹中时执行。

容器运行时产生的数据包括数据库文件可通过 `docker volume` 进行删除、备份等操作。

### 使用 MemoryCache

#### 1\. 创建管理员账户

以 `ORIGINBLOG_ADMIN_EMAIL` 环境参数值为邮箱注册的用户将成为管理员。

开发环境下可使用 `Role` 模型的 `init` 方法重置角色权限。

#### 2\. 进入管理后台

登录后通过首页右上角 `USER` 下拉菜单的 `Dashboard` 进入管理后台。

## 许可证

MIT
