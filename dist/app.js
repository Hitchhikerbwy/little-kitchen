'use strict';
const $ = id => document.getElementById(id);
let recipes = [], selected = null, index = 0, count = 0, timer = null, complete = false, activeTag = '全部';
const used = new Set();
function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
function clearTimer() { if (timer !== null) clearInterval(timer); timer = null; }
function renderCards() {
  const q = $('search').value.trim().toLowerCase();
  const list = recipes.filter(r => (activeTag === '全部' || r.tags.includes(activeTag)) && `${r.title} ${r.tags.join(' ')} ${r.ingredients.map(i=>i.name).join(' ')}`.toLowerCase().includes(q));
  $('cards').replaceChildren(); $('empty').hidden = list.length > 0;
  $('recipe-count').textContent = `${list.length} 道料理 / 持續增加中`;
  list.forEach(r => {
    const a = el('a', 'card'); a.href = `?recipe=${encodeURIComponent(r.id)}`;
    a.addEventListener('click', e => { e.preventDefault(); openRecipe(r.id); });
    const art = el('div', 'card-art'); art.setAttribute('aria-hidden','true');
    art.append(el('span','card-number',`RECIPE No. ${String(recipes.indexOf(r)+1).padStart(2,'0')}`),el('div','plate',r.emoji),el('span','tiny-leaf','🌿'));
    const body = el('div','card-body'); const bottom = el('div','card-bottom');
    bottom.append(el('span','card-tag',r.tags[0]),el('span','card-link','進入小廚房 ↗'));
    body.append(el('div','card-meta',`◷ ${r.minutes} 分鐘　 ·　${r.servings}　 ·　${r.steps.length} 個步驟`),el('h3','',r.title),el('p','',r.subtitle),bottom); a.append(art,body); $('cards').append(a);
  });
}
function setRoute(id, push) {
  const u = new URL(location.href); u.search = ''; u.hash = ''; if (id) u.searchParams.set('recipe',id);
  if (push) history.pushState({},'',u);
}
function home(push=true) { clearTimer(); selected=null; $('home').hidden=false; $('kitchen').hidden=true; setRoute(null,push); document.title='小鍋練習室 · 把食譜，玩成一道菜'; window.scrollTo(0,0); }
function openRecipe(id, push=true) {
  clearTimer(); const r = recipes.find(r=>r.id===id); if (!r) { home(push); return; }
  selected=r; index=0; complete=false; used.clear(); setRoute(id,push);
  $('home').hidden=true; $('kitchen').hidden=false; $('dish-title').textContent=r.title; $('dish-subtitle').textContent=r.subtitle;
  $('dish-meta').textContent=`${r.servings} · 約 ${r.minutes} 分鐘`; $('source').textContent=r.source;
  document.title=`${r.title} · 小鍋練習室`; renderStep(); window.scrollTo(0,0);
}
function renderIngredients() {
  $('ingredients').replaceChildren(); selected.ingredients.forEach(i=>{const li=el('li',used.has(i.id)?'used':''); const label=el('span','',i.name); label.append(el('small','',i.amount)); li.append(el('span','ingredient-emoji',i.emoji),label); $('ingredients').append(li);});
}
function renderStep() {
  clearTimer(); count=0; complete=false; const s=selected.steps[index];
  $('pan').classList.remove('plate-mode'); $('steam').hidden=true;
  $('food').textContent=index ? selected.steps[index-1].visual : '';
  $('action').hidden=false; $('action').disabled=false; $('action').textContent=s.label; $('skip').hidden=true; $('next').hidden=true;
  $('feedback').textContent=''; $('step-title').textContent=s.title; $('instruction').textContent=s.instruction; $('tip').textContent=s.tip;
  $('stage-badge').textContent='STEP '+String(index+1).padStart(2,'0'); updateProgress(index); renderIngredients(); renderStepList();
}
function updateProgress(n) { const pct=Math.round(n/selected.steps.length*100); $('step-counter').textContent=`STEP ${String(Math.min(n+1,selected.steps.length)).padStart(2,'0')} / ${String(selected.steps.length).padStart(2,'0')}`; $('step-percent').textContent=`${pct}%`; $('progress-bar').style.width=pct+'%'; }
function renderStepList() { $('step-list').replaceChildren(); selected.steps.forEach((s,i)=>{$('step-list').append(el('li',i<index?'done':i===index?'current':'',`${i<index?'✓':i+1} ${s.title}`));}); }
function finishStep() {
  clearTimer(); complete=true; const s=selected.steps[index]; $('food').textContent=s.visual; $('steam').hidden=true; $('action').hidden=true; $('skip').hidden=true;
  if (s.action==='add') used.add(s.ingredientId); renderIngredients(); updateProgress(index+1);
  if (s.action==='serve') {
    $('pan').classList.add('plate-mode'); $('stage-badge').textContent='完成練習 ✓'; $('step-title').textContent='做到了！今天又多會了一道。';
    $('instruction').textContent=`你完成了「${selected.title}」的 ${selected.steps.length} 個步驟。再練一次，或回到收藏挑選下一道料理。`;
    $('feedback').textContent='練習完成，不代表實際料理已熟；真正下廚時請依食材狀態判斷。';
    $('step-list').querySelectorAll('li').forEach((n,i)=>{n.className='done';n.textContent='✓ '+selected.steps[i].title;}); $('next').hidden=true;
  } else { $('feedback').textContent='✓ 這一步完成了，準備好了就繼續。'; $('next').hidden=false; }
}
$('action').addEventListener('click',()=>{
  if (!selected || complete) return;
  const s=selected.steps[index];
  if (s.action==='wait') {
    if(timer!==null) return; let left=s.seconds; $('action').disabled=true; $('skip').hidden=false; $('steam').hidden=false;
    $('feedback').textContent=`模擬倒數 ${left} 秒（非實際烹調時間）`;
    timer=setInterval(()=>{left--; if(left<=0) finishStep(); else $('feedback').textContent=`模擬倒數 ${left} 秒（非實際烹調時間）`;},1000);
  } else if (s.action==='mix') {
    count++; $('food').textContent=s.visual; $('pan').classList.toggle('bump',count%2===1);
    if(count>=s.repetitions) { $('pan').classList.remove('bump'); finishStep(); }
    else { $('feedback').textContent=`已翻拌 ${count} / ${s.repetitions} 次`; $('action').textContent=`${s.label}（${count}/${s.repetitions}）`; }
  } else finishStep();
});
$('next').addEventListener('click',()=>{if(complete && index<selected.steps.length-1){index++;renderStep();}});
$('skip').addEventListener('click',()=>{if(selected && selected.steps[index].action==='wait' && timer!==null)finishStep();});
$('restart').addEventListener('click',()=>openRecipe(selected.id,false)); $('back').addEventListener('click',()=>home());
$('search').addEventListener('input',renderCards);
window.addEventListener('popstate',()=>{const id=new URL(location.href).searchParams.get('recipe');if(id)openRecipe(id,false);else home(false);});
fetch('data/recipes.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json();}).then(data=>{
  recipes=data; const tags=['全部',...new Set(recipes.flatMap(r=>r.tags))];
  tags.forEach(t=>{const b=el('button',t==='全部'?'active':'',t); b.type='button'; b.setAttribute('aria-pressed',String(t==='全部')); b.addEventListener('click',()=>{activeTag=t; [...$('tags').children].forEach(n=>{n.classList.toggle('active',n===b);n.setAttribute('aria-pressed',String(n===b));});renderCards();}); $('tags').append(b);});
  renderCards(); const id=new URL(location.href).searchParams.get('recipe'); if(id)openRecipe(id,false);
}).catch(()=>{$('error').hidden=false;});

document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const target=a.getAttribute('href');if(selected)home();document.querySelector(target).scrollIntoView({behavior:'smooth'});}));
