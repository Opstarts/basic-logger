/* global logger:true, bunyan, Logger Rollbar */
/* eslint no-console:0 */
"use strict";

const getLevel = function(rec) {
  return rec.area ? `${rec.area}-${bunyan.nameFromLevel[rec.level]}` : bunyan.nameFromLevel[rec.level];
};

function MyRawStream() {}
MyRawStream.prototype.write = function(rec) {
  const base = `[${rec.time.toISOString()}] ${getLevel(rec)}: ${rec.msg}`;
  if (rec.err) {
    console.error(base + ` ${rec.err.message}, ${rec.err.stack}`);
    return;
  }
  console.log(base);
};

const log = bunyan.createLogger({
  name: 'Opstarts',
  streams: [{
    level: 'info',
    stream: new MyRawStream(),
    type: 'raw'
  }]
});

const LoggerClient = class LoggerClient extends Logger {
  error(msg, err) {
    if (_.isObject(msg)) {
      Rollbar.error(msg.msg, msg.err);
    } else {
      Rollbar.error(msg, err);
    }
    super.error(msg, err);
  }
};

logger = new LoggerClient(log);

