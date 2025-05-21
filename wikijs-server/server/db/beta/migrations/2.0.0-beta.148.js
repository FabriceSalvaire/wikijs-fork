/* global WIKI */

export const up = (knex) => {
    const dbCompat = {
        blobLength: (WIKI.config.db.type === `mysql` || WIKI.config.db.type === `mariadb`)
    }
    return knex.schema
        .table('assetData', (table) => {
            if (dbCompat.blobLength)
                table.dropColumn('data')
        })
        .table('assetData', (table) => {
            if (dbCompat.blobLength)
                table.specificType('data', 'LONGBLOB').notNullable()
        })
}

export const down = (knex) => {
    return knex.schema
        .table('assetData', (table) => {})
}
