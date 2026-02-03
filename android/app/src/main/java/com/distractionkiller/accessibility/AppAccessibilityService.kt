package com.distractionkiller.accessibility

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.content.Context
import android.content.Intent

class AppAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {

            val packageName = event.packageName?.toString() ?: return

            if (packageName.contains("launcher")) return

            if (packageName == "com.distractionkiller") return
            if (packageName == "com.android.systemui") return
            if (packageName == "com.android.settings") return


            val prefs =
                applicationContext.getSharedPreferences(
                    "AppBlockerStorage",
                    Context.MODE_PRIVATE
                )

            val limitedSet =
                prefs.getStringSet("limited_apps", HashSet()) ?: HashSet()

            val isLimited = limitedSet.contains(packageName)

            if (isLimited) {

                val intent = Intent(this, com.distractionkiller.BlockActivity::class.java)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)

                // performGlobalAction(GLOBAL_ACTION_HOME)
            }
        }
    }

    override fun onInterrupt() {}
}
