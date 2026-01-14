const UPSTREAM = 'https://anyrouter.top';

const DEBUG_HTML = `<!doctype html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Anyrouter Dynamic Auth</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      color: #e8e8e8;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .header {
      text-align: center;
      margin-bottom: 16px;
    }
    .header h1 {
      font-size: 2.75rem;
      font-weight: 700;
      background: linear-gradient(90deg, #00d4ff, #7b2cbf);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 12px;
    }
    .header p {
      color: #a0a0a0;
      font-size: 1.3rem;
    }
    .input-group {
      margin-bottom: 12px;
    }
    .input-group label {
      display: block;
      font-size: 0.8rem;
      color: #b0b0b0;
      margin-bottom: 6px;
      font-weight: 500;
    }
    .input-group input {
      width: 100%;
      padding: 10px 14px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      color: #fff;
      font-size: 0.9rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-group input:focus {
      outline: none;
      border-color: #00d4ff;
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.15);
    }
    .btn {
      width: 100%;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(90deg, #00d4ff, #7b2cbf);
      color: #fff;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
    }
    .btn-primary:active {
      transform: translateY(0);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .result {
      margin-top: 16px;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .result-header span {
      font-size: 0.8rem;
      color: #b0b0b0;
      font-weight: 500;
    }
    .status {
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
    }
    .status-waiting { background: rgba(255, 255, 255, 0.1); color: #888; }
    .status-loading { background: rgba(0, 212, 255, 0.2); color: #00d4ff; }
    .status-success { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
    .status-error { background: rgba(255, 68, 68, 0.2); color: #ff4444; }
    pre {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.75rem;
      line-height: 1.5;
      overflow-x: auto;
      color: #d4d4d4;
      max-height: 150px;
      overflow-y: auto;
    }
    .cache-info {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 12px;
    }
    .cache-item {
      background: rgba(0, 0, 0, 0.2);
      padding: 20px 18px;
      border-radius: 8px;
      text-align: center;
    }
    .cache-item .value {
      font-size: 1.6rem;
      font-weight: 700;
      color: #00d4ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cache-item .label {
      font-size: 0.9rem;
      color: #888;
      margin-top: 8px;
    }
    .btn-group {
      display: flex;
      gap: 10px;
      margin-top: 12px;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      flex: 1;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .loading::after {
      content: '';
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      margin-left: 8px;
      animation: spin 0.8s linear infinite;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Anyrouter Dynamic Auth</h1>
      <p>动态 Cookie 代理服务 - 自动处理 acw_sc__v2 挑战</p>
    </div>

    <div class="card">
      <div class="input-group">
        <label>目标 API 路径</label>
        <input type="text" id="target" value="/api/user/self" placeholder="/api/user/self" />
      </div>
      <button class="btn btn-primary" id="btn">获取动态 Cookie</button>

      <div class="result">
        <div class="result-header">
          <span>响应结果</span>
          <span class="status status-waiting" id="status">等待操作</span>
        </div>
        <pre id="out">点击按钮开始获取动态 Cookie...</pre>
      </div>
    </div>

    <div class="card">
      <div class="result-header">
        <span>服务状态</span>
        <span class="status status-waiting" id="cache-status">未知</span>
      </div>
      <div class="cache-info" id="cache-info">
        <div class="cache-item">
          <div class="value" id="cache-enabled">-</div>
          <div class="label">缓存状态</div>
        </div>
        <div class="cache-item">
          <div class="value" id="cache-ttl">-</div>
          <div class="label">TTL (分钟)</div>
        </div>
        <div class="cache-item">
          <div class="value" id="cache-remaining">-</div>
          <div class="label">剩余时间</div>
        </div>
        <div class="cache-item">
          <div class="value" id="stat-uptime">-</div>
          <div class="label">运行时间</div>
        </div>
        <div class="cache-item">
          <div class="value" id="stat-requests">-</div>
          <div class="label">总请求</div>
        </div>
        <div class="cache-item">
          <div class="value" id="stat-proxy">-</div>
          <div class="label">代理请求</div>
        </div>
        <div class="cache-item">
          <div class="value" id="stat-hit-rate">-</div>
          <div class="label">命中率</div>
        </div>
        <div class="cache-item">
          <div class="value" id="stat-errors">-</div>
          <div class="label">错误</div>
        </div>
      </div>
      <div class="btn-group">
        <button class="btn btn-secondary" id="refresh-cache">刷新状态</button>
        <button class="btn btn-secondary" id="clear-cache">清除缓存</button>
      </div>
    </div>
  </div>

  <script>
    const out = document.getElementById('out');
    const btn = document.getElementById('btn');
    const status = document.getElementById('status');
    const targetInput = document.getElementById('target');

    async function fetchCookie() {
      btn.disabled = true;
      btn.classList.add('loading');
      btn.textContent = '请求中';
      status.className = 'status status-loading';
      status.textContent = '请求中...';
      out.textContent = '正在获取动态 Cookie...';

      try {
        const target = targetInput.value || '/api/user/self';
        const res = await fetch('/debug-cookie?target=' + encodeURIComponent(target));
        const data = await res.json();
        out.textContent = JSON.stringify(data, null, 2);

        if (data.cookie) {
          status.className = 'status status-success';
          status.textContent = data.fromCache ? '成功 (缓存)' : '成功 (新获取)';
          loadCacheStatus(); // 刷新缓存状态
        } else {
          status.className = 'status status-error';
          status.textContent = '失败';
        }
      } catch (err) {
        out.textContent = 'Error: ' + err.message;
        status.className = 'status status-error';
        status.textContent = '错误';
      } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.textContent = '获取动态 Cookie';
      }
    }

    async function loadCacheStatus() {
      try {
        const res = await fetch('/cache-status');
        const data = await res.json();

        // 缓存信息
        document.getElementById('cache-enabled').textContent = data.cache.enabled ? '已启用' : '已禁用';
        document.getElementById('cache-ttl').textContent = data.cache.ttlMinutes;
        document.getElementById('cache-remaining').textContent = data.cache.ttlRemaining || '无缓存';

        // 统计信息
        document.getElementById('stat-uptime').textContent = data.stats.uptime;
        document.getElementById('stat-requests').textContent = data.stats.totalRequests;
        document.getElementById('stat-proxy').textContent = data.stats.proxyRequests;
        document.getElementById('stat-hit-rate').textContent = data.stats.hitRate;
        document.getElementById('stat-errors').textContent = data.stats.errors;

        const cacheStatus = document.getElementById('cache-status');
        if (data.cache.cookie) {
          cacheStatus.className = 'status status-success';
          cacheStatus.textContent = '已缓存';
        } else {
          cacheStatus.className = 'status status-waiting';
          cacheStatus.textContent = '无缓存';
        }
      } catch (err) {
        console.error('Failed to load cache status:', err);
      }
    }

    async function clearCache() {
      try {
        await fetch('/cache-clear');
        loadCacheStatus();
      } catch (err) {
        console.error('Failed to clear cache:', err);
      }
    }

    btn.onclick = fetchCookie;
    document.getElementById('refresh-cache').onclick = loadCacheStatus;
    document.getElementById('clear-cache').onclick = clearCache;

    loadCacheStatus();
  </script>
</body>
</html>`;

// 缓存配置 - 通过环境变量控制
const CACHE_ENABLED = Deno.env.get('CACHE_ENABLED') !== 'false'; // 默认开启
const CACHE_TTL_MS = parseInt(Deno.env.get('CACHE_TTL_MINUTES') || '30') * 60 * 1000; // 默认30分钟

// 全局唯一 Cookie 缓存
let cachedCookie: string | null = null;
let cacheExpireAt = 0;

// 统计信息
const stats = {
  startTime: Date.now(),
  totalRequests: 0,
  proxyRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  lastFetchTime: 0,
  lastFetchSuccess: false,
  errors: 0,
};

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === '/' || url.pathname === '/debug') {
    return new Response(DEBUG_HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }

  if (url.pathname === '/debug-cookie') {
    const targetPath = url.searchParams.get('target') || '/api/user/self';
    const targetUrl = new URL(targetPath, UPSTREAM);
    const { cookie, error, htmlSample } = await getDynamicCookieWithSample(targetUrl);
    return Response.json({ target: targetUrl.toString(), cookie, error, htmlSample });
  }

  // 缓存状态端点
  if (url.pathname === '/cache-status') {
    const now = Date.now();
    const remaining = Math.max(0, cacheExpireAt - now);
    const uptime = now - stats.startTime;
    const hitRate = stats.cacheHits + stats.cacheMisses > 0
      ? ((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(1)
      : '0.0';

    return Response.json({
      // 缓存信息
      cache: {
        enabled: CACHE_ENABLED,
        ttlMinutes: CACHE_TTL_MS / 60000,
        cookie: cachedCookie,
        expireAt: cacheExpireAt ? new Date(cacheExpireAt).toISOString() : null,
        ttlRemaining: cacheExpireAt && remaining > 0 ? `${Math.floor(remaining / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s` : null,
      },
      // 统计信息
      stats: {
        uptime: `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m ${Math.floor((uptime % 60000) / 1000)}s`,
        totalRequests: stats.totalRequests,
        proxyRequests: stats.proxyRequests,
        cacheHits: stats.cacheHits,
        cacheMisses: stats.cacheMisses,
        hitRate: `${hitRate}%`,
        errors: stats.errors,
        lastFetchTime: stats.lastFetchTime ? new Date(stats.lastFetchTime).toISOString() : null,
        lastFetchSuccess: stats.lastFetchSuccess,
      },
      // 配置信息
      config: {
        upstream: UPSTREAM,
        cacheEnabled: CACHE_ENABLED,
        cacheTtlMinutes: CACHE_TTL_MS / 60000,
      },
      // 服务信息
      server: {
        startTime: new Date(stats.startTime).toISOString(),
        currentTime: new Date(now).toISOString(),
        denoVersion: Deno.version.deno,
        v8Version: Deno.version.v8,
        tsVersion: Deno.version.typescript,
      },
    });
  }

  // 清除缓存端点
  if (url.pathname === '/cache-clear') {
    cachedCookie = null;
    cacheExpireAt = 0;
    return Response.json({ success: true, message: 'Cache cleared' });
  }

  return proxyWithDynamicCookie(req);
});

async function proxyWithDynamicCookie(req: Request): Promise<Response> {
  stats.totalRequests++;
  stats.proxyRequests++;

  const url = new URL(req.url);
  const targetUrl = new URL(url.pathname + url.search, UPSTREAM);

  const { cookie, error } = await getDynamicCookie(targetUrl);
  if (!cookie) {
    stats.errors++;
    return new Response(`Failed to obtain dynamic cookie: ${error || 'unknown error'}`, { status: 502 });
  }

  const headers = new Headers(req.headers);
  const existingCookie = req.headers.get('cookie');
  headers.set('cookie', [cookie, existingCookie].filter(Boolean).join('; '));
  headers.set('origin', UPSTREAM);
  headers.set('referer', `${UPSTREAM}/`);
  headers.set('host', new URL(UPSTREAM).host);
  headers.delete('content-length');

  const init: RequestInit = { method: req.method, headers, redirect: 'manual' };
  if (!['GET', 'HEAD'].includes(req.method)) {
    init.body = await req.arrayBuffer();
  }

  const resp = await fetch(targetUrl.toString(), init);
  return new Response(resp.body, { status: resp.status, headers: resp.headers });
}

async function getDynamicCookie(targetUrl: URL): Promise<{ cookie: string | null; error: string | null }> {
  // 检查缓存
  if (CACHE_ENABLED && cachedCookie && cacheExpireAt > Date.now()) {
    stats.cacheHits++;
    return { cookie: cachedCookie, error: null };
  }

  stats.cacheMisses++;

  try {
    const challengeResp = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'manual',
    });

    const html = await challengeResp.text();
    const { cookie, error } = extractCookieFromHtml(html);

    // 更新统计
    stats.lastFetchTime = Date.now();
    stats.lastFetchSuccess = !!cookie;

    // 存入缓存
    if (CACHE_ENABLED && cookie) {
      cachedCookie = cookie;
      cacheExpireAt = Date.now() + CACHE_TTL_MS;
    }

    return { cookie, error };
  } catch (err) {
    stats.lastFetchTime = Date.now();
    stats.lastFetchSuccess = false;
    stats.errors++;
    return { cookie: null, error: String(err) };
  }
}

// 带 htmlSample 的版本，用于 debug 端点
async function getDynamicCookieWithSample(targetUrl: URL): Promise<{ cookie: string | null; error: string | null; htmlSample?: string; fromCache?: boolean }> {
  stats.totalRequests++;

  // 检查缓存
  if (CACHE_ENABLED && cachedCookie && cacheExpireAt > Date.now()) {
    stats.cacheHits++;
    return { cookie: cachedCookie, error: null, fromCache: true };
  }

  stats.cacheMisses++;

  try {
    const challengeResp = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'manual',
    });

    const html = await challengeResp.text();
    const { cookie, error } = extractCookieFromHtml(html);

    // 更新统计
    stats.lastFetchTime = Date.now();
    stats.lastFetchSuccess = !!cookie;

    // 存入缓存
    if (CACHE_ENABLED && cookie) {
      cachedCookie = cookie;
      cacheExpireAt = Date.now() + CACHE_TTL_MS;
    }

    return { cookie, error, htmlSample: html.slice(0, 2000), fromCache: false };
  } catch (err) {
    stats.lastFetchTime = Date.now();
    stats.lastFetchSuccess = false;
    stats.errors++;
    return { cookie: null, error: String(err), fromCache: false };
  }
}

function extractCookieFromHtml(html: string): { cookie: string | null; error: string | null } {
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!scripts.length) {
    return { cookie: null, error: 'no <script> tags found' };
  }

  let lastError: string | null = null;
  for (const match of scripts) {
    const scriptContent = match[1];
    const { cookie, error } = executeScriptForCookie(scriptContent);
    if (cookie) return { cookie, error: null };
    lastError = error;
  }

  return { cookie: null, error: lastError || 'no cookie produced' };
}

function executeScriptForCookie(scriptContent: string): { cookie: string | null; error: string | null } {
  const cookieMap = new Map<string, string>();

  const document = {
    set cookie(val: string) {
      // 解析 key=value，忽略后面的 path/expires 等属性
      const mainPart = val.split(';')[0];
      const eqIndex = mainPart.indexOf('=');
      if (eqIndex > 0) {
        const key = mainPart.slice(0, eqIndex).trim();
        const value = mainPart.slice(eqIndex + 1).trim();
        cookieMap.set(key, value);
      }
    },
    get cookie() {
      return [...cookieMap.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
    },
    location: { reload() {} },
  };
  const location = document.location;

  try {
    const wrapped = `(function(){${scriptContent}\n})();`;
    eval(wrapped);
  } catch (err) {
    return { cookie: null, error: String(err) };
  }

  if (cookieMap.size > 0) {
    return { cookie: document.cookie, error: null };
  }
  return { cookie: null, error: 'script executed but did not set cookie' };
}
