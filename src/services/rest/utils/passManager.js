import crypto from 'crypto';

export const hashPassword = (password, salt) => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return { salt, hash };
};

export const verifyPassword = (password, salt, hash) => {
  const hashed = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return hashed === hash;
};

export const createSalt = (secrete, email) => {
  const timestamp = Date.now().toString();
  const raw = `${secrete}-${email}-${timestamp}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};
