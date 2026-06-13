import sodium from 'libsodium-wrappers';
import { initSodium, toBase64 } from './key-exchange';

/**
 * Derives a strong master key from the user's password using Argon2id.
 * This master key is used to encrypt their Device Private Key so it can be safely stored
 * in local storage, or backed up to the server if they want cross-device portability without losing keys.
 */
export const deriveMasterKey = async (password: string, saltHex: string): Promise<Uint8Array> => {
  await initSodium();
  
  const salt = Buffer.from(saltHex, 'hex');
  
  // Generate 32-byte key using Argon2id
  return sodium.crypto_pwhash(
    32, // key length
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );
};

export const encryptPrivateKeyLocal = async (privateKey: Uint8Array, masterKey: Uint8Array): Promise<string> => {
  await initSodium();
  
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_secretbox_easy(privateKey, nonce, masterKey);
  
  // Prepend nonce to ciphertext
  const combined = new Uint8Array(nonce.length + ciphertext.length);
  combined.set(nonce);
  combined.set(ciphertext, nonce.length);
  
  return toBase64(combined);
};

export const decryptPrivateKeyLocal = async (encryptedBase64: string, masterKey: Uint8Array): Promise<Uint8Array> => {
  await initSodium();
  
  const combined = new Uint8Array(Buffer.from(encryptedBase64, 'base64'));
  const nonce = combined.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = combined.slice(sodium.crypto_secretbox_NONCEBYTES);
  
  const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, masterKey);
  if (!decrypted) throw new Error("Failed to decrypt local private key - incorrect master key");
  
  return decrypted;
};
