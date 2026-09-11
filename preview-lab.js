(function(){
  const types=["cloud","fire","water","lightning","shadow"];
  let index=0;
  function setType(type){window.LQWorld?.setCompanion(type);return type}
  function nextCompanion(){index=(index+1)%types.length;return setType(types[index])}
  function previousCompanion(){index=(index-1+types.length)%types.length;return setType(types[index])}
  function previewState(name,duration=1100){window.LQWorld?.emote(name,duration)}
  function previewWalk(){window.LQStudio?.enqueue({type:"anchor",anchor:"trailStart",options:{duration:850}},{type:"anchor",anchor:"trailMid",options:{duration:850}},{type:"anchor",anchor:"home",options:{duration:900}})}
  function previewEvolution(){
    const d=JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}");
    const level=Math.max(1,+d.level||1);
    const next=level<5?5:level<10?10:level<20?20:1;
    if(next===1){d.level=1;localStorage.setItem("lifesQuestWeb",JSON.stringify(d));window.LQWorld?.refresh();return Promise.resolve(false)}
    return window.LQWorld?.evolve(next);
  }
  function snapshot(){
    return {
      character:window.LQWorld?.getCharacter?.(),
      scene:window.LQStudio?.exportState?.(),
      availableTypes:types.slice(),
      states:(window.LQCharacterBases?.rig?.states||[]).slice()
    };
  }
  window.LQPreviewLab={setType,nextCompanion,previousCompanion,previewState,previewWalk,previewEvolution,snapshot};
})();