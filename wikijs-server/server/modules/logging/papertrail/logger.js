import winston from 'winston'

// ------------------------------------
// Papertrail
// ------------------------------------

export default {
  async init (logger, conf) {
    // eslint-disable-next-line no-unused-expressions
    (await import('winston-papertrail')).Papertrail // NOSONAR
    logger.add(new winston.transports.Papertrail({
      host: conf.host,
      port: conf.port,
      level: 'warn',
      program: 'wiki.js'
    }))
  }
}
