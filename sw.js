/* Service worker: membuat app bisa dibuka offline setelah kunjungan pertama.
   Naikkan VERSION setiap kali kamu mengubah isi app, supaya pengguna mendapat versi baru. */
const VERSION = "tg-v1";
const FILES = ["./", "index.html", "assets/style.css", "assets/app.js", "data/content.js", "data/ielts.js",
  "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Ambil versi terbaru dari jaringan, pakai cache kalau sedang offline.
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && new URL(e.request.url).origin === location.origin) { const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});
