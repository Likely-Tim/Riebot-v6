import '../styles/global.css';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Layout from '../components/layout';

const theme = createTheme({ type: 'dark' });

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <NextUIProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </NextUIProvider>
    </UserProvider>
  );
}
