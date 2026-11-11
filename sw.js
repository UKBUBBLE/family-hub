/* Family Hub – działanie bez internetu.
   Aplikacja: najpierw sieć (żeby nowe wersje docierały od razu), bez sieci kopia z pamięci.
   Ikony i czcionki: z pamięci. Baza danych i pogoda: zawsze przez sieć (bez zmian). */
const CACHE='familyhub-v1';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  if((r.headers.get('accept')||'').includes('text/event-stream'))return;
  const u=new URL(r.url);
  if(u.origin===self.location.origin){
    if(r.mode==='navigate'){
      e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));}return res;})
        .catch(()=>caches.match('index.html').then(m=>m||caches.match('./'))));
      return;
    }
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;})));
    return;
  }
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(m=>{const net=fetch(r).then(res=>{c.put(r,res.clone());return res;}).catch(()=>m);return m||net;})));
  }
});
