/* eslint strict:0 */
import os from 'os';

import { Meteor } from 'meteor/meteor';

import _ from 'lodash';
import bunyan from 'bunyan';
import Bunyan2Loggly from 'bunyan-loggly';
import bformat from 'bunyan-format';
import Raven from 'raven';

import Logger from '../Logger';

let logger;
const LOGGLY_BUFFERING = 1; //1 means send every message as it comes
const formatOutConsole = bformat({
  outputMode: 'short',
  color: true
});
const formatOutServer = bformat({
  outputMode: 'short',
  color: false
});


// const BunyanPrettyStream = Npm.require('bunyan-prettystream');
// const prettyStream = new BunyanPrettyStream(process.stdout);
const environment = Meteor.settings && Meteor.settings.public && Meteor.settings.public.environment;

const streams = [{
  stream: environment === 'development' ? formatOutConsole : formatOutServer,
  level: 'trace',
}];

const logglyInfo = Meteor.settings && Meteor.settings.Loggly;
if (logglyInfo) {
  streams.push({
    type: 'raw',
    stream: new Bunyan2Loggly({
      token: logglyInfo.token,
      subdomain: logglyInfo.subdomain,
    }, LOGGLY_BUFFERING)
  });
}

// Raven
const sentryToken = Meteor.settings &&
  Meteor.settings.Sentry &&
  Meteor.settings.Sentry.config;

if (sentryToken) {
  const hostname = os.hostname();

  Raven.config(sentryToken, {
    environment,
    extra: {
      host: hostname,
    },
  }).install();
}

const log = bunyan.createLogger({
  name: "Default",
  //src is very expensive, don't use on prod
  src: !!(environment !== 'production'),
  streams: streams,
});

log.level("debug"); //set debug as standard level


if (Raven) {
  class LoggerServer extends Logger {
    error(msg, err) {
      let m = msg;
      let e = err;
      if (_.isObject(msg)) {
        m = msg.msg;
        e = msg.err;
      }

      if (e) {
        Raven.captureException(e, {
          extra: {
            message: m
          }
        });
      } else {
        Raven.captureMessage(m, {
          level: "error",
        });
      }
      super.error(msg, err);
    }
  }

  logger = new LoggerServer(log);
} else {
  logger = new Logger(log);
}

export { logger };

