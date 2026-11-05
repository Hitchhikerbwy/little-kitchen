import fs from 'node:fs';
import assert from 'node:assert/strict';
const file = new URL('../dist/data/recipes.json', import.meta.url);
const recipes=JSON.parse(fs.readFileSync(file,'utf8'));
assert(Array.isArray(recipes)&&recipes.length>0,'食譜陣列不可空白');
const ids=new Set();
const text=(v,name)=>assert(typeof v==='string'&&v.trim(),name+' 不可空白');
for(const r of recipes){
  for(const k of ['id','title','subtitle','emoji','servings','source'])text(r[k],k);
  assert(/^[a-z]+(?:-[a-z0-9]+)*$/.test(r.id),'slug 格式');assert(!ids.has(r.id),'重複食譜 id');ids.add(r.id);
  assert(Number.isInteger(r.minutes)&&r.minutes>0,'minutes 必須正整數');
  assert(Array.isArray(r.tags)&&r.tags.length);r.tags.forEach(t=>text(t,'tag'));
  assert(Array.isArray(r.ingredients)&&r.ingredients.length); const ingredients=new Set();
  for(const i of r.ingredients){for(const k of ['id','name','amount','emoji'])text(i[k],k);assert(!ingredients.has(i.id),'重複食材');ingredients.add(i.id);}
  assert(Array.isArray(r.steps)&&r.steps.length);assert(r.steps.at(-1).action==='serve','最後步驟必須盛盤');
  for(const [n,s] of r.steps.entries()){
    for(const k of ['title','instruction','label','visual','tip'])text(s[k],k);
    assert(['add','mix','wait','serve'].includes(s.action),'未知動作');
    if(s.action==='add')assert(ingredients.has(s.ingredientId),'找不到食材');
    if(s.action==='mix')assert(Number.isInteger(s.repetitions)&&s.repetitions>=1&&s.repetitions<=12,'攪拌次數');
    if(s.action==='wait')assert(Number.isInteger(s.seconds)&&s.seconds>=1&&s.seconds<=30,'模擬秒數');
    if(s.action==='serve')assert(n===r.steps.length-1,'盛盤必須是最後一步');
  }
  console.log(`✓ ${r.id}: ${r.ingredients.length} 種食材，${r.steps.length} 個步驟`);
}
console.log('食譜資料驗證通過。');
