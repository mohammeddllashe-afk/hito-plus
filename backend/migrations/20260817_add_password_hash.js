exports.up = function(knex) {
  return knex.schema.hasTable('users').then(function(exists) {
    if (exists) {
      return knex.schema.hasColumn('users', 'password_hash').then(function(has) {
        if (!has) {
          return knex.schema.table('users', function(t) {
            t.text('password_hash');
          });
        }
      });
    }
  });
};

exports.down = function(knex) {
  return knex.schema.hasTable('users').then(function(exists) {
    if (exists) {
      return knex.schema.hasColumn('users', 'password_hash').then(function(has) {
        if (has) {
          return knex.schema.table('users', function(t) {
            t.dropColumn('password_hash');
          });
        }
      });
    }
  });
};
