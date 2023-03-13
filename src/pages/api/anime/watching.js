import Anilist from '../../../utils/anilist';

export default async function handler(request, response) {
  const userId = Number(request.query.userId);
  if (!userId) {
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
}
