/* eslint strict:0 */
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import bunyan from 'browser-bunyan';
import Logger from '../Logger';
import rollbar from './rollbar.umd.nojson';


const rollbarToken = Meteor.settings &&
  Meteor.settings.public && Meteor.settings.public.Rollbar &&
  Meteor.settings.public.Rollbar.post_client_item;

const environment = Meteor.settings && Meteor.settings.public &&
  Meteor.settings.public.environment;

const rollbarConfig = {
  accessToken: rollbarToken,
  captureUncaught: true,
  payload: {
    environment: environment,
  }
};

let Rollbar = rollbar.init(rollbarConfig);

Tracker.autorun(function() {
  const userId = Meteor.userId();
  const user = Meteor.users.findOne({ _id: userId, }, { fields: { username: 1 } });
  if (user) {
    rollbarConfig.payload.person = {
      id: user._id,
      username: user.username
    };
    console.log(`User changed, configuring rollbar with ${user._id} and ${user.username}`);
    Rollbar.configure(rollbarConfig);
  }
});

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

class LoggerClient extends Logger {
  error(msg, err) {
    if (_.isObject(msg)) {
      Rollbar.error(msg.msg, msg.err);
    } else if (err) {
      Rollbar.error(msg, err);
    } else {
      Rollbar.error(msg);
    }
    super.error(msg, err);
  }
}

const logger = new LoggerClient(log);

export {
  logger,
  Rollbar,
};


