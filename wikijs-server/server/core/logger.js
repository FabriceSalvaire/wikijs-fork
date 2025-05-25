import winston from 'winston'
import chalk from 'chalk'

/**************************************************************************************************/

// Note: Due to performance issue... Winston cannot print the location
//   Code's file name, function, line number from where logging was done #200
//     https://github.com/winstonjs/winston/issues/200
//   Log caller function name and line number #890
//     https://github.com/winstonjs/winston/issues/890

// Node error
//   https://nodejs.org/api/errors.html
//   .stack

// import * as util from 'node:util'
// console.log(util.inspect(err, {showHidden: false, depth: null, colors: true}))

/**************************************************************************************************/

/* global WIKI */

// loggers: {}

/**************************************************************************************************/

export function init(uid) {
    const loggerFormats = [
        winston.format.label({ label: uid }),
        // ???
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.printf((info) => {
            if (typeof info.message === 'object')
                info.message = JSON.stringify(info.message, null, 3)
            if ('stack' in info) {
                info.message += '\nStack'
                info.message += '\n' + info.stack
            }
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

    // lodash.forOwn(lodash.omitBy(WIKI.config.logging.loggers, s => s.enabled === false), (loggerConfig, loggerKey) => {
    //   let loggerModule = require(`../modules/logging/${loggerKey}`)w
    //   loggerModule.init(logger, loggerConfig)
    //   this.loggers[logger.key] = loggerModule
    // })

    logger.log_stack = log_stack
    logger.error_stack = (message, error) => log_stack('error', message, error)
    logger.warn_stack = (message, error) => log_stack('warning', message, error)

    return logger
}

/**************************************************************************************************/

export function log_stack(level, message, error) {
    const logger = WIKI.logger[level]
    let stack = error.stack
    stack = stack.replaceAll(process.cwd() + '/', '')
    stack = stack.replace(new RegExp('(\\w+Error): (.+)', 'g'), chalk.red('$1') + ': ' + chalk.blue('$2'))
    stack = stack.replaceAll(new RegExp('node_modules/.+/node_modules/([^/]+)/', 'g'), chalk.cyan('$1') + '/')
    stack = stack.replaceAll(new RegExp('file://server/(.+\\.js)', 'g'), chalk.green('$1'))
    stack = stack.replaceAll(new RegExp(':(\\d+):', 'g'), ':' + chalk.magenta('$1') + ':')
    stack = stack.replaceAll(new RegExp('at ([^\\.]+)\\.(.+) \\(', 'g'), 'at ' + chalk.yellow('$1') + '.' + chalk.blue('$2') + ' (')
    logger(chalk.blue(message) + '\n' + stack)
}
