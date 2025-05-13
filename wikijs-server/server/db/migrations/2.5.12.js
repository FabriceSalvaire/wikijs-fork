export const up = async knex => {
  await knex.schema
    .alterTable('groups', table => {
      table.string('redirectOnLogin').notNullable().defaultTo('/')
    })
}

export const down = knex => { }
