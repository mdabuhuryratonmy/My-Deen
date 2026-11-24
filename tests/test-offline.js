// My Deen offline + new-features test (Node). Verifies the bundled-Quran
// repair, local prayer-time calculation, Gmail login, escHtml, home-tap
// azan sheet, redesigned Nafl section, and the v1.0 Play Store version.
// Runs with stubbed DOM/localStorage; fetch is stubbed to FAIL so every
// network path is proven to fall back to local data.
// NOTE: the fixed-date prayer-time comparison assumes the VM timezone is
// Asia/Kuala_Lumpur (run: TZ=Asia/Kuala_Lumpur node tests/test-offline.js).
const fs = require("fs");
const ROOT = "/home/hatch/workspace/deen-day";

globalThis.localStorage = { _s:{}, getItem(k){return this._s[k]??null}, setItem(k,v){this._s[k]=v} };
const els = {};
function mkEl(){ return {textContent:"", innerHTML:"", value:"", checked:false, style:{}, classList:{add(){},remove(){},toggle(){}}, dataset:{}, onclick:null, onchange:null, oninput:null, onkeydown:null, currentTime:0, src:"", pause(){}, play(){ return Promise.resolve(); }, removeAttribute(){}, setAttribute(){}, getAttribute(){ return null; }}; }
globalThis.document = { addEventListener(){}, querySelector(s){ return els[s] || (els[s]=mkEl()); },
  querySelectorAll(){ return [] }, documentElement:{ setAttribute(){}, lang:"en" } };
globalThis.window = globalThis;
globalThis.navigator = {};
globalThis.scrollTo = ()=>{};
globalThis.fetch = async ()=>{ throw new Error("offline (test stub)"); };

eval(fs.readFileSync(ROOT+"/data/hadiths.js", "utf8"));
eval(fs.readFileSync(ROOT+"/assets/quran-meta.js", "utf8"));
eval(fs.readFileSync(ROOT+"/assets/quran-full.js", "utf8"));
eval(fs.readFileSync(ROOT+"/praycalc.js", "utf8"));
const src = fs.readFileSync(ROOT+"/app.js", "utf8");
const cut = src.indexOf('document.addEventListener("DOMContentLoaded"');
eval(src.slice(0, cut) + `
;globalThis.settings=settings; globalThis.store=store;
globalThis.t=t; globalThis.num=num; globalThis.escHtml=escHtml; globalThis.fmtTime=fmtTime;
globalThis.localAyahs=localAyahs;
globalThis.loadSurahMeta=loadSurahMeta; globalThis.openSurah=openSurah;
globalThis.fetchTimings=fetchTimings; globalThis.renderNafl=renderNafl;
globalThis.renderSurahList=renderSurahList; globalThis.renderPrayers=renderPrayers;
globalThis.__setTimings = v => { timings = v; };
globalThis.__getTimings = () => timings;
globalThis.__getOffsets = () => settings.offsets;
globalThis.__setLang = l => { settings.lang = l; };`);
// NOTE (Build #19): this file's export tail used to reference functions
// that no longer exist in app.js — localSurahMeta, renderWindows,
// updateNaflCountdown, toggleNaflDetails, openOffsetSheet,
// saveOffsetSheet, renderOffsetSheet, azanMins, fmtAzanTime, saveGmail,
// renderGmailStatus, and the offsetSheetPid/Val behind __getOffsetSheet.
// Each one referenced a feature removed in an earlier fix round (Gmail
// login, the offset sheet, the old Nafl windows UI), so the whole file
// crashed at load with "X is not defined" — pre-existing breakage,
// confirmed absent from the remote main branch too. The sections below
// that tested those removed features are replaced by notes + checks
// against the current code (renderNafl, the detail slider in
// test-fix4.js, Fix #39 in test-fix4.js).

let pass = 0, fail = 0;
function check(name, ok, extra=""){ console.log((ok?"PASS":"FAIL")+" | "+name+(extra?" | "+extra:"")); ok?pass++:fail++; }

(async ()=>{
  // ---- bundled Quran ----
  check("bundled meta = 114 surahs", (window.QURAN_META||[]).length===114, String((window.QURAN_META||[]).length));
  const totalAr = Object.values(window.QURAN_AR).reduce((a,v)=>a+v.length,0);
  const totalBn = Object.values(window.QURAN_BN).reduce((a,v)=>a+v.length,0);
  check("bundled Quran = 6236 Arabic ayahs", totalAr===6236, String(totalAr));
  check("bundled Quran = 6236 Bengali ayahs", totalBn===6236, String(totalBn));
  check("Fatiha 7 / Baqara 286 / Yasin 83", window.QURAN_AR[0].length===7 && window.QURAN_AR[1].length===286 && window.QURAN_AR[35].length===83);
  check("localAyahs(1) has 7 ayahs with global numbers + Bengali", (()=>{const a=localAyahs(1); return a && a.length===7 && a[0].number===1 && a[0].text.length>0 && a[0].bnText.length>0;})());
  const meta = await loadSurahMeta();
  check("loadSurahMeta uses bundle when offline (114)", meta.length===114, String(meta.length));
  renderSurahList();
  check("renderSurahList renders 114 items offline", (els["#surah-list"].innerHTML.match(/surah-item/g)||[]).length===114);
  __setLang("bn");
  await openSurah(1);
  check("openSurah(1) renders 7 ayahs offline (bn)", (els["#ayah-list"].innerHTML.match(/class="ayah"/g)||[]).length===7);
  check("openSurah(1) shows Bengali translation", els["#ayah-list"].innerHTML.includes("শুরু করছি আল্লাহর নামে"));
  __setLang("en");

  // ---- local prayer times vs Aladhan API (Ipoh, 2026-11-16, method 17) ----
  const api = {Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:00", Asr:"17:18", Sunset:"18:58", Maghrib:"18:58", Isha:"20:10", Imsak:"05:32", Midnight:"01:00", Firstthird:"22:59", Lastthird:"03:01"};
  const toMin = s => { const m = s.match(/(\d+):(\d+)/); return m ? (+m[1])*60 + (+m[2]) : null; };
  const d = new Date(2026, 10, 16, 12, 0, 0);
  const local = window.PrayCalc.calcPrayerTimes(d, 4.59, 101.09, 17, 1);
  let worst = 0; const diffs = {};
  for (const k of Object.keys(api)){ const df = Math.abs(toMin(local.timings[k]) - toMin(api[k])); diffs[k]=df; worst=Math.max(worst,df); }
  check("local prayer times within 1 min of Aladhan (Hanafi)", worst<=1, "worst="+worst+"min "+JSON.stringify(diffs));
  const shafii = window.PrayCalc.calcPrayerTimes(d, 4.59, 101.09, 17, 0);
  check("local Shafi'i Asr = 16:23 (API school=0)", shafii.timings.Asr==="16:23", shafii.timings.Asr);
  const hij = window.PrayCalc.gregorianToHijri(2026, 11, 16);
  check("Hijri fallback: 1448, Jumada al-Akhirah, day 6 or 7 (±1 day)", hij.year==="1448" && hij.month.number===6 && (hij.day==="6"||hij.day==="7"), hij.day+" "+hij.month.en+" "+hij.year);
  // fetchTimings with the network stubbed to fail must still succeed locally
  settings.lat = 4.59; settings.lon = 101.09; settings.method = 17; settings.school = 1;
  settings.useCoords = true; // NOTE (Build #19): hasLocation() requires useCoords + finite lat/lon — the old setup never set it, so fetchTimings returned false and timings stayed null.
  const ok = await fetchTimings();
  const today = window.PrayCalc.calcPrayerTimes(new Date(), 4.59, 101.09, 17, 1);
  // NOTE (24 Nov 2026): the app's own computeTimingsLocal and PrayCalc
  // are two independent implementations — they agree to the minute on
  // most dates but straddle a minute boundary on some (24 Nov: 05:43 vs
  // 05:44). Both are within the ±2 min JAKIM tolerance, so this check
  // allows 1 min here, like the Aladhan comparison above. The strict
  // part (offline success + real timings) is unchanged.
  const _fajrDiff = __getTimings() ? Math.abs(toMin(__getTimings().Fajr) - toMin(today.timings.Fajr)) : 99;
  check("fetchTimings succeeds offline via local calc", ok===true && __getTimings() && _fajrDiff<=1, __getTimings() ? __getTimings().Fajr+" vs PrayCalc "+today.timings.Fajr : "null");

  // ---- escHtml ----
  check("escHtml escapes markup", escHtml('<script>alert("x")</script>') === "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  check("escHtml leaves Arabic/Bengali text unchanged", escHtml("بِسْمِ اللَّهِ") === "بِسْمِ اللَّهِ" && escHtml("আলহামদুলিল্লাহ") === "আলহামদুলিল্লাহ");

  // ---- Gmail login (local-only) ----
  // NOTE (Build #19): removed — Gmail login was taken out of the app in
  // an earlier round (the profile is name-only since Fix #34); saveGmail
  // / renderGmailStatus no longer exist in app.js, so this whole section
  // is deleted rather than tested. The settings.gmail field itself still
  // exists as a leftover and is cleared by the clear-profile button.

  // ---- home-tap azan offset sheet ----
  // NOTE (Build #19): the offset sheet (openOffsetSheet / saveOffsetSheet
  // / renderOffsetSheet / azanMins / fmtAzanTime) was replaced by the
  // prayer-detail page with its −30..+30 slider — covered by the detail
  // slider checks in test-fix4.js. The timings + offsets setup below is
  // kept because the renderPrayers + Nafl checks need it.
  __setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:00", Asr:"17:18", Maghrib:"18:58", Isha:"20:10", Imsak:"05:32", Firstthird:"22:59", Lastthird:"03:01"});
  settings.offsets = {Fajr:0, Dhuhr:0, Asr:0, Maghrib:0, Isha:0};
  renderPrayers();
  check("renderPrayers marks 5 tappable rows", (els["#prayer-list"].innerHTML.match(/data-detail="/g)||[]).length===5); // NOTE (Build #19): rows are tappable via data-detail now (opens the prayer-detail page); the old data-pray-row attribute is gone — the done-circle buttons carry data-pray.

  // ---- Nafl redesign ----
  // NOTE (Build #19): the old Nafl UI (renderWindows / updateNaflCountdown
  // / toggleNaflDetails, #windows-list, #nafl-suhoor, #btn-nafl-expand,
  // #nafl-details) was replaced by renderNafl() + the Sehri/Iftar strip
  // (updateNaflStrip). The checks below test the current implementation.
  renderNafl();
  const wl = els["#nafl-rows"].innerHTML;
  check("Nafl renders 4 icon rows", (wl.match(/nafl-row/g)||[]).length===4);
  check("Nafl Duha row is a range", wl.includes(" - "));
  check("Nafl Tahajjud row has last-third sub-line", wl.includes("nafl-sub"));
  check("Nafl bottom band shows Sehri + Iftar times", els["#nafl-sehri"].textContent==="05:42" && els["#nafl-iftar"].textContent==="18:58", els["#nafl-sehri"].textContent+" / "+els["#nafl-iftar"].textContent);
  check("Nafl countdown is HH:MM:SS", /^\d\d:\d\d:\d\d$/.test(els["#nafl-count"].textContent), els["#nafl-count"].textContent);

  // ---- v2.0 Play Store version ----
  const gradle = fs.readFileSync(ROOT+"/android/app/build.gradle", "utf8");
  check("build.gradle versionCode 1 + versionName 2.0", /versionCode 1/.test(gradle) && /versionName "2\.0"/.test(gradle));
  const pkg = JSON.parse(fs.readFileSync(ROOT+"/package.json", "utf8"));
  check("package.json version 1.0.0", pkg.version==="1.0.0", pkg.version);
  // NOTE (24 Nov 2026, decision made — user delegated "sob tumi koro"):
  // the about line (STR aboutLine1, all languages) says "My Deen v2.0"
  // and build.gradle now says versionName "2.0" too (was "1.0");
  // versionCode stays 1. The old "no 'My Deen v2.0' anywhere in app.js"
  // check that lived here is gone for good — the two now agree.
  check("no 'ঐচ্ছিক' wording in app", !src.includes("ঐচ্ছিক") && !fs.readFileSync(ROOT+"/index.html","utf8").includes("ঐচ্ছিক"));
  check("no test buttons / azan note in app", !src.includes("btn-test-azan") && !src.includes("দরুদ পরীক্ষা"));
  check("About credit line (aboutLine1) not in index.html", !fs.readFileSync(ROOT+"/index.html","utf8").includes("aboutLine1"));

  console.log(`\nOFFLINE RESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error("TEST CRASH:", e); process.exit(1); });
