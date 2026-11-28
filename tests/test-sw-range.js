// My Deen Fix #61 — service-worker audio-bypass test (Node).
// Loads the real www/sw.js with stubbed ServiceWorker globals, captures
// the fetch handler, and asserts media requests are NEVER intercepted:
// the worker returns early with NO respondWith, so audio goes direct to
// Capacitor's local asset server (native Range support). Fix #60's
// Range/206 answer did NOT fix the preview on the phone (53 s of
// silence, not even the 17 KB reminder tone), so the worker is out of
// the audio path entirely. Also asserts the non-audio branches are
// unchanged (app shell cache-first, API network-first) and no audio
// entry sits in the shell cache list.
const fs = require("fs");

let passed = 0, failed = 0;
function check(name, ok, info) {
  if (ok) { passed++; console.log("PASS:", name); }
  else { failed++; console.log("FAIL:", name, "—", info === undefined ? "" : info); }
}

/* --- minimal ServiceWorker-global stubs (no Node fetch stack used) --- */
class H {
  constructor(init) { this.m = new Map(); for (const [k, v] of Object.entries(init || {})) this.m.set(String(k).toLowerCase(), v); }
  get(k) { const v = this.m.get(String(k).toLowerCase()); return v === undefined ? null : v; }
  set(k, v) { this.m.set(String(k).toLowerCase(), v); }
}
class R {
  constructor(body, init) {
    this._body = body; this.status = (init && init.status) || 200;
    this.headers = new H((init && init.headers) || {});
  }
  async arrayBuffer() {
    if (this._body === null || this._body === undefined) return new ArrayBuffer(0);
    if (this._body instanceof ArrayBuffer) return this._body;
    if (typeof this._body === "string") return new TextEncoder().encode(this._body).buffer;
    if (this._body instanceof Uint8Array) return this._body.buffer.slice(this._body.byteOffset, this._body.byteOffset + this._body.byteLength);
    return new ArrayBuffer(0);
  }
  clone() { return new R(this._body, { status: this.status, headers: Object.fromEntries(this.headers.m) }); }
}
const handlers = {};
globalThis.self = {
  addEventListener(type, fn) { (handlers[type] = handlers[type] || []).push(fn); },
  skipWaiting() {}, clients: { claim() {} }
};
globalThis.location = { origin: "https://localhost" };
globalThis.Response = R;
globalThis.Headers = H;
// Cache Storage stub: the shell cache holds app.js only.
const cacheStore = new Map([["https://localhost/app.js",
  new R("/* app */", { status: 200, headers: { "Content-Type": "application/javascript" } })]]);
const cacheApi = {
  match(req) { return Promise.resolve(cacheStore.get(typeof req === "string" ? req : req.url) || undefined); },
  put(req, res) { cacheStore.set(typeof req === "string" ? req : req.url, res); return Promise.resolve(); },
  addAll() { return Promise.resolve(); }
};
globalThis.caches = { open() { return Promise.resolve(cacheApi); }, match(req) { return cacheApi.match(req); }, keys() { return Promise.resolve([]); }, delete() { return Promise.resolve(true); } };
let fetchCalls = 0;
globalThis.fetch = async () => { fetchCalls++; return new R("net", { status: 200 }); };

const swSrc = fs.readFileSync("/home/hatch/workspace/deen-day/www/sw.js", "utf8");
eval(swSrc);

function fireFetch(url, range) {
  const ev = {
    request: {
      url, method: "GET",
      headers: new H(range ? { range } : {})
    },
    respondWith(p) { this._p = p; }
  };
  handlers.fetch[0](ev);
  return ev._p; // undefined when the worker did not intercept
}

(async () => {
  // 1. Audio URL, with a Range header (the old failure: the worker
  // answered 200 + full file) → NO respondWith at all.
  check("Audio /audio/azan.mp3 WITH Range is not intercepted (no respondWith)",
    fireFetch("https://localhost/audio/azan.mp3", "bytes=0-1023") === undefined, "respondWith called");
  // 2. Audio URL, no Range → still not intercepted.
  check("Audio /audio/azan.mp3 without Range is not intercepted",
    fireFetch("https://localhost/audio/azan.mp3", null) === undefined, "respondWith called");
  // 3. The reminder tone too (17 KB — the video had no tone either, so
  // the shared path, not the file size, is the suspect).
  check("Audio /audio/reminder.mp3 is not intercepted",
    fireFetch("https://localhost/audio/reminder.mp3", null) === undefined, "respondWith called");
  // 4. A bare .mp3 path outside /audio/ (the backstop) → not intercepted.
  check("Bare .mp3 URL is not intercepted (backstop)",
    fireFetch("https://localhost/sounds/durood.mp3", "bytes=0-99") === undefined, "respondWith called");
  // 5. App shell still cache-first: app.js gets a respondWith that
  // resolves to the cached 200.
  const r5 = await fireFetch("https://localhost/app.js", null);
  check("App shell app.js is still intercepted (cache-first)",
    r5 !== undefined && r5.status === 200, "no respondWith or wrong status");
  // 6. API still network-first with cache fallback.
  fetchCalls = 0;
  const r6 = await fireFetch("https://api.aladhan.com/v1/timings", null);
  check("API aladhan.com is still intercepted (network-first)",
    r6 !== undefined && fetchCalls === 1, "no respondWith or fetchCalls=" + fetchCalls);
  // 7. Static checks: no rangeResponse anywhere, no audio in SHELL.
  check("No rangeResponse function remains in sw.js",
    !swSrc.includes("function rangeResponse"), "rangeResponse present");
  const shell = swSrc.slice(swSrc.indexOf("const SHELL"), swSrc.indexOf("];", swSrc.indexOf("const SHELL")));
  check("No audio entry in the SHELL cache list",
    !shell.includes("audio"), "audio in SHELL");
  console.log(`\ntest-sw-range: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
