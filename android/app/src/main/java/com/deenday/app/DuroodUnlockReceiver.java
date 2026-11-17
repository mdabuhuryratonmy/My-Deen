package com.deenday.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.MediaPlayer;

/**
 * Plays the durood sharif audio when the user unlocks the phone
 * (ACTION_USER_PRESENT). Best-effort: on some Android versions / OEM skins
 * the broadcast may be delayed or not delivered while the app is killed.
 * The on/off state is stored in SharedPreferences ("mydeen" /
 * "durood_on_unlock", default true) and synced from the web settings
 * toggle via DuroodUnlockPlugin. The audio is a short bundled clip
 * (res/raw/durood.mp3) and plays offline.
 */
public class DuroodUnlockReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_USER_PRESENT.equals(intent.getAction())) return;
        SharedPreferences prefs = context.getSharedPreferences("mydeen", Context.MODE_PRIVATE);
        if (!prefs.getBoolean("durood_on_unlock", true)) return;
        try {
            MediaPlayer mp = MediaPlayer.create(context, R.raw.durood);
            if (mp == null) return;
            mp.setOnCompletionListener(MediaPlayer::release);
            mp.setOnErrorListener((m, what, extra) -> { m.release(); return true; });
            mp.start();
        } catch (Exception ignored) {
            // Never crash the system broadcast path.
        }
    }
}
