# NewBlackbox (vendored)

The engine that runs cloned apps inside ParallelCloneApp's own process (a "virtual space").

- Source: https://github.com/ALEX5402/NewBlackbox
- Commit: `89b59836c66f173756a4ae258cf379a957649820` (2026-07-19)
- License: Apache-2.0 (see `LICENSE`)
- Copied modules: `Bcore`, `black-reflection`, `compiler`. The upstream sample `app` was not copied.
- Upstream also ships prebuilt binaries we did not build ourselves: `Bcore/src/main/cpp/Dobby/*/libdobby.a`
  (the Dobby hooking library) and `Bcore/src/main/assets/{empty,junit}.jar`.

## Local patches

Search for `Patched for ParallelCloneApp` to find them.

1. `utils/LogSender.java`: `send()` returns at once. Upstream uploads the full logcat plus device
   info to `logs-sender-api.vercel.app` (a Telegram relay) whenever a crash is caught. Logcat can
   contain data from the cloned apps.
2. `app/configuration/ClientConfiguration.java`: `getLogSenderChatId()` returns `""` instead of
   the upstream author's chat id, so `BlackBoxCore.sendLogs()` exits early too.
3. `BlackBoxCore.java`: the `startLogcat()` call is commented out. Upstream mirrors the whole logcat
   into the public `Downloads/logs` folder for as long as the app runs.
4. `Bcore/build.gradle`: rewritten for AGP 9 (`lint {}`, `packaging {}`, `layout.buildDirectory`),
   `minSdk` read from our `minSdkVersion`, library minify off.

Re-apply these after any upgrade from upstream.
