package com.deenday.app;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

/**
 * Fix #42 (27 Nov 2026): play the azan as real media, not as a
 * notification sound. The old path posted the azan notification on the
 * azan-v2 channel whose sound is azan.mp3 — Android plays only one
 * notification sound at a time, so any incoming message/notification
 * cut the azan dead. This service plays res/raw/azan.mp3 (~3.5 min)
 * with a MediaPlayer holding AUDIOFOCUS_GAIN, so the azan keeps playing
 * through incoming notifications/messages (a notification ding may
 * sound over it briefly, but the azan is never stopped). The visual
 * notification is posted on the silent channel (azan-v2-silent) by
 * AlarmReceiver, so the azan never plays twice.
 *
 * Started only by AlarmReceiver for a sounding azan (type azan-v2).
 * Silent azans (type "azan-v2-silent") never start it. The spoken
 * announcement (AlarmReceiver TTS, speakText) runs in parallel, as
 * before. When playback ends the service stops and leaves the
 * notification in place (stopForeground(false)); the user dismisses it.
 *
 * Fix #43 (27 Nov 2026): there is NO channel-sound fallback any more —
 * the service is the ONLY sounding azan path on Android. Build 25 fell
 * back to posting the notification on the sounding azan-v2 channel
 * whenever the service could not start or audio focus was denied, and
 * that channel sound is cut dead by the next notification/message —
 * exactly the bug the user reported. So: audio focus is retried, and if
 * it is still denied the azan plays WITHOUT focus (an alarm must ring)
 * rather than staying silent; if the player itself cannot be created,
 * the notification simply stays silent (visual only). The sounding
 * azan-v2 channel no longer exists (AlarmScheduler deletes it).
 *
 * Audio focus: AUDIOFOCUS_GAIN. A transient duck request (an incoming
 * notification ding) is deliberately NOT ducked — the user asked for
 * the azan to keep playing. A transient loss (e.g. a phone call) pauses
 * and resumes on gain. A permanent loss (another app took focus)
 * stops the azan. The audio usage is USAGE_NOTIFICATION — a deliberate
 * choice (Fix #43): it is the same volume knob that controlled the old
 * channel sound, so the azan is exactly as loud as before on the user's
 * phone (he hears the azan start today — that knob is up). USAGE_MEDIA
 * would use the media knob instead (silent if his media volume is 0)
 * and would bypass Do Not Disturb, a behaviour change; USAGE_ALARM
 * was not chosen for the same reason (different knob, DND bypass).
 * Playback runs on a background thread so the focus-retry wait never
 * blocks the main thread; a generation counter stops a stale thread
 * from starting a player after a newer azan (or a destroy) replaced it.
 */
public class AzanPlaybackService extends Service {
    private MediaPlayer player;
    private AudioManager audioManager;
    private AudioManager.OnAudioFocusChangeListener focusListener;
    private AudioFocusRequest focusRequest;
    private boolean pausedForTransientLoss = false;
    private boolean focusHeld = false;
    // Fix #43: how many times audio focus is requested before the azan
    // plays without it; and the generation of the playback this service
    // is currently running (a stale background thread must never start
    // a player after a newer azan or a destroy replaced it).
    private static final int FOCUS_ATTEMPTS = 2;
    private static final long FOCUS_RETRY_WAIT_MS = 500;
    private volatile int playbackGeneration = 0;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }
        int id = intent.getIntExtra("id", 0);
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        // A second azan while one is playing: restart with the new one.
        stopPlayback();
        AlarmScheduler.ensureChannels(this);
        // Foreground FIRST (required within seconds of
        // startForegroundService), on the silent channel — the sound
        // comes from the MediaPlayer only, never the channel.
        Notification n = buildNotification(id, title, body, "azan-v2-silent");
        try {
            startForeground(id, n);
        } catch (Exception e) {
            // Fix #43: no channel-sound fallback — stop quietly. The
            // receiver already posts the silent visual notification,
            // so the user still sees the prayer time.
            stopSelf();
            return START_NOT_STICKY;
        }
        // Fix #43: playback runs on a background thread — the focus
        // retry waits below must never block the main thread.
        final int gen = ++playbackGeneration;
        new Thread(() -> {
            try { startAzan(gen); } catch (Exception ignored) {}
        }).start();
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        playbackGeneration++;
        stopPlayback();
        super.onDestroy();
    }

    /** Request audio focus and start the azan MediaPlayer. Runs on a
        background thread (see onStartCommand). Focus is requested up to
        FOCUS_ATTEMPTS times; if it is still denied, the azan plays
        WITHOUT focus rather than staying silent — an alarm must ring,
        and a notification-channel sound is not an option any more (the
        next message would cut it). When focus WAS granted, the listener
        below handles transient loss (pause, resume on gain) and
        permanent loss (stop). */
    private void startAzan(int gen) {
        try {
            audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            focusListener = focusChange -> {
                if (player == null) return;
                switch (focusChange) {
                    case AudioManager.AUDIOFOCUS_GAIN:
                        // Regained focus after a transient loss: resume.
                        try { player.setVolume(1.0f, 1.0f); } catch (Exception ignored) {}
                        if (pausedForTransientLoss) {
                            pausedForTransientLoss = false;
                            try { player.start(); } catch (Exception ignored) {}
                        }
                        break;
                    case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK:
                        // Deliberately NOT ducked: the user asked for the
                        // azan to keep playing through notifications.
                        // A notification ding sounds over it briefly.
                        break;
                    case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT:
                        // A call or voice assistant: pause, resume on gain.
                        try {
                            if (player.isPlaying()) {
                                player.pause();
                                pausedForTransientLoss = true;
                            }
                        } catch (Exception ignored) {}
                        break;
                    case AudioManager.AUDIOFOCUS_LOSS:
                        // Another app took focus permanently: stop.
                        finishPlayback();
                        break;
                    default:
                        break;
                }
            };
            AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
            // Fix #43: retry focus (a transient holder may release it);
            // then play WITHOUT focus rather than staying silent.
            boolean granted = false;
            for (int attempt = 0; attempt < FOCUS_ATTEMPTS && !granted; attempt++) {
                if (attempt > 0) {
                    try { Thread.sleep(FOCUS_RETRY_WAIT_MS); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
                    if (gen != playbackGeneration) return; // superseded: a newer azan (or destroy) replaced this one
                }
                granted = requestFocus(attrs);
            }
            // Fix #43: focus denied twice — play without focus. focusHeld
            // stays false, so stopPlayback() abandons nothing, and the
            // listener above is never registered (there is no focus to
            // lose). The azan still plays; it is never a channel sound.
            if (gen != playbackGeneration) return;
            player = createPlayer(attrs);
            if (player == null) { finishPlayback(); return; }
            final MediaPlayer mp = player;
            mp.setOnCompletionListener(m -> finishPlayback());
            mp.setOnErrorListener((m, what, extra) -> {
                // Player error mid-azan: stop silently (the visual
                // notification stays). A restart would replay the azan
                // from the start; a channel sound is never an option.
                finishPlayback();
                return true;
            });
            try { mp.start(); } catch (Exception ignored) { finishPlayback(); }
        } catch (Exception e) {
            finishPlayback();
        }
    }

    /** One audio-focus request. Returns true when granted (and records
        it, so stopPlayback() abandons it); false otherwise. */
    private boolean requestFocus(AudioAttributes attrs) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                        .setAudioAttributes(attrs)
                        .setOnAudioFocusChangeListener(focusListener)
                        .setWillPauseWhenDucked(false)
                        .build();
                if (audioManager.requestAudioFocus(focusRequest) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
                    focusHeld = true;
                    return true;
                }
                focusRequest = null;
                return false;
            } else {
                if (audioManager.requestAudioFocus(focusListener,
                        AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN)
                        == AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
                    focusHeld = true;
                    return true;
                }
                return false;
            }
        } catch (Exception e) {
            return false;
        }
    }

    /** Build the azan player (same explicit pattern as
        DuroodUnlockReceiver.createPlayer), with a MediaPlayer.create()
        fallback if the explicit setup fails. */
    private MediaPlayer createPlayer(AudioAttributes attrs) {
        try {
            MediaPlayer mp = new MediaPlayer();
            mp.setAudioAttributes(attrs);
            Uri uri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.azan);
            mp.setDataSource(this, uri);
            mp.setVolume(1.0f, 1.0f);
            mp.prepare();
            return mp;
        } catch (Exception ignored) {
            try {
                MediaPlayer mp = MediaPlayer.create(this, R.raw.azan);
                if (mp != null) mp.setVolume(1.0f, 1.0f);
                return mp;
            } catch (Exception ignored2) {
                return null;
            }
        }
    }

    /** Azan finished (or focus lost permanently): stop the player,
        abandon focus, leave the notification in place, stop. */
    private void finishPlayback() {
        stopPlayback();
        try { stopForeground(false); } catch (Exception ignored) {}
        stopSelf();
    }

    private void stopPlayback() {
        pausedForTransientLoss = false;
        try {
            if (player != null) {
                try { if (player.isPlaying()) player.stop(); } catch (Exception ignored) {}
                player.release();
            }
        } catch (Exception ignored) {}
        player = null;
        if (focusHeld && audioManager != null) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && focusRequest != null) {
                    audioManager.abandonAudioFocusRequest(focusRequest);
                } else if (focusListener != null) {
                    audioManager.abandonAudioFocus(focusListener);
                }
            } catch (Exception ignored) {}
        }
        focusHeld = false;
        focusRequest = null;
        focusListener = null;
    }

    /** The visual notification (mirrors AlarmReceiver's: same icons,
        same channel for the silent visual). */
    private Notification buildNotification(int id, String title, String body, String channelId) {
        NotificationCompat.Builder b = new NotificationCompat.Builder(this, channelId)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title != null ? title : "My Deen")
                .setContentText(body != null ? body : "")
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH);
        try {
            Bitmap large = BitmapFactory.decodeResource(
                    getResources(), R.drawable.ic_notification_large);
            if (large != null) b.setLargeIcon(large);
        } catch (Exception ignored) {}
        return b.build();
    }
}
