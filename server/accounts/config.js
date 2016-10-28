
var google_client_secret = process.env.SECRETS_GOOGLE;
// check(google_client_secret, String);
// TODO: hack, switch after meteor upgrade
if (typeof google_client_secret !== 'string') {
  console.error('expected String for google_client_secret, got:',
    google_client_secret,
    ',',
    typeof google_client_secret);
}

ServiceConfiguration.configurations.upsert(
  { service: 'google' },
  {
    $set: {
      clientId: '185519853107-4u8h81a0ji0sc44c460guk6eru87h21g.apps.googleusercontent.com',
      loginStyle: 'popup',
      secret: google_client_secret
    }
  }
);
