import React from 'react';
import Link from 'next/link';
import styles from '../styles/layout.module.css';
import utilStyles from '../styles/utils.module.css';

function Header() {
  return (
    <div className={styles.header}>
      <Navigation></Navigation>
      <Title></Title>
    </div>
  );
}

function Title() {
  return <p className={styles.title}>Riebot</p>;
}

function Navigation() {
  const [isDropdownActive, setDropdownActive] = React.useState(false);

  function handleDropdownClick() {
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
      <Dropdown isDropdownActive={isDropdownActive}></Dropdown>
    </>
  );
}

function Dropdown({ isDropdownActive }: { isDropdownActive: boolean }) {
  function handleAnimationEnd(event: React.AnimationEvent<HTMLDivElement>) {
    if (event.animationName === 'fadeIn')
      document.getElementById('headerDropdownMenu')?.classList.toggle(utilStyles.hidden);
  }

  return (
    <div
      id="headerDropdownMenu"
      onAnimationEnd={handleAnimationEnd}
      className={[styles.dropdownMenu, isDropdownActive ? utilStyles.fadeIn : utilStyles.fadeOut].join(' ')}
    >
      <DropdownMenuItem name="Home" link="/"></DropdownMenuItem>
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header></Header>
      <div>{children}</div>
    </>
  );
}
