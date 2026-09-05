# FarsVPN handoff guide

## Current status

FarsVPN includes a Capacitor Android app using the official WireGuard Android tunnel SDK. The native connection manager selects one of two WireGuard bridge profiles and handles Android VPN permission, connect, disconnect, and status reporting.

An APK is not included. Build it from the `android/` project on a computer with Android Studio and the Android SDK installed.

## Included features

- FarsVPN web interface with English and Persian language support
- Email, Google, and guest entry screens
- WireGuard server selection for FarsVpn1 and FarsVpn2
- Connection timer and connection history screens
- Admin server management screens
- Capacitor Android project
- Android VPN permission flow through the official WireGuard backend
- Native WireGuard connect, disconnect, and status methods

## Build on an Android computer

1. Install Android Studio with Android SDK Platform 36 and a JDK 17 or newer.
2. Install Node.js 20 or newer.
3. Run `npm install` in the project folder.
4. Run `npm run build`.
5. Run `npx cap sync android`.
6. Open the `android/` folder in Android Studio and allow Gradle to sync.
7. Build a debug APK from **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

The command-line alternative is:

```bash
cd android
./gradlew assembleDebug
```

The APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.

## WireGuard profiles

- FarsVpn1 uses `138.124.10.159:51820` and client address `10.0.0.2/32`.
- FarsVpn2 uses `138.124.10.159:51821` and client address `10.0.1.2/32`.
- Both use DNS `1.1.1.1` and `8.8.8.8` and route IPv4 and IPv6 traffic through the peer.

## Validation checklist

Test on a physical Android device:

- Select a language, accept the terms, and sign in or continue as guest.
- Select both server entries and confirm the correct VPN permission prompt appears.
- Confirm the Android VPN key icon and ongoing notification appear after connecting.
- Confirm internet traffic flows through the selected WireGuard node.
- Confirm disconnect removes the VPN key icon and notification.
- Confirm the app never shows protected status while disconnected.

## Configuration before publishing

- Add the Firebase Web client ID for native Google Sign-In.
- Register the Android package name `com.farsvpn.app` and signing certificate SHA-1 in Firebase.
- Replace the test AdMob application and rewarded-ad IDs with production IDs.
- Verify the bridge server's WireGuard forwarding, NAT, peer keys, and UDP ports before distributing the APK.
