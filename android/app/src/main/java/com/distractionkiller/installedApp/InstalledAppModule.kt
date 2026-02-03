package com.distractionkiller.installedApp

import android.content.Context
import android.content.pm.PackageManager
import com.facebook.react.bridge.*

class InstalledAppModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private val prefs =
        reactContext.getSharedPreferences(
            "AppBlockerStorage",
            Context.MODE_PRIVATE
        )

    override fun getName(): String {
        return "InstalledApp"
    }

    @ReactMethod
    fun setBlockerEnabled(enabled: Boolean) {
        prefs.edit()
            .putBoolean("blocker_enabled", enabled)
            .apply()
    }

    @ReactMethod
    fun isBlockerEnabled(promise: Promise) {
        val enabled = prefs.getBoolean("blocker_enabled", true)
        promise.resolve(enabled)
    }


    // ✅ Get installed apps with limited flag
    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA)

            val limitedSet =
                prefs.getStringSet("limited_apps", HashSet()) ?: HashSet()

            val result = Arguments.createArray()

            for (app in apps) {
                if (pm.getLaunchIntentForPackage(app.packageName) != null) {

                    val map = Arguments.createMap()

                    val name = pm.getApplicationLabel(app).toString()
                    val identifier = app.packageName

                    map.putString("name", name)
                    map.putString("identifier", identifier)
                    map.putBoolean(
                        "limited",
                        limitedSet.contains(identifier)
                    )

                    result.pushMap(map)
                }
            }

            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("ERROR", e)
        }
    }

    @ReactMethod
    fun setAppLimited(identifier: String, limited: Boolean) {

        val set =
            prefs.getStringSet("limited_apps", HashSet())?.toMutableSet()
                ?: mutableSetOf()

        if (limited) {
            set.add(identifier)     // block
        } else {
            set.remove(identifier)  // unblock
        }

        prefs.edit()
            .putStringSet("limited_apps", set)
            .apply()
    }
}
