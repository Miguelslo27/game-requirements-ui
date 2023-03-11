import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect } from "react";

const inter = Inter({ subsets: ['latin'] });

// l3p9azgiausqd7gspyork5blkbi5jg

const GameDetails = () => {
  const router = useRouter();
  const { gameName } = router.query;

  useEffect(() => {
    
  }, [])

  return (
    <h1 className={inter.className}>Game details: {gameName}</h1>
  );
};

export default GameDetails;
