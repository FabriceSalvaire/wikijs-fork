import lodash from 'lodash'
import cheerio from 'cheerio'

/* global WIKI */

export default async (pageId) => {
    WIKI.logger.info(`Rendering page ID ${pageId}...`)

    try {
        WIKI.models = await (await import('../core/db.js')).default.init()
        await WIKI.configSvc.loadFromDb()
        await WIKI.configSvc.applyFlags()

        const page = await WIKI.models.pages.getPageFromDb(pageId)
        if (!page)
            throw new Error('Invalid Page Id')

        await WIKI.models.renderers.fetchDefinitions()
        const pipeline = await WIKI.models.renderers.getRenderingPipeline(page.contentType)

        let output = page.content

        if (lodash.isEmpty(page.content)) {
            await WIKI.models.knex.destroy()
            WIKI.logger.warn(`Failed to render page ID ${pageId} because content was empty: [ FAILED ]`)
        }

        for (let core of pipeline) {
            const renderer = (await import(`../modules/rendering/${lodash.kebabCase(core.key)}/renderer.js`)).default
            output = await renderer.render.call({
                config: core.config,
                children: core.children,
                page: page,
                input: output
            })
        }

        // Parse TOC
        const $ = cheerio.load(output)
        let isStrict = $('h1').length > 0 // <- Allows for documents using H2 as top level
        let toc = { root: [] }

        $('h1,h2,h3,h4,h5,h6').each((idx, el) => {
            const depth = lodash.toSafeInteger(el.name.substring(1)) - (isStrict ? 1 : 2)
            let leafPathError = false

            const leafPath = lodash.reduce(lodash.times(depth), (curPath, curIdx) => {
                if (lodash.has(toc, curPath)) {
                    const lastLeafIdx = lodash.get(toc, curPath).length - 1
                    if (lastLeafIdx >= 0)
                        curPath = `${curPath}[${lastLeafIdx}].children`
                    else
                        leafPathError = true
                }
                return curPath
            }, 'root')

            if (leafPathError)
                return

            const leafSlug = $('.toc-anchor', el).first().attr('href')
            $('.toc-anchor', el).remove()

            lodash.get(toc, leafPath).push({
                title: lodash.trim($(el).text()),
                anchor: leafSlug,
                children: []
            })
        })

        // Save to DB
        await WIKI.models.pages.query()
            .patch({
                render: output,
                toc: JSON.stringify(toc.root)
            })
            .where('id', pageId)

        // Save to cache
        await WIKI.models.pages.savePageToCache({
            ...page,
            render: output,
            toc: JSON.stringify(toc.root)
        })

        await WIKI.models.knex.destroy()

        WIKI.logger.info(`Rendering page ID ${pageId}: [ COMPLETED ]`)
    } catch (err) {
        WIKI.logger.error(`Rendering page ID ${pageId}: [ FAILED ]`)
        WIKI.logger.error(err.message)
        // exit process with error code
        throw err
    }
}
