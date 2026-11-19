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
    }
}
