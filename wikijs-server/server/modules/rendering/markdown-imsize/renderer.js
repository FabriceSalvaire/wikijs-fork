import mdImsize from 'markdown-it-imsize'

// ------------------------------------
// Markdown - Image Size
// ------------------------------------

export default {
  init (md, conf) {
    md.use(mdImsize)
  }
}
