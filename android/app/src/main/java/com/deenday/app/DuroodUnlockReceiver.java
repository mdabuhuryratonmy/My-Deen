package com.deenday.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.BitmapFactory;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Fix #44 (27 Nov 2026, user order): the unlock durood now works like
 * the Al-Shafie app — clean-room: our own code, our own bundled audio,
 * our own design; nothing copied from Al-Shafie. On phone unlock a
 * durood REMINDER notification appears — it does NOT auto-play. The
 * notification has a ✅ action button ("✅ দরুদ শুনুন"); pressing it
 * plays the durood audio (DuroodPlayReceiver, our res/raw/durood.mp3,
 * 3.72 s) and counts it. The button must be pressed each time — the
 * notification itself never plays the durood. The notification stays
 * in the notification list until the user swipes it away
 * (setAutoCancel(false)); each unlock re-posts it (same id, fresh
 * count). The user picks the reminder sound in Settings ("reminder" =
 * res/raw/reminder.mp3, "istighfar" = res/raw/istighfar.mp3, "silent"
 * = no sound) — the sound is the notification CHANNEL's sound, so
 * there is one channel per choice. The durood count (today + total)
 * lives in SharedPreferences and is shown in the reminder text and in
 * Settings (via DuroodUnlockPlugin).
 *
 * The old behaviour (Fix #35) auto-played the durood on every unlock.
 * That is gone: this receiver contains NO MediaPlayer at all — the
 * only player is DuroodPlayReceiver, fired only by the ✅ button.
 *
 * Delivery is unchanged and resilient: the manifest receiver (exported,
 * USER_PRESENT) plus the UnlockKeepAliveService keeps the app alive so
 * the broadcast is delivered even when the app was killed in the
 * background (Fix #42). The on/off state is SharedPreferences
 * ("mydeen" / "durood_on_unlock", default true), synced from the web
 * settings toggle via DuroodUnlockPlugin.
 */
public class DuroodUnlockReceiver extends BroadcastReceiver {
    public static final int REMINDER_NOTIF_ID = 9001;
    public static final String CHANNEL_REMINDER = "durood-unlock-reminder";
    public static final String CHANNEL_ISTIGHFAR = "durood-unlock-istighfar";
    public static final String CHANNEL_SILENT = "durood-unlock-silent";
    public static final String KEY_DUROOD_ON = "durood_on_unlock";
    public static final String KEY_REMIND_SOUND = "durood_remind_sound";
    public static final String KEY_COUNT_TOTAL = "durood_count_total";
    public static final String KEY_COUNT_TODAY = "durood_count_today";
    public static final String KEY_COUNT_DATE = "durood_count_date";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_USER_PRESENT.equals(intent.getAction())) return;
        SharedPreferences prefs = context.getSharedPreferences("mydeen", Context.MODE_PRIVATE);
        if (!prefs.getBoolean(KEY_DUROOD_ON, true)) return;
        ensureChannels(context);
        postReminder(context);
    }

    /** Create the three reminder channels (one per sound choice) — idempotent. */
    public static void ensureChannels(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        try {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null) return;
            createChannel(nm, ctx, CHANNEL_REMINDER, "দরুদের রিমাইন্ডার", NotificationManager.IMPORTANCE_HIGH, R.raw.reminder);
            createChannel(nm, ctx, CHANNEL_ISTIGHFAR, "দরুদের রিমাইন্ডার (ইস্তিগফার)", NotificationManager.IMPORTANCE_HIGH, R.raw.istighfar);
            createChannel(nm, ctx, CHANNEL_SILENT, "দরুদের রিমাইন্ডার (নিঃশব্দ)", NotificationManager.IMPORTANCE_DEFAULT, 0);
        } catch (Exception ignored) {}
    }

    private static void createChannel(NotificationManager nm, Context ctx, String id, String name, int importance, int rawRes) {
        if (nm.getNotificationChannel(id) != null) return;
        NotificationChannel ch = new NotificationChannel(id, name, importance);
        ch.setDescription("ফোন আনলক করলে দরুদের রিমাইন্ডার দেখায়");
        if (rawRes != 0) {
            Uri soundUri = Uri.parse("android.resource://" + ctx.getPackageName() + "/" + rawRes);
            AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
            ch.setSound(soundUri, attrs);
        } else {
            ch.setSound(null, null);
            ch.enableVibration(false);
        }
        ch.setShowBadge(false);
        nm.createNotificationChannel(ch);
    }

    /** The channel for the user's chosen reminder sound ("reminder" | "istighfar" | "silent"). */
    public static String channelForSound(Context ctx) {
        String s = ctx.getSharedPreferences("mydeen", Context.MODE_PRIVATE).getString(KEY_REMIND_SOUND, "reminder");
        if ("istighfar".equals(s)) return CHANNEL_ISTIGHFAR;
        if ("silent".equals(s)) return CHANNEL_SILENT;
        return CHANNEL_REMINDER;
    }

    /** Post (or refresh) the reminder notification. Same id every time,
        so each unlock replaces the previous reminder with a fresh count. */
    public static void postReminder(Context ctx) {
        try {
            ensureChannels(ctx);
            int today = getTodayCount(ctx);
            String body = today > 0
                    ? "আজ " + today + " বার দরুদ পড়া হয়েছে • ✅ চাপলে দরুদ বাজবে"
                    : "আজ এখনো দরুদ পড়া হয়নি • ✅ চাপলে দরুদ বাজবে";
            Intent open = new Intent(ctx, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent openPi = PendingIntent.getActivity(ctx, 0, open,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            Intent play = new Intent(ctx, DuroodPlayReceiver.class);
            play.setAction(DuroodPlayReceiver.ACTION_PLAY_DUROOD);
            PendingIntent playPi = PendingIntent.getBroadcast(ctx, REMINDER_NOTIF_ID, play,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, channelForSound(ctx))
                    .setSmallIcon(R.drawable.ic_notification)
                    .setContentTitle("দরুদ শরীফ পড়ুন")
                    .setContentText(body)
                    .setContentIntent(openPi)
                    .addAction(R.drawable.ic_check, "✅ দরুদ শুনুন", playPi)
                    .setAutoCancel(false)
                    .setOngoing(false)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setShowWhen(true);
            try {
                android.graphics.Bitmap large = BitmapFactory.decodeResource(ctx.getResources(), R.drawable.ic_notification_large);
                if (large != null) b.setLargeIcon(large);
            } catch (Exception ignored) {}
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.notify(REMINDER_NOTIF_ID, b.build());
        } catch (Exception ignored) {}
    }

    // ---- Durood count (today + total), shared with DuroodPlayReceiver
    // and DuroodUnlockPlugin. "Today" rolls over by calendar date. ----
    public static String todayKey() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    public static int getTodayCount(Context ctx) {
        try {
            SharedPreferences p = ctx.getSharedPreferences("mydeen", Context.MODE_PRIVATE);
            if (!todayKey().equals(p.getString(KEY_COUNT_DATE, ""))) return 0;
            return p.getInt(KEY_COUNT_TODAY, 0);
        } catch (Exception e) { return 0; }
    }

    public static long getTotalCount(Context ctx) {
        try {
            return ctx.getSharedPreferences("mydeen", Context.MODE_PRIVATE).getLong(KEY_COUNT_TOTAL, 0L);
        } catch (Exception e) { return 0L; }
    }

    /** Count one played durood: rolls "today" over at midnight, then
        today+1 and total+1. Returns today's count after the increment. */
    public static int incrementCount(Context ctx) {
        try {
            SharedPreferences p = ctx.getSharedPreferences("mydeen", Context.MODE_PRIVATE);
            String today = todayKey();
            int n = today.equals(p.getString(KEY_COUNT_DATE, "")) ? p.getInt(KEY_COUNT_TODAY, 0) : 0;
            long total = p.getLong(KEY_COUNT_TOTAL, 0L);
            p.edit().putString(KEY_COUNT_DATE, today).putInt(KEY_COUNT_TODAY, n + 1).putLong(KEY_COUNT_TOTAL, total + 1).apply();
            return n + 1;
        } catch (Exception e) { return 0; }
    }
}
