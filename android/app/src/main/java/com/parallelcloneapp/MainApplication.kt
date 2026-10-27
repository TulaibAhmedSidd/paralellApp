package com.parallelcloneapp

import android.app.Application
import android.content.Context
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import top.niunaijun.blackbox.BlackBoxCore
import top.niunaijun.blackbox.app.configuration.ClientConfiguration

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(ParallelClonePackage())
        },
    )
  }

  /**
   * This Application class also runs in the engine's own processes: ":black" (the virtual
   * system services) and ":p0", ":p1"... (one per running clone). BlackBoxCore must be
   * attached in every process, but React Native only belongs in the main UI process.
   */
  override fun attachBaseContext(base: Context) {
    super.attachBaseContext(base)
    try {
      BlackBoxCore.get().closeCodeInit()
      BlackBoxCore.get().onBeforeMainApplicationAttach(this, base)
      BlackBoxCore.get().doAttachBaseContext(base, object : ClientConfiguration() {
        override fun getHostPackageName(): String = base.packageName

        // Keep the engine's persistent daemon off; clones start on demand.
        override fun isEnableDaemonService(): Boolean = false

        // Belt and braces with the vendored patch: never upload logs anywhere.
        override fun getLogSenderChatId(): String = ""
      })
      BlackBoxCore.get().onAfterMainApplicationAttach(this, base)
    } catch (e: Exception) {
      Log.e(TAG, "BlackBox attach failed", e)
    }
  }

  override fun onCreate() {
    super.onCreate()
    try {
      BlackBoxCore.get().doCreate()
    } catch (e: Exception) {
      Log.e(TAG, "BlackBox create failed", e)
    }
    if (BlackBoxCore.get().isMainProcess()) {
      loadReactNative(this)
    }
  }

  companion object {
    private const val TAG = "MainApplication"
  }
}
