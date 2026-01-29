import config from '../../config';

const collection = 'accountDetails';

const connectDB = (mongoDB) =>
  mongoDB.db(config.dbConfig.DB).collection(collection);

const escapeRegex = (str = '') =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createAccountQuery = (mongoDB, accountData) =>
  connectDB(mongoDB).insertOne(accountData);

export const findAccountByOwnerAndPageId = (mongoDB, ownerId, pageId) =>
  connectDB(mongoDB).findOne({ ownerId, pageId });

export const updateAccountByOwnerAndPageId = (
  mongoDB,
  ownerId,
  pageId,
  updateDoc
) =>
  connectDB(mongoDB).updateOne(
    { ownerId, pageId },
    { $set: { ...updateDoc, lastReconnected: new Date() } }
  );

export const listAccountsByOwnerQuery = (
  mongoDB,
  ownerId,
  { page = 0, limit = 10, q = '' } = {}
) => {
  const safePage = Number.isFinite(Number(page))
    ? Math.max(0, Number(page) - 1)
    : 0;
  const safeLimit = Number.isFinite(Number(limit))
    ? Math.max(1, Number(limit))
    : 10;
  const skip = safePage * safeLimit;

  const filter = { ownerId };

  if (q) {
    const escaped = escapeRegex(q);
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { pageName: regex },
      { username: regex },
      { name: regex },
    ];
  }

  return connectDB(mongoDB)
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit)
    .toArray();
};

export const countAccountsByOwnerQuery = (mongoDB, ownerId, q = '') => {
  const filter = { ownerId };

  if (q) {
    const escaped = escapeRegex(q);
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { pageName: regex },
      { username: regex },
      { name: regex },
    ];
  }

  return connectDB(mongoDB).countDocuments(filter);
};

export const findAccountsByPageIdsAndOwner = (mongoDB, ownerId, pageIds = []) =>
  connectDB(mongoDB)
    .find({ ownerId, pageId: { $in: pageIds } })
    .toArray();

export const deleteAccountsByPageIdsAndOwner = (mongoDB, ownerId, pageIds = []) =>
  connectDB(mongoDB).deleteMany({ ownerId, pageId: { $in: pageIds } });

export const deleteAllAccountsByOwner = (mongoDB, ownerId) =>
  connectDB(mongoDB).deleteMany({ ownerId });
