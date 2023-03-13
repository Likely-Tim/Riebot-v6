import '../styles/global.css';
import Layout from '../components/layout';
import NextNProgress from 'nextjs-progressbar';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import { UserProvider } from '@auth0/nextjs-auth0/client';

const theme = createTheme({ type: 'dark' });

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <NextUIProvider theme={theme}>
        <Layout>
          <NextNProgress />
          <Component {...pageProps} />
        </Layout>
      </NextUIProvider>
    </UserProvider>
  );
}
