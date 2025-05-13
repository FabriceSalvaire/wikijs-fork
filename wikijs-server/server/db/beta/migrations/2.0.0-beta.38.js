export const up = knex => {
  return knex.schema
    .table('storage', table => {
      table.string('syncInterval')
      table.json('state')
    })
}

export const down = knex => {
  return knex.schema
    .table('storage', table => {
      table.dropColumn('syncInterval')
      table.dropColumn('state')
    })
}
