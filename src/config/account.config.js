const accounts = [
  {
    accountName: 'Whatsapp Business',
    accountId: 1,
    baseDomain: 'https://www.facebook.com',
    graphDomain: 'https://graph.facebook.com',
    redirectUri: 'https://botera.vercel.app/account',
    apiVersion: 'v17.0',
    scopes: [
      'pages_show_list',
      'business_management',
      'whatsapp_business_management',
      'whatsapp_business_messaging',
    ],
    responseType: 'code',
  },
];

const validAccountIds = accounts.map((account) => account.accountId);
const getAccountById = (accountId) =>
  accounts.find((account) => account.accountId === accountId);

export default {
  redirectUri: 'https://botera.vercel.app/account',
  validAccountIds,
  getAccountById,
};
