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
        // Fix #45: create the unlock-durood notification channels (one
        // per sound choice) at startup too — the receiver also creates
        // them before playing, so the durood auto-plays even if the app
        // was never opened (e.g. after boot, the keep-alive starts
        // from BootReceiver).
        DuroodUnlockReceiver.ensureChannels(this);
        // Fix #42: keep the app alive so the unlock durood can
        // auto-play — the user already gave all settings and it still
        // did not play, because the system never delivers USER_PRESENT
        // to a dead app. Started only when the durood toggle is on
        // (default ON).
        UnlockKeepAliveService.start(this);
    }
}
