export const up = async knex => {
  await knex('users').update({
    email: knex.raw('LOWER(??)', ['email'])
  })
}

export const down = knex => { }
