-- Initial DB DDL for HITO‑Plus (Postgres)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- organization units
CREATE TABLE IF NOT EXISTS organization_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES organization_units(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- sites / locations
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES sites(id),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_no VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  org_unit_id UUID REFERENCES organization_units(id),
  manager_id UUID REFERENCES users(id),
  roles JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'active',
  auth_providers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (tenant_id, email)
);

-- roles (optional normalized)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- assets
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  qr_code VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  serial_no VARCHAR(255),
  location_id UUID REFERENCES sites(id),
  gps JSONB,
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_no VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  type VARCHAR(100),
  category VARCHAR(100),
  subcategory VARCHAR(100),
  created_by UUID REFERENCES users(id),
  assignee_user_id UUID REFERENCES users(id),
  assignee_team_id UUID,
  site_id UUID REFERENCES sites(id),
  asset_id UUID REFERENCES assets(id),
  gps JSONB,
  status VARCHAR(50) DEFAULT 'new',
  priority VARCHAR(50),
  sla JSONB,
  tags JSONB DEFAULT '[]'::jsonb,
  due_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  recurrence_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- task history
CREATE TABLE IF NOT EXISTS task_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id),
  field_name VARCHAR(255),
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- task attachments
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  storage_url TEXT,
  type VARCHAR(50),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- forms (templates)
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- form submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  form_version INTEGER,
  submitted_by UUID REFERENCES users(id),
  answers JSONB NOT NULL,
  score NUMERIC,
  linked_task_id UUID REFERENCES tasks(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- automations
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255),
  trigger JSONB,
  conditions JSONB,
  actions JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  actor_id UUID,
  entity_type VARCHAR(100),
  entity_id UUID,
  action VARCHAR(100),
  old JSONB,
  new JSONB,
  ip VARCHAR(100),
  device_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- schedules / recurrence rules
CREATE TABLE IF NOT EXISTS recurrence_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  pattern JSONB,
  next_run TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  channel VARCHAR(50),
  payload JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- indexes for jsonb search
CREATE INDEX IF NOT EXISTS idx_forms_schema_gin ON forms USING GIN (schema);
CREATE INDEX IF NOT EXISTS idx_submissions_answers_gin ON form_submissions USING GIN (answers);
CREATE INDEX IF NOT EXISTS idx_users_roles_gin ON users USING GIN (roles);

