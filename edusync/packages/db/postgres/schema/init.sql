/*
  EduSync Nexus Karma Ledger
  Designed for financial integrity and immutable audit logs across MOU nodes.
*/

CREATE TABLE IF NOT EXISTS karma_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_uid VARCHAR(128) NOT NULL,
  receiver_uid VARCHAR(128) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  transaction_reason VARCHAR(256) NOT NULL,
  mou_agreement_id UUID,
   institutional_node VARCHAR(32) NOT NULL,
  transaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  block_sequence_id SERIAL, -- Sequence for ordering across distributed nodes
  digest_hash CHAR(64) -- Hash of (previous_hash, sender, receiver, amount) for manual anchoring
);

CREATE INDEX idx_sender ON karma_ledger (sender_uid);
CREATE INDEX idx_receiver ON karma_ledger (receiver_uid);
CREATE INDEX idx_timestamp ON karma_ledger (transaction_timestamp);

CREATE TABLE IF NOT EXISTS mou_handshake_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiating_campus VARCHAR(32) NOT NULL,
  accepting_campus VARCHAR(32) NOT NULL,
  agreement_terms TEXT,
  signature_hash TEXT,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  "isActive" BOOLEAN DEFAULT TRUE
);
