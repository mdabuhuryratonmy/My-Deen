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
 * Fix #45 (28 Nov 2026, user correction of the Fix #44 reading of
 * Al-Shafie): in Al-Shafie (الشفيع) the durood plays AUTOMATICALLY on
 * phone unlock — no button press anywhere. So the unlock durood
 * auto-plays again (as it did before Fix #44): on USER_PRESENT the
 * receiver plays the durood itself (DuroodPlayer.playOnce, our own
 * bundled res/raw/durood.mp3, 2.68 s, one recitation) and counts it.
 * No button press, no notification tap is needed for the durood to
 * play. Clean-room: our own code, our own bundled audio, our own
 * design; nothing copied from Al-Shafie.
 *
 * The reminder notification still appears — but AFTER the durood
 * finishes, on the user's chosen sound channel (reminder / istighfar /
 * silent), showing the fresh count. That way the chosen tone (reminder
 * 2.2 s, istighfar 1.4 s) never overlaps the durood itself. The
 * notification has a ✅ action button ("✅ দরুদ শুনুন") that only
 * REPLAYS the durood (DuroodPlayReceiver) — it is never required. The
 * notification stays in the notification list until the user swipes it
 * away (setAutoCancel(false)); each unlock re-posts it (same id 9001,
 * fresh count).
 *
 * Delivery is unchanged and resilient: the manifest receiver
 * (exported, USER_PRESENT) plus the UnlockKeepAliveService keeps the
 * app alive so the broadcast is delivered even when the app was killed
 * in the background (Fix #42). The on/off state is SharedPreferences
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
    // Fix #56: last unlock-play attempt / success (epoch ms, 0 = never)
    // — read by DuroodUnlockPlugin.getUnlockStatus() for the Settings
    // diagnostic ("শেষবার আনলক-দরুদ বেজেছে", else "এখনো হয়নি").
    public static final String KEY_LAST_UNLOCK_ATTEMPT = "durood_last_unlock_attempt";
    public static final String KEY_LAST_UNLOCK_PLAY = "durood_last_unlock_play";

    /** Fix #56: record an unlock-play attempt / success (epoch ms). */
    public static void recordUnlockAttempt(Context ctx) {
        try { ctx.getSharedPreferences("mydeen", Context.MODE_PRIVATE).edit().putLong(KEY_LAST_UNLOCK_ATTEMPT, System.currentTimeMillis()).apply(); } catch (Exception ignored) {}
    }
    public static void recordUnlockPlay(Context ctx) {
        try { ctx.getSharedPreferences("mydeen", Context.MODE_PRIVATE).edit().putLong(KEY_LAST_UNLOCK_PLAY, System.currentTimeMillis()).apply(); } catch (Exception ignored) {}
    }
    public static long getLastUnlockAttempt(Context ctx) {
        try { return ctx.getSharedPreferences("mydeen", Context.MODE_PRIVATE).getLong(KEY_LAST_UNLOCK_ATTEMPT, 0L); } catch (Exception e) { return 0L; }
    }
    public static long getLastUnlockPlay(Context ctx) {
        try { return ctx.getSharedPreferences("mydeen", Context.MODE_PRIVATE).getLong(KEY_LAST_UNLOCK_PLAY, 0L); } catch (Exception e) { return 0L; }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_USER_PRESENT.equals(intent.getAction())) return;
        SharedPreferences prefs = context.getSharedPreferences("mydeen", Context.MODE_PRIVATE);
        if (!prefs.getBoolean(KEY_DUROOD_ON, true)) return;
        // Fix #57: no ensureChannels() here any more — postReminder()
        // creates the channels itself AFTER playback, so the channel
        // setup (binder calls) no longer sits on the playback-start
        // path. The durood must start as soon as possible after unlock.
        // goAsync + a background thread, because playOnce() blocks until
        // the 2.68 s clip finishes (10 s cap). The reminder notification
        // posts AFTER playback, on the chosen sound channel, so the
        // chosen tone never overlaps the durood itself.
        final BroadcastReceiver.PendingResult result = goAsync();
        new Thread(() -> {
            // Fix #56: record the attempt BEFORE playing, and the
            // success only when playback actually started — the
            // Settings diagnostic reads these two timestamps.
            recordUnlockAttempt(context);
            boolean played = false;
            try { played = DuroodPlayer.playOnce(context); } catch (Exception ignored) {}
            if (played) recordUnlockPlay(context);
            try { postReminder(context); } catch (Exception ignored) {}
            // Fix #57: self-heal — if Realme killed the keep-alive
            // service, restart it now (best-effort: start() swallows a
            // refusal) so the NEXT unlock finds a warm process and
            // plays promptly instead of cold-starting every time.
            UnlockKeepAliveService.start(context);
            result.finish();
        }).start();
    }

    /** Create the three reminder channels (one per sound choice) — idempotent. */
    public static void ensureChannels(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        try {
            // Fix #58: same version-gated channel migration as
            // AlarmScheduler — heal a backup-restored silent reminder
            // channel once per channel version, before recreating.
            AlarmScheduler.migrateChannelsIfNeeded(ctx);
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
        ch.setDescription("ফোন আনলক করলে দরুদ বাজে, আর হিসাব দেখায়");
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
                    ? "আজ " + today + " বার দরুদ পড়া হয়েছে • ✅ চাপলে আবার বাজবে"
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
