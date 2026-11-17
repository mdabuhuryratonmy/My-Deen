// My Deen API + logic verification (Node). Tests the exact endpoints app.js uses,
// plus the real banglaDate() and qiblaBearing() functions from app.js.
const fs = require("fs");

globalThis.localStorage = { _s:{}, getItem(k){return this._s[k]??null}, setItem(k,v){this._s[k]=v} };
globalThis.document = { addEventListener(){}, querySelector(){ return {textContent:"", innerHTML:"", value:"", checked:false, style:{}, classList:{add(){},remove(){},toggle(){}}, dataset:{}, onclick:null, onchange:null, oninput:null, onkeydown:null} },
  querySelectorAll(){ return [] }, documentElement:{ setAttribute(){}, lang:"bn" } };
globalThis.window = globalThis;
globalThis.navigator = {};

const src = fs.readFileSync("/home/hatch/workspace/deen-day/app.js", "utf8");
// strip the DOMContentLoaded init block so nothing runs at load
const cut = src.indexOf('document.addEventListener("DOMContentLoaded"');
eval(src.slice(0, cut) + "\n;globalThis.banglaDate=banglaDate; globalThis.qiblaBearing=qiblaBearing;");

let pass = 0, fail = 0;
function check(name, ok, extra=""){ console.log((ok?"PASS":"FAIL")+" | "+name+(extra?" | "+extra:"")); ok?pass++:fail++; }

(async () => {
  // 1. Bengali calendar
  const b1 = banglaDate(new Date(2026, 10, 16)); // 16 Nov 2026 -> 2 Ogrohayon 1433
  check("banglaDate 16 Nov 2026", b1.day===2 && b1.month===7 && b1.year===1433, JSON.stringify(b1));
  const b2 = banglaDate(new Date(2026, 3, 14)); // 14 Apr 2026 -> 1 Boishakh 1433
  check("banglaDate 14 Apr 2026", b2.day===1 && b2.month===0 && b2.year===1433, JSON.stringify(b2));
  const b3 = banglaDate(new Date(2026, 0, 1)); // 1 Jan 2026 -> 17 Poush 1432
  check("banglaDate 1 Jan 2026", b3.month===8 && b3.year===1432, JSON.stringify(b3));
  // 2. Qibla bearing for Ipoh
  const qb = qiblaBearing(4.59, 101.09);
  check("qiblaBearing Ipoh ~291.9", Math.abs(qb-291.9)<0.5, qb.toFixed(2));
  // 3. Prayer times method 17 (Malaysia JAKIM)
  let r = await fetch("https://api.aladhan.com/v1/timingsByCity/16-11-2026?city=Ipoh&country=Malaysia&method=17&school=0");
  let j = await r.json();
  check("timings method 17", j.code===200 && j.data.timings.Fajr==="05:42" && j.data.timings.Maghrib==="18:58", JSON.stringify(j.data.timings));
  check("hijri in timings", j.data.date.hijri.day==="6" && j.data.date.hijri.month.number===6, j.data.date.hijri.date);
  // 4. Hanafi Asr differs from Shafi
  r = await fetch("https://api.aladhan.com/v1/timingsByCity/16-11-2026?city=Ipoh&country=Malaysia&method=17&school=1");
  j = await r.json();
  check("Hanafi Asr later than Shafi", j.data.timings.Asr > "16:23", "Hanafi Asr="+j.data.timings.Asr);
  // 5. Quran surah 114 with Bengali translation
  r = await fetch("https://api.alquran.cloud/v1/surah/114/editions/quran-uthmani,bn.bengali");
  j = await r.json();
  check("Quran 114 editions", j.code===200 && j.data[0].ayahs.length===6 && j.data[1].ayahs[0].text.length>3, "bn: "+j.data[1].ayahs[0].text.slice(0,30));
  // 6. Surah list 114
  r = await fetch("https://api.alquran.cloud/v1/surah"); j = await r.json();
  check("Surah list = 114", j.code===200 && j.data.length===114);
  // 7. Hijri calendar month
  r = await fetch("https://api.aladhan.com/v1/hijriCalendarByCity/1448/6?city=Ipoh&country=Malaysia&method=17");
  j = await r.json();
  check("Hijri calendar 1448/6", j.code===200 && j.data.length>=28, "days="+j.data.length);
  // 8. Qibla API
  r = await fetch("https://api.aladhan.com/v1/qibla/4.59/101.09"); j = await r.json();
  check("Qibla API 291.9", j.code===200 && Math.abs(j.data.direction-291.9)<0.1, String(j.data.direction));
  // 9. Audio ayah mp3 — only verified reciters (see RECITERS note in app.js)
  r = await fetch("https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3", {method:"HEAD"});
  check("Ayah audio ar.alafasy/1.mp3", r.status===200, "status="+r.status);
  r = await fetch("https://cdn.islamic.network/quran/audio/128/ar.husary/1.mp3", {method:"HEAD"});
  check("Ayah audio ar.husary/1.mp3", r.status===200, "status="+r.status);
  r = await fetch("https://cdn.islamic.network/quran/audio/128/ar.minshawi/1.mp3", {method:"HEAD"});
  check("Ayah audio ar.minshawi/1.mp3", r.status===200, "status="+r.status);
  r = await fetch("https://cdn.islamic.network/quran/audio/128/ar.abdulbasitmurattal/1.mp3", {method:"HEAD"});
  check("Abdul Basit correctly excluded (CDN 403)", r.status===403, "status="+r.status);
  // 10. Adhan mp3
  r = await fetch("https://cdn.aladhan.com/audio/adhans/a1.mp3", {method:"HEAD"});
  check("Adhan a1.mp3", r.status===200, "status="+r.status);
  // 11. duas data loads
  const duasSrc = fs.readFileSync("/home/hatch/workspace/deen-day/data/duas.js", "utf8");
  eval(duasSrc);
  check("Duas data", Array.isArray(window.DUAS) && window.DUAS.length>=20, "count="+window.DUAS.length);
  check("Dhikr presets", window.DHIKR_PRESETS.length===6);
  check("Dua cats", window.DUA_CATS.length===7);
  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail?1:0);
})();
