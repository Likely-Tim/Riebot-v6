import React from 'react';
import { setCookie } from 'cookies-next';
import { useDisclosure } from '@mantine/hooks';
import styles from '../styles/layout.module.css';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Flex, Burger, Stack, NavLink, Anchor } from '@mantine/core';

const items = [
  {
    isSubmenu: false,
    label: 'Home',
    link: '/'
  },
  {
    isSubmenu: false,
    label: 'Logs',
    link: '/logs'
  },
  {
    isSubmenu: true,
    label: 'Discord',
    submenuItems: [
      {
        label: 'Spotify',
        link: '/auth/discord?task=spotify'
      }
    ]
  },
  {
    isSubmenu: true,
    label: 'Authentication',
    submenuItems: [
      {
        label: 'Spotify',
        link: '/auth/spotify'
      },
      {
        label: 'MyAnimeList',
        link: 'auth/mal'
      }
    ]
  },
  {
    isSubmenu: true,
    label: 'Anime',
    submenuItems: [
      {
        label: 'Shows',
        link: '/anime/show'
      }
    ]
  }
];

function Header() {
  return (
    <Flex bg="#333" p={8} align="center" mb={15}>
      <Navigation></Navigation>
      <Title></Title>
      <Login></Login>
    </Flex>
  );
}

function Login() {
  setCookie('auth0Id', null);
  const { user, error, isLoading } = useUser();
  if (isLoading)
    return (
      <Anchor weight={900} fz={25} c="white" ml="auto" align="center" unstyle>
        Loading...
      </Anchor>
    );
  if (error) {
    return (
      <Anchor weight={900} fz={25} c="white" ml="auto" align="center" unstyle>
        Error
      </Anchor>
    );
  }
  if (user) {
    setCookie('auth0Id', user.sub);
    return (
      <Anchor href={'/api/auth/logout'} weight={900} fz={25} c="white" ml="auto" align="center" unstyled>
        Logout
      </Anchor>
    );
  } else {
    return (
      <Anchor href={'/api/auth/login'} weight={900} fz={25} c="white" ml="auto" align="center" unstyled>
        Login
      </Anchor>
    );
  }
}

function Title() {
  return (
    <Anchor href="/" weight={900} fz={30} c="white" align="center" pl={10} unstyled>
      Riebot
    </Anchor>
  );
}

function Navigation() {
  const [opened, { toggle }] = useDisclosure(false);
  return (
    <>
      <Burger opened={opened} onClick={toggle} size={28} pt={10}></Burger>
      <Dropdown opened={opened}></Dropdown>
    </>
  );
}

function Dropdown({ opened }) {
  return (
    <Stack
      pos="absolute"
      top={50}
      miw={200}
      bg="#292929"
      display={opened ? 'block' : 'none'}
      sx={{ boxShadow: '0px 8px 16px 0px rgba(0, 0, 0, 0.6)' }}
    >
      {items.map((item) => (
        <DropdownMenuItem item={item}></DropdownMenuItem>
      ))}
    </Stack>
  );
}

function DropdownMenuItem({ item }) {
  if (item.isSubmenu) {
    return (
      <NavLink
        key={item.label}
        label={item.label}
        classNames={{ label: styles.dropdownSubmenus, root: styles.itemBorderBottom }}
      >
        {item.submenuItems.map((submenuItem) => (
          <NavLink
            key={`${item.label}_${submenuItem.label}`}
            label={submenuItem.label}
            component="a"
            href={submenuItem.link}
            classNames={{ label: styles.dropdownLinks, root: styles.submenuItemBorder }}
          ></NavLink>
        ))}
      </NavLink>
    );
  } else {
    return (
      <NavLink
        key={item.label}
        label={item.label}
        component="a"
        href={item.link}
        classNames={{ label: styles.dropdownLinks, root: styles.itemBorderBottom }}
      ></NavLink>
    );
  }
}

export default function Layout({ children }) {
  return (
    <>
      <Header></Header>
      <div>{children}</div>
    </>
  );
}
