/* eslint strict:0 */
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import bunyan from 'browser-bunyan';
import Logger from '../Logger';
import Raven from 'raven-js';


const token = Meteor.settings &&
  Meteor.settings.public && Meteor.settings.public.Sentry &&
  Meteor.settings.public.Sentry.config;

const environment = Meteor.settings && Meteor.settings.public &&
  Meteor.settings.public.environment;

const config = {
  environment,
};

Raven.config(token, config).install();

Tracker.autorun(function() {
  const userId = Meteor.userId();
  const user = Meteor.users.findOne({ _id: userId, }, { fields: { username: 1 } });
  if (user) {
    const person = {
      id: user._id,
      username: user.username
    };
    Raven.setUserContext(person);
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

const transformError = (err) => {
  if (typeof err === 'string') {
    return new Error(err);
  } else if (err instanceof Error) {
    return err;
  } else {
    let errObj;
    if (err.message) {
      errObj = new Error(err.message);
      if (err.stack) {
        errObj.stack = err.stack;
      }

      return errObj;
    }
    // otherwise, wtf is err
  }
}

const transformMessage = (msg) => {
  if (typeof msg === 'string') {
    return {
      message: msg,
      context: {},
    };
  }

  const {
    msg: message,
    ...other,
  } = msg;

  if (message) {
    return {
      message: message || '',
      context: other || {},
    }
  }
};

const captureMessage = (level, msg, context, { quiet } = {}) => {
  if (!quiet) {
    const msgObj = transformMessage(msg);
    Raven.captureMessage(msgObj.message, {
      level,
      extra: {
        ...context,
        ...msgObj.context,
      },
    });
  }
}

class LoggerClient extends Logger {
  error(msg, err, { quiet } = {}) {
    if (!quiet) {
      if (typeof msg === 'string') {
        if (!err) {
          Raven.captureException(new Error(msg));
        } else {
          Raven.captureException(transformError(err), {
            extra: {
              msg,
            },
          });
        }
      } else if (msg) {
        const {
          msg: message,
          err,
          ...other,
        } = msg;

        let errObj;
        if (!err && typeof message === 'string') {
          errObj = new Error(message);
        } else {
          errObj = transformError(err);
        }

        Raven.captureException(errObj, {
          extra: {
            ...other,
            message,
          },
        });
      }
    }

    super.error(msg, err);
  }

  info(msg, ...args) {
    super.info(msg);
  }

  warn(msg, ...args) {
    captureMessage('warning', msg, ...args);
    super.warn(msg);
  }
}

const logger = new LoggerClient(log);

window.Raven = Raven;
window.logger = logger;

export {
  logger,
  Raven,
};
