package com.aitutorpp

import android.app.Activity
import android.view.WindowManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class ScreenSecurityModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ScreenSecurity"
    }

    @ReactMethod
    fun enableSecureMode(promise: Promise) {
        val activity: Activity? = reactContext.currentActivity
        if (activity != null) {
            activity.runOnUiThread {
                try {
                    activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
                    promise.resolve(true)
                } catch (e: Exception) {
                    promise.reject("ERROR", "Failed to enable secure mode: ${e.message}")
                }
            }
        } else {
            promise.reject("ERROR", "Activity is null")
        }
    }

    @ReactMethod
    fun disableSecureMode(promise: Promise) {
        val activity: Activity? = reactContext.currentActivity
        if (activity != null) {
            activity.runOnUiThread {
                try {
                    activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
                    promise.resolve(true)
                } catch (e: Exception) {
                    promise.reject("ERROR", "Failed to disable secure mode: ${e.message}")
                }
            }
        } else {
            promise.reject("ERROR", "Activity is null")
        }
    }

    @ReactMethod
    fun isSecureModeEnabled(promise: Promise) {
        val activity: Activity? = reactContext.currentActivity
        if (activity != null) {
            activity.runOnUiThread {
                try {
                    val flags = activity.window.attributes.flags
                    val isSecure = (flags and WindowManager.LayoutParams.FLAG_SECURE) != 0
                    promise.resolve(isSecure)
                } catch (e: Exception) {
                    promise.reject("ERROR", "Failed to check secure mode: ${e.message}")
                }
            }
        } else {
            promise.reject("ERROR", "Activity is null")
        }
    }
}
