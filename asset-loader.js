(function(){
  const cache=new Map();
  function canLoad(src){
    if(!src)return Promise.resolve(false);
    if(cache.has(src))return cache.get(src);
    const p=new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>resolve(true);
      img.onerror=()=>resolve(false);
      img.src=src+(src.includes("?")?"&":"?")+"probe="+Date.now();
    });
    cache.set(src,p);return p;
  }
  async function firstAvailable(candidates){
    for(const src of candidates){if(await canLoad(src))return src}
    return null;
  }
  async function premiumEnvironmentSlot(slot,fallback){
    const m=window.LQAssetManifest;
    const item=m?.environment?.required?.find(x=>x.slot===slot);
    if(!item)return fallback;
    return await firstAvailable([item.path,fallback].filter(Boolean))||fallback;
  }
  async function premiumCharacter(type,form,state,fallback){
    const m=window.LQAssetManifest;
    const preferred=m?.characterFile?.(type,form,state);
    const idle=m?.characterFile?.(type,form,"idle");
    return await firstAvailable([preferred,idle,fallback].filter(Boolean))||fallback;
  }
  window.LQAssets={canLoad,firstAvailable,premiumEnvironmentSlot,premiumCharacter,clearCache(){cache.clear()}};
})();