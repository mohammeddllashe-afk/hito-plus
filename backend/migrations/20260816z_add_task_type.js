exports.up = function(knex) {
  return knex.schema.hasTable('tasks').then(function(exists) {
    if (exists) {
      return knex.schema.hasColumn('tasks', 'type').then(function(has) {
        if (!has) {
          return knex.schema.table('tasks', function(t) {
            t.string('type');
          });
        }
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.hasTable('tasks').then(function(exists) {
    if (exists) {
      return knex.schema.hasColumn('tasks', 'type').then(function(has) {
        if (has) {
          return knex.schema.table('tasks', function(t) {
            t.dropColumn('type');
          });
        }
      });
    }
  });
};
