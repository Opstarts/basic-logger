Package.describe({
  summary: "Basic Logger",
  version: "2.0.3",
  name: 'andylash:basic-logger',
});

Npm.depends({
  "browser-bunyan": "0.2.3",
  "bunyan": "1.8.1",
  "bunyan-format": "0.2.1",
  "bunyan-loggly": "1.0.0",
  "lodash": "3.10.1",
  "raven": "1.1.4",
  "raven-js": "3.12.1"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.3');
  api.use('ecmascript');
  api.use('tracker', 'client');

  api.mainModule('src/client/index.js', 'client');
  api.mainModule('src/server/index.js', 'server');
});

