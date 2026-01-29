import config from '../../../config';
import { err } from '../error';

const setData = (req, data) => {
  if (req.validData) {
    Object.assign(req.validData, {
      ...data,
    });
  } else {
    req.validData = { ...data };
  }
};

export const validAccountId = (req) => {
  try {
    const { id } = req.query;
    const accountId = Number(id);
    const accountConfig = config.account;
    const validAccounts = accountConfig.validAccountIds;
    if (!accountId || !validAccounts.includes(accountId)) {
      return err('Invalid Account Selection', 'accountId');
    }
    setData(req, { accountId });
  } catch (e) {
    return err(e.message || 'Invalid Account Selection', 'accountId');
  }
  return null;
};

export const isCodeValid = (req) => {
  const { accountId } = req.validData;
  const { code } = req.query;

  let error = null;
  switch (accountId) {
    case 1:
    case 2: {
      if (!code || typeof code !== 'string') {
        error = err('Authentication Failed Please Retry', 'code');
      }
      break;
    }
    default: {
      if (!code) {
        error = err('Authentication Failed Please Retry', 'code');
      }
      break;
    }
  }

  if (error) {
    return error;
  }
  setData(req, { code });
  return null;
};
