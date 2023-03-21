import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { GetServerSideProps } from 'next';
import axios from 'axios';
// import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] });

interface GamesProps {
  videoGames: any;
}

const Home =  ({ videoGames }: GamesProps) => {
  console.log(videoGames);
  
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
        <ul>
          {videoGames.map((game: any) => (
            <li key={game.id}><a href={game.slug}>{game.name}</a></li>
          ))}
        </ul>
      </main>
    </>
  )
};

export const getServerSideProps: GetServerSideProps<GamesProps> = async ({ params }) => {
  const api = 'http://localhost:3000/api';

  try {
    const response = await axios.get(`${api}/games`);
    const videoGames = response?.data;

    return {
      props: {
        videoGames,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        videoGames: null,
      },
    };
  }
};

export default Home;
