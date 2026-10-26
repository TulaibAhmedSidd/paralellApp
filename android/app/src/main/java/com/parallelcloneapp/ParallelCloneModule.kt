package com.parallelcloneapp

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.LauncherApps
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.os.Process
import android.os.UserHandle
import android.os.UserManager
import android.util.Base64
import com.facebook.react.bridge.*
import java.io.ByteArrayOutputStream
import org.json.JSONArray
import org.json.JSONObject

class ParallelCloneModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val PREFS_NAME = "parallel_clone_storage"
    private val KEY_CLONED_APPS = "cloned_apps_registry"

    override fun getName(): String {
        return "ParallelCloneModule"
    }

    private fun getDevicePolicyManager(): DevicePolicyManager {
        return reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
    }

    private fun getUserManager(): UserManager {
        return reactContext.getSystemService(Context.USER_SERVICE) as UserManager
    }

    private fun getLauncherApps(): LauncherApps? {
        return reactContext.getSystemService(Context.LAUNCHER_APPS_SERVICE) as? LauncherApps
    }

    private fun getWorkProfileUserHandle(): UserHandle? {
        val userManager = getUserManager()
        val myHandle = Process.myUserHandle()
        for (profile in userManager.userProfiles) {
            if (profile != myHandle) {
                return profile
            }
        }
        return null
    }

    @ReactMethod
    fun getEngineStatus(promise: Promise) {
        try {
            val dpm = getDevicePolicyManager()
            val adminComponent = CloneDeviceAdminReceiver.getComponentName(reactContext)
            val isProfileOwner = dpm.isProfileOwnerApp(reactContext.packageName)
            val isDeviceOwner = dpm.isDeviceOwnerApp(reactContext.packageName)
            val workProfileHandle = getWorkProfileUserHandle()
            val hasWorkProfile = workProfileHandle != null

            val result = Arguments.createMap().apply {
                putBoolean("isProfileOwner", isProfileOwner)
                putBoolean("isDeviceOwner", isDeviceOwner)
                putBoolean("hasWorkProfile", hasWorkProfile)
                putBoolean("isWorkProfileSupported", reactContext.packageManager.hasSystemFeature(PackageManager.FEATURE_MANAGED_USERS))
                putString("packageName", reactContext.packageName)
                putInt("androidVersion", Build.VERSION.SDK_INT)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("STATUS_ERROR", e.localizedMessage, e)
        }
    }

    @ReactMethod
    fun requestProvisionWorkProfile(promise: Promise) {
        try {
            val activity = currentActivity
            if (activity == null) {
                promise.reject("ACTIVITY_NULL", "Activity is not available")
                return
            }

            val adminComponent = CloneDeviceAdminReceiver.getComponentName(reactContext)
            val intent = Intent(DevicePolicyManager.ACTION_PROVISION_MANAGED_PROFILE).apply {
                putExtra(DevicePolicyManager.EXTRA_PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME, adminComponent)
                putExtra(DevicePolicyManager.EXTRA_PROVISIONING_SKIP_ENCRYPTION, true)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    putExtra(DevicePolicyManager.EXTRA_PROVISIONING_SKIP_USER_CONSENT, false)
                }
            }

            if (intent.resolveActivity(reactContext.packageManager) != null) {
                activity.startActivityForResult(intent, 5101)
                promise.resolve("PROVISIONING_INITIATED")
            } else {
                promise.reject("UNSUPPORTED", "Work Profile provisioning is not supported on this ROM")
            }
        } catch (e: Exception) {
            promise.reject("PROVISIONING_ERROR", e.localizedMessage, e)
        }
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
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val raw = prefs.getString(KEY_CLONED_APPS, "[]")
            val jsonArray = JSONArray(raw)

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
        try {
            val dpm = getDevicePolicyManager()
            val adminComponent = CloneDeviceAdminReceiver.getComponentName(reactContext)

            // If profile owner, natively clone/install existing package into managed user space
            if (dpm.isProfileOwnerApp(reactContext.packageName)) {
                try {
                    dpm.installExistingPackage(adminComponent, packageName)
                } catch (e: Exception) {
                    // Fall back to registry clone
                }
            }

            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val raw = prefs.getString(KEY_CLONED_APPS, "[]")
            val jsonArray = JSONArray(raw)

            val cloneId = "clone_" + System.currentTimeMillis()
            val newClone = JSONObject().apply {
                put("packageName", packageName)
                put("cloneName", cloneLabel.ifEmpty { "Clone #${jsonArray.length() + 1}" })
                put("cloneId", cloneId)
                put("createdAt", System.currentTimeMillis())
                put("isFrozen", false)
            }
            jsonArray.put(newClone)
            prefs.edit().putString(KEY_CLONED_APPS, jsonArray.toString()).apply()

            val res = Arguments.createMap().apply {
                putBoolean("success", true)
                putString("cloneId", cloneId)
                putString("packageName", packageName)
            }
            promise.resolve(res)
        } catch (e: Exception) {
            promise.reject("CLONE_ERROR", e.localizedMessage, e)
        }
    }

    @ReactMethod
    fun removeClonedApp(cloneId: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val raw = prefs.getString(KEY_CLONED_APPS, "[]")
            val jsonArray = JSONArray(raw)
            val updatedArray = JSONArray()

            var found = false
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                if (obj.optString("cloneId") == cloneId) {
                    found = true
                } else {
                    updatedArray.put(obj)
                }
            }
            prefs.edit().putString(KEY_CLONED_APPS, updatedArray.toString()).apply()
            promise.resolve(found)
        } catch (e: Exception) {
            promise.reject("REMOVE_ERROR", e.localizedMessage, e)
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, isClone: Boolean, promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val workProfileHandle = getWorkProfileUserHandle()
            val launcherApps = getLauncherApps()

            if (isClone && workProfileHandle != null && launcherApps != null) {
                val activities = launcherApps.getActivityList(packageName, workProfileHandle)
                if (activities.isNotEmpty()) {
                    launcherApps.startMainActivity(activities[0].componentName, workProfileHandle, null, null)
                    promise.resolve("LAUNCHED_IN_WORK_PROFILE")
                    return
                }
            }

            // Launch standard or fallback
            val intent = pm.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(intent)
                promise.resolve("LAUNCHED_STANDARD")
            } else {
                promise.reject("LAUNCH_FAILED", "Unable to find launch intent for $packageName")
            }
        } catch (e: Exception) {
            promise.reject("LAUNCH_ERROR", e.localizedMessage, e)
        }
    }

    @ReactMethod
    fun toggleFreezeApp(cloneId: String, freeze: Boolean, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val raw = prefs.getString(KEY_CLONED_APPS, "[]")
            val jsonArray = JSONArray(raw)

            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                if (obj.optString("cloneId") == cloneId) {
                    obj.put("isFrozen", freeze)
                    break
                }
            }
            prefs.edit().putString(KEY_CLONED_APPS, jsonArray.toString()).apply()
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
