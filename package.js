"use strict";

Package.describe({
  summary: "Basic Logger",
  version: "2.0.0",
  name: 'andylash:basic-logger',
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.3');
  api.use('ecmascript');
  api.use('tracker', 'client');

  api.mainModule('src/client/index.js', 'client');
  api.mainModule('src/server/index.js', 'server');
});

