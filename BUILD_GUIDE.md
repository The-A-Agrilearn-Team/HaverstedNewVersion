# AgriHub — Local APK Build Guide

## Prerequisites

Install these on your local machine before building:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| pnpm | 10+ | `npm install -g pnpm` |
| EAS CLI | latest | `npm install -g eas-cli` |
| Java JDK | 17 | https://adoptium.net |
| Android Studio | latest | https://developer.android.com/studio |

> **Android Studio** is required to install the Android SDK and set `ANDROID_HOME`.

---

## 1. Clone & Install

```bash
git clone https://github.com/The-A-Agrilearn-Team/HaverstedNewVersion.git
cd HaverstedNewVersion
pnpm install
```

---

## 2. Set Up Environment

Create a `.env` file inside `artifacts/agri-learn/` (or set these as shell exports):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://quxdfknwgymgghemkmcd.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1eGRma253Z3ltZ2doZW1rbWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzk2NTUsImV4cCI6MjA4OTY1NTY1NX0.F0Jt5ISnkKh9tigNS-R-4hqj2aiZLcC_h6VjY6fUTGQ
```

---

## 3. Log in to Expo

```bash
eas login
```

Use your Expo account credentials. If you don't have one, register at https://expo.dev.

---

## 4. Build the APK Locally

Navigate to the app folder and run the local build:

```bash
cd artifacts/agri-learn
eas build --platform android --profile local-apk --local
```

This will:
- Bundle the JavaScript
- Generate the Android project
- Compile and produce an `.apk` file in the current directory

The APK file will be named something like `build-*.apk` and will appear in `artifacts/agri-learn/` when complete.

---

## 5. Install on Device

Transfer the `.apk` to your Android device and install it, or use ADB:

```bash
adb install build-*.apk
```

---

## Build Profiles Explained

| Profile | Output | Use For |
|---------|--------|---------|
| `local-apk` | `.apk` | Local testing / sideloading |
| `preview` | `.apk` | Internal distribution via EAS |
| `development` | Dev client | Development with Expo Go replacement |
| `production` | `.aab` | Google Play Store submission |

---

## Troubleshooting

**`ANDROID_HOME` not set**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
export ANDROID_HOME=$HOME/Android/Sdk           # Linux
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Java version mismatch**
```bash
java -version   # Must show 17.x
```
Use [SDKMAN](https://sdkman.io) to manage Java versions: `sdk use java 17-tem`

**Gradle build fails**
```bash
cd android && ./gradlew clean && cd ..
eas build --platform android --profile local-apk --local
```

**Metro bundler errors**
```bash
pnpm install
npx expo start --clear
```
