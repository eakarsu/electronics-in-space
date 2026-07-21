CREATE TABLE IF NOT EXISTS tenants (
  id BIGSERIAL PRIMARY KEY, slug VARCHAR(80) UNIQUE NOT NULL, name VARCHAR(160) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO tenants(slug,name) VALUES ('default','Default Space Electronics Tenant') ON CONFLICT DO NOTHING;

ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id BIGINT REFERENCES tenants(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1;
UPDATE users SET tenant_id=(SELECT id FROM tenants WHERE slug='default') WHERE tenant_id IS NULL;
ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL;

CREATE TABLE IF NOT EXISTS qualified_suppliers (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), supplier_uid VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL, quality_status VARCHAR(24) NOT NULL CHECK (quality_status IN ('approved','conditional','suspended')),
  source_system VARCHAR(80) NOT NULL, source_revision VARCHAR(80) NOT NULL, created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(tenant_id,supplier_uid)
);

CREATE TABLE IF NOT EXISTS qualified_parts (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), part_number VARCHAR(120) NOT NULL,
  description TEXT NOT NULL, inventory_unit VARCHAR(20) NOT NULL DEFAULT 'each' CHECK (inventory_unit IN ('each')),
  required_rad_krad NUMERIC NOT NULL CHECK (required_rad_krad>=0), temp_min_c NUMERIC NOT NULL,
  temp_max_c NUMERIC NOT NULL, source_system VARCHAR(80) NOT NULL, source_revision VARCHAR(80) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE, created_by BIGINT NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (temp_min_c<temp_max_c), UNIQUE(tenant_id,part_number)
);

CREATE TABLE IF NOT EXISTS bom_requirements (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), mission_id INTEGER NOT NULL REFERENCES missions(id),
  part_id BIGINT NOT NULL REFERENCES qualified_parts(id), quantity_required INTEGER NOT NULL CHECK (quantity_required>0),
  contingency_pct NUMERIC NOT NULL DEFAULT 10 CHECK (contingency_pct BETWEEN 0 AND 200), source_revision VARCHAR(80) NOT NULL,
  created_by BIGINT NOT NULL REFERENCES users(id), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(tenant_id,mission_id,part_id)
);

CREATE TABLE IF NOT EXISTS quality_lots (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), part_id BIGINT NOT NULL REFERENCES qualified_parts(id),
  supplier_id BIGINT NOT NULL REFERENCES qualified_suppliers(id), lot_code VARCHAR(100) NOT NULL, quantity_received INTEGER NOT NULL CHECK (quantity_received>0),
  quantity_accepted INTEGER NOT NULL DEFAULT 0 CHECK (quantity_accepted>=0), quantity_rejected INTEGER NOT NULL DEFAULT 0 CHECK (quantity_rejected>=0),
  status VARCHAR(24) NOT NULL DEFAULT 'received' CHECK (status IN ('received','inspecting','hold','pending_approval','accepted','rejected')),
  source_system VARCHAR(80) NOT NULL, source_event_id VARCHAR(128) NOT NULL, observed_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), version INTEGER NOT NULL DEFAULT 1, created_by BIGINT NOT NULL REFERENCES users(id),
  UNIQUE(tenant_id,source_system,source_event_id), UNIQUE(tenant_id,supplier_id,lot_code),
  CHECK (quantity_accepted+quantity_rejected<=quantity_received)
);
CREATE INDEX IF NOT EXISTS quality_lots_tenant_status_idx ON quality_lots(tenant_id,status);

CREATE TABLE IF NOT EXISTS lot_inspections (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), lot_id BIGINT NOT NULL REFERENCES quality_lots(id),
  inspection_type VARCHAR(30) NOT NULL CHECK (inspection_type IN ('incoming_count','visual_defects','radiation_screen','thermal_low','thermal_high')),
  measured_value NUMERIC NOT NULL, measured_unit VARCHAR(20) NOT NULL, rule_snapshot JSONB NOT NULL,
  result VARCHAR(16) NOT NULL CHECK (result IN ('pass','fail')), source_system VARCHAR(80) NOT NULL,
  source_event_id VARCHAR(128) NOT NULL, observed_at TIMESTAMPTZ NOT NULL, received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  inspector_user_id BIGINT NOT NULL REFERENCES users(id), UNIQUE(tenant_id,source_system,source_event_id)
);

CREATE TABLE IF NOT EXISTS lot_exceptions (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), lot_id BIGINT NOT NULL REFERENCES quality_lots(id),
  inspection_id BIGINT NOT NULL UNIQUE REFERENCES lot_inspections(id), reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','rework','scrap','closed')),
  resolution_notes TEXT, resolved_by BIGINT REFERENCES users(id), resolved_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lot_approvals (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), lot_id BIGINT NOT NULL REFERENCES quality_lots(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_by BIGINT NOT NULL REFERENCES users(id), decided_by BIGINT REFERENCES users(id), decision_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), decided_at TIMESTAMPTZ,
  CHECK (decided_by IS NULL OR decided_by<>requested_by)
);
CREATE UNIQUE INDEX IF NOT EXISTS lot_pending_approval_idx ON lot_approvals(lot_id) WHERE status='pending';

CREATE TABLE IF NOT EXISTS plan_overrides (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), mission_id INTEGER NOT NULL REFERENCES missions(id),
  part_id BIGINT NOT NULL REFERENCES qualified_parts(id), quantity_override INTEGER NOT NULL CHECK (quantity_override>=0),
  justification TEXT NOT NULL, requested_by BIGINT NOT NULL REFERENCES users(id), approved_by BIGINT REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), decided_at TIMESTAMPTZ,
  CHECK (approved_by IS NULL OR approved_by<>requested_by)
);

CREATE TABLE IF NOT EXISTS part_change_orders (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), part_id BIGINT NOT NULL REFERENCES qualified_parts(id),
  proposed_rules JSONB NOT NULL, reason TEXT NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  requested_by BIGINT NOT NULL REFERENCES users(id), decided_by BIGINT REFERENCES users(id), decision_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), decided_at TIMESTAMPTZ,
  CHECK (decided_by IS NULL OR decided_by<>requested_by)
);

CREATE TABLE IF NOT EXISTS quality_events (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), lot_id BIGINT REFERENCES quality_lots(id),
  actor_user_id BIGINT REFERENCES users(id), event_type VARCHAR(80) NOT NULL, detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_history (
  id BIGSERIAL PRIMARY KEY, tenant_id BIGINT NOT NULL REFERENCES tenants(id), actor_user_id BIGINT REFERENCES users(id),
  actor_label VARCHAR(255) NOT NULL, action VARCHAR(100) NOT NULL, entity_type VARCHAR(60) NOT NULL,
  entity_id VARCHAR(100), details JSONB NOT NULL DEFAULT '{}'::jsonb, previous_hash CHAR(64) NOT NULL,
  event_hash CHAR(64) UNIQUE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION deny_quality_history_mutation() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'quality history is append-only'; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS quality_events_no_mutation ON quality_events;
CREATE TRIGGER quality_events_no_mutation BEFORE UPDATE OR DELETE ON quality_events FOR EACH ROW EXECUTE FUNCTION deny_quality_history_mutation();
DROP TRIGGER IF EXISTS audit_history_no_mutation ON audit_history;
CREATE TRIGGER audit_history_no_mutation BEFORE UPDATE OR DELETE ON audit_history FOR EACH ROW EXECUTE FUNCTION deny_quality_history_mutation();
