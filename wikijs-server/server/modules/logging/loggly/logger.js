import winston from 'winston'

// ------------------------------------
// Loggly
// ------------------------------------

export default {
    async init(logger, conf) {
        await import('winston-loggly-bulk')
        logger.add(
            new winston.transports.Loggly({
                token: conf.token,
                subdomain: conf.subdomain,
                tags: ['wiki-js'],
                level: 'warn',
                json: true
            })
        )
    }
}
