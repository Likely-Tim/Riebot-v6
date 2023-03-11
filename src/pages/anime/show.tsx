import Head from 'next/head';
import Layout from '@/components/layout';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Riebot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </Layout>
  );
}

export const getServerSideProps = withPageAuthRequired();
