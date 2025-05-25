import { Model } from 'objection'
import lodash from 'lodash'

import { load_modules } from '../helpers/module.js'

/* global WIKI */

/**
 * Editor model
 */
export default class Editor extends Model {
    static get tableName() {
        return 'editors'
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

    static async getEditors() {
        return WIKI.models.editors.query()
    }

    static async refreshEditorsFromDisk() {
        let trx
        try {
            const dbEditors = await WIKI.models.editors.query()

            // -> Fetch definitions from disk
            WIKI.data.editors = await load_modules('editor')

            // -> Insert new editors
            let newEditors = []
            for (let editor of WIKI.data.editors) {
                if (!lodash.some(dbEditors, ['key', editor.key])) {
                    newEditors.push({
                        key: editor.key,
                        isEnabled: false,
                        config: lodash.transform(editor.props, (result, value, key) => {
                            lodash.set(result, key, value.default)
                            return result
                        }, {})
                    })
                } else {
                    const editorConfig = lodash.get(lodash.find(dbEditors, ['key', editor.key]), 'config', {})
                    await WIKI.models.editors.query().patch({
                        config: lodash.transform(editor.props, (result, value, key) => {
                            if (!lodash.has(result, key))
                                lodash.set(result, key, value.default)
                            return result
                        }, editorConfig)
                    }).where('key', editor.key)
                }
            }
            if (newEditors.length > 0) {
                trx = await WIKI.models.Objection.transaction.start(WIKI.models.knex)
                for (let editor of newEditors)
                    await WIKI.models.editors.query(trx).insert(editor)
                await trx.commit()
                WIKI.logger.info(`Loaded ${newEditors.length} new editors: [ OK ]`)
            } else {
                WIKI.logger.info(`No new editors found: [ SKIPPED ]`)
            }
        } catch (err) {
            WIKI.logger.error(`Failed to scan or load new editors: [ FAILED ]`)
            WIKI.logger.error(err)
            if (trx)
                trx.rollback()
        }
    }

    static async getDefaultEditor(contentType) {
        // TODO - hardcoded for now
        switch (contentType) {
            case 'markdown':
                return 'markdown'
            case 'html':
                return 'ckeditor'
            case 'asciidoc':
                return 'asciidoc'
            default:
                return 'code'
        }
    }
}
