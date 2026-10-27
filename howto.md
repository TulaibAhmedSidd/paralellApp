# Parallel Space Clone — Architecture Guide (`howto.md`)

## 1. Goal

Run a second (or third) copy of an installed app, such as Muzz or WhatsApp, with its own login and data. Your account in the real app is not touched.

## 2. How it works: a virtual space inside our app

Parallel Space and this app use the same idea. The cloned app is **not** installed a second time in Android, and no Work Profile is created. Instead:

1. **The engine loads the real APK.** NewBlackbox reads the app's APK straight from where Android installed it (`ApplicationInfo.sourceDir`). Nothing is copied or downloaded.
2. **It runs the APK in our own processes.** `AndroidManifest.xml` in `Bcore` declares many stub activities, services and providers, plus processes `:p0`, `:p1`... When a clone opens, the engine starts it in one of those stub processes under our app's identity.
3. **It hooks Android's system services.** Calls the clone makes to the package manager, activity manager, accounts and storage are redirected to the engine's own virtual services, which run in the `:black` process. The clone believes it is installed normally.
4. **It keeps data separate per virtual user.** Each clone gets a virtual user id (0, 1, 2...). Its databases, shared prefs and files live in that user's folder inside our app's private storage. A new virtual user is empty, so the clone opens on a fresh login screen.

```
Real phone                         ParallelCloneApp (one Android app)
──────────                         ──────────────────────────────────────────────
Muzz (your main account)           main process   : React Native UI + ParallelCloneModule
  /data/user/0/com.muzmatch...     :black         : NewBlackbox virtual system services
                                   :p0            : Muzz clone, virtual user 0 (account B)
                                   :p1            : Muzz clone, virtual user 1 (account C)
```

### Trade-offs

- **Detection.** Some apps check for virtual spaces and refuse to run, or flag the account. Parallel Space has the same limit, and it stopped cloning apps that declare `REQUIRE_SECURE_ENV`.
- **Target SDK 28.** The host app must target SDK 28 so the engine's hidden-API and storage tricks keep working. Google Play will not accept it, so the APK is shared directly.
- **ARM only.** The native hooks (`libblackbox.so`, Dobby) are built for `arm64-v8a` and `armeabi-v7a`.

## 3. Code map

| Layer | File | What it does |
| :--- | :--- | :--- |
| Engine | `android/vendor/newblackbox/` | Vendored NewBlackbox modules (`Bcore`, `black-reflection`, `compiler`). See `VENDOR.md` for the source commit and our privacy patches. |
| Startup | `android/app/.../MainApplication.kt` | Attaches `BlackBoxCore` in every process; starts React Native only in the main process. |
| Bridge | `android/app/.../ParallelCloneModule.kt` | Clone registry (SharedPreferences) and calls into `BlackBoxCore`. |
| JS API | `src/native/ParallelClone.ts` | Typed wrapper; uses mock data when the native module is missing (tests, iOS). |
| UI | `App.tsx`, `src/screens/*` | Home (clones), Library (installed apps), Engine (status, freeze all, lock). |

### Bridge methods

- `getEngineStatus()`: whether the virtual services are running, 32/64-bit mode, number of virtual users, Android API level.
- `getInstalledApps()`: launchable apps on the phone, with icons as base64 PNG.
- `getClonedApps()`: the clone registry.
- `cloneApp(packageName, label)`: picks the next free virtual user, links in Google Play Services if the phone has them (`installGms`, best effort — many apps such as Muzz need it), then `installPackageAsUser(packageName, userId)`.
- `launchClone(cloneId)`: installs again if needed, then `launchApk(packageName, userId)`.
- `toggleFreezeApp(cloneId, freeze)`: sets the flag; freezing also calls `stopPackage`.
- `removeClonedApp(cloneId)`: `stopPackage`, `uninstallPackageAsUser`, then deletes the virtual user and its data.

## 4. Build & run locally

### Prerequisites
- Node.js >= 22
- JDK 21
- Android SDK (platforms 35 and 37; NDK 29.0.13846066 is installed automatically by Gradle)
- An ARM Android phone

### Commands
```bash
npm install
npx tsc --noEmit
npx react-native run-android
# or build an APK:
cd android && ./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`
