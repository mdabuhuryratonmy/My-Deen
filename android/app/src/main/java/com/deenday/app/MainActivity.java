package com.deenday.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(DuroodUnlockPlugin.class);
        registerPlugin(PrayerAlarmPlugin.class);
        AlarmScheduler.ensureChannels(this);
        // Fix #44: create the unlock-durood reminder channels (one per
        // sound choice) at startup too — the receiver also creates them
        // before posting, so a reminder works even if the app was never
        // opened (e.g. after boot, the keep-alive starts from BootReceiver).
        DuroodUnlockReceiver.ensureChannels(this);
        // Fix #42: keep the app alive so the unlock durood can play —
        // the user already gave all settings and it still did not play,
        // because the system never delivers USER_PRESENT to a dead app.
        // Started only when the durood toggle is on (default ON).
        UnlockKeepAliveService.start(this);
    }
}
