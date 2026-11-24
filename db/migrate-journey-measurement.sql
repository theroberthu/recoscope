-- Additive only. Existing requests remain unreviewed; no past lead is qualified.
BEGIN;
ALTER TABLE audit_leads ADD COLUMN IF NOT EXISTS measurement_context JSONB;
ALTER TABLE audit_leads ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'unreviewed';
ALTER TABLE audit_leads ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='audit_leads_review_status_check' AND conrelid='audit_leads'::regclass) THEN
    ALTER TABLE audit_leads ADD CONSTRAINT audit_leads_review_status_check
      CHECK (review_status IN ('unreviewed','verified_non_test','test','spam'));
  END IF;
END $$;
COMMIT;
