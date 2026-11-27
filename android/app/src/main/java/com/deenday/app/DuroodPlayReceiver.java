package com.deenday.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Fix #44 (27 Nov 2026): plays the durood ONLY when the user presses
 * the ✅ action button on the unlock reminder notification. Nothing
 * else can fire this receiver — it has no intent-filter and no other
 * caller; the PendingIntent is explicit and created only by
 * DuroodUnlockReceiver.postReminder(). Each press plays the bundled
 * res/raw/durood.mp3 (3.72 s, one recitation) exactly once, counts it
 * (DuroodUnlockReceiver.incrementCount) and refreshes the reminder
 * notification so its text shows the new count. The playback pattern
 * (goAsync + background thread + explicit notification audio
 * attributes + full volume + 15 s safety net) is the one proven by
 * the old unlock receiver (Fix #3 / Build #19 / Fix #6).
 */
public class DuroodPlayReceiver extends BroadcastReceiver {
    public static final String ACTION_PLAY_DUROOD = "com.deenday.app.PLAY_DUROOD";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !ACTION_PLAY_DUROOD.equals(intent.getAction())) return;
        final BroadcastReceiver.PendingResult result = goAsync();
        new Thread(() -> {
            final AtomicBoolean finished = new AtomicBoolean(false);
            MediaPlayer mp = null;
            try {
                mp = createPlayer(context);
                if (mp == null) {
                    if (finished.compareAndSet(false, true)) result.finish();
                    return;
                }
                final MediaPlayer player = mp;
                player.setOnCompletionListener(m -> {
                    player.release();
                    if (finished.compareAndSet(false, true)) result.finish();
                });
                player.setOnErrorListener((m, what, extra) -> {
                    m.release();
                    if (finished.compareAndSet(false, true)) result.finish();
                    return true;
                });
                player.start();
                // Count the press only once the durood is actually
                // playing, then refresh the reminder with the new count.
                DuroodUnlockReceiver.incrementCount(context);
                DuroodUnlockReceiver.postReminder(context);
                // Safety net: finish the pending result after 15 s even if
                // the callbacks never fire, so the broadcast never hangs.
                try { Thread.sleep(15000); } catch (InterruptedException ignored) {}
                if (finished.compareAndSet(false, true)) {
                    try { if (player.isPlaying()) player.stop(); } catch (Exception ignored) {}
                    player.release();
                    result.finish();
                }
            } catch (Exception ignored) {
                try { if (mp != null) mp.release(); } catch (Exception ignored2) {}
                if (finished.compareAndSet(false, true)) result.finish();
            }
        }).start();
    }

    /** Same explicit player as the old unlock receiver (Fix #6):
        notification audio attributes + full volume, with a
        MediaPlayer.create() fallback. */
    private MediaPlayer createPlayer(Context context) {
        try {
            MediaPlayer mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build());
            Uri uri = Uri.parse("android.resource://" + context.getPackageName() + "/" + R.raw.durood);
            mp.setDataSource(context, uri);
            mp.setVolume(1.0f, 1.0f);
            mp.prepare();
            return mp;
        } catch (Exception ignored) {
            try {
                MediaPlayer mp = MediaPlayer.create(context, R.raw.durood);
                if (mp != null) mp.setVolume(1.0f, 1.0f);
                return mp;
            } catch (Exception ignored2) {
                return null;
            }
        }
    }
}
