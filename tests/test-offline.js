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
globalThis.localSurahMeta=localSurahMeta; globalThis.localAyahs=localAyahs;
globalThis.loadSurahMeta=loadSurahMeta; globalThis.openSurah=openSurah;
globalThis.fetchTimings=fetchTimings; globalThis.renderWindows=renderWindows;
globalThis.updateNaflCountdown=updateNaflCountdown; globalThis.toggleNaflDetails=toggleNaflDetails;
globalThis.renderSurahList=renderSurahList; globalThis.renderPrayers=renderPrayers;
globalThis.openOffsetSheet=openOffsetSheet; globalThis.saveOffsetSheet=saveOffsetSheet;
globalThis.renderOffsetSheet=renderOffsetSheet; globalThis.azanMins=azanMins; globalThis.fmtAzanTime=fmtAzanTime;
globalThis.saveGmail=saveGmail; globalThis.renderGmailStatus=renderGmailStatus;
globalThis.__setTimings = v => { timings = v; };
globalThis.__getTimings = () => timings;
globalThis.__getOffsets = () => settings.offsets;
globalThis.__getOffsetSheet = () => ({pid: offsetSheetPid, val: offsetSheetVal});
globalThis.__setLang = l => { settings.lang = l; };`);

let pass = 0, fail = 0;
function check(name, ok, extra=""){ console.log((ok?"PASS":"FAIL")+" | "+name+(extra?" | "+extra:"")); ok?pass++:fail++; }

(async ()=>{
  // ---- bundled Quran ----
  check("bundled meta = 114 surahs", (window.QURAN_META||[]).length===114, String((window.QURAN_META||[]).length));
  const totalAr = Object.values(window.QURAN_FULL.ar).reduce((a,v)=>a+v.length,0);
  const totalBn = Object.values(window.QURAN_FULL.bn).reduce((a,v)=>a+v.length,0);
  check("bundled Quran = 6236 Arabic ayahs", totalAr===6236, String(totalAr));
  check("bundled Quran = 6236 Bengali ayahs", totalBn===6236, String(totalBn));
  check("Fatiha 7 / Baqara 286 / Yasin 83", window.QURAN_FULL.ar["1"].length===7 && window.QURAN_FULL.ar["2"].length===286 && window.QURAN_FULL.ar["36"].length===83);
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
  const ok = await fetchTimings();
  const today = window.PrayCalc.calcPrayerTimes(new Date(), 4.59, 101.09, 17, 1);
  check("fetchTimings succeeds offline via local calc", ok===true && __getTimings() && __getTimings().Fajr===today.timings.Fajr, __getTimings() ? __getTimings().Fajr : "null");

  // ---- escHtml ----
  check("escHtml escapes markup", escHtml('<script>alert("x")</script>') === "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  check("escHtml leaves Arabic/Bengali text unchanged", escHtml("بِسْمِ اللَّهِ") === "بِسْمِ اللَّهِ" && escHtml("আলহামদুলিল্লাহ") === "আলহামদুলিল্লাহ");

  // ---- Gmail login (local-only) ----
  check("gmail default empty", settings.gmail==="");
  document.querySelector("#set-profile-gmail").value = "not-an-email";
  saveGmail();
  check("Gmail login rejects invalid address", settings.gmail==="");
  document.querySelector("#set-profile-gmail").value = "AbuHuryra@Gmail.com";
  saveGmail();
  check("Gmail login saves lowercase address", settings.gmail==="abuhuryra@gmail.com", settings.gmail);
  renderGmailStatus();
  check("Gmail status shows logged-in address", els["#gmail-status"].textContent.includes("abuhuryra@gmail.com"));

  // ---- home-tap azan offset sheet ----
  __setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:00", Asr:"17:18", Maghrib:"18:58", Isha:"20:10", Imsak:"05:32", Firstthird:"22:59", Lastthird:"03:01"});
  settings.offsets = {Fajr:0, Dhuhr:0, Asr:0, Maghrib:0, Isha:0};
  openOffsetSheet("Fajr");
  check("openOffsetSheet targets Fajr with offset 0", __getOffsetSheet().pid==="Fajr" && __getOffsetSheet().val===0);
  settings.offsets.Fajr = -15;
  check("azanMins applies offset (Fajr -15 = 5:27 AM)", fmtAzanTime("Fajr")==="5:27 AM", fmtAzanTime("Fajr"));
  settings.offsets.Fajr = 0;
  openOffsetSheet("Maghrib");
  check("sheet opens for Maghrib", __getOffsetSheet().pid==="Maghrib");
  saveOffsetSheet();
  check("saveOffsetSheet persists offset and closes", settings.offsets.Maghrib===0 && __getOffsetSheet().pid===null);
  renderPrayers();
  check("renderPrayers marks 5 tappable rows", (els["#prayer-list"].innerHTML.match(/data-pray-row/g)||[]).length===5);

  // ---- Nafl redesign ----
  renderWindows();
  const wl = els["#windows-list"].innerHTML;
  check("Nafl renders 4 icon rows", (wl.match(/nafl-row/g)||[]).length===4);
  check("Nafl Duha row is a range", wl.includes("–"));
  check("Nafl Tahajjud row has last-third sub-line", wl.includes("green-dot"));
  check("Nafl bottom band shows Suhoor + Iftar times", els["#nafl-suhoor"].textContent===fmtTime("05:32") && els["#nafl-iftar"].textContent===fmtTime("18:58"), els["#nafl-suhoor"].textContent+" / "+els["#nafl-iftar"].textContent);
  updateNaflCountdown();
  check("Nafl Iftar countdown is HH:MM:SS", /^\d\d:\d\d:\d\d$/.test(els["#nafl-iftar-left"].textContent), els["#nafl-iftar-left"].textContent);
  toggleNaflDetails();
  check("Nafl expand button switches to collapse label", els["#btn-nafl-expand"].textContent===t("naflCollapse"), els["#btn-nafl-expand"].textContent);
  check("Nafl details list built (6 rows)", (els["#nafl-details"].innerHTML.match(/win-row/g)||[]).length===6);
  toggleNaflDetails();

  // ---- v1.0 Play Store version ----
  const gradle = fs.readFileSync(ROOT+"/android/app/build.gradle", "utf8");
  check("build.gradle versionCode 1 + versionName 1.0", /versionCode 1/.test(gradle) && /versionName "1\.0"/.test(gradle));
  const pkg = JSON.parse(fs.readFileSync(ROOT+"/package.json", "utf8"));
  check("package.json version 1.0.0", pkg.version==="1.0.0", pkg.version);
  check("no 'My Deen v2.0' anywhere in app.js", !src.includes("My Deen v2.0"));
  check("no 'ঐচ্ছিক' wording in app", !src.includes("ঐচ্ছিক") && !fs.readFileSync(ROOT+"/index.html","utf8").includes("ঐচ্ছিক"));
  check("no test buttons / azan note in app", !src.includes("btn-test-azan") && !src.includes("দরুদ পরীক্ষা"));
  check("About credit line (aboutLine1) not in index.html", !fs.readFileSync(ROOT+"/index.html","utf8").includes("aboutLine1"));

  console.log(`\nOFFLINE RESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e=>{ console.error("TEST CRASH:", e); process.exit(1); });
