const VERSION="lifes-quest-20260911-47";
self.addEventListener("install",event=>{self.skipWaiting()});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(event.request,{cache:"no-store"});
      const cache=await caches.open(VERSION);
      cache.put(event.request,fresh.clone());
      return fresh;
    }catch(e){
      const cached=await caches.match(event.request);
      return cached||Response.error();
    }
  })());
});