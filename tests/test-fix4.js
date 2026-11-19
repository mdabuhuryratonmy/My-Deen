// My Deen Fix #4 + Fix #5 test (Node). Loads www/data/hadiths.js + www/app.js
// (minus the DOMContentLoaded init) with a stubbed DOM/localStorage and
// exercises the Fix #4 features: profile-photo + durood-test removal,
// login behaviour, countdown ring, pre-azan texts, forbidden windows,
// alarm list, detail slider, calendar cards, fasting hadiths.
// Fix #5: profile form hides after save, manual location removed.
const fs = require("fs");

globalThis.localStorage = { _s:{}, getItem(k){return this._s[k]??null}, setItem(k,v){this._s[k]=v} };
const els = {};
function mkEl(){ const _cls = new Set(); return {textContent:"", innerHTML:"", value:"", checked:false, style:{}, options:[], classList:{add(c){_cls.add(c)},remove(c){_cls.delete(c)},toggle(c,f){ if(f===undefined) f=!_cls.has(c); if(f)_cls.add(c); else _cls.delete(c); },contains(c){return _cls.has(c)}}, dataset:{}, onclick:null, onchange:null, oninput:null, onkeydown:null, querySelector(){ return mkEl(); }, querySelectorAll(){ return [] }, setAttribute(){}, getAttribute(){ return null; }, addEventListener(){}, removeEventListener(){}, appendChild(){}, scrollIntoView(){}}; }
globalThis.document = { addEventListener(){}, querySelector(s){ return els[s] || (els[s]=mkEl()); },
  querySelectorAll(){ return [] }, getElementById(id){ return els["#"+id] || (els["#"+id]=mkEl()); }, documentElement:{ setAttribute(){}, lang:"bn" } };
globalThis.window = globalThis;
globalThis.scrollTo = ()=>{};
globalThis.navigator = {};
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

eval(fs.readFileSync("/home/hatch/workspace/deen-day/www/data/hadiths.js", "utf8"));
eval(fs.readFileSync("/home/hatch/workspace/deen-day/www/data/duas.js", "utf8")); // DUAS, DUA_CATS, DHIKR_PRESETS
eval(fs.readFileSync("/home/hatch/workspace/deen-day/www/assets/quran-meta.js", "utf8")); // bundled 114-surah meta (offline)
const src = fs.readFileSync("/home/hatch/workspace/deen-day/www/app.js", "utf8");
const cut = src.indexOf('document.addEventListener("DOMContentLoaded"');
eval(src.slice(0, cut) + `
;globalThis.settings=settings; globalThis.store=store;
globalThis.forbiddenWindows=forbiddenWindows; globalThis.nextEvent=nextEvent; globalThis.nextPrayer=nextPrayer;
globalThis.computeTimingsLocal=computeTimingsLocal; globalThis.effSchool=effSchool; globalThis.schoolForRegion=schoolForRegion; globalThis.toMin=toMin;
globalThis.locNow=locNow; globalThis.locAbs=locAbs; globalThis.todayKey=todayKey; globalThis.ddmmyyyy=ddmmyyyy; globalThis.__getTimings=()=>timings;
globalThis.buildPrayerAlarmList=buildPrayerAlarmList; globalThis.renderPrayers=renderPrayers;
globalThis.renderForbidden=renderForbidden;
globalThis.syncPrayerAlarms=syncPrayerAlarms; globalThis.refreshAlarmStatus=refreshAlarmStatus;
globalThis.renderAlarmStatus=renderAlarmStatus; globalThis.nextAzanInfo=nextAzanInfo;
globalThis.__getAlarmStatus=()=>alarmStatus;
globalThis.togglePrayer=togglePrayer; globalThis.isDone=isDone;
globalThis.tapTasbih=tapTasbih; globalThis.renderTasbih=renderTasbih;
globalThis.__getTasbihCount=()=>tasbih.count;
globalThis.renderDuaCats=renderDuaCats; globalThis.renderDuas=renderDuas;
globalThis.__setDuaCat=v=>{ duaCat=v; };
globalThis.banglaDate=banglaDate; globalThis.renderDates=renderDates;
globalThis.checkAzan=checkAzan; globalThis.__getRungToday=()=>rungToday;
globalThis.effMethod=effMethod; globalThis.methodForRegion=methodForRegion;
globalThis.saveSettings=saveSettings; globalThis.fillSettings=fillSettings;
globalThis.updateNotifBadge=updateNotifBadge;
globalThis.toggleSurahRead=toggleSurahRead; globalThis.quranAyahsRead=quranAyahsRead;
globalThis.renderQuranProgress=renderQuranProgress;
globalThis.__setSurahMeta=v=>{ surahMeta=v; };
globalThis.renderSurahList=renderSurahList; globalThis.TOTAL_AYAH=TOTAL_AYAH;
globalThis.validSurahMeta=validSurahMeta;
globalThis.SEHRI_ID=SEHRI_ID; globalThis.IFTAR_ID=IFTAR_ID; globalThis.TAHAJJUD_ID=TAHAJJUD_ID; globalThis.DUHA_ID=DUHA_ID;
globalThis.renderCalendarPage=renderCalendarPage; globalThis.openPrayerDetail=openPrayerDetail;
globalThis.updateDetailTime=updateDetailTime; globalThis.renderAlarmPage=renderAlarmPage;
globalThis.renderLoginState=renderLoginState; globalThis.renderGreet=renderGreet; globalThis.renderReminderSettings=renderReminderSettings; globalThis.clampDhikrMin=clampDhikrMin; globalThis.remPanel=remPanel; globalThis.remStepLabel=remStepLabel; globalThis.renderTracker=renderTracker; globalThis.renderFastHadith=renderFastHadith;
globalThis.renderFastSchedule=renderFastSchedule; globalThis.renderFasting=renderFasting;
globalThis.FASTING_HADITHS=FASTING_HADITHS; globalThis.PREAZAN_TEXTS=PREAZAN_TEXTS;
globalThis.TAHAJJUD_TEXT=TAHAJJUD_TEXT; globalThis.ALARM_SOUNDS=ALARM_SOUNDS;
globalThis.PREAZAN_IDS=PREAZAN_IDS; globalThis.PREAZAN5_IDS=PREAZAN5_IDS; globalThis.AZAN_IDS=AZAN_IDS;
globalThis.getDetailDraft=()=>detailDraft; globalThis.getDetailId=()=>detailId;
globalThis.__setTimings = v => { timings = v; };
globalThis.__setEditingProfile = v => { editingProfile = v; }; // Fix #27 test hook: the save/clear handlers live in init (past the harness cut), so tests drive the edit flag through this hook
globalThis.pname=pname; globalThis.Lb=Lb; globalThis.num=num; globalThis.t=t;
globalThis.migrateAlarmSounds=migrateAlarmSounds;
globalThis.normalizeSounds=normalizeSounds; globalThis.toggleDetailSound=toggleDetailSound;
globalThis.qiblaBearing=qiblaBearing; globalThis.updateNeedle=updateNeedle;
globalThis.__setQiblaDeg=v=>{ qiblaDeg=v; }; globalThis.__setHeading=v=>{ heading=v; };
globalThis.fetchQibla=fetchQibla; globalThis.__getQiblaDeg=()=>qiblaDeg;
globalThis.resolveCityCoordsOffline=resolveCityCoordsOffline;
globalThis.__$= $;
`);

let pass = 0, fail = 0;
function check(name, ok, extra=""){ console.log((ok?"PASS":"FAIL")+" | "+name+(extra?" | "+extra:"")); ok?pass++:fail++; }

const html = fs.readFileSync("/home/hatch/workspace/deen-day/www/index.html", "utf8");
const sw = fs.readFileSync("/home/hatch/workspace/deen-day/www/sw.js", "utf8");
const css = fs.readFileSync("/home/hatch/workspace/deen-day/www/styles.css", "utf8");
__setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:00", Asr:"16:24", Maghrib:"18:58", Isha:"20:10", Imsak:"05:32", Firstthird:"22:59", Lastthird:"03:01"});
settings.lang = "bn";

// ---- Fix #3 corrections: profile photo + durood test button gone ----
check("no profilePhoto in defaults/settings", settings.profilePhoto === undefined && !("profilePhoto" in settings));
check("renderGmailStatus/renderProfilePhoto/handleProfilePhotoFile removed from source",
  !src.includes("function renderGmailStatus") && !src.includes("function renderProfilePhoto") && !src.includes("function handleProfilePhotoFile"));
check("durood test button removed (source + HTML)",
  !src.includes("btn-test-durood") && !src.includes("দরুদ পরীক্ষা") && !html.includes("btn-test-durood"));
check("no profile photo markup in HTML",
  !html.includes("hdr-avatar") && !html.includes("profile-photo-input") && !html.includes("btn-change-photo") && !html.includes("gmail-status"));
check("renderLoginState is a function", typeof renderLoginState === "function");
settings.profileName = "Abu huryra"; settings.gmail = "tonmyboss@gmail.com"; renderLoginState();
check("Fix #27: after save, BOTH the profile form and the saved row are hidden (only the name in the salam remains)",
  els["#profile-form"].classList.contains("hidden") && els["#profile-saved"].classList.contains("hidden") && els["#profile-saved-name"].textContent === "Abu huryra");
settings.profileName = ""; settings.gmail = ""; renderLoginState();
check("profile form returns after profile is cleared",
  !els["#profile-form"].classList.contains("hidden") && els["#profile-saved"].classList.contains("hidden"));

// ---- Fix #4 defaults ----
check("offsets include Duha/Tahajjud/forbidden/Sehri/Iftar",
  settings.offsets.Duha===0 && settings.offsets.Tahajjud===0 && settings.offsets.ForbMorning===0 &&
  settings.offsets.ForbNoon===0 && settings.offsets.ForbEvening===0 && settings.offsets.Sehri===0 && settings.offsets.Iftar===0);
check("alarmOn defaults: 5 fard on, others off",
  settings.alarmOn.Fajr===true && settings.alarmOn.Isha===true && settings.alarmOn.Duha===false &&
  settings.alarmOn.Tahajjud===false && settings.alarmOn.Sehri===false && settings.alarmOn.Iftar===false);
check("alarmSound defaults all [name] (prayer name, permanent default)", Object.values(settings.alarmSound).every(v=>Array.isArray(v) && v.length===1 && v[0]==="name") && settings.alarmSound.Fajr[0]==="name" && settings.alarmSound.Sehri[0]==="name");
check("permAsked default false", settings.permAsked===false);

// ---- Pre-azan texts: exact, not one letter changed ----
check("pre-azan Fajr exact", PREAZAN_TEXTS.Fajr === "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন");
check("pre-azan Dhuhr exact", PREAZAN_TEXTS.Dhuhr === "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন");
check("pre-azan Asr exact", PREAZAN_TEXTS.Asr === "আসরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন");
check("pre-azan Maghrib exact", PREAZAN_TEXTS.Maghrib === "মাগরিবের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন");
check("pre-azan Isha exact", PREAZAN_TEXTS.Isha === "ইশার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন");
check("tahajjud text exact", TAHAJJUD_TEXT === "তাহাজ্জুদের সময় হয়েছে, উঠে নামাজের প্রস্তুতি নিন");

// ---- Forbidden windows ----
const fw = forbiddenWindows();
check("forbidden windows = 3", fw.length===3);
check("morning forbidden sunrise→+15", fw[0].start===423 && fw[0].end===438, `${fw[0].start}–${fw[0].end}`);
check("midday forbidden dhuhr−4→dhuhr+2 (Fix #15: user's 12:57–13:03)", fw[1].start===776 && fw[1].end===782, `${fw[1].start}–${fw[1].end}`);
check("evening forbidden maghrib−15→maghrib", fw[2].start===1123 && fw[2].end===1138, `${fw[2].start}–${fw[2].end}`);

// ---- nextEvent / countdown ring ----
const atNoon = new Date(); atNoon.setHours(12,0,0,0);
const ne1 = nextEvent(atNoon);
// ForbNoon (12:56) starts before Dhuhr (13:00), so it IS the next event.
check("nextEvent at 12:00 is the midday forbidden window (upcoming)", ne1.kind==="forbidden" && ne1.id==="ForbNoon" && ne1.at.getHours()===12 && ne1.at.getMinutes()===56 && ne1.state==="upcoming", ne1.id);
const at1305 = new Date(); at1305.setHours(13,5,0,0);
const ne1b = nextEvent(at1305);
check("Fix #15: nextEvent at 13:05 is Dhuhr (current), counting to Asr 16:24", ne1b.kind==="prayer" && ne1b.id==="Dhuhr" && ne1b.state==="current" && ne1b.at.getHours()===16 && ne1b.at.getMinutes()===24, ne1b.id);
const at1258 = new Date(); at1258.setHours(12,58,0,0);
const ne1c = nextEvent(at1258);
check("inside midday forbidden window counts to its end (13:02)", ne1c.kind==="forbidden" && ne1c.at.getHours()===13 && ne1c.at.getMinutes()===2 && ne1c.state==="current", ne1c.kind+" "+ne1c.at.getHours()+":"+ne1c.at.getMinutes());
const at705 = new Date(); at705.setHours(7,5,0,0);
const ne2 = nextEvent(at705);
check("inside morning forbidden window counts to its end", ne2.kind==="forbidden" && ne2.at.getHours()===7 && ne2.at.getMinutes()===18 && ne2.state==="current", ne2.kind+" "+ne2.at.getHours()+":"+ne2.at.getMinutes());

// ---- Fix #11: forbidden window must never displace a prayable prayer ----
// The user's report: 19 Nov, 18:27, Asr running — the ring showed the
// forbidden window as if it were already running.
const at1827 = new Date(); at1827.setHours(18,27,0,0);
const ne1827 = nextEvent(at1827);
check("Fix #11: at 18:27 the ring shows Asr (current), counting to 18:58 (Fix #15: next prayer start, not the forbidden start)", ne1827.kind==="prayer" && ne1827.id==="Asr" && ne1827.state==="current" && ne1827.at.getHours()===18 && ne1827.at.getMinutes()===58, ne1827.kind+" "+ne1827.id+" "+ne1827.at.getHours()+":"+ne1827.at.getMinutes());
const at1700 = new Date(); at1700.setHours(17,0,0,0);
const ne1700 = nextEvent(at1700);
check("Fix #11: at 17:00 the ring shows Asr (current), counting to 18:58 (Fix #15)", ne1700.kind==="prayer" && ne1700.id==="Asr" && ne1700.state==="current" && ne1700.at.getHours()===18 && ne1700.at.getMinutes()===58, ne1700.kind+" "+ne1700.id);
const at1850 = new Date(); at1850.setHours(18,50,0,0);
const ne1850 = nextEvent(at1850);
check("Fix #11: at 18:50 (inside evening window) the ring shows forbidden, counting to 18:58", ne1850.kind==="forbidden" && ne1850.id==="ForbEvening" && ne1850.state==="current" && ne1850.at.getHours()===18 && ne1850.at.getMinutes()===58, ne1850.kind+" "+ne1850.id);
const at0725 = new Date(); at0725.setHours(7,25,0,0);
const ne0725 = nextEvent(at0725);
check("Fix #11: at 07:25 (no prayer current) the next forbidden window is upcoming, not current", ne0725.kind==="forbidden" && ne0725.id==="ForbNoon" && ne0725.state==="upcoming", ne0725.kind+" "+ne0725.id+" "+ne0725.state);

// ---- Fix #15: current prayer counts to the next prayer start ----
// The user's side-by-side screenshots, 19 Nov 18:36: reference ring =
// "আসর, শেষ হতে বাকি ০০:২১:৫৫" (to 18:58); his app showed the evening
// forbidden window. Fix #11 had the right label but the wrong target
// (it counted Asr to the forbidden start, 18:43). The waqt lasts
// until the next prayer, so the ring counts to the next prayer start;
// the forbidden window takes over only while actually inside it.
const at1836 = new Date(); at1836.setHours(18,36,4,0);
const ne1836 = nextEvent(at1836);
check("Fix #15: at 18:36 (reported case) the ring shows Asr (current), counting to 18:58 — 00:21:55 left, like the reference", ne1836.kind==="prayer" && ne1836.id==="Asr" && ne1836.state==="current" && ne1836.at.getHours()===18 && ne1836.at.getMinutes()===58, ne1836.kind+" "+ne1836.id+" "+ne1836.at.getHours()+":"+ne1836.at.getMinutes());
const at0650 = new Date(); at0650.setHours(6,50,0,0);
const ne0650 = nextEvent(at0650);
check("Fix #15: at 06:50 the ring shows Fajr (current), counting to sunrise 07:03", ne0650.kind==="prayer" && ne0650.id==="Fajr" && ne0650.state==="current" && ne0650.at.getHours()===7 && ne0650.at.getMinutes()===3, ne0650.kind+" "+ne0650.id);

// ---- Fix #16 + Fix #17: forbidden time shows the message ----
// During a forbidden window the ring name shows "এখন সালাতের নিষিদ্ধ
// সময়, এই সময়ে নামাজ পড়া নিষিদ্ধ". Fix #16 first hid the countdown;
// the user then reversed that (Fix #17): the "শেষ হতে বাকি"
// countdown IS shown too. In a normal waqt the ring shows the prayer
// name + countdown as before. Also: the forbidden section's midday
// cell must show the Fix #15 window (12:56–13:02), not the old
// hardcoded 12:50–13:00.
const RealDate16 = Date;
const _tz16 = settings.tzName; settings.tzName = "";
const fake16 = (h, m, s=0) => {
  const t = new Date(); t.setHours(h, m, s, 0);
  globalThis.Date = class extends RealDate16 {
    constructor(...a){ super(...(a.length ? a : [t.getTime()])); }
    static now(){ return t.getTime(); }
  };
};
settings.lang = "bn";
fake16(18, 50); renderPrayers();
check("Fix #17: at 18:50 (inside evening window) the ring shows the forbidden message AND the countdown (user reversed the no-countdown part)",
  els["#ring-name"].textContent === "এখন সালাতের নিষিদ্ধ সময়, এই সময়ে নামাজ পড়া নিষিদ্ধ" &&
  els["#ring-count"].textContent === "০০:০৮:০০" && els["#ring-count"].style.display !== "none" &&
  els["#ring-sub"].textContent === "শেষ হতে বাকি" && els["#ring-label"].textContent === "নিষিদ্ধ সময়",
  `${els["#ring-name"].textContent} / count='${els["#ring-count"].textContent}' / sub='${els["#ring-sub"].textContent}'`);
fake16(18, 36); renderPrayers();
check("Fix #16: at 18:36 (Asr) the ring still shows Asr + countdown + 'শেষ হতে বাকি'",
  els["#ring-name"].textContent === "আসর" && els["#ring-count"].textContent === "০০:২২:০০" &&
  els["#ring-sub"].textContent === "শেষ হতে বাকি" && els["#ring-label"].textContent === "বর্তমান নামাজ",
  `${els["#ring-name"].textContent} / ${els["#ring-count"].textContent} / ${els["#ring-sub"].textContent}`);
renderForbidden();
check("Fix #16: forbidden section midday cell shows the Fix #15 window 12:56–13:02",
  els["#forbidden-list"].innerHTML.includes("১২:৫৬") && els["#forbidden-list"].innerHTML.includes("১:০২") && !els["#forbidden-list"].innerHTML.includes("১২:৫০"),
  els["#forbidden-list"].innerHTML.slice(0, 220));
globalThis.Date = RealDate16; settings.tzName = _tz16;

// ---- Fix #18: dhikr reminder notification arrives but no audio ----
// Cause: Android plays the notification CHANNEL's sound, and once a
// channel is created its sound can never be changed — the old
// dhikr-durood/dhikr-istighfar channels on the user's phone were
// created without a working sound, so every reminder arrived silent.
// (The MP3s themselves are fine: durood 3.72 s / mean −22.1 dB,
// istighfar 6.17 s / mean −23.0 dB — normal audible speech; the
// plugin resolves "durood.mp3" correctly by stripping the extension.)
// Fix: fresh v2 channel IDs in both the native ensureChannels (with
// R.raw.durood/istighfar + HIGH importance) and the JS scheduler,
// and the old channels are deleted. The old IDs must not appear as a
// channelId/createChannel id anywhere in the schedule path.
const _src18 = fs.readFileSync("/home/hatch/workspace/deen-day/www/app.js", "utf8");
const _java18 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmScheduler.java", "utf8");
check("Fix #18: JS schedules durood reminders on the v2 channel with durood.mp3",
  _src18.includes('channelId: "dhikr-durood-v2", sound: "durood.mp3"'), "channelId dhikr-durood-v2");
check("Fix #18: JS schedules istighfar reminders on the v2 channel with istighfar.mp3",
  _src18.includes('channelId: "dhikr-istighfar-v2", sound: "istighfar.mp3"'), "channelId dhikr-istighfar-v2");
check("Fix #18: the old channel IDs are gone from the JS schedule path (exact quoted ids)",
  !/"dhikr-durood"/.test(_src18) && !/"dhikr-istighfar"/.test(_src18), "no old ids in app.js");
check("Fix #18: native creates the v2 channels with the raw sounds + HIGH importance",
  _java18.includes('createChannel(nm, ctx, "dhikr-durood-v2"') && _java18.includes("IMPORTANCE_HIGH, R.raw.durood") &&
  _java18.includes('createChannel(nm, ctx, "dhikr-istighfar-v2"') && _java18.includes("IMPORTANCE_HIGH, R.raw.istighfar"),
  "native v2 channels");
check("Fix #18: native deletes the old (possibly silent) dhikr channels",
  _java18.includes('deleteNotificationChannel("dhikr-durood")') && _java18.includes('deleteNotificationChannel("dhikr-istighfar")'),
  "old channels deleted");

// ---- Fix #11: Asr school follows the region (Malaysia = Shafi'i) ----
const _savedS = {country:settings.country, school:settings.school, schoolExplicit:settings.schoolExplicit, lat:settings.lat, lon:settings.lon, city:settings.city, tzName:settings.tzName, locId:settings.locId, tzLoc:settings.tzLoc, method:settings.method};
settings.country = "Malaysia"; settings.schoolExplicit = false; settings.school = 1;
check("Fix #11: effSchool is Shafi'i (0) in Malaysia even with a saved Hanafi value", effSchool()===0, String(effSchool()));
settings.country = "Bangladesh"; settings.schoolExplicit = false;
check("Fix #11: effSchool is Hanafi (1) in Bangladesh", effSchool()===1, String(effSchool()));
settings.country = "Malaysia"; settings.school = 1; settings.schoolExplicit = true;
check("Fix #11: an explicit Hanafi pick in Malaysia still wins", effSchool()===1, String(effSchool()));
// Local (offline) Ipoh times for 19 Nov 2026 must match the real JAKIM
// times (Fajr 05:42, Asr 16:24, Maghrib 18:58) within 2 minutes.
settings.country = "Malaysia"; settings.city = "Ipoh"; settings.lat = 4.6; settings.lon = 101.07;
settings.tzName = "Asia/Kuala_Lumpur"; settings.locId = "ipoh"; settings.tzLoc = "ipoh";
settings.method = 0; settings.school = 1; settings.schoolExplicit = false;
const t1911 = computeTimingsLocal(new Date(2026, 10, 19));
check("Fix #11: local Ipoh Asr matches real JAKIM Asr 16:24 (±2 min)", t1911 && Math.abs(toMin(t1911.Asr) - 984) <= 2, t1911 ? t1911.Asr : "null");
check("Fix #11: local Ipoh Fajr/Maghrib match real times (±2 min)", t1911 && Math.abs(toMin(t1911.Fajr) - 342) <= 2 && Math.abs(toMin(t1911.Maghrib) - 1138) <= 2, t1911 ? t1911.Fajr + " " + t1911.Maghrib : "null");
// Fix #15: the 3 forbidden windows on the real 19 Nov Ipoh day must
// match the user's stated windows (morning 07:04–07:19, midday
// 12:57–13:03, evening 18:43–18:58) within 2 minutes.
__setTimings(t1911);
const fw19 = forbiddenWindows();
check("Fix #15: real 19 Nov Ipoh windows match the user's 3 windows (±2 min)", fw19.length===3
  && Math.abs(fw19[0].start - 424) <= 2 && Math.abs(fw19[0].end - 439) <= 2
  && Math.abs(fw19[1].start - 777) <= 2 && Math.abs(fw19[1].end - 783) <= 2
  && Math.abs(fw19[2].start - 1123) <= 2 && Math.abs(fw19[2].end - 1138) <= 2,
  fw19.map(w=>`${w.start}–${w.end}`).join(", "));
__setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:00", Asr:"16:24", Maghrib:"18:58", Isha:"20:10", Imsak:"05:32", Firstthird:"22:59", Lastthird:"03:01"});
Object.assign(settings, _savedS);

// ---- Alarm list ----
let list = buildPrayerAlarmList();
check("alarm list has 5 azan + 10 pre-azan by default", list.length===15 && list.filter(a=>a.type==="azan-v2").length===5 && list.filter(a=>a.type==="preazan").length===10, String(list.length));
const fajrAzan = list.find(a=>a.prayerId==="Fajr" && a.type==="azan-v2");
const fajrPres = list.filter(a=>a.prayerId==="Fajr" && a.type==="preazan");
const fajrDiffs = fajrPres.map(a=>(fajrAzan.at - a.at + 86400000) % 86400000);
check("pre-azan is twice: 5 and 2 min before azan", fajrAzan && fajrPres.length===2 && fajrDiffs.includes(300000) && fajrDiffs.includes(120000));
check("pre-azan ids 31–35 and 51–55", list.filter(a=>a.type==="preazan").map(a=>a.id).sort((x,y)=>x-y).join(",")==="31,32,33,34,35,51,52,53,54,55");
check("no tahajjud alarm when its toggle is off", !list.some(a=>a.type==="tahajjud"));
settings.alarmOn.Tahajjud = true; settings.alarmOn.Sehri = true; settings.alarmOn.Iftar = true; settings.alarmOn.Duha = true;
list = buildPrayerAlarmList();
check("tahajjud alarm appears when on (notification only, no azan)", list.some(a=>a.type==="tahajjud" && a.sound==="none"));
check("sehri + iftar alarms appear when on", list.some(a=>a.type==="sehri") && list.some(a=>a.type==="iftar"));
check("duha alarm appears when on (sunrise+15)", list.some(a=>a.type==="duha"));
settings.alarmOn.Tahajjud = false; settings.alarmOn.Sehri = false; settings.alarmOn.Iftar = false; settings.alarmOn.Duha = false;

// ---- Prayer list + ring ----
renderPrayers();
const pl = els["#prayer-list"].innerHTML;
check("prayer list has 5 fard rows, no Sunrise row", (pl.match(/prayer-row/g)||[]).length===5 && !pl.includes("Sunrise") && !pl.includes("সূর্যোদয়"));
check("prayer rows carry icons", pl.includes("🌅") && pl.includes("🌙"));
check("ring countdown text is set", els["#ring-count"].textContent.length > 0, els["#ring-count"].textContent);
check("ring name is set", els["#ring-name"].textContent.length > 0, els["#ring-name"].textContent);

// ---- Detail page (slider) ----
openPrayerDetail("Fajr");
check("detail draft opens with current offset 0", getDetailDraft() && getDetailDraft().offset===0 && getDetailId()==="Fajr");
getDetailDraft().offset = 0; updateDetailTime();
check("offset 0 shows 'Exact time'", els["#detail-exact"].textContent === "Exact time", els["#detail-exact"].textContent);
getDetailDraft().offset = 5; updateDetailTime();
check("offset +5 changes the set time to 5:47", els["#detail-time"].textContent.includes("৫:৪৭"), els["#detail-time"].textContent);
check("ALARM_SOUNDS has 6 options incl. notification and name", ALARM_SOUNDS.length===6 && ALARM_SOUNDS.some(s=>s.id==="azan") && ALARM_SOUNDS.some(s=>s.id==="silent") && ALARM_SOUNDS.some(s=>s.id==="name") && ALARM_SOUNDS.some(s=>s.id==="notification"));

// ---- Alarm page + calendar ----
renderAlarmPage();
check("alarm page renders 5 fard rows", (els["#alarm-fard"].innerHTML.match(/prayer-row/g)||[]).length === 5);
settings.useCoords = true; settings.lat = 4.6; settings.lon = 101.07; settings.city = "Ipoh"; settings.country = "Malaysia";
renderCalendarPage();
check("calendar renders day cards", (els["#cal-days"].innerHTML.match(/cal-card/g)||[]).length >= 7);
check("calendar card shows prayer lines", els["#cal-days"].innerHTML.includes("ফজর") || els["#cal-days"].innerHTML.includes("Fajr"));

// ---- Fasting hadiths ----
check("FASTING_HADITHS has 4 verified entries", FASTING_HADITHS.length===4 && FASTING_HADITHS.every(h=>h.ar && h.bn && h.ref));
renderFastHadith();
check("fasting hadith card renders", els["#fast-hadith"].innerHTML.length > 20);
renderFastSchedule();
check("fasting schedule renders Sehri + Iftar lines", els["#fast-schedule"].innerHTML.includes("সাহরি") || els["#fast-schedule"].innerHTML.includes("Sehri"));

// ---- No double scheduling ----
const initBody = src.slice(src.indexOf("async function initPrayers()"), src.indexOf("async function initPrayers()")+700);
check("initPrayers calls syncPrayerAlarms only (no scheduleNativeAzan call)", initBody.includes("syncPrayerAlarms();") && !initBody.includes("scheduleNativeAzan();"));

// ---- HTML structure + service worker ----
check("HTML has ring hero", html.includes("ring-hero") && html.includes("ring-fg") && html.includes("ring-count"));
check("HTML has alarm + detail + calendar views", html.includes('id="view-alarm"') && html.includes('id="view-prayer-detail"') && html.includes('id="view-calendar"'));
check("HTML has detail slider −30..+30 step 1", html.includes('id="detail-slider"') && html.includes('min="-30"') && html.includes('max="30"') && html.includes('step="1"'));
check("HTML has istighfar audio element", html.includes('id="audio-istighfar"') && html.includes("audio/istighfar.mp3"));
check("HTML has share button", html.includes('id="btn-share"'));
check("sw.js cache v20 + istighfar cached", sw.includes("my-deen-v20") && sw.includes("audio/istighfar.mp3"));
check("no ads anywhere in source", !src.includes("admob") && !src.includes("AdMob") && !src.includes("adsbygoogle"));

// ---- Fix #5: manual location removed, profile form hides after save ----
check("no manual location UI in HTML",
  !html.includes("loc-manual-form") && !html.includes("btn-loc-manual-toggle") && !html.includes("btn-loc-save") &&
  !html.includes('id="set-city"') && !html.includes('id="set-country"') && !html.includes("loc-city-in") && !html.includes("loc-country-in"));
check("profile form + saved row exist in HTML", html.includes('id="profile-form"') && html.includes('id="profile-saved"') && html.includes('id="profile-saved-name"'));
check("no manual-location references left in app.js",
  !src.includes('"#set-city"') && !src.includes('"#set-country"') && !src.includes('"#loc-manual-form"') &&
  !src.includes('"#loc-city-in"') && !src.includes('"#btn-loc-save"') && !src.includes('"#btn-loc-manual-toggle"'));
check("no manual-location wording left in app.js",
  !src.includes("শহরের নাম লিখে ম্যানুয়ালি") && !src.includes("or type your city in Settings") && !src.includes("নিচের শহর ব্যবহার হবে") && !src.includes("the city below is used"));
check("loc-setup modal keeps GPS + Later only",
  html.includes('id="btn-loc-allow"') && html.includes('id="btn-loc-close"'));

// ---- Fix #5 (part 2) rewritten by Fix #31: − / + stepper, 1 min per tap ----
check("clampDhikrMin: 30→30, 0→1, 61→60, 10→10",
  typeof clampDhikrMin === "function" && clampDhikrMin(30)===30 && clampDhikrMin(0)===1 && clampDhikrMin(61)===60 && clampDhikrMin(10)===10);
settings.duroodRemOn = true; settings.duroodRemMin = 30; settings.astaghRemOn = true; settings.astaghRemMin = 30;
renderReminderSettings();
const remHtml = els["#reminder-settings"].innerHTML;
check("Fix #31: durood reminder has − / + buttons and the interval number, no slider",
  remHtml.includes('data-rem-step="durood:-1"') && remHtml.includes('data-rem-step="durood:+1"') &&
  remHtml.includes("৩০") && !remHtml.includes('data-rem-slider=') && !remHtml.includes('type="range"') &&
  !remHtml.includes("আগে") && !remHtml.includes("সঠিক সময়"));
check("Fix #31: no fixed chips any more (neither reminder)", !remHtml.includes('data-rem-min='));
check("Fix #28 rewritten by Fix #31: astaghfirullah reminder has the same − / + stepper as durood",
  remHtml.includes('data-rem-step="astagh:-1"') && remHtml.includes('data-rem-step="astagh:+1"'));
settings.duroodRemMin = 35; renderReminderSettings();
check("Fix #31: the big number follows the saved interval (35 min)",
  els["#reminder-settings"].innerHTML.includes("৩৫") && !els["#reminder-settings"].innerHTML.includes('data-rem-slider='));
settings.duroodRemMin = 30;

// ---- Fix #6: home matches the reference design (no ads) ----
check("countdown ring hero is in the home HTML",
  html.includes('id="ring-hero"') && html.includes('id="ring-name"') && html.includes('id="ring-count"') && html.includes('id="ring-sub"') && html.includes('id="pill-loc"') && html.includes('id="pill-sun"'));
check("home has Alarm | Calendar buttons",
  html.includes('id="btn-home-alarm"') && html.includes('id="btn-home-calendar"') && html.includes("অ্যালার্ম") && html.includes("ক্যালেন্ডার"));
check("home has Top Features section (tracker, quran, qibla, ruqyah)",
  html.includes("টপ ফিচার") && html.includes('id="feat-tracker"') && html.includes('id="feat-tracker-ring"') && html.includes('id="feat-quran"') && html.includes('id="feat-qibla"') && html.includes('id="feat-ruqyah"') && html.includes('id="btn-more-features"'));
check("no home manual-location button left",
  !html.includes("btn-home-manual-loc") && !html.includes("ম্যানুয়ালি শহর সেট করুন"));
check("home nav + feature styles exist",
  css.includes(".home-nav-row") && css.includes(".home-nav-btn") && css.includes(".feat-grid") && css.includes(".feat-ring"));
check("no ad code anywhere in the app",
  !src.includes("adsbygoogle") && !src.includes("AdMob") && !html.includes("adsbygoogle") && !html.includes("AdMob"));
renderTracker();
check("feat tracker ring shows today's prayer %",
  els["#feat-tracker-ring"].textContent === "০%");

// ---- Fix #7: home rebuilt exactly like the reference (no ads) ----
const homeOrder = ["home-top","ring-hero","prayer-list","btn-home-alarm","feat-tilawat","forbid-section","nafl-rows","nafl-strip","btn-go-fasting"];
check("home sections are in the reference order",
  homeOrder.every((id,i)=> i===0 || html.indexOf(id) > html.indexOf(homeOrder[i-1])));
check("home date row has Hijri + Gregorian + share + bell",
  html.includes('id="home-date-hijri"') && html.includes('id="home-date-greg"') && html.includes('id="btn-home-share"') && html.includes('id="btn-home-notif"') && html.includes('id="home-notif-badge"'));
check("home has all 8 feature tiles",
  ["feat-tracker","feat-quran","feat-qibla","feat-ruqyah","feat-tilawat","feat-tafsir","feat-names","feat-tasbih"].every(id=>html.includes(`id="${id}"`)));
check("old home pieces are gone (location card, tracker cards, bottom alarm row)",
  !html.includes('id="home-loc-text"') && !html.includes('id="btn-home-detect-loc"') && !html.includes('id="quran-tracker-card"') && !html.includes('id="h-tracker"') && !html.includes('id="btn-go-alarm"') && !html.includes("আজকের নামাজের সময়"));
check("forbidden + nafl sections are unwrapped with red title",
  html.includes('id="forbid-section"') && html.includes('forbid-title') && html.includes('id="nafl-section"'));
check("ring is full-bleed with dark arc + dark text on light skies",
  css.includes("#view-home .ring-hero") && css.includes('.ring-hero[data-sky="day"] .ring-fg'));
check("prayer rows use 24h ranges + done circles, no old azan lines",
  src.includes("done-circle") && src.includes('class="p-range"') && !src.includes('class="dotbtn" data-pray') && src.includes("num(timings[pid])"));
check("header hides on home",
  src.includes("hdr.style.display") && src.includes('v === "home" ? "none"'));
check("renderTracker guards the removed tracker card",
  src.includes("if (!box) return;"));

// ---- Fix #8: pre-azan twice (5 + 2 min before), exact texts, no hurry ----
check("pre-azan texts are the user's exact words",
  PREAZAN_TEXTS.Fajr === "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
  PREAZAN_TEXTS.Dhuhr === "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
  PREAZAN_TEXTS.Asr === "আসরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
  PREAZAN_TEXTS.Maghrib === "মাগরিবের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
  PREAZAN_TEXTS.Isha === "ইশার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন");
check("tahajjud text is the user's exact words",
  TAHAJJUD_TEXT === "তাহাজ্জুদের সময় হয়েছে, উঠে নামাজের প্রস্তুতি নিন");
check("no hurry/check wording left anywhere in the app",
  !src.includes("তাড়াতাড়ি") && !src.includes("নামাজ পড়েছো কিনা") && !src.includes("CHECK_IDS") && !src.includes("HURRY_IDS") && !src.includes("prayer_check") && !src.includes("scheduleNativeAzanChecks"));
// buildPrayerAlarmList: 2 pre-azan entries per prayer, 5 and 2 min before the azan
__setTimings({Fajr:"05:42", Dhuhr:"13:04", Asr:"16:24", Maghrib:"18:58", Isha:"20:11", Sunrise:"07:03", Sunset:"18:58", Imsak:"05:32", Lastthird:"02:03"});
settings.alarmOn = {...settings.alarmOn, Fajr:true, Dhuhr:true, Asr:true, Maghrib:true, Isha:true, Tahajjud:true, Sehri:false, Iftar:false, Duha:false};
const alarmList = buildPrayerAlarmList();
const preList = alarmList.filter(a=>a.type==="preazan");
check("each prayer gets two pre-azan reminders (5 min + 2 min before)",
  preList.length === 10 && ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(pid=>{
    const az = alarmList.find(a=>a.type==="azan-v2" && a.prayerId===pid);
    const pres = preList.filter(a=>a.prayerId===pid);
    if (!az || pres.length!==2) return false;
    const diffs = pres.map(a=>(az.at - a.at + 86400000) % 86400000);
    return diffs.includes(5*60000) && diffs.includes(2*60000) &&
      pres.every(a=>a.body===PREAZAN_TEXTS[pid] && a.sound==="none");
  }));
check("pre-azan ids are 31-35 (2 min) and 51-55 (5 min)",
  preList.map(a=>a.id).sort((x,y)=>x-y).join(",") === [...PREAZAN_IDS, ...PREAZAN5_IDS].sort((x,y)=>x-y).join(","));
check("tahajjud is a single silent notification, no azan",
  alarmList.filter(a=>a.type==="tahajjud").length===1 &&
  alarmList.find(a=>a.type==="tahajjud").body===TAHAJJUD_TEXT &&
  alarmList.find(a=>a.type==="tahajjud").sound==="none");
check("old daily check/hurry repeats are cancelled once on sync",
  src.includes("cancelLegacyCheckReminders") && src.includes("legacy_check_cancelled"));

// ---- Fix #10: multi-select alarm sound (name permanent + one extra, max 2) ----
check("normalizeSounds keeps old choice next to permanent name",
  JSON.stringify(normalizeSounds("notification"))===JSON.stringify(["name","notification"]) &&
  JSON.stringify(normalizeSounds("azan"))===JSON.stringify(["name","azan"]) &&
  JSON.stringify(normalizeSounds("silent"))===JSON.stringify(["silent"]) &&
  JSON.stringify(normalizeSounds(["azan","notification"]))===JSON.stringify(["name","azan"]) &&
  JSON.stringify(normalizeSounds("name"))===JSON.stringify(["name"]));
settings.alarmSound.Sehri = "notification"; // simulate an older saved value
migrateAlarmSounds();
check("older saved notification sound migrates to name + notification",
  JSON.stringify(settings.alarmSound.Sehri)===JSON.stringify(["name","notification"]));
openPrayerDetail("Fajr");
check("detail draft starts with name only",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name"]));
toggleDetailSound("azan");
check("adding azan gives name + azan",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name","azan"]));
toggleDetailSound("notification");
check("a third sound is refused (max 2 together)",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name","azan"]));
toggleDetailSound("azan");
check("tapping a selected extra removes it, name stays",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name"]));
toggleDetailSound("name");
check("name cannot be turned off (permanent default)",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name"]));
toggleDetailSound("silent");
check("silent stands alone",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["silent"]));
toggleDetailSound("azan");
check("picking another sound clears silent",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name","azan"]));
settings.alarmSound.Fajr = ["name","azan"];
const azanSoundList = buildPrayerAlarmList();
check("name + azan plays the azan sound",
  azanSoundList.find(a=>a.type==="azan-v2" && a.prayerId==="Fajr").sound==="azan");
settings.alarmSound.Fajr = ["name","notification"];
const notifSoundList = buildPrayerAlarmList();
check("name + notification plays the notification sound",
  notifSoundList.find(a=>a.type==="azan-v2" && a.prayerId==="Fajr").sound==="reminder");
settings.alarmSound.Fajr = ["silent"];
const silentSoundList = buildPrayerAlarmList();
check("silent alone plays no sound",
  silentSoundList.find(a=>a.type==="azan-v2" && a.prayerId==="Fajr").sound==="none");
settings.alarmSound.Fajr = ["name"];
settings.alarmOn = {...settings.alarmOn, Fajr:false, Dhuhr:false, Asr:false, Maghrib:false, Isha:false, Tahajjud:false, Sehri:false, Iftar:false, Duha:false};
const alarmListOff = buildPrayerAlarmList();
check("pre-azan stays on even when every prayer alarm is off",
  alarmListOff.filter(a=>a.type==="preazan").length===10 &&
  alarmListOff.filter(a=>a.type==="azan-v2").length===0 &&
  ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(pid=>alarmListOff.filter(a=>a.type==="preazan" && a.prayerId===pid).length===2));
settings.alarmOn = {...settings.alarmOn, Fajr:true, Dhuhr:true, Asr:true, Maghrib:true, Isha:true};

// ---- Fix #12: timezone — device clock vs location timezone ----
// The user's report: location Jashore, Bangladesh; phone clock 18:29
// Malaysia (UTC+8) = 16:29 in Jashore (UTC+6), Asr running, next
// prayer Maghrib — but the app showed "next prayer Isha in 00:06:30"
// because it read the device clock as if it were Jashore's clock.
const _saved12 = {country:settings.country, city:settings.city, lat:settings.lat, lon:settings.lon,
  tzName:settings.tzName, locId:settings.locId, tzLoc:settings.tzLoc, method:settings.method,
  school:settings.school, schoolExplicit:settings.schoolExplicit, timings:__getTimings()};
settings.country = "Bangladesh"; settings.city = "Jashore"; settings.lat = 23.17; settings.lon = 89.2;
settings.tzName = "Asia/Dhaka"; settings.locId = "jashore"; settings.tzLoc = "jashore";
settings.method = 0; settings.school = 1; settings.schoolExplicit = false;
const tJashore = computeTimingsLocal(new Date(2026, 10, 19));
check("Fix #12: local Jashore times match real times (Maghrib 17:17, Isha 18:35)",
  tJashore && tJashore.Maghrib === "17:17" && tJashore.Isha === "18:35", tJashore ? `${tJashore.Maghrib} ${tJashore.Isha}` : "null");
__setTimings(tJashore);
// Device instant: 18:29 in Malaysia = 10:29 UTC = 16:29 in Jashore.
const devInstant = new Date(Date.UTC(2026, 10, 19, 10, 29));
const lnJashore = locNow(devInstant);
check("Fix #12: locNow converts device 18:29 MY to 16:29 Jashore",
  lnJashore.getHours()===16 && lnJashore.getMinutes()===29, `${lnJashore.getHours()}:${lnJashore.getMinutes()}`);
check("Fix #12: next prayer at 16:29 Jashore is Maghrib, not Isha",
  nextPrayer(lnJashore).id === "Maghrib", nextPrayer(lnJashore).id);
const neJashore = nextEvent(lnJashore);
check("Fix #12: at 16:29 Jashore the ring shows Asr (current), counting to 17:17 (Fix #15: Maghrib, the next prayer start)",
  neJashore.kind==="prayer" && neJashore.id==="Asr" && neJashore.state==="current" &&
  neJashore.at.getHours()===17 && neJashore.at.getMinutes()===17, `${neJashore.kind} ${neJashore.id} ${neJashore.at.getHours()}:${neJashore.at.getMinutes()}`);
check("Fix #12: locAbs turns Dhaka wall-clock 17:17 into the absolute instant 11:17 UTC",
  locAbs(new Date(2026, 10, 19, 17, 17)).getTime() === Date.UTC(2026, 10, 19, 11, 17),
  new Date(locAbs(new Date(2026, 10, 19, 17, 17)).getTime()).toISOString());
check("Fix #12: location date follows Jashore (2026-11-19 / 19-11-2026)",
  todayKey(lnJashore) === "2026-11-19" && ddmmyyyy(lnJashore) === "19-11-2026", todayKey(lnJashore));
settings.tzName = "";
check("Fix #12: without a location timezone locNow is the device time",
  locNow(devInstant).getTime() === devInstant.getTime());
settings.tzName = "Asia/Dhaka";
// Native alarms must fire at the absolute instant of the location
// wall-clock time: Maghrib 17:17 Jashore = 19:17 on a Malaysia clock.
const dhakaWall = ms => { const d = new Date(ms + 6*3600000); return [d.getUTCHours(), d.getUTCMinutes()]; };
const maghAzan = buildPrayerAlarmList().find(a=>a.type==="azan-v2" && a.prayerId==="Maghrib");
check("Fix #12: Maghrib alarm fires at 17:17 Jashore wall-clock (absolute instant)",
  maghAzan && dhakaWall(maghAzan.at.getTime()).join(":")==="17:17",
  maghAzan ? dhakaWall(maghAzan.at.getTime()).join(":") : "none");
const maghPres = buildPrayerAlarmList().filter(a=>a.type==="preazan" && a.prayerId==="Maghrib")
  .map(a=>dhakaWall(a.at.getTime()).join(":")).sort();
check("Fix #12: Maghrib pre-azan alarms fire at 17:12 and 17:15 Jashore wall-clock",
  maghPres.join(",")==="17:12,17:15", maghPres.join(","));
// Direct proof for the user's clarification: the RING itself (not just
// the helper functions) must show the current waqt in the location's
// timezone. Fake the device clock to 18:29 Malaysia and render home.
const RealDate = Date;
globalThis.Date = class extends RealDate {
  constructor(...a){ super(...(a.length ? a : [devInstant.getTime()])); }
  static now(){ return devInstant.getTime(); }
};
const _lang12 = settings.lang; settings.lang = "bn";
renderPrayers();
check("Fix #12 ring: at 18:29 MY (= 16:29 Jashore) the ring names Asr",
  els["#ring-name"].textContent === "আসর", els["#ring-name"].textContent);
check("Fix #12 ring: label is 'বর্তমান নামাজ', sub is 'শেষ হতে বাকি', count ০০:৪৮:০০ (Fix #15: Asr to Maghrib 17:17)",
  els["#ring-label"].textContent === "বর্তমান নামাজ" &&
  els["#ring-sub"].textContent === "শেষ হতে বাকি" &&
  els["#ring-count"].textContent === "০০:৪৮:০০",
  `${els["#ring-label"].textContent} / ${els["#ring-sub"].textContent} / ${els["#ring-count"].textContent}`);
check("Fix #12 ring: the next prayer row is Maghrib (orange dot)",
  els["#prayer-list"].innerHTML.includes('class="prayer-row next tappable" data-detail="Maghrib"'));
globalThis.Date = RealDate; settings.lang = _lang12;
Object.assign(settings, {country:_saved12.country, city:_saved12.city, lat:_saved12.lat, lon:_saved12.lon,
  tzName:_saved12.tzName, locId:_saved12.locId, tzLoc:_saved12.tzLoc, method:_saved12.method,
  school:_saved12.school, schoolExplicit:_saved12.schoolExplicit});
__setTimings(_saved12.timings);

// ---- Fix #13: Qibla needle pointed 180° off ----
// The bearing math was already right (Ipoh 291.9° = the Aladhan API's
// 291.90°). The bug was the needle's drawing: it started at the centre
// and stretched DOWNWARD (top:50%, pivot at its top), so its zero
// direction was south — rotate(291.9°) put its long end at
// (180+291.9)%360 = 111.9°, exactly the ~112° the user saw. The fix
// flips the needle to stretch UPWARD from the centre (top:10% +
// height:40% = the centre, pivot at its bottom), so rotate(0) points
// north and rotate(291.9°) points at the Qibla.
check("Fix #13: local bearing Ipoh is 291.9° (matches Aladhan API 291.90°)",
  Math.abs(qiblaBearing(4.5975, 101.0901) - 291.9) < 0.5, qiblaBearing(4.5975, 101.0901).toFixed(1));
check("Fix #13: local bearing Chemor is 291.9°",
  Math.abs(qiblaBearing(4.62, 101.08) - 291.9) < 0.5, qiblaBearing(4.62, 101.08).toFixed(1));
check("Fix #13: local bearing Jashore is 277.8° (API 277.84°)",
  Math.abs(qiblaBearing(23.17, 89.2) - 277.8) < 0.5, qiblaBearing(23.17, 89.2).toFixed(1));
check("Fix #13: cross-check London 119.0°, New York 58.5°",
  Math.abs(qiblaBearing(51.5074, -0.1278) - 119) < 0.5 && Math.abs(qiblaBearing(40.7128, -74.006) - 58.5) < 0.5,
  `${qiblaBearing(51.5074, -0.1278).toFixed(1)} / ${qiblaBearing(40.7128, -74.006).toFixed(1)}`);
// Fix #13 worldwide: the SAME universal great-circle formula, no
// city-specific code — verified against the Aladhan API in 6 cities.
// (Mecca itself is the destination: at the Kaaba the direction is
// undefined, so Jeddah is the meaningful nearby check.)
const WORLD_QIBLA = [
  ["Dhaka", 23.8103, 90.4125, 277.57],
  ["Jeddah", 21.4858, 39.1925, 96.01],
  ["London", 51.5074, -0.1278, 118.99],
  ["New York", 40.7128, -74.0060, 58.48],
  ["Jakarta", -6.2088, 106.8456, 295.15],
  ["Ipoh", 4.5975, 101.0901, 291.90],
];
check("Fix #13 worldwide: local bearing matches the Aladhan API in 6 cities (Dhaka, Jeddah, London, New York, Jakarta, Ipoh)",
  WORLD_QIBLA.every(([n, la, lo, api]) => Math.abs(qiblaBearing(la, lo) - api) < 0.1),
  WORLD_QIBLA.map(([n, la, lo, api]) => `${n} ${qiblaBearing(la, lo).toFixed(2)}°`).join(", "));
const _css13 = fs.readFileSync("/home/hatch/workspace/deen-day/www/styles.css", "utf8");
const _needleRule = (_css13.match(/\.compass \.needle\{[^}]*\}/) || [""])[0];
check("Fix #13: needle extends upward from the centre (top 10%, height 40%, pivot 50% 100%)",
  _needleRule.includes("top:10%") && _needleRule.includes("height:40%") && _needleRule.includes("transform-origin:50% 100%"), _needleRule);
const _rotOf = () => { const m = /rotate\(([-\d.]+)deg\)/.exec(els["#needle"].style.transform || ""); return m ? +m[1] : NaN; };
__setQiblaDeg(291.9); __setHeading(null); updateNeedle();
check("Fix #13: needle rotate is the Qibla bearing from north (291.9°)",
  Math.abs(_rotOf() - 291.9) < 0.001, els["#needle"].style.transform);
__setHeading(90); updateNeedle();
check("Fix #13: with phone facing east (heading 90) the needle rotates to 201.9°",
  Math.abs(_rotOf() - 201.9) < 0.001, els["#needle"].style.transform);
__setHeading(null);

// ---- Fix #12 follow-up: offline timezone from the city table ----
// Coordinates already exist (GPS / older save) but no timezone yet:
// the offline table must still fill it, or locNow() falls back to the
// device clock until the API answers.
const _savedTz = {city:settings.city, country:settings.country, lat:settings.lat, lon:settings.lon,
  tzName:settings.tzName, tzLoc:settings.tzLoc, locId:settings.locId};
settings.city = "Jashore"; settings.country = "Bangladesh"; settings.lat = 23.1664; settings.lon = 89.2081;
settings.tzName = ""; settings.tzLoc = ""; settings.locId = "jashore";
resolveCityCoordsOffline();
check("Fix #12: offline city table fills Asia/Dhaka even with coords already set",
  settings.tzName === "Asia/Dhaka" && settings.tzLoc === "jashore", settings.tzName);
check("Fix #12: existing coordinates are not overwritten by the table",
  settings.lat === 23.1664 && settings.lon === 89.2081, `${settings.lat},${settings.lon}`);
Object.assign(settings, _savedTz);

// ---- Fix #13 follow-up: fetchQibla falls back to the local bearing ----
// (async — the summary waits for these checks)
(async()=>{
  try {
    const _realFetch = globalThis.fetch;
    const _savedQ = {lat:settings.lat, lon:settings.lon, city:settings.city, country:settings.country, locId:settings.locId};
    settings.lat = 51.5074; settings.lon = -0.1278; settings.city = "London"; settings.country = "United Kingdom"; settings.locId = "london";
    globalThis.fetch = async()=>({ok:true, json:async()=>({code:200, data:{direction:291.9}})});
    await fetchQibla();
    check("Fix #13: API direction is used when it answers (291.9)", Math.abs(__getQiblaDeg() - 291.9) < 0.001, String(__getQiblaDeg()));
    globalThis.fetch = async()=>({ok:true, json:async()=>({code:400, data:{}})});
    await fetchQibla();
    check("Fix #13: API error payload falls back to the local bearing (London 119.0°)", Math.abs(__getQiblaDeg() - 119) < 0.5, String(__getQiblaDeg()));
    globalThis.fetch = async()=>{ throw new Error("network down"); };
    await fetchQibla();
    check("Fix #13: network failure falls back to the local bearing", Math.abs(__getQiblaDeg() - 119) < 0.5, String(__getQiblaDeg()));
    globalThis.fetch = _realFetch;
    Object.assign(settings, _savedQ);

    // ---- Fix #19: azan never rang at Maghrib on the fresh install ----
    // The exact-alarm permission was missing, so every alarm was
    // silently skipped and the app never said so. Now the sync result
    // is recorded, the status is shown (banner + Alarm page), and
    // alarms re-sync on foreground.
    const _mockPA = (sched, status) => {
      globalThis.Capacitor = { Plugins: {
        PrayerAlarm: {
          scheduleAlarms: async()=>sched,
          getStatus: async()=>status,
          requestPermissions: async()=>({notifications:true, exactAlarm:true}),
        },
        LocalNotifications: { cancel: async()=>({}), requestPermissions: async()=>({display:"granted"}) },
      }};
    };
    const RealDate19 = Date;
    const _tz19 = settings.tzName; settings.tzName = "";
    _mockPA({scheduled:0, skipped:5}, {notificationsGranted:false, exactAlarmGranted:false, alarmsScheduled:0});
    await syncPrayerAlarms(); await refreshAlarmStatus();
    check("Fix #19: skipped alarms are recorded and the Home warning banner shows",
      __getAlarmStatus().skipped === 5 && els["#alarm-warn"].hidden === false && els["#alarm-warn"].innerHTML.includes("আজানের অ্যালার্ম সেট হয়নি"),
      els["#alarm-warn"].innerHTML.slice(0, 80));
    _mockPA({scheduled:35, skipped:0}, {notificationsGranted:true, exactAlarmGranted:true, alarmsScheduled:35});
    const t19 = new Date(); t19.setHours(17,0,0,0);
    globalThis.Date = class extends RealDate19 {
      constructor(...a){ super(...(a.length ? a : [t19.getTime()])); }
      static now(){ return t19.getTime(); }
    };
    await syncPrayerAlarms(); await refreshAlarmStatus();
    check("Fix #19: when all alarms are armed the banner hides and the status shows the next azan (Maghrib)",
      __getAlarmStatus().skipped === 0 && els["#alarm-warn"].hidden === true && els["#alarm-status"].innerHTML.includes("মাগরিব"),
      els["#alarm-status"].innerHTML.slice(0, 100));
    globalThis.Date = RealDate19; settings.tzName = _tz19;
    delete globalThis.Capacitor;
    check("Fix #19: foreground re-syncs alarms (visibilitychange handler calls syncPrayerAlarms + refreshAlarmStatus)",
      /visibilitychange[\s\S]{0,200}syncPrayerAlarms\(\); refreshAlarmStatus\(\)/.test(src), "foreground resync");
    check("Fix #19: native stores only armed alarms (getStatus count is honest)",
      fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/PrayerAlarmPlugin.java", "utf8").includes("if (AlarmScheduler.schedule(getContext(), a)) { scheduled++; next.put(a); }"),
      "store armed only");

    // ---- Fix #20: two-step verification — EVERY feature/option checked ----
    // Salah tracker: mark one prayer, the ring shows 20%; unmark, back to 0%.
    togglePrayer("Fajr");
    check("Fix #20: salah tracker marks Fajr prayed and the ring shows 20%",
      isDone("Fajr") && els["#feat-tracker-ring"].textContent === "২০%", els["#feat-tracker-ring"].textContent);
    togglePrayer("Fajr");
    check("Fix #20: salah tracker unmarks Fajr and the ring shows 0%",
      !isDone("Fajr") && els["#feat-tracker-ring"].textContent === "০%", els["#feat-tracker-ring"].textContent);
    // Tasbih: 3 taps → count 3, bar ~9% of the 33 target.
    tapTasbih(); tapTasbih(); tapTasbih(); renderTasbih();
    check("Fix #20: tasbih counts 3 taps and the bar fills ~9% of target 33",
      __getTasbihCount() === 3 && els["#tasbih-count"].textContent === "৩" &&
      parseFloat(els["#tasbih-bar"].style.width) > 9 && parseFloat(els["#tasbih-bar"].style.width) < 9.1,
      els["#tasbih-bar"].style.width);
    // Duas: real bundled data renders; category filter narrows it.
    renderDuaCats(); renderDuas();
    const _duaAll = (els["#dua-list"].innerHTML.match(/class="dua"/g) || []).length;
    const _cat0 = globalThis.DUA_CATS.find(c=>c.id !== "all" && c.id !== "saved").id;
    __setDuaCat(_cat0); renderDuas();
    const _duaCat = (els["#dua-list"].innerHTML.match(/class="dua"/g) || []).length;
    __setDuaCat("all");
    check("Fix #20: duas render from bundled data and the category filter narrows them",
      globalThis.DUAS.length >= 10 && globalThis.DUA_CATS.length >= 4 &&
      _duaAll === globalThis.DUAS.length && _duaCat > 0 && _duaCat < _duaAll,
      `${_duaAll} all, ${_duaCat} in ${_cat0}`);
    // Quran: bundled 114-surah meta (offline) renders; search works; a failed
    // list shows a retry button, never a misleading empty list.
    check("Fix #20: bundled Quran meta is complete (114 surahs, offline)",
      validSurahMeta(window.QURAN_META) && window.QURAN_META.length === 114, String(window.QURAN_META.length));
    renderSurahList();
    check("Fix #20: Quran list renders all 114 surahs",
      (els["#surah-list"].innerHTML.match(/data-surah="/g) || []).length === 114, "114 rows");
    renderSurahList("fatiha");
    check("Fix #20: Quran search finds Al-Faatiha (common spelling)",
      (els["#surah-list"].innerHTML.match(/data-surah="/g) || []).length === 1, "1 row");
    renderSurahList("faatiha");
    check("Fix #21: Quran search still finds Al-Faatiha with the original spelling",
      (els["#surah-list"].innerHTML.match(/data-surah="/g) || []).length === 1, "1 row");
    renderSurahList("baqara");
    check("Fix #21: Quran search finds Al-Baqara",
      (els["#surah-list"].innerHTML.match(/data-surah="/g) || []).length === 1, "1 row");
    __setSurahMeta(null); renderSurahList();
    check("Fix #20: a missing surah list shows a retry button, not an empty list",
      els["#surah-list"].innerHTML.includes("btn-retry-surah"), "retry shown");
    __setSurahMeta(window.QURAN_META);
    // Quran progress: marking Al-Faatiha read counts its 7 ayahs of 6236.
    toggleSurahRead(1);
    check("Fix #20: Quran progress counts Al-Faatiha's 7 ayahs of 6236",
      quranAyahsRead() === 7 && els["#quran-progress-detail"].textContent.includes("৭") &&
      els["#quran-progress-detail"].textContent.includes("৬২৩৬"),
      els["#quran-progress-detail"].textContent);
    toggleSurahRead(1);
    // Bengali dates (pure local calc): 14 Apr 2026 = 1 Boishakh 1433,
    // 19 Nov 2026 = 5 Ogrohayon 1433. Home dates render with a "…" Hijri
    // placeholder when the Hijri info has not loaded yet.
    const _bd1 = banglaDate(new Date(2026, 3, 14)), _bd2 = banglaDate(new Date(2026, 10, 19));
    check("Fix #20: Bangla dates are correct (14 Apr 2026 = 1 Boishakh 1433; 19 Nov 2026 = 5 Ogrohayon 1433)",
      _bd1.day === 1 && _bd1.month === 0 && _bd1.year === 1433 && _bd2.day === 5 && _bd2.month === 7 && _bd2.year === 1433,
      `${_bd1.text} / ${_bd2.text}`);
    renderDates();
    check("Fix #20: home dates render (Gregorian shown, Hijri '…' until it loads)",
      els["#date-line"].innerHTML.includes("নভেম্বর") && els["#date-line"].innerHTML.includes("…"), "dates ok");
    // In-app azan: silent at 18:57, fires exactly once at the 18:58 Maghrib minute.
    // ($() creates the stub element on demand — els["#audio-azan"] alone is undefined.)
    __$("#audio-azan").play = ()=>Promise.resolve();
    const RealDate20 = Date;
    const _tz20 = settings.tzName; settings.tzName = "";
    let t20 = new Date(); t20.setHours(18, 57, 0, 0);
    globalThis.Date = class extends RealDate20 {
      constructor(...a){ super(...(a.length ? a : [t20.getTime()])); }
      static now(){ return t20.getTime(); }
    };
    checkAzan();
    check("Fix #20: in-app azan does NOT fire one minute before Maghrib",
      Object.keys(__getRungToday()).length === 0, "no ring at 18:57");
    t20 = new Date(); t20.setHours(18, 58, 0, 0);
    checkAzan();
    check("Fix #20: in-app azan fires exactly once at the Maghrib minute (18:58)",
      Object.keys(__getRungToday()).length === 1 && Object.keys(__getRungToday())[0].endsWith("Maghrib"),
      Object.keys(__getRungToday()).join(","));
    globalThis.Date = RealDate20; settings.tzName = _tz20;
    // Alarm list extras: Sehri / Iftar / Tahajjud / Duha entries appear only
    // when their toggle is on.
    const _al0 = buildPrayerAlarmList().map(a=>a.id);
    check("Fix #20: Sehri/Iftar/Tahajjud/Duha alarms are OFF by default",
      !_al0.includes(SEHRI_ID) && !_al0.includes(IFTAR_ID) && !_al0.includes(TAHAJJUD_ID) && !_al0.includes(DUHA_ID), "off");
    settings.alarmOn.Sehri = true; settings.alarmOn.Iftar = true;
    settings.alarmOn.Tahajjud = true; settings.alarmOn.Duha = true;
    const _al1 = buildPrayerAlarmList().map(a=>a.id);
    check("Fix #20: Sehri/Iftar/Tahajjud/Duha alarms appear when switched on",
      _al1.includes(SEHRI_ID) && _al1.includes(IFTAR_ID) && _al1.includes(TAHAJJUD_ID) && _al1.includes(DUHA_ID), "on");
    settings.alarmOn.Sehri = false; settings.alarmOn.Iftar = false;
    settings.alarmOn.Tahajjud = false; settings.alarmOn.Duha = false;
    // Calculation method: Malaysia auto-picks JAKIM (17); an explicit pick wins.
    const _savedM = {country: settings.country, method: settings.method};
    settings.country = "Malaysia"; settings.method = 0;
    check("Fix #20: method auto-picks JAKIM (17) for Malaysia", effMethod() === 17, String(effMethod()));
    settings.method = 1;
    check("Fix #20: an explicit calculation method wins over auto", effMethod() === 1, String(effMethod()));
    Object.assign(settings, _savedM);
    // Settings round-trip: save → storage holds it; fillSettings shows it.
    // (The harness localStorage lacks removeItem, so the app uses its
    // in-memory LS fallback — read back through store, which prefixes "dd_".)
    settings.tasbihTarget = 99; saveSettings();
    check("Fix #20: settings save to storage",
      (store.get("settings", {}) || {}).tasbihTarget === 99, "saved 99");
    settings.tasbihTarget = 33; saveSettings();
    fillSettings();
    check("Fix #20: settings page shows the saved values",
      els["#set-azan"].checked === true && els["#set-profile-name"].value === (settings.profileName || ""), "shown");
    // Notification badge: hidden once today's feed is seen, shown otherwise.
    store.set("notif_seen", todayKey()); updateNotifBadge();
    check("Fix #20: notification badge hides after today's feed is seen",
      els["#notif-badge"].classList.contains("hidden") === true, "hidden");
    store.set("notif_seen", ""); updateNotifBadge();
    check("Fix #20: notification badge shows when today's feed is unseen",
      els["#notif-badge"].classList.contains("hidden") === false, "shown");
    // Structure: every view and every settings control exists; no ad SDK.
    const _views = ["home","notif","quran","reader","tasbih","duas","learn","ruqyah","qibla","fasting","alarm","prayer-detail","calendar","settings","privacy"];
    check("Fix #20: all 15 views exist in the app",
      _views.every(v=>html.includes(`id="view-${v}"`)), `${_views.length} views`);
    const _sets = ["set-adhan","set-azan","set-daily","set-dark","set-durood","set-lang","set-method","set-notif","set-profile-gmail","set-profile-name","set-reciter","set-school"]; // Fix #29: set-autoloc is gone (Auto Location lives in one place — the home 📍 pill → location setup modal)
    check("Fix #20: all 12 settings controls exist",
      _sets.every(s=>html.includes(`id="${s}"`)), `${_sets.length} controls`);
    check("Fix #20: ruqyah + privacy views exist",
      html.includes('id="view-ruqyah"') && html.includes('id="view-privacy"'), "present");
    check("Fix #20: no ad SDK anywhere in the code (no ads, ever)",
      !/admob|adsense|googlesyndication|audience-network/i.test(src), "clean");
    check("Fix #20: Quran has 6236 ayahs total", TOTAL_AYAH === 6236, String(TOTAL_AYAH));

    // ---- Fix #22: forbidden windows — zero padding, exact real times ----
    // His phone (build-11) shows the OLD padded windows: evening magh-25
    // (10 min early), midday dhuhr-10 (6 min early). The staged code must
    // have NO padding at all — the window starts at its real time, not one
    // minute before. Real Ipoh times today (Aladhan API, JAKIM 17):
    // Sunrise 07:04, Dhuhr 13:01, Maghrib 18:58 → correct windows
    // 07:04–07:19, 12:57–13:03 (6 min), 18:43–18:58.
    const fw22 = forbiddenWindows();
    const toMin22 = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const _tm22 = __getTimings();
    const sr22 = toMin22(_tm22.Sunrise), dh22 = toMin22(_tm22.Dhuhr), mg22 = toMin22(_tm22.Maghrib);
    check("Fix #22: morning window starts EXACTLY at sunrise, not one minute early",
      fw22[0].start === sr22 && fw22[0].end === sr22 + 15, `${fw22[0].start}–${fw22[0].end} vs sunrise ${sr22}`);
    check("Fix #22: midday window is exactly 6 minutes (dhuhr-4 to dhuhr+2)",
      fw22[1].start === dh22 - 4 && fw22[1].end === dh22 + 2 && fw22[1].end - fw22[1].start === 6,
      `${fw22[1].start}–${fw22[1].end}`);
    check("Fix #22: evening window starts EXACTLY 15 min before Maghrib, not 25",
      fw22[2].start === mg22 - 15 && fw22[2].end === mg22, `${fw22[2].start}–${fw22[2].end} vs maghrib ${mg22}`);
    check("Fix #22: no old padding left in the code (evening was magh-25, midday dhuhr-10)",
      !src.includes("start:magh-25") && !src.includes("start:dhuhr-10"), "old padding gone");

    // ---- Fix #23: manifest receivers must be exported (system broadcasts) ----
    // Root cause found by the Maghrib+Isha investigation: USER_PRESENT and
    // BOOT_COMPLETED come from the system (another uid). With exported=false
    // Android never delivers them — so the unlock durood NEVER played (the
    // real cause of Fix #5 issue 4, wrongly blamed on phone settings) and
    // alarms were NEVER re-armed after a reboot. AlarmReceiver stays
    // unexported: it only fires from the app's own explicit PendingIntent.
    const _mf = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/AndroidManifest.xml", "utf8");
    check("Fix #23: DuroodUnlockReceiver is exported (USER_PRESENT is a system broadcast)",
      /<receiver android:name="\.DuroodUnlockReceiver" android:exported="true">/.test(_mf), "exported=true");
    check("Fix #23: BootReceiver is exported (BOOT_COMPLETED is a system broadcast)",
      /<receiver android:name="\.BootReceiver" android:exported="true">/.test(_mf), "exported=true");
    check("Fix #23: AlarmReceiver stays NOT exported (only the app's own PendingIntent fires it)",
      /<receiver android:name="\.AlarmReceiver" android:exported="false" \/>/.test(_mf), "exported=false");
    check("Fix #23: both system-broadcast intent filters are still present",
      _mf.includes("android.intent.action.USER_PRESENT") && _mf.includes("android.intent.action.BOOT_COMPLETED"), "filters ok");

    // ---- Fix #24: azan channel re-created as azan-v2 (silent-channel repair) ----
    // Symptom (20:43): notifications arrive but NO audio at all — azan sound
    // never plays, exactly like the dhikr channels in Fix #18. The code
    // creates "azan" with R.raw.azan, but a channel's sound can never be
    // changed once created, so a broken/silent channel stays silent. Same
    // repair as Fix #18: fresh channel ID, delete the old one. The alarm
    // list's type IS the channel (AlarmReceiver posts on type), so the
    // type, the JS createChannel and the native ensureChannels all move
    // together; the receiver also maps a stale stored "azan" type to v2.
    const _as = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmScheduler.java", "utf8");
    const _ar = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmReceiver.java", "utf8");
    check("Fix #24: azan alarm entries post on channel azan-v2",
      buildPrayerAlarmList().filter(a=>a.type==="azan-v2").length===5, "5 v2 azan entries");
    check("Fix #24: JS creates the azan-v2 channel with the azan sound",
      src.includes('createChannel({ id: "azan-v2"') && src.includes('sound: "azan.mp3"'), "v2 channel");
    check("Fix #24: no azan entry still uses the old channel",
      !src.includes('type: "azan"') && !src.includes('createChannel({ id: "azan",'), "old channel gone");
    check("Fix #24: next-azan status reads the v2 entries",
      src.includes('a.type==="azan-v2"'), "nextAzanInfo v2");
    check("Fix #24: native ensureChannels creates azan-v2 with R.raw.azan and deletes the old azan channel",
      _as.includes('createChannel(nm, ctx, "azan-v2"') && _as.includes("R.raw.azan") && _as.includes('deleteNotificationChannel("azan")'), "native v2");
    check("Fix #24: AlarmReceiver maps a stale stored 'azan' type to azan-v2",
      _ar.includes('if (type.equals("azan")) type = "azan-v2"'), "stale mapping");

    // ---- Fix #25 rewritten by Fix #32: direct system permission requests ----
    // The user (21:59) rejected the 4-step in-app modal (ধাপ 1/4, dots,
    // "এড়িয়ে যান / পরে করব"). The app now asks for each permission
    // directly, the way normal apps do: the phone's own dialog for
    // notifications/battery, the phone's own Settings page for exact
    // alarms/autostart (those two can ONLY be a toggle on a system page).
    // The plugin mechanism (requestStep, batteryExempt, manifest) is
    // unchanged — only the in-app modal UI is gone.
    const _idx = fs.readFileSync("/home/hatch/workspace/deen-day/www/index.html", "utf8");
    const _pa = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/PrayerAlarmPlugin.java", "utf8");
    const _css = fs.readFileSync("/home/hatch/workspace/deen-day/www/styles.css", "utf8");
    check("Fix #32: the onboarding modal is fully gone (HTML, JS, CSS)",
      !_idx.includes('id="perm-onboard"') && !_idx.includes("অ্যাপ চালুর আগে অনুমতি") &&
      !_idx.includes("perm-dots") && !_idx.includes("perm-action") &&
      !src.includes("openPermOnboard") && !src.includes("ONBOARD_STEPS") && !src.includes("renderOnboard") &&
      !src.includes("skipOnboard") && !_css.includes("perm-dot"),
      "modal removed");
    check("Fix #32: PERM_STEPS has the same 4 permissions, in order, as a plain list",
      src.includes('const PERM_STEPS = ["notifications", "exact", "battery", "autostart"]'),
      "4 steps");
    check("Fix #25: plugin has requestStep with all 4 step branches",
      _pa.includes("public void requestStep") && _pa.includes('"notifications"') &&
      _pa.includes('"exact"') && _pa.includes('"battery"') && _pa.includes('"autostart"'), "4 branches");
    check("Fix #25: battery exemption uses the system dialog intent; autostart opens MIUI's page with a fallback",
      _pa.includes("ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS") &&
      _pa.includes("AutoStartManagementActivity") &&
      _pa.includes("ACTION_APPLICATION_DETAILS_SETTINGS"), "intents");
    check("Fix #25: getStatus reports batteryExempt so the chain can check it",
      _pa.includes('ret.put("batteryExempt"'), "batteryExempt");
    check("Fix #25: manifest declares the battery-optimisation request permission",
      _mf.includes("REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"), "manifest");
    check("Fix #32: first launch runs the direct chain (still 2.5 s after open, still once)",
      src.includes("function maybeAskPermissions(){\n  if (settings.onboarded) return;") &&
      src.includes("setTimeout(()=>runPermChain(), 2500)"), "chain on first launch");
    check("Fix #32: the chain pauses after a Settings page opens and resumes on foreground return",
      src.includes("permChainWaiting = true") && src.includes("resumePermChain()") &&
      src.includes('document.addEventListener("visibilitychange"'), "pause/resume");
    check("Fix #32: the chain ends by marking onboarded (a decline is never re-asked every launch)",
      src.includes("function finishPermChain()") && src.includes("settings.onboarded = true; settings.permAsked = true;"),
      "once only");
    check("Fix #32: Settings 'সব অনুমতি দিন' button runs the direct chain for what is missing",
      src.includes('permBtn.onclick=()=>runPermChain()'), "direct re-run");
    check("Fix #32: onboarded flag defaults to false (new installs get asked once)",
      src.includes("onboarded:false"), "default false");
    check("Fix #32: on the web (no plugin) only the standard notification dialog is asked",
      src.includes('Notification.requestPermission()') && src.includes('exact: true, battery: true, autostart: true'),
      "web fallback");

    // ---- Fix #26: all 5 prayer times 100% correct (JAKIM, Ipoh/Chemor) ----
    // Official JAKIM times (Aladhan API, method 17, school 0) verified live:
    // 19 Nov 2026 Ipoh: Fajr 05:42, Sunrise 07:04, Dhuhr 13:01, Asr 16:24,
    // Maghrib 18:58, Isha 20:11. 20 Nov: Fajr 05:43, rest identical. Chemor
    // (his home) is identical to Ipoh. His rule: 2–3 min is fine, 10–15
    // min is not — the local calc must be within ±2 min of JAKIM.
    const _saved26 = { ...settings };
    Object.assign(settings, { country:"Malaysia", city:"Ipoh", lat:4.5975, lon:101.0901,
      tzName:"Asia/Kuala_Lumpur", locId:"ipoh", tzLoc:"ipoh", method:0, school:1, schoolExplicit:false });
    const t19n = computeTimingsLocal(new Date(2026, 10, 19));
    const t20n = computeTimingsLocal(new Date(2026, 10, 20));
    const _jakim = { Fajr:342, Sunrise:424, Dhuhr:781, Asr:984, Maghrib:1138, Isha:1211 };
    const _jakim20 = { Fajr:343, Sunrise:424, Dhuhr:781, Asr:984, Maghrib:1138, Isha:1211 };
    const _close = (t, ref) => t && ["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"].every(k=>Math.abs(toMin(t[k])-ref[k])<=2);
    check("Fix #26: local calc matches JAKIM 19 Nov Ipoh for all 5 prayers + Sunrise (±2 min)",
      _close(t19n, _jakim), t19n ? ["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"].map(k=>k+" "+t19n[k]).join(" ") : "null");
    check("Fix #26: local calc matches JAKIM 20 Nov Ipoh (Fajr 05:43, rest identical) (±2 min)",
      _close(t20n, _jakim20), t20n ? t20n.Fajr + " " + t20.Maghrib : "null");
    check("Fix #26: Malaysia auto-selects JAKIM method 17 and Shafi'i Asr (not Hanafi)",
      effMethod()===17 && effSchool()===0, "method " + effMethod() + " school " + effSchool());
    // Azan + T-5 + T-2 for all 5 prayers, at the exact JAKIM times.
    __setTimings({ Fajr:"05:42", Sunrise:"07:04", Dhuhr:"13:01", Asr:"16:24", Maghrib:"18:58", Isha:"20:11", Imsak:"05:32", Firstthird:"22:59", Lastthird:"03:01" });
    const RealDate26 = Date;
    const fake26 = (h, m, s=0) => {
      const t = new Date(2026, 10, 19); t.setHours(h, m, s, 0);
      globalThis.Date = class extends RealDate26 {
        constructor(...a){ super(...(a.length ? a : [t.getTime()])); }
        static now(){ return t.getTime(); }
      };
    };
    fake26(4, 0);
    const list26 = buildPrayerAlarmList();
    // NOTE: alarm `at` is an absolute instant — read it back through
    // locNow() (the location wall clock), not getHours() (the VM's UTC).
    const _wall26 = d => { const w = locNow(d); return w.getHours()*60+w.getMinutes(); };
    const _at26 = (id, type) => { const a = list26.find(x=>x.prayerId===id && x.type===type); return a ? _wall26(a.at) : null; };
    check("Fix #26: 5 azan alarms (azan-v2) ring exactly at the JAKIM prayer times",
      ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(p=>_at26(p,"azan-v2")===_jakim[p]),
      ["Fajr","Dhuhr","Asr","Maghrib","Isha"].map(p=>p+" "+_at26(p,"azan-v2")).join(" "));
    check("Fix #26: T-5 notifications (ids 51–55) come 5 min before every prayer",
      list26.filter(a=>a.type==="preazan" && [51,52,53,54,55].includes(a.id)).length===5 &&
      ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(p=>{
        const five = list26.find(a=>a.prayerId===p && a.type==="preazan" && a.id>=51);
        return five && (_at26(p,"azan-v2") - _wall26(five.at))===5;
      }), "T-5 ok");
    check("Fix #26: T-2 notifications (ids 31–35) come 2 min before every prayer",
      list26.filter(a=>a.type==="preazan" && [31,32,33,34,35].includes(a.id)).length===5 &&
      ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(p=>{
        const two = list26.find(a=>a.prayerId===p && a.type==="preazan" && a.id<40);
        return two && (_at26(p,"azan-v2") - _wall26(two.at))===2;
      }), "T-2 ok");
    check("Fix #26: every pre-azan carries the exact Bengali text (not one word changed)",
      ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(p=>
        list26.filter(a=>a.prayerId===p && a.type==="preazan").every(a=>a.body===PREAZAN_TEXTS[p])), "texts exact");
    // Ring sweep: inside each waqt the ring shows that prayer, counting to
    // the end of its window (the next prayer start); before Fajr it shows
    // Fajr upcoming; overnight Isha counts to tomorrow's Fajr.
    const _ring26 = (h, m) => { const d = new Date(2026, 10, 19); d.setHours(h, m, 0, 0); return nextEvent(d); };
    const _ringCases26 = [
      [6, 0, "Fajr", "current", 7, 4], [14, 0, "Dhuhr", "current", 16, 24],
      [17, 0, "Asr", "current", 18, 58], [19, 30, "Maghrib", "current", 20, 11],
      [21, 0, "Isha", "current", 5, 43], [4, 0, "Fajr", "upcoming", 5, 42],
    ];
    check("Fix #26: ring shows the running waqt and counts to the next prayer, for all 5 prayers (+overnight Isha→Fajr, pre-Fajr upcoming)",
      _ringCases26.every(([h, m, id, st, eh, em]) => { const e = _ring26(h, m);
        return e.kind==="prayer" && e.id===id && e.state===st &&
          Math.abs((e.at.getHours()*60+e.at.getMinutes()) - (eh*60+em)) <= 2; }),
      _ringCases26.map(([h,m])=>{ const e=_ring26(h,m); return `${h}:${String(m).padStart(2,"0")}→${e.id}/${e.state}@${e.at.getHours()}:${String(e.at.getMinutes()).padStart(2,"0")}`; }).join(" "));
    globalThis.Date = RealDate26;
    Object.assign(settings, _saved26);

    // ---- Fix #27: after login, nothing of the profile block stays ----
    // The user (21:23): after login, the saved-profile line ("✓ …") and
    // its "মুছুন" button must NOT remain — only the name in the salam
    // greeting above stays. The profile is still editable: tapping the
    // salam re-opens the form (edit mode), and saving hides it all again.
    const _saved27 = { profileName: settings.profileName, gmail: settings.gmail };
    settings.profileName = "Abu huryra"; settings.gmail = "tonmyboss@gmail.com";
    renderGreet(); renderLoginState();
    check("Fix #27: after login the salam shows the name, and the profile form + saved row are both hidden",
      els["#greet-line"].textContent === "আসসালামু আলাইকুম, Abu huryra 🤍" &&
      els["#profile-form"].classList.contains("hidden") &&
      els["#profile-saved"].classList.contains("hidden"),
      els["#greet-line"].textContent);
    check("Fix #27: the salam is tappable (pointer cursor + hint) so the name can still be changed",
      els["#greet-line"].style.cursor === "pointer" &&
      els["#greet-line"].title === "নাম বদলাতে ট্যাপ করুন" &&
      typeof els["#greet-line"].onclick === "function", "salam tap wired");
    els["#greet-line"].onclick(); // tap the salam → edit mode
    check("Fix #27: tapping the salam re-opens the profile form AND the saved row (with its মুছুন button)",
      !els["#profile-form"].classList.contains("hidden") &&
      !els["#profile-saved"].classList.contains("hidden"),
      "edit mode open");
    // The save button's handler lives in init (past the harness cut), so
    // drive the same state change the handler makes via the hook.
    __setEditingProfile(false); renderLoginState();
    check("Fix #27: saving again hides the form and the saved row once more",
      els["#profile-form"].classList.contains("hidden") &&
      els["#profile-saved"].classList.contains("hidden") &&
      settings.profileName === "Abu huryra", "hidden again");
    settings.profileName = _saved27.profileName; settings.gmail = _saved27.gmail;
    renderGreet(); renderLoginState();

    // ---- Fix #28 rewritten by Fix #31: Astaghfirullah has the SAME stepper as durood ----
    // The user (21:26) first asked for the same slider as durood; then
    // (21:55) he replaced the slider itself with − / + buttons. His
    // current 20-min setting must survive the change exactly.
    const _saved28 = { astaghRemMin: settings.astaghRemMin, astaghRemOn: settings.astaghRemOn,
      duroodRemMin: settings.duroodRemMin, duroodRemOn: settings.duroodRemOn };
    settings.astaghRemMin = 20; settings.astaghRemOn = true;
    const _astaghHtml = remPanel("astagh", "🤲", "আস্তাগফিরুল্লাহ রিমাইন্ডার", "Astaghfirullah reminder", true, 20);
    check("Fix #28: the Astaghfirullah panel now uses the stepper (not chips, not a slider)",
      _astaghHtml.includes('data-rem-step="astagh:-1"') && _astaghHtml.includes('data-rem-step="astagh:+1"') &&
      !_astaghHtml.includes("data-rem-min=") && !_astaghHtml.includes("data-rem-slider="),
      "stepper, no chips/slider");
    check("Fix #28: the stepper keeps his current 20-minute setting exactly",
      _astaghHtml.includes("২০") && _astaghHtml.includes("২০ মিনিট"),
      "20 min kept");
    check("Fix #28: the stepper label says the reminder comes every 20 minutes",
      remStepLabel("astagh", 20).includes("২০ মিনিট") &&
      remStepLabel("astagh", 30).includes("৩০ মিনিট"),
      "label ok");
    check("Fix #28: durood and astagh panels are built the same way (both steppers)",
      remPanel("durood", "📿", "দরুদ শরিফ রিমাইন্ডার", "Durood Sharif reminder", true, 30).includes('data-rem-step="durood:+1"') &&
      src.includes('remPanel("astagh"') && src.includes('settings.astaghRemMin || 30)'),
      "both steppers");
    settings.astaghRemMin = _saved28.astaghRemMin; settings.astaghRemOn = _saved28.astaghRemOn;
    settings.duroodRemMin = _saved28.duroodRemMin; settings.duroodRemOn = _saved28.duroodRemOn;

    // ---- Fix #29: Auto Location lives in ONE place, not in Settings ----
    // The user (21:28): the Auto Location option stays in one place —
    // remove it from inside Settings. The one place is the home 📍 pill
    // → the location setup modal (GPS Allow button). The saved
    // settings.autoLoc value keeps working; only its Settings UI is gone.
    check("Fix #29: no Auto Location toggle or detect button left in Settings HTML",
      !html.includes('id="set-autoloc"') && !html.includes('id="btn-detect-loc"') &&
      !html.includes("autoLocLabel") && !html.includes("autoLocDesc"),
      "removed from Settings");
    check("Fix #29: no #set-autoloc / #btn-detect-loc references left in app.js (they would crash on null)",
      !src.includes('"#set-autoloc"') && !src.includes('"#btn-detect-loc"'),
      "no stale refs");
    check("Fix #29: the one place remains — home 📍 pill opens the location setup modal with its GPS Allow button",
      src.includes('pillLoc.onclick=()=>openLocSetup(false)') &&
      html.includes('id="btn-loc-allow"') && html.includes('id="loc-setup"') &&
      html.includes("GPS দিয়ে অটো সেট করুন"),
      "pill → modal → GPS");
    check("Fix #29: autoLoc still defaults on and still gates auto-detect on launch",
      settings.autoLoc === true && src.includes("if (settings.autoLoc && !settings.locManual) detectLocation(true)"),
      "behaviour kept");

    // ---- Fix #30: bottom nav has ONLY Home + Settings ----
    // The user (21:33, screenshot): Quran / Tasbih / Duas / Qibla / Fasting
    // do NOT belong in the bottom bar — they live on the Home screen only
    // (Top Features cards, opened from there). The bottom bar keeps just
    // Home (the namaz screen) and Settings.
    const _nav = html.slice(html.indexOf('<nav id="bottom-nav">'), html.indexOf("</nav>", html.indexOf('<nav id="bottom-nav">')));
    const _navViews = [..._nav.matchAll(/data-view="([^"]+)"/g)].map(m=>m[1]);
    check("Fix #30: the bottom nav has exactly two buttons — Home and Settings",
      _navViews.length === 2 && _navViews[0] === "home" && _navViews[1] === "settings",
      _navViews.join(" + "));
    check("Fix #30: Quran / Tasbih / Duas / Qibla / Fasting are gone from the bottom nav",
      !["quran","tasbih","duas","qibla","fasting"].some(v=>_navViews.includes(v)),
      "none in nav");
    check("Fix #30: all five still have a Home card (Quran, Tasbih, Duas, Qibla, Fasting)",
      ["feat-quran","feat-tasbih","feat-duas","feat-qibla","feat-fasting"].every(id=>html.includes(`id="${id}"`)),
      "5 home cards");
    check("Fix #30: the two new Home cards are wired (Duas and Fasting open their views)",
      src.includes('$("#feat-duas")') && src.includes('showView("duas")') &&
      src.includes('$("#feat-fasting")') && src.includes('showView("fasting")'),
      "wired");
    check("Fix #30: the five views themselves still exist (only the nav buttons were removed)",
      ["view-quran","view-tasbih","view-duas","view-qibla","view-fasting"].every(v=>html.includes(`id="${v}"`)),
      "views intact");

    // ---- Fix #31: − / + stepper instead of the offset slider ----
    // The user (21:55): just increase/decrease, no time set beforehand,
    // NOT like the namaz option — + / − buttons, 1 minute per tap.
    const _both = remPanel("durood", "📿", "দরুদ শরিফ রিমাইন্ডার", "Durood Sharif reminder", true, 10) +
      remPanel("astagh", "🤲", "আস্তাগফিরুল্লাহ রিমাইন্ডার", "Astaghfirullah reminder", true, 2);
    check("Fix #31: both panels show the plain interval number with − / + buttons (his current 10 and 2 min)",
      _both.includes("১০") && _both.includes("২") &&
      _both.includes('data-rem-step="durood:+1"') && _both.includes('data-rem-step="astagh:-1"'),
      "10 and 2 min");
    check("Fix #31: no slider, offset or আগে/পরে language anywhere in the reminder panels",
      !_both.includes("range") && !_both.includes("আগে") && !_both.includes("পরে") &&
      !_both.includes("সঠিক সময়") && !_both.includes("অফসেট"),
      "plain numbers");
    check("Fix #31: the slider code is fully gone from app.js (no data-rem-slider, no offset helper)",
      !src.includes("data-rem-slider") && !src.includes("dhikrMinFromOffset") && !src.includes("remSliderLabel"),
      "slider removed");
    check("Fix #31: the stepper wiring is in the source (each tap ±1, clamped 1..60, saves + re-syncs)",
      src.includes('data-rem-step') && src.includes("clampDhikrMin(cur + d)") &&
      src.includes("saveSettings(); scheduleNativeDhikr(); renderReminderSettings();"),
      "wired");
    check("Fix #31: the namaz (prayer-time) adjuster itself is untouched — only the reminder changed",
      html.includes('id="detail-slider"') && html.includes("Time Adjustment"),
      "prayer slider stays");
    check("Fix #31: stepper clamps at the edges (1 min and 60 min show correctly)",
      remPanel("durood", "📿", "দরুদ শরিফ রিমাইন্ডার", "Durood Sharif reminder", true, 1).includes("১") &&
      remPanel("astagh", "🤲", "আস্তাগফিরুল্লাহ রিমাইন্ডার", "Astaghfirullah reminder", true, 99).includes("৬০"),
      "1 and 60");
  } finally {
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  }
})();
