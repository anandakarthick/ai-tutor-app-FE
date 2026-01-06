/**
 * Screen Security Hook
 * Prevents screenshots, screen recording, and screen sharing
 * Uses native modules for Android (FLAG_SECURE) and iOS detection
 */

import {useEffect, useState, useCallback} from 'react';
import {
  Platform,
  NativeModules,
  AppState,
  AppStateStatus,
} from 'react-native';

const {ScreenSecurity} = NativeModules;

interface ScreenSecurityState {
  isSecureModeEnabled: boolean;
  isScreenBeingCaptured: boolean;
}

export function useScreenSecurity() {
  const [securityState, setSecurityState] = useState<ScreenSecurityState>({
    isSecureModeEnabled: false,
    isScreenBeingCaptured: false,
  });

  // Enable secure mode (blocks screenshots on Android)
  const enableSecureMode = useCallback(async () => {
    if (Platform.OS === 'android' && ScreenSecurity) {
      try {
        await ScreenSecurity.enableSecureMode();
        setSecurityState(prev => ({...prev, isSecureModeEnabled: true}));
        console.log('🛡️ Screen security enabled');
        return true;
      } catch (error) {
        console.error('Failed to enable secure mode:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Disable secure mode
  const disableSecureMode = useCallback(async () => {
    if (Platform.OS === 'android' && ScreenSecurity) {
      try {
        await ScreenSecurity.disableSecureMode();
        setSecurityState(prev => ({...prev, isSecureModeEnabled: false}));
        console.log('🔓 Screen security disabled');
        return true;
      } catch (error) {
        console.error('Failed to disable secure mode:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Check if secure mode is enabled
  const checkSecureMode = useCallback(async () => {
    if (Platform.OS === 'android' && ScreenSecurity) {
      try {
        const isEnabled = await ScreenSecurity.isSecureModeEnabled();
        setSecurityState(prev => ({...prev, isSecureModeEnabled: isEnabled}));
        return isEnabled;
      } catch (error) {
        console.error('Failed to check secure mode:', error);
        return false;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    // Enable secure mode on mount
    enableSecureMode();

    // Re-enable when app comes to foreground
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        enableSecureMode();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [enableSecureMode]);

  return {
    ...securityState,
    enableSecureMode,
    disableSecureMode,
    checkSecureMode,
  };
}

export default useScreenSecurity;
