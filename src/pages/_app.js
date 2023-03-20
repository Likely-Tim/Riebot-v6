import '../styles/global.css';
import Layout from '../components/layout';
import { MantineProvider } from '@mantine/core';
import { Analytics } from '@vercel/analytics/react';
import { Notifications } from '@mantine/notifications';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'dark' }}>
        <Layout>
          <Notifications />
          <Component {...pageProps} />
          <Analytics />
        </Layout>
      </MantineProvider>
    </UserProvider>
  );
}
