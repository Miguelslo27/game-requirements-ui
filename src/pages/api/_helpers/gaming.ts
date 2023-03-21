import axios from 'axios';
import cheerio from 'cheerio';

export const getClientCredentials = async () => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const grantType = 'client_credentials';
  const params = new URLSearchParams({
    client_id: clientId || '',
    client_secret: clientSecret || '',
    grant_type: grantType,
  });

  try {
    const responseToken = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      params
    );
    return responseToken.data.access_token;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getGames = async (accessToken: string) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const config = {
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'text/plain',
    },
  };
  const api = 'https://api.igdb.com/v4';
  const responseForGames = await axios.post(
    `${api}/games`,
    `
      fields *;
      limit 100;
    `,
    { ...config }
  );
  
  return responseForGames.data;
}

export const getGameData = async (slug: string, accessToken: string) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const config = {
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'text/plain',
    },
  };
  const api = 'https://api.igdb.com/v4';
  const responseForGame = await axios.post(
    `${api}/games`,
    `
      fields *; where slug = "${slug}";
    `,
    { ...config }
  );
  const game = responseForGame.data[0];
  const responseForMultiQuery = await axios.post(
    `${api}/multiquery`,
    `
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
        where id=(${game.external_games?.join(',') || 0});
      };
      query game_modes "game_modes" {
        fields *;
        where id=(${game.game_modes?.join(',') || 0});
      };
      query genres "genres" {
        fields *;
        where id=(${game.genres?.join(',') || 0});
      };
      query platforms "platforms" {
        fields *;
        where id=(${game.platforms?.join(',') || 0});
      };
      query release_dates "release_dates" {
        fields *;
        where id=(${game.release_dates?.join(',') || 0});
      };
      query screenshots "screenshots" {
        fields *;
        where id=(${game.screenshots?.join(',') || 0});
      };
      query games "similar_games" {
        fields *;
        where id=(${game.similar_games?.join(',') || 0});
      };
      query websites "websites" {
        fields *;
        where id=(${game.websites?.join(',') || 0});
      };
    `,
    { ...config }
  );
  const responseForMultiQuery2 = await axios.post(
    `${api}/multiquery`,
    `
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
        where platforms=(${game.platforms?.join(',') || 0});
      };
    `,
    { ...config }
  );
  responseForMultiQuery.data.forEach((data: any) => {
    game[data.name] = data.result;
  });
  responseForMultiQuery2.data.forEach((data: any) => {
    game[data.name] = data.result;
  });

  return game;
};

export const getRequirements = async (game: any) => {
  const websiteUrl = game.websites?.filter(
    (web: any) => web.url?.includes('store.steampowered.com')
  )[0]?.url;

  if (!websiteUrl) return null;

  const websiteResponse = await axios.get(
    game.websites.filter((web: any) => web.url.includes('store.steampowered.com'))[0]
      .url
  );
  const html = websiteResponse.data;
  const $ = cheerio.load(html);
  const requirements = {} as any;

  $('.sysreq_tab').each((index, content) => {
    const system = $(content).text().trim();
    requirements[system] = {};

    $(`.sysreq_content:nth(${index}) > div`).each((reqsIndex, reqsContent) => {
      const levelSysRequirements = $(reqsContent).find('> ul > strong').text().trim();

      if (levelSysRequirements) {
        requirements[system][levelSysRequirements] = [];

        $(reqsContent).find('> ul > ul > li').each((reqIndex, reqContent) => {
          const reqHardwareType = $(reqContent).find('strong').text().trim();
          const reqContentHtml = $(reqContent).html();
          const reqHardwareSpecs = reqContentHtml
            ? reqContentHtml
                .replace(`<strong>${reqHardwareType}</strong>`, '')
                .replace('<br>', '')
                .trim()
            : '';

          requirements[system][levelSysRequirements].push({
            hardware: reqHardwareType,
            specs: reqHardwareSpecs,
          });
        });
      }
    });
  });

  return requirements;
};
