import fs from 'node:fs';
import assert from 'node:assert/strict';
const p={"stamp": "261122_1816", "settings": "yarrow/261122_1816_settings_Shana.js", "options": "yarrow/options/261122_1816_options_Shana.js", "scenes-ko": "yarrow/learn/261122_1816_scenes-ko_Shana.js", "why-ko": "yarrow/learn/261122_1816_why-ko_Shana.js", "learn": "yarrow/learn/261122_1816_learn_Shana.js", "doc": "docs/common/261122_1816_yarrow-reading-method_Shana.md"};
const base=new URL('../', import.meta.url).pathname;
const {round,minLeft,maxLeft}=await import(base+'yarrow/learn/261120_2155_procedure_Laude.js');
const {explainLine,readingText}=await import(base+p['why-ko']);
let cases=0;const patterns=new Set(); const examples={};
for(const side of ['left','right']) for(let a=minLeft(49,side);a<=maxLeft(49,side);a++){
 const r1=round(49,a,side);
 for(let b=minLeft(r1.next,side);b<=maxLeft(r1.next,side);b++){
  const r2=round(r1.next,b,side);
  for(let c=minLeft(r2.next,side);c<=maxLeft(r2.next,side);c++){
   const r3=round(r2.next,c,side);const e=explainLine([r1.removed,r2.removed,r3.removed],r3.next);
   assert(e.ok);assert.equal(e.total,50);assert.equal(e.value,e.pattern.value);
   assert(readingText(e,'jeong').join(' ').includes(String(e.value)));
   assert(readingText(e,'yun').join(' ').includes(e.pattern.name));patterns.add(e.seq);cases++;
   examples[e.value]??={lefts:[a,b,c],side};
  }
 }
}
assert.equal(patterns.size,8);assert(!explainLine([5,8,7],29).ok);
let saved={};global.localStorage={getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]};
const s=await import(base+p.settings);
assert.equal(s.loadSettings().readingMethod,'jeong');
for(const mode of ['jeong','yun']){assert(s.saveSettings({takeSide:'left',pace:'fast',readingMethod:mode}));assert.deepEqual(s.loadSettings(),{takeSide:'left',pace:'fast',readingMethod:mode});}
saved[s.STORAGE_KEY]=JSON.stringify({takeSide:'left',pace:'fast',readingMethod:'bad'});assert.equal(s.loadSettings().readingMethod,'jeong');assert.equal(s.loadSettings().takeSide,'left');
saved[s.STORAGE_KEY]=JSON.stringify({takeSide:'right',pace:'step'});assert.equal(s.loadSettings().readingMethod,'jeong');
console.log({cases,patterns:patterns.size,settings:'passed',examples});
