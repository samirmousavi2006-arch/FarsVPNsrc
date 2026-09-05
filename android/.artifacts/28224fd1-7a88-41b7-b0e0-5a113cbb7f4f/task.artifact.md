# TODO List - FarsVPN Modernization

- [ ] Android Project Configuration
    - [ ] Update `variables.gradle` (SDK 35)
    - [ ] Update `AndroidManifest.xml` (FGS types)
    - [ ] Update `MainActivity.java` (Splash Screen)
- [ ] Native VPN Logic
    - [ ] Refactor `WireGuardManager.java` for dynamic config
    - [ ] Update `FarsVpnPlugin.java` (Dynamic connect & Socket Ping)
- [ ] Frontend & Data Model
    - [ ] Update `translations.ts` (VPN interfaces)
    - [ ] Update `AppContext.tsx` (Bridge integration)
- [ ] Verification
    - [ ] Run Gradle Build
    - [ ] Verify Splash Screen
    - [ ] Verify Ping & Connection
