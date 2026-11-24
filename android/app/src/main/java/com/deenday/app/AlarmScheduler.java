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
        try {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            createChannel(nm, ctx, "azan-v2", "Azan", "Prayer time azan alerts",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.azan);
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
            createChannel(nm, ctx, "preazan", "Pre-azan reminders", "2 minutes before prayer time",
                    NotificationManager.IMPORTANCE_DEFAULT, -1);
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
