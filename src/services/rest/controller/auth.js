import fetch from 'node-fetch';
import config from '../../../config';
import MongoDB from '../../../mongoDB';
import { decrypt, encrypt } from '../../../utils/cryptoUtil';
import * as settingQueries from '../../../mongoDB/queries/setting';
import * as accountQueries from '../../../mongoDB/queries/account';

/**
 * Fetches connectable account details by platform (same logic as getDetails).
 * Returns { accounts?, userAccessToken?, tokenData?, user?, allBusinessDetails? }.
 */
export const fetchAccountDetailsByCode = async (accountId, code, from) => {
  const accountConfig = config.account;
  const settingData = await settingQueries.findDetailsById(MongoDB, accountId);
  const isReconnect = from === 'reconnect';
  let data = {};
  switch (accountId) {
    case 1: {
      const configData = accountConfig.getAccountById(accountId);
      const APP_SECRET = decrypt(settingData.appSecrete);
      const APP_ID = decrypt(settingData.appId);
      const tokenUrl = `${configData.graphDomain}/${configData.apiVersion}/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&redirect_uri=${
        isReconnect
          ? encodeURIComponent(`${configData.redirectUri}&reconnect=true`)
          : encodeURIComponent(configData.redirectUri)
      }&code=${code}`;
      const tokenResp = await fetch(tokenUrl, { method: 'GET' });
      const tokenData = await tokenResp.json();

      if (!tokenData.access_token) {
        throw new Error('Authentication Failed Please Retry');
      }
      const accessToken = tokenData.access_token;
      const detailsUrl = `https://graph.facebook.com/v17.0/me?fields=id,name,accounts&access_token=${accessToken}`;
      const accountData = await fetch(detailsUrl);
      const profileDetails = await accountData.json();

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
    case 2: {
      const configData = accountConfig.getAccountById(accountId);
      const APP_ID = decrypt(settingData.appId);
      const APP_SECRET = decrypt(settingData.appSecrete);
      const tokenUrl =
        `${configData.graphDomain}/${configData.apiVersion}/oauth/access_token` +
        `?client_id=${APP_ID}` +
        `&client_secret=${APP_SECRET}` +
        `&redirect_uri=${
          isReconnect
            ? encodeURIComponent(`${configData.redirectUri}&reconnect=true`)
            : encodeURIComponent(configData.redirectUri)
        }` +
        `&code=${code}`;

      const tokenResp = await fetch(tokenUrl);
      const tokenData = await tokenResp.json();

      if (!tokenData.access_token) {
        throw new Error('Authentication failed. Please retry.');
      }
      const userAccessToken = tokenData.access_token;
      const pagesUrl =
        `${configData.graphDomain}/${configData.apiVersion}/me/accounts` +
        `?fields=id,name,category,access_token` +
        `&access_token=${userAccessToken}`;

      const pagesResp = await fetch(pagesUrl);
      const pagesData = await pagesResp.json();

      const pages = pagesData.data || [];
      const connectableAccounts = pages.map((page) => ({
        pageId: page.id,
        pageName: page.name,
        category: page.category,
        pageAccessToken: encrypt(page.access_token),
        profilePhoto: `https://graph.facebook.com/v18.0/${page.id}/picture?type=large&redirect=false&access_token=${page.access_token}
`,
      }));

      data = {
        userAccessToken,
        accounts: connectableAccounts,
      };

      break;
    }
    case 3: {
      const configData = accountConfig.getAccountById(accountId);
      const APP_ID = decrypt(settingData.appId);
      const APP_SECRET = decrypt(settingData.appSecrete);
      const tokenResp = await fetch(
        `${configData.graphDomain}/${configData.apiVersion}/oauth/access_token` +
          `?client_id=${APP_ID}` +
          `&client_secret=${APP_SECRET}` +
          `&redirect_uri=${
            isReconnect
              ? encodeURIComponent(`${configData.redirectUri}&reconnect=true`)
              : encodeURIComponent(configData.redirectUri)
          }` +
          `&code=${code}`
      );
      const tokenData = await tokenResp.json();

      if (!tokenData.access_token) {
        throw new Error('Auth failed');
      }

      const userAccessToken = tokenData.access_token;
      const pagesResp = await fetch(
        `${configData.graphDomain}/${configData.apiVersion}/me/accounts` +
          `?fields=id,name,access_token,instagram_business_account` +
          `&access_token=${userAccessToken}`
      );

      const pagesData = await pagesResp.json();

      const instagramAccounts = [];

      for (const page of pagesData.data || []) {
        if (!page.instagram_business_account?.id) continue;

        const igResp = await fetch(
          `${configData.graphDomain}/${configData.apiVersion}/${page.instagram_business_account.id}` +
            `?fields=id,username,profile_picture_url` +
            `&access_token=${userAccessToken}`
        );

        const ig = await igResp.json();

        if (!ig.id) continue;

        instagramAccounts.push({
          pageId: ig.id,
          pageName: ig.username,
          category: 'Instagram Business',
          pageAccessToken: encrypt(page.access_token),
          profilePhoto: ig.profile_picture_url,
        });
      }

      data = {
        accounts: instagramAccounts,
      };

      break;
    }
    default:
      break;
  }
  return data;
};

export const getAccountDetails = async (req, res) => {
  try {
    const { code, accountId } = req.validData;
    const data = await fetchAccountDetailsByCode(accountId, code);
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
    const { reconnect } = req.query;
    const isReconnect = reconnect === 'true';
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
        url = `${configData.baseDomain}/${configData.apiVersion}/dialog/oauth?client_id=${APP_ID}&redirect_uri=${
          isReconnect
            ? encodeURIComponent(`${configData.redirectUri}&reconnect=true`)
            : encodeURIComponent(configData.redirectUri)
        }&config_id=${EMBEDDED_CONFIG_ID}&scope=${configData.scopes.join(',')}&response_type=${configData.responseType}`;
        break;
      }

      case 2: {
        const configData = accountConfig.getAccountById(accountId);
        const APP_ID = decrypt(settingData.appId);

        url = `${configData.baseDomain}/${configData.apiVersion}/dialog/oauth?client_id=${APP_ID}&redirect_uri=${
          isReconnect
            ? encodeURIComponent(`${configData.redirectUri}&reconnect=true`)
            : encodeURIComponent(configData.redirectUri)
        }&scope=${configData.scopes.join(
          ','
        )}&response_type=${configData.responseType}`;

        break;
      }
      case 3: {
        const configData = accountConfig.getAccountById(accountId);
        const APP_ID = decrypt(settingData.appId);

        url = `${configData.baseDomain}/${configData.apiVersion}/dialog/oauth?client_id=${APP_ID}&redirect_uri=${
          isReconnect
            ? encodeURIComponent(`${configData.redirectUri}&reconnect=true`)
            : encodeURIComponent(configData.redirectUri)
        }&scope=${configData.scopes.join(
          ','
        )}&response_type=${configData.responseType}`;

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

export const reconnectAccount = async (req, res) => {
  try {
    const { userId } = req.userData || {};
    const { code, accountId } = req.validData || {};
    if (!userId) {
      return res.status(400).json({ message: 'Invalid user' });
    }
    const data = await fetchAccountDetailsByCode(accountId, code, 'reconnect');
    const accounts = data?.accounts || [];
    if (!accounts.length) {
      return res.status(400).json({
        message: 'No accounts to reconnect for this platform',
      });
    }
    const pageIds = accounts.map((a) => a.pageId).filter(Boolean);
    const existing = await accountQueries.findAccountsByPageIdsAndOwner(
      MongoDB,
      userId,
      pageIds
    );
    const existingByPageId = new Map(
      existing.map((a) => [String(a.pageId), a])
    );
    const promises = [];
    for (const acc of accounts) {
      if (!existingByPageId.has(String(acc.pageId))) continue;
      promises.push(
        accountQueries.updateAccountByOwnerAndPageId(
          MongoDB,
          userId,
          acc.pageId,
          {
            pageName: acc.pageName,
            profilePhoto: acc.profilePhoto,
            pageAccessToken: acc.pageAccessToken,
            category: acc.category,
          }
        )
      );
    }
    await Promise.allSettled(promises);
    return res.status(200).json({
      message: 'Reconnect completed',
      updatedCount: promises.length,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Opps! Something Went Wrong',
    });
  }
};
