import { Model } from 'objection'
import lodash from 'lodash'
import { DepGraph } from 'dependency-graph'

import { load_modules } from '../helpers/module.js'

/* global WIKI */

/**
 * Renderer model
 */
export default class Renderer extends Model {
    static get tableName() {
        return 'renderers'
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

    static async getRenderers() {
        return WIKI.models.renderers.query()
    }

    static async fetchDefinitions() {
        WIKI.data.renderers =  await load_modules('rendering')
    }

    static async refreshRenderersFromDisk() {
        let trx
        try {
            const dbRenderers = await WIKI.models.renderers.query()

            // -> Fetch definitions from disk
            await WIKI.models.renderers.fetchDefinitions()

            // -> Insert new Renderers
            let newRenderers = []
            for (let renderer of WIKI.data.renderers) {
                if (!lodash.some(dbRenderers, ['key', renderer.key])) {
                    newRenderers.push({
                        key: renderer.key,
                        isEnabled: lodash.get(renderer, 'enabledDefault', true),
                        config: lodash.transform(renderer.props, (result, value, key) => {
                            lodash.set(result, key, value.default)
                            return result
                        }, {})
                    })
                } else {
                    const rendererConfig = lodash.get(lodash.find(dbRenderers, ['key', renderer.key]), 'config', {})
                    await WIKI.models.renderers.query().patch({
                        config: lodash.transform(renderer.props, (result, value, key) => {
                            if (!lodash.has(result, key))
                                lodash.set(result, key, value.default)
                            return result
                        }, rendererConfig)
                    }).where('key', renderer.key)
                }
            }
            if (newRenderers.length > 0) {
                trx = await WIKI.models.Objection.transaction.start(WIKI.models.knex)
                for (let renderer of newRenderers)
                    await WIKI.models.renderers.query(trx).insert(renderer)
                await trx.commit()
                WIKI.logger.info(`Loaded ${newRenderers.length} new renderers: [ OK ]`)
            } else {
                WIKI.logger.info(`No new renderers found: [ SKIPPED ]`)
            }

            // -> Delete removed Renderers
            for (const renderer of dbRenderers) {
                if (!lodash.some(WIKI.data.renderers, ['key', renderer.key])) {
                    await WIKI.models.renderers.query().where('key', renderer.key).del()
                    WIKI.logger.info(
                        `Removed renderer ${renderer.key} because it is no longer present in the modules folder: [ OK ]`
                    )
                }
            }
        } catch (err) {
            WIKI.logger.error(`Failed to scan or load new renderers: [ FAILED ]`)
            WIKI.logger.error(err)
            if (trx)
                trx.rollback()
        }
    }

    static async getRenderingPipeline(contentType) {
        const renderersDb = await WIKI.models.renderers.query().where('isEnabled', true)
        if (renderersDb && renderersDb.length > 0) {
            const renderers = renderersDb.map((rdr) => {
                const renderer = lodash.find(WIKI.data.renderers, ['key', rdr.key])
                return {
                    ...renderer,
                    config: rdr.config
                }
            })

            // Build tree
            const rawCores = lodash.filter(renderers, (renderer) => !lodash.has(renderer, 'dependsOn')).map((core) => {
                core.children = lodash.filter(renderers, ['dependsOn', core.key])
                return core
            })

            // Build dependency graph
            const graph = new DepGraph({ circular: true })
            rawCores.map((core) => {
                graph.addNode(core.key)
            })
            rawCores.map((core) => {
                rawCores.map((coreTarget) => {
                    if (core.key !== coreTarget.key) {
                        if (core.output === coreTarget.input)
                            graph.addDependency(core.key, coreTarget.key)
                    }
                })
            })

            // Filter unused cores
            let activeCoreKeys = lodash.filter(rawCores, ['input', contentType]).map((core) => core.key)
            lodash.clone(activeCoreKeys).map((coreKey) => {
                activeCoreKeys = lodash.union(activeCoreKeys, graph.dependenciesOf(coreKey))
            })
            const activeCores = lodash.filter(rawCores, (core) => lodash.includes(activeCoreKeys, core.key))

            // Rebuild dependency graph with active cores
            const graphActive = new DepGraph({ circular: true })
            activeCores.map((core) => {
                graphActive.addNode(core.key)
            })
            activeCores.map((core) => {
                activeCores.map((coreTarget) => {
                    if (core.key !== coreTarget.key) {
                        if (core.output === coreTarget.input)
                            graphActive.addDependency(core.key, coreTarget.key)
                    }
                })
            })

            // Reorder cores in reverse dependency order
            let orderedCores = []
            lodash.reverse(graphActive.overallOrder()).map((coreKey) => {
                orderedCores.push(lodash.find(rawCores, ['key', coreKey]))
            })

            return orderedCores
        } else {
            WIKI.logger.error(`Rendering pipeline is empty!`)
            return false
        }
    }
}
