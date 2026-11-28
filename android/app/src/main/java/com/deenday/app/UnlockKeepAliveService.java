package com.deenday.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

/**
 * Fix #42 (27 Nov 2026): keep-alive foreground service for the unlock
 * durood. The user confirmed he already gave ALL settings on
 * his Realme (Autostart ON + Battery "No restrictions") and the unlock
 * durood STILL did not play — the settings explanation is ruled out.
 * The failure is the app being killed in the background: on aggressive
 * OEMs (Realme / ColorOS and others) the system never delivers
 * ACTION_USER_PRESENT to a dead app, so DuroodUnlockReceiver never runs
 * even though the receiver, the audio file and the toggle are all
 * correct. The only reliable fix in code is to keep the app process
 * alive — a lightweight foreground service does exactly that. While
 * this service runs, the process is alive, so the manifest-registered
 * DuroodUnlockReceiver fires on every unlock and auto-plays the durood
 * (Fix #45: the durood plays by itself on unlock; the ✅ button on the
 * reminder notification only replays it).
 *
 * This service plays NO audio and registers NO receiver itself — the
 * manifest DuroodUnlockReceiver plays the durood on unlock, so the
 * durood can never play twice from a single unlock. Its only job is to
 * hold the process alive with a persistent notification.
 *
 * Started when the app opens (MainActivity), on boot (BootReceiver),
 * and when the durood toggle is switched on (DuroodUnlockPlugin) — and
 * only when the toggle is ON. Stopped when the toggle is switched off.
 * START_STICKY: the system restarts it if it is killed for memory.
 *
 * Honest tradeoffs (tell the user): a notification stays in the shade
 * while the service runs (it cannot be swiped away — tapping it opens
 * My Deen; turning the durood toggle OFF stops the service and removes
 * it). It holds the app in memory, so it uses a little RAM and a small
 * amount of battery — far less than a wake lock, but not zero. A
 * force-stop of the app kills it until the user opens the app again
 * (Android blocks everything after a force-stop). The service type is
 * specialUse (Android 14+): a future Play Store release needs the
 * special-use foreground-service declaration in Play Console.
 */
public class UnlockKeepAliveService extends Service {
    public static final int NOTIF_ID = 900;
    public static final String CHANNEL_ID = "keepalive";
    private static final String PREFS = "mydeen";
    private static final String KEY_DUROOD_ON = "durood_on_unlock";

    /** True when the unlock-durood toggle is on (default ON). */
    public static boolean isEnabled(Context ctx) {
        try {
            SharedPreferences prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            return prefs.getBoolean(KEY_DUROOD_ON, true);
        } catch (Exception e) {
            return true;
        }
    }

    /** Start the keep-alive service (no-op if the toggle is off). */
    public static void start(Context ctx) {
        if (ctx == null || !isEnabled(ctx)) return;
        try {
            Intent i = new Intent(ctx, UnlockKeepAliveService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ctx.startForegroundService(i);
            } else {
                ctx.startService(i);
            }
        } catch (Exception ignored) {
            // Foreground-service start can be refused while the app is in
            // the background on some versions — the manifest receiver
            // remains the fallback, so the durood can still play.
        }
    }

    /** Stop the keep-alive service (called when the durood toggle is off). */
    public static void stop(Context ctx) {
        if (ctx == null) return;
        try {
            ctx.stopService(new Intent(ctx, UnlockKeepAliveService.class));
        } catch (Exception ignored) {}
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        ensureChannel(this);
        Notification n = buildNotification(this);
        try {
            // The foregroundServiceType is declared in the manifest
            // (specialUse); the 2-arg call uses it.
            startForeground(NOTIF_ID, n);
        } catch (Exception e) {
            // Could not go foreground (e.g. notification permission
            // refused) — stop rather than crash; the manifest receiver
            // remains the fallback.
            stopSelf();
            return START_NOT_STICKY;
        }
        return START_STICKY;
    }

    private static void ensureChannel(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        try {
            NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm == null || nm.getNotificationChannel(CHANNEL_ID) != null) return;
            NotificationChannel ch = new NotificationChannel(CHANNEL_ID,
                    "My Deen চালু আছে", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("আনলক করলে দরুদ বাজানোর জন্য অ্যাপটি চালু রাখে");
            ch.enableVibration(false);
            ch.setSound(null, null);
            ch.setShowBadge(false);
            nm.createNotificationChannel(ch);
        } catch (Exception ignored) {}
    }

    private static Notification buildNotification(Context ctx) {
        Intent open = new Intent(ctx, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("My Deen চালু আছে")
                .setContentText("আনলক করলে দরুদ বাজবে • সঠিক সময়ে আজান বাজবে")
                .setContentIntent(pi)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setShowWhen(false);
        try {
            android.graphics.Bitmap large = android.graphics.BitmapFactory.decodeResource(
                    ctx.getResources(), R.drawable.ic_notification_large);
            if (large != null) b.setLargeIcon(large);
        } catch (Exception ignored) {}
        return b.build();
    }
}
