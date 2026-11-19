package com.deenday.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.MediaPlayer;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Plays the durood sharif audio when the user unlocks the phone
 * (ACTION_USER_PRESENT). The audio is a short bundled clip
 * (res/raw/durood.mp3, 3.72 s — one recitation) and plays offline,
 * exactly once per unlock.
 *
 * Fix #3: onReceive uses goAsync() + PendingResult and plays the audio
 * on a background thread, so Android cannot cut the playback short by
 * killing the receiver mid-play (the old version played synchronously
 * inside onReceive and was often cut off). The on/off state is stored
 * in SharedPreferences ("mydeen" / "durood_on_unlock", default true)
 * and synced from the web settings toggle via DuroodUnlockPlugin.
 * Best-effort: on some Android versions / OEM skins the broadcast may
 * be delayed or not delivered while the app is killed (Xiaomi MIUI also
 * needs Autostart ON + Battery "No restrictions" for this app).
 */
public class DuroodUnlockReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_USER_PRESENT.equals(intent.getAction())) return;
        SharedPreferences prefs = context.getSharedPreferences("mydeen", Context.MODE_PRIVATE);
        if (!prefs.getBoolean("durood_on_unlock", true)) return;
        final BroadcastReceiver.PendingResult result = goAsync();
        new Thread(() -> {
            final AtomicBoolean finished = new AtomicBoolean(false);
            MediaPlayer mp = null;
            try {
                mp = MediaPlayer.create(context, R.raw.durood);
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
}
