import { full as mdEmoji } from 'markdown-it-emoji'
import twemoji from 'twemoji'

// ------------------------------------
// Markdown - Emoji
// ------------------------------------

export default {
  init (md, conf) {
    md.use(mdEmoji)

    md.renderer.rules.emoji = (token, idx) => {
      return twemoji.parse(token[idx].content, {
        callback (icon, opts) {
          return `/_assets/svg/twemoji/${icon}.svg`
        }
      })
    }
  }
}
