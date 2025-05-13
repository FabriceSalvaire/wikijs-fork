import * as util from 'node:util'
import winston from 'winston'
import _ from 'lodash'

// ------------------------------------
// Bugsnag
// ------------------------------------

export default {
  async init (logger, conf) {
    let BugsnagLogger = winston.transports.BugsnagLogger = function (options) {
      this.name = 'bugsnagLogger'
      this.level = options.level || 'warn'
      this.bugsnag = await import('bugsnag')
      this.bugsnag.register(options.key)
    }
    util.inherits(BugsnagLogger, winston.Transport)

    BugsnagLogger.prototype.log = function (level, msg, meta, callback) {
      this.bugsnag.notify(new Error(msg), _.assignIn(meta, { severity: level }))
      callback(null, true)
    }

    logger.add(new BugsnagLogger({
      level: 'warn',
      key: conf.key
    }))
  }
}
