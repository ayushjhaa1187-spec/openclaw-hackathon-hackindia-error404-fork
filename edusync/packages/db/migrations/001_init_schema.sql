-- ============================================================================
-- EDUSYNC POSTGRESQL SCHEMA
-- Initializes all tables required for production
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- KARMA LEDGER TABLE
-- Immutable record of all karma transactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS karma_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_uid VARCHAR(255) NOT NULL,
  receiver_uid VARCHAR(255) NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  transaction_reason VARCHAR(255) NOT NULL,
  institutional_node VARCHAR(255) NOT NULL,
  transaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  block_sequence_id BIGSERIAL UNIQUE,
  digest_hash CHAR(64) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_karma_sender ON karma_ledger(sender_uid);
CREATE INDEX IF NOT EXISTS idx_karma_receiver ON karma_ledger(receiver_uid);
CREATE INDEX IF NOT EXISTS idx_karma_timestamp ON karma_ledger(transaction_timestamp);
CREATE INDEX IF NOT EXISTS idx_karma_node ON karma_ledger(institutional_node);
CREATE INDEX IF NOT EXISTS idx_karma_digest ON karma_ledger(digest_hash);
CREATE INDEX IF NOT EXISTS idx_karma_block_seq ON karma_ledger(block_sequence_id);

-- Constraints
ALTER TABLE karma_ledger ADD CONSTRAINT chk_different_users 
  CHECK (sender_uid != receiver_uid);

-- Comments
COMMENT ON TABLE karma_ledger IS 'Immutable ledger of all karma transactions across the platform';
COMMENT ON COLUMN karma_ledger.digest_hash IS 'SHA-256 hash for blockchain-style verification';

-- ============================================================================
-- MOU HANDSHAKE LOG TABLE
-- Records all Memoranda of Understanding between campuses
-- ============================================================================

CREATE TABLE IF NOT EXISTS mou_handshake_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiating_campus VARCHAR(255) NOT NULL,
  receiving_campus VARCHAR(255) NOT NULL,
  mou_id UUID NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'proposed',
  terms JSONB NOT NULL,
  signature_timestamp TIMESTAMP,
  initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mou_initiator ON mou_handshake_log(initiating_campus);
CREATE INDEX IF NOT EXISTS idx_mou_receiver ON mou_handshake_log(receiving_campus);
CREATE INDEX IF NOT EXISTS idx_mou_status ON mou_handshake_log(status);
CREATE INDEX IF NOT EXISTS idx_mou_timestamp ON mou_handshake_log(initiated_at);
CREATE INDEX IF NOT EXISTS idx_mou_expires ON mou_handshake_log(expires_at);

COMMENT ON TABLE mou_handshake_log IS 'Log of all inter-campus MOUs and their lifecycle';

-- ============================================================================
-- NEXUS TRANSPARENCY LOG TABLE
-- Tracks cross-campus visibility and access grants
-- ============================================================================

CREATE TABLE IF NOT EXISTS nexus_transparency_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  initiating_campus VARCHAR(255) NOT NULL,
  target_campus VARCHAR(255) NOT NULL,
  visibility_level VARCHAR(50) NOT NULL,
  reason VARCHAR(255),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nexus_resource ON nexus_transparency_log(resource_id);
CREATE INDEX IF NOT EXISTS idx_nexus_initiator ON nexus_transparency_log(initiating_campus);
CREATE INDEX IF NOT EXISTS idx_nexus_target ON nexus_transparency_log(target_campus);
CREATE INDEX IF NOT EXISTS idx_nexus_timestamp ON nexus_transparency_log(granted_at);

COMMENT ON TABLE nexus_transparency_log IS 'Audit trail for cross-campus resource visibility';

-- ============================================================================
-- ADMIN ACTIONS LOG TABLE
-- Tracks all administrative actions for compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_uid VARCHAR(255) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB NOT NULL,
  reason VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_uid ON admin_actions(admin_uid);
CREATE INDEX IF NOT EXISTS idx_admin_action_type ON admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_timestamp ON admin_actions(performed_at);
CREATE INDEX IF NOT EXISTS idx_admin_resource ON admin_actions(resource_type, resource_id);

-- Constraints
ALTER TABLE admin_actions ADD CONSTRAINT chk_valid_action_type
  CHECK (action_type IN (
    'user_suspend', 'user_unsuspend', 'user_ban', 'user_unban',
    'resource_flag', 'resource_approve', 'resource_reject',
    'swap_cancel', 'swap_force_complete',
    'mou_approve', 'mou_reject', 'mou_terminate',
    'settings_update', 'bulk_operation', 'data_export', 'other'
  ));

COMMENT ON TABLE admin_actions IS 'Compliance log for all administrative actions';

-- ============================================================================
-- SESSIONS TABLE (Optional, for server-side sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_session_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_session_active ON sessions(is_active);

-- Auto-cleanup trigger for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUDIT TRIGGERS
-- Automatically log table changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(255) NOT NULL,
  operation VARCHAR(10) NOT NULL,
  record_id UUID,
  changes JSONB,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(changed_at);

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

CREATE OR REPLACE VIEW karma_summary AS
SELECT
  sender_uid,
  receiver_uid,
  COUNT(*) as transaction_count,
  SUM(amount) as total_karma,
  AVG(amount) as avg_karma,
  MAX(transaction_timestamp) as last_transaction
FROM karma_ledger
GROUP BY sender_uid, receiver_uid;

CREATE OR REPLACE VIEW active_mous AS
SELECT *
FROM mou_handshake_log
WHERE status IN ('active', 'proposed')
  AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);

CREATE OR REPLACE VIEW recent_admin_actions AS
SELECT *
FROM admin_actions
WHERE performed_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY performed_at DESC;

-- ============================================================================
-- GRANTS & PERMISSIONS
-- ============================================================================

-- Grant read access to application user
GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Grant write access where needed
GRANT INSERT, UPDATE, DELETE ON karma_ledger TO postgres;
GRANT INSERT, UPDATE, DELETE ON mou_handshake_log TO postgres;
GRANT INSERT, UPDATE, DELETE ON nexus_transparency_log TO postgres;
GRANT INSERT ON admin_actions TO postgres;

-- ============================================================================
-- SCHEMA VERSION (for migrations tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_version (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version, description) VALUES 
  ('001', 'Initial schema with karma, MOU, nexus, and admin tables')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

SELECT '✅ Schema initialization complete' as status;
