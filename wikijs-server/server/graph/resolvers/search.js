import lodash from 'lodash'
import graphHelper from '../../helpers/graph.js'

/* global WIKI */

export default {
    Query: {
        async search() {
            return {}
        }
    },
    Mutation: {
        async search() {
            return {}
        }
    },
    SearchQuery: {
        async searchEngines(obj, args, context, info) {
            let searchEngines = await WIKI.models.searchEngines.getSearchEngines()
            searchEngines = searchEngines.map((searchEngine) => {
                const searchEngineInfo = lodash.find(WIKI.data.searchEngines, ['key', searchEngine.key]) || {}
                return {
                    ...searchEngineInfo,
                    ...searchEngine,
                    config: lodash.sortBy(
                        lodash.transform(searchEngine.config, (res, value, key) => {
                            const configData = lodash.get(searchEngineInfo.props, key, false)
                            if (configData) {
                                res.push({
                                    key,
                                    value: JSON.stringify({
                                        ...configData,
                                        value
                                    })
                                })
                            }
                        }, []),
                        'key'
                    )
                }
            })
            // if (args.filter) { searchEngines = graphHelper.filter(searchEngines, args.filter) }
            if (args.orderBy)
                searchEngines = lodash.sortBy(searchEngines, [args.orderBy])
            return searchEngines
        }
    },
    SearchMutation: {
        async updateSearchEngines(obj, args, context) {
            try {
                let newActiveEngine = ''
                for (let searchEngine of args.engines) {
                    if (searchEngine.isEnabled)
                        newActiveEngine = searchEngine.key
                    await WIKI.models.searchEngines.query().patch({
                        isEnabled: searchEngine.isEnabled,
                        config: lodash.reduce(searchEngine.config, (result, value, key) => {
                            lodash.set(result, `${value.key}`, lodash.get(JSON.parse(value.value), 'v', null))
                            return result
                        }, {})
                    }).where('key', searchEngine.key)
                }
                if (newActiveEngine !== WIKI.data.searchEngine.key) {
                    try {
                        await WIKI.data.searchEngine.deactivate()
                    } catch (err) {
                        WIKI.logger.warn('Failed to deactivate previous search engine:', err)
                    }
                }
                await WIKI.models.searchEngines.initEngine({ activate: true })
                return {
                    responseResult: graphHelper.generateSuccess('Search Engines updated successfully')
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        },
        async rebuildIndex(obj, args, context) {
            try {
                await WIKI.data.searchEngine.rebuild()
                return {
                    responseResult: graphHelper.generateSuccess('Index rebuilt successfully')
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        }
    }
}
