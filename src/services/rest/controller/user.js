import { v4 } from 'uuid';
import MongoDB from '../../../mongoDB';
import { createUserQuery } from '../../../mongoDB/queries/user';
import { sendAnonymousPosthogEvent } from '../../../utils/cio';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/tokenManager';

const removeKeyFromObj = (obj, keys) => keys.forEach((key) => delete obj[key]);

export const createUser = async (req, res) => {
  const userData = {
    ...req.validData,
    userId: v4(),
    language: 'us-en',
    role: 'O',
    status: 'A',
    isEmailVerified: false,
    createdAt: new Date().getTime(),
    lastLoginAt: new Date().getTime(),
  };
  await createUserQuery(MongoDB, { ...userData });
  removeKeyFromObj(userData, ['password', 'salt', 'createdAt', 'lastLoginAt']);
  const { userId, email, createdOn, companySize, country } = userData;

  // generate Tokens
  const accessToken = generateAccessToken({
    userId,
    email,
  });
  const refreshToken = generateRefreshToken({
    userId,
    email,
  });

  // User Tracking : third party logs
  await sendAnonymousPosthogEvent(
    'User Register',
    userId,
    {
      createdOn,
      email,
      companySize,
    },
    { country, email }
  );

  // set Refresh token to Http Cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  res.send({
    message: 'User Registered Successfully',
    userData: {
      ...userData,
    },
    accessToken,
  });
};

export const login = async (req, res) => {
  const { userData } = req.validData;
  const { email, userId } = userData;

  const accessToken = generateAccessToken({
    userId,
    email,
  });
  const refreshToken = generateRefreshToken({
    userId,
    email,
  });

  await sendAnonymousPosthogEvent('User Login', userId, {
    email,
  });

  // set Refresh token to Http Cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });
  res.send({
    message: 'User login Successfully',
    accessToken,
    userData: {
      userId,
      email,
    },
  });
};
