(() => {
"use strict";
const U = window.CONTENT.units, G = window.CONTENT.glossary, Q = window.IELTS;
const TOTAL = U.length, PASS = 75;
const LV = {
  A1:{name:"Pemula",ielts:"Pondasi",c:"--a1"}, A2:{name:"Dasar",ielts:"Pondasi",c:"--a2"},
  B1:{name:"Menengah",ielts:"Target band 5–5.5",c:"--b1"}, B2:{name:"Menengah Atas",ielts:"Target band 6–6.5",c:"--b2"},
  C1:{name:"Mahir",ielts:"Target band 7+",c:"--c1"}
};
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- state ---------- */
const KEY = "tangga-grammar-v2";
const blank = () => ({done:{}, best:{}, typed:{}, xp:0, streak:0, last:"", free:false, theme:"", lastUnit:1});
let S = blank();
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.done) S = Object.assign(blank(), s); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
(function streak(){
  const today = new Date().toDateString();
  if (S.last === today) return;
  const yest = new Date(Date.now() - 864e5).toDateString();
  S.streak = S.last === yest ? S.streak + 1 : 1; S.last = today; save();
})();
const isDone = n => !!S.done[n];
const isOpen = n => S.free || n === 1 || isDone(n - 1) || isDone(n);
const doneCount = () => Object.keys(S.done).length;
const lvVar = l => `var(${LV[l].c})`;

function toast(msg){ const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove("show"), 2600); }
function applyTheme(){ if (S.theme) document.documentElement.dataset.theme = S.theme; else delete document.documentElement.dataset.theme; }
applyTheme();

/* ---------- sidebar ---------- */
function sidebar(filter = ""){
  const f = filter.trim().toLowerCase(); let html = "", band = "";
  U.forEach(u => {
    if (f && !(u.title.toLowerCase().includes(f) || String(u.n) === f)) return;
    if (u.level !== band) {
      band = u.level; const c = U.filter(x => x.level === band), d = c.filter(x => isDone(x.n)).length;
      html += `<div class="band" style="--lv:${lvVar(band)}">${band} · ${LV[band].name}<small>${d}/${c.length}</small></div>`;
    }
    const cls = isDone(u.n) ? "done" : isOpen(u.n) ? "open" : "locked";
    const on = location.hash === "#unit-" + u.n ? " on" : "";
    html += `<a class="u ${cls}${on}" style="--lv:${lvVar(u.level)}" href="#unit-${u.n}"><span class="n">${isDone(u.n) ? "✓" : cls === "locked" ? "🔒" : u.n}</span><span>${esc(u.title)}</span></a>`;
  });
  $("#unitList").innerHTML = html || `<p class="muted" style="padding:8px">Tidak ada unit yang cocok.</p>`;
}
function stats(){ $("#tDone").textContent = doneCount(); $("#tXp").textContent = S.xp; $("#tStreak").textContent = S.streak; }
function setDrawer(open){ $("#sidebar").classList.toggle("open", open); $("#scrim").hidden = !open; $("#menuBtn").setAttribute("aria-expanded", open); }

/* ---------- views ---------- */
function home(){
  const next = U.find(u => !isDone(u.n) && isOpen(u.n)) || U[TOTAL - 1];
  const pct = Math.round(doneCount() / TOTAL * 100);
  let rungs = "";
  Object.keys(LV).forEach(l => {
    const us = U.filter(u => u.level === l), d = us.filter(u => isDone(u.n)).length;
    rungs += `<div class="rung" style="--lv:${lvVar(l)}"><div class="rung-top"><h3>Level ${l} · ${LV[l].name}</h3><span class="ielts-tag">IELTS: ${LV[l].ielts} · ${d}/${us.length} unit</span></div>
      <div class="chips">${us.map(u => `<a class="chip ${isDone(u.n) ? "done" : isOpen(u.n) ? "open" : ""}" href="#unit-${u.n}" title="${esc(u.title)}">${u.n}</a>`).join("")}</div>
      <div class="bar"><i style="width:${d / us.length * 100}%"></i></div></div>`;
  });
  return `<div class="wrap">
  <section class="hero"><div class="eyebrow">Grammar A1 → C1 untuk IELTS</div>
    <h1>${doneCount() ? "Lanjutkan dari Unit " + next.n : "Mulai dari anak tangga pertama"}</h1>
    <p>Satu unit berisi penjelasan, tabel, flashcard, latihan menulis, dan kuis. Lulus kuis (minimal ${PASS}%) untuk membuka unit berikutnya.</p>
    <div class="row"><a class="btn" href="#unit-${next.n}">${doneCount() ? "Lanjut" : "Mulai"}: Unit ${next.n} · ${esc(next.title)}</a><a class="btn ghost" href="#glosarium">Pelajari istilah dulu</a></div>
  </section>
  <div class="meter"><div><b>${doneCount()}/${TOTAL}</b><span>unit selesai</span></div><div><b>${pct}%</b><span>progres</span></div><div><b>${S.xp}</b><span>XP</span></div><div><b>${S.streak}</b><span>hari berturut-turut</span></div></div>
  <h2>Tangga level</h2><div class="ladder">${rungs}</div>
  <div class="cards2"><a href="#kuis"><b>Mode Kuis</b><span>10 soal acak dari unit yang sudah kamu buka, untuk mengulang materi.</span></a>
  <a href="#glosarium"><b>Glosarium</b><span>${G.length} istilah grammar (noun, clause, gerund…) dengan contoh.</span></a></div></div>`;
}

function explainHTML(lines){
  return lines.map(p => /:$/.test(p) && p.length < 60 ? `<p class="head">${esc(p)}</p>` : `<p>${esc(p)}</p>`).join("");
}
const norm = s => " " + String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[“”]/g, '"')
  .replace(/\bcan't\b/g, "cannot").replace(/\bwon't\b/g, "will not").replace(/n't\b/g, " not")
  .replace(/'d better\b/g, " had better").replace(/'s\b/g, " is").replace(/'m\b/g, " am").replace(/'re\b/g, " are").replace(/'ve\b/g, " have").replace(/'ll\b/g, " will").replace(/'d\b/g, " would")
  .replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim() + " ";

function unit(n){
  const u = U.find(x => x.n === n); if (!u) return notFound();
  const lv = lvVar(u.level);
  if (!isOpen(n)) {
    const need = U.find(x => !isDone(x.n) && isOpen(x.n));
    return `<div class="wrap" style="--lv:${lv}"><div class="sheet locked-box"><div class="eyebrow">Unit ${n} · Level ${u.level}</div><h1>${esc(u.title)}</h1>
      <p class="muted" style="margin-inline:auto">Unit ini masih terkunci. Selesaikan kuis Unit ${n - 1} dulu dengan skor minimal ${PASS}%.</p>
      <div class="row" style="justify-content:center"><a class="btn" href="#unit-${need ? need.n : 1}">Ke Unit ${need ? need.n : 1}</a><a class="btn ghost" href="#pengaturan">Buka semua unit</a></div></div></div>`;
  }
  S.lastUnit = n; save();
  const iq = Q[n] || ["", []];
  const tables = u.tables.map(t => `<div class="tbl"><table><thead><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${t.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`).join("");
  const cards = u.cards.map((c, i) => `<button type="button" class="fc" data-i="${i}" aria-label="Kartu ${i + 1}: ${esc(c.en)}. Ketuk untuk terjemahan."><div class="fc-in"><div class="fc-f"><small>English</small><p>${esc(c.en)}</p><small>ketuk untuk terjemahan</small></div><div class="fc-b"><small>Indonesia</small><p>${esc(c.id)}</p><small>ketuk untuk kembali</small></div></div></button>`).join("");
  const typed = u.ex.map((e, i) => {
    const k = n + "-" + i, prev = S.typed[k];
    return `<div class="q" data-k="${k}" data-i="${i}"><div class="qt"><span class="qn">${i + 1}</span>${esc(e.q)}</div>
    <div class="typed"><label class="sr" for="t-${k}">Jawaban soal ${i + 1}</label><input id="t-${k}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Isi bagian kosong atau tulis kalimat lengkap" value="${prev ? esc(e.a) : ""}" class="${prev ? "right" : ""}">
    <button type="button" class="btn small chk">Periksa</button><button type="button" class="btn small ghost show">Lihat jawaban</button></div><div class="fb ${prev ? "ok" : ""}">${prev ? "Benar." : ""}</div></div>`;
  }).join("");
  const mcq = iq[1].map((q, i) => `<div class="q mc" data-i="${i}"><div class="qt"><span class="qn">${i + 1}</span>${esc(q[0])}</div><div class="opts">${q[1].map((o, j) => `<button type="button" class="opt" data-j="${j}">${esc(o)}</button>`).join("")}</div><div class="why" hidden></div></div>`).join("");
  const prev = n > 1 ? `<a class="btn ghost" href="#unit-${n - 1}">← Unit ${n - 1}</a>` : `<span></span>`;
  const next = n < TOTAL ? (isOpen(n + 1) ? `<a class="btn ghost" href="#unit-${n + 1}">Unit ${n + 1} →</a>` : `<span class="btn ghost" aria-disabled="true" style="opacity:.5">🔒 Unit ${n + 1}</span>`) : `<span></span>`;
  return `<div class="wrap" style="--lv:${lv}">
  <div class="unit-head"><div class="eyebrow">Unit ${n} dari ${TOTAL} · Level ${u.level} ${LV[u.level].name}</div>${isDone(n) ? `<span class="eyebrow" style="color:var(--good)">✓ Selesai · skor terbaik ${S.best[n]}%</span>` : ""}</div>
  <h1>${esc(u.title)}</h1>
  <nav class="jump" aria-label="Bagian unit"><a href="#s-exp">Penjelasan</a><a href="#s-tbl">Tabel</a><a href="#s-fc">Flashcard</a><a href="#s-ex">Latihan</a><a href="#s-quiz">Kuis</a></nav>
  <section class="sheet" id="s-exp"><h2>Penjelasan</h2><div class="explain">${explainHTML(u.explain)}</div>
    ${u.tip ? `<div class="tip"><b>Tips:</b> ${esc(u.tip)}</div>` : ""}</section>
  ${iq[0] ? `<section class="sheet ielts"><b>Fokus IELTS:</b> ${esc(iq[0])}</section>` : ""}
  ${tables ? `<section class="sheet" id="s-tbl"><h2>Tabel referensi</h2>${tables}</section>` : ""}
  ${cards ? `<section class="sheet" id="s-fc"><h2>Flashcard contoh kalimat</h2><p class="muted">Baca kalimat Inggrisnya, tebak artinya, lalu ketuk kartu.</p><div class="fc-grid">${cards}</div></section>` : ""}
  <section class="sheet" id="s-ex"><h2>Latihan menulis</h2><p class="muted">Isi bagian yang kosong (atau tulis kalimat lengkap), lalu tekan Enter. Huruf besar/kecil dan tanda baca tidak dihitung, dan bentuk singkat seperti <i>isn't</i> dianggap sama dengan <i>is not</i>.</p>${typed}</section>
  <section class="sheet" id="s-quiz"><h2>Kuis pengecekan</h2><p class="muted">${iq[1].length} soal. Skor minimal ${PASS}% untuk menyelesaikan unit ini${n < TOTAL ? " dan membuka Unit " + (n + 1) : ""}.</p><div id="mcq">${mcq}</div><div id="res"></div></section>
  <div class="pager">${prev}${next}</div></div>`;
}

function bindUnit(n){
  const u = U.find(x => x.n === n); if (!u || !isOpen(n)) return;
  document.querySelectorAll(".fc").forEach(b => b.onclick = () => b.classList.toggle("flip"));
  document.querySelectorAll("#s-ex .q").forEach(q => {
    const i = +q.dataset.i, k = q.dataset.k, inp = q.querySelector("input"), fb = q.querySelector(".fb"), ans = u.ex[i].a;
    const check = () => {
      if (!inp.value.trim()) { fb.className = "fb no"; fb.textContent = "Tulis jawabanmu dulu."; return; }
      const filled = u.ex[i].q.replace(/\s*\([^)]*\)/g, "").replace(/_{2,}/, inp.value);
      const alts = ans.split(" / ").map(norm), blankQ = /_{2,}/.test(u.ex[i].q);
      const ok = alts.includes(norm(inp.value)) || (blankQ && alts.includes(norm(filled)));
      inp.className = ok ? "right" : "wrong";
      fb.className = "fb " + (ok ? "ok" : "no");
      fb.textContent = ok ? "Benar." : "Belum tepat. Cek lagi bentuk kata kerjanya, atau tekan Lihat jawaban.";
      if (ok && !S.typed[k]) { S.typed[k] = 1; S.xp += 10; save(); stats(); toast("+10 XP"); }
    };
    q.querySelector(".chk").onclick = check;
    inp.onkeydown = e => { if (e.key === "Enter") check(); };
    q.querySelector(".show").onclick = () => { fb.className = "fb"; fb.innerHTML = "Jawaban: <b>" + esc(ans) + "</b>"; };
  });
  const qs = (Q[n] || ["", []])[1], picks = Array(qs.length).fill(null);
  document.querySelectorAll("#mcq .mc").forEach(box => {
    const i = +box.dataset.i, q = qs[i];
    box.querySelectorAll(".opt").forEach(b => b.onclick = () => {
      if (picks[i] !== null) return; const j = +b.dataset.j; picks[i] = j;
      box.querySelectorAll(".opt").forEach((o, k) => { o.disabled = true; if (k === q[2]) o.classList.add("right"); else if (k === j) o.classList.add("wrong"); });
      const w = box.querySelector(".why"); w.hidden = false; w.textContent = (j === q[2] ? "Benar. " : "Kurang tepat. ") + q[3];
      if (picks.every(p => p !== null)) finish(n, qs, picks);
    });
  });
}

function finish(n, qs, picks){
  const right = picks.filter((p, i) => p === qs[i][2]).length, sc = Math.round(right / qs.length * 100), ok = sc >= PASS;
  const first = ok && !isDone(n);
  S.best[n] = Math.max(S.best[n] || 0, sc); S.xp += right * 5;
  if (first) { S.done[n] = 1; S.xp += 50; }
  save(); stats(); sidebar($("#search").value);
  const last = n === TOTAL;
  $("#res").innerHTML = `<div class="result ${ok ? "pass" : "fail"}"><div><strong>Skor ${sc}% (${right}/${qs.length})</strong>
    ${ok ? (last ? "Kamu sudah menyelesaikan seluruh tangga. Saatnya latihan menulis esai IELTS dengan struktur-struktur ini." : first ? `Unit selesai, +50 XP. Unit ${n + 1} sekarang terbuka.` : "Lulus lagi. Bagus untuk mengulang.") : `Butuh minimal ${PASS}%. Baca lagi penjelasannya, lalu coba ulang.`}</div>
    <div class="row"><button class="btn ghost" type="button" id="retry">Ulangi kuis</button>${ok && !last ? `<a class="btn" href="#unit-${n + 1}">Lanjut ke Unit ${n + 1}</a>` : ""}</div></div>`;
  $("#retry").onclick = () => { render(); location.hash = "#unit-" + n; setTimeout(() => $("#s-quiz").scrollIntoView(), 30); };
  if (first) toast(`Unit ${n} selesai! +50 XP`);
}

function glossary(){
  return `<div class="wrap"><div class="eyebrow">Glosarium</div><h1>Istilah grammar</h1><p class="muted">Kenali istilah yang sering muncul di materi. Ketuk istilah untuk membuka penjelasannya.</p>
  <label class="search"><span class="sr">Cari istilah</span><input id="gsearch" type="search" placeholder="Cari istilah, mis. gerund"></label>
  <div class="gl" id="gl">${G.map(g => `<details data-t="${esc((g.term + " " + g.def).toLowerCase())}"><summary><span class="sym">${esc(g.sym)}</span>${esc(g.term)}</summary><p style="margin-top:10px">${esc(g.def)}</p>${Object.entries(g.secs).map(([h, li]) => `<h4>${esc(h.replace(/^[^\p{L}]+/u, ""))}</h4><ul>${li.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`).join("")}</details>`).join("")}</div></div>`;
}

let QZ = null;
function quiz(){
  const levels = Object.keys(LV);
  return `<div class="wrap"><div class="eyebrow">Mode kuis</div><h1>Ulang materi</h1><p class="muted">10 soal pilihan ganda acak. Soal hanya diambil dari unit yang sudah terbuka.</p>
  <div class="sheet"><h3>Ambil soal dari</h3><div class="row" id="qsrc"><button class="btn small" type="button" data-src="all">Semua unit terbuka</button><button class="btn small ghost" type="button" data-src="done">Unit yang sudah selesai</button>${levels.map(l => `<button class="btn small ghost" type="button" data-src="${l}">Level ${l}</button>`).join("")}</div></div>
  <div id="qbox"></div></div>`;
}
function startQuiz(src){
  let pool = [];
  U.forEach(u => { if (!isOpen(u.n)) return; if (src === "done" && !isDone(u.n)) return; if (LV[src] && u.level !== src) return;
    (Q[u.n] || ["", []])[1].forEach(q => pool.push({n:u.n, q})); });
  const box = $("#qbox");
  if (!pool.length) { box.innerHTML = `<div class="sheet"><p>Belum ada soal untuk pilihan ini. Selesaikan atau buka unit di level tersebut dulu.</p></div>`; return; }
  pool.sort(() => Math.random() - .5); QZ = {list: pool.slice(0, 10), i: 0, right: 0};
  quizStep();
}
function quizStep(){
  const box = $("#qbox"), z = QZ;
  if (z.i >= z.list.length) {
    const sc = Math.round(z.right / z.list.length * 100);
    box.innerHTML = `<div class="result ${sc >= PASS ? "pass" : "fail"}"><div><strong>Skor ${sc}% (${z.right}/${z.list.length})</strong>${sc >= PASS ? "Pemahamanmu sudah kuat." : "Ulangi unit dari soal yang salah."}</div><button class="btn" type="button" id="again">Main lagi</button></div>`;
    $("#again").onclick = () => startQuiz(z.src || "all"); return;
  }
  const {n, q} = z.list[z.i];
  box.innerHTML = `<div class="sheet"><div class="row" style="justify-content:space-between"><span class="eyebrow">Soal ${z.i + 1}/${z.list.length}</span><a class="eyebrow" href="#unit-${n}">dari Unit ${n}</a></div>
    <div class="q mc"><div class="qt">${esc(q[0])}</div><div class="opts">${q[1].map((o, j) => `<button class="opt" type="button" data-j="${j}">${esc(o)}</button>`).join("")}</div><div class="why" hidden></div></div><div class="row" id="nx"></div></div>`;
  box.querySelectorAll(".opt").forEach(b => b.onclick = () => {
    const j = +b.dataset.j; box.querySelectorAll(".opt").forEach((o, k) => { o.disabled = true; if (k === q[2]) o.classList.add("right"); else if (k === j) o.classList.add("wrong"); });
    if (j === q[2]) { z.right++; S.xp += 2; save(); stats(); }
    const w = box.querySelector(".why"); w.hidden = false; w.textContent = (j === q[2] ? "Benar. " : "Kurang tepat. ") + q[3];
    $("#nx").innerHTML = `<button class="btn" type="button">${z.i + 1 < z.list.length ? "Soal berikutnya" : "Lihat skor"}</button>`;
    $("#nx button").onclick = () => { z.i++; quizStep(); }; $("#nx button").focus();
  });
}

function settings(){
  return `<div class="wrap"><div class="eyebrow">Pengaturan</div><h1>Progres & tampilan</h1>
  <div class="sheet"><h3>Mode bebas</h3><p class="muted">Buka semua unit tanpa harus lulus kuis. Cocok kalau kamu sudah menguasai level dasar.</p>
    <label class="switch"><input type="checkbox" id="free" ${S.free ? "checked" : ""}> Buka semua unit</label></div>
  <div class="sheet"><h3>Tema</h3><div class="row"><button class="btn small ghost" type="button" data-th="">Ikuti perangkat</button><button class="btn small ghost" type="button" data-th="light">Terang</button><button class="btn small ghost" type="button" data-th="dark">Gelap</button></div></div>
  <div class="sheet"><h3>Pindahkan progres ke perangkat lain</h3><p class="muted">Progres disimpan di browser ini saja. Salin kode di bawah, lalu tempel di perangkat lain.</p>
    <label class="sr" for="code">Kode progres</label><textarea id="code" readonly>${esc(btoa(unescape(encodeURIComponent(JSON.stringify(S)))))}</textarea>
    <div class="row" style="margin:8px 0 18px"><button class="btn small" type="button" id="copy">Salin kode</button></div>
    <label for="paste"><b>Tempel kode dari perangkat lain</b></label><textarea id="paste" placeholder="Tempel kode progres di sini"></textarea>
    <div class="row" style="margin-top:8px"><button class="btn small" type="button" id="load">Muat progres</button></div></div>
  <div class="sheet"><h3>Reset</h3><p class="muted">Menghapus semua progres, XP, dan streak di browser ini.</p><button class="btn small ghost" type="button" id="reset" style="color:var(--bad)">Reset progres</button></div></div>`;
}
function bindSettings(){
  $("#free").onchange = e => { S.free = e.target.checked; save(); sidebar(); toast(S.free ? "Semua unit terbuka" : "Mode bertahap aktif"); };
  document.querySelectorAll("[data-th]").forEach(b => b.onclick = () => { S.theme = b.dataset.th; save(); applyTheme(); toast("Tema diganti"); });
  $("#copy").onclick = () => { const t = $("#code"); (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(() => toast("Kode disalin"), () => { t.select(); toast("Tekan Ctrl+C / salin manual"); }); };
  $("#load").onclick = () => {
    try { const s = JSON.parse(decodeURIComponent(escape(atob($("#paste").value.trim())))); if (!s.done) throw 0; S = Object.assign(blank(), s); save(); applyTheme(); render(); toast("Progres dimuat"); }
    catch (e) { toast("Kode tidak valid. Pastikan seluruh kode tersalin."); }
  };
  let armed = false;
  $("#reset").onclick = e => {
    if (!armed) { armed = true; e.target.textContent = "Yakin? Klik lagi untuk menghapus"; setTimeout(() => { armed = false; e.target.textContent = "Reset progres"; }, 4000); return; }
    S = blank(); save(); applyTheme(); render(); toast("Progres direset");
  };
}
const notFound = () => `<div class="wrap"><h1>Halaman tidak ditemukan</h1><a class="btn" href="#home">Ke beranda</a></div>`;

/* ---------- router ---------- */
function render(){
  const h = location.hash.replace("#", "") || "home", v = $("#view");
  const m = h.match(/^unit-(\d+)$/);
  if (m) { v.innerHTML = unit(+m[1]); bindUnit(+m[1]); }
  else if (h === "glosarium") { v.innerHTML = glossary(); $("#gsearch").oninput = e => { const f = e.target.value.toLowerCase(); document.querySelectorAll("#gl details").forEach(d => d.hidden = !d.dataset.t.includes(f)); }; }
  else if (h === "kuis") { v.innerHTML = quiz(); document.querySelectorAll("#qsrc button").forEach(b => b.onclick = () => { document.querySelectorAll("#qsrc button").forEach(x => x.classList.add("ghost")); b.classList.remove("ghost"); startQuiz(b.dataset.src); if (QZ) QZ.src = b.dataset.src; }); }
  else if (h === "pengaturan") { v.innerHTML = settings(); bindSettings(); }
  else if (h === "home") v.innerHTML = home();
  else v.innerHTML = notFound();
  document.querySelectorAll(".side-links a").forEach(a => a.classList.toggle("on", a.dataset.route === h));
  sidebar($("#search").value); stats(); setDrawer(false);
  const t = U.find(u => "unit-" + u.n === h);
  document.title = t ? `Unit ${t.n}: ${t.title} · Tangga Grammar` : "Tangga Grammar";
}
window.addEventListener("hashchange", () => {
  const h = location.hash;
  if (/^#s-/.test(h)) return; // lompat ke bagian di halaman unit
  render(); window.scrollTo(0, 0); $("#view").focus({preventScroll: true});
});
// tautan "lompat ke bagian" tidak boleh mengganti halaman
document.addEventListener("click", e => {
  const a = e.target.closest(".jump a"); if (!a) return;
  e.preventDefault(); document.querySelector(a.getAttribute("href")).scrollIntoView({behavior: "smooth"});
});
$("#search").oninput = e => sidebar(e.target.value);
$("#menuBtn").onclick = () => setDrawer(!$("#sidebar").classList.contains("open"));
$("#scrim").onclick = () => setDrawer(false);
$("#themeBtn").onclick = () => {
  const dark = S.theme ? S.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  S.theme = dark ? "light" : "dark"; save(); applyTheme();
};
render();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
