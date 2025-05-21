import { Model } from 'objection'
import lodash from 'lodash'

import Pages from './pages.js'

/* global WIKI */

/**
 * Tags model
 */
export default class Tag extends Model {
    static get tableName() {
        return 'tags'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['tag'],

            properties: {
                id: { type: 'integer' },
                tag: { type: 'string' },
                title: { type: 'string' },

                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
            }
        }
    }

    static get relationMappings() {
        return {
            pages: {
                relation: Model.ManyToManyRelation,
                modelClass: Pages,
                join: {
                    from: 'tags.id',
                    through: {
                        from: 'pageTags.tagId',
                        to: 'pageTags.pageId'
                    },
                    to: 'pages.id'
                }
            }
        }
    }

    $beforeUpdate() {
        this.updatedAt = new Date().toISOString()
    }
    $beforeInsert() {
        this.createdAt = new Date().toISOString()
        this.updatedAt = new Date().toISOString()
    }

    // Update tags for a page
    static async associateTags({ tags, page }) {
        // Format tags
        tags = lodash.uniq(tags.map((t) => lodash.trim(t).toLowerCase()))

        // Fetch tags from db
        // Fixme: could be large
        let existingTags = await WIKI.models.tags.query().column('id', 'tag')

        // Create missing tags
        // Fixme: unreadable, efficient ???
        //  https://lodash.com/docs/4.17.15#differenceBy
        //  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
        //  newTags = tags - existingTags
        const newTags = lodash.filter(tags, (t) => !lodash.some(existingTags, ['tag', t])).map((t) => ({
            tag: t,
            title: t
        }))
        // Fixme: > 0 is useless
        if (newTags.length > 0) {
            if (WIKI.config.db.type === 'postgres') {
                const createdTags = await WIKI.models.tags.query().insert(newTags)
                existingTags = lodash.concat(existingTags, createdTags)
            } else {
                for (const newTag of newTags) {
                    const createdTag = await WIKI.models.tags.query().insert(newTag)
                    existingTags.push(createdTag)
                }
            }
        }

        // Compute intersection of existingTags with tags
        const targetTags = lodash.filter(existingTags, (t) => lodash.includes(tags, t.tag))

        // Fetch current page tags
        const currentTags = await page.$relatedQuery('tags')

        // Tags to relate
        const tagsToRelate = lodash.differenceBy(targetTags, currentTags, 'id')
        if (tagsToRelate.length > 0) {
            if (WIKI.config.db.type === 'postgres')
                await page.$relatedQuery('tags').relate(tagsToRelate)
            else {
                for (const tag of tagsToRelate)
                    await page.$relatedQuery('tags').relate(tag)
            }
        }

        // Tags to unrelate
        const tagsToUnrelate = lodash.differenceBy(currentTags, targetTags, 'id')
        if (tagsToUnrelate.length > 0)
            await page.$relatedQuery('tags').unrelate().whereIn('tags.id', lodash.map(tagsToUnrelate, 'id'))

        page.tags = targetTags
    }
}
