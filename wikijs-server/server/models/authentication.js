import { Model } from 'objection'
import fs from 'fs-extra'
import * as path from 'node:path'
import lodash from 'lodash'
import yaml from 'js-yaml'
import commonHelper from '../helpers/common.js'

/* global WIKI */

/**
 * Authentication model
 */
export default class Authentication extends Model {
    static get tableName() {
        return 'authentication'
    }
    static get idColumn() {
        return 'key'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['key'],

            properties: {
                key: { type: 'string' },
                selfRegistration: { type: 'boolean' }
            }
        }
    }

    static get jsonAttributes() {
        return ['config', 'domainWhitelist', 'autoEnrollGroups']
    }

    static async getStrategy(key) {
        return WIKI.models.authentication.query().findOne({ key })
    }

    static async getStrategies() {
        const strategies = await WIKI.models.authentication.query().orderBy('order')
        return strategies.map((str) => ({
            ...str,
            domainWhitelist: lodash.get(str.domainWhitelist, 'v', []),
            autoEnrollGroups: lodash.get(str.autoEnrollGroups, 'v', [])
        }))
    }

    static async getStrategiesForLegacyClient() {
        const strategies = await WIKI.models.authentication.query().select('key', 'selfRegistration')
        let formStrategies = []
        let socialStrategies = []

        for (let stg of strategies) {
            const stgInfo = lodash.find(WIKI.data.authentication, ['key', stg.key]) || {}
            if (stgInfo.useForm) {
                formStrategies.push({
                    key: stg.key,
                    title: stgInfo.title
                })
            } else {
                socialStrategies.push({
                    ...stgInfo,
                    ...stg,
                    icon: await fs.readFile(path.join(WIKI.ROOTPATH, `assets/svg/auth-icon-${stg.key}.svg`), 'utf8')
                        .catch((err) => {
                            if (err.code === 'ENOENT')
                                return null
                            throw err
                        })
                })
            }
        }

        return {
            formStrategies,
            socialStrategies
        }
    }

    static async refreshStrategiesFromDisk() {
        try {
            const dbStrategies = await WIKI.models.authentication.query()

            // -> Fetch definitions from disk
            const authDirs = await fs.readdir(path.join(WIKI.SERVERPATH, 'modules/authentication'))
            WIKI.data.authentication = []
            for (let dir of authDirs) {
                const defRaw = await fs.readFile(
                    path.join(WIKI.SERVERPATH, 'modules/authentication', dir, 'definition.yml'),
                    'utf8'
                )
                const def = yaml.safeLoad(defRaw)
                WIKI.data.authentication.push({
                    ...def,
                    props: commonHelper.parseModuleProps(def.props)
                })
            }

            for (const strategy of dbStrategies) {
                let newProps = false
                const strategyDef = lodash.find(WIKI.data.authentication, ['key', strategy.strategyKey])
                if (!strategyDef) {
                    await WIKI.models.authentication.query().delete().where('key', strategy.key)
                    WIKI.logger.info(
                        `Authentication strategy ${strategy.strategyKey} was removed from disk: [ REMOVED ]`
                    )
                    continue
                }
                strategy.config = lodash.transform(strategyDef.props, (result, value, key) => {
                    if (!lodash.has(result, key)) {
                        lodash.set(result, key, value.default)
                        // we have some new properties added to an existing auth strategy to write to the database
                        newProps = true
                    }
                    return result
                }, strategy.config)

                // Fix pre-2.5 strategies displayName
                if (!strategy.displayName) {
                    await WIKI.models.authentication.query().patch({
                        displayName: strategyDef.title
                    }).where('key', strategy.key)
                }
                // write existing auth model to database with new properties and defaults
                if (newProps) {
                    await WIKI.models.authentication.query().patch({
                        config: strategy.config
                    }).where('key', strategy.key)
                }
            }

            WIKI.logger.info(`Loaded ${WIKI.data.authentication.length} authentication strategies: [ OK ]`)
        } catch (err) {
            WIKI.logger.error(`Failed to scan or load new authentication providers: [ FAILED ]`)
            WIKI.logger.error(err)
        }
    }
}
