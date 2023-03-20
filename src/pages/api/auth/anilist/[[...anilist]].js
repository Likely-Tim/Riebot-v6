import fetch from 'node-fetch';
import MongoDb from '../../../../utils/mongo_db';
import Anilist from '../../../../utils/anilist';

const BASE_URL = process.env.BASE_URL;
const ANILIST_ID = process.env.ANILIST_ID;
const ANILIST_SECRET = process.env.ANILIST_SECRET;

export default async function handler(request, response) {
  const { anilist } = request.query;

  if (!anilist) {
    response.redirect(
      `https://anilist.co/api/v2/oauth/authorize?client_id=${ANILIST_ID}&redirect_uri=${BASE_URL}api/auth/anilist/callback&response_type=code`
    );
    return;
  } else if (anilist.length === 1 && anilist[0] === 'callback') {
    try {
      const auth0Id = request.cookies.auth0Id;
      const code = request.query.code;
      const oauth = await anilistAccept(code);
      const user = await Anilist.getAuthenticatedUser(oauth.access_token);
      const expireTime = Date.now() + oauth.expires_in * 1000;
      await MongoDb.insertToken(`anilist_${user.id}`, oauth.access_token, oauth.refresh_token, expireTime, auth0Id);
      await MongoDb.insertAnilistUser(user.id, user.name);
      if (request.cookies.redirect) {
        return response.redirect(`${request.cookies.redirect}?anilistAuth=successful`);
      } else {
        return response.redirect(`/?anilistAuth=successful`);
      }
    } catch (err) {
      console.error(err);
      return response.redirect('/?anilistAuth=failed');
    }
  }
}

async function anilistAccept(code) {
  const url = 'https://anilist.co/api/v2/oauth/token';
  const data = {
    grant_type: 'authorization_code',
    client_id: ANILIST_ID,
    client_secret: ANILIST_SECRET,
    redirect_uri: `${BASE_URL}api/auth/anilist/callback`,
    code: code
  };
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    body: new URLSearchParams(data)
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Anilist Callback Failed');
  }
}
