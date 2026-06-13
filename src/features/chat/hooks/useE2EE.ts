import { useState, useEffect } from 'react';
import { generateDeviceKeyPair, KeyPair, toBase64 } from '../crypto/key-exchange';

export const useE2EE = (userId: string) => {
  const [deviceKeys, setDeviceKeys] = useState<KeyPair | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // Basic bootstrapping logic. In production, this checks IndexedDB or secure local storage.
    const bootstrapDevice = async () => {
      const storedKeys = localStorage.getItem(`e2ee_keys_${userId}`);
      if (storedKeys) {
        // We assume for this prototype they are stored in base64 plaintext.
        // In reality, this should use `decryptPrivateKeyLocal` with the Argon2id Master Key.
        const parsed = JSON.parse(storedKeys);
        setDeviceKeys({
          publicKey: new Uint8Array(Buffer.from(parsed.publicKey, 'base64')),
          privateKey: new Uint8Array(Buffer.from(parsed.privateKey, 'base64')),
        });
        setDeviceId(parsed.deviceId);
        setIsRegistered(true);
      } else {
        // Generate new device keys
        const keys = await generateDeviceKeyPair();
        const newDeviceId = crypto.randomUUID();
        
        // Store locally
        localStorage.setItem(`e2ee_keys_${userId}`, JSON.stringify({
          deviceId: newDeviceId,
          publicKey: toBase64(keys.publicKey),
          privateKey: toBase64(keys.privateKey),
        }));

        setDeviceKeys(keys);
        setDeviceId(newDeviceId);
        
        // In a full implementation, we'd call the API to register the device here
        // await api.post('/chat/devices/register', { deviceId: newDeviceId, devicePublicKey: toBase64(keys.publicKey), deviceName: navigator.userAgent })
        setIsRegistered(true);
      }
    };

    if (userId) {
      bootstrapDevice();
    }
  }, [userId]);

  return { deviceKeys, deviceId, isRegistered };
};
