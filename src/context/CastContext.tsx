/**
 * Cast Context Provider
 * Manages Google Cast functionality
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {Platform, NativeModules, NativeEventEmitter, Alert} from 'react-native';

// Types
interface CastDevice {
  id: string;
  name: string;
  type: 'chromecast' | 'smarttv' | 'airplay' | 'unknown';
  isConnected: boolean;
}

interface CastContextType {
  isInitialized: boolean;
  isScanning: boolean;
  isCasting: boolean;
  devices: CastDevice[];
  connectedDevice: CastDevice | null;
  startDiscovery: () => void;
  stopDiscovery: () => void;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  castScreen: () => Promise<void>;
}

const CastContext = createContext<CastContextType | undefined>(undefined);

// Try to import Google Cast - will be undefined if not installed
let GoogleCast: any = null;
let CastButton: any = null;

try {
  const castModule = require('react-native-google-cast');
  GoogleCast = castModule.default || castModule.GoogleCast;
  CastButton = castModule.CastButton;
} catch (e) {
  console.log('react-native-google-cast not installed, using mock implementation');
}

export function CastProvider({children}: {children: ReactNode}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [devices, setDevices] = useState<CastDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<CastDevice | null>(null);

  // Initialize Cast SDK
  useEffect(() => {
    initializeCast();
  }, []);

  const initializeCast = async () => {
    try {
      if (GoogleCast) {
        // Real Google Cast initialization
        await GoogleCast.showIntroductoryOverlay();
        
        // Listen for session events
        GoogleCast.EventEmitter.addListener(
          GoogleCast.SESSION_STARTED,
          () => {
            console.log('Cast session started');
            setIsCasting(true);
          }
        );

        GoogleCast.EventEmitter.addListener(
          GoogleCast.SESSION_ENDED,
          () => {
            console.log('Cast session ended');
            setIsCasting(false);
            setConnectedDevice(null);
          }
        );

        GoogleCast.EventEmitter.addListener(
          GoogleCast.DEVICE_AVAILABLE,
          ({device}: {device: any}) => {
            console.log('Device available:', device);
            setDevices(prev => {
              const exists = prev.find(d => d.id === device.deviceId);
              if (exists) return prev;
              return [...prev, {
                id: device.deviceId,
                name: device.friendlyName,
                type: 'chromecast',
                isConnected: false,
              }];
            });
          }
        );

        setIsInitialized(true);
      } else {
        // Mock initialization for testing without the library
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize Cast:', error);
      setIsInitialized(true); // Still set to true to allow UI to work
    }
  };

  const startDiscovery = useCallback(async () => {
    setIsScanning(true);
    setDevices([]);

    try {
      if (GoogleCast) {
        // Real device discovery
        await GoogleCast.startDiscovery();
        
        // Get current devices
        const currentDevices = await GoogleCast.getDiscoveredDevices();
        if (currentDevices && currentDevices.length > 0) {
          setDevices(currentDevices.map((d: any) => ({
            id: d.deviceId,
            name: d.friendlyName,
            type: 'chromecast',
            isConnected: false,
          })));
        }
      } else {
        // Mock discovery - simulate finding devices after 2 seconds
        setTimeout(() => {
          // Try to discover actual devices on network using native module if available
          discoverNetworkDevices();
        }, 2000);
      }
    } catch (error) {
      console.error('Discovery error:', error);
    } finally {
      setTimeout(() => setIsScanning(false), 3000);
    }
  }, []);

  const discoverNetworkDevices = async () => {
    // This would use SSDP/mDNS to discover devices
    // For now, show a message that the Cast library needs to be installed
    Alert.alert(
      'Cast Library Required',
      'To discover real devices, please install react-native-google-cast:\n\nnpm install react-native-google-cast\n\nThen rebuild the app.',
      [
        {text: 'OK', onPress: () => setIsScanning(false)}
      ]
    );
  };

  const stopDiscovery = useCallback(async () => {
    setIsScanning(false);
    if (GoogleCast) {
      try {
        await GoogleCast.stopDiscovery();
      } catch (error) {
        console.error('Stop discovery error:', error);
      }
    }
  }, []);

  const connectToDevice = useCallback(async (deviceId: string) => {
    try {
      const device = devices.find(d => d.id === deviceId);
      if (!device) return;

      if (GoogleCast) {
        // Real connection
        await GoogleCast.castToDevice(deviceId);
        
        setConnectedDevice({...device, isConnected: true});
        setDevices(prev => prev.map(d => ({
          ...d,
          isConnected: d.id === deviceId,
        })));
        setIsCasting(true);
      } else {
        // Show installation message
        Alert.alert(
          'Cast Library Required',
          'To connect to devices, please install react-native-google-cast and rebuild the app.',
          [{text: 'OK'}]
        );
      }
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Connection Failed', 'Could not connect to the device. Please try again.');
    }
  }, [devices]);

  const disconnect = useCallback(async () => {
    try {
      if (GoogleCast) {
        await GoogleCast.endSession();
      }
      setIsCasting(false);
      setConnectedDevice(null);
      setDevices(prev => prev.map(d => ({...d, isConnected: false})));
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, []);

  const castScreen = useCallback(async () => {
    try {
      if (GoogleCast && isCasting) {
        // Start screen mirroring
        await GoogleCast.launchApp();
      }
    } catch (error) {
      console.error('Cast screen error:', error);
    }
  }, [isCasting]);

  return (
    <CastContext.Provider
      value={{
        isInitialized,
        isScanning,
        isCasting,
        devices,
        connectedDevice,
        startDiscovery,
        stopDiscovery,
        connectToDevice,
        disconnect,
        castScreen,
      }}>
      {children}
    </CastContext.Provider>
  );
}

export function useCast() {
  const context = useContext(CastContext);
  if (context === undefined) {
    throw new Error('useCast must be used within a CastProvider');
  }
  return context;
}

export {CastButton};
