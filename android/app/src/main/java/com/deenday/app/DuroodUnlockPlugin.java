package com.deenday.app;

import android.app.ActivityManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.pm.PackageManager;
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

    /**
     * Fix #56: the unlock-durood diagnostic status for Settings — every
     * value is REAL state, never hardcoded:
     *  - toggleOn: the native "durood_on_unlock" pref — the exact value
     *    DuroodUnlockReceiver checks before playing.
     *  - receiverEnabled: DuroodUnlockReceiver is registered in the
     *    manifest AND not disabled (PackageManager state).
     *  - keepAliveRunning: UnlockKeepAliveService is actually running
     *    right now (Fix #57: the delay suspect — a dead keep-alive
     *    means every unlock cold-starts the app).
     *  - lastUnlockPlay / lastUnlockAttempt: epoch ms (0 = never) of
     *    the last unlock play that actually started / was attempted.
     */
    @PluginMethod
    public void getUnlockStatus(PluginCall call) {
        Context ctx = getContext();
        JSObject r = new JSObject();
        r.put("toggleOn", UnlockKeepAliveService.isEnabled(ctx));
        r.put("receiverEnabled", isReceiverEnabled(ctx));
        r.put("keepAliveRunning", isKeepAliveRunning(ctx));
        r.put("lastUnlockPlay", DuroodUnlockReceiver.getLastUnlockPlay(ctx));
        r.put("lastUnlockAttempt", DuroodUnlockReceiver.getLastUnlockAttempt(ctx));
        call.resolve(r);
    }

    /** Fix #56: "দুরুদ পরীক্ষা করুন" — play the durood immediately
     * through the SAME DuroodPlayer.playOnce() the unlock path uses,
     * on a background thread (playOnce blocks until the clip finishes,
     * 10 s cap). Resolves { played: true } only when playback actually
     * started. Does NOT touch the unlock timestamps — a test play is
     * not an unlock play (the count still increments: a durood played
     * is a durood played). */
    @PluginMethod
    public void playTest(PluginCall call) {
        final Context ctx = getContext();
        new Thread(() -> {
            boolean played = false;
            try { played = DuroodPlayer.playOnce(ctx); } catch (Exception ignored) {}
            JSObject r = new JSObject();
            r.put("played", played);
            call.resolve(r);
        }).start();
    }

    /** True when the manifest-registered DuroodUnlockReceiver exists
     * and is not disabled (DEFAULT or ENABLED state). */
    public static boolean isReceiverEnabled(Context ctx) {
        try {
            ComponentName cn = new ComponentName(ctx, DuroodUnlockReceiver.class);
            PackageManager pm = ctx.getPackageManager();
            pm.getReceiverInfo(cn, 0); // throws if not registered
            int state = pm.getComponentEnabledSetting(cn);
            return state != PackageManager.COMPONENT_ENABLED_STATE_DISABLED
                    && state != PackageManager.COMPONENT_ENABLED_STATE_DISABLED_USER;
        } catch (Exception e) {
            return false;
        }
    }

    /** True when the app's own UnlockKeepAliveService is running now
     * (getRunningServices reports only the caller's own services on
     * API 26+, which is exactly what is needed here). */
    public static boolean isKeepAliveRunning(Context ctx) {
        try {
            ActivityManager am = (ActivityManager) ctx.getSystemService(Context.ACTIVITY_SERVICE);
            if (am == null) return false;
            for (ActivityManager.RunningServiceInfo s : am.getRunningServices(Integer.MAX_VALUE)) {
                if (UnlockKeepAliveService.class.getName().equals(s.service.getClassName())) return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
