package com.parallelcloneapp

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.ApplicationInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.util.Base64
import com.facebook.react.bridge.*
import java.io.ByteArrayOutputStream
import org.json.JSONArray
import org.json.JSONObject
import top.niunaijun.blackbox.BlackBoxCore

/**
 * Bridge to the NewBlackbox virtual space.
 *
 * Every clone lives in its own virtual user (userId 0, 1, 2...) inside our app. Each virtual
 * user has its own data folders, so a clone always starts with a fresh login, separate from
 * the real app and from other clones of the same app.
 */
class ParallelCloneModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val PREFS_NAME = "parallel_clone_storage"
    private val KEY_CLONED_APPS = "cloned_apps_registry"

    override fun getName(): String {
        return "ParallelCloneModule"
    }

    private fun core(): BlackBoxCore = BlackBoxCore.get()

    private fun prefs(): SharedPreferences =
        reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    private fun readRegistry(): JSONArray = JSONArray(prefs().getString(KEY_CLONED_APPS, "[]"))

    private fun writeRegistry(registry: JSONArray) {
        prefs().edit().putString(KEY_CLONED_APPS, registry.toString()).apply()
    }

    private fun findClone(registry: JSONArray, cloneId: String): JSONObject? {
        for (i in 0 until registry.length()) {
            val obj = registry.getJSONObject(i)
            if (obj.optString("cloneId") == cloneId) return obj
        }
        return null
    }

    /** Lowest virtual user id not used by another clone or left over in the engine. */
    private fun nextFreeUserId(registry: JSONArray): Int {
        val used = mutableSetOf<Int>()
        for (i in 0 until registry.length()) {
            val obj = registry.getJSONObject(i)
            if (obj.has("userId")) used.add(obj.getInt("userId"))
        }
        try {
            core().users.forEach { used.add(it.id) }
        } catch (e: Exception) {
            // Engine not ready; registry ids are enough
        }
        var id = 0
        while (id in used) id++
        return id
    }

    private fun ensureUser(userId: Int) {
        if (core().users.none { it.id == userId }) {
            core().createUser(userId)
        }
    }

    /** Install the real app's APK into the clone's virtual user (no copy, no root needed). */
    private fun installIntoSpace(packageName: String, userId: Int): String? {
        ensureUser(userId)
        if (core().isInstalled(packageName, userId)) return null
        val result = core().installPackageAsUser(packageName, userId)
        return if (result.success) null else (result.msg ?: "Install failed")
    }

    @ReactMethod
    fun getEngineStatus(promise: Promise) {
        Thread {
            try {
                val ready = try {
                    core().areServicesAvailable()
                } catch (e: Exception) {
                    false
                }
                val result = Arguments.createMap().apply {
                    putBoolean("engineReady", ready)
                    putBoolean("is64Bit", BlackBoxCore.is64Bit())
                    putInt("virtualUserCount", try { core().users.size } catch (e: Exception) { 0 })
                    putString("packageName", reactContext.packageName)
                    putInt("androidVersion", Build.VERSION.SDK_INT)
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("STATUS_ERROR", e.localizedMessage, e)
            }
        }.start()
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        Thread {
            try {
                val pm = reactContext.packageManager
                val intent = Intent(Intent.ACTION_MAIN, null).apply {
                    addCategory(Intent.CATEGORY_LAUNCHER)
                }
                val resolveInfos = pm.queryIntentActivities(intent, 0)
                val appList = Arguments.createArray()

                for (resolveInfo in resolveInfos) {
                    val pkgName = resolveInfo.activityInfo.packageName
                    if (pkgName == reactContext.packageName) continue

                    val appName = resolveInfo.loadLabel(pm).toString()
                    val iconDrawable = resolveInfo.loadIcon(pm)
                    val iconBase64 = drawableToBase64(iconDrawable)

                    val appMap = Arguments.createMap().apply {
                        putString("packageName", pkgName)
                        putString("name", appName)
                        putString("icon", iconBase64)
                        putBoolean("isSystem", (resolveInfo.activityInfo.applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0)
                    }
                    appList.pushMap(appMap)
                }
                promise.resolve(appList)
            } catch (e: Exception) {
                promise.reject("FETCH_APPS_ERROR", e.localizedMessage, e)
            }
        }.start()
    }

    @ReactMethod
    fun getClonedApps(promise: Promise) {
        try {
            val jsonArray = readRegistry()
            val resultList = Arguments.createArray()
            val pm = reactContext.packageManager

            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                val pkg = obj.getString("packageName")
                val cloneName = obj.optString("cloneName", "Clone #1")
                val cloneId = obj.optString("cloneId", "clone_$i")
                val createdAt = obj.optLong("createdAt", System.currentTimeMillis())
                val isFrozen = obj.optBoolean("isFrozen", false)

                var appName = pkg
                var iconBase64 = ""
                try {
                    val appInfo = pm.getApplicationInfo(pkg, 0)
                    appName = pm.getApplicationLabel(appInfo).toString()
                    val icon = pm.getApplicationIcon(appInfo)
                    iconBase64 = drawableToBase64(icon)
                } catch (e: Exception) {
                    // Ignored if app was uninstalled from host
                }

                val item = Arguments.createMap().apply {
                    putString("packageName", pkg)
                    putString("appName", appName)
                    putString("cloneName", cloneName)
                    putString("cloneId", cloneId)
                    putDouble("createdAt", createdAt.toDouble())
                    putBoolean("isFrozen", isFrozen)
                    putString("icon", iconBase64)
                }
                resultList.pushMap(item)
            }

            promise.resolve(resultList)
        } catch (e: Exception) {
            promise.reject("GET_CLONES_ERROR", e.localizedMessage, e)
        }
    }

    @ReactMethod
    fun cloneApp(packageName: String, cloneLabel: String, promise: Promise) {
        Thread {
            try {
                val registry = readRegistry()
                val userId = nextFreeUserId(registry)

                val error = installIntoSpace(packageName, userId)
                if (error != null) {
                    promise.reject("CLONE_FAILED", error)
                    return@Thread
                }

                val cloneId = "clone_" + System.currentTimeMillis()
                registry.put(JSONObject().apply {
                    put("packageName", packageName)
                    put("cloneName", cloneLabel.ifEmpty { "Clone #${registry.length() + 1}" })
                    put("cloneId", cloneId)
                    put("userId", userId)
                    put("createdAt", System.currentTimeMillis())
                    put("isFrozen", false)
                })
                writeRegistry(registry)

                val res = Arguments.createMap().apply {
                    putBoolean("success", true)
                    putString("cloneId", cloneId)
                    putString("packageName", packageName)
                }
                promise.resolve(res)
            } catch (e: Exception) {
                promise.reject("CLONE_ERROR", e.localizedMessage, e)
            }
        }.start()
    }

    @ReactMethod
    fun removeClonedApp(cloneId: String, promise: Promise) {
        Thread {
            try {
                val registry = readRegistry()
                val updatedArray = JSONArray()
                var removed: JSONObject? = null

                for (i in 0 until registry.length()) {
                    val obj = registry.getJSONObject(i)
                    if (obj.optString("cloneId") == cloneId) removed = obj else updatedArray.put(obj)
                }

                if (removed != null && removed.has("userId")) {
                    val pkg = removed.getString("packageName")
                    val userId = removed.getInt("userId")
                    try {
                        core().stopPackage(pkg, userId)
                        core().uninstallPackageAsUser(pkg, userId)
                        // One clone per virtual user, so the user (and all its data) goes too
                        if (core().getInstalledApplications(0, userId).isEmpty()) {
                            core().deleteUser(userId)
                        }
                    } catch (e: Exception) {
                        // Still drop it from the list; leftover data is reused only if the id is
                        // picked again, and installIntoSpace() starts it from the real APK
                    }
                }

                writeRegistry(updatedArray)
                promise.resolve(removed != null)
            } catch (e: Exception) {
                promise.reject("REMOVE_ERROR", e.localizedMessage, e)
            }
        }.start()
    }

    @ReactMethod
    fun launchClone(cloneId: String, promise: Promise) {
        Thread {
            try {
                val registry = readRegistry()
                val clone = findClone(registry, cloneId)
                if (clone == null) {
                    promise.reject("CLONE_NOT_FOUND", "This clone no longer exists.")
                    return@Thread
                }
                val pkg = clone.getString("packageName")

                // Clones saved by the old Work Profile engine have no virtual user yet
                if (!clone.has("userId")) {
                    clone.put("userId", nextFreeUserId(registry))
                    writeRegistry(registry)
                }
                val userId = clone.getInt("userId")

                val error = installIntoSpace(pkg, userId)
                if (error != null) {
                    promise.reject("CLONE_FAILED", error)
                    return@Thread
                }

                if (core().launchApk(pkg, userId)) {
                    promise.resolve("LAUNCHED_IN_VIRTUAL_SPACE")
                } else {
                    promise.reject("LAUNCH_FAILED", "Could not open $pkg in the virtual space.")
                }
            } catch (e: Exception) {
                promise.reject("LAUNCH_ERROR", e.localizedMessage, e)
            }
        }.start()
    }

    @ReactMethod
    fun toggleFreezeApp(cloneId: String, freeze: Boolean, promise: Promise) {
        try {
            val registry = readRegistry()
            val clone = findClone(registry, cloneId)
            if (clone != null) {
                clone.put("isFrozen", freeze)
                if (freeze && clone.has("userId")) {
                    try {
                        core().stopPackage(clone.getString("packageName"), clone.getInt("userId"))
                    } catch (e: Exception) {
                        // Not running
                    }
                }
            }
            writeRegistry(registry)
            promise.resolve(freeze)
        } catch (e: Exception) {
            promise.reject("FREEZE_ERROR", e.localizedMessage, e)
        }
    }

    private fun drawableToBase64(drawable: Drawable): String {
        return try {
            val bitmap = when (drawable) {
                is BitmapDrawable -> drawable.bitmap
                else -> {
                    val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 96
                    val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 96
                    val bmp = Bitmap.createBitmap(width.coerceAtMost(96), height.coerceAtMost(96), Bitmap.Config.ARGB_8888)
                    val canvas = Canvas(bmp)
                    drawable.setBounds(0, 0, canvas.width, canvas.height)
                    drawable.draw(canvas)
                    bmp
                }
            }
            val scaled = if (bitmap.width > 96 || bitmap.height > 96) {
                Bitmap.createScaledBitmap(bitmap, 96, 96, true)
            } else {
                bitmap
            }
            val outputStream = ByteArrayOutputStream()
            scaled.compress(Bitmap.CompressFormat.PNG, 85, outputStream)
            val byteArray = outputStream.toByteArray()
            "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
        } catch (e: Exception) {
            ""
        }
    }
}
