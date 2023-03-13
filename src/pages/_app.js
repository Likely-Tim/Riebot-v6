import '../styles/global.css';
import Layout from '../components/layout';
import NextNProgress from 'nextjs-progressbar';
import { Analytics } from '@vercel/analytics/react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { createTheme, NextUIProvider } from '@nextui-org/react';

const theme = createTheme({ type: 'dark' });

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <NextUIProvider theme={theme}>
        <Layout>
          <NextNProgress />
          <Component {...pageProps} />
          <Analytics />
        </Layout>
      </NextUIProvider>
    </UserProvider>
  );
}
