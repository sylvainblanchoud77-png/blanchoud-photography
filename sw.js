- const NAME = 'blanchoud-v1';
+ const NAME = 'blanchoud-v2';

const ASSETS = [
  './',
  './index.html','./gallery.html','./blog.html','./post.html',
  './styles.css','./app.js','./manifest.webmanifest'
];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(NAME).then(c=>c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==NAME&&caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  } else {
    e.respondWith(fetch(e.request).then(res=>{ const copy=res.clone(); caches.open(NAME).then(c=>c.put(e.request, copy)); return res; }).catch(()=>caches.match(e.request)));
  }
});
