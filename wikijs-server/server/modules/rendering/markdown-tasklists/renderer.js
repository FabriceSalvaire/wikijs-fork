import mdTaskLists from 'markdown-it-task-lists'

// ------------------------------------
// Markdown - Task Lists
// ------------------------------------

export default {
  init (md, conf) {
    md.use(mdTaskLists, { label: false, labelAfter: false })
  }
}
