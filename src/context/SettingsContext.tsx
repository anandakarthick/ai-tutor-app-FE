/**
 * Site Settings Context for Mobile App
 * Provides site configuration (name, logo, etc.) throughout the app
 */

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../constants/config';

interface SiteSettings {
  siteName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  address: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
}

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  siteName: 'AI Tutor',
  tagline: 'Your Personal AI-Powered Learning Companion',
  supportEmail: 'support@aitutor.com',
  supportPhone: '+91 98765 43210',
  whatsappNumber: '919876543210',
  address: 'Chennai, Tamil Nadu, India',
  facebookUrl: 'https://facebook.com/aitutor',
  twitterUrl: 'https://twitter.com/aitutor',
  instagramUrl: 'https://instagram.com/aitutor',
  linkedinUrl: 'https://linkedin.com/company/aitutor',
  youtubeUrl: 'https://youtube.com/@aitutor',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

// Storage keys
const SETTINGS_CACHE_KEY = 'site_settings_cache';
const SETTINGS_CACHE_TIME_KEY = 'site_settings_cache_time';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({children}: SettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const getCachedSettings = async (): Promise<SiteSettings | null> => {
    try {
      const cached = await AsyncStorage.getItem(SETTINGS_CACHE_KEY);
      const cacheTime = await AsyncStorage.getItem(SETTINGS_CACHE_TIME_KEY);

      if (cached && cacheTime) {
        const isExpired = Date.now() - parseInt(cacheTime, 10) > CACHE_DURATION;
        if (!isExpired) {
          return JSON.parse(cached);
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const cacheSettings = async (newSettings: SiteSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(newSettings));
      await AsyncStorage.setItem(SETTINGS_CACHE_TIME_KEY, Date.now().toString());
    } catch {
      // Ignore storage errors
    }
  };

  const fetchSettings = async () => {
    try {
      // First try to get cached settings
      const cached = await getCachedSettings();
      if (cached) {
        setSettings(cached);
      }

      // Fetch from API
      const response = await fetch(`${API_URL}/settings/public`);

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          const data = result.data;
          const newSettings: SiteSettings = {
            siteName: data.siteName || data.site_name || defaultSettings.siteName,
            tagline: data.tagline || data.site_tagline || defaultSettings.tagline,
            supportEmail:
              data.supportEmail || data.support_email || defaultSettings.supportEmail,
            supportPhone:
              data.supportPhone || data.support_phone || defaultSettings.supportPhone,
            whatsappNumber:
              data.whatsappNumber || data.whatsapp_number || defaultSettings.whatsappNumber,
            address: data.address || data.company_address || defaultSettings.address,
            facebookUrl:
              data.facebookUrl || data.facebook_url || defaultSettings.facebookUrl,
            twitterUrl: data.twitterUrl || data.twitter_url || defaultSettings.twitterUrl,
            instagramUrl:
              data.instagramUrl || data.instagram_url || defaultSettings.instagramUrl,
            linkedinUrl:
              data.linkedinUrl || data.linkedin_url || defaultSettings.linkedinUrl,
            youtubeUrl: data.youtubeUrl || data.youtube_url || defaultSettings.youtubeUrl,
          };

          setSettings(newSettings);
          await cacheSettings(newSettings);
        }
      }
    } catch (error) {
      console.log('Using default/cached settings');
      // Keep using cached or default settings
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{settings, loading, refreshSettings}}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);

export default SettingsContext;
