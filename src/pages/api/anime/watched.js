import Anilist from '../../../utils/anilist';
import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function handler(request, response) {
  const { accessToken } = await getAccessToken(request, response);
  console.log(accessToken);
  const userId = Number(request.query.userId);
  const animeId = Number(request.query.animeId);
  const progress = Number(request.query.progress);
  if (!userId || !animeId || !progress) {
    return response.status(400).send('Missing/Invalid Parameters');
  } else {
    try {
      const media = await Anilist.getUserAnimeWatching(userId);
      return response.json({ medias: media });
    } catch (err) {
      console.error(`Error getting airing anime: ${err}`);
      return response.status(500).send({});
    }
  }
});
