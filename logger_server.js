/* global logger:true, Rollbar:true, Logger */
"use strict";

let log;
const LOGGLY_BUFFERING = 1; //1 means send every message as it comes
const bunyan = Npm.require('bunyan');
const Bunyan2Loggly = Npm.require('bunyan-loggly').Bunyan2Loggly;
const bformat = Npm.require('bunyan-format');
const formatOut = bformat({
  outputMode: 'short'
});
const BunyanPrettyStream = Npm.require('bunyan-prettystream');
const prettyStream = new BunyanPrettyStream(process.stdout);


const streams = [];
if (process.stdout.isTTY) {
  streams.push({
    stream: prettyStream,
    level: 'trace',
    type: 'raw'
  });
} else {
  streams.push({
    stream: formatOut,
    level: 'trace',
  });
}

const logglyInfo = Meteor.settings && Meteor.settings.Loggly;
if (logglyInfo) {
  streams.push({
    type: 'raw',
    stream: new Bunyan2Loggly({
      token: logglyInfo.token, // "30523901-937b-4959-82c2-8a1b4d08aa30",
      subdomain: logglyInfo.subdomain, //"opstarts"
    }, LOGGLY_BUFFERING)
  });
}

const rollbarToken = Meteor.settings && Meteor.settings.Rollbar && Meteor.settings.Rollbar.post_server_item;
const environment = Meteor.settings && Meteor.settings.public &&
  Meteor.settings.public.environment;
let Rollbar;
if (rollbarToken) {
  Rollbar = Npm.require('rollbar');
  const os = Npm.require('os');
  const hostname = os.hostname();

  Rollbar.init(rollbarToken, {
    environment: environment,
    endpoint: "https://api.rollbar.com/api/1/",
    host: hostname,
    verbose: false
  });
  Rollbar.handleUncaughtExceptions(rollbarToken);
}

log = bunyan.createLogger({
  name: "Default",
  //src is very expensive, don't use on prod
  src: !!(Meteor.settings && Meteor.settings.public && Meteor.settings.public.environment !== 'production'),
  streams: streams,
});

log.level("debug"); //set debug as standard level


if (Rollbar) {
  const LoggerServer = class LoggerServer extends Logger {
    error(msg, err) {
      let m = msg;
      let e = err;
      if (_.isObject(msg)) {
        m = msg.msg;
        e = msg.err;
      }

      if (e) {
        Rollbar.handleErrorWithPayloadData(e, {
          level: "error",
          custom: {
            message: m
          }
        });
      } else {
        Rollbar.reportMessage(m, "error");
      }
      super.error(msg, err);
    }
  };
  logger = new LoggerServer(log);
} else {
  logger = new Logger(log);
}
