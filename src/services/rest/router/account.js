import express from 'express';
import auth from '../middleware/auth';
import { connectAccountResolveExisting } from '../middleware/account';
import {
  connectAccount,
  listConnectedAccounts,
  deleteAccount,
} from '../controller/account';
import { isValidSearchQuery, isValidAccount } from '../validator/account';
import { validatorError } from '../error';

const router = express.Router();

router.post(
  '/connectAccount',
  auth(['O']),
  connectAccountResolveExisting,
  connectAccount
);
router.get(
  '/listConnectedAccounts',
  auth(['O']),
  validatorError([isValidSearchQuery]),
  listConnectedAccounts
);

router.delete(
  '/delete/:id',
  auth(['O']),
  validatorError([isValidAccount]),
  deleteAccount
);

export default router;
