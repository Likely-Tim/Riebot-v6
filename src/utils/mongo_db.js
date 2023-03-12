import { MongoClient } from 'mongodb';

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING;
class MongoDb {
  constructor() {
    this.client = new MongoClient(MONGO_CONNECTION_STRING);
    this.database = this.client.db('riebot');
  }

  async insertToken(key, accessToken, refreshToken, expireTime) {
    const tokens = this.database.collection('tokens');
    const filter = { _id: key };
    const document = {
      $set: {
        _id: key,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expireTime: expireTime
      }
    };
    const options = { upsert: true };
    const result = await tokens.updateOne(filter, document, options);
    if (result.acknowledged) {
      console.info(`[MongoDb] Token saved with _id: ${result.upsertedId}, modifiedCount: ${result.modifiedCount}`);
    } else {
      throw new Error('[MongoDb] Trouble saving token');
    }
  }

  async insertAnilistUser(key, name) {
    const anilistUsers = this.database.collection('anilistUsers');
    const filter = { _id: key };
    const document = {
      $set: {
        _id: key,
        name: name
      }
    };
    const options = { upsert: true };
    const result = await anilistUsers.updateOne(filter, document, options);
    if (result.acknowledged) {
      console.info(
        `[MongoDb] Anilist user saved with _id: ${result.upsertedId}, modifiedCount: ${result.modifiedCount}`
      );
    } else {
      throw new Error('[MongoDb] Trouble saving token');
    }
  }

  async getAllAnilistUsers() {
    const anilistUsers = this.database.collection('anilistUsers');
    const users = await anilistUsers.find({}).toArray();
    return users;
  }
}

export default new MongoDb();
