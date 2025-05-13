import mdAbbr from 'markdown-it-abbr'

// ------------------------------------
// Markdown - Abbreviations
// ------------------------------------

export default {
  init (md, conf) {
    md.use(mdAbbr)
  }
}
