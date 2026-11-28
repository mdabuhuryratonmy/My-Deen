package com.deenday.app;

import android.content.Context;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Tiny bridge so the web settings can control the native unlock durood
 * (DuroodUnlockReceiver auto-plays it on unlock, DuroodPlayReceiver
 * replays it from the ✅ button).
 * JS usage: Capacitor.Plugins.DuroodUnlock.setEnabled({ enabled: true })
 * Fix #44: setReminderSound({ sound: "reminder" | "istighfar" | "silent" })
 * picks the reminder notification's sound; getDuroodStats() returns
 * { total, today } — how many duroods have been played.
 */
@CapacitorPlugin(name = "DuroodUnlock")
public class DuroodUnlockPlugin extends Plugin {
    @PluginMethod
    public void setEnabled(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", true);
        getContext().getSharedPreferences("mydeen", Context.MODE_PRIVATE)
                .edit().putBoolean("durood_on_unlock", enabled).apply();
        // Fix #42: the keep-alive service is what makes the unlock durood
        // auto-play actually happen on aggressive OEMs — start it with
        // the toggle, stop it when the user turns auto-play off.
        if (enabled) UnlockKeepAliveService.start(getContext());
        else UnlockKeepAliveService.stop(getContext());
        call.resolve();
    }

    /** Fix #44: the reminder notification's sound ("reminder" =
        res/raw/reminder.mp3, "istighfar" = res/raw/istighfar.mp3,
        "silent" = no sound). Stored in SharedPreferences; the receiver
        picks the matching notification channel. */
    @PluginMethod
    public void setReminderSound(PluginCall call) {
        String sound = call.getString("sound", "reminder");
        if (!"reminder".equals(sound) && !"istighfar".equals(sound) && !"silent".equals(sound)) sound = "reminder";
        getContext().getSharedPreferences("mydeen", Context.MODE_PRIVATE)
                .edit().putString(DuroodUnlockReceiver.KEY_REMIND_SOUND, sound).apply();
        call.resolve();
    }

    /** Fix #44: how many duroods have been played — today + all time. */
    @PluginMethod
    public void getDuroodStats(PluginCall call) {
        JSObject r = new JSObject();
        r.put("total", DuroodUnlockReceiver.getTotalCount(getContext()));
        r.put("today", DuroodUnlockReceiver.getTodayCount(getContext()));
        call.resolve(r);
    }
}
