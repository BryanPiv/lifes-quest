(function(){
 const LESSONS=[
  {stage:"Awareness",title:"Give every dollar a name",body:"Tracking is not about guilt. It turns invisible habits into choices you can control.",takeaway:"Know where it went before deciding where it goes next."},
  {stage:"Stability",title:"Build breathing room",body:"A weekly plan protects bills and savings before everyday spending begins.",takeaway:"A budget is permission to spend with confidence."},
  {stage:"Security",title:"Buy back your time",body:"An emergency fund measures how many days your life can continue without new income.",takeaway:"Start with one protected day, then build toward 90."},
  {stage:"Growth",title:"Make progress automatic",body:"Consistent contributions matter more than waiting for the perfect time or perfect amount.",takeaway:"Small automatic deposits can become powerful over time."},
  {stage:"Freedom",title:"Money creates choices",body:"Financial freedom is not only a number. It is the ability to make decisions without immediate financial pressure.",takeaway:"Build wealth around the life you actually want."}
 ];
 const read=()=>{try{return JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){return {}}};
 const weekStart=()=>{const n=new Date(),d=new Date(n.getFullYear(),n.getMonth(),n.getDate());let diff=(d.getDay()-5+7)%7;d.setDate(d.getDate()-diff);return d};
 const weekKey=()=>{const d=weekStart();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
 const level=d=>Math.max(1,Math.floor(+(d.companionProgress?.[d.type]||0)/100)+1,+d.level||1);
 const stageIndex=d=>{const l=level(d);return l>=35?4:l>=20?3:l>=10?2:l>=5?1:0};
 function metrics(){
  const d=read(),start=weekStart(),dates=new Set((d.expenses||[]).filter(x=>new Date((x.date||"")+"T12:00:00")>=start).map(x=>x.date));
  const saved=!!d.questLedger?.["weekly-saving:"+weekKey()];
  return {d,dates:dates.size,budget:+d.allowance>0,saved};
 }
 function styles(){
  if(document.getElementById("lqQuestCenterStyles"))return;const s=document.createElement("style");s.id="lqQuestCenterStyles";s.textContent=`
.lqQuestOpen{width:100%;margin-top:10px;border:1px solid rgba(241,199,99,.5);border-radius:10px;padding:8px 9px;background:linear-gradient(180deg,rgba(241,199,99,.19),rgba(241,199,99,.07));color:#fff;text-align:left;font-weight:900;font-size:9px;letter-spacing:.06em}.lqQuestOpen span{float:right;color:#f6cf70}
.lqQuestOverlay{position:fixed;z-index:110000;inset:0;background:rgba(1,8,15,.78);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center;opacity:0;pointer-events:none;transition:.25s}.lqQuestOverlay.on{opacity:1;pointer-events:auto}
.lqQuestSheet{width:min(100%,430px);max-height:88vh;overflow:auto;border-radius:26px 26px 0 0;padding:20px 16px calc(24px + env(safe-area-inset-bottom));background:linear-gradient(180deg,#103653,#061a2b 72%);border:1px solid rgba(114,174,210,.35);box-shadow:0 -24px 60px #0009;color:#fff}
.lqQuestHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.lqQuestHead small{color:#f2c966;font-weight:900;letter-spacing:.16em}.lqQuestHead h2{font:800 27px Georgia,serif;margin:4px 0}.lqQuestClose{border:1px solid #ffffff3b;background:#071c2e;color:#fff;border-radius:50%;width:38px;height:38px;font-size:21px}
.lqQuestProgress{margin:10px 0 14px}.lqQuestProgress>div{height:8px;background:#04131f;border-radius:99px;overflow:hidden}.lqQuestProgress i{display:block;height:100%;background:linear-gradient(90deg,#e84046,#f4c85f);transition:.4s}.lqQuestProgress p{font-size:11px;color:#acc2d1;margin:7px 0 0}
.lqCompass{margin:13px 0;padding:15px;border-radius:19px;background:radial-gradient(circle at 100% 0,#ffd66b3b,transparent 38%),linear-gradient(135deg,#173f60,#0b2841);border:1px solid #f1c7636b;box-shadow:0 12px 28px #0003}.lqCompassTop{display:flex;justify-content:space-between;align-items:center}.lqCompassTop small{font-size:9px;letter-spacing:.16em;color:#f2cd70;font-weight:900}.lqCompassBadge{border-radius:999px;padding:5px 8px;background:#061a2b;color:#79e5ff;font-size:9px;font-weight:900}.lqCompass h3{font:800 19px Georgia,serif;margin:8px 0 4px}.lqCompass p{font-size:10px;color:#b9ccd8;line-height:1.45;margin:0}.lqCompassWhy{display:flex;gap:7px;align-items:center;margin-top:10px;color:#f4d98d;font-size:9px;font-weight:800}
.lqPath{margin:13px 0;padding:14px;border-radius:18px;background:#061c2e;border:1px solid #ffffff18}.lqPathHead{display:flex;justify-content:space-between;align-items:end}.lqPathHead b{font:800 15px Georgia,serif}.lqPathHead small{font-size:9px;color:#8eaabc}.lqPathTrack{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-top:13px;position:relative}.lqPathTrack:before{content:"";position:absolute;left:8%;right:8%;top:14px;height:2px;background:#29465c}.lqPathNode{position:relative;text-align:center;z-index:1}.lqPathNode i{width:29px;height:29px;border-radius:50%;display:grid;place-items:center;margin:auto;background:#0a2a42;border:2px solid #3b5c72;color:#8298a7;font-style:normal;font-size:10px;font-weight:900}.lqPathNode span{display:block;margin-top:6px;font-size:7px;color:#7893a5;font-weight:900}.lqPathNode.done i{background:#153f43;border-color:#67e09a;color:#79eca9}.lqPathNode.current i{background:#5b4519;border-color:#f2ca68;color:#ffe49a;box-shadow:0 0 16px #f2ca6860}.lqPathNode.current span{color:#f2ca68}
.lqAchievements{margin-top:16px}.lqAchievements h3{font:800 17px Georgia,serif;margin:0 0 9px}.lqBadgeGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.lqBadge{min-height:82px;padding:10px 5px;border-radius:14px;text-align:center;background:#071d30;border:1px solid #ffffff14;opacity:.43;filter:saturate(.35)}.lqBadge.earned{opacity:1;filter:none;border-color:#e3bd5c55;background:linear-gradient(180deg,#15354b,#092439)}.lqBadgeIcon{font-size:23px}.lqBadge b{display:block;font-size:8px;margin-top:5px}.lqBadge small{display:block;color:#8fa8b9;font-size:7px;margin-top:3px}.lqBadge.earned small{color:#70dfa0}
.lqStreak{display:inline-flex;align-items:center;gap:5px;margin-left:6px;color:#ffb34e;font-size:9px;font-weight:900}
.lqMission{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;margin:8px 0;padding:12px;border-radius:16px;background:#092a43;border:1px solid #ffffff17}.lqMission.done{border-color:#61df9680;background:linear-gradient(180deg,#0b3a43,#082b3d)}.lqMissionIcon{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#061c2e;font-size:18px}.lqMission b{font-size:12px}.lqMission small{display:block;color:#9eb5c5;font-size:9px;margin-top:3px;line-height:1.35}.lqMissionState{font-size:10px;font-weight:900;color:#f2c966}.lqMission.done .lqMissionState{color:#69e59c}
.lqLesson{margin-top:15px;padding:16px;border-radius:19px;background:radial-gradient(circle at 100% 0,#3b629055,transparent 35%),linear-gradient(180deg,#142f55,#0b2039);border:1px solid #8cadcf55}.lqLessonTag{font-size:9px;letter-spacing:.15em;color:#73e3ff;font-weight:900}.lqLesson h3{font:800 20px Georgia,serif;margin:6px 0}.lqLesson p{font-size:11px;color:#c4d4df;line-height:1.55}.lqTakeaway{padding:10px;border-radius:12px;background:#061827;color:#f3cf78!important}.lqLesson button{width:100%;border:0;border-radius:13px;padding:12px;background:linear-gradient(#f7dc8c,#dba947);font-weight:900;color:#142438}.lqLesson button:disabled{background:#315269;color:#a9c0ce}
`;document.head.appendChild(s)}
 function ensure(){
  styles();let o=document.getElementById("lqQuestOverlay");if(!o){o=document.createElement("div");o.id="lqQuestOverlay";o.className="lqQuestOverlay";o.innerHTML='<div class="lqQuestSheet" role="dialog" aria-modal="true"><div class="lqQuestHead"><div><small>YOUR PATH THIS WEEK</small><h2>Weekly Quest</h2></div><button class="lqQuestClose" aria-label="Close">×</button></div><div class="lqQuestProgress"><div><i></i></div><p></p></div><div class="lqCompass"></div><div class="lqPath"></div><div class="lqMissions"></div><div class="lqLesson"></div><div class="lqAchievements"><h3>Achievements</h3><div class="lqBadgeGrid"></div></div></div>';document.body.appendChild(o);o.addEventListener("click",e=>{if(e.target===o||e.target.closest(".lqQuestClose"))o.classList.remove("on")})}
  let b=document.querySelector(".lqQuestOpen");const card=document.querySelector("#journey .pjCompanionCard");if(card&&!b){b=document.createElement("button");b.className="lqQuestOpen";b.type="button";b.addEventListener("click",open);card.appendChild(b)}
  return {o,b};
 }

 function monthlyNeeds(d){
  const bills=(d.bills||[]).reduce((s,b)=>s+(+b.amount||0),0),e=d.estimatedExpenses||{};
  const estimates=["housing","utilities","transportation","insurance","subscriptions","debt","food","gas","entertainment","other"].reduce((s,k)=>s+(+e[k]||0),0)+(e.additionalBills||[]).reduce((s,b)=>s+(+b.amount||0),0);
  return Math.max(bills,estimates);
 }
 function protectedDays(d){const m=monthlyNeeds(d),saved=+(d.goals?.Emergency?.saved||0);return m>0?Math.floor(saved/(m/30)):0}
 function awarenessStreak(d){
  const days=new Set((d.expenses||[]).map(x=>x.date).filter(Boolean));let cursor=new Date(),count=0;
  if(!days.has(cursor.toISOString().slice(0,10)))cursor.setDate(cursor.getDate()-1);
  while(days.has(cursor.toISOString().slice(0,10))){count++;cursor.setDate(cursor.getDate()-1)}return count;
 }
 function compass(tasks){
  const next=tasks.find(x=>!x.done);return next?{title:next.title,why:next.why,badge:"NEXT BEST MOVE"}:{title:"Protect your momentum",why:"You completed this week’s core habits. Keep your plan visible and enjoy the progress you created.",badge:"WEEK COMPLETE"};
 }
 function pathHTML(d){
  const stages=[["Awareness",1],["Stability",5],["Security",10],["Growth",20],["Freedom",35]],lv=level(d),idx=stageIndex(d),next=stages[idx+1];
  return '<div class="lqPathHead"><b>Path of Progress</b><small>'+(next?(next[1]-lv)+' level'+(next[1]-lv===1?"":"s")+' to '+next[0]:'Freedom form achieved')+'</small></div><div class="lqPathTrack">'+stages.map((x,i)=>'<div class="lqPathNode '+(i<idx?"done":i===idx?"current":"")+'"><i>'+(i<idx?"✓":x[1])+'</i><span>'+x[0].toUpperCase()+'</span></div>').join("")+'</div>';
 }
 function achievementData(d){
  const lessons=JSON.parse(localStorage.getItem("lifesQuestLessons")||"{}"),ledger=d.questLedger||{};
  return [
   {icon:"🧭",name:"Pathfinder",hint:"Financial plan",earned:+d.income?.amount>0},
   {icon:"📜",name:"Planner",hint:"Weekly budget",earned:+d.allowance>0},
   {icon:"🎯",name:"Goal Setter",hint:"First goal",earned:Object.values(d.goals||{}).some(g=>+g.goal>0)},
   {icon:"🌱",name:"First Step",hint:"Started saving",earned:Object.values(d.goals||{}).some(g=>+g.saved>0)},
   {icon:"🛡️",name:"Protected",hint:"7 safe days",earned:protectedDays(d)>=7},
   {icon:"🏆",name:"Quest Keeper",hint:"Weekly quest",earned:Object.keys(ledger).some(k=>k.startsWith("weekly-quest:"))},
   {icon:"📖",name:"Student",hint:"First lesson",earned:Object.keys(lessons).length>0},
   {icon:"🔥",name:"Consistent",hint:"3-day streak",earned:awarenessStreak(d)>=3},
   {icon:"⛰️",name:"Climber",hint:"Reach level 5",earned:level(d)>=5}
  ];
 }
 function completedLesson(id){try{return JSON.parse(localStorage.getItem("lifesQuestLessons")||"{}")[id]}catch(e){return false}}
 function finishLesson(idx){
  const id="stage-"+idx,data=JSON.parse(localStorage.getItem("lifesQuestLessons")||"{}");if(data[id])return;data[id]=Date.now();localStorage.setItem("lifesQuestLessons",JSON.stringify(data));
  window.awardQuestXP?.("lesson",20,id,"Completed a money lesson");window.save?.();window.render?.();render();
 }
 function render(){
  const {o,b}=ensure(),m=metrics(),tasks=[
   {icon:"🧭",title:"Build your weekly plan",why:"Know what is safe to spend before the week begins.",done:m.budget,state:m.budget?"Complete":"Set budget"},
   {icon:"✍️",title:"Check in on 3 days",why:"Awareness builds control without requiring perfection.",done:m.dates>=3,state:Math.min(m.dates,3)+"/3 days"},
   {icon:"🌱",title:"Save toward your future",why:"One intentional deposit keeps your larger goal moving.",done:m.saved,state:m.saved?"Complete":"Not yet"}
  ],done=tasks.filter(x=>x.done).length;
  if(b)b.innerHTML="WEEKLY QUEST <span>"+done+"/3</span>";
  o.querySelector(".lqQuestProgress i").style.width=(done/3*100)+"%";o.querySelector(".lqQuestProgress p").innerHTML=(done===3?"Quest complete — your consistency moved you forward.":"Complete "+(3-done)+" more mission"+(3-done===1?"":"s")+" to earn 40 Quest XP.")+(awarenessStreak(m.d)>0?'<span class="lqStreak">🔥 '+awarenessStreak(m.d)+' day streak</span>':"");
  const guide=compass(tasks);o.querySelector(".lqCompass").innerHTML='<div class="lqCompassTop"><small>JOURNEY COMPASS</small><span class="lqCompassBadge">'+guide.badge+'</span></div><h3>'+guide.title+'</h3><p>'+guide.why+'</p><div class="lqCompassWhy">✦ One focused action is enough to move forward today.</div>';
  o.querySelector(".lqPath").innerHTML=pathHTML(m.d);
  o.querySelector(".lqMissions").innerHTML=tasks.map(x=>'<div class="lqMission '+(x.done?"done":"")+'"><div class="lqMissionIcon">'+x.icon+'</div><div><b>'+x.title+'</b><small>'+x.why+'</small></div><div class="lqMissionState">'+(x.done?"✓ ": "")+x.state+'</div></div>').join("");
  if(done===3){window.awardQuestXP?.("weekly-quest",40,weekKey(),"Weekly quest complete");window.save?.()}
  const idx=stageIndex(m.d),l=LESSONS[idx],id="stage-"+idx,complete=completedLesson(id);
  const lesson=o.querySelector(".lqLesson");lesson.innerHTML='<div class="lqLessonTag">'+l.stage.toUpperCase()+' LESSON</div><h3>'+l.title+'</h3><p>'+l.body+'</p><p class="lqTakeaway">'+l.takeaway+'</p><button '+(complete?"disabled":"")+'>'+(complete?"Lesson complete ✓":"Complete lesson • +20 XP")+'</button>';
  lesson.querySelector("button").onclick=()=>finishLesson(idx);
  o.querySelector(".lqBadgeGrid").innerHTML=achievementData(m.d).map(a=>'<div class="lqBadge '+(a.earned?"earned":"")+'"><div class="lqBadgeIcon">'+(a.earned?a.icon:"🔒")+'</div><b>'+a.name+'</b><small>'+(a.earned?"Earned":a.hint)+'</small></div>').join("");
 }
 function open(){render();document.getElementById("lqQuestOverlay").classList.add("on")}
 function boot(){render()}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();window.addEventListener("pageshow",boot);setInterval(render,2500);
})();