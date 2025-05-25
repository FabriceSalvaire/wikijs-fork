import { Model } from 'objection'
import lodash from 'lodash'

import { load_modules } from '../helpers/module.js'

/* global WIKI */

/**
 * SearchEngine model
 */
export default class SearchEngine extends Model {
    static get tableName() {
        return 'searchEngines'
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

    static async getSearchEngines() {
        return WIKI.models.searchEngines.query()
    }

    static async refreshSearchEnginesFromDisk() {
        let trx
        try {
            const dbSearchEngines = await WIKI.models.searchEngines.query()

            // -> Fetch definitions from disk
            WIKI.data.searchEngines =  await load_modules('search')

            // -> Insert new searchEngines
            let newSearchEngines = []
            for (let searchEngine of WIKI.data.searchEngines) {
                if (!lodash.some(dbSearchEngines, ['key', searchEngine.key])) {
                    newSearchEngines.push({
                        key: searchEngine.key,
                        isEnabled: false,
                        config: lodash.transform(searchEngine.props, (result, value, key) => {
                            lodash.set(result, key, value.default)
                            return result
                        }, {})
                    })
                } else {
                    const searchEngineConfig = lodash.get(lodash.find(dbSearchEngines, ['key', searchEngine.key]), 'config', {})
                    await WIKI.models.searchEngines.query().patch({
                        config: lodash.transform(searchEngine.props, (result, value, key) => {
                            if (!lodash.has(result, key))
                                lodash.set(result, key, value.default)
                            return result
                        }, searchEngineConfig)
                    }).where('key', searchEngine.key)
                }
            }
            if (newSearchEngines.length > 0) {
                trx = await WIKI.models.Objection.transaction.start(WIKI.models.knex)
                for (let searchEngine of newSearchEngines)
                    await WIKI.models.searchEngines.query(trx).insert(searchEngine)
                await trx.commit()
                WIKI.logger.info(`Loaded ${newSearchEngines.length} new search engines: [ OK ]`)
            } else {
                WIKI.logger.info(`No new search engines found: [ SKIPPED ]`)
            }
        } catch (err) {
            WIKI.logger.error(`Failed to scan or load new search engines: [ FAILED ]`)
            WIKI.logger.error(err)
            if (trx)
                trx.rollback()
        }
    }

    static async initEngine({ activate = false } = {}) {
        const searchEngine = await WIKI.models.searchEngines.query().findOne('isEnabled', true)
        WIKI.logger.info(`Init Search Engine ${searchEngine.key}`)
        if (searchEngine) {
            WIKI.data.searchEngine = (await import(`../modules/search/${searchEngine.key}/engine.js`)).default
            WIKI.data.searchEngine.key = searchEngine.key
            WIKI.data.searchEngine.config = searchEngine.config
            if (activate) {
                try {
                    await WIKI.data.searchEngine.activate()
                } catch (err) {
                    // -> Revert to basic engine
                    if (err instanceof WIKI.Error.SearchActivationFailed) {
                        await WIKI.models.searchEngines.query().patch({ isEnabled: false }).where(
                            'key',
                            searchEngine.key
                        )
                        await WIKI.models.searchEngines.query().patch({ isEnabled: true }).where('key', 'db')
                        await WIKI.models.searchEngines.initEngine()
                    }
                    throw err
                }
            }

            try {
                await WIKI.data.searchEngine.init()
            } catch (err) {
                WIKI.logger.warn(err)
            }
        }
    }
}
