const VERSION="lifes-quest-v79";
self.addEventListener("install",event=>{self.skipWaiting()});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(event.request,{cache:"no-store"});
      if(fresh&&fresh.ok){
        const cache=await caches.open(VERSION);
        cache.put(event.request,fresh.clone());
      }
      return fresh;
    }catch(e){
      const cached=await caches.match(event.request);
      return cached||Response.error();
    }
  })());
});