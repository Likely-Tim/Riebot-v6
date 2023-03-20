import { useState } from 'react';
import Head from 'next/head';
import { Flex, NativeSelect, Switch, Stack, Button } from '@mantine/core';
import MongoDb from '../../utils/mongo_db';
import { setCookie } from 'cookies-next';
import styles from '../../styles/anime/show.module.css';
import AnimeShowBody from '../../components/anime_show_body';
import { Calendar, ClockHour4, Man } from 'tabler-icons-react';

function UserSelect({ users, sortByDay, setSortByDay, setSelectedUser }) {
  const userSelectionDisabled = !users.length;
  const userChoices = [{ value: 'Airing', label: 'Airing' }].concat(users);

  return (
    <Flex align="center" justify="flex-start">
      <NativeSelect
        label="User"
        data={userChoices}
        disabled={userSelectionDisabled}
        icon={<Man />}
        onChange={(event) => setSelectedUser(event.currentTarget.value)}
      ></NativeSelect>
      <Button component="a" href={`/api/auth/anilist`} top={12} ml={10}>
        Add User
      </Button>
      <Switch
        label="Sort"
        labelPosition="left"
        onLabel={<Calendar />}
        offLabel={<ClockHour4 />}
        top={11}
        ml="auto"
        size="md"
        checked={sortByDay}
        onChange={(event) => setSortByDay(event.currentTarget.checked)}
      ></Switch>
    </Flex>
  );
}

export default function Home({ users }) {
  const [sortByDay, setSortByDay] = useState(true);
  const [selectedUser, setSelectedUser] = useState('Airing');

  setCookie('redirect', '/anime/show');

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>Riebot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Stack w="90%">
        <UserSelect
          users={users}
          sortByDay={sortByDay}
          setSortByDay={setSortByDay}
          setSelectedUser={setSelectedUser}
        ></UserSelect>
        <AnimeShowBody selectedUser={selectedUser} sortByDay={sortByDay}></AnimeShowBody>
      </Stack>
    </div>
  );
}

export async function getServerSideProps() {
  const users = await MongoDb.getAllAnilistUsers();
  for (const user of users) {
    Object.defineProperty(user, 'value', Object.getOwnPropertyDescriptor(user, '_id'));
    Object.defineProperty(user, 'label', Object.getOwnPropertyDescriptor(user, 'name'));
    delete user['_id'];
    delete user['name'];
  }
  return { props: { users: users } };
}
