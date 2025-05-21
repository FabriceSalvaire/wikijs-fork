export const up = (knex) => {
    return knex.schema
        .table('locales', (table) => {
            table.integer('availability').notNullable().defaultTo(0)
        })
}

export const down = (knex) => {
    return knex.schema
        .table('locales', (table) => {
            table.dropColumn('availability')
        })
}
