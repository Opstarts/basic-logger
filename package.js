"use strict";

Package.describe({
  summary: "Basic Logger",
  version: "1.0.3",
  name: 'andylash:basic-logger',
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0');
  api.use('grigio:babel@0.1.8', ['client', 'server']);
  api.use(['cosmos:browserify@0.5.1'], 'client');
  api.use('tracker', 'client');

  Npm.depends({
    bunyan: '1.4.0',
    'bunyan-loggly': '0.0.5',
    'bunyan-format': '0.2.1',
    'bunyan-prettystream': '0.1.3',
    'rollbar': '0.5.8',
    'rollbar-browser': '1.5.0'
  });

  api.addFiles('client.browserify.js', 'client');
  api.addFiles('rollbar.es6', 'client');
  api.addFiles('logger_base.es6', ['client', 'server']);

  api.addFiles('logger_server.es6', 'server');
  api.addFiles('logger_client.es6', 'client');


  api.export('logger', ['client', 'server']);
  api.export('Rollbar', 'client');
  api.export('RotatingFileStream', 'client'); //see: https://github.com/trentm/node-bunyan/issues/223
});

