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
const src = fs.readFileSync("/home/hatch/workspace/deen-day/www/app.js", "utf8");
const cut = src.indexOf('document.addEventListener("DOMContentLoaded"');
eval(src.slice(0, cut) + `
;globalThis.settings=settings; globalThis.store=store;
globalThis.forbiddenWindows=forbiddenWindows; globalThis.nextEvent=nextEvent; globalThis.nextPrayer=nextPrayer;
globalThis.computeTimingsLocal=computeTimingsLocal; globalThis.effSchool=effSchool; globalThis.schoolForRegion=schoolForRegion; globalThis.toMin=toMin;
globalThis.locNow=locNow; globalThis.locAbs=locAbs; globalThis.todayKey=todayKey; globalThis.ddmmyyyy=ddmmyyyy; globalThis.__getTimings=()=>timings;
globalThis.buildPrayerAlarmList=buildPrayerAlarmList; globalThis.renderPrayers=renderPrayers;
globalThis.renderCalendarPage=renderCalendarPage; globalThis.openPrayerDetail=openPrayerDetail;
globalThis.updateDetailTime=updateDetailTime; globalThis.renderAlarmPage=renderAlarmPage;
globalThis.renderLoginState=renderLoginState; globalThis.renderReminderSettings=renderReminderSettings; globalThis.dhikrMinFromOffset=dhikrMinFromOffset; globalThis.renderTracker=renderTracker; globalThis.renderFastHadith=renderFastHadith;
globalThis.renderFastSchedule=renderFastSchedule; globalThis.renderFasting=renderFasting;
globalThis.FASTING_HADITHS=FASTING_HADITHS; globalThis.PREAZAN_TEXTS=PREAZAN_TEXTS;
globalThis.TAHAJJUD_TEXT=TAHAJJUD_TEXT; globalThis.ALARM_SOUNDS=ALARM_SOUNDS;
globalThis.PREAZAN_IDS=PREAZAN_IDS; globalThis.PREAZAN5_IDS=PREAZAN5_IDS; globalThis.AZAN_IDS=AZAN_IDS;
globalThis.getDetailDraft=()=>detailDraft; globalThis.getDetailId=()=>detailId;
globalThis.__setTimings = v => { timings = v; };
globalThis.pname=pname; globalThis.Lb=Lb; globalThis.num=num; globalThis.t=t;
globalThis.migrateAlarmSounds=migrateAlarmSounds;
globalThis.normalizeSounds=normalizeSounds; globalThis.toggleDetailSound=toggleDetailSound;
globalThis.qiblaBearing=qiblaBearing; globalThis.updateNeedle=updateNeedle;
globalThis.__setQiblaDeg=v=>{ qiblaDeg=v; }; globalThis.__setHeading=v=>{ heading=v; };
globalThis.fetchQibla=fetchQibla; globalThis.__getQiblaDeg=()=>qiblaDeg;
globalThis.resolveCityCoordsOffline=resolveCityCoordsOffline;
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
check("profile form hidden after save, saved row shown with name",
  els["#profile-form"].classList.contains("hidden") && !els["#profile-saved"].classList.contains("hidden") && els["#profile-saved-name"].textContent === "Abu huryra");
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
check("midday forbidden dhuhr−10→dhuhr", fw[1].start===770 && fw[1].end===780, `${fw[1].start}–${fw[1].end}`);
check("evening forbidden maghrib−15→maghrib", fw[2].start===1123 && fw[2].end===1138, `${fw[2].start}–${fw[2].end}`);

// ---- nextEvent / countdown ring ----
const atNoon = new Date(); atNoon.setHours(12,0,0,0);
const ne1 = nextEvent(atNoon);
// ForbNoon (12:50) starts before Dhuhr (13:00), so it IS the next event.
check("nextEvent at 12:00 is the midday forbidden window (upcoming)", ne1.kind==="forbidden" && ne1.id==="ForbNoon" && ne1.at.getHours()===12 && ne1.at.getMinutes()===50 && ne1.state==="upcoming", ne1.id);
const at1305 = new Date(); at1305.setHours(13,5,0,0);
const ne1b = nextEvent(at1305);
check("nextEvent at 13:05 is Asr (upcoming)", ne1b.kind==="prayer" && ne1b.id==="Asr" && ne1b.state==="upcoming", ne1b.id);
const at1255 = new Date(); at1255.setHours(12,55,0,0);
const ne1c = nextEvent(at1255);
check("inside midday forbidden window counts to its end (13:00)", ne1c.kind==="forbidden" && ne1c.at.getHours()===13 && ne1c.at.getMinutes()===0 && ne1c.state==="current", ne1c.kind+" "+ne1c.at.getHours()+":"+ne1c.at.getMinutes());
const at705 = new Date(); at705.setHours(7,5,0,0);
const ne2 = nextEvent(at705);
check("inside morning forbidden window counts to its end", ne2.kind==="forbidden" && ne2.at.getHours()===7 && ne2.at.getMinutes()===18 && ne2.state==="current", ne2.kind+" "+ne2.at.getHours()+":"+ne2.at.getMinutes());

// ---- Fix #11: forbidden window must never displace a prayable prayer ----
// The user's report: 19 Nov, 18:27, Asr running — the ring showed the
// forbidden window as if it were already running.
const at1827 = new Date(); at1827.setHours(18,27,0,0);
const ne1827 = nextEvent(at1827);
check("Fix #11: at 18:27 the ring shows Asr (current), counting to 18:43", ne1827.kind==="prayer" && ne1827.id==="Asr" && ne1827.state==="current" && ne1827.at.getHours()===18 && ne1827.at.getMinutes()===43, ne1827.kind+" "+ne1827.id+" "+ne1827.at.getHours()+":"+ne1827.at.getMinutes());
const at1700 = new Date(); at1700.setHours(17,0,0,0);
const ne1700 = nextEvent(at1700);
check("Fix #11: at 17:00 the ring shows Asr (current), counting to 18:43", ne1700.kind==="prayer" && ne1700.id==="Asr" && ne1700.state==="current" && ne1700.at.getHours()===18 && ne1700.at.getMinutes()===43, ne1700.kind+" "+ne1700.id);
const at1850 = new Date(); at1850.setHours(18,50,0,0);
const ne1850 = nextEvent(at1850);
check("Fix #11: at 18:50 (inside evening window) the ring shows forbidden, counting to 18:58", ne1850.kind==="forbidden" && ne1850.id==="ForbEvening" && ne1850.state==="current" && ne1850.at.getHours()===18 && ne1850.at.getMinutes()===58, ne1850.kind+" "+ne1850.id);
const at0725 = new Date(); at0725.setHours(7,25,0,0);
const ne0725 = nextEvent(at0725);
check("Fix #11: at 07:25 (no prayer current) the next forbidden window is upcoming, not current", ne0725.kind==="forbidden" && ne0725.id==="ForbNoon" && ne0725.state==="upcoming", ne0725.kind+" "+ne0725.id+" "+ne0725.state);

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
Object.assign(settings, _savedS);

// ---- Alarm list ----
let list = buildPrayerAlarmList();
check("alarm list has 5 azan + 10 pre-azan by default", list.length===15 && list.filter(a=>a.type==="azan").length===5 && list.filter(a=>a.type==="preazan").length===10, String(list.length));
const fajrAzan = list.find(a=>a.prayerId==="Fajr" && a.type==="azan");
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

// ---- Fix #5 (part 2): Durood reminder uses the prayer-style slider ----
check("dhikrMinFromOffset: 0→30, +5→35, −10→20, clamps at 1 and 60",
  typeof dhikrMinFromOffset === "function" && dhikrMinFromOffset(0)===30 && dhikrMinFromOffset(5)===35 && dhikrMinFromOffset(-10)===20 && dhikrMinFromOffset(-30)===1 && dhikrMinFromOffset(30)===60);
settings.duroodRemOn = true; settings.duroodRemMin = 30; settings.astaghRemOn = true; settings.astaghRemMin = 30;
renderReminderSettings();
const remHtml = els["#reminder-settings"].innerHTML;
check("durood reminder has −30..+30 slider, 1-min steps, middle = exact time",
  remHtml.includes('data-rem-slider="durood"') && remHtml.includes('min="-30"') && remHtml.includes('max="30"') && remHtml.includes('step="1"') && remHtml.includes('value="0"') && remHtml.includes("সঠিক সময়"));
check("durood reminder has no fixed chips any more", !remHtml.includes('data-rem-min="durood:'));
check("astaghfirullah reminder still has 10/20/30 chips",
  remHtml.includes('data-rem-min="astagh:10"') && remHtml.includes('data-rem-min="astagh:30"'));
settings.duroodRemMin = 35; renderReminderSettings();
check("durood slider value follows the saved interval (35 min → +5)",
  els["#reminder-settings"].innerHTML.includes('data-rem-slider="durood"') && els["#reminder-settings"].innerHTML.includes('value="5"'));
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
    const az = alarmList.find(a=>a.type==="azan" && a.prayerId===pid);
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
  azanSoundList.find(a=>a.type==="azan" && a.prayerId==="Fajr").sound==="azan");
settings.alarmSound.Fajr = ["name","notification"];
const notifSoundList = buildPrayerAlarmList();
check("name + notification plays the notification sound",
  notifSoundList.find(a=>a.type==="azan" && a.prayerId==="Fajr").sound==="reminder");
settings.alarmSound.Fajr = ["silent"];
const silentSoundList = buildPrayerAlarmList();
check("silent alone plays no sound",
  silentSoundList.find(a=>a.type==="azan" && a.prayerId==="Fajr").sound==="none");
settings.alarmSound.Fajr = ["name"];
settings.alarmOn = {...settings.alarmOn, Fajr:false, Dhuhr:false, Asr:false, Maghrib:false, Isha:false, Tahajjud:false, Sehri:false, Iftar:false, Duha:false};
const alarmListOff = buildPrayerAlarmList();
check("pre-azan stays on even when every prayer alarm is off",
  alarmListOff.filter(a=>a.type==="preazan").length===10 &&
  alarmListOff.filter(a=>a.type==="azan").length===0 &&
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
check("Fix #12: at 16:29 Jashore the ring shows Asr (current), counting to 17:02",
  neJashore.kind==="prayer" && neJashore.id==="Asr" && neJashore.state==="current" &&
  neJashore.at.getHours()===17 && neJashore.at.getMinutes()===2, `${neJashore.kind} ${neJashore.id} ${neJashore.at.getHours()}:${neJashore.at.getMinutes()}`);
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
const maghAzan = buildPrayerAlarmList().find(a=>a.type==="azan" && a.prayerId==="Maghrib");
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
check("Fix #12 ring: label is 'বর্তমান নামাজ', sub is 'শেষ হতে বাকি', count ০০:৩৩:০০",
  els["#ring-label"].textContent === "বর্তমান নামাজ" &&
  els["#ring-sub"].textContent === "শেষ হতে বাকি" &&
  els["#ring-count"].textContent === "০০:৩৩:০০",
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
  } finally {
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  }
})();
