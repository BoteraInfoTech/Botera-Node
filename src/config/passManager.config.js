export default {
  salt: process.env.SECRET_SALT,
  algorithm: process.env.SECRET_ALGO,
  secretValue: process.env.SECRET_KEY,
  secretIV: process.env.SECRET_IV,
  jwtSecrete: process.env.JWT_ACCESS_SECRET,
  accessTokenExpire: process.env.ACCESS_TOKEN_EXPIRES,
  refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRES,
};
