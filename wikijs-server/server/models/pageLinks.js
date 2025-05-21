import { Model } from 'objection'

import Pages from './pages.js'

/**
 * Users model
 */
export default class PageLink extends Model {
    static get tableName() {
        return 'pageLinks'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['path', 'localeCode'],

            properties: {
                id: { type: 'integer' },
                path: { type: 'string' },
                localeCode: { type: 'string' }
            }
        }
    }

    static get relationMappings() {
        return {
            page: {
                relation: Model.BelongsToOneRelation,
                modelClass: Pages,
                join: {
                    from: 'pageLinks.pageId',
                    to: 'pages.id'
                }
            }
        }
    }
}
