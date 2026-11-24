package com.deenday.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import java.util.Locale;
import org.json.JSONObject;

/**
 * Fires when an exact prayer-time alarm goes off: posts the notification
 * on the channel for the alarm type, then re-schedules the same alarm
 * for +24h so daily alarms keep working without opening the app.
 * Never crashes the alarm path.
 *
 * Build #19, Fix #5: spoken pre-azan reminders — an alarm that carries
 * speak=true (the T-5 and T-2 entries before every fard prayer) has
 * its body read aloud with the phone's Bengali text-to-speech voice,
 * in parallel with the notification. The body is the exact Fix #8
 * Bengali text, verbatim. Speaking is best-effort: if TTS is missing
 * or has no Bengali voice, the notification still posts and nothing
 * breaks. Pre-azan entries speak their body; azan entries ALSO speak —
 * the announcement (speakText, Fix #40: "[Waqt] নামাজের সময় হয়েছে,
 * নামাজ পড়ে নাও") — as well as playing the azan through their
 * channel. Tahajjud stays a silent notification.
 */
public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        try {
            AlarmScheduler.ensureChannels(context);
            int id = intent.getIntExtra("id", 0);
            String type = intent.getStringExtra("type");
            if (type == null || type.isEmpty()) type = "azan-v2";
            // Fix #24: stale stored alarms from the old build carry
            // type "azan" — post them on the new channel too.
            if (type.equals("azan")) type = "azan-v2";
            String title = intent.getStringExtra("title");
            String body = intent.getStringExtra("body");
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, type)
                    // Fix #14: was android.R.drawable.ic_dialog_info (the
                    // generic "i" in the screenshot). Small icon is the
                    // white "ماي دين" silhouette (status bar + shade);
                    // large icon is the full gold logo on emerald.
                    .setSmallIcon(R.drawable.ic_notification)
                    .setContentTitle(title != null ? title : "My Deen")
                    .setContentText(body != null ? body : "")
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH);
            Bitmap largeIcon = BitmapFactory.decodeResource(
                    context.getResources(), R.drawable.ic_notification_large);
            if (largeIcon != null) builder.setLargeIcon(largeIcon);
            NotificationManagerCompat.from(context).notify(id, builder.build());
            // Build #19, Fix #5: speak the pre-azan text aloud. The
            // notification above already posted; speaking runs on its
            // own thread with goAsync so the broadcast stays alive
            // while TTS finishes (or the 25 s safety net fires).
            // Fix #40: an azan entry carries speakText (the announcement
            // "[Waqt] নামাজের সময় হয়েছে, নামাজ পড়ে নাও"); pre-azan
            // entries have no speakText and speak the body (exact Fix #8
            // text). Silent entries never carry speak=true.
            String speakText = intent.getStringExtra("speakText");
            String toSpeak = (speakText != null && !speakText.isEmpty()) ? speakText : body;
            if (intent.getBooleanExtra("speak", false) && toSpeak != null && !toSpeak.isEmpty()) {
                final String text = toSpeak;
                final Context appCtx = context.getApplicationContext();
                final BroadcastReceiver.PendingResult result = goAsync();
                new Thread(() -> {
                    try { speakViaTts(appCtx, text); } catch (Exception ignored) {}
                    try { result.finish(); } catch (Exception ignored) {}
                }).start();
            }
            // Daily alarm → same time tomorrow (based on the original
            // fire time, so a late delivery cannot drift the schedule).
            JSONObject alarm = new JSONObject();
            alarm.put("id", id);
            alarm.put("type", type);
            alarm.put("title", title);
            alarm.put("body", body);
            alarm.put("sound", intent.getStringExtra("sound"));
            alarm.put("prayerId", intent.getStringExtra("prayerId"));
            alarm.put("speak", intent.getBooleanExtra("speak", false));
            String st = intent.getStringExtra("speakText");
            if (st != null) alarm.put("speakText", st);
            long at = intent.getLongExtra("at", 0);
            if (at > 0) {
                alarm.put("at", at);
                AlarmScheduler.rescheduleNextDay(context, alarm);
            }
        } catch (Exception ignored) {
            // Never crash the alarm path.
        }
    }

    /** Speak one Bengali text with the phone's text-to-speech voice.
        Blocks the calling (background) thread until the utterance
        finishes or 25 s pass, then shuts TTS down. Returns silently
        when TTS is unavailable or has no Bengali voice — the
        notification was already posted, so nothing is lost. */
    private void speakViaTts(Context context, String text) {
        final Object lock = new Object();
        final boolean[] done = { false };
        final TextToSpeech[] holder = new TextToSpeech[1];
        try {
            holder[0] = new TextToSpeech(context, status -> {
                if (status != TextToSpeech.SUCCESS) {
                    synchronized (lock) { done[0] = true; lock.notifyAll(); }
                    return;
                }
                TextToSpeech tts = holder[0];
                int lang = tts.setLanguage(new Locale("bn"));
                if (lang == TextToSpeech.LANG_MISSING_DATA || lang == TextToSpeech.LANG_NOT_SUPPORTED) {
                    synchronized (lock) { done[0] = true; lock.notifyAll(); }
                    return;
                }
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) {}
                    @Override public void onDone(String id) {
                        synchronized (lock) { done[0] = true; lock.notifyAll(); }
                    }
                    @Override public void onError(String id) {
                        synchronized (lock) { done[0] = true; lock.notifyAll(); }
                    }
                });
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, new Bundle(), "preazan");
            });
            synchronized (lock) {
                long deadline = System.currentTimeMillis() + 25000;
                while (!done[0]) {
                    long left = deadline - System.currentTimeMillis();
                    if (left <= 0) break;
                    lock.wait(left);
                }
            }
        } catch (Exception ignored) {
            // TTS unavailable — notification already posted.
        } finally {
            try { if (holder[0] != null) holder[0].shutdown(); } catch (Exception ignored) {}
        }
    }
}
