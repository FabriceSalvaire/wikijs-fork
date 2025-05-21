/* global WIKI */

export const up = (knex) => {
    const dbCompat = {
        charset: (WIKI.config.db.type === `mysql` || WIKI.config.db.type === `mariadb`)
    }
    return knex.schema
        .createTable('assetData', (table) => {
            if (dbCompat.charset)
                table.charset('utf8mb4')
            table.integer('id').primary()
            table.binary('data').notNullable()
        })
}

export const down = (knex) => {
    return knex.schema
        .dropTableIfExists('assetData')
}
