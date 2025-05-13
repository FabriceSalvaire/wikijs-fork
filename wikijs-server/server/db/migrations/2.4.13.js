/* global WIKI */

export const up = knex => {
  return knex.schema
    .alterTable('pages', table => {
      if (WIKI.config.db.type === 'mysql') {
        table.json('extra')
      } else {
        table.json('extra').notNullable().defaultTo('{}')
      }
    })
    .alterTable('pageHistory', table => {
      if (WIKI.config.db.type === 'mysql') {
        table.json('extra')
      } else {
        table.json('extra').notNullable().defaultTo('{}')
      }
    })
    .alterTable('users', table => {
      table.string('dateFormat').notNullable().defaultTo('')
      table.string('appearance').notNullable().defaultTo('')
    })
}

export const down = knex => { }
