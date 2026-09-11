(function(){
  async function checkAsset(src){
    return new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>resolve({src,ok:true,width:img.naturalWidth,height:img.naturalHeight});
      img.onerror=()=>resolve({src,ok:false,width:0,height:0});
      img.src=src+(src.includes("?")?"&":"?")+"qa="+Date.now();
    });
  }
  async function audit(){
    const manifest=window.LQAssetManifest;
    const environment=[];
    for(const item of manifest?.environment?.required||[])environment.push(await checkAsset(item.path));
    const characters=[];
    for(const [type] of Object.entries(manifest?.companions||{})){
      for(const form of manifest.requiredForms||[]){
        for(const state of ["idle","walk","celebrate","evolve"]){
          const src=manifest.characterFile(type,form,state);
          characters.push(Object.assign({type,form,state},await checkAsset(src)));
        }
      }
    }
    return {
      generatedAt:new Date().toISOString(),
      environment,
      characters,
      summary:{
        envReady:environment.filter(x=>x.ok).length,
        envTotal:environment.length,
        characterReady:characters.filter(x=>x.ok).length,
        characterTotal:characters.length
      }
    };
  }
  window.LQAssetQA={checkAsset,audit};
})();