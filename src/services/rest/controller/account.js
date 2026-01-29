import MongoDB from '../../../mongoDB';
import * as accountQueries from '../../../mongoDB/queries/account';
import config from '../../../config';

export const connectAccount = async (req, res) => {
  try {
    const { accounts = [], platformId } = req.body;
    const userData = req.userData;
    const existingByPageId = req.existingAccountsByPageId || new Map();
    const result = [];
    const promises = [];
    accounts.forEach((acc) => {
      const payload = {
        ...acc,
        lastReconnected: new Date(),
        ownerId: userData.userId,
        connectedBy: userData.userId,
        platformId: Number(platformId),
        status: 'H',
        autoReplyEnabled: acc.autoReplyEnabled ?? false,
      };
      const existing = existingByPageId.get(String(acc.pageId));
      if (existing) {
        promises.push(
          accountQueries.updateAccountByOwnerAndPageId(
            MongoDB,
            userData.userId,
            acc.pageId,
            payload
          )
        );
        result.push({ ...existing, ...payload });
      } else {
        const savedAccount = {
          ...payload,
          createdAt: new Date(),
        };
        promises.push(accountQueries.createAccountQuery(MongoDB, savedAccount));
        result.push(savedAccount);
      }
    });
    await Promise.allSettled(promises);
    return res.status(201).json({
      message: 'Accounts connected successfully',
      data: result,
    });
  } catch (error) {
    res.status(400).send({
      message: error.message || 'Opps! Something Went Wrong',
    });
  }
};

export const listConnectedAccounts = async (req, res) => {
  try {
    const { logos, status } = config.account;
    const page = Number.isFinite(Number(req.query?.page))
      ? Math.max(0, Number(req.query.page))
      : 0;
    const limit = 10;
    const { q = '' } = req.validData || {};
    const userData = req.userData;
    const { userId } = userData;
    const [accounts, totalAccounts] = await Promise.all([
      accountQueries.listAccountsByOwnerQuery(MongoDB, userId, {
        page,
        limit,
        q,
      }),
      accountQueries.countAccountsByOwnerQuery(MongoDB, userId, q),
    ]);

    const formattedAccounts = accounts.map((acc) => ({
      id: acc.pageId,
      name: acc.pageName || acc.username || 'Unknown',
      profilePhoto: acc.profilePhoto,
      status: status[acc.status] || 'healthy', // healthy | reconnect | error
      autoReply: Boolean(acc.autoReplyEnabled),
      platformId: acc.platformId,
      logo: logos[acc.platformId],
    }));

    return res.status(200).json({
      message: 'Accounts fetched successfully',
      data: formattedAccounts,
      totalPage: Math.ceil(totalAccounts / limit),
      currentPage: page,
      totalAccounts,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Opps! Something Went Wrong',
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.userData || {};
    const { deleteAll = false, accountIds = [] } = req.validData || {};
    if (deleteAll) {
      const result = await accountQueries.deleteAllAccountsByOwner(
        MongoDB,
        userId
      );
      return res.status(200).json({
        message: 'All accounts deleted successfully',
        deletedCount: result.deletedCount || 0,
      });
    }

    const result = await accountQueries.deleteAccountsByPageIdsAndOwner(
      MongoDB,
      userId,
      accountIds
    );

    return res.status(200).json({
      message: 'Accounts deleted successfully',
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Opps! Something Went Wrong',
    });
  }
};
