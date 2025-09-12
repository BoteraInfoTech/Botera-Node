import validator from 'validator';
import config from '../../../config';
import { err } from '../error';
import { createSalt, hashPassword } from '../utils/passManager';
import { getUserIPLocation } from '../../../utils/getIPLocation';

const setData = (req, data) => {
  if (req.validData) {
    Object.assign(req.validData, {
      ...data,
    });
  } else {
    req.validData = { ...data };
  }
};

export const isValidEmail = (req) => {
  const { email = '' } = req.body;
  if (!email) return err('Email is required', 'email');

  const isValidEmailFormat = validator.isEmail(email);
  if (!isValidEmailFormat) return err('Email is Invalid', 'email');

  const normalizeEmail = validator.normalizeEmail(email, {
    gmail_remove_dots: true,
    all_lowercase: true,
  });

  setData(req, { email: normalizeEmail });
  return null;
};

export const isValidPassword = (req) => {
  const slat = config.passManager.salt;
  const { password = '' } = req.body;
  if (!password) return err('Password is required', 'password');

  const isStrongPass = validator.isStrongPassword(password);
  if (!isStrongPass) return err('Password must be a strong', 'password');

  const { hash: encodePassword } = hashPassword(password, createSalt(slat));
  setData(req, { password: encodePassword });
  return null;
};

export const decidePromotedCredits = (req) => {
  const { companySize = 'small' } = req.body;

  const creditPlan = config.plan.promoteCredit;
  const validSize = Object.keys(creditPlan);

  if (!validSize.includes(companySize))
    return err('Invalid company strength', 'companySize');

  const totalCredit = creditPlan[companySize] || 0;
  setData(req, { totalCredit });
  return null;
};

export const isPhoneNumberValid = (req) => {
  const { phoneNumber } = req.body;
  const phoneNumberRegex = /^\+\d+\s?(\(\d+\))?[\d\s-]+$/;
  if (!phoneNumber) return null;
  const isValidNumber = phoneNumberRegex.test(phoneNumber);
  if (!isValidNumber) return err('Invalid phone number');
  setData(req, { phoneNumber });
  return null;
};

export const getUserLocation = async (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const location = await getUserIPLocation(ip);
  setData(req, {
    ip,
    country: location.country,
  });
  return null;
};
