import { MongoClient } from 'mongodb';

class MongoDb {
  constructor() {
    this.client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
    this.database = this.client.db('riebot');
  }

  async insertToken(key, accessToken, refreshToken, expireTime, auth0Id) {
    const tokens = this.database.collection('tokens');
    const filter = { _id: key };
    const document = {
      $set: {
        _id: key,
        accessToken: accessToken,
        refreshToken: refreshToken,
        expireTime: expireTime,
        auth0Id: auth0Id
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
      throw new Error('[MongoDb] Trouble saving anilist user');
    }
  }

  async insertCache(key, info, ttl) {
    const cache = this.database.collection('cache');
    const filter = { _id: key };
    const document = {
      $set: {
        _id: key,
        info: info,
        expireAt: new Date(new Date().getTime() + ttl * 1000)
      }
    };
    const options = { upsert: true };
    const result = await cache.updateOne(filter, document, options);
    if (result.acknowledged) {
      console.info(`[MongoDb] Cache saved with _id: ${result.upsertedId}, modifiedCount: ${result.modifiedCount}`);
    } else {
      throw new Error('[MongoDb] Trouble saving cache');
    }
  }

  async getAllAnilistUsers() {
    const anilistUsers = this.database.collection('anilistUsers');
    const users = await anilistUsers.find({}).toArray();
    console.log(`[MongoDb] Got all anilist users`);
    return users;
  }

  async getAnilistAccessToken(userId, auth0Id) {
    const tokens = this.database.collection('tokens');
    const filter = { _id: `anilist_${userId}` };
    const token = await tokens.findOne(filter);
    if (token.auth0Id !== auth0Id) {
      throw new Error(`Not Authorized`);
    } else {
      console.log(`[MongoDb] Got anilist access token`);
      return token.accessToken;
    }
  }

  async getCache(key) {
    const cache = this.database.collection('cache');
    const filter = { _id: key };
    const object = await cache.findOne(filter);
    if (object) {
      return object.info;
    } else {
      return false;
    }
  }
}

export default new MongoDb();
