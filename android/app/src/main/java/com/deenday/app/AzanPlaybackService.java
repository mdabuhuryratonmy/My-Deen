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
import androidx.core.app.NotificationManagerCompat;

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
 * Started only by AlarmReceiver for a sounding azan (type "azan-v2").
 * Silent azans (type "azan-v2-silent") never start it. The spoken
 * announcement (AlarmReceiver TTS, speakText) runs in parallel, as
 * before. When playback ends the service stops and leaves the
 * notification in place (stopForeground(false)); the user dismisses it.
 * If the player or audio focus fails, the service falls back to posting
 * the same notification on the sounding azan-v2 channel, so the prayer
 * still rings the old way — degraded, but never silent.
 *
 * Audio focus: AUDIOFOCUS_GAIN. A transient duck request (an incoming
 * notification ding) is deliberately NOT ducked — the user asked for
 * the azan to keep playing. A transient loss (e.g. a phone call) pauses
 * and resumes on gain. A permanent loss (another app took focus)
 * stops the azan. The audio usage is USAGE_NOTIFICATION, the same as
 * the old channel sound and the unlock durood, so the volume knob that
 * controlled the azan before still controls it.
 */
public class AzanPlaybackService extends Service {
    private MediaPlayer player;
    private AudioManager audioManager;
    private AudioManager.OnAudioFocusChangeListener focusListener;
    private AudioFocusRequest focusRequest;
    private boolean pausedForTransientLoss = false;
    private boolean focusHeld = false;
    private int notifId = 0;
    private String notifTitle;
    private String notifBody;

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
        notifId = id;
        notifTitle = title;
        notifBody = body;
        AlarmScheduler.ensureChannels(this);
        // Foreground FIRST (required within seconds of
        // startForegroundService), on the silent channel — the sound
        // comes from the MediaPlayer only, never the channel.
        Notification n = buildNotification(id, title, body, "azan-v2-silent");
        try {
            startForeground(id, n);
        } catch (Exception e) {
            fallbackToChannelSound(id, title, body);
            stopSelf();
            return START_NOT_STICKY;
        }
        if (!startAzan()) {
            // Player or audio focus failed — same fallback.
            stopForeground(true);
            fallbackToChannelSound(id, title, body);
            stopSelf();
            return START_NOT_STICKY;
        }
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        stopPlayback();
        super.onDestroy();
    }

    /** Request audio focus and start the azan MediaPlayer. */
    private boolean startAzan() {
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
            int res;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                        .setAudioAttributes(attrs)
                        .setOnAudioFocusChangeListener(focusListener)
                        .setWillPauseWhenDucked(false)
                        .build();
                res = audioManager.requestAudioFocus(focusRequest);
            } else {
                res = audioManager.requestAudioFocus(focusListener,
                        AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
            }
            if (res != AudioManager.AUDIOFOCUS_REQUEST_GRANTED) return false;
            focusHeld = true;
            player = createPlayer(attrs);
            if (player == null) return false;
            final MediaPlayer mp = player;
            mp.setOnCompletionListener(m -> finishPlayback());
            mp.setOnErrorListener((m, what, extra) -> {
                // Player error mid-azan: fall back to the channel sound.
                fallbackToChannelSound(notifId, notifTitle, notifBody);
                finishPlayback();
                return true;
            });
            mp.start();
            return true;
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

    /** Post the same notification on the sounding azan-v2 channel, so
        the azan still rings the old way when media playback fails.
        Same id: it replaces the silent visual notification. */
    private void fallbackToChannelSound(int id, String title, String body) {
        try {
            Notification n = buildNotification(id,
                    title != null ? title : "My Deen",
                    body != null ? body : "", "azan-v2");
            NotificationManagerCompat.from(this).notify(id, n);
        } catch (Exception ignored) {}
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
