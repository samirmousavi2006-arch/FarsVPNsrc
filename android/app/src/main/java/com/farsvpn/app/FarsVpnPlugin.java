package com.farsvpn.app;

import android.app.Activity;
import android.content.Intent;
import android.net.VpnService;
import android.util.Log;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

import org.json.JSONArray;
import org.json.JSONException;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "FarsVpn")
public class FarsVpnPlugin extends Plugin {
    private static final String TAG = "FarsVpnPlugin";
    private WireGuardManager wireGuardManager;

    @Override
    public void load() {
        super.load();
        Log.i(TAG, "FarsVpnPlugin LOADED AND REGISTERED");
        wireGuardManager = new WireGuardManager(getContext());
    }

    @PluginMethod
    public void prepareVpn(PluginCall call) {
        Log.e(TAG, "prepareVpn called - SYSTEM PERMISSION REQUEST");
        try {
            Intent permissionIntent = VpnService.prepare(getContext());
            if (permissionIntent != null) {
                startActivityForResult(call, permissionIntent, "prepareVpnResult");
            } else {
                JSObject result = new JSObject();
                result.put("prepared", true);
                call.resolve(result);
            }
        } catch (Exception e) {
            call.reject(e.getLocalizedMessage());
        }
    }

    @ActivityCallback
    private void prepareVpnResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() != Activity.RESULT_OK) {
            call.reject("VPN permission was denied by the user");
            return;
        }
        JSObject response = new JSObject();
        response.put("prepared", true);
        call.resolve(response);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        Log.e(TAG, "connect called - STARTING TUNNEL");
        try {
            connectTunnel(call);
        } catch (Exception e) {
            call.reject(e.getLocalizedMessage());
        }
    }

    @ActivityCallback
    private void vpnPermissionResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() != Activity.RESULT_OK) {
            call.reject("VPN permission was not granted");
            return;
        }
        connectTunnel(call);
    }

    private void connectTunnel(PluginCall call) {
        try {
            // Check if VPN permission is granted before connecting
            if (VpnService.prepare(getContext()) != null) {
                call.reject("VPN permission not granted. Please call prepareVpn first.");
                return;
            }

            String privateKey = call.getString("privateKey");
            String publicKey = call.getString("publicKey");
            String endpoint = call.getString("endpoint");
            String address = call.getString("address");
            JSArray dnsArray = call.getArray("dns", new JSArray());
            
            List<String> dnsList = new ArrayList<>();
            for (int i = 0; i < dnsArray.length(); i++) {
                dnsList.add(dnsArray.getString(i));
            }

            if (privateKey == null || publicKey == null) {
                call.reject("WireGuard configuration is missing keys");
                return;
            }

            Log.d(TAG, "Connecting Tunnel with config: " +
                    "Address=" + address +
                    ", Endpoint=" + endpoint +
                    ", DNS=" + dnsList +
                    ", PrivateKey=" + privateKey.substring(0, 4) + "..." +
                    ", PublicKey=" + publicKey);

            wireGuardManager.connect(privateKey, publicKey, endpoint, address, dnsList);
            JSObject result = new JSObject();
            result.put("connected", true);
            call.resolve(result);
        } catch (Exception error) {
            Log.e(TAG, "Failed to start WireGuard tunnel: " + error.getMessage(), error);
            call.reject("Could not start WireGuard connection: " + error.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        try {
            wireGuardManager.disconnect();
            JSObject result = new JSObject();
            result.put("disconnected", true);
            call.resolve(result);
        } catch (Exception error) {
            Log.e(TAG, "Failed to stop WireGuard tunnel: " + error.getMessage(), error);
            call.reject("Could not stop WireGuard connection: " + error.getLocalizedMessage());
        }
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("connected", wireGuardManager.isConnected());
        call.resolve(result);
    }

    @PluginMethod
    public void checkStatus(PluginCall call) {
        try {
            JSObject result = new JSObject();
            result.put("connected", wireGuardManager.isConnected());
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to check status: " + e.getMessage());
        }
    }

    @PluginMethod
    public void ping(PluginCall call) {
        String host = call.getString("host");
        Integer timeout = call.getInt("timeout", 2000);

        if (host == null) {
            call.reject("Ping host is required");
            return;
        }

        final String finalHost = host.contains(":") ? host.split(":")[0] : host;
        final int finalTimeout = timeout != null ? timeout : 2000;

        new Thread(() -> {
            // Try TCP socket connection to port 80 or 443 to measure real network latency
            long startedAt = System.currentTimeMillis();
            boolean success = false;
            long latency = -1;

            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(finalHost, 80), finalTimeout);
                latency = System.currentTimeMillis() - startedAt;
                success = true;
            } catch (Exception e1) {
                // Fallback to port 443
                try (Socket socket = new Socket()) {
                    long start443 = System.currentTimeMillis();
                    socket.connect(new InetSocketAddress(finalHost, 443), finalTimeout);
                    latency = System.currentTimeMillis() - start443;
                    success = true;
                } catch (Exception e2) {
                    // Fallback to system ping command
                    try {
                        long startPing = System.currentTimeMillis();
                        Process process = Runtime.getRuntime().exec("/system/bin/ping -c 1 -w 2 " + finalHost);
                        int exitCode = process.waitFor();
                        if (exitCode == 0) {
                            latency = System.currentTimeMillis() - startPing;
                            success = true;
                        }
                    } catch (Exception e3) {
                        // ignore
                    }
                }
            }

            if (success && latency > 0) {
                JSObject result = new JSObject();
                result.put("latency", latency);
                call.resolve(result);
            } else {
                call.reject("Unreachable");
            }
        }).start();
    }

    @PluginMethod
    public void googleSignIn(PluginCall call) {
        String googleWebClientId = "";
        try {
            googleWebClientId = getContext().getString(com.farsvpn.app.R.string.google_web_client_id).trim();
        } catch (Exception e) {
            call.reject("Missing google_web_client_id in strings.xml");
            return;
        }

        if (googleWebClientId.isEmpty()) {
            call.reject("Native Google Sign-In is not configured with a Web client ID");
            return;
        }

        GoogleSignInOptions options = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(googleWebClientId)
                .requestEmail()
                .build();
        GoogleSignInClient client = GoogleSignIn.getClient(getActivity(), options);
        startActivityForResult(call, client.getSignInIntent(), "googleSignInResult");
    }

    @ActivityCallback
    private void googleSignInResult(PluginCall call, ActivityResult result) {
        if (result == null || result.getResultCode() != Activity.RESULT_OK || result.getData() == null) {
            call.reject("Google sign-in was cancelled");
            return;
        }

        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(result.getData());
        try {
            GoogleSignInAccount account = task.getResult(ApiException.class);
            if (account == null || account.getIdToken() == null) {
                call.reject("Google did not return an ID token");
                return;
            }
            JSObject response = new JSObject();
            response.put("idToken", account.getIdToken());
            call.resolve(response);
        } catch (ApiException error) {
            Log.e(TAG, "Google Sign-In API exception: " + error.getStatusCode(), error);
            call.reject("Google sign-in failed with status code: " + error.getStatusCode());
        }
    }
}
