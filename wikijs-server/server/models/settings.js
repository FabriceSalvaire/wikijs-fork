import { Model } from 'objection'
import lodash from 'lodash'

/* global WIKI */

/**
 * Settings model
 */
export default class Setting extends Model {
    static get tableName() {
        return 'settings'
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
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
            }
        }
    }

    static get jsonAttributes() {
        return ['value']
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString()
    }
    $beforeInsert() {
        this.updatedAt = new Date().toISOString()
    }

    static async getConfig() {
        const settings = await WIKI.models.settings.query()
        if (settings.length > 0) {
            return lodash.reduce(settings, (res, val, key) => {
                lodash.set(res, val.key, (lodash.has(val.value, 'v')) ? val.value.v : val.value)
                return res
            }, {})
        } else {
            return false
        }
    }
}
