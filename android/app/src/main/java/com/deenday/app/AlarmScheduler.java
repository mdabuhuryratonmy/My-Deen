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
            long now = System.currentTimeMillis();
            while (at <= now) at += 86400000L;
            alarm.put("at", at);
            JSONArray stored = readStored(ctx);
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
        i.putExtra("type", alarm.optString("type", "azan"));
        i.putExtra("title", alarm.optString("title", "My Deen"));
        i.putExtra("body", alarm.optString("body", ""));
        i.putExtra("sound", alarm.optString("sound", "none"));
        i.putExtra("prayerId", alarm.optString("prayerId", ""));
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
            createChannel(nm, ctx, "azan", "Azan", "Prayer time azan alerts",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.azan);
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
            nm.deleteNotificationChannel("dhikr-durood");
            nm.deleteNotificationChannel("dhikr-istighfar");
            createChannel(nm, ctx, "dhikr-durood-v2", "Durood reminders", "Durood Sharif reminders",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.durood);
            createChannel(nm, ctx, "dhikr-istighfar-v2", "Istighfar reminders", "Astaghfirullah reminders",
                    NotificationManager.IMPORTANCE_HIGH, R.raw.istighfar);
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
