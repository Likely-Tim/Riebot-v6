import useSWR from 'swr';
import fetch from 'node-fetch';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getCookie } from 'cookies-next';
import { ExposurePlus1, X, Check } from 'tabler-icons-react';
import { notifications } from '@mantine/notifications';
import { Stack, Title, Grid, Card, Image, Loader, Indicator, Button } from '@mantine/core';

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
  [10, 'Airing'],
  [11, 'Watching']
]);

export default function AnimeShowBody({ selectedUser, sortByDay }) {
  let mediaSorted = {};
  if (selectedUser === 'Airing') {
    const today = getTodayStart();
    const endOfWeek = getEndOfWeek();
    const { data, error } = useSWR(
      `/api/anime/airing?start=${today.getTime() / 1000}&end=${endOfWeek.getTime() / 1000}`,
      fetcher,
      swrOptions
    );

    if (!data) {
      return loading();
    }
    mediaSorted = mediaSortAiring(data.medias);
  } else {
    const { data, error } = useSWR(`/api/anime/watching?userId=${selectedUser}`, fetcher, swrOptions);

    if (!data) {
      return loading();
    }
    mediaSorted = mediaSortUser(data.medias, sortByDay);
  }
  return (
    <Stack p={15} bg="#252629" sx={{ borderRadius: 20 }} spacing="xl" pl={25} pr={25}>
      {Object.keys(mediaSorted).map((key) => (
        <TopicContainer
          topic={mediaAiringDayMap.get(Number(key))}
          medias={mediaSorted[key]}
          userId={selectedUser}
        ></TopicContainer>
      ))}
    </Stack>
  );
}

function TopicContainer({ topic, medias, userId }) {
  if (!medias.length) {
    return <></>;
  }

  return (
    <Stack>
      <Title color="white">{topic}</Title>
      <Grid columns={10}>
        {medias.map((media) => (
          <MediaCard key={media.id} media={media} userId={userId}></MediaCard>
        ))}
      </Grid>
    </Stack>
  );
}

function MediaCard({ media, userId }) {
  const [unwatched, setUnwatched] = useState(checkProgress(media));
  const [updating, setUpdating] = useState(false);

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

  function handlerIncrement() {
    const auth0Id = getCookie('auth0Id');
    setUpdating(true);
    sendApiCall(
      `/api/anime/watched?auth0Id=${auth0Id}&userId=${userId}&animeId=${media.id}&progress=${media.progress + 1}`
    ).then((res) => {
      setUpdating(false);
      if (res) {
        media.progress += 1;
        if (!checkProgress(media)) {
          setUnwatched(false);
        }
      }
    });
  }

  return (
    <Grid.Col span="content">
      <Stack>
        <Indicator size={14} color="red" offset={2} withBorder disabled={!unwatched}>
          <Card
            component="a"
            href={media.siteUrl}
            target="_blank"
            radius={10}
            padding={0}
            sx={unwatched ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}}
          >
            <Card.Section>
              <Image src={media.coverImage.extraLarge} width={125} height={unwatched ? 155 : 175} />
            </Card.Section>
          </Card>
        </Indicator>
        <Button
          display={unwatched ? 'absolute' : 'none'}
          fullWidth
          compact
          bottom={15.8}
          h={20}
          sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
          onClick={handlerIncrement}
          loaderPosition="center"
          loading={updating}
        >
          <ExposurePlus1 size={20} />
        </Button>
      </Stack>
    </Grid.Col>
  );
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
  let mediaByAiringDay = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [] };
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

function mediaSortUser(medias, sortByDay) {
  let mediaSorted = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [] };
  if (sortByDay) {
    for (const media of medias) {
      if (!media.nextAiringEpisode) {
        mediaSorted[11].push(media);
      } else if (media.nextAiringEpisode.airingAt > getEndOfWeek().getTime() / 1000 + 86400) {
        mediaSorted[9].push(media);
      } else {
        // Assumes Airing Day Will Never Change
        const airingDay = new Date(media.nextAiringEpisode.airingAt * 1000).getDay();
        mediaSorted[airingDay].push(media);
      }
    }
  } else {
    medias = medias.filter((media) => {
      if (media.nextAiringEpisode) {
        return true;
      } else {
        mediaSorted[11].push(media);
        return false;
      }
    });
    medias.sort(timeSort);
    mediaSorted[10] = medias;
  }
  return mediaSorted;
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

function loading() {
  return (
    <Stack p={15} bg="#252629" sx={{ borderRadius: 20 }} spacing="xl" align="center">
      <Loader size="xl" variant="dots" />
    </Stack>
  );
}

async function sendApiCall(url) {
  const id = uuidv4();
  notifications.show({
    id: id,
    title: 'Updating',
    loading: true,
    sx: { borderWidth: 1, borderColor: '#3ca2c3' }
  });
  const response = await fetch(url, {
    method: 'GET'
  });
  if (response.ok) {
    notifications.update({
      id: id,
      title: `Updated`,
      color: 'green',
      icon: <Check />,
      sx: { borderWidth: 1, borderColor: 'green' }
    });
    return true;
  } else {
    notifications.update({
      id: id,
      title: `${response.statusText}`,
      color: 'red',
      icon: <X />,
      sx: { borderWidth: 1, borderColor: 'red' }
    });
    return false;
  }
}
