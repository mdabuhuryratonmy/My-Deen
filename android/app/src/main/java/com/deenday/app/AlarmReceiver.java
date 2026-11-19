package com.deenday.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import org.json.JSONObject;

/**
 * Fires when an exact prayer-time alarm goes off: posts the notification
 * on the channel for the alarm type, then re-schedules the same alarm
 * for +24h so daily alarms keep working without opening the app.
 * Never crashes the alarm path.
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
            // Daily alarm → same time tomorrow (based on the original
            // fire time, so a late delivery cannot drift the schedule).
            JSONObject alarm = new JSONObject();
            alarm.put("id", id);
            alarm.put("type", type);
            alarm.put("title", title);
            alarm.put("body", body);
            alarm.put("sound", intent.getStringExtra("sound"));
            alarm.put("prayerId", intent.getStringExtra("prayerId"));
            long at = intent.getLongExtra("at", 0);
            if (at > 0) {
                alarm.put("at", at);
                AlarmScheduler.rescheduleNextDay(context, alarm);
            }
        } catch (Exception ignored) {
            // Never crash the alarm path.
        }
    }
}
