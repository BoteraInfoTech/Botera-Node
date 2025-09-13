import express from 'express';
import { validatorError } from '../error';
import {
  isValidEmail,
  isValidPassword,
  isPhoneNumberValid,
  decidePromotedCredits,
  getUserLocation,
  isBlockedRegion,
  isUserExist,
  isValidCredentials,
} from '../validator/user';
import { createUser, login } from '../controller/user';

const router = express.Router();

router.post(
  '/singUp',
  validatorError([
    isValidEmail,
    isValidPassword,
    isPhoneNumberValid,
    decidePromotedCredits,
    getUserLocation,
    isBlockedRegion,
  ]),
  createUser
);

router.post('/login', validatorError([isUserExist, isValidCredentials]), login);

export default router;
