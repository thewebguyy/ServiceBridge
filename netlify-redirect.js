const redirectUrl = process.env.REDIRECT_URL;
const domain = process.env.AUTH0_DOMAIN;
const clientID = process.env.AUTH0_CLIENT_ID;
const responseType = 'code';
const scope = 'openid profile email';

exports.handler = async (event, context) => {
  const { identity, user } = context.clientContext;
  if (user) {
    // user is already logged in, redirect to dashboard/profile page
    return {
      statusCode: 302,
      headers: {
        Location: '/profile.html',
      },
      body: '',
    };
  }

  const queryString = new URLSearchParams({
    redirect_uri: `${redirectUrl}/.netlify/functions/auth0-callback`,
    audience: `https://${domain}/api/v2/`,
    client_id: clientID,
    response_type: responseType,
    scope: scope,
    state: identity.url,
  }).toString();

  const authUrl = `https://${domain}/authorize?${queryString}`;

  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
    },
    body: '',
  };
};
