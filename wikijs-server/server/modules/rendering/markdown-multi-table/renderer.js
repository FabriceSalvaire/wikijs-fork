import multiTable from 'markdown-it-multimd-table'

export default {
    init(md, conf) {
        md.use(multiTable, {
            multiline: conf.multilineEnabled,
            rowspan: conf.rowspanEnabled,
            headerless: conf.headerlessEnabled
        })
    }
}
