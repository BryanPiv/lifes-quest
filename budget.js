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
try{data=JSON.parse(localStorage.getItem(KEY)||'null')||migrate()}catch{}
data=data||{pay:0,frequency:'weekly',expenses:defaultExpenses(),retirement401k:0,healthcarePayroll:0,ira:0,contributionsPerPaycheck:true,tripName:'',tripDate:'',tripCost:0,tripSaved:0};
// Earlier Pocket Peak versions stored these three entries as monthly amounts.
// Convert once, preserving their effective paycheck values for existing users.
if(!data.contributionsPerPaycheck){
  const periods=data.frequency==='biweekly'?26:52;
  for(const id of ['retirement401k','healthcarePayroll','ira'])data[id]=Math.round(positive(data[id])*1200/periods)/100;
  data.contributionsPerPaycheck=true;
  localStorage.setItem(KEY,JSON.stringify(data));
}
if(!Array.isArray(data.expenses))data.expenses=[];
if(!Array.isArray(data.transactions))data.transactions=[];
// Keep custom and imported expenses, and add each missing preset without copying an amount.
for(const name of allPresets){if(!data.expenses.some(x=>x.name===name))data.expenses.push({name,amount:0})}
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
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
for(const id of ['pay','retirement401k','healthcarePayroll','ira','tripName','tripDate','tripCost','tripSaved']){
  $(id).value=data[id]||'';
  $(id).addEventListener('input',()=>{data[id]=['tripName','tripDate'].includes(id)?$(id).value:positive($(id).value);save();render()});
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
  due.addEventListener('change',()=>{item.dueDay=due.value?Number(due.value):null;save();renderCalendar()});
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
function breakdownTransactions(period){return period?periodTransactions(period):data.transactions.filter(t=>t.date?.slice(0,7)===localDate().slice(0,7))}
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
function renderRecent(period){
  const list=$('recentExpenses');list.replaceChildren();
  const recent=breakdownTransactions(period).sort((a,b)=>b.date.localeCompare(a.date));
  if(!recent.length){const item=document.createElement('li');item.textContent=period?'No purchases logged for this pay period yet.':'No purchases logged this month yet.';list.append(item)}
  for(const transaction of recent){
    const item=document.createElement('li');const info=document.createElement('div');info.className='purchase-info';
    const label=document.createElement('strong');label.className='purchase-name';label.textContent=transaction.name||categoryOf(transaction.category);
    const meta=document.createElement('span');meta.className='purchase-meta';meta.textContent=`${categoryOf(transaction.category)} · ${transaction.date}`;
    info.append(label,meta);
    const amount=document.createElement('strong');amount.textContent=money(positive(transaction.amount));
    const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',`Remove ${transaction.name||transaction.category} expense`);
    remove.addEventListener('click',()=>{data.transactions=data.transactions.filter(t=>t.id!==transaction.id);if(!data.transactions.length)delete data.trackingStart;save();render()});
    item.append(info,amount,remove);list.append(item);
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
function render(){
  const periods=data.frequency==='biweekly'?26:52;
  const pay=positive(data.pay),learned=tracking(),current=payPeriod();
  const fixedMonthly=data.expenses.filter(item=>!trackedNames.has(item.name)).reduce((total,item)=>total+positive(item.amount),0);
  const monthlyIncome=pay*periods/12,monthlyAfterBills=monthlyIncome-fixedMonthly;
  const monthly=fixedMonthly+(learned.ready?learned.monthly:0);
  const expensePerPay=monthly*12/periods,fixedPerPay=fixedMonthly*12/periods,iraPerPay=positive(data.ira),available=pay-expensePerPay-iraPerPay;
  const filled=data.expenses.some(item=>!trackedNames.has(item.name)&&positive(item.amount)>0)||learned.monthly>0;
  // CFPB's 20% take-home benchmark covers savings and debt payments.
  // Half of the remaining surplus is a separate app buffer, not a CFPB formula.
  const debtPerPay=data.expenses.filter(item=>item.name==='Debt payments').reduce((sum,item)=>sum+positive(item.amount),0)*12/periods;
  const target=Math.max(0,pay*.2-iraPerPay-debtPerPay);
  const suggested=pay>0&&filled&&learned.ready?Math.min(target,Math.max(0,available)*.5):0;
  const limit=pay-fixedPerPay-iraPerPay-suggested;
  const transactions=periodTransactions(current),spent=transactions.reduce((sum,t)=>sum+positive(t.amount),0);
  $('period').textContent=current?`${current.label} · ${data.frequency==='biweekly'?'2-week':'weekly'} budget`:'Set your payday on Expenses';
  $('balanceBasis').textContent=!pay?'Enter take-home pay on Expenses to begin.':!current?'Add your most recent payday on Expenses to start a pay period.':learned.ready?'Your limit sets aside bills, IRA and suggested savings.':'Preliminary limit: food, gas, fun and misc are logged as you spend.';
  $('available').textContent=money(current&&pay?limit-spent:0);$('payOut').textContent=money(current&&pay?limit:0);$('expenseOut').textContent=money(current?spent:0);
  $('monthlyIncome').textContent=pay?money(monthlyIncome)+' income':'Add pay on Expenses';$('monthlyBills').textContent=money(fixedMonthly)+' bills';$('monthlyLeft').textContent=pay?money(monthlyAfterBills):'—';
  $('monthlyLeft').classList.toggle('monthly-deficit',pay>0&&monthlyAfterBills<0);
  $('suggested').textContent=learned.ready?money(suggested):'Learning…';
  $('suggestedPeriod').textContent=data.frequency==='biweekly'?'every 2 weeks, beyond your IRA':'each week, beyond your IRA';
  $('spending').textContent=learned.ready?money(available-suggested):'—';$('annual').textContent=learned.ready?money(suggested*periods):'—';
  $('monthlyTotal').textContent=money(monthly);$('expenseAside').textContent=money(expensePerPay);
  $('iraAside').textContent=money(iraPerPay);
  $('payrollAside').textContent=money(positive(data.retirement401k)+positive(data.healthcarePayroll));
  $('count').textContent=data.expenses.filter(x=>!trackedNames.has(x.name)&&positive(x.amount)>0).length+' filled';
  const breakdownItems=breakdownTransactions(current),breakdownSpent=breakdownItems.reduce((sum,t)=>sum+positive(t.amount),0);
  $('loggedMonth').textContent=money(learned.monthToDate)+' this month';renderRecent(current);
  $('breakdownTotal').textContent=money(breakdownSpent);$('breakdownPeriod').textContent=current?current.label:new Date().toLocaleDateString(undefined,{month:'long',year:'numeric'});
  $('breakdownTotalLabel').textContent=current?'SPENT THIS PERIOD':'SPENT THIS MONTH';
  $('trackingStatus').textContent=!current?'Set your payday on Expenses to switch to a weekly or biweekly view.':learned.ready?'Your recent spending also informs the savings suggestion.':data.trackingStart?`Learning your habits · day ${Math.min(30,learned.days+1)} of 30`:'Log purchases on Overview to build your picture.';
  $('trackedDetail').textContent=learned.ready?`Recent 30-day spending: ${money(learned.monthly)}. This updates as you add purchases.`:`Logged this month: ${money(learned.monthToDate)}. Savings guidance begins after 30 days of tracking.`;
  $('expenseBasis').textContent=learned.ready?'Includes recent 30-day purchases.':'Before food, gas and other daily purchases are learned.';
  const archived=data.expenses.filter(item=>trackedNames.has(item.name)&&positive(item.amount)>0);
  $('priorEstimates').hidden=!archived.length;
  $('priorEstimates').textContent=archived.length?'Older day-to-day estimates are preserved but excluded. Log actual purchases on Overview.':'';
  $('shortfall').classList.toggle('hidden',!(pay>0&&current&&limit-spent<0));
  $('shortfall').textContent=limit<0?'Regular bills and IRA transfers exceed take-home pay by '+money(-limit)+'.':'You are '+money(spent-limit)+' over this period’s limit.';
  $('recommendationReason').textContent=!pay?'Enter take-home pay to get started.':!filled?'Add your regular bills on Expenses.':!learned.ready?'Keep logging daily purchases. A savings suggestion will appear after the first 30 days so food and gas are based on actual spending.':available<=0?'There is no extra room after the costs entered. Review the plan before adding cash savings.':target<=0?'Your IRA and debt payments already reach the 20% take-home benchmark.':'Uses the CFPB 20% savings-and-debt guideline, less your IRA and debt payments, capped at half of what remains. Your 401(k) is already outside take-home pay.';
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
  renderCalendar();
  const result=$('tripResult');result.replaceChildren();
  const cost=positive(data.tripCost),saved=positive(data.tripSaved),checks=data.tripDate?approximatePaychecks(data.tripDate):0;
  if(!cost||!data.tripDate){result.textContent='Add an amount and a date to see your target per paycheck.';$('goalContext').textContent='Your budget and vacation goal update together.';return}
  if(!checks){result.textContent='Pick a future departure date to make a plan.';return}
  const remaining=Math.max(0,cost-saved),per=remaining/checks;
  const title=document.createElement('strong');title.textContent=money(per)+' each paycheck';
  const detail=document.createElement('p');detail.textContent=remaining?money(remaining)+' to go over approximately '+checks+' paychecks.':'You have already saved enough for this trip.';
  result.append(title,detail);
  $('goalContext').textContent=!learned.ready?'The budget is still learning your food and gas costs; this comparison will update after 30 days.':remaining&&per>Math.max(0,available)?'This goal exceeds what is available after expenses and IRA transfers.':remaining&&suggested<per?'This trip needs more per paycheck than the suggested cash savings.':'This target fits within the suggested cash savings.';
}
renderExpenses();render();
$('reset').addEventListener('click',()=>{if(!confirm('Clear this budget and start over? Your older data stays separately stored.'))return;data={pay:0,frequency:'weekly',expenses:defaultExpenses(),transactions:[],retirement401k:0,healthcarePayroll:0,ira:0,contributionsPerPaycheck:true,tripName:'',tripDate:'',tripCost:0,tripSaved:0};save();location.reload()});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
