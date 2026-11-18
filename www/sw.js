/* My Deen service worker — caches the app shell + API responses for offline use. */
const CACHE = "my-deen-v19";
const SHELL = ["index.html", "styles.css", "app.js", "praycalc.js", "data/duas.js", "data/hadiths.js",
  "assets/quran-meta.js", "assets/quran-full.js", "manifest.json",
  "icons/icon-192.png", "icons/icon-512.png", "audio/azan.mp3", "audio/reminder.mp3", "audio/durood.mp3"];
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
