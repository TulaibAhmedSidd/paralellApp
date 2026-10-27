# paralellApp

A React Native app that clones installed apps (WhatsApp, Telegram, Muzz, games...) so you can run a second account with its own login, data and settings, next to the account in your main app.

It works like [Parallel Space](https://apkpure.com/parallel-space-multi-accounts/com.lbe.parallel.intl): cloned apps run **inside this app** in a virtual space, powered by the open-source [NewBlackbox](https://github.com/ALEX5402/NewBlackbox) engine (Apache-2.0). No Android Work Profile is created.

---

## 🌟 Key Features

- **Fresh login per clone**: Each clone runs in its own virtual user with separate data, so it starts signed out while your main app stays signed in.
- **Many clones of one app**: Clone the same app more than once (Clone #1, Clone #2...), one account each.
- **App Library**: Lists the apps installed on the phone with their icons; one tap to clone.
- **Freeze**: Stops a clone's process to save battery and RAM.
- **PIN Vault**: 4-digit PIN lock screen (default `1234`).
- **Automated CI/CD**: GitHub Actions builds Release and Debug APKs on every push to `main`.

## ⚠️ Limits

- **Some apps refuse to run in a virtual space** (banking apps, apps with `REQUIRE_SECURE_ENV`, some social/dating apps). An app may refuse to open or flag the account. Test with a spare account first.
- **Not for the Play Store.** The host targets SDK 28 and hooks Android internals, which Google Play does not allow. Share the APK directly.
- **ARM phones only.** The engine's native hooks are built for `arm64-v8a` and `armeabi-v7a`, not x86 emulators.
- NewBlackbox says it supports Android 5–14+. Newer Android versions are not proven.

---

## 📖 Architecture & Technical Details

See [**`howto.md`**](./howto.md) for how the virtual space works, and
[`android/vendor/newblackbox/VENDOR.md`](./android/vendor/newblackbox/VENDOR.md) for the vendored engine and our local patches.

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
Needs JDK 21 and the Android SDK (the engine also pulls NDK 29 on first build).
```bash
npx react-native run-android
```

---

## 🤖 GitHub Actions APK Generation

The workflow at `.github/workflows/build-apk.yml` runs on every push to `main`:
1. Sets up Node.js 22 and Java 21.
2. Installs dependencies and runs Gradle 9.x.
3. Builds `assembleRelease` and `assembleDebug`.
4. Publishes a GitHub Release with `parallel-space-clone.apk`.
5. Uploads both Release and Debug APK artifacts for download.
