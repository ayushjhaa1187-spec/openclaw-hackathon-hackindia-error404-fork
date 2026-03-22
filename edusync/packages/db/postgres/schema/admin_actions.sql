BEGIN;

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_uid VARCHAR(128) NOT NULL,
  admin_campus VARCHAR(32) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  -- action_type values: 'resource_approved', 'resource_rejected',
  --   'resource_changes_requested', 'student_warned', 'student_suspended',
  --   'student_banned', 'flag_dismissed', 'flag_escalated'
  target_entity_type VARCHAR(30) NOT NULL,
  -- target_entity_type values: 'resource', 'student', 'swap', 'flag'
  target_entity_id VARCHAR(128) NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB,
  -- metadata: flexible storage for action-specific data
  -- For resource_approved: { karmaBonusAwarded: number, resourceTitle: string }
  -- For resource_rejected: { rejectionCategory: string, resourceTitle: string }
  -- For student_warned: { warningNumber: number, relatedContent: string }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_uid);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_entity_id);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_created ON admin_actions(created_at DESC);

COMMIT;
