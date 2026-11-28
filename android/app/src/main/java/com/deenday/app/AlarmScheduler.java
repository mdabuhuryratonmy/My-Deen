package com.deenday.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Shared helpers for the exact prayer-time alarms (Fix #4 §5/§7).
 * The web layer (www/app.js) builds the alarm list and hands it to the
 * PrayerAlarm Capacitor plugin, which stores it here and arms each alarm
 * with AlarmManager.setExactAndAllowWhileIdle. AlarmReceiver posts the
 * notification when an alarm fires and re-schedules it for +24h;
 * BootReceiver re-arms the stored list after a reboot.
 */
public final class AlarmScheduler {
    private AlarmScheduler() {}

    public static final String PREFS = "mydeen";
    public static final String KEY_ALARMS = "prayer_alarms";

    /* Fix #58 (28 Nov 2026): notification-channel schema version.
       THE ONE PLACE that records which channel generation is current —
       bump CHANNEL_VERSION whenever a channel's sound or importance
       changes (the next audio change bumps this number, nothing else).
       Fix #59 (28 Nov 2026): bumped 5 → 6 — the six per-waqt pre-azan
       channels are new, and the dhikr channels' sounds changed to the
       Helio clips (durood 1.5 s, istighfar 0.8 s). The v5 migration
       already ran on his phone for Build 30, so v6 re-runs and
       recreates the new per-waqt channels plus the dhikr channels
       with the new sounds.

       Why a version gate instead of yet another fresh channel ID
       (the v2 → v3 → v4 pattern): Android never updates an existing
       channel's sound, and Android Auto Backup (manifest
       android:allowBackup="true") restores notification-channel
       settings across uninstall/reinstall — so a channel once created
       silent stays silent through every "clean" install, and the
       user confirmed (28 Nov) he DID fully clean-install Build 28
       (Clear storage + Clear data + uninstall) with the phone NOT on
       silent, yet the reminder tones still do not play. The resource
       IDs are proven stable across Builds 23/26/28/29 (azan
       0x7f0d0000, durood 0x7f0d0001, istighfar 0x7f0d0002, reminder
       0x7f0d0003), so the stored channel sound URIs still resolve to
       the right files — the channels themselves carry the stale
       (silent) state, restored by backup. Deleting the sounding
       channels once on a version change and letting the normal
       creation code recreate them heals exactly that state, on a
       dirty update AND on a clean install with a backup restore.

       Same IDs are kept on purpose (no v5 rename): the stored alarms
       in SharedPreferences carry the channel as their "type" string
       (preazan-v2, duha, dhikr-durood-v4, ...) — renaming the IDs
       would orphan every stored alarm until it was re-armed, while
       delete + recreate of the SAME id gives the same fresh channel
       state with zero reference changes. Only the six SOUNDING
       channels are deleted: the silent twins and the silent azan
       channel carry no sound, so nothing in them can go stale, and
       the azan path is untouched (the azan plays as media from
       AzanPlaybackService, never as a channel sound).

       The marker lives in the same "mydeen" SharedPreferences that
       Auto Backup restores: a backup from before this fix has no
       marker (stored 0 ≠ 5) so the migration runs; a backup taken
       after the migration already carries 5 and the (sounding)
       channels, so it is a no-op. A channel the user deliberately
       muted in system Settings is only reset on a version bump —
       the same tradeoff every previous v-bump made, and the app's
       own sound toggle (sound channel vs silent twin) stays the
       user's control. */
    public static final int CHANNEL_VERSION = 6;
    private static final String KEY_CHANNEL_VERSION = "channel_version";
    /** Every channel that carries a sound. Deleting + recreating these
        — and only these — is what heals a backup-restored silent
        channel. Keep in sync with the createChannel calls below and
        with DuroodUnlockReceiver.ensureChannels. Fix #59: the six
        per-waqt pre-azan channels join the list (their sounds are the
        new Helio clips); preazan-v2 stays for stale alarms. */
    private static final String[] SOUNDING_CHANNEL_IDS = {
        "preazan-v2", "preazan-fajr", "preazan-dhuhr", "preazan-asr",
        "preazan-maghrib", "preazan-isha", "preazan-jumuah",
        "duha", "dhikr-durood-v4", "dhikr-istighfar-v4",
        DuroodUnlockReceiver.CHANNEL_REMINDER, DuroodUnlockReceiver.CHANNEL_ISTIGHFAR
    };

    /** Delete the sounding channels once when the channel schema
        changes, so ensureChannels recreates them with the current
        sounds. No-op when the stored version is already current.
        Safe to call from every ensureChannels — whichever runs first
        migrates, the rest are no-ops. If the process died between the
        delete and the recreate, the next ensureChannels recreates the
        missing channels anyway (creation is unconditional when a
        channel is absent). */
    public static void migrateChannelsIfNeeded(Context ctx) {
        try {
            SharedPreferences prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            if (prefs.getInt(KEY_CHANNEL_VERSION, 0) == CHANNEL_VERSION) return;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    for (String id : SOUNDING_CHANNEL_IDS) nm.deleteNotificationChannel(id);
                }
            }
            prefs.edit().putInt(KEY_CHANNEL_VERSION, CHANNEL_VERSION).apply();
        } catch (Exception ignored) {}
    }

    /* Fix #49: Friday Jumu'ah sentences (verbatim from the JS tables —
       AZAN_SPEAK_TEXTS.Dhuhr == PREAZAN_TEXTS.Dhuhr). The stored
       speakText/body was baked for the day the alarm was built;
       re-arming moves it a day forward, so the day-aware Dhuhr
       sentences must be recomputed for the NEW day — otherwise
       Friday's Jumu'ah text would be spoken again on Saturday.
       Judged by the device day (his phone and his location share
       Asia/Kuala_Lumpur); the JS re-sync on app open is the backstop. */
    private static final String DHUHR_SPEAK_TEXT = "যোহরের নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন";
    private static final String JUMUAH_PREAZAN_TEXT = "জুম্মার নামাজ পড়ার প্রস্তুতি নিন";
    private static final String JUMUAH_AZAN_SPEAK_TEXT = "জুম্মার নামাজের সময় হয়েছে, মিসওয়াক ও অজু করে নামাজের প্রস্তুতি নিন";

    public static JSONArray readStored(Context ctx) {
        try {
            SharedPreferences prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String raw = prefs.getString(KEY_ALARMS, "[]");
            return new JSONArray(raw);
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    public static void writeStored(Context ctx, JSONArray arr) {
        try {
            ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                    .edit().putString(KEY_ALARMS, arr.toString()).apply();
        } catch (Exception ignored) {}
    }

    /** Arm one alarm. Returns false when exact alarms are not permitted
        (Android 12+ without the SCHEDULE_EXACT_ALARM grant) or the
        payload is invalid. */
    public static boolean schedule(Context ctx, JSONObject alarm) {
        try {
            long at = alarm.optLong("at", 0);
            if (at <= 0) return false;
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                return false;
            }
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pendingIntent(ctx, alarm));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static void cancel(Context ctx, int id) {
        try {
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            if (am == null) return;
            JSONObject probe = new JSONObject();
            probe.put("id", id);
            am.cancel(pendingIntent(ctx, probe));
        } catch (Exception ignored) {}
    }

    /** After an alarm fires, move it to the same time tomorrow and re-arm
        it, updating the stored list — daily alarms keep working without
        opening the app. */
    public static void rescheduleNextDay(Context ctx, JSONObject alarm) {
        try {
            long at = alarm.optLong("at", 0);
            if (at <= 0) return;
            // Fix #39: a fired alarm that is no longer in the stored list
            // is a zombie from an old build — cancel it and do NOT re-arm
            // it (before this it was written back into storage and
            // re-armed every day, so the wrong text never stopped).
            JSONArray stored = readStored(ctx);
            boolean inStored = false;
            for (int i = 0; i < stored.length(); i++) {
                if (stored.getJSONObject(i).optInt("id", -1) == alarm.optInt("id", -1)) { inStored = true; break; }
            }
            if (!inStored) {
                cancel(ctx, alarm.optInt("id", -1));
                return;
            }
            long now = System.currentTimeMillis();
            while (at <= now) at += 86400000L;
            alarm.put("at", at);
            // Fix #49: recompute the Dhuhr Friday sentences for the NEW
            // day — only swap when the stored text is one of the two
            // known Dhuhr sentences, so nothing else is ever touched.
            if ("Dhuhr".equals(alarm.optString("prayerId", ""))) {
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.setTimeInMillis(at);
                boolean friday = cal.get(java.util.Calendar.DAY_OF_WEEK) == java.util.Calendar.FRIDAY;
                String rtype = alarm.optString("type", "");
                if (rtype.startsWith("preazan")) {
                    String b = alarm.optString("body", "");
                    if (JUMUAH_PREAZAN_TEXT.equals(b) || DHUHR_SPEAK_TEXT.equals(b)) {
                        String t = friday ? JUMUAH_PREAZAN_TEXT : DHUHR_SPEAK_TEXT;
                        alarm.put("body", t);
                        alarm.put("speakText", t);
                    }
                    // Fix #59: the channel is part of the Dhuhr Friday
                    // state — a Friday pre-azan-jumuah alarm re-armed
                    // for Saturday must move to preazan-dhuhr (and vice
                    // versa), or Saturday would play the Jumu'ah clip
                    // with Saturday's text. A legacy preazan-v2 Dhuhr
                    // alarm migrates onto its per-waqt channel the same
                    // way. And the re-armed alarm must not speak via
                    // TTS any more (the channel clip is the
                    // announcement), even if the stored alarm predates
                    // Fix #59 with speak=true.
                    if ("preazan-dhuhr".equals(rtype) || "preazan-jumuah".equals(rtype) || "preazan-v2".equals(rtype)) {
                        alarm.put("type", friday ? "preazan-jumuah" : "preazan-dhuhr");
                    }
                    alarm.put("speak", false);
                } else if (rtype.startsWith("azan")) {
                    String st = alarm.optString("speakText", "");
                    if (JUMUAH_AZAN_SPEAK_TEXT.equals(st) || DHUHR_SPEAK_TEXT.equals(st)) {
                        alarm.put("speakText", friday ? JUMUAH_AZAN_SPEAK_TEXT : DHUHR_SPEAK_TEXT);
                    }
                }
            }
            JSONArray next = new JSONArray();
            boolean replaced = false;
            for (int i = 0; i < stored.length(); i++) {
                JSONObject a = stored.getJSONObject(i);
                if (a.optInt("id", -1) == alarm.optInt("id", -1)) {
                    next.put(alarm);
                    replaced = true;
                } else {
                    next.put(a);
                }
            }
            if (!replaced) next.put(alarm);
            writeStored(ctx, next);
            schedule(ctx, alarm);
        } catch (Exception ignored) {}
    }

    public static PendingIntent pendingIntent(Context ctx, JSONObject alarm) {
        Intent i = new Intent(ctx, AlarmReceiver.class);
        i.putExtra("id", alarm.optInt("id", 0));
        i.putExtra("type", alarm.optString("type", "azan-v2"));
        i.putExtra("title", alarm.optString("title", "My Deen"));
        i.putExtra("body", alarm.optString("body", ""));
        i.putExtra("sound", alarm.optString("sound", "none"));
        i.putExtra("prayerId", alarm.optString("prayerId", ""));
        // Build #19, Fix #5: spoken pre-azan reminders — the alarm
        // carries speak=true for the T-5/T-2 entries; AlarmReceiver
        // reads the body aloud with the phone's Bengali TTS voice.
        // Fix #40: azan entries also carry speakText (the spoken
        // announcement); pre-azan entries have no speakText and speak
        // the body. Silent entries never carry speak=true.
        i.putExtra("speak", alarm.optBoolean("speak", false));
        i.putExtra("speakText", alarm.optString("speakText", ""));
        i.putExtra("at", alarm.optLong("at", 0));
        return PendingIntent.getBroadcast(ctx, alarm.optInt("id", 0), i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Create every notification channel the alarms use (idempotent —
        an existing channel is left untouched so the user's own channel
        settings are respected). Channels carry the sound: Android 8+
        plays the CHANNEL sound, so the azan channel uses azan.mp3 and
        the duha channel uses reminder.mp3; the rest use the default
        notification sound. */
    public static void ensureChannels(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        // Fix #58: heal backup-restored silent channels once per
        // channel version, before the creation code below runs.
        migrateChannelsIfNeeded(ctx);
        try {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            // Fix #42: the azan-v2 channel sound is GONE — the live azan
            // plays as media from AzanPlaybackService, and its visual
            // notification posts on azan-v2-silent.
            // Fix #43: the sounding azan-v2 channel is DELETED outright
            // (never created) — the service is the only sounding azan
            // path. Any code that still posts on azan-v2 (stale build,
            // stale alarm) now posts to a deleted channel and stays
            // silent instead of ringing a channel sound that the next
            // notification would cut dead.
            nm.deleteNotificationChannel("azan-v2");
            // Fix #38: silent azan channel — a "নিঃশব্দ" alarm posts here,
            // so no sound plays (before this it still rang on azan-v2).
            createChannel(nm, ctx, "azan-v2-silent", "Azan (silent)", "Prayer time alerts without sound",
                    NotificationManager.IMPORTANCE_HIGH, -1);
            // Fix #24: the old "azan" channel on the user's phone plays NO
            // sound (notifications arrive silently, exactly like the dhikr
            // channels in Fix #18) and Android never updates an existing
            // channel's sound, so the only reliable repair is a fresh
            // channel ID. Delete the old (possibly silent) one.
            nm.deleteNotificationChannel("azan");
            // Fix #42: pre-waqt reminders (T-5/T-2) now post on a FRESH
            // HIGH-importance channel with the reminder sound, so the
            // waqt name is actually announced (shown + spoken). The old
            // "preazan" channel was DEFAULT importance with no sound,
            // so on his phone the reminder never announced — and Android
            // never updates an existing channel, so only a new channel
            // id fixes it. The old channel is deleted.
            createChannel(nm, ctx, "preazan-v2", "Pre-azan reminders", "Waqt announcement 5 and 2 minutes before each prayer",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.reminder);
            nm.deleteNotificationChannel("preazan");
            // Fix #59: per-waqt pre-azan channels — each waqt's T-5/T-2
            // reminders post on their own HIGH-importance channel whose
            // sound is that waqt's bundled Helio clip (the clip IS the
            // announcement now; the phone TTS is off for pre-azan).
            // Friday Dhuhr posts on preazan-jumuah. preazan-v2 above
            // stays for stale alarms until the JS re-sync replaces them.
            createChannel(nm, ctx, "preazan-fajr", "Pre-azan reminders (Fajr)", "Fajr reminder 5 and 2 minutes before prayer time",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.reminder_fajr);
            createChannel(nm, ctx, "preazan-dhuhr", "Pre-azan reminders (Dhuhr)", "Dhuhr reminder 5 and 2 minutes before prayer time",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.reminder_dhuhr);
            createChannel(nm, ctx, "preazan-asr", "Pre-azan reminders (Asr)", "Asr reminder 5 and 2 minutes before prayer time",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.reminder_asr);
            createChannel(nm, ctx, "preazan-maghrib", "Pre-azan reminders (Maghrib)", "Maghrib reminder 5 and 2 minutes before prayer time",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.reminder_maghrib);
            createChannel(nm, ctx, "preazan-isha", "Pre-azan reminders (Isha)", "Isha reminder 5 and 2 minutes before prayer time",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.reminder_isha);
            createChannel(nm, ctx, "preazan-jumuah", "Pre-azan reminders (Jumu'ah)", "Friday Jumu'ah reminder 5 and 2 minutes before prayer time",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.reminder_jumuah);
            createChannel(nm, ctx, "tahajjud", "Tahajjud", "Tahajjud notification (no azan)",
                    NotificationManager.IMPORTANCE_DEFAULT, -1);
            createChannel(nm, ctx, "sehri", "Sehri", "Sehri alarm",
                    NotificationManager.IMPORTANCE_DEFAULT, -1);
            createChannel(nm, ctx, "iftar", "Iftar", "Iftar alarm",
                    NotificationManager.IMPORTANCE_DEFAULT, -1);
            createChannel(nm, ctx, "forbidden", "Forbidden times", "Forbidden prayer time alerts",
                    NotificationManager.IMPORTANCE_DEFAULT, -1);
            createChannel(nm, ctx, "duha", "Duha", "Duha prayer alarm",
                    NotificationManager.IMPORTANCE_DEFAULT, R.raw.reminder);
            // Fix #18: the old dhikr channels were created WITHOUT a
            // working sound on the user's phone — a notification arrived
            // but no audio played — and Android never updates an
            // existing channel's sound, so the only reliable repair is
            // fresh channel IDs. Delete the old (possibly silent) ones
            // and create v2 channels with the sound + HIGH importance.
            // Build #19, Fix #4: the v2 channel on the user's phone was
            // itself created without a working sound (the durood
            // reminder still arrives silently with the switch ON) — the
            // same repair again: delete v2, create v3 with the sound +
            // HIGH importance. The native side is now the SOLE creator
            // of the dhikr channels (the JS createChannel calls are
            // gone), so no second creator can ever make a silent one.
            // Fix #41 Step 3 (24 Nov 2026 night): v3 did NOT fix it —
            // Builds 20/21/22 (clean installs, v3 in them) still play
            // istighfar but never durood, and the JS schedule path was
            // driven with a recording LN mock and proven correct and
            // symmetric (24 + 24 notifications, right channels,
            // sounds, ids, times). The break is the CHANNEL STATE on
            // his phone: Android Auto Backup (allowBackup="true" in
            // the manifest) restores notification-channel settings
            // across uninstall/reinstall, so a v3 channel once created
            // silent (or muted) stays silent through every "clean"
            // install — and Android never updates an existing
            // channel's sound. Same repair a third time: delete v3,
            // create v4 with the sound + HIGH importance. A v4 channel
            // has never existed on his phone, so no backed-up silent
            // state can attach to it.
            nm.deleteNotificationChannel("dhikr-durood");
            nm.deleteNotificationChannel("dhikr-istighfar");
            nm.deleteNotificationChannel("dhikr-durood-v2");
            nm.deleteNotificationChannel("dhikr-istighfar-v2");
            nm.deleteNotificationChannel("dhikr-durood-v2-silent");
            nm.deleteNotificationChannel("dhikr-istighfar-v2-silent");
            nm.deleteNotificationChannel("dhikr-durood-v3");
            nm.deleteNotificationChannel("dhikr-istighfar-v3");
            nm.deleteNotificationChannel("dhikr-durood-v3-silent");
            nm.deleteNotificationChannel("dhikr-istighfar-v3-silent");
            createChannel(nm, ctx, "dhikr-durood-v4", "Durood reminders", "Durood Sharif reminders",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.durood);
            createChannel(nm, ctx, "dhikr-istighfar-v4", "Istighfar reminders", "Astaghfirullah reminders",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.istighfar);
            // Fix #33: silent variants of the dhikr channels — same HIGH
            // importance (the notification still pops up) but rawRes -1,
            // so no sound is set at all. The sound switch works by
            // scheduling into the v4 channel (sound on) or the -silent
            // channel (sound off), because Android never updates an
            // existing channel's sound.
            createChannel(nm, ctx, "dhikr-durood-v4-silent", "Durood reminders (silent)", "Durood Sharif reminders without sound",
                    NotificationManager.IMPORTANCE_HIGH, -1);
            createChannel(nm, ctx, "dhikr-istighfar-v4-silent", "Istighfar reminders (silent)", "Astaghfirullah reminders without sound",
                    NotificationManager.IMPORTANCE_HIGH, -1);
        } catch (Exception ignored) {}
    }

    private static void createChannel(NotificationManager nm, Context ctx,
            String id, String name, String description, int importance, int rawRes) {
        if (nm.getNotificationChannel(id) != null) return;
        NotificationChannel ch = new NotificationChannel(id, name, importance);
        ch.setDescription(description);
        ch.enableVibration(true);
        if (rawRes > 0) {
            Uri soundUri = Uri.parse("android.resource://" + ctx.getPackageName() + "/" + rawRes);
            AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
            ch.setSound(soundUri, attrs);
        }
        nm.createNotificationChannel(ch);
    }
}
