import sodium from 'libsodium-wrappers';

let isReady = false;

export const initSodium = async () => {
  if (!isReady) {
    await sodium.ready;
    isReady = true;
  }
};

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

/**
 * Generates an X25519 keypair for the device.
 */
export const generateDeviceKeyPair = async (): Promise<KeyPair> => {
  await initSodium();
  const keypair = sodium.crypto_kx_keypair();
  return {
    publicKey: keypair.publicKey,
    privateKey: keypair.privateKey,
  };
};

/**
 * Derives a shared symmetric key from a local private key and a remote public key
 * using X25519 Key Exchange.
 */
export const deriveSharedSecret = async (
  localPrivateKey: Uint8Array,
  localPublicKey: Uint8Array,
  remotePublicKey: Uint8Array
): Promise<Uint8Array> => {
  await initSodium();
  // Generate a shared Rx/Tx key based on X25519
  const clientKeys = sodium.crypto_kx_client_session_keys(
    localPublicKey,
    localPrivateKey,
    remotePublicKey
  );
  
  // For simplicity, we just use the shared tx key as a raw entropy mix
  // Since we only need one shared secret to wrap the AES conversation key
  return clientKeys.sharedTx;
};

// Helpers
export const toBase64 = (data: Uint8Array): string => {
  return Buffer.from(data).toString('base64');
};

export const fromBase64 = (base64: string): Uint8Array => {
  return new Uint8Array(Buffer.from(base64, 'base64'));
};
