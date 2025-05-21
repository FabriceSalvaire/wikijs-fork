import mdExpandTabs from 'markdown-it-expand-tabs'
import lodash from 'lodash'

// ------------------------------------
// Markdown - Expand Tabs
// ------------------------------------

export default {
    init(md, conf) {
        md.use(mdExpandTabs, {
            tabWidth: lodash.toInteger(conf.tabWidth || 4)
        })
    }
}
