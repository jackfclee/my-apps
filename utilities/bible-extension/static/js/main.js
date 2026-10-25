'use strict';
const books = [
 ['jubilees','禧年書','Book of Jubilees'],['1-enoch','以諾一書','1 Enoch'],
 ['2-enoch','以諾二書','2 Enoch'],['3-enoch','以諾三書','3 Enoch'],
 ['apocalypse-of-abraham','亞伯拉罕啟示錄','Apocalypse of Abraham'],
 ['life-of-adam-and-eve','亞當和夏娃生平','Life of Adam and Eve'],
 ['testaments-of-the-twelve-patriarchs','十二族長遺訓','Testaments of the Twelve Patriarchs'],
 ['4-ezra','以斯拉四書','4 Ezra'],['2-baruch','巴錄二書','2 Baruch']
];
const $ = id => document.getElementById(id);
const cache = new Map();
let english, chinese, current = 0, selected = 0, request = 0;
function option(value, text) { const el=document.createElement('option'); el.value=value; el.textContent=text; return el; }
for (const [id,zh,en] of books) $('book').append(option(id,`${zh} · ${en}`));
async function fetchBook(id,lang) {
 const key=`${id}.${lang}`;
 if (!cache.has(key)) {
  const response=await fetch(`static/data/${key}.json`);
  if (!response.ok) throw new Error(`Unable to load ${key} (${response.status})`);
  cache.set(key,await response.json());
 }
 return cache.get(key);
}
function locationState() {
 const p=new URLSearchParams(location.hash.slice(1));
 return {book:books.some(b=>b[0]===p.get('book'))?p.get('book'):books[0][0],chapter:p.get('chapter'),language:['en','zh-Hant','both'].includes(p.get('language'))?p.get('language'):'both'};
}
function persist() {
 const p=new URLSearchParams({book:$('book').value,chapter:english.chapters[current].id,language:$('language').value});
 history.replaceState(null,'',`#${p}`);
}
async function loadBook(chapterId) {
 const ticket=++request, id=$('book').value;
 $('status').textContent='載入中 Loading…';
 $('passages').replaceChildren(); $('chapter').disabled=true;
 $('previous').disabled=true; $('next').disabled=true;
 try {
  const results=await Promise.allSettled([fetchBook(id,'en'),fetchBook(id,'zh-Hant')]);
  if(ticket!==request)return;
  if(results[0].status==='rejected')throw results[0].reason;
  english=results[0].value; chinese=results[1].status==='fulfilled'?results[1].value:null;
  current=Math.max(0,english.chapters.findIndex(c=>c.id===chapterId)); selected=0;
  $('chapter').replaceChildren();
  english.chapters.forEach((c,i)=>{
   const z=chinese?.chapters.find(z=>z.id===c.id);
   const prefix=(id==='testaments-of-the-twelve-patriarchs'||id==='life-of-adam-and-eve')?`${z?.section||c.section} · `:'';
   $('chapter').append(option(c.id,`${prefix}${z?.label||c.label}${z?' '+c.label:''}`));
  });
  $('chapter').disabled=false; render();
 } catch(error) {
  if(ticket!==request)return;
  english=null; chinese=null;
  $('heading').textContent='無法載入 Unable to load';
  $('status').textContent='無法載入書卷，請重新整理後再試。請透過本機伺服器或網站開啟此頁。 Could not load this book. Retry by reloading. Open this page through a local server or website.';
  console.error(error);
 }
}
function render() {
 if(!english)return;
 const en=english.chapters[current], zh=chinese?.chapters.find(c=>c.id===en.id), mode=$('language').value;
 $('status').textContent=(!zh&&mode!=='en')?'此章中文尚未備妥；目前顯示英文。 Chinese is unavailable for this chapter; showing English.':'';
 $('heading').textContent=`${english.title['zh-Hant']} · ${english.title.en} ： ${zh?.label||en.label}`;
 document.title=`${english.title['zh-Hant']} ${zh?.label||en.label} · Bible Extension`;
 $('section').textContent=zh?`${zh.section}${zh.section&&en.section?' ':''}${en.section}`:en.section;
 $('chapter').value=en.id;
 $('position').textContent=`${current+1} ${english.chapters.length}`;
 $('previous').disabled=current===0; $('next').disabled=current===english.chapters.length-1;
 $('translation-note').hidden=mode==='en'||!zh;
 $('credit').textContent=english.source.credit;
 $('edition-note').textContent=english.source.editionNote||'';
 $('source-link').href=english.source.url;
 const fragment=document.createDocumentFragment();
 en.verses.forEach((v,i)=>{
  const row=document.createElement('article'); row.className='passage'; row.id=`passage-${i}`;
  const ref=document.createElement('span');ref.className='ref';
  ref.textContent=v.number==='preface'?'序 Intro':v.number==='paragraph'?'文 Text':v.number;
  row.append(ref);
  const add=(text,lang)=>{const p=document.createElement('p');p.className='text';p.lang=lang;p.textContent=text;row.append(p);};
  if(mode!=='en'&&zh) add(zh.verses[i].text,'zh-Hant');
  if(mode!=='zh-Hant'||!zh) add(v.text,'en');
  if(row.children.length===2)row.classList.add('single');
  row.addEventListener('click',()=>selectPassage(i,false));fragment.append(row);
 });
 $('passages').replaceChildren(fragment);selectPassage(Math.min(selected,en.verses.length-1),false);persist();
}
function selectPassage(index,scroll=true) {
 selected=index;document.querySelector('.passage.selected')?.classList.remove('selected');
 const row=$(`passage-${index}`);row?.classList.add('selected');if(scroll)row?.scrollIntoView({block:'center',behavior:'smooth'});
}
function move(delta) {if(!english)return;const next=current+delta;if(next<0||next>=english.chapters.length)return;current=next;selected=0;render();$('heading').scrollIntoView({block:'start'});}
$('book').addEventListener('change',()=>loadBook());
$('chapter').addEventListener('change',()=>{if(!english)return;current=english.chapters.findIndex(c=>c.id===$('chapter').value);selected=0;render();});
$('language').addEventListener('change',render);
$('size').addEventListener('change',()=>{document.body.dataset.size=$('size').value;});
$('previous').addEventListener('click',()=>move(-1));$('next').addEventListener('click',()=>move(1));
document.addEventListener('keydown',event=>{
 if(!english||event.altKey||event.ctrlKey||event.metaKey||/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(event.target.tagName))return;
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
 event.preventDefault();
 if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1);
 if(event.key==='ArrowUp')selectPassage(Math.max(0,selected-1));
 if(event.key==='ArrowDown')selectPassage(Math.min(english.chapters[current].verses.length-1,selected+1));
});
function restore(){const state=locationState();$('book').value=state.book;$('language').value=state.language;loadBook(state.chapter);}
window.addEventListener('hashchange',restore);restore();
