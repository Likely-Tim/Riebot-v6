import '../styles/global.css';
import { SWRConfig } from 'swr';
import Layout from '../components/layout';
import { MantineProvider } from '@mantine/core';
import { Analytics } from '@vercel/analytics/react';
import { Notifications } from '@mantine/notifications';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'dark' }}>
        <SWRConfig value={{ fetcher: (...args) => fetch(...args).then((res) => res.json()), revalidateOnFocus: false }}>
          <Layout>
            <Notifications />
            <Component {...pageProps} />
            <Analytics />
          </Layout>
        </SWRConfig>
      </MantineProvider>
    </UserProvider>
  );
}
