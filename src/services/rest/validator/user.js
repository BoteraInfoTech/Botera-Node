import validator from 'validator';
import config from '../../../config';
import { err } from '../error';
import { createSalt, hashPassword, verifyPassword } from '../utils/passManager';
import { getUserIPLocation } from '../../../utils/getIPLocation';
import countryLanguages from '../../../utils/language';
import MongoDB from '../../../mongoDB';
import * as userQueries from '../../../mongoDB/queries/user';

const setData = (req, data) => {
  if (req.validData) {
    Object.assign(req.validData, {
      ...data,
    });
  } else {
    req.validData = { ...data };
  }
};

export const isValidEmail = async (req) => {
  const { email = '' } = req.body || {};
  if (!email) return err('Email is required', 'email');

  const isValidEmailFormat = validator.isEmail(email);
  if (!isValidEmailFormat) return err('Email is Invalid', 'email');

  const normalizeEmail = validator.normalizeEmail(email, {
    gmail_remove_dots: true,
    all_lowercase: true,
  });

  const userExist = await userQueries.findUserByCondition(MongoDB, {
    email: normalizeEmail,
  });
  if (userExist) return err('Email already Registered', 'email');

  setData(req, { email: normalizeEmail });
  return null;
};

export const isValidPassword = (req) => {
  const slat = config.passManager.salt;
  const { password = '' } = req.body;
  if (!password) return err('Password is required', 'password');

  const isStrongPass = validator.isStrongPassword(password);
  if (!isStrongPass) return err('Password must be a strong', 'password');

  const { hash: encodePassword, salt: newSalt } = hashPassword(
    password,
    createSalt(slat)
  );
  setData(req, { password: encodePassword, salt: newSalt });
  return null;
};

export const decidePromotedCredits = (req) => {
  const { companySize = 'small' } = req.body;

  const creditPlan = config.plan.promoteCredit;
  const validSize = Object.keys(creditPlan);

  if (!validSize.includes(companySize))
    return err('Invalid company strength', 'companySize');

  const totalCredit = creditPlan[companySize] || 0;
  setData(req, { totalCredit, companySize });
  return null;
};

export const isPhoneNumberValid = (req) => {
  const { phoneNumber } = req.body;
  const phoneNumberRegex = /^\+\d+\s?(\(\d+\))?[\d\s-]+$/;
  if (!phoneNumber) return null;
  const isValidNumber = phoneNumberRegex.test(phoneNumber);
  if (!isValidNumber) return err('Invalid phone number', 'phoneNumber');
  setData(req, { phoneNumber });
  return null;
};

export const getUserLocation = async (req) => {
  const ipLocation =
    req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  const allIps = ipLocation.split(',');
  const ip = allIps.find((ip) => ip);
  const location = await getUserIPLocation(ip);
  setData(req, {
    ip,
    country: location.country || 'unknown',
  });
  return null;
};

export const isBlockedRegion = async (req) => {
  const { country } = req.validData || req.body || {};
  const blockCountries = ['israel'];
  if (blockCountries.includes(country.toLowerCase()))
    return err('Your are not eligible Please contactSupport', 'country');
  return null;
};

export const isUserExist = async (req) => {
  const { email } = req.body;
  const normalizeEmail = validator.normalizeEmail(email, {
    gmail_remove_dots: true,
    all_lowercase: true,
  });
  const userData = await userQueries.findUserByCondition(
    MongoDB,
    {
      email: normalizeEmail,
    },
    { userId: 1, email: 1, password: 1, salt: 1 }
  );
  if (!userData) return err('User Not Found', 'email');
  setData(req, { userData });
};

export const isValidCredentials = async (req, haveError) => {
  if (haveError) return null;
  const { password } = req.body;
  const { userData } = req.validData || {};
  const { password: originalPassword, salt } = userData;
  const isValidPassword = verifyPassword(password, salt, originalPassword);
  if (!isValidPassword) return err('Invalid Credential', 'password');
  return null;
};

export const isLanguageValid = (req, haveError) => {
  if (haveError) return null;
  let { language } = req.body;
  if (!language) {
    const { country } = req.validData || {};
    const newLanguage = countryLanguages[country] || 'English';
    setData(req, { language: newLanguage });
  } else {
    const allLanguages = Object.values(countryLanguages);
    if (!allLanguages.includes(language))
      return err('Invalid Language Selection', 'language');
    setData(req, { language });
  }
  return null;
};

export const isValidTimeZone = (req) => {
  const { timeZone } = req.body;
  const allTimeZone = Intl.supportedValuesOf('timeZone');
  if (!allTimeZone.includes(timeZone))
    return err('Invalid TimeZone', 'timezone');
  setData(req, { timeZone });
  return null;
};
