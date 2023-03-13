import useSWR from 'swr';
import React from 'react';
import styles from '../styles/anime_show_body.module.css';
import { Card, Link, Grid, Progress, Badge, Button } from '@nextui-org/react';

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
  [8, 'Unending'],
  [9, 'Future'],
  [10, 'Watching']
]);

const mediaTimeMap = new Map([
  [0, 'Airing'],
  [1, 'Watching']
]);

export default function AnimeShowBody({ selectedUser, sort }) {
  let mediaSorted = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [] };
  if (selectedUser === 'Airing') {
    const today = getTodayStart();
    const endOfWeek = getEndOfWeek();
    const { data, error } = useSWR(
      `/api/anime/airing?start=${today.getTime() / 1000}&end=${endOfWeek.getTime() / 1000}`,
      fetcher,
      swrOptions
    );

    if (!data) {
      return (
        <div className={styles.animeShowBodyContainer}>
          <Progress indeterminated size="md"></Progress>
        </div>
      );
    }
    mediaSorted = mediaSortAiring(data.medias);
  } else {
    const { data, error } = useSWR(`/api/anime/watching?userId=${selectedUser}`, fetcher, swrOptions);

    if (!data) {
      return (
        <div className={styles.animeShowBodyContainer}>
          <Progress indeterminated size="md"></Progress>
        </div>
      );
    }
    if (sort === 'Time') {
      mediaSorted = mediaSortTime(data.medias);
    } else {
      mediaSorted = mediaSortUser(data.medias);
    }
  }
  if (sort === 'Time') {
    return (
      <div className={styles.animeShowBodyContainer}>
        <Day dayNumber={0} medias={mediaSorted[0]} sort={sort}></Day>
        <Day dayNumber={1} medias={mediaSorted[1]} sort={sort}></Day>
      </div>
    );
  } else {
    return (
      <div className={styles.animeShowBodyContainer}>
        <Day dayNumber={0} medias={mediaSorted[0]} sort={sort}></Day>
        <Day dayNumber={1} medias={mediaSorted[1]} sort={sort}></Day>
        <Day dayNumber={2} medias={mediaSorted[2]} sort={sort}></Day>
        <Day dayNumber={3} medias={mediaSorted[3]} sort={sort}></Day>
        <Day dayNumber={4} medias={mediaSorted[4]} sort={sort}></Day>
        <Day dayNumber={5} medias={mediaSorted[5]} sort={sort}></Day>
        <Day dayNumber={6} medias={mediaSorted[6]} sort={sort}></Day>
        <Day dayNumber={7} medias={mediaSorted[7]} sort={sort}></Day>
        <Day dayNumber={8} medias={mediaSorted[8]} sort={sort}></Day>
        <Day dayNumber={9} medias={mediaSorted[9]} sort={sort}></Day>
        <Day dayNumber={10} medias={mediaSorted[10]} sort={sort}></Day>
      </div>
    );
  }
}

function Day({ dayNumber, medias, sort }) {
  let sortByTime = false;
  if (sort === 'Time') {
    sortByTime = true;
  }
  if (!medias.length) {
    return <></>;
  }
  return (
    <>
      <h2 className={styles.dayText}>{sortByTime ? mediaTimeMap.get(dayNumber) : mediaAiringDayMap.get(dayNumber)}</h2>
      <Grid.Container gap={2} justify="flex-start">
        {medias.map((media, i) => {
          return <Media key={media.id} media={media}></Media>;
        })}
      </Grid.Container>
    </>
  );
}

function Media({ media }) {
  const [unwatched, setUnwatched] = React.useState(checkProgress(media));

  function checkProgress(media) {
    try {
      if (media.progress < media.nextAiringEpisode.episode - 1) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }

  return (
    <Grid>
      <Badge
        isInvisible={!unwatched}
        variant="dot"
        size="lg"
        color="error"
        css={{ position: 'absolute', zIndex: 2, top: 5, left: '115px' }}
      ></Badge>

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
        <IncrementButton media={media} shouldDeployButton={unwatched}></IncrementButton>
      </Card>
    </Grid>
  );
}

function IncrementButton({ media, shouldDeployButton }) {
  function handlerIncrement(target) {
    console.log(target);
  }

  if (shouldDeployButton) {
    return (
      <Button
        id={`${media.id}_${media.progress}_${media.nextAiringEpisode ? media.nextAiringEpisode.episode : ''}`}
        onPress={(ev) => handlerIncrement(ev.target)}
        css={{ position: 'absolute', zIndex: 2, height: 25, top: 153, right: -36 }}
      >
        +
      </Button>
    );
  } else {
    return '';
  }
}

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

function mediaSortAiring(medias) {
  let mediaByAiringDay = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [] };
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

function mediaSortUser(medias) {
  let mediaByAiringDay = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [] };
  for (const media of medias) {
    if (!media.nextAiringEpisode) {
      mediaByAiringDay[10].push(media);
    } else if (media.nextAiringEpisode.airingAt > getEndOfWeek().getTime() / 1000 + 86400) {
      mediaByAiringDay[9].push(media);
    } else {
      // Assumes Airing Day Will Never Change
      const airingDay = new Date(media.nextAiringEpisode.airingAt * 1000).getDay();
      mediaByAiringDay[airingDay].push(media);
    }
  }
  return mediaByAiringDay;
}

function mediaSortTime(medias) {
  let mediaByTime = { 0: [], 1: [] };
  medias = medias.filter((media) => {
    if (media.nextAiringEpisode) {
      return true;
    } else {
      mediaByTime[1].push(media);
      return false;
    }
  });
  medias.sort(timeSort);
  mediaByTime[0] = medias;
  return mediaByTime;
}

function timeSort(a, b) {
  if (a.nextAiringEpisode.airingAt < b.nextAiringEpisode.airingAt) {
    return -1;
  }
  if (a.nextAiringEpisode.airingAt > b.nextAiringEpisode.airingAt) {
    return 1;
  }
  return 0;
}
