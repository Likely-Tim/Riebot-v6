import '../styles/global.css';
import Layout from '../components/layout';
import NextNProgress from 'nextjs-progressbar';
import { MantineProvider } from '@mantine/core';
import { Analytics } from '@vercel/analytics/react';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'dark' }}>
        <Layout>
          <NextNProgress />
          <Component {...pageProps} />
          <Analytics />
        </Layout>
      </MantineProvider>
    </UserProvider>
  );
}
