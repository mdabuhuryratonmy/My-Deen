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
globalThis.forbiddenWindows=forbiddenWindows; globalThis.nextEvent=nextEvent; globalThis.nextPrayer=nextPrayer; globalThis.naflWindow=naflWindow;
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
globalThis.detailSoundExplain=detailSoundExplain; globalThis.renderDetailSounds=renderDetailSounds;
// Build #19 test hooks: spoken pre-azan voice, city-name normaliser,
// permission-chain helpers
globalThis.speakText=speakText; globalThis.checkPreAzanVoice=checkPreAzanVoice;
globalThis.AZAN_SPEAK_TEXTS=AZAN_SPEAK_TEXTS; globalThis.nativeAzanArmed=nativeAzanArmed; globalThis.scheduleNativeDhikr=scheduleNativeDhikr;
globalThis.scheduleNativeAzan=scheduleNativeAzan; // Fix #43: the LN fallback under test — it must never schedule a sounding azan
globalThis.openDuroodAppSettings=openDuroodAppSettings; globalThis.syncDuroodToggleNative=syncDuroodToggleNative;
globalThis.renderDuroodSoundSelect=renderDuroodSoundSelect; globalThis.refreshDuroodStats=refreshDuroodStats;
globalThis.DUROOD_REMIND_SOUNDS=DUROOD_REMIND_SOUNDS; globalThis.duroodRemindSoundName=duroodRemindSoundName;
globalThis.preazanText=preazanText; globalThis.JUMUAH_PREAZAN_TEXT=JUMUAH_PREAZAN_TEXT;
globalThis.azanSpeakText=azanSpeakText; globalThis.JUMUAH_AZAN_SPEAK_TEXT=JUMUAH_AZAN_SPEAK_TEXT;
globalThis.villageNameOf=villageNameOf; globalThis.normalizeCityName=normalizeCityName;
globalThis.permStepsAsked=permStepsAsked; globalThis.permMarkAsked=permMarkAsked; globalThis.permTimeout=permTimeout;
globalThis.detectLocation=detectLocation; globalThis.locPermStatus=locPermStatus; globalThis.saveSettingsFromUI=saveSettingsFromUI;
globalThis.runPermChain=runPermChain; globalThis.permRequestStep=permRequestStep; globalThis.permStatus=permStatus; globalThis.resumePermChain=resumePermChain;
globalThis.__permChainState=()=>({running:permChainRunning, waiting:permChainWaiting, idx:permChainIdx}); // Fix #41 Step 1 hole: the chain flags are let-bindings, invisible to the test scope — read them through this hook
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
const javaSched = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmScheduler.java", "utf8");
const javaPlugin = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/PrayerAlarmPlugin.java", "utf8");
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
check("Fix #34 (keeps Fix #27): after save the form + saved row are hidden, but the name row with the 'নাম বদলান' button IS visible",
  els["#profile-form"].classList.contains("hidden") && els["#profile-saved"].classList.contains("hidden") &&
  !els["#profile-current"].classList.contains("hidden") && els["#profile-current-name"].textContent === "Abu huryra");
settings.profileName = ""; settings.gmail = "tonmyboss@gmail.com"; renderLoginState();
check("Fix #34: a saved Gmail alone no longer counts as a profile — the name form stays visible",
  !els["#profile-form"].classList.contains("hidden") && els["#profile-current"].classList.contains("hidden"));
settings.profileName = ""; settings.gmail = ""; renderLoginState();
check("profile form returns after profile is cleared (name row hidden again)",
  !els["#profile-form"].classList.contains("hidden") && els["#profile-saved"].classList.contains("hidden") && els["#profile-current"].classList.contains("hidden"));

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
// Fix #46 (UPDATED: the old pin said the ring showed the upcoming
// ForbNoon at 12:00 — that was the 28 Nov bug: at noon it is Duha
// time, and the ring must show the CURRENT nafl window, never a
// future forbidden window as the state).
check("Fix #46: nextEvent at 12:00 is Duha (current nafl), counting to zawal 12:56", ne1.kind==="nafl" && ne1.id==="Duha" && ne1.at.getHours()===12 && ne1.at.getMinutes()===56 && ne1.state==="current", ne1.id);
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
// Fix #46 (UPDATED Fix #11: the old pin said the ring showed the
// upcoming ForbNoon at 07:25 — that was the 28 Nov bug. At 07:25 it
// is Ishraq time; the ring shows the CURRENT nafl window).
check("Fix #46: at 07:25 (no prayer current) the ring shows Ishraq (current nafl), never the upcoming forbidden window", ne0725.kind==="nafl" && ne0725.id==="Ishraq" && ne0725.state==="current" && ne0725.at.getHours()===12 && ne0725.at.getMinutes()===56, ne0725.kind+" "+ne0725.id+" "+ne0725.state);

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
// (The MP3s themselves are fine — Fix #48 shortened them: durood
// 2.68 s / mean −18.5 dB, istighfar 1.38 s / mean −20.5 dB, normal
// audible speech; the plugin resolves "durood.mp3" correctly by
// stripping the extension.)
// Fix: fresh v2 channel IDs in both the native ensureChannels (with
// R.raw.durood/istighfar + HIGH importance) and the JS scheduler,
// and the old channels are deleted. The old IDs must not appear as a
// channelId/createChannel id anywhere in the schedule path.
const _src18 = fs.readFileSync("/home/hatch/workspace/deen-day/www/app.js", "utf8");
const _java18 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmScheduler.java", "utf8");
// Fix #33 rewrote the channel pick: sound on → the v4 channel with its
// sound, sound off → the silent twin. The default (sound on) still
// schedules on the v4 channel with the sound — that is what these check.
// (Build #19, Fix #4: v2 → v3, same repair as Fix #18 — the v2 channel
// on the user's phone was itself created without a working sound.
// Fix #41 Step 3: v3 → v4 — v3 stayed silent on his phone through
// clean installs of Builds 20/21/22; see the Step 3 block at the end.)
check("Fix #18: JS schedules durood reminders on the v4 channel with durood.mp3 (sound on)",
  _src18.includes('settings.duroodRemSound !== false ? "dhikr-durood-v4"') && _src18.includes('settings.duroodRemSound !== false ? "durood.mp3"'), "channelId dhikr-durood-v4");
check("Fix #18: JS schedules istighfar reminders on the v4 channel with istighfar.mp3 (sound on)",
  _src18.includes('settings.astaghRemSound !== false ? "dhikr-istighfar-v4"') && _src18.includes('settings.astaghRemSound !== false ? "istighfar.mp3"'), "channelId dhikr-istighfar-v4");
check("Fix #18: the old channel IDs are gone from the JS schedule path (exact quoted ids)",
  !/"dhikr-durood"/.test(_src18) && !/"dhikr-istighfar"/.test(_src18), "no old ids in app.js");
check("Fix #18: native creates the v4 channels with the raw sounds + HIGH importance",
  _java18.includes('createChannel(nm, ctx, "dhikr-durood-v4"') && _java18.includes("IMPORTANCE_HIGH, R.raw.durood") &&
  _java18.includes('createChannel(nm, ctx, "dhikr-istighfar-v4"') && _java18.includes("IMPORTANCE_HIGH, R.raw.istighfar"),
  "native v4 channels");
check("Fix #18: native deletes the old (possibly silent) dhikr channels",
  _java18.includes('deleteNotificationChannel("dhikr-durood")') && _java18.includes('deleteNotificationChannel("dhikr-istighfar")') &&
  _java18.includes('deleteNotificationChannel("dhikr-durood-v2")') && _java18.includes('deleteNotificationChannel("dhikr-istighfar-v2")'),
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
check("alarm list has 5 azan + 10 pre-azan by default", list.length===15 && list.filter(a=>a.type==="azan-v2").length===5 && list.filter(a=>a.type==="preazan-v2").length===10, String(list.length));
const fajrAzan = list.find(a=>a.prayerId==="Fajr" && a.type==="azan-v2");
const fajrPres = list.filter(a=>a.prayerId==="Fajr" && a.type==="preazan-v2");
const fajrDiffs = fajrPres.map(a=>(fajrAzan.at - a.at + 86400000) % 86400000);
check("pre-azan is twice: 5 and 2 min before azan", fajrAzan && fajrPres.length===2 && fajrDiffs.includes(300000) && fajrDiffs.includes(120000));
check("pre-azan ids 31–35 and 51–55", list.filter(a=>a.type==="preazan-v2").map(a=>a.id).sort((x,y)=>x-y).join(",")==="31,32,33,34,35,51,52,53,54,55");
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
check("ALARM_SOUNDS has 5 options, no name row (Fix #42)", ALARM_SOUNDS.length===5 && ALARM_SOUNDS.some(s=>s.id==="azan") && ALARM_SOUNDS.some(s=>s.id==="silent") && ALARM_SOUNDS.some(s=>s.id==="notification") && !ALARM_SOUNDS.some(s=>s.id==="name"));

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
check("Build #19 Fix #2: share button is GONE from the HTML (header + home row + calendar cells)", !html.includes('id="btn-share"') && !html.includes('id="btn-home-share"') && !html.includes("data-cal-share") && !html.includes("share")); 
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

// ---- Fix #33: sound on/off switch for each dhikr reminder ----
check("Fix #33: reminder sound defaults to on (both kinds)",
  settings.duroodRemSound === true && settings.astaghRemSound === true);
settings.duroodRemSound = true; settings.astaghRemSound = true; renderReminderSettings();
const remHtml33 = els["#reminder-settings"].innerHTML;
check("Fix #33: both panels have a sound switch with the on label",
  remHtml33.includes('id="rem-durood-sound"') && remHtml33.includes('id="rem-astagh-sound"') &&
  remHtml33.includes("সাউন্ড") && remHtml33.includes("অডিও বাজবে"));
settings.duroodRemSound = false; settings.astaghRemSound = false; renderReminderSettings();
check("Fix #33: sound off shows the silent label in both panels",
  els["#reminder-settings"].innerHTML.includes("নীরবে আসবে"));
/* Flip the REAL switch handlers on the stub elements: the switch must
   save the flag (and re-schedule) — it really works, not just a display. */
settings.duroodRemSound = true; settings.astaghRemSound = true; renderReminderSettings();
els["#rem-durood-sound"].onchange({ target: { checked: false } });
check("Fix #33: flipping the durood sound switch off saves the flag",
  settings.duroodRemSound === false);
els["#rem-durood-sound"].onchange({ target: { checked: true } });
check("Fix #33: flipping the durood sound switch on saves the flag",
  settings.duroodRemSound === true);
els["#rem-astagh-sound"].onchange({ target: { checked: false } });
check("Fix #33: flipping the astagh sound switch off saves the flag",
  settings.astaghRemSound === false);
settings.duroodRemSound = true; settings.astaghRemSound = true;

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
// Fix #36 updated the grid anchor + tile list: the Tilawat/Tafsir tiles
// are gone (merged into the Quran view), Quran + Roza sit at the bottom.
// Build #19, Fix #1: the duplicate home-top date card is gone — the
// header date (#date-line) is now the only date on Home.
const homeOrder = ["ring-hero","prayer-list","btn-home-alarm","feat-tracker","forbid-section","nafl-rows","nafl-strip","btn-go-fasting"];
check("home sections are in the reference order",
  homeOrder.every((id,i)=> i===0 || html.indexOf(id) > html.indexOf(homeOrder[i-1])));
check("Build #19 Fix #1: duplicate home date card is gone, header date stays the only date",
  !html.includes('id="home-date-hijri"') && !html.includes('id="home-date-greg"') && !html.includes('class="home-top"') && !html.includes('id="btn-home-share"') && !html.includes('id="btn-home-notif"') && !html.includes('id="home-notif-badge"') && html.includes('id="date-line"'));
check("home has all 8 feature tiles (Fix #36 merged grid: no tilawat/tafsir tiles; duas + fasting included)",
  ["feat-tracker","feat-qibla","feat-ruqyah","feat-names","feat-tasbih","feat-duas","feat-quran","feat-fasting"].every(id=>html.includes(`id="${id}"`)));
check("old home pieces are gone (location card, tracker cards, bottom alarm row)",
  !html.includes('id="home-loc-text"') && !html.includes('id="btn-home-detect-loc"') && !html.includes('id="quran-tracker-card"') && !html.includes('id="h-tracker"') && !html.includes('id="btn-go-alarm"') && !html.includes("আজকের নামাজের সময়"));
check("forbidden + nafl sections are unwrapped with red title",
  html.includes('id="forbid-section"') && html.includes('forbid-title') && html.includes('id="nafl-section"'));
check("ring is full-bleed with dark arc + dark text on light skies",
  css.includes("#view-home .ring-hero") && css.includes('.ring-hero[data-sky="day"] .ring-fg'));
check("prayer rows use 24h ranges + done circles, no old azan lines",
  src.includes("done-circle") && src.includes('class="p-range"') && !src.includes('class="dotbtn" data-pray') && src.includes("num(timings[pid])"));
check("Build #19 Fix #1: header is ALWAYS visible now (never hidden on Home — its date is the one date)",
  !src.includes("hdr.style.display") && !src.includes('v === "home" ? "none"'));
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
const preList = alarmList.filter(a=>a.type==="preazan-v2");
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
check("old daily check/hurry repeats are cancelled on sync (Fix #39: native every time + LN once)",
  src.includes("cancelLegacyCheckReminders") && src.includes("legacy_check_cancelled"));

// ---- Fix #10 (UPDATED Fix #43): multi-select alarm sound (name permanent + up to TWO extras, max 2 sounds — name does not count) ----
check("normalizeSounds keeps old choice next to permanent name (UPDATED Fix #43: name + 2 extras fit)",
  JSON.stringify(normalizeSounds("notification"))===JSON.stringify(["name","notification"]) &&
  JSON.stringify(normalizeSounds("azan"))===JSON.stringify(["name","azan"]) &&
  JSON.stringify(normalizeSounds("silent"))===JSON.stringify(["silent"]) &&
  JSON.stringify(normalizeSounds(["azan","notification"]))===JSON.stringify(["name","azan","notification"]) &&
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
check("adding a second extra gives name + azan + notification (UPDATED Fix #43: name does not count)",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name","azan","notification"]));
toggleDetailSound("beep");
check("a third sound is refused (max 2 together)",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name","azan","notification"]));
toggleDetailSound("azan");
check("tapping a selected extra removes it, name stays",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name","notification"]));
toggleDetailSound("name");
check("name cannot be turned off (permanent default)",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name","notification"]));
toggleDetailSound("silent");
check("silent stands alone",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["silent"]));
toggleDetailSound("azan");
check("picking another sound clears silent",
  JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name","azan"]));
settings.alarmSound.Fajr = ["name","azan"];
const azanSoundList = buildPrayerAlarmList();
check("name + azan plays the azan sound (on the azan channel)",
  azanSoundList.find(a=>a.type==="azan-v2" && a.prayerId==="Fajr").sound==="azan");
settings.alarmSound.Fajr = ["name","notification"];
const notifSoundList = buildPrayerAlarmList();
check("name + notification plays the notification sound (still on the azan channel)",
  notifSoundList.find(a=>a.type==="azan-v2" && a.prayerId==="Fajr").sound==="reminder");
settings.alarmSound.Fajr = ["silent"];
const silentSoundList = buildPrayerAlarmList();
check("silent alone plays no sound — and posts on the silent channel (Fix #38)",
  silentSoundList.find(a=>a.type.startsWith("azan-v2") && a.prayerId==="Fajr").sound==="none" &&
  silentSoundList.find(a=>a.type.startsWith("azan-v2") && a.prayerId==="Fajr").type==="azan-v2-silent");
settings.alarmSound.Fajr = ["name"];
settings.alarmOn = {...settings.alarmOn, Fajr:false, Dhuhr:false, Asr:false, Maghrib:false, Isha:false, Tahajjud:false, Sehri:false, Iftar:false, Duha:false};
const alarmListOff = buildPrayerAlarmList();
check("pre-azan stays on even when every prayer alarm is off",
  alarmListOff.filter(a=>a.type==="preazan-v2").length===10 &&
  alarmListOff.filter(a=>a.type.startsWith("azan-v2")).length===0 &&
  ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(pid=>alarmListOff.filter(a=>a.type==="preazan-v2" && a.prayerId===pid).length===2));
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
const maghAzan = buildPrayerAlarmList().find(a=>a.type.startsWith("azan-v2") && a.prayerId==="Maghrib");
check("Fix #12: Maghrib alarm fires at 17:17 Jashore wall-clock (absolute instant)",
  maghAzan && dhakaWall(maghAzan.at.getTime()).join(":")==="17:17",
  maghAzan ? dhakaWall(maghAzan.at.getTime()).join(":") : "none");
const maghPres = buildPrayerAlarmList().filter(a=>a.type==="preazan-v2" && a.prayerId==="Maghrib")
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
    // is recorded and shown on the Alarm page, and alarms re-sync on
    // foreground. Fix #41 Step 2: the Home warning banner is GONE by
    // the user's order — permissions are asked once at first launch
    // instead; the tests below assert no banner ever appears.
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
    check("Fix #41 Step 2: no Home warning banner ever appears, even when alarms are skipped — the Alarm page points to Settings instead",
      __getAlarmStatus().skipped === 5 && (!els["#alarm-warn"] || els["#alarm-warn"].innerHTML === "") &&
      els["#alarm-status"].innerHTML.includes("আজানের অ্যালার্ম সেট হয়নি") && els["#alarm-status"].innerHTML.includes("Settings"),
      els["#alarm-status"].innerHTML.slice(0, 100));
    _mockPA({scheduled:35, skipped:0}, {notificationsGranted:true, exactAlarmGranted:true, alarmsScheduled:35});
    const t19 = new Date(); t19.setHours(17,0,0,0);
    globalThis.Date = class extends RealDate19 {
      constructor(...a){ super(...(a.length ? a : [t19.getTime()])); }
      static now(){ return t19.getTime(); }
    };
    await syncPrayerAlarms(); await refreshAlarmStatus();
    check("Fix #19: when all alarms are armed the status shows the next azan (Maghrib) and there is still no Home banner",
      __getAlarmStatus().skipped === 0 && (!els["#alarm-warn"] || els["#alarm-warn"].innerHTML === "") && els["#alarm-status"].innerHTML.includes("মাগরিব"),
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
    const _sets = ["set-adhan","set-azan","set-daily","set-dark","set-durood","set-lang","set-method","set-notif","btn-edit-profile","set-profile-name","set-reciter","set-school"]; // Fix #29: set-autoloc is gone (Auto Location lives in one place — the home 📍 pill → location setup modal). Fix #34: set-profile-gmail is gone (profile is name-only, no Gmail login); btn-edit-profile is the new name-change control.
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
    check("Fix #24 (UPDATED Fix #43): the sounding azan-v2 channel is GONE from the JS LN path — the MediaPlayer service is the only sounding azan path; no createChannel for azan-v2 anywhere in the shipped JS",
      !src.includes('createChannel({ id: "azan-v2"'), "no v2 channel");
    check("Fix #24: no azan entry still uses the old channel",
      !src.includes('type: "azan"') && !src.includes('createChannel({ id: "azan",'), "old channel gone");
    check("Fix #24: next-azan status reads the v2 entries (incl. the Fix #38 silent channel)",
      src.includes('a.type.startsWith("azan-v2")'), "nextAzanInfo v2");
    check("Fix #24 (UPDATED Fix #43): native DELETES the sounding azan-v2 channel and never creates it (the old azan channel is still deleted too)",
      !_as.includes('createChannel(nm, ctx, "azan-v2"') && _as.includes('deleteNotificationChannel("azan-v2")') && _as.includes('deleteNotificationChannel("azan")'), "native deletes v2");
    check("Fix #24: AlarmReceiver maps a stale stored 'azan' type to azan-v2",
      _ar.includes('if (type.equals("azan")) type = "azan-v2"'), "stale mapping");

    // ---- Fix #25 rewritten by Fix #32: direct system permission requests ----
    // The user (21:59) rejected the 4-step in-app modal (ধাপ 1/4, dots,
    // "এড়িয়ে যান / পরে করব"). The app now asks for each permission
    // directly, the way normal apps do: the phone's own dialog for
    // notifications/battery, the phone's own Settings page for exact
    // alarms/app settings (those two can ONLY be a toggle on a system page).
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
    check("Fix #32: PERM_STEPS has the same 5 permissions, in order, as a plain list (location first — Fix #41 Step 2)",
      src.includes('const PERM_STEPS = ["location", "notifications", "exact", "battery", "appsettings"]'),
      "5 steps");
    check("Fix #25: plugin has requestStep with all 4 step branches",
      _pa.includes("public void requestStep") && _pa.includes('"notifications"') &&
      _pa.includes('"exact"') && _pa.includes('"battery"') && _pa.includes('"appsettings"'), "4 branches");
    check("Fix #25: battery exemption uses the system dialog intent; appsettings opens the generic app Settings page (no MIUI deep link — Fix #42)",
      _pa.includes("ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS") &&
      _pa.includes("ACTION_APPLICATION_DETAILS_SETTINGS") &&
      !_pa.includes("AutoStartManagementActivity") && !_pa.includes("com.miui.securitycenter"), "intents");
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
    check("Fix #32: Settings 'সব অনুমতি দিন' button runs the direct chain for what is missing (force re-ask)",
      src.includes('permBtn.onclick=()=>runPermChain(true)'), "direct re-run");
    check("Fix #32: onboarded flag defaults to false (new installs get asked once)",
      src.includes("onboarded:false"), "default false");
    check("Fix #32: on the web (no plugin) only the standard notification dialog is asked",
      src.includes('Notification.requestPermission()') && src.includes('exact: true, battery: true, appsettings: true'),
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
      list26.filter(a=>a.type==="preazan-v2" && [51,52,53,54,55].includes(a.id)).length===5 &&
      ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(p=>{
        const five = list26.find(a=>a.prayerId===p && a.type==="preazan-v2" && a.id>=51);
        return five && (_at26(p,"azan-v2") - _wall26(five.at))===5;
      }), "T-5 ok");
    check("Fix #26: T-2 notifications (ids 31–35) come 2 min before every prayer",
      list26.filter(a=>a.type==="preazan-v2" && [31,32,33,34,35].includes(a.id)).length===5 &&
      ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(p=>{
        const two = list26.find(a=>a.prayerId===p && a.type==="preazan-v2" && a.id<40);
        return two && (_at26(p,"azan-v2") - _wall26(two.at))===2;
      }), "T-2 ok");
    check("Fix #26: every pre-azan carries the exact Bengali text (not one word changed)",
      ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(p=>
        list26.filter(a=>a.prayerId===p && a.type==="preazan-v2").every(a=>a.body===((p==="Dhuhr" && locNow(a.at).getDay()===5)?JUMUAH_PREAZAN_TEXT:PREAZAN_TEXTS[p]))), "texts exact");
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

    // ---- Fix #27 updated by Fix #34: after login the name row stays ----
    // The user (21:23) wanted the saved-profile line ("✓ …") and its
    // "মুছুন" button gone after login — that stays. But (22:10) he could
    // not see where to write/change his name, because the whole card went
    // empty. So now the card shows the saved name with a clear
    // "✏️ নাম বদলান" button instead; the name write/change option is
    // always visible, and there is NO Gmail login anywhere.
    const _saved27 = { profileName: settings.profileName, gmail: settings.gmail };
    settings.profileName = "Abu huryra"; settings.gmail = "tonmyboss@gmail.com";
    renderGreet(); renderLoginState();
    check("Fix #27: after login the salam shows the name, and the profile form + saved row are both hidden",
      els["#greet-line"].textContent === "আসসালামু আলাইকুম, Abu huryra 🤍" &&
      els["#profile-form"].classList.contains("hidden") &&
      els["#profile-saved"].classList.contains("hidden"),
      els["#greet-line"].textContent);
    check("Fix #34: after login the name row with the 'নাম বদলান' button IS visible in the profile card",
      !els["#profile-current"].classList.contains("hidden") &&
      els["#profile-current-name"].textContent === "Abu huryra" &&
      html.includes('id="btn-edit-profile"') && html.includes("নাম বদলান"),
      "name row visible");
    check("Fix #27: the salam is tappable (pointer cursor + hint) so the name can still be changed",
      els["#greet-line"].style.cursor === "pointer" &&
      els["#greet-line"].title === "নাম বদলাতে ট্যাপ করুন" &&
      typeof els["#greet-line"].onclick === "function", "salam tap wired");
    els["#greet-line"].onclick(); // tap the salam → edit mode
    check("Fix #27: tapping the salam re-opens the profile form AND the saved row (with its মুছুন button)",
      !els["#profile-form"].classList.contains("hidden") &&
      !els["#profile-saved"].classList.contains("hidden") &&
      els["#profile-current"].classList.contains("hidden"),
      "edit mode open");
    check("Fix #34: in edit mode the name box already holds the current name (no blank retype)",
      els["#set-profile-name"].value === "Abu huryra", "prefilled");
    // The save button's handler lives in init (past the harness cut), so
    // drive the same state change the handler makes via the hook.
    __setEditingProfile(false); renderLoginState();
    check("Fix #27: saving again hides the form and the saved row once more",
      els["#profile-form"].classList.contains("hidden") &&
      els["#profile-saved"].classList.contains("hidden") &&
      !els["#profile-current"].classList.contains("hidden") &&
      settings.profileName === "Abu huryra", "hidden again");
    check("Fix #34: no Gmail login anywhere — no Gmail button, field or login text in the HTML or JS",
      !html.includes('btn-gmail-login') && !html.includes('set-profile-gmail') &&
      !html.includes('Gmail দিয়ে লগইন') &&
      !src.includes('btn-gmail-login') && !src.includes('set-profile-gmail'),
      "no Gmail login");
    check("Fix #34: the 'নাম বদলান' button is wired to re-open the form in edit mode",
      src.includes('$("#btn-edit-profile")') && src.includes('editingProfile = true; renderLoginState()') &&
      src.includes('pn.focus()'), "edit button wired");
    check("Fix #34: saving the profile needs just the name (no Gmail read in the save handler)",
      src.includes('settings.profileName = $("#set-profile-name").value.trim(); saveSettings();') &&
      !src.includes('settings.gmail = $("#set-profile-gmail")'),
      "name-only save");
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
    check("Fix #29: autoLoc still defaults on; saving settings never re-detects location (Fix #41 Step 2)",
      settings.autoLoc === true &&
      !src.slice(src.indexOf("async function saveSettingsFromUI"), src.indexOf("async function initPrayers")).includes("detectLocation"),
      "save never asks");

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

    // ---- Fix #33: sound on/off for dhikr reminders (really works) ----
    // The user (22:06): the durood reminder notification must play its
    // audio, with a sound on/off option that REALLY works — on = audio
    // plays, off = it arrives silently. Same for astaghfirullah.
    // Android never updates an existing channel's sound, so the switch
    // works by scheduling into the sound channel or a silent twin.
    const _as33 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmScheduler.java", "utf8");
    check("Fix #33: sound defaults on in app.js (duroodRemSound / astaghRemSound)",
      src.includes("duroodRemSound:true") && src.includes("astaghRemSound:true"), "defaults on");
    check("Fix #33: native scheduler picks the sound or the silent channel by the switch",
      src.includes('settings.duroodRemSound !== false ? "dhikr-durood-v4" : "dhikr-durood-v4-silent"') &&
      src.includes('settings.astaghRemSound !== false ? "dhikr-istighfar-v4" : "dhikr-istighfar-v4-silent"'),
      "channel pick");
    // Build #19, Fix #4: the JS createChannel calls are gone — the
    // native side is now the SOLE dhikr channel creator (no dual-creator
    // race), so the silent channels exist only in the native code.
    check("Fix #33: both silent channels are created natively (Build #19: native is the sole creator, no JS createChannel)",
      !/createChannel\(\{ id: "dhikr-durood-v4"/.test(src) && !/createChannel\(\{ id: "dhikr-istighfar-v4"/.test(src) &&
      _as33.includes('"dhikr-durood-v4-silent"') && _as33.includes('"dhikr-istighfar-v4-silent"'),
      "silent channels");
    check("Fix #33: native silent channels are HIGH importance with no sound (they still pop up, silently)",
      _as33.includes('createChannel(nm, ctx, "dhikr-durood-v4-silent"') &&
      _as33.includes('NotificationManager.IMPORTANCE_HIGH, -1)'),
      "silent, still pops up");
    check("Fix #33: foreground audio is gated on the switch (sound off = toast + notification only, no audio)",
      src.includes('if (settings.duroodRemSound !== false) playDurood(true)') &&
      src.includes('if (settings.astaghRemSound !== false)'),
      "audio gated");
    check("Fix #33: the sound switches re-schedule immediately (the switch really works)",
      src.includes('dSnd.onchange') && src.includes('aSnd.onchange') &&
      src.includes('settings.duroodRemSound = e.target.checked') &&
      src.includes('settings.astaghRemSound = e.target.checked'),
      "wired");

    // ---- Fix #35: durood plays ONLY on phone unlock, never on app open ----
    // The user (22:13): opening the app must have nothing to do with
    // durood playing. The web layer's "best-effort" hook (play on open /
    // foreground / focus) is fully removed; the only unlock durood is the
    // native receiver on the real ACTION_USER_PRESENT broadcast.
    check("Fix #35: the play-on-open hook is fully gone (no function, no calls)",
      !src.includes("function maybePlayDuroodOnForeground") &&
      !src.includes("maybePlayDuroodOnForeground()"),
      "hook removed");
    check("Fix #35: init only syncs the unlock toggle natively — it does not play durood",
      src.includes("step(()=>syncDuroodToggleNative()); // Fix #35") &&
      !src.includes("step(()=>maybePlayDuroodOnForeground())"),
      "init clean");
    check("Fix #35: no foreground/focus listener plays durood any more (the alarm resync listener stays)",
      !/visibilitychange.*maybePlayDurood|focus.*maybePlayDurood/.test(src) &&
      src.includes('document.addEventListener("visibilitychange", ()=>{ if (!document.hidden){ resyncCountdown(); syncPrayerAlarms();'),
      "listeners clean");
    const _dur = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodUnlockReceiver.java", "utf8");
    check("Fix #35 (UPDATED Fix #45): the native unlock receiver fires ONLY on the real USER_PRESENT unlock broadcast — and auto-plays the durood, then posts the reminder",
      _dur.includes('Intent.ACTION_USER_PRESENT.equals(intent.getAction())') &&
      _dur.includes("DuroodPlayer.playOnce(context)") && _dur.includes("postReminder(context)"),
      "unlock only");
    check("Fix #35: the durood REMINDER still plays its audio at its set time (only the open-hook is gone)",
      src.includes("function playDurood(force)") &&
      src.includes('if (settings.duroodRemSound !== false) playDurood(true)'),
      "reminder kept");

    // ---- Fix #36: merge duplicate Home grid cards ----
    // The user (22:28): Quran + Tilawat + Tafsir → ONE Quran card, with
    // Tilawat + Tafsir inside its view; FastTime + Roza → ONE Roza card,
    // with Sehri/Iftar times + fasting records inside; both merged cards
    // at the bottom of the grid; the rest unchanged; bottom nav stays
    // Home + Settings only. (There is no separate FastTime card in the
    // app — the Roza card opens the fasting view, which already holds
    // the Sehri/Iftar timetable — and no separate tafsir text either.)
    const _gi = id => html.indexOf(`id="${id}"`);
    check("Fix #36: the Tilawat + Tafsir tiles are gone from the grid",
      !html.includes('id="feat-tilawat"') && !html.includes('id="feat-tafsir"') &&
      !src.includes('$("#feat-tilawat")') && !src.includes('$("#feat-tafsir")'),
      "tiles removed");
    check("Fix #36: the merged Quran + Roza cards are the last two in the grid, the rest keep their order",
      ["feat-tracker","feat-qibla","feat-ruqyah","feat-names","feat-tasbih","feat-duas","feat-quran","feat-fasting"]
        .every((id, i, a) => i === 0 || _gi(a[i-1]) < _gi(id)) &&
      _gi("feat-quran") > _gi("feat-duas") && _gi("feat-fasting") > _gi("feat-quran"),
      "8 tiles, merged last");
    check("Fix #36: Ruqyah stays in place (not in the keep-list, but never asked to be removed)",
      html.includes('id="feat-ruqyah"') && html.includes("রুকইয়াহ"), "ruqyah kept");
    check("Fix #36: Tilawat + Tafsir are inside the Quran view as buttons",
      html.includes('id="btn-quran-tilawat"') && html.includes('id="btn-quran-tafsir"') &&
      html.includes("🎧 তিলাওয়াত") && html.includes("📚 তাফসীর"),
      "inside Quran");
    check("Fix #36: the in-view buttons are wired (Tilawat opens the reader, Tafsir goes to the surah list)",
      src.includes('$("#btn-quran-tilawat")') && src.includes('$("#btn-quran-tafsir")') &&
      src.includes('qTi.onclick=()=>openSurah(currentSurah || 1)') &&
      src.includes('scrollIntoView({behavior:"smooth", block:"start"})'),
      "wired");
    check("Fix #36: the single Roza card opens the fasting view, which holds Sehri/Iftar times + the fasting timetable",
      html.includes('id="feat-fasting"') && html.includes("সাওমের সময়সূচি") &&
      html.includes('id="fast-schedule"') &&
      src.includes('fFa.onclick=()=>showView("fasting")'),
      "roza inside");
    check("Fix #36: bottom nav is still only Home + Settings (nothing else)",
      (() => { const nav = html.slice(html.indexOf('<nav id="bottom-nav">'), html.indexOf('</nav>'));
        return (nav.match(/data-view="/g) || []).length === 2 &&
          nav.includes('data-view="home"') && nav.includes('data-view="settings"'); })(),
      "nav unchanged");

    // ---- Fix #37: azan preview plays instantly (no delay on tap) ----
    // Root cause: #audio-azan / #audio-reminder had preload="none", so
    // the first ▶ tap had to fetch + decode the 3.4 MB azan file first.
    check("Fix #37: azan + reminder audio are preloaded (auto), not none",
      html.includes('id="audio-azan" preload="auto"') && html.includes('id="audio-reminder" preload="auto"'),
      "preload auto");
    check("Fix #37: startup kicks off loading both sounds so the first tap plays at once",
      src.includes('["audio-azan","audio-reminder"]') && src.includes("el.load()"),
      "load at startup");
    check("Fix #37: the azan preview still plays the local azan file on tap",
      src.includes('if (sound==="azan"){ const a = $("#audio-azan")') && src.includes("a.play().catch(()=>{})"),
      "preview plays");

    // ---- Fix #38: "ওয়াক্তের নাম (ডিফল্ট)" — say plainly what plays ----
    // The truth: "name" adds no separate sound (spoken only in the ▶
    // preview) — the alarm still plays the azan, and the prayer name
    // shows in the notification. Only "silent" silences it (and before
    // this fix even silent still rang, because every azan entry posted
    // on the azan-v2 channel — now it posts on azan-v2-silent).
    check("Fix #38: the detail page has a plain-words explainer under the sound list",
      html.includes('id="detail-sound-explain"') && src.includes("detailSoundExplain(sel)"),
      "explainer shown");
    check("Fix #38: with the default (name only) the explainer says the azan plays + the name shows (no '(ডিফল্ট)' label — Fix #42)",
      detailSoundExplain(["name"]).includes("আজান বাজবে") && !detailSoundExplain(["name"]).includes("ওয়াক্তের নাম (ডিফল্ট)"),
      "default = azan");
    check("Fix #38: with azan selected the explainer says the azan plays",
      detailSoundExplain(["name","azan"]).includes("আজান বাজবে"), "azan = azan");
    check("Fix #38: with silent selected the explainer says no sound plays",
      detailSoundExplain(["silent"]).includes("নিঃশব্দ") && detailSoundExplain(["silent"]).includes("কোনো সাউন্ড বাজবে না"),
      "silent = silent");
    check("Fix #38: name stays the permanent default (forced into every selection) — the toast is gone (Fix #42)",
      JSON.stringify(normalizeSounds([]))===JSON.stringify(["name"]) &&
      JSON.stringify(normalizeSounds(["silent"]))===JSON.stringify(["silent"]) &&
      !src.includes('ওয়াক্তের নাম সবসময় চালু থাকে'),
      "name locked");
    check("Fix #38: a silent azan posts on the silent channel (native + LN)",
      javaSched.includes('"azan-v2-silent"') && src.includes('id: "azan-v2-silent"'),
      "silent channel");
    check("Fix #38: next-azan info still finds a silent azan entry",
      src.includes('a.type.startsWith("azan-v2")'),
      "next azan");

    // ---- Fix #39: the wrong notification text — kill the zombie alarms ----
    // The current code never schedules "তাড়াতাড়ি..." — the text came
    // from old builds' check/hurry alarms, armed natively (AlarmManager)
    // and re-armed every day by rescheduleNextDay, while the old cancel
    // only touched LocalNotifications. Fix: cancel them natively on
    // EVERY sync, cancel any stale stored alarm on schedule, and never
    // re-arm a fired alarm that is no longer stored.
    check("Fix #39: the exact pre-azan texts (his words) ride BOTH the T-5 and T-2 entries",
      ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(pid=>{
        const pres = buildPrayerAlarmList().filter(a=>a.type==="preazan-v2" && a.prayerId===pid);
        return pres.length===2 && pres.every(a=>a.body===((pid==="Dhuhr" && locNow(a.at).getDay()===5)?JUMUAH_PREAZAN_TEXT:PREAZAN_TEXTS[pid]));
      }),
      "both times, same text");
    check("Fix #39: no hurry wording anywhere — JS or native",
      !src.includes("তাড়াতাড়ি") && !javaSched.includes("তাড়াতাড়ি") && !javaPlugin.includes("তাড়াতাড়ি"),
      "no hurry text");
    // NOTE (Fix #40): window widened 1400 → 2200 — the Fix #40
    // azan-family LN-cancel block lengthened this function; the check's
    // intent (native cancel before the one-time flag) is unchanged.
    check("Fix #39: the legacy cancel hits the NATIVE plugin on every sync (not behind the one-time flag)",
      (() => { const fn = src.slice(src.indexOf("async function cancelLegacyCheckReminders"), src.indexOf("async function cancelLegacyCheckReminders") + 2200);
        return fn.includes("PA.cancelAlarms({ ids })") && fn.indexOf("PA.cancelAlarms") < fn.indexOf("legacy_check_cancelled"); })(),
      "native cancel first");
    check("Fix #39: native schedule cancels stale stored alarms no longer in the new list",
      javaPlugin.includes("stillListed") && javaPlugin.includes("AlarmScheduler.cancel(getContext(), oldId)"),
      "stale cancelled");
    check("Fix #39: a fired alarm that is no longer stored is cancelled, never re-armed",
      javaSched.includes("if (!inStored)") && javaSched.includes("cancel(ctx, alarm.optInt(\"id\", -1))"),
      "no resurrection");

    // ---- Build #19 (user's 23 Nov 2026 WhatsApp list) ----
    const javaReceiver = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmReceiver.java", "utf8");
    const javaUnlock = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodUnlockReceiver.java", "utf8");
    const javaManifest = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/AndroidManifest.xml", "utf8");

    // Fix #1: duplicate home date card is gone (HTML check lives above
    // in the home section); the orphaned CSS rules are gone too and
    // showView no longer hides the header on Home.
    check("Build #19 Fix #1: orphaned home date CSS rules are gone",
      !/\.home-top\s*\{/.test(css) && !/\.home-date\s*\{/.test(css) && !/\.home-cal\s*\{/.test(css) &&
      !/\.home-date-hijri\s*\{/.test(css) && !/\.home-date-greg\s*\{/.test(css) && !/\.home-actions\s*\{/.test(css) &&
      !/#btn-home-notif\s*\{/.test(css), "no home-top rules");
    check("Build #19 Fix #1: showView never hides the header (header date is the one date)",
      !/headerEl\.style\.display/.test(src.slice(src.indexOf("function showView"), src.indexOf("function showView") + 1200)), "header always visible");

    // Fix #2: share buttons are gone from the JS too (HTML check above).
    check("Build #19 Fix #2: shareText + share wirings are gone from JS",
      !src.includes("function shareText") && !src.includes("data-cal-share") &&
      !src.includes('$("#btn-share")') && !src.includes('$("#btn-home-share")'), "no share code");

    // Fix #3: permission chain asks once.
    check("Build #19 Fix #3: per-step asked flags exist in DEFAULTS + are merged on load",
      src.includes("permStepsAsked:{}") && src.includes("settings.permStepsAsked = {...DEFAULTS.permStepsAsked"),
      "asked flags");
    check("Build #19 Fix #3: a step is marked asked BEFORE its request is awaited (a kill mid-chain never re-opens it)",
      (() => { const fn = src.slice(src.indexOf("async function permChainFrom"), src.indexOf("function resumePermChain"));
        return fn.indexOf("permMarkAsked(id)") < fn.indexOf("await permTimeout(permRequestStep(id)") && fn.includes("if (!force && permStepsAsked()[id]) continue"); })(),
      "mark before await");
    check("Build #19 Fix #3: the chain has a stall guard (timeout race) and resumes on foreground return",
      src.includes("function permTimeout(promise, ms)") && src.includes("permTimeout(permRequestStep(id)") && src.includes("resumePermChain()"),
      "stall guard");
    check("Build #19 Fix #3: marking a step asked persists immediately",
      (() => { const before = (settings.permStepsAsked || {}).notifications; permMarkAsked("notifications"); const ok = permStepsAsked().notifications === true && settings.permStepsAsked.notifications === true; if (!before) delete settings.permStepsAsked.notifications; saveSettings(); return ok; })(),
      "persisted");

    // Fix #4: v4 dhikr channels (native is the sole creator) — see also
    // the updated Fix #18 / Fix #33 checks above.
    check("Build #19 Fix #4: no JS createChannel for dhikr (native is the sole creator)",
      !/LN\.createChannel\(\{ id: "dhikr-/.test(src), "one creator");
    check("Build #19 Fix #4: native deletes the v2 channels (incl. silent twins)",
      javaSched.includes('deleteNotificationChannel("dhikr-durood-v2")') && javaSched.includes('deleteNotificationChannel("dhikr-istighfar-v2")') &&
      javaSched.includes('deleteNotificationChannel("dhikr-durood-v2-silent")') && javaSched.includes('deleteNotificationChannel("dhikr-istighfar-v2-silent")'),
      "v2 deleted");

    // Fix #5: spoken pre-azan reminders.
    check("Build #19 Fix #5: both pre-azan entries carry speak:true (T-5 and T-2, every fard prayer)",
      ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(pid=>{
        const pres = buildPrayerAlarmList().filter(a=>a.type==="preazan-v2" && a.prayerId===pid);
        return pres.length===2 && pres.every(a=>a.speak===true && a.body===((pid==="Dhuhr" && locNow(a.at).getDay()===5)?JUMUAH_PREAZAN_TEXT:PREAZAN_TEXTS[pid]));
      }), "speak flag");
    check("Build #19 Fix #5: syncPrayerAlarms passes speak through to the native plugin",
      src.includes("speak: !!a.speak"), "passthrough");
    check("Build #19 Fix #5: foreground voice check exists, speaks the exact Fix #8 text in Bengali, and is wired into the 1 s tick",
      src.includes("function checkPreAzanVoice()") && src.includes('speakText(preazanText(p, locNow()), "bn-BD")') &&
      src.includes("checkAzan(); checkPreAzanVoice();"), "foreground voice");
    check("Build #19 Fix #5: native pending intent carries speak + the reschedule keeps it",
      javaSched.includes('i.putExtra("speak", alarm.optBoolean("speak", false))') &&
      javaReceiver.includes('alarm.put("speak", intent.getBooleanExtra("speak", false))'), "native carry");
    check("Build #19 Fix #5: native AlarmReceiver speaks the body with Bengali TTS (goAsync, best-effort)",
      javaReceiver.includes('tts.setLanguage(new Locale("bn"))') && javaReceiver.includes('tts.speak(text, TextToSpeech.QUEUE_FLUSH') &&
      javaReceiver.includes("goAsync()") && javaReceiver.includes("speakViaTts"), "native TTS");
    // Functional: at Fajr-5 the foreground voice speaks the exact Fajr text once.
    {
      const _tzB19 = settings.tzName; settings.tzName = "";
      const _spoken = [];
      globalThis.SpeechSynthesisUtterance = class { constructor(t){ this.text = t; this.lang = ""; } };
      globalThis.speechSynthesis = { cancel(){}, speak(u){ _spoken.push(u); } };
      __setTimings({ Fajr:"05:42", Dhuhr:"13:01", Asr:"16:24", Maghrib:"18:58", Isha:"20:11" });
      const _RealDateB19 = Date;
      const _t5 = new Date(); _t5.setHours(5,37,0,0);
      globalThis.Date = class extends _RealDateB19 {
        constructor(...a){ super(...(a.length ? a : [_t5.getTime()])); }
        static now(){ return _t5.getTime(); }
      };
      checkPreAzanVoice();
      check("Build #19 Fix #5: at Fajr-5 the voice speaks the exact Fajr pre-azan text in Bengali, once",
        _spoken.length === 1 && _spoken[0].text === PREAZAN_TEXTS.Fajr && _spoken[0].lang === "bn-BD",
        _spoken.length ? _spoken[0].text.slice(0, 40) : "nothing spoken");
      checkPreAzanVoice();
      check("Build #19 Fix #5: the same minute does not speak twice (once-per-day guard)",
        _spoken.length === 1, "spoken once");
      const _t2 = new Date(); _t2.setHours(5,40,0,0);
      globalThis.Date = class extends _RealDateB19 {
        constructor(...a){ super(...(a.length ? a : [_t2.getTime()])); }
        static now(){ return _t2.getTime(); }
      };
      checkPreAzanVoice();
      check("Build #19 Fix #5: at Fajr-2 the voice speaks the same exact text again",
        _spoken.length === 2 && _spoken[1].text === PREAZAN_TEXTS.Fajr && _spoken[1].lang === "bn-BD",
        "T-2 spoken");
      globalThis.Date = _RealDateB19; settings.tzName = _tzB19;
      delete globalThis.speechSynthesis; delete globalThis.SpeechSynthesisUtterance;
    }

    // Fix #6: durood on unlock — receiver hardened; manifest still
    // registers it and the JS still syncs the native toggle at init.
    // (UPDATED Fix #45: the explicit player moved to DuroodPlayer —
    // the shared player for unlock auto-play + the ✅ replay.)
    const _playB19 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodPlayer.java", "utf8");
    check("Build #19 Fix #6 (UPDATED Fix #45): the shared durood player uses explicit notification audio attributes + full volume",
      _playB19.includes("AudioAttributes.USAGE_NOTIFICATION") && _playB19.includes("CONTENT_TYPE_SONIFICATION") &&
      _playB19.includes("setVolume(1.0f, 1.0f)") && _playB19.includes("createPlayer"), "explicit audio");
    check("Build #19 Fix #6 (UPDATED Fix #45): the shared durood player keeps the create() fallback if the explicit build fails",
      _playB19.includes("MediaPlayer.create(context, R.raw.durood)"), "fallback");
    check("Build #19 Fix #6: receiver is still registered for USER_PRESENT and the JS still syncs the toggle at init",
      javaManifest.includes("DuroodUnlockReceiver") && javaManifest.includes("android.intent.action.USER_PRESENT") &&
      src.includes("syncDuroodToggleNative()"), "wiring intact");

    // Fix #7: "Chepor" → "Chemor".
    check("Build #19 Fix #7: villageNameOf normalises Chepor → Chemor (all Nominatim fields)",
      villageNameOf({ city: "Chepor" }) === "Chemor" && villageNameOf({ village: "Chepor" }) === "Chemor" &&
      villageNameOf({ suburb: "Chepor" }) === "Chemor" && villageNameOf({ city: "Chemor" }) === "Chemor",
      "normalised");
    check("Build #19 Fix #7: no stray 'Chepor' literal in the app source (only the fix mapping + comments)",
      !/Chepor/.test(html) && !/Chepor/.test(css) &&
      !/Chepor/.test(src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "")),
      "no stray Chepor");
    check("Build #19 Fix #7: the gazetteer knows Chepor's coordinates as Chemor",
      src.includes('"chepor": [4.72, 101.12]'), "gazetteer");

    // Post-Build #19 decisions (24 Nov 2026, user delegated "sob tumi koro"):
    // version bump + calendar forbidden windows aligned to forbiddenWindows().
    const gradle = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/build.gradle", "utf8");
    check("Post-#19 version: versionName is 2.0 (matches aboutLine1 'My Deen v2.0'), versionCode untouched at 1",
      gradle.includes('versionName "2.0"') && gradle.includes("versionCode 1") && src.includes('aboutLine1:"My Deen v2.0'),
      "gradle 2.0 / code 1");
    check("Post-#19 calendar: forbidden line uses forbiddenWindows() values (dh-4→dh+2, mg-15→mg), old dh-10/mg-25 gone",
      src.includes("start:dhuhr-4, end:dhuhr+2") && src.includes("start:magh-15, end:magh") &&
      src.includes("minsToHHMM(dh-4)") && src.includes("minsToHHMM(dh+2)") && src.includes("minsToHHMM(mg-15)") &&
      !src.includes("dh-10") && !src.includes("mg-25"),
      "aligned");

    // ---- Fix #40 (24 Nov 2026 voice call): azan speaks the waqt name,
    // durood reminder sound verified end to end, azan never rings twice.
    check("Fix #41 Step 2: azan announcement texts are the pre-azan preparation sentences, exact (all 5 prayers)",
      AZAN_SPEAK_TEXTS.Fajr === "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
      AZAN_SPEAK_TEXTS.Dhuhr === "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
      AZAN_SPEAK_TEXTS.Asr === "আসরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
      AZAN_SPEAK_TEXTS.Maghrib === "মাগরিবের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
      AZAN_SPEAK_TEXTS.Isha === "ইশার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন",
      "announcement texts");
    check("Fix #40: Fix #8 pre-azan texts are still verbatim (md5 unchanged)",
      (()=>{ const crypto = require("crypto"); const m = src.match(/const PREAZAN_TEXTS = \{[\s\S]*?\};/); return !!m && crypto.createHash("md5").update(m[0] + "\n").digest("hex") === "e0895852d481badfb2f41c441bd82a83"; })(),
      "md5 e0895852");
    check("Fix #40: syncPrayerAlarms passes speakText through to the native plugin",
      src.includes("speakText: a.speakText"), "passthrough");
    check("Fix #40: native pending intent carries speakText + the reschedule keeps it",
      javaSched.includes('i.putExtra("speakText", alarm.optString("speakText", ""))') &&
      javaReceiver.includes('alarm.put("speakText", st)'), "native carry");
    check("Fix #40: native AlarmReceiver prefers speakText over the body when speaking",
      javaReceiver.includes('String toSpeak = (speakText != null && !speakText.isEmpty()) ? speakText : body;'),
      "speakText preferred");
    check("Fix #40: LN fallback schedules one-shot azans — no repeats (the plugin repeats an `at` anchor with interval = at-now)",
      !src.includes("repeats: true"), "no repeats");
    check("Fix #40: every sync cancels the azan-family ids through LN (kills stale LN repeats)",
      src.includes("const azanFamily = [...AZAN_IDS, ...PREAZAN_IDS, ...PREAZAN5_IDS, TAHAJJUD_ID, SEHRI_ID, IFTAR_ID, ...FORB_IDS, DUHA_ID];"),
      "azan-family LN cancel");
    check("Fix #40: native creates the v4 dhikr channels WITH their sounds (durood/istighfar) + silent twins without",
      javaSched.includes('"dhikr-durood-v4"') && javaSched.includes("R.raw.durood") &&
      javaSched.includes('"dhikr-istighfar-v4"') && javaSched.includes("R.raw.istighfar") &&
      javaSched.includes('"dhikr-durood-v4-silent"') && javaSched.includes('"dhikr-istighfar-v4-silent"'),
      "v4 sound channels");
    // Functional Fix #40 block: alarm list, sync paths, dhikr channels, foreground tick.
    {
      const _saved40 = JSON.parse(JSON.stringify({ alarmOn: settings.alarmOn, alarmSound: settings.alarmSound, offsets: settings.offsets,
        duroodRemOn: settings.duroodRemOn, duroodRemMin: settings.duroodRemMin, duroodRemSound: settings.duroodRemSound,
        astaghRemOn: settings.astaghRemOn, astaghRemMin: settings.astaghRemMin, astaghRemSound: settings.astaghRemSound, azan: settings.azan }));
      const _tz40 = settings.tzName; settings.tzName = "";
      const _RealDate40 = Date;
      const _lnCancel40 = [], _lnSched40 = [];
      const _mock40 = (paSched, paStatus) => {
        globalThis.Capacitor = { Plugins: {
          PrayerAlarm: { scheduleAlarms: paSched, cancelAlarms: async()=>({cancelled:0}), getStatus: async()=>paStatus },
          LocalNotifications: { cancel: async(a)=>{ _lnCancel40.push(a); return {}; },
            requestPermissions: async()=>({display:"granted"}), createChannel: async()=>({}),
            schedule: async(a)=>{ _lnSched40.push(a); return {}; } },
        }};
      };
      try {
        settings.azan = true;
        settings.alarmOn = {Fajr:true, Dhuhr:true, Asr:true, Maghrib:true, Isha:true, Duha:false, Tahajjud:false, ForbMorning:false, ForbNoon:false, ForbEvening:false, Sehri:false, Iftar:false};
        settings.alarmSound = {Fajr:["azan"], Dhuhr:["azan"], Asr:["azan"], Maghrib:["azan"], Isha:["azan"], Duha:["name"], Tahajjud:["name"], ForbMorning:["name"], ForbNoon:["name"], ForbEvening:["name"], Sehri:["name"], Iftar:["name"]};
        settings.offsets = {Fajr:0, Dhuhr:0, Asr:0, Maghrib:0, Isha:0, Duha:0, Tahajjud:0, ForbMorning:0, ForbNoon:0, ForbEvening:0, Sehri:0, Iftar:0};
        __setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:01", Asr:"16:24", Maghrib:"18:58", Isha:"20:11", Imsak:"05:32", Sunset:"18:00", Lastthird:"03:01"});
        // Alarm list: speak + speakText, one azan per prayer, silent stays silent.
        const _al40 = buildPrayerAlarmList();
        check("Fix #40: every azan entry carries speak:true + its announcement (all 5 prayers)",
          ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(pid=>{
            const a = _al40.filter(x=>x.type.startsWith("azan-v2") && x.prayerId===pid);
            return a.length===1 && a[0].speak===true && a[0].speakText===AZAN_SPEAK_TEXTS[pid];
          }), "speak + speakText");
        check("Fix #40: exactly ONE azan entry per prayer per day (no duplicate ids)",
          (()=>{
            const ids = _al40.map(a=>a.id);
            return new Set(ids).size === ids.length && _al40.filter(a=>a.type.startsWith("azan-v2")).length === 5;
          })(), "one each");
        settings.alarmSound.Dhuhr = ["silent"];
        const _al40s = buildPrayerAlarmList().filter(a=>a.prayerId==="Dhuhr" && a.type.startsWith("azan-v2"));
        check("Fix #40: a silent prayer posts on the silent channel and does NOT speak",
          _al40s.length===1 && _al40s[0].type==="azan-v2-silent" && _al40s[0].speak===false && !_al40s[0].speakText,
          "silent stays silent");
        settings.alarmSound.Dhuhr = ["azan"];
        settings.alarmOn.Dhuhr = false;
        check("Fix #40: a prayer with its alarm off has no azan entry at all",
          buildPrayerAlarmList().filter(a=>a.type.startsWith("azan-v2") && a.prayerId==="Dhuhr").length===0, "off = no entry");
        settings.alarmOn.Dhuhr = true;
        // Sync with the native plugin: the LN cancel must still kill the azan-family ids.
        _lnCancel40.length = 0; _lnSched40.length = 0;
        _mock40(async()=>({scheduled:30, skipped:0}), {notificationsGranted:true, exactAlarmGranted:true, alarmsScheduled:30});
        await syncPrayerAlarms(); await refreshAlarmStatus();
        check("Fix #40: native sync still cancels the azan-family ids through LN (stale repeats die)",
          _lnCancel40.some(a=>{ const ids=(a.notifications||[]).map(n=>n.id); return [1,2,3,4,5,31,32,33,34,35,51,52,53,54,55,36,37,38,41,42,43,44].every(id=>ids.includes(id)); }),
          "LN cancel on native sync");
        check("Fix #40: native is reported armed after a clean sync (exact + notifications granted, 0 skipped)",
          nativeAzanArmed()===true, "armed");
        // Sync with the plugin throwing: the LN fallback schedules one-shots, never repeats.
        _lnCancel40.length = 0; _lnSched40.length = 0;
        _mock40(async()=>{ throw new Error("plugin down"); }, {notificationsGranted:true, exactAlarmGranted:true, alarmsScheduled:0});
        await syncPrayerAlarms();
        check("Fix #40 (UPDATED Fix #43): the LN fallback schedules one-shot entries only and NEVER a sounding azan (no azan channel, no azan.mp3 sound)",
          _lnSched40.length>0 && _lnSched40.every(a=>(a.notifications||[]).every(n=>!n.schedule || !n.schedule.repeats)) &&
          _lnSched40.every(a=>(a.notifications||[]).every(n=>n.channelId!=="azan-v2" && n.sound!=="azan.mp3")),
          "fallback never azan");
        delete globalThis.Capacitor;
        // Durood reminder channels: sound on → v4 + sound; sound off → v4-silent, no sound.
        settings.duroodRemOn = true; settings.duroodRemMin = 10; settings.duroodRemSound = true;
        settings.astaghRemOn = true; settings.astaghRemMin = 2; settings.astaghRemSound = true;
        _lnSched40.length = 0;
        globalThis.Capacitor = { Plugins: { LocalNotifications: { cancel: async()=>({}), schedule: async(a)=>{ _lnSched40.push(a); return {}; } } } };
        await scheduleNativeDhikr();
        const _d40 = _lnSched40.flatMap(a=>a.notifications||[]);
        check("Fix #40: durood reminders schedule on the v4 sound channel with durood.mp3 (sound on)",
          _d40.filter(n=>n.channelId==="dhikr-durood-v4").length===24 && _d40.filter(n=>n.channelId==="dhikr-durood-v4").every(n=>n.sound==="durood.mp3"),
          "durood v4 sound");
        check("Fix #40: istighfar reminders schedule on the v4 sound channel with istighfar.mp3 (sound on)",
          _d40.filter(n=>n.channelId==="dhikr-istighfar-v4").length===24 && _d40.filter(n=>n.channelId==="dhikr-istighfar-v4").every(n=>n.sound==="istighfar.mp3"),
          "istighfar v4 sound");
        settings.duroodRemSound = false; settings.astaghRemSound = false;
        _lnSched40.length = 0;
        await scheduleNativeDhikr();
        const _d40s = _lnSched40.flatMap(a=>a.notifications||[]);
        check("Fix #40: sound off schedules on the v4-silent channels with no sound",
          _d40s.filter(n=>n.channelId==="dhikr-durood-v4-silent").length===24 && _d40s.filter(n=>n.channelId==="dhikr-istighfar-v4-silent").length===24 &&
          _d40s.every(n=>!n.sound), "silent twins");
        delete globalThis.Capacitor;
        // Foreground tick: web (no native) speaks + plays once; native-armed stays quiet; silent stays silent.
        const _spoken40 = [];
        globalThis.SpeechSynthesisUtterance = class { constructor(t){ this.text = t; this.lang = ""; } };
        globalThis.speechSynthesis = { cancel(){}, speak(u){ _spoken40.push(u); } };
        let _played40 = false;
        __$("#audio-azan").play = ()=>{ _played40 = true; return Promise.resolve(); };
        const _at40 = (h, m)=>{ const t = new Date(); t.setHours(h, m, 0, 0); return t; };
        const _mockDate40 = (t)=>{ globalThis.Date = class extends _RealDate40 { constructor(...a){ super(...(a.length ? a : [t.getTime()])); } static now(){ return t.getTime(); } }; };
        settings.alarmSound = {Fajr:["azan"], Dhuhr:["azan"], Asr:["azan"], Maghrib:["azan"], Isha:["azan"], Duha:["name"], Tahajjud:["name"], ForbMorning:["name"], ForbNoon:["name"], ForbEvening:["name"], Sehri:["name"], Iftar:["name"]};
        _mockDate40(_at40(13, 1)); checkAzan();
        check("Fix #40: foreground tick speaks the Dhuhr announcement once in Bengali and plays the azan (no native)",
          _spoken40.length===1 && _spoken40[0].text===AZAN_SPEAK_TEXTS.Dhuhr && _spoken40[0].lang==="bn-BD" && _played40===true,
          _spoken40.length ? _spoken40[0].text.slice(0, 40) : "nothing spoken");
        checkAzan();
        check("Fix #40: the same minute does not speak or play twice (once-per-day guard)",
          _spoken40.length===1 && _played40===true, "once only");
        // Native armed: Asr minute stays quiet (the native alarm rings + speaks instead).
        _mock40(async()=>({scheduled:30, skipped:0}), {notificationsGranted:true, exactAlarmGranted:true, alarmsScheduled:30});
        await syncPrayerAlarms(); await refreshAlarmStatus();
        _spoken40.length = 0; _played40 = false;
        _mockDate40(_at40(16, 24)); checkAzan();
        check("Fix #40: with the native alarm armed the foreground tick plays nothing and speaks nothing (no double azan)",
          _spoken40.length===0 && _played40===false && Object.keys(__getRungToday()).some(k=>k.endsWith("Asr")),
          "native handles it");
        delete globalThis.Capacitor;
        // Silent: Isha minute stays quiet even with no native alarm.
        settings.alarmSound.Isha = ["silent"];
        _spoken40.length = 0; _played40 = false;
        _mockDate40(_at40(20, 11)); checkAzan();
        check("Fix #40: a silent prayer stays silent in the foreground tick too (no audio, no speech)",
          _spoken40.length===0 && _played40===false, "silent foreground");
        delete globalThis.speechSynthesis; delete globalThis.SpeechSynthesisUtterance;
      } finally {
        Object.assign(settings, _saved40);
        settings.tzName = _tz40; globalThis.Date = _RealDate40;
        delete globalThis.Capacitor;
      }
    }

    // ---- Fix #42 (27 Nov 2026 voice call): unlock durood, brand-neutral ----
    // The user confirmed he already gave ALL settings on his Realme
    // (Autostart ON + Battery "No restrictions") and the unlock durood
    // STILL does not play — the settings explanation is ruled out, so a
    // settings page is NOT the fix. The break is delivery: the system
    // never delivers ACTION_USER_PRESENT to a dead app. The fix is the
    // UnlockKeepAliveService (a lightweight foreground service that
    // keeps the app alive, started on app open / boot / toggle). The
    // old Xiaomi autostart button (openDuroodAutostart + MIUI deep link)
    // is removed entirely and replaced by a brand-neutral button that
    // opens the generic Android app-settings page. Nothing about the
    // durood itself changes — still ONLY on unlock; astaghfirullah and
    // the pre-azan texts are untouched.
    {
      const _saved41 = { duroodOnUnlock: settings.duroodOnUnlock, duroodAppSettingsOpened: settings.duroodAppSettingsOpened, lang: settings.lang };
      settings.lang = "bn";
      const _toastEl41 = document.getElementById("toast");
      const _btn41 = document.getElementById("btn-durood-appsettings");
      const _row41 = document.getElementById("durood-appsettings-row");
      const _hint41 = document.getElementById("durood-appsettings-hint");
      try {
        // Tapping the button calls the native appsettings step, records
        // that the page opened, and confirms the page opened (it does
        // NOT claim the settings are the fix — the keep-alive service is).
        let _req41 = [];
        globalThis.Capacitor = { Plugins: {
          PrayerAlarm: { requestStep: async(a)=>{ _req41.push(a); return { opened: true }; } },
        }};
        settings.duroodAppSettingsOpened = false;
        await openDuroodAppSettings();
        check("Fix #42: tapping the app-settings button calls native requestStep({step:'appsettings'})",
          _req41.length===1 && _req41[0] && _req41[0].step==="appsettings", JSON.stringify(_req41));
        check("Fix #42: opening the page records settings.duroodAppSettingsOpened",
          settings.duroodAppSettingsOpened===true, "flag set");
        check("Fix #42: success toast only confirms the page opened (no settings-as-fix claim)",
          typeof _toastEl41.textContent==="string" && _toastEl41.textContent.includes("অ্যাপের সেটিংস খুলেছে") && !_toastEl41.textContent.includes("তাহলে আনলক করলে দরুদ বাজবে"), _toastEl41.textContent);
        // When the page cannot be opened the flag stays false and the
        // toast falls back to the manual path (no false "opened" claim).
        _req41 = [];
        globalThis.Capacitor = { Plugins: {
          PrayerAlarm: { requestStep: async(a)=>{ _req41.push(a); return { opened: false }; } },
        }};
        settings.duroodAppSettingsOpened = false;
        await openDuroodAppSettings();
        check("Fix #42: a failed open does NOT record the page as opened",
          settings.duroodAppSettingsOpened===false, "flag stays false");
        check("Fix #42: a failed open toasts the manual Settings path instead",
          typeof _toastEl41.textContent==="string" && _toastEl41.textContent.includes("Settings → Apps"), _toastEl41.textContent);
        // The row is native-only: hidden on web (no Capacitor), shown on
        // native, and the button is wired by fillSettings().
        delete globalThis.Capacitor;
        fillSettings();
        check("Fix #42: app-settings row is hidden on web (no unlock durood there)",
          _row41.style.display==="none", "web hidden");
        check("Fix #42: hint says the app keeps itself running (no settings-as-fix claim)",
          typeof _hint41.textContent==="string" && _hint41.textContent.includes("নিজে থেকেই চালু থাকে"), _hint41.textContent);
        globalThis.Capacitor = { Plugins: {
          PrayerAlarm: { requestStep: async()=>({ opened: true }) },
        }};
        fillSettings();
        check("Fix #42: app-settings row is shown on native Android and the button is wired",
          _row41.style.display!=="none" && typeof _btn41.onclick==="function", "native shown + wired");
        check("Fix #42: button label is the one-tap app-settings action",
          typeof _btn41.textContent==="string" && _btn41.textContent.includes("অ্যাপের সেটিংস খুলুন"), _btn41.textContent);
        // Toggle OFF still syncs disabled to the native receiver, and
        // the default is still ON (the pref default is true either way).
        let _du41 = [];
        globalThis.Capacitor = { Plugins: {
          DuroodUnlock: { setEnabled: (a)=>{ _du41.push(a); } },
        }};
        settings.duroodOnUnlock = false; syncDuroodToggleNative();
        check("Fix #42: durood OFF still syncs enabled:false to the native receiver",
          _du41.length===1 && _du41[0].enabled===false, JSON.stringify(_du41));
        settings.duroodOnUnlock = true; syncDuroodToggleNative();
        check("Fix #42: durood ON syncs enabled:true to the native receiver",
          _du41.length===2 && _du41[1].enabled===true, JSON.stringify(_du41));
        // Delivery chain pins (static): the receiver is manifest-registered
        // exported with USER_PRESENT, and the clip is bundled in the APK.
        const _man41 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/AndroidManifest.xml", "utf8");
        check("Fix #42: DuroodUnlockReceiver is manifest-registered exported with USER_PRESENT",
          _man41.includes('android:name=".DuroodUnlockReceiver" android:exported="true"') && _man41.includes("android.intent.action.USER_PRESENT"), "manifest");
        check("Fix #42: res/raw/durood.mp3 is bundled (the clip the receiver plays)",
          fs.existsSync("/home/hatch/workspace/deen-day/android/app/src/main/res/raw/durood.mp3"), "raw clip");
        // Native honesty pin: requestStep("appsettings") returns the real
        // opened value, and the opener only reports success when an
        // intent actually resolved — and the MIUI deep link is gone.
        const _pa41 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/PrayerAlarmPlugin.java", "utf8");
        check("Fix #42: native requestStep('appsettings') returns the real opened value (no hardcoded true)",
          _pa41.includes('ret.put("opened", openAppSettings())') && !_pa41.includes('ret.put("opened", true)'), "honest opened");
        check("Fix #42: native app-settings opener guards its intent with resolveActivity and returns boolean — no MIUI component",
          _pa41.includes("private boolean openAppSettings()") && _pa41.includes("resolveActivity(getContext().getPackageManager()) != null") && !_pa41.includes("AutoStartManagementActivity") && !_pa41.includes("com.miui.securitycenter"), "guarded opener");
        // Absence pins: the MIUI autostart button, its deep-link step
        // and the Xiaomi help text are gone from the shipped app.
        const _src41 = fs.readFileSync("/home/hatch/workspace/deen-day/www/app.js", "utf8");
        check("Fix #42: no openDuroodAutostart anywhere in the shipped JS",
          !_src41.includes("openDuroodAutostart"), "button gone");
        check("Fix #42: no requestStep(\"autostart\") anywhere in the shipped JS",
          !_src41.includes('requestStep("autostart")'), "step gone");
        check("Fix #42: no Xiaomi help string in the shipped JS",
          !_src41.includes("Xiaomi ফোন অ্যাপ বন্ধ করে দিলে আনলকের দরুদ বাজে না"), "help gone");
        // Untouched pins: astaghfirullah reminder code and the Fix #8
        // pre-azan texts are not modified by this step.
        check("Fix #42: this step does not touch the astaghfirullah reminder (astaghRem keys intact)",
          _src41.includes("astaghRemOn") && _src41.includes("astaghRemMin") && _src41.includes("astaghRemSound"), "astaghfirullah intact");
      } finally {
        settings.duroodOnUnlock = _saved41.duroodOnUnlock;
        settings.duroodAppSettingsOpened = _saved41.duroodAppSettingsOpened;
        settings.lang = _saved41.lang;
        delete globalThis.Capacitor;
      }
    }

    // ---- Fix #41 Step 2 (24 Nov 2026 voice call ~22:47, NEW DIRECTION) ----
    // The Home alarm warning is REMOVED entirely — no banner, no dead
    // button. Instead a fresh install asks for ALL permissions at once
    // in the first-run chain (location first), once, and never again.
    // And saving settings must never re-ask for location.
    {
      const _saved42 = {...settings};
      const _savedAsked42 = {...(settings.permStepsAsked || {})};
      const _realFetch42 = globalThis.fetch;
      globalThis.fetch = async()=>{ throw new Error("network down"); };
      settings.lang = "bn";
      try {
        // Static: the warning is gone from the shipped app.
        check("Fix #41 Step 2: no Home warning banner in the shipped HTML (div removed)",
          !html.includes('id="alarm-warn"') && !html.includes("alarm-warn"), "div gone");
        check("Fix #41 Step 2: no dead allow button or its handler left in the shipped JS",
          !src.includes("alarm-warn-btn") && !src.includes("function requestAllPermissions"), "button gone");
        check("Fix #41 Step 2: the old nag text is gone from the shipped JS",
          !src.includes("অনুমতি দিন, নইলে আজান বাজবে না") && !src.includes("ওপরে অনুমতি দিন"), "nag gone");
        check("Fix #41 Step 2: location is the FIRST step of the first-run chain",
          src.includes('const PERM_STEPS = ["location", "notifications", "exact", "battery", "appsettings"]'), "location first");
        check("Fix #41 Step 2: permStatus reports the location grant and permRequestStep asks it via detectLocation(false)",
          src.includes("location: locGranted") && src.includes('if (id === "location")') && src.includes("await detectLocation(false)"), "chain wiring");
        check("Fix #41 Step 2: detectLocation checks the real status first and never prompts from an automatic path",
          src.includes("await locPermStatus()") && src.includes('if (auto && st !== "granted") return false'), "status gate");
        check("Fix #41 Step 2: native exact-alarm opener is guarded and reports honestly",
          javaPlugin.includes("private boolean openExactAlarmSettingsIfNeeded()") &&
          javaPlugin.includes("Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM") &&
          javaPlugin.includes('ret.put("opened", opened)') && javaPlugin.includes('ret.put("granted", exactAlarmGranted())'),
          "honest exact");

        // ---- location gate: a controllable Geolocation stub ----
        const _geoCalls = { n: 0 };
        let _geoStatus = "prompt";
        const _mockGeo = () => {
          globalThis.Capacitor = { Plugins: {
            Geolocation: {
              checkPermissions: async()=>({location: _geoStatus}),
              getCurrentPosition: async()=>{ _geoCalls.n++; return {coords:{latitude:4.72, longitude:101.12, accuracy:10}}; },
            },
          }};
        };
        _mockGeo();
        settings.locManual = false; settings.locPermGranted = false;
        _geoStatus = "denied"; _geoCalls.n = 0;
        check("Fix #41 Step 2: auto detect with location DENIED never asks (0 GPS calls, silent false)",
          (await detectLocation(true)) === false && _geoCalls.n === 0, "denied+auto");
        _geoStatus = "prompt"; _geoCalls.n = 0;
        check("Fix #41 Step 2: auto detect with status PROMPT never asks (0 GPS calls, silent false)",
          (await detectLocation(true)) === false && _geoCalls.n === 0, "prompt+auto");
        _geoStatus = "granted"; _geoCalls.n = 0;
        check("Fix #41 Step 2: auto detect with location GRANTED runs once and remembers the grant",
          (await detectLocation(true)) === true && _geoCalls.n === 1 && settings.locPermGranted === true, "granted+auto");
        _geoStatus = "prompt"; _geoCalls.n = 0;
        check("Fix #41 Step 2: an explicit GPS tap with status PROMPT may ask once",
          (await detectLocation(false)) === true && _geoCalls.n === 1, "prompt+tap");
        _geoStatus = "denied"; _geoCalls.n = 0;
        check("Fix #41 Step 2: an explicit GPS tap with location DENIED never re-prompts (0 GPS calls, manual path toasted)",
          (await detectLocation(false)) === false && _geoCalls.n === 0 && els["#toast"].textContent.includes("সেটিংস"),
          "denied+tap");

        // ---- saving settings never touches GPS ----
        _geoStatus = "prompt"; _geoCalls.n = 0;
        settings.city = "Chemor"; settings.country = "Malaysia"; settings.lat = 4.72; settings.lon = 101.12;
        settings.useCoords = true; settings.locManual = false; settings.autoLoc = true;
        await saveSettingsFromUI();
        check("Fix #41 Step 2: saving settings with location already set triggers NO permission request (0 GPS calls)",
          _geoCalls.n === 0, "save never asks");

        // ---- first-run chain: all permissions once, then never again ----
        const _stepCalls = [];
        globalThis.Capacitor = { Plugins: {
          Geolocation: {
            checkPermissions: async()=>({location: _geoStatus}),
            getCurrentPosition: async()=>{ _geoCalls.n++; return {coords:{latitude:4.72, longitude:101.12, accuracy:10}}; },
          },
          PrayerAlarm: {
            scheduleAlarms: async()=>({scheduled:0, skipped:0}),
            getStatus: async()=>({notificationsGranted:false, exactAlarmGranted:false, alarmsScheduled:0, batteryExempt:true}),
            requestStep: async(a)=>{ _stepCalls.push(a.step); return a.step === "exact" ? {opened:false, granted:false} : {opened:true, granted:true}; },
          },
          LocalNotifications: { cancel: async()=>({}), requestPermissions: async()=>({display:"granted"}), schedule: async()=>({}) },
        }};
        _geoStatus = "prompt"; _geoCalls.n = 0; _stepCalls.length = 0;
        settings.permStepsAsked = {}; settings.onboarded = false; settings.locPermGranted = false;
        settings.locManual = false; settings.autoLoc = true;
        await runPermChain(false);
        check("Fix #41 Step 2: first run asks location (via GPS, once) + notifications + exact + appsettings (via requestStep, once each)",
          _geoCalls.n === 1 && ["notifications","exact","appsettings"].every(s=>_stepCalls.filter(x=>x===s).length === 1),
          "location via GPS x1; " + _stepCalls.join(","));
        check("Fix #41 Step 2: a failed exact-alarm open toasts the manual Settings path instead of stalling",
          els["#toast"].textContent.includes("Alarms & reminders"), "manual path");
        check("Fix #41 Step 2: the first run finishes and marks onboarded (never asks again)",
          settings.onboarded === true, "onboarded");
        const _callsAfterFirst = _stepCalls.length;
        await runPermChain(false);
        check("Fix #41 Step 2: a second run asks nothing again (ask-once)",
          _stepCalls.length === _callsAfterFirst && _geoCalls.n === 1, "asked once");
      } finally {
        Object.assign(settings, _saved42);
        settings.permStepsAsked = _savedAsked42;
        globalThis.fetch = _realFetch42;
        delete globalThis.Capacitor;
      }
    }

    // ---- Fix #41 Step 1 hole (24 Nov 2026 night): the exact-alarm
    // step paused the chain whenever the page did NOT open with
    // granted=false — including when the plugin threw (res null), when
    // the 30 s stall guard fired ("timeout"), or when the page did not
    // open but the grant was already true. No return ever comes in
    // those cases, so the chain stalled silently until the next
    // foreground event and a tap looked dead. Now the chain pauses
    // ONLY when a system page actually opened.
    {
      const _saved41h = {...settings};
      const _savedAsked41h = {...(settings.permStepsAsked || {})};
      const _realFetch41h = globalThis.fetch;
      globalThis.fetch = async()=>{ throw new Error("network down"); };
      settings.lang = "bn";
      check("Fix #41 Step 1 hole: permChainFrom pauses ONLY when the exact-alarm page actually opened (res.opened === true)",
        (() => { const fn = src.slice(src.indexOf("async function permChainFrom"), src.indexOf("function resumePermChain"));
          return fn.includes('res && res !== "timeout" && res.opened === true') && fn.includes("permChainWaiting = true") &&
            !fn.includes("res.opened === false && !res.granted"); })(),
        "pause on open only");
      // Functional: drive the chain with a stubbed plugin, one exact-step
      // outcome at a time. Location granted + notifications granted +
      // battery exempt, so only the exact step is exercised.
      let _geoStatus41h = "granted";
      let _exactRes41h = {opened:false, granted:false};
      let _exactThrow41h = false;
      const _setup41h = () => {
        globalThis.Capacitor = { Plugins: {
          Geolocation: {
            checkPermissions: async()=>({location: _geoStatus41h}),
            getCurrentPosition: async()=>({coords:{latitude:4.72, longitude:101.12, accuracy:10}}),
          },
          PrayerAlarm: {
            scheduleAlarms: async()=>({scheduled:0, skipped:0}),
            getStatus: async()=>({notificationsGranted:true, exactAlarmGranted:false, alarmsScheduled:0, batteryExempt:true}),
            requestStep: async(a)=>{ if (a.step === "exact"){ if (_exactThrow41h) throw new Error("plugin threw"); return _exactRes41h; } return {opened:true, granted:true}; },
          },
          LocalNotifications: { cancel: async()=>({}), requestPermissions: async()=>({display:"granted"}), schedule: async()=>({}) },
        }};
        settings.permStepsAsked = {}; settings.onboarded = false; settings.locPermGranted = false;
        settings.locManual = false; settings.autoLoc = true;
        els["#toast"].textContent = "";
      };
      try {
        // (1) plugin throws → res null → chain continues, manual path toasted, onboarded.
        _exactThrow41h = true; _exactRes41h = {opened:false, granted:false}; _setup41h();
        await runPermChain(false);
        check("Fix #41 Step 1 hole: plugin throws at the exact step (res null) → chain continues instead of stalling",
          settings.onboarded === true && __permChainState().waiting === false, "onboarded");
        check("Fix #41 Step 1 hole: plugin throws at the exact step → manual Settings path toasted once",
          els["#toast"].textContent.includes("Alarms & reminders"), "manual path");
        // (2) stall guard fires → res "timeout" → chain continues.
        _exactThrow41h = false;
        const _realPermTimeout41h = permTimeout;
        permTimeout = (p, ms) => ms === 30000 ? Promise.resolve("timeout") : _realPermTimeout41h(p, ms);
        try {
          _setup41h();
          await runPermChain(false);
          check("Fix #41 Step 1 hole: 30 s stall guard fires at the exact step (res 'timeout') → chain continues instead of stalling",
            settings.onboarded === true && __permChainState().waiting === false, "onboarded");
        } finally { permTimeout = _realPermTimeout41h; }
        // (3) page did not open but already granted → chain continues, NO toast.
        _setup41h(); _exactRes41h = {opened:false, granted:true};
        await runPermChain(false);
        check("Fix #41 Step 1 hole: exact page did not open but grant is already true → chain continues silently (no manual-path toast)",
          settings.onboarded === true && __permChainState().waiting === false && !els["#toast"].textContent.includes("Alarms & reminders"), "silent continue");
        // (4) page really opened → chain pauses for the return, then resumes on foreground.
        _setup41h(); _exactRes41h = {opened:true, granted:false};
        await runPermChain(false);
        check("Fix #41 Step 1 hole: exact page really opened → chain pauses and waits for the return (not onboarded yet)",
          __permChainState().waiting === true && settings.onboarded === false, "paused");
        resumePermChain();
        await new Promise(r=>setTimeout(r, 50)); // resumePermChain runs the rest async
        check("Fix #41 Step 1 hole: foreground return resumes the chain and it finishes (onboarded)",
          settings.onboarded === true && __permChainState().waiting === false, "resumed");
      } finally {
        Object.assign(settings, _saved41h);
        settings.permStepsAsked = _savedAsked41h;
        globalThis.fetch = _realFetch41h;
        if (__permChainState().waiting){ resumePermChain(); await new Promise(r=>setTimeout(r, 50)); }
        delete globalThis.Capacitor;
      }
    }

    // ---- Fix #41 Step 3 (24 Nov 2026 night): durood reminder still
    // never plays on his phone, istighfar plays. Builds 20/21/22 (clean
    // installs, v3 code in them) did not fix it, and the JS schedule
    // path was driven with a recording LN mock and proven correct and
    // symmetric — so the schedule is not the bug. The break is the
    // CHANNEL STATE on his phone: Android Auto Backup (manifest
    // allowBackup="true") restores notification-channel settings
    // across uninstall/reinstall, so a v3 channel once created silent
    // (or muted) stays silent through every "clean" install, and
    // Android never lets an app change an existing channel's sound.
    // Same proven repair a third time: fresh v4 channel IDs, native
    // deletes the v3 channels, JS schedules into v4. A v4 channel has
    // never existed on his phone, so no backed-up silent state can
    // attach to it. allowBackup itself is NOT changed (it also backs
    // up his settings, prayer log and Quran progress).
    {
      const _saved43 = { duroodRemOn: settings.duroodRemOn, duroodRemMin: settings.duroodRemMin, duroodRemSound: settings.duroodRemSound,
        astaghRemOn: settings.astaghRemOn, astaghRemMin: settings.astaghRemMin, astaghRemSound: settings.astaghRemSound, lang: settings.lang };
      settings.lang = "bn";
      try {
        check("Fix #41 Step 3: native deletes the v3 dhikr channels (sound + silent twins)",
          javaSched.includes('deleteNotificationChannel("dhikr-durood-v3")') && javaSched.includes('deleteNotificationChannel("dhikr-istighfar-v3")') &&
          javaSched.includes('deleteNotificationChannel("dhikr-durood-v3-silent")') && javaSched.includes('deleteNotificationChannel("dhikr-istighfar-v3-silent")'),
          "v3 deleted");
        check("Fix #41 Step 3: native creates the v4 dhikr channels WITH their raw sounds + HIGH importance",
          javaSched.includes('createChannel(nm, ctx, "dhikr-durood-v4"') && javaSched.includes("IMPORTANCE_HIGH, R.raw.durood") &&
          javaSched.includes('createChannel(nm, ctx, "dhikr-istighfar-v4"') && javaSched.includes("IMPORTANCE_HIGH, R.raw.istighfar"),
          "v4 sound channels");
        check("Fix #41 Step 3: native v4 silent twins are HIGH importance with no sound",
          javaSched.includes('createChannel(nm, ctx, "dhikr-durood-v4-silent"') &&
          javaSched.includes('createChannel(nm, ctx, "dhikr-istighfar-v4-silent"') &&
          javaSched.includes("IMPORTANCE_HIGH, -1)"),
          "v4 silent twins");
        check("Fix #41 Step 3: JS schedules into v4 (the old v3 channelId pick is gone)",
          src.includes('settings.duroodRemSound !== false ? "dhikr-durood-v4" : "dhikr-durood-v4-silent"') &&
          src.includes('settings.astaghRemSound !== false ? "dhikr-istighfar-v4" : "dhikr-istighfar-v4-silent"') &&
          !src.includes('? "dhikr-durood-v3"') && !src.includes('? "dhikr-istighfar-v3"'),
          "v4 pick");
        // Functional: drive the real scheduler with a recording LN mock.
        const _lnSched43 = [];
        globalThis.Capacitor = { Plugins: { LocalNotifications: {
          cancel: async()=>({}), schedule: async(a)=>{ _lnSched43.push(a); return {}; } } } };
        settings.duroodRemOn = true; settings.duroodRemMin = 30; settings.duroodRemSound = true;
        settings.astaghRemOn = true; settings.astaghRemMin = 30; settings.astaghRemSound = true;
        const _t43 = Date.now();
        await scheduleNativeDhikr();
        const _n43 = _lnSched43.flatMap(a=>a.notifications||[]);
        const _d43 = _n43.filter(n=>n.id>=401 && n.id<=424), _a43 = _n43.filter(n=>n.id>=501 && n.id<=524);
        check("Fix #41 Step 3: schedule drives 24 durood (401-424) on v4 with durood.mp3 + 24 istighfar (501-524) on v4 with istighfar.mp3",
          _d43.length===24 && _d43.every(n=>n.channelId==="dhikr-durood-v4" && n.sound==="durood.mp3") &&
          _a43.length===24 && _a43.every(n=>n.channelId==="dhikr-istighfar-v4" && n.sound==="istighfar.mp3"),
          "24+24 on v4");
        const _off43 = n => Math.round((new Date(n.schedule.at).getTime() - _t43) / 60000);
        check("Fix #41 Step 3: durood times run now+30m .. now+12h (one per interval, no gaps/duplicates)",
          _d43.length===24 && _off43(_d43[0])===30 && _off43(_d43[23])===720 &&
          new Set(_d43.map(_off43)).size===24,
          "durood times");
        check("Fix #41 Step 3: istighfar times run now+30m .. now+12h (same cadence as durood)",
          _a43.length===24 && _off43(_a43[0])===30 && _off43(_a43[23])===720 &&
          new Set(_a43.map(_off43)).size===24,
          "istighfar times");
        settings.duroodRemSound = false; settings.astaghRemSound = false;
        _lnSched43.length = 0;
        await scheduleNativeDhikr();
        const _s43 = _lnSched43.flatMap(a=>a.notifications||[]);
        check("Fix #41 Step 3: sound off schedules both kinds on the v4-silent twins with no sound",
          _s43.filter(n=>n.channelId==="dhikr-durood-v4-silent").length===24 &&
          _s43.filter(n=>n.channelId==="dhikr-istighfar-v4-silent").length===24 && _s43.every(n=>!n.sound),
          "v4 silent twins");
        delete globalThis.Capacitor;
        // Fix #8 texts untouched by this step (verbatim, his exact words).
        check("Fix #41 Step 3: PREAZAN_TEXTS verbatim and untouched (Fix #8)",
          PREAZAN_TEXTS.Fajr === "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
          PREAZAN_TEXTS.Dhuhr === "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
          PREAZAN_TEXTS.Asr === "আসরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
          PREAZAN_TEXTS.Maghrib === "মাগরিবের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
          PREAZAN_TEXTS.Isha === "ইশার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন",
          "Fix #8 verbatim");
      } finally {
        Object.assign(settings, _saved43);
        delete globalThis.Capacitor;
      }
    }

    // ---- Fix #41 Step 4 (24 Nov 2026 night): the app logo must appear
    // beside EVERY notification. The native AlarmReceiver path already
    // sets both icons (Fix #14) and the web Notification path already
    // passes icons/icon-192.png — but the Capacitor LocalNotifications
    // path passed NO icon at all, so the plugin fell back to the
    // generic android.R.drawable.ic_dialog_info ("i") small icon and
    // NO large icon on every LN notification. Fix: every LN schedule
    // call carries smallIcon + largeIcon, and capacitor.config.json
    // sets the plugin's global smallIcon default. The large icon is
    // ic_notification_large (the Fix #14 drawable logo — the plugin
    // resolves largeIcon from drawables only, so ic_launcher, a
    // mipmap resource, would decode to null and show no logo).
    {
      const _saved44 = { duroodRemOn: settings.duroodRemOn, duroodRemMin: settings.duroodRemMin, duroodRemSound: settings.duroodRemSound,
        astaghRemOn: settings.astaghRemOn, astaghRemMin: settings.astaghRemMin, astaghRemSound: settings.astaghRemSound,
        azan: settings.azan, lang: settings.lang };
      settings.lang = "bn";
      try {
        const _cfg44 = JSON.parse(fs.readFileSync("/home/hatch/workspace/deen-day/capacitor.config.json", "utf8"));
        check("Fix #41 Step 4: capacitor.config.json sets the LocalNotifications global smallIcon default to the logo",
          _cfg44.plugins && _cfg44.plugins.LocalNotifications && _cfg44.plugins.LocalNotifications.smallIcon === "ic_notification",
          "config default");
        check("Fix #41 Step 4: app.js defines the shared logo icon constants (small = white silhouette, large = full logo)",
          src.includes('const NOTIF_SMALL_ICON = "ic_notification", NOTIF_LARGE_ICON = "ic_notification_large";'),
          "constants");
        const _fn44 = (name, next) => src.slice(src.indexOf("async function " + name), next ? src.indexOf("async function " + next) : src.indexOf("async function " + name) + 4000);
        const _daily44 = _fn44("scheduleNativeDaily", "scheduleNativeDhikr");
        const _dhikr44 = _fn44("scheduleNativeDhikr", "scheduleNativeAzan");
        const _azan44 = src.slice(src.indexOf("async function scheduleNativeAzan"));
        const _iconPair44 = "smallIcon: NOTIF_SMALL_ICON, largeIcon: NOTIF_LARGE_ICON";
        check("Fix #41 Step 4: daily hadith + verse notifications carry both logo icons (2 pushes)",
          (_daily44.match(new RegExp(_iconPair44.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length === 2,
          "daily icons");
        check("Fix #41 Step 4: dhikr reminder notifications carry both logo icons",
          _dhikr44.includes(_iconPair44), "dhikr icons");
        check("Fix #41 Step 4: LN azan-fallback notifications carry both logo icons",
          _azan44.includes(_iconPair44), "azan icons");
        check("Fix #41 Step 4: the logo drawables exist (small silhouette + large logo)",
          fs.existsSync("/home/hatch/workspace/deen-day/android/app/src/main/res/drawable/ic_notification_large.png") &&
          ["mdpi","hdpi","xhdpi","xxhdpi","xxxhdpi"].every(d=>fs.existsSync(`/home/hatch/workspace/deen-day/android/app/src/main/res/drawable-${d}/ic_notification.png`)),
          "drawables exist");
        check("Fix #41 Step 4: native AlarmReceiver still sets both logo icons (Fix #14 intact)",
          javaReceiver.includes("setSmallIcon(R.drawable.ic_notification)") &&
          javaReceiver.includes("R.drawable.ic_notification_large") && javaReceiver.includes("setLargeIcon"),
          "native icons intact");
        // Functional: dhikr schedule via a recording LN mock.
        const _lnSched44 = [];
        globalThis.Capacitor = { Plugins: { LocalNotifications: {
          cancel: async()=>({}), schedule: async(a)=>{ _lnSched44.push(a); return {}; } } } };
        settings.duroodRemOn = true; settings.duroodRemMin = 30; settings.duroodRemSound = true;
        settings.astaghRemOn = true; settings.astaghRemMin = 30; settings.astaghRemSound = true;
        await scheduleNativeDhikr();
        const _n44 = _lnSched44.flatMap(a=>a.notifications||[]);
        check("Fix #41 Step 4: every scheduled dhikr reminder carries the logo small + large icons",
          _n44.length===48 && _n44.every(n=>n.smallIcon==="ic_notification" && n.largeIcon==="ic_notification_large"),
          "48 with logo");
        delete globalThis.Capacitor;
        // Functional: LN azan fallback via syncPrayerAlarms with the native plugin down.
        __setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:00", Asr:"16:24", Maghrib:"18:58", Isha:"20:10", Imsak:"05:32", Firstthird:"22:59", Lastthird:"03:01"});
        settings.azan = true;
        const _lnSched44b = [];
        globalThis.Capacitor = { Plugins: {
          PrayerAlarm: { scheduleAlarms: async()=>{ throw new Error("plugin down"); },
            cancelAlarms: async()=>({cancelled:0}),
            getStatus: async()=>({notificationsGranted:true, exactAlarmGranted:true, alarmsScheduled:0}) },
          LocalNotifications: { cancel: async()=>({}), requestPermissions: async()=>({display:"granted"}),
            createChannel: async()=>({}), schedule: async(a)=>{ _lnSched44b.push(a); return {}; } },
        }};
        await syncPrayerAlarms();
        const _a44 = _lnSched44b.flatMap(a=>a.notifications||[]);
        check("Fix #41 Step 4: every LN azan-fallback notification carries the logo small + large icons",
          _a44.length>0 && _a44.every(n=>n.smallIcon==="ic_notification" && n.largeIcon==="ic_notification_large"),
          _a44.length + " fallback notifs");
        delete globalThis.Capacitor;
        // Fix #8 texts untouched by this step (verbatim, his exact words).
        check("Fix #41 Step 4: PREAZAN_TEXTS verbatim and untouched (Fix #8)",
          PREAZAN_TEXTS.Fajr === "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
          PREAZAN_TEXTS.Dhuhr === "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
          PREAZAN_TEXTS.Asr === "আসরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
          PREAZAN_TEXTS.Maghrib === "মাগরিবের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
          PREAZAN_TEXTS.Isha === "ইশার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন",
          "Fix #8 verbatim");
      } finally {
        Object.assign(settings, _saved44);
        delete globalThis.Capacitor;
      }
    }

    // ---- Fix #42 (27 Nov 2026 voice call): azan keeps playing through
    // notifications; unlock durood keep-alive; "name" row gone; pre-waqt
    // announcement; Friday Jumu'ah text ----
    {
      const _man42 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/AndroidManifest.xml", "utf8");
      const _javaAzan42 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AzanPlaybackService.java", "utf8");
      const _javaKeep42 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/UnlockKeepAliveService.java", "utf8");
      const _javaRecv42 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmReceiver.java", "utf8");
      const _javaSched42 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmScheduler.java", "utf8");
      const _javaMain42 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/MainActivity.java", "utf8");
      const _javaBoot42 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/BootReceiver.java", "utf8");
      const _javaPlug42 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodUnlockPlugin.java", "utf8");
      // Azan service pins: the azan plays as real media, not a channel sound.
      check("Fix #42: AzanPlaybackService plays R.raw.azan with a MediaPlayer holding AUDIOFOCUS_GAIN",
        _javaAzan42.includes("R.raw.azan") && _javaAzan42.includes("MediaPlayer") && _javaAzan42.includes("AUDIOFOCUS_GAIN"), "media + focus");
      check("Fix #42: azan service goes foreground on the silent channel and keeps the notification when done",
        _javaAzan42.includes("startForeground(id, n)") && _javaAzan42.includes('"azan-v2-silent"') && _javaAzan42.includes("stopForeground(false)"), "silent visual");
      check("Fix #42 (UPDATED Fix #43): the azan service has NO channel-sound fallback at all — no fallbackToChannelSound and no sounding-channel literal anywhere in the service",
        !_javaAzan42.includes("fallbackToChannelSound") && !_javaAzan42.includes('"azan-v2"'), "no fallback");
      check("Fix #42: azan service never ducks for a notification ding (keeps playing at full volume)",
        _javaAzan42.includes("AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK") && _javaAzan42.includes("setWillPauseWhenDucked(false)"), "no duck");
      // Receiver routing pins.
      check("Fix #42 (UPDATED Fix #43): AlarmReceiver posts the visual for a sounding azan ALWAYS silently — no sounding-channel branch anywhere in the routing",
        _javaRecv42.includes('visualChannel = "azan-v2-silent"') && !_javaRecv42.includes(': "azan-v2"'), "always silent");
      check("Fix #42: AlarmReceiver shows the full text (BigTextStyle) so the waqt name is always visible",
        _javaRecv42.includes("BigTextStyle"), "big text");
      check("Fix #42: AlarmReceiver still speaks the body with Bengali TTS (announcement unchanged)",
        _javaRecv42.includes("speakViaTts") && _javaRecv42.includes('tts.setLanguage(new Locale("bn"))'), "TTS kept");
      // Manifest pins.
      check("Fix #42: manifest registers the azan service (mediaPlayback) and the keep-alive service (specialUse)",
        _man42.includes('android:name=".AzanPlaybackService"') && _man42.includes('android:foregroundServiceType="mediaPlayback"') &&
        _man42.includes('android:name=".UnlockKeepAliveService"') && _man42.includes('android:foregroundServiceType="specialUse"'), "services");
      check("Fix #42: manifest declares the special-use subtype property and both foreground-service permissions",
        _man42.includes("android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE") && _man42.includes("FOREGROUND_SERVICE_MEDIA_PLAYBACK") && _man42.includes("FOREGROUND_SERVICE_SPECIAL_USE"), "permissions");
      // Keep-alive service pins: the real unlock-durood fix (settings ruled out).
      check("Fix #42: keep-alive service is a foreground service (START_STICKY) with a persistent notification",
        _javaKeep42.includes("startForeground(NOTIF_ID, n)") && _javaKeep42.includes("START_STICKY") && _javaKeep42.includes("setOngoing(true)"), "keep-alive");
      check("Fix #42: keep-alive service plays NO audio and registers NO receiver (the manifest receiver stays the only durood player)",
        !_javaKeep42.includes("MediaPlayer") && !_javaKeep42.includes("registerReceiver") && !_javaKeep42.includes("IntentFilter") && !_javaKeep42.includes("BroadcastReceiver"), "no double durood");
      check("Fix #42: keep-alive notification is silent (LOW importance, no sound, no vibration)",
        _javaKeep42.includes("IMPORTANCE_LOW") && _javaKeep42.includes("setSound(null, null)") && _javaKeep42.includes("enableVibration(false)"), "silent notification");
      check("Fix #42: keep-alive service starts on app open and on boot, only when the durood toggle is on",
        _javaMain42.includes("UnlockKeepAliveService.start(this)") && _javaBoot42.includes("UnlockKeepAliveService.start(context)"), "wired");
      check("Fix #42: the durood toggle starts/stops the keep-alive service",
        _javaPlug42.includes("UnlockKeepAliveService.start(getContext())") && _javaPlug42.includes("UnlockKeepAliveService.stop(getContext())"), "toggle");
      // Pre-azan v2 pins.
      check("Fix #42: native pre-azan channel is preazan-v2, HIGH importance with the reminder sound, old channel deleted",
        _javaSched42.includes('"preazan-v2"') && _javaSched42.includes("IMPORTANCE_HIGH, R.raw.reminder") && _javaSched42.includes('deleteNotificationChannel("preazan")'), "preazan-v2");
      check("Fix #42: LN pre-azan channel is preazan-v2 with the reminder sound (JS side)",
        src.includes('id: "preazan-v2"') && src.includes('sound: "reminder.mp3"'), "LN v2");
      // "name" row gone pins (the model still keeps "name" — see Fix #38).
      check("Fix #42: the 'name' option object is gone from ALARM_SOUNDS (the row cannot render)",
        !src.includes('id:"name"'), "no name option");
      // Friday Jumu'ah functional tests: mock Friday 20 Nov 2026 and
      // Thursday 19 Nov 2026 (same pattern as Fix #26's fake26).
      const _saved42j = { ...settings };
      Object.assign(settings, { country:"Malaysia", city:"Ipoh", lat:4.5975, lon:101.0901,
        tzName:"Asia/Kuala_Lumpur", locId:"ipoh", tzLoc:"ipoh", method:0, school:1, schoolExplicit:false });
      __setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:00", Asr:"16:24", Maghrib:"18:58", Isha:"20:10", Imsak:"05:32", Firstthird:"22:59", Lastthird:"03:01"});
      const _RealDate42 = Date;
      const _fake42 = (y, m, d) => {
        const t = new Date(y, m, d); t.setHours(4, 0, 0, 0);
        globalThis.Date = class extends _RealDate42 {
          constructor(...a){ super(...(a.length ? a : [t.getTime()])); }
          static now(){ return t.getTime(); }
        };
      };
      try {
        _fake42(2026, 10, 20); // Friday
        const _fri = buildPrayerAlarmList();
        const _friDhuhr = _fri.filter(a=>a.prayerId==="Dhuhr" && a.type==="preazan-v2");
        check("Fix #42: on Friday the Dhuhr pre-azan (T-5 and T-2) says 'জুম্মার নামাজ পড়ার প্রস্তুতি নিন'",
          _friDhuhr.length===2 && _friDhuhr.every(a=>a.body===JUMUAH_PREAZAN_TEXT), _friDhuhr.map(a=>a.body).join(" | "));
        const _friFajr = _fri.filter(a=>a.prayerId==="Fajr" && a.type==="preazan-v2");
        check("Fix #42: on Friday Fajr pre-azan is unchanged (normal Fajr text)",
          _friFajr.length===2 && _friFajr.every(a=>a.body===PREAZAN_TEXTS.Fajr), "Fajr unchanged");
        check("Fix #49 (UPDATED Fix #42): AZAN_SPEAK_TEXTS table unchanged (still == PREAZAN_TEXTS) — the Friday Jumu'ah azan-time text comes from azanSpeakText, not the table",
          AZAN_SPEAK_TEXTS.Dhuhr === PREAZAN_TEXTS.Dhuhr, "azan table unchanged");
        _fake42(2026, 10, 19); // Thursday
        const _thu = buildPrayerAlarmList();
        const _thuDhuhr = _thu.filter(a=>a.prayerId==="Dhuhr" && a.type==="preazan-v2");
        check("Fix #42: on Thursday the Dhuhr pre-azan says the normal Dhuhr text (no Jumu'ah text)",
          _thuDhuhr.length===2 && _thuDhuhr.every(a=>a.body===PREAZAN_TEXTS.Dhuhr), "Thursday normal");
      } finally {
        globalThis.Date = _RealDate42;
        Object.assign(settings, _saved42j);
      }
      // PREAZAN/AZAN verbatim pins (Fix #8, user-approved 25 Nov).
      check("Fix #42: PREAZAN_TEXTS verbatim and AZAN_SPEAK_TEXTS == PREAZAN_TEXTS",
        PREAZAN_TEXTS.Fajr === "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        PREAZAN_TEXTS.Dhuhr === "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        PREAZAN_TEXTS.Asr === "আসরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        PREAZAN_TEXTS.Maghrib === "মাগরিবের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        PREAZAN_TEXTS.Isha === "ইশার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        AZAN_SPEAK_TEXTS.Dhuhr === PREAZAN_TEXTS.Dhuhr, "verbatim");
    }

    // ---- Fix #43 (27 Nov 2026, Build 26 scope items 1-3): the azan is
    // NEVER a notification sound any more (the MediaPlayer service is the
    // only sounding azan path); Alarm Sound takes 2 sounds ("name" does
    // not consume a slot); the pre-waqt audio always speaks the waqt name
    // (stale native alarms die on every sync, speakText is explicit). ----
    {
      const _javaAzan43 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AzanPlaybackService.java", "utf8");
      const _javaRecv43 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmReceiver.java", "utf8");
      const _javaSched43 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmScheduler.java", "utf8");
      const _javaPlug43 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/PrayerAlarmPlugin.java", "utf8");
      // (1) No sounding azan through LocalNotifications, anywhere.
      const _schedAzanFn43 = src.slice(src.indexOf("async function scheduleNativeAzan()"), src.indexOf("/* ---------------- home location card ---------------- */"));
      check("Fix #43: scheduleNativeAzan creates no sounding azan-v2 channel (the silent channel stays)",
        !_schedAzanFn43.includes('id: "azan-v2"') && _schedAzanFn43.includes('id: "azan-v2-silent"'), "no v2 create");
      check("Fix #43: scheduleNativeAzan filters sounding-azan entries out of the LN schedule (sound 'azan' never scheduled)",
        _schedAzanFn43.includes('.filter(a=>a.sound!=="azan")'), "azan filtered");
      check("Fix #43: the native side deletes the sounding azan-v2 channel and never creates it",
        _javaSched43.includes('deleteNotificationChannel("azan-v2")') && !_javaSched43.includes('createChannel(nm, ctx, "azan-v2"'), "native deletes v2");
      check("Fix #43: the azan service has no channel fallback (no fallbackToChannelSound, no sounding-channel literal)",
        !_javaAzan43.includes("fallbackToChannelSound") && !_javaAzan43.includes('"azan-v2"'), "no fallback");
      check("Fix #43: the receiver posts the sounding-azan visual ALWAYS silently (no sounding-channel branch)",
        _javaRecv43.includes('visualChannel = "azan-v2-silent"') && !_javaRecv43.includes(': "azan-v2"'), "always silent");
      // Service hardening pins.
      check("Fix #43: the service retries audio focus (FOCUS_ATTEMPTS) and then plays without focus instead of staying silent",
        _javaAzan43.includes("FOCUS_ATTEMPTS") && _javaAzan43.includes("FOCUS_RETRY_WAIT_MS") && _javaAzan43.includes("without focus"), "focus retry");
      check("Fix #43: the service resumes after a transient focus loss (pause on LOSS_TRANSIENT, resume on GAIN)",
        _javaAzan43.includes("AUDIOFOCUS_LOSS_TRANSIENT") && _javaAzan43.includes("pausedForTransientLoss") && _javaAzan43.includes("player.start()"), "resume");
      check("Fix #43: the service keeps USAGE_NOTIFICATION (same volume knob as the old channel sound — deliberate, see spec)",
        _javaAzan43.includes("USAGE_NOTIFICATION") && _javaAzan43.includes("CONTENT_TYPE_SONIFICATION"), "usage kept");
      check("Fix #43: playback starts on a background thread with a generation guard (a stale thread never starts a player)",
        _javaAzan43.includes("new Thread(") && _javaAzan43.includes("playbackGeneration"), "background start");
      // (2) Multi-select: "name" does not consume a slot.
      check("Fix #43: normalizeSounds keeps name + up to 2 visible sounds (Notification + Azan fit together)",
        JSON.stringify(normalizeSounds(["name","notification","azan"]))===JSON.stringify(["name","notification","azan"]), "name+2");
      check("Fix #43: normalizeSounds still caps the visible sounds at 2 (a third extra is dropped)",
        JSON.stringify(normalizeSounds(["name","notification","azan","beep"]))===JSON.stringify(["name","notification","azan"]), "cap 2");
      check("Fix #43: normalizeSounds keeps the old behaviour for silent and single sounds",
        JSON.stringify(normalizeSounds(["silent"]))===JSON.stringify(["silent"]) &&
        JSON.stringify(normalizeSounds(["azan"]))===JSON.stringify(["name","azan"]) &&
        JSON.stringify(normalizeSounds("notification"))===JSON.stringify(["name","notification"]), "old cases");
      // (3) The waqt name is always spoken; stale wording exists nowhere.
      check("Fix #43: the receiver speaks a sounding azan ONLY from its speakText (never the waqt-less body)",
        _javaRecv43.includes('if ("azan-v2".equals(type) && (speakText == null || speakText.isEmpty())) toSpeak = null;'), "speakText only");
      check("Fix #43: the plugin cancels an in-list alarm it could not arm (a revoked exact-alarm grant cannot leave a stale alarm firing)",
        _javaPlug43.includes("AlarmScheduler.cancel(getContext(), skipId)"), "skipped cancelled");
      check("Fix #43: the old no-waqt-name sentence exists nowhere in the shipped JS or the touched Java (no stale wording left to speak)",
        !src.includes("নামাজ পড়ে নাও") && !_javaRecv43.includes("নামাজ পড়ে নাও") && !_javaAzan43.includes("নামাজ পড়ে নাও") && !_javaSched43.includes("নামাজ পড়ে নাও") && !_javaPlug43.includes("নামাজ পড়ে নাও"), "no old wording");
      check("Fix #43: PREAZAN_TEXTS verbatim and AZAN_SPEAK_TEXTS == PREAZAN_TEXTS (unchanged by this fix)",
        PREAZAN_TEXTS.Fajr === "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        PREAZAN_TEXTS.Dhuhr === "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        PREAZAN_TEXTS.Asr === "আসরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        PREAZAN_TEXTS.Maghrib === "মাগরিবের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        PREAZAN_TEXTS.Isha === "ইশার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        AZAN_SPEAK_TEXTS.Fajr === PREAZAN_TEXTS.Fajr && AZAN_SPEAK_TEXTS.Isha === PREAZAN_TEXTS.Isha, "verbatim");
      // Functional: multi-select, spoken texts, and the real sync with
      // recording mocks (same pattern as the Fix #40 mock block).
      const _saved43 = JSON.parse(JSON.stringify({ alarmOn: settings.alarmOn, alarmSound: settings.alarmSound, offsets: settings.offsets,
        azan: settings.azan, lang: settings.lang }));
      const _tz43 = settings.tzName; settings.tzName = "";
      settings.lang = "bn";
      settings.azan = true;
      settings.alarmOn = {Fajr:true, Dhuhr:true, Asr:true, Maghrib:true, Isha:true, Duha:false, Tahajjud:false, ForbMorning:false, ForbNoon:false, ForbEvening:false, Sehri:false, Iftar:false};
      settings.offsets = {Fajr:0, Dhuhr:0, Asr:0, Maghrib:0, Isha:0, Duha:0, Tahajjud:0, ForbMorning:0, ForbNoon:0, ForbEvening:0, Sehri:0, Iftar:0};
      __setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:01", Asr:"16:24", Maghrib:"18:58", Isha:"20:11", Imsak:"05:32", Sunset:"18:00", Lastthird:"03:01"});
      try {
        // Multi-select, driven through the real detail page.
        settings.alarmSound = {Fajr:["name","notification"], Dhuhr:["name"], Asr:["name"], Maghrib:["name"], Isha:["name"], Duha:["name"], Tahajjud:["name"], ForbMorning:["name"], ForbNoon:["name"], ForbEvening:["name"], Sehri:["name"], Iftar:["name"]};
        openPrayerDetail("Fajr");
        check("Fix #43: detail draft starts with Notification checked (name is invisible, one slot free)",
          JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name","notification"]), "draft start");
        toggleDetailSound("azan");
        check("Fix #43: tapping Azan ADDS it next to Notification (both stay checked — the reported bug)",
          JSON.stringify(getDetailDraft().sounds)===JSON.stringify(["name","notification","azan"]), "both selected");
        const _before43 = JSON.stringify(getDetailDraft().sounds);
        toggleDetailSound("beep");
        check("Fix #43: a third sound is refused with the max-2 toast and the selection is unchanged",
          JSON.stringify(getDetailDraft().sounds)===_before43 && __$("#toast").textContent.includes("সর্বোচ্চ ২টা"), "third refused");
        check("Fix #43: the explainer for Notification + Azan says the azan plays AND the notification shows the waqt name",
          detailSoundExplain(["name","notification","azan"]) === "ওয়াক্তের সময় আজান বাজবে, আর নোটিফিকেশনে ওয়াক্তের নাম দেখাবে।", "explainer both");
        // Spoken texts, from the real alarm list.
        settings.alarmSound = {Fajr:["name","notification","azan"], Dhuhr:["name","notification","azan"], Asr:["name","notification","azan"], Maghrib:["name","notification","azan"], Isha:["name","notification","azan"], Duha:["name"], Tahajjud:["name"], ForbMorning:["name"], ForbNoon:["name"], ForbEvening:["name"], Sehri:["name"], Iftar:["name"]};
        const _al43 = buildPrayerAlarmList();
        const _fajrAzan43 = _al43.find(a=>a.type==="azan-v2" && a.prayerId==="Fajr");
        check("Fix #43: Notification + Azan selected → the azan entry still plays the azan (sound 'azan')",
          _fajrAzan43 && _fajrAzan43.sound==="azan", "azan wins");
        const _pres43 = _al43.filter(a=>a.type==="preazan-v2");
        check("Fix #43: every pre-azan entry (T-5 and T-2, all 5 prayers) carries speakText equal to its body — the waqt-name sentence",
          _pres43.length===10 && _pres43.every(a=>a.speak===true && typeof a.speakText==="string" && a.speakText.length>0 && a.speakText===a.body),
          "speakText explicit");
        check("Fix #43: every pre-azan speakText is its prayer's Fix #8 sentence (Friday Dhuhr: the Jumu'ah sentence)",
          ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(pid=>{
            const pres = _pres43.filter(a=>a.prayerId===pid);
            return pres.length===2 && pres.every(a=>a.speakText===PREAZAN_TEXTS[pid] || a.speakText===JUMUAH_PREAZAN_TEXT);
          }), "waqt named");
        check("Fix #43: every sounding azan entry carries speakText === its waqt-name announcement",
          ["Fajr","Dhuhr","Asr","Maghrib","Isha"].every(pid=>{
            const a = _al43.find(x=>x.type==="azan-v2" && x.prayerId===pid);
            return a && a.speak===true && a.speakText===AZAN_SPEAK_TEXTS[pid];
          }), "azan speakText");
        // The real sync with recording mocks: retry, fallback cancel, LN filter.
        const _lnSched43 = [], _lnCancel43 = [], _paCancel43 = [];
        let _paCalls43 = 0;
        const _mock43 = (paSched) => {
          _paCalls43 = 0;
          globalThis.Capacitor = { Plugins: {
            PrayerAlarm: { scheduleAlarms: async(a)=>{ _paCalls43++; return paSched(a); },
              cancelAlarms: async(a)=>{ _paCancel43.push(a); return {cancelled:0}; },
              getStatus: async()=>({notificationsGranted:true, exactAlarmGranted:true, alarmsScheduled:0}) },
            LocalNotifications: { cancel: async(a)=>{ _lnCancel43.push(a); return {}; },
              requestPermissions: async()=>({display:"granted"}), createChannel: async()=>({}),
              schedule: async(a)=>{ _lnSched43.push(a); return {}; } },
          }};
        };
        // (a) scheduleAlarms throws once, then succeeds: the retry saves the native path.
        _lnSched43.length = 0; _paCancel43.length = 0;
        let _failOnce43 = true;
        _mock43(async()=>{ if (_failOnce43){ _failOnce43 = false; throw new Error("transient"); } return {scheduled:15, skipped:0}; });
        await syncPrayerAlarms(); await refreshAlarmStatus();
        check("Fix #43: a transient plugin failure is retried — the native path still wins (schedule called twice, no LN schedule at all)",
          _paCalls43===2 && _lnSched43.length===0, "retry saves native");
        // (b) scheduleAlarms throws always: the fallback cancels stale native alarms AND schedules no sounding azan.
        // All five prayers silent here, so the fallback's silent azan visuals exist to count (a sounding azan
        // selection would be filtered out of the LN schedule entirely — that is the fix).
        settings.alarmSound = {Fajr:["silent"], Dhuhr:["silent"], Asr:["silent"], Maghrib:["silent"], Isha:["silent"], Duha:["name"], Tahajjud:["name"], ForbMorning:["name"], ForbNoon:["name"], ForbEvening:["name"], Sehri:["name"], Iftar:["name"]};
        _lnSched43.length = 0; _lnCancel43.length = 0; _paCancel43.length = 0;
        _mock43(async()=>{ throw new Error("plugin down"); });
        await syncPrayerAlarms();
        const _all43 = _lnSched43.flatMap(a=>a.notifications||[]);
        check("Fix #43: when the native plugin is down, the LN fallback schedules NO sounding azan (no azan-v2 channel, no azan.mp3)",
          _all43.length>0 && _all43.every(n=>n.channelId!=="azan-v2" && n.sound!=="azan.mp3"), "fallback never azan");
        check("Fix #43: ... but pre-azan reminders and silent azan visuals still schedule (the fallback is not dead)",
          _all43.filter(n=>n.channelId==="preazan-v2").length===10 &&
          _all43.filter(n=>n.channelId==="azan-v2-silent").length===5, "fallback alive");
        check("Fix #43: the fallback cancels the stale native azan-family alarms through the plugin (old wording can never fire again)",
          _paCancel43.some(a=>{ const ids=(a.ids||[]); return [1,2,3,4,5,31,32,33,34,35,51,52,53,54,55,36,37,38,41,42,43,44].every(id=>ids.includes(id)); }),
          "stale native cancelled");
        // (c) The LN fallback itself, driven directly: no sounding azan even with the azan on.
        _lnSched43.length = 0;
        await scheduleNativeAzan();
        const _direct43 = _lnSched43.flatMap(a=>a.notifications||[]);
        check("Fix #43: scheduleNativeAzan on its own never schedules a sounding azan (direct drive)",
          _direct43.length>0 && _direct43.every(n=>n.channelId!=="azan-v2" && n.sound!=="azan.mp3"), "direct never azan");
        delete globalThis.Capacitor;
      } finally {
        Object.assign(settings, _saved43);
        settings.tzName = _tz43;
        delete globalThis.Capacitor;
      }
    }

    // ---- Fix #44 (27 Nov 2026, Build 26 scope item 4): Al-Shafie-style
    // unlock durood reminder — a notification on unlock (never auto-play),
    // ✅ button plays the durood + counts it, sound choice, on/off toggle,
    // count in Settings. Clean-room: our own code, our own audio, our own
    // design. The keep-alive service and BootReceiver still deliver the
    // unlock. UPDATED Fix #45 (28 Nov 2026): the user corrected the
    // Al-Shafie reading — the durood AUTO-PLAYS on unlock, no button
    // press; the ✅ button is only a replay and the notification posts
    // AFTER the durood finishes. Pins below marked (UPDATED Fix #45)
    // changed with it; the rest still hold. ----
    {
      const _javaUnlock44 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodUnlockReceiver.java", "utf8");
      const _javaPlay44 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodPlayReceiver.java", "utf8");
      const _javaPlayer45 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodPlayer.java", "utf8");
      const _javaPlug44 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodUnlockPlugin.java", "utf8");
      const _javaKeep44 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/UnlockKeepAliveService.java", "utf8");
      const _manifest44 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/AndroidManifest.xml", "utf8");
      const _main44 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/MainActivity.java", "utf8");
      const _html44 = fs.readFileSync("/home/hatch/workspace/deen-day/index.html", "utf8");
      // (UPDATED Fix #45: the unlock receiver now auto-plays the durood
      // via the shared DuroodPlayer — no inline MediaPlayer in the
      // receiver itself, the player lives in DuroodPlayer.)
      check("Fix #44 (UPDATED Fix #45): the unlock receiver auto-plays the durood through the shared player (no inline MediaPlayer in the receiver)",
        _javaUnlock44.includes("DuroodPlayer.playOnce(context)") && !_javaUnlock44.includes("new MediaPlayer") && !_javaUnlock44.includes("import android.media.MediaPlayer"), "auto-play via player");
      check("Fix #44: on unlock the receiver posts the reminder notification (USER_PRESENT → postReminder, after playback)",
        _javaUnlock44.includes("Intent.ACTION_USER_PRESENT") && _javaUnlock44.includes("postReminder(context)"), "unlock notifies");
      check("Fix #44: the reminder is off when the toggle is off (receiver returns before posting)",
        _javaUnlock44.includes('if (!prefs.getBoolean(KEY_DUROOD_ON, true)) return;'), "toggle off");
      check("Fix #44: the reminder stays in the notification list (setAutoCancel(false)) and is re-posted on every unlock (same id)",
        _javaUnlock44.includes(".setAutoCancel(false)") && _javaUnlock44.includes("REMINDER_NOTIF_ID = 9001"), "stays listed");
      check("Fix #44: the reminder has the ✅ action button (check icon + PLAY_DUROOD action)",
        _javaUnlock44.includes("addAction(R.drawable.ic_check") && _javaUnlock44.includes('"✅ দরুদ শুনুন"') && _javaUnlock44.includes("DuroodPlayReceiver.ACTION_PLAY_DUROOD"), "button present");
      check("Fix #44 (UPDATED Fix #45): the reminder text shows today's durood count (✅ replays it now)",
        _javaUnlock44.includes("getTodayCount(ctx)") && _javaUnlock44.includes('আজ " + today + " বার দরুদ পড়া হয়েছে') && _javaUnlock44.includes("✅ চাপলে আবার বাজবে"), "count in text");
      // Three reminder-sound channels, our own audio only.
      check("Fix #44: one channel per reminder sound — reminder.mp3, istighfar.mp3, silent (no other sound)",
        _javaUnlock44.includes('CHANNEL_REMINDER = "durood-unlock-reminder"') &&
        _javaUnlock44.includes("R.raw.reminder") && _javaUnlock44.includes("R.raw.istighfar") &&
        _javaUnlock44.includes('CHANNEL_SILENT = "durood-unlock-silent"') && !_javaUnlock44.includes("R.raw.azan"), "3 channels");
      check("Fix #44: the receiver picks the channel from the stored sound choice (default reminder)",
        _javaUnlock44.includes('getString(KEY_REMIND_SOUND, "reminder")') && _javaUnlock44.includes("channelForSound"), "sound choice");
      // The ✅ button replays through the shared player.
      check("Fix #44: the play receiver fires ONLY on the ✅ action (explicit PendingIntent, no intent-filter)",
        _javaPlay44.includes('ACTION_PLAY_DUROOD = "com.deenday.app.PLAY_DUROOD"') && _javaPlay44.includes("goAsync()"), "button only");
      check("Fix #44 (UPDATED Fix #45): pressing ✅ replays our durood clip (R.raw.durood) through the shared explicit player",
        _javaPlayer45.includes("R.raw.durood") && _javaPlayer45.includes("USAGE_NOTIFICATION") && _javaPlay44.includes("DuroodPlayer.playOnce(context)"), "replays durood");
      check("Fix #44 (UPDATED Fix #45): the shared player counts the durood when playback starts, and the play receiver refreshes the reminder after playback",
        _javaPlayer45.includes("incrementCount(context)") && _javaPlay44.includes("postReminder(context)") &&
        _javaPlay44.indexOf("DuroodPlayer.playOnce(context)") < _javaPlay44.indexOf("postReminder(context)"), "counts");
      check("Fix #44: the count is today + total, rolling over by calendar date",
        _javaUnlock44.includes('KEY_COUNT_TOTAL = "durood_count_total"') && _javaUnlock44.includes('KEY_COUNT_TODAY = "durood_count_today"') &&
        _javaUnlock44.includes('KEY_COUNT_DATE = "durood_count_date"') && _javaUnlock44.includes("yyyy-MM-dd"), "count keys");
      // Plugin + wiring.
      check("Fix #44: the plugin stores the reminder sound (validated to the three choices) and reports the count",
        _javaPlug44.includes("setReminderSound") && _javaPlug44.includes("KEY_REMIND_SOUND") &&
        _javaPlug44.includes("getDuroodStats") && _javaPlug44.includes("getTotalCount") && _javaPlug44.includes("getTodayCount"), "plugin methods");
      check("Fix #44: the plugin still starts/stops the keep-alive with the toggle",
        _javaPlug44.includes("UnlockKeepAliveService.start(getContext())") && _javaPlug44.includes("UnlockKeepAliveService.stop(getContext())"), "keep-alive kept");
      check("Fix #44: the play receiver is registered NOT exported; the reminder channels are created at startup too",
        _manifest44.includes('<receiver android:name=".DuroodPlayReceiver" android:exported="false"') &&
        _main44.includes("DuroodUnlockReceiver.ensureChannels(this)"), "registered");
      check("Fix #44 (UPDATED Fix #45): the check icon exists and the keep-alive DOES say the durood plays on unlock now",
        fs.existsSync("/home/hatch/workspace/deen-day/android/app/src/main/res/drawable/ic_check.xml") &&
        _javaKeep44.includes("আনলক করলে দরুদ বাজবে"), "icon + wording");
      check("Fix #44: the settings page has the sound select and the count line",
        _html44.includes('id="set-durood-sound"') && _html44.includes('id="durood-count"') && _html44.includes('id="durood-sound-row"'), "settings html");
      check("Fix #44: PREAZAN_TEXTS verbatim and AZAN_SPEAK_TEXTS == PREAZAN_TEXTS (unchanged by this fix)",
        PREAZAN_TEXTS.Fajr === "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        PREAZAN_TEXTS.Isha === "ইশার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        AZAN_SPEAK_TEXTS.Fajr === PREAZAN_TEXTS.Fajr && AZAN_SPEAK_TEXTS.Isha === PREAZAN_TEXTS.Isha, "verbatim");
      // Functional JS: the default, the select, the sync, the count.
      check("Fix #44: the reminder sound defaults to the reminder tone (DEFAULTS)",
        src.includes('duroodRemindSound:"reminder"'), "default reminder");
      check("Fix #44: the sound names resolve in Bengali and there are exactly three choices",
        duroodRemindSoundName("reminder") === "রিমাইন্ডার টোন" && duroodRemindSoundName("istighfar") === "ইস্তিগফার" && duroodRemindSoundName("silent") === "নিঃশব্দ" &&
        DUROOD_REMIND_SOUNDS.length === 3, "names");
      const _saved44 = JSON.parse(JSON.stringify({ duroodOnUnlock: settings.duroodOnUnlock, duroodRemindSound: settings.duroodRemindSound, lang: settings.lang }));
      settings.lang = "bn";
      settings.duroodOnUnlock = true;
      settings.duroodRemindSound = "reminder";
      try {
        renderDuroodSoundSelect();
        check("Fix #44: the sound select lists all three choices with the current one selected",
          __$("#set-durood-sound").innerHTML.includes('value="reminder"') &&
          __$("#set-durood-sound").innerHTML.includes('value="istighfar"') &&
          __$("#set-durood-sound").innerHTML.includes('value="silent"') &&
          __$("#set-durood-sound").value === "reminder", "3 choices");
        const _rec44 = [];
        globalThis.Capacitor = { Plugins: { DuroodUnlock: {
          setEnabled: async(a)=>{ _rec44.push(["setEnabled", a]); return {}; },
          setReminderSound: async(a)=>{ _rec44.push(["setReminderSound", a]); return {}; },
          getDuroodStats: async()=>({ total: 12, today: 3 }),
        }}};
        __$("#set-durood-sound").value = "istighfar";
        __$("#set-durood-sound").onchange({ target: __$("#set-durood-sound") });
        check("Fix #44: picking a sound saves it and syncs it to native (setReminderSound)",
          settings.duroodRemindSound === "istighfar" &&
          _rec44.some(r=>r[0]==="setReminderSound" && r[1].sound==="istighfar"), "choice syncs");
        syncDuroodToggleNative();
        check("Fix #44: the toggle sync sends both the on/off state and the sound choice",
          _rec44.some(r=>r[0]==="setEnabled" && r[1].enabled===true) &&
          _rec44.some(r=>r[0]==="setReminderSound" && r[1].sound==="istighfar"), "sync both");
        await refreshDuroodStats();
        check("Fix #44: the count line shows today + total from the plugin",
          __$("#durood-count").textContent.includes("আজ 3 বার") && __$("#durood-count").textContent.includes("মোট 12 বার"), "count shown");
        delete globalThis.Capacitor;
      } finally {
        Object.assign(settings, _saved44);
        delete globalThis.Capacitor;
      }
    }
    // ---- Fix #45 (28 Nov 2026, user correction): the unlock durood
    // AUTO-PLAYS on unlock (Al-Shafie behaviour) — no button press.
    // Count, sound choice and toggle stay from Fix #44. The ✅ button
    // is only a replay; the notification posts AFTER the durood
    // finishes so the chosen tone never overlaps it. ----
    {
      const _javaUnlock45 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodUnlockReceiver.java", "utf8");
      const _javaPlay45 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodPlayReceiver.java", "utf8");
      const _javaPlayer45 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodPlayer.java", "utf8");
      const _html45 = fs.readFileSync("/home/hatch/workspace/deen-day/index.html", "utf8");
      // (a) unlock triggers durood playback with no button press: the
      // receiver calls the shared player directly on USER_PRESENT —
      // playback is not behind any PendingIntent/action.
      check("Fix #45: unlock auto-plays the durood — the receiver plays it directly on USER_PRESENT, no button press",
        _javaUnlock45.includes("DuroodPlayer.playOnce(context)") &&
        _javaUnlock45.indexOf("DuroodPlayer.playOnce(context)") < _javaUnlock45.indexOf("postReminder(context)"), "auto-play first");
      // (b) the count increments on auto-play (inside the shared player,
      // once playback actually starts).
      check("Fix #45: the count increments when the durood auto-plays",
        _javaPlayer45.includes("DuroodUnlockReceiver.incrementCount(context)") &&
        _javaPlayer45.indexOf("mp.start()") < _javaPlayer45.indexOf("incrementCount(context)"), "counts on play");
      // (c) toggle off disables auto-play: the receiver returns before
      // any playback when the stored toggle is off.
      check("Fix #45: toggle off disables auto-play (receiver returns before playing)",
        _javaUnlock45.includes('if (!prefs.getBoolean(KEY_DUROOD_ON, true)) return;') &&
        _javaUnlock45.indexOf('if (!prefs.getBoolean(KEY_DUROOD_ON, true)) return;') < _javaUnlock45.indexOf("DuroodPlayer.playOnce(context)"), "toggle gates play");
      // (d) the sound choice is respected: the reminder still posts on
      // the channel of the stored choice — after the durood, so the
      // tone never overlaps it.
      check("Fix #45: the sound choice is respected (reminder posts on the chosen channel, after playback)",
        _javaUnlock45.includes("channelForSound(ctx)") && _javaUnlock45.includes('getString(KEY_REMIND_SOUND, "reminder")'), "sound kept");
      // The shared player: blocks until the clip finishes/errors or
      // 10 s elapse, then releases; full volume + create() fallback.
      check("Fix #45: the shared player waits for the clip (latch + 10 s cap) and releases it",
        _javaPlayer45.includes("CountDownLatch") && _javaPlayer45.includes("await(10, TimeUnit.SECONDS)") && _javaPlayer45.includes("safeRelease(mp)"), "bounded wait");
      // Exactly two playback call sites in all of Java: unlock auto-play
      // + ✅ replay. No other path can play the durood.
      const _allJava45 = ["DuroodUnlockReceiver", "DuroodPlayReceiver", "DuroodPlayer", "DuroodUnlockPlugin", "UnlockKeepAliveService", "MainActivity", "BootReceiver", "AlarmReceiver", "AlarmScheduler", "PrayerAlarmPlugin", "AzanPlaybackService"]
        .map(f => { try { return fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/" + f + ".java", "utf8"); } catch (e) { return ""; } }).join("\n");
      check("Fix #45: exactly two durood playback call sites (unlock + ✅ replay), nowhere else",
        (_allJava45.match(/DuroodPlayer\.playOnce\(context\)/g) || []).length === 2, "two triggers");
      // The notification is a replay-only affordance now, and the
      // settings hint says so.
      check("Fix #45: the ✅ button is a replay (label kept) and the settings hint says the durood plays by itself",
        _javaUnlock45.includes('"✅ দরুদ শুনুন"') && _html45.includes("আনলক করলে দরুদ নিজে থেকেই বাজবে"), "replay wording");
      // Functional JS: toggle off syncs enabled:false to native.
      const _saved45 = JSON.parse(JSON.stringify({ duroodOnUnlock: settings.duroodOnUnlock, duroodRemindSound: settings.duroodRemindSound }));
      settings.duroodOnUnlock = false;
      settings.duroodRemindSound = "silent";
      try {
        const _rec45 = [];
        globalThis.Capacitor = { Plugins: { DuroodUnlock: {
          setEnabled: async(a)=>{ _rec45.push(["setEnabled", a]); return {}; },
          setReminderSound: async(a)=>{ _rec45.push(["setReminderSound", a]); return {}; },
          getDuroodStats: async()=>({ total: 0, today: 0 }),
        }}};
        syncDuroodToggleNative();
        check("Fix #45: toggle off syncs enabled:false (and the sound choice) to native",
          _rec45.some(r=>r[0]==="setEnabled" && r[1].enabled===false) &&
          _rec45.some(r=>r[0]==="setReminderSound" && r[1].sound==="silent"), "off syncs");
      } finally {
        Object.assign(settings, _saved45);
        delete globalThis.Capacitor;
      }
      // PREAZAN_TEXTS verbatim (unchanged by this fix).
      check("Fix #45: PREAZAN_TEXTS verbatim and AZAN_SPEAK_TEXTS == PREAZAN_TEXTS (unchanged by this fix)",
        PREAZAN_TEXTS.Fajr === "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        PREAZAN_TEXTS.Isha === "ইশার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
        AZAN_SPEAK_TEXTS.Fajr === PREAZAN_TEXTS.Fajr && AZAN_SPEAK_TEXTS.Isha === PREAZAN_TEXTS.Isha, "verbatim");
    }
    // ---- Fix #46 (28 Nov 2026, user report + screenshots): the Home
    // countdown ring showed the NEXT forbidden window as the current
    // state ("নিষিদ্ধ সময় (দুপুর)", "শুরু হতে বাকি" 05:23 at 07:35,
    // when it was Ishraq time). The ring now shows ONLY what is
    // happening NOW: the current nafl window (Ishraq → Chasht → Duha)
    // in the morning, a forbidden window only while actually inside
    // it — and a future forbidden window is never the "next" event. ----
    {
      const _savedTimings46 = __getTimings();
      // The stubbed day is 19 Nov Ipoh (Fajr 05:42, Sunrise 07:03,
      // Dhuhr 13:00, Asr 16:24, Maghrib 18:58, Isha 20:10): nafl period
      // 07:18 → 12:56, thirds ≈ 112.7 min (Ishraq → 09:10, Chasht →
      // 11:03, Duha → 12:56).
      __setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:00", Asr:"16:24", Maghrib:"18:58", Isha:"20:10", Imsak:"05:32", Firstthird:"22:59", Lastthird:"03:01"});
      try {
        const _at46 = (h, m, s=0) => { const d = new Date(); d.setHours(h, m, s, 0); return d; };
        const _n0735 = nextEvent(_at46(7, 35, 40));
        check("Fix #46: at 07:35 the ring shows Ishraq (current nafl), counting to zawal 12:56 — never forbidden",
          _n0735.kind==="nafl" && _n0735.id==="Ishraq" && _n0735.state==="current" && _n0735.at.getHours()===12 && _n0735.at.getMinutes()===56, _n0735.kind+" "+_n0735.id);
        const _n1000 = nextEvent(_at46(10, 0));
        check("Fix #46: mid-morning the ring shows Chasht (current nafl), counting to zawal",
          _n1000.kind==="nafl" && _n1000.id==="Chasht" && _n1000.state==="current" && _n1000.at.getHours()===12 && _n1000.at.getMinutes()===56, _n1000.kind+" "+_n1000.id);
        const _n1130 = nextEvent(_at46(11, 30));
        check("Fix #46: late morning the ring shows Duha (current nafl), counting to zawal",
          _n1130.kind==="nafl" && _n1130.id==="Duha" && _n1130.state==="current" && _n1130.at.getHours()===12 && _n1130.at.getMinutes()===56, _n1130.kind+" "+_n1130.id);
        const _n0710 = nextEvent(_at46(7, 10));
        check("Fix #46: inside the morning forbidden window the ring still shows forbidden (current), counting to its end 07:18",
          _n0710.kind==="forbidden" && _n0710.id==="ForbMorning" && _n0710.state==="current" && _n0710.at.getHours()===7 && _n0710.at.getMinutes()===18, _n0710.kind+" "+_n0710.id);
        const _n1300 = nextEvent(_at46(13, 0));
        check("Fix #46: inside the midday forbidden window the ring still shows forbidden (current), counting to its end 13:02",
          _n1300.kind==="forbidden" && _n1300.id==="ForbNoon" && _n1300.state==="current" && _n1300.at.getHours()===13 && _n1300.at.getMinutes()===2, _n1300.kind+" "+_n1300.id);
        const _n0600 = nextEvent(_at46(6, 0));
        check("Fix #46: a prayable prayer is never displaced by the nafl window (06:00 shows Fajr, current)",
          _n0600.kind==="prayer" && _n0600.id==="Fajr" && _n0600.state==="current", _n0600.kind+" "+_n0600.id);
        // Property: across the whole stubbed day, the ring NEVER shows
        // a forbidden window as an upcoming event.
        let _bad46 = null;
        for (let m = 0; m < 1440; m += 30) {
          const ev = nextEvent(_at46(Math.floor(m/60), m%60));
          if (ev.kind==="forbidden" && ev.state==="upcoming") { _bad46 = `${Math.floor(m/60)}:${String(m%60).padStart(2,"0")} ${ev.id}`; break; }
        }
        check("Fix #46: no time of day shows a forbidden window as upcoming (day sweep, every 30 min)",
          _bad46===null, _bad46 || "clean sweep");
        // The ring label knows the nafl kind (not "forbidden time").
        check("Fix #46: the ring label shows 'নফল নামাজ' for a nafl event",
          src.includes('ev.kind==="nafl" ? Lb("নফল নামাজ", "Nafl prayer")'), "nafl label");
        // The reported 28 Nov case, with the user's own times (Fajr
        // 05:45, Sunrise 07:07, Dhuhr 13:03): 07:35 is Ishraq, counting
        // to 12:59 (dhuhr−4) — the same 05:23 countdown Muslims Day
        // showed.
        __setTimings({Fajr:"05:45", Sunrise:"07:07", Dhuhr:"13:03", Asr:"16:27", Maghrib:"19:02", Isha:"20:16", Imsak:"05:35", Firstthird:"23:02", Lastthird:"03:04"});
        const _n0735b = nextEvent(_at46(7, 35, 40));
        check("Fix #46: the reported 28 Nov case — 07:35 is Ishraq (current), counting to 12:59",
          _n0735b.kind==="nafl" && _n0735b.id==="Ishraq" && _n0735b.state==="current" && _n0735b.at.getHours()===12 && _n0735b.at.getMinutes()===59, _n0735b.kind+" "+_n0735b.id);
      } finally {
        __setTimings(_savedTimings46);
      }
    }
    // ---- Fix #47 (28 Nov 2026, user order + marked screenshot): the
    // Home page icons are smaller and the marked section (dates +
    // countdown ring + pills + 5 prayer rows + Alarm/Calendar row)
    // fits on ONE 1080x2400 screen without scrolling. The budget is
    // computed from the CSS itself (box model), not by feel:
    // viewport 411x914 CSS px (1080/2400 @ 2.625 density), minus the
    // 24px status bar and the ~51px bottom nav = 839px for the marked
    // section (sticky header + ring hero + prayer card + nav row).
    // Text sizes are NOT shrunk — only icons, paddings and the ring. ----
    {
      const _css47 = css; // www/styles.css, read at the top of this file
      const _num47 = re => { const m = _css47.match(re); return m ? parseFloat(m[1]) : NaN; };
      const _nums47 = re => { const m = _css47.match(re); return m ? [parseFloat(m[1]), parseFloat(m[2])].filter(v=>!isNaN(v)) : [NaN, NaN]; };
      // Icon sizes (smaller than before).
      const _ring47 = _num47(/\.ring-wrap\{[^}]*width:(\d+)px/);
      const _brand47 = _num47(/\.brand img\{[^}]*width:(\d+)px/);
      const _bell47 = _num47(/\.icon-btn\{[^}]*width:(\d+)px/);
      const _moon47 = _num47(/\.ring-hero \.ring-moon\{[^}]*font-size:(\d+)px/);
      const _pic47 = _num47(/\.p-ic\{[^}]*font-size:(\d+)px/);
      const _done47 = _num47(/\.done-circle\{[^}]*width:(\d+)px/);
      const _hic47 = _num47(/\.home-nav-btn \.hic\{[^}]*font-size:(\d+)px/);
      check("Fix #47: Home icons are smaller (ring 220→180, brand 44→36, bell 40→36, moon 34→28, prayer 16→14, done 26→22, nav 16→13)",
        _ring47===180 && _brand47===36 && _bell47===36 && _moon47===28 && _pic47===14 && _done47===22 && _hic47===13,
        `ring ${_ring47}, brand ${_brand47}, bell ${_bell47}, moon ${_moon47}, pic ${_pic47}, done ${_done47}, hic ${_hic47}`);
      // Text sizes are NOT shrunk.
      check("Fix #47: text sizes unchanged (prayer name 16, range 15, ring count 34, ring name 22, nav button 16, dates 13.5)",
        /\.prayer-row \.p-name\{[^}]*font-size:16px/.test(_css47) && /#prayer-list \.p-range\{[^}]*font-size:15px/.test(_css47) &&
        /\.ring-count\{[^}]*font-size:34px/.test(_css47) && /\.ring-name\{[^}]*font-size:22px/.test(_css47) &&
        /\.home-nav-btn\{[^}]*font-size:16px/.test(_css47) && /\.dates\{[^}]*font-size:13\.5px/.test(_css47), "text kept");
      // Layout budget from the CSS values (single-line text ≈ 1.2×
      // font-size; the date lines are 2 lines at 13.5px × 1.5).
      const _hdrPad47 = _nums47(/header\{[^}]*padding:(\d+)px \d+px (\d+)px/);
      const _dates47 = _nums47(/\.dates\{[^}]*margin-top:(\d+)px; font-size:([\d.]+)px;[^}]*line-height:([\d.]+)/);
      const _datesMt47 = _dates47[0], _datesFs47 = _dates47[1];
      const _datesLh47 = (()=>{ const m = _css47.match(/\.dates\{[^}]*line-height:([\d.]+)/); return m ? parseFloat(m[1]) : NaN; })();
      const _ringPadT47 = _num47(/#view-home \.ring-hero\{[^}]*padding-top:(\d+)px/);
      const _ringPadB47 = _nums47(/^\.ring-hero\{[^}]*padding:(\d+)px \d+px (\d+)px/m)[1];
      const _pillsMt47 = _num47(/\.pills\{[^}]*margin-top:(\d+)px/);
      const _pillPad47 = _num47(/\.pill\{[^}]*padding:(\d+)px/);
      const _rowPad47 = _num47(/#prayer-list \.prayer-row\{[^}]*padding:(\d+)px/);
      const _cardPad47 = _num47(/\.card\{[^}]*padding:(\d+)px/);
      const _cardMb47 = _num47(/\.card\{[^}]*margin-bottom:(\d+)px/);
      const _navBtnPad47 = _num47(/\.home-nav-btn\{[^}]*padding:(\d+)px/);
      const _navPad47 = _nums47(/nav button\{[^}]*padding:(\d+)px \d+px (\d+)px/);
      const _navIc47 = _num47(/nav button \.ic\{[^}]*font-size:(\d+)px/);
      const _navFs47 = _num47(/nav button\{[^}]*font-size:([\d.]+)px/);
      const _mainPad47 = _num47(/main\{padding:(\d+)px/);
      const _headerH47 = _hdrPad47[0] + _hdrPad47[1] + Math.max(_brand47, 41) + _datesMt47 + Math.ceil(2 * _datesFs47 * _datesLh47);
      const _pillH47 = _pillPad47 * 2 + Math.ceil(13 * 1.2) + 2;
      const _ringH47 = _ringPadT47 + _ring47 + _pillsMt47 + _pillH47 + _ringPadB47 + _cardMb47;
      const _prayerH47 = _cardPad47 * 2 + 5 * (_rowPad47 * 2 + _done47) + 4 + _cardMb47;
      const _navRowH47 = 8 * 2 + (_navBtnPad47 * 2 + Math.ceil(16 * 1.2)) + _cardMb47;
      const _total47 = _headerH47 + _mainPad47 + _ringH47 + _prayerH47 + _navRowH47;
      const _navH47 = _navPad47[0] + _navPad47[1] + Math.ceil(_navIc47 * 1.1) + Math.ceil(_navFs47 * 1.3) + 1;
      const _avail47 = 914 - 24 - _navH47;
      check("Fix #47: the marked Home section fits one 1080x2400 screen (total ≤ viewport − status bar − bottom nav)",
        _total47 <= _avail47, `total ${_total47} ≤ ${_avail47} (header ${_headerH47} + ring ${_ringH47} + prayer ${_prayerH47} + navrow ${_navRowH47})`);
    }

    // ---- Fix #48 (28 Nov 2026, user order): shorten the notification
    // durood + istighfar audio. Istighfar was 6.17 s (two phrases) —
    // now just "আস্তাগফিরুল্লাহ" once (~1.4 s). Durood was 3.72 s
    // ("আল্লাহুম্মা সাল্লি ওয়া সাল্লিম আলা নাবিয়্যিনা মুহাম্মাদ") —
    // now the shortest form "সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম" (~2.7 s).
    // Same Google Translate TTS voice (bn), same 24 kHz mono 64 kbps
    // format; silence trimmed at both ends. The wait is dynamic
    // (DuroodPlayer blocks on MediaPlayer completion, 10 s cap), so no
    // timing constant changes — only the comments pinning the old
    // durations. Istighfar travels as base64 text (assets/istighfar.b64,
    // decoded by the workflow at build time); durood is a binary in the
    // repo (www/audio + res/raw).
    {
      const _cp48 = require("child_process");
      const _durFn48 = f => parseFloat(_cp48.execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`, {encoding:"utf8"}).trim());
      const _d48 = "/home/hatch/workspace/deen-day/audio/durood.mp3";
      const _i48 = "/home/hatch/workspace/deen-day/audio/istighfar.mp3";
      const _dd48 = _durFn48(_d48), _di48 = _durFn48(_i48);
      check("Fix #48: new durood clip is the short form (~2.7 s, was 3.72 s)", _dd48 > 2.0 && _dd48 < 3.2, `${_dd48} s`);
      check("Fix #48: new istighfar clip is one 'আস্তাগফিরুল্লাহ' (~1.4 s, was 6.17 s)", _di48 > 1.0 && _di48 < 2.0, `${_di48} s`);
      const _same48 = (a, b) => fs.readFileSync(a).equals(fs.readFileSync(b));
      check("Fix #48: all 4 durood.mp3 copies byte-identical",
        _same48(_d48, "/home/hatch/workspace/deen-day/www/audio/durood.mp3") &&
        _same48(_d48, "/home/hatch/workspace/deen-day/android/app/src/main/res/raw/durood.mp3") &&
        _same48(_d48, "/home/hatch/workspace/deen-day/android/app/src/main/assets/public/audio/durood.mp3"), "4 copies");
      check("Fix #48: all 4 istighfar.mp3 copies byte-identical",
        _same48(_i48, "/home/hatch/workspace/deen-day/www/audio/istighfar.mp3") &&
        _same48(_i48, "/home/hatch/workspace/deen-day/android/app/src/main/res/raw/istighfar.mp3") &&
        _same48(_i48, "/home/hatch/workspace/deen-day/android/app/src/main/assets/public/audio/istighfar.mp3"), "4 copies");
      const _b64_48 = fs.readFileSync("/home/hatch/workspace/deen-day/assets/istighfar.b64", "utf8");
      check("Fix #48: assets/istighfar.b64 decodes to the new short istighfar clip",
        Buffer.from(_b64_48.trim(), "base64").equals(fs.readFileSync(_i48)) && !_b64_48.includes("\n"), "single-line base64");
      const _dp48 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodPlayer.java", "utf8");
      const _duroodRcv48 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodUnlockReceiver.java", "utf8");
      const _dpr48 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/DuroodPlayReceiver.java", "utf8");
      check("Fix #48: Java comments pin the new durations (2.68 s / 1.4 s)",
        _dp48.includes("2.68 s") && _dp48.includes("istighfar 1.4 s") &&
        _duroodRcv48.includes("2.68 s") && _duroodRcv48.includes("istighfar 1.4 s") && _dpr48.includes("2.68 s"), "new durations");
      check("Fix #48: old durations gone from the player/receiver comments + app.js",
        !/3\.72 s/.test(_dp48 + _duroodRcv48 + _dpr48) && !/6\.2 s/.test(_dp48 + _duroodRcv48 + _dpr48) &&
        src.includes("istighfar.mp3 (1.4 s)") && !src.includes("istighfar.mp3 (6.2 s)"), "old durations gone");
    }

    // ---- Fix #49 (28 Nov 2026, user report): Friday Dhuhr azan-time
    // speech must say Jumu'ah. The pre-azan reminders already did
    // (Fix #42), but the azan-time announcement still said the normal
    // Dhuhr sentence — AZAN_SPEAK_TEXTS has no Friday override. New
    // day-aware azanSpeakText(id, locDate), mirroring preazanText:
    // Friday Dhuhr → JUMUAH_AZAN_SPEAK_TEXT, everything else →
    // AZAN_SPEAK_TEXTS. Used by checkAzan (foreground TTS) and by
    // buildPrayerAlarmList (native alarm speakText, baked at schedule
    // time). The Java rescheduleNextDay recomputes the same sentences
    // for the new day, so Friday's Jumu'ah text never leaks to
    // Saturday. PREAZAN_TEXTS / AZAN_SPEAK_TEXTS verbatim, never edited.
    {
      const _saved49 = { ...settings };
      Object.assign(settings, { country:"Malaysia", city:"Ipoh", lat:4.5975, lon:101.0901,
        tzName:"Asia/Kuala_Lumpur", locId:"ipoh", tzLoc:"ipoh", method:0, school:1, schoolExplicit:false });
      __setTimings({Fajr:"05:42", Sunrise:"07:03", Dhuhr:"13:00", Asr:"16:24", Maghrib:"18:58", Isha:"20:10", Imsak:"05:32", Firstthird:"22:59", Lastthird:"03:01"});
      const _RealDate49 = Date;
      const _fake49 = (y, m, d) => {
        const t = new Date(y, m, d); t.setHours(4, 0, 0, 0);
        globalThis.Date = class extends _RealDate49 {
          constructor(...a){ super(...(a.length ? a : [t.getTime()])); }
          static now(){ return t.getTime(); }
        };
      };
      try {
        const _fri49 = new Date(2026, 10, 20); // Friday
        const _thu49 = new Date(2026, 10, 19); // Thursday
        check("Fix #49: azanSpeakText returns the Jumu'ah sentence for Friday Dhuhr",
          azanSpeakText("Dhuhr", _fri49) === JUMUAH_AZAN_SPEAK_TEXT &&
          JUMUAH_AZAN_SPEAK_TEXT === "জুম্মার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন", azanSpeakText("Dhuhr", _fri49));
        check("Fix #49: azanSpeakText is unchanged on other days and other prayers",
          azanSpeakText("Dhuhr", _thu49) === AZAN_SPEAK_TEXTS.Dhuhr &&
          azanSpeakText("Fajr", _fri49) === AZAN_SPEAK_TEXTS.Fajr &&
          azanSpeakText("Asr", _fri49) === AZAN_SPEAK_TEXTS.Asr &&
          azanSpeakText("Maghrib", _fri49) === AZAN_SPEAK_TEXTS.Maghrib &&
          azanSpeakText("Isha", _fri49) === AZAN_SPEAK_TEXTS.Isha, "other days/prayers");
        check("Fix #49: AZAN_SPEAK_TEXTS / PREAZAN_TEXTS verbatim (Dhuhr entries unchanged)",
          AZAN_SPEAK_TEXTS.Dhuhr === "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
          PREAZAN_TEXTS.Dhuhr === "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন" &&
          AZAN_SPEAK_TEXTS.Dhuhr === PREAZAN_TEXTS.Dhuhr, "verbatim");
        _fake49(2026, 10, 20); // Friday
        const _friList49 = buildPrayerAlarmList();
        const _friAzan49 = _friList49.filter(a=>a.prayerId==="Dhuhr" && a.type.indexOf("azan")===0 && a.speakText);
        check("Fix #49: Friday Dhuhr azan entry carries the Jumu'ah speakText (native path)",
          _friAzan49.length===1 && _friAzan49[0].speakText===JUMUAH_AZAN_SPEAK_TEXT, _friAzan49.map(a=>a.speakText).join(" | "));
        const _friOther49 = _friList49.filter(a=>a.prayerId!=="Dhuhr" && a.type.indexOf("azan")===0 && a.speakText);
        check("Fix #49: Friday azan entries for other prayers keep their normal speakText",
          _friOther49.length===4 && _friOther49.every(a=>a.speakText===AZAN_SPEAK_TEXTS[a.prayerId]), "4 others");
        _fake49(2026, 10, 19); // Thursday
        const _thuList49 = buildPrayerAlarmList();
        const _thuAzan49 = _thuList49.filter(a=>a.prayerId==="Dhuhr" && a.type.indexOf("azan")===0 && a.speakText);
        check("Fix #49: Thursday Dhuhr azan entry carries the normal Dhuhr speakText",
          _thuAzan49.length===1 && _thuAzan49[0].speakText===AZAN_SPEAK_TEXTS.Dhuhr, "Thursday normal");
      } finally {
        globalThis.Date = _RealDate49;
        Object.assign(settings, _saved49);
      }
      check("Fix #49: checkAzan speaks via azanSpeakText (foreground TTS path)",
        src.includes('speakText(azanSpeakText(p, now), "bn-BD")'), "checkAzan");
      check("Fix #49: buildPrayerAlarmList bakes azanSpeakText(id, locNow(at)) (native path)",
        src.includes('azanSpeakText(id, locNow(at))'), "schedule-time");
      check("Fix #49: azanSpeakText mirrors preazanText (same Friday check locDate.getDay() === 5)",
        src.includes('function azanSpeakText(id, locDate)') && src.includes('locDate.getDay() === 5') &&
        src.includes('const JUMUAH_AZAN_SPEAK_TEXT = "জুম্মার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন"'), "same check");
      const _sched49 = fs.readFileSync("/home/hatch/workspace/deen-day/android/app/src/main/java/com/deenday/app/AlarmScheduler.java", "utf8");
      check("Fix #49: rescheduleNextDay recomputes the Dhuhr Friday sentences for the new day (no Saturday leak)",
        _sched49.includes("JUMUAH_AZAN_SPEAK_TEXT") && _sched49.includes("DAY_OF_WEEK") &&
        _sched49.includes("Calendar.FRIDAY") && _sched49.includes("JUMUAH_PREAZAN_TEXT"), "re-arm guard");
    }
  } finally {
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  }
})();
