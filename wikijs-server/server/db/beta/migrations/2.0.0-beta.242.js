export const up = knex => {
  return knex.schema
    .table('users', table => {
      table.boolean('mustChangePwd').notNullable().defaultTo(false)
    })
}

export const down = knex => {
  return knex.schema
    .table('users', table => {
      table.dropColumn('mustChangePwd')
    })
}
