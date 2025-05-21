export const up = (knex) => {
    return knex.schema
        .table('assets', (table) => {
            table.dropColumn('basename')
            table.string('hash').notNullable()
        })
}

export const down = (knex) => {
    return knex.schema
        .table('assets', (table) => {
            table.dropColumn('hash')
            table.string('basename').notNullable()
        })
}
