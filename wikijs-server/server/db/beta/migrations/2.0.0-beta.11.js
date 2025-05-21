export const up = (knex) => {
    return knex.schema
        .table('pageHistory', (table) => {
            table.string('action').defaultTo('updated')
            table.dropForeign('pageId')
        })
}

export const down = (knex) => {
    return knex.schema
        .table('pageHistory', (table) => {
            table.dropColumn('action')
            table.integer('pageId').unsigned().references('id').inTable('pages')
        })
}
