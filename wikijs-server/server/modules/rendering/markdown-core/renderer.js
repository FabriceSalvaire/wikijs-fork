import md from 'markdown-it'
import mdAttrs from 'markdown-it-attrs'
import mdDecorate from 'markdown-it-decorate'
import _ from 'lodash'
import underline from './underline.js'

const quoteStyles = {
  Chinese: '””‘’',
  English: '“”‘’',
  French: ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'],
  German: '„“‚‘',
  Greek: '«»‘’',
  Japanese: '「」「」',
  Hungarian: '„”’’',
  Polish: '„”‚‘',
  Portuguese: '«»‘’',
  Russian: '«»„“',
  Spanish: '«»‘’',
  Swedish: '””’’'
}

export default {
  async render() {
    const mkdown = md({
      html: this.config.allowHTML,
      breaks: this.config.linebreaks,
      linkify: this.config.linkify,
      typographer: this.config.typographer,
      quotes: _.get(quoteStyles, this.config.quotes, quoteStyles.English),
      highlight(str, lang) {
        if (lang === 'diagram') {
          return `<pre class="diagram">` + Buffer.from(str, 'base64').toString() + `</pre>`
        } else {
          return `<pre><code class="language-${lang}">${_.escape(str)}</code></pre>`
        }
      }
    })

    if (this.config.underline) {
      mkdown.use(underline)
    }

    mkdown.use(mdAttrs, {
      allowedAttributes: ['id', 'class', 'target']
    })
    mkdown.use(mdDecorate)

    for (let child of this.children) {
      const renderer = (await import(`../${_.kebabCase(child.key)}/renderer.js`)).default
      await renderer.init(mkdown, child.config)
    }

    return mkdown.render(this.input)
  }
}
