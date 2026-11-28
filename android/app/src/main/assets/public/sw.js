/* My Deen service worker — caches the app shell + API responses for offline use. */
const CACHE = "my-deen-v20";
const SHELL = ["index.html", "styles.css", "app.js", "praycalc.js", "data/duas.js", "data/hadiths.js",
  "assets/quran-meta.js", "assets/quran-full.js", "manifest.json",
  "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  /* Fix #61 (28 Nov 2026): never intercept media files. The azan ▶
     preview stayed dead on the phone even after the Fix #60 Range/206
     fix — and the 53-second video had NO sound at all, not even the
     17 KB reminder tone, so the shared worker path is the suspect, not
     the 3.4 MB file size. The worker adds nothing for local audio:
     Capacitor's asset server serves it with native Range support, and
     every worker hop is another place the media pipeline can stall.
     Let audio go direct (no respondWith at all) — this also retires
     rangeResponse, which only ever served audio Range requests. The
     audio entries are dropped from SHELL too: with the bypass they
     would never be read, and addAll is all-or-nothing — one failed
     3.4 MB audio fetch used to fail the whole install (and with it,
     the offline app shell). The pathname check covers the Capacitor
     origin (/audio/...) and the PWA share prefix; the .mp3 check is
     the backstop for either layout. */
  if (url.origin === location.origin &&
      (url.pathname.indexOf("/audio/") !== -1 || url.pathname.slice(-4).toLowerCase() === ".mp3")) return;
  if (url.origin === location.origin) {
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
