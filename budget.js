'use strict';
const KEY='lifesQuestSimpleBudgetV1';
const $=id=>document.getElementById(id);
const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number.isFinite(value)?value:0);
const positive=value=>Math.max(0,Number(value)||0);
const presets={
  Home:['Rent / mortgage','Electricity','Water','Internet / phone'],
  Transportation:['Car payment','Car insurance','Parking / transit'],
  Other:['Debt payments','Subscriptions','Healthcare out of pocket','Personal care']
};
const allPresets=Object.values(presets).flat();
const trackedNames=new Set(['Groceries','Gas','Food','Dining out','Entertainment','Other spending','Fun','Misc']);
const categories=['Gas','Food','Fun','Misc'];
const defaultExpenses=()=>allPresets.map(name=>({name,amount:0}));
let data;
let page='plan';
let breakdownView='period';
let purchaseQuery='';
let breakdownMonth=localDate().slice(0,7);
let calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);
let selectedDay=new Date().getDate();
function migrate(){
  try{
    const old=JSON.parse(localStorage.getItem('lifesQuestWeb')||'null');
    if(!old)return null;
    const e=old.estimatedExpenses||{};
    const expenses=[['Rent / mortgage',e.housing],['Car payment',e.car],['Car insurance',e.insurance],['Electricity',e.utilities],['Debt payments',e.debt],['Subscriptions',e.subscriptions],['Groceries',e.food],['Gas',e.gas],['Entertainment',e.entertainment],['Other spending',e.other],...(e.additionalBills||[]).map(b=>[b.name,b.amount])]
      .filter(([,amount])=>positive(amount)>0).map(([name,amount])=>({name,amount:positive(amount)}));
    const trip=(old.plan?.goals||[]).find(g=>/vacation|trip/i.test((g.type||'')+' '+(g.name||'')))||{};
    const frequency=old.income?.frequency==='biweekly'?'biweekly':'weekly';
    return {pay:positive(old.income?.amount),frequency,expenses,retirement401k:0,healthcarePayroll:positive(old.income?.healthcare),ira:0,contributionsPerPaycheck:true,tripName:trip.name||'',tripDate:trip.date||'',tripCost:positive(trip.amount),tripSaved:positive(trip.saved)};
  }catch{return null}
}
const BACKUP_KEY=KEY+':backups';
function parseBudget(raw){
  try{const value=JSON.parse(raw||'null');return value&&typeof value==='object'&&!Array.isArray(value)&&Array.isArray(value.expenses)?value:null}catch{return null}
}
function readBackups(){try{const entries=JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]');return Array.isArray(entries)?entries.filter(b=>parseBudget(b.raw)):[]}catch{return []}}
function hasBudget(value){return !!value&&(positive(value.pay)>0||(value.expenses||[]).some(e=>positive(e.amount)>0)||(value.transactions||[]).length>0||(value.savingsDeposits||[]).length>0||positive(value.tripSaved)>0||positive(value.emergencySaved)>0||positive(value.customGoalSaved)>0)}
function snapshot(raw){
  if(!hasBudget(parseBudget(raw)))return;
  const backups=readBackups();if(backups[0]?.raw===raw)return;
  const now=Date.now();
  // Keep recent saves plus daily checkpoints, rather than only a few keystrokes.
  const recent=backups.filter(b=>now-b.at<86400000).slice(0,19);
  const daily=[];const days=new Set();
  for(const b of backups){const day=new Date(b.at).toISOString().slice(0,10);if(now-b.at>=86400000&&!days.has(day)){days.add(day);daily.push(b)}}
  localStorage.setItem(BACKUP_KEY,JSON.stringify([{at:now,raw},...recent,...daily.slice(0,30)]));
}
const originalRaw=localStorage.getItem(KEY);
data=parseBudget(originalRaw);
let recoveredAtStartup=false;
if(!data&&originalRaw){const backup=readBackups().find(b=>hasBudget(parseBudget(b.raw)));if(backup){data=parseBudget(backup.raw);recoveredAtStartup=true}}
if(!data)data=migrate();
try{snapshot(originalRaw)}catch{}

data=data||{pay:0,frequency:'weekly',expenses:defaultExpenses(),retirement401k:0,healthcarePayroll:0,ira:0,contributionsPerPaycheck:true,tripName:'',tripDate:'',tripCost:0,tripSaved:0};
// Earlier CloudStash versions stored these three entries as monthly amounts.
// Convert once, preserving their effective paycheck values for existing users.
if(!data.contributionsPerPaycheck){
  const periods=data.frequency==='biweekly'?26:52;
  for(const id of ['retirement401k','healthcarePayroll','ira'])data[id]=Math.round(positive(data[id])*1200/periods)/100;
  data.contributionsPerPaycheck=true;
  try{snapshot(localStorage.getItem(KEY))}catch{}
  localStorage.setItem(KEY,JSON.stringify(data));
}
if(!Array.isArray(data.expenses))data.expenses=[];
if(!Array.isArray(data.transactions))data.transactions=[];
if(!Array.isArray(data.savingsDeposits))data.savingsDeposits=[];
// Keep custom and imported expenses, and add each missing preset without copying an amount.
for(const name of allPresets){if(!data.expenses.some(x=>x.name===name))data.expenses.push({name,amount:0})}
const save=()=>{
  const raw=JSON.stringify(data);
  try{snapshot(localStorage.getItem(KEY))}catch{}
  try{localStorage.setItem(KEY,raw);$('storageNotice').hidden=true}catch{
    $('storageNotice').hidden=false;$('storageNotice').textContent='Your changes could not be saved on this device. Download a backup from Saved data before closing the app.';
  }
};
function openPage(target){
  if(!['plan','expenses','goals','breakdown','calendar'].includes(target))return;
  page=target;
  document.querySelectorAll('.page').forEach(el=>{el.hidden=el.id!==target;el.classList.toggle('active',el.id===target)});
  document.querySelectorAll('.tabs button').forEach(button=>{
    const selected=button.dataset.page===target;
    button.classList.toggle('active',selected);
    if(selected)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  window.scrollTo({top:0,behavior:'instant'});
}
document.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>openPage(button.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(button=>button.addEventListener('click',()=>openPage(button.dataset.goto)));
for(const id of ['pay','grossPay','retirement401k','retirement401kMatchRate','retirement401kMatchCap','healthcarePayroll','ira','iraMatchRate','iraMatchCap','tripName','tripDate','tripCost','tripSaved','emergencySaved','customGoalName','customGoalTarget','customGoalSaved']){
  $(id).value=data[id]||'';
  $(id).addEventListener('input',()=>{data[id]=['tripName','tripDate','customGoalName'].includes(id)?$(id).value:positive($(id).value);save();render()});
}
for(const key of ['retirement401k','ira']){
  data[key+'Mode']=data[key+'Mode']||(positive(data[key])>0?'amount':'percent');
  $(key+'Mode').value=data[key+'Mode'];
  $(key+'Mode').addEventListener('change',()=>{data[key+'Mode']=$(key+'Mode').value;data[key]=0;$(key).value='';save();render()});
}
$('breakdownMonth').value=breakdownMonth;
$('breakdownView').addEventListener('change',()=>{breakdownView=$('breakdownView').value;render()});
$('breakdownMonth').addEventListener('input',()=>{breakdownMonth=$('breakdownMonth').value||localDate().slice(0,7);render()});
$('purchaseSearch').addEventListener('input',()=>{purchaseQuery=$('purchaseSearch').value.trim().toLowerCase();render()});
function contribution(key){
  const gross=positive(data.grossPay),percent=data[key+'Mode']==='percent';
  const employee=percent?gross*Math.min(100,positive(data[key]))/100:positive(data[key]);
  const employer=Math.min(employee,gross*Math.min(100,positive(data[key+'MatchCap']))/100)*Math.min(100,positive(data[key+'MatchRate']))/100;
  return {employee,employer,needsGross:!gross&&(percent||positive(data[key+'MatchRate'])>0)};
}
$('frequency').value=data.frequency;
$('frequency').addEventListener('change',()=>{data.frequency=$('frequency').value;save();render()});
$('payday').value=data.payday||'';$('payday').max=localDate();
$('payday').addEventListener('change',()=>{data.payday=$('payday').value;save();render()});
function expenseRow(item){
  const row=document.createElement('div');row.className='expense-item';
  const name=document.createElement('input');name.className='name';name.value=item.name||'';name.placeholder='Expense name';name.setAttribute('aria-label','Expense name');
  if(allPresets.includes(item.name))name.readOnly=true;
  else name.addEventListener('input',()=>{item.name=name.value;save()});
  const amount=document.createElement('input');amount.type='number';amount.min='0';amount.step='0.01';amount.inputMode='decimal';amount.placeholder='0.00';amount.value=item.amount||'';amount.setAttribute('aria-label',(item.name||'Expense')+' monthly amount');
  amount.addEventListener('input',()=>{item.amount=positive(amount.value);save();render()});
  const due=document.createElement('select');due.setAttribute('aria-label',(item.name||'Expense')+' due day');
  const blank=document.createElement('option');blank.value='';blank.textContent='Day';due.append(blank);
  for(let day=1;day<=31;day++){const option=document.createElement('option');option.value=String(day);option.textContent=String(day);due.append(option)}
  due.value=item.dueDay?String(item.dueDay):'';
  due.addEventListener('change',()=>{item.dueDay=due.value?Number(due.value):null;save();render()});
  const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='×';remove.setAttribute('aria-label','Remove '+(item.name||'expense'));
  remove.addEventListener('click',()=>{data.expenses.splice(data.expenses.indexOf(item),1);save();renderExpenses();render()});
  if(allPresets.includes(item.name)){remove.disabled=true;remove.style.visibility='hidden'}
  row.append(name,amount,due,remove);return row;
}
function renderExpenses(){
  const root=$('expenseGroups');
  const openGroups=new Set([...root.querySelectorAll('details[open]')].map(x=>x.dataset.group));
  root.replaceChildren();
  const custom=data.expenses.filter(item=>!allPresets.includes(item.name)&&!trackedNames.has(item.name));
  const groups=[...Object.entries(presets).map(([name,names])=>[name,data.expenses.filter(item=>names.includes(item.name))]),['Added by you',custom]];
  for(const [name,items] of groups){
    if(!items.length)continue;
    const details=document.createElement('details');details.className='expense-group';details.dataset.group=name;
    details.open=openGroups.size?openGroups.has(name):name==='Home';
    const summary=document.createElement('summary');const title=document.createElement('span');title.textContent=name;
    const subtotal=document.createElement('small');subtotal.textContent=money(items.reduce((total,item)=>total+positive(item.amount),0))+'/mo';
    summary.append(title,subtotal);const content=document.createElement('div');content.className='expense-items';items.forEach(item=>content.append(expenseRow(item)));
    details.append(summary,content);root.append(details);
  }
}
$('add').addEventListener('click',()=>{const item={name:'',amount:0};data.expenses.push(item);save();renderExpenses();const custom=[...document.querySelectorAll('.expense-group')].find(el=>el.dataset.group==='Added by you');if(custom){custom.open=true;custom.querySelector('.expense-item:last-child .name')?.focus()}});
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
$('quickDate').value=localDate();$('quickDate').max=localDate();
document.querySelectorAll('[data-quick]').forEach(button=>button.addEventListener('click',()=>{
  const amount=positive($('quickAmount').value),date=$('quickDate').value,name=$('quickName').value.trim();
  if(!amount){$('quickFeedback').textContent='Enter an amount first.';$('quickAmount').focus();return}
  if(!date||date>localDate()){$('quickFeedback').textContent='Choose today or an earlier date.';return}
  const category=button.dataset.quick;
  data.transactions.unshift({id:Date.now()+'-'+Math.random().toString(36).slice(2),category,amount,date,name});
  data.trackingStart=data.trackingStart||localDate();save();$('quickAmount').value='';$('quickName').value='';$('quickDate').value=localDate();
  $('quickFeedback').textContent=`Added ${name?name+' · ':''}${money(amount)} to ${category}.`;render();$('quickAmount').focus();
}));
function savedFor(goal){return data.savingsDeposits.filter(d=>d.goal===goal).reduce((sum,d)=>sum+positive(d.amount),0)}
$('savingsDate').value=localDate();$('savingsDate').max=localDate();
$('savingsDepositForm').addEventListener('submit',event=>{
  event.preventDefault();
  const amount=positive($('savingsAmount').value),date=$('savingsDate').value,goal=$('savingsGoal').value;
  if(!amount||!date||date>localDate()){$('savingsFeedback').textContent='Enter an amount and choose today or an earlier date.';return}
  if(goal==='custom'&&(!data.customGoalName?.trim()||!positive(data.customGoalTarget))){$('savingsFeedback').textContent='Give your other goal a name and target first.';return}
  data.savingsDeposits.unshift({id:Date.now()+'-'+Math.random().toString(36).slice(2),goal,amount,date,note:$('savingsNote').value.trim()});
  save();$('savingsAmount').value='';$('savingsNote').value='';$('savingsDate').value=localDate();
  $('savingsFeedback').textContent='Recorded '+money(amount)+' toward your savings goal.';render();
});
function renderSavings(emergencyTarget){
  const goals=[{key:'emergency',name:'Emergency fund',target:emergencyTarget,start:positive(data.emergencySaved)},{key:'vacation',name:data.tripName||'Vacation',target:positive(data.tripCost),start:positive(data.tripSaved)},{key:'custom',name:data.customGoalName||'Another goal',target:positive(data.customGoalTarget),start:positive(data.customGoalSaved)}];
  const root=$('savingsProgress');root.replaceChildren();
  for(const goal of goals){
    const deposited=savedFor(goal.key),saved=goal.start+deposited;
    const card=document.createElement('div');card.className='savings-progress-card';
    const name=document.createElement('h3');name.textContent=goal.name;
    const balance=document.createElement('strong');balance.textContent=money(saved)+' saved';
    const progress=document.createElement('progress');progress.max=goal.target||1;progress.value=goal.target?Math.min(saved,goal.target):0;progress.setAttribute('aria-label',goal.name+' savings progress');
    const status=document.createElement('p');status.className='help';status.textContent=goal.target?`${Math.min(100,saved/goal.target*100).toFixed(0)}% of ${money(goal.target)} · ${saved>=goal.target?'Goal reached!':money(goal.target-saved)+' to go'}`:'Add a target to see your progress.';
    const source=document.createElement('small');source.textContent=money(goal.start)+' starting balance + '+money(deposited)+' deposits';
    card.append(name,balance,progress,status,source);root.append(card);
  }
  $('savingsGoal').options[1].textContent=data.tripName||'Vacation';$('savingsGoal').options[2].textContent=data.customGoalName||'Another goal';
  $('savingsDepositedTotal').textContent=money(data.savingsDeposits.reduce((sum,d)=>sum+positive(d.amount),0))+' total deposits';
  const list=$('savingsHistory');list.replaceChildren();
  if(!data.savingsDeposits.length){const empty=document.createElement('li');empty.textContent='No deposits recorded yet.';list.append(empty)}
  for(const deposit of [...data.savingsDeposits].sort((a,b)=>b.date.localeCompare(a.date))){
    const row=document.createElement('li'),info=document.createElement('div');info.className='purchase-info';
    const name=document.createElement('strong');name.textContent=goals.find(g=>g.key===deposit.goal)?.name||'Savings';
    const detail=document.createElement('span');detail.className='purchase-meta';detail.textContent=deposit.date+(deposit.note?' · '+deposit.note:'');info.append(name,detail);
    const amount=document.createElement('strong');amount.textContent=money(positive(deposit.amount));
    const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove '+money(positive(deposit.amount))+' savings record');
    remove.addEventListener('click',()=>{data.savingsDeposits=data.savingsDeposits.filter(d=>d.id!==deposit.id);save();render()});row.append(info,amount,remove);list.append(row);
  }
}
function payPeriod(){
  if(!data.payday||data.payday>localDate())return null;
  const anchor=new Date(data.payday+'T12:00:00'),today=new Date(localDate()+'T12:00:00');
  if(Number.isNaN(anchor.getTime()))return null;
  const length=data.frequency==='biweekly'?14:7;
  const elapsed=Math.max(0,Math.round((Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())-Date.UTC(anchor.getFullYear(),anchor.getMonth(),anchor.getDate()))/86400000));
  const start=new Date(anchor);start.setDate(start.getDate()+Math.floor(elapsed/length)*length);
  const end=new Date(start);end.setDate(end.getDate()+length);
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return {start:iso(start),end:iso(end),label:`${start.toLocaleDateString(undefined,{month:'short',day:'numeric'})} – ${new Date(end.getTime()-86400000).toLocaleDateString(undefined,{month:'short',day:'numeric'})}`};
}
function periodTransactions(period){return period?data.transactions.filter(t=>t.date>=period.start&&t.date<period.end):[]}
function breakdownTransactions(period){
  const items=breakdownView==='period'&&period?periodTransactions(period):data.transactions.filter(t=>t.date?.slice(0,7)===breakdownMonth);
  return items.filter(t=>!purchaseQuery||(t.name||'').toLowerCase().includes(purchaseQuery));
}
function categoryOf(category){return category==='Other'?'Misc':category}
function tracking(){
  const today=localDate(),now=new Date(today+'T12:00:00');
  const start=data.trackingStart?new Date(data.trackingStart+'T12:00:00'):null;
  const days=start&&!Number.isNaN(start.getTime())?Math.max(0,Math.floor((now-start)/86400000)):0;
  const cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-29);
  const cutoffDate=`${cutoff.getFullYear()}-${String(cutoff.getMonth()+1).padStart(2,'0')}-${String(cutoff.getDate()).padStart(2,'0')}`;
  const recent=data.transactions.filter(t=>t.date>=cutoffDate&&t.date<=today);
  const month=data.transactions.filter(t=>t.date?.slice(0,7)===today.slice(0,7));
  return {days,ready:days>=30&&data.transactions.length>0,monthly:recent.reduce((sum,t)=>sum+positive(t.amount),0),monthToDate:month.reduce((sum,t)=>sum+positive(t.amount),0)};
}
let editingPurchaseId=null;
function editPurchase(transaction){
  editingPurchaseId=transaction.id;
  $('editPurchaseAmount').value=positive(transaction.amount);
  $('editPurchaseName').value=transaction.name||'';
  $('editPurchaseCategory').value=categoryOf(transaction.category);
  $('editPurchaseDate').value=transaction.date;
  $('editPurchaseDate').max=localDate();
  $('editPurchaseError').textContent='';
  $('purchaseEditDialog').showModal();$('editPurchaseAmount').focus();
}
$('cancelPurchaseEdit').addEventListener('click',()=>$('purchaseEditDialog').close());
$('purchaseEditDialog').addEventListener('close',()=>{editingPurchaseId=null;$('purchaseSearch').focus()});
$('purchaseEditForm').addEventListener('submit',event=>{
  event.preventDefault();
  const transaction=data.transactions.find(t=>t.id===editingPurchaseId);
  if(!transaction){$('purchaseEditDialog').close();return}
  const amount=positive($('editPurchaseAmount').value),date=$('editPurchaseDate').value,category=$('editPurchaseCategory').value;
  if(!amount||!date||date>localDate()||!categories.includes(category)){$('editPurchaseError').textContent='Enter a positive amount, a category, and today or an earlier date.';return}
  transaction.amount=amount;transaction.name=$('editPurchaseName').value.trim();transaction.category=category;transaction.date=date;
  save();render();$('purchaseEditDialog').close();
  $('purchaseEditFeedback').textContent='Purchase updated. Totals reflect its new amount, category and date; it may move out of the current view or search.';
});
function renderRecent(period){
  const list=$('recentExpenses');list.replaceChildren();
  const recent=breakdownTransactions(period).sort((a,b)=>b.date.localeCompare(a.date));
  if(!recent.length){const item=document.createElement('li');item.textContent=purchaseQuery?'No purchases match this name in the selected view.':'No purchases logged in the selected view yet.';list.append(item)}
  for(const transaction of recent){
    const item=document.createElement('li');const info=document.createElement('div');info.className='purchase-info';
    const label=document.createElement('strong');label.className='purchase-name';label.textContent=transaction.name||categoryOf(transaction.category);
    const meta=document.createElement('span');meta.className='purchase-meta';meta.textContent=`${categoryOf(transaction.category)} · ${transaction.date}`;
    info.append(label,meta);
    const amount=document.createElement('strong');amount.textContent=money(positive(transaction.amount));
    const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',`Remove ${transaction.name||transaction.category} expense`);
    remove.addEventListener('click',()=>{data.transactions=data.transactions.filter(t=>t.id!==transaction.id);if(!data.transactions.length)delete data.trackingStart;save();render()});
    const edit=document.createElement('button');edit.type='button';edit.className='edit-purchase';edit.textContent='Edit';edit.setAttribute('aria-label',`Edit ${transaction.name||transaction.category} purchase`);edit.addEventListener('click',()=>editPurchase(transaction));
    const actions=document.createElement('div');actions.className='purchase-row-actions';actions.append(edit,remove);
    item.append(info,amount,actions);list.append(item);
  }
}
function approximatePaychecks(date){
  const departure=new Date(date+'T12:00:00');const today=new Date();today.setHours(12,0,0,0);
  if(Number.isNaN(departure.getTime()))return 0;
  const days=Math.ceil((departure-today)/86400000);
  return days>0?Math.ceil(days/(data.frequency==='biweekly'?14:7)):0;
}
const monthThemes=[
  ['❄️','Fresh starts, frosty mornings.','#dcefff','#d8d8ff','#285995','Winter wishes','⛄','✨','#4a8ed0'],
  ['💗','A little love for your future self.','#ffe1ec','#f6d9ff','#9d3e81','Sweet February','💌','✨','#df599a'],
  ['☘️','Small steps bring good things.','#e1f9dd','#d3f0ee','#26705e','Lucky little steps','🌈','🌱','#43a873'],
  ['🌦️','Rainy days make room for blooms.','#e4efff','#eadcff','#4b67a2','April showers','🌼','💧','#6a9bdc'],
  ['🌷','Make space for what grows.','#ffe4ee','#f4e7c9','#9c507d','Spring in bloom','🦋','🌸','#dd78a1'],
  ['☀️','Sunny plans ahead.','#fff0bd','#ffd9ba','#a26322','Hello, sunshine','🍋','🌻','#e5a941'],
  ['🎆','A bright new chapter.','#ffdfec','#e2dcff','#88409c','Summer sparkle','🍉','⭐','#b767c8'],
  ['🏖️','A little sunshine in the plan.','#dff5ff','#ffe9c9','#227b9b','Seaside days','🐚','☀️','#56acc5'],
  ['🍂','Golden leaves and fresh starts.','#ffdfbc','#f8c8aa','#9b532f','Autumn days','🍎','✨','#db8451'],
  ['🎃','Cozy plans, crisp nights.','#ffe2bd','#ead5f7','#914c57','Spooky season','🍬','👻','#d47756'],
  ['🍁','A season to feel grounded.','#f4dfc4','#f7cdb8','#995a39','Cozy November','🥧','🧣','#bb7a55'],
  ['☃️','Warm wishes for winter days.','#ddecff','#e8dfff','#5a639f','Winter magic','🎁','✨','#8496d3']
];
const activeBills=()=>data.expenses.filter(item=>!trackedNames.has(item.name)&&positive(item.amount)>0);
function upcomingBills(period,today=localDate()){
  if(!period)return [];
  const result=[];
  const cursor=new Date(today+'T12:00:00');
  while(true){
    const date=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`;
    if(date>=period.end)break;
    const last=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
    for(const bill of activeBills())if(bill.dueDay&&Math.min(Number(bill.dueDay),last)===cursor.getDate())result.push({name:bill.name||'Monthly bill',amount:positive(bill.amount),date});
    cursor.setDate(cursor.getDate()+1);
  }
  return result;
}
function renderUpcomingBills(period){
  const bills=upcomingBills(period),list=$('upcomingBillList');list.replaceChildren();
  $('upcomingBillTotal').textContent=period?money(bills.reduce((sum,b)=>sum+b.amount,0)):'';
  $('upcomingBillRange').textContent=period?'Before '+new Date(period.end+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})+'.':'Add a payday on Expenses.';
  if(period&&!bills.length){const empty=document.createElement('li');empty.textContent='No dated bills due before your next payday.';list.append(empty)}
  for(const bill of bills){
    const row=document.createElement('li'),info=document.createElement('div'),name=document.createElement('strong'),date=document.createElement('small'),amount=document.createElement('strong');
    name.textContent=bill.name;date.textContent=bill.date===localDate()?'Due today':new Date(bill.date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});amount.textContent=money(bill.amount);info.append(name,date);row.append(info,amount);list.append(row);
  }
  const undated=activeBills().filter(b=>!b.dueDay).length;
  $('upcomingBillNote').textContent=period?'Scheduled bills; payment status is not tracked.'+(undated?` ${undated} ${undated===1?'bill needs':'bills need'} a due day on Expenses.`:''):'';
}
function billsOnDay(day){
  const last=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,0).getDate();
  return activeBills().filter(item=>item.dueDay&&Math.min(Number(item.dueDay),last)===day);
}
function billList(root,bills,emptyText){
  root.replaceChildren();
  if(!bills.length){const p=document.createElement('p');p.className='muted';p.textContent=emptyText;root.append(p);return}
  bills.forEach(item=>{const row=document.createElement('div');row.className='calendar-bill';const name=document.createElement('span');name.textContent=item.name||'Monthly bill';const amount=document.createElement('strong');amount.textContent=money(positive(item.amount));row.append(name,amount);root.append(row)});
}
function renderCalendar(){
  const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth(),last=new Date(year,month+1,0).getDate();
  selectedDay=Math.min(Math.max(1,selectedDay),last);
  const theme=monthThemes[month],card=$('calendarCard'),details=$('calendarDetails');
  for(const node of [card,details]){node.style.setProperty('--month-a',theme[2]);node.style.setProperty('--month-b',theme[3]);node.style.setProperty('--month-ink',theme[4]);node.style.setProperty('--month-accent',theme[8])}
  $('monthTitle').textContent=calendarMonth.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  $('monthSubtitle').textContent=theme[1];$('monthBadge').textContent=theme[5];
  $('monthArtA').textContent=theme[0];$('monthArtB').textContent=theme[6];$('monthArtC').textContent=theme[7];
  const scheduled=activeBills().filter(item=>item.dueDay);
  $('monthBillTotal').textContent=money(scheduled.reduce((sum,item)=>sum+positive(item.amount),0))+' scheduled';
  const root=$('calendarGrid');root.replaceChildren();
  for(let i=0;i<new Date(year,month,1).getDay();i++){const blank=document.createElement('span');blank.className='calendar-blank';root.append(blank)}
  const today=localDate();
  for(let day=1;day<=last;day++){
    const bills=billsOnDay(day),button=document.createElement('button');button.type='button';button.className='calendar-day';
    if(bills.length)button.classList.add('has-bill');if(day===selectedDay)button.classList.add('selected');
    const iso=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    if(iso===today)button.classList.add('today');
    const dueTotal=bills.reduce((sum,item)=>sum+positive(item.amount),0);
    button.setAttribute('aria-label',`${calendarMonth.toLocaleDateString(undefined,{month:'long'})} ${day}: ${bills.length?`${bills.length} ${bills.length===1?'bill':'bills'}, ${money(dueTotal)} due`:'no bills'}`);
    const numeral=document.createElement('span');numeral.textContent=String(day);button.append(numeral);
    if(bills.length){const tag=document.createElement('small');tag.className='bill-tag';tag.textContent=dueTotal>=1000?'$'+(dueTotal/1000).toFixed(dueTotal%1000?1:0)+'k':money(dueTotal).replace(/\.00$/,'');button.append(tag)}
    button.addEventListener('click',()=>{selectedDay=day;renderCalendar()});root.append(button);
  }
  $('selectedDayTitle').textContent=new Date(year,month,selectedDay).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  billList($('dayBills'),billsOnDay(selectedDay),'No bills due on this day.');
  billList($('undatedBills'),activeBills().filter(item=>!item.dueDay),activeBills().length?'All your entered bills have due days.':'Add a monthly bill on Expenses to get started.');
}
$('prevMonth').addEventListener('click',()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);selectedDay=1;renderCalendar()});
$('nextMonth').addEventListener('click',()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);selectedDay=1;renderCalendar()});
function renderWeeklyCheckin(current,remaining,pay){
  const today=localDate(),start=new Date(today+'T12:00:00');start.setDate(start.getDate()-6);
  const from=`${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
  const within=item=>item.date>=from&&item.date<=today;
  const spent=data.transactions.filter(within).reduce((sum,t)=>sum+positive(t.amount),0);
  const saved=data.savingsDeposits.filter(within).reduce((sum,d)=>sum+positive(d.amount),0);
  $('weeklyCheckinRange').textContent='Last 7 days';
  $('weeklySpent').textContent=money(spent);$('weeklySaved').textContent=money(saved);
  $('weeklyRemaining').textContent=current&&pay?money(remaining):'—';
  $('weeklyCheckinNote').textContent=current&&pay?`Next payday: ${new Date(current.end+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}. Saved counts recorded deposits only.`:'Add take-home pay and payday on Expenses. Saved counts recorded deposits only.';
}
function render(){
  const periods=data.frequency==='biweekly'?26:52;
  const pay=positive(data.pay),learned=tracking(),current=payPeriod();
  const fixedMonthly=data.expenses.filter(item=>!trackedNames.has(item.name)).reduce((total,item)=>total+positive(item.amount),0);
  const monthlyIncome=pay*periods/12,monthlyAfterBills=monthlyIncome-fixedMonthly-learned.monthToDate;
  const monthly=fixedMonthly+(learned.ready?learned.monthly:0);
  const expensePerPay=monthly*12/periods,fixedPerPay=fixedMonthly*12/periods,available=pay-expensePerPay;
  const filled=data.expenses.some(item=>!trackedNames.has(item.name)&&positive(item.amount)>0)||learned.monthly>0;
  // Fidelity's near-term savings guideline is 10% of take-home pay.
  // The 50% surplus cap is CloudStash's own buffer for expenses we may not yet see.
  const target=pay*.1;
  const suggested=pay>0&&filled&&learned.ready?Math.min(target,Math.max(0,available)*.5):0;
  const limit=pay-fixedPerPay-suggested;
  const transactions=periodTransactions(current),spent=transactions.reduce((sum,t)=>sum+positive(t.amount),0);
  $('period').textContent=current?`${current.label} · ${data.frequency==='biweekly'?'2-week':'weekly'} budget`:'Set your payday on Expenses';
  $('balanceBasis').textContent=!pay?'Enter take-home pay on Expenses to build your payday plan.':!current?'Add your most recent payday on Expenses to start your payday plan.':limit<0?`This paycheck: bills need ${money(fixedPerPay)}, leaving a ${money(-limit)} shortfall.`:`Bills ${money(fixedPerPay)} · Save ${money(suggested)} · Spend ${money(limit)}`;
  $('paydayPlanNote').textContent=!pay||!current?'Uses take-home pay; retirement and healthcare are tracked separately.':`Bills are averaged across paychecks. ${learned.ready?'Savings is a suggestion, not a recorded deposit.':'Savings stays at $0 while we learn your spending for 30 days.'}`;

  renderWeeklyCheckin(current,limit-spent,pay);
  $('available').textContent=money(current&&pay?limit-spent:0);$('payOut').textContent=money(current&&pay?limit:0);$('expenseOut').textContent=money(current?spent:0);
  $('monthlyIncome').textContent=pay?money(monthlyIncome)+' income':'Add pay on Expenses';$('monthlyBills').textContent=money(fixedMonthly)+' bills';$('monthlyLeft').textContent=pay?money(monthlyAfterBills):'—';
  $('monthlyPurchaseNote').textContent=money(learned.monthToDate)+' purchases this month · after monthly bills';
  $('monthlyLeft').classList.toggle('monthly-deficit',pay>0&&monthlyAfterBills<0);
  $('suggested').textContent=learned.ready?money(suggested):'Learning…';
  $('suggestedPeriod').textContent=data.frequency==='biweekly'?'every 2 weeks':'each week';
  $('spending').textContent=learned.ready?money(available-suggested):'—';$('annual').textContent=learned.ready?money(suggested*periods):'—';
  $('monthlyTotal').textContent=money(monthly);$('expenseAside').textContent=money(expensePerPay);
  const retirement=contribution('retirement401k'),ira=contribution('ira');
  for(const key of ['retirement401k','ira']){
    const value=contribution(key),percent=data[key+'Mode']==='percent';
    $(key+'InputLabel').textContent=percent?'Your contribution (%)':'Your contribution ($)';
    $(key).max=percent?'100':'';
    $(key+'Estimate').textContent=value.needsGross?'Enter gross pay to calculate percentage contributions and employer matching.':`You: ${money(value.employee)} · Employer: ${money(value.employer)} · Total: ${money(value.employee+value.employer)} per paycheck`;
  }
  $('iraAside').textContent=money(ira.employee);
  $('retirementAside').textContent=money(retirement.employee);
  $('employerAside').textContent=money(retirement.employer+ira.employer);
  $('healthcareAside').textContent=money(positive(data.healthcarePayroll));
  $('payrollAside').textContent=money(ira.employee+retirement.employee+positive(data.healthcarePayroll));
  $('annualTracked').textContent=money((ira.employee+retirement.employee+positive(data.healthcarePayroll))*periods);
  $('retirementAnnual').textContent=money((ira.employee+retirement.employee+ira.employer+retirement.employer)*periods);
  $('emergencyTarget').textContent=money(monthly*3);
  renderSavings(monthly*3);
  $('emergencyBasis').textContent=learned.ready?'Three months of entered bills plus recent everyday spending.':'Starting target from entered bills; everyday spending is added after 30 days.';
  $('count').textContent=data.expenses.filter(x=>!trackedNames.has(x.name)&&positive(x.amount)>0).length+' filled';
  const breakdownItems=breakdownTransactions(current),breakdownSpent=breakdownItems.reduce((sum,t)=>sum+positive(t.amount),0);
  $('loggedMonth').textContent=money(learned.monthToDate)+' this month';renderRecent(current);
  const isPeriod=breakdownView==='period'&&current;
  $('breakdownMonthField').hidden=!!isPeriod;
  $('breakdownPeriod').textContent=isPeriod?current.label:new Date(breakdownMonth+'-01T12:00:00').toLocaleDateString(undefined,{month:'long',year:'numeric'});
  $('breakdownTotal').textContent=money(breakdownSpent);
  $('searchSummary').textContent=purchaseQuery?`${breakdownItems.length} matching purchases · ${money(breakdownSpent)} total in this view`:`${breakdownItems.length} purchases · ${money(breakdownSpent)} total in this view`;
  $('breakdownTotalLabel').textContent=purchaseQuery?'MATCHING PURCHASES':isPeriod?'SPENT THIS PERIOD':'SPENT THIS MONTH';
  $('trackingStatus').textContent=!current?'Set your payday on Expenses to switch to a weekly or biweekly view.':learned.ready?'Your recent spending also informs the savings suggestion.':data.trackingStart?`Learning your habits · day ${Math.min(30,learned.days+1)} of 30`:'Log purchases on Overview to build your picture.';
  $('trackedDetail').textContent=learned.ready?`Recent 30-day spending: ${money(learned.monthly)}. This updates as you add purchases.`:`Logged this month: ${money(learned.monthToDate)}. Savings guidance begins after 30 days of tracking.`;
  $('expenseBasis').textContent=learned.ready?'Includes recent 30-day purchases.':'Before food, gas and other daily purchases are learned.';
  const archived=data.expenses.filter(item=>trackedNames.has(item.name)&&positive(item.amount)>0);
  $('priorEstimates').hidden=!archived.length;
  $('priorEstimates').textContent=archived.length?'Older day-to-day estimates are preserved but excluded. Log actual purchases on Overview.':'';
  $('shortfall').classList.toggle('hidden',!(pay>0&&current&&limit-spent<0));
  $('shortfall').textContent=limit<0?'Regular bills exceed take-home pay by '+money(-limit)+'.':'You are '+money(spent-limit)+' over this period’s limit.';
  $('recommendationReason').textContent=!pay?'Enter take-home pay to get started.':!filled?'Add your regular bills on Expenses.':!learned.ready?'Keep logging daily purchases. A savings suggestion will appear after 30 days so food and gas use actual spending.':available<=0?'No room remains after the bills and purchases tracked. Review the plan before adding cash savings.':suggested<target?'Aim for this manageable amount now, then work toward 10% as room opens up.':'A 10% take-home starting point for cash goals, supported by your tracked spending.';
  const grid=$('categoryBreakdown');grid.replaceChildren();
  for(const category of categories){
    const total=breakdownItems.filter(t=>categoryOf(t.category)===category).reduce((sum,t)=>sum+positive(t.amount),0);
    const count=breakdownItems.filter(t=>categoryOf(t.category)===category).length;
    const card=document.createElement('div');card.className='card category-card category-'+category.toLowerCase();
    const label=document.createElement('span');label.textContent=category;const amount=document.createElement('strong');amount.textContent=money(total);
    const detail=document.createElement('small');detail.textContent=count+' '+(count===1?'purchase':'purchases');
    const bar=document.createElement('div');bar.className='category-bar';const fill=document.createElement('i');fill.style.width=breakdownSpent?Math.min(100,total/breakdownSpent*100)+'%':'0%';bar.append(fill);
    card.append(label,amount,detail,bar);grid.append(card);
  }
  document.querySelectorAll('.expense-group').forEach(group=>{
    const items=data.expenses.filter(item=>group.dataset.group==='Added by you'?!allPresets.includes(item.name)&&!trackedNames.has(item.name):(presets[group.dataset.group]||[]).includes(item.name));
    const subtotal=group.querySelector('summary small');if(subtotal)subtotal.textContent=money(items.reduce((sum,item)=>sum+positive(item.amount),0))+'/mo';
  });
  renderCalendar();renderUpcomingBills(current);
  const result=$('tripResult');result.replaceChildren();
  const cost=positive(data.tripCost),saved=positive(data.tripSaved)+savedFor('vacation'),checks=data.tripDate?approximatePaychecks(data.tripDate):0;
  if(!cost||!data.tripDate){result.textContent='Add an amount and a date to see your target per paycheck.';$('goalContext').textContent='Your budget and vacation goal update together.';return}
  if(!checks){result.textContent='Pick a future departure date to make a plan.';return}
  const remaining=Math.max(0,cost-saved),per=remaining/checks;
  const title=document.createElement('strong');title.textContent=money(per)+' each paycheck';
  const detail=document.createElement('p');detail.textContent=remaining?money(remaining)+' to go over approximately '+checks+' paychecks.':'You have already saved enough for this trip.';
  result.append(title,detail);
  $('goalContext').textContent=!learned.ready?'The budget is still learning your food and gas costs; this comparison will update after 30 days.':remaining&&per>Math.max(0,available)?'This goal exceeds what is available after tracked expenses.':remaining&&suggested<per?'This trip needs more per paycheck than the suggested cash savings.':'This target fits within the suggested cash savings.';
}
renderExpenses();render();
$('reset').addEventListener('click',()=>{if(!confirm('Clear this budget and start over? A local recovery copy will be kept when storage is available.'))return;try{snapshot(localStorage.getItem(KEY))}catch{}data={pay:0,frequency:'weekly',expenses:defaultExpenses(),transactions:[],retirement401k:0,healthcarePayroll:0,ira:0,contributionsPerPaycheck:true,tripName:'',tripDate:'',tripCost:0,tripSaved:0};save();location.reload()});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});



// Keep the established budget storage key so existing budgets survive the rename.
const WELCOME_KEY='cloudStashWelcomeSeenV1';
const welcome=$('welcomeDialog');
let welcomeTrigger=null;
function openWelcome(trigger=null){
  welcomeTrigger=trigger;
  if(!welcome.open)welcome.showModal();
}
function dismissWelcome(){
  try{localStorage.setItem(WELCOME_KEY,'1')}catch{}
  welcome.close();
}
$('setupHelp').addEventListener('click',()=>openWelcome($('setupHelp')));
$('skipWelcome').addEventListener('click',dismissWelcome);
$('beginSetup').addEventListener('click',()=>{
  dismissWelcome();openPage('expenses');
  $('pay').scrollIntoView({block:'center',behavior:'smooth'});$('pay').focus({preventScroll:true});
});
welcome.addEventListener('cancel',()=>{try{localStorage.setItem(WELCOME_KEY,'1')}catch{}});
welcome.addEventListener('close',()=>{welcomeTrigger?.focus()});
const hasExistingBudget=positive(data.pay)>0||data.expenses.some(e=>positive(e.amount)>0)||data.transactions.length>0||data.savingsDeposits.length>0;
try{if(!localStorage.getItem(WELCOME_KEY)&&!hasExistingBudget)openWelcome()}catch{}

function recoveryChoices(){
  const choices=readBackups().map(b=>({label:'Saved '+new Date(b.at).toLocaleString(),value:parseBudget(b.raw)}));
  const legacy=migrate();if(hasBudget(legacy))choices.push({label:'Earlier Life’s Quest budget',value:legacy});
  return choices.filter(c=>hasBudget(c.value));
}
$('savedData').addEventListener('click',()=>{
  const list=$('recoveryList');list.replaceChildren();const choices=recoveryChoices();
  $('recoveryStatus').textContent=choices.length?'Select a saved copy to restore. Your current budget will be backed up first.':'No older budget was found in this app’s local storage. Copies stored in another browser or app are not accessible here.';
  for(const choice of choices){
    const row=document.createElement('div');row.className='recovery-copy';
    const text=document.createElement('p');text.textContent=choice.label+' · '+money(positive(choice.value.pay))+' take-home · '+(choice.value.transactions||[]).length+' purchases';
    const button=document.createElement('button');button.type='button';button.textContent='Restore';button.className='primary';
    button.addEventListener('click',()=>{
      if(!confirm('Restore this saved budget? Your current budget will be kept as a local backup.'))return;
      try{snapshot(localStorage.getItem(KEY));localStorage.setItem(KEY,JSON.stringify(choice.value));location.reload()}catch{$('recoveryStatus').textContent='Could not restore this copy. Storage may be full or unavailable.'}
    });row.append(text,button);list.append(row);
  }
  $('recoveryDialog').showModal();
});
$('closeRecovery').addEventListener('click',()=>$('recoveryDialog').close());
$('downloadBudget').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify({app:'Cloud Stash',version:1,savedAt:new Date().toISOString(),budget:data},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='CloudStash-budget-'+localDate()+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('importBudget').addEventListener('change',async()=>{
  const file=$('importBudget').files[0];if(!file)return;
  try{const contents=JSON.parse(await file.text());const restored=parseBudget(JSON.stringify(contents.budget||contents));if(!restored)throw Error();
    if(!confirm('Replace your budget with this backup? Your current budget will be kept as a local recovery copy.'))return;
    snapshot(localStorage.getItem(KEY));localStorage.setItem(KEY,JSON.stringify(restored));location.reload();
  }catch{$('recoveryStatus').textContent='This backup could not be imported. Choose a Cloud Stash budget JSON file and check that device storage is available.'}
  finally{$('importBudget').value=''}
});
if(recoveredAtStartup){$('storageNotice').hidden=false;$('storageNotice').textContent='Your saved budget could not be read. A local backup has been loaded; review it and download a copy from Saved data.'}
