package com.deenday.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Re-arms the stored exact prayer-time alarms after a phone reboot
 * (Fix #4 §5). Alarms whose time already passed while the phone was off
 * are advanced by whole days so they fire at the next correct time —
 * the system heals itself even if the app is never opened.
 */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
        try {
            JSONArray stored = AlarmScheduler.readStored(context);
            JSONArray updated = new JSONArray();
            long now = System.currentTimeMillis();
            for (int i = 0; i < stored.length(); i++) {
                JSONObject a = stored.getJSONObject(i);
                long at = a.optLong("at", 0);
                if (at <= 0) continue;
                while (at <= now) at += 86400000L;
                a.put("at", at);
                updated.put(a);
                AlarmScheduler.schedule(context, a);
            }
            AlarmScheduler.writeStored(context, updated);
        } catch (Exception ignored) {
            // Never crash the boot path.
        }
    }
}
