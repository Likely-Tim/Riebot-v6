import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { setCookie } from 'cookies-next';
import MongoDb from '../../utils/mongo_db';
import styles from '../../styles/anime/show.module.css';
import { Dropdown, Button, Spacer } from '@nextui-org/react';

function UserSelect({ users }) {
  const [selected, setSelected] = React.useState(new Set(['Airing']));
  const userChoices = [{ key: 'Airing', name: 'Airing' }].concat(users);
  let userSelectionDisabled = false;
  if (userChoices.length < 2) {
    userSelectionDisabled = true;
  }
  const userKeyMap = new Map();
  for (const userChoice of userChoices) {
    userKeyMap.set(String(userChoice.key), userChoice.name);
  }

  return (
    <div className={styles.selectionContainer}>
      <Dropdown isDisabled={userSelectionDisabled}>
        <Dropdown.Button disabled={userSelectionDisabled}>
          {userKeyMap.get(selected.values().next().value)}
        </Dropdown.Button>
        <Dropdown.Menu
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selected}
          disabledKeys={selected}
          onSelectionChange={setSelected}
          items={userChoices}
        >
          {(item) => <Dropdown.Item key={item.key}>{item.name}</Dropdown.Item>}
        </Dropdown.Menu>
      </Dropdown>
      <Spacer></Spacer>
      <Link href="/api/auth/anilist">
        <Button auto>Add User</Button>
      </Link>
    </div>
  );
}

export default function Home({ users }) {
  setCookie('redirect', '/anime/show');

  return (
    <>
      <Head>
        <title>Riebot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <UserSelect users={users}></UserSelect>
    </>
  );
}

export async function getServerSideProps() {
  const users = await MongoDb.getAllAnilistUsers();
  for (const user of users) {
    Object.defineProperty(user, 'key', Object.getOwnPropertyDescriptor(user, '_id'));
    delete user['_id'];
  }
  return { props: { users: users } };
}
