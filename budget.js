'use strict';
const KEY='lifesQuestSimpleBudgetV1';
const $=id=>document.getElementById(id);
const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number.isFinite(value)?value:0);
const positive=value=>Math.max(0,Number(value)||0);
const presets={
  Home:['Rent / mortgage','Electricity','Water','Internet / phone'],
  Transportation:['Car payment','Car insurance','Gas','Parking / transit'],
  Everyday:['Groceries','Dining out','Entertainment','Personal care'],
  Other:['Debt payments','Subscriptions','Healthcare','Other spending']
};
const allPresets=Object.values(presets).flat();
const defaultExpenses=()=>allPresets.map(name=>({name,amount:0}));
let data;
let page='plan';
function migrate(){
  try{
    const old=JSON.parse(localStorage.getItem('lifesQuestWeb')||'null');
    if(!old)return null;
    const e=old.estimatedExpenses||{};
    const expenses=[['Rent / mortgage',e.housing],['Car payment',e.car],['Car insurance',e.insurance],['Electricity',e.utilities],['Debt payments',e.debt],['Subscriptions',e.subscriptions],['Groceries',e.food],['Gas',e.gas],['Entertainment',e.entertainment],['Other spending',e.other],...(e.additionalBills||[]).map(b=>[b.name,b.amount])]
      .filter(([,amount])=>positive(amount)>0).map(([name,amount])=>({name,amount:positive(amount)}));
    const trip=(old.plan?.goals||[]).find(g=>/vacation|trip/i.test((g.type||'')+' '+(g.name||'')))||{};
    return {pay:positive(old.income?.amount),frequency:old.income?.frequency==='biweekly'?'biweekly':'weekly',expenses,savings:positive(old.savingsPerPaycheck),tripName:trip.name||'',tripDate:trip.date||'',tripCost:positive(trip.amount),tripSaved:positive(trip.saved)};
  }catch{return null}
}
try{data=JSON.parse(localStorage.getItem(KEY)||'null')||migrate()}catch{}
data=data||{pay:0,frequency:'weekly',expenses:defaultExpenses(),savings:0,tripName:'',tripDate:'',tripCost:0,tripSaved:0};
if(!Array.isArray(data.expenses))data.expenses=[];
// Keep custom and imported expenses, and add each missing preset without copying an amount.
for(const name of allPresets){if(!data.expenses.some(x=>x.name===name))data.expenses.push({name,amount:0})}
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
function openPage(target){
  if(!['plan','expenses','goals'].includes(target))return;
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
for(const id of ['pay','savings','tripName','tripDate','tripCost','tripSaved']){
  $(id).value=data[id]||'';
  $(id).addEventListener('input',()=>{data[id]=['tripName','tripDate'].includes(id)?$(id).value:positive($(id).value);save();render()});
}
$('frequency').value=data.frequency;
$('frequency').addEventListener('change',()=>{data.frequency=$('frequency').value;save();render()});
function expenseRow(item){
  const row=document.createElement('div');row.className='expense-item';
  const name=document.createElement('input');name.className='name';name.value=item.name||'';name.placeholder='Expense name';name.setAttribute('aria-label','Expense name');
  if(allPresets.includes(item.name))name.readOnly=true;
  else name.addEventListener('input',()=>{item.name=name.value;save()});
  const amount=document.createElement('input');amount.type='number';amount.min='0';amount.step='0.01';amount.inputMode='decimal';amount.placeholder='0.00';amount.value=item.amount||'';amount.setAttribute('aria-label',(item.name||'Expense')+' monthly amount');
  amount.addEventListener('input',()=>{item.amount=positive(amount.value);save();render()});
  const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='×';remove.setAttribute('aria-label','Remove '+(item.name||'expense'));
  remove.addEventListener('click',()=>{data.expenses.splice(data.expenses.indexOf(item),1);save();renderExpenses();render()});
  if(allPresets.includes(item.name)){remove.disabled=true;remove.style.visibility='hidden'}
  row.append(name,amount,remove);return row;
}
function renderExpenses(){
  const root=$('expenseGroups');
  const openGroups=new Set([...root.querySelectorAll('details[open]')].map(x=>x.dataset.group));
  root.replaceChildren();
  const custom=data.expenses.filter(item=>!allPresets.includes(item.name));
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
function approximatePaychecks(date){
  const departure=new Date(date+'T12:00:00');const today=new Date();today.setHours(12,0,0,0);
  if(Number.isNaN(departure.getTime()))return 0;
  const days=Math.ceil((departure-today)/86400000);
  return days>0?Math.ceil(days/(data.frequency==='biweekly'?14:7)):0;
}
function render(){
  const periods=data.frequency==='biweekly'?26:52;
  const pay=positive(data.pay),monthly=data.expenses.reduce((total,item)=>total+positive(item.amount),0);
  const expensePerPay=monthly*12/periods,available=pay-expensePerPay,savings=positive(data.savings);
  $('period').textContent=data.frequency==='biweekly'?'every 2 weeks':'per week';
  $('available').textContent=money(available);$('payOut').textContent=money(pay);$('expenseOut').textContent=money(expensePerPay);
  $('spending').textContent=money(available-savings);$('annual').textContent=money(savings*periods);
  $('monthlyTotal').textContent=money(monthly);$('expenseAside').textContent=money(expensePerPay);
  $('count').textContent=data.expenses.filter(x=>positive(x.amount)>0).length+' filled';
  $('shortfall').classList.toggle('hidden',!(pay>0&&available<0));
  $('shortfall').textContent='Expenses exceed pay by '+money(-available)+' each paycheck.';
  $('overSaving').classList.toggle('hidden',!(savings>Math.max(0,available)));
  $('overSaving').textContent='Savings exceed what is available by '+money(savings-Math.max(0,available))+' each paycheck.';
  $('nextCopy').textContent=monthly>0?'Your plan is ready to review and adjust.':'Add your usual expenses to make this number useful.';
  document.querySelectorAll('.expense-group').forEach(group=>{
    const items=data.expenses.filter(item=>group.dataset.group==='Added by you'?!allPresets.includes(item.name):(presets[group.dataset.group]||[]).includes(item.name));
    const subtotal=group.querySelector('summary small');if(subtotal)subtotal.textContent=money(items.reduce((sum,item)=>sum+positive(item.amount),0))+'/mo';
  });
  const result=$('tripResult');result.replaceChildren();
  const cost=positive(data.tripCost),saved=positive(data.tripSaved),checks=data.tripDate?approximatePaychecks(data.tripDate):0;
  if(!cost||!data.tripDate){result.textContent='Add an amount and a date to see your target per paycheck.';$('goalContext').textContent='Your budget and vacation goal update together.';return}
  if(!checks){result.textContent='Pick a future departure date to make a plan.';return}
  const remaining=Math.max(0,cost-saved),per=remaining/checks;
  const title=document.createElement('strong');title.textContent=money(per)+' each paycheck';
  const detail=document.createElement('p');detail.textContent=remaining?money(remaining)+' to go over approximately '+checks+' paychecks.':'You have already saved enough for this trip.';
  result.append(title,detail);
  $('goalContext').textContent=remaining&&per>Math.max(0,available)?'This goal exceeds what is currently available after expenses.':remaining&&savings<per?'Your current savings amount is lower than this vacation target.':'This target can fit inside your current savings amount.';
}
renderExpenses();render();
$('reset').addEventListener('click',()=>{if(!confirm('Clear this budget and start over? Your older Life’s Quest data stays separately stored.'))return;data={pay:0,frequency:'weekly',expenses:defaultExpenses(),savings:0,tripName:'',tripDate:'',tripCost:0,tripSaved:0};save();location.reload()});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
