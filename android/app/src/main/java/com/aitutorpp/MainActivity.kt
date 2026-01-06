package com.aitutorpp

import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.google.android.gms.cast.framework.CastContext

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "aitutorpp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set FLAG_SECURE BEFORE calling super.onCreate
    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    
    super.onCreate(savedInstanceState)
    
    // Initialize Cast context
    try {
      CastContext.getSharedInstance(this)
    } catch (e: Exception) {
      // Cast not available on this device
      e.printStackTrace()
    }
  }
  
  override fun onResume() {
    super.onResume()
    // Ensure FLAG_SECURE is always set when app is resumed
    window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
  }
  
  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    // Re-apply FLAG_SECURE when window focus changes
    if (hasFocus) {
      window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }
  }
}
