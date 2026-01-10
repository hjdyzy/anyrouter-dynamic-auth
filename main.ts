const UPSTREAM = 'https://anyrouter.top';

// 缓存配置 - 通过环境变量控制
const CACHE_ENABLED = Deno.env.get('CACHE_ENABLED') !== 'false'; // 默认开启
const CACHE_TTL_MS = parseInt(Deno.env.get('CACHE_TTL_MINUTES') || '30') * 60 * 1000; // 默认30分钟

// 全局唯一 Cookie 缓存
let cachedCookie: string | null = null;
let cacheExpireAt = 0;

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // 首页跳转到 linux.do
  if (url.pathname === '/') {
    return new Response(null, {
      status: 302,
      headers: { Location: 'https://linux.do' },
    });
  }

  // 缓存状态端点
  if (url.pathname === '/cache-status') {
    const remaining = Math.max(0, cacheExpireAt - Date.now());
    return Response.json({
      enabled: CACHE_ENABLED,
      ttlMinutes: CACHE_TTL_MS / 60000,
      cookie: cachedCookie,
      expireAt: cacheExpireAt ? new Date(cacheExpireAt).toISOString() : null,
      ttlRemaining: cacheExpireAt ? `${Math.floor(remaining / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s` : null,
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
  const url = new URL(req.url);
  const targetUrl = new URL(url.pathname + url.search, UPSTREAM);

  const { cookie, error } = await getDynamicCookie(targetUrl);
  if (!cookie) {
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
    return { cookie: cachedCookie, error: null };
  }

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

    // 存入缓存
    if (CACHE_ENABLED && cookie) {
      cachedCookie = cookie;
      cacheExpireAt = Date.now() + CACHE_TTL_MS;
    }

    return { cookie, error };
  } catch (err) {
    return { cookie: null, error: String(err) };
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
