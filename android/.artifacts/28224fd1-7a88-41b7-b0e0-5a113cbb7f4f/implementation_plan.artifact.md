# Implementation Plan - Modernizing FarsVPN Architecture and Fixes

This plan addresses architectural mismatches, hardcoded configurations, and Android compatibility issues found in the FarsVPN project.

## User Review Required

> [!IMPORTANT]
> **WireGuard Configuration Change**: I am shifting the server configuration logic from hardcoded native values to dynamic values passed from the frontend. This means the Firestore database structure for `servers` must be updated to include WireGuard fields (Private Key, Public Key, Endpoint, etc.).

> [!WARNING]
> **SDK Downgrade**: I will downgrade the `compileSdkVersion` from 36 to 35. SDK 36 is not yet stable for production release.

## Proposed Changes

### Android Project Configuration

#### [MODIFY] [variables.gradle](file:///C:/FrssVpn/android/variables.gradle)
- Update `compileSdkVersion` and `targetSdkVersion` to 35.
- Ensure all AndroidX dependencies are at stable versions.

#### [MODIFY] [AndroidManifest.xml](file:///C:/FrssVpn/android/app/src/main/AndroidManifest.xml)
- Add `android:foregroundServiceType="specialUse"` to the `VpnService` declaration.
- Add `<property android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE" android:value="vpn"/>` to comply with Android 14+ FGS requirements.

#### [MODIFY] [MainActivity.java](file:///C:/FrssVpn/android/app/src/main/java/com/farsvpn/app/MainActivity.java)
- Integrate `androidx.core.splashscreen.SplashScreen` to fix the blank screen on startup.

---

### Native VPN Logic (WireGuard)

#### [MODIFY] [WireGuardManager.java](file:///C:/FrssVpn/android/app/src/main/java/com/farsvpn/app/WireGuardManager.java)
- Remove hardcoded keys and endpoints.
- Update `connect` and `buildConfig` to accept dynamic parameters: `privateKey`, `publicKey`, `endpoint`, `address`, and `dns`.

#### [MODIFY] [FarsVpnPlugin.java](file:///C:/FrssVpn/android/app/src/main/java/com/farsvpn/app/FarsVpnPlugin.java)
- Update `connect` method to extract the full WireGuard configuration from the `PluginCall`.
- Improve `ping` reliability by using a Socket connection instead of `isReachable`.

---

### Frontend & Data Model

#### [MODIFY] [translations.ts](file:///C:/FrssVpn/src/i18n/translations.ts)
- Update `ServerNode` interface to replace `VlessConfig` with a generic `VpnConfig` that supports WireGuard fields.
- Update `DEFAULT_SERVERS` with the necessary WireGuard configuration.

#### [MODIFY] [AppContext.tsx](file:///C:/FrssVpn/src/context/AppContext.tsx)
- Update `connect` function to pass the entire server configuration object to the native layer.

## Verification Plan

### Automated Tests
- Run `./gradlew assembleDebug` to ensure the project builds with the updated SDK and dependencies.

### Manual Verification
- **VPN Connection**: Verify the app successfully connects to a VPN node using the new dynamic configuration.
- **Google Sign-In**: Verify the app handles missing Client ID gracefully.
- **Ping**: Check the dashboard to ensure latency is reported accurately for all servers.
- **Splash Screen**: Observe the splash screen animation during app launch.
