import config from '../../config';

const collection = 'CompanyDetails';

const connectDB = (mongoDB) =>
  mongoDB.db(config.dbConfig.DB).collection(collection);

export const createUserQuery = (mongoDB, userData) =>
  connectDB(mongoDB).insertOne(userData);

export const findUserByCondition = (mongoDB, condition, projection) =>
  connectDB(mongoDB).findOne(condition, {
    projection: { _id: 0, ...projection },
  });

export const updateUserByCondition = (
  mongoDB,
  condition,
  setData = {},
  unsetData = {}
) => {
  const update = {};
  if (Object.keys(setData).length) {
    Object.assign(update, {
      $set: setData,
    });
  }
  if (Object.keys(unsetData).length) {
    Object.assign(update, {
      $unset: unsetData,
    });
  }
  return connectDB(mongoDB).updateOne(condition, update);
};

export const deleteUserByCondition = (mongoDB, condition) =>
  connectDB(mongoDB).deleteOne(condition);
