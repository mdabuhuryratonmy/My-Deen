package com.deenday.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
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
 * Build #19, Fix #6: the player is now built with explicit
 * notification audio attributes + full volume (see createPlayer) —
 * the old implicit MediaPlayer.create() left the audible route to
 * the system, and on some devices the clip never sounded at all.
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
                // Build #19, Fix #6: the player is built explicitly
                // instead of MediaPlayer.create() — the old implicit
                // build left the stream/attributes to the system, and
                // on some devices the clip was created without an
                // audible route at all. Explicit notification
                // attributes (the same usage the app's notification
                // sounds use) + full volume + a create() fallback if
                // the explicit path fails.
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

    /** Build the durood player with explicit notification audio
        attributes and full volume. Falls back to the simple
        MediaPlayer.create() path if the explicit setup fails. */
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
