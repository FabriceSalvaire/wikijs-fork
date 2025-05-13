/* global WIKI */

export const up = knex => {
  return knex.schema
    .alterTable('pageHistory', table => {
      switch (WIKI.config.db.type) {
        // No change needed for PostgreSQL and SQLite
        case 'mariadb':
        case 'mysql':
          table.specificType('content', 'LONGTEXT').alter()
          break
        case 'mssql':
          table.specificType('content', 'VARCHAR(max)').alter()
          break
      }
    })
}

export const down = knex => { }
