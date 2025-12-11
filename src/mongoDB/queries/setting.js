import config from '../../config';

const collection = 'settingMaster';

const connectDB = (mongoDB) =>
  mongoDB.db(config.dbConfig.DB).collection(collection);

export const findDetailsById = (mongoDB, id, projection) =>
  connectDB(mongoDB).findOne(
    { accountId: id },
    {
      projection: { _id: 0, ...projection },
    }
  );
