/**
 * Subscription Context
 * Manages subscription status and access control
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {subscriptionsApi} from '../services/api';
import {useAuth} from './AuthContext';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: any | null;
  isLoading: boolean;
  expiresAt: string | null;
  daysRemaining: number;
}

interface SubscriptionContextType extends SubscriptionStatus {
  checkSubscription: () => Promise<void>;
  clearSubscription: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({children}: {children: React.ReactNode}) {
  const {isAuthenticated} = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setHasActiveSubscription(false);
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await subscriptionsApi.getActive();
      
      if (response.success && response.data) {
        const sub = response.data;
        const now = new Date();
        const expiry = new Date(sub.expiresAt);
        const isActive = sub.status === 'active' && expiry > now;
        
        setSubscription(sub);
        setHasActiveSubscription(isActive);
        setExpiresAt(sub.expiresAt);
        
        if (isActive) {
          const diff = expiry.getTime() - now.getTime();
          setDaysRemaining(Math.ceil(diff / (1000 * 60 * 60 * 24)));
        } else {
          setDaysRemaining(0);
        }
      } else {
        setHasActiveSubscription(false);
        setSubscription(null);
        setExpiresAt(null);
        setDaysRemaining(0);
      }
    } catch (error: any) {
      // Don't show error for 401 - handled by AuthContext
      if (error?.response?.status !== 401) {
        console.error('Failed to check subscription:', error);
      }
      setHasActiveSubscription(false);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const clearSubscription = useCallback(() => {
    setHasActiveSubscription(false);
    setSubscription(null);
    setExpiresAt(null);
    setDaysRemaining(0);
  }, []);

  // Check subscription when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      checkSubscription();
    } else {
      clearSubscription();
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <SubscriptionContext.Provider
      value={{
        hasActiveSubscription,
        subscription,
        isLoading,
        expiresAt,
        daysRemaining,
        checkSubscription,
        clearSubscription,
      }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
