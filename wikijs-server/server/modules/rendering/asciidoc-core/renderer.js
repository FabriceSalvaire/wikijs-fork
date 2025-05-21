import asciidoctor from 'asciidoctor' // Fixme!: ()
import cheerio from 'cheerio'

export default {
    async render() {
        const html = asciidoctor.convert(this.input, {
            standalone: false,
            safe: this.config.safeMode,
            attributes: {
                showtitle: true,
                icons: 'font'
            }
        })

        const $ = cheerio.load(html, {
            decodeEntities: true
        })

        $('pre.highlight > code.language-diagram').each((i, elm) => {
            const diagramContent = Buffer.from($(elm).html(), 'base64').toString()
            $(elm).parent().replaceWith(`<pre class="diagram">${diagramContent}</div>`)
        })

        return $.html()
    }
}
