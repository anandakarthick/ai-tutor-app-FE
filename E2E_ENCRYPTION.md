# End-to-End Encryption (E2E) Implementation

## Overview

The AI Tutor app now supports end-to-end encryption for sensitive data using the TweetNaCl library (NaCl - Networking and Cryptography library).

## Architecture

```
┌─────────────────┐                    ┌─────────────────┐
│   Mobile App    │                    │     Backend     │
├─────────────────┤                    ├─────────────────┤
│                 │                    │                 │
│  ┌───────────┐  │   1. Handshake     │  ┌───────────┐  │
│  │ KeyPair   │──┼───────────────────►│  │ KeyPair   │  │
│  │ (Public,  │  │   Exchange keys    │  │ (Public,  │  │
│  │  Secret)  │◄─┼───────────────────┤│  │  Secret)  │  │
│  └───────────┘  │                    │  └───────────┘  │
│       │         │                    │       │         │
│       ▼         │                    │       ▼         │
│  ┌───────────┐  │   2. Encrypted     │  ┌───────────┐  │
│  │ Encrypt   │──┼──────Request──────►│  │ Decrypt   │  │
│  │ with      │  │                    │  │ with      │  │
│  │ Server    │  │                    │  │ Server    │  │
│  │ PubKey    │  │   3. Encrypted     │  │ SecKey    │  │
│  │           │◄─┼─────Response──────┤│  │           │  │
│  └───────────┘  │                    │  └───────────┘  │
│                 │                    │                 │
└─────────────────┘                    └─────────────────┘
```

## Cryptographic Details

- **Algorithm**: NaCl Box (X25519 + XSalsa20 + Poly1305)
- **Key Exchange**: X25519 (Curve25519 ECDH)
- **Encryption**: XSalsa20-Poly1305 (authenticated encryption)
- **Key Size**: 256-bit (32 bytes)
- **Nonce Size**: 192-bit (24 bytes)

## Frontend Implementation

### Files Created

| File | Description |
|------|-------------|
| `src/services/EncryptionService.ts` | Core encryption/decryption service |
| `src/services/SecureStorage.ts` | Secure key storage using Keychain |
| `src/services/api/encryptedClient.ts` | Encrypted API client wrapper |

### Usage

```typescript
import { encryptionService, encryptedApiClient, secureStorage } from '../services';

// Initialize encryption (call once at app startup)
await encryptionService.initialize();

// Perform handshake with server
await encryptedApiClient.performHandshake();

// Send encrypted request
const response = await encryptedApiClient.encryptedPost('/auth/login', {
  phone: '9876543210',
  otp: '123456',
});

// Encrypt a message
const encrypted = encryptionService.encryptAsymmetric('Hello, World!');

// Decrypt a message
const decrypted = encryptionService.decryptAsymmetric(encrypted);

// Secure storage
await secureStorage.setAuthTokens(accessToken, refreshToken);
const tokens = await secureStorage.getAuthTokens();
```

### Key Storage

Keys are stored securely using:
1. **react-native-keychain** (primary) - Uses iOS Keychain / Android Keystore
2. **AsyncStorage with encryption** (fallback)

## Backend Implementation

### Files Created

| File | Description |
|------|-------------|
| `src/services/encryption.service.ts` | Server-side encryption service |
| `src/middlewares/encryption.ts` | Request/response encryption middleware |

### Environment Variables

Add to `.env`:
```
# Optional: Pre-generated encryption key
# If not set, a new key will be generated on startup
ENCRYPTION_SECRET_KEY=base64_encoded_32_byte_key
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/handshake` | Exchange public keys |
| `GET /api/v1/auth/public-key` | Get server's public key |

### Middleware Usage

```typescript
import { e2eEncryption } from '../middlewares/encryption';

// Apply to sensitive routes
router.post('/login', e2eEncryption, async (req, res) => {
  // Request body is automatically decrypted
  const { phone, otp } = req.body;
  
  // Response is automatically encrypted if request was encrypted
  res.json({ success: true, data: result });
});
```

## Encrypted Request Format

```json
{
  "encrypted": true,
  "payload": {
    "ciphertext": "base64_encoded_ciphertext",
    "nonce": "base64_encoded_nonce",
    "publicKey": "base64_encoded_sender_public_key"
  }
}
```

## Encrypted Response Format

```json
{
  "encrypted": true,
  "payload": {
    "ciphertext": "base64_encoded_ciphertext",
    "nonce": "base64_encoded_nonce",
    "publicKey": "base64_encoded_server_public_key"
  }
}
```

## Protected Endpoints

The following endpoints support E2E encryption:
- `/auth/login` - Login credentials
- `/auth/register` - Registration data
- `/auth/login/password` - Password-based login
- `/doubts` - Student questions (contains personal learning data)
- `/learning/session` - Learning session messages

## Security Considerations

1. **Perfect Forward Secrecy**: Each session can use unique ephemeral keys
2. **Authentication**: NaCl Box provides authenticated encryption
3. **Key Protection**: Private keys never leave the device
4. **Replay Protection**: Nonces are random and unique per message

## Installation

### Frontend
```bash
cd D:\cladue\ai-tutor-app-FE
npm install tweetnacl tweetnacl-util react-native-keychain
```

### Backend
```bash
cd D:\cladue\ai-tutor-app-BE
npm install tweetnacl tweetnacl-util
```

## Testing Encryption

```typescript
// Test encryption/decryption
import { encryptionService } from '../services';

await encryptionService.initialize();

const original = 'Test message';
const encrypted = encryptionService.encryptAsymmetric(original);
console.log('Encrypted:', encrypted);

// Note: Decryption requires server's key for asymmetric
// For testing, use symmetric encryption:
await encryptionService.generateSessionKey();
const symEncrypted = encryptionService.encryptSymmetric(original);
const decrypted = encryptionService.decryptSymmetric(
  symEncrypted.ciphertext,
  symEncrypted.nonce
);
console.log('Decrypted:', decrypted);
```

## Fallback Behavior

If encryption handshake fails:
1. App continues to work normally without encryption
2. Warning is logged to console
3. Sensitive data is still protected by HTTPS transport encryption

## Future Enhancements

1. **Session Key Rotation**: Periodic key refresh for long sessions
2. **Message Signing**: Add digital signatures for non-repudiation
3. **Biometric-Protected Keys**: Use biometrics to unlock encryption keys
4. **Offline Encryption**: Encrypt local cached data
