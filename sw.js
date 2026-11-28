/* My Deen service worker — caches the app shell + API responses for offline use. */
const CACHE = "my-deen-v20";
const SHELL = ["index.html", "styles.css", "app.js", "praycalc.js", "data/duas.js", "data/hadiths.js",
  "assets/quran-meta.js", "assets/quran-full.js", "manifest.json",
  "icons/icon-192.png", "icons/icon-512.png", "audio/azan.mp3", "audio/reminder.mp3", "audio/durood.mp3", "audio/istighfar.mp3"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.origin === location.origin) {
    /* Fix #60 (28 Nov 2026): the azan ▶ preview seeks (currentTime = 0)
       on every tap, and Chromium serves media seeks as Range requests.
       caches.match() ignores the Range header and returns the whole file
       as HTTP 200 — the media pipeline cannot seek against a 200, so
       every tap re-streamed the whole 3.4 MB azan.mp3 through the worker
       (the "VERY late" azan-button delay; Fix #37's preload could not
       save it because the tap-time seek goes back through the worker).
       Answer Range requests with a proper 206 Partial Content sliced
       from the cached full response. */
    const range = e.request.headers.get("range");
    if (range) {
      e.respondWith(rangeResponse(e.request, range));
      return;
    }
    // App shell: cache first, fall back to network
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match("index.html"))));
  } else if (url.hostname.includes("aladhan.com") || url.hostname.includes("alquran.cloud") || url.hostname.includes("islamic.network")) {
    // API + audio: network first, fall back to cache (offline reading)
    e.respondWith(fetch(e.request).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request)));
  }
});

/* Build a 206 Partial Content response for a Range request, sliced from
   the cached (or freshly fetched) full response. Unparseable or
   unsatisfiable ranges fall back to the full response / a plain fetch —
   never worse than the old behaviour (whole file as 200). */
async function rangeResponse(request, range) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(range).trim());
  if (!m) return fetch(request);
  let res = await caches.match(request);
  if (!res) {
    try {
      res = await fetch(request);
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(request, copy)).catch(()=>{});
    } catch (e) { return fetch(request); }
  }
  if (!res) return fetch(request);
  const buf = await res.arrayBuffer();
  const total = buf.byteLength;
  let start = m[1] === "" ? null : parseInt(m[1], 10);
  let end = m[2] === "" ? null : parseInt(m[2], 10);
  if (start === null && end === null) return res;
  if (start === null) { start = Math.max(0, total - end); end = total - 1; }
  if (end === null || end >= total) end = total - 1;
  if (start >= total || start > end) {
    return new Response(null, {status: 416, headers: {"Content-Range": "bytes */" + total}});
  }
  return new Response(buf.slice(start, end + 1), {status: 206, headers: {
    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": String(end - start + 1),
    "Content-Type": res.headers.get("Content-Type") || "application/octet-stream"
  }});
}
