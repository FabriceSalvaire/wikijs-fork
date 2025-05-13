export const up = knex => {
  return knex.schema
    .createTable('userAvatars', table => {
      table.integer('id').primary()
      table.binary('data').notNullable()
    })
}

export const down = knex => { }
