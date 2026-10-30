# 📱 SmartPark — Android Emulator Execution Guide

<div align="center">

[![Android](https://img.shields.io/badge/Platform-Android_14_%2F_15-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK_51-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![Gradle 8.8](https://img.shields.io/badge/Gradle-8.8-02303A?style=for-the-badge&logo=gradle&logoColor=white)](https://gradle.org)

<p align="center">
  <b>Step-by-step developer instructions for building, installing, and running the SmartPark mobile app on an Android Emulator.</b>
</p>

</div>

---

## 📌 Executive Summary & Key Concepts

| Parameter | Configuration | Notes |
|---|---|---|
| **Host Machine Backend URL** | `http://localhost:8080/api` | Spring Boot REST API |
| **Emulator Backend Alias** | `http://10.0.2.2:8080/api` | Special Android loopback to host PC |
| **Android Package Name** | `com.smartpark` | Defined in `app.json` & Gradle |
| **Gradle / Java Target** | Gradle 8.8 / JDK 21 LTS | Fully verified (`BUILD SUCCESSFUL`) |
| **Network Security** | `usesCleartextTraffic="true"` | Enabled in `AndroidManifest.xml` for local HTTP |
| **Detected AVDs** | `Pixel_10a`, `Pixel_9a`, `Medium_Phone_API_36.1` | Ready in Android Studio |

> [!IMPORTANT]
> **Understanding the `10.0.2.2` Virtual Bridge**:
> Inside an Android Emulator, `localhost` (or `127.0.0.1`) refers to **the emulator device itself**, *not* your development PC.
> To allow the Android app to communicate seamlessly with your Spring Boot backend running on your PC's port `8080`, SmartPark automatically resolves the API base URL in [frontend/src/api/client.js](file:///c:/Users/Krishna/Desktop/Honors/SmartPark/frontend/src/api/client.js#L8-L9):
> ```javascript
> const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
> export const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL || `${DEFAULT_HOST}/api`;
> ```
> No manual IP editing is required when testing on an official Android Emulator.

---

## 🛠️ Step 0: Ensure Backend & Database Are Running

Before launching the mobile app, confirm that PostgreSQL and the Spring Boot backend are active and responding.

Run from repository root:
```bash
docker compose up -d
```

Verify backend health in browser or PowerShell:
```powershell
curl http://localhost:8080/api/slots
```
*(Should return JSON with all 25 parking slots).*

---

## 🚀 Method 1: Fast One-Command CLI Launch (Recommended)

This is the fastest and most convenient method. Expo automatically compiles the native code, installs the debug APK onto your running emulator, and starts the Metro JavaScript bundler.

### Step 1: Start your Android Emulator
If an emulator is not already running, open **Android Studio** -> **Device Manager** and click the **Play (▶)** button on one of your virtual devices (e.g., `Pixel_10a`), or start it via PowerShell:

```powershell
$env:ANDROID_HOME = "C:\Users\Krishna\AppData\Local\Android\Sdk"
& "$env:ANDROID_HOME\emulator\emulator.exe" -avd Pixel_10a
```

Verify that ADB sees the emulator:
```powershell
& "$env:ANDROID_HOME\platform-tools\adb.exe" devices
```
*Expected Output:*
```
List of devices attached
emulator-5554   device
```

### Step 2: Run the App from the `frontend` folder
Open a PowerShell terminal:

```powershell
cd c:\Users\Krishna\Desktop\Honors\SmartPark\frontend

# Ensure environment variables point to your local SDK & JDK
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$env:ANDROID_HOME = "C:\Users\Krishna\AppData\Local\Android\Sdk"

# Launch native Android build & Metro bundler:
npx expo run:android
```

What happens automatically:
1. Expo detects the active `emulator-5554`.
2. Gradle builds the debug binary (`app-debug.apk`).
3. Installs the app on the emulator.
4. Starts the Metro bundler on port `8081` and connects to the app.

---

## 🎨 Method 2: Launch via Android Studio GUI

If you prefer using Android Studio's full IDE debugging, logcat inspection, and layout inspector:

### Step 1: Start the JavaScript Metro Bundler
In a standalone terminal:
```powershell
cd c:\Users\Krishna\Desktop\Honors\SmartPark\frontend
npm start
```
*Keep this terminal window open.*

### Step 2: Open the Native Project in Android Studio
1. Launch **Android Studio**.
2. Click **File -> Open...**
3. Select the `frontend/android` folder:
   ```
   C:\Users\Krishna\Desktop\Honors\SmartPark\frontend\android
   ```
4. Click **OK**.
5. Wait a few moments for Gradle to index and sync the project.

### Step 3: Run the App
1. In the top toolbar, ensure the configuration is set to **`app`**.
2. Select your emulator (e.g. `Pixel 10a` or `emulator-5554`) from the device dropdown.
3. Click the green **Run (▶)** button (or press `Shift + F10`).
4. Android Studio will compile, install, and open **SmartPark** on the emulator screen!

---

## ⚡ Method 3: Direct APK Build & Install via Gradle (Without Android Studio)

If you just want to build and install the APK directly to the emulator via terminal:

```powershell
cd c:\Users\Krishna\Desktop\Honors\SmartPark\frontend\android

$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
$env:ANDROID_HOME = "C:\Users\Krishna\AppData\Local\Android\Sdk"

# Build and install directly onto emulator:
.\gradlew.bat installDebug

# Start Metro bundler in frontend:
cd ..
npx expo start --dev-client
```

Launch the app on the emulator:
```powershell
& "$env:ANDROID_HOME\platform-tools\adb.exe" shell am start -n com.smartpark/.MainActivity
```

---

## 🕹️ Developer Controls & Shortcuts on Emulator

Once the app is running on the Android Emulator:

| Action | Shortcut / Gesture |
|---|---|
| **Reload JavaScript (Fast Refresh)** | Double-tap **`R`** in the Metro terminal, or press **`R + R`** on keyboard |
| **Open React Native Dev Menu** | Press **`Ctrl + M`** on the emulator window |
| **Inspect Network / Elements** | Dev Menu -> **Toggle Element Inspector** |
| **Clear App Storage / Reset** | `adb shell pm clear com.smartpark` |
| **Pull to Refresh** | Swipe downward on any list (Bays, Active Meters, Analytics) |

---

## 🧪 Testing Mobile Features on Emulator

1. **Dashboard Tab**:
   - Inspect live facility utilization meter and 4 stat cards.
   - Tap **"Book a Space"** quick-action button.
2. **Bays (Slots) Tab**:
   - Filter parking slots by Ground Floor, First Floor, or Second Floor.
   - Tap any green **"AVAILABLE"** slot to allocate a vehicle.
3. **Meters Tab**:
   - Watch the live elapsed timer tick second-by-second (`00h 01m 24s`).
   - Observe the 3-hour billing block progress bar filling up dynamically.
   - Tap **"Checkout & Settle Fare"** to open checkout drawer.
4. **Analytics Tab**:
   - Switch between **Today**, **Yesterday**, and **2 Days Ago** settlement chips.
   - Enter a custom date (`YYYY-MM-DD`) and tap **Filter Date**.

---

## ❓ Troubleshooting & FAQs

### Q1: `java.io.IOException: Cleartext HTTP traffic to 10.0.2.2 not permitted`
**Fix**: Android 9+ blocks cleartext HTTP by default. We have explicitly enabled cleartext traffic in [frontend/android/app/src/main/AndroidManifest.xml](file:///c:/Users/Krishna/Desktop/Honors/SmartPark/frontend/android/app/src/main/AndroidManifest.xml#L14) via `android:usesCleartextTraffic="true"`.

### Q2: Metro bundler shows "Unable to resolve module"
**Fix**: Clear the Metro bundler cache:
```powershell
cd frontend
npx expo start -c
```

### Q3: Emulator says "Could not connect to development server"
**Fix**: Ensure your host machine forwards the Metro port `8081` to the emulator:
```powershell
& "C:\Users\Krishna\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
```

### Q4: Gradle fails with `JAVA_HOME is not set`
**Fix**: Set `JAVA_HOME` in your active PowerShell session before running Gradle:
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"
```

---

## 📄 Related Documentation
- [SETUP_GUIDE.md](SETUP_GUIDE.md) — System requirements & environment setup.
- [RUN_GUIDE.md](RUN_GUIDE.md) — Comprehensive execution guide (Web & Android).
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) — Backend REST API schema.
