import Anilist from '../../../utils/anilist';

export default async function handler(request, response) {
  const startTime = Number(request.query.start);
  const endTime = Number(request.query.end);
  if (!startTime || !endTime) {
    return response.status(400).send('Missing/Invalid Parameters');
  } else {
    try {
      const media = await Anilist.getAnimeAiringBetweenTimes(startTime, endTime);
      return response.json({ medias: media });
    } catch (err) {
      console.error(`Error getting airing anime: ${err}`);
      return response.status(500).json({});
    }
  }
}
