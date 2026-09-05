package com.farsvpn.app;

import android.content.Context;
import android.util.Log;

import com.wireguard.android.backend.Backend;
import com.wireguard.android.backend.GoBackend;
import com.wireguard.android.backend.Tunnel;
import com.wireguard.config.Config;
import com.wireguard.config.InetEndpoint;
import com.wireguard.config.InetNetwork;
import com.wireguard.config.Interface;
import com.wireguard.config.Peer;
import com.wireguard.crypto.KeyPair;

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.List;

final class WireGuardManager {
    private static final String TAG = "WireGuardManager";
    private static final String TUNNEL_NAME = "FarsVPN";

    private final Backend backend;
    private final Tunnel tunnel;
    private volatile Tunnel.State state = Tunnel.State.DOWN;

    WireGuardManager(Context context) {
        backend = new GoBackend(context.getApplicationContext());
        tunnel = new Tunnel() {
            @Override
            public String getName() {
                return TUNNEL_NAME;
            }

            @Override
            public void onStateChange(State newState) {
                state = newState;
                Log.d(TAG, "Tunnel state changed to: " + newState);
            }
        };
        
        // Recover state on initialization
        try {
            state = backend.getState(tunnel);
        } catch (Exception e) {
            Log.e(TAG, "Could not recover tunnel state", e);
        }
    }

    synchronized void connect(
            String privateKey,
            String publicKey,
            String endpoint,
            String address,
            List<String> dnsServers
    ) throws Exception {
        Config config = buildConfig(privateKey, publicKey, endpoint, address, dnsServers);
        backend.setState(tunnel, Tunnel.State.UP, config);
        state = Tunnel.State.UP;
    }

    synchronized void disconnect() throws Exception {
        try {
            backend.setState(tunnel, Tunnel.State.DOWN, null);
        } catch (Exception e) {
            Log.w(TAG, "Disconnect error (might already be down): " + e.getMessage());
        }
        state = Tunnel.State.DOWN;
    }

    boolean isConnected() {
        try {
            return backend.getState(tunnel) == Tunnel.State.UP;
        } catch (Exception e) {
            return state == Tunnel.State.UP;
        }
    }

    Tunnel.State getState() {
        try {
            return backend.getState(tunnel);
        } catch (Exception e) {
            return state;
        }
    }

    private Config buildConfig(
            String privateKey,
            String publicKey,
            String endpoint,
            String address,
            List<String> dnsServers
    ) throws Exception {
        KeyPair keyPair = new KeyPair(com.wireguard.crypto.Key.fromBase64(privateKey));

        Interface.Builder interfaceBuilder = new Interface.Builder()
                .setKeyPair(keyPair);

        if (address != null && !address.isEmpty()) {
            interfaceBuilder.addAddress(InetNetwork.parse(address));
        }

        for (String dns : dnsServers) {
            try {
                interfaceBuilder.addDnsServer(InetAddress.getByName(dns));
            } catch (Exception e) {
                Log.w(TAG, "Invalid DNS server: " + dns);
            }
        }

        Peer.Builder peerBuilder = new Peer.Builder()
                .setPublicKey(com.wireguard.crypto.Key.fromBase64(publicKey))
                .addAllowedIp(InetNetwork.parse("0.0.0.0/0"));

        if (endpoint != null && !endpoint.isEmpty()) {
            peerBuilder.setEndpoint(InetEndpoint.parse(endpoint));
        }

        return new Config.Builder()
                .setInterface(interfaceBuilder.build())
                .addPeer(peerBuilder.build())
                .build();
    }
}