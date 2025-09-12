import crypto from 'crypto';
import config from '../config';

const passWordConfig = config.passManager;
const ALGORITHM = passWordConfig.algorithm;
const secretValue = passWordConfig.secretValue;
const secretIV = passWordConfig.secretIV;

const SECRET_KEY = crypto.createHash('sha256').update(secretValue).digest();
const IV = crypto.createHash('md5').update(secretIV).digest();

export function encrypt(text) {
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

export function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, IV);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
