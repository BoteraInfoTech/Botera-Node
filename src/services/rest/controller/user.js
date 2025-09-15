import { v4 } from 'uuid';
import jwt from 'jsonwebtoken';
import MongoDB from '../../../mongoDB';
import config from '../../../config';
import * as userQueries from '../../../mongoDB/queries/user';
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
    timeFormate: 12,
    dateFormate: 'dd-mm-yyyy',
    mode: 'D',
  };
  await userQueries.createUserQuery(MongoDB, { ...userData });
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

export const getUserDetail = async (req, res) => {
  const userDetails = req.userData;
  res.send({
    message: 'User detail fetch SuccessFully',
    response: {
      userDetails,
    },
  });
};

export const refreshToken = (req, res) => {
  const token = (req.cookies && req.cookies.refreshToken) || req.body.token;
  if (!token)
    return res.status(401).json({ error: 'Re-Authentication required' });

  const { jwtSecrete } = config.passManager;
  const userInfo = jwt.verify(token, jwtSecrete);
  if (!userInfo)
    return res.status(403).json({ error: 'Re-Authentication required' });

  const { id: userId, email } = userInfo;
  const accessToken = generateAccessToken({
    userId,
    email,
  });

  res.json({ message: 'Token refresh Successfully', accessToken });
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken', { path: '/refresh' });
  res.json({ message: 'Logged out' });
};

export const updateUser = async (req, res) => {
  const dataToUpdate = req.validData;
  const userdata = req.userData;
  const { userId } = userdata;
  await userQueries.updateUserByCondition(
    { userId },
    {
      ...dataToUpdate,
    }
  );
  res.send({
    message: 'User Updated SuccessFully',
    response: {
      ...userdata,
      ...dataToUpdate,
    },
  });
};

export const deleteUser = async (req, res) => {
  const userdata = req.userData;
  const { userId } = userdata;
  await userQueries.updateUserByCondition({ userId });
  res.send({
    message: 'User Deleted SuccessFully',
    response: {
      isDeleted: true,
    },
  });
};
