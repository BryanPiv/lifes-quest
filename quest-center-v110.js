(function(){
 const VOICES={
  cloud:{name:"Nimbus",row:0,personality:"CALM GUIDE",lines:{plan:"Let’s give your money a clear direction. Set the weekly plan, then the rest of the path becomes easier to see.",check:"No judgment—just awareness. Three quick check-ins will show us the pattern hiding in the clouds.",save:"Even a small deposit moves your future closer. Choose an amount that feels sustainable.",complete:"You completed the week’s core path. Pause and notice what consistency feels like.",why:"Clarity creates choices, and choices create freedom.",encourage:"We do not need a perfect week. We only need the next honest step."}},
  fire:{name:"Ember",row:1,personality:"BRAVE MOTIVATOR",lines:{plan:"Let’s light the path! Build your weekly plan so every dollar has a mission.",check:"Quick check-in time! Seeing your spending gives you the power to change it.",save:"Feed the future flame—even a small savings deposit keeps it growing.",complete:"You did it! This week’s habits are turning into real momentum.",why:"Small actions become powerful when you keep showing up.",encourage:"You have already started. Let’s take one more brave step together!"}},
  water:{name:"Aurora",row:2,personality:"GENTLE COACH",lines:{plan:"Let’s create a plan that flows naturally with your real life, not against it.",check:"Simply notice what happened today. Awareness can be gentle and still create change.",save:"A steady stream fills the largest reservoir. Add what feels comfortable this week.",complete:"Beautiful work. Your plan, awareness, and savings are flowing together.",why:"Flexible habits are easier to continue when life changes.",encourage:"Progress can be calm. You are allowed to move at a pace you can maintain."}},
  lightning:{name:"Volt",row:3,personality:"ACTION COACH",lines:{plan:"Power up the week! Set the plan now and make every decision faster.",check:"Three fast check-ins—that’s all we need to spot where your energy is going.",save:"Send one charge toward your future goal. Small, quick, done!",complete:"Full charge! You completed every core mission for the week.",why:"A clear action today removes uncertainty from tomorrow.",encourage:"Pick the smallest useful move and do it now. Momentum will handle the rest."}},
  shadow:{name:"Nightfall",row:4,personality:"WISE PROTECTOR",lines:{plan:"A quiet plan protects you from decisions made under pressure. Let’s build yours.",check:"Look without judgment. What we can see clearly no longer controls us from the shadows.",save:"Set something aside for the future you cannot see yet. That is how security begins.",complete:"The week is complete. Your unseen daily choices are becoming visible strength.",why:"Preparation transforms uncertainty into confidence.",encourage:"You do not have to solve everything tonight. Protect one small piece of tomorrow."}}
 };
 let dialogueMode="next";
 const LESSONS=[
  {stage:"Awareness",title:"Give every dollar a name",body:"Tracking is not about guilt. It turns invisible habits into choices you can control.",takeaway:"Know where it went before deciding where it goes next."},
  {stage:"Stability",title:"Build breathing room",body:"A weekly plan protects bills and savings before everyday spending begins.",takeaway:"A budget is permission to spend with confidence."},
  {stage:"Security",title:"Buy back your time",body:"An emergency fund measures how many days your life can continue without new income.",takeaway:"Start with one protected day, then build toward 90."},
  {stage:"Growth",title:"Make progress automatic",body:"Consistent contributions matter more than waiting for the perfect time or perfect amount.",takeaway:"Small automatic deposits can become powerful over time."},
  {stage:"Freedom",title:"Money creates choices",body:"Financial freedom is not only a number. It is the ability to make decisions without immediate financial pressure.",takeaway:"Build wealth around the life you actually want."}
 ];
 const read=()=>{try{return JSON.parse(localStorage.getItem("lifesQuestWeb")||"{}")}catch(e){return {}}};
 const localDay=(date=new Date())=>date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
 const weekStart=()=>{const n=new Date(),d=new Date(n.getFullYear(),n.getMonth(),n.getDate()),day=d.getDay()||7;d.setDate(d.getDate()-day+1);return d};
 const weekKey=()=>localDay(weekStart());
 const rhythmRead=()=>{try{return JSON.parse(localStorage.getItem("lifesQuestDailyRhythm")||"{}")}catch(e){return {}}};
 const rhythmWrite=value=>localStorage.setItem("lifesQuestDailyRhythm",JSON.stringify(value));
 const SAVINGS_INSIGHTS=[
  {title:"Savings buys breathing room",body:"Even a small cushion gives you time to think before turning an unexpected bill into debt."},
  {title:"Consistency beats intensity",body:"A smaller amount saved every week usually builds more security than waiting for a perfect month."},
  {title:"Pay yourself first",body:"Savings grows more reliably when it is treated like a bill owed to your future self."},
  {title:"Emergency funds protect choices",body:"Cash reserves help you solve a problem without sacrificing a goal or relying immediately on credit."},
  {title:"A goal gives money direction",body:"Savings becomes easier to protect when every dollar is connected to something meaningful."},
  {title:"Small gaps become large gains",body:"Finding one repeat expense to reduce can create a permanent stream of money toward your future."},
  {title:"Automation removes friction",body:"An automatic transfer makes progress before daily decisions have a chance to compete with it."},
  {title:"Progress creates confidence",body:"Watching your reserve grow changes how financial surprises feel, even before the goal is complete."},
  {title:"Saving is future flexibility",body:"Money set aside is not unused—it is purchasing options for the person you will be later."},
  {title:"Protect the first milestone",body:"Your first $500 can prevent a common surprise from becoming a long-term balance."},
  {title:"Build in layers",body:"Start with one protected week, then one month, and eventually several months of essential expenses."},
  {title:"Raise savings with income",body:"Directing part of every raise toward savings improves your future without reducing today’s lifestyle."},
  {title:"Separate goals reduce temptation",body:"Dedicated balances for emergencies, travel, and major purchases make each goal easier to understand."},
  {title:"A budget makes saving possible",body:"Knowing what is safe to spend turns saving from a hope into a repeatable decision."},
  {title:"Your reserve protects your time",body:"Savings can give you space to change jobs, handle illness, or help family without immediate panic."},
  {title:"Every deposit is a vote",body:"Each amount saved is a vote for more stability, more freedom, and more control over your future."}
 ];
 const weeklyInsight=()=>{const start=weekStart(),weekNumber=Math.floor(start.getTime()/604800000);return SAVINGS_INSIGHTS[Math.abs(weekNumber)%SAVINGS_INSIGHTS.length]};
 const level=d=>Math.max(1,Math.floor(+(d.companionProgress?.[d.type]||0)/100)+1,+d.level||1);
 const stageIndex=d=>{const l=level(d);return l>=35?4:l>=20?3:l>=10?2:l>=5?1:0};
 function metrics(){
  const d=read(),start=weekStart(),end=new Date(start);end.setDate(end.getDate()+7);
  const rhythm=rhythmRead(),todayKey=localDay(),today={...(rhythm[todayKey]||{})};
  const hasExpense=(d.expenses||[]).some(x=>x.date===todayKey),hasNoSpend=!!d.questLedger?.["no-spend:"+todayKey];
  if(hasExpense||hasNoSpend)today.awareness=true;
  const weeklyDays=Object.entries(rhythm).filter(([day,state])=>{const when=new Date(day+"T12:00:00");return when>=start&&when<end&&state?.completed}).length;
  return {d,rhythm,todayKey,today,weeklyDays,insight:weeklyInsight()};
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
.lqVoice{margin:13px 0;padding:14px;border-radius:19px;background:linear-gradient(145deg,#0e304b,#071e31);border:1px solid #71d9f344}.lqVoiceTop{display:grid;grid-template-columns:62px 1fr;gap:12px;align-items:center}.lqVoiceAvatar{width:62px;height:62px;border-radius:17px;background-image:url("assets/characters/evolution-atlas-v105.png?v=105");background-size:500% 500%;background-repeat:no-repeat;background-color:#071a2a;border:1px solid #ffffff25;box-shadow:0 8px 20px #0005}.lqVoiceMeta small{font-size:8px;letter-spacing:.14em;color:#77e5ff;font-weight:900}.lqVoiceMeta b{display:block;font:800 19px Georgia,serif;color:#f4cf71;margin-top:2px}.lqSpeech{position:relative;margin:12px 0 10px;padding:12px 13px;border-radius:14px;background:#061725;color:#d9e6ee;font:italic 11px/1.55 Georgia,serif}.lqSpeech:before{content:"";position:absolute;top:-7px;left:24px;width:14px;height:14px;background:#061725;transform:rotate(45deg)}.lqTalkActions{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.lqTalkActions button{border:1px solid #ffffff21;border-radius:11px;padding:9px 4px;background:#0a2940;color:#bcd0dc;font-size:8px;font-weight:900}.lqTalkActions button.on{border-color:#f1c7638a;background:#423717;color:#f6d77f}
.lqMission{display:grid;grid-template-columns:38px 1fr auto;align-items:center;gap:10px;margin:8px 0;padding:12px;border-radius:16px;background:#092a43;border:1px solid #ffffff17}.lqMission.done{border-color:#61df9680;background:linear-gradient(180deg,#0b3a43,#082b3d)}.lqMissionIcon{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#061c2e;font-size:18px}.lqMission b{font-size:12px}.lqMission small{display:block;color:#9eb5c5;font-size:9px;margin-top:3px;line-height:1.35}.lqMissionState{font-size:10px;font-weight:900;color:#f2c966}.lqMission.done .lqMissionState{color:#69e59c}.lqMissionAction{border:1px solid #f1c76388;border-radius:9px;padding:7px 8px;background:#4a3a16;color:#f5d474;font-size:7px;font-weight:900}.lqDailyCheck{display:none;margin:10px 0;padding:14px;border-radius:18px;background:#061827;border:1px solid #68dff05c}.lqDailyCheck.on{display:block}.lqDailyCheck h3{font:800 19px Georgia,serif;margin:0 0 3px}.lqDailyCheck>p{font-size:9px;color:#a9bfcc;margin:0 0 11px}.lqDailyTask{margin:8px 0;padding:11px;border-radius:15px;background:#092a43;border:1px solid #ffffff18}.lqDailyTask.done{border-color:#61df9670;background:#0a383e}.lqDailyTaskHead{display:flex;gap:8px;align-items:center}.lqDailyTaskIcon{width:31px;height:31px;border-radius:10px;display:grid;place-items:center;background:#061827}.lqDailyTaskHead b{font-size:11px}.lqDailyTaskHead small{display:block;color:#8faabd;font-size:8px;margin-top:2px}.lqDailyTask.done .lqDailyTaskHead small{color:#70e6a1}.lqDailyCats{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:9px}.lqDailyCats button,.lqDailyDone,.lqNoSpend{border:1px solid #ffffff21;border-radius:10px;padding:9px 3px;background:#0a2940;color:#fff;font-size:8px;font-weight:900}.lqNoSpend,.lqDailyDone{width:100%;margin-top:7px;border-color:#65df9780;background:#103c39;color:#7ce9aa}.lqInsightCopy{margin:9px 0 0;padding:10px;border-radius:11px;background:#061827;color:#c8d9e3;font:italic 10px/1.5 Georgia,serif}.lqDailyReward{margin-top:10px;padding:10px;border-radius:13px;text-align:center;background:linear-gradient(135deg,#503d16,#183846);color:#f4d476;font-size:9px;font-weight:900}.lqWeekDots{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px}.lqWeekDot{text-align:center;font-size:7px;color:#7892a4}.lqWeekDot i{display:grid;place-items:center;width:25px;height:25px;margin:0 auto 3px;border-radius:50%;background:#061827;border:1px solid #29485e;font-style:normal}.lqWeekDot.done i{background:#175044;border-color:#69e39b;color:#8af0b2}.lqWeekDot.today i{border-color:#f2ca67;color:#f2ca67}
.lqLesson{margin-top:15px;padding:16px;border-radius:19px;background:radial-gradient(circle at 100% 0,#3b629055,transparent 35%),linear-gradient(180deg,#142f55,#0b2039);border:1px solid #8cadcf55}.lqLessonTag{font-size:9px;letter-spacing:.15em;color:#73e3ff;font-weight:900}.lqLesson h3{font:800 20px Georgia,serif;margin:6px 0}.lqLesson p{font-size:11px;color:#c4d4df;line-height:1.55}.lqTakeaway{padding:10px;border-radius:12px;background:#061827;color:#f3cf78!important}.lqLesson button{width:100%;border:0;border-radius:13px;padding:12px;background:linear-gradient(#f7dc8c,#dba947);font-weight:900;color:#142438}.lqLesson button:disabled{background:#315269;color:#a9c0ce}
`;document.head.appendChild(s)}
 function ensure(){
  styles();let o=document.getElementById("lqQuestOverlay");if(!o){o=document.createElement("div");o.id="lqQuestOverlay";o.className="lqQuestOverlay";o.innerHTML='<div class="lqQuestSheet" role="dialog" aria-modal="true"><div class="lqQuestHead"><div><small>YOUR PATH THIS WEEK</small><h2>Weekly Quest</h2></div><button class="lqQuestClose" aria-label="Close">×</button></div><div class="lqQuestProgress"><div><i></i></div><p></p></div><div class="lqCompass"></div><div class="lqVoice"></div><div class="lqPath"></div><div class="lqMissions"></div><div class="lqDailyCheck"></div><div class="lqLesson"></div><div class="lqAchievements"><h3>Achievements</h3><div class="lqBadgeGrid"></div></div></div>';document.body.appendChild(o);o.addEventListener("click",e=>{if(e.target===o||e.target.closest(".lqQuestClose"))o.classList.remove("on")})}
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
 function voiceLine(d,tasks,mode){
  const v=VOICES[d.type]||VOICES.fire,next=tasks.find(x=>!x.done),key=!next?"complete":next.title.includes("weekly plan")?"plan":next.title.includes("Check")?"check":"save";
  if(mode==="why")return v.lines.why+" "+(next?next.why:"Your completed habits are evidence that your system is working.");
  if(mode==="encourage")return v.lines.encourage;
  return v.lines[key];
 }
 function voiceHTML(d,tasks){
  const v=VOICES[d.type]||VOICES.fire,col=stageIndex(d),line=voiceLine(d,tasks,dialogueMode);
  return '<div class="lqVoiceTop"><div class="lqVoiceAvatar" style="background-position:'+(col*25)+'% '+(v.row*25)+'%"></div><div class="lqVoiceMeta"><small>'+v.personality+'</small><b>Talk to '+v.name+'</b></div></div><div class="lqSpeech">“'+line+'”</div><div class="lqTalkActions"><button data-talk="next" class="'+(dialogueMode==="next"?"on":"")+'">WHAT NEXT?</button><button data-talk="why" class="'+(dialogueMode==="why"?"on":"")+'">WHY IT MATTERS</button><button data-talk="encourage" class="'+(dialogueMode==="encourage"?"on":"")+'">ENCOURAGE ME</button></div>';
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
 function saveRhythm(day,state){
  const all=rhythmRead();all[day]=state;rhythmWrite(all);
 }
 function maybeCompleteDaily(day){
  const all=rhythmRead(),state=all[day]||{};
  if(state.awareness&&state.budget&&state.insight&&!state.completed){
    state.completed=true;state.completedAt=Date.now();all[day]=state;rhythmWrite(all);
    window.awardQuestXP?.("daily-checkin",5,day,"Completed all 3 daily check-ins");window.LQCosmetics?.grantTokens?.(3,"daily-checkin:"+day,"Daily check-in complete");window.save?.();window.render?.();
  }
  const start=weekStart(),end=new Date(start);end.setDate(end.getDate()+7);
  const count=Object.entries(all).filter(([key,value])=>{const when=new Date(key+"T12:00:00");return when>=start&&when<end&&value?.completed}).length;
  if(count>=5){window.awardQuestXP?.("weekly-consistency",40,weekKey(),"Completed 5 of 7 daily check-ins");window.LQCosmetics?.grantTokens?.(20,"weekly-consistency:"+weekKey(),"Five-day weekly streak");window.save?.();window.render?.()}
 }
 function markDaily(part){
  const day=localDay(),all=rhythmRead(),state={...(all[day]||{})};state[part]=true;all[day]=state;rhythmWrite(all);maybeCompleteDaily(day);render();showDaily();
 }
 function recordAwareness(day=localDay()){
  const all=rhythmRead(),state={...(all[day]||{})};state.awareness=true;all[day]=state;rhythmWrite(all);maybeCompleteDaily(day);
 }
 function weekDots(m){
  const labels=["M","T","W","T","F","S","S"],start=weekStart(),all=rhythmRead();
  return '<div class="lqWeekDots">'+labels.map((label,i)=>{const date=new Date(start);date.setDate(start.getDate()+i);const key=localDay(date),done=!!all[key]?.completed;return '<div class="lqWeekDot '+(done?"done ":"")+(key===m.todayKey?"today":"")+'"><i>'+(done?"✓":i+1)+'</i>'+label+'</div>'}).join("")+'</div>';
 }
 function showDaily(){
  const {o}=ensure(),box=o.querySelector(".lqDailyCheck"),m=metrics(),state=m.today,remaining=m.d.allowance>0?Math.max(0,m.d.allowance-(m.d.expenses||[]).filter(x=>{const when=new Date((x.date||"")+"T12:00:00");return when>=weekStart()}).reduce((sum,x)=>sum+(+x.amount||0),0)):0;
  const awareness=state.awareness?'<button class="lqDailyDone" disabled>MONEY CHECK COMPLETE ✓</button>':'<div class="lqDailyCats"><button data-cat="Food">🍴 FOOD</button><button data-cat="Gas">⛽ GAS</button><button data-cat="Entertainment">🎮 FUN</button><button data-cat="Misc">🛒 MISC</button></div><button class="lqNoSpend" data-no-spend>✓ NO-SPEND DAY</button>';
  box.innerHTML='<h3>Today’s 3-Step Check-In</h3><p>Complete all three small actions to earn +5 Quest XP today.</p>'+
   '<div class="lqDailyTask '+(state.awareness?"done":"")+'"><div class="lqDailyTaskHead"><span class="lqDailyTaskIcon">✍️</span><div><b>1. Money awareness</b><small>'+(state.awareness?"Complete":"Log spending or confirm a no-spend day")+'</small></div></div>'+awareness+'</div>'+
   '<div class="lqDailyTask '+(state.budget?"done":"")+'"><div class="lqDailyTaskHead"><span class="lqDailyTaskIcon">📊</span><div><b>2. Review your weekly budget</b><small>'+(m.d.allowance>0?"$"+remaining.toFixed(0)+" currently available":"No weekly budget has been set")+'</small></div></div>'+(state.budget?'<button class="lqDailyDone" disabled>BUDGET REVIEWED ✓</button>':'<button class="lqDailyDone" data-review-budget>I REVIEWED MY BUDGET</button>')+'</div>'+
   '<div class="lqDailyTask '+(state.insight?"done":"")+'"><div class="lqDailyTaskHead"><span class="lqDailyTaskIcon">🌱</span><div><b>3. This week’s savings insight</b><small>'+m.insight.title+'</small></div></div><div class="lqInsightCopy">'+m.insight.body+'</div>'+(state.insight?'<button class="lqDailyDone" disabled>INSIGHT COMPLETE ✓</button>':'<button class="lqDailyDone" data-read-insight>I UNDERSTAND WHY THIS MATTERS</button>')+'</div>'+
   '<div class="lqDailyReward">'+(state.completed?"TODAY COMPLETE · +5 XP EARNED":"FINISH "+(3-[state.awareness,state.budget,state.insight].filter(Boolean).length)+" MORE TO EARN +5 XP")+'</div>'+weekDots(m);
  box.classList.add("on");box.scrollIntoView({behavior:"smooth",block:"center"});
  box.querySelectorAll("[data-cat]").forEach(btn=>btn.onclick=()=>{o.classList.remove("on");box.classList.remove("on");window.quickAdd?.(btn.dataset.cat)});
  box.querySelector("[data-no-spend]")?.addEventListener("click",()=>{const day=localDay();recordAwareness(day);render();showDaily()});
  box.querySelector("[data-review-budget]")?.addEventListener("click",()=>markDaily("budget"));
  box.querySelector("[data-read-insight]")?.addEventListener("click",()=>markDaily("insight"));
 }
 function handleMission(){showDaily()}
 function render(){
  const {o,b}=ensure(),m=metrics(),tasks=[
   {icon:"✍️",action:"daily",cta:"CHECK IN",title:"Money awareness",why:"Log spending or intentionally record a no-spend day.",done:!!m.today.awareness,state:m.today.awareness?"Complete":"Not yet"},
   {icon:"📊",action:"daily",cta:"REVIEW",title:"Budget pulse",why:"Look at what remains before making the next spending decision.",done:!!m.today.budget,state:m.today.budget?"Complete":"Not yet"},
   {icon:"🌱",action:"daily",cta:"READ",title:"Savings insight",why:m.insight.title,done:!!m.today.insight,state:m.today.insight?"Complete":"Not yet"}
  ],done=tasks.filter(x=>x.done).length;
  if(b)b.innerHTML="DAILY CHECK-IN · "+m.weeklyDays+"/5 DAYS <span>"+done+"/3</span>";
  o.querySelector(".lqQuestProgress i").style.width=(done/3*100)+"%";
  o.querySelector(".lqQuestProgress p").innerHTML=(m.today.completed?"Today complete — +5 Quest XP earned.":"Complete "+(3-done)+" more daily action"+(3-done===1?"":"s")+" for +5 XP.")+'<span class="lqStreak">🏆 '+m.weeklyDays+'/5 toward +40 weekly XP</span>';
  const guide=compass(tasks);o.querySelector(".lqCompass").innerHTML='<div class="lqCompassTop"><small>THIS WEEK’S SAVINGS IDEA</small><span class="lqCompassBadge">'+(m.weeklyDays>=5?"BONUS EARNED":"5 OF 7 DAYS")+'</span></div><h3>'+m.insight.title+'</h3><p>'+m.insight.body+'</p><div class="lqCompassWhy">✦ A new savings insight appears every Monday.</div>'+weekDots(m);
  const voice=o.querySelector(".lqVoice");voice.innerHTML=voiceHTML(m.d,tasks);voice.querySelectorAll("[data-talk]").forEach(btn=>btn.onclick=()=>{dialogueMode=btn.dataset.talk;if(navigator.vibrate)navigator.vibrate(12);render()});
  o.querySelector(".lqPath").innerHTML=pathHTML(m.d);
  o.querySelector(".lqMissions").innerHTML=tasks.map(x=>'<div class="lqMission '+(x.done?"done":"")+'"><div class="lqMissionIcon">'+x.icon+'</div><div><b>'+x.title+'</b><small>'+x.why+'</small></div>'+(x.done?'<div class="lqMissionState">✓</div>':'<button class="lqMissionAction" data-mission="'+x.action+'">'+x.cta+'</button>')+'</div>').join("");
  o.querySelectorAll("[data-mission]").forEach(btn=>btn.onclick=showDaily);
  if(m.weeklyDays>=5){window.awardQuestXP?.("weekly-consistency",40,weekKey(),"Completed 5 of 7 daily check-ins");window.LQCosmetics?.grantTokens?.(20,"weekly-consistency:"+weekKey(),"Five-day weekly streak");window.save?.()}
  const idx=stageIndex(m.d),l=LESSONS[idx],id="stage-"+idx,complete=completedLesson(id);
  const lesson=o.querySelector(".lqLesson");lesson.innerHTML='<div class="lqLessonTag">'+l.stage.toUpperCase()+' LESSON</div><h3>'+l.title+'</h3><p>'+l.body+'</p><p class="lqTakeaway">'+l.takeaway+'</p><button '+(complete?"disabled":"")+'>'+(complete?"Lesson complete ✓":"Complete lesson • +20 XP")+'</button>';
  lesson.querySelector("button").onclick=()=>finishLesson(idx);
  o.querySelector(".lqBadgeGrid").innerHTML=achievementData(m.d).map(a=>'<div class="lqBadge '+(a.earned?"earned":"")+'"><div class="lqBadgeIcon">'+(a.earned?a.icon:"🔒")+'</div><b>'+a.name+'</b><small>'+(a.earned?"Earned":a.hint)+'</small></div>').join("");
 }
 function open(){render();document.getElementById("lqQuestOverlay").classList.add("on")}
 window.LQQuestCenter={open,render,showDaily,recordAwareness};
 function boot(){render()}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();window.addEventListener("pageshow",boot);setInterval(render,2500);
})();