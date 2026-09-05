# FarsVPN Android build guide

This project uses the official WireGuard Android tunnel SDK. There is no Xray core, custom JNI library, tun2socks layer, or native library to download.

## 1. Install the required tools

Install Android Studio with:

- Android SDK Platform 36
- Android SDK Build-Tools
- Android SDK Command-line Tools
- JDK 17 or newer

Install Node.js 20 or newer for the web build.

## 2. Prepare the project

1. Download the latest project archive and unzip it.
2. Open a terminal in the project folder.
3. Install the web dependencies:

```bash
npm install
```

4. Build the web app:

```bash
npm run build
```

5. Sync the built web app into Android:

```bash
npx cap sync android
```

The Android project already includes the WireGuard SDK dependency and the native WireGuard manager.

## 3. Configure Google Sign-In

Before building, add the Web client ID from the same Firebase project to:

```text
android/app/src/main/res/values/strings.xml
```

Set the value of `google_web_client_id`. The Firebase Android app must use package name `com.farsvpn.app`, and the signing certificate SHA-1 must be registered in Firebase.

## 4. Configure production ads

The project currently uses Google's test AdMob application and rewarded-ad IDs. Replace the test IDs in the Android manifest and the rewarded-ad call before publishing. A production AdMob account and valid ad IDs are required for live ads.

## 5. Build the APK

Open the `android/` folder in Android Studio, wait for Gradle sync, then choose **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

Or build from a terminal:

```bash
cd android
./gradlew assembleDebug
```

On Windows, use `gradlew.bat assembleDebug` instead.

The debug APK is created at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 6. Test the VPN connection

1. Install the debug APK on an Android phone.
2. Open FarsVPN, select a language, accept the terms, and sign in or continue as guest.
3. Select FarsVpn1 or FarsVpn2.
4. Tap **Connect** and allow the Android VPN permission request.
5. Confirm the VPN key icon and ongoing FarsVPN notification appear.
6. Confirm internet traffic flows through the selected WireGuard node.
7. Tap **Disconnect** and confirm the VPN key icon and notification disappear.

## WireGuard node profiles

The native manager selects the profile from the server ID sent by the web app:

| Server | Bridge endpoint | Client address |
| --- | --- | --- |
| FarsVpn1 | `138.124.10.159:51820` | `10.0.0.2/32` |
| FarsVpn2 | `138.124.10.159:51821` | `10.0.1.2/32` |

Both profiles use DNS `1.1.1.1` and `8.8.8.8`, and route IPv4 and IPv6 traffic through the WireGuard peer.

## Troubleshooting

**Gradle cannot resolve the WireGuard dependency**

Confirm the computer is online and that the Android project has access to Google's Maven repository and Maven Central. Then sync the project again in Android Studio.

**VPN permission does not appear**

Uninstall the previous app version and install the new APK. Android may retain VPN approval between upgrades.

**Connection starts but traffic does not flow**

Verify the bridge server's WireGuard forwarding and NAT rules, the peer public key, and that UDP ports 51820 and 51821 are reachable from the phone's network.

**Google Sign-In fails**

Verify the Web client ID, Firebase Android package name, and SHA-1 fingerprint match the certificate used to sign the APK.
