package com.deenday.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Fix #45 (28 Nov 2026): the ✅ action button on the unlock durood
 * notification is now only a REPLAY — the durood itself auto-plays on
 * unlock (DuroodUnlockReceiver). Nothing else can fire this receiver —
 * it has no intent-filter and no other caller; the PendingIntent is
 * explicit and created only by DuroodUnlockReceiver.postReminder().
 * Each press replays the bundled res/raw/durood.mp3 (1.5 s, one
 * recitation) exactly once via the shared DuroodPlayer, counts it and
 * refreshes the reminder notification with the new count — the
 * notification posts AFTER playback finishes, so the chosen reminder
 * tone never overlaps the durood itself.
 */
public class DuroodPlayReceiver extends BroadcastReceiver {
    public static final String ACTION_PLAY_DUROOD = "com.deenday.app.PLAY_DUROOD";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !ACTION_PLAY_DUROOD.equals(intent.getAction())) return;
        final BroadcastReceiver.PendingResult result = goAsync();
        new Thread(() -> {
            try { DuroodPlayer.playOnce(context); } catch (Exception ignored) {}
            try { DuroodUnlockReceiver.postReminder(context); } catch (Exception ignored) {}
            // Fix #57: self-heal — same re-arm as the unlock path, so a
            // service Realme killed is restarted after every replay.
            UnlockKeepAliveService.start(context);
            result.finish();
        }).start();
    }
}
