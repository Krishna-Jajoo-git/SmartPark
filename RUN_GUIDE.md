# SmartPark Execution & Run Guide

This guide provides dedicated, step-by-step instructions to run the **SmartPark** project across both target platforms:
1. **Web Browser** (via Expo Web or Docker)
2. **Android Emulator in Android Studio** (via Android Studio Native Runner or Expo CLI)

---

## 📋 Table of Contents
- [0. System Architecture & Prerequisites](#0-system-architecture--prerequisites)
- [1. Backend & Database Setup (Required for Both)](#1-backend--database-setup-required-for-both)
- [2. Track 1: Running on the Web](#2-track-1-running-on-the-web)
  - [Method 1A: Expo Web Development Server (Recommended for Dev)](#method-1a-expo-web-development-server-recommended-for-dev)
  - [Method 1B: Full Docker Compose Production Stack](#method-1b-full-docker-compose-production-stack)
- [3. Track 2: Running on Android Emulator via Android Studio](#3-track-2-running-on-android-emulator-via-android-studio)
  - [3.1 Prerequisites & SDK Setup](#31-prerequisites--sdk-setup)
  - [3.2 Setting Up the Android Virtual Device (AVD)](#32-setting-up-the-android-virtual-device-avd)
  - [3.3 Understanding the Android Emulator Network Bridge (10.0.2.2)](#33-understanding-the-android-emulator-network-bridge-10022)
  - [3.4 Method 2A: Launching Directly from Android Studio (Recommended)](#34-method-2a-launching-directly-from-android-studio-recommended)
  - [3.5 Method 2B: Launching via Expo CLI (`run:android`)](#35-method-2b-launching-via-expo-cli-runandroid)
- [4. Comparison Summary: Web vs. Android Emulator](#4-comparison-summary-web-vs-android-emulator)
- [5. Troubleshooting & FAQs](#5-troubleshooting--faqs)

---

## 0. System Architecture & Prerequisites

SmartPark consists of:
- **Database**: PostgreSQL (Port `5432` natively, or `5433` via Docker)
- **Backend API**: Spring Boot 3.3.4 / Java 21 (Port `8080`)
- **Frontend App**: React Native (Expo SDK 51) running on:
  - **Web**: Accesses API at `http://localhost:8080/api`
  - **Android Emulator**: Accesses API at `http://10.0.2.2:8080/api`

### System Requirements:
- **Node.js**: v18+ or v20+ (`node -v`) and `npm`
- **Java Development Kit**: JDK 21 LTS (`java -version`)
- **Docker Desktop** (optional but recommended for zero-config PostgreSQL)
- **Android Studio** (Hedgehog, Iguana, Jellyfish, or newer) for Android Emulator testing

---

## 1. Backend & Database Setup (Required for Both)

Before starting either the Web or Android frontend, ensure the database and backend REST services are active.

### Option A: Start Database in Docker + Run Backend Locally (Fastest Development)

1. **Start PostgreSQL 16 container**:
   ```powershell
   # Run from repository root
   docker compose up postgres -d
   ```
   *(Verify container is healthy: `docker ps`)*

2. **Start Spring Boot Backend**:
   ```powershell
   cd backend

   # Ensure JAVA_HOME points to your JDK 21 (adjust path if needed)
   $env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"

   # Launch Spring Boot with Maven Wrapper
   .\mvnw.cmd spring-boot:run
   ```
   *(On macOS / Linux: `./mvnw spring-boot:run`)*

3. **Verify Backend Status**:
   - Open your browser at: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
   - Ensure the 25 parking slots were seeded: [http://localhost:8080/api/slots](http://localhost:8080/api/slots)

---

## 2. Track 1: Running on the Web

The Web version allows instant UI testing and responsive layout inspection directly inside Google Chrome, Microsoft Edge, or Mozilla Firefox.

### Method 1A: Expo Web Development Server (Recommended for Dev)

1. **Open a new terminal window** and navigate to the `frontend` folder:
   ```powershell
   cd frontend
   ```

2. **Install frontend dependencies** (if not already done):
   ```powershell
   npm install --legacy-peer-deps
   ```

3. **Start the Expo Web bundler**:
   ```powershell
   npm run web
   ```
   *Alternatively, run:*
   ```powershell
   npx expo start --web
   ```

4. **Access the Application**:
   - The Expo CLI will automatically compile the bundle and open your default browser.
   - If it does not open automatically, visit: **[http://localhost:8081](http://localhost:8081)** (or the URL displayed in your terminal).
   - Hot reloading is enabled by default: any changes in `src/screens` or `src/components` update in real time.

> **How Web API Routing Works:**  
> The web client connects to `http://localhost:8080/api` through `frontend/src/api/client.js`. Since the browser and backend run on the same physical machine, `localhost` resolves directly.

---

### Method 1B: Full Docker Compose Production Stack

If you want to run the entire system (Database + Backend + Nginx Web Server) without having Node or Java installed locally:

1. **Build and run all containers**:
   ```powershell
   # Run from repository root
   docker compose up --build
   ```

2. **Access URLs**:
   - **Web App**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
   - **Swagger Docs**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

3. **To stop**:
   ```powershell
   docker compose down
   ```

---

## 3. Track 2: Running on Android Emulator via Android Studio

Running inside an Android Virtual Device (AVD) tests the real touch interactions, safe-area insets, native status bar, and mobile navigation flow.

### 3.1 Prerequisites & SDK Setup

1. **Install Android Studio**:
   - Download and install Android Studio from [developer.android.com](https://developer.android.com/studio).

2. **Verify Android SDK & Command Line Tools**:
   - Open Android Studio -> **Settings / Preferences** (or `Customize` on the Welcome screen).
   - Go to **Languages & Frameworks > Android SDK**.
   - Under **SDK Platforms**, ensure **Android 14.0 ("UpsideDownCake") / API Level 34** or **Android 13.0 / API Level 33** is checked.
   - Under **SDK Tools**, ensure the following are installed:
     - `Android SDK Build-Tools 34.0.0`
     - `Android SDK Platform-Tools`
     - `Android Emulator`

3. **Set Environment Variables (Windows)**:
   Add `ANDROID_HOME` to your User/System variables:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`
   - Add to `Path`: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\emulator`

4. **Verify `local.properties`**:
   The project includes `frontend/android/local.properties`. Ensure it points to your local SDK:
   ```properties
   sdk.dir=C\:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk
   ```

---

### 3.2 Setting Up the Android Virtual Device (AVD)

1. In Android Studio, open the **Virtual Device Manager**:
   - Welcome Screen: Click **More Actions** -> **Virtual Device Manager**.
   - Within an open project: Click the device dropdown in the top toolbar -> **Device Manager** (or **Tools -> Device Manager**).
2. Click **Create Device** (or the **+** button).
3. Select **Phone** -> Choose **Pixel 7** or **Pixel 8** (devices with Google Play icon recommended) -> Click **Next**.
4. Select a System Image:
   - Choose **API 34** (UpsideDownCake) or **API 33** (Tiramisu) with ABI `x86_64`.
   - Click **Download** if not downloaded yet -> Click **Next**.
5. Keep default settings and click **Finish**.
6. **Launch the Emulator**:
   - In the Device Manager list, click the **Play (▶)** button next to your virtual device.
   - Wait until the emulator boots up to the Android home screen.

---

### 3.3 Understanding the Android Emulator Network Bridge (10.0.2.2)

> [!IMPORTANT]
> In an Android Emulator, `localhost` or `127.0.0.1` refers to **the emulator device itself**, NOT your computer!  
> To access services running on your computer's `localhost` (such as our Spring Boot backend on port 8080), Android provides a special alias IP:
> 
> $$\mathbf{10.0.2.2} \iff \text{Host Machine Localhost}$$

SmartPark is already configured for this! In [frontend/src/api/client.js](file:///c:/Users/Krishna/Desktop/Honors/SmartPark/frontend/src/api/client.js#L8-L9):
```javascript
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
export const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL || `${DEFAULT_HOST}/api`;
```
**No manual IP configuration is needed** when using standard Android Studio emulators.

---

### 3.4 Method 2A: Launching Directly from Android Studio (Recommended)

This method uses Android Studio's native Gradle build engine.

#### Step 1: Start the JavaScript Metro Bundler
Open a terminal in the `frontend` folder:
```powershell
cd frontend
npm start
```
*Leave this terminal running. It serves the JavaScript bundle to your app.*

#### Step 2: Open the Android Project in Android Studio
1. Launch **Android Studio**.
2. Click **File -> Open...**
3. Navigate to and select the `frontend/android` folder:
   ```
   C:\Users\<YourUsername>\Desktop\Honors\SmartPark\frontend\android
   ```
4. Click **OK**.
5. Allow Android Studio and Gradle to sync (view the progress bar in the bottom right corner).

#### Step 3: Run the App
1. In the top toolbar, ensure the run configuration is set to **app**.
2. In the device selector dropdown, choose your running emulator (e.g., `Pixel 7 API 34`).
3. Click the green **Run (▶)** button (or press `Shift + F10`).
4. Android Studio will:
   - Compile the native Android binary (`app-debug.apk`).
   - Install the APK onto the emulator.
   - Launch `com.SmartPark`.
   - Connect to the running Metro bundler on port `8081`.
5. You can now use SmartPark on the emulator!

---

### 3.5 Method 2B: Launching via Expo CLI (`run:android`)

If you prefer launching from the command line while your Android Studio emulator is running:

1. **Launch your emulator** from Android Studio Device Manager (or via CLI: `emulator -avd <DeviceName>`).
2. **Verify ADB detects the emulator**:
   ```powershell
   adb devices
   ```
   *(You should see an entry like `emulator-5554   device`)*.

3. **Run the prebuilt Android project from the terminal**:
   ```powershell
   cd frontend
   npx expo run:android
   ```
   *Expo will invoke the Gradle build, install the app on the running emulator, and launch the Metro bundler in one unified step.*

4. **Alternatively with Expo Go**:
   ```powershell
   cd frontend
   npx expo start --android
   ```

---

## 4. Comparison Summary: Web vs. Android Emulator

| Feature | Track 1: Web | Track 2: Android Emulator |
| :--- | :--- | :--- |
| **Tool Required** | Web Browser (Chrome/Edge/Firefox) | Android Studio + Android Emulator (AVD) |
| **Starting Command** | `npm run web` (or `npx expo start --web`) | Run button in Android Studio (or `npx expo run:android`) |
| **Backend API Host** | `http://localhost:8080/api` | `http://10.0.2.2:8080/api` (automatic) |
| **Default Port** | `http://localhost:8081` | Runs natively inside Android OS |
| **Key Advantage** | Instant startup, inspect element, responsive resizing | Native mobile gestures, bottom tabs, true status bar & shadows |
| **Recommended For** | Rapid UI layout changes, business logic testing | Final user testing, mobile UX validation, native demonstrations |

---

## 5. Troubleshooting & FAQs

### Q1: The Android Emulator shows "Network Error" or "Unable to connect to SmartPark server"
- **Cause**: The backend is either not running, or the emulator cannot reach port `8080`.
- **Solution 1**: Ensure the backend is active at `http://localhost:8080/swagger-ui.html` on your host PC.
- **Solution 2**: Use ADB reverse port forwarding in a PowerShell terminal:
  ```powershell
  adb reverse tcp:8080 tcp:8080
  ```
  *(This forwards requests from the emulator's port 8080 directly to your PC's port 8080).*

---

### Q2: Metro bundler error: "Unable to load script" or red screen on emulator
- **Cause**: The emulator cannot reach Metro bundler on port 8081.
- **Solution**: Run:
  ```powershell
  adb reverse tcp:8081 tcp:8081
  ```
  Then press `r` twice in the emulator (or in the terminal) to reload.

---

### Q3: Gradle build fails in Android Studio with JDK error
- **Cause**: Android Studio is using an incompatible JDK version.
- **Solution**:
  1. In Android Studio, go to **Settings > Build, Execution, Deployment > Build Tools > Gradle**.
  2. Under **Gradle JDK**, select **Embedded JDK** (or JDK 17 / JDK 21).
  3. Re-sync Gradle: **File > Sync Project with Gradle Files**.

---

### Q4: `local.properties` file not found or invalid SDK directory
- **Cause**: `sdk.dir` is missing or points to another user's directory.
- **Solution**: Open `frontend/android/local.properties` and verify your path:
  ```properties
  sdk.dir=C\:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk
  ```

---

### Q5: How to test the APIs without the frontend?
Refer to the included Word document:
- **`SmartPark_API_Testing_Manual.docx`**: Contains ready-to-use cURL commands, PowerShell scripts, and Swagger instructions for every endpoint and error case.
