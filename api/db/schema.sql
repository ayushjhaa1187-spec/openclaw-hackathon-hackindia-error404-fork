-- Karma Transactions (Ledger-style)
CREATE TABLE karma_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    amount INTEGER NOT NULL,  -- positive = earned, negative = spent
    reason VARCHAR(100) NOT NULL,
    reference_type VARCHAR(50),  -- 'swap_completed', 'resource_download', 'review_given'
    reference_id UUID,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nexus Transparency Log (Immutable Audit Trail)
CREATE TABLE nexus_transparency_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swap_id UUID NOT NULL,
    requester_id UUID NOT NULL,
    responder_id UUID NOT NULL,
    requester_campus_id UUID NOT NULL,
    responder_campus_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MOU Agreements
CREATE TABLE mou_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_a_id UUID NOT NULL,
    campus_b_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    signed_date DATE NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
