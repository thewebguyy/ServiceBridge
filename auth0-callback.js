const jwtDecode = require('jwt-decode');

exports.handler = function(event, context, callback) {
  const webAuth = new window.auth0.WebAuth({
    domain: 'dev-zqp1irwzxov7w7nq.us.auth0.com',
    clientID: '30PS3AlCcPQFMjYAlgobyItJSpvyFBN4',
    redirectUri: 'https://' + event.headers.Host + '/.netlify/functions/auth0-callback',
  });

  webAuth.parseHash(function(err, authResult) {
    if (err) {
      console.error('Auth0 error:', err);
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error parsing Auth0 authentication result.' }),
      });
    }

    if (authResult && authResult.accessToken && authResult.idToken) {
      setSession(authResult);
    }

    return callback(null, {
      statusCode: 302,
      headers: {
        Location: '/profile.html',
        'Cache-Control': 'no-cache',
      },
      body: '',
    });
  });

  function setSession(authResult) {
    // Save tokens to local storage
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);

    // Save user ID and expiration time
    const decodedToken = jwtDecode(authResult.idToken);
    localStorage.setItem('user_id', decodedToken.sub);
    localStorage.setItem('expires_at', decodedToken.exp * 1000);
  }
};
