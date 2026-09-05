package com.farsvpn.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FarsVpnPlugin.class);
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }
}