package com.distractionkiller.accessibility

import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*

class AccessibilityModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AccessibilityModule"
    }

    // ✅ Check if accessibility permission is granted
    @ReactMethod
    fun hasAccessibilityPermission(promise: Promise) {
        try {
            val enabled = Settings.Secure.getInt(
                reactContext.contentResolver,
                Settings.Secure.ACCESSIBILITY_ENABLED
            )

            promise.resolve(enabled == 1)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    // ✅ Open accessibility settings
    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }
}
