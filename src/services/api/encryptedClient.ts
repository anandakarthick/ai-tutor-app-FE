/**
 * Encrypted API Client (DEPRECATED)
 * 
 * NOTE: E2E encryption is now built directly into the main client.ts
 * This file is kept for backward compatibility only.
 * 
 * Use the main apiClient from './client' instead.
 */

import apiClient, {initializeEncryption, isEncryptionReady, getEncryptionStatus} from './client';
import encryptionService from '../EncryptionService';
import type {ApiResponse} from '../../types/api';

class EncryptedApiClient {
  /**
   * Perform key exchange with server
   * @deprecated Use initializeEncryption() from client.ts instead
   */
  async performHandshake(): Promise<boolean> {
    return initializeEncryption();
  }

  /**
   * Check if encryption is available
   */
  isEncryptionAvailable(): boolean {
    return isEncryptionReady();
  }

  /**
   * Get encryption status
   */
  getStatus() {
    return getEncryptionStatus();
  }

  /**
   * Send encrypted POST request
   * @deprecated All requests are now automatically encrypted via client.ts
   */
  async encryptedPost<T>(
    endpoint: string,
    data: any,
    forceEncrypt: boolean = false
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.post<ApiResponse<T>>(endpoint, data);
    return response.data;
  }

  /**
   * Send encrypted GET request
   * @deprecated All requests are now automatically encrypted via client.ts
   */
  async encryptedGet<T>(
    endpoint: string,
    params?: any
  ): Promise<ApiResponse<T>> {
    const response = await apiClient.get<ApiResponse<T>>(endpoint, { params });
    return response.data;
  }

  /**
   * Encrypt sensitive fields in an object
   */
  encryptSensitiveFields<T extends object>(data: T, fields: string[]): T {
    if (!encryptionService.isReady() || !encryptionService.hasServerKey()) {
      return data;
    }

    const encrypted = { ...data } as any;
    
    for (const field of fields) {
      if (encrypted[field] !== undefined) {
        try {
          const encryptedValue = encryptionService.encryptAsymmetric(
            String(encrypted[field])
          );
          encrypted[field] = {
            encrypted: true,
            ...encryptedValue,
          };
        } catch (error) {
          console.error(`Failed to encrypt field ${field}:`, error);
        }
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
    if (!encryptionService.isReady() || !encryptionService.hasServerKey()) {
      return message;
    }

    try {
      const encrypted = encryptionService.encryptAsymmetric(message);
      return {
        encrypted: true,
        content: JSON.stringify(encrypted),
      };
    } catch (error) {
      console.error('Failed to encrypt message:', error);
      return message;
    }
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
}

export const encryptedApiClient = new EncryptedApiClient();
export default encryptedApiClient;
