export const up = knex => {
  return knex.schema
    .alterTable('pageTree', table => {
      table.json('ancestors')
    })
}

export const down = knex => { }
