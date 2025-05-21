import lodash from 'lodash'
import graphHelper from '../../helpers/graph.js'

/* global WIKI */

export default {
    Query: {
        async analytics() {
            return {}
        }
    },
    Mutation: {
        async analytics() {
            return {}
        }
    },
    AnalyticsQuery: {
        async providers(obj, args, context, info) {
            let providers = await WIKI.models.analytics.getProviders(args.isEnabled)
            providers = providers.map((stg) => {
                const providerInfo = lodash.find(WIKI.data.analytics, ['key', stg.key]) || {}
                return {
                    ...providerInfo,
                    ...stg,
                    config: lodash.sortBy(
                        lodash.transform(stg.config, (res, value, key) => {
                            const configData = lodash.get(providerInfo.props, key, {})
                            res.push({
                                key,
                                value: JSON.stringify({
                                    ...configData,
                                    value
                                })
                            })
                        }, []),
                        'key'
                    )
                }
            })
            return providers
        }
    },
    AnalyticsMutation: {
        async updateProviders(obj, args, context) {
            try {
                for (let str of args.providers) {
                    await WIKI.models.analytics.query().patch({
                        isEnabled: str.isEnabled,
                        config: lodash.reduce(str.config, (result, value, key) => {
                            lodash.set(result, `${value.key}`, lodash.get(JSON.parse(value.value), 'v', null))
                            return result
                        }, {})
                    }).where('key', str.key)
                    await WIKI.cache.del('analytics')
                }
                return {
                    responseResult: graphHelper.generateSuccess('Providers updated successfully')
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        }
    }
}
