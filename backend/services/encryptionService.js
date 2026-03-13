const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const TAG_LENGTH = 16;

function encrypt(buffer, keyHex) {
  // Buffer from hex key string
  const key = keyHex
    ? Buffer.from(keyHex.padEnd(64, '0').slice(0, 64), 'hex')
    : crypto.randomBytes(32);

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  // iv + tag + data
  return Buffer.concat([iv, tag, encrypted]);
}

function decrypt(encryptedBuffer, keyHex) {
  const key = keyHex
    ? Buffer.from(keyHex.padEnd(64, '0').slice(0, 64), 'hex')
    : null;

  if (!key) throw new Error('Decryption key required');

  const iv = encryptedBuffer.slice(0, IV_LENGTH);
  const tag = encryptedBuffer.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = encryptedBuffer.slice(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

module.exports = { encrypt, decrypt };
