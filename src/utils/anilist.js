import fetch from 'node-fetch';

class Anilist {
  async getAuthenticatedUser(accessToken) {
    const query = `
    query {
      Viewer {
        id
        name
      }
    }  
  `;
    const url = 'https://graphql.anilist.co';
    let response = await sendAuthenticatedPostRequest(url, query, accessToken);
    if (response.ok) {
      console.info(`[Anilist] Get Authenticated User Response Status: ${response.status}`);
      const body = await response.json();
      return body.data.Viewer;
    } else {
      throw new Error(`[Anilist] Failed Getting Authenticated User Response Status: ${response.status}`);
    }
  }

  async getAnimeAiringBetweenTimes(startTime, endTime, page) {
    if (!page) {
      page = 1;
    }
    console.info(`[Anilist] Get Anime Airing Between ${startTime}-${endTime} page ${page}`);
    const query = `
      query {
        Page(page: ${page}, perPage: 50) {
          pageInfo {
            hasNextPage
          }
          airingSchedules(airingAt_greater: ${startTime}, airingAt_lesser: ${endTime}, sort: [TIME]) {
            media {
              popularity
              format
              title {
                romaji
                english
                native
              }
              episodes
              nextAiringEpisode {
                timeUntilAiring
                airingAt
                episode
              }
              airingSchedule {
                pageInfo {
                  hasNextPage
                }
                nodes {
                  timeUntilAiring
                  episode
                }
              }
              coverImage {
                extraLarge
                large
                medium
                color
              }
              siteUrl
              stats {
                scoreDistribution {
                  score
                  amount
                }
                statusDistribution {
                  status
                  amount
                }
              }
            }
          }
        }
      }   
    `;
    const url = 'https://graphql.anilist.co';
    let response = await sendPostRequest(url, query);
    if (response.ok) {
      console.info(`[Anilist] Got Anime Airing Between Time`);
      const body = await response.json();
      let medias = [];
      for (const media of body.data.Page.airingSchedules) {
        medias.push(media.media);
      }
      if (body.data.Page.pageInfo.hasNextPage) {
        const response = await this.getAnimeAiringBetweenTimes(startTime, endTime, ++page);
        if (response) {
          medias.push(...response);
        }
      }
      return removeDuplicateMedia(medias);
    } else {
      return new Error(`[Anilist] Failed to get airing anime between time with status: ${response.status}`);
    }
  }
}

async function sendPostRequest(url, query) {
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: query
    })
  });
  return response;
}

async function sendAuthenticatedPostRequest(url, query, accessToken) {
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      query: query
    })
  });
  return response;
}

// Anilist API bug may return duplicates
function removeDuplicateMedia(medias) {
  return medias.filter((media, index, medias) => index === medias.findIndex((temp) => temp.siteUrl === media.siteUrl));
}

export default new Anilist();
