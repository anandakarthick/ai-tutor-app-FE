/**
 * Encrypted API Client
 * Wraps API calls with E2E encryption for sensitive data
 */

import apiClient from './client';
import {ENDPOINTS} from './config';
import encryptionService from '../EncryptionService';
import type {ApiResponse} from '../../types/api';

// Endpoints that require encryption
const ENCRYPTED_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/doubts',
  '/learning/session',
];

// Response fields to decrypt
const ENCRYPTED_RESPONSE_FIELDS = ['message', 'content', 'aiAnswer', 'question'];

interface EncryptedRequest {
  encrypted: true;
  payload: {
    ciphertext: string;
    nonce: string;
    publicKey: string;
  };
}

interface EncryptedResponse<T> {
  encrypted: true;
  payload: {
    ciphertext: string;
    nonce: string;
    publicKey: string;
  };
  data?: T;
}

class EncryptedApiClient {
  private serverPublicKey: string | null = null;
  private isHandshakeComplete = false;

  /**
   * Perform key exchange with server
   */
  async performHandshake(): Promise<boolean> {
    try {
      console.log('🔐 Performing E2E handshake...');
      
      // Initialize encryption service
      if (!encryptionService.isReady()) {
        await encryptionService.initialize();
      }

      // Get client public key
      const clientPublicKey = encryptionService.getPublicKey();

      // Exchange keys with server
      const response = await apiClient.post<ApiResponse<{
        serverPublicKey: string;
        sessionKey?: string;
      }>>('/auth/handshake', {
        clientPublicKey,
      });

      if (response.data.success && response.data.data) {
        this.serverPublicKey = response.data.data.serverPublicKey;
        await encryptionService.setServerPublicKey(this.serverPublicKey);

        // If server provides encrypted session key, decrypt it
        if (response.data.data.sessionKey) {
          // Session key would be encrypted with our public key
          // For now, we'll use asymmetric encryption for each request
        }

        this.isHandshakeComplete = true;
        console.log('✅ E2E handshake complete');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ E2E handshake failed:', error);
      // Continue without encryption if handshake fails
      return false;
    }
  }

  /**
   * Check if encryption is available
   */
  isEncryptionAvailable(): boolean {
    return this.isHandshakeComplete && encryptionService.isReady() && encryptionService.hasServerKey();
  }

  /**
   * Send encrypted POST request
   */
  async encryptedPost<T>(
    endpoint: string,
    data: any,
    forceEncrypt: boolean = false
  ): Promise<ApiResponse<T>> {
    const shouldEncrypt = forceEncrypt || 
      (this.isEncryptionAvailable() && this.shouldEncryptEndpoint(endpoint));

    if (shouldEncrypt) {
      try {
        const encryptedPayload = encryptionService.encryptObject(data);
        
        const response = await apiClient.post<EncryptedResponse<T> | ApiResponse<T>>(
          endpoint,
          {
            encrypted: true,
            payload: encryptedPayload,
          }
        );

        // Check if response is encrypted
        if (this.isEncryptedResponse(response.data)) {
          const decrypted = this.decryptResponse<T>(response.data);
          return decrypted;
        }

        return response.data as ApiResponse<T>;
      } catch (error) {
        console.warn('Encrypted request failed, falling back to plain:', error);
        // Fallback to unencrypted
        const response = await apiClient.post<ApiResponse<T>>(endpoint, data);
        return response.data;
      }
    }

    const response = await apiClient.post<ApiResponse<T>>(endpoint, data);
    return response.data;
  }

  /**
   * Send encrypted GET request (query params encrypted in body)
   */
  async encryptedGet<T>(
    endpoint: string,
    params?: any
  ): Promise<ApiResponse<T>> {
    // GET requests typically don't have sensitive data in URL
    // But we can encrypt query params if needed
    const response = await apiClient.get<ApiResponse<T>>(endpoint, { params });
    
    // Decrypt response if encrypted
    if (this.isEncryptedResponse(response.data)) {
      return this.decryptResponse<T>(response.data as any);
    }

    return response.data;
  }

  /**
   * Encrypt sensitive fields in an object
   */
  encryptSensitiveFields<T extends object>(data: T, fields: string[]): T {
    if (!this.isEncryptionAvailable()) {
      return data;
    }

    const encrypted = { ...data } as any;
    
    for (const field of fields) {
      if (encrypted[field] !== undefined) {
        const encryptedValue = encryptionService.encryptAsymmetric(
          String(encrypted[field])
        );
        encrypted[field] = {
          encrypted: true,
          ...encryptedValue,
        };
      }
    }

    return encrypted;
  }

  /**
   * Decrypt sensitive fields in an object
   */
  decryptSensitiveFields<T extends object>(data: T, fields: string[]): T {
    if (!encryptionService.isReady()) {
      return data;
    }

    const decrypted = { ...data } as any;

    for (const field of fields) {
      if (decrypted[field]?.encrypted) {
        try {
          decrypted[field] = encryptionService.decryptAsymmetric({
            ciphertext: decrypted[field].ciphertext,
            nonce: decrypted[field].nonce,
            publicKey: decrypted[field].publicKey,
          });
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
        }
      }
    }

    return decrypted;
  }

  /**
   * Create encrypted message for chat/doubts
   */
  encryptMessage(message: string): { encrypted: boolean; content: string } | string {
    if (!this.isEncryptionAvailable()) {
      return message;
    }

    const encrypted = encryptionService.encryptAsymmetric(message);
    return {
      encrypted: true,
      content: JSON.stringify(encrypted),
    };
  }

  /**
   * Decrypt a message
   */
  decryptMessage(encryptedContent: any): string {
    if (typeof encryptedContent === 'string') {
      return encryptedContent;
    }

    if (encryptedContent?.encrypted && encryptedContent?.content) {
      try {
        const payload = JSON.parse(encryptedContent.content);
        return encryptionService.decryptAsymmetric(payload);
      } catch (error) {
        console.error('Failed to decrypt message:', error);
        return '[Encrypted message - decryption failed]';
      }
    }

    return String(encryptedContent);
  }

  // Private helper methods

  private shouldEncryptEndpoint(endpoint: string): boolean {
    return ENCRYPTED_ENDPOINTS.some(e => endpoint.includes(e));
  }

  private isEncryptedResponse(response: any): response is EncryptedResponse<any> {
    return response?.encrypted === true && response?.payload;
  }

  private decryptResponse<T>(encryptedResponse: EncryptedResponse<T>): ApiResponse<T> {
    const decrypted = encryptionService.decryptObject<ApiResponse<T>>(
      encryptedResponse.payload
    );
    return decrypted;
  }
}

export const encryptedApiClient = new EncryptedApiClient();
export default encryptedApiClient;
