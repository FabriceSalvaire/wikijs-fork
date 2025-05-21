export const up = (knex) => {
    return knex.schema
        .createTable('assetData', (table) => {
            table.integer('id').primary()
            table.binary('data').notNullable()
        })
}

export const down = (knex) => {
    return knex.schema
        .dropTableIfExists('assetData')
}
