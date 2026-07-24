CREATE TABLE IF NOT EXISTS runtime_ai_results (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  tenant_id BIGINT NOT NULL REFERENCES tenants(id),
  action VARCHAR(100) NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL CHECK (length(content) > 0),
  provider VARCHAR(32) NOT NULL CHECK (provider = 'openrouter'),
  model VARCHAR(160) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS runtime_ai_results_tenant_created_idx
  ON runtime_ai_results(tenant_id, created_at DESC);
