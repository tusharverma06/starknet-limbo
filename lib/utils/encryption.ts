import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment variable
 * In production, this should be stored securely (e.g., AWS Secrets Manager, environment variable)
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.WALLET_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("WALLET_ENCRYPTION_SECRET environment variable is not set");
  }

  // Derive a consistent key from the secret
  const salt = Buffer.from("limbo-wallet-salt"); // Fixed salt for key derivation
  return scryptSync(secret, salt, KEY_LENGTH);
}

/**
 * Encrypt a private key
 * @param privateKey - The private key to encrypt (hex string with or without 0x prefix)
 * @returns Encrypted data as a base64 string
 */
export function encryptPrivateKey(privateKey: string): string {
  try {
    // Remove 0x prefix if present
    const cleanKey = privateKey.startsWith("0x")
      ? privateKey.slice(2)
      : privateKey;

    // Generate random IV and salt
    const iv = randomBytes(IV_LENGTH);
    const salt = randomBytes(SALT_LENGTH);

    // Get encryption key
    const key = getEncryptionKey();

    // Create cipher
    const cipher = createCipheriv(ALGORITHM, key, iv);

    // Encrypt the private key
    const encrypted = Buffer.concat([
      cipher.update(cleanKey, "utf8"),
      cipher.final(),
    ]);

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Combine salt + iv + authTag + encrypted data
    const result = Buffer.concat([salt, iv, authTag, encrypted]);

    // Return as base64
    return result.toString("base64");
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt private key");
  }
}

/**
 * Decrypt a private key
 * @param encryptedData - The encrypted data as a base64 string
 * @returns Decrypted private key with 0x prefix
 */
export function decryptPrivateKey(encryptedData: string): string {
  try {
    // Convert from base64
    const buffer = Buffer.from(encryptedData, "base64");

    // Extract components
    // const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = buffer.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
    );
    const encrypted = buffer.subarray(
      SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
    );

    // Get encryption key
    const key = getEncryptionKey();

    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    // Return with 0x prefix
    return "0x" + decrypted.toString("utf8");
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt private key");
  }
}

/**
 * Validate that encryption/decryption works correctly
 */
export function testEncryption(): boolean {
  try {
    const testKey = "0x" + randomBytes(32).toString("hex");
    const encrypted = encryptPrivateKey(testKey);
    const decrypted = decryptPrivateKey(encrypted);
    return testKey === decrypted;
  } catch {
    return false;
  }
}
