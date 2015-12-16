"use strict";

Package.describe({
  summary: "Basic Logger",
  version: "1.0.19",
  name: 'andylash:basic-logger',
});

Npm.depends({
  'bunyan': '1.4.0',
  'bunyan-loggly': '0.0.5',
  'bunyan-format': '0.2.1',
  'bunyan-prettystream': '0.1.3',
  'rollbar': '0.5.10',
  'core-js': '1.2.0',
});


Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.2');
  api.use('ecmascript');
  api.use(['cosmos:browserify@0.9.2'], 'client');
  api.use('tracker', 'client');

  api.addFiles('rollbar.nojson-1.7.2.js', 'client');
  api.addFiles('client.browserify.js', 'client');
  api.addFiles('rollbar.js', 'client');
  api.addFiles('logger_base.js', ['client', 'server']);

  api.addFiles('logger_server.js', 'server');
  api.addFiles('logger_client.js', 'client');


  api.export('logger', ['client', 'server']);
  api.export('Rollbar', 'client');
  api.export('RotatingFileStream', 'client'); //see: https://github.com/trentm/node-bunyan/issues/223
});

