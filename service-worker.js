self.addEventListener('install', e => { console.log('SW Installed'); });
self.addEventListener('activate', e => { console.log('SW Activated'); });
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
