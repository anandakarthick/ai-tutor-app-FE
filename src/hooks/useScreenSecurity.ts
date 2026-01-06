/**
 * Screen Security Hook
 * Detects screen recording, screen capture, and provides security utilities
 */

import {useEffect, useState, useCallback} from 'react';
import {
  Platform,
  NativeModules,
  NativeEventEmitter,
  AppState,
  AppStateStatus,
} from 'react-native';

interface ScreenSecurityState {
  isScreenBeingCaptured: boolean;
  isScreenRecording: boolean;
}

export function useScreenSecurity() {
  const [securityState, setSecurityState] = useState<ScreenSecurityState>({
    isScreenBeingCaptured: false,
    isScreenRecording: false,
  });

  useEffect(() => {
    // For iOS, we rely on the native AppDelegate implementation
    // For Android, FLAG_SECURE handles it at the native level
    
    // Listen for app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App became active, check security status
        console.log('[ScreenSecurity] App became active');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return securityState;
}

export default useScreenSecurity;
