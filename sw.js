const VERSION="lifes-quest-20260911-61";
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
      const type=fresh.headers.get("content-type")||"";
      if((event.request.mode==="navigate"||event.request.destination==="document")&&type.includes("text/html")){
        const html=await fresh.text();
        const css='<link rel="stylesheet" href="./journey-runtime-v61.css?v=61">';
        const js='<script src="./journey-runtime-v61.js?v=61"><\/script>';
        const injected=html
          .replace("</head>",css+"</head>")
          .replace("</body>",js+"</body>");
        const headers=new Headers(fresh.headers);
        headers.delete("content-length");
        headers.delete("content-encoding");
        const response=new Response(injected,{status:fresh.status,statusText:fresh.statusText,headers});
        const cache=await caches.open(VERSION);
        cache.put(event.request,response.clone());
        return response;
      }
      const cache=await caches.open(VERSION);
      cache.put(event.request,fresh.clone());
      return fresh;
    }catch(e){
      const cached=await caches.match(event.request);
      return cached||Response.error();
    }
  })());
});