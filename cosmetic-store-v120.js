(function(){
 const ITEMS=[
  {id:"explorer-cap",name:"Explorer Cap",slot:"head",icon:"🧢",price:20,rarity:"Common",description:"A classic cap for companions beginning the climb.",dropRate:46.5,dropClass:"Standard"},
  {id:"trail-pack",name:"Trail Backpack",slot:"back",icon:"🎒",price:25,rarity:"Common",description:"Carry every lesson gathered along the journey.",dropRate:46.5,dropClass:"Standard"},
  {id:"saver-scarf",name:"Saver Scarf",slot:"neck",icon:"🧣",price:30,rarity:"Uncommon",description:"A warm reminder that consistency compounds.",dropRate:46.5,dropClass:"Standard"},
  {id:"gold-compass",name:"Golden Compass",slot:"charm",icon:"🧭",price:35,rarity:"Uncommon",description:"Points toward the next best financial choice.",dropRate:46.5,dropClass:"Standard"},
  {id:"spark-charm",name:"Momentum Spark",slot:"charm",icon:"✨",price:40,rarity:"Rare",description:"Glows brighter as your habits become consistent.",dropRate:46.5,dropClass:"Standard"},
  {id:"star-trail",name:"Starlight Trail",slot:"trail",icon:"🌠",price:60,rarity:"Epic",description:"Leaves a celestial trail behind your companion.",dropRate:46.5,dropClass:"Standard"},
  {id:"royal-crown",name:"Prosperity Crown",slot:"head",icon:"👑",price:100,rarity:"Legendary",description:"A premium token reward for dedicated explorers.",dropRate:47.5,dropClass:"Standard"},
  {id:"round-glasses",name:"Trail Glasses",slot:"head",icon:"👓",price:18,rarity:"Common",description:"Simple traveling glasses for a focused companion.",dropRate:5,dropClass:"Semi-Rare"},
  {id:"leaf-pin",name:"Meadow Pin",slot:"charm",icon:"🍃",price:18,rarity:"Common",description:"A small leaf collected near the First Ascent.",dropRate:2,dropClass:"Ultra-Rare"},
  {id:"emerald-band",name:"Emerald Headband",slot:"head",icon:"🥬",price:32,rarity:"Uncommon",description:"A green band that celebrates steady progress.",dropRate:5,dropClass:"Semi-Rare"},
  {id:"forest-trail",name:"Forest Trail",slot:"trail",icon:"🌿",price:38,rarity:"Uncommon",description:"Leaves a growing trail of green behind each step.",dropRate:2,dropClass:"Ultra-Rare"},
  {id:"ocean-cape",name:"Ocean Cape",slot:"back",icon:"🧿",price:58,rarity:"Rare",description:"A deep-blue cape inspired by Tidehaven currents.",dropRate:46.5,dropClass:"Standard"},
  {id:"blue-orbit",name:"Azure Orbit",slot:"aura",icon:"🔵",price:62,rarity:"Rare",description:"A brilliant blue aura circling the companion.",dropRate:2,dropClass:"Ultra-Rare"},
  {id:"sapphire-mask",name:"Sapphire Mask",slot:"head",icon:"💠",price:58,rarity:"Rare",description:"A bright-blue mask discovered beneath Tidehaven.",dropRate:5,dropClass:"Semi-Rare"},
  {id:"violet-wings",name:"Violet Wings",slot:"back",icon:"🪽",price:92,rarity:"Epic",description:"Mystical purple wings from the edge of Eclipse Realm.",dropRate:5,dropClass:"Semi-Rare"},
  {id:"nebula-crown",name:"Nebula Crown",slot:"head",icon:"🔮",price:95,rarity:"Epic",description:"A crown surrounded by shifting violet starlight.",dropRate:2,dropClass:"Ultra-Rare"},
  {id:"cosmic-scarf",name:"Cosmic Scarf",slot:"neck",icon:"🌌",price:90,rarity:"Epic",description:"A flowing scarf patterned with distant galaxies.",dropRate:46.5,dropClass:"Standard"},
  {id:"sun-halo",name:"Solar Halo",slot:"aura",icon:"☀️",price:145,rarity:"Legendary",description:"A golden halo that shines like the Freedom Summit.",dropRate:4,dropClass:"Semi-Rare"},
  {id:"dragon-wings",name:"Golden Dragon Wings",slot:"back",icon:"🐉",price:160,rarity:"Legendary",description:"Ancient golden wings reserved for legendary explorers.",dropRate:1,dropClass:"Ultra-Rare"},
  {id:"phoenix-trail",name:"Phoenix Trail",slot:"trail",icon:"🦅",price:145,rarity:"Legendary",description:"A brilliant golden firebird trail reborn with every step.",dropRate:47.5,dropClass:"Standard"},
  {id:"weekly-flame",name:"Consistency Flame",slot:"aura",icon:"🔥",achievement:"Complete a 5-of-7 week",test:(d,l)=>Object.keys(d.questLedger||{}).some(k=>k.startsWith("weekly-consistency:")),rarity:"Achievement",description:"Only earned by completing five daily check-ins in one week."},
  {id:"harbor-shield",name:"Tidehaven Shield",slot:"back",icon:"🛡️",achievement:"Reach Level 10",test:(d,l)=>l>=10,rarity:"Region",description:"A protective relic carried from Tidehaven."},
  {id:"storm-wings",name:"Storm Wings",slot:"back",icon:"⚡",achievement:"Reach Level 20",test:(d,l)=>l>=20,rarity:"Region",description:"Charged wings awarded at the Storm Peaks."},
  {id:"eclipse-crown",name:"Eclipse Crown",slot:"head",icon:"🌙",achievement:"Reach Level 35",test:(d,l)=>l>=35,rarity:"Region",description:"A crown forged in the Eclipse Realm."},
  {id:"summit-halo",name:"Summit Halo",slot:"aura",icon:"🌟",achievement:"Reach Level 50",test:(d,l)=>l>=50,rarity:"Mastery",description:"The final symbol of financial mastery."}
 ];
 const CRATES=[
  {id:"common",rarity:"Common",name:"Common Crate",color:"#a8afb5",cost:12,icon:"📦"},
  {id:"uncommon",rarity:"Uncommon",name:"Uncommon Crate",color:"#55d67a",cost:25,icon:"🧰"},
  {id:"rare",rarity:"Rare",name:"Rare Crate",color:"#3f9dff",cost:50,icon:"🎁"},
  {id:"epic",rarity:"Epic",name:"Epic Crate",color:"#a864ff",cost:85,icon:"🔮"},
  {id:"legendary",rarity:"Legendary",name:"Legendary Crate",color:"#f2c94c",cost:140,icon:"🏆"}
 ];
 const read=()=>{try{return JSON.parse(localStorage.getItem("lifesQuestCosmetics")||"{}")}catch(e){return {}}};
 const write=s=>localStorage.setItem("lifesQuestCosmetics",JSON.stringify(s));
 const finance=()=>{try{return JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){return {}}};
 function state(){
  const s=read();s.tokens=Number.isFinite(+s.tokens)?+s.tokens:25;s.owned=Array.isArray(s.owned)?s.owned:[];s.equipped=s.equipped||{};s.grants=s.grants||{};
  if(!s.grants["starter-pouch"]){s.grants["starter-pouch"]=Date.now();s.tokens=25}
  return s
 }
 function level(d){return Math.floor(+(d.companionProgress?.[d.type]||d.xp||0)/100)+1}
 function syncEarned(){
  const s=state(),d=finance(),lv=level(d);let changed=false;
  ITEMS.filter(i=>i.test?.(d,lv)).forEach(item=>{if(!s.owned.includes(item.id)){s.owned.push(item.id);changed=true}});
  if(changed)write(s);return s
 }
 function grantTokens(amount,key,label){
  const s=syncEarned();if(s.grants[key])return false;s.grants[key]=Date.now();s.tokens+=Math.max(0,+amount||0);write(s);toast("+"+amount+" Journey Tokens · "+label);render();return true
 }
 function toast(message){
  let t=document.getElementById("lqTokenToast");if(!t){t=document.createElement("div");t.id="lqTokenToast";document.body.appendChild(t)}
  t.textContent="🪙 "+message;t.classList.add("on");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("on"),2300)
 }
 function styles(){
  if(document.getElementById("lqCosmeticStyles"))return;const s=document.createElement("style");s.id="lqCosmeticStyles";s.textContent=`
.lqStoreOpen{border:1px solid #f1c76380;border-radius:13px;padding:8px 10px;background:#061827;color:#f4d574;font-size:9px;font-weight:900;white-space:nowrap}.lqStoreOpen span{display:block;color:#fff;font-size:7px;margin-top:2px}
.lqStoreOverlay{position:fixed;z-index:140000;inset:0;display:flex;justify-content:center;background:#01070ddd;backdrop-filter:blur(12px);opacity:0;pointer-events:none;transition:.22s}.lqStoreOverlay.on{opacity:1;pointer-events:auto}.lqStoreSheet{width:min(100%,430px);height:100dvh;overflow-y:auto;padding:max(18px,env(safe-area-inset-top)) 14px calc(28px + env(safe-area-inset-bottom));background:radial-gradient(circle at 80% 0,#e5b94a36,transparent 27%),linear-gradient(180deg,#103653,#061827 55%,#020b13);color:#fff}.lqStoreClose{position:sticky;top:0;z-index:4;float:right;width:40px;height:40px;border-radius:50%;border:1px solid #ffffff3b;background:#061827dd;color:#fff;font-size:22px}.lqStoreHead small{color:#f3ce6d;font-size:8px;font-weight:900;letter-spacing:.18em}.lqStoreHead h2{font:800 30px Georgia,serif;margin:4px 0}.lqStoreHead p{font-size:10px;color:#aec4d1;margin:0}.lqWallet{clear:both;margin:17px 0 13px;padding:14px;border-radius:20px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(145deg,#554017,#14364b);border:1px solid #f1c76380}.lqWallet small{display:block;font-size:7px;letter-spacing:.15em;color:#f5d67d}.lqWallet b{font:800 25px Georgia,serif}.lqWalletIcon{font-size:31px}.lqCrateSection{margin:15px 0}.lqCrateSection h3{font:800 18px Georgia,serif;margin:0 0 3px}.lqCrateSection>p{color:#9fb5c4;font-size:8px;margin:0 0 9px}.lqCrateRail{display:flex;gap:8px;overflow-x:auto;padding-bottom:5px;scroll-snap-type:x mandatory}.lqCrate{--crate:#a8afb5;flex:0 0 126px;scroll-snap-align:start;padding:11px;border-radius:17px;border:1px solid var(--crate);background:radial-gradient(circle at 50% 22%,color-mix(in srgb,var(--crate) 35%,transparent),transparent 38%),linear-gradient(160deg,#12344d,#061827);color:#fff;text-align:center;box-shadow:0 9px 22px #0005}.lqCrateIcon{font-size:38px;filter:drop-shadow(0 0 9px var(--crate))}.lqCrate b{display:block;margin-top:5px;font:800 12px Georgia,serif;color:var(--crate)}.lqCrate small{display:block;color:#9fb3c0;font-size:7px;margin:3px 0 5px}.lqCrate .lqCrateOdds{color:var(--crate);font-size:6.5px;font-weight:900;margin-bottom:7px}.lqCrate span{display:block;padding:6px;border-radius:9px;background:#06131e;color:#f4d474;font-size:8px;font-weight:900}.lqCrate:disabled{opacity:.48;filter:saturate(.4)}.lqCrateReveal{--crate:#f2c94c;position:fixed;z-index:155000;inset:0;display:grid;place-items:center;padding:18px;background:#01060de8;backdrop-filter:blur(15px);opacity:0;pointer-events:none;transition:.3s}.lqCrateReveal.on{opacity:1;pointer-events:auto}.lqRevealBurst{position:relative;width:min(92vw,390px);padding:25px 18px;border-radius:28px;text-align:center;background:radial-gradient(circle at 50% 30%,color-mix(in srgb,var(--crate) 38%,transparent),transparent 38%),linear-gradient(180deg,#143951,#061827);border:2px solid var(--crate);box-shadow:0 0 65px color-mix(in srgb,var(--crate) 45%,transparent);animation:lqRevealPop .55s cubic-bezier(.2,1.4,.3,1)}.lqRevealBurst small{color:var(--crate);font-size:9px;letter-spacing:.2em;font-weight:900}.lqRevealIcon{font-size:88px;margin:17px 0;filter:drop-shadow(0 0 22px var(--crate));animation:lqRevealFloat 2s ease-in-out infinite}.lqRevealBurst h2{font:800 28px Georgia,serif;margin:0}.lqRevealBurst p{color:#b9cbd6;font-size:10px}.lqRevealActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:15px}.lqRevealActions button{border:1px solid #ffffff30;border-radius:12px;padding:11px;background:#082943;color:#fff;font-size:9px;font-weight:900}.lqRevealActions .equip{border-color:var(--crate);background:color-mix(in srgb,var(--crate) 28%,#082943)}.lqStoreTabs{display:flex;gap:6px;overflow-x:auto;margin-bottom:11px}.lqStoreTabs button{border:1px solid #ffffff1b;border-radius:999px;padding:7px 10px;background:#071d2f;color:#9eb5c4;font-size:8px;font-weight:900;white-space:nowrap}.lqStoreTabs button.on{border-color:#f1c763;color:#f4d578;background:#493916}.lqCosmeticGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lqCosmeticCard{position:relative;min-height:222px;padding:11px;border-radius:18px;background:linear-gradient(155deg,#0e3856,#061a2b);border:1px solid #ffffff18;overflow:hidden}.lqCosmeticCard.owned{border-color:#62df9670}.lqCosmeticCard.equipped{border-color:#f2cc69;box-shadow:0 0 20px #f2cc6930}.lqCosmeticCard.locked{filter:saturate(.65)}.lqCosmeticPreview{height:79px;display:grid;place-items:center;font-size:48px;border-radius:14px;background:radial-gradient(circle,#ffffff16,transparent 68%),#061827}.lqCosmeticCard label{display:block;margin-top:9px;color:#f2ce70;font-size:6.5px;font-weight:900;letter-spacing:.12em}.lqCosmeticCard h3{font:800 14px Georgia,serif;margin:3px 0}.lqCosmeticCard p{min-height:36px;color:#9fb6c5;font-size:7.5px;line-height:1.4;margin:0 0 8px}.lqCosmeticCard button{width:100%;border:1px solid #42a9df66;border-radius:10px;padding:8px 4px;background:#082943;color:#fff;font-size:7.5px;font-weight:900}.lqCosmeticCard button.buy{border-color:#f1c76380;background:#4b3a16;color:#f5d476}.lqCosmeticCard button:disabled{color:#718896;border-color:#526574;background:#071621}.lqEarnTokens{margin-top:15px;padding:14px;border-radius:18px;background:#071d2f;border:1px solid #ffffff18}.lqEarnTokens h3{font:800 17px Georgia,serif;margin:0 0 8px}.lqTokenWay{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ffffff10;font-size:9px}.lqTokenWay:last-child{border:0}.lqTokenWay b{color:#f3cf72}
#lqTokenToast{position:fixed;z-index:160000;left:50%;top:max(22px,env(safe-area-inset-top));transform:translate(-50%,-16px);opacity:0;padding:11px 15px;border-radius:999px;background:#143d55;border:1px solid #f2cd69;color:#fff;font-size:10px;font-weight:900;white-space:nowrap;transition:.25s;pointer-events:none}#lqTokenToast.on{opacity:1;transform:translate(-50%,0)}
.lqCosmeticLayer{position:absolute;inset:0;z-index:6;pointer-events:none}.lqWearable{position:absolute;display:none;filter:drop-shadow(0 2px 5px #0009)}.lqWearable.on{display:block}.lqWearable.head{left:50%;top:7%;transform:translateX(-50%);font-size:27px}.lqWearable.back{left:-2%;top:39%;font-size:25px;z-index:-1}.lqWearable.neck{left:50%;top:42%;transform:translateX(-50%);font-size:24px}.lqWearable.charm{right:1%;top:45%;font-size:19px}.lqWearable.trail{left:-15%;bottom:5%;font-size:26px;animation:lqTrailSpark 1.8s ease-in-out infinite}.lqWearable.aura{inset:9%;border-radius:50%;font-size:0;box-shadow:0 0 25px #f6c85f,0 0 50px #ff7a4590;animation:lqCosAura 2.4s ease-in-out infinite}
@keyframes lqRevealPop{from{transform:scale(.35) rotate(-8deg);opacity:0}}@keyframes lqRevealFloat{50%{transform:translateY(-8px) rotate(3deg)}}@keyframes lqTrailSpark{50%{transform:translate(-8px,4px);opacity:.55}}@keyframes lqCosAura{50%{transform:scale(1.08);opacity:.62}}
`;document.head.appendChild(s)}
 function ensureLayer(){
  const host=document.getElementById("lqCharacterHost");if(!host)return;let layer=host.querySelector(".lqCosmeticLayer");if(!layer){layer=document.createElement("div");layer.className="lqCosmeticLayer";host.appendChild(layer)}
  const s=syncEarned();layer.innerHTML=Object.entries(s.equipped).map(([slot,id])=>{const item=ITEMS.find(i=>i.id===id);return item?'<span class="lqWearable '+slot+' on" aria-hidden="true">'+item.icon+'</span>':""}).join("")
 }
 function ensure(){
  styles();let overlay=document.getElementById("lqStoreOverlay");if(!overlay){overlay=document.createElement("div");overlay.id="lqStoreOverlay";overlay.className="lqStoreOverlay";overlay.innerHTML='<div class="lqStoreSheet" role="dialog" aria-modal="true"><button class="lqStoreClose" aria-label="Close">×</button><div class="lqStoreContent"></div></div>';document.body.appendChild(overlay);overlay.onclick=e=>{if(e.target===overlay||e.target.closest(".lqStoreClose"))close()}}
  if(!document.getElementById("lqCrateReveal")){const reveal=document.createElement("div");reveal.id="lqCrateReveal";reveal.className="lqCrateReveal";document.body.appendChild(reveal)}
  return overlay
 }
 let filter="all";
 function itemStatus(item,s,d,lv){
  const owned=s.owned.includes(item.id),equipped=s.equipped[item.slot]===item.id,eligible=!item.achievement||item.test?.(d,lv);
  return {owned,equipped,eligible}
 }
 function render(){
  const overlay=ensure(),s=syncEarned(),d=finance(),lv=level(d),shown=ITEMS.filter(i=>filter==="all"?true:filter==="earned"?!!i.achievement:i.slot===filter);
  overlay.querySelector(".lqStoreContent").innerHTML='<div class="lqStoreHead"><small>COMPANION CUSTOMIZATION</small><h2>Trail Market</h2><p>Spend Journey Tokens or earn exclusive rewards through real financial progress.</p></div><div class="lqWallet"><div><small>YOUR JOURNEY TOKENS</small><b>'+s.tokens+'</b></div><div class="lqWalletIcon">🪙</div></div><div class="lqCrateSection"><h3>Mystery Crates</h3><p>Every crate contains one random unowned cosmetic from its exact rarity.</p><div class="lqCrateRail">'+CRATES.map(crate=>{const pool=ITEMS.filter(i=>!i.achievement&&i.rarity===crate.rarity),left=pool.filter(i=>!s.owned.includes(i.id)).length,complete=left===0;return '<button class="lqCrate" data-crate="'+crate.id+'" style="--crate:'+crate.color+'" '+(complete?"disabled":"")+'><div class="lqCrateIcon">'+crate.icon+'</div><b>'+crate.name+'</b><small>'+(complete?"COLLECTION COMPLETE":left+" OF "+pool.length+" ITEMS REMAIN")+'</small><div class="lqCrateOdds">SEMI-RARE 3–6% · ULTRA 1–2%</div><span>'+(complete?"COMPLETE":crate.cost+" 🪙 TO OPEN")+'</span></button>'}).join("")+'</div></div><div class="lqStoreTabs">'+[["all","ALL"],["head","HEAD"],["back","BACK"],["charm","CHARMS"],["trail","TRAILS"],["earned","EARNED"]].map(([id,name])=>'<button data-filter="'+id+'" class="'+(filter===id?"on":"")+'">'+name+'</button>').join("")+'</div><div class="lqCosmeticGrid">'+shown.map(item=>{const st=itemStatus(item,s,d,lv),action=st.equipped?"EQUIPPED ✓":st.owned?"EQUIP":item.achievement?item.achievement:"BUY · "+item.price+" 🪙";return '<article class="lqCosmeticCard '+(st.owned?"owned ":"")+(st.equipped?"equipped ":"")+(!st.eligible?"locked":"")+'"><div class="lqCosmeticPreview">'+(st.eligible||!item.achievement?item.icon:"❔")+'</div><label>'+item.rarity.toUpperCase()+' · '+item.slot.toUpperCase()+(item.dropRate?' · '+item.dropRate+'% DROP':'')+'</label><h3>'+item.name+'</h3><p>'+item.description+'</p><button data-item="'+item.id+'" class="'+(!st.owned&&!item.achievement?"buy":"")+'" '+(!st.eligible||st.equipped?"disabled":"")+'>'+action+'</button></article>'}).join("")+'</div><div class="lqEarnTokens"><h3>Earn Journey Tokens</h3><div class="lqTokenWay"><span>Complete all 3 daily actions</span><b>+3</b></div><div class="lqTokenWay"><span>Check in on 5 of 7 days</span><b>+20</b></div><div class="lqTokenWay"><span>Discover a new region</span><b>+30</b></div></div>';
  overlay.querySelectorAll("[data-crate]").forEach(btn=>btn.onclick=()=>openCrate(btn.dataset.crate));
  overlay.querySelectorAll("[data-filter]").forEach(btn=>btn.onclick=()=>{filter=btn.dataset.filter;render()});
  overlay.querySelectorAll("[data-item]").forEach(btn=>btn.onclick=()=>activate(btn.dataset.item));
  wireButton();ensureLayer()
 }
 function weightedPick(pool){
  const total=pool.reduce((sum,item)=>sum+(+item.dropRate||0),0),values=new Uint32Array(1);crypto.getRandomValues(values);let roll=(values[0]/4294967296)*total;
  for(const item of pool){roll-=+item.dropRate||0;if(roll<=0)return item}return pool[pool.length-1]
 }
 function showReveal(item,crate,duplicate=false,refund=0){
  const reveal=document.getElementById("lqCrateReveal");reveal.style.setProperty("--crate",crate.color);
  reveal.innerHTML='<div class="lqRevealBurst"><small>'+item.dropClass.toUpperCase()+' · '+item.dropRate+'% BASE DROP</small><div class="lqRevealIcon">'+item.icon+'</div><h2>'+item.name+'</h2><p>'+(duplicate?'Duplicate converted into '+refund+' Journey Tokens.':item.description)+'</p><div class="lqRevealActions"><button data-keep>'+(duplicate?'COLLECT TOKENS':'KEEP IN INVENTORY')+'</button>'+(duplicate?'':'<button class="equip" data-equip-reveal>EQUIP NOW</button>')+'</div></div>';
  reveal.classList.add("on");reveal.querySelector("[data-keep]").onclick=()=>reveal.classList.remove("on");reveal.querySelector("[data-equip-reveal]")?.addEventListener("click",()=>{reveal.classList.remove("on");activate(item.id)})
 }
 function openCrate(id){
  const crate=CRATES.find(x=>x.id===id),s=syncEarned();if(!crate)return;
  const pool=ITEMS.filter(i=>!i.achievement&&i.rarity===crate.rarity);
  if(pool.every(i=>s.owned.includes(i.id))){toast(crate.rarity+" collection complete");return}
  if(s.tokens<crate.cost){toast("You need "+(crate.cost-s.tokens)+" more Journey Tokens");return}
  s.tokens-=crate.cost;const item=weightedPick(pool),duplicate=s.owned.includes(item.id),refund=duplicate?Math.max(1,Math.ceil(crate.cost*.3)):0;
  if(duplicate)s.tokens+=refund;else s.owned.push(item.id);
  s.grants["crate:"+Date.now()+":"+item.id]=crate.id+(duplicate?":duplicate":"");write(s);render();showReveal(item,crate,duplicate,refund)
 }
 function activate(id){
  const item=ITEMS.find(i=>i.id===id),s=syncEarned(),d=finance(),lv=level(d);if(!item)return;const st=itemStatus(item,s,d,lv);if(!st.eligible)return;
  if(!st.owned){if(s.tokens<item.price){toast("You need "+(item.price-s.tokens)+" more Journey Tokens");return}s.tokens-=item.price;s.owned.push(id);toast("Unlocked "+item.name)}
  s.equipped[item.slot]=id;write(s);ensureLayer();render();window.LQWorld?.emote?.("celebrate",800)
 }
 function open(){render();ensure().classList.add("on");document.body.style.overflow="hidden"}
 function close(){document.getElementById("lqStoreOverlay")?.classList.remove("on");document.body.style.removeProperty("overflow")}
 function wireButton(){
  const header=document.querySelector("#worldMap .lqMapHeaderTop");if(header&&!header.querySelector(".lqStoreOpen")){const s=syncEarned(),b=document.createElement("button");b.className="lqStoreOpen";b.innerHTML='🛍️ TRAIL MARKET<span>'+s.tokens+' TOKENS</span>';b.onclick=open;header.insertBefore(b,header.querySelector(".lqMapLevel"))}
 }
 function boot(){styles();syncEarned();ensureLayer();wireButton()}
 window.LQCosmetics={open,close,render,grantTokens,syncEarned,ensureLayer};
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
 window.addEventListener("pageshow",boot);setInterval(()=>{wireButton();ensureLayer()},1200);
})();