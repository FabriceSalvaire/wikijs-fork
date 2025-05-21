import * as util from 'node:util'
import winston from 'winston'

// ------------------------------------
// Sentry
// ------------------------------------

export default {
    async init(logger, conf) {
        let SentryLogger = winston.transports.SentryLogger = function (options) {
            this.name = 'sentryLogger'
            this.level = options.level || 'warn'
            this.raven = await import('raven')
            this.raven.config(options.key).install()
        }
        util.inherits(SentryLogger, winston.Transport)

        SentryLogger.prototype.log = function (level, msg, meta, callback) {
            level = (level === 'warn') ? 'warning' : level
            this.raven.captureMessage(msg, { level, extra: meta })
            callback(null, true)
        }

        logger.add(
            new SentryLogger({
                level: 'warn',
                key: conf.key
            })
        )
    }
}
