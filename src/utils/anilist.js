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

export default new Anilist();
