import winston from 'winston'

// Note: Due to performance issue... Winston cannot print the location
//   Code's file name, function, line number from where logging was done #200
//     https://github.com/winstonjs/winston/issues/200
//   Log caller function name and line number #890
//     https://github.com/winstonjs/winston/issues/890

/* global WIKI */

export default {
    loggers: {},

    init(uid) {
        const loggerFormats = [
            winston.format.label({ label: uid }),
            // ???
            winston.format.errors({ stack: true }),
            winston.format.timestamp(),
            winston.format.printf((info) => {
                if (typeof info.message === 'object')
                    info.message = JSON.stringify(info.message, null, 3)
                if ('stack' in info)
                    info.message += '\n' + info.stack
                return info.message
            })
        ]

        if (WIKI.config.logFormat === 'json')
            loggerFormats.push(winston.format.json())
        else {
            loggerFormats.push(winston.format.colorize())
            loggerFormats.push(
                winston.format.printf((info) => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`)
            )
        }

        const logger = winston.createLogger({
            level: WIKI.config.logLevel,
            format: winston.format.combine(...loggerFormats)
        })

        // Init Console (default)
        logger.add(
            new winston.transports.Console({
                level: WIKI.config.logLevel,
                prettyPrint: true,
                colorize: true,
                silent: false,
                timestamp: true
            })
        )

        // _.forOwn(_.omitBy(WIKI.config.logging.loggers, s => s.enabled === false), (loggerConfig, loggerKey) => {
        //   let loggerModule = require(`../modules/logging/${loggerKey}`)
        //   loggerModule.init(logger, loggerConfig)
        //   this.loggers[logger.key] = loggerModule
        // })

        return logger
    }
}
