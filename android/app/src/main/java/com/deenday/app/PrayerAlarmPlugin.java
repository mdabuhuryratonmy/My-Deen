package com.deenday.app;

import android.Manifest;
import android.app.AlarmManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
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
        call.resolve(ret);
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
