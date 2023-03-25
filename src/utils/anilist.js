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

  async getUserAnimeWatching(userId) {
    console.info(`[Anilist] Get Anime Watching List for ${userId}`);
    const query = `
      query {
        MediaListCollection(userId: ${userId}, type: ANIME, forceSingleCompletedList: true, status: CURRENT) {
          lists {
            entries {
              progress
              media {
                id
                popularity
                format
                status
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
      }   
    `;
    const url = 'https://graphql.anilist.co';
    let response = await sendPostRequest(url, query);
    if (response.ok) {
      console.info(`[Anilist] Got Anime Watching List`);
      const body = await response.json();
      const medias = [];
      if (body.data.MediaListCollection.lists.length !== 0) {
        for (const media of body.data.MediaListCollection.lists[0].entries) {
          medias.push({
            id: media.media.id,
            progress: media.progress,
            format: media.media.format,
            title: media.media.title,
            episodes: media.media.episodes,
            nextAiringEpisode: media.media.nextAiringEpisode,
            airingSchedule: media.media.airingSchedule,
            coverImage: media.media.coverImage,
            siteUrl: media.media.siteUrl,
            stats: media.media.stats,
            popularity: media.media.popularity,
            status: media.media.status
          });
        }
        return medias;
      } else {
        return [];
      }
    } else {
      throw new Error(`[Anilist] Failed to get user anime watching list with status ${response.status}`);
    }
  }

  async updateMedia(accessToken, mediaId, progress) {
    console.info(`[Anilist] Updating ${mediaId} with progress ${progress}`);
    const search = `
      mutation {
        SaveMediaListEntry(mediaId: ${mediaId}, progress: ${progress}) {
          progress
        }
      }
    `;
    const url = 'https://graphql.anilist.co';
    let response = await sendAuthenticatedPostRequest(url, search, accessToken);
    if (response.ok) {
      console.log(`[Anilist] Updated`);
      return true;
    } else {
      throw new Error(`[Anilist] Failed to Update`);
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
