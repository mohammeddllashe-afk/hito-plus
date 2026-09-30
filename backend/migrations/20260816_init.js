exports.up = function(knex) {
  return knex.schema
    .createTable('tenants', function(t) {
      t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      t.string('name').notNullable();
      t.string('domain').unique();
      t.jsonb('settings').defaultTo('{}');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('users', function(t) {
      t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      t.uuid('tenant_id').notNullable();
      t.string('employee_no');
      t.string('email').notNullable();
      t.string('phone');
      t.string('name').notNullable();
      t.jsonb('roles').defaultTo('[]');
      t.string('status').defaultTo('active');
      t.jsonb('auth_providers').defaultTo('[]');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
      t.unique(['tenant_id', 'email']);
    })
    .createTable('tasks', function(t) {
      t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      t.uuid('tenant_id').notNullable();
      t.string('task_no').notNullable();
      t.string('title').notNullable();
      t.text('description');
      t.string('status').defaultTo('new');
      t.jsonb('tags').defaultTo('[]');
      t.timestamp('due_date');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('tasks')
    .dropTableIfExists('users')
    .dropTableIfExists('tenants');
};
