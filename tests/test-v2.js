// My Deen v2 smoke test (Node). Extends tests/test-apis.js patterns:
// loads data/hadiths.js + app.js (minus the DOMContentLoaded init) and
// exercises the new v2 features with stubbed DOM/localStorage.
const fs = require("fs");

globalThis.localStorage = { _s:{}, getItem(k){return this._s[k]??null}, setItem(k,v){this._s[k]=v} };
const els = {};
function mkEl(){ return {textContent:"", innerHTML:"", value:"", checked:false, style:{}, classList:{add(){},remove(){},toggle(){}}, dataset:{}, onclick:null, onchange:null, oninput:null, onkeydown:null, querySelector(){ return mkEl(); }, querySelectorAll(){ return [] }, setAttribute(){}, getAttribute(){ return null; }}; }
globalThis.document = { addEventListener(){}, querySelector(s){ return els[s] || (els[s]=mkEl()); },
  querySelectorAll(){ return [] }, getElementById(id){ return els["#"+id] || (els["#"+id]=mkEl()); }, documentElement:{ setAttribute(){}, lang:"bn" },
  // NOTE (Build #19): createElement + head.appendChild are stubbed so
  // loadQuranFull() can run in Node — the script "fails" to load
  // (onerror), which is the offline path the notif-feed check needs.
  createElement(){ return {}; }, head: { appendChild(el){ setTimeout(()=>{ if (el.onerror) el.onerror(); }, 0); } } };
globalThis.window = globalThis;
globalThis.navigator = {};
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

eval(fs.readFileSync("/home/hatch/workspace/deen-day/data/hadiths.js", "utf8"));
const src = fs.readFileSync("/home/hatch/workspace/deen-day/app.js", "utf8");
const cut = src.indexOf('document.addEventListener("DOMContentLoaded"');
eval(src.slice(0, cut) + `
;globalThis.todayHadith=todayHadith; globalThis.todayTip=todayTip;
globalThis.skyPeriod=skyPeriod; globalThis.renderForbidden=renderForbidden;
globalThis.renderNotifFeed=renderNotifFeed; globalThis.quranAyahsRead=quranAyahsRead;
globalThis.renderQuranProgress=renderQuranProgress;
globalThis.detectLocation=detectLocation; globalThis.scheduleNativeAzan=scheduleNativeAzan;
globalThis.settings=settings; globalThis.store=store;
globalThis.LANGS=LANGS; globalThis.STR=STR; globalThis.t=t; globalThis.L=L;
globalThis.pname=pname; globalThis.dirName=dirName; globalThis.num=num;
globalThis.QURAN_TR=QURAN_TR; globalThis.quranTrEdition=quranTrEdition;
globalThis.quranEditions=quranEditions; globalThis.langLocale=langLocale; globalThis.isRTL=isRTL;
globalThis.renderLearn=renderLearn; globalThis.LEARN_STEPS=LEARN_STEPS;
globalThis.LEARN_DUAS=LEARN_DUAS; globalThis.LEARN_RAKATS=LEARN_RAKATS;
globalThis.prayerFigure=prayerFigure;
globalThis.POSES=POSES; globalThis.poseFor=poseFor; globalThis.lerpPose=lerpPose;
globalThis.figSVG=figSVG; globalThis.drawPose=drawPose; globalThis.figureParts=figureParts; globalThis.buildLearnDemo=buildLearnDemo;
globalThis.__setTimings = v => { timings = v; };
globalThis.__setSurahMeta = v => { surahMeta = v; };`);

let pass = 0, fail = 0;
function check(name, ok, extra=""){ console.log((ok?"PASS":"FAIL")+" | "+name+(extra?" | "+extra:"")); ok?pass++:fail++; }

check("hadiths count = 30", (window.HADITHS||[]).length===30, String((window.HADITHS||[]).length));
check("tips count = 10", (window.ISLAMIC_TIPS||[]).length===10);
check("todayHadith has ar+bn+ref", (()=>{const h=todayHadith(); return h && h.ar && h.bn && h.ref;})());
check("todayTip has bn", (()=>{const x=todayTip(); return x && x.bn;})());
check("all hadiths have ar+bn+ref", (window.HADITHS||[]).every(h=>h.ar && h.bn && h.ref));
check("defaults theme dark", settings.theme==="dark");
check("defaults school Shafi'i(0) for Malaysia (Fix #11)", settings.school===0);
check("offsets present", settings.offsets && settings.offsets.Fajr===0 && settings.offsets.Maghrib===0);
check("autoLoc default true", settings.autoLoc===true);
check("profileName default empty", settings.profileName==="");
__setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:00", Asr:"16:24", Maghrib:"18:58", Isha:"20:10", Imsak:"05:32", Firstthird:"22:59", Lastthird:"03:01"});
check("skyPeriod is a known value", ["dawn","day","golden","dusk","night"].includes(skyPeriod()), skyPeriod());
renderForbidden();
check("forbidden renders 3 cells", (els["#forbidden-list"].innerHTML.match(/forbid-cell/g)||[]).length===3);
// NOTE (Build #19): renderNotifFeed is async (it awaits loadQuranFull
// first) and the bundled Quran is not loaded in this harness, so the
// verse item is missing: 2 today (hadith + tip) + 6 past = 8. The check
// runs in .then() and the summary at the end of the file waits for it.
const _notifDone = renderNotifFeed().then(()=>{
  check("notif feed has 8 items (2 today + 6 past)", (els["#notif-feed"].innerHTML.match(/notif-item/g)||[]).length===8);
}).catch(e=>{ check("notif feed has 8 items (2 today + 6 past)", false, "renderNotifFeed threw: " + e.message); });
__setSurahMeta([{number:1, numberOfAyahs:7},{number:2, numberOfAyahs:286},{number:114, numberOfAyahs:6}]);
store.set("quran_read", {1:true, 114:true});
check("quran progress 13/6236 ayahs", quranAyahsRead()===13, String(quranAyahsRead()));
renderQuranProgress();
check("quran progress bar 0%", els["#quran-progress-bar"].style.width==="0%");
check("scheduleNativeAzan is function", typeof scheduleNativeAzan==="function");
// NOTE (Build #19): the handlePrayerCheckAction check that lived here
// was removed — that handler no longer exists in app.js (the prayer-check
// notification action was removed when the legacy check reminders were
// reworked; Fix #39 in test-fix4.js covers the replacement). Its export
// crashed the whole file at load — pre-existing breakage, confirmed
// absent from the remote main branch too.
// NOTE (Build #19): the two followUpIds checks that lived here were
// removed — followUpIds no longer exists in app.js (the follow-up /
// check-reminder id helper was deleted when the legacy check reminders
// were reworked; the ids it generated, 100-159, are now cancelled by
// cancelLegacyCheckReminders and covered by the Fix #39 checks in
// test-fix4.js). The export tail referenced it, so the whole file
// crashed at load with "followUpIds is not defined" — pre-existing
// breakage, confirmed absent from the remote main branch too.
check("legacy check-reminder ids 100-159 are cancelled on every sync (Fix #39)", src.includes("for (let i=100;i<160;i++) ids.push(i)"));
check("detectLocation is function", typeof detectLocation==="function");
check("no Deen Day in app.js", !src.includes("Deen Day") && !src.includes("দীন দিবস"));
const html = fs.readFileSync("/home/hatch/workspace/deen-day/index.html","utf8");
check("azan test button + instruction note removed (user asked 2026-11-16) — the Fix #56 durood test button (28 Nov, his order) is NOT covered by this removal",
  !src.includes("btn-test-azan") && !html.includes("নোটিফিকেশন কেটে দিলে আজান বন্ধ") && src.includes("দরুদ পরীক্ষা করুন"));
// ---- i18n (16 languages, English default) ----
check("default language is English", settings.lang==="en", settings.lang);
check("LANGS has 16 languages", LANGS.length===16, String(LANGS.length));
check("STR has 16 languages", Object.keys(STR).length===16, String(Object.keys(STR).length));
check("t() English default", t("nav_home")==="Home" && t("nav_quran")==="Quran", t("nav_home"));
settings.lang="ar"; check("t() Arabic", t("nav_home")==="الرئيسية" && t("nav_quran")==="القرآن", t("nav_home"));
check("pname() Arabic Fajr", pname("Fajr")==="الفجر", pname("Fajr"));
check("isRTL Arabic true / English false", isRTL()===true && (()=>{settings.lang="en"; return isRTL();})()===false);
check("langLocale Arabic", (()=>{settings.lang="ar"; return langLocale();})()==="ar");
check("num() digits bn/ar/fa/en", (()=>{settings.lang="bn"; const b=num(5); settings.lang="ar"; const a=num(5); settings.lang="fa"; const f=num(5); settings.lang="en"; const e=num(5); return b==="৫"&&a==="٥"&&f==="۵"&&e==="5";})());
check("dirName North en/ar", (()=>{settings.lang="en"; const e=dirName(0); settings.lang="ar"; const a=dirName(0); return e==="North"&&a==="الشمال";})());
check("Quran edition ur", (()=>{settings.lang="ur"; return quranTrEdition();})()==="ur.jalandhry");
check("Quran edition ar = none (Arabic only)", (()=>{settings.lang="ar"; return quranTrEdition();})()===null);
check("Quran edition unknown lang falls back en.sahih", (()=>{settings.lang="xx"; return quranTrEdition();})()==="en.sahih");
check("quranEditions ar/ur", (()=>{settings.lang="ar"; const a=quranEditions(); settings.lang="ur"; const u=quranEditions(); return a==="quran-uthmani"&&u==="quran-uthmani,ur.jalandhry";})());
check("t() falls back to English for unknown lang", (()=>{settings.lang="xx"; return t("nav_home");})()==="Home");
check("t() falls back to English for missing ps key", (()=>{settings.lang="ps"; return t("aboutLine1");})()==="My Deen v2.0 — free Islamic app. Prayer times: Aladhan API; Quran: AlQuran Cloud. No ads.");
settings.lang="en";
check("index.html has 16-language select + first-run overlay", html.includes('id="set-lang"') && html.includes('id="lang-first"') && html.includes('lang="bn"')); // NOTE (Build #19): the <html> tag is lang="bn" now (was lang="en" when this check was written); the settings default language is still English.
// ---- Namaz Shikkha (নামাজ শিক্ষা), ported from live PWA v15 ----
check("LEARN_STEPS has 14 steps", LEARN_STEPS.length===14, String(LEARN_STEPS.length));
check("LEARN_STEPS all have posture + bn/en title + desc + ref", LEARN_STEPS.every(s=>s.posture && s.tBn && s.tEn && s.dBn && s.dEn && s.rBn && s.rEn));
check("LEARN_DUAS has 14 items (duas + short surahs)", LEARN_DUAS.length===14, String(LEARN_DUAS.length));
check("LEARN_DUAS all have ar + tr + bn + en + ref", LEARN_DUAS.every(d=>d.ar && d.tr && d.bn && d.en && d.ref));
check("LEARN_RAKATS Fajr 2 Dhuhr 4 Asr 4 Maghrib 3 Isha 4", JSON.stringify(LEARN_RAKATS.map(r=>r.n))==="[2,4,4,3,4]");
// NOTE (Build #19): prayerFigure was rewritten in the PWA v16 pose-engine
// round — it now returns the 320x240 figSVG figure (gold guides + a
// Bengali <text> label), not the old 200x250 stick-figure poster. The
// checks below test the CURRENT implementation (labels from figLabel,
// 7 gold dots on sujud, the horizontal back guide on ruku). The
// tawarruk/iftirash distinction lives in the POSE now, covered by the
// poseFor checks below — the figure label is the same for all madhhabs.
const FIG_LABELS = {takbir:"কান বরাবর হাত তুলুন", qiyam:"নাভির নিচে হাত বাঁধুন", qaumah:"সোজা হয়ে দাঁড়ান", ruku:"পিঠ সমতল, হাত হাঁটুতে", sujud:"সাত হাড়ে সিজদা", jalsa:"বাম পায়ে বসুন, ডান পা খাড়া", tashahhud:"তর্জনী উঁচু করুন", tashahhudFinal:"তর্জনী উঁচু করুন", salam:"ডানে মুখ ফিরান"};
check("prayerFigure poster: all 9 postures have 320x240 viewBox + gold guides + Bengali label, faceless", Object.entries(FIG_LABELS).every(([p, label])=>{
  const s = prayerFigure(p);
  return s.includes('viewBox="0 0 320 240"') && s.includes('#d4af37') && s.includes(label)
    && s.includes('<text') && !/eye|mouth|nose|face/i.test(s);
}));
check("prayerFigure unknown posture falls back to the default standing label", prayerFigure("nope").includes("সোজা দাঁড়ান"));
check("default learnMadhhab is hanafi", settings.learnMadhhab==="hanafi", settings.learnMadhhab);
check("t() madhhab keys en/bn", t("learnMadhabLabel")==="Madhhab (school of thought)" && (()=>{settings.lang="bn"; const b=t("learnMadhabLabel"); settings.lang="en"; return b==="মাজহাব (ফিকহের ধারা)";})());
check("prayerFigure qiyam: hanafi below navel, shafii chest, maliki hanging, hanbali below navel", prayerFigure("qiyam","hanafi").includes("নাভির নিচে হাত বাঁধুন") && prayerFigure("qiyam","shafii").includes("বুকে হাত বাঁধুন") && prayerFigure("qiyam","maliki").includes("হাত ঝুলিয়ে দাঁড়ান") && prayerFigure("qiyam","hanbali").includes("নাভির নিচে হাত বাঁধুন"));
check("prayerFigure takbir: hanafi ears, shafii shoulders", prayerFigure("takbir","hanafi").includes("কান বরাবর হাত তুলুন") && prayerFigure("takbir","shafii").includes("কাঁধ বরাবর হাত তুলুন"));
check("prayerFigure qaumah: hanafi arms at sides, shafii re-folds on chest", prayerFigure("qaumah","hanafi").includes("সোজা হয়ে দাঁড়ান") && prayerFigure("qaumah","shafii").includes("আবার বুকে হাত বাঁধুন"));
check("prayerFigure tashahhud: same label for all madhhabs, tawarruk lives in the pose (see poseFor)", prayerFigure("tashahhud","hanafi").includes("তর্জনী উঁচু করুন") && prayerFigure("tashahhud","maliki").includes("তর্জনী উঁচু করুন") && poseFor("tashahhud","hanafi")!==poseFor("tashahhud","maliki"));
check("prayerFigure tashahhudFinal: same label for all madhhabs, tawarruk lives in the pose (see poseFor)", prayerFigure("tashahhudFinal","hanafi").includes("তর্জনী উঁচু করুন") && prayerFigure("tashahhudFinal","shafii").includes("তর্জনী উঁচু করুন") && poseFor("tashahhudFinal","hanafi")!==poseFor("tashahhudFinal","shafii"));
check("prayerFigure salam maliki one salam", prayerFigure("salam","maliki").includes("এক সালাম"));
check("prayerFigure ruku back flat horizontal guide", prayerFigure("ruku").includes('y1="93" x2="196" y2="93"') && prayerFigure("ruku").includes("পিঠ সমতল, হাত হাঁটুতে"));
check("prayerFigure sujud has 7 gold dots (seven bones)", (prayerFigure("sujud").match(/class="dm-dot"/g)||[]).length===7 && prayerFigure("sujud").includes('data-r="dots"'));
// ---- Animated demo pose engine (ported from live PWA v16) ----
check("pose engine: POSES has 10 poses", Object.keys(POSES).length===10 && ["stand","takbirEars","takbirShoulders","foldNavel","foldChest","ruku","sujud","jalsa","tash","tawarruk"].every(k=>POSES[k]));
check("poseFor takbir: hanafi ears, others shoulders", poseFor("takbir","hanafi")===POSES.takbirEars && poseFor("takbir","shafii")===POSES.takbirShoulders && poseFor("takbir","maliki")===POSES.takbirShoulders);
check("poseFor qiyam: hanafi navel, shafii chest, maliki hanging, hanbali navel (research: Hanbali below navel like Hanafi)", poseFor("qiyam","hanafi")===POSES.foldNavel && poseFor("qiyam","shafii")===POSES.foldChest && poseFor("qiyam","maliki")===POSES.stand && poseFor("qiyam","hanbali")===POSES.foldNavel);
check("poseFor qaumah: hanafi arms at sides, shafii re-folds", poseFor("qaumah","hanafi")===POSES.stand && poseFor("qaumah","shafii")===POSES.foldChest);
check("poseFor final sitting: hanafi iftirash, others tawarruk", poseFor("tashahhudFinal","hanafi")===POSES.tash && poseFor("tashahhudFinal","shafii")===POSES.tawarruk && poseFor("tashahhudFinal","maliki")===POSES.tawarruk && poseFor("tashahhudFinal","hanbali")===POSES.tawarruk);
check("poseFor salam turns head (gaze 28, head shifted)", (()=>{const s=poseFor("salam","hanafi"); return s.gaze===28 && s.head[0]===poseFor("tashahhudFinal","hanafi").head[0]+7;})());
check("lerpPose midpoint = average of joints", (()=>{const m=lerpPose(POSES.stand, POSES.ruku, 0.5); return Math.abs(m.head[0]-(168+92)/2)<0.01 && Math.abs(m.head[1]-(42+94)/2)<0.01 && m.grip===0.5 && m.seven===0;})());
check("lerpPose k=0 returns a, k=1 returns b", (()=>{const a=lerpPose(POSES.stand, POSES.ruku, 0), b=lerpPose(POSES.stand, POSES.ruku, 1); return a.head[0]===168 && b.head[0]===92 && b.grip===1;})());
check("figSVG 320x240, has head/grip/dots parts, faceless, no gaze line or floating dot", (()=>{const s=figSVG(POSES.sujud,"",""); return s.includes('viewBox="0 0 320 240"') && s.includes('data-r="head"') && s.includes('data-r="grip"') && s.includes('data-r="dots"') && !s.includes('data-r="gaze"') && !/eye|mouth|nose|face/i.test(s);})());
check("figSVG poster style: white thobe + skin face/hands/feet + cap + mat + emerald stage, no stick-figure currentColor", (()=>{const s=figSVG(POSES.stand,"",""); return s.includes("#f6f6f3") && s.includes("#e6b183") && s.includes("#0b5e46") && s.includes("#0e6a4c") && s.includes('data-r="cap"') && s.includes('data-r="mat"') && s.includes('data-r="handC"') && s.includes('data-r="handC2"') && s.includes('data-r="torso"') && s.includes('data-r="skirt"') && s.includes('data-r="arm"') && s.includes('data-r="arm2"') && s.includes('data-r="foot"') && s.includes('data-r="foot2"') && !s.includes("currentColor") && !/shoe|footwear/i.test(s);})());
check("figSVG all postures x 4 madhhabs render clean (no NaN/undefined, torso+cap+mat+skirt present)", (()=>{for (const M of ["hanafi","shafii","maliki","hanbali"]) for (const p of ["stand","takbir","qiyam","ruku","qaumah","sujud","jalsa","tashahhud","tashahhudFinal","salam"]){ const s=figSVG(poseFor(p,M),"",""); if (s.includes("NaN")||s.includes("undefined")||!s.includes('data-r="torso"')||!s.includes('data-r="cap"')||!s.includes('data-r="mat"')||!s.includes('data-r="skirt"')) return false; } return true;})());
check("figure reads as a man: shoulders wider than waist, domed kufi above head, two distinct feet, no ghost group", (()=>{const fp=figureParts(POSES.stand); const s=figSVG(POSES.stand,"",""); const capTop=fp.m.capTop; return fp.m.shoulderW>fp.m.waistW && fp.m.waistW<fp.m.hipW && capTop[1]<POSES.stand.head[1]-13 && fp.m.footGap>5 && !/<g[^>]*opacity="\.45"/.test(s) && s.includes("#e2e2dc") && !s.includes('stroke="#d9d9d5"');})());
check("hand-tying is visible: foldGrip on in qiyam (hanafi/hanbali/shafii), off in stand", (()=>{const q=figureParts(poseFor("qiyam","hanafi")).el.find(e=>e.r==="foldGrip"); const q2=figureParts(poseFor("qiyam","shafii")).el.find(e=>e.r==="foldGrip"); const st=figureParts(POSES.stand).el.find(e=>e.r==="foldGrip"); return q && q.op===1 && q2 && q2.op===1 && st && st.op===0;})());
check("drawPose updates a fake SVG root without throwing", (()=>{try{const el=()=>({attrs:{}, setAttribute(k,v){this.attrs[k]=v}, querySelectorAll(){return []}}); const root={querySelector(){return el()}}; drawPose(root, POSES.ruku); return true;}catch(e){return false;}})());
check("drawPose moves cap + hand circles with the pose and fixes far palm (palm2 uses p.palm2)", (()=>{try{const seen={}; const root={querySelector(sel){ return seen[sel] || (seen[sel]={attrs:{}, setAttribute(k,v){this.attrs[k]=v}, querySelectorAll(){return []}}); }}; const p=poseFor("takbir","hanafi"); drawPose(root, p); const cap=seen['[data-r="cap"]'].attrs.d, hc=seen['[data-r="handC"]'].attrs, p2=seen['[data-r="palm2"]'].attrs.d; return typeof cap==="string" && cap.includes("Q") && +hc.cx===p.hand[0] && +hc.cy===p.hand[1] && typeof p2==="string" && p2.includes("M") && !p2.includes(String(p.palm[0])); }catch(e){ return false; }})());
renderLearn();
check("renderLearn fills 14 steps", (els["#learn-steps"].innerHTML.match(/class="learn-step"/g)||[]).length===14);
check("renderLearn fills 14 duas", (els["#learn-duas"].innerHTML.match(/class="dua"/g)||[]).length===14);
check("renderLearn fills 5 rakat cells", (els["#learn-rakats"].innerHTML.match(/class="rakat-cell"/g)||[]).length===5);
check("renderLearn demo builds 14 step chips (hanafi) in prayer order", (()=>{const chips=(els["#learn-demo-seq"].innerHTML.match(/class="dchip"/g)||[]).length; const labels=[...els["#learn-demo-seq"].innerHTML.matchAll(/>([^<]+)<\/button>/g)].map(m=>m[1]); return chips===14 && JSON.stringify(labels)===JSON.stringify(["Stand","Takbir","Fold hands","Ruku","Qawmah","Sujud","Jalsa","Sujud 2","Rak'ah 2","Ruku","Sujud","Tashahhud","Salam (R)","Salam (L)"]);})());
check("renderLearn demo has caption + progress + play + restart controls", els["#learn-demo"].innerHTML.includes('id="dm-cap"') && els["#learn-demo"].innerHTML.includes('id="dm-prog"') && els["#learn-demo"].innerHTML.includes('id="dm-play"') && els["#learn-demo"].innerHTML.includes('id="dm-restart"'));
check("renderLearn demo figure is the 320x240 pose SVG", els["#learn-demo"].innerHTML.includes('viewBox="0 0 320 240"'));
check("renderLearn demo maliki has 13 chips (one salam)", (()=>{settings.learnMadhhab="maliki"; renderLearn(); const n=(els["#learn-demo-seq"].innerHTML.match(/class="dchip"/g)||[]).length; settings.learnMadhhab="hanafi"; renderLearn(); return n===13;})());
check("renderLearn renders 4 madhhab chips, hanafi active", (els["#learn-madhhab"].innerHTML.match(/class="mchip/g)||[]).length===4 && els["#learn-madhhab"].innerHTML.includes('class="mchip on"'));
check("renderLearn shafii renders chest qiyam + tawarruk final in steps", (()=>{const _lang=settings.lang; settings.lang="bn"; settings.learnMadhhab="shafii"; renderLearn(); const h=els["#learn-steps"].innerHTML; const ok=h.includes("বুকে হাত বাঁধুন") && h.includes("তাওয়াররুক"); settings.learnMadhhab="hanafi"; settings.lang=_lang; renderLearn(); return ok;})()); // NOTE (Build #19): the Bengali mNote only renders when the UI language is Bengali — the old check ran in English, so "তাওয়াররুক" never appeared (the English note says "tawarruk").
check("renderLearn shows madhhab notes on 4 steps (hanafi)", (els["#learn-steps"].innerHTML.match(/class="learn-mnote"/g)||[]).length===4);
check("index.html has learn home card + view-learn + nav buttons", html.includes('id="btn-go-learn"') && html.includes('id="view-learn"') && html.includes('id="btn-back-learn"'));
check("t() learnTitle falls back to English for fr, Bengali for bn", (()=>{settings.lang="fr"; const f=t("learnTitle"); settings.lang="bn"; const b=t("learnTitle"); settings.lang="en"; return f==="Learn Prayer (Salah)" && b==="নামাজ শিক্ষা";})());
check("no old bn/en toggle button left", !src.includes("btn-lang") && !html.includes("btn-lang"));
check("no optional-login wording in app", !src.includes("ঐচ্ছিক") && !html.includes("ঐচ্ছিক"));
// NOTE (Build #19): the notif-feed check above runs async — wait for it
// before printing the result, or the process would exit before it runs.
_notifDone.then(()=>{ console.log(`\nSMOKE RESULT: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); });


