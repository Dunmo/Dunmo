
var google_client_secret = process.env.SECRETS_GOOGLE;
check(google_client_secret, String);

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
