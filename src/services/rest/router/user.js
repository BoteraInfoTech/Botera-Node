import express from 'express';
import { validatorError } from '../error';
import auth from '../middleware/auth';
import {
  isValidEmail,
  isValidPassword,
  isPhoneNumberValid,
  decidePromotedCredits,
  getUserLocation,
  isBlockedRegion,
  isUserExist,
  isValidCredentials,
  isLanguageValid,
  isValidTimeZone,
} from '../validator/user';
import {
  createUser,
  login,
  getUserDetail,
  refreshToken,
  logout,
  updateUser,
  deleteUser,
} from '../controller/user';

const router = express.Router();

// open Endpoints
router.post(
  '/singUp',
  validatorError([
    isValidEmail,
    isValidPassword,
    isPhoneNumberValid,
    decidePromotedCredits,
    getUserLocation,
    isBlockedRegion,
    isLanguageValid,
    isValidTimeZone,
  ]),
  createUser
);

router.post('/login', validatorError([isUserExist, isValidCredentials]), login);

router.post('/refreshToken', refreshToken);

router.get('/logout', logout);

// secure Endpoints
router.get('/details', auth(['O']), getUserDetail);

router.put(
  '/update',
  auth(['O']),
  validatorError([
    isValidEmail,
    isValidPassword,
    isPhoneNumberValid,
    isBlockedRegion,
    isLanguageValid,
    isValidTimeZone,
  ]),
  updateUser
);

router.delete('/delete', auth(['O']), deleteUser);

export default router;
