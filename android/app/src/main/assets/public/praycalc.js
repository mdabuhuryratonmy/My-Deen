/* My Deen — local prayer-time calculation + Hijri date fallback.
   Works fully offline (no network needed). Based on the standard
   PrayTimes solar algorithm (Hamid Zarrabi-Zadeh) with the Aladhan
   method parameters, so results match the Aladhan API (method 17 JAKIM
   for Malaysia) to within about 1 minute.
   - Fajr/Isha are sun-depression angles; Maghrib is minutes after sunset;
     Imsak is minutes before Fajr; Dhuhr is solar noon + 1 minute
     (Aladhan convention).
   - Midnight / Firstthird / Lastthird follow the Aladhan convention:
     the "night" runs from sunset to the NEXT sunrise.
   - Hijri dates use the standard Kuwaiti (tabular) algorithm — they can
     differ by 1 day from the official Malaysian (JAKIM) date, so the
     API value is always preferred when the network is available. */
(function(root){
  "use strict";
  var D2R = Math.PI/180, R2D = 180/Math.PI;
  function fixAngle(a){ return a - 360*Math.floor(a/360); }
  function fixHour(a){ return a - 24*Math.floor(a/24); }
  function julianDate(y, m, d){
    if (m <= 2){ y -= 1; m += 12; }
    var A = Math.floor(y/100), B = 2 - A + Math.floor(A/4);
    return Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + d + B - 1524.5;
  }
  function sunPosition(jd){
    var D = jd - 2451545;
    var g = fixAngle(357.529 + 0.98560028*D);
    var q = fixAngle(280.459 + 0.98564736*D);
    var L = fixAngle(q + 1.915*Math.sin(g*D2R) + 0.020*Math.sin(2*g*D2R));
    var e = 23.439 - 0.00000036*D;
    var decl = Math.asin(Math.sin(e*D2R)*Math.sin(L*D2R))*R2D;
    var RA = fixHour(Math.atan2(Math.cos(e*D2R)*Math.sin(L*D2R), Math.cos(L*D2R))*R2D/15);
    var eqt = q/15 - RA;
    return {decl: decl, eqt: eqt};
  }
  function sunAngleTime(angle, noon, lat, decl, dir){
    var cosH = (Math.sin(angle*D2R) - Math.sin(decl*D2R)*Math.sin(lat*D2R)) /
               (Math.cos(decl*D2R)*Math.cos(lat*D2R));
    if (cosH > 1 || cosH < -1) return null; // sun never reaches this angle (high latitude)
    var H = Math.acos(cosH)*R2D/15; // hours
    return dir === "ccw" ? noon - H : noon + H;
  }
  /* Asr altitude is ABOVE the horizon (positive angle): the shadow
     length factor gives the sun's altitude via arccot. */
  function asrTime(factor, noon, lat, decl){
    var angle = Math.atan(1/(factor + Math.tan(Math.abs((lat - decl)*D2R))))*R2D;
    return sunAngleTime(angle, noon, lat, decl, "cw");
  }
  /* Method parameters (Aladhan): fajr/isha are angles in degrees,
     isha may also be "N min" (minutes after Maghrib, e.g. Umm al-Qura),
     maghrib is minutes after sunset, imsak is minutes before Fajr. */
  var METHODS = {
    0:{fajr:16, isha:14, maghrib:4, imsak:10},
    1:{fajr:18, isha:18, maghrib:0, imsak:10},
    2:{fajr:15, isha:15, maghrib:0, imsak:10},
    3:{fajr:18, isha:17, maghrib:0, imsak:10},
    4:{fajr:18.5, isha:"90 min", maghrib:0, imsak:10},
    5:{fajr:19.5, isha:17.5, maghrib:0, imsak:10},
    7:{fajr:17.7, isha:14, maghrib:4.5, imsak:10},
    8:{fajr:19.5, isha:"90 min", maghrib:0, imsak:10},
    9:{fajr:18, isha:17.5, maghrib:0, imsak:10},
    10:{fajr:18, isha:"90 min", maghrib:0, imsak:10},
    11:{fajr:20, isha:18, maghrib:0, imsak:10},
    12:{fajr:12, isha:12, maghrib:0, imsak:10},
    13:{fajr:18, isha:17, maghrib:0, imsak:10},
    14:{fajr:16, isha:15, maghrib:0, imsak:10},
    15:{fajr:18, isha:18, maghrib:0, imsak:10},
    16:{fajr:18.2, isha:18.2, maghrib:0, imsak:10},
    17:{fajr:20, isha:18, maghrib:0, imsak:10}, /* Malaysia (JAKIM) */
    18:{fajr:18, isha:18, maghrib:0, imsak:10},
    19:{fajr:18, isha:17, maghrib:0, imsak:10},
    20:{fajr:20, isha:18, maghrib:0, imsak:10},
    21:{fajr:19, isha:17, maghrib:0, imsak:10},
    22:{fajr:18, isha:18, maghrib:0, imsak:10}
  };
  var HIJRI_MONTHS_EN = ["Muharram","Safar","Rabiʿ al-Awwal","Rabiʿ al-Thani","Jumada al-Ula","Jumada al-Akhirah","Rajab","Shaʿban","Ramadan","Shawwal","Dhul-Qaʿdah","Dhul-Hijjah"];
  var HIJRI_MONTHS_AR = ["مُحرَّم","صفر","ربيع الأول","ربيع الآخر","جُمادى الأولى","جُمادى الآخرة","رجب","شعبان","رمضان","شوّال","ذو القعدة","ذو الحجة"];
  /* Kuwaiti (tabular) Islamic calendar conversion. Approximate: may be
     1 day off the official local date. */
  function gregorianToHijri(y, m, d){
    var jd = Math.floor((1461*(y+4800+Math.floor((m-14)/12)))/4)
      + Math.floor((367*(m-2-12*Math.floor((m-14)/12)))/12)
      - Math.floor((3*Math.floor((y+4900+Math.floor((m-14)/12))/100))/4) + d - 32075;
    var l = jd - 1948440 + 10632;
    var n = Math.floor((l-1)/10631);
    l = l - 10631*n + 354;
    var j = Math.floor((10985-l)/5316)*Math.floor((50*l)/17719) + Math.floor(l/5670)*Math.floor((43*l)/15238);
    l = l - Math.floor((30-j)/15)*Math.floor((17719*j)/50) - Math.floor(j/16)*Math.floor((15238*j)/43) + 29;
    var mh = Math.floor((24*l)/709);
    var dh = l - Math.floor((709*mh)/24);
    var yh = 30*n + j - 30;
    var pad = function(v){ return String(v).padStart(2, "0"); };
    return {
      date: pad(dh)+"-"+pad(mh)+"-"+yh, day: String(dh),
      month: {number: mh, en: HIJRI_MONTHS_EN[mh-1], ar: HIJRI_MONTHS_AR[mh-1]},
      year: String(yh), format: "DD-MM-YYYY",
      designation: {abbreviated: "AH", expanded: "Anno Hegirae"}
    };
  }
  function fmtHour(h){
    if (h == null) return null;
    var m = Math.round(h*60);
    var hh = Math.floor(m/60)%24, mm = m%60;
    return String(hh).padStart(2, "0")+":"+String(mm).padStart(2, "0");
  }
  /* date: local Date; lat/lon: decimal degrees; methodId: Aladhan method
     number (17 = JAKIM); school: 0 = Shafi'i, 1 = Hanafi (Asr shadow).
     Returns {timings: {Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha,
     Imsak, Midnight, Firstthird, Lastthird}, hijri: {...}}. */
  function calcPrayerTimes(date, lat, lon, methodId, school){
    var p = METHODS[methodId] || METHODS[17];
    var tz = -new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTimezoneOffset()/60;
    function dayTimes(d){
      var jd = julianDate(d.getFullYear(), d.getMonth()+1, d.getDate());
      var sp = sunPosition(jd);
      var noon = fixHour(12 - sp.eqt); // solar noon, UTC hours
      var sunrise = sunAngleTime(-0.833, noon, lat, sp.decl, "ccw");
      var sunset = sunAngleTime(-0.833, noon, lat, sp.decl, "cw");
      var fajr = sunAngleTime(-p.fajr, noon, lat, sp.decl, "ccw");
      var isha = (typeof p.isha === "string")
        ? (sunset == null ? null : sunset + parseFloat(p.isha)/60)
        : sunAngleTime(-p.isha, noon, lat, sp.decl, "cw");
      var dhuhr = noon + 1/60; // Aladhan convention: solar noon + 1 minute
      var asr = asrTime(school === 1 ? 2 : 1, noon, lat, sp.decl);
      var maghrib = sunset == null ? null : sunset + (p.maghrib || 0)/60;
      var imsak = fajr == null ? null : fajr - (p.imsak == null ? 10 : p.imsak)/60;
      var adj = function(t){ return t == null ? null : fixHour(t + tz - lon/15); };
      return {fajr: adj(fajr), sunrise: adj(sunrise), dhuhr: adj(dhuhr), asr: adj(asr),
        sunset: adj(sunset), maghrib: adj(maghrib), isha: adj(isha), imsak: adj(imsak)};
    }
    var t = dayTimes(date);
    var tomorrow = new Date(date); tomorrow.setDate(tomorrow.getDate()+1);
    var t2 = dayTimes(tomorrow);
    var night = (t.sunset == null || t2.sunrise == null) ? null : fixHour(t2.sunrise + 24 - t.sunset);
    var midnight = night == null ? null : fixHour(t.sunset + night/2);
    var firstthird = night == null ? null : fixHour(t.sunset + night/3);
    var lastthird = night == null ? null : fixHour(t.sunset + 2*night/3);
    return {
      timings: {
        Fajr: fmtHour(t.fajr), Sunrise: fmtHour(t.sunrise), Dhuhr: fmtHour(t.dhuhr),
        Asr: fmtHour(t.asr), Sunset: fmtHour(t.sunset), Maghrib: fmtHour(t.maghrib),
        Isha: fmtHour(t.isha), Imsak: fmtHour(t.imsak), Midnight: fmtHour(midnight),
        Firstthird: fmtHour(firstthird), Lastthird: fmtHour(lastthird)
      },
      hijri: gregorianToHijri(date.getFullYear(), date.getMonth()+1, date.getDate())
    };
  }
  root.PrayCalc = {
    calcPrayerTimes: calcPrayerTimes,
    gregorianToHijri: gregorianToHijri,
    METHODS: METHODS,
    HIJRI_MONTHS_EN: HIJRI_MONTHS_EN,
    HIJRI_MONTHS_AR: HIJRI_MONTHS_AR
  };
})(typeof window !== "undefined" ? window : globalThis);
