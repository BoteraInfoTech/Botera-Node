import express from 'express';
import auth from '../middleware/auth';
import { getAuthUrl, getAccountDetails } from '../controller/auth';
import { validAccountId, isCodeValid } from '../validator/auth';
import { validatorError } from '../error';

const router = express.Router();

router.get(
  '/auth-url',
  auth(['O']),
  validatorError([validAccountId]),
  getAuthUrl
);

router.get(
  '/getDetails',
  auth(['O']),
  validatorError([validAccountId, isCodeValid]),
  getAccountDetails
);

export default router;
