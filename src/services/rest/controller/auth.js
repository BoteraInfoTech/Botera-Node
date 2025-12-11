import fetch from 'node-fetch';
import config from '../../../config';
import MongoDB from '../../../mongoDB';
import { decrypt } from '../../../utils/cryptoUtil';
import * as settingQueries from '../../../mongoDB/queries/setting';

export const getAccountDetails = async (req, res) => {
  const { code, accountId } = req.validData;
  const accountConfig = config.account;
  try {
    const settingData = await settingQueries.findDetailsById(
      MongoDB,
      accountId
    );
    let data = {};
    switch (accountId) {
      case 1: {
        const configData = accountConfig.getAccountById(accountId);
        const APP_SECRET = decrypt(settingData.appSecrete);
        const APP_ID = decrypt(settingData.appId);
        const tokenUrl = `${configData.graphDomain}/${configData.apiVersion}/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&redirect_uri=${encodeURIComponent(
          configData.redirectUri
        )}&code=${code}`;
        const tokenResp = await fetch(tokenUrl, { method: 'GET' });
        const tokenData = await tokenResp.json();

        if (!tokenData.access_token) {
          return res.status(400).send({
            message: 'Authentication Failed Please Retry',
          });
        }
        const accessToken = tokenData.access_token;
        const detailsUrl = `https://graph.facebook.com/v17.0/me?fields=id,name,accounts&access_token=${accessToken}`;
        const accountData = await fetch(detailsUrl);
        const profileDetails = await accountData.json();
        console.log({ profileDetails });

        const accounts = profileDetails.accounts?.data || [];
        const allBusinessDetails = [];
        for (const acc of accounts) {
          const businessId = acc.id;
          const accountUrl = `https://graph.facebook.com/v17.0/${businessId}?fields=owned_whatsapp_business_accounts&access_token=${accessToken}`;
          const accountRes = await fetch(accountUrl);
          const accountData = await accountRes.json();

          const accountsDetails =
            accountData.owned_whatsapp_business_accounts?.data || [];
          const accountDetailsList = [];

          for (const wAccount of accountsDetails) {
            const detailsUrl = `https://graph.facebook.com/v17.0/${wAccount.id}?fields=id,name,phone_numbers,message_templates&access_token=${accessToken}`;
            const detailsResp = await fetch(detailsUrl);
            const details = await detailsResp.json();
            accountDetailsList.push(details);
          }

          allBusinessDetails.push({
            business: acc,
            accountDetailsList,
          });
        }
        data = {
          tokenData,
          user: { id: profileDetails.id, name: profileDetails.name },
          allBusinessDetails,
        };
        break;
      }
      default:
        break;
    }
    res.send({ message: 'Detail fetched Successfully', response: data });
  } catch (error) {
    res.status(400).send({
      message: error.message || 'Authentication Failed Please Retry',
    });
  }
};

export const getAuthUrl = async (req, res) => {
  try {
    const { accountId } = req.validData;
    const accountConfig = config.account;
    let url = accountConfig.redirectUri;
    const settingData = await settingQueries.findDetailsById(
      MongoDB,
      accountId
    );
    switch (accountId) {
      case 1: {
        const configData = accountConfig.getAccountById(accountId);
        const APP_ID = decrypt(settingData.appId);
        const EMBEDDED_CONFIG_ID = decrypt(settingData.configId);
        url = `${configData.baseDomain}/${configData.apiVersion}/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(
          configData.redirectUri
        )}&config_id=${EMBEDDED_CONFIG_ID}&scope=${configData.scopes.join(',')}&response_type=${configData.responseType}`;
        break;
      }
      default: {
        url = accountConfig.redirectUri;
        break;
      }
    }
    res.send({
      status: 200,
      message: 'Auth URL generated successfully',
      url,
    });
  } catch (e) {
    res.send({
      status: 400,
      message: e.message || 'Something went wrong',
    });
  }
};
