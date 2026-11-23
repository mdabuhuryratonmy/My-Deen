
/* My Deen v2.0 — free Islamic app. Data: Aladhan (prayer times) + AlQuran Cloud (Quran).
   All personal data stays in localStorage on the device. No accounts, no ads.
   Optional profile is local-only; login is never required. */
"use strict";
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const ALADHAN = "https://api.aladhan.com/v1";
const QURAN = "https://api.alquran.cloud/v1";
const AUDIO_CDN = "https://cdn.islamic.network/quran/audio/128";
/* Safe storage (fix 2026-11-17): inside sandboxed in-app browsers
   (e.g. the Muse app webview) merely READING window.localStorage
   throws a SecurityError. This script previously read localStorage
   unguarded near the top, so in those browsers the whole script died
   before any click handler was attached — the page rendered but NO
   option responded. LS probes localStorage once; when it is blocked
   it transparently falls back to an in-memory store, so every feature
   keeps working for the session. On normal browsers / the installed
   app, real localStorage is used exactly as before. */
const LS = (()=>{ try { const k="__dd_probe__"; localStorage.setItem(k,"1"); localStorage.removeItem(k); return localStorage; }
  catch(e){ const m = new Map(); return {
    getItem: k => m.has(k) ? m.get(k) : null,
    setItem: (k,v) => { m.set(k, String(v)); },
    removeItem: k => { m.delete(k); } }; } })();
const BN_DIG = "০১২৩৪৫৬৭৮৯";
const bnNum = n => num(n); // locale digits (bn / fa / Arabic-Indic / Latin) via i18n num()
const escHtml = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad2 = n => String(n).padStart(2, "0");
const todayKey = (d=locNow()) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const ddmmyyyy = (d=locNow()) => `${pad2(d.getDate())}-${pad2(d.getMonth()+1)}-${d.getFullYear()}`;

/* ---------------- i18n ----------------
   16 languages. English is the DEFAULT for new users; a saved language
   choice is always respected and never overridden. Missing translations
   fall back to English. Arabic Quran/duas text is unchanged. RTL
   languages (ar, ur, fa, ps) set dir="rtl". Ported from the My Deen
   project source i18n tables (same STR / PHRASE / L system). */
const LANGS = [{"id": "en", "name": "English", "native": "English", "locale": "en-US"}, {"id": "ar", "name": "Arabic", "native": "العربية", "locale": "ar"}, {"id": "bn", "name": "Bengali", "native": "বাংলা", "locale": "bn"}, {"id": "ur", "name": "Urdu", "native": "اردو", "locale": "ur"}, {"id": "ms", "name": "Malay", "native": "Bahasa Melayu", "locale": "ms"}, {"id": "id", "name": "Indonesian", "native": "Bahasa Indonesia", "locale": "id"}, {"id": "tr", "name": "Turkish", "native": "Türkçe", "locale": "tr"}, {"id": "fa", "name": "Persian", "native": "فارسی", "locale": "fa"}, {"id": "fr", "name": "French", "native": "Français", "locale": "fr"}, {"id": "hi", "name": "Hindi", "native": "हिन्दी", "locale": "hi"}, {"id": "ps", "name": "Pashto", "native": "پښتو", "locale": "ps"}, {"id": "ha", "name": "Hausa", "native": "Hausa", "locale": "ha"}, {"id": "sw", "name": "Swahili", "native": "Kiswahili", "locale": "sw"}, {"id": "ru", "name": "Russian", "native": "Русский", "locale": "ru"}, {"id": "es", "name": "Spanish", "native": "Español", "locale": "es"}, {"id": "de", "name": "German", "native": "Deutsch", "locale": "de"}];
const RTL_LANGS = ["ar","ur","fa","ps"];
const langMeta = id => LANGS.find(l=>l.id===id) || LANGS[0];
const isRTL = () => RTL_LANGS.includes(settings.lang);
const langLocale = () => langMeta(settings.lang).locale;
const AR_DIG = "٠١٢٣٤٥٦٧٨٩", FA_DIG = "۰۱۲۳۴۵۶۷۸۹";
const num = n => { const s = String(n);
  if (settings.lang==="bn") return s.replace(/\d/g, d=>BN_DIG[d]);
  if (settings.lang==="fa") return s.replace(/\d/g, d=>FA_DIG[d]);
  if (RTL_LANGS.includes(settings.lang)) return s.replace(/\d/g, d=>AR_DIG[d]);
  return s; };
const STR = {  en: {
    nav_home:"Home",
    nav_quran:"Quran",
    nav_tasbih:"Tasbih",
    nav_duas:"Duas",
    nav_qibla:"Qibla",
    nav_fasting:"Fasting",
    nav_settings:"Settings",
    learnTitle:"Learn Prayer (Salah)",
    learnCardTitle:"📚 Learn Prayer",
    learnCardDesc:"Prayer step by step according to authentic hadith — a faceless picture of every posture, how the hands are raised and folded, what to say at each step, plus all the duas and surahs needed for Salah.",
    learnOpen:"Start Learning →",
    learnBack:"← Home",
    learnIntro:"The Prophet ﷺ said: “Pray as you have seen me praying.” (Bukhari 631) — this guide follows that way of praying, step by step.",
    learnRakats:"Fard Rak'ahs",
    learnStepsTitle:"Prayer Step by Step",
    learnDuasTitle:"Duas & Surahs of Prayer",
    learnSayLabel:"What to say",
    learnHadithLabel:"Hadith",
    learnFullText:"Full text below ↓",
    learnDuasSub:"Everything recited in prayer — Arabic text, transliteration and meaning.",
    learnMadhabNote:"Note: the place of folding the hands (on the chest / below the navel) and raising the hands when moving in ruku and sujud (raf' al-yadayn) differ by madhhab — each view has hadith narrations behind it. Follow the madhhab you follow; debate over this is discouraged in Islam.",
    learnMadhabLabel:"Madhhab (school of thought)",
    learnMadhabHint:"The figures and labels follow the madhhab you choose.",
    learnMethodWord:"method",
    nextPrayer:"Next Prayer",
    prayersToday:"Today's Prayer Times",
    tracker:"Salah Tracker (Today)",
    windows:"Voluntary & Forbidden Times",
    fastTitle:"Suhoor & Iftar",
    saved:"Saved ✓",
    offline:"No internet — showing saved data",
    loadErr:"Could not load, try again",
    appTagline:"Prayer • Quran • Duas",
    myLocation:"My Location",
    locAutoBtn:"📍 Auto-set location from map",
    quranTracker:"Quran Tracker",
    readQuran:"Read Quran →",
    last7:"Last 7 days",
    forbiddenTitle:"Forbidden Prayer Times",
    forbiddenNote:"Prayer is forbidden at these times (exception: eclipse prayer and missed obligatory prayers).",
    naflTitle:"Voluntary Prayer Times",
    fastCal:"View Fasting Calendar →",
    quranTitle:"Holy Quran",
    progress:"Progress:",
    allSurahs:"All Surahs",
    bookmarksTab:"🔖 Bookmarks",
    readTab:"✅ Finished",
    backToList:"← Surah List",
    listenAll:"▶️ Listen All",
    stopListen:"⏸️ Stop",
    goBtn:"Go",
    markRead:"✅ Mark this Surah as read",
    markedRead:"✅ Finished ✓",
    nextSurah:"Next Surah →",
    nothingFound:"Nothing found.",
    noBookmarks:"No bookmarks yet. Tap 🔖 while reading the Quran to bookmark.",
    noReadYet:"No surah marked as read yet. After reading a surah, tap the \"Mark as read\" button.",
    noDuas:"No duas in this category.",
    ayahNotFound:"Ayah not found",
    ayahs:"Ayahs",
    prayersUnit:"prayers",
    tasbihTitle:"Digital Tasbih",
    targetLabel:"Target:",
    todayTotal:"Today total:",
    restartBtn:"↺ Start again",
    changeTarget:"🎯 Change target",
    tasbihHint:"Tap the circle to count. A light vibration on each tap.",
    todayCount:"Today's Count",
    duasTitle:"Duas & Adhkar",
    ruqyahTitle:"🛡️ Ruqyah",
    ruqyahDesc:"Ayatul Kursi, the last 2 ayahs of Surah Al-Baqarah, Surah Al-Ikhlas, Al-Falaq and An-Nas — read and listen.",
    ruqyahOpen:"Open Ruqyah",
    backToDuas:"← Duas",
    qiblaTitle:"Qibla Direction",
    qiblaNote:"Hold the phone flat and turn slowly — the golden needle will point to the Qibla.",
    useMyLoc:"📍 Use my location",
    fastingTitle:"Fasting",
    sunnahTitle:"Sunnah Fast Reminders",
    hijriMonthTitle:"Hijri Dates This Month",
    profileTitle:"Profile",
    profileDesc:"Your name stays only on your phone — it is never sent to any server.",
    yourName:"Your name",
    saveBtn:"Save",
    clearBtn:"Clear",
    settingsTitle:"Settings",
    autoLocLabel:"📍 Detect location automatically",
    autoLocDesc:"When on, your city is set automatically from GPS (permission required).",
    detectNow:"📍 Detect location now",
    cityLabel:"City",
    countryLabel:"Country",
    methodLabel:"Prayer calculation method",
    schoolLabel:"Asr madhab",
    shafii:"Shafi'i (standard)",
    hanafi:"Hanafi",
    langLabel:"Language",
    themeLabel:"Dark theme (sky theme)",
    azanLabel:"Azan at prayer time",
    duroodLabel:"📿 Durood on phone unlock",
    duroodDesc:"When on, Durood Sharif audio plays when you unlock your phone (or open the app). It will not play when off.",
    adhanLabel:"Azan voice",
    reciterLabel:"Quran reciter",
    notifLabel:"Notifications",
    dataPrivate:"All data stays only on your phone — nothing is sent to any server.",
    offsetsTitle:"Adjust azan time earlier/later",
    offsetsDesc:"You can play the azan for each prayer earlier or later than the prayer time — e.g. 15 minutes before Fajr (to prepare), or 5 minutes after Maghrib.",
    saveOffsets:"Save times",
    aboutTitle:"About the App",
    aboutLine1:"My Deen v2.0 — free Islamic app. Prayer times: Aladhan API; Quran: AlQuran Cloud. No ads.",
    aboutLine2:"A small effort to make your religious practice easier.",
    privacyBtn:"Privacy Policy",
    backToSettings:"← Settings",
    privacyTitle:"Privacy Policy",
    langFirstTitle:"Choose your language",
    langFirstDesc:"Select the language for the app. You can change it anytime in Settings.",
    loading:"Loading…",
    searchSurah:"Search surah…",
    saveDua:"🔖 Save",
    savedDua:"🔖 Saved ✓",
    loadingAyahs:"Loading ayahs…",
    ayahPlaceholder:"Ayah number",
    ruqyahNote:"Ayahs will load from the Quran. Tap the audio button to listen to the recitation.",},  ar: {
    nav_home:"الرئيسية",
    nav_quran:"القرآن",
    nav_tasbih:"المسبحة",
    nav_duas:"الأدعية",
    nav_qibla:"القبلة",
    nav_fasting:"الصيام",
    nav_settings:"الإعدادات",
    nextPrayer:"الصلاة القادمة",
    prayersToday:"مواقيت الصلاة اليوم",
    tracker:"تتبع الصلاة (اليوم)",
    windows:"أوقات النوافل والمكروهة",
    fastTitle:"السحور والإفطار",
    saved:"تم الحفظ ✓",
    offline:"لا يوجد إنترنت — يتم عرض البيانات المحفوظة",
    loadErr:"تعذر التحميل، حاول مرة أخرى",
    appTagline:"الصلاة • القرآن • الأدعية",
    myLocation:"موقعي",
    locAutoBtn:"📍 تحديد الموقع تلقائيًا من الخريطة",
    quranTracker:"تتبع القرآن",
    readQuran:"اقرأ القرآن ←",
    last7:"آخر ٧ أيام",
    forbiddenTitle:"أوقات النهي عن الصلاة",
    forbiddenNote:"الصلاة منهي عنها في هذه الأوقات (باستثناء صلاة الكسوف وقضاء الفرائض).",
    naflTitle:"أوقات صلاة النوافل",
    fastCal:"عرض تقويم الصيام ←",
    quranTitle:"القرآن الكريم",
    progress:"التقدم:",
    allSurahs:"كل السور",
    bookmarksTab:"🔖 العلامات",
    readTab:"✅ تمت القراءة",
    backToList:"← قائمة السور",
    listenAll:"▶️ استمع للكل",
    stopListen:"⏸️ إيقاف",
    goBtn:"اذهب",
    markRead:"✅ تحديد هذه السورة كمقروءة",
    markedRead:"✅ تمت القراءة ✓",
    nextSurah:"السورة التالية ←",
    nothingFound:"لم يتم العثور على شيء.",
    noBookmarks:"لا توجد علامات بعد. اضغط 🔖 أثناء قراءة القرآن لإضافة علامة.",
    noReadYet:"لم يتم تحديد أي سورة كمقروءة بعد. بعد قراءة سورة، اضغط زر \"تحديد كمقروءة\".",
    noDuas:"لا توجد أدعية في هذا القسم.",
    ayahNotFound:"لم يتم العثور على الآية",
    ayahs:"آيات",
    prayersUnit:"صلاة",
    tasbihTitle:"المسبحة الرقمية",
    targetLabel:"الهدف:",
    todayTotal:"مجموع اليوم:",
    restartBtn:"↺ ابدأ من جديد",
    changeTarget:"🎯 تغيير الهدف",
    tasbihHint:"اضغط على الدائرة للعد. اهتزاز خفيف مع كل ضغطة.",
    todayCount:"عدد اليوم",
    duasTitle:"الأدعية والأذكار",
    ruqyahTitle:"🛡️ الرقية",
    ruqyahDesc:"آية الكرسي، آخر آيتين من سورة البقرة، وسور الإخلاص والفلق والناس — اقرأ واستمع.",
    ruqyahOpen:"افتح الرقية",
    backToDuas:"← الأدعية",
    qiblaTitle:"اتجاه القبلة",
    qiblaNote:"ضع الهاتف بشكل مسطح وأدره ببطء — ستشير الإبرة الذهبية إلى القبلة.",
    useMyLoc:"📍 استخدم موقعي",
    fastingTitle:"الصيام",
    sunnahTitle:"تذكير بصيام السنة",
    hijriMonthTitle:"التواريخ الهجرية لهذا الشهر",
    profileTitle:"الملف الشخصي",
    profileDesc:"اسمك يبقى على هاتفك فقط — ولا يُرسل إلى أي خادم.",
    yourName:"اسمك",
    saveBtn:"حفظ",
    clearBtn:"مسح",
    settingsTitle:"الإعدادات",
    autoLocLabel:"📍 تحديد الموقع تلقائيًا",
    autoLocDesc:"عند التفعيل، يتم تحديد مدينتك تلقائيًا من GPS (يلزم الإذن). عند الإيقاف، تُستخدم المدينة أدناه.",
    detectNow:"📍 حدد الموقع الآن",
    cityLabel:"المدينة",
    countryLabel:"الدولة",
    methodLabel:"طريقة حساب الصلاة",
    schoolLabel:"مذهب العصر",
    shafii:"الشافعي (القياسي)",
    hanafi:"الحنفي",
    langLabel:"اللغة",
    themeLabel:"المظهر الداكن (مظهر السماء)",
    azanLabel:"الأذان عند وقت الصلاة",
    duroodLabel:"📿 الصلاة على النبي عند فتح الهاتف",
    duroodDesc:"عند التفعيل، يتم تشغيل صوت الصلاة على النبي عند فتح هاتفك (أو فتح التطبيق). ولن يعمل عند الإيقاف.",
    adhanLabel:"صوت الأذان",
    reciterLabel:"قارئ القرآن",
    notifLabel:"الإشعارات",
    dataPrivate:"جميع البيانات تبقى على هاتفك فقط — لا يُرسل أي شيء إلى أي خادم.",
    offsetsTitle:"تقديم أو تأخير وقت الأذان",
    offsetsDesc:"يمكنك تشغيل الأذان لكل صلاة قبل وقتها أو بعده — مثلاً قبل الفجر بـ 15 دقيقة (للاستعداد)، أو بعد المغرب بـ 5 دقائق.",
    saveOffsets:"حفظ الأوقات",
    aboutTitle:"عن التطبيق",
    aboutLine1:"My Deen v2.0 — تطبيق إسلامي مجاني. مواقيت الصلاة: Aladhan API؛ القرآن: AlQuran Cloud. بدون إعلانات.",
    aboutLine2:"جهد صغير لتيسير عبادتك.",
    privacyBtn:"سياسة الخصوصية",
    backToSettings:"← الإعدادات",
    privacyTitle:"سياسة الخصوصية",
    langFirstTitle:"اختر لغتك",
    langFirstDesc:"اختر لغة التطبيق. يمكنك تغييرها في أي وقت من الإعدادات.",
    loading:"جارٍ التحميل…",
    searchSurah:"ابحث عن سورة…",
    saveDua:"🔖 حفظ",
    savedDua:"🔖 تم الحفظ ✓",
    loadingAyahs:"جارٍ تحميل الآيات…",
    ayahPlaceholder:"رقم الآية",
    ruqyahNote:"سيتم تحميل الآيات من القرآن. اضغط زر الصوت للاستماع إلى التلاوة.",},  bn: {
    nav_home:"হোম",
    nav_quran:"কুরআন",
    nav_tasbih:"তাসবিহ",
    nav_duas:"দোয়া",
    nav_qibla:"কিবলা",
    nav_fasting:"রোজা",
    nav_settings:"সেটিংস",
    learnTitle:"নামাজ শিক্ষা",
    learnCardTitle:"📚 নামাজ শিক্ষা",
    learnCardDesc:"সহিহ হাদিস অনুযায়ী ধাপে ধাপে নামাজ — প্রতিটি ভঙ্গির ফেসলেস ছবি, কীভাবে হাত তুলতে হয় ও কোথায় বাঁধতে হয়, প্রতিটি ধাপে যা বলতে হয়, আর নামাজের জন্য দরকারি সব দোয়া ও সূরা।",
    learnOpen:"শেখা শুরু করুন →",
    learnBack:"← হোম",
    learnIntro:"রাসূলুল্লাহ ﷺ বলেছেন: “তোমরা সেভাবে নামাজ পড়ো, যেভাবে আমাকে নামাজ পড়তে দেখেছো।” (বুখারি ৬৩১) — এই গাইডে সেই নিয়মেই ধাপে ধাপে নামাজ শেখানো হয়েছে।",
    learnRakats:"ফরজ রাকাত",
    learnStepsTitle:"ধাপে ধাপে নামাজ",
    learnDuasTitle:"নামাজের দোয়া ও সূরা",
    learnSayLabel:"যা বলবেন",
    learnHadithLabel:"হাদিস",
    learnFullText:"পুরো লেখা নিচে ↓",
    learnDuasSub:"নামাজে যা যা পড়তে হয় — আরবি লেখা, উচ্চারণ ও অর্থসহ।",
    learnMadhabNote:"দ্রষ্টব্য: হাত বাঁধার স্থান (বুকের ওপর / নাভির নিচে) ও রুকু-সিজদায় যাওয়া-আসায় হাত তোলা (রফয়ে ইয়াদাইন) নিয়ে মাজহাবভেদে মতভেদ আছে — প্রতিটি মতের পক্ষেই হাদিসের বর্ণনা রয়েছে। আপনি যে মাজহাব অনুসরণ করেন, সে অনুযায়ী আমল করুন; এ নিয়ে বিতর্ক ইসলামে নিরুৎসাহিত।",
    learnMadhabLabel:"মাজহাব (ফিকহের ধারা)",
    learnMadhabHint:"যে মাজহাব বেছে নেবেন, ছবি ও লেবেল সেই অনুযায়ী বদলে যাবে।",
    learnMethodWord:"পদ্ধতি",
    nextPrayer:"পরবর্তী নামাজ",
    prayersToday:"আজকের নামাজের সময়",
    tracker:"নামাজের হিসাব (আজ)",
    windows:"নফল ও মাকরুহ সময়",
    fastTitle:"সেহরি ও ইফতার",
    saved:"সংরক্ষিত হয়েছে ✓",
    offline:"ইন্টারনেট নেই — আগের সংরক্ষিত তথ্য দেখানো হচ্ছে",
    loadErr:"লোড হয়নি, আবার চেষ্টা করুন",
    appTagline:"নামাজ • কুরআন • দোয়া",
    myLocation:"আমার অবস্থান",
    locAutoBtn:"📍 ম্যাপ থেকে লোকেশন অটো সেট করুন",
    quranTracker:"কুরআন ট্র্যাকার",
    readQuran:"কুরআন পড়ুন →",
    last7:"গত ৭ দিন",
    forbiddenTitle:"সালাতের নিষিদ্ধ সময়",
    forbiddenNote:"এই সময়গুলোতে সালাত আদায় নিষিদ্ধ (ব্যতিক্রম: সূর্যগ্রহণের নামাজ ও কাজা ফরজ)।",
    naflTitle:"নফল সালাতের সময়",
    fastCal:"রোজার ক্যালেন্ডার দেখুন →",
    quranTitle:"পবিত্র কুরআন",
    progress:"অগ্রগতি:",
    allSurahs:"সব সূরা",
    bookmarksTab:"🔖 বুকমার্ক",
    readTab:"✅ পড়া শেষ",
    backToList:"← সূরার তালিকা",
    listenAll:"▶️ সব শুনুন",
    stopListen:"⏸️ বন্ধ করুন",
    goBtn:"যান",
    markRead:"✅ এই সূরা পড়া শেষ",
    markedRead:"✅ পড়া শেষ ✓",
    nextSurah:"পরের সূরা →",
    nothingFound:"কিছু পাওয়া যায়নি।",
    noBookmarks:"কোনো বুকমার্ক নেই। কুরআন পড়ার সময় 🔖 চাপ দিয়ে বুকমার্ক করুন।",
    noReadYet:"এখনো কোনো সূরা পড়া শেষ হিসেবে চিহ্নিত করা হয়নি। সূরা পড়ে \"এই সূরা পড়া শেষ\" বোতামে চাপ দিন।",
    noDuas:"এই বিভাগে কোনো দোয়া নেই।",
    ayahNotFound:"আয়াত পাওয়া যায়নি",
    ayahs:"আয়াত",
    prayersUnit:"নামাজ",
    tasbihTitle:"ডিজিটাল তাসবিহ",
    targetLabel:"লক্ষ্য:",
    todayTotal:"আজ মোট:",
    restartBtn:"↺ আবার শুরু",
    changeTarget:"🎯 লক্ষ্য বদলান",
    tasbihHint:"বৃত্তে চাপ দিলেই গণনা বাড়বে। টিপ দিলে হালকা কম্পন হবে।",
    todayCount:"আজকের হিসাব",
    duasTitle:"দোয়া ও আজকার",
    ruqyahTitle:"🛡️ রুকইয়াহ",
    ruqyahDesc:"আয়াতুল কুরসি, সূরা বাকারার শেষ ২ আয়াত, সূরা ইখলাস, ফালাক ও নাস — পড়ুন ও শুনুন।",
    ruqyahOpen:"রুকইয়াহ খুলুন",
    backToDuas:"← দোয়া",
    qiblaTitle:"কিবলার দিক",
    qiblaNote:"ফোনটি সমতলে রেখে ধীরে ঘোরান — সোনালি সূচ কিবলার দিকে ঘুরবে।",
    useMyLoc:"📍 আমার অবস্থান ব্যবহার করুন",
    fastingTitle:"রোজা",
    sunnahTitle:"সুন্নত রোজার রিমাইন্ডার",
    hijriMonthTitle:"এই মাসের হিজরি তারিখ",
    profileTitle:"প্রোফাইল",
    profileDesc:"আপনার নাম শুধু আপনার ফোনেই থাকে, কোনো সার্ভারে যায় না।",
    yourName:"আপনার নাম",
    saveBtn:"সংরক্ষণ করুন",
    clearBtn:"মুছুন",
    settingsTitle:"সেটিংস",
    autoLocLabel:"📍 অবস্থান স্বয়ংক্রিয়ভাবে নির্ণয় করুন",
    autoLocDesc:"চালু থাকলে GPS থেকে আপনার শহর নিজে থেকেই সেট হবে (অনুমতি দিতে হবে)।",
    detectNow:"📍 এখনই অবস্থান নির্ণয় করুন",
    cityLabel:"শহর",
    countryLabel:"দেশ",
    methodLabel:"নামাজের হিসাবের পদ্ধতি",
    schoolLabel:"আসরের মাজহাব",
    shafii:"শাফিঈ (সাধারণ)",
    hanafi:"হানাফী",
    langLabel:"ভাষা",
    themeLabel:"ডার্ক থিম (আকাশ থিম)",
    azanLabel:"নামাজের সময় আজান",
    duroodLabel:"📿 ফোন আনলক করলে দরুদ",
    duroodDesc:"চালু থাকলে ফোন আনলক করলে (বা অ্যাপ খুললে) দরুদ শরিফের অডিও বাজবে। বন্ধ করলে বাজবে না।",
    adhanLabel:"আজানের সুর",
    reciterLabel:"তিলাওয়াতের কারি",
    notifLabel:"নোটিফিকেশন",
    dataPrivate:"সব তথ্য শুধু আপনার ফোনেই থাকে — কোনো সার্ভারে যায় না।",
    offsetsTitle:"আজানের সময় আগে-পরে করুন",
    offsetsDesc:"প্রত্যেক ওয়াক্তের আজান নামাজের সময়ের চেয়ে আগে বা পরে বাজাতে পারেন — যেমন ফজরে ১৫ মিনিট আগে (প্রস্তুতির জন্য), বা মাগরিবে ৫ মিনিট পরে।",
    saveOffsets:"সময় সংরক্ষণ করুন",
    aboutTitle:"অ্যাপ সম্পর্কে",
    aboutLine1:"My Deen v2.0 — ফ্রি ইসলামিক অ্যাপ। নামাজের সময়: Aladhan API; কুরআন: AlQuran Cloud। কোনো বিজ্ঞাপন নেই।",
    aboutLine2:"আপনাদের দ্বীনি পালন সহজ করতে ছোট একটু প্রচেষ্টা।",
    privacyBtn:"গোপনীয়তা নীতি",
    backToSettings:"← সেটিংস",
    privacyTitle:"গোপনীয়তা নীতি",
    langFirstTitle:"আপনার ভাষা বেছে নিন",
    langFirstDesc:"অ্যাপের ভাষা বেছে নিন। সেটিংস থেকে যেকোনো সময় বদলাতে পারবেন।",
    loading:"লোড হচ্ছে…",
    searchSurah:"সূরা খুঁজুন",
    saveDua:"🔖 সংরক্ষণ",
    savedDua:"🔖 সংরক্ষিত ✓",
    loadingAyahs:"আয়াত লোড হচ্ছে…",
    ayahPlaceholder:"আয়াত নম্বর",
    ruqyahNote:"আয়াতগুলো কুরআন থেকে লোড হবে। অডিও বোতামে চাপ দিলে তিলাওয়াত শুনতে পারবেন।",},  ur: {
    nav_home:"ہوم",
    nav_quran:"قرآن",
    nav_tasbih:"تسبیح",
    nav_duas:"دعائیں",
    nav_qibla:"قبلہ",
    nav_fasting:"روزہ",
    nav_settings:"ترتیبات",
    nextPrayer:"اگلی نماز",
    prayersToday:"آج کی نمازوں کے اوقات",
    tracker:"نماز کا حساب (آج)",
    windows:"نفل اور مکروہ اوقات",
    fastTitle:"سحری اور افطار",
    saved:"محفوظ ہو گیا ✓",
    offline:"انٹرنیٹ نہیں — محفوظ شدہ معلومات دکھائی جا رہی ہیں",
    loadErr:"لوڈ نہیں ہوا، دوبارہ کوشش کریں",
    appTagline:"نماز • قرآن • دعائیں",
    myLocation:"میری جگہ",
    locAutoBtn:"📍 نقشے سے مقام خودکار سیٹ کریں",
    quranTracker:"قرآن ٹریکر",
    readQuran:"قرآن پڑھیں ←",
    last7:"پچھلے ۷ دن",
    forbiddenTitle:"نماز کے ممنوع اوقات",
    forbiddenNote:"ان اوقات میں نماز پڑھنا ممنوع ہے (سوائے سورج گرہن کی نماز اور قضا فرض کے)۔",
    naflTitle:"نفل نماز کے اوقات",
    fastCal:"روزے کا کیلنڈر دیکھیں ←",
    quranTitle:"قرآن پاک",
    progress:"پیش رفت:",
    allSurahs:"تمام سورتیں",
    bookmarksTab:"🔖 بک مارکس",
    readTab:"✅ پڑھ لیا",
    backToList:"← سورتوں کی فہرست",
    listenAll:"▶️ سب سنیں",
    stopListen:"⏸️ بند کریں",
    goBtn:"جائیں",
    markRead:"✅ اس سورت کو پڑھا ہوا نشان زد کریں",
    markedRead:"✅ پڑھ لیا ✓",
    nextSurah:"اگلی سورت ←",
    nothingFound:"کچھ نہیں ملا۔",
    noBookmarks:"ابھی کوئی بک مارک نہیں۔ قرآن پڑھتے وقت 🔖 دبا کر بک مارک کریں۔",
    noReadYet:"ابھی کوئی سورت پڑھی ہوئی نشان زد نہیں۔ سورت پڑھ کر \"پڑھ لیا\" والے بٹن پر دبائیں۔",
    noDuas:"اس زمرے میں کوئی دعا نہیں۔",
    ayahNotFound:"آیت نہیں ملی",
    ayahs:"آیات",
    prayersUnit:"نمازیں",
    tasbihTitle:"ڈیجیٹل تسبیح",
    targetLabel:"ہدف:",
    todayTotal:"آج کا کل:",
    restartBtn:"↺ دوبارہ شروع کریں",
    changeTarget:"🎯 ہدف بدلیں",
    tasbihHint:"دائرے پر دبائیں تو گنتی بڑھے گی۔ ہر دبانے پر ہلکی لرزش ہوگی۔",
    todayCount:"آج کا حساب",
    duasTitle:"دعائیں اور اذکار",
    ruqyahTitle:"🛡️ رقیہ",
    ruqyahDesc:"آیت الکرسی، سورہ بقرہ کی آخری ۲ آیات، سورہ اخلاص، فلق اور ناس — پڑھیں اور سنیں۔",
    ruqyahOpen:"رقیہ کھولیں",
    backToDuas:"← دعائیں",
    qiblaTitle:"قبلے کی سمت",
    qiblaNote:"فون کو سیدھا رکھ کر آہستہ گھمائیں — سنہری سوئی قبلے کی طرف مڑے گی۔",
    useMyLoc:"📍 میری جگہ استعمال کریں",
    fastingTitle:"روزہ",
    sunnahTitle:"سنت روزوں کی یاد دہانی",
    hijriMonthTitle:"اس مہینے کی ہجری تاریخیں",
    profileTitle:"پروفائل",
    profileDesc:"آپ کا نام صرف آپ کے فون میں رہتا ہے — کسی سرور کو نہیں بھیجا جاتا۔",
    yourName:"آپ کا نام",
    saveBtn:"محفوظ کریں",
    clearBtn:"صاف کریں",
    settingsTitle:"ترتیبات",
    autoLocLabel:"📍 مقام خودکار معلوم کریں",
    autoLocDesc:"چالو ہو تو GPS سے آپ کا شہر خود بخود سیٹ ہو جائے گا (اجازت درکار)۔ بند ہو تو نیچے والا شہر استعمال ہوگا۔",
    detectNow:"📍 ابھی مقام معلوم کریں",
    cityLabel:"شہر",
    countryLabel:"ملک",
    methodLabel:"نماز کے حساب کا طریقہ",
    schoolLabel:"عصر کا مذہب",
    shafii:"شافعی (معیاری)",
    hanafi:"حنفی",
    langLabel:"زبان",
    themeLabel:"ڈارک تھیم (آسمانی تھیم)",
    azanLabel:"نماز کے وقت اذان",
    duroodLabel:"📿 فون کھولنے پر درود",
    duroodDesc:"چالو ہو تو فون کھولنے پر (یا ایپ کھولنے پر) درود شریف کی آواز بجے گی۔ بند ہو تو نہیں بجے گی۔",
    adhanLabel:"اذان کی آواز",
    reciterLabel:"قرآن کے قاری",
    notifLabel:"اطلاعات",
    dataPrivate:"تمام معلومات صرف آپ کے فون میں رہتی ہیں — کچھ بھی کسی سرور کو نہیں بھیجا جاتا۔",
    offsetsTitle:"اذان کا وقت آگے پیچھے کریں",
    offsetsDesc:"ہر نماز کی اذان نماز کے وقت سے پہلے یا بعد میں بجا سکتے ہیں — مثلاً فجر سے ۱۵ منٹ پہلے (تیاری کے لیے)، یا مغرب کے ۵ منٹ بعد۔",
    saveOffsets:"اوقات محفوظ کریں",
    aboutTitle:"ایپ کے بارے میں",
    aboutLine1:"My Deen v2.0 — مفت اسلامی ایپ۔ نماز کے اوقات: Aladhan API؛ قرآن: AlQuran Cloud۔ کوئی اشتہار نہیں۔",
    aboutLine2:"آپ کی دینی عبادت آسان بنانے کی چھوٹی سی کوشش۔",
    privacyBtn:"پرائیویسی پالیسی",
    backToSettings:"← ترتیبات",
    privacyTitle:"پرائیویسی پالیسی",
    langFirstTitle:"اپنی زبان چنیں",
    langFirstDesc:"ایپ کی زبان چنیں۔ ترتیبات سے کسی بھی وقت بدل سکتے ہیں۔",
    loading:"لوڈ ہو رہا ہے…",
    searchSurah:"سورت تلاش کریں…",
    saveDua:"🔖 محفوظ کریں",
    savedDua:"🔖 محفوظ ہو گیا ✓",
    loadingAyahs:"آیات لوڈ ہو رہی ہیں…",
    ayahPlaceholder:"آیت نمبر",
    ruqyahNote:"آیات قرآن سے لوڈ ہوں گی۔ تلاوت سننے کے لیے آڈیو بٹن دبائیں۔",},  ms: {
    nav_home:"Utama",
    nav_quran:"Al-Quran",
    nav_tasbih:"Tasbih",
    nav_duas:"Doa",
    nav_qibla:"Kiblat",
    nav_fasting:"Puasa",
    nav_settings:"Tetapan",
    nextPrayer:"Solat Seterusnya",
    prayersToday:"Waktu Solat Hari Ini",
    tracker:"Jejak Solat (Hari Ini)",
    windows:"Waktu Sunat & Makruh",
    fastTitle:"Sahur & Iftar",
    saved:"Disimpan ✓",
    offline:"Tiada internet — memaparkan data yang disimpan",
    loadErr:"Tidak dapat dimuat, cuba lagi",
    appTagline:"Solat • Al-Quran • Doa",
    myLocation:"Lokasi Saya",
    locAutoBtn:"📍 Tetapkan lokasi automatik dari peta",
    quranTracker:"Jejak Al-Quran",
    readQuran:"Baca Al-Quran →",
    last7:"7 hari lalu",
    forbiddenTitle:"Waktu Larangan Solat",
    forbiddenNote:"Solat dilarang pada waktu-waktu ini (kecuali solat gerhana dan qada fardu).",
    naflTitle:"Waktu Solat Sunat",
    fastCal:"Lihat Kalendar Puasa →",
    quranTitle:"Al-Quran",
    progress:"Kemajuan:",
    allSurahs:"Semua Surah",
    bookmarksTab:"🔖 Penanda",
    readTab:"✅ Selesai Dibaca",
    backToList:"← Senarai Surah",
    listenAll:"▶️ Dengar Semua",
    stopListen:"⏸️ Berhenti",
    goBtn:"Pergi",
    markRead:"✅ Tandakan surah ini sebagai sudah dibaca",
    markedRead:"✅ Selesai Dibaca ✓",
    nextSurah:"Surah Seterusnya →",
    nothingFound:"Tiada yang dijumpai.",
    noBookmarks:"Tiada penanda lagi. Ketik 🔖 semasa membaca Al-Quran untuk menanda.",
    noReadYet:"Tiada surah ditandakan sebagai sudah dibaca lagi. Selepas membaca surah, ketik butang \"Tandakan sudah dibaca\".",
    noDuas:"Tiada doa dalam kategori ini.",
    ayahNotFound:"Ayat tidak dijumpai",
    ayahs:"Ayat",
    prayersUnit:"solat",
    tasbihTitle:"Tasbih Digital",
    targetLabel:"Sasaran:",
    todayTotal:"Jumlah hari ini:",
    restartBtn:"↺ Mula semula",
    changeTarget:"🎯 Tukar sasaran",
    tasbihHint:"Ketik bulatan untuk mengira. Getaran ringan pada setiap ketikan.",
    todayCount:"Kiraan Hari Ini",
    duasTitle:"Doa & Zikir",
    ruqyahTitle:"🛡️ Ruqyah",
    ruqyahDesc:"Ayatul Kursi, 2 ayat terakhir Surah Al-Baqarah, Surah Al-Ikhlas, Al-Falaq dan An-Nas — baca dan dengar.",
    ruqyahOpen:"Buka Ruqyah",
    backToDuas:"← Doa",
    qiblaTitle:"Arah Kiblat",
    qiblaNote:"Pegang telefon secara mendatar dan pusing perlahan — jarum emas akan menunjuk ke arah Kiblat.",
    useMyLoc:"📍 Gunakan lokasi saya",
    fastingTitle:"Puasa",
    sunnahTitle:"Peringatan Puasa Sunat",
    hijriMonthTitle:"Tarikh Hijri Bulan Ini",
    profileTitle:"Profil",
    profileDesc:"Nama anda hanya kekal dalam telefon anda — ia tidak pernah dihantar ke mana-mana pelayan.",
    yourName:"Nama anda",
    saveBtn:"Simpan",
    clearBtn:"Padam",
    settingsTitle:"Tetapan",
    autoLocLabel:"📍 Kesan lokasi secara automatik",
    autoLocDesc:"Apabila dihidupkan, bandar anda ditetapkan automatik dari GPS (kebenaran diperlukan). Apabila dimatikan, bandar di bawah digunakan.",
    detectNow:"📍 Kesan lokasi sekarang",
    cityLabel:"Bandar",
    countryLabel:"Negara",
    methodLabel:"Kaedah pengiraan solat",
    schoolLabel:"Mazhab Asar",
    shafii:"Syafi'i (standard)",
    hanafi:"Hanafi",
    langLabel:"Bahasa",
    themeLabel:"Tema gelap (tema langit)",
    azanLabel:"Azan pada waktu solat",
    duroodLabel:"📿 Selawat apabila telefon dibuka",
    duroodDesc:"Apabila dihidupkan, audio selawat dimainkan apabila anda membuka telefon (atau membuka aplikasi). Ia tidak akan dimainkan apabila dimatikan.",
    adhanLabel:"Suara azan",
    reciterLabel:"Qari Al-Quran",
    notifLabel:"Notifikasi",
    dataPrivate:"Semua data hanya kekal dalam telefon anda — tiada apa yang dihantar ke mana-mana pelayan.",
    offsetsTitle:"Laraskan waktu azan lebih awal/lewat",
    offsetsDesc:"Anda boleh memainkan azan bagi setiap solat lebih awal atau lebih lewat daripada waktu solat — contohnya 15 minit sebelum Subuh (untuk bersiap), atau 5 minit selepas Maghrib.",
    saveOffsets:"Simpan waktu",
    aboutTitle:"Tentang Aplikasi",
    aboutLine1:"My Deen v2.0 — aplikasi Islam percuma. Waktu solat: Aladhan API; Al-Quran: AlQuran Cloud. Tiada iklan.",
    aboutLine2:"Usaha kecil untuk memudahkan ibadah anda.",
    privacyBtn:"Dasar Privasi",
    backToSettings:"← Tetapan",
    privacyTitle:"Dasar Privasi",
    langFirstTitle:"Pilih bahasa anda",
    langFirstDesc:"Pilih bahasa untuk aplikasi. Anda boleh menukarnya bila-bila masa dalam Tetapan.",
    loading:"Memuatkan…",
    searchSurah:"Cari surah…",
    saveDua:"🔖 Simpan",
    savedDua:"🔖 Disimpan ✓",
    loadingAyahs:"Memuatkan ayat…",
    ayahPlaceholder:"Nombor ayat",
    ruqyahNote:"Ayat akan dimuat dari Al-Quran. Ketik butang audio untuk mendengar bacaan.",},  id: {
    nav_home:"Beranda",
    nav_quran:"Al-Qur'an",
    nav_tasbih:"Tasbih",
    nav_duas:"Doa",
    nav_qibla:"Kiblat",
    nav_fasting:"Puasa",
    nav_settings:"Pengaturan",
    nextPrayer:"Sholat Berikutnya",
    prayersToday:"Waktu Sholat Hari Ini",
    tracker:"Pelacak Sholat (Hari Ini)",
    windows:"Waktu Sunnah & Makruh",
    fastTitle:"Sahur & Berbuka",
    saved:"Tersimpan ✓",
    offline:"Tidak ada internet — menampilkan data yang tersimpan",
    loadErr:"Tidak dapat memuat, coba lagi",
    appTagline:"Sholat • Al-Qur'an • Doa",
    myLocation:"Lokasi Saya",
    locAutoBtn:"📍 Atur lokasi otomatis dari peta",
    quranTracker:"Pelacak Al-Qur'an",
    readQuran:"Baca Al-Qur'an →",
    last7:"7 hari terakhir",
    forbiddenTitle:"Waktu Larangan Sholat",
    forbiddenNote:"Sholat dilarang pada waktu-waktu ini (kecuali sholat gerhana dan qada fardu).",
    naflTitle:"Waktu Sholat Sunnah",
    fastCal:"Lihat Kalender Puasa →",
    quranTitle:"Al-Qur'an",
    progress:"Kemajuan:",
    allSurahs:"Semua Surah",
    bookmarksTab:"🔖 Markah",
    readTab:"✅ Selesai Dibaca",
    backToList:"← Daftar Surah",
    listenAll:"▶️ Dengarkan Semua",
    stopListen:"⏸️ Berhenti",
    goBtn:"Pergi",
    markRead:"✅ Tandai surah ini sebagai sudah dibaca",
    markedRead:"✅ Selesai Dibaca ✓",
    nextSurah:"Surah Berikutnya →",
    nothingFound:"Tidak ada yang ditemukan.",
    noBookmarks:"Belum ada markah. Ketuk 🔖 saat membaca Al-Qur'an untuk menandai.",
    noReadYet:"Belum ada surah yang ditandai sudah dibaca. Setelah membaca surah, ketuk tombol \"Tandai sudah dibaca\".",
    noDuas:"Tidak ada doa dalam kategori ini.",
    ayahNotFound:"Ayat tidak ditemukan",
    ayahs:"Ayat",
    prayersUnit:"sholat",
    tasbihTitle:"Tasbih Digital",
    targetLabel:"Target:",
    todayTotal:"Total hari ini:",
    restartBtn:"↺ Mulai lagi",
    changeTarget:"🎯 Ubah target",
    tasbihHint:"Ketuk lingkaran untuk menghitung. Getaran ringan pada setiap ketukan.",
    todayCount:"Hitungan Hari Ini",
    duasTitle:"Doa & Zikir",
    ruqyahTitle:"🛡️ Ruqyah",
    ruqyahDesc:"Ayat Kursi, 2 ayat terakhir Surah Al-Baqarah, Surah Al-Ikhlas, Al-Falaq dan An-Nas — baca dan dengarkan.",
    ruqyahOpen:"Buka Ruqyah",
    backToDuas:"← Doa",
    qiblaTitle:"Arah Kiblat",
    qiblaNote:"Pegang ponsel mendatar dan putar perlahan — jarum emas akan menunjuk ke arah Kiblat.",
    useMyLoc:"📍 Gunakan lokasi saya",
    fastingTitle:"Puasa",
    sunnahTitle:"Pengingat Puasa Sunnah",
    hijriMonthTitle:"Tanggal Hijriah Bulan Ini",
    profileTitle:"Profil",
    profileDesc:"Nama Anda hanya tersimpan di ponsel Anda — tidak pernah dikirim ke server mana pun.",
    yourName:"Nama Anda",
    saveBtn:"Simpan",
    clearBtn:"Hapus",
    settingsTitle:"Pengaturan",
    autoLocLabel:"📍 Deteksi lokasi otomatis",
    autoLocDesc:"Jika aktif, kota Anda diatur otomatis dari GPS (perlu izin). Jika nonaktif, kota di bawah yang digunakan.",
    detectNow:"📍 Deteksi lokasi sekarang",
    cityLabel:"Kota",
    countryLabel:"Negara",
    methodLabel:"Metode perhitungan sholat",
    schoolLabel:"Mazhab Asar",
    shafii:"Syafi'i (standar)",
    hanafi:"Hanafi",
    langLabel:"Bahasa",
    themeLabel:"Tema gelap (tema langit)",
    azanLabel:"Azan pada waktu sholat",
    duroodLabel:"📿 Sholawat saat membuka ponsel",
    duroodDesc:"Jika aktif, audio sholawat diputar saat Anda membuka kunci ponsel (atau membuka aplikasi). Tidak akan diputar jika nonaktif.",
    adhanLabel:"Suara azan",
    reciterLabel:"Qari Al-Qur'an",
    notifLabel:"Notifikasi",
    dataPrivate:"Semua data hanya tersimpan di ponsel Anda — tidak ada yang dikirim ke server mana pun.",
    offsetsTitle:"Atur waktu azan lebih awal/terlambat",
    offsetsDesc:"Anda dapat memutar azan untuk setiap sholat lebih awal atau lebih lambat dari waktu sholat — misalnya 15 menit sebelum Subuh (untuk bersiap), atau 5 menit setelah Maghrib.",
    saveOffsets:"Simpan waktu",
    aboutTitle:"Tentang Aplikasi",
    aboutLine1:"My Deen v2.0 — aplikasi Islam gratis. Waktu sholat: Aladhan API; Al-Qur'an: AlQuran Cloud. Tanpa iklan.",
    aboutLine2:"Usaha kecil untuk memudahkan ibadah Anda.",
    privacyBtn:"Kebijakan Privasi",
    backToSettings:"← Pengaturan",
    privacyTitle:"Kebijakan Privasi",
    langFirstTitle:"Pilih bahasa Anda",
    langFirstDesc:"Pilih bahasa untuk aplikasi. Anda dapat mengubahnya kapan saja di Pengaturan.",
    loading:"Memuat…",
    searchSurah:"Cari surah…",
    saveDua:"🔖 Simpan",
    savedDua:"🔖 Tersimpan ✓",
    loadingAyahs:"Memuat ayat…",
    ayahPlaceholder:"Nomor ayat",
    ruqyahNote:"Ayat akan dimuat dari Al-Qur'an. Ketuk tombol audio untuk mendengarkan tilawah.",},  tr: {
    nav_home:"Ana Sayfa",
    nav_quran:"Kur'an",
    nav_tasbih:"Tesbih",
    nav_duas:"Dualar",
    nav_qibla:"Kıble",
    nav_fasting:"Oruç",
    nav_settings:"Ayarlar",
    nextPrayer:"Sonraki Namaz",
    prayersToday:"Bugünün Namaz Vakitleri",
    tracker:"Namaz Takibi (Bugün)",
    windows:"Nafile ve Mekruh Vakitler",
    fastTitle:"Sahur ve İftar",
    saved:"Kaydedildi ✓",
    offline:"İnternet yok — kaydedilmiş veriler gösteriliyor",
    loadErr:"Yüklenemedi, tekrar deneyin",
    appTagline:"Namaz • Kur'an • Dua",
    myLocation:"Konumum",
    locAutoBtn:"📍 Haritadan konumu otomatik ayarla",
    quranTracker:"Kur'an Takibi",
    readQuran:"Kur'an Oku →",
    last7:"Son 7 gün",
    forbiddenTitle:"Namazın Yasak Olduğu Vakitler",
    forbiddenNote:"Bu vakitlerde namaz kılmak yasaktır (güneş tutulması namazı ve kaza farzlar hariç).",
    naflTitle:"Nafile Namaz Vakitleri",
    fastCal:"Oruç Takvimini Gör →",
    quranTitle:"Kur'an-ı Kerim",
    progress:"İlerleme:",
    allSurahs:"Tüm Sureler",
    bookmarksTab:"🔖 Yer İmleri",
    readTab:"✅ Okundu",
    backToList:"← Sure Listesi",
    listenAll:"▶️ Tümünü Dinle",
    stopListen:"⏸️ Durdur",
    goBtn:"Git",
    markRead:"✅ Bu sureyi okundu olarak işaretle",
    markedRead:"✅ Okundu ✓",
    nextSurah:"Sonraki Sure →",
    nothingFound:"Bir şey bulunamadı.",
    noBookmarks:"Henüz yer imi yok. Kur'an okurken 🔖 simgesine dokunarak yer imi ekleyin.",
    noReadYet:"Henüz okundu olarak işaretlenmiş sure yok. Bir sureyi okuduktan sonra \"Okundu olarak işaretle\" düğmesine dokunun.",
    noDuas:"Bu kategoride dua yok.",
    ayahNotFound:"Ayet bulunamadı",
    ayahs:"Ayet",
    prayersUnit:"namaz",
    tasbihTitle:"Dijital Tesbih",
    targetLabel:"Hedef:",
    todayTotal:"Bugün toplam:",
    restartBtn:"↺ Yeniden başla",
    changeTarget:"🎯 Hedefi değiştir",
    tasbihHint:"Saymak için daireye dokunun. Her dokunuşta hafif bir titreşim olur.",
    todayCount:"Bugünkü Sayı",
    duasTitle:"Dualar ve Zikirler",
    ruqyahTitle:"🛡️ Rukye",
    ruqyahDesc:"Ayetel Kürsi, Bakara Suresi'nin son 2 ayeti, İhlas, Felak ve Nas sureleri — okuyun ve dinleyin.",
    ruqyahOpen:"Rukye'yi Aç",
    backToDuas:"← Dualar",
    qiblaTitle:"Kıble Yönü",
    qiblaNote:"Telefonu düz tutun ve yavaşça çevirin — altın ibre kıbleyi gösterecektir.",
    useMyLoc:"📍 Konumumu kullan",
    fastingTitle:"Oruç",
    sunnahTitle:"Sünnet Oruç Hatırlatmaları",
    hijriMonthTitle:"Bu Ayın Hicri Tarihleri",
    profileTitle:"Profil",
    profileDesc:"Adınız yalnızca telefonunuzda kalır — hiçbir sunucuya gönderilmez.",
    yourName:"Adınız",
    saveBtn:"Kaydet",
    clearBtn:"Temizle",
    settingsTitle:"Ayarlar",
    autoLocLabel:"📍 Konumu otomatik algıla",
    autoLocDesc:"Açıkken şehriniz GPS'ten otomatik olarak ayarlanır (izin gerekir). Kapalıyken aşağıdaki şehir kullanılır.",
    detectNow:"📍 Konumu şimdi algıla",
    cityLabel:"Şehir",
    countryLabel:"Ülke",
    methodLabel:"Namaz hesaplama yöntemi",
    schoolLabel:"İkindi mezhebi",
    shafii:"Şafii (standart)",
    hanafi:"Hanefi",
    langLabel:"Dil",
    themeLabel:"Koyu tema (gökyüzü teması)",
    azanLabel:"Namaz vaktinde ezan",
    duroodLabel:"📿 Telefon kilidi açılınca salavat",
    duroodDesc:"Açıkken, telefonunuzun kilidini açtığınızda (veya uygulamayı açtığınızda) salavat sesi çalınır. Kapalıyken çalınmaz.",
    adhanLabel:"Ezan sesi",
    reciterLabel:"Kur'an okuyucusu",
    notifLabel:"Bildirimler",
    dataPrivate:"Tüm veriler yalnızca telefonunuzda kalır — hiçbir şey hiçbir sunucuya gönderilmez.",
    offsetsTitle:"Ezan vaktini erkene/geçe al",
    offsetsDesc:"Her namaz için ezanı namaz vaktinden önce veya sonra çalabilirsiniz — örneğin sabah namazından 15 dakika önce (hazırlanmak için) veya akşam namazından 5 dakika sonra.",
    saveOffsets:"Vakitleri kaydet",
    aboutTitle:"Uygulama Hakkında",
    aboutLine1:"My Deen v2.0 — ücretsiz İslami uygulama. Namaz vakitleri: Aladhan API; Kur'an: AlQuran Cloud. Reklam yok.",
    aboutLine2:"İbadetinizi kolaylaştırmak için küçük bir çaba.",
    privacyBtn:"Gizlilik Politikası",
    backToSettings:"← Ayarlar",
    privacyTitle:"Gizlilik Politikası",
    langFirstTitle:"Dilinizi seçin",
    langFirstDesc:"Uygulama için dili seçin. Ayarlar'dan istediğiniz zaman değiştirebilirsiniz.",
    loading:"Yükleniyor…",
    searchSurah:"Sure ara…",
    saveDua:"🔖 Kaydet",
    savedDua:"🔖 Kaydedildi ✓",
    loadingAyahs:"Ayetler yükleniyor…",
    ayahPlaceholder:"Ayet numarası",
    ruqyahNote:"Ayetler Kur'an'dan yüklenecek. Tilaveti dinlemek için ses düğmesine dokunun.",},  fa: {
    nav_home:"خانه",
    nav_quran:"قرآن",
    nav_tasbih:"تسبیح",
    nav_duas:"دعاها",
    nav_qibla:"قبله",
    nav_fasting:"روزه",
    nav_settings:"تنظیمات",
    nextPrayer:"نماز بعدی",
    prayersToday:"اوقات نماز امروز",
    tracker:"پیگیری نماز (امروز)",
    windows:"اوقات مستحب و مکروه",
    fastTitle:"سحری و افطار",
    saved:"ذخیره شد ✓",
    offline:"اینترنت نیست — اطلاعات ذخیره‌شده نمایش داده می‌شود",
    loadErr:"بارگذاری نشد، دوباره تلاش کنید",
    appTagline:"نماز • قرآن • دعا",
    myLocation:"موقعیت من",
    locAutoBtn:"📍 تعیین خودکار موقعیت از نقشه",
    quranTracker:"پیگیری قرآن",
    readQuran:"قرآن بخوانید ←",
    last7:"۷ روز گذشته",
    forbiddenTitle:"اوقات ممنوعه نماز",
    forbiddenNote:"نماز در این اوقات ممنوع است (به‌جز نماز خورشیدگرفتگی و قضای واجب).",
    naflTitle:"اوقات نماز نافله",
    fastCal:"مشاهده تقویم روزه ←",
    quranTitle:"قرآن کریم",
    progress:"پیشرفت:",
    allSurahs:"همه سوره‌ها",
    bookmarksTab:"🔖 نشانک‌ها",
    readTab:"✅ خوانده شد",
    backToList:"← فهرست سوره‌ها",
    listenAll:"▶️ گوش دادن به همه",
    stopListen:"⏸️ توقف",
    goBtn:"برو",
    markRead:"✅ علامت‌گذاری این سوره به‌عنوان خوانده‌شده",
    markedRead:"✅ خوانده شد ✓",
    nextSurah:"سوره بعدی ←",
    nothingFound:"چیزی یافت نشد.",
    noBookmarks:"هنوز نشانکی نیست. هنگام خواندن قرآن روی 🔖 بزنید تا نشانک بگذارید.",
    noReadYet:"هنوز سوره‌ای به‌عنوان خوانده‌شده علامت نخورده است. پس از خواندن سوره، دکمه «خوانده شد» را بزنید.",
    noDuas:"در این بخش دعایی نیست.",
    ayahNotFound:"آیه یافت نشد",
    ayahs:"آیات",
    prayersUnit:"نماز",
    tasbihTitle:"تسبیح دیجیتال",
    targetLabel:"هدف:",
    todayTotal:"مجموع امروز:",
    restartBtn:"↺ شروع دوباره",
    changeTarget:"🎯 تغییر هدف",
    tasbihHint:"برای شمارش روی دایره بزنید. با هر ضربه لرزش خفیفی حس می‌شود.",
    todayCount:"شمارش امروز",
    duasTitle:"دعاها و اذکار",
    ruqyahTitle:"🛡️ رقیه",
    ruqyahDesc:"آیت‌الکرسی، دو آیه آخر سوره بقره، سوره‌های اخلاص، فلق و ناس — بخوانید و گوش دهید.",
    ruqyahOpen:"باز کردن رقیه",
    backToDuas:"← دعاها",
    qiblaTitle:"جهت قبله",
    qiblaNote:"گوشی را صاف نگه دارید و به‌آرامی بچرخانید — عقربه طلایی به سمت قبله می‌چرخد.",
    useMyLoc:"📍 استفاده از موقعیت من",
    fastingTitle:"روزه",
    sunnahTitle:"یادآوری روزه‌های سنت",
    hijriMonthTitle:"تاریخ‌های هجری این ماه",
    profileTitle:"پروفایل",
    profileDesc:"نام شما فقط در گوشی شما می‌ماند — به هیچ سروری فرستاده نمی‌شود.",
    yourName:"نام شما",
    saveBtn:"ذخیره",
    clearBtn:"پاک کردن",
    settingsTitle:"تنظیمات",
    autoLocLabel:"📍 تعیین خودکار موقعیت",
    autoLocDesc:"اگر روشن باشد، شهر شما به‌طور خودکار از GPS تعیین می‌شود (نیاز به اجازه دارد). اگر خاموش باشد، از شهر زیر استفاده می‌شود.",
    detectNow:"📍 تعیین موقعیت اکنون",
    cityLabel:"شهر",
    countryLabel:"کشور",
    methodLabel:"روش محاسبه نماز",
    schoolLabel:"مذهب عصر",
    shafii:"شافعی (استاندارد)",
    hanafi:"حنفی",
    langLabel:"زبان",
    themeLabel:"تم تیره (تم آسمان)",
    azanLabel:"اذان در وقت نماز",
    duroodLabel:"📿 درود هنگام باز کردن گوشی",
    duroodDesc:"اگر روشن باشد، هنگام باز کردن گوشی (یا باز کردن برنامه) صدای درود شریف پخش می‌شود. اگر خاموش باشد پخش نمی‌شود.",
    adhanLabel:"صدای اذان",
    reciterLabel:"قاری قرآن",
    notifLabel:"اعلان‌ها",
    dataPrivate:"همه اطلاعات فقط در گوشی شما می‌ماند — چیزی به هیچ سروری فرستاده نمی‌شود.",
    offsetsTitle:"اذان را زودتر یا دیرتر کنید",
    offsetsDesc:"می‌توانید اذان هر نماز را زودتر یا دیرتر از وقت نماز پخش کنید — مثلاً ۱۵ دقیقه پیش از فجر (برای آماده شدن)، یا ۵ دقیقه پس از مغرب.",
    saveOffsets:"ذخیره اوقات",
    aboutTitle:"درباره برنامه",
    aboutLine1:"My Deen v2.0 — برنامه اسلامی رایگان. اوقات نماز: Aladhan API؛ قرآن: AlQuran Cloud. بدون تبلیغات.",
    aboutLine2:"تلاشی کوچک برای آسان‌تر کردن عبادت شما.",
    privacyBtn:"سیاست حریم خصوصی",
    backToSettings:"← تنظیمات",
    privacyTitle:"سیاست حریم خصوصی",
    langFirstTitle:"زبان خود را انتخاب کنید",
    langFirstDesc:"زبان برنامه را انتخاب کنید. می‌توانید هر وقت از تنظیمات تغییر دهید.",
    loading:"در حال بارگذاری…",
    searchSurah:"جستجوی سوره…",
    saveDua:"🔖 ذخیره",
    savedDua:"🔖 ذخیره شد ✓",
    loadingAyahs:"در حال بارگذاری آیات…",
    ayahPlaceholder:"شماره آیه",
    ruqyahNote:"آیات از قرآن بارگذاری می‌شوند. برای شنیدن تلاوت دکمه صدا را بزنید.",},  fr: {
    nav_home:"Accueil",
    nav_quran:"Coran",
    nav_tasbih:"Tasbih",
    nav_duas:"Douas",
    nav_qibla:"Qibla",
    nav_fasting:"Jeûne",
    nav_settings:"Réglages",
    nextPrayer:"Prochaine Prière",
    prayersToday:"Horaires de Prière du Jour",
    tracker:"Suivi des Prières (Aujourd'hui)",
    windows:"Horaires Sunnah et Déconseillés",
    fastTitle:"Souhour et Iftar",
    saved:"Enregistré ✓",
    offline:"Pas d'internet — affichage des données enregistrées",
    loadErr:"Chargement impossible, réessayez",
    appTagline:"Prière • Coran • Douas",
    myLocation:"Ma Position",
    locAutoBtn:"📍 Définir la position automatiquement depuis la carte",
    quranTracker:"Suivi du Coran",
    readQuran:"Lire le Coran →",
    last7:"7 derniers jours",
    forbiddenTitle:"Horaires Interdits pour la Prière",
    forbiddenNote:"La prière est interdite à ces moments (sauf la prière de l'éclipse et les prières obligatoires à rattraper).",
    naflTitle:"Horaires des Prières Sunnah",
    fastCal:"Voir le Calendrier du Jeûne →",
    quranTitle:"Saint Coran",
    progress:"Progression :",
    allSurahs:"Toutes les Sourates",
    bookmarksTab:"🔖 Favoris",
    readTab:"✅ Lu",
    backToList:"← Liste des Sourates",
    listenAll:"▶️ Tout écouter",
    stopListen:"⏸️ Arrêter",
    goBtn:"Aller",
    markRead:"✅ Marquer cette sourate comme lue",
    markedRead:"✅ Lu ✓",
    nextSurah:"Sourate Suivante →",
    nothingFound:"Rien trouvé.",
    noBookmarks:"Aucun favori pour l'instant. Appuyez sur 🔖 pendant la lecture du Coran pour ajouter un favori.",
    noReadYet:"Aucune sourate marquée comme lue pour l'instant. Après avoir lu une sourate, appuyez sur le bouton « Marquer comme lu ».",
    noDuas:"Aucune doua dans cette catégorie.",
    ayahNotFound:"Verset introuvable",
    ayahs:"Versets",
    prayersUnit:"prières",
    tasbihTitle:"Tasbih Numérique",
    targetLabel:"Objectif :",
    todayTotal:"Total du jour :",
    restartBtn:"↺ Recommencer",
    changeTarget:"🎯 Changer l'objectif",
    tasbihHint:"Appuyez sur le cercle pour compter. Une légère vibration à chaque pression.",
    todayCount:"Compte du Jour",
    duasTitle:"Douas et Adhkar",
    ruqyahTitle:"🛡️ Rouqya",
    ruqyahDesc:"Ayat al-Kursi, les 2 derniers versets de la sourate Al-Baqarah, les sourates Al-Ikhlas, Al-Falaq et An-Nas — lisez et écoutez.",
    ruqyahOpen:"Ouvrir la Rouqya",
    backToDuas:"← Douas",
    qiblaTitle:"Direction de la Qibla",
    qiblaNote:"Tenez le téléphone à plat et tournez-le lentement — l'aiguille dorée pointera vers la Qibla.",
    useMyLoc:"📍 Utiliser ma position",
    fastingTitle:"Jeûne",
    sunnahTitle:"Rappels de Jeûne Sunnah",
    hijriMonthTitle:"Dates Hijri de ce Mois",
    profileTitle:"Profil",
    profileDesc:"Votre nom reste uniquement sur votre téléphone — il n'est jamais envoyé à un serveur.",
    yourName:"Votre nom",
    saveBtn:"Enregistrer",
    clearBtn:"Effacer",
    settingsTitle:"Réglages",
    autoLocLabel:"📍 Détecter la position automatiquement",
    autoLocDesc:"Si activé, votre ville est définie automatiquement à partir du GPS (autorisation requise). Si désactivé, la ville ci-dessous est utilisée.",
    detectNow:"📍 Détecter la position maintenant",
    cityLabel:"Ville",
    countryLabel:"Pays",
    methodLabel:"Méthode de calcul des prières",
    schoolLabel:"Madhhab du Asr",
    shafii:"Shafi'i (standard)",
    hanafi:"Hanafi",
    langLabel:"Langue",
    themeLabel:"Thème sombre (thème ciel)",
    azanLabel:"Adhan à l'heure de la prière",
    duroodLabel:"📿 Salawat au déverrouillage du téléphone",
    duroodDesc:"Si activé, l'audio du salawat est joué lorsque vous déverrouillez votre téléphone (ou ouvrez l'application). Il ne sera pas joué si désactivé.",
    adhanLabel:"Voix de l'adhan",
    reciterLabel:"Récitant du Coran",
    notifLabel:"Notifications",
    dataPrivate:"Toutes les données restent uniquement sur votre téléphone — rien n'est envoyé à un serveur.",
    offsetsTitle:"Avancer ou retarder l'heure de l'adhan",
    offsetsDesc:"Vous pouvez jouer l'adhan de chaque prière avant ou après l'heure de la prière — par exemple 15 minutes avant le Fajr (pour se préparer), ou 5 minutes après le Maghrib.",
    saveOffsets:"Enregistrer les horaires",
    aboutTitle:"À propos de l'application",
    aboutLine1:"My Deen v2.0 — application islamique gratuite. Horaires de prière : Aladhan API ; Coran : AlQuran Cloud. Aucune publicité.",
    aboutLine2:"Un petit effort pour faciliter votre pratique religieuse.",
    privacyBtn:"Politique de Confidentialité",
    backToSettings:"← Réglages",
    privacyTitle:"Politique de Confidentialité",
    langFirstTitle:"Choisissez votre langue",
    langFirstDesc:"Sélectionnez la langue de l'application. Vous pouvez la changer à tout moment dans les Réglages.",
    loading:"Chargement…",
    searchSurah:"Rechercher une sourate…",
    saveDua:"🔖 Enregistrer",
    savedDua:"🔖 Enregistré ✓",
    loadingAyahs:"Chargement des versets…",
    ayahPlaceholder:"Numéro du verset",
    ruqyahNote:"Les versets seront chargés depuis le Coran. Appuyez sur le bouton audio pour écouter la récitation.",},  hi: {
    nav_home:"होम",
    nav_quran:"क़ुरआन",
    nav_tasbih:"तस्बीह",
    nav_duas:"दुआएँ",
    nav_qibla:"क़िबला",
    nav_fasting:"रोज़ा",
    nav_settings:"सेटिंग्स",
    nextPrayer:"अगली नमाज़",
    prayersToday:"आज के नमाज़ के समय",
    tracker:"नमाज़ का हिसाब (आज)",
    windows:"नफ़्ल और मकरूह समय",
    fastTitle:"सहरी और इफ़्तार",
    saved:"सहेजा गया ✓",
    offline:"इंटरनेट नहीं — सहेजा गया डेटा दिखाया जा रहा है",
    loadErr:"लोड नहीं हुआ, फिर से कोशिश करें",
    appTagline:"नमाज़ • क़ुरआन • दुआएँ",
    myLocation:"मेरा स्थान",
    locAutoBtn:"📍 नक्शे से स्थान ऑटो सेट करें",
    quranTracker:"क़ुरआन ट्रैकर",
    readQuran:"क़ुरआन पढ़ें →",
    last7:"पिछले ७ दिन",
    forbiddenTitle:"नमाज़ के वर्जित समय",
    forbiddenNote:"इन समयों में नमाज़ पढ़ना वर्जित है (सूर्य ग्रहण की नमाज़ और क़ज़ा फ़र्ज़ को छोड़कर)।",
    naflTitle:"नफ़्ल नमाज़ के समय",
    fastCal:"रोज़े का कैलेंडर देखें →",
    quranTitle:"पवित्र क़ुरआन",
    progress:"प्रगति:",
    allSurahs:"सभी सूरह",
    bookmarksTab:"🔖 बुकमार्क",
    readTab:"✅ पढ़ लिया",
    backToList:"← सूरह सूची",
    listenAll:"▶️ सभी सुनें",
    stopListen:"⏸️ रोकें",
    goBtn:"जाएँ",
    markRead:"✅ इस सूरह को पढ़ा हुआ चिह्नित करें",
    markedRead:"✅ पढ़ लिया ✓",
    nextSurah:"अगली सूरह →",
    nothingFound:"कुछ नहीं मिला।",
    noBookmarks:"अभी कोई बुकमार्क नहीं। क़ुरआन पढ़ते समय 🔖 दबाकर बुकमार्क करें।",
    noReadYet:"अभी कोई सूरह पढ़ी हुई चिह्नित नहीं है। सूरह पढ़कर \"पढ़ लिया\" बटन दबाएँ।",
    noDuas:"इस श्रेणी में कोई दुआ नहीं है।",
    ayahNotFound:"आयत नहीं मिली",
    ayahs:"आयतें",
    prayersUnit:"नमाज़ें",
    tasbihTitle:"डिजिटल तस्बीह",
    targetLabel:"लक्ष्य:",
    todayTotal:"आज का कुल:",
    restartBtn:"↺ फिर से शुरू करें",
    changeTarget:"🎯 लक्ष्य बदलें",
    tasbihHint:"गिनने के लिए वृत्त पर दबाएँ। हर दबाव पर हल्का कंपन होगा।",
    todayCount:"आज की गिनती",
    duasTitle:"दुआएँ और अज़कार",
    ruqyahTitle:"🛡️ रुक़या",
    ruqyahDesc:"आयतुल कुर्सी, सूरह बक़रह की आख़िरी २ आयतें, सूरह इख़्लास, फ़लक़ और नास — पढ़ें और सुनें।",
    ruqyahOpen:"रुक़या खोलें",
    backToDuas:"← दुआएँ",
    qiblaTitle:"क़िबला की दिशा",
    qiblaNote:"फ़ोन को समतल रखकर धीरे-धीरे घुमाएँ — सुनहरी सुई क़िबला की ओर मुड़ेगी।",
    useMyLoc:"📍 मेरा स्थान उपयोग करें",
    fastingTitle:"रोज़ा",
    sunnahTitle:"सुन्नत रोज़ों की याद दिलाना",
    hijriMonthTitle:"इस महीने की हिजरी तारीखें",
    profileTitle:"प्रोफ़ाइल",
    profileDesc:"आपका नाम केवल आपके फ़ोन में रहता है — यह कभी किसी सर्वर को नहीं भेजा जाता।",
    yourName:"आपका नाम",
    saveBtn:"सहेजें",
    clearBtn:"साफ़ करें",
    settingsTitle:"सेटिंग्स",
    autoLocLabel:"📍 स्थान स्वचालित रूप से पता करें",
    autoLocDesc:"चालू होने पर, आपका शहर GPS से स्वचालित रूप से सेट होगा (अनुमति आवश्यक)। बंद होने पर, नीचे वाला शहर उपयोग होगा।",
    detectNow:"📍 अभी स्थान पता करें",
    cityLabel:"शहर",
    countryLabel:"देश",
    methodLabel:"नमाज़ की गणना की विधि",
    schoolLabel:"असर का मज़हब",
    shafii:"शाफ़ई (मानक)",
    hanafi:"हनफ़ी",
    langLabel:"भाषा",
    themeLabel:"डार्क थीम (आकाश थीम)",
    azanLabel:"नमाज़ के समय अज़ान",
    duroodLabel:"📿 फ़ोन अनलॉक करने पर दुरूद",
    duroodDesc:"चालू होने पर, फ़ोन अनलॉक करने पर (या ऐप खोलने पर) दुरूद शरीफ़ का ऑडियो बजेगा। बंद होने पर नहीं बजेगा।",
    adhanLabel:"अज़ान की आवाज़",
    reciterLabel:"क़ुरआन के क़ारी",
    notifLabel:"सूचनाएँ",
    dataPrivate:"सभी डेटा केवल आपके फ़ोन में रहता है — कुछ भी किसी सर्वर को नहीं भेजा जाता।",
    offsetsTitle:"अज़ान का समय पहले या बाद में करें",
    offsetsDesc:"आप हर नमाज़ की अज़ान नमाज़ के समय से पहले या बाद में बजा सकते हैं — जैसे फ़ज्र से १५ मिनट पहले (तैयारी के लिए), या मग़रिब के ५ मिनट बाद।",
    saveOffsets:"समय सहेजें",
    aboutTitle:"ऐप के बारे में",
    aboutLine1:"My Deen v2.0 — मुफ़्त इस्लामिक ऐप। नमाज़ के समय: Aladhan API; क़ुरआन: AlQuran Cloud। कोई विज्ञापन नहीं।",
    aboutLine2:"आपकी धार्मिक प्रथा को आसान बनाने का एक छोटा प्रयास।",
    privacyBtn:"गोपनीयता नीति",
    backToSettings:"← सेटिंग्स",
    privacyTitle:"गोपनीयता नीति",
    langFirstTitle:"अपनी भाषा चुनें",
    langFirstDesc:"ऐप के लिए भाषा चुनें। आप इसे सेटिंग्स से कभी भी बदल सकते हैं।",
    loading:"लोड हो रहा है…",
    searchSurah:"सूरह खोजें…",
    saveDua:"🔖 सहेजें",
    savedDua:"🔖 सहेजा गया ✓",
    loadingAyahs:"आयतें लोड हो रही हैं…",
    ayahPlaceholder:"आयत संख्या",
    ruqyahNote:"आयतें क़ुरआन से लोड होंगी। तिलावत सुनने के लिए ऑडियो बटन दबाएँ।",},  ps: {
    nav_home:"کور",
    nav_quran:"قرآن",
    nav_tasbih:"تسبېح",
    nav_duas:"دعاوې",
    nav_qibla:"قبله",
    nav_fasting:"روژه",
    nav_settings:"ترتیبات",
    nextPrayer:"راتلونکی لمونځ",
    prayersToday:"د نن ورځې د لمانځه وختونه",
    tracker:"د لمانځه حساب (نن)",
    windows:"نفلي او مکروه وختونه",
    fastTitle:"سحري او روژه مات",
    saved:"خوندي شو ✓",
    offline:"انټرنیټ نشته — خوندي شوي معلومات ښودل کېږي",
    loadErr:"لوډ نه شو، بیا هڅه وکړئ",
    appTagline:"لمونځ • قرآن • دعاوې",
    myLocation:"زما ځای",
    locAutoBtn:"📍 له نقشې څخه ځای په اتومات ډول وټاکئ",
    quranTracker:"د قرآن تعقیب",
    readQuran:"قرآن ولولئ ←",
    last7:"تېرې ۷ ورځې",
    forbiddenTitle:"د لمانځه منع شوي وختونه",
    naflTitle:"د نفلي لمانځه وختونه",
    fastCal:"د روژې کلیزه وګورئ ←",
    quranTitle:"قرآن کریم",
    progress:"پرمختګ:",
    allSurahs:"ټول سورتونه",
    bookmarksTab:"🔖 نښې",
    readTab:"✅ ولوستل شو",
    backToList:"← د سورتونو لیست",
    listenAll:"▶️ ټول واورئ",
    stopListen:"⏸️ ودرول",
    goBtn:"لاړ شئ",
    markRead:"✅ دا سورت د لوستل شوي په توګه ونښلوئ",
    markedRead:"✅ ولوستل شو ✓",
    nextSurah:"راتلونکی سورت ←",
    nothingFound:"څه ونه موندل شول.",
    noBookmarks:"تر اوسه هېڅ نښه نشته. د قرآن لوستلو پر مهال 🔖 کېکاږئ.",
    noReadYet:"تر اوسه هېڅ سورت د لوستل شوي په توګه نه دی نښلول شوی.",
    noDuas:"په دې برخه کې هېڅ دعا نشته.",
    ayahNotFound:"آیت ونه موندل شو",
    ayahs:"آیتونه",
    prayersUnit:"لمونځونه",
    tasbihTitle:"ډیجیټل تسبېح",
    targetLabel:"هدف:",
    todayTotal:"د نن ټولټال:",
    restartBtn:"↺ له سره پیل کړئ",
    changeTarget:"🎯 هدف بدل کړئ",
    todayCount:"د نن حساب",
    duasTitle:"دعاوې او اذکار",
    ruqyahTitle:"🛡️ رقیه",
    ruqyahOpen:"رقیه پرانیستئ",
    backToDuas:"← دعاوې",
    qiblaTitle:"د قبلې لور",
    useMyLoc:"📍 زما ځای وکاروئ",
    fastingTitle:"روژه",
    sunnahTitle:"د سنت روژو یادونه",
    hijriMonthTitle:"د دې میاشتې هجري نېټې",
    profileTitle:"پروفایل",
    yourName:"ستاسو نوم",
    saveBtn:"خوندي کړئ",
    clearBtn:"پاک کړئ",
    settingsTitle:"ترتیبات",
    autoLocLabel:"📍 ځای په اتومات ډول معلوم کړئ",
    detectNow:"📍 اوس ځای معلوم کړئ",
    cityLabel:"ښار",
    countryLabel:"هېواد",
    methodLabel:"د لمانځه د حساب طریقه",
    schoolLabel:"د مازیګر مذهب",
    shafii:"شافعي (معیاري)",
    hanafi:"حنفي",
    langLabel:"ژبه",
    themeLabel:"تیاره تم (د اسمان تم)",
    azanLabel:"د لمانځه په وخت اذان",
    duroodLabel:"📿 د تلیفون خلاصولو پر درود",
    adhanLabel:"د اذان غږ",
    reciterLabel:"د قرآن قاري",
    notifLabel:"خبرتیاوې",
    offsetsTitle:"اذان مخکې یا وروسته کړئ",
    saveOffsets:"وختونه خوندي کړئ",
    aboutTitle:"د اپ په اړه",
    privacyBtn:"د محرمیت تګلاره",
    backToSettings:"← ترتیبات",
    privacyTitle:"د محرمیت تګلاره",
    langFirstTitle:"خپله ژبه وټاکئ",
    langFirstDesc:"د اپ ژبه وټاکئ. له ترتیباتو څخه هر وخت بدلولی شئ.",
    loading:"لوډېږي…",
    searchSurah:"سورت ولټوئ…",
    saveDua:"🔖 خوندي کړئ",
    savedDua:"🔖 خوندي شو ✓",
    loadingAyahs:"آیتونه لوډېږي…",
    ayahPlaceholder:"د آیت شمېره",},  ha: {
    nav_home:"Gida",
    nav_quran:"Alkur'ani",
    nav_tasbih:"Tasbihi",
    nav_duas:"Addu'o'i",
    nav_qibla:"Alƙibla",
    nav_fasting:"Azumi",
    nav_settings:"Saituna",
    nextPrayer:"Sallah ta Gaba",
    prayersToday:"Lokutan Sallah na Yau",
    tracker:"Bin Sallah (Yau)",
    windows:"Lokutan Nafila da Makaruhi",
    fastTitle:"Sahur da Buda Baki",
    saved:"An adana ✓",
    offline:"Babu intanet — ana nuna bayanan da aka adana",
    loadErr:"Ba a iya lodawa, sake gwadawa",
    appTagline:"Sallah • Alkur'ani • Addu'o'i",
    myLocation:"Wurina",
    locAutoBtn:"📍 Saita wuri ta atomatik daga taswira",
    quranTracker:"Bin Alkur'ani",
    readQuran:"Karanta Alkur'ani →",
    last7:"Kwanaki 7 da suka wuce",
    forbiddenTitle:"Lokutan da An Hana Sallah",
    naflTitle:"Lokutan Sallah Nafila",
    fastCal:"Duba Kalandar Azumi →",
    quranTitle:"Alkur'ani Mai Tsarki",
    progress:"Ci gaba:",
    allSurahs:"Dukkan Surori",
    bookmarksTab:"🔖 Alamu",
    readTab:"✅ An Karanta",
    backToList:"← Jerin Surori",
    listenAll:"▶️ Saurari Duk",
    stopListen:"⏸️ Dakata",
    goBtn:"Tafi",
    markRead:"✅ Alama wannan sura a matsayin an karanta",
    markedRead:"✅ An Karanta ✓",
    nextSurah:"Sura ta Gaba →",
    nothingFound:"Ba a sami komai ba.",
    noBookmarks:"Babu alamu tukuna. Danna 🔖 yayin karatun Alkur'ani don yin alama.",
    noReadYet:"Babu sura da aka alama a matsayin an karanta tukuna.",
    noDuas:"Babu addu'a a wannan rukuni.",
    ayahNotFound:"Ba a sami ayar ba",
    ayahs:"Ayoyi",
    prayersUnit:"salloli",
    tasbihTitle:"Tasbihi na Dijital",
    targetLabel:"Manufa:",
    todayTotal:"Jimlar yau:",
    restartBtn:"↺ Fara daga farko",
    changeTarget:"🎯 Canja manufa",
    tasbihHint:"Danna da'irar don ƙirgawa. Girgiza mai sauƙi a kowane dannawa.",
    todayCount:"Ƙidaya ta Yau",
    duasTitle:"Addu'o'i da Azkar",
    ruqyahTitle:"🛡️ Ruƙya",
    ruqyahDesc:"Ayatul Kursi, ayoyi 2 na ƙarshe na Suratul Baƙara, Suratul Iƙlas, Falaƙ da Nas — karanta kuma saurara.",
    ruqyahOpen:"Buɗe Ruƙya",
    backToDuas:"← Addu'o'i",
    qiblaTitle:"Hanyar Alƙibla",
    qiblaNote:"Riƙe wayar a kwance ka juya ta a hankali — allurar zinariya za ta nuna zuwa Alƙibla.",
    useMyLoc:"📍 Yi amfani da wurina",
    fastingTitle:"Azumi",
    sunnahTitle:"Tunatarwar Azumin Sunnah",
    hijriMonthTitle:"Kwanakin Hijira na Wannan Wata",
    profileTitle:"Bayanan Mutum",
    yourName:"Sunanka",
    saveBtn:"Ajiye",
    clearBtn:"Share",
    settingsTitle:"Saituna",
    autoLocLabel:"📍 Gano wuri ta atomatik",
    detectNow:"📍 Gano wuri yanzu",
    cityLabel:"Gari",
    countryLabel:"Ƙasa",
    methodLabel:"Hanyar lissafin sallah",
    schoolLabel:"Mazhabin La'asar",
    shafii:"Shafi'i (na al'ada)",
    hanafi:"Hanafi",
    langLabel:"Harshe",
    themeLabel:"Jigon duhu (jigon sama)",
    azanLabel:"Kiran sallah a lokacin sallah",
    duroodLabel:"📿 Salati lokacin buɗe waya",
    adhanLabel:"Muryar kiran sallah",
    reciterLabel:"Mai karatun Alkur'ani",
    notifLabel:"Sanarwa",
    offsetsTitle:"Canja lokacin kiran sallah",
    saveOffsets:"Ajiye lokuta",
    aboutTitle:"Game da App",
    privacyBtn:"Manufar Sirri",
    backToSettings:"← Saituna",
    privacyTitle:"Manufar Sirri",
    langFirstTitle:"Zaɓi harshenka",
    langFirstDesc:"Zaɓi harshen app. Za ka iya canza shi a kowane lokaci a Saituna.",
    loading:"Ana lodawa…",
    searchSurah:"Nemi sura…",
    saveDua:"🔖 Ajiye",
    savedDua:"🔖 An adana ✓",
    loadingAyahs:"Ana lodin ayoyi…",
    ayahPlaceholder:"Lambar aya",},  sw: {
    nav_home:"Nyumbani",
    nav_quran:"Qur'an",
    nav_tasbih:"Tasbihi",
    nav_duas:"Dua",
    nav_qibla:"Kibla",
    nav_fasting:"Saumu",
    nav_settings:"Mipangilio",
    nextPrayer:"Sala ya Inayofuata",
    prayersToday:"Nyakat za Sala za Leo",
    tracker:"Kifuatiliaji cha Sala (Leo)",
    windows:"Nyakat za Sunna na Makruh",
    fastTitle:"Daku na Futari",
    saved:"Imehifadhiwa ✓",
    offline:"Hakuna intaneti — inaonyesha data iliyohifadhiwa",
    loadErr:"Imeshindwa kupakia, jaribu tena",
    appTagline:"Sala • Qur'an • Dua",
    myLocation:"Mahali Pangu",
    locAutoBtn:"📍 Weka mahali kiotomatiki kutoka ramani",
    quranTracker:"Kifuatiliaji cha Qur'an",
    readQuran:"Soma Qur'an →",
    last7:"Siku 7 zilizopita",
    forbiddenTitle:"Nyakat Zilizokatazwa kwa Sala",
    forbiddenNote:"Sala imekatazwa katika nyakati hizi (isipokuwa sala ya kupatwa na sala za faradhi zilizokosa).",
    naflTitle:"Nyakat za Sala za Sunna",
    fastCal:"Tazama Kalenda ya Saumu →",
    quranTitle:"Qur'an Tukufu",
    progress:"Maendeleo:",
    allSurahs:"Sura Zote",
    bookmarksTab:"🔖 Alamisho",
    readTab:"✅ Imesomwa",
    backToList:"← Orodha ya Sura",
    listenAll:"▶️ Sikiliza Zote",
    stopListen:"⏸️ Simamisha",
    goBtn:"Nenda",
    markRead:"✅ Weka sura hii kama imesomwa",
    markedRead:"✅ Imesomwa ✓",
    nextSurah:"Sura Inayofuata →",
    nothingFound:"Hakuna kilichopatikana.",
    noBookmarks:"Hakuna alamisho bado. Gusa 🔖 unaposoma Qur'an ili kuweka alamisho.",
    noReadYet:"Hakuna sura iliyowekwa kama imesomwa bado. Baada ya kusoma sura, gusa kitufe \"Weka kama imesomwa\".",
    noDuas:"Hakuna dua katika kategoria hii.",
    ayahNotFound:"Aya haikupatikana",
    ayahs:"Aya",
    prayersUnit:"sala",
    tasbihTitle:"Tasbihi ya Kidijitali",
    targetLabel:"Lengo:",
    todayTotal:"Jumla ya leo:",
    restartBtn:"↺ Anza tena",
    changeTarget:"🎯 Badili lengo",
    tasbihHint:"Gusa duara ili kuhesabu. Mtetemo mwepesi kwa kila mguso.",
    todayCount:"Hesabu ya Leo",
    duasTitle:"Dua na Adhkar",
    ruqyahTitle:"🛡️ Ruqyah",
    ruqyahDesc:"Ayatul Kursi, aya 2 za mwisho za Surah Al-Baqarah, Surah Al-Ikhlas, Al-Falaq na An-Nas — soma na sikiliza.",
    ruqyahOpen:"Fungua Ruqyah",
    backToDuas:"← Dua",
    qiblaTitle:"Mwelekeo wa Kibla",
    qiblaNote:"Shikilia simu gorofa na igeuze polepole — sindano ya dhahabu itaelekea Kibla.",
    useMyLoc:"📍 Tumia mahali pangu",
    fastingTitle:"Saumu",
    sunnahTitle:"Vikumbusho vya Saumu ya Sunna",
    hijriMonthTitle:"Tarehe za Hijria za Mwezi Huu",
    profileTitle:"Wasifu",
    profileDesc:"Jina lako linabaki kwenye simu yako tu — halitumwi kamwe kwa seva yoyote.",
    yourName:"Jina lako",
    saveBtn:"Hifadhi",
    clearBtn:"Futa",
    settingsTitle:"Mipangilio",
    autoLocLabel:"📍 Tambua mahali kiotomatiki",
    autoLocDesc:"Ikiwashwa, jiji lako litawekwa kiotomatiki kutoka GPS (ruhusa inahitajika). Ikizimwa, jiji lililo hapa chini litatumika.",
    detectNow:"📍 Tambua mahali sasa",
    cityLabel:"Jiji",
    countryLabel:"Nchi",
    methodLabel:"Njia ya kuhesabu sala",
    schoolLabel:"Madhehebu ya Alasiri",
    shafii:"Shafi'i (kawaida)",
    hanafi:"Hanafi",
    langLabel:"Lugha",
    themeLabel:"Mandhari meusi (mandhari ya anga)",
    azanLabel:"Adhana wakati wa sala",
    duroodLabel:"📿 Durood simu inapofunguliwa",
    duroodDesc:"Ikiwashwa, sauti ya Durood itachezwa unapofungua simu yako (au kufungua programu). Haitachezwa ikiwa imezimwa.",
    adhanLabel:"Sauti ya adhana",
    reciterLabel:"Msomaji wa Qur'an",
    notifLabel:"Arifa",
    dataPrivate:"Data zote zinabaki kwenye simu yako tu — hakuna kinachotumwa kwa seva yoyote.",
    offsetsTitle:"Rekebisha wakati wa adhana mapema/baadaye",
    offsetsDesc:"Unaweza kucheza adhana kwa kila sala mapema au baadaye kuliko wakati wa sala — kwa mfano dakika 15 kabla ya Alfajiri (kujiandaa), au dakika 5 baada ya Magharibi.",
    saveOffsets:"Hifadhi nyakati",
    aboutTitle:"Kuhusu Programu",
    aboutLine1:"My Deen v2.0 — programu ya Kiislamu ya bure. Nyakat za sala: Aladhan API; Qur'an: AlQuran Cloud. Hakuna matangazo.",
    aboutLine2:"Juhudi ndogo ya kurahisisha ibada yako.",
    privacyBtn:"Sera ya Faragha",
    backToSettings:"← Mipangilio",
    privacyTitle:"Sera ya Faragha",
    langFirstTitle:"Chagua lugha yako",
    langFirstDesc:"Chagua lugha ya programu. Unaweza kuibadilisha wakati wowote katika Mipangilio.",
    loading:"Inapakia…",
    searchSurah:"Tafuta sura…",
    saveDua:"🔖 Hifadhi",
    savedDua:"🔖 Imehifadhiwa ✓",
    loadingAyahs:"Inapakia aya…",
    ayahPlaceholder:"Nambari ya aya",},  ru: {
    nav_home:"Главная",
    nav_quran:"Коран",
    nav_tasbih:"Тасбих",
    nav_duas:"Дуа",
    nav_qibla:"Кибла",
    nav_fasting:"Пост",
    nav_settings:"Настройки",
    nextPrayer:"Следующий намаз",
    prayersToday:"Время намазов на сегодня",
    tracker:"Трекер намазов (сегодня)",
    windows:"Время сунны и макрух",
    fastTitle:"Сухур и ифтар",
    saved:"Сохранено ✓",
    offline:"Нет интернета — показаны сохранённые данные",
    loadErr:"Не удалось загрузить, попробуйте снова",
    appTagline:"Намаз • Коран • Дуа",
    myLocation:"Моё местоположение",
    locAutoBtn:"📍 Определить местоположение по карте",
    quranTracker:"Трекер Корана",
    readQuran:"Читать Коран →",
    last7:"Последние 7 дней",
    forbiddenTitle:"Запретное время для намаза",
    forbiddenNote:"В это время намаз запрещён (исключение: намаз при затмении и пропущенные обязательные намазы).",
    naflTitle:"Время добровольных намазов",
    fastCal:"Календарь поста →",
    quranTitle:"Священный Коран",
    progress:"Прогресс:",
    allSurahs:"Все суры",
    bookmarksTab:"🔖 Закладки",
    readTab:"✅ Прочитано",
    backToList:"← Список сур",
    listenAll:"▶️ Слушать всё",
    stopListen:"⏸️ Остановить",
    goBtn:"Перейти",
    markRead:"✅ Отметить суру как прочитанную",
    markedRead:"✅ Прочитано ✓",
    nextSurah:"Следующая сура →",
    nothingFound:"Ничего не найдено.",
    noBookmarks:"Закладок пока нет. Нажмите 🔖 во время чтения Корана, чтобы добавить закладку.",
    noReadYet:"Пока ни одна сура не отмечена прочитанной. Прочитав суру, нажмите кнопку «Отметить прочитанной».",
    noDuas:"В этой категории нет дуа.",
    ayahNotFound:"Аят не найден",
    ayahs:"Аяты",
    prayersUnit:"намазов",
    tasbihTitle:"Цифровой тасбих",
    targetLabel:"Цель:",
    todayTotal:"Итого за сегодня:",
    restartBtn:"↺ Начать заново",
    changeTarget:"🎯 Изменить цель",
    tasbihHint:"Нажимайте на круг для счёта. Лёгкая вибрация при каждом нажатии.",
    todayCount:"Счёт за сегодня",
    duasTitle:"Дуа и азкары",
    ruqyahTitle:"🛡️ Рукъя",
    ruqyahDesc:"Аятуль-Курси, последние 2 аята суры «Аль-Бакара», суры «Аль-Ихлас», «Аль-Фаляк» и «Ан-Нас» — читайте и слушайте.",
    ruqyahOpen:"Открыть рукъю",
    backToDuas:"← Дуа",
    qiblaTitle:"Направление киблы",
    qiblaNote:"Держите телефон горизонтально и медленно поворачивайте — золотая стрелка укажет на киблу.",
    useMyLoc:"📍 Использовать моё местоположение",
    fastingTitle:"Пост",
    sunnahTitle:"Напоминания о сунна-постах",
    hijriMonthTitle:"Даты хиджры в этом месяце",
    profileTitle:"Профиль",
    profileDesc:"Ваше имя хранится только на вашем телефоне — оно никогда не отправляется на сервер.",
    yourName:"Ваше имя",
    saveBtn:"Сохранить",
    clearBtn:"Очистить",
    settingsTitle:"Настройки",
    autoLocLabel:"📍 Определять местоположение автоматически",
    autoLocDesc:"Если включено, город определяется автоматически по GPS (нужно разрешение). Если выключено, используется город ниже.",
    detectNow:"📍 Определить местоположение",
    cityLabel:"Город",
    countryLabel:"Страна",
    methodLabel:"Метод расчёта намаза",
    schoolLabel:"Мазхаб асра",
    shafii:"Шафии (стандарт)",
    hanafi:"Ханафи",
    langLabel:"Язык",
    themeLabel:"Тёмная тема (тема неба)",
    azanLabel:"Азан во время намаза",
    duroodLabel:"📿 Дуруд при разблокировке телефона",
    duroodDesc:"Если включено, при разблокировке телефона (или открытии приложения) играет дуруд. Если выключено — не играет.",
    adhanLabel:"Голос азана",
    reciterLabel:"Чтец Корана",
    notifLabel:"Уведомления",
    dataPrivate:"Все данные хранятся только на вашем телефоне — ничего не отправляется на сервер.",
    offsetsTitle:"Сдвинуть время азана раньше/позже",
    offsetsDesc:"Можно включать азан для каждого намаза раньше или позже времени намаза — например, за 15 минут до фаджра (чтобы подготовиться) или через 5 минут после магриба.",
    saveOffsets:"Сохранить время",
    aboutTitle:"О приложении",
    aboutLine1:"My Deen v2.0 — бесплатное исламское приложение. Время намазов: Aladhan API; Коран: AlQuran Cloud. Без рекламы.",
    aboutLine2:"Небольшое усилие, чтобы облегчить вашу религиозную практику.",
    privacyBtn:"Политика конфиденциальности",
    backToSettings:"← Настройки",
    privacyTitle:"Политика конфиденциальности",
    langFirstTitle:"Выберите язык",
    langFirstDesc:"Выберите язык приложения. Его можно изменить в любое время в настройках.",
    loading:"Загрузка…",
    searchSurah:"Найти суру…",
    saveDua:"🔖 Сохранить",
    savedDua:"🔖 Сохранено ✓",
    loadingAyahs:"Загрузка аятов…",
    ayahPlaceholder:"Номер аята",
    ruqyahNote:"Аяты будут загружены из Корана. Нажмите кнопку аудио, чтобы послушать чтение.",},  es: {
    nav_home:"Inicio",
    nav_quran:"Corán",
    nav_tasbih:"Tasbih",
    nav_duas:"Duas",
    nav_qibla:"Qibla",
    nav_fasting:"Ayuno",
    nav_settings:"Ajustes",
    nextPrayer:"Próxima Oración",
    prayersToday:"Horarios de Oración de Hoy",
    tracker:"Seguimiento de Oraciones (Hoy)",
    windows:"Horarios Sunna y Makruh",
    fastTitle:"Suhur e Iftar",
    saved:"Guardado ✓",
    offline:"Sin internet — mostrando datos guardados",
    loadErr:"No se pudo cargar, inténtalo de nuevo",
    appTagline:"Oración • Corán • Duas",
    myLocation:"Mi Ubicación",
    locAutoBtn:"📍 Establecer ubicación automática desde el mapa",
    quranTracker:"Seguimiento del Corán",
    readQuran:"Leer el Corán →",
    last7:"Últimos 7 días",
    forbiddenTitle:"Horarios Prohibidos para la Oración",
    forbiddenNote:"La oración está prohibida en estos horarios (excepción: la oración del eclipse y las oraciones obligatorias perdidas).",
    naflTitle:"Horarios de Oraciones Voluntarias",
    fastCal:"Ver Calendario de Ayuno →",
    quranTitle:"Sagrado Corán",
    progress:"Progreso:",
    allSurahs:"Todas las Suras",
    bookmarksTab:"🔖 Marcadores",
    readTab:"✅ Leído",
    backToList:"← Lista de Suras",
    listenAll:"▶️ Escuchar Todo",
    stopListen:"⏸️ Detener",
    goBtn:"Ir",
    markRead:"✅ Marcar esta sura como leída",
    markedRead:"✅ Leído ✓",
    nextSurah:"Siguiente Sura →",
    nothingFound:"No se encontró nada.",
    noBookmarks:"Aún no hay marcadores. Toca 🔖 mientras lees el Corán para marcar.",
    noReadYet:"Aún no hay suras marcadas como leídas. Después de leer una sura, toca el botón «Marcar como leída».",
    noDuas:"No hay duas en esta categoría.",
    ayahNotFound:"Aya no encontrada",
    ayahs:"Aleyas",
    prayersUnit:"oraciones",
    tasbihTitle:"Tasbih Digital",
    targetLabel:"Meta:",
    todayTotal:"Total de hoy:",
    restartBtn:"↺ Empezar de nuevo",
    changeTarget:"🎯 Cambiar meta",
    tasbihHint:"Toca el círculo para contar. Una vibración leve en cada toque.",
    todayCount:"Cuenta de Hoy",
    duasTitle:"Duas y Adhkar",
    ruqyahTitle:"🛡️ Ruqyah",
    ruqyahDesc:"Ayatul Kursi, los últimos 2 versículos de la Sura Al-Baqarah, las suras Al-Ikhlas, Al-Falaq y An-Nas — lee y escucha.",
    ruqyahOpen:"Abrir Ruqyah",
    backToDuas:"← Duas",
    qiblaTitle:"Dirección de la Qibla",
    qiblaNote:"Sostén el teléfono en plano y gíralo lentamente — la aguja dorada apuntará hacia la Qibla.",
    useMyLoc:"📍 Usar mi ubicación",
    fastingTitle:"Ayuno",
    sunnahTitle:"Recordatorios de Ayuno Sunna",
    hijriMonthTitle:"Fechas Hiyri de Este Mes",
    profileTitle:"Perfil",
    profileDesc:"Tu nombre solo queda en tu teléfono — nunca se envía a ningún servidor.",
    yourName:"Tu nombre",
    saveBtn:"Guardar",
    clearBtn:"Borrar",
    settingsTitle:"Ajustes",
    autoLocLabel:"📍 Detectar ubicación automáticamente",
    autoLocDesc:"Si está activado, tu ciudad se establece automáticamente desde el GPS (se necesita permiso). Si está desactivado, se usa la ciudad de abajo.",
    detectNow:"📍 Detectar ubicación ahora",
    cityLabel:"Ciudad",
    countryLabel:"País",
    methodLabel:"Método de cálculo de la oración",
    schoolLabel:"Madhab de Asr",
    shafii:"Shafi'i (estándar)",
    hanafi:"Hanafi",
    langLabel:"Idioma",
    themeLabel:"Tema oscuro (tema cielo)",
    azanLabel:"Adhan a la hora de la oración",
    duroodLabel:"📿 Durood al desbloquear el teléfono",
    duroodDesc:"Si está activado, el audio del Durood se reproduce al desbloquear el teléfono (o al abrir la aplicación). No se reproducirá si está desactivado.",
    adhanLabel:"Voz del adhan",
    reciterLabel:"Recitador del Corán",
    notifLabel:"Notificaciones",
    dataPrivate:"Todos los datos quedan solo en tu teléfono — nada se envía a ningún servidor.",
    offsetsTitle:"Ajustar la hora del adhan antes/después",
    offsetsDesc:"Puedes reproducir el adhan de cada oración antes o después de la hora de la oración — por ejemplo, 15 minutos antes del Fajr (para prepararse), o 5 minutos después del Maghrib.",
    saveOffsets:"Guardar horarios",
    aboutTitle:"Acerca de la Aplicación",
    aboutLine1:"My Deen v2.0 — aplicación islámica gratuita. Horarios de oración: Aladhan API; Corán: AlQuran Cloud. Sin anuncios.",
    aboutLine2:"Un pequeño esfuerzo para facilitar tu práctica religiosa.",
    privacyBtn:"Política de Privacidad",
    backToSettings:"← Ajustes",
    privacyTitle:"Política de Privacidad",
    langFirstTitle:"Elige tu idioma",
    langFirstDesc:"Selecciona el idioma de la aplicación. Puedes cambiarlo en cualquier momento en Ajustes.",
    loading:"Cargando…",
    searchSurah:"Buscar sura…",
    saveDua:"🔖 Guardar",
    savedDua:"🔖 Guardado ✓",
    loadingAyahs:"Cargando aleyas…",
    ayahPlaceholder:"Número de aleya",
    ruqyahNote:"Las aleyas se cargarán desde el Corán. Toca el botón de audio para escuchar la recitación.",},  de: {
    nav_home:"Start",
    nav_quran:"Koran",
    nav_tasbih:"Tasbih",
    nav_duas:"Duas",
    nav_qibla:"Qibla",
    nav_fasting:"Fasten",
    nav_settings:"Einstellungen",
    nextPrayer:"Nächstes Gebet",
    prayersToday:"Gebetszeiten Heute",
    tracker:"Gebets-Tracker (Heute)",
    windows:"Sunna- & Makruh-Zeiten",
    fastTitle:"Suhur & Iftar",
    saved:"Gespeichert ✓",
    offline:"Kein Internet — gespeicherte Daten werden angezeigt",
    loadErr:"Konnte nicht geladen werden, erneut versuchen",
    appTagline:"Gebet • Koran • Duas",
    myLocation:"Mein Standort",
    locAutoBtn:"📍 Standort automatisch von der Karte setzen",
    quranTracker:"Koran-Tracker",
    readQuran:"Koran lesen →",
    last7:"Letzte 7 Tage",
    forbiddenTitle:"Verbotene Gebetszeiten",
    forbiddenNote:"In diesen Zeiten ist das Gebet verboten (Ausnahme: Finsternisgebet und nachzuholende Pflichtgebete).",
    naflTitle:"Zeiten der freiwilligen Gebete",
    fastCal:"Fastenkalender ansehen →",
    quranTitle:"Heiliger Koran",
    progress:"Fortschritt:",
    allSurahs:"Alle Suren",
    bookmarksTab:"🔖 Lesezeichen",
    readTab:"✅ Gelesen",
    backToList:"← Surenliste",
    listenAll:"▶️ Alle anhören",
    stopListen:"⏸️ Stoppen",
    goBtn:"Gehen",
    markRead:"✅ Diese Sure als gelesen markieren",
    markedRead:"✅ Gelesen ✓",
    nextSurah:"Nächste Sure →",
    nothingFound:"Nichts gefunden.",
    noBookmarks:"Noch keine Lesezeichen. Tippe beim Lesen des Korans auf 🔖, um ein Lesezeichen zu setzen.",
    noReadYet:"Noch keine Sure als gelesen markiert. Tippe nach dem Lesen einer Sure auf „Als gelesen markieren\".",
    noDuas:"Keine Duas in dieser Kategorie.",
    ayahNotFound:"Aya nicht gefunden",
    ayahs:"Ayas",
    prayersUnit:"Gebete",
    tasbihTitle:"Digitaler Tasbih",
    targetLabel:"Ziel:",
    todayTotal:"Heute gesamt:",
    restartBtn:"↺ Von vorn beginnen",
    changeTarget:"🎯 Ziel ändern",
    tasbihHint:"Tippe auf den Kreis zum Zählen. Bei jedem Tippen eine leichte Vibration.",
    todayCount:"Zählung Heute",
    duasTitle:"Duas & Adhkar",
    ruqyahTitle:"🛡️ Ruqyah",
    ruqyahDesc:"Ayatul Kursi, die letzten 2 Ayas der Sure Al-Baqarah, die Suren Al-Ikhlas, Al-Falaq und An-Nas — lesen und anhören.",
    ruqyahOpen:"Ruqyah öffnen",
    backToDuas:"← Duas",
    qiblaTitle:"Qibla-Richtung",
    qiblaNote:"Halte das Telefon flach und drehe es langsam — die goldene Nadel zeigt zur Qibla.",
    useMyLoc:"📍 Meinen Standort verwenden",
    fastingTitle:"Fasten",
    sunnahTitle:"Erinnerungen an Sunna-Fasten",
    hijriMonthTitle:"Hijri-Daten in diesem Monat",
    profileTitle:"Profil",
    profileDesc:"Dein Name bleibt nur auf deinem Telefon — er wird nie an einen Server gesendet.",
    yourName:"Dein Name",
    saveBtn:"Speichern",
    clearBtn:"Löschen",
    settingsTitle:"Einstellungen",
    autoLocLabel:"📍 Standort automatisch erkennen",
    autoLocDesc:"Wenn aktiviert, wird deine Stadt automatisch per GPS eingestellt (Berechtigung erforderlich). Wenn deaktiviert, wird die unten stehende Stadt verwendet.",
    detectNow:"📍 Standort jetzt erkennen",
    cityLabel:"Stadt",
    countryLabel:"Land",
    methodLabel:"Berechnungsmethode für Gebete",
    schoolLabel:"Asr-Madhhab",
    shafii:"Schafi'i (Standard)",
    hanafi:"Hanafi",
    langLabel:"Sprache",
    themeLabel:"Dunkles Design (Himmels-Design)",
    azanLabel:"Adhan zur Gebetszeit",
    duroodLabel:"📿 Durood beim Entsperren des Telefons",
    duroodDesc:"Wenn aktiviert, wird beim Entsperren deines Telefons (oder Öffnen der App) der Durood-Audio abgespielt. Wenn deaktiviert, wird er nicht abgespielt.",
    adhanLabel:"Adhan-Stimme",
    reciterLabel:"Koran-Rezitator",
    notifLabel:"Benachrichtigungen",
    dataPrivate:"Alle Daten bleiben nur auf deinem Telefon — nichts wird an einen Server gesendet.",
    offsetsTitle:"Adhan-Zeit früher/später einstellen",
    offsetsDesc:"Du kannst den Adhan für jedes Gebet früher oder später als die Gebetszeit abspielen — z. B. 15 Minuten vor Fajr (zur Vorbereitung) oder 5 Minuten nach Maghrib.",
    saveOffsets:"Zeiten speichern",
    aboutTitle:"Über die App",
    aboutLine1:"My Deen v2.0 — kostenlose islamische App. Gebetszeiten: Aladhan API; Koran: AlQuran Cloud. Keine Werbung.",
    aboutLine2:"Ein kleiner Beitrag, um deine religiöse Praxis zu erleichtern.",
    privacyBtn:"Datenschutz",
    backToSettings:"← Einstellungen",
    privacyTitle:"Datenschutz",
    langFirstTitle:"Wähle deine Sprache",
    langFirstDesc:"Wähle die Sprache der App. Du kannst sie jederzeit in den Einstellungen ändern.",
    loading:"Wird geladen…",
    searchSurah:"Sure suchen…",
    saveDua:"🔖 Speichern",
    savedDua:"🔖 Gespeichert ✓",
    loadingAyahs:"Ayas werden geladen…",
    ayahPlaceholder:"Aya-Nummer",
    ruqyahNote:"Die Ayas werden aus dem Koran geladen. Tippe auf den Audio-Button, um die Rezitation zu hören.",},
};
const PHRASE = {
  "Sunrise": {"ar":"الشروق", "de":"Sonnenaufgang", "es":"Amanecer", "fa":"طلوع آفتاب", "fr":"Lever du soleil", "ha":"Fitowar rana", "hi":"सूर्योदय", "id":"Syuruk", "ms":"Syuruk", "ps":"لمر خاته", "ru":"Восход", "sw":"Jua", "tr":"Güneş", "ur":"طلوع آفتاب"},
  " (tomorrow)": {"ar":" (غدًا)", "de":" (morgen)", "es":" (mañana)", "fa":" (فردا)", "fr":" (demain)", "ha":" (gobe)", "hi":" (कल)", "id":" (besok)", "ms":" (esok)", "ps":" (سبا)", "ru":" (завтра)", "sw":" (kesho)", "tr":" (yarın)", "ur":" (کل)"},
  "Next Suhoor ends": {"ar":"ينتهي السحور التالي", "de":"Nächster Suhur endet", "es":"El próximo suhur termina", "fa":"پایان سحری بعدی", "fr":"Fin du prochain souhour", "ha":"Sahur na gaba yana ƙarewa", "hi":"अगली सहरी समाप्त", "id":"Sahur berikutnya berakhir", "ms":"Sahur seterusnya tamat", "ps":"راتلونکې سحري پای ته رسېږي", "ru":"Следующий сухур заканчивается", "sw":"Daku inayofuata inaisha", "tr":"Sonraki sahur bitiyor", "ur":"اگلی سحری ختم"},
  "Next Iftar": {"ar":"الإفطار القادم", "de":"Nächstes Iftar", "es":"Próximo iftar", "fa":"افطار بعدی", "fr":"Prochain iftar", "ha":"Buda baki na gaba", "hi":"अगला इफ़्तार", "id":"Berbuka berikutnya", "ms":"Iftar seterusnya", "ps":"راتلونکی روژه مات", "ru":"Следующий ифтар", "sw":"Futari inayofuata", "tr":"Sonraki iftar", "ur":"اگلا افطار"},
  "Next Suhoor ends (tomorrow)": {"ar":"ينتهي السحور التالي (غدًا)", "de":"Nächster Suhur endet (morgen)", "es":"El próximo suhur termina (mañana)", "fa":"پایان سحری بعدی (فردا)", "fr":"Fin du prochain souhour (demain)", "ha":"Sahur na gaba yana ƙarewa (gobe)", "hi":"अगली सहरी समाप्त (कल)", "id":"Sahur berikutnya berakhir (besok)", "ms":"Sahur seterusnya tamat (esok)", "ps":"راتلونکې سحري پای ته رسېږي (سبا)", "ru":"Следующий сухур заканчивается (завтра)", "sw":"Daku inayofuata inaisha (kesho)", "tr":"Sonraki sahur bitiyor (yarın)", "ur":"اگلی سحری ختم (کل)"},
  "Morning": {"ar":"الصباح", "de":"Morgen", "es":"Mañana", "fa":"صبح", "fr":"Matin", "ha":"Safe", "hi":"सुबह", "id":"Pagi", "ms":"Pagi", "ps":"سهار", "ru":"Утро", "sw":"Asubuhi", "tr":"Sabah", "ur":"صبح"},
  "Midday": {"ar":"الظهر", "de":"Mittag", "es":"Mediodía", "fa":"ظهر", "fr":"Midi", "ha":"Rana", "hi":"दोपहर", "id":"Siang", "ms":"Tengah hari", "ps":"غرمه", "ru":"Полдень", "sw":"Mchana", "tr":"Öğle", "ur":"دوپہر"},
  "Evening": {"ar":"المساء", "de":"Abend", "es":"Tarde", "fa":"عصر", "fr":"Soir", "ha":"Yamma", "hi":"शाम", "id":"Sore", "ms":"Petang", "ps":"ماښام", "ru":"Вечер", "sw":"Jioni", "tr":"Akşam", "ur":"شام"},
  "Tahajjud (last third of night)": {"ar":"التهجد (الثلث الأخير من الليل)", "de":"Tahajjud (letztes Drittel der Nacht)", "es":"Tahajjud (último tercio de la noche)", "fa":"تهجد (ثلث آخر شب)", "fr":"Tahajjud (dernier tiers de la nuit)", "ha":"Tahajjud (kashi na uku na dare)", "hi":"तहज्जुद (रात का अंतिम तिहाई)", "id":"Tahajud (sepertiga malam terakhir)", "ms":"Tahajud (sepertiga malam terakhir)", "ps":"تهجد (د شپې وروستۍ درېیمه برخه)", "ru":"Тахаджуд (последняя треть ночи)", "sw":"Tahajjud (theuthi ya mwisho ya usiku)", "tr":"Teheccüd (gecenin son üçte biri)", "ur":"تہجد (رات کا آخری تیسرا حصہ)"},
  "Ishraq (~15 min after sunrise)": {"ar":"الإشراق (بعد الشروق بـ ~15 دقيقة)", "de":"Ishraq (~15 Min. nach Sonnenaufgang)", "es":"Ishraq (~15 min después del amanecer)", "fa":"اشراق (~۱۵ دقیقه پس از طلوع آفتاب)", "fr":"Ishraq (~15 min après le lever du soleil)", "ha":"Ishraq (~minti 15 bayan fitowar rana)", "hi":"इशराक़ (सूर्योदय के ~15 मिनट बाद)", "id":"Isyraq (~15 mnt setelah syuruk)", "ms":"Isyraq (~15 min selepas syuruk)", "ps":"اشراق (د لمر ختو څخه ~۱۵ دقیقې وروسته)", "ru":"Ишрак (~15 мин после восхода)", "sw":"Ishraq (~dakika 15 baada ya jua)", "tr":"İşrak (güneş doğduktan ~15 dk sonra)", "ur":"اشراق (طلوع آفتاب کے ~۱۵ منٹ بعد)"},
  "Duha / Chasht": {"ar":"الضحى", "de":"Duha", "es":"Duha", "fa":"ضحی", "fr":"Duha", "ha":"Duha", "hi":"दुहा / चाश्त", "id":"Duha", "ms":"Duha", "ps":"څاښت", "ru":"Духа", "sw":"Duha", "tr":"Duhâ / Kuşluk", "ur":"چاشت"},
  "Zawal begins": {"ar":"يبدأ الزوال", "de":"Zawal beginnt", "es":"Comienza el zawal", "fa":"شروع زوال", "fr":"Début du zawal", "ha":"Zawal ya fara", "hi":"ज़वाल शुरू", "id":"Zawal dimulai", "ms":"Zawal bermula", "ps":"زوال پیلېږي", "ru":"Начинается заваль", "sw":"Zawal inaanza", "tr":"Zeval başlıyor", "ur":"زوال شروع"},
  "Awwabin (after Maghrib)": {"ar":"الأوابين (بعد المغرب)", "de":"Awwabin (nach Maghrib)", "es":"Awwabin (después del Magrib)", "fa":"اوابین (پس از مغرب)", "fr":"Awwabin (après le Maghrib)", "ha":"Awwabin (bayan Magriba)", "hi":"अव्वाबीन (मग़रिब के बाद)", "id":"Awwabin (setelah Maghrib)", "ms":"Awwabin (selepas Maghrib)", "ps":"اوابین (له ماښام وروسته)", "ru":"Аввабин (после магриба)", "sw":"Awwabin (baada ya Magharibi)", "tr":"Evvabin (akşamdan sonra)", "ur":"اوابین (مغرب کے بعد)"},
  "Suhoor ends (Imsak)": {"ar":"ينتهي السحور (الإمساك)", "de":"Suhur endet (Imsak)", "es":"El suhur termina (Imsak)", "fa":"پایان سحری (امساک)", "fr":"Fin du souhour (Imsak)", "ha":"Sahur ya ƙare (Imsak)", "hi":"सहरी समाप्त (इमसाक)", "id":"Sahur berakhir (Imsak)", "ms":"Sahur tamat (Imsak)", "ps":"سحري پای ته رسېږي (امساک)", "ru":"Сухур заканчивается (имсак)", "sw":"Daku inaisha (Imsak)", "tr":"Sahur bitiyor (İmsak)", "ur":"سحری ختم (امساک)"},
  "Iftar (Maghrib)": {"ar":"الإفطار (المغرب)", "de":"Iftar (Maghrib)", "es":"Iftar (Magrib)", "fa":"افطار (مغرب)", "fr":"Iftar (Maghrib)", "ha":"Buda baki (Magriba)", "hi":"इफ़्तार (मग़रिब)", "id":"Berbuka (Maghrib)", "ms":"Iftar (Maghrib)", "ps":"روژه مات (ماښام)", "ru":"Ифтар (магриб)", "sw":"Futari (Magharibi)", "tr":"İftar (Akşam)", "ur":"افطار (مغرب)"},
  "Alhamdulillah, marked ✓": {"ar":"الحمد لله، تم التحديد ✓", "de":"Alhamdulillah, markiert ✓", "es":"Alhamdulillah, marcado ✓", "fa":"الحمدلله، علامت زده شد ✓", "fr":"Alhamdulillah, marqué ✓", "ha":"Alhamdulillah, an yi alama ✓", "hi":"अल्हम्दुलिल्लाह, चिह्नित ✓", "id":"Alhamdulillah, ditandai ✓", "ms":"Alhamdulillah, ditanda ✓", "ps":"الحمدلله، ونښلول شو ✓", "ru":"Альхамдулиллях, отмечено ✓", "sw":"Alhamdulillah, imewekwa alama ✓", "tr":"Elhamdülillah, işaretlendi ✓", "ur":"الحمدللہ، نشان زد کر دیا ✓"},
  "Alhamdulillah — marked as read ✓": {"ar":"الحمد لله — تم التحديد كمقروءة ✓", "de":"Alhamdulillah — als gelesen markiert ✓", "es":"Alhamdulillah — marcado como leído ✓", "fa":"الحمدلله — به‌عنوان خوانده‌شده علامت زده شد ✓", "fr":"Alhamdulillah — marqué comme lu ✓", "ha":"Alhamdulillah — an yi alama a matsayin an karanta ✓", "hi":"अल्हम्दुलिल्लाह — पढ़ा हुआ चिह्नित ✓", "id":"Alhamdulillah — ditandai sudah dibaca ✓", "ms":"Alhamdulillah — ditanda sudah dibaca ✓", "ps":"الحمدلله — د لوستل شوي په توګه ونښلول شو ✓", "ru":"Альхамдулиллях — отмечено прочитанным ✓", "sw":"Alhamdulillah — imewekwa kama imesomwa ✓", "tr":"Elhamdülillah — okundu olarak işaretlendi ✓", "ur":"الحمدللہ — پڑھا ہوا نشان زد کر دیا ✓"},
  "Mark removed": {"ar":"تمت إزالة العلامة", "de":"Markierung entfernt", "es":"Marca eliminada", "fa":"علامت برداشته شد", "fr":"Marque retirée", "ha":"An cire alama", "hi":"चिह्न हटाया गया", "id":"Tanda dihapus", "ms":"Tanda dibuang", "ps":"نښه لرې شوه", "ru":"Отметка снята", "sw":"Alama imeondolewa", "tr":"İşaret kaldırıldı", "ur":"نشان ہٹا دیا گیا"},
  "Today's Hadith": {"ar":"حديث اليوم", "de":"Hadith des Tages", "es":"Hadiz de Hoy", "fa":"حدیث امروز", "fr":"Hadith du Jour", "ha":"Hadisin Yau", "hi":"आज की हदीस", "id":"Hadis Hari Ini", "ms":"Hadis Hari Ini", "ps":"د نن حدیث", "ru":"Хадис дня", "sw":"Hadithi ya Leo", "tr":"Bugünün Hadisi", "ur":"آج کی حدیث"},
  "Today's Reminder": {"ar":"تذكير اليوم", "de":"Erinnerung des Tages", "es":"Recordatorio de Hoy", "fa":"یادآوری امروز", "fr":"Rappel du Jour", "ha":"Tunarwar Yau", "hi":"आज की याद दिलाना", "id":"Pengingat Hari Ini", "ms":"Peringatan Hari Ini", "ps":"د نن یادونه", "ru":"Напоминание дня", "sw":"Kikumbusho cha Leo", "tr":"Bugünün Hatırlatması", "ur":"آج کی یاد دہانی"},
  "Hadith": {"ar":"حديث", "de":"Hadith", "es":"Hadiz", "fa":"حدیث", "fr":"Hadith", "ha":"Hadisi", "hi":"हदीस", "id":"Hadis", "ms":"Hadis", "ps":"حدیث", "ru":"Хадис", "sw":"Hadithi", "tr":"Hadis", "ur":"حدیث"},
  "Ayahs": {"ar":"آيات", "de":"Ayas", "es":"Aleyas", "fa":"آیات", "fr":"Versets", "ha":"Ayoyi", "hi":"आयतें", "id":"Ayat", "ms":"Ayat", "ps":"آیتونه", "ru":"Аяты", "sw":"Aya", "tr":"Ayet", "ur":"آیات"},
  "Listen": {"ar":"استمع", "de":"Anhören", "es":"Escuchar", "fa":"گوش دهید", "fr":"Écouter", "ha":"Saurara", "hi":"सुनें", "id":"Dengarkan", "ms":"Dengar", "ps":"واورئ", "ru":"Слушать", "sw":"Sikiliza", "tr":"Dinle", "ur":"سنیں"},
  "Audio failed — check internet": {"ar":"تعذر تشغيل الصوت — تحقق من الإنترنت", "de":"Audio fehlgeschlagen — Internet prüfen", "es":"Error de audio — revisa internet", "fa":"پخش صدا ناموفق بود — اینترنت را بررسی کنید", "fr":"Échec de l'audio — vérifiez internet", "ha":"Sauti ya gaza — duba intanet", "hi":"ऑडियो नहीं चला — इंटरनेट देखें", "id":"Audio gagal — periksa internet", "ms":"Audio gagal — semak internet", "ps":"آډیو ونه چلېده — انټرنیټ وګورئ", "ru":"Не удалось воспроизвести аудио — проверьте интернет", "sw":"Sauti imeshindwa — angalia intaneti", "tr":"Ses çalınamadı — interneti kontrol edin", "ur":"آڈیو نہیں چلا — انٹرنیٹ دیکھیں"},
  "Location": {"ar":"الموقع", "de":"Standort", "es":"Ubicación", "fa":"موقعیت", "fr":"Position", "ha":"Wuri", "hi":"स्थान", "id":"Lokasi", "ms":"Lokasi", "ps":"ځای", "ru":"Местоположение", "sw":"Mahali", "tr":"Konum", "ur":"مقام"},
  "Sunnah": {"ar":"سنة", "de":"Sunna", "es":"Sunna", "fa":"سنت", "fr":"Sunna", "ha":"Sunnah", "hi":"सुन्नत", "id":"Sunnah", "ms":"Sunat", "ps":"سنت", "ru":"Сунна", "sw":"Sunna", "tr":"Sünnet", "ur":"سنت"},
  "Day of Arafah fast (9 Dhul Hijjah)": {"ar":"صيام يوم عرفة (٩ ذو الحجة)", "de":"Fasten am Tag von Arafat (9. Dhul-Hiddscha)", "es":"Ayuno del Día de Arafat (9 Dhul Hiyya)", "fa":"روزه روز عرفه (۹ ذی‌الحجه)", "fr":"Jeûne du jour d'Arafat (9 Dhul Hijjah)", "ha":"Azumin Ranar Arafah (9 Zulhijja)", "hi":"अरफ़ा के दिन का रोज़ा (९ ज़िलहिज्जा)", "id":"Puasa Hari Arafah (9 Zulhijah)", "ms":"Puasa Hari Arafah (9 Zulhijah)", "ps":"د عرفې ورځې روژه (۹ ذوالحجه)", "ru":"Пост в день Арафа (9 зуль-хиджа)", "sw":"Saumu ya Siku ya Arafah (9 Dhul Hijjah)", "tr":"Arefe günü orucu (9 Zilhicce)", "ur":"عرفہ کے دن کا روزہ (۹ ذوالحجہ)"},
  "Suhoor ends in": {"ar":"ينتهي السحور خلال", "de":"Suhur endet in", "es":"El suhur termina en", "fa":"پایان سحری تا", "fr":"Fin du souhour dans", "ha":"Sahur ya ƙare a cikin", "hi":"सहरी समाप्त होने में", "id":"Sahur berakhir dalam", "ms":"Sahur tamat dalam", "ps":"سحري پای ته رسېدو ته", "ru":"До конца сухура", "sw":"Daku inaisha baada ya", "tr":"Sahur bitimine", "ur":"سحری ختم ہونے میں"},
  "Iftar in": {"ar":"الإفطار خلال", "de":"Iftar in", "es":"Iftar en", "fa":"افطار تا", "fr":"Iftar dans", "ha":"Buda baki a cikin", "hi":"इफ़्तार में", "id":"Berbuka dalam", "ms":"Iftar dalam", "ps":"روژه مات ته", "ru":"До ифтара", "sw":"Futari baada ya", "tr":"İftara", "ur":"افطار میں"},
  "Tomorrow Suhoor ends (Imsak)": {"ar":"ينتهي سحور الغد (الإمساك)", "de":"Morgiger Suhur endet (Imsak)", "es":"El suhur de mañana termina (Imsak)", "fa":"پایان سحری فردا (امساک)", "fr":"Fin du souhour de demain (Imsak)", "ha":"Sahur na gobe ya ƙare (Imsak)", "hi":"कल सहरी समाप्त (इमसाक)", "id":"Sahur besok berakhir (Imsak)", "ms":"Sahur esok tamat (Imsak)", "ps":"سبا سحري پای ته رسېږي (امساک)", "ru":"Завтра сухур заканчивается (имсак)", "sw":"Daku ya kesho inaisha (Imsak)", "tr":"Yarın sahur bitiyor (İmsak)", "ur":"کل سحری ختم (امساک)"},
  "Suhoor": {"ar":"السحور", "de":"Suhur", "es":"Suhur", "fa":"سحری", "fr":"Souhour", "ha":"Sahur", "hi":"सहरी", "id":"Sahur", "ms":"Sahur", "ps":"سحري", "ru":"Сухур", "sw":"Daku", "tr":"Sahur", "ur":"سحری"},
  "Iftar": {"ar":"الإفطار", "de":"Iftar", "es":"Iftar", "fa":"افطار", "fr":"Iftar", "ha":"Buda baki", "hi":"इफ़्तार", "id":"Berbuka", "ms":"Iftar", "ps":"روژه مات", "ru":"Ифтар", "sw":"Futari", "tr":"İftar", "ur":"افطار"},
  "It is time for prayer": {"ar":"حان وقت الصلاة", "de":"Es ist Gebetszeit", "es":"Es hora de la oración", "fa":"وقت نماز است", "fr":"C'est l'heure de la prière", "ha":"Lokacin sallah ya yi", "hi":"नमाज़ का समय हो गया", "id":"Sudah tiba waktu sholat", "ms":"Sudah tiba waktu solat", "ps":"د لمانځه وخت شو", "ru":"Настало время намаза", "sw":"Wakati wa sala umefika", "tr":"Namaz vakti geldi", "ur":"نماز کا وقت ہو گیا"},
  "Time for prayer": {"ar":"وقت الصلاة", "de":"Gebetszeit", "es":"Hora de la oración", "fa":"وقت نماز", "fr":"Heure de la prière", "ha":"Lokacin sallah", "hi":"नमाज़ का समय", "id":"Waktu sholat", "ms":"Waktu solat", "ps":"د لمانځه وخت", "ru":"Время намаза", "sw":"Wakati wa sala", "tr":"Namaz vakti", "ur":"نماز کا وقت"},
  "Use miswak and perform wudu to prepare for prayer": {"ar":"استخدم المسواك وتوضأ للاستعداد للصلاة", "de":"Benutze Miswak und vollziehe die Waschung, um dich auf das Gebet vorzubereiten", "es":"Usa el miswak y haz la ablución para prepararte para la oración", "fa":"مسواک بزنید و وضو بگیرید تا برای نماز آماده شوید", "fr":"Utilisez le miswak et faites vos ablutions pour vous préparer à la prière", "ha":"Yi amfani da aswaki ka yi alwala don shirya sallah", "hi":"मिस्वाक करें और वुज़ू करके नमाज़ की तैयारी करें", "id":"Gunakan siwak dan berwudu untuk bersiap sholat", "ms":"Gunakan miswak dan berwuduk untuk bersedia solat", "ps":"مسواک وکړئ او اودس وکړئ څو لمونځ ته تیار شئ", "ru":"Используйте мисвак и совершите омовение, чтобы подготовиться к намазу", "sw":"Tumia mswaki na tawadha ili kujiandaa kwa sala", "tr":"Namaza hazırlanmak için misvak kullanın ve abdest alın", "ur":"مسواک کریں اور وضو کر کے نماز کی تیاری کریں"},
  "Location unavailable — allow permission or type a city": {"ar":"الموقع غير متاح — اسمح بالإذن أو اكتب مدينة", "de":"Standort nicht verfügbar — erlaube den Zugriff oder gib eine Stadt ein", "es":"Ubicación no disponible — permite el permiso o escribe una ciudad", "fa":"موقعیت در دسترس نیست — اجازه دهید یا شهر را بنویسید", "fr":"Position indisponible — autorisez ou tapez une ville", "ha":"Ba a sami wuri ba — ba da izini ko rubuta gari", "hi":"स्थान उपलब्ध नहीं — अनुमति दें या शहर लिखें", "id":"Lokasi tidak tersedia — izinkan atau ketik kota", "ms":"Lokasi tidak tersedia — benarkan kebenaran atau taip bandar", "ps":"ځای نشته — اجازه ورکړئ یا ښار ولیکئ", "ru":"Местоположение недоступно — разрешите доступ или введите город", "sw":"Mahali haipatikani — ruhusu au andika jiji", "tr":"Konum bulunamadı — izin verin veya şehir yazın", "ur":"مقام دستیاب نہیں — اجازت دیں یا شہر لکھیں"},
  "Location found": {"ar":"تم العثور على الموقع", "de":"Standort gefunden", "es":"Ubicación encontrada", "fa":"موقعیت یافت شد", "fr":"Position trouvée", "ha":"An sami wuri", "hi":"स्थान मिल गया", "id":"Lokasi ditemukan", "ms":"Lokasi dijumpai", "ps":"ځای وموندل شو", "ru":"Местоположение найдено", "sw":"Mahali limepatikana", "tr":"Konum bulundu", "ur":"مقام مل گیا"},
  "On time": {"ar":"في الوقت", "de":"Pünktlich", "es":"A tiempo", "fa":"به‌موقع", "fr":"À l'heure", "ha":"A kan lokaci", "hi":"समय पर", "id":"Tepat waktu", "ms":"Tepat masa", "ps":"پر وخت", "ru":"Вовремя", "sw":"Kwa wakati", "tr":"Vaktinde", "ur":"وقت پر"},
  "min later": {"ar":"دقيقة بعد", "de":"Min. später", "es":"min después", "fa":"دقیقه بعد", "fr":"min plus tard", "ha":"minti daga baya", "hi":"मिनट बाद", "id":"mnt kemudian", "ms":"minit kemudian", "ps":"دقیقې وروسته", "ru":"мин позже", "sw":"dakika baadaye", "tr":"dk sonra", "ur":"منٹ بعد"},
  "min earlier": {"ar":"دقيقة قبل", "de":"Min. früher", "es":"min antes", "fa":"دقیقه زودتر", "fr":"min plus tôt", "ha":"minti da suka wuce", "hi":"मिनट पहले", "id":"mnt lebih awal", "ms":"minit awal", "ps":"دقیقې مخکې", "ru":"мин раньше", "sw":"dakika mapema", "tr":"dk önce", "ur":"منٹ پہلے"},
  "Removed": {"ar":"تمت الإزالة", "de":"Entfernt", "es":"Eliminado", "fa":"برداشته شد", "fr":"Retiré", "ha":"An cire", "hi":"हटाया गया", "id":"Dihapus", "ms":"Dibuang", "ps":"لرې شو", "ru":"Удалено", "sw":"Imeondolewa", "tr":"Kaldırıldı", "ur":"ہٹا دیا گیا"},
  "Did you pray?": {"ar":"هل صليت؟", "de":"Hast du gebetet?", "es":"¿Rezaste?", "fa":"نماز خواندی؟", "fr":"As-tu prié ?", "ha":"Ka yi sallah?", "hi":"क्या नमाज़ पढ़ी?", "id":"Sudahkah kamu sholat?", "ms":"Sudahkah anda solat?", "ps":"ایا لمونځ مو وکړ؟", "ru":"Ты помолился?", "sw":"Umesali?", "tr":"Namaz kıldın mı?", "ur":"کیا نماز پڑھی؟"},
  "— please pray soon": {"ar":"— صلِّ قريبًا من فضلك", "de":"— bitte bete bald", "es":"— por favor, reza pronto", "fa":"— لطفاً زود نماز بخوانید", "fr":"— prie vite s'il te plaît", "ha":"— da fatan za a yi sallah da wuri", "hi":"— कृपया जल्दी नमाज़ पढ़ें", "id":"— segera sholat", "ms":"— sila solat segera", "ps":"— ژر لمونځ وکړئ", "ru":"— пожалуйста, помолись скорее", "sw":"— tafadhali sali hivi karibuni", "tr":"— lütfen hemen namaz kıl", "ur":"— جلدی نماز پڑھ لیں"},
  "Hurry up and pray": {"ar":"أسرع وصلِّ", "de":"Beeil dich und bete", "es":"Date prisa y reza", "fa":"زود نماز بخوانید", "fr":"Dépêche-toi de prier", "ha":"Yi sallah da sauri", "hi":"जल्दी नमाज़ पढ़ें", "id":"Cepat sholat", "ms":"Cepat solat", "ps":"ژر لمونځ وکړئ", "ru":"Поторопись и помолись", "sw":"Haraka sali", "tr":"Acele et, namaz kıl", "ur":"جلدی نماز پڑھ لیں"},
  "Check your internet and try again": {"ar":"تحقق من الإنترنت وحاول مرة أخرى", "de":"Prüfe dein Internet und versuche es erneut", "es":"Revisa tu internet e inténtalo de nuevo", "fa":"اینترنت را بررسی کنید و دوباره تلاش کنید", "fr":"Vérifiez votre connexion internet et réessayez", "ha":"Duba intanet ɗinka ka sake gwadawa", "hi":"अपना इंटरनेट जाँचें और फिर से कोशिश करें", "id":"Periksa internet Anda dan coba lagi", "ms":"Semak internet anda dan cuba lagi", "ps":"انټرنیټ وګورئ او بیا هڅه وکړئ", "ru":"Проверьте интернет и попробуйте снова", "sw":"Angalia intaneti yako na ujaribu tena", "tr":"İnternetinizi kontrol edip tekrar deneyin", "ur":"انٹرنیٹ چیک کر کے دوبارہ کوشش کریں"},
  "Bookmark removed": {"ar":"تمت إزالة العلامة", "de":"Lesezeichen entfernt", "es":"Marcador eliminado", "fa":"نشانک برداشته شد", "fr":"Favori retiré", "ha":"An cire alama", "hi":"बुकमार्क हटाया गया", "id":"Markah dihapus", "ms":"Penanda dibuang", "ps":"نښه لرې شوه", "ru":"Закладка удалена", "sw":"Alamisho imeondolewa", "tr":"Yer imi kaldırıldı", "ur":"بک مارک ہٹا دیا گیا"},
  "Bookmark saved ✓": {"ar":"تم حفظ العلامة ✓", "de":"Lesezeichen gespeichert ✓", "es":"Marcador guardado ✓", "fa":"نشانک ذخیره شد ✓", "fr":"Favori enregistré ✓", "ha":"An adana alama ✓", "hi":"बुकमार्क सहेजा गया ✓", "id":"Markah disimpan ✓", "ms":"Penanda disimpan ✓", "ps":"نښه خوندي شوه ✓", "ru":"Закладка сохранена ✓", "sw":"Alamisho imehifadhiwa ✓", "tr":"Yer imi kaydedildi ✓", "ur":"بک مارک محفوظ ہو گیا ✓"},
  "completed — Alhamdulillah!": {"ar":"اكتمل — الحمد لله!", "de":"abgeschlossen — Alhamdulillah!", "es":"completado — ¡Alhamdulillah!", "fa":"کامل شد — الحمدلله!", "fr":"terminé — Alhamdulillah !", "ha":"an kammala — Alhamdulillah!", "hi":"पूर्ण हुआ — अल्हम्दुलिल्लाह!", "id":"selesai — Alhamdulillah!", "ms":"selesai — Alhamdulillah!", "ps":"بشپړ شو — الحمدلله!", "ru":"выполнено — Альхамдулиллях!", "sw":"imekamilika — Alhamdulillah!", "tr":"tamamlandı — Elhamdülillah!", "ur":"مکمل ہو گیا — الحمدللہ!"},
  "See below": {"ar":"انظر أدناه", "de":"Siehe unten", "es":"Ver abajo", "fa":"پایین را ببینید", "fr":"Voir ci-dessous", "ha":"Duba ƙasa", "hi":"नीचे देखें", "id":"Lihat di bawah", "ms":"Lihat di bawah", "ps":"لاندې وګورئ", "ru":"Смотрите ниже", "sw":"Tazama hapa chini", "tr":"Aşağıya bakın", "ur":"نیچے دیکھیں"},
  "Loading ayahs…": {"ar":"جارٍ تحميل الآيات…", "de":"Ayas werden geladen…", "es":"Cargando aleyas…", "fa":"در حال بارگذاری آیات…", "fr":"Chargement des versets…", "ha":"Ana lodin ayoyi…", "hi":"आयतें लोड हो रही हैं…", "id":"Memuat ayat…", "ms":"Memuatkan ayat…", "ps":"آیتونه لوډېږي…", "ru":"Загрузка аятов…", "sw":"Inapakia aya…", "tr":"Ayetler yükleniyor…", "ur":"آیات لوڈ ہو رہی ہیں…"},
  "This month so far:": {"ar":"حتى الآن هذا الشهر:", "de":"Diesen Monat bisher:", "es":"Este mes hasta ahora:", "fa":"تا اینجای این ماه:", "fr":"Ce mois-ci jusqu'à présent :", "ha":"Ya zuwa wannan wata:", "hi":"इस महीने अब तक:", "id":"Sejauh ini bulan ini:", "ms":"Setakat bulan ini:", "ps":"تر اوسه په دې میاشت کې:", "ru":"В этом месяце пока:", "sw":"Mwezi huu hadi sasa:", "tr":"Bu ay şu ana kadar:", "ur":"اس مہینے اب تک:"},
  "Surah": {"ar":"سورة", "de":"Sure", "es":"Sura", "fa":"سوره", "fr":"Sourate", "ha":"Sura", "hi":"सूरह", "id":"Surah", "ms":"Surah", "ps":"سورت", "ru":"Сура", "sw":"Sura", "tr":"Sure", "ur":"سورت"},
  "🔖 Bookmark": {"ar":"🔖 إشارة", "de":"🔖 Lesezeichen", "es":"🔖 Marcador", "fa":"🔖 نشانک", "fr":"🔖 Favori", "ha":"🔖 Alama", "hi":"🔖 बुकमार्क", "id":"🔖 Markah", "ms":"🔖 Penanda", "ps":"🔖 نښه", "ru":"🔖 Закладка", "sw":"🔖 Alamisho", "tr":"🔖 Yer imi", "ur":"🔖 بک مارک"},
  "🔖 Bookmarked ✓": {"ar":"🔖 تمت الإشارة ✓", "de":"🔖 Mit Lesezeichen ✓", "es":"🔖 Marcado ✓", "fa":"🔖 نشانک زده شد ✓", "fr":"🔖 Favori ajouté ✓", "ha":"🔖 An yi alama ✓", "hi":"🔖 बुकमार्क किया गया ✓", "id":"🔖 Ditandai ✓", "ms":"🔖 Ditanda ✓", "ps":"🔖 نښه شو ✓", "ru":"🔖 В закладках ✓", "sw":"🔖 Imewekwa alamisho ✓", "tr":"🔖 Yer imi eklendi ✓", "ur":"🔖 بک مارک ہو گیا ✓"},
  "Monday fast": {"ar":"صيام الاثنين", "de":"Montagsfasten", "es":"Ayuno del lunes", "fa":"روزه دوشنبه", "fr":"Jeûne du lundi", "ha":"Azumin Litinin", "hi":"सोमवार का रोज़ा", "id":"Puasa Senin", "ms":"Puasa Isnin", "ps":"د دوشنبې روژه", "ru":"Пост в понедельник", "sw":"Saumu ya Jumatatu", "tr":"Pazartesi orucu", "ur":"پیر کا روزہ"},
  "Thursday fast": {"ar":"صيام الخميس", "de":"Donnerstagsfasten", "es":"Ayuno del jueves", "fa":"روزه پنجشنبه", "fr":"Jeûne du jeudi", "ha":"Azumin Alhamis", "hi":"गुरुवार का रोज़ा", "id":"Puasa Kamis", "ms":"Puasa Khamis", "ps":"د پنجشنبې روژه", "ru":"Пост в четверг", "sw":"Saumu ya Alhamisi", "tr":"Perşembe orucu", "ur":"جمعرات کا روزہ"},
  "Ayyam al-Beed": {"ar":"أيام البيض", "de":"Ayyam al-Beed", "es":"Ayyam al-Beed", "fa":"ایام البیض", "fr":"Ayyam al-Beed", "ha":"Ayyamul Beed", "hi":"अय्याम अल-बीद", "id":"Ayyamul Bidh", "ms":"Ayyam al-Beed", "ps":"ایام البیض", "ru":"Айям аль-Бид", "sw":"Ayyam al-Beed", "tr":"Eyyâm-ı Bîd", "ur":"ایام بیض"},
  "h": {"ar":" س", "de":" Std.", "es":" h", "fa":" ساعت", "fr":" h", "ha":" awa", "hi":" घंटा", "id":" jam", "ms":" jam", "ps":" ساعته", "ru":" ч", "sw":" saa", "tr":" sa", "ur":" گھنٹہ"},
  "m": {"ar":" د", "de":" Min.", "es":" min", "fa":" دقیقه", "fr":" min", "ha":" minti", "hi":" मिनट", "id":" mnt", "ms":" min", "ps":" دقیقې", "ru":" мин", "sw":" dak", "tr":" dk", "ur":" منٹ"},
};
const PRAYER_NAMES = {"en": {"Fajr": "Fajr", "Sunrise": "Sunrise", "Dhuhr": "Dhuhr", "Asr": "Asr", "Maghrib": "Maghrib", "Isha": "Isha"}, "ar": {"Fajr": "الفجر", "Sunrise": "الشروق", "Dhuhr": "الظهر", "Asr": "العصر", "Maghrib": "المغرب", "Isha": "العشاء"}, "bn": {"Fajr": "ফজর", "Sunrise": "সূর্যোদয়", "Dhuhr": "জোহর", "Asr": "আসর", "Maghrib": "মাগরিব", "Isha": "ইশা"}, "ur": {"Fajr": "فجر", "Sunrise": "طلوع آفتاب", "Dhuhr": "ظہر", "Asr": "عصر", "Maghrib": "مغرب", "Isha": "عشاء"}, "ms": {"Fajr": "Subuh", "Sunrise": "Syuruk", "Dhuhr": "Zuhur", "Asr": "Asar", "Maghrib": "Maghrib", "Isha": "Isyak"}, "id": {"Fajr": "Subuh", "Sunrise": "Syuruk", "Dhuhr": "Zuhur", "Asr": "Asar", "Maghrib": "Maghrib", "Isha": "Isya"}, "tr": {"Fajr": "Sabah", "Sunrise": "Güneş", "Dhuhr": "Öğle", "Asr": "İkindi", "Maghrib": "Akşam", "Isha": "Yatsı"}, "fa": {"Fajr": "فجر", "Sunrise": "طلوع آفتاب", "Dhuhr": "ظهر", "Asr": "عصر", "Maghrib": "مغرب", "Isha": "عشاء"}, "fr": {"Fajr": "Fajr", "Sunrise": "Lever du soleil", "Dhuhr": "Dhohr", "Asr": "Asr", "Maghrib": "Maghrib", "Isha": "Icha"}, "hi": {"Fajr": "फ़ज्र", "Sunrise": "सूर्योदय", "Dhuhr": "ज़ुहर", "Asr": "अस्र", "Maghrib": "मग़रिब", "Isha": "इशा"}, "ps": {"Fajr": "فجر", "Sunrise": "لمر خاته", "Dhuhr": "ماسپښین", "Asr": "مازیګر", "Maghrib": "ماښام", "Isha": "ماسختن"}, "ha": {"Fajr": "Asuba", "Sunrise": "Fitowar rana", "Dhuhr": "Azahar", "Asr": "La'asar", "Maghrib": "Magriba", "Isha": "Isha'i"}, "sw": {"Fajr": "Alfajiri", "Sunrise": "Jua", "Dhuhr": "Adhuhuri", "Asr": "Alasiri", "Maghrib": "Magharibi", "Isha": "Isha"}, "ru": {"Fajr": "Фаджр", "Sunrise": "Восход", "Dhuhr": "Зухр", "Asr": "Аср", "Maghrib": "Магриб", "Isha": "Иша"}, "es": {"Fajr": "Fajr", "Sunrise": "Amanecer", "Dhuhr": "Dhuhr", "Asr": "Asr", "Maghrib": "Magrib", "Isha": "Isha"}, "de": {"Fajr": "Fajr", "Sunrise": "Sonnenaufgang", "Dhuhr": "Dhuhr", "Asr": "Asr", "Maghrib": "Maghrib", "Isha": "Ischa"}};
const pname = id => (PRAYER_NAMES[settings.lang] || PRAYER_NAMES.en)[id] || PRAYER_NAMES.en[id];
const DIRS = {"en": ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"], "ar": ["الشمال", "الشمال الشرقي", "الشرق", "الجنوب الشرقي", "الجنوب", "الجنوب الغربي", "الغرب", "الشمال الغربي"], "bn": ["উত্তর", "উত্তর-পূর্ব", "পূর্ব", "দক্ষিণ-পূর্ব", "দক্ষিণ", "দক্ষিণ-পশ্চিম", "পশ্চিম", "উত্তর-পশ্চিম"], "ur": ["شمال", "شمال مشرق", "مشرق", "جنوب مشرق", "جنوب", "جنوب مغرب", "مغرب", "شمال مغرب"], "fa": ["شمال", "شمال شرقی", "شرق", "جنوب شرقی", "جنوب", "جنوب غربی", "غرب", "شمال غربی"], "ms": ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"], "id": ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"], "tr": ["Kuzey", "Kuzeydoğu", "Doğu", "Güneydoğu", "Güney", "Güneybatı", "Batı", "Kuzeybatı"], "fr": ["Nord", "Nord-Est", "Est", "Sud-Est", "Sud", "Sud-Ouest", "Ouest", "Nord-Ouest"], "hi": ["उत्तर", "उत्तर-पूर्व", "पूर्व", "दक्षिण-पूर्व", "दक्षिण", "दक्षिण-पश्चिम", "पश्चिम", "उत्तर-पश्चिम"], "ru": ["Север", "Северо-восток", "Восток", "Юго-восток", "Юг", "Юго-запад", "Запад", "Северо-запад"], "es": ["Norte", "Noreste", "Este", "Sureste", "Sur", "Suroeste", "Oeste", "Noroeste"], "de": ["Norden", "Nordosten", "Osten", "Südosten", "Süden", "Südwesten", "Westen", "Nordwesten"]};
const dirName = idx => (DIRS[settings.lang] || DIRS.en)[idx];
/* Quran translation edition per app language (verified against
   https://api.alquran.cloud/v1/edition/format/text, 2026-11-16).
   ar has no translation (Arabic only). Unknown language -> en.sahih. */
const QURAN_TR = {"en": "en.sahih", "ar": null, "bn": "bn.bengali", "ur": "ur.jalandhry", "ms": "ms.basmeih", "id": "id.indonesian", "tr": "tr.diyanet", "fa": "fa.fooladvand", "fr": "fr.hamidullah", "hi": "hi.farooq", "ps": "ps.abdulwali", "ha": "ha.gumi", "sw": "sw.barwani", "ru": "ru.kuliev", "es": "es.bornez", "de": "de.aburida"};
const quranTrEdition = () => (settings.lang in QURAN_TR ? QURAN_TR[settings.lang] : "en.sahih");
const quranEditions = () => { const ed = quranTrEdition(); return ed ? "quran-uthmani,"+ed : "quran-uthmani"; };
const t = k => (STR[settings.lang] || STR.en)[k] || STR.en[k] || k;
/* L(en, bn): inline-string translation. Falls back to English. */
const L = (en, bn) => { const l = settings.lang; if (l==="bn") return bn; if (l==="en") return en; const row = PHRASE[en]; return (row && row[l]) || en; };
/* Lb(bn, en): like L() but keeps this file's historical argument order
   (Bengali first, English second) for inline bn/en string pairs. */
const Lb = (bn, en) => { const l = settings.lang; if (l==="bn") return bn;
  if (typeof en === "string"){ const row = PHRASE[en]; if (row && row[l]) return row[l]; }
  return en; };

/* ---------------- settings ---------------- */
const DEFAULTS = {city:"", country:"", lat:null, lon:null, method:0, school:0, schoolExplicit:false,
  lang:"en", theme:"dark", azan:true, adhan:"a1", reciter:"ar.alafasy", notif:false, tasbihTarget:33,
  autoLoc:true, useCoords:false, profileName:"", gmail:"", duroodOnUnlock:true, learnMadhhab:"hanafi",
  dailyNotif:true, duroodRemOn:true, duroodRemMin:30, duroodRemSound:true, astaghRemOn:true, astaghRemMin:30, astaghRemSound:true,
  /* Location identity: locId names the CURRENT location ("c:lat,lon" for
     coordinate locations, "n:city|country" for city-name ones). The
     timings cache, the stored coordinates (coordsLoc) and the stored
     timezone (tzLoc) are all tagged with the locId they belong to, so
     data from a previous location can never be served for a new one.
     locManual marks a location the user typed themselves — automatic
     GPS detection must never override it. */
  locId:"", coordsLoc:"", tzName:"", tzLoc:"", locManual:false,
  offsets:{Fajr:0, Dhuhr:0, Asr:0, Maghrib:0, Isha:0, Duha:0, Tahajjud:0, ForbMorning:0, ForbNoon:0, ForbEvening:0, Sehri:0, Iftar:0},
  /* Per-item alarm switches (Fix #4 §8): each fard prayer, the two nafl
     prayers, the three forbidden windows, and Sehri/Iftar can be toggled
     separately. Fard alarms default ON (azan is on by default); the rest
     default OFF until the user turns them on. */
  alarmOn:{Fajr:true, Dhuhr:true, Asr:true, Maghrib:true, Isha:true, Duha:false, Tahajjud:false, ForbMorning:false, ForbNoon:false, ForbEvening:false, Sehri:false, Iftar:false},
  /* Per-item alarm sound (Fix #4 §9; Fix #10): an ARRAY of up to 2
     sounds, played together. "name" (announce the prayer name) is the
     permanent default and is always selected; the user may add one more
     (azan / notification / beep / ring). "silent" stands alone. */
  alarmSound:{Fajr:["name"], Dhuhr:["name"], Asr:["name"], Maghrib:["name"], Isha:["name"], Duha:["name"], Tahajjud:["name"], ForbMorning:["name"], ForbNoon:["name"], ForbEvening:["name"], Sehri:["name"], Iftar:["name"]},
  permAsked:false, onboarded:false, permStepsAsked:{}};
let settings = {...DEFAULTS};
/* True when this device already has saved settings (a returning user).
   A saved language choice is always respected; only a first-run user —
   no saved settings at all — is offered the language chooser, with
   English as the default. */
const HAD_SAVED_SETTINGS = !!LS.getItem("dd_settings");
try { Object.assign(settings, JSON.parse(LS.getItem("dd_settings") || "{}")); } catch(e){}
/* Nested setting objects merge shallowly above, so an older saved
   settings object would drop the new keys — fill them from DEFAULTS. */
settings.offsets = {...DEFAULTS.offsets, ...(settings.offsets||{})};
settings.alarmOn = {...DEFAULTS.alarmOn, ...(settings.alarmOn||{})};
settings.permStepsAsked = {...DEFAULTS.permStepsAsked, ...(settings.permStepsAsked||{})};
settings.alarmSound = {...DEFAULTS.alarmSound, ...(settings.alarmSound||{})};
/* Fix #10: alarm sound is now a multi-select ARRAY (max 2, "name" always
   included unless the choice is silent alone). Older saved values were
   single strings — normalize them, keeping the old choice as the extra
   sound next to the permanent "name" default. */
const VALID_SOUNDS = ["silent","beep","ring","name","notification","azan"];
function normalizeSounds(v){
  let arr = Array.isArray(v) ? v.slice() : (typeof v === "string" && v ? [v] : []);
  if (arr.includes("silent")) return ["silent"];
  arr = arr.filter(s=>VALID_SOUNDS.includes(s));
  if (!arr.includes("name")) arr.unshift("name");
  return arr.slice(0, 2);
}
function migrateAlarmSounds(){
  Object.keys(settings.alarmSound||{}).forEach(k=>{ settings.alarmSound[k]=normalizeSounds(settings.alarmSound[k]); });
}
migrateAlarmSounds();
delete settings.profilePhoto; // removed feature (Fix #3): never stored again
function saveSettings(){ try { LS.setItem("dd_settings", JSON.stringify(settings)); } catch(e){} }
/* Location is NEVER pre-set (owner's rule, 2026-11-17): no default city,
   no saved city carried over. This one-time wipe clears any location an
   older version stored (the old build shipped with Ipoh pre-set), so
   every user starts from the location setup screen and chooses either
   GPS ("Allow location") or a manual city. Nothing else is touched. */
if (!LS.getItem("dd_loc_v30")){
  settings.city = ""; settings.country = ""; settings.lat = null; settings.lon = null;
  settings.useCoords = false;
  try { LS.removeItem("dd_timings_cache"); } catch(e){}
  saveSettings();
  try { LS.setItem("dd_loc_v30", "1"); } catch(e){}
}
/* True only when the user has actually set a location (GPS coordinates
   or a typed city). Until then there are no prayer times to show. */
const hasLocation = () => (settings.useCoords && isFinite(+settings.lat) && isFinite(+settings.lon))
  || !!(settings.city && String(settings.city).trim());
/* Identity helpers for the current location (see DEFAULTS note). */
const cityKeyOf = (city, country) => `n:${String(city||"").trim().toLowerCase()}|${String(country||"").trim().toLowerCase()}`;
const coordsKeyOf = () => `c:${settings.lat},${settings.lon}`;
/* One-time migration for installs saved before locId existed: derive the
   identity from the saved location so its cache/timezone stay valid. */
if (hasLocation() && !settings.locId){
  settings.locId = (settings.useCoords && isFinite(+settings.lat) && isFinite(+settings.lon))
    ? coordsKeyOf() : cityKeyOf(settings.city, settings.country);
  saveSettings();
}
/* Build #19, Fix #7: a phone that already stored "Chepor" (the
   geocoder's spelling) keeps showing it until the next GPS detect —
   fix the stored value once, here, so the pill shows Chemor at once.
   The location identity is re-derived from the corrected name so the
   cached times/timezone re-resolve for Chemor instead of being served
   under the old name. */
if (settings.city && String(settings.city).trim().toLowerCase() === "chepor"){
  settings.city = "Chemor";
  settings.locId = (settings.useCoords && isFinite(+settings.lat) && isFinite(+settings.lon))
    ? coordsKeyOf() : cityKeyOf(settings.city, settings.country);
  saveSettings();
}
/* Prayer-calculation method chosen by region, so azan times are right
   anywhere in the world: JAKIM in Malaysia, ISNA in North America,
   Umm al-Qura in Saudi Arabia, Diyanet in Turkey, Karachi in South
   Asia, the local authority elsewhere, and the Muslim World League as
   the general default. Used whenever Settings → method is "Auto". */
function methodForRegion(){
  const c = (settings.country || "").toLowerCase();
  if (c.includes("malaysia")) return 17;
  if (c.includes("singapore")) return 11;
  if (c.includes("indonesia")) return 20;
  if (c.includes("saudi")) return 4;
  if (c.includes("egypt")) return 5;
  if (c.includes("turkey") || c.includes("türkiye") || c.includes("turkiye")) return 13;
  if (c.includes("emirates") || c.includes("dubai")) return 16;
  if (c.includes("qatar") || c.includes("kuwait") || c.includes("bahrain") || c.includes("oman")) return 8;
  if (c.includes("pakistan") || c.includes("india") || c.includes("bangladesh") || c.includes("sri lanka") || c.includes("nepal")) return 1;
  if (c.includes("russia")) return 14;
  if (c.includes("tunisia")) return 18;
  if (c.includes("algeria")) return 19;
  if (c.includes("morocco")) return 21;
  if (c.includes("jordan")) return 22;
  if (c.includes("united states") || c.includes("america") || c.includes("canada") || c.includes("mexico")) return 2;
  const lat = +settings.lat, lon = +settings.lon;
  if (isFinite(lat) && isFinite(lon) && lon < -30 && lon > -170 && lat > 5) return 2; // North America by coordinates
  return 3; // Muslim World League — general default
}
const effMethod = () => settings.method > 0 ? settings.method : methodForRegion();
/* Asr school (Fix #11): the region's madhhab is the default — Shafi'i
   (factor 1) in Malaysia/Singapore/Indonesia, Hanafi (factor 2) in
   South Asia — so Asr matches the local published times (JAKIM Asr in
   Ipoh is 16:24, not the Hanafi 17:18). An explicit pick in
   Settings → "Asr madhab" always wins (schoolExplicit). */
function schoolForRegion(){
  const c = (settings.country || "").toLowerCase();
  if (c.includes("malaysia") || c.includes("singapore") || c.includes("indonesia") || c.includes("brunei")) return 0;
  if (c.includes("bangladesh") || c.includes("pakistan") || c.includes("india") || c.includes("sri lanka") || c.includes("nepal")) return 1;
  return 0;
}
const effSchool = () => settings.schoolExplicit ? settings.school : schoolForRegion();
const store = {
  get(k, d){ try { const v = LS.getItem("dd_"+k); return v==null? d : JSON.parse(v); } catch(e){ return d; } },
  set(k, v){ try { LS.setItem("dd_"+k, JSON.stringify(v)); } catch(e){} }
};
function toast(msg){ const el=$("#toast"); el.textContent=msg; el.classList.add("show");
  clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove("show"), 2600); }
/* Fetch JSON with a hard timeout: a stalled mobile connection must never
   leave a section stuck on "loading" forever. Throws on timeout, HTTP
   error or invalid JSON, so callers can retry or fall back. */
async function fetchJson(url, timeoutMs){
  const ctl = new AbortController();
  const timer = setTimeout(()=>ctl.abort(), timeoutMs || 12000);
  try {
    const r = await fetch(url, {signal: ctl.signal});
    if (!r.ok) throw new Error("HTTP "+r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}
const delay = ms => new Promise(res=>setTimeout(res, ms));

/* ---------------- Bengali calendar (Bangladesh official, fixed dates) ---------------- */
const BN_MONTHS = ["বৈশাখ","জ্যৈষ্ঠ","আষাঢ়","শ্রাবণ","ভাদ্র","আশ্বিন","কার্তিক","অগ্রহায়ণ","পৌষ","মাঘ","ফাল্গুন","চৈত্র"];
const BN_MONTHS_EN = ["Boishakh","Joishtho","Asharh","Shrabon","Bhadro","Ashwin","Kartik","Ogrohayon","Poush","Magh","Falgun","Choitro"];
function isLeap(y){ return (y%4===0 && y%100!==0) || y%400===0; }
function banglaDate(d){
  // Bangla year starts 14 April. Month lengths: 31,31,31,31,31,30,30,30,30,30, Falgun 30/31, 30
  let startYear = (d.getMonth()>3 || (d.getMonth()===3 && d.getDate()>=14)) ? d.getFullYear() : d.getFullYear()-1;
  const start = new Date(startYear, 3, 14);
  const diffDays = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - start) / 86400000);
  const falgunLeap = isLeap(startYear+1) ? 31 : 30;
  const lens = [31,31,31,31,31,30,30,30,30,30,falgunLeap,30];
  let day = diffDays, m = 0;
  while (m < 12 && day >= lens[m]) { day -= lens[m]; m++; }
  if (m >= 12) { m = 11; day = lens[11]-1; }
  return {day: day+1, month: m, year: startYear - 593,
    text: `${bnNum(day+1)} ${BN_MONTHS[m]} ${bnNum(startYear-593)}`,
    textEn: `${day+1} ${BN_MONTHS_EN[m]} ${startYear-593}`};
}

/* ---------------- prayer times ---------------- */
const PRAYERS = [
  {id:"Fajr", bn:"ফজর", en:"Fajr"},
  {id:"Sunrise", bn:"সূর্যোদয়", en:"Sunrise"},
  {id:"Dhuhr", bn:"জোহর", en:"Dhuhr"},
  {id:"Asr", bn:"আসর", en:"Asr"},
  {id:"Maghrib", bn:"মাগরিব", en:"Maghrib"},
  {id:"Isha", bn:"ইশা", en:"Isha"}
];
const PRAYER_IDS = ["Fajr","Dhuhr","Asr","Maghrib","Isha"];
let timings = null, hijriInfo = null, timingsDate = null;
function toMin(hhmm){ const m = String(hhmm).match(/(\d+):(\d+)/); return m ? (+m[1])*60 + (+m[2]) : null; }
/* Minutes (0–1439, wrapping) → "HH:MM". */
function minsToHHMM(m){ m = ((m % 1440) + 1440) % 1440; return `${pad2(Math.floor(m/60))}:${pad2(m%60)}`; }
function fmtTime(hhmm){ if(!hhmm) return "—"; const m = hhmm.match(/(\d+):(\d+)/); if(!m) return hhmm;
  const h=+m[1], mm=m[2]; const h12 = h%12===0?12:h%12; const ap = h<12 ? "AM":"PM";
  if (settings.lang==="bn") return `${num(h12)}:${num(mm)} ${h<12?"সকাল":"দুপুর/রাত"}`;
  return `${num(h12)}:${num(mm)} ${ap}`; }
/* Compact 24-hour time with locale digits — used by the Nafl card, whose
   design (like the reference) shows plain HH:MM values. */
function fmt24(mins){ if (mins==null || !isFinite(mins)) return "—";
  const m = ((Math.round(mins) % 1440) + 1440) % 1440;
  return `${num(pad2(Math.floor(m/60)))}:${num(pad2(m%60))}`; }
/* Built-in coordinates for well-known cities (factual reference data).
   A city-name location normally gets its coordinates from the Aladhan /
   Nominatim responses — but inside browsers that block those calls the
   coordinates never arrive, the on-device calculator had nothing to
   work with, and prayer times stayed blank even though a city WAS set
   (found live 2026-11-17: "London, United Kingdom" set, all times "—").
   This table lets the device compute times for these cities with no
   network at all; the API still refines them whenever it answers. */
const CITY_COORDS = {
  "london":[51.5074,-0.1278,"Europe/London"],
  "dhaka":[23.8103,90.4125,"Asia/Dhaka"],
  "chattogram":[22.3569,91.7832,"Asia/Dhaka"], "chittagong":[22.3569,91.7832,"Asia/Dhaka"],
  "sylhet":[24.9045,91.8699,"Asia/Dhaka"],
  "khulna":[22.8456,89.5403,"Asia/Dhaka"],
  "rajshahi":[24.3745,88.6042,"Asia/Dhaka"],
  "barishal":[22.7010,90.3535,"Asia/Dhaka"], "barisal":[22.7010,90.3535,"Asia/Dhaka"],
  "cumilla":[23.4607,91.1809,"Asia/Dhaka"], "comilla":[23.4607,91.1809,"Asia/Dhaka"],
  "jessore":[23.1664,89.2081,"Asia/Dhaka"], "jashore":[23.1664,89.2081,"Asia/Dhaka"],
  "mymensingh":[24.7471,90.4203,"Asia/Dhaka"],
  "rangpur":[25.7439,89.2752,"Asia/Dhaka"],
  "bogura":[24.8465,89.3776,"Asia/Dhaka"], "bogra":[24.8465,89.3776,"Asia/Dhaka"],
  "dinajpur":[25.6217,88.6355,"Asia/Dhaka"],
  "cox's bazar":[21.9162,91.9855,"Asia/Dhaka"], "coxs bazar":[21.9162,91.9855,"Asia/Dhaka"],
  "narayanganj":[23.6238,90.5000,"Asia/Dhaka"],
  "gazipur":[23.9999,90.4203,"Asia/Dhaka"],
  "tangail":[24.2513,89.9167,"Asia/Dhaka"],
  "kushtia":[23.9088,89.1220,"Asia/Dhaka"],
  "pabna":[24.0064,89.2372,"Asia/Dhaka"],
  "noakhali":[22.8696,91.0990,"Asia/Dhaka"],
  "feni":[23.0159,91.3976,"Asia/Dhaka"],
  "brahmanbaria":[23.9571,91.1080,"Asia/Dhaka"],
  "habiganj":[24.3745,91.4155,"Asia/Dhaka"],
  "moulvibazar":[24.4826,91.7777,"Asia/Dhaka"],
  "sunamganj":[25.0658,91.4071,"Asia/Dhaka"],
  "netrokona":[24.8703,90.7271,"Asia/Dhaka"],
  "jamalpur":[24.9375,89.9370,"Asia/Dhaka"],
  "sherpur":[25.0205,90.0174,"Asia/Dhaka"],
  "kurigram":[25.8072,89.6295,"Asia/Dhaka"],
  "lalmonirhat":[25.9168,89.4500,"Asia/Dhaka"],
  "gaibandha":[25.3288,89.5284,"Asia/Dhaka"],
  "naogaon":[24.8236,88.9473,"Asia/Dhaka"],
  "chapainawabganj":[24.5965,88.2775,"Asia/Dhaka"],
  "natore":[24.4206,89.0003,"Asia/Dhaka"],
  "sirajganj":[24.4534,89.7007,"Asia/Dhaka"],
  "joypurhat":[25.0961,89.0222,"Asia/Dhaka"],
  "bagerhat":[22.6516,89.7859,"Asia/Dhaka"],
  "satkhira":[22.7185,89.0705,"Asia/Dhaka"],
  "chuadanga":[23.6401,88.8418,"Asia/Dhaka"],
  "jhenaidah":[23.5449,89.1726,"Asia/Dhaka"],
  "magura":[23.4853,89.4198,"Asia/Dhaka"],
  "narail":[23.1657,89.4999,"Asia/Dhaka"],
  "meherpur":[23.7623,88.6318,"Asia/Dhaka"],
  "gopalganj":[23.0051,89.8266,"Asia/Dhaka"],
  "faridpur":[23.6071,89.8429,"Asia/Dhaka"],
  "madaripur":[23.1641,90.1897,"Asia/Dhaka"],
  "shariatpur":[23.2200,90.3470,"Asia/Dhaka"],
  "rajbari":[23.7574,89.6444,"Asia/Dhaka"],
  "manikganj":[23.8617,90.0003,"Asia/Dhaka"],
  "munshiganj":[23.5422,90.5305,"Asia/Dhaka"],
  "narsingdi":[23.9322,90.7151,"Asia/Dhaka"],
  "kishoreganj":[24.4449,90.7766,"Asia/Dhaka"],
  "pirojpur":[22.5700,89.9700,"Asia/Dhaka"],
  "bhola":[22.6859,90.6482,"Asia/Dhaka"],
  "patuakhali":[22.3596,90.3299,"Asia/Dhaka"],
  "barguna":[22.0953,90.1121,"Asia/Dhaka"],
  "jhalokati":[22.6406,90.2000,"Asia/Dhaka"],
  "lakshmipur":[22.9446,90.8286,"Asia/Dhaka"],
  "chandpur":[23.2321,90.6659,"Asia/Dhaka"],
  "bandarban":[22.1953,92.1864,"Asia/Dhaka"],
  "rangamati":[22.7324,92.2985,"Asia/Dhaka"],
  "khagrachhari":[23.1193,91.9847,"Asia/Dhaka"],
  "ipoh":[4.5975,101.0901,"Asia/Kuala_Lumpur"],
  "kuala lumpur":[3.1390,101.6869,"Asia/Kuala_Lumpur"],
  "johor bahru":[1.4927,103.7414,"Asia/Kuala_Lumpur"],
  "george town":[5.4141,100.3288,"Asia/Kuala_Lumpur"], "penang":[5.4141,100.3288,"Asia/Kuala_Lumpur"],
  "shah alam":[3.0851,101.5324,"Asia/Kuala_Lumpur"],
  "singapore":[1.3521,103.8198,"Asia/Singapore"],
  "jakarta":[-6.2088,106.8456,"Asia/Jakarta"],
  "makkah":[21.3891,39.8579,"Asia/Riyadh"], "mecca":[21.3891,39.8579,"Asia/Riyadh"],
  "madinah":[24.5247,39.5692,"Asia/Riyadh"], "medina":[24.5247,39.5692,"Asia/Riyadh"],
  "riyadh":[24.7136,46.6753,"Asia/Riyadh"],
  "dubai":[25.2048,55.2708,"Asia/Dubai"],
  "abu dhabi":[24.4539,54.3773,"Asia/Dubai"],
  "doha":[25.2854,51.5310,"Asia/Qatar"],
  "kuwait city":[29.3759,47.9774,"Asia/Kuwait"],
  "istanbul":[41.0082,28.9784,"Europe/Istanbul"],
  "ankara":[39.9334,32.8597,"Europe/Istanbul"],
  "karachi":[24.8608,67.0011,"Asia/Karachi"],
  "lahore":[31.5204,74.3587,"Asia/Karachi"],
  "delhi":[28.6139,77.2090,"Asia/Kolkata"], "new delhi":[28.6139,77.2090,"Asia/Kolkata"],
  "kolkata":[22.5726,88.3639,"Asia/Kolkata"],
  "mumbai":[19.0760,72.8777,"Asia/Kolkata"],
  "new york":[40.7128,-74.0060,"America/New_York"],
  "toronto":[43.6532,-79.3832,"America/Toronto"],
  "sydney":[-33.8688,151.2093,"Australia/Sydney"],
  "perth":[-31.9505,115.8605,"Australia/Perth"]
};
/* Fill in coordinates + timezone for a saved city-name location from
   the built-in table, when no coordinates were ever stored for it.
   Tagged with the location's own locId, like API-resolved coordinates,
   so they are only ever used for THIS city. */
function resolveCityCoordsOffline(){
  if (!settings.city) return;
  const hit = CITY_COORDS[String(settings.city).trim().toLowerCase()];
  if (!hit) return;
  if (!settings.locId) settings.locId = cityKeyOf(settings.city, settings.country);
  /* Fix #12: fill the timezone from the built-in table even when
     coordinates already exist (GPS / an older save) — without it,
     locNow() falls back to the device clock until the API answers,
     and offline the timezone bug would come back. */
  if ((!settings.tzName || settings.tzLoc !== settings.locId) && hit[2]){
    settings.tzName = hit[2]; settings.tzLoc = settings.locId; saveSettings();
  }
  if (settings.lat != null && settings.lon != null) return;
  settings.lat = hit[0]; settings.lon = hit[1];
  settings.coordsLoc = settings.locId;
  saveSettings();
}
async function fetchTimings(){
  /* No location set yet → no times at all (never a default city). */
  if (!hasLocation()){ timings = null; return false; }
  const date = ddmmyyyy(locNow());
  resolveCityCoordsOffline();
  /* On-device calculation FIRST whenever coordinates are usable: it
     cannot be blocked by any browser or network, so the home screen
     shows real times immediately. The official API then refines them
     in the background whenever it answers (and refreshes the cache,
     the official Hijri date and the Qibla coordinates). */
  const coordsUsable = settings.lat != null && settings.lon != null
    && (settings.useCoords || (!!settings.locId && settings.coordsLoc === settings.locId));
  const local = coordsUsable ? computeTimingsLocal(locNow()) : null;
  if (local){
    timings = local; timingsDate = date;
    if (!hijriInfo) hijriInfo = hijriFromGregorian(locNow());
    fetchTimingsFromApi(date).then(ok=>{ if (ok){ try { renderDates(); renderPrayers(); renderHomeLocation(); } catch(e){} } }).catch(()=>{});
    return true;
  }
  if (await fetchTimingsFromApi(date)) return true;
  /* Offline cache — valid ONLY for the location and date it was made
     for. A previous version also served the cache of ANY city/date as
     a last resort: after changing location, the old city's times kept
     showing under the new city's name. That fallback is gone. */
  const c = store.get("timings_cache", null);
  if (c && c.timings && c.date === date && settings.locId && c.loc === settings.locId) { timings = c.timings; hijriInfo = c.hijri; timingsDate = c.date; toast(t("offline")); return true; }
  return false;
}
/* Official times from the Aladhan API. Two attempts: one flaky request
   must not leave the home screen empty. On success this also stores
   the API-resolved coordinates and timezone for the location. */
async function fetchTimingsFromApi(date){
  const url = settings.useCoords
    ? `${ALADHAN}/timings/${date}?latitude=${settings.lat}&longitude=${settings.lon}&method=${effMethod()}&school=${effSchool()}`
    : `${ALADHAN}/timingsByCity/${date}?city=${encodeURIComponent(settings.city)}&country=${encodeURIComponent(settings.country)}&method=${effMethod()}&school=${effSchool()}`;
  for (let attempt = 0; attempt < 2; attempt++){
    try {
      const j = await fetchJson(url, 12000);
      if (!j || j.code !== 200 || !j.data || !j.data.timings) throw new Error("API "+(j && j.code));
      timings = j.data.timings; hijriInfo = j.data.date.hijri; timingsDate = date;
      /* When only a city name is set, keep the coordinates the API
         resolved for it — the Qibla bearing and the offline calculator
         need real lat/lon. They are tagged with the current locId so
         they are only ever used for THIS city. The API's timezone for
         this location is remembered the same way, so the offline
         calculator can work in the location's own timezone. */
      let dirty = false;
      if (settings.lat == null && j.data.meta && isFinite(+j.data.meta.latitude) && isFinite(+j.data.meta.longitude)){
        settings.lat = +(+j.data.meta.latitude).toFixed(4); settings.lon = +(+j.data.meta.longitude).toFixed(4);
        settings.coordsLoc = settings.locId; dirty = true;
      }
      if (j.data.meta && j.data.meta.timezone && settings.tzLoc !== settings.locId){
        settings.tzName = j.data.meta.timezone; settings.tzLoc = settings.locId; dirty = true;
      }
      if (dirty) saveSettings();
      store.set("timings_cache", {timings, hijri: hijriInfo, date, city: settings.city, loc: settings.locId});
      return true;
    } catch(e){ if (attempt === 0) await delay(1200); }
  }
  return false;
}
/* ---------------- local prayer-time calculation (offline) ----------------
   Standard PrayTimes solar algorithm. Method angle table mirrors the
   method list in Settings; Asr factor follows the selected school.
   Times may differ from the official API by a minute or two — the API
   stays primary whenever it answers. */
const METHOD_PARAMS = {1:[18,18],2:[15,15],3:[18,17],4:[18.5,-90],5:[19.5,17.5],8:[19.5,-90],
  11:[20,18],13:[18,17],14:[16,15],15:[18,18],16:[18,18],17:[20,18],18:[18,18],19:[18,18],
  20:[20,18],21:[19,17.5],22:[18,18]};
/* UTC offset (hours) of an IANA timezone at a given moment, via Intl —
   lets the offline calculator produce times in the SELECTED location's
   timezone rather than the phone's. */
function tzOffsetHours(tzName, date){
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {timeZone: tzName, hour12: false,
      year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit"});
    const parts = {};
    dtf.formatToParts(date).forEach(p=>{ parts[p.type] = p.value; });
    const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, (+parts.hour) % 24, +parts.minute, +parts.second);
    return (asUTC - Math.floor(date.getTime()/1000)*1000) / 3600000;
  } catch(e){ return -date.getTimezoneOffset()/60; }
}
/* Fix #12 — timezone: the device clock and the prayer location can be
   in different timezones (phone in Malaysia UTC+8, location Jashore
   UTC+6; the same happens with GPS while travelling). Prayer times are
   always in the LOCATION's local time, so "now" must be read in the
   location's timezone before any comparison — otherwise the device
   clock is read as if it were the location's clock and the next
   prayer, countdown, sky, alarms and even the fetched day are all
   wrong by the timezone difference. locNow() returns a Date whose
   wall-clock fields are the location's local time (the device time
   when no location timezone is known). locAbs() converts such a
   location wall-clock Date back to the absolute instant it means,
   for native alarms. (DST zones: the offset is read at the given
   instant, so a wall-clock within an hour of a DST change can be off
   by that hour — accepted; the user's zones have no DST.) */
function locOffsetMinutes(date){
  if (settings.tzName && settings.locId && settings.tzLoc === settings.locId)
    return Math.round(tzOffsetHours(settings.tzName, date) * 60);
  return -date.getTimezoneOffset();
}
function locNow(now=new Date()){
  const off = locOffsetMinutes(now), dev = -now.getTimezoneOffset();
  return off === dev ? new Date(now.getTime()) : new Date(now.getTime() + (off - dev)*60000);
}
function locAbs(d){
  const off = locOffsetMinutes(d), dev = -d.getTimezoneOffset();
  return off === dev ? d : new Date(d.getTime() - (off - dev)*60000);
}
function computeTimingsLocal(date){
  if (settings.lat == null || settings.lon == null) return null;
  const lat = +settings.lat, lon = +settings.lon;
  if (!isFinite(lat) || !isFinite(lon)) return null;
  /* Use the current location's own timezone when the API has provided
     it for this location; only otherwise fall back to the device's. */
  const tz = (settings.tzName && settings.locId && settings.tzLoc === settings.locId)
    ? tzOffsetHours(settings.tzName, date) : -date.getTimezoneOffset()/60;
  const D2R = Math.PI/180, R2D = 180/Math.PI;
  const fix360 = a => ((a % 360) + 360) % 360;
  const fix24 = a => ((a % 24) + 24) % 24;
  const julian = (y,m,d) => {
    if (m <= 2){ y -= 1; m += 12; }
    const A = Math.floor(y/100), B = 2 - A + Math.floor(A/4);
    return Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + d + B - 1524.5;
  };
  const jd = julian(date.getFullYear(), date.getMonth()+1, date.getDate()) - lon/(15*24) - 2451545.0;
  const sunPos = d => {
    const g = fix360(357.529 + 0.98560028*d);
    const q = fix360(280.459 + 0.98564736*d);
    const L = fix360(q + 1.915*Math.sin(g*D2R) + 0.020*Math.sin(2*g*D2R));
    const e = 23.439 - 0.00000036*d;
    const RA = R2D*Math.atan2(Math.cos(e*D2R)*Math.sin(L*D2R), Math.cos(L*D2R))/15;
    const decl = Math.asin(Math.sin(e*D2R)*Math.sin(L*D2R));
    const eqt = q/15 - fix24(RA);
    return {decl, eqt};
  };
  const midDay = d => fix24(12 - sunPos(d).eqt + tz - lon/15);
  const sunAngleTime = (angle, d, dir) => {
    const decl = sunPos(d).decl;
    const noon = midDay(d);
    const t = (1/15)*R2D*Math.acos((-Math.sin(angle*D2R) - Math.sin(decl)*Math.sin(lat*D2R)) / (Math.cos(decl)*Math.cos(lat*D2R)));
    return noon + (dir === "ccw" ? -t : t);
  };
  const asrTime = (factor, d) => {
    const decl = sunPos(d).decl;
    const angle = -Math.atan(1/(factor + Math.tan(Math.abs(lat*D2R - decl))))*R2D;
    return sunAngleTime(angle, d, "cw");
  };
  const params = METHOD_PARAMS[effMethod()] || [18,17];
  const fajrA = params[0], ishaV = params[1];
  const fajr = sunAngleTime(fajrA, jd, "ccw");
  const sunrise = sunAngleTime(0.833, jd, "ccw");
  const dhuhr = midDay(jd);
  const asr = asrTime(effSchool() === 1 ? 2 : 1, jd);
  const sunset = sunAngleTime(0.833, jd, "cw");
  const isha = ishaV < 0 ? sunset + (-ishaV)/60 : sunAngleTime(ishaV, jd, "cw");
  if ([fajr,sunrise,dhuhr,asr,sunset,isha].some(v=>!isFinite(v))) return null;
  const night = fix24(sunrise + 24 - sunset);
  const fmt = h => { const t2 = fix24(h); const hh = Math.floor(t2), mm = Math.floor((t2-hh)*60); return `${pad2(hh)}:${pad2(mm)}`; };
  return { Fajr: fmt(fajr), Sunrise: fmt(sunrise), Dhuhr: fmt(dhuhr), Asr: fmt(asr),
    Sunset: fmt(sunset), Maghrib: fmt(sunset), Isha: fmt(isha),
    Imsak: fmt(fajr - 10/60), Midnight: fmt(sunset + night/2),
    Firstthird: fmt(sunset + night/3), Lastthird: fmt(sunrise - night/3) };
}
/* Arithmetic (civil) Hijri date — fallback only, used when the API's
   official Hijri date is unavailable; may differ by a day. */
function hijriFromGregorian(d){
  const jd = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) + 2440588);
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631*n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50*l) / 17719) + Math.floor(l / 5670) * Math.floor((43*l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719*j) / 50) - Math.floor(j / 16) * Math.floor((15238*j) / 43) + 29;
  const month = Math.floor((24*l) / 709), day = l - Math.floor((709*month) / 24), year = 30*n + j - 30;
  const names = ["Muharram","Safar","Rabiʿ al-awwal","Rabiʿ al-thani","Jumādá al-ūlá","Jumādá al-ākhirah","Rajab","Shaʿbān","Ramadān","Shawwāl","Dhū al-Qaʿdah","Dhū al-Ḥijjah"];
  return { day: String(day), month: { number: month, en: names[month-1] || "" }, year: String(year) };
}
function nextPrayer(now=locNow()){
  const mins = now.getHours()*60 + now.getMinutes();
  for (const p of PRAYER_IDS){
    const tm = toMin(timings[p]); if (tm!=null && tm > mins) return {id:p, mins:tm};
  }
  return {id:"Fajr", mins: toMin(timings.Fajr)+1440, tomorrow:true};
}
/* Azan offset (earlier/later) is set on the per-prayer detail page
   (Fix #4 §9): a slider from -30 to +30 minutes in 1-minute steps.
   offsetText / adjTimeStr describe an offset for display. */
function offsetText(o){
  if (o===0) return Lb("সময়মতো", "On time");
  const n = num(Math.abs(o));
  return o>0
    ? (Lb(`${n} মিনিট পরে`, `${n} min later`))
    : (Lb(`${n} মিনিট আগে`, `${n} min earlier`));
}
function adjTimeStr(pid, o){
  const base = timings ? toMin(timings[pid]) : null; if (base==null) return "—";
  const m = ((base + o) % 1440 + 1440) % 1440;
  return fmtTime(`${pad2(Math.floor(m/60))}:${pad2(m%60)}`);
}
/* Prayer window: a prayer is valid from its start until the next
   prayer's start (Fajr → Sunrise, Dhuhr → Asr, Asr → Maghrib,
   Maghrib → Isha, Isha → next day's Fajr). */
function prayerWindowEnd(pid, now=locNow()){
  const order = ["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"];
  const i = order.indexOf(pid);
  if (i < 0) return null;
  if (pid === "Isha"){
    const tm = computeTimingsLocal(new Date(now.getFullYear(), now.getMonth(), now.getDate()+1));
    return tm ? toMin(tm.Fajr) + 1440 : toMin(timings.Fajr) + 1440;
  }
  const nextId = order[i+1];
  const t = toMin(timings[nextId]);
  return t == null ? null : t;
}
/* Forbidden windows (Fix #4 §1; Fix #11; Fix #15): morning = sunrise →
   sunrise+15, midday = dhuhr−4 → dhuhr+2 (the user's stated window:
   12:57–13:03 on 19 Nov Ipoh, Dhuhr 13:01), evening = maghrib−15 →
   maghrib (~15 min before sunset, as the user stated). */
function forbiddenWindows(){
  if (!timings) return [];
  const sunrise = toMin(timings.Sunrise), dhuhr = toMin(timings.Dhuhr), magh = toMin(timings.Maghrib);
  if (sunrise==null || dhuhr==null || magh==null) return [];
  return [
    {id:"ForbMorning", bn:"নিষিদ্ধ সময় (সকাল)", en:"Forbidden time (morning)", start:sunrise, end:sunrise+15},
    {id:"ForbNoon", bn:"নিষিদ্ধ সময় (দুপুর)", en:"Forbidden time (midday)", start:dhuhr-4, end:dhuhr+2},
    {id:"ForbEvening", bn:"নিষিদ্ধ সময় (সন্ধ্যা)", en:"Forbidden time (evening)", start:magh-15, end:magh}
  ];
}
/* The countdown ring (Fix #4 §1; Fix #11; Fix #15) shows the CURRENT
   event — the prayer whose window we are in, counting down to the end
   of its window (the next prayer's start) — or the next event if no
   prayer is current. Two rules keep it honest, matching the reference
   the user sent (19 Nov 18:36: Asr, "শেষ হতে বাকি ০০:২১:৫৫" to 18:58):
   (1) if we are inside a forbidden window, the ring counts down to its
   end; (2) a forbidden window must NEVER displace a prayer that can
   still be prayed — while a prayer is in its valid window the ring
   shows THAT prayer, counting to the end of its window (the next
   prayer's start), NOT to the forbidden window's start. `state` tells
   the ring whether the event is running ("current" → "শেষ হতে বাকি")
   or still to come ("upcoming" → "শুরু হতে বাকি"). Returns {name,
   at: Date, prev: Date, kind, id, state}. */
function nextEvent(now=locNow()){
  const dayStart = new Date(now); dayStart.setHours(0,0,0,0);
  const atMin = m => { const d = new Date(dayStart); d.setMinutes(m); return d; };
  const cands = [];
  for (const p of PRAYER_IDS){
    const tm = toMin(timings[p]); if (tm==null) continue;
    cands.push({kind:"prayer", id:p, name:pname(p), at:atMin(tm + (settings.offsets[p] || 0))});
  }
  const lt = toMin(timings.Lastthird);
  if (lt != null) cands.push({kind:"tahajjud", id:"Tahajjud", name:Lb("তাহাজ্জুদ", "Tahajjud"), at:atMin(lt)});
  for (const w of forbiddenWindows()){
    cands.push({kind:"forbidden", id:w.id, name:Lb(w.bn, w.en), at:atMin(w.start), end:atMin(w.end)});
  }
  // inside a forbidden window? count down to its end
  for (const w of forbiddenWindows()){
    const s = atMin(w.start), e = atMin(w.end);
    if (now >= s && now < e) return {kind:"forbidden", id:w.id, name:Lb(w.bn, w.en), at:e, prev:s, state:"current"};
  }
  // A prayer is in its valid window (e.g. 18:36, Asr 16:24–18:58):
  // show THAT prayer, counting down to the end of its window — the
  // next prayer's start — even if a forbidden window starts inside
  // it. The forbidden window takes over only when the clock is
  // actually inside it (rule above).
  for (const p of PRAYER_IDS){
    const start = toMin(timings[p]); if (start==null) continue;
    const end = prayerWindowEnd(p, now); if (end==null) continue;
    const s = atMin(start), e = atMin(end);
    if (now >= s && now < e){
      return {kind:"prayer", id:p, name:pname(p), at:e, prev:s, state:"current"};
    }
  }
  cands.sort((a,b)=>a.at - b.at);
  let next = cands.find(c=>c.at > now);
  if (!next){ // everything today passed — tomorrow's first prayer
    const f = toMin(timings.Fajr);
    const at = atMin(f + (settings.offsets.Fajr || 0)); at.setDate(at.getDate()+1);
    next = {kind:"prayer", id:"Fajr", name:pname("Fajr"), at};
  }
  const prev = cands.filter(c=>c.at <= now).sort((a,b)=>b.at - a.at)[0];
  next.prev = prev ? prev.at : new Date(next.at.getTime() - 3600000);
  next.state = "upcoming";
  return next;
}
const PRAYER_ICONS = {Fajr:"🌅", Dhuhr:"☀️", Asr:"🌤️", Maghrib:"🌇", Isha:"🌙"};
function renderPrayers(){
  const list = $("#prayer-list");
  if(!timings){
    if (!hasLocation()){
      list.innerHTML = `<p class="muted" style="line-height:1.7">${Lb("নামাজের সময় দেখতে আগে আপনার অবস্থান সেট করুন — কোনো শহর আগে থেকে সেট করা নেই।", "Set your location first to see prayer times — no city is pre-set.")}</p>
      <button class="btn block mt" data-open-locsetup="1">📍 ${Lb("অবস্থান সেট করুন", "Set location")}</button>`;
    } else {
      list.innerHTML = `<p class="muted">${t("loadErr")}</p>`;
    }
    return;
  }
  const now = locNow(); const nx = nextPrayer(now);
  const pc = $("#prayer-city"); if (pc) pc.textContent = hasLocation() ? `${settings.city}, ${settings.country}` : "—";
  renderHomeLocation();
  list.innerHTML = PRAYER_IDS.map(pid=>{
    const p = PRAYERS.find(x=>x.id===pid);
    const isNext = pid===nx.id && !nx.tomorrow;
    const done = isDone(pid);
    const off = settings.offsets[pid] || 0;
    const name = pname(pid);
    const end = prayerWindowEnd(pid, now);
    const endStr = end==null ? null : `${pad2(Math.floor((end%1440)/60))}:${pad2(end%60)}`;
    const range = endStr ? `${num(timings[pid])} - ${num(endStr)}` : num(timings[pid]);
    const dot = (isNext || off!==0) ? `<span class="orange-dot" aria-hidden="true"></span>` : "";
    return `<div class="prayer-row ${isNext?"next":""} tappable" data-detail="${pid}" role="button" tabindex="0" title="${Lb("অ্যালার্ম সেটিংস খুলুন", "Open alarm settings")}">
      <span class="p-ic">${PRAYER_ICONS[pid]||"🕌"}</span><span class="p-name">${name}</span>
      <span class="p-range">${dot}${range}</span>
      <button class="done-circle ${done?"done":""}" data-pray="${pid}" title="নামাজ পড়েছি" aria-label="নামাজ পড়েছি"></button></div>`;
  }).join("");
  $$("#prayer-list [data-pray]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); togglePrayer(b.dataset.pray); });
  $$("#prayer-list [data-detail]").forEach(r=>{
    r.onclick=e=>{ if (e.target.closest("[data-pray]")) return; openPrayerDetail(r.dataset.detail); };
    r.onkeydown=e=>{ if (e.key==="Enter" || e.key===" "){ e.preventDefault(); openPrayerDetail(r.dataset.detail); } };
  });
  // countdown ring: next event (prayer / tahajjud / forbidden window)
  const ev = nextEvent(now);
  const diff = Math.max(0, ev.at - now);
  const h = Math.floor(diff/3600000), m = Math.floor(diff%3600000/60000), s = Math.floor(diff%60000/1000);
  const ringName = $("#ring-name"), ringCount = $("#ring-count"), ringFg = $("#ring-fg"),
        ringLabel = $("#ring-label"), ringSub = $("#ring-sub");
  if (ringName){
    // Fix #16 + Fix #17 (user reversed the countdown part): during a
    // forbidden window the ring name shows the message "এখন সালাতের
    // নিষিদ্ধ সময়, এই সময়ে নামাজ পড়া নিষিদ্ধ" — AND the "শেষ হতে
    // বাকি" countdown IS shown too. Otherwise the ring shows the
    // prayer name + countdown as before.
    const isForbidNow = ev.kind==="forbidden" && ev.state==="current";
    ringName.textContent = isForbidNow
      ? Lb("এখন সালাতের নিষিদ্ধ সময়, এই সময়ে নামাজ পড়া নিষিদ্ধ", "It is now a forbidden time for prayer; praying is forbidden at this time")
      : ev.name;
    ringName.classList.toggle("forbid-msg", isForbidNow);
  }
  if (ringCount) ringCount.textContent = `${num(pad2(h))}:${num(pad2(m))}:${num(pad2(s))}`;
  if (ringLabel) ringLabel.textContent = ev.kind==="prayer"
    ? (ev.state==="current" ? Lb("বর্তমান নামাজ", "Current prayer") : Lb("পরের নামাজ", "Next prayer"))
    : ev.kind==="tahajjud" ? Lb("তাহাজ্জুদ", "Tahajjud") : Lb("নিষিদ্ধ সময়", "Forbidden time");
  if (ringSub) ringSub.textContent = ev.state==="current" ? Lb("শেষ হতে বাকি", "Time remaining") : Lb("শুরু হতে বাকি", "Starts in");
  if (ringFg){
    const C = 2*Math.PI*96;
    const prog = Math.min(1, Math.max(0, (now - ev.prev) / (ev.at - ev.prev)));
    ringFg.style.strokeDasharray = String(C);
    ringFg.style.strokeDashoffset = String(C * (1 - prog));
  }
  const sky = skyPeriod();
  const hero = $("#ring-hero"); if (hero) hero.dataset.sky = sky;
  const skyIc = $("#ring-sky-ic");
  if (skyIc) skyIc.textContent = sky === "day" || sky === "golden" ? "☀️" : sky === "night" ? "🌙" : sky === "dawn" ? "🌤️" : "🌇";
  const pl = $("#pill-loc");
  if (pl) pl.textContent = hasLocation() ? `📍 ${settings.city}, ${settings.country} ⌄` : `📍 ${Lb("অবস্থান সেট করুন", "Set location")}`;
  const ps = $("#pill-sun");
  if (ps) ps.textContent = `🌅 ${fmtTime(timings.Sunrise)} • 🌇 ${fmtTime(timings.Sunset)}`;
  renderNafl();
  renderForbidden();
  updateNaflStrip();
}

/* ---------------- realistic sky (time-of-day) ---------------- */
function skyPeriod(){
  if (!timings) return "day";
  const now = locNow(); const mins = now.getHours()*60+now.getMinutes();
  const fajr = toMin(timings.Fajr), sunrise = toMin(timings.Sunrise), asr = toMin(timings.Asr), magh = toMin(timings.Maghrib);
  if (mins >= fajr-30 && mins < sunrise+30) return "dawn";
  if (mins >= sunrise+30 && mins < asr) return "day";
  if (mins >= asr && mins < magh) return "golden";
  if (mins >= magh && mins < magh+45) return "dusk";
  return "night";
}

/* ---------------- forbidden prayer times ---------------- */
function renderForbidden(){
  if (!timings) return;
  // Fix #16: ranges come from forbiddenWindows() itself — the old code
  // hardcoded dhuhr−10 here, so the midday cell still showed 12:50–
  // 13:00 after Fix #15 moved the window to 12:56–13:02.
  const fw = forbiddenWindows();
  if (fw.length < 3) return;
  const hhmm = mins => { const h=Math.floor(mins/60)%24, m=mins%60; return fmtTime(`${pad2(h)}:${pad2(m)}`); };
  const cells = [
    [Lb("সকাল", "Morning"), `${hhmm(fw[0].start)} – ${hhmm(fw[0].end)}`],
    [Lb("দুপুর", "Midday"), `${hhmm(fw[1].start)} – ${hhmm(fw[1].end)}`],
    [Lb("সন্ধ্যা", "Evening"), `${hhmm(fw[2].start)} – ${hhmm(fw[2].end)}`]
  ];
  $("#forbidden-list").innerHTML = `<div class="forbid-grid">` + cells.map(c=>`<div class="forbid-cell"><b>${c[0]}</b><span>${c[1]}</span></div>`).join("") + `</div>`;
}
/* ---------------- Nafl (voluntary) prayer times ----------------
   Layout follows the reference design: icon rows for Duha, Zawal,
   Awwabin and Tahajjud (with the last-third-of-night sub-line), a
   Sehri / Iftar strip with a live countdown, and an animated
   "view larger" expand. Every time is computed from the app's own
   prayer times for the saved location — nothing is copied from the
   reference. Rows are rebuilt only when the day, language or city
   changes (naflBuiltKey), so the entrance animation never restarts
   on the 1-second re-render; only the countdown text ticks. */
const NAFL_STR = {
  en:{refSee:"See reference",duha:"Duha",zawal:"Zawal begins",awwabin:"Awwabin",tahajjud:"Tahajjud",afterMaghrib:"After Maghrib",afterIsha:"After Isha",lastThirdStart:"Last third of night begins",nextSehri:"Next Sehri",nextIftar:"Next Iftar",sehriLeft:"Time to Sehri",iftarLeft:"Time to Iftar",viewMore:"View larger",viewLess:"View smaller",ishraq:"Ishraq",sehriEnds:"Sehri ends (Imsak)",iftarAt:"Iftar (Maghrib)",refNote:"Duha: Sahih Muslim 720 • Last third of the night: Sahih al-Bukhari 1145, Sahih Muslim 758 • Awwabin: Jami' at-Tirmidhi 435 • Zawal: the start of Dhuhr time"},
  bn:{refSee:"রেফারেন্স দেখুন",duha:"দুহা",zawal:"জাওয়াল শুরু",awwabin:"আওয়াবিন",tahajjud:"তাহাজ্জুদ",afterMaghrib:"মাগরিবের পর",afterIsha:"ইশার পর",lastThirdStart:"রাতের শেষ ১/৩ শুরু",nextSehri:"পরবর্তী সাহরি",nextIftar:"পরবর্তী ইফতার",sehriLeft:"সাহরির বাকি",iftarLeft:"ইফতারের বাকি",viewMore:"বড় করে দেখুন",viewLess:"ছোট করে দেখুন",ishraq:"ইশরাক",sehriEnds:"সেহরি শেষ (ইমসাক)",iftarAt:"ইফতার (মাগরিব)",refNote:"দুহা: সহিহ মুসলিম ৭২০ • রাতের শেষ তৃতীয়াংশ: সহিহ বুখারি ১১৪৫, সহিহ মুসলিম ৭৫৮ • আওয়াবিন: জামি' তিরমিজি ৪৩৫ • জাওয়াল: যোহরের ওয়াক্ত শুরু"},
  ar:{refSee:"عرض المرجع",duha:"الضحى",zawal:"يبدأ الزوال",awwabin:"الأوابين",tahajjud:"التهجد",afterMaghrib:"بعد المغرب",afterIsha:"بعد العشاء",lastThirdStart:"يبدأ الثلث الأخير من الليل",nextSehri:"السحور القادم",nextIftar:"الإفطار القادم",sehriLeft:"المتبقي للسحور",iftarLeft:"المتبقي للإفطار",viewMore:"عرض أكبر",viewLess:"عرض أصغر",ishraq:"الإشراق",sehriEnds:"انتهاء السحور (الإمساك)",iftarAt:"الإفطار (المغرب)"},
  ur:{refSee:"حوالہ دیکھیں",duha:"چاشت",zawal:"زوال شروع",awwabin:"اوابین",tahajjud:"تہجد",afterMaghrib:"مغرب کے بعد",afterIsha:"عشاء کے بعد",lastThirdStart:"رات کا آخری تیسرا حصہ شروع",nextSehri:"اگلی سحری",nextIftar:"اگلا افطار",sehriLeft:"سحری میں باقی",iftarLeft:"افطار میں باقی",viewMore:"بڑا کرکے دیکھیں",viewLess:"چھوٹا کریں",ishraq:"اشراق",sehriEnds:"سحری ختم (امساک)",iftarAt:"افطار (مغرب)"},
  ms:{refSee:"Lihat rujukan",duha:"Duha",zawal:"Zawal bermula",awwabin:"Awwabin",tahajjud:"Tahajud",afterMaghrib:"Selepas Maghrib",afterIsha:"Selepas Isyak",lastThirdStart:"Sepertiga malam terakhir bermula",nextSehri:"Sahur seterusnya",nextIftar:"Iftar seterusnya",sehriLeft:"Berbaki ke sahur",iftarLeft:"Berbaki ke iftar",viewMore:"Lihat lebih besar",viewLess:"Lihat lebih kecil",ishraq:"Isyraq",sehriEnds:"Sahur tamat (Imsak)",iftarAt:"Iftar (Maghrib)"},
  id:{refSee:"Lihat referensi",duha:"Duha",zawal:"Zawal dimulai",awwabin:"Awwabin",tahajjud:"Tahajud",afterMaghrib:"Setelah Maghrib",afterIsha:"Setelah Isya",lastThirdStart:"Sepertiga malam terakhir dimulai",nextSehri:"Sahur berikutnya",nextIftar:"Berbuka berikutnya",sehriLeft:"Sisa ke sahur",iftarLeft:"Sisa ke berbuka",viewMore:"Lihat lebih besar",viewLess:"Lihat lebih kecil",ishraq:"Isyraq",sehriEnds:"Sahur berakhir (Imsak)",iftarAt:"Berbuka (Maghrib)"},
  tr:{refSee:"Kaynağa bakın",duha:"Duhâ",zawal:"Zeval başlıyor",awwabin:"Evvabin",tahajjud:"Teheccüd",afterMaghrib:"Akşamdan sonra",afterIsha:"Yatsıdan sonra",lastThirdStart:"Gecenin son üçte biri başlıyor",nextSehri:"Sonraki sahur",nextIftar:"Sonraki iftar",sehriLeft:"Sahura kalan",iftarLeft:"İftara kalan",viewMore:"Büyük göster",viewLess:"Küçük göster",ishraq:"İşrak",sehriEnds:"Sahur bitiyor (İmsak)",iftarAt:"İftar (Akşam)"},
  fa:{refSee:"مشاهده مرجع",duha:"ضحی",zawal:"شروع زوال",awwabin:"اوابین",tahajjud:"تهجد",afterMaghrib:"بعد از مغرب",afterIsha:"بعد از عشاء",lastThirdStart:"ثلث آخر شب شروع می‌شود",nextSehri:"سحری بعدی",nextIftar:"افطار بعدی",sehriLeft:"باقی تا سحری",iftarLeft:"باقی تا افطار",viewMore:"نمایش بزرگ‌تر",viewLess:"نمایش کوچک‌تر",ishraq:"اشراق",sehriEnds:"پایان سحری (امساک)",iftarAt:"افطار (مغرب)"},
  fr:{refSee:"Voir la référence",duha:"Duha",zawal:"Début du zawal",awwabin:"Awwabin",tahajjud:"Tahajjud",afterMaghrib:"Après le Maghrib",afterIsha:"Après l'Icha",lastThirdStart:"Le dernier tiers de la nuit commence",nextSehri:"Prochain suhoor",nextIftar:"Prochain iftar",sehriLeft:"Temps avant le suhoor",iftarLeft:"Temps avant l'iftar",viewMore:"Voir en grand",viewLess:"Voir en petit",ishraq:"Ishraq",sehriEnds:"Fin du suhoor (Imsak)",iftarAt:"Iftar (Maghrib)"},
  hi:{refSee:"संदर्भ देखें",duha:"दुहा",zawal:"ज़वाल शुरू",awwabin:"अव्वाबीन",tahajjud:"तहज्जुद",afterMaghrib:"मग़रिब के बाद",afterIsha:"इशा के बाद",lastThirdStart:"रात का अंतिम तिहाई शुरू",nextSehri:"अगली सहरी",nextIftar:"अगला इफ़्तार",sehriLeft:"सहरी में शेष",iftarLeft:"इफ़्तार में शेष",viewMore:"बड़ा करके देखें",viewLess:"छोटा करें",ishraq:"इशराक़",sehriEnds:"सहरी समाप्त (इमसाक)",iftarAt:"इफ़्तार (मग़रिब)"},
  ps:{refSee:"حواله وګورئ",duha:"څاښت",zawal:"زوال پیلېږي",awwabin:"اوابین",tahajjud:"تهجد",afterMaghrib:"له ماښام وروسته",afterIsha:"له ماسختن وروسته",lastThirdStart:"د شپې وروستۍ درېیمه برخه پیلېږي",nextSehri:"راتلونکې سحري",nextIftar:"راتلونکی روژه مات",sehriLeft:"سحري ته پاتې",iftarLeft:"روژه مات ته پاتې",viewMore:"لوی وګورئ",viewLess:"کوچنی وګورئ",ishraq:"اشراق",sehriEnds:"سحري پای (امساک)",iftarAt:"روژه مات (ماښام)"},
  ha:{refSee:"Duba tunani",duha:"Duha",zawal:"Zawal ya fara",awwabin:"Awwabin",tahajjud:"Tahajjud",afterMaghrib:"Bayan Magriba",afterIsha:"Bayan Isha'i",lastThirdStart:"Kashi na uku na dare na ƙarshe ya fara",nextSehri:"Sahur na gaba",nextIftar:"Buda baki na gaba",sehriLeft:"Saura zuwa sahur",iftarLeft:"Saura zuwa buda baki",viewMore:"Duba da girma",viewLess:"Duba da ƙarami",ishraq:"Ishraq",sehriEnds:"Ƙarshen sahur (Imsak)",iftarAt:"Buda baki (Magriba)"},
  sw:{refSee:"Tazama marejeo",duha:"Duha",zawal:"Zawal inaanza",awwabin:"Awwabin",tahajjud:"Tahajjud",afterMaghrib:"Baada ya Magharibi",afterIsha:"Baada ya Isha",lastThirdStart:"Theuthi ya mwisho ya usiku inaanza",nextSehri:"Daku inayofuata",nextIftar:"Futari inayofuata",sehriLeft:"Muda hadi daku",iftarLeft:"Muda hadi futari",viewMore:"Tazama kubwa",viewLess:"Tazama ndogo",ishraq:"Ishraq",sehriEnds:"Daku inaisha (Imsak)",iftarAt:"Futari (Magharibi)"},
  ru:{refSee:"См. источник",duha:"Духа",zawal:"Начало заваля",awwabin:"Аввабин",tahajjud:"Тахаджуд",afterMaghrib:"После магриба",afterIsha:"После иши",lastThirdStart:"Начинается последняя треть ночи",nextSehri:"Следующий сухур",nextIftar:"Следующий ифтар",sehriLeft:"До сухура осталось",iftarLeft:"До ифтара осталось",viewMore:"Показать больше",viewLess:"Показать меньше",ishraq:"Ишрак",sehriEnds:"Конец сухура (имсак)",iftarAt:"Ифтар (магриб)"},
  es:{refSee:"Ver referencia",duha:"Duha",zawal:"Comienza el zawal",awwabin:"Awwabin",tahajjud:"Tahajjud",afterMaghrib:"Después del Magrib",afterIsha:"Después del Isha",lastThirdStart:"Comienza el último tercio de la noche",nextSehri:"Próximo suhur",nextIftar:"Próximo iftar",sehriLeft:"Tiempo para el suhur",iftarLeft:"Tiempo para el iftar",viewMore:"Ver más grande",viewLess:"Ver más pequeño",ishraq:"Ishraq",sehriEnds:"Fin del suhur (Imsak)",iftarAt:"Iftar (Magrib)"},
  de:{refSee:"Referenz ansehen",duha:"Duha",zawal:"Zawal beginnt",awwabin:"Awwabin",tahajjud:"Tahajjud",afterMaghrib:"Nach Maghrib",afterIsha:"Nach Ischa",lastThirdStart:"Das letzte Drittel der Nacht beginnt",nextSehri:"Nächster Suhur",nextIftar:"Nächstes Iftar",sehriLeft:"Zeit bis Suhur",iftarLeft:"Zeit bis Iftar",viewMore:"Größer ansehen",viewLess:"Kleiner ansehen",ishraq:"Ishraq",sehriEnds:"Suhur endet (Imsak)",iftarAt:"Iftar (Maghrib)"}
};
const nt = k => (NAFL_STR[settings.lang] || NAFL_STR.en)[k] || NAFL_STR.en[k] || k;
const NAFL_ICONS = {
  sun:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>`,
  mosque:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.8v1.8M12 4.6c2.6 1.7 4.2 3.7 4.2 6.2H7.8c0-2.5 1.6-4.5 4.2-6.2Z"/><path d="M4 21v-7.2M20 21v-7.2M4 13.8h2.4M17.6 13.8H20M2.5 21h19M9.8 21v-3.2a2.2 2.2 0 0 1 4.4 0V21"/></svg>`,
  cloudsun:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="6.5" r="2.4"/><path d="M7 1.8v1.2M2.3 6.5h1.2M3.6 3l.9.9"/><path d="M8 20h9.2a4.2 4.2 0 0 0 .9-8.3 5.8 5.8 0 0 0-11.3 1.2A3.9 3.9 0 0 0 8 20Z"/></svg>`,
  moon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5Z"/><path d="M17.8 2.8l.55 1.5 1.5.55-1.5.55-.55 1.5-.55-1.5-1.5-.55 1.5-.55Z"/></svg>`
};
let naflBuiltKey = "";
function renderNafl(){
  if (!timings) return;
  const key = [timingsDate, settings.lang, settings.city, settings.country].join("|");
  if (key === naflBuiltKey){ updateNaflStrip(); return; }
  naflBuiltKey = key;
  const sunrise = toMin(timings.Sunrise), dhuhr = toMin(timings.Dhuhr), maghrib = toMin(timings.Maghrib),
        isha = toMin(timings.Isha), fajr = toMin(timings.Fajr), lastThird = toMin(timings.Lastthird);
  const rows = [
    {icon:"sun", name:nt("duha"), val:`${fmt24(sunrise+15)} - ${fmt24(dhuhr-10)}`},
    {icon:"mosque", name:nt("zawal"), val:fmt24(dhuhr)},
    {icon:"cloudsun", name:nt("awwabin"), val:`${nt("afterMaghrib")} - ${fmt24(isha)}`},
    {icon:"moon", name:nt("tahajjud"), val:`${nt("afterIsha")} - ${fmt24(fajr)}`,
     sub: lastThird!=null ? `${nt("lastThirdStart")}: ${fmt24(lastThird)}` : ""}
  ];
  $("#nafl-rows").innerHTML = rows.map((r,i)=>`<div class="nafl-row" style="--i:${i}">
      <span class="nafl-ic">${NAFL_ICONS[r.icon]}</span>
      <span class="nafl-name">${r.name}</span>
      <span class="nafl-val">${r.val}${r.sub?`<small class="nafl-sub"><i class="dot"></i>${r.sub}</small>`:""}</span>
    </div>`).join("");
  const ref = $("#nafl-ref"); if (ref) ref.textContent = nt("refNote");
  $("#nafl-sehri-label").textContent = nt("nextSehri");
  $("#nafl-iftar-label").textContent = nt("nextIftar");
  updateNaflStrip();
}
/* Per-second tick for the Sehri/Iftar strip: static times + the live
   countdown to whichever of Sehri-end (Fajr) / Iftar (Maghrib) is next. */
function updateNaflStrip(){
  if (!timings) return;
  const sehriEl = $("#nafl-sehri"); if (!sehriEl) return;
  const fajr = toMin(timings.Fajr), maghrib = toMin(timings.Maghrib);
  if (fajr==null || maghrib==null) return;
  sehriEl.textContent = fmt24(fajr);
  $("#nafl-iftar").textContent = fmt24(maghrib);
  const now = locNow();
  const nowMin = now.getHours()*60 + now.getMinutes();
  let targetMin, label;
  if (nowMin < fajr){ targetMin = fajr; label = nt("sehriLeft"); }
  else if (nowMin < maghrib){ targetMin = maghrib; label = nt("iftarLeft"); }
  else { targetMin = fajr + 1440; label = nt("sehriLeft"); }
  const nowSec = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
  const diff = Math.max(0, targetMin*60 - nowSec);
  const h = Math.floor(diff/3600), m = Math.floor(diff%3600/60), s = diff%60;
  $("#nafl-count").textContent = `${num(pad2(h))}:${num(pad2(m))}:${num(pad2(s))}`;
  $("#nafl-count-label").textContent = label;
}
function renderDates(){
  const now = locNow();
  const g = Lb(`${bnNum(now.getDate())} ${["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"][now.getMonth()]} ${bnNum(now.getFullYear())}, ${["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"][now.getDay()]}`, now.toDateString());
  const h = hijriInfo ? (Lb(`${bnNum(hijriInfo.day)} ${escHtml(hijriInfo.month.en)} ${bnNum(hijriInfo.year)} হিজরি`, `${hijriInfo.day} ${escHtml(hijriInfo.month.en)} ${hijriInfo.year} AH`)) : "…";
  const b = banglaDate(now);
  $("#date-line").innerHTML = `📅 ${g}<br>🌙 <b>${h}</b> &nbsp;•&nbsp; 🇧🇩 ${Lb(b.text, b.textEn)}`;
  /* Build #19, Fix #1: the home date row is gone — the header date
     line above is the only date on Home. */
}

/* ---------------- salah tracker ---------------- */
function salahLog(){ return store.get("salah", {}); }
function isDone(pid, dateKey=todayKey()){ const l = salahLog(); return !!(l[dateKey] && l[dateKey][pid]); }
function togglePrayer(pid){
  const l = salahLog(); const k = todayKey(); l[k] = l[k] || {};
  l[k][pid] = !l[k][pid]; store.set("salah", l);
  renderPrayers(); renderTracker();
  toast(l[k][pid] ? (Lb("আলহামদুলিল্লাহ, নামাজের হিসাব রাখা হলো ✓", "Alhamdulillah, marked ✓")) : "");
}
function renderTracker(){
  /* Top Features tracker ring (Fix #6/7): today's prayer completion %. */
  const doneToday = PRAYER_IDS.filter(pid=>isDone(pid)).length;
  const fr = $("#feat-tracker-ring");
  if (fr) fr.textContent = num(Math.round(doneToday / PRAYER_IDS.length * 100)) + "%";
  const box = $("#tracker-today");
  if (!box) return;
  box.innerHTML = PRAYER_IDS.map(pid=>{
    const p = PRAYERS.find(x=>x.id===pid);
    return `<div class="prayer-row"><div class="p-name">${pname(p.id)}</div>
      <button class="dotbtn" data-tr="${pid}" style="font-size:26px">${isDone(pid)?"✅":"⭕"}</button></div>`;
  }).join("");
  $$("#tracker-today [data-tr]").forEach(b=>b.onclick=()=>togglePrayer(b.dataset.tr));
  // last 7 days
  const l = salahLog(); const dots = [];
  let done7 = 0, total7 = 0;
  for (let i=6; i>=0; i--){
    const d = locNow(); d.setDate(d.getDate()-i);
    const k = todayKey(d); const day = l[k]||{};
    const c = PRAYER_IDS.filter(p=>day[p]).length;
    done7 += c; total7 += 5;
    const wd = ["রবি","সোম","মঙ্গল","বুধ","বৃহ","শুক্র","শনি"][d.getDay()];
    dots.push(`<div class="wd"><b>${num(c)}/${num(5)}</b>${Lb(wd, ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()])}</div>`);
  }
  $("#week-dots").innerHTML = dots.join("");
  $("#week-summary").textContent = Lb(`${bnNum(done7)}/${bnNum(total7)} নামাজ`, `${done7}/${total7} prayers`);
  // this month
  const now = locNow(); let dm=0, tm=0;
  Object.keys(l).forEach(k=>{ if(k.startsWith(`${now.getFullYear()}-${pad2(now.getMonth()+1)}`)){
    PRAYER_IDS.forEach(p=>{ tm++; if(l[k][p]) dm++; }); } });
  $("#month-summary").textContent = Lb(`এই মাসে এখন পর্যন্ত: ${bnNum(dm)} / ${bnNum(tm)} নামাজ`, `This month so far: ${dm} / ${tm} prayers`);
}

/* ---------------- Quran reading tracker ---------------- */
const TOTAL_AYAH = 6236;
function quranRead(){ return store.get("quran_read", {}); }
function isSurahRead(n){ return !!quranRead()[n]; }
function quranAyahsRead(){
  if (!surahMeta) return 0;
  const r = quranRead(); let sum = 0;
  surahMeta.forEach(s=>{ if (r[s.number]) sum += s.numberOfAyahs; });
  return sum;
}
function renderQuranProgress(){
  const read = quranAyahsRead();
  const pct = Math.round(read/TOTAL_AYAH*100);
  const txt = Lb(`${bnNum(pct)}%`, `${pct}%`);
  const detail = Lb(`${bnNum(read)} / ${bnNum(TOTAL_AYAH)} আয়াত`, `${read} / ${TOTAL_AYAH} ayahs`);
  ["", "2"].forEach(s=>{
    const b = $("#quran-progress-bar"+s), tx = $("#quran-progress-text"+s), d = $("#quran-progress-detail"+s);
    if (b) b.style.width = pct+"%"; if (tx) tx.textContent = txt; if (d) d.textContent = detail;
  });
}
function toggleSurahRead(n){
  const r = quranRead();
  if (r[n]) delete r[n]; else r[n] = true;
  store.set("quran_read", r);
  renderQuranProgress(); renderSurahList($("#surah-search").value, currentQTab);
  const btn = $("#btn-mark-read");
  if (btn) btn.textContent = isSurahRead(currentSurah) ? t("markedRead") : t("markRead");
  toast(isSurahRead(n) ? (Lb("আলহামদুলিল্লাহ — সূরা পড়া শেষ হিসেবে চিহ্নিত ✓", "Alhamdulillah — marked as read ✓")) : (Lb("চিহ্ন সরানো হলো", "Mark removed")));
}

/* ---------------- Daily hadith & reminders feed ---------------- */
function dayOfYear(d=new Date()){ return Math.floor((d - new Date(d.getFullYear(),0,0))/86400000); }
function todayHadith(){
  const list = window.HADITHS || [];
  return list.length ? list[dayOfYear() % list.length] : null;
}
function todayTip(){
  const list = window.ISLAMIC_TIPS || [];
  return list.length ? list[dayOfYear() % list.length] : null;
}
/* Daily Quran verse: a rotating list of well-known verse references
   (surah, ayah). The Arabic text and Bengali meaning are read from the
   app's own bundled Quran text (assets/quran-full.js, loaded lazily on first Quran/Ruqyah open).
   from any server, and a different verse is picked every day. */
const DAILY_VERSES = [[2,152],[2,186],[2,153],[2,45],[3,139],[3,160],[3,173],[3,200],[4,110],[9,51],
  [13,28],[14,7],[20,114],[29,69],[39,53],[40,60],[55,13],[65,3],[94,6],[112,1]];
const trunc = (s, n) => (s && s.length > n) ? s.slice(0, n-1) + "…" : (s || "");
function verseTextFor(d){
  if (!Array.isArray(window.QURAN_AR)) return null;
  const ref = DAILY_VERSES[dayOfYear(d) % DAILY_VERSES.length];
  const surah = ref[0], ayah = ref[1];
  const ar = (window.QURAN_AR[surah-1] || [])[ayah-1];
  if (!ar) return null;
  const bn = Array.isArray(window.QURAN_BN) ? ((window.QURAN_BN[surah-1] || [])[ayah-1] || "") : "";
  const meta = (typeof surahMeta !== "undefined" && surahMeta) ? surahMeta[surah-1] : null;
  const name = meta ? meta.englishName : ("Surah " + surah);
  return { ar, bn, surah, ayah,
    ref: Lb(`সূরা ${name} • আয়াত ${num(ayah)}`, `Surah ${name} • Verse ${ayah}`) };
}
async function renderNotifFeed(){
  const box = $("#notif-feed"); if (!box) return;
  await loadQuranFull(); // bundled text — the verse lookup below reads from it
  const h = todayHadith(), tip = todayTip();
  const fmtD = d => Lb(`${bnNum(d.getDate())} ${["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"][d.getMonth()]} ${bnNum(d.getFullYear())}`, d.toDateString());
  let html = "";
  if (h) html += `<div class="notif-item today"><span class="n-tag">📖 ${Lb("আজকের হাদিস", "Today's Hadith")}</span>
    <div class="n-ar arabic">${h.ar}</div><div class="n-bn">${h.bn}</div>
    <div class="n-date">${fmtD(new Date())}</div></div>`;
  const v = verseTextFor(new Date());
  if (v) html += `<div class="notif-item today"><span class="n-tag">📖 ${Lb("আজকের আয়াত", "Today's Verse")}</span>
    <div class="n-ar arabic">${v.ar}</div><div class="n-bn">${v.bn}</div>
    <div class="n-date">${fmtD(new Date())}</div></div>`;
  if (tip) html += `<div class="notif-item today"><span class="n-tag">🤲 ${Lb("আজকের আমল", "Today's Reminder")}</span>
    <div class="n-bn">${tip.bn}</div><div class="n-date">${fmtD(new Date())}</div></div>`;
  const list = window.HADITHS || [];
  for (let i=1; i<=6; i++){
    const d = new Date(); d.setDate(d.getDate()-i);
    const item = list[dayOfYear(d) % list.length];
    html += `<div class="notif-item"><span class="n-tag">📖 ${Lb("হাদিস", "Hadith")}</span>
      <div class="n-ar arabic">${item.ar}</div><div class="n-bn">${item.bn}</div>
      <div class="n-date">${fmtD(d)}</div></div>`;
  }
  box.innerHTML = html;
}
function updateNotifBadge(){
  const seen = store.get("notif_seen", "");
  const hide = seen === todayKey();
  const b = $("#notif-badge"); if (b) b.classList.toggle("hidden", hide);
}

/* ---------------- local profile (name + Gmail, phone-only) ---------------- */
function renderGreet(){
  const el = $("#greet-line"); if (!el) return;
  if (settings.profileName){
    el.classList.remove("hidden");
    el.textContent = `আসসালামু আলাইকুম, ${settings.profileName} 🤍`;
    el.style.cursor = "pointer";
    el.title = Lb("নাম বদলাতে ট্যাপ করুন", "Tap to change your name");
    el.onclick = ()=>{ editingProfile = true; renderLoginState(); showView("settings"); }; // Fix #27: tapping the salam re-opens the profile form for editing (wired here, not in init, so it survives every re-render)
  } else { el.classList.add("hidden"); el.style.cursor = ""; el.title = ""; el.onclick = null; }
}
/* Login (Fix #3 + Fix #5 + Fix #27 + Fix #34): the profile is NAME-ONLY
   and local-only — no account, no server, NO Gmail login at all (the
   Gmail field and its login button were removed, user 22:10). Once saved,
   the form disappears AND the old saved line ("✓ …" + মুছুন) stays hidden
   (Fix #27) — but the profile card is NOT empty any more: it shows the
   saved name with a clear "✏️ নাম বদলান" button (Fix #34, user 22:10:
   he could not see where to write/change his name), so the name
   write/change option is always visible. Tapping that button — or the
   salam greeting in the header — re-opens the form in edit mode, with
   the current name already filled in; saving hides the form again and
   the name row returns. There is NO profile-photo feature. */
let editingProfile = false;
function renderLoginState(){
  const saved = !!settings.profileName;
  const form = $("#profile-form"), sv = $("#profile-saved"), cur = $("#profile-current");
  if (form) form.classList.toggle("hidden", saved && !editingProfile);
  if (sv) sv.classList.toggle("hidden", !saved || !editingProfile);
  if (cur) cur.classList.toggle("hidden", !saved || editingProfile);
  const nm = $("#profile-saved-name");
  if (nm) nm.textContent = settings.profileName || "";
  const cn = $("#profile-current-name");
  if (cn) cn.textContent = settings.profileName || "";
  /* Fix #34: when the form is shown for editing, the name box already
     holds the current name — the user edits it, never retypes from a
     blank box. */
  const pn = $("#set-profile-name");
  if (pn && form && !form.classList.contains("hidden")) pn.value = settings.profileName || "";
}

/* ---------------- Quran ---------------- */
const RECITERS = [
  {id:"ar.alafasy", name:"Mishary Rashid Alafasy"},
  {id:"ar.husary", name:"Mahmoud Khalil Al-Husary"},
  {id:"ar.minshawi", name:"Mohamed Siddiq El-Minshawi"},
  {id:"ar.mahermuaiqly", name:"Maher Al Muaiqly"},
  {id:"ar.shaatree", name:"Abu Bakr al-Shatri"},
  {id:"ar.ahmedajamy", name:"Ahmed ibn Ali al-Ajamy"},
  {id:"ar.husarymujawwad", name:"Al-Husary (Mujawwad)"},
  {id:"ar.hudhaify", name:"Ali Al-Hudhaify"}
];
// NOTE (verified 2026-11-16): ar.abdulbasitmurattal, ar.abdullahbasfar and
// ar.abdurrahmaansudais return 403 on the audio CDN, so they are NOT offered.
function validSurahMeta(m){
  return Array.isArray(m) && m.length >= 100 && !!m[0] &&
    typeof m[0].englishName === "string" && typeof m[0].numberOfAyahs === "number";
}
/* A cached list is trusted only if it is complete and well-formed; a
   corrupt or partial cache from an older session is discarded and
   re-downloaded instead of rendering an empty Quran tab forever. */
let surahMeta = null;
/* Bundled metadata first (assets/quran-meta.js, loaded via script tag - same-origin, so it loads even where cross-origin fetch() calls are blocked). Only if that file is missing do we fall back to the cached copy and then the network. */
if (validSurahMeta(window.QURAN_META)) surahMeta = window.QURAN_META;
if (!surahMeta){
  const cachedMeta = store.get("surah_meta", null);
  if (validSurahMeta(cachedMeta)) surahMeta = cachedMeta;
}
let currentSurah = 1, currentAyahs = [], autoTimer = null, playingAyah = null;
let surahMetaLoading = null;
/* Lazily load the bundled full Quran text (assets/quran-full.js) on first Quran/Ruqyah open. Once loaded, reading works 100% offline - no API call is involved at all. Returns true when the local text is available. */
let quranFullLoading = null;
function loadQuranFull(){
  if (Array.isArray(window.QURAN_AR) && Array.isArray(window.QURAN_BN)) return Promise.resolve(true);
  if (quranFullLoading) return quranFullLoading;
  quranFullLoading = new Promise(resolve=>{
    const sc = document.createElement("script");
    sc.src = "assets/quran-full.js";
    sc.onload = ()=>resolve(Array.isArray(window.QURAN_AR));
    sc.onerror = ()=>{ quranFullLoading = null; resolve(false); };
    document.head.appendChild(sc);
  });
  return quranFullLoading;
}
/* Build the ayah list for surah n from the bundled text, or null. */
function localAyahs(n){
  if (!Array.isArray(window.QURAN_AR) || !window.QURAN_AR[n-1]) return null;
  let globalOffset = 0;
  if (Array.isArray(window.QURAN_META)) for (let i=0;i<n-1;i++) globalOffset += window.QURAN_META[i].numberOfAyahs;
  else if (surahMeta) for (let i=0;i<n-1;i++) globalOffset += surahMeta[i].numberOfAyahs;
  const ar = window.QURAN_AR[n-1], bn = Array.isArray(window.QURAN_BN) ? (window.QURAN_BN[n-1]||[]) : [];
  return ar.map((text,i)=>({number: globalOffset+i+1, numberInSurah: i+1, text, bnText: bn[i]||""}));
}
/* The bundled Quran carries the Bengali translation. For any other app
   language, fetch that language's translation edition (verified list in
   QURAN_TR) and swap it in — cached on the device after the first fetch.
   Arabic ("ar") shows the Arabic text only. If the fetch fails (e.g. an
   embedded browser blocking outside calls), the bundled translation
   stays as the offline fallback. */
async function applyQuranTranslation(n, ayahs){
  if (settings.lang === "bn") return;
  const ed = quranTrEdition();
  if (!ed){ ayahs.forEach(a=>{ a.bnText = ""; }); if (currentSurah===n) renderAyahs(ayahs); return; }
  const ck = "quran_tr_" + settings.lang + "_" + n;
  const cachedTr = store.get(ck, null);
  if (Array.isArray(cachedTr)){
    ayahs.forEach((a,i)=>{ if (cachedTr[i]) a.bnText = cachedTr[i]; });
    if (currentSurah===n) renderAyahs(ayahs);
    return;
  }
  try {
    const j = await fetchJson(`${QURAN}/surah/${n}/editions/quran-uthmani,${ed}`, 15000);
    const tr = j && Array.isArray(j.data) ? j.data[1] : null;
    if (!tr || !Array.isArray(tr.ayahs)) return;
    const texts = tr.ayahs.map(a=>a.text);
    store.set(ck, texts);
    ayahs.forEach((a,i)=>{ if (texts[i]) a.bnText = texts[i]; });
    if (currentSurah===n) renderAyahs(ayahs);
  } catch(e){ /* keep the bundled translation as fallback */ }
}
async function loadSurahMeta(){
  if (surahMeta) return surahMeta;
  if (validSurahMeta(window.QURAN_META)){ surahMeta = window.QURAN_META; return surahMeta; }
  if (surahMetaLoading) return surahMetaLoading;
  surahMetaLoading = (async ()=>{
    // Up to 3 attempts: a single failed request used to leave the Quran
    // tab empty ("কিছু পাওয়া যায়নি") until the app was reinstalled.
    for (let attempt = 0; attempt < 3; attempt++){
      try {
        const j = await fetchJson(`${QURAN}/surah`, 12000);
        if (!j || !Array.isArray(j.data) || j.data.length < 100) throw new Error("bad surah data");
        const meta = j.data.map(s=>({number:s.number, name:s.name, englishName:s.englishName,
          englishNameTranslation:s.englishNameTranslation, numberOfAyahs:s.numberOfAyahs, revelationType:s.revelationType}));
        if (!validSurahMeta(meta)) throw new Error("bad surah meta");
        surahMeta = meta;
        store.set("surah_meta", surahMeta);
        return surahMeta;
      } catch(e){ if (attempt < 2) await delay(1000 * (attempt + 1)); }
    }
    return null; // surahMeta stays null, so the next attempt can retry
  })();
  const result = await surahMetaLoading;
  surahMetaLoading = null;
  return result;
}
function renderSurahList(filter="", tab="all"){
  const box = $("#surah-list");
  if (!surahMeta){
    // The list itself failed to download — that is NOT "no results".
    // Show a retry button instead of the misleading empty message.
    box.innerHTML = surahMetaLoading
      ? `<p class="muted">সূরার তালিকা লোড হচ্ছে…</p>`
      : `<p class="muted">সূরার তালিকা লোড হয়নি — ইন্টারনেট চালু আছে কিনা দেখে আবার চেষ্টা করুন।</p><button class="btn block" id="btn-retry-surah">🔄 আবার চেষ্টা করুন</button>`;
    const rb = $("#btn-retry-surah");
    if (rb) rb.onclick = async ()=>{ box.innerHTML = `<p class="muted">সূরার তালিকা লোড হচ্ছে…</p>`;
      await loadSurahMeta(); renderSurahList($("#surah-search").value, currentQTab); renderQuranProgress(); };
    return;
  }
  const bms = store.get("bookmarks", []);
  let list = surahMeta;
  if (tab==="bookmarks"){
    const nums = [...new Set(bms.map(b=>b.surah))];
    list = list.filter(s=>nums.includes(s.number));
    if (!list.length){ box.innerHTML = `<p class="muted">${t("noBookmarks")}</p>`; return; }
  }
  if (tab==="read"){
    const r = quranRead();
    list = list.filter(s=>r[s.number]);
    if (!list.length){ box.innerHTML = `<p class="muted">${t("noReadYet")}</p>`; return; }
  }
  if (filter){
    const f = filter.trim().toLowerCase();
    // Fix #21: users type "Fatiha" but the name is spelled "Faatiha" —
    // collapsing repeated letters on both sides makes the common
    // spelling find the surah (and the original spelling still works).
    const normName = s => s.toLowerCase().replace(/(.)\1+/g, "$1");
    const nf = normName(f);
    list = list.filter(s=> normName(s.englishName).includes(nf) || String(s.number)===f ||
      normName(s.englishNameTranslation||"").includes(nf));
  }
  box.innerHTML = list.map(s=>`<button class="surah-item" data-surah="${s.number}">
    <span class="num">${num(s.number)}</span>
    <span class="nm"><b>${escHtml(s.englishName)}</b><small>${escHtml(s.englishNameTranslation||"")} • ${num(s.numberOfAyahs)} ${Lb("আয়াত", "Ayahs")} • ${escHtml(s.revelationType)}</small></span>
    ${isSurahRead(s.number)?'<span class="read-mark">✅</span>':""}<span class="ar">${escHtml(s.name)}</span></button>`).join("") || `<p class="muted">${t("nothingFound")}</p>`;
  $$("#surah-list [data-surah]").forEach(b=>b.onclick=()=>openSurah(+b.dataset.surah));
}
async function openSurah(n){
  currentSurah = n; stopAyahAudio();
  showView("reader");
  const meta = (surahMeta||[]).find(s=>s.number===n);
  $("#reader-title").textContent = meta ? `${meta.englishName} — ${meta.name}` : `${Lb("সূরা", "Surah")} ${num(n)}`;
  $("#reader-meta").textContent = meta ? `${meta.englishNameTranslation||""} • ${num(meta.numberOfAyahs)} ${Lb("আয়াত", "Ayahs")} • ${meta.revelationType}` : "";
  $("#ayah-list").innerHTML = `<p class="muted">${t("loadingAyahs")}</p>`;
  // 1) Bundled local text first — works fully offline, no network involved.
  if (await loadQuranFull()){
    const ayahs = localAyahs(n);
    if (ayahs && ayahs.length){ renderAyahs(ayahs); finishOpenSurah(n); applyQuranTranslation(n, ayahs); return; }
  }
  // 2) Previously downloaded copy on this device.
  const cached = store.get("quran_"+n, null);
  if (cached) renderAyahs(cached);
  // 3) Network as the last resort.
  try {
    const j = await fetchJson(`${QURAN}/surah/${n}/editions/${quranEditions()}`, 15000);
    if (!j || !Array.isArray(j.data) || !j.data[0] || !Array.isArray(j.data[0].ayahs)) throw new Error("bad ayah data");
    const ar = j.data[0], bn = j.data[1];
    const ayahs = ar.ayahs.map((a,i)=>({number:a.number, numberInSurah:a.numberInSurah, text:a.text,
      bnText: bn && bn.ayahs[i] ? bn.ayahs[i].text : ""}));
    store.set("quran_"+n, ayahs);
    renderAyahs(ayahs);
  } catch(e){
    if (!cached) $("#ayah-list").innerHTML = `<p class="muted">${t("loadErr")} — ইন্টারনেট চালু করে আবার চেষ্টা করুন।</p>`;
    else toast(t("offline"));
  }
  finishOpenSurah(n);
}
function finishOpenSurah(n){
  $("#jump-ayah").value = "";
  const mr = $("#btn-mark-read");
  if (mr) mr.textContent = isSurahRead(n) ? t("markedRead") : t("markRead");
  window.scrollTo(0,0);
}
function renderAyahs(ayahs){
  currentAyahs = ayahs;
  const bms = store.get("bookmarks", []);
  const isBm = (s,a)=> bms.some(b=>b.surah===s && b.ayah===a);
  $("#ayah-list").innerHTML = ayahs.map(a=>`<div class="ayah" id="ayah-${a.numberInSurah}">
    <div class="a-ar arabic">${escHtml(a.text)} <span style="color:var(--gold-d)">﴿${bnNum(a.numberInSurah)}﴾</span></div>
    ${a.bnText?`<div class="a-bn">${escHtml(a.bnText)}</div>`:""}
    <div class="a-tools">
      <button class="mini-btn" data-play="${a.numberInSurah}">▶️ ${Lb("শুনুন", "Listen")}</button>
      <button class="mini-btn ${isBm(currentSurah,a.numberInSurah)?"on":""}" data-bm="${a.numberInSurah}">${isBm(currentSurah,a.numberInSurah)?Lb("🔖 বুকমার্ক ✓", "🔖 Bookmarked"):Lb("🔖 বুকমার্ক", "🔖 Bookmark")}</button>
    </div></div>`).join("");
  $$("#ayah-list [data-play]").forEach(b=>b.onclick=()=>playAyah(+b.dataset.play));
  $$("#ayah-list [data-bm]").forEach(b=>b.onclick=()=>{
    const n = +b.dataset.bm; let list = store.get("bookmarks", []);
    const i = list.findIndex(x=>x.surah===currentSurah && x.ayah===n);
    if (i>=0) list.splice(i,1); else list.push({surah:currentSurah, ayah:n, at:Date.now()});
    store.set("bookmarks", list); renderAyahs(currentAyahs);
    toast(i>=0 ? Lb("বুকমার্ক সরানো হলো", "Bookmark removed") : Lb("বুকমার্ক সংরক্ষিত ✓", "Bookmark saved ✓"));
  });
}
function ayahAudioUrl(globalNum){ return `${AUDIO_CDN}/${settings.reciter}/${globalNum}.mp3`; }
function playAyah(nInSurah){
  const a = currentAyahs.find(x=>x.numberInSurah===nInSurah); if(!a) return;
  const audio = $("#audio-ayah");
  $$(".ayah.playing").forEach(el=>el.classList.remove("playing"));
  const el = $("#ayah-"+nInSurah); if (el) el.classList.add("playing");
  playingAyah = nInSurah;
  audio.src = ayahAudioUrl(a.number);
  audio.play().catch(()=>toast(Lb("অডিও চালু হয়নি — ইন্টারনেট দেখুন", "Audio failed — check internet")));
  audio.onended = ()=>{ if ($("#btn-autoplay").dataset.on==="1"){ const next = currentAyahs.find(x=>x.numberInSurah===nInSurah+1); if (next) playAyah(next.numberInSurah); else stopAyahAudio(); } };
}
function stopAyahAudio(){ const a=$("#audio-ayah"); a.pause(); a.removeAttribute("src"); playingAyah=null;
  $$(".ayah.playing").forEach(el=>el.classList.remove("playing")); }

/* ---------------- Tasbih ---------------- */
const TASBIH_TARGETS = [33, 99, 100, 500, 1000];
let tasbih = {dhikr:0, count:0};
function tasbihToday(){ const k = todayKey(); return store.get("tasbih", {})[k] || {}; }
function renderTasbih(){
  const presets = window.DHIKR_PRESETS || [];
  $("#dhikr-presets").innerHTML = presets.map((d,i)=>`<button class="chip ${tasbih.dhikr===i?"on":""}" data-dhikr="${i}">${Lb(d.bn, d.en)}</button>`).join("");
  $$("#dhikr-presets [data-dhikr]").forEach(b=>b.onclick=()=>{ tasbih.dhikr=+b.dataset.dhikr; tasbih.count=0; renderTasbih(); });
  const d = presets[tasbih.dhikr] || presets[0];
  $("#tasbih-count").textContent = bnNum(tasbih.count);
  $("#tasbih-of").textContent = `${d?Lb(d.bn, d.en):""} • ${t("targetLabel")} ${num(settings.tasbihTarget)}`;
  $("#tasbih-bar").style.width = Math.min(100, tasbih.count/settings.tasbihTarget*100) + "%";
  const today = tasbihToday();
  const total = Object.values(today).reduce((a,b)=>a+b,0);
  $("#tasbih-today").textContent = `${t("todayTotal")} ${num(total)}`;
  $("#tasbih-history").innerHTML = presets.map((p,i)=>{
    const c = today[i]||0;
    return `<div class="win-row"><span>${p.bn} <span class="muted small">${p.ar}</span></span><b>${bnNum(c)}</b></div>`;
  }).join("");
}
function tapTasbih(){
  tasbih.count++;
  if (navigator.vibrate) navigator.vibrate(15);
  const k = todayKey(); const all = store.get("tasbih", {}); all[k]=all[k]||{};
  all[k][tasbih.dhikr]=(all[k][tasbih.dhikr]||0)+1; store.set("tasbih", all);
  if (tasbih.count===settings.tasbihTarget) toast(`🎉 ${bnNum(settings.tasbihTarget)} পূর্ণ হলো — আলহামদুলিল্লাহ!`);
  renderTasbih();
}

/* ---------------- Duas & Ruqyah ---------------- */
let duaCat = "all";
function renderDuaCats(){
  const cats = window.DUA_CATS || [];
  $("#dua-cats").innerHTML = cats.map(c=>`<button class="chip ${duaCat===c.id?"on":""}" data-cat="${c.id}">${Lb(c.bn, c.en)}</button>`).join("");
  $$("#dua-cats [data-cat]").forEach(b=>b.onclick=()=>{ duaCat=b.dataset.cat; renderDuaCats(); renderDuas(); });
}
function renderDuas(){
  const saved = store.get("dua_saved", []);
  let list = window.DUAS || [];
  if (duaCat==="saved") list = list.filter((d,i)=>saved.includes(i));
  else if (duaCat!=="all") list = list.filter(d=>d.cat===duaCat);
  $("#dua-list").innerHTML = list.map(d=>{
    const idx = (window.DUAS||[]).indexOf(d);
    const isS = saved.includes(idx);
    const audioKind = (d.ar||"").includes("صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا") ? "durood"
      : (d.ar||"").includes("أَسْتَغْفِرُ") ? "istighfar" : "";
    const playBtn = audioKind ? `<button class="mini-btn" data-play-dua="${audioKind}" title="${Lb("শুনুন","Listen")}">▶ ${Lb("শুনুন","Listen")}</button>` : "";
    return `<div class="dua"><div class="d-ar arabic">${d.ar}</div>
    <div class="d-tr">${d.tr}</div><div class="d-bn">${d.bn}</div>
    <div class="row" style="justify-content:flex-end">${playBtn}
    <button class="mini-btn ${isS?"on":""}" data-save-dua="${idx}">${isS?"🔖 সংরক্ষিত ✓":"🔖 সংরক্ষণ"}</button></div></div>`;
  }).join("") || `<p class="muted">এই বিভাগে কোনো দোয়া নেই।</p>`;
  $$("#dua-list [data-play-dua]").forEach(b=>b.onclick=()=>{
    const kind = b.dataset.playDua;
    const a = $(kind==="durood" ? "#audio-durood" : "#audio-istighfar");
    if (a){ a.currentTime = 0; a.play().catch(()=>toast(Lb("অডিও পাওয়া যায়নি", "Audio not available"))); }
  });
  $$("#dua-list [data-save-dua]").forEach(b=>b.onclick=()=>{
    const i=+b.dataset.saveDua; let s=store.get("dua_saved",[]);
    const ix=s.indexOf(i); if(ix>=0) s.splice(ix,1); else s.push(i);
    store.set("dua_saved", s); renderDuas();
  });
}
/* ---------------- Learn Prayer (নামাজ শিক্ষা) ----------------
   Step-by-step Salah from authentic hadith, with FACELESS figures
   (no facial features). One shared side-view pose engine drives BOTH
   the still figure on every step card AND the animated demo on top:
   the demo interpolates the same joint positions, so the hands really
   rise for takbir, fold, grip the knees in ruku, go to the ground in
   sujud, sit in jalsa/tashahhud and the head really turns for salam.
   The figure faces LEFT (the Qibla) and is barefoot throughout. */
const GOLD_C = "#d4af37";
const POSES = {
  stand:{head:[168,42], shoulder:[168,60], hip:[168,106],
    elbow:[174,88], hand:[176,114], elbow2:[179,86], hand2:[187,112],
    knee:[168,160], ankle:[168,210], toe:[150,210], knee2:[178,160], ankle2:[178,210], toe2:[160,210],
    finger:null, palm:null, palm2:null, gaze:150, seven:0, grip:0, flat:0},
  takbirEars:{head:[168,42], shoulder:[168,60], hip:[168,106],
    elbow:[150,66], hand:[142,50], elbow2:[189,66], hand2:[197,50],
    knee:[168,160], ankle:[168,210], toe:[150,210], knee2:[178,160], ankle2:[178,210], toe2:[160,210],
    finger:null, palm:[138,34], palm2:[201,34], gaze:150, seven:0, grip:0, flat:0},
  takbirShoulders:{head:[168,42], shoulder:[168,60], hip:[168,106],
    elbow:[150,68], hand:[143,54], elbow2:[189,68], hand2:[196,54],
    knee:[168,160], ankle:[168,210], toe:[150,210], knee2:[178,160], ankle2:[178,210], toe2:[160,210],
    finger:null, palm:[141,35], palm2:[198,35], gaze:150, seven:0, grip:0, flat:0},
  foldNavel:{head:[168,42], shoulder:[168,60], hip:[168,106],
    elbow:[150,86], hand:[159,99], elbow2:[158,80], hand2:[167,102],
    knee:[168,160], ankle:[168,210], toe:[150,210], knee2:[178,160], ankle2:[178,210], toe2:[160,210],
    finger:null, palm:null, palm2:null, gaze:150, seven:0, grip:0, flat:0},
  foldChest:{head:[168,42], shoulder:[168,60], hip:[168,106],
    elbow:[152,76], hand:[160,67], elbow2:[160,72], hand2:[168,70],
    knee:[168,160], ankle:[168,210], toe:[150,210], knee2:[178,160], ankle2:[178,210], toe2:[160,210],
    finger:null, palm:null, palm2:null, gaze:150, seven:0, grip:0, flat:0},
  ruku:{head:[92,94], shoulder:[112,102], hip:[178,102],
    elbow:[144,130], hand:[172,158], elbow2:[150,134], hand2:[180,160],
    knee:[174,158], ankle:[176,210], toe:[158,210], knee2:[184,158], ankle2:[186,210], toe2:[168,210],
    finger:null, palm:null, palm2:null, gaze:118, seven:0, grip:1, flat:0},
  sujud:{head:[102,192], shoulder:[126,170], hip:[204,148],
    elbow:[104,178], hand:[80,206], elbow2:[126,186], hand2:[118,207],
    knee:[192,204], ankle:[238,208], toe:[252,197], knee2:[201,206], ankle2:[245,209], toe2:[257,201],
    finger:null, palm:null, palm2:null, gaze:112, seven:1, grip:0, flat:1},
  jalsa:{head:[188,94], shoulder:[188,114], hip:[190,174],
    elbow:[172,144], hand:[152,180], elbow2:[182,148], hand2:[162,184],
    knee:[148,190], ankle:[190,205], toe:[207,207], knee2:[158,186], ankle2:[172,206], toe2:[172,183],
    finger:null, palm:null, palm2:null, gaze:150, seven:0, grip:0, flat:0},
  tash:{head:[188,94], shoulder:[188,114], hip:[190,174],
    elbow:[172,144], hand:[152,180], elbow2:[182,148], hand2:[162,184],
    knee:[148,190], ankle:[190,205], toe:[207,207], knee2:[158,186], ankle2:[172,206], toe2:[172,183],
    finger:[143,168], palm:null, palm2:null, gaze:150, seven:0, grip:0, flat:0},
  tawarruk:{head:[190,96], shoulder:[190,118], hip:[197,182],
    elbow:[174,148], hand:[156,184], elbow2:[184,152], hand2:[166,188],
    knee:[152,196], ankle:[148,208], toe:[133,208], knee2:[170,192], ankle2:[188,207], toe2:[202,208],
    finger:[147,172], palm:null, palm2:null, gaze:150, seven:0, grip:0, flat:0}
};
function poseFor(posture, M){
  if (posture === "takbir") return POSES[M === "hanafi" ? "takbirEars" : "takbirShoulders"];
  if (posture === "qiyam") return POSES[M === "maliki" ? "stand" : (M === "hanafi" || M === "hanbali") ? "foldNavel" : "foldChest"];
  if (posture === "qaumah") return POSES[(M === "shafii" || M === "hanbali") ? "foldChest" : "stand"];
  if (posture === "tashahhud") return POSES[M === "maliki" ? "tawarruk" : "tash"];
  if (posture === "tashahhudFinal") return POSES[M === "hanafi" ? "tash" : "tawarruk"];
  if (posture === "salam"){
    const s = poseFor("tashahhudFinal", M), r = {};
    for (const k in s) r[k] = s[k];
    r.head = [s.head[0] + 7, s.head[1] - 1]; r.gaze = 28; r.finger = null;
    return r;
  }
  return POSES[posture] || POSES.stand;
}
const POSE_KEYS = ["head","shoulder","hip","elbow","hand","elbow2","hand2","knee","ankle","toe","knee2","ankle2","toe2"];
function lerpPt(a, b, k){ return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
function lerpPose(a, b, k){
  const o = {};
  POSE_KEYS.forEach(key => { o[key] = lerpPt(a[key], b[key], k); });
  o.finger = lerpPt(a.finger || a.hand, b.finger || b.hand, k);
  o.palm = lerpPt(a.palm || a.hand, b.palm || b.hand, k);
  o.palm2 = lerpPt(a.palm2 || a.hand2, b.palm2 || b.hand2, k);
  o.gaze = a.gaze + (b.gaze - a.gaze) * k;
  o.seven = a.seven + (b.seven - a.seven) * k;
  o.grip = a.grip + (b.grip - a.grip) * k;
  o.flat = a.flat + (b.flat - a.flat) * k;
  return o;
}
/* Far-side joints pulled toward the near side for RENDERING only (pose
   data stays untouched): a parallel far leg offset 10px reads as a pale
   ghost duplicate of the robe. Tucked behind, it reads as the far leg. */
function tuck2(p){
  /* Flat far foot (standing/ruku): drop it 4px so the two feet read as
     two separate feet instead of one foot with a heel peeking out. */
  const dy = Math.abs(p.toe2[1] - p.ankle2[1]) < 2 ? 4 : 0;
  const a2 = lerpPt(p.ankle2, p.ankle, 0.35), t2 = lerpPt(p.toe2, p.toe, 0.15);
  return {
    knee2: lerpPt(p.knee2, p.knee, 0.55),
    ankle2: [a2[0], a2[1] + dy],
    toe2: [t2[0], t2[1] + dy]
  };
}
function sevenDotPts(p){
  const t = tuck2(p);
  return [[p.head[0] - 12, 209.5], [p.hand[0] - 11, 209.5], [p.hand2[0] + 11, 209.5],
    [p.knee[0], p.knee[1] + 5.5], [t.knee2[0], t.knee2[1] + 5], [p.toe[0] - 6, 209.5], [t.toe2[0] - 6, 209.5]];
}
/* ---------- Realistic figure rendering ----------
   The animated figure is built from filled tapered shapes (not uniform
   strokes) so it reads as a man in a thobe: broad shoulders, visible
   neck, pinched waist, loose robe drape, wide sleeves, distinct bare
   feet, tall domed kufi. Faceless always. Far limbs use SOLID slightly
   darker tones — a translucent far limb over the emerald stage read as
   a ghost duplicate. The old gaze line crossed the shoulder in some
   poses, so the gaze is now a small gold dot in the gaze direction. */
const THOBE_C = "#f6f6f3";
const THOBE_FAR_C = "#e2e2dc";
const SKIN_C = "#e6b183";
const SKIN_FAR_C = "#cf9f6f";
const SKIN_LINE_C = "#b98a5e"; /* darker tan: finger lines must contrast with the tan hand */
const STAGE_C = "#0b5e46";
const MAT_C = "#0e6a4c";
const FOLDLINE_C = "#d8d8d2"; /* robe fold shading */
function _f2(v){ return v[0].toFixed(1) + "," + v[1].toFixed(1); }
function _perp2(a, b){ const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; }
/* Filled tapered tube along a polyline, half-widths ws[] per point.
   flatStart/flatEnd give a straight (butt) cap instead of a rounded one
   — used where two robe pieces join (shoulder, hip, hem) so no white
   mound bulges out of the silhouette. */
function tubeD(pts, ws, flatStart, flatEnd){
  const n = pts.length, left = [], right = [];
  for (let i = 0; i < n; i++){
    const a = pts[Math.max(0, i-1)], b = pts[i], c = pts[Math.min(n-1, i+1)];
    let nx, ny;
    if (i === 0){ const q = _perp2(b, c); nx = q[0]; ny = q[1]; }
    else if (i === n-1){ const q = _perp2(a, b); nx = q[0]; ny = q[1]; }
    else { const q1 = _perp2(a, b), q2 = _perp2(b, c); nx = (q1[0] + q2[0]) / 2; ny = (q1[1] + q2[1]) / 2; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L; }
    left.push([b[0] + nx * ws[i], b[1] + ny * ws[i]]);
    right.push([b[0] - nx * ws[i], b[1] - ny * ws[i]]);
  }
  const r0 = ws[0].toFixed(1), r1 = ws[n-1].toFixed(1);
  let d = "M" + _f2(left[0]);
  for (let i = 1; i < n; i++) d += " L" + _f2(left[i]);
  d += flatEnd ? " L" + _f2(right[n-1]) : " A" + r1 + " " + r1 + " 0 0 0 " + _f2(right[n-1]);
  for (let i = n-2; i >= 0; i--) d += " L" + _f2(right[i]);
  d += flatStart ? " L" + _f2(left[0]) + " Z" : " A" + r0 + " " + r0 + " 0 0 0 " + _f2(left[0]) + " Z";
  return d;
}
/* n short lines fanning out from a point (fingers). */
function fanD(c, ang, spread, len, n){
  let d = "";
  for (let i = 0; i < n; i++){
    const a = ang + (n === 1 ? 0 : -spread + 2 * spread * i / (n - 1));
    d += "M" + (c[0] + Math.cos(a) * 3).toFixed(1) + "," + (c[1] + Math.sin(a) * 3).toFixed(1)
      + " L" + (c[0] + Math.cos(a) * len).toFixed(1) + "," + (c[1] + Math.sin(a) * len).toFixed(1) + " ";
  }
  return d;
}
function lineD(a, b){ return "M" + _f2(a) + " L" + _f2(b); }
/* Tall domed kufi cap. The dome axis follows the neck (shoulder->head),
   so it stays on top of the head in ruku/sujud too. rimCenter is the
   centre of the rim line; the dome rises 17px above it. */
function _capGeom(h, shoulder){
  const ax = h[0] - shoulder[0], ay = h[1] - shoulder[1], L = Math.hypot(ax, ay) || 1;
  const ux = ax / L, uy = ay / L, px = -uy, py = ux;
  const cx = h[0] - ux, cy = h[1] - uy;
  return {ux:ux, uy:uy, px:px, py:py, cx:cx, cy:cy,
    lx:cx + px * 13, ly:cy + py * 13, rx:cx - px * 13, ry:cy - py * 13,
    top:[cx + ux * 17, cy + uy * 17]};
}
function capD(h, shoulder){
  const g = _capGeom(h, shoulder);
  /* Quadratic through the dome top: unlike an arc, a Q curve cannot flip
     to the wrong side when the head axis rotates (ruku/sujud). Control
     point is placed so the curve apex lands exactly on the dome top. */
  const qx = g.cx + g.ux * 34, qy = g.cy + g.uy * 34;
  return "M" + g.lx.toFixed(1) + "," + g.ly.toFixed(1)
    + " Q" + qx.toFixed(1) + "," + qy.toFixed(1) + " " + g.rx.toFixed(1) + "," + g.ry.toFixed(1) + " Z";
}
function capRimD(h, shoulder){
  const g = _capGeom(h, shoulder);
  return "M" + g.lx.toFixed(1) + "," + g.ly.toFixed(1) + " L" + g.rx.toFixed(1) + "," + g.ry.toFixed(1);
}
/* All figure geometry for one pose. Returns {el:[...], m:{measures}}.
   figSVG renders el; drawPose updates el. Measures are for tests. */
function figureParts(p){
  const palm = p.palm || p.hand, palm2 = p.palm2 || p.hand2, finger = p.finger || p.hand;
  const waist = lerpPt(p.shoulder, p.hip, 0.5);
  const t2 = tuck2(p);
  const hem = lerpPt(p.knee, p.ankle, 0.55), hem2 = lerpPt(t2.knee2, t2.ankle2, 0.55);
  /* Hand-tying (qiyam): both hands close together at torso height. */
  const fold = Math.hypot(p.hand[0] - p.hand2[0], p.hand[1] - p.hand2[1]) < 14
    && p.hand[1] < p.hip[1] - 2 && p.hand2[1] < p.hip[1] - 2;
  const rad = p.gaze * Math.PI / 180;
  /* (No gaze line/dot: the old line crossed the shoulder in some poses
     and a floating dot reads as a stray mark. Captions explain the gaze.) */
  /* Torso detail lines: chest seam, collar, robe folds, hem band. */
  const seamC = lerpPt(p.shoulder, p.hip, 0.3), seamN = _perp2(p.shoulder, p.hip);
  const seamW = 23 - 6 * 0.3;
  const seam = [[seamC[0] + seamN[0] * seamW, seamC[1] + seamN[1] * seamW],
    [seamC[0] - seamN[0] * seamW, seamC[1] - seamN[1] * seamW]];
  const collarA = lerpPt(p.shoulder, p.head, 0.35), collarB = lerpPt(p.shoulder, p.hip, 0.22);
  const f1a = lerpPt(p.shoulder, p.hip, 0.4), f1b = lerpPt(p.shoulder, p.hip, 0.9);
  const f1n = _perp2(p.shoulder, p.hip);
  const f1 = [[f1a[0] + f1n[0] * 9, f1a[1] + f1n[1] * 9], [f1b[0] + f1n[0] * 11, f1b[1] + f1n[1] * 11]];
  const f2 = [[f1a[0] - f1n[0] * 9, f1a[1] - f1n[1] * 9], [f1b[0] - f1n[0] * 11, f1b[1] - f1n[1] * 11]];
  const hemN = _perp2(p.knee, p.ankle);
  const hemBand = [[hem[0] + hemN[0] * 13, hem[1] + hemN[1] * 13],
    [hem[0] - hemN[0] * 13, hem[1] - hemN[1] * 13]];
  const cuffN = _perp2(p.elbow, p.hand);
  const cuff = [[p.hand[0] + cuffN[0] * 6, p.hand[1] + cuffN[1] * 6],
    [p.hand[0] - cuffN[0] * 6, p.hand[1] - cuffN[1] * 6]];
  const cuff2N = _perp2(p.elbow2, p.hand2);
  const cuff2 = [[p.hand2[0] + cuff2N[0] * 5.5, p.hand2[1] + cuff2N[1] * 5.5],
    [p.hand2[0] - cuff2N[0] * 5.5, p.hand2[1] - cuff2N[1] * 5.5]];
  /* Raised-hand fingers (takbir): fan toward the palm point. */
  const palmAng = Math.atan2(palm[1] - p.hand[1], palm[0] - p.hand[0]);
  const palmD = p.palm ? fanD(p.hand, palmAng, 0.32, 14, 4) : "";
  const palm2Ang = Math.atan2(palm2[1] - p.hand2[1], palm2[0] - p.hand2[0]);
  const palm2D = p.palm2 ? fanD(p.hand2, palm2Ang, 0.32, 13, 4) : "";
  /* Ruku grip: fingers spread on the knee. */
  const gripAng = Math.atan2(p.knee[1] - p.hand[1], p.knee[0] - p.hand[0]);
  const gripD = fanD(p.hand, gripAng, 0.5, 13, 4);
  /* Folded-hands grip (qiyam): right-hand fingers wrapping the left wrist.
     Four clear lines across the forearm so the grip reads at small size. */
  const fore2Ang = Math.atan2(p.hand2[1] - p.elbow2[1], p.hand2[0] - p.elbow2[0]);
  const wrapAng = fore2Ang + Math.PI / 2;
  let foldD = "";
  for (let i = -1.5; i <= 1.5; i++){
    const cx = p.hand2[0] + Math.cos(fore2Ang) * i * 4, cy = p.hand2[1] + Math.sin(fore2Ang) * i * 4;
    foldD += "M" + (cx + Math.cos(wrapAng) * -7).toFixed(1) + "," + (cy + Math.sin(wrapAng) * -7).toFixed(1)
      + " L" + (cx + Math.cos(wrapAng) * 7).toFixed(1) + "," + (cy + Math.sin(wrapAng) * 7).toFixed(1) + " ";
  }
  /* Sujud flat hands: finger fans toward the qibla so the hands are not
     plain discs on the mat. */
  const flatD = p.flat ? fanD(p.hand, Math.PI, 0.45, 18, 4) : "";
  const flat2D = p.flat ? fanD(p.hand2, Math.PI, 0.45, 17, 4) : "";
  /* Torso width: a tapered robe reads as a wedge when the back is
     horizontal (ruku) — use a uniform width so the back stays flat. */
  const torsoHoriz = Math.abs(p.hip[1] - p.shoulder[1]) < Math.abs(p.hip[0] - p.shoulder[0]);
  const torsoW = torsoHoriz ? [18, 18, 18] : [18, 14, 18];
  const dots = sevenDotPts(p).map(d => `<circle class="dm-dot" cx="${d[0].toFixed(1)}" cy="${d[1].toFixed(1)}" r="3" fill="${GOLD_C}"/>`).join("");
  const capTop = _capGeom(p.head, p.shoulder).top;
  const el = [
    {r:"skirt2", tag:"path", d:tubeD([p.hip, t2.knee2, hem2], [20, 15, 13], true, false), fill:THOBE_FAR_C},
    {r:"leg2", tag:"path", d:tubeD([hem2, t2.ankle2], [5.5, 5], true, false), fill:SKIN_FAR_C},
    {r:"foot2", tag:"path", d:tubeD([t2.ankle2, t2.toe2], [6, 4]), fill:SKIN_FAR_C},
    {r:"arm2", tag:"path", d:tubeD([p.shoulder, p.elbow2, p.hand2], [8, 6.5, 5.5]), fill:THOBE_FAR_C, stroke:FOLDLINE_C, sw:1},
    {r:"palm2", tag:"path", d:palm2D, fill:"none", stroke:SKIN_LINE_C, sw:2.5, op:p.palm2 ? 1 : 0},
    {r:"cuff2", tag:"path", d:lineD(cuff2[0], cuff2[1]), fill:"none", stroke:GOLD_C, sw:1.5, op:0.4},
    {r:"skirt", tag:"path", d:tubeD([p.hip, p.knee, hem], [20, 15, 13], true, false), fill:THOBE_C},
    {r:"leg", tag:"path", d:tubeD([hem, p.ankle], [5.5, 5], true, false), fill:SKIN_C},
    {r:"foot", tag:"path", d:tubeD([p.ankle, p.toe], [6, 4]), fill:SKIN_C},
    {r:"torso", tag:"path", d:tubeD([p.shoulder, waist, p.hip], torsoW, true, false), fill:THOBE_C},
    {r:"fold1", tag:"path", d:lineD(f1[0], f1[1]), fill:"none", stroke:FOLDLINE_C, sw:1.5, op:0.55},
    {r:"fold2", tag:"path", d:lineD(f2[0], f2[1]), fill:"none", stroke:FOLDLINE_C, sw:1.5, op:0.55},
    {r:"hemBand", tag:"path", d:lineD(hemBand[0], hemBand[1]), fill:"none", stroke:GOLD_C, sw:1.5, op:0.4},
    {r:"neck", tag:"path", d:tubeD([p.shoulder, p.head], [7, 6.5], true, false), fill:SKIN_C},
    {r:"arm", tag:"path", d:tubeD([p.shoulder, p.elbow, p.hand], [8.5, 7, 6]), fill:THOBE_C, stroke:FOLDLINE_C, sw:1},
    {r:"cuff", tag:"path", d:lineD(cuff[0], cuff[1]), fill:"none", stroke:GOLD_C, sw:1.5, op:0.4},
    {r:"handC", tag:"circle", cx:p.hand[0], cy:p.hand[1], rr:7, fill:SKIN_C},
    {r:"handC2", tag:"circle", cx:p.hand2[0], cy:p.hand2[1], rr:6.5, fill:SKIN_FAR_C},
    {r:"palm", tag:"path", d:palmD, fill:"none", stroke:SKIN_LINE_C, sw:2.5, op:p.palm ? 1 : 0},
    {r:"grip", tag:"path", d:gripD, fill:"none", stroke:SKIN_LINE_C, sw:2.5, op:p.grip},
    {r:"hflat", tag:"ellipse", cx:p.hand[0], cy:p.hand[1], rx:8, ry:4.5, fill:SKIN_C, op:p.flat},
    {r:"flatF", tag:"path", d:flatD, fill:"none", stroke:SKIN_LINE_C, sw:3, op:p.flat},
    {r:"flatF2", tag:"path", d:flat2D, fill:"none", stroke:SKIN_LINE_C, sw:3, op:p.flat},
    {r:"foldGrip", tag:"path", d:foldD, fill:"none", stroke:SKIN_LINE_C, sw:3, op:fold ? 1 : 0},
    {r:"finger", tag:"path", d:lineD(p.hand, finger), fill:"none", stroke:SKIN_C, sw:5, op:p.finger ? 1 : 0},
    {r:"head", tag:"circle", cx:p.head[0], cy:p.head[1], rr:11.5, fill:SKIN_C},
    {r:"cap", tag:"path", d:capD(p.head, p.shoulder), fill:THOBE_C},
    {r:"capRim", tag:"path", d:capRimD(p.head, p.shoulder), fill:"none", stroke:GOLD_C, sw:1.4, op:0.7},
    {r:"dots", tag:"g", op:p.seven, inner:dots}
  ];
  return {el:el, m:{shoulderW:36, waistW:28, hipW:36, capTop:capTop, fold:fold,
    footGap:Math.hypot(p.toe[0] - p.toe2[0], p.toe[1] - p.toe2[1])}};
}
function figSVG(p, guides, label){
  const parts = figureParts(p);
  let s = `<svg viewBox="0 0 320 240" fill="none" aria-hidden="true">`
    + `<rect x="5" y="5" width="310" height="230" rx="14" fill="${STAGE_C}"/>`
    + `<rect x="5" y="5" width="310" height="230" rx="14" fill="none" stroke="${GOLD_C}" stroke-opacity=".55" stroke-width="1.5"/>`
    + `<path data-r="mat" d="M70,200 L250,200 L270,228 L50,228 Z" fill="${MAT_C}" stroke="${GOLD_C}" stroke-width="1.6"/>`
    + `<path d="M84,205 L238,205 L250,223 L72,223 Z" fill="none" stroke="${GOLD_C}" stroke-opacity=".45" stroke-width="1"/>`
    + `<path d="M160,210 L163,214 L168,215 L163,217 L160,221 L157,217 L152,215 L157,214 Z" fill="${GOLD_C}" opacity=".6"/>`
    + `${guides || ""}`;
  for (const el of parts.el){
    if (el.tag === "path") s += `<path data-r="${el.r}" d="${el.d}" fill="${el.fill || "none"}"${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.sw}" stroke-linecap="round"` : ""}${el.op != null ? ` opacity="${el.op}"` : ""}/>`;
    else if (el.tag === "circle") s += `<circle data-r="${el.r}" cx="${el.cx.toFixed(1)}" cy="${el.cy.toFixed(1)}" r="${el.rr}" fill="${el.fill}"${el.op != null ? ` opacity="${el.op}"` : ""}/>`;
    else if (el.tag === "ellipse") s += `<ellipse data-r="${el.r}" cx="${el.cx.toFixed(1)}" cy="${el.cy.toFixed(1)}" rx="${el.rx}" ry="${el.ry}" fill="${el.fill}"${el.op != null ? ` opacity="${el.op}"` : ""}/>`;
    else if (el.tag === "g") s += `<g data-r="${el.r}" opacity="${el.op}">${el.inner}</g>`;
  }
  s += (label ? `<text x="160" y="232" text-anchor="middle" font-size="14.5" font-weight="700" fill="${GOLD_C}">${label}</text>` : "")
    + `</svg>`;
  return s;
}
function drawPose(root, p){
  if (!root) return;
  const q = r => root.querySelector('[data-r="' + r + '"]');
  for (const el of figureParts(p).el){
    const node = q(el.r);
    if (!node) continue;
    if (el.tag === "path") node.setAttribute("d", el.d);
    else if (el.tag === "circle"){ node.setAttribute("cx", el.cx.toFixed(1)); node.setAttribute("cy", el.cy.toFixed(1)); }
    else if (el.tag === "ellipse"){ node.setAttribute("cx", el.cx.toFixed(1)); node.setAttribute("cy", el.cy.toFixed(1)); }
    if (el.op != null) node.setAttribute("opacity", typeof el.op === "number" ? el.op.toFixed(2) : el.op);
    if (el.tag === "g"){
      const pts = sevenDotPts(p), cs = node.querySelectorAll(".dm-dot");
      cs.forEach((c, i) => { if (pts[i]){ c.setAttribute("cx", pts[i][0].toFixed(1)); c.setAttribute("cy", pts[i][1].toFixed(1)); } });
    }
  }
}
function figLabel(posture, M){
  if (posture === "takbir") return M === "hanafi" ? "কান বরাবর হাত তুলুন" : "কাঁধ বরাবর হাত তুলুন";
  if (posture === "qiyam") return (M === "hanafi" || M === "hanbali") ? "নাভির নিচে হাত বাঁধুন" : M === "maliki" ? "হাত ঝুলিয়ে দাঁড়ান" : "বুকে হাত বাঁধুন";
  if (posture === "qaumah") return (M === "shafii" || M === "hanbali") ? "উঠে আবার বুকে হাত বাঁধুন" : "সোজা হয়ে দাঁড়ান";
  if (posture === "ruku") return "পিঠ সমতল, হাত হাঁটুতে";
  if (posture === "sujud") return "সাত হাড়ে সিজদা";
  if (posture === "jalsa") return "বাম পায়ে বসুন, ডান পা খাড়া";
  if (posture === "tashahhud" || posture === "tashahhudFinal") return "তর্জনী উঁচু করুন";
  if (posture === "salam") return M === "maliki" ? "এক সালাম (ডানে)" : "ডানে মুখ ফিরান";
  return "সোজা দাঁড়ান";
}
function figGuides(posture, p, M){
  const G = GOLD_C, dash = `stroke="${G}" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round" fill="none"`;
  if (posture === "takbir") return `<line x1="22" y1="${p.hand[1]}" x2="128" y2="${p.hand[1]}" ${dash}/><line x1="212" y1="${p.hand[1]}" x2="298" y2="${p.hand[1]}" ${dash}/><circle cx="${p.hand[0]}" cy="${p.hand[1]}" r="10" ${dash}/><circle cx="${p.hand2[0]}" cy="${p.hand2[1]}" r="10" ${dash}/>`;
  if ((posture === "qiyam" && M !== "maliki") || (posture === "qaumah" && (M === "shafii" || M === "hanbali")))
    return `<circle cx="${((p.hand[0] + p.hand2[0]) / 2).toFixed(0)}" cy="${((p.hand[1] + p.hand2[1]) / 2).toFixed(0)}" r="16" ${dash}/>`;
  if (posture === "qaumah") return `<line x1="208" y1="22" x2="208" y2="210" ${dash}/>`;
  if (posture === "ruku") return `<line x1="52" y1="93" x2="196" y2="93" ${dash}/>`;
  if (posture === "jalsa") return `<circle cx="${p.ankle2[0]}" cy="${((p.ankle2[1] + p.toe2[1]) / 2).toFixed(0)}" r="15" ${dash}/>`;
  if (posture === "tashahhud" || posture === "tashahhudFinal") return p.finger ? `<circle cx="${p.finger[0]}" cy="${p.finger[1]}" r="12" ${dash}/>` : "";
  if (posture === "salam") return `<path d="M${p.head[0] + 22} ${p.head[1] - 14} Q ${p.head[0] + 46} ${p.head[1] + 2} ${p.head[0] + 30} ${p.head[1] + 20}" stroke="${G}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M${p.head[0] + 30} ${p.head[1] + 20} l-10 -1 M${p.head[0] + 30} ${p.head[1] + 20} l-1 -10" stroke="${G}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  return "";
}
function prayerFigure(posture, m){
  const M = ["hanafi","shafii","maliki","hanbali"].includes(m) ? m : (settings.learnMadhhab || "hanafi");
  const p = poseFor(posture, M);
  return figSVG(p, figGuides(posture, p, M), figLabel(posture, M));
}
/* Animated demo: one figure moving through the whole prayer sequence.
   Segments interpolate the shared poses above — the movement itself
   (hands rising, back flattening, body going down to sujud, head
   turning for salam) is what teaches, not a slideshow of stills. */
function buildLearnDemo(M){
  const demo = document.getElementById("learn-demo"), seq = document.getElementById("learn-demo-seq");
  if (!demo) return;
  if (window.__demoStop){ window.__demoStop(); window.__demoStop = null; }
  const takBn = M === "hanafi" ? "তাকবির — দুই হাত কানের লতি পর্যন্ত তোলা, তালু কিবলার দিকে" : "তাকবির — দুই হাত কাঁধ বরাবর তোলা, তালু কিবলার দিকে";
  const takEn = M === "hanafi" ? "Takbir — both hands raised to the earlobes, palms facing the Qibla" : "Takbir — both hands raised to shoulder level, palms facing the Qibla";
  const foldBn = (M === "hanafi" || M === "hanbali") ? "হাত বাঁধা — ডান হাত বাম হাতের ওপর, নাভির নিচে" : M === "maliki" ? "কিয়াম — দুই হাত দুই পাশে ঝুলন্ত (মালেকি)" : "হাত বাঁধা — ডান হাত বাম হাতের ওপর, বুকের ওপর";
  const foldEn = (M === "hanafi" || M === "hanbali") ? "Folding the hands — right hand over the left, below the navel" : M === "maliki" ? "Qiyam — arms hanging at the sides (Maliki)" : "Folding the hands — right hand over the left, on the chest";
  const qaBn = (M === "shafii" || M === "hanbali") ? "কওমা — সোজা হয়ে দাঁড়িয়ে আবার বুকে হাত বাঁধা" : "কওমা — রুকু থেকে সোজা হয়ে দাঁড়ানো";
  const qaEn = (M === "shafii" || M === "hanbali") ? "Qawmah — standing fully straight, hands folded on the chest again" : "Qawmah — rising from ruku to stand fully straight";
  const sitBn = M === "hanafi" ? "শেষ বৈঠক — তাশাহহুদ: বাম পায়ের ওপর বসা (ইফতিরাশ), ডান তর্জনী তোলা" : "শেষ বৈঠক — তাশাহহুদ: তাওয়াররুক করে বসা, ডান তর্জনী তোলা";
  const sitEn = M === "hanafi" ? "Final sitting — Tashahhud: sitting on the left foot (iftirash), right index finger raised" : "Final sitting — Tashahhud: sitting in tawarruk, right index finger raised";
  const segs = [
    {p:"stand", move:0.7, hold:1.4, bn:"দাঁড়ানো — কিবলামুখী হয়ে সোজা দাঁড়ান, দৃষ্টি সিজদার জায়গার দিকে", en:"Standing — stand straight facing the Qibla, gaze at the place of prostration", sBn:"দাঁড়ানো", sEn:"Stand"},
    {p:"takbir", move:1.2, hold:1.8, bn:takBn, en:takEn, sBn:"তাকবির", sEn:"Takbir"},
    {p:"qiyam", move:1.1, hold:1.9, bn:foldBn, en:foldEn, sBn:"হাত বাঁধা", sEn:"Fold hands"},
    {p:"ruku", move:1.4, hold:2.1, bn:"রুকু — পিঠ একদম সমতল, মাথা পিঠের সমান উঁচু, দুই হাত হাঁটু চেপে ধরা, আঙুল ফাঁক", en:"Ruku — back completely flat, head level with the back, both hands gripping the knees, fingers spread", sBn:"রুকু", sEn:"Ruku"},
    {p:"qaumah", move:1.3, hold:1.6, bn:qaBn, en:qaEn, sBn:"কওমা", sEn:"Qawmah"},
    {p:"sujud", move:1.6, hold:2.2, bn:"সিজদা — কপাল ও নাক, দুই হাত, দুই হাঁটু ও দুই পায়ের আঙুল মাটিতে (সাত হাড়); কনুই মাটি থেকে ওঠানো, বাহু পাঁজর থেকে ফাঁক", en:"Sujud — forehead and nose, both hands, both knees and the toes on the ground (seven bones); elbows raised, arms away from the sides", sBn:"সিজদা", sEn:"Sujud"},
    {p:"jalsa", move:1.3, hold:1.8, bn:"জলসা — সিজদা থেকে উঠে বাম পায়ের ওপর বসা, ডান পা খাড়া, দুই হাত ঊরুর ওপর", en:"Jalsa — rising from sujud, sitting on the left foot, right foot upright, hands on the thighs", sBn:"জলসা", sEn:"Jalsa"},
    {p:"sujud", move:1.3, hold:1.7, bn:"দ্বিতীয় সিজদা — ঠিক প্রথম সিজদার মতো", en:"Second prostration — exactly like the first", sBn:"২য় সিজদা", sEn:"Sujud 2"},
    {p:"qiyam", move:1.5, hold:1.3, bn:"দ্বিতীয় রাকাত — উঠে দাঁড়িয়ে আবার হাত বাঁধা", en:"Second rak'ah — standing up and folding the hands again", sBn:"২য় রাকাত", sEn:"Rak'ah 2"},
    {p:"ruku", move:1.3, hold:1.1, bn:"রুকু — পিঠ সমতল, হাত হাঁটুতে", en:"Ruku — back flat, hands on the knees", sBn:"রুকু", sEn:"Ruku"},
    {p:"sujud", move:1.4, hold:1.1, bn:"সিজদা — সাত হাড়ের ওপর", en:"Sujud — on the seven bones", sBn:"সিজদা", sEn:"Sujud"},
    {p:"tash", move:1.4, hold:2.1, bn:sitBn, en:sitEn, sBn:"তাশাহহুদ", sEn:"Tashahhud"},
    {p:"salamR", move:0.9, hold:1.6, bn:"সালাম — ডান দিকে মুখ ফিরিয়ে: আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ", en:"Salam — turning the face to the right: As-salamu alaykum wa rahmatullah", sBn:"সালাম (ডান)", sEn:"Salam (R)"}
  ];
  if (M !== "maliki") segs.push({p:"salamL", move:0.9, hold:1.7, bn:"সালাম — বাম দিকে মুখ ফিরিয়ে: আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ", en:"Salam — turning the face to the left: As-salamu alaykum wa rahmatullah", sBn:"সালাম (বাম)", sEn:"Salam (L)"});
  segs.forEach(s => {
    if (s.p === "salamR") s.pose = poseFor("salam", M);
    else if (s.p === "salamL"){ const b = poseFor("salam", M); s.pose = {}; for (const k in b) s.pose[k] = b[k]; s.pose.head = [b.head[0] - 14, b.head[1] + 3]; s.pose.gaze = 168; }
    else if (s.p === "tash") s.pose = poseFor("tashahhudFinal", M);
    else s.pose = poseFor(s.p, M);
  });
  const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (reduce) segs.forEach(s => { s.move = 0; });
  demo.innerHTML = `<div class="learn-fig">${figSVG(segs[0].pose, "", "")}</div>`
    + `<div class="demo-cap" id="dm-cap"></div>`
    + `<div class="demo-prog"><div id="dm-prog"></div></div>`
    + `<div class="demo-controls"><button class="btn gold" id="dm-play"></button><button class="btn ghost" id="dm-restart">↺ ${L("Restart", "আবার শুরু")}</button></div>`;
  if (seq) seq.innerHTML = segs.map((s, i) => `<button class="dchip" data-seg="${i}">${L(s.sEn, s.sBn)}</button>`).join("");
  const root = demo.querySelector("svg"), cap = document.getElementById("dm-cap"),
    prog = document.getElementById("dm-prog"), playBtn = document.getElementById("dm-play");
  const chips = seq ? Array.prototype.slice.call(seq.querySelectorAll("[data-seg]")) : [];
  const starts = []; let T = 0;
  segs.forEach(s => { starts.push(T); T += s.move + s.hold; });
  let startT = performance.now(), pausedAt = reduce ? startT : null, raf = 0, curSeg = -1, stopped = false;
  const ease = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  function poseAtTime(t){
    let i = segs.length - 1;
    for (let j = 0; j < segs.length; j++){ if (t < starts[j] + segs[j].move + segs[j].hold){ i = j; break; } }
    const s = segs[i], prev = i === 0 ? s.pose : segs[i - 1].pose, lt = t - starts[i];
    const pose = (s.move > 0 && lt < s.move) ? lerpPose(prev, s.pose, ease(Math.max(0, lt / s.move))) : s.pose;
    return {pose: pose, i: i};
  }
  function syncPlayBtn(){ if (playBtn) playBtn.textContent = pausedAt != null ? "▶ " + L("Play", "চালান") : "⏸ " + L("Pause", "বিরতি"); }
  function frame(now){
    if (stopped) return;
    const view = document.getElementById("view-learn");
    if (!view || !view.classList.contains("active")){ window.__demoStop = null; return; }
    const t = (((pausedAt != null ? pausedAt : now) - startT) / 1000) % T;
    const r = poseAtTime(t < 0 ? 0 : t);
    drawPose(root, r.pose);
    if (r.i !== curSeg){ curSeg = r.i; if (cap) cap.textContent = L(segs[r.i].en, segs[r.i].bn);
      chips.forEach((c, j) => c.classList.toggle("on", j === r.i)); }
    if (prog) prog.style.width = (T ? (t / T) * 100 : 0) + "%";
    raf = requestAnimationFrame(frame);
  }
  function stop(){ stopped = true; if (raf) cancelAnimationFrame(raf); }
  window.__demoStop = stop;
  if (playBtn) playBtn.onclick = () => {
    if (pausedAt != null){ startT += performance.now() - pausedAt; pausedAt = null; }
    else {
      /* Snap to the current step's pose so pause never freezes mid-move. */
      const t0 = ((performance.now() - startT) / 1000) % T, t = t0 < 0 ? 0 : t0;
      const i = poseAtTime(t).i;
      startT = performance.now() - (starts[i] + segs[i].move + 0.02) * 1000;
      pausedAt = performance.now();
    }
    syncPlayBtn();
  };
  const rst = document.getElementById("dm-restart");
  if (rst) rst.onclick = () => { startT = performance.now(); if (pausedAt != null) pausedAt = startT; curSeg = -1; };
  chips.forEach(c => { c.onclick = () => {
    const i = +c.dataset.seg;
    startT = performance.now() - (starts[i] + segs[i].move + 0.02) * 1000;
    if (pausedAt != null) pausedAt = performance.now();
    curSeg = -1;
    /* Keep the figure visible after a chip tap: the tap itself makes the
       browser scroll the page (button focus), which slides the stage
       under the sticky header — so blur the chip and centre the stage
       after the browser's scroll has happened. */
    c.blur();
    const st = demo.querySelector(".demo-stage");
    if (st) setTimeout(() => st.scrollIntoView({behavior:"smooth", block:"center"}), 100);
  }; });
  syncPlayBtn();
  raf = requestAnimationFrame(frame);
}

const MADHHABS = [
  {id:"hanafi", en:"Hanafi", bn:"হানাফি"},
  {id:"shafii", en:"Shafi'i", bn:"শাফেয়ি"},
  {id:"maliki", en:"Maliki", bn:"মালেকি"},
  {id:"hanbali", en:"Hanbali", bn:"হাম্বলি"}
];
const madhhabName = id => { const x = MADHHABS.find(y=>y.id===id) || MADHHABS[0]; return L(x.en, x.bn); };
const learnMadhhab = () => settings.learnMadhhab || "hanafi";
const LEARN_RAKATS = [
  {bn:"ফজর", en:"Fajr", n:2},{bn:"যোহর", en:"Dhuhr", n:4},{bn:"আসর", en:"Asr", n:4},
  {bn:"মাগরিব", en:"Maghrib", n:3},{bn:"ইশা", en:"Isha", n:4}
];
const LEARN_STEPS = [
 {posture:"qaumah", tBn:"ওজু, নিয়ত ও কিবলামুখী হওয়া", tEn:"Wudu, intention & facing the Qibla",
  dBn:"নামাজের আগে ভালোভাবে ওজু করুন। তারপর কিবলামুখী হয়ে সোজা দাঁড়ান এবং মনে মনে নিয়ত করুন কোন নামাজ পড়ছেন — নিয়ত মুখে বলা শর্ত নয়, মনের সংকল্পই নিয়ত।",
  dEn:"Make wudu properly before prayer. Then stand straight facing the Qibla and intend in your heart which prayer you are performing — intention is in the heart; it does not need to be spoken aloud.",
  rBn:"হাদিস: “সব কাজ নিয়তের ওপর নির্ভরশীল।” (বুখারি ১, মুসলিম ১৯০৭) • “যখন নামাজে দাঁড়াবে, ভালোভাবে ওজু করো, তারপর কিবলামুখী হয়ে তাকবির বলো।” (বুখারি ৭৫৭, মুসলিম ৩৯৭)",
  rEn:"Hadith: “Actions are but by intentions.” (Bukhari 1, Muslim 1907) • “When you stand for prayer, perform wudu well, then face the Qibla and say the Takbir.” (Bukhari 757, Muslim 397)"},
 {posture:"takbir", tBn:"তাকবিরে তাহরিমা — হাত তোলা", tEn:"Takbir — raising the hands",
  dBn:"দুই হাত কাঁধ বরাবর অথবা কানের লতি পর্যন্ত তুলুন — আঙুলগুলো স্বাভাবিকভাবে মিলিয়ে রাখুন। তারপর “আল্লাহু আকবার” বলে নামাজ শুরু করুন। এই তাকবিরের পর নামাজের বাইরের সব কাজ হারাম হয়ে যায়, তাই একে তাকবিরে তাহরিমা বলে।",
  dEn:"Raise both hands to shoulder level or up to the earlobes, fingers naturally together, then say “Allahu Akbar” to begin. After this Takbir, everything outside prayer becomes forbidden — hence its name, Takbir al-Tahrimah.",
  say:{ar:"اللَّهُ أَكْبَرُ", tr:"Allahu Akbar", bn:"আল্লাহ সর্বশ্রেষ্ঠ মহান।", en:"Allah is the Greatest."},
  rBn:"হাদিস: ইবনে উমার (রা.) বলেন, রাসূলুল্লাহ ﷺ নামাজ শুরুর সময় দুই হাত কাঁধ বরাবর তুলতেন। (বুখারি ৭৩৫, মুসলিম ৩৯০) কানের লতি পর্যন্ত তোলার বর্ণনাও সহিহ হাদিসে আছে। (মুসলিম ৩৯১)",
  rEn:"Hadith: Ibn Umar (RA) said the Prophet ﷺ raised his hands to shoulder level when starting the prayer. (Bukhari 735, Muslim 390) Raising them to the earlobes is also reported. (Muslim 391)"},
 {posture:"qiyam", tBn:"হাত বাঁধা (কিয়াম)", tEn:"Folding the hands (Qiyam)",
  dBn:"ডান হাত বাম হাতের ওপর রেখে হাত বাঁধুন। সহিহ বর্ণনা অনুযায়ী নবী ﷺ হাত বুকের ওপর রাখতেন; হানাফি মাজহাবে নাভির নিচে বাঁধা হয় — দুটোর পক্ষেই বর্ণনা আছে। দৃষ্টি সিজদার জায়গার দিকে রাখুন।",
  dEn:"Place the right hand over the left and fold them. Authentic reports describe the Prophet ﷺ placing them on his chest; the Hanafi school places them below the navel — both have narrations. Keep your gaze at the place of prostration.",
  rBn:"হাদিস: ওয়াইল ইবনে হুজর (রা.) বলেন, “আমি নবী ﷺ-এর সঙ্গে নামাজ পড়েছি; তিনি ডান হাত বাম হাতের ওপর রেখে বুকের ওপর রাখলেন।” (ইবনে খুজায়মা ৪৭৯, সহিহ; মুসলিম ৪০১)",
  rEn:"Hadith: Wa'il ibn Hujr (RA) said, “I prayed with the Prophet ﷺ; he placed his right hand over his left hand upon his chest.” (Ibn Khuzaymah 479, sahih; Muslim 401)"},
 {posture:"qiyam", tBn:"দোয়ায়ে ইস্তিফতাহ (সানা)", tEn:"Opening dua (Sana)",
  dBn:"তাকবিরের পর নীরবে দোয়ায়ে ইস্তিফতাহ পড়ুন।",
  dEn:"After the Takbir, quietly recite the opening dua.",
  say:{ar:"سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ…", tr:"Subhanaka Allahumma wa bihamdika…", bn:"হে আল্লাহ! আপনি পবিত্র, আপনারই প্রশংসা…", en:"Glory be to You, O Allah, and praise be to You…", goto:0},
  rBn:"হাদিস: আয়েশা (রা.) বলেন, নবী ﷺ নামাজ শুরু করে এই দোয়া পড়তেন। (আবু দাউদ ৭৭৬, তিরমিজি ২৪৩)",
  rEn:"Hadith: Aisha (RA) said the Prophet ﷺ opened his prayer with this dua. (Abu Dawud 776, Tirmidhi 243)"},
 {posture:"qiyam", tBn:"সূরা ফাতিহা", tEn:"Surah Al-Fatiha",
  dBn:"মনে মনে “আউযু বিল্লাহি মিনাশ শাইতানির রাজিম” ও “বিসমিল্লাহির রাহমানির রাহিম” পড়ে সূরা ফাতিহা পড়ুন। প্রতি রাকাতে ফাতিহা পড়া অপরিহার্য। ইমামের পেছনে পড়ার বিষয়ে মাজহাবভেদে মতভেদ আছে।",
  dEn:"Quietly say A'udhu billah and Bismillah, then recite Surah Al-Fatiha. It is essential in every rak'ah. Whether to recite it behind an imam differs by school of thought.",
  say:{ar:"الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ…", tr:"Alhamdu lillahi Rabbil-'alamin…", bn:"সব প্রশংসা আল্লাহর, যিনি সৃষ্টিজগতের রব…", en:"All praise is for Allah, Lord of the worlds…", goto:1},
  rBn:"হাদিস: “যে ব্যক্তি সূরা ফাতিহা পড়ে না, তার নামাজ হয় না।” (বুখারি ৭৫৬, মুসলিম ৩৯৪)",
  rEn:"Hadith: “There is no prayer for the one who does not recite Al-Fatiha.” (Bukhari 756, Muslim 394)"},
 {posture:"qiyam", tBn:"সূরা মিলানো", tEn:"Reciting another surah",
  dBn:"প্রথম দুই রাকাতে ফাতিহার পর অন্য কোনো সূরা বা কুরআনের কিছু আয়াত পড়ুন — যেমন সূরা কাওসার, আসর, ইখলাস, ফালাক বা নাস (নিচে দেওয়া আছে)। শেষ রাকাতগুলোতে শুধু ফাতিহাই যথেষ্ট।",
  dEn:"In the first two rak'ahs, after Al-Fatiha recite another surah or some verses — e.g. Al-Kawthar, Al-Asr, Al-Ikhlas, Al-Falaq or An-Nas (given below). In the later rak'ahs, Al-Fatiha alone is enough.",
  rBn:"হাদিস: “তারপর কুরআন থেকে যা তোমার জন্য সহজ তা পড়ো।” (বুখারি ৭৫৭, মুসলিম ৩৯৭)",
  rEn:"Hadith: “Then recite what is easy for you from the Quran.” (Bukhari 757, Muslim 397)"},
 {posture:"ruku", tBn:"রুকু", tEn:"Ruku (bowing)",
  dBn:"“আল্লাহু আকবার” বলে রুকু করুন। দুই হাতের তালু হাঁটুর ওপর রেখে আঙুল ফাঁক করে হাঁটু ধরুন, পিঠ সমতল রাখুন — মাথা পিঠের সমান, বেশি উঁচুও নয়, নিচুও নয়। তাড়াহুড়ো না করে স্থির হয়ে থাকুন।",
  dEn:"Say “Allahu Akbar” and bow. Place your palms firmly on your knees with fingers spread, keep the back flat and level, the head in line with the back — neither raised nor lowered. Stay still, without rushing.",
  say:{ar:"سُبْحَانَ رَبِّيَ الْعَظِيمِ (৩ বার)", tr:"Subhana Rabbiyal-'Azim (3 times)", bn:"আমার মহান রব পবিত্র (৩ বার)।", en:"Glory be to my Lord, the Almighty (3 times)."},
  rBn:"হাদিস: “তারপর রুকু করো, যাতে রুকুতে স্থির হতে পারো।” (বুখারি ৭৫৭) আয়েশা (রা.) বলেন, নবী ﷺ রুকুতে মাথা উঁচুও করতেন না, নিচুও করতেন না। (আবু দাউদ ৭৩০) রুকুর দোয়া: মুসলিম ৭৭২",
  rEn:"Hadith: “Then bow until you are at rest in bowing.” (Bukhari 757) Aisha (RA) said the Prophet ﷺ neither raised nor lowered his head in ruku. (Abu Dawud 730) Ruku dua: Muslim 772",
  mNote:{hanafi:{bn:"হানাফি মতে রুকুতে যাওয়ার আগে হাত তোলা হয় না — শুধু তাকবিরে তাহরিমায় হাত তোলা হয়।",en:"Hanafi: hands are not raised again before ruku — only at the opening takbir."},shafii:{bn:"শাফেয়ি মতে রুকুতে যাওয়ার আগে তাকবিরের সঙ্গে হাত কাঁধ বরাবর তোলা হয়।",en:"Shafi'i: hands are raised to the shoulders with the takbir before bowing."},maliki:{bn:"মালেকি মতে রুকুতে যাওয়ার আগে হাত তোলা হয় না।",en:"Maliki: hands are not raised again before ruku."},hanbali:{bn:"হাম্বলি মতে রুকুতে যাওয়ার আগে তাকবিরের সঙ্গে হাত কাঁধ বরাবর তোলা হয়।",en:"Hanbali: hands are raised to the shoulders with the takbir before bowing."}}},
 {posture:"qaumah", tBn:"কওমা — রুকু থেকে ওঠা", tEn:"Qawmah — rising from ruku",
  dBn:"“সামি'আল্লাহু লিমান হামিদাহ” বলতে বলতে সোজা হয়ে দাঁড়ান এবং সম্পূর্ণ স্থির হয়ে “রাব্বানা ওয়া লাকাল হামদ” বলুন।",
  dEn:"Rise saying “Sami'allahu liman hamidah” until you stand fully straight and still, then say “Rabbana wa lakal-hamd”.",
  say:{ar:"سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ، رَبَّنَا وَلَكَ الْحَمْدُ", tr:"Sami'allahu liman hamidah, Rabbana wa lakal-hamd", bn:"যে আল্লাহর প্রশংসা করে, আল্লাহ তা শোনেন। হে আমাদের রব! সব প্রশংসা আপনারই।", en:"Allah hears the one who praises Him. Our Lord, to You belongs all praise.", goto:3},
  rBn:"হাদিস: বুখারি ৭৯৫, মুসলিম ৩৯২",
  rEn:"Hadith: Bukhari 795, Muslim 392"},
 {posture:"sujud", tBn:"সিজদা", tEn:"Sujud (prostration)",
  dBn:"“আল্লাহু আকবার” বলে সিজদায় যান। সাতটি হাড়ের ওপর সিজদা করুন: কপাল ও নাক, দুই হাত, দুই হাঁটু এবং দুই পায়ের আঙুল। হাতের আঙুল কিবলামুখী করে মিলিয়ে রাখুন, বাহু পাঁজর থেকে ফাঁক রাখুন, আর হাত কুকুরের মতো মাটিতে বিছিয়ে দেবেন না। স্থির হয়ে সিজদার দোয়া পড়ুন।",
  dEn:"Say “Allahu Akbar” and prostrate on seven bones: the forehead and nose, both hands, both knees and the toes of both feet. Keep the fingers together facing the Qibla, the arms away from your sides, and do not spread the forearms on the ground like a dog. Stay still and recite the sujud dua.",
  say:{ar:"سُبْحَانَ رَبِّيَ الْأَعْلَى (৩ বার)", tr:"Subhana Rabbiyal-A'la (3 times)", bn:"আমার সর্বোচ্চ রব পবিত্র (৩ বার)।", en:"Glory be to my Lord, the Most High (3 times)."},
  rBn:"হাদিস: “আমাকে সাতটি হাড়ের ওপর সিজদা করার আদেশ দেওয়া হয়েছে।” (বুখারি ৮১২, মুসলিম ৪৯০) • “তোমাদের কেউ যেন কুকুরের বিছানোর মতো দুই হাত বিছিয়ে না দেয়।” (বুখারি ৮২২) সিজদার দোয়া: মুসলিম ৭৭২",
  rEn:"Hadith: “I was commanded to prostrate on seven bones.” (Bukhari 812, Muslim 490) • “None of you should spread his forearms as a dog spreads them.” (Bukhari 822) Sujud dua: Muslim 772",
  mNote:{hanafi:{bn:"হানাফি মতে সিজদায় যাওয়ার সময় আগে হাঁটু, তারপর হাত, তারপর নাক ও কপাল মাটিতে রাখা হয়।",en:"Hanafi: knees go down first, then hands, then nose and forehead."},shafii:{bn:"শাফেয়ি মতে সিজদায় যাওয়ার সময় হাত আগে, তারপর হাঁটু মাটিতে রাখা হয়।",en:"Shafi'i: hands go down first, then the knees."},maliki:{bn:"মালেকি মতে সিজদায় যাওয়ার সময় হাত আগে, তারপর হাঁটু মাটিতে রাখা হয়।",en:"Maliki: hands go down first, then the knees."},hanbali:{bn:"হাম্বলি মতে সিজদায় যাওয়ার সময় হাত আগে, তারপর হাঁটু মাটিতে রাখা হয়।",en:"Hanbali: hands go down first, then the knees."}}},
 {posture:"jalsa", tBn:"জলসা — দুই সিজদার মাঝে বসা", tEn:"Jalsa — sitting between the two prostrations",
  dBn:"সিজদা থেকে উঠে সোজা হয়ে বসুন — ডান পা খাড়া রেখে বাম পায়ের ওপর বসা (ইফতিরাশ) সুন্নত। তাড়াহুড়ো না করে স্থির হয়ে এই দোয়া পড়ুন। তারপর “আল্লাহু আকবার” বলে দ্বিতীয় সিজদা করুন — ঠিক প্রথম সিজদার মতো।",
  dEn:"Rise from prostration and sit up straight — sitting on the left foot with the right foot upright (iftirash) is the Sunnah. Stay still and recite this dua. Then say “Allahu Akbar” and make the second prostration, exactly like the first.",
  say:{ar:"رَبِّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي، وَارْزُقْنِي", tr:"Rabbighfir li, warhamni, wahdini, wa 'afini, warzuqni", bn:"হে আমার রব! আমাকে ক্ষমা করুন, আমার প্রতি রহম করুন, আমাকে হিদায়াত দিন, আমাকে সুস্থতা দিন ও আমাকে রিজিক দিন।", en:"My Lord, forgive me, have mercy on me, guide me, grant me well-being and provide for me.", goto:5},
  rBn:"হাদিস: ইবনে আব্বাস (রা.) বলেন, নবী ﷺ দুই সিজদার মাঝে এই দোয়া পড়তেন। (আবু দাউদ ৮৫০, ইবনে মাজাহ ৮৯৭)",
  rEn:"Hadith: Ibn Abbas (RA) said the Prophet ﷺ used to say this between the two prostrations. (Abu Dawud 850, Ibn Majah 897)"},
 {posture:"qiyam", tBn:"দ্বিতীয় রাকাত", tEn:"The second rak'ah",
  dBn:"দ্বিতীয় সিজদা শেষে “আল্লাহু আকবার” বলে উঠে দাঁড়ান এবং দ্বিতীয় রাকাত ঠিক প্রথম রাকাতের মতোই পড়ুন — ফাতিহা, সূরা, রুকু, কওমা, দুই সিজদা। তবে দ্বিতীয় রাকাতে সানা পড়তে হয় না।",
  dEn:"After the second prostration, rise saying “Allahu Akbar” and pray the second rak'ah exactly like the first — Fatiha, surah, ruku, qawmah and two prostrations. The opening dua (Sana) is not repeated in the second rak'ah.",
  rBn:"হাদিস: “তারপর পুরো নামাজে এভাবেই করো।” (বুখারি ৭৫৭, মুসলিম ৩৯৭)",
  rEn:"Hadith: “Then do that throughout your prayer.” (Bukhari 757, Muslim 397)"},
 {posture:"tashahhud", tBn:"তাশাহহুদ", tEn:"Tashahhud",
  dBn:"দ্বিতীয় রাকাতের শেষে বসে আত্তাহিয়্যাতু পড়ুন। নামাজ দুই রাকাতের হলে এরপর দরুদ ও দোয়া পড়ে সালাম ফেরাবেন; তিন বা চার রাকাতের হলে আত্তাহিয়্যাতুর পর উঠে বাকি রাকাত পড়ুন, আর শেষ বসায় আত্তাহিয়্যাতু, দরুদ ও দোয়া পড়ুন। বসা অবস্থায় ডান হাতের তর্জনী দিয়ে ইশারা করার বর্ণনা সহিহ হাদিসে আছে।",
  dEn:"At the end of the second rak'ah, sit and recite the Tashahhud (At-Tahiyyat). If the prayer has two rak'ahs, continue with Durood and dua, then give Salam. For three or four rak'ahs, rise after the Tashahhud for the remaining rak'ahs, and in the final sitting recite Tashahhud, Durood and dua. Pointing with the right index finger while sitting is reported in authentic hadith.",
  say:{ar:"التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ…", tr:"At-tahiyyatu lillahi was-salawatu wat-tayyibat…", bn:"সব মৌখিক, শারীরিক ও আর্থিক ইবাদত আল্লাহরই জন্য…", en:"All greetings, prayers and pure words are for Allah…", goto:6},
  rBn:"হাদিস: ইবনে মাসউদ (রা.) বলেন, রাসূলুল্লাহ ﷺ নিজ হাতে ধরে আমাকে তাশাহহুদ শিখিয়েছেন। (বুখারি ৮৩১, মুসলিম ৪০২)",
  rEn:"Hadith: Ibn Mas'ud (RA) said the Messenger of Allah ﷺ taught him the Tashahhud, holding his hand. (Bukhari 831, Muslim 402)",
  mNote:{hanafi:{bn:"আঙুলের ইশারা: “লা” বলার সময় তর্জনী তুলুন, “ইল্লাল্লাহ” বলার সময় নামিয়ে নিন।",en:"Finger: raise the index finger at “la” and lower it at “ill-Allah”."},shafii:{bn:"আঙুলের ইশারা: “ইল্লাল্লাহ” বলার সময় তর্জনী তুলে ধরে রাখুন।",en:"Finger: raise the index finger at “ill-Allah” and keep it raised."},maliki:{bn:"আঙুলের ইশারা: তর্জনী ডানে-বামে নাড়াতে থাকুন। বসা: তাওয়াররুক।",en:"Finger: move the index finger from side to side. Seat: tawarruk."},hanbali:{bn:"আঙুলের ইশারা: আল্লাহর নাম উচ্চারণের সময় তর্জনী দিয়ে ইশারা করুন।",en:"Finger: point with the index finger when the name of Allah is mentioned."}}},
 {posture:"tashahhudFinal", tBn:"দরুদ ও দোয়া মাসূরা", tEn:"Durood & Dua Masura",
  dBn:"শেষ তাশাহহুদে আত্তাহিয়্যাতুর পর দরুদে ইবরাহিমি পড়ুন, তারপর দোয়া মাসূরা বা কুরআন-হাদিসের যেকোনো দোয়া পড়ুন।",
  dEn:"In the final sitting, after the Tashahhud recite Durood Ibrahim, then Dua Masura or any dua from the Quran and Sunnah.",
  say:{ar:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ…", tr:"Allahumma salli 'ala Muhammad…", bn:"হে আল্লাহ! মুহাম্মাদ ﷺ-এর ওপর রহমত বর্ষণ করুন…", en:"O Allah, send blessings upon Muhammad…", goto:7},
  rBn:"হাদিস: দরুদ — বুখারি ৩৩৭০, মুসলিম ৪০৬ • দোয়া মাসূরা — বুখারি ৮৩৪, মুসলিম ২৭০৫",
  rEn:"Hadith: Durood — Bukhari 3370, Muslim 406 • Dua Masura — Bukhari 834, Muslim 2705",
  mNote:{hanafi:{bn:"শেষ বসা: ইফতিরাশ — বাম পায়ের ওপর বসা।",en:"Final sitting: iftirash — sitting on the left foot."},shafii:{bn:"শেষ বসা: তাওয়াররুক — বাম নিতম্ব মাটিতে রেখে বসা।",en:"Final sitting: tawarruk — sitting on the left hip."},maliki:{bn:"শেষ বসা: তাওয়াররুক — বাম নিতম্ব মাটিতে রেখে বসা।",en:"Final sitting: tawarruk — sitting on the left hip."},hanbali:{bn:"শেষ বসা: তাওয়াররুক — বাম নিতম্ব মাটিতে রেখে বসা।",en:"Final sitting: tawarruk — sitting on the left hip."}}},
 {posture:"salam", tBn:"সালাম — নামাজ শেষ", tEn:"Salam — ending the prayer",
  dBn:"ডান দিকে মুখ ফিরিয়ে “আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ” বলুন, তারপর বাম দিকে মুখ ফিরিয়ে একই কথা বলুন — এর মাধ্যমে নামাজ শেষ হয়। নামাজের পরের আজকার (যেমন আস্তাগফিরুল্লাহ ৩ বার) দোয়া অংশে পাবেন।",
  dEn:"Turn your face to the right and say “As-salamu alaykum wa rahmatullah”, then turn to the left and say the same — this ends the prayer. The after-prayer adhkar (e.g. Astaghfirullah three times) are in the Duas section.",
  say:{ar:"السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", tr:"As-salamu 'alaykum wa rahmatullah", bn:"আপনাদের ওপর শান্তি ও আল্লাহর রহমত বর্ষিত হোক।", en:"Peace be upon you and the mercy of Allah."},
  rBn:"হাদিস: মুসলিম ৫৮২",
  rEn:"Hadith: Muslim 582",
  mNote:{maliki:{bn:"মালেকি মতে এক সালাম — শুধু ডান দিকে।",en:"Maliki: one salam — to the right only."}}}
];
const LEARN_DUAS = [
 {tBn:"দোয়ায়ে ইস্তিফতাহ (সানা)", tEn:"Opening Dua (Sana)",
  ar:"سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
  tr:"Subhanaka Allahumma wa bihamdika, wa tabarakasmuka, wa ta'ala jadduka, wa la ilaha ghayruk.",
  bn:"হে আল্লাহ! আপনি পবিত্র, আপনারই সব প্রশংসা। আপনার নাম বরকতময়, আপনার মর্যাদা সর্বোচ্চ, আর আপনি ছাড়া কোনো ইলাহ নেই।",
  en:"Glory be to You, O Allah, and praise be to You. Blessed is Your name, exalted is Your majesty, and there is no god but You.",
  ref:"আবু দাউদ ৭৭৬, তিরমিজি ২৪৩ / Abu Dawud 776, Tirmidhi 243"},
 {tBn:"সূরা আল-ফাতিহা", tEn:"Surah Al-Fatiha",
  ar:"بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾",
  tr:"Bismillahir-Rahmanir-Rahim. Alhamdu lillahi Rabbil-'alamin. Ar-Rahmanir-Rahim. Maliki yawmid-din. Iyyaka na'budu wa iyyaka nasta'in. Ihdinas-siratal-mustaqim. Siratal-ladhina an'amta 'alayhim, ghayril-maghdubi 'alayhim wa lad-dallin.",
  bn:"পরম করুণাময় অসীম দয়ালু আল্লাহর নামে। সব প্রশংসা আল্লাহর, যিনি সৃষ্টিজগতের রব। পরম করুণাময়, অসীম দয়ালু। বিচার দিনের মালিক। আমরা শুধু আপনারই ইবাদত করি এবং শুধু আপনার কাছেই সাহায্য চাই। আমাদের সরল পথ দেখান — তাদের পথ, যাদের আপনি অনুগ্রহ করেছেন; তাদের পথ নয়, যাদের ওপর গজব পড়েছে, আর না পথভ্রষ্টদের।",
  en:"In the name of Allah, the Most Gracious, the Most Merciful. All praise is for Allah, Lord of the worlds. The Most Gracious, the Most Merciful. Master of the Day of Judgement. You alone we worship, and You alone we ask for help. Guide us along the Straight Path — the path of those You have blessed; not of those who earned Your anger, nor of those who went astray.",
  ref:"কুরআন ১:১–৭ / Quran 1:1–7"},
 {tBn:"রুকুর দোয়া", tEn:"Dua of Ruku",
  ar:"سُبْحَانَ رَبِّيَ الْعَظِيمِ",
  tr:"Subhana Rabbiyal-'Azim (3 times).",
  bn:"আমার মহান রব পবিত্র (৩ বার পড়ুন)।",
  en:"Glory be to my Lord, the Almighty (say 3 times).",
  ref:"মুসলিম ৭৭২ / Muslim 772"},
 {tBn:"কওমার দোয়া (রুকু থেকে উঠে)", tEn:"Dua of Qawmah (rising from Ruku)",
  ar:"سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ، رَبَّنَا وَلَكَ الْحَمْدُ، حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ",
  tr:"Sami'allahu liman hamidah. Rabbana wa lakal-hamdu, hamdan kathiran tayyiban mubarakan fih.",
  bn:"যে আল্লাহর প্রশংসা করে, আল্লাহ তা শোনেন। হে আমাদের রব! আপনার জন্যই সব প্রশংসা — অনেক, পবিত্র ও বরকতময় প্রশংসা।",
  en:"Allah hears whoever praises Him. Our Lord, to You belongs all praise — abundant, pure and blessed praise.",
  ref:"বুখারি ৭৯৫, ৭৯৯ / Bukhari 795, 799"},
 {tBn:"সিজদার দোয়া", tEn:"Dua of Sujud",
  ar:"سُبْحَانَ رَبِّيَ الْأَعْلَى",
  tr:"Subhana Rabbiyal-A'la (3 times).",
  bn:"আমার সর্বোচ্চ রব পবিত্র (৩ বার পড়ুন)।",
  en:"Glory be to my Lord, the Most High (say 3 times).",
  ref:"মুসলিম ৭৭২ / Muslim 772"},
 {tBn:"দুই সিজদার মাঝের দোয়া", tEn:"Dua between the Two Prostrations",
  ar:"رَبِّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي، وَارْزُقْنِي",
  tr:"Rabbighfir li, warhamni, wahdini, wa 'afini, warzuqni.",
  bn:"হে আমার রব! আমাকে ক্ষমা করুন, আমার প্রতি রহম করুন, আমাকে হিদায়াত দিন, আমাকে সুস্থতা দিন এবং আমাকে রিজিক দিন।",
  en:"My Lord, forgive me, have mercy on me, guide me, grant me well-being, and provide for me.",
  ref:"আবু দাউদ ৮৫০, ইবনে মাজাহ ৮৯৭ / Abu Dawud 850, Ibn Majah 897"},
 {tBn:"তাশাহহুদ (আত্তাহিয়্যাতু)", tEn:"Tashahhud (At-Tahiyyat)",
  ar:"التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
  tr:"At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu 'alayna wa 'ala 'ibadillahis-salihin. Ashhadu an la ilaha illallah, wa ashhadu anna Muhammadan 'abduhu wa rasuluh.",
  bn:"সব মৌখিক, শারীরিক ও আর্থিক ইবাদত আল্লাহরই জন্য। হে নবী! আপনার ওপর শান্তি, আল্লাহর রহমত ও বরকত বর্ষিত হোক। আমাদের ওপর এবং আল্লাহর নেক বান্দাদের ওপর শান্তি বর্ষিত হোক। আমি সাক্ষ্য দিচ্ছি, আল্লাহ ছাড়া কোনো ইলাহ নেই; আর সাক্ষ্য দিচ্ছি, মুহাম্মাদ ﷺ তাঁর বান্দা ও রাসূল।",
  en:"All greetings, prayers and pure words are for Allah. Peace be upon you, O Prophet, and the mercy and blessings of Allah. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.",
  ref:"বুখারি ৮৩১, মুসলিম ৪০২ / Bukhari 831, Muslim 402"},
 {tBn:"দরুদে ইবরাহিমি", tEn:"Durood Ibrahim",
  ar:"اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
  tr:"Allahumma salli 'ala Muhammadin wa 'ala ali Muhammad, kama sallayta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammad, kama barakta 'ala Ibrahima wa 'ala ali Ibrahim, innaka Hamidun Majid.",
  bn:"হে আল্লাহ! মুহাম্মাদ ﷺ ও তাঁর পরিবারের ওপর রহমত বর্ষণ করুন, যেমন ইবরাহিম (আ.) ও তাঁর পরিবারের ওপর রহমত বর্ষণ করেছেন; নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত। হে আল্লাহ! মুহাম্মাদ ﷺ ও তাঁর পরিবারের ওপর বরকত দিন, যেমন ইবরাহিম (আ.) ও তাঁর পরিবারের ওপর বরকত দিয়েছেন; নিশ্চয়ই আপনি প্রশংসিত, মহিমান্বিত।",
  en:"O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious.",
  ref:"বুখারি ৩৩৭০, মুসলিম ৪০৬ / Bukhari 3370, Muslim 406"},
 {tBn:"দোয়া মাসূরা", tEn:"Dua Masura",
  ar:"اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ، وَارْحَمْنِي، إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
  tr:"Allahumma inni zalamtu nafsi zulman kathira, wa la yaghfirudh-dhunuba illa Ant, faghfir li maghfiratan min 'indik, warhamni, innaka Antal-Ghafurur-Rahim.",
  bn:"হে আল্লাহ! আমি নিজের ওপর অনেক জুলুম করেছি। আপনি ছাড়া কেউ গুনাহ ক্ষমা করতে পারে না। তাই আপনার পক্ষ থেকে আমাকে ক্ষমা করুন এবং আমার প্রতি রহম করুন। নিশ্চয়ই আপনি ক্ষমাশীল, পরম দয়ালু।",
  en:"O Allah, I have wronged myself a great deal, and none forgives sins but You. So forgive me with forgiveness from You, and have mercy on me. Truly You are the Most Forgiving, the Most Merciful.",
  ref:"বুখারি ৮৩৪, মুসলিম ২৭০৫ / Bukhari 834, Muslim 2705"},
 {tBn:"সূরা আল-কাওসার (১০৮)", tEn:"Surah Al-Kawthar (108)",
  ar:"إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ﴿١﴾ فَصَلِّ لِرَبِّكَ وَانْحَرْ ﴿٢﴾ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ ﴿٣﴾",
  tr:"Inna a'taynakal-kawthar. Fasalli li-Rabbika wanhar. Inna shani'aka huwal-abtar.",
  bn:"নিশ্চয়ই আমি আপনাকে কাওসার দান করেছি। সুতরাং আপনার রবের জন্য নামাজ পড়ুন ও কোরবানি করুন। নিশ্চয়ই আপনার শত্রুই নির্বংশ।",
  en:"Indeed, We have granted you Al-Kawthar. So pray to your Lord and sacrifice. Indeed, your enemy is the one cut off.",
  ref:"কুরআন ১০৮ / Quran 108"},
 {tBn:"সূরা আল-আসর (১০৩)", tEn:"Surah Al-Asr (103)",
  ar:"وَالْعَصْرِ ﴿١﴾ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ﴿٢﴾ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ ﴿٣﴾",
  tr:"Wal-'asr. Innal-insana lafi khusr. Illal-ladhina amanu wa 'amilus-salihati wa tawasaw bil-haqqi wa tawasaw bis-sabr.",
  bn:"সময়ের শপথ! নিশ্চয়ই মানুষ ক্ষতিগ্রস্ত। তবে তারা নয়, যারা ঈমান এনেছে, সৎকাজ করেছে, একে অপরকে হকের উপদেশ দিয়েছে ও ধৈর্যের উপদেশ দিয়েছে।",
  en:"By time! Indeed, mankind is in loss — except those who believe, do righteous deeds, urge one another to truth and urge one another to patience.",
  ref:"কুরআন ১০৩ / Quran 103"},
 {tBn:"সূরা আল-ইখলাস (১১২)", tEn:"Surah Al-Ikhlas (112)",
  ar:"قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾",
  tr:"Qul huwallahu Ahad. Allahus-Samad. Lam yalid wa lam yulad. Wa lam yakul-lahu kufuwan ahad.",
  bn:"বলুন: তিনি আল্লাহ, এক ও অদ্বিতীয়। আল্লাহ কারো মুখাপেক্ষী নন, সবাই তাঁর মুখাপেক্ষী। তিনি কাউকে জন্ম দেননি এবং তাঁকেও জন্ম দেওয়া হয়নি। আর তাঁর সমতুল্য কেউ নেই।",
  en:"Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. And there is none like unto Him.",
  ref:"কুরআন ১১২ / Quran 112"},
 {tBn:"সূরা আল-ফালাক (১১৩)", tEn:"Surah Al-Falaq (113)",
  ar:"قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾",
  tr:"Qul a'udhu bi-Rabbil-falaq. Min sharri ma khalaq. Wa min sharri ghasiqin idha waqab. Wa min sharri n-naffathati fil-'uqad. Wa min sharri hasidin idha hasad.",
  bn:"বলুন: আমি ভোরের রবের আশ্রয় চাই — তিনি যা সৃষ্টি করেছেন তার অনিষ্ট থেকে, অন্ধকার ঘনিয়ে এলে তার অনিষ্ট থেকে, গিরায় ফুঁ দেওয়া জাদুকরিনীদের অনিষ্ট থেকে এবং হিংসুকের হিংসার অনিষ্ট থেকে।",
  en:"Say: I seek refuge in the Lord of the daybreak — from the evil of what He created, from the evil of the darkness when it settles, from the evil of the blowers in knots, and from the evil of the envier when he envies.",
  ref:"কুরআন ১১৩ / Quran 113"},
 {tBn:"সূরা আন-নাস (১১৪)", tEn:"Surah An-Nas (114)",
  ar:"قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾",
  tr:"Qul a'udhu bi-Rabbin-nas. Malikin-nas. Ilahin-nas. Min sharril-waswasil-khannas. Alladhi yuwaswisu fi sudurin-nas. Minal-jinnati wan-nas.",
  bn:"বলুন: আমি মানুষের রবের আশ্রয় চাই, মানুষের বাদশাহর, মানুষের ইলাহর — কুমন্ত্রণা দিয়ে সরে যাওয়ার অনিষ্ট থেকে, যে মানুষের বুকে কুমন্ত্রণা দেয়, জিন হোক বা মানুষ।",
  en:"Say: I seek refuge in the Lord of mankind, the King of mankind, the God of mankind — from the evil of the retreating whisperer, who whispers into the chests of mankind, from among jinn and mankind.",
  ref:"কুরআন ১১৪ / Quran 114"}
];
function renderLearn(){
  const M = learnMadhhab();
  const mh = $("#learn-madhhab");
  if (mh){
    mh.innerHTML = `<div class="madhhab-label">${t("learnMadhabLabel")}</div><div class="madhhab-row">${MADHHABS.map(x=>`<button class="mchip${M===x.id?" on":""}" data-m="${x.id}">${L(x.en,x.bn)}</button>`).join("")}</div><div class="madhhab-method">${madhhabName(M)} ${t("learnMethodWord")}</div><div class="madhhab-hint muted small">${t("learnMadhabHint")}</div>`;
    $$("#learn-madhhab [data-m]").forEach(b=>b.onclick=()=>{ settings.learnMadhhab=b.dataset.m; saveSettings(); renderLearn(); });
  }
  buildLearnDemo(M);
  const rk = $("#learn-rakats");
  if (rk) rk.innerHTML = LEARN_RAKATS.map(r=>`<div class="rakat-cell"><b>${num(r.n)}</b><span>${L(r.en,r.bn)}</span></div>`).join("");
  const st = $("#learn-steps");
  if (st){
    st.innerHTML = LEARN_STEPS.map((s,i)=>`<div class="learn-step" style="--i:${i}">
      <div class="ls-head"><span class="ls-num">${num(i+1)}</span><span class="ls-title">${L(s.tEn,s.tBn)}</span></div>
      <div class="ls-body"><div class="ls-fig learn-fig">${prayerFigure(s.posture, M)}</div><div class="ls-text">${L(s.dEn,s.dBn)}</div></div>
      ${s.mNote && s.mNote[M] ? `<div class="learn-mnote">${L(s.mNote[M].en, s.mNote[M].bn)}</div>` : ""}
      ${s.say?`<div class="learn-say"><span class="ls-label">${t("learnSayLabel")}</span><div class="ls-ar arabic">${s.say.ar}</div><div class="ls-tr">${s.say.tr}</div><div class="ls-bn">${L(s.say.en,s.say.bn)}</div>${s.say.goto!=null?`<button class="mini-btn mt" data-goto="${s.say.goto}">${t("learnFullText")}</button>`:""}</div>`:""}
      <div class="learn-ref">${L(s.rEn,s.rBn)}</div></div>`).join("");
    $$("#learn-steps [data-goto]").forEach(b=>b.onclick=()=>{
      const el = document.getElementById("learn-dua-"+b.dataset.goto);
      if (el) el.scrollIntoView({behavior:"smooth", block:"center"});
    });
  }
  const dl = $("#learn-duas");
  if (dl) dl.innerHTML = LEARN_DUAS.map((d,i)=>`<div class="dua" id="learn-dua-${i}"><h3>${L(d.tEn,d.tBn)}</h3><div class="d-ar arabic">${d.ar}</div><div class="d-tr">${d.tr}</div><div class="d-bn">${L(d.en,d.bn)}</div><div class="d-ref">${d.ref}</div></div>`).join("");
}

const RUQYAH = [
  {label:"আয়াতুল কুরসি", labelEn:"Ayatul Kursi", surah:2, from:255, to:255},
  {label:"সূরা বাকারা — শেষ ২ আয়াত", labelEn:"Last 2 Ayahs of Al-Baqarah", surah:2, from:285, to:286},
  {label:"সূরা ইখলাস", labelEn:"Surah Al-Ikhlas", surah:112, from:1, to:4},
  {label:"সূরা ফালাক", labelEn:"Surah Al-Falaq", surah:113, from:1, to:5},
  {label:"সূরা নাস", labelEn:"Surah An-Nas", surah:114, from:1, to:6}
];
async function renderRuqyah(){
  const box = $("#ruqyah-list"); box.innerHTML = `<p class="muted">আয়াত লোড হচ্ছে…</p>`;
  let html = "";
  const haveLocal = await loadQuranFull();
  for (const r of RUQYAH){
    if (haveLocal){
      const all = localAyahs(r.surah);
      if (all){
        const sel = all.filter(a=>a.numberInSurah>=r.from && a.numberInSurah<=r.to);
        html += `<div class="card"><h3>${Lb(r.label, r.labelEn)}</h3>` + sel.map(a=>`
          <div class="ayah"><div class="a-ar arabic">${escHtml(a.text)}</div>
          ${a.bnText?`<div class="a-bn">${escHtml(a.bnText)}</div>`:""}
          <div class="a-tools"><button class="mini-btn" data-rplay="${a.number}">▶️ শুনুন</button></div></div>`).join("") + `</div>`;
        continue;
      }
    }
    try {
      const j = await fetchJson(`${QURAN}/surah/${r.surah}/editions/quran-uthmani,bn.bengali`, 15000);
      if (!j || !Array.isArray(j.data) || !j.data[0] || !j.data[1]) throw new Error("bad ayah data");
      const ar = j.data[0].ayahs.filter(a=>a.numberInSurah>=r.from && a.numberInSurah<=r.to);
      const bn = j.data[1].ayahs.filter(a=>a.numberInSurah>=r.from && a.numberInSurah<=r.to);
      html += `<div class="card"><h3>${Lb(r.label, r.labelEn)}</h3>` + ar.map((a,i)=>`
        <div class="ayah"><div class="a-ar arabic">${escHtml(a.text)}</div>
        ${bn[i]?`<div class="a-bn">${escHtml(bn[i].text)}</div>`:""}
        <div class="a-tools"><button class="mini-btn" data-rplay="${a.number}">▶️ শুনুন</button></div></div>`).join("") + `</div>`;
    } catch(e){ html += `<div class="card"><h3>${r.label}</h3><p class="muted">${t("loadErr")}</p></div>`; }
  }
  box.innerHTML = html;
  $$("#ruqyah-list [data-rplay]").forEach(b=>b.onclick=()=>{
    const a=$("#audio-ayah"); a.src = ayahAudioUrl(+b.dataset.rplay);
    a.play().catch(()=>toast("অডিও চালু হয়নি — ইন্টারনেট দেখুন"));
  });
}

/* ---------------- Qibla ---------------- */
let qiblaDeg = NaN, heading = null;
function qiblaBearing(lat, lon){
  const kaabaLat = 21.4225*Math.PI/180, kaabaLon = 39.8262*Math.PI/180;
  const la = lat*Math.PI/180, lo = lon*Math.PI/180;
  const dLon = kaabaLon - lo;
  const y = Math.sin(dLon), x = Math.cos(la)*Math.tan(kaabaLat) - Math.sin(la)*Math.cos(dLon);
  let br = Math.atan2(y, x)*180/Math.PI; return (br+360)%360;
}
function renderQibla(){
  if (!hasLocation()){
    $("#qibla-deg").textContent = "—";
    $("#qibla-dir").textContent = "";
    $("#qibla-loc").textContent = Lb("অবস্থান সেট করা নেই — আগে হোম থেকে অবস্থান সেট করুন।", "No location set — set your location from Home first.");
    return;
  }
  $("#qibla-deg").textContent = isFinite(qiblaDeg) ? `${qiblaDeg.toFixed(1)}°` : "—";
  const dirs = ["উত্তর","উত্তর-পূর্ব","পূর্ব","দক্ষিণ-পূর্ব","দক্ষিণ","দক্ষিণ-পশ্চিম","পশ্চিম","উত্তর-পশ্চিম"];
  const dirsEn = ["North","North-East","East","South-East","South","South-West","West","North-West"];
  const idx = Math.round(qiblaDeg/45)%8;
  $("#qibla-dir").textContent = isFinite(qiblaDeg) ? Lb(dirs[idx], dirsEn[idx]) : "";
  $("#qibla-loc").textContent = `${Lb("অবস্থান", "Location")}: ${settings.city}, ${settings.country}` + (isFinite(+settings.lat) && settings.lat != null ? ` (${settings.lat}, ${settings.lon})` : "");
  updateNeedle();
}
function updateNeedle(){
  const n = $("#needle"); if(!n) return;
  // needle points to qibla relative to phone heading; if no sensor, point to qibla from north
  const rel = heading==null ? qiblaDeg : (qiblaDeg - heading + 360)%360;
  n.style.transform = `translateX(-50%) rotate(${rel}deg)`;
}
async function fetchQibla(){
  if (!hasLocation() || settings.lat == null || settings.lon == null){ qiblaDeg = NaN; renderQibla(); return; }
  try {
    const j = await fetchJson(`${ALADHAN}/qibla/${settings.lat}/${settings.lon}`, 8000);
    if (j && j.code===200 && j.data && isFinite(+j.data.direction)) qiblaDeg = +j.data.direction;
    else qiblaDeg = qiblaBearing(settings.lat, settings.lon);
  } catch(e){ qiblaDeg = qiblaBearing(settings.lat, settings.lon); }
  renderQibla();
}
function startCompass(){
  const handler = e=>{
    let h = null;
    if (e.webkitCompassHeading!=null) h = e.webkitCompassHeading;
    else if (e.alpha!=null) h = (360 - e.alpha)%360;
    if (h!=null){ heading = h; updateNeedle(); }
  };
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function"){
    DeviceOrientationEvent.requestPermission().then(s=>{ if(s==="granted") window.addEventListener("deviceorientation", handler); }).catch(()=>{});
  } else window.addEventListener("deviceorientation", handler);
  window.addEventListener("deviceorientationabsolute", handler);
}

/* ---------------- Fasting ---------------- */
let hijriMonthData = null;
function gregWeekdayEn(d){ return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]; }
async function fetchHijriMonth(){
  if (!hijriInfo) return;
  try {
    const j = await fetchJson(settings.useCoords
      ? `${ALADHAN}/hijriCalendar/${hijriInfo.year}/${hijriInfo.month.number}?latitude=${settings.lat}&longitude=${settings.lon}&method=${effMethod()}`
      : `${ALADHAN}/hijriCalendarByCity/${hijriInfo.year}/${hijriInfo.month.number}?city=${encodeURIComponent(settings.city)}&country=${encodeURIComponent(settings.country)}&method=${effMethod()}`, 12000);
    if (j && j.code===200) hijriMonthData = j.data;
  } catch(e){ hijriMonthData = null; }
  renderFasting();
}
/* ---------------- Fasting timetable page (Fix #4 §11) -------------
   Big countdown ring (at night → Sehri, in the day → Iftar), swipeable
   hadith cards about fasting, and the Sehri/Iftar schedule — tapping a
   bell sets that Sehri/Iftar alarm (green = on, grey = off). */
const FASTING_HADITHS = [
  {ar:"الصِّيَامُ جُنَّةٌ", bn:"রোজা ঢালস্বরূপ।", ref:"সহিহ বুখারি ১৮৯৪"},
  {ar:"لِلصَّائِمِ فَرْحَتَانِ: فَرْحَةٌ عِنْدَ فِطْرِهِ، وَفَرْحَةٌ عِنْدَ لِقَاءِ رَبِّهِ", bn:"রোজাদারের জন্য দুটি আনন্দ রয়েছে: একটি ইফতারের সময়, আরেকটি তার রবের সঙ্গে সাক্ষাতের সময়।", ref:"সহিহ বুখারি ১৯০৪"},
  {ar:"مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", bn:"যে ব্যক্তি ঈমান ও সওয়াবের আশায় রমজানের রোজা রাখে, তার আগের সব গুনাহ মাফ করে দেওয়া হয়।", ref:"সহিহ বুখারি ৩৮"},
  {ar:"مَنْ فَطَّرَ صَائِمًا كَانَ لَهُ مِثْلُ أَجْرِهِ", bn:"যে ব্যক্তি কোনো রোজাদারকে ইফতার করায়, সে তার সমান সওয়াব পাবে।", ref:"জামি' তিরমিজি ৮০৭"}
];
let fastHadithIdx = 0;
function renderFastHadith(){
  const box = $("#fast-hadith"); if (!box) return;
  const h = FASTING_HADITHS[fastHadithIdx % FASTING_HADITHS.length];
  box.innerHTML = `<div class="fast-hadith-card"><div class="n-ar arabic">${h.ar}</div>
    <div class="n-bn">${h.bn}</div><div class="n-date">${h.ref}</div></div>`;
  const dots = $("#fast-hadith-dots");
  if (dots) dots.innerHTML = FASTING_HADITHS.map((_,i)=>
    `<button class="dot ${i===fastHadithIdx % FASTING_HADITHS.length ? "on" : ""}" data-fh="${i}" aria-label="হাদিস ${num(i+1)}"></button>`).join("");
  $$("#fast-hadith-dots [data-fh]").forEach(b=>b.onclick=()=>{ fastHadithIdx = +b.dataset.fh; renderFastHadith(); });
}
function renderFastSchedule(){
  const box = $("#fast-schedule"); if (!box || !timings) return;
  const rows = [
    {key:"Sehri", label:Lb("পরবর্তী সাহরি", "Next Sehri"), time:fmtTime(minsToHHMM(toMin(timings.Imsak) + (settings.offsets.Sehri||0)))},
    {key:"Iftar", label:Lb("পরবর্তী ইফতার", "Next Iftar"), time:fmtTime(minsToHHMM(toMin(timings.Maghrib) + (settings.offsets.Iftar||0)))}
  ];
  box.innerHTML = rows.map(r=>{
    const on = !!settings.alarmOn[r.key];
    return `<div class="prayer-row"><div class="p-name">${r.label}</div>
      <div class="row"><span class="p-time">${r.time}</span>
      <button class="bell-btn ${on?"on":""}" data-fast-bell="${r.key}" title="${Lb("অ্যালার্ম", "Alarm")}">${on?"🔔":"🔕"}</button></div></div>`;
  }).join("");
  $$("#fast-schedule [data-fast-bell]").forEach(b=>b.onclick=()=>{
    const k = b.dataset.fastBell;
    settings.alarmOn[k] = !settings.alarmOn[k]; saveSettings(); syncPrayerAlarms(); renderFastSchedule();
    toast(settings.alarmOn[k]
      ? Lb(`${k==="Sehri"?"সাহরির":"ইফতারের"} অ্যালার্ম চালু ✓`, `${k==="Sehri"?"Sehri":"Iftar"} alarm on ✓`)
      : Lb(`${k==="Sehri"?"সাহরির":"ইফতারের"} অ্যালার্ম বন্ধ`, `${k==="Sehri"?"Sehri":"Iftar"} alarm off`));
  });
}
function renderFasting(){
  const box = $("#fast-list");
  const items = [];
  const now = locNow();
  // next Monday / Thursday
  for (const wd of [1,4]){
    const d = new Date(now); let add = (wd - d.getDay() + 7)%7; if (add===0) add = 7;
    d.setDate(d.getDate()+add);
    items.push({date:d, label: Lb((wd===1?"সোমবারের রোজা":"বৃহস্পতিবারের রোজা"), (wd===1?"Monday fast":"Thursday fast")),
      kind: Lb("সুন্নত", "Sunnah")});
  }
  // Ayyam al-Beed 13/14/15 of current Hijri month
  if (hijriMonthData){
    const beed = hijriMonthData.filter(d=>["13","14","15"].includes(d.date.hijri.day));
    beed.forEach(d=>{
      const gd = new Date(d.date.gregorian.year, d.date.gregorian.month.number-1, d.date.gregorian.day);
      if (gd >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
        items.push({date:gd, label: Lb(`আইয়ামে বীজ — ${bnNum(d.date.hijri.day)} ${escHtml(d.date.hijri.month.en)}`, `Ayyam al-Beed — ${d.date.hijri.day} ${escHtml(d.date.hijri.month.en)}`), kind: Lb("সুন্নত", "Sunnah")});
    });
    // Day of Arafah — 9 Dhul Hijjah
    if (hijriInfo.month.number === 12){
      const ar = hijriMonthData.find(d=>d.date.hijri.day==="9");
      if (ar) items.push({date:new Date(ar.date.gregorian.year, ar.date.gregorian.month.number-1, ar.date.gregorian.day),
        label: Lb("আরাফার দিনের রোজা (৯ জিলহজ)", "Day of Arafah fast (9 Dhul Hijjah)"), kind: Lb("সুন্নত", "Sunnah")});
    }
  }
  items.sort((a,b)=>a.date-b.date);
  const fmtD = d => Lb(`${bnNum(d.getDate())} ${["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"][d.getMonth()]} — ${["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"][d.getDay()]}`, d.toDateString());
  box.innerHTML = items.slice(0,6).map(it=>`<div class="win-row"><span>${it.label}<br><small class="muted">${it.kind}</small></span><b>${fmtD(it.date)}</b></div>`).join("")
    || `<p class="muted">তথ্য পাওয়া যায়নি।</p>`;
  // Hijri month table
  if (hijriMonthData){
    $("#hijri-month").innerHTML = hijriMonthData.slice(0,31).map(d=>{
      const today = d.date.gregorian.date === ddmmyyyy();
      return `<div class="win-row" ${today?'style="background:rgba(212,175,55,.15);border-radius:8px;padding-left:8px;padding-right:8px"':""}>
        <span>${num(d.date.hijri.day)} ${escHtml(d.date.hijri.month.en)} ${num(d.date.hijri.year)}${today?" ●":""}</span>
        <b>${num(d.date.gregorian.day)} ${d.date.gregorian.month.en}</b></div>`;
    }).join("");
  }
  // big countdown ring: at night → Sehri, in the day → Iftar
  if (timings){
    const now2 = locNow(); const mins = now2.getHours()*60+now2.getMinutes();
    const imsak = toMin(timings.Imsak), magh = toMin(timings.Maghrib);
    let label, sub, target, prev;
    if (mins < imsak){ label = Lb("পরবর্তী সাহরি", "Next Sehri"); sub = Lb("সাহরির বাকি", "Time to Sehri"); target = imsak; prev = magh - 1440; }
    else if (mins < magh){ label = Lb("পরবর্তী ইফতার", "Next Iftar"); sub = Lb("ইফতারের বাকি", "Time to Iftar"); target = magh; prev = imsak; }
    else { label = Lb("পরবর্তী সাহরি", "Next Sehri"); sub = Lb("সাহরির বাকি", "Time to Sehri"); target = imsak + 1440; prev = magh; }
    const nowSec = now2.getHours()*3600 + now2.getMinutes()*60 + now2.getSeconds();
    const diff = Math.max(0, target*60 - nowSec);
    const hh = Math.floor(diff/3600), mm = Math.floor(diff%3600/60), ss = diff%60;
    const fl = $("#fast-ring-label"), fc = $("#fast-ring-count"), fs = $("#fast-ring-sub"), ffg = $("#fast-ring-fg");
    if (fl) fl.textContent = label;
    if (fc) fc.textContent = `${num(pad2(hh))}:${num(pad2(mm))}:${num(pad2(ss))}`;
    if (fs) fs.textContent = sub;
    if (ffg){
      const C = 2*Math.PI*96;
      const prog = Math.min(1, Math.max(0, (mins - prev) / (target - prev)));
      ffg.style.strokeDasharray = String(C);
      ffg.style.strokeDashoffset = String(C * (1 - prog));
    }
  }
  renderFastHadith();
  renderFastSchedule();
}

/* ---------------- Alarm page + per-prayer detail page (Fix #4 §8–§9) --
   Alarm page: master toggle (settings.azan) + fard (5) + nafl (Duha,
   Tahajjud) + forbidden (3) rows, each individually toggleable; tapping
   a row opens its detail page. Detail page: toggle, Time Adjustment
   slider (-30..+30, 1-minute steps, middle = Exact time), Alarm Sound
   list (each with a ▶ preview), Save button. The offset set here is the
   SAME settings.offsets value the azan scheduler uses, so the prayer
   time itself is adjusted with the same slider. ------------------------ */
const ALARM_ITEMS = {
  fard: ["Fajr","Dhuhr","Asr","Maghrib","Isha"],
  nafl: ["Duha","Tahajjud"],
  forbidden: ["ForbMorning","ForbNoon","ForbEvening"]
};
function alarmItemName(id){
  if (PRAYER_IDS.includes(id)) return pname(id);
  if (id==="Duha") return nt("duha");
  if (id==="Tahajjud") return Lb("তাহাজ্জুদ", "Tahajjud");
  const w = forbiddenWindows().find(x=>x.id===id);
  if (w) return Lb(w.bn, w.en);
  return id;
}
function alarmItemTime(id){
  if (!timings) return "—";
  if (PRAYER_IDS.includes(id)) return adjTimeStr(id, settings.offsets[id]||0);
  if (id==="Duha") return fmtTime(minsToHHMM(toMin(timings.Sunrise)+15+(settings.offsets.Duha||0)));
  if (id==="Tahajjud") return fmtTime(minsToHHMM(toMin(timings.Lastthird)+(settings.offsets.Tahajjud||0)));
  const w = forbiddenWindows().find(x=>x.id===id);
  if (w) return `${fmtTime(minsToHHMM(w.start+(settings.offsets[id]||0)))} – ${fmtTime(minsToHHMM(w.end+(settings.offsets[id]||0)))}`;
  return "—";
}
function alarmRowHtml(id){
  const on = !!settings.alarmOn[id];
  return `<div class="prayer-row tappable" data-alarm-item="${id}" role="button" tabindex="0">
    <div class="p-name">${alarmItemName(id)}<small>🔔 ${on?Lb("ঠিক সময়ে", "On time"):Lb("বন্ধ", "Off")} • ${alarmItemTime(id)}</small></div>
    <div class="row"><label class="switch"><input type="checkbox" data-alarm-toggle="${id}" ${on?"checked":""}><span class="slider"></span></label></div></div>`;
}
function renderAlarmPage(){
  const m = $("#alarm-master"); if (m) m.checked = !!settings.azan;
  const f = $("#alarm-fard"); if (f) f.innerHTML = ALARM_ITEMS.fard.map(alarmRowHtml).join("");
  const n = $("#alarm-nafl"); if (n) n.innerHTML = ALARM_ITEMS.nafl.map(alarmRowHtml).join("");
  const fb = $("#alarm-forbidden"); if (fb) fb.innerHTML = ALARM_ITEMS.forbidden.map(alarmRowHtml).join("");
  $$("#view-alarm [data-alarm-toggle]").forEach(t=>t.onchange=e=>{
    e.stopPropagation();
    const id = t.dataset.alarmToggle;
    settings.alarmOn[id] = t.checked; saveSettings(); syncPrayerAlarms(); renderAlarmPage();
  });
  $$("#view-alarm [data-alarm-item]").forEach(r=>{
    r.onclick=e=>{ if (e.target.closest("[data-alarm-toggle]")) return; openPrayerDetail(r.dataset.alarmItem); };
    r.onkeydown=e=>{ if (e.key==="Enter" || e.key===" "){ e.preventDefault(); openPrayerDetail(r.dataset.alarmItem); } };
  });
}
let detailId = null, detailDraft = null;
const ALARM_SOUNDS = [
  {id:"silent", bn:"নিঃশব্দ", en:"Silent"},
  {id:"beep", bn:"বিপ", en:"Beep"},
  {id:"ring", bn:"রিং", en:"Ring"},
  {id:"name", bn:"ওয়াক্তের নাম", en:"Prayer name"},
  {id:"notification", bn:"নোটিফিকেশন", en:"Notification"},
  {id:"azan", bn:"আজান", en:"Azan"}
];
function openPrayerDetail(id){
  detailId = id;
  detailDraft = { on: !!settings.alarmOn[id], offset: settings.offsets[id]||0, sounds: normalizeSounds(settings.alarmSound[id]) };
  renderDetailPage();
  showView("prayer-detail");
}
function detailBaseMin(id){
  if (!timings) return null;
  if (PRAYER_IDS.includes(id)) return toMin(timings[id]);
  if (id==="Duha") return toMin(timings.Sunrise)+15;
  if (id==="Tahajjud") return toMin(timings.Lastthird);
  const w = forbiddenWindows().find(x=>x.id===id);
  return w ? w.start : null;
}
function renderDetailPage(){
  if (!detailId) return;
  const t = $("#detail-title"); if (t) t.textContent = alarmItemName(detailId);
  const tg = $("#detail-toggle"); if (tg) tg.checked = !!detailDraft.on;
  const sl = $("#detail-slider"); if (sl) sl.value = String(detailDraft.offset);
  updateDetailTime();
  renderDetailSounds();
}
function updateDetailTime(){
  const base = detailBaseMin(detailId); if (base==null) return;
  const set = fmtTime(minsToHHMM(base + detailDraft.offset));
  const ex = $("#detail-exact");
  if (ex) ex.textContent = detailDraft.offset===0 ? Lb("Exact time", "Exact time") : offsetText(detailDraft.offset);
  const dt = $("#detail-time");
  if (dt) dt.textContent = `${Lb("সেট করা সময়", "Set time")}: ${set}`;
}
/* Multi-select (Fix #10): "name" is the permanent default and cannot be
   turned off; one extra sound may be added (max 2 together). "silent"
   stands alone. */
function toggleDetailSound(sid){
  if (!detailDraft) return;
  if (sid==="name"){ toast(Lb("ওয়াক্তের নাম সবসময় চালু থাকে", "Prayer name is always on")); return; }
  let cur = detailDraft.sounds || ["name"];
  if (sid==="silent"){
    detailDraft.sounds = cur.includes("silent") ? ["name"] : ["silent"];
  } else if (cur.includes(sid)){
    detailDraft.sounds = cur.filter(s=>s!==sid);
    if (!detailDraft.sounds.length) detailDraft.sounds = ["name"];
  } else {
    if (cur.includes("silent")) cur = ["name"];
    if (cur.length>=2){ toast(Lb("একসাথে সর্বোচ্চ ২টা সাউন্ড সিলেক্ট করা যায়", "You can select up to 2 sounds together")); return; }
    detailDraft.sounds = [...cur, sid];
  }
  renderDetailSounds();
}
function renderDetailSounds(){
  const box = $("#detail-sounds"); if (!box) return;
  const sel = detailDraft.sounds || ["name"];
  box.innerHTML = ALARM_SOUNDS.map(s=>`<div class="sound-row ${sel.includes(s.id)?"on":""}" data-sound="${s.id}" role="button" tabindex="0">
    <span class="sound-name">${Lb(s.bn, s.en)}${s.id==="name"?" ("+Lb("ডিফল্ট","Default")+")":""}</span>
    <span class="row"><span class="sound-check">${sel.includes(s.id)?"✅":""}</span>
    <button class="mini-btn" data-preview="${s.id}" title="${Lb("শুনুন","Preview")}">▶</button></span></div>`).join("");
  $$("#detail-sounds [data-sound]").forEach(r=>r.onclick=e=>{
    if (e.target.closest("[data-preview]")) return;
    toggleDetailSound(r.dataset.sound);
  });
  $$("#detail-sounds [data-preview]").forEach(b=>b.onclick=e=>{ e.stopPropagation(); previewAlarmSound(b.dataset.preview); });
  /* Fix #38: say plainly what the current selection plays at prayer
     time. The truth: "name" (ওয়াক্তের নাম, the permanent default) adds
     no separate sound — it is spoken only in the ▶ preview — but the
     alarm itself still plays the azan on the azan channel, and the
     prayer name shows in the notification. Only "silent" silences it. */
  const ex = $("#detail-sound-explain"); if (ex) ex.textContent = detailSoundExplain(sel);
}
function detailSoundExplain(sounds){
  const ss = normalizeSounds(sounds);
  if (ss.includes("silent")) return Lb("নিঃশব্দ — ওয়াক্তের সময় কোনো সাউন্ড বাজবে না; শুধু নোটিফিকেশন আসবে।", "Silent — no sound plays at prayer time; only the notification arrives.");
  if (ss.includes("azan")) return Lb("ওয়াক্তের সময় আজান বাজবে।", "The azan will play at prayer time.");
  return Lb("ওয়াক্তের নাম (ডিফল্ট) সবসময় চালু থাকে — ওয়াক্তের সময় আজান বাজবে, আর নোটিফিকেশনে ওয়াক্তের নাম দেখাবে।", "Prayer name (default) is always on — the azan will play at prayer time, and the notification shows the prayer name.");
}
function previewAlarmSound(sound){
  stopAyahAudio();
  if (sound==="silent") return;
  if (sound==="beep" || sound==="ring"){ beepPreview(sound==="ring"); return; }
  if (sound==="name"){
    const name = detailId ? alarmItemName(detailId) : "";
    speakText(Lb(`${name}র নামাজের সময় হয়েছে`, `It is time for ${name} prayer`));
    return;
  }
  if (sound==="notification"){ const a = $("#audio-reminder"); if (a){ a.currentTime=0; a.play().catch(()=>{}); } return; }
  if (sound==="azan"){ const a = $("#audio-azan"); if (a){ a.currentTime=0; a.play().catch(()=>{}); } return; }
}
/* Short WebAudio beep / phone-ring preview (no file needed). */
function beepPreview(ring){
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = new AC();
    const tone = (f, t0, dur)=>{ const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; o.type = "sine";
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.25, t0+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
      o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0+dur+0.05); };
    if (!ring){ tone(880, ctx.currentTime, 0.25); tone(880, ctx.currentTime+0.35, 0.25); }
    else { tone(1046, ctx.currentTime, 0.4); tone(1318, ctx.currentTime+0.5, 0.4); tone(1046, ctx.currentTime+1.0, 0.4); }
    setTimeout(()=>{ try{ ctx.close(); }catch(e){} }, 2200);
  } catch(e){}
}
function speakText(text, lang){
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    /* Build #19, Fix #5: the pre-azan texts are always Bengali, so
       their voice is forced to bn-BD even when the UI language is
       English — otherwise an English voice would garble the Bengali
       words. Other callers keep the UI-language default. */
    u.lang = lang || (settings.lang === "bn" ? "bn-BD" : "en-US");
    window.speechSynthesis.speak(u);
  } catch(e){}
}
/* Build #19, Fix #5 — spoken pre-azan reminders, foreground path: when
   the app is open, at T-5 and T-2 before every fard prayer, SPEAK the
   exact Fix #8 text (verbatim) with the phone's Bengali voice. Always
   on, like the pre-azan reminders themselves — even when a prayer's
   azan alarm is off (Fix #9 §3). The background path is the native
   AlarmReceiver TTS (the "speak" flag on the pre-azan alarm entries).
   Tahajjud has no azan, so it gets no voice. Once per day per slot. */
function checkPreAzanVoice(){
  if (!timings) return;
  const now = locNow();
  const mins = now.getHours()*60 + now.getMinutes();
  for (const p of PRAYER_IDS){
    const base = toMin(timings[p]); if (base == null) continue;
    const at = base + (settings.offsets[p] || 0);
    for (const before of [5, 2]){
      if (at - before === mins && !rungToday[`${todayKey()}_${p}_pre${before}`]){
        rungToday[`${todayKey()}_${p}_pre${before}`] = true;
        speakText(PREAZAN_TEXTS[p], "bn-BD");
      }
    }
  }
}
function saveDetailPage(){
  if (!detailId || !detailDraft) return;
  settings.alarmOn[detailId] = !!detailDraft.on;
  settings.offsets[detailId] = detailDraft.offset;
  settings.alarmSound[detailId] = normalizeSounds(detailDraft.sounds);
  saveSettings(); syncPrayerAlarms(); renderAlarmPage();
  toast(Lb("সংরক্ষণ হয়েছে ✓", "Saved ✓"));
  showView("alarm");
}

/* ---------------- Calendar page (Fix #4 §10) -----------------------
   Day cards (not a long thin table), one after another, scrollable.
   Month + year dropdowns on top. Each card: green header (English date
   + weekday + Hijri date — Build #19, Fix #2: the share icon is gone),
   (sunrise, sunset, Sehri, Iftar), and the forbidden times. Times are
   computed on-device for each day (computeTimingsLocal) — no network. */
const GREG_BN_MONTHS = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
const GREG_BN_WEEKDAYS = ["রবিবার","সোমবার","মঙ্গলবার","বুধবার","বৃহস্পতিবার","শুক্রবার","শনিবার"];
const GREG_EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const GREG_EN_WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
let calMonth = new Date().getMonth(), calYear = new Date().getFullYear();
function renderCalendarPage(){
  const ms = $("#cal-month"), ys = $("#cal-year");
  if (ms && !ms.options.length){
    ms.innerHTML = GREG_BN_MONTHS.map((m,i)=>`<option value="${i}">${m}</option>`).join("");
    const y0 = new Date().getFullYear();
    ys.innerHTML = [y0-1, y0, y0+1].map(y=>`<option value="${y}">${bnNum(y)}</option>`).join("");
    ms.onchange = ()=>{ calMonth = +ms.value; renderCalendarPage(); };
    ys.onchange = ()=>{ calYear = +ys.value; renderCalendarPage(); };
  }
  if (ms) ms.value = String(calMonth);
  if (ys) ys.value = String(calYear);
  const box = $("#cal-days"); if (!box) return;
  if (!hasLocation()){ box.innerHTML = `<div class="card"><p class="muted">${Lb("নামাজের সময় দেখতে আগে আপনার অবস্থান সেট করুন।", "Set your location first to see prayer times.")}</p></div>`; return; }
  const days = new Date(calYear, calMonth+1, 0).getDate();
  let html = "";
  for (let d = 1; d <= days; d++){
    const date = new Date(calYear, calMonth, d);
    const t = computeTimingsLocal(date);
    if (!t) continue;
    const hj = hijriFromGregorian(date);
    const head = Lb(`${bnNum(d)} ${GREG_BN_MONTHS[calMonth]}, ${bnNum(calYear)} — ${GREG_BN_WEEKDAYS[date.getDay()]} / ${bnNum(hj.day)} ${escHtml(hj.month.en)}, ${bnNum(hj.year)}`,
      `${d} ${GREG_EN_MONTHS[calMonth]} ${calYear} — ${GREG_EN_WEEKDAYS[date.getDay()]} / ${hj.day} ${escHtml(hj.month.en)}, ${hj.year}`);
    const prayLines = PRAYER_IDS.map(pid=>`<div class="cal-line"><span>${pname(pid)}</span><b>${fmtTime(t[pid])}</b></div>`).join("");
    const second = `<div class="cal-line"><span>${Lb("সূর্যোদয়","Sunrise")}</span><b>${fmtTime(t.Sunrise)}</b></div>
      <div class="cal-line"><span>${Lb("সূর্যাস্ত","Sunset")}</span><b>${fmtTime(t.Sunset)}</b></div>
      <div class="cal-line"><span>${Lb("সাহরি","Sehri")}</span><b>${fmtTime(t.Imsak)}</b></div>
      <div class="cal-line"><span>${Lb("ইফতার","Iftar")}</span><b>${fmtTime(t.Maghrib)}</b></div>`;
    const sr = toMin(t.Sunrise), dh = toMin(t.Dhuhr), mg = toMin(t.Maghrib);
    const forb = `<div class="cal-forb">${Lb("সালাতের নিষিদ্ধ সময়", "Forbidden prayer times")}: ${fmtTime(t.Sunrise)} – ${fmtTime(minsToHHMM(sr+15))} • ${fmtTime(minsToHHMM(dh-10))} – ${fmtTime(t.Dhuhr)} • ${fmtTime(minsToHHMM(mg-25))} – ${fmtTime(t.Maghrib)}</div>`;
    /* Build #19, Fix #2: the share button on every calendar day card
       is gone — the card head is just the date now. */
    html += `<div class="card cal-card"><div class="cal-head"><span>${head}</span></div>
      ${prayLines}${second}${forb}</div>`;
  }
  box.innerHTML = html || `<div class="card"><p class="muted">${Lb("তথ্য পাওয়া যায়নি।", "No data available.")}</p></div>`;
}

/* ---------------- Durood on phone unlock ----------------
   Fix #35 (user 22:13): durood plays ONLY when the phone is unlocked,
   exactly once — opening the app has NOTHING to do with it. The web
   layer used to play durood when the app opened or came back to the
   foreground ("best-effort unlock", at most once per 5 min) — that hook
   is fully removed (maybePlayDuroodOnForeground is gone, with its init
   call and its visibilitychange/focus listeners). The ONLY unlock durood
   is the native APK's BroadcastReceiver for the real ACTION_USER_PRESENT
   event (see android/app/src/main/java/com/deenday/app/
   DuroodUnlockReceiver.java — goAsync, one 3.72 s clip, exactly once
   per unlock), whose on/off state is synced from this toggle via the
   DuroodUnlock Capacitor plugin. The PWA cannot detect phone unlock at
   all, so on the web there is no unlock durood — only the durood
   REMINDER (its own switch + interval, Fix #33) still plays audio at
   its set time, through playDurood(true) in fireDhikrReminder. -------- */
let lastDuroodAt = 0;
function playDurood(force){
  const now = Date.now();
  if (!force && now - lastDuroodAt < 5*60*1000) return;
  lastDuroodAt = now;
  const a = $("#audio-durood");
  if (a){ a.currentTime = 0; a.play().catch(()=>{}); }
}
function syncDuroodToggleNative(){
  try {
    const P = (typeof window.Capacitor !== "undefined" && window.Capacitor.Plugins)
      ? window.Capacitor.Plugins.DuroodUnlock : null;
    if (P && P.setEnabled) P.setEnabled({ enabled: !!settings.duroodOnUnlock });
  } catch(e){}
}

/* ---------------- Daily hadith & verse notification (fully local) ----
   No server and no account are involved: each phone picks a different
   hadith and Quran verse every day from the data already bundled in the
   app (window.HADITHS + the bundled Quran text) and delivers it locally.
   - Android app: the next 7 mornings (7:00 AM) are scheduled as local
     notifications, each day with that day's hadith and verse; re-synced
     whenever the app is opened or the setting changes.
   - Web/PWA: when the app is opened and notification permission has been
     granted, today's hadith and verse are shown as a notification,
     once per day. -- */
async function maybeFireDailyWebNotif(){
  if (!settings.dailyNotif) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (store.get("daily_notif_shown", "") === todayKey()) return;
  const h = todayHadith(); if (!h) return;
  await loadQuranFull(); // bundled text — the verse body comes from it
  if (store.get("daily_notif_shown", "") === todayKey()) return;
  const v = verseTextFor(new Date());
  store.set("daily_notif_shown", todayKey());
  const parts = [h.bn + " (" + h.ref + ")"];
  if (v && v.bn) parts.push(v.bn + " (" + v.ref + ")");
  try { new Notification("My Deen — " + Lb("আজকের হাদিস ও আয়াত", "Today's Hadith & Verse"),
    { body: parts.join("\n\n"), icon:"icons/icon-192.png" }); } catch(e){}
}
const DAILY_HADITH_IDS = [301,302,303,304,305,306,307];
const DAILY_VERSE_IDS  = [311,312,313,314,315,316,317];
async function scheduleNativeDaily(){
  try {
    if (typeof window.Capacitor === "undefined" || !window.Capacitor.Plugins) return;
    const LN = window.Capacitor.Plugins.LocalNotifications; if (!LN) return;
    const all = [...DAILY_HADITH_IDS, ...DAILY_VERSE_IDS];
    if (!settings.dailyNotif){ await LN.cancel({ notifications: all.map(id=>({id})) }); return; }
    const perm = await LN.requestPermissions();
    if (perm && perm.display && perm.display !== "granted") return;
    await LN.createChannel({ id: "daily", name: "Daily hadith & verse",
      description: "A new hadith and a Quran verse every morning", importance: 4, vibration: true });
    await loadQuranFull(); // bundled text — the verse bodies come from it
    const list = window.HADITHS || []; if (!list.length) return;
    const notifs = [];
    for (let i = 0; i < 7; i++){
      const d = new Date(); d.setDate(d.getDate() + i); d.setHours(7, 0, 0, 0);
      if (d <= new Date()) continue;
      const h = list[dayOfYear(d) % list.length];
      notifs.push({ id: DAILY_HADITH_IDS[i], title: "My Deen — " + Lb("আজকের হাদিস", "Today's Hadith"),
        body: trunc(h.bn, 170) + " (" + h.ref + ")",
        schedule: { at: d, allowWhileIdle: true }, channelId: "daily" });
      const v = verseTextFor(d);
      if (v && v.bn) notifs.push({ id: DAILY_VERSE_IDS[i], title: "My Deen — " + Lb("আজকের আয়াত", "Today's Verse"),
        body: trunc(v.bn, 170) + " (" + v.ref + ")",
        schedule: { at: new Date(d.getTime() + 60000), allowWhileIdle: true }, channelId: "daily" });
    }
    await LN.cancel({ notifications: all.map(id=>({id})) });
    if (notifs.length) await LN.schedule({ notifications: notifs });
  } catch(e){ /* native-only; never break the web app */ }
}

/* ---------------- Durood & Astaghfirullah interval reminders ---------
   Fix #31 (user 21:55): an ON/OFF switch plus − / + buttons — each tap
   moves the interval by exactly 1 minute (1..60). No slider, no offset,
   no preset position, nothing like the namaz (prayer-time) adjuster:
   the big number in the middle IS the interval in minutes. History: the
   reminders once had 10/20/30 chips, then (Fix #5/#28) the same −30..+30
   offset slider as the prayer adjuster — the user found that confusing
   ("২৫ মিনিট আগে" makes no sense for an interval), so the slider is gone.
   While the app is open the reminder fires in-app (durood audio + toast);
   in the Android app the next 24 occurrences are also scheduled as local
   notifications so they arrive even when the app is closed. Re-synced on
   open and on every change. - */
const DUROOD_REM_BASE = 401, ASTAGH_REM_BASE = 501, DHIKR_REM_COUNT = 24;
const DUROOD_AR = "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ";
const ASTAGH_AR = "أَسْتَغْفِرُ اللَّهَ";
let lastDuroodRemAt = Date.now(), lastAstaghRemAt = Date.now();
function fireDhikrReminder(kind){
  /* Fix #33: the reminder audio plays only when that reminder's sound
     switch is on. Sound off = the toast + notification still arrive,
     but silently (no audio). */
  if (kind === "durood"){
    if (settings.duroodRemSound !== false) playDurood(true);
    toast("📿 " + Lb("দরুদ পড়ুন", "Recite Durood") + ": " + DUROOD_AR);
    if (settings.notif && "Notification" in window && Notification.permission === "granted"){
      try { new Notification("My Deen — " + Lb("দরুদ শরিফ", "Durood Sharif"),
        { body: DUROOD_AR, icon:"icons/icon-192.png" }); } catch(e){}
    }
  } else {
    /* Fix #33: istighfar audio only when its sound switch is on. */
    if (settings.astaghRemSound !== false){
      const a = $("#audio-istighfar");
      if (a){ a.currentTime = 0; a.play().catch(()=>{}); }
    }
    toast("🤲 " + Lb("আস্তাগফিরুল্লাহ পড়ুন", "Recite Astaghfirullah") + ": " + ASTAGH_AR);
    if (settings.notif && "Notification" in window && Notification.permission === "granted"){
      try { new Notification("My Deen — " + Lb("ইস্তিগফার", "Istighfar"),
        { body: ASTAGH_AR, icon:"icons/icon-192.png" }); } catch(e){}
    }
  }
}
function checkDhikrReminders(){
  if (document.hidden) return;
  const now = Date.now();
  if (settings.duroodRemOn && now - lastDuroodRemAt >= (settings.duroodRemMin || 30) * 60000){
    lastDuroodRemAt = now; fireDhikrReminder("durood");
  }
  if (settings.astaghRemOn && now - lastAstaghRemAt >= (settings.astaghRemMin || 30) * 60000){
    lastAstaghRemAt = now; fireDhikrReminder("astagh");
  }
}
function dhikrIds(base){ const a = []; for (let k = 0; k < DHIKR_REM_COUNT; k++) a.push(base + k); return a; }
async function scheduleNativeDhikr(){
  try {
    if (typeof window.Capacitor === "undefined" || !window.Capacitor.Plugins) return;
    const LN = window.Capacitor.Plugins.LocalNotifications; if (!LN) return;
    // Fix #4 §6: a dhikr reminder notification also PLAYS its audio —
    // each kind gets its own channel with its own sound (durood.mp3 /
    // istighfar.mp3), because Android 8+ plays the CHANNEL sound.
    // Fix #18: the old channel IDs were created without a working sound
    // on the user's phone (notification arrived, no audio) and Android
    // never updates an existing channel — so the reminders use fresh
    // channel IDs (v2 in Fix #18, v3 in Build #19 — the old ones are
    // deleted by the native ensureChannels). The per-notification sound
    // fields stay: the plugin strips the ".mp3" and resolves
    // R.raw.durood/istighfar.
    // Fix #33: each kind has TWO channels — the sound channel WITH its
    // sound (durood.mp3 / istighfar.mp3) and a "-silent" channel with NO
    // sound. Android never updates an existing channel's sound, so the
    // sound on/off switch works by scheduling into the other channel.
    // The silent channels are HIGH importance too, so the notification
    // still pops up — just without any audio.
    // Build #19, Fix #4: the user reports the durood reminder STILL
    // arrives silently with the sound switch ON. The v2 channel on his
    // phone was created without a working sound (the same class of
    // failure as Fix #18/#24 — two channel creators, JS createChannel
    // + native ensureChannels, racing, and a channel created once
    // without sound stays silent forever). Repair, same proven pattern:
    // fresh v3 channel IDs, the old v2 channels deleted by the native
    // ensureChannels — and the native side is now the SOLE channel
    // creator (MainActivity.onCreate runs it before any JS loads), so
    // the JS createChannel calls are gone entirely: one creator, one
    // sound, no race. The switch (Fix #33) keeps working exactly as
    // before, now picking the v3 sound channel or the v3 silent twin.
    const jobs = [
      { on: settings.duroodRemOn, min: settings.duroodRemMin || 30, base: DUROOD_REM_BASE,
        channelId: settings.duroodRemSound !== false ? "dhikr-durood-v3" : "dhikr-durood-v3-silent",
        sound: settings.duroodRemSound !== false ? "durood.mp3" : undefined,
        title: "My Deen — " + Lb("দরুদ শরিফ", "Durood Sharif"),
        body: DUROOD_AR + " — " + Lb("দরুদ পড়ুন", "Recite Durood upon the Prophet ﷺ") },
      { on: settings.astaghRemOn, min: settings.astaghRemMin || 30, base: ASTAGH_REM_BASE,
        channelId: settings.astaghRemSound !== false ? "dhikr-istighfar-v3" : "dhikr-istighfar-v3-silent",
        sound: settings.astaghRemSound !== false ? "istighfar.mp3" : undefined,
        title: "My Deen — " + Lb("ইস্তিগফার", "Istighfar"),
        body: ASTAGH_AR + " — " + Lb("আস্তাগফিরুল্লাহ পড়ুন, আল্লাহর কাছে ক্ষমা চান", "Recite Astaghfirullah — seek Allah's forgiveness") }
    ];
    for (const j of jobs){
      const ids = dhikrIds(j.base);
      await LN.cancel({ notifications: ids.map(id=>({id})) });
      if (!j.on) continue;
      const now = Date.now(), list = [];
      for (let k = 1; k <= DHIKR_REM_COUNT; k++){
        list.push({ id: j.base + k - 1, title: j.title, body: j.body,
          schedule: { at: new Date(now + k * j.min * 60000), allowWhileIdle: true }, channelId: j.channelId, sound: j.sound });
      }
      if (list.length) await LN.schedule({ notifications: list });
    }
  } catch(e){ /* native-only; never break the web app */ }
}
/* Interval clamp for the dhikr reminders (Fix #31): the interval is just
   a number of minutes, 1..60. No offset, no preset position. */
function clampDhikrMin(m){ return Math.min(60, Math.max(1, m)); }
function remStepLabel(kind, m){
  const on = kind === "durood" ? !!settings.duroodRemOn : !!settings.astaghRemOn;
  if (!on) return Lb("বন্ধ আছে — চালু করতে ওপরের সুইচ অন করুন।", "Off — turn the switch on to enable.");
  return Lb(`চালু আছে — প্রতি ${num(m)} মিনিট পর পর রিমাইন্ডার আসবে।`, `On — a reminder arrives every ${m} minutes.`);
}
function remPanel(kind, icon, titleBn, titleEn, on, min){
  const m = clampDhikrMin(min || 30);
  /* Fix #31: no slider, no offset, nothing like the namaz adjuster — just
     − / + buttons; each tap moves the interval by 1 minute. The big number
     in the middle IS the interval; the line below it says it in words.
     Fix #33: a sound switch under the stepper — on = the notification
     plays its audio, off = it arrives silently. */
  const soundOn = kind === "durood" ? settings.duroodRemSound !== false : settings.astaghRemSound !== false;
  const ctl = `<div class="row" style="gap:10px;align-items:center;justify-content:center;margin-top:8px">
    <button class="btn" data-rem-step="${kind}:-1" aria-label="কমান">−</button>
    <span style="font-size:20px;font-weight:700;min-width:96px;text-align:center">${num(m)} ${Lb("মিনিট", "min")}</span>
    <button class="btn" data-rem-step="${kind}:+1" aria-label="বাড়ান">+</button>
  </div>
  <p class="muted small" style="margin:8px 0 0;text-align:center" id="rem-${kind}-label">${remStepLabel(kind, m)}</p>
  <div class="row between" style="margin-top:10px">
    <span class="small">🔊 ${Lb("সাউন্ড", "Sound")}</span>
    <label class="switch"><input type="checkbox" id="rem-${kind}-sound" ${soundOn ? "checked" : ""}><span class="slider"></span></label>
  </div>
  <p class="muted small" style="margin:4px 0 0" id="rem-${kind}-sound-label">${soundOn ? Lb("চালু — নোটিফিকেশনে অডিও বাজবে।", "On — the notification plays its audio.") : Lb("বন্ধ — নোটিফিকেশন নীরবে আসবে।", "Off — the notification arrives silently.")}</p>`;
  return `<div class="adj-panel">
    <div class="adj-head"><span>${icon} ${Lb(titleBn, titleEn)}</span>
      <label class="switch"><input type="checkbox" id="rem-${kind}-on" ${on ? "checked" : ""}><span class="slider"></span></label></div>
    ${ctl}
  </div>`;
}
function renderReminderSettings(){
  const box = $("#reminder-settings"); if (!box) return;
  box.innerHTML =
    remPanel("durood", "📿", "দরুদ শরিফ রিমাইন্ডার", "Durood Sharif reminder", !!settings.duroodRemOn, settings.duroodRemMin || 30) +
    remPanel("astagh", "🤲", "আস্তাগফিরুল্লাহ রিমাইন্ডার", "Astaghfirullah reminder", !!settings.astaghRemOn, settings.astaghRemMin || 30);
  const dOn = $("#rem-durood-on"), aOn = $("#rem-astagh-on");
  if (dOn) dOn.onchange = e=>{ settings.duroodRemOn = e.target.checked; lastDuroodRemAt = Date.now();
    saveSettings(); scheduleNativeDhikr(); renderReminderSettings();
    toast(settings.duroodRemOn ? Lb("দরুদ রিমাইন্ডার চালু ✓", "Durood reminder on ✓") : Lb("দরুদ রিমাইন্ডার বন্ধ", "Durood reminder off")); };
  if (aOn) aOn.onchange = e=>{ settings.astaghRemOn = e.target.checked; lastAstaghRemAt = Date.now();
    saveSettings(); scheduleNativeDhikr(); renderReminderSettings();
    toast(settings.astaghRemOn ? Lb("আস্তাগফিরুল্লাহ রিমাইন্ডার চালু ✓", "Astaghfirullah reminder on ✓") : Lb("আস্তাগফিরুল্লাহ রিমাইন্ডার বন্ধ", "Astaghfirullah reminder off")); };
  /* Fix #33: sound switches — flipping one re-schedules that reminder
     into the other channel (sound channel ↔ silent channel) immediately,
     so the switch REALLY works: on = audio plays, off = silent. */
  const dSnd = $("#rem-durood-sound"), aSnd = $("#rem-astagh-sound");
  if (dSnd) dSnd.onchange = e=>{ settings.duroodRemSound = e.target.checked;
    saveSettings(); scheduleNativeDhikr(); renderReminderSettings();
    toast(settings.duroodRemSound ? Lb("দরুদ রিমাইন্ডারের সাউন্ড চালু ✓", "Durood reminder sound on ✓") : Lb("দরুদ রিমাইন্ডারের সাউন্ড বন্ধ — নীরবে আসবে", "Durood reminder sound off — arrives silently")); };
  if (aSnd) aSnd.onchange = e=>{ settings.astaghRemSound = e.target.checked;
    saveSettings(); scheduleNativeDhikr(); renderReminderSettings();
    toast(settings.astaghRemSound ? Lb("আস্তাগফিরুল্লাহ রিমাইন্ডারের সাউন্ড চালু ✓", "Astaghfirullah reminder sound on ✓") : Lb("আস্তাগফিরুল্লাহ রিমাইন্ডারের সাউন্ড বন্ধ — নীরবে আসবে", "Astaghfirullah reminder sound off — arrives silently")); };
  /* Fix #31: − / + stepper — each tap moves the interval by exactly 1
     minute (clamped 1..60) and saves + re-syncs immediately. No slider,
     no offset, no preset position, nothing like the namaz adjuster. */
  $$("#reminder-settings [data-rem-step]").forEach(b=>b.onclick=()=>{
    const parts = b.dataset.remStep.split(":"); const kind = parts[0], d = +parts[1];
    const cur = kind === "durood" ? (settings.duroodRemMin || 30) : (settings.astaghRemMin || 30);
    const m = clampDhikrMin(cur + d);
    if (kind === "durood"){ settings.duroodRemMin = m; settings.duroodRemOn = true; lastDuroodRemAt = Date.now(); }
    else { settings.astaghRemMin = m; settings.astaghRemOn = true; lastAstaghRemAt = Date.now(); }
    saveSettings(); scheduleNativeDhikr(); renderReminderSettings();
    toast(Lb(`রিমাইন্ডার: প্রতি ${num(m)} মিনিট পর পর ✓`, `Reminder: every ${m} min ✓`));
  });
  const dl = $("#daily-label");
  if (dl) dl.textContent = "🌅 " + Lb("প্রতিদিন সকালে হাদিস ও আয়াত", "Daily morning hadith & verse");
  const dd = $("#daily-desc");
  if (dd) dd.textContent = Lb("চালু থাকলে প্রতিদিন সকালে (৭টা) নতুন একটি হাদিস ও কুরআনের একটি আয়াতের নোটিফিকেশন আসবে — প্রতিদিনই আলাদা। কোনো সার্ভার বা অ্যাকাউন্ট লাগে না; প্রতিটি ফোন নিজের ভেতরে থাকা হাদিস ও কুরআনের ডেটা থেকেই প্রতিদিনেরটা বেছে নেয়।",
    "When on, a new hadith and a Quran verse arrive every morning (7 AM) — a different one each day. No server or account is needed; each phone picks the day's hadith and verse from the data already inside the app.");
  const ds = $("#set-daily"); if (ds) ds.checked = !!settings.dailyNotif;
}

/* ---------------- Azan alerts (in-app) ---------------- */
const ADHANS = [
  {id:"a1", name:"Mishary Rashid Alafasy", url:"https://cdn.aladhan.com/audio/adhans/a1.mp3"},
  {id:"a2", name:"Ahmad al-Nafees", url:"https://cdn.aladhan.com/audio/adhans/a2.mp3"},
  {id:"a3", name:"Hafiz Mustafa Özcan (Turkey)", url:"https://cdn.aladhan.com/audio/adhans/a3.mp3"},
  {id:"a7", name:"Mishary Alafasy (Dubai One TV)", url:"https://cdn.aladhan.com/audio/adhans/a7.mp3"},
  {id:"a11", name:"Mansour Al-Zahrani", url:"https://cdn.aladhan.com/audio/adhans/a11-mansour-al-zahrani.mp3"}
];
let rungToday = {};
function playAzan(){
  const ad = ADHANS.find(a=>a.id===settings.adhan) || ADHANS[0];
  const a = $("#audio-azan");
  a.src = "audio/azan.mp3";
  if (settings.adhan !== "a1") a.src = ad.url;
  a.play().catch(()=>{});
  if (settings.notif && "Notification" in window && Notification.permission==="granted"){
    const nx = nextPrayer(); const nm = PRAYERS.find(p=>p.id===nx.id);
    new Notification("My Deen — " + (pname(nm.id)), {body: Lb("নামাজের সময় হয়েছে", "It is time for prayer"), icon:"icons/icon-192.png"});
  }
}
function checkAzan(){
  if (!timings || !settings.azan) return;
  const now = locNow(); const key = `${todayKey()}_${now.getHours()}:${now.getMinutes()}`;
  const mins = now.getHours()*60 + now.getMinutes();
  for (const p of PRAYER_IDS){
    if (!settings.alarmOn[p]) continue;
    const at = toMin(timings[p]) + (settings.offsets[p] || 0);
    if (at===mins && !rungToday[key+p]){ rungToday[key+p]=true; playAzan(); toast(`🕌 ${Lb("নামাজের সময় হয়েছে", "Time for prayer")} — ${p}`); }
  }
}

/* ---------------- native (Capacitor) azan notifications ----------------
   Only runs inside the Android app (window.Capacitor present). The plain
   web/PWA version never touches this code, so it cannot break it.
   For every fard prayer, two things are scheduled:
     1. pre-azan reminder — the user's exact Bengali text (Fix #8), the
        SAME text twice: 5 minutes before (ids 51-55) and 2 minutes
        before (ids 31-35), no sound.
     2. azan (ids 1-5) at prayer time + user offset, channel "azan-v2" with
        the bundled azan.mp3 as the notification sound. The sound is
        played by the system as the notification sound, so dismissing /
        swiping the notification away stops the azan audio.
   Tahajjud (id 36): notification ONLY, never an azan — and only when
   its alarm is set.
   There is NO post-prayer check / hurry flow any more (Fix #8 removed
   it). Prayers are marked done from the home rows (done-circle) or the
   tracker.
   All times re-sync to the current day whenever the app is opened or
   settings are saved. ------------------------------------------------------ */
/* One-time cleanup (Fix #8): builds before Fix #8 scheduled the old
   daily check/hurry notifications (ids 11-15, 21-25, 100-159) with
   repeats:true — they keep firing until cancelled. Cancel them once. */
/* Fix #39: the old check/hurry alarms were armed by the NATIVE plugin
   (AlarmManager), not by LocalNotifications — so the LN cancel below
   never touched them, and AlarmReceiver re-armed them every day
   (rescheduleNextDay), which is why the wrong hurry text kept arriving
   even though the current code never schedules it. Cancel them through the native plugin on EVERY sync
   (cheap, idempotent) — never behind a one-time flag. The native
   scheduleAlarms also cancels any other stale stored alarm, and a
   fired alarm that is no longer stored is never re-armed. */
async function cancelLegacyCheckReminders(){
  try {
    if (typeof window.Capacitor === "undefined" || !window.Capacitor.Plugins) return;
    const ids = [];
    for (let i=11;i<=15;i++) ids.push(i);
    for (let i=21;i<=25;i++) ids.push(i);
    for (let i=100;i<160;i++) ids.push(i);
    const PA = window.Capacitor.Plugins.PrayerAlarm;
    if (PA && PA.cancelAlarms){ try { await PA.cancelAlarms({ ids }); } catch(e){} }
    if (store.get("legacy_check_cancelled", false)) return;
    const LN = window.Capacitor.Plugins.LocalNotifications; if (!LN) return;
    await LN.cancel({ notifications: ids.map(id=>({id})) });
    store.set("legacy_check_cancelled", true);
  } catch(e){}
}
/* Pre-azan texts (Fix #8) — the user's exact Bengali wording, not one
   letter changed. The same text arrives twice before every fard prayer:
   5 minutes before and 2 minutes before; the azan follows at prayer
   time. */
const AZAN_IDS = [1,2,3,4,5];
const PREAZAN_TEXTS = {
  Fajr: "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন",
  Dhuhr: "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন",
  Asr: "আসরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন",
  Maghrib: "মাগরিবের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন",
  Isha: "ইশার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন"
};
const TAHAJJUD_TEXT = "তাহাজ্জুদের সময় হয়েছে, উঠে নামাজের প্রস্তুতি নিন";
const PREAZAN_IDS = [31,32,33,34,35];
const PREAZAN5_IDS = [51,52,53,54,55];
const TAHAJJUD_ID = 36, SEHRI_ID = 37, IFTAR_ID = 38;
const FORB_IDS = [41,42,43], DUHA_ID = 44;
/* One list of everything the exact-alarm scheduler must fire. Each entry:
   {id, at: Date, type, title, body, sound, prayerId}. `sound` is one of
   azan | durood | istighfar | reminder | none and maps to a res/raw mp3
   on the native side (and to an LN channel sound in the fallback).
   Every entry is the NEXT occurrence of that item. */
function buildPrayerAlarmList(){
  if (!timings) return [];
  /* Fix #12: alarm instants are ABSOLUTE times, but prayer times are
     location wall-clock times. Compare in the location frame (ln),
     then convert each scheduled time back to the absolute instant it
     means in the location's timezone (locAbs) — otherwise an alarm
     for 17:17 in Jashore would fire at 17:17 on a Malaysia clock,
     two hours early. */
  const now = new Date();
  const ln = locNow(now);
  const dayStart = new Date(ln); dayStart.setHours(0,0,0,0);
  const atMin = m => { const d = new Date(dayStart); d.setMinutes(m); return d; };
  const nextOcc = d => { if (d <= ln) d.setDate(d.getDate()+1); return locAbs(d); };
  const list = [];
  /* Multi-select (Fix #10): one native sound per alarm — azan wins when
     selected, otherwise the notification sound; silent alone = none. */
  const soundFor = id => {
    const ss = normalizeSounds(settings.alarmSound[id]);
    if (ss.includes("silent")) return "none";
    if (ss.includes("azan")) return "azan";
    return "reminder"; // name / notification / beep / ring → reminder sound
  };
  PRAYER_IDS.forEach((id, i)=>{
    const base = toMin(timings[id]); if (base == null) return;
    const at = nextOcc(atMin(base + (settings.offsets[id] || 0)));
    const name = pname(id);
    // pre-azan (Fix #8 + #9): the same text twice — 5 minutes before
    // and 2 minutes before the azan. ALWAYS on: no toggle, no option,
    // even when this prayer's azan alarm is off.
    // Build #19, Fix #5: the reminder is also SPOKEN — the alarm
    // carries speak:true, and the native AlarmReceiver reads the body
    // aloud with the phone's Bengali TTS voice (the foreground path in
    // checkPreAzanVoice speaks it when the app is open). The body is
    // the exact Fix #8 text, verbatim — never altered.
    [5, 2].forEach((mins, j)=>{
      const preAt = new Date(at.getTime() - mins*60000);
      if (preAt <= now) preAt.setDate(preAt.getDate()+1);
      list.push({ id: (j===0 ? PREAZAN5_IDS : PREAZAN_IDS)[i], at: preAt, type: "preazan",
        title: "My Deen — " + name, body: PREAZAN_TEXTS[id], sound: "none", prayerId: id, speak: true });
    });
    if (!settings.alarmOn[id]) return;
    /* Fix #38: "silent" must actually silence — before this every azan
       entry posted on the azan-v2 channel (azan sound) no matter what
       was selected, so "নিঃশব্দ" still rang the azan. A silent
       selection now posts on the silent channel instead; every other
       selection (including the "name" default) still plays the azan. */
    const snd = soundFor(id);
    list.push({ id: AZAN_IDS[i], at, type: snd==="none" ? "azan-v2-silent" : "azan-v2", title: "My Deen — " + name,
      body: Lb("মিসওয়াক ও অজু করে নামাজের জন্য প্রস্তুত হোন", "Use miswak and perform wudu to prepare for prayer"),
      sound: snd, prayerId: id });
  });
  // Tahajjud: notification ONLY, never an azan — and only when its
  // alarm is set (Fix #4 §7).
  if (settings.alarmOn.Tahajjud){
    const lt = toMin(timings.Lastthird);
    if (lt != null){
      const at = nextOcc(atMin(lt + (settings.offsets.Tahajjud||0)));
      list.push({ id: TAHAJJUD_ID, at, type: "tahajjud", title: "My Deen — " + Lb("তাহাজ্জুদ", "Tahajjud"),
        body: TAHAJJUD_TEXT, sound: "none", prayerId: "Tahajjud" });
    }
  }
  if (settings.alarmOn.Sehri){
    const im = toMin(timings.Imsak);
    if (im != null) list.push({ id: SEHRI_ID, at: nextOcc(atMin(im + (settings.offsets.Sehri||0))), type: "sehri",
      title: "My Deen — " + Lb("সাহরি", "Sehri"), body: Lb("সাহরির সময় হয়েছে", "It is time for Sehri"), sound: "reminder", prayerId: "Sehri" });
  }
  if (settings.alarmOn.Iftar){
    const mg = toMin(timings.Maghrib);
    if (mg != null) list.push({ id: IFTAR_ID, at: nextOcc(atMin(mg + (settings.offsets.Iftar||0))), type: "iftar",
      title: "My Deen — " + Lb("ইফতার", "Iftar"), body: Lb("ইফতারের সময় হয়েছে", "It is time for Iftar"), sound: "reminder", prayerId: "Iftar" });
  }
  forbiddenWindows().forEach((w, i)=>{
    if (!settings.alarmOn[w.id]) return;
    list.push({ id: FORB_IDS[i], at: nextOcc(atMin(w.start + (settings.offsets[w.id]||0))), type: "forbidden",
      title: "My Deen — " + Lb(w.bn, w.en),
      body: Lb("সালাতের নিষিদ্ধ সময় শুরু হয়েছে", "A forbidden prayer time has begun"), sound: "none", prayerId: w.id });
  });
  if (settings.alarmOn.Duha){
    const sr = toMin(timings.Sunrise);
    if (sr != null) list.push({ id: DUHA_ID, at: nextOcc(atMin(sr + 15 + (settings.offsets.Duha||0))), type: "duha",
      title: "My Deen — " + nt("duha"), body: Lb("দুহার নামাজের সময় হয়েছে", "It is time for Duha prayer"), sound: soundFor("Duha"), prayerId: "Duha" });
  }
  return list;
}
/* The one entry point for (re)scheduling prayer-time alarms. Preferred:
   the native exact-alarm plugin (Fix #4 §5) — survives reboot via
   BootReceiver and fires even when the app is killed. Fallback:
   Capacitor LocalNotifications (the old path). */
async function syncPrayerAlarms(){
  await cancelLegacyCheckReminders(); // Fix #8: remove the old daily check/hurry repeats once
  const list = buildPrayerAlarmList();
  const PA = (typeof window.Capacitor !== "undefined" && window.Capacitor.Plugins)
    ? window.Capacitor.Plugins.PrayerAlarm : null;
  if (PA && PA.scheduleAlarms){
    try {
      // Fix #19: the schedule result used to be ignored — on a fresh
      // install, with the exact-alarm permission still missing, EVERY
      // alarm was silently skipped and the user only found out when the
      // azan never rang. Now the skipped count is recorded and shown.
      const r = await PA.scheduleAlarms({ alarms: list.map(a=>({ id:a.id, at:a.at.getTime(), type:a.type, title:a.title, body:a.body, sound:a.sound, prayerId:a.prayerId, speak: !!a.speak })) });
      alarmStatus.checked = true;
      alarmStatus.scheduled = (r && typeof r.scheduled === "number") ? r.scheduled : list.length;
      alarmStatus.skipped = (r && typeof r.skipped === "number") ? r.skipped : 0;
      refreshAlarmStatus();
      return;
    } catch(e){ /* fall through to the LN path */ }
  }
  await scheduleNativeAzan();
  alarmStatus.checked = true; alarmStatus.scheduled = list.length; alarmStatus.skipped = 0;
  refreshAlarmStatus();
}
/* Fix #19: alarm + permission status, shown on Home (warning banner)
   and the Alarm page so the user can SEE before the prayer time
   whether the azan will ring — instead of discovering at the prayer
   time that it never rang. */
let alarmStatus = { checked:false, notifications:false, exact:false, scheduled:0, skipped:0 };
async function refreshAlarmStatus(){
  const PA = (typeof window.Capacitor !== "undefined" && window.Capacitor.Plugins)
    ? window.Capacitor.Plugins.PrayerAlarm : null;
  if (PA && PA.getStatus){
    try {
      const s = await PA.getStatus();
      alarmStatus.checked = true;
      alarmStatus.notifications = !!s.notificationsGranted;
      alarmStatus.exact = !!s.exactAlarmGranted;
    } catch(e){}
  }
  renderAlarmStatus();
}
function nextAzanInfo(){
  try {
    if (!timings) return "";
    const now = Date.now();
    const next = buildPrayerAlarmList().filter(a=>a.type.startsWith("azan-v2") && a.at.getTime() > now).sort((x,y)=>x.at-y.at)[0];
    if (!next) return "";
    return `${Lb("পরের আজান", "Next azan")}: ${pname(next.prayerId)} ${fmtTime(timings[next.prayerId] || "")}`;
  } catch(e){ return ""; }
}
function renderAlarmStatus(){
  const w = $("#alarm-warn");
  if (w){
    const bad = alarmStatus.checked && (!alarmStatus.notifications || !alarmStatus.exact || alarmStatus.skipped > 0);
    w.hidden = !bad;
    if (bad){
      const missing = [];
      if (!alarmStatus.notifications) missing.push(Lb("নোটিফিকেশন", "notifications"));
      if (!alarmStatus.exact) missing.push(Lb("সঠিক সময়ের অ্যালার্ম", "exact alarms"));
      w.innerHTML = `<b>⚠ ${Lb("আজানের অ্যালার্ম সেট হয়নি", "Azan alarms are not set")}</b><span>${Lb("অনুমতি দিন, নইলে আজান বাজবে না", "Grant the permission or the azan will not ring")}${missing.length ? " — " + missing.join(", ") : ""}</span><button class="btn small" id="alarm-warn-btn">${Lb("অনুমতি দিন", "Grant permission")}</button>`;
      const b = $("#alarm-warn-btn"); if (b) b.onclick = ()=>requestAllPermissions();
    }
  }
  const s = $("#alarm-status");
  if (s && alarmStatus.checked){
    if (!alarmStatus.notifications || !alarmStatus.exact || alarmStatus.skipped > 0){
      s.innerHTML = `⚠ ${Lb("আজানের অ্যালার্ম সেট হয়নি — ওপরে অনুমতি দিন", "Azan alarms are not set — grant the permission above")}`;
    } else {
      const next = nextAzanInfo();
      s.innerHTML = `✓ ${Lb("আজানের অ্যালার্ম চালু আছে", "Azan alarms are on")} (${num(alarmStatus.scheduled)})${next ? " — " + next : ""}`;
    }
  }
}
async function scheduleNativeAzan(){
  try {
    if (typeof window.Capacitor === "undefined" || !window.Capacitor.Plugins) return;
    const LN = window.Capacitor.Plugins.LocalNotifications;
    if (!LN || !timings || !settings.azan) return;
    const perm = await LN.requestPermissions();
    if (perm && perm.display && perm.display !== "granted") return;
    // Channels: Android 8+ plays the CHANNEL sound, so each sound gets its own channel.
    await LN.createChannel({ id: "azan-v2", name: "Azan", description: "Prayer time azan alerts", sound: "azan.mp3", importance: 5, vibration: true });
    // Fix #38: silent azan channel — "নিঃশব্দ" posts here, so no sound plays.
    await LN.createChannel({ id: "azan-v2-silent", name: "Azan (silent)", description: "Prayer time alerts without sound", importance: 5, vibration: true });
    await LN.createChannel({ id: "preazan", name: "Pre-azan reminders", description: "5 and 2 minutes before prayer time", importance: 4, vibration: true });
    await LN.createChannel({ id: "tahajjud", name: "Tahajjud", description: "Tahajjud notification (no azan)", importance: 4, vibration: true });
    await LN.createChannel({ id: "sehri", name: "Sehri", description: "Sehri alarm", importance: 4, vibration: true });
    await LN.createChannel({ id: "iftar", name: "Iftar", description: "Iftar alarm", importance: 4, vibration: true });
    await LN.createChannel({ id: "forbidden", name: "Forbidden times", description: "Forbidden prayer time alerts", importance: 4, vibration: true });
    await LN.createChannel({ id: "duha", name: "Duha", description: "Duha prayer alarm", sound: "reminder.mp3", importance: 4, vibration: true });
    const soundFile = s => s==="azan" ? "azan.mp3" : s==="durood" ? "durood.mp3" : s==="istighfar" ? "istighfar.mp3" : s==="reminder" ? "reminder.mp3" : undefined;
    const notifs = buildPrayerAlarmList().map(a=>{
      const n = { id: a.id, title: a.title, body: a.body,
        schedule: { at: a.at, repeats: true, allowWhileIdle: true }, channelId: a.type };
      const sf = soundFile(a.sound);
      if (sf) n.sound = sf;
      return n;
    });
    await LN.cancel({ notifications: [...AZAN_IDS, ...PREAZAN_IDS, ...PREAZAN5_IDS, TAHAJJUD_ID, SEHRI_ID, IFTAR_ID, ...FORB_IDS, DUHA_ID].map(id=>({id})) });
    if (notifs.length) await LN.schedule({ notifications: notifs });
  } catch (e) { /* native-only; never break the web app */ }
}

/* ---------------- home location card ---------------- */
function renderHomeLocation(){
  const txt = $("#home-loc-text"); if (!txt) return;
  const st = $("#home-loc-status");
  if (!hasLocation()){
    txt.textContent = Lb("কোনো অবস্থান সেট করা নেই", "No location set");
    if (st) st.textContent = Lb("নামাজের সঠিক সময় ও কিবলার জন্য অবস্থান সেট করুন — GPS দিয়ে অটো।", "Set your location for accurate prayer times & Qibla — automatically with GPS.");
    const co0 = $("#home-loc-coords"); if (co0) co0.textContent = "";
    return;
  }
  txt.textContent = `${settings.city}, ${settings.country}`;
  if (st) st.textContent = settings.locManual
    ? (Lb("ম্যানুয়ালি সেট করা — নামাজের সময় ও কিবলা এই শহর অনুযায়ীই হিসাব করা হয়; অটো GPS এটিকে বদলাবে না। GPS দিয়ে সেট করতে নিচের অটো বোতামে চাপ দিন।", "Set manually — prayer times & Qibla are calculated for this city, and auto GPS will not override it. Tap the auto button below to switch to GPS."))
    : (settings.useCoords
    ? (Lb("GPS দিয়ে অটো সেট করা — নামাজের সময় ও কিবলা এই অবস্থান অনুযায়ী হিসাব করা হয়।", "Auto-set by GPS — prayer times & Qibla are calculated for this location."))
    : (Lb("শহরের নাম দিয়ে সেট করা আছে — GPS / ম্যাপ দিয়ে অটো সেট করতে নিচের বোতামে চাপ দিন।", "Set by city name — tap the button below to auto-set with GPS / map.")));
  const co = $("#home-loc-coords");
  if (co) co.textContent = settings.useCoords ? `${settings.lat}, ${settings.lon}` : "";
}

/* ---------------- real-time location (auto-detect city) ----------------
   GPS is used only after the user grants permission. Coordinates are used
   for prayer times directly (Aladhan timings by coordinates) and the city
   name is resolved with the free OpenStreetMap Nominatim service, only to
   display it. Nothing is stored on any server. ---------------------------- */
const NOMINATIM = "https://nominatim.openstreetmap.org/reverse";
async function detectLocation(auto){
  /* A location the user typed manually is their choice: automatic
     detection NEVER overrides it. Only an explicit tap on a GPS button
     (auto === false) switches back to GPS. */
  if (auto && settings.locManual) return false;
  const getPos = () => new Promise((resolve, reject)=>{
    /* Manual taps use high accuracy (a real GPS fix); automatic attempts
       stay light. A coarse network fix that never resolves was one way
       the old code appeared to "collect nothing". */
    const opts = { enableHighAccuracy: !auto, timeout: 15000, maximumAge: 600000 };
    let settled = false;
    const ok = p => { if (settled) return; settled = true;
      /* Accuracy guard (village fix): a coarse fix over 1 km off would
         put prayer times on the wrong place — reject it so the saved /
         manual location keeps working instead of a wrong one. */
      if (p.coords.accuracy && p.coords.accuracy > 1000){ reject({ code: 4, message: "gps coarse" }); return; }
      resolve({ lat: p.coords.latitude, lon: p.coords.longitude }); };
    const bad = e => { if (!settled){ settled = true; reject(e); } };
    /* Hard timeout: inside some embedded browsers (e.g. an in-app webview
       where geolocation is not delegated) NEITHER callback ever fires —
       without this the attempt would hang silently forever. */
    setTimeout(()=>bad({code:3, message:"gps timeout"}), 15000);
    if (typeof window.Capacitor !== "undefined" && window.Capacitor.Plugins && window.Capacitor.Plugins.Geolocation){
      window.Capacitor.Plugins.Geolocation.getCurrentPosition(opts)
        .then(ok)
        .catch(()=>{ if (navigator.geolocation) navigator.geolocation.getCurrentPosition(ok, bad, opts); else bad(new Error("no gps")); });
    } else if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(ok, bad, opts);
    } else bad(new Error("no gps"));
  });
  try {
    const pos = await getPos();
    settings.lat = +pos.lat.toFixed(4); settings.lon = +pos.lon.toFixed(4);
    settings.useCoords = true;
    settings.locManual = false;
    settings.locId = coordsKeyOf(); settings.coordsLoc = settings.locId;
    try {
      /* zoom=18 resolves down to village / hamlet level — zoom=10 only
         ever returned the nearest town or city (Fix #2). */
      const j = await fetchJson(`${NOMINATIM}?format=json&lat=${settings.lat}&lon=${settings.lon}&zoom=18&accept-language=${settings.lang}`, 10000);
      const a = (j && j.address) || {};
      const city = villageNameOf(a);
      if (city) settings.city = city;
      if (a.country) settings.country = a.country;
    } catch(e){ /* city name stays as-is; coordinates still work */ }
    saveSettings();
    store.set("loc_last_ok", Date.now());
    try { LS.removeItem("dd_timings_cache"); } catch(e){}
    closeLocSetup();
    await initPrayers(); await fetchQibla();
    toast(Lb(`📍 অবস্থান পাওয়া গেছে: ${settings.city}`, `📍 Location found: ${settings.city}`));
    return true;
  } catch(e){
    /* An automatic attempt that fails stays silent and NEVER switches
       autoLoc off: the user's setting remains exactly as they left it,
       the saved city keeps the app working, and the next launch (or the
       manual button) tries again. Only a manual tap explains what to do. */
    if (!auto){
      /* Permission denied or GPS failed: NEVER fall back to a default
         city — just tell the user to allow GPS and try again. */
      const denied = e && e.code === 1;
      const inFrame = window.self !== window.top;
      toast(denied
        ? (Lb("অবস্থান পাওয়া যায়নি — ফোন/ব্রাউজারের সেটিংসে এই অ্যাপের জন্য লোকেশন অনুমতি দিন, তারপর আবার চাপ দিন", "Location unavailable — allow location permission for this app in your phone/browser settings, then tap again"))
        : (Lb("অবস্থান পাওয়া যায়নি — GPS চালু করে আবার চেষ্টা করুন", "Location unavailable — turn on GPS and try again")));
      /* Persistent guidance in the Home location card (a toast alone
         disappears before the steps can be followed). When the app is
         open inside another app's built-in browser, that browser often
         never passes GPS permission through at all — say so plainly and
         give the working route (open in Chrome / installed app), while
         the saved city keeps times and Qibla correct meanwhile. */
      const st = $("#home-loc-status");
      if (st) st.textContent = Lb((inFrame
          ? "⚠️ এই ভেতরের ব্রাউজারে GPS অনুমতি পৌঁছাচ্ছে না — তাই অবস্থান নেওয়া যাচ্ছে না। সমাধান: লিংকটি Chrome ব্রাউজারে খুলুন (অথবা অ্যাপটি ফোনে ইনস্টল করে সেখান থেকে খুলুন), তারপর এই বোতামে আবার চাপ দিন ও 'Allow' দিন।"
          : (denied
            ? "⚠️ লোকেশন অনুমতি বন্ধ আছে। ফোনের Settings → Apps → ব্রাউজার/এই অ্যাপ → Permissions → Location → Allow দিন, তারপর এই বোতামে আবার চাপ দিন।"
            : "⚠️ GPS থেকে অবস্থান পাওয়া যায়নি। ফোনের লোকেশন (GPS) চালু করে খোলা জায়গায় আবার চাপ দিন।")), (inFrame
          ? "⚠️ This in-app browser is not passing GPS permission through, so location cannot be collected here. Fix: open the link in Chrome (or install the app and open it from your home screen), then tap this button again and choose Allow."
          : (denied
            ? "⚠️ Location permission is off. Phone Settings → Apps → your browser/this app → Permissions → Location → Allow, then tap this button again."
            : "⚠️ GPS could not fix your position. Turn on phone location and tap again.")));
    }
    return false;
  }
}

/* ---------------- location setup screen ----------------
   Shown on first launch (and whenever no location is set): GPS only —
   "Allow location". There is deliberately NO default or pre-set city
   anywhere, and no manual city entry (Fix #5). */
function openLocSetup(){
  const o = $("#loc-setup"); if (!o) return;
  o.style.display = "flex";
}
function closeLocSetup(){ const o = $("#loc-setup"); if (o) o.style.display = "none"; }
/* Village-first place naming (Fix #2): prefer the smallest place
   (village / hamlet), then the town / city, then the wider area. */
/* Known geocoder spelling fixes (Build #19, Fix #7): OpenStreetMap
   Nominatim returns the user's home area as "Chepor" — the locality
   next to Chemor — but the place is Chemor, so the displayed name is
   corrected here, at the one funnel every Nominatim name passes
   through (detectLocation + saveManualLocation). */
const CITY_NAME_FIXES = { "chepor": "Chemor" };
function normalizeCityName(name){
  const n = String(name || "").trim();
  const fixed = CITY_NAME_FIXES[n.toLowerCase()];
  return fixed || n;
}
function villageNameOf(a){
  a = a || {};
  return normalizeCityName(a.village || a.hamlet || a.suburb || a.neighbourhood || a.town || a.city || a.municipality || a.county || a.state_district || a.state || "");
}

/* Offline gazetteer (Fix #2) — village / upazila / city fallback.
   When the network lookup fails, a typed place name is matched here so
   prayer times still work offline from real coordinates. These are
   public place coordinates, rounded to 2 decimals (~1 km — well
   within prayer-time tolerance). */
const GAZETTEER = {
  /* Bangladesh — all 64 districts (headquarters) */
  "dhaka": [23.81, 90.41], "chattogram": [22.36, 91.78], "chittagong": [22.36, 91.78],
  "khulna": [22.82, 89.55], "rajshahi": [24.37, 88.60], "barishal": [22.70, 90.37],
  "barisal": [22.70, 90.37], "sylhet": [24.90, 91.87], "rangpur": [25.74, 89.25],
  "mymensingh": [24.75, 90.40], "cumilla": [23.46, 91.18], "comilla": [23.46, 91.18],
  "narayanganj": [23.62, 90.50], "gazipur": [24.00, 90.43], "tangail": [24.25, 89.92],
  "jessore": [23.17, 89.21], "jashore": [23.17, 89.21], "bogura": [24.85, 89.37],
  "bogra": [24.85, 89.37], "dinajpur": [25.63, 88.65], "pabna": [24.01, 89.24],
  "kushtia": [23.90, 89.12], "faridpur": [23.60, 89.83], "noakhali": [22.82, 91.10],
  "coxs bazar": [21.44, 92.00], "bandarban": [22.20, 92.22], "rangamati": [22.65, 92.18],
  "khagrachari": [23.12, 91.98], "feni": [23.02, 91.38], "lakshmipur": [22.95, 90.83],
  "chandpur": [23.23, 90.65], "brahmanbaria": [23.96, 91.11], "habiganj": [24.38, 91.42],
  "moulvibazar": [24.48, 91.78], "sunamganj": [25.07, 91.40], "netrokona": [24.88, 90.73],
  "sherpur": [25.02, 90.02], "jamalpur": [24.92, 89.94], "kishoreganj": [24.44, 90.78],
  "manikganj": [23.86, 90.00], "munshiganj": [23.54, 90.53], "narsingdi": [23.92, 90.72],
  "shariatpur": [23.24, 90.43], "madaripur": [23.17, 90.21], "gopalganj": [23.01, 89.82],
  "bagerhat": [22.66, 89.79], "chuadanga": [23.64, 88.85], "jhenaidah": [23.54, 89.18],
  "magura": [23.49, 89.42], "narail": [23.17, 89.50], "satkhira": [22.72, 89.08],
  "meherpur": [23.76, 88.63], "naogaon": [24.80, 88.95], "natore": [24.61, 89.00],
  "chapainawabganj": [24.60, 88.27], "joypurhat": [25.10, 89.00], "lalmonirhat": [25.92, 89.45],
  "kurigram": [25.80, 89.65], "gaibandha": [25.33, 89.54], "nilphamari": [25.93, 88.86],
  "panchagarh": [26.34, 88.56], "thakurgaon": [26.03, 88.46], "sirajganj": [24.46, 89.70],
  "bhola": [22.69, 90.65], "patuakhali": [22.36, 90.33], "barguna": [22.16, 90.12],
  "jhalokati": [22.64, 90.20], "pirojpur": [22.58, 89.99],
  /* Bangladesh — upazilas / towns (Jessore region first) */
  "bagharpara": [23.22, 89.35], "abhaynagar": [23.02, 89.44], "manirampur": [23.02, 89.23],
  "keshabpur": [22.91, 89.23], "chaugachha": [23.27, 89.02], "sharsha": [23.08, 88.86],
  "jhikargachha": [23.10, 89.12], "benapole": [23.04, 88.90], "dumuria": [22.82, 89.43],
  "phultala": [22.97, 89.46], "dighalia": [22.91, 89.53], "terokhada": [22.94, 89.67],
  "rupsa": [22.83, 89.58], "paikgachha": [22.59, 89.34], "koyra": [22.35, 89.30],
  "dacope": [22.58, 89.51], "batiaghata": [22.74, 89.52], "mongla": [22.48, 89.61],
  "rampal": [22.60, 89.66], "fakirhat": [22.78, 89.71], "mollahat": [22.93, 89.70],
  "chitalmari": [22.79, 89.87], "morrelganj": [22.45, 89.86], "sarankhola": [22.30, 89.80],
  "kachua": [22.65, 89.98], "kachua chandpur": [23.35, 90.89], "lohagara": [23.18, 89.65],
  "kalia": [23.03, 89.63], "savar": [23.86, 90.27], "dhamrai": [23.92, 90.22],
  "keraniganj": [23.70, 90.33], "tongi": [23.89, 90.41], "mirpur": [23.80, 90.36],
  "uttara": [23.87, 90.38], "mirzapur": [24.11, 90.19], "kalihati": [24.38, 89.97],
  "ghatail": [24.48, 90.02], "sakhipur": [24.32, 90.17], "basail": [24.22, 90.06],
  "nagarpur": [24.06, 89.87], "delduar": [24.15, 89.98], "sreepur": [24.20, 90.48],
  "kapasia": [24.10, 90.57], "kaliganj": [23.92, 90.57], "kaliakair": [24.08, 90.32],
  "laksam": [23.24, 91.13], "chauddagram": [23.22, 91.31], "nangalkot": [23.17, 91.21],
  "barura": [23.38, 91.06], "chandina": [23.49, 91.01], "daudkandi": [23.53, 90.73],
  "homna": [23.68, 90.73], "meghna": [23.62, 90.67], "titas": [23.61, 90.77],
  "muradnagar": [23.64, 90.93], "debidwar": [23.60, 90.99], "burichang": [23.55, 91.13],
  "brahmanpara": [23.62, 91.10], "hajiganj": [23.25, 90.85], "shahrasti": [23.21, 90.95],
  "faridganj": [23.13, 90.75], "haimchar": [23.09, 90.65], "matlab": [23.35, 90.71],
  "matlab uttar": [23.45, 90.71], "matlab dakshin": [23.35, 90.71],
  "jessore sadar": [23.17, 89.21], "khulna sadar": [22.82, 89.55], "rajshahi sadar": [24.37, 88.60],
  "sylhet sadar": [24.90, 91.87], "rangpur sadar": [25.74, 89.25], "mymensingh sadar": [24.75, 90.40],
  "barishal sadar": [22.70, 90.37], "dinajpur sadar": [25.63, 88.65], "bogura sadar": [24.85, 89.37],
  "pabna sadar": [24.01, 89.24], "kushtia sadar": [23.90, 89.12], "tangail sadar": [24.25, 89.92],
  "gazipur sadar": [24.00, 90.43], "narayanganj sadar": [23.62, 90.50], "chandpur sadar": [23.23, 90.65],
  "cumilla sadar": [23.46, 91.18],
  /* Malaysia */
  "ipoh": [4.60, 101.08], "chemor": [4.72, 101.12], "chepor": [4.72, 101.12], "jelapang": [4.65, 101.07],
  "kuala lumpur": [3.14, 101.69], "kl": [3.14, 101.69], "george town": [5.41, 100.34],
  "penang": [5.41, 100.34], "johor bahru": [1.49, 103.76], "malacca": [2.19, 102.25],
  "melaka": [2.19, 102.25], "kuantan": [3.81, 103.33], "kuching": [1.55, 110.35],
  "kota kinabalu": [5.98, 116.07], "shah alam": [3.07, 101.52], "petaling jaya": [3.11, 101.60],
  "seremban": [2.73, 101.94], "alor setar": [6.12, 100.37], "kota bharu": [6.13, 102.24],
  "kuala terengganu": [5.33, 103.14], "taiping": [4.85, 100.74], "batu gajah": [4.47, 101.04],
  "kampar": [4.30, 101.15], "gopeng": [4.47, 101.17], "simpang pulai": [4.58, 101.13],
  "tanjung rambutan": [4.67, 101.15], "sungai siput": [4.82, 101.07], "kuala kangsar": [4.77, 100.94],
  "parit buntar": [5.12, 100.49], "teluk intan": [4.02, 101.02], "bagan serai": [5.01, 100.54],
  /* Major world cities */
  "makkah": [21.42, 39.82], "mecca": [21.42, 39.82], "madinah": [24.47, 39.61],
  "medina": [24.47, 39.61], "london": [51.51, -0.13], "new york": [40.71, -74.01],
  "toronto": [43.65, -79.38], "sydney": [-33.87, 151.21], "dubai": [25.20, 55.27],
  "singapore": [1.35, 103.82], "jakarta": [-6.21, 106.85], "delhi": [28.61, 77.21],
  "kolkata": [22.57, 88.36], "karachi": [24.86, 67.01], "lahore": [31.52, 74.36],
  "istanbul": [41.01, 28.98], "cairo": [30.04, 31.24], "bangkok": [13.76, 100.50]
};
function gazetteerLookup(q){
  const norm = s => (s || "").toLowerCase().replace(/['\u2019]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const strip = s => norm(s).replace(/\b(upazila|thana|sadar|district|zila|pourashava|union|city)\b/g, "").replace(/\s+/g, " ").trim();
  const tries = [];
  const add = t => { if (t && !tries.includes(t)) tries.push(t); };
  add(norm(q)); add(strip(q));
  /* "Bagharpara, Jessore" — try each comma part on its own. */
  String(q || "").split(",").forEach(part => { add(norm(part)); add(strip(part)); });
  for (const t of tries){ if (GAZETTEER[t]) return GAZETTEER[t]; }
  return null;
}

/* Manual location: the typed city is resolved to real coordinates with
   OpenStreetMap Nominatim, so prayer times are then computed from the
   actual latitude/longitude and the place's own timezone, with the
   region's calculation method — accurate anywhere in the world. If the
   lookup fails, the city name itself is kept and the API resolves it. */
async function saveManualLocation(city, country){
  city = (city || "").trim(); country = (country || "").trim();
  if (!city){ toast(Lb("আগে শহরের নাম লিখুন", "Type your city name first")); return false; }
  let resolved = false;
  try {
    const j = await fetchJson(`https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(city + (country ? ", " + country : ""))}`, 10000);
    if (Array.isArray(j) && j.length){
      const r = j[0], a = r.address || {};
      settings.lat = +(+r.lat).toFixed(4); settings.lon = +(+r.lon).toFixed(4);
      settings.useCoords = true;
      settings.city = villageNameOf(a) || city;
      settings.country = a.country || country;
      settings.locId = coordsKeyOf(); settings.coordsLoc = settings.locId;
      resolved = true;
    }
  } catch(e){ /* fall through: gazetteer / typed name below */ }
  /* Offline fallback (Fix #2): when the network lookup fails, match
     the typed village / upazila / city against the built-in gazetteer
     so prayer times still work offline from real coordinates. */
  if (!resolved){
    const g = gazetteerLookup(city + (country ? ", " + country : ""));
    if (g){
      settings.lat = g[0]; settings.lon = g[1]; settings.useCoords = true;
      settings.city = normalizeCityName(city); settings.country = country;
      settings.locId = coordsKeyOf(); settings.coordsLoc = settings.locId;
      resolved = true;
    }
  }
  settings.locManual = true;
  if (!resolved){
    settings.city = normalizeCityName(city); settings.country = country; settings.useCoords = false;
    settings.locId = cityKeyOf(settings.city, country);
    /* Coordinates left over from a DIFFERENT place must not survive:
       the offline calculator and Qibla would silently keep using the
       old location, so the old times appeared unchanged. They are kept
       only when they were resolved for this very city. */
    if (settings.coordsLoc !== settings.locId){ settings.lat = null; settings.lon = null; }
  }
  saveSettings();
  try { LS.removeItem("dd_timings_cache"); } catch(e){}
  closeLocSetup();
  await initPrayers(); await fetchQibla();
  toast(Lb(`📍 অবস্থান সেট হয়েছে: ${settings.city}, ${settings.country}`, `📍 Location set: ${settings.city}, ${settings.country}`));
  return true;
}


/* ---------------- navigation & settings UI ---------------- */
const METHODS = [[17,"Malaysia (JAKIM)"],[2,"ISNA (North America)"],[3,"Muslim World League"],[4,"Umm al-Qura (Makkah)"],
  [5,"Egyptian General Authority"],[1,"Karachi"],[8,"Gulf Region"],[11,"Singapore"],[13,"Turkey (Diyanet)"],[14,"Russia"],
  [15,"Moonsighting Committee"],[16,"Dubai"],[18,"Tunisia"],[19,"Algeria"],[20,"Indonesia"],[21,"Morocco"],[22,"Jordan"]];
/* Namaz Shikkha is paused at the owner's request (2026-11-17): the home
   card is hidden and this guard keeps the section unreachable, but all
   of its markup, data and code stay in place. Set to true to re-enable. */
const LEARN_ENABLED = false;
function showView(v){
  if (v === "learn" && !LEARN_ENABLED) v = "home";
  /* Build #19, Fix #1: the header is ALWAYS visible now — its date
     line is the one date on Home (the duplicate home date card is
     gone). Hiding it on Home used to leave the home-top card as the
     only date, and on first launch (before any showView call) BOTH
     dates showed — the duplicate the user reported. */
  $$(".view").forEach(s=>s.classList.remove("active"));
  const el = $("#view-"+v); if (el) el.classList.add("active");
  $$("#bottom-nav button").forEach(b=>b.classList.toggle("on", b.dataset.view===v));
  if (v==="quran"){
    // If the startup download failed, opening the tab tries again.
    if (!surahMeta) loadSurahMeta().then(()=>{ renderSurahList($("#surah-search").value, currentQTab); renderQuranProgress(); });
    renderSurahList($("#surah-search").value, currentQTab); renderQuranProgress();
  }
  if (v==="tasbih") renderTasbih();
  if (v==="duas"){ renderDuaCats(); renderDuas(); }
  if (v==="learn") renderLearn();
  if (v==="qibla"){ renderQibla(); startCompass(); }
  if (v==="fasting") renderFasting();
  if (v==="alarm") renderAlarmPage();
  if (v==="calendar") renderCalendarPage();
  if (v==="prayer-detail") renderDetailPage();
  if (v==="notif"){ renderNotifFeed(); store.set("notif_seen", todayKey()); updateNotifBadge(); }
  if (v==="settings") fillSettings();
  window.scrollTo(0,0);
}

/* First-launch permission flow (Fix #4 §5): the app takes every
   permission it needs from the phone — location (asked by the setup
   screen), notifications, and exact alarms (Android 12+: a Settings
   page the user switches on once). Runs once on first launch; the
   Settings button re-runs it any time. */
async function requestAllPermissions(){
  try {
    const PA = (typeof window.Capacitor !== "undefined" && window.Capacitor.Plugins)
      ? window.Capacitor.Plugins.PrayerAlarm : null;
    if (PA && PA.requestPermissions){
      toast(Lb("সঠিক সময়ে আজান বাজাতে অনুমতিগুলো দিন 🤍", "Please grant the permissions so the azan rings on time 🤍"));
      await PA.requestPermissions();
    } else if ("Notification" in window && Notification.permission !== "granted"){
      await Notification.requestPermission();
    }
    settings.permAsked = true; saveSettings();
    syncPrayerAlarms();
  } catch(e){}
}
function maybeAskPermissions(){
  if (settings.onboarded) return;
  // First launch (Fix #32): ask for the permissions directly, the way
  // any normal app does — the phone's own dialogs/pages, no in-app modal,
  // no steps, no skip buttons. A short delay so the language chooser /
  // location setup (also first-run) is not covered by it.
  setTimeout(()=>runPermChain(), 2500);
}

// ---- Fix #32: direct system permission requests (no in-app modal) ----
// The user (21:59) does not want the 4-step onboarding modal (ধাপ 1/4,
// dots, "এড়িয়ে যান / পরে করব", explanations). When the app opens it
// just asks for each permission the way normal apps do: the phone's own
// dialog for notifications and battery, the phone's own Settings page
// for exact alarms and autostart (Android allows those two ONLY as a
// toggle on a system page — no app can grant them from inside itself).
// The chain runs ONCE (first launch) and then marks onboarded even if
// the user declines something — a decline is never re-asked on every
// launch; the Fix #19 home banner stays as the fallback, and the
// Settings "সব অনুমতি দিন" button re-runs the chain for what is missing.
const PERM_STEPS = ["notifications", "exact", "battery", "autostart"];
/* Build #19, Fix #3 — why the chain re-prompted / stalled, and the repair:
   (a) The chain only marked onboarded at the very END. Any interruption
       — the app killed while the user is on a Settings page (Xiaomi
       kills background apps aggressively), or a plugin promise that
       never settles (the permission dialog's activity result is lost
       when the activity is recreated) — restarted the WHOLE chain on
       the next launch, re-opening pages the user already saw. Autostart
       can never be detected as granted, so it re-opened EVERY time
       until the chain completed.
   (b) The fix: every step is recorded the moment it is ASKED
       (settings.permStepsAsked, saved at once) and the auto chain never
       asks the same step twice. A kill mid-chain resumes from the next
       unasked step on the next launch; a decline is never re-asked
       (the Fix #19 home banner stays the fallback).
   (c) Stall guard: every step's request races a timeout (90 s for the
       user-paced notification dialog, 30 s for the rest, which resolve
       as soon as their page opens) — a promise that never settles can
       no longer hang the chain forever; the step is marked asked and
       the chain moves on and still marks onboarded.
   The Settings "সব অনুমতি দিন" button re-runs with force=true: it
   re-asks whatever is still missing by real status, ignoring the
   asked flags — the user tapped it on purpose. */
let permChainRunning = false, permChainWaiting = false, permChainIdx = 0;
function permStepsAsked(){ return settings.permStepsAsked || (settings.permStepsAsked = {}); }
function permMarkAsked(id){ permStepsAsked()[id] = true; saveSettings(); }
function permTimeout(promise, ms){
  let timer = null;
  return Promise.race([promise, new Promise(r=>{ timer = setTimeout(()=>r("timeout"), ms); })])
    .finally(()=>{ if (timer) clearTimeout(timer); });
}
function permPA(){ return (typeof window.Capacitor !== "undefined" && window.Capacitor.Plugins) ? window.Capacitor.Plugins.PrayerAlarm : null; }
async function permStatus(){
  const PA = permPA();
  if (PA && PA.getStatus){ try { const s = await PA.getStatus();
    return { notifications: !!s.notificationsGranted, exact: !!s.exactAlarmGranted, battery: !!s.batteryExempt, autostart: false /* undetectable */ };
  } catch(e){} }
  return { notifications: (typeof Notification !== "undefined" && Notification.permission === "granted"), exact: true, battery: true, autostart: true }; // web: only notifications exist
}
async function permRequestStep(id){
  const PA = permPA();
  if (PA && PA.requestStep){ try { await PA.requestStep({ step: id }); } catch(e){} return; }
  if (id === "notifications" && typeof Notification !== "undefined" && Notification.requestPermission){ try { await Notification.requestPermission(); } catch(e){} }
}
async function runPermChain(force){
  if (permChainRunning) return;
  permChainRunning = true; permChainWaiting = false;
  await permChainFrom(0, !!force);
}
async function permChainFrom(idx, force){
  for (let i = idx; i < PERM_STEPS.length; i++){
    const id = PERM_STEPS[i];
    if (!force && permStepsAsked()[id]) continue; // asked once already — never auto-ask again
    const st = await permTimeout(permStatus(), 10000);
    if (st && st !== "timeout" && st[id]) { permMarkAsked(id); continue; } // already granted (or N/A on web)
    // Mark asked BEFORE awaiting the request: if the app is killed
    // while the user is on the Settings page (or the promise never
    // settles), the next launch does not re-open this page.
    permMarkAsked(id);
    await permTimeout(permRequestStep(id), id === "notifications" ? 90000 : 30000);
    if (id === "exact" || id === "autostart"){
      // A system page opened — the user is away from the app. Pause the
      // chain here; the foreground handler resumes it when they return.
      // Autostart is last, so pausing there just ends the chain on return.
      if (id === "autostart"){ finishPermChain(); return; }
      permChainWaiting = true; permChainIdx = i + 1; return;
    }
    if (id === "battery"){
      // The battery dialog resolves immediately after opening — wait for
      // the user to answer it (status flips) or 15 s, whichever first.
      for (let t = 0; t < 15; t++){
        await new Promise(r=>setTimeout(r, 1000));
        if (!permChainRunning) return;
        const s2 = await permTimeout(permStatus(), 10000);
        if (s2 && s2 !== "timeout" && s2.battery) break;
      }
    }
    // notifications: the plugin promise resolves only after the user
    // answers the system dialog, so reaching here means it was answered
    // (or the 90 s stall guard fired).
  }
  finishPermChain();
}
function resumePermChain(){
  if (!permChainRunning || !permChainWaiting) return;
  permChainWaiting = false;
  permChainFrom(permChainIdx, false);
}
function finishPermChain(){
  permChainRunning = false; permChainWaiting = false;
  settings.onboarded = true; settings.permAsked = true; saveSettings();
  syncPrayerAlarms(); refreshAlarmStatus();
}
let currentQTab = "all";
function applyTheme(){ document.documentElement.setAttribute("data-theme", settings.theme);
  const dark = $("#set-dark"); if (dark) dark.checked = settings.theme==="dark"; }
function applyLang(){
  $$("[data-i18n]").forEach(el=>{ el.textContent = t(el.dataset.i18n); });
  document.documentElement.lang = settings.lang;
  document.documentElement.dir = isRTL() ? "rtl" : "ltr";
  const sl = $("#set-lang"); if (sl) sl.value = settings.lang;
  const ss = $("#surah-search"); if (ss) ss.placeholder = t("searchSurah");
  const ja = $("#jump-ayah"); if (ja) ja.placeholder = t("ayahPlaceholder");
  naflBuiltKey = ""; // force the Nafl card to rebuild in the new language
  renderDates(); renderPrayers(); renderTracker(); renderDuaCats(); renderDuas(); renderLearn();
  renderNotifFeed(); renderGreet(); renderHomeLocation(); renderReminderSettings();
}
function fillSettings(){
  const du = $("#set-durood"); if (du) du.checked = !!settings.duroodOnUnlock;
  const pn = $("#set-profile-name"); if (pn) pn.value = settings.profileName || "";
  renderGreet(); renderLoginState();
  const sl0 = $("#set-lang");
  if (sl0) sl0.innerHTML = LANGS.map(l=>`<option value="${l.id}" ${settings.lang===l.id?"selected":""}>${l.native} (${l.name})</option>`).join("");
  $("#set-method").innerHTML = `<option value="0" ${settings.method===0?"selected":""}>${Lb("অটো — এলাকা অনুযায়ী (প্রস্তাবিত)", "Auto — by region (recommended)")}</option>`
    + METHODS.map(m=>`<option value="${m[0]}" ${settings.method===m[0]?"selected":""}>${m[1]}</option>`).join("");
  $("#set-school").value = String(effSchool());
  $("#set-azan").checked = settings.azan;
  $("#set-notif").checked = settings.notif;
  $("#set-adhan").innerHTML = ADHANS.map(a=>`<option value="${a.id}" ${settings.adhan===a.id?"selected":""}>${a.name}</option>`).join("");
  $("#set-reciter").innerHTML = RECITERS.map(r=>`<option value="${r.id}" ${settings.reciter===r.id?"selected":""}>${r.name}</option>`).join("");
  $("#reciter").innerHTML = RECITERS.map(r=>`<option value="${r.id}" ${settings.reciter===r.id?"selected":""}>${r.name}</option>`).join("");
  renderReminderSettings();
  applyTheme();
}
async function saveSettingsFromUI(){
  settings.method = +$("#set-method").value;
  settings.school = +$("#set-school").value; settings.schoolExplicit = true;
  settings.azan = $("#set-azan").checked;
  settings.notif = $("#set-notif").checked;
  settings.adhan = $("#set-adhan").value;
  settings.reciter = $("#set-reciter").value;
  settings.theme = $("#set-dark").checked ? "dark" : "light";
  settings.duroodOnUnlock = $("#set-durood").checked;
  // Fix #29: the Auto Location toggle is gone from Settings (its one
  // place is the home 📍 pill → location setup modal) — settings.autoLoc
  // keeps its saved value and is no longer read from a form field here.
  syncDuroodToggleNative();
  applyTheme();
  saveSettings(); toast(t("saved"));
  /* Saving unrelated settings must not let auto-GPS replace a location
     the user set manually — only refresh the times for it. */
  if (settings.autoLoc && !settings.locManual) detectLocation(true);
  else initPrayers();
}
async function initPrayers(){
  const ok = await fetchTimings();
  renderDates(); renderPrayers(); renderHomeLocation(); renderTracker(); renderFasting(); renderQuranProgress(); updateNotifBadge();
  if (ok) fetchHijriMonth();
  // Fix #4: syncPrayerAlarms() IS the scheduler (plugin when present,
  // LN fallback otherwise). Calling scheduleNativeAzan() too would
  // double-schedule every azan (ids 1–5 via LN AND the native plugin).
  syncPrayerAlarms(); // exact alarms (native plugin) or LN fallback — Android only
  scheduleNativeDaily(); // daily hadith & verse, 7 AM — Android only
  scheduleNativeDhikr(); // durood / astaghfirullah interval reminders — Android only
}

/* ---------------- privacy ---------------- */
const PRIVACY_BN = `My Deen কোনো অ্যাকাউন্ট চায় না, কোনো ব্যক্তিগত তথ্য সংগ্রহ করে না এবং কোনো বিজ্ঞাপন দেখায় না। প্রোফাইলে নাম বা Gmail ঠিকানা দিলে তা শুধু আপনার ফোনেই থাকে, কোনো সার্ভারে যায় না।
আপনার নামাজের হিসাব, কুরআন ট্র্যাকার, তাসবিহ, বুকমার্ক ও সেটিংস শুধু আপনার ফোনের ভেতরে (localStorage) থাকে — কোনো সার্ভারে পাঠানো হয় না।
কুরআনের সম্পূর্ণ লেখা (আরবি ও বাংলা অনুবাদ, সূত্র: AlQuran Cloud) অ্যাপের ভেতরেই সংরক্ষিত — পড়তে কোনো সার্ভারে কিছু পাঠাতে হয় না। অ্যাপটি নামাজের সময়ের জন্য Aladhan API (api.aladhan.com) ব্যবহার করে; সেটি না পেলে সময় ফোনেই হিসাব করা হয়। তিলাওয়াতের অডিও cdn.islamic.network থেকে আসে। এই সেবাগুলোতে আপনার কোনো ব্যক্তিগত তথ্য পাঠানো হয় না; শুধু শহরের নাম/অবস্থান পাঠানো হয় সময় বের করার জন্য।
অবস্থান (GPS) শুধু আপনি অনুমতি দিলে ব্যবহার হয় — নামাজের সময় ও কিবলার দিক বের করার জন্য। শহরের নাম জানতে OpenStreetMap Nominatim ব্যবহার হয়; আপনার অবস্থান কোথাও সংরক্ষণ বা পাঠানো হয় না।
কোনো প্রশ্ন থাকলে অ্যাপের ভেতর থেকে যোগাযোগ করুন।`;
const PRIVACY_EN = `My Deen needs no account, collects no personal data, and shows no ads. A profile name or Gmail address, if you enter one, stays only on your phone and is never sent to any server.
Your prayer log, Quran tracker, tasbih counts, bookmarks and settings stay only on your phone (localStorage) — they are never sent to any server.
The complete Quran text (Arabic and Bengali translation, source: AlQuran Cloud) is stored inside the app — reading it sends nothing to any server. The app calls the free Aladhan API (api.aladhan.com) for prayer times; if it cannot be reached, times are calculated on the device. Recitation audio streams from cdn.islamic.network. No personal information is sent to these services; only the city name / location is sent to compute prayer times.
GPS location is used only when you grant permission, to compute prayer times and the Qibla direction. The city name is resolved with OpenStreetMap Nominatim; your location is not stored or sent anywhere.`;

/* ---------------- init ---------------- */
function bindEvents(){
  $$("#bottom-nav button").forEach(b=>b.onclick=()=>showView(b.dataset.view));
  $("#btn-notif").onclick=()=>showView("notif");
  const bgq = $("#btn-go-quran"); if (bgq) bgq.onclick=()=>showView("quran");
  $("#btn-go-learn").onclick=()=>showView("learn");
  $("#btn-back-learn").onclick=()=>showView("home");
  $("#btn-mark-read").onclick=()=>toggleSurahRead(currentSurah);
  /* Fix #34: the profile is name-only — saving needs just the name, no
     Gmail login. The "নাম বদলান" button re-opens the form in edit mode
     (the name box is prefilled by renderLoginState). */
  $("#btn-save-profile").onclick=()=>{ settings.profileName = $("#set-profile-name").value.trim(); saveSettings(); editingProfile = false; renderGreet(); renderLoginState(); toast(t("saved")); };
  const be = $("#btn-edit-profile"); if (be) be.onclick=()=>{ editingProfile = true; renderLoginState(); const pn = $("#set-profile-name"); if (pn) pn.focus(); };
  $("#btn-clear-profile").onclick=()=>{ settings.profileName = ""; settings.gmail = ""; $("#set-profile-name").value = ""; saveSettings(); editingProfile = false; renderGreet(); renderLoginState(); toast(Lb("মুছে ফেলা হয়েছে", "Removed")); };
  const bhdl = $("#btn-home-detect-loc"); if (bhdl) bhdl.onclick=()=>detectLocation(false);
  $("#set-durood").onchange=e=>{ settings.duroodOnUnlock = e.target.checked; saveSettings(); syncDuroodToggleNative(); };
  const sdEl = $("#set-daily");
  if (sdEl) sdEl.onchange=e=>{ settings.dailyNotif = e.target.checked; saveSettings(); scheduleNativeDaily(); maybeFireDailyWebNotif(); };
  const slEl = $("#set-lang");
  if (slEl) slEl.onchange=e=>{ settings.lang = e.target.value; saveSettings(); applyLang(); };
  $("#set-dark").onchange=e=>{ settings.theme = e.target.checked?"dark":"light"; saveSettings(); applyTheme(); };
  $("#btn-save-settings").onclick=saveSettingsFromUI;
  $("#btn-go-fasting").onclick=()=>showView("fasting");
  // Fix #4: home buttons, reference toggles, alarm + calendar + detail pages
  // (Build #19, Fix #2: the share buttons are gone — header, home row
  // and calendar day cells — so the share wiring and shareText are gone
  // too. Build #19, Fix #1: the home bell went with the home-top row;
  // the header bell (#btn-notif) is the one bell now.)
  const pillLoc = $("#pill-loc"); if (pillLoc) pillLoc.onclick=()=>openLocSetup(false);
  const goAlarm = $("#btn-go-alarm"); if (goAlarm) goAlarm.onclick=()=>showView("alarm");
  const goCal = $("#btn-go-calendar"); if (goCal) goCal.onclick=()=>showView("calendar");
  /* Home: Alarm | Calendar row + Top Features (Fix #6/7). */
  const goHomeAlarm = $("#btn-home-alarm"); if (goHomeAlarm) goHomeAlarm.onclick=()=>showView("alarm");
  const goHomeCal = $("#btn-home-calendar"); if (goHomeCal) goHomeCal.onclick=()=>showView("calendar");
  const fTr = $("#feat-tracker"); if (fTr) fTr.onclick=()=>{ const t = $("#prayer-list"); if (t) t.scrollIntoView({behavior:"smooth", block:"start"}); };
  const fQu = $("#feat-quran"); if (fQu) fQu.onclick=()=>showView("quran");
  const fQi = $("#feat-qibla"); if (fQi) fQi.onclick=()=>showView("qibla");
  const fRu = $("#feat-ruqyah"); if (fRu) fRu.onclick=()=>showView("ruqyah");
  /* Fix #36: the Tilawat + Tafsir grid tiles are gone — they live INSIDE
     the Quran view now (#btn-quran-tilawat / #btn-quran-tafsir). Tilawat
     opens the reader for the current surah (same as the old tile). There
     is NO separate tafsir text in the app — the old tile just opened the
     Quran list — so the Tafsir button takes the user to the surah list. */
  const qTi = $("#btn-quran-tilawat"); if (qTi) qTi.onclick=()=>openSurah(currentSurah || 1);
  const qTa = $("#btn-quran-tafsir"); if (qTa) qTa.onclick=()=>{ const l = $("#surah-list"); if (l) l.scrollIntoView({behavior:"smooth", block:"start"}); };
  const fNa = $("#feat-names"); if (fNa) fNa.onclick=()=>showView("tasbih");
  const fTs = $("#feat-tasbih"); if (fTs) fTs.onclick=()=>showView("tasbih");
  const fDu = $("#feat-duas"); if (fDu) fDu.onclick=()=>showView("duas"); // Fix #30: Duas opens from the Home grid
  const fFa = $("#feat-fasting"); if (fFa) fFa.onclick=()=>showView("fasting"); // Fix #30: Fasting tile on Home
  const fMore = $("#btn-more-features"); if (fMore) fMore.onclick=()=>{ const t = $("#forbid-section"); if (t) t.scrollIntoView({behavior:"smooth", block:"start"}); };
  const backAlarm = $("#btn-back-alarm"); if (backAlarm) backAlarm.onclick=()=>showView("home");
  const backCal = $("#btn-back-calendar"); if (backCal) backCal.onclick=()=>showView("home");
  const backFast = $("#btn-back-fasting"); if (backFast) backFast.onclick=()=>showView("home");
  const backDetail = $("#btn-back-detail"); if (backDetail) backDetail.onclick=()=>showView("alarm");
  const saveDetail = $("#btn-detail-save"); if (saveDetail) saveDetail.onclick=()=>saveDetailPage();
  const dSlider = $("#detail-slider");
  if (dSlider) dSlider.oninput=()=>{ if (detailDraft){ detailDraft.offset = +dSlider.value; updateDetailTime(); } };
  const dToggle = $("#detail-toggle");
  if (dToggle) dToggle.onchange=()=>{ if (detailDraft) detailDraft.on = dToggle.checked; };
  const aMaster = $("#alarm-master");
  if (aMaster) aMaster.onchange=()=>{ settings.azan = aMaster.checked; saveSettings(); syncPrayerAlarms(); renderAlarmPage();
    toast(settings.azan ? Lb("সকল নামাজের অ্যালার্ম চালু ✓", "All prayer alarms on ✓") : Lb("সকল নামাজের অ্যালার্ম বন্ধ", "All prayer alarms off")); };
  const forbRef = $("#btn-forbidden-ref");
  if (forbRef) forbRef.onclick=()=>{ const r = $("#forbidden-ref"); if (r) r.classList.toggle("hidden"); };
  const naflRef = $("#btn-nafl-ref");
  if (naflRef) naflRef.onclick=()=>{ const r = $("#nafl-ref"); if (r) r.classList.toggle("hidden"); };
  const permBtn = $("#btn-permissions");
  if (permBtn) permBtn.onclick=()=>runPermChain(true); // Fix #32 + Build #19: directly asks the system for whatever is still missing (no modal); force=true re-asks missing steps even if the first-launch chain already asked them once
  // Fasting hadith swipe (left/right) on the hadith card.
  const fh = $("#fast-hadith");
  if (fh){
    let sx = null;
    fh.addEventListener("touchstart", e=>{ sx = e.changedTouches[0].clientX; }, {passive:true});
    fh.addEventListener("touchend", e=>{
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40){
        fastHadithIdx = (fastHadithIdx + (dx < 0 ? 1 : FASTING_HADITHS.length - 1)) % FASTING_HADITHS.length;
        renderFastHadith();
      }
    }, {passive:true});
  }
  $("#btn-back-quran").onclick=()=>showView("quran");
  $("#btn-back-duas").onclick=()=>showView("duas");
  $("#btn-back-settings").onclick=()=>showView("settings");
  $("#btn-ruqyah").onclick=()=>{ showView("ruqyah"); renderRuqyah(); };
  $("#btn-privacy").onclick=()=>{ $("#privacy-body").innerHTML = `<p style="white-space:pre-line;line-height:1.8">${Lb(PRIVACY_BN, PRIVACY_EN)}</p>`; showView("privacy"); };
  const bla = $("#btn-loc-allow"); if (bla) bla.onclick=()=>detectLocation(false);
  const blc = $("#btn-loc-close"); if (blc) blc.onclick=closeLocSetup;
  const pl = $("#prayer-list");
  if (pl) pl.addEventListener("click", e=>{ if (e.target.closest("[data-open-locsetup]")) openLocSetup(); });
  $("#surah-search").oninput=e=>renderSurahList(e.target.value, currentQTab);
  $$("[data-qtab]").forEach(b=>b.onclick=()=>{ currentQTab=b.dataset.qtab;
    $$("[data-qtab]").forEach(x=>x.classList.toggle("on", x===b)); renderSurahList($("#surah-search").value, currentQTab); });
  $("#reciter").onchange=e=>{ settings.reciter=e.target.value; saveSettings(); };
  $("#btn-autoplay").onclick=e=>{
    const on = e.currentTarget.dataset.on==="1";
    e.currentTarget.dataset.on = on?"0":"1";
    e.currentTarget.textContent = on ? t("listenAll") : t("stopListen");
    if (!on && currentAyahs.length) playAyah(1); else stopAyahAudio();
  };
  $("#btn-jump").onclick=()=>{
    const n = +$("#jump-ayah").value;
    const el = $("#ayah-"+n); if (el) el.scrollIntoView({behavior:"smooth", block:"center"});
    else toast(t("ayahNotFound"));
  };
  $("#btn-next-surah").onclick=()=>{ if (currentSurah<114) openSurah(currentSurah+1); };
  $("#tasbih-tap").onclick=tapTasbih;
  $("#tasbih-tap").onkeydown=e=>{ if(e.key===" "||e.key==="Enter"){ e.preventDefault(); tapTasbih(); } };
  $("#btn-tasbih-reset").onclick=()=>{ tasbih.count=0; renderTasbih(); };
  $("#btn-tasbih-target").onclick=()=>{
    const i = TASBIH_TARGETS.indexOf(settings.tasbihTarget);
    settings.tasbihTarget = TASBIH_TARGETS[(i+1)%TASBIH_TARGETS.length];
    saveSettings(); renderTasbih();
    toast(`${t("targetLabel")} ${num(settings.tasbihTarget)}`);
  };
  $("#btn-gps").onclick=()=>detectLocation(false);
  if ("Notification" in window && $("#set-notif")){
    $("#set-notif").onchange=e=>{ if(e.target.checked && Notification.permission!=="granted") Notification.requestPermission(); };
  }
}
document.addEventListener("DOMContentLoaded", async ()=>{
  /* Interactivity FIRST, and every startup step isolated: if any one
     render throws (a blocked API, a missing element, a restricted
     webview API), the rest of the app — above all the nav and buttons
     bound here — must still work. A single unguarded failure at
     startup previously left the whole page unresponsive. */
  const step = fn => { try { const r = fn(); if (r && r.catch) r.catch(()=>{}); } catch(e){} };
  step(()=>bindEvents());
  step(()=>fillSettings());
  step(()=>applyLang());
  // First run on this device (no saved settings): offer the language
  // chooser once. English is the pre-selected default; picking a language
  // saves it, and a saved choice is never overridden afterwards.
  if (!HAD_SAVED_SETTINGS){
    const lf = $("#lang-first"), list = $("#lang-first-list");
    if (lf && list){
      list.innerHTML = LANGS.map(l=>`<button class="chip ${settings.lang===l.id?"on":""}" data-lang="${l.id}">${l.native} (${l.name})</button>`).join("");
      $$("#lang-first-list [data-lang]").forEach(b=>b.onclick=()=>{
        settings.lang = b.dataset.lang; saveSettings(); lf.style.display = "none"; applyLang();
      });
      lf.style.display = "flex";
    }
  }
  step(()=>renderTasbih()); step(()=>renderDuaCats()); step(()=>renderDuas()); step(()=>renderQibla());
  step(()=>renderNotifFeed()); step(()=>updateNotifBadge()); step(()=>renderGreet());
  /* No location set → the location setup screen comes first: the user
     picks "Allow location" (GPS) or "Set manually" (type a city).
     There is no pre-set city to fall back to, ever. */
  if (!hasLocation()) step(()=>openLocSetup());
  step(()=>maybeFireDailyWebNotif());
  step(()=>syncDuroodToggleNative()); // Fix #35: no durood on open — the unlock durood is native-only (USER_PRESENT)
  /* Fix #37: start loading the two preview sounds at startup (the HTML
     preload="auto" above asks for it; .load() makes sure the fetch
     actually starts now) so the first ▶ tap in Settings plays at once. */
  step(()=>{ ["audio-azan","audio-reminder"].forEach(id=>{ const el = document.getElementById(id); if (el) el.load(); }); });
  step(()=>maybeAskPermissions()); // Fix #4 §5: first-launch permission flow
  // Prayer times load FIRST: a slow or failed Quran-list download must
  // never block them (previously one stalled fetch froze both).
  step(()=>initPrayers());
  step(()=>renderSurahList()); step(()=>renderQuranProgress());
  loadSurahMeta().then(()=>{ renderSurahList(); renderQuranProgress(); }).catch(()=>{});
  // Auto-detect location when the user has it enabled and there is no
  // fresh GPS fix (a fix stays fresh for 12 hours). A failed attempt no
  // longer disables the setting or blocks future attempts — the old
  // "try once, ever" gate meant one blocked attempt (e.g. inside an
  // embedded browser with no geolocation) stopped it working forever.
  const lastLocOk = store.get("loc_last_ok", 0);
  if (settings.autoLoc && !settings.locManual && hasLocation() && (!settings.useCoords || Date.now() - lastLocOk > 12*3600*1000)){
    detectLocation(true);
  }
  setInterval(()=>{ renderPrayers(); checkAzan(); checkPreAzanVoice(); }, 1000);
  /* Countdown resync (Fix #2): timers freeze while the tab / app is
     hidden — re-render the moment it comes back, and pick up a
     location saved in another tab. */
  const resyncCountdown = ()=>{ renderPrayers(); if (timingsDate !== ddmmyyyy()) initPrayers(); };
  document.addEventListener("visibilitychange", ()=>{ if (!document.hidden){ resyncCountdown(); syncPrayerAlarms(); refreshAlarmStatus(); resumePermChain(); } }); // Fix #19: re-sync alarms on foreground — granting the exact-alarm permission in Settings and returning now arms the alarms (before this, a grant after the first sync left every alarm unarmed until a full restart, with no warning). Fix #32: also resume the permission chain when returning from a Settings page.
  window.addEventListener("focus", resyncCountdown);
  window.addEventListener("storage", resyncCountdown);
  setInterval(checkDhikrReminders, 20000);
  setInterval(()=>{ if (timingsDate !== ddmmyyyy()) initPrayers(); }, 60000);
  if ("serviceWorker" in navigator){
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
});

