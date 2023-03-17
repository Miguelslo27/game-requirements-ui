import { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }
  
  // >>> GET TOKEN
  const clientId = '1kr7nti016horcw8y2cfajed6a12rv';
  const clientSecret = 'l3p9azgiausqd7gspyork5blkbi5jg';
  const grantType = 'client_credentials';
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: grantType
  });
  let accessToken;
  
  try {
    const responseToken = await axios.post('https://id.twitch.tv/oauth2/token', params);
    accessToken = responseToken.data.access_token;
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
  // console.log('TOKEN', accessToken);
  // <<< GET TOKEN
  
  const { slug } = req.body;
  const api = 'https://api.igdb.com/v4';
  
  try {
    const config = {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
    };
    const responseForGame = await axios.post(`${api}/games`, `
      fields *; where slug = "${slug}";
    `, { ...config });
    const game = responseForGame.data[0];

    // MULTI QUERY UP TO 10
    const responseForMultiQuery = await axios.post(`${api}/multiquery`, `
      query covers "covers" {
        fields *;
        where game=${game.id};
      };
      query game_videos "game_videos" {
        fields *;
        where game=${game.id};
      };
      query external_games "external_games" {
        fields *;
        where id=(${game.external_games.join(',')});
      };
      query game_modes "game_modes" {
        fields *;
        where id=(${game.game_modes.join(',')});
      };
      query genres "genres" {
        fields *;
        where id=(${game.genres.join(',')});
      };
      query platforms "platforms" {
        fields *;
        where id=(${game.platforms.join(',')});
      };
      query release_dates "release_dates" {
        fields *;
        where id=(${game.release_dates.join(',')});
      };
      query screenshots "screenshots" {
        fields *;
        where id=(${game.screenshots.join(',')}); 
      };
      query games "similar_games" {
        fields *;
        where id=(${game.similar_games.join(',')});
      };
      query websites "websites" {
        fields *;
        where id=(${game.websites.join(',')});
      };
    `, { ...config });

    const responseForMultiQuery2 = await axios.post(`${api}/multiquery`, `
      query alternative_names "alternative_names" {
        fields *;
        where game=${game.id};
      };
      query artworks "artworks" {
        fields *;
        where game=${game.id};
      };
      query characters "characters" {
        fields *;
        where games=${game.id};
      };
      query collections "collections" {
        fields *;
        where games=${game.id};
      };
      query companies "companies" {
        fields *;
        where published=${game.id};
      };
      query franchises "franchises" {
        fields *;
        where games=${game.id};
      };
      query game_engines "game_engines" {
        fields *;
        where platforms=(${game.platforms.join(',')});
      };
    `, { ...config });

    responseForMultiQuery.data.forEach((data: any) => {
      game[data.name] = data.result;
    });
    responseForMultiQuery2.data.forEach((data: any) => {
      game[data.name] = data.result;
    });
  
    const websiteResponse = await axios.get(
      game.websites.filter(web => web.url.includes('store.steampowered.com'))[0].url,
    );
    const html = websiteResponse.data;
    const $ = cheerio.load(html);
    const requirements = {};

    $('.sysreq_tab').each((index, content) => {
      const system = $(content).text().trim();
      requirements[system] = {};

      $(`.sysreq_content:nth(${index}) > div`).each((reqsIndex, reqsContent) => {
        const levelSysRequirements = $(reqsContent).find('> ul > strong').text().trim();

        if (levelSysRequirements) {
          requirements[system][levelSysRequirements] = [];
  
          $(reqsContent).find('> ul > ul > li').each((reqIndex, reqContent) => {
            const reqHardwareType = $(reqContent).find('strong').text().trim();
            const reqHardwareSpecs = $(reqContent).html().replace(`<strong>${reqHardwareType}</strong>`, '').replace('<br>', '').trim()
  
            requirements[system][levelSysRequirements].push({
              hardware: reqHardwareType,
              specs: reqHardwareSpecs,
            });
          });
        }
      });
    });

    game.requirements = requirements;
    return res.status(200).json(game);
  } catch (error) {
    console.error('Error', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default handler;
