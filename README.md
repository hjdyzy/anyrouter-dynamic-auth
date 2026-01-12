# Anyrouter Dynamic Auth

Anyrouter 动态 Cookie 代理服务，用于自动处理 `acw_sc__v2` 挑战。

## 功能特性

- 自动解析和执行 anyrouter.top 的 JS 挑战脚本
- Cookie 缓存机制，减少重复请求（默认 30 分钟）
- 调试页面方便测试和查看服务状态
- Docker 容器化部署

## Docker 自部署

### 方式一：从源码构建

```bash
git clone https://github.com/hjdyzy/anyrouter-dynamic-auth.git
cd anyrouter-dynamic-auth
docker build -t anyrouter-dynamic-auth .
docker run -d \
  --name anyrouter-dynamic-auth \
  -p 28000:8000 \
  anyrouter-dynamic-auth
```

或使用 docker 容器克隆：

```bash
docker run --rm -v /opt:/workspace alpine/git clone https://github.com/hjdyzy/anyrouter-dynamic-auth.git /workspace/anyrouter-dynamic-auth
cd /opt/anyrouter-dynamic-auth
docker build -t anyrouter-dynamic-auth .
docker run -d \
  --name anyrouter-dynamic-auth \
  -p 28000:8000 \
  anyrouter-dynamic-auth
```

### 方式二：使用预构建镜像

```bash
docker run -d \
  --name anyrouter-dynamic-auth \
  -p 28000:8000 \
  registry.cn-guangzhou.aliyuncs.com/hjdyzy/anyrouter-dynamic-auth:latest
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `CACHE_ENABLED` | 是否启用 Cookie 缓存 | `true` |
| `CACHE_TTL_MINUTES` | Cookie 缓存过期时间（分钟） | `30` |
| `HTTP_PROXY` | HTTP 代理地址 | - |
| `HTTPS_PROXY` | HTTPS 代理地址 | - |

### 配置代理

如果需要通过代理访问上游服务，可以在启动时设置代理环境变量：

```bash
# HTTP 代理
docker run -d \
  --name anyrouter-dynamic-auth \
  -p 28000:8000 \
  -e HTTP_PROXY=http://your-proxy:port \
  -e HTTPS_PROXY=http://your-proxy:port \
  registry.cn-guangzhou.aliyuncs.com/hjdyzy/anyrouter-dynamic-auth:latest

# SOCKS5 代理
docker run -d \
  --name anyrouter-dynamic-auth \
  -p 28000:8000 \
  -e HTTP_PROXY=socks5://your-proxy:port \
  -e HTTPS_PROXY=socks5://your-proxy:port \
  registry.cn-guangzhou.aliyuncs.com/hjdyzy/anyrouter-dynamic-auth:latest
```

## API 端点

| 端点 | 说明 |
|------|------|
| `/` | 调试页面 |
| `/debug` | 调试页面 |
| `/debug-cookie` | 获取动态 Cookie（调试用） |
| `/cache-status` | 查看缓存和服务状态（JSON） |
| `/cache-clear` | 清除缓存 |
| `/*` | 代理到 anyrouter.top |

## 使用示例

启动服务后，访问 `http://localhost:28000` 可以看到调试页面。

代理 API 请求（需要带上自己的 session cookie）：

```bash
# 不需要登录的接口
curl http://localhost:28000/api/some-public-endpoint

# 需要登录的接口，带上自己的 session cookie
curl -H "Cookie: session=your_session_value" http://localhost:28000/api/user/self
```

## 工作原理

1. anyrouter.top 使用 JS 挑战来防止自动化访问
2. 首次访问时，服务器返回一段混淆的 JS 代码
3. 本服务执行该 JS 代码，计算出 `acw_sc__v2` cookie
4. 将计算出的 cookie 附加到你的请求上，转发到上游
5. Cookie 会被缓存（默认 30 分钟），减少重复计算
