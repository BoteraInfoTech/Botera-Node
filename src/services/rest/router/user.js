import express from 'express';
import { validatorError } from '../error';
import {
  isValidEmail,
  isValidPassword,
  isPhoneNumberValid,
  decidePromotedCredits,
  getUserLocation,
} from '../validator/user';

const router = express.Router();

router.post(
  '/singUp',
  validatorError([
    isValidEmail,
    isValidPassword,
    isPhoneNumberValid,
    decidePromotedCredits,
    getUserLocation,
  ]),
  (req, res) => {
    res.send({ data: req.validData });
  }
);

export default router;
