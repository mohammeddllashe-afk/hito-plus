const bcrypt = require('bcrypt');

exports.up = async function(knex) {
  const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

  // Insert demo tenant
  const tenantRow = {
    name: 'Demo Tenant',
    domain: 'demo.local',
    settings: JSON.stringify({ demo: true }),
    created_at: new Date()
  };

  const tenantInsert = await knex('tenants').insert(tenantRow).returning('id');
  let tenant_id = tenantInsert;
  if (Array.isArray(tenantInsert)) {
    tenant_id = tenantInsert[0] && tenantInsert[0].id ? tenantInsert[0].id : tenantInsert[0];
  } else if (tenantInsert && tenantInsert.id) {
    tenant_id = tenantInsert.id;
  }

  // Create demo user with hashed password
  const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);
  const userRow = {
    tenant_id,
    employee_no: 'DEM01',
    email: 'demo@demo.local',
    phone: '+000000000',
    name: 'Demo User',
    roles: JSON.stringify(['admin']),
    status: 'active',
    auth_providers: JSON.stringify([]),
    password_hash: passwordHash,
    created_at: new Date(),
    updated_at: new Date()
  };
  const userInsert = await knex('users').insert(userRow).returning('id');
  let user_id = userInsert;
  if (Array.isArray(userInsert)) {
    user_id = userInsert[0] && userInsert[0].id ? userInsert[0].id : userInsert[0];
  } else if (userInsert && userInsert.id) {
    user_id = userInsert.id;
  }

  // Create a sample task assigned to demo user
  const taskRow = {
    tenant_id,
    task_no: 'T-DEMO-1',
    title: 'Demo Task: Inspect Site A',
    description: 'This is a seeded demo task for testing the system.',
    type: 'inspection',
    status: 'new',
    tags: JSON.stringify(['demo','seed']),
    due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // one week from now
    created_at: new Date(),
    updated_at: new Date()
  };
  const taskInsert = await knex('tasks').insert(taskRow).returning('id');
  const task_id = Array.isArray(taskInsert) ? taskInsert[0] : taskInsert;

  // Link created_by and assignee to user
  await knex('tasks').where({ id: task_id }).update({ created_by: user_id, assignee_user_id: user_id });
};

exports.down = async function(knex) {
  // Remove demo task, user and tenant
  await knex('tasks').where({ task_no: 'T-DEMO-1' }).del();
  await knex('users').where({ email: 'demo@demo.local' }).del();
  await knex('tenants').where({ domain: 'demo.local' }).del();
};
