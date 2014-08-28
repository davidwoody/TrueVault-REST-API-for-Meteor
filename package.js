Package.describe({
  summary: "Use the TrueVault REST API easily with Meteor.",
  version: "1.0.0",
  git: " \* Fill me in! *\ "
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.0');
  api.use('http', 'server');
  api.use('underscore', 'server');
  api.addFiles('hmac-sha256.js', 'server');
  api.addFiles('enc-base64-min.js', 'server');

  api.export('CryptoJS', 'server');

  api.addFiles('truevault_both.js');
  api.addFiles('truevault_server.js', 'server');

  // Export the object 'TrueVault' to packages or apps that use this package.
  api.export('TrueVault', 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('woody:truevault');
  api.addFiles('woody:truevault-tests.js');
});
