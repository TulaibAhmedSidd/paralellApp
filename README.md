# paralellApp

A modern, high-performance React Native mobile app that clones applications (e.g. WhatsApp, Telegram, Instagram, Facebook, and games) with completely isolated data, independent accounts, and separate credentials.

Inspired by [Parallel Space](https://play.google.com/store/apps/details?id=com.excean.parallelspace&hl=en&pli=1) and built with a Play Store compliant Android Work Profile Isolation Engine.

---

## 🌟 Key Features

- **True Data & Credential Isolation**: Cloned apps run in an isolated Android OS user profile (`UserHandle`) with separate Linux UID, separate `/data/user/10/` storage, isolated Keystore, and independent SQLite databases.
- **100% Play Store Safe & Ban-Proof**: Uses native Android `DevicePolicyManager` and `LauncherApps` instead of fragile Binder hooking or dynamic DEX loading (VirtualApp), avoiding account bans on WhatsApp and social platforms.
- **App Library & Instant Cloning**: Detects installed applications on the device, extracting high-resolution icons and metadata with one-tap cloning.
- **Process Freeze / Hibernate**: Freeze any cloned application to immediately suspend its background tasks, saving battery and RAM.
- **PIN Vault Security**: Built-in 4-digit PIN security lock (Default: `1234`) to guard cloned spaces from unauthorized access.
- **Automated CI/CD**: Pre-configured GitHub Actions workflow automatically builds signed Release and Debug APKs on every push to `main`.

---

## 📖 Architecture & Technical Details

For an in-depth breakdown of how the isolation sandbox works, why VirtualApp fails on Android 11–15, and how the native Kotlin bridge operates, see [**`howto.md`**](./howto.md).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Typecheck Code
```bash
npx tsc --noEmit
```

### 3. Run on Android
```bash
npx react-native run-android
```

---

## 🤖 GitHub Actions APK Generation

This repository includes a production-grade CI workflow at `.github/workflows/build-apk.yml`. On every push to `main`:
1. Sets up Node.js 22 and Java 17.
2. Installs dependencies and runs Gradle 9.x.
3. Builds `assembleRelease` and `assembleDebug`.
4. Publishes a GitHub Release with `parallel-space-clone.apk`.
5. Uploads both Release and Debug APK artifacts for instant download.
