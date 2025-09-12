import { MongoClient } from 'mongodb';
import config from '../config/index';

const dbUrl = config.dbConfig.connectionString;

const client = new MongoClient(dbUrl);
await client
  .connect()
  .then(() => {
    console.log('DB Connected');
  })
  .catch((err) => {
    console.log('Error DB Connection', err);
  });

export default client;
