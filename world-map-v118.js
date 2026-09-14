(function(){
 const REGIONS=[
  {id:"first-ascent",name:"First Ascent",level:1,stage:"Awareness",icon:"⛰️",tone:"#55c9ee",y:86,side:"left",summary:"Learn where your money goes and make the invisible visible.",lesson:"Awareness is the first power: you cannot direct what you cannot see.",features:["Daily money check-ins","Spending awareness","First weekly plan"]},
  {id:"ember-ridge",name:"Ember Ridge",level:5,stage:"Stability",icon:"🔥",tone:"#ff7b45",y:69,side:"right",summary:"Build routines strong enough to survive an unpredictable week.",lesson:"Stability begins when essential costs and everyday spending have clear boundaries.",features:["Budget streaks","Bill preparedness","Stability challenges"]},
  {id:"tidehaven",name:"Tidehaven",level:10,stage:"Security",icon:"💧",tone:"#49d9ff",y:52,side:"left",summary:"Create a reserve that keeps financial surprises from controlling you.",lesson:"Security is measured in the time your savings can protect your life.",features:["Emergency-fund harbor","Protected-days meter","Savings currents"]},
  {id:"storm-peaks",name:"Storm Peaks",level:20,stage:"Growth",icon:"⚡",tone:"#ffe160",y:35,side:"right",summary:"Turn consistent contributions into long-term momentum.",lesson:"Growth accelerates when good choices happen automatically and repeatedly.",features:["Automation quests","Growth milestones","Long-term planning"]},
  {id:"eclipse-realm",name:"Eclipse Realm",level:35,stage:"Freedom",icon:"🌙",tone:"#bd83ff",y:19,side:"left",summary:"Master uncertainty and build the power to choose your own direction.",lesson:"Freedom is not only wealth—it is the ability to decide without immediate pressure.",features:["Freedom-time trials","Advanced goals","Choice pathways"]},
  {id:"freedom-summit",name:"Freedom Summit",level:50,stage:"Mastery",icon:"🌟",tone:"#f5d477",y:4,side:"right",summary:"Bring every financial skill together at the highest point of the world.",lesson:"Mastery means your system keeps working even when motivation changes.",features:["Mastery journey","Legacy achievements","World completion"]}
 ];
 const read=()=>{try{return JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){return {}}};
 const level=data=>Math.floor(+(data.companionProgress?.[data.type]||data.xp||0)/100)+1;
 const xp=data=>+(data.companionProgress?.[data.type]||data.xp||0);
 const companion=()=>{const d=read(),def=window.LQCharacterBases?.companions?.[d.type||"fire"],lv=level(d);return {d,def,form:def?.forms?.filter(f=>lv>=f.minLevel).pop()||def?.forms?.[0]}};
 const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
 function sprite(form,cls=""){
  if(!form)return '<span class="lqMapFallback">✦</span>';
  if(form.atlas)return '<div class="lqMapSprite '+cls+'" style="background-image:url(&quot;'+esc(form.art)+'&quot;);background-size:500% 500%;background-position:'+(form.atlas.col*25)+'% '+(form.atlas.row*25)+'%"></div>';
  return '<img class="lqMapSprite '+cls+'" src="'+esc(form.art)+'" alt="">';
 }
 function styles(){
  if(document.getElementById("lqWorldMapStyles"))return;
  const s=document.createElement("style");s.id="lqWorldMapStyles";s.textContent=`
#worldMap{padding:0 0 82px!important;min-height:100dvh;background:#020b13;color:#fff}
.lqMapHeader{position:sticky;top:0;z-index:40;padding:max(14px,env(safe-area-inset-top)) 15px 12px;background:linear-gradient(180deg,#092a43f5,#061b2df2);border-bottom:1px solid #f1c76342;backdrop-filter:blur(14px)}
.lqMapHeaderTop{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.lqMapHeader small{color:#f2ce6d;font-size:8px;font-weight:900;letter-spacing:.18em}.lqMapHeader h2{font:800 28px Georgia,serif;margin:3px 0}.lqMapHeader p{font-size:9px;color:#a9c0ce;margin:0}.lqMapLevel{min-width:94px;padding:9px;border-radius:15px;background:#061827;border:1px solid #f1c76375;text-align:center}.lqMapLevel b{display:block;font:800 17px Georgia,serif}.lqMapLevel span{font-size:7px;color:#78e2f2}.lqMapProgress{margin-top:9px;height:6px;border-radius:99px;background:#03101a;overflow:hidden}.lqMapProgress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#4edbf2,#f3ce68)}
.lqMapViewport{position:relative;height:calc(100dvh - 116px);overflow-y:auto;overscroll-behavior:contain;background:linear-gradient(180deg,#080d20 0,#18132b 15%,#17384a 37%,#15536a 56%,#75301f 76%,#164254 100%);scroll-behavior:smooth}
.lqMapWorld{position:relative;height:1580px;overflow:hidden;background:radial-gradient(circle at 15% 92%,#81e7ff55,transparent 17%),radial-gradient(circle at 82% 72%,#ff602e55,transparent 16%),radial-gradient(circle at 20% 54%,#38d9ff4d,transparent 17%),radial-gradient(circle at 80% 36%,#ffe25c42,transparent 17%),radial-gradient(circle at 17% 18%,#a65cff4f,transparent 16%),linear-gradient(180deg,transparent,#ffffff08 45%,transparent)}
.lqMapWorld:before{content:"";position:absolute;inset:0;background-image:radial-gradient(circle,#fff 0 1px,transparent 1.5px);background-size:47px 47px;opacity:.18}
.lqMapCloud{position:absolute;height:75px;width:180px;border-radius:50%;background:#e8f7ff17;filter:blur(13px);animation:lqMapDrift 9s ease-in-out infinite alternate}
.lqMapPath{position:absolute;inset:0;width:100%;height:100%;z-index:1;filter:drop-shadow(0 0 8px #ffd56d88)}
.lqMapRegion{--region:#55c9ee;position:absolute;z-index:5;width:238px;min-height:142px;transform:translateY(-50%);padding:13px;border-radius:22px;color:#fff;text-align:left;border:1px solid color-mix(in srgb,var(--region) 68%,transparent);background:radial-gradient(circle at 88% 8%,color-mix(in srgb,var(--region) 31%,transparent),transparent 34%),linear-gradient(145deg,#103a57ee,#061927f2);box-shadow:0 18px 35px #0007,0 0 25px color-mix(in srgb,var(--region) 16%,transparent)}
.lqMapRegion.left{left:16px}.lqMapRegion.right{right:16px}.lqMapRegion.locked{filter:saturate(.38) brightness(.64);border-color:#60748380}.lqMapRegion.current{box-shadow:0 20px 42px #0008,0 0 0 3px color-mix(in srgb,var(--region) 23%,transparent),0 0 33px color-mix(in srgb,var(--region) 50%,transparent)}
.lqMapRegionTop{display:flex;align-items:center;gap:9px}.lqMapIcon{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;font-size:23px;background:#041522cc;border:1px solid color-mix(in srgb,var(--region) 60%,transparent)}.lqMapRegion label{display:block;color:var(--region);font-size:7px;font-weight:900;letter-spacing:.15em}.lqMapRegion h3{font:800 19px Georgia,serif;margin:2px 0}.lqMapRegion p{font-size:8.5px;line-height:1.4;color:#c3d4dd;margin:8px 0}.lqMapRegion button{width:100%;border:1px solid color-mix(in srgb,var(--region) 60%,transparent);border-radius:10px;padding:8px;background:#061827;color:#fff;font-size:8px;font-weight:900}.lqMapRegion.locked button{color:#9bacb7;border-color:#61737e}
.lqMapPlayer{position:absolute;z-index:12;width:83px;height:91px;transform:translate(-50%,-50%);display:grid;place-items:center;filter:drop-shadow(0 12px 10px #0008);animation:lqMapFloat 3s ease-in-out infinite}.lqMapPlayer:after{content:"YOU ARE HERE";position:absolute;top:82px;white-space:nowrap;padding:4px 6px;border-radius:99px;background:#061827;border:1px solid #f3cf6f;color:#f3cf6f;font-size:6px;font-weight:900;letter-spacing:.1em}.lqMapSprite{display:block;width:78px;height:86px;object-fit:contain;background-repeat:no-repeat}.lqMapFallback{font-size:42px;color:#f4d575}
.lqMapFog{position:absolute;z-index:3;left:-10%;right:-10%;height:120px;background:linear-gradient(180deg,transparent,#dff7ff2b,transparent);filter:blur(10px)}
.lqRegionOverlay{position:fixed;z-index:130000;inset:0;display:flex;align-items:flex-end;justify-content:center;background:#01070db8;backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:.22s}.lqRegionOverlay.on{opacity:1;pointer-events:auto}.lqRegionSheet{--region:#55c9ee;width:min(100%,430px);max-height:82dvh;overflow:auto;padding:19px 16px calc(24px + env(safe-area-inset-bottom));border-radius:27px 27px 0 0;background:radial-gradient(circle at 90% 0,color-mix(in srgb,var(--region) 28%,transparent),transparent 30%),linear-gradient(180deg,#10364f,#061827);border:1px solid color-mix(in srgb,var(--region) 55%,transparent)}.lqRegionClose{float:right;width:38px;height:38px;border-radius:50%;border:1px solid #ffffff35;background:#061827;color:#fff;font-size:21px}.lqRegionSheet small{color:var(--region);font-size:8px;letter-spacing:.16em;font-weight:900}.lqRegionSheet h2{font:800 28px Georgia,serif;margin:5px 0}.lqRegionSheet>p{font-size:11px;line-height:1.55;color:#bfd1dc}.lqRegionLesson{padding:13px;border-radius:16px;background:#061827;color:#f3d785;font:italic 12px/1.5 Georgia,serif}.lqRegionFeatures{display:grid;gap:7px;margin-top:12px}.lqRegionFeature{padding:11px;border-radius:13px;background:#0b2b43;border:1px solid #ffffff15;font-size:10px;font-weight:800}.lqRegionHome{width:100%;margin-top:13px;border:0;border-radius:13px;padding:12px;background:linear-gradient(#f7dc8c,#dba947);color:#152639;font-weight:900}
#app>.nav{grid-template-columns:repeat(5,1fr)!important}body.journey-active #app>.nav{grid-template-columns:repeat(5,1fr)!important}#app>.nav button{font-size:8px!important;padding-left:1px!important;padding-right:1px!important}
@keyframes lqMapFloat{50%{transform:translate(-50%,-55%)}}@keyframes lqMapDrift{to{transform:translateX(28px)}}@media(prefers-reduced-motion:reduce){.lqMapPlayer,.lqMapCloud{animation:none}}
`;document.head.appendChild(s)
 }
 function ensure(){
  styles();let page=document.getElementById("worldMap");
  if(!page){page=document.createElement("section");page.id="worldMap";page.className="page";page.innerHTML='<div class="lqMapHeader"></div><div class="lqMapViewport"><div class="lqMapWorld"></div></div>';document.getElementById("app")?.insertBefore(page,document.querySelector("#app>.nav"))}
  let overlay=document.getElementById("lqRegionOverlay");if(!overlay){overlay=document.createElement("div");overlay.id="lqRegionOverlay";overlay.className="lqRegionOverlay";overlay.innerHTML='<div class="lqRegionSheet"><button class="lqRegionClose" aria-label="Close">×</button><div class="lqRegionContent"></div></div>';document.body.appendChild(overlay);overlay.onclick=e=>{if(e.target===overlay||e.target.closest(".lqRegionClose"))overlay.classList.remove("on")}}
  return {page,overlay}
 }
 function normalizeNav(){
  const nav=document.querySelector("#app>.nav");if(!nav)return;
  const items=[["⛰️","Home","journey"],["🗺️","Map","worldMap"],["🧾","Expenses","expenses"],["🎯","Goals","goals"],["📅","Calendar","calendar"]];
  nav.innerHTML=items.map(([icon,label,target])=>'<button type="button" data-lq-nav="'+target+'">'+icon+'<br>'+label+'</button>').join("");
  nav.querySelectorAll("button").forEach(btn=>btn.onclick=e=>{e.preventDefault();window.go?.(btn.dataset.lqNav)});
 }
 function pathSVG(){
  return '<svg class="lqMapPath" viewBox="0 0 430 1580" preserveAspectRatio="none" aria-hidden="true"><path d="M125 1410 C330 1305 337 1160 237 1050 C112 915 91 805 224 692 C352 584 345 440 210 322 C107 232 177 120 312 62" fill="none" stroke="#152f3b" stroke-width="18" stroke-linecap="round"/><path d="M125 1410 C330 1305 337 1160 237 1050 C112 915 91 805 224 692 C352 584 345 440 210 322 C107 232 177 120 312 62" fill="none" stroke="url(#mapTrail)" stroke-width="5" stroke-linecap="round" stroke-dasharray="7 10"><animate attributeName="stroke-dashoffset" from="0" to="-34" dur="2.6s" repeatCount="indefinite"/></path><defs><linearGradient id="mapTrail" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#59d9f4"/><stop offset=".35" stop-color="#ff8a45"/><stop offset=".68" stop-color="#ffe160"/><stop offset="1" stop-color="#c48cff"/></linearGradient></defs></svg>';
 }
 function openRegion(id){
  const {overlay}=ensure(),r=REGIONS.find(x=>x.id===id),d=read(),lv=level(d);if(!r)return;
  const locked=lv<r.level,sheet=overlay.querySelector(".lqRegionSheet");sheet.style.setProperty("--region",r.tone);
  overlay.querySelector(".lqRegionContent").innerHTML='<small>'+r.icon+' '+esc(r.stage).toUpperCase()+' REGION</small><h2>'+esc(r.name)+'</h2><p>'+esc(r.summary)+'</p><div class="lqRegionLesson">“'+esc(r.lesson)+'”</div><div class="lqRegionFeatures">'+r.features.map(f=>'<div class="lqRegionFeature">'+(locked?"🔒":"✦")+' '+esc(f)+'</div>').join("")+'</div>'+(locked?'<button class="lqRegionHome" disabled>REACH LEVEL '+r.level+' TO ENTER</button>':'<button class="lqRegionHome" data-enter-region>'+(r.id==="first-ascent"?"RETURN TO HOME MOUNTAIN":"REGION UNLOCKED · EXPLORE")+'</button>');
  overlay.querySelector("[data-enter-region]")?.addEventListener("click",()=>{overlay.classList.remove("on");if(r.id==="first-ascent")window.go?.("journey")});
  overlay.classList.add("on");
 }
 function render({center=false}={}){
  const {page}=ensure(),{d,def,form}=companion(),lv=level(d),total=xp(d),currentIndex=Math.max(0,REGIONS.findLastIndex(r=>lv>=r.level)),current=REGIONS[currentIndex],next=REGIONS[currentIndex+1],target=next?(next.level-1)*100:total,base=(current.level-1)*100,progress=next?Math.min(100,(total-base)/Math.max(1,target-base)*100):100;
  page.querySelector(".lqMapHeader").innerHTML='<div class="lqMapHeaderTop"><div><small>THE WORLD OF LIFE’S QUEST</small><h2>Journey Map</h2><p>'+esc(def?.name||"Your companion")+' is exploring '+esc(current.name)+'.</p></div><div class="lqMapLevel"><b>Level '+lv+'</b><span>'+(next?Math.max(0,target-total)+' XP TO '+next.name.toUpperCase():'WORLD MASTERY')+'</span></div></div><div class="lqMapProgress"><i style="width:'+progress+'%"></i></div>';
  const world=page.querySelector(".lqMapWorld");
  world.innerHTML=pathSVG()+'<div class="lqMapCloud" style="top:12%;left:4%"></div><div class="lqMapCloud" style="top:43%;right:-8%;animation-delay:-3s"></div><div class="lqMapCloud" style="top:74%;left:-6%;animation-delay:-6s"></div>'+
   REGIONS.map((r,i)=>'<article class="lqMapRegion '+r.side+' '+(lv<r.level?"locked ":"")+(i===currentIndex?"current":"")+'" data-region="'+r.id+'" style="--region:'+r.tone+';top:'+r.y+'%"><div class="lqMapRegionTop"><span class="lqMapIcon">'+(lv<r.level?"🔒":r.icon)+'</span><div><label>'+r.stage.toUpperCase()+' · LEVEL '+r.level+'</label><h3>'+r.name+'</h3></div></div><p>'+r.summary+'</p><button>'+(lv<r.level?"PREVIEW LOCKED REGION":"VIEW REGION")+'</button></article>').join("")+
   '<div class="lqMapPlayer" style="left:'+(current.side==="left"?69:31)+'%;top:'+(current.y-5)+'%">'+sprite(form)+'</div>';
  world.querySelectorAll("[data-region]").forEach(card=>card.onclick=()=>openRegion(card.dataset.region));
  if(center){const viewport=page.querySelector(".lqMapViewport"),marker=world.querySelector(".lqMapPlayer");requestAnimationFrame(()=>{viewport.scrollTop=Math.max(0,marker.offsetTop-viewport.clientHeight*.45)})}
 }
 function open(){ensure();normalizeNav();render({center:true});window.go?.("worldMap")}
 function boot(){
  ensure();normalizeNav();
  const original=window.go;if(original&&!original.__mapWrapped){window.go=function(target){const out=original.apply(this,arguments);if(target==="worldMap")render({center:true});normalizeNav();document.querySelectorAll("#app>.nav [data-lq-nav]").forEach(b=>b.classList.toggle("on",b.dataset.lqNav===target));return out};window.go.__mapWrapped=true}
  render();
 }
 window.LQMap={open,render,regions:REGIONS};
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
 window.addEventListener("pageshow",boot);
})();