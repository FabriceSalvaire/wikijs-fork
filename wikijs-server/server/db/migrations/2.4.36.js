export const up = (knex) => {
    return knex.schema
        .alterTable('comments', (table) => {
            table.text('render').notNullable().defaultTo('')
            table.string('name').notNullable().defaultTo('')
            table.string('email').notNullable().defaultTo('')
            table.string('ip').notNullable().defaultTo('')
        })
}

export const down = (knex) => {}
