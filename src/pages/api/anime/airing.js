import Anilist from '../../../utils/anilist';
import MongoDb from '../../../utils/mongo_db';

export default async function handler(request, response) {
  const startTime = Number(request.query.start);
  const endTime = Number(request.query.end);
  if (!startTime || !endTime) {
    return response.status(400).send('Missing/Invalid Parameters');
  } else {
    try {
      let media = [];
      const cache = await MongoDb.getCache(`animeAiringCache`);
      if (!cache) {
        media = await Anilist.getAnimeAiringBetweenTimes(startTime, endTime);
        await MongoDb.insertCache(`animeAiringCache`, media, 86400);
      } else {
        media = cache;
        console.log('Got airing cache');
      }
      return response.json({ medias: media });
    } catch (err) {
      console.error(`Error getting airing anime: ${err}`);
      return response.status(500).json({});
    }
  }
}
