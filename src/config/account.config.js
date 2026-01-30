const accounts = [
  {
    accountName: 'Whatsapp Business',
    accountId: 1,
    baseDomain: 'https://www.facebook.com',
    graphDomain: 'https://graph.facebook.com',
    redirectUri:
      process.env.ENVIRONMENT === 'development'
        ? 'http://localhost:3000/account'
        : 'https://botera.vercel.app/account',
    apiVersion: 'v18.0',
    scopes: [
      'pages_show_list',
      'business_management',
      'whatsapp_business_management',
      'whatsapp_business_messaging',
    ],
    responseType: 'code',
    logo: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
  },
  {
    accountName: 'Facebook Page',
    accountId: 2,
    baseDomain: 'https://www.facebook.com',
    graphDomain: 'https://graph.facebook.com',
    redirectUri:
      process.env.ENVIRONMENT === 'development'
        ? 'http://localhost:3000/account'
        : 'https://botera.vercel.app/account',
    apiVersion: 'v18.0',
    scopes: [
      'pages_show_list',
      'pages_read_user_content',
      'pages_messaging',
      'public_profile',
    ],
    responseType: 'code',
    logo: 'https://cdn-icons-png.flaticon.com/512/733/733547.png',
  },
  {
    accountName: 'Instagram Account',
    accountId: 3,
    baseDomain: 'https://www.facebook.com',
    graphDomain: 'https://graph.facebook.com',
    redirectUri:
      process.env.ENVIRONMENT === 'development'
        ? 'http://localhost:3000/account'
        : 'https://botera.vercel.app/account',
    apiVersion: 'v18.0',
    scopes: [
      'pages_show_list',
      'instagram_basic',
      'pages_read_engagement',
      // 'pages_messaging',
      // 'pages_read_user_content',
      'instagram_manage_messages',
      'public_profile',
    ],
    responseType: 'code',
    logo: 'https://cdn-icons-png.flaticon.com/512/1384/1384063.png',
  },
];

const validAccountIds = accounts.map((account) => account.accountId);
const getAccountById = (accountId) =>
  accounts.find((account) => account.accountId === accountId);

const logoMapper = () => {
  const map = {};
  accounts.forEach((account) => {
    map[account.accountId] = account.logo;
  });
  return map;
};
export default {
  redirectUri: 'https://botera.vercel.app/account',
  validAccountIds,
  getAccountById,
  logos: logoMapper(),
  status: {
    H: 'healthy',
    R: 'reconnect',
    F: 'failed',
  },
};
