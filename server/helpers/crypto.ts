import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function generateApiKey(userId, projectId) {
  const keyData = `user:${userId}-project:${projectId}`;
  return encrypt(keyData);
}

function decryptApiKey(apiKey) {
  try {
    const decryptedKey = decrypt(apiKey);
    if (!decryptedKey.includes('user') || !decryptedKey.includes('project')) {
      return null;
    }
    const keyData = decryptedKey.split('-');
    const userId = keyData[0].split(':')[1];
    const projectId = keyData[1].split(':')[1];
    return { userId, projectId };
  } catch (err) {
    console.error('Failed to decrypt ApiKey:', err);
    return null;
  }
}

export { encrypt, decrypt, generateApiKey, decryptApiKey };
