import mdExpandTabs from 'markdown-it-expand-tabs'
import _ from 'lodash'

// ------------------------------------
// Markdown - Expand Tabs
// ------------------------------------

export default {
    init(md, conf) {
        md.use(mdExpandTabs, {
            tabWidth: _.toInteger(conf.tabWidth || 4)
        })
    }
}
