package com.deenday.app;

import android.Manifest;
import android.app.AlarmManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Exact prayer-time alarms (Fix #4 §5/§7) — the contract the web layer
 * (www/app.js: syncPrayerAlarms / buildPrayerAlarmList) calls:
 *
 *   scheduleAlarms({ alarms: [{id, at (epoch ms), type, title, body,
 *     sound: azan|durood|istighfar|reminder|none, prayerId}] })
 *       Stores the full list in SharedPreferences "mydeen"/"prayer_alarms"
 *       (replacing the previous list — the web layer sends the whole
 *       list on every sync) and arms each with
 *       AlarmManager.setExactAndAllowWhileIdle. Resolves
 *       {scheduled, skipped} (skipped = exact alarms not permitted on
 *       Android 12+, or a bad time).
 *   cancelAlarms({ ids: [int] }) → {cancelled}
 *   requestPermissions() → {notifications, exactAlarm} — asks for
 *     POST_NOTIFICATIONS (Android 13+) and opens the exact-alarm
 *     settings page when the grant is missing.
 *   getStatus() → {notificationsGranted, exactAlarmGranted, alarmsScheduled}
 *
 * AlarmReceiver posts the notification when an alarm fires and then
 * re-schedules the same alarm for +24h, so daily alarms keep working
 * without opening the app. BootReceiver re-arms the stored list after
 * a reboot (advancing past alarms by whole days).
 */
@CapacitorPlugin(name = "PrayerAlarm", permissions = {
        @Permission(strings = { Manifest.permission.POST_NOTIFICATIONS }, alias = "notifications")
})
public class PrayerAlarmPlugin extends Plugin {

    @PluginMethod
    public void scheduleAlarms(PluginCall call) {
        JSArray alarms = call.getArray("alarms");
        if (alarms == null) {
            call.reject("alarms array is required");
            return;
        }
        int scheduled = 0, skipped = 0;
        JSONArray next = new JSONArray();
        try {
            // Fix #39: cancel stale stored alarms that are no longer in
            // the new list — dropping them from storage alone does NOT
            // cancel their AlarmManager PendingIntents, so they kept
            // firing with old bodies (the wrong hurry text the user
            // reported came from exactly such a zombie).
            JSONArray stored = AlarmScheduler.readStored(getContext());
            for (int i = 0; i < stored.length(); i++) {
                try {
                    int oldId = stored.getJSONObject(i).optInt("id", -1);
                    if (oldId < 0) continue;
                    boolean stillListed = false;
                    for (int j = 0; j < alarms.length(); j++) {
                        if (alarms.getJSONObject(j).optInt("id", -1) == oldId) { stillListed = true; break; }
                    }
                    if (!stillListed) AlarmScheduler.cancel(getContext(), oldId);
                } catch (Exception ignored) {}
            }
            for (int i = 0; i < alarms.length(); i++) {
                JSONObject a = alarms.getJSONObject(i);
                // Fix #19: only store alarms that were actually armed —
                // before this the full list was stored even when every
                // alarm was skipped (exact alarms not permitted), so
                // getStatus().alarmsScheduled lied about the real state.
                if (AlarmScheduler.schedule(getContext(), a)) { scheduled++; next.put(a); }
                else skipped++;
            }
        } catch (Exception e) {
            call.reject("bad alarm payload");
            return;
        }
        AlarmScheduler.writeStored(getContext(), next);
        JSObject ret = new JSObject();
        ret.put("scheduled", scheduled);
        ret.put("skipped", skipped);
        call.resolve(ret);
    }

    @PluginMethod
    public void cancelAlarms(PluginCall call) {
        JSArray ids = call.getArray("ids");
        int cancelled = 0;
        JSONArray stored = AlarmScheduler.readStored(getContext());
        JSONArray kept = new JSONArray();
        try {
            for (int i = 0; i < stored.length(); i++) {
                JSONObject a = stored.getJSONObject(i);
                boolean drop = false;
                if (ids != null) {
                    for (int j = 0; j < ids.length(); j++) {
                        if (ids.getInt(j) == a.optInt("id", -1)) {
                            drop = true;
                            break;
                        }
                    }
                }
                if (drop) {
                    AlarmScheduler.cancel(getContext(), a.optInt("id", -1));
                    cancelled++;
                } else {
                    kept.put(a);
                }
            }
        } catch (Exception ignored) {}
        AlarmScheduler.writeStored(getContext(), kept);
        JSObject ret = new JSObject();
        ret.put("cancelled", cancelled);
        call.resolve(ret);
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("notificationsGranted", notificationsGranted());
        ret.put("exactAlarmGranted", exactAlarmGranted());
        ret.put("alarmsScheduled", AlarmScheduler.readStored(getContext()).length());
        // Fix #25: battery exemption (Doze) decides whether alarms ring
        // while the phone sleeps.
        ret.put("batteryExempt", batteryExempt());
        call.resolve(ret);
    }

    /**
     * Fix #25 — first-launch onboarding: one step at a time, each with a
     * Bengali explanation in the app. "notifications" asks the runtime
     * permission only (in-app dialog); "exact" opens the exact-alarm
     * Settings page directly; "battery" asks the system battery-exemption
     * dialog; "autostart" opens MIUI's autostart page (or the app's
     * Settings page on other phones). Android does not let any app grant
     * exact alarms or autostart itself — the app opens the exact page so
     * the user only flips one switch, never digs through Settings.
     */
    @PluginMethod
    public void requestStep(PluginCall call) {
        String step = call.getString("step", "");
        if ("notifications".equals(step)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                    && getPermissionState("notifications") != PermissionState.GRANTED) {
                requestPermissionForAlias("notifications", call, "notificationsOnlyCallback");
                return;
            }
            JSObject ret = new JSObject();
            ret.put("granted", notificationsGranted());
            call.resolve(ret);
            return;
        }
        if ("exact".equals(step)) {
            openExactAlarmSettingsIfNeeded();
            JSObject ret = new JSObject();
            ret.put("opened", !exactAlarmGranted());
            call.resolve(ret);
            return;
        }
        if ("battery".equals(step)) {
            if (!batteryExempt()) {
                try {
                    Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(intent);
                } catch (Exception ignored) {}
            }
            JSObject ret = new JSObject();
            ret.put("opened", !batteryExempt());
            call.resolve(ret);
            return;
        }
        if ("autostart".equals(step)) {
            openAutostartSettings();
            JSObject ret = new JSObject();
            ret.put("opened", true);
            call.resolve(ret);
            return;
        }
        call.reject("unknown step");
    }

    @PermissionCallback
    private void notificationsOnlyCallback(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", notificationsGranted());
        call.resolve(ret);
    }

    private boolean batteryExempt() {
        try {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            return pm == null || pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
        } catch (Exception e) {
            return false;
        }
    }

    /** MIUI autostart page (Xiaomi/HyperOS); falls back to the app's
        Settings page on other phones. Autostart cannot be detected
        programmatically, so the app asks the user to confirm. */
    private void openAutostartSettings() {
        try {
            Intent intent = new Intent();
            intent.setComponent(new android.content.ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.autostart.AutoStartManagementActivity"));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            return;
        } catch (Exception ignored) {}
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        } catch (Exception ignored) {}
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU
                && getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "notificationsCallback");
            return;
        }
        openExactAlarmSettingsIfNeeded();
        resolvePermissionStatus(call);
    }

    @PermissionCallback
    private void notificationsCallback(PluginCall call) {
        openExactAlarmSettingsIfNeeded();
        resolvePermissionStatus(call);
    }

    private boolean notificationsGranted() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return true;
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED;
    }

    private boolean exactAlarmGranted() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return true;
        AlarmManager am = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
        return am == null || am.canScheduleExactAlarms();
    }

    /** Exact alarms (Android 12+) are granted on a Settings page, not by
        a runtime prompt — open it so the user can switch it on. */
    private void openExactAlarmSettingsIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !exactAlarmGranted()) {
            try {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            } catch (Exception ignored) {}
        }
    }

    private void resolvePermissionStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("notifications", notificationsGranted());
        ret.put("exactAlarm", exactAlarmGranted());
        call.resolve(ret);
    }
}
