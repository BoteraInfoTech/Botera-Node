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
