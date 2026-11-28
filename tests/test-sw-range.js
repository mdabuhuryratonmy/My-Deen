// My Deen Fix #60 — service-worker Range test (Node).
// Loads the real www/sw.js with stubbed ServiceWorker globals, captures
// the fetch handler, and asserts media Range requests get 206 Partial
// Content (the azan-button delay: the old worker answered every Range
// with the whole file as 200, so Chromium re-streamed azan.mp3 on
// every tap). Also asserts the no-Range path is unchanged (200, full).
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
// Cache Storage stub: one pre-filled cache holding a fake 10,000-byte azan.mp3.
const FAKE_TOTAL = 10000;
const fakeMp3 = new Uint8Array(FAKE_TOTAL);
for (let i = 0; i < FAKE_TOTAL; i++) fakeMp3[i] = i % 256;
const cacheStore = new Map([["https://localhost/audio/azan.mp3",
  new R(fakeMp3, { status: 200, headers: { "Content-Type": "audio/mpeg" } })]]);
const cacheApi = {
  match(req) { return Promise.resolve(cacheStore.get(typeof req === "string" ? req : req.url) || undefined); },
  put(req, res) { cacheStore.set(typeof req === "string" ? req : req.url, res); return Promise.resolve(); },
  addAll() { return Promise.resolve(); }
};
globalThis.caches = { open() { return Promise.resolve(cacheApi); }, match(req) { return cacheApi.match(req); }, keys() { return Promise.resolve([]); }, delete() { return Promise.resolve(true); } };
let fetchCalls = 0;
globalThis.fetch = async () => { fetchCalls++; return new R(fakeMp3, { status: 200, headers: { "Content-Type": "audio/mpeg" } }); };

eval(fs.readFileSync("/home/hatch/workspace/deen-day/www/sw.js", "utf8"));

function fakeEvent(range) {
  const ev = {
    request: {
      url: "https://localhost/audio/azan.mp3", method: "GET",
      headers: new H(range ? { range } : {})
    },
    respondWith(p) { this._p = p; }
  };
  handlers.fetch[0](ev);
  return ev._p;
}
(async () => {
  // 1. Range bytes=0-1023 → 206, Content-Range, exactly 1024 bytes.
  const r1 = await fakeEvent("bytes=0-1023");
  const b1 = new Uint8Array(await r1.arrayBuffer());
  check("Range 0-1023 returns 206", r1.status === 206, "status=" + r1.status);
  check("Range 0-1023 Content-Range is bytes 0-1023/10000",
    r1.headers.get("Content-Range") === "bytes 0-1023/10000", r1.headers.get("Content-Range"));
  check("Range 0-1023 body is exactly 1024 bytes", b1.length === 1024, "len=" + b1.length);
  check("Range 0-1023 body is the head of the file", b1[0] === 0 && b1[1023] === 1023 % 256, "head bytes wrong");
  check("Range response carries Accept-Ranges: bytes", r1.headers.get("Accept-Ranges") === "bytes", r1.headers.get("Accept-Ranges"));
  // 2. Open-ended range bytes=5000- → 206, 5000 bytes to the end.
  const r2 = await fakeEvent("bytes=5000-");
  const b2 = new Uint8Array(await r2.arrayBuffer());
  check("Open-ended range returns 206 with the tail",
    r2.status === 206 && r2.headers.get("Content-Range") === "bytes 5000-9999/10000" && b2.length === 5000,
    r2.status + " " + r2.headers.get("Content-Range") + " len=" + b2.length);
  // 3. Suffix range bytes=-100 → 206, last 100 bytes.
  const r3 = await fakeEvent("bytes=-100");
  const b3 = new Uint8Array(await r3.arrayBuffer());
  check("Suffix range returns 206 with the last 100 bytes",
    r3.status === 206 && r3.headers.get("Content-Range") === "bytes 9900-9999/10000" && b3.length === 100,
    r3.status + " " + r3.headers.get("Content-Range") + " len=" + b3.length);
  // 4. No Range header → unchanged behaviour: 200, full file, no network fetch (cache hit).
  fetchCalls = 0;
  const r4 = await fakeEvent(null);
  const b4 = new Uint8Array(await r4.arrayBuffer());
  check("No Range header returns 200 with the full file",
    r4.status === 200 && b4.length === FAKE_TOTAL && fetchCalls === 0,
    "status=" + r4.status + " len=" + b4.length + " fetchCalls=" + fetchCalls);
  // 5. Unsatisfiable range → 416 with bytes */total.
  const r5 = await fakeEvent("bytes=20000-30000");
  check("Unsatisfiable range returns 416",
    r5.status === 416 && r5.headers.get("Content-Range") === "bytes */10000",
    "status=" + r5.status + " " + r5.headers.get("Content-Range"));
  console.log(`\ntest-sw-range: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
