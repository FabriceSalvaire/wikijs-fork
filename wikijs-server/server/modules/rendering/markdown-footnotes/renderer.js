import mdFootnote from 'markdown-it-footnote'

// ------------------------------------
// Markdown - Footnotes
// ------------------------------------

export default {
    init(md, conf) {
        md.use(mdFootnote)
    }
}
