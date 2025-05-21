import fs from 'fs-extra'
import { JSDOM } from 'jsdom'
import createDOMPurify from 'dompurify'

/* global WIKI */

export default async (svgPath) => {
    WIKI.logger.info(`Sanitizing SVG file upload...`)

    try {
        let svgContents = await fs.readFile(svgPath, 'utf8')

        const window = new JSDOM('').window
        const DOMPurify = createDOMPurify(window)

        svgContents = DOMPurify.sanitize(svgContents)

        await fs.writeFile(svgPath, svgContents)
        WIKI.logger.info(`Sanitized SVG file upload: [ COMPLETED ]`)
    } catch (err) {
        WIKI.logger.error(`Failed to sanitize SVG file upload: [ FAILED ]`)
        WIKI.logger.error(err.message)
        throw err
    }
}
