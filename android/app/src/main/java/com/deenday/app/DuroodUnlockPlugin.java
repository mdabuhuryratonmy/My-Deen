package com.deenday.app;

import android.content.Context;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Tiny bridge so the web settings toggle ("phone unlock durood", default ON)
 * can enable/disable the native unlock receiver (DuroodUnlockReceiver).
 * JS usage: Capacitor.Plugins.DuroodUnlock.setEnabled({ enabled: true })
 */
@CapacitorPlugin(name = "DuroodUnlock")
public class DuroodUnlockPlugin extends Plugin {
    @PluginMethod
    public void setEnabled(PluginCall call) {
        boolean enabled = call.getBoolean("enabled", true);
        getContext().getSharedPreferences("mydeen", Context.MODE_PRIVATE)
                .edit().putBoolean("durood_on_unlock", enabled).apply();
        // Fix #42: the keep-alive service is what makes the unlock durood
        // actually play on aggressive OEMs — start it with the toggle,
        // stop it when the user turns the durood off.
        if (enabled) UnlockKeepAliveService.start(getContext());
        else UnlockKeepAliveService.stop(getContext());
        call.resolve();
    }
}
