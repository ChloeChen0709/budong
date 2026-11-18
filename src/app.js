"use strict";

/* ================= 数据 ================= */
const CAUSES = [
  {k:"unknown", name:"不会",   color:"#b23a2f", w:1.0},
  {k:"calc",    name:"算错",   color:"#d68c3c", w:0.5},
  {k:"read",    name:"审题",   color:"#4a7fa5", w:0.7}
];
const CM = Object.fromEntries(CAUSES.map(c=>[c.k,c]));
const INTERVAL = {unknown:1, calc:2, read:3};

const SAMPLE_ITEMS = [
  { sec:"1.1", cause:"unknown", due:0, lapses:0,
    q:"求 y = ln(x−2) + √(3−x) 的定义域",
    demo:{
      why:"对数要求真数大于 0，根号要求里面非负。你只写了其中一个条件。",
      how:"x−2>0 得 x>2；3−x≥0 得 x≤3。两个取交集：定义域 (2, 3]。",
      fix:"定义域永远是几个条件同时成立，最后取交集。"
    }},
  { sec:"1.1", cause:"read", due:0, lapses:0,
    q:"判断 f(x) = x·cos x 的奇偶性",
    img:"data:image/jpeg;base64,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WpkmwtTJNgFzc03Fzc03FqZJsLUyTYBc3NNxc3NNxamSbC1Mk2AXNzTcXNzTcWpkmwtTJNgFzc03Fzc03FqZJsLUyTYBc3NNxc3NNxamSbC1Mk2AXNzTcXNzTcWpkmwtTJNgFzc03Fzc03FqZJsLUyTYBc3NNxc3NNxamSbC1Mk2AXNzTcXNzTcWpkmwtTJNgFzc03Fzc03FqZJsLUyTYBc3NNxc3NNxamSbC1Mk2AXNzTcXNzTcWpkmwtTJNgFzc03Fzc03FqZJsLUyTYBc3NNxc3NNxamSbC1Mk2AXNzTcXNzTcWpkmwtTJNgFzc03Fzc03FqZJsLUyTYBc3NNxc3NNxamSbC1Mk2AXNzTcXNzTcWpkmwtTJNgFzc03Fzc03FqZJsLUyTYBc3NNxc3NNxamSbC1Mk2AXNzTcXNzTcWpkmwtTJNgFzc03Fzc03FqZJsLUyTYBc3NNxc3NNxamSbC1Mk2AXNzTcXNzTcWpkmwtTJNgFzc03Fzc03FqZJsLUyTYBc3NNxc3NNxamSbC1Mk2AXNzTcXNzTcWpkmwtTJNgFzc03Fzc03FqZJsLUyTYBc3NNxc3NNxamSbC1Mk2AXNzTcXNzTcWpkmwtTJNgP0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//2Q==",
    demo:{
      why:"你只盯着 cos x 是偶函数，没算 x 那一部分。",
      how:"f(−x) = (−x)·cos(−x) = −x·cos x = −f(x)，所以是奇函数。",
      fix:"奇偶性只看 f(−x) 和 f(x) 的关系：相等是偶，互为相反数是奇。"
    }}
];

/* ================= 状态 ================= */
const KEY = "cuotiben.v2";
const APIK = "cuotiben.api.v1";
let BOOK = null, NOTES = null;
let curModule = "";
let DB = { book: null, items: [] };

function packById(id){ return PACKS.find(p=>p.id===id) || PACKS[0]; }
function applyPack(id){ const p = packById(id); BOOK = p.book; NOTES = p.notes; return p; }
function storeKey(id){ return KEY + "." + (id || DB.bookId || "calculus"); }
let tab = "map", filter = "all", curSec = null;

function deepClone(o){ return JSON.parse(JSON.stringify(o)); }
const $ = s=>document.querySelector(s);
const $$ = s=>[...document.querySelectorAll(s)];
const fmt = n => (Math.round(n*10)/10 % 1 === 0) ? String(Math.round(n)) : (Math.round(n*10)/10).toFixed(1);
const sum = a => a.reduce((x,y)=>x+y,0);

function esc(v){ return String(v==null?"":v).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
/* ---------- 数学记号：渲染与序列化 ----------
   存储用纯文本：\frac{2}{3}、^{x}、_{n}
   渲染成书写样式：分数上下两层、指数在右上
------------------------------------------------ */
function readBraced(s, idx){
  let depth = 0, out = "";
  for(let j = idx; j < s.length; j++){
    const ch = s[j];
    if(ch === "{"){ depth++; if(depth === 1) continue; }
    else if(ch === "}"){ depth--; if(depth === 0) return { body: out, next: j + 1 }; }
    out += ch;
  }
  return { body: out, next: s.length };
}

function renderMath(src){
  const plain = t => esc(t)
    .replace(/\^\{([^{}]*)\}/g, "<sup>$1</sup>")
    .replace(/\^\(([^()]*)\)/g, "<sup>$1</sup>")
    .replace(/\^([A-Za-z0-9])/g, "<sup>$1</sup>")
    .replace(/_\{([^{}]*)\}/g, "<sub>$1</sub>")
    .replace(/_\(([^()]*)\)/g, "<sub>$1</sub>")
    .replace(/_([A-Za-z0-9])/g, "<sub>$1</sub>");

  let out = "", buf = "", i = 0;
  const flush = ()=>{ if(buf){ out += plain(buf); buf = ""; } };
  while(i < src.length){
    if(src.startsWith("\\frac", i) && src[i + 5] === "{"){
      const a = readBraced(src, i + 5), b = readBraced(src, a.next);
      flush();
      out += `<span class="frc"><span class="frc-n">${renderMath(a.body)}</span>`
           + `<span class="frc-d">${renderMath(b.body)}</span></span>`;
      i = b.next; continue;
    }
    if(src.startsWith("^{", i)){
      const a = readBraced(src, i + 1); flush();
      out += `<sup>${renderMath(a.body)}</sup>`; i = a.next; continue;
    }
    if(src.startsWith("_{", i)){
      const a = readBraced(src, i + 1); flush();
      out += `<sub>${renderMath(a.body)}</sub>`; i = a.next; continue;
    }
    buf += src[i]; i++;
  }
  flush();
  return out;
}

function fmtQ(v){ return renderMath(String(v == null ? "" : v)); }

/* DOM → 存储用记号 */
function serializeQ(node){
  let out = "";
  node.childNodes.forEach(ch=>{
    if(ch.nodeType === 3){ out += ch.nodeValue.replace(/\u200b/g, ""); return; }
    if(ch.nodeType !== 1) return;
    const tag = ch.tagName;
    if(tag === "BR"){ out += " "; return; }
    if(tag === "SUP"){ out += "^{" + serializeQ(ch) + "}"; return; }
    if(tag === "SUB"){ out += "_{" + serializeQ(ch) + "}"; return; }
    if(ch.classList && ch.classList.contains("frc")){
      const a = ch.querySelector(".frc-n"), b = ch.querySelector(".frc-d");
      out += "\\frac{" + (a ? serializeQ(a) : "") + "}{" + (b ? serializeQ(b) : "") + "}";
      return;
    }
    out += serializeQ(ch);
  });
  return out;
}

/* 存储记号 → 人读的纯文本（用于归类判断） */
function markPlain(v){
  return String(v || "")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\^\{([^{}]*)\}/g, "^$1")
    .replace(/_\{([^{}]*)\}/g, "_$1");
}

function toast(m){ const t=$("#toast"); t.textContent=m; t.classList.add("on"); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("on"),1900); }

function sections(){ return DB.book.chapters.flatMap(ch=>ch.sections); }
function secOf(id){ return sections().find(s=>s.id===id); }
function secTitle(id){ const s=secOf(id); return s? s.id+" "+s.title : "未归类"; }
function chOf(id){ return DB.book.chapters.find(ch=>ch.sections.some(s=>s.id===id)); }
function chapterName(id){ const ch=chOf(id); return ch? ch.no+" "+ch.title : ""; }

function load(id){
  id = id || localStorage.getItem(KEY + ".last") || PACKS[0].id;
  const pack = applyPack(id);
  DB = { book: deepClone(BOOK), items: [], notes: deepClone(NOTES), notesVer: 3, custom:false, bookId: id };
  try{
    const raw = localStorage.getItem(storeKey(id)) || (id === PACKS[0].id ? localStorage.getItem(KEY) : null);
    if(raw){
      const o = JSON.parse(raw);
      if(o && o.book && Array.isArray(o.items)){
        DB = o; DB.bookId = id;
        if(DB.book.title === "微积分（新文科）") DB.book.title = "微积分";
        DB.items.forEach(it=>{ if(it.cause === "time") it.cause = "unknown"; });
        if(Array.isArray(DB.items) && DB.items.length === 14 && DB.items.every(it=>/^s\d+$/.test(it.id))){
          DB.items = seedItems();
        }
        syncNotes();
      }
    }
  }catch(e){}
}
/* 内容包更新后，把新的节合进来；手改过的节（edited）不动 */
function syncNotes(){
  if(typeof CONTENT_VER === "undefined") return;
  const fresh = (DB.contentVer !== CONTENT_VER);

  /* 目录（章、节名）也来自内容包。用户没自己导入过目录时，
     内容一更新就把目录一起换成新的，否则旧标题会一直留在本地快照里。 */
  if(fresh && !DB.custom){
    DB.book = deepClone(BOOK);
    const alive = new Set(Object.keys(NOTES));
    Object.keys(DB.notes || {}).forEach(k=>{ if(!alive.has(k)) delete DB.notes[k]; });
    if(curSec && !alive.has(curSec)) curSec = null;
  }

  DB.notes = DB.notes || {};
  for(const id in NOTES){
    const cur = DB.notes[id];
    const empty = !cur || (!(cur.concepts||[]).length && !(cur.types||[]).length && !(cur.examples||[]).length);
    if(empty || (fresh && !cur.edited)) DB.notes[id] = deepClone(NOTES[id]);
  }
  DB.notesVer = 3;
  DB.contentVer = CONTENT_VER;
}

function save(){
  try{
    localStorage.setItem(storeKey(), JSON.stringify(DB));
    localStorage.setItem(KEY + ".last", DB.bookId || PACKS[0].id);
    return true;
  }catch(e){ return false; }
}
function seedItems(){ return SAMPLE_ITEMS.map((it,i)=>({ id:"s"+i, ...deepClone(it) })); }

function seed(){
  const id = DB.bookId || PACKS[0].id;
  applyPack(id);
  DB = { book: deepClone(BOOK), items: seedItems(), notes: deepClone(NOTES), notesVer: 3, custom:false, bookId: id };
  save();
}

/* ================= 归类 ================= */
function classify(text){
  const raw = String(text || "").trim();
  const t = raw.toLowerCase();
  if(!raw) return null;

  const isInt      = /∫/.test(raw);
  const hasBounds  = /<sub>|_\d|_\(|_\{|\^\d|\^\(|\^\{|下限|上限/.test(raw);
  const product    = /[·*×]/.test(raw) || /x\s*(cos|sin|ln|e\s*\^?\s*x)/i.test(raw) || /(cos|sin|ln)\s*x/i.test(raw);

  if(isInt){
    if(hasBounds){
      if(/旋转|体积|面积|弧长|绕/.test(raw)) return {id:"5.4", why:"有上下限、问的是几何量 —— 定积分的应用"};
      return {id:"5.1", why:"积分号带上下限 —— 定积分"};
    }
    if(/换元|凑微分/.test(raw)) return {id:"4.2", why:"题目里提到换元"};
    if(product){
      const twoThings = /[·*×]/.test(raw);
      return {id:"4.3", why: twoThings
        ? "被积函数是两块东西相乘 —— 这类多半走分部积分"
        : "单个函数（如 ln x）也要用分部积分：把 dx 当成 dv"};
    }
    return {id:"4.1", why:"没有上下限，是不定积分"};
  }
  if(/∂/.test(raw)) return {id:"6.1", why:"出现了偏导符号 ∂"};
  if(/y′|y'|求导|的导数/.test(raw) && !/∫/.test(raw)) return {id:"2.2", why:"在求导数"};
  if(/∑|级数/.test(raw)){
    if(/幂级数|收敛半径|收敛域/.test(raw)) return {id:"7.2", why:"幂级数"};
    return {id:"7.1", why:"出现了求和符号或“级数”"};
  }
  if(/lim/.test(t) || /极限/.test(raw)){
    if(/洛必达|0\/0|∞\/∞|未定式/.test(raw)) return {id:"3.2", why:"未定式 —— 洛必达法则"};
    return {id:"1.3", why:"在求极限"};
  }
  if(/旋转|体积|弧长/.test(raw)) return {id:"5.4", why:"问的是几何量"};
  if(/单调|极值|极大|极小|驻点|最大|最小/.test(raw)) return {id:"3.3", why:"问的是单调性或极值"};
  if(/凹凸|拐点/.test(raw)) return {id:"3.4", why:"问的是凹凸性"};
  if(/微分方程|通解|特征方程|可分离/.test(raw)) return {id:"8.1", why:"微分方程"};
  if(/二重积分|累次积分/.test(raw)) return {id:"6.3", why:"二重积分"};
  if(/全微分/.test(raw)) return {id:"6.2", why:"全微分"};

  // 关键词兜底
  let best = null, bestScore = 0, bestHit = "";
  sections().forEach(sc=>{
    (sc.kw || []).forEach(k=>{
      if(k && t.includes(String(k).toLowerCase()) && String(k).length > bestHit.length){
        bestHit = k; best = sc; bestScore = 1;
      }
    });
  });
  if(best) return {id:best.id, why:`命中关键词「${bestHit}」`};
  return null;
}

/* ================= 计算 ================= */
function riskOf(secId){
  return sum(DB.items.filter(i=>i.sec===secId).map(i=>CM[i.cause].w * (1 + 0.35*i.lapses)));
}
function masteryOf(secId){
  const r = riskOf(secId);
  return Math.max(0.05, Math.min(1, Math.pow(0.55, r)));
}
function levelOf(secId){
  const m = masteryOf(secId), has = DB.items.some(i=>i.sec===secId);
  if(!has) return "";
  if(m < 0.45) return "h";
  if(m < 0.75) return "m";
  return "l";
}
function byCause(){
  const o = {}; CAUSES.forEach(c=>o[c.k]=0);
  DB.items.forEach(i=>{ o[i.cause] = (o[i.cause]||0)+1; });
  return o;
}
function dueLabel(d){ return d < 0 ? `逾期 ${-d} 天` : d === 0 ? "今天" : d === 1 ? "明天" : `${d} 天后`; }

/* ================= 左栏 ================= */
function renderSidebar(){
  const cnt = id => DB.items.filter(i=>i.sec===id).length;
  $("#bkTitle").textContent = DB.book.title;
  const ns = sections().length;
  const lb = (packById(DB.bookId).labels) || {};
  $("#bkMeta").textContent = isExam()
    ? `${DB.book.chapters.length} 个 Part · ${ns} 节`
    : `${DB.book.chapters.length} ${lb.unit || "章"} · ${ns} ${lb.sec || "节"} · ${DB.items.length} 道错题`;
  const tocBtn = $("#btnToc");
  if(tocBtn) tocBtn.textContent = lb.toc || "目录";
  const usageEl = $("#usage"), resetBtn = $("#btnReset");
  if(usageEl) usageEl.style.display = isExam() ? "none" : "";
  if(resetBtn) resetBtn.style.display = isExam() ? "none" : "";

  let h = "";
  const chs = isExam()
    ? DB.book.chapters.filter(c=>c.no === curModule || (curModule === "" && c === DB.book.chapters[0]))
    : DB.book.chapters;
  if(isExam() && chs.length === 0) chs.push(DB.book.chapters[0]);
  chs.forEach(ch=>{
    const cn = sum(ch.sections.map(s=>cnt(s.id)));
    h += `<div class="ch">${ch.no} ${ch.title}${cn?` <span style="color:#b23a2f;font-weight:500">·${cn}</span>`:""}</div>`;

    ch.sections.forEach(s=>{
      const n = cnt(s.id), lv = levelOf(s.id);
      h += `<div class="sec${curSec===s.id?" on":""}" data-sec="${s.id}">
        <span class="dot ${lv}"></span>
        <span class="nm">${s.id} ${s.title}</span>
        ${n?`<span class="n num">${n}</span>`:""}
      </div>`;
    });
  });
  $("#toc").innerHTML = h;
  $$("#toc .sec").forEach(el=>el.addEventListener("click", ()=>{
    curSec = curSec === el.dataset.sec ? null : el.dataset.sec;
    document.body.classList.remove("toc-open");
    renderSidebar(); renderAll();
  }));
}

/* ================= 地图 ================= */
function renderMap(){
  const lb = packById(DB.bookId).labels || {};
  const sw = lb.sec || "节";
  if($("#hMatrix")) $("#hMatrix").textContent = `按${sw} × 错因`;
  if($("#hMastery")) $("#hMastery").textContent = `各${sw}掌握度`;
  const items = curSec ? DB.items.filter(i=>i.sec===curSec) : DB.items;
  const c = {}; CAUSES.forEach(x=>c[x.k]=0);
  items.forEach(i=>c[i.cause]++);
  const total = items.length;

  if(!total){
    const stale = document.getElementById("compBar"); if(stale) stale.remove();
    $("#mapLead").innerHTML = curSec ? "这一节还没有错题。" : "还没有错题。";
    $("#matrix").innerHTML = ""; $("#mastery").innerHTML = "";
    return;
  }

  const secs = [...new Set(items.map(i=>i.sec))];
  const top = secs.map(id=>({ id, n: items.filter(i=>i.sec===id).length }))
                  .sort((a,b)=>b.n-a.n)[0];
  const topUnknown = items.filter(i=>i.sec===top.id && i.cause==="unknown").length;
  $("#mapLead").innerHTML = secs.length === 1
    ? `<b>${total}</b> 道错题，都在「${secTitle(top.id)}」` +
      (topUnknown ? `，其中 ${topUnknown} 道是不会` : "") + "。"
    : `<b>${total}</b> 道错题，最集中的是「${secTitle(top.id)}」，${top.n} 道` +
      (topUnknown ? `，其中 ${topUnknown} 道是不会` : "") + "。";

  const oldBar = document.getElementById("compBar");
  if(oldBar) oldBar.remove();
  if(total){
    const el = document.createElement("div");
    el.id = "compBar";
    el.className = "comp";
    const segs = CAUSES.map(c=>{
      const n = items.filter(i=>i.cause===c.k).length;
      return n ? `<span style="width:${(n/total*100).toFixed(2)}%;background:${c.color}"></span>` : "";
    }).join("");
    const leg = CAUSES.map(c=>{
      const n = items.filter(i=>i.cause===c.k).length;
      return n ? `<span><i style="background:${c.color}"></i>${c.name} <b class="num">${n}</b></span>` : "";
    }).join("");
    el.innerHTML = `<div class="cbar">${segs}</div><div class="cleg">${leg}</div>`;
    $("#mapLead").parentNode.insertBefore(el, $("#mapLead").nextSibling);
  }

  // 矩阵
  const rows = secs.map(id=>{
    const cells = {}; CAUSES.forEach(x=>cells[x.k]=0);
    items.filter(i=>i.sec===id).forEach(i=>cells[i.cause]++);
    return {id, cells, total:sum(Object.values(cells))};
  }).sort((a,b)=>b.total-a.total);
  const max = Math.max(1, ...rows.flatMap(r=>CAUSES.map(x=>r.cells[x.k])));

  const uw = (packById(DB.bookId).labels || {}).sec || "节";
  let h = `<thead><tr><th>${uw}</th>${CAUSES.map(x=>`<th class="c">${x.name}</th>`).join("")}<th class="t">合计</th></tr></thead><tbody>`;
  rows.forEach(r=>{
    h += `<tr><td title="${secTitle(r.id)}">${secTitle(r.id)}</td>`;
    CAUSES.forEach(x=>{
      const v = r.cells[x.k];
      if(!v){ h += `<td class="empty"></td>`; return; }
      const a = 0.06 + 0.26*(v/max);
      h += `<td class="num" style="background:rgba(178,58,47,${a.toFixed(3)})">${v}</td>`;
    });
    h += `<td class="num tot">${r.total}</td></tr>`;
  });
  $("#matrix").innerHTML = h + "</tbody>";

  // 掌握度
  const all = sections().filter(s=>DB.items.some(i=>i.sec===s.id))
    .map(s=>({s, m:masteryOf(s.id), r:riskOf(s.id)}))
    .sort((a,b)=>a.m-b.m);
  $("#mastery").innerHTML = all.map(x=>{
    const pct = Math.round(x.m*100);
    const col = x.m<0.45 ? "#b23a2f" : x.m<0.75 ? "#c4762f" : "#3f7194";
    return `<li><span>${x.s.id} ${x.s.title}</span>
      <span class="track"><i style="width:${Math.max(6,pct)}%;background:${col}"></i></span>
      <span class="pct num">${pct}%</span></li>`;
  }).join("");
}

/* ================= 错题 ================= */
function renderItems(){
  const chips = [{k:"all",n:"全部"},...CAUSES.map(c=>({k:c.k,n:c.name}))];
  $("#chips").innerHTML = chips.map(c=>`<button data-f="${c.k}" class="${filter===c.k?"on":""}">${c.n}</button>`).join("");
  $$("#chips button").forEach(b=>b.addEventListener("click",()=>{ filter=b.dataset.f; renderItems(); }));

  let list = DB.items.filter(i=>(!curSec || i.sec===curSec) && (filter==="all" || i.cause===filter));
  if(!list.length){ $("#itemList").innerHTML = `<div class="card" style="color:#70767f">这个筛选下没有错题。</div>`; return; }

  $("#itemList").innerHTML = list.map(i=>`
    <div class="qi">
      <div class="qrow">${(i.img||i.imgKey)?`<img class="qimg" src="${i.img||""}" data-key="${i.imgKey||""}" alt="">`:""}<p class="q">${fmtQ(i.q)}</p></div>
      <div class="meta">
        <span class="tag" data-c="${i.cause}"><i></i>${CM[i.cause].name}</span>
        <span>${secTitle(i.sec)}</span>
        <span>·</span>
        <span>${chapterName(i.sec)}</span>
        <span class="act">
          <button class="tiny" data-review="${i.id}">复习完了</button>
          <button class="tiny primary" data-explain="${i.id}">讲讲这题</button>
          <button class="tiny ghost" data-del="${i.id}" title="删掉">删</button>
        </span>
      </div>
    </div>`).join("");

  $$("[data-review]").forEach(b=>b.addEventListener("click", ()=>{
    const it = DB.items.find(x=>x.id===b.dataset.review);
    it.due += INTERVAL[it.cause]; save(); renderSidebar(); renderReview();
    toast(`下次复习：${dueLabel(it.due)}`);
  }));
  $$("[data-explain]").forEach(b=>b.addEventListener("click", ()=>openExplain(b.dataset.explain)));
  $$("[data-del]").forEach(b=>b.addEventListener("click", ()=>{
    if(!confirm("删掉这道题？")) return;
    const gone = DB.items.find(x=>x.id === b.dataset.del);
    if(gone && gone.imgKey) imgDel(gone.imgKey);
    DB.items = DB.items.filter(x=>x.id !== b.dataset.del);
    save(); renderAll(); toast("已删除");
  }));
  $("#itemList").addEventListener("click", async e=>{
    const im = e.target.closest(".qimg"); if(!im) return;
    $("#viewImg").src = im.src;
    $("#viewer").classList.remove("hide");
    $("#viewer").classList.remove("zoom");
    const key = im.dataset.key;
    if(key){
      const full = await imgGet(key);
      if(full) $("#viewImg").src = full;
    }
  });
  $("#vClose").addEventListener("click", ()=>$("#viewer").classList.add("hide"));
  $("#viewImg").addEventListener("click", ()=>$("#viewer").classList.toggle("zoom"));
  $("#viewer").addEventListener("click", e=>{ if(e.target.id==="viewer") $("#viewer").classList.add("hide"); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") $("#viewer").classList.add("hide"); });
}

/* ================= 复习 ================= */
function renderReview(){
  const due = DB.items.filter(i=>i.due<=0).sort((a,b)=>a.due-b.due);
  const soon = DB.items.filter(i=>i.due>0 && i.due<=7).sort((a,b)=>a.due-b.due);
  $("#dueCount").textContent = due.length ? ` · ${due.length} 道` : " · 清空了";

  $("#dueList").innerHTML = due.length ? due.map(i=>`
    <div class="rv">
      <span class="when ${i.due<0?"over":""}">${dueLabel(i.due)}</span>
      <span class="body">${fmtQ(i.q)}
        <span class="sub">${secTitle(i.sec)} · ${CM[i.cause].name} · 已错 ${i.lapses+1} 次</span>
      </span>
      <button class="tiny primary" data-rev2="${i.id}">做完了</button>
    </div>`).join("") : `<div style="color:#70767f;font-size:13.5px;padding:6px 0">今天没有到期的。</div>`;

  $("#soonList").innerHTML = soon.length ? soon.map(i=>`
    <div class="rv">
      <span class="when">${dueLabel(i.due)}</span>
      <span class="body">${fmtQ(i.q)}<span class="sub">${secTitle(i.sec)}</span></span>
    </div>`).join("") : `<div style="color:#70767f;font-size:13.5px">未来 7 天没有安排。</div>`;

  $$("[data-rev2]").forEach(b=>b.addEventListener("click", ()=>{
    const it = DB.items.find(x=>x.id===b.dataset.rev2);
    it.due += INTERVAL[it.cause]; save(); renderSidebar(); renderReview();
    toast(`下次复习：${dueLabel(it.due)}`);
  }));
}

/* ================= 知识点（按节） ================= */

function notesOf(id){ return (DB.notes && DB.notes[id]) || null; }

function renderNotes(){
  const host = $("#notesCard");
  if(!host) return;

  const countOf = nt => nt ? (nt.concepts||nt.points||[]).length + (nt.types||[]).length + (nt.examples||[]).length : 0;

  if(!curSec && isExam()){
    const ch = DB.book.chapters.find(c=>c.no===curModule) || DB.book.chapters[0];
    const rows = ch.sections.map(s=>{
      return `<li data-goto="${s.id}"><span>${s.id} ${s.title}</span></li>`;
    }).join("");
    const toolRow = Object.entries(TOOLS).filter(([,t])=>t.chapter===ch.title).map(([id,t])=>
      `<button class="toolrow" data-tool="${id}"><span class="tooltag">AI 批改</span>`
      + `<span class="toolname">${esc(t.title)}</span><span class="toolgo">→</span></button>`).join("");

    if(ch.title === "词汇"){
      const w = vocabDue("w"), p = vocabDue("p");
      const weak = vocabAll("weak").length, master = vocabAll("mastered").length;
      host.innerHTML = (toolRow ? `<div class="tools">${toolRow}</div>` : "")
        + `<div class="vch">`
        + `<button class="vcard" data-vocab="w"><span class="vname">核心词</span>`
        + `<span class="vnum">${w.total} 个</span>`
        + `<span class="vsub">待复习 ${w.due.length} · 生词 ${w.weak.length} · 未学 ${w.fresh.length}</span></button>`
        + `<button class="vcard" data-vocab="p"><span class="vname">高频词组</span>`
        + `<span class="vnum">${p.total} 条</span>`
        + `<span class="vsub">待复习 ${p.due.length} · 生词 ${p.weak.length} · 未学 ${p.fresh.length}</span></button>`
        + `</div>`
        + `<div class="vlist"><button class="vlbtn" data-vlist="weak"><span>生词本</span><b>${weak}</b></button>`
        + `<button class="vlbtn" data-vlist="mastered"><span>已掌握</span><b>${master}</b></button></div>`;
      return;
    }
    host.innerHTML = (toolRow ? `<div class="tools">${toolRow}</div>` : "")
      + `<ul class="nlist">${rows}</ul>`;
    return;
  }

  if(!curSec){
    const rows = sections().map(s=>{
      const c = countOf(notesOf(s.id));
      return `<li data-goto="${s.id}"><span>${s.id} ${s.title}</span><span class="m">${c ? c + " 条" : "未整理"}</span></li>`;
    }).join("");
    host.innerHTML = `<ul class="nlist">${rows}</ul>`;
    return;
  }

  const s = secOf(curSec);
  const nt = notesOf(curSec);
  const chOf = DB.book.chapters.find(c=>c.no === curModule);
  const back = isExam()
    ? `<button class="backmod" data-back="${esc(curModule)}">← ${esc(chOf ? chOf.title : "模块")}</button>`
    : "";
  const head = `<div class="notes-head"><h2>${s.id} ${s.title}</h2><button class="tiny" data-edit="${s.id}">编辑</button></div>`;
  const headWithBack = back ? back + head : head;
  if(!nt || !countOf(nt)){ host.innerHTML = headWithBack + `<div class="nempty">这一节还没有整理。</div>`; return; }

  const concepts = nt.concepts || nt.points || [];
  const ul = arr => (arr && arr.length) ? `<ul>${arr.map(x=>`<li>${fmtQ(x)}</li>`).join("")}</ul>` : "";
  const isPlain = !!nt.plain;
  const isFlash = isExam() && !isPlain;
  const exs = (nt.examples||[]).length
    ? (isPlain
        ? nt.examples.map(e=>`<div class="prow"><span class="pq">${fmtQ(e.q)}</span>`
            + `<span class="pa">${fmtQ(e.a || "")}</span></div>`).join("")
        : isFlash
        ? nt.examples.map(e=>`<details class="flash"><summary><span class="fl-q">${fmtQ(e.q)}</span></summary>`
            + `<div class="fl-body">`
            + (e.a ? `<p class="fl-a">${fmtQ(e.a)}</p>` : "")
            + (e.analysis ? `<p class="fl-note">${fmtQ(e.analysis)}</p>` : "")
            + `</div></details>`).join("")
        : nt.examples.map(e=>{
        const ans = e.a ? fmtQ(e.a) : "";
        const ana = e.analysis ? fmtQ(e.analysis) : "";
        const inner = ans ? `<details class="ans"><summary>答案</summary>`
            + `<div class="ansbody"><p class="a">${ans}</p>`
            + (ana ? `<details class="ana"><summary>解析</summary><p class="a">${ana}</p></details>` : "")
            + `</div></details>` : "";
        return `<div class="ex"><p class="q">${fmtQ(e.q)}</p>${inner}</div>`;
      }).join(""))
    : "";
  const typList = (nt.types||[]).map(x=>{
    if(typeof x === "string") return `<div class="typ flat"><div class="typname">${fmtQ(x)}</div></div>`;
    return `<details class="typ"><summary>${fmtQ(x.t)}</summary>`
      + `<div class="typbody">${fmtQ(x.how || "")}</div></details>`;
  }).join("");
  const typs = typList ? `<div class="typs">${typList}</div>` : "";
  const blk = (t, inner) => inner ? `<div class="nblock"><h3>${t}</h3>${inner}</div>` : "";

  host.innerHTML = headWithBack
    + blk("概念", ul(concepts))
    + blk("重点题型", typs)
    + blk((packById(DB.bookId).labels || {}).ex || "例题", exs);
}

function openNotesEditor(id){
  const s = secOf(id);
  const nt = notesOf(id) || {concepts:[],types:[],examples:[]};
  $("#ntTitle").textContent = `${s.id} ${s.title}`;
  $("#ntPoints").value = (nt.concepts || nt.points || []).join("\n");
  $("#ntTypes").value = (nt.types||[]).map(x=> typeof x === "string" ? x : [x.t, x.how||""].join(" ||| ")).join("\n");
  $("#ntExamples").value = (nt.examples||[]).map(e=>[e.q, e.a||"", e.analysis||""].join(" ||| ")).join("\n");

  $("#modalNotes").dataset.sec = id;
  $("#modalNotes").classList.remove("hide");
}

function renderAddNotes(){
  const box = $("#addNotes");
  if(!box) return;
  const nt = notesOf($("#addSec").value);
  const ps = (nt && (nt.concepts || nt.points)) || [];
  if(!ps.length){ box.classList.add("hide"); box.innerHTML = ""; return; }
  box.classList.remove("hide");
  box.innerHTML = `<details class="mini"><summary>本节概念 · ${ps.length} 条</summary>`
    + `<div class="mini-body"><ul>${ps.map(x=>`<li>${fmtQ(x)}</li>`).join("")}</ul></div></details>`;
}

/* ================= 背单词（艾宾浩斯） ================= */
const EBB = [4, 24, 48, 96, 168, 360, 720];   // 小时后：4h 1d 2d 4d 7d 15d 30d
let VOCAB = { pool: [], idx: 0, key: "", shown: false, done: 0 };

function vocabState(){ DB.srs = DB.srs || {}; return DB.srs; }
function vocabKey(kind, q){ return kind + ":" + q; }

function shuffle(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function vocabDue(kind){
  const st = vocabState(), now = Date.now();
  const src = DB.notes[kind === "w" ? "5.1" : "5.2"];
  const all = (src && src.examples) || [];
  const due = [], fresh = [], weak = [], mastered = [];
  all.forEach(e=>{
    const rec = st[vocabKey(kind, e.q)];
    if(!rec){ fresh.push(e); return; }
    if(rec.mastered){ mastered.push(e); return; }
    if(rec.stage <= 1) weak.push(e);
    // 生词（不认识/模糊）下次进入时优先进队列，不必等到期
    if(rec.stage <= 1 || rec.due <= now) due.push(e);
  });
  return { due, fresh, weak, mastered, total: all.length,
           learned: all.length - fresh.length, masteredN: mastered.length };
}

/* 生词本与已掌握：两类词合起来看 */
function vocabAll(filter){
  const out = [];
  [["w","核心词"],["p","高频词组"]].forEach(([k,label])=>{
    const src = DB.notes[k === "w" ? "5.1" : "5.2"];
    ((src && src.examples) || []).forEach(e=>{
      const rec = vocabState()[vocabKey(k, e.q)];
      if(!rec) return;
      if(filter === "weak" && !rec.mastered && rec.stage <= 1) out.push({...e, kind:label});
      if(filter === "mastered" && rec.mastered) out.push({...e, kind:label});
    });
  });
  return out;
}

function openVocabList(filter){
  const list = vocabAll(filter);
  $("#vlTitle").textContent = filter === "weak" ? "生词本" : "已掌握";
  $("#vlMeta").textContent = list.length ? `${list.length} 个` : "还没有";
  $("#vlBody").innerHTML = list.length
    ? list.map(e=>`<div class="vlrow"><span class="vlw">${esc(e.q)}</span><span class="vlm">${esc(e.a || "")}</span></div>`).join("")
    : `<p class="toolnote">${filter === "weak" ? "背词时标「不认识」或「模糊」的词会出现在这里。" : "标「认识」的词会收进这里。"}</p>`;
  $("#modalVocabList").classList.remove("hide");
}

function openVocab(kind){
  const d = vocabDue(kind);
  const pool = shuffle(d.due.slice()).concat(shuffle(d.fresh.slice())).slice(0, 20);
  if(!pool.length){ toast("今天这部分都复习完了"); return; }
  VOCAB = { pool, idx: 0, key: kind, shown: false, done: 0 };
  $("#vocabTitle").textContent = kind === "w" ? "核心词" : "高频词组";
  $("#modalVocab").classList.remove("hide");
  drawVocab();
}

function vocabMark(mark){
  const st = vocabState();
  const item = VOCAB.pool[VOCAB.idx]; if(!item) return;
  const k = vocabKey(VOCAB.key, item.q);
  const rec = st[k] || { stage: 0, seen: 0 };
  rec.seen++;
  if(mark === "again"){ rec.stage = 0; rec.mastered = false; }
  else if(mark === "hard"){ rec.stage = Math.max(0, rec.stage - 1); rec.mastered = false; }
  else { rec.stage = EBB.length - 1; rec.mastered = true; }
  const h = EBB[rec.stage];
  rec.due = Date.now() + h * 3600 * 1000;
  st[k] = rec;
  const day = new Date().toISOString().slice(0, 10);
  DB.vocabDay = DB.vocabDay || {};
  DB.vocabDay[day] = (DB.vocabDay[day] || 0) + 1;
  save();
  toast(mark === "again" ? "已记下，4 小时后会再出现"
        : mark === "hard" ? "已记下，下次提前复习"
        : "已记下，" + EBB[rec.stage] + " 小时后复习");
  // 不认识的词，本轮末尾再出现一次（和背单词软件一致）
  if(mark === "again" && VOCAB.pool.length < 40) VOCAB.pool.push(item);
  VOCAB.idx++; VOCAB.done++;
  if(VOCAB.idx >= VOCAB.pool.length){ finishVocab(); return; }
  drawVocab();
}

function finishVocab(){
  const d = vocabDue(VOCAB.key);
  $("#vocabCard").classList.add("hide");
  $("#vocabAct").classList.add("hide");
  $("#vocabTap").classList.add("hide");
  $("#vocabMeta").innerHTML = `这一轮完成，共 ${VOCAB.done} 个。`
    + `<br>已记录，到期会自动回到队列：待复习 ${d.due.length}，未学 ${d.fresh.length}。`;
  $("#vocabBar").style.width = "100%";
  setTimeout(()=>{ $("#modalVocab").classList.add("hide"); renderNotes(); }, 1200);
}

function drawVocab(){
  const it = VOCAB.pool[VOCAB.idx]; if(!it) return;
  VOCAB.shown = false;
  $("#vocabCard").classList.remove("hide");
  $("#vocabAct").classList.add("hide");
  $("#vocabTap").classList.remove("hide");
  $("#vocabWord").textContent = it.q;
  $("#vocabMean").textContent = it.a || "";
  $("#vocabNote").textContent = it.analysis || "";
  $("#vocabBack").classList.add("hide");
  const pct = Math.round(VOCAB.idx / VOCAB.pool.length * 100);
  $("#vocabBar").style.width = pct + "%";
  const d = vocabDue(VOCAB.key);
  const today = (DB.vocabDay || {})[new Date().toISOString().slice(0,10)] || 0;
  $("#vocabMeta").textContent = `${VOCAB.idx + 1} / ${VOCAB.pool.length}　`
    + `已学 ${d.learned} · 待复习 ${d.due.length} · 未学 ${d.fresh.length}　今天 ${today} 个`;
}

function vocabShowBack(){
  VOCAB.shown = true;
  $("#vocabBack").classList.remove("hide");
  $("#vocabTap").classList.add("hide");
  $("#vocabAct").classList.remove("hide");
}

/* ================= 批改工具（四级） ================= */
const TOOLS = {
  "write-check": {
    title: "作文批改",
    chapter: "写作",
    fields: [{ id: "essay", label: "把你的作文粘进来", rows: 10,
               ph: "直接粘贴英文原文，不用标题" }],
    sys: "你是大学英语四级阅卷老师。按四级写作评分标准（满分 15 分）批改，用中文回答，不客套。",
    ask: t => `请批改下面这篇四级作文：\n\n${t.essay}\n\n按这个格式输出：\n1. 评分：X/15，一句话说明理由\n2. 错误：逐条列出「原文 → 改为 → 原因」，最多 6 条\n3. 升级：给出 3 处可以写得更好的表达\n4. 建议：接下来最该练的一点`
  },
  "trans-check": {
    title: "翻译批改",
    chapter: "翻译",
    fields: [{ id: "src", label: "中文原句", rows: 3, ph: "粘贴题目给的段落" },
             { id: "mine", label: "你的译文", rows: 4, ph: "粘贴你翻的英文" }],
    sys: "你是大学英语四级翻译阅卷老师。按四级翻译评分标准（满分 15 分）批改，用中文回答，不客套。",
    ask: t => `中文原文：\n${t.src}\n\n学生的译文：\n${t.mine}\n\n按这个格式输出：\n1. 评分：X/15，一句话说明理由\n2. 问题：逐条列出漏译、误译、搭配或语法错误，每条给出正确写法\n3. 参考译文：给一个贴近原文的版本\n4. 高频表达：从这段里挑 2-3 个值得记住的搭配`
  }
};

function openTool(id){
  const t = TOOLS[id]; if(!t) return;
  $("#toolTitle").textContent = t.title;
  $("#modalTool").dataset.tool = id;
  $("#toolFields").innerHTML = t.fields.map(f=>
    `<label class="f">${esc(f.label)}</label><textarea id="tf-${f.id}" rows="${f.rows}" placeholder="${esc(f.ph||"")}" style="min-height:${f.rows*22}px"></textarea>`
  ).join("");
  $("#toolOut").classList.add("hide");
  $("#toolOut").innerHTML = "";
  $("#modalTool").classList.remove("hide");
}

async function runTool(){
  const id = $("#modalTool").dataset.tool;
  const t = TOOLS[id]; if(!t) return;
  const val = {};
  for(const f of t.fields){ val[f.id] = ($("#tf-"+f.id).value || "").trim(); }
  if(t.fields.some(f=>!val[f.id])){ toast("先把内容填上"); return; }

  const out = $("#toolOut");
  out.classList.remove("hide");
  const cfg = apiCfg();
  if(!(cfg.key && cfg.url && cfg.model)){
    out.innerHTML = `<p class="toolnote">还没接入模型。点右上「AI 设置」填一个 key，这里就能自动批改。</p>`;
    return;
  }
  out.innerHTML = `<p class="toolnote"><span class="spin"></span>正在批改…</p>`;
  try{
    const res = await fetch(normalizeApiUrl(cfg.url), {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+cfg.key},
      body: JSON.stringify({ model: cfg.model, temperature: 0.3,
        messages:[{role:"system",content:t.sys},{role:"user",content:t.ask(val)}] })
    });
    if(!res.ok){
      const e = await res.text().catch(()=> "");
      throw new Error(explainApiFailure(res.status, normalizeApiUrl(cfg.url), apiErrorText(e)));
    }
    const d = await res.json();
    const txt = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || "";
    out.innerHTML = `<p class="toolnote">由 ${esc(cfg.model)} 批改</p>`
      + `<div class="tooltext">` + esc(txt).replace(/\n/g, "<br>") + `</div>`;
  }catch(e){
    out.innerHTML = `<p class="toolnote">批改失败：${esc(String(e.message||e))}</p>`;
  }
}

/* ================= 模式 ================= */
function isExam(){ return (packById(DB.bookId).mode === "exam"); }

function renderModBar(){
  const bar = $("#modBar");
  if(!isExam()){ bar.classList.add("hide"); document.body.classList.remove("exam"); return; }
  document.body.classList.add("exam");
  bar.classList.remove("hide");
  const cur = DB.book.chapters.findIndex(c=>c.sections.some(s=>s.id===curSec));
  const active = cur >= 0 ? cur : (DB.book.chapters.findIndex(c=>c.no === curModule) >= 0
                    ? DB.book.chapters.findIndex(c=>c.no === curModule) : 0);
  bar.innerHTML = DB.book.chapters.map((c,i)=>
    `<button data-mod="${i}" class="${i===active?"on":""}">${esc(c.title)}</button>`).join("");
  curModule = DB.book.chapters[active] ? DB.book.chapters[active].no : "";
}

function openModule(i){
  const ch = DB.book.chapters[i]; if(!ch) return;
  curModule = ch.no;
  curSec = null;
  renderModBar();
  goTab("notes");
  renderSidebar();
  renderNotes();
}

/* ================= 书架 ================= */
function renderShelf(){
  const last = localStorage.getItem(KEY + ".last") || "";
  $("#shelfList").innerHTML = PACKS.map(p=>`
    <button class="bookcard${p.id===last?" last":""}" data-book="${p.id}">
      <span class="bk-mark">${esc(p.mark || "")}</span>
      <span class="bk-kicker">${esc(p.meta || "")}</span>
      <span class="bk-name">${esc(p.name)}</span>
      <span class="bk-sub">${esc(p.tagline || "")}</span>
      <span class="bk-go">${p.id===last ? "继续上次" : "进入"} <i>→</i></span>
    </button>`).join("");
}

function switchBook(id){
  if(DB.bookId === id) return;
  save();
  load(id);
  curSec = null;
  renderSidebar(); renderAll();
  renderModBar();
  goTab(isExam() ? "notes" : "map");
  toast("已进入「" + packById(id).name + "」");
}

let openingTimer = null;
function openBook(id){
  if(openingTimer) return;                 // 动画期间忽略重复点击
  const card = document.querySelector('[data-book="' + id + '"]');
  if(card) card.classList.add("opening");
  document.body.classList.add("shelf-leaving");
  // 先在封面背后把内容换成目标书，等渲染完成再散场，避免露出上一本书
  if(DB.bookId !== id) switchBook(id);
  else { renderSidebar(); renderAll(); }
  openingTimer = setTimeout(()=>{
    openingTimer = null;
    document.body.classList.remove("shelf-open", "shelf-leaving");
  }, 320);
}

function showShelf(){
  renderShelf();
  document.body.classList.add("shelf-open");
}

/* ================= 讲解 ================= */
function apiCfg(){
  try{ return JSON.parse(localStorage.getItem(APIK) || "{}"); }catch(e){ return {}; }
}

/* 各家厂商的默认路径与模型，用于补全和预填 */
const PROVIDERS = {
  "api.deepseek.com":      { path:"/chat/completions",                 model:"deepseek-chat",  vision:"deepseek-v4-flash-vision-exp" },
  "api.openai.com":        { path:"/v1/chat/completions",              model:"gpt-4o-mini",    vision:"gpt-4o" },
  "open.bigmodel.cn":      { path:"/api/paas/v4/chat/completions",     model:"glm-4-flash",    vision:"glm-4v" },
  "dashscope.aliyuncs.com":{ path:"/compatible-mode/v1/chat/completions", model:"qwen-plus",   vision:"qwen-vl-max" },
  "api.moonshot.cn":       { path:"/v1/chat/completions",              model:"moonshot-v1-8k", vision:"moonshot-v1-8k-vision-preview" },
  "api.siliconflow.cn":    { path:"/v1/chat/completions",              model:"Qwen/Qwen2.5-7B-Instruct", vision:"Qwen/Qwen2-VL-7B-Instruct" }
};

/* 用户只需要填域名，缺的路径自动补 */
function normalizeApiUrl(raw){
  let u = String(raw || "").trim().replace(/[\u200b-\u200d\ufeff]/g, "");
  if(!u) return "";
  if(!/^https?:\/\//i.test(u)) u = "https://" + u;
  u = u.replace(/\/+$/, "");
  if(/\/chat\/completions$/i.test(u)) return u;
  let host = "";
  try{ host = new URL(u).hostname.toLowerCase(); }catch(e){ return u; }

  /* 阿里云百炼：业务空间专属域名与公共域名，强制走 OpenAI 兼容路径。
     用户常把 Base URL（不带路径）或原生 /api/v1 粘进来，两种都要纠正。 */
  if(/(^|\.)maas\.aliyuncs\.com$/i.test(host) || host === "dashscope.aliyuncs.com")
    return "https://" + host + "/compatible-mode/v1/chat/completions";

  const preset = PROVIDERS[host];
  if(preset){
    try{
      const p = new URL(u).pathname;
      if(!p || p === "/") return u + preset.path;
    }catch(e){}
    return u + "/chat/completions";
  }
  if(/\/v\d+$/i.test(u)) return u + "/chat/completions";
  try{
    const p = new URL(u).pathname;
    if(!p || p === "/") return u + "/v1/chat/completions";
  }catch(e){}
  return u + "/chat/completions";
}

/* 从服务端返回体里挖出人能看懂的那句话 */
function apiErrorText(body){
  const t = String(body || "").slice(0, 400);
  try{
    const o = JSON.parse(t);
    const m = (o.error && (o.error.message || o.error.code)) || o.message || o.msg;
    if(m) return String(m).slice(0, 160);
  }catch(e){}
  const m = t.match(/"message"\s*:\s*"([^"]{1,160})"/);
  return m ? m[1] : t.replace(/\s+/g, " ").slice(0, 120);
}

/* 把失败原因翻译成一句可执行的建议 */
function explainApiFailure(status, url, detail){
  const u = url || "";
  if(status === 403){
    if(/AccessDenied|unpurchased|not eligible|denied/i.test(detail || ""))
      return "这个模型在你账号里没有开通（HTTP 403）。去控制台开通该模型，或把模型名换成可用的那个。\n服务端原话：" + (detail || "");
    return "密钥没有调用权限（HTTP 403）。检查这个 key 是否属于可用的业务空间，以及是否已开通该模型。\n服务端原话：" + (detail || "");
  }
  if(status === 401)
    return "密钥无效（HTTP 401）。检查是否复制完整、有没有多余空格或换行。";
  if(status === 429)
    return "请求太频繁或额度用完（HTTP 429），等一会儿再试；长期不够要去控制台看免费额度。";
  if(status === 404)
    return "地址不对（HTTP 404）。调用的是 " + u + "，通常要补 /v1 或 /chat/completions。";
  if(status === 400)
    return "请求被拒（HTTP 400）：" + (detail || "多半是模型名写错了。");
  if(status >= 500)
    return "服务端出错（HTTP " + status + "），稍后再试。";
  return "HTTP " + status + (detail ? "：" + detail : "");
}

/* ---------- 拍照识别 ---------- */
const OCR_PROMPT = [
  "你是题目转录工具。把图片里的题目转录成一行纯文本，规则：",
  "1. 数学符号一律用 Unicode：∫ ∂ ∑ √ ≤ ≥ ≠ ± × ÷ ∞ π θ α β γ Δ 等；",
  "2. 上下标用 ^{…} 和 _{…}，例如 e^{x}、∫_{0}^{1} x^{2} dx、lim_{x→0}；",
  "3. 分数用 \\frac{分子}{分母}，根号用 √(…)；",
  "4. 保留题号、括号、单位；",
  "5. 不要解题、不要解释、不要输出任何前后缀；",
  "6. 看不清的字用 □ 代替。",
  "只输出转录结果。"
].join("\n");

let pendingImg = null;

let _mime = null;
function pickMime(){
  if(_mime) return _mime;
  try{
    const c = document.createElement("canvas"); c.width = 8; c.height = 8;
    _mime = c.toDataURL("image/webp").indexOf("data:image/webp") === 0 ? "image/webp" : "image/jpeg";
  }catch(e){ _mime = "image/jpeg"; }
  return _mime;
}

// 逐档降质量，直到编码结果不超过预算（dataURL 字符数）
function encodeBudget(cv, budget){
  const mime = pickMime();
  let q = 0.86, url = cv.toDataURL(mime, q);
  while(url.length > budget && q > 0.34){
    q -= 0.07;
    url = cv.toDataURL(mime, q);
  }
  return url;
}

let _imgDB;
function imgDB(){
  if(_imgDB !== undefined) return Promise.resolve(_imgDB);
  return new Promise(res=>{
    try{
      const r = indexedDB.open("cuotiben-img", 1);
      r.onupgradeneeded = ()=>{ r.result.createObjectStore("img"); };
      r.onsuccess = ()=>{ _imgDB = r.result; res(_imgDB); };
      r.onerror = ()=>{ _imgDB = null; res(null); };
      r.onblocked = ()=>{ _imgDB = null; res(null); };
    }catch(e){ _imgDB = null; res(null); }
  });
}
function imgPut(k, v){
  return imgDB().then(db=> !db ? false : new Promise(res=>{
    try{ const tx = db.transaction("img","readwrite"); tx.objectStore("img").put(v, k);
      tx.oncomplete = ()=>res(true); tx.onerror = ()=>res(false); }catch(e){ res(false); }
  }));
}
function imgGet(k){
  return imgDB().then(db=> !db ? null : new Promise(res=>{
    try{ const tx = db.transaction("img","readonly"); const q = tx.objectStore("img").get(k);
      q.onsuccess = ()=>res(q.result || null); q.onerror = ()=>res(null); }catch(e){ res(null); }
  }));
}
function imgDel(k){
  return imgDB().then(db=> !db ? false : new Promise(res=>{
    try{ const tx = db.transaction("img","readwrite"); tx.objectStore("img").delete(k);
      tx.oncomplete = ()=>res(true); tx.onerror = ()=>res(false); }catch(e){ res(false); }
  }));
}
function shrinkUrl(dataUrl, maxW){
  return new Promise(res=>{
    const im = new Image();
    im.onload = ()=>{
      const k = Math.min(1, maxW / im.naturalWidth);
      const w = Math.max(1, Math.round(im.naturalWidth*k)), h = Math.max(1, Math.round(im.naturalHeight*k));
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
      const cx = cv.getContext("2d");
      cx.fillStyle = "#fff"; cx.fillRect(0,0,w,h); cx.drawImage(im,0,0,w,h);
      res(encodeBudget(cv, 12000));
    };
    im.onerror = ()=>res(null);
    im.src = dataUrl;
  });
}

function shrink(file){
  return new Promise((resolve, reject)=>{
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = ()=>{
      const mk = maxW=>{
        const k = Math.min(1, maxW / im.naturalWidth);
        const w = Math.max(1, Math.round(im.naturalWidth*k)), h = Math.max(1, Math.round(im.naturalHeight*k));
        const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        const cx = cv.getContext("2d");
        cx.fillStyle = "#fff"; cx.fillRect(0,0,w,h); cx.drawImage(im,0,0,w,h);
        return cv;
      };
      const out = { full: encodeBudget(mk(1800), 900000), thumb: encodeBudget(mk(1600), 420000), mini: encodeBudget(mk(260), 12000) };
      URL.revokeObjectURL(url);
      resolve(out);
    };
    im.onerror = ()=>{ URL.revokeObjectURL(url); reject(new Error("图片读不出来")); };
    im.src = url;
  });
}

async function ocrImage(dataUrl, cfg){
  const apiUrl = normalizeApiUrl(cfg.url);
  const res = await fetch(apiUrl, {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+cfg.key},
    body: JSON.stringify({
      model: cfg.vision, temperature: 0,
      messages:[{ role:"user", content:[
        { type:"text", text: OCR_PROMPT },
        { type:"image_url", image_url:{ url: dataUrl } }
      ]}]
    })
  });
  if(!res.ok){
    const t = await res.text().catch(()=> "");
    throw new Error(explainApiFailure(res.status, apiUrl, apiErrorText(t)));
  }
  const data = await res.json();
  let txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  txt = txt.trim().replace(/^```[a-z]*\s*/i, "").replace(/```$/, "").trim();
  if(!txt) throw new Error("模型没返回内容");
  return txt.replace(/\s*\n+\s*/g, " ").trim();
}
function openExplain(id){
  const it = DB.items.find(x=>x.id===id);
  $("#exTitle").textContent = "讲讲这题";
  $("#exSub").innerHTML = `${secTitle(it.sec)} · 错因：${CM[it.cause].name}`;
  $("#exBody").innerHTML = `<div class="blk"><div class="v" style="color:#70767f">正在写…</div></div>`;
  $("#modalExplain").classList.remove("hide");
  const cfg = apiCfg();
  if(cfg.key && cfg.url && cfg.model) realExplain(it, cfg);
  else fallbackExplain(it);
}
function blocksOf(o){
  return `<div class="blk"><div class="k">错在哪</div><div class="v">${o.why}</div></div>
    <div class="blk"><div class="k">正确思路</div><div class="v">${o.how}</div></div>
    <div class="blk"><div class="k">要补什么</div><div class="v">${o.fix}</div></div>`;
}
function fallbackExplain(it){
  const s = secOf(it.sec);
  const d = it.demo || {
    why:`章节「${s ? s.title : "未归类"}」，错因「${CM[it.cause].name}」。`,
    how:`按「${s ? s.title : "本节"}」的课本例题步骤重做一遍。`,
    fix:`关键词：${(s && s.kw || []).slice(0,4).join("、") || "暂无"}。`
  };
  $("#exBody").innerHTML = blocksOf(d);
  $("#exNote").textContent = it.demo ? "示例文本，未经模型生成。" : "未接入模型，以上为规则提示。";
}
async function realExplain(it, cfg){
  const s = secOf(it.sec);
  const sys = "你是一位耐心的大学数学助教。用中文回答，分三段：错在哪、正确思路、要补什么。每段不超过两句话，不要客套。";
  const user = `教材：${DB.book.title}\n章节：${s?s.id+" "+s.title:"未归类"}\n学生打的错因：${CM[it.cause].name}\n题目：${markPlain(it.q)}\n\n请按三段输出，用「1.」「2.」「3.」开头。`;
  try{
    const apiUrl = normalizeApiUrl(cfg.url);
    const res = await fetch(apiUrl, {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+cfg.key},
      body: JSON.stringify({model:cfg.model, temperature:0.3, messages:[{role:"system",content:sys},{role:"user",content:user}]})
    });
    if(!res.ok){
      const t = await res.text().catch(()=> "");
      throw new Error(explainApiFailure(res.status, apiUrl, apiErrorText(t)));
    }
    const data = await res.json();
    const txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
    if(!txt) throw new Error("空回复");
    const parts = txt.split(/\n?\s*[123][\.、]\s*/).filter(Boolean);
    const o = { why:fmtQ(parts[0]||txt), how:fmtQ(parts[1]||""), fix:fmtQ(parts[2]||"") };
    $("#exBody").innerHTML = blocksOf(o);
    $("#exNote").textContent = `由 ${cfg.model} 生成。`;
  }catch(e){
    fallbackExplain(it);
    const m = String((e && e.message) || e);
    $("#exNote").textContent = /Failed to fetch|NetworkError|Load failed/i.test(m)
      ? "请求没到服务器：跨域被拦或地址错误。点右上「AI 设置 → 测试连接」看具体原因。"
      : m;
  }
}

/* ================= 导入目录 ================= */
function parseTOC(text){
  const lines = text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const chapters = [];
  let cur = null;
  const chRe = /^(第\s*[一二三四五六七八九十百\d]+\s*[章讲单元])\s*[:：]?\s*(.*)$/;
  const secRe = /^(\d+(?:\.\d+)+)\s*[:：]?\s*(.+)$/;
  lines.forEach(ln=>{
    const m1 = ln.match(chRe);
    if(m1){ cur = {no:m1[1].replace(/\s+/g,""), title:m1[2]||"", sections:[]}; chapters.push(cur); return; }
    const m2 = ln.match(secRe);
    if(m2){
      if(!cur){ cur = {no:"第1章", title:"未命名", sections:[]}; chapters.push(cur); }
      cur.sections.push({id:m2[1], title:m2[2].replace(/[.．…\s]+$/,""), kw:m2[2].split(/[、，,\s]+/).filter(w=>w.length>=2).slice(0,5)});
    }
  });
  return chapters.filter(c=>c.sections.length);
}

/* ---------- 把旧的内嵌图搬到 IndexedDB ---------- */
async function migrateImages(){
  const db = await imgDB();
  if(!db) return;
  let changed = 0;
  for(const it of DB.items){
    if(it.imgKey) continue;
    if(!it.img || it.img.indexOf("data:image") !== 0 || it.img.length < 15000) continue;
    const key = "img_" + it.id;
    if(await imgPut(key, it.img)){
      const mini = await shrinkUrl(it.img, 260);
      it.imgKey = key;
      if(mini) it.img = mini;
      changed++;
    }
  }
  if(changed){ save(); renderAll(); toast(`已把 ${changed} 张图移到浏览器数据库`); }
}

/* ---------- 备份：把 IDB 里的原图一起打包 ---------- */
async function buildBackup(){
  const out = { book: DB.book, items: [], notes: DB.notes, notesVer: DB.notesVer, custom: !!DB.custom };
  for(const it of DB.items){
    const copy = Object.assign({}, it);
    if(it.imgKey){
      const full = await imgGet(it.imgKey);
      if(full) copy.img = full;
    }
    delete copy.imgKey;
    out.items.push(copy);
  }
  return out;
}

/* ---------- 导出 PDF（走系统打印） ---------- */
async function buildPrint(){
  const host = $("#printArea");

  if(isExam()){
    const out = [];
    DB.book.chapters.forEach(ch=>{
      out.push(`<div class="p-title">${esc(ch.no)} ${esc(ch.title)}</div>`);
      ch.sections.forEach(s=>{
        const nt = DB.notes[s.id] || {};
        const cp = nt.concepts || [];
        const ex = nt.examples || [];
        if(!cp.length && !ex.length) return;
        out.push(`<div class="p-item"><div class="p-q">${esc(s.id)} ${esc(s.title)}</div>`);
        if(cp.length) out.push(`<div class="p-s">` + cp.map(x=>esc(x)).join("<br>") + `</div>`);
        ex.forEach(e=>{ out.push(`<div class="p-s">${esc(e.q)}　${esc(e.a || "")}</div>`); });
        out.push(`</div>`);
      });
    });
    host.innerHTML = `<div class="p-title">${esc(DB.book.title)} · 知识点</div>`
      + `<div class="p-meta">导出时间 ${new Date().toLocaleString("zh-CN")}</div>` + out.join("");
    return;
  }
  const items = [...DB.items].sort((a,b)=> String(a.sec).localeCompare(String(b.sec)));
  if(!items.length){
    host.innerHTML = `<div class="p-title">${esc(DB.book.title)} · 错题</div><div class="p-empty">还没有错题。</div>`;
    return;
  }
  const parts = [];
  for(const it of items){
    let src = it.img || "";
    if(it.imgKey){ const full = await imgGet(it.imgKey); if(full) src = full; }
    parts.push(`<div class="p-item"><div class="p-q">${fmtQ(it.q)}</div>`
      + `<div class="p-s">${esc(secTitle(it.sec))} · ${CM[it.cause].name}</div>`
      + (src ? `<img src="${src}" alt="">` : "") + `</div>`);
  }
  host.innerHTML = `<div class="p-title">${esc(DB.book.title)} · 错题（${items.length}）</div>`
    + `<div class="p-meta">导出时间 ${new Date().toLocaleString("zh-CN")}</div>` + parts.join("");
}

/* ================= 事件 ================= */
function goTab(name){
  tab = name;
  $$(".tabs button").forEach(b=>b.classList.toggle("on", b.dataset.tab===name));
  ["map","items","review","notes"].forEach(t=>$("#tab-"+t).classList.toggle("hide", t!==name));
  if(isExam()){
    const ch = DB.book.chapters.find(c=>c.no === curModule);
    const sec = curSec ? sections().find(x=>x.id === curSec) : null;
    $("#hdTitle").textContent = sec ? sec.title : (ch ? ch.title : packById(DB.bookId).name);
  }else{
    $("#hdTitle").textContent = name==="map"?"薄弱点":name==="items"?"错题":name==="notes"?"知识点":"复习";
  }
}
const QUOTA = 5000000;   // Chrome localStorage 实测约 5.05M 字符

function renderUsage(){
  let chars = 0;
  try{ chars = (localStorage.getItem(KEY) || "").length; }catch(e){}
  const mb = chars / 1048576;
  const pct = Math.min(100, Math.round(chars / QUOTA * 100));
  const col = pct > 80 ? "#b23a2f" : pct > 55 ? "#c4762f" : "#2f6f5e";
  $("#usage").innerHTML =
    `<div>本地已用 ${mb < 0.1 ? mb.toFixed(2) : mb.toFixed(1)} MB · 约 ${pct}%${pct > 80 ? " · 快满了，删几张旧图" : ""}</div>
     <div class="ubar"><i style="width:${pct}%;background:${col}"></i></div>`;
}

function renderAll(){ renderSidebar(); renderMap(); renderItems(); renderReview(); renderNotes(); if(!isExam()) renderUsage(); }

function bind(){
  $$(".tabs button").forEach(b=>b.addEventListener("click",()=>goTab(b.dataset.tab)));
  $$("[data-close]").forEach(b=>b.addEventListener("click", e=>e.target.closest(".mask").classList.add("hide")));
  $$(".mask").forEach(m=>m.addEventListener("click", e=>{ if(e.target===m) m.classList.add("hide"); }));

  $("#shelfList").addEventListener("click", e=>{
    const b = e.target.closest("[data-book]"); if(!b) return;
    openBook(b.dataset.book);
  });
  const openShelf = ()=>{
    if(openingTimer){ clearTimeout(openingTimer); openingTimer = null; }
    document.body.classList.remove("shelf-leaving");
    document.body.classList.add("shelf-open");
    renderShelf();
  };
  $("#btnShelf").addEventListener("click", openShelf);
  $("#btnRunTool").addEventListener("click", runTool);
  $("#vocabShow").addEventListener("click", vocabShowBack);
  $("#vocabCard").addEventListener("click", ()=>{ if(!VOCAB.shown) vocabShowBack(); });
  $("#vocabAct").addEventListener("click", e=>{
    const b = e.target.closest("[data-mark]"); if(!b) return;
    vocabMark(b.dataset.mark);
  });

  $("#modBar").addEventListener("click", e=>{
    const b = e.target.closest("[data-mod]"); if(!b) return;
    openModule(+b.dataset.mod);
  });
  $("#notesCard").addEventListener("click", e=>{
    const tb = e.target.closest("[data-tool]"); if(tb){ openTool(tb.dataset.tool); return; }
    const vb = e.target.closest("[data-vocab]"); if(vb){ openVocab(vb.dataset.vocab); return; }
    const vls = e.target.closest("[data-vlist]"); if(vls){ openVocabList(vls.dataset.vlist); return; }
    const b = e.target.closest("[data-back]"); if(!b) return;
    curSec = null; renderModBar(); renderNotes();
  });

  const closeToc = ()=> document.body.classList.remove("toc-open");
  $("#btnToc").addEventListener("click", ()=> document.body.classList.toggle("toc-open"));
  $("#tocMask").addEventListener("click", closeToc);

  $("#btnImport").addEventListener("click", ()=>{
    $("#tocText").value = DB.book.chapters.map(ch=>`${ch.no} ${ch.title}\n`+ch.sections.map(s=>`${s.id} ${s.title}`).join("\n")).join("\n");
    $("#modalImport").classList.remove("hide");
  });
  $("#btnParse").addEventListener("click", ()=>{
    const chs = parseTOC($("#tocText").value);
    if(!chs.length) return toast("没识别出章节，检查一下行首是不是“第X章”或“1.2”");
    DB = { book:{title:DB.book.title, chapters:chs}, items:[], custom:true };
    curSec=null; save(); $("#modalImport").classList.add("hide");
    renderAll(); toast(`换成新目录：${chs.length} 章 ${chs.flatMap(c=>c.sections).length} 节`);
  });

  let addCause = "unknown";

  function buildAddForm(){
    $("#addCauses").innerHTML = CAUSES.map(c=>
      `<button type="button" data-c="${c.k}" class="${addCause===c.k?"on":""}">${c.name}</button>`).join("");
    $$("#addCauses button").forEach(b=>b.addEventListener("click", ()=>{
      addCause = b.dataset.c;
      $$("#addCauses button").forEach(x=>x.classList.toggle("on", x.dataset.c===addCause));
    }));

    let opt = "";
    DB.book.chapters.forEach(ch=>{
      opt += `<optgroup label="${ch.no} ${ch.title}">` +
        ch.sections.map(sc=>`<option value="${sc.id}">${sc.id} ${sc.title}</option>`).join("") + `</optgroup>`;
    });
    $("#addSec").innerHTML = opt;
  }

  function classifyHint(){
    const q = qPlainText();
    const box = $("#addHint");
    if(!q){ box.className="hintbox hide"; box.textContent=""; renderAddNotes(); return; }
    const r = classify(q);
    if(r){
      const sc = secOf(r.id);
      $("#addSec").value = r.id;
      renderAddNotes();
      box.className = "hintbox";
      box.innerHTML = `已识别：<b>${sc.id} ${sc.title}</b><br>理由：${r.why}`;
    } else {
      box.className = "hintbox warn";
      box.textContent = "没判断出来。自己选一节，或者把题目写完整一点（带上 ∫、∂、lim 这类符号最好认）。";
      renderAddNotes();
    }
  }

  const setDropState = on=>{
    $("#dropZone").classList.toggle("on", on);
    $("#dropIdle").classList.toggle("hide", on);
    $("#dropOn").classList.toggle("hide", !on);
  };

  async function handleImage(file){
    if(!file) return;
    if(!/^image\//.test(file.type)) return toast("请选图片文件");
    const cut = await openCrop(file);
    if(!cut) return;
    let imgs;
    try{ imgs = await shrink(cut); }catch(e){ return toast("图片读不出来，换一张试试"); }
    pendingImg = imgs;
    setDropState(true);
    $("#imgPrev").src = imgs.thumb;
    const cfg = apiCfg();
    if(!(cfg.key && cfg.url && cfg.vision)){
      $("#imgSt").innerHTML = "<b>已存图</b>未填识图模型，文字需手填。";
      return;
    }
    $("#imgSt").innerHTML = '<span class="spin"></span>识别中…';
    try{
      const txt = await ocrImage(imgs.full, cfg);
      $("#addQ").innerHTML = renderMath(txt);
      $("#addQ").dispatchEvent(new Event("input"));
      $("#imgSt").innerHTML = "<b>已转文字</b>可修改后保存。";
    }catch(e){
      const m = String((e && e.message) || e);
      $("#imgSt").innerHTML = /Failed to fetch|NetworkError|Load failed/i.test(m)
        ? "<b>请求没到服务器</b>跨域被拦或地址错误。"
        : `<b>识别失败：${esc(m)}</b>`;
    }
  }

  $("#dropZone").addEventListener("click", e=>{ if(e.target.id !== "btnRetake") $("#filePick").click(); });
  $("#btnRetake").addEventListener("click", e=>{ e.stopPropagation(); $("#filePick").click(); });
  $("#filePick").addEventListener("change", e=>{ handleImage(e.target.files[0]); e.target.value = ""; });
  ["dragenter","dragover"].forEach(ev=>$("#dropZone").addEventListener(ev, e=>{ e.preventDefault(); $("#dropZone").classList.add("over"); }));
  ["dragleave","drop"].forEach(ev=>$("#dropZone").addEventListener(ev, e=>{ e.preventDefault(); $("#dropZone").classList.remove("over"); }));
  $("#dropZone").addEventListener("drop", e=>{ const f = e.dataTransfer.files[0]; if(f) handleImage(f); });
  document.addEventListener("paste", e=>{
    if($("#modalAdd").classList.contains("hide")) return;
    const it = [...(e.clipboardData ? e.clipboardData.items : [])].find(x=>x.type.indexOf("image/") === 0);
    if(it) handleImage(it.getAsFile());
  });

  $("#btnAdd").addEventListener("click", ()=>{
    addCause = "unknown";
    pendingImg = null;
    qClear();
    $("#imgPrev").removeAttribute("src");
    $("#imgSt").innerHTML = "";
    setDropState(false);
    buildAddForm(); classifyHint(); renderAddNotes();
    $("#modalAdd").classList.remove("hide");
    setTimeout(()=>$("#addQ").focus(), 30);
  });
  $("#addQ").addEventListener("input", classifyHint);
  /* ---- 数学键盘 ---- */
  const KB_ACTS = [
    ["frac", "分数"], ["sup", "上标"], ["sub", "下标"], ["sqrt", "根号"]
  ];
  const KB = [
    ["运算", ["∫","∬","∂","∑","∏","√","∞","→","≈","≠","≤","≥","±","×","÷"]],
    ["希腊", ["π","θ","α","β","γ","δ","ε","λ","μ","σ","φ","ω","Δ","Σ","Ω"]],
    ["函数", ["lim","ln","sin","cos","tan","arcsin","dx","dy","dt","e"]]
  ];
  $("#kb").innerHTML =
    `<div class="kb-label">结构</div><div class="kb-row">` +
    KB_ACTS.map(([a, label]) => `<button type="button" data-act="${a}">${label}</button>`).join("") +
    `</div>` +
    KB.map(([label, keys]) =>
      `<div class="kb-label">${label}</div><div class="kb-row">` +
      keys.map(k => `<button type="button" data-ins="${k}">${k}</button>`).join("") + `</div>`
    ).join("");

  const qEl = ()=> $("#addQ");
  const qText = ()=> serializeQ(qEl()).replace(/\u200b/g, "").trim();
  const qPlainText = ()=> markPlain(qText()).trim();
  function qClear(){ qEl().innerHTML = ""; }

  function insertRaw(html){
    const q = qEl(); q.focus();
    document.execCommand("insertHTML", false, html);
    q.dispatchEvent(new Event("input"));
  }
  function insertText(t){ insertRaw(esc(t)); }

  function focusNew(within){
    const q = qEl();
    const host = q.querySelector("[data-new]");
    if(!host) return;
    const target = within ? (host.querySelector(within) || host) : host;
    q.querySelectorAll("[data-new]").forEach(el=>el.removeAttribute("data-new"));
    const r = document.createRange();
    r.selectNodeContents(target);
    r.collapse(true);
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(r);
  }

  function caretOutOfScripts(){
    const sel = window.getSelection();
    if(!sel.rangeCount) return;
    let n = sel.anchorNode;
    const el = n && n.nodeType === 1 ? n : (n ? n.parentElement : null);
    const script = el && el.closest ? el.closest("sup,sub") : null;
    if(script){
      const r = document.createRange();
      r.setStartAfter(script); r.collapse(true);
      sel.removeAllRanges(); sel.addRange(r);
    }
  }

  function doAct(act){
    caretOutOfScripts();
    if(act === "frac"){
      insertRaw('<span class="frc" data-new="1"><span class="frc-n">\u200b</span><span class="frc-d">\u200b</span></span>');
      focusNew(".frc-n");
    } else if(act === "sup"){
      insertRaw('<sup data-new="1">\u200b</sup>');
      focusNew("");
    } else if(act === "sub"){
      insertRaw('<sub data-new="1">\u200b</sub>');
      focusNew("");
    } else if(act === "sqrt"){
      insertRaw('√(<span data-new="1">\u200b</span>)');
      focusNew("");
    }
  }

  $("#kbToggle").addEventListener("click", ()=>{
    const kb = $("#kb");
    kb.classList.toggle("hide");
    $("#kbToggle").textContent = kb.classList.contains("hide") ? "数学键盘" : "收起键盘";
  });

  $("#kb").addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    if(b.dataset.act) doAct(b.dataset.act);
    else if(b.dataset.ins !== undefined) insertText(b.dataset.ins);
  });

  // 分数里按 Tab 从分子跳到分母
  $("#addQ").addEventListener("keydown", e=>{
    if(e.key !== "Tab") return;
    const host = e.target.closest ? e.target.closest(".frc") : null;
    if(!host) return;
    const num = host.querySelector(".frc-n");
    if(num && num.contains(e.target) ){
      e.preventDefault();
      const d = host.querySelector(".frc-d");
      if(d){
        const r = document.createRange(); r.selectNodeContents(d); r.collapse(true);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      }
    }
  });

  /* ---- 裁剪 ---- */
  function openCrop(file){
    return new Promise(resolve=>{
      const url = URL.createObjectURL(file);
      const img = $("#cropImg");
      const wrap = $("#cropWrap");
      const box = $("#cropBox");
      img.src = url;
      box.classList.add("hide");
      let rect = null, start = null, done = false;

      const finish = val=>{
        if(done) return;
        done = true;
        $("#modalCrop").classList.add("hide");
        URL.revokeObjectURL(url);
        resolve(val);
      };

      const clamp = (v, max)=> Math.min(Math.max(v, 0), max);
      const at = e=>{
        const r = wrap.getBoundingClientRect();
        const p = e.touches ? e.touches[0] : e;
        return { x: clamp(p.clientX - r.left, r.width), y: clamp(p.clientY - r.top, r.height) };
      };
      const draw = ()=>{
        if(!rect){ box.classList.add("hide"); return; }
        box.classList.remove("hide");
        box.style.left = rect.x + "px";
        box.style.top = rect.y + "px";
        box.style.width = rect.w + "px";
        box.style.height = rect.h + "px";
      };

      const down = e=>{ e.preventDefault(); const p = at(e); start = p; rect = {x:p.x, y:p.y, w:0, h:0}; draw(); };
      const move = e=>{
        if(!start) return; e.preventDefault();
        const p = at(e);
        rect = { x: Math.min(start.x, p.x), y: Math.min(start.y, p.y),
                 w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) };
        draw();
      };
      const up = ()=>{
        start = null;
        if(rect && (rect.w < 16 || rect.h < 16)){ rect = null; draw(); }
      };

      wrap.onpointerdown = down;
      wrap.onpointermove = move;
      wrap.onpointerup = up;
      wrap.onpointercancel = up;

      $("#cropAll").onclick = ()=>{ rect = null; draw(); finish(file); };
      $("#cropCancel").onclick = ()=> finish(null);
      $("#modalCrop").querySelector("[data-close]").onclick = ()=> finish(null);

      $("#cropOk").onclick = ()=>{
        const dw = img.clientWidth, dh = img.clientHeight;
        const r = rect || { x:0, y:0, w:dw, h:dh };
        if(r.w < 8 || r.h < 8) return finish(file);
        const sx = img.naturalWidth / dw, sy = img.naturalHeight / dh;
        const cv = document.createElement("canvas");
        cv.width = Math.round(r.w * sx);
        cv.height = Math.round(r.h * sy);
        cv.getContext("2d").drawImage(
          img,
          Math.round(r.x * sx), Math.round(r.y * sy), Math.round(r.w * sx), Math.round(r.h * sy),
          0, 0, cv.width, cv.height
        );
        cv.toBlob(b=> finish(b || file), "image/jpeg", 0.95);
      };

      $("#modalCrop").classList.remove("hide");
    });
  }

  $("#btnSaveItem").addEventListener("click", async ()=>{
    const q = qText();
    if(!qPlainText() && !pendingImg) return toast("写个题目，或者传一张照片");
    const sec = $("#addSec").value || sections()[0].id;
    const id = "u"+Date.now();
    const item = { id, sec, cause:addCause, due:0, lapses:0,
                   q: q || "（图片题目，文字待补）", img:null, imgKey:null };
    if(pendingImg){
      const key = "img_"+id;
      if(await imgPut(key, pendingImg.thumb)){ item.imgKey = key; item.img = pendingImg.mini; }
      else { item.img = pendingImg.thumb; }   // IndexedDB 不可用就退回整张存本地
    }
    DB.items.unshift(item);
    if(!save()) toast("文本空间满了：先把旧错题删几条");
    pendingImg = null;
    renderAll(); $("#modalAdd").classList.add("hide");
    toast(`已记下：${secTitle(sec)}`);
  });

  document.addEventListener("click", e=>{
    const d = document.querySelector(".help");
    if(d && d.open && !d.contains(e.target)) d.open = false;
  });

  $("#notesCard").addEventListener("click", e=>{
    const g = e.target.closest("[data-goto]");
    if(g){ curSec = g.dataset.goto; renderSidebar(); renderNotes(); return; }
    const ed = e.target.closest("[data-edit]");
    if(ed) openNotesEditor(ed.dataset.sec || ed.dataset.edit);
  });

  $("#addNotes").addEventListener("click", e=>{
    const m = e.target.closest("[data-more]"); if(!m) return;
    $("#modalAdd").classList.add("hide");
    curSec = m.dataset.more; renderSidebar(); goTab("notes"); renderNotes();
  });

  $("#btnSaveNotes").addEventListener("click", ()=>{
    const id = $("#modalNotes").dataset.sec;
    const lines = t => t.split("\n").map(x=>x.trim()).filter(Boolean);
    DB.notes = DB.notes || {};
    DB.notes[id] = {
      concepts: lines($("#ntPoints").value),
      types: lines($("#ntTypes").value).map(l=>{
        const p = l.split("|||").map(x=>x.trim());
        return p[1] ? { t: p[0], how: p.slice(1).join(" ") } : { t: l, how: "" };
      }).filter(x=>x.t),
      examples: lines($("#ntExamples").value).map(l=>{
        const p = l.split("|||").map(x=>x.trim());
        return { q: p[0] || "", a: p[1] || "", analysis: p[2] || "" };
      }).filter(e=>e.q)
    };
    DB.notes[id].edited = true;
    if(!save()) toast("本地空间满了");
    $("#modalNotes").classList.add("hide");
    renderNotes(); renderAddNotes(); toast("已保存");
  });

  $("#addSec").addEventListener("change", renderAddNotes);

  $("#btnBackup").addEventListener("click", async ()=>{
    const data = await buildBackup();
    const blob = new Blob([JSON.stringify(data)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "错题本备份-" + new Date().toISOString().slice(0,10) + ".json";
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
    DB.lastBackup = Date.now(); save();
    toast("备份已下载（含图片）");
  });

  $("#btnRestore").addEventListener("click", ()=>$("#fileRestore").click());
  $("#fileRestore").addEventListener("change", ev=>{
    const f = ev.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = async ()=>{
      try{
        const o = JSON.parse(r.result);
        if(!o || !Array.isArray(o.items)) throw new Error("格式不对");
        const items = [];
        for(const it of o.items){
          const copy = Object.assign({}, it);
          if(copy.img && String(copy.img).indexOf("data:image") === 0){
            const key = "img_" + copy.id + "_" + Math.random().toString(36).slice(2,7);
            if(await imgPut(key, copy.img)){
              const mini = await shrinkUrl(copy.img, 260);
              copy.imgKey = key;
              if(mini) copy.img = mini;
            }
          }
          items.push(copy);
        }
        DB = { book: o.book || DB.book, items, notes: o.notes || DB.notes,
               notesVer: o.notesVer || 3, custom: !!o.custom };
        save(); renderAll();
        toast(`已恢复 ${items.length} 道错题`);
      }catch(e){ toast("这个文件读不出来"); }
      ev.target.value = "";
    };
    r.readAsText(f);
  });

  $("#btnPdf").addEventListener("click", async ()=>{
    await buildPrint();
    setTimeout(()=>window.print(), 120);
  });

  $("#btnApi").addEventListener("click", ()=>{
    const c = apiCfg();
    $("#apiBase").value = c.url || "";
    $("#apiModel").value = c.model || "";
    $("#apiVision").value = c.vision || "";
    $("#apiKey").value = c.key || "";
    const box = $("#apiTest");
    box.className = "apitest";
    box.textContent = c.url ? "将调用：" + c.url : "只填域名也可以，路径会自动补全。";
    $("#modalApi").classList.remove("hide");
  });

  const PROV_LABEL = [
    ["api.deepseek.com", "DeepSeek"],
    ["open.bigmodel.cn", "智谱"],
    ["dashscope.aliyuncs.com", "通义"],
    ["api.moonshot.cn", "Moonshot"],
    ["api.siliconflow.cn", "硅基流动"],
    ["api.openai.com", "OpenAI"]
  ];
  $("#provRow").innerHTML = PROV_LABEL.map(([h, n])=>`<button type="button" data-prov="${h}">${n}</button>`).join("");
  $("#provRow").addEventListener("click", e=>{
    const b = e.target.closest("button[data-prov]"); if(!b) return;
    const host = b.dataset.prov, p = PROVIDERS[host];
    $("#apiBase").value = "https://" + host;
    $("#apiModel").value = p.model;
    $("#apiVision").value = p.vision;
    delete $("#apiModel").dataset.edited;
    delete $("#apiVision").dataset.edited;
    $("#apiTest").className = "apitest";
    $("#apiTest").textContent = "将调用：https://" + host + p.path + (p.vision ? "" : "");
    [...$("#provRow").children].forEach(x=>x.classList.toggle("on", x === b));
  });

  // 从接口拉取该账号可用的模型，避免猜模型名
  $("#btnModels").addEventListener("click", async ()=>{
    const url = normalizeApiUrl($("#apiBase").value);
    const key = $("#apiKey").value.trim();
    const hint = $("#modelHint"), list = $("#modelList");
    if(!url || !key){ hint.textContent = "先填地址和 key"; return; }
    const modelsUrl = url.replace(/\/chat\/completions$/, "/models");
    hint.textContent = "正在拉取…";
    list.classList.add("hide");
    try{
      const res = await fetch(modelsUrl, { headers:{ "Authorization":"Bearer " + key } });
      if(!res.ok){
        const t = await res.text().catch(()=> "");
        hint.textContent = explainApiFailure(res.status, modelsUrl, apiErrorText(t));
        return;
      }
      const d = await res.json();
      const all = (d.data || d.models || []).map(m => m.id || m.name || m.model).filter(Boolean);
      const skip = /embedding|rerank|tts|asr|speech|audio|video|image|ocr|livetranslate|realtime|wanx|comfy/i;
      const chat = all.filter(id => !skip.test(id));
      const show = (chat.length ? chat : all).slice(0, 60);
      hint.textContent = "共 " + all.length + " 个，可用作讲解的 " + chat.length + " 个";
      if(!show.length){ list.innerHTML = '<div class="empty">这家接口没有返回模型列表。</div>'; list.classList.remove("hide"); return; }
      list.innerHTML = show.map(id=>`<button type="button" data-m="${id}">${id}</button>`).join("");
      list.classList.remove("hide");
      list.scrollTop = 0;
    }catch(e){
      hint.textContent = /Failed to fetch|NetworkError|Load failed/i.test(String(e && e.message))
        ? "请求没到服务器：跨域被拦或地址错。"
        : "拉取失败：" + ((e && e.message) || e);
    }
  });

  $("#modelList").addEventListener("click", e=>{
    const b = e.target.closest("button[data-m]"); if(!b) return;
    $("#apiModel").value = b.dataset.m;
    $("#apiModel").dataset.edited = "1";
    [...$("#modelList").children].forEach(x=>x.classList.toggle("on", x === b));
    $("#modelHint").textContent = "已选 " + b.dataset.m;
  });

  $("#apiBase").addEventListener("input", ()=>{
    const norm = normalizeApiUrl($("#apiBase").value);
    let host = "";
    try{ host = new URL(norm).hostname.toLowerCase(); }catch(e){}
    const preset = PROVIDERS[host];
    if(preset){
      if(!$("#apiModel").value.trim() && !$("#apiModel").dataset.edited) $("#apiModel").value = preset.model;
      if(!$("#apiVision").value.trim() && !$("#apiVision").dataset.edited) $("#apiVision").value = preset.vision;
    }
    const box = $("#apiTest");
    box.className = "apitest";
    box.textContent = norm ? "将调用：" + norm : "";
  });
  ["apiModel","apiVision"].forEach(id=>{
    $("#"+id).addEventListener("input", e=>{ e.target.dataset.edited = "1"; });
  });
  $("#btnTest").addEventListener("click", async ()=>{
    const c = { url:$("#apiBase").value.trim(), model:$("#apiModel").value.trim(),
                vision:$("#apiVision").value.trim(), key:$("#apiKey").value.trim() };
    const box = $("#apiTest");
    if(!c.model || !c.key){
      box.className = "apitest bad";
      box.textContent = "模型名和 key 两样都要填。地址可以只写域名。";
      return;
    }
    const url = normalizeApiUrl(c.url);
    if(!url){
      box.className = "apitest bad";
      box.textContent = "地址还空着。";
      return;
    }
    box.className = "apitest";
    box.innerHTML = '<span class="spin"></span>正在真的发一次请求…';
    const t0 = performance.now();
    let res;
    try{
      res = await fetch(url, {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+c.key},
        body: JSON.stringify({ model:c.model, max_tokens:8, temperature:0,
                               messages:[{role:"user", content:"只回复两个字：可以"}] })
      });
      // 限流时自动等一会儿重试一次
      if(res.status === 429){
        for(let left = 6; left > 0; left--){
          box.innerHTML = '<span class="spin"></span>被限流，' + left + ' 秒后自动重试一次…';
          await new Promise(r=>setTimeout(r, 1000));
        }
        res = await fetch(url, {
          method:"POST",
          headers:{"Content-Type":"application/json","Authorization":"Bearer "+c.key},
          body: JSON.stringify({ model:c.model, max_tokens:8, temperature:0,
                                 messages:[{role:"user", content:"只回复两个字：可以"}] })
        });
      }
      const ms = Math.round(performance.now() - t0);
      if(!res.ok){
        const t = await res.text().catch(()=> "");
        box.className = "apitest bad";
        box.textContent = explainApiFailure(res.status, url, apiErrorText(t)) + "\n调用地址：" + url;
        return;
      }
      const d = await res.json();
      const txt = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || "";
      box.className = "apitest ok";
      box.textContent = "通了 · " + ms + "ms · " + c.model + " 回复：" + String(txt).slice(0,24) + "\n调用地址：" + url;
    }catch(e){
      const m = String((e && e.message) || e);
      box.className = "apitest bad";
      box.textContent = /Failed to fetch|NetworkError|Load failed|Network request failed/i.test(m)
        ? "请求没到服务器。两种可能：① 这家不允许网页直连（OpenAI 就是，需要换中转地址）；② 域名写错。\n调用地址：" + url
        : "调用失败：" + m + "\n调用地址：" + url;
    }
  });

  $("#btnSaveApi").addEventListener("click", ()=>{
    const c = { url:$("#apiBase").value.trim(), model:$("#apiModel").value.trim(),
                vision:$("#apiVision").value.trim(), key:$("#apiKey").value.trim() };
    c.url = normalizeApiUrl(c.url);
    if(!c.url || !c.model || !c.key){ try{localStorage.removeItem(APIK);}catch(e){} toast("已清空"); }
    else { try{localStorage.setItem(APIK, JSON.stringify(c));}catch(e){} toast("已保存"); }
    $("#modalApi").classList.add("hide");
  });

  $("#btnReset").addEventListener("click", ()=>{
    if(!DB.items.length) return toast("还没有错题");
    if(!confirm("清空全部错题？教材和知识点不动。")) return;
    DB.items = []; curSec = null; save(); renderAll(); toast("已清空");
  });
}

(function init(){
  load();
  if(!DB.items.length && !localStorage.getItem(KEY+".seeded")){
    seed(); try{localStorage.setItem(KEY+".seeded","1");}catch(e){}
  }
  bind(); renderModBar(); goTab(isExam() ? "notes" : "map"); renderAll(); renderShelf();

  // 开场：8 秒，5.4 秒起界面从雾里浮出
  const intro = $("#intro");
  let introSettled = false;
  const afterIntro = ()=>{
    if(introSettled) return;          // 只放行一次，避免跳过开场后定时器再把书架弹出来
    introSettled = true;
    document.body.classList.add("shelf-open");
    renderShelf();
  };
  if(intro){
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduce){ intro.remove(); afterIntro(); }
    else{
      document.body.classList.add("introing");
      const clear = ()=> document.body.classList.remove("introing");
      const drop = ()=>{ clear(); intro.classList.add("gone"); setTimeout(()=>intro.remove(), 60); };
      setTimeout(clear, 5400);
      setTimeout(drop, 8200);
      setTimeout(afterIntro, 8200);
      intro.addEventListener("click", ()=>{ drop(); afterIntro(); });
    }
  }
  migrateImages();

  const WEEK = 7 * 864e5;
  if(DB.items.length && (!DB.lastBackup || Date.now() - DB.lastBackup > WEEK)){
    setTimeout(()=>toast("上次备份超过 7 天，说明里可以下载备份"), 2600);
  }
})();
