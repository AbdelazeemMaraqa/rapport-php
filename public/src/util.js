// Small browser utilities: safe storage, API calls, result codes, HTML escaping, file saving.

export const local = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage blocked or full: the app keeps working in memory */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const session = {
  get(key) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
  remove(key) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}

export async function api(path, { method = 'GET', body, passcode } = {}) {
  const headers = { accept: 'application/json' };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (passcode) headers['x-admin-passcode'] = passcode;
  let res;
  try {
    res = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'network');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response, e.g. a static host's 404 page */
  }
  if (!res.ok) throw new ApiError(res.status, data?.error || 'http_' + res.status, data?.message);
  return data;
}

/**
 * What this deployment has, as config.host:
 * - 'live': the API with storage. The lead dashboard needs the passcode.
 * - 'setup': the API answers but has no storage (or is failing). The dashboard stays locked.
 * - 'unreachable': no answer at all, even after a retry. The dashboard stays locked.
 * - 'static': no API on this host (a 404 or a plain page). Local mode: nothing leaves the browser.
 */
export async function loadConfig() {
  const none = { storage: 'none', teamCodeRequired: false, adminConfigured: false };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const cfg = await api('/api/config');
      if (cfg && typeof cfg.storage === 'string') return { ...cfg, host: cfg.storage === 'none' ? 'setup' : 'live' };
      return { ...none, host: 'static' }; // a page instead of JSON: a static host's fallback
    } catch (e) {
      if (e.code !== 'network' && !e.code.startsWith('http_')) return { ...none, host: 'setup' }; // our API, answering with an error
      if (e.status === 404) return { ...none, host: 'static' };
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  return { ...none, host: 'unreachable' };
}

// Result codes: "TP1." + base64url(JSON). Used when direct sharing isn't available.
const PREFIX = 'TP1.';

function toB64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeResultCode({ name, role, lang, results, updatedAt }) {
  return PREFIX + toB64Url(JSON.stringify({ v: 1, n: name, r: role || '', l: lang, s: results, t: updatedAt }));
}

export function decodeResultCode(code) {
  const trimmed = String(code || '').trim();
  if (!trimmed.startsWith(PREFIX)) return null;
  try {
    const obj = JSON.parse(fromB64Url(trimmed.slice(PREFIX.length)));
    if (obj?.v !== 1 || typeof obj.n !== 'string' || !obj.s || typeof obj.s !== 'object') return null;
    return { name: obj.n.slice(0, 60), role: String(obj.r || '').slice(0, 60), lang: obj.l === 'en' ? 'en' : 'ar', results: obj.s, updatedAt: obj.t || new Date().toISOString() };
  } catch {
    return null;
  }
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Offer a file to the viewer. Inside claude.ai the page uses the platform's downloads capability
 * (a framed page cannot download directly); anywhere else it uses a normal download link.
 * Resolves 'saved' or 'declined'; throws on other failures.
 */
export async function saveFile(filename, data, mime) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
  if (window.claude && typeof window.claude.use === 'function') {
    let downloads = null;
    try {
      downloads = await window.claude.use('downloads');
    } catch {
      downloads = null;
    }
    if (downloads) {
      try {
        await downloads.save({ filename, data: blob });
        return 'saved';
      } catch (e) {
        if (e?.code === 'declined') return 'declined';
        throw new Error(e?.message || e?.code || 'unavailable');
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'saved';
}

export function downloadJson(filename, data) {
  return saveFile(filename, JSON.stringify(data, null, 2), 'application/json');
}

export function randomId(len = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const arr = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(arr, (n) => chars[n % chars.length]).join('');
}
