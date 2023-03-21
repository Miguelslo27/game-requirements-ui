import { NextApiRequest, NextApiResponse } from 'next';
import { getClientCredentials, getGames } from '@/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const accessToken = await getClientCredentials();

  if (accessToken === null) {
    return res.status(500).json({ message: 'Internal server error.' });
  }

  try {
    const games = await getGames(accessToken);
    return res.status(200).json(games);
  } catch (error) {
    console.error('Error', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default handler;
