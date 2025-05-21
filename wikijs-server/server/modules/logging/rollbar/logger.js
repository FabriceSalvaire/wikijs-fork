import * as util from 'node:util'
import winston from 'winston'
import _ from 'lodash'

// ------------------------------------
// Rollbar
// ------------------------------------

export default {
    async init(logger, conf) {
        let RollbarLogger = winston.transports.RollbarLogger = function (options) {
            this.name = 'rollbarLogger'
            this.level = options.level || 'warn'
            this.rollbar = await import('rollbar')
            this.rollbar.init(options.key)
        }
        util.inherits(RollbarLogger, winston.Transport)

        RollbarLogger.prototype.log = function (level, msg, meta, callback) {
            this.rollbar.handleErrorWithPayloadData(new Error(msg), _.assignIn(meta, { level }))
            callback(null, true)
        }

        logger.add(
            new RollbarLogger({
                level: 'warn',
                key: conf.key
            })
        )
    }
}
