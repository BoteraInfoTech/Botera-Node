export default {
  salt: process.env.SECRET_SALT,
  algorithm: process.env.SECRET_ALGO,
  secretValue: process.env.SECRET_KEY,
  secretIV: process.env.SECRET_IV,
};
