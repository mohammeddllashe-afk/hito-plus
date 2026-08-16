exports.up = function(knex) {
  return knex.schema.hasTable('tasks').then(function(exists) {
    if (exists) {
      return Promise.all([
        knex.schema.hasColumn('tasks', 'created_by').then(function(has) {
          if (!has) return knex.schema.table('tasks', function(t) { t.uuid('created_by'); });
        }),
        knex.schema.hasColumn('tasks', 'assignee_user_id').then(function(has) {
          if (!has) return knex.schema.table('tasks', function(t) { t.uuid('assignee_user_id'); });
        })
      ]);
    }
  });
};

exports.down = function(knex) {
  return knex.schema.hasTable('tasks').then(function(exists) {
    if (exists) {
      return Promise.all([
        knex.schema.hasColumn('tasks', 'created_by').then(function(has) {
          if (has) return knex.schema.table('tasks', function(t) { t.dropColumn('created_by'); });
        }),
        knex.schema.hasColumn('tasks', 'assignee_user_id').then(function(has) {
          if (has) return knex.schema.table('tasks', function(t) { t.dropColumn('assignee_user_id'); });
        })
      ]);
    }
  });
};
