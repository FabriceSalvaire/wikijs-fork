export const up = knex => {
  return knex.schema
    .alterTable('users', table => {
      table.string('lastLoginAt')
    })
}

export const down = knex => { }
