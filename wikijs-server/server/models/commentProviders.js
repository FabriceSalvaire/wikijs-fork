import { Model } from 'objection'
import fs from 'fs-extra'
import * as path from 'node:path'
import lodash from 'lodash'
import yaml from 'js-yaml'

import { load_modules } from '../helpers/module.js'

/* global WIKI */

/**
 * CommentProvider model
 */
export default class CommentProvider extends Model {
    static get tableName() {
        return 'commentProviders'
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

    static async getProvider(key) {
        return WIKI.models.commentProviders.query().findOne({ key })
    }

    static async getProviders(isEnabled) {
        const providers = await WIKI.models.commentProviders.query().where(lodash.isBoolean(isEnabled) ? { isEnabled } : {})
        return lodash.sortBy(providers, ['key'])
    }

    static async refreshProvidersFromDisk() {
        let trx
        try {
            const dbProviders = await WIKI.models.commentProviders.query()

            // -> Fetch definitions from disk
            WIKI.data.commentProviders = await load_modules('comments')

            let newProviders = []
            for (let provider of WIKI.data.commentProviders) {
                if (!lodash.some(dbProviders, ['key', provider.key])) {
                    newProviders.push({
                        key: provider.key,
                        isEnabled: provider.key === 'default',
                        config: lodash.transform(provider.props, (result, value, key) => {
                            lodash.set(result, key, value.default)
                            return result
                        }, {})
                    })
                } else {
                    const providerConfig = lodash.get(lodash.find(dbProviders, ['key', provider.key]), 'config', {})
                    await WIKI.models.commentProviders.query().patch({
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
                    await WIKI.models.commentProviders.query(trx).insert(provider)
                await trx.commit()
                WIKI.logger.info(`Loaded ${newProviders.length} new comment providers: [ OK ]`)
            } else {
                WIKI.logger.info(`No new comment providers found: [ SKIPPED ]`)
            }
        } catch (err) {
            WIKI.logger.error(`Failed to scan or load new comment providers: [ FAILED ]`)
            WIKI.logger.error(err)
            if (trx)
                trx.rollback()
        }
    }

    static async initProvider() {
        // WIKI.logger.info("initProvider")
        const commentProvider = await WIKI.models.commentProviders.query().findOne('isEnabled', true)
        WIKI.logger.info(`Init Comment Provider ${commentProvider.key}`)
        if (commentProvider) {
            WIKI.data.commentProvider = {
                ...lodash.find(WIKI.data.commentProviders, ['key', commentProvider.key]),
                head: '',
                bodyStart: '',
                bodyEnd: '',
                main: '<comments></comments>'
            }

            if (WIKI.data.commentProvider.codeTemplate) {
                const def = await fs.readFile(
                    path.join(WIKI.SERVERPATH, 'modules/comments', commentProvider.key, 'code.yml'),
                    'utf8'
                )
                let code = yaml.safeLoad(def)
                code.head = lodash.defaultTo(code.head, '')
                code.body = lodash.defaultTo(code.body, '')
                code.main = lodash.defaultTo(code.main, '')

                lodash.forOwn(commentProvider.config, (value, key) => {
                    code.head = lodash.replace(code.head, new RegExp(`{{${key}}}`, 'g'), value)
                    code.body = lodash.replace(code.body, new RegExp(`{{${key}}}`, 'g'), value)
                    code.main = lodash.replace(code.main, new RegExp(`{{${key}}}`, 'g'), value)
                })

                WIKI.data.commentProvider.head = code.head
                WIKI.data.commentProvider.body = code.body
                WIKI.data.commentProvider.main = code.main
            } else {
                WIKI.data.commentProvider = {
                    ...WIKI.data.commentProvider,
                    ...(await import(`../modules/comments/${commentProvider.key}/comment.js`)).default,
                    config: commentProvider.config
                }
                await WIKI.data.commentProvider.init()
            }
            WIKI.data.commentProvider.config = commentProvider.config
        }
    }
}
