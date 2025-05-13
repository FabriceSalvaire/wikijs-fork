import mdSub from 'markdown-it-sub'
import mdSup from 'markdown-it-sup'

// ------------------------------------
// Markdown - Subscript / Superscript
// ------------------------------------

export default {
  init (md, conf) {
    if (conf.subEnabled) {
      md.use(mdSub)
    }
    if (conf.supEnabled) {
      md.use(mdSup)
    }
  }
}
