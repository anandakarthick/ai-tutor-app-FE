/**
 * Network Context
 * Manages internet connectivity state across the app
 * Handles graceful fallback if NetInfo is not available
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

// Dynamic import to handle case where NetInfo isn't installed/linked
let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  console.log('[NetworkContext] NetInfo not available, network checking disabled');
}

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  checkConnection: () => Promise<boolean>;
  isNetInfoAvailable: boolean;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({children}: {children: ReactNode}) {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const isNetInfoAvailable = NetInfo !== null;

  useEffect(() => {
    if (!NetInfo) {
      console.log('[NetworkContext] NetInfo not available, assuming connected');
      return;
    }

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      console.log('[Network] Connection state changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
      
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
    });

    // Check initial connection
    NetInfo.fetch().then((state: any) => {
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!NetInfo) {
      return true; // Assume connected if NetInfo not available
    }
    
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected ?? true);
    setIsInternetReachable(state.isInternetReachable);
    setConnectionType(state.type);
    return state.isConnected ?? true;
  }, []);

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        connectionType,
        checkConnection,
        isNetInfoAvailable,
      }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

export default NetworkContext;
