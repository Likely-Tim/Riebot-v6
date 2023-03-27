import useSWR from 'swr';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { getCookie } from 'cookies-next';
import { useTimer } from 'react-timer-hook';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { ExposurePlus1, X, Check } from 'tabler-icons-react';
import { Stack, Title, Grid, Card, Image, Loader, Indicator, Button, Anchor, Affix } from '@mantine/core';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayDisplayOrder, setDayDisplayOrder] = useState([]);

  useEffect(() => {
    const correctedDayOrder = [];
    const todayInt = new Date().getDay();
    for (let i = 0; i < 7; i++) {
      correctedDayOrder.push((todayInt + i) % 7);
    }
    correctedDayOrder.push(...[7, 8, 9, 10, 11]);
    setDayDisplayOrder(correctedDayOrder);
    setTimeout(() => {
      setCurrentDate(new Date());
    }, 60000);
  }, [currentDate]);

  let mediaSorted = {};
  if (selectedUser === 'Airing') {
    const today = getTodayStart();
    const endOfWeek = getEndOfWeek();
    const { data, error } = useSWR(
      `/api/anime/airing?start=${today.getTime() / 1000}&end=${endOfWeek.getTime() / 1000}`
    );

    if (!data) {
      return loading();
    }
    mediaSorted = mediaSortAiring(data.medias);
  } else {
    const { data, error } = useSWR(`/api/anime/watching?userId=${selectedUser}`, {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      dedupingInterval: 30000
    });

    if (!data) {
      return loading();
    }
    mediaSorted = mediaSortUser(data.medias, sortByDay);
  }

  return (
    <Stack p={15} bg="#252629" sx={{ borderRadius: 20 }} spacing="xl" pl={25} pr={25}>
      {dayDisplayOrder.map((key) => (
        <TopicContainer key={key} topic={key} medias={mediaSorted[key]} userId={selectedUser}></TopicContainer>
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
      <Title color="white">{mediaAiringDayMap.get(Number(topic))}</Title>
      <Grid columns={10}>
        {medias.map((media) => (
          <MediaCard key={media.id} media={media} userId={userId}></MediaCard>
        ))}
      </Grid>
    </Stack>
  );
}

function MediaCard({ media, userId }) {
  const [unwatched, setUnwatched] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [airing, setAiring] = useState(true);
  const [statusColor, setStatusColor] = useState('');

  useEffect(() => {
    checkAiring();
  }, [userId]);

  useEffect(() => {
    setUnwatched(checkProgress());
    checkStatus();
  }, [media]);

  function checkProgress() {
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

  function checkStatus() {
    if (media.status === 'RELEASING') {
      setStatusColor('blue');
    } else if (media.status === 'FINISHED') {
      setStatusColor('green');
    } else if (media.status === 'NOT_YET_RELEASED') {
      setStatusColor('violet');
    } else {
      setStatusColor('yellow');
    }
  }

  function checkAiring() {
    if (userId === 'Airing') {
      setAiring(true);
    } else {
      setAiring(false);
    }
  }

  function handlerIncrement() {
    const auth0Id = getCookie('auth0Id');
    setUpdating(true);
    addAnimeProgress(
      `/api/anime/watched?auth0Id=${auth0Id}&userId=${userId}&animeId=${media.id}&progress=${media.progress + 1}`,
      media
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
        <Indicator size={14} color="red" offset={2} withBorder disabled={!unwatched} processing>
          <Indicator
            label={media.status}
            position="top-start"
            left={30}
            size={15}
            withBorder
            color={statusColor}
            disabled={airing}
          ></Indicator>
          <Timer media={media}></Timer>
          <Card radius={10} padding={0} w={125} h={175}>
            <Card.Section>
              <Anchor href={media.siteUrl} target="_blank">
                <Image src={media.coverImage.extraLarge} radius={10} fit="cover" height={175} />
              </Anchor>
            </Card.Section>
            <Button
              display={unwatched ? 'absolute' : 'none'}
              fullWidth
              compact
              bottom={20}
              h={20}
              sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, zIndex: 5 }}
              onClick={handlerIncrement}
              loaderPosition="center"
              loading={updating}
            >
              <ExposurePlus1 size={20} />
            </Button>
            <Button
              display={unwatched ? 'absolute' : 'none'}
              opacity={0}
              fullWidth
              compact
              bottom={40}
              h={20}
              sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, zIndex: 4 }}
            />
          </Card>
        </Indicator>
      </Stack>
    </Grid.Col>
  );
}

function Timer({ media }) {
  let airingTime = 0;
  try {
    airingTime = media.nextAiringEpisode.airingAt;
  } catch (e) {}

  if (airingTime) {
    const { seconds, minutes, hours, days } = useTimer({
      expiryTimestamp: new Date(airingTime * 1000),
      autoStart: true
    });
    return (
      <Indicator
        withBorder
        color="gray"
        left={33}
        top={145}
        size={13}
        w={50}
        label={`${days}d ${hours}h ${minutes}m`}
      ></Indicator>
    );
  } else {
    return <></>;
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

async function addAnimeProgress(url, media) {
  const id = uuidv4();
  notifications.show({
    id: id,
    title: `Updating ${media.title.romaji} to ${media.progress + 1}`,
    loading: true,
    sx: { borderWidth: 1, borderColor: '#3ca2c3' },
    autoClose: false
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
      sx: { borderWidth: 1, borderColor: 'green' },
      autoClose: true
    });
    return true;
  } else {
    notifications.update({
      id: id,
      title: `${response.statusText}`,
      color: 'red',
      icon: <X />,
      sx: { borderWidth: 1, borderColor: 'red' },
      autoClose: true
    });
    return false;
  }
}
