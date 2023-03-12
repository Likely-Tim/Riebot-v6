import useSWR from 'swr';
import styles from '../styles/anime_show_body.module.css';
import { Card, Link, Grid } from '@nextui-org/react';

const fetcher = (...args) => fetch(...args).then((res) => res.json());
const swrOptions = { revalidateOnFocus: false };

const mediaAiringDayMap = new Map([
  [0, 'Sunday'],
  [1, 'Monday'],
  [2, 'Tuesday'],
  [3, 'Wednesday'],
  [4, 'Thursday'],
  [5, 'Friday'],
  [6, 'Saturday'],
  [7, 'Unknown'],
  [8, 'Unending']
]);

export default function AnimeShowBody({ selectedUser }) {
  let medias = [];
  if (selectedUser === 'Airing') {
    const today = getTodayStart();
    const endOfWeek = getEndOfWeek();
    const { data, error } = useSWR(
      `/api/anime/airing?start=${today.getTime() / 1000}&end=${endOfWeek.getTime() / 1000}`,
      fetcher,
      swrOptions
    );
    medias = data.media;
  }
  const mediaSortedByDay = mediaSortByDate(medias);

  return (
    <div className={styles.animeShowBodyContainer}>
      <Day dayNumber={0} medias={mediaSortedByDay[0]}></Day>
      <Day dayNumber={1} medias={mediaSortedByDay[1]}></Day>
      <Day dayNumber={2} medias={mediaSortedByDay[2]}></Day>
      <Day dayNumber={3} medias={mediaSortedByDay[3]}></Day>
      <Day dayNumber={4} medias={mediaSortedByDay[4]}></Day>
      <Day dayNumber={5} medias={mediaSortedByDay[5]}></Day>
      <Day dayNumber={6} medias={mediaSortedByDay[6]}></Day>
      <Day dayNumber={7} medias={mediaSortedByDay[7]}></Day>
      <Day dayNumber={8} medias={mediaSortedByDay[8]}></Day>
    </div>
  );
}

function Day({ dayNumber, medias }) {
  console.log(medias);
  if (!medias.length) {
    return <></>;
  }
  return (
    <>
      <h2 className={styles.dayText}>{mediaAiringDayMap.get(dayNumber)}</h2>
      <Grid.Container gap={2} justify="flex-start">
        {medias.map((media) => {
          return (
            <Grid>
              <Card isHoverable variant="flat" css={{ backgroundColor: '#252629', marginBottom: '10px' }}>
                <Link href={media.siteUrl}>
                  <Card.Image
                    css={{ borderRadius: '0 0 10 10', margin: 0 }}
                    width={125}
                    height={175}
                    src={media.coverImage.extraLarge}
                    objectFit="cover"
                  ></Card.Image>
                </Link>
              </Card>
            </Grid>
          );
        })}
      </Grid.Container>
    </>
  );
}

function generateDays(day) {}

function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getEndOfWeek() {
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(24, 0, 0, 0);
  return endOfWeek;
}

function mediaSortByDate(medias) {
  let mediaByAiringDay = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [] };
  for (const media of medias) {
    if (media.format !== 'TV') continue;
    if (!media.nextAiringEpisode) {
      mediaByAiringDay[7].push(media);
      continue;
    }
    const airingDay = new Date(media.nextAiringEpisode.airingAt * 1000).getDay();
    mediaByAiringDay[airingDay].push(media);
  }
  return mediaByAiringDay;
}
