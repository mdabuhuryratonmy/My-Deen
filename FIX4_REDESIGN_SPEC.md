# My Deen — Fix #4 + হোম রিডিজাইন: সম্পূর্ণ স্পেসিফিকেশন (একসাথে)

ইউজার (আবু হুরাইরা ভাই) ২০২৬-১১-১৮ তারিখে যা যা বলেছেন — সব এক জায়গায়।
কোনো বিজ্ঞাপন থাকবে না (My Deen সম্পূর্ণ বিজ্ঞাপন-মুক্ত)।

## ১. হোম স্ক্রিন (নতুন ডিজাইন)
- উপরে: তারিখের লাইন (ক্যালেন্ডার আইকন + হিজরি/ইংরেজি তারিখ বাংলায়), ডানে শেয়ার বোতাম (সবুজ গোল) + নোটিফিকেশন ঘণ্টা (ব্যাজ সহ)
- বড় গোল কাউন্টডাউন রিং (চাঁদের আইকন সহ): পরের আসন্ন ইভেন্টের নাম — পরের নামাজ / তাহাজ্জুদ / নিষিদ্ধ (মাকরুহ) সময় — + "শেষ হতে বাকি" + ঘণ্টা:মিনিট:সেকেন্ড কাউন্টডাউন। রিং সবসময় ইশা দেখাবে না, পরের ইভেন্টটাই দেখাবে।
- ব্যাকগ্রাউন্ড সময় অনুযায়ী বদলাবে: ভোর / দিন / সন্ধ্যা / রাত
- লোকেশন পিল (📍 জায়গার নাম) + সূর্যোদয়/সূর্যাস্ত পিল
- নামাজের তালিকা: আইকন, নাম, সময়ের রেঞ্জ (শুরু–শেষ), ডানে ফাঁকা গোল বৃত্ত (নামাজ পড়া চিহ্ন দিতে), বর্তমান নামাজের লাইন হাইলাইট, কিছু লাইনে কমলা ডট
- নিচে — **সালাতের নিষিদ্ধ সময়** সেকশন: "রেফারেন্স দেখুন" লিংক + নোট "এই সময়গুলোতে সালাত আদায় নিষিদ্ধ (ব্যতিক্রম: সূর্যাস্তকালীন একই দিনের আসর সালাত)" + ৩ কার্ড (সকাল / দুপুর / সন্ধ্যা, সময়ের রেঞ্জ সহ)
- **নফল সালাতের সময়** সেকশন: "রেফারেন্স দেখুন" লিংক — দুহা (রেঞ্জ), জাওয়াল শুরু (সময়), আওয়াবিন (মাগরিবের পর – সময়), তাহাজ্জুদ (ইশার পর – সময় + "রাতের শেষ ১/৩ শুরু: সময়")
- নিচের লাইন: **পরবর্তী সাহরি | পরবর্তী ইফতার | সাহরি বাকি** (কাউন্টডাউন)
- **"বড় করে দেখুন >"** বোতাম → সাওমের সময়সূচি পেজ
- নিচের বোতাম: **অ্যালার্ম | ক্যালেন্ডার**

## ২. লগইন
- লগইন করলে লগইন বোতাম উধাও হয়ে যাবে। "লগইন করা আছে" বা আর কিছুই দেখাবে না — শুধু ইউজারের দেওয়া নাম দেখাবে, সালামের লাইনে ("আসসালামু আলাইকুম, [নাম] 🤍"), যেমন এখন দেখায়।
- প্রোফাইল মুছে ফেললে লগইন বোতাম আবার ফিরে আসবে।
- প্রোফাইল ছবির ফিচার থাকবে না (ইউজার চাননি)।

## ৩. আনলক দরুদ
- ফোন আনলক করলেই সাথে সাথে দরুদ বাজবে — **একবারই**: "আল্লাহুম্মা সাল্লি ওয়া সাল্লিম আলা নাবিয়্যিনা মুহাম্মদ"।
- পরীক্ষা করার বোতাম থাকবে না — ঠিকমতো কাজ করবে।
- টেকনিক্যাল: DuroodUnlockReceiver goAsync() + PendingResult দিয়ে লেখা হবে যাতে অ্যান্ড্রয়েড মাঝপথে অডিও কেটে না দেয়। ফোনে MIUI Autostart ON + Battery saver → No restrictions লাগবে।
- অডিও ফাইল যাচাই করা: durood.mp3 = ৩.৭২ সেকেন্ড, একবারের পাঠ — একবার বাজালেই ঠিক।

## ৪. লোগো (পুরোনো লোগো ফেরত)
- পুরোনো আরবি লোগো ("ماي دين" সোনালি ক্যালিগ্রাফি, সবুজ পটভূমি + চাঁদ) ফিরবে — অ্যাপ আইকন + অ্যাপের ভিতরের হেডার লোগো।
- কারণ: লোগো PNG গুলো GitHub-এ কখনো যায়নি (push-files বাইনারি নেয় না), আর লঞ্চার আইকন এখনো ডিফল্ট Capacitor নীল "C" আইকন।
- সমাধান: লোগো base64 টেক্সট ফাইল হিসেবে রিপোতে রাখা + workflow-এ PIL স্ক্রিপ্ট (scripts/make_icons.py) দিয়ে সব আইকন বানানো (icon-192/512/maskable + সব mipmap ডেনসিটি)।

## ৫. পারমিশন (১০০% একুরেট)
- এখনকার অ্যাপ কোনো পারমিশনই চায় না — নতুন অ্যাপ ফোন থেকে সব পারমিশন নেবে: লোকেশন, নোটিফিকেশন, সঠিক সময়ে অ্যালার্ম (exact alarm), ফোন রিস্টার্টের পর আবার অ্যালার্ম বসানো।
- Manifest-এ যোগ হবে: POST_NOTIFICATIONS + SCHEDULE_EXACT_ALARM + RECEIVE_BOOT_COMPLETED (+ BootReceiver)। লোকেশন পারমিশন (Fix #3-এ যোগ করা) থাকবে।

## ৬. দরুদ ও ইস্তিগফার অডিও
- দরুদ/ইস্তিগফার রিমাইন্ডার নোটিফিকেশন এলে সাথে অডিওও বাজবে (নতুন চ্যানেল, দরুদ → durood.mp3, ইস্তিগফার → istighfar.mp3)।
- দোয়ার সেকশনে দরুদ ও ইস্তিগফারের দোয়ায় ▶ প্লে বোতাম থাকবে (শুনতে পারবেন)।
- istighfar.mp3 নেই — আরবি তিলাওয়াত TTS দিয়ে বানিয়ে base64 টেক্সট + workflow ডিকোড করে যোগ করা হবে।

## ৭. প্রি-আজান নোটিফিকেশন (প্রতিটা ওয়াক্তের ২ মিনিট আগে)
- প্রতিটা ফরজ ওয়াক্তের আজানের ২ মিনিট আগে একটা নোটিফিকেশন আসবে (ওয়াক্তের নাম সহ), তার ১–২ মিনিট পর আজান বাজবে।
- **সঠিক লেখা (এক অক্ষরও বদলাবে না):**
  - ফজর: "ফজরের নামাজের সময় হয়েছে, ঘুম থেকে উঠে মিসওয়াক করে নামাজের প্রস্তুতি নিন"
  - যোহর: "যোহরের নামাজের সময় হয়েছে, মিসওয়াক করে নামাজের প্রস্তুতি নিন"
  - আসর: "আসরের নামাজের সময় হয়েছে, মিসওয়াক করে নামাজের প্রস্তুতি নিন"
  - মাগরিব: "মাগরিবের নামাজের সময় হয়েছে, মিসওয়াক করে নামাজের প্রস্তুতি নিন"
  - ইশা: "ইশার নামাজের সময় হয়েছে, মিসওয়াক করে নামাজের প্রস্তুতি নিন"
- **তাহাজ্জুদ: কোনো আজান নেই — শুধু একটা নোটিফিকেশন, আর কিছু না** (শুধু যদি তাহাজ্জুদের অ্যালার্ম সেট করা থাকে): "তাহাজ্জুদের সময় হয়েছে, উঠে নামাজের প্রস্তুতি নিন"

## ৮. অ্যালার্ম স্ক্রিন ("অ্যালার্ম সেট করুন")
- মাস্টার টগল কার্ড: "সকল নামাজের অ্যালার্ম / অ্যালার্ম চালু"
- ফরজ নামাজসমূহ: ফজর, যুহর, আসর, মাগরিব, ইশা — প্রতিটা "ঠিক সময়ে" + ঘণ্টা
- নফল নামাজসমূহ: দুহা, তাহাজ্জুদ — প্রতিটা আলাদাভাবে সেট করা যায়
- নিষিদ্ধ সময়: সকাল, দুপুর, সন্ধ্যা — প্রতিটা "ঠিক সময়ে" + ঘণ্টা
- প্রতিটা লাইনের অ্যালার্ম আলাদাভাবে চালু/বন্ধ করা যায়।

## ৯. প্রতিটা ওয়াক্তের অ্যালার্ম ডিটেইল পেজ (লাইনে ট্যাপ করলে)
- হেডার = ওয়াক্তের নাম; টগল কার্ড "নামাজের অ্যালার্ম / অ্যালার্ম চালু"
- Time Adjustment স্লাইডার: -৩০ থেকে +৩০ মিনিট, মাঝখান = "Exact time", **ধাপ ১ মিনিট করে (৫ বা ১০ মিনিট নয়)** — সেট করা সময় দেখাবে (যেমন ০৫:৪২)
- Alarm Sound তালিকা — নিঃশব্দ, বিপ, রিং, ওয়াক্তের নাম (ডিফল্ট সিলেক্টেড), নোটিফিকেশন, **আজান** — প্রতিটার পাশে ▶ প্রিভিউ বোতাম (শুনে বেছে নেওয়া যাবে)
- নিচে "সংরক্ষণ করুন" (Save) বোতাম
- প্রতিটা ওয়াক্তের (ফরজ + নফল + নিষিদ্ধ) আলাদা ডিটেইল পেজ থাকবে।
- নামাজের সময় নিজেও একই স্লাইডার দিয়ে বদলানো যাবে (১ মিনিট ধাপে, -৩০ থেকে +৩০)।

## ১০. ক্যালেন্ডার পেজ
- লম্বা সরু টেবিল নয় — পরিষ্কার **দিনের কার্ড**, একটার পর একটা, স্ক্রল করা যাবে।
- উপরে: মাসের ড্রপডাউন (নভেম্বর) + বছরের ড্রপডাউন (২০২৬)
- প্রতিটা কার্ড: সবুজ হেডার (ইংরেজি তারিখ + বার + হিজরি তারিখ, যেমন "২৯ নভেম্বর, ২০২৬ - রবিবার / ১৮ জুমাদাল আখিরাহ, ১৪৪৮") + শেয়ার আইকন
- নামাজের লাইন (ফজর, যুহর, আসর, মাগরিব, ইশা — সময় সহ); দ্বিতীয় লাইন (সূর্যোদয়, সূর্যাস্ত, সাহরি, ইফতার); "সালাতের নিষিদ্ধ সময়" (সকাল/দুপুর/সন্ধ্যা, রেঞ্জ সহ)

## ১১. সাওমের সময়সূচি পেজ ("বড় করে দেখুন >" থেকে)
- বড় কাউন্টডাউন রিং — **রাতে সাহরি পর্যন্ত, দিনে ইফতার পর্যন্ত** গুনবে
- নিচে রোজা সম্পর্কে হাদিসের কার্ড — ডানে/বামে সোয়াইপ করে হাদিস বদলানো যাবে (ডট দেখাবে)
- সাওমের সময়সূচি তালিকা: পরবর্তী সাহরি (সময় + ঘণ্টা আইকন) ও পরবর্তী ইফতার (সময় + ঘণ্টা আইকন) — **ঘণ্টায় ট্যাপ করলে সেই সাহরি/ইফতারের অ্যালার্ম সেট হবে** (সবুজ ঘণ্টা = চালু, ধূসর = বন্ধ)

## Fix #5 (2026-11-19, user-reported after installing the run #15 build)
1. Profile form: after saving name/Gmail the WHOLE form disappears; only a small saved line (✓ name) + delete button remain; deleting the profile brings the form back. (Fix #3 only hid the login button — the form stayed visible.)
2. Manual location REMOVED everywhere: the city/country inputs in Settings, and the manual form in the home location-setup modal. Location is GPS-only now; all texts mentioning manual entry updated.
3. Unlock durood: NO code change — verified the receiver is registered for USER_PRESENT in the run #15 APK manifest (aapt), the JS default is ON and synced to native. If it still does not play, the cause is the phone side: the app must be the installed APK (not the PWA) and Xiaomi Autostart + Battery "No restrictions" must be ON for My Deen.
4. Durood reminder (Fix #5, part 2): the fixed 10/20/30-minute chips are replaced by the SAME −30..+30 minute slider (1-minute steps) as the prayer-time adjuster — middle (0) is the exact standard 30-minute interval; effective interval = 30 + offset, clamped to 1..60 min. Astaghfirullah keeps the 10/20/30 chips.
5. Home matches the reference design (Fix #6): Alarm | Calendar buttons under the prayer list (open the alarm/calendar views); Top Features section — Tracker (today's prayer % in a ring, tap scrolls to the tracker card), Quran, Qibla, Ruqyah (tap opens that view), "আরও দেখুন" scrolls to the Quran tracker card. Home manual-location button removed (GPS-only). The countdown ring hero was ALREADY in the build (verified in the APK) — it sits at the top of home; the header is sticky, so scrolling down hides it. NO ads, ever — the reference's ad banner is never copied.
6. Home rebuilt EXACTLY like the reference (Fix #7): date row (weekday + Hijri, Gregorian) + share + bell; full-bleed countdown ring (dark arc + dark text on light skies, sun/moon by sky); location pill (tap = GPS setup) + sunrise/sunset pill; prayer rows with 24h ranges + orange dot + done-circle (tap = mark prayed, tap row = alarm settings); Alarm | Calendar row; Top Features 2 rows x 4 (Tracker %, Quran, Qibla, Ruqyah, Tilawat, Tafsir, 99 Names, Tasbih); forbidden section (red title, ref link, note, 3 cards); nafl rows (Duha, Zawal, Awwabin, Tahajjud + last-third sub-line); Sehri/Iftar strip + "বড় করে দেখুন" (opens fasting view). Header hidden on home only. Old green list design removed (location card, tracker cards, bottom alarm row gone). NO ads, ever. Bottom nav unchanged.
7. Prayer notifications rebuilt (Fix #8): pre-azan text is the user's exact wording (with "মিসওয়াক ও অজু করে"), the SAME text twice per fard prayer — 5 min before (ids 51-55) and 2 min before (ids 31-35), no sound; azan at prayer time as before; Tahajjud a single silent notification only when its alarm is set. The old post-prayer check / hurry flow is REMOVED entirely (no "তাড়াতাড়ি" wording anywhere); the new build cancels the old daily repeating check/hurry notifications once (ids 11-15, 21-25, 100-159, flag legacy_check_cancelled). Prayers are marked done from the home rows / tracker.
8. Alarm sound (Fix #9): the "notification" option is REMOVED from the Alarm Sound list (5 options left: silent, beep, ring, prayer name, azan); "name" (prayer name) is the permanent default for every item, and any older saved "notification" value migrates to "name" on load. Pre-azan reminders (5 + 2 min before) are ALWAYS on — no toggle, no option — even when a prayer's azan alarm is off; only the azan itself follows the per-prayer toggle.
9. Alarm sound multi-select (Fix #10 — REPLACES Fix #9's removal): the "notification" option STAYS in the list (6 options). Alarm Sound is multi-select: up to 2 sounds together. "name" (prayer name) is the permanent default and is always selected (cannot be turned off); the user may add one more (azan / notification / beep / ring). "silent" stands alone. Older saved single-string values migrate to [name, old-choice] (silent stays [silent]). One native sound per alarm: azan wins when selected, otherwise the notification sound, silent alone = none. Pre-azan reminders stay always on (Fix #9 §3, unchanged).
