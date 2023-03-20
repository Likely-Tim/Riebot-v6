import Anilist from '../../../utils/anilist';
import MongoDb from '../../../utils/mongo_db';

export default async function handler(request, response) {
  const userId = Number(request.query.userId);
  const animeId = Number(request.query.animeId);
  const progress = Number(request.query.progress);
  const auth0Id = request.query.auth0Id;
  if (!userId || !animeId || !progress || !auth0Id) {
    return response.status(400).send('Missing/Invalid Parameters');
  } else {
    let accessToken = null;
    try {
      accessToken = await MongoDb.getAnilistAccessToken(userId, auth0Id);
    } catch (e) {
      return response.status(401).send(e);
    }
    try {
      await Anilist.updateMedia(accessToken, animeId, progress);
      return response.status(200).send('Ok');
    } catch (e) {
      return response.status(500).send(e);
    }
  }
}
