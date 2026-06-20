// We use Web Crypto API for AES-GCM as it is native and highly optimized in browsers.
import { toBase64, fromBase64 } from './key-exchange';

export interface EncryptedPayload {
  ciphertext: string; // Base64
  nonce: string;      // Base64
  authTag: string;    // Base64 (WebCrypto appends authTag to ciphertext, we split it for standard DB storage)
}

/**
 * Generates a random AES-256-GCM Conversation Key
 */
export const generateConversationKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable so we can encrypt and share it
    ["encrypt", "decrypt"]
  );
};

export const exportKey = async (key: CryptoKey): Promise<Uint8Array> => {
  const raw = await window.crypto.subtle.exportKey("raw", key);
  return new Uint8Array(raw);
};

export const importKey = async (rawKey: Uint8Array): Promise<CryptoKey> => {
  return await window.crypto.subtle.importKey(
    "raw",
    rawKey as BufferSource,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypts an AES Conversation Key using a derived X25519 Shared Secret
 * (We wrap the raw AES key using AES-GCM with the shared secret acting as the wrapping key)
 */
export const encryptConversationKeyForDevice = async (
  rawConversationKey: Uint8Array,
  sharedSecret: Uint8Array
): Promise<string> => {
  const wrappingKey = await window.crypto.subtle.importKey(
    "raw",
    sharedSecret.slice(0, 32), // Ensure exactly 256 bits
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    wrappingKey,
    rawConversationKey as BufferSource
  );

  // Prepend IV to ciphertext for easy transport (since it's just a wrapped key)
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return toBase64(combined);
};

export const decryptConversationKeyFromDevice = async (
  encryptedBase64: string,
  sharedSecret: Uint8Array
): Promise<CryptoKey> => {
  const combined = fromBase64(encryptedBase64);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);

  const wrappingKey = await window.crypto.subtle.importKey(
    "raw",
    sharedSecret.slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const rawConversationKey = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    wrappingKey,
    data
  );

  return importKey(new Uint8Array(rawConversationKey));
};

/**
 * Encrypts string content using AES-GCM
 */
export const encryptMessage = async (content: string, key: CryptoKey): Promise<EncryptedPayload> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  // WebCrypto appends the 16-byte Auth Tag to the end of the ciphertext
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const ciphertextBytes = encryptedBytes.slice(0, encryptedBytes.length - 16);
  const authTagBytes = encryptedBytes.slice(encryptedBytes.length - 16);

  return {
    ciphertext: toBase64(ciphertextBytes),
    nonce: toBase64(iv),
    authTag: toBase64(authTagBytes)
  };
};

/**
 * Decrypts string content using AES-GCM
 */
export const decryptMessage = async (payload: EncryptedPayload, key: CryptoKey): Promise<string> => {
  const ciphertext = fromBase64(payload.ciphertext);
  const nonce = fromBase64(payload.nonce);
  const authTag = fromBase64(payload.authTag);

  // Recombine for WebCrypto
  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext);
  combined.set(authTag, ciphertext.length);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce as BufferSource },
    key,
    combined as BufferSource
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};
