import { Model } from 'objection'
import fs from 'fs-extra'
import * as path from 'node:path'
import lodash from 'lodash'
import yaml from 'js-yaml'
import commonHelper from '../helpers/common.js'

/* global WIKI */

/**
 * Analytics model
 */
export default class Analytics extends Model {
    static get tableName() {
        return 'analytics'
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
                isEnabled: { type: 'boolean' }
            }
        }
    }

    static get jsonAttributes() {
        return ['config']
    }

    static async getProviders(isEnabled) {
        const providers = await WIKI.models.analytics.query().where(lodash.isBoolean(isEnabled) ? { isEnabled } : {})
        return lodash.sortBy(providers, ['key'])
    }

    static async refreshProvidersFromDisk() {
        let trx
        try {
            const dbProviders = await WIKI.models.analytics.query()

            // -> Fetch definitions from disk
            const analyticsDirs = await fs.readdir(path.join(WIKI.SERVERPATH, 'modules/analytics'))
            let diskProviders = []
            for (let dir of analyticsDirs) {
                const def = await fs.readFile(
                    path.join(WIKI.SERVERPATH, 'modules/analytics', dir, 'definition.yml'),
                    'utf8'
                )
                diskProviders.push(yaml.safeLoad(def))
            }
            WIKI.data.analytics = diskProviders.map((provider) => ({
                ...provider,
                props: commonHelper.parseModuleProps(provider.props)
            }))

            let newProviders = []
            for (let provider of WIKI.data.analytics) {
                if (!lodash.some(dbProviders, ['key', provider.key])) {
                    newProviders.push({
                        key: provider.key,
                        isEnabled: false,
                        config: lodash.transform(provider.props, (result, value, key) => {
                            lodash.set(result, key, value.default)
                            return result
                        }, {})
                    })
                } else {
                    const providerConfig = lodash.get(lodash.find(dbProviders, ['key', provider.key]), 'config', {})
                    await WIKI.models.analytics.query().patch({
                        config: lodash.transform(provider.props, (result, value, key) => {
                            if (!lodash.has(result, key))
                                lodash.set(result, key, value.default)
                            return result
                        }, providerConfig)
                    }).where('key', provider.key)
                }
            }
            if (newProviders.length > 0) {
                trx = await WIKI.models.Objection.transaction.start(WIKI.models.knex)
                for (let provider of newProviders)
                    await WIKI.models.analytics.query(trx).insert(provider)
                await trx.commit()
                WIKI.logger.info(`Loaded ${newProviders.length} new analytics providers: [ OK ]`)
            } else {
                WIKI.logger.info(`No new analytics providers found: [ SKIPPED ]`)
            }
        } catch (err) {
            WIKI.logger.error(`Failed to scan or load new analytics providers: [ FAILED ]`)
            WIKI.logger.error(err)
            if (trx)
                trx.rollback()
        }
    }

    static async getCode({ cache = false } = {}) {
        if (cache) {
            const analyticsCached = await WIKI.cache.get('analytics')
            if (analyticsCached)
                return analyticsCached
        }
        try {
            const analyticsCode = {
                head: '',
                bodyStart: '',
                bodyEnd: ''
            }
            const providers = await WIKI.models.analytics.getProviders(true)

            for (let provider of providers) {
                const def = await fs.readFile(
                    path.join(WIKI.SERVERPATH, 'modules/analytics', provider.key, 'code.yml'),
                    'utf8'
                )
                let code = yaml.safeLoad(def)
                code.head = lodash.defaultTo(code.head, '')
                code.bodyStart = lodash.defaultTo(code.bodyStart, '')
                code.bodyEnd = lodash.defaultTo(code.bodyEnd, '')

                lodash.forOwn(provider.config, (value, key) => {
                    code.head = lodash.replace(code.head, new RegExp(`{{${key}}}`, 'g'), value)
                    code.bodyStart = lodash.replace(code.bodyStart, `{{${key}}}`, value)
                    code.bodyEnd = lodash.replace(code.bodyEnd, `{{${key}}}`, value)
                })

                analyticsCode.head += code.head
                analyticsCode.bodyStart += code.bodyStart
                analyticsCode.bodyEnd += code.bodyEnd
            }

            await WIKI.cache.set('analytics', analyticsCode, 300)

            return analyticsCode
        } catch (err) {
            WIKI.logger.warn('Error while getting analytics code: ', err)
            return {
                head: '',
                bodyStart: '',
                bodyEnd: ''
            }
        }
    }
}
