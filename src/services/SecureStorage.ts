/**
 * Secure Storage Service
 * Uses AsyncStorage with encoding for storing sensitive data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage prefix for secure items
const SECURE_PREFIX = '@secure_';

// Simple base64 implementation for React Native
const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function toBase64(str: string): string {
  let result = '';
  let i = 0;
  
  while (i < str.length) {
    const char1 = str.charCodeAt(i++);
    const char2 = i < str.length ? str.charCodeAt(i++) : NaN;
    const char3 = i < str.length ? str.charCodeAt(i++) : NaN;
    
    const enc1 = char1 >> 2;
    const enc2 = ((char1 & 3) << 4) | (char2 >> 4);
    const enc3 = ((char2 & 15) << 2) | (char3 >> 6);
    const enc4 = char3 & 63;
    
    result += base64Chars.charAt(enc1) + base64Chars.charAt(enc2);
    result += isNaN(char2) ? '==' : (isNaN(char3) ? base64Chars.charAt(enc3) + '=' : base64Chars.charAt(enc3) + base64Chars.charAt(enc4));
  }
  
  return result;
}

function fromBase64(str: string): string {
  let result = '';
  str = str.replace(/=+$/, '');
  
  for (let i = 0; i < str.length; i += 4) {
    const enc1 = base64Chars.indexOf(str.charAt(i));
    const enc2 = base64Chars.indexOf(str.charAt(i + 1));
    const enc3 = base64Chars.indexOf(str.charAt(i + 2));
    const enc4 = base64Chars.indexOf(str.charAt(i + 3));
    
    const char1 = (enc1 << 2) | (enc2 >> 4);
    const char2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const char3 = ((enc3 & 3) << 6) | enc4;
    
    result += String.fromCharCode(char1);
    if (enc3 !== -1) result += String.fromCharCode(char2);
    if (enc4 !== -1) result += String.fromCharCode(char3);
  }
  
  return result;
}

class SecureStorageService {
  private static instance: SecureStorageService;
  private readonly obfuscationKey = 'AI_TUTOR_SEC_2024';

  private constructor() {}

  static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Store authentication tokens securely
   */
  async setAuthTokens(accessToken: string, refreshToken: string): Promise<boolean> {
    try {
      const tokenData = JSON.stringify({ accessToken, refreshToken });
      await AsyncStorage.setItem(`${SECURE_PREFIX}auth_tokens`, this.encode(tokenData));
      console.log('🔒 Auth tokens stored');
      return true;
    } catch (error) {
      console.error('Failed to store auth tokens:', error);
      return false;
    }
  }

  /**
   * Get authentication tokens
   */
  async getAuthTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const stored = await AsyncStorage.getItem(`${SECURE_PREFIX}auth_tokens`);
      if (stored) {
        return JSON.parse(this.decode(stored));
      }
      return null;
    } catch (error) {
      console.error('Failed to get auth tokens:', error);
      return null;
    }
  }

  /**
   * Clear authentication tokens
   */
  async clearAuthTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${SECURE_PREFIX}auth_tokens`);
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
    }
  }

  /**
   * Store user credentials securely
   */
  async setCredentials(phone: string, password?: string): Promise<boolean> {
    try {
      const credentialData = JSON.stringify({ phone, password });
      await AsyncStorage.setItem(`${SECURE_PREFIX}credentials`, this.encode(credentialData));
      return true;
    } catch (error) {
      console.error('Failed to store credentials:', error);
      return false;
    }
  }

  /**
   * Get stored credentials
   */
  async getCredentials(): Promise<{ phone: string; password?: string } | null> {
    try {
      const stored = await AsyncStorage.getItem(`${SECURE_PREFIX}credentials`);
      if (stored) {
        return JSON.parse(this.decode(stored));
      }
      return null;
    } catch (error) {
      console.error('Failed to get credentials:', error);
      return null;
    }
  }

  /**
   * Clear credentials
   */
  async clearCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${SECURE_PREFIX}credentials`);
    } catch (error) {
      console.error('Failed to clear credentials:', error);
    }
  }

  /**
   * Store any sensitive data
   */
  async setSecureItem(key: string, value: any): Promise<boolean> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(`${SECURE_PREFIX}${key}`, this.encode(stringValue));
      return true;
    } catch (error) {
      console.error(`Failed to store secure item ${key}:`, error);
      return false;
    }
  }

  /**
   * Get sensitive data
   */
  async getSecureItem<T = any>(key: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(`${SECURE_PREFIX}${key}`);
      if (stored) {
        const decoded = this.decode(stored);
        try {
          return JSON.parse(decoded);
        } catch {
          return decoded as T;
        }
      }
      return null;
    } catch (error) {
      console.error(`Failed to get secure item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove sensitive data
   */
  async removeSecureItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${SECURE_PREFIX}${key}`);
    } catch (error) {
      console.error(`Failed to remove secure item ${key}:`, error);
    }
  }

  /**
   * Check if biometric authentication is available
   * (Not available without native module)
   */
  async isBiometricAvailable(): Promise<boolean> {
    return false;
  }

  /**
   * Clear all secure storage
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(k => k.startsWith(SECURE_PREFIX));
      await AsyncStorage.multiRemove(secureKeys);
      console.log('🔒 All secure storage cleared');
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
    }
  }

  // Simple XOR obfuscation with base64 encoding
  // Note: For true security, rebuild app with react-native-keychain
  
  private encode(data: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ this.obfuscationKey.charCodeAt(i % this.obfuscationKey.length)
      );
    }
    return toBase64(result);
  }

  private decode(data: string): string {
    const decoded = fromBase64(data);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ this.obfuscationKey.charCodeAt(i % this.obfuscationKey.length)
      );
    }
    return result;
  }
}

export const secureStorage = SecureStorageService.getInstance();
export default secureStorage;
