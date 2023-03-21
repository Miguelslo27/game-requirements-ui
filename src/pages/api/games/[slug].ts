import { NextApiRequest, NextApiResponse } from 'next';
import { getClientCredentials, getGameData, getRequirements } from '@/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }
  
  const accessToken = await getClientCredentials();
  const { slug } = req.query;

  if (accessToken === null) {
    return res.status(500).json({ message: 'Internal server error.' });
  }

  try {
    const game = await getGameData(slug as string, accessToken);
    const requirements = await getRequirements(game);
    game.requirements = requirements;

    return res.status(200).json(game);
  } catch (error) {
    console.error('Error', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default handler;
