import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
// import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] });

const Home = () => {
  return (
    <>
      <Head>
        <title>Game requirements guide</title>
        <meta name="description" content="Game requirements guide" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main >
        <h1 className={inter.className}>Game requirements guide</h1>
      </main>
    </>
  )
};

export default Home;
