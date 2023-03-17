import { GetServerSideProps } from 'next';
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import Head from 'next/head';
import axios from "axios";

const inter = Inter({ subsets: ['latin'] });

interface GameDetailsProps {
  videoGame: any;
}

const GameDetails = ({ videoGame }: GameDetailsProps) => {
  const router = useRouter();
  const gameName = router.query.gameName as string;
  // const releaseDate = (new Date(videoGame?.first_release_date)).toLocaleDateString();

  // console.log('First release date', videoGame?.first_release_date, new Date(videoGame?.first_release_date));
  console.log(gameName, videoGame);

  return (
    <>
      <Head>
        <title>Game: {videoGame?.name}</title>
        <meta name="description" content={videoGame?.summary} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={inter.className}>
        <h1>{videoGame?.name}</h1>
        {/* <h3>Release: {releaseDate}</h3> */}
        <p>{videoGame?.summary}</p>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<GameDetailsProps> = async ({ params }) => {
  const gameName = params?.gameName?.toString();
  const api = 'http://localhost:3000/api';

  if (!gameName) {
    return {
      props: {
        videoGame: null,
      },
    };
  }
  
  try {
    const response = await axios.post(`${api}/games`, { slug: gameName });
    const videoGame = response?.data;

    return {
      props: {
        videoGame,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        videoGame: null,
      },
    };
  }
};

export default GameDetails;