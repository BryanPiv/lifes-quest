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
function hasBudget(value){return !!value&&(positive(value.pay)>0||(value.expenses||[]).some(e=>positive(e.amount)>0)||(value.transactions||[]).length>0||(value.sideIncome||[]).length>0||(value.savingsDeposits||[]).length>0||positive(value.tripSaved)>0||positive(value.emergencySaved)>0||positive(value.customGoalSaved)>0||(value.retirementAccounts||[]).length>0||!!value.retirementPlan||!!value.recommendationProfile||!!value.purchasePlan)}
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
if(!Array.isArray(data.sideIncome))data.sideIncome=[];
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
  if(!['plan','expenses','goals','recommendations','futureplans','breakdown','calendar'].includes(target))return;
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
function personalMonthly(a){return a.personalPerPay!==undefined?positive(a.personalPerPay)*(data.frequency==='biweekly'?26:52)/12:positive(a.monthly)}
function accountMonthly(a){const c=a.source==='manual'?{employee:0,employer:0}:contribution(a.source==='ira'?'ira':'retirement401k');return personalMonthly(a)+(c.employee+c.employer)*(data.frequency==='biweekly'?26:52)/12}
function accountBalance(a){return Math.max(0,(Number(a.balance)||0)+data.savingsDeposits.filter(d=>d.accountId===a.id).reduce((sum,d)=>sum+positive(d.amount),0))}
function contribution(key){
  const gross=positive(data.grossPay),percent=data[key+'Mode']==='percent';
  const employee=percent?gross*Math.min(100,positive(data[key]))/100:positive(data[key]);
  const employer=Math.min(employee,gross*Math.min(100,positive(data[key+'MatchCap']))/100)*Math.min(100,positive(data[key+'MatchRate']))/100;
  return {employee,employer,needsGross:!gross&&(percent||positive(data[key+'MatchRate'])>0)};
}
$('frequency').value=data.frequency;
$('frequency').addEventListener('change',()=>{data.frequency=$('frequency').value;for(const e of data.expenses){const a=(data.retirementAccounts||[]).find(a=>a.id===e.accountId);if(a&&a.personalPerPay!==undefined)e.amount=personalMonthly(a)}save();renderExpenses();render()});
$('payday').value=data.payday||'';$('payday').max=localDate();
$('payday').addEventListener('change',()=>{data.payday=$('payday').value;save();render()});
function expenseRow(item){
  const row=document.createElement('div');row.className='expense-item';
  const name=document.createElement('input');if(item.accountId)name.readOnly=true;name.className='name';name.value=item.name||'';name.placeholder='Expense name';name.setAttribute('aria-label','Expense name');
  if(allPresets.includes(item.name))name.readOnly=true;
  else name.addEventListener('input',()=>{item.name=name.value;save()});
  const amount=document.createElement('input');amount.type='number';amount.min='0';amount.step='0.01';amount.inputMode='decimal';amount.placeholder='0.00';amount.value=item.amount||'';amount.setAttribute('aria-label',(item.name||'Expense')+' monthly amount');
  amount.addEventListener('input',()=>{item.amount=positive(amount.value);const linked=(data.retirementAccounts||[]).find(a=>a.id===item.accountId);if(linked){linked.monthly=item.amount;if(linked.personalPerPay!==undefined)linked.personalPerPay=item.amount*12/(data.frequency==='biweekly'?26:52)};save();render()});
  const due=document.createElement('select');due.setAttribute('aria-label',(item.name||'Expense')+' due day');
  const blank=document.createElement('option');blank.value='';blank.textContent='Day';due.append(blank);
  for(let day=1;day<=31;day++){const option=document.createElement('option');option.value=String(day);option.textContent=String(day);due.append(option)}
  if(item.eachPayday){due.disabled=true;blank.textContent='Payday'}due.value=item.dueDay?String(item.dueDay):'';
  due.addEventListener('change',()=>{item.dueDay=due.value?Number(due.value):null;const linked=(data.retirementAccounts||[]).find(a=>a.id===item.accountId);if(linked)linked.personalDueDay=item.dueDay;save();render()});
  const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='×';remove.setAttribute('aria-label','Remove '+(item.name||'expense'));
  remove.addEventListener('click',()=>{const linked=(data.retirementAccounts||[]).find(a=>a.id===item.accountId);if(linked)linked.personalSchedule='forecast';data.expenses.splice(data.expenses.indexOf(item),1);save();renderExpenses();render()});
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
function sideIncomeTotal(start,end){return data.sideIncome.filter(item=>item.date>=start&&item.date<end).reduce((sum,item)=>sum+positive(item.amount),0)}
let editingSideIncomeId=null;
function openSideIncome(item=null){
  editingSideIncomeId=item?.id||null;
  $('sideIncomeTitle').textContent=item?'Edit side income':'Add side income';
  $('sideIncomeAmount').value=item?.amount||'';$('sideIncomeName').value=item?.name||'';
  $('sideIncomeDate').value=item?.date||localDate();$('sideIncomeDate').max=localDate();$('sideIncomeFeedback').textContent='';
  renderSideIncome();if(!$('sideIncomeDialog').open)$('sideIncomeDialog').showModal();$('sideIncomeAmount').focus();
}
$('addSideIncome').onclick=()=>openSideIncome();
$('cancelSideIncome').onclick=()=>$('sideIncomeDialog').close();
$('sideIncomeForm').onsubmit=event=>{
  event.preventDefault();const amount=Number($('sideIncomeAmount').value),date=$('sideIncomeDate').value,name=$('sideIncomeName').value.trim();
  if(!Number.isFinite(amount)||amount<=0||!/^\d{4}-\d{2}-\d{2}$/.test(date)||date>localDate()){$('sideIncomeFeedback').textContent='Enter a positive amount and today or an earlier date.';return}
  const item=data.sideIncome.find(item=>item.id===editingSideIncomeId);
  if(item)Object.assign(item,{amount,date,name});else data.sideIncome.unshift({id:Date.now()+'-'+Math.random().toString(36).slice(2),amount,date,name});
  save();render();$('sideIncomeDialog').close();$('quickFeedback').textContent=(item?'Updated ':'Added ')+money(amount)+' side income.';
};
function renderSideIncome(){
  const root=$('sideIncomeHistory');root.replaceChildren();
  if(!data.sideIncome.length){const empty=document.createElement('li');empty.textContent='No side income recorded yet.';root.append(empty)}
  for(const item of [...data.sideIncome].sort((a,b)=>b.date.localeCompare(a.date))){
    const row=document.createElement('li'),info=document.createElement('div');info.className='purchase-info';
    const title=document.createElement('strong');title.textContent=item.name||'Side income';const detail=document.createElement('span');detail.className='purchase-meta';detail.textContent=item.date;info.append(title,detail);
    const amount=document.createElement('strong');amount.textContent='+'+money(item.amount);
    const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';edit.setAttribute('aria-label','Edit '+(item.name||'side income'));edit.onclick=()=>openSideIncome(item);
    const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove '+(item.name||'side income'));remove.onclick=()=>{data.sideIncome=data.sideIncome.filter(i=>i.id!==item.id);if(editingSideIncomeId===item.id){editingSideIncomeId=null;$('sideIncomeTitle').textContent='Add side income';$('sideIncomeForm').reset();$('sideIncomeDate').value=localDate()}save();render();renderSideIncome()};
    row.append(info,amount,edit,remove);root.append(row);
  }
}
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
  const goals=[{key:'emergency',name:'Nest egg / emergency fund',target:emergencyTarget,start:positive(data.emergencySaved)},{key:'vacation',name:data.tripName||'Vacation',target:positive(data.tripCost),start:positive(data.tripSaved)},{key:'custom',name:data.customGoalName||'Another goal',target:positive(data.customGoalTarget),start:positive(data.customGoalSaved)}];
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
  $('savingsGoal').options[0].textContent='Nest egg / emergency fund';$('savingsGoal').options[1].textContent=data.tripName||'Vacation';$('savingsGoal').options[2].textContent=data.customGoalName||'Another goal';
  $('savingsDepositedTotal').textContent=money(data.savingsDeposits.reduce((sum,d)=>sum+positive(d.amount),0))+' total deposits';
  const list=$('savingsHistory');list.replaceChildren();
  if(!data.savingsDeposits.length){const empty=document.createElement('li');empty.textContent='No deposits recorded yet.';list.append(empty)}
  for(const deposit of [...data.savingsDeposits].sort((a,b)=>b.date.localeCompare(a.date))){
    const row=document.createElement('li'),info=document.createElement('div');info.className='purchase-info';
    const name=document.createElement('strong');name.textContent=(data.retirementAccounts||[]).find(a=>a.id===deposit.accountId)?.name||goals.find(g=>g.key===deposit.goal)?.name||'Savings';
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
    for(const bill of activeBills())if(bill.eachPayday?isPaydayDate(date):bill.dueDay&&Math.min(Number(bill.dueDay),last)===cursor.getDate())result.push({name:bill.name||'Monthly bill',amount:bill.eachPayday?positive(bill.amount)*12/(data.frequency==='biweekly'?26:52):positive(bill.amount),date});
    cursor.setDate(cursor.getDate()+1);
  }
  return result;
}
function renderUpcomingBills(period){
  const bills=upcomingBills(period),list=$('upcomingBillList');list.replaceChildren();
  $('upcomingBillTotal').textContent=period?money(bills.reduce((sum,b)=>sum+b.amount,0)):'';
  $('upcomingBillRange').textContent=period?'Before '+new Date(period.end+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})+'.':'Add a payday on Budget.';
  if(period&&!bills.length){const empty=document.createElement('li');empty.textContent='No dated bills due before your next payday.';list.append(empty)}
  for(const bill of bills.slice(0,3)){
    const row=document.createElement('li'),info=document.createElement('div'),name=document.createElement('strong'),date=document.createElement('small'),amount=document.createElement('strong');
    name.textContent=bill.name;date.textContent=bill.date===localDate()?'Due today':new Date(bill.date+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'});amount.textContent=money(bill.amount);info.append(name,date);row.append(info,amount);list.append(row);
  }
  const undated=activeBills().filter(b=>!b.dueDay&&!b.eachPayday).length;
  $('upcomingBillNote').textContent=period?(bills.length>3?`${bills.length-3} more on Calendar. `:'')+'Scheduled bills; payment status is not tracked.'+(undated?` ${undated} ${undated===1?'bill needs':'bills need'} a due day on Budget.`:''):'';
}
function renderHomeNextStep(period,pay,remaining){
  const undated=activeBills().filter(b=>!b.dueDay&&!b.eachPayday).length;
  let title,text,action,target;
  if(!pay||!period){title='Start with your paycheck';text='Add your take-home pay and most recent payday to build your plan.';action='Set up my budget';target='expenses'}
  else if(remaining<0){title='Review this paycheck';text='Your planned reserves and logged spending are above this period’s income. Check your pay, bills and purchases.';action='Review my budget';target='expenses'}
  else if(!activeBills().length){title='Add your regular bills';text='Your balance will be more useful once rent, utilities and other regular costs are included.';action='Add my bills';target='expenses'}
  else if(undated){title='Give your bills a due date';text=`${undated} ${undated===1?'bill needs':'bills need'} a date so you can see what is coming before payday.`;action='Add bill dates';target='expenses'}
  else if(!data.transactions.length){title='Log your first purchase';text='Start with something you bought today. Quick Add updates your balance right away.';action='Add a purchase';target='quick'}
  else {title='Check your next goal';text='See your savings progress or plan for a vacation, car or another goal.';action='Plan ahead';target='futureplans'}
  $('homeNextTitle').textContent=title;$('homeNextText').textContent=text;$('homeNextAction').textContent=action+' →';
  $('homeNextAction').onclick=()=>{if(target==='quick'){$('quickAmount').scrollIntoView({block:'center'});$('quickAmount').focus()}else openPage(target)};
}
function scheduledDepositWindow(a,date){if(a.personalSchedule!=='paycheck'){const d=new Date(date+'T12:00:00'),end=new Date(d.getFullYear(),d.getMonth()+1,1);return {start:date.slice(0,7)+'-01',end:localISO(end),amount:personalMonthly(a)}}if(!data.payday||date<data.payday)return null;const anchor=new Date(data.payday+'T12:00:00'),d=new Date(date+'T12:00:00'),length=data.frequency==='biweekly'?14:7,days=Math.round((d-anchor)/86400000),start=new Date(anchor);start.setDate(start.getDate()+Math.floor(days/length)*length);const end=new Date(start);end.setDate(end.getDate()+length);return {start:localISO(start),end:localISO(end),amount:positive(a.personalPerPay)}}
function localISO(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function isPaydayDate(date){if(!data.payday||date<data.payday)return false;const days=Math.round((new Date(date+'T12:00:00')-new Date(data.payday+'T12:00:00'))/86400000);return days%(data.frequency==='biweekly'?14:7)===0}
function billsOnDay(day){
  const last=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,0).getDate();
  const date=`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;return activeBills().filter(item=>item.eachPayday?isPaydayDate(date):item.dueDay&&Math.min(Number(item.dueDay),last)===day).map(item=>item.eachPayday?{...item,amount:positive(item.amount)*12/(data.frequency==='biweekly'?26:52)}:item);
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
  const scheduled=Array.from({length:last},(_,i)=>billsOnDay(i+1)).flat();
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
  billList($('undatedBills'),activeBills().filter(item=>!item.dueDay&&!item.eachPayday),activeBills().length?'All your entered bills have due days.':'Add a monthly bill on Budget to get started.');
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
  $('weeklyCheckinNote').textContent=current&&pay?`Next payday: ${new Date(current.end+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}. Saved counts recorded deposits only.`:'Add take-home pay and payday on Budget. Saved counts recorded deposits only.';
}
// Spread monthly bills across all paychecks so due-date clusters do not
// change the spending allowance. Calendar keeps the actual payment schedule.
function calculatePaydayPlan({pay,side,averageBills,datedBills,undatedBills,purchases,extraTransfers,savingsTarget}){
  const bills=positive(averageBills);
  // Goal balances and recorded goal progress are accumulated savings, not
  // spending from this paycheck. Reserve only an affordable planned amount.
  const room=pay+side-bills-purchases-extraTransfers;
  const savings=Math.min(positive(savingsTarget),Math.max(0,room));
  const limit=pay+side-bills-savings;
  return {bills,savings,requestedSavings:positive(savingsTarget),limit,spent:purchases+extraTransfers,remaining:limit-purchases-extraTransfers};
}
function setupPaydayHome(){
  const details=document.createElement('details');details.className='home-calculation';
  details.innerHTML=`<summary>How is this calculated?</summary><div id="homeCalculation"></div><p>Based on your entries, not your bank balance. Monthly bills are spread evenly across your paychecks: monthly total × 12 ÷ 52 for weekly pay, or ÷ 26 for biweekly pay. Due dates do not change this allowance. Keep the bill money set aside between paychecks; check Upcoming Bills and Calendar for actual payments. Record daily purchases separately from regular bills.</p>`;
  document.querySelector('.home-balance-note').after(details);
  const settings=document.createElement('details');settings.className='home-plan-settings';
  settings.innerHTML=`<summary>Adjust my savings plan</summary><label>Amount to put away each paycheck<input id="homeSavingsTarget" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Use the suggestion"></label><p class="help">Build your nest egg a little at a time, with or without a named goal. We reserve only what fits after bills and purchases. Goal targets, existing balances and recorded goal progress are tracked separately. Extra personal retirement deposits count separately; recurring transfers are already in bills.</p><button id="homeSavingsAutomatic" type="button">Use suggested amount</button><p id="homeSavingsStatus" class="help" role="status"></p>`;
  $('paydayPlanNote').after(settings);
  $('homeSavingsTarget').value=data.paydaySavingsTarget==null?'':positive(data.paydaySavingsTarget);
  $('homeSavingsTarget').onchange=()=>{const input=$('homeSavingsTarget');if(!input.checkValidity())return;data.paydaySavingsTarget=input.value===''?null:positive(input.value);save();render();if(!$('homeSavingsStatus').textContent)$('homeSavingsStatus').textContent='Savings plan updated. No deposit has been recorded.'};
  $('homeSavingsAutomatic').onclick=()=>{data.paydaySavingsTarget=null;$('homeSavingsTarget').value='';save();render();$('homeSavingsStatus').textContent='Using the suggested amount.'};
  const style=document.createElement('style');style.textContent=`#plan .home-calculation{margin-top:10px;color:#e1f0ff;font-size:.78rem}#plan .home-calculation summary{cursor:pointer;min-height:32px;padding:6px 0;box-sizing:border-box}#plan .home-calculation p{line-height:1.5;color:#d2e6f5}#plan .home-calculation .balance-line{color:#fff;border-color:#ffffff30;gap:16px}#plan .home-plan-settings{padding:8px 0 12px}#plan .home-plan-settings label{display:block;max-width:320px}#homeSavingsAutomatic{min-height:44px;border:1px solid #a8c8df;border-radius:10px;background:#e0eef8;color:#225779;padding:8px 12px}#available[aria-label="Plan shortfall"]{color:#ffe0bf}`;document.head.append(style);
}
setupPaydayHome();
function render(){
  const periods=data.frequency==='biweekly'?26:52;
  const pay=positive(data.pay),learned=tracking(),current=payPeriod();
  const fixedMonthly=data.expenses.filter(item=>!trackedNames.has(item.name)).reduce((total,item)=>total+positive(item.amount),0);
  const monthStart=localDate().slice(0,7)+'-01',monthEnd=localISO(new Date(new Date().getFullYear(),new Date().getMonth()+1,1)),monthlySide=sideIncomeTotal(monthStart,monthEnd),periodSide=current?sideIncomeTotal(current.start,current.end):0;
  const monthlyIncome=pay*periods/12+monthlySide,monthlyAfterBills=monthlyIncome-fixedMonthly-learned.monthToDate-data.savingsDeposits.filter(d=>d.accountId&&!d.recurring&&d.date.slice(0,7)===localDate().slice(0,7)).reduce((sum,d)=>sum+positive(d.amount),0);
  const monthly=fixedMonthly+(learned.ready?learned.monthly:0);
  const expensePerPay=monthly*12/periods,fixedPerPay=fixedMonthly*12/periods,available=pay-expensePerPay;
  const filled=data.expenses.some(item=>!trackedNames.has(item.name)&&positive(item.amount)>0)||learned.monthly>0;
  // Fidelity's near-term savings guideline is 10% of take-home pay.
  // The 50% surplus cap is CloudStash's own buffer for expenses we may not yet see.
  const target=pay*.1;
  const suggested=pay>0&&filled&&learned.ready?Math.min(target,Math.max(0,available)*.5):0;
  const transactions=periodTransactions(current),purchases=transactions.reduce((sum,t)=>sum+positive(t.amount),0);
  const deposits=data.savingsDeposits.filter(d=>current&&d.date>=current.start&&d.date<current.end);
  const extraTransfers=deposits.filter(d=>d.accountId&&!d.recurring).reduce((sum,d)=>sum+positive(d.amount),0);
  const datedBills=current?upcomingBills(current,current.start).reduce((sum,b)=>sum+b.amount,0):0;
  const undatedBills=activeBills().filter(b=>!b.dueDay&&!b.eachPayday).reduce((sum,b)=>sum+positive(b.amount)*12/periods,0);
  const savingsTarget=data.paydaySavingsTarget==null?suggested:positive(data.paydaySavingsTarget);
  const plan=calculatePaydayPlan({pay,side:periodSide,averageBills:fixedPerPay,datedBills,undatedBills,purchases,extraTransfers,savingsTarget});
  const {limit,spent}=plan;
  const ready=!!(current&&pay);
  $('period').textContent=current?`Next payday · ${new Date(current.end+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric'})}`:'Add your payday to get started';
  $('available').setAttribute('aria-label',plan.remaining<0?'Plan shortfall':'Available until payday');
  document.querySelector('.home-balance-note').textContent=ready?'After your average bill share, your savings plan and logged purchases. This is your spending allowance.':'Add take-home pay, bills and payday to build your spending allowance.';
  renderHomeNextStep(current,pay,plan.remaining);
  $('balanceBasis').textContent=!ready?'Enter take-home pay and your most recent payday on Expenses.':`Income ${money(pay+periodSide)} · Reserve ${money(plan.bills)} for bills · Set aside ${money(plan.savings)} for goals · Keep ${money(limit)} for spending`;
  $('paydayPlanNote').textContent=!ready?'Uses take-home pay; work retirement and healthcare are tracked separately.':`Your monthly bills are spread evenly across ${periods} paychecks a year. A week with more bills due does not reduce your weekly allowance again. The bill amount is a budgeting allocation, not your current bank balance. ${data.paydaySavingsTarget==null?'Paycheck savings use the suggestion.':'You chose the amount to put away each paycheck.'} Only the amount that fits after bills and purchases is reserved. Your nest egg, goal targets and recorded goal progress do not reduce this paycheck. No money moves automatically.`;
  $('homeSavingsStatus').textContent=ready&&plan.requestedSavings>plan.savings?`You planned ${money(plan.requestedSavings)} each paycheck. ${money(plan.savings)} fits this period. Your goal stays in place; build toward it over time.`:'';
  const math=$('homeCalculation');math.replaceChildren();
  const lines=[['Take-home pay',pay],['Side income received',periodSide],['Bills · average per paycheck',-plan.bills],['Savings reserved from this paycheck',-plan.savings],['Extra personal retirement deposits',-extraTransfers],['Purchases this period',-purchases],['Available until payday',plan.remaining]];
  if(ready)for(const [label,value] of lines){const row=document.createElement('div');row.className='balance-line';const name=document.createElement('span'),amount=document.createElement('strong');name.textContent=label;amount.textContent=money(value);row.append(name,amount);math.append(row)}
  else math.textContent='Complete your paycheck details to see the calculation.';

  renderWeeklyCheckin(current,limit-spent,pay);
  $('available').textContent=money(current&&pay?limit-spent:0);$('payOut').textContent=money(current&&pay?limit:0);$('expenseOut').textContent=money(current?spent:0);
  $('monthlyIncome').textContent=pay?money(monthlyIncome)+' income':'Add pay on Budget';$('monthlyBills').textContent=money(fixedMonthly)+' bills';$('monthlyLeft').textContent=pay?money(monthlyAfterBills):'—';
  $('monthlyPurchaseNote').textContent=money(learned.monthToDate)+' purchases this month · after monthly bills'+(monthlySide?' · includes '+money(monthlySide)+' side income':'');
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
  $('trackingStatus').textContent=!current?'Set your payday on Budget to switch to a weekly or biweekly view.':learned.ready?'Your recent spending also informs the savings suggestion.':data.trackingStart?`Learning your habits · day ${Math.min(30,learned.days+1)} of 30`:'Log purchases on Overview to build your picture.';
  $('trackedDetail').textContent=learned.ready?`Recent 30-day spending: ${money(learned.monthly)}. This updates as you add purchases.`:`Logged this month: ${money(learned.monthToDate)}. Savings guidance begins after 30 days of tracking.`;
  $('expenseBasis').textContent=learned.ready?'Includes recent 30-day purchases.':'Before food, gas and other daily purchases are learned.';
  const archived=data.expenses.filter(item=>trackedNames.has(item.name)&&positive(item.amount)>0);
  $('priorEstimates').hidden=!archived.length;
  $('priorEstimates').textContent=archived.length?'Older day-to-day estimates are preserved but excluded. Log actual purchases on Overview.':'';
  $('shortfall').classList.toggle('hidden',!(pay>0&&current&&limit-spent<0));
  $('shortfall').textContent='Your plan is short by '+money(Math.max(0,spent-limit))+'. Review bills, savings and logged purchases.';
  $('recommendationReason').textContent=!pay?'Enter take-home pay to get started.':!filled?'Add your regular bills on Budget.':!learned.ready?'Keep logging daily purchases. A savings suggestion will appear after 30 days so food and gas use actual spending.':available<=0?'No room remains after the bills and purchases tracked. Review the plan before adding cash savings.':suggested<target?'Aim for this manageable amount now, then work toward 10% as room opens up.':'A 10% take-home starting point for cash goals, supported by your tracked spending.';
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
const hasExistingBudget=positive(data.pay)>0||data.expenses.some(e=>positive(e.amount)>0)||data.transactions.length>0||data.savingsDeposits.length>0||data.sideIncome.length>0;
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

// Keep saved accounts, goals and deposits while simplifying the Goals experience.
(function setupSimpleGoals(){
  const root=$('goals');
  const element=(tag,text='',className='')=>{const e=document.createElement(tag);e.textContent=text;e.className=className;return e};
  const heading=root.querySelector('.heading');heading.querySelector('h1').textContent='Your goals';heading.querySelector('p').textContent='See what you’ve saved and what to do next.';
  const switcher=element('div','','goal-switch');switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Choose a goals view');
  const savingsButton=element('button','Savings goals'),retirementButton=element('button','Retirement');switcher.append(savingsButton,retirementButton);heading.after(switcher);
  const savingsPanel=element('div'),retirementPanel=element('div');savingsPanel.id='savingsGoalsPanel';retirementPanel.id='retirementSavingsPanel';root.append(savingsPanel,retirementPanel);
  for(const selector of ['.goal-savings','.savings-tracker','.goals-grid'])savingsPanel.append(root.querySelector(selector));
  function showView(retirement){savingsPanel.hidden=retirement;retirementPanel.hidden=!retirement;savingsButton.setAttribute('aria-pressed',String(!retirement));retirementButton.setAttribute('aria-pressed',String(retirement));}
  savingsButton.onclick=()=>showView(false);retirementButton.onclick=()=>showView(true);showView(false);
  function label(id,text){const control=$(id),parent=control.closest('label');if(parent.firstChild.nodeType===3)parent.firstChild.textContent=text;}
  const suggestion=savingsPanel.querySelector('.goal-savings');suggestion.querySelector('h2').textContent='A little to put away each payday';suggestion.querySelector('.eyebrow').textContent='YOUR NEXT STEP';
  const miniLabels=suggestion.querySelectorAll('.mini-stats span');miniLabels[0].textContent='Left for spending each payday';miniLabels[1].textContent='Could save in one year';
  suggestion.querySelector('.savings-explanation summary').textContent='Why this amount?';
  const tracker=savingsPanel.querySelector('.savings-tracker');tracker.querySelector('h2').textContent='Build your nest egg';tracker.querySelector(':scope > .help').textContent='Start with your nest egg, even without a named goal. Record money you’ve saved to build your progress over time. These entries do not reduce your spending allowance; only your planned paycheck savings are reserved on Home.';
  tracker.querySelector('.savings-setup summary').textContent='Set up or change your goals';
  for(const [id,text] of [['emergencySaved','Emergency money you already have'],['customGoalName','What else are you saving for?'],['customGoalTarget','How much will you need?'],['customGoalSaved','Money already saved for it'],['tripName','Name your trip'],['tripDate','When are you going?'],['tripCost','How much will it cost?'],['tripSaved','Money already saved for this trip'],['savingsAmount','How much did you save?'],['savingsDate','When did you save it?']])label(id,text);
  const depositDetails=element('details','','simple-goal-action');depositDetails.append(element('summary','+ Add money you saved'));const depositForm=$('savingsDepositForm');depositForm.before(depositDetails);depositDetails.append(depositForm);depositForm.querySelector('h3').textContent='Add to a goal';depositForm.querySelector('button[type="submit"]').textContent='Add to my savings';
  tracker.querySelector('.deposit-history summary').textContent='Money you’ve added';
  const tripGrid=savingsPanel.querySelector('.goals-grid'),tripDetails=element('details','','simple-trip card');tripDetails.append(element('summary','Plan or update a trip'));tripGrid.before(tripDetails);tripDetails.append(tripGrid);tripGrid.querySelector('h2').textContent='Your trip';

  const host=element('div','','card retirement-outlook');retirementPanel.append(host);
  host.innerHTML=`<div class="card-title"><h2>Your retirement picture</h2></div><p class="help">We’ll bring your accounts together and work out how close you are.</p>
  <div id="retirementSummary" aria-live="polite"></div><div class="retirement-main-actions"><button id="openRetirementPlan" class="primary" type="button">Set up my retirement plan</button><button id="addRetirementAccount" class="secondary-goal" type="button">+ Add an account</button></div>
  <div id="retirementChart"></div><details id="retirementAccountList"><summary id="retirementAccountsLabel">Your accounts</summary><p class="help">Use the balances shown on your statements. Money marked for other goals stays out of your retirement estimate.</p><div id="retirementAccounts"></div></details>
  <details class="estimate-help"><summary>How we estimate this</summary><p class="help">We add the money you save each month, include linked employer matches, and estimate how your accounts could grow. We also allow for prices rising over time, so the amounts shown have the buying power of money today.</p><p id="retirementSettingsExplanation" class="help">The estimate assumes you could take out 4% of your savings in your first retirement year and prices rise 3% each year. It’s a planning guide, not a guarantee. It doesn’t include Social Security, pensions, taxes or rules about when you can use each account.</p><p class="help">Your account type doesn’t decide its growth. Choose what’s inside it when adding an account. Growth settings are examples you can change.</p><details><summary>Change the calculation settings</summary><form id="retirementAssumptionsForm"><div class="fields"><label>Prices rise each year by (%)<input name="inflation" type="number" min="0" max="15" step="0.1" required></label><label>Share of savings used in the first retirement year (%)<input name="withdrawal" type="number" min="1" max="10" step="0.1" required></label></div><button class="secondary-goal" type="submit">Save settings</button></form><p class="help">Higher and lower growth examples vary each account’s yearly growth by 2 percentage points. Monthly savings amounts stay the same over time. We don’t simulate market ups and downs or spending throughout retirement.</p></details><a href="https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator" target="_blank" rel="noopener">More about how savings grow</a></details>
  <dialog id="retirementPlanDialog"><form id="retirementPlanForm"><h2>A few details. We’ll do the math.</h2><div class="fields"><label>How old are you?<input name="age" type="number" min="18" max="99" step="1" required></label><label>When would you like to retire?<input name="retireAge" type="number" min="18" max="100" step="1" required></label><label>Money you’d like each month<select name="spendingMode"><option value="budget">Use my current spending</option><option value="manual">I’ll choose an amount</option></select></label><label id="retirementSpendingField">Monthly amount<input name="spending" type="number" min="0.01" max="1000000" step="0.01"></label></div><p id="retirementSpendingPreview" class="help"></p><p id="retirementPlanError" role="alert"></p><div class="purchase-edit-actions"><button id="cancelRetirementPlan" type="button">Cancel</button><button class="primary" type="submit">Show my retirement picture</button></div></form></dialog>
  <dialog id="retirementAccountDialog"><form id="retirementAccountForm"><h2 id="retirementAccountTitle">Add an account</h2><div class="fields"><label>What kind of account?<select name="type"><option>401(k) / 403(b)</option><option>Roth IRA</option><option>Traditional IRA</option><option>HYSA / savings</option><option>Checking / cash</option><option>Brokerage / investments</option><option>HSA</option><option>CDs / bonds</option><option>Other</option></select></label><label>Money in it right now<input name="balance" type="number" min="0" max="1000000000" step="0.01" required inputmode="decimal" placeholder="0.00"></label><label>What is this money for?<select name="included"><option value="yes">Retirement</option><option value="no">Other goals or emergencies</option></select></label><input name="source" type="hidden" value="manual"><fieldset class="contribution-section"><legend>Work contribution</legend><label>Do you contribute through work?<select name="workEnabled"><option value="no">No</option><option value="yes">Yes — every paycheck</option></select></label><div id="accountWorkFields"><label>Contribution method<select name="workMode"><option value="amount">Dollars per paycheck</option><option value="percent">Percent of gross pay</option></select></label><label>Your contribution each paycheck<input name="workAmount" type="number" min="0" step="0.01" inputmode="decimal"></label><label>Does your employer match?<select name="matchEnabled"><option value="no">No</option><option value="yes">Yes</option></select></label><div id="accountMatchFields"><label>Employer matches (%)<input name="workMatchRate" type="number" min="0" max="100" step="0.01" placeholder="e.g. 50"></label><label>Up to (% of gross pay)<input name="workMatchCap" type="number" min="0" max="100" step="0.01" placeholder="e.g. 7"></label><p class="help">Example: 50% of what you contribute, up to 7% of gross pay.</p></div></div><p id="accountWorkPreview" class="help"></p></fieldset><fieldset class="contribution-section"><legend>Personal contribution</legend><label>How much do you add or want to add each paycheck?<input name="monthly" type="number" min="0" max="1000000" step="0.01" inputmode="decimal" placeholder="0.00"></label><label><input name="personalRecurring" type="checkbox"> Plan this transfer every payday</label><p class="help">Optional. You can add different amounts whenever you like using Add personal deposit.</p></fieldset><label>What’s the money invested in?<select name="growth"><option value="cash">Cash / bank savings</option><option value="bonds">Mostly bonds</option><option value="mixed">A mix of stocks and bonds</option><option value="stocks">Mostly stocks</option><option value="custom">Keep my own growth estimate</option></select></label></div><p id="retirementContributionPreview" class="help"></p><p id="retirementGrowthPreview" class="help"></p><details><summary>Optional details</summary><div class="fields"><label>Account nickname<input name="name" maxlength="80" placeholder="e.g. My work 401(k)"></label><label>Estimated yearly growth (%)<input name="rate" type="number" min="-20" max="20" step="0.1" required></label></div><p class="help">This is an example after fees, not a promised return. For a savings account, use the rate your bank pays. No account connects to your bank.</p></details><p id="retirementAccountError" role="alert"></p><div class="purchase-edit-actions"><button id="cancelRetirementAccount" type="button">Cancel</button><button class="primary" type="submit">Save account</button></div></form></dialog>`;
  const style=element('style');style.textContent=`
  #retirementAccountDialog,#accountDepositDialog{width:min(540px,calc(100vw - 28px));box-sizing:border-box;max-height:88dvh;overflow:auto;border:1px solid #b7d2e6;border-radius:20px;padding:24px;color:#183b59;font-family:inherit}#retirementAccountDialog [hidden],#accountDepositDialog [hidden]{display:none!important}#retirementAccountDialog .fields,#accountDepositDialog .fields{grid-template-columns:1fr}.contribution-section{border:1px solid #d4e4ef;border-radius:12px;padding:14px;margin:8px 0}.contribution-section legend{font-weight:700;color:#145984}.contribution-section label{margin:10px 0}.contribution-section input[type=checkbox]{width:auto;min-height:0}.contribution-section label:has(input[type=checkbox]){display:flex;flex-direction:row;align-items:center;gap:10px}#retirementAccountDialog::backdrop,#accountDepositDialog::backdrop{background:#102b4c70}.goal-switch{display:flex;gap:6px;padding:5px;background:#dceaf5;border-radius:14px;margin-bottom:18px}.goal-switch button{flex:1;border:0;border-radius:10px;background:transparent;padding:12px;color:#41627e;font-weight:700;font-size:.95rem}.goal-switch button[aria-pressed="true"]{background:#fff;color:#145984;box-shadow:0 3px 9px #0c365b14}
  .retirement-outlook details,.simple-goal-action{margin-top:20px}.retirement-outlook summary,.simple-trip summary,.simple-goal-action summary{cursor:pointer;font-weight:700;color:#204c6d;padding:8px 0}.retirement-main-actions{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}.secondary-goal{border:1px solid #a7cce5;border-radius:10px;padding:11px 15px;background:#eef7fd;color:#1b5b83;font-weight:700}.retirement-hero{border-radius:18px;padding:22px;background:linear-gradient(125deg,#0a2843,#14699a);color:#fff;margin:16px 0}.retirement-hero h3{color:#fff;font-size:1.6rem;margin:8px 0}.retirement-hero p{color:#e3f2ff;margin:8px 0;line-height:1.5}.retirement-hero .eyebrow{color:#b8e5ff}.retirement-numbers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:16px 0}.retirement-number{background:#edf6fc;padding:15px;border-radius:14px;color:#476980}.retirement-number strong{display:block;font-size:1.25rem;color:#174f78;margin:7px 0}.retirement-number small{display:block}.retirement-account{padding:16px 0;border-bottom:1px solid #d9e7f1}.retirement-account h3{margin:0 0 8px}.retirement-account .account-money{font-size:1.2rem;color:#1a628e}.retirement-actions{display:flex;gap:8px;margin-top:10px}.retirement-actions button{border:1px solid #c3dbea;border-radius:8px;padding:8px 12px;background:#f1f8fd;color:#255e82}.retirement-outlook svg{width:100%;height:auto;display:block}.estimate-help{border-top:1px solid #dbe7f0;padding-top:12px}.retirement-outlook dialog{width:min(540px,calc(100vw - 28px));max-height:90dvh;overflow:auto}.retirement-outlook form .fields{grid-template-columns:1fr}.retirement-outlook form button{margin-top:12px}.retirement-outlook label{gap:6px}.retirement-outlook [role="alert"]{color:#9c382b}.simple-trip{margin-top:18px}.simple-trip .goals-grid{margin:12px 0 0}.simple-trip .goals-grid>.card{box-shadow:none;border:0;padding:10px 0}.savings-progress-card small{line-height:1.5}.retirement-outlook table{width:100%;font-size:.85rem;border-collapse:collapse}.retirement-outlook th,.retirement-outlook td{text-align:left;padding:9px;border-bottom:1px solid #d9e7f1}.goal-switch button:focus-visible,.retirement-outlook button:focus-visible{outline:3px solid #58abda;outline-offset:3px}@media(max-width:600px){.retirement-numbers{grid-template-columns:1fr 1fr}.retirement-number{padding:12px;font-size:.8rem}.retirement-number strong{font-size:1.05rem}.retirement-hero{padding:18px}.retirement-hero h3{font-size:1.4rem}.retirement-main-actions>*{flex:1}.simple-trip .goals-grid{grid-template-columns:1fr}}
  `;document.head.append(style);

  let editId=null;
  const planForm=$('retirementPlanForm'),accountForm=$('retirementAccountForm'),assumptions=$('retirementAssumptionsForm');
  const growthRates={cash:2,bonds:4,mixed:5,stocks:6};

  function accounts(){return Array.isArray(data.retirementAccounts)?data.retirementAccounts:[]}
  function plan(){return {age:0,retireAge:65,spending:0,inflation:3,withdrawal:4,spendingMode:data.retirementPlan?.spending?'manual':'budget',...data.retirementPlan}}
  function budgetSpending(){const learned=tracking(),bills=data.expenses.filter(e=>!trackedNames.has(e.name)&&!e.accountId).reduce((sum,e)=>sum+positive(e.amount),0);return {amount:bills+(learned.ready?learned.monthly:0),ready:learned.ready}}
  function desiredSpending(p){return p.spendingMode==='budget'?budgetSpending().amount:positive(p.spending)}
  function monthly(account){return accountMonthly(account)}
  function trajectory(list,age,inflation,delta=0){const balances=list.map(a=>accountBalance(a)),points=[balances.reduce((s,b)=>s+b,0)];for(let month=1;month<=Math.round((100-age)*12);month++){list.forEach((a,i)=>{const rate=Math.max(-.99,(Number(a.rate)+delta)/100);balances[i]=balances[i]*Math.pow(1+rate,1/12)+monthly(a)});if(month%12===0)points.push(balances.reduce((s,b)=>s+b,0)/Math.pow(1+inflation/100,month/12))}return points}
  function extraNeeded(list,age,retireAge,inflation,target){const years=retireAge-age;if(years<=0)return 0;const shortfall=Math.max(0,target-trajectory(list,age,inflation)[years]);let factor=0;const account=list.reduce((best,a)=>Number(a.rate)>Number(best.rate)?a:best,list[0]);const rate=Math.pow(1+Math.max(-.99,Number(account.rate)/100),1/12);for(let m=0;m<years*12;m++)factor=factor*rate+1;factor/=Math.pow(1+inflation/100,years);return shortfall/factor}
  function spendingPreview(){const fromBudget=planForm.elements.spendingMode.value==='budget',budget=budgetSpending();$('retirementSpendingField').hidden=fromBudget;planForm.elements.spending.required=!fromBudget;planForm.elements.spending.disabled=fromBudget;$('retirementSpendingPreview').textContent=fromBudget?(budget.amount?`We’ll use ${money(budget.amount)} each month from your ${budget.ready?'bills and recent spending':'bills so far. Everyday spending will be added after 30 days of tracking'}. This doesn’t include retirement taxes.`:'Add bills on Budget, or choose your own monthly amount above.'):'Choose the amount you’d want each month, including money for taxes. We’ll show it in today’s money.'}
  function openPlan(){const p=plan();for(const key of ['age','retireAge','spending','spendingMode'])planForm.elements[key].value=p[key]||'';$('retirementPlanError').textContent='';spendingPreview();$('retirementPlanDialog').showModal()}
  $('openRetirementPlan').onclick=openPlan;$('cancelRetirementPlan').onclick=()=>$('retirementPlanDialog').close();planForm.elements.spendingMode.onchange=spendingPreview;
  planForm.onsubmit=e=>{e.preventDefault();const value=Object.fromEntries(new FormData(planForm));if(Number(value.retireAge)<Number(value.age)){$('retirementPlanError').textContent='Choose a retirement age that is your age or older.';return}if(value.spendingMode==='budget'&&!budgetSpending().amount){$('retirementPlanError').textContent='Add your bills first, or choose a monthly amount.';return}data.retirementPlan={...plan(),...value,spending:value.spendingMode==='budget'?plan().spending:Number(value.spending)};save();$('retirementPlanDialog').close();render()};
  for(const key of ['inflation','withdrawal'])assumptions.elements[key].value=plan()[key];
  assumptions.onsubmit=e=>{e.preventDefault();data.retirementPlan={...plan(),...Object.fromEntries(new FormData(assumptions))};save();render()};
  function workKey(){return /IRA/.test(accountForm.elements.type.value)?'ira':'retirement401k'}
  function loadWorkFields(){const f=accountForm.elements,k=workKey();f.workMode.value=data[k+'Mode']||'amount';f.workAmount.value=data[k]||0;f.matchEnabled.value=positive(data[k+'MatchRate'])?'yes':'no';f.workMatchRate.value=data[k+'MatchRate']||0;f.workMatchCap.value=data[k+'MatchCap']||0}
  function typeDefaults(){const f=accountForm.elements,type=f.type.value,work=type==='401(k) / 403(b)',ira=/IRA/.test(type);f.workEnabled.value=work?'yes':'no';f.included.value=work||ira||type==='Brokerage / investments'?'yes':'no';f.growth.value=/cash|savings/.test(type)?'cash':type==='CDs / bonds'?'bonds':work||ira||type==='Brokerage / investments'?'mixed':'cash';loadWorkFields();applyGrowth();contributionPreview()}
  function contributionPreview(){const f=accountForm.elements,work=f.workEnabled.value==='yes',match=work&&f.matchEnabled.value==='yes';f.source.value=work?workKey():'manual';$('accountWorkFields').hidden=!work;$('accountMatchFields').hidden=!match;const gross=positive(data.grossPay),percent=f.workMode.value==='percent',employee=percent?gross*positive(f.workAmount.value)/100:positive(f.workAmount.value),employer=match?Math.min(employee,gross*positive(f.workMatchCap.value)/100)*positive(f.workMatchRate.value)/100:0;$('accountWorkPreview').textContent=work?(!gross&&(percent||match)?'Enter gross pay on Budget to calculate percentages.':`${money(employee)} from you${match?' + '+money(employer)+' employer match':''} every paycheck. Already included in your take-home pay deductions.`):'';$('retirementContributionPreview').textContent=f.personalRecurring.checked?'Personal transfers will be reserved in Budget and shown on Calendar each payday. Record them after you transfer the money.':'';}

  function growthPreview(){const r=Number(accountForm.elements.rate.value);$('retirementGrowthPreview').textContent=`We’ll use ${r}% yearly growth as an example. You can change it in Optional details.`}
  function applyGrowth(){const selected=accountForm.elements.growth.value;if(selected!=='custom')accountForm.elements.rate.value=growthRates[selected];growthPreview()}
  accountForm.elements.type.onchange=typeDefaults;for(const key of ['workEnabled','workMode','workAmount','matchEnabled','workMatchRate','workMatchCap','personalRecurring'])accountForm.elements[key].onchange=contributionPreview;accountForm.elements.workAmount.oninput=contributionPreview;accountForm.elements.growth.onchange=applyGrowth;accountForm.elements.rate.oninput=()=>{accountForm.elements.growth.value='custom';growthPreview()};
  function editAccount(account){editId=account?.id||null;accountForm.reset();accountForm.querySelector('details').open=false;$('retirementAccountError').textContent='';$('retirementAccountTitle').textContent=account?'Update your account':'Add an account';if(account){for(const key of ['name','type','balance','rate','included'])accountForm.elements[key].value=key==='balance'?accountBalance(account):(account[key]??'');const f=accountForm.elements;f.monthly.value=account.personalPerPay??Math.round(personalMonthly(account)*12/(data.frequency==='biweekly'?26:52)*100)/100;f.workEnabled.value=account.source!=='manual'?'yes':'no';f.personalRecurring.checked=['monthly','paycheck'].includes(account.personalSchedule);f.growth.value=account.growth||'custom';loadWorkFields();contributionPreview();growthPreview()}else{accountForm.elements.monthly.value=0;typeDefaults()}$('retirementAccountDialog').showModal();$('retirementAccountDialog').scrollTop=0}
  $('addRetirementAccount').onclick=()=>editAccount();$('cancelRetirementAccount').onclick=()=>$('retirementAccountDialog').close();
  accountForm.onsubmit=e=>{e.preventDefault();contributionPreview();const value=Object.fromEntries(new FormData(accountForm));value.personalPerPay=positive(value.monthly);value.personalSchedule=accountForm.elements.personalRecurring.checked?'paycheck':'forecast';value.monthly=value.personalPerPay*(data.frequency==='biweekly'?26:52)/12;if(value.source!=='manual'&&accounts().some(a=>a.id!==editId&&a.source===value.source)){$('retirementAccountError').textContent='That work contribution is already tracked in another account. Choose No for work contributions here.';return}if(value.source!=='manual'){const k=value.source;data[k+'Mode']=value.workMode;data[k]=positive(value.workAmount);data[k+'MatchRate']=value.matchEnabled==='yes'?positive(value.workMatchRate):0;data[k+'MatchCap']=value.matchEnabled==='yes'?positive(value.workMatchCap):0;for(const id of [k,k+'Mode',k+'MatchRate',k+'MatchCap'])$(id).value=data[id]}value.name=value.name.trim()||value.type;for(const key of ['balance','monthly','rate'])value[key]=Number(value[key]||0);value.balance=value.balance-data.savingsDeposits.filter(d=>d.accountId===editId).reduce((sum,d)=>sum+positive(d.amount),0);value.id=editId||Date.now()+'-'+Math.random().toString(36).slice(2);data.retirementAccounts=accounts().filter(a=>a.id!==editId);data.retirementAccounts.push(value);data.expenses=data.expenses.filter(e=>e.accountId!==value.id);if(value.personalSchedule==='paycheck'&&value.personalPerPay>0)data.expenses.push({name:'Transfer to '+value.name,amount:value.monthly,eachPayday:true,accountId:value.id});save();renderExpenses();render();$('retirementAccountDialog').close();draw();$('retirementAccountList').open=true};


  const depositDialog=document.createElement('dialog');depositDialog.id='accountDepositDialog';depositDialog.innerHTML=`<form id="accountDepositForm"><h2>Add personal deposit</h2><p id="accountDepositName" class="help"></p><div class="fields"><label>Amount transferred ($)<input name="amount" type="number" min="0.01" step="0.01" required inputmode="decimal"></label><label>Date transferred<input name="date" type="date" required></label><label>How should this count in Budget?<select name="budget"><option value="extra">Extra transfer from available spending</option><option value="scheduled">Payment of this account’s recurring transfer</option></select></label><label>Note — optional<input name="note" maxlength="80"></label></div><p id="accountDepositError" role="alert"></p><div class="purchase-edit-actions"><button type="button" id="cancelAccountDeposit">Cancel</button><button class="primary">Record deposit</button></div></form>`;retirementPanel.append(depositDialog);
  let depositAccountId=null;const accountDepositForm=$('accountDepositForm');
  function openAccountDeposit(a){depositAccountId=a.id;accountDepositForm.reset();$('accountDepositError').textContent='';$('accountDepositName').textContent=a.name+' · Record money you have already transferred.';accountDepositForm.elements.date.value=localDate();accountDepositForm.elements.date.max=localDate();accountDepositForm.elements.budget.options[1].disabled=!['monthly','paycheck'].includes(a.personalSchedule);accountDepositForm.elements.budget.value=['monthly','paycheck'].includes(a.personalSchedule)?'scheduled':'extra';depositDialog.showModal()}
  $('cancelAccountDeposit').onclick=()=>depositDialog.close();
  accountDepositForm.onsubmit=e=>{e.preventDefault();const a=accounts().find(a=>a.id===depositAccountId),v=Object.fromEntries(new FormData(accountDepositForm));if(!a||!positive(v.amount)||!v.date||v.date>localDate()){$('accountDepositError').textContent='Enter a positive amount and today or an earlier date.';return}if(v.budget==='scheduled'){const window=scheduledDepositWindow(a,v.date);if(!window){$('accountDepositError').textContent='Add your most recent payday on Budget first.';return}const prior=data.savingsDeposits.filter(d=>d.accountId===a.id&&d.recurring&&d.date>=window.start&&d.date<window.end).reduce((sum,d)=>sum+positive(d.amount),0);if(prior+positive(v.amount)>window.amount+0.005){$('accountDepositError').textContent='This exceeds your planned transfer for this pay period. Record the additional amount as an extra transfer.';return}}
  data.savingsDeposits.unshift({id:Date.now()+'-'+Math.random().toString(36).slice(2),accountId:a.id,goal:'account',amount:positive(v.amount),date:v.date,note:v.note,recurring:v.budget==='scheduled'});save();depositDialog.close();render();draw()};

  function draw(){
    const p=plan(),age=Number(p.age),retireAge=Number(p.retireAge),inflation=Number(p.inflation),spending=desiredSpending(p),target=spending*12/Math.max(1,positive(p.withdrawal))*100,list=accounts().filter(a=>a.included==='yes');
    const summary=$('retirementSummary'),chart=$('retirementChart');summary.replaceChildren();chart.replaceChildren();
    $('retirementSettingsExplanation').textContent=`We use ${p.withdrawal}% of your savings for your first retirement year, and allow for prices rising ${p.inflation}% each year. It’s a planning guide, not a guarantee. It doesn’t include Social Security, pensions, taxes or rules about when you can use each account.`;
    $('openRetirementPlan').textContent=age?'Change my plan':'Set up my retirement plan';
    const container=$('retirementAccounts');container.replaceChildren();$('retirementAccountsLabel').textContent=`Your accounts${accounts().length?' ('+accounts().length+')':''}`;
    if(!accounts().length)container.append(element('p','Start with your work retirement account or IRA. You can add savings and other investments too.','help'));
    for(const a of accounts()){
      const row=element('div','','retirement-account');row.append(element('h3',a.name),element('strong',money(accountBalance(a))+' saved','account-money'),element('p',money(personalMonthly(a)*12/(data.frequency==='biweekly'?26:52))+' personal / paycheck · '+money((monthly(a)-personalMonthly(a))*12/(data.frequency==='biweekly'?26:52))+' work + employer / paycheck · '+(a.included==='yes'?'For retirement':'For other goals'),'help'));
      if(age>=18&&retireAge>=age){const future=trajectory([a],age,inflation)[Math.round(retireAge-age)];row.append(element('p',`Could grow to ${money(future)} by age ${retireAge}.`,'help'))}
      const actions=element('div','','retirement-actions'),edit=element('button','Update'),remove=element('button','Remove');edit.onclick=()=>editAccount(a);remove.onclick=()=>{if(!confirm('Remove '+a.name+' from your accounts?'))return;data.retirementAccounts=accounts().filter(x=>x.id!==a.id);data.expenses=data.expenses.filter(e=>e.accountId!==a.id);save();renderExpenses();render();draw()};const deposit=element('button','Add personal deposit');deposit.onclick=()=>openAccountDeposit(a);actions.append(deposit,edit,remove);row.append(actions);const history=element('details');history.append(element('summary','Personal deposit history'));const deposits=data.savingsDeposits.filter(d=>d.accountId===a.id).sort((x,y)=>y.date.localeCompare(x.date));if(!deposits.length)history.append(element('p','No personal deposits recorded yet.','help'));for(const d of deposits){const entry=element('p',`${d.date} · ${money(d.amount)} · ${d.recurring?'Recurring transfer':'Extra transfer'}${d.note?' · '+d.note:''}`),undo=element('button','Remove record');undo.type='button';undo.onclick=()=>{if(!confirm('Remove this deposit record? The account balance and budget will update.'))return;data.savingsDeposits=data.savingsDeposits.filter(x=>x.id!==d.id);save();render();draw()};entry.append(undo);history.append(entry)}row.append(history);container.append(row);
    }
    const hero=element('div','','retirement-hero');summary.append(hero);
    if(!age||!spending||!list.length){hero.append(element('span','LET’S MAKE A PLAN','eyebrow'),element('h3','Your future, made clearer.'));hero.append(element('p',!list.length?'Add an account you’re saving in for retirement. Then tell us your age and when you’d like to stop working.':'Your accounts are ready. Tell us your age and when you’d like to stop working. We’ll use your budget to help with the rest.'));return}
    if(retireAge<age){hero.append(element('h3','Update your retirement age'),element('p','Choose your current age or older in Change my plan.'));return}
    const scenarios=[-2,0,2].map(delta=>trajectory(list,age,inflation,delta)),index=Math.round(retireAge-age),expected=scenarios[1][index],hit=scenarios[1].findIndex(v=>v>=target),gap=Math.max(0,target-expected),isOnTrack=gap===0;
    hero.append(element('span',`YOUR PLAN · RETIRE AT ${retireAge}`,'eyebrow'),element('h3',isOnTrack?'You’re on track in this estimate':'Your plan needs more savings'));
    hero.append(element('p',hit<0?'At your current pace, your savings don’t reach the amount needed by age 100.':hit===0?'Your savings already meet this estimated target.':`At your current pace, you could reach your savings target around age ${age+hit}.`));
    const projected=element('div','','retirement-numbers');for(const [label,value,note] of [['You could have',money(expected),`By age ${retireAge}`],['Your savings target',money(target),`For ${money(spending)} each month`]]){const box=element('div',label,'retirement-number');box.append(element('strong',value),element('small',note));projected.append(box)}summary.append(projected);
    if(!isOnTrack&&index>0){const extra=extraNeeded(list,age,retireAge,inflation,target);summary.append(element('p',`One way to close the gap: save about ${money(Math.ceil(extra/10)*10)} more each month toward retirement. Or change your retirement age or monthly spending.`,'help'),element('small','This extra savings example uses the highest growth estimate among your retirement accounts. It is a forecast, not an amount taken from your budget.','help'))}else if(!isOnTrack){summary.append(element('p',`You’d need about ${money(gap)} more saved to reach the target today. Try a later retirement age or a lower monthly amount.`,'help'))}
    const incomplete=list.some(a=>a.source!=='manual'&&contribution(a.source==='ira'?'ira':'retirement401k').needsGross);if(incomplete)summary.append(element('p','Your paycheck savings are incomplete. Add gross pay on Budget so we can include your contributions and employer match.','help'));
    if(p.spendingMode==='budget'&&!budgetSpending().ready)summary.append(element('p','We’re using your bills so far. This picture will update after we’ve learned 30 days of everyday spending.','help'));
    summary.append(element('p','Amounts are shown in today’s money. This is a savings estimate, not a guaranteed retirement date.','help'));
    const details=element('details');details.append(element('summary','See how your savings could grow'));chart.append(details);
    const last=Math.min(scenarios[1].length-1,Math.max(index+5,20)),max=Math.max(target,...scenarios.flatMap(s=>s.slice(0,last+1)),1)*1.08,x=i=>70+i/Math.max(1,last)*480,y=v=>215-v/max*170;
    const moneyShort=v=>v>=1e6?'$'+(v/1e6).toFixed(1)+'m':v>=1e3?'$'+Math.round(v/1000)+'k':'$'+Math.round(v);
    const svg=element('div');svg.innerHTML=`<svg viewBox="0 0 600 260" role="img" aria-label="Your estimated savings and target from age ${age} to ${age+last}"><text x="5" y="45" font-size="12" fill="#496980">${moneyShort(max)}</text><text x="32" y="218" font-size="12" fill="#496980">$0</text><line x1="70" y1="${y(target)}" x2="550" y2="${y(target)}" stroke="#b68423" stroke-dasharray="5 5"/><text x="75" y="${Math.max(25,y(target)-9)}" font-size="12" fill="#86601e">Your target</text><polyline points="${scenarios[1].slice(0,last+1).map((v,i)=>x(i).toFixed(1)+','+y(v).toFixed(1)).join(' ')}" fill="none" stroke="#176cab" stroke-width="3"/><line x1="70" y1="215" x2="550" y2="215" stroke="#bdd3e2"/><text x="70" y="242" font-size="12">Age ${age}</text><text x="475" y="242" font-size="12">Age ${age+last}</text></svg>`;details.append(svg,element('p','Blue is your estimated savings. The gold line is the amount you’re aiming for.','help'));
    const table=element('table'),head=element('tr');for(const title of ['If growth is…',`Saved by ${retireAge}`]){const th=element('th',title);th.scope='col';head.append(th)}table.append(head);scenarios.forEach((s,i)=>{const row=element('tr');row.append(element('td',['Slower','As estimated','Faster'][i]),element('td',money(s[index])));table.append(row)});details.append(table);
  }
  function simplifyGoalProgress(){
    const cards=$('savingsProgress').children;Array.from(cards).forEach((card,i)=>{if(i===0){card.querySelector('h3').textContent='Emergency cushion';const description=element('p','Money for unexpected bills. We work out a three-month target for you.','help');card.querySelector('h3').after(description)}card.hidden=i===1&&!positive(data.tripCost)&&!data.tripName||i===2&&!data.customGoalName&&!positive(data.customGoalTarget);const source=card.querySelector('small');if(source)source.hidden=true;if(!card.hidden){const add=element('button','+ Add savings','secondary-goal');add.type='button';add.onclick=()=>{$('savingsGoal').value=['emergency','vacation','custom'][i];depositDetails.open=true;$('savingsAmount').focus()};card.append(add)}});
    if(!data.customGoalName&&!positive(data.customGoalTarget)){const note=element('p','Saving for something else? Add it in “Set up or change your goals.”','help');$('savingsProgress').append(note)}
    $('savingsGoal').options[0].textContent='Emergency cushion';
    const learned=tracking(),pay=positive(data.pay),periods=data.frequency==='biweekly'?26:52,bills=data.expenses.filter(e=>!trackedNames.has(e.name)).reduce((sum,e)=>sum+positive(e.amount),0),available=pay-(bills+learned.monthly)*12/periods;
    $('recommendationReason').textContent=!pay?'Add your paycheck on Budget. We’ll work out what you can save.':!learned.ready?'Keep logging purchases. After 30 days, we’ll suggest an amount that fits your everyday spending.':available<=0?'Your bills and recent spending use up your pay. Review Budget before putting extra money away.':'Based on your pay, bills and recent purchases. Put this amount into savings when it fits your plan.';
    if(!learned.ready)$('suggested').textContent='Coming soon';
  }
  const originalRender=render;render=function(){originalRender();simplifyGoalProgress();draw()};simplifyGoalProgress();draw();
})();

// Recommendations use actual budget inputs; they never move money or rewrite pay.
function buildRecommendations(input){
  const {pay,periods,monthlyCosts,ready,profile,emergencySaved,work,ira,matchCap,gross,age,tripNeed,year}=input;
  const monthlyIncome=pay*periods/12,room=Math.max(0,monthlyIncome-monthlyCosts);
  // IRA amounts funded from a bank account must be reserved within this plan only.
  const existingIRA=input.bankIRA!==undefined?input.bankIRA:(profile.iraFunding==='payroll'?0:ira.employee*periods/12);
  const afterExisting=Math.max(0,room-existingIRA),budget=ready?afterExisting*.5:0;
  let remaining=budget;const steps=[];
  function allocate(key,title,need,why){const amount=Math.max(0,Math.min(remaining,need));remaining-=amount;if(amount>0)steps.push({key,title,amount,why});return amount}
  if(input.payrollMissing)return {monthlyIncome,room,existingIRA,afterExisting,budget:0,steps,remaining:0,iraLimit:0,iraRoom:0,blocked:'payroll'};
  if(!ready)return {monthlyIncome,room,existingIRA,afterExisting,budget,steps,remaining:0,iraLimit:0,iraRoom:0,blocked:'learning'};
  if(monthlyIncome<=monthlyCosts||existingIRA>room)return {monthlyIncome,room,existingIRA,afterExisting,budget,steps,remaining:0,iraLimit:0,iraRoom:0,blocked:'tight'};
  const starterGap=Math.max(0,monthlyCosts-emergencySaved);
  allocate('emergency','Build a starter cash cushion',starterGap,`First, build one month of bills and everyday spending: ${money(monthlyCosts)}. This helps you handle a surprise without borrowing.`);
  const workLimit=year===2026?(age>=60&&age<=63?35750:age>=50?32500:24500):0;
  const matchGap=year===2026&&profile.workMatch==='yes'&&gross>0&&matchCap>0&&work.employer>=0&&input.matchRate>0?Math.min(Math.max(0,gross*matchCap/100-work.employee),Math.max(0,workLimit/periods-work.employee))*periods/12:0;
  allocate('match','Review your full work match',matchGap,'This reserves room for increasing your work retirement savings. Changing payroll can change your take-home pay; confirm the new paycheck and remaining annual contribution room before using the rest of this plan. Check the match and ownership rules with your employer. Employer money is added separately.');
  const debtUnknown=!['yes','no'].includes(profile.debt),debtBalance=positive(profile.debtBalance),debtRate=positive(profile.debtRate),debtHigh=profile.debt==='yes'&&debtRate>=8;
  if(debtUnknown||(profile.debt==='yes'&&(!debtBalance||profile.debtRate===''))){allocate('hold','Keep this available for now',remaining,'Add your debt details below so we can decide whether extra debt payments should come before investing.');return {monthlyIncome,room,existingIRA,afterExisting,budget,steps,remaining:0,iraLimit:0,iraRoom:0,blocked:'debt'}}
  if(debtHigh){allocate('debt','Pay extra toward expensive debt',debtBalance,`Your highest rate is ${debtRate}%. Paying it down avoids interest. Minimum payments should already be in Budget.`);if(remaining>0)allocate('hold','Keep this available until the debt is paid',remaining,'Update the debt balance after you pay it off. We’ll then work out your next savings step.');return {monthlyIncome,room,existingIRA,afterExisting,budget,steps,remaining:0,iraLimit:0,iraRoom:0,blocked:'debtPriority'}}
  allocate('emergency','Grow your emergency cushion',Math.max(0,monthlyCosts*3-emergencySaved-starterGap),`Work toward three months of bills and everyday spending: ${money(monthlyCosts*3)}. This is Cloud Stash’s starting target; some households need more.`);
  allocate('trip','Keep your trip on schedule',Math.max(0,tripNeed),'This is the amount needed each month to reach the trip date and cost you entered on Goals. Keep near-term trip money in savings.');
  allocate('other','Save toward your other dated goal',positive(input.otherNeed),'This uses the amount and date you entered for your other goal on Plan. Compare it with the trip amount too; both share the same budget.');
  const iraLimit=year===2026?(age>=50?8600:7500):0;
  const iraRoom=profile.iraEligible==='yes'&&profile.iraYear===String(year)&&profile.iraYtd!==''?Math.max(0,iraLimit-positive(profile.iraYtd)):0;
  const monthsLeft=Math.max(1,13-input.month),baseAnnualFuture=ira.employee*periods/12*monthsLeft;
  const extraIRA=Math.max(0,iraRoom/monthsLeft-ira.employee*periods/12);
  if(iraRoom>0)allocate('ira','Add a little more to your IRA',extraIRA,`This is extra on top of the IRA savings already entered on Budget or as manual account contributions on Goals. We’ve allowed for that amount and what you’ve contributed this year across all your Roth and traditional IRAs.`);
  if(remaining>0)allocate('hold',iraRoom>0?'Save for your other goals':'Keep saving while you check your IRA',remaining,iraRoom>0?'Your cash cushion and the IRA room you confirmed are covered in this plan. Keep this money for other goals, or review increasing your work retirement savings.':'Confirm your IRA eligibility and this year’s contributions below before adding extra money to an IRA.');
  return {monthlyIncome,room,existingIRA,afterExisting,budget,steps,remaining,iraLimit,iraRoom,baseAnnualFuture,blocked:''};
}
(function setupRecommendations(){
  const page= document.createElement('section');page.id='recommendations';page.className='page';page.hidden=true;page.setAttribute('aria-label','Personal savings recommendations');
  page.innerHTML=`<div class="heading"><div><h1>Recommendations</h1></div><p>A clear next step for the money you have left.</p></div>
  <div class="card"><div id="recommendationSummary" aria-live="polite"></div><div id="recommendationSteps"></div><details class="recommendation-detail"><summary>See the numbers behind your plan</summary><div id="recommendationMath"></div><p class="help">We keep half of the room after bills, spending and bank-funded IRA savings available as a buffer. The other half is this suggested plan. That 50% buffer is Cloud Stash’s approach, not a market forecast. Existing 401(k) and healthcare paycheck deductions aren’t subtracted from take-home pay again. Employer matches aren’t spendable income. No money moves automatically.</p></details></div>
  <details class="card recommendation-profile"><summary>A few details to make this more useful</summary><p class="help">Your pay, bills, purchases, goal balances and planned IRA contributions come from the rest of the app. These details fill the gaps.</p><form id="recommendationProfileForm"><div class="fields"><label>Do you carry debt from month to month?<select name="debt"><option value="unknown">Not entered yet</option><option value="no">No</option><option value="yes">Yes</option></select></label><label id="recommendDebtBalance">Balance of the debt with your highest rate<input name="debtBalance" type="number" min="0" step="0.01" inputmode="decimal"></label><label id="recommendDebtRate">That debt’s interest rate (%)<input name="debtRate" type="number" min="0" max="100" step="0.01" inputmode="decimal"></label><label>Does your work plan offer the match entered on Budget?<select name="workMatch"><option value="unknown">I haven’t checked</option><option value="yes">Yes, I checked the plan</option><option value="no">No employer match</option></select></label><label>How do you fund the IRA savings entered on Budget?<select name="iraFunding"><option value="bank">From my bank account / take-home pay</option><option value="payroll">Already taken out before my take-home pay</option></select></label><label>Your savings account’s yearly interest rate (%) — optional<input name="savingsApy" type="number" min="0" max="20" step="0.01" inputmode="decimal" placeholder="Check your bank’s current rate"></label></div>
  <details><summary>Ready to add more to an IRA?</summary><p class="help">The 2026 limit is $7,500 across all Roth and traditional IRAs, or $8,600 at age 50+. Contributions also depend on eligible earned income, and Roth eligibility depends on tax income and filing status. Gross pay alone doesn’t prove eligibility. <a href="https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500" target="_blank" rel="noopener">Check the IRS rules</a> or ask your IRA provider.</p><div class="fields"><label>Have you confirmed you can use the full IRA limit for this year?<select name="iraEligible"><option value="unknown">Not yet / only a reduced amount</option><option value="yes">Yes — full limit and enough eligible income</option><option value="no">No</option></select></label><label>Tax year you checked<select name="iraYear"><option value="2026">2026</option></select></label><label>Already added this year to ALL Roth and traditional IRAs<input name="iraYtd" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Enter 0 if none; don’t include rollovers"></label></div><p class="help">Include all contributions credited to this tax year, including deposits made outside this app. IRA balance and investment growth are not contributions. If you don’t know your age in Goals, we use the lower $7,500 limit. Update this total after contributing. We plan through December, not the tax-filing deadline.</p></details><button class="primary" type="submit">Update my recommendations</button><p id="recommendationProfileStatus" class="help" role="status"></p></form></details>
  <div class="card market-context"><h2>Where your money could work harder</h2><p id="recommendationMarketDate" class="help"></p><div class="market-rate-grid"><div><span>Typical bank savings</span><strong>0.37%</strong><small>National average · September 2026</small></div><div><span>One high-yield savings offer</span><strong>3.50%</strong><small>Marcus · variable yearly interest (APY)</small></div></div><p id="recommendationMarketInsight" class="help"></p><p class="help">Cash you might need soon belongs somewhere accessible. Compare interest, fees and deposit insurance. The offer above is a comparison example, not a bank ranking; rates can change.</p><details><summary>What about investing for retirement?</summary><p id="recommendationInvestingContext" class="help"></p><p class="help">An IRA is the account that holds investments. Adding money doesn’t necessarily invest it: choose investments inside the account. A diversified, low-cost target-date fund can simplify retirement investing, but it can lose value. Match the fund’s mix and fees to your timeline and comfort with losses. Money for emergencies or a near-term trip should stay separate.</p></details><div class="recommendation-links"><a href="https://www.marcus.com/us/en/savings/high-yield-savings" target="_blank" rel="noopener">Check the bank’s current rate</a><a href="https://fred.stlouisfed.org/release/tables?eid=1217866&rid=317" target="_blank" rel="noopener">National savings rate source</a><a href="https://www.investor.gov/introduction-investing/getting-started/asset-allocation" target="_blank" rel="noopener">Choosing investments</a></div></div>
  <details class="card recommendation-detail"><summary>Why these priorities?</summary><p class="help">Cloud Stash starts with a one-month cash cushion, reviews any employer match, prioritizes debt charging 8% or more, builds a three-month cushion, considers your dated trip goal, then suggests extra IRA savings within the room you confirmed. This ordering and allocation are Cloud Stash’s planning rules. It doesn’t analyze every part of your finances or predict market returns.</p><div class="recommendation-links"><a href="https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/pay-credit-cards-or-other-high-interest" target="_blank" rel="noopener">Why expensive debt comes first</a><a href="https://www.investor.gov/introduction-investing" target="_blank" rel="noopener">Emergency savings and employer matches</a><a href="https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500" target="_blank" rel="noopener">2026 retirement limits</a></div></details>`;
  $('goals').after(page);const nav=document.createElement('button');nav.textContent='Advice';nav.dataset.page='recommendations';nav.setAttribute('aria-label','Recommendations');document.querySelector('.tabs [data-page="goals"]').after(nav);nav.onclick=()=>openPage('recommendations');
  const css=document.createElement('style');css.textContent=`.tabs{grid-template-columns:repeat(6,minmax(0,1fr))}.recommendation-hero{background:linear-gradient(125deg,#0a2843,#14699a);color:#fff;border-radius:18px;padding:22px;margin-bottom:18px}.recommendation-hero h2{color:#fff;font-size:1.6rem;margin:8px 0}.recommendation-hero p{color:#e3f2ff;line-height:1.5}.recommendation-step{padding:18px 0;border-bottom:1px solid #dbe7f0}.recommendation-step h3{margin:0 0 7px;color:#194e74}.recommendation-step strong{font-size:1.25rem;color:#176e9e}.recommendation-step p{line-height:1.5}.recommendation-detail,.recommendation-profile{margin-top:18px}.recommendation-detail summary,.recommendation-profile summary,.market-context summary{font-weight:700;color:#285777;cursor:pointer;padding:7px 0}.recommendation-profile .fields{margin-top:14px}.recommendation-profile form>button{margin-top:15px}.market-context{margin-top:18px}.market-rate-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}.market-rate-grid>div{background:#edf6fc;border-radius:14px;padding:15px}.market-rate-grid strong,.market-rate-grid small{display:block;margin-top:7px}.market-rate-grid strong{font-size:1.6rem;color:#175983}.market-rate-grid small{color:#5b7489}.recommendation-links{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;font-size:.85rem}.recommendation-math-row{display:flex;justify-content:space-between;gap:15px;padding:9px 0;border-bottom:1px solid #e0eaf2}.recommendation-steps-note{padding:12px;border-radius:10px;background:#eaf4fc}.recommendation-profile [role="alert"]{color:#9b362b}@media(max-width:600px){.tabs button{font-size:.72rem;padding:11px 3px}.recommendation-profile .fields{grid-template-columns:1fr}.recommendation-hero{padding:18px}.market-rate-grid>div{padding:12px}.market-rate-grid{font-size:.85rem}}
  `;document.head.append(css);
  const form=$('recommendationProfileForm');
  function profile(){return {debt:'unknown',debtBalance:'',debtRate:'',workMatch:'unknown',iraFunding:'bank',savingsApy:'',iraEligible:'unknown',iraYear:'2026',iraYtd:'',...data.recommendationProfile}}
  for(const [key,value] of Object.entries(profile()))if(form.elements[key])form.elements[key].value=value;
  function debtFields(){const hasDebt=form.elements.debt.value==='yes';for(const [id,key] of [['recommendDebtBalance','debtBalance'],['recommendDebtRate','debtRate']]){$(id).hidden=!hasDebt;form.elements[key].required=hasDebt}form.elements.iraYtd.required=form.elements.iraEligible.value==='yes'}
  form.elements.debt.onchange=debtFields;form.elements.iraEligible.onchange=debtFields;debtFields();
  form.onsubmit=e=>{e.preventDefault();data.recommendationProfile=Object.fromEntries(new FormData(form));save();render();$('recommendationProfileStatus').textContent='Your recommendations are updated. Your budget and savings entries stay as they are.'};
  function node(tag,text,className=''){const el=document.createElement(tag);el.textContent=text;el.className=className;return el}


  function draw(){
    const learned=tracking(),periods=data.frequency==='biweekly'?26:52,p=profile(),work=contribution('retirement401k'),payrollIRA=contribution('ira'),now=new Date(),year=now.getFullYear();
    const manualIRA=(data.retirementAccounts||[]).filter(a=>/IRA/.test(a.type||'')).reduce((sum,a)=>sum+personalMonthly(a),0);
    const ira={...payrollIRA,employee:payrollIRA.employee+manualIRA*12/periods},bankIRA=(p.iraFunding==='payroll'||(data.retirementAccounts||[]).some(a=>a.source==='ira')?0:payrollIRA.employee*periods/12)+manualIRA-(data.retirementAccounts||[]).filter(a=>/IRA/.test(a.type||'')&&['monthly','paycheck'].includes(a.personalSchedule)).reduce((sum,a)=>sum+personalMonthly(a),0);
    const bills=data.expenses.filter(e=>!trackedNames.has(e.name)).reduce((sum,e)=>sum+positive(e.amount),0),monthlyCosts=bills+(learned.ready?learned.monthly:0),emergencySaved=positive(data.emergencySaved)+savedFor('emergency'),tripRemaining=Math.max(0,positive(data.tripCost)-positive(data.tripSaved)-savedFor('vacation')),checks=data.tripDate?approximatePaychecks(data.tripDate):0;
    const result=buildRecommendations({pay:positive(data.pay),periods,monthlyCosts,ready:learned.ready&&positive(data.pay)>0&&monthlyCosts>0,profile:p,emergencySaved,work,ira,bankIRA,payrollMissing:payrollIRA.needsGross,matchCap:Math.min(100,positive(data.retirement401kMatchCap)),matchRate:positive(data.retirement401kMatchRate),gross:positive(data.grossPay),age:positive(data.retirementPlan?.age),tripNeed:checks?tripRemaining/checks*periods/12:0,otherNeed:data.customGoalDate&&approximatePaychecks(data.customGoalDate)?Math.max(0,positive(data.customGoalTarget)-positive(data.customGoalSaved)-savedFor('custom'))/approximatePaychecks(data.customGoalDate)*periods/12:0,year,month:now.getMonth()+1});
    const summary=$('recommendationSummary'),steps=$('recommendationSteps');summary.replaceChildren();steps.replaceChildren();const hero=node('div','','recommendation-hero');summary.append(hero);const perPay=result.budget*12/periods;
    hero.append(node('h2',result.blocked==='payroll'?'Complete your paycheck details':result.blocked==='learning'?'Let’s build your picture':result.blocked==='tight'?'Protect your everyday budget':`${money(perPay)} each payday to put to work`));hero.append(node('p',result.blocked==='payroll'?'Add gross pay on Budget so we can calculate the IRA savings you already entered before suggesting extra amounts.':result.blocked==='learning'?'Add your paycheck and bills, then log 30 days of purchases. We’ll use your real spending to suggest amounts.':result.blocked==='tight'?'Your tracked bills, spending and existing bank-funded IRA savings leave no room for extra savings. Review Budget before increasing contributions.':`This plan uses what’s left after your bills and everyday spending, allows for existing bank-funded IRA savings, and keeps half of the remaining room available as a buffer.`));
    result.steps.forEach((step,i)=>{const row=node('div','','recommendation-step');row.append(node('h3',`${i+1}. ${step.title}`),node('strong',money(step.amount*12/periods)+' each payday'),node('p',step.why,'help'));if(step.key==='emergency'||step.key==='trip'||step.key==='other'){const button=node('button','See my goals','secondary-goal');button.onclick=()=>openPage('futureplans');row.append(button)}else if(step.key==='match'){const button=node('button','Review my work savings','secondary-goal');button.onclick=()=>openPage('expenses');row.append(button)}steps.append(row)});
    if(result.budget&&!['yes','no'].includes(p.workMatch))steps.append(node('p','Check your employer match in the details below. We haven’t assumed you qualify for one.','recommendation-steps-note help'));
    if(work.needsGross||ira.needsGross)steps.append(node('p','Enter gross pay on Budget so percentage-based retirement savings and matches can be included.','help'));
    if(p.iraEligible==='yes'&&p.iraYear===String(year)&&result.iraLimit&&positive(p.iraYtd)+ira.employee*periods/12*Math.max(1,12-now.getMonth())>result.iraLimit)steps.append(node('p','Your current IRA amount could exceed the annual room you confirmed. Review it with your IRA provider before contributing more.','help'));
    if(ira.employee>0&&!result.blocked&&p.iraFunding==='bank')steps.append(node('p',`${money(result.existingIRA*12/periods)} of each payday is reserved for the IRA savings you already entered on Budget or in your account forecasts. The plan above is extra; your take-home pay hasn’t been edited.`,'help'));
    if(year!==2026)steps.append(node('p','The stored retirement limits cover 2026. Check updated IRS limits before adding to an IRA; extra IRA recommendations are paused.','help'));
    const math=$('recommendationMath');math.replaceChildren();for(const [title,value] of [['Take-home pay each month',result.monthlyIncome],['Bills and everyday spending',monthlyCosts],['Left after bills and spending',result.room],['Existing IRA funded from your bank',result.existingIRA],['Left after that IRA amount',result.afterExisting],['Suggested extra savings plan',result.budget],['Remaining buffer',result.afterExisting-result.budget]]){const row=node('div','','recommendation-math-row');row.append(node('span',title),node('strong',money(value)));math.append(row)}
    const checked=new Date('2026-10-12T12:00:00Z'),stale=now-checked>30*86400000;$('recommendationMarketDate').textContent=stale?'Saved comparison checked October 12, 2026 — now out of date. Use the source links to check current offers.':'Rates checked October 12, 2026. This is a dated comparison, not a live feed.';
    const savedCash=emergencySaved,knownApy=p.savingsApy!==''&&p.savingsApy!=null;
    $('recommendationMarketInsight').textContent=!stale&&knownApy&&Number(p.savingsApy)<3.5&&savedCash>0?`Your emergency goal has ${money(savedCash)} saved. At the example 3.50% rate instead of your ${Number(p.savingsApy)}% rate, that balance could earn about ${money(savedCash*(3.5-Number(p.savingsApy))/100)} more in a year before taxes, if both rates and the balance stayed the same. Check the current offer first.`:knownApy&&Number(p.savingsApy)>=3.5?'Your entered savings rate is at least as high as this comparison offer. Compare fees and access before moving money.':'A high-yield savings account may pay more than a typical bank savings account. Enter your bank’s rate above to compare it with this example.';
    const age=positive(data.retirementPlan?.age),retireAge=positive(data.retirementPlan?.retireAge),years=retireAge-age;$('recommendationInvestingContext').textContent=age&&retireAge?`Your retirement plan is about ${Math.max(0,years)} years away. ${years>=10?'A long timeline can make diversified stock and bond funds worth considering, depending on your comfort with market losses.':'With retirement closer, review how much risk your investments take and how much cash you’ll need.'}`:'Add your age and retirement goal on Goals to put investing choices in context.';
  }
  const originalRender=render;render=function(){originalRender();draw()};draw();
})();

function monthlyLoanPayment(principal,annualRate,months){
  if(principal<=0)return 0;const rate=annualRate/1200;
  return rate===0?principal/months:principal*rate/(1-Math.pow(1+rate,-months));
}
function loanBalanceForPayment(payment,annualRate,months){
  if(payment<=0)return 0;const rate=annualRate/1200;
  return rate===0?payment*months:payment*(1-Math.pow(1+rate,-months))/rate;
}
(function organizeFuturePlanning(){
  const el=(tag,text='',className='')=>{const n=document.createElement(tag);n.textContent=text;n.className=className;return n};
  // Keep the old page IDs and storage keys so existing links and saved data work.
  const savings=$('goals');savings.querySelector('h1').textContent='Savings';savings.querySelector('.heading p').textContent='Your accounts today. Your possibilities tomorrow.';savings.querySelector('.goal-switch').hidden=true;
  $('retirementSavingsPanel').hidden=false;$('savingsGoalsPanel').hidden=false;
  const planner=el('section','','page');planner.id='futureplans';planner.hidden=true;planner.setAttribute('aria-label','Goals and purchase planning');
  planner.innerHTML=`<div class="heading"><div><h1>Plan ahead</h1></div><p>Give your next big idea a clear path.</p></div><div class="goal-switch" role="group" aria-label="Choose a plan"><button id="viewGoalPlans" aria-pressed="true">Savings goals</button><button id="viewPurchasePlans" aria-pressed="false">Car & home</button></div><div id="goalPlansContent"></div><div id="purchasePlansContent" hidden><div class="card"><h2>Could this payment fit?</h2><p class="help">Use a price and loan quote to see how it would affect your budget.</p><form id="purchasePlanForm"><div class="fields"><label>What are you planning?<select name="type"><option value="car">A car</option><option value="home">A home</option></select></label><label>Purchase price<input name="price" type="number" min="1" step="0.01" inputmode="decimal" required></label><label>Down payment<input name="down" type="number" min="0" step="0.01" inputmode="decimal" required></label><label>Yearly loan interest rate (%)<input name="rate" type="number" min="0" max="50" step="0.01" inputmode="decimal" required placeholder="Use a quote from a lender"></label><label><span id="purchaseTermLabel">Loan length in months</span><input name="term" type="number" min="1" max="120" step="1" required></label><label><span id="purchaseExtrasLabel">Extra monthly insurance & running costs</span><input name="extras" type="number" min="0" step="0.01" inputmode="decimal" required placeholder="Enter a realistic estimate, or 0 if none"></label></div><details><summary>Costs this would replace & other details</summary><div class="fields"><label>Existing payment this would replace<select name="replacement"><option value="none">None — this is an extra cost</option><option value="car">My current car payment</option><option value="home">My current rent / mortgage</option></select></label><label>Extra fees added to the loan<input name="fees" type="number" min="0" step="0.01" inputmode="decimal"></label></div><p id="purchaseCostsHelp" class="help"></p></details><button type="submit" class="primary">See how it fits</button><p id="purchasePlanError" role="alert"></p></form></div><div id="purchasePlanResult" class="card" aria-live="polite"></div><details class="card"><summary>What this estimate includes</summary><p class="help">We calculate a fixed-rate loan payment, add the ownership costs you enter, and compare the total with your budget. We protect half of your existing room after bills, spending and bank-funded IRA savings. A replaced payment is released from your current bills before comparing the new cost.</p><p class="help">This is a budget preview, not lender approval. A lender also considers credit, debt, income and loan rules. Rate estimates should come from a quote. Closing costs, upfront taxes, cash reserves and other costs paid outside the loan must be funded separately; a down payment entered here isn’t proof you’ve saved it.</p><a href="https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/" target="_blank" rel="noopener">Home payment guidance from the CFPB</a></details></div>`;
  savings.after(planner);$('goalPlansContent').append($('savingsGoalsPanel'));
  const nav=document.querySelector('.tabs'),planTab=el('button','Plan');planTab.dataset.page='futureplans';planTab.onclick=()=>openPage('futureplans');nav.querySelector('[data-page="recommendations"]').after(planTab);
  nav.querySelector('[data-page="goals"]').textContent='Savings';nav.querySelector('[data-page="expenses"]').textContent='Budget';
  const spendingTab=nav.querySelector('[data-page="breakdown"]');spendingTab.textContent='Spending';spendingTab.setAttribute('aria-label','Spending breakdown and transaction history');nav.querySelector('[data-page="plan"]').after(spendingTab);
  $('expenses').querySelector('h1').textContent='My budget';$('expenses').querySelector('.heading p').textContent='Start with your paycheck and regular bills.';
  const overviewLinks=el('div','','overview-shortcuts');for(const [name,target] of [['Pay & bills','expenses'],['My purchases','breakdown']]){const button=el('button',name,'secondary-goal');button.onclick=()=>openPage(target);overviewLinks.append(button)}$('plan').querySelector('.overview-heading').append(overviewLinks);
  $('breakdown').querySelector('h1').textContent='Spending';
  $('breakdown').querySelector('.history-head h2').textContent='Transaction history';
  const spendingLink=el('button','Spending breakdown & transaction history →','home-spending-link');spendingLink.type='button';spendingLink.onclick=()=>openPage('breakdown');document.querySelector('.quick-card').append(spendingLink);
  const spendingStyle=el('style');spendingStyle.textContent=`.tabs{grid-template-columns:repeat(7,minmax(0,1fr))}.home-spending-link{display:block;width:100%;min-height:44px;margin-top:10px;padding:10px 0;border:0;border-top:1px solid #bdd8ec;background:transparent;color:#17658a;font-weight:700;text-align:left;font-size:.85rem}.home-spending-link:focus-visible{outline:3px solid #58abda;outline-offset:2px}@media(max-width:740px){.tabs{grid-template-columns:repeat(4,minmax(0,1fr))}.tabs button{min-height:44px}.home-spending-link{font-size:.8rem}}`;document.head.append(spendingStyle);
  function plannerView(purchases){$('goalPlansContent').hidden=purchases;$('purchasePlansContent').hidden=!purchases;$('viewGoalPlans').setAttribute('aria-pressed',String(!purchases));$('viewPurchasePlans').setAttribute('aria-pressed',String(purchases))}
  $('viewGoalPlans').onclick=()=>plannerView(false);$('viewPurchasePlans').onclick=()=>plannerView(true);
  const setup=$('customGoalName').closest('.fields'),dateLabel=el('label','When would you like to reach it? (optional)'),dateInput=el('input');dateInput.type='date';dateInput.id='customGoalDate';dateInput.value=data.customGoalDate||'';dateLabel.append(dateInput);setup.append(dateLabel);dateInput.onchange=()=>{data.customGoalDate=dateInput.value;save();render()};
  const goalDateResult=el('p','','help');goalDateResult.id='customGoalDateResult';$('savingsProgress').after(goalDateResult);
  // Forecasting accounts doesn't need a retirement age to show 10/20/30-year examples.
  const outlook=el('div','','card savings-horizon-card');outlook.innerHTML=`<h2>Your savings over time</h2><p id="savingsHorizonIntro" class="help"></p><div id="savingsHorizons" class="savings-horizons" aria-live="polite"></div><div id="savingsAccountControls" class="retirement-main-actions"></div><p class="help">These examples assume you keep adding the same amount and use the growth estimates in your accounts. They allow for rising prices, so values are in today’s money. They don’t include withdrawals, taxes or future contribution limits.</p>`;
  $('retirementSavingsPanel').prepend(outlook);$('savingsAccountControls').append($('addRetirementAccount'));outlook.append($('retirementAccountList'));
  const oldRetirement=savings.querySelector('.retirement-outlook'),retireDetails=el('details','','card retirement-plan-details');retireDetails.append(el('summary','When could I retire?'));oldRetirement.before(retireDetails);retireDetails.append(oldRetirement);savings.append($('retirementAccountDialog'),$('retirementPlanDialog'));
  $('welcomeDialog').querySelector('.welcome-next').textContent='Then log purchases on Overview, add savings accounts on Savings, and plan your goals on Plan. Advice uses your spending history once you’ve logged 30 days.';
  const principles=el('details','','card expert-guidance');principles.innerHTML=`<summary>Guidance behind your recommendations</summary><p id="expertSavingsComparison" class="help"></p><p class="help">Fidelity suggests working toward saving 15% of before-tax pay for retirement, including employer contributions. It’s a starting guideline; your age, savings and retirement plans can change what you need. Cloud Stash’s recommendations stay within your budget rather than forcing this percentage.</p><p class="help">Investor.gov emphasizes diversification and choosing investments for your timeline and comfort with losses. These principles support steady planning rather than chasing recent winners.</p><div class="recommendation-links"><a href="https://www.fidelity.com/learning-center/smart-money/how-much-should-i-contribute-to-my-401k" target="_blank" rel="noopener">Fidelity’s retirement savings guidance</a><a href="https://www.investor.gov/introduction-investing/getting-started/asset-allocation" target="_blank" rel="noopener">Investor.gov’s investment guidance</a></div><p class="help">These organizations haven’t reviewed or endorsed Cloud Stash. The suggested order and dollar amounts are calculated by this app, not supplied by an investor or adviser.</p>`;$('recommendations').append(principles);
  const form=$('purchasePlanForm');const initial={type:'car',price:'',down:0,rate:'',term:60,extras:'',replacement:'none',fees:0,...data.purchasePlan};
  for(const [key,value] of Object.entries(initial))form.elements[key].value=value;
  function costLabels(){const home=form.elements.type.value==='home';$('purchaseTermLabel').textContent=home?'Loan length in years':'Loan length in months';form.elements.term.max=home?40:120;$('purchaseExtrasLabel').textContent=home?'Monthly taxes, insurance, HOA & upkeep':'Extra monthly insurance, maintenance & running costs';$('purchaseCostsHelp').textContent=home?'Include property taxes, home and mortgage insurance, HOA fees and maintenance. Add any extra utilities above your current budget.':'Include extra costs above what’s already in your budget, such as higher insurance, maintenance or fuel. Your existing insurance and logged spending stay in the budget.'}
  form.elements.type.onchange=()=>{form.elements.term.value=form.elements.type.value==='home'?30:60;form.elements.replacement.value='none';costLabels()};costLabels();
  form.onsubmit=e=>{e.preventDefault();const value=Object.fromEntries(new FormData(form));if(Number(value.down)>Number(value.price)){$('purchasePlanError').textContent='The down payment can’t be more than the purchase price.';return}if(value.replacement!=='none'&&value.replacement!==value.type){$('purchasePlanError').textContent='Choose the payment for the same kind of purchase, or select None.';return}$('purchasePlanError').textContent='';data.purchasePlan=value;save();draw()};


  function draw(){
    const periods=data.frequency==='biweekly'?26:52,accounts=Array.isArray(data.retirementAccounts)?data.retirementAccounts:[],inflation=Number(data.retirementPlan?.inflation??3);
    function monthly(a){return accountMonthly(a)}
    const total=accounts.reduce((sum,a)=>sum+accountBalance(a),0),contributions=accounts.reduce((sum,a)=>sum+monthly(a),0);$('savingsHorizonIntro').textContent=accounts.length?`${money(total)} in your accounts · ${money(contributions)} added each month, including linked employer matches.`:'Add your savings, 401(k), IRA or other accounts. We’ll show how they could grow.';
    const horizon=$('savingsHorizons');horizon.replaceChildren();if(accounts.length)for(const years of [10,20,30]){let sum=0;for(const a of accounts){let balance=accountBalance(a);const rate=Math.pow(1+Math.max(-.99,Number(a.rate)/100),1/12);for(let m=0;m<years*12;m++)balance=balance*rate+monthly(a);sum+=balance}sum/=Math.pow(1+inflation/100,years);const tile=el('div',`In ${years} years`);tile.append(el('strong',money(sum)));horizon.append(tile)}
    const target=positive(data.customGoalTarget),saved=positive(data.customGoalSaved)+savedFor('custom'),checks=data.customGoalDate?approximatePaychecks(data.customGoalDate):0;
    $('customGoalDateResult').textContent=!data.customGoalDate||!target?'':saved>=target?'You’ve saved enough for '+(data.customGoalName||'your goal')+'.':checks?`For ${data.customGoalName||'your goal'}, aim for ${money(Math.max(0,target-saved)/checks)} each payday to reach ${money(target)} by ${new Date(data.customGoalDate+'T12:00:00').toLocaleDateString()}. This is a target to compare with your budget, not an extra amount already set aside.`:'Choose a future goal date to work out a payday target.';
    const work=contribution('retirement401k'),ira=contribution('ira'),gross=positive(data.grossPay),manualRetirement=accounts.filter(a=>a.included==='yes').reduce((sum,a)=>sum+personalMonthly(a),0),retirementMonthly=(work.employee+work.employer+ira.employee+ira.employer)*periods/12+manualRetirement;
    $('expertSavingsComparison').textContent=gross?`Your tracked retirement savings, including employer matches and manual retirement-account contributions, are about ${(retirementMonthly/(gross*periods/12)*100).toFixed(1)}% of gross pay.`:'Add gross pay on Budget to compare your tracked retirement savings with Fidelity’s starting guideline.';
    const result=$('purchasePlanResult');result.replaceChildren();const p=data.purchasePlan;if(!p){result.append(el('h2','Start with an idea'),el('p','Enter the price, down payment and a loan quote. We’ll show the monthly cost and whether it fits.','help'));return}
    const home=p.type==='home',months=Number(p.term)*(home?12:1),principal=Math.max(0,Number(p.price)-Number(p.down))+positive(p.fees),payment=monthlyLoanPayment(principal,Number(p.rate),months),extras=positive(p.extras),totalCost=payment+extras;
    result.append(el('h2',money(totalCost)+' each month'),el('p',`${money(payment)} loan payment + ${money(extras)} extra ownership costs.`,'help'));
    const learned=tracking(),bills=data.expenses.filter(e=>!trackedNames.has(e.name)).reduce((sum,e)=>sum+positive(e.amount),0),replacementName=p.replacement==='car'?'Car payment':p.replacement==='home'?'Rent / mortgage':null,replacement=replacementName?data.expenses.filter(e=>e.name===replacementName).reduce((sum,e)=>sum+positive(e.amount),0):0;
    const manualIRA=accounts.filter(a=>/IRA/.test(a.type||'')).reduce((sum,a)=>sum+personalMonthly(a),0),bankIRA=(data.recommendationProfile?.iraFunding==='payroll'||accounts.some(a=>a.source==='ira')?0:ira.employee*periods/12)+manualIRA-accounts.filter(a=>/IRA/.test(a.type||'')&&['monthly','paycheck'].includes(a.personalSchedule)).reduce((sum,a)=>sum+personalMonthly(a),0),room=positive(data.pay)*periods/12-bills-learned.monthly-bankIRA,ownershipBudget=Math.max(0,room+replacement-Math.max(0,room)*.5),maxLoan=Math.max(0,ownershipBudget-extras),maxPrice=Math.max(0,loanBalanceForPayment(maxLoan,Number(p.rate),months)+Number(p.down)-positive(p.fees));
    if(!learned.ready||!positive(data.pay)){result.append(el('h3','We’re still learning your budget'),el('p','The payment estimate is ready. Add your paycheck and log 30 days of spending before we judge how it fits.','help'));return}
    if(ira.needsGross){result.append(el('p','Add gross pay on Budget so we can include your planned IRA savings before judging this payment.','help'));return}
    const fits=totalCost<=ownershipBudget;result.append(el('h3',fits?'Fits this budget preview':'Would stretch this budget'),el('p',`The plan leaves about ${money(ownershipBudget)} a month for the new total cost, including ${money(replacement)} freed by the payment it replaces.`,'help'),el('p',fits?`${money(ownershipBudget-totalCost)} remains within that allowance. Keep your down payment and upfront costs separate.`:`The total is ${money(totalCost-ownershipBudget)} above this allowance. A lower price, larger saved down payment or different timing could help.`,'help'));
    result.append(el('p',ownershipBudget<extras?'The extra ownership costs alone are above the allowance. Review those costs before choosing a loan amount.':`At this rate and term, the budget supports roughly a ${money(maxPrice)} purchase price with your entered down payment and extra costs.`,'help'));
    const math=el('details');math.append(el('summary','See the loan details'),el('p',`Loan amount: ${money(principal)} · ${months} monthly payments · Total loan interest: ${money(Math.max(0,payment*months-principal))}.`,'help'));result.append(math);
  }
  // Add goal deadlines and payday markers without changing recurring bill logic.
  const originalCalendar=renderCalendar;renderCalendar=function(){originalCalendar();const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth(),today=localDate(),payday=data.payday?new Date(data.payday+'T12:00:00'):null;const dates=[{date:data.tripDate,name:data.tripName||'Trip'},{date:data.customGoalDate,name:data.customGoalName||'Savings goal'}];
    const buttons=Array.from($('calendarGrid').querySelectorAll('.calendar-day'));for(let i=0;i<buttons.length;i++){const day=i+1,date=new Date(year,month,day,12),iso=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,events=dates.filter(e=>e.date===iso);if(payday&&!Number.isNaN(payday.getTime())){const difference=Math.round((date-payday)/86400000),interval=data.frequency==='biweekly'?14:7;if(difference>=0&&difference%interval===0)events.unshift({name:'Payday'})}if(events.length){const marker=el('small',events[0].name==='Payday'?'Pay':'Goal','plan-date-tag');buttons[i].append(marker);buttons[i].setAttribute('aria-label',buttons[i].getAttribute('aria-label')+'; '+events.map(e=>e.name).join(', '));if(day===selectedDay)for(const event of events)$('dayBills').append(el('li',event.name+' · planned date'))}}
  };
  const style=el('style');style.textContent=`.overview-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}.overview-shortcuts{display:flex;gap:6px}.overview-shortcuts button{padding:7px 10px;font-size:.72rem}.savings-horizons{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:18px 0}.savings-horizons>div{background:#eaf4fc;border-radius:13px;padding:15px;color:#476b86}.savings-horizons strong{display:block;font-size:1.15rem;color:#175b88;margin-top:8px;overflow-wrap:anywhere}.savings-horizon-card details summary,.retirement-plan-details>summary,#purchasePlansContent summary,.expert-guidance summary{cursor:pointer;font-weight:700;color:#265877;padding:8px 0}.retirement-plan-details{margin-top:18px}.retirement-plan-details .retirement-outlook{box-shadow:none;border:0;padding:15px 0 0}.savings-horizon-card #retirementAccountList{margin-top:18px}.savings-horizon-card .retirement-account{padding:15px 0;border-bottom:1px solid #dbe7f0}#purchasePlanForm .fields{margin-top:15px}#purchasePlanForm>button{margin-top:16px}#purchasePlanResult{margin-top:18px}#purchasePlansContent>.card{margin-bottom:18px}.expert-guidance{margin-top:18px}.plan-date-tag{display:block;background:#deedf8;color:#245d86;border-radius:5px;font-size:.6rem;padding:2px}.goal-switch[hidden]{display:none!important}.page>dialog{width:min(540px,calc(100vw - 28px));max-height:90dvh;overflow:auto}.page>dialog .fields{grid-template-columns:1fr}@media(max-width:600px){.savings-horizons{gap:6px}.savings-horizons>div{padding:10px;font-size:.75rem}.savings-horizons strong{font-size:.92rem}#purchasePlanForm .fields{grid-template-columns:1fr}.overview-shortcuts button{font-size:.65rem;padding:6px 8px}}
  `;document.head.append(style);
  const originalRender=render;render=function(){originalRender();draw()};draw();renderCalendar();
})();
