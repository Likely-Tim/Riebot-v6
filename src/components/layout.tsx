import React, { use } from 'react';
import Link from 'next/link';
import styles from '../styles/layout.module.css';
import utilStyles from '../styles/utils.module.css';
import { useUser } from '@auth0/nextjs-auth0/client';

function Header() {
  return (
    <div className={styles.header}>
      <Navigation></Navigation>
      <Title></Title>
      <Login></Login>
    </div>
  );
}

function Login() {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <p className={styles.login}>Loading...</p>;
  if (error) {
    console.log(error.message);
    return <p className={styles.login}>Error</p>;
  }
  if (user) {
    return (
      <Link href={'/api/auth/logout'} className={styles.login}>
        Logout
      </Link>
    );
  } else {
    return (
      <Link href={'/api/auth/login'} className={styles.login}>
        Login
      </Link>
    );
  }
}

function Title() {
  return (
    <Link href={'/'} className={styles.title}>
      Riebot
    </Link>
  );
}

function Navigation() {
  const [isDropdownActive, setDropdownActive] = React.useState(false);
  const [isInitialLoad, setInitialLoad] = React.useState(true);

  function handleDropdownClick() {
    if (isInitialLoad) {
      setInitialLoad(!isInitialLoad);
    }
    setDropdownActive(!isDropdownActive);
  }

  return (
    <>
      <div
        onClick={handleDropdownClick}
        className={[styles.hamburgerLineContainer, isDropdownActive ? styles.hamburgerClicked : ''].join(' ')}
      >
        <hr id={styles.hamburgerLineOne} className={styles.hamburgerLines}></hr>
        <hr id={styles.hamburgerLineTwo} className={styles.hamburgerLines}></hr>
        <hr id={styles.hamburgerLineThree} className={styles.hamburgerLines}></hr>
      </div>
      <Dropdown isDropdownActive={isDropdownActive} isInitialLoad={isInitialLoad}></Dropdown>
    </>
  );
}

function Dropdown({ isDropdownActive, isInitialLoad }: { isDropdownActive: boolean; isInitialLoad: boolean }) {
  return (
    <div
      id="headerDropdownMenu"
      className={[
        styles.dropdownMenu,
        isDropdownActive ? utilStyles.fadeIn : utilStyles.fadeOut,
        isInitialLoad ? utilStyles.hidden : ''
      ].join(' ')}
    >
      <DropdownMenuItem name="Home" link="/"></DropdownMenuItem>
      <DropdownMenuItem name="Logs" link="/logs"></DropdownMenuItem>
      <DropdownSubmenu
        name="Discord"
        items={[{ name: 'Spotify', link: '/auth/discord?task=spotify' }]}
      ></DropdownSubmenu>
      <DropdownSubmenu
        name="Authentication"
        items={[
          { name: 'Spotify', link: '/auth/spotify' },
          { name: 'MyAnimeList', link: '/auth/mal' }
        ]}
      ></DropdownSubmenu>
      <DropdownSubmenu name="Anime" items={[{ name: 'Shows', link: '/anime/show' }]}></DropdownSubmenu>
    </div>
  );
}

function DropdownMenuItem({ name, link }: { name: string; link: string }) {
  return (
    <div className={styles.dropdownMenuItem}>
      <Link href={link} className={styles.dropdownMenuText}>
        {name}
      </Link>
    </div>
  );
}

function DropdownSubmenu({ name, items }: { name: string; items: { name: string; link: string }[] }) {
  const [dropdownSubmenuClicked, setDropdownSubmenuClicked] = React.useState(false);
  const [initialSubmenuLoad, setinitialSubmenuLoad] = React.useState(true);

  function handleClick() {
    if (initialSubmenuLoad) {
      setinitialSubmenuLoad(!initialSubmenuLoad);
    }
    setDropdownSubmenuClicked(!dropdownSubmenuClicked);
  }

  return (
    <div className={styles.dropdownSubMenu}>
      <div onClick={handleClick} className={styles.dropdownMenuItem}>
        <p className={styles.dropdownMenuText}>{name}</p>
        <p
          id={`dropdownSubmenuArrow_${name}`}
          className={[styles.dropdownArrow, dropdownSubmenuClicked ? utilStyles.rotate : ''].join(' ')}
        >
          {'>'}
        </p>
      </div>
      {items.map((item, i) => {
        return (
          <DropdownSubmenuItem
            name={item.name}
            link={item.link}
            isDisplayed={dropdownSubmenuClicked}
            isInitialLoad={initialSubmenuLoad}
            key={i}
          ></DropdownSubmenuItem>
        );
      })}
    </div>
  );
}

function DropdownSubmenuItem({
  name,
  link,
  isDisplayed,
  isInitialLoad
}: {
  name: string;
  link: string;
  isDisplayed: boolean;
  isInitialLoad: boolean;
}) {
  return (
    <div
      className={[
        styles.dropdownSubmenuItem,
        isDisplayed ? utilStyles.slideIn : utilStyles.slideOut,
        isInitialLoad ? utilStyles.hidden : ''
      ].join(' ')}
    >
      <Link href={link} className={styles.dropdownMenuText}>
        {name}
      </Link>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header></Header>
      <div>{children}</div>
    </>
  );
}
