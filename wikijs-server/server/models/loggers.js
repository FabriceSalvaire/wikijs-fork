import { Model } from 'objection'
import lodash from 'lodash'

import { load_modules } from '../helpers/module.js'

/* global WIKI */

/**
 * Logger model
 */
export default class Logger extends Model {
    static get tableName() {
        return 'loggers'
    }
    static get idColumn() {
        return 'key'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['key', 'isEnabled'],

            properties: {
                key: { type: 'string' },
                isEnabled: { type: 'boolean' },
                level: { type: 'string' }
            }
        }
    }

    static get jsonAttributes() {
        return ['config']
    }

    static async getLoggers() {
        return WIKI.models.loggers.query()
    }

    static async refreshLoggersFromDisk() {
        let trx
        try {
            const dbLoggers = await WIKI.models.loggers.query()

            // -> Fetch definitions from disk
            WIKI.data.loggers = await load_modules('logging')

            // -> Insert new loggers
            let newLoggers = []
            for (let logger of WIKI.data.loggers) {
                if (!lodash.some(dbLoggers, ['key', logger.key])) {
                    newLoggers.push({
                        key: logger.key,
                        isEnabled: (logger.key === 'console'),
                        level: logger.defaultLevel,
                        config: lodash.transform(logger.props, (result, value, key) => {
                            lodash.set(result, key, value.default)
                            return result
                        }, {})
                    })
                } else {
                    const loggerConfig = lodash.get(lodash.find(dbLoggers, ['key', logger.key]), 'config', {})
                    await WIKI.models.loggers.query().patch({
                        config: lodash.transform(logger.props, (result, value, key) => {
                            if (!lodash.has(result, key))
                                lodash.set(result, key, value.default)
                            return result
                        }, loggerConfig)
                    }).where('key', logger.key)
                }
            }
            if (newLoggers.length > 0) {
                trx = await WIKI.models.Objection.transaction.start(WIKI.models.knex)
                for (let logger of newLoggers)
                    await WIKI.models.loggers.query(trx).insert(logger)
                await trx.commit()
                WIKI.logger.info(`Loaded ${newLoggers.length} new loggers: [ OK ]`)
            } else {
                WIKI.logger.info(`No new loggers found: [ SKIPPED ]`)
            }
        } catch (err) {
            WIKI.logger.error(`Failed to scan or load new loggers: [ FAILED ]`)
            WIKI.logger.error('@refreshLoggersFromDisk')
            WIKI.logger.error(err)
            if (trx)
                trx.rollback()
        }
    }

    static async pageEvent({ event, page }) {
        const loggers = await WIKI.models.storage.query().where('isEnabled', true)
        if (loggers && loggers.length > 0) {
            lodash.forEach(loggers, (logger) => {
                WIKI.queue.job.syncStorage.add({
                    event,
                    logger,
                    page
                }, {
                    removeOnComplete: true
                })
            })
        }
    }
}
