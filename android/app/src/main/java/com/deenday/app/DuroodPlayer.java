package com.deenday.app;

import android.content.Context;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Fix #45 (28 Nov 2026, user correction): the ONE shared durood player.
 * The user corrected the Fix #44 reading of Al-Shafie (الشفيع): in
 * Al-Shafie the durood plays AUTOMATICALLY on phone unlock — no button
 * press anywhere. So the unlock durood auto-plays again (as it did
 * before Fix #44), and the ✅ action on the notification is only a
 * replay. Both call sites use playOnce() — DuroodUnlockReceiver on
 * USER_PRESENT and DuroodPlayReceiver on the ✅ action — so there is
 * exactly one player, one set of audio attributes and one counting
 * rule, and the durood can never play twice from a single unlock.
 *
 * The playback pattern is the one proven by the old unlock receiver
 * (Fix #3 / Build #19 / Fix #6): explicit notification audio
 * attributes + full volume, with a MediaPlayer.create() fallback.
 * playOnce() runs on the CALLER's background thread (both callers use
 * goAsync + a thread) and blocks until the 2.68 s clip finishes, errors
 * out, or 10 s elapse — so the caller can post the reminder
 * notification AFTER the durood finishes, on the user's chosen sound
 * channel, and the chosen tone (reminder 2.2 s, istighfar 1.4 s) never
 * overlaps the durood itself. The count is incremented only once
 * playback actually starts.
 */
public final class DuroodPlayer {
    private DuroodPlayer() {}

    /** Play res/raw/durood.mp3 once; block until it finishes/errors or
        10 s elapse. Counts the durood only when playback actually
        starts. Returns true when playback started. Must be called from
        a background thread — never the main thread. */
    public static boolean playOnce(Context context) {
        MediaPlayer mp = createPlayer(context);
        if (mp == null) return false;
        CountDownLatch done = new CountDownLatch(1);
        mp.setOnCompletionListener(m -> done.countDown());
        mp.setOnErrorListener((m, what, extra) -> { done.countDown(); return true; });
        try {
            mp.start();
        } catch (Exception e) {
            safeRelease(mp);
            return false;
        }
        DuroodUnlockReceiver.incrementCount(context);
        try { done.await(10, TimeUnit.SECONDS); } catch (InterruptedException ignored) {}
        try { if (mp.isPlaying()) mp.stop(); } catch (Exception ignored) {}
        safeRelease(mp);
        return true;
    }

    /** Same explicit player as the old unlock receiver (Fix #6):
        notification audio attributes + full volume, with a
        MediaPlayer.create() fallback. */
    public static MediaPlayer createPlayer(Context context) {
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

    private static void safeRelease(MediaPlayer mp) {
        try { if (mp != null) mp.release(); } catch (Exception ignored) {}
    }
}
