import lodash from 'lodash'
import graphHelper from '../../helpers/graph.js'

/* global WIKI */

export default {
    Query: {
        async rendering() {
            return {}
        }
    },
    Mutation: {
        async rendering() {
            return {}
        }
    },
    RenderingQuery: {
        async renderers(obj, args, context, info) {
            let renderers = await WIKI.models.renderers.getRenderers()
            renderers = renderers.map((rdr) => {
                const rendererInfo = lodash.find(WIKI.data.renderers, ['key', rdr.key]) || {}
                return {
                    ...rendererInfo,
                    ...rdr,
                    config: lodash.sortBy(
                        lodash.transform(rdr.config, (res, value, key) => {
                            const configData = lodash.get(rendererInfo.props, key, false)
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
            // if (args.filter) { renderers = graphHelper.filter(renderers, args.filter) }
            if (args.orderBy)
                renderers = lodash.sortBy(renderers, [args.orderBy])
            return renderers
        }
    },
    RenderingMutation: {
        async updateRenderers(obj, args, context) {
            try {
                for (let rdr of args.renderers) {
                    await WIKI.models.renderers.query().patch({
                        isEnabled: rdr.isEnabled,
                        config: lodash.reduce(rdr.config, (result, value, key) => {
                            lodash.set(result, `${value.key}`, lodash.get(JSON.parse(value.value), 'v', null))
                            return result
                        }, {})
                    }).where('key', rdr.key)
                }
                return {
                    responseResult: graphHelper.generateSuccess('Renderers updated successfully')
                }
            } catch (err) {
                return graphHelper.generateError(err)
            }
        }
    }
}
