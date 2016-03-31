/* eslint strict:0 no-console:0 */

const LOG = Symbol();
const TIMERS = Symbol();

class Logger {
  constructor(log) {
    log.level("debug"); //set debug as standard level
    this[TIMERS] = new Map();
    this[LOG] = log;
  }

  _log(method, msg) {
    if (_.isObject(msg)) {
      this[LOG][method](msg, msg.msg);
    } else {
      this[LOG][method](msg);
    }
  }

  debug(msg) {
    this._log('debug', msg);
  }

  info(msg) {
    this._log('info', msg);
  }

  warn(msg) {
    this._log('warn', msg);
  }

  error(msg, err) {
    if (_.isObject(msg)) {
      this[LOG].error(msg, msg.msg);
    } else {
      this[LOG].error({ msg, err }, msg);
    }
  }

  time(obj) {
    const key = _.isObject(obj) ? obj.msg : obj;
    this[TIMERS][key] = Date.now();
  }

  timeEnd(obj) {
    const key = _.isObject(obj) ? obj.msg : obj;
    const existing = this[TIMERS][key];
    if (existing) {
      const diff = Date.now() - this[TIMERS][key];
      this[TIMERS].delete(existing);
      const msg = `${key}: ${diff}ms`;
      if (_.isObject(obj)) {
        this.info(_.defaults({ msg }, obj));
      } else {
        this.info(msg);
      }
    }
  }

  //get bunyan handle
  get() {
    return this[LOG];
  }

  //set or get the current level
  level(val) {
    return this[LOG].level(val);
  }
};

export default Logger;

