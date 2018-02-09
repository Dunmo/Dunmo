Meteor.startup(function () {
  smoothScroll.init({
    selector: '[data-scroll]', // Selector for links (must be a valid CSS selector)
    selectorHeader: '[data-scroll-header]', // Selector for fixed headers (must be a valid CSS selector)
    speed: 500, // Integer. How fast to complete the scroll in milliseconds
    easing: 'easeInOutCubic', // Easing pattern to use
    updateURL: true, // Boolean. Whether or not to update the URL with the anchor hash on scroll
    offset: 0, // Integer. How far to offset the scrolling anchor location in pixels
    callback: function ( toggle, anchor ) {} // Function to run after scrolling
  });

  window.GOOGLE_CLIENT_ID = {
    "web": {
      "client_id": "972227968013-0ekd093oied7ct430furt4khj6oopdsl.apps.googleusercontent.com",
      "project_id": "dunmo-the-first",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://accounts.google.com/o/oauth2/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_secret": "_kG7A43a64x9UhgdbZ8-suCK",
      "javascript_origins": ["http://localhost","https://dunmoapp.com","https://dunmo.co"]
    }
  }
});
