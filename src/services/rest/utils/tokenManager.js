import jwt from 'jsonwebtoken';
import config from '../../../config';

const { jwtSecrete, accessTokenExpire, refreshTokenExpire } =
  config.passManager;

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user.userId, email: user.email }, jwtSecrete, {
    expiresIn: accessTokenExpire,
  });
};

export const generateRefreshToken = (user) => {
  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecrete, {
    expiresIn: refreshTokenExpire,
  });
  return token;
};
